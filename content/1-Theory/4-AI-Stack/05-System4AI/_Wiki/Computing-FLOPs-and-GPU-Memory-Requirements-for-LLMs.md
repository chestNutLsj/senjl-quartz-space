这份笔记提供了一个全面的指南，用于估算训练和部署 LLM 的计算需求（FLOPs）、GPU内存消耗，以及对模型参数进行了大致估计。笔记从第一性原理推导公式，并为常见模型规模提供实际示例，同时涵盖了MoE架构和最新硬件平台的估算示例。

## 1. FLOPs计算

### 基本原则

FLOPs（浮点运算次数）衡量计算工作量。对于神经网络,主要运算是矩阵乘法：

对于矩阵乘法 $\mathbf{C} = \mathbf{AB}$，其中 $\mathbf{A} \in \mathbb{R}^{m \times k}$ 且 $\mathbf{B} \in \mathbb{R}^{k \times n}$：

$$
\text{FLOPs}_{\text{matmul}} = 2mnk \quad (1)
$$

系数2考虑了每个元素需要一次乘法和一次加法运算。

### Transformer架构概览

标准的Transformer解码器层包含：

![[Dive-into-EPLB-transformer.png]]

1. 多头自注意力机制（MHA）
2. 前馈网络（FFN）
3. 层归一化（FLOPs可忽略）
    - 对于一个长度为 $L$ 个 token、每个 token 的维度为 $d$ 的序列，层归一化需要：计算均值 $O(Ld)$ 次加法和除法、计算方差 $O(Ld)$ 次运算，标准化 $O(Ld)$ 次运算，共 $O(Ld)$ 次运算
    - 而对单层 Transformer 的 Self-Attention，则计算复杂度为 $O(8Ld^2+4L^2d)$，对于 FFN 层，计算复杂度为 $O(16Ld^2)$，因此从渐进的角度分析，层归一化可以被忽略

关键符号说明：

- $L$：序列长度
- $d$：模型维度（$d_{\text{model}}$）
- $n_h$：注意力头数量
- $d_h = d/n_h$：每个头的维度
- $d_{\text{ff}}$：FFN中间层维度（dense model 通常为 $4d$）
- $n_{\text{layers}}$：Transformer层数
- $N$：模型参数总数

### Self-Attention FLOPs

#### Transformer注意力机制概述

在深入计算FLOPs之前，让我们先回顾标准的Multi-Head Attention机制。对于输入序列 $\mathbf{H} \in \mathbb{R}^{L \times d}$（$L$ 个token，每个维度为 $d$），多头注意力的完整计算流程如下。

首先通过三个线性投影生成Query、Key和Value矩阵：

$$
\mathbf{Q} = \mathbf{H}\mathbf{W}^Q, \quad \mathbf{K} = \mathbf{H}\mathbf{W}^K, \quad \mathbf{V} = \mathbf{H}\mathbf{W}^V \quad (2)
$$

其中 $\mathbf{W}^Q, \mathbf{W}^K, \mathbf{W}^V \in \mathbb{R}^{d \times d}$ 是投影矩阵。接着计算注意力分数矩阵：

$$
\mathbf{S} = \frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_h}} \quad (3)
$$

其中 $\mathbf{S} \in \mathbb{R}^{L \times L}$ 表示每对token之间的相关性。应用softmax归一化后，得到注意力权重矩阵：

$$
\mathbf{A} = \text{softmax}(\mathbf{S}) \in \mathbb{R}^{L \times L} \quad (4)
$$

最后通过注意力权重对Value向量进行加权求和，并经过输出投影得到最终输出：

$$
\mathbf{O}_{\text{attn}} = \mathbf{A}\mathbf{V}\mathbf{W}^O \quad (5)
$$

其中 $\mathbf{W}^O \in \mathbb{R}^{d \times d}$ 是输出投影矩阵。这个完整流程涉及多次矩阵乘法，下面我们将逐步计算每个阶段的FLOPs。

#### Query, Key, Value Projections

对于Q、K、V中的每一个投影，都是一个 $\mathbb{R}^{L \times d}$ 与 $\mathbb{R}^{d \times d}$ 的矩阵乘法：

$$
\text{FLOPs}_{\text{proj}} = 2Ld^2 \quad (6)
$$

三者总和：

$$
\text{FLOPs}_{\text{QKV}} = 3 \times 2Ld^2 = 6Ld^2 \quad (7)
$$

#### Attention Score

计算 $\mathbf{S} = \mathbf{QK}^T$，其中 $\mathbf{Q}, \mathbf{K} \in \mathbb{R}^{L \times d}$：

$$
\text{FLOPs}_{\text{scores}} = 2L^2d \quad (8)
$$

#### Attention 加权求和

计算 $\mathbf{O} = \text{softmax}(\mathbf{S})\mathbf{V}$，其中 $\mathbf{V} \in \mathbb{R}^{L \times d}$：

$$
\text{FLOPs}_{\text{weighted}} = 2L^2d \quad (9)
$$

#### Output Projection

$$
\text{FLOPs}_{\text{out}} = 2Ld^2 \quad (10)
$$

#### Total

$$
\text{FLOPs}_{\text{attn}} = 6Ld^2 + 2L^2d + 2L^2d + 2Ld^2 = 8Ld^2 + 4L^2d \quad (11)
$$

#### Multi-head Latent Attention (MLA)

现代大规模模型如DeepSeek V3采用了Multi-head Latent Attention（MLA）机制来优化推理效率。MLA的核心思想是通过低秩压缩来减少KV Cache的内存占用，同时保持甚至提升模型性能。

在MLA中，与其直接存储完整的Key和Value向量，不如先将输入通过一个下投影矩阵 $\mathbf{W}^{DKV} \in \mathbb{R}^{d_c \times d}$ 压缩为低维潜在向量 $\mathbf{c}^{KV} \in \mathbb{R}^{d_c}$，其中压缩维度 $d_c \ll d$。在计算注意力时，再通过上投影矩阵 $\mathbf{W}^{UK}, \mathbf{W}^{UV} \in \mathbb{R}^{d \times d_c}$ 将潜在向量解压回完整的Key和Value。

对于MLA，额外的FLOPs计算包括：

- 压缩投影：$2Ldd_c$
- 解压投影（K和V）：$2 \times 2Ldd_c = 4Ldd_c$

总计MLA的额外FLOPs为：

$$
\text{FLOPs}_{\text{MLA\_extra}} = 6Ldd_c \quad (11.1)
$$

然而，由于 $d_c \ll d$（例如DeepSeek V3中 $d_c = 512$，$d = 7168$），这些额外计算相对于标准注意力机制来说是很小的。更重要的是，MLA通过减少内存带宽需求显著提升了推理吞吐量。

### FFN FLOPs

#### Dense FFN

FFN包含两个线性变换和一个非线性激活：

$$
\text{FFN}(\mathbf{x}) = \mathbf{W}_2 \cdot \text{ReLU}(\mathbf{W}_1\mathbf{x}) \quad (12)
$$

其中 $\mathbf{W}_1 \in \mathbb{R}^{d \times d_{\text{ff}}}$ 且 $\mathbf{W}_2 \in \mathbb{R}^{d_{\text{ff}} \times d}$。

$$
\text{FLOPs}_{\text{FFN}} = 2Ld \cdot d_{\text{ff}} + 2Ld_{\text{ff}} \cdot d = 4Ldd_{\text{ff}} \quad (13)
$$

当 $d_{\text{ff}} = 4d$ 时：

$$
\text{FLOPs}_{\text{FFN}} = 16Ld^2 \quad (14)
$$

#### MoE (Mixture-of-Experts) FFN

现代大规模模型如DeepSeek V3采用MoE架构来提升参数效率和训练经济性。在MoE层中，FFN被替换为多个专家网络，每个token只激活其中的一部分专家。

对于具有 $E$ 个专家且每个token激活 $k$ 个专家的MoE层，每个专家的中间维度为 $d_{\text{expert}}$：

$$
\text{FLOPs}_{\text{MoE}} = 4Lkd \cdot d_{\text{expert}} \quad (14.1)
$$

此外，MoE还包括路由（gating）机制的计算成本，用于决定哪些专家应该被激活：

$$
\text{FLOPs}_{\text{routing}} = 2Ld \cdot E \quad (14.2)
$$

然而，由于 $E$ 通常远小于 $d$，路由的FLOPs可以忽略不计。

对于DeepSeek V3这样的混合架构（部分层为dense，部分层为MoE），需要分别计算：

- Dense FFN层（前几层）：每层 $4Ldd_{\text{ff}}$ FLOPs
- MoE层（大部分层）：每层 $4Lkd \cdot d_{\text{expert}}$ FLOPs

### Complete Layer FLOPs

#### Dense Model

$$
\text{FLOPs}_{\text{layer}} = \text{FLOPs}_{\text{attn}} + \text{FLOPs}_{\text{FFN}} = 8Ld^2 + 4L^2d + 16Ld^2 \quad (15)
$$

$$
\text{FLOPs}_{\text{layer}} = 24Ld^2 + 4L^2d \quad (16)
$$

#### MoE Model

对于MoE模型，假设有 $n_{\text{dense}}$ 个dense层和 $n_{\text{MoE}}$ 个MoE层：

$$
\text{FLOPs}_{\text{MoE\_layer}} = 8Ld^2 + 4L^2d + 4Lkd \cdot d_{\text{expert}} \quad (16.1)
$$

### Full Model FLOPs

#### Dense Model

对于 $n_{\text{layers}}$ 层：

$$
\text{FLOPs}_{\text{forward}} = n_{\text{layers}}(24Ld^2 + 4L^2d) \quad (17)
$$

当 $L \ll d$（对于现代LLM通常成立）时：

$$
\text{FLOPs}_{\text{forward}} \approx 24n_{\text{layers}}Ld^2 \quad (18)
$$

