---
date: 2026-01-23T23:57:55+08:00
tags:
  - clippings
  - TPU
  - Architecture
  - TheScalingBook
publish: "true"
---
> 本文截取自 [互联网博客：The Scaling Book](https://jax-ml.github.io/scaling-book/tpus/ ) 并加入自己的翻译和理解。需要注意，目前翻译版本是适合我本人的阅读习惯和知识基础，如果读者有困惑，可以回到原文查看。

本节旨在深入剖析 TPU 的底层工作原理，探讨其如何通过网络互联实现大规模多芯片的训练与推理（Multi-chip Training and Inference），并进一步分析这种硬件架构如何影响主流深度学习算法的执行性能。此外，文中的技术逻辑对于 GPU 用户同样具有参考价值。关于 NVIDIA GPU 的详细对比，可参阅 [第 12 节](https://jax-ml.github.io/scaling-book/gpus)。

## 1. What Is a TPU?

**从体系结构角度看，TPU 的核心由专用于矩阵运算的计算核心（称为 TensorCore）以及紧耦合的高带宽存储堆栈（High-Bandwidth Memory, HBM）组成。** 下图展示了其基本逻辑构成：

![[How to Think About TPUs-tpu-chip.png]]

上图是 TPU 芯片的基础组件分布。左侧灰色区域为 TensorCore，其内部集成了矩阵乘法单元（Matrix Multiply Unit, MXU）、向量处理单元（Vector Processing Unit, VPU）以及向量存储器（Vector Memory, VMEM）。

TensorCore 本质上是一个针对矩阵运算高度优化的计算引擎，但除了核心的乘加运算外，其内部功能单元的设计也至关重要。TensorCore 主要由以下三个关键单元构成：
- **MXU（矩阵乘法单元）** 是 TensorCore 的计算重心。在多数 TPU 架构中，它利用**脉动阵列（Systolic Array）** 架构执行矩阵运算。具体而言，前代 TPU 通常每 8 个时钟周期完成一次 $128 \times 128$ 的矩阵乘法，而最新的 TPU v6e (Trillium) 已将规模扩展至 $256 \times 256$。
	- 以 TPU v5e 为例，在 $1.5 \text{GHz}$ 主频下，单 MXU 的 $bf16$ 算力约为 $5 \times 10^{13} \text{ FLOPs/s}$。由于单个 TensorCore 通常集成 2 到 4 个 MXU，TPU v5e 的 $bf16$ 峰值算力可达 $2 \times 10^{14} \text{ FLOPs/s}$。
	- 此外，TPU 还支持更低精度的计算，例如在 $int8$ 模式下，单片 TPU v5e 的吞吐量可翻倍至 $4 \times 10^{14} \text{ OPs/s}$。
- **VPU（向量处理单元）** 负责执行通用的算术运算，包括非线性激活函数（如 ReLU）、向量逐元素（Pointwise）加法及乘法。此外，跨通道的归约（Reduction）操作（如求和）同样在 VPU 中完成。
- **VMEM（向量存储器）** 是位于 TensorCore 内部、紧邻计算单元的片上**暂存存储器（Scratchpad Memory）**。尽管其容量远小于 HBM（如 TPU v5e 仅配置 $128 \text{ MiB}$），但其访存带宽极高。VMEM 的功能类似于 CPU 中的 L1/L2 高速缓存，但其显著区别在于容量更大且由软件显式控制（Programmer-controlled）。根据硬件执行逻辑，所有驻留在 HBM 中的数据必须先搬运至 VMEM，方可被计算单元调用。

**TPU 的设计架构极度向矩阵运算倾斜。** 作为目前性能最强的版本之一，TPU v5p 单核可提供 $2.5 \times 10^{14} \text{ bf16 FLOPs/s}$ 的算力，即单芯片（双核）算力达 $5 \times 10^{14} \text{ FLOPs/s}$。由 8960 颗芯片组成的单一集群（Pod）总算力可达 $4 \text{ Exaflops/s}$，跻身全球最强超级计算机之列。从算法复杂度角度看，矩阵乘法是极少数计算复杂度 $O(n^3)$ 高于访存复杂度 $O(n^2)$ 的算法之一。MXU 正是通过在计算单元间重用数据，极大缓解了传统 ALU 容易陷入的 I/O 瓶颈。

**HBM（高带宽存储器）** 作为大容量高速存储，负责存储待计算的张量数据。例如，TPU v5e 配备了 $16\text{ GiB}$ 的 HBM。

- **数据流向：** 计算开始前，张量数据从 HBM 流经 VMEM 进入 MXU；计算完成后，结果沿原路写回 HBM。
- **带宽限制：** HBM 与 TensorCore 间的交换速率即为“HBM 带宽”（通常在 $1\text{-}2 \text{ TB/s}$ 级），它是决定**访存受限型（Memory-bound）** 任务性能的核心指标。

**在底层执行机制中，TPU 的所有算子均采用流水线（Pipelined）与重叠（Overlapped）执行模式。** 以执行矩阵乘法 $X \cdot A \to Y$ 为例，TPU 的标准处理流如下：首先将权重矩阵 $A$ 与激活值矩阵 $X$ 以分块（Chunk/Tile）形式从 HBM 异步搬运至片上 VMEM；随后将其载入 MXU 单元，MXU 针对 $X$ 的 $8 \times 128$ 分块与 $A$ 的 $128 \times 128$ 分块执行乘加运算；最后将计算结果分块写回 HBM。为了实现最优吞吐量，系统通过流水线设计使 HBM 与 VMEM 间的数据读写与 MXU 的计算逻辑高度并行化。这种掩盖访存延迟（Latency Hiding）的策略确保了 MXU 能够保持极高的利用率，从而使矩阵乘法任务处于**计算受限** 状态而非被 I/O 拖累。

以下是从 HBM 执行逐元素积（Elementwise Product）的示例：

![[pointwise-product.gif]]

上图展示了 TPU 在处理此类任务时的数据流特征。关键点在于，数据是以流式（Streaming）分块形式从存储器中换出的，且中间结果（Partial Results）在生成后立即通过流水线写回，无需等待整个张量数组完成实例化（Materialization）[^2]。

矩阵乘法（Matmul）的执行逻辑与上述过程基本一致，核心差异在于数据被送入 MXU 而非 VPU，且由于单个权重分块（Weight Chunk）会被多个激活值分块复用，其数据的加载与存储顺序会有所调整。数据流的具体路径为：**HBM $\to$ VMEM $\to$ 向量寄存器 (VREGs) $\to$ 向量单元 (VPU) 或矩阵单元 (MXU) $\to$ VMEM $\to$ HBM**。若 HBM 到 VMEM 的数据搬运速率低于 VPU/MXU 的计算峰值吞吐量，系统将进入**访存带宽受限（Bandwidth-bound）** 状态，即计算单元因数据供应不足而处于空转饥饿状态。

**核心要点：** 从架构逻辑上看，TPU 的设计原则非常清晰。其核心逻辑是将权重从 HBM 加载至 VMEM，再由 VMEM 送入 MXU。该阵列具备每秒约 200 万亿次乘加运算（TFLOPS）的算力峰值。在这种设计下，**HBM $\leftrightarrow$ VMEM** 以及 **VMEM $\leftrightarrow$ MXU** 之间的互联带宽，决定了 TPU 在执行特定计算任务时的效率上限。

**VMEM 与算术强度的影响：** VMEM 虽然容量有限，但其至 MXU 的访存带宽远超 HBM（通常高出约 22 倍）。这意味着，如果算子能直接在 VMEM 中进行读写，仅需 $10\text{-}20$ 左右的算术强度即可达到 FLOPs 的峰值利用率。这意味着，如果我们能将模型权重（Weights）从 HBM 迁移至 VMEM 中存储，即使在 **Batch Size 较小**（通常会导致算术强度下降）的情况下，矩阵乘法依然能保持为**算力受限（FLOPs bound）** 状态而非访存受限。由此，那些本质上算术强度较低的算法也能在 TPU 上实现高效运行。

这种特性催生了 **VMEM 预取（Prefetching）** 优化技术：即在矩阵乘法启动前提前将权重加载至 VMEM，从而掩盖访存延迟。以标准的 Transformer 架构为例：在处理器执行 Attention 算子的计算任务时，系统可以同步将后续 FFN层的大规模权重加载进 VMEM。如果当前任务处于存储带宽受限状态，这种操作能有效隐藏权重加载的耗时。当然，这一策略的前提是权重必须经过足够的**分片（Sharding）** 或裁剪，以确保单层参数在预留出计算中间件空间后，仍能完整塞入 VMEM。

![[How to Think About TPUs-tpu-bandwidth.png]]
自 TPU v4 以来，单颗 TPU 芯片通常集成两个共享存储资源的 TPU 核心（即 **Megacore 配置**），在系统逻辑层面可视为具备双倍算力的单一加速器。然而这一设计并非绝对，例如针对推理性能优化的 TPU v5e 在单芯片上仅保留了单核设计。

![[How to Think About TPUs-cores.png]]

芯片以 4 颗为一组安装在**托盘（Tray）** 上，并通过 **PCIe 网络** 接入 CPU 宿主机。在 Cloud TPU 虚拟化环境下，每个托盘被映射至一个独立的虚拟机（VM），从而向用户暴露 4 个逻辑核心（或 8 个物理核心，取决于具体配置）。

对于推理芯片 TPUv5e，每个宿主机有 2 个 tray，不过每个芯片上只有 1 个核心，因此仍然是 8 个 chip、8 个 core。对于 Cloud TPU VM，用户可见的仍然是 4core。

![[How to Think About TPUs-pcie.png]]

**PCIe 带宽限制：** 与 HBM $\leftrightarrow$ VMEM 链路类似，CPU 与 HBM 之间的 PCIe 互联带宽是系统数据交换的关键瓶颈。以 TPU v4 为例，其双向 PCIe 带宽仅为 $16 \text{ GB/s}$，这比 HBM 的内部带宽慢了近两个数量级。虽然支持通过**卸载（Offloading）** 机制利用宿主机内存，但受限于 PCIe 的低吞吐量，此类数据交换操作应尽量规避，以防造成严重的计算停顿。

## 2. TPU Networking

**在单一 Pod 内部，芯片通过 ICI 网络实现相互连接。** 在早期架构（TPU v2 和 v3）、推理优化型芯片（如 TPU v5e）以及最新的 Trillium (TPU v6e) 中，**ICI（芯片间互连，Inter-Chip Interconnect）** 负责连接物理上最邻近的 4 个节点，并通过边缘链路闭环形成 **2D 环面（2D Torus）** 拓扑。相比之下，TPU v4 和 TPU v5p 则连接最邻近的 6 个节点，构建起 **3D 环面（3D Torus）** 拓扑。需要强调的是，这些连接采用的是 **Host Bypass** 的直连链路，数据交换不经过 CPU 宿主机，从而实现了极低的通信延迟。


![[How to Think About TPUs-ici-wraparound.png]]

环面（Toroidal）结构的设计优势在于，它将网络中任意两个节点间的最大距离（即网络直径）从 $N$ 降低至 $N / 2$，极大地提升了全量通信效率。此外，TPU 还引入了**扭曲环面（Twisted Torus）** 配置，通过类似莫比乌斯环（Mobius-strip）的拓扑折叠技术，进一步缩短了节点间的平均跳数（Average Hop Count）。

**由 ICI 互联的 TPU Pod 具备极高的扩展性：** TPU v4 的最大 Pod 规模（称为**超级集群 Superpod**）达到了 $16 \times 16 \times 16$ 节点，而 TPU v5p 则扩展至 $16 \times 20 \times 28$。这些大规模集群由 $4 \times 4 \times 4$ 芯片组成的**可重构立方体（Reconfigurable Cubes）** 构成，立方体之间通过**光环回链路（Optical Wraparound Links）** 互联。其核心组件是**光路交换机（Optical Circuit Switch, OCS）**，它提供与 ICI 相同的带宽，但允许系统动态重构链路连接方式，从而在保持环回特性的前提下，灵活构建极大规模的逻辑拓扑。

![[How to Think About TPUs-tpu-rack.png]]

用户也可以申请规模较小的拓扑（如 $2 \times 2 \times 1$ 或 $2 \times 2 \times 2$），但此类子切片通常**不具备环回链路**。这是一个关键的技术限制，因为**缺乏环回通常会导致多数集合通信原语的执行时间翻倍**。只有当拓扑规模达到完整立方体的倍数（如 $4 \times 4 \times 4$ 或 $4 \times 4 \times 8$）时，才能通过光路交换机获得环回链路。需要特别注意，类似 $2 \times 2 \times 4$ 的配置由于未构成完整立方体，依然无法获得光路交换机提供的环回支持。但在 TPU v5e 中，由于其未使用可重构光网络，一个 $8 \times 16$ 的配置在其长轴（16 维方向）上**确实**具备环回链路。

![[How to Think About TPUs-subslices.png]]

TPU v5e 与 Trillium 的 Pod 由单一的 $16 \times 16$ 2D 环面构成，且在任何长度为 16 的维度上都具备环回能力（例如 $8 \times 16$ 在长轴上拥有环回）。尽管 TPU v5e 和 v6e 的单一 ICI 域无法超越 $16 \times 16$ 的限制，但不同 Pod 之间仍可通过标准**数据中心网络（DCN）** 进行跨机架通信。同样地，若请求的维度小于 16，该维度将失去环回特性。

![[How to Think About TPUs-more-subslices.png]]

**邻居节点直连（Nearest-neighbor Connectivity）是 TPU 与 GPU 架构之间最显著的区别。** GPU 倾向于采用分层交换架构（如 Clos 网络），旨在模拟每颗 GPU 之间的点对点全互联，而非像 TPU 那样依赖局部连接。通常情况下，单节点内的 GPU（如 H100 的 8 卡或 B200 NVL72 的 72 卡）处于直连状态，但跨节点的更大拓扑则需要经过 $O(\log N)$ 跳的交换转发。这种设计的优势在于 GPU 可以在极少的跳数内发送任意点对点数据；而 TPU 的优势在于成本极低（因为昂贵的 NVLink 交换机造价不菲）、布线复杂度低，且由于每个设备的链路数和带宽是恒定的，它能更容易地扩展至极大规模的拓扑。

**尽管 ICI 的速率远超 DCN，但与 HBM 的本地带宽相比仍不在一个数量级。** 以 [TPU v5p](https://cloud.google.com/tpu/docs/v5p#system_architecture) 为例，其带宽层级如下：

- **HBM 带宽：** 单芯片高达 $2.8 \times 10^{12} \text{ bytes/s}$ ($2.8 \text{ TB/s}$)。
- **ICI 带宽：** 单芯片在每个轴向上提供 $9 \times 10^{10} \text{ bytes/s}$ ($90 \text{ GB/s}$) 的带宽，共 3 个轴向[^3]。
- **DCN 带宽：** 单 TPU 的出口（Egress）带宽仅为 $6.25 \times 10^9 \text{ bytes/s}$ ($6.25 \text{ GB/s}$)，通过宿主机的 1-2 个网卡（NIC）实现。TPU v6e 的 DCN 带宽是 $12.5\times10^{9}\text{ bytes/s}$ ，而 TPU v5e 则为 $3.125\times10^{9}\text{ bytes/s}$ 。

这意味着当我们将模型切分并分布到多颗芯片上时，必须极其谨慎，防止跨设备通信成为拖累 MXU 计算效率的瓶颈。

**多切片训练（Multi-slice Training）：** 一组通过 ICI 互联的 TPU 集合被称为一个**切片（Slice）**。不同切片之间可以通过 DCN 进行互联，从而跨越不同的 Pod。由于 DCN 的速率远低于 ICI，开发者应严格限制计算任务对 DCN 数据的依赖。此外，DCN 本质上是**主机到主机（Host-to-Host）** 的通信。若要通过 DCN 在 TPU 之间传输数据，必须经历极其繁琐的路径：首先通过 PCIe 将缓冲区数据从 TPU 搬运至宿主机，然后通过网络出口（Egress）发送，在目标宿主机入口（Ingress）接收后，再经由 PCIe 写回目标 TPU 的 HBM。

## 3. Key Takeaways

- TPU 的设计理念非常简洁。在大多数应用场景下，它可以被抽象为一个高性能矩阵乘法单元，并外接三层存储/通信层级：本地内存（极速）、通过 ICI 互连的其他芯片（高速），以及通过 DCN 互连的数据中心其余部分（较快）。
- 系统通信性能受限于各级网络带宽，按速率从高到低依次为：
	- **HBM 带宽：** 存在于 TensorCore 及其关联的 HBM 堆栈之间。
	- **ICI 带宽：** 存在于单颗 TPU 芯片与其最邻近的 4 个或 6 个邻居节点之间。
	- **PCIe 带宽：** 存在于 CPU 宿主机与其管理的单/多托盘（Tray）芯片之间。
	- **DCN 带宽：** 存在于多个 CPU 宿主机之间，通常用于连接那些未通过 ICI 直连的计算节点。
- **在单一切片（Slice）内部，TPU 仅通过 ICI 与最邻近节点相连。** 这意味着，若切片内两个距离较远的芯片需要通过 ICI 进行通信，数据必须先经过中间节点的逐跳（Hop）转发。
- **权重矩阵在两个维度上均需填充（Padding）至至少 128**（在 TPU v6 上为 256），方能填满 MXU 的计算单元。事实上，任何小于 128 的维度都会被强制填充至 128 这一对齐基准。
- **低精度矩阵乘法具备更高的执行效率。** 在支持相关指令的某些代际的芯片中，TPU 执行 $int8$ 或 $int4$ 运算的速率约为 $bfloat16$ 的 2 倍或 4 倍。需要注意的是，VPU（向量处理单元）的操作通常仍以 $fp32$ 精度执行。
- 为避免计算单元陷入 I/O 瓶颈，设计者必须**确保各级通道承载的通信量与其带宽速率成比例**，实现计算与访存的均衡匹配。

### TPU specs

以下是各型号 TPU 的核心性能参数汇总：

| Model | Pod size | Host size | HBM capacity/chip | HBM BW/chip (bytes/s) | FLOPs/s/chip (bf16) | FLOPs/s/chip (int8) |
| --- | --- | --- | --- | --- | --- | --- |
| TPU v3 | 32x32 | 4x2 | 32GB | 9.0e11 | 1.4e14 | 1.4e14 |
| TPU v4p | 16x16x16 | 2x2x1 | 32GB | 1.2e12 | 2.75e14 | 2.75e14 |
| TPU v5p | 16x20x28 | 2x2x1 | 96GB | 2.8e12 | 4.59e14 | 9.18e14 |
| TPU v5e | 16x16 | 4x2 | 16GB | 8.1e11 | 1.97e14 | 3.94e14 |
| TPU v6e | 16x16 | 4x2 | 32GB | 1.6e12 | 9.20e14 | 1.84e15 |

**主机拓扑 (Host size)** 定义了连接至单一 CPU 宿主机的 TPU 逻辑拓扑（例如，TPU v5e 的一台宿主机通过 $4 \times 2$ 拓扑管理 8 颗 TPU）。以下是各型号的互连带宽数据：

| Model | ICI BW/link (one-way, bytes/s) | ICI BW/link (bidi, bytes/s) |
| --- | --- | --- |
| **TPU v3** | 1e11 | 2e11 |
| **TPU v4p** | 4.5e10 | 9e10 |
| **TPU v5p** | 9e10 | 1.8e11 |
| **TPU v5e** | 4.5e10 | 9e10 |
| **TPU v6e** | 9e10 | 1.8e11 |

表中同时列出了**单向（Unidirectional）带宽**与**双向（Bidirectional）带宽**。单向带宽更符合硬件物理层的真实描述，但在涉及全环（Full Ring）通信的计算公式中，双向带宽更为常用。

- **双向带宽定义：** 指在单一链路上两个方向同时发送的总字节数；或者等效地理解为，在假设能够高效利用两条链路的前提下，单颗 TPU 沿特定轴向输出的总字节数。
- **适用条件：** 该数值仅在构建了有效的环形拓扑（即特定轴向上具备**环回连接 Wraparound**）时成立。对于推理型芯片，需达到 16 规模的轴向方可满足；对于训练型芯片（v\*p 系列），则需轴向规模为 4 的倍数。由于双向通信在计算中频繁出现，我们倾向于采用双向带宽进行性能建模。

此外，单颗 TPU 的典型 PCIe 带宽约为 $1.6 \times 10^{10} \text{ bytes/s}$（TPU v6e 提升至 $3.2 \times 10^{10} \text{ bytes/s}$）。而 DCN 出口带宽通常在 $6.25 \times 10^9 \text{ bytes/s}$ 左右（TPU v6e 为 $12.5 \times 10^9 \text{ bytes/s}$，TPU v5e 则为 $3.125 \times 10^9 \text{ bytes/s}$）。

## 4. Worked Problems

**Question 1 \[bounding LLM latency\]:** 假设你正在使用 32 颗 TPU v4p 执行一个 200B参数规模的模型的采样推理，模型权重采用 $bf16$ 精度。请计算将所有模型参数从 HBM 加载到 VMEM 中需要多长时间？_提示：请参考前文给出的硬件规格参数。

200B 参数在 $bf16$ 精度下占用空间为 $2 \text{ bytes} \times 200 \times 10^9 = 400 \times 10^9 \text{ bytes}$。将其分布在 32 颗芯片上，单芯片需负责加载 $12.5 \times 10^9 \text{ bytes}$ 的数据。已知 TPU v4p 的单片 HBM 带宽为 $1.23 \times 10^{12} \text{ bytes/s}$，则单次加载耗时约为 $10\text{ms}$。 **技术洞察：** 这不仅是一个简单的计算结果，它实际上构成了该模型采样推理**延迟的理论下界**。由于自回归采样（Sampling）的每一步都需要将全部权重从 HBM 重新读入计算单元，因此单步时延不可能低于 $10\text{ms}$。在小 Batch Size 的实际场景中，推理性能往往受限于访存（Memory-bound），该数值非常接近真实可达的最佳性能。

---

**Question 2 \[TPU details\]:** 以一个满配的 TPU v5e Pod 为例：其内部包含多少台 CPU 宿主机？多少个 TPU TensorCore？整个 Pod 的总算力（FLOPs/s）和总 HBM 容量分别是多少？请针对 TPU v5p Pod 重复上述计算。

Click here for the answer.

1. **TPU v5e Pod：**
	- **宿主机数量：** Pod 拓扑为 $16 \times 16 = 256$ 颗芯片，每台宿主机连接 $4 \times 2$ 切片（8 颗芯片），故宿主机总数为 $256 / 8 = 32$ 台。
	- **计算核心：** v5e 为单核设计，故共计 256 个 TensorCore。
	- **总算力：** $256 \times 2 \times 10^{14} = 5.1 \times 10^{16} \text{ bf16 FLOPs/s}$（即 $51 \text{ PFLOPS}$）。
	- **总容量：** $256 \times 16\text{GB} = 4\text{TB}$ HBM。

2. **TPU v5p Pod：**
    - **宿主机数量：** 芯片规模为 $16 \times 20 \times 28 = 8960$ 颗，宿主机连接 $2 \times 2 \times 1$ 切片（4 颗芯片），宿主机总数为 $8960 / 4 = 2,240$ 台。
    - **计算核心：** v5p 为双核设计，故 TensorCore 总数为 $8960 \times 2 = 17,920$ 个。
    - **总算力：** $8960 \times 4.5 \times 10^{14} = 4 \times 10^{18} \text{ bf16 FLOPs/s}$（即 $4 \text{ EFLOPS}$）。
    - **总容量：** $8960 \times 96\text{GB} = 860\text{TB}$ HBM。

---

**Question 3 \[PCIe operational intensity\]:** 假设我们被迫将巨大的权重矩阵 $A$（类型为 $\text{bfloat16}[D, F]$）和一批激活值 $x$（类型为 $\text{bfloat16}[B, D]$）存储在 CPU 宿主机的 DRAM 中，并尝试在与其连接的一颗 TPU v6e 芯片上执行矩阵乘法。已知条件为 $B \ll D$ 且 $F = 4D$（这种比例在 Transformer 的 MLP 层中非常常见）。为了确保在 PCIe 传输背景下依然保持为**计算受限（FLOPs bound）** 状态，所需的最小 Batch Size $B$ 是多少？假设 PCIe 带宽为 $1.5 \times 10^{10} \text{ bytes/s}$。

Click here for the answer.

1. **计算耗时：** 该矩阵乘法的总浮点运算量为 $2BDF$。由于 TPU v6e 的峰值算力为 $9.2 \times 10^{14} \text{ FLOPs/s}$，则计算部分耗时 $T_{comp} = \frac{2BDF}{9.2 \times 10^{14}}$ 秒。

2. **传输耗时：** 需从 DRAM 加载 $2DF$（权重）和 $2BD$（输入）字节，并写回 $2BF$（输出）字节。PCIe 传输耗时 $T_{comm} = \frac{2(BD + DF + BF)}{1.5 \times 10^{10}}$ 秒。

3. **性能受限判定：** 为使任务不被访存拖累，需满足 $T_{comp} > T_{comm}$。利用已知假设 $B \ll D$ 和 $F = 4D$ 进行化简：运算量简化为 $8BD^2$，传输量主要受权重支配，简化为 $8D^2$。代入不等式：
$$
\frac{8BD^2}{9.2 \times 10^{14}} > \frac{8D^2}{1.5 \times 10^{10}}
$$

解得：
$$
B > \frac{9.2 \times 10^{14}}{1.5 \times 10^{10}} \simeq 61,000
$$

由此可见，若通过 PCIe 跨设备访问数据，需要极大的 Batch Size 才能发挥出芯片的算力，这在实际推理中几乎难以通过单芯片实现。

---

**Question 4 \[general matmul latency\]:** 假设我们要执行一个权重矩阵为 $int8[16384, 4096]$、激活值矩阵为 $int8[B, 4096]$ 的乘法运算，其中 $B$ 为待确定的 Batch Size。以单颗 TPU v5e 芯片为例：

1. 请给出该乘法运算耗时随 $B$ 变化的函数关系。_提示：分别计算 HBM 访存耗时与实际计算耗时，并确定性能瓶颈。_
2. 如果我们将操作数据全部驻留在 VMEM 中执行，耗时函数会发生什么变化？

- **基于 HBM 的分析：**
    - **运算量：** $2 \times 4096 \times 16384 \times B = 1.3 \times 10^8 \cdot B$ 次操作。
    - **计算耗时 ($T_{math}$)：** 基于 TPU v5e 的 $int8$ 峰值算力 $3.94 \times 10^{14} \text{ OPs/s}$，得到 $T_{math} = (1.3 \times 10^8 \cdot B) / 3.94 \times 10^{14}$。
    - **访存耗时 ($T_{comms}$)：** 需从 HBM 加载 $6.7 \times 10^7$ 字节权重及 $4096B$ 字节输入，并写回 $16384B$ 字节结果。利用 HBM 带宽 $8.1 \times 10^{11} \text{ bytes/s}$，得到 $T_{comms} = (6.7 \times 10^7 + 2 \times 10^4 \cdot B) / 8.1 \times 10^{11}$。
    - **总耗时：** 取两者的最大值（假设流水线完美重叠）。通过计算可知，当 $B > 271$ 时，任务进入计算受限状态。
- **基于 VMEM 的分析：**
    - 若数据驻留在 VMEM，访存带宽将提升至 HBM 的 22 倍（即约 $1.78 \times 10^{13} \text{ bytes/s}$）。代入公式计算，临界点降至 $B > 11$。
    - **工程实际：** 在真实场景中，由于 VMEM 带宽需在加载权重、输入和写回结果间动态分配，无法全速服务于单一操作，实际的临界 Batch Size 通常在 20 左右。

---

**Question 5 \[ICI bandwidth\]:** 假设我们拥有一个 TPU v5e 的 $4 \times 4$ 切片（Slice）。现在的任务是将一个类型为 `bfloat16[8, 128, 8192]` 的张量从 $TPU\{0,0\}$ 发送到 $TPU\{3, 3\}$。已知 TPU v5e 的单跳延迟（Per-hop Latency）为 $1\mu s$。

1. 第一个字节到达目的地需要多长时间？
2. 完成整个张量传输总共耗时多久？

TPU v5e 采用 2D 互联拓扑。由于当前部署仅为 $4 \times 4$ 切片（各轴规模均未达到环回所需的 16 节点阈值），因此该切片不具备环回连接（Wraparound Connections）。这意味着目标芯片仅有两个接收端口，源芯片也仅有两个发送端口。

1. **数据量计算：** 待传输数据总量为 $2 \text{ bytes} \times 8 \times 128 \times 8192 \approx 1.7 \times 10^7$ 字节（约 $16.7\text{ MiB}$）。
2. **带宽利用：** 我们可以同时利用两个端口进行传输（例如将数组的一半向右发送，另一半向下发送），总带宽为 $2 \times 4.5 \times 10^{10} = 9 \times 10^{10} \text{ bytes/s}$。在带宽受限的情况下，纯传输耗时约为 $1.7 \times 10^7 / 9 \times 10^{10} = 188\mu s$。
3. **跳数与延迟：** 在没有环回链路的 $4 \times 4$ 拓扑中，从 $(0, 0)$ 到 $(3, 3)$ 需要经过 6 跳（水平 3 跳 + 垂直 3 跳）。由于单跳延迟约为 $1\mu s$，**首字节到达时间**约为 $6\mu s$。
4. **结论：** 整个传输过程是高度流水线化的，总耗时主要由带宽决定，约为 $188\mu s$。

---

**Question 6 \[pulling it all together, hard\]:** 场景构建：现有一个超大规模矩阵 $A$，规格为 `int8[128 * 1024, 128 * 1024]`，该矩阵被均匀分片存储在 TPU v5e $4 \times 4$ 切片各芯片对应的宿主机 DRAM 中（处于卸载 Offload 状态）。目标：将整个矩阵汇聚到 $TPU\{0, 0\}$，并与向量 `bf16[8, 128 * 1024]` 执行矩阵乘法。请计算完成这一系列操作所需的总时长。_提示：结合前文提到的所有硬件指标。_

首先明确任务规模：该 `int8` 矩阵大小约为 $16\text{ GB}$。根据硬件规格，TPU v5e 的每台宿主机管理一个 $4 \times 2$ 切片（8 颗芯片），因此 $4 \times 4$ 的部署包含 2 台宿主机。矩阵均匀分片意味着每台宿主机负担 $8\text{ GB}$。

汇聚路径存在两种技术方案：

- **方案 1：** 通过 DCN 网络汇总，再经由单一宿主机的 PCIe 链路载入 HBM。
- **方案 2：** 各芯片先通过各自的 PCIe 链路并行载入分片，再通过 ICI 网络执行聚合（Gather），最后在 $TPU\{0, 0\}$ 执行运算。

**策略选择：** 方案 2 明显更优。因为 ICI 的速率远高于 DCN，且并行利用 16 条 PCIe 链路加载数据，其吞吐量远超仅依赖单台宿主机的 PCIe 通道。

![[How to Think About TPUs-prob6.png]]
*每个芯片都有其独占的 PCIe 链路连接到对应 host，这里图示为了清晰而只花了一条链路。*

**详细步骤解析：**

1. **PCIe 加载耗时：** $16\text{ GB}$ 数据通过 16 条并行 PCIe 链路（每条 $1.5 \times 10^{10} \text{ bytes/s}$）加载。耗时 $T_{PCIe} \approx 16 \times 10^9 / (16 \times 1.5 \times 10^{10}) \approx 66\text{ms}$。

2. **ICI 聚合耗时：** 每颗芯片现持有 $1\text{ GB}$ 数据。$TPU\{0, 0\}$ 需要从其他芯片接收剩余的 $15\text{ GB}$。在 $4 \times 4$ 拓扑中，它只有 2 个活跃轴向，每个轴向的单向带宽为 $4.5 \times 10^{10} \text{ bytes/s}$。理论下界耗时为 $15 \times 10^9 / (4.5 \times 10^{10} \times 2) \approx 167\text{ms}$。考虑到数据负载分布不均（更远的芯片需要多跳传输），实际耗时可能接近该值的 2 倍。

3. **HBM 到 MXU 耗时：** 计算前需将 $16\text{ GB}$ 数据载入 MXU，基于 TPU v5e 的 HBM 带宽（$8.1 \times 10^{11} \text{ bytes/s}$），耗时约 $19\text{ms}$。

4. **计算（FLOPs）耗时：** 总运算量为 $2.7 \times 10^{11}$ 次操作，以 $1.97 \times 10^{14} \text{ FLOPs/s}$ 的速率执行，仅需 $1.3\text{ms}$。

**结论：** 尽管总耗时上限是上述时间的简单累加，但由于 TPU 具备极强的操作重叠（Overlapping）能力，该任务实质上是一个受限于最慢环节的流水线问题。由于 **ICI 聚合** 是最大的性能瓶颈，总耗时预计在 $167\text{ms} \sim 200\text{ms}$ 之间。

接下来的章节，我们将更深入地探讨 TPU 的底层指令执行与内部运作机制。除非另有说明，后续所有技术参数均以 TPU v5p 为准。

## APPENDIX

### A: More on TPU internals

#### VPU

**VPU（向量处理单元）** 是 TPU 的向量运算核心。其本质是一台二维 **SIMD（单指令多数据流）** 向量机，专门负责执行逐元素（Elementwise）算术操作，例如 `vadd`（向量加法）或 `vmax`（逐元素取最大值）。此外，VPU 还配有一组向量寄存器（**VREGs**），用于为 VPU 和 MXU 提供高速数据缓冲。

**VREGs（向量寄存器）：** 在 TPU v5p 中，每个核心配置了 64 个 32 位向量寄存器（TPU v4 为 32 个）。单核的 VREG 总容量约为 $64 \times 8 \times 128 \times 4 = 256 \text{ kB}$（由于单芯片为双核设计，整片容量需翻倍）。在访存带宽方面，TPU v5p 支持每个时钟周期从 VMEM 加载 3 个寄存器，并向 VMEM 写入 1 个寄存器。

**VPU 结构：** VPU 是一个形状为 $(8, 128)$ 的二维向量算术单元。其中，128 维被称为**通道轴（Lane axis）**，8 维被称为**子通道轴（Sublane axis）**。在 v5 架构中，每个（通道，子通道）对包含 4 个相互独立的标准浮点 ALU。VPU 的大多数算术指令（如 `vadd`）均可在各 ALU 中实现单周期吞吐，且指令延迟仅为 2 个周期。这意味着在 v5 中，每个周期可以从 VREGs 中并行完成 4 对 $f32$ 数值的加法运算。典型的 VPU 指令格式示例如下：`{v2 = vadd.8x128.f32 v0, v1}`，其中 $v0$ 和 $v1$ 为输入寄存器，$v2$ 为输出寄存器。

尽管所有通道和子通道在每一周期都以纯粹的 SIMD 方式执行相同的指令流，但**每个 ALU 可以执行不同的操作**。这种设计类似于指令级并行，例如我们可以在单个周期内同时处理一个向量加法（`vadd`）和一个向量减法（`vsub`），每个操作涉及两个完整的 VREG 输入并将结果写回第三个 VREG。

> [!question] Pop Quiz \[Calculating VPU throughput\]:
> 基于上述信息，请计算 TPU v5p 的向量运算峰值算力（FLOPs/s）。已知 TPU v5p 的主频约为 1.75GHz。
> 
> **答案**：每个时钟周期，每个核心可以在 $8 \times 128$ 个 ALU 上执行 4 条向量指令。对于双核整片而言，单周期算力为：
> 
> $$
> 8 \times 128 \times 4 \times 2 = 8192 \text{ FLOPs/cycle}
> $$
> 
> 结合 1.75GHz 的主频，总算力为：
> 
> $$
> 8192 \times 1.75 \times 10^9 = 1.43 \times 10^{13} \text{ FLOPs/s}
> $$
> 
> 可以注意到，VPU 的算力约比 MXU 的峰值算力（约 $2 \times 10^{14}$）小一个数量级，这体现了 TPU 优先向矩阵运算倾斜的硬件资源分配策略。

**归约操作（Reductions）：** 在 VPU 中，沿子通道维度的通信或归约比沿通道维度更为高效。例如，VPU 支持**通道内洗牌（Intra-lane Shuffle）** 操作，能够在约 1 个周期内完成沿 8 维轴向的数据滚动。通过该操作可以实现高效的子通道归约（仅需进行 4、2、1 跨度的洗牌并执行 3 对逐元素求和）。相比之下，跨通道归约的实现难度大得多，需要依赖专门的硬件单元——**XLU（跨通道单元，Cross Lane Unit）**，该单元的执行速度较慢且硬件成本较高。

> [!NOTE] 从 reduction 操作的具体步骤理解跨通道操作的困难
> 这里的 **reduction** 实质上是一种“把多变少”的操作族，而不是某一个固定算子。最常见的是求和（sum reduction），但在硬件与编译器语境里，它泛指所有**结合律成立**的聚合操作，比如 sum、max、min、and/or、甚至某些统计量的分步累积。核心语义只有一句话：**沿着某个维度，把一组元素折叠成一个或更少的元素**。
> 
> VPU 内部有 **lane** 和 **sublane** 这两层结构，可以把 lane 想成“更粗的并行切片”，而 sublane 是 lane 内部更细的一维向量轴。这里提到的“axis of size 8”，指的正是一个 lane 内部的 sublane 宽度是 8。
> 
> 为什么 reduction 会用到 shuffle？假设在一个 lane 里有 8 个数，要算它们的和。硬件并不会提供一个“8 输入加法器”直接吐出结果，而是用已有的**逐元素算术单元**配合**数据重排**来完成。shuffle 的作用就是：在不离开当前 lane、不访问存储的前提下，把向量里的元素重新对齐，让“本来不在一起的数”出现在同一个加法器的两个输入位置上。
> 
> 所以那句 “shuffle by 4, 2, and 1” 描述的是一个典型的 **tree reduction**：
> 
> - 先把第 i 个元素和第 i+4 个元素对齐，相加，得到 4 个部分和
> - 再 shuffle 2，把这 4 个结果两两相加
> - 再 shuffle 1，得到最终结果
> 
> 整个过程只用 lane 内的 shuffle 网络和普通向量加法器，不需要跨 lane 通信，也不需要访问 SRAM，因此快得接近一个流水线周期。这就是“沿 sublane 维度做 reduction 很容易”的物理原因：**数据就在本地，重排路径是硬连线的**。
> 
> ---
> 
> 接下来是关键对比：为什么 **cross-lane reduction** 会突然变得“又慢又贵”。
> 
> lane 之间，本质上已经是不同的执行切片。它们通常有：
> 
> - 各自独立的寄存器文件
> - 各自的算术流水线
> - 只在少数受控节点上互联
> 
> 也就是说，lane 之间**没有像 sublane 那样的全互连 shuffle 网络**。一旦你要把 lane A 的结果送到 lane B，就不再是“修改选择信号”的事情，而是要走一条真正的通信路径。这正是 XLU（cross-lane unit）存在的原因：它是一个专门为 lane 间交换、规约而设计的硬件单元。
> 
> 但这种单元为什么慢？原因不在于“不会做加法”，而在于**物理距离和仲裁复杂度**。XLU 通常需要：
> 
> - 从多个 lane 收集数据（fan-in）
> - 做跨 lane 的同步与仲裁
> - 再把结果广播或分发回去（fan-out）
> 
> 这在时序、功耗、面积上都比 lane 内 shuffle 贵得多，所以它的带宽低、延迟高，编译器也会尽量少用。
> 
> ---
> 
> 与 **bank conflict** 的关系：bank conflict 是一个**存储系统问题**：多个并行访问命中了同一个 SRAM bank，于是被串行化。
> 
> cross-lane reduction 的主要瓶颈并不直接来自 bank conflict，而是来自**执行单元之间缺乏廉价的全互连**。不过在实际实现中，这两者确实可能叠加：如果 cross-lane reduction 的中间结果需要经由某个共享 buffer 或 SRAM，那么 bank 冲突会进一步放大它的代价。但这不是根因，而是次生效应。
> 
> ---
> 
> 总结一下，用更“第一性原理”的语言说：
> 
> - reduction 是“沿某个并行维度做结合型聚合”的统称，sum 只是最常见的一种
> - shuffle 是 reduction 在 SIMD/向量硬件上的基本实现工具，用数据重排换取计算局部性
> - sublane reduction 快，是因为它完全发生在一个 lane 内，硬件为此预留了廉价、宽带的数据通路
> - cross-lane reduction 慢，是因为它跨越了执行切片的物理边界，只能走专用、稀缺的通信单元（XLU）
> - bank conflict 可能让事情更糟，但不是“跨 lane 难”的本质原因
> 
> 从编译器和系统的角度看，这也是为什么 TPU（以及 GPU）上的高性能程序，总是极力把 reduction 结构安排在“最内层、最局部”的并行维度里完成，把跨 lane / 跨 core 的规约压缩到最少。这不是风格问题，而是在向硅片的物理结构低头。

**与 GPU 的类比：** 对于熟悉 NVIDIA GPU 的读者，VPU 中的每个 ALU 都可以类比为一个 CUDA Core；而单个 VPU 通道则类似于一个“Warp 调度器”，即负责执行 SIMD 算术运算的一组 CUDA Core（通常为 32 个）。在通道内部执行归约相对简单，但一旦涉及跨通道通信，数据必须经过 VMEM、XLU 或 SMEM 转发，其延迟显著增加。

#### Scalar Core

**标量核心（Scalar Core）** 是 TPU 的指挥控制中心。其职能包括指令的取指（Fetch）与派发（Dispatch）、管理从 HBM 到 VMEM 的数据传输，并负责处理标量元数据逻辑。由于标量核心采用单线程设计，其直接限制是每个 TPU 核心在每周期仅能发起一个 **DMA（直接存储器访问）** 请求。

**底层逻辑：** 单个标量核心需要同时管控一个 VPU（内含 4096 个 ALU）、4 个 MXU、2 个 XLU 以及多个 DMA 引擎。这种极高的**指控比（Control-to-Compute Ratio）非对称性**是硬件效率极致化的源泉，但代价是极大地限制了处理器执行复杂数据依赖型向量化（Data Dependent Vectorization）的能力。

> [!NOTE] 理解 Scalar Core 的作用
> 在 TPU 的整体架构中，scalar core 并不是一个“计算核心”，而是一个被刻意极简化的控制单元。它承担的是整个 **TPU core 的控制面职责**，而非数据面计算。所有指令的取指与派发、HBM 到片上存储（VMEM）的数据搬运控制、以及少量标量级的元数据处理，统一都由 scalar core 顺序执行。这种设计从一开始就明确区分了“谁负责想”和“谁负责算”，并且把“想”的那一部分压缩到了极致。
> 
> 从直觉类比上看，scalar core 既不像 CPU 核心，也不像 GPU 的一个 SM。CPU 的核心价值在于强控制能力：乱序执行、复杂分支预测、多线程调度和对数据相关控制流的快速响应；GPU 的 SM 虽然强调吞吐，但依然有大量 warp 并行存在，使控制逻辑在一定程度上是分布式的。相比之下，TPU 的 **scalar core 更像是把 GPU SM 中“发指令、维护状态机”的那一小块逻辑抽离出来，单独做成一个严格单线程、顺序执行的控制处理器**。它并不试图高效执行复杂控制程序，而是被设计成一个节拍器，持续、稳定地驱动后端巨大的算力阵列。
> 
> 这种极端简化的直接结果，是 scalar core 成为了整个 TPU core 内部所有控制行为的唯一入口，包括 DMA 请求的发起。DMA 并不是一个“自动发生”的过程，而是一次明确的、由控制单元触发的事务。在 TPU 中，这个触发者只能是 scalar core。**由于 scalar core 是单线程、每个 cycle 最多发射一条控制指令的结构，于是自然导出一个硬约束：每个 TPU core 在一个 cycle 内，最多只能创建一个 DMA 请求**。这并不是 DMA 引擎本身的带宽限制，而是控制平面的发射能力上限。即便底层存在多个 DMA 引擎、可以流水化执行，一切请求的“点火”仍然必须经过 scalar core 这一个窄口。
> 
> 这种设计看似苛刻，但它换来的是极高的硬件效率。一个 scalar core 同时控制着一个 VPU（约 4096 个 ALU）、多个 MXU、XLU 以及若干 DMA 引擎。控制逻辑与计算逻辑之间呈现出高度不对称的比例关系：极少的控制硅片，驱动极其庞大的计算资源。面积、功耗和时序复杂度都因此得到显著优化，而代价被明确地转移到了“灵活性”这一维度上。
> 
> 这正是“limits the ability to do data dependent vectorization”的真正含义所在。所谓 data dependent vectorization，并不是简单的向量化，而是指**向量程序的执行结构在运行时依赖于数据本身**，例如根据中间结果决定下一步加载什么数据、执行多少次循环、是否切换不同的向量布局或计算路径。这类模式在 CPU 上是天然的，在 GPU 上也勉强可行，因为控制逻辑是并行存在的；但在 TPU 上，一旦控制决策变得细碎且频繁，所有这些判断都会集中压到 scalar core 这一条顺序执行的控制路径上，从而迅速成为全系统的瓶颈，让后端成千上万的算术单元空转等待。
> 
> 因此，TPU 的整体软件与编译模型，天然倾向于避免这种运行时的数据相关控制。它**鼓励在编译期就决定好张量形状、数据分块方式、通信与计算的排布，把控制流尽可能“抹平”为规则、静态、可预测的数据流**。scalar core 并不是“不会”处理复杂控制，而是用一种非常明确的方式告诉你：如果你把问题表述成静态的大规模数据并行，我可以把算力效率推到极限；如果你需要在运行时频繁思考和调整，那我不会为此付出昂贵的控制硬件成本。
> 
> 从这个角度看，scalar core 并不是 TPU 架构中的短板，而是一种非常诚实的设计选择。它用最小的控制复杂度，换取了对规则、密集、可提前编排的张量计算的极致执行效率。这种取舍，也正是 TPU 与 CPU/GPU 在设计哲学上最本质的分野之一。

### B: How does a systolic array work?

TPU 矩阵乘法单元（MXU）的底层核心由 $128 \times 128$ 规模的脉动阵列（Systolic Array）组成（在最新的 TPU v6e Trillium 中，该规模已扩展至 $256 \times 256$）。在流水线完全饱和的状态下，该阵列每 8 个时钟周期可完成一次算子交互，其数学表述为：

$$
\text{bfloat16}[8, 128] \times \text{bfloat16}[128, 128] \to \text{float32}[8, 128]
$$

即：一个 $8 \times 128$ 的 $bfloat16$ 精度激活值矩阵与一个 $128 \times 128$ 的 $bfloat16$ 权重矩阵相乘，计算结果以 $float32$ 精度存储于 $8 \times 128$ 的结果矩阵中。

- **物理组成：** 脉动阵列本质上是一个由 $128 \times 128$（共计 16,384 个）算术逻辑单元（ALU）构成的二维网格，每个 ALU 均具备执行乘累加（Multiply-Accumulate, MAC）操作的能力。
- **数据流向：** 权重矩阵（Weight, **$\mathbf{W}$**，即右操作数 RHS）从阵列顶部逐行向下渗透，而输入激活值（Input, **$\mathbf{X}$**，即左操作数 LHS）则从阵列左侧逐列向右推动。

下图展示了权重（蓝色）与激活值（绿色）进行乘法运算的简化动态逻辑。可以观察到，权重矩阵（RHS）首先以对角线偏移的方式预载入阵列，随后激活值矩阵也以对角线偏移方式输入。在每个时钟周期内，重叠的蓝色与绿色单元执行乘法运算，并将结果与上方传导下来的累加残差（Residual）求和，最后将更新后的结果向下传递给下一个 ALU 单元。
![[systolic-array.gif]]

以下是该过程的通用版本示意图，展示了计算结果是如何以流式（Streaming）方式从阵列底部输出的：

![[systolic-array2.gif]]

下图阐述了如何在多组 RHS 和 LHS 阵列间实现流水线化调度：

![[How to Think About TPUs-systolic-pipelining.png]]

在权重与激活值初始载入阶段，会产生一定的流水线空泡（Pipeline Bubble）；一旦流水线被填满，后续的输入数据和权重即可在不产生额外空泡的前提下连续加载，从而实现极高的算力利用率。

以下是一个 $bf16[2, 3] \times bf16[3, 3]$ 矩阵乘法的简易示意图（可视为 Batch Size 为 1 的计算任务）。尽管该图在视角上进行了旋转且数据流向右侧，但仍体现了脉动阵列的基本拓扑结构。

![[systolic-array-bad.gif]]

**优化建议：** 为了最小化流水线空泡对性能的影响，建议矩阵的维度应大于 MXU 的物理边界（通常为 $128 \times 128$）。由于自 TPU v3 起的型号通常集成多个 MXU（TPU v3 为 2 个，TPU v4/v5 为 4 个），在进行分块（Tiling）优化时，应确保分块维度大于 $128 \times \text{MXU 数量}$，以实现硬件资源的充分饱和。相关的动态演示可参考 [此视频](https://www.youtube.com/watch?v=sJltBQ4MOHA)。

最新一代 Trillium (TPU v6e) 采用了 $256 \times 256$ 规模的脉动阵列，这意味着其单周期浮点运算能力提升了 4 倍。相应地，开发者需要将张量维度扩大一倍，才能使 MXU 达到满载状态。关于固定权重矩阵下脉动阵列乘法逻辑的更多细节，推荐阅读[此博客](https://fleetwood.dev/posts/domain-specific-architectures#google-tpu)中的高质量交互式演示。

# Footnotes

[^2]: 这里的 materialization，指的是矩阵真实、完整地在 VMEM 中存储下来，占用缓存空间。
[^3]: 官方文档页面标注的带宽为 $100 \text{ GB/s}$，与本文列出的数值略有出入。实际上，根据所执行的**通信操作类型**（如 All-Reduce 与 All-to-All 的实现机制差异），TPU ICI 链路会表现出略微不同的有效带宽。在大多数体系结构分析场景下，你可以放心引用本文档提供的数值。