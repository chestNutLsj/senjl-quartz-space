---
tags:
  - LLM
  - Inference
  - Serving
  - ContinuousBatching
  - vLLM
date: 2026-04-01
---
> 本文是对 [[Achieve 23x LLM Inference Throughput & Reduce p50 Latency]] 的整理与再表述。

# Thesis

这篇博客最值得记住的，不是“vLLM 跑得更快”这个结论本身，而是它把一个经常被说得过于口号化的问题讲清楚了：

> **LLM serving 的核心瓶颈不仅是 kernel 是否够快，更是调度粒度和 KV cache 内存管理是否足够合理。**

换句话说，**continuous batching** 解决的是“请求长度异构时 GPU 时间片被浪费”的问题；而 **PagedAttention + vLLM** 进一步解决的是“即使 scheduler 想把更多请求塞进 batch，显存分配方式也会先把空间浪费掉”的问题。

因此，这篇文章真正成立的链条是：

**iteration-level scheduling -> 更少的 batch 空洞 -> 更高的有效利用率 -> 更大的实际 batch size -> 更高吞吐与更低中位数时延。**

# Background

传统 static batching 对 CNN、普通 encoder 模型往往足够自然，因为一次前向就能处理完整输入；但 LLM inference 不是这样。

LLM 的生成过程是 token-by-token 的迭代过程。请求进入系统后，通常先经历一次 **prefill**，把 prompt 对应的注意力状态算出来；随后进入 **decode**，每轮只生成一个新 token。也正因为 decode 是一个长时间存在的迭代过程，batch 里的不同请求会在不同时间结束。

问题就在这里：如果 batch 是静态固定的，那么较短请求提前结束后，它留下的“坑位”并不会立刻被新的请求填上。GPU 仍然要跟着 batch 里最慢的那条请求走完。这种空洞在真实 workload 下很常见，因为：

- prompt length 本来就不固定
- output length 方差通常更大
- 聊天、代码补全、总结等任务对长度分布的影响完全不同

所以，这不是一个少数 case 才出现的问题，而是生产环境中的常态。

# Continuous Batching 到底解决了什么

continuous batching，也就是很多系统里说的 **dynamic batching / iteration-level scheduling**，本质上就是把调度决策粒度从“整批请求结束后再决定下一批”改成“每个 decode iteration 都可以决定谁进谁出”。

这件事的意义很直接：

1. 某个 sequence 一旦结束，它占据的 slot 可以立刻释放。
2. 新请求不需要等整批 drain 完再进入。
3. 系统因此能维持更高的 steady-state batch occupancy。

从系统角度看，它不是改变了单次 forward pass 的算法复杂度，而是减少了**因为 workload 异构而产生的调度性浪费**。

这也是为什么这篇文章里，Ray Serve 自己复现的 continuous batching 和 Hugging Face TGI 表现接近。因为两者差异没有大到推翻一个基本事实：**只要 iteration-level scheduling 做对了，静态 batching 的很多空耗就已经被拿回来了。**

# 但为什么 vLLM 又能再快一截

如果文章只讲到这里，其实只能得出“continuous batching 明显优于 static batching”。但它更有价值的地方在于继续问了一步：

> 如果 scheduling 已经足够细粒度了，为什么不同 continuous batching 系统之间还会有明显差距？

答案是 **memory management**。

传统 serving runtime 往往倾向于为请求提前预留较大的连续 KV cache 空间，这种做法实现简单，但在长上下文上限很大、而实际请求大多达不到上限时，会产生明显浪费。scheduler 即使想把新请求塞进来，也可能先被显存碎片和保守预分配卡住。

vLLM 的 **PagedAttention** 把这件事改成了“按 block 动态分配”。它借用了操作系统里 paging 的思路，让 KV cache 不再要求一整块连续空间，而是允许非连续 block 拼接。这样做的直接收益是：

- 请求开始时不必一次性预留最大长度
- 序列变长时再按需扩张
- 最后一块之外的浪费被显著限制
- 在同样显存下，可以维持更大的有效 batch

