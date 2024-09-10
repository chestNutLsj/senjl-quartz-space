本篇是学习`Linux Shell`的第二篇——配置文件及`shell`环境。

## 1. `shell`环境

本章命令：`printenv`, `set`, `export`, `alias`。

shell 在 shell  会话中维护着大量信息，这称为 shell 环境。存储在shell环境中的数据被程序用来确定配置属性，然而大多数程序用配置文件来存储程序设置，某些程序会查找存储在shell环境中的数值来调整它们的行为。

### 1.1 什么存储在环境变量中？

shell在环境中村除了两种基本类型的数据，环境变量和shell变量。对bash来说，二者难以辨别，shell变量是由bash存放的少量数据，剩下的都是环境变量。

除了变量，shell还存储了一些可编程数据，即别名和shell函数。

### 1.2 检查环境变量

`set`：可以显示shell和环境变量；

`printenv`：只显示环境变量；

```shell
[lsjarch@LsjsArch ~]$ set | less
[lsjarch@LsjsArch ~]$ printenv | less
SHELL=/bin/bash
WINDOWID=6291463
COLORTERM=truecolor
XDG_CONFIG_DIRS=/home/lsjarch/.config/kdedefaults:/etc/xdg
XDG_SESSION_PATH=/org/freedesktop/DisplayManager/Session2
GTK_IM_MODULE=fcitx5
LANGUAGE=zh_CN:en_US
SHELL_SESSION_ID=253cc35011c7492f8b85d5420ee00938
XMODIFIERS=@im=fcitx5
DESKTOP_SESSION=plasma
LC_MONETARY=zh_CN.UTF-8
GTK_RC_FILES=/etc/gtk/gtkrc:/home/lsjarch/.gtkrc:/home/lsjarch/.config/gtkrc
XCURSOR_SIZE=24
EDITOR=vim
GTK_MODULES=canberra-gtk-module
XDG_SEAT=seat0
PWD=/home/lsjarch
XDG_SESSION_DESKTOP=KDE
LOGNAME=lsjarch
XDG_SESSION_TYPE=x11
SYSTEMD_EXEC_PID=865
XAUTHORITY=/home/lsjarch/.Xauthority
MOTD_SHOWN=pam
GTK2_RC_FILES=/etc/gtk-2.0/gtkrc:/home/lsjarch/.gtkrc-2.0:/home/lsjarch/.config/gtkrc-2.0
HOME=/home/lsjarch
LANG=zh_CN.UTF-8
XDG_CURRENT_DESKTOP=KDE
KONSOLE_DBUS_SERVICE=:1.5323
KONSOLE_DBUS_SESSION=/Sessions/1
PROFILEHOME=
XDG_SEAT_PATH=/org/freedesktop/DisplayManager/Seat0
...
```

将两个命令的输出管道到less中，可以得到类似上面的内容——环境变量及其数值的列表。



如果要输出特定的环境变量的值：

```shell
[lsjarch@LsjsArch ~]$ printenv USER
lsjarch
[lsjarch@LsjsArch ~]$ printenv SHELL
/bin/bash
[lsjarch@LsjsArch ~]$ printenv LANGUAGE 
zh_CN:en_US

```

还可以使用`echo`命令查看变量的值：

```shell
[lsjarch@LsjsArch ~]$ echo $USER
lsjarch
[lsjarch@LsjsArch ~]$ echo $SHELL
/bin/bash

```



当使用没有带选项和参数的`set`命令时，shell和环境变量都会显示，同时也会显示自定义的shell函数，并且输出结果是按照字典顺序排列。

还有一种shell环境的成员，即不能被`set`命令也不能被`printenv`命令显示，即别名，只能用`alias`查看：

```shell
[lsjarch@LsjsArch ~]$ alias
alias ls='ls --color=auto'

```



### 1.3 一些关键变量

| 变量    | 内容                                                         |
| ------- | ------------------------------------------------------------ |
| DISPLAY | 如果正再使用GUI界面，那这个变量表示显示器的名字。通常是`:0`，表示由X产生的第一个显示器。 |
| EDITOR  | 文本编辑器的名字                                             |
| SHELL   | shell程序的名字                                              |
| HOME    | 用户家目录                                                   |
| LANG    | 定义了字符集以及语言编码方式                                 |
| OLD_PWD | 先前的工作目录                                               |
| PAGER   | 页输出程序的名字。通常是`/usr/bin/less`                      |
| PATH    | 由冒号分开的目录列表，当在shell中输入可执行程序后，会搜索这个目录列表 |
| PS1     | Prompt String 1，定义了shell提示符的内容                     |
| PWD     | 当前工作目录                                                 |
| TERM    | 终端类型名。设置了终端仿真器所用的协议                       |
| TZ      | 指定所在的时区                                               |
| USER    | 用户名                                                       |

