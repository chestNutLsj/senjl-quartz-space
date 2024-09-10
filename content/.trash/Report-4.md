---
theme: default
size: 16:9
paginate: "true"
marp: "true"
---
# <!--fit-->Paper-Reading Report

### Paper: 

HPCC: High-precision Congestion Control
Cebinae: Scalable In-Network Fairness Augmentation

### Reporter: Senj Lee

### Date: 1 st / July / 2024

---

<!--header: Remaining Problems-->

## <!--fit-->Remaining Problems

---

### 1. DCQCN 中的 CNP 包如何生成？

The NP algorithm specifies how and when CNPs should be generated. The algorithm follows the state machine in Figure 6 for each flow. 

![](./assets/Report-4-CNP.png)

If a marked packet arrives for a flow, and no CNP has been sent for the flow in last $N$ microseconds, a CNP is sent immediately. Then, the NIC generates at most one CNP packet every $N$ microseconds for the flow, if any packet that arrives within that time window was marked. We use $N = 50μs$ in our deployment. 

---

### 2. 为什么说基于速率的 CC 比基于窗口的 CC 更加细粒度？

前者对速率的控制是主动的，而后者则是被动的。具体地说，

---

### 3. RDMA 如何实现 Per-ACK 确认？

---

### 4. 令牌桶是什么？漏桶是什么？

---

### 5. 如何计算延迟的 gradient ？

---

### 6. INT 的结构

---

