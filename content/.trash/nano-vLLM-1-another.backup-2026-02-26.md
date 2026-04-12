---
tags:
  - Inference
  - nano-vLLM
date: 2026-02-13
publish: "true"
zhihu-title: 【项目分析】从nano-vLLM入门推理引擎（一）：引擎核心架构与调度设计
---
## 1. 从需求出发：一个推理引擎必须解决什么问题？

如果把大模型推理服务想象成一条永不停歇的流水线，那么推理引擎（Engine）就是那台“总控器”：它不断接收新请求，把活儿组织成 GPU 能高效执行的批次，推进每个请求的状态机，并在合适的时刻把结果交回给用户。很多“工程复杂度”看起来分散在各种模块里，但它们都围绕同一个核心循环展开：**调度（decide what）→ 执行（do the compute）→ 回填状态（update state）**。

理解 Engine 的第一步，是把请求的生命周期拆成两个阶段：`prefill` 和 `decode`。`prefill` 往往一次性吞下整段 prompt，建立/补齐 KV cache；`decode` 则以更细的粒度持续推进（常见实现里每序列每步 1 token）。你会很快发现，这两个阶段不仅计算形态不同，瓶颈也不同：prefill 更像吞吐导向的“批处理”，decode 更像被 KV 读写与同步约束的“增量推进”。因此，一个能用的引擎必须同时照顾 TTFT（prefill 相关）与 TPOT（decode 相关），而这恰好把问题推到了调度策略与资源管理上。

从“必须实现”的能力来看，一个推理引擎通常绕不开四类事情：它要维护请求状态（prompt/已生成 token/停止条件/采样参数），要在硬约束下构造可执行 batch（最大 batch token、最大并发序列数、KV cache 容量等），要驱动执行器跑完一轮计算并拿到 token 输出，还要把系统边界收拾干净（退出/回收/最基本的统计）。

nano-vLLM 把这些能力压缩成一个极简但完整的骨架：你几乎可以在一眼看到的代码里，读出它对 Scheduler、ModelRunner、BlockManager、Sequence 的“接口契约”。这也是它作为入门项目最值得看的地方。

#### 1.1 工业界的共同结构：先抓住 `step()` 这一刀

读 vLLM、SGLang 或其它 serving 框架时，我最推荐的启发式方法是：先找到类似 `step()`/`tick()` 的函数。因为 serving 的复杂度再高，最终都要落到“每一步推进系统一次”的节拍上。只要你锁定了 step 的输入输出，就能反推出模块分工的大框架：

- `schedule()`：本轮挑哪些请求组成 batch？本轮跑 prefill 还是 decode（或者混跑）？
- `run()`：把 batch 打包成张量、跑 forward、读写 KV、做并行同步与采样。
- `postprocess()`：把输出 token 写回请求状态，判断是否结束，并在需要时回收资源。

在这个视角下，Scheduler 的核心不是“排队”，而是**在约束里构造可执行 batch**；Runner 的核心不是“调用模型”，而是**把 batch 变成可复用的高效执行路径**；而 Engine 作为总控，最重要的是把这些模块串成稳定的闭环。

**将这些分析映射到 nano vLLM 代码的具体实现**：

1. **引擎循环在哪**？

```python
    def step(self):
        seqs, is_prefill = self.scheduler.schedule()
        token_ids = self.model_runner.call("run", seqs, is_prefill)
        self.scheduler.postprocess(seqs, token_ids)
        outputs = [(seq.seq_id, seq.completion_token_ids) for seq in seqs if seq.is_finished]
        num_tokens = sum(len(seq) for seq in seqs) if is_prefill else -len(seqs)
        return outputs, num_tokens
```

这段代码基本把 nano-vLLM 的“控制面协议”写死了：Scheduler 决定本轮要推进哪些序列、以什么语义推进；Runner 只负责按该语义跑一次模型并吐出 token；Scheduler 再把 token 写回状态并回收资源。Engine 本身不做任何“聪明决策”，它只把闭环串起来。

这里我更愿意从输入输出契约来理解，而不是逐行翻译：

首先，`schedule()` 返回的不是“所有活跃序列”，而是本轮的可执行 batch：`seqs` 与 `is_prefill`。`is_prefill` 的存在相当于把系统的两条数据面路径显式暴露给了 Runner：prefill 通常要处理一段长度不等的 prompt（一次性补齐 KV，并产出第一个要采样的 logits）；decode 则更强调“每步每序列追加 1 token”的稳定推进。也正因为这个二值信号存在，Scheduler 才能用最小接口表达最重要的策略选择：本轮到底是在“吃新请求”（prefill）还是在“推进已在运行的请求”（decode）。

其次，`model_runner.call("run", seqs, is_prefill)` 的关键不在于它是不是 RPC，而在于它把 Runner 的职责边界切得非常清楚：Runner 的返回值 `token_ids` 必须与 `seqs` 一一对应且顺序一致。你之后会在 `postprocess` 里看到这种对齐假设被反复使用——这也是 serving 系统里最常见、也最容易踩坑的“隐式协议”之一：一旦 batch 的顺序在多个模块之间不一致，bug 往往会表现为非常诡异的输出错位。

再次，`postprocess(seqs, token_ids)` 是系统里“状态与资源一致性”的闸门：它既要把新 token 写回 `Sequence`，又要在触发停止条件时把序列标记为 finished，并释放它占用的 KV block。换句话说，Scheduler 不只是“挑 batch”，它还必须维护 KV cache 与队列状态的一致推进。

最后，注意 Engine 对外的产出语义：`outputs` 只收集 `is_finished` 的序列，而且返回的是该序列的完整 `completion_token_ids`（累积），不是本步增量 token。于是大多数 step 返回空输出，只有“恰好在这一轮结束”的请求才会被一次性返回——这也解释了为什么这个实现天然是非流式（non-streaming）的。

`num_tokens` 则是一个用于吞吐统计的小技巧：prefill 用本轮处理的 token 数做粗估；decode 因为每序列每步生成 1 token，所以本轮生成 token 数就是 `len(seqs)`，加负号只是为了在上层区分 prefill/decode 并更新不同的吞吐统计。

2. **请求状态是谁**？

```python
    def add_request(self, prompt: str | list[int], sampling_params: SamplingParams):
        if isinstance(prompt, str):
            prompt = self.tokenizer.encode(prompt)
        seq = Sequence(prompt, sampling_params)
        self.scheduler.add(seq)
```

`add_request` 这段代码把 nano-vLLM 的“请求归属”讲得很直白：prompt 在 Engine 这一层只做两件事——分词成 token ids，然后变成一个 `Sequence` 对象。之后请求的生命周期推进（waiting→running→finished）以及与 KV cache 的映射关系，都不再由 Engine 管理，而是交给 Scheduler/BlockManager/Runner 在各自职责范围内完成。

这一点看似平淡，但它决定了后续各章的组织方式：当你想理解 Scheduler 或 BlockManager 的设计时，永远先问“Engine 把什么事情留给了它？它又必须向 Engine/Runner 暴露什么接口，才能满足 `step()` 的契约？”——从这个问题出发，代码会比从字段/函数细节堆砌更容易读懂。

3. **调度器解决哪些约束？Engine 如何把约束“交付”给它**

```python
class LLMEngine:

    def __init__(self, model, **kwargs):
        # 获取config参数
        config_fields = {field.name for field in fields(Config)}
        config_kwargs = {k: v for k, v in kwargs.items() if k in config_fields}
        config = Config(model, **config_kwargs)

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

        # rank==0的主进程也创建一个ModelRunner
        self.model_runner = ModelRunner(config, 0, self.events)

        # 从预训练模型中获取其相匹配的tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(config.model, use_fast=True)
        # 在根据config创建scheduler之前将eos标记的id写入config，保证终止判定的可用性
        config.eos = self.tokenizer.eos_token_id
        self.scheduler = Scheduler(config)

        # 保证进程退出时尽量释放worker/进程组/共享内存
        atexit.register(self.exit)
```

到这里我们终于可以回答一个看似“反常识”的问题：为什么一个叫 Engine 的类，在 `__init__` 里要做这么多杂活（起进程、建 tokenizer、填 eos、再创建 scheduler）？答案是：**Scheduler 的策略不是凭空拍脑袋出来的，它必须建立在一组清晰的硬约束与系统边界之上**。而这些约束的来源，恰恰是在 Engine 启动时被“装配”出来的。

首先，`Config(model, **config_kwargs)` 这一段做的事情非常朴素，但很工程：Engine 允许你传很多 `kwargs`，但只会把 `Config` dataclass 里声明过的字段过滤出来，避免配置污染。对 Scheduler 来说，`Config` 就是它的“物理世界”：最大并发序列数、最大 batched token、block 大小、KV cache 可用空间、prefill chunk 等等，都应该在这个对象里以**确定的数值**出现。之后你再去读 `schedule()`，就不会把调度理解成“纯算法问题”，而会把它理解成“在预算里选一组可执行工作”的组合优化问题。

