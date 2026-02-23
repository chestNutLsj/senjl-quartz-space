---
tags:
  - System4AI
  - 分布式训练
  - 并行策略
  - MoE
date: 2025-01-11
---

## DeepSeek V3 并行策略详解

### 训练配置概览

**模型规模**：
- 总参数量：671B
- 激活参数量：37B
- 训练 tokens：14.8T

**硬件配置**：
- GPU 数量：2048 个 H800 GPU
- 训练耗时：2.788M GPU 小时（含预训练 2.664M + 后训练 0.1M）

### 并行策略组合

DeepSeek V3 采用的并行策略为：

```
16-way Pipeline Parallelism (PP)
    ×
64-way Expert Parallelism (EP) [均匀分布在 8 个节点，每节点 8 个 GPU]
    ×
ZeRO-1 Data Parallelism (DP)
```

**关键说明**：使用的是 **ZeRO-1** 而非 ZeRO-3。

#### ZeRO-1 vs ZeRO-3

| 并行度 | ZeRO-1 | ZeRO-3 |
|--------|--------|--------|
| 权重分片 | ✗（完整副本）| ✓ |
| 梯度分片 | ✗（完整副本）| ✓ |
| 优化器状态分片 | ✓ | ✓ |
| 通信开销 | 低 | 高 |
| 内存节省 | 中等 | 最大 |

ZeRO-1 仅分片优化器状态，而权重和梯度在每个数据并行 rank 都有完整副本，这减少了通信开销。

### 每个 GPU 的内存分配

#### 并行度计算

- PP × EP = 16 × 64 = 1024
- DP 并行度 = 2048 / 1024 = 2

#### 权重内存（FP32 主权重）

$$
M_{\text{weights\_per\_GPU}} = \frac{4 \times 671 \times 10^9}{16 \times 64} \approx 2.6 \text{ GB}
$$

每个 GPU 只存储模型的 1/(16×64) 部分。

#### 梯度内存（FP16）

$$
M_{\text{grad\_per\_GPU}} = \frac{2 \times 671 \times 10^9}{16 \times 64} \approx 1.3 \text{ GB}
$$

#### 优化器状态（ZeRO-1 分片）

在 ZeRO-1 下，优化器状态（Adam 的 $m$ 和 $v$，各 4N 字节）在 DP ranks 之间分片：

$$
M_{\text{opt\_per\_GPU}} = \frac{8 \times 671 \times 10^9}{16 \times 64 \times 2} \approx 2.6 \text{ GB}
$$

#### 激活值内存

考虑 gradient checkpoint 和批次大小：

$$
M_{\text{act}} \approx 10-15 \text{ GB per GPU}
$$

#### 通信缓冲区

$$
M_{\text{buffer}} \approx 5 \text{ GB}
$$

#### 总内存占用

$$
M_{\text{total}} \approx 2.6 + 1.3 + 2.6 + 15 + 5 \approx 26.5 \text{ GB per GPU}
$$

这在 80GB H800 GPU 中留有充足余量（约 67% 可用）。

### 关键优化技术

#### 1. DualPipe 流水线并行

通过重叠前向和反向传播的计算与通信阶段，实现接近完全的计算-通信重叠。

**优势**：
- 减少流水线气泡（bubble）
- 提高 GPU 利用率
- 降低端到端延迟

详见：[[DualPipe]]

#### 2. 节点受限路由（Node-limited Routing）

限制每个 token 最多路由到 **M=4** 个节点。

**优势**：
- 显著降低跨节点通信开销
- 减少网络拥塞
- 提升训练效率

**实现**：
- 256 个路由专家均匀分布在 64 个 GPU 上
- 每个 GPU 存储 4 个专家
- 每个 token 最多激活分布在 4 个节点上的专家

#### 3. 无辅助损失负载均衡

**传统方法**：使用辅助损失（auxiliary loss）强制专家负载均衡

**DeepSeek V3 创新**：
- 通过动态调整门控偏置（gating bias）实现负载均衡
- 避免了传统辅助损失对模型性能的负面影响
- 提升模型质量的同时减少内存碎片和计算资源浪费

#### 4. FP8 混合精度训练

利用 H800 的 FP8 Tensor Core，实现：
- 2-3 倍的计算加速
- 减少内存带宽需求
- 降低激活值内存占用

详见：[[FP8-Mixed-Precision-Training-Framework]]

### 训练效率

官方报告显示的训练效率：
- 总 GPU 小时：2.788M H800 GPU 小时
- 预训练：2.664M GPU 小时
- 后训练：0.1M GPU 小时

这展现了卓越的训练效率，证明了精心设计的并行策略和优化技术的有效性。

### 与其他大模型的对比

| 模型 | 参数量 | GPU 类型 | 并行策略 | 关键优化 |
|------|--------|----------|---------|---------|
| GPT-3 | 175B | V100 | DP + MP | - |
| DeepSeek V3 | 671B (37B active) | H800 | PP + EP + ZeRO-1 | DualPipe + FP8 + Node-limited Routing |

## 参考资料

- [[DeepSeek_V3_Report：Annotation]]
- [[DualPipe]]
- [[FP8-Mixed-Precision-Training-Framework]]
- [[Computing-FLOPs-and-GPU-Memory-Requirements-for-LLMs]]
