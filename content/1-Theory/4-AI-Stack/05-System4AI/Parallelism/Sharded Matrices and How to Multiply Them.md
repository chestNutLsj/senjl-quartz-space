---
title: "Sharded Matrices and How to Multiply Them | How To Scale Your Model"
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
date: "2026-01-24T16:44:06+08:00"
description: "When we train large ML models, we have to split (or “shard”) their parameters or inputs across many accelerators. Since LLMs are mostly made up of matrix multiplications, understanding this boils down to understanding how to multiply matrices when they're split across devices. We develop a simple theory of sharded matrix multiplication based on the cost of TPU communication primitives."
tags:
  - "clippings"
---
> 本文截取自 [互联网博客：The Scaling Book](https://jax-ml.github.io/scaling-book/sharding/ ) 并加入自己的翻译和理解。需要注意，目前翻译版本是适合我本人的阅读习惯和知识基础，如果读者有困惑，可以回到原文查看。本文截取自互联网博客并做一定修改： 

在训练大规模机器学习模型时，由于单卡计算资源的局限，我们必须将模型的参数或输入数据拆分（即“分片”，Sharding）到多个加速器节点上。鉴于大语言模型（LLM）的底层算子主要由矩阵乘法（Matrix Multiplication）构成，分布式训练的核心挑战便在于如何实现跨设备的分片矩阵并行计算。本文基于 TPU 通信原语（Communication Primitives）的成本开销，构建了一套简明的分片矩阵乘法理论。

## 1. Partitioning Notation and Collective Operations

在万卡级（TPU 或 GPU）集群上训练 LLM 时，其抽象逻辑层面的计算过程与单卡训练并无本质区别。主要的工程限制在于：**张量规模超出了单个加速器的HBM容量上限**，因此必须进行分片。此外，并行化不仅是为了解决容量问题，更是为了提升计算吞吐量。即使较少数量的芯片能够容纳模型，通过扩展（Scaling）到更多节点，我们可以获得更高的每秒浮点运算数（FLOPs/s）。例如在推理阶段，虽然小规模拓扑可能放下模型，但为了降低响应延迟，我们往往选择更大的集群规模；同理，训练阶段通过增加芯片数量来缩短单步迭代时间（Step Time）。这种将数组分布到不同设备的操作被称为“分片（Sharding）”或“分区（Partitioning）”。分布式扩展的关键在于设计合理的分片策略，以确保在算子切分后仍能保持高效的计算效率。

以下是一个将二维数组 $\mathbf{A}$ 分片到 4 个 TPU 节点的示例：

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-example.png)

上图是将形状为 $[I,J]$ 的矩阵 $\mathbf{A}$ 分片到 4 个设备上的例子。在 $X$ 和 $Y$ 两个维度上都均匀分片给 2 个设备，分片方式记为 $[I_X,J_Y]$ 。每个 TPU 持有总内存的 1/4.

需要注意的是，分片后的数组在逻辑上依然维持原有的“全局形状（Global/Logical Shape）”（例如 `(4, 128)`），但在物理层面上，每个设备仅持有“本地形状（Device Local Shape）”（例如 `(2, 64)`）。本地形状决定了每个 TPU 实际占用的显存字节数（在上图中，每个 TPU 承载了总数据的 $1/4$）。接下来，我们将这一概念推广至任意维度的数组。

### A unified notation for sharding

我们采用一种“命名轴表示法（Named-axis notation）”的变体来描述张量在设备间的块状分片逻辑：首先定义一个二维或三维的设备网格（Device Mesh），并为网格的每个轴分配名称（如 **X, Y, Z**）。接着，通过描述数组的各个命名维度如何映射到这些物理网格轴上，来定义矩阵数据在集群中的布局方式。这种映射关系被正式定义为“分片（Sharding）”。

**示例（基于上图）**：
- **设备网格（Mesh）**：定义为 `Mesh(devices=((0, 1), (2, 3)), axis_names=(‘X', ‘Y'))`。这表示 4 个 TPU 构成了一个 $2 \times 2$ 的物理网格，其轴名称分别为 X 和 Y。
- **分片配置（Sharding）**：表示为 $A[I_X, J_Y]$。这指定了将数组的第一个维度 $I$ 沿网格轴 $X$ 进行切分，将第二个维度 $J$ 沿网格轴 $Y$ 进行切分。在该配置下，每个物理分片仅占用原始数组总大小的 $1 / (|X| \cdot |Y|)$。

综合上述定义，该数组的 local shape 为 $(\frac{|I|}{2}, \frac{|J|}{2})$。其中，$|I|$ 和 $|J|$ 分别代表数组 **A** 的 global shape 的第 1、2 维度。

> [!question] Pop Quiz \[2D sharding across 1 axis\]
> **Quiz**：假设有一个 $\rm fp32[1024, 4096]$ 的数组，分片策略为 $A[I_{XY}, J]$，设备网格配置为 `{'X': 8, 'Y': 2}`。请问每个设备承载的数据量是多少？在 H100 GPU 上（假设单卡 HBM 带宽为 $3.4 \times 10^{12}$ Bytes/s），从显存读取该数组需要多长时间？
> 
> **解答**：$A[I_{XY}, J]$ 表示将逻辑维 $I$ 同时沿着硬件轴 $X$ 和 $Y$ 进行复合切分。在此配置下，本地形状的计算公式为 $(|I| / (|X| \cdot |Y|), |J|)$。代入数值，全局形状为 $\rm fp32[1024, 4096]$，计算得出本地形状为 $\rm fp32[64, 4096]$。
> 
> 由于每个分片占用 $4 \times 64 \times 4096 = 1\text{MiB}$ 内存空间，理论读取时间约为 $1 \times 10^6 / 3.4 \times 10^{12} = 294\text{ns}$。但在实际场景中，由于数据量极小，受限于启动开销（Overhead）和其他系统延迟，实际耗时会显著高于此理论值。

**分片可视化**：为了更直观地理解，我们观察一个在 4 个设备上进行不同切分的二维数组：

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-colored1.png)

对于“完全全量副本（Fully-replicated）”形式，我们简单地记为 $A[I, J]$，不添加任何分片下标。这意味着集群中的每个加速器节点都拥有该矩阵的完整副本。

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-colored2.png)

我们可以通过下标来指定某个逻辑维度在特定的网格轴上进行分区。例如，$A[I_X, J]$ 表示逻辑轴 **I** 已沿网格维度 **X** 进行切分，而 **J** 轴未被切分。这意味着数据块在 **Y** 网格轴上呈现“部分副本（Partially-replicated）”状态。

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-colored3.png)

$A[I_X, J_Y]$ 则表示逻辑轴 **I** 沿网格轴 **X** 切分，同时逻辑轴 **J** 沿网格轴 **Y** 切分，实现了完整的二维分片。

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-colored4.png)

下图展示了其他可能的分片组合形式：

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-colored5.png)

在此示例中，$A[I_{XY}, J]$ 意味着我们将 **X** 和 **Y** 两个网格轴视为一个打平（Flattened）后的连续维度，并将逻辑轴 **I** 分布在所有可用设备上。多重下标的排列顺序至关重要，因为它决定了在设备网格中进行分区映射时的遍历顺序（Traversal Order）。