由于 $N \approx 12n_{\text{layers}}d^2$（参数数量近似）：

$$
\boxed{\text{FLOPs}_{\text{forward}} \approx 2NL} \quad (19)
$$

这是常被引用的近似：**每个参数每个token需要2个FLOPs**（其中 $N \approx 12n_{\text{layers}}d^2$）。

> [!note] 近似公式的适用条件
> 上述公式为**主导项近似**，忽略了以下次要项：
> - LayerNorm、bias 等参数（通常 $\ll d^2$ 量级）
> - Softmax、激活函数（GELU/SwiGLU）的 elementwise 操作
> - 当 $L$ 很大或 $d$ 较小时，注意力中的 $4L^2d$ 项可能不可忽略
>
> 在实际实现中，完整的 FLOPs 计数还需考虑这些额外项，但对于大规模模型（$d \geq 1024$），主导项近似误差通常 $< 5\%$。

#### MoE Model

对于MoE模型，关键在于理解**激活参数**与**总参数**的区别以及它们如何影响FLOPs计算。虽然模型可能拥有数千亿的总参数，但每个token只会激活其中的一小部分。

**为什么FLOPs由激活参数而非总参数决定？**

这是因为在前向传播中，计算量完全由实际参与矩阵乘法的参数决定。对于MoE模型：

1. **注意力层**：所有token共享同一套注意力参数，这部分与dense模型相同，对应约 $8Ld^2$ FLOPs
2. **MoE层中的路由专家**：虽然有 $E$ 个专家（例如DeepSeek V3有256个路由专家），但每个token只被路由到其中 $k$ 个（DeepSeek V3中 $k=8$）。只有被激活的 $k$ 个专家参与计算，贡献 $4Lkd \cdot d_{\text{expert}}$ FLOPs
3. **共享专家**：始终被激活，贡献 $4Ld \cdot d_{\text{expert}}$ FLOPs

因此，每个token的前向传播FLOPs取决于实际激活的参数，而非存储在模型中的总参数。这正是MoE架构的核心优势：通过稀疏激活实现了参数规模与计算成本的解耦。

设 $N_{\text{active}}$ 为每个token激活的参数数量。对于DeepSeek V3这样的模型：

- 总参数 $N_{\text{total}} = 671$B
- 每token激活参数 $N_{\text{active}} = 37$B

MoE模型的前向传播FLOPs近似为：

$$
\boxed{\text{FLOPs}_{\text{forward}} \approx 2N_{\text{active}}L} \quad (19.1)
$$

这意味着虽然MoE模型的参数规模巨大，但其计算成本主要由激活参数决定，使得推理效率显著提升。

更精确地，对于混合架构：

$$
\text{FLOPs}_{\text{forward}} = n_{\text{dense}}(24Ld^2 + 4L^2d) + n_{\text{MoE}}(8Ld^2 + 4L^2d + 4Lkd \cdot d_{\text{expert}}) \quad (19.2)
$$

### Training FLOPs

#### Dense Model

训练需要前向传播和反向传播。反向传播需要的计算量约为前向传播的两倍：

$$
\text{FLOPs}_{\text{backward}} \approx 2 \times \text{FLOPs}_{\text{forward}} = 4NL \quad (20)
$$

每个token的总计：

$$
\boxed{\text{FLOPs}_{\text{train}} = 6NL} \quad (21)
$$

> [!warning] 训练FLOPs近似说明
> 公式 $6NL$ 是文献中常用的经验近似（前向 $\approx 2NL$，反向 $\approx 2 \times$ 前向）。实际训练 FLOPs 取决于：
> - 具体实现（是否计算 optimizer 的额外开销）
> - 是否有辅助损失项 / 约束项
> - gradient checkpoint 策略
>
> 该近似对于标准 Transformer 训练通常误差 $< 10\%$。

训练 $T$ 个tokens：

$$
\text{FLOPs}_{\text{total}} = 6NT \quad (22)
$$

#### MoE Model

对于MoE模型，训练FLOPs同样基于激活参数：

$$
\boxed{\text{FLOPs}_{\text{train}} = 6N_{\text{active}}L} \quad (21.1)
$$

总训练FLOPs为：

$$
\text{FLOPs}_{\text{total}} = 6N_{\text{active}}T \quad (22.1)
$$


> [!info]- 关于 MoE 训练 FLOPs 的重要说明
> 虽然前向和反向传播的计算FLOPs仅取决于激活参数，但这并不意味着训练过程中可以忽略未激活的专家。实际上：
>
> 1. **参数存储**：所有 $N_{\text{total}}$ 参数都必须存储在GPU内存中（通过并行策略分布在多个GPU上）
> 2. **梯度计算**：虽然每个token只激活 $k$ 个专家，但在一个批次中，不同token可能激活不同的专家组合。因此，在整个训练批次中，大部分甚至所有专家都会在某些token上被激活，并需要计算和累积梯度
> 3. **参数更新**：优化器需要维护所有 $N_{\text{total}}$ 参数的优化器状态（如Adam的动量和方差）
>
> 这解释了为什么MoE模型的训练内存需求与 $N_{\text{total}}$ 成正比，而计算FLOPs与 $N_{\text{active}}$ 成正比。这种设计使得MoE模型能够在保持合理训练成本的同时，拥有远超dense模型的参数容量。

### Example

**示例1：LLaMA 2 7B模型（Dense）**

- 参数量：$N = 7 \times 10^9$
- 训练tokens：$T = 2 \times 10^{12}$（2万亿）

$$
\text{FLOPs}_{\text{total}} = 6 \times 7 \times 10^9 \times 2 \times 10^{12} \quad (23)
= 8.4 \times 10^{22} \text{ FLOPs} \quad (24)
= 84 \text{ ZFLOPs (zettaFLOPs)} \quad (25)
$$

**示例2：GPT-3 175B（Dense）**

- 参数量：$N = 175 \times 10^9$
- 训练tokens：$T = 300 \times 10^9$

$$
\text{FLOPs}_{\text{total}} = 6 \times 175 \times 10^9 \times 300 \times 10^9 \quad (26)
= 3.15 \times 10^{23} \text{ FLOPs} \quad (27)
= 315 \text{ ZFLOPs} \quad (28)
$$

**示例3：DeepSeek V3 671B（MoE）**

- 总参数量：$N_{\text{total}} = 671 \times 10^9$
- 激活参数量：$N_{\text{active}} = 37 \times 10^9$
- 训练tokens：$T = 14.8 \times 10^{12}$（14.8万亿）

$$
\text{FLOPs}_{\text{total}} = 6 \times 37 \times 10^9 \times 14.8 \times 10^{12} \quad (28.1)
= 3.286 \times 10^{24} \text{ FLOPs} \quad (28.2)
= 3286 \text{ ZFLOPs} \quad (28.3)
$$

值得注意的是，DeepSeek V3虽然总参数远超GPT-3，但由于MoE的稀疏激活特性，其训练FLOPs仅基于激活参数计算，使得训练效率大幅提升。根据DeepSeek官方报告，整个训练仅用了2.788M H800 GPU小时，展现了MoE架构在训练经济性上的显著优势。

## 2. GPU Memory 计算

### Memory Components Overview

GPU 内存的消耗在训练和推理之间有显著差异：

|模型组件|训练|推理|
|---|---|---|
|模型权重|✓|✓|
|梯度|✓||
|优化器状态|✓||
|激活值|✓（大）|✓（小）|
|KV Cache||✓|

### Parameter Memory

模型参数的基础内存：

$$
M_{\text{params}} = N \times b_p \quad (29)
$$

其中 $b_p$ 是每个参数占用的字节数：

- FP32：$b_p = 4$ 字节
- FP16/BF16：$b_p = 2$ 字节
- FP8：$b_p = 1$ 字节
- INT8：$b_p = 1$ 字节
- INT4：$b_p = 0.5$ 字节

#### FP8 混合精度训练框架

DeepSeek V3 在超大规模模型上验证了 FP8 混合精度训练的可行性。

> [!note] 扩展阅读
> FP8 混合精度训练的详细技术框架、精度分配策略、量化方法等详见：[[FP8-Mixed-Precision-Training-Framework]]

### Training Memory

#### Model Weight

在传统FP16混合精度训练中（FP16计算，FP32主权重）：

$$
M_{\text{weights}}^{\text{FP16}} = 2N \text{ bytes} \quad (30)
$$

在FP8混合精度训练中，权重存储更加复杂：

- 计算权重（FP8）：$N$ 字节
- 主权重（FP32）：$4N$ 字节

$$
M_{\text{weights}}^{\text{FP8}} = N + 4N = 5N \text{ bytes} \quad (30.1)
$$

然而，实际实现中，计算权重可以动态量化，不需要额外存储，因此：

$$
M_{\text{weights}}^{\text{FP8}} \approx 4N \text{ bytes (仅主权重)} \quad (30.2)
$$

#### Gradients

梯度的大小与模型参数相同：

$$
M_{\text{grad}} = 2N \text{ bytes (FP16)} \quad (31)
$$

对于FP8训练，梯度累积通常在FP32精度：

$$
M_{\text{grad}} = 4N \text{ bytes (FP32)} \quad (31.1)
$$

但实际中可以使用FP16存储梯度：

$$
M_{\text{grad}} = 2N \text{ bytes (FP16存储)} \quad (31.2)
$$

#### Optimizer States

标准 Adam/AdamW 优化器需要为每个参数维护两个状态变量：

- 一阶动量（momentum $m$，FP32）：$4N$ 字节
- 二阶动量（variance $v$，FP32）：$4N$ 字节

$$
M_{\text{opt}}^{\text{Adam}} = 8N \text{ bytes} \quad (32)
$$

> [!note] 优化器状态说明
> 注意：主权重（master weights）不计入优化器状态，而是单独计入权重内存。某些文献将主权重与优化器状态合并表述为 $12N$，但为清晰起见，本文将二者分开记账。