其次，Engine 必须在创建 Scheduler 之前先初始化 tokenizer，并把 `eos_token_id` 写回 `config.eos`。这一步表面上只是“填个字段”，但它实际上是在定义**请求何时结束**这件事的系统事实：不同模型的 EOS id 不同，Scheduler 的 `postprocess()` 需要用它来判断停止条件，并在停止时释放 KV block、把序列从 running 队列移走。换句话说，`config.eos` 是 Scheduler 正确推进状态机的前置条件。

然后是并行执行器的装配：Engine 用 `mp.get_context("spawn")` 起 TP worker 进程（rank 1..TP_size-1），主进程里再创建 rank0 的 `ModelRunner` 作为 driver，并用 `Event` 做显式同步信号。你可以先把它理解成一个最小的 driver/worker 外壳：rank0 负责驱动 step、分发调用与聚合结果，其他 rank 只做计算；更细的 IPC、共享内存与 barrier 细节，我们放到 ModelRunner 章节再展开。

> [!note] 为什么推理里更偏好 `spawn`？
> 当你在 Python 里用多进程跑 CUDA，`fork` 往往会把父进程里“半初始化”的线程/锁/CUDA runtime/NCCL 句柄等状态继承到子进程，导致难复现的 hang 或崩溃；`spawn` 则让子进程在全新的解释器里重新初始化，边界更清晰、更可控。代价是启动更慢、传参需要可序列化，但对 serving/推理场景通常更值得。

最后，`atexit.register(self.exit)` 属于系统边界的一部分：它保证即使用户没有显式调用 `exit()`，进程退出时也会尽量把 worker、进程组与共享内存收拾干净，避免留下僵尸进程或资源泄漏。

对应的退出路径也很直接：
```python
    def exit(self):
        self.model_runner.call("exit")
        del self.model_runner
        for p in self.ps:
            p.join()
```

把它和 `ModelRunner.loop/exit` 对起来看，会发现这也是典型的 driver/worker 退出协议：rank0 发出退出指令并唤醒各 worker；worker 在循环里读到 `exit` 后释放自身资源（共享内存、进程组、可能的 cudagraph 等）并跳出监听；最后主进程 `join()` 等待所有子进程干净退出。这个“退出协议”看似与调度无关，但它决定了系统能否稳定地作为服务长时间运行——同样属于 Engine 必须解决的约束之一。

4. **执行器是什么形态？一个最小的 driver/worker 外壳**

前面我们一直在讲 Engine 的“控制面协议”：`schedule() → run() → postprocess()`。执行器（这里是 `ModelRunner`）则是这条协议对应的数据面实现。工业界里执行器常见有两种形态：最简单的是单进程单卡（Engine 直接调用模型 forward）；更常见、也更贴近真实部署的是 driver/worker：rank0 负责组织输入、触发执行与汇总输出，其他 rank 只负责计算。这种形态并不只出现在 vLLM，TensorRT-LLM、一些基于 NCCL 的 TP/PP 推理实现也基本都能看到类似分工，只是通信/RPC 层的工程复杂度不同。

nano-vLLM 选择了第二种形态：Engine 在初始化时 `spawn` 出 `tensor_parallel_size-1` 个子进程，同时在主进程里构造 rank0 的 `ModelRunner`。之后 Engine 对 Runner 的交互被收敛成一个极小接口：`call("run", ...)` 驱动一次计算步进，`call("exit")` 触发干净退出。你可以把它理解为一个“逻辑 RPC”：哪怕 rank0 是同进程对象，接口仍然保持一致，这样 driver/worker 在语义上更对齐，也更容易在后续替换成更复杂的通信机制（队列、共享内存、socket、Ray 等）。

这里的 `Event` 同步也很值得注意：它意味着 nano-vLLM 把多 rank 的步进显式同步了起来——rank0 发出信号，各 worker 醒来执行同一步，再一起回到等待状态。这个设计虽然牺牲了一些并发自由度，但换来的是极强的确定性：对于入门实现来说，它能把“多进程 + 多 GPU”最容易错的时序问题压到最小。

#### `generate()`：把一次请求变成“持续推进直到完成”

如果说 `step()` 是引擎的节拍器，那么 `generate()` 就是对外的编排层：它把用户输入变成 `Sequence` 入队，然后不断调用 `step()` 推进系统，直到所有序列完成，再把 token ids 解码成文本输出。

原始代码里还包含进度条与吞吐统计；为了不被细节打断，这里只保留主干逻辑：

```python
def generate(self, prompts, sampling_params, use_tqdm=True):
    if not isinstance(sampling_params, list):
        sampling_params = [sampling_params] * len(prompts)

    for prompt, sp in zip(prompts, sampling_params):
        self.add_request(prompt, sp)

    outputs = {}
    while not self.is_finished():
        output, _ = self.step()
        for seq_id, token_ids in output:
            outputs[seq_id] = token_ids

    outputs = [outputs[seq_id] for seq_id in sorted(outputs.keys())]
    return [{"text": self.tokenizer.decode(token_ids), "token_ids": token_ids} for token_ids in outputs]
```

这段代码背后隐含了两个重要语义。

第一，它继承了我们在 `step()` 里看到的“非流式契约”：`output` 只在序列 finished 时才会出现，而且带的是累积 completion token。因此，`generate()` 的对外行为天然是“一次性返回最终结果”，而不是“边生成边回传”。如果你要把它改成 streaming，最直接的切口并不是在 `generate()` 里加 `yield`，而是让 `postprocess()`/`step()` 能返回增量 token 事件（每一步的 delta），再由 `generate()` 把事件向上层接口交付。

第二，它必须对输出做一次按 `seq_id` 的排序。原因也很工程：调度器为了吞吐/资源，很可能会让不同请求以不同速度完成；完成顺序与输入顺序并不一致。这里用 `seq_id` 把“执行顺序的不确定性”隔离在内部，保证对外返回仍然可预测。

到这里，Engine 这一章其实已经把整套系统的外壳讲完了：控制面协议、数据面形态、对外 API 语义都已确定。接下来进入 `### Scheduler`，我们会把镜头对准这个系统里最关键的“决策点”：在 KV 与 token budget 的硬约束下，到底每一步该跑哪些序列、该如何在 prefill 与 decode 之间取舍。


### Scheduler

前面 Engine 已经把协议钉死：每一步 `step()` 都要由 Scheduler 构造一个可执行 batch，然后交给 Runner 计算，再由 Scheduler 负责回填与资源回收。于是 Scheduler 在这个系统里变成了最“关键也最现实”的模块：它不是纯算法题，而是一个在硬约束下做启发式决策的资源管理器。

把 Engine 的三段式 loop 再写一遍，你会更清楚 Scheduler 的边界在哪里：`seqs, is_prefill = schedule()` → `token_ids = run(seqs, is_prefill)` → `postprocess(seqs, token_ids)`。Scheduler 至少要同时满足三类约束。

第一类是**接口契约**。Engine 只认识 `seqs` 与 `is_prefill`，Runner 只回 `token_ids`。因此 Scheduler 必须保证 batch 的顺序稳定、语义明确，并且能在 `postprocess()` 中仅凭 `(seq, token_id)` 推进状态机（追加 token、判断 stop、标记 finished）。

第二类是**资源契约**。Engine 不直接管理 KV cache，那么 Scheduler 就必须替它管住 KV：什么时候可以让一个序列进入 batch、什么时候必须拦住，乃至什么时候要回收或抢占。也正因此，哪怕 nano-vLLM 很小，仍然需要一个 `BlockManager` 作为 paged KV 的雏形：没有“分页 + 分配器”，你就很难在高并发 decode 里保证不会超用显存。

第三类是**系统目标**。Engine 的循环里没有优先级、deadline 或 cost model 的入口，意味着所有“吞吐 vs 尾延迟”的权衡只能发生在 Scheduler 内部：prefill 与 decode 如何取舍、waiting/running 如何组织、KV 不够时怎么处理。换句话说，在这个架构里，Scheduler 是唯一能系统性影响 TTFT（prefill 相关）与 TPOT（decode 相关）的地方。

如果把这些话压缩成一句话：Scheduler 必须完成“可执行 batch 的构造（prefill/decode 的选择与组合）、KV 的预算/分配/追加/回收、以及请求状态的推进与终止”。

---

#### 从“物理事实”到最小实现：你至少需要哪些零件

从推理系统的物理约束出发，一个最小但可用的 Scheduler 往往会自然地长成下面的样子。

它首先需要一个**队列与状态机**：最直观的是 waiting/running 两个队列（finished 通过标志位或回收逻辑体现）。新请求进 waiting；被 prefill 且成功分配 KV 后进入 running；decode 推进直到结束，结束时释放 KV 并从 running 移走。这个骨架足以跑通端到端。

然后你需要把“能不能进 batch”变成可计算的判定，也就是**硬预算**。最常见的两个预算是 `max_num_seqs`（每一步最多并发多少条序列）与 `max_num_batched_tokens`（prefill 一步最多吃多少 token）。工业级系统会把预算切得更细（prefill chunk budget、decode budget、甚至用 cost model 估算 step time），但在 nano 级别，先把这两根“硬栏杆”立起来就够了。

