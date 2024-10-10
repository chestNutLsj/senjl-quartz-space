---
tags:
  - FederatedLearning
  - datacenter
date: 2024-10-05
publish: "true"
title: "Esync: Accelerating Intra-Domain Federated Learning in Heterogeneous Data Centers"
---
## Introduction

大数据的爆炸式增长促进了各领域智能应用的发展，但这些数据通常分散在孤立的各方，由于隐私问题和法规限制而无法整合。 McMahan 等人[^1]提出利用 Federated Learning 实现保护隐私的协作学习，即数十亿台移动设备在云端中央服务器的协调下协作训练一个共享的机器学习模型，同时将训练数据保存在客户端。

**跨设备**（cross-device）FL 和**跨组织**（cross-silo）FL 都专注于客户和各方通过带宽受限的域间网络（跨广域网）与中央服务器通信 ML 模型的场景。除这两种 FL 外，本文发现新的 FL 形式——**域内**（intra-domain）FL。在这种情况下，孤立的各方位于同一局域网（如共享的数据中心）中，它们拥有充足的带宽资源，但由于各方之间的计算设备不同（异构性），因此计算能力也不尽相同。域内 FL 通过实现密集的联合计算（federated computing）扩展了服务计算（service computing）的功能。例如，一个研究中心的团队将他们的机器集中起来，建立一个共享数据中心，然后他们可以向中心外的团队或用户提供面向联合计算的网络服务。 这些外部团队可以是：a) 来自不同的机构（如企业、大学）；b) 期望合作，但出于隐私和知识产权方面的考虑，不允许共享数据；c) 共享高质量的网络服务，但由于混合了异构计算设备（如 CPU、GPU、ASIC、FPGA），因此具有异构计算能力。

>[!note] 怎样理解 cross-device & cross-silo FL？
>![[Esyncnotes-cross-device-FL.png]]
><center>Single Organization, Model-Centric & Cross-Device Federated Learning.</center>
>
>![[Esyncnotes-cross-silo-FL.png]]
><center>Multiple Organizations, Model Centric & Cross-Silo Federated Learning.</center>
>
>We’re now looking to unlock the value of data that is more widely distributed, for example between hospitals, banks, perhaps distributed aggregate data from consumer wearables in different fitness app businesses.
>
>Whilst the goal is typically stated as the same for Cross-Silo — to update and improve a central,  and in this case shared, model, there are arguably greater challenges on the security side. At the same time, there’s scope to use more consistent, powerful & scalable compute within each organisation (Hadoop/Spark clusters etc.)

![[Esyncnotes-fig1-FL-category.png]]

![[Esyncnotes-table1-FL-DML-comparison.png]]

跨设备 FL、跨组织 FL、域内 FL、传统 Distributed ML 的图示和对比如 Fig 1 和 Table 1 所示。总的来说，域内 FL 在参与实体（即孤立的各方）、数据分布（即不均衡和非独立随同一分布 non-i.i.d）和联邦规模（即通常为 2-100 个参与方）方面与跨组织 FL 具有相似的特征，但域内 FL 的各参与方位于共享的数据中心，并通过高速局域网络互连。

现有的文献都致力于减轻跨设备和跨组织 FL 的通信瓶颈，McMahan 提出将更多计算推卸给客户端的 FedAvg 技术来减少同步频率。然而 Yao 等人[^2]的论文发现，FedAvg 会给模型聚合带来梯度偏差，从而导致收敛性变差。例如在 CIFAR10 数据集上想要训练到 80% 的分类准确率，FedAvg 需要 1400 个 epoch（280 个同步轮次），而 SGD 只需要 36 个 epoch 。因此基于 FedAvg 的算法不是域内 FL 的好选择，因为域内 FL 并没有通信瓶颈。

由于没有通信瓶颈的限制，基于高频率同步 SSGD 的算法由于出色的收敛性，更适合在域内 FL 中使用。然而，此时巨大的计算异质性成为主要瓶颈——各参与方提供的机器具有不同能力的计算设备，而更换所有过时机器的成本高昂且不切实际，因此导致共享数据中心的异构性。异质性带来了严重的效率低下，功能强大的机器在每次同步中因滞后的机器（straggling machine）而阻塞，直到越过障碍。

