---
tags:
  - DataCenter
  - PathControl
  - RDMA
  - RoCE
  - PacketSpraying
  - Annotation
date: 2026-03-31
---

> 本文是对 Juniper TechPost《[[0-Assets/Clippings/To Spray or Not to Spray]]》的整理与译注。它讨论的不是抽象意义上的 ECMP，而是 **AI/ML 训练流量在以太网 Fabric 中的低熵问题**：当 GPU 之间的大流几乎退化为单条 IP flow 时，基于 flow 的负载均衡会天然发生碰撞，链路热点与训练时延就会被放大。

## Introduction

### Core View

> ***只要端点 NIC 能安全地处理乱序到达的 RDMA 数据包，packet spraying 就是解决 AI 训练低熵流量碰撞的一条极具性价比的路径；真正昂贵的部分不是 spray，而是“在网络内部做重排”。***

### Background

当前数据中心网络里，很多厂商都在处理同一个问题：训练流量的并发条数太少、单流速率却太高。单个 GPU 在与其他 GPU 同步训练数据时，往往只产生 **1 条活跃 IP flow**，但这条流可以直接跑满 400Gbps 级别接口。

这意味着：
- 传统以太网 Fabric 按 flow 做负载均衡，而不是按 packet；
- 一旦几条大流哈希到同一条链路，碰撞几乎不可避免；
- 碰撞链路上的传输时间会成倍放大，并进一步拉长整个训练作业的完成时间。

![[To-Spray-or-Not-to-Spray-Annotation-fig01-congestion-points.png]]

这与 [[Hashing Design in Modern Networks：notes]] 中讨论的 ECMP/WCMP 散列相关问题是同一类矛盾，只不过 AI 训练把问题推到了更极端的 regime：**不是 hash 设计不好，而是输入熵本来就不够**。

### Why Existing Solutions Feel Unsatisfactory

现有解决方案大致有三类：
1. **改良版 flow-level 负载均衡**：例如更激进的 Dynamic/Adaptive Load Balancing，本质上仍然在 flow 粒度上修补碰撞。
2. **调度式 Fabric**：在交换机内部做 packet/cell 级 spraying，再配套 in-fabric re-ordering。问题是这类方案往往专有、昂贵，并且为了重排需要额外缓冲、调度结构和芯片面积。
3. **直接 spray**：让 packet 在网络中自由分散到多条等价路径，从直觉上看最能吃满 path diversity，但关键问题变成了 endpoint 能否承受乱序。

Juniper 这篇文章的价值就在于把问题收束到了一个更本质的判断：**应用到底是否真的需要“包按序到达”这件事？**

## GPU Workloads

### 应用真正关心的是什么？

从应用语义看，GPU 之间做的是内存到内存的数据搬运。训练程序并不关心“第一个字节先写到显存”还是“最后一个字节先写到显存”，它真正关心的是：**只有当全部字节都完成传输之后，completion notification 才能到达。**

![[To-Spray-or-Not-to-Spray-Annotation-fig02-operation-steps.png]]

换句话说，应用层关注的是 **完成语义**，而不是网络路径上的逐包顺序语义。

### 低熵问题是怎么被制造出来的？

麻烦出在现实实现上。NCCL 使用的是 InfiniBand Reliable Connected 传输语义。它是面向连接的，发送端需要收到确认，而且更关键的是：**线上的包序被严格维护**。RoCEv2 规范甚至显式要求把连接映射成单一 IP flow。

这一步把原本“应用并不要求严格按序”的问题，变成了“网络必须为单流保序”的问题，于是：
- 训练流量在网络侧表现为低熵大象流；
- ECMP 很容易撞链路；
- 多路径拓扑的带宽潜力没有被真正释放。

这与 [[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion]] 中 Meta 所说的 *low entropy traffic* 是完全一致的，只是 Juniper 进一步主张：与其继续在 E-ECMP、QP scaling 或 centralized TE 上打补丁，不如重新审视 **端点是否可以吸收乱序**。

## Solution to the Low Entropy Problem