所以 vLLM 的优势并不只是“有个更好的 attention kernel”，而是：**continuous batching 把调度空间打开了，PagedAttention 把显存空间也打开了。** 这两件事叠加，才形成博客里 23x throughput 这种 headline 级结果。

# 怎么理解文中的 benchmark

我觉得这篇文章的 benchmark 设计并不复杂，但问题抓得比较准。

它没有只给一个固定长度 workload 跑一次 TPS，而是刻意放大了**输出长度方差**。这是合理的，因为 static batching 最怕的恰恰就是 batch 内请求 completion time 差异大。

因此，吞吐实验读出来的关键信号不是某个绝对数字，而是：

- 当 sequence length variance 低时，static batching 还没有特别难看
- 当 variance 拉高后，static batching 吞吐会快速塌陷
- continuous batching 对 variance 更鲁棒
- vLLM 在 continuous batching 之上进一步吃到了内存管理收益

时延实验也同样有启发。很多人会先入为主地认为“batch 更大一定伤害 latency”，但这里给出的结果恰好说明，**更合理的调度有时能同时改善 throughput 和 p50 latency**。原因不是单请求变短了，而是新请求被插入执行流的等待时间变短了。

当然，这个结论有边界：当系统接近饱和时，可插入的新 slot 变少，continuous batching 的 latency 优势会开始收敛。文中 QPS=4 时 TGI 和 Ray Serve 曲线往 FasterTransformer 靠近，正是在说明这个问题。vLLM 之所以更稳，是因为它用更高的有效 batch capacity 把 saturation 点往后推了。

# 我对这篇文章的判断

我会把它看成一篇很好的 **serving systems 入门解释文**，而不是严格意义上的学术结论文。

它的强项有三点：

1. 把 static batching 的浪费来源讲得非常直观。
2. 把 continuous batching 和 PagedAttention 之间的关系讲清楚了，没有把所有收益都混成一句“vLLM 更快”。
3. benchmark 虽然简单，但确实对准了线上 serving workload 的关键变量：长度分布、到达过程、系统饱和点。

它的局限也很明显：

- 基于单卡 A100 + OPT-13B，外推到多卡、多机、长上下文和 MoE 场景时要谨慎。
- latency 指标仍然比较粗，更多是 generation request latency，而不是更细粒度的 TTFT / TPOT / ITL 拆分。
- 文中没有深入讨论 prefill 和 decode 之间的资源冲突，这正是后续 [[Throughput is Not All You Need Maximizing Goodput in LLM Serving using Prefill-Decode Disaggregation]] 进一步推进的地方。

所以如果把它放到更长的技术演进链条里，我会这样看：

- 这篇文章回答的是：**为什么 continuous batching 比 static batching 更合理。**
- vLLM 回答的是：**为什么把 scheduler 做对以后，还要继续把 KV cache 管理方式做对。**
- DistServe/PD disaggregation 那类工作回答的是：**即使 continuous batching 已经成立，prefill 和 decode 的资源耦合仍然会制造新的尾部问题。**

# 与现有笔记的关系

1. [[真实集群上调优SGLang过程记录]]

这篇文章可以作为我后续做 serving 调优时的一个理论底板。尤其在排查吞吐上不去时，至少要先分清楚：到底是 kernel 问题、KV cache / page 配置问题，还是 continuous batching 根本没有吃满。

2. [[Throughput is Not All You Need Maximizing Goodput in LLM Serving using Prefill-Decode Disaggregation]]

这两篇最好连起来看。Anyscale 这篇更像第一阶段认知：先把 static batching 的低效修掉；DistServe 那篇则是在这个基础上继续指出，**throughput 提升并不自动等于 latency / SLO 最优**，尤其是 prefill 与 decode 共置时会互相干扰。

# Questions

> [!question] 后续值得继续看的问题
> - continuous batching 在长上下文、结构化输出、tool use 负载下会不会出现新的 admission bottleneck？
> - vLLM 的 page size、block manager、prefix cache 命中率，分别会怎样影响 steady-state batch occupancy？
> - 在真实集群里，TTFT / TPOT / ITL 三个指标应该如何与 scheduler 参数一起联调？
> - 当 PD disaggregation 开启后，continuous batching 的最优策略会不会发生系统性变化？
