---
url: https://unix.stackexchange.com/questions/4126/what-is-the-exact-difference-between-a-terminal-a-shell-a-tty-and-a-con
publish: "true"
---
在 Linux 设备上有这样一些术语常常让人感到混沌：terminal、shell、tty、console。事实上，这组术语与计算机的发展历史息息相关，下面就是从Stack Overflow 中摘抄的解释，帮助读者理解。

## TLDR 版

A terminal is at the end of an electric wire, a shell is the home of a turtle, tty is a strange abbreviation and a console is a kind of cabinet.

Well, etymologically speaking, anyway.

In Unix terminology, the short answer is that:
- terminal = tty = text input/output environment
- console = physical terminal
- shell = command line interpreter

> 1. **terminal**（终端）：通常指连接电源线的设备，在 Linux 语境中也可能表示一个虚拟的含义——终端模拟器（terminal simulator）。它实际上就是对设备的一个总称，能够输入文本、执行命令的一个硬件环境；而终端模拟器就是在 Linux 等操作系统中模拟这个任务执行的程序，里面通常需要搭配 shell 程序保持运行。
> 2. **tty**（TeleTypewriter，电传打字机）：一种奇怪的缩写，但实际含义与 terminal 没什么区别。如果安装过 Arch Linux，在还没有安装 KDE 等桌面环境时，开机后进入的黑色命令行界面，就是所谓的 tty。
> 3. **shell**（壳）：将操作系统内核包裹起来，开放接口给用户使用，形象地称为 shell（像乌龟的壳一样）。shell 程序现如今更准确地说，是对命令行的解释器，就像 Python 一样，对输入的命令进行响应、执行，完成任务。
> 4. **console**（控制台）：它的含义仍然是物理可见的终端，一般是用来对设备进行控制操作的。

## 详细解释

### terminal、console、tty

