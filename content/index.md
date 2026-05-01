---
title: Welcome to Senj's Digital Garden
publish: "true"
tags:
  - quartz
  - Blog
date: 2026-02-23
---
欢迎来到我[^1] 的数字花园，这里记录着我在学习、研究与生活中的阅读、实践与思考，也记录着我最近在追什么、想什么。它们是我落下的种子——有些已抽出花穗，有些还只是青苗。花簇尚在生长，远未成林，但我愿它岁岁春风，不绝于此。欢迎阅读，也敬祈斧正。😄

> PS. 如果这个仓库对你有所启发，欢迎你把它 fork 成自己的 PKM base，让知识的种子落在更广阔的世界。若有问题交流，欢迎来邮：`lisj24 at mails.tsinghua.edu.cn`，或于页底评论区[^2] 中留言。

> [!tip]+ A Small Corner Before You Start
> ![[未闻花名.png|560]]
> ![[V.A. - 未闻花名 (口琴版).mp3]]
>
>> [!tldr] Quick Jump
>>  [[#Gates to My Garden|入园之门]] · [[#Seasonal Blooms|今春所念]] · [[#Annual Rings|莳花年谱]] · [[#My CS Career Roots & Branches|知识土脉]] · [[#The Bulletin Board|本园小记]]

## Gates to My Garden

> *轻叩一门，自不同角度窥得花园一角的风光。*

**CS Foundations**：[[数值分析笔记|数值分析]] · [[DSACpp|数据结构与算法]] · [[Internal&Design-Principle-Notes|操作系统]] · [[Top2down-Summary|计算机网络]] · [[RISC-V-Briefing-Manual|RISC-V]]

**AI and Deep Learning**：[[ML-Foundations-Index|机器学习基石]] · [[ML-Techniques-Index|机器学习技法]] · [[Dive-Into-DL|动手学深度学习]] · [[The Scaling Book|The Scaling Book]]

**Inference and LLM Infra**：[[How-to-build-a-inference-engine|推理引擎]] · [[All About LLM Inference|LLM 推理综述]] · [[nano-vLLM-1|nano-vLLM]] · [[How to Parallelize a Transformer for Training|训练并行策略]]

**Data Center Network**：[[Jupiter_Rising：Annotation|Jupiter Rising]] · [[Jupiter_Evolving：Conclusion|Jupiter Evolving]] · [[UB-Mesh-Annotation|UB-Mesh]] · [[CloudMatrix384-Serving-for-LLM-Annotation|CloudMatrix384]]

**GPU and Parallel Computing**： [[Learning CUDA Programming|CUDA]] · [[OpenCL-Learning|OpenCL]] · [[NCCLX 100k+ GPU CollComm|集合通信]]

**Tools and PKM**：[[Git小结|Git]] · [[Obsidian高阶技巧总结|Obsidian]] · [[00-About-mermaid|Mermaid]] · [[My-ENotes-System|E-Notes System]]

**Research Archive**：[[Paper Reading Records|论文阅读记录]] · [[Paper-Reading-Methods|论文阅读方法]] · [[Archive of Report Slides|组会汇报]] · [[LLM-Weekly|LLM Weekly]]

> [!note] If you are new here
> 
> - 想先看**现在我最投入的方向**，可以从 [[nano-vLLM-1|推理引擎]]、[[CloudMatrix384-Serving-for-LLM-Annotation|AI 数据中心网络]] 和 [[NCCLX 100k+ GPU CollComm|集合通信]] 开始。
> - 想沿着 LLM Infra / System for AI 这条线系统地读下去，建议先看 [[The Scaling Book|The Scaling Book]]，再读 [[All About LLM Inference|LLM 推理综述]] 和 [[How to Parallelize a Transformer for Training|训练并行策略]]，脉络会更顺。
> - 如果更关心论文阅读与研究积累，可以先去 [[Paper Reading Records|论文阅读记录]] 和 [[Paper-Reading-Methods|论文阅读方法]]，再翻 [[Archive of Report Slides|组会汇报记录]]。
> - 如果对工程工具、写作和知识管理更感兴趣，不妨从 [[My-ENotes-System|Obsidian + Quartz 知识管理系统]]、[[Obsidian高阶技巧总结|Obsidian 高阶技巧]] 和 [[Git小结|Git 小结]] 开始。

## Seasonal Blooms

> *沿着时光的小径，遍览来时路上播种所开之花。*

> [!note]+ The Latest.
> ### Inference
> 这一段时间，我深入研究“LLM 的请求如何被推理系统高效地组织与调度”，也因此开始更系统地理解推理引擎的抽象、调度与执行。
> - 2026-02：[[nano-vLLM-1|从 nano-vLLM 入门推理引擎（一）：引擎核心架构与调度设计]]
> - 2026-01：[[All About LLM Inference|关于 LLM 推理的一切（The Scaling Book Section 7）]]
> 
> ### LLM Infra
> 这一部分从基础设施的视角来看，训练并行、系统抽象与 Scaling 背后有什么工程代价？
> - 2026-01：[[How to Parallelize a Transformer for Training|How to Parallelize a Transformer for Training（训练并行策略）]]
> - 2026-01：[[The Scaling Book|The Scaling Book：LLM Infra 系统化阅读笔记（持续更新）]]
> 
> ### DeepSeek
> DeepSeek 系列的 paper/repo 是接触最前沿工业级 LLM Infra 世界的绝佳窗口。
> - 2025-12：[[Dive-into-EPLB|从 EPLB 算法到 DeepSeek V3 推理实践的分析]]
> - 2025-05：[[Insights-into-DeepSeek-V3-Annotation|Insights into DeepSeek-V3：软硬协同与 Infra 视角解读]]
> - 2025-02：[[DeepEP|DeepEP：MoE/EP 通信库笔记]]
> - 2025-02：[[DeepSeek_V3_Report：Annotation|DeepSeek V3 Technical Report：Annotation]]
> 
> ### Data Center Network
> 随着训练与推理系统的规模不断增大，网络不再只是背景设施，而逐渐成为塑造系统性能比边界的关键约束。这一条路径里，我主要从架构、路由、拥塞控制与 AI workload 视角去进行阅读和整理。
> - 2025-06：[[CloudMatrix384-Serving-for-LLM-Annotation|CloudMatrix384：面向 MoE 的 LLM Serving 架构笔记]]
> - 2025-04：[[UB-Mesh-Annotation|UB-Mesh：华为面向 AI 的数据中心网络架构笔记]]
> - 2025-03：[[RDMA-over-Ethernet-for-Distributed-AI-Training：Conclusion|RDMA over Ethernet for Distributed AI Training：Conclusion]]
> - 2025-03：[[Primus-a_centralized_routing：Annotation|Primus：centralized routing：Annotation]]
> - 2025-03：[[Jupiter_Rising：Annotation|Jupiter Rising：Annotation]]
> - 2025-03：[[Jupiter_Evolving：Conclusion|Jupiter Evolving：Conclusion]]
> - 2024-09：[[Characterization of LLM Development in the Datacenter：Annotation|Characterization of LLM Development in the Datacenter：Annotation]]
> 
> ### GPUs, Kernels, and Collective Communications
> 从 GPU 编程、并行计算、集合通信出发，是串联高效的大型系统的必由之路。
> - 2025-12：[[NCCLX 100k+ GPU CollComm|NCCLX：100k+ GPU 如何集合通信？]]
> 
> ### Methodology for good research
> 除了追具体的论文，我也在尝试将“如何读 paper、如何组织研究问题”这件事慢慢形成自己的方法论。
> - 2025-03：[[Paper-Reading-Methods|Paper Reading：Methods]]

## Annual Rings

> 年轮刻于此，记录一草一木的春秋。我这懒鼠，总爱储粮满仓，却常忘了细嚼。
> J人的宿命：完美计划 → 半途而废 → 弃之重来。螺旋上升，乐此不疲。😂

### Learn in 2024

> 播撒种子。

> [!success]+ 春播秋收，今岁登科🎉
>
> - 我的清华计算机考研复习经验： [[How-to-prepare-for-11912-effectively|如何高效备考 11912？]]
> - 我这十多年的学习经验与絮絮叨： [[从山西小镇做题家到北雷村再到五道口]]

> [!Abstract]- 此年多眠，未敢云勤 😢
>
> - [X] 1 月 ~ 3 月：准备复试内容、参加机试与面试、撰写 [[How-to-prepare-for-11912-effectively|上岸经验贴]] ；
> - [X] 4 月 ~ 8 月：开学前的准备
>   - [X] [[如何科学、高效地减脂？|健身减肥计划]]
>   - [X] 阅读《毛泽东选集》
>   - [ ] 阅读《费曼的物理学讲义》
>   - [ ] ~~深入学习现代 Cpp 、Python~~、Rust
>   - [ ] 深入学习线性代数和概率论，夯实深度学习的基础
>   - [ ] ~~深入学习网络协议~~
> - [ ] 9 月 ~ 12 月：研究生理论课程学习+论文阅读找 idea
>   - [X] [[数值分析笔记|数值分析]]
>   - [X] 计算机网络体系结构
>   - [ ] 联邦学习
>   - [ ] 精读 40 篇论文： [[Paper Reading Records]] ，寻找研究方向及 idea

### Learn in 2025

> 合抱之木，生于毫末；含英咀华，始作文章。

- [x] 1 月 ~ 2 月：开展科研工作的前置学习
    - [x] 阅读 DeepSeek 的 [[DeepSeek_V3_Report：Annotation|Tech Report]]
    - [ ] 学习 NCCL/MSCCL 库及 GPU 基础知识
    - [ ] 广泛阅读论文，记录在册： [[Paper Reading Records]] ；
- [ ] 3 月 ~ 5 月：初步开展科研工作
	- [ ] 学习 CUDA 编程
	- [ ] 保持对 DeepSeek、Kimi、Minimax 等前沿公司的技术的追更
	- [x] 寻找数据中心内路由系统和容错系统的 idea
- [ ] 6 月 ~ 9 月：
	- [ ] 每周了解一个 LLM/LLM Infra 相关的新知识： [[LLM-Weekly]]
	- [ ] 搭建路由系统

### Learn in 2026

> 这一年的故事还在写，等它慢慢长出来。

## My CS Career: Roots & Branches

> *土壤、根系与枝干——此园之根本*。

### The Soil: Computer Science Foundations

>  *坚实的计算机科学基础是支持知识盛放的丰沃土壤*。

1. 数学基础：[[数值分析笔记|数值分析]] · 矩阵分析 · 离散数学 · 概率论 · 信息论
2. 编程语言：[[C++学习之路|C++]] · [[Python学习之路|Python]] · Rust
3. 数据结构与算法： [[DSACpp|数据结构笔记]]（from [THU 邓俊辉老师](https://dsa.cs.tsinghua.edu.cn/~deng/ds/dsacpp/) ） · AcWing [[AcWing基础篇|算法基础课]] 
4. 操作系统：[[Internal&Design-Principle-Notes|OS精髓与设计原理读书笔记]] · rCore Tutorial Book v3
5. 计算机组成原理：CSAPP · [[RISC-V-Briefing-Manual|RISC-V简明手册]] · [[THU-Computer-Organization]]（from THU 刘卫东老师）
6. 计算机网络： [[Top2down-Summary]]
7. 软件工程： [[Software-Construction-notes|软件工程]]（from THU 刘强）
8. GPU 编程：Triton 编程 · [[Learning CUDA Programming|CUDA 编程]] · [[OpenCL-Learning|OpenCL 编程]] 
9. 编译原理：[[LLVM-Intro]]
10. 系统安全： [[传统的检测方法小结|安全检测方法小结]]

### The Blossom: AI and Infrastructure

> *花不争春而春不负，果不期岁而岁自偕。唯静候天时，坐看云开。*

1. 机器学习： [[ML-Foundations-Index|机器学习基石]]（from [NTU 林轩田](https://www.csie.ntu.edu.tw/~htlin/mooc/)） · [[ML-Techniques-Index|机器学习技法]]
2. 深度学习：[[Dive-Into-DL]]
3. System for AI：[[How-to-build-a-inference-engine]]
4. LLM：[[Understand RoPE]] · [[DeepSeek-MLA-Principle]] · [[Training LLaMA 3 on TPUs]]
5. 强化学习：

### Hands in the Dirt

> *纸上得来终觉浅，绝知此事要躬行。*

1. Front End：[[使用nvm管理nodeJS环境]]
2. Mobile End：[[hello_world]] · [[start_kotlin]] · [[Activity]]
3. Back End：[[01-Flask介绍|Flask 介绍]] · [[05-数据库|数据库]] · [[08-缓存系统|缓存系统]] · [[09-实战项目pythonbbs|pythonbbs 实战]]
4. Vibe Coding： [[如何编写一份优秀的 CLAUDE|How to write a good CLAUDE.md]]

### Tending New Sprouts

> 含英咀华，种玉于田。培花之术，亦可治学。

1. 论文阅读记录：[[Paper Reading Records]]
2. 组会汇报记录：[[Archive of Report Slides]]
3. 科研周报：

### Garden Instruments

> 工欲善其事，必先利其器。

1. 系统环境：[[ArchLinux使用笔记]] · [[Windows下奇奇怪怪的需求与解决方案]]
2. Git 与构建：[[Git小结]] · [[Modern-CMake-By-Example|CMake]] · [[Maven]] · [[Mamba]] · [[vcpkg]]
3. 写作与知识管理：[[Obsidian高阶技巧总结]] · [[My-ENotes-System]] · [[00-About-mermaid|Mermaid]]

### Things Beyond The Hedge

> 虚拟世界的方寸之外，更是大有可为的广阔天地。计算机只是我一时的田垄，而非世界之边界。

#### Exploring Nature

> 且留半亩未垦闲田，待我理毕他事，再来精修此圃。

#### Garden Lore

> 术语、掌故与旧物细节之间，亦自有另一层计算机世界的人情与风骨。

1. 名词与掌故：[[what is the meaning of foo in computer coding]] · [[What-is-tty-in-Linux？]] · [[The-TTY-Demystified]] · [[Programming Fonts]] · [[bss段为什么表示未初始化数据？]]

#### Walking Through Life

> 行路、求学、备考与回望，亦皆是园中四时。

1. 求学与备考：[[How-to-prepare-for-11912-effectively|如何高效备考 11912？]] · [[复试学习计划]] · [[复试导师收集]]
2. 来路回望：[[从山西小镇做题家到北雷村再到五道口]]

#### Among Fellow Gardeners

> 此园非独我一人之园，亦与古今耕者共之。

1. Marx & Engels：梦开始的地方 [[共产党宣言]]
2. Lenin：[[列宁文集]]
3. 毛泽东：[[论持久战]]
4. 邓小平：[[中国共产党中央委员会关于建国以来党的若干历史问题的决议]]

### Root Care

> 根强则叶茂，身健而园盛。

1. 养身如养花：[[如何科学、高效地减脂？]] · [[叶黄素的食补疗养]]

## The Bulletin Board

此园尚在生长，不急成林。园中有我整理过的知识模块，有科研跋涉的脚印，也有工具、写作与日常管理的琐屑痕迹。

- 若愿循主题缓读，可返 [[#My CS Career|园中土脉]]；

- 若只窥近日所念，径往 [[#What I'm Thinking About|今春所念]]；

- 若好奇此园如何搭就，可阅 [[My-ENotes-System|如何用 Obsidian + Quartz + GitHub Pages 筑园记]]；

- 若欲访邻园风光，亦请 [[Outside Links|出户一观]]。

---

[^1]: 亦可唤我笔名——“花间有酒醉今人”，花开堪折直须折，莫待无花空折枝。

[^2]: Powered by [giscus](https://giscus.app/zh-CN).
