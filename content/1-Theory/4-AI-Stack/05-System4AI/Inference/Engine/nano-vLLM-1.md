---
tags:
  - Inference
  - nano-vLLM
date: 2026-02-13
publish: "true"
zhihu-title: 【项目分析】从nano-vLLM入门推理引擎：引擎核心架构与调度设计
zhihu-topics: 如何构建推理引擎？
zhihu-link: https://zhuanlan.zhihu.com/p/2009454341728269560
zhihu-created-at: 2026-02-24 02:27
zhihu-updated-at: 2026-02-26 15:37
title: 从 nano vLLM 学习构建推理引擎
---
> 本文从构建推理引擎的需求出发，深入分析了 nano vLLM 的设计与代码实现，适合入门推理引擎的新手阅读。如果你对 LLM Inference 还不熟悉，欢迎阅读这篇文章： [【博客阅读】The Scaling Book: 7. 关于 LLM 推理的一切（2025）](https://zhuanlan.zhihu.com/p/1996648232781104495)。
> 更佳的渲染请移步博客： [从 nano vLLM 学习构建推理引擎](https://senjlearning.space/1-Theory/4-AI-Stack/05-System4AI/Inference/vLLM/nano-vLLM-1)。

## 从需求出发：一个推理引擎必须解决什么问题？ 

想象一下，你正在搭建一个持续运行的大模型服务。它每时每刻都在做三件事：**接收新请求、决定下一步计算什么、把生成的内容返回给用户**。这三件事循环往复，构成了推理引擎（Engine）的核心脉搏。但要让这个循环稳定、高效地运转，引擎必须解决几类本质问题。

1) **请求的生命周期管理**。每个请求从提交 prompt 开始，要经历两个截然不同的阶段：`prefill` 阶段一次性处理整个 prompt，建立 KV 缓存；然后进入 `decode` 阶段，逐 token 生成回复，直到触发停止条件（比如生成 EOS 标记、达到最大生成的 token 数、用户取消）。引擎必须维护每个请求的当前状态、已生成的 token 列表，并能够判断“何时完成”，还要支持一次性返回或流式返回这两种对外接口。
2) **调度与批处理**。GPU/TPU 的吞吐来自批处理。引擎要在“吞吐最大化”和“延迟/公平性”之间取舍：把哪些请求拼成一个 batch？是优先处理 prefill 还是 decode？prefill 与 decode 如何混跑？长 prompt 是否要切块（chunked prefill）来避免它触发 head-of-line 阻塞？新请求能否插队？所有这些决策都受限于几个硬约束：KV cache 的容量、最大 batch token 数、最大并发序列数。调度器必须在这些约束内，尽可能让吞吐最大、延迟可控。
3) **执行器（模型运行时）**。调度决定“算什么”，执行器负责“怎么算”：把一组序列的输入打包成张量、调用模型 forward、读写 KV cache、在张量并行（TP）的多个 GPU 间同步数据，最后做采样并输出下一个 token。
4) **系统边界与可观测性**。至少要做到干净退出（释放 worker、显存、销毁进程组）、统计吞吐与延迟，必要时还要能扩展到异步或流式处理。

这些需求共同勾勒出一个推理引擎的基本轮廓。如果你翻阅过 vLLM、SGLang 或 TensorRT-LLM 的源码，会发现它们都遵循着相似的架构：一个 `Queue → Scheduler → Executor → StateUpdate → Queue` 的处理循环，只是在各个模块的“聪明程度”上各有千秋。nano-vLLM 正是这个架构的一个极简实现，它用几百行代码把核心骨架清晰地呈现出来。接下来，我们就从引擎（Engine）这一层开始，逐步拆解它的设计。

### 推理引擎的通用设计模式

1. **引擎循环**：`step()`
    几乎所有 serving 引擎都有一个 `step()` 方法，它是一次“调度 + 执行 + 后处理”的原子单元。观察 `step()` 的输入输出，就能反推出其他模块的职责边界。通常 `step()` 会包含三个子步骤：
    - **`schedule()`**：在资源约束下决定本 step 执行哪些请求，以及它们处于 prefill 还是 decode 阶段。
    - **`run()`**：真正跑模型 forward，并采样出下一个 token（某些实现中，prefill 也可能产出第一个 token）。
    - **`postprocess()`**：将生成的 token 写回请求，判断是否完成，并更新 KV cache 状态。

2. **请求状态**：`Sequence` / `Request`
    每个请求在引擎中用一个对象表示（通常是 `Sequence`）。它至少需要提供三类信息：
    - **逻辑信息**：prompt 的 token 列表、已生成 token 列表、采样参数、是否 finished。
    - **调度所需信息**：长度、剩余 token 预算。
    - **与 KV cache 的映射**：如何从逻辑位置找到物理缓存块（即 block table）。这个映射可以由 `Sequence` 自己维护，也可以由外部的 `BlockManager` 维护——vLLM 选择了后者，`Sequence` 只持有 block table 的引用。

3. **调度器的核心约束**
    调度器必须在硬约束下做出启发式最优的 batch 组合。硬约束通常包括：
    - `max_num_seqs`：每步最多同时处理多少条序列（控制 kernel launch 开销）。
    - `max_num_batched_tokens`：每步最多处理的 token 总数（控制显存峰值和计算量）。
    - `kv_cache_capacity`：KV cache 的物理块数量，决定能否为新的请求分配块，或为已有请求追加块。
    在这些约束下，调度策略可以有多种选择：先 prefill 再 decode（简单但 decode 延迟可能因 prefill 而抖动）、prefill/decode 混排（continuous batching，vLLM 的核心创新）、chunked prefill（把长 prompt 切块插入 decode batch 中）等。nano vLLM 的实现是最简方案：prefill 阶段尽量塞满 token budget，decode 阶段每序列每步只生成 1 个 token。

> [!TIP] 延伸阅读
> - [[Continuous Batching in vLLM]]：从 static batching 的缺陷出发，推导为什么 vLLM 必须走 continuous batching（迭代级调度）这条路。

4. **执行器的两种形态**
    - 执行器可以设计为**单进程单设备**（最简单），
    - 也可以设计为 **driver + worker 多进程**（用于张量并行）。在多进程模式下，rank 0 作为 driver 负责调度输入、聚合输出，其他 rank 只执行计算。vLLM 的 TP 实现就是这种思想的体现，只是它用了更复杂的通信机制（Ray、IPC 或共享内存）。

有了这些背景，我们再来看 nano-vLLM 的 Engine 实现，就会觉得每行代码都有它的道理。

### nano-vLLM 的 Engine 实现细节

#### 1. `LLMEngine.step()`： 引擎的核心节拍

```python
    def step(self):
        seqs, is_prefill = self.scheduler.schedule()
        token_ids = self.model_runner.call("run", seqs, is_prefill)
        self.scheduler.postprocess(seqs, token_ids)
        outputs = [(seq.seq_id, seq.completion_token_ids) for seq in seqs if seq.is_finished]
        num_tokens = sum(len(seq) for seq in seqs) if is_prefill else -len(seqs)
        return outputs, num_tokens
```

- 第一步，调用 `schedule()` 挑出本 step 要执行的序列列表 `seqs`，并决定这一步属于 prefill 还是 decode ：
    - `seqs` 表示这一轮模型 forward 时将对这些请求做计算，它本质上就是“这个 step 的 batch”；
    - `is_prefill` 是一个布尔值，表示这一步跑的是 prefill 还是 decode。这是因为 prefill 和 decode 的“工作形态”不同：prefill 时每个 seq 要处理的是整段 prompt（长度可能很大），输出是建立 KV cache，并产生下一 token 的 logits（与大多数推理引擎的实现类似，nano vLLM也会立刻采样出第一个 token，具体可以看 [[#6. 执行与采样|runner 的相关实现]]）；decode 时每个 seq 只追加 1 个 token（每步一 token），依赖已有 KV cache。
    - 所以 `schedule()` 的核心职责应当是在硬约束（例如 `max_num_batched_tokens`、`max_num_seqs`）下，构造一个可执行 batch，并告诉 runner 用哪条路径执行。
- 第二步，runner 把这批 seq 真正跑一轮，并返回每个 seq 在本 step 产生的新 token。
    - 从代码上看，`model_runner.call("run", seqs, is_prefill)` 是一个 RPC 调用：如果启用了张量并行，rank 0 会把命令广播给所有 worker，然后所有 rank 一起执行 `run` 方法，最后只有 rank 0 返回采样的 token id 列表。
    - 仔细查看这个 RPC 的参数：op 名称是"run"，表示执行 forward+采样；入参 `seqs` 是控制面决定传递“要计算哪些 seq”；入参 `is_prefill` 告诉 runner 采用 prefill 还是 decode 的打包方式与 KV 读写路径；返回值 `token_ids` 是对 `seqs` 列表中的每个 `seq` 所生成出来的下一个 token id，对于 prefill 来说，这一步会返回一个 token id（处理 prompt 后第一个生成的 token），decode 则每 step 生成一个 token。
- 第三步，调用 `postprocess(seqs, token_ids)` 将生成的 token 写回原 `seq`，检查是否达到停止条件（EOS 或 max_tokens），如果完成则释放其占用的 KV cache 块，并将序列从 running 队列移除。这一步既更新了用户可见的输出 token，也维护了系统资源 KV cache 与调度队列的一致性。
- 第四步，遍历本次 step 被调度执行的 `seqs` 列表，如果某个 seq 的处理状态在刚刚的 `postprocess` 中被更新为 `FINISHED`，则输出该 seq 的 id 和为该 seq 而生成的完整 token 列表 `(seq.seq_id, seq.completion_token_ids)`
    - 所以它的返回值必然具有一个性质：大多数 step 返回空 outputs（因为大多数请求不会恰好在这一步完成）；只有当某个请求在该 step 内刚被判定 finished，才会返回它的完整 `completion_token_ids`。因此，这是一个“完成时一次性返回、不是 streaming”的推理引擎。
    - 如果是 streaming 引擎，典型返回会是“本步每个 seq 新生成的 delta token（或文本 chunk）”，并且即使未完成也会返回增量。
- 第五步，为 `generate()` 中统计 prefill 和 decode 阶段的吞吐而执行，并非功能正确性的必需
    - `if is_prefill`：用 `sum(len(seq) for seq in seqs)` 估算这一步 prefill 处理的 token 数。严格讲，prefill 真正计算的 token 数更应该是 `len(seq) - seq.num_cached_tokens` 的和。engine 这里用 `len(seq)` 是一个“粗估/简化”，可能会把已经 cached 的前缀也算进去，但用于进度条展示可以接受。
    - `else -len(seqs)`：decode 时，每个 seq 本 step 恰好生成 1 个 token，因此本 step 生成 token 数就是 batch size = `len(seqs)`。这里故意加负号，是为了让 `generate()` 调用时通过 `num_tokens > 0` 与否区分“这是 prefill step 还是 decode step”，从而更新不同的 throughput 统计变量。

---

#### 2. 请求的加入：`add_request()`

```python
    def add_request(self, prompt: str | list[int], sampling_params: SamplingParams):
        if isinstance(prompt, str):
            prompt = self.tokenizer.encode(prompt)
        seq = Sequence(prompt, sampling_params)
        self.scheduler.add(seq)
```

- `add_request` 的执行过程是 prompt → token ids → Sequence 入 waiting，即利用 pretrained model 的 tokenizer 将 prompt 分词、编码为 token ids 的列表，engine 并不关心 prompt 的具体语义；然后 `Sequence(prompt, sampling_params)` 创建一个 `Sequence` 对象，最后把它交给 scheduler 的 waiting 队列。
- `Sequence` 的实例 seq 是请求状态的唯一载体，engine 自己不保存 token 的累积逻辑，而是把 sequence 交给 scheduler 管理，engine 也不直接管理 KV cache/block_table，这些在 `scheduler.allocate` 与 `runner.prepare_*` 里才会用到。

---

#### 3. 初始化：准备资源与进程

我们终于能来看看 `LLMEngine` 设置了哪些关键参数与步骤：

```python
class LLMEngine:

    def __init__(self, model, **kwargs):
        # 1. 提取config中的参数
        config_fields = {field.name for field in fields(Config)}
        config_kwargs = {k: v for k, v in kwargs.items() if k in config_fields}
        config = Config(model, **config_kwargs)
        
        # 2. 若启用TP，则要处理多进程
        # 用于TP（需要ranks>0）的worker进程列表
        self.ps = []
        # 用于进程同步的多进程（multiprocessing）事件列表
        self.events = []
        # 以spawn语义派生子进程
        ctx = mp.get_context("spawn")
        # 为rank 1..TP_size-1各自创建进程，每个进程的入口是ModelRunner
        for i in range(1, config.tensor_parallel_size):
            event = ctx.Event()
            process = ctx.Process(target=ModelRunner, args=(config, i, event))
            process.start()
            self.ps.append(process)
            self.events.append(event)
        
        # 3. 创建主进程rank0的ModelRunner（driver）
        self.model_runner = ModelRunner(config, 0, self.events)
        
        # 4. 从预训练模型中获取其相匹配的tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(config.model, use_fast=True)
        # 5. 在根据config创建scheduler之前将eos标记的id写入config，保证终止判定的可用性
        config.eos = self.tokenizer.eos_token_id
        self.scheduler = Scheduler(config)
        
        # 6. 保证进程退出时尽量释放worker/进程组/共享内存
        atexit.register(self.exit)
```

- 前三行获取 config 中的参数：`Config(model, **config_kwargs)` 允许传入很多参数，但只有 `Config` dataclass 里定义过的字段才会被挑选出来传递给 `Config` 构造函数，避免 kwargs 污染
- `ctx = mp.get_context("spawn")` 这行代码的意思是：从 `torch.multiprocessing` 里拿到一个“多进程上下文”（context），并且**明确指定子进程启动方式为 `spawn`**，然后把这个上下文保存到 `ctx` 变量里。之后用 `ctx.Process()`、`ctx.Event()` 等创建出来的进程与同步原语，都会统一遵循 `spawn` 启动语义，而不是依赖系统默认（Linux 往往是 `fork`）
    - `ctx` 主要用于启动 TP 的 worker 进程：每个 rank>0 的 worker 都通过 `ctx.Process(target=ModelRunner, ...)` 启动，并用 `ctx.Event()` 做同步。
    - 由于这里会涉及 CUDA / Torch 的初始化与 GPU 资源使用，选择 `spawn` 往往能让行为更可控、更可复现。核心在于 `spawn` 和 `fork` 的“继承方式”完全不同：
        - `fork` 会在子进程里**复制父进程的地址空间快照**（写时复制），也会把父进程里已经创建/初始化的很多状态一并继承过去——包括 Python 解释器内部状态、已启动的线程、以及 CUDA runtime / driver、cuBLAS/cuDNN、PyTorch allocator、NCCL 通信等底层库可能已经建立的上下文与句柄。这些状态在 `fork` 之后处于一种“看似存在、但并不保证在子进程中一致安全”的状态：例如父进程里某些线程在 fork 前持有锁，fork 之后子进程只保留了一个线程，锁状态却被继承，容易造成死锁；又比如 CUDA 上下文/句柄在 fork 后被复制，子进程再去调用 CUDA 初始化或使用缓存 allocator，可能出现不可预期的错误、hang、或者隐蔽的数据竞争。
        - 而 `spawn` 的语义是：子进程从一个**全新的 Python 解释器实例**启动，重新导入模块，然后执行你指定的入口（target）。这意味着子进程不会继承父进程已经“半初始化”的 CUDA/Torch 状态，反而能在子进程内部按确定顺序完成：设置设备、初始化 CUDA 上下文、建立通信、创建模型权重与缓存等。换句话说，`spawn` 让“每个进程的 CUDA/Torch 初始化边界”更清晰：**在哪里初始化、初始化一次、由谁负责**都更容易约束，从而更容易得到稳定一致的多进程 GPU 行为（尤其是配合张量并行、NCCL、以及各种 GPU 内存池/缓存机制时）。
    - 代价也很明确：`spawn` 要求传给子进程的参数必须可序列化（picklable），入口函数/类最好是模块顶层可导入对象；启动开销通常也比 `fork` 更大一些。但在涉及 CUDA/Torch 多进程推理/训练的场景里，这些成本通常换来更少的诡异崩溃与卡死，更容易调试与部署。
- rank0 在主进程里也创建一个 `ModelRunner(config, 0, events_list)`，并扮演 driver 的角色：它会创建共享内存 `"nanovllm"`，并用 `events_list.set()` 唤醒所有 worker（后文 [[#2. 跨进程协同（IPC/RPC）|ModelRunner]] 里能看到 rank0 create shm，然后 `dist.barrier()` 设置同步；rank>0 barrier 后 attach shm 并进入 `loop()` 永久监听 rank0 命令的 IPC 机制）。
- 这里 eos 必须在 `Scheduler(config)` 之前写入 config，原因在于不同 pretrained model 的 eos 标记所对应的 token id 不同，需要先从对应模型的 `Tokenizer` 中获取，填入 `config.eos` 中，才能让模型运行时有正确的终止判断。
- `atexit.register(self.exit)`：确保即使用户不手动调用 exit，进程退出时也会尽量释放 worker/进程组/共享内存。
```python
    def exit(self):
        self.model_runner.call("exit")
        del self.model_runner
        for p in self.ps:
            p.join()
```

结合后文的 [[#2. 跨进程协同（IPC/RPC）|IPC 机制]] `ModelRunner.exit/loop` 看：
- rank0 `call("exit")` 会写 shm 并唤醒 worker；
- worker 在 loop 里读到 `method_name == "exit"` 时执行 `exit()`，然后 break 退出 loop；
- `exit()` 内部关闭 shm、barrier、rank0 unlink shm、销毁 cudagraph 资源、`dist.destroy_process_group()`；
- 主进程最后 join 等 worker 退出，避免僵尸进程。

---

#### 4. 生成循环：`generate()`

`generate()` 是暴露给用户的同步接口，它驱动整个引擎直到所有请求完成：

```python
    def generate(
        self,
        prompts: list[str] | list[list[int]],
        sampling_params: SamplingParams | list[SamplingParams],
        use_tqdm: bool = True,
    ) -> list[str]:
        # 启用可视化的进度条
        if use_tqdm:
            pbar = tqdm(total=len(prompts), desc="Generating", dynamic_ncols=True)
        # 将采样超参数设置为列表，与prompts一一对应
        if not isinstance(sampling_params, list):
            sampling_params = [sampling_params] * len(prompts)
        # 将每条prompt和相应的sp参数加入engine的调度队列
        for prompt, sp in zip(prompts, sampling_params):
            self.add_request(prompt, sp)
        
        # 初始化模型推理的输出dict、用于记录prefill/decode吞吐的统计量
        outputs = {}
        prefill_throughput = decode_throughput = 0.
        
        # 只要scheduler的waiting队列还有待处理seqs，就一直循环调度+执行
        while not self.is_finished():
            # 初始化一个用于性能统计的时间变量
            t = perf_counter()
            # 执行step()：调度、执行、后处理
            output, num_tokens = self.step()
            if use_tqdm:
                if num_tokens > 0: # 注意前文为了区分prefill和decode，专门将decode阶段的的tokens吞吐率取了相反数
                    prefill_throughput = num_tokens / (perf_counter() - t)
                else:
                    decode_throughput = -num_tokens / (perf_counter() - t)
                pbar.set_postfix({
                    "Prefill": f"{int(prefill_throughput)}tok/s",
                    "Decode": f"{int(decode_throughput)}tok/s",
                })
            # 将该次step产生的输出保存到全局的输出dict中
            for seq_id, token_ids in output:
                outputs[seq_id] = token_ids
                if use_tqdm:
                    # 该seq处理完成后，更新一次进度条计数
                    pbar.update(1)
        
        # 由于schedule，完成处理的seq并非是最初输入prompt的顺序，因此需要排序
        outputs = [outputs[seq_id] for seq_id in sorted(outputs.keys())]
        # 最终返回解码后的结果
        outputs = [{"text": self.tokenizer.decode(token_ids), "token_ids": token_ids} for token_ids in outputs]
        if use_tqdm:
            pbar.close()
        return outputs
```

- `tqdm(total=len(prompts), desc="Generating", dynamic_ncols=True)` 初始化了一个进度条，其中参数 `total=len(prompts)` 意味着每完成一条序列的处理才更新一次进度条，`dynamic_ncols=True` 则是自适应终端的宽度。

---

nano-vLLM 的 Engine 部分虽然只有几百行代码，但它清晰地勾勒出了一个推理引擎的核心骨架：

- 通过 `step()` 循环驱动系统前进；
- 通过 `Scheduler` 管理请求状态与资源；
- 通过 `ModelRunner` 封装模型执行（支持单卡或多卡并行）；
- 通过 `Sequence` 作为请求状态的统一载体。


在下一节中，我们将深入 **Scheduler** 的内部，看看它是如何在有限资源下做出调度决策，并借助 `BlockManager` 实现 KV cache 的页式管理。你会看到，即使是 nano 版本，也借鉴了 vLLM 的 paged attention 思想，实现了 prefix caching 和抢占等机制。

## 从 Engine 的设计反推：调度器如何设计？

在上一节中，我们看到了 `LLMEngine.step()` 的三段式结构：`schedule() → run() → postprocess()`。这个看似简单的循环，对调度器（Scheduler）施加了非常具体的约束。让我们站在引擎的角度，思考它需要**调度器提供什么**。

首先，引擎期望 `schedule()` 返回两个东西：一个序列列表 `seqs`，以及一个布尔值 `is_prefill`。`seqs` 就是本轮要执行的 batch，`is_prefill` 告诉后面的 runner 应该用 prefill 还是 decode 的方式处理这批序列。这个契约意味着调度器必须保证：

- `seqs` 的顺序是稳定的，并且与 runner 返回的 token 列表严格一一对应。
- 每个序列在本步的语义是明确的：要么是 prefill（可能一次处理多个 token），要么是 decode（严格每序列一个 token）。
- 本 step 结束后，要能用 `token_ids` 纯粹地更新 seq 状态机并决定是否完成。

其次，引擎并不直接管理 KV cache，这意味着调度器必须替引擎“管住” KV cache 的容量，并为 runner 提供 KV cache 寻址所需的元信息（比如 block table）。这也是为什么即使 nano 版本很小，调度器仍然需要有一个 `BlockManager` ——，它是 PagedAttention 的雏形，没有它，就无法在 decode 时安全地追加 token，也无法在资源紧张时做抢占/回收。

最后，引擎的 step 循环本身没有时间或优先级参数，这说明所有的调度策略（比如 prefill 和 decode 如何取舍、waiting 和 running 队列如何组织、遇到 KV 不够怎么办）都必须封装在调度器内部。换句话说，调度器是这个系统里唯一能影响首 token 延迟（TTFT）和每个输出 token 延迟（TPOT）的地方。

把这些约束压缩成一句话：调度器必须完成**可执行 batch 的构造（prefill 或 decode）、KV cache 的配额/分配/扩容/回收、以及请求状态的推进与终止**。

### Scheduler 需要解决的核心问题

当我们从推理系统的物理事实出发思考，调度器的核心矛盾其实在于 prefill 和 decode 的 workload 性质完全不同。prefill 是计算密集型、一次性投入；decode 是访存密集型、要持续很多步。你既不想让 decode 被长 prompt 的 prefill 饿死（导致尾延迟爆炸），也不想让 GPU 因为等待 decode 而空闲（降低吞吐）。工业界的 vLLM 用 continuous batching + paged attention 的组合来应对这个矛盾，再叠加 chunked prefill、prefix caching 等优化。但在最基本的实现中，调度器至少需要解决以下几类问题。

1) **队列与状态机**：waiting/running/finished。最简单的调度策略是 FCFS（先来先服务）。新请求进入 waiting 队列；prefill 之后进入 running 队列；decode 过程中如果完成，则移出队列并回收资源。当资源不足时，还需要有抢占机制：把某些 running 序列暂时踢回 waiting，释放它们占用的 KV cache 块，让其他序列能继续 decode。这个抢占策略决定了系统的公平性和吞吐特性。
2) **batch 构造的约束**：无论采用什么调度策略，至少要有两条硬约束：
    - `max_num_seqs`：每步最多能并发地处理多少条序列（这控制 compute 的工作量、kernel launch 开销、并发度等系统性能）
    - `max_num_batched_tokens`：prefill 步一次性处理的 token 总量上限（控制 prefill 的 compute 峰值、以及临时激活开销）。
    - 工业级会更细：把“prefill chunk token budget”和“decode token budget”分开，甚至用更复杂的 cost model 来估算 step time。
3) **KV cache 的分页管理**：把每条序列的 KV cache 视作由固定大小 block 组成。调度器需要知道：每个序列需要多少块（逻辑块数），当前有多少空闲块，能否为新的序列分配，能否为已有序列追加新块。这些判断都由 `BlockManager` 提供。当空闲块不足时，调度器必须决定是拒绝新请求（背压），还是抢占已有请求（释放块），或者把一些块 swap 到 CPU（offload）。
    - 这个机制是 vLLM paged attention 的抽象核心之一，并且 vLLM 的 block 管理更复杂，有 swap、prefix reuse、跨请求共享等。
4) **抢占策略**：当 KV cache 容量达到极限，而某个 running 序列需要追加新块却无块可用时，调度器必须选择牺牲谁。
    - 一种简单的策略是“抢占队尾”：从 running 队列末尾选一个序列，释放它的所有块，把它放回 waiting 队列的头部，这样下次它会被优先重新 prefill。这个策略试图让被抢占者尽快恢复，避免 starvation。
    - vLLM 的 chunked prefill 是另一条思路：把长 prefill 切成小块，允许 decode piggyback 在同一批里跑，从而减少 decode 被 prefill 独占导致的尾延迟。
    - 进一步的工业/学术路线是 disaggregated prefill/decode：prefill 服务与 decode 服务分离，用网络/缓存传递 KV，以 goodput 为目标重新做系统设计。
5) **可观测性与可控性**：Scheduler 需要暴露足够的计数，用于上层统计与调参（例如：本步 prefill token 数、decode token 数、preempt 次数、KV block 利用率）。

---

**如果扩展 Engine，Scheduler 需要怎样演进**？（对齐工业界前沿做法）

当前所讨论的 Engine 设计特点是：同步、非 streaming、prefill/decode 二选一。如果把它往工业级演进，Scheduler 基本沿着下面几条主线进行演变：

1) **streaming 式输出**：Scheduler 的 postprocess 必须产出“增量事件”，而不是只在 finished 时才有结果。因为 streaming 的思路是每个 decode step 都要把 $\Delta \rm token$ 交付给上层。
2) **从二选一到 prefill + decode 混排**（continuous batching）：最简实现的 Scheduler 每一轮要么全做 prefill，要么全做 decode。但这会导致 decode 的尾延迟被偶尔的长 prefill 拉高。continuous batching 允许 prefill 和 decode 混在同一批里执行，甚至可以切分长 prompt（chunked prefill），让 decode 的延迟更稳定。
    - 这就要求 Scheduler 的 schedule 不再返回单一 `is_prefill`，而是返回一个*混合 batch 的详细描述*——至少要区分 batch 内每条 seq 是 prefill chunk 还是 decode token，并且把 token budget 在两类任务之间分配。 
    - [vLLM 的 chunked prefill 文档](https://docs.vllm.ai/en/v0.4.2/models/performance.html#chunked-prefill)明确描述了“把大 prefill 切块并与 decode 一起 batch”的动机与收益。

3) **prefix caching / 跨请求复用**：Scheduler 不只是分配“私有 KV blocks”，而是要能“查找并复用已有前缀的 KV blocks”。这会引入两项新机制：a）prefix→KV pages 的索引（vLLM 的 automatic prefix caching；SGLang 用 radix tree/RadixAttention）；b）缓存感知调度：优先调度能命中缓存的请求，以提升整体 hit rate。