![](https://jax-ml.github.io/scaling-book/assets/img/sharding-colored6.png)

最后需要注意，禁止将多个逻辑轴分片到同一个网格维度上。例如，$A[I_X, J_X]$ 是一个无效的异常配置。一旦某个网格维度被用于数组的一个维度分片，该维度的物理资源已被占用，不可重复分配。

**Pop Quiz:** 假设数组 **A** 的形状为 `int8[128, 2048]`，采用 $A[I_{XY}, J]$ 分片策略，物理网格配置为 `Mesh({'X': 2, 'Y': 8, 'Z': 2})`（共 32 个设备）。请问每个设备占用多少显存？该数组在所有设备上总共占用了多少内存？

**Answer:** 数组 **A** 沿 X 和 Y 轴进行分片，并在 Z 轴上进行副本复制。因此，单设备的本地形状为 `int8[128 / (2 * 8), 2048]`，即 `int8[8, 2048]`，对应数据量为 $16,384$ 字节。由于 Z 轴存在冗余副本（即在每个 Z 平面内完成了 X/Y 轴的完整分片），整个集群实际上维护了 2 份完整的原始数组。因此，总内存占用量为：原始尺寸 $\times$ Z轴副本数 = $128 \times 2048 \times 2 = 512\text{KiB}$。另一种验证方式是：32 个设备 $\times$ 每设备 $16,384$ 字节 = $512\text{KiB}$。

### How do we describe this in code?

在前文中，我们主要探讨了分片理论，现在是时候初步探讨其代码实现方案了。JAX 框架引入了一套“命名分片（Named Sharding）”语法，它与上文提到的抽象数学表示高度对齐。虽然我们会在 [Section 10](https://jax-ml.github.io/scaling-book/jax-stuff) 详细讨论相关细节，但在此可以先进行简要预览。你可以通过 Google Colab 运行这段代码 [here](https://colab.research.google.com/drive/15cxw66eABwZPG-V4QFmbLfiykPFf_gaP?usp=sharing)，并通过Profiler观察 JAX 在处理不同分片策略时的底层实现。这段代码主要完成了以下三个步骤：

1. **构建设备网格（jax.Mesh）**：将 8 个物理 TPU 核心映射为一个 $4 \times 2$ 的逻辑网格，并将这两个轴分别命名为 ‘X’ 和 ‘Y’。
2. **定义张量分片**：创建矩阵 **A** 和 **B**，其中 **A** 在两个维度上均进行分片（二维并行），而 **B** 仅在输出维度上进行分片。
3. **算子编译与执行**：通过 XLA 编译器对简单的矩阵乘法算子进行即时编译（JIT），并返回一个分片后的结果数组。

```python
import jax
import jax.numpy as jnp

# Create our mesh! We're running on a TPU v2-8 4x2 slice with names 'X' and 'Y'.
# 初始化设备网格：使用 TPU v2-8 的 8 个核心，构建 4x2 拓扑，并指定轴名称为 'X' 和 'Y'。
assert len(jax.devices()) == 8
mesh = jax.make_mesh(axis_shapes=(4, 2), axis_names=('X', 'Y'))

# A little utility function to help define our sharding. A PartitionSpec is our
# sharding (a mapping from axes to names).
# 辅助函数：PartitionSpec 用于定义逻辑轴到物理网格轴的映射关系。
def P(*args):
    return jax.NamedSharding(mesh, jax.sharding.PartitionSpec(*args))

# We shard both A and B over the non-contracting dimension and A over the contracting dim.
# 定义分片：A 在收缩维（Contracting Dim）和非收缩维上均分片，B 仅在非收缩维分片。
A = jnp.zeros((8, 2048), dtype=jnp.bfloat16, device=P('X', 'Y'))
B = jnp.zeros((2048, 8192), dtype=jnp.bfloat16, device=P(None, 'Y'))

# We can perform a matmul on these sharded arrays! out_shardings tells us how we want
# the output to be sharded. JAX/XLA handles the rest of the sharding for us.
# 执行分片矩阵乘法：使用 einsum 定义算子，out_shardings 指定结果的期望分片布局。
# JAX/XLA 编译器会自动推导中间状态并注入必要的集合通信。
y = jax.jit(lambda A, B: jnp.einsum('BD,DF->BF', A, B), out_shardings=P('X', 'Y'))(A, B)
```

JAX 的核心优势在于其**单程序多数据（SPMD）** 的编程抽象：这些分片数组在开发者视角下表现得如同单机上的非分片数组（Unsharded Array）。
- 通过 `B.shape` 访问的是该张量的“全局逻辑形状”（Global/Logical Shape），即 $(2048, 8192)$。若需查看物理上的本地分片数据，则需要访问 `B.addressable_shards`。
- 在执行运算时，JAX/XLA 会自动计算各设备间的数据依赖关系，并按需执行Broadcast或Reshape操作。例如在上述示例中，矩阵 **A** 的本地物理形状为 $[2, 1024]$，矩阵 **B** 为 $[2048, 4096]$。
- 为了完成全局一致的矩阵乘法，JAX/XLA 编译器会自动在底层注入必要的集合通信原语（如 All-Reduce 或 All-Gather）。

## 2. Computation With Sharded Arrays

当数据数组分布在多个设备上时，对其执行数学运算会带来怎样的开销？这种开销主要源于数据与计算任务的分片。

显而易见，开销的大小取决于算子的类型：

- **逐元素算子 (Elementwise Operations)**：由于计算过程不涉及跨位置的数据依赖（如加法、激活函数等），在分布式数组上执行此类操作**不存在通信开销**。
- **跨设备算子**：当运算需要访问驻留在不同设备上的元素时，情况会变得复杂。幸运的是，在机器学习任务中，绝大部分计算都以矩阵乘法（Matrix Multiplication）的形式呈现，而矩阵乘法的通信模式相对固定，易于进行量化分析。

本节余下部分将重点讨论分片矩阵乘法的实现。从初步近似的角度来看，这涉及到在网络中移动矩阵块，以便每个计算节点能够完整地执行乘法或加法操作。**不同的分片方案（Sharding Schemes）会触发不同的通信模式。** 例如，计算 $A[I_X, J] \cdot B[J, K_Y] \to C[I_X, K_Y]$ 时，由于**收缩维 (Contracting Dimension)**（即参与求和归约的 $J$ 维度）未被分片，计算可以直接在本地完成，无需任何通信。然而，如果我们要求输出结果为非分片状态（即 $C[I, K]$），则必须将 $A$、$B$ 或 $C$ 的分片通过 **AllGather** 原语同步到所有设备。不同的同步路径对应不同的通信代价，我们需要通过成本模型评估并选择最优路径。

我们可以从“分块矩阵乘法（Block Matrix Multiplication）”的角度来审视这一过程。理解这一点的关键在于回顾分块矩阵（嵌套矩阵）的概念：
$$
\begin{pmatrix} a_{00} & a_{01} & a_{02} & a_{03} \\ a_{10} & a_{11} & a_{12} & a_{13} \\ a_{20} & a_{21} & a_{22} & a_{23} \\ a_{30} & a_{31} & a_{32} & a_{33} \end{pmatrix} = \begin{pmatrix} \begin{bmatrix} a_{00} & a_{01} \\ a_{10} & a_{11} \end{bmatrix} & \begin{bmatrix} a_{02} & a_{03} \\ a_{12} & a_{13} \end{bmatrix} \\ \begin{bmatrix} a_{20} & a_{21} \\ a_{30} & a_{31} \end{bmatrix} & \begin{bmatrix} a_{22} & a_{23} \\ a_{32} & a_{33} \end{bmatrix} \end{pmatrix} = \begin{pmatrix} A_{00} & A_{01} \\ A_{10} & A_{11} \end{pmatrix}
$$

矩阵乘法具有优良的代数性质：当乘数以分块形式表示时，其乘积依然遵循标准的矩阵乘法规则，通过对子块进行乘加运算得到：
$$
\begin{pmatrix} A_{00} & A_{01} \\ A_{10} & A_{11} \end{pmatrix} \cdot \begin{pmatrix} B_{00} & B_{01} \\ B_{10} & B_{11} \end{pmatrix} = \begin{pmatrix} A_{00}B_{00} + A_{01}B_{10} & A_{00}B_{01} + A_{01}B_{11} \\ A_{10}B_{00} + A_{11}B_{10} & A_{10}B_{01} + A_{11}B_{11} \end{pmatrix}
$$

这意味着，分布式矩阵乘法的底层实现机制可以归结为：在网络上交换这些分片块，在各设备上执行**本地矩阵乘法 (Local Matmul)**，最后对结果进行归约求和。**工程上的核心议题在于：应该引入哪种通信原语，以及该原语产生的带宽成本是多少。**

为了简化分析，我们可以将所有可能的分片布局归纳为 4 种典型场景，每种场景都对应特定的通信规则：

1. [[#Case 1 neither multiplicand has a sharded contracting dimension|场景 1]]： 两个输入矩阵均未在收缩维上进行分片。此时，各设备可以直接对本地分片进行乘法运算，**无需任何通信**。
2. [[#Case 2 one multiplicand has a sharded contracting dimension|场景 2]]：仅有一个输入矩阵在收缩维上进行了分片。在这种情况下，我们通常需要沿收缩维对该矩阵执行 **AllGather** 操作，以补全计算所需的局部数据。
3. [[#Case 3 both multiplicands have sharded contracting dimensions|场景 3]]：两个输入矩阵均在收缩维上进行了分片。此时，各设备先完成本地子块的乘法，随后通过 **AllReduce** 原语对全局结果进行累加同步。
4. [[#Case 4 both multiplicands have a non-contracting dimension sharded along the same axis|场景 4]]：两个输入矩阵的非收缩维（即各自的并行维）映射到了同一个物理网格轴上。此时会产生冲突，必须先通过 **AllGather** 显式同步其中一个输入矩阵，方可继续计算。

你可以将这些视为必须遵循的工程准则，但深入理解这些规则背后的数学逻辑及其性能代价同样至关重要。接下来，我们将逐一详细剖析这些场景。

### Case 1: neither multiplicand has a sharded contracting dimension

**引理**：在执行分片矩阵乘法时，只要**收缩维 (Contracting Dimension)** 未被切分，且两个矩阵未被分片到同一个物理网格轴上，则计算逻辑是天然有效的，且输出张量的布局将直接继承输入张量的分片策略。

例如，以下算子：
$$
A[I_X, J] \cdot B[J, K_Y] \to C[I_X, K_Y]
$$

该过程**完全不涉及跨节点通信**。最终生成的张量 $C$ 会同时沿硬件网格的 $X$ 轴和 $Y$ 轴进行分片，从而实现高效的二维并行布局。

Try to think about why this is. Basically, the computation is *independent* of the sharding, since each batch entry has some local chunk of the axis being contracted that it can multiply and reduce. Any of these cases work fine and follow this rule:

究其原因，是因为这种配置下的计算逻辑与分片策略是**相互独立**的。**由于收缩维 $J$ 在每个设备上都是完整的（即未被切分），每个设备都持有执行点积运算所需的全部局部数据**。这意味着每个计算单元可以直接在本地完成乘法与累加归约。以下几种常见的切分配置均符合此规则，能够实现无通信开销的并行计算：

- **全量副本模式**：$A[I, J] \cdot B[J, K] \to C[I, K]$
- **行并行模式**：$A[I_X, J] \cdot B[J, K] \to C[I_X, K]$
- **列并行模式**：$A[I, J] \cdot B[J, K_Y] \to C[I, K_Y]$
- **混合并行模式**：$A[I_X, J] \cdot B[J, K_Y] \to C[I_X, K_Y]$

由于矩阵 **A** 和 **B** 在收缩维 $J$ 上均保持连续（即每个分片都拥有 $J$ 维的完整深度），分布式算子可以简化为各节点上独立的**本地块矩阵乘法 (Local Block Matmul)**。计算完成后，所得结果的分布状态天然符合预期的输出分片布局。需要注意的是，如果两个乘数的非收缩维映射到了同一个物理网格轴上，该结论将不再成立，因为这会导致硬件资源的调度冲突（详见后文关于 [[#Case 4 both multiplicands have a non-contracting dimension sharded along the same axis|冲突分片]] 的章节）。

### Case 2: one multiplicand has a sharded contracting dimension

考虑这样一种情况：输入矩阵 **A** 沿着参与运算的收缩维 $J$ 进行了分片，而矩阵 **B** 在各设备上持有完整副本。其算子表示为：
$$
A[I, J_X] \cdot B[J, K] \to C[I, K]
$$

此时，我们无法直接在本地执行分块乘法，因为矩阵乘法的定义要求对完整的 $J$ 维进行加权求和（Contraction），而 **A** 的 $J$ 轴数据目前被打散在物理网格 $X$ 轴的各个节点上。为了解决这一数据缺失问题，通用的做法是首先对 **A** 执行 **AllGather** 操作，使每个设备都获取到 $J$ 轴的完整数据副本，随后再与 **B** 进行本地运算：

1. **通信阶段**：通过 $\text{AllGather}_X$ 原语将分片后的 $A[I, J_X]$ 还原为全局张量 $A[I, J]$。
2. **计算阶段**：执行标准的本地矩阵乘法 $A[I, J] \cdot B[J, K]$。

通过这种方式，每个加速器都能在本地独立完成其负责的计算份额。

**核心结论**：当矩阵乘法中某个操作数的收缩维被切分时，通常需要先执行 AllGather 操作以消除该维度的分片状态，从而将分布式计算转化为本地算子执行。

值得注意的优化点是：如果 **B** 同样未在 X 轴上分片，我们也可以选择先计算本地的“部分和（Partial Sum）”，随后再通过 **AllReduce** 对这些中间结果进行累加。在特定算力与带宽配比下，这种方案可能具备更高的执行效率。

---

**什么是 AllGather？** AllGather 是我们将讨论的首个核心 [[MPI-Learning#MPI scatter, gather, allgather|MPI]] (消息传递接口) 通信原语。其功能是**消除特定轴上的分片状态**，将散布在各设备上的数据分片重新组装，并同步至该通信域内的每一个设备。在我们的命名轴表示法中，AllGather 相当于“移除下标”的操作，例如：
$$
\text{AllGather}_{XY}(A[I_{XY}, J]) \to A[I, J]
$$

这种操作具有灵活性：我们可以仅针对部分轴进行收集（如 $A[I_{XY}, J] \to A[I_Y, J]$ 仅消除了 $X$ 轴的分片）。此外，AllGather 也常用于消除**非收缩维**的分片。例如在 $A[I_X, J] \cdot B[J, K] \to C[I, K]$ 任务中，我们既可以在计算前对 **A** 进行 AllGather ，也可以在计算后对结果 **C** 进行 AllGather ，具体取决于哪种路径的通信成本更低。

**AllGather 的底层实现机制是什么？** 在单轴 TPU 网格（环形拓扑）中执行一维 AllGather 时，基本逻辑是每个 TPU 将其持有的分片沿环路传递，直到所有设备都集齐了全部数据副本。GPU 的 AllGather 实现（如 NCCL 库中的 Ring 算法）亦是如此：在节点内的 GPU 间构建逻辑环路，并按序传递数据块。
![](https://jax-ml.github.io/scaling-book/assets/img/all-gather.gif)

上图动画展示了如何在一组 8 个TPU/GPU 设备上执行 AllGather 操作的过程。每个设备在开始前都只有总数据的 1/8，而结束后拥有全部的数据（副本）。

AllGather 可以采用单向或双向环路通信。在单向模式下，每个节点发送大小为 $V/N$ 的数据块，共需经过 $N-1$ 跳。在双向模式下（如上图所示），步数减少至 $\lfloor N/2 \rfloor$ 步，但每步发送的数据量翻倍为 $2 \cdot V / N$。

**耗时模型分析**：以双向 AllGather 为例。设 $V$ 为数组总字节数，$|X|$ 为分片数量。根据拓扑结构，每一跳在每个方向上发送 $V/|X|$ 字节，则单跳耗时为：

$$
T_{hop} = \frac{2 \cdot V}{|X| \cdot W_{ici}}
$$

其中 $W_{ici}$ 为**双向**芯片间互连带宽。分子中的系数 2 是因为我们同时利用了两个方向的带宽。为了覆盖网格中的所有节点，理论上需要进行 $\lfloor \frac{|X|}{2}\rfloor$ 跳，因此总通信时间为：
$$
T_{total} = \frac{V}{W_{ici}}
$$

令人惊讶的是，**总耗时与分片数量 $|X|$ 无关！** 这意味着即便 TPU 之间仅存在局部物理连接，连接的局域性并不会限制扩展性。在理想状态下，系统的瓶颈仅取决于单条链路的绝对带宽。

**核心结论**：在**吞吐受限 (Throughput-bound)** 的工作负载下，执行 AllGather（或 ReduceScatter、AllReduce）的通信时间仅取决于数据总量和链路带宽，而与参与计算的设备数量无关。

**关于 ICI 延迟的说明**：无论数据量大小，跨越 ICI 链路的每一跳都会产生约 $1\mu s$ 的固有延迟开销。当数组规模极小时，单跳的数据传输时间可能低于延迟开销，系统会进入**延迟受限 (Latency-bound)** 模式。在此模式下，耗时将与节点数 $|X|$ 呈正相关。

> [!NOTE]
> 记一跳的最小固有延迟为 $T_{min}$ ，那么：
> $$
> T_{hop} = \max \left[ T_{min}, \frac{2 \cdot V}{|X| \cdot W_{ici}} \right]$$
> 
> $$
> T_{total} = \max \left[ T_{min} \cdot \frac{|X|}{2}, \frac{V}{W_{ici}} \right]$$
> 对于大规模的归约或收集操作，由于数据吞吐量极大，单跳延迟可以忽略不计，系统处于带宽受限状态。但在处理小规模张量（如 LLM 推理中的采样阶段）时，延迟则成为主导因素。以 TPU v5e 为例，其单向带宽为 $45\text{GB/s}$，如果待传输的缓冲区小于 $45\text{kB}$，则计算将受限于物理延迟，而非链路带宽。
> since we perform $|X| / 2$ hops. For large reductions or gathers, we’re solidly bandwidth bound. We’re sending so much data that the overhead of each hop is essentially negligible. But for small arrays (e.g. when sampling from a model), this isn’t negligible, and the ICI bandwidth isn’t relevant. We’re bound purely by latency. Another way to put this is that given a particular TPU, e.g. TPU v5e with $4.5 \times 10^{10}$ unidirectional ICI bandwidth, sending any buffer under $4.5 \times 10^{10} \times 10^{-6} = 45\text{kB}$ will be latency bound.

---

以下是对 TPU v5e 集群（8x16 切片）中 AllGather 带宽的实测数据。数组沿 16 轴进行分片，形成了一个完整的双向环路。

![](https://jax-ml.github.io/scaling-book/assets/img/all-gather-bandwidth.png)
上图是 AllGather 执行中 TPU v5e 的实测带宽与预估带宽曲线。橙色曲线是每秒 AllGather 操作实际传输的数据量，而蓝色曲线则是根据已知的集合通信操作成本计算出的单向链路带宽。Figure: empirical bandwidth and estimated link bandwidth for TPU v5e during an AllGather. BW in orange is the actual bytes per second AllGathered, while the blue curve shows the empirical unidirectional link bandwidth calculated according to the known cost of the collective.

实测显示，该系统不仅能达到理论峰值带宽（$45\text{GB/s}$）的 95% 左右，且在数据量达到 10MB 时即可进入带宽受限的峰值状态。这意味着在 16 路分片下，每个设备仅需承载 $10,000\text{KB}/16=625\text{kB}$ 即可跑满带宽。作为对比，这种低饱和阈值的特性显著优于同代 GPU 方案。
Note that we not only achieve about 95% of the peak claimed bandwidth (`4.5e10`) but also that we achieve this peak at about 10MB, which when 16-way sharded gives us about 625kB per device (*aside*: this is much better than GPUs).

---

**跨多轴的 AllGather 如何计算？** 当我们在多个物理轴上同时执行 AllGather 时，可以利用多维 ICI 并行传输。例如，$\text{AllGather}_{XY}$ 可以同时在 X 和 Y 轴上运作，这使得有效带宽提升了 $N_{axes}$ 倍。综合延迟因素，通用的耗时公式为：
$$
T_{total} = \max \left[ T_{min} \cdot \sum_i \frac{|X_i|}{2}, \frac{V}{W_{ici} \cdot N_{axes}} \right]
$$

其中 $\sum_i |X_i|/2$ 代表 TPU 物理网格中的“直径”（即最长通信路径）。

**Pop Quiz 2 \[AllGather time\]:** 根据 [[How to Think About TPUs#TPU specs|前文]] 数据，在 `{'X': 8, 'Y': 4}` 的 TPUv5e 二维网格上执行 $\text{AllGather}_Y([E_Y, F]) \to [E, F]$，若采用 `bfloat16` 格式，当 (a) $E=2048, F=8192$ 以及 (b) $E=256, F=256$ 时，分别需要多长时间？

**Answer:** 首先明确基础参数：

1. TPU v5e 每个轴的单向 ICI 带宽为 $4.5 \times 10^{10}$ Bytes/s。
2. 对于情况 (a)，单设备持有的分片形状为 `bfloat16[512, 8192]`，大小为 $8.4\text{MB}$。全局数组总大小为 $34\text{MB}$。

**针对 (a) 的计算**：使用带宽受限公式，单轴 AllGather 耗时 $T = 34\text{MB} / 90\text{GB/s} = 377\mu s$（双向带宽为 $45\text{GB/s} \times 2$）。由于 4 节点轴的最长路径仅有 $3\mu s$ 左右的 hop latency，延迟可忽略。但需注意硬件细节：TPU v5e 仅在轴长度为 16 时才支持闭环绕回（Wraparound）。在 4 节点轴上无法实现全双向环形 AllGather ，数据必须从一端传至另一端。因此理论耗时应修正为 $3 \times 8.4\text{MB} / 45\text{GB/s} = 560\mu s$。 [实际 Profile](https://imgur.com/a/RkvpRGQ) 性能剖析显示为 $680\mu s$，考虑到非理想带宽利用率，这与预期高度吻合。
 
**针对 (b) 的计算**：每个分片仅为 $64\times256\times2=32\text{kB}$。其传输耗时 $0.7\mu s$ 低于固有延迟，因此判定为延迟受限。经过 3 跳的耗时约为 $3 \times 1\mu s = 3\mu s$。 [实际观测值](https://imgur.com/a/HZLQmYs)约为 $8\mu s$，这包含了额外的系统调用和协议栈开销。

> **备注**：逻辑网格轴（如 `X: 16, Y: 4`）并不一定严格对应单一物理轴。在复杂的 3D Torus 拓扑中，我们可以将多个物理维度的能力映射到同一个逻辑轴上，这为后续实现多维数据并行（Data Parallelism）提供了极大的灵活性。

### Case 3: both multiplicands have sharded contracting dimensions

第三种基础场景是：两个乘数的收缩维（Contracting Dimension）均沿着同一个网格轴（例如 $X$ 轴）进行了分片。其算子表达式如下：
$$
A[I, J_X] \cdot B[J_X, K] \to C[I, K]
$$

在这种配置下，各设备持有相同范围的收缩维索引，因此**本地块矩阵乘法（Local Block Matmul）** 在逻辑上是可行且可立即执行的。然而，由于每个节点只参与了部分 $J$ 轴数据的累加，计算得出的乘积仅代表最终结果的一个**部分和**。为了精确描述这种“计算已执行但结果未就绪”的中间状态，我们引入了特殊的符号表示：
$$
A[I, J_X] \cdot_{LOCAL} B[J_X, K] \to C[I, K]\{ U_X\}
$$

其中，标记 **$\{ U_X \}$** 读作“**沿 X 轴未归约（Unreduced）**”（**unreduced** along X mesh axis）。它揭示了该算子在分布式环境下处于一种“非完备”状态，必须经过最终的全局求和归约才能得到正确结果。符号 $\cdot_{LOCAL}$ 则显式声明了这仅是一次本地求和操作。

从数学本质上看，这可以转化为矩阵乘法与外积（Outer Product，符号为 $\otimes$）的关系描述：
$$
A \cdot B = \sum_{i=1}^{P} \underbrace{A_{:,i} \otimes B_{i,:}}_{\in\mathbb{R}^{n\times m}}
$$

假设在网格轴 $X$ 上的第 $i$ 个 TPU 持有矩阵 **A** 的第 $i$ 列分块以及矩阵 **B** 的第 $i$ 行分块，它可以独立计算出外积结果 $A_{:,i} \otimes B_{i,:} \in \mathbb{R}^{n \times m}$。该本地矩阵的每个元素实际上贡献了最终乘积 $A \cdot B$ 对应位置上的第 $i$ 个累加项。为了获得完整的乘积结果，我们必须对分布在物理网格 $X$ 轴上的所有分片（从 1 到 P）执行跨节点的求和。无论是按元素（Element-wise）还是按分块（Block-wise）进行切分，这一归约逻辑均适用。

为了修正这种局部性带来的不完整，我们需要在 $X$ 轴上触发 **AllReduce** 通信：

1. **计算**：生成带未归约标记的结果 $A[I, J_X] \cdot_{LOCAL} B[J_X, K] \to C[I, K]\{ U_X\}$。
2. **归约**：通过 $\text{AllReduce}_X$ 消除 partial sum，使轴上的**每个**设备最终都持有一致且完整的全局累加值 $\text{AllReduce}_X(C[I, K]\{ U_X\}) \to C[I, K]$ 。

AllReduce 是分布式训练中的第二个核心集合通信原语。它的输入是一个带有“未归约轴”标记的数组，通过在通信域内交换并累加数据块，最终输出一个消除该标记的全局一致张量。其函数签名如下：
$$
\text{AllReduce}_Y(A[I_X, J]\{ U_Y\}) \to A[I_X, J]
$$

从逻辑表示上看，AllReduce 的作用仅是剥离 $\{ U_Y \}$ 后缀，不改变张量的逻辑形状。

---

**AllReduce 的通信成本如何计算？** 一个直观的思维模型是：每个设备将其分片发送给邻居，并对接收到的分片进行累加。显然，AllReduce 的开销高于 AllGather，因为每个参与交换的“分片”在归约后都需要恢复到全局尺寸。通常情况下，**AllReduce 的成本是 AllGather 的两倍。**

我们可以将 AllReduce 拆解为两个更基础的原语：**ReduceScatter** 和 **AllGather** 的组合。

1. **ReduceScatter**：负责解决 partial sum 问题，但其输出结果会根据给定的维度进行重新分布（即对 output 进行了 scatter）。
2. **AllGather**：随后负责收集这些已归约的分片，恢复逻辑轴的完整性。

其流水线逻辑如下：
$$
\begin{align}
&\mathbf{Step 1.}\quad\text{ReduceScatter}_{Y, J}(A[I_X, J]\{ U_Y\}) \to A[I_X, J_Y]\\
&\mathbf{Step2.}\quad\text{AllGather}_Y(A[I_X, J_Y]) \to A[I_X, J]
\end{align}
$$

**关于 ReduceScatter 的定义**：正如 AllGather 用于补全分片数据，ReduceScatter 则用于对“未归约（$U_X$）”数组进行求和，并紧接着将结果沿指定的逻辑轴散播（分片）到各节点上（例如 $X[F]\{ U_Y\} \to X[F_Y]$）。

下面动画演示了 ReduceScatter 的执行过程。可以发现，它的通信逻辑与 AllGather 极其相似，区别在于节点在接收到数据后不是单纯保留，而是执行 reduction 操作。因此，其网络通信延迟与 AllGather 基本一致（忽略 ALU 执行 reduction 运算的微小开销）。
![](https://jax-ml.github.io/scaling-book/assets/img/reduce-scatter.gif)

在具备完整环形拓扑（Full Ring）的条件下，每一跳的通信时间依然是分片字节数 $V/|Y|$ 除以链路带宽 $W_{ici}$。由此我们可以得出带宽受限下的成本模型：

- **AllGather / ReduceScatter 耗时**：$\frac{V}{W_{ici}}$
- **AllReduce 耗时**：$\frac{2 \cdot V}{W_{ici}}$

其中 $W_{ici}$ 依然代表系统的双向互连带宽。

### Case 4: both multiplicands have a non-contracting dimension sharded along the same axis

在张量分片规则中，每个物理网格的维度（Mesh Dimension）在同一个张量的分片表示中最多只能出现一次。如果直接套用前述规则，有时会导致违反这一约束的情况，例如：
$$
A[I_X, J] \cdot B[J, K_X] \to C[I_X, K_X]
$$

这种分片方式在逻辑上是**无效 (Invalid)** 的。原因在于：对于物理网格轴 $X$ 上的任意一个分片（设为第 $i$ 个分片），它将同时持有输出矩阵 **C** 的第 $i$ 行和第 $i$ 列，即仅能计算出 **C** 的对角线块（Diagonal Entry）。在这种情况下，整个集群持有的信息不足以恢复出结果矩阵中除对角线以外的其他元素。因此，底层编译器（如 XLA）严禁此类分片策略。

解决此类冲突的方法是通过 **AllGather** 显式消除其中一个维度的分片状态。我们通常有两种路径选择：

1. **路径一**：对 **A** 执行 AllGather ，将其还原为非分片状态，再进行运算。
    - 通信：$\text{AllGather}_X(A[I_X, J]) \to A[I, J]$
    - 计算：$A[I, J] \cdot B[J, K_X] \to C[I, K_X]$
2. **路径二**：对 **B** 执行 AllGather ，将其还原为非分片状态。
    - 通信：$\text{AllGather}_X(B[J, K_X]) \to B[J, K]$
    - 计算：$A[I_X, J] \cdot B[J, K] \to C[I_X, K]$

无论选择哪条路径，最终输出结果的维度表示中 $X$ 轴都只会对应一个逻辑维度，从而满足分片约束。具体选择哪种方案，通常取决于下游算子对结果张量分片布局的进一步需求。

## 3. A Deeper Dive into TPU Communication Primitives

在前述四种场景中，我们引入了用于执行分片矩阵乘法的几种核心集合通信原语：

1. **AllGather**：消除分片下标，将各设备上的分片汇聚为完整张量。
2. **ReduceScatter**：通过沿特定轴对分片进行求和，消除“未归约（Un-reduced）”后缀，并将结果沿另一个轴进行重新分片。
3. **AllReduce**：消除“未归约”后缀，使轴上所有设备最终持有相同的全局求和结果，且该轴不再处于分片状态。

除了上述原语外，在混合专家模型（MoE）及其他复杂分布式计算中，还存在另一个至关重要的核心通信原语：**AllToAll (全对全传输)**。

### Our final communication primitive: the AllToAll

最后一个基础集合通信算子是 **AllToAll**。虽然它在常规的分片矩阵乘法中并不自然出现，但在工程实践中却极其频繁。更准确地说，它通常对应于**分片转置 (Sharded Transposition)** 或重分片（Resharding）操作。例如：
$$\text{AllToAll}_{X, J}(A[I_X, J]) \to A[I, J_X]$$

AllToAll 通常**用于在分布式计算的不同阶段之间重新排列数据布局**，特别是当两个连续算子的分片模式不兼容时。在分片 MoE 时，这种操作是必不可少的。_你可以将 AllToAll 理解为将分片下标从一个逻辑轴转移到另一个轴的过程_。

由于 AllToAll 不需要像 AllGather 那样在环路中对每个分片进行全量复制，其通信开销实际上更低（仅为 AllGather 的 $1/4$）。对于偶数规模的双向环形拓扑，每个设备向右发送的块数为 $(N/2 + (N/2-1) + \dots + 1)$，向左发送的块数为 $((N/2-1) + \dots + 1)$，总计发送 $N^2/4$ 个块。由于每个块（即“分片的子分片”）的大小为 $V / N^2$ 字节，因此单设备的成本为 $(V / N^2) \cdot (N^2 / 4) = V / 4$。随着设备数量增加，总带宽随之扩展，这一单机成本保持稳定。

![](https://jax-ml.github.io/scaling-book/assets/img/all-to-all.gif)

如果推广到多维（ND）AllToAll，在 $A \times B \times C \dots$ 网格上处理 $V$ 字节数组的总成本公式为：
$$
T_{comms\_per\_\text{AllToAll}} = \frac{V \cdot \max(A, B, C, \dots)}{4 \cdot N \cdot W_{ici}}
$$

其中 $W_{ici}$ 依然代表双向 ICI 带宽。在一维网格中，该公式简化为 $V / (4 \cdot W_{ici})$，即 AllGather 成本的四分之一。在二维网格下，由于可以利用多轴并行传输，成本会随最小轴尺寸的增加而进一步降低。

> 补充说明：如果你需要一个直观的推导过程，可以从一维环形拓扑（Torus）$\mathbb{Z} / N\mathbb{Z}$ 入手。如果随机选择起始节点和目标节点，它们之间的平均距离是 $N / 4$ 跳，由此产生的成本为 $(V \cdot N) / (4 \cdot N)$。在多维环形拓扑中，每个轴基本是独立的。每个节点持有 $1/N$ 的数据，且平均需要经过 $\max(A, B, C, \dots) / 4$ 跳完成数据交换。

### More about the ReduceScatter

ReduceScatter 的重要性比初看之下更为深远，因为它在数学上是 AllGather 的**伴随算子（即导数映射）**，反之亦然。具体而言，如果在前向传播中我们执行了：
$$
\text{AllGather}_X(A[I_X]) \to A[I]
$$

那么在反向传播中，我们需要对梯度 **A’**（每个分片上的梯度通常不同）执行 ReduceScatter，以得到分片后的梯度 **A’**：
$$
\text{ReduceScatter}_X(A'[I]\{ U_X\}) \to A'[I_X]
$$

同理，若前向传播执行 $\text{ReduceScatter}_X(A[I]\{ U_X\}) \to A[I_X]$，则反向传播必然对应 $\text{AllGather}_X(A'[I_X]) \to A'[I]$。


这种对偶关系源于**广播（Broadcast）** 与**归约（Reduction）** 作为线性算子时互为转置。而 AllGather 和 ReduceScatter 则是广播与归约算子分别与单位矩阵的张量积（即 [克罗内克积，Kronecker Product](https://en.wikipedia.org/wiki/Kronecker_product)。 具体来说，设向量 $x \in \mathbb{R}^n$，设备数为 $p\in \mathbb{N}$，令 $u = (1, \dots, 1) \in \mathbb{R}^p$，则广播与归约算子定义如下：
$$
\begin{align}
\text{broadcast}&: \mathbb{R}^n \to \mathbb{R}^{pn}, \quad \text{broadcast} = u \otimes I_{n}\\
\text{reduce}&: \mathbb{R}^{pn} \to \mathbb{R}^n, \quad \text{reduce} = u^T \otimes I_n
\end{align}
$$


以 $n=1, p=2$ 为例：若 $x=(7)$，则 $\text{broadcast}(x) = \left( \begin{pmatrix} 1 \\ 1 \end{pmatrix} \otimes (1) \right) x = \begin{pmatrix} 1 \\ 1 \end{pmatrix} x = \begin{pmatrix} 7 \\ 7 \end{pmatrix} \in \mathbb{R}^{pn}$，这符合将向量广播至更高维度的直觉。若 $y=(8, 9)$，则 $\text{reduce}(y) = \left( \begin{pmatrix} 1 \\ 1 \end{pmatrix}^T \otimes (1) \right) y = (1 \quad 1) \begin{pmatrix} 8 \\ 9 \end{pmatrix} = (17)$，符合求和归约的定义——将 $\mathbb{R}^{pn}$ 维的向量 reduce 到 $\mathbb{R}^{n}$ 维。 由于矩阵性质 $(A \otimes B)^T = A^T \otimes B^T$，可以推导出 $\text{reduce} = \text{broadcast}^T$。进而，AllGather 和 ReduceScatter 可以表示为以下张量积形式：
$$
\begin{align}
\text{AllGather}&: \mathbb{R}^{pn} \to \mathbb{R}^{p^2 n}, \quad \text{AllGather} = \text{broadcast} \otimes I_p\\

\text{ReduceScatter}&: \mathbb{R}^{p^2 n} \to \mathbb{R}^{pn}, \quad \text{ReduceScatter} = \text{reduce} \otimes I_p
\end{align}
$$

我们将 $\mathbb{R}^{p^2 n}$ 视为 $\mathbb{R}^{p \times p n}$，即每个设备持有一个长度为 $pn$ 的向量。通过转置性质，我们可以证明 $\text{AllGather}^T = \text{ReduceScatter}$。这种转置关系在反向传播（Backpropagation）中具有至关重要的工程意义。假设我们有一个线性算子 $A$（例如 AllGather 或 ReduceScatter），其前向映射为 $y = Ax$。根据链式法则，在反向传播过程中，如果我们已知损失函数 $L$ 对输出 $y$ 的偏导数 $\frac{\partial L}{\partial y}$（即上游梯度），那么损失函数对输入 $x$ 的偏导数 $\frac{\partial L}{\partial x}$ 遵循以下公式：
$$
\frac{\partial L}{\partial x} = A^T \frac{\partial L}{\partial y}
$$
由于 $A^T$ 正是该算子的转置，这数学化地证明了：**AllGather 的梯度算子正是 ReduceScatter，反之亦然**。在编写分布式算子的反向传播逻辑时，我们无需重新推导梯度公式，只需直接调用其对称的通信原语即可。

将 AllReduce 拆解为 ReduceScatter 和 AllGather 还带来了一个工程上的便利：我们可以**推迟（Defer）** 最终的 AllGather 操作。在许多高性能计算场景下，我们并不希望立即付出将矩阵乘积汇聚为全量副本的通信成本，而是希望保持分片状态，即使是在处理 Case 3（两个操作数都在收缩维分片）的情况下：
$$
A[I, J_X] \cdot B[J_X, K] \to C[I, K_X]
$$

此时，我们可以执行 ReduceScatter 而非 AllReduce，在后续合适的时间再 AllGather。这种方案的优势在于 ReduceScatter 会**引入**一个新的分片维度。由于本地求和后的结果维度包括 $I$ 和 $K$，我们可以自由选择沿 $I$ 轴或 $K$ 轴进行分片。尽管这种选择通常由后续算子的模型上下文决定，但它赋予了编译器优化通信路径的灵活性。因此，我们使用 **ReduceScatter $_{X, K}$** 这一语法来明确指定分片目标轴。

### How to overlap matmul communication with compute

正如我们在 [[All About Rooflines#1. Where Does the Time Go?|Section 1]] 中所讨论的，如果通信速度足够快，通常假设可以通过某些有意义的计算来掩盖（Overlap）通信开销。本节提到的集合通信算子通常可以与矩阵乘法（Matmul）本身的计算逻辑并行执行，但实现这一机制并非易事。业界通用的算法被称为**集合矩阵乘法（Collective Matmul）**，最早由 [Wang 等人](https://dl.acm.org/doi/pdf/10.1145/3567955.3567959)提出。以下是该重叠机制实现逻辑的简化动画演示：

![](https://jax-ml.github.io/scaling-book/assets/img/ag_matmul.gif)

上述动画演示了单次分片的矩阵-向量乘积如何与随后的 AllReduce 操作实现重叠（即前文提到的场景 3）。一个完整的矩阵乘法算子可以看作由多次这类矩阵-向量乘积组合而成。

简单来说，当系统正在为矩阵的当前 chunk 执行乘法运算时，可以同步启动针对前一分块的 Ring Reduction 通信。在特定场景下，我们还可以针对 Batch 维度或矩阵输入维度进行Tiling 优化。我们在 [第 10 部分](https://jax-ml.github.io/scaling-book/jax-stuff)中提供了一个简单的 JAX 实现参考，同时 [Mosaic 文档](https://docs.jax.dev/en/latest/pallas/gpu/collective_matmul.html)也给出了针对 GPU 的优秀示例。建议开发者尝试自行实现该算法以加深理解。

## 4. What Have We Learned?

- The sharding of an array is specified by a **Mesh** that names the physical, hardware axes of our TPU mesh and a **Sharding** that assigns mesh axis names to the logical axes of the array.
	- For example, **A** \[I <sub>XY</sub>, J\] describes an abstract array **A** with its first dimension sharded along two mesh axes X and Y. Combined with Mesh(mesh\_shape=(4, 8), axis\_names=(‘X’, ‘Y’)) or the abbreviated Mesh({‘X’: 4, ‘Y’: 8}), this tells us our array is sharded 32 ways along the first dimension.
- **Arithmetic with sharded arrays works exactly like with unsharded arrays unless you perform a contraction along a sharded axis**. In that case, we have to introduce some communication. We consider four cases:
	1. *Neither array is sharded along the contracting dimension*: no communication is needed.
	2. *One array is sharded along the contracting dimension* (or the contracting dimensions are sharded along different axes): we AllGather one of the inputs before performing the operation.
	3. *Both arrays are identically sharded along the contracting dimension:* we multiply the shards locally then perform an AllReduce or ReduceScatter.
	4. *Both arrays are sharded along the same mesh axis along a non-contracting dimension:* we AllGather one of the inputs first.
- TPUs use roughly **4 core communication primitives**:
	1. AllGather: \[A\_X, B\] \\to \[A, B\]
	2. ReduceScatter: \[A, B\] \\{U\_X\\} \\to \[A\_X, B\]
	3. AllToAll: \[A, B\_X\] \\to \[A\_X, B\]
	4. AllReduce: \[A\_X, B\]\\{U\_Y\\} \\to \[A\_X, B\] (technically not a primitive since it combines a ReduceScatter + AllGather)
![](https://jax-ml.github.io/scaling-book/assets/img/all-collectives.png)

- The cost and latency of each of these operations **doesn’t depend on the size of the axis (as long as they’re bandwidth bound)**, but only on the size of the input arrays and the bandwidth of the link. For a unidirectional AllGather/ReduceScatter:
$$
Tcomm per AllGather or ReduceScatter=Data volumebandwidth⋅Axis−1Axis⟶Data volumebandwidth (bidirectional)
$$
- An AllReduce is composed of a ReduceScatter followed by an AllGather, and thus has 2x the above cost. An AllToAll only has to pass shards part-way around the ring and is thus ¼ the cost of an AllGather. Here’s a summary:

| Operation | Description | Syntax | Runtime |
| --- | --- | --- | --- |
| **AllGather** | Gathers all the shards of a sharded array along an axis, removing a subscript. | \[A\_X, B\] \\to \[A, B\] | bytes / (bidirectional ICI bandwidth \* num\_axes) |
| **ReduceScatter** | Sums a partially summed array along an axis and shards it along another axis (adding a subscript). | \[A, B\] \\{U\_X\\} \\to \[A\_X, B\] | Same as AllGather |
| **AllReduce** | Sums a partially summed array along an axis. Removes a { U <sub xmlns="http://www.w3.org/1999/xhtml">x</sub> }. Combines an AllGather and ReduceScatter. | \[A\_X, B\]\\{U\_Y\\} \\to \[A\_X, B\] | 2 \* AllGather |
| **AllToAll** | Gathers (replicates) an axis and shards a different dimension along the same axis. | \[A, B\_X\] \\to \[A\_X, B\] | AllGather / 4 for a bidirectional ring |

## Some Problems to Work

**Question 1 \[replicated sharding\]**: An array is sharded A\[I\_X, J, K, \\ldots\] (i.e., only sharded across X), with a mesh `Mesh({'X': 4, 'Y': 8, 'Z': 2})`. What is the ratio of the total number of bytes taken up by A across all chips to the size of one copy of the array?

Click here for the answer.

Our array is only sharded along X, which has size 4, so effectively each shard has size \[I / 4, J, K, \\ldots\] = \\text{sizeof}(A) / 4. Since our array is replicated across Y and Z, the total size is Y \\cdot Z \\cdot \\text{sizeof}(A), so the ratio of total size to single chip size is Y \\cdot Z \\cdot \\text{sizeof}(A) / \\text{sizeof}(A) = 16.

**Question 2 \[AllGather latency\]**: How long should \\text{AllGather}\_X(\[B\_X, D\_Y\]) take on a TPUv4p 4x4x4 slice with mesh `Mesh({'X': 4, 'Y': 4, 'Z': 4})` if B=1024 and D=4096 in bfloat16? How about $AllGatherXY([BX,DY])$ ? How about $AllReduceZ([BX,DY]{UZ})$ ?

Click here for the answer.

We have a wraparound link on all axes because we have a full `4x4x4` cube, so we have 9e10 bidirectional bandwidth to work with.

1. Because we’re just gathering over one axis and the other is sharded, we’re effectively gathering 2BD / Y bytes over 1 axis. *If you think about just a single shard along the Y-axis, the AllGather along X looks like an unsharded AllGather with 1 / Y of the bytes.* Since our ICI bandwidth for TPU v4p is 9e10 bytes/second bidirectional, this will take 2BD / (\\text{9e10} \\cdot Y) = 2 \\cdot 1024 \\cdot 4096 / (\\text{9e10} \\cdot 4) = 23 \\mu s.
2. We have twice the bandwidth as before but we’re AllGathering the full array, so `T = 2BD / (2 * W) = 2*1024*4096 / (2 * 9e10) = 46us`. This is far from the latency bound of 4us (1us per hop), so we’re fine.
3. The cost of an AllReduce is twice that of an AllGather. Each shard has size 2BD / (X \* Y), so the cost is about 4BD / (X \* Y \* W), or roughly `4 * 1024 * 4096 / (16 * 9e10) = 11.6us`.

**Question 3 \[latency-bound AllGather\]**: Let’s say we’re performing an \\text{AllGather}\_X(\[B\_X\]) but B is very small (say 128). How long should this take on a TPUv4p 4x4x4 slice with mesh `Mesh({'X': 4, 'Y': 4, 'Z': 4})` in bfloat16? *Hint: you’re probably latency bound.*

Click here for the answer.

Our array in bfloat16 uses only 256 bytes total, and only 64 per device. Since we have an axis of size 4 on a TPU v4p, we have a wraparound link, so we can send the array in both directions. With `4.5e10` of unidirectional bandwidth, each hop would take roughly `64 / 4.5e10 ~ 0`, so we’re definitely latency bound. Counting the number of hops, we can do the full gather in only 2 hops, so roughly 2us a good estimate.

**Question 4 \[matmul strategies\]**: To perform X\[B, D\] \\cdot\_D Y\[D\_X, F\] \\to Z\[B, F\], in this section we tell you to perform \\text{AllGather}\_X(Y\[D\_X, F\]) and multiply the fully replicated matrices (Case 2, *Strategy 1*). Instead, you could multiply the local shards like X\[B, D\_X\] \\cdot\_D Y\[D\_X, F\] \\to Z\[B, F\] \\{U\_X\\} (Case 3, *Strategy 2*), and then \\text{AllReduce}\_X(Z\[B, F\] \\{ U\_X\\}). How many FLOPs and comms does each of these perform? Which is better and why?

Click here for the answer.

Let’s start with our baseline (*Strategy 1*). As we’ve shown, the cost of the AllGather is 2DF / W\_\\text{ici}. Once we have the fully replicated arrays, the total compute time is 2BDF / C (where C is our accelerator FLOPs/s, since each TPU does the same FLOPs). So we have

$$
Ttotal (Strategy 1)=max(2BDFC,2DFWici)
$$

By comparison, the new strategy (Strategy 2) does an AllReduce over 2BF bytes, which has cost 4BF / W\_\\text{ici} but does 1 / X fewer FLOPs (since the computation is sharded). This means we do 2\\cdot B\\cdot D\\cdot F / X FLOPs and the resulting AllReduce communicates $2⋅2⋅B⋅F$ bytes in bfloat16. Thus, our total time for *Strategy 2* (no AllGather, just an AllReduce later on) is roughly

$$
Ttotal=max(2BDFX⋅C,4BFWici)
$$

The question is: *which of these is bigger?* Strategy (2) is compute bound when D / (X \\cdot C) > 2 / W\_\\text{ici}, or when D / 2X > C / W\_\\text{ici} \\approx 2550 \\rightarrow X < D / (2 \* 2550). We might reasonably expect D \\approx 8k, so this would mean roughly X < 2 which is unlikely – hence we’re basically always comms bound with Strategy 2. With the baseline (Strategy 1), we’re comms bound when $B<C/Wici=2550$ which is often but not always true.

So if B < 2550, we’re comms-bound in both cases and we have

$$
Tcomms for Strategy 2<Tcomms for Strategy 1⇔4BFWici<2DFWici
$$

which is true when D > 2B where 2B < 5100. This is often true, so Strategy 2 can sometimes be better if our batch is small. When our batch is large (B > 2550), we have

$$
Tcomms for Strategy 2<Tmath for Strategy 1⇔4BFWici<2BDFC
$$

This is true when 2 / W\_\\text{ici} < D / C, or when D > 2 \* 2550 = 5100, which is usually true for large models. So this alternative strategy is typically better for large models, unless D is small.

*Why don’t we always do this?* Well, in practice we may do this sometimes, but it’s typically rare to have the contracting dimension of one of the inputs to a matmul sharded along an axis that the other input isn’t sharded over. For instance, if we’re doing FSDP (explained in [Section 5](https://jax-ml.github.io/scaling-book/training)), we’ll shard our parameters over the data dimension but our activations will *also be sharded along data*. So in this sense this doesn’t show up much.

**Question 5 \[minimum latency\]**: Let’s say I want to do a matmul A\[I, J\] \\cdot\_J B\[J, K\] \\to C\[I, K\] on a TPUv5p 4x4x4 with the lowest possible latency. Assume the inputs can be sharded arbitrarily but the result should be fully replicated. How should my inputs be sharded? What is the total FLOPs and comms time?

Click here for the (partial) answer.

We won’t provide a full answer here, but we’ll start by describing the four most likely options:

1. A\[I\_{XYZ}, J\] \\cdot B\[J, K\] + AG at the end
2. A\[I, J\] \\cdot B\[J, K\_{XYZ}\] + AG at the end
3. A\[I, J\_{XYZ}\] \\cdot B\[J\_{XYZ}, K\] + AR at the end
4. A\[I, J\] \\cdot B\[J, K\] (fully replicated)

We could also consider sharding different axes along different mesh axes, but that isn’t likely to change the final cost. For all but (4), the total FLOPs per TPU is the same, but comms are different for each. We then simply need to calculate the comms cost for each and see which is lowest. The TLDR is that (1) and (2) are equally good.

**Question 6:** Let’s say we want to perform A\[I\_X, J\_Y\] \\cdot\_J B\[J\_Y, K\] \\to C\[I\_X, K\] on TPUv5e 4x4. What communication do we perform? How much time is spent on communication vs. computation?

- What about A\[I\_X, J\] \\cdot\_J B\[J\_X, K\_Y\] \\to C\[I\_X, K\_Y\]? This is the most standard setting for training where we combine data, tensor, and zero sharding.
- What about A\[I\_X, J\] \\cdot\_J B\[J, K\_Y\] \\to C\[I\_X, K\_Y\]? This is standard for inference, where we do pure tensor parallelism (+data).

**Question 7:** A typical Transformer block has two matrices W\_\\text{in}\[D, F\] and W\_\\text{out}\[F, D\] where F \\gg D. Say we have a batch size B. Then the full block is In\[B, D\] \\cdot W\_\\text{in}\[D, F\] \\cdot W\_\\text{out}\[F, D\]. Let’s pick D=8192, F=32768, and B=128 and assume everything is in bfloat16. Assume we’re running on a TPUv5e 2x2 slice but let’s pretend each TPU only has 300MB of free memory. How should In, W\_\\text{in}, W\_\\text{out}, and Out be sharded to stay below the memory limit while minimizing overall time? How much time is spent on comms and FLOPs? *Hint: the final output doesn’t need to be fully replicated, but it should be sharded the same as the input so the “layer” can be repeated.*

Click here for the (partial) answer.

First let’s think about memory. Each of our two big matrices uses `2 * 8192 * 32768 = 536MB`. Our activations `In` have size `2 * 128 * 8192 = 2MB` (small enough not to worry about). Since we only have 300MB of spare memory in each device, we clearly need to shard our matmuls.

1. In\[B\_X, D\] \* W\_\\text{in}\[D\_{XY}, F\] \* W\_\\text{out}\[F, D\_{XY}\] \\rightarrow Out\[B\_X, D\] (this is often called FSDP)
2. In\[B, D\_{XY}\] \* W\_\\text{in}\[D, F\_{XY}\] \* W\_\\text{out}\[F\_{XY}, D\] \\rightarrow Out\[B, D\_{XY}\] (this is called tensor parallelism)

The first is pretty bad because we need to AllGather our big weights or our activations first. The second requires an AllGather at the beginning and a ReduceScatter at the end (which is cheaper than an AllReduce). I’ll leave it as an exercise to do the rest of the math.

**Question 8 \[challenge\]**: Using the short code snippet above as a template, allocate a sharded array and benchmark each of the 4 main communication primitives (AllGather, AllReduce, ReduceScatter, and AllToAll) using pmap or shard\_map. You will want to use `jax.lax.all_gather`, `jax.lax.psum`, `jax.lax.psum_scatter`, and `jax.lax.all_to_all`. Do you understand the semantics of these functions? How long do they take?

**Question 9 \[another strategy for sharded matmuls?\]**: [Above](https://jax-ml.github.io/scaling-book/sharding/#case-2-one-multiplicand-has-a-sharded-contracting-dimension) we claimed that when only one input to a matmul is sharded along its contracting dimension, we should AllGather the sharded matrix and perform the resulting contracting locally. Another strategy you might think of is to perform the sharded matmul and then AllReduce the result (as if both inputs were sharded along the contracting dimension), i.e. A\[I, J\_X\] \*\_J B\[J, K\] \\to C\[I, K\] by way of

1. C\[I, K\] \\{ U\_X \\} = A\[I, J\_X\] \\cdot B\[J\_X, K\]
2. C\[I, K\] = \\text{AllReduce}(C\[I, K\] \\{ U\_X\\})

Answer the following:

1. Explicitly write out this algorithm for matrices A\[N, M\] and B\[M, K\], using indices to show exactly what computation is done on what device. Assume A is sharded as A\[I, J\_X\] across ND devices, and you want your output to be replicated across all devices.
2. Now suppose you are ok with the final result not being replicated on each device, but instead sharded (across either the N or K dimension). How would the algorithm above change?
3. Looking purely at the communication cost of the strategy above (in part (b), not (a)), how does this communication cost compare to the communication cost of the algorithm in which we first AllGather A and then do the matmul?
Click here for the answer.
1. First compute the outer products, storing the result in $O[N,K]:okj=∑iakibij$ . Note that the repeated index is not the one being contracted, as we are doing an outer product. Here the sum ranges across the set of i values stored on the particular device we are using. So, for example, if we have a contracting axis of size 16, and 4 devices, then on device 0, i would range from {0, 1, 2, 3}; on device 1, i would range from {4, 5, 6, 7}; on device 2, i would range from {8, 9, 10, 11}; and on device 3, i would range from {12, 13, 14, 15}. Then AllReduce the partial-sums of O\[N, K\] which live on each device, to form the full O\[N, K\].
2. Instead of doing an AllReduce in step 2, we could get away with a cheaper ReduceScatter, along either axis: \[N, K\] \\{ U\_X \\} \\to \[N\_X, K\] or \[N, K\] \\{ U\_X \\} \\to \[N, K\_X\].
3. As described in the main text above, the cost of doing an AllGather (when we are throughput-bound) is the same as that of a ReduceScatter; it is simply given by the size of the full matrix we are processing. So in the gather-then-matmul algorithm, this scales as NM (since we are \\text{AllGather} -ing A); in the matmul-then-reduce-scatter algorithm, this scales as NK (since we are reduce-scattering O). So the communication cost ratio of the two algorithms is `M/K`.

**Question 10: Fun with AllToAll:** In the table above, it was noted that the time to perform an AllToAll is a factor of 4 lower than the time to perform an AllGather or ReduceScatter (in the regime where we are throughput-bound). In this problem we will see where that factor of 4 comes from, and also see how this factor would change if we only had single-direction ICI links, rather than bidirectional ICI links.

1. Let’s start with the single-direction case first. Imagine we have *D* devices in a ring topology and want to do either an AllGather or a ReduceScatter on an N x N matrix A\[I\_X, J\] (say D divides N for simplicity). Describe the comms involved in these two collectives, and calculate the total number of scalars (floats or ints) which are transferred across **a single** ICI link during the entirety of this algorithm.
2. Now let’s think about an AllToAll, still in the single-directional ICI case. How is the algorithm different in this case than the all-gather case? Calculate the number of scalars that are transferred across a single ICI link in this algorithm.
3. You should have found that the ratio between your answers to part (a) and part (b) is a nice number. Explain where this factor comes from in simple terms.
4. Now let’s add bidirectional communication. How does this affect the total time needed in the all-gather case?
5. How does adding bidirectional communication affect the total time needed in the AllToAll case?
6. Now simply explain the ratio between AllGather time and AllToAll time in a bidirectional ring.
Click here for the answer.

(1) **Solution:** The process is simple: in each step of the algorithm, each device will send a single-shard “strip” of the matrix (totalling $ND×N$ elements in size) to its nearest neighbor. This occurs $D−1$ times, since each shard needs to be communicated to all of the devices except the one it starts out on. So in total, $N2(D−1)D$ scalars are transferred by each device, i.e. flow across a single ICI link.

**Answer:** $N2(1−1D)$ , or simply $N2$ when $D>>1$ .

(2) **Solution:** The key difference between an AllToAll and an AllGather, from the perspective of communications, is that in an AllToAll, the entirety of the shard that lives on a particular device does not need to be communicated to every other device. Imagine the shard stored on a particular device (call it device 0) is $[A,B,C,D]$ (here A,B,C,D are matrices and we are imagining a ring with 4 devices for illustration). Now the matrix $A$ does not need to be communicated anywhere, the matrix $B$ needs to end up on device 1; matrix $C$ ends up on device 2; and matrix $D$ ends up on device 3. So in the first step of the algorithm, we send $B$ , $C$ , and $D$ to device 1; in the next step, device 1 sends $C$ and $D$ onwards to device 2; in the final step, device 2 sends just $D$ on to device 3. The total number of parameters transferred in this case is $(size of A/B/C/D)∗(3+2+1)$ . The size of A/B/C/D is (in the general case now) $N2D2$ , and again in the general case the $(3+2+1)$ term becomes $((D−1)+(D−2)+…+1)$ , or $(D)(D−1)2$ . So the total number of bytes transferred across a single ICI link is $N2(D−1)D×2$ .

**Answer:** $N22(1−1D)$ , or simply $N22$ when $D>>1$ .

(3) **Solution:** The factor is simply $12$ , i.e. an AllToAll is half as costly as an all-gather/ReduceScatter on a unidirectional ring topology. Looking over the derivations above, this ultimately came from the fact that in the all-gather case, we are transferring the same sized block each of $(D−1)$ times, i.e. we’re doing the sum $tiny block size∗(D+D+D+…+D)$ , whereas in the AllToAll case, we’re doing the sum $tiny block size∗(D+D−1+D−2+…+1)$ . The factor of two thus essentially comes from the fact that $1+2+…+n=n(n+1)/2$ .

(4) **Solution**: The total number of scalars that any one link has to carry now reduces by a factor of 2, since in a bidirectional ring, each “sharded strip” can be sent two ways simultaneously.

(5) **Solution**: In this case, we win a factor of 4 compared to the unidirectional case. This is easiest to see by considering the fate of each of the size-(N2/D2) blocks in a single sharded strip, say the one which originates on device 0. Instead of (as in the unidirectional case) sending one of these blocks a distance of D-1, another block a distance D - 2, etc. all the way to 1, we now divide the strip into blocks which move right or left, moving a maximum distance of floor(D/2). So the corresponding sum now becomes $D/2+D/2−1+D/2−2+…=D/2⋅(D/2+1)/2$ , or $D2/8$ in the limit of large $D$ . Compare this to $D2/2$ in the unidirectional case, and we see that we’ve won a factor of 4.

(6) **Solution:** In a unidirectional ring, we saw that the AllToAll time was already twice as fast as the all-gather time; this comes from the fact that we don’t need to send our full strip to every single device. Then, when we added bidirectionality, we saw that it was a 4x win for AllToAll, and only a 2x win for all-gathers. Putting these ratios together, we get our sought after factor of 4.

### Footnotes

1. It's worth noting that we may also choose to parallelize for speed. Even if we could fit on a smaller number of chips, scaling to more simply gives us more FLOPs/s. During inference, for instance, we can sometimes fit on smaller topologies but choose to scale to larger ones in order to reduce latency. Likewise, during training we often scale to more chips to reduce the step time.

2. The factor of 2 in the numerator comes from the fact that we're using the bidirectional bandwidth. We send V / X in each direction, or 2V / X total.

3. For even-sized bidirectional rings, each device will send (N/2 + (N/2-1) + … + 1) chunks right and ((N/2-1) + … + 1) chunks left \= 0.5 \\cdot (N / 2) \\cdot (N/2 + 1) + 0.5 \\cdot (N / 2) \\cdot (N/2 - 1) = N^2/4. The size of each chunk (aka shard of a shard) is \\text{bytes} / N^2 so the per-device cost is (\\text{bytes} / N^2) \\cdot N^2 / 4 = \\text{bytes} / 4. This result scales across all devices as the total bandwidth scales with device number.