Console, terminal and tty are closely related. Originally, they meant a piece of equipment through which you could interact with a computer: In the early days of Unix, that meant a [teleprinter](https://en.wikipedia.org/wiki/Teleprinter) -style device resembling a typewriter, sometimes called a teletypewriter, or “tty” in shorthand. The name “terminal” came from the electronic point of view, and the name “console” from the furniture point of view. Very early in Unix history, electronic keyboards and displays became the norm for terminals.
> 最初，console、terminal、tty 都指用于和计算机交互的物理设备，在 Unix 的早期阶段，指的是 teleprinter（电传打印机）风格的设备，有时称为 teletypewriter（电传打字机），其缩写就是 tty。
> termial 之称来自电子设备的角度，console 之称来自用具的角度。在 Unix 早期，电子键盘和显示器是终端的标准配置。

In Unix terminology, a **tty** is a particular kind of [device file](https://en.wikipedia.org/wiki/Device_file) which implements a number of additional commands ( [ioctls](https://en.wikipedia.org/wiki/Ioctl#Terminals)) beyond read and write. In its most common meaning, **terminal** is synonymous with tty. Some ttys are provided by the kernel on behalf of a hardware device, for example with the input coming from the keyboard and the output going to a text mode screen, or with the input and output transmitted over a serial line. Other ttys, sometimes called **pseudo-ttys**, are provided (through a thin kernel layer) by programs called [**terminal emulators**](https://en.wikipedia.org/wiki/Terminal_emulator), such as [Xterm](https://en.wikipedia.org/wiki/Xterm) (running in the [X Window System](https://en.wikipedia.org/wiki/X_Window_System)), [Screen](https://en.wikipedia.org/wiki/GNU_Screen) (which provides a layer of isolation between a program and another terminal), [SSH](https://en.wikipedia.org/wiki/Secure_Shell) (which connects a terminal on one machine with programs on another machine), [Expect](https://en.wikipedia.org/wiki/Expect) (for scripting terminal interactions), etc.
> 在 Unix 术语中（我们从操作系统的视角来看），tty 是一种特殊的设备文件，它实现了除读写之外的一系列命令，而 terminal 则与 tty 非常相似。
> - 一些 tty 由操作系统内核代表硬件设备来提供支持，例如从键盘中的输入和发送到文本显示器中的输出，以及通过串行线路传输的输入和输出。
> - 另一些 tty 又称为 pseudo-tty（伪tty），则是通过终端模拟器这样的程序提供支持，例如著名的Xterm、Screen、SSH、Expect 这些软件
> 	- Xterm：用于 X Window System
> 	- Screen：提供程序和其它终端之间的独立层
> 	- SSH：连接一个设备的终端与其他设备上的程序
> 	- Expect：脚本化地完成终端交互

The word terminal can also have a more traditional meaning of a device through which one interacts with a computer, typically with a keyboard and a display. For example an X terminal is a kind of [thin client](https://en.wikipedia.org/wiki/Thin_client), a special-purpose computer whose only purpose is to drive a keyboard, display, mouse and occasionally other human interaction peripherals[^1], with the actual applications running on another, more powerful computer.
> terminal 也可能更传统地作为人与计算机交互的设备，例如键盘和显示器。例如 X terminal 是一种 “瘦客户端” ，其唯一用途是为键盘、显示器、鼠标等其它实现人机交互的设备提供驱动，但实际的应用在另外的更加powerful 的计算机上运行。（就像远程桌面一样，可以操控另一台机器，但其本质的运行还是在那台机器上）。

A **console** is generally a terminal in the physical sense that is by some definition the primary terminal directly connected to a machine. The console appears to the operating system as a (kernel-implemented) tty. On some systems, such as Linux and FreeBSD, the console appears as several ttys (special key combinations switch between these ttys); just to confuse matters, the name given to each particular tty can be “console”, ”virtual console”, ”virtual terminal”, and other variations.
> console 通常意义上是物理上的终端——确切地说是直接连接到机器的主要终端。console 以一种内核实现的tty 的形式出现在操作系统中，例如Linux 和FreeBSD 中，console 以多个tty 的形式出现（使用特殊的组合键可以在这些ttys 中切换）
> 
> 不过令人感到困惑的是，赋予特定tty 的名字有很多，例如console、virtual console、virtule terminal 等等（依据开发者的喜好，于是出现了乱七八糟的命名）。

See also：[Why is a Virtual Terminal “virtual”, and what/why/where is the “real” Terminal?](https://askubuntu.com/q/14284/1059).

### shell

A [**shell**](https://en.wikipedia.org/wiki/Shell_%28computing%29) is the primary interface that users see when they log in, whose primary purpose is to start other programs. (I don't know whether the original metaphor is that the shell is the home environment for the user, or that the shell is what other programs are running in.)
> shell 是用户们登录计算机时看到的最初（也最重要）界面，其根本目的是为了启动其它的程序。（有些说法认为，shell 本义为“壳”，这可能隐喻用户在操作系统中所处的位置，或者其他程序在其中运行/生存）

In Unix circles, **shell** has specialized to mean a [command-line shell](https://en.wikipedia.org/wiki/Shell_%28computing%29#Command-line_shells), centered around entering the name of the application one wants to start, followed by the names of files or other objects that the application should act on, and pressing the Enter key. Other types of environments don't use the word “shell”; for example, window systems involve “[window managers](https://en.wikipedia.org/wiki/Window_manager)” and “[desktop environments](https://en.wikipedia.org/wiki/Desktop_environment)”, not a “shell”.
> 在 Unix 语境中，shell 尤指command-line shell，其专注于用户输入端想要运行的应用的名字，以及告知应用运行所需的文件或指示，然后键入 “Enter” 即可开始运行。
> 
> 而在其它操作系统中，可能不用shell 这个术语，例如windows 系统中使用 windows manager 和 desktop environments（窗口管理器和桌面环境）这两个术语。

There are many different Unix shells. Popular shells for interactive use include [Bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)) (the default on most Linux installations), [Zsh](https://en.wikipedia.org/wiki/Z_shell) (which emphasizes power and customizability) and [fish](https://en.wikipedia.org/wiki/Fish_(Unix_shell)) (which emphasizes simplicity).
> 在 Unix shell 中也有很多种类，如最初的sh，以及GNU 项目的 Bourne 增强后的Bash（也是最流行的shell），后来也有其它版本，如Zsh（重视效率与客制化性） 和fish（重视易用性）。

Command-line shells include flow control constructs to combine commands. In addition to typing commands at an interactive prompt, users can write scripts. The most common shells have a common syntax based on the [Bourne shell](https://en.wikipedia.org/wiki/Bourne_shell). When discussing “**shell programming**”, the shell is almost always implied to be a Bourne-style shell. Some shells that are often used for scripting but lack advanced interactive features include the [KornShell (ksh)](https://en.wikipedia.org/wiki/KornShell) and many [ash](https://en.wikipedia.org/wiki/Almquist_shell) variants. Pretty much any Unix-like system has a Bourne-style shell installed as `/bin/sh`, usually ash, ksh or Bash.
> 命令行 shell 包括流程控制以实现多条命令的组合。除了在交互式提示命令行中敲击命令，用户也可以撰写脚本，最通用的shell 程序语法基于Bash，这称为shell 编程（bash 基本上是shell 编程的通用语，zsh 和fish 等小众shell 可能会有自己的部分方言，但也会支持bash 语法）。
> 还有一些其它缺乏交互性、专注脚本运行的shell 如KornShell 、ash 及其衍生版，并且Unix 风格的系统上这些 shell 都安装为 `/bin/sh` 。

In Unix system administration, a user's **shell** is the program that is invoked when they log in. Normal user accounts have a command-line shell, but users with restricted access may have a [restricted shell](https://en.wikipedia.org/wiki/Restricted_shell) or some other specific command (e.g. for file-transfer-only accounts).
> 在 Unix 系统管理层面那看来，用户的shell 是他们登录计算机伊始就运行的程序，通常用户会使用命令行shell，但是用户非常严格地被限制使用部分命令（OS 的权限管理）。

### terminal 与shell 之间的区别

The division of labor between the terminal and the shell is not completely obvious. Here are their main tasks:

- Input: the terminal converts keys into control sequences (e.g. Left → `\e[D`). The shell converts control sequences into commands (e.g. `\e[D` → `backward-char`).
> 对于输入：
> - terminal 将键转换为控制序列，如左方向键<-会被转换为 `\e[D`;
> - shell 则将控制序列转换为命令，如 `\e[d` 转换为 `backward-char`

- Line editing, input history and completion are provided by the shell.
- The terminal may provide its own line editing, history and completion instead, and only send a line to the shell when it's ready to be executed. The only common terminal that operates in this way is `M-x shell` in Emacs.
> - 对于行编辑、输入历史、命令补全，则是由shell 提供功能。
> - 而terminal 有自己的编辑、历史与补全，并且只在shell 准备执行时发送给它。这类terminal 的例子有Emacs 中的 `M-x shell`。

- Output: the shell emits instructions such as “display `foo`”, “switch the foreground color to green”, “move the cursor to the next line”, etc. The terminal acts on these instructions.
> 对于输出：
> - shell 发出类似 显示 `foo`、切换前景色为绿色等指令
> - 而终端根据这些指令进行操作

- The prompt is purely a shell concept.
> prompt（命令提示符）完全是shell 中的概念

- The shell never sees the output of the commands it runs (unless redirected). Output history (scrollback) is purely a terminal concept.
> shell 看不到它所运行的命令的输出。
> 输出历史完全是 terminal 的概念（功能）。

- Inter-application copy-paste is provided by the terminal (usually with the mouse or key sequences such as Ctrl+Shift+V or Shift+Insert). The shell may have its own internal copy-paste mechanism as well (e.g. Meta+W and Ctrl+Y).
> 应用间进行复制、粘贴的功能由terminal 提供（通常使用鼠标或按键组合ctrl+shift+V 等）
> shell 也可能包含其内置的复制、粘贴机制（如ctrl+Y）

- [Job control](https://en.wikipedia.org/wiki/Job_control_(Unix)) (launching programs in the background and managing them) is mostly performed by the shell. However, it's the terminal that handles key combinations like Ctrl+C to kill the foreground job and Ctrl+Z to suspend it.
> 作业管理（后台启动程序并且管理它们）通常是由shell 来执行，terminal 通过ctrl+C 来杀死前台作业或用ctrl+Z 暂停它。

[^1]: 意为“外设”