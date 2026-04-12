---
title: Welcome to Senj's Digital Garden
publish: "false"
tags:
  - quartz
  - Blog
  - homepage
  - draft
date: 2026-03-29
---

欢迎来到我[^1] 的数字花园。这里放着我在学习、研究与生活中的阅读、思考、整理与实践。你可以把它当成一个不断生长的笔记库，也可以把它当成一个追踪我最近在看什么、在想什么的小站。如果有问题交流，欢迎来邮：`lisj24 at mails.tsinghua.edu.cn`，或者在本博客页底的评论区[^2] 中发起讨论。

> [!tip] A Small Corner Before You Start
> ![[未闻花名.png|560]]
> ![[V.A. - 未闻花名 (口琴版).mp3]]

> [!tip] A Map For This Page
> 如果你知道自己想看哪一部分，可以直接从这里跳转。  
> [[#Doors to Different Worlds|快速入口]] · [[#What I'm Thinking About|当前关注]] · [[#If You Are New Here|从这里开始读]] · [[#My CS Career|知识栈地图]] · [[#Trails of Research|研究档案]] · [[#Fresh Off The Desk|最近更新]] · [[#About This Garden|关于这个站]]

## Doors to Different Worlds

这一节更像一张“词云式导航图”。我平时回到这个仓库时，通常就是从这些门里快速进入某一个知识模块。纯 Markdown 里很难做真正的词云，但这种密集的名词入口已经能比较好地承担同样的功能。

**CS Foundations**：[[数值分析笔记|数值分析]] · [[DSACpp|数据结构与算法]] · [[Internal&Design-Principle-Notes|操作系统]] · [[Top2down-Summary|计算机网络]] · [[RISC-V-Briefing-Manual|RISC-V]]

**AI and Deep Learning**：[[ML-Foundations-Index|机器学习基石]] · [[ML-Techniques-Index|机器学习技法]] · [[Dive-Into-DL|动手学深度学习]] · [[The Scaling Book|The Scaling Book]]

**Inference and LLM Infra**：[[How-to-build-a-inference-engine|推理引擎]] · [[All About LLM Inference|LLM 推理综述]] · [[nano-vLLM-1|nano-vLLM]] · [[How to Parallelize a Transformer for Training|训练并行策略]]

**Data Center Network**：[[Jupiter_Rising：Annotation|Jupiter Rising]] · [[Jupiter_Evolving：Conclusion|Jupiter Evolving]] · [[UB-Mesh-Annotation|UB-Mesh]] · [[CloudMatrix384-Serving-for-LLM-Annotation|CloudMatrix384]]

**GPU and Parallelism**：[[Learning CUDA Programming|CUDA]] · [[OpenCL-Learning|OpenCL]] · [[NCCLX 100k+ GPU CollComm|集合通信]]

**Tools and PKM**：[[Git小结|Git]] · [[Obsidian高阶技巧总结|Obsidian]] · [[00-About-mermaid|Mermaid]] · [[My-ENotes-System|E-Notes System]]

**Research Archive**：[[Paper Reading Records|论文阅读记录]] · [[Paper-Reading-Methods|论文阅读方法]] · [[Archive of Report Slides|组会汇报]] · [[LLM-Weekly|LLM Weekly]]

## What I'm Thinking About

> [!note] The Shape of Inference Engines
> 这一段时间我更关注从模型执行到系统调度这一整条链路，包括推理引擎的核心抽象、请求调度、并行策略与 serving 系统设计。它既是我现在最稳定在追的一条主线，也是我后续想持续深挖的方向。
>
> 最近写下的几篇笔记：[[nano-vLLM-1|从 nano-vLLM 入门推理引擎（一）]]、[[All About LLM Inference|关于 LLM 推理的一切]]、[[How-to-build-a-inference-engine|如何构建推理引擎]]

> [!note] Networks That Start To Matter Again
> 随着训练与推理系统的规模不断增大，网络不再只是背景设施，而逐渐成为系统设计中的关键约束。我主要从架构、路由、拥塞控制与 AI workload 视角去阅读和整理这条线上的工作。
>
> 最近在整理的入口：[[CloudMatrix384-Serving-for-LLM-Annotation|CloudMatrix384]]、[[UB-Mesh-Annotation|UB-Mesh]]、[[Jupiter_Rising：Annotation|Jupiter Rising]]

> [!note] GPUs, Kernels and Collective Communication
> 这一块连接的是 GPU 编程、并行计算与大规模训练/推理系统。我比较在意的不是单独一个 kernel 或一个通信库，而是它们如何一起塑造真实系统的性能边界。
>
> 最近在看的内容：[[NCCLX 100k+ GPU CollComm|NCCLX：100k+ GPU 如何集合通信？]]、[[Learning CUDA Programming|CUDA 编程]]、[[How to Parallelize a Transformer for Training|Transformer 训练并行策略]]

## If You Are New Here

- **如果你想直接进入我最近最投入的方向**：可以从 [[nano-vLLM-1|推理引擎]]、[[CloudMatrix384-Serving-for-LLM-Annotation|AI 数据中心网络]] 和 [[NCCLX 100k+ GPU CollComm|集合通信]] 开始，它们比较能代表我现在的兴趣重心。
- **如果你想系统地看 LLM Infra / System for AI**：建议先读 [[The Scaling Book|The Scaling Book]]，再读 [[All About LLM Inference|LLM 推理综述]] 和 [[How to Parallelize a Transformer for Training|训练并行策略]]，这样脉络会比较顺。
- **如果你想看论文阅读与研究积累是怎么展开的**：可以先看 [[Paper Reading Records|论文阅读记录]] 和 [[Paper-Reading-Methods|论文阅读方法]]，再去翻 [[Archive of Report Slides|组会汇报记录]]。
- **如果你对工程工具、写作和知识管理更感兴趣**：可以从 [[My-ENotes-System|Obsidian + Quartz 知识管理系统]]、[[Obsidian高阶技巧总结|Obsidian 高阶技巧]] 和 [[Git小结|Git 小结]] 开始。

## My CS Career

这里放的是我会反复回看的长期知识骨架。相比上面的“当前关注”，这一节更偏稳定、更偏基础，也更像我给自己保留的一份路线图。

### Foundations I Keep Returning To

这些内容更偏计算机科学的底层基础，是我后面做系统、做研究时经常要回头重新翻的部分。

[[数值分析笔记|数值分析]] · [[DSACpp|数据结构与算法]] · [[C++学习之路|C++]] · [[Python学习之路|Python]] · [[Internal&Design-Principle-Notes|操作系统]] · [[THU-Computer-Organization|计算机组成原理]] · [[Top2down-Summary|计算机网络]] · [[Software-Construction-notes|软件工程]]

### AI and Infra I Care About

这一块连接的是机器学习、深度学习、LLM 与系统实现。它既是我研究兴趣的延伸，也是我之后最希望继续系统化下去的一条线。

[[ML-Foundations-Index|机器学习基石]] · [[ML-Techniques-Index|机器学习技法]] · [[Dive-Into-DL|动手学深度学习]] · [[How-to-build-a-inference-engine|推理引擎]] · [[All About LLM Inference|LLM 推理综述]] · [[The Scaling Book|The Scaling Book]] · [[Learning CUDA Programming|CUDA]] · [[OpenCL-Learning|OpenCL]]

### Research Threads I Have Been Following

这一节是更贴近“研究现场”的部分。里面有论文阅读、阶段性跟踪，也有一些我后来会继续展开的专题。

[[Paper Reading Records|论文阅读记录]] · [[Paper-Reading-Methods|论文阅读方法]] · [[Jupiter_Rising：Annotation|Jupiter Rising]] · [[Jupiter_Evolving：Conclusion|Jupiter Evolving]] · [[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion|RDMA over Ethernet for Distributed AI Training]] · [[DeepSeek_V3_Report：Annotation|DeepSeek V3 Technical Report]] · [[Insights-into-DeepSeek-V3-Annotation|Insights into DeepSeek-V3]] · [[LLM-Weekly|LLM Weekly]]

### Tools That Keep Things Running

这一块记录的是那些真正让我把事情做起来的工具与工作流。它们不一定最耀眼，但通常最常用，也最能体现我的日常实践。

[[Git小结|Git]] · [[Obsidian高阶技巧总结|Obsidian]] · [[00-About-mermaid|Mermaid]] · [[My-ENotes-System|E-Notes System]] · [[ArchLinux使用笔记|Arch Linux]] · [[Windows下奇奇怪怪的需求与解决方案|Windows 杂项问题]]

### Things Beyond The Screen

除了计算机科学之外，我也会把一些个人经历、阅读与生活记录留在这里。它们不是这个站的主线，但构成了这个花园的另一部分气味。

[[从山西小镇做题家到北雷村再到五道口|个人经历]] · [[共产党宣言]] · [[论持久战]] · [[如何科学、高效地减脂？|健康记录]]

## Trails of Research

如果把上面的内容看成“入口”和“地图”，那么这一节更像研究过程中留下的轨迹与档案。

- **论文阅读记录**：[[Paper Reading Records]]
- **论文阅读方法论**：[[Paper-Reading-Methods]]
- **阶段性跟踪**：[[LLM-Weekly]]
- **组会汇报归档**：[[Archive of Report Slides]]

## Fresh Off The Desk

这一节只保留纯时间顺序上的最近更新；如果你更想知道“我最近主要在关注什么”，看上面的 [[#What I'm Thinking About|当前关注]] 会更合适。

- 2026-02：[[nano-vLLM-1|从 nano-vLLM 入门推理引擎（一）：引擎核心架构与调度设计]]
- 2026-01：[[All About LLM Inference|关于 LLM 推理的一切（The Scaling Book Section 7）]]
- 2026-01：[[How to Parallelize a Transformer for Training|How to Parallelize a Transformer for Training（训练并行策略）]]
- 2026-01：[[The Scaling Book|The Scaling Book：LLM Infra 系统化阅读笔记（持续更新）]]
- 2025-12：[[NCCLX 100k+ GPU CollComm|NCCLX：100k+ GPU 如何集合通信？]]
- 2025-06：[[CloudMatrix384-Serving-for-LLM-Annotation|CloudMatrix384：面向 MoE 的 LLM Serving 架构笔记]]
- 2025-05：[[Insights-into-DeepSeek-V3-Annotation|Insights into DeepSeek-V3：软硬协同与 Infra 视角解读]]
- 2025-04：[[UB-Mesh-Annotation|UB-Mesh：华为面向 AI 的数据中心网络架构笔记]]

## About This Garden

这里不是一份严格排版好的教材目录，也不是一份只展示结果的作品集。更准确地说，它是一个仍在生长中的数字花园：有些部分是系统化整理过的知识模块，有些部分是论文阅读与研究跟踪的现场，有些部分则只是工具、写作与知识管理的实践痕迹。

如果你想顺着主题慢慢读，可以从上面的 [[#My CS Career|知识栈地图]] 进入；如果你只是想看看我最近在追什么，可以直接去 [[#What I'm Thinking About|当前关注]]；如果你对这个站本身是怎么搭起来的感兴趣，可以看 [[My-ENotes-System|如何利用 Obsidian + Quartz + GitHub Pages 构建个人知识管理库及博客分享站]]；如果你想从站外入口继续浏览，也可以去 [[Outside Links|通往站外]]。

---

[^1]: 你也可以叫我的笔名“花间有酒醉今人”。

[^2]: Powered by [giscus](https://giscus.app/zh-CN).
