---
date: 2026-01-28T20:33:17+08:00
tags:
  - clippings
  - GPU
publish: "true"
---
> 本文截取自互联网博客并做一定修改：https://jax-ml.github.io/scaling-book/gpus/#networking

本章节旨在深入探讨 GPU 的硬件底层架构，涵盖单芯片工作机制、集群互联拓扑，以及这些硬件特性对大语言模型 (LLM) 计算任务的深远影响，并将其与 TPU 进行系统性对比。尽管市面上存在 NVIDIA、AMD 及 Intel 等多种 GPU 架构，本章将重点分析 NVIDIA GPU 的实现方案。本文内容基于 [[How to Think About TPUs|Section 2. TPU]] 与 [[How to Parallelize a Transformer for Training|Section 5. Training in Parallel]]，建议读者先行查阅相关背景。

## 1. What Is a GPU?

现代面向机器学习 的 GPU（如 H100, B200）本质上是由大量专注于矩阵运算的计算核心阵列（即**流式多处理器 (Streaming Multiprocessors, SM)**）与高带宽显存（**HBM**）连接而成的算力系统。其架构逻辑如下图所示：

![](https://jax-ml.github.io/scaling-book/assets/gpu/gpu-diagram.png)

此图是 H100 或 B200 GPU 的抽象架构布局图。单个 H100 芯片集成有 132 个 SM，而 B200 则扩展至 148 个。此处定义的“Warp Scheduler (线程束调度器)”涵盖了 32 个 CUDA SIMD 核心及相应的任务分发单元。观察可见，其计算单元的分级组织结构与 TPU 高度相似。

每个 SM 的内部构造与 TPU 的 Tensor Core 类似，包含：
- 一个专用的矩阵乘法单元（同样称为 **Tensor Core**。需注意：GPU 的 Tensor Core 仅是 SM 内部的矩阵运算子单元；而 TPU 的 TensorCore 是一个包含 MXU 和 VPU 等组件的综合计算单元）、
- 一个向量运算单元（此处统称为 **Warp Scheduler**。NVIDIA 官方对此尚无统一术语，此处用其指代控制单元及其管理的 CUDA core），
- 以及快速的片上缓存（**SMEM**，即共享内存）。与 TPU（单芯片最多包含 2 个独立 Tensor Core）不同，现代 GPU 拥有超过 100 个 SM（H100 为 132 个）。

尽管单个 SM 的峰值算力弱于 TPU 的 Tensor Core，但其整体系统展现出更高的灵活性。由于每个 SM 几乎是完全独立的，GPU 能够同时处理数百个并发任务。虽然 SM 在逻辑上相互独立，但为了实现性能峰值，它们必须通过共享的 L2 缓存进行精细的协调通信。

这是一张 H100 SM 的微架构视图：

![](https://jax-ml.github.io/scaling-book/assets/gpu/blackwell-sm.png)

图中展示了 4 个子分区 (Subpartitions)，每个分区集成了一个 Tensor Core、Warp 调度器、寄存器堆 (Register File) 以及支持不同精度运算的 CUDA core 组。底部的“L1 数据缓存”即为容量为 256kB 的 SMEM 单元。B200 的架构与其类似，但引入了显著增大的张量内存 (TMEM)，以支撑算力更强的 Tensor Core 吞吐需求。 

每个 SM 被划分为 4 个相同的象限，NVIDIA 称之为 **SM 子分区 (SM subpartitions)**。每个子分区配备一个 Tensor Core、16k 个 32-bit 寄存器，以及一个被称为 Warp 调度器的 SIMD/SIMT 向量运算单元，其运算通道 (ALU) 即为 **CUDA Cores**。Tensor Core 无疑是各分区的核心组件，承载了绝大部分的矩阵乘法算力，但其他组件同样不可或缺。

- **CUDA Cores：** 每个子分区包含一组执行 SIMD/SIMT 向量算术运算的 ALU。通常情况下，每个 ALU 每时钟周期可执行一次算术操作（例如 `f32.add`）。现代 GPU 已支持融合乘加 (FMA) 指令，技术上可在单个周期内完成两次浮点运算 (FLOPs)，这也是 NVIDIA 在宣传文档中将其峰值算力翻倍的核心依据。每个子分区拥有 32 个 FP32 CUDA core（以及少量 INT32 和 FP64 CUDA core），这些 core 在同一周期内同步执行相同的指令。类似于 TPU 的 VPU，CUDA core主要负责 ReLU 激活函数、逐元素 (Pointwise) 向量操作以及归约 (Reductions) 运算。从历史演进看，在 Tensor Core 问世前，CUDA core 是 GPU 的主要计算载体，用于处理光线求交和着色等渲染任务。在现有的游戏 GPU 中，它们仍负责主要的渲染负载，而 Tensor Core 则被用于 DLSS 超采样技术，通过 ML 算法将低分辨率图像提升至高分辨率，从而降低渲染开销。
- **Tensor Core：** 每个子分区均配备独立的 Tensor Core，这是一种类似于 TPU MXU 的专用矩阵乘法硬件。Tensor Core 贡献了 GPU 绝大部分的算力（例如，H100 的 TensorCore BF16 峰值算力高达 $990 \text{ TFLOPS}$，而 CUDA core 仅为 $66 \text{ TFLOPS}$）。
	- **算力估算：** H100 在 $1.76 \text{ GHz}$ 频率及 132 个 SM 的配置下达到 $990 \text{ BF16 TFLOPS}$，意味着每个 Tensor Core 每周期可处理约 $1024$ 次 BF16 操作（计算公式：$\frac{7.5 \times 10^{12}}{1.76 \times 10^9 \times 4} \approx 1024$），等效于执行 $8 \times 8 \times 8$ 的矩阵乘法。由于 NVIDIA 未公开 TC 底层实现细节，此数据基于规格推导。从代际演进看，V100 周期算力为 256 FLOPs，A100 为 512，H100 为 1024，而 B200 预计将翻倍至 2048。更多数据可以查看： [here](https://forums.developer.nvidia.com/t/how-to-calculate-the-tensor-core-fp16-performance-of-h100/244727)。
	- **精度与吞吐：** 与 TPU 类似，GPU 在低精度下具备更高的矩阵乘法吞吐（例如 H100 的 FP8 性能是 FP16 的 2 倍），这显著加速了低精度训练与推理部署。
	- **架构演进与 TMEM：** 自 Volta 架构以来，Tensor Core 的规模持续扩大。在 Blackwell 架构中，由于 TC 规模已大到无法通过 SMEM 容纳输入数据，NVIDIA 引入了全新的**张量内存 (TMEM)** 空间。在 Ampere 架构中，单线程束 (Warp) 即可驱动 TC；Hopper 则需整个 SM 协调；而在 Blackwell 中则需要 2 个 SM 协作。由于计算规模激增，累加器等中间变量已超出寄存器或 SMEM 的容量，TMEM 的引入正是为了解决这一存储瓶颈。

**CUDA core在灵活性上优于 TPU 的 VPU：** 自 V100 架构起，CUDA core采用 **SIMT (单指令多线程)** 编程模型，优于 TPU 的 SIMD (单指令多数据) 模型。虽然在物理执行上，子分区内的所有 CUDA core在同一周期内必须执行相同操作（类似于 TPU VPU 的 ALU 步调一致），但 SIMT 允许每个核心（即 CUDA 编程模型中的“线程”）拥有独立的指令指针。当同一线程束 (Warp) 中的不同线程出现分支跳转时，硬件将通过**掩码 (Masking)** 机制分步执行所有路径，即暂时禁用不属于当前分支路径的 CUDA core。

![](https://jax-ml.github.io/scaling-book/assets/gpu/warp-divergence.png)

上图是线程组内**线程束分歧 (Warp Divergence)** 示例。图中白色空白区域表示因分支预测失效或路径不一致导致的硬件空闲（Stall），即部分物理 CUDA core在当前周期未执行有效计算。

这种机制实现了细粒度的线程级编程灵活性，但副作用是：若线程束内频繁发生分歧，将导致严重的性能损耗。此外，线程在内存访问上更加自由，TPU VPU 通常只能操作连续内存块，而 CUDA 核心能够访问共享寄存器中的单个浮点数，并维护独立的线程私有状态。

**CUDA 核心调度机制具备更高弹性：** SM 的运行模式类似于多线程 CPU，能够并发调度多个程序段（即 **Warps**，单个 SM 最多支持 64 个常驻线程束）。虽然每个线程束调度器在单一时钟周期内仅能执行一条指令（在一个 SM 上的 warp 调度称为驻留，resident），但它可以通过在多个活跃线程束间快速切换，有效掩盖显存加载等 I/O 操作带来的延迟。相比之下，TPU 的设计逻辑更接近单线程同步模式。

### Memory

除计算单元外，GPU 内部构建了严密的存储层级体系。该体系以高容量的 **HBM (高带宽显存)** 作为主存，并向下延伸出一系列容量递减但速度递增的片上存储：包括 **L2 缓存**、**L1/SMEM (共享内存)**、**TMEM (张量内存)** 以及**寄存器堆 (Register File)**。

- **寄存器：** 在 H100 和 B200 架构中，每个 SM 子分区都拥有独立的寄存器堆，包含 16,384 个 32-bit words。这意味着每个 SM 的寄存器总量为 $4 \times 16384 \times 4 \text{ bytes} = 256 \text{ KiB}$，可供 CUDA 核心直接访问。
	- **寄存器压力与占用率：** 单个 CUDA 核心同时访问的寄存器上限为 256 个。因此，尽管每个 SM 理论上可调度多达 64 个“常驻线程束 (Resident Warps)”，但如果每个线程都消耗上限值的 256 个寄存器，那么 SM 实际上仅能容纳 8 个线程束（计算逻辑：$\frac{256\text{ (KiB)} \times 1024}{4\text{ (Bytes per Register)} \times 32\text{ (Threads per warp)} \times 256\text{ (Registers per Thread)}} = 8$），这会显著限制硬件的并行度——SM 只能容纳理论上限的 **1/8 (12.5% Occupancy)**。在编写高性能 Triton 算子或 CUDA Kernel 时，过高的寄存器占用会直接导致延迟隐藏 (Latency Hiding) 能力下降，进而拖累整体吞吐。
- **SMEM (L1 Cache):** 每个 SM 均配备了 256kB 的片上高速缓存，称为 **SMEM (Shared Memory)**。该存储空间具有双重属性：既可由开发者显式控制作为“共享内存”使用，也可由硬件自动管理作为 L1 缓存。在深度学习任务中，SMEM 主要用于存储神经网络的激活值 (Activations) 以及作为 Tensor Core 矩阵运算的输入缓冲区。
- **L2 Cache:** 芯片内所有 SM 共享一个容量约为 50MB 的 L2 缓存（注：技术上 H100 的 L2 缓存被划分为两个分区，每组 SM 访问其中 25MB 的局部空间，分区之间虽有互联但带宽较低），其核心作用是减少对高延迟主显存的访问频次。
	- **特性对比**：其容量与 TPU 的 VMEM 相当，但读写速度显著较慢，且不支持开发者直接编程控制（属于硬件管理缓存）。这导致了一种“幽灵式的远程耦合”现象：**程序员必须通过优化内存访问模式（访存对齐与局部性优化）来间接提升 L2 缓存命中率**。此外，由于 L2 缓存是全局共享资源，尽管各 SM 在逻辑上相互独立，但为了避免缓存冲突并提升吞吐，实际上仍需在各 SM 间维持高度的协同运行。
	- **带宽指标：** NVIDIA 官方并未公布 L2 缓存的具体带宽，但第三方实测数据约为 $5.5 \text{ TB/s}$。这大约是 HBM 带宽的 1.6 倍，且由于其具备全双工特性，实际等效双向带宽可达 HBM 的 3 倍。相比之下，TPU 的 VMEM 不仅容量翻倍，带宽更是高达约 $40 \text{ TB/s}$，优势明显。
- **HBM (高带宽显存)：** 作为 GPU 的主存，用于承载模型权重、梯度 (Gradients) 以及各层的激活值。
	- **容量演进：** HBM 容量经历了显著增长，从 Volta 架构的 32GB 飙升至 Blackwell (B200) 的 192GB。
	- **吞吐能力：** 从 HBM 到计算核心的数据传输速率被称为 HBM 带宽或显存带宽。H100 的带宽约为 $3.35 \text{ TB/s}$，而 B200 则大幅提升至约 $9 \text{ TB/s}$。

### Summary of GPU specs

下表汇总了近期主流 GPU 型号的核心规格。需要注意的是，同一代 GPU 的不同变体在 SM 数量、时钟频率及峰值算力上可能存在差异。以下为各型号的存储容量参数：
$$
\begin{array}{ccccccc}
\hline
\text{GPU} & \text{Generation} & \text{Clock Speed} & \text{SMs/chip} & \text{SMEM/SM} & \text{L2/chip} & \text{HBM/chip} \\
\hline
\text{V100} & \text{Volta} & 1.25/1.38~\text{GHz} & 80  & 96~\text{kB}  & 6~\text{MB}   & 32~\text{GB} \\
\text{A100} & \text{Ampere} & 1.10/1.41~\text{GHz} & 108 & 192~\text{kB} & 40~\text{MB}  & 80~\text{GB} \\
\text{H100} & \text{Hopper} & 1.59/1.98~\text{GHz} & 132 & 256~\text{kB} & 50~\text{MB}  & 80~\text{GB} \\
\text{H200} & \text{Hopper} & 1.59/1.98~\text{GHz} & 132 & 256~\text{kB} & 50~\text{MB}  & 141~\text{GB} \\
\text{B200} & \text{Blackwell} & ? & 148 & 256~\text{kB} & 126~\text{MB} & 192~\text{GB} \\
\hline
\end{array}
$$

上述所有架构中，每个 SM 均统一配备了 256kB 的寄存器。此外，Blackwell 架构还为每个 SM 额外引入了 256kB 的 TMEM。以下为各芯片的算力 (FLOPs) 与带宽指标：
$$
\begin{array}{cccccc}
\hline
\text{GPU} & \text{Generation} & \text{HBM BW/chip} &
\text{FLOPs/s (bf16/fp16)} & \text{FLOPs/s (fp8/int8)} & \text{FLOPs/s (fp4)} \\
\hline
\text{V100} & \text{Volta} & 9.0 \times 10^{11} & - & - & - \\
\text{A100} & \text{Ampere} & 2.0 \times 10^{12} & 3.1 \times 10^{14} & 6.2 \times 10^{14} & - \\
\text{H100} & \text{Hopper} & 3.4 \times 10^{12} & 9.9 \times 10^{14} & 2.0 \times 10^{15} & - \\
\text{H200} & \text{Hopper} & 4.8 \times 10^{12} & 9.9 \times 10^{14} & 2.0 \times 10^{15} & - \\
\text{B200} & \text{Blackwell} & 8.0 \times 10^{12} & 2.3 \times 10^{15} & 4.5 \times 10^{15} & 9.0 \times 10^{15} \\
\hline
\end{array}
$$

注意：鉴于 B100 系列并未实现大规模量产，本表未将其列入对比。尽管 NVIDIA 推出了 B100 这一代次，但其在市场上仅昙花一现，据称是因为底层设计缺陷导致其无法在标称规格下稳定运行。受限于散热与功耗瓶颈，B100 在实际运行中极易触发降频 (Throttling)，难以触达峰值算力。此外，由于 NVIDIA GPU 的产品线存在多种变体，其实际规格可能与上述标准参考值略有出入，标准化程度逊于 Google 的 TPU。

GPU 与 TPU 的核心组件功能对照表：
$$
\begin{array}{ccc}
\hline
\text{GPU} & \text{TPU} & \text{What is it?} \\
\hline
\text{Streaming Multiprocessor (SM)} &
\text{Tensor Core} &
\text{Core ``cell'' that contains other units} \\
\\
\text{Warp Scheduler} &
\text{VPU} &
\text{SIMD vector arithmetic unit} \\
\\
\text{CUDA Core} &
\text{VPU ALU} &
\text{SIMD ALU} \\
\\
\text{SMEM (L1 Cache)} &
\text{VMEM} &
\text{Fast on-chip cache memory} \\
\\
\text{Tensor Core} &
\text{MXU} &
\text{Matrix multiplication unit} \\
\\
\text{HBM (GMEM)} &
\text{HBM} &
\text{High-bandwidth, high-capacity memory} \\
\hline
\end{array}
$$

### GPUs vs. TPUs at the chip level

GPU 最初是为电子游戏渲染而设计的。然而，自 2010 年代深度学习技术爆发以来，GPU 的演进方向日益趋向于专用的矩阵乘法机——换言之，其架构逻辑正逐渐向 TPU 靠拢。在深度学习浪潮之前，GPU（图形处理器）的核心职责是处理图形渲染。电子游戏通过数百万个微小三角形来构建物体，GPU 则负责将这些三角形渲染（或称“光栅化”，rasterize）为 2D 图像，并以每秒 30-60 次（即帧率）的频率显示。光栅化过程涉及每秒数十亿次地将三角形投影到摄像机坐标系中，并计算哪些三角形与哪些像素重叠。这一过程计算开销巨大，且仅是渲染的第一步：随后还需通过融合可能相交的多个半透明三角形的颜色来为每个像素着色。为了应对此类任务，GPU 设计之初便追求极高的运算速度与通用性，需要同时运行多种不同的计算负载（称为“着色器”，Shaders），且没有任何单一操作占据绝对主导。因此，传统的消费级显卡虽然能执行矩阵乘法，但这并非其核心职能。

这种历史背景解释了现代 GPU 架构的成因：它们并非纯粹为 LLM 或机器学习模型而生，而是作为通用加速器设计的。这种硬件层面的“通用性”是一把双刃剑：一方面，GPU 在处理新任务时具有更好的兼容性与易用性，对编译器的依赖程度远低于 TPU；但另一方面，这也导致其性能调优逻辑极其复杂，难以触达 Roofline 模型定义的峰值性能，因为各种编译器特性都可能成为潜在的性能瓶颈。

**GPU 具备更高程度的模块化。** TPU 通常仅包含 1-2 个庞大的 Tensor Core，而 GPU 则集成了数百个小型SM。相应地，TPU 的每个 Tensor Core 拥有一个巨大的向量处理单元 (VPU)，由 4 个可独立编程的 $8 \times 128$ 单元组成（总计 4096 个 ALU）；相比之下，一台 H100 拥有 $132 \times 4 = 528$ 个独立的 SIMD 单元，每个单元宽度为 32（总计 16k 个 ALU）。下表对比了 GPU 与 TPU 的硬件资源分配，突显了这种模块化差异：
$$
\begin{array}{cccc}
\hline
\text{GPU} & \text{TPU} & \text{H100 \#} & \text{TPU v5p \#} \\
\hline
\text{SM (streaming multiprocessor)} & \text{Tensor Core} & 132 & 2 \\
\text{Warp Scheduler} & \text{VPU slots} & 528 & 8 \\
\text{SMEM (L1 cache)} & \text{VMEM} & 32~\text{MB} & 128~\text{MB} \\
\text{Registers} & \text{Vector Registers (VRegs)} & 32~\text{MB} & 256~\text{kB} \\
\text{Tensor Core} & \text{MXU} & 528 & 8 \\
\hline
\end{array}
$$

这种模块化设计的差异产生了两重影响：一方面，**TPU 的制造成本更低**，架构逻辑更易理解；但另一方面，**它将巨大的优化压力转移给了编译器**。由于 TPU 采用单线程控制流，且仅支持全向量化的 VPU 指令，编译器必须精细地手动编排（Pipeline）所有内存加载指令与 MXU/VPU 计算任务，以规避流水线停顿。相比之下，GPU 开发者可以同时启动数十个不同的 Kernel，每个 Kernel 在完全独立的 SM 上运行。然而，这些 Kernel 可能会因为过度争用 L2 缓存或未能实现访存合并（Memory Coalescing）而导致性能暴跌。**由于 GPU 硬件接管了大量的运行时控制逻辑，开发者往往难以洞察底层运行状态**。因此，TPU 在较少的人工干预下，通常能比 GPU 更容易触达 Roofline 模型的性能上限。

**通常，单体 GPU 的性能（及成本）通常高于同级别的 TPU：** 以单台 H200 为例，其峰值算力 (FLOPs/s) 接近 TPU v5p 的 2 倍，HBM 容量则是其 1.5 倍。与此同时，Google Cloud 上的租赁报价也反映了这一差距：H200 约为 10 美元/小时，而 TPU v5p 约为 4 美元/小时。因此，TPU 的设计哲学更倾向于通过高速互联网络将大量芯片协同作业，而非追求单芯片的极致算力。

**TPU 拥有更充裕的高速缓存资源：** TPU 配备的 VMEM 容量远超 GPU 的 SMEM（及 TMEM）总和。这些内存空间可用于存储模型权重与激活值，从而实现极高速度的数据加载与计算。在 LLM 推理场景下，如果能有效地将模型权重驻留或预取 (Prefetch) 到 VMEM 中，TPU 的推理速度将极具竞争力。

### Quiz 1: GPU hardware

以下练习旨在检验你对上述架构知识的掌握程度。虽然附有答案，但建议在查阅前先独立思考并尝试计算。

**Question 1 \[CUDA cores\]:** 一台 H100 包含多少个 FP32 CUDA 核心 (ALU)？B200 呢？这与 TPU v5p 的独立 ALU 数量相比如何？

**Answer:** H100 拥有 132 个 SM，每个 SM 包含 4 个子分区，每个子分区集成 32 个 FP32 CUDA 核心，因此总计有 $132 \times 4 \times 32 = 16,896$ 个 CUDA 核心。B200 扩展至 148 个 SM，总计 $18,944$ 个核心。相比之下，TPU v5p 拥有 2 个 Tensor Core（通常通过 Megacore 互联），每个核心的 VPU 拥有 $8 \times 128$ 条通道，且每通道有 4 个独立 ALU，总计 $2 \times 4 \times 8 \times 128 = 8,192$ 个 ALU。在主频相近的情况下，TPU v5p 的向量通道数量大约仅为 H100 的一半。

---

**Question 2 \[Vector FLOPs calculation\]**: 单台 H100 拥有 132 个 SM，基准频率为 $1.59 \text{ GHz}$（超频可达 $1.98 \text{ GHz}$）。假设每个 ALU 每周期可执行一次向量操作，其 FP32 每秒向量算力是多少？开启加速频率后又是多少？这与矩阵乘法算力相比结果如何？

**Answer:** 基准频率下算力为 $132 \times 4 \times 32 \times 1.59 \times 10^9 = 26.9 \text{ TFLOPS}$。在加速频率下可达 $33.5 \text{ TFLOPS}$。该数值仅为 [官方规格表](https://www.nvidia.com/en-us/data-center/h100/)的一半，原因在于硬件技术上支持单周期完成一次 FMA（融合乘加）操作，计作两次浮点运算 (FLOPs)，但这一理论峰值在多数实际场景中难以触达。已知 H100 的 BF16 矩阵乘法算力为 $990 \text{ TFLOPS}$，这意味着在不计 FMA 的情况下，Tensor Core 的算力吞吐大约是向量计算单元的 30 倍。

---

**Question 3 \[GPU matmul intensity\]:** H100 的 FP16 矩阵乘法峰值算术强度是多少？B200 呢？FP8 又是多少？

**Answer:** 对于 H100，FP16 峰值算力为 $990 \times 10^{12} \text{ FLOPs}$，带宽为 $3.35 \times 10^{12} \text{ Bytes/s}$。临界强度为 $990/3.35 \approx 295$，与 TPU 的 240 较为接近。B200 的临界强度为 $2250/8 \approx 281$，基本持平。这意味着与 TPU 类似，我们通常需要约 280 的 Batch Size 才能使矩阵乘法任务从访存受限转为计算受限。在 FP8 模式下，算力翻倍，理论强度也分别提升至 590 和 562；但在实际应用中，由于权重同样以 FP8 加载，算术强度在逻辑上可视作保持恒定。

---

**Question 4 \[Matmul runtime\]:** 基于问题 3 的结果，预估在单台 B200 上执行 $FP16[64, 4096] \times FP16[4096, 8192]$ 的算子耗时是多少？如果是 $FP16[512, 4096] \times FP16[4096, 8192]$ 呢？

**Answer：** 根据前文结论，当 Batch Size 低于 281 时，任务处于访存受限状态。因此，第一个任务完全受限于带宽。总访存量（读写 2BD + 2DF + 2BF 字节）约为 $69 \times 10^6 \text{ Bytes}$，在 $8 \times 10^{12} \text{ Bytes/s}$ 的带宽下，耗时约 $8.6 \mu s$。考虑到实际带宽利用率，实测值可能在 $10\text{-}12 \mu s$ 左右。当 Batch Size 增加至 512 时，任务进入计算受限状态，理论耗时 $T = \frac{2 \times 512 \times 4096 \times 8192}{2.3 \times 10^{15}} \approx 15 \mu s$。同样考虑到算力利用率，实际耗时可能接近 $20 \mu s$。
From the above, we know we’ll be communication-bound below a batch size of 281 tokens. Thus the first is purely bandwidth bound. We read or write 2BD + 2DF + 2BF bytes (`2*64*4096 + 2*4096*8192 + 2*64*8192=69e6`) with `8e12` bytes/s of bandwidth, so it will take about `69e6 / 8e12 = 8.6us`. In practice we likely get a fraction of the total bandwidth, so it may take closer to 10-12us. When we increase the batch size, we’re fully compute-bound, so we expect `T=2*512*4096*8192/2.3e15=15us`. We again only expect a fraction of the total FLOPs, so we may see closer to 20us.

**Question 5 \[L1 cache capacity\]:** What is the total L1/SMEM capacity for an H100? What about register memory? How does this compare to TPU VMEM capacity?

Click here for the answer.

**Answer:** We have 256kB SMEM and 256kB of register memory per SM, so about 33MB (`132 * 256kB`) of each. Together, this gives us a total of about 66MB. This is about half the 120MB of a modern TPU’s VMEM, although a TPU only has 256kB of register memory total! TPU VMEM latency is lower than SMEM latency, which is one reason why register memory on TPUs is not that crucial (spills and fills to VMEM are cheap).

**Question 6 \[Calculating B200 clock frequency\]:** NVIDIA reports [here](https://resources.nvidia.com/en-us-blackwell-architecture) that a B200 can perform 80TFLOPs/s of vector fp32 compute. Given that each CUDA core can perform 2 FLOPs/cycle in a FMA (fused multiply add) op, estimate the peak clock cycle.

Click here for the answer.

**Answer:** We know we have 148 \* 4 \* 32 = 18944 CUDA cores, so we can do `18944 * 2 = 37888 FLOPs / cycle`. Therefore `80e12 / 37888 = 2.1GHz`, a high but reasonable peak clock speed. B200s are generally liquid cooled, so the higher clock cycle is more reasonable.

**Question 7 \[Estimating H100 add runtime\]:** Using the figures above, calculate how long it ought to take to add two `fp32[N]` vectors together on a single H100. Calculate both T\_\\text{math} and T\_\\text{comms}. What is the arithmetic intensity of this operation? If you can get access, try running this operation in PyTorch or JAX as well for `N = 1024` and `N=1024 * 1024 * 1024`. How does this compare?

Click here for the answer.

**Answer:** Firstly, adding two `fp32[N]` vectors performs N FLOPs and requires `4 * N * 2` bytes to be loaded and 4 \* N bytes to be written back, for a total of `3 * 4 * N = 12N`. Computing their ratio, we have `total FLOPs / total bytes = N / 12N = 1 / 12`, which is pretty abysmal.

As we calculated above, we can do roughly 33.5 TFLOPs/s boost, ignoring FMA. This is only if all CUDA cores are used. For `N = 1024`, we can only use *at most* 1024 CUDA cores or 8 SMs, which will take longer (roughly 16x longer assuming we’re compute-bound). We also have a memory bandwidth of 3.35e12 bytes/s. Thus our peak hardware intensity is `33.5e12 / 3.35e12 = 10`.It’s notable that this intensity stays constant across recent GPU generations. For H100s it’s 33.5 / 3.5 and for B200 it’s 80 / 8. Why this is isn’t clear, but it’s an interesting observation. So we’re going to be horribly comms bound. Thus our runtime is just

$$
T=max(Tcomms,Tmath)=12⋅N3.35e12=N2.8e11
$$

For `N = 65,536`, this is about 0.23us. In practice we see a runtime of about 1.5us in JAX, which is fine because we expect to be super latency bound here. For `N = 1024 * 1024 * 1024`, we have a roofline of about 3.84ms, and we see 4.1ms, which is good!

## Networking

Networking is one of the areas where GPUs and TPUs differ the most. As we’ve seen, TPUs are connected in 2D or 3D tori, where each TPU is only connected to its neighbors. This means sending a message between two TPUs must pass through every intervening TPU, and forces us to use only uniform communication patterns over the mesh. While inconvenient in some respects, this also means the number of links per TPU is constant and we can scale to arbitrarily large TPU “pods” without loss of bandwidth.

GPUs on the other hand use a more traditional hierarchical tree-based switching network. Sets of 8 GPUs called **nodes** (up to 72 for GB200 The term node is overloaded and can mean two things: the NVLink domain, aka the set of GPUs fully connected over NVLink interconnects, or the set of GPUs connected to a single CPU host. Before B200, these were usually the same, but in GB200 NVL72, we have an NVLink domain with 72 GPUs but still only 8 GPUs connected to each host. We use the term node here to refer to the NVLink domain, but this is controversial.) are connected within 1 hop of each other using high-bandwidth interconnects called NVLinks, and these nodes are connected into larger units (called **SUs** or Scalable Units) with a lower bandwidth InfiniBand (IB) or Ethernet network using NICs attached to each GPU. These in turn can be connected into arbitrarily large units with higher level switches.

![](https://jax-ml.github.io/scaling-book/assets/gpu/superpod-diagram.png)

Figure: a diagram showing a typical H100 network. A set of 8 GPUs is connected into a node or NVLink domain with NVSwitches (also called NVLink switches), and these nodes are connected to each other with a switched InfiniBand fabric. H100s have about 450GB/s of egress bandwidth each in the NVLink domain, and each node has 400GB/s of egress bandwidth into the IB network.

### At the node level

A GPU node is a small unit, typically of 8 GPUs (up to 72 for GB200), connected with all-to-all, full-bandwidth, low latency NVLink interconnects.NVLink has been described to me as something like a souped-up PCIe connection, with low latency and protocol overhead but not designed for scalability/fault tolerance, while InfiniBand is more like Ethernet, designed for larger lossy networks. Each node contains several high-bandwidth NVSwitches which switch packets between all the local GPUs. The actual node-level topology has changed quite a bit over time, including the number of switches per node, but for H100, we have 4 NVSwitches per node with GPUs connected to them in a `5 + 4 + 4 + 5` link pattern, as shown:

![](https://jax-ml.github.io/scaling-book/assets/gpu/nvlink-nodes.png)

Figure: node aka NVLink domain diagrams from Pascal (P100) onward. Since Volta (V100), we have had all-to-all connectivity within a node using a set of switches. The H100 node has 4 NVSwitches connected to all 8 GPUs with 25GB/s links.

For the Hopper generation (NVLink 4.0), each NVLink link has 25GB/s of full-duplex Full-duplex here means 25GB/s each way, with both directions independent of each other. You can send a total of 50GB/s over the link, but at most 25GB/s in each direction. bandwidth (50GB/s for B200), giving us `18 * 25=450GB/s` of full-duplex bandwidth from each GPU into the network. The massive NVSwitches have up to 64 NVLink ports, meaning an 8xH100 node with 4 switches can handle up to `64 * 25e9 * 4=6.4TB/s` of bandwidth. Here’s an overview of how these numbers have changed with GPU generation:

| NVLink Gen | NVSwitch Gen | GPU Generation | NVLink Bandwidth (GB/s, full-duplex) | NVLink Ports / GPU | Node GPU to GPU bandwidth (GB/s full-duplex) | Node size (NVLink domain) | NVSwitches per node |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **3.0** | **2.0** | Ampere | 25 | 12 | 300 | 8 | 6 |
| **4.0** | **3.0** | Hopper | 25 | 18 | 450 | 8 | 4 |
| **5.0** | **4.0** | Blackwell | 50 | 18 | 900 | 8/72 | 2/18 |

Blackwell (B200) has nodes of 8 GPUs. GB200NVL72 support larger NVLink domains of 72 GPUs. We show details for both the 8 and 72 GPUs systems.

### Quiz 2: GPU nodes

Here are some more Q/A problems on networking. I find these particularly useful to do out, since they make you work through the actual communication patterns.

**Question 1 \[Total bandwidth for H100 node\]:** How much total bandwidth do we have per node in an 8xH100 node with 4 switches? *Hint:* consider both the NVLink and NVSwitch bandwidth.

Click here for the answer.

**Answer:** We have Gen4 4xNVSwitches, each with `64 * 25e9=1.6TB/s` of unidirectional bandwidth. That would give us `4 * 1.6e12=6.4e12` bandwidth at the switch level. However, note that each GPU can only handle 450GB/s of unidirectional bandwidth, so that means we have at most `450e9 * 8 = 3.6TB/s` bandwidth. Since this is smaller, the peak bandwidth is 3.6TB/s.

**Question 2 \[Bisection bandwidth\]**: Bisection bandwidth is defined as the smallest bandwidth available between any even partition of a network. In other words, if we split a network into two equal halves, how much bandwidth crosses between the two halves? Can you calculate the bisection bandwidth of an 8x H100 node? *Hint:* bisection bandwidth typically includes flow in both directions.

Click here for the answer.

**Answer:** Any even partition will have 4 GPUs in each half, each of which can egress `4 * 450GB/s` to the other half. Taking flow in both directions, this gives us `8 * 450GB/s` of bytes cross the partition, or 3.6TB/s of bisection bandwidth. This is what NVIDIA reports e.g. [here](https://hc34.hotchips.org/assets/program/conference/day2/Network%20and%20Switches/NVSwitch%20HotChips%202022%20r5.pdf).

**Question 3 \[AllGather cost\]**: Given an array of B bytes, how long would a (throughput-bound) AllGather take on an 8xH100 node? Do the math for bf16\[D <sub>X</sub>, F\] where `D=4096`, `F=65,536`. *It’s worth reading the TPU collectives [section](https://jax-ml.github.io/scaling-book/sharding/) before answering this. Think this through here but we’ll talk much more about collectives next.*

Click here for the answer.

**Answer:** Each GPU can egress 450GB/s, and each GPU has B / N bytes (where `N=8`, the node size). We can imagine each node sending its bytes to each of the other N - 1 nodes one after the other, leading to a total of (N - 1) turns each with T\_\\text{comms} = (B / (N \* W\_\\text{unidirectional})), or T\_\\text{comms} = (N - 1) \* B / (N \* W\_\\text{unidirectional}). This is approximately B / (N \* W\_\\text{uni}) or B / \\text{3.6e12}, the bisection bandwidth.

For the given array, we have `B=4096 * 65536 * 2=512MB`, so the total time is `536e6 * (8 - 1) / 3.6e12 = 1.04ms`. This could be latency-bound, so it may take longer than this in practice (in practice it takes about 1.5ms).

## Beyond the node level

Beyond the node level, the topology of a GPU network is less standardized. NVIDIA publishes a [reference DGX SuperPod architecture](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/network-fabrics.html) that connects a larger set of GPUs than a single node using InfiniBand, but customers and datacenter providers are free to customize this to their needs.For instance, Meta trained LLaMA-3 on a datacenter network that differs significantly from this description, using Ethernet, a 3 layer switched fabric, and an oversubscribed switch at the top level.

Here is a diagram for a reference 1024 GPU H100 system, where each box in the bottom row is a single 8xH100 node with 8 GPUs, 8 400Gbps CX7 NICs (one per GPU), and 4 NVSwitches.

![](https://jax-ml.github.io/scaling-book/assets/gpu/h100-superpod.png)

Figure: diagram of the reference 1024 H100 DGX SuperPod with 128 nodes (sometimes 127), each with 8 H100 GPUs, connected to an InfiniBand scale-out network. Sets of 32 nodes (256 GPUs) are called 'Scalable Units' or SUs. The leaf and spine IB switches provide enough bandwidth for full bisection bandwidth between nodes.

**Scalable Units:** Each set of 32 nodes is called a “Scalable Unit” (or SU), under a single set of 8 leaf InfiniBand switches. This SU has 256 GPUs with 4 NVSwitches per node and 8 Infiniband leaf switches. All the cabling shown is InfiniBand NDR (50GB/s full-duplex) with 64-port NDR IB switches (also 50GB/s per port). *Note that the IB switches have 2x the bandwidth of the NVSwitches (64 ports with 400 Gbps links).*

**SuperPod:** The overall SuperPod then connects 4 of these SUs with 16 top level “spine” IB switches, giving us 1024 GPUs with 512 node-level NVSwitches, 32 leaf IB switches, and 16 spine IB switches, for a total of 512 + 32 + 16 = 560 switches. Leaf switches are connected to nodes in sets of 32 nodes, so each set of 256 GPUs has 8 leaf switches. All leaf switches are connected to all spine switches.

**How much bandwidth do we have?** The overall topology of the InfiniBand network (called the “scale out network”) is that of a **fat tree**, with the cables and switches guaranteeing full bisection bandwidth above the node level (here, 400GB/s). That means if we split the nodes in half, each node can egress 400GB/s to a node in the other partition at the same time. More to the point, this means we should have a roughly constant AllReduce bandwidth in the scale out network! While it may not be implemented this way, you can imagine doing a ring reduction over arbitrarily many nodes in the scale-out network, since you can construct a ring including every one.

| Level | GPUs | Switches per Unit | Switch Type | Bandwidth per Unit (TB/s, full-duplex) | GPU-to-GPU Bandwidth (GB/s, full-duplex) | Fat Tree Bandwidth (GB/s, full-duplex) |
| --- | --- | --- | --- | --- | --- | --- |
| Node | 8 | 4 | NVL | 3.6 | 450 | 450 |
| Leaf | 256 | 8 | IB | 12.8 | 50 | 400 |
| Spine | 1024 | 16 | IB | 51.2 | 50 | 400 |

By comparison, a TPU v5p has about 90GB/s egress bandwidth per link, or 540GB/s egress along all axes of the 3D torus. This is not point-to-point so it can only be used for restricted, uniform communication patterns, but it still gives us a much higher TPU to TPU bandwidth that can scale to arbitrarily large topologies (at least up to 8960 TPUs).

The GPU switching fabric can in theory be extended to arbitrary sizes by adding additional switches or layers of indirection, at the cost of additional latency and costly network switches.

**Takeaway**: Within an H100 node, we have a full fat tree bandwidth of 450GB/s from each GPU, while beyond the node, this drops to 400GB/s node-to-node. This will turn out to be critical for communication primitives.

**GB200 NVL72s:** NVIDIA has recently begun producing new GB200 NVL72 GPU clusters that combine 72 GPUs in a single NVLink domain with full 900GB/s of GPU to GPU bandwidth. These domains can then be linked into larger SuperPods with proportionally higher (9x) IB fat tree bandwidth. Here is a diagram of that topology:

![](https://jax-ml.github.io/scaling-book/assets/gpu/gb200-superpod.png)

Figure: a diagram showing a GB200 DGX SuperPod of 576 GPUs. Each rack at the bottom layer contains 72 GB200 GPUs.

Counting the egress bandwidth from a single node (the orange lines above), we have `4 * 18 * 400 / 8 = 3.6TB/s` of bandwidth to the leaf level, which is 9x more than an H100 (just as the node contains 9x more GPUs). That means the critical node egress bandwidth is much, *much* higher and our cross-node collective bandwidth can actually be *lower* than within the node. See [Appendix A](https://jax-ml.github.io/scaling-book/gpus/#appendix-a-how-does-this-change-with-gb200) for more discussion.

| Node Type | GPUs per node | GPU egress bandwidth | Node egress bandwidth |
| --- | --- | --- | --- |
| H100 | 8 | 450e9 | 400e9 |
| B200 | 8 | 900e9 | 400e9 |
| GB200 NVL72 | 72 | 900e9 | 3600e9 |

**Takeaway**: GB200 NVL72 SuperPods drastically increase the node size and egress bandwidth from a given node, which changes our rooflines significantly.

### Quiz 3: Beyond the node level

**Question 1 \[Fat tree topology\]:** Using the DGX H100 diagram above, calculate the bisection bandwidth of the entire 1024 GPU pod at the node level. Show that the bandwidth of each link is chosen to ensure full bisection bandwidth. *Hint: make sure to calculate both the link bandwidth and switch bandwidth.*

Click here for the answer.

**Answer:** Let’s do it component by component:

- First, each node has 8x400Gbps NDR IB cables connecting it to the leaf switches, giving each node `8 * 400 / 8 = 400 GB/s` of bandwidth to the leaf. We have 8 leaf switches with 3.2TB/s each (64 400 GBps links), but we can only use 32 of the 64 ports to ingress from the SU, so that’s `32 * 400 / 8 = 12.8TB/s` for 32 nodes, again exactly 400GB/s.
- Then at the spine level we have `8 * 16 * 2` 400Gbps NDR IB cables connecting each SU to the spine, giving each SU `8 * 16 * 2 * 400 / 8 = 12.8 TB/s` of bandwidth to the leaf. Again, this is 400GB/s per node. We have 16 spine switches, each with 3.2TB/s, giving us `16 * 3.2 = 51.2 TB/s`, which with 128 nodes is again 400GB/s.

Thus if we bisect our nodes in any way, we will have 400GB/s per GPU between them. Every component has exactly the requisite bandwidth to ensure the fat tree.

**Question 2 \[Scaling to a larger DGX pod\]:** Say we wanted to train on 2048 GPUs instead of 1024. What would be the simplest/best way to modify the above DGX topology to handle this? What about 4096? *Hint: there’s no single correct answer, but try to keep costs down. Keep link capacity in mind. [This](https://docs.nvidia.com/dgx-superpod-reference-architecture-dgx-h100.pdf) documentation may be helpful.*

Click here for the answer.

**Answer:** One option would be to keep the SU structure intact (32 nodes under 8 switches) and just add more of them with more top-level switches. We’d need 2x more spine switches, so we’d have 8 SUs with 32 spine switches giving us enough bandwidth.

One issue with this is that we only have 64 ports per leaf switch, and we’re already using all of them in the above diagram. But instead it’s easy to do 1x 400 Gbps NDR cable per spine instead of 2x, which gives the same total bandwidth but saves us some ports.

For 4096 GPUs, we actually run out of ports, so we need to add another level of indirection, that is to say, another level in the hierarchy. NVIDIA calls these “core switches”, and builds a 4096 GPU cluster with 128 spine switches and 64 core switches. You can do the math to show that this gives enough bandwidth.

## How Do Collectives Work on GPUs?

GPUs can perform all the same collectives as TPUs: ReduceScatters, AllGathers, AllReduces, and AllToAlls. Unlike TPUs, the way these work changes depending on whether they’re performed at the node level (over NVLink) or above (over InfiniBand). These collectives are implemented by NVIDIA in the [NVSHMEM](https://developer.nvidia.com/nvshmem) and [NCCL](https://developer.nvidia.com/nccl) (pronounced “nickel”) libraries. NCCL is open-sourced [here](https://github.com/NVIDIA/nccl). While NCCL uses a variety of implementations depending on latency requirements/topology ([details](https://github.com/NVIDIA/nccl/issues/1415#issuecomment-2310650081)), from here on, we’ll discuss a theoretically optimal model over a switched tree fabric.

### Intra-node collectives

**AllGather or ReduceScatter:** For an AllGather or ReduceScatter at the node level, you can perform them around a ring just like a TPU, using the full GPU-to-GPU bandwidth at each hop. Order the GPUs arbitrarily and send a portion of the array around the ring using the full GPU-to-GPU bandwidth.You can also think of each GPU sending its chunk of size \\text{bytes} / N to each of the other N - 1 GPUs, for a total of (N - 1) \* N \* bytes / N bytes communicated, which gives us the same answer. The cost of each hop is T\_\\text{hop} = \\text{bytes} / (N \* \\text{GPU egress bandwidth}), so the overall cost is

$$
TAG or RS comms=bytes⋅(N−1)N⋅GPU egress bandwidth→bytesGPU egress bandwidth
$$

You’ll note this is exactly the same as on a TPU. For an AllReduce, you can combine an RS + AG as usual for twice the cost.

![](https://jax-ml.github.io/scaling-book/assets/gpu/all-gather.gif)

Figure: bandwidth-optimal 1D ring AllGather algorithm. For B bytes, this sends B / X bytes over the top-level switches X - 1 times.

If you’re concerned about latency (e.g. if your array is very small), you can do a tree reduction, where you AllReduce within pairs of 2, then 4, then 8 for a total of \\log(N) hops instead of N - 1, although the total cost is still the same.

**Takeaway:** the cost to AllGather or ReduceScatter an array of B bytes within a single node is about T\_\\text{comms} = B \* (8 - 1) / (8 \* W\_\\text{GPU egress}) \\approx B / W\_\\text{GPU egress}. This is theoretically around B / \\text{450e9} on an H100 and B / \\text{900e9} on a B200. An AllReduce has 2x this cost unless in-network reductions are enabled.

**Pop Quiz 1 \[AllGather time\]:** Using an 8xH100 node with 450 GB/s full-duplex bandwidth, how long does AllGather(bf16\[B <sub>X</sub>, F\]) take? Let B=1024, F=16,384.

Click here for the answer.

**Answer:** We have a total of 2 \\cdot B \\cdot F bytes, with 450e9 unidirectional bandwidth. This would take roughly T\_\\text{comms} = (2 \\cdot B \\cdot F) / \\text{450e9}, or more precisely (2 \\cdot B \\cdot F \\cdot (8 - 1)) / (8 \\cdot \\text{450e9}). Using the provided values, this gives us roughly (2 \\cdot 1024 \\cdot 16384) / \\text{450e9} = \\text{75us}, or more precisely, \\text{65us}.

**AllToAlls:** GPUs within a node have all-to-all connectivity, which makes AllToAlls, well, quite easy. Each GPU just sends directly to the destination node. Within a node, for B bytes, each GPU has B / N bytes and sends (B / N^2) bytes to N - 1 target nodes for a total of

$$
TAllToAll comms=B⋅(N−1)W⋅N2≈BW⋅N
$$

Compare this to a TPU, where the cost is B / (4W). Thus, within a single node, we get a 2X theoretical speedup in runtime (B / 4W vs. B / 8W).

For Mixture of Expert (MoE) models, we frequently want to do a *sparse or ragged AllToAll,* where we guarantee at most k of N shards on the output dimension are non-zero, that is to say T\_\\text{AllToAll} \\rightarrow K\[B, N\] where at most k of N entries on each axis are non-zero. The cost of this is reduced by k/N, for a total of about \\min(k/N, 1) \\cdot B / (W \\cdot N). For an MoE, we often pick the non-zero values independently at random, so there’s some chance of having fewer than k non-zero, giving us approximately (N-1)/N \\cdot \\min(k/N, 1) \\cdot B / (W \\cdot N).The true cost is actually 
$$
(1−(Z−1Z)K)⋅Z−1Z
$$
 the expected number of distinct outcomes in K dice rolls, but it is very close to the approximation given. See the Appendix for more details.

**Pop Quiz 2 \[AllToAll time\]:** Using an 8xH100 node with 450 GB/s unidirectional bandwidth, how long does AllToAll <sub>X-&gt;N</sub> (bf16\[B <sub>X</sub>, N\]) take? What if we know only 4 of 8 entries will be non-zero?

Click here for the answer.

**Answer:** From the above, we know that in the dense case, the cost is B \\cdot (N-1) / (W \\cdot N^2), or B / (W \\cdot N). If we know only \\frac{1}{2} the entries will be non-padding, we can send B \\cdot k/N / (W \\cdot N) = B / (2 \\cdot W \\cdot N), roughly half the overall cost.

**Takeaway:** The cost of an AllToAll on an array of B bytes on GPU within a single node is about T\_\\text{comms} = (B \\cdot (8 - 1)) / (8^2 \\cdot W\_\\text{GPU egress}) \\approx B / (8 \\cdot W\_\\text{GPU egress}). For a ragged (top- k) AllToAll, this is decreased further to (B \\cdot k) / (64 \\cdot W\_\\text{GPU egress}).

**Empirical measurements:** here is an empirical measurement of AllReduce bandwidth over an 8xH100 node. The Algo BW is the measured bandwidth (bytes / runtime) and the Bus BW is calculated as 2 \\cdot W \\cdot (8 - 1) / 8, theoretically a measure of the actual link bandwidth. You’ll notice that we do achieve close to 370GB/s, less than 450GB/s but reasonably close, although only around 10GB/device. This means although these estimates are theoretically correct, it takes a large message to realize it.

![](https://jax-ml.github.io/scaling-book/assets/gpu/gpu-all-reduce-bw.png)

Figure: AllReduce throughput for an 8xH100 node with SHARP disabled. The blue curve is the empirical link bandwidth, calculated as 2 \* \\text{bytes} \* (N - 1) / (N \* \\text{runtime}) from the empirical measurements. Note that we do not get particularly close to the claimed bandwidth of 450GB/s, even with massive 10GB arrays.

This is a real problem, since it meaningfully complicates any theoretical claims we can make, since e.g. even an AllReduce over a reasonable sized array, like LLaMA-3 70B’s MLPs (of size `bf16[8192, 28672]`, or with 8-way model sharding, `bf16[8192, 3584] = 58MB`) can achieve only around 150GB/s compared to the peak 450GB/s. By comparison, TPUs achieve peak bandwidth at much lower message sizes (see Appendix B).

**Takeaway:** although NVIDIA claims bandwidths of about 450GB/s over an H100 NVLink, it is difficult in practice to exceed 370 GB/s, so adjust the above estimates accordingly.

**In network reductions:** Since the Hopper generation, NVIDIA switches have supported [“SHARP” (Scalable Hierarchical Aggregation and Reduction Protocol)](https://developer.nvidia.com/blog/advancing-performance-with-nvidia-sharp-in-network-computing/) which allows for “in-network reductions”. This means *the network switches themselves* can do reduction operations and multiplex or “MultiCast” the result to multiple target GPUs:

![](https://jax-ml.github.io/scaling-book/assets/gpu/sharp-algorithm.png)

Figure: an AllReduce without SHARP has 2x the theoretical cost because it has to pass through each GPU twice. In practice, speedups are only about 30% (from NCCL 2.27.5).

Theoretically, this close to halves the cost of an AllReduce, since it means each GPU can send its data to a top-level switch which itself performs the reduction and broadcasts the result to each GPU without having to egress each GPU twice, while also reducing network latency.

$$
TSHARP AR comms=bytesGPU egress bandwidth
$$

Note that this is exact and not off by a factor of 1/N, since each GPU egresses B \\cdot (N - 1) / N first, then receives the partially reduced version of its local shard (ingress of B/N), finishes the reductions, then egresses B/N again, then ingresses the fully reduced result (ingress of B \\cdot (N - 1) / N), resulting in exactly B bytes ingressed.

However, in practice we see about a 30% increase in bandwidth with SHARP enabled, compared to the predicted 75%. This gets us up merely to about 480GB/s effective collective bandwidth, not nearly 2x.

![](https://jax-ml.github.io/scaling-book/assets/gpu/sharp-all-reduce-cost.png)

Figure: empirical measurements of AllReduce algo bandwidth with and without NVIDIA SHARP enabled within a node. The gains amount to about 30% throughput improvement at peak, even though algorithmically it ought to be able to achieve closer to a 75% gain.

**Takeaway:** in theory, NVIDIA SHARP (available on most NVIDIA switches) should reduce the cost of an AllReduce on B bytes from about 2 \* B / W to B / W. However, in practice we only see a roughly 30% improvement in bandwidth. Since pure AllReduces are fairly rare in LLMs, this is not especially useful.

### Cross-node collectives

When we go beyond the node-level, the cost is a bit more subtle. When doing a reduction over a tree, you can think of reducing from the bottom up, first within a node, then at the leaf level, and then at the spine level, using the normal algorithm at each level. For an AllReduce especially, you can see that this allows us to communicate less data overall, since after we AllReduce at the node level, we only have to egress B bytes up to the leaf instead of B \* N.

**How costly is this?** To a first approximation, because we have full bisection bandwidth, the cost of an AllGather or ReduceScatter is roughly the buffer size in bytes divided by the node egress bandwidth (400GB/s on H100) *regardless of any of the details of the tree reduction.*

$$
TAG or RS comms=bytesWnode egress=H100bytes400e9
$$

where W\_\\text{node} egress is generally 400GB/s for the above H100 network (8x400Gbps IB links egressing each node). The cleanest way to picture this is to imagine doing a ring reduction over *every node in the cluster*. Because of the fat tree topology, we can always construct a ring with W\_\\text{node} egress between any two nodes and do a normal reduction. The node-level reduction will (almost) never be the bottleneck because it has a higher overall bandwidth and better latency, although in general the cost is

$$
Ttotal=max(Tcomms at node,Tcomms in scale-out network)=max[bytesWGPU egress,bytesWnode egress]
$$
 You can see a more precise derivation here.

We can be more precise in noting that we are effectively doing a ring reduction at each layer in the network, which we can mostly overlap, so we have:

$$
TAG or RS comms=bytes⋅maxdepth i[Di−1Di⋅Wlink i]
$$

where D\_i is the degree at depth i (the number of children at depth i), W\_\\text{link i} is the bandwidth of the link connecting each child to node i.

Using this, we can calculate the available AllGather/AllReduce bandwidth as min\_\\text{depth i}(D\_i \* W\_\\text{link i} / (D\_i - 1)) for a given topology. In the case above, we have:

- **Node:**D\_\\text{node} = 8 since we have 8 GPUs in a node with Wlink i = 450GB/s. Thus we have an AG bandwidth of `450e9 * 8 / (8 - 1) = 514GB/s`.
- **Leaf:**D\_\\text{leaf} = 32 since we have 32 nodes in an SU with Wlink i = 400GB/s (8x400Gbps IB links). Thus our bandwidth is `400e9 * 32 / (32 - 1) = 413GB/s`.
- **Spine:**D\_\\text{spine} = 4 since we have 4 SUs with W\_\\text{link i} = 12.8TB/s (from `8 * 16 * 2 * 400Gbps` links above). Our bandwidth is `12.8e12 * 4 / (4 - 1) = 17.1TB/s`.

Hence our overall AG or RS bandwidth is `min(514GB/s, 413GB/s, 17.1TB/s) = 413GB/s` at the leaf level, so in practice T\_\\text{AG or RS comms} = B / \\text{413GB/s}, i.e. we have about 413GB/s of AllReduce bandwidth even at the highest level. For an AllReduce with SHARP, it will be slightly lower than this (around 400GB/s) because we don’t have the (N - 1) / N factor. Still, 450GB/s and 400GB/s are close enough to use as approximations.

**Other collectives:** AllReduces are still 2x the above cost unless SHARP is enabled. NVIDIA sells SHARP-enabled IB switches as well, although not all providers have them. AllToAlls do change quite a bit cross-node, since they aren’t “hierarchical” in the way AllReduces are. If we want to send data from every GPU to every other GPU, we can’t use take advantage of the full bisection bandwidth at the node level. That means if we have an N-way AllToAll that spans M = N / 8 nodes, the cost is

$$
TAllToAll comms=B⋅(M−1)M2⋅Wnode egress≈BM⋅Wnode egress
$$

which effectively has 50GB/s rather than 400GB/s of bandwidth. We go from B / (8 \* \\text{450e9}) within a single H100 node to B / (2 \\cdot \\text{400e9}) when spanning 2 nodes, a more than 4x degradation.

Here is a summary of the 1024-GPU DGX H100 SuperPod architecture:

| Level | Number of GPUs | Degree (# Children) | Switch Bandwidth (full-duplex, TB/s) | Cable Bandwidth (full-duplex, TB/s) | Collective Bandwidth (GB/s) |
| --- | --- | --- | --- | --- | --- |
| Node | 8 | 8 | 6.4 | 3.6 | 450 |
| Leaf (SU) | 256 | 32 | 25.6 | 12.8 | 400 |
| Spine | 1024 | 4 | 51.2 | 51.2 | 400 |

We use the term “Collective Bandwidth” to describe the effective bandwidth at which we can egress either the GPU or the node. It’s also the \\text{bisection bandwidth} \* 2 / N.

**Takeaway:** beyond the node level, the cost of an AllGather or ReduceScatter on B bytes is roughly B / W\_\\text{node egress}, which is B / \\text{400e9} on an H100 DGX SuperPod, while AllReduces cost twice as much unless SHARP is enabled. The overall topology is a fat tree designed to give constant bandwidth between any two pairs of nodes.

**Reductions when array is sharded over a separate axis:** Consider the cost of a reduction like

$$
AllReduceX(A[IY,J] {UX})
$$

where we are AllReducing over an array that is itself sharded along another axis Y. On TPUs, the overall cost of this operation is reduced by a factor of 1 / Y compared to the unsharded version since we’re sending 1 / Y as much data per axis. On GPUs, the cost depends on which axis is the “inner” one (intra-node vs. inter-node) and whether each shard spans more than a single node. Assuming Y is the inner axis, and the array has \\text{bytes} total bytes, the overall cost is reduced effectively by Y, but only if Y spans multiple nodes:

$$
Tcomms at node=bytesWGPU egress⋅1min(Y,Dnode)
$$
 
$$
Tcomms in scale-out network=bytesWnode egress⋅Dnodemax(Dnode,Y)
$$
 
$$
Ttotal=max(Tcomms at node,Tcomms in scale-out network)
$$

where N is the number of GPUs and again D\_\\text{node} is the number of GPUs in a node (the degree of the node). As you can see, if Y < D\_\\text{node}, we get a win at the node level but generally don’t see a reduction in overall runtime, while if Y > D\_\\text{node}, we get a speedup proportional to the number of nodes spanned.

If we want to be precise about the ring reduction, the general rule for a tree AllGather <sub>X</sub> (A <sub>Y</sub> { U <sub>X</sub> }) (assuming Y is the inner axis) is

$$
TAR or RS comms=bytes⋅maxdepth i[Di−1Di⋅max(Y,Si−1)⋅Wlink i]
$$

where S\_i is M \* N \* …, the size of the subnodes below level i in the tree. This is roughly saying that the more GPUs or nodes we span, the greater our available bandwidth is, but only within that node.

**Pop Quiz 3 \[Sharding along 2 axes\]:** Say we want to perform \\text{AllGather}\_X(\\text{bf16}\[D\_X, F\_Y\]) where Y is the inner axis over a single SU (256 chips). How long will this take as a function of D, F, and Y?

Click here for the answer.

**Answer:** We can break this into two cases, where Y <= 8 and when Y > 8. When Y <= 8, we remain bounded by the leaf switch, so the answer is, as usual, T\_\\text{comms} = 2 \* D \* F \* (32 - 1) / (32 \* 400e9). When Y > 8, we have from above, roughly

$$
Tcomms=2⋅D⋅F⋅256Y⋅12.8e12=2DFY⋅50GB/s
$$

For `D = 8192`, `F = 32,768`, we have:

![](https://jax-ml.github.io/scaling-book/assets/gpu/sharded-all-gather-cost.png)

Figure: theoretical cost of a sharded AllGather as the inner axis spans more nodes.

Note how, if we do exactly 8-way model parallelism, we do in fact reduce the cost of the node-level reduction by 8 but leave the overall cost the same, so it’s free but not helpful in improving overall bandwidth.

**Takeaway:** when we have multiple axes of sharding, the cost of the outer reduction is reduced by a factor of the number of nodes spanned by the inner axis.

### Quiz 4: Collectives

**Question 1 \[SU AllGather\]:** Consider only a single SU with M nodes and N GPUs per node. Precisely how many bytes are ingressed and egressed by the node level switch during an AllGather? What about the top-level switch?

Click here for the answer.

**Answer:** Let’s do this step-by-step, working through the components of the reduction:

1. Each GPU sends B / MN bytes to the switch, for a total ingress of NB / MN = B / M bytes ingress.
2. We egress the full B / M bytes up to the spine switch.
3. We ingress B \* (M - 1) / M bytes from the spine switch
4. We egress B - B / MN bytes N times, for a total of N \* (B - B / MN) = NB - B / M.

The total is B ingress and BN egress, so we should be bottlenecked by egress, and the total time would be T\_\\text{AllGather} = BN / W\_\\text{node} = B / \\text{450e9}.

For the spine switch, the math is actually simpler. We must have B / M bytes ingressed M times (for a total of B bytes), and then B (M - 1) / M egressed M times, for a total of B \* (M - 1) out. Since this is significantly larger, the cost is T\_\\text{AllGather} = B \\cdot (M - 1) / (M \\cdot W\_\\text{node}) = B \\cdot (M - 1) / (M \\cdot \\text{400e9}).

**Question 2 \[Single-node SHARP AR\]:** Consider a single node with N GPUs per node. Precisely how many bytes are ingressed and egressed by the switch during an AllReduce using SHARP (in-network reductions)?

Click here for the answer.

**Answer:** As before, let’s do this step-by-step.

1. Each GPU sends B \* (N - 1) / N bytes, so we have N \* B \* (N - 1) / N = B \* (N - 1) ingressed.
2. We accumulate the partial sums, and we send back B / N bytes to each GPU, so N \* B / N = B bytes egressed.
3. We do a partial sum on the residuals locally, then send this back to the switch. This is a total of N \* B / N = B bytes ingressed.
4. We capture all the shards and multicast them, sending B \* (N - 1) / N to N destinations, for a total of B \* (N - 1) / N \* N = B \* (N - 1) egressed.

Therefore the total is B \* (N - 1) + B = BN bytes ingressed and egressed. This supports the overall throughput being exactly B / W\_\\text{egress}.

**Question 3 \[Cross-node SHARP AR\]:** Consider an array bf16\[D <sub>X</sub>, F <sub>Y</sub>\] sharded over a single node of N GPUs. How long does AllReduce(bf16\[D, F <sub>Y</sub>\] { U <sub>X</sub> }) take? You can assume we do in-network reductions. Explain how this differs if we have more than a single node?

Click here for the answer.

**Answer:** We can try to modify the answer to the previous question above. Basically, we first egress B \* (X - 1) / XY bytes from each GPU, then send back B / XY to each GPU, then send that same amount back to the switch, then send B \* (X - 1) / XY back to each GPU. The total is NB / Y ingress and egress, so the total time is T\_\\text{comms} = NB / (Y \* N \* W\_\\text{link}) = N \* 2DF / (Y \* N \* W\_\\text{link}) = 2 \* D \* F / (Y \* W\_\\text{link}), so the total time does decrease with Y.

If we go beyond a single node, we can do roughly the same reduction as above, but when we egress the node-level switch, we need to send all B bytes, not just B / Y. This is because we need to keep each shard separate.

**Question 4 \[Spine level AR cost\]:** Consider the same setting as above, but with Y = 256 (so the AR happens at the spine level). How long does the AllReduce take? Again, feel free to assume in-network reductions.

Click here for the answer.

**Answer:** This lets us take advantage of the rather ludicrous amount of bandwidth at the spine level. We have 25.6TB/s of bandwidth over 4 nodes, so an AllReduce bandwidth of 6.4TB/s. Using SHARP, this could take as little as `2 * D * F / 6.4e12` seconds.

**Question 5 \[2-way AllGather cost\]:** Calculate the precise cost of an AllGather of B bytes over exactly 2 nodes. *Make sure to calculate the precise cost and not the approximation, and consider both the intra-node and cross-node cost.*

Click here for the answer.

**Answer:** At the node level, we have T\_\\text{comms} = B \* 7 / (8 \* \\text{450e9}) = B / \\text{514e9} while beyond we actually have T\_\\text{comms} = B \* (2 - 1) / (2 \* \\text{400e9}) = B / \\text{800e9}. Thus, we’re actually bounded by the node level reduction and not the leaf level! This motivates e.g. DeepSeek v3 which does 2-way Data Parallelism.

## Rooflines for LLM Scaling on GPUs

Now let’s look at what this has all been building towards: understanding rooflines for LLM scaling on GPU. This is to complement the TPU training chapter [here](https://jax-ml.github.io/scaling-book/training). As we did there, the goal here is to look at the total T\_\\text{math} and T\_\\text{comms} for different parallelism strategies and understand at what point T\_\\text{comms} > T\_\\text{math}. As before, we consider only the MLP block with operations

$$
MLP(x)≡x[B,D]∗DWin[D,F]⋅FWout[F,D]
$$

where B is the global batch size **in tokens** (i.e. B = \\text{batch size} \\cdot \\text{sequence length}).

Here we’ll reproduce the table above showing effective bandwidths at both the GPU and node level:

| Node Type | GPUs per node | GPU egress bandwidth | Node egress bandwidth |
| --- | --- | --- | --- |
| H100 | 8 | 450e9 | 400e9 |
| B200 | 8 | 900e9 | 400e9 |
| GB200 NVL72 | 72 | 900e9 | 3600e9 |

**Note:** Both the GPU and node egress bandwidths determine rooflines for our LLMs. We’ll use the term W\_\\text{collective} to describe either the GPU or node bandwidths depending on whether we are operating within or above the node level.

Let’s look at the compute communication rooflines as we did for TPUs for **data parallelism, tensor parallelism, pipeline parallelism, expert parallelism,** and combinations thereof. For the rest of this section we’ll focus on H100 rooflines for specific calculations. GB200-NVL72 has the same general rooflines but because we have a larger node egress bandwidth, we can sometimes be bottlenecked at the node level instead.

### Data Parallelism

As noted before, DP and ZeRO sharding involve either a weight AllReduce or a ReduceScatter + AllGather in the backward pass. Since these both have the same cost, to be compute-bound for pure data parallelism or FSDP *without in-network reductions*, we have, per layer, in the backward pass, with an axis of size X:

$$
Tmath=2⋅2⋅2⋅BDFX⋅C
$$
 
$$
Tcomms=2⋅2⋅2⋅DFWcollective
$$

Therefore, for T\_\\text{math} > T\_\\text{comms}, we need B / (XC) > 1 / W\_\\text{collective} or

$$
BX>CWcollective
$$

where W\_\\text{collective} is either the GPU or node level egress bandwidth depending on whether we’re sharding within a node or across nodes. Thus:

- **Within a node**, we just need the per-GPU **token** batch size > \\text{990e12} / \\text{450e9} = 2200.
- **Within an SU or at the spine level**, BS > \\text{990e12} / \\text{400e9} = 2475.

This is quite a bit higher than on a TPU, where the number is 850 with all three axes. For instance, LLaMA-3, which trained on 16000 H100s would need a batch size of at least 40M tokens (for reference, they used 16M). DeepSeek v3 trained on 2048 H800 GPUs with lower 300GB/s of bandwidth (instead of 450GB/s on H100) would need \\text{990e12} / \\text{300e9} = 3300 tokens per GPU, or about 6.7M (in practice, they used 4M).

With in-network reductions enabled and using pure data parallelism, theoretically we have 2x the AllReduce bandwidth, which would halve both of these numbers. However, in practice the benefit is closer to 30%, which only really makes up for the fact that we typically struggle to reach the reported numbers. Furthermore, because pure data parallelism is rarely useful, this basically doesn’t matter in practice.

**MoE models:** For a Mixture of Experts (MoE) model, where we have E experts and k experts per token, this increases to

$$
Tmath=2⋅2⋅2⋅k⋅BDFX⋅C
$$
 
$$
Tcomms=2⋅2⋅2⋅EDFWcollective
$$

which inflates the per-GPU token batch size by a factor of E/k, i.e.

$$
BX>EkCWcollective
$$

For example, the new OpenAI OSS model with k=4 and E=128, this increases to `32 * 2475 = 79,200` across nodes, a kind of ridiculously high number.

**What happens when X is small?** When we do only e.g. 2-node data parallelism, we benefit from the (X - 1) / X scaling, which gives us

$$
Tmath=2⋅2⋅2⋅BDFN∗C
$$
 
$$
Tcomms=2⋅2⋅2⋅DF⋅(X−1)X⋅Wcollective
$$

where X is the number of nodes and N = 8 \\cdot X. Then for a dense model we have B / N > \\alpha \\cdot (X - 1) / X, or e.g. B / N > \\text{1237}, half the above value. You’ll notice 2-way data parallelism fairly often for this reason.

**Takeaway:** Data parallelism and ZeRO sharding require a per-GPU batch size of about 2500 tokens to be compute-bound on an H100 or B200, assuming perfect overlap and FLOPs utilization. For MoE models, this increases by a factor of E / k, the ratio of total to activated parameters. When doing a small amount of data parallelism, the critical batch size decreases.

### Tensor Parallelism

Tensor parallelism requires an AllGather and ReduceScatter over the activations, which we need to overlap with the MLP FLOPs. In other words, in the forward pass, we have

$$
Tmath=2⋅2⋅BDFY⋅C
$$
 
$$
Tcomms=2⋅2⋅BDWcollective
$$

which to be compute-bound gives us the rule

$$
Y<F⋅WcollectiveC
$$

Within a node, this gives us about F / 2200 or F / 2475 beyond a node. For F=\\text{28000} like LLaMA-3, this is about 11-way TP (or rounding down, about 8-way, which is how large a node is). As with above, we get an extra 2X bandwidth when we span exactly 2 nodes, so we can generally do 16-way tensor parallelism (F > 2475 \\cdot (Y - 8)), which gives us up to 19-way model parallelism in theory.

**Takeaway:** Tensor parallelism over an axis of size Y with feed-forward dimension F becomes communication-bound when the Y > F / 2475, which generally constrains us to only intra-node TP or at most 2-node TP.

### Expert Parallelism

As we’ve already noted above, Mixture of Expert (MoE) models come with E times more model weights with only k times more FLOPs, making data parallelism significantly harder. We can mitigate this somewhat by sharding our weights along the expert dimension, i.e. W <sub>in</sub> \[E <sub>Z</sub>, D, F\]. To do the MLP block, we need to introduce 2x AllToAll to send our activations to the corresponding experts.

As noted above, the cost of this AllToAll <sub>Z-&gt;k</sub> (\[B, D, k\]) if it spans multiple nodes is roughly T\_\\text{AllToAll} = 2 \\cdot B \\cdot D \\cdot (Z-8)/Z \\min(8 \* k / Z, 1), so for pure expert parallelism we need

$$
Tmath=4⋅B⋅k⋅D⋅FZ⋅C
$$
 
$$
Tcomms=4⋅B⋅D⋅(Z−8)W⋅Z⋅min(8⋅kZ,1)
$$

We either need K > Z/8 with F > \\alpha \\cdot (Z - 8)/k or Z \\gg K and F > 8 \\cdot \\alpha, where \\alpha = C/W. This gives you two domains in which expert parallelism is possible, one with a small amount of expert parallelism (roughly 2-node) and small F, or one with large F and Z arbitrarily large (up to E-way expert parallelism).

You’ll see both cases in practice, either a small amount of expert-parallelism (like DeepSeek v3 which has very small F and relatively small, restricted cross-node expert parallelism), or models with large F, in which case we can do significant cross-node EP alongside TP.

**Takeaway:** if F < 8 \* C / W\_\\text{node}, expert parallelism can span 1-2 nodes with similar (slightly lower) cost to TP, or if F > 8 \* C / W\_\\text{node}, we can do a significant amount of expert parallelism (up to E nodes) with relatively low cost.

### Pipeline Parallelism

Pipeline parallelism splits layers across nodes with an extremely low communication cost, since we are just sending small microbatches of activations every couple layers. Historically pipelining has suffered from “pipeline bubbles”, but with new zero-bubble pipelining approaches, it is typically possible to do without.

The overall communication cost of pipelining is tiny: with N\_\\text{MB} microbatches and N\_\\text{stages}, we have T\_\\text{comms per hop} = 2 \\cdot B \\cdot D / (W \\cdot N\_\\text{MB}) and N\_\\text{MB} + N\_\\text{stages} - 2 hops, so roughly

$$
Ttotal PP comms=2BDW⋅NMB⋅(NMB+Nstages−2)
$$
 
$$
Tper-layer comms≈1.5⋅2BDW⋅Nlayers
$$

Since we are dividing by N\_\\text{layers}, this is vastly smaller than any of the other costs. In other words, from a communication standpoint, pipelining is basically free. So why don’t we just do pipelining? There are a few reasons:

(1) **Code complexity:** pipelining doesn’t fit as nicely into automatic parallelism frameworks (like XLA’s GSPMD) as other approaches. Because it introduces microbatching to hide pipeline bubbles, it changes the structure of the program, and custom zero-bubble pipeline schedules exacerbate this problem by requiring complicated interleaving of the forward and backward pass.

(2) **Pipelining makes data parallelism and FSDP hard:** probably the biggest reason not to do pipelining is that it plays badly with FSDP and data parallelism. ZeRO-3 sharding in particular works badly, since it requires us to AllGather the weights on every microbatch which doesn’t work when we have only B / N\_\\text{microbatches} tokens to amortize the AllGather cost. Furthermore, during the backward pass, *we can’t AllReduce or ReduceScatter the gradients until the last microbatch has passed a given stage, which means we have significant non-overlapped communication time.*

![](https://jax-ml.github.io/scaling-book/assets/gpu/pipeline-bubble.png)

Figure: an example 2 stage, 2 microbatch pipeline. F denotes a stage forward pass and B is a stage backward pass (2x the cost). G denotes the data-parallel AllReduces, which can be significantly longer than the time of a single microbatch.

(3) **Pipeline bubbles and step imbalance:** As you can see in the (bad) pipeline schedule above, it is easy to have significant bubbles (meaning wasted compute) during a naive pipeline schedule. Above, the second stage is idle on step 0, the first stage is idle from step 2 to 3, and the second stage is again idle on the last step. While we can avoid these somewhat with careful scheduling, we still often have some bubbles. We also have to pass activations from one stage to the next on the critical path, which can add overhead:

![](https://jax-ml.github.io/scaling-book/assets/gpu/pipeline-transfer.png)

Figure: an example pipeline showing transfer cost in red. This shifts stages relative to each other and increases the pipeline bubble overhead.

There are workarounds for each of these issues, but they tend to be complicated to implement and difficult to maintain; pipelining remains a technique with low communication cost relative to other methods.

**Caveat about latency:** As noted before, GPUs struggle to achieve full AllReduce bandwidth even with fairly large messages. This means even if we in theory can scale e.g. expert-parallel AllToAlls across multiple nodes, we may struggle to achieve even 50% of the total bandwidth. This means we do try to keep TP or EP within a smaller number of nodes to minimize latency overhead.

### Examples

**What does DeepSeek do?** For reference, [DeepSeek V3](https://arxiv.org/abs/2412.19437) is trained with 2048 H800 GPUs with:

- 64-way Expert Parallelism (EP) spanning 8 nodes
- 16-way Pipeline Parallelism (PP)
- 2-way ZeRO-1 Data Parallelism (DP)

They had a steady state batch size of `4096 * 15360 = 62,914,560` tokens, or 30k tokens per GPU. You can see that this is already quite large, but their model is also very sparse (k=8, E=256) so you need a fairly large batch size. You can see that with 64-way EP and 16-way PP, we end up with 1024-way model parallelism in total, which means the AllReduce is done at the spine level, and because it’s only 2-way, we end up with 2 / (2 - 1) = 2 times more bandwidth in practice. This also helps reduce the cost of the final data-parallel AllReduce overlapping with the final pipeline stages.

**What does LLaMA-3 do?** LLaMA-3 trains with a BS of 16M tokens on 16k GPUs, or about 1k tokens per GPU. They do:

- 8-way Tensor Parallelism within a node (TP)
- 16-way Pipeline Parallelism (PP)
- 128-way ZeRO-1 Data Parallelism

This is also a dense model so in general these things are pretty trivial. The 16-way PP reduces the cost of the data parallel AllReduce by 16x, which helps us reduce the critical batch size.

### TLDR of LLM Scaling on GPUs

Let’s step back and come up with a general summary of what we’ve learned so far:

- **Data parallelism or FSDP (ZeRO-1/3) requires a local batch size of about 2500 tokens per GPU**, although in theory in-network reductions + pure DP can reduce this somewhat.
- **Tensor parallelism is compute-bound up to about 8-ways** but we lack the bandwidth to scale much beyond this before becoming comms-bound. This mostly limits us to a single NVLink domain (i.e. single-node or need to use GB200NVL72 with up to 72 GPUs).
- **Any form of model parallelism that spans multiple nodes can further reduce the cost of FSDP**, so we often want to mix PP + EP + TP to cross many nodes and reduce the FSDP cost.
- **Pipeline parallelism works well if you can handle the code complexity of zero-bubble pipelining and keep batch sizes fairly large to avoid data-parallel bottlenecks.** Pipelining usually makes ZeRO-3 impossible (since you would need to AllGather on each pipeline stage), but you can do ZeRO-1 instead.

**At a high level, this gives us a recipe for sharding large models on GPUs:**

- For relatively small dense models, aggressive FSDP works great if you have the batch size, possibly with some amount of pipelining or tensor parallelism if needed.
- For larger dense models, some combination of 1-2 node TP + many node PP + pure DP works well.
- For MoEs, the above rule applies but we can also do expert parallelism, which we prefer to TP generally. If F > 8 \* C / W\_\\text{node}, we can do a ton of multi-node expert parallelism, but otherwise we’re limited to roughly 2-node EP.

### Quiz 5: LLM rooflines

**Question 1 \[B200 rooflines\]:** A B200 DGX SuperPod (**not GB200 NVL72**) has 2x the bandwidth within a node (900GB/s egress) but the same amount of bandwidth in the scale-out network (400GB/s) ([source](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-b200/latest/network-fabrics.html)). The total FLOPs are reported above. How does this change the model and data parallel rooflines?

Click here for the answer.

**Answer:** Our FLOPs/s in bfloat16 increases from 990 to 2250 TFLOPs, a 2.25x increase. With 2x the bandwidth, within a node, our rooflines stay roughly the same. For TP, for example, the critical intensity goes up to `2250e12 / 900e9 = 2500`, so we have a limit of Y < F / 2500, only slightly higher (and this doesn’t help us unless the node size increases).

Beyond a node, however, the lack of additional bandwidth actually makes it even harder for us to be compute-bound! For instance, for data parallelism, our critical batch size increases to `2250e12 / 400e9 = 5625`, because our GPU can do significantly more FLOPs with the same bandwidth.

GB200 SuperPods with 72-GPU nodes change this by adding more egress bandwidth ([source](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html#compute-fabric-576)).

**Question 2 \[How to shard LLaMA-3 70B\]:** Consider LLaMA-3 70B, training in bfloat16 with fp32 optimizer state with Adam.

1. At a minimum, how many H100s would we need simply to store the weights and optimizer?
2. Say we want to train on 4096 H100 GPUs for 15T tokens. Say we achieved 45% MFU (Model FLOPs Utilization). How long would it take to train?
3. LLaMA-3 70B has `F = 28,672` and was trained with a batch size of about 4M tokens. What is the most model parallelism we could do without being comms-bound? With this plus pure DP, could we train LLaMA-3 while staying compute-bound on 4k chips? What about ZeRO-3? What about with 8-way pipelining? *Note: consider both the communication cost and GPU memory usage.*
Click here for the answer.
1. We need 2 bytes for the weights and 8 for the optimizer state, so at least 700GB. With 80GB of DRAM, we’ll need at least 9 GPUs at a minimum, or (rounding up) at least 2 8xH100 nodes. This would take forever to train and wouldn’t hold the gradient checkpoints, but it’s a lower bound.
2. This will require a total of `6 * 70e9 * 15e12 = 6.3e24 bf16 FLOPs`. Each GPU can do `990e12` FLOPs, so at 45% MFU we can do 1.8e18 FLOPs/s. Thus the whole thing will take 3.5e6 seconds, or 40 days.
3. Within a node, we have 450GB/s of bandwidth, so the limit is roughly `F / 1995 = 28672 / 1995 = 14.372`. Since this doesn’t span 2 nodes, it realistically means we’d go up to 8-way model parallelism.
	1. This would then require us to do 512 way DP. Firstly, we need to see if we have enough memory. Since our model is only sharded 8-ways, this would mean `700GB / 8 = 87.5GB / GPU`, which won’t fit, so no!
	2. With ZeRO-3 and 8-way TP, we’ll be doing 512-way ZeRO-3. This won’t have any issue with memory because we’re sharding everything aggressively. We’ll have a per-GPU batch size of `4e6 / 4096 = 976`. This is quite low, even below our pure DP limit, and this is twice that limit because we have to move our weights. So no.
	3. With 8-way pipelining, each model parallel shard now spans 8 nodes. As we’ve seen, this reduced the cost of our leaf-level AllGathers by 8, so the overall AllReduce/AllGather bandwidth there goes from 400GB/s to `8 * 400GB/s = 3200GB/s`. The roofline then is `990e12 / 3200e9 = 309`, so we should be good! We just need to implement pipelining efficiently.

**Question 3 \[Megatron-LM hyperparams\]:** Consider this figure from the [Megatron-LM repository](https://github.com/NVIDIA/Megatron-LM) highlighting their high MFU numbers.

![](https://jax-ml.github.io/scaling-book/assets/gpu/megatron-hparams.png)

Note that their sequence length is 4096 everywhere. For the 16B, 70B, and 314B models, what is the per-GPU token batch size? Assuming data parallelism is the outermost axis and assuming bfloat16 reductions, determine whether each of these is theoretically compute-bound or communication-bound, and whether there is a more optimal configuration available?

Click here for the answer.

**Answer:** Let’s start with batch sizes per GPU.

- **16B**: `192 * 4096 / 192 = 4096` tokens per GPU
- **70B**: `384 * 4096 / 768 = 2048` tokens per GPU
- **314B**: `1536 * 4096 / 3072 = 2048` tokens per GPU

This means with the exception of the first, these all hover around 2k tokens per batch, which is notably around the critical threshold we calculated for FSDP. We had calculated that bound to be 2,472 tokens / GPU based on the spine level reduction, which should roughly come into play here. For both the 70B and 314B though, because we have 16 and 64-way model (PP + TP) sharding respectively, we get 2x and 8x better throughput at the spine level, which means we should be compute-bound at roughly 1k and 300 tokens / step respectively.

This chapter relied heavily on help from many knowledgeable GPU experts, including:

- Adam Paszke, who helped explain the realities of kernel programming on GPUs.
- Swapnil Patil, who first explained how GPU networking works.
- Stas Bekman, who pointed out that the empirical realities of GPUs are often different from the purported specs.
- Reiner Pope, who helped clarify how GPUs and TPUs compare at a hardware level.
- Frédéric Bastien, who gave detailed feedback on the chip-level story.
- Nouamane Tazi, whose experience with LLM training on GPUs helped improve the roofline section.
- Sanford Miller, who helped me understand how GPUs are networked and how NVIDIA’s specifications compare to what’s often deployed in the field.

There’s a great deal of good reading on GPUs, but some of my favorites include:

- [SemiAnalysis’ History of the NVIDIA Tensor Core](https://semianalysis.com/2025/06/23/nvidia-tensor-core-evolution-from-volta-to-blackwell/): a fantastic article describing how GPUs transformed from video game engines to ML accelerators.
- [SemiAnalysis’ Analysis of Blackwell Performance](https://semianalysis.com/2024/04/10/nvidia-blackwell-perf-tco-analysis/): worth reading to understand the next generation of NVIDIA GPUs.
- [H100 DGX SuperPod Reference](https://docs.nvidia.com/dgx-superpod-reference-architecture-dgx-h100.pdf): dry but useful reading on how larger GPU clusters are networked. [Here](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html#compute-fabric-576) is a similar document about the GB200 systems.
- [Hot Chips Talk about the NVLink Switch](https://hc34.hotchips.org/assets/program/conference/day2/Network%20and%20Switches/NVSwitch%20HotChips%202022%20r5.pdf): fun reading about NVLink and NCCL collectives, especially including in-network reductions.
- [DeepSeek-V3 Technical Report](https://arxiv.org/pdf/2412.19437): a good example of a large semi-open LLM training report, describing how they picked their sharding setup.
- [How to Optimize a CUDA Matmul](https://siboehm.com/articles/22/CUDA-MMM): a great blog describing how to implement an efficient matmul using CUDA Cores, with an eye towards cache coherence on GPU.
- [HuggingFace Ultra-Scale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook): a guide to LLM parallelism on GPUs, which partly inspired this chapter.
- [Making Deep Learning Go Brrrr From First Principles](https://horace.io/brrr_intro.html): a more GPU and PyTorch-focused tutorial on LLM rooflines and performance engineering.
- [Cornell Understanding GPU Architecture site](https://cvw.cac.cornell.edu/gpu-architecture): a similar guide to this book, comparing GPU and CPU internals more specifically.

Blackwell introduces a bunch of major networking changes, including NVLink 5 with twice the overall NVLink bandwidth (900GB/s). B200 still has 8-GPU nodes, just like H100s, but GB200 systems (which combine B200 GPUs with Grace CPUs) introduce much larger NVLink domain (72 GPUs in NVL72 and in theory up to 576). This bigger NVLink domain also effectively increases the node egress bandwidth, which reduces collective costs above the node level.

![](https://jax-ml.github.io/scaling-book/assets/gpu/b200-node.png)

Figure: a diagram showing how a GB200 NVL72 unit is constructed, with 18 switches and 72 GPUs.

Within a node, this increased bandwidth (from 450GB/s to 900GB/s) doesn’t make much of a difference because we also double the total FLOPs/s of each GPU. Our rooflines mostly stay the same, although because NVLink has much better bandwidth, Expert Parallelism becomes easier.

Beyond a node, things change more. Here’s a SuperPod diagram from [here](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html#compute-fabric-576).

![](https://jax-ml.github.io/scaling-book/assets/gpu/gb200-superpod.png)

Figure: a diagram showing a GB200 DGX SuperPod of 576 GPUs.

As you can see, the per-node egress bandwidth increases to `4 * 18 * 400 / 8 = 3.6TB/s`, up from 400GB/s in H100. This improves the effective cross-node rooflines by about 4x since our FLOPs/chip also double. Now we may start to worry about whether we’re bottlenecked at the node level rather than the scale-out level.

**Grace Hopper:** NVIDIA also sells GH200 and GB200 systems which pair some number of GPUs with a Grace CPU. For instance, a GH200 has 1 H200 and 1 Grace CPU, while a GB200 system has 2 B200s and 1 Grace CPU. An advantage of this system is that the CPU is connected to the GPUs using a full bandwidth NVLink connection (called NVLink C2C), so you have very high CPU to GPU bandwidth, useful for offloading parameters to host RAM. In other words, for any given GPU, the bandwidth to reach host memory is identical to reaching another GPU’s HBM.

Here’s a diagram of an NVLink 4 switch. There are 64 overall NVLink4 ports (each uses 2 physical lanes), and a large crossbar that handles inter-lane switching. TPUs by contrast use optical switches with mirrors that can be dynamically reconfigured.

![](https://jax-ml.github.io/scaling-book/assets/gpu/nvlink4.png)

Figure: a lower level view of a single NVLink4 Switch.

At each level we can be bottlenecked by the available link bandwidth or the total switch bandwidth.

- **Node level:** at the node level, we have 4 \* 1.6TB/s = 6.4TB/s of NVSwitch bandwidth, but each of our 8 GPUs can only egress 450GB/s into the switch, meaning we actually have a peak bandwidth of 450e9 \* 8 = 3.6TB/s (full-duplex) within the node.
- **SU/leaf level:** at the SU level, we have 8 switches connecting 32 nodes in an all-to-all fashion with 1x400 Gbps Infiniband. This gives us 8 \* 32 \* 400 / 8 = 12.8TB/s of egress bandwidth from the nodes, and we have 8 \* 1.6TB/s = 12.8TB/s at the switch level, so both agree precisely.
- **Spine level:** at the spine level, we have 16 switches connecting 32 leaf switches with 2x400 Gbps links, so we have 32 \* 16 \* 400 \* 2 / 8 = 51.2TB/s of egress bandwidth. The 16 switches give us 16 \* 1.6TB/s = 25.6TB/s of bandwidth, so this is the bottleneck at this level.

Per GPU, this gives us 450GB/s of GPU to GPU bandwidth at the node level, 50GB/s at the SU level, and 25 GB/s at the spine level.

**GPU empirical AR bandwidth:**

![](https://jax-ml.github.io/scaling-book/assets/gpu/gpu-all-reduce-bw.png)

Figure: AllReduce bandwidth on an 8xH100 cluster (intra-node, SHARP disabled).

TPU v5p bandwidth (1 axis):

![](https://jax-ml.github.io/scaling-book/assets/gpu/tpu-all-reduce-bw.png)

Figure: AllReduce bandwidth on a TPU v5p 4x4x4 cluster (along one axis).

Here’s AllGather bandwidth as well:

![](https://jax-ml.github.io/scaling-book/assets/gpu/gpu-all-gather-bw.png)

Figure: AllGather bandwidth on an 8xH100 cluster (intra-node).

![](https://jax-ml.github.io/scaling-book/assets/gpu/tpu-all-gather-bw.png)

Figure: AllGather bandwidth on a TPU v5e 8x16 cluster (along one axis).

**More on AllToAll costs:**

Here we can compare the approximation \\min(K / Z) \* (Z - 1) / Z to the true value of (1 - ((Z - 1) / Z) \*\* K) \* (Z - 1) / Z. They’re similar except for small values of Z.

![](https://jax-ml.github.io/scaling-book/assets/gpu/all-to-all-approx.png)

Figure: a comparison of the approximate and true cost of a ragged AllToAll as the number of shards increases.

### Footnotes

1. The GPU Tensor Core is the matrix multiplication sub-unit of the SM, while the TPU TensorCore is the umbrella unit that contains the MXU, VPU, and other components.
2. NVIDIA doesn't have a good name for this, so we use it only as the best of several bad options. The Warp Scheduler is primarily the unit that dispatches work to a set of CUDA cores, but we use it here to describe the control unit and the set of cores it controls.
3. Although SMs are independent, they are often forced to coordinate for peak performance because they all share a capacity-limited L2 cache.
4. Newer GPUs support FMA (Fused-Multiply Add) instructions which technically do two FLOPs each cycle, a fact NVIDIA uses ruthlessly to double their reported specs.
5. Historically, before the introduction of the Tensor Core, the CUDA cores were the main component of the GPU and were used for rendering, including ray-triangle intersections and shading. On today's gaming GPUs, they still do a bulk of the rendering work, while TensorCores are used for up-sampling (DLSS), which allows the GPU to render at a lower resolution (fewer pixels = less work) and upsample using ML.
6. NVIDIA doesn’t share many TC hardware details, so this is more a guess than definite fact – certainly, it doesn’t speak to how the TC is implemented. We know that a V100 can perform 256 FLOPs/TC/cycle. An A100 can do 512, H100 can do 1024, and while the B200 details aren’t published, it seems likely it’s about 2048 FLOPs/TC/cycle, since \`2250e12 / (148 \* 4 \* 1.86e9)\` is about 2048. Some more details are confirmed [here](https://forums.developer.nvidia.com/t/how-to-calculate-the-tensor-core-fp16-performance-of-h100/244727).
7. In Ampere, the Tensor Core could be fed from a single warp, while in Hopper it requires a full SM (warpgroup) and in Blackwell it’s fed from 2 SMs. The matmuls have also become so large in Blackwell that the arguments (specifically, the accumulator) no longer fit into register memory/SMEM, so Blackwell adds TMEM to account for this.
8. Warps scheduled on a given SM are called "resident".
9. Technically, the L2 cache is split in two, so half the SMs can access 25MB a piece on an H100. There is a link connecting the two halves, but at lower bandwidth.
10. The fact that the L2 cache is shared across all SMs effectively forces the programmer to run the SMs in a fairly coordinated way anyway, despite the fact that, in principle, they are independent units.
11. While NVIDIA made a B100 generation, they were only briefly sold and produced, allegedly due to design flaws that prevented them from running close to their claimed specifications. They struggled to achieve peak FLOPs without throttling due to heat and power concerns.
12. Before the deep learning boom, GPUs ("Graphics Processing Units") did, well, graphics – mostly for video games. Video games represent objects with millions of little triangles, and the game renders (or "rasterizes") these triangles into a 2D image that gets displayed on a screen 30-60 times a second (this frequency is called the framerate). Rasterization involves projecting these triangles into the coordinate frame of the camera and calculating which triangles overlap which pixels, billions of times a second. As you can imagine, this is very expensive, and it’s just the beginning. You then have to color each pixel by combining the colors of possibly several semi-opaque triangles that intersect the ray. GPUs were designed to do these operations extremely fast, with an eye towards versatility; you need to run many different GPU workloads (called "shaders") at the same time, with no single operation dominating. As a result, consumer graphics-focused GPUs can do matrix multiplication, but it’s not their primary function.
13. It’s notable that this intensity stays constant across recent GPU generations. For H100s it’s 33.5 / 3.5 and for B200 it’s 80 / 8. Why this is isn’t clear, but it’s an interesting observation.
14. The term node is overloaded and can mean two things: the NVLink domain, aka the set of GPUs fully connected over NVLink interconnects, or the set of GPUs connected to a single CPU host. Before B200, these were usually the same, but in GB200 NVL72, we have an NVLink domain with 72 GPUs but still only 8 GPUs connected to each host. We use the term node here to refer to the NVLink domain, but this is controversial.
15. NVLink has been described to me as something like a souped-up PCIe connection, with low latency and protocol overhead but not designed for scalability/fault tolerance, while InfiniBand is more like Ethernet, designed for larger lossy networks.
16. Full-duplex here means 25GB/s each way, with both directions independent of each other. You can send a total of 50GB/s over the link, but at most 25GB/s in each direction.
17. For instance, Meta trained LLaMA-3 on a datacenter network that differs significantly from this description, using Ethernet, a 3 layer switched fabric, and an oversubscribed switch at the top level.
18. You can also think of each GPU sending its chunk of size \\text{bytes} / N to each of the other N - 1 GPUs, for a total of (N - 1) \* N \* bytes / N bytes communicated, which gives us the same answer.
19. The true cost is actually 
	$$
	(1−(Z−1Z)K)⋅Z−1Z
	$$
	 the expected number of distinct outcomes in K dice rolls, but it is very close to the approximation given. See the Appendix for more details.