```shell
[lsjarch@LsjsArch ~]$ printenv DISPLAY 
:0
[lsjarch@LsjsArch ~]$ printenv EDITOR 
vim
[lsjarch@LsjsArch ~]$ printenv SHELL
/bin/bash
[lsjarch@LsjsArch ~]$ printenv HOME
/home/lsjarch
[lsjarch@LsjsArch ~]$ printenv LANG
zh_CN.UTF-8
[lsjarch@LsjsArch ~]$ printenv PATH 
/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/lib/jvm/default/bin:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl
[lsjarch@LsjsArch ~]$ printenv PWD
/home/lsjarch
[lsjarch@LsjsArch ~]$ printenv TERM
xterm-256color
[lsjarch@LsjsArch ~]$ printenv USER
lsjarch

```

### 1.4 如何建立shell环境

用户登录系统后，启动bash程序，会读取一系列称为启动文件的配置脚本，这些文件定义了默认可供所有用户共享的shell环境。然后是读取位于用户家目录的启动文件，这些启动文件定义了用户个人的shell环境。

精确的启动顺序取决于要运行的shell会话，shell会话有两种类型——登录shell会话，会提示用户输入用户名和密码；非登录shell会话，在GUI界面下运行终端会话。

登录shell会话会读取一个或多个启动文件：

| 文件            | 内容                                                         |
| --------------- | ------------------------------------------------------------ |
| /etc/profile    | 应用于所有用户的全局配置脚本                                 |
| ~/.bash_profile | 用户私人的启动文件。可用来扩展或重写全局配置脚本中的设置     |
| ~/.bash_login   | 如果文件~/.bash_profile没有找到，那么bash会读取这个脚本      |
| ~/,profile      | 如果~/.bash_profile和 ~/.bash_login都没有找到，bash会试图读取这个文件，这是debian系的默认设置 |

非登录shell会话会读取以下启动文件：

| 文件             | 内容                                                     |
| ---------------- | -------------------------------------------------------- |
| /etc/bash.bashrc | 应用于所有用户的全局配置文件                             |
| ~/.bashrc        | 用户私有的启动文件，可用来扩展或重写全局配置脚本中的设置 |

除了读取上述启动文件外，非登录shell会话还会继承它们父进程的环境设置，通常是一个登录shell。



### 1.5 查看启动文件

先查看一下.bash_profile文件：

```shell
[lsjarch@LsjsArch ~]$ cat .bash_profile 
#
# ~/.bash_profile
#

```

这里，以#开头的行是注释，shell不会读取它们。



另一件事，shell是如何直到去哪查找我们在命令行中输入的命令呢？总不能每次输入都查找一遍整个系统。事实上，shell会查找一个目录列表，它存放在PATH变量中。PATH变量经常在/etc/profile启动文件中设置，当然这取决于发行版。

```shell
[lsjarch@LsjsArch ~]$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/lib/jvm/default/bin:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl

```

修改PATH变量，添加新的目录到原目录列表的末尾，则目录`$HOME/bin`也添加到命令搜索目录列表中。添加的方法是参数展开：

```shell
[lsjarch@LsjsArch ~]$ PATH=$PATH:$HOME/bin
[lsjarch@LsjsArch ~]$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/lib/jvm/default/bin:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl:/home/lsjarch/bin

```

添加了`$HOME/bin`目录后，意味着当我们想要在当前家目录下创建一个目录来存储私人程序时，shell已经准备完毕。

回顾一下参数展开：

```shell
[lsjarch@LsjsArch ~]$ foo="This is some"
[lsjarch@LsjsArch ~]$ echo $foo
This is some
[lsjarch@LsjsArch ~]$ foo="$foo text."
[lsjarch@LsjsArch ~]$ echo $foo
This is some text.

```

最后，有一行代码：

```shell
export PATH
```

这个`export`命令告诉shell让这个shell的子进程可以使用PATH变量的内容。