#### Activations

激活值内存取决于 batch size $b_s$、序列长度 $L$ 和模型架构：

$$
M_{\text{act}} \approx b_s \times L \times n_{\text{layers}} \times d \times b_p \quad (33)
$$

这是最可变的组件，可以通过 gradient checkpoint 技术减少。

对于MoE模型，激活值内存的计算需要考虑专家激活模式：

$$
M_{\text{act}}^{\text{MoE}} \approx b_s \times L \times (n_{\text{dense}} \times d + n_{\text{MoE}} \times k \times d_{\text{expert}}) \times b_p \quad (33.1)
$$

其中 $k$ 是每个token激活的专家数量，$d_{\text{expert}}$ 是每个专家的中间维度。

在FP8训练中，大部分激活值可以使用FP8存储，显著减少内存占用：

$$
M_{\text{act}}^{\text{FP8}} \approx M_{\text{act}}^{\text{FP16}} / 2 \quad (33.2)
$$

#### Total Training Memory

**基线假设**（常见 PyTorch/DeepSpeed 实现）：
- 主权重（master weights）：FP32，$4N$ 字节
- 计算副本（model copy）：FP16，$2N$ 字节（用于前向/反向传播）
- 梯度（gradients）：FP16，$2N$ 字节
- Adam 优化器状态（$m$, $v$）：FP32，$8N$ 字节
- 激活值（activations）：取决于 batch size 和架构，$M_{\text{act}}$

总训练内存：

$$
M_{\text{train}} = M_{\text{master}} + M_{\text{model}} + M_{\text{grad}} + M_{\text{opt}} + M_{\text{act}} \quad (34)
$$

$$
M_{\text{train}} = 4N + 2N + 2N + 8N + M_{\text{act}} = 16N + M_{\text{act}} \quad (35)
$$

$$
\boxed{M_{\text{train}} \approx 16N + M_{\text{act}}} \quad (36)
$$

> [!warning] 实现差异说明
> - 若实现采用 **on-the-fly 量化**（不保存 FP16 model copy，只保留 FP32 master），则权重项为 $4N$，总计 $\approx 14N + M_{\text{act}}$
> - 若梯度以 **FP32 存储**（而非 FP16），则总计 $\approx 18N + M_{\text{act}}$
> - 上述公式基于"保留 FP16 model copy + FP16 gradients"的常见配置

对于 FP8 混合精度训练，权重存储存在两种实现策略：

**策略 1：同时保留 FP8 副本**（权重总计 $5N$）
- FP8 计算副本：$N$ 字节
- FP32 主权重：$4N$ 字节

$$
M_{\text{train}}^{\text{FP8}} = (N + 4N) + 2N + 8N + M_{\text{act}}^{\text{FP8}} = 15N + M_{\text{act}}^{\text{FP8}} \quad (36.1)
$$

**策略 2：按需量化（on-the-fly）**（权重总计 $4N$）
- 仅保留 FP32 主权重，计算时动态量化至 FP8

$$
M_{\text{train}}^{\text{FP8}} = 4N + 2N + 8N + M_{\text{act}}^{\text{FP8}} = 14N + M_{\text{act}}^{\text{FP8}} \quad (36.2)
$$

DeepSeek V3 采用策略 2（按需量化），避免额外存储 FP8 副本。

> [!tip]- FP8 训练的主要优势
> FP8 训练的主要优势在于：
>
> 1. **激活值内存减半**：$M_{\text{act}}^{\text{FP8}} \approx M_{\text{act}}^{\text{FP16}} / 2$
> 2. **通信带宽需求减半**：梯度和激活值的传输量减少
> 3. **计算加速**：利用FP8 Tensor Core获得2-3倍的计算加速


#### Example: 7B Model Training

对于 7B 参数模型（基于常见配置：FP32 master + FP16 model + FP16 grad + Adam）：

$$
M_{\text{model\_states}} = 16 \times 7 \times 10^9 = 112 \text{ GB} \quad (37)
$$

$$
M_{\text{act}} \approx 10-50 \text{ GB（取决于批次大小）} \quad (38)
$$

$$
M_{\text{total}} \approx 122-162 \text{ GB} \quad (39)
$$

这需要多个大显存 GPU（例如 2-4 个 A100 80GB 或 H100 80GB）。

#### Example: DeepSeek V3 Training

对于DeepSeek V3的671B总参数（37B激活参数）模型，使用2048个H800 GPU进行训练。

DeepSeek V3 采用了 16-way PP × 64-way EP × ZeRO-1 DP 的精心设计的并行策略。

> [!note] 扩展阅读
> DeepSeek V3 的详细并行策略设计、内存分配计算、关键优化技术（DualPipe、节点受限路由、无辅助损失负载均衡等）详见：[[DeepSeek-V3-Parallel-Strategy-Analysis]]

### Inference Memory

#### Model Weight

$$
M_{\text{weights}} = N \times b_p \quad (40)
$$

对于FP16：$M_{\text{weights}} = 2N$

对于MoE模型，需要注意的是虽然总参数量巨大，但由于稀疏激活特性，实际推理时的内存加载模式与dense模型有所不同。在某些部署场景下，可以只加载常用专家到GPU内存，将不常用专家保留在CPU内存或更慢的存储介质上，通过专家缓存策略进一步优化内存使用。

#### KV Cache

KV缓存对自回归生成至关重要。对于每一层，我们缓存：

- Key向量：$\mathbb{R}^{L \times d_{\text{kv}}}$
- Value向量：$\mathbb{R}^{L \times d_{\text{kv}}}$

其中 $d_{\text{kv}}$ 取决于注意力机制。

**标准多头注意力（MHA）：**

$$
d_{\text{kv}} = n_h \times d_h = d \quad (41)
$$

$$
M_{\text{KV}}^{\text{MHA}} = 2 \times b_s \times L \times n_{\text{layers}} \times d \times b_p \quad (42)
$$

**分组查询注意力（GQA）：**

$$
d_{\text{kv}} = n_{\text{kv}} \times d_h \quad (43)
$$

其中 $n_{\text{kv}} < n_h$（KV头数量）。

$$
M_{\text{KV}}^{\text{GQA}} = 2 \times b_s \times L \times n_{\text{layers}} \times n_{\text{kv}} \times d_h \times b_p \quad (44)
$$

**内存减少因子：**

$$
r = \frac{M_{\text{KV}}^{\text{GQA}}}{M_{\text{KV}}^{\text{MHA}}} = \frac{n_{\text{kv}}}{n_h} \quad (45)
$$

**Multi-head Latent Attention（MLA）：**

MLA通过低秩压缩实现了比GQA更激进的KV Cache减少。在MLA中，我们不直接存储完整的Key和Value向量，而是存储压缩后的潜在向量：

$$
M_{\text{KV}}^{\text{MLA}} = b_s \times L \times n_{\text{layers}} \times d_c \times b_p \quad (45.1)
$$

其中 $d_c$ 是压缩维度。对于DeepSeek V3，$d_c = 512$，而 $d = 7168$，压缩比率为：

$$
r_{\text{MLA}} = \frac{d_c}{2d} = \frac{512}{2 \times 7168} \approx 0.036 \quad (45.2)
$$

这意味着MLA的KV Cache仅为标准MHA的3.6%，实现了高达96.4%的内存节省。根据DeepSeek V2的实验结果，MLA在某些配置下可以减少93.3%的KV Cache，显著提升了推理吞吐量和支持的最大上下文长度。

重要的是，MLA不仅减少了内存占用，还显著降低了内存带宽需求。在推理过程中，每生成一个新token，都需要从内存中读取所有历史token的KV向量。MLA将这个内存带宽需求降低到原来的几十分之一，使得长上下文推理在内存带宽受限的场景下仍能保持高吞吐量。

#### Activations and Buffers

在推理期间（Decoding 阶段）：

$$
M_{\text{act}} \approx b_s \times 1 \times d \times b_p \approx \text{几百MB} \quad (46)
$$

注意力计算的临时缓冲区：

$$
M_{\text{temp}} \approx 1-2 \text{ GB} \quad (47)
$$

#### Total Inference Memory

$$
\boxed{M_{\text{infer}} = M_{\text{weights}} + M_{\text{KV}} + M_{\text{act}} + M_{\text{temp}}} \quad (48)
$$

### KV Cache 规模分析

KV缓存与上下文长度呈**线性**扩展：

$$
M_{\text{KV}}(L) = k \cdot L \quad (49)
$$

其中

$$
k = \frac{2 \times b_s \times n_{\text{layers}} \times d_{\text{kv}} \times b_p}{10^9} \text{ GB per token} \quad (50)
$$

#### Example: LLaMA 2 7B

参数：

- $n_{\text{layers}} = 32$
- $d = 4096$
- $n_h = 32, d_h = 128$
- $b_p = 2$ (FP16)
- $b_s = 1$

对于MHA：

$$
k = \frac{2 \times 1 \times 32 \times 4096 \times 2}{10^9} \quad (51)
\approx 0.524 \text{ GB per 1K tokens} \quad (52)
$$

|上下文长度|权重|KV缓存|总计|
|---|---|---|---|
|4K tokens|14 GB|2.1 GB|17.6 GB|
|8K tokens|14 GB|4.2 GB|19.7 GB|
|32K tokens|14 GB|16.8 GB|32.3 GB|
|128K tokens|14 GB|67.1 GB|82.6 GB|

这个表格展示了LLaMA 2 7B模型在不同上下文长度下的内存需求情况。

#### Example: DeepSeek V3 with MLA

参数：

- $n_{\text{layers}} = 61$
- $d = 7168$
- $d_c = 512$ (MLA压缩维度)
- $b_p = 1$ (FP8推理)
- $b_s = 1$

对于MLA：

