---
tags:
  - Network
  - Hashing
  - Route
  - ATC22
date: 2024-10-14
publish: "true"
title: "Hashing Design in Modern Networks: Challenges and Mitigation Techniques."
---
## Introduction

ECMP/WCMP 是大规模 IP 网络（Datacenter or WAN）中事实上的流量负载均衡标准。

Traffic/Forwarding Polarization: different switches repeatedly use the same hashing algorithm, resulting in a switch selecting a small portion of links for all traffic destined for one prefix, while other links were underutilized.

hash correlation: describe the association between hash functions in different switches that leads to traffic polarization.

已有一些方案用户缓解散列相关性：
- 一类方案是使用 hash 函数的变体，例如使用不同的 seeds ，但后文可以论证这个方案并不有效。
- 使用包头部的 TTL 字段进行 hash 。

## Background and Motivation

>The implications of bad hashing are twofold.
>- First, bad hashing leads to traffic polarization that endangers reliability (due to reduced path diversity), wastes network bandwidth, cancels efficiency gains of traffic engineering, and inevitably increases network cost.
>- Second, bad hashing causes inherent traffic load imbalance and leads to network congestion that affects application performance.

### Hashing is a Practical Challenge in Network Designs

现代网络中 hash 已经是一个日益重要的问题：
1. 规模庞大：both datacenter and WANs are getting bigger with more switches and stages;
2. 路径密集：modern networks are very dense and have a large number of paths between any two nodes
3. topology and routing become more agile and flexible in order to improve network efficiency and availability, e.g., the move from spinefull DCN to reconfigurable spineless [13, 32] and the use of non-shortest path routing to improve availability and performance [15];
4. emerging applications (such as distributed machine learning) are becoming more throughput hungry while demanding stricter network SLA guarantees.

#### Multi-stage Clos DCN

>[[What is Clos Network？]]

现代 DCN 连接着大量计算/存储节点，运行着关键服务，如搜索、视频、地理与地图、云和游戏等，并且具有非常大的路径多样性（path diversity）；因此，散列和流量负载平衡至关重要。

在此处使用 Jupiter 拓扑作为多阶段 Clos DCN 的样例，如下图 Fig 1 。

![[Hashing Design in Modern Networksnotes-fig1-jupiter-arch.png]]

Jupiter 中有 Server Block（后文记作 SB）、5 个交换机阶段（分别记作 $S_{1}\sim S_{5}$），因此当一个包从 $SB_{i}$ 中的 ToR 路由到 $SB_{j}$ 中的另一个 ToR 时，最长的转发路径及其跳序列是 $S_{1}(SB_{i})\rightarrow S_{2}(SB_{i})\rightarrow S_{3}(SB_{i})\rightarrow S_{4}\rightarrow S_{5}\rightarrow S_{4}\rightarrow S_{3}(SB_{j})\rightarrow S_{2}(SB_{j})\rightarrow S_{1}(SB_{j})$ 。为了实现最佳的负载均衡，hash 需要满足这样的属性：**相同转发路径上不应有相关的 hash 函数**。直觉上，我们需要 $\mathcal{O}(2L)$（准确说是 `最大跳数-1`）个独立 hash 函数，这里 $L$ 指的是框架的层数或阶段数。

在 Jupiter 中需要 8 种 hash 函数，但不幸的是其交换机只有 6 种不相关 hash 函数，因此我们需要减少多阶段 Clos DCN 对 hash 函数数量的需求。

#### Spineless DCN

>[!note] [[Spineless DCN：notes|What is spineless DCN?]]
>在数据中心网络（Datacenter Network, DCN）中，**spineless** 通常描述一种特定的网络架构或网络拓扑的特性，指的是网络中的交换结构没有一个中心的核心或骨干（spine）。它与传统的 **spine-leaf** 架构相对。
>
>### 传统的 Spine-Leaf 架构
>Spine-leaf 是数据中心常见的一种网络拓扑结构，由两个层次的交换机组成：
>- **Spine 层**：核心层交换机，负责高性能的数据转发。所有叶交换机（Leaf）通过 Spine 交换机互联，保证网络冗余性和高可用性。
>- **Leaf 层**：接入层交换机，连接服务器等设备，通常每个 Leaf 都与每个 Spine 交换机相连，形成一个全互连的网络。
>
>在这种架构中，Spine 层充当了整个网络的骨干和核心，所以有时称为“有脊”（spine）的网络。
>
>### Spineless 网络
>相对的，**spineless** 数据中心网络没有 Spine 层，这意味着网络不依赖一个核心层或骨干结构。它通常基于**扁平化、去中心化**的网络设计，多个交换机相互对等连接，没有明显的层次划分。这种架构的几个特点包括：
>1. **扁平化架构**：整个网络层次减少，降低了延迟，因为不再需要经过核心交换机层。
>2. **去中心化**：没有单一的核心交换机作为流量的汇聚点，每个交换机承担的角色相对均衡。
>3. **高扩展性**：通过添加更多对等交换机的方式扩展网络，而不会形成性能瓶颈。
>4. **网络弹性**：由于去除了中心节点，减少了单点故障，网络的容错性和稳定性可能更高。
>
>Spineless 网络有时也与软件定义网络（SDN）结合使用，使得网络中的交换机动态调整和分配资源，进一步提升网络性能。