4) **speculative decoding**：Scheduler 需要从“一步 1 token”扩展到“一步可能推进多个 token 的 computed_tokens 进度”。
    vLLM v1 的 [scheduler 文档/实现](https://docs.vllm.ai/en/stable/api/vllm/v1/core/sched/scheduler/#vllm.v1.core.sched.scheduler.Scheduler) 里提到了用“num_computed_tokens 追赶 num_tokens_with_spec”这类统一抽象来覆盖 speculative、chunked prefill、prefix caching 等不同优化。

### 回到 nano vLLM

在上一节中，我们从引擎的视角分析了 Scheduler 必须承担的职责：维护请求队列、在资源约束下构造 batch、管理 KV cache 的分配与回收。现在，我们翻开 nano-vLLM 中 `Scheduler` 类的源码，看看这些设计思想如何落地为可运行的代码。

#### 1. 队列与状态机

```python
class Scheduler:

    def __init__(self, config: Config):
        self.max_num_seqs = config.max_num_seqs
        self.max_num_batched_tokens = config.max_num_batched_tokens
        self.eos = config.eos
        self.block_manager = BlockManager(config.num_kvcache_blocks, config.kvcache_block_size)
        self.waiting: deque[Sequence] = deque()
        self.running: deque[Sequence] = deque()

    def is_finished(self):
        return not self.waiting and not self.running

    def add(self, seq: Sequence):
        self.waiting.append(seq)
    
    def preempt(self, seq: Sequence):
        seq.status = SequenceStatus.WAITING
        self.block_manager.deallocate(seq)
        self.waiting.appendleft(seq)
```

`Scheduler` 类维护两条双端队列（waiting 与 running），并且在每一步（`LLMEngine.step()` ）决定“这一轮应该让哪些 `Sequence` 参与计算、这是 prefill 还是 decode”，同时通过 `BlockManager` 管理 KV cache 的分配/回收，从而保证显存不会超用。

在 `Scheduler` 的构造函数 `__init__()` 中，首先从 config 中读取几个关键参数：
- `max_num_seqs`：每一轮最多允许同时调度多少条序列（一次 batch 里最多有多少个 seq）。
- `max_num_batched_tokens`：prefill 时的 token 预算。一轮 prefill 时 batch 的总 token 数不能超过这个数值。
- `eos`：把 EOS 标记的 token id 缓存下来，用于后续 `postprocess` 判断序列是否结束。
    这就是为什么 `LLMEngine` 里必须先从 tokenizer 拿到正确的 `eos_token_id`，再创建 `Scheduler`：因为这里会把它复制进 `self.eos`，后面不会再动态读取 `config.eos`。

同时初始化一个 `BlockManager` ，它负责 KV cache 物理块的实际分配与回收。它至少需要提供这些语义以保证 scheduler 功能的正确性：
- `can_allocate(seq)`：这个 seq 进来做 prefill 时，有没有足够块给它分配？
- `allocate(seq)`：真的给 seq 分配块（把它变成可运行状态），建立 `block_table`，并利用 hash 尝试复用已有块（prefix caching）。
- `can_append(seq)`：decode 产生新 token 时，能不能再给这个 seq 的 KV cache 追加？
- `may_append(seq)`：实际执行追加操作，更新块状态。decode 产生的新 token 对最后一个 block 的影响是什么？根据不同的情形处理最后一个 block。
- `deallocate(seq)`：序列被抢占或完成后回收它占用的块

Scheduler 判断能不能把 seq 放进 batch不是只看数量上限，还要看 KV cache block 是否够，这是它能够做“多请求并发推理”的基础。

这里两条队列都是双端队列（`deque`），其好处是两端 push/pop 都是 $O(1)$，很适合做“队列 + 头尾插入”的调度。这里 waiting 队列保存等待调度、尚未分配 KV cache 的 seq，而 running 队列中则是已经分配了 KV cache 的 seq

接下来重点关注 waiting/running 中的 seq 是怎么流转的？Scheduler 维护的状态核心就两件事：**队列内容**与**序列的 status**
- `add(self, seq)` 将新请求追加到系统的 waiting 队列，这个请求不会立马 running，在下一次 schedule 时才可能被拉起
- 通常流转是： `waiting --(prefill allocate)--> running`； `running --(finish)--> 移出 running 并释放 block`； `running --(preempt 抢占)--> waiting`（并释放 block，等待将来重新 prefill）
- `preempt(seq)`：抢占发生时做了什么？将 `seq` 状态标记为 WAITING，将其占用的 KV cache block 回收，将它放回 waiting 队列的最前面（`appendleft()`，这意味着下一轮 prefill 时会被优先拉起）——即朴素的被抢占者优先恢复的调度策略，避免 starving

---

这里的抢占的实现需要预先理解，后文在 decode 阶段的 schedule 策略中需要用到：
1. 将序列状态改回 WAITING
2. 调用 `block_manager.deallocate(seq)` 释放它占用的所有 KV 块
3. 把它放回 waiting 队列的队首，这样下一轮 prefill 时它会被优先处理

#### 2. prefill 的 schedule

`schedule()` 是调度器的核心，它负责决定本轮要执行哪些序列，以及是 prefill 还是 decode。代码分为两部分：先尝试做 prefill，如果 prefill 没有可调度的序列，才退而做 decode（二者只能取一的策略）。

```python
    def schedule(self) -> tuple[list[Sequence], bool]:
        # prefill
        scheduled_seqs = []
        num_seqs = 0
        num_batched_tokens = 0
        while self.waiting and num_seqs < self.max_num_seqs:
            seq = self.waiting[0]
            if num_batched_tokens + len(seq) > self.max_num_batched_tokens or not self.block_manager.can_allocate(seq):
                break
            num_seqs += 1
            self.block_manager.allocate(seq)
            num_batched_tokens += len(seq) - seq.num_cached_tokens
            seq.status = SequenceStatus.RUNNING
            self.waiting.popleft()
            self.running.append(seq)
            scheduled_seqs.append(seq)
        if scheduled_seqs:
            return scheduled_seqs, True
        
        # decode
        ...
```

prefill 的 schedule 是严格的 FCFS+token budget+ KV block affordable 三重门槛，核心判断是：
- 取出 waiting 队首的第一个 seq 作为本次处理的对象，**首先要判断其用于 prefill 的 token 预算是否充足**—— `num_batched_tokens + len(seq) > self.max_num_batched_tokens` ——如果预算不够，则直接跳出循环，不会去看 waiting 队列后面的序列。这是严格的 FCFS 策略，保证公平性，但可能浪费吞吐（比如后面有短请求，但因为队首长请求被阻塞而无法执行）
- **其次要判断现有内存空间是否还能满足该 seq 的 KV cache 需求**：`not self.block_manager.can_allocate(seq)`，没有足够的 free KV blocks，也要停止装入 seq 到本次 batch 的 prefill 中
- 真正装入时，`block_manager.allocate(seq)` 为该 seq 分配 blocks；`num_batched_tokens += len(seq) - seq.num_cached_tokens` 只把“本次新增要计算的 token”计入 budget（这里 cached tokens 表明，可能已经有一部分前缀被缓存，这部分不需要重新计算，也不占用 token 预算）；同时通过 `num_seqs` 递增、seq 标记为 RUNNING、waiting 和 running 队列的出入管理等维护一致性

`if scheduled_seqs: return scheduled_seqs, True` 明确说明只要能做任何一个 seq 的 prefill，本 step 就不会 decode。它牺牲了 decode 的尾延迟稳定性，换取简单的推理引擎实现。

#### 3. decode 的 schedule

当 waiting 队列为空，或者没有满足 prefill 条件的序列时，调度器才会尝试执行 decode：

```python
        # prefill
        ...
        
        # decode
        while self.running and num_seqs < self.max_num_seqs:
            seq = self.running.popleft()
            while not self.block_manager.can_append(seq):
                if self.running:
                    self.preempt(self.running.pop())
                else:
                    self.preempt(seq)
                    break
            else:
                num_seqs += 1
                self.block_manager.may_append(seq)
                scheduled_seqs.append(seq)
        assert scheduled_seqs
        self.running.extendleft(reversed(scheduled_seqs))
        return scheduled_seqs, False
```

decode 的调度比 prefill 复杂，因为它必须处理 KV cache 不足的情况。让我们拆解这个循环：
- 每次从 running 队列取出队首的一个 seq，准备让它在本轮生成一个 token
- 先检查 KV blocks 是否还有空余空间追加这个 token `block_manager.can_append(seq)` ,这个检查主要看序列的最后一个块是否还有空位，如果没有（即刚好在一个块的末尾），则需要分配一个新块；此时如果空闲块不足，`can_append` 就会返回 False。
- 如果 `can_append` 返回 False，调度器则进入抢占循环：
    - 优先抢占 running 队尾（`running.pop()`）：如果 running 队列中还有其他序列，把队尾 seq 取出调用 `preempt` 方法将其抢占—— `deallocate` 与之相关的块并 appendleft 回 waiting 队首。
    - 如果 running 队列没有任何待处理 seq，且仍然在没有足够 KV cache 的前提约束下，这说明没有任何空间供当前 seq 执行，只能等待整体系统资源状况变化，于是将自己“抢占”自己，把自己 appendleft 回 waiting 队列，然后推出抢占循环。`break` 会**立即退出当前所在的最内层循环**，即内层的 `while not self.block_manager.can_append(seq):` 循环。由于内层循环被 `break` 终止，与之关联的 `else` 分支（正常退出时执行）**不会被执行**，因此不会增加 `num_seqs`（被调度的 seq 计数）、不会处理新块的分配与否、不会将 `seq` 加入 `scheduled_seqs` 列表。这时，外层循环条件也不满足，结束循环抵达 assert 语句，由于 prefill 部分一定会在 `scheduled_seqs` 非空时返回，因此这里一定会触发 AssertionError 异常，表明遇到了边界情况，需要另行处理
    - 抢占的物理意义是“释放它占用的 KV blocks”，让当前 seq 能继续 append 一个新 token 的 KV。这个策略非常直接，也解释了为什么 nano vLLM 能在 KV 紧张时继续前进，但代价是被抢占的序列会失去 KV，需要后续重新 prefill（从 `num_cached_tokens` 逻辑看，它保留了一部分 cached 前缀，但 block 被 deallocate 后通常仍要重算，具体取决于 Sequence/BlockManager 怎么定义和实现 cached）。
- 如果返回 True，则进入 `else` 分支：将该序列加入本轮 batch，调用 `block_manager.may_append(seq)` 来更新块状态（比如如果需要新块，在这里分配），然后加入 `scheduled_seqs`。
- 最后 `extendleft(reversed(scheduled_seqs))` 是一个关键细节，它让刚刚 decode 过的序列在下一步仍然优先被选到，形成“连续解码”的局部性偏好（否则 deque 轮转可能让某些序列间隔很大，影响 per-request latency）。因为前面用 `popleft()` 把它们从 running 拿走了，这里要放回去以维持队列。用 `extendleft(reversed(...))` 是为了保持相对顺序不被反转。

---

总结一下这里的抢占策略：
- **先抢占队尾**：优先抢占 running 队列中“最老”的序列（队尾），因为队首的序列刚刚被取出来，正要执行，抢占它代价最大。队尾的序列可能已经等了较久，但至少它还有机会在下一轮被重新调度。
- **被抢占者优先恢复**：`preempt` 方法把被抢占的序列放回 waiting 的队首（`appendleft`），这样下一轮 prefill 时会优先处理它，尽量减少它的 starvation。
- **极端情况自抢占**：如果整个 running 队列只剩下当前序列，但资源又不够，那就只能抢占它自己，让它回到 waiting，等后面有空闲块时再重新 prefill。这种情况在系统负载极高时可能发生，但至少避免了死锁。

**decode 的整体语义可以总结为：** 尽量让 running 里的前几个 seq 各生成一个 token，如果 KV cache 的追加空间不够，就从 running 队尾开始抢占（把一些 seq 踢回 waiting，并释放它们的块）。抢占后的 seq 会更倾向于“后面 prefill 阶段再优先地重新恢复”。这是一种非常简化的抢占式调度：没有复杂的优先级，仅靠队列顺序 + 资源可用性。

#### 4. 后处理：`postprocess()`

当模型执行完并返回 token id 后，`LLMEngine` 会调用 `postprocess` 来更新序列状态并回收资源：

```python
    def postprocess(self, seqs: list[Sequence], token_ids: list[int]) -> list[bool]:
        for seq, token_id in zip(seqs, token_ids):
            seq.append_token(token_id)
            if (not seq.ignore_eos and token_id == self.eos) or seq.num_completion_tokens == seq.max_tokens:
                seq.status = SequenceStatus.FINISHED
                self.block_manager.deallocate(seq)
                self.running.remove(seq)
```

- 对齐 engine 的契约，它严格用 `zip(seqs, token_ids)` 逐个更新 seq 和其在本轮生成的 token
- 检查终止条件：如果触发了 EOS（且未忽略 EOS）或者达到了最大生成 token 数，就将状态设为 FINISHED，并立刻 `deallocate` 回收其 blocks，并从 running 队列中移除。
    - 这里的 remove 是线性查找，复杂度不高但在大规模并发时会变成热点；工业级实现通常会用更适合的大结构来管理 running 集合。

这一步既更新了用户可见的输出 token，也维护了系统资源与调度队列的一致性。

---

nano-vLLM 的调度器用大约 80 行代码实现了以下核心功能：

- 等待队列与运行队列的管理。
- prefill 阶段的 FCFS 调度，受 token 预算和 KV 块容量的约束。
- decode 阶段的调度，以及当块不足时的抢占策略（优先抢占队尾，被抢占者放回队首）。
- 序列状态的推进（WAITING → RUNNING → FINISHED）和资源回收。


虽然这个调度器相比工业级的 continuous batching 和 prefix caching 还有差距，但它清晰地展示了调度器必须解决的核心矛盾：如何在有限的资源下，平衡 prefill 和 decode 的需求，保证系统不卡死。理解了这些基础，再去阅读 vLLM 的调度代码，就会觉得那些复杂的数据结构和策略其实是解决同样问题的自然延伸。

下一节，我们将深入 `BlockManager` 的内部，看看它如何用固定大小的块管理 KV cache，以及如何通过哈希实现基础的 prefix caching。

## 继续思考：如何定义执行器的设计与接口？

在前两节中，我们剖析了引擎（Engine）和调度器（Scheduler）的职责与实现。现在，我们把目光转向真正执行模型计算的模块——模型执行器（Model Runner）。在 `LLMEngine.step()` 的循环中，`schedule()` 确定了本轮要执行的序列集合，然后引擎调用 `model_runner.call("run", seqs, is_prefill)`。这个调用必须返回一个与 `seqs` 严格对齐的 token id 列表，并且要保证在多进程（张量并行）环境下所有 rank 的模型 forward 同步执行。这些硬性约束，直接定义了 Model Runner 必须实现的核心功能。

### Model Runner 的职责与实现

站在引擎的角度看，它对 Model Runner 的期望可以拆解为几个层次：

1) **数据准备**：输入是 `seqs` 列表和 `is_prefill` 标记，输出是能够喂给模型的张量。但 prefill 和 decode 的数据形态截然不同：
    - prefill 阶段需要把每条序列“尚未缓存的那段 token”拼成一个扁平的大张量，同时要能表达 ragged batch（不同序列长度不同），还要为每个 token 生成它在 KV cache 中写入的位置（slot mapping）。
    - decode 阶段每条序列只输入一个 token（上一步生成的最后一个 token），但要为这个 token 找到它在 KV cache 中对应的槽位，同时提供每条序列当前的上下文长度（用于 attention mask）和完整的 block table（用于读取历史 KV）。把 Sequence 列表打包成张量。