$$
k_{\text{MLA}} = \frac{1 \times 61 \times 512 \times 1}{10^9} \quad (52.1)
\approx 0.031 \text{ GB per 1K tokens} \quad (52.2)
$$

|上下文长度|权重（FP8）|KV缓存（MLA）|总计|
|---|---|---|---|
|4K tokens|671 GB|0.124 GB|671.1 GB|
|32K tokens|671 GB|0.992 GB|672.0 GB|
|128K tokens|671 GB|3.97 GB|675.0 GB|

可以看出，得益于MLA的极致压缩，即使在128K的超长上下文下，KV Cache的内存占用也仅约4GB，远小于模型权重本身。这使得DeepSeek V3能够在较少的GPU上支持极长的上下文窗口。

需要注意的是，上表中的671GB权重是指未量化的FP16/BF16权重。在实际部署中，DeepSeek V3的权重通常以FP8格式存储和加载，可以将权重内存需求降至约336GB，进一步提升部署效率。

### 内存优化技术

#### Quantization

降低精度可以显著减少内存占用：

|精度|7B模型|减少倍数|
|---|---|---|
|FP16|14 GB|1× (baseline)|
|INT8|7 GB|2×|
|INT4|3.5 GB|4×|

**表3：量化后的权重内存**

对于超大规模MoE模型如DeepSeek V3，量化技术尤为重要：

|精度|DeepSeek V3 (671B)|激活参数(37B)|减少倍数|
|---|---|---|---|
|FP16|1342 GB|74 GB|1× (baseline)|
|FP8|671 GB|37 GB|2×|
|INT8|671 GB|37 GB|2×|
|INT4|336 GB|18.5 GB|4×|

值得注意的是，虽然模型总参数达到671B，但得益于MoE的稀疏激活特性，每次推理实际只需要加载和计算37B的激活参数。这使得即使是如此庞大的模型，通过合适的量化策略，也能在相对有限的硬件资源上部署。

DeepSeek V3在训练时就采用了FP8混合精度，使得模型从训练阶段就适应了低精度表示，因此在推理时使用FP8几乎不会造成性能损失。这种"量化感知训练"（Quantization-Aware Training）的方式是未来大规模模型训练的重要趋势。

#### Grouped-Query Attention

对于LLaMA 2 70B模型，其中 $n_h = 64$ 且 $n_{\text{kv}} = 8$：

$$
r = \frac{8}{64} = \frac{1}{8} \quad (53)
$$

这表示可以减少 KVCache 8 倍的显存占用。

#### Multi-head Latent Attention

MLA相比GQA实现了更激进的压缩。以DeepSeek V3为例，MLA的内存节省不仅来自压缩本身，还来自减少的内存带宽需求。在长上下文生成场景下，内存带宽往往比内存容量更成为瓶颈。MLA通过存储和传输更小的潜在向量，使得每个token生成所需的内存读取量大幅减少。

具体而言，对于DeepSeek V3：

- 标准MHA需要读取：$2 \times L \times 7168$ 个浮点数（Key和Value）
- MLA仅需读取：$L \times 512$ 个浮点数（压缩潜在向量）

这意味着在128K上下文下，MLA的内存读取量仅为MHA的1/28，显著提升了在内存带宽受限场景下的推理速度。

#### Gradient Checkpoint

通过在反向传播期间重新计算激活值来实现**计算换取内存**：

$$
M_{\text{act}}^{\text{checkpoint}} \approx \sqrt{n_{\text{layers}}} \times M_{\text{act}}^{\text{standard}} \quad (54)
$$

对于32层：约5.6倍的内存减少。

对于DeepSeek V3的61层模型：

$$
M_{\text{act}}^{\text{checkpoint}} \approx \sqrt{61} \times M_{\text{act}}^{\text{standard}} \approx 7.8 \times M_{\text{act}}^{\text{standard}} \quad (54.1)
$$

这意味着约7.8倍的激活值内存减少。在训练超大规模MoE模型时，gradient checkpoint是必不可少的优化技术。DeepSeek V3采用了选择性gradient checkpoint策略，在计算密集的注意力层和FFN层之间权衡重计算开销和内存节省。

#### ZeRO Optimizer

ZeRO优化器通过在多个GPU之间分布优化器状态、梯度和模型参数来减少每个GPU的内存占用：

- **ZeRO-1**：分割优化器状态 → 每个GPU占用 $4N + 2N + 8N/P = (6N + 8N/P)$
- **ZeRO-2**：分割梯度和优化器 → 每个GPU占用 $4N + (2N + 8N)/P$
- **ZeRO-3**：分割所有内容 → 每个GPU占用 $(4N + 2N + 8N)/P = 14N/P$

其中 $P$ 是数据并行的GPU数量。

需要注意的是，这里的分析假设使用数据并行。在实际的大规模训练中，通常会结合流水线并行（PP）和张量并行（TP）或专家并行（EP），每种并行策略会影响内存分布。

DeepSeek V3使用ZeRO-1，这意味着：

- 每个数据并行rank存储完整的模型权重和梯度
- 优化器状态在数据并行ranks之间分片
- 结合16-way PP和64-way EP，使得每个GPU的实际内存占用大幅降低

#### MoE-specific Optimizations


> [!info]- MoE 特定的内存优化策略
> 除了上述通用优化技术，MoE模型还有一些特定的内存优化策略：
> 
> 
> 
> **专家并行（Expert Parallelism）**：将不同的专家分布到不同的GPU上，每个GPU只需存储部分专家的参数。对于DeepSeek V3，256个路由专家均匀分布在64个GPU上（每个GPU 4个专家），大幅降低了单GPU的内存压力。
> 
> 
> **节点受限路由（Node-limited Routing）**：限制每个token最多被路由到M个节点（DeepSeek V3中M=4），减少跨节点通信开销。这种策略在保持模型性能的同时显著提升了训练和推理效率。
> 
> 
> **专家缓存（Expert Caching）**：在推理时，某些专家的激活频率远高于其他专家。通过识别和缓存这些"热门"专家，可以减少专家加载的延迟和内存交换次数。
> 
> 
> **负载均衡优化**：DeepSeek V3采用了创新的无辅助损失（auxiliary-loss-free）负载均衡策略，通过动态调整门控偏置（gating bias）来平衡专家负载，避免了传统辅助损失可能带来的性能下降。这种方法不仅提升了模型质量，还减少了因负载不均导致的内存碎片和计算资源浪费。
> 

## 3. 模型参数量的估算

对于词表大小为 $V$ 的Transformer decoder：

$$
N = N_{\text{embed}} + N_{\text{layers}} + N_{\text{output}} \quad (55)
$$

### Embedding Layer

$$
N_{\text{embed}} = V \times d \quad (56)
$$

### Transformer Layer

#### Dense Layer

对于每一层：

$$
N_{\text{layer}} = N_{\text{attn}} + N_{\text{FFN}} \quad (57)
= (4d^2) + (8d^2) \quad (58)
= 12d^2 \quad (59)
$$

其中：

- 注意力机制：$4d^2$（Q、K、V、输出投影）
- FFN：$8d^2$（两个线性层，中间层为$4d$）

所有dense层的总和：

$$
N_{\text{dense}} = 12n_{\text{dense}}d^2 \quad (60)
$$

#### MoE Layer

对于每个MoE层，参数包括：

- 注意力机制：$4d^2$（与dense层相同）
- 共享专家：$2d \times d_{\text{expert}} + 2d_{\text{expert}} \times d = 4d \times d_{\text{expert}}$
- 路由专家：$E \times 4d \times d_{\text{expert}}$（E是专家数量）
- 门控网络：$d \times E$（通常可忽略）

$$
N_{\text{MoE\_layer}} = 4d^2 + 4d \times d_{\text{expert}} \times (1 + E) \quad (60.1)
$$

#### MLA Parameter Count

对于使用MLA的注意力层，参数量略有不同：

- Q投影（包含压缩）：$d \times d'_c$（其中$d'_c$是query压缩维度）
- KV压缩：$d \times d_c$
- K和V解压：$2 \times d_c \times d$
- 输出投影：$d \times d$
- RoPE相关的额外投影：$d \times d^R_h \times n_h$（解耦RoPE）

总体而言，MLA的参数量与标准MHA相当，但由于压缩机制的引入，实际参数分布有所不同。

### Output Layer

$$
N_{\text{output}} = V \times d \quad (61)
$$

### Total Parameters

#### Dense Model

$$
N = 2Vd + 12n_{\text{layers}}d^2 \quad (62)
$$

对于 $12n_{\text{layers}}d^2 \gg 2Vd$ 的大模型（即层数非常多的 LLM）：

$$
\boxed{N \approx 12n_{\text{layers}}d^2} \quad (63)
$$

#### MoE Model

对于混合架构（部分dense，部分MoE）：

$$
N_{\text{total}} = 2Vd + 12n_{\text{dense}}d^2 + n_{\text{MoE}} \times [4d^2 + 4d \times d_{\text{expert}} \times (1 + E)] \quad (63.1)
$$

### DeepSeek V3参数量详细计算

现在让我们详细计算DeepSeek V3的671B总参数和37B激活参数是如何得出的。

**DeepSeek V3的架构配置：**

- 总层数：$n_{\text{layers}} = 61$
- Dense FFN层：前3层
- MoE层：后58层
- 模型维度：$d = 7168$
- 注意力头数：$n_h = 128$
- 每头维度：$d_h = 128$
- MLA KV压缩维度：$d_c = 512$
- MLA Query压缩维度：$d'_c = 1536$
- 词表大小：$V = 128000$
- 路由专家数量：$E = 256$
- 共享专家数量：1
- 每个token激活的专家数：$k = 8$
- 专家中间维度：$d_{\text{expert}} = 2048$

#### 总参数量计算（精确推导）

**1. MLA Attention 参数（每层）**

