---
tags:
  - System4AI
  - 深度学习
  - 混合精度训练
date: 2025-01-11
---

## FP8 混合精度训练框架详解

### 概述

DeepSeek V3 开创性地在超大规模模型（671B 参数）上验证了 FP8 混合精度训练的可行性和有效性。但需要强调的是，FP8 训练并非对所有组件都使用 FP8 精度，而是采用了精心设计的混合精度策略。

### 精度分配策略

根据 DeepSeek V3 的技术报告，以下组件在训练时使用 FP8 精度：

**使用 FP8 的组件**：
- 线性层（Linear layers）的权重和激活值
- FFN 和 MoE 专家网络的前向和反向传播
- 大部分注意力计算中的矩阵乘法

**保持高精度的组件**（BF16 或 FP32）：
- **Embedding 模块**：保持 BF16 精度
- **输出头（Output head）**：保持 BF16 精度
- **MoE 门控模块（Gating modules）**：保持 BF16 精度，因为门控决策对精度敏感
- **归一化算子（Normalization operators）**：如 LayerNorm，保持 FP32 精度以维持数值稳定性
- **注意力算子中的关键部分**：如 softmax 计算，保持 FP32 精度

### FP8 混合精度训练流程

![DeepSeek_v3_report-FP8-framework](https://raw.githubusercontent.com/chestNutLsj/image-cloud/master/blog-vault/Scholar/DeepSeek_v3_report-FP8-framework.png)

#### 1. 前向传播（Fprop）

- 输入从 BF16 量化到 FP8
- 权重从存储的 FP8 格式读取
- 矩阵乘法在 FP8 精度下进行
- 累加器使用 FP32 精度
- 输出反量化到 BF16

#### 2. 反向传播计算梯度（Dgrad）

- 输出梯度从 BF16 量化到 FP8
- 权重保持 FP8
- 计算输入梯度时使用 FP8 矩阵乘法
- 输入梯度反量化到 BF16

#### 3. 反向传播计算权重梯度（Wgrad）

- 输入和输出梯度都量化到 FP8
- 计算权重梯度使用 FP8 矩阵乘法
- 权重梯度累积到 FP32
- 主权重保持 FP32 精度

### 细粒度量化策略

DeepSeek V3 采用了**细粒度（fine-grained）量化**而非粗粒度（coarse-grained）量化：

| 量化方式 | 描述 |
|---------|------|
| 传统方法（粗粒度） | 对整行或整列使用统一的缩放因子 |
| DeepSeek V3（细粒度） | 将矩阵分解为较小的 tile（如 1×128 或 128×128 块），每个 tile 使用独立的缩放因子 |

这种细粒度量化在保持数值精度的同时实现了内存和计算的显著优化。

### FP8 格式选择

DeepSeek V3 使用 **E4M3 格式**（4 位指数，3 位尾数）而非 E5M2 格式：

| 格式 | 优势 | 劣势 |
|-----|------|------|
| E4M3 | 更好的精度 | 动态范围较小 |
| E5M2 | 更大的动态范围 | 精度较低 |

通过细粒度量化和合适的缩放因子管理，E4M3 足以满足训练需求。

### 权重存储

在 FP8 混合精度训练中，权重存储更加复杂：

- 计算权重（FP8）：$N$ 字节
- 主权重（FP32）：$4N$ 字节

总共：
$$
M_{\text{weights}}^{\text{FP8}} = N + 4N = 5N \text{ bytes}
$$

然而，实际实现中，计算权重可以动态量化，不需要额外存储，因此：
$$
M_{\text{weights}}^{\text{FP8}} \approx 4N \text{ bytes (仅主权重)}
$$

### 训练效益

这种混合精度策略使得 FP8 训练在大幅降低内存占用和通信带宽的同时，保持了与 BF16 训练相当的模型质量。

主要优势包括：
1. **激活值内存减半**：
$$
M_{\text{act}}^{\text{FP8}} \approx M_{\text{act}}^{\text{FP16}} / 2
$$

2. **通信带宽需求减半**：梯度和激活值的传输量减少

3. **计算加速**：利用 FP8 Tensor Core 获得 2-3 倍的计算加速

## 参考资料

- [[DeepSeek_V3_Report：Annotation]]
- [[Computing-FLOPs-and-GPU-Memory-Requirements-for-LLMs]]
