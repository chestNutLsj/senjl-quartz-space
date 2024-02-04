---
publish: "true"
tags:
  - 软件工程
date: 2024-02-02
---
## 软件的本质特性

### 软件的一般结构
$$
\text{软件=程序+数据+文档}
$$
- 程序：计算机可以接受的**一系列指令**，运行时可以提供所要求的功能和性能；
- 数据：使得程序能够适当地操作信息的**数据结构**；
- 文档：描述程序的研制过程、方法和使用的**图文资料**；

### 软件的四种本质特性

软件的本质特性：**复杂性**、**一致性**、**可变性**、**不可见性**：

1. 复杂性：大型软件如 Linux 内核等，都有大量的函数、函数调用、复杂的动态运行状态和过程等

2. 一致性：
	- 软件不能独立存在，需要==依附于一定的环境==（如硬件、网络以及其他软件）
	- 软件必须==遵从人为的惯例并适应已有的技术和系统== 

3. 可变性：软件需要随接口不同而改变，随时间推移而变化，而这些变化是不同人设计的结果。但这样的改变会带来复杂的问题：
	- 不断的修改最终导致软件的退化，从而结束其生命周期
	- ![[10-Intro-changeability.png]]

4. 不可见性：
	- 软件是一种“看不见、摸不着”的逻辑实体，不具有空间的形体特征
	- 开发人员可以直接看到程序代码，但是源代码并不是软件本身
	- 软件是以机器代码的形式运行，但是==开发人员无法看到源代码是如何（在用户手中）执行的==

## 软件工程的产生与发展

### 软件开发面临的挑战

有许多大型软件由于开发问题导致出现故障：
- ![[10-Intro-software-fault.png]]

在软件开发过程中，面临许多挑战：
1. **客户不满意**：
	- 交付的许多功能不是客户需要的
	- 交付的日期没有保障
	- 客户使用时发现许多 Bug

2. **风险与成本问题**：
	- 开发团队专注技术，忽视风险
	- 无能力预测成本，导致预算超支

3. **项目过程失控**：
	- 客户需求变化频繁，无力应对
	- 无法预见软件的交付质量
	- 对流程盲目遵从，忽视客户业务价值

4. **无力管理团队**：
	- 无法评估开发人员能力及工作进度
	- 困扰于如何提升团队的能力与效率

### 软件工程历史

![[10-Intro-history.png]]