2) **KV cache 的物理存储与绑定**：Model Runner 必须根据显存预算，在 GPU 上分配一块连续的 KV cache 存储空间，并把这块空间切分成固定大小的块（block），然后将每层 attention 模块的 `k_cache` 和 `v_cache` 指针指向这块缓存的对应切片。这样，attention kernel 才能正确读写。

3) **上下文管理**：Model Runner 需要把“寻址上下文”以某种方式传给 attention 层。例如用 `set_context/get_context/reset_context` 做一个全局上下文，attention 实现从中取 `slot_mapping/context_lens/block_tables/cu_seqlens...`。

4) **执行策略优化**：decode 阶段每步只生成一个 token，计算量小但调用频繁，kernel launch 开销占比高。因此通常会用 CUDA Graph 将模型 forward 的 kernel 调用序列固化，每步只需更新输入张量并重放图，大幅降低 CPU 开销。prefill 阶段或者大 batch 情况下则通常走 eager 模式，因为输入形状变化大，且计算密集，kernel launch 开销不显著。
    - 工业界 vLLM 也大量使用 CUDA Graph（尤其 decode）来提升吞吐与稳定性，只是会结合更多形状与更复杂的 graph 管理。

5) **并行控制与通信**：如果启用了张量并行（tensor parallel），Model Runner 必须让所有 rank 同时进入同一段计算逻辑，并且只在 rank 0 上执行采样（因为采样只需要一份 logits）。这要求有一个跨进程的协调机制，保证所有 worker 接收到相同的“命令”并同步执行。

> [!NOTE] 如何实现从单卡到多卡的扩展？
> 在单卡、单进程的最简场景下，Model Runner 的实现可以非常直接：`run()` 里根据 `is_prefill` 调用不同的打包函数，然后跑模型 forward，最后采样返回。但一旦涉及多卡并行，事情就复杂起来。
> 
> nano-vLLM 采用了一种经典的 **driver-worker** 架构：rank 0 作为 driver，不仅参与计算，还负责接收引擎的命令、打包输入、广播命令给其他 worker；其他 rank 作为 worker，在初始化后进入一个事件循环，等待 rank 0 的命令，然后执行相同的函数（如 `run`），但只贡献计算，不负责采样输出。这种架构有几个关键点：
> 
> - 所有 rank 必须加入同一个 NCCL 进程组，并绑定到不同的 GPU。
> - 需要一个轻量的 IPC 机制来广播命令。nano-vLLM 使用共享内存（`multiprocessing.SharedMemory`）配合 `Event` 同步：rank 0 将方法名和参数 pickle 后写入共享内存，然后 `set()` 所有 worker 的 Event；worker 被唤醒后读取共享内存，反序列化并执行对应方法。
> - 所有 rank 执行完 forward 后，NCCL 通信会自动同步（因为模型内部的线性层等会触发 all-reduce 等操作），这样保证计算步调一致。
> - 采样只在 rank 0 进行，其他 rank 直接返回 `None`，engine 只接收 rank 0 的 token id 列表。
> 
> 这套机制虽然简单，但已经能支撑多卡张量并行的基本需求。

---

 **如果扩展 Engine，ModelRunner 需要怎样演进**？（对齐工业界前沿做法）

如果将 Model Runner 往工业级方向扩展，你会看到许多更精细的设计：

- **混合 batch 支持**：continuous batching 允许同一批里既有 prefill chunk 又有 decode token，这就要求打包函数能处理 per-sequence 的模式标记，并构造出 attention kernel 能直接消费的输入格式（如变长序列的 cu_seqlens 数组）。vLLM 的 chunked prefill 能做到“prefill chunk 与 decode 同批混跑”，关键就在于 scheduler 输出更丰富的 batch 描述，runner 能据此构造适配 attention backend 的输入。

- **前缀缓存（prefix caching）** 的支持：当多个请求共享相同的前缀时，Model Runner 需要能够读取其他请求缓存的 KV 块，这要求 `prepare_prefill` 能根据 block table 和 `num_cached_tokens` 正确构造不同请求来源的 slot mapping 和 block tables，并且 attention kernel 要能理解这些间接寻址。
    - SGLang 的 radix tree/RadixAttention 会把 KV pages 组织成前缀树并做 LRU eviction

- **CUDA Graph 的更复杂管理**：decode 的 batch size 可能动态变化，工业级系统通常会预编译多个 batch size 的图（如 1,2,4,8,...），并在运行时选择最接近且不小于当前 batch size 的图执行。同时要处理图的内存池复用，避免每次重新分配。

- **speculative decoding**的支持：Model Runner 可能需要一次 forward 输出多个 token 的 logits，供 draft model 或验证器使用。这会改变 run 命令的返回形态与 postprocess 的推进逻辑；对应地，scheduler 也需要从“一步 1 token”升级为“基于 computed_tokens 的进度推进”的统一抽象（vLLM v1 scheduler 明确在往这个方向抽象）。

- **disaggregated prefill/decode** 架构下，prefill 实例和 decode 实例分离，Model Runner 需要能够将 KV cache 从单机 GPU 内存抽象成可序列化、可传输、可共享的数据对象，并能够通过网络在 prefill 实例与 decode 实例间传输。这会把 KV 的物理映射从本地 HBM 扩展到网络与远端内存，调度目标也会变成 goodput 而不是单卡 tok/s。

---

### 回到 nano vLLM

在上一节中，我们站在设计层面剖析了 Model Runner 需要承担的职责：数据准备、KV cache 管理、执行优化、多进程协调。现在，让我们翻开 `model_runner.py` 的源码，看看这些职责如何通过具体的 Python 代码落地。我们会按照初始化的顺序，逐步深入到每个核心方法。

#### 1. 初始化：环境准备与资源分配

`ModelRunner` 的构造函数做了大量基础工作，从加载模型到分配 KV cache，再到多进程的协同准备。我们逐段来看。

```python
class ModelRunner:

    def __init__(self, config: Config, rank: int, event: Event | list[Event]):
        # 读取config及相关参数并初始化
        self.config = config
        hf_config = config.hf_config
        self.block_size = config.kvcache_block_size
        self.enforce_eager = config.enforce_eager
        self.world_size = config.tensor_parallel_size
        self.rank = rank # 如果rank>1，则说明多卡并行
        self.event = event # event是union类型，rank0 持有“多个 worker 的 Event 列表”，rank>0 持有“单个 Event”。
```

**构造函数首先保存配置和 rank 信息**：

- 这里的 **`event` 参数**有点特殊：如果 rank 是 0，传入的是一个 `list[Event]`，里面是每个 worker 对应的事件对象；如果 rank 大于 0，传入的是一个单独的 `Event`，用于接收 rank 0 的信号。这种设计是 driver-worker 模式的基础。
- **`config.hf_config`** 是 Hugging Face 的模型配置对象（`transformers.AutoConfig` 的实例），在 `config.py` 的 `__post_init__` 里通过 `AutoConfig.from_pretrained(self.model)` 加载得到。其中包含 `dtype`、`hidden_layers`、`key_value_heads` 等参数信息，后文中这些函数会用到这些信息：
    - `torch.set_default_dtype(hf_config.torch_dtype)`：决定默认计算数据类型 dtype（例如 fp16/bf16）
    - `self.model = Qwen3ForCausalLM(hf_config)`：用它构造模型结构
    - `allocate_kv_cache()`：用 `hf_config.num_hidden_layers / num_key_value_heads / hidden_size / num_attention_heads / torch_dtype.itemsize` 等估算 KV cache 每个 block 的字节大小，并决定能分配多少块
    - `capture_cudagraph()`：用 `hf_config.hidden_size` 决定 `outputs` buffer 形状
- `config.kvcache_block_size` 是 KV cache 的 block 粒度（一个 block 包含多少 token 的 KV）。在 `config.py` 里要求 `kvcache_block_size % 256 == 0`，是因为在 nano vLLM 中 KV block 的尺寸是 256 token，被推理模型的 block 参数要与之对齐。这就是 PagedAttention 的核心思想，将 **KV cache 管理从 token 粒度变成 block 粒度**。后文的这些函数会用到 **`block_size`**：
    - `allocate_kv_cache()`：决定 KV cache tensor 的 block 维度，以及每个 block 的字节数
    - `prepare_prefill/prepare_decode()`：计算 `slot_mapping` 时用 `block_id * block_size + offset` 来定位 KV cache 槽位
- **`config.enforce_eager`** 决定是否要强制走 eager 执行模式（禁用 CUDA Graph），这是性能/兼容性的开关，在遇到 cuda graph 不稳定、动态 shape、或调试需求时会开启。
    - `__init__()` 中：`if not self.enforce_eager: self.capture_cudagraph()` 决定是否启用 CUDA Graph
    - `run_model()` 中：`if is_prefill or self.enforce_eager or input_ids.size(0) > 512: ...`  强制 eager 会让 decode 永远不走 `graph.replay()` 路径。
- `config.tensor_parallel_size` 是 tensor parallel 的 **world size**（多少个并行 rank / 多少张 GPU）。它决定了“单进程单卡”还是“多进程多卡 tensor parallel”的推理模式，并影响 KV cache 的 per-rank 规模。**world_size** 参数在这些地方会用到：
    - `dist.init_process_group("nccl", "tcp://localhost:2333", world_size=self.world_size, rank=rank)` 把每个进程加入同一个 NCCL 通信组，这里要求所有 rank 都会执行到这一句，否则通信组无法形成。结合下一句 `torch.cuda.set_device(rank)` 约定 rank i 用第 i 张卡，决定了后面所有 CUDA tensor/operator 落到哪张 GPU
    - `__init__()` 末尾的 `if self.world_size > 1:` 决定是否启用 SharedMemory+Event 的跨进程命令广播机制（tp=1 时不需要 worker）
    - `allocate_kv_cache()`：把 `num_key_value_heads` 按 `world_size` 做切分（每张卡只存自己那份 KV heads）

---

接着是分布式环境的初始化：

```python
        # 初始化分布式并行环境，绑定GPU
        dist.init_process_group("nccl", "tcp://localhost:2333", world_size=self.world_size, rank=rank)
        torch.cuda.set_device(rank)
        default_dtype = torch.get_default_dtype()
        torch.set_default_dtype(hf_config.torch_dtype)
        torch.set_default_device("cuda")
```

这里做了几件关键的事：
- 用 NCCL 作为集合通信后端来初始化进程组，所有 rank 通过同一个 TCP 地址（`localhost:2333`）汇合。这是一个简单的 rendezvous 方式，适用于单机多卡。
- `torch.cuda.set_device(rank)` 将当前进程绑定到指定的 GPU，约定 rank i 使用第 i 号卡。
- 临时修改 PyTorch 的默认 dtype 和 device，这样后续创建张量（如模型权重、KV cache）时会自动使用正确的数据类型和 GPU，无需每次显式指定。最后会恢复默认值，以免影响其他模块。

---

然后加载模型与相关工具：

```python
        # 构造模型结构并加载权重
        self.model = Qwen3ForCausalLM(hf_config)
        load_model(self.model, config.model)
        
        # 创建采样器
        self.sampler = Sampler()
```

这里直接实例化了具体的模型类（Qwen3），并用 `load_model` 函数加载预训练的模型权重。采样器 `Sampler` 被单独创建，与模型 forward 解耦，后续 `run()` 里会把 logits 交给 sampler。

---

接下来预热推理引擎与进行 KV cache 分配：

```python
        # 预热
        self.warmup_model()
        self.allocate_kv_cache()
    ...
    
    def warmup_model(self):
        torch.cuda.empty_cache()
        torch.cuda.reset_peak_memory_stats()
        max_num_batched_tokens, max_model_len = self.config.max_num_batched_tokens, self.config.max_model_len
        num_seqs = min(max_num_batched_tokens // max_model_len, self.config.max_num_seqs)
        seqs = [Sequence([0] * max_model_len) for _ in range(num_seqs)]
        self.run(seqs, True)
        torch.cuda.empty_cache()
```

`self.warmup_model()` 的目的不是得到有意义的输出，而是“把推理运行时要走的路径先跑一遍”，让：
- CUDA kernel lazy init、cudnn/cublas 的内部缓存、PyTorch allocator 行为趋于稳定；
- 对后续 `capture_cudagraph()` 来说，warmup 能减少捕获时的意外分支（捕获要求执行图稳定）。
- 语句层面它做的事情很直白：构造若干条假的 `Sequence([0] * max_model_len)`，调用 `self.run(seqs, True)` 跑一次 prefill。注意它会在前后清空 cuda 的 cache `torch.cuda.empty_cache()`，并重置 peak memory stats，让后续 KV cache 容量估计更可控。

`self.allocate_kv_cache()` 会测量当前卡的显存可用量并写回 `config.num_kvcache_blocks`，然后在 GPU 上真实分配 `self.kv_cache`，并把每层模块的 `k_cache/v_cache` 指向这块大缓存。
- 这一步必须在“模型加载完成 + warmup 之后”进行，原因是：KV cache 的容量估算依赖“当前已经用了多少显存、峰值/当前分配情况”，如果还没加载权重或没 warmup，估算会偏乐观或偏悲观，导致块数不稳定。
- 这一步也解释了与 engine 的配合：LLMEngine 必须先构造 `ModelRunner(config, 0, ...)`，让 `config.num_kvcache_blocks` 变成真实值，然后才构造 Scheduler/BlockManager，否则调度器不知道可用 KV cache 的上限。

---

然后是可选地启用 CUDA Graph 捕获：

```python
        # 可选的性能优化，根据设备支持cuda graph与否而启用
        if not self.enforce_eager:
            self.capture_cudagraph()
```

如果配置允许（`enforce_eager=False`），就预编译不同 batch size 的 CUDA Graph，用于加速 decode 阶段。

---

最后恢复默认的 device/dtype，并处理多进程的逻辑：

```python
        # 恢复默认device/dtype，主要是避免污染外部环境
        torch.set_default_device("cpu")
        torch.set_default_dtype(default_dtype)

        # 跨进程协同：让所有rank同步跑同一个方法
        if self.world_size > 1:
            if rank == 0:
                self.shm = SharedMemory(name="nanovllm", create=True, size=2**20)
                dist.barrier()
            else:
                dist.barrier()
                self.shm = SharedMemory(name="nanovllm")
                self.loop()
```

这里有几次对 dtype 和 device 的反复设置，其原因如下：
- `default_dtype = torch.get_default_dtype()` + `torch.set_default_dtype(hf_config.torch_dtype)`：临时切默认 dtype，确保模型权重与中间张量的 dtype 与 HF 配置一致；最后会把 dtype 恢复，避免影响外部代码。
- `torch.set_default_device("cuda")`：临时把默认 device 切到 CUDA，这样像 `torch.empty(...)` 这类没有显式指定 device 的创建，默认就在 GPU 上（同样最后会切回 CPU）。
- `torch.set_default_device("cpu")`、`torch.set_default_dtype(default_dtype)`：把全局默认状态恢复。语义上是“ModelRunner 内部用 GPU 默认创建张量没问题，但不应该影响其他模块或用户代码”。

