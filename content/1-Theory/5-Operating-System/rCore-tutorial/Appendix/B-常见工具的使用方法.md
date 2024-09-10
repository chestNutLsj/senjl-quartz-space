调试工具的使用[#]( #id1 "永久链接至标题")
--------------------------

### 下载或编译 GDB[#]( #gdb "永久链接至标题")

可以在 [实验环境配置](https://rcore-os.cn/rCore-Tutorial-Book-v3/chapter0/5setup-devel-env.html) 中下载编译好的二进制（版本为 8.3.0，由于包括整个哦那工具链，解压后大小约为 1G）, 也可以编译最新版本（仅 gdb，大小约为 300M）

```
wget https://github.com/riscv/riscv-binutils-gdb/archive/refs/heads/riscv-binutils-2.36.1.zip
unzip riscv-binutils-2.36.1.zip
mkdir build
cd build
../riscv-binutils-2.36.1/configure --target=riscv64-unknown-elf
make
```

如果是编译好的二进制，gdb 在 `./bin/riscv64-unknown-elf-gdb` 中。如果是自己编译的最新版本，gdb 在 `build/bin/gdb` 中。你可以移动到一个你喜欢的位置。

首先修改 `Makefile` ，下以 `ch1` 分支的为例：

1.  第三行 `release` 改为 `debug`
    
2.  第 46 行去掉 `--release`
    
3.  第 66 行的 qemu 的选项中增加 `-s -S`
    

这时，运行 `make run` 应该会停在系统开始前，等待 `gdb` 客户端连接。

### 在命令行中直接使用 gdb[#]( #id2 "永久链接至标题")

```
# 启动gdb，传入二进制文件作为参数。
# 记得修改路径
./bin/riscv64-unknown-elf-gdb  /Volumes/Code/rCore-Tutorial-v3/os/target/riscv64gc-unknown-none-elf/debug/os
# 导入源码路径
(gdb) directory /Volumes/Code/rCore-Tutorial-v3/os/
Source directories searched: /Volumes/Code/rCore-Tutorial-v3/os:$cdir:$cwd
# 连接到qemu中的gdb-server
(gdb) target remote localhost:1234
Remote debugging using localhost:1234
0x0000000000001000 in ?? ()
# 现在可以开始调试了，下面给出一些示例指令：
(gdb) b rust_main
Breakpoint 1 at 0x802005aa: file /Volumes/Code/rCore-Tutorial-v3/os/src/main.rs, line 36.
(gdb) continue
Continuing.

Breakpoint 1, os::rust_main () at /Volumes/Code/rCore-Tutorial-v3/os/src/main.rs:36
36       clear_bss();
(gdb) l
31           fn sbss();
32           fn ebss();
33           fn boot_stack();
34           fn boot_stack_top();
35       }
36       clear_bss();
```

### 在 IDE 中直接使用 gdb[#]( #idegdb "永久链接至标题")

下面以 [CLion]([https://www.jetbrains.com/clion/](https://www.jetbrains.com/clion/)) 中 [Rust 插件]([https://plugins.jetbrains.com/plugin/8182-rust](https://plugins.jetbrains.com/plugin/8182-rust)) 为例。其他 IDE 的配置大同小异。

注意：上面提供的 GDB 二进制版本过低，需要使用自己编译的最新版本的 GDB。

1.  在 CLion 中打开项目（os 文件夹），选择 `cargo project` 。
    
2.  在项目中新建一个 `sh` 文件，输入以下内容并给予可执行权限：
    

```
#!/usr/bin/env bash
killall qemu-system-riscv64 # 由于无法在debug结束时关闭虚拟机，我们在debug开始时关闭上一次开启的虚拟机。
nohup bash -c "make run > run.log 2>&1" & # 后台启动qemu
echo "Done!"
```

3.  在右上角点击 `Edit Configurations` , 新增一个 `GDB Remote Debug` , 并如图配置：
    

![](https://rcore-os.cn/rCore-Tutorial-Book-v3/_images/clion_config.jpg)

第 1 个红框中选择你的自己编译的 gdb 路径 第 3, 4 个红框中根据你的代码路径做适当修改 第 5 个红框中，点击下面加号，选择 `External Tools`，并选择上面新建的 `sh` 脚本。

分析可执行文件[#]( #id3 "永久链接至标题")
--------------------------

对于 Rust 编译器生成的执行程序，可通过各种有效工具进行分析。如果掌握了对这些工具的使用，那么在后续的开发工作中，对碰到的各种奇怪问题就进行灵活处理和解决了。 我们以 Rust 编译生成的一个简单的 “Hello, world” 应用执行程序为分析对象，看看如何进行分析。

让我们先来通过 `file` 工具看看最终生成的可执行文件的格式：

```
$ cargo new os
$ cd os; cargo build
   Compiling os v0.1.0 (/tmp/os)
   Finished dev [unoptimized + debuginfo] target(s) in 0.26s

$ file target/debug/os
target/debug/os: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked,
interpreter /lib64/ld-linux-x86-64.so.2, ......

$
```

从中可以看出可执行文件的格式为 **可执行和链接格式** (Executable and Linkable Format, ELF)，硬件平台是 x86-64。在 ELF 文件中， 除了程序必要的代码、数据段（它们本身都只是一些二进制的数据）之外，还有一些 **元数据** (Metadata) 描述这些段在地址空间中的位置和在 文件中的位置以及一些权限控制信息，这些元数据只能放在代码、数据段的外面。

### rust-readobj[#]( #rust -readobj "永久链接至标题")

我们可以通过二进制工具 `rust-readobj` 来看看 ELF 文件中究竟包含什么内容，输入命令：

```
$ rust-readobj -all target/debug/os
```

首先可以看到一个 ELF header，它位于 ELF 文件的开头：

```
1File: target/debug/os
 2Format: elf64-x86-64
 3Arch: x86_64
 4AddressSize: 64bit
 5LoadName:
 6ElfHeader {
 7Ident {
 8   Magic: (7F 45 4C 46)
 9   Class: 64-bit (0x2)
10   DataEncoding: LittleEndian (0x1)
11   FileVersion: 1
12   OS/ABI: SystemV (0x0)
13   ABIVersion: 0
14   Unused: (00 00 00 00 00 00 00)
15}
16Type: SharedObject (0x3)
17Machine: EM_X86_64 (0x3E)
18Version: 1
19Entry: 0x5070
20ProgramHeaderOffset: 0x40
21SectionHeaderOffset: 0x32D8D0
22Flags [ (0x0)
23]
24HeaderSize: 64
25ProgramHeaderEntrySize: 56
26ProgramHeaderCount: 12
27SectionHeaderEntrySize: 64
28SectionHeaderCount: 42
29StringTableSectionIndex: 41
30}
31......
```

*   第 8 行是一个称之为 **魔数** (Magic) 独特的常数，存放在 ELF header 的一个固定位置。当加载器将 ELF 文件加载到内存之前，通常会查看 该位置的值是否正确，来快速确认被加载的文件是不是一个 ELF 。
    
*   第 19 行给出了可执行文件的入口点为 `0x5070` 。
    
*   从 20-21 行中，我们可以知道除了 ELF header 之外，还有另外两种不同的 header，分别称为 program header 和 section header， 它们都有多个。ELF header 中给出了其他两种 header 的大小、在文件中的位置以及数目。
    
*   从 24-27 行中，可以看到有 12 个不同的 program header，它们从文件的 0x40 字节偏移处开始，每个 56 字节； 有 64 个 section header, 它们从文件的 0x2D8D0 字节偏移处开始，每个 64 字节；
    

有多个不同的 section header，下面是个具体的例子：

```
......
Section {
   Index: 14
   Name: .text (157)
   Type: SHT_PROGBITS (0x1)
   Flags [ (0x6)
      SHF_ALLOC (0x2)
      SHF_EXECINSTR (0x4)
   ]
   Address: 0x5070
   Offset: 0x5070
   Size: 208067
   Link: 0
   Info: 0
   AddressAlignment: 16
   EntrySize: 0
}
```

每个 section header 则描述一个段的元数据。

其中，我们看到了代码段 `.text` 需要被加载到地址 `0x5070` ，大小 208067 字节。 它们分别由元数据的字段 Offset、 Size 和 Address 给出。

我们还能够看到程序中的符号表：

```
Symbol {
  Name: _start (37994)
  Value: 0x5070
  Size: 47
  Binding: Global (0x1)
  Type: Function (0x2)
  Other: 0
  Section: .text (0xE)
}
 Symbol {
    Name: main (38021)
    Value: 0x51A0
    Size: 47
    Binding: Global (0x1)
    Type: Function (0x2)
    Other: 0
    Section: .text (0xE)
 }
```

里面包括了我们写的 `main` 函数的地址以及用户态执行环境的起始地址 `_start` 函数的地址。

因此，从 ELF header 中可以看出，ELF 中的内容按顺序应该是：

*   ELF header
    
*   若干个 program header
    
*   程序各个段的实际数据
    
*   若干的 section header
    

### rust-objdump[#]( #rust -objdump "永久链接至标题")

如果想了解正常的 ELF 文件的具体指令内容，可以通过 `rust-objdump` 工具反汇编 ELF 文件得到：

```
$ rust-objdump -all target/debug/os
```

具体结果如下：

```
505b: e9 c0 ff ff ff                jmp     0x5020 <.plt>

Disassembly of section .plt.got:

0000000000005060 <.plt.got>:
   5060: ff 25 5a 3f 04 00             jmpq    *278362(%rip)  # 48fc0 <_GLOBAL_OFFSET_TABLE_+0x628>
   5066: 66 90                         nop

Disassembly of section .text:

0000000000005070 <_start>:
   5070: f3 0f 1e fa                   endbr64
   5074: 31 ed                         xorl    %ebp, %ebp
   5076: 49 89 d1                      movq    %rdx, %r9
   5079: 5e                            popq    %rsi
   507a: 48 89 e2                      movq    %rsp, %rdx
   507d: 48 83 e4 f0                   andq    $-16, %rsp
   5081: 50                            pushq   %rax
   5082: 54                            pushq   %rsp
   5083: 4c 8d 05 86 2c 03 00          leaq    208006(%rip), %r8  # 37d10 <__libc_csu_fini>
   508a: 48 8d 0d 0f 2c 03 00          leaq    207887(%rip), %rcx  # 37ca0 <__libc_csu_init>
   5091: 48 8d 3d 08 01 00 00          leaq    264(%rip), %rdi  # 51a0 <main>
   5098: ff 15 d2 3b 04 00             callq   *277458(%rip)  # 48c70 <_GLOBAL_OFFSET_TABLE_+0x2d8>
......
00000000000051a0 <main>:
   51a0: 48 83 ec 18                   subq    $24, %rsp
   51a4: 8a 05 db 7a 03 00             movb    228059(%rip), %al  # 3cc85 <__rustc_debug_gdb_scripts_section__>
   51aa: 48 63 cf                      movslq  %edi, %rcx
   51ad: 48 8d 3d ac ff ff ff          leaq    -84(%rip), %rdi  # 5160 <_ZN2os4main17h717a6a6e05a70248E>
   51b4: 48 89 74 24 10                movq    %rsi, 16(%rsp)
   51b9: 48 89 ce                      movq    %rcx, %rsi
   51bc: 48 8b 54 24 10                movq    16(%rsp), %rdx
   51c1: 88 44 24 0f                   movb    %al, 15(%rsp)
   51c5: e8 f6 00 00 00                callq   0x52c0 <_ZN3std2rt10lang_start17hc258028f546a93a1E>
   51ca: 48 83 c4 18                   addq    $24, %rsp
   51ce: c3                            retq
   51cf: 90                            nop
......
```

从上面的反汇编结果，我们可以看到用户态执行环境的入口函数 `_start` 以及应用程序的主函数 `main` 的地址和具体汇编代码内容。

### rust-objcopy[#]( #rust -objcopy "永久链接至标题")

当前的 ELF 执行程序有许多与执行无直接关系的信息（如调试信息等），可以通过 `rust-objcopy` 工具来清除。

```
$ rust-objcopy --strip-all target/debug/os target/debug/os.bin
$ ls -l target/debug/os*
   -rwxrwxr-x 2 chyyuu chyyuu 3334992 1月  19 22:26 target/debug/os
   -rwxrwxr-x 1 chyyuu chyyuu  297200 1月  19 22:59 target/debug/os.bin

$ ./target/debug/os.bin
   Hello, world!
```

可以看到，经过处理的 ELF 文件 `os.bin` 在文件长度上大大减少了，但也能正常执行。

另外，当将程序加载到内存的时候，对于每个 program header 所指向的区域，我们需要将对应的数据从文件复制到内存中。这就需要解析 ELF 的元数据 才能知道数据在文件中的位置以及即将被加载到内存中的位置。但如果我们不需要从 ELF 中解析元数据就知道程序的内存布局 （这个内存布局是我们按照需求自己指定的），我们可以手动完成加载任务。

具体的做法是利用 `rust-objcopy` 工具删除掉 ELF 文件中的 所有 header 只保留各个段的实际数据得到一个没有任何符号的纯二进制镜像文件：

```
$ rust-objcopy --strip-all target/debug/os -O binary target/debug/os. bin
```

这样就生成了一个没有任何符号的纯二进制镜像文件。由于缺少了必要的元数据，我们的 `file` 工具也没有办法 对它完成解析了。而后，我们可直接将这个二进制镜像文件手动载入到内存中合适位置即可。

qemu 平台上可执行文件和二进制镜像的生成流程[#]( #qemu "永久链接至标题")
--------------------------------------------

### make & Makefile[#]( #make -makefile "永久链接至标题")

首先我们还原一下可执行文件和二进制镜像的生成流程：

```
# os/Makefile
TARGET := riscv64gc-unknown-none-elf
MODE := release
KERNEL_ELF := target/$(TARGET)/$(MODE)/os
KERNEL_BIN := $(KERNEL_ELF). bin

$(KERNEL_BIN): kernel
   @$(OBJCOPY) $(KERNEL_ELF) --strip-all -O binary $@

kernel:
   @cargo build --release
```

这里可以看出 `KERNEL_ELF` 保存最终可执行文件 `os` 的路径，而 `KERNEL_BIN` 保存只保留各个段数据的二进制镜像文件 `os. bin` 的路径。目标 `kernel` 直接通过 `cargo build` 以 release 模式最终可执行文件，目标 `KERNEL_BIN` 依赖于目标 `kernel`，将 可执行文件通过 `rust-objcopy` 工具加上适当的配置移除所有的 header 和符号得到二进制镜像。

我们可以通过 `make run` 直接在 qemu 上运行我们的应用程序，qemu 是一个虚拟机，它完整的模拟了一整套硬件平台，就像是一台真正的计算机 一样，我们来看运行 qemu 的具体命令：

```
1KERNEL_ENTRY_PA := 0x80020000
 3BOARD                ?= qemu
 4SBI                  ?= rustsbi
 5BOOTLOADER   := ../bootloader/$(SBI)-$(BOARD). bin
 7run: run-inner
 9run-inner: build
10ifeq ($(BOARD), qemu)
11   @qemu-system-riscv64 \
12      -machine virt \
13      -nographic \
14      -bios $(BOOTLOADER) \
15      -device loader, file=$(KERNEL_BIN), addr=$(KERNEL_ENTRY_PA)
16else
17   @cp $(BOOTLOADER) $(BOOTLOADER). copy
18   @dd if=$(KERNEL_BIN) of=$(BOOTLOADER). copy bs=128K seek=1
19   @mv $(BOOTLOADER). copy $(KERNEL_BIN)
20   @sudo chmod 777 $(K210-SERIALPORT)
21   python3 $(K210-BURNER) -p $(K210-SERIALPORT) -b 1500000 $(KERNEL_BIN)
22   miniterm --eol LF --dtr 0 --rts 0 --filter direct $(K210-SERIALPORT) 115200
23endif
```

### qemu[#]( #id4 "永久链接至标题")

注意其中高亮部分给出了传给 qemu 的参数。

*   `-machine` 告诉 qemu 使用预设的硬件配置。在整个项目中我们将一直沿用该配置。
    
*   `-bios` 告诉 qemu 使用我们放在 `bootloader` 目录下的预编译版本作为 bootloader。
    
*   `-device` 则告诉 qemu 将二进制镜像加载到内存指定的位置。
    

可以先输入 Ctrl+A ，再输入 X 来退出 qemu 终端。

警告

**FIXME：使用 GDB 跟踪 qemu 的运行状态**

k210 平台上可执行文件和二进制镜像的生成流程[#]( #k210 "永久链接至标题")
--------------------------------------------

对于 k210 平台来说，只需要将 maix 系列开发板通过数据线连接到 PC，然后 `make run BOARD=k210` 即可。从 Makefile 中来看：

```
1K210-SERIALPORT      = /dev/ttyUSB0
 2K210-BURNER          = ../tools/kflash. py
 4run-inner: build
 5ifeq ($(BOARD), qemu)
 6   @qemu-system-riscv64 \
 7      -machine virt \
 8      -nographic \
 9      -bios $(BOOTLOADER) \
10      -device loader, file=$(KERNEL_BIN), addr=$(KERNEL_ENTRY_PA)
11else
12   @cp $(BOOTLOADER) $(BOOTLOADER). copy
13   @dd if=$(KERNEL_BIN) of=$(BOOTLOADER). copy bs=128K seek=1
14   @mv $(BOOTLOADER). copy $(KERNEL_BIN)
15   @sudo chmod 777 $(K210-SERIALPORT)
16   python3 $(K210-BURNER) -p $(K210-SERIALPORT) -b 1500000 $(KERNEL_BIN)
17   miniterm --eol LF --dtr 0 --rts 0 --filter direct $(K210-SERIALPORT) 115200
18endif
```

在构建目标 `run-inner` 的时候，根据平台 `BOARD` 的不同，启动运行的指令也不同。当我们传入命令行参数 `BOARD=k210` 时，就会进入下面 的分支。

*   第 13 行我们使用 `dd` 工具将 bootloader 和二进制镜像拼接到一起，这是因为 k210 平台的写入工具每次只支持写入一个文件，所以我们只能 将二者合并到一起一并写入 k210 的内存上。这样的参数设置可以保证 bootloader 在合并后文件的开头，而二进制镜像在文件偏移量 0x20000 的 位置处。有兴趣的同学可以输入命令 `man dd` 查看关于工具 `dd` 的更多信息。
    
*   第 16 行我们使用烧写工具 `K210-BURNER` 将合并后的镜像烧写到 k210 开发板的内存的 `0x80000000` 地址上。 参数 `K210-SERIALPORT` 表示当前 OS 识别到的 k210 开发板的串口设备名。在 Ubuntu 平台上一般为 `/dev/ttyUSB0`。
    
*   第 17 行我们打开串口终端和 k210 开发板进行通信，可以通过键盘向 k210 开发板发送字符并在屏幕上看到 k210 开发板的字符输出。
    

可以输入 Ctrl+] 退出 miniterm。

## 其他工具和文件格式说明的参考

- [链接脚本(Linker Scripts)语法和规则解析(翻译自官方手册)](https://blog.csdn.net/m0_47799526/article/details/108765403)

- [Make 命令教程](https://www.w3cschool.cn/mexvtg/)