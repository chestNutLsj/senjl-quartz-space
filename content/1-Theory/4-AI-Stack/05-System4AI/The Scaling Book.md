---
date: 2026-01-25T01:08:29+08:00
tags:
  - clippings
  - TheScalingBook
  - LLM
  - AI-Infra
publish: "true"
---
> 本文截取自互联网博客 [The Scaling Book: How To Scale Your Model](https://jax-ml.github.io/scaling-book/) 并加入自己的翻译和理解。需要注意，目前翻译版本是适合我本人的阅读习惯和知识基础，如果读者有困惑，可以回到原文查看。
> Updated Time：2026/01/25.

大语言模型 (LLM) 的训练过程通常被视为一种缺乏严谨理论支撑的“炼金术”，但其实训练所需要的基建（即 LLM Infra）完全可以遵循科学的方法论进行理解、分析和优化。本书旨在系统性地解析模型扩展 (Scaling) 背后的技术原理：包括 TPU 与 GPU 的底层硬件架构、跨设备间的集合通信 (Collective Communication) 机制、模型在真实硬件上的执行流程，以及在超大规模训练与推理任务中如何通过并行策略实现高效扩展。无论你是关注训练的算力成本预算、推理服务的显存占用分析，还是试图深入理解诸如 AllGather 等通信原语的实现细节，本书都将提供深度的技术参考。

尽管深度学习在许多领域仍表现出一定的不可解释性，但在模型性能优化方面，即便是在万卡规模的集群上，依然存在清晰的规律可循。从单体加速器扩展到上万规模的集群节点，底层逻辑具有高度的一致性。掌握这些原理将赋能开发者实现以下目标：

- 估算模型算子及其子模块的执行效率，评估其与硬件理论性能峰值的差距。
- 针对不同规模的计算资源，科学地选择数据并行、模型并行或流水线并行等策略，优化跨设备的计算任务切分方案。
- 精准评估超大规模 Transformer 模型在训练与推理阶段的算力成本及时间复杂度。
- 充分利用特定硬件特性（如 TPU 的脉动阵列或存储层级）来设计高性能算法。例如这些经典算法或思想： [FlashAttention](https://arxiv.org/abs/2205.14135)、 [Multi-Query Attention for Fast Decoding](https://arxiv.org/abs/1911.02150)、 [Fusion Kernel](https://arxiv.org/abs/2007.00072)。
- 基于对当前算法性能瓶颈（如计算绑定或访存绑定）的深刻理解，驱动下一代专用硬件的协同设计。

**前置知识要求：** 本书假设读者已掌握 LLM 与 Transformer 架构的基础知识，但不要求具备大规模集群的工程经验。读者应了解 LLM 训练的基本流程，若具备 JAX 框架的使用经验将更为理想。推荐读者先行阅读 Transformer 架构的 [经典论文](https://arxiv.org/abs/1706.03762)及[相关博客](https://jalammar.github.io/illustrated-transformer/)，以便对注意力机制等核心组件有直观理解。本书还提供一篇 [Section 11. 文章列表](https://jax-ml.github.io/scaling-book/conclusion#further-reading)，供读者继续学习。

**学习目标：** 读毕本书，读者应能够针对特定的硬件平台，为 Transformer 模型推导出最优的并行方案，并能初步估算训练与推理的预期时长。

### Why should you care?

在三四年前，机器学习研究者或许无需深入关注底层系统细节。但在当前大模型时代，即便是“小规模”模型也常在运行中触及硬件的物理极限。若要开展前沿研究，必须考虑大规模部署下的系统效率。历史证明，机器学习的研究往往遵循系统创新与软件改进交替推进的周期。例如，Alex Krizhevsky 最初必须手动编写复杂的 CUDA 代码以优化卷积神经网络 (CNN)；但不久后，Theano 和 TensorFlow 等框架实现了底层的抽象。虽然未来的系统抽象层可能会进一步掩盖这些复杂性，但当前的扩展定律 (Scaling Laws) 正不断将模型推向硬件能力的边缘。因此，在可预见的未来，前沿研究将与如何在大规模硬件拓扑上实现高效扩展深度绑定。**如果一个算法在 benchmark 上获得的 20% 性能提升是以牺牲 20% 的屋檐模型 (Roofline Model) 效率为代价的，那么这种提升在工业界便毫无意义。** 许多在理论上具备潜力的模型架构之所以最终折戟，往往是因为无法在集群规模上实现高效运行，或者缺乏相应的系统级优化支持。

**“模型扩展 (Model Scaling)”的核心目标在于：当增加用于训练或推理的芯片数量时，系统吞吐量能够实现线性的同步增长。** 这种理想状态被称为“强扩展 (Strong Scaling)”。尽管引入更多并行设备理论上能缩短单次计算时间，但跨芯片的通信开销也会随之增加。一旦通信耗时超过了计算耗时，系统就会进入“通信瓶颈 (Communication-bound)”状态，导致强扩展失效。此外，随着单个任务计算耗时的压缩，单芯片级别的瓶颈也会凸显。即使一款高性能 TPU 或 GPU 的标称算力达到了 $500 \text{ TFLOPS}$，如果模型因显存带宽受限而陷入频繁的参数搬运，其实际有效算力可能仅为理论值的十分之一。因此，单芯片的算力密度、显存带宽以及显存容量之间的权衡是扩展问题的核心。只有深刻理解硬件瓶颈的触发机制，我们才能在设计或重构模型时有效地规避这些性能陷阱。

硬件设计者则面临着一个逆向命题：**如何在最小化成本的前提下，为算法提供恰到好处的算力、带宽与内存**。这种“软硬协同设计 (Co-design)”极具挑战，设计者必须在芯片流片前的 2 到 3 年就预判未来的算法演进趋势。TPU 的诞生堪称这一领域的典范。矩阵乘法 (GEMM) 是一类极其特殊的算法，其单位访存所承载的浮点运算量 (FLOPs per byte) 远高于其他算子。早期的 TPU 凭借脉动阵列 (Systolic Array) 架构，在矩阵运算的性价比上远超当时的 GPU。TPU 专为机器学习负载定制，而现代 GPU 也通过集成 **TensorCore** 快速弥补了这一领域的差距。然而，这种专用化设计也带有风险：如果神经网络未能大规模爆发，或者算法演进方向超出了 TPU（其灵活性本质上低于 GPU）的处理能力，那么其研发成本将难以回收。

*本书的核心宗旨在于揭示 TPU 与 GPU 的硬件运行机制，并探讨 Transformer 架构是如何通过演进以适配当前硬件特性的。我们希望这些内容能为设计新一代架构的研究员提供启发，同时也为追求极致推理速度的工程人员提供实战指导。*

## High-Level Outline

本书的整体架构如下：
1. [[All About Rooflines|Section 1. Roofline Model]] 重点解析**屋檐模型 (Roofline Model)**，探讨制约系统扩展性的三大核心因素：通信能力、计算能力与访存带宽。 
2. [[How to Think About TPUs|Section 2. TPU]] 与 [[Sharded Matrices and How to Multiply Them|Section 3. Matrices Sharding]] 则深入剖析 TPU 的工作机制——不仅将其视为独立的计算算子，更将其视为一个复杂的互联系统，重点分析受限的带宽与通信延迟对系统性能的影响。我们将探讨以下关键问题：
	- 特定维度的矩阵乘法 (GEMM) 理论耗时是多少？在何种负载特征下，性能瓶颈会从计算瓶颈 (Compute-bound) 切换至访存瓶颈 (Memory-bound) 或通信带宽瓶颈？
	- TPU 集群的物理拓扑结构 (Topology) 是如何构建的？系统各层级（如 ICI 互联）的有效带宽是多少？
	- 在多 TPU 节点间执行 AllGather、Scatter 或张量重分布 (Redistribution) 等集合通信操作的延迟开销如何计算？
	- 当矩阵以不同的切分方式 (Sharding Schemes) 分布在不同设备上时，如何设计高效的分布式矩阵乘法算法？
3. 五年前，深度学习领域呈现多种架构并存的格局（如 CNN, LSTM, MLP, Transformer 等），而今 Transformer 已成为事实上的唯一架构。因此，深入理解 Transformer 架构的每一个细节至关重要：包括各层张量的精确维度、归一化层 (Normalization) 的插入位置、参数量分布以及各算子的算力需求。这里我们将 **FLOPs (Floating Point Operations)** 定义为总运算次数（浮点加法与乘法的总和），而以 **FLOPs/s** 表示算力吞吐。在 [[All the Transformer Math You Need to Know|Section 4. Transformer Math]] 中，我们将详细推导“Transformer Math”，涵盖训练与推理阶段的参数量统计与算力开销估算。这将帮助我们预测模型显存占用、计算与通信的占比，以及在高并发场景下 **Attention** 算子相对于 **FFN** 的计算权重。
4. [[How to Parallelize a Transformer for Training|Section 5. Training in Parallel]] 与 [[All About LLM Inference|Section 7. Efficient Inference]] 是本书的核心。我们致力于解决一个根本性挑战：在给定模型规模与硬件算力（芯片数量）的前提下，如何设计并行方案以维持“强扩展 (Strong Scaling)”性能？该问题的工程实现极具挑战性。从系统架构层面看，主要存在四种基础并行范式：**数据并行 (Data Parallelism)**、**张量并行 (Tensor Parallelism)**、**流水线并行 (Pipeline Parallelism)** 以及 **专家并行 (Expert Parallelism, MoE)**。此外，为了进一步压榨内存空间，我们还会讨论**梯度重算 (Rematerialization / Gradient Checkpointing)**、**优化器状态切分 (ZeRO / Sharded Data Parallelism)**、**主机内存卸载 (Host Offload)** 以及**梯度累积 (Gradient Accumulation)** 等关键技术。
5. 希望在完成上述章节的学习后，读者能够具备独立决策能力，针对新型模型架构或特定的计算集群配置，自主进行并行策略的选型与系统调优。为了帮助读者更好地理解理论与实践的结合， [[Training LLaMA 3 on TPUs|Section 6. Trainging Llama3]] 与 [[Serving LLaMA 3-70B on TPUs|Section 8. Serving Llama]] 提供了深度工程实战教程，演示了如何将这些抽象的系统级概念，具体应用于当前主流的开源模型 **LLaMA-3** 的大规模训练与部署场景中。
6. 最后，在 [Section 9. Profiling for TPU](https://jax-ml.github.io/scaling-book/profiling) 与 [Section 10. Programming in JAX](https://jax-ml.github.io/scaling-book/jax-stuff) 中，我们将探讨如何基于 JAX 框架实现上述并行策略，并介绍如何利用性能分析工具 (Profiler) 对 XLA 编译后的代码进行调优与排障。此外， [[How to Think About GPUs|Section 12. GPU]] 将作为补充，专门探讨 GPU 架构下的性能扩展逻辑。

![[All the Transformer Math You Need to Know-transformer-diagram.png]]