#### 2. 跨进程协同：`loop` 与 RPC 机制

这里我们重点来理解多进程。这一套 IPC 的目标是：让 **每个 GPU 对应一个进程（rank）**，所有 rank 共同参与一次前向计算（NCCL 通信），但只有 rank0 负责“采样出 token id 并把结果返回给 LLMEngine”。

回顾 LLMEngine 中初始化时，使用 `torch.multiprocessing.get_context("spawn")` 拿到 `ctx`，然后：
- 对 `rank=1..tp-1` 用 `ctx.Process(target=ModelRunner, args=(config, i, event))` 启动子进程  
    这里 `target=ModelRunner` 是把类当作可调用对象使用：子进程会执行 `ModelRunner(config, rank, event)`，也就是直接跑 `__init__`。
- 主进程自己创建 `ModelRunner(config, 0, self.events)`，即 rank0 runner。

**每个进程如何“对齐到同一组”并绑到对应 GPU？** 正是在 `ModelRunner.__init__` 中 `dist.init_process_group()` 用 NCCL 做 backend，用 TCP 地址当 rendezvous，让所有 rank 加入同一个分布式组。`torch.cuda.set_device(rank)` 将 rank i 绑到第 i 号 CUDA device。这样同一台机器多卡时，每个进程控制一张卡。

LLMEngine 只需要调用 rank0 的 `ModelRunner.call("run", ...)`，rank0 会把“命令”广播给所有 worker（rank>0），让它们也执行同一个 `run()`，从而满足 NCCL 并行计算“所有 rank 必须同时进入同一段分布式计算”的要求。

```python
    def __init__(self, config: Config, rank: int, event: Event | list[Event]):
        ...

        if self.world_size > 1:
            if rank == 0:
                self.shm = SharedMemory(name="nanovllm", create=True, size=2**20)
                dist.barrier()
            else:
                dist.barrier()
                self.shm = SharedMemory(name="nanovllm")
                self.loop()

    def loop(self):
        while True:
            method_name, args = self.read_shm()
            self.call(method_name, *args)
            if method_name == "exit":
                break

    def call(self, method_name, *args):
        if self.world_size > 1 and self.rank == 0:
            self.write_shm(method_name, *args)
        method = getattr(self, method_name, None)
        return method(*args)

```

理解多进程协同的关键是 `loop` 和 `call` 方法：
- **共享内存的建立与同步屏障**：在 `__init__` 的末尾对不同 rank 的进程分别处理
    - **rank0**（driver）：
        - `self.shm = SharedMemory(name="nanovllm", create=True, size=2**20)`：创建一段具名共享内存（1MB）。
        - `dist.barrier()`：等所有 rank 到达这一点，确保 worker 之后打开 shm 时它已经存在。
    - **rank>0**（worker）：
        - `dist.barrier()`：等 rank0 创建 shm。
        - `self.shm = SharedMemory(name="nanovllm")`：以同名打开共享内存。
        - `self.loop()`：进入常驻循环等待命令。
    - 这里 `dist.barrier()` 是关键：它用 NCCL 组做同步，让“shm 创建/打开”的时序确定，否则 worker 可能抢跑打不开 shm。
    - 常驻 worker 会一直阻塞在 `loop()` 等待 rank0 发命令；而 rank0 是**控制面+计算面合一**的角色，会在主进程里被 LLMEngine 直接调用
- **`loop/call`**：动态分发 RPC，并保持所有 rank 同步执行
    - worker 的 `loop()` 是典型的事件驱动循环，它会在 worker 初始化后就进入这个循环，阻塞在 `read_shm()` 上：
        - `while True:` 永久运行
        - `method_name, args = self.read_shm()` 获取 rank0 发布的命令
        - `self.call(method_name, *args)`：执行同名方法
        - 如果 `method_name == "exit"` 就 `break` 退出循环
    - `call(method_name, *args)` 做了两件事：
        - 如果是 rank0 且 world_size>1：先通过 `self.write_shm(method_name, *args)` 把命令写入共享内存并 `event.set()` 唤醒所有 worker，将命令广播出去，然后 rank0 自己也执行同名方法；如果是 TP 场景中 rank>0 的 worker，则不会写共享内存，保持对 rank0 指挥的遵从
        - 然后 `method = getattr(self, method_name, None)` 动态取方法对象，再 `return method(*args)` 执行。`getattr()` 的本意是动态按字符串取方法对象，形成一个轻量的“命令分发器”。命令格式是 method_name + 若干 args 的序列化
        - 这保证了一个关键性质：**rank0 和所有 worker 会按完全相同的顺序执行同一组方法**（例如每轮都执行 `run(seqs, is_prefill)`），从而不会在 NCCL collective 上出现某些 rank 还在上一个 collective、另一些 rank 已经进入下一个 collective 的错位死锁。

---

```python
    def read_shm(self):
        assert self.world_size > 1 and self.rank > 0
        self.event.wait()
        n = int.from_bytes(self.shm.buf[0:4], "little")
        method_name, *args = pickle.loads(self.shm.buf[4:n+4])
        self.event.clear()
        return method_name, args

    def write_shm(self, method_name, *args):
        assert self.world_size > 1 and self.rank == 0
        data = pickle.dumps([method_name, *args])
        n = len(data)
        self.shm.buf[0:4] = n.to_bytes(4, "little")
        self.shm.buf[4:n+4] = data
        for event in self.event:
            event.set()
```

**共享内存的写入与读取**：`write_shm()` / `read_shm()`
- rank0 写命令用 `write_shm(method_name, *args)`：
    - `data = pickle.dumps([method_name, *args])`：参数 `[method_name, *args]` 表示一个列表，列表首元素是 `method_name`，后跟 `args` 元组展开后的所有元素。`pickle.dump(obj)` 把 `obj` 对象（这里是“方法名字符串 + 若干参数组成的列表”）序列化成字节串。
    - `n = len(data)` 获取序列化的字节串的长度，
    - 然后把该长度写入共享内存前 4 个字节：`self.shm.buf[0:4] = n.to_bytes(4, "little")` ， `self.shm.buf`：共享内存的字节视图（如 `memoryview` 或 `bytearray`），支持切片赋值。`n.to_bytes(4, "little")`：整数 `n` 的 `to_bytes` 方法，将整数转换为长度为4的字节串，字节序为小端（`"little"`）。参数：长度4，字节序。
    - 再把具体的方法名及参数的字节串 `data` 写到 `self.shm.buf[4:n+4]`，紧跟在长度信息之后
    - 最后 `for event in self.event: event.set()`：目前所有 rank>0 等待的数据已就绪，于是唤醒每个 worker（rank0 的 `self.event` 是事件列表，对每个事件对象调用 `set()` 方法，将其状态设为“已设置”，等价于唤醒所有等待该事件的进程）。
- worker 读命令用 `read_shm()`：
    - `self.event.wait()`：阻塞直到 rank0 调用 `event.set()` 发信号。
    - 按照小端序读取长度信息：`n = int.from_bytes(self.shm.buf[0:4], "little")`
    - 读取 payload 并反序列化：`method_name, *args = pickle.loads(self.shm.buf[4:n+4])`
        - 返回得到的指令 `method_name, args`（注意这里的 `args` 已经是列表形式，外层再做一次 `*args` 就能作为位置参数传给目标方法）。
    - `self.event.clear()`：重置信号，为下一次命令做准备。

这里有事件机制的语法点值得注意： `Event.wait()/set()/clear()`：这是一种“一次命令一次唤醒”的简单协议，配合共享内存上的内容就能完成广播。

---

```python
    def exit(self):
        if self.world_size > 1:
            self.shm.close()
            dist.barrier()
            if self.rank == 0:
                self.shm.unlink()
        if not self.enforce_eager:
            del self.graphs, self.graph_pool
        torch.cuda.synchronize()
        dist.destroy_process_group()
```

- exit 的协同退出协议（避免资源泄漏/死锁）
    - rank0 通过 `call("exit")` 广播 `exit` 命令；worker 在 `loop()` 里收到后也执行 `exit()`，然后 break。
    - `exit()` 里先关闭对共享内存的操作 `self.shm.close` （这一步只关闭访问，而不销毁 shm block），使用 `dist.barrier()` 再次同步后，再由 rank0 执行 `shm.unlink()` 删除共享内存命名对象，worker 只 `close()`。
    - `if not self.enforce_eager: del self.graphs, self.graph_pool` 如果启用了 cuda graph，还需释放 graph 相关资源
    - 最后 `dist.destroy_process_group()` 销毁通信组，结束 NCCL 资源。

回顾 engine 中的调用：
- LLMEngine 每步调用的是 `self.model_runner.call("run", seqs, is_prefill)`。
- Scheduler 决定 `seqs` 和 `is_prefill`；ModelRunner 广播并执行 `run`；然后 Scheduler `postprocess` 更新序列与 KV cache 状态。
- 这也是为什么 `seqs`（Sequence 对象列表）需要能被 pickle 序列化为字节串：因为 rank0 会把它们通过共享内存发给 worker。这个项目里 `Sequence` 看起来是纯 Python 数据结构（包含 token_ids、block_table 等），因此可被 pickle；若以后往里塞 GPU tensor/句柄，就会破坏这一假设。

#### 3. KV cache 分配

这里的核心思想是：**先让 ModelRunner 在 GPU 上算出“最多能放多少 KV cache blocks”**，把结果写回 `config.num_kvcache_blocks`，然后 Scheduler 再用这个上限去做 block 级别调度与抢占。达成的效果就是，在不超显存的前提下，尽可能多地分配块：

```python
    def allocate_kv_cache(self):
        config = self.config
        hf_config = config.hf_config
        free, total = torch.cuda.mem_get_info()
        used = total - free
        peak = torch.cuda.memory_stats()["allocated_bytes.all.peak"]
        current = torch.cuda.memory_stats()["allocated_bytes.all.current"]
        num_kv_heads = hf_config.num_key_value_heads // self.world_size
        head_dim = getattr(hf_config, "head_dim", hf_config.hidden_size // hf_config.num_attention_heads)
        block_bytes = 2 * hf_config.num_hidden_layers * self.block_size * num_kv_heads * head_dim * hf_config.torch_dtype.itemsize
        config.num_kvcache_blocks = int(total * config.gpu_memory_utilization - used - peak + current) // block_bytes
        assert config.num_kvcache_blocks > 0
        self.kv_cache = torch.empty(2, hf_config.num_hidden_layers, config.num_kvcache_blocks, self.block_size, num_kv_heads, head_dim)
        layer_id = 0
        for module in self.model.modules():
            if hasattr(module, "k_cache") and hasattr(module, "v_cache"):
                module.k_cache = self.kv_cache[0, layer_id]
                module.v_cache = self.kv_cache[1, layer_id]
                layer_id += 1
```

1.  `allocate_kv_cache()` 里**先做显存测量**：
    - `free, total = torch.cuda.mem_get_info()` 拿到当前设备空闲/总显存，这反映**整个GPU**——包括所有进程（Python、其他库、其他进程）占用的内存，数据直接来自CUDA运行时，反映的是操作系统级别的当前空闲物理内存。
    - 计算 `used = total - free`
    - 读取 `peak` / `current`（基于PyTorch allocator 的统计）用于更保守/可控的估算。这个数据**仅是 PyTorch 进程自身**，不包括其他库或其他进程，反映了 PyTorch 分配器的内部状态，其中 `peak` 是曾达到的最大分配值，`current` 是当前持有量。PyTorch为了性能会缓存已释放的内存块（即不立即归还给系统），因此 `current` 可能小于 `peak`，而空闲内存可能部分被PyTorch缓存占用。
2. **计算每个 block 需要多少字节**（`block_bytes`）：
    - `2 * num_layers * block_size * num_kv_heads * head_dim * dtype_size`，这里的 `2` 是 K 和 V 两份缓存
    - `num_kv_heads = hf_config.num_key_value_heads // world_size`：因为 tensor parallel 会把 KV heads 按 rank 切分，每张卡只存自己那份
    - `head_dim = getattr(hf_config, "head_dim", hf_config.hidden_size // hf_config.num_attention_heads)` 语义上是获取每个注意力头的维度，优先使用 `hf_config` 中可能存在的 `head_dim` 属性（某些模型直接定义），否则通过 `hidden_size` 除以注意力头数计算得到。`getattr(object, name, default) `：尝试获取对象的属性 `name`，若不存在则返回 `default`。此处 `default` 是表达式 `hf_config.hidden_size // hf_config.num_attention_heads` 的结果。
3. **决定可分配的 blocks 数**：
    - `config.num_kvcache_blocks = int(total * gpu_memory_utilization - used - peak + current) // block_bytes` 语义上是：给 KV cache 预留一部分可用显存（按 utilization），扣掉已经用掉的、再按 peak/current 做修正，最后除以每块大小得到块数写回到 config 中
    - 这里其实可以将公式改写为 `可用空间 = total * utilization - used - (peak - current)` ，其中 `total * utilization - used` 是基于当前全局使用情况，允许我们使用的最大空闲内存（考虑了利用率系数），`peak-current` 是PyTorch历史上曾分配但目前已释放的内存量（即PyTorch内部缓存的“空洞”）。这部分内存虽然未被PyTorch实际占用（`current` 不计入），但由于PyTorch的缓存机制，它们可能仍被分配器持有，并未真正归还给系统，导致实际可用的连续大块内存比 `free` 显示的少。当后续需要分配大块内存时，PyTorch可能先尝试重用这些缓存，从而可能增加实际物理占用（尽管 `free` 当时显示空闲）。为了安全起见，减去这部分“潜在占用”，确保即使PyTorch的缓存全部重新激活，也不会超过 `total * utilization` 的限制。
    - **直观理解**：假设PyTorch曾分配了10GB（峰值），现在只持有6GB（当前），那么有4GB已经释放但可能仍被PyTorch缓存。虽然此时`free`可能显示大量空闲，但如果我们再分配大块内存，PyTorch可能会先填充这4GB缓存，导致实际物理内存增长到接近10GB。因此，在计算可分配的新块时，减去这4GB（`peak - current`）可以防止未来因缓存重新激活而超出允许的总内存。**直接用 `free` 可能过于乐观**：因为 `free` 包含PyTorch缓存的空闲块，但这些空闲块可能不连续，无法满足大块连续分配的需求；同时，其他进程可能随时占用部分空闲内存。而通过减去`peak - current`，相当于保守地预留了PyTorch内部可能重新占用的空间，降低OOM风险。这是一种工程上的启发式方法，常见于一些高性能推理框架（如vLLM）中，旨在平衡内存利用率和稳定性。
4. **真正分配 KV cache tensor**：
    - `self.kv_cache = torch.empty(2, layers, num_blocks, block_size, num_kv_heads, head_dim)` 创建一个未初始化的 6 维张量作为 KV cache
5. **将切片绑定到模型各层**：按 DFS 遍历模型的所有子模块 `self.model.modules()` （`moduls` 是 `torch.nn.Module` 的方法，无参数，返回迭代器），找有同时有 `k_cache` 、 `v_cache` 属性的模块，逐层赋值，这样 attention 层在计算时就能直接读写这个大的 KV cache 张量。
    - `module.k_cache = self.kv_cache[0, layer_id]` 将全局KV缓存的第0维（K）和第`layer_id`层对应的切片视图赋值给模块的`k_cache`属性。该切片形状为`(config.num_kvcache_blocks, self.block_size, num_kv_heads, head_dim)`，与原张量共享内存。
    - `module.v_cache = self.kv_cache[1, layer_id]` 类似地，将第 1 维（V）对应层的切片赋值给模块的 `v_cache` 属性

与 Scheduler/BlockManager 的关键配合：

- 在 LLMEngine 里，先创建 `ModelRunner(config, 0, ...)`，它会在 `__init__` 中调用 `allocate_kv_cache()` 并写回 `config.num_kvcache_blocks`；**之后才创建 `Scheduler(config)`**。
- 而 Scheduler 在 `__init__` 里会立刻构造 `BlockManager(config.num_kvcache_blocks, config.kvcache_block_size)`。  
    所以这个顺序是刻意的：**必须先“测出并写回 blocks 上限”，再初始化调度器，否则 BlockManager 的容量就是错的**，会直接影响能否 allocate/append/preempt。

#### 4. prefill 输入打包

`prepare_prefill` 与 `prepare_decode` 这两个函数是 Model Runner 中最具数据平面特色的部分，它们将 `seqs` 列表转换为模型 forward 所需的张量。

**`prepare_prefill`** 处理 prefill 阶段。prefill 的目标：一次性把多条序列的“尚未缓存的 prompt tokens”送进模型，让模型建立/填充 KV cache。

```python
    def prepare_block_tables(self, seqs: list[Sequence]):
        """
        将一批seqs的block table填充至相同长度，并转换为GPU tensor，
        供后续注意力计算使用（在需要访问已缓存KV的场景）
        """
        # 计算所有序列中block table的最大长度（每个序列所占用的物理块数）
        max_len = max(len(seq.block_table) for seq in seqs)
        # 对每个seq，将其block table复制，并在末尾填充-1表示无效块
        block_tables = [seq.block_table + [-1] * (max_len - len(seq.block_table)) for seq in seqs]
        # 将二维列表转换为torch.int32类型的tensor，先固定在pinned memory，再异步复制到GPU
        block_tables = torch.tensor(block_tables, dtype=torch.int32, pin_memory=True).cuda(non_blocking=True)
        return block_tables

    def prepare_prefill(self, seqs: list[Sequence]):
        input_ids = []
        positions = []
        cu_seqlens_q = [0]
        cu_seqlens_k = [0]
        max_seqlen_q = 0
        max_seqlen_k = 0
        slot_mapping = []
        block_tables = None
        for seq in seqs:
            seqlen = len(seq)
            input_ids.extend(seq[seq.num_cached_tokens:])
            positions.extend(list(range(seq.num_cached_tokens, seqlen)))
            seqlen_q = seqlen - seq.num_cached_tokens
            seqlen_k = seqlen
            cu_seqlens_q.append(cu_seqlens_q[-1] + seqlen_q)
            cu_seqlens_k.append(cu_seqlens_k[-1] + seqlen_k)
            max_seqlen_q = max(seqlen_q, max_seqlen_q)
            max_seqlen_k = max(seqlen_k, max_seqlen_k)
            if not seq.block_table:    # warmup
                continue
            for i in range(seq.num_cached_blocks, seq.num_blocks):
                start = seq.block_table[i] * self.block_size
                if i != seq.num_blocks - 1:
                    end = start + self.block_size
                else:
                    end = start + seq.last_block_num_tokens 
                slot_mapping.extend(list(range(start, end)))
        if cu_seqlens_k[-1] > cu_seqlens_q[-1]:    # prefix cache
            block_tables = self.prepare_block_tables(seqs)
        input_ids = torch.tensor(input_ids, dtype=torch.int64, pin_memory=True).cuda(non_blocking=True)
        positions = torch.tensor(positions, dtype=torch.int64, pin_memory=True).cuda(non_blocking=True)
        cu_seqlens_q = torch.tensor(cu_seqlens_q, dtype=torch.int32, pin_memory=True).cuda(non_blocking=True)
        cu_seqlens_k = torch.tensor(cu_seqlens_k, dtype=torch.int32, pin_memory=True).cuda(non_blocking=True)
        slot_mapping = torch.tensor(slot_mapping, dtype=torch.int32, pin_memory=True).cuda(non_blocking=True)
        set_context(True, cu_seqlens_q, cu_seqlens_k, max_seqlen_q, max_seqlen_k, slot_mapping, None, block_tables)
        return input_ids, positions
```

