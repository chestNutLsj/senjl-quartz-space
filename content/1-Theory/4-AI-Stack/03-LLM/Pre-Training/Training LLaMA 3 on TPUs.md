---
date: 2026-01-28T18:12:36+08:00
tags:
  - clippings
  - PreTraining
---
> 本文截取自 [互联网博客：The Scaling Book](https://jax-ml.github.io/scaling-book/applied-training/) 并加入自己的翻译和理解。需要注意，目前翻译版本是适合我本人的阅读习惯和知识基础，如果读者有困惑，可以回到原文查看。

本节将基于前文所述的扩展定律与计算理论，深入探讨在 Google TPU v5p 集群上训练 LLaMA 3 模型的工程实践。我们将重点分析不同规格模型的参数规模、各配置下的训练成本，以及模型在算力单元上的切分方案。通过对真实模型的“量级估算”（Back-of-the-envelope estimates），我们将理论分析转化为具体的工程参数。

## 1. What does LLaMA 3 look like?

LLaMA 3 模型家族主要由 8B、70B 和 405B 三个版本组成。我们将以核心型号 70B 为主进行详细拆解，8B 和 405B 版本则留作课后练习。根据 [HuggingFace 官方发布的配置文件](https://huggingface.co/meta-llama/Meta-Llama-3-70B/blob/main/config.json)，LLaMA 3-70B 的超参数定义如下表所示：

$$
\begin{array}{ccc}
\hline
\text{hyperparam} & \text{value} & \text{含义} \\
\hline
n_{\text{layers}}\ (L) & 80 & \text{层数} \\
d_{\text{model}}\ (D) & 8{,}192 & \text{模型维度} \\
d_{\text{ff}}\ (F) & 28{,}672 & \text{FFN 中间层维度} \\
n_{\text{heads}}\ (N) & 64 & \text{注意力头数} \\
n_{\text{kv\_heads}}\ (K) & 8 & \text{KV 头数} \\
d_{qkv}\ (H) & 128 & \text{每个头的维度} \\
n_{\text{embeddings}}\ (V) & 128{,}256 & \text{词表大小} \\
\hline
\end{array}
$$

```json
{
  "_name_or_path": "meta-llama/Meta-Llama-3-70B-Instruct",
  "architectures": [
    "LlamaForCausalLM"
  ],
  "attention_bias": false,
  "attention_dropout": 0.0,
  "bos_token_id": 128000,
  "eos_token_id": 128001,
  "hidden_act": "silu",
  "hidden_size": 8192,              // 模型维度
  "initializer_range": 0.02,
  "intermediate_size": 28672,       // FFN 中间层维度
  "max_position_embeddings": 8192,
  "model_type": "llama",
  "num_attention_heads": 64,        // 注意力 head 数量
  "num_hidden_layers": 80,          // 模型总层数
  "num_key_value_heads": 8,         // KV head 数量
  "pretraining_tp": 1,
  "rms_norm_eps": 1e-05,
  "rope_scaling": null,
  "rope_theta": 500000.0,
  "tie_word_embeddings": false,
  "torch_dtype": "bfloat16",        // 精度
  "transformers_version": "4.40.1",
  "use_cache": true,
  "vocab_size": 128256              // 词表大小
}
```

在工程实践中，建议维护一份涵盖主流开源 LLM 的参数对比表，这有助于快速对比不同模型在架构设计上的权衡。

## 2. Counting parameters and FLOPs

**Question:** 基于上述架构参数，我们能否准确推算出 LLaMA 3-70B 的实际参数量？让我们应用 [[All the Transformer Math You Need to Know|Section 4.]] 的方法论，验证其是否符合 70B 的标称规模。

$$
\begin{array}{ccc}
\hline
\text{param category} & \text{formula} & \text{count} \\
\hline
\text{FFW params} &
d_{\text{model}} \times d_{\text{ff}} \times 3 \times n_{\text{layers}} &
8{,}192 \times 28{,}672 \times 3 \times 80 = 56.3 \times 10^{9} \\
& \text{(SwiGLU: Gate, Up, Down)} & \\
\\
\text{Vocab params} &
2 \times n_{\text{embeddings}} \times d_{\text{model}} &
2 \times 128{,}256 \times 8{,}192 = 2.1 \times 10^{9} \\
& \text{(input + output embeddings)} & \\
\\
\text{Attention params} &
n_{\text{layers}} \times \big[2 d_{\text{model}} n_{\text{heads}} d_{qkv} + 2 d_{\text{model}} n_{\text{kv\_heads}} d_{qkv}\big] &
80 \times (2 \times 8{,}192 \times 64 \times 128 + 2 \times 8{,}192 \times 8 \times 128) = 12 \times 10^{9} \\
\\
\textbf{Total} &  & 56.3B + 2.1B + 12B = 70.4 \times 10^{9} \\
\hline
\end{array}
$$

可以观察到，前馈网络的参数量在总参数中占据了绝对主导地位，而注意力虽然占比相对较小，但其参数规模依然不可忽视。

**Takeaway**: MLP 模块中的三个核心权重矩阵规模庞大，在进行显存占用（Memory Footprint）或计算量（FLOPs）的定性分析时，我们甚至可以近似忽略其他参数。在 LLaMA 3-70B 中，MLP 贡献了 56B 的参数量，约占总量的 80%。

---

**Question:** 在训练阶段，LLaMA 3 处理每个 Token 的单步 FLOPs 是多少？该指标是衡量整个训练生命周期资源开销的关键。

**Answer**: 根据 [[All the Transformer Math You Need to Know|Section 4.]]，训练时每个 Token 消耗的算力近似为 $6 \times \text{参数量}$。对于 70B 模型，计算量约为 $4.2 \times 10^{11}$ FLOPs/Token（即每个 Step 每个 Token 消耗约 0.42 TFLOPs）。在理想的算力利用率（100% Utilization）且处于计算受限（Compute-bound）的状态下，单颗 TPU v5p 处理一个 Token 的时间约为 $1ms$（基于 TPU v5p 峰值算力 $459 \text{ TFLOPS}$ 计算）。

---

**Question:** LLaMA 3 的预训练语料规模约为 15 万亿 (15T) Tokens。整个训练过程的总算力开销是多少？

**Answer**: $4.2 \times 10^{11} \times 15 \times 10^{12} = 6.3 \times 10^{24}$ FLOPs。这意味着如果使用单颗 TPU v5p 进行训练，训练将耗时约 $6.3\times10^{24} / 459\times10^{12}\approx435$ 年。

---

**Question:** 假设我们使用一个完整的 TPU v5p Pod（包含 $16 \times 20 \times 28 = 8,960$ 颗芯片）进行训练。在 bfloat16 精度下，若MFU达到 40% 且处于计算受限状态，完成训练需要多长时间？

**Answer**: 已知单颗 TPU v5p 的峰值性能为 $4.59 \times 10^{14}$ FLOPs/s。在 40% MFU 的效率下，总时长 $T = \frac{6.3 \times 10^{24}}{8960 \times 4.59 \times 10^{14} \times 0.4} \approx 3.8 \times 10^6$ 秒。**折合时间约为 44 天。** 考虑到 40% MFU 在超大规模集群中是一个极具挑战但合理的工程目标，这一训练周期是非常可控的。

---

**Question:** LLaMA 3-70B 的预训练 Batch Size 约为 400 万 (4M) Tokens。在保证能跑通该 Batch Size 的前提下，最少需要多少颗 TPU？_假设：参数使用 bfloat16 存储，优化器状态使用 float32 存储，每层采用 4 次梯度检查点机制。_

**Answer**: 这是一个关于 HBM（高带宽内存）容量边界的典型问题。训练时的内存开销主要由三部分组成：模型参数、优化器状态和激活值重算（梯度检查点）。基于 bfloat16 权重、float32 优化器状态（Adam 优化器通常每参数占用 8 字节）以及极其保守的重算策略，显存占用如下：

$$
\begin{array}{ccc}
\hline
\text{Memory Item} & \text{Formula} & \text{Size} \\
\hline
\text{Params} &
2~\text{bytes} \times 70B &
\sim 140~\text{GB} \\
\\
\text{Optimizer State} &
(4+4)~\text{bytes} \times 70B &
\sim 560~\text{GB} \\
\\
\text{Gradient Checkpoints} &
2 \times 8192 \times 4\times 10^{6} \times 4 \times 80 &
\sim 20.9~\text{TB} \\
\\
\textbf{Total} &  & \sim 21.6~\text{TB} \\
\hline
\end{array}
$$

总显存需求约为 21.6TB。显而易见，即使在保守配置下，梯度检查点（激活值缓存）仍占据了显存消耗的绝大部分。虽然可以通过增加重算频率或使用微批处理（Microbatching）进一步压低内存，但目前的估算具有代表性。由于每颗 TPU v5p 配备 96GB HBM，理论上仅需 $21.6\times10^{12} / 96\times10^9=225$ 颗 TPU 即可承载。

_既然 225 颗 TPU 就能存下模型，为什么不这样做？_ 原因是时间效率极其低下：按照 225 颗芯片的规模，训练周期将从 44 天拉长至 1752 天（近 4 年）。**这在工程上是不可接受的。** 由此可见，构建万卡级超大集群的初衷并非内存受限（Memory-bound），而是为了获取海量的算力（FLOPs）以缩短训练周期。

---

**Question:** 在上述假设不变的情况下，如果我们将模型部署在 8,960 颗 TPU v5p 上，单芯片的平均内存占用是多少？

**Answer**: 总内存需求约为 21.6TB，分配到 8,960 颗芯片上，单芯片仅占用约 2.4GB，这对于 96GB 的 HBM 来说微不足道。即使采用更激进的检查点策略（如每层 12 个 Checkpoint），单卡占用也仅约为 8GB。在高缩放倍率的并行训练中，我们远未触及内存瓶颈。

---

**Takeaways**: 理论上可以在极小规模的拓扑结构上训练超大模型，但代价是极长的研发周期。掌握训练全过程的总 FLOPs 计算方法，可以让我们在设定合理的 MFU 预期和集群规模后，快速估算出训练的时间成本，从而为算法迭代提供决策依据。

### How to shard LLaMA 3-70B for training

沿用前文设定的实验环境：在包含 8,960 颗芯片的 TPU v5p Pod 完整集群上，训练Global Batch Size为 400 万（4M）Tokens 的 LLaMA 3-70B 模型。该批次具体由 1024 条长度为 4096 的序列组成。我们将深入探讨针对该模型规模与集群拓扑的最优切分策略。

**Question:** 在上述条件下，能否仅通过FSDP来实现训练？作为初步假设，我们暂不考虑任何Sequence Parallelism或Context Parallelism。_从工程简化角度看，这通常是首选方案，因为若能跑通，它不会引入额外的通信开销。_

**Answer**: 由于 LLaMA 3-70B 的预训练序列长度为 4,096 ($4K$)，在 $4M$ Tokens 的总 batch 下，其“序列级批大小”（Sequence Batch Size）仅为 1024。这意味着在单一的 DP 或 FSDP 模式下，并行度的上限被限制在 1024 颗芯片——因为我们只有 1024 条独立的序列可供分发。因此，在不引入额外通信复杂度的前提下，单靠 FSDP 无法扩展到 8,960 颗芯片。

---

**Question:** 现在我们放宽限制，允许在序列维度进行切分。如果在 Batch 轴和 Sequence 轴上同时应用 FSDP，能否在 8,960 颗 TPU 芯片上实现 LLaMA 3-70B 的高效训练？

**Answer**: 引入序列/上下文并行后，理论扩展性得到了极大提升。首先计算单设备批大小（Per-device Batch Size）：在 8,960 路 FSDP 下，每颗 TPU 仅处理 $\frac{4 \times 1024 \times 1024}{8960} \approx 468$ 个 Tokens。根据前文推导，当单设备批大小低于 $\frac{2550}{M_X}$ 阈值时，FSDP 将受限于芯片间互连带宽。在拥有完整 3D 拓扑（3D Pod）的集群中，该阈值的下限约为 850。当前 468 的数值远低于此下限。**因此答案依然是否定的。即便利用了三维轴向并行，系统仍会陷入严重的通信受限状态。**

---

**Question:** 接下来考虑混合并行策略，即将 TP 与 FSDP 结合。是否存在某种配置组合能让训练保持在计算受限状态？如果存在，FSDP 与 TP 的具体比例应如何分配？

**Answer**: 已知若单芯片批大小低于 $\frac{2550^2}{2F} = 113$（此处 $F$ 为 FFN 中间层维度），系统将陷入通信受限。由前文可知，我们的数值略高于此阈值，这为优化提供了空间。为了确定最优的 FSDP 规模，我们应用以下经验公式：
$$
X_{opt} = \frac{2BN}{F} = \frac{2 \times 4.19 \times 10^6 \times 8960}{28672} \approx 1618
$$

将其取整至最接近的 2 的幂次方，我们得到：约 **2048 路 FSDP** 配合 **4 路TP**。这一配置组合能够实现算力与通信的平衡。

**Takeaways**: 要在完整的 TPU v5p Pod 上以 4M Batch Size 训练 LLaMA 3，必须采用混合并行方案：即 **1024 路数据并行**、**2 路序列并行** 与 **4 路张量并行**。只有这样才能避免通信受限。仅依赖 FSDP 或 FSDP + 序列并行的尝试都会导致严重的通信瓶颈。事实证明，前文推导出的 Roofline 模型公式在实际工程中具有极高的指导价值。

## Worked Problems

**Question 1 \[Scaling LLaMA 70B to more chips\]:** 假设我们希望在 4 个 Pod（约 3.5 万颗芯片）上训练 LLaMA 3-70B，且保持相同的全局批大小。此时应采用何种并行方案？系统会处于计算受限还是通信受限状态？预估训练时长是多少？_提示：请务必套用正确的 Roofline 边界函数。_

**Question 2 \[LLaMA 405B\]:**

(a) 参考 LLaMA 3-405B 的 [JSON 配置文件](https://huggingface.co/meta-llama/Llama-3.1-405B/blob/main/config.json)，参照前文格式整理一份超参数对照表。请计算：该模型的总参数量是多少？每训练步（Step）产生的 FLOPs 是多少？若训练 15T Tokens，总算力开销是多少？

(b) 假设在 8 个 TPU v5p Pod 上进行训练，应选择哪种并行策略？预计耗时多久？系统属于计算受限还是通信受限？