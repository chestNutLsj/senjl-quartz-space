---
title: To Spray or Not to Spray
author: Dmitry Shokarev
published: 2023-11-21
date: 2026-03-31
tags: [Clipping, Juniper, DataCenter, RoCE, RDMA, PacketSpraying, ECMP]
source: https://community.juniper.net/blogs/dmitry-shokarev1/2023/11/21/to-spray-or-not-to-spray
---

> [!info]
> 来源：Juniper TechPost, Dmitry Shokarev, 2023-11-21。
> 处理：已将正文图片本地化到当前目录 `assets/`，并生成译注版 [[3-Research/1-DataCenter/Path Control/To Spray or Not to Spray]]。

# To Spray or Not to Spray

![[To-Spray-or-Not-to-Spray-clip-fig01-cover.png]]

*Solving the low entropy problem of the AI/ML training workloads in the Ethernet Fabrics.*

Guess how many active IP flows a single GPU normally sends while synchronizing training data with other GPUs? It is only 1. And the traffic is sent at the interface rate, 400Gbps these days.

This TechPost gathered two articles initially published on LinkedIn in August 2023 and September 2023.

## Introduction

Few flows lead to flow collisions in the traditional Ethernet fabrics interconnecting GPUs. This is because Ethernet fabrics load balance traffic per flow and collisions are unavoidable. The transfer time for the two flows colliding on the same link doubles, with more flows colliding it deteriorates further, thus increasing overall AI/ML training job completion time.

![[To-Spray-or-Not-to-Spray-clip-fig02-congestion-points.png]]

Every networking vendor acknowledges this problem and tries to find a solution. Various techniques to redistribute flows away from congested paths are proposed by vendors: Dynamic Load Balancing / Global Load Balancing from Broadcom or Adaptive Load Balancing from Juniper.

Fully scheduled fabrics with random packet or cell-based spraying over fabric links and re-ordering in the fabric were recently proposed by at least two vendors, but the technique is proprietary, adds latency, and is quite expensive. Re-ordering inside the fabric requires buffering, associated scheduler data structures also increase in size, and all of these have chip area, cost, density, and power implications.

The key question is therefore simple: packet spraying is attractive because it uses all parallel paths efficiently, but can we avoid expensive re-ordering inside the fabric without hurting the application?

## GPU Workloads

We use NCCL with InfiniBand / RoCEv2 transport as the reference workload.

### What do GPUs send to each other?

They transfer data from random access memory of one GPU to random access memory of another. From the application point of view, the data write itself does not need strict in-order delivery. What matters is that the completion notification is delivered only after all bytes are transferred.

![[To-Spray-or-Not-to-Spray-clip-fig03-operation-steps.png]]

### How does it work in reality?

NCCL uses InfiniBand Reliable Connected transport service. This service is connection-oriented, packet delivery is acknowledged, and packet order on the wire is strictly maintained. RoCEv2 explicitly maps the connection to a single IP flow for that reason.

**This is why the workload has a low entropy problem.**

## Solution to the Low Entropy Problem

The long-term solution is to evolve the transport standard toward refined out-of-order delivery and retransmission semantics. The article cites the IRN paper as one such direction.

Before a new standard is fully adopted, one can already rely on NICs that implement refined out-of-order reception and retransmission logic. Nvidia ConnectX-5, ConnectX-6 DX and above can do this when Adaptive Routing or certain lossy accelerations are enabled.

NCCL uses two relevant RDMA verbs for transfer:

- `RDMA_WRITE`: data transfer from source memory to destination memory.
- `RDMA_WRITE_WITH_IMM`: same transfer, but also sends immediate data to notify completion.

A remote memory write can be as large as 2GB, but the transfer is fragmented into MTU-sized packets, commonly 4KB. Traditionally this is carried by four packet types: `RDMA WRITE First`, `Middle`, `Last`, and `Last with Immediate`.

NICs do not normally support out-of-order reception for these packet types because the NIC would otherwise need expensive payload buffering. However, with Nvidia Adaptive Routing enabled, every `RDMA_WRITE` request can be remapped into one or more `RDMA_WRITE_ONLY` operations. Each packet then carries the extended transport header, so the NIC can place any packet directly into GPU memory and keep only minimal state for packet-loss detection.

NCCL then sends the payload via `RDMA_WRITE`, and if the data length exceeds a threshold, it follows up with a zero-length `RDMA_WRITE_WITH_IMM` solely for completion notification. The NIC guarantees ordered completion signaling toward the receiving application.

At that point, the endpoint can tolerate out-of-order packet arrival, which means **the network may spray packets in transit**.

## Validation

The article validates spraying with shipping Nvidia ConnectX-6 DX NICs.