`prepare_prefill(seqs)` 的结构是典型的“收集 Python 列表 → 转 GPU tensor”流程：

- Python 列表阶段（易读但慢，最后统一 tensor 化）：
    - 初始化若干变量：
        - `input_ids`：所有序列中新token（尚未缓存）的ID列表。
        - `positions`：每个新token对应的位置索引（从已缓存长度开始）。
        - `cu_seqlens_q`：累积query长度（每个序列的新token数累加），用于变长注意力，首元素为0。
        - `cu_seqlens_k`：累积key/value长度（每个序列的完整长度累加），用于指示KV缓存范围。
        - `max_seqlen_q`：所有序列中query部分的最大长度。
        - `max_seqlen_k`：所有序列中完整长度的最大值。
        - `slot_mapping`：每个新token应写入的KV缓存槽位（物理地址）列表。
        - `block_tables`：可能为None，若需要则后面调用 `prepare_block_tables` 生成。
    - 接下来对每个 seq 进行处理：
        - `input_ids.extend(seq[seq.num_cached_tokens:])` **只取“还没缓存进 KV 的那段 token”**，`extend` 将切片取出的元素逐个加入 `input_ids` 列表。`seq.num_cached_tokens` 是 Sequence 里记录的“已缓存长度”，它由 BlockManager 的 allocate/append 过程推进（Sequence/BlockManager 在 engine 里配合维护）。
        - `positions.extend(range(seq.num_cached_tokens, seqlen))`  **为每个新 token 生成位置索引**（从 `num_cached_tokens` 到 `seqlen-1`），位置编码 `position id` 要与 `input_ids` 对齐。
        - `seqlen_q = seqlen - seq.num_cached_tokens` 是本次需要计算的 query 长度（即新 token 数），`seqlen_k = seqlen` 是完整的 key/value 长度（因为需要用到所有已缓存的 KV）
        - `cu_seqlens_q` / `cu_seqlens_k`  **相应地更新累计长度列表**，分别追加当前序列的 query 和 key 长度，以及对应的最大值 `max_seqlen_q` 和 `max_seqlen_k`。这是给一些 fused attention / ragged batch 形式用的“累计长度数组”（前缀和），用来描述每条序列在拼接后的大张量里占的区间。这里同时算 q/k 两套长度，是为了支持 prefix cache 等场景（q 长度可能小于 k 长度）。
        - `if not seq.block_table: continue`  warmup 情况下 Sequence 没有 block_table（因为不是走正常调度路径），就跳过 slot_mapping 写入逻辑。
        - `slot_mapping`：把“本次要写入 KV cache 的 token”**映射到“KV cache 大数组里的具体槽位索引”**，通过 `seq.block_table`（每个逻辑 block 映射到物理 block id）和 `block_size` 计算出每个 token 应写到 KV cache 的哪个位置。
            - 首先遍历该序列中新占用的每个块 `seq.num_cached_blocks, seq.num_blocks` ，计算该块在 KV cache 中的物理起始位置 `start` ，并根据是否是最后一个块确定结束位置 `end` （末块用 `seq.last_block_num_tokens` 控制边界）
            - 然后将该块内所有槽位索引（从 `start` 到 `end-1`）添加到 `slot_mapping`，这些槽位按顺序对应每个新 token 的写入位置
    - `block_tables`：只在检测到 “prefix cache” 情况才准备  `if cu_seqlens_k[-1] > cu_seqlens_q[-1]: block_tables = self.prepare_block_tables(seqs)` 。**如果所有序列的完整长度总和（KV 长度）大于新 token 长度总和，说明存在已缓存的 token（即 prefix cache），此时就要准备 block table 来索引这些缓存**——调用 `prepare_block_tables` 生成 block table，把每条 seq 的 block_table pad 到同长度（用 -1 补齐），然后搬到 GPU，这样模型侧可以按表查 KV cache block。
- Tensor 化 + 异步拷贝：
    - 将所有列表转换为对应数据类型的 GPU tensor：`torch.tensor(..., pin_memory=True).cuda(non_blocking=True)`  ，这里使用锁页内存和异步传输以提高效率——`pin_memory=True` 让 CPU 内存页锁定，配合 `non_blocking=True` 允许 H2D 拷贝更高效/可异步（前提是环境支持）。
- 最后用 `set_context(...)` 把这些“本次 batch 的元信息”塞进一个全局/线程局部的上下文里：`set_context(True, cu_seqlens_q, cu_seqlens_k, max_seqlen_q, max_seqlen_k, slot_mapping, None, block_tables)`  这样模型 forward 时（尤其 attention 层）可以在不改函数签名的情况下，从 context 里读到 `slot_mapping`/`block_tables` 等信息。

与其他 engine 组件的配合点：

- Scheduler/BlockManager 在 prefill 前已经为 seq 分配好了 `block_table`（物理块 id），ModelRunner 只是读取它来生成 slot_mapping。
- `seq.num_cached_tokens/num_cached_blocks/num_blocks/...` 的推进通常跟 block 分配/追加绑定：Scheduler 决定本轮是 prefill 还是 decode，BlockManager 决定能不能 allocate/append，并更新 Sequence 的这些计数。

> [!NOTE] 理解 pinned memory 和异步传输机制
> `torch.tensor(..., dtype, pin_memory=True).cuda(non_blocking=True)` 是 PyTorch 中一种常用的高效数据准备模式，它结合了**页锁定内存**（pinned memory）和**异步 GPU 传输**，旨在最小化 CPU 与 GPU 之间的数据传输开销。下面详细解释其工作原理、内存位置以及性能影响。
> 
> ---
> 
> ### 1. `pin_memory` 是 CPU 侧内存
> 
> - **`pin_memory=True`** 指示 PyTorch 在 CPU 上分配**页锁定内存**（也称为固定内存或不可分页内存）。这种内存的特点是：
>     - 不会被操作系统的虚拟内存机制交换到磁盘上，物理地址固定。
>     - 允许 GPU 通过 DMA 直接读写，无需 CPU 介入数据拷贝。
> - 因此，该张量的数据实际存储在 **CPU 内存**中，但经过了特殊标记，使其对 GPU 可见且可高效访问。
> 
> ---
> 
> ### 2. 为什么页锁定内存能与异步传输配合提高效率？
> 
> #### 常规（可分页）内存的传输过程
> - 默认情况下，`torch.tensor(...)` 分配的是常规的可分页内存（pageable memory）。当调用 `.cuda()` 进行同步传输时，CUDA 驱动必须：
>     1. 在 CPU 上分配一个临时的页锁定缓冲区（由 CUDA 管理）。
>     2. 将数据从可分页内存拷贝到这个临时缓冲区。
>     3. 启动 DMA 将数据从临时缓冲区传输到 GPU 显存。
>     4. 释放临时缓冲区。
> - 这个过程涉及**两次拷贝**（可分页→临时缓冲区→GPU），且传输是**同步**的，会阻塞 CPU 后续指令，直到传输完成。
> 
> #### 页锁定内存的异步传输
> - 使用 `pin_memory=True` 后，数据已经位于页锁定内存中。调用 `.cuda(non_blocking=True)` 时：
>     1. CUDA 可以直接通过 DMA 将数据从页锁定内存传输到 GPU，**无需临时缓冲区和额外拷贝**。
>     2. 由于 `non_blocking=True`，该传输是**异步**的：函数立即返回，CPU 可以继续执行后续指令，而数据传输在后台进行。
> - 这样既**减少了一次内存拷贝**，又允许**计算与传输重叠**，从而显著提升整体吞吐量。
> 
> ---
> 
> ### 3. 将 Python 列表转换为张量的性能提升有多大？
> 
> 这个问题需要拆分为两个阶段：
> 
> #### (a) Python 列表 → CPU 张量（`torch.tensor`）
> - 无论是否使用 `pin_memory`，从 Python 列表创建张量本身都会进行**类型转换和内存复制**：将 Python 对象（如 `int`、`float`）转换为底层 C/C++ 数据（如 `int64`、`float32`），并填充到新分配的 CPU 内存中。
> - 这部分开销主要取决于列表长度和元素类型，与 `pin_memory` 无关。例如，百万级长度的列表转换可能需要几十毫秒，但这是不可避免的预处理代价。
> 
> #### (b) CPU 张量 → GPU 张量（`.cuda()`）
> - **若不使用 pinned memory**：`tensor.cuda()` 会同步执行上述两次拷贝，耗时与数据量成正比（约 PCIe 带宽上限）。对于大张量，这可能成为瓶颈。
> - **若使用 pinned memory + 异步传输**：传输时间与前者相同（受 PCIe 带宽限制），但**不阻塞 CPU**，且减少了中间拷贝。这使得 CPU 可以在传输期间继续执行其他任务（如准备下一批数据），从而**隐藏传输延迟**。
> 
> #### 性能提升量化
> - **传输速度**：在理想情况下，两者都能达到 PCIe 带宽（例如 PCIe 4.0 x16 约 32 GB/s）。但同步传输会阻塞 CPU，而异步传输允许重叠。
> - **CPU 利用率**：对于需要连续准备数据并送 GPU 的场景（如训练循环），使用 pinned memory + 异步传输可以显著提高 CPU 有效利用率，整体性能可能提升 20%~50% 甚至更高（取决于计算与传输的比例）。
> - **实际收益**：如果数据量较小（如 < 1 MB），传输延迟本就可忽略，收益不大；但对于大尺寸张量（如大模型推理时的 KV 缓存、大批量输入），收益非常显著。

#### 5. deocde 输入打包

decode 的目标：对一批正在 running 的序列，各生成 **下一个 token**。因此每条序列本轮只需要喂一个 token（上一步生成的 token），并且要告诉模型“上下文长度”和“下一 token 应写到 KV cache 的哪个槽”。

```python
    def prepare_decode(self, seqs: list[Sequence]):
        input_ids = []
        positions = []
        slot_mapping = []
        context_lens = []
        for seq in seqs:
            input_ids.append(seq.last_token)
            positions.append(len(seq) - 1)
            context_lens.append(len(seq))
            slot_mapping.append(seq.block_table[-1] * self.block_size + seq.last_block_num_tokens  - 1)
        input_ids = torch.tensor(input_ids, dtype=torch.int64, pin_memory=True).cuda(non_blocking=True)
        positions = torch.tensor(positions, dtype=torch.int64, pin_memory=True).cuda(non_blocking=True)
        slot_mapping = torch.tensor(slot_mapping, dtype=torch.int32, pin_memory=True).cuda(non_blocking=True)
        context_lens = torch.tensor(context_lens, dtype=torch.int32, pin_memory=True).cuda(non_blocking=True)
        block_tables = self.prepare_block_tables(seqs)
        set_context(False, slot_mapping=slot_mapping, context_lens=context_lens, block_tables=block_tables)
        return input_ids, positions
```

`prepare_decode(seqs)` 的数据组织更简单：
- 初始化若干列表：
    - `input_ids`：存储每个序列的最后一个 token 的 ID，作为当前解码步骤的输入。
    - `positions`：存储每个序列最后一个 token 的位置索引（从 0 开始）。
    - `slot_mapping`：存储每个序列最后一个 token 应写入的 KV 缓存物理槽位（一个整数索引）。
    - `context_lens`：存储每个序列的当前总长度（即已生成的 token 数），用于注意力计算中的上下文范围。
- 对每个 seq 进行处理：
    - `input_ids.append(seq.last_token)`：每条 seq 只输入一个 token，`last_token` 是该序列最新生成的 token
    - `positions.append(len(seq) - 1)`：该 token 的 position id
    - `context_lens.append(len(seq))`：每条序列当前上下文长度（用于 attention mask/位置相关逻辑）
    - 计算当前 token 对应 KV cache 的槽位 `slot_mapping.append(seq.block_table[-1] * block_size + seq.last_block_num_tokens - 1)`：先获取该 seq 的 block table 最后一个元素，即最后一个物理块的索引，  再通过 `last_block_num_tokens` 得到最后一个块中实际存储的 token 数（可能不满一个 `block_size`），这就是用“最后一个 block + 块内偏移”来算出槽位索引。
- `block_tables = self.prepare_block_tables(seqs)`：decode 每次都准备 block_tables（因为 decode 始终需要 block table 来读取历史 KV）
- `set_context(False, slot_mapping=..., context_lens=..., block_tables=...)`

与 Scheduler 的配合点：

- Scheduler 在 decode 分支里会调用 `block_manager.may_append(seq)`，语义上就是“我准备让这条 seq 追加一个 token 了”。Sequence 的 `last_block_num_tokens`、是否需要新块等状态，会与 BlockManager 的逻辑联动，从而保证这里的 slot_mapping 计算正确。

> [!NOTE] prefill 和 decode 中构建 `block_table` 的差异
> 在预填充（prefill）和解码（decode）阶段，`block_table` 的必要性取决于是否需要在注意力计算中**访问已有的 KV 缓存**。具体来说：
> 
> ---
> 
> ### 预填充阶段（prefill）
> - **无 prefix cache（无缓存）**：  
>   所有 token 都是新的，一次性计算整个序列的注意力。此时，KV 缓存全部由本次计算写入，无需读取之前存储的 KV。因此，仅需通过 `slot_mapping` 知道每个新 token 应写入的槽位即可，注意力核可以直接使用当前计算的 K、V 张量，**不需要块表**。
> - **有 prefix cache（已有缓存）**：  
>   序列的一部分 token 已经存储在 KV 缓存中（例如前缀相同）。预填充时需要同时使用已有缓存和计算新 token 的注意力。为了定位已有缓存中每个 token 的物理位置，必须依靠 `block_table` 将逻辑位置（token 索引）映射到物理块。因此，**只有在存在 prefix cache 时才需要构建块表**。
> 
> ---
> 
> ### 解码阶段（decode）
> - **始终需要块表**：  
>   解码是自回归生成，每一步只生成一个新 token，但注意力计算需要读取该序列**之前所有 token**的 KV 缓存。这些缓存分布在不同的物理块中，必须通过 `block_table` 快速索引每个历史 token 所在的块。即使序列没有任何历史缓存（第一次解码），也会在第一次生成后写入新块，后续步骤仍需读取这些块。因此，解码阶段**必须为每个序列维护块表**，以便注意力核高效访问已缓存的 KV。
> 
> ---
> 
> ### 本质区别
> - **prefill**：一次性处理整个序列，如果所有 token 都是新的，则注意力计算不依赖外部存储；如果有前缀缓存，则需要块表来读取已缓存的部分。
> - **decode**：逐步生成，每一步都依赖整个历史缓存，因此块表是不可或缺的索引结构。
> 
> 这种设计平衡了计算效率和内存访问需求，避免了不必要的块表构建开销，同时保证了解码阶段的通用性。

#### 6. 模型执行与采样

这一部分回答两个问题：模型到底怎么跑、token 怎么选出来。

```python
    def prepare_sample(self, seqs: list[Sequence]):
        # 提取这一批seq的temperature参数
        temperatures = []
        for seq in seqs:
            temperatures.append(seq.temperature)
        # 转换成GPU tensor并异步复制
        temperatures = torch.tensor(temperatures, dtype=torch.float32, pin_memory=True).cuda(non_blocking=True)
        return temperatures

    @torch.inference_mode()
    def run_model(self, input_ids: torch.Tensor, positions: torch.Tensor, is_prefill: bool):
        if is_prefill or self.enforce_eager or input_ids.size(0) > 512:
            return self.model.compute_logits(self.model(input_ids, positions))
        else:
            bs = input_ids.size(0)
            context = get_context()
            graph = self.graphs[next(x for x in self.graph_bs if x >= bs)]
            graph_vars = self.graph_vars
            graph_vars["input_ids"][:bs] = input_ids
            graph_vars["positions"][:bs] = positions
            graph_vars["slot_mapping"].fill_(-1)
            graph_vars["slot_mapping"][:bs] = context.slot_mapping
            graph_vars["context_lens"].zero_()
            graph_vars["context_lens"][:bs] = context.context_lens
            graph_vars["block_tables"][:bs, :context.block_tables.size(1)] = context.block_tables
            graph.replay()
            return self.model.compute_logits(graph_vars["outputs"][:bs])


    def run(self, seqs: list[Sequence], is_prefill: bool) -> list[int]:
        input_ids, positions = self.prepare_prefill(seqs) if is_prefill else self.prepare_decode(seqs)
        temperatures = self.prepare_sample(seqs) if self.rank == 0 else None
        logits = self.run_model(input_ids, positions, is_prefill)
        token_ids = self.sampler(logits, temperatures).tolist() if self.rank == 0 else None
        reset_context()
        return token_ids
```

- `@torch.inference_mode()` 装饰器的语义是关闭 autograd 、减少开销，确保不会构建反向图，适用于推理加速并减少内存消耗。
- `run_model(...)` 是实际执行 forward 的地方，它根据 `is_prefill` 和配置选择执行路径：
    - **eager 路径**（prefill 或强制 eager 或 batchsize 太大）：
        - `self.model(input_ids, positions)` 调用模型跑前向传播，得到 hidden states
        - `self.model.compute_logits(...)` 转 logits
    - **CUDA Graph 路径**（小 batch 的 decode 且设备允许）：
        - 先获取当前批次大小 `bs` 和当前进程的上下文 `context` （包含 `slot_mapping`、`context_lens`、`block_tables` 等）
        - 然后选择一个“能容纳当前 batchsize 的图”：`graph = self.graphs[next(x for x in self.graph_bs if x >= bs)]` ，从预先编译的 CUDA Graph 字典中选择一个图，该图的批次大小是大于等于当前批次的最小值（`self.graph_bs` 是支持的批次大小列表，如 `[1,2,4,8,...]`）。`next` 返回满足条件的第一个元素。
        - `graph_vars = self.graph_vars`：获取与图关联的输入/输出张量字典（这些张量在编译图时已分配并固定在 GPU 上）。
        - 把本轮的 input_ids/positions/context（slot_mapping/context_lens/block_tables）写进预分配的 `graph_vars` 张量切片。具体来说，`input_ids` / `positions` 会被复制到图的输入张量的前 `bs` 行；`slot_mapping` 张量先填充为-1（表示无效），然后将上下文中的 `slot_mapping` 复制到前 `bs` 行; `context_lens` 则预填充为全 0，复制行为类似；`block_tables` 复制到图张量前 `bs` 行时，需要考虑列的匹配
        - `graph.replay()` 重放 cuda graph，模型快速前向传播（无需 python 解释器逐层调用）得到 outputs，再 `compute_logits`（从图的输出张量 `outputs` 中取出前 `bs` 行，传入 `compute_logits` 得到最终 logits）
        - 这样能显著减少 Python 调度和 kernel launch 开销，提升 decode 吞吐。