解决拖后腿问题可以分为同步和异步两类方法：
- **同步方法**选择计算能力相近的各方，使同步各方趋于一致。 Bonawitz 等人[^3]的方案接受在指定时间窗口内提交的模型，并丢弃超时的模型。 Chai 等人[^4]的方案将各参与方分组为多个层级，每个层级中的各方具有相同的计算能力，该方案根据概率选择一个层级进行同步。但这些方法都不一而同地使滞后方无法贡献自己的模型，削弱了全局模型的泛化能力。
- **异步方法**允许计算能力强的参与方立即更新全局模型，而不必等待拖后腿的参与方（如 ASGD），因此这种方案天然适合异构计算。但这种方案使用陈旧模型更新全局模型，导致准确度下降。 Zheng 等人[^5]提出利用泰勒展开补偿陈旧梯度，Xie 等人[^6]则通过降低权重来抑制陈旧模型的贡献。他们的方法在弱异质性条件下效果很好，但仍无法挽救域内 FL 的精度，因为当异质性较强时，陈旧的噪声会完全淹没有价值的信息。

为了解决强异构情境中的域内 FL 中滞后方的问题，同时保证准确性不受损失，本文提出了一种高效的同步机制，可以自适应地避免滞后方造成的阻塞。其核心思想是让有计算能力强的参与方在阻塞时间内探索更高质量的模型，即建议计算能力强的各方在滞后方完成一次迭代之前尽可能多地进行迭代训练。为实现这一想法，需要一种在线调度机制来自适应地协调各方的局部迭代次数。

因此本文的贡献在：
1. 提出了一种新的 FL——域内 FL，在这种 FL 中，孤立的各方在具有强大计算异构性的共享数据中心中协作训练 ML 模型。 我们总结了现有的跨设备 FL、跨组织 FL 和传统 DML，并将它们与所提出的域内 FL 进行了比较。
2. 提出了一种新型调度器 *State Server*，用于协调各方的同步步伐。*State Server* 实时监测各方的状态和进度，可以在环境改变时自适应地调整调度决策。
3. 提出了一种针对强异构环境的高效同步算法 *ESync*。在 *State Server* 的协调下，*ESync* 允许各参与方依据各自的资源在本地迭代训练不同的轮次，从而解决滞后者问题以及加速训练过程。
4. 给出了权重发散和最优性差距的边界，分析了收敛精度和通信效率之间的权衡，证明在强异构环境下 ESync 比 FedAvg 具有更高的效率和更好的精度。
5. 进行了广泛的实验，比较了 *ESync* 与 *SSGD*[^7]、*ASGD*[^8]、*DC-ASGD*[^5]、*FedAvg*[^1]、*FedAsync*[^6]、*FedDrop*[^3] 和 *TiFL*[^4]，数值结果表明 *ESync* 可以在不损失精度的情况下实现极快的速度。

## Related Work

滞后者问题（straggler）在 FL 和传统 DML 中都存在，但由于数据孤立的特点，非独立同一分布的数据只存在于 FL 中。已有许多方案用于解决**滞后者问题**和**非独立同一分布的数据**，因此对这些方案做一些总结。

### Cross-Device and Cross-Silo FL

**滞后者问题**。
- 同步算法 FedAvg 是最广泛使用的联邦优化算法，其需要所有参与方在本地训练模型 $E$ 个 epoch 后再对各自的本地模型进行同步，然而计算设备的异质性会导致滞后者问题的出现，其会造成长时间的阻塞，显著降低训练效率和资源利用率。
- FedDrop 算法通过设置 DDL 和时间窗口过滤滞后者。对 FedDrop 的改进中，Kairouzet 等人的方案允许各方在一个固定的时间窗口内进行多次局部迭代训练； Reisizadeh 等人的方案要求各方在 DDL 前上传本地模型。
- 另一些同步方案则尝试平衡所有方的计算时间以避免阻塞。如 TiFL 在每个训练轮次中对相同计算能力的参与方进行采样，从而完成同步；Smith 等人的方案为每个参与方给予近似解决其子问题的灵活度。Li 等人的方案为各方隐式地容纳可变的 $\gamma_{k}^{t}$ -inexactness 。
- FedAsync 算法是异步的联邦优化算法，允许各参与方通过加权平均立即更新全局模型，并且引入混合超参数来缓解因滞后性（staleness）引起的错误。