### What kind of re-ordering can we expect?

Packet spraying means packets from the same flow may take different paths through the fabric. At the leaf, path selection is random on a packet-by-packet basis.

![[To-Spray-or-Not-to-Spray-clip-fig04-spraying-concept.png]]

Packets of the same flow can therefore enter different queues, and some packets may stay longer in the fabric than later packets, which breaks order.

![[To-Spray-or-Not-to-Spray-clip-fig05-reorder-example.png]]

The author argues that the distance between unordered packets is a good measure of re-ordering. In the first test scenario, packets arriving out of order were typically separated by 1 to 20 packets; later tests pushed this to 200+ and 400+.

![[To-Spray-or-Not-to-Spray-clip-fig06-reorder-distance-example.png]]

![[To-Spray-or-Not-to-Spray-clip-fig07-distance-distribution-1.png]]

In the first test bed, 25.03% of packets arrived out of order.

### Packet re-order emulation with Juniper MX

Juniper MX is used here as a configurable packet re-ordering device, while the intended production AI/ML fabric design is based on PTX routers and QFX switches.

![[To-Spray-or-Not-to-Spray-clip-fig08-mx-testbed.png]]

`RDMA_WRITE_ONLY` packets are randomly split into two delay classes with 50/50 probability. Additional delay is introduced through chained policer instructions in a filter. By increasing the number of policers, the experiment manipulates the re-ordering distance without intentionally dropping traffic.

The endpoint hardware is:

- Nvidia ConnectX-6 DX NIC, firmware `22.38.1900`
- Supermicro server with Intel Xeon E5-2670 v3 and Ubuntu 22.04.3 LTS

### Test results

Tests were performed with `ib_write_bw` from `perftest`. For 4KB payloads, line-rate performance matches theory:

- Adaptive Routing enabled, spraying disabled: `97.66 Gbps`
- Adaptive Routing enabled, spraying enabled: `97.66 Gbps`
- Adaptive Routing disabled, spraying disabled: `98.01 Gbps`

The slight drop with Adaptive Routing comes from extra protocol overhead. The article quantifies the difference as roughly `0.34%`.

When Adaptive Routing is disabled but packets are still sprayed and reordered, throughput collapses:

- Adaptive Routing disabled, spraying enabled: `0.19 Gbps`

This is the critical control experiment: **one cannot randomly spray all packets**. Only eligible packet types may be sprayed, and only when the endpoints support out-of-order reception.

The article then increases the re-ordering depth:

![[To-Spray-or-Not-to-Spray-clip-fig09-distance-distribution-200plus.png]]

![[To-Spray-or-Not-to-Spray-clip-fig10-distance-distribution-400plus.png]]

Performance stays at line rate with 200+ reorder distance and degrades only under very large re-ordering:

- 200+ distance, Adaptive Routing enabled, spraying enabled: `97.66 Gbps`
- 400+ distance, Adaptive Routing enabled, spraying enabled: `87.58 Gbps`

The article attributes the degradation not to drops, but likely to hitting the maximum number of unacknowledged packets supported by the NIC.

## Cost of Doing It

The main downside observed in the article is a small increase in ACK traffic. Without Adaptive Routing, acknowledgments are generated per message. With Adaptive Routing and `RDMA_WRITE_ONLY`, ACKs are generated for a smaller group of packets, in the experiment roughly every 3 to 4 packets.

![[To-Spray-or-Not-to-Spray-clip-fig11-ack-packet.png]]

That means a small 66-byte L2 packet is sent in the reverse direction for every 12KB to 16KB of payload. The author considers this a minor tax compared with the alternative of fully scheduled fabrics.

## Conclusion

![[To-Spray-or-Not-to-Spray-clip-fig12-conclusion.png]]

This article validates a simple engineering claim: if the NIC can safely absorb the re-ordering semantics, packet spraying can load balance AI/ML traffic across all parallel fabric paths, avoid congestion, and reduce job completion time, without requiring expensive in-fabric re-ordering.

## Useful Links

- NCCL source: https://github.com/NVIDIA/nccl/tree/master/src
- IRN paper: https://people.eecs.berkeley.edu/~apanda/assets/papers/sigcomm18-irn.pdf
- Nvidia Adaptive Routing on Ethernet: https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/env.html#nccl-ib-adaptive-routing
- LinkedIn source post 1: https://www.linkedin.com/pulse/spray-solving-low-entropy-problem-aiml-training-fabrics-shokarev/
- LinkedIn source post 2: https://www.linkedin.com/pulse/spray-validation-dmitry-shokarev

## Related

- [[3-Research/1-DataCenter/Path Control/To Spray or Not to Spray]]
- [[Hashing Design in Modern Networks：notes]]
- [[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion]]