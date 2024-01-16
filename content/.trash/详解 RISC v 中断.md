---
url: https://www.cnblogs.com/harrypotterjackson/p/17548837.html#_label7
title: 详解 RISC v 中断
date: 2023-10-25 20:26:39
time: 1698236799262
tag: 
summary: 
---
# 阅读目录

*   [常规中断](#_label0)
*   [U 与 S 之间的切换](#_label1)
*   [S 与 M 之间的切换](#_label2)
*   [地址空间布局](#_label3)
*   [跳板机制](#_label4)
*   [第一次的 stvec 是如何设置的](#_label5)
*   [PLIC](#_label6)
*   [ACLINT](#_label7)
*   [CLIC](#_label8)
*   [时钟中断相关的寄存器](#_label9)
*   [时钟中断的基本处理过程](#_label10)
*   [xv6 的实现](#_label11)
*   [Linux 的时钟中断的实现](#_label12)
*   [QEMU 的时钟中断的逻辑](#_label13)
*   [参考文献](#_label14)
*   [中断发送](#_label15)
*   [中断处理](#_label16)
*   [参考资料](#_label17)

# 声明

本文为本人原创，未经许可严禁转载。部分图源自网络，如有侵权，联系删除。

# RISC-V 中断与异常

trap（陷阱）可以分为异常与中断。在 RISC v 下，中断有三种来源：software interrupt、timer interrupt（顾名思义，时钟中断）、external interrupt。

有同学可能见过 NMI，但是这是一种中断类型而非中断来源。Non-maskable interrupt，不可屏蔽中断，与之相对的就是可屏蔽中断。NMI 都是硬件中断，只有在发生严重错误时才会触发这种类型的中断。

有同学可能接触过 Linux 中的软中断，即 `softirq`，但是请注意 software interrupt 与 softirq 是完完全全不一样的。如果你没有接触过 softirq 就请现在就暂停本文去了解一下，否则把 Linux 中的 softirq 与 software interrupt 搞混是会贻笑大方的。

本文将全面介绍 RISC v 下的中断发送与处理、软件中断、用户态中断和特权级转换，并结合 xv6 内核、rcore、Linux 内核等实现进行介绍。

# 与中断有关的寄存器

下面所述的都是软件中断、外部中断和异常相关的内容，时钟中断比较特殊将单独介绍。

[回到顶部](#_labelTop)

## 常规中断[#](#2139341874)

M-mode 的寄存器

`mstatus`，`mtvec`，`medeleg`，`mideleg`，`mip`，`mie`，`mepc`，`mcause`，`mtval`

S-mode 的寄存器

`sstatus`，`stvec`，`sip`，`sie`，`sepc`，`scause`，`stval`，`satp`

在后文中，我们可能会有 `xstatus``xtvec` 等的写法，其中 x 表示特权级 m 或者 s 或者 u（u 仅仅在实现了用户态中断的 CPU 上存在）。

### mcause[#](#1539171697)

![](<assets/1698236799286.png>)

如果陷阱是由中断引起的，则 mcause 寄存器中的 “Interrupt” 位被设置。Exception Code 字段用于标识最后一个异常或中断的代码。下表列出了可能的机器级异常代码。异常代码是 WLRL 字段，因此仅保证包含受支持的异常代码。

(PS: 读者可能疑惑为啥在 `mcause` 中会存在 Supervissor software interrupt [TODO])

### mstatus[#](#1920779978)

![](<assets/1698236799355.png>)

MIE 与 SIE 是全局中断使能位。当 xIE 为 1 时，允许在 x 特权级发生中断，否则不允许中断。

当 hart 处于 x 特权级时，当 xIE 为 0 时，x 特权级的中断被全部禁用，否则被全部启用。当 xIE 为 0 时，对于任意的 `w<x`，w 特权级的中断都是处于全局禁用状态。对于任意的 `y>x`，y 特权级的中断默认处于全局启用状态，无论 xIE 是否为 1。

为支持嵌套陷阱，每个可以响应中断的特权模式 x 都有一个两级中断使能位和特权模式堆栈。xPIE 保存陷阱之前活动的中断使能位的值，xPP 保存之前的特权模式。xPP 字段只能保存 x 及以下特权模式，因此 MPP 为两位宽，SPP 为一位宽。当从特权模式 y 进入特权模式 x 时，xPIE 设置为 xIE 的值；xIE 设置为 0；xPP 设置为 y。对于 MPP，可以设置的值有 0b00（用户模式），0b01（S-mode），0b10(reserved)，0b11(M-mode)

在 M 模式或 S 模式中，使用 MRET 或 SRET 指令返回陷阱。执行 xRET 指令时，将 xIE 设置为 xPIE；将 xPIE 设置为 1；假设 xPP 值为 y，则将特权模式更改为 y；将 xPP 设置为 U（如果不支持用户模式，则为 M）。如果 xPP≠M，则 xRET 还会设置 MPRV=0。

### mtvec[#](#1484486759)

![](<assets/1698236799421.png>)

`mtvec` 记录的是异常处理函数的起始地址。BASE 字段中的值必须始终对齐于 4 字节边界，并且 MODE 设置可能会对 BASE 字段中的值施加额外的对齐约束。

MODE 目前可以取两种值：

![](<assets/1698236799446.png>)

如果 MODE 为 0，那么所有的异常处理都有同一个入口地址，否则的话异常处理的入口地址是 BASE+4*CAUSE。（cause 记录在 xcause 中）

要求异常处理函数的入口地址必须是 4 字节对齐的。

### medeleg 与 mideleg[#](#2048899269)

默认情况下，各个特权级的陷阱都是被捕捉到了 M-mode，可以通过代码实现将 trap 转发到其它特权级进行处理，为了提高转发的性能在 CPU 级别做了改进并提供了 `medeleg` 和 `mideleg` 两个寄存器。

`medeleg` （machine exception delegation）用于指示转发哪些异常到 S-mode；`mideleg`(machine interrupt delegation) 用于指示转发哪些中断到 S-mode。

当将陷阱委托给 S 模式时，`scause` 寄存器会写入陷阱原因；`sepc` 寄存器会写入引发陷阱的指令的虚拟地址；`stval` 寄存器会写入特定于异常的数据；`mstatus` 的 SPP 字段会写入发生陷阱时的活动特权级；`mstatus` 的 `SPIE` 字段会写入发生陷阱时的 `SIE` 字段的值；`mstatus` 的 `SIE` 字段会被清除。`mcause`、`mepc` 和 `mtval` 寄存器以及 `mstatus` 的 MPP 和 MPIE 字段不会被写入。

假如被委托的中断会导致该中断在委托者所在的特权级屏蔽掉。比如说 M-mode 将一些中断委托给了 S-mode，那么 M-mode 就无法捕捉到这些中断了。

### mip 与 mie[#](#745274158)

`mip` 与 `mie` 是分别用于保存 pending interrupt 和 pending interrupt enable bits。每个中断都有中断号 `i`（定义在 `mcause` 表中），每个中断号如果被 pending 了，那么对应的第 `i` 位就会被置为 1. 因为 RISC v spec 定义了 16 个标准的中断，因此低 16bit 是用于标准用途，其它位则 * 台自定义。

如下图所示是低 16bit 的 `mip` 与 `mie` 寄存器。其实比较好记忆，只需要知道 `mcause` 中的中断源即可。例如 SSIP 就是 supervisor software interrupt pending, SSIE 就是 supervisor software interrupt enable。

![](<assets/1698236799489.png>)

如果全局中断被启用了，且 `mie` 和 `mip` 的第 i 位都为 1，那么中断 i 将会被处理。默认情况下，如果当前特权级小于 M 或者当前特权级为 M 切 MIE 是 1 的话，全局中断就是被启用的；如果 `mideleg` 的第 i 位为 1，那么当当前特权级为被委托的特权级 x（或者是小于 x），且 `mstatus` 中的 `xIE` 为 1 那么就认为是全局中断是被启用的。

寄存器 `mip` 中的每个位都可以是可写的或只读的。当 `mip` 中的第 i 位可写时，可以通过向该位写入 0 来清除挂起的中断 i。如果中断 i 可以变为挂起但 `mip` 中的位 i 是只读的，则实现必须提供一些其他机制来清除挂起的中断。如果相应的中断可以变为挂起，则 `mie` 中的位必须是可写的。不可写的 `mie` 位必须硬连线为零。

位 `mip` .MEIP 和 `mie` .MEIE 是 M-mode 外部中断的中断挂起和中断允许位。 MEIP 在 `mip` 中是只读的，由 * 台特定的中断控制器设置和清除。

位 `mip` .MTIP 和 `mie` .MTIE 是 M-mode 定时器中断的中断挂起和中断允许位。 MTIP 在 `mip` 中是只读的，通过写入映射到内存的 `mtimecmp` 来清除。

位 `mip` .MSIP 和 `mie` .MSIE 是机器级软件中断的中断挂起和中断允许位。 MSIP 在 `mip` 中是只读的，通过访问内存映射控制寄存器写入，远程 harts 使用这些寄存器来提供 M-mode 处理器间中断。 hart 可以使用相同的内存映射控制寄存器写入自己的 MSIP 位。

如果实现了 S-mode，位 `mip` .SEIP 和 `mie` .SEIE 是 S-mode 外部中断的中断挂起和中断允许位。 SEIP 在 `mip` 中是可写的，并且可以由 M 模式软件写入以向 S 模式指示外部中断正在挂起。此外，* 台级中断控制器（PLIC）可以生成 S-mode 外部中断。SEIP 位是可写的，因此需要根据 SEIP 和外部中断控制器的信号进行逻辑或运算的结果，来判断是否有挂起的 S-mode 外部中断。当使用 CSR 指令读取 `mip` 时， `rd` 目标寄存器中返回的 SEIP 位的值是 `mip.SEIP` 与来自中断控制器的中断信号的逻辑或。但是，CSRRS 或 CSRRC 指令的读取 - 修改 - 写入序列中使用的值仅包含软件可写 SEIP 位，忽略来自外部中断控制器的中断值。

_SEIP 字段行为旨在允许更高权限层干净地模拟外部中断，而不会丢失任何真实的外部中断。因此，CSR 指令的行为与常规 CSR 访问略有不同。_

如果实现了 S-mode， `mip` .STIP 和 `mie` .STIE 是 S-mode 定时器中断的中断挂起和中断允许位。 STIP 在 `mip` 中是可写的，并且可以由 M 模式软件编写以将定时器中断传递给 S 模式。

位 `mip` .SSIP 和 `mie` .SSIE 是管理级软件中断的中断挂起和中断允许位。 SSIP 在 `mip` 中是可写的。

S-mode 的 interprocessor interrrupts 与实现机制有关，有的是通过调用 System-Level Exception Environment(SEE) 来实现的，调用 SEE 最终会导致在 M-mode 将 MSIP 位置为 1. 我们只允许 hart 修改它自己的 SSIP bit，不允许修改其它 hart 的 SSIP，这是因为其它的 hart 可能处于虚拟化的状态、也可能被更高的 descheduled。因此我们必须通过调用 SEE 来实现 interprocessor interrrupt。M-mode 是不允许被虚拟化的，而且已经是最高特权级了，因此可以直接修改其它位的 MSIP，通常是使用非缓冲 IO 写入 memory-mapped control registers 来实现的，具体依赖于 * 台的实现机制。

多个同时中断按以下优先级递减顺序处理：MEI、MSI、MTI、SEI、SSI、STI。异常的优先级低于所有中断。

### mepc[#](#2636913995)

当 trap 陷入到 M-mode 时，`mepc` 会被 CPU 自动写入引发 trap 的指令的虚拟地址或者是被中断的指令的虚拟地址。

### mtval[#](#415178246)

当 trap 陷入到 M-mode 时，`mtval` 会被置零或者被写入与异常相关的信息来辅助处理 trap。当触发硬件断点、地址未对齐、access fault、page fault 时，`mtval` 记录的是引发这些问题的虚拟地址。

### stastus[#](#2400142568)

![](<assets/1698236799513.png>)

与中断相关的字段是 SIE、SPIE、SPP。

SPP 位指示处理器进入 supervisor 模式之前的特权级别。当发生陷阱时，如果该陷阱来自用户模式，则 SPP 设置为 0；否则设置为 1。当执行 SRET 指令从陷阱处理程序返回时，如果 SPP 位为 0，则特权级别设置为用户模式；如果 SPP 位为 1，则特权级别设置为 supervisor 模式；然后将 SPP 设置为 0。

SIE 位在 supervisor 模式下启用或禁用所有中断。当 SIE 为零时，在 supervisor 模式下不会进行中断处理。当处理器在用户模式下运行时，忽略 SIE 的值，并启用 supervisor 级别的中断。可以使用 `sie` 寄存器 来禁用单个中断源。

SPIE 位指示陷入 supervisor 模式之前是否启用了 supervisor 级别的中断。当执行跳转到 supervisor 模式的陷阱时，将 SPIE 设置为 SIE，并将 SIE 设置为 0。当执行 SRET 指令时，将 SIE 设置为 SPIE，然后将 SPIE 设置为 1。

### 其它 s 特权级寄存器[#](#4064724067)

`stvec`, `sip`, `sie`,`sepc`, `scause`, `stval` 与 m-mode 的相应寄存器区别不大，读者可自行参阅 RISC v 的 spec。

`satp` 比较特殊，在 M-mode 没有对应的寄存器，因为 M-mode 没有分页，`satp` 记录的是根页表物理地址的页帧号。在从 U 切换到 S 时，需要切换页表，也即是切换 `satp` 的根页表物理地址的页帧号。

# 特权级转换

我在这里只介绍了 U 和 S 之间的切换，其实 S 和 M 之间的切换过程也是一样的，只不过使用到的寄存器不一样了而已。比如说保存 pc 的寄存，S 保存 U 的 pc 值使用的是 `sepc`，M 保存 S 的 pc 使用的是 `mepc`。此外，U 切换到 S 时一般需要切换页表，而从 S 切换到 M 时不需要切换页表，因为 M 没有实现分页，也没有 `matp` 寄存器（页表根地址存储在 `satp` 寄存器中，所以我这里胡诌了个 `matp`）。

[回到顶部](#_labelTop)

## U 与 S 之间的切换[#](#1696273634)

### U 切换到 S[#](#45549276)

当执行一个 trap 时，除了 timer interrupt，所有的过程都是相同的，硬件会自动完成下述过程：

1.  如果该 trap 是一个设备中断并且 `sstatus` 的 SIE bit 为 0，那么不再执行下述过程
2.  通过置零 SIE 禁用中断
3.  将 pc 拷贝到 `sepc`
4.  保存当前的特权级到 `sstatus` 的 SPP 字段
5.  将 `scause` 设置成 trap 的原因
6.  设置当前特权级为 supervisor
7.  拷贝 `stvec`（中断服务程序的首地址）到 pc
8.  开始执行中断服务程序

CPU 不会自动切换到内核的页表，也不会切换到内核栈，也不会保存除了 pc 之外的寄存器的值，内核需要自行完成。对于 Linux 而言，内核空间与用户态空间是使用的同一套页表，不需要切换页表。详情可以参考用户态进程的虚拟内存布局。内核空间一般位于进程的高虚拟地址空间。

对于没有开启分页，如何切换特权级可以参考：[实现特权级的切换 - rCore-Tutorial-Book-v3 3.6.0-alpha.1 文档](https://rcore-os.cn/rCore-Tutorial-Book-v3/chapter2/4trap-handling.html)

如果启用了分页，当陷入到 S 模式时，CPU 没有切换页表（换出进程的页表，换入内核页表），内核需要自行切换页表，参考：[内核与应用的地址空间 - rCore-Tutorial-Book-v3 3.6.0-alpha.1 文档](https://rcore-os.cn/rCore-Tutorial-Book-v3/chapter4/5kernel-app-spaces.html) 和 [基于地址空间的分时多任务 - rCore-Tutorial-Book-v3 3.6.0-alpha.1 文档](https://rcore-os.cn/rCore-Tutorial-Book-v3/chapter4/6multitasking-based-on-as.html) 。

其实切换页表的过程也很简单，只需要将内核的页表地址写入 `satp` 寄存器即可。

在执行中断服务例程时还需要首先判断 `sstatus` 的 SPP 字段是不是 0，如果是 0 表示之前是 U 模式，否则表示 S 模式。如果 SPP 是 1 那就出现了严重错误（因为既然是从 U 切换到 S 的过程，怎么可以 SPP 是 S 模式呢？当然，如果是内核执行时发生了中断 SPP 是 1 那自然是对的，内核执行时发生中断时如果检查 SPP 是 0 那也是严重的错误）。

### S 切换到 U[#](#868263254)

在从 S 切换到 U 时，要手动清除 `sstatus` 的 SPP 字段，将其置为零；将 `sstatus` 的 SPIE 字段置为 1，启用用户中断；设置 `sepc` 为用户进程的 PC 值（你可能疑惑在 U 转换到 S 时不是已经将用户进程的保存在了 `sepc` 了吗? 因为在 S-mode 也会发生中断呀，那么 `sepc` 就会被用来保存发生中断位置时的 PC 了）。如果启用了页表，就需要想还原用户进程的页表，即将用户进程的页表地址写入 `satp`，之后恢复上下文，然后执行 `sret` 指令，硬件会自动完成以下操作：

1.  从 `sepc` 寄存器中取出要恢复的下一条指令地址，将其复制到程序计数器 `pc` 中，以恢复现场；
2.  从 `sstatus` 寄存器中取出用户模式的相关状态，包括中断使能位、虚拟存储模式等，以恢复用户模式的状态；
3.  将当前特权模式设置为用户模式，即取消特权模式，回到用户模式。

[回到顶部](#_labelTop)

## S 与 M 之间的切换[#](#1727141086)

### S 切换到 M[#](#3390946595)

S 切换到 M 与从 U 切换到 M 类似，都是从低特权级到高特权级的切换。在 S 运行的代码，也可以通过 `ecall` 指令陷入到 M 中。

1.  S-mode 的代码执行一个指令触发了异常或陷阱，例如环境调用（ECALL）指令
2.  处理器将当前的 S-mode 上下文的状态保存下来，包括程序计数器 (PC)、S-mode 特权级别和其他相关寄存器，保存在当前特权级别堆栈中的 S-MODE 陷阱帧（trap frame，其实就是一个页面）中
3.  处理器通过将 mstatus 寄存器中的 MPP 字段设置为 0b11（表示先前的模式是 S 模式）将特权级别设置为 M-mode
4.  处理器将程序计数器设置为在 M-mode 中的陷阱处理程序例程的地址
5.  处理器还在 mstatus 寄存器中设置 M-mode 中断使能位 (MIE) 为 0，以在陷阱处理程序中禁用中断

# 系统调用的实现

系统调用是利用异常机制实现的。在 `mcause` 中我们看到有 Environment call from U-mode 和 Environment call from S-mode 两个异常类型。那么如何触发这两个异常呢？分别在 U-mode 和 S-mode 执行 `ecall` 指令就能触发这两个异常了。

异常触发之后，就会被捕捉到 M-mode（我之前提过，RISC v 下默认是把所有的异常、中断捕捉到 M-mode，当且仅当对应的陷阱被委托给了其它模式才会陷入到被委托的模式中）。假如说

[回到顶部](#_labelTop)

## 地址空间布局[#](#2118930719)

启用分页模式下，内核代码的访存地址也会被视为一个虚拟地址并需要经过 MMU 的地址转换，因此我们也需要为内核对应构造一个地址空间，它除了仍然需要允许内核的各数据段能够被正常访问之后，还需要包含所有应用的内核栈以及一个 **跳板** (Trampoline) 。

值得注意的是，下面是是 rCore 的内核地址空间分布，不同的 OS 设计不同。

<table><thead><tr><th>高 256GB 内核地址空间</th><th>低 256GB 内核地址空间</th></tr></thead><tbody><tr><td><a href="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210014907-59405883.png" data-title="" data-alt="" data-lightbox="roadtrip"><div class="sr-rd-content-center-small"><img class="" src="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210014907-59405883.png"></div></a></td><td><a href="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210015309-973629164.png" data-title="" data-alt="" data-lightbox="roadtrip"><div class="sr-rd-content-center-small"><img class="" src="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210015309-973629164.png"></div></a></td></tr></tbody></table>

<table><thead><tr><th>应用程序高 256GB 地址空间</th><th>应用程序低 256GB 地址空间</th></tr></thead><tbody><tr><td><div class="sr-rd-content-center"><img class="" src="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210015683-979795453.png"></div></td><td><a href="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210016165-419532978.png" data-title="" data-alt="" data-lightbox="roadtrip"><div class="sr-rd-content-center-small"><img class="" src="https://img2023.cnblogs.com/blog/1653979/202307/1653979-20230712210016165-419532978.png"></div></a></td></tr></tbody></table>

[回到顶部](#_labelTop)

## 跳板机制[#](#1727500621)

使能了分页机制之后，我们必须在 trap 过程中同时完成地址空间的切换。具体来说，当 `__alltraps` 保存 Trap 上下文的时候，我们必须通过修改 satp 从应用地址空间切换到内核地址空间，因为 trap handler 只有在内核地址空间中才能访问；同理，在 `__restore` 恢复 Trap 上下文的时候，我们也必须从内核地址空间切换回应用地址空间，因为应用的代码和数据只能在它自己的地址空间中才能访问，应用是看不到内核地址空间的。这样就要求地址空间的切换不能影响指令的连续执行，即要求应用和内核地址空间在切换地址空间指令附 * 是 * 滑的。

我们为何将应用的 Trap 上下文放到应用地址空间的次高页面而不是内核地址空间中的内核栈中呢？原因在于，在保存 Trap 上下文到内核栈中之前，我们必须完成两项工作：1）必须先切换到内核地址空间，这就需要将内核地址空间的 页表地址写入 satp 寄存器；2）之后还需要保存应用的内核栈栈顶的位置，这样才能以它为基址保存 Trap 上下文。这两步需要用寄存器作为临时周转，然而我们无法在不破坏任何一个通用寄存器的情况下做到这一点。因为事实上我们需要用到内核的两条信息：内核地址空间的 页表地址，以及应用的内核栈栈顶的位置，RISC-V 却只提供一个 `sscratch` 寄存器可用来进行周转。所以，我们不得不将 Trap 上下文保存在应用地址空间的一个虚拟页面中，而不是切换到内核地址空间去保存。

# Page fault

当 CPU 无法将虚拟地址转换为物理地址时，CPU 会生成页面错误异常。RISC-V 有三种不同类型的页面错误：加载页面错误 (当加载指令无法转换其虚拟地址时)、存储页面错误(当存储指令无法转换其虚拟地址时) 和指令页面错误(当指令的地址不转换时)。scause 寄存器中的值指示页面错误的类型，而 stval 寄存器中包含无法转换的地址。

Cow(copy on write) Fork 中的基本方案是让父子进程在最开始时共享所有物理页面，但将它们映射为只读。因此，当子进程或父进程执行存储指令时，RISC-V CPU 会引发页面错误异常。作为对此异常的响应，内核会复制包含错误地址的页面。它将一个副本映射到子进程的地址空间中，并将另一个副本映射到父进程的地址空间中。在更新页表之后，内核在导致错误的指令处恢复出错进程。因为内核已经更新了相关的 PTE 以允许写入，所以出错指令现在将正常执行。

# xv6 中是如何设置 stvec 的

我们已经知道 stvec 寄存器保存的是中断服务程序的首地址，另外在 U 模式下，stvec 必须指向的是 `uservec`，在 S 模式下，stvec 必须指向的是 `kernelvec`，这样做的原因是需要在 `uservec` 切换页表。

那么 xv6 是如何设置 stvec 的呢？首先在 `uservec` 例程中除了执行保存上下文、切换页表等操作之外，还会在 `usertrap` 中将 stvec 指向 `kernelvec`，这里的切换的目的是当前已经执行到了 S 模式，所有的中断、陷阱等都必须由 `kernelvec` 负责处理。

当需要返回 `usertrap` 时，`usertrap` 会调用 `usertrapret`，`usertrapret` 会重新设置 stvec 的值使其指向 `uservec`，之后跳转到 `userret`，恢复上下文和切换页表。

[回到顶部](#_labelTop)

## 第一次的 stvec 是如何设置的[#](#4195045780)

在 `main` 中，cpu0 调用了 `userinit()` 创建了第一个用户进程，并在 `scheduler` 中会切换到该进程。该进程的上下文中的 `ra`(返回地址) 被设置成了 `forkret()`，当 `scheduler` 执行 `swtch` 函数时，会将进程上下文中的 `ra` 写入到 `ra` 寄存器中，这样当要从 `swtch()` 中返回时，就会返回到了 `forkret()`，在 `forkret()` 中会直接调用 `usertrapret` 以实现 `stvec` 的设置和页表的切换。

# 与中断有关的硬件单元

在 RISC v 中，与中断有关的硬件单元主要有 [ACLINT](https://github.com/riscv/riscv-aclint/blob/main/riscv-aclint.adoc)、CLINT、[PLIC](https://github.com/riscv/riscv-plic-spec/blob/master/riscv-plic.adoc)、[CLIC](https://github.com/riscv/riscv-fast-interrupt/blob/master/clic.adoc)。

CLINT 的全称是 Core Local Interrupt，ACLINT 的全称是 Advanced Core Local Interrupt, CLIC 的全称是 Core-Local Interrupt Controller。

PLIC 的全称 Platform-Level Interrupt Controller。

尽管 CLIC 与 PLIC 名称相似，但是 CLIC 其实是为取代 CLINT 而设计的。ACLINT 是为了取代 SiFive CLINT 而设计的，本质上讲，ACLINT 相比于 CLINT 的优势就在于进行了模块化设计，将定时器和 IPI 功能分开了，同时能够支持 NUMA 系统。但是 ACLINT 和 CLINT 都还是 RISC-V basic local Interrupts 的范畴。

PLIC 和 CLIC 的区别在于，前者负责的是整个 * 台的外部中断，CLIC 负责的是每个 HART 的本地中断。

[回到顶部](#_labelTop)

## PLIC[#](#2509024013)

[回到顶部](#_labelTop)

## ACLINT[#](#1124455707)

ACLINT 的规范翻译参见 [RISC-V ACLIT](https://wbc3ji2vof.feishu.cn/wiki/wikcnLbXPxSlB2x1kCV3jU2WiXf)

根据 [Linux RISC-V ACLINT Support](https://lore.kernel.org/lkml/20211007123632.697666-1-anup.patel@wdc.com/) 的说法，大多数现有的 RISC-V * 台使用 SiFive CLINT 来提供 M 级定时器和 IPI 支持，而 S 级使用 SBI 调用定时器和 IPI。此外，SiFive CLINT 设备是一个单一的设备，所以 RISC-V * 台不能部分实现提供定时器和 IPI 的替代机制。RISC-V 高级核心本地中断器 (ACLINT) 尝试通过以下方式解决 SiFive CLINT 的限制:

1.  采用模块化方法，分离定时器和 IPI 功能为不同的设备，以便 RISC-V * 台可以只包括所需的设备
2.  为 S 级 IPI 提供专用的 MMIO 设备，以便 SBI 调用可以避免在 Linux RISC-V 中使用 IPI
3.  允许定时器和 IPI 设备的多个实例多 sockets NUMA 系统

RISC-V ACLINT 规范向后兼容 SiFive CLINT。

[回到顶部](#_labelTop)

## CLIC[#](#751607000)

spec 参见 [riscv-fast-interrupt/clic.adoc](https://github.com/riscv/riscv-fast-interrupt/blob/master/clic.adoc#background-and-motivation)

RISC-V 特权架构规范定义了 CSR，例如 **x** `ip` 、 **x** `ie` 和中断行为。为这种 RISC-V 中断方案提供处理器间中断和定时器功能的简单中断控制器被称为 CLINT。当 **x** `tvec` .mode 设置为 `00` 或 `01` 时，本规范将使用术语 CLINT 模式。

在前文介绍 `mtvec` 时提到了 mode 字段，在 RISC-V 目前的特权级规范中，mode 字段只能取 00 或 01，其它值是 reserved。从 spec 的描述中我们可以看出，mode 字段无论是 00 还是 01，都是 CLINT 模式，因此我们在前文介绍的有关中断的介绍都是 CLINT 模式（包括 ACLINT）。

我目前不太清除 CLIC 是否在

# 时钟中断

“定时器中断” 是由一个独立的计时器电路发出的信号，表示预定的时间间隔已经结束。计时器子系统将中断当前正在执行的代码。定时器中断可以由操作系统处理，用于实现时间片多线程，但是对于 MTIME 和 MTIMECMP 的读写只能由 M-mode 的代码实现，因此内核需要调用 SBI 的服务。

我相信你已经在 [RISC-V ACLIT](https://wbc3ji2vof.feishu.cn/wiki/wikcnLbXPxSlB2x1kCV3jU2WiXf) 已经了解到了时钟中断的基本原理，现在我们看一下如何处理时钟中断。

[回到顶部](#_labelTop)

## 时钟中断相关的寄存器[#](#657752464)

[https://tinylab.org/riscv-timer/](https://tinylab.org/riscv-timer/)  
`mtime` 需要以固定的频率递增，并在发生溢出时回绕。当 `mtime` 大于或等于 `mtimecmp` 时，由核内中断控制器 (CLINT, Core-Local Interrupt Controller) 产生 timer 中断。中断的使能由 `mie` 寄存器中的 `MTIE` 和 `STIE` 位控制，`mip` 中的 `MPIE` 和 `SPIE` 则指示了 timer 中断是否处于 pending。在 RV32 中读取 `mtimecmp` 结果为低 32 位， `mtimecmp` 的高 32 位需要读取 `mtimecmph` 得到。  
由于 `mtimecmp` 只能在 M 模式下访问，对于 S/HS 模式下的内核和 VU/VS 模式下的虚拟机需要通过 SBI 才能访问，会造成较大的中断延迟和性能开销。为了解决这一问题，RISC-V 新增了 Sstc 拓展支持（已批准但尚未最终集成到规范中）。  
[Sstc 扩展](https://github.com/riscv/riscv-time-compare)为 HS 模式和 VS 模式分别新增了 `stimecmp` 和 `vstimecmp` 寄存器，当 time>=stimecmp$time >= stimecmp$或者 time+htimedelta>=vstimecmp$time + htimedelta >= vstimecmp$是会产生 timer 中断，不再需要通过 SBI 陷入到其它模式。

[回到顶部](#_labelTop)

## 时钟中断的基本处理过程[#](#2300945285)

如下图所示是时钟中断的基本过程 (xv6 的处理过程)：

![](<assets/1698236799551.png>)

图源：[https://shakti.org.in/docs/risc-v-asm-manual.pdf](https://shakti.org.in/docs/risc-v-asm-manual.pdf)

让我们首先回顾一下有关 timer 的寄存器。首先要明确的是，timer 的寄存器在 timer 设备里，不在 CPU 中，是通过 MMIO 的方式映射到内存中的。

`mtime` 寄存器是一个同步计数器。它从处理器上电开始运行，并以 tick 单位提供当前的实时时间。

`mtimecmp` 寄存器用于存储定时器中断应该发生的时间间隔。`mtimecmp` 的值与 `mtime` 寄存器进行比较。当 `mtime` 值变得大于 `mtimecmp` 时，就会产生一个定时器中断。`mtime` 和 `mtimecmp` 寄存器都是 64 位内存映射寄存器，因此可以直接按照内存读写的方式修改这两个寄存器的值。

[回到顶部](#_labelTop)

## xv6 的实现[#](#1735100096)

xv6 对于时钟中断的处理方式是这样的：在 M-mode 设置好时钟中断的处理函数，当发生时钟中断时就由 M-mode 的代码读写 `mtime` 和 `mtimecmp`，然后激活 `sip.SSIP` 以软件中断的形式通知内核。内核在收到软件中断之后会递增 `ticks` 变量，并调用 `wakeup` 函数唤醒沉睡的进程。 内核本身也会收到时钟中断，此时内核会判断当前运行的是不是进程号为 0 的进程，如果不是就会调用 `yield()` 函数使当前进程放弃 CPU 并调度下一个进程；如果使进程号为 0 的进程，那就不做处理。

### timer_init[#](#2818841118)

```
// core local interruptor (CLINT), which contains the timer.
#define CLINT 0x2000000L
#define CLINT_MTIMECMP(hartid) (CLINT + 0x4000 + 8*(hartid))
#define CLINT_MTIME (CLINT + 0xBFF8) // cycles since boot.

void
timerinit()
{
  // each CPU has a separate source of timer interrupts.
  int id = r_mhartid();

  // ask the CLINT for a timer interrupt.
  int interval = 1000000; // cycles; about 1/10th second in qemu.
  
  // 我已经提过，mtimecmp 是映射到了物理地址中的，因此可以直接按照内存读写的方式
  // 修改寄存器的值
  // MTIME 寄存器映射到了 0x2000_BFF8
  // 一块CPU有一个MTIME，所有的hart都共用这一个 MTIME
  // MTIMECMP 的内存基地址是 0x2000000L
  // 每个寄存器占 8个字节，每个hart都有一个MTIMECMP寄存器
  // 因此呢，第id个（从0开始计数）的hart对应的 MTIMECMP 的寄存器的物理地址就是
  // 0x2000000L + 8 * id
  // 因此呢就容易理解下面的操作了，实际上就是根据 MTIME 初始化 MTIMECMP
  *(uint64*)CLINT_MTIMECMP(id) = *(uint64*)CLINT_MTIME + interval;

  // prepare information in scratch[] for timervec.
  // scratch[0..2] : space for timervec to save registers.
  // scratch[3] : address of CLINT MTIMECMP register.
  // scratch[4] : desired interval (in cycles) between timer interrupts.
  uint64 *scratch = &timer_scratch[id][0];
  scratch[3] = CLINT_MTIMECMP(id);//记录当前hart对应的 MTIMECMP 寄存器映射到的物理地址
  scratch[4] = interval;
  w_mscratch((uint64)scratch);//将数组指针写入mscratch

  // set the machine-mode trap handler.
  w_mtvec((uint64)timervec);

  // enable machine-mode interrupts.
  w_mstatus(r_mstatus() | MSTATUS_MIE);

  // enable machine-mode timer interrupts.
  w_mie(r_mie() | MIE_MTIE);
}
```

### 时钟中断处理函数[#](#2035897504)

在下面的代码中，首先是将 `mscratch` 与 `a0` 寄存器交换了值，此时 `a0` 保存的值就是个数组指针 (这一点在前面的 `timer_init` 中已经分析了)。

```
timervec:
 # start.c has set up the memory that mscratch points to:
 # scratch[0,8,16] : register save area.
 # scratch[24] : address of CLINT's MTIMECMP register.
 # scratch[32] : desired interval between interrupts.
        
        csrrw a0, mscratch, a0
 # 保存寄存器的上下文
        sd a1, 0(a0)
        sd a2, 8(a0)
        sd a3, 16(a0)
 # schedule the next timer interrupt
 # by adding interval to mtimecmp.
 # 实际上执行的就是 MTIMECMP = MTIME + INTERVAL
        ld a1, 24(a0) # CLINT_MTIMECMP(hart)
        ld a2, 32(a0) # interval
        ld a3, 0(a1)
        add a3, a3, a2
        sd a3, 0(a1)
 # arrange for a supervisor software interrupt
 # after this handler returns.
 # 通过supervisor software 中断的方式通知 S-mode 的内核处理时钟中断
 # 实际上呢，时钟中断已经在M-mode被处理掉了
 # 之所以还要通知S-mode的内核是因为内核的进程调度器依赖于对时间的掌握
 # S-mode只是根据时钟变化去做进程调度器相关的处理
        li a1, 2
        csrw sip, a1
 # 恢复上下文
        ld a3, 16(a0)
        ld a2, 8(a0)
        ld a1, 0(a0)
        csrrw a0, mscratch, a0

        mret
```

[回到顶部](#_labelTop)

## Linux 的时钟中断的实现[#](#854318807)

参见 [RISC-V timer 在 Linux 中的实现 - 泰晓科技](https://tinylab.org/riscv-timer/)

[回到顶部](#_labelTop)

## QEMU 的时钟中断的逻辑[#](#531465597)

参见 [https://wangzhou.github.io/riscv-timer%E7%9A%84%E5%9F%BA%E6%9C%AC%E9%80%BB%E8%BE%91/](https://wangzhou.github.io/riscv-timer%E7%9A%84%E5%9F%BA%E6%9C%AC%E9%80%BB%E8%BE%91/)

[回到顶部](#_labelTop)

## 参考文献[#](#974934177)

*   [wangzhou.github.io](https://wangzhou.github.io/riscv-timer%E7%9A%84%E5%9F%BA%E6%9C%AC%E9%80%BB%E8%BE%91/)
*   [RISC-V timer 在 Linux 中的实现 - 泰晓科技](https://tinylab.org/riscv-timer/)
*   [https://shakti.org.in/docs/risc-v-asm-manual.pdf](https://shakti.org.in/docs/risc-v-asm-manual.pdf)
*   RISC-V ACLINT Spec
*   RISC-V Privileged Spec

# 软件中断

所谓软件中断就是软件触发的中断，也是所谓的核间中断（inter-process interrupt，IPI）。在 RISC v 中，核间中断是通过设置 MIP 的 MSIP 或者 SSIP 实现的。

下面以 Linux 和 opensbi 为例介绍 S-MODE 的软件中断的实现。

[回到顶部](#_labelTop)

## 中断发送[#](#774511774)

### Linux 内核实现[#](#2006270691)

在 `arch/riscv/kernel/smp.c` 中实现了 ipi 发送和处理的若干函数。

首先应当明确的是，IPI 是核间中断，也就是一个核向另一个核发送的中断，那么就是软件运行时出于某种目的向另一个 / 些核发送了中断，那么就需要告知这个 / 些核，让这些核做某些事情，这就需要向其它核发送消息。

在 `smp.c` 中定义了枚举值：

```
enum ipi_message_type {
    IPI_RESCHEDULE,
    IPI_CALL_FUNC,
    IPI_CPU_STOP,
    IPI_IRQ_WORK,
    IPI_TIMER,
    IPI_MAX
};
```

从这些枚举值我们可以看出，一个软件中断可以传递 5 种不同的中断消息。

这些消息需要保存在变量里，因此在 `smp.c` 中也定义了静态变量 `ipi_data`：

首先看静态变量 `ipi_data`，该变量定义如下：

```
static struct {
    unsigned long stats[IPI_MAX] ____cacheline_aligned;//记录对应类型的IPI收到了多少个
    unsigned long bits ____cacheline_aligned;//记录对应的IPI是否被激活
} ipi_data[NR_CPUS] __cacheline_aligned;
```

从定义中我们可以看出，每个 HART 都有一个独立的 ipi_data 且是缓存行对齐的。其中 `stats` 记录了发送的软件中断的所传递的消息。在发送 IPI 之前，当前核心需要将信息写入到 `ipi_data` 变量中，这样当其它核心收到 IPI 并处理时，就可以根据 `ipi_data` 中记录的值进行相关操作。

这里我以向单个核发送 IPI 为例进行介绍：

```
static void send_ipi_single(int cpu, enum ipi_message_type op) {
    smp_mb__before_atomic();
    set_bit(op, &ipi_data[cpu].bits);
    smp_mb__after_atomic();

    if (ipi_ops && ipi_ops->ipi_inject)
        ipi_ops->ipi_inject(cpumask_of(cpu));
    else
        pr_warn("SMP: IPI inject method not available\n");
}
```

我们可以看到两个参数，第一个参数 `cpu` 是要发送到哪个核心的编号，`op` 则是要传递的 IPI 类型。

`set_bit` 就是激活对应的 IPI 类型。

这里比较关键的是调用了 `ipi_inject`，这是个函数指针，该函数指针指向了 `sbi_send_cpumask_ipi` 函数。

![](<assets/1698236799595.png>)

在 `arch/riscv/kernel/sbi.c` 中，我们看到 `sbi_send_cpumask_ipi` 也是一个函数指针，它的实现实际上与 sbi 的标准有关，比如有 `__sbi_send_ipi_v01`，`__sbi_send_ipi_v02` 等函数。

无论是哪种规范吧，反正最终是调用到了 sbi，下面我们以 opensbi 为例继续介绍软件中断的过程。

### Opensbi[#](#573217928)

在 `opensbi/lib/sbi/sbi_ipi.c` 中实现了 ipi send 的相关函数。

![](<assets/1698236799621.png>)

从调用函数栈中，可以看出，最终调用到了 `mswi_ipi_send` 函数：

```
static void mswi_ipi_send(u32 target_hart) {
    u32 *msip;
    struct aclint_mswi_data *mswi;

    if (SBI_HARTMASK_MAX_BITS <= target_hart)
        return;
    mswi = mswi_hartid2data[target_hart];
    if (!mswi)
        return;

    /* Set ACLINT IPI */
    msip = (void *)mswi->addr;
    writel(1, &msip[target_hart - mswi->first_hartid]);
}
```

通过将 `CSR_MIP.SSIP` 置为就实现了 S-MODE 软件中断，因为根据 RISC v 的中断委托机制，中断会最终拉高 `CSR_SIP.SSIP`，并在 S-MODE 对软件中断进行处理。下面我们来看 Linux 是如何对软件中断进行处理的。

[回到顶部](#_labelTop)

## 中断处理[#](#1764258257)

S-MODE 的软件中断处理自然在 Linux 内核中。在 `arch/riscv/kernel/smp.c` 的 `handle_IPI` 函数就是软件中断处理函数。

```
void handle_IPI(struct pt_regs *regs) {
    unsigned long *pending_ipis = &ipi_data[smp_processor_id()].bits;
    unsigned long *stats = ipi_data[smp_processor_id()].stats;

    riscv_clear_ipi();//这里并不会丢失IPI，因为IPI发送的数量和激活状态已经记录在了ipi_data里面
    // 下面就是对ipi的具体处理喽，读者有兴趣可自行查看
    while (true) {
        unsigned long ops;

        /* Order bit clearing and data access. */
        mb();

        ops = xchg(pending_ipis, 0);
        if (ops == 0)
            return;

        if (ops & (1 << IPI_RESCHEDULE)) {
            stats[IPI_RESCHEDULE]++;
            scheduler_ipi();
        }

        if (ops & (1 << IPI_CALL_FUNC)) {
            stats[IPI_CALL_FUNC]++;
            generic_smp_call_function_interrupt();
        }

        if (ops & (1 << IPI_CPU_STOP)) {
            stats[IPI_CPU_STOP]++;
            ipi_stop();
        }

        if (ops & (1 << IPI_IRQ_WORK)) {
            stats[IPI_IRQ_WORK]++;
            irq_work_run();
        }

#ifdef CONFIG_GENERIC_CLOCKEVENTS_BROADCAST
        if (ops & (1 << IPI_TIMER)) {
            stats[IPI_TIMER]++;
            tick_receive_broadcast();
        }
#endif
        BUG_ON((ops >> IPI_MAX) != 0);

        /* Order data access and bit testing. */
        mb();
    }
}
```

# User-Level interrupt

上一节叙述的是在 M-S-U 的 CPU 中的标准中断，这一节描述用户态中断。

用户态中断是 N Standard Extension，相关实现可以参考 [https://github.com/TRCYX/riscv-user-level-interrupt](https://github.com/TRCYX/riscv-user-level-interrupt) 和 [https://gallium70.github.io/rv-n-ext-impl/ch1_1_priv_and_trap.html](https://gallium70.github.io/rv-n-ext-impl/ch1_1_priv_and_trap.html)

事实上用户态中断比较罕见，但是 x86 已经完全支持用户态中断了。

与用户态中断有关的寄存器有：`ustatus`, `uip`, `uie`, `sedeleg`, `sideleg`, `uscratch`, `uepc`, `utevc`, `utval`。其中 `sedeleg` 和 `sideleg` 就是为实现用户态中断而添加的，如果 S-mode 不委托异常、中断到 U-mode，那么用户态中断是无法实现的。`sedeleg/sideleg` 与 `medeleg/mideleg` 是完全一致的，不赘述。

`uscratch/uepc/utevc/utval` 与相应的 M-mode 的寄存器也是一致的，不再赘述。这里仅重点介绍 `ustatus`, `uip`, `uie`。

### ustatus[#](#2918197014)

![](<assets/1698236799672.png>)

`ustatus` 是很简单的，就两个值得注意的字段 UPIE 和 UIE。如果 UIE 为 0 就禁用用户态中断，否则启用用户态中断。在处理用户态中断时，使用 UPIE 记录 UIE，之后会将 UIE 置零。值得注意的是，`ustatus` 里面没有 UPP，因为没有比 U-mode 更低的特权级了，陷入到 U-mode 的一定是 U-mode 的特权级，因此也就没有必要记录发生中断前的特权级了。

### uip 与 uie[#](#503116071)

![](<assets/1698236799699.png>)

本规范定义了三种中断类型：软件中断、定时器中断和外部中断。可以通过向 uip 寄存器的用户软件中断挂起（USIP）位写入 1，来触发当前处理器上的用户级软件中断。可以通过向 uip 寄存器的 USIP 位写入 0，来清除挂起的用户级软件中断。当 uie 寄存器中的 USIE 位清零时，用户级软件中断将被禁用。

ABI 应该提供一种机制，以发送处理器间中断到其他处理器，从而最终导致接收处理器的 uip 寄存器中的 USIP 位被设置。

除了 uip 寄存器中的 USIP 位之外，其余所有位都是只读的。

如果 uip 寄存器中的 UTIP 位被设置，则表示用户级定时器中断挂起。当 uie 寄存器中的 UTIE 位清零时，将禁用用户级定时器中断。ABI 应该提供一种机制来清除挂起的定时器中断。

如果 uip 寄存器中的 UEIP 位被设置，则表示用户级外部中断挂起。当 uie 寄存器中的 UEIE 位清零时，将禁用用户级外部中断。ABI 应该提供一些方法来屏蔽、解除屏蔽和查询外部中断的原因。

uip 和 uie 寄存器是 mip 和 mie 寄存器的子集。读取 uip/uie 的任何字段或写入其任何可写字段，都会导致 mip/mie 中同名字段的读写。如果实现了 S 模式，则 uip 和 uie 寄存器也是 sip 和 sie 寄存器的子集。

[回到顶部](#_labelTop)

## 参考资料[#](#601644690)

*   [User Interrupt](https://0x10.sh/user-interrupt)