**非独立同一分布数据问题**。与传统 DML 不同，不同孤立方的数据并不统一，拥有不同的分布。Yao 的论文[^2]指出梯度偏差会损害 FedAvg 的错误边界，尤其是在非独立统一分布的数据时。Zhao 等人的论文通过定义权重发散，进一步分析了 FedAvg 在倾斜的 non-i.i.d. 的数据上的性能下降。
- 为了减轻 non-i.i.d. 数据的影响，一些方法尝试调整超参数并添加目标约束。Yu 的论文建议减少局部迭代次数，以抑制梯度偏差。Li 的论文建议衰减学习率以保持收敛速度。 Li Tian 的论文在目标损失中添加了一个近端项，以迫使局部模型更接近全局模型。
- 其他方法扩展了各方的局部数据，以减少数据分布的差异。扩展数据可以是各方共享的一小部分数据、少量蒸馏数据或由共享生成模型生成的假数据。 由于需要共享可能包含原始数据隐私的数据，这些方法存在隐私泄露的风险。

### Traditional DML

**滞后者问题**。没有通信瓶颈的限制，传统 DML 倾向于使用基于高频同步 SSGD 的算法，因为它们比 FedAvg 收敛速度快很多。但是计算设备的快速升级导致部分研究中心无法及时升级所有老旧设备，这导致数据中心中的滞后者问题并且阻塞整个系统。
- 解决方案依旧可以分为同步和异步两种。对于**同步方案**，Chen 等人的论文提出了备份工作者（backup worker）并放弃来自滞后者的落后模型。Yang 等人的论文提出通过最小最大整数规划（min-max integer programming）[^9]来平衡基于计算能力的小批量（mini-batch）的规模。其他方案则使用冗余信息还原滞后者的信息，例如 Ferdinand 等人的论文中将数据分解为若干固定的块，再将每个块分发给多个工作者，通过限制计算时间，这个方法可以通过其他工作者的冗余数据恢复滞后者上丢失的数据。Tandon 等人的论文还表明，复制数据块和跨梯度编码可为同步算法提供对滞后者的容忍度。基于冗余编码的方法在传统 DML 中效果很好，但由于共享数据块，这些方法侵犯了隐私，因此不适合域内 FL。
- 以 ASGD 为代表的**异步方案**允许滞后者更新全局模型而不阻塞其他工作者，因此对异构计算有天然的容忍度。但是 ASGD 更新全局模型时使用的是陈旧梯度，因此模型和梯度之间的分歧会混淆优化公式，导致精度下降。为了抑制陈旧梯度的影响，有 3 种方法通过精心设计的学习率对陈旧梯度进行惩罚。 Ho 等人的方案允许计算能力强的工作者在一定的迭代次数内比滞后者更快。 MXNet-G 将工作者划分为同质组，在组内和组间分别采用 SSGD 和 ASGD，并根据每个梯度的陈旧程度分配一个加权因子。还有一些方法试图对陈旧梯度进行补偿，其中最具代表性的是 Zheng 等人提出的方法（DC-ASGD），他们利用梯度函数泰勒展开的一阶项对陈旧梯度进行补偿。

**非独立同一分布数据问题**。在传统的 DML 中，训练数据是 i.i.d. 的、混合的数据，但在域内 FL 中，由于各方之间的数据隔离，非 i.i.d. 数据仍然存在。幸运的是，Koloskova 等人证明了 SSGD 在非 i.i.d. 数据上与 i.i.d. 数据上具有相同的收敛率。因此，在域内 FL 中，高频同步算法是首选。

ESync 的优点在于：
1. 没有丢弃的滞后者中的信息；
2. 没有共享数据块
3. 没有陈旧的梯度
4. 没有额外的超参数
5. 无需调整超参数
6. 可以适应动态资源。

通过这种方式，ESync 可以加快收敛速度，同时保护隐私并无损地保持准确性。

## Architectures Design

同步需要等待工作者的所有更新。 为了避免阻塞，工作者需要决定本地迭代次数，以平衡计算时间。但是，工作者之间不知道彼此的状态和进度，因此无法独立决定本地迭代次数。本文在 Parameter Server 架构中引入了新式调度器 State Server，用于共享状态和进度，协调所有工作者的同步节奏。

### Overview

![[Esyncnotes-fig2-overview.png]]