### 1.6 修改shell环境

按照通常规则，添加目录到PATH中或定义额外的环境变量，要把这些更改放置到.bash_profile中；

对于其他的更改，要放到.bashrc文件中。

除非你是系统管理员，需要为系统中所有用户修改默认配置，那么限定你只能修改自己家目录下的文件。

### 1.7 文本编辑器

为了编辑shell的启动文件（当然还有其他文件），我们需要文本编辑器。不同于文本处理器（word等），文本编辑器只支持纯文本，并且包含了便于编程的特性。

文本编辑器通常有两种，图形化和基于文本的编辑器。

* 图形化编辑器，笔者使用的KDE桌面自带了kwrite编辑器，但它并不那么好用，这里建议使用vscode。
* 基于文本的编辑器，有nano、vi、emacs等。其中nano是pico编辑器的替代物，简单；emacs是一个庞大的、多用途的、可做任何事的编程环境，但大多Linux发行版并没有默认安装它；vi现在多被vim所替代，vim全写为”vi IMproved“，是类Unix操作系统的传统编辑器

![](hah.png)

下一章我们会深入学习vim，至于emacs的难度由上图可见一斑，笔者学会了再说吧。

( 先贴个emacs的入门博客：https://liujiacai.net/blog/2020/11/25/why-emacs/；还有一个Github项目：https://github.com/redguardtoo/mastering-emacs-in-one-year-guide/blob/master/guide-zh.org)

### 1.8 使用文本编辑器

以vim为例，在命令行中输入vim，加上想要编辑的文件名就可以打开，如果该文件名不存在，vim会在当前工作目录创建一个文件。

我们接下来要使用文本编辑器，来对启动文件做一些编辑，在这之前，一个良好的习惯是，先创建一个备份文件：

```shell
[lsjarch@LsjsArch ~]$ rm test_vim.txt 
[lsjarch@LsjsArch ~]$ cp .bashrc .bashrc.bak

```

扩展名`.bak`, `.sav`, `.old`都是常用的备份文件扩展名，任选即可。接下来，启动vim：

```shell
[lsjarch@LsjsArch ~]$ vim .bashrc.bak
```



现在，习惯用图形化编辑器的你肯定会手忙脚乱：这是什么？为什么我输入不了？为什么我按这个键，跳出的是那个键？

先记住，刚进入vim界面时，按<kbd>I</kbd>可以进入插入页面，移动光标，对文件进行编辑，编辑完成后，按<kbd>Esc</kbd>退出编辑，输入`:wq`保存并退出。

我们先试着输入以下几行（这是在复制文件中，尽管大胆尝试）：

```shell
umask 0002
export HISTCONTROL=ignoredups
export HISTSIZE=1000
alias l.='ls -d .* --color=auto'
alias ll='ls -l --color=auto'
```

各行的意义是：

| 文本行                           | 含义                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| umask 0002                       | 设置掩码来解决共享目录的问题                                 |
| export HISTCONTROL=ignoredups    | 使得shell的历史记录功能忽略一个命令，如果相同的命令已经被记录 |
| export HISTSIZE=1000             | 增加命令历史的大小，从默认的500行扩大到1000行                |
| alias l.=‘ls -d .* --color=auto’ | 创建一个新命令，`l.`会显示所有以`.` 开头的目录项             |
| alias ll=‘ls -l --color=auto’    | 创建一个`ll`命令，这个命令会显示长格式目录列表               |

要养成随时添加注释的习惯，这样将抽象的代码具体成自然语言，会方便阅读。注释还可以把一些代码行注释掉，这样子可以给后续添加、修改的开发者以正确的配置语法示例，也可以为可能的配置选项提供一些建议。

### 1.9 激活修改

我们对.bashrc的修改不会直接生效，直到重新启动一个新的会话，这是因为.bashrc只在刚开始启动终端会话时读取。然而，使用`source`命令可以强迫bash重新读取修改后的.bashrc文件

### 1.10 拓展阅读

bash手册页的INVOCATION部分非常详细地讨论了bash启动文件。



## 2. Vim入门

Vim是一款功能丰富而强大的文本编辑器，其代码补全、编译及错误跳转等方便编程的功能特别丰富，在程序员中得到非常广泛的使用。Vim能够大大提高程序员的工作效率。对于Vim高手来说，Vim能以与思考同步的速度编辑文本。同时，学习和熟练使用Vim又有一定的难度。

我们常常可以看到，专门讲解Vim的书籍就有四五百页之多，这篇短短的博客当然只是一个入门，要深入的学习使用Vim，可以自行在z-libiary上下载[*Practical Vim: Edit Text at the Speed of Thought*](https://hk1lib.org/book/5103162/425395)查阅，那里也有其中文版，自行查阅下载。

### 2.1 启动和停止Vim

ArchLinux的现行版已经不再附带Vi，而是其高级版——Vim，但我们可以在.bashrc中为`vi`命令起别名：`alias vi=vim`，这样之后只需要两个字符就可以打开Vim。

在终端直接输入`vi`或`vim`，就可以打开Vim编辑器；

而要退出Vim，应当输入命令`:q`，如果因为某些原因Vim不能退出（比如做了修改却没有保存），我们可以使用`:q!`来强制退出。

### 2.2 编辑模式

预备工作：

```shell
[lsjarch@LsjsArch ~]$ mkdir start_vim
[lsjarch@LsjsArch ~]$ ls
Android  Desktop  Documents  Downloads  Music  MyLearning  Pictures  Postman  Public  start_vim  Templates  Videos
[lsjarch@LsjsArch ~]$ cd start_vim/
[lsjarch@LsjsArch start_vim]$ vim startEdit.txt

```

接下来，我们应当看到这样的页面：

![](vim.png)

每行开头的波浪号`~`指示那一行不存在文本（即使是空格）。

现在，我们处于vim的编辑模式，这个页面中几乎每一个按键都对应一个命令，所以直接输入字符的话，vim就会变的一团糟。

### 2.3 插入模式

要在文本中添加文本，必须进入插入模式。按下<kbd>I</kbd>即可进入插入模式，这时屏幕底部会出现一行`-- INSERT --`。

现在，尝试输入“ Vim is a practical editor. ”，然后按下<kbd>Esc</kbd>退出插入模式，返回到命令模式。

### 2.4 保存文本

在命令模式下，输入ex命令——`:w`，就会将刚才写好的文本保存到文件中。这时，屏幕底部会出现一个确认信息：

```shell
"startEdit .txt" [New] 1L, 27B written
```

### 2.5 移动光标

在vim命令模式下时，有很多共享于`less`的移动命令：

| 按键                                      | 移动光标                                       |
| ----------------------------------------- | ---------------------------------------------- |
| l or 右箭头                               | 向右移动一个光符                               |
| h or 左箭头                               | 向左移动一个字符                               |
| j or 下箭头                               | 向下移动一行                                   |
| k or 上箭头                               | 向上移动一行                                   |
| 0                                         | 移动到当前行的行首                             |
| ^                                         | 移动到当前行的第一个非空字符                   |
| $                                         | 移动到当前行的末尾                             |
| w                                         | 移动到下一个单词或标点符号的开头               |
| W                                         | 移动到下一个单词的开头，忽略标点符号           |
| b                                         | 移动到上一个单词或标点符号的开头               |
| B                                         | 移动到上一个单词的开头，忽略标点符号           |
| <kbd>ctrl</kbd>+<kbd>f</kbd> or Page Down | 向下翻一页                                     |
| <kbd>ctrl</kbd>+<kbd>b</kbd> or Page Up   | 向上翻一页                                     |
| numberG                                   | 移动到第number行。例如，`1G`移动到文件的第一行 |
| G                                         | 移动到文件末尾                                 |

事实上，很多命令都可以在前面加一个数字，如`5j`表示向下移动五行，当然`5 下箭头`也是有效的。

### 2.6 基本编辑

首先记住，vim中允许在命令模式使用`u`命令来撤销最后一次修改。

#### 2.6.1 追加文本

使用`i`命令进入插入模式时，光标会停留在原处，由于编辑模式下光标不能移动到行尾，所以想要直接在行尾添加字符时需要再移动一次光标。这时我们应该使用`a`命令进入插入模式，这时光标就会越过行尾，允许添加更多的文本。

使用`A`命令，可以在一行的任何地方，直接到达行尾开始插入模式。

试着插入新的文本：

```shell
Vim is a practical editor. is cool
Line 2
Line 3
Line 4
Line 5
```



#### 2.6.2 插入空白行

如要在存在的两行中插入一个空白行，我们需要`o`命令和`O`命令。不同的是，小写`o`命令是在当前行的下方插入空白行，大写`O`命令是在当前行的上方插入空白行。

在自己的文本中测试这两个命令。

测试结束后，按下<kbd>Esc</kbd>回到命令模式，使用`u`命令撤销刚才的修改。

#### 2.6.3 删除文本

| 命令 | 删除的文本                         |
| ---- | ---------------------------------- |
| x    | 当前字符                           |
| 3x   | 当前字符及其后的两个字符           |
| dd   | 当前行                             |
| 5dd  | 当前行及其后的四行                 |
| dW   | 从光标位置到下一个单词的开头       |
| d$   | 从光标位置到当前行的结尾           |
| d0   | 从光标位置到当前行的行首           |
| d^   | 从光标位置到文本行的第一个非空字符 |
| dG   | 从当前行到文件的末尾               |
| d20G | 从当前行到文件的第20行             |

在`x`和`d`命令前加数字，在`d`命令后加移动命令，都可以控制删除的范围。

#### 2.6.4 剪切、复制、粘贴

`d`命令确切地说是剪切命令，它会将删除的部分复制到一个粘贴缓冲区中，然后执行`p`命令可以把剪切板中的文本粘贴到光标所在行之后，`P`命令则是粘贴到光标所在行之前。

`y`命令用来复制文本，使用方式和`d`命令差不多：

| 命令 | 复制的内容                             |
| ---- | -------------------------------------- |
| yy   | 当前行                                 |
| 5yy  | 当前行及随后的四行                     |
| yW   | 从当前光标位置到下一个单词的开头       |
| y$   | 从当前光标位置到当前行末尾             |
| y0   | 从当前光标位置到行首                   |
| y^   | 从当前光标位置到文本行的第一个非空字符 |
| yG   | 从当前行到文件末尾                     |
| y20G | 从当前行到文件的第20行                 |

#### 2.6.5 连接行

vim中对行的概念非常严格，通常，不能通过移动光标到行尾删除回车符来连接当前行与它的下一行。为此，vim提供了一个特定命令来连接行：`J`。

### 2.7 查找和替换

vim可以把光标移到搜索到的匹配项上，也可以在有或没有用户的情况下实现文本替换。

#### 2.7.1 查找一行

`f`命令查找一行，移动光标到下一个所指定的字符上。

在一行中执行了某个字符的查找后，再按下`;`可以重复这个查找。（偷懒实在是刻在程序员骨子里的天赋

#### 2.7.2 查找全文

`/`命令查找光标之后的全文，移动光标到下一个出现的单词或短语上。

输入`/`后，会在屏幕底部出现它，然后输入要查找的单词或短语，按下回车，光标就会移动到该单词或短语的第一个字符上。通过`n`命令可以重复这个查找。

除了使用单词或短语精确查找某一个字符串，vim还支持正则表达式进行模糊查找。后面我们会专门学习正则。

#### 2.7.3 全局查找和替换

vim使用ex命令来执行查找和替换操作。如果我们想将全文的“Line”都以“line”替换，那应该输入这个命令：

```shell
:%s/Line/line/g
```

这个命令各部分的意义是：

| 字段       | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| :          | 冒号字符表示开始运行一个ex命令                               |
| %          | 指定要操作的行数。%表示从第一行到最后一行。另外，操作范围还可以用`1,5`或`1,$`来表示，意思是从第一行到第五行或从第一行到最后一行。如果省略文本行的操作范围，那么操作只对当前行有效 |
| s          | 指定操作。s表示替代                                          |
| /Line/line | 查找类型和替代文本                                           |
| g          | 全局。意味着对文本行中所有匹配的字符串执行查找和替换操作。如果省略g，则只替换每个文本行中第一个匹配的字符串 |



除此之外，我们可以在上面命令的末尾添加一个`c`字符，将替换命令指定为需要用户确认：

```shell
:%s/line/Line/gc
```

这个命令会把我们的文件恢复到先前，但是在每个替换命令执行前，vim都会要求我们确认这个替换：

```shell
replace with Line (y/n/a/q/l/^E/^Y)?
```

这几个字符代表我们的选择按键：

| 按键                         | 行为                                     |
| ---------------------------- | ---------------------------------------- |
| y                            | 执行替换操作                             |
| n                            | 跳过这个匹配的实例                       |
| a                            | 对这个及随后的所有匹配字符串执行替换操作 |
| q or <kbd>Esc</kbd>          | 退出替换操作                             |
| l                            | 执行这次替换并退出                       |
| <kbd>ctrl</kbd>+<kbd>E</kbd> | 向下滚动                                 |
| <kbd>ctrl</kbd>+<kbd>Y</kbd> | 向上滚动                                 |

### 2.8 编辑多个文件

我们常常需要同时编辑多个文件，比如从一个文件复制内容再粘贴到另一个文件，再比如同时对多个文件进行更改等。通过vim，我们可以同时打开多个文件进行编辑：

```shell
[lsjarch@LsjsArch start_vim]$ vi editParallel1.txt editParallel2.txt editParallel3.txt

```

创建文件后，使用`:n`命令可以从当前文件切换到下一个文件，而`:N`则从当前文件切换到上一个文件。

如果我们从一个文件切换到另一个文件时，对当前文件没有保存，那么vim会阻止我们切换文件。在命令后添加`!`可以强制vim放弃修改并切换文件。（所有带`!`的操作都要谨慎使用）

```shell
[lsjarch@LsjsArch start_vim]$ vi editParallel1.txt editParallel2.txt editParallel3.txt
还有 3 个文件等待编辑
[lsjarch@LsjsArch start_vim]$ cat editParallel1.txt 
first
[lsjarch@LsjsArch start_vim]$ cat editParallel2.txt 
second
[lsjarch@LsjsArch start_vim]$ cat editParallel3.txt 
third

```



如此之外，如果我们在编辑时想要查看其他正在编辑的列表，可以使用`:buffers` 命令，之后屏幕底部会显示出一个文件列表：

```shell
:buffers
  1 #    "editParallel1.txt"            第 1 行
  2 %a   "editParallel2.txt"            第 1 行
  3      "editParallel3.txt"            第 0 行

```

如果我们想要在加载的文件之间切换，使用`:buffer n`命令，其中n是文件标号。

#### 2.8.1 载入多个文件

我们也可以在现有编辑会话中载入新的文件，使用`:e filename`可以载入另一个文件。

```shell
:e editNew.txt
```

在新打开的文件中随便编辑点什么，保存后使用`:buffers`命令查看以下：

```shell
:buffers
  1 #    "editParallel1.txt"            第 1 行
  2      "editParallel2.txt"            第 1 行
  3      "editParallel3.txt"            第 1 行
  4 %a   "editNew.txt"                  第 1 行

```

这表示，当前屏幕处于第四个文件`editNew.txt`，而`editParallel1.txt`处于可编辑状态。

需要注意的是，使用`:e filename`载入的文件不会响应`:n`或`:N`命令，想要切换只能使用`:buffer n`命令。

### 2.8.2 文件之间的内容复制

使用之前的复制、粘贴命令即可。先复制前一个文件中的内容，然后使用`:buffer n`命令切换到要粘贴的目标文件，粘贴即可。

### 2.8.3 插入整个文件

用户可以将一个文件完全插入正在编辑的文件中。

使用`:r filename`命令，可以将指定的文件内容插入到光标位置之前。

### 2.9 保存

除了使用`:w`命令，还可以在命令模式下输入`ZZ`来保存当前文档并退出。

使用`:wq`表示`:w`后再执行`:q`，即保存文件并退出。

如果`:w anotherFilename`，指定一个随意的文件名，表示将当前文件**另存为**指定文件名的新文件，这时当前编辑的还是原文件而不是另存的新文件，两个文件是同时存在的。

## 3. 定制提示符

### 3.1 分解提示符

系统默认提示符是这样的：

```shell
[lsjarch@LsjsArch ~]$ 

```

格式是`用户名@主机名 当前工作目录`。那么，提示符为什么是这样的？因为提示符是由PS1（prompt string 1的缩写，即提示符字符串1）这个环境变量定义的，使用`echo`可以看到它的值：

```shell
[lsjarch@LsjsArch ~]$ echo $PS1
[\u@\h \W]\$

```

这其实是一个正则表达式，其中`\`加一个字母表示一个转义字符，而shell中的转义字符有：

| 转义字符 | 含义                                                         |
| -------- | ------------------------------------------------------------ |
| \a       | ASCII警告声。遇到该转义字符时，计算机会发出一阵吡吡声        |
| \d       | 以星期、月、日的格式表示当前日期，如”Sun Jan 30“             |
| \h       | 本地机器的主机名，但是不带域名                               |
| \H       | 完整的主机名                                                 |
| \j       | 当前shell会话中进行的任务个数                                |
| `\l`     | 当前终端设备的名称                                           |
| \n       | 换行符                                                       |
| \r       | 回车符                                                       |
| \s       | shell程序的名称                                              |
| \t       | 当前时间，24小时制，格式为时：分：秒                         |
| \T       | 当前时间，12小时制                                           |
| \@       | 当前时间，12小时制，格式为AM/PM                              |
| \A       | 当前时间，24小时制，格式为时：分                             |
| \u       | 当前用户的用户名                                             |
| \v       | shell的版本号                                                |
| \V       | shell的版本号和发行号                                        |
| \w       | 当前工作目录名                                               |
| \W       | 当前工作目录名称的最后一部分                                 |
| \\!      | 当前命令的历史编号                                           |
| \\#      | 当前shell会话中输入的命令数                                  |
| \\$      | 在非管理员权限下输出“$”。在管理员权限下输出“#”               |
| \\[      | 标志一个或多个非打印字符序列的开始，用于嵌入非打印的控制字符，使其以一定方式操纵终端仿真器，比如移动光标或更改文本颜色 |
| \\]      | 标志着非显示字符序列的结束                                   |

### 3.2 设计提示符

我们首先备份当前的字符串：

```shell
[lsjarch@LsjsArch ~]$ ps1_old="$PS1"
# 可以看到，新创建的变量ps1_old确实被修改了
[lsjarch@LsjsArch ~]$ echo $ps1_old 
[\u@\h \W]\$

# 在终端会话中，我们可以随时用备份操作的逆过程来复原最初的提示符
[lsjarch@LsjsArch ~]$ PS1="$ps1_old" 

```

接下来，我们就可以开始自定制提示符。首先试试如果提示符为空会发生什么？

```shell
[lsjarch@LsjsArch ~]$ PS1=
echo $PS1

```

显然，根本没有提示符供shell来展示。那么我们来让提示符显示权限：

```shell
PS1="\$"
$echo $PS1
$

```

接下来，创建一个信息丰富的提示符：

```shell
$ PS1="\A \h \$"
22:47 LsjsArch $

```

如果我们需要记录某些任务的执行时间，在提示符中添加时间信息常常有用。最后，我们定制一个符合自己需求的提示符：

```shell
PS1="[\u@\h wk_run:\j cmd_num:\# \W]\$ "
[lsjarch@LsjsArch wk_run:0 cmd_num:17 ~]$ 

```

我现在的提示符分别显示了用户名、主机名、当前shell中进行的任务数、当前shell会话中输入的命令数、当前工作目录、权限符。

### 3.3 添加颜色

大多数终端都会响应某些非打印字符序列，来控制光标位置、字符属性（颜色、粗体、闪烁等）等内容。这里先来看颜色。

字符颜色是由发送到终端仿真器的一个ANSI转义代码来控制的，该转义代码嵌入到了要显示的字符流中。控制代码不会被“打印到”屏幕上，而是被终端仿真器解释为一条指令。

由3.2中转义字符表可知，使用“[”和“]”来封装非打印字符串。那么设置文本颜色的转义序列以八进制`\033`开始，后面是可选的字符属性，之后是一条指令。例如，将文本颜色设置为正常(attribute=0，如果设置成粗体，则修改为1。这个属性使得色彩分为深色和浅色)、黑色的代码是`\033[0;30m`。

| 字符序列     | 文本颜色 |
| ------------ | -------- |
| `\033[0;30m` | 黑色     |
| `\033[0;31m` | 红色     |
| `\033[0;32m` | 绿色     |
| `\033[0;33m` | 棕色     |
| `\033[0;34m` | 蓝色     |
| `\033[0;35m` | 紫色     |
| `\033[0;36m` | 青色     |
| `\033[0;37m` | 淡灰色   |
| `\033[1;30m` | 深灰色   |
| `\033[1;31m` | 淡红色   |
| `\033[1;32m` | 淡绿色   |
| `\033[1;33m` | 黄色     |
| `\033[1;34m` | 淡蓝色   |
| `\033[1;35m` | 淡紫色   |
| `\033[1;36m` | 淡青色   |
| `\033[1;37m` | 白色     |

让我们来修改一下提示符：

```shell
[lsjarch@LsjsArch wk_run:0 cmd_num:22 ~]$ PS1="[\[\033[0;32m\]\u@\h \W]\$ "
[lsjarch@LsjsArch ~]$ 
```

但是这样有个问题，接下来用户输入的所有文字页编程红色了，要修复这个问题，可以在提示符末尾再添加另一条颜色转义码来将终端仿真器的后续字符恢复到原来颜色：

```shell
[lsjarch@LsjsArch ~]$ PS1="[\[\033[0;32m\]\u@\h\[\033[0;37m\] wk_run:\j cmd_num:\# \W]\$ "
[lsjarch@LsjsArch wk_run:0 cmd_num:2 ~]$ 
```

另外，文本除了正常（0）、粗体（1）属性外，还支持下划线（4）、闪烁（5）、斜体（7），不过闪烁属性在很多终端仿真器不支持（据说是品味问题

除了文本颜色，还可以改变文本的背景颜色：

| 字符序列     | 背景颜色 |
| ------------ | -------- |
| `\033[0;40m` | 黑色     |
| `\033[0;41m` | 红色     |
| `\033[0;42m` | 绿色     |
| `\033[0;43m` | 棕色     |
| `\033[0;44m` | 蓝色     |
| `\033[0;45m` | 紫色     |
| `\033[0;46m` | 青色     |
| `\033[0;47m` | 淡灰色   |

不过设置背景颜色不支持粗体属性。

### 3.4 移动光标

转义代码也可以用来定位光标。比如在提示符出现的时候，这些转义代码用来在屏幕的不同位置（如屏幕右上角）显示一个时钟或其他信息：

| 转义码      | 动作                         |
| ----------- | ---------------------------- |
| `\033[l;cH` | 将光标移动至l行c列           |
| `\033[nA`   | 将光标向上移动n行            |
| `\033[nB`   | 将光标向下移动n行            |
| `\033[nC`   | 将光标向前移动n个字符        |
| `\033[nD`   | 将光标向后移动n个字符        |
| `\033[2J`   | 清空屏幕并将光标移动到左上角 |
| `\033[K`    | 清空当前光标位置到行末的内容 |
| `\033[s`    | 存储当前光标位置             |
| `\033[u`    | 恢复之前存储的光标位置       |

使用这些代码，可以构建这样一条提示符：

```shell
PS1="\[\033[s\033[0;0H\033[0;41m\033[K\033[1;33m\t\033[0m\033[u\]<\u@\h \W>\$ "
```

它表示每当提示符出现时，屏幕的上方会出现一个红色的横条，其中有黄色文本显示当前时间。

它各字段的作用是：

| 字符序列        | 动作                                                         |
| --------------- | ------------------------------------------------------------ |
| `\[`            | 开始一个非打印字符序列。其真正目的是为了让bash正确计算可见提示符的长度，如果没有该字符，命令行编辑功能无法正确定位光标 |
| `\033[s`        | 存储光标位置。在屏幕的顶部横条绘制完成并显示时间后，读取并使光标返回此位置 |
| `\033[0;0H`     | 将光标移动到左上角                                           |
| `\033[0;41m`    | 将背景颜色设置为红色                                         |
| `\033[K`        | 将光标当前位置（左上角）到行末的内容清空。因为现在背景已经是红色了，清空后就会显示红色横条。清空行的内容不会改变光标位置 |
| `\033[1;33m`    | 将文本颜色设置为黄色                                         |
| `\t`            | 显示当前时间。尽管这是一个可打印元素，但还是应当将其包含在提示符非打印部分，因为bash在计算可见提示符长度时，不应当将其计算在内 |
| `\033[0m`       | 关闭颜色，对文本和背景均有效                                 |
| `\033[u`        | 恢复之前存储的光标位置                                       |
| `\]`            | 结束非打印的字符串                                           |
| `<\u@\h \W>\$ ` | 提示符字符串                                                 |



### 3.5 保存提示符

只是在终端仿真器中修改PS1是不会保存的，下一个shell会话就会恢复原状。如果我们要保存提示符的修改，应该将其添加到~/.bashrc中：

```shell
PS1="\[\033[s\033[0;0H\033[0;41m\033[K\033[1;33m\t\033[0m\033[u\]<\u@\h \W>\$ "
export PS1
```