- `run(seqs, is_prefill)` 是 LLMEngine 真正调用的入口（通过 `call("run", ...)` 间接调用），串联了整个 forward 流程：
    1. 先按推理的不同阶段分别进行打包输入：
        - prefill：`input_ids, positions = prepare_prefill(...)`
        - decode：`input_ids, positions = prepare_decode(...)`
    2. 只有 rank0 准备采样温度：
        - `temperatures = prepare_sample(seqs) if self.rank == 0 else None`  这是典型的 tensor parallel 模式：其它 rank 只参与算 logits，不负责采样决策与输出。
    3. 执行模型： `logits = self.run_model(input_ids, positions, is_prefill)` ，所有 rank 都会执行 `run_model`，得到 logits 张量
    4. token 采样：
        - `token_ids = self.sampler(logits, temperatures).tolist() if self.rank == 0 else None`  sampler 接收logits 和温度张量，返回采样后的 token ID 张量（形状为 `(batch_size,)`，在 GPU 上）。 `.tolist()`：将 GPU 张量转换为 Python 列表（仅在主进程）。
    5. `reset_context()` 清理本轮 context，避免下轮复用脏数据
    6. 返回 `token_ids`（只有 rank0 有值）

与 LLMEngine/Scheduler 的闭环关系：

- Scheduler 负责决定本轮 seqs & 阶段；ModelRunner 负责产出每条 seq 的 token_id；Scheduler.postprocess 再把 token append 进 Sequence 并判断 eos/finish、释放块、维护 running/waiting。
- 也就是说：**Runner 不负责“序列结束/资源回收”，它只负责“算 + 采样”。调度状态机完全在 Scheduler。**

> [!NOTE] CUDA graph 为什么只用于 decode？
> 在 `run_model` 方法中，CUDA Graph 仅用于解码（`is_prefill=False`）而非预填充（`is_prefill=True`），这主要源于两者在计算模式、输入动态性和性能优化目标上的本质差异。
> 
> ---
> 
> ### 1. 预填充阶段（prefill）的特性
> - **一次性处理长序列**：预填充将整个提示（prompt）输入模型，一次性计算所有 token 的注意力。序列长度可能很大（例如几百到几千 token），且批次内各序列长度可能不同。
> - **计算图动态变化**：由于采用变长注意力（如 FlashAttention 等实现），实际执行的内核依赖于 `cu_seqlens` 和 `max_seqlen` 等参数，这些参数随批次变化。即使模型结构固定，具体运算的循环次数、内存布局等也会因序列长度而异。
> - **形状不确定性**：`input_ids` 和 `positions` 的总长度（拼接后的长度）随批次变化，导致模型前向传播中许多张量的形状不固定。CUDA Graph 要求所有内核调用及其参数（包括张量形状）在捕获时完全确定，任何变化都需要重新捕获，因此无法有效复用。
> - **计算密集，内核启动开销占比小**：预填充阶段计算量大，GPU 内核执行时间远大于启动开销，因此即使不使用 CUDA Graph ，性能也已接近最优。
> 
> ### 2. 解码阶段（decode）的特性
> - **逐个 token 生成**：每次只处理一个 token（每个序列贡献一个 token），输入形状固定为 `(batch_size, 1)`，且批次大小通常在较小范围内稳定（如 1~256）。
> - **计算模式高度重复**：每次迭代执行相同的模型层，只是输入的 token ID 和位置索引不同。注意力机制需要读取已有的 KV 缓存，但缓存索引（通过 `slot_mapping` 和 `block_tables` 提供）也是固定模式的张量操作。
> - **内核启动开销成为瓶颈**：解码阶段单次前向传播计算量小，GPU 内核启动的 CPU 开销相对显著。CUDA Graph 通过将一系列内核调用“固化”为单个图执行，消除了每次迭代的 CPU 调度开销，从而显著提升吞吐量。
> - **图可预编译**：对于常用的批次大小（如 1, 2, 4, 8, ...），可以预先捕获 CUDA Graph ，并预留足够大的张量空间（例如 `graph_vars` 中的张量按最大支持批次分配），运行时只需更新输入数据并重放图。
> 
> ### 3. 代码中的具体体现
> - 条件分支中，即使 `is_prefill=False`，若批次大小超过 512 或强制 eager 模式，也会回退到 eager，因为预编译的图可能未覆盖超大批次，或超大批次下内核启动开销占比已不显著。
> - 使用 CUDA Graph 时，需要从 `get_context()` 获取固定的上下文数据（`slot_mapping`、`context_lens`、`block_tables`），这些数据在图捕获时形状已固定（例如 `block_tables` 的第二维为最大块数），运行时仅复制前 `bs` 行，保证了图执行时所有张量维度与捕获时一致。
> - 预填充阶段即便有上下文（如 prefix cache），其 `slot_mapping` 长度也随新 token 数变化，无法适配固定形状的图输入。
> 
> ### 4. 总结
> - **预填充**：因输入长度动态、计算图变化大，不适合 CUDA Graph ，直接使用 eager 模式更灵活。
> - **解码**：因输入形状固定、计算重复且内核启动开销占比高，CUDA Graph 能大幅降低延迟，提高吞吐。
> 
> 这种设计平衡了灵活性与性能，是许多推理引擎（如 vLLM、TensorRT-LLM）的常见优化策略。

#### 7. 性能优化

这部分覆盖 `capture_cudagraph()`、`run_model()` 的图路径、以及 `exit()` 的释放顺序。它们共同目标是：**decode 阶段小 batch 高频调用时减少 Python 与 kernel launch 的开销，同时保证退出干净**。

```python
    @torch.inference_mode()
    def capture_cudagraph(self):
        config = self.config
        hf_config = config.hf_config
        max_bs = min(self.config.max_num_seqs, 512)
        max_num_blocks = (config.max_model_len + self.block_size - 1) // self.block_size
        input_ids = torch.zeros(max_bs, dtype=torch.int64)
        positions = torch.zeros(max_bs, dtype=torch.int64)
        slot_mapping = torch.zeros(max_bs, dtype=torch.int32)
        context_lens = torch.zeros(max_bs, dtype=torch.int32)
        block_tables = torch.zeros(max_bs, max_num_blocks, dtype=torch.int32)
        outputs = torch.zeros(max_bs, hf_config.hidden_size)
        self.graph_bs = [1, 2, 4, 8] + list(range(16, max_bs + 1, 16))
        self.graphs = {}
        self.graph_pool = None

        for bs in reversed(self.graph_bs):
            graph = torch.cuda.CUDAGraph()
            set_context(False, slot_mapping=slot_mapping[:bs], context_lens=context_lens[:bs], block_tables=block_tables[:bs])
            outputs[:bs] = self.model(input_ids[:bs], positions[:bs])    # warmup
            with torch.cuda.graph(graph, self.graph_pool):
                outputs[:bs] = self.model(input_ids[:bs], positions[:bs])    # capture
            if self.graph_pool is None:
                self.graph_pool = graph.pool()
            self.graphs[bs] = graph
            torch.cuda.synchronize()
            reset_context()

        self.graph_vars = dict(
            input_ids=input_ids,
            positions=positions,
            slot_mapping=slot_mapping,
            context_lens=context_lens,
            block_tables=block_tables,
            outputs=outputs,
        )
```

`capture_cudagraph` 方法通过预编译不同批次大小的 CUDA Graph ，以加速 decode 阶段的自回归生成。CUDA Graph 通过捕获一系列 GPU 内核调用并将其固化，消除每次迭代的 CPU 调度开销，**特别适合计算模式固定、输入形状不变的场景**（如 decode 时 per step per token 的模式）。下面逐句解释其语义、语法，并结合推理优化和 CUDA Graph 机制进行说明。

CUDA Graph 捕获函数 `capture_cudagraph` 是 decode 阶段性能优化的核心。它会预先为模型 forward 捕获一系列 batch size 的图（`self.graph_bs`），例如 `[1, 2, 4, 8, 16, 32, ...]`，并把每个 bs 对应的图存到 `self.graphs[bs]`。捕获过程如下：

1. 获取配置与计算常量：`config`、`hf_config`、`max_bs`、`max_num_blocks`，其中 `max_num_blocks` 是每个序列可能占用的最大物理块数，由模型最大上下文长度（`max_model_len`）和块大小（`block_size`）计算得出（向上取整）。该值用于预先分配 block table 张量的第二维。
2. **为图捕获预分配固定形状的“输入占位张量”和“输出缓冲”**：
    - 输入占位张量 `input_ids` 、`positions`、`slot_mapping`、`context_lens`、`block_tables`）和输出张量 `outputs`
    - 注意这里没有显式 `.cuda()`，但因为 `__init__` 前面设置过默认 device 为 cuda，所以它们会**创建在 GPU**（这是前面“默认 device 顺序”的直接用途）。
3. 准备不同 bs 大小的桶与存储结构
    - `self.graph_bs`：需要捕获图的批次大小列表。包含小批量（1,2,4,8）以及从16开始步长为16直到 `max_bs` 的值。这种选择覆盖了常见批次，且避免为每个可能的整数都捕获图，节省显存和时间。
    - `self.graphs`：字典，键为批次大小，值为对应的 `CUDAGraph` 对象。
    - `self.graph_pool`：内存池，用于多个图之间共享内存，减少内存占用和分配开销。初始为 `None`，第一个图创建后获取其内存池，后续图使用同一池。
4. **对每个 bs 遍历捕获图**：
    - 注意遍历方向是从大到小的**反向遍历**，原因在于 CUDA Graph 的内存池一旦创建，后续图可以复用。如果从小开始，大图可能需要扩展内存池，导致重新分配；而从大开始，内存池一次性分配足够大的空间，后续小图直接复用，效率更高。这是一种常见优化。
    - `graph = torch.cuda.CUDAGraph()` 实例化一个 CUDA graph 对象
    - `set_context(False, slot_mapping=..., context_lens=..., block_tables=...)`：把 decode 所需上下文绑定到固定切片张量。这里传入的是切片视图，即只使用前 `bs` 个元素。这些张量将在图中被引用，因此切片视图需要确保其底层存储是连续的，且后续可被图捕获。
    - `outputs[:bs] = self.model(input_ids[:bs], positions[:bs])`：在实际捕获图之前，先执行一次模型前向，进行一次 warmup ，让 GPU 完成必要的初始化（如内核加载、缓存分配等），**避免这些启动开销被捕获进图中**，导致图执行时包含不必要的延迟。预热后，后续捕获的操作会更“纯净”。
    - `with torch.cuda.graph(graph, self.graph_pool): outputs[:bs] = self.model(...)`：进入 cuda graph 的上下文，开始捕获图
        - `torch.cuda.graph(graph, self.graph_pool)`：上下文管理器，在此上下文中执行的所有 CUDA 操作都会被记录到 `graph` 中。如果 `self.graph_pool` 非空，则使用该内存池，使新图与之前图共享内存，提高内存效率。
        - **捕获内容**：再次执行同样的 forward，捕获模型前向传播的整个计算过程，包括所有内核调用、内存读写等。由于输入是占位张量，图中记录的是对固定内存地址的操作。后续执行图时，只需更新这些内存地址的内容（即输入数据），然后重放图即可。
    - 首次捕获后 `self.graph_pool = graph.pool()`：复用第一个图的内存池，减少碎片并让各图共享分配池
    - `self.graphs[bs] = graph` 将捕获好的图按批次大小存入字典，供后续 `run_model` 中使用。
    - `torch.cuda.synchronize()` 等待当前流中所有 CUDA 操作完成，确保图捕获彻底结束，避免后续操作干扰。
    - `reset_context()` 清理上下文，防止影响下一次循环的 `set_context` 设置。
5. 最后把这些预分配的张量塞进 `self.graph_vars` 字典，供 `run_model()` 重放前写入新数据。
    - 当实际执行解码时，会将这些张量的内容更新为当前批次的数据，然后重放对应批次大小的图。
    - 注意：这些张量在捕获时已被图中的操作引用，因此它们的**内存地址**固定，图重放时直接操作这些地址。更新数据时需通过原地操作（如切片赋值）修改内容，不能重新分配新张量。

6. 回顾 `run_model` 的图重放路径：根据当前 batch size 选择合适的图，将真实数据复制到占位张量的切片中，然后执行 `graph.replay()`，以极低的 CPU 开销完成 forward。
    - 当 decode 阶段且满足图条件时：`bs = input_ids.size(0)`，`graph = self.graphs[next(x for x in self.graph_bs if x >= bs)]`：选择最小的能容纳当前 bs 的图（分桶策略）。
    - 把本轮数据写入图的固定缓冲：
        - `graph_vars["input_ids"][:bs] = input_ids`
        - `graph_vars["positions"][:bs] = positions`
        - `graph_vars["slot_mapping"].fill_(-1)` 再写入前 bs（这是为了避免上一次更大 bs 的残留影响本次）
        - `context_lens`/`block_tables` 同理做覆盖或清零再写入
    - `graph.replay()`：以极低 CPU 开销重放已捕获的 kernel 序列，产出 `graph_vars["outputs"]`
    - `return self.model.compute_logits(graph_vars["outputs"][:bs])`

与 `prepare_decode` 的配合点：

- `prepare_decode` 每轮都会 `set_context(False, slot_mapping, context_lens, block_tables)`，而图重放路径并不直接读取那个 context 对象，而是把 context 数据写进了 `graph_vars` 里，再 replay。也就是说：图模式下的“上下文输入”是通过固定张量喂进去的。

与 LLMEngine 的配合点：

- LLMEngine 在 `exit()` 里对 rank0 调用 `self.model_runner.call("exit")`，会广播给所有 worker，确保它们也执行退出清理并跳出 `loop()`；然后主进程再 `join()` worker 进程，完成整个系统关停。

> [!NOTE] 生命周期与资源回收：exit 的顺序为什么这样写  
> 
> `exit()` 的顺序大致是：shm 关闭/同步 → cudagraph 释放 → CUDA 同步 → 销毁进程组。
> 
> - shm：
>     - 所有 rank `self.shm.close()`
>     - `dist.barrier()`：确保所有人都不再使用 shm
>     - rank0 `self.shm.unlink()`：删除共享内存对象（只允许创建者 unlink，避免双删）
> - cudagraph：
>     - `if not self.enforce_eager: del self.graphs, self.graph_pool`：释放图与内存池引用
> - `torch.cuda.synchronize()`：确保所有 CUDA 工作完成再销毁通信组，避免“还有 pending kernel/通信但资源已释放”的未定义行为。
> - `dist.destroy_process_group()`：释放 NCCL 资源并让进程退出更干净。

## 深入底层：KV Cache Block Manager 需要提供哪些服务？

在前三节中，我们逐步走通了推理引擎的宏观流程：Engine 驱动循环，Scheduler 决定每步执行哪些请求，Model Runner 负责模型计算。但还有一个核心组件贯穿始终，它隐藏在 Scheduler 和 Model Runner 的背后，却决定了系统能否在有限显存下高效运行——这就是 KV cache 块管理器（Block Manager）。

### 从接口反推 Block Manager 的职责

让我们从几个关键交互点出发，看看 Block Manager 必须向上层提供什么。

在 Scheduler 中，当调度器考虑把一个新请求从 waiting 移到 running 时，它需要问：“当前的空闲块够不够为这个序列分配所有逻辑块？” 这就是 `can_allocate(seq)`。如果够，它调用 `allocate(seq)`，让 Block Manager 为序列建立物理块映射，并写入 `seq.block_table`。

在 decode 阶段，每次要为某个序列追加一个 token 时，调度器要问：“当前有没有足够的空闲块来满足这次追加（如果需要新块的话）？” 这是 `can_append(seq)`。如果允许，它会调用 `may_append(seq)`，让 Block Manager 更新块的状态：可能分配一个新块，或者在块填满时计算它的哈希值以供后续复用。

当序列完成或被抢占时，调度器调用 `deallocate(seq)`，通知 Block Manager 释放该序列占用的所有块，引用计数减一，可能将块归还给空闲池。

在 Model Runner 中，Block Manager 不直接出现，但它的存在至关重要：`seq.block_table` 和 `num_cached_tokens` 这两个字段正是由 Block Manager 维护的，而它们直接决定了 `prepare_prefill` 和 `prepare_decode` 中 slot_mapping 和 block_tables 的正确性。可以说，Block Manager 是 KV cache 物理视图的唯一权威来源。

把这些需求总结起来，Block Manager 必须实现以下核心功能：

- **固定大小的块池管理**：将连续的 KV cache 存储空间划分为固定大小的块（block），每个块可以存放固定数量 token 的 KV 数据。块是分配和释放的基本单位。

- **逻辑到物理的映射**：为每个序列维护一个页表（block table），将逻辑块索引映射到物理块 ID。物理块可以不连续，这是解决碎片问题的关键。

- **引用计数**：支持多个序列共享同一个物理块（例如相同的前缀），只有当最后一个引用者释放时才真正回收块。

- **前缀匹配的快速判断**：要实现前缀缓存（prefix caching），关键在于快速判断两个序列的前缀是否完全相同。最直接的方式是比较每个 token，但 token 数量可能很大，而且需要为每个前缀存储完整的 token 列表，成本太高。我们需要一种紧凑的“指纹”来代表前缀内容。哈希函数可以将任意长度的 token 序列映射为一个固定大小的整数，作为该前缀的标识。如果两个前缀的哈希值相同，那么它们极有可能内容相同（虽然存在碰撞可能，但概率极低）。因此，我们可以为每个填满的块计算其内容的哈希值，并为了捕捉前缀的连续性，在计算当前块哈希时还会混入前一个块的哈希值，形成哈希链。这样，一个块的哈希链值就唯一标识了从开头到该块为止的整个前缀。通过维护一个从哈希链值到物理块 ID 的映射，新序列在构建相同前缀时可以直接复用已有的物理块，而无需重新计算 KV cache——这就是 prefix caching 的基础。

- **状态查询与更新**：
    - 提供 `can_allocate`、`can_append` 等接口，让调度器能在不修改状态的情况下提前判断可行性，如在 prefill 前判断是否能为该 seq 分配足够的 blocks，下一个 step 是否需要新增 block 等；
    - 实际变更状态前需要进行维护：`allocate`、`may_append`；seq 处理结束或被 preempt 后，还需要 `deallocate` 释放 blocks。

---

**如何设计这样的管理器**？

1. **分页思想**：从操作系统的内存管理得到的启示
    将连续的逻辑空间映射到不连续的物理页，这个思想直接来自操作系统的虚拟内存管理。在 LLM 推理中，每个序列的 KV cache 在逻辑上是连续的 token 序列，但在物理上可以分散存储。固定大小的块就是“页”，块表就是“页表”。这种设计带来了两个直接好处：
    - **消除内部碎片**：分配和回收的粒度固定，不会因为序列长度变化而产生难以利用的碎片。
    - **支持共享**：不同的序列如果拥有相同的前缀，可以让它们的块表的前几项指向相同的物理块，从而节省显存。
2. **空闲块管理**：最简单的实现是维护一个空闲块 ID 的队列（`free_block_ids`），分配时从队首取一个，释放时放回队尾。这保证了分配的公平性和 $O(1)$ 复杂度。
3. **引用计数**：每个物理块需要有一个引用计数 `ref_count`。当多个序列共享同一个块时，计数增加；当序列释放时，计数减少；当计数归零时，块才真正归还给空闲池。这确保了共享块不会被提前回收。
4. **哈希链与前缀缓存**：
    前缀缓存的核心思想是：如果两个序列的前缀 token 完全相同，那么它们的前缀 KV cache 也应该相同，可以共享。为了快速判断两个块的内容是否相同，通常使用哈希。但只对单个块哈希是不够的，因为相同的内容可能出现在不同的上下文中（比如“apple”可能出现在不同句子的开头或中间）。因此需要链式哈希：每个块的哈希不仅取决于本块的 token，还依赖于前一个块的哈希值。这样，只有当从开头到当前块的整个前缀完全一致时，哈希链才会相同。
    - 实现上，Block Manager 可以维护一个字典 `hash_to_block_id`，将链式哈希值映射到物理块 ID。
    - 当为一个新序列分配块时，对于每个逻辑块，先计算它的链式哈希（如果本块是满块），然后去字典中查找；如果找到且该块的 token 列表确实匹配（防止哈希碰撞），就可以复用该物理块，并将 `seq.num_cached_tokens` 增加一个块的大小，表示这部分前缀无需重新计算。如果没找到或 token 不匹配，则分配新块，并在块写满后将其哈希值加入字典，供后续复用。