接着是**paged KV 的抽象**。把每条序列的 KV 看成由固定大小 block 组成：prefill/append 之前必须确保有足够 block；执行完成或被抢占后回收 block。这个抽象正是 vLLM paged attention 思想的核心之一（当然 vLLM 的 block 管理更复杂，会叠加 swap、prefix 复用、跨请求共享等能力）。

最后是“KV 不够时怎么办”。从系统角度看，你只有几个方向：要么施加 backpressure（拒绝/延后），要么 preempt（抢占并回收别人），要么 offload（swap/CPU），要么干脆把 prefill 与 decode 拆成不同实例（disaggregated prefill/decode）。nano-vLLM 选择了最直接的 preempt；vLLM 则更常通过 chunked prefill + continuous batching 降低长 prefill 对 decode 的独占，从而缓解尾延迟。

当你把这些零件搭起来之后，可观测性通常是“顺手就做”的最后一件事：暴露每步 prefill token 数、decode token 数、preempt 次数、KV block 利用率等计数，让上层能看见系统到底在怎样做取舍。nano-vLLM 目前只用 `num_tokens` 做了最简吞吐统计，但工业界通常会把这些指标作为调参闭环的输入。

---

#### 如果把 Engine 往工业界演进，Scheduler 会先被迫改变什么

站在你现在这个“同步、非 streaming、prefill/decode 二选一”的 Engine 上往前看，Scheduler 的演进方向其实很清晰：它要么改变对外契约（支持 streaming/混排），要么变成更强的缓存/内存管理器（prefix caching、分层 KV），要么扩展“一步推进 1 token”的假设（speculative/jump decoding）。

其中最直接的变化是 streaming：`postprocess()` 不能再只负责“更新内部状态”，而必须产出可被上层消费的增量事件（例如 `(seq_id, delta_token_id, finished_flag)`），这样 Engine 才能在每个 decode step 把 delta token 交付给 client。

再往前一步是 continuous batching + chunked prefill：`schedule()` 不再只是返回一个全局 `is_prefill`，而要能描述一个混合 batch（哪些序列在跑 prefill chunk，哪些在跑 decode token），并把 token budget 在两类工作之间分配。vLLM 与 SGLang 的很多性能差异，最终都会体现在这类“混合 batch 的细节”上。

当系统开始做 prefix caching 时，Scheduler 的角色会进一步上移：它不只是分配私有 KV block，而要能“查找并复用已有前缀对应的 KV pages”。这通常会引入前缀索引结构（例如 vLLM 的 automatic prefix caching，SGLang 常见 radix tree/RadixAttention），以及缓存感知调度（优先调度能命中缓存的请求以提升 hit rate）。

最后，speculative/guided decoding 等优化会迫使 Scheduler 从“一步 1 token”的简化假设里走出来：它需要用更统一的进度抽象来描述“一步可能推进多个 computed tokens”，从而把 speculative、chunked prefill、prefix caching 等优化统一到同一个调度框架里。

---

**回到 nano vLLM**

1. 队列与状态机
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
这段类定义把 nano-vLLM 的调度器“骨架”讲得非常清楚：它维护 `waiting`/`running` 两条队列，在每一步 `schedule()` 里决定本轮跑 prefill 还是 decode，并通过 `BlockManager` 做 KV cache 的分配/追加/回收，确保显存不会超用。

在 `__init__()` 里，Scheduler 把 Engine 装配出来的约束固化成自己的“预算参数”：`max_num_seqs` 控制每一步能并发多少条序列，`max_num_batched_tokens` 控制 prefill 一步最多吞多少 token，`eos` 则用于 `postprocess()` 的 stop 判定。这也解释了为什么 Engine 必须在创建 Scheduler 之前先把 `config.eos` 填好：Scheduler 会把它复制到 `self.eos`，后续就以它为准推进状态机。

`BlockManager` 可以理解为 KV cache 的内存分配器/记账器，它给 Scheduler 提供了一组“可调度性判定”接口：prefill 前问 `can_allocate(seq)`，decode 追加前问 `can_append(seq)`，真正进入 batch 时调用 `allocate/may_append` 记账，结束或抢占时 `deallocate` 归还 block。核心点在于：Scheduler 决定“能不能把某个 seq 放进 batch”，不是只看 `max_num_seqs` 这种数量上限，还必须把 KV block 是否够用一起纳入判定，否则系统在高并发下很快就会把显存打爆。

队列本身用的是 `deque`，两端 push/pop 都是 O(1)，非常适合做“头尾插入”的调度小动作。你可以把这两条队列的语义理解为：waiting 里是“还没拿到 KV 的请求”，running 里是“已经分配了 KV、可以持续 decode 推进的请求”。它们之间的典型流转是：

- 新请求 `add()` 进入 waiting；
- prefill 被调度且成功 `allocate` 后，从 waiting 移到 running；
- 运行完成（FINISHED）或被抢占（preempt）时，释放 KV 并从 running 移走；被抢占的序列会被塞回 waiting 的队首（`appendleft`），形成一种非常朴素的“优先恢复被抢占者”的策略，尽量避免饿死。

2. prefill 的 schedule
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
prefill 的策略非常“教科书”：严格 FCFS（只看 waiting 队首），再叠加两道硬门槛——token budget 与 KV budget。它每次只尝试把 waiting 队首的序列塞进 batch：如果 `num_batched_tokens + len(seq)` 超过 `max_num_batched_tokens`，或者 `BlockManager.can_allocate(seq)` 为假，就直接 `break` 结束装载。这意味着一个很典型的现象：即使队列后面还有更短的请求，本轮也不会插队进来（head-of-line blocking）。nano-vLLM 选择了更简单的实现与更清晰的行为，而不是在这里做更复杂的“短请求优先”或 cost model。

当一个序列被装入 prefill batch 时，`allocate(seq)` 会为它分配 KV block，并把它从 waiting 移到 running。这里有一个细节体现了“控制面契约对齐”的重要性：`num_batched_tokens` 的增长用的是 `len(seq) - seq.num_cached_tokens`，也就是只把本轮新增要计算的 token 计入预算；对应地，Runner 在 prefill 打包输入时也会用 `seq.num_cached_tokens` 截取未缓存部分。两边只要有一边算错，轻则吞吐统计不准，重则直接把 batch 形状与 KV 写入搞乱。

3. prefill/decode 二选一：`if scheduled_seqs: return scheduled_seqs, True` 明确说明只要能做任何 prefill，本 step 就不会 decode。它牺牲了 decode 的尾延迟稳定性，换取简单的推理引擎实现。

从系统语义上看，这行 `return` 非常重要：只要本轮能装进任何 prefill 序列，Scheduler 就不会进入 decode 分支。这等价于一种“prefill 优先”的策略：新请求会被尽快吃进来换取更好的 TTFT，但代价是 decode 的尾延迟可能更不稳定（长 prompt 的 prefill 容易独占多个 step）。工业界通常会用 chunked prefill/continuous batching 来缓解这件事，但 nano-vLLM 在这里选择了最简的二选一。

4. decode 的 schedule
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
decode 的逻辑可以用一句话概括：尽量让 running 队列头部的若干序列各生成 1 个 token；如果 KV 追加空间不够，就从 running 队尾开始抢占，释放出 block 让前面的序列能继续前进。

实现上，Scheduler 从 running 队首 `popleft()` 拿一个序列，先问 `can_append(seq)`：如果不能追加，就优先抢占 running 队尾的序列（`running.pop()`），把它踢回 waiting 并释放它的 KV；如果 running 已经空了仍然 append 不动，代码会把当前序列也 `preempt` 回 waiting 并 `break`。在正常情况下（能 append），它会调用 `may_append(seq)` 记账并把该序列加入本轮 `scheduled_seqs`。

> [!note] 一个边界情况
> decode 分支最后有 `assert scheduled_seqs`。也就是说，如果系统已经走到 decode 分支，但因为 KV 极度紧张导致本轮一个序列都无法 append，那么这里会触发断言失败。这更像是 nano 实现为了简化逻辑而保留的“未覆盖边界”：工业级系统通常会在这里施加 backpressure、阻塞等待、或触发更强的内存层级策略，而不是直接 assert。

5. decode 后把本批 seq 放回队首：
`self.running.extendleft(reversed(scheduled_seqs))` 这个细节非常关键。因为 decode 时我们把若干序列从 running 头部 `popleft()` 拿出来推进了一步，如果不把它们放回去，running 队列就会被“掏空”；而把它们放回队首还能制造一种很强的局部性：刚刚 decode 过的序列在下一步仍然更容易被选中，从而形成更连续、更稳定的 per-request 延迟。这里用 `reversed` 是为了抵消 `extendleft` 的“反向插入”行为，保持相对顺序不被颠倒。

