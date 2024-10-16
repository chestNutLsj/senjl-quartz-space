> 接下来的内容非常简单，和 OS 重合处也很多，赶时间就简单总结要点了。

- 第一讲层次存储器系统概述及动态存储器
- 第二讲静态存储器及高速缓冲存储器
- 第三讲高速缓冲存储器的组成与运行原理
- 第四讲虚拟存储器的运行原理
- 第五讲磁表面存储设备的存储原理与组成
- 第六讲 RISC-V 系统异常处理和响应，虚拟内存

## 存储器系统功能

### 发展历史

1. 早期存储器：水银延迟线存储器
2. 磁芯存储器
3. 半导体存储器


### 分类

- 随机访问存储器（RAM）
	- 访问时间与存放位置无关
	- 半导体存储器
- 顺序访问存储器（SAM）
	- 按照存储位置依次访问
	- 磁带存储器
- 直接访问存储器（DAM）
	- 随机+顺序
	- 磁盘存储器
- 关联访问存储器（CAM）
	- 根据内容访问
	- Cache 和 TLB

## 存储器系统的设计目标

1. 尽可能快的存取速度：应能基本满足 CPU 对数据的访问要求
2. 尽可能大的存储空间：可以满足程序对存储空间的要求 
3. 尽可能低的单位成本（价格/位）：用户能够承受的范围内
4. 较高的可靠性

## 需要解决的问题

>[! note] 存储器对整体性能的影响
>假定某台计算机的处理器工作在：
>- 主频 = 1GHz (机器周期为 1 ns)
>- CPI = 1.1
>- 50% 算逻指令, 30% 存取指令, 20% 转移指令
>- 再假定其中 10% 的存取指令会发生数据缺失，需要 50 个周期的延迟。
>
>CPI = 理想 CPI + 每条指令的平均延迟= 1.1 + (0.30 x 0.10 x 50)= 1.1 cycle + 1.5 cycle = 2.6 CPI!
>
>也就是说，处理器58 %的时间花在等待存储器给出数据上面! 每1% 的指令的数据缺失将给 CPI 附加0.5个周期!

## 层次存储器系统

![[30-DRAM-memory-hierarchy.png]]

![[30-DRAM-memory-system-hierarchy.png]]

![[30-DRAM-memory-mountain.png]]

### 局部性原理

程序运行时的局部性原理表现在：
- 在一小段时间内，最近被访问过的程序和数据很可能再次被访问
- 在空间上这些被访问的程序和数据往往集中在一小片存储区
- 在访问顺序上，指令顺序执行比转移执行的可能性大 (大约5:1 ) 


因此，合理地把程序和数据分配在不同存储介质中是提高整体性能的关键。

### 层次之间应满足的原则

1) 一致性原则：处在不同层次存储器中的同一个信息应保持相同的值。
2) 包含性原则：处在内层的信息一定被包含在其外层的存储器中，反之则不成立。即内层存储器中的全部信息，是其相邻外层存储器中一部分信息的复制品。

## DRAM 的组成与原理

![[30-DRAM-write.png]]

![[30-DRAM-read.png]]

### 工作特点

- 破坏性读出
	- 读出时被强制清零
	- 预充电延迟
- 需定期刷新（电容漏电）
	- 集中刷新：停止读写，逐行刷新
	- 分散刷新：定时周期性刷新
- 快速分页组织：行、列地址要分两次给出，但连续地读写用到相同的行地址时，也可以在前一次将行地址锁存，之后仅送列地址，以节省送地址的时间，支持这种运行方式的被称为快速分页组织的存储器

### 读写过程

主存的读写过程：
![[30-DRAM-read-write-process.png]]

DRAM 的读写过程：
![[30-DRAM-read-write-illustrate.png]]
- 动态存储器集成度高，存储容量大，为节约管脚数，地 址分为行地址和列地址
- 

### 主存的作用与连接

存储正处在运行中的程序和数据 (或一部分) 的部件，通过地址数据控制三类总线与 CPU、与其它部件连通。

![[30-DRAM-CPU-IO-bus.png]]
**地址总线**:
- 地址总线用于选择主存储器的一个存储单元（字或字节），其位数决定了能够访问的存储单元的最大数目，称为最大可寻址空间。例如，当按字节寻址时，20 位的地址可以访问 1MB 的存储空间，32 位的地址 可以访问 4GB 的存储空间。

**数据总线**:
- 数据总线用于在计算机各功能部件之间传送数据，数据总线的位数（总线的宽度）与总线时钟频率的乘积，与该总线所支持的最高数据吞吐（输入/输出）能力成正比。

**控制总线**：
- 控制总线用于指明总线的工作周期类型和本次入/出完成的时刻。总线的工作周期可以包括主存储器读周期、主存储器写周期、I/O 设备读周期、I/O 设备写周期，即用不同的总线周期来区分要用哪个部件（主存 或 I/O 设备）和操作的性质（读或写）；还有直接存储器访问（DMA）总线周期等。