5. **追加时的状态机**：decode 阶段每追加一个 token，可能触发三种情况：
    - 当前块还有空位：直接写入，块状态不变。
    - 当前块刚好被填满：此时需要计算这个块的哈希（包括前缀），并将其注册到哈希字典中，供未来复用。
    - 当前块已满，需要新块：此时需要从空闲池中分配一个新物理块，并将它追加到序列的 block table 末尾。
    Block Manager 需要封装这些状态判断的逻辑，调度器只需在 decode 前调用一次，之后 Model Runner 就可以根据更新后的 `block_table` 和 `last_block_num_tokens` 正确计算 slot_mapping。
6. **工业级实现的演进**：
    - *更复杂的共享策略*：vLLM 的 Automatic Prefix Caching 使用哈希表进行块级别的共享，而 SGLang 的 RadixAttention 则采用前缀树（radix tree）来组织共享前缀。前缀树可以更精细地匹配最长公共前缀，并且支持节点级别的 LRU 淘汰，但实现也更复杂。
    - *更严谨的 Copy-on-Write*：当共享块被“写入/改变”时分裂，否则会破坏其他请求的共享前缀（vLLM 的 paged attention 设计明确提到用 refcount + COW 确保安全共享）
    - *内存分层与 Swap*：当 GPU 显存不足时，工业级系统不会简单地抢占并释放块，而是将不常用的块 swap 到 CPU 内存，甚至压缩后存储。这要求 Block Manager 维护每个块的位置状态（GPU/CPU），并配合调度器做换入换出决策。
    - *支持 Chunked Prefill 和 Speculative Decoding*：在 chunked prefill 中，一个序列的 prefill 可能分多步完成，每一步只处理一部分 token。这就要求 Block Manager 能够处理“部分填充的块”，并支持在 prefill 过程中就进行哈希计算和共享检测。这种更精细的“部分释放/部分保留”的策略选择，会让 block manager 的状态从“free/used”升级为多状态：GPU resident / swapped / evictable / pinned 等，同时 scheduler 也要变成 cache-aware / memory-aware。
    - *与调度器的更紧密结合*：在 vLLM 的最新版本中，调度器与 Block Manager 的交互更加精细化，引入了“lookahead slots”的概念——预先为未来几个 token 预留 KV 槽位，以减少调度与执行的耦合。这本质上是让 Block Manager 不仅要管理已分配的块，还要能够“预定”未来可能需要的块，从而让调度器可以提前做出更准确的资源判断。

scheduler 可能在同一个 step 里既调度 decode token，也调度某些请求的 prefill chunk ，因此sequence 层需要更细的进度量：不再是 `num_cached_tokens` 一个整数就够，而是要区分：已有 KV 的前缀（cached prefix）、本次 prefill chunk 已计算到哪里（computed_tokens）、尚未计算的 token（remaining）。在 vLLM v1 的抽象里，这类“进度统一化”最终会体现在 scheduler 以 token-level 进度管理为中心（你可以理解为把 prefill/decode/speculative 都统一为“推进 computed_tokens”）。



在这个契约下，上层对 Sequence / BlockManager 的“信息需求”其实很刚性，可以直接列成两条“接口面”。

1）Sequence 必须提供的信息（为 scheduler 与 runner 服务）

对 scheduler 而言，Sequence 是“调度粒度 + 生命周期状态 + stop 规则”：

- 身份与状态：`seq_id`、`status`（WAITING/RUNNING/FINISHED），以及 `is_finished`
- 进度与长度：`__len__`（当前总 token 数），`num_prompt_tokens`、`num_completion_tokens`、`max_tokens`
- stop 规则相关：`ignore_eos`（以及 engine 注入的 eos id 在 scheduler 里比较）
- 关键的一点：Sequence 必须能表达“哪些 token 已经在 KV cache 里了”，否则就无法做 prefix cache / preemption 后恢复：`num_cached_tokens` 以及由它导出的 `num_cached_blocks`

对 runner 而言，Sequence 是“张量打包原材料 + KV 寻址元信息”：

- 输入 token：prefill 需要能拿到 `token_ids[num_cached_tokens:]`；decode 需要 `last_token`
- 位置：prefill 需要 positions（从 cached 之后开始）；decode 需要 position = len(seq)-1
- KV 物理映射：`block_table`（逻辑 block → 物理 block_id 的页表），以及 `num_blocks`、`last_block_num_tokens`

你可以把这层关系总结成一句话：Sequence 提供“逻辑序列进度”，BlockManager 把逻辑序列映射到“物理 KV 页面”；scheduler 用它们做可行性与资源决策；runner 只信任由它们给出的映射来读写 KV。

---

如果我不看代码，我会怎么设计？

1）Sequence 的启发式设计

Sequence 的核心不是“存 token 列表”，而是维护一组不会跨层混用的量：

- 逻辑量：token 序列本身、prompt vs completion 的边界、last_token、stop 规则
- 资源映射量：block_table（页表）、num_cached_tokens（已有 KV 的前缀长度）
- 调度友好量：状态机、长度、生成上限

非常关键的启发式点：decode step 写入 KV 的对象是“当前输入 token”（也就是当前的 last_token），而不是“本 step 采样出来的新 token”。新 token 只有在下一次成为输入 token 时才会被写入 KV。这一点会直接决定 BlockManager 的“什么时候需要新 block”以及 scheduler 的 `may_append` 应该在 step 的哪个时刻做（你在 nano vLLM 里会看到它正是利用了这个事实）。

### 回到 nano vLLM

回到 nano-vLLM，它的 Block Manager 类实现了上述所有核心机制，但保持极简。可以用四个词概述它的整体职责——分配、复用、追加、回收。具体来说，其内部包含：

- `blocks` 列表，每个元素是一个 `Block` 对象，记录了 `ref_count`、`hash` 和 `token_ids`（用于碰撞验证）。
- 空闲块队列 `free_block_ids` 和已用块集合 `used_block_ids`。
- 哈希表 `hash_to_block_id`，键是链式哈希值（通过 `compute_hash` 类方法计算），值是物理块 ID。
- 核心方法：`can_allocate`、`allocate`、`can_append`、`may_append`、`deallocate`，它们严格遵循前文描述的逻辑。

`Block` 类的设计也很简单：`reset` 方法重置引用计数和哈希，`update` 方法在块填满时设置哈希和 token 列表。注意，只有满块才会进入哈希表，不满的块哈希值为 -1，不可共享。

在 `allocate` 中，通过遍历序列的每个逻辑块，尝试在哈希表中查找可复用的块，若命中则复用并增加 `num_cached_tokens`，否则分配新块。这实现了基础的 prefix caching。

在 `may_append` 中，根据当前序列长度模块大小的结果，处理三种情况：需要新块时分配；刚好填满时计算哈希并注册；其他情况只断言状态正确。

这套实现虽然简单，但已足够支撑一个可工作的 prefix caching 和抢占式调度。理解它之后，再去阅读 vLLM 的 `BlockManager` 代码，就会觉得那些复杂的数据结构其实是在解决同样问题的更高效版本。

#### 1. Block ：物理块的基本单元

```python
class Block:

    def __init__(self, block_id):
        self.block_id = block_id # 唯一的块id
        self.ref_count = 0
        self.hash = -1
        self.token_ids = []

    def update(self, hash: int, token_ids: list[int]):
        """更新块的哈希值和token列表
        """
        self.hash = hash
        self.token_ids = token_ids

    def reset(self):
        """重置块状态，准备重新使用
        """
        self.ref_count = 1 # 块被分配出去时默认被一个序列引用
        self.hash = -1
        self.token_ids = []
```

在 `BlockManager` 中，每个物理块由一个 `Block` 对象表示。它的代码很简洁，只包含几个核心字段：
- `block_id`：物理块的唯一标识，与它在 `blocks` 列表中的索引一致。
- `ref_count`：引用计数。多个序列共享同一个物理块时，靠它决定是否可以释放。
- `hash`：该块 token 内容的哈希（只有“整块满了”才会有有效 hash；不满则用 -1 表示不可缓存/不可复用）。
- `token_ids`：存储这个块包含的实际 token 列表，用于在哈希命中时做二次验证，防止哈希碰撞导致的错误复用。

`Block` 类提供了两个方法：
- **`reset()`**：将引用计数设为 1（表示被一个新序列使用），哈希重置为 -1，清空 token 列表。这个方法在块被分配给一个新序列时调用。
- **`update(hash, token_ids)`**：设置块的哈希值和 token 列表，通常在块刚好被写满时调用，表示这个块的内容已经固化，可以参与后续的前缀缓存。

#### 2. BlockManager 初始化与链式哈希

```python
class BlockManager:

    def __init__(self, num_blocks: int, block_size: int):
        self.block_size = block_size
        self.blocks: list[Block] = [Block(i) for i in range(num_blocks)]
        self.hash_to_block_id: dict[int, int] = dict()
        self.free_block_ids: deque[int] = deque(range(num_blocks))
        self.used_block_ids: set[int] = set()

    @classmethod
    def compute_hash(cls, token_ids: list[int], prefix: int = -1):
        h = xxhash.xxh64()
        if prefix != -1:
            h.update(prefix.to_bytes(8, "little"))
        h.update(np.array(token_ids).tobytes())
        return h.intdigest()
```

`BlockManager` 的构造函数接收两个参数：`num_blocks`（物理块总数）和 `block_size`（每个块能容纳的 token 数量）。它在内部维护以下几个核心数据结构：
- `self.blocks`：一个长度为 `num_blocks` 的列表，每个元素是一个 `Block` 对象，索引即为物理块 ID。
- `self.free_block_ids`：一个 `deque`，存放当前空闲的物理块 ID。初始化时包含 0 到 `num_blocks-1` 的所有 ID。
- `self.used_block_ids`：一个 `set`，存放当前被使用的物理块 ID（引用计数大于 0）。
- `self.hash_to_block_id` ：一个字典，键是链式哈希值，值是对应的物理块 ID。这个字典是前缀缓存的核心——它记录了所有已写满且可共享的块的哈希索引。

`BlockManager` 提供了一个类方法[^1] `compute_hash(token_ids, prefix=-1)` 来计算一个 token 列表的哈希值，并可选地混入前一个块的哈希，从而实现**链式哈希**。它的实现如下：
- 参数中，`token_ids` 是当前块的 token 列表， `prefix` 是前一个块的哈希值（整数），默认为-1表示不使用前缀。
- 调用 `xxhash` 创建 xxhash 的64 位对象：xxHash 是一种极快的非加密哈希算法，提供 32/64 位版本。这里使用 64 位（xxh64），冲突率低，适合作为内容指纹。相比 MD5、SHA 等，xxHash 速度更快，常用于缓存、数据分块等场景。
- 当前缀块存在时，将前缀块的 hash 值先转换为 8 字节的小端序字节串 `prefix.to_bytes(8, "little")` ，然后用其更新 hash 值。这等价于将前一个块的指纹用作上下文
- 根据当前块的 token，先将 token 列表转换为 numpy 数组，再转为连续的字节串用于 hash 值的更新。最终返回 64 位整数形式的 hash 值

这种链式哈希的设计使得第 i 块的哈希不仅取决于本块 token，还取决于前一块的哈希。这样整条 prompt 的块序列会形成一条链，能更强地区分“局部相同但上下文不同”的情况，也更贴近“前缀复用”的需求：只有当从开头到当前块的整段前缀完全一致时，哈希链才会一致。
- **示例**：假设有两个序列 `[A, B, C]` 和 `[A, B, D]`，前两个块内容相同（A 和 B）。计算第二个块（B）的哈希时，如果传入第一个块（A）的哈希作为前缀，则两个 B 块的哈希会相同（因为前缀哈希相同且 token 相同）。但如果计算第三个块，一个传入 B 的哈希作为前缀，内容 C；另一个传入 B 的哈希作为前缀，内容 D，则哈希不同，因此 C 和 D 不会被共享。

#### 3. 核心方法一：分配 (`allocate`)

`allocate(seq)` 方法为一个新进入 prefill 的序列分配物理块，并建立它的 `block_table`。这个方法的实现是前缀缓存逻辑的核心。allocate 的关键不变量是：
- allocate 结束后，`len(seq.block_table) == seq.num_blocks`
- 每个逻辑块 i 都有一个物理块 id：`seq.block_table[i]`
- 只有当发生 prefix cache hit 时，才会推进 `seq.num_cached_tokens`

```python
    def _allocate_block(self, block_id: int) -> Block:
        """分配某个block的工具函数，用于将一个空闲块标记为已使用
        """
        # 首先获取某空闲block，assert保证其真正空闲
        block = self.blocks[block_id]
        assert block.ref_count == 0
        # 该block将开始被使用，于是reset它，将其refcount置1
        block.reset()
        # 维护相关状态的信息表
        self.free_block_ids.remove(block_id)
        self.used_block_ids.add(block_id)
        return self.blocks[block_id]

    def allocate(self, seq: Sequence):
        # 确保该序列当前未被分配任何block table
        assert not seq.block_table
        h = -1
        cache_miss = False
        for i in range(seq.num_blocks):
            token_ids = seq.block(i)
            h = self.compute_hash(token_ids, h) if len(token_ids) == self.block_size else -1
            block_id = self.hash_to_block_id.get(h, -1)
            if block_id == -1 or self.blocks[block_id].token_ids != token_ids:
                cache_miss = True
            if cache_miss:
                block_id = self.free_block_ids[0]
                block = self._allocate_block(block_id)
            else:
                seq.num_cached_tokens += self.block_size
                if block_id in self.used_block_ids:
                    block = self.blocks[block_id]
                    block.ref_count += 1
                else:
                    block = self._allocate_block(block_id)
            if h != -1:
                block.update(h, token_ids)
                self.hash_to_block_id[h] = block_id
            seq.block_table.append(block_id)
```

首先，它断言序列当前没有 block_table（即 `not seq.block_table`）。然后，它初始化一个变量 `h = -1` 用于追踪前缀哈希，以及一个布尔标志 `cache_miss = False` 表示是否已经发生过缓存缺失（一旦缺失，后续块都不能再复用，因为前缀已经不匹配）。

接着，遍历序列的每个逻辑块（共 `seq.num_blocks` 个），重点理解其中 hash 构造与 cache hit 的配合方式：
1. 对该序列的每个逻辑块 i：
    - `token_ids = seq.block(i)` 取出该块的 token 列表
    - 只有当 `len(token_ids) == block_size`**（整块满）时才计算哈希 `h`**；否则 `h = -1`，表示最后不满的一块无法进入 prefix cache（因为它未来还会变化，缓存意义不稳定，只有满块才是可共享、可缓存的稳定单元）。计算出的 hash 值是当前 block 与前缀所有块的 prefix 的总 hash 值
2. 在哈希表中查找：
    - `block_id = hash_to_block_id.get(h, -1)` 从 `hash_to_block_id` 字典里查找特定 hash 值（prefix hash+当前 hash）的块，如果没有则返回 block id 为-1
    - 接下来检查 cache 命中情况：如果 block id 为 -1，并且用 `self.blocks[block_id].token_ids != token_ids` 做二次验证，避免哈希碰撞或 stale 映射，二者都成立时说明该 block 并未在 BlockManager 的 cache 中。
3. **cache miss 的处理：分配新物理块**
    - 从 `free_block_ids` 取一个 block（这里取队头），调用 `_allocate_block()`，将该块 `ref_count` 置为 1，并加入 used 集合。
4. **cache hit 的处理：复用历史物理块，并推进 `num_cached_tokens`**
    - `seq.num_cached_tokens += block_size`：这一步就是 `num_cached_tokens` 的真实语义——“这个完整块的 token 不需要再跑 prefill，因为 KV 已经在缓存中可复用”。
    - 如果命中的物理块当前也在 used（说明别的 seq 正在用），则只 `ref_count += 1`；否则把它从 free 重新 allocate 回来（ref_count=1，不过这里是为了健壮性考虑，实际上不应发生）。
5. 对于当前 block 是满块（h != -1）的情况，更新当前块的 hash 值和 token 列表，并更新 `hash_to_block_id`  。这一步是为了让未来的序列可以命中同一个块，形成“跨请求前缀缓存”。
6. 最后把该 `block_id` 追加进 `seq.block_table`

> [!NOTE] 这一步为什么 block 的 update 要同步更新 hash 值和 token 列表？
> 本质原因是 block manager 中维护的 block 和 seq 的 block 是两个维度，这一步更新的 block 是 manager 视角的 block，它的来源是：
> 1. cache miss 或 cache 命中但 block 没有被其他 seq 复用时，需要调用 `_allocate_block` 重新分配，此时会将 block 的状态 reset—— `block.token_ids=[]` 是个空列表，因此必须从 seq 的 block 中获取 token 列表，填入到 manager 的 block 中
> 2. 只有当 cache hit 且该 block 已被其他 seq 使用，那么此时它的 token 列表已经存储在 manager 的视角中，因此 token 列表在 seq 和 manager 两个维度都相同。

到这里你应该能看出 `num_cached_tokens` 的关键特点：它只按整块累计（每次 +block_size），因此 `num_cached_blocks` 一定是整数；也正因为如此，prefill 阶段可以安全地“跳过”这段前缀，不影响块内对齐。

---

**prepare_prefill 的 slot_mapping 为什么能正确？**——依赖 block_table + num_cached_tokens 的协同语义

ModelRunner 的 `prepare_prefill()` 会做两件与 slot_mapping 相关的事：

1. 只对“未缓存”的 token 构建 input_ids/positions ：它取的是 `seq[seq.num_cached_tokens:]`，意即如果前缀缓存命中了一些整块，那么这些 token 不需要再作为 Query 参与 prefill（它们的 KV 已经存在）。
2. 对“需要写 KV 的 token”构建 slot_mapping ：slot_mapping 的构建从 `for i in range(seq.num_cached_blocks, seq.num_blocks):` 开始：也就是从“第一个未缓存块”开始，为后续的每个逻辑块 i 生成一段线性槽位索引：
    - 物理块 id：`seq.block_table[i]`
    - 该物理块在线性 KV cache 中的起始槽：`start = block_id * block_size`
    - 该块需要写入的 token 范围：
        - 非最后块：写满一个 block，`end = start + block_size`
        - 最后块：只写 `last_block_num_tokens` 个，`end = start + seq.last_block_num_tokens`

这样生成的 slot_mapping 恰好满足一个简单映射关系：序列里第 p 个 token（从 0 开始计）应写入的位置就是

- `block_id = seq.block_table[p // block_size]`
- `offset = p % block_size`
- `slot = block_id * block_size + offset`

而 slot_mapping 实际上就是把“未缓存区间”的这些 slot 顺序串起来，交给 attention/kv 写入逻辑使用。

顺带一提：当存在 prefix cache（`num_cached_tokens > 0`）时，runner 会准备 `block_tables`（把每条 seq 的 block_table pad 成矩阵传给模型），让模型侧能从物理块表里读取“已缓存前缀的 KV”。这就是 prefill 路径里 `cu_seqlens_k > cu_seqlens_q` 时要传 block_tables 的原因：K 的上下文长度更长，说明有一段 KV 来自缓存前缀，而 Q 只覆盖新增 token。