MLA Attention 的参数包括：
- Q 投影：$d \times d$
- K/V 压缩投影：$d \times d_c$
- 输出投影：$d \times d$

$$
N_{\text{attn/layer}} \approx 2d^2 + d \cdot d_c \quad (63.2)
$$

代入 $d=7168$，$d_c=512$：

$$
N_{\text{attn/layer}} \approx 2 \times 7168^2 + 7168 \times 512 \approx 106 \times 10^6 \quad (63.3)
$$

所有 61 层的注意力参数：

$$
N_{\text{attn\_total}} = 61 \times 106 \times 10^6 \approx 6.5 \times 10^9 \quad (63.4)
$$

**2. MoE FFN（SwiGLU）参数**

每个 expert 使用 SwiGLU 激活，包含三个投影矩阵：
- $W_1: d \times d_{ff}$
- $W_2: d \times d_{ff}$
- $W_3: d_{ff} \times d$

$$
N_{\text{expert}} = 3 d \cdot d_{ff} \quad (63.5)
$$

代入 $d=7168$，$d_{ff}=2048$：

$$
N_{\text{expert}} = 3 \times 7168 \times 2048 \approx 44 \times 10^6 \quad (63.6)
$$

全量 MoE FFN 参数（61 层，每层 256 个 experts）：

$$
N_{\text{MoE\_FFN}} = 44 \times 10^6 \times 256 \times 61 \approx 687 \times 10^9 \quad (63.7)
$$

**3. Embedding + LM Head**

词表嵌入和输出头（通常共享）：

$$
N_{\text{embed+head}} \approx 10 \times 10^9 \quad (63.8)
$$

**4. 总参数量**

$$
N_{\text{total}} = N_{\text{MoE\_FFN}} + N_{\text{attn\_total}} + N_{\text{embed+head}} \quad (63.9)
$$

$$
\boxed{N_{\text{total}} = 687 + 6.5 + 10 \approx 704 \times 10^9} \quad (63.10)
$$

> [!note] 与官方数据对比
> 官方公布的总参数量为 ~671B，我们的估算为 704B，在同一量级。差异来源于：
> - 实际的 $d_{ff}$ 或 expert 共享策略可能略有不同
> - Embedding / LM Head 的共享方式
> - 部分专家层可能并非严格的 MoE（例如前几层可能是 dense FFN）
> - LayerNorm 等辅助组件参数
>
> 该估算的量级和结构正确，主要用于理解 FLOPs 和内存需求。

#### 激活参数量计算

**激活参数**是指每个 token 在前向传播时实际参与计算的参数量。对于 MoE 模型，每个 token 仅激活 $k=8$ 个 experts。

**1. MoE FFN 激活参数（每层）**

$$
N_{\text{FFN,active/layer}} = N_{\text{expert}} \times k = 44 \times 10^6 \times 8 \approx 352 \times 10^6 \quad (63.11)
$$

61 层总计：

$$
N_{\text{FFN,active}} = 352 \times 10^6 \times 61 \approx 21.5 \times 10^9 \quad (63.12)
$$

**2. Attention 激活参数（全部）**

所有 token 共享同一套注意力参数，全部激活：

$$
N_{\text{attn\_active}} \approx 6.5 \times 10^9 \quad (63.13)
$$

**3. 总激活参数量**

$$
N_{\text{active}} = N_{\text{FFN,active}} + N_{\text{attn\_active}} \quad (63.14)
$$

$$
\boxed{N_{\text{active}} = 21.5 + 6.5 \approx 28 \times 10^9 \approx 30 \times 10^9} \quad (63.15)
$$

> [!important] 激活参数是 FLOPs 计算的真实基数
> DeepSeek V3 的激活参数约为 **30B**，这才是推理与训练 FLOPs 的真实基数：
> - 推理 FLOPs: $\approx 2 \times 30 \times 10^9 \times L = 60 \times 10^9 \times L$
> - 训练 FLOPs: $\approx 6 \times 30 \times 10^9 \times L = 180 \times 10^9 \times L$
>
> 官方公布的激活参数为 ~37B，我们的估算为 30B，在合理范围内。差异可能来自：
> - Embedding 层在某些计数中被包含
> - 共享专家（shared experts）的激活策略
> - LayerNorm 等辅助组件的计入方式

### Example

**LLaMA 2 7B：**

- $n_{\text{layers}} = 32$
- $d = 4096$
- $V = 32000$

$$
N \approx 12 \times 32 \times 4096^2 + 2 \times 32000 \times 4096 \quad (64)
\approx 6.44 \times 10^9 + 0.26 \times 10^9 \quad (65)
\approx 6.7 \times 10^9 \approx 6.7\text{B} \quad (66)
$$

接近官方声称的7B参数！

## 4. Transformer层堆叠、训练推理流程与并行策略

### Transformer的层堆叠结构

是的，DeepSeek V3正是基于经典Transformer decoder结构进行层堆叠构建的。让我们详细理解这个架构的工作原理。

#### 单层Transformer Decoder

一个标准的Transformer decoder层包含以下组件：

1. **自注意力机制（Self-Attention）**：允许模型关注输入序列中的不同位置
2. **前馈网络（FFN）**：对每个位置的表示进行非线性变换
3. **层归一化（Layer Normalization）**：稳定训练过程
4. **残差连接（Residual Connections）**：帮助梯度流动

对于输入 $\mathbf{x}_{\text{in}} \in \mathbb{R}^{L \times d}$（$L$ 个token，每个维度为 $d$），单层的计算流程为：

$$
\mathbf{x}_1 = \mathbf{x}_{\text{in}} + \text{SelfAttention}(\text{LayerNorm}(\mathbf{x}_{\text{in}})) \quad (75)
$$

$$
\mathbf{x}_{\text{out}} = \mathbf{x}_1 + \text{FFN}(\text{LayerNorm}(\mathbf{x}_1)) \quad (76)
$$

这里的 $\mathbf{x}_{\text{out}}$ 就成为下一层的输入。

#### 多层堆叠

DeepSeek V3的61层结构意味着上述计算流程要重复61次。每一层都对输入进行一次转换，逐步将原始的token embedding转化为更高层次的语义表示。我们可以将整个模型看作一个函数组合：

$$
\mathbf{h}_{61} = f_{61}(f_{60}(...f_2(f_1(\mathbf{h}_0))...)) \quad (77)
$$

其中：

- $\mathbf{h}_0$ 是embedding层的输出（将token ID转换为向量）
- $f_i$ 表示第 $i$ 层的变换
- $\mathbf{h}_{61}$ 是最后一层的输出，将被送入输出层（output head）预测下一个token

**关键理解**：每一层都在前一层的基础上进行信息处理。浅层通常学习基本的词法和句法特征，而深层则捕获更抽象的语义和推理模式。这种层次化的表示学习是Transformer强大能力的来源。

### 训练时的前向传播和反向传播

#### 前向传播流程

在训练的每个iteration中，一个批次的数据确实需要完整地遍历所有61层。让我们追踪一个具体的例子：

假设我们有一个训练样本："The cat sat on the mat"，目标是预测下一个token。

**步骤1：Token Embedding**

$$
[\text{The}] \rightarrow \mathbf{e}_1 \in \mathbb{R}^d
[\text{cat}] \rightarrow \mathbf{e}_2 \in \mathbb{R}^d
...
$$

得到初始表示矩阵 $\mathbf{H}_0 \in \mathbb{R}^{L \times d}$。

**步骤2：逐层处理**

```
Layer 1 (Dense FFN):
  输入: H_0 → 自注意力 → FFN → 输出: H_1
  
Layer 2 (Dense FFN):
  输入: H_1 → 自注意力 → FFN → 输出: H_2
  
Layer 3 (Dense FFN):
  输入: H_2 → 自注意力 → FFN → 输出: H_3
  
Layer 4 (MoE):
  输入: H_3 → 自注意力 → 路由到8个专家 → 输出: H_4
  
...（继续到Layer 61）

Layer 61 (MoE):
  输入: H_60 → 自注意力 → 路由到8个专家 → 输出: H_61
```

**步骤3：输出层**

最后一层的输出 $\mathbf{H}_{61}$ 被送入输出头（一个线性层），将向量映射到词表大小的logits：

$$
\text{logits} = \mathbf{H}_{61}\mathbf{W}_{\text{output}} \in \mathbb{R}^{L \times V} \quad (78)
$$

其中 $V$ 是词表大小（DeepSeek V3为128K）。

**步骤4：计算损失**

对于每个位置，我们使用交叉熵损失比较预测的概率分布和真实的下一个token：

$$
\mathcal{L} = -\sum_{i=1}^{L-1} \log P(x_{i+1} | x_1, ..., x_i) \quad (79)
$$

这里的关键是：在位置 $i$，模型预测的是位置 $i+1$ 的token。这就是所谓的**因果语言建模**（Causal Language Modeling）。

#### 反向传播流程

计算出损失后，反向传播沿着与前向传播相反的方向进行：

```
损失 L → 
  ↓ (计算 ∂L/∂H_61)
Layer 61反向传播 ← H_61的梯度
  ↓ (计算 ∂L/∂H_60)
Layer 60反向传播 ← H_60的梯度
  ↓
... (继续到Layer 1)
  ↓
Layer 1反向传播 ← H_1的梯度
  ↓
Embedding层更新
```

在每一层的反向传播中，我们计算：

1. **该层输出对损失的梯度**（从上一层传回来）
2. **该层参数的梯度**（通过链式法则）
3. **该层输入的梯度**（传递给下一层）

对于MoE层，只有被激活的专家才会接收到梯度并更新参数。这就是为什么虽然每个iteration所有层都参与了计算，但MoE模型的计算成本仍然只与激活参数成正比。

**关键理解**：训练时的一个完整iteration包括：