### 核心思路

文章给出的过渡性工程答案不是直接修改标准，而是利用已经存在于 Nvidia NIC 中的 out-of-order reception / retransmission 能力。

当 Adaptive Routing 或某些 lossy acceleration 被启用后，ConnectX-5 / 6 DX 及以上 NIC 会改变 `RDMA_WRITE` 的内部处理方式：它不再依赖传统的 `First / Middle / Last / Last with Immediate` 这组强顺序片段，而是将其转为一个或多个 `RDMA_WRITE_ONLY` 操作。每个包都携带足够的扩展传输头，因此 NIC 可以在包到达时直接把数据写进 GPU memory，同时只维护最小状态来检测丢包。

这件事的意义很大：
- endpoint 不再需要为了等待 “First” 片段而在 NIC 里缓存大量 payload；
- payload packet 可以乱序到达；
- 真正需要保序的，只剩下最终 completion notification。

NCCL 的做法是：
- 用 `RDMA_WRITE` 承载数据 payload；
- 当数据长度超过阈值时，再补一个零长度的 `RDMA_WRITE_WITH_IMM` 只负责触发 completion。

于是系统语义变成：**数据可以乱序写入，完成通知仍然有序到达。**

这正是 spray 可以成立的前提。

## Validation

### Spray 到底会带来多严重的乱序？

文章先把 spray 场景讲清楚：同一条 flow 的 packet 在 leaf 侧被随机分配到不同路径，因此它们会进入不同的队列；有些 packet 在 spine 的出端口排队更久，后来的 packet 反而会先到达 endpoint。

![[To-Spray-or-Not-to-Spray-Annotation-fig03-spraying-concept.png]]

![[To-Spray-or-Not-to-Spray-Annotation-fig04-reorder-example.png]]

作者用“乱序包之间隔了多少个同 flow packet”来衡量重排程度。这个指标很直观，因为它直接反映 NIC 需要容忍多深的 out-of-order window。

### 实验设计

Juniper 用 MX 路由器模拟 packet re-ordering，而不是直接把生产 Fabric 拉起来做破坏性实验。核心方法是：
- 只对 `RDMA_WRITE_ONLY` 这类可 spray 的 packet 做随机分路；
- 其余 packet（尤其 completion 相关 packet）走单独路径；
- 通过一串 policer 指令给不同路径叠加不同量级的额外时延，人工构造出 20 包、200+ 包、400+ 包的重排距离。

![[To-Spray-or-Not-to-Spray-Annotation-fig05-mx-testbed.png]]

这套设计其实回答了一个很关键的工程问题：**spray 不是“所有包一股脑乱喷”，而是“只 spray 端点能承受乱序的那一类 packet”。**

### 结果怎么看

实验最重要的结论有三组。

1. **端点支持乱序时，spray 基本不损失带宽**
   - Adaptive Routing 开启、spray 关闭：`97.66 Gbps`
   - Adaptive Routing 开启、spray 开启：`97.66 Gbps`

   这说明在 endpoint 具备乱序接收能力时，spray 不会天然拖垮吞吐。

2. **端点不支持乱序时，spray 会灾难性退化**
   - Adaptive Routing 关闭、spray 开启：`0.19 Gbps`

   这个对照实验非常关键。它表明“乱序可容忍”不是优化项，而是 spray 成立的必要条件。

3. **NIC 对较深重排窗口仍然相当鲁棒**
   - `200+` reorder distance: `97.66 Gbps`
   - `400+` reorder distance: `87.58 Gbps`

   也就是说，现代 NIC 对较大规模的乱序并不是完全脆弱的。真正开始掉速，是在未确认包窗口逐渐逼近 NIC 支持上限之后。

![[To-Spray-or-Not-to-Spray-Annotation-fig06-distance-distribution-1.png]]

![[To-Spray-or-Not-to-Spray-Annotation-fig07-distance-distribution-200plus.png]]

![[To-Spray-or-Not-to-Spray-Annotation-fig08-distance-distribution-400plus.png]]

### 对比已有工作后的判断