架构概略图如 Fig 2 所示，包含 State Server、Parameter Server、几组 worker，其中 State Server 和 Parameter Server 都位于中央参与方（central party）中，而每个 worker 则位于拥有私有数据的参与方中.

worker 在本地数据上对本地模型进行多次迭代训练，迭代次数由 State Server 自适应地协调，然后将更新推送到 Parameter Server 进行同步。Parameter Server 会对更新进行平均处理，并将平均后的更新同步给所有工作者。请注意，当 worker 数量较多时，可以使用多个 Parameter Server 来平衡流量负载。在这种情况下，每个 Parameter Server 管理不同部分的同步更新。

State Server 监控所有 worker 的实时状态和进度，并查询的 worker 决定其本地迭代次数。为了支持高并发状态查询，State Server 使用轻量级状态控制消息与 worker 交互，并使用多线程任务引擎来操作无锁状态表。

由于共享数据中心存在资源竞争，各方的计算能力和带宽可能会随时间发生变化。为了适应动态资源， State Server 会响应下一个行动，而不是静态设置的本地迭代次数，工作流程可以用下面的序列表示：
$$
\{\underbrace{①②③...①②③}_{i_{k}\text{ local iterations}}④⑤\}
$$
worker $k$ 无论本地迭代 $①$ 何时结束，都应向 State Server 查询下一个动作 $②③$ 

每当完成一次本地迭代 $①$ 时，worker $k$ 就应向 State Server 查询下一个动作 $②③$ 。然后，当收到下一个动作是 `TRAIN` 时，它继续本地迭代 $①$ ，并在收到 `SYNC` 时同步更新 $④⑤$ 。这样，本地迭代次数 $i_{k}$ 就会根据接收到 `TRAIN` 的次数自适应地变化。

### State Server

![[Esyncnotes-fig3-state-server-impl.png]]

如 Fig 3 所示，State Server 包含消息接收方、消息发送方、FIFO 消息队列、消息路由器、状态数据库、以及一系列消息管理者（掌管报告、重置、查询等职）。在实现中，基于 ZeroMQ 消息库构建了发送方和接收方。

消息队列用于缓冲接收到的消息、平滑峰值工作负载。接收方监听来自 worker 的消息，并且在消息队列中缓冲这些收到的消息。这些缓冲的消息在被消息路由器处理前会一直保存在消息队列中。消息路由器会根据 `msg_type` 字段将消息发送给对应的处理程序。以查询处理程序（query handler）为例，查询处理程序会根据消息所附的字段更新状态数据库中查询工作者的记录。如果查询处理程序能在滞后者上传更新之前执行另一次迭代，查询处理程序就会输出动作 `TRAIN`（否则，输出操作 `SYNC`）。然后，消息发送方会将该操作封装到状态响应消息中，并将消息回复给查询工作者。

#### Message Format & Message Type

![[Esyncnotes-fig4-message-format.png]]

Fig 4 展示了消息的结构——包含发送方标识 `sender_id`、接收方标识 `recver_id`、消息类型 `msg_type`、最新状态 `status`、下一动作 `action` 。
- `sender_id` 和 `recver_id` 字段用于索引发送方和接收方的套接字通道。
- `msg_type` 字段用于信息路由器将信息转发给相应的处理程序。可选值为 `{RESET, REPORT, QUERY, RESPONSE}`。
- `action` 字段用于通知查询工作者下一步要执行的操作。
- 只有当 `msg_type` 为 `RESPONSE`，且可选值为 `{TRAIN, SYNC}` 时，该字段才有意义。
- `status` 字段由处理程序用来更新状态数据库中的记录，包括 worker 的等级 $k$（rank）、本地迭代计数器 $i_{k}$（iteratioin）、同步轮计数器 $r_{k}$（round）、本地迭代的计算时间 $c_{k}$（computation time）、推送一个更新到 parameter server 的传输时间 $m_{k}$（transmission time）、以及当这条消息被发送时的时间戳 $t_{k}$（timestamp）。

 State Server 有四种信息，包括状态重置（state reset）信息、状态报告（report）信息、状态查询（query）信息和状态响应（response）信息。
 - 状态重置消息由 Parameter Server 发起，用于初始化状态数据库中的记录。
 - 状态报告消息由 worker 发起，目的是将其状态和进度（附在消息的 `status` 字段中）同步到 State Server 。
 - 状态查询消息由 worker 发起，目的是查询 State Server 以获取下一步操作，并在消息的状态字段中附加最新的状态和进度。
 - 状态响应消息由 State Server 用来通知查询 worker 下一步操作。