- 软件危机：[Software crisis - Wikipedia](https://en.wikipedia.org/wiki/Software_crisis?useskin=vector)：The software crisis was due to the rapid increases in computer power and the complexity of the problems that could not be tackled. With the increase in the complexity of the software, many software problems arose because existing methods were inadequate.

- 北大西洋公约组织（NATO）提出软件工程概念和术语；

- 瀑布式软件开发模型：线性的开发流程
	- ![[10-Intro-waterfall-model.png]]
	- The **waterfall model** is a breakdown of development activities into linear sequential phases, meaning they are passed down onto each other, where each phase depends on the deliverables of the previous one and corresponds to a specialization of tasks. The approach is typical for certain areas of engineering design. —— [Waterfall model - Wikipedia](https://en.wikipedia.org/wiki/Waterfall_model?useskin=vector)

- 面向对象开发方法：
	- ![[10-Intro-OO-design.png]]
	- In general, the object-oriented development process tends to be _iterative_. That is, you develop an application in successive stages-each time getting closer to the ideal. First you develop a core application-an initial prototype. Then you refine the prototype, improving and extending it. Depending on the complexity of the application, you may go through many cycles or iterations.—— [Using an Object-Oriented Development Approach](https://docs.oracle.com/cd/E13203_01/tuxedo/build20/rose/devrose4.htm)

- 敏捷开发方法：精髓在于“快速上线、反复迭代”
	- ![[10-Intro-agile-development.png]]
	- Compared to traditional software engineering, agile software development mainly targets complex systems and product development with **dynamic**, **indeterministic** and **non-linear** properties. Accurate estimates, stable plans, and predictions are often hard to get in early stages, and confidence in them is likely to be low. ==Agile practitioners use their free will to reduce the "leap of faith" that is needed before any evidence of value can be obtained==. Requirements and design are held to be emergent. Big up-front specifications would probably cause a lot of waste in such cases, i.e., are not economically sound. These basic arguments and previous industry experiences, learned from years of successes and failures, have helped shape agile development's favor of adaptive, iterative and evolutionary development. —— [Agile software development - Wikipedia](https://en.wikipedia.org/wiki/Agile_software_development?useskin=vector#Philosophy)

- DevOps 方法：
	- ![[10-Intro-devops.png]]
	- **DevOps** is a methodology in the software development and IT industry. Used as a set of practices and tools, DevOps integrates and automates the work of software development (_Dev_) and IT operations (_Ops_) as a means for improving and shortening the systems development life cycle. ——[DevOps - Wikipedia](https://en.wikipedia.org/wiki/DevOps?useskin=vector)

## 软件工程的基本概念

### 工程与软件工程

工程的概念：将理论和知识应用于实践 的科学，以便经济有效地解决问题。其中涉及：
- ⼤规模的设计与建造
- 复杂问题与目标分解
- 团队协作与过程控制

而软件工程是：
1. 将系统性的、规范化的、可定量的方法应用于软件的开发、运行和维护， 即工程化应用到软件上；
2. 对上面所述方法的研究；

### 软件工程的目标

软件工程的目标是：创造“足够好”的软件（不是“完美”的软件）。其中设计以下几个方面：
- 较低的开发成本
- 按时完成开发任务并及时交付
- 实现客户要求的功能
- 具有良好性能、可靠性、可扩展性、可移植性等
- 软件维护费用低

### 软件工程的基本要素

通过以下三个要素保证开发出来的软件质量“足够好”：

1. **过程**：支持软件开发各个环节 的控制和管理
	- ![[10-Intro-software-dev-process.png]]
	- 整个过程经过细分，每个步骤需要完成的事件如下：![[10-Intro-process-detail.png]]

2. **方法**：完成软件开发任务的 技术手段
	- ![[10-Intro-methods.png]]
	- 从内到外，分别是**面向过程**、**面向对象**、**面向构件**、**面向服务**的方法：
		- 面向过程：以算法作为基本构造单元，强调自顶向下 的功能分解，将功能和数据进行一定程度的分离；
		- 面向对象：以类为基本程序单元，对象是类的实例化， 对象之间以消息传递为基本手段；
		- 面向构件：寻求比类的粒度更大的且易于复用的构件， 期望实现软件的再工程；
		- 面向服务：在应用表现层次上将软件构件化，即应用 业务过程由服务组成，而服务由构件组装而成

3. **工具**：为软件开发方法提供自动的 或半自动的软件支撑环境
	- 针对每个软件开发的阶段，都需要对应的开发工具：
	- ![[10-Intro-toolkit.png]]

### 软件开发的基本策略

遵循以下四个基本策略，可以很大程度上帮助软件开发：

1. **软件复用**
	- 软件复用是利用将已有的软件制品，直接组装或者合理修改形成新的软件系统，从而提高开发效率和产品质量，降低维护成本。这是因为已有的软件制品已经经过反复地使用验证，因此质量有所保证；
	- 软件复用的范围不仅仅是代码复用，更是对库函数、类库、模板（文档、网页等）、设计模式、组件、框架这些方面的复用；

2. **分而治之**：
	- 软件工程是一项解决问题的工程活动，通过对问题进行研究分析，将一个复杂问题分解成可以理解并能够处理的若干小问题，然后再逐个解决；

3. **逐步演进**：
	- 软件开发是自底向上逐步有序的生长过程，类似小步快跑——每走完一步再调整并为下一步确定方向，直到终点；

4. **优化折中**：
	- 软件工程师应当把优化当成一种责任，不断改进和提升软件质量；但是优化是一个多目标的最优决策，在不可能使所有目标都得到优化时，需要进行==折中实现整体最优==；
	- 例如编写 C 程序代码时，对⽂件的访问是影响程序速度 的⼀个重要因素，那么如何提⾼⽂件的访问速度呢？——设置内存缓冲区，那么多大的内存缓冲区合适呢？![[10-Intro-optimize.png]]

## 软件质量实现

### 什么是“好”的软件？

横看成岭侧成峰，从不同的视角看待软件，有不同的质量评估标准：
1. **功能质量**：对用户来说
	- 软件要符合指定需求、几乎没有缺陷、性能正常、容易上手使用

2. **结构质量**：对开发人员来说
	- 代码可测试性、代码可维护性、代码可读性、代码管理资源的效率、代码安全性，这些方面都要考虑

3. **过程质量**：对投资者来说
	- 软件要按时交付、开支不要超出预算、开发过程能够可复用、交付质量能够确保

而要保证这三个方面的质量，我们必须对其进行测量：
- ![[10-Intro-measure-quality.png]]

在进行测量前，我们要明确什么是“软件的质量”：
- 质量就是软件产品对于某个（或某些）⼈的价值。——杰拉尔德•温伯格

软件既要是“正确的”，又要是“运行正确的”，前者指的是市场调研、用户需求明确，后者是开发问题，前者关系到成败，后者关系到好坏，二者相辅相成，不可偏视任何一方
- 软件之“正确”：一个软件要能够满足用户的需求，为用户创造价值。这里的价值可以体现在两个方面，即为用户创造利润和减少成本；
- 软件之“运行正确”：软件没有或者有很少缺陷，具有很强的扩展性、良好的性能以及较高的易用性等

### 产品质量维度

David Garvin 提出了 8 个质量评估的维度：
1. 性能
2. 特色
3. 可靠性
4. 符合性
5. 耐久性
6. 可服务性
7. 审美
8. 感知

而 ISO9126 质量模型则对产品的外部质量和内部质量进行综合评估：
![[10-Intro-ISO9126.png]]
1. **功能性**：
	- 适合性：当软件在指定条件下使用，其满足明确和隐含要求功能的能力
	- 准确性：软件提供给用户功能的精确度是否符合目标
	- 互操作性：软件与其它系统进行交互的能力
	- 安全性：软件保护信息和数据的安全能力

2. **可靠性**：
	- 成熟性：软件产品避免因软件中错误发生而导致失效的能力
	- 容错性：软件防止外部接口错误扩散而导致系统失效的能力
	- 可恢复性：系统失效后，重新恢复原有的功能和性能的能力

3. **易用性**：
	- 易理解性：软件显示的信息要清晰、准确且易懂，使用户能够快速理解软件
	- 易学习性：软件使用户能学习其应用的能力
	- 易操作性：软件产品使用户能易于操作和控制它的能力
	- 吸引性：软件具有的某些独特的、能让用户眼前一亮的属性

4. **效率/性能**：
	- 时间特性：在规定的条件下，软件产品执行其功能时能够提供适当的响应时间 和处理时间以及吞吐率的能力
	- 资源利用：软件系统在完成用户指定的业务请求所消耗的系统资源，诸如CPU 占有率、内存占有率、网络带宽占有率等

5. **可维护性**：
	- 易分析性：软件提供辅助手段帮助开发人员定位缺陷原因并判断出修改之处
	- 易改变性：软件产品使得指定的修改容易实现的能力
	- 稳定性：软件产品避免由于软件修改而造成意外结果的能力
	- 易测试性：软件提供辅助性手段帮助测试人员实现其测试意图

6. **可移植性**：
	- 适应性：软件产品无需做任何相应变动就能适应不同运行环境的能力
	- 易安装性：在平台变化后，成功安装软件的难易程度
	- 共存性：软件产品在公共环境与其共享资源的其他系统共存的能力
	- 替换性：软件系统的升级能力，包括在线升级、打补丁升级等

### 软件质量的实现

要开发出可以保证质量的软件，须知测量的重要性：
- 质量不是被测出来的，而是在开发过程中逐渐构建起来的
- 虽然质量不是测出来的，但是未经测试也不可能开发出高质量的软件
- 质量是开发过程的问题，测试是开发过程中不可缺少的重要环节

高质量软件开发之道：
- ![[10-Intro-high-quality-dev.png]]

另外，在商业软件开发中，要学会平衡“高质量”与“低成本”：
- 商业目标决定质量目标，==不应该把质量目标凌驾于商业目标之上==
- 质量是有成本的，不可能为了追求完美的质量而不惜一切代价
- 理想的质量目标不是“零缺陷”，而是恰好让广大用户满意

## Practice

### 判断题

1. 一般来说，软件只有在其行为与开发者的目标一致的情况下才能成功
> ❌

2. 大多数软件系统是不容易修改的，除非它们在设计时考虑了变化
> ✅

3. 软件工程方法是为了获得高质量软件而实施的一系列活动
> ❌ 更准确地说，是**为开发软件提供技术上的解决方法**。

4. 软件质量是在开发过程中逐渐构建起来的
> ✅

5. 软件会逐渐退化而不会磨损，其原因在于不断的变更使组件接口之间引起错误
> ✅

### 讨论题

泛美航空公司飞机失事的事件描述：  
达拉斯8月23日电——航空公司今天声称，去年12月在哥伦比亚失事的泛美航空公司喷气式飞机的机长输入了一条错误的单字母计算机指令，正是这条指令使飞机撞倒了山上。这次失事致使机上163人中除4人生还外，其余全部丧生。  
美国调查人员总结说，显然这架波音757飞机的机长**认为**他已经输入了目的地Cali的坐标。但是，在大多数南美洲的航空图上，Cali单字母编码与波哥大（Bogota）的编码相同，而波哥大位于相反方向的132英里处。  
据泛美航空公司的首席飞行员和飞行副总裁Cecil Ewell的一封信中说，波哥大的坐标引导飞机撞到了山上。Ewell说，在大多数计算机数据库中，波哥大和Cali的编码是不同的。  
泛美航空公司的发言人John Hotard确认，Ewell的信首先是在《达拉斯早间新闻》中报道，本周交到了所有航空飞行员的手中以警告他们这种编码的问题。泛美航空公司的发现也促使联邦航空局向所有的航空公司发布公告，警告他们有些计算机的数据库与航空图存在不一致。  
计算机错误还不是引起这次失事原因的最终结论，哥伦比亚调查人员也在检查飞行员训练和航空交通管制的因素。  
Ewell谈到，当他们把喷气式飞机的导航计算机与失事计算机的信息相比较时，泛美航空公司的调查人员发现了计算机错误。数据表明，错误持续了66秒钟未被检测到，而同时机组人员匆忙遵守交通管制的指令采取更直接的途径到达Cali机场。3分钟后，当飞机仍在下降而机组人员设法解决飞机为什么已经转向时，飞经坠毁了。  
Ewell 说这次失事告诉了飞行员两个重要的教训：“首先，不管你去过南美或任何其他地方多少次，比如落基山区，你绝对不能假设任何情况。其次，飞行员必须明白他们不能让自动驾驶设备承担飞行的责任。”

随着软件的普及，由于程序错误所带来的公众风险已经变得越来越重要。请根据上面事件的描述，并回答问题：

1) 导致事故发生的原因是什么？
> 机长的疏忽，输入了一条错误的单字母计算机指令，却不知在大多数南美洲的航空图上，Cali 单字母编码与波哥大（Bogota）的编码相同，而波哥大位于相反方向的 132 英里处，最终波哥大的坐标引导飞机撞到了山上。
> 
> 从软件工程的术语来看，发生事故的主要原因是不同地区的数据库不一致导致的，不符合**软件开发一致性**要求。

2) 在软件开发过程中应该强调什么事项以便更好地防止类似的问题发生？
> 为了防止类似的问题发生，在软件开发过程中应该强调以下几点：
> - 输入验证：在接收用户输入之前，应该进行输入验证，以确保输入是正确的。这可以防止用户输入错误的指令或数据。
> - 错误处理：当发生错误时，软件应该能够适当地处理这些错误，而不是让错误累积或导致程序崩溃。
> - 自动化测试：自动化测试可以帮助检测软件的错误和问题，并确保软件在各种情况下都能正常工作。
> - 文档和培训：应该提供足够的文档和培训，以帮助用户了解如何正确使用软件，并防止他们犯错误。
> - 持续监控：在软件运行期间，应该持续监控其性能和稳定性，以便及时发现并解决问题。

### 编程作业

**一、题目描述**

请用 **Python3** 编写一个计算器的控制台程序，支持加减乘除、乘方、括号、小数点，运算符优先级为括号>乘方>乘除>加减，同级别运算按照从左向右的顺序计算。

**二、输入描述**

1. 数字包括"0123456789"，小数点为"`.`"，运算符包括：加("`+`")、减("`-`")、乘("`*`")、除("`/`")、乘方("`^`"，注：不是**！)、括号("`()`")

2. 需要从命令行参数读入输入，例如提交文件为 main.py，可以用 `python3 main.py "1+2-3+4"` 的方式进行调用，Java 程序也是类似的，如果你的程序需要通过键盘输入，那么是**不符合要求**的，例如 python 使用 input() 来等待用户输入，这会因为自动评测时不会有用户输入所以不会有任何结果。

3. 输入需要支持空格，即 `python3 main.py "1     +     2      -     3    +    4"` 也需要程序能够正确给出结果，Java 程序也是类似的

4. 所有测试用例中参与运算的**非零**运算数的绝对值范围保证在 10^9-10^(-10) 之内, 应该输出运算结果时非零运算结果绝对值也保证在该范围内。


**三、输出描述**

1. 数字需要支持小数点，输出结果取10位有效数字，有效数字位数不足时**不能**补0

2. 对于不在输入描述内的输入，输出INPUT ERROR

3. 对于格式不合法（例如括号不匹配等）的输入，输出 FORMAT ERROR

4. 对于不符合运算符接收的参数范围（例如除0等）的输入，输出VALUE ERROR

5. 对于2、3、4的情况，输出即可，不能抛出异常

6. 同时满足2、3、4中多个条件时，以序号小的为准


**四、样例**

```
输入: 1 + 2 - 3 + 4
输出: 4

输入: 1 + 2 - 3 + 1 / 3
输出: 0.3333333333

输入: 1 + + 2
输出: FORMAT ERROR

输入: 1 / 0
输出: VALUE ERROR

输入: a + 1
输出: INPUT ERROR
```

**五、代码**

```python
import re
import operator as op
from functools import reduce

def calculate(s):
    def update(op, v):
        if op == "+":
            stack.append(v)
        elif op == "-":
            stack.append(-v)
        elif op == "*":
            stack.append(stack.pop() * v)
        elif op == "/":
            top = stack.pop()
            if top < 0:
                stack.append(int(top / v))
            else:
                stack.append(top // v)
        elif op == "^":
            stack.append(stack.pop() ** v)

    precedence = {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3}
    stack = []
    number = ""
    for c in s:
        if c.isdigit() or c == ".":
            number += c
        else:
            if number:
                update("+", float(number))
                number = ""
            if c in precedence:
                while (stack and stack[-1] != "(" and
                       precedence[c] <= precedence[stack[-1]]):
                    update(stack.pop(), 0)
                stack.append(c)
            elif c == "(":
                stack.append(c)
            elif c == ")":
                while stack and stack[-1] != "(":
                    update(stack.pop(), 0)
                if not stack or stack[-1] != "(":
                    return "FORMAT ERROR"
                stack.pop()
            else:
                return "INPUT ERROR"
    if number:
        update("+", float(number))
    while stack:
        if stack[-1] == "(":
            return "FORMAT ERROR"
        update(stack.pop(), 0)
    return stack[0]

def main():
    s = input().strip()
    result = calculate(s)
    if isinstance(result, str):
        print(result)
    else:
        print("{:.10f}".format(result))

if __name__ == "__main__":
    main()

```