把这篇文章和你已有笔记放在一起看，会出现一个比较清晰的脉络：

- [[Hashing Design in Modern Networks：notes]] 关注的是如何在多级网络里缓解 hash correlation；
- [[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion]] 关注的是在 RoCE 训练网里，通过 `QP scaling / E-ECMP / CTE / flowlet` 去增加熵或绕开碰撞；
- [[LIA-Latency-Improved-Adaptive-Routing-Comprehension]] 则代表另一类思路，即让网络依据实时负载自适应选路；
- 而本文的出发点更直接：**如果 endpoint 语义允许，把“负载均衡粒度”从 flow 直接下沉到 packet。**

因此它实际上给出了一个很强的启发：AI 训练网络中的许多“路径控制”问题，最终并不是单纯的路由算法问题，而是 **NIC transport semantics 与 Fabric path diversity 的协同设计问题**。

## Cost and Tradeoff

### 代价并非为零，但相当可控

文章观察到的主要代价是 ACK 数量增加。不开启 Adaptive Routing 时，ACK 更接近“按 message”产生；开启之后，ACK 更像是“每 3 到 4 个 `RDMA_WRITE_ONLY` packet 一组”地产生。

![[To-Spray-or-Not-to-Spray-Annotation-fig09-ack-packet.png]]

换句话说，反向方向会多出一些小 ACK 包。但从文中的量级估计看，**66-byte ACK 对应 12KB 到 16KB 正向 payload**，这个税负相对温和。与 fully scheduled fabrics 需要的 in-fabric buffering / scheduling 开销相比，这几乎可以视为更划算的交换。

### 真正的边界条件

这套方法的边界也很明确：
- 不是所有 RDMA packet 都能 spray；
- 不是所有 endpoint 都支持足够鲁棒的 out-of-order reception；
- 一旦乱序深度继续增大，性能仍然会下降；
- 这更像是一条“利用现有 NIC 特性提前释放多路径能力”的工程路径，而不是最终统一标准。

## My Takeaways

1. **本文把“ECMP 低熵”这个问题从网络层重新拉回到了传输语义层。** 真正决定 spray 能否成立的，不是 leaf/spine 算法多聪明，而是 NIC 能否把乱序 packet 直接落到目标内存并正确维护 completion 语义。
2. **这篇文章和 Meta 的 E-ECMP / QP scaling 路线形成了鲜明对照。** 前者通过制造更多 flow 来提升熵，后者通过改变 endpoint 能力来放宽“必须按 flow 保序”的约束。
3. **它与 [[Insights-into-DeepSeek-V3-Annotation]] 中对 multi-plane network / packet spraying 的讨论可以互相印证。** 如果未来 NIC 与交换芯片更原生地支持多平面 spray 与乱序恢复，那么大规模 AI Fabric 的负载均衡粒度可能会进一步从 flowlet 走向 packet。
4. **这篇文章也提示了一个值得继续追的问题：** 对于 RoCE 训练流量，`flowlet switching` 与 `packet spraying + endpoint reordering tolerance` 的边界到底在哪里？在多故障场景、深队列场景以及 oversubscription 场景下，哪一种方法更稳？

> [!question]
> 后续可以继续追的材料：
> - 文章引用的 IRN 论文，看看标准语义层面如何支持 refined out-of-order。
> - Nvidia Adaptive Routing 在 RoCE 上的更完整文档，确认哪些 packet type 可 spray、哪些不行。
> - 与 [[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion]] 做一个专门对照，梳理 `E-ECMP / flowlet / spraying` 三条路线分别解决的到底是哪一层问题。

## Related

- 原文归档：[[0-Assets/Clippings/To Spray or Not to Spray]]
- 低熵与 ECMP：[[Hashing Design in Modern Networks：notes]]
- RoCE 训练网络实践：[[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion]]
- 自适应路由：[[LIA-Latency-Improved-Adaptive-Routing-Comprehension]]
- 多平面网络中的 spraying 背景：[[Insights-into-DeepSeek-V3-Annotation]]