![[Hashing Design in Modern Networksnotes-fig3-spineless-dcn.png]]

Spineless DCN 是新兴的拓扑，能够减少开销并支持更快的技术更新，但是需要 hash 函数也更多。在 spineless DCN 中，server block 通过 mesh 结构直接连接，spine block 被完全移除以降低网络成本。同时采用**非最短路径路**由以增强了路由差异性，从而实现高可用性，并使得流量工程能够优化网络链路的利用率。

尽管 spineless DCN 成本低、效率高，但 hash 设计却更具挑战，因为所需 hash 函数的数量取决于 server block 的数量，而不是多级 DCN 的层数。以 Gemini[^1] 为例，假设我们在路由中最多只允许一个中转 server block，那么数据包的最长转发路径是：$S_{1}(SB_{i})\rightarrow S_{2}(SB_{i})\rightarrow S_{3}(SB_{i})\rightarrow S_{3}(SB_{j})\rightarrow S_{2}(SB_{j})\rightarrow S_{3}(SB_{j})\rightarrow S_{3}(SB_{k})\rightarrow S_{2}(SB_{k})\rightarrow S_{1}(SB_{k})$，这里 $i,j,k$ 是随机选择的三个服务器区块的索引。此时关键挑战就是确保任意 $i,j,k$ 的 server block 组合中没有相关联的 hash 函数，因此 spineless DCN 需要 $\mathcal{O}(N)$ 量级的 hash 函数，此处 $N$ 是 server block 的数量。在经典结构中，$N$ 的范围在 10 到 100 之间，因此使用当前一代交换机提供的有限 hash 函数来设计 hash 非常具有挑战性。

#### WAN

流量工程和负载均衡对于提高 WAN 性能和降低运营成本至关重要。网状连接（mesh）的 WAN 在 hashing 设计方面也面临同样的挑战，即所需的不相关 hash 函数的数量取决于网络的规模。

![[Hashing Design in Modern Networksnotes-fig2-WAN.png]]

Fig 2 显示了 B4 WAN Stargate 站点的拓扑结构。每个站点最多由 4 个超级节点组成，其中每个超级节点是一个两级 Clos 网络，与广域网、数据中心和同一站点的其他超级节点连接。B4 站点级拓扑结构是一个部分连接的网状结构，采用非最短路径路由。

与 spineless DCN 类似，WAN 中也需要 $\mathcal{O}(N)$ 量级的 hash 函数，$N$ 是 WAN 中站点的数量。需要注意的是，2012 $\sim$ 2017 年间 B4 WAN 的规模增加了 7 倍，因此 hashing 问题颇具挑战。

### ECMP/WCMP Traffic Load Balance

>[!note] ECMP 策略的简介
>Equal-Cost Multiple-Path (ECMP) – a routing and traffic load balancing strategy that allows traffic between a source and destination node to be transmitted across multiple paths – identifies a set of routes, each of which is equal-cost towards the destination. The routes identified are referred to as anECMP group. An ECMP group is defined at flow-level. When forwarding a packet, the routing strategy decides which nexthop path to use based on a hashing algorithm. That is, the route of a packet is determined by the mapping from the hash value to an egress port, i.e., h % n, where h is the hash value, and n is the number of output ports in the ECMP group.

常见的用于 hash 输入的 IP 包头字段有：source IP、destination IP、transport protocol、TCP/UDP ports、IPv6 flow label。

### Hash Correlation Causes Traffic Polarization and Load Imbalance

[^1]: MingyangZhang, et al. Gemini: Practical Reconfigurable Datacenter Networks with Topology and Traffic Engineering.