#### State Database

消息处理程序的运行过程是单线程的，一次只能处理一条消息，这导致消息在消息队列中累积。为了减少查询信息的响应延迟，状态数据库使用多线程异步任务引擎来运行无锁状态表。

![[Esyncnotes-fig5-state-database.png]]

如 Fig 5 所示，状态数据库包含一个任务队列、一个任务引擎和一个状态表。消息处理程序将任务推送到任务队列，并继续处理下一条消息，然后这些任务等待任务引擎处理。

任务队列将消息处理程序和任务引擎分离开来。消息处理程序可以更高效地处理消息，避免消息的累积和丢失。另一方面，任务引擎会将队列中的任务提交给线程池，并运行多个空闲线程来并行执行这些任务。这些线程同时读写无锁状态表。状态表记录了 `status` 字段中的所有字段（即 rank $k$、iteration $i_{k}$、round $r_k$、computation time $c_k$、transmission time $m_k$、timestamp $t_k$）以及正在执行的操作（action $a_k$）。

不同线程同时读写同一字段可能会造成混乱。我们分析了可能出现的情况，并在算法 1 中进行了修正，以确保读写混淆不会导致查询结果错误。

假设一个滞后者的 rank 是 $s=1$ ，并且延迟定义为计算时间和传输时间之和 $d_{k}=c_{k}+m_{k}$ ，延迟满足 $d_{s}=d_{1}\ge d_{2}\ge...\ge d_{k}\ge...\ge d_{K}$ （$K$ 是所有 work 的数量，$k$ 在很小范围内变动）。为了确定查询 worker $k$ 的下一动作，任务引擎使用消息所附带的状态 $(k,i_{k},r_{k},c_{k},m_{k},t_{k})$ 来更新状态表，遍历状态表就可以找到滞后者 $s$ ：
$$
s=\underset{k}{\arg\max}\ d_{k},\quad(k\in[1,K]),\tag{1}
$$
并将滞后者的状态六元组 $(s,i_{s},r_{s},c_{s},m_{s},t_{s})$ 返回给查询处理程序。查询处理程序会给出滞后者 $s$ 何时提交其更新的估计时间 $\hat{t}_{s}$ ：
$$
\hat{t}_{s}=t_{s}+d_{s},\tag{2}
$$
并检查查询工作者 $k$ 是否在 $\hat{t}_{s}$  时间内再进行一轮迭代：
$$
t_{c}+d_{k}\le\hat{t}_{s},\tag{3}
$$
这里 $t_c$ 是查询处理程序上的当前时间戳。如果此式成立，则消息发送方返回一个状态响应消息 `action=TRAIN` 给查询工作者 $k$ （$k$ 就可以多进行一次训练），否则发送 `action=SYNC` 要求其更新全局模型。

## Modeling and Algorithm

>给出数学建模以及 State Server 协调的算法。

### Problem Modeling

首先来定义域内 FL 问题，其有 $K$ 个孤立的参与方，在共享数据中心内协作训练一个 $C$ -class 的分类模型。参与方 $k$ 拥有 $n_{k}$ 个采样：$(\mathcal{X}_{k},\mathcal{Y}_{k})=[(x,y)]_{{n}_{k}}$ ，采样遵循分布 $p_{k}$ ，并且这些采样被划分为尺寸 $b$ 的小组。本文的目标是**最小化 (a) 全局损失（global loss）和 (b) 阻塞时间（blocking time）**。

#### Minimize Global Loss