- 前向传播：数据从Layer 1流向Layer 61
- 损失计算：比较预测和真实目标
- 反向传播：梯度从Layer 61流回Layer 1
- 参数更新：使用计算出的梯度更新所有层的参数

### 推理时的工作流程

推理（生成）时的情况有所不同，但每一层仍然发挥着关键作用。让我们理解为什么必须经过所有61层。

#### 自回归生成过程

假设我们有一个prompt："请写一首关于春天的诗"，模型需要逐token生成回答。

**第一步：处理prompt**

Prompt中的所有token一起经过61层的前向传播：

```
输入: ["请", "写", "一", "首", "关", "于", "春", "天", "的", "诗"]
  ↓
Layer 1 → Layer 2 → ... → Layer 61
  ↓
输出: H_61 ∈ R^{10 × d}  (10个token的最终表示)
```

取最后一个token位置（"诗"）的表示，通过输出头预测下一个token：

```
H_61[9, :] → Output Head → Logits → Sample → 第1个生成token: "春"
```

**第二步：生成第一个token后**

现在输入变成了：["请", "写", ..., "诗", "春"]

这11个token再次完整地经过61层：

```
Layer 1: 处理这11个token的关系
Layer 2: 在Layer 1的基础上进一步抽象
...
Layer 61: 得到最高层的语义表示
```

取第11个token位置的表示预测下一个token："风"

**重复这个过程**直到生成结束标记或达到最大长度。

#### 为什么必须经过所有层？

每一层都在执行不可或缺的功能：

**浅层（Layer 1-10）**：

- 学习基本的词法特征
- 识别词性和简单的语法结构
- 建立局部的上下文关联
- 例如：识别"春天"是一个名词短语，"写诗"是一个动词结构

**中层（Layer 11-40）**：

- 学习句法结构和语义关系
- 理解长距离依赖
- 建立主题和意图的表示
- 例如：理解整个句子是一个请求，主题是关于春天的诗歌创作

**深层（Layer 41-61）**：

- 学习抽象的语义和推理模式
- 进行复杂的知识组合
- 生成连贯的输出计划
- 例如：组合关于春天的知识、诗歌的结构特点，计划如何回答

**跳过任何一层的后果**：

如果我们尝试跳过某些层，比如直接从Layer 30跳到Layer 50：

- 中间层学习到的特征表示会丢失
- 后续层期望的输入分布会不匹配
- 最终的预测质量会严重下降

这就像建造一座大楼，你不能跳过中间的楼层直接建顶层——每一层都依赖于下面层提供的稳定基础。

#### KV Cache的作用

值得注意的是，虽然每次生成都要经过61层，但通过KV Cache技术，我们可以避免重复计算已经生成的token：

```
第1次生成时（10个prompt tokens）:
  - 计算并缓存所有10个token在所有61层的Key和Value
  
第2次生成时（11个tokens = 10个prompt + 1个新生成）:
  - 从缓存读取前10个token的KV
  - 只计算第11个token的KV
  - 大幅减少计算量
```

这就是为什么推理时KV Cache如此重要——它避免了对历史token的重复计算，但所有新生成的token仍然必须完整地经过所有61层。

### Pipeline Parallelism (PP) 详解

现在让我们理解将不同层分布式存储在不同GPU上的并行策略——这正是Pipeline Parallelism（流水线并行）。

#### PP的基本思想

流水线并行将模型的不同层分配到不同的GPU上。对于DeepSeek V3的16-way PP，61层被分成16个stage（阶段），每个stage包含大约3-4层。

**分配示例**：

```
GPU 0 (Stage 0):  Layer 1-4    (Embedding + 前几层)
GPU 1 (Stage 1):  Layer 5-8
GPU 2 (Stage 2):  Layer 9-12
...
GPU 15 (Stage 15): Layer 58-61  (最后几层 + Output Head)
```

#### 前向传播的流水线执行

让我们看一个简化的例子，假设我们有4个micro-batch（M1, M2, M3, M4）和4个stage：

```
时间步1:
  Stage 0: 处理 M1
  Stage 1: 空闲
  Stage 2: 空闲
  Stage 3: 空闲

时间步2:
  Stage 0: 处理 M2
  Stage 1: 处理 M1 (从Stage 0接收)
  Stage 2: 空闲
  Stage 3: 空闲

时间步3:
  Stage 0: 处理 M3
  Stage 1: 处理 M2
  Stage 2: 处理 M1 (从Stage 1接收)
  Stage 3: 空闲

时间步4:
  Stage 0: 处理 M4
  Stage 1: 处理 M3
  Stage 2: 处理 M2
  Stage 3: 处理 M1 (从Stage 2接收)
  
时间步5:
  Stage 0: 空闲
  Stage 1: 处理 M4
  Stage 2: 处理 M3
  Stage 3: 处理 M2

...继续直到所有micro-batch完成
```

可以看到，在稳定阶段（时间步4），所有GPU都在工作，只是处理不同的micro-batch。这就是"流水线"名称的由来——就像工厂流水线一样，每个工位处理不同的产品。

#### Bubble问题

但这个策略有一个问题：在开始和结束阶段，不是所有GPU都在工作（如时间步1-3和后面的阶段）。这些空闲时间被称为"bubble"（气泡），会降低GPU利用率。

**气泡时间占比**：

$$
\text{Bubble ratio} = \frac{(P-1)}{M} \quad (80)
$$

其中 $P$ 是pipeline stage数量，$M$ 是micro-batch数量。

对于DeepSeek V3（$P=16$），如果使用 $M=64$ 个micro-batch：

$$
\text{Bubble ratio} = \frac{15}{64} \approx 23\% \quad (81)
$$

这意味着约23%的时间GPU处于空闲状态。为了降低这个比例，可以：

1. 增加micro-batch数量（但会增加内存占用）
2. 使用更先进的流水线调度策略

#### DualPipe：DeepSeek V3的优化

DeepSeek V3采用了DualPipe技术来进一步优化流水线效率。基本思想是将前向传播和反向传播的通信与计算重叠：

```
传统方式:
  计算 → 等待 → 通信 → 等待 → 计算

DualPipe:
  计算的同时进行通信
  前向传播的通信与反向传播的计算重叠
```

通过精心设计的调度和通信优化，DualPipe实现了接近完全的计算-通信重叠，大幅降低了气泡时间的影响。

#### PP与其他并行策略的结合

在DeepSeek V3的实际训练中，PP与其他并行策略协同工作：

**16-way PP × 64-way EP × 2-way DP = 2048 GPUs**

具体工作方式：

1. **Pipeline Parallelism (16-way)**：将61层分成16个stage
2. **Expert Parallelism (64-way)**：在每个stage内，256个专家分布在64个GPU上
3. **Data Parallelism (2-way)**：整个模型有2个副本并行处理不同的数据

**内存分布**：

- 每个GPU存储：约4层的注意力参数 + 约4个专家的参数
- 通过ZeRO-1，优化器状态在2个DP ranks之间分片

**数据流动**：

```
输入数据 → 
  DP Rank 0:
    Stage 0 (GPU 0-63): Layer 1-4, 每个GPU存储4个专家
      → 将激活值发送到 Stage 1
    Stage 1 (GPU 64-127): Layer 5-8
      → 将激活值发送到 Stage 2
    ...
    Stage 15 (GPU 960-1023): Layer 58-61
      → 输出预测
      
  DP Rank 1: (同样的结构，处理不同的数据)
    Stage 0 (GPU 1024-1087)
    ...
```

#### PP的优势和挑战

**优势**：

1. **内存效率**：每个GPU只需存储部分层，可以训练非常深的模型
2. **通信模式简单**：只需要相邻stage之间的点对点通信
3. **易于实现**：相比其他并行策略，实现相对直观

**挑战**：

1. **气泡开销**：需要仔细调整micro-batch数量
2. **负载均衡**：不同层的计算量可能不同，需要精心划分stage
3. **激活值内存**：需要存储中间激活值用于反向传播

对于DeepSeek V3这样的超大规模模型，PP是不可或缺的并行策略，它与EP和DP的组合使得在2048个GPU上高效训练671B参数的模型成为可能。

### 推理时的混合并行策略

推理阶段的并行策略与训练有着根本性的不同。训练时我们追求最大化训练吞吐量（tokens/second），可以容忍一定的延迟；但推理时，特别是在线服务场景，我们必须最小化两个关键指标：

1. **TTFT (Time To First Token)**：从用户发送请求到接收第一个生成token的时间
2. **TBT (Time Between Tokens)**：后续token之间的生成间隔

正是这些目标的差异，导致了完全不同的并行策略选择。

#### 为什么推理不使用Pipeline Parallelism？

Pipeline Parallelism在训练时是理想的选择，但在推理时存在致命的缺陷：

**串行延迟问题**：

在PP中，一个token必须依次经过所有stage才能得到输出。以16-way PP为例：

```
Token通过流水线的时间:
  Stage 0 (10ms) → 通信 (2ms) → 
  Stage 1 (10ms) → 通信 (2ms) → 
  ...
  Stage 15 (10ms)
  
总延迟 = 16×10ms + 15×2ms = 190ms
```

这190ms的延迟对于在线服务是不可接受的。更糟的是，在Decoding阶段每生成一个token都要重复这个过程，用户会感受到明显的卡顿。

**气泡浪费问题**：

对于单个请求或小批次，流水线中的大部分stage都处于空闲状态。只有在处理大量并发请求时，PP才能充分利用所有GPU。但大批次会显著增加每个用户的等待时间，这与低延迟的目标相悖。

**内存浪费问题**：

PP需要存储中间激活值用于反向传播。虽然推理不需要反向传播，但仍需要保存每个stage的输出传递给下一个stage，这在长上下文场景下会占用大量内存。

因此，推理时我们需要一种能够让所有层并行计算、最小化层间通信延迟的策略——这就是Tensor Parallelism及其组合。

#### Tensor Parallelism (TP) 详解