6. postprocess
```python
    def postprocess(self, seqs: list[Sequence], token_ids: list[int]) -> list[bool]:
        for seq, token_id in zip(seqs, token_ids):
            seq.append_token(token_id)
            if (not seq.ignore_eos and token_id == self.eos) or seq.num_completion_tokens == seq.max_tokens:
                seq.status = SequenceStatus.FINISHED
                self.block_manager.deallocate(seq)
                self.running.remove(seq)
```

`postprocess()` 则是“状态与资源一致性”的收口点。它严格用 `zip(seqs, token_ids)` 对齐更新：把 token 追加进 `Sequence`，再基于 EOS 或 `max_tokens` 判定 FINISHED。一旦结束，它会立刻 `deallocate` 回收 KV block，并从 running 中移除该序列。你可以把它理解为：调度器不仅决定“算什么”，还必须负责把“算出来的结果”变成系统状态机的下一步，并把资源释放干净。

这里的 `self.running.remove(seq)` 是线性查找，规模小的时候完全可接受；但在大规模并发时会变成热点。工业级实现通常会用更适合的数据结构（例如链表节点句柄、哈希集合、或专门的 running pool）来避免在关键路径上做 O(n) 的移除。

### Model Runner

从 Engine 的视角看，`ModelRunner` 是“数据面”的唯一入口：`call("run", seqs, is_prefill)` 这一跳必须完成一次真实的模型计算，并把输出 token 严格按 `seqs` 的顺序对齐返回。与此同时，它还要吞下 Scheduler 产出的 KV 元数据（block tables、slot mapping 等），把控制面语言翻译成 attention kernel 真正需要的寻址信息。在多卡 TP 场景下，这个约束会更硬：所有 rank 必须同步步进，否则 Engine 的 step 协议就会被时序撕裂。

因此，理解 ModelRunner 最好的方式不是从某个函数开始，而是把它必须承担的职责拆成几块“物理工作”：

首先是**数据准备**。prefill 与 decode 两条路径的张量形状与语义不同：prefill 需要把每条序列未缓存的 token 组成 ragged batch（常见做法是扁平化 input_ids + cu_seqlens），同时为 KV 写入构造 `slot_mapping`；decode 则更接近“每序列一个 last_token”，但需要为每条序列准备 `context_lens`、`block_tables` 等上下文，确保 attention 能把新 token 写到正确的 KV 槽位。

其次是**KV cache 的物理承载**。Runner 要根据显存预算分配一块足够大的 KV 缓存（通常按 block/page 组织），并把它绑定到每一层 attention 模块上（例如通过 `k_cache/v_cache` 指针或 buffer 引用）。Scheduler 负责“谁用多少”，Runner 负责“把 KV 放在什么地方，以及怎么写进去”。

然后是**把寻址上下文交给 attention 实现**。nano-vLLM 用了一个很直白的做法：通过 `set_context/get_context/reset_context` 维护一个全局上下文，让 attention kernel 在 forward 时读取 `slot_mapping/context_lens/block_tables/cu_seqlens...`。这在工程上有争议（全局状态容易被踩），但作为极简实现，它让“控制面→数据面”的信息流非常直观。

再往下是**执行路径优化**。decode 往往是小 batch、频繁 step，容易被 launch overhead 吃掉；因此 nano-vLLM 和 vLLM 一样，会倾向在 decode 里用 CUDA Graph replay，在 prefill 或大 batch 时走 eager，以换取更稳定的吞吐。

最后是**并行控制**。TP 需要初始化进程组、正确绑定 GPU、做必要的通信同步，并在 driver/worker 架构下把“run/exit 指令”可靠地广播到各 worker。nano-vLLM 用 NCCL + spawn，再叠加共享内存与 Event 做命令分发，是一种很典型的“最小可用”方案。

---

**如果把 Engine 往工业界演进，ModelRunner 会先被迫改变什么**

和 Scheduler 类似，Runner 的演进也常常不是“想优化就优化”，而是被上层契约逼出来的。最常见的几条主线是：

1）混合 batch / chunked prefill：Runner 需要在同一个 forward 内同时处理“部分序列是 prefill chunk、部分是 decode token”。这要求 prepare 阶段能构造更丰富的上下文，而不是只靠一个全局 `is_prefill` 布尔值切两条路径。vLLM 之所以能把 prefill chunk 与 decode 放进同一批，关键就在于 Scheduler 输出更丰富的 batch 描述，Runner 能据此构造 attention backend 需要的张量布局。

2）prefix caching（跨请求复用）：Runner 的 prefill 准备阶段要能引用“别的请求留下的 KV pages”，block tables 与 slot mapping 的来源不再是单个 `Sequence` 的私有状态，而会来自一个全局 cache index（例如 vLLM automatic prefix caching；SGLang 常见 radix tree/RadixAttention，并配合 LRU eviction）。

3）speculative decoding：Runner 不再只输出 1 个 token，而可能一次输出 k 个候选 token 并验证（draft+verify 或其它变体）。这会改变 `run()` 的返回形态与 postprocess 的推进逻辑；对应地，Scheduler 也会被迫从“一步 1 token”升级为“基于 computed tokens 的进度推进”的统一抽象。

4）多机/多实例与 disaggregated prefill/decode：Runner 需要把 KV cache 从“本地 GPU 内存”抽象成“可传输/可共享”的对象，至少要能在 prefill 实例与 decode 实例间交换 KV。此时 KV 的物理映射从本地 HBM 扩展到网络与远端内存，系统目标也更接近 goodput 而不只是单卡 tok/s。

---

**回到 nano vLLM**

