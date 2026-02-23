---
title: "Serving LLaMA 3-70B on TPUs | How To Scale Your Model"
author:
  - "[[Jacob Austin]]"
  - "[[Sholto Douglas]]"
  - "[[Roy Frostig]]"
  - "[[Anselm Levskaya]]"
  - "[[Charlie Chen]]"
  - "[[Sharad Vikram]]"
  - "[[Federico Lebron]]"
  - "[[Peter Choy]]"
  - "[[Vinay Ramasesh]]"
  - "[[Albert Webson]]"
published:
date: "2026-01-28T20:31:50+08:00"
description: "Let's take a close look at how we'd serve LLaMA 3-70B models on TPU v5e. How expensive are different models to serve at roofline? How large are their KV caches? What batch sizes should we use? How are the parameters and activations sharded during inference? Let's work through some back-of-the-envelope estimates for latency and throughput in production."
tags:
  - "clippings"
---
> 本文截取自互联网博客 [The Scaling Book: Section 8. Serving LLaMA 3-70B on TPUs](https://jax-ml.github.io/scaling-book/applied-inference/) 并加入自己的翻译和理解。需要注意，目前翻译版本是适合我本人的阅读习惯和知识基础，如果读者有困惑，可以回到原文查看。

我们来深入探讨如何在 TPU v5e 集群上部署 LLaMA 3-70B 模型。在性能受限于 Roofline 性能边界的情况下，不同规模模型的推理成本如何？其 KV Cache 会占用多大内存？在生产环境中，我们应当如何选择 Batch Size？推理过程中的模型参数和激活值又是如何进行分布式切分的？接下来，我们将针对生产环境下的 Latency和 Throughput进行初步的理论推演与估算。

## 1. What’s the LLaMA Serving Story?

首先，我们回顾一下 LLaMA 3-70B 的核心超参数配置： 
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

首先面临的问题是：**我们该选择哪种硬件进行部署？** 基本准则通常是选择单位成本下算力最高的硬件。虽然这一准则并非绝对——在某些场景下，更大的 HBM容量或 ICI带宽比单纯的 FLOPs 算力更关键——但它仍是一个有效的启发式评估指标。基于性价比考虑，我们通常选择 TPU v5e，这是目前专为推理任务优化的芯片（成本数据参考 2025 年 2 月的 [Google Cloud 报价](https://cloud.google.com/tpu/pricing)）：
$$
\begin{array}{cccc}
\hline
\textbf{TPU type} & \textbf{bfloat16 FLOPs/s} & \textbf{Google Cloud USD / hour} & \textbf{FLOPs / \$} \\
\hline
\text{H100} & 9.9 \times 10^{14} & 10.8 & 3.3 \times 10^{17} \\
\text{v5p}  & 4.59 \times 10^{14} & 4.2 & 3.9 \times 10^{17} \\
\text{v5e}  & 1.97 \times 10^{14} & 1.2 & \mathbf{5.8 \times 10^{17}} \\
\hline
\end{array}
$$

由于每颗 TPU v5e 仅配备了 16GB 的 HBM，这要求我们必须对模型进行激进的分布式切分。我们先来计算一些直接影响部署决策的核心物理量：

**Question:** 对于 LLaMA 3-70B，每个 Token 产生的 KV Cache 占用多大空间？_假设采用 INT8 量化存储。该数值直接决定了在特定拓扑结构下所能承载的最大 Batch Size。_

**Answer**：LLaMA 3-70B 采用了 GQA（Grouped Query Attention）机制，拥有 8 个 KV 头。因此，每个 Token 的存储需求为：$2 \times K \times H \times L = 2 \times 8 \times 128 \times 80 = 160\text{ KiB}$ 。

**请注意这个量级是惊人的！** 假设 Sequence Length 为常见的 32k Tokens，单条序列就会占用 $160 \times 10^3 \times 32,768 = 5.3GB$。当 Batch Size 为 240 时，总内存占用高达 1.3TB！鉴于每颗 TPU v5e 仅有 16GB 显存，我们至少需要 $(70 \times 10^9 + 1.3 \times 10^{12}) / 16 \times 10^9 = 86$ 颗 TPU v5e 芯片才能容纳这些数据（包括 70GB 的模型参数）。对比之下，KV Cache 的容量远超模型参数本身。

---

**Question:** 假设我们要部署 LLaMA 3-70B，参数和 KV Cache 均采用 INT8 量化，设置 Batch Size 为 32，Sequence Length 为 8192。总共需要多少内存？理论上支持该任务的最小计算节点切片（Slice）是多少？

**Answer**：在 INT8 量化下，每个 Token 的 KV 占用为 $160 \text{ KiB}$ ，则 KV Cache 总量为 $160 \times 8,192 \times 32 = 40\text{ GiB}$。模型参数由于是 INT8，占用 70GB。因此，总内存需求为 $110\text{ GiB}$。

最小可用切片理论上需要 $110 / 16 = 6.875$ 颗 TPU，向上取整至偶数拓扑，即为 TPU v5e `4x2` 规格（共 8 颗芯片）。考虑到系统开销和其他 Activation 的内存占用，这一配置会非常吃力，实际上可能至少需要 `4x4` 切片（16 颗芯片），或者必须缩减 Batch Size。

---

**Question:** 在上述 Batch Size 和量化配置下，使用 TPU v5e `4x2` 切片，每个 Decode Step 的 Latency 预计是多少？单芯片的 Throughput（每秒处理 Token 数）又是多少？如果换成 `4x4` 呢？_注：假设计算过程以 BF16 进行，且所有数据已实现完全切分（Fully Sharded）。_

**Answer**：我们可以调用前一章节推导的公式：
$$
\text{理论步时 (通用)} = \underbrace{\frac{B \times \text{KV Cache 大小}}{\text{内存带宽}}}_{\text{Attention (始终受访存带宽限制)}} + \underbrace{\max\left(\frac{2 \times B \times \text{参数量}}{\text{硬件算力峰值}}, \frac{\text{参数量}}{\text{内存带宽}}\right)}_{\text{MLP (可能处于计算受限或访存受限状态)}}\tag{1}
$$
由于模型参数采用了 INT8 存储但计算是在 BF16 下进行的，临界 Batch Size 约为 120。即便我们手动计算公式右侧 MLP 部分的最大值，结果也显而易见：当前的推理任务无论是在矩阵乘法还是算力利用上，**都处于严重的 Memory-bound 状态。**

单纯从内存带宽的角度计算，单步解码耗时约为 $(KV 占用 + 参数大小) / (8 \times HBM 带宽) = 112GB / (8 \times 810GB/s) = 17ms$。**即理论上的 Step Time 约为 17 毫秒。** 总吞吐量为 $32 / 0.017 = 1882$ tokens/s[^1]，折算到单芯片吞吐量为 $1882 / 8 = 235$ tokens/s/chip。

这里需要注意一个细节：需要检查矩阵乘法是否受限于 ICI 带宽。由于我们可以利用 2 个维度进行并行化，理论上当模型并行度 $Y$ 大于 $2 \times F / 2200 = 2 \times 28,672 / 2200 = 26$ 时才会触发 ICI 瓶颈。当前并行度为 8，因此通信性能完全符合预期。

如果在 `4x4` 切片上运行，ICI 通信依然不是瓶颈。单步 Latency 将由于带宽翻倍而下降至 $17 / 2 = 8.5ms$，但单芯片的 Throughput 将保持不变。

### Thinking about throughput

我们专门来分析一下吞吐量。在优化吞吐量时，理想状态是使系统进入“算力受限”状态，即尽可能压榨 TPU 矩阵乘法单元（Matrix Execution Unit, MXU）的峰值性能。通常情况下，这意味着我们需要尽可能增大 Batch Size，从而在单次访存中完成更多的计算任务。

**Question:** 在使用 TPU v5e 时，如果权重和激活值都采用 BF16 格式，Batch Size 需要达到多大才能使矩阵乘法进入算力受限状态？如果采用 INT8 权重但计算过程保持 BF16（即 W8A16 模式）呢？如果是全 INT8 的计算（W8A8）又是何种情况？

**Answer**：正如第 7 节所述，对于任意 $B \ll D, F$ 的 BF16 矩阵乘法，算力受限的判定条件如下：
$$
T_{math} > T_{comms} \leftrightarrow \frac{2BDF}{2DF} \ge \frac{\rm TPU\ bfloat16\ FLOPs/s}{\rm HBM\ bandwidth} = 240
$$
当我们采用 INT8 权重时，由于访存的数据量减半，分母中权重存储的系数减小，公式演变为 $2BDF / DF = 2B > 240$，即 $B > 120$。这意味着临界 Batch Size 减小了一半，这极大地降低了达到峰值性能的门槛。而如果我们采用 INT8 权重且同时使用 INT8 算力进行计算，由于 TPU 的 INT8 峰值性能（$3.94 \times 10^{14}$）几乎是 BF16（$1.97 \times 10^{14}$）的两倍，算术强度又回到了 $B > 240$ 左右。

INT8 权重配合 BF16 计算（W8A16）是一种非常普遍的方案。因为对参数进行近乎无损的量化相对容易，而实现高性能且高精度的低位宽算子逻辑（低精度算术运算）则更具挑战性。
The case of int8 weights and bfloat16 FLOPs is quite common, since quantizing parameters losslessly is often easier than doing low-precision arithmetic.

---

**Question:** 在 8k 上下文长度下，分别使用 BF16、INT8 和 INT4（同时针对 KV Cache 和模型参数）量化时，能够部署 LLaMA 3-70B 的最小 TPU v5e 拓扑结构是多少？_在此计算中，可以暂时忽略极小 Batch Size 下 KV Cache 的占用。_

Answer：如果我们不介意较小的 Batch Size，唯一的硬性约束就是 HBM 能否容纳模型参数。计算公式为：$\lceil \frac{\text{ 参数量}\times该数据类型字节数}{\text{memory per chip}} \rceil$ ，并向上取整至最接近的合理拓扑（通常为 2 的倍数）：

$$
\begin{array}{ccccccc}
\hline
\text{dtype} &
\text{param size} &
\text{KV size / token (bytes)} &
\text{min TPU v5es} &
\text{actual min slice} &
\text{remaining HBM for KV caches} &
\text{num KV caches @ 8k} \\
\hline
\text{bf16} & 140~\text{GB} & 324~\text{kB} & 8.75 & 4 \times 4 = 16~\text{chips} & 116~\text{GB} & 43 \\
\text{int8} & 70~\text{GB}  & 162~\text{kB} & 4.38 & 4 \times 2 = 8~\text{chips}  & 58~\text{GB}  & 43 \\
\text{int4} & 35~\text{GB}  & 81~\text{kB}  & 2.81 & 2 \times 2 = 4~\text{chips}  & 29~\text{GB}  & 43 \\
\hline
\end{array}
$$

结果显示，理论上我们甚至可以在一个 TPU v5e `2x2` 切片上运行 LLaMA 3-70B。然而，你会发现最大并发 KV Cache 的数量非常受限，这直接限制了 Batch Size。由于无法达到前述的临界 Batch Size，这种配置下的 MFU 会非常糟糕。在实际生产中，我们更倾向于扩展拓扑规模，以便将 Batch Size 推高到 240 以上。

---

**Question:** 假设我们使用这些拓扑结构所能承载的最大 Batch Size，每一 generate step 的预期延迟是多少？

Answer：由于我们通过调整 Batch Size 填满了整个 HBM，这个问题就简化为：将整颗 TPU v5e 芯片的 HBM 数据完全搬运到 MXU 单元需要多久。计算为：`16GB / 810GB/s = 19.7ms`，即**单步延迟约为 19 毫秒**。假设 generation 任务的长度为 512 Tokens（中位数），整个解码过程大约需要 9 秒。需要说明的是，如果减小 Batch Size，延迟会有轻微改善；例如在 INT4 模式下，如果仅加载模型参数而不填满 HBM，最小延迟可优化至约 10ms / step。

**Takeaway**: 解码延迟的理论下界取决于从 HBM 加载全量模型参数至 MXU 的时间。当 KV Cache 较小时，每一层的计算逻辑可以简化为：分块加载权重、执行计算、丢弃权重。除非 Batch Size 极大或跨设备通信极其频繁，否则这一 bound 通常是相当准确的（误差在 1.5 倍以内）。当 Batch Size 增加后，由于 KV Cache 的访存量开始超过模型参数，我们必须在模型中引入 KV Cache 的加载开销。

同理，在算力受限场景下（如模型训练或超大规模 Batch 推理），我们可以使用 $2 \times \dfrac{参数量\times \text{Batch Size}}{芯片数 \times 峰值算力}$ 作为性能下界，这代表了忽略通信开销后的理想极限。

---

**Question:** 针对上述各种配置，单芯片的吞吐量是多少（以每芯片处理的查询数衡量）？_假设解码任务的中位数长度为 512 Tokens。

Answer：这是一个核心指标，揭示了单位 token 的推理成本。基于中位数序列长度的假设，吞吐量计算公式为：$\dfrac{B}{单步延迟 \times 中位数步数 \times 芯片数} \approx \dfrac{43}{0.019 \times 512 \times N}$。即约为 $4.42 / N$ QPS。代入芯片数 $N$ 得到：
$$
\begin{array}{cc}
\hline
\textbf{dtype} &
\textbf{QPS/chip} & \\
\hline
\text{bf16} & 0.27 \\
\text{int8} & 0.55 \\
\text{int4} & 1.11 \\
\hline
\end{array}
$$

需要注意，这一估算结果偏向乐观，因为它完全忽略了前向传播中的工作内存（Working Memory，如分配给激活值和注意力机制的缓冲区）。虽然在应用 Flash Attention 后这部分开销大幅降低，但完全忽略仍不现实。实际数值可能仅为上述结果的一半。为了实现极限吞吐量，我们通常需要翻倍增加芯片数量，并大幅提升 Batch Size。

---

**Question:** 如果在上述示例中将拓扑规模翻倍，峰值吞吐量会发生怎样的变化？

Answer：如果我们使用 BF16 配置下的 `4x8` 切片，HBM 剩余空间将高达 372GB，这允许我们将 Batch Size 提升至 140。由于单步耗时由 HBM 总容量决定保持不变，总吞吐量变为 `14.39 / 芯片数`：
$$
\begin{array}{cc}
\hline
\textbf{dtype} &
\textbf{QPS/chip} & \\
\hline
\text{bf16 (on 4x8)} & 0.44 \\
\text{int8 (on 4x4)} & 0.90 \\
\text{int4 (on 2x4)} & 1.80 \\
\hline
\end{array}
$$

进一步扩大规模将带来更高的增益！核心结论是：**最小拓扑结构往往不是性能最优的拓扑结构**，特别是在受到 KV Cache 容量限制的情况下。

---

**Question:** 现在探讨 sharding 策略。假设我们要以 BF16 格式在 TPU v5e `4x8` 上进行部署，生成过程中应采用何种切分方式？我们能否避免陷入通信受限的境地？

Answer：正如前文所述，在生成阶段，模型并行几乎是唯一的切分选择。那么，在达到通信瓶颈前，我们可以扩展到多大规模？根据之前的推导，模型进入通信受限状态的条件大致为：
$$
Y > \frac{F \cdot M}{2200}
$$

对于 LLaMA 3-70B，$F = 28,672$。如果我们沿 2 个维度进行模型并行切分，则临界模型并行度 $Y = 28672 \times 2 / 2200 = 26$。这意味着通常我们可以在扩展到 16 颗芯片（即 `4x4` 拓扑）时仍保持计算效率，但扩展到 `4x8` 时则会遭遇通信瓶颈。考虑到计算与通信无法实现完全重叠，这一估算仍显乐观。

However, as we’ve discussed, when our batch size is small we can often do more model parallelism without significantly hurting throughput, since our model is memory-bandwidth-bound and not FLOPs bound. We said before that this value is roughly Y=F / (8\\cdot B), so if we did batch size 64, we could in theory go up to `Y = 28,672 / (8 * 64) = 56` way model parallelism before we become ICI-bound. To sanity check this, we can look at T\_\\text{ici comms}, T\_\\text{hbm comms}, and T\_\\text{math} for a single matmul. We clearly have:

$$
Tici comms=2BDWiciThbm comms=2DFY⋅WhbmTmath=2BDFY⋅C
$$

然而，正如我们讨论过的，当 Batch Size 较小时，我们往往可以采用更大的模型并行而不会显著牺牲吞吐量。这是因为模型此时受限于内存带宽而非算力。理论上，临界值约为 $Y = F / (8 \times B)$。若 $B=64$，模型并行的程度理论上可以扩展到 $28,672 / (8 \times 64) = 56$ 路才会受限于芯片间互联。为了验证这一点，我们可以拆解单次矩阵乘法的各部分耗时：
$$
T_{ici\_comms} = \frac{2BD}{W_{ici}} \quad T_{hbm\_comms} = \frac{2DF}{Y \cdot W_{hbm}} \quad T_{math} = \frac{2BDF}{Y \cdot C}
$$

对于 `4x8` 拓扑，$T_{ici\_comms} = \dfrac{2\times64\times8192}{9\times10^{10}}=11\mu s$，$T_{hbm\_comms} = \dfrac{2\times8192\times28672}{32\times8.1\times10^{11}}=18\mu s$，$T_{math} = \dfrac{2\times64\times8192\times28672}{32\times1.97\times10^{14}}=4\mu s$。显然，系统依然主要受限于 HBM 带宽，这非常理想！_值得注意的是，将规模从 `4x4` 扩展到 `4x8` 可能不会提升吞吐量上限，但由于单芯片负载减半，延迟会进一步降低。_

在 INT8 和 INT4 的配置下，纯模型并行是完全可行的。这揭示了量化的另一个核心优势：**除了提升算力利用率，它还允许我们在触发通信瓶颈之前承载更大的 Batch Size**。简而言之：BF16 配置在 `4x8` 上无法达到峰值吞吐，但 INT8 和 INT4 配置则可以游刃有余地使用纯模型并行方案。

**Tip**: 有效模型并行的最大程度取决于前馈网络维度（$d_{ff}$）以及切分轴的数量。根据模型规模的不同，这一上限通常在 8 到 32 之间。如果你的目标是极致降低延迟而非追求最高吞吐量，可以尝试突破这一上限。

### What about prefill?

之前我们大多忽略了 Prefill 阶段，因为其逻辑相对简单。现在，让我们结合几个核心概念，来构建一个端到端的全景认知。

**Question:** 假设在 Prefill 阶段我们能达到 40% 的算力利用率（MFU）。在 16 颗 TPU v5e 芯片上处理长度为 8192 的序列，Prefill 需要耗时多久？

Answer：当 Sequence Length 达到 8k 时，计算模式已完全进入算力受限状态，因此我们只需关注 FLOPs 的理论极限。已知模型拥有 70B 参数，则单次前向传播的计算量约为 $2 \times 70 \times 10^9 \times B$ FLOPs。在 40% MFU 的假设下，运行时间约为 $2 \times 70 \times 10^9 \times 8192 / (16 \times 1.97 \times 10^{14} \times 0.4) = 0.91s$。对比之前的 decode 阶段的数据，这个耗时相当长！

---

**Question:** 假设中位数 Prefill 长度为 8192，中位数解码长度为 4096。设定生成阶段的 Batch Size 为 32。平均每步（Step）有多少条序列完成解码？平均每步有多少个 Token 会从 KV Cache 中被剔除（Evicted）？

Answer：推导逻辑很直接。中位数解码长度为 4096，意味着平均每生成 4096 个 Token 就会有一条序列完成。当 Batch Size 为 32 时，每步平均有 $32 / 4096$ 条序列完成解码。由于此时 KV Cache 的平均总长度约为 $8192 + 4096$，因此每步被剔除的 Token 数为 $32 \times (8192 + 4096) / 4096 = 96$ 个。通用计算公式为 $B \times (P + G) / G$，其中 $P$ 和 $G$ 分别代表 Prefill 和 Generate 的长度。

This is kind of straightforward. Since we have a median decode length of 4096 tokens, a sequence will finish roughly every 1 / 4096 tokens. Given a batch size of 32, this means we have `32 / 4096` sequences evicted per step. Since our KV cache length is roughly `8192 + 4096`, this is `32 * (8192 + 4096) / 4096 = 96` tokens evicted per step. The general formula is B \* (P + G) / G where P and G are the prefill and generate lengths.

---

**Question:** 假设我们采用 PD 分离架构，Prefill 阶段中位数长度为 8192， decode 则为 512。基于前文 BF16 配置下的延迟估算，为了使 Prefill 服务器和 Decode 服务器都保持满载，两者的数量配比应该是多少？

Answer：这是一个非常有意思的流水线平衡问题。设 $P$ 为 Prefill 服务器数量，$G$ 为 Decode 服务器数量。Prefill 集群的生产速率为 $\dfrac{P}{\text{prefill\_{latency}}}$，Decode 集群的消费速率为 $\dfrac{B\times G}{\rm generate\_latency \times median\_decode\_length}$。根据前文，Prefill 耗时为 $910ms$，在 Batch Size 为 32（前文是基于 $B=43$ 估算）时单步解码耗时为 $19ms$。平衡方程为：$\dfrac{P}{0.91} = \dfrac{32\times G}{0.019 \times 512}$，解得 $P \approx 3G$。也就是说，我们需要 3 倍于 Decode 服务器数量的 Prefill 服务器来维持吞吐平衡。

## 2. Visualizing the Latency Throughput Tradeoff

Sticking with LLaMA 70B for a second, let’s actually look at the latency and throughput for different batch sizes during generation. As we showed in the previous section for PaLM models, this gives us a Pareto frontier for throughput/latency. Let’s assume 16-way tensor parallelism since that’s a reasonable bound on what we can use while staying compute-bound in the MLP blocks. We’ll use a TPU v5e 4x4 topology here. **The slider controls the sequence length so you can see the effect of larger KV caches.**
回到 LLaMA 70B，我们来分析解码阶段在不同 Batch Size 下的延迟与吞吐量表现。正如前一节针对 PaLM 模型的分析，这会形成一条“吞吐量-延迟”的帕累托曲线。我们设定  TP=16，因为这是确保 MLP 块接近算力受限边界的一个合理上限。硬件环境采用 TPU v5e `4x4` 拓扑。

该曲线可点击 [此链接](./assets/pareto.html) 查看，**可以通过滑动条调节序列长度，观察 KV Cache 增大带来的影响。**

- **观察成本与延迟之间剧烈的权衡关系。** 仅仅付出延迟翻倍的代价，我们就能让单位 Token 的成本降低约 100 倍。同时，延迟的波动范围很大，从低 Batch Size 下的 5.5ms 到超大 Batch Size 下的 20ms 不等。
- 注意到在 2k 上下文长度时，吞吐量在达到 Batch Size 为 120 的 Roofline 边界后基本进入平台期（plateaus），约为 1 token / ms / chip（此处临界值为 120 是因为我们采用了 INT8 权重搭配 BF16 FLOPs 的策略）。然而，随着序列长度增加，内存已无法承载大 Batch Size，导致我们永远无法达到满载的饱和点。
- 注意在大 Batch Size 下，即使吞吐量相同，延迟也会明显更高。这是因为此时 KV Cache 的加载开销已经取代参数加载，成为主导因素。


我们可以通过将成本和延迟拆解为：参数加载时间（Param Loading）、KV 加载时间（KV Loading）以及计算时间（FLOPs Time）来更深刻地理解这一点。下图中红色区域代表 MLP 块处于“算力受限（Compute-bound）”的范围。
![[Serving LLaMA 3-70B on TPUs-latency-breakdown.png]]

[这一图景](./assets/latency_breakdown_log.html)揭示了核心矛盾：初始阶段，参数加载占据了绝大部分延迟；随着 Batch Size 增大，FLOPs 计算和 KV 加载的占比开始攀升。值得注意的是，在所有大于 2048 的序列长度下，**我们在 KV Cache 加载上消耗的时间都超过了实际计算时间。** 因此，虽然增加 Batch Size 能提高硬件利用率，但在长上下文场景下，KV 访存开销始终主导着总步长耗时。
![[Serving LLaMA 3-70B on TPUs-latency-breakdown-2.png]]

**核心结论：** 对于 LLaMA 3-70B，在几乎所有配置下，我们都强烈地受限于 KV Cache 的内存带宽（以及 HBM 总量）。这突显了在提升生成吞吐量时，压缩 KV Cache 规模是多么至关重要。同时，这也再次证明了延迟与吞吐量之间存在极大的权衡空间。

---

以下是用于计算上述性能边界的 Python 脚本：

```python
import numpy as np

num_chips = 16  # 固定总模型并行度为 16
param_count = 70e9  # 模型参数量
# int8 权重意味着每个参数占用 1 字节
bytes_per_param = 1 
sequence_length = 8192  # 可变参数

hbm_bandwidth = 8.20E+11  # TPU v5e 的 HBM 带宽
flops = 1.97E+14  # TPU v5e 的 BF16 峰值算力

param_size = bytes_per_param * param_count

def kv_cache_size(bs):
    # 2 * batch_size * d_qkv * n_kv_heads * n_layers
    return 2 * bs * 128 * 8 * 80

def min_topology(bytes):
    # 计算容纳指定数据量所需的最小 TPU 节点数
    return 2 ** np.ceil(np.log2(bytes / 16e9))

def get_max_batch_size(max_num_chips: int = 16):
  batch_sizes = np.arange(1, 1024, 4)
  kv_sizes = kv_cache_size(sequence_length * batch_sizes)
  # 总占用 = KV Cache + 模型参数
  num_chips_needed = min_topology(kv_sizes + param_size)
  # 找出在现有芯片数约束下的最大索引
  max_idx = np.where(num_chips_needed <= max_num_chips)[0][-1]
  return max_idx

max_idx = get_max_batch_size(num_chips)
batch_sizes = np.arange(1, 512, 1)[:max_idx]
kv_sizes = kv_cache_size(sequence_length * batch_sizes)

# KV 加载耗时
kv_comms_time = kv_sizes / (num_chips * hbm_bandwidth)

# 参数加载耗时
param_comms_time = param_size / (num_chips * hbm_bandwidth)
param_comms_time = np.asarray([param_comms_time] * batch_sizes.shape[0])

# 计算耗时（基于 2 * 参数量 * B 的简化估算）
flops_time = 2 * param_count * batch_sizes / (num_chips * flops)

# MLP 块耗时取计算与通信的最大值
mlp_time = np.maximum(flops_time, param_comms_time)
# Attention 块在生成阶段始终受带宽限制
attn_time = kv_comms_time

# 总延迟与吞吐量计算
latency = 1000 * (mlp_time + attn_time) # 毫秒
throughput = batch_sizes / (latency * num_chips)
```

请注意，我们明确地将延迟划分为 KV 加载和参数加载两个来源，并遵循“延迟取决于 FLOPs 算力或通信带宽中的较大值”这一核心逻辑。

## 3. Worked Problems

这里有几个习题供练习。其中一部分内容虽然在文中有过提及，但作为教学巩固依然非常有益。

**Question 1:** LLaMA 3-405B 的单次前向传播在每个 Token 上消耗多少 FLOPs？假设处于算力受限状态，在 $N$ 颗 TPU v5e 芯片上执行单次前向传播的时间下界是多少？如果处于通信受限状态，结果又是如何？_忽略模型无法在单颗芯片上存放这一事实。_

**Question 2:** 假设我们要部署 LLaMA 3-8B，在 Batch Size 为 240 的条件下，权重和 KV Cache 均采用 INT8 量化。请计算以下各项占用的字节数：(a) 模型参数；(b) KV Cache；(c) 峰值工作激活值（Peak Working Activations，估算值）。支持该配置运行的最小拓扑结构是什么？

**Question 3:** 你会如何在 TPU v5e 上部署 LLaMA 3-405B？假设采用 INT8 权重和 BF16 计算（W8A16）。如果我们将延迟硬性限制在 15ms / token 以内，我们能实现的最大吞吐量配置是什么？理论上的最小单步耗时是多少？

# Footnotes

[^1]: 这里直接用 32/0.017 得到总吞吐量的数据可能会让人感到困惑，其实很简单，32 是 batch 中的 sequence 维度，每个 sequence 在 decode 阶段的每一步，都只会生成一个 token。