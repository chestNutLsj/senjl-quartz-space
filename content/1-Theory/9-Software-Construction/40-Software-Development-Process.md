---
publish: "true"
tags:
  - 软件工程
date: 2024-02-07
---
## 软件过程

我们之前讲过，过程是软件开发的一个 [[1-Theory/9-Software-Construction/10-Intro#软件工程的基本要素|基本要素]] ，更进一步地，过程是**一组将输入转化为输出的相互关联或相互作用的活动**：
- 仅仅在产品做出来再做质量检测是不够的，但这样的产品未必能够满足客户的需求，这必须在软件构建过程中就加以管理；
- ![[40-Software-Development-Process-process.png]]
- 因此，必须对整个过程进行细分，规定每一个子过程的任务和先后顺序，并在各子过程完成时进行质量监测，从而保证每一个活动都达到应有的质量。

### 过程方法

**过程方法**是系统地识别和管理组织内所使用的过程，保证更有效地获得期望的结果。

通常过程可以分为三部分：管理过程、实现过程、支持过程
- ![[40-Software-Development-Process-3-processes.png]]
- 其中**实现过程**是关键环节，负责将客户需求转换为相应产品；
- **支持过程**负责提供所需要的资源，从而使得实现过程顺利完成；
- **管理过程**则是衡量和评价实现过程和支持过程的效能、建立起组织的质量管理体系；

### 软件过程

为了获得高质量软件的一系列活动，每一项活动都会产生相应的中间产品：
- ![[40-Software-Development-Process-dev-processes.png]]

为了保证软件开发过程能够按照预定的成本、进度、质量顺利完成，还需要一系列软件项目管理、软件配置管理、软件质量保证等一系列开发管理活动，**通过建立整个组织的质量管理体系，实现对整个软件开发实现活动的有效控制和质量保证**。

### 软件开发活动

对于软件过程的五个阶段，各有需要完成的任务：
1. **问题定义**：
	- 人们通过开展技术探索和市场调查等活动，研究系统的可行性和可能的解决方案，确定待开发系统的总体目标和范围
	- ![[40-Software-Development-Process-problem-define.png]]

2. **需求开发**：
	- 在可行性研究之后，分析、整理和提炼所收集到的用户需求，建立完整的需求分析模型，编写软件需求规格说明
	- ![[40-Software-Development-Process-requirement-dev.png]]
	- 分析需求建模也不是一蹴而就的，可能还需要返回调查步骤深入的收集其它信息；

3. **软件设计**：
	- 根据需求规格说明，确定软件体系结构，进一步设计每个系统部件的实现算法、数据结构及其接口等
	- ![[40-Software-Development-Process-software-design.png]]
	- 首先要从大局上制定出软件的结构，然后制定各模块间的接口，进一步设计每个模块的数据结构等具体，当然也少不了数据库的设计；

4. **软件构造**：
	- 概括地说是将软件设计转换成程序代码，这是一个复杂而迭代的过程，要求根据设计模型进行程序设计以及正确而高效地编写和测试代码
	- ![[40-Software-Development-Process-construction.png]]
	- 构造过程中，并不是一蹴而就的，编写单元测试、代码，进行代码审查、优化，构建软件系统、继承联调等步骤是迭代的、循环的，只要达到用户的要求才能确定最终的源代码；

5. **软件测试**：
	- 检查和验证所开发的系统是否符合客户期望，主要包括单元测试、子系统测试、集成测试和验收测试等活动
	- ![[40-Software-Development-Process-test.png]]

6. **软件维护**：
	- 交付代码后并非万事大吉，还需要持续地改进，以适应不断变化的需求。一次开发终身使用的系统很少，将软件系统的开发和维护看成是一个连续过程更有意义
	- ![[40-Software-Development-Process-maintain.png]]
	- 完全从头开发的软件只是很少见的情况，借鉴已开发好的软件，使开发与维护交替，是更常见的模式；

### 软件开发管理

前面提到为了保证中间环节的质量，我们必须进行项目管理和配置管理：
1. **软件项目管理**：
	- 为了使软件项目能够按照预定的成本、进度、质量顺利完成，而对成本、人员、进度、质量和风险进行控制和管理的活动
	- ![[40-Software-Development-Process-project-manage.png]]

2. **软件配置管理**：
	- 通过执行版本控制、变更控制的规程，并且使用合适的配置管理软件，来保证所有产品配置项的完整性和可跟踪性
	- ![[40-Software-Development-Process-dev-manage.png]]

## 软件过程模型

软件过程模型是对软件过程的抽象描述，定义任务之间关系、规程、方法。软件过程模型通常可分为四类：
1. **瀑布模型**：
	- 将基本的开发活动看成是一系列界限分明的独立阶段，这是一种计划驱动的软件过程，有利于规范软件开发活动

2. **原型化模型**：
	- 原型是一个部分开发的产品，用于加强对系统的理解，有助于明确需求和选择可行的设计策略

3. **迭代式开发**：
	- 将描述、开发和验证等不同活动交织在一起，在开发过程中建立一系列版本，将系统一部分一部分地逐步交付

4. **可转换模型**：
	- 利用自动化的手段，通过一系列转换将需求规格说明转化为一个可交付使用的系统

### 瀑布模型

![[10-Intro-waterfall-model.png]]

开发的各阶段阶段严格按照线性方式依次进行，每一个阶段具有相关的里程碑和交付产品，且需要最终的确认和验证。

瀑布模型的特点是：
- 以预测性为原则
- 以文档驱动开发过程：每个阶段都要建立详尽的文档
- 以过程控制为核心：每一阶段都要严格把控

瀑布模型的缺陷：
- 直到测试阶段才能检查软件的可行性、是否符合客户的需求，此时源代码已经开发完成，早期的错误要等到最终才能发现，因此非常僵化；
- 各阶段之间独立地制作各自文档，大量的文档使得整体工作量极大；
- 没有意识到软件开发是一个迭代的过程，需要不断地反复尝试，通过比较和选择不同的设计，最终确定令人满意的问题解决方案：
	- ![[40-Software-Development-Process-iterative.png]]

### 原型化模型

> 这里所谓原型，其原英文单词是 prototype ，其实我认为翻译成“雏形”更好。

既然瀑布模型只有到测试阶段才能验证是否符合客户需求，那么我们可以先做一个软件雏形，不断地让客户体验、使用，让他给出体验结果，并逐步地修缮，直到最终得到完整的软件：

![[40-Software-Development-Process-prototype.png]]

### 迭代式开发

互联网时代，要求商业产品要快速地开发出来，尽早占领市场份额，因此迭代式开发的优势越发明显：
- ![[40-Software-Development-Process-iterative-dev.png]]
- 开发人员每做一版，就给用户使用一版，收集用户反馈后再改进、制作第二版...

迭代式开发有两种模型：
- **增量模型**：在每一个新的发布中逐步增加功能直到构造全部功能
- **迭代模型**：一开始提交一个完整系统，在后续发布中补充完善各子系统功能
- ![[40-Software-Development-Process-iterative-model.png]]
- ![[40-Software-Development-Process-iterative-model-1.png]]

### 可转换模型

采用形式化的数学语言描述系统，再利用自动化手段通过一系列转换，将形式化的需求规格说明，变为可交付使用的系统：
- ![[40-Software-Development-Process-convertible.png]]
- 由于数学方法具有严密性和准确性，形式化方法所交付的系统**具有较少的缺陷和较高的安全性**
- 特别适合于那些对安全性、可靠性和保密性要求极高的软件系统，这些系统需要在投入运行前进行验证
- 由于建立数学语言描述比较抽象、困难，因此主要应用于有限状态的嵌入式系统中

例如汽车制动防抱死系统，就比较适合可转换模型来构建：
- ![[40-Software-Development-Process-sample-convertible.png]]

## 敏捷开发过程

互联网时代用户需求在不断变化，没有“先知”视角可以提前制定完整、详尽、考虑到所有风险的计划，须知，软件开发不是“**构造**”而是“**创造**”！

![[40-Software-Development-Process-risk.png]]

当今时代互联网产品的开发特点：
- 快鱼吃慢鱼
- 版本发布成本很低
- 追求创新
- 需要快速响应用户的变化
- 需求不确定性高
- 关注用户行为
-  ![[40-Software-Development-Process-internet-features.png]]

### 敏捷开发哲学

![[40-Software-Development-Process-predict-Vs-adapt.png]]

客户的需求是不可预测的，因此软件开发应是一个自适应的跟踪过程。

敏捷开发哲学只有四句话：
- _**Individuals and interactions** over processes and tools_
- _**Working software** over comprehensive documentation_
- _**Customer collaboration** over contract negotiation_
- _**Responding to change** over following a plan_

> 即，
> - 个体和交互    胜过 过程和⼯具
> - 可以⼯作的软件 胜过 面面俱到的⽂档
> - 客户合作      胜过 合同谈判
> - 响应变化      胜过 遵循计划

As [Scott Ambler]( https://en.wikipedia.org/wiki/Scott_Ambler "Scott Ambler") explained:
- Tools and processes are important, but it is more important to have competent people working together effectively.
- Good documentation is useful in helping people to understand how the software is built and how to use it, but the main point of development is to create software, not documentation.
- A contract is important but is no substitute for working closely with customers to discover what they need.
- A project plan is important, but it must not be too rigid to accommodate changes in technology or the environment, stakeholders' priorities, and people's understanding of the problem and its solution.

### 敏捷开发原则

The _Manifesto for Agile Software Development_ is based on twelve principles: 

1. Customer satisfaction by early and continuous delivery of valuable software.
2. Welcome changing requirements, even in late development.
3. Deliver working software frequently (weeks rather than months).
4. Close, daily cooperation between business people and developers.
5. Projects are built around motivated individuals, who should be trusted.
6. Face-to-face conversation is the best form of communication (co-location).
7. Working software is the primary measure of progress.
8. Sustainable development, able to maintain a constant pace.
9. Continuous attention to technical excellence and good design.
10. Simplicity—the art of maximizing the amount of work not done—is essential.
11. Best [architectures](https://en.wikipedia.org/wiki/Agile_Architecture "Agile Architecture"), requirements, and designs emerge from self-organizing teams.
12. Regularly, the team reflects on how to become more effective, and adjusts accordingly.

> 1. 我们的最高目标是，通过尽早和持续地交付有价值的软件来满足客户
> 2. 欢迎对需求提出变更——即使是在项目开发后期。要善于利用需求变更，帮助客户获得竞争优势
> 3. 要不断交付可用的软件，周期从几周到几个月不等，且越短越好
> 4. 项目过程中，业务人员与开发人员必须在一起工作
> 5. 要善于激励项目人员，给他们以所需要的环境和支持，并相信他们能够完成任务
> 6. 无论是团队内还是团队间，最有效的沟通方法是面对面的交谈
> 7. 可用的软件是衡量进度的主要指标
> 8. 敏捷过程提倡可持续的开发速度，项目方、开发人员和用户应该能够保持恒久稳定的进展速度
> 9. 坚持不懈地追求技术卓越和良好设计，这将提升敏捷能力
> 10. 要做到简单，即尽最大可能减少不必要的工作，这是一门艺术
> 11. 最佳的架构、需求和设计出自于自组织的团队
> 12. 团队要定期反省如何能够做到更有效，并相应地调整团队的行为

### 极限编程和 Scrum 开发方法

![[40-Software-Development-Process-agile-methods.png]]

敏捷开发方法是一组轻量级开发方法的总称，包含很多具体的开发过程和方法，最有影响的两个方法是极限编程（XP）和 Scrum 开发方法。
- [Extreme programming - Wikipedia](https://en.wikipedia.org/wiki/Extreme_programming?useskin=vector)
- [Scrum (software development) - Wikipedia]( https://en.wikipedia.org/wiki/Scrum_ (software_development)? useskin=vector)
- ![[40-Software-Development-Process-xp-vs-scrum.png]]

迭代开发的关键要点：
- 每一次迭代都建立在稳定的质量基础上，并做为下一轮迭代的基线，整个系统的功能随着迭代稳定地增长和不断完善
- 每次迭代要邀请用户代表验收，提供需求是否满足的反馈
- 在一次迭代中，一旦团队作出承诺，就不允许变更交付件和交付日期；如果发生重大变化，产品负责人可以中止当次迭代
- 在迭代中可能会出现“分解”和“澄清”，但是不允许添加新工作或者对现有的 工作进行“实质变更”
- 对于“分解”和“澄清”，如果存在争议，那么将其认定为变更，放到产品订单中下一次迭代再考虑

## Practice

### 判断

1. 开发一个支持 3D 打印的操作系统最适合采用增量开发。
> ✅

2. 软件构造阶段的任务有构建软件组件和实施组件的单元测试。
> ✅

### 选择

1. 关于 Scrum 的每一次冲刺（Sprint），下面的（ ）是正确的。
A. Sprint 是一个不超过4周的迭代，其长度一旦确定，将保持不变。
B. Sprint 的产出是一个可用的、潜在可发布的产品增量。
C. Sprint 在进行过程中，其开发目标、质量验收标准和团队组成不能发生变化。
D. 以上所有选项
> D
