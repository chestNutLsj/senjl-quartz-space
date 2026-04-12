---
tags:
  - Inference
  - vLLM
  - ContinuousBatching
date: 2026-03-01
---

> [!NOTE] TL;DR
> LLM 生成是 **iterative decode**，请求长度高度不均匀；static batching 把“请求”绑死在一个 batch 里，导致**木桶效应 + 资源气泡**。continuous batching 把调度粒度降到“每一步迭代”，让 batch 成员在每个 decode step 都能动态更新，从而把 GPU 利用率拉满。

## 0. 预备知识：为什么“能塞多大 batch”决定吞吐？

这一点在 [[All About LLM Inference#1. The Basics of Transformer Inference|Prefill vs Decode]] 和 [[All About LLM Inference#2. Tricks for Improving Generation Throughput and Latency|Generation 的瓶颈]] 里已经反复强调过：

- **LLM 推理是两阶段**：prefill（一次性吃完 prompt，偏 compute-bound）与 decode（逐 token 生成，偏 memory-IO bound）。
- **decode 的关键矛盾**：每一步只生成 1 个 token，计算量极小，但要读取越来越大的 KV Cache（在不考虑 prefix caching 的情况下，每条序列私有、无法像权重那样复用）。

因此吞吐的大头往往取决于：你能否在显存里**同时容纳足够多的并发序列**，把每一步 decode 的参数加载/访存开销摊薄。

连续批处理（continuous batching）就是瞄准这个矛盾：**同样的显存与带宽，尽量少浪费在“空等/空占/空读”上。**

## 1. 传统 static batching 的缺陷

这里的 static batching 指“**一个 batch 开始后，直到这个 batch 里所有请求都结束，batch 组成不变**”。它在 CV/训练里很好用，但在 LLM serving 上会被生成的“长短不一”狠狠惩罚。

### 1) 木桶效应（Head-of-line blocking）→ 吞吐雪崩

LLM 生成长度的方差极大（聊天机器人最典型）。static batching 的规则是“同步开始、同步结束”，于是：

- 短请求提前结束，但它占用的 **KV Cache 槽位**无法及时释放；
- GPU 在后续迭代里被迫带着这些“已结束的空位”继续跑，形成**资源气泡（bubble）**；
- 整个 batch 的完成时间由最慢的长请求决定，吞吐随长度方差上升而急剧恶化。

这就是为什么在真实负载里，你会看到 batch size 明明不小，但 GPU utilization 仍然很难上去：很多“并发”其实是**在显存里占着坑不干活**。

### 2) 长尾延迟（P99 / P999）→ 被最慢请求拖死

static batching 让“批内最慢请求”成为所有请求的隐形上限：

- 同一批里，短请求的 decode 本来应该早结束、早返回，但它被迫跟着长请求一起“陪跑”；
- 这会放大 tail latency（尤其是当你为了吞吐把 batch 拉大时）。

换句话说，static batching 把你逼到一个痛苦的二选一：**吞吐（大 batch） vs 延迟（小 batch）**。

### 3) 资源浪费：Padding / 形状对齐 / 预分配

static batching 往往依赖“把张量拼成规则形状”：

- **prefill padding**：prompt 长度不齐时，通常需要 pad 到批内最大长度（否则就得用 ragged kernel / 更复杂的 packing）。pad 的 token 既浪费算力，也浪费显存带宽。
- **KV Cache 预分配**：很多实现会按最大 context length 给每个请求预留一段连续 KV 空间，短序列会造成大量内部碎片（这点在 [[All About LLM Inference#2. Tricks for Improving Generation Throughput and Latency|PagedAttention 的动机]] 里有更细的解释）。

这类浪费的共同点：**你为“最坏情况”付费，但线上大多数请求远达不到最坏情况。**

### 4) 灵活性差：新请求只能“等整批结束”

即使你引入 request-level dynamic batching（当上一批结束后，立刻组下一批），调度粒度仍然是“请求级”：

- 新请求到达时，如果 GPU 正在 decode 一个 batch，它通常只能排队；
- 等当前 batch 全部完成，才能被加入下一批。

因此，排队延迟会随着负载上升而迅速变坏；而且你越想靠大 batch 提吞吐，越容易把 TTFT（首 token 延迟）顶上去。

### 5) 不利于复杂 serving 形态：prefill/decode 混跑、sharding、抢占

LLM serving 的现实通常是：prefill 与 decode 同时存在、请求长短差异大、显存经常是第一瓶颈。static batching 的“批内绑定”会让下面这些事情变得更难做或更难做得好：

- **prefill 与 decode 混跑**：prefill 计算密集、decode 访存密集，两者节拍不同；static batching 很难在不抖动延迟的情况下混合调度。
- **抢占/回收**：想在显存紧张时把某些请求踢出 running（preempt）并回收它的 KV Cache，在“批内绑定”模型下会引入大量工程与一致性复杂度。
- **并行/分片**：无论是张量并行还是流水线并行，迭代式 decode 本来就需要严格同步；若批次成员固定且长度差异大，更容易出现不可避免的同步空转与资源碎片（宏观上就是“更难把每张卡都喂饱”）。

## 从缺陷反推：我们需要什么样的调度？

把上面的痛点压缩成一个目标函数，你会发现我们真正想要的是：

1. **让 GPU 每一步 decode 都尽量满载**（减少 bubble）；
2. **短请求尽快结束就尽快释放资源**（减少尾部拖累）；
3. **新请求尽可能快地开始 prefill / 尽快进入 decode**（降低排队）；
4. **KV Cache 必须支持按需分配与回收**（否则“动态插队”只是空话）。

这四点，直接把我们推向同一个答案：把调度粒度从“请求级”降到“迭代级”。

## Continuous Batching：迭代级调度（Iteration-level Scheduling）

continuous batching（也常被称为 dynamic batching / iteration-level scheduling）最核心的变化只有一句话：

> **每个 decode step 都重新决定“这一轮 batch 由哪些序列组成”。**

一个足够抽象、但抓住本质的运行方式是：

1. 系统维护两类队列：`waiting`（尚未 prefill 或尚未进入稳定 decode）与 `running`（正在 decode 的序列集合）。
2. 每一轮迭代（step）：
   - 从 `running` 里挑出本轮要 decode 的序列（通常每序列生成 1 token）；
   - 如果显存/slot/token budget 允许，把一部分 `waiting` 的请求插入：先做它们的 prefill（或 chunked prefill），让它们尽快进入 running；
   - 本轮结束后，立刻把 finished 的序列移出 running，**释放 KV Cache**，并用新请求“补位”。

你会发现它在语义上很像操作系统的 time-slicing：CPU 每个 time slice 都会换一批 runnable 进程；这里 GPU 每个 iteration 都会换一批 runnable 序列。

> [!TIP] 与 nano-vLLM 的直觉对齐
> 你可以把 continuous batching 理解为 [[nano-vLLM-1#Scheduler 需要解决的核心问题|Scheduler 矛盾]] 的“工业级解法”：不再让 prefill 与 decode 二选一地抢 GPU，而是在每个 step 里**同时服务两种阶段**，并用更强的 KV 管理能力支撑这种混跑。

## 它到底解决了什么？（以及收益有多大）

来自 Anyscale 的基准结论可以作为一个很好的数量级参考（OPT-13B，单卡 A100 40GB，模拟真实到达的在线负载）：

- **continuous batching 本身**（只改调度、不改模型）就能带来 **~8x** 的吞吐提升（相对 naive static batching）。
- **vLLM** 把 continuous batching 与更激进的显存管理（PagedAttention）结合后，在相同负载下能达到 **最高 ~23x** 的吞吐提升，并且 **p50 latency 下降**。
- 一个直观的现象是：当生成长度方差变大时，static batching 的吞吐会“断崖式下跌”（文中给的极端例子会跌到 **81 token/s**），而 continuous batching 仍能保持高吞吐；vLLM 甚至在更高 QPS 下仍不容易饱和（文中观察到它在 **QPS≈8** 左右才接近饱和，吞吐接近 **1900 token/s**）。

> [!NOTE] continuous batching 不是“魔法”：它依然受限于显存
> 迭代级调度能消除木桶效应，但如果 GPU 显存已经被 KV Cache 填满，新请求依然只能等待“有坑位被释放”。这也是为什么 vLLM 要把 PagedAttention（块化 KV、低碎片、快回收）与 continuous batching 绑定在一起：它本质上是在扩大“可用坑位”的有效上限。

## 🔗 与我的知识库构建深度链接（反向索引）

| 关键概念 | 在我的笔记里对应哪里？ |
| --- | --- |
| Prefill vs Decode 的两阶段差异 | [[All About LLM Inference#1. The Basics of Transformer Inference]] |
| decode 为何 memory-IO bound、为何 batch size 决定吞吐 | [[All About LLM Inference#1. The Basics of Transformer Inference]] / [[All About LLM Inference#2. Tricks for Improving Generation Throughput and Latency]] |
| static batching 的木桶效应与“气泡”浪费 | [[nano-vLLM-1#Scheduler 需要解决的核心问题]] |
| 迭代级调度的直觉（waiting/running、补位、释放） | [[nano-vLLM-1#Scheduler 需要解决的核心问题]]（后续会在这里对齐到 vLLM 的实现细节） |
| PagedAttention 为什么是 continuous batching 的关键搭子 | [[All About LLM Inference#2. Tricks for Improving Generation Throughput and Latency]] / [[nano-vLLM-1#深入底层：KV Cache Block Manager 需要提供哪些服务？]] |



## References

- Anyscale Blog: Continuous Batching for LLM Inference — https://www.anyscale.com/blog/continuous-batching-llm-inference
- Orca (OSDI '22): A Distributed Serving System for Transformer-Based Generative Models — https://www.usenix.org/conference/osdi22/presentation/yu