#### 4. 核心方法二：追加 (`may_append`)

decode 路径里最容易让人迷惑的一点是：为什么 Scheduler 要在调用 ModelRunner 之前先做 `block_manager.may_append(seq)`，以及 `prepare_decode` 的 slot_mapping 如何保证永远指向“本轮要写 KV 的那个槽位”？

你可以把每一轮有 prefix caching 的 decode 理解成：**对每条 seq，把它“当前最后一个 token”喂进模型，得到“下一个 token”，然后把新 token append 到 seq**。因此：

- 本轮模型输入的 token 是最后一个 token： `input_ids.append(seq.last_token)`
- 本轮需要写 KV 的位置，正是这个 `last_token` 对应的位置（也就是 position = `len(seq) - 1` 的那一格）

于是 `prepare_decode` 里：

- `positions.append(len(seq) - 1)`：当前最后 token 的位置
- `slot_mapping.append(seq.block_table[-1] * block_size + seq.last_block_num_tokens - 1)`：
    - `seq.block_table[-1]` 取最后一个逻辑块对应的物理块 id
    - `seq.last_block_num_tokens - 1` 就是“最后一个 token 在最后一个块内的偏移”
    - 两者合成“最后 token 的线性槽位”

---

那么 `may_append(seq)` 在 decode 前做什么？它的作用是维护两个不变量：
- 当序列刚进入一个新块时，`block_table` 里必须已经有这个新块的物理块 id（否则 `block_table[-1]` 还是旧块，slot_mapping 会写错块）
- 当一个块被填满时，要把这个块的 hash 固化下来，未来才能参与 prefix cache

```python
    def may_append(self, seq: Sequence):
        block_table = seq.block_table
        last_block = self.blocks[block_table[-1]]
        if len(seq) % self.block_size == 1:
            assert last_block.hash != -1
            block_id = self.free_block_ids[0]
            self._allocate_block(block_id)
            block_table.append(block_id)
        elif len(seq) % self.block_size == 0:
            assert last_block.hash == -1
            token_ids = seq.block(seq.num_blocks-1)
            prefix = self.blocks[block_table[-2]].hash if len(block_table) > 1 else -1
            h = self.compute_hash(token_ids, prefix)
            last_block.update(h, token_ids)
            self.hash_to_block_id[h] = last_block.block_id
        else:
            assert last_block.hash == -1
```

`may_append` 通过 `len(seq) % block_size` 的三种情况区分 decode 时序列 block 的状态（这里的写法利用了 Python 布尔值可当作 0/1 使用的特性）：

1. `len(seq) % block_size == 1`：刚开始新块（上一步 append 让序列长度从整块边界变成边界+1）
    - 这时必须为新块分配一个新的物理块 id，并 `block_table.append(new_block_id)`
    - 同时断言 `last_block.hash != -1`：要求上一个块已经是“可缓存的满块”（否则说明块边界的状态机不一致）

2. `len(seq) % block_size == 0`：刚好填满一个块
    - 这时还不需要新块，但需要把这个“刚填满的最后块”计算 hash 并写入 `hash_to_block_id`，使其未来可复用
    - 它还会用 `prefix = blocks[block_table[-2]].hash` 把前缀链带进去，形成链式哈希

3. 其它情况：块未满
    - 不做结构性变化，只断言 `last_block.hash == -1`（未满块不应有 hash）

#### 5. 核心方法三：回收块 （`deallocate`）

```python
    def _deallocate_block(self, block_id: int) -> Block:
        """回收某个block的工具函数，将一个已使用但refcount恢复为0的block回收
        """
        # 只能在refcount为0时调用
        assert self.blocks[block_id].ref_count == 0
        self.used_block_ids.remove(block_id)
        self.free_block_ids.append(block_id)

    def deallocate(self, seq: Sequence):
        for block_id in reversed(seq.block_table):
            block = self.blocks[block_id]
            block.ref_count -= 1
            if block.ref_count == 0:
                self._deallocate_block(block_id)
        seq.num_cached_tokens = 0
        seq.block_table.clear()
```

Scheduler 在序列处理 FINISHED 或被抢占时会调用 `BlockManager.deallocate(seq)`，它做三件事：

- 逆序遍历 `seq.block_table`，对每个 block `ref_count -= 1`，归零就通过 `_deallocate_block(block_id)` 回收进 `free_block_ids`（这个是共享块的必要条件：只有最后一个引用者释放后才可回收）
- `seq.num_cached_tokens = 0` 、`seq.block_table.clear()` 表示该 seq 不再持有任何 KV blocks

为什么要清这两个 seq 字段？

- 清 `block_table`：因为物理块已经可能被释放/重用，旧映射表不再可信；如果不清，后续 slot_mapping 可能写到已经分配给别人的块。
- 清 `num_cached_tokens`：因为 prefix cache 的“已缓存前缀”只在“仍然保有那段 KV cache”时成立；一旦 deallocate，把块回收了，就不能再假设这段前缀的 KV 还存在。清零能强制后续重新走 allocate/prefill 去建立 KV。

这就是“正确性优先”的选择：宁可多算一次 prefill，也不能写错 KV。

#### 6. 辅助查询方法：`can_allocate` 与 `can_append`

```python
    def can_allocate(self, seq: Sequence) -> bool:
        return len(self.free_block_ids) >= seq.num_blocks

    def can_append(self, seq: Sequence) -> bool:
        return len(self.free_block_ids) >= (len(seq) % self.block_size == 1)
```

调度器在做出决策前需要先查询可行性，因此 `BlockManager` 提供了两个只读方法：

- `can_allocate(seq)`：返回 `len(self.free_block_ids) >= seq.num_blocks`。即空闲块数是否足够容纳该序列的所有逻辑块。注意，即使前缀缓存可能复用已有块，但在分配前我们并不知道复用的情况，所以这里保守地按最坏情况检查。实际 `allocate` 过程中可能会因为复用而消耗更少的空闲块，但这里用上限检查是安全的。
- `can_append(seq)`：返回 `len(self.free_block_ids) >= (len(seq) % block_size == 1)`。这是因为只有当序列刚好进入新块（即需要新块）时，才需要消耗一个空闲块；否则不需要。所以判断条件是：如果需要新块，则空闲块数至少为 1；否则一定可以追加。

这两个方法为调度器提供了轻量级的资源预检，避免了在执行 `allocate` 或 `may_append` 时才发现资源不足的尴尬。

---

nano-vLLM 的 `BlockManager` 虽然只有两百行左右的代码，但它完整地实现了以下核心功能：

- 固定大小的块池与空闲队列管理；
- 基于引用计数的块共享；
- 链式哈希与哈希表实现的前缀缓存；
- 为调度器提供的资源查询接口（can_allocate/can_append）；
- 分配、追加、回收的核心逻辑，并与 `Sequence` 的状态保持同步。


理解了这个模块，就掌握了 nano-vLLM 如何在有限的显存中高效管理 KV cache，并为多个请求提供共享和抢占能力。下一节，我们将深入最后一个核心组件——`Sequence`，看看它是如何承载请求的状态，并与 `Scheduler`、`BlockManager`、`ModelRunner` 协同工作的。

## 最小单元：Sequence

在前几节中，我们依次剖析了 Engine、Scheduler、Model Runner 和 Block Manager 的设计与实现。这些模块围绕着一个共同的核心数据结构运转——`Sequence`。它承载着每个请求从进入系统到完成的所有状态信息，是调度器做决策的依据，是块管理器维护映射的对象，也是模型运行时打包输入的来源。可以说，理解了 `Sequence`，就理解了各个模块如何协同工作。

从不同模块的视角看，`Sequence` 需要提供的信息各有侧重。
1. 对 **Engine** 而言，`Sequence` 是请求的最终产出。Engine 需要知道每个请求的 prompt 和生成的 completion，以便在请求完成时返回给用户。同时，Engine 也需要能够判断一个请求是否已经完成（`is_finished`），从而决定是否从调度队列中移除。
2. 对 **Scheduler** 而言，`Sequence` 是调度的基本单元。调度器需要知道每个请求的当前状态（WAITING/RUNNING/FINISHED）、长度（`__len__`）、最大生成 token 数（`max_tokens`）、是否忽略 EOS（`ignore_eos`）等，以便在每次 `schedule()` 中决定哪些请求可以进入本轮 batch，以及在 `postprocess()` 中判断是否应该结束。此外，调度器还需要能够更新请求的状态，比如在抢占时将 RUNNING 改为 WAITING。
3. 对 **Block Manager** 而言，`Sequence` 是 KV cache 块的持有者。块管理器需要读取和修改两个关键字段：`block_table`（逻辑块到物理块的映射表）和 `num_cached_tokens`（已经缓存的 token 数，用于前缀复用）。在 `allocate`、`may_append`、`deallocate` 等方法中，块管理器直接操作这些字段，确保它们与物理块的实际状态一致。
4. 对 **Model Runner** 而言，`Sequence` 是输入打包的原材料。prefill 阶段需要取出 `seq[seq.num_cached_tokens:]` 作为输入 token，decode 阶段需要 `last_token`；同时需要根据 `block_table` 和 `last_block_num_tokens` 计算 slot_mapping，以及根据 `num_cached_tokens` 决定是否跳过部分前缀的计算。所有这些信息都来自 `Sequence` 的属性和方法。

#### Sequence 的核心字段

```python
class SequenceStatus(Enum):
    """seq的状态，通过auto自动分配枚举值
    """
    WAITING = auto()
    RUNNING = auto()
    FINISHED = auto()


class Sequence:
    block_size = 256
    counter = count()

    def __init__(self, token_ids: list[int], sampling_params = SamplingParams()):
        self.seq_id = next(Sequence.counter)
        self.status = SequenceStatus.WAITING
        self.token_ids = copy(token_ids)
        self.last_token = token_ids[-1]
        self.num_tokens = len(self.token_ids)
        self.num_prompt_tokens = len(token_ids)
        self.num_cached_tokens = 0
        self.block_table = []
        self.temperature = sampling_params.temperature
        self.max_tokens = sampling_params.max_tokens
        self.ignore_eos = sampling_params.ignore_eos
```

- sequence 状态的转换：Scheduler 在 `schedule()` 时把 `WAITING -> RUNNING`，在 `postprocess()` 时把 `RUNNING -> FINISHED`，在 `preempt()` 时把 `RUNNING -> WAITING`。
- `Sequence` 到底定义了一条请求的哪些细节？
    - 身份与生命周期：
        - `block_size = 256` 对 seq 的长度进行分块，每个块的大小为 256 token。需要注意，这里其实将 `block_size` 的大小写死了，即使在BlockManager/Scheduler/Config 中修改 `kvcache_block_size` 成非 256（比如 512），Sequence 的 `num_blocks/last_block_num_tokens/block(i)` 的分块计算就会与 BlockManager 的 `block_size` 不一致，slot_mapping 必然错位。
        - `seq_id`：全局递增 id（`counter = itertools.count()`），用于在 `generate()` 结束时把输出按 id 排序。  `next(Sequence.counter)` 每 new 一个 `Sequence` 就得到一个唯一整数。
        - `status`：当前状态（WAITING/RUNNING/FINISHED），初始化时都处于 waiting 状态，等待合适时机被调度
    - token 内容与长度：
        - `token_ids`：当前序列拥有的 token 列表（初始化时 copy 自用户输入的 prompt ；生成时持续 append）。
        - `last_token`：`token_ids` 的最后一个 token（decode 只需要它；也用于跨进程“轻量传输”）。
        - `num_tokens`：缓存 `len(token_ids)` 的结果；配合 `__len__` 返回，避免每次 `len(list)` 的开销与不一致风险。
        - `num_prompt_tokens`：prompt 的 token 数，用于把 prompt 与 completion 分开统计与输出。
        - `num_cached_tokens`：前缀复用命中的 token 数（按整块累计），用于 prefill 时跳过已缓存前缀（更准确说：跳过“无需重新写入 KV 的那段前缀”）。
    - KV cache 分块的映射：
        - `block_table`：逻辑块序号 → 物理块 id 的映射列表。例如 `block_table[i] = 37` 表示第 i 个逻辑块的 KV 写入物理块 37 对应的区域。
    - 采样与停止条件（每条请求可能不同）：
        - `temperature`、`max_tokens`、`ignore_eos`：copy 自 `SamplingParams` 。runner 侧采样会用到 `temperature`；scheduler 的结束判定会用到 `ignore_eos` 与 `max_tokens`（EOS id 则来自 scheduler 自己的 `self.eos`）。

#### `Sequence` 重要的派生属性

```python
def __len__(self):
    return self.num_tokens

def __getitem__(self, key):
    return self.token_ids[key]

@property
def is_finished(self):
    return self.status == SequenceStatus.FINISHED

@property
def num_completion_tokens(self):
    return self.num_tokens - self.num_prompt_tokens

@property
def prompt_token_ids(self):
    return self.token_ids[:self.num_prompt_tokens]

@property
def completion_token_ids(self):
    return self.token_ids[self.num_prompt_tokens:]

@property
def num_cached_blocks(self):
    return self.num_cached_tokens // self.block_size

@property
def num_blocks(self):
    return (self.num_tokens + self.block_size - 1) // self.block_size

@property
def last_block_num_tokens(self):
    return self.num_tokens - (self.num_blocks - 1) * self.block_size

def block(self, i):
    assert 0 <= i < self.num_blocks
    return self.token_ids[i*self.block_size: (i+1)*self.block_size]

```

- `__len__` / `__getitem__`：让 `Sequence` 像一个 token 序列一样可以 `len(seq)`、`seq[i]`、`seq[a:b]` 使用。runner 的 prefill 打包会用 `seq[seq.num_cached_tokens:]` 这种切片语法。
- `is_finished`：`status == FINISHED` 的语义封装。LLMEngine `step()` 里用 `seq.is_finished` 收割本轮完成的序列输出。
- 和输出相关的属性：
    - `num_completion_tokens = num_tokens - num_prompt_tokens` 计算完成该 seq 的处理付出了多少 token
    - `prompt_token_ids` / `completion_token_ids`：把 `token_ids` 分成 prompt 与生成部分。
- 和分块逻辑、slot mapping 相关的属性：
    - `num_blocks = (num_tokens + block_size - 1) // block_size`：当前需要多少逻辑块
    - `last_block_num_tokens`：最后一个逻辑块当前有多少 token（用于“最后一块只写一部分”）
    - `num_cached_blocks = num_cached_tokens // block_size`：缓存前缀命中的整块数
    - `block(i)`：返回第 i 个逻辑块的 token_ids 切片

这套属性的意义是：**把“token 序列长度变化”与“块边界变化”绑定到一个唯一口径**，从而保证：

- BlockManager 的 `allocate`/`may_append` 不需要自己重复计算块内偏移；
- Runner 的 slot_mapping 只要相信 `block_table` 与这些属性，就能正确把 token 映射到 KV-cache 槽位。

#### `Sequence` 状态推进的最小原子操作

```python
def append_token(self, token_id: int):
    self.token_ids.append(token_id)
    self.last_token = token_id
    self.num_tokens += 1
```

`append_token()` 把本轮 `ModelRunner.run()` 采样得到的 `token_id` 加入序列。Scheduler 的 `postprocess()` 逐个 `(seq, token_id)` 调用 `seq.append_token(token_id)`。这个方法做了三件事：
- 将 `token_id` 追加到 `self.token_ids` 列表。
- 更新 `self.last_token` 为这个新 token。
- 增加 `self.num_tokens` 计数。

为什么放在 Sequence 内：确保 `token_ids`、`last_token`、`num_tokens` 三者始终一致（避免外部忘改某个字段）。

这一步之后，Sequence 的 `num_blocks`、`last_block_num_tokens` 可能发生变化，从而触发 BlockManager 在 decode 前的 `may_append(seq)` 行为（是否需要新块、是否需要固化 hash 等）。

#### 为多进程的共享内存传输优化

```python
def __getstate__(self):
    return (self.num_tokens, self.num_prompt_tokens, self.num_cached_tokens, self.block_table,
            self.token_ids if self.num_completion_tokens == 0 else self.last_token)

def __setstate__(self, state):
    self.num_tokens, self.num_prompt_tokens, self.num_cached_tokens, self.block_table = state[:-1]
    if self.num_completion_tokens == 0:
        self.token_ids = state[-1]
    else:
        self.last_token = state[-1]
```

这部分是理解 “为什么 worker 进程能拿到 `Sequence`” 的关键——ModelRunner 的 rank0 会把要执行的方法名与参数通过 `pickle` 写进共享内存，worker 读取后 `pickle.loads(...)` 得到 `seqs` 并执行 `run(seqs, ...)`。因此 `Sequence` 必须可 pickle 序列化。

但直接序列化整个 `token_ids` 列表在 decode 阶段可能很浪费——因为 decode 时每条序列每步只需要 `last_token`，而 `token_ids` 可能已经很长。因此，`Sequence` 自定义了 `__getstate__` 和 `__setstate__` 方法来实现按阶段压缩。

- `__getstate__` 返回一个 tuple，包含：
    - 几个标量字段： `num_tokens, num_prompt_tokens, num_cached_tokens, block_table`
    - 一个 payload，根据 `num_completion_tokens` 是否为 0 决定：
        - 如果还没有生成任何 completion（即刚进入系统，还未开始 decode），则 payload 是完整的 `token_ids` 列表。这样 worker 在 prefill 时就能拿到完整的 prompt 信息。
        - 如果已经生成了 completion（即处于 decode 阶段），则 payload 只是 `last_token`。这样 worker 只需要知道当前输入 token 即可，大大减少了 IPC 数据量。 `payload` 的选择逻辑：

-  `__setstate__` 则按同样规则恢复：根据接收到的元组重构对象，先恢复标量字段，然后根据 `num_completion_tokens` 是否为 0 来恢复 payload：
    - 如果为 0，说明是 prefill 阶段，将 payload 赋值给 `self.token_ids`。
    - 否则，将 payload 赋值给 `self.last_token`，而 `self.token_ids` 不会被恢复（因为 decode 阶段不需要它）。注意，`num_tokens` 已经记录了总长度，所以即使没有完整 `token_ids`，也能通过 `last_token` 和长度信息完成 decode 的输入打包。

这种设计体现了对多进程通信开销的精细考虑：在 prefill 阶段传输完整 token 列表是必要的，因为需要整个 prompt；在 decode 阶段，只传输 `last_token` 就足够了，避免了冗余数据传输。

---

`Sequence` 类虽然代码不多，但它是连接各个模块的枢纽。它既提供了调度器所需的生命周期信息，又为块管理器维护了物理映射，还为模型运行时提供了输入打包所需的一切。通过精心设计的字段和派生属性，它让上层模块可以专注于自己的逻辑，而不必关心序列内部的数据组织。理解 `Sequence`，就等于理解了 nano-vLLM 中请求状态如何流转，以及各个模块如何围绕它协同工作。

至此，我们已经走完了 nano-vLLM 的所有核心模块：Engine、Scheduler、Model Runner、Block Manager 和 Sequence。从宏观的引擎循环到微观的 KV 块管理，每一部分都体现了推理引擎设计的基本思想和权衡。虽然 nano-vLLM 是一个极简实现，但它清晰地勾勒出了工业级系统（如 vLLM、SGLang）的核心骨架，为理解更复杂的系统打下了坚实的基础。

# Footnotes

[^1]: 类方法指的是，不依赖于具体的 `BlockManager` 实例，可以在任何地方调用。