Tensor Parallelism的核心思想是将单层内部的参数矩阵切分到多个GPU上，让同一层的计算在多个GPU上并行进行。

**TP的基本原理**：

以一个线性层 $\mathbf{Y} = \mathbf{X}\mathbf{W}$ 为例，其中 $\mathbf{X} \in \mathbb{R}^{L \times d_{\text{in}}}$，$\mathbf{W} \in \mathbb{R}^{d_{\text{in}} \times d_{\text{out}}}$。

**列切分（Column Parallel）**：

将权重矩阵 $\mathbf{W}$ 沿输出维度切分成 $P$ 份：

$$
\mathbf{W} = [\mathbf{W}_1 | \mathbf{W}_2 | ... | \mathbf{W}_P]
$$

每个GPU $i$ 计算：

$$
\mathbf{Y}_i = \mathbf{X}\mathbf{W}_i \quad (82)
$$

最终通过All-Gather操作将结果拼接：

$$
\mathbf{Y} = [\mathbf{Y}_1 | \mathbf{Y}_2 | ... | \mathbf{Y}_P] \quad (83)
$$

**行切分（Row Parallel）**：

将权重矩阵 $\mathbf{W}$ 沿输入维度切分：

$$
\mathbf{W} = \begin{bmatrix} \mathbf{W}_1 \ \mathbf{W}_2 \ ... \ \mathbf{W}_P \end{bmatrix}
$$

同时将输入 $\mathbf{X}$ 也沿特征维度切分。每个GPU $i$ 计算：

$$
\mathbf{Y}_i = \mathbf{X}_i\mathbf{W}_i \quad (84)
$$

最终通过All-Reduce操作求和：

$$
\mathbf{Y} = \sum_{i=1}^{P} \mathbf{Y}_i \quad (85)
$$

**Transformer层的TP实现**：

对于一个完整的Transformer层，TP的切分策略如下：

```
Self-Attention部分:
  QKV投影: 列切分 (输出维度d → d/P per GPU)
    - GPU 0: 计算前d/P维的Q, K, V
    - GPU 1: 计算接下来d/P维的Q, K, V
    - ...
    - GPU P-1: 计算最后d/P维的Q, K, V
    
  注意力计算: 每个GPU独立计算其头的注意力
    - 无需通信，完全并行
    
  输出投影: 行切分 (输入维度d → d/P per GPU)
    - 需要All-Reduce聚合结果

FFN部分:
  第一个线性层: 列切分 (d → d_ff/P per GPU)
  激活函数: 每个GPU独立应用
  第二个线性层: 行切分 (d_ff → d per GPU)
    - All-Reduce聚合
```

**关键优势**：

1. **无串行等待**：所有层的计算都是并行的，没有像PP那样的层间等待
2. **通信简单**：只需要少量的All-Reduce和All-Gather操作
3. **负载均衡**：每个GPU的计算量完全相同

**通信开销**：

对于TP-4（4个GPU），每一层需要2次集合通信：

- 注意力层：1次All-Reduce（输出投影后）
- FFN层：1次All-Reduce（第二个线性层后）

总通信量：$2 \times d \times b_s \times L$ 字节 per layer

在NVLink的高带宽下（400-900 GB/s），这个通信开销相对较小，通常在1-2ms range。

#### Sequence Parallelism (SP) 详解

Sequence Parallelism是对Tensor Parallelism的补充，专门用于处理长序列。

**SP的动机**：

在TP中，虽然参数被切分了，但激活值（特别是在LayerNorm等非张量并行区域）仍然在每个GPU上完整存储。对于长序列（如128K tokens），激活值的内存占用可能非常大：

$$
M_{\text{act}} \approx b_s \times L \times n_{\text{layers}} \times d \times b_p
$$

对于 $L=128K$，$d=7168$，$b_s=1$，$n_{\text{layers}}=61$，FP16精度：

$$
M_{\text{act}} \approx 1 \times 128000 \times 61 \times 7168 \times 2 \approx 110 \text{ GB}
$$

这在单个GPU上是难以承受的。

**SP的原理**：

Sequence Parallelism将序列长度维度 $L$ 切分到多个GPU上：

```
输入序列 X ∈ R^{L × d}:
  GPU 0: X[0:L/P, :]     (前L/P个tokens)
  GPU 1: X[L/P:2L/P, :]  (接下来L/P个tokens)
  ...
  GPU P-1: X[(P-1)L/P:L, :] (最后L/P个tokens)
```

**SP与TP的配合**：

SP通常与TP配合使用，因为它们操作的是不同的维度：

- TP切分特征维度（d）
- SP切分序列维度（L）

在TP已经切分参数的基础上，SP进一步切分激活值：

```
在LayerNorm、Dropout等区域:
  - 每个GPU只处理L/P个tokens
  - 激活值内存减少P倍
  
在注意力计算中:
  - 需要All-to-All通信来重新分布数据
  - 因为注意力需要看到全局的序列信息
```

**SP的通信模式**：

```
LayerNorm (SP) → 
  All-to-All (切换分布方式) → 
Attention (TP) → 
  All-to-All (切换回SP) → 
LayerNorm (SP) →
  ...
```

每层需要2次All-to-All通信，但换来的是激活值内存的显著减少，这对于长上下文是关键的权衡。

#### Data Parallelism (DP) 在推理中的作用

在推理场景中，Data Parallelism的含义与训练时略有不同——它主要用于处理不同的用户请求。

**Prefill阶段的DP8**：

Prefill阶段处理用户的完整prompt，是计算密集型的：

- 需要计算所有prompt tokens的注意力（$O(L^2d)$ 复杂度）
- GPU的计算能力是瓶颈，而非内存带宽

使用DP8意味着有8个模型副本（每个副本使用TP4+SP+EP32），可以同时处理8个不同的用户请求。

**Decoding阶段的DP80**：

Decoding阶段逐token生成，每次只生成1个新token：

- 计算量小（只计算1个token与历史的注意力）
- 但需要从内存加载整个KV Cache
- 内存带宽成为瓶颈

为什么增加到DP80？因为：

1. **吞吐量优先**：单个请求的Decoding阶段GPU利用率低，通过大批次提高整体吞吐量
2. **内存带宽均摊**：虽然每个请求都受内存带宽限制，但处理80个请求的总吞吐量比处理8个要高得多
3. **服务多用户**：在线服务通常有大量并发用户，DP80可以让更多用户同时获得响应

**DP配置的权衡**：

```
DP8 (Prefill):
  - 同时处理8个prompt
  - 每个prompt可能很长（如32K tokens）
  - 计算密集，需要更多GPU资源
  
DP80 (Decoding):
  - 同时为80个用户生成
  - 每次只生成1个token
  - 内存带宽受限，用大批次摊销
```

#### Expert Parallelism (EP) 在推理中的特殊性

对于MoE模型，Expert Parallelism是不可或缺的，但其配置在Prefill和Decoding阶段也有显著差异。

**EP32 (Prefill阶段)**：

256个路由专家分布在32个GPU上，每个GPU存储8个专家。

为什么是EP32而不是更多？

1. **专家激活模式**：每个token激活8个专家，在Prefill的大批次下，32个GPU通常足以覆盖大部分被激活的专家
2. **通信开销**：EP越大，跨GPU的专家路由通信越多，需要平衡
3. **与TP/DP的配合**：总GPU数 = TP × DP × EP = 4 × 8 × 32 = 1024个GPU

**EP320 (Decoding阶段)**：

256个路由专家分布在320个GPU上，平均每个GPU存储约0.8个专家（实际是不均匀分布）。

这个配置看似奇怪（专家少于GPU？），实际上反映了Decoding阶段的特殊需求：

**专家缓存策略**：

并非所有256个专家都均匀重要。根据DeepSeek的观察，某些专家（"热门专家"）被激活的频率远高于其他专家。EP320的配置允许：

1. **热门专家复制**：将最常用的专家复制到多个GPU上
    
    ```
    专家3（高频）: 复制到GPU 0, 8, 16, 24, ...（10个副本）
    专家17（高频）: 复制到GPU 1, 9, 17, 25, ...（10个副本）
    专家142（低频）: 只在GPU 300存储（1个副本）
    ```
    
2. **负载均衡**：避免某些GPU因存储热门专家而过载
    
3. **降低通信**：当多个请求需要同一个热门专家时，可以就近访问副本
    

**动态路由优化**：

```
请求A需要专家[3, 7, 15, 23, 89, 127, 203, 251]:
  - 专家3: 访问本地副本（0ms延迟）
  - 专家7: 访问邻近GPU副本（0.5ms延迟）
  - 专家89: 访问远程GPU（2ms延迟）
  
通过智能调度，平均延迟显著降低
```

**为什么Decoding需要更多EP？**

1. **批次更大**：DP80意味着有80个并发请求，每个请求激活8个专家，理论上可能需要访问多达640个专家实例（考虑到重复激活，实际更少）
2. **延迟敏感**：Decoding阶段对延迟极其敏感，需要尽可能减少跨GPU的专家访问
3. **吞吐量优化**：通过专家复制和智能路由，可以让更多请求并行访问专家，提高整体吞吐量

#### DeepSeek V3的完整推理配置

现在让我们把所有这些并行策略组合起来，理解DeepSeek V3的推理配置。

**Prefill阶段：TP4 + SP + DP8 + EP32**

总GPU数：4 × 8 × 32 = 1024 GPUs

**单个请求的处理**（假设是第一个请求，使用DP组的第0组）：