#### 1. 初始化与运行时环境配置

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

        # 建立分布式并行环境，绑定GPU
        dist.init_process_group("nccl", "tcp://localhost:2333", world_size=self.world_size, rank=rank)
        torch.cuda.set_device(rank)
        default_dtype = torch.get_default_dtype()
        torch.set_default_dtype(hf_config.torch_dtype)
        torch.set_default_device("cuda")

        # 构造模型结构并加载权重
        self.model = Qwen3ForCausalLM(hf_config)
        load_model(self.model, config.model)

        # 创建采样器
        self.sampler = Sampler()

        # 预热
        self.warmup_model()
        self.allocate_kv_cache()

        # 可选的性能优化，根据设备支持cuda graph与否而启用
        if not self.enforce_eager:
            self.capture_cudagraph()

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

    def warmup_model(self):
        torch.cuda.empty_cache()
        torch.cuda.reset_peak_memory_stats()
        max_num_batched_tokens, max_model_len = self.config.max_num_batched_tokens, self.config.max_model_len
        num_seqs = min(max_num_batched_tokens // max_model_len, self.config.max_num_seqs)
        seqs = [Sequence([0] * max_model_len) for _ in range(num_seqs)]
        self.run(seqs, True)
        torch.cuda.empty_cache()
```

从 `__init__()` 的主线来看，这段代码并不是在“做很多杂事”，而是在完成一件非常明确的工作：把一次推理所需的运行时环境装配好，并把后续 `run()` 能稳定复用的资源提前准备出来。它大致分成几步：建立分布式环境并绑定 GPU → 构造模型并加载权重 → 创建采样器 → warmup → 分配 KV cache →（可选）捕获 CUDA Graph → 恢复默认 dtype/device，避免污染外部环境。

其中几项配置字段对理解 Runner 的行为非常关键。

**`config.hf_config`** 是 Hugging Face 的模型配置（在 `config.py` 的 `__post_init__` 中通过 `AutoConfig.from_pretrained(config.model)` 加载）。Runner 会用它来确定默认计算 dtype（例如 fp16/bf16）、构造模型结构，也会在 `allocate_kv_cache()` 等地方用模型结构参数（层数、hidden size、KV heads 等）估算 KV cache 的开销，并在 `capture_cudagraph()` 里据此确定一些 buffer 的形状。

**`config.kvcache_block_size`** 决定 KV cache 的 block 粒度（一个 block 覆盖多少 token 的 KV）。这相当于把 KV 的资源管理从“按 token”提升到“按 block/page”：一方面影响 `allocate_kv_cache()` 的缓存布局与每块大小，另一方面也决定 `prepare_prefill/prepare_decode()` 里 `slot_mapping` 的线性映射规则（常见形式是 `block_id * block_size + offset`）。

**`config.enforce_eager`** 是性能与可调试性的开关：为真时强制走 eager（禁用 CUDA Graph），为假时允许捕获并在 decode 里 replay，从而减少每步的 launch overhead。实际工程里遇到动态 shape、cudagraph 不稳定、或需要调试时，往往都会把它打开。

**`config.tensor_parallel_size`（以及 `rank`）** 决定这是单卡还是多进程多卡 TP。`dist.init_process_group(..., world_size, rank)` 把各进程加入同一 NCCL 组；`torch.cuda.set_device(rank)` 约定 rank i 使用第 i 张卡；KV cache 的分配也会随 world size 做切分（例如 KV heads 按 rank 分摊）。

你还会看到代码里多次切换全局默认 dtype/device，最后再恢复。这是为了让 Runner 内部创建张量时更省事（默认就在 GPU、默认 dtype 与模型一致），但又不把这种全局状态泄漏到外部模块或用户代码里。

`warmup_model()` 的目的也不是得到有意义的输出，而是把后续会走到的推理路径先跑一遍：触发 CUDA kernel 的 lazy init，让 cuBLAS/cuDNN 内部缓存与 PyTorch allocator 行为更稳定，同时为后续的 CUDA Graph capture 减少“捕获到意外分支”的概率。紧接着的 `allocate_kv_cache()` 会测量显存可用量、写回 `config.num_kvcache_blocks`，并在 GPU 上真实分配 `self.kv_cache`，再把每层 attention 的 KV 指针绑定到这块大缓存上。注意这里和 Engine 的配合也很关键：Engine 必须先构造 `ModelRunner` 让 `config.num_kvcache_blocks` 变成真实值，再创建 Scheduler/BlockManager，否则调度器根本不知道 KV 的上限在哪里。

#### 2. 跨进程协同（IPC/RPC）

这里我们开始进入 nano-vLLM 里最“工程味”的部分：多进程 TP 的协同。目标其实很明确：**每个 GPU 对应一个进程（一个 rank）**，所有 rank 共同参与一次前向计算（NCCL 通信），但只有 rank0 负责采样出 token id 并把结果返回给 `LLMEngine`。

回到 `LLMEngine.__init__()` 的装配过程：它用 `torch.multiprocessing.get_context("spawn")` 拿到 `ctx`，然后为 `rank=1..tp-1` 依次启动子进程，入口就是 `ModelRunner(config, rank, event)`（把类当作可调用对象使用，本质上就是执行一次 `__init__` 完成装配并进入 worker 的常驻循环）。rank0 则在主进程里直接构造一个 `ModelRunner`，扮演 driver，用来发出 `run/exit` 指令并聚合结果。
这一点在代码里对应两条路径：主进程（rank0）会直接创建 `ModelRunner(config, 0, self.events)`，作为 driver；子进程（rank>0）在执行完 `__init__` 装配后，会进入一个常驻循环等待命令。

在进入“命令分发”之前，每个进程都必须先完成两件事：加入同一个 NCCL 进程组、并绑定到正确的 GPU。也就是你在 `ModelRunner.__init__()` 里看到的：

- `dist.init_process_group("nccl", "tcp://localhost:2333", world_size=self.world_size, rank=rank)`：以 TCP 地址做 rendezvous，把所有 rank 拉进同一个分布式组。
- `torch.cuda.set_device(rank)`：约定 rank i 使用第 i 张卡（单机多卡最常见的写法）。

之后 Runner 会临时切换默认 dtype/device（例如 `torch.set_default_dtype(hf_config.torch_dtype)`、`torch.set_default_device("cuda")`），让模型权重、KV cache 等张量的创建落在正确的设备与精度上；末尾再恢复默认值，避免污染外部环境（前一节已经解释过这一点）。

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

    def loop(self):
        while True:
            method_name, args = self.read_shm()
            self.call(method_name, *args)
            if method_name == "exit":
                break

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

    def call(self, method_name, *args):
        if self.world_size > 1 and self.rank == 0:
            self.write_shm(method_name, *args)
        method = getattr(self, method_name, None)
        return method(*args)
```

LLMEngine 只需要调用 rank0 的 `ModelRunner.call("run", ...)`，rank0 会把“命令”广播给所有 worker（rank>0），让它们也执行同一个 `run()`，从而满足 NCCL 并行计算“所有 rank 必须同时进入同一段分布式计算”的要求。

这段实现里最核心的机制是：rank0 用“共享内存 + Event”把命令广播给所有 worker；worker 永远在 `loop()` 里阻塞，等被唤醒后执行同名方法。配合 `dist.barrier()`，这套协议确保了一个对 NCCL 至关重要的性质：**所有 rank 会以完全相同的顺序进入 collective**，从而避免“某些 rank 进入下一次 all-reduce、另一些还停在上一次”的错位死锁。

你可以把它读成一个最小 RPC：

- 初始化阶段：rank0 创建具名共享内存（1MB），然后所有 rank `dist.barrier()` 对齐时序；rank>0 在 barrier 之后打开同名共享内存并进入 `loop()` 常驻。
- 写入阶段（rank0）：`write_shm()` 把 `[method_name, *args]` 用 pickle 序列化，先写 4 字节长度头，再写 payload，最后 `event.set()` 唤醒所有 worker。
- 读取阶段（worker）：`read_shm()` 先 `event.wait()`，再按长度头读取 payload 并反序列化，清掉 event，返回 `method_name` 与参数。
- 分发阶段：`call()` 在 rank0 上先广播命令，再本地执行；在 rank>0 上只执行本地方法。这样一条 `ModelRunner.call("run", seqs, is_prefill)` 就能让所有 rank 同步进入同一次 `run()`。

退出路径也遵循同样的“广播 + 同步”思路：rank0 广播 `exit`，worker 执行 `exit()` 后跳出循环；共享内存先 `close()`，再 `barrier()` 对齐，最后由 rank0 `unlink()` 删除命名对象，然后销毁进程组。

> [!note] 一个非常现实的约束：`Sequence` 必须可序列化
> 因为 rank0 会把 `seqs`（`Sequence` 列表）直接 pickle 后通过共享内存广播给 worker，所以 `Sequence` 里放的必须是可 pickle 的 Python 数据结构（token ids、block_table 等）。如果你往 `Sequence` 里塞 GPU tensor、句柄或不可序列化对象，这条协议就会立刻崩掉——工业级系统通常会用更“瘦”的 request 描述（id + 共享 buffer）来避免在控制面传重对象。

#### 3. KV cache 分配

这里的核心思想是：**先让 ModelRunner 在 GPU 上算出“最多能放多少 KV cache blocks”**，把结果写回 `config.num_kvcache_blocks`，然后 Scheduler 再用这个上限去做 block 级别调度与抢占。

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

这段 `allocate_kv_cache()` 做了三件事：测量“我还能用多少显存”、把 KV cache 的开销换算成“每个 block 多少字节”、最后据此算出能分配多少 block，并把一块大 KV tensor 绑定到每一层 attention 上。

第一步是显存测量。`torch.cuda.mem_get_info()` 给的是“整个 GPU 的空闲/总显存”（系统视角，包含其它进程）；而 `torch.cuda.memory_stats()` 给的是“本进程的 PyTorch allocator 视角”（含 `peak/current` 等统计）。这两个视角要同时看，才能做出更稳一点的估算。

第二步是估算一个 KV block 的字节数：它与层数、block size、KV heads、head_dim、dtype 字节数成正比，最前面的 `2` 表示 K/V 两份缓存；TP 情况下 `num_kv_heads` 会按 `world_size` 切分（每张卡只存自己那份 heads）。

第三步是把“可用显存预算”除以 `block_bytes` 得到 `config.num_kvcache_blocks`。代码里用的是 `total * utilization - used - (peak - current)` 这种更保守的写法：它等价于在预算里额外扣掉 PyTorch 可能重新占用的缓存空间（`peak-current`），从而降低后续分配/运行时突然 OOM 的风险。

> [!note] 为什么不直接用 `free`？
> 因为 `free` 看见的是系统层面的空闲显存，但 PyTorch allocator 的缓存与碎片会影响“能否分配出足够大的连续块”。用 `peak-current` 做修正是一种常见的工程启发式：它让估算偏保守，从而换取更稳定的运行。

一旦 block 数确定，Runner 就会分配 `self.kv_cache = torch.empty(...)` 这一块大缓存，并遍历模型的子模块，把每层的 `k_cache/v_cache` 指到对应切片上。之后 attention 写 KV 就不需要再临时分配缓冲区了。

与 Scheduler/BlockManager 的关键配合：

- 在 LLMEngine 里，先创建 `ModelRunner(config, 0, ...)`，它会在 `__init__` 中调用 `allocate_kv_cache()` 并写回 `config.num_kvcache_blocks`；**之后才创建 `Scheduler(config)`**。
- 而 Scheduler 在 `__init__` 里会立刻构造 `BlockManager(config.num_kvcache_blocks, config.kvcache_block_size)`。
    所以这个顺序是刻意的：**必须先“测出并写回 blocks 上限”，再初始化调度器，否则 BlockManager 的容量就是错的**，会直接影响能否 allocate/append/preempt。

#### 4. prefill 输入打包

prefill 的目标：一次性把多条序列的“尚未缓存的 prompt tokens”送进模型，让模型建立/填充 KV cache。

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

`prepare_prefill(seqs)` 的结构是典型的“收集 Python 列表 → 转 GPU tensor”流程：
你可以把它分成三段来读：先在 Python 侧把“本批要算的 token”扁平化收集起来，再把这些列表转成 GPU tensor，最后把 attention 真正需要的寻址元信息塞进 context。

`prepare_block_tables()` 的作用很单一：把每条序列的 `block_table` pad 到相同长度（用 `-1` 补齐无效项），再转成 `torch.int32` 搬到 GPU。它只在“本批的 K 长度大于 Q 长度”时才需要（也就是存在已缓存前缀、attention 需要读取历史 KV 的场景），所以 `prepare_prefill()` 里会用 `cu_seqlens_k[-1] > cu_seqlens_q[-1]` 作为一个简单的触发条件。

`prepare_prefill()` 则是在构造一批 ragged prefill 的输入表示：

- `input_ids`/`positions`：只收集每条序列“尚未缓存”的那段 token（从 `seq.num_cached_tokens` 开始），并为它们生成对齐的位置索引。
- `cu_seqlens_q`/`cu_seqlens_k` 与 `max_seqlen_q/max_seqlen_k`：用前缀和的形式描述 ragged batch（拼接后的每条序列在大扁平张量里占哪一段），分别对应 query（本轮新 token）与 key/value（全上下文）。
- `slot_mapping`：把“本轮要写入 KV 的每个新 token”映射到“KV cache 大数组里的物理槽位”。它依赖 Scheduler/BlockManager 事先分配好的 `seq.block_table`：先定位到物理 block，再用 `block_size` 与 block 内 offset 计算线性槽位。

当这些列表准备好后，代码用 `torch.tensor(..., pin_memory=True).cuda(non_blocking=True)` 把它们搬到 GPU，再通过 `set_context(...)` 把 `cu_seqlens/slot_mapping/block_tables` 等元信息交给 attention 层读取。这样 forward 的函数签名可以保持简单，但 attention 仍然能拿到它需要的寻址上下文。

> [!note] `pin_memory=True` + `non_blocking=True` 在做什么
> `pin_memory=True` 会让 CPU 侧张量落在页锁定内存（更利于 DMA 传输）；配合 `.cuda(non_blocking=True)`，H2D 拷贝可以更容易与 CPU 侧的下一步准备工作重叠。在 step 很密集、每步都要准备一堆小张量的推理场景里，这个小技巧经常能让吞吐更稳。
> - **CPU 利用率**：对于需要连续准备数据并送 GPU 的场景（如训练循环），使用 pinned memory + 异步传输可以显著提高 CPU 有效利用率，整体性能可能提升 20%~50% 甚至更高（取决于计算与传输的比例）。
> - **实际收益**：如果数据量较小（如 < 1 MB），传输延迟本就可忽略，收益不大；但对于大尺寸张量（如大模型推理时的 KV 缓存、大批量输入），收益非常显著。

#### 5. decode 输入打包

decode 的目标：对一批正在 running 的序列，各生成 **下一个 token**。因此每条序列本轮只需要喂一个 token（上一步生成的 token），并且要告诉模型“上下文长度”和“下一 token 应写到 KV cache 的哪个槽”。

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

`prepare_decode(seqs)` 的数据组织更简单：
decode 的张量形状比 prefill 更规整：每条序列只输入 1 个 token，因此 `input_ids/positions/context_lens/slot_mapping` 都是长度为 `batch_size` 的一维数组。

关键在于 `slot_mapping`：它告诉 attention “这一步计算出来的 KV 应该写到 KV cache 的哪个槽位”。nano-vLLM 这里用的是最直接的线性寻址：取最后一个物理 block（`seq.block_table[-1]`），再加上最后一个 block 内的偏移（`seq.last_block_num_tokens - 1`），得到一个全局槽位索引。

decode 分支里每次都会准备 `block_tables = prepare_block_tables(seqs)` 并写入 context，因为 decode 的 attention 必须读取完整历史 KV，而历史 KV 分布在多个 block 上，离不开 block table 去做页表式寻址。

与 Scheduler 的配合点也在这里：Scheduler 在 decode 前调用 `block_manager.may_append(seq)`，相当于把“我要追加 1 个 token”的资源与页表状态先准备好（必要时扩一个新 block，推进 `last_block_num_tokens` 等计数）。这样 Runner 才能在不做额外决策的情况下，直接用 `seq.block_table/last_block_num_tokens` 算出正确的 `slot_mapping`。

> [!note] 为什么 prefill 有时不需要 `block_tables`，decode 却几乎总需要？
> prefill 在“全新 prompt”场景下主要是写 KV（slot mapping 足够）；只有当存在前缀缓存、需要读取历史 KV 时才需要 block table。decode 则每一步都要读取全部历史 KV，因此 block table 更像是 decode 的必需品。

#### 6. 执行与采样

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

这三段函数合在一起，就是 Runner 的“最小数据面闭环”：

- `prepare_sample()` 从每条 `Sequence` 里抽取采样温度等参数（这里只实现了 temperature），搬到 GPU 上，供采样器使用。
- `run_model()` 负责真正执行模型前向并返回 logits。它有两条路径：prefill 或大 batch / 强制 eager 时直接走 eager；decode 且小 batch 且允许时走 CUDA Graph replay（从 `graph_vars` 里读固定缓冲，写入本轮 input 与 context，再 `graph.replay()`）。
- `run()` 把“输入打包 → forward 得到 logits → rank0 采样 token → reset_context 清理”串起来。尤其注意这里的 TP 语义：所有 rank 都会算 logits，但只有 rank0 负责采样并返回 token ids，其它 rank 返回 `None`。

这也解释了 Runner 与 Scheduler 的职责分界：Runner 只做“算 + 采样”，不做“是否结束/何时回收”。请求状态机与 KV block 的回收完全由 Scheduler 在 `postprocess()` 里负责。

> [!note] 为什么 CUDA Graph 更适合 decode，而不是 prefill？
> decode 每步输入形状更稳定、重复次数更多，CPU launch overhead 更容易成为瓶颈；CUDA Graph 把一串 kernel 调用固化下来，重放时能显著减少调度开销。prefill 的输入长度与 ragged 形状更动态（`cu_seqlens/max_seqlen` 等随 batch 波动），图的复用价值更低，反而更适合直接 eager。

#### 7. 性能优化

这部分覆盖 `capture_cudagraph()`、`run_model()` 的图路径、以及 `exit()` 的释放顺序。它们共同目标是：**decode 阶段小 batch 高频调用时减少 Python 与 kernel launch 的开销，同时保证退出干净**。

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

`capture_cudagraph()` 是 decode 性能优化的“准备阶段”：它提前为一组常见 batch size 捕获 CUDA Graph，并预分配一批固定形状的输入/输出缓冲（`graph_vars`）。这样在真正 decode 时，`run_model()` 只需要把本轮的 `input_ids/positions` 和 context（`slot_mapping/context_lens/block_tables`）写进这些固定缓冲，然后 `graph.replay()` 就能以很低的 CPU 调度开销重放整段前向。

这里有三个实现细节值得抓住：

第一，分桶捕获。`self.graph_bs = [1,2,4,8] + [16,32,...]` 是一种折中：它覆盖常见小 batch，又避免为每个整数 bs 都捕获一张图（那会浪费时间与显存）。运行时用“最小的 >=bs 的桶”来复用图。

第二，固定形状缓冲与内存池复用。Graph 捕获要求内存地址稳定，因此 `input_ids/positions/block_tables/outputs` 都要提前分配，之后只能做原地写入。代码从大到小遍历 bs，是为了让 `graph_pool` 一次性分配到足够大，后续小图复用同一池，减少碎片与重复分配。

第三，context 的传递方式。图路径不会直接读取 `get_context()` 返回的对象，而是把其中的数据拷贝进 `graph_vars` 的固定张量里，再 replay。也就是说，图模式下的“上下文输入”本质是“写入固定缓冲”，而不是“动态对象引用”。

和 Engine 的配合也很直接：Engine 通过 rank0 的 `call("exit")` 广播退出，让所有 worker 清理共享内存、释放 cudagraph 相关资源，并销毁进程组；主进程最后 `join()` 等待 worker 干净退出。

> [!note] 退出顺序为什么是“shm → cudagraph → synchronize → destroy_process_group”
> 核心目标是避免资源仍在被使用时就提前销毁：先 barrier 对齐并由 rank0 `unlink` 掉共享内存；再释放 graph/内存池引用；再 `torch.cuda.synchronize()` 等所有 kernel/通信完成；最后销毁进程组，让 NCCL 资源干净落地。

### KV Cache Block Manager

Engine 的三段式协议决定了一个事实：Scheduler 能否构造“可执行 batch”，最终取决于两类东西是否一致——请求的逻辑进度（Sequence）与 KV cache 的物理映射（BlockManager）。这也是为什么在 serving 系统里，Sequence/BlockManager 往往是最“像操作系统”的部分：它们在逻辑世界（token 序列）与物理世界（KV pages/blocks）之间做映射与资源管理。

把 `schedule() → run() → postprocess()` 的契约再对齐一遍，你就能看出上层到底需要它们提供什么。

`Sequence` 是请求状态的载体，它既要让 Scheduler 看见“这个请求现在到哪了”（状态机、长度、stop 规则），也要让 Runner 拿到“该怎么打包输入以及怎么寻址 KV”（未缓存 token、last token、block table 等）。其中最关键的一类信息是缓存进度：`num_cached_tokens/num_cached_blocks` 决定 prefill 需要从哪里开始算，也决定 prefix cache 与抢占恢复能不能成立。

`BlockManager` 则是 KV cache 的资源管理器。Scheduler 会用它做三类判定与动作：prefill 前能否分配（`can_allocate/allocate`），decode 前能否追加（`can_append/may_append`），以及 finish/preempt 时的回收（`deallocate`）。Runner 不直接调用 BlockManager，但它完全信任 BlockManager 通过 `seq.block_table` 暴露出来的“页表”——只要页表或计数不变量错了，attention 的寻址就会直接写错 KV。

如果不看代码、只从设计出发，Sequence/BlockManager 最重要的一条启发式其实来自 decode 的时序：**写入 KV 的对象是“当前输入 token”（last token），而不是“本步采样出来的新 token”**。新 token 会在下一步成为输入时才被写进 KV。你后面会看到 nano-vLLM 的 `may_append()` 正是利用了这个事实，把“是否需要新 block/是否要固化 hash”提前做在 Runner 之前，从而保证 `slot_mapping` 总能写到正确的槽位。

往工业界对齐时，这层的演进也很有规律：

- 当上层从 non-streaming 走向 streaming，Sequence 需要引入“增量游标”（例如已交付到哪里），否则你无法把 completion token 变成可重复交付的事件流。
- 当上层做 continuous batching / chunked prefill，Sequence 的进度不再是一个 `num_cached_tokens` 就够，而需要更细粒度的“已计算/待计算”状态；BlockManager 往往也会引入 lookahead slots 等机制来降低调度与执行的耦合。
- 当 prefix caching 变成跨请求的核心能力，BlockManager 会从“简单 hash + refcount”变成更完整的缓存管理器：eviction（LRU/clock）、更严格的 Copy-on-Write、以及更复杂的前缀索引结构（vLLM 偏 hash-based，SGLang 常见 radix tree）。
- 当 preemption 更真实（swap/offload/压缩），BlockManager 需要表达的不再只是 free/used，而是更丰富的内存层级状态；Scheduler 也会随之变成 memory-aware / cache-aware。

---

**回到 nano vLLM**

如果把 KV cache 看成一段“按 token 轴增长的内存”，BlockManager 做的事情就像一个极简的页式内存管理：把 token 轴切成固定大小的 block（page），用 `block_table` 把逻辑块映射到物理块 id，并在这个映射之上实现分配、复用、追加与回收。

在 nano-vLLM 里，它的职责可以更具体地表述为四件事：

- **分配**：prefill 前为 `Sequence` 建立 `block_table`（每个逻辑块分配一个物理块 id）。
- **复用**：如果某段前缀块内容完全一致，就用 refcount 共享同一个物理块（prefix caching 的雏形）。
- **追加**：decode 过程中根据块边界决定“是否需要新块/是否刚填满一个块”，并维护这些状态不变量。
- **回收**：序列完成或被抢占时，递减 refcount，归零的物理块回到 free list。

你会发现这和 vLLM PagedAttention 的核心思想高度同构：固定大小的 block pool + free list、用 refcount 支持共享、用内容指纹（hash）做前缀匹配（nano 选择 hash-based；SGLang 常见 radix tree 这条路线则更偏显式结构）。

#### 1. Block 的定义

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

`Block` 是一个“物理块”的抽象，它身上只有三类信息：引用计数、内容指纹、以及用于二次校验的 token 列表。`ref_count` 决定了共享块能不能被回收；`hash` 只在“整块满了”时才有效（不满块会继续变化，不适合作为稳定缓存单元）；`token_ids` 则用来做 hash 命中的二次校验，避免哈希碰撞或陈旧映射导致错误复用。

#### 2. BlockManager 初始化与 hash 的计算

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

BlockManager 本身是一个典型的“池 + 索引”结构：`free_block_ids` 提供 O(1) 的空闲块分配，`used_block_ids` 记录哪些块处于使用中，`hash_to_block_id` 则提供“内容指纹 → 物理块”的查找，用于前缀复用。

`compute_hash(token_ids, prefix=-1)` 的设计体现了一个重要的工程取舍：它不是只对“当前块内容”做哈希，而是把前一块的 hash 混进来，形成**链式哈希**。这样第 i 块的指纹不仅取决于本块 token，也取决于从开头到 i-1 的整段前缀，能更准确地表达“前缀完全一致”这一复用条件。至于哈希算法，nano-vLLM 选了速度很快的非加密哈希 `xxhash`，并在命中时用 `token_ids` 做二次校验，把碰撞风险压到可接受范围。

#### 3. 分配块：`allocate` 如何建立 block table，并如何推进 `num_cached_tokens`？

```python
    def _allocate_block(self, block_id: int) -> Block:
        """分配某个block的工具函数
        """
        block = self.blocks[block_id]
        assert block.ref_count == 0
        block.reset()
        self.free_block_ids.remove(block_id)
        self.used_block_ids.add(block_id)
        return self.blocks[block_id]

    def can_allocate(self, seq: Sequence) -> bool:
        return len(self.free_block_ids) >= seq.num_blocks

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

`allocate(seq)` 是把一个“逻辑序列”挂到“物理 KV 页面”上的第一步：它遍历该序列的每个逻辑块，为它填满 `seq.block_table`，并在可能的情况下把前缀命中缓存（推进 `seq.num_cached_tokens`）。

这里有三条关键不变量：

- `allocate()` 返回后，`len(seq.block_table) == seq.num_blocks`，每个逻辑块 i 都能通过 `seq.block_table[i]` 找到对应的物理 block。
- 只有发生 prefix cache hit（命中历史满块）时，才会推进 `seq.num_cached_tokens`。
- 只有“整块满了”的块才会参与缓存：不满块的 `h = -1`，因为它未来还会被追加、内容不稳定，缓存价值与正确性都不可靠。

把循环逻辑按语义读一遍会更清晰：每次取出 `token_ids = seq.block(i)`，如果这是一个满块，就计算链式 hash `h`，再用 `hash_to_block_id` 查有没有历史块命中。命中时还会用 `self.blocks[block_id].token_ids == token_ids` 做二次校验，避免碰撞或陈旧映射。未命中（或二次校验失败）就从 `free_block_ids` 分配一个新物理块；命中则共享该物理块（必要时增加 `ref_count`），并把 `seq.num_cached_tokens` 按 block_size 推进。

命中时 `block.update(h, token_ids)` 之所以同时写 hash 与 token_ids，是因为 BlockManager 维护的是“物理块视角”的内容：在 miss 或“命中但该物理块当前并未处于 used”时，这个 block 可能刚被 reset，内部没有 token_ids；只有当命中且被其它序列共享使用时，物理块上才已经存着正确的 token_ids。统一用 `update()` 写一遍，可以把两种来源的状态收敛到一致。

这也带来一个很有用的性质：`num_cached_tokens` 只按整块累计，因此 `num_cached_blocks = num_cached_tokens // block_size` 永远是整数。这让 Runner 在 prefill 时能安全地跳过缓存前缀，而不会出现“块内对齐”被打乱的问题。

---

`allocate()` 与 `prepare_prefill()` 之间还有一条非常关键的“跨模块契约”：为什么 Runner 构造的 `slot_mapping` 一定能指到正确的 KV 槽位？答案是它依赖两件事同时成立：`seq.block_table` 给出了逻辑块到物理块的页表，`seq.num_cached_tokens` 则告诉 Runner “前缀有多少 token 已经拥有可复用的 KV”。

因此 prefill 打包时会出现两个对齐动作：

- 输入侧：只把未缓存的 token 送进模型（`seq[seq.num_cached_tokens:]`），缓存前缀不再作为 query 参与计算。
- 写入侧：只为未缓存区间生成 `slot_mapping`，并且从第一个未缓存块开始（`range(seq.num_cached_blocks, seq.num_blocks)`），把每个物理 block 的线性槽位区间串起来。

如果你把“逻辑 token 下标 p”映射到“线性槽位 slot”的规则写成公式，会发现它非常简单：

- `block_id = seq.block_table[p // block_size]`
- `offset = p % block_size`
- `slot = block_id * block_size + offset`

`slot_mapping` 做的事情就是：把“未缓存区间”的这些 `slot` 按 token 顺序拼成一个数组，交给 attention/kv 写入逻辑使用。也因此，`num_cached_tokens` 必须按整块推进：只要缓存前缀在块边界对齐，slot 的拼接顺序就不会错位。

当存在 prefix cache 时，Runner 还会额外准备 `block_tables`（pad 成矩阵传给模型），让 attention 在读取历史 KV 时能通过页表寻址。你在 prefill 路径里看到的 `cu_seqlens_k > cu_seqlens_q` 判断，本质就是在检测“key/value 的上下文长度比本轮 query 更长”，也就是存在一段来自缓存的历史 KV。

#### 4. decode 中如何将新 token 正确添加到 block 中？

decode 路径里最容易让人迷惑的一点是：为什么 Scheduler 要在调用 ModelRunner 之前先做 `block_manager.may_append(seq)`，以及 `prepare_decode` 的 slot_mapping 如何保证永远指向“本轮要写 KV 的那个槽位”？

你可以把每一轮有 prefix caching 的 decode 理解成：**对每条 seq，把它“当前最后一个 token”喂进模型，得到“下一个 token”，然后把新 token append 到 seq**。因此：

- 本轮模型输入的 token 是最后一个 token： `input_ids.append(seq.last_token)`
- 本轮需要写 KV 的位置，正是这个 `last_token` 对应的位置（也就是 position = `len(seq) - 1` 的那一格）

于是 `prepare_decode` 里：

- `positions.append(len(seq) - 1)`：当前最后 token 的位置
- `slot_mapping.append(seq.block_table[-1] * block_size + seq.last_block_num_tokens - 1)`：
    - `seq.block_table[-1]` 取最后一个逻辑块对应的物理块 id
    - `seq.last_block_num_tokens - 1` 就是“最后一个 token 在最后一个块内的偏移”
    - 两者合成“最后 token 的线性槽位”

---

那么 `may_append(seq)` 在 decode 前做什么？它的作用是维护两个不变量：

```python
    def can_append(self, seq: Sequence) -> bool:
        return len(self.free_block_ids) >= (len(seq) % self.block_size == 1)

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

把 `may_append()` 放在 Runner 之前，本质是在维护两个“寻址不变量”：

1）当我们即将写入某个 token 的 KV 时，`seq.block_table[-1]` 必须指向**当前应写入的物理块**；否则 `slot_mapping` 会写错块。
2）当某个物理块被“写满”后，它必须被固化为可缓存单元（计算 hash、写入索引），否则后续 prefix cache 就无从谈起。

代码里用 `len(seq) % block_size` 这一个模运算就把块边界状态机分成三种情况：

- **余数为 1**：序列刚跨过整块边界，进入一个新块的第一个 token。此时必须先分配一个新物理块并 `block_table.append(new_block_id)`，保证后续 `slot_mapping` 能写到新块上。也正因如此，`can_append(seq)` 只在这个时刻要求 free list 至少有 1 个块（这里利用了 Python 的布尔值可当作 0/1 参与比较：`(cond)` 在需要新块时为 1，否则为 0）。
- **余数为 0**：刚好填满一个块。此时不需要新块，但需要把这个满块计算 hash 并写入 `hash_to_block_id`，使其未来可作为 prefix cache 复用；链式哈希会把前一块的 hash 混进来，保证“整段前缀一致”才会命中。
- **其它余数**：块未满。此时不做结构性变化，只要求 `last_block.hash == -1`（不满块不应带 hash）。

换句话说：`may_append()` 是把“页表更新 + 缓存索引维护”提前到执行之前做完，从而让 Runner 能在不做任何资源决策的前提下，直接把 `slot_mapping` 算对、把 KV 写对。

#### 5. 回收块

```python
    def _deallocate_block(self, block_id: int) -> Block:
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

Scheduler 在序列处理 FINISHED 或被抢占时会调用 `BlockManager.deallocate(seq)`，它做三件事：

第一步是按 `seq.block_table` 逆序递减 refcount：只有当某个物理块的 `ref_count` 归零，它才真正回到 `free_block_ids`。这正是共享块能安全释放的必要条件——最后一个引用者离开之后才能回收。

第二步是把 `Sequence` 上与物理映射相关的字段清空：`seq.block_table.clear()` 与 `seq.num_cached_tokens = 0`。这里看似“粗暴”，但它体现了 serving 系统里常见的正确性优先策略：一旦物理块被回收，旧页表就可能指向已经被重用的块；一旦 KV 被释放，所谓“已缓存前缀”也就不再成立。把这两项清零，强制后续重新走 `allocate/prefill` 去建立 KV，宁可多算，也不允许写错 KV。

### Sequence

`Sequence` 模块的定位是：把“一条生成请求”的所有**可调度状态**和**与 KV-cache 分块相关的信息**封装成一个轻量、可序列化（可跨进程传输）的对象。Scheduler 只需要操作 `Sequence`（入队、出队、抢占、结束），ModelRunner 只需要读取 `Sequence`（打包输入、计算 slot_mapping），BlockManager 只需要更新 `Sequence` 的两个关键字段（`block_table`、`num_cached_tokens`）来维护前缀复用与物理块映射。

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

`SequenceStatus` 定义了请求的生命周期状态机：Scheduler 在 `schedule()` 中把 `WAITING → RUNNING`，在 `postprocess()` 中把 `RUNNING → FINISHED`，在 `preempt()` 中把 `RUNNING → WAITING`。Engine 本身不推进状态机，它只负责驱动 step；真正的推进与回收都发生在 Scheduler/BlockManager 侧。

而 `Sequence` 这个类之所以重要，是因为它把“请求的逻辑状态”与“KV 的物理映射”放在同一个可序列化对象里，让三个模块能用最小信息闭环：

- Engine/Scheduler 关心的是身份与生命周期（`seq_id/status`）、停止条件（`max_tokens/ignore_eos`）以及长度进度（`num_tokens/num_prompt_tokens`）。
- Runner 关心的是打包输入所需的 token（prefill 用 `token_ids[num_cached_tokens:]`，decode 用 `last_token`）以及 KV 寻址元信息（`block_table/last_block_num_tokens`）。
- BlockManager 关心的是两项可被调度与复用的“资源口径”：`block_table` 与 `num_cached_tokens`。

> [!note] `block_size` 的一致性非常关键
> 这里把 `Sequence.block_size` 写死成了 `256`。如果你在 Config/BlockManager 里把 `kvcache_block_size` 改成别的值（例如 512），而 `Sequence` 的 `num_blocks/last_block_num_tokens/block(i)` 仍然按 256 计算，那么 `slot_mapping` 会系统性错位。工程上一般会让这些 block_size 都从同一份配置派生，避免出现“双口径”的隐蔽 bug。

---

`Sequence` 重要的派生属性：

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

这些派生属性的价值在于：把“token 序列的逻辑视图”包装成一个对调度与执行都友好的接口。

`__len__`/`__getitem__` 让 `Sequence` 像列表一样可切片（例如 `seq[seq.num_cached_tokens:]`），这正是 prefill 打包时最自然的写法。`is_finished` 则是 Engine 层收割完成序列时用到的语义封装。

输出相关的属性（`prompt_token_ids/completion_token_ids`、`num_completion_tokens`）把 prompt 与生成部分分开，让 Engine 返回时不需要再写重复的切片逻辑。

更关键的是分块相关的属性：`num_blocks/last_block_num_tokens/num_cached_blocks/block(i)` 把“块边界”这件事统一到一个口径上。只要这些口径与 BlockManager 的 `block_size` 一致，那么：

- BlockManager 在 `allocate/may_append` 中不需要重复推导块内偏移；
- Runner 也只需要信任 `block_table` 与这些派生属性，就能把 token 正确映射到 KV cache 槽位。

---

`Sequence` 状态推进的最小原子操作：

```python
def append_token(self, token_id: int):
    self.token_ids.append(token_id)
    self.last_token = token_id
    self.num_tokens += 1
```

`append_token()` 把本轮 `ModelRunner.run()` 采样得到的 `token_id` 加入序列。Scheduler 的 `postprocess()` 逐个 `(seq, token_id)` 调用 `seq.append_token(token_id)`。

为什么放在 Sequence 内：确保 `token_ids`、`last_token`、`num_tokens` 三者始终一致（避免外部忘改某个字段）。

这一步之后，Sequence 的 `num_blocks`、`last_block_num_tokens` 可能发生变化，从而触发 BlockManager 在 decode 前的 `may_append(seq)` 行为（是否需要新块、是否需要固化 hash 等）。

---

为多进程的共享内存传输优化：

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

这部分是理解 “为什么 worker 进程能拿到 `Sequence`” 的关键——ModelRunner 的 rank0 会把要执行的方法名与参数通过 `pickle` 写进共享内存，worker 读取后 `pickle.loads(...)` 得到 `seqs` 并执行 `run(seqs, ...)`。因此 `Sequence` 必须可 pickle。

`Sequence` 在这里做了一个非常现实的工程优化：自定义 pickling 行为，把“跨进程要传的状态”压缩到最小。`__getstate__` 返回一个五元组：

`(num_tokens, num_prompt_tokens, num_cached_tokens, block_table, payload)`。

其中 `payload` 会随阶段变化：如果还没进入 decode（`num_completion_tokens == 0`），就把完整 `token_ids` 传过去，让 worker 能正确打包 prefill 的 ragged 输入；一旦进入 decode，就只传 `last_token`，因为 decode 每步只需要一个 token，继续传整段 `token_ids` 会让 IPC 成本线性膨胀。

对应地，`__setstate__` 会按同样规则恢复对象：prefill 阶段恢复完整 token 列表，decode 阶段只恢复 last token。你可以把它理解为：**prefill 保真、decode 极致减载**——这是 nano-vLLM 用共享内存广播“重对象参数”时，最关键的一个成本控制点。
