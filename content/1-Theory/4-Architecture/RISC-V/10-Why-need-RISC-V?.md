## RISC-V 的目标

- 它要能适应包括从最袖珍的嵌入式控制器，到最快的高性能计算机等各种规模的处理器。 
- 它应该能兼容各种流行的软件栈和编程语言。
- 它应该适应所有实现技术，包括现场可编程门阵列（FPGA）、专用集成电路 （ASIC）、全定制芯片，甚至未来的设备技术。
- 它应该对所有微体系结构样式都有效：例如微编码或硬连线控制; 顺序或乱序执行 流水线; 单发射或超标量等等。
- 它应该支持广泛的专业化，成为定制加速器的基础，因为随着摩尔定律的消退， 加速器的重要性日益提高。
- 它应该是稳定的，基础的指令集架构不应该改变。更重要的是，它不能像以前的专有指令集架构一样被弃用，例如 AMD Am29000、Digital Alpha、Digital VAX、 Hewlett Packard PA-RISC、Intel i860、Intel i960、Motorola 88000、以及 Zilog Z8000。
- 它是一个开源的指令集架构。与几乎所有的旧架构不同，它的未来不受任何单一公司的浮沉或一时兴起的决定的影响（这一点让许多过去的指令集架构都遭了殃）。它属于一个开放的，非营利性质的基金会。RISC-V 基金会的目标是保持 RISC-V 的稳定性，仅仅出于技术原因缓慢而谨慎地发展它，并力图让它之于硬件如同 Linux 之于操作系统一样受欢迎。

![[10-Why-need-RISC-V?-huawei.png]]

## 模块化 ISA

计算机体系结构的传统方法是增量 ISA，新处理器不仅必须实现新的 ISA 扩展，还必须实现过去的所有扩展。目的是为了保持向后的二进制兼容性，这样几十年前程序的二进制 版本仍然可以在最新的处理器上正确运行。这一要求与来自于同时发布新指令和新处理器的营销上的诱惑共同导致了 ISA 的体量随时间大幅增长。例如，当今主导 ISA 80x86的历史可以追溯到1978年，在它的漫长生涯中，它平均每个月增加了大约三条指令。这个传统意味着 x86-32（我们用它表示32位地址版本的 x86）的每个实现必须实现过去 的扩展中的错误设计，即便它们不再有意义。例如，x86的 ASCII Adjust after Addition（aaa）指令，该指令早已失效。 

作为一个类比，假设一家餐馆只提供固定价格的餐点，最初只是一顿包含汉堡和奶昔的小餐。随着时间的推移，它会加入薯条，然后是冰淇淋圣代，然后是沙拉，馅饼，葡萄 酒，素食意大利面，牛排，啤酒，无穷无尽，直到它成为一顿大餐。食客可以在那家餐厅找到他们过去吃过的东西，尽管总的来说这样做可能没什么意义。这样做的坏处是，用餐者为每次晚餐支付的宴会费用不断增加。

RISC-V 的不同寻常之处，除了在于它是最近诞生的和开源的以外，还在于——和几乎所有以往的 ISA 不同，它是**模块化**的。
- 它的核心是一个名为 RV32I 的基础 ISA，运行一个完整的软件栈。RV32I 是固定的，永远不会改变。这为编译器编写者，操作系统开发人员和汇 编语言程序员提供了稳定的目标。
- 模块化来源于可选的标准扩展，根据应用程序的需要， 硬件可以包含或不包含这些扩展。这种模块化特性使得 RISC-V 具有了袖珍化、低能耗的特点，而这对于嵌入式应用可能至关重要。RISC-V 编译器得知当前硬件包含哪些扩展后，便可以生成当前硬件条件下的最佳代码。
- 惯例是把代表扩展的字母附加到指令集名称之后作为指示。例如，RV32IMFD 将乘法（RV32M），单精度浮点（RV32F）和双精度浮点 （RV32D）的扩展添加到了基础指令集（RV32I）中。

## ISA 设计的标准
- 成本
- 简洁性
- 性能
- 架构和具体实现的分离
- 提升空间
- 程序大小
- 易于编程/编译/链接

## 全书总览