---
publish: "true"
tags:
  - 软件工程
date: 2024-02-03
---
## 编码过程与规范

软件编程是一个复杂而迭代的过程，它不仅仅是编写代码，还应该包括代码审查、单元测试、代码优化、集成调试等一系列工作，并且这些工作不是一蹴而就的，而是不断迭代、循环完成的：
- ![[20-High-Quality-Coding-coding-phases.png]]

按照 [[1-Theory/9-Software-Construction/10-Intro#软件质量的实现|高质量软件开发之道]] ，我们在本节探讨规范编码的问题。

### 软件编程规范

软件编码规范是**与特定语言相关的描写如何编写代码的规则集合**。

实际工程中，软件全生命周期的 70% 成本是维护，并且在其生命周期中很少由原编写人员进行维护，因此为了提高编码质量、避免不必要的程序错误、增强程序代码的可读性、可重用性和可移植性，我们必须遵循特定的编程规范。

不同的企业/项目都有各自的编程规范这里我们参考 Google 的编程规范：[Python Style Guide](https://google.github.io/styleguide/pyguide.html)
- 本地版：[[Google-Python-Style-Guide|Style guides for Google-originated open-source projects]] ；

### Python 编程规范

#### 程序模板

![[20-High-Quality-Coding-program-template.png]]
- 在文件中包含中文字符时，需要标注好正确的编码格式；
- 导入模块时应遵循这样的顺序：Python 自带模块、第三方模块、个人项目的模块
- `if __name__ == '__main__` 语句的作用：检查文件是否是直接执行。因为 pydoc 、单元测试等场景中，都要求每一个文件都是可导入的，而且考虑到代码的最大可重用性，即使部分文件是打算直接执行的，但未来也有被其它文件作为模块导入的可能。加上对 name 的判断后，主程序只有在被直接执行时才会执行，其他情况下则作为模块导入。

#### 注释

Python 中有两种注释：
- ![[20-High-Quality-Coding-comment-kinds.png]]
- 第二种以文档字符串编写的注释，可以通过 pydoc 等工具自动化地生成对应文档：
	- ![[20-High-Quality-Coding-pydoc.png]]

编写注释要**恰如其分**，而不是面面俱到：
- 这样重复代码语句的含义对帮助理解代码没有任何作用：
	- ![[20-High-Quality-Coding-commnet-wrong.png]]
- 实际上在代码中只需要解释关键部分的**作用和实现原理**即可，具体的实现过程通过阅读良好命名和规范的代码语句应当能够理解：
	- ![[20-High-Quality-Coding-comment-right.png]]
- 要记住这些编写注释的规则：
	- 好的注释解释为什么，而不是怎么样
	- 不要在注释中重复描述代码
	- 当自己在编写密密麻麻的注释来解释代码时，需要停下来看是否存在更大的问题
	- 想一想在注释中写什么，不要不动脑筋就输入
	- 写完注释之后要在代码的上下文中回顾一下，它们是否包含正确的信息？
	- 当修改代码时，维护代码周围的所有注释

#### 命名

> [[Google-Python-Style-Guide#3.16 Naming|Google Naming Specification]] ：
> 
> - 下划线式：
> 	- `module_name`, `package_name`, `method_name`, `function_name`,
> 	- `global_var_name`, `instance_var_name`, `function_parameter_name`, `local_var_name`, 
> 	- `query_proper_noun_for_thing`, `send_acronym_via_https`,
> - 大写式：
> 	- `GLOBAL_CONSTANT_NAME`, 
> - 驼峰式：
> 	- `ClassName`,
> 	- `ExceptionName`, 

好的名字应当一目了然，不需要读者去猜，甚至不需要注释：
- Python 库的命名约定有点混乱，因此很难使之变得完全一致，不过还是有公认的命名规范
- 新的模块和包（包括第三方的框架）必须符合这些标准，但对已有的库存在不同风格的，保持内部的一致性是首选的
- 因此对于老的模块、第三方模块中，不符合命名规范的部分，可以看作特例，但我们自己编写项目时，应当遵循这样的规范

为什么要这样劳力地遵循命名规范？不是有文档、注释吗？
- 这是因为需要外部文档支持的代码是脆弱的，要确保你的代码本身读起来就很清晰
- 这就要求编写**自文档化**的代码：唯一能完整并正确地描述代码的文档是代码本身；代码本身的可读性就很高

例如对左边这样非常抽象的代码，应当重构成右边命名规范、可读性良好的代码：
- ![[20-High-Quality-Coding-naming.png]]

#### 语句

![[Google-Python-Style-Guide#3.14 Statements]]

#### 缩进

> [[Google-Python-Style-Guide#3.4 Indentation|Google Indentation Specification]]

使用 4 个空格作为缩进，而非 Tab ，并且不要混用 tab 与空格。

#### 导入模块

> [[Google-Python-Style-Guide#3.13 Imports formatting|Google Imports Specification]]

- import 次序：先 import Python 内置模块，再 import 第三方模块，最后 import 自己开发的项目中的其它模块；这几种模块中用空行分隔开来。
- 一条 import 语句 import 一个模块。
- 当从模块中 import 多个对象且超过一行时，使用如下断行法（py2.5 以上版本）：
	- `from module import (obj1,obj2,obj3,obj4,obj5,obj6)`
- 不要使用 `from module import *`，除非是 import 常量定义模块或其它你确保不会出现命名空间冲突的模块。

#### 语法糖

慎用 Python 高版本的语法糖：
- ![[20-High-Quality-Coding-syntax-trick.png]]
- 这些特性有时并不稳定，也不是所有项目参与者都会掌握；

## 良好的编程实践

> 想要成为优秀的开发者，离不开这三步：
> 1. 看：阅读优秀的代码，学习别人的代码
> 2. 问：[如何向开源社区提问题](https://github.com/seajs/seajs/issues/545#issue-11080874)
> 3. 练：亲自动手编写代码，实践、实践、再实践

软件开发时，先要分而治之地理解复杂的问题，再反之将分治的小问题逐个解决，最后合起来做成一整套的解决方案：
- ![[20-High-Quality-Coding-dev-thinking.png]]

按照 [[1-Theory/9-Software-Construction/10-Intro#软件质量的实现|高质量软件开发之道]] ，我们在本节探讨高质量设计的问题。

### 模块化设计

模块化设计古已有之，活字印刷术就是模块化设计的一个典型范例，其中每个汉字代表一个文字“模块”，具有特定的功能和含义，而语法是连接汉字模块的“接口”，通过它构成了最终的文章“产品”。

模块化程序设计的基本思想就是，**将一个大的程序按功能分拆成一系列小模块**。这样做的好处有许多：
- 降低程序设计的复杂性
- 提高模块的可靠性和复用性
- 缩短产品的开发周期
- 易于维护和功能扩展

从不同的角度进行模块划分，可以获得不同的模块：
- ![[20-High-Quality-Coding-module-split.png]]
- 并且对于软件中模块的变动特点，应当予以区分，将易变的逻辑与稳定的功能模组独立开：
	- ![[20-High-Quality-Coding-stable-Vs- changable.png]]
- 另外，模块应当是单一职责的，即类或者函数应该只做一件事，并且做好这件事。不过单一职责并不等价于单一功能，这里的“职责”更准确的含义是**引起变化的原因**——如果一个大模块中有很多因素可以改变，那么就应当对其进行拆分；

### 面向抽象编程

在模块化设计的基础上，我们可以先设计出各个模块的“骨架”，或者说对各个 模块进行“抽象”，定义它们之间的“接口”。定义各个模块互相关联的部分，这些部分在未来开发中不应该轻易发生改变。

注：这里所说“接口”与 Java 的 interface 类似，但不一定需要显式地定义出来，也可以是开发 人员之间的约定。

### 错误与异常处理

**错误**是导致程序崩溃的问题，例如 Python 程序的语法错误（解析错误）或者未捕获的异常（运行错误）等。

**异常**是运行时期检测到的错误，即使一条语句或者表达式在语法上是正确的，当试图执行它时也可能会引发错误。

**异常处理**是用于管理程序运行期间错误的一种方法，这种机制将程序中的==正常处理代码和异常处理代码显式地区别开来==，提高了程序的可读性。

Python 中进行异常处理，需要使用 `try/except` 块进行包围，但并非盲目地将一大堆代码都塞进去，那样势必会导致抛出的异常要么类型范围过大（比如本是文件 IO 时出错的 `IOError` ，却抛出一个模糊的 `Error`），因此我们应该这样做：
- 减少 `try/except` 块中的代码量，细化具体的异常类型，更有针对性地处理；
	- ![[20-High-Quality-Coding-error-handle.png]]
- 在关键部分应该检查变量的合法性，包括类型和取值范围等，以避免“雪球效应”，扼之于摇篮中：
	- ![[20-High-Quality-Coding-error-handle-assert.png]]

### 案例：生命游戏

> [Conway's Game of Life - Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life?useskin=vector)

生命游戏的规则是从初始状态开始，每过一个时间单位，细胞都判断一次周围的细胞存活情况：
- ![[20-High-Quality-Coding-life-game-cell.png]]
- 如果周围有 4 个活细胞，则当前细胞因竞争不到营养而死；若有 3 个活细胞，则可以存活；若有 2 个活细胞，则保持当前状态不变；若只有 1 个活细胞，则会因孤独而死；

那么我们应当如何实现这个游戏？从模块化的角度来看，我们应当如何分解？
- ![[20-High-Quality-Coding-life-game-modules.png]]
- 模块化设计可以有多种不同的方案，应该选择利于理清思路、方便测试、容易调整的方案，同时避免“过度设计”；
- 在模块化分解之后，开发人员可以分别实现各个模块。根据函数单一职责的原则，各个模块内部还会定义更多的函数。与此同时，模块测试的设计工作也可以开始进行。

>[!tip] 谨慎修改关键函数
>前面抽象得到的各模块关键函数在后续开发中**不应发生改变**，这些函数一旦参数列表/名称/返回值等发生变化，可能造成连带性的一系列修改。

在确定好模块后，我们应当设计好连接这些模块的接口，通过统一的接口进行相互调用：
- ![[20-High-Quality-Coding-life-game-map.png]]
- ![[20-High-Quality-Coding-life-game-logic.png]]
- ![[20-High-Quality-Coding-life-game-logic-1.png]]

我们的生命游戏是自初始化后就无休止地运行下去的，要停止，则应在命令行中使用 Ctrl+C 的方式终止，但这会引发 Python 中的 `KeyboardInterrupt` 异常，因此我们可以对之进行捕获：
- ![[20-High-Quality-Coding-life-game-error.png]]

## 代码静态检查

## 代码性能分析

## 结对编程实践