```
用户Prompt: [32K tokens] → 分布到128个GPU上:

TP维度（4个GPU为一组）:
  GPU 0-3: 处理前8K tokens，每个GPU负责参数的1/4
    - GPU 0: 所有61层的第1/4参数 + 8个专家
    - GPU 1: 所有61层的第2/4参数 + 8个专家  
    - GPU 2: 所有61层的第3/4参数 + 8个专家
    - GPU 3: 所有61层的第4/4参数 + 8个专家
  
  GPU 4-7: 处理接下来8K tokens (同样的参数切分)
  GPU 8-11: 处理接下来8K tokens
  GPU 12-15: 处理最后8K tokens
  
  ...（重复8次，因为EP32）

EP维度（32组，每组16个GPU）:
  组0 (GPU 0-15): 存储专家1-8
  组1 (GPU 16-31): 存储专家9-16
  ...
  组31 (GPU 496-511): 存储专家249-256
  
DP维度（8个副本）:
  副本0: GPU 0-127 (处理请求1)
  副本1: GPU 128-255 (处理请求2)
  ...
  副本7: GPU 896-1023 (处理请求8)
```

**关键点**：每个GPU存储的是：

- 所有61层的参数的1/4（因为TP4）
- 8个特定的专家（256个专家 ÷ 32 = 8个per GPU）

这意味着每个token的计算流程是：

```
Token在Layer 1的处理:
  1. [SP] Token在4个GPU之一（取决于其在序列中的位置）
  2. [TP] 注意力计算: 4个GPU并行计算Q/K/V的不同部分
     - All-Reduce聚合注意力输出
  3. [TP+EP] FFN/MoE计算:
     - 如果是dense层: 4个GPU并行计算FFN的不同部分
     - 如果是MoE层: 路由到8个专家中的某些，可能涉及跨GPU通信
     - All-Reduce聚合FFN输出
  4. 输出传递到Layer 2，重复上述过程

经过61层后得到最终的logits，预测下一个token
```

**Decoding阶段：TP4 + SP + DP80 + EP320**

总GPU数：4 × 80 × 320 = 102,400 GPUs (?)

等等，这个数字似乎不对。让我重新理解DeepSeek的配置。

实际上，TP、DP、EP之间不是完全独立的乘法关系。正确的理解应该是：

**Decoding配置的实际含义**：

- **TP4**：每个模型副本使用4个GPU做张量并行
- **DP80**：有80个批次并行处理
- **EP320**：但EP不是新增的GPU，而是在现有GPU上的专家分布策略调整

更准确的理解是，Decoding阶段重新配置了GPU的职责：

```
可能的配置方式1（推测）:
  总GPU数: 1024 (与Prefill相同)
  - 减少TP组的数量（从256组减少到256组）
  - 增加DP（从8增加到80，每个请求用更少的GPU）
  - 调整专家分布（每个专家有更多副本）

可能的配置方式2（推测）:
  增加GPU到更大规模
  - 专门为Decoding优化的GPU集群
  - 专家高度复制，降低访问延迟
```

不过无论具体配置如何，核心原理是相同的：Decoding阶段牺牲了每个请求的GPU数量，但通过更大的批次和更好的专家分布，提高了整体吞吐量和响应速度。

#### 61层Transformer在混合并行中的位置和作用

在这种混合并行模式下，61层Transformer的处理方式与PP完全不同。让我们对比一下：

**Pipeline Parallelism (训练时)**：

```
Layer 1-4: GPU 0-63
Layer 5-8: GPU 64-127  
...
Layer 58-61: GPU 960-1023

数据流动: 串行，从GPU组到GPU组
```

**Tensor Parallelism (推理时)**：

```
所有61层都在同一组GPU上:
  Layer 1: 分布在GPU 0-3 (TP4)
  Layer 2: 分布在GPU 0-3 (同样的4个GPU)
  ...
  Layer 61: 分布在GPU 0-3 (同样的4个GPU)

数据流动: 并行，61层的计算在同一组GPU上顺序执行，但每层内部是并行的
```

**关键理解**：

1. **参数分布**：每个TP组（4个GPU）都存储所有61层的完整参数，但每层的参数被切分成4份
    
2. **计算流程**：对于一个token：
    
    ```
    在4个GPU上同时进行:
      Layer 1计算 (GPU 0-3并行) → 
      Layer 2计算 (GPU 0-3并行) → 
      ...
      Layer 61计算 (GPU 0-3并行)
    ```
    
3. **层的作用不变**：每一层仍然执行相同的功能（浅层学词法，深层学语义），只是每层的计算被分散到多个GPU上并行执行
    
4. **与SP的配合**：
    
    - 不同的token分布在不同的GPU组上（SP维度）
    - 但每个token都会经历完整的61层处理
    - 只是在不同GPU组上的不同token并行处理

**可视化示例**（简化为8个GPU，TP2×SP2×DP2）：

```
两个请求同时处理 (DP2):

请求1（Token序列: ABCD）:
  Token A在GPU 0-1 (TP2):
    GPU 0: Layer 1-61的左半参数
    GPU 1: Layer 1-61的右半参数
  
  Token B在GPU 2-3 (TP2):  
    GPU 2: Layer 1-61的左半参数
    GPU 3: Layer 1-61的右半参数

请求2（Token序列: WXYZ）:
  Token W在GPU 4-5 (TP2):
    GPU 4: Layer 1-61的左半参数
    GPU 5: Layer 1-61的右半参数
  
  Token X在GPU 6-7 (TP2):
    GPU 6: Layer 1-61的左半参数
    GPU 7: Layer 1-61的右半参数
```

每个token都要经过61层，但是：

- 同一层的计算在2个GPU上并行（TP2）
- 不同token的计算在不同GPU组上并行（SP2）
- 不同请求的计算完全独立并行（DP2）

#### 混合并行配置的权衡考量

选择合适的并行配置需要考虑多个因素：

**TP的权衡**：

- 优点：降低单GPU内存需求，加速单层计算
- 缺点：增加通信开销，TP越大通信越频繁
- 经验法则：TP通常选择4-8，因为NVLink带宽有限

**SP的权衡**：

- 优点：显著减少长序列的激活值内存
- 缺点：需要All-to-All通信，在注意力计算中尤其频繁
- 使用场景：主要在Prefill阶段处理长prompt

**DP的权衡**：

- 优点：线性提升吞吐量，无需跨请求通信
- 缺点：每个副本都占用完整的模型内存
- 配置策略：Prefill小批次（保证低延迟），Decoding大批次（提高吞吐量）

**EP的权衡**：

- 优点：分散MoE的巨大参数量，避免单GPU过载
- 缺点：专家路由可能需要跨GPU通信
- 优化方向：专家复制（热门专家）、智能路由（就近访问）

**Prefill vs Decoding的配置差异**：

|维度|Prefill|Decoding|原因|
|---|---|---|---|
|计算特性|计算密集|内存带宽受限|Prefill处理长序列，Decoding逐token|
|DP|较小(8)|较大(80)|Decoding通过大批次提高吞吐量|
|EP|较小(32)|较大(320)|Decoding需要更低的专家访问延迟|
|TP|相同(4)|相同(4)|单层参数切分策略保持一致|
|SP|重要|次要|Prefill需要处理长序列，Decoding序列长度为1|

这种动态调整并行配置的能力，正是现代LLM推理引擎（如vLLM、TensorRT-LLM）的核心竞争力所在。

### 小结：训练与推理的并行策略对比

让我们总结一下训练和推理在处理61层Transformer时的根本差异：

**训练时（PP+EP+DP）**：

- 目标：最大化训练吞吐量，可以容忍一定延迟
- 层的分布：不同层在不同GPU上（PP），层间串行但可流水线
- 数据流动：批次数据流经所有stage，存在气泡时间
- 内存策略：通过ZeRO分片参数和优化器状态

**推理时（TP+SP+DP+EP）**：

- 目标：最小化TTFT和TBT，优化用户体验
- 层的分布：所有层在同一组GPU上，每层内部参数切分（TP）
- 数据流动：每个token快速经过所有层，层内并行层间串行
- 内存策略：通过TP切分参数，SP切分激活值，KV Cache复用

**61层的一致性**： 无论使用哪种并行策略，61层的功能作用始终不变——每一层都是不可或缺的特征提取器。改变的只是：

- 训练时：层被分配到不同GPU上（空间分布）
- 推理时：层的参数被切分到不同GPU上（参数分布）

这种深入理解对于设计高效的LLM服务系统至关重要。你需要根据实际的负载特征（请求频率、序列长度、并发用户数）动态选择最优的并行配置，在延迟、吞吐量和资源利用率之间找到最佳平衡点。

## 5. 实践配置

### Training Setup Example

**模型：** 13B参数  
**硬件：** 8× NVIDIA A100 80GB GPU  
**配置：**

- 每个GPU的 batch size：2
- 序列长度：2048
- 梯度累积步数：4
- 有效批次大小：$8 \times 2 \times 4 = 64$

**每个GPU的内存：**

$$
M_{\text{model_states}} = \frac{18 \times 13 \times 10^9}{8} = 29.25 \text{ GB} \quad (67)
M_{\text{act}} \approx 2 \times 2048 \times 32 \times 4096 \times 2/10^9 \quad (68)
\approx 1.07 \text{ GB per GPU} \quad (69)
M_{\text{total}} \approx 30.3 \text{ GB per GPU} \quad (70)
$$

这在80GB GPU中可以舒适容纳。

### Large-Scale MoE Training Setup: DeepSeek V3

**模型：** 671B总参数，37B激活参数  
**硬件：** 2048× NVIDIA H800 80GB GPU（分布在256个节点，每节点8个GPU）  
**训练配置：**

- 序列长度：4096 tokens
- 批次大小：逐步从3072增加到15360（前469B tokens）
- 训练tokens：14.8 trillion
- 优化器：AdamW (β₁=0.9, β₂=0.95, weight_decay=0.1)
- 学习率峰值：2.2×10⁻⁴
- 梯度裁剪：1.0
- 精度：FP8混合精度训练

**并行策略详解：**

DeepSeek V3 采用了精心设计的并行策略，详细分析见：[[DeepSeek-V3-Parallel-Strategy-Analysis]]