定义函数 $f$ ，其通过权重参数 $w$ ，将输入 $x$ 映射到概率向量 $\tilde{y}$ ，并用 $f_c$ 表示分类 $c$ 的概率，使用交叉熵损失作为损失函数 $l$ ，则
$$
l(w,x,y)=\sum\limits_{c=1}^{C}p(y=c)[\log f_{c}(x,w)].\tag{4}
$$
接着，定义参与方 $k$ 在本地数据集 $(\mathcal{X}_{k},\mathcal{Y}_{k})$ 上训练本地模型 $w$ 的损失函数为 $l_{k}$ 
$$
l_{k}(w,\mathcal{X}_{k},\mathcal{Y}_{k})=\sum_{(x,y)\in(\mathcal{X}_{k},\mathcal{Y}_{k})}l(w,x,y).\tag{5}
$$
为了简化分析，忽略了正则项 $\Omega(f)=\lambda||w||_{q}^{q}$ 。全局损失函数 $l_{g}$ 的定义为
$$
l_{g}(w,\mathcal{X}_{k},\mathcal{Y}_{k})=\sum\limits_{k=1}^{K} \frac{n_{k}}{n}l_{k}(w,\mathcal{X}_{k},\mathcal{Y}_{k}).\tag{6}
$$
这里 $n=\sum\limits_{k=1}^{K}n_{k}$ 是所有数据集 $(\mathcal{X},\mathcal{Y})$ 的采样总数。因此，最小化全局损失的目标就是使得 $l_{g}$ 最小且找到最优权重 $w^{*}$ 
$$
w^{*}=\underset{w}{\arg\min}\ l_{g}(w,\mathcal{X},\mathcal{Y})\tag{7}
$$
#### Minimize Blocking Time

对于参与方 $k$ ，其有计算耗时 $c_{k}$ 和传输耗时 $m_{k}$ ，故总的延迟为 $d_{k}=c_{k}+m_{k}$ 。找出计算耗时和传输耗时中的极值：$c_{max}=\max \{c_{k}|k\in[1,K]\},c_{min}=\min\{c_{k}|k\in[1,K]\}$，$m_{max}=\max \{m_{k}|k\in[1,K]\},m_{min}=\min\{m_{k}|k\in[1,K]\}$ 。定义计算异构性为 $h_{c}=\frac{c_{max}}{c_{min}}$ ，通信异构性为 $h_{m}=\frac{m_{max}}{m_{min}}$ 。

![[Esyncnotes-fig7-esync-timeline.png]]

Fig 7 展示了所提出算法 ESync 的时间线，其核心思想是利用阻塞时间让计算能力强的一方训练更多的轮次。因此，参与方 $k$ 的阻塞时间可以定义为
$$
d_{k}^{\text{wait}}=c_{s}+q_{s}+m_{s}-i_{k}(c_{k}+q_{k})-m_{k},\tag{8}
$$
这里 $s$ 指的是滞后者，$q_{s}$ 和 $q_{k}$ 分别是滞后者与参与者的查询时间，并且阻塞时间 $d_{k}^{\text{wait}}\ge 0$ 总是成立的。

由于数据中心网络的特点是强计算异构性（$h_{c}\le300$）、弱通信异构性（$h_{m}\approx1$）、拥有充足的带宽，因此为了简便，认为 `式 8` 中的 $q_{s}=q_{k}\approx0$ （查询时间较计算耗时和通信耗时可忽略）并且 $m_{s}=m_{k}$ 。

因此最小化阻塞时间的目标，等价于寻找一个最佳策略 $\pi$ 来协调每个 worker 的本地迭代次数 $i_{k}(\pi)$ 使得整体阻塞时间最小：
$$
\underset{\pi}{\text{minimize}}\quad d^{\text{wait}}=\sum_{k\in[1,K],k\ne s}(c_{s}-i_{k}(\pi)c_{k}).\tag{9}
$$

### Algorithm Design

![[Esyncnotes-fig6-SSGD-Esync.png]]

如 Fig 6(a) 所示，SSGD 强迫所有 worker 在每轮迭代时同步各自的本地模型，因此计算能力强的 worker 就会被拖后腿者阻塞，直到滞后者完成更新。阻塞时间对计算能力强的 worker 而言是极大的资源浪费，因此它们更希望利用这段时间进行更多的迭代，追求更高质量的本地模型，这就是 ESync 算法的目标。

如 Fig 6(b) 所示，ESync 允许计算能力强的 worker 尽可能训练更多的轮次，而不必等待滞后者，此时本地迭代次数 $i_{k}$ 自适应地由 State Server 协调。

我们定义第 r 轮训练的全局模型为 $w^{r}$ ，此时 worker $k$ 的本地模型为 $w_{k}^{r}$ ，而经过 $i$ 轮本地迭代后本地模型记为 $w_{k}^{r,i}$ ，初始模型 $w^{0}$ 由 Parameter Server 随机初始化。

*****

ESync 的经典步骤包括三步：(1). 本地训练 (2). 状态查询 (3). 全局同步。

#### Local Training

在第 $r$ 轮训练开始时，worker $k$ 从 Parameter Server 拉取全局模型 $w^{r}$ 并在本地保存一个副本 $w_{k}^{r,0}\leftarrow w^{r}$ 。接下来，对第 $i$ 轮本地训练迭代，worker $k$ 从本地数据 $(\mathcal{X}_{k},\mathcal{Y}_{k})$ 中采样获得一批数据 $(\mathcal{X}_{k}^{b},\mathcal{Y}_{k}^{b})$ ，并计算交叉熵损失以获取梯度
$$
g(w_{k}^{r,i})=\frac{1}{b}\sum\limits_{(x,y)\in(\mathcal{X}_{k}^{b},\mathcal{Y}_{k}^{b})}\sum\limits_{c=1}^{C}p(y=c)[\nabla_{w}\log f_{c}(x,w_{k}^{r,i})].\tag{10}
$$
在更新本地模型 $w_{k}^{r,i}$ 时使用基准 SGD 优化算法：
$$
w_{k}^{r,i+1}=w_{k}^{r,i}-\eta\cdot g(w_{k}^{r,i})
$$
此处 $\eta$ 是本地学习率。除了 SGD 还可以使用其他优化算法，例如 RMSProp、Adam、Momentum 等。

$$\begin{align*}\\ 
&\textbf{Algorithm 1.} \text{(Worker) }Local Training\\ 
&\textbf{Input: } 工作者的数量\ K;全局学习率\ \epsilon;传播函数\ f;\\
&每个工作者处的样本规模\ \{n_{k}\}_{K},(\forall k\in[1,K]);总样本规模\ n；最大迭代轮次\ R.\\
1:&\quad \\
2:&\quad \\
3:&\quad \\
4:&\quad \\
5:&\quad \\
6:&\quad \\
7:&\quad \\
8:&\quad \\
9:&\quad \\
10:&\quad \\
11:&\quad \\
12:&\quad \\
13:&\quad \\ 
&\textbf{Output: } \text{近似的最佳权重}w^{*}=w^{R}.\\ 
\end{align*}$$

#### State Querying

worker $k$ 需要向 State Server 发起查询以获得下一步动作的指示，因为它自己并非全知。因此 worker $k$ 向 State Server 发送查询信息，其中包含当前状态的六元组 $(k,i_{k},r_{k},c_{k},m_{k},t_{k})$ 。在 State Server 上的状态查询伪代码如下所示，决定发起查询的 worker $k$ 下一步动作的详细细节已由前文公式(1)、(2)、(3) 描述： 
$$
\begin{align*}\\ 
&\textbf{Algorithm 1.} \text{ (State Server) }StateQuerying\\ 
&\textbf{Input: } \text{状态表 }S=[(p,i_{p},r_{p},c_{p},m_{p},t_{p},a_{p})]_{\forall p\in[1,K]};\\
&\text{来自查询 worker }k\text{ 的状态查询信息中所包含的状态六元组}(k,i_{k},r_{k},c_{k},m_{k},t_{k}).\\
 \\
1:&\quad S[k].iteration=i_{k},S[k].computation\_time=c_{k},S[k].transmission\_time=m_{k},\\
&\quad S[k].timestamp=t_{k};//更新\text{ worker }k\ 在状态表\ S\ 中的记录\\
2:&\quad 遍历状态表,由公式\ (1)\ 找到滞后者\ s\ ;//\text{worker }k已经进入新的迭代轮次，而滞后者没有\\
3:&\quad \textbf{If } i_{k}==0\ \textbf{ or }r_{k}>r_{s}:\\
4:&\quad\quad\textbf{return } a_{k}=TRAIN; \\
5:&\quad t_{c}=CurrentTime();//滞后者s完成其本地的训练，或者\text{worker }k时间不足以多一轮迭代\\
6:&\quad \textbf{If }k==s \textbf{ or }i_{s}==1\textbf{ or }a_{s}=SYNC\textbf{ or }不等式(3)不成立:\\
7:&\quad \quad S[k].action=SYNC//更新\text{worker }k的动作\\
8:&\quad \quad \textbf{return } a_{k}=SYNC;\\\\
9:&\quad \textbf{return } a_{k}=TRAIN;\\
&\textbf{Output: } \text{带有下一动作 }a_{k}\text{ 的状态响应信息.}\\ 
\end{align*}
$$

状态回复信息中附带的动作 $a_{k}$ 将会指导 worker $k$ 做出相应的动作。如果 $a_{k}=TRAIN$ ，则 worker $k$ 有足够的时间完成新的一轮训练 $i\leftarrow i+1$ ；否则将会收到 $a_{k}=SYNC$ ，这意味着要么滞后者 $s$ 完成其训练，要么 worker $k$ 没有足够的时间再完成一轮训练，此时的 worker $k$ 已经到达了局部训练的目标，因此应立即进行同步当前已有的数据。

#### Global Synchronization

如果收到 $a_{k}=SYNC$ ，worker $k$ 会计算其本地更新 $\Delta w_{k}^{r}$
$$
\Delta w_{k}^{r}=w_{k}^{r,i_{k}}-w_{k}^{r,0}.\tag{12}
$$
然后将该更新上传至 Parameter Server 进行合并：
$$
\Delta w^{r}=\sum\limits_{k=1}^{K} \frac{n_{k}}{n}\Delta w_{k}^{r},\tag{13}
$$
接下来被合并的更新会被 worker 们拉取并更新全局模型 $w^{r}$
$$
w^{r+1}=w^{r}+\epsilon\cdot\Delta w^{r},\tag{14}
$$ \
这里 $\epsilon$ 是全局学习率（默认设置为 1）。最新的全局模型 $w^{r+1}$ 接下来会同步给所有 worker，开启下一轮的迭代训练直到训练轮次达到最大 $R$ 。全局同步的伪代码如下：
 
$$
\begin{align*}\\ 
&\textbf{Algorithm 2.} \text{(Parameter Server) }GlobalSynchronization\\ 
&\textbf{Input: } 工作者的数量\ K;全局学习率\ \epsilon;传播函数\ f;\\
&每个工作者处的样本规模\ \{n_{k}\}_{K},(\forall k\in[1,K]);总样本规模\ n；最大迭代轮次\ R.\\
1:&\quad \\
2:&\quad \\
3:&\quad \\
4:&\quad \\
5:&\quad \\
6:&\quad \\
7:&\quad \\
8:&\quad \\
9:&\quad \\
10:&\quad \\
11:&\quad \\
12:&\quad \\
13:&\quad \\ 
&\textbf{Output: } \text{近似的最佳权重}w^{*}=w^{R}.\\ 
\end{align*}
$$




## Convergence Analysis

## Experimental Evaluation

### Experimental Setup

### Numerical Results

[^1]: Mcmahan, H., et al. Communication-Efficient Learning of Deep Networks from Decentralized Data.
[^2]: Yao, Xin, et al. “Federated Learning with Unbiased Gradient Aggregation and Controllable Meta Updating.” Cornell University - arXiv, Cornell University - arXiv, Oct. 2019.
[^3]: Bonawitz, Kallista, et al. “Towards Federated Learning at Scale: System Design.” Proceedings of Machine Learning and Systems, Proceedings of Machine Learning and Systems, Apr. 2019.
[^4]: Z. Chai et al., "TiFL: A tier-based federated learning system," 2020, arXiv: 2001.09249.
[^5]: Zheng, Shuxin, et al. “Asynchronous Stochastic Gradient Descent with Delay Compensation.” arXiv: Learning, arXiv: Learning, Sept. 2016.
[^6]: Xie, Cong, et al. “Asynchronous Federated Optimization.” arXiv: Distributed, Parallel, and Cluster Computing, arXiv: Distributed, Parallel, and Cluster Computing, Mar. 2019.
[^7]: Zinkevich, Martin, et al. “Parallelized Stochastic Gradient Descent.” Neural Information Processing Systems, Neural Information Processing Systems, Dec. 2010.
[^8]: Dean, J. Michael, et al. “Large Scale Distributed Deep Networks.” Neural Information Processing Systems, Neural Information Processing Systems, Dec. 2012.
[^9]: [Integer programming - Wikipedia](https://en.wikipedia.org/wiki/Integer_programming?useskin=vector)