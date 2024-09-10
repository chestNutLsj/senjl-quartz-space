`Shell`环境基于Arch Linux 5.15.12；GNU bash，版本 5.1.12(1)-release (x86_64-pc-linux-gnu)

学习资料基于[快乐的Linux命令行](https://billie66.github.io/TLCL/)，本书是[The Linux Command Line](http://linuxcommand.org/)的中文版。虽然大体的翻译比较贴切，但仍不免有些部分翻译比较生硬或缺乏逻辑，笔者在写博客时对这些进行了一定的改善，如果在阅读时仍感觉到逻辑缺失，可以去查看[英文原版](https://billie66.github.io/TLCL/book/)。

本篇是学习 shell 的第一部分——了解什么是shell以及shell的一些基本命令。



## 一、什么是shell？

shell本身即是一个程序，接受从键盘输入的命令然后交由系统执行。几乎所有Linux发行版都提供一个名为 bash 的来自GNU项目的shell程序，bash是“Bourne Again SHell”的缩写，即bash是最初Unix上由Steve Bourne写成的shell程序的加强版。

### 1.1	终端仿真器

即`terminal`，在不同的系统或桌面上可能有不同的称呼，笔者使用的KDE桌面环境中默认是Konsole。

### 1.2	启动

默认快捷键是<kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>T</kbd>，在黑色窗口内可以看到：

```shell
[lsjarch@LsjsArch ~]$ 
```

 这被称为`shell提示符`，通常包括`用户名@主机名`，之后是当前工作目录。

如果提示符最后一个字符是#，代表着当前终端会话拥有管理员权限，而$则代表普通用户权限。

### 1.3	方向键的作用

使用向上箭头（向下箭头）可以看到上一条（下一条）执行过的命令重新出现，而Linux大多默认保存输入过的500个命令。

左右箭头则可以移动光标位置。

### 1.4	鼠标作用

快速粘贴：按下鼠标左键，高亮文本会被拷贝到一个缓冲区，按下鼠标中键，这些文本就会被粘贴到光标位置。

注意：不要使用<kbd>ctrl</kbd>+<kbd>c</kbd>或者<kbd>ctrl</kbd>+<kbd>v</kbd>进行shell内复制与粘贴，事实上，在Microsoft Windows为这两个组合键赋予复制粘贴含义之前，shell就已经用这两个控制代码工作了。

在GUI桌面环境中修改窗口管理程序的鼠标聚焦策略为“聚焦跟随着鼠标”，可以实现鼠标移动到一个窗口的上方即能接受输入，而直到单击窗口之前它都不会成为前端窗口，这样可以使拷贝和粘贴更方便。

### 1.5	尝试一些简单命令

`date`：获取当前日期；

```shell
[lsjarch@LsjsArch ~]$ date
2022年 01月 02日 星期日 01:32:27 CST
```

`cal`：显示当前月份的日历；

```shell
[lsjarch@LsjsArch ~]$ cal
      一月 2022     
一 二 三 四 五 六 日
                1  2
 3  4  5  6  7  8  9
10 11 12 13 14 15 16
17 18 19 20 21 22 23
24 25 26 27 28 29 30
31                  
```

`df`：查看磁盘剩余空间的数量；

```shell
[lsjarch@LsjsArch ~]$ df
文件系统           1K-块     已用      可用 已用% 挂载点
dev              8106044        0   8106044    0% /dev
run              8116556     1744   8114812    1% /run
/dev/nvme0n1p2 102626232 14684352  82682616   16% /
tmpfs            8116556     7512   8109044    1% /dev/shm
tmpfs            8116560     7064   8109496    1% /tmp
/dev/nvme0n1p3 153707984 12242016 133585264    9% /home
/dev/nvme0n1p1    817584      300    817284    1% /efi
tmpfs            1623308       60   1623248    1% /run/user/1000
/dev/nvme0n1p4 237142012 47968640 189173372   21% /run/media/lsjarch/Reserve
```

`free`：显示空闲内存的数量；

```shell
[lsjarch@LsjsArch ~]$ free
               total        used        free      shared  buff/cache   available
内存：   16233116     1982848    10264700      706376     3985568    13202404
交换：    4194300           0     4194300
```

`exit`：结束当前终端会话；

```shell
[lsjarch@LsjsArch ~]$ exit
```

### 1.6	虚拟终端

即使`terminal`没有在运行，后台仍会有虚拟终端会话运行，可以通过<kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>F2</kbd>~<kbd>F6</kbd>访问。

当一个会话被访问时，显示登录提示框，需要输入用户名和密码，要切换一个虚拟控制台到另一个，按下<kbd>alt</kbd>+<kbd>F2</kbd>~<kbd>F6</kbd>中的一个，要返回图形界面，则<kbd>alt</kbd>+<kbd>F1</kbd>。

### 1.7	拓展阅读

* 更多关于bash之父Steve Bourne的故事：<https://en.wikipedia.org/wiki/Steve_Bourne>
* 一篇介绍计算机领域shell概念的文章：<https://en.wikipedia.org/wiki/Shell_(computing)>

*****







## 二、文件系统中跳转

本章命令：`pwd`, `ls`, `cd`。

### 2.1	理解文件系统树

Linux以分层目录结构来组织所有文件，即树型目录。这个目录树可以包含其他文件或目录。文件系统中第一级目录称为根目录，根目录包含文件和子目录，而子目录包含文件和更多子目录。

与Windows为每个存储设备建立一个独自的文件系统不同，Linux（及其他类Unix系统）总是只有一个单一的文件系统树，而不论有多少存储设备连接到计算机上。即存储设备自由地挂载到目录树的各个节点上。

### 2.2	当前工作目录

`pwd`：print working directory的缩写，显示当前工作目录；

```shell
[lsjarch@LsjsArch ~]$ pwd
/home/lsjarch
```

首次启动`terminal`时，当前工作目录是家目录，而普通用户只对家目录拥有权限进行文件写入。

### 2.3	列出目录内容

`ls`：列出一个目录包含的文件及子目录；

```shell
[lsjarch@LsjsArch ~]$ ls
Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos  yay-bin-11.0.2-1-x86_64.pkg.tar.zst
```

 事实上，`ls`可以列出任一个目录的内容。

### 2.4	切换当前目录

`cd`：切换当前工作目录到目标目录，目标目录通过两种方式指定：绝对路径，相对路径；

* *绝对路径：*开始于根目录，紧跟着目录树的一个个分支一直到达目标文件或目录。

  ```shell
  [lsjarch@LsjsArch ~]$ cd /usr/bin
  [lsjarch@LsjsArch bin]$ pwd
  /usr/bin
  [lsjarch@LsjsArch bin]$ ls
  # ... Listing of lots of files ...
  ```

  通常，shell提示符会自动显示工作目录名；

* *相对路径：*开始于当前目录，`.` 表示当前目录 ，`..` 表示父目录。

  ```shell
  [lsjarch@LsjsArch ~]$ cd /usr/bin
  [lsjarch@LsjsArch bin]$ pwd
  /usr/bin
  # 当前工作目录为/usr/bin，要切换到父目录/usr
  [lsjarch@LsjsArch bin]$ cd ..
  [lsjarch@LsjsArch usr]$ pwd
  /usr
  
  # 当前工作目录为/usr，要切换到子目录/usr/bin
  [lsjarch@LsjsArch usr]$ cd ./bin
  [lsjarch@LsjsArch bin]$ pwd
  /usr/bin
  ```

  事实上，`./`总是可以被省略，如果不指定文件目录，则当前工作目录作为默认工作目录。

  

**一些快速切换当前工作目录的快捷命令：**

`cd`：更改当前工作目录到家目录；

`cd -`：更改当前工作目录到先前工作目录；

`cd ~user_name`：更改当前工作目录到用户家目录；



### 2.5	Linux文件名的一些规则

1. "`.`"开头的文件是隐藏文件，`ls`命令无法直接列出，而`ls -a`命令可以。创建用户后，家目录下会存在几个配置帐号的隐藏文件，用来定制系统环境。某些应用程序也会将配置文件以隐藏文件的形式存放在家目录下面；

   ```shell
   [lsjarch@LsjsArch ~]$ ls -a
   .              .bash_profile  Desktop     .icons  .mozilla  Postman          .themes   .wget-hsts
   ..             .bashrc        Documents   .java   Music     Public           Videos    .Xauthority
   .bash_history  .cache         Downloads   .kde4   Pictures  .python_history  .viminfo  .xprofile
   .bash_logout   .config        .gtkrc-2.0  .local  .pki      Templates        .vscode   yay-bin-11.0.2-1-x86_64.pkg.tar.zst
   ```

2. 文件名和命令名在Linux中是大小写敏感的，这与Windows不同；

3. Linux没有“文件扩展名”的概念，类Unix的操作系统不以文件扩展名来决定文件的内容或用途，但某些应用程序会；

4. 文件名中以下划线作为连接符，且不要使用空格。

*****







## 三、探索Linux

本章命令：`ls`, `file`, `less`。

### 3.1	`ls`深入

`ls`可以指定要列出内容的目录；

```shell
[lsjarch@LsjsArch ~]$ ls /usr
bin  include  lib  lib32  lib64  local  sbin  share  src

# 列出多个目录的内容，以空格分隔
[lsjarch@LsjsArch ~]$ ls /usr /home
/home:
lost+found  lsjarch

/usr:
bin  include  lib  lib32  lib64  local  sbin  share  src
```

可以改变输出格式以得到更多细节，`ls`命令的`-l`选项，会将结果以长模式输出；

```shell
[lsjarch@LsjsArch ~]$ ls -l
总用量 2948
drwxr-xr-x 2 lsjarch lsjarch    4096  1月  2 02:49 Desktop
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Documents
drwxr-xr-x 2 lsjarch lsjarch    4096  1月  2 01:08 Downloads
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Music
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Pictures
drwxr-xr-x 3 lsjarch lsjarch    4096  1月  2 02:19 Postman
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Public
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Templates
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Videos
-rw-r--r-- 1 lsjarch lsjarch 2981132 12月 28 11:46 yay-bin-11.0.2-1-x86_64.pkg.tar.zst
```

使用`--help`参数获取其他参数的使用说明

```shell
[lsjarch@LsjsArch ~]$ ls --help
用法：ls [选项]... [文件]...
列出给定文件（默认为当前目录）的信息。
如果不指定 -cftuvSUX 中任意一个或--sort 选项，则根据字母大小排序。

必选参数对长短选项同时适用。
# 下面列出最常用的一些命令，其余的随用随看
  -a, --all                  不隐藏任何以 . 开始的项目
  -A, --almost-all           列出除 . 及 .. 以外的任何项目
      --author               与 -l 同时使用时，列出每个文件的作者
  
  -d, --directory            当遇到目录时列出目录本身而非目录内的文件
  -D, --dired                产生适合 Emacs 的 dired 模式使用的结果
  -f                         list all entries in directory order
  -F, --classify[=WHEN]      append indicator (one of */=>@|) to entries; WHEN can be 'always' (default if omitted), 'auto', or 'never'
      --file-type            likewise, except do not append '*'
      --format=WORD          across -x, commas -m, horizontal -x, long -l, single-column -1, verbose -l, vertical -C
      --full-time            like -l --time-style=full-iso
  
  -h, --human-readable       与 -l 和 -s 一起，以易于阅读的格式输出文件大小（例如 1K 234M 2G等）
      --si                   同上面类似，但是使用 1000 为基底而非 1024
      
  -i, --inode                显示每个文件的索引编号（inode 号）
  -I, --ignore=模式          不显示任何匹配指定 shell <模式>的项目

  -l                         使用较长格式列出信息
  -L, --dereference          当显示符号链接的文件信息时，显示符号链接所指示的对象而并非符号链接本身的信息
  -m                         所有项目以逗号分隔，并填满整行行宽
  
  -q, --hide-control-chars   以“?”字符代替无法打印的字符
      --show-control-chars   原样显示无法打印的字符（这是默认行为，除非被调用本程序的名称是“ls”而且是在终端中进行输出）
  
  -r, --reverse              逆序排列
  -R, --recursive            递归显示子目录
  -s, --size                 以块数形式显示每个文件分配的尺寸
  -S                         sort by file size, largest first
      --sort=WORD            sort by WORD instead of name: none (-U), size (-S), time (-t), version (-v), extension (-X), width
      --time=WORD            change the default of using modification times; access time (-u): atime, access, use; change time (-c): ctime, status;
                             birth time: birth, creation; with -l, WORD determines which time to show; with --sort=time, sort by WORD (newest first)
      --time-style=TIME_STYLE  使用 -l 时显示的时间/日期格式；请见下面TIME_STYLE 的相关内容
  -t                         按时间排序，最新的最前；参见 --time
  -T, --tabsize=COLS         指定制表符（Tab）的宽度，而非默认8字符
  -u                         同 -lt 一起使用：按照访问时间排序并显示；同 -l 一起使用：显示访问时间并按文件名排序。其它：按照访问时间排序，最新的最靠前
  -U                         不进行排序；按照目录顺序列出项目
  -v                         在文本中进行数字（版本）的自然排序
  
  -1                         list one file per line
      --help            	显示此帮助信息并退出
      --version         	显示版本信息并退出
```



### 3.2	选项和参数

命令名经常会有一个更正命令行为的选项，会带有一个或多个参数作为命令作用的对象；

```
command ~options arguments
```

选项有长选项短选项之分，很多命令支持多个短选项串在一起使用：

```shell
[lsjarch@LsjsArch ~]$ ls -lt --reverse
总用量 2948
-rw-r--r-- 1 lsjarch lsjarch 2981132 12月 28 11:46 yay-bin-11.0.2-1-x86_64.pkg.tar.zst
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Videos
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Templates
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Public
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Pictures
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Music
drwxr-xr-x 2 lsjarch lsjarch    4096 12月 28 18:41 Documents
drwxr-xr-x 2 lsjarch lsjarch    4096  1月  2 01:08 Downloads
drwxr-xr-x 3 lsjarch lsjarch    4096  1月  2 02:19 Postman
drwxr-xr-x 2 lsjarch lsjarch    4096  1月  2 03:23 Desktop
```



### 3.3	深究长格式输出

参照3.2中的输出，分析各字段含义：

* `-rw-r--r--`：文件的访问权限。
  * 第一个字符指明文件类型，“`-`”表示普通文件，“`d`”表示目录；
  * 之后三个字符表示文件所有者的访问权限，如`rw-`、`rwx`；
  * 再之后三个字符表示文件所属组中成员的访问权限，如`r--`、`r-x`；
  * 最后三个字符表示其他所有人的访问权限，如`r--`、`r-x`；

* `1`：文件的硬链接数目；
* `lsjarch`：文件属主的用户名；
* `lsjarch`：文件所属用户组的名字；
* `2981132`：以字节数表示的文件大小；
* `12月28 11:46`：上次修改文件的时间和日期；
* `yay...`：文件名

### 3.4	确定文件类型

`file`：打印出文件内容的简单描述；

```shell
[lsjarch@LsjsArch ~]$ ls
Desktop  Documents  Downloads  Music  Pictures  Postman  Public  Templates  Videos  yay-bin-11.0.2-1-x86_64.pkg.tar.zst
[lsjarch@LsjsArch ~]$ file yay-bin-11.0.2-1-x86_64.pkg.tar.zst 
yay-bin-11.0.2-1-x86_64.pkg.tar.zst: Zstandard compressed data (v0.8+), Dictionary ID: None
[lsjarch@LsjsArch ~]$ file Downloads/
Downloads/: directory
```

虽然Linux不要求扩展名来表示文件类型，但我们期望一些合理的命名方式来体现其文件类型。在Linux（及其他类Unix系统）中，一切皆文件。

### 3.5	浏览文件内容

**什么是“文本”？**

* 在信息与数字之间建立联系，则可以用数字来表示信息。如ASCII码；
* 文本是简单的字符与数字之间的一对一映射，非常紧凑，对某数量的字符文本常常会翻译成不少于该数量的数字数据（因为在某些复杂的编码中，会有很多非文本元素来描述文本的结构和格式，即控制字）
* 许多系统的配置文件是以文本格式存储的，阅读他们可以深入了解系统的工作方式。许多脚本文件也是如此。

`less`：用来浏览文本文件；

```shell
# 查看定义了系统中全部用户身份的文件
[lsjarch@LsjsArch ~]$ ls /etc/passwd
/etc/passwd
[lsjarch@LsjsArch ~]$ less /etc/passwd
```

*`less`程序中常用的键盘命令：*

* `Page UP` or `b`：					向上翻滚一页
* `Page Down` or `space`：      	向下翻滚一页
* `UP Arrow`：                           向上翻滚一行
* `Down Arrow`：                        向下翻滚一行
* `G`：                                      移动到最后一行
* `1G` or `g`：                           移动到开头一行
* `/characters`：                      向前查找指定字符串
* `n`：                                      向前查找下一个出现的字符串，这个字符串是之前所指定查找的
* `q`：                                      退出
* `h`：                                      显示帮助屏幕

*`less`历史：*less是早期Unix程序more的改进版，“less is more”开了个玩笑

*`less`属于`页面调度器`程序类*，这些程序允许通过页方式，在一页中轻松地浏览长文本文档。`more`程序只能向前分页浏览，`less`则允许前后分页浏览等新特性；

### 3.6	开始探索Linux吧！

通过上面学习到的四个命令`cd`、`ls -l`、`file`、`less`，即可开始在Linux文件系统中游览。

不要害怕沾花惹草，普通用户没有权限搞乱系统，那是管理员的工作。在Linux系统中，没有秘密。

|      目录      | 内容                                                         |
| :------------: | ------------------------------------------------------------ |
|       /        | 根目录，万物起源                                             |
|      /bin      | 包含系统启动和运行所必需的二进制程序                         |
|     /boot      | 包含Linux内核，最初的RMA磁盘映像(系统启动时由驱动程序所需)，和启动加载程序。 |
|      /dev      | 包含设备结点的特殊目录。“一切皆文件”的观点也适用于设备，这个目录中内核维护着它支持的设备 |
|      /etc      | 包含所有系统层面的配置文件，也包含一系列shell脚本，用于系统启动时运行每个系统服务。这个目录中应该全是可读文本文件 |
|     /home      | 通常，系统会为每个用户在/home目录下分配一个目录。普通用户只能在自己的目录下写入文件，避免了错误的用户活动破坏系统 |
|      /lib      | 包含核心系统程序所需的库文件                                 |
| /lost + found  | 每个使用Linux文件系统的格式化分区或设备，都会有这个目录。当部分恢复一个损坏的文件系统时，会用到这个目录，除非文件系统完全损坏，这个目录会是个空目录。 |
|     /media     | 现代Linux中，/media包含可移除媒体设备(USB驱动器、CD-ROMs等)的挂载点，这些设备连接到计算机后，会自动地挂载到这个目录结点下 |
|      /mnt      | 早期Linux中，/mnt包含可移除设备的的挂载点                    |
|      /opt      | 用来安装“可选的”软件，存储可能安装在系统中的商业软件产品     |
|     /proc      | 从存储在硬盘上的文件的意义上说，它不是真正的文件系统，而是一个由Linux内核维护的虚拟文件系统，包含内核的窥视孔文件。这些文件是可读的，它们会表明内核是怎样监管计算机的 |
|     /root      | root账户的家目录                                             |
|     /sbin      | 包含“系统”二进制文件，是完成重大系统任务的程序，通常为超级用户保留 |
|      /tmp      | 用来存储由各种程序创建的临时文件。一些配置会让系统每次重启时都清空这个目录 |
|      /usr      | 包含普通用户所需要的所有程序和文件，可能是最大的一个目录     |
|    /usr/bin    | 包含系统安装的可执行程序                                     |
|    /usr/lib    | 包含/usr/bin目录中的程序所用的共享库                         |
|   /usr/local   | 是非系统发行版自带而打算让系统使用的程序的安装目录。通常，由源码编译的程序会安装在/usr/local/bin目录下 |
|   /usr/sbin    | 包含许多系统管理程序                                         |
|   /usr/share   | 包含许多由/usr/bin目录中的程序使用的共享数据。包括默认的配置文件，图标，桌面背景，音频文件等 |
| /usr/share/doc | 存放按照软件包分类的文档                                     |
|      /var      | 除/tmp、/home外，之上的目录是静态的。而/var目录存储可能需要改动的文件，各种数据库、假脱机文件、用户邮件等都在这里 |
|    /var/log    | 包含日志文件，各种系统活动的记录。这些文件十分重要，并应时时监测，最重要的是/var/log/messages。查看日志文件可能需要超级用户权限 |

*一些常用文件：*

* `/boot/grub/grub.conf` or `menu.lst`：  用来配置启动加载程序
* `/boot/vmlinuz`：                                 Linux内核
* `/etc/crontav`：                                  定义自动运行的任务
* `/etc/fstab`：                                     包含存储设备的列表，以及与他们相关的挂载点
* `/etc/passwd`：                                    包含用户帐号列表

### 3.7	符号链接

 符号链接，又称软链接或`symlink`，表示一个文件被多个文件名指向，而这个特殊文件在`ls -l`命令中的标识不是“`-`”或“`d`”，而是“`l`”。

*存在意义：*如果一个文件会经常更新以导致有不同的版本号，而有许多程序需要使用这个文件，那么在更改版本后需要跟踪每个使用该文件资源的程序进行修改，这非常低效。而如果指定创建一个公用符号链接，程序使用这个符号链接，而在每次更新版本后都只需修改符号链接的指向即可。

### 3.8	拓展阅读

* 完整的Linux文件系统层次体系标准：<https://www.pathname.com/fhs>

*****







## 四、操作文件和目录

本章命令：`cp`, `mv`, `mkdir`, `rm`, `ln`。

### 4.1	通配符

通配符用来快速指定一组文件名。使用通配符允许依据字符类型来选择文件名；

| 通配符        | 意义                               |
| ------------- | ---------------------------------- |
| *             | 匹配任意多个字符（包括0个或1个）   |
| ?             | 匹配任意一个字符（不包括0个）      |
| [characters]  | 匹配任意一个属于字符集中的字符     |
| [!characters] | 匹配任意一个不是字符集中的字符     |
| [[:class:]]   | 匹配任意一个属于指定字符类中的字符 |

| 常用字符类 | 意义                   |
| ---------- | ---------------------- |
| [:alnum:]  | 匹配任意一个字母或数字 |
| [:alpha:]  | 匹配任意一个字母       |
| [:digit:]  | 匹配任意一个数字       |
| [:lower:]  | 匹配任意一个小写字母   |
| [:upper:]  | 匹配任意一个大写字母   |

| 类型匹配的模式          | 匹配对象                                    |
| ----------------------- | ------------------------------------------- |
| *                       | 所有文件                                    |
| g*                      | 文件名以g开头的所有文件                     |
| b*.txt                  | 以b开头而以.txt结尾的任意多字符的文件       |
| Data???                 | 以Data开头紧接三个字符的文件                |
| [abc]*                  | 以a或b或c开头的文件                         |
| BACKUP.[0-9]\[0-9][0-9] | 以BACKUP.开头并紧接3个数字的文件            |
| [[:upper:]]*            | 以大写字母开头的文件                        |
| [![:digit:]]*           | 不以数字开头的文件                          |
| *[[:lower:]123]         | 文件名以小写字母结尾，或以1或2或3结尾的文件 |

事实上，接受参数为文件名的所有命令，都可以使用通配符。

在现代Linux中，尽量避免使用[A-Z]或[a-z]的方式表示字符范围，因为不会产生所期望的结果，要用字符类代替。

通配符在GUI界面也是有效的，以KDE桌面为例，在`Dolphin`和`Konqueror`的地址栏中直接输入通配符，文件管理器会显示匹配的结果。

### 4.2	创建目录

`mkdir`：用来创建目录；

```shell
[lsjarch@LsjsArch ~]$ cd Documents/
[lsjarch@LsjsArch Documents]$ mkdir test_cmd
[lsjarch@LsjsArch Documents]$ ls
helloworld.txt  test_cmd
[lsjarch@LsjsArch Documents]$ cd test_cmd/
[lsjarch@LsjsArch test_cmd]$ mkdir mkdir1 mkdir2 mkdir3
[lsjarch@LsjsArch test_cmd]$ ls
mkdir1  mkdir2  mkdir3

```

可见，mkdir可以跟多个参数以创建多个目录，只需空格分隔。

### 4.3	复制文件和目录

`cp`：复制文件和目录；

一些可用的选项：

```shell
[lsjarch@LsjsArch test_cmd]$ cp --help
用法：cp [选项]... [-T] 源文件 目标文件
　或：cp [选项]... 源文件... 目录
　或：cp [选项]... -t 目录 源文件...
将指定<源文件>复制至<目标文件>，或将多个<源文件>复制至<目标目录>。

必选参数对长短选项同时适用。
  -a, --archive                 等于-dR --preserve=all，复制文件和目录，以及她们的属性，包括所有权和权限。通常复本具有用户所操作文件的默认属性
      --attributes-only 仅复制属性而不复制数据      --backup[=CONTROL           为每个已存在的目标文件创建备份
  -b                            类似--backup 但不接受参数
      --copy-contents           在递归处理是复制特殊文件内容
  -d                            等于--no-dereference --preserve=links
  -f, --force                   如果有已存在的目标文件且无法打开，则将其删除并重试（该选项在与 -n 选项同时使用时将被忽略）
  -i, --interactive             覆盖前询问（使前面的 -n 选项失效）。在重写已存在文件之前，提示用户确认，如不指定则会默认重写文件
  -H                            跟随源文件中的命令行符号链接
  -l, --link                    硬链接文件以代替复制
  -L, --dereference             总是跟随源文件中的符号链接
  -n, --no-clobber              不要覆盖已存在的文件(使前面的 -i 选项失效)
  -P, --no-dereference          不跟随源文件中的符号链接
  -p                            等于--preserve=模式,所有权,时间戳
      --preserve[=属性列表      保持指定的属性(默认：模式,所有权,时间戳)，如果可能保持附加属性：上下文、链接、xattr 等
      --sno-preserve=属性列表   不保留指定的文件属性
      --parents                 复制前在目标目录创建来源文件路径中的所有目录
  -R, -r, --recursive           递归复制目录及其子目录内的所有内容。复制目录时，需要使用这个选项
      --reflink[=WHEN]          控制克隆/CoW 副本。请查看下面的内如。
      --remove-destination      尝试打开目标文件前先删除已存在的目的地文件 (相对于 --force 选项)
      --sparse=WHEN             控制创建稀疏文件的方式
      --strip-trailing-slashes  删除参数中所有源文件/目录末端的斜杠
  -s, --symbolic-link           只创建符号链接而不复制文件
  -S, --suffix=后缀             自行指定备份文件的后缀
  -t,  --target-directory=目录  将所有参数指定的源文件/目录复制至目标目录
  -T, --no-target-directory     将目标目录视作普通文件
  -u, --update                  只在源文件比目标文件新，或目标文件不存在时才进行复制
  -v, --verbose                 显示详细的进行步骤
  -x, --one-file-system 	   不跨越文件系统进行操作
  -Z                            设置目标文件的 SELinux 安全上下文为默认类型
      --context[=上下文]        类似 -Z；如果指定了上下文，则将 SELinux 或SMACK 安全上下文设置为指定值
      --help                    显示此帮助信息并退出
      --version                 显示版本信息并退出

```

一些`cp`实例：

| 命令                | 运行结果                                                     |
| ------------------- | ------------------------------------------------------------ |
| cp file1 file2      | 复制文件file1内容到file2文件。如果file2已存在则会被file1的内容重写，如不存在则会创建file2 |
| cp -i file1 file2   | 作用与上一条一样，只有在file2存在进行重写时，会提示用户确认信息 |
| cp file1 file2 dir1 | 复制文件file1和file2到目录dir1。dir1必须存在                 |
| cp dir1/* dir2      | 使用一个通配符，将目录dir1中所有文件都复制到目录dir2中，dir2必须存在 |
| cp -r dir1 dir2     | 递归复制dir1中的所有内容到dir2中。如果目录dir2不存在，则会创建，如果存在则直接复制 |



### 4.4	移动和重命名文件

`mv`：可以实现文件移动和重命名，但不论如何完成操作后原文件名都不再存在；

一些可用的选项：

```shell
[lsjarch@LsjsArch test_cmd]$ mv --help
用法：mv [选项]... [-T] 源文件 目标文件
　或：mv [选项]... 源文件... 目录
　或：mv [选项]... -t 目录 源文件...
将<源文件>重命名为<目标文件>，或将<源文件>移动至指定<目录>。

必选参数对长短选项同时适用。
      --backup[=CONTROL]       为每个已存在的目标文件创建备份
  -b                           类似--backup 但不接受参数
  -f, --force                  覆盖前不询问
  -i, --interactive            覆盖前询问
  -n, --no-clobber             不覆盖已存在文件。如果您指定了-i、-f、-n 中的多个，仅最后一个生效。
      --strip-trailing-slashes  去掉每个源文件参数尾部的斜线
  -S, --suffix=SUFFIX          替换常用的备份文件后缀
  -t, --target-directory=目录  将所有<源文件>移动至指定的<目录>中
  -T, --no-target-directory    将参数中所有<目标文件>部分视为普通文件
  -u, --update                 仅在<源文件>比目标文件更新，或者目标文件不存在时进行移动操作
  -v, --verbose                对正在发生的操作给出解释
  -Z, --context                将目标文件的 SELinux 安全上下文设置为默认类型
      --help                   显示此帮助信息并退出
      --version                显示版本信息并退出
```

一些`mv`实例：

|         命令         | 运行结果                                                     |
| :------------------: | :----------------------------------------------------------- |
|    mv file1 file2    | 移动file1到file2。如果file2存在，则其内容被file1的内容重写，如不存在则创建file2 |
|  mv -i file1 file2   | 作用与上一条一样，除了file2存在并且被file1的内容重写前，会向用户提示信息 |
| mv  file1 file2 dir1 | 移动file1和file2到dir1中，前提是dir1必须存在                 |
|     mv dir1 dir2     | 如果dir2不存在，则创建dir2目录并移动dir1中内容到目录dir2中，同时删除dir1；如果dir2已存在，则直接移动dir1内容并删除原dir1 |



### 4.5	删除文件和目录

`rm`：用来移除文件和目录；

一些可用的选项：

```shell
[lsjarch@LsjsArch test_cmd]$ rm --help
用法：rm [选项]... [文件]...
删除（unlink）指定<文件>。

  -f, --force               强制删除。忽略不存在的文件，不提示确认
  -i                        每次删除前提示确认。如不指定，则`rm`会默默地删除文件
  -I                        在删除超过三个文件或者递归删除前提示一次并要求确认；此选项比 -i 提示内容更少，但同样可以阻止大多数错误发生
      --interactive[=场景]  根据指定的<场景>进行确认提示：never（从不）、once（一次，等效于使用 -I）或者 always（总是，等效于使用 -i）。如果使用此参数                             没有指定<场景>则总是提示
      --one-file-system     递归删除一个层级时，跳过所有不符合命令行参数的文件系统上的文件
      --no-preserve-root    不要对“/”特殊处理
      --preserve-root[=all] 不要删除“/”（默认行为）；如添加了“all”参数，将拒绝处理与父目录位于不同设备上的命令行参数
  -r, -R, --recursive       递归删除目录及其内容
  -d, --dir                 删除空目录
  -v, --verbose             详细显示进行的步骤
      --help                显示此帮助信息并退出
      --version             显示版本信息并退出

默认时，rm 不会删除目录。使用--recursive(-r 或-R)选项可删除每个给定的目录，以及其下所有的内容。

要删除文件名第一个字符为“-”的文件（例如“-foo”），请使用以下方法之一：
  rm -- -foo
  rm ./-foo

请注意，如果使用 rm 来删除文件，在有充足的经验和时间的情况下通常仍可能将该文件的内容恢复出来。如果想进一步保证所删除的文件的内容无法还原，请考虑使用 shred(1)。
```

一些`rm`实例：

| 命令              | 运行结果                                                     |
| ----------------- | ------------------------------------------------------------ |
| rm file1          | 默默地删除文件                                               |
| rm -i file1       | 除了在删除文件之前，提示用户确认信息外，和上面的命令作用一样 |
| rm -r file1 dir1  | 删除文件file1，目录dir1，及dir1中的内容                      |
| rm -rf file1 dir1 | 同上，除了当file1或dir1不存在时命令仍会执行                  |

***小心！***

* Linux（及类Unix系统）没有复原命令；
* 尤其小心通配符`*`。养成良好的习惯，无论什么时候使用通配符在`rm`命令中，都要用`ls`命令来测试通配符的结果，然后再调用历史命令并仅用`rm`替换`ls`重新执行。



### 4.6	创建链接

`ln`：创建硬链接或符号链接；

* 硬链接

  * ```ln file link```

  * 相较符号链接而言，硬链接更古老。

  * 默认情况下，每个文件有一个硬链接，这个硬链接给文件起名字，当创建一个硬链接后，就为文件创建了一个额外的目录条目

  * 两个局限：

    * 一个硬链接不能关联它所在文件系统之外的文件。即一个链接不能关联与链接本身不在同一个磁盘分区上的文件；

    * 一个硬链接不能关联一个目录（担心目录树中创建环）。

      一个硬链接与文件本身并没有什么区别，当列出一个包含硬链接的目录内容时，并没有特殊的链接指示说明。当一个硬链接被删除时，文件本身内容仍存在，直到所有关联这个文件的链接都被删除。

* 符号链接	

  * ```ln -s item link```
  * 符号链接生效，是通过创建一个特殊类型的文件，这个文件包含一个关联文件或目录的文本指针，从这个意义上将与Windows的快捷方式类似。
  * 特点：
    * 一个符号链接指向一个文件，而且这个符号链接本身与其它的符号链接没有什么区别。如果向一个符号链接里面写入东西，那么相关联的文件也被写入；
    * 当删除一个符号链接时，只有符号链接本身被删除，而指向的文件不会受影响；
    * 如果先于符号链接删除文件，链接不会消失但不会指向任何东西，此时称为`坏链接`。`ls`命令中常以红色标识坏链接的存在。

一些可用的选项：

```shell
[lsjarch@LsjsArch test_operafile]$ ln -s --help
用法：ln [选项]... [-T] 目标 链接名
　或：ln [选项]... 目标
　或：ln [选项]... 目标... 目录
　或：ln [选项]... -t 目录 目标...
在第一种格式中，创建具有指定链接名且指向指定目标的链接。
在第二种格式中，在当前目录创建指向目标位置的链接。
在第三、四种格式中，在指定目录中创建指向指定目标的链接。
默认创建硬链接，当使用--symbolic 时创建符号链接。
默认情况下，创建每个目标时不应存在与新链接的名称相同的文件。
创建硬链接时，每个指定的目标都必须存在。符号链接可以指向任意的位置；
当链接解析正常时，将其解析为一个相对于其父目录的相对链接。

必选参数对长短选项同时适用。
      --backup[=CONTROL]      为每个已存在的目标文件创建备份文件
  -b                          类似--backup，但不接受任何参数
  -d, -F, --directory         允许超级用户尝试创建指向目录的硬链接（注意：此操作可能因系统限制而失败）
  -f, --force                 强行删除任何已存在的目标文件
  -i, --interactive           prompt whether to remove destinations
  -L, --logical               dereference TARGETs that are symbolic links
  -n, --no-dereference        treat LINK_NAME as a normal file if it is a symbolic link to a directory
  -P, --physical              make hard links directly to symbolic links
  -r, --relative              with -s, create links relative to link location
  -s, --symbolic              make symbolic links instead of hard links
  -S, --suffix=后缀           自行指定备份文件的后缀
  -t, --target-directory=目录  在指定的目录中创建链接
  -T, --no-target-directory   总是将给定的链接名当作普通文件
  -v, --verbose               列出每个链接的文件名称
      --help                  显示此帮助信息并退出
      --version               显示版本信息并退出

备份文件的后缀为"~"，除非以--suffix 选项或是 SIMPLE_BACKUP_SUFFIX环境变量指定。版本控制的方式可通过--backup 选项或 VERSION_CONTROL 环境
变量来选择。以下是可用的变量值：

  none, off       不进行备份(即使使用了--backup 选项)
  numbered, t     备份文件加上数字进行排序
  existing, nil   若有数字的备份文件已经存在则使用数字，否则使用普通方式备份
  simple, never   永远使用普通方式备份

使用 -s 选项会忽略 -L 和 -P。否则当给定的目标为一个符号链接（默认为 -P）时，会由最后一个指定的选项来控制行为。

```



### 4.7	练习一下

1. 在家目录下创建一个`test_operafile`目录；

   ```shell
   [lsjarch@LsjsArch ~]$ cd
   [lsjarch@LsjsArch ~]$ mkdir test_operafile
   [lsjarch@LsjsArch ~]$ ls
   Desktop  Documents  Downloads  Music  Pictures  Postman  Public  Templates  test_operafile  Videos
   
   ```

   

2. 在`test_operafile`目录下创建两个目录`dir1`和`dir2`；

   ```shell
   [lsjarch@LsjsArch ~]$ mkdir test_operafile/dir1 test_operafile/dir2
   [lsjarch@LsjsArch ~]$ ls test_operafile/
   dir1  dir2
   
   ```

   

3. 复制`/etc/passwd`文件到`test_operafile`目录下；

   ```shell
   [lsjarch@LsjsArch ~]$ cp /etc/passwd test_operafile/
   [lsjarch@LsjsArch ~]$ cd test_operafile/
   [lsjarch@LsjsArch test_operafile]$ ls -l
   总用量 12
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:11 dir1
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:11 dir2
   -rw-r--r-- 1 lsjarch lsjarch 1231  1月  2 21:14 passwd
   
   # 尝试一下另两个选项
   [lsjarch@LsjsArch test_operafile]$ cp -v -i /etc/passwd .
   cp：是否覆盖'./passwd'？ yes
   '/etc/passwd' -> './passwd'
   [lsjarch@LsjsArch test_operafile]$ ls -l
   总用量 12
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:11 dir1
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:11 dir2
   -rw-r--r-- 1 lsjarch lsjarch 1231  1月  2 21:19 passwd
   
   ```

   

4. 移动和重命名文件

   ```shell
   # 先将 passwd 文件改名为 test1
   [lsjarch@LsjsArch test_operafile]$ mv passwd test1
   [lsjarch@LsjsArch test_operafile]$ ls
   dir1  dir2  test1
   
   # 将 test1 文件先后移动到 dir1 和 dir2 ，最后移回 test_operafile 的根目录
   [lsjarch@LsjsArch test_operafile]$ mv test1 dir1
   [lsjarch@LsjsArch test_operafile]$ ls . dir1
   .:
   dir1  dir2
   
   dir1:
   test1
   [lsjarch@LsjsArch test_operafile]$ mv dir1/test1 dir2
   [lsjarch@LsjsArch test_operafile]$ ls -l dir1 dir2
   dir1:
   总用量 0
   
   dir2:
   总用量 4
   -rw-r--r-- 1 lsjarch lsjarch 1231  1月  2 21:19 test1
   [lsjarch@LsjsArch test_operafile]$ mv dir2/test1 .
   [lsjarch@LsjsArch test_operafile]$ ls dir2 .
   .:
   dir1  dir2  test1
   
   dir2:
   
   # 如果将 test1 移动到此时并不存在的 dir3 呢？
   [lsjarch@LsjsArch test_operafile]$ mv test1 dir3
   [lsjarch@LsjsArch test_operafile]$ ls . dir3
   dir3
   
   .:
   dir1  dir2  dir3
   # 可以看到，不存在目录dir3时，会将 test1 改名为 dir3 ，并不改变路径
   ```

   

5. 创建硬链接

   ```shell
   [lsjarch@LsjsArch test_operafile]$ mv dir3 test1
   [lsjarch@LsjsArch test_operafile]$ ls
   dir1  dir2  test1
   [lsjarch@LsjsArch test_operafile]$ ln test1 test1-hard
   [lsjarch@LsjsArch test_operafile]$ ln test1 dir1/test1-hard2
   [lsjarch@LsjsArch test_operafile]$ ln test1 dir2/test1-hard3
   [lsjarch@LsjsArch test_operafile]$ ls -l 
   总用量 16
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:59 dir1
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:59 dir2
   -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1
   -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard
   [lsjarch@LsjsArch test_operafile]$ ls -l dir1/ dir2/
   dir1/:
   总用量 4
   -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard2
   
   dir2/:
   总用量 4
   -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard3
   
   ```

   注意到，硬链接的第二个字段都是4，这表示文件 test1 的硬链接数目。一个文件至少有一个硬链接，因为文件名就是由链接创建的。

   如何验证 test1 和 test1-hard 是同一文件呢？我们先假定硬链接问题中，文件由两部分组成——文件内容的数据部分和持有文件名的名字部分，当创建文件硬链接时，实际上是为文件创建了额外的名字部分，并且这些名字都关联到相同的数据部分。

   这时，系统会分配一连串的磁盘给所谓的索引节点，然后索引节点与文件名字部分相关联，因此每一个硬链接都关系到一个具体的包含文件内容的索引节点。通过`ls -i`命令来展示文件索引节点的信息：

   ```shell
   [lsjarch@LsjsArch test_operafile]$ ls -li . dir1/test1-hard2 dir2/test1-hard3 
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 dir1/test1-hard2
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 dir2/test1-hard3
   
   .:
   总用量 16
   788502 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:59 dir1
   788506 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:59 dir2
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard
   
   ```

   第一个字段表示的即是文件索引节点号，由此证实， test1 和 test1-hard 是同一文件。

6. 创建符号链接

   建立符号链接是为了解决硬链接的两个缺点——不能跨物理设备和不能关联目录。符号链接是文件的特殊类型，包含一个指向目标文件或目录的文本指针。

   ```shell
   [lsjarch@LsjsArch test_operafile]$ ls
   dir1  dir2  test1  test1-hard
   [lsjarch@LsjsArch test_operafile]$ ln -s test1 test1-sym
   [lsjarch@LsjsArch test_operafile]$ ls
   dir1  dir2  test1  test1-hard  test1-sym
   [lsjarch@LsjsArch test_operafile]$ ls -li
   总用量 16
   788502 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:47 dir1
   788506 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:49 dir2
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard
   788508 lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:41 test1-sym -> test1
   # 可以看到，在当前目录创建了名为 test1-sym 的符号链接指向 test1 文件，且符号链接是一个特殊的文件，其索引节点号与 test1 文件不同
   
   [lsjarch@LsjsArch test_operafile]$ ln -s ../test1 dir1/test1-sym2
   [lsjarch@LsjsArch test_operafile]$ ls -li dir1 .
   .:
   总用量 16
   788502 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:47 dir1
   788506 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:49 dir2
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard
   788508 lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:41 test1-sym -> test1
   
   dir1:
   总用量 4
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard2
   788509 lrwxrwxrwx 1 lsjarch lsjarch    8  1月  2 23:47 test1-sym2 -> ../test1
   # 可以看到，创建一个符号链接的时候，会建立一个目标文件在哪里和符号链接有关联的文本描述：相对于test1-sym2的存储位置，test1在它的父目录
   # 同时，符号链接文件的长度为8，这是 ../test1 字符串的长度，而不是符号链接所指向的文件长度
   
   [lsjarch@LsjsArch test_operafile]$ ln -s test1 dir2/test-sym3
   [lsjarch@LsjsArch test_operafile]$ ls -li . dir2
   .:
   总用量 16
   788502 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:47 dir1
   788506 drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:49 dir2
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard
   788508 lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:41 test1-sym -> test1
   
   dir2:
   总用量 4
   788507 -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard3
   788510 lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:49 test-sym3 -> test1
   # 注意到，这个命令在指定目标文件 test1 时并没有标注其相对路径，而导致所建立的符号链接对目标文件路径的描述有误
   # 验证：
   [lsjarch@LsjsArch test_operafile]$ less dir2/test1-sym3
   dir2/test1-sym3: 没有那个文件或目录
   [lsjarch@LsjsArch test_operafile]$ less dir1/test1-sym2 # 可以正常打开，文件内容此处省略
   # 由此，要理解 ln 名令中所指向的目标文件的路径是相对于符号链接文件而言，否则会出现指向错误
   # 当然，如果使用绝对路径表示指向文件，不会出现问题。但更倾向于使用相对路径名，因为它允许一个包含符号链接的目录重命名或移动，而不破坏链接
   
   
   ```

   

7. 移动文件和目录

   首先，利用`rm`命令删除一个硬链接：

   ```shell
   [lsjarch@LsjsArch test_operafile]$ ls -l
   总用量 16
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:47 dir1
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:49 dir2
   -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1
   -rw-r--r-- 4 lsjarch lsjarch 1231  1月  2 21:19 test1-hard
   lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:41 test1-sym -> test1
   [lsjarch@LsjsArch test_operafile]$ rm -v test1-hard 
   已删除 'test1-hard'
   [lsjarch@LsjsArch test_operafile]$ ls -l
   总用量 12
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:47 dir1
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:49 dir2
   -rw-r--r-- 3 lsjarch lsjarch 1231  1月  2 21:19 test1
   lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:41 test1-sym -> test1
   
   ```

   可以看到， test1 的链接数从4减到3；

   下一步，删除文件 test1 ：

   ```shell
   [lsjarch@LsjsArch test_operafile]$ rm -i test1
   rm：是否删除普通文件 'test1'？y
   [lsjarch@LsjsArch test_operafile]$ ls -l
   总用量 8
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:47 dir1
   drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 23:49 dir2
   lrwxrwxrwx 1 lsjarch lsjarch    5  1月  2 23:41 test1-sym -> test1
   # 此时 test1-sym 指向一个不存在的文件，是一个坏链接。在大多Linux发行版中会标红 test1-sym 以表示其是一个坏链接
   [lsjarch@LsjsArch test_operafile]$ less test1-sym 
   test1-sym: 没有那个文件或目录
   # 当尝试使用坏链接时，会报错。坏链接并不危险，除了会导致混乱
   ```

   对于符号链接，大多数文件操作是针对链接的对象，但`rm`命令是个特例，它会删除链接本身，而不是链接所指向的对象。

   最后，删除 test_operafile ：

   ```shell
   [lsjarch@LsjsArch test_operafile]$ cd
   [lsjarch@LsjsArch ~]$ ls
   Desktop  Documents  Downloads  Music  Pictures  Postman  Public  Templates  test_operafile  Videos
   [lsjarch@LsjsArch ~]$ ls test_operafile/
   dir1  dir2  test1-sym
   [lsjarch@LsjsArch ~]$ rm -r test_operafile
   [lsjarch@LsjsArch ~]$ ls
   Desktop  Documents  Downloads  Music  Pictures  Postman  Public  Templates  Videos
   
   ```




*****







## 五、使用命令

本章命令：`type`, `which`, `man`, `apropos`, `whatis`, `alias`。

### 5.1	到底什么是命令？

命令可以是下面四种形式之一：

* 是一个可执行程序。属于这一类的程序，可以编译成二进制文件，如C/C++写成的程序，shell、perl、python、ruby等脚本语言写成的程序；
* 是一个内建于 shell 自身的命令。bash 支持若干命令，内部叫做 shell 内部命令（builtins）。如`cd`就是一个 shell 内部命令；
* 是一个 shell 函数。一些小规模的 shell 脚本，混合在环境变量中，后面会学习到如何配置环境变量及书写 shell 函数；
* 是一个命令别名。我们可以定义自己的命令，建立在其他命令之上；

### 5.2	识别命令

`type`：是 shell 内部命令，会显示命令的类别；

```shell
[lsjarch@LsjsArch ~]$ type type
type 是 shell 内建
[lsjarch@LsjsArch ~]$ type ls
ls 是“ls --color=auto”的别名
[lsjarch@LsjsArch ~]$ type cp
cp 是 /usr/bin/cp

```

注意，Arch Linux中`ls`命令实际上是`ls --color=auto`的别名，这也是`ls`的输出有颜色的原因。



`which`：确定所给定的执行程序的准确位置；

```shell
[lsjarch@LsjsArch ~]$ type which
which 是 /usr/bin/which
[lsjarch@LsjsArch ~]$ which ls
/usr/bin/ls

```

这个命令只对可执行程序有效，不包括内部命令和命令别名，别名只是可执行程序的替代物。当使用`which`定位 shell 内部命令时，要么没有回应，要么是报错信息：

```shell
[lsjarch@LsjsArch ~]$ which cd
which: no cd in (/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/lib/jvm/default/bin:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl)

```



### 5.3	获得命令文档

`help`：可以获得 shell 内部命令的文档，`help`是 bash 的内建帮助工具；

```shell
[lsjarch@LsjsArch ~]$ help cd
cd: cd [-L|[-P [-e]] [-@]] [目录]
    改变 shell 工作目录。
    
    改变当前目录至 DIR 目录。默认的 DIR 目录是 shell 变量 HOME的值。
    
    变量 CDPATH 定义了含有 DIR 的目录的搜索路径，其中不同的目录名称由冒号 (:)分隔。
    一个空的目录名称表示当前目录。如果要切换到的 DIR 由斜杠 (/) 开头，则 CDPATH 不会用上变量。
    
    如果路径找不到，并且 shell 选项 `cdable_vars' 被设定，则参数词被假定为一个变量名。如果该变量有值，则它的值被当作 DIR 目录。
    
    选项：
        -L      强制跟随符号链接: 在处理 `..' 之后解析 DIR 中的符号链接。
        -P      使用物理目录结构而不跟随符号链接: 在处理 `..' 之前解析 DIR 中的符号链接。
        -e      如果使用了 -P 参数，但不能成功确定当前工作目录时，返回非零的返回值。
        -@      在支持拓展属性的系统上，将一个有这些属性的文件当作有文件属性的目录。
    
    默认情况下跟随符号链接，如同指定 `-L'。
    `..' 使用移除向前相邻目录名成员直到 DIR 开始或一个斜杠的方式处理。
    
    退出状态：
    如果目录改变，或在使用 -P 选项时 $PWD 修改成功时返回 0，否则非零。

```

注意表示法：命令语法说明中，[ ]中的内容表示可选项，“|”字符表示互斥项。

### 5.4	显示用法信息

`--help`：显示可执行程序的用法信息，包括命令所支持的语法和选项说明；

```shell
[lsjarch@LsjsArch ~]$ mkdir --help 
用法：mkdir [选项]... 目录...
若指定<目录>不存在则创建目录。

必选参数对长短选项同时适用。
  -m, --mode=模式       设置权限模式（类似chmod），而不是 a=rwx 减 umask
  -p, --parents         需要时创建目标目录的上层目录，但即使这些目录已存在也不当作错误处理，其文件权限模式不受 -m 选项影响。
  -v, --verbose         每次创建新目录都显示信息
  -Z                    设置每个创建的目录的 SELinux 安全上下文为默认类型
      --context[=CTX]   类似 -Z，或如果指定了 CTX，则将 SELinux 或 SMACK 安全上下文设置为 CTX 对应的值
      --help            显示此帮助信息并退出
      --version         显示版本信息并退出

GNU coreutils 在线帮助：<https://www.gnu.org/software/coreutils/>
请向 <http://translationproject.org/team/zh_CN.html> 报告任何翻译错误
完整文档 <https://www.gnu.org/software/coreutils/mkdir> 或者在本地使用：info '(coreutils) mkdir invocation'
```

可能会有一些程序不支持`--help`选项，但试一下总不会吃亏。

### 5.5	显示程序手册页

`man`：是一个分页程序，用来浏览希望被命令行使用的可执行程序的正式文档；

```shell
# Arch Linux 中默认没有 man 程序，先进行下载
[lsjarch@LsjsArch ~]$ sudo pacman -S man

# 浏览一下 ls 程序的手册
[lsjarch@LsjsArch ~]$ man ls

```

手册文档的格式一般包含一个标题，命令语法的纲要，命令用途的说明，和命令选项列表，及每个选项的说明。但并不包含实例，适合作为一本参考书。

大多数Linux系统中，`man`使用`less`工具来显示参考手册，所以`less`的命令都有效。

`man`所显示的参考手册，被分成几个章节，不仅仅包括用户命令，也包括系统管理员命令、程序接口、文件格式等等。下表描述了手册的布局：

| 章节 | 内容                           |
| :--- | ------------------------------ |
| 1    | 用户命令                       |
| 2    | 程序接口内核系统调用           |
| 3    | C库函数程序接口                |
| 4    | 特殊文件，如设备结点和驱动程序 |
| 5    | 文件格式                       |
| 6    | 游戏娱乐，如屏幕保护程序       |
| 7    | 其他方面                       |
| 8    | 系统管理员命令                 |

有时候，需要查看参考手册的特定章节，以得到所需信息。如果我们查找一种文件格式，同时也是一个命令名时，这种情况尤其正确。

没有指定章节号，我们总是得到第一个匹配项，可能在第一章节。如此使用`man`：

```shell
# 语法格式：man section search_term
[lsjarch@LsjsArch ~]$ man 5 passwd
# 命令运行结果会显示文件 /etc/passwd 的文件格式说明手册
```



### 5.6	显示适当的命令

`apropos`：基于某个关键字的匹配项，搜索参考手册列表

```shell
[lsjarch@LsjsArch ~]$ apropos --help
用法： apropos[选项...] 关键词...

  -d, --debug                输出调试信息
  -v, --verbose              输出详细的警告信息
  -e, --exact                对每个关键词都进行严格匹配的搜索
  -r, --regex                把每个关键词都当作正则表达式解读
  -w, --wildcard             关键词里包含通配符
  -a, --and                  要求所有的关键词都同时匹配
  -l, --long                 不要把输出按终端宽度截断
  -C, --config-file=文件     使用该用户设置文件
  -L, --locale=区域          定义本次搜索所使用的区域设置
  -m, --systems=系统         使用来自其它系统的手册页
  -M, --manpath=路径         设置搜索手册页的路径为 PATH
  -s, --sections=列表, --section=列表
                             仅在这些分区中搜索（冒号分隔）
  -?, --help                 显示此帮助列表
      --usage                显示一份简洁的用法信息
  -V, --version              打印程序版本

选项完整形式所必须用的或是可选的参数，在使用选项缩写形式时也是必须的或是可选的。

The --regex option is enabled by default.

```

输出结果每行第一个字段是手册页的名字，第二个字段显示章节。`man -k`命令作用与`apropos`相同。

### 5.7	显示非常简洁的命令说明

`whatis`：显示匹配特定关键字的手册页的名字和一行命令说明；

### 5.8	显示程序 Info 条目

`info`：GNU项目提供的命令程序手册页的替代物。`info`内容可通过`info`阅读器程序读取，`info`页以超级链接形式展示，类似于网页。

`info`程序读取`info`文件，`info`文件是树型结构，分化为各个结点，每一个包含一个题目。

`info`文件包含超级链接，可以从一个结点跳到另一个结点。一个超级链接可通过开头的星号辨别，将光标放在其上并按下<kbd>enter</kbd>，即可激活它。

 输入`info`，接着输入程序名称，即可启动`info`。下表命令可以用来控制`info`页面中的阅读器：

| 命令              | 行为                                         |
| ----------------- | -------------------------------------------- |
| ?                 | 显示命令帮助                                 |
| PgUp or Backspace | 显示上一页                                   |
| PgDn or Space     | 显示下一页                                   |
| n                 | 下一个，显示下一个结点                       |
| p                 | 上一个，显示上一个结点                       |
| u                 | Up，显示当前所显示结点的父结点，通常是个菜单 |
| Enter             | 激活光标位置下的超级链接                     |
| q                 | 退出                                         |



目前为止，学习到的命令大多数与 GNU 项目的`coreutils`包，输入下面命令：

```shell
[lsjarch@LsjsArch ~]$ info coreutils 'ls'
# 运行结果为
Next: dir invocation,  Up: Directory listing

10.1 ‘ls’: List directory contents
==================================

The ‘ls’ program lists information about files (of any type, including
directories).  Options and file arguments can be intermixed arbitrarily,
as usual.  Later options override earlier options that are incompatible.

   For non-option command-line arguments that are directories, by
default ‘ls’ lists the contents of directories, not recursively, and
omitting files with names beginning with ‘.’.  For other non-option
arguments, by default ‘ls’ lists just the file name.  If no non-option
argument is specified, ‘ls’ operates on the current directory, acting as
if it had been invoked with a single argument of ‘.’.

...

```

不指定关键词时，将会显示一个包含超级链接的手册页，这些超级链接指向包含在`coreutils`包中的各个程序。



### 5.9	README和其他程序文档

许多安装在系统中的软件，都有自己的文档文件，位于/usr/share/doc目录下。这些文档大多以文本文件形式存储，可通过`less`程序阅读；对于HTML格式文档，通过网页浏览器来阅读；以`.gz`结尾的文件，表示已经通过了 gzip 程序的压缩，而 gzip 程序包含一个特殊的`less`版本，叫做`zless`，`zless`可以显示由 gzip 压缩的文本文件的内容。

### 5.10	用别名创建自己的命令

首先，要知道可以将多个命令放在同一行，命令之间用“`;`”分隔，并且按照先后顺序执行。

现在，创建第一个 shell 吧：

```shell
# 先看一下我们要实现的命令
[lsjarch@LsjsArch ~]$ cd /usr; ls; cd ~
bin  include  lib  lib32  lib64  local  sbin  share  src
# 这串命令的作用是，先切换工作目录到 /usr 并 ls 其中的目录或文件，最后回到原始目录

# 要为这一串命令命名别名，先检查一下是否要命名的命令别名已经存在
[lsjarch@LsjsArch ~]$ type test
test 是 shell 内建
[lsjarch@LsjsArch ~]$ type test_alias
bash: type: test_alias：未找到

# OK！test_alias命令还未被占用，创建该别名
[lsjarch@LsjsArch ~]$ alias test_alias='cd /usr; ls; cd ~'

# 测试一下
[lsjarch@LsjsArch ~]$ test_alias 
bin  include  lib  lib32  lib64  local  sbin  share  src

# 查看一下test_alias
[lsjarch@LsjsArch ~]$ type test_alias 
test_alias 是“cd /usr; ls; cd ~”的别名

# 删除别名
[lsjarch@LsjsArch ~]$ unalias test_alias 
[lsjarch@LsjsArch ~]$ type test_alias
bash: type: test_alias：未找到

# 要查看定义在系统环境中的别名，使用不带参数的 alias 命令
[lsjarch@LsjsArch ~]$ alias 
alias ls='ls --color=auto'

```

尽管我们已经有意避免使用已经存在的命令名来作为我们自定义的别名，但这仍是常见的情况。

通常，我们会把一个普遍用到的选项加到一个经常使用的命令后面，如`ls`命令。

在命令行中定义别名有一个问题，那就是当 shell 会话结束时，它们会消失。后面将学到如何将自定义的别名添加到文件中去。



### 5.11	拓展阅读

* Bash 参考手册是一本 bash shell 的参考指南，里面有很多实例，且比 bash 手册页易于阅读：<https://www.gnu.org/software/bash/manual/bashref.html>
* Bash FAQ 包含关于 bash 及经常提到的问题的答案。这个列表面向 bash 的中高级用户，但有许多有帮助信息：<https://mywiki.wooledge.org/BashFAQ>
* GNU 项目为其程序提供了详细的文档：<https://www.gnu.org/manual/manual.html>
* Wikipedia 上有一篇关于手册页的有趣文章：<https://en.wikipedia.org/wiki/Man_page>

*****







## 六、I/O重定向

通过这个工具，可以重定向命令的输入输出，实现命令的输入来自文件，输出也存储到文件。也可以将多个命令连接起来组成命令管道。

本章命令：`cat`, `sort`, `uniq`, `grep`, `wc`, `head`, `tail`。

### 6.1	标准输入、输出、错误

输出常常由两种类型组成——程序运行结果和得到的状态、错误信息。前者呈现了程序要完成的功能，后者说明了程序的进展。

Linux作为类Unix系统的“一切皆文件”的又一体现：程序，比如`ls`，将其运行结果输送到 stdout 文件，称为`标准输出`，将状态信息输送到 stderr 文件，称为`标准错误`。默认情况下，标准输出和标准错误都连接到屏幕，而不是保存到磁盘文件。同时，标准输入设备 stdin ，默认连接到键盘，作为程序的输入端。

而`I/O重定向`则用来改变输出走向和输入走向。

### 6.2	重定向标准输出

`>`：重定向符，其后紧接文件名，可以将标准输出重定向到该文件；

```shell
[lsjarch@LsjsArch ~]$ mkdir test_io
[lsjarch@LsjsArch ~]$ ls -l
总用量 40
drwxr-xr-x 2 lsjarch lsjarch 4096  1月  3 15:33 Desktop
drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 21:04 Documents
drwxr-xr-x 2 lsjarch lsjarch 4096  1月  2 01:08 Downloads
drwxr-xr-x 2 lsjarch lsjarch 4096 12月 28 18:41 Music
drwxr-xr-x 2 lsjarch lsjarch 4096 12月 28 18:41 Pictures
drwxr-xr-x 3 lsjarch lsjarch 4096  1月  2 02:19 Postman
drwxr-xr-x 2 lsjarch lsjarch 4096 12月 28 18:41 Public
drwxr-xr-x 2 lsjarch lsjarch 4096 12月 28 18:41 Templates
drwxr-xr-x 2 lsjarch lsjarch 4096  1月  3 15:33 test_io
drwxr-xr-x 2 lsjarch lsjarch 4096 12月 28 18:41 Videos
[lsjarch@LsjsArch ~]$ ls -l /usr/bin > test_io/ls-output.txt
[lsjarch@LsjsArch ~]$ less test_io/ls-output.txt 
# 在less程序中，可以看到结果被成功存储

[lsjarch@LsjsArch ~]$ ls -l test_io/ls-output.txt 
-rw-r--r-- 1 lsjarch lsjarch 131756  1月  3 15:34 test_io/ls-output.txt
```



如果我们换成一个不存在的目录：

```shell

[lsjarch@LsjsArch ~]$ ls -l /bin/usr > test_io/ls-wrong.txt
ls: 无法访问 '/bin/usr': 没有那个文件或目录
[lsjarch@LsjsArch ~]$ ls -l test_io/ls-wrong.txt 
-rw-r--r-- 1 lsjarch lsjarch 0  1月  3 15:40 test_io/ls-wrong.txt

```

可以看到，`ls`并不把它的错误信息作为标准输出或重定向，而是直接显示在屏幕上。因为我们并没有对标准错误进行重定向，所以不会将错误信息存储在文件中。

并且，注意到`ls-wrong.txt`文件长度为0，这是因为文件总是从开头被重写，而`ls`命令没有产生正确的输出结果，所以重定向操作重写文件时由于错误而停止，导致文件内容删除。事实上，可以据此实现删除文件的全部内容：

```shell
# 先向ls-wrong.txt文件中写入一些字符
[lsjarch@LsjsArch ~]$ vim test_io/ls-wrong.txt 
[lsjarch@LsjsArch ~]$ ls -l test_io/ls-wrong.txt 
-rw-r--r-- 1 lsjarch lsjarch 14  1月  3 15:49 test_io/ls-wrong.txt
[lsjarch@LsjsArch ~]$ ls -l /bin/usr > test_io/ls-wrong.txt 
ls: 无法访问 '/bin/usr': 没有那个文件或目录
[lsjarch@LsjsArch ~]$ ls -l test_io/ls-wrong.txt 
-rw-r--r-- 1 lsjarch lsjarch 0  1月  3 15:56 test_io/ls-wrong.txt

# 事实上，在重定向命令中，重定向符 > 前的内容是不必要的，即使删除也可以清空已存在文件的内容
# 如果重定向符 > 指向的文件并不存在呢？
[lsjarch@LsjsArch ~]$ cd test_io
[lsjarch@LsjsArch test_io]$ ls
ls-output.txt  ls-wrong.txt
[lsjarch@LsjsArch test_io]$ > test1.txt
[lsjarch@LsjsArch test_io]$ ls -l
总用量 132
-rw-r--r-- 1 lsjarch lsjarch 131756  1月  3 15:34 ls-output.txt
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 15:56 ls-wrong.txt
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 16:02 test1.txt
# 可见，会创建一个空文件
```



那么，怎样实现追加重定向结果到文件原内容的后面，而不是从开头重写文件？`>>`重定向符可以做到这件事：

```shell
[lsjarch@LsjsArch test_io]$ ls -l /usr/bin >> ls-output.txt 
[lsjarch@LsjsArch test_io]$ ls -l ls-output.txt 
-rw-r--r-- 1 lsjarch lsjarch 263512  1月  3 16:06 ls-output.txt
# 可以看到，文件大小变为原来的两倍
# 同样，如果 >> 指向的文件不存在，会自动创建并存储重定向的输出
```



### 6.3	重定向标准错误

重定向标准错误没有专用操作符，我们需要参考其文件描述符。

一个程序可以在几个编号的文件流中的任一个上产生输出，我们将这些文件流的前三个定义作标准输入、输出和错误，shell 内部参考它们为文件描述符为0、1、2。因此，当我们使用文件描述符来为标准错误进行重定向：

```shell
[lsjarch@LsjsArch test_io]$ ls -l /usr/bin 2> ls-error.txt
...
-rwxr-xr-x 1 root root     4553  9月  4 10:01  znew
-rwxr-xr-x 1 root root   116904 12月  2 04:14  zramctl
-rwxr-xr-x 1 root root    23064  1月  8  2021  zresample
-rwxr-xr-x 1 root root    23032  1月  8  2021  zretune
lrwxrwxrwx 1 root root        6  6月 22  2021  zsoelim -> soelim
-rwxr-xr-x 1 root root  1108824 12月 24 18:18  zstd
lrwxrwxrwx 1 root root        4 12月 24 18:18  zstdcat -> zstd
-rwxr-xr-x 1 root root     3869 12月 24 18:18  zstdgrep
-rwxr-xr-x 1 root root       30 12月 24 18:18  zstdless
lrwxrwxrwx 1 root root       13 12月 24 18:18  zstdmt -> /usr/bin/zstd

[lsjarch@LsjsArch test_io]$ ls -l
总用量 260
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 16:46 ls-error.txt
-rw-r--r-- 1 lsjarch lsjarch 263512  1月  3 16:06 ls-output.txt
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 15:56 ls-wrong.txt
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 16:02 test1.txt

```

文件描述符`2`，紧挨着放在重定向操作符之前，来执行重定向标准错误到文件`ls-error.txt`的任务。



**重定向标准输出和标准错误到同一个文件：**

* 传统方法：

  ```shell
  [lsjarch@LsjsArch test_io]$ ls -l /bin/usr > ls-output.txt 2>&1
  [lsjarch@LsjsArch test_io]$ ls -l
  总用量 4
  -rw-r--r-- 1 lsjarch lsjarch  0  1月  3 16:46 ls-error.txt
  -rw-r--r-- 1 lsjarch lsjarch 57  1月  3 16:52 ls-output.txt
  -rw-r--r-- 1 lsjarch lsjarch  0  1月  3 15:56 ls-wrong.txt
  -rw-r--r-- 1 lsjarch lsjarch  0  1月  3 16:02 test1.txt
  [lsjarch@LsjsArch test_io]$ less ls-output.txt 
  ls: 无法访问 '/bin/usr': 没有那个文件或目录
  
  ```

  上述命令完成了两个重定向，首先重定向标准输出到文件`ls-output.txt`，然后重定向文件描述符`2`到文件描述符`1`，使用表示法`2>&1`。

  注意，重定向的顺序安排很重要，标准错误的重定向必须总是在标准输出重定向之后，不然不起作用

* 联合表示：

  ```shell
  [lsjarch@LsjsArch test_io]$ ls -l /bin/usr &> ls-output.txt 
  [lsjarch@LsjsArch test_io]$ ls -l
  总用量 4
  -rw-r--r-- 1 lsjarch lsjarch  0  1月  3 16:46 ls-error.txt
  -rw-r--r-- 1 lsjarch lsjarch 57  1月  3 17:02 ls-output.txt
  -rw-r--r-- 1 lsjarch lsjarch  0  1月  3 15:56 ls-wrong.txt
  -rw-r--r-- 1 lsjarch lsjarch  0  1月  3 16:02 test1.txt
  
  ```

  这里，我们使用`&>`联合表示重定向标准输出和标准错误。



**处理不需要的输出：**

对于错误信息和状态信息，我们不总是需要其输出，那么通过重定向输出结果到一个特殊的文件`/dev/null`。

这个文件是系统设备，叫做位存储桶，它可以接受输入，并对输入不做任何处理。所以，为了隐瞒命令错误信息，可以这样：

```shell
[lsjarch@LsjsArch test_io]$ ls -l /bin/usr 2> /dev/null

```



### 6.4	重定向标准输入

事实上，我们用键盘在`terminal`中输入命令，就是利用标准输入。**那么，要怎么进行重定向呢？**



`cat`：读取一个或多个文件，然后复制它们到标准输出；

```shell
# 为避免歧义，我们先修改一下文件里的内容
[lsjarch@LsjsArch test_io]$ vim ls-output.txt 
[lsjarch@LsjsArch test_io]$ cat ls-output.txt 
hello,world!

```

事实上，`cat`命令用来显示文件而没有分页，因此常用来显示简短的文本文件。又由于`cat`可以接受不止一个文件作为参数，所以也可以用来把文件连接在一起：

```shell
cat movie.mpeg.0* > movie.mpeg
# USENET中的多媒体文件常分离成多个部分，若要连接，则使用上述命令。由于通配符总是以有序的方式展开，所以这些部分文件的参数会以正确的顺序安排
```

那么，这些和重定向标准输入有什么关系呢？欸，没有任何关系。。

呃，just a joke~ 

尝试不带参数的`cat`命令：

```shell
[lsjarch@LsjsArch test_io]$ cat 
test cat cmd without parameter.
```

下一步使用组合键<kbd>ctrl</kbd>+<kbd>d</kbd>来告诉`cat`，在标准输入中，它已经到达了文件末尾 EOF ：

```shell
[lsjarch@LsjsArch test_io]$ cat 
test cat cmd without parameter.test cat cmd without parameter.
```

由于文件名参数的缺席，`cat`仅仅是复制标准输入到标准输出，所以文本行会重复出现。那么，加上重定向输出的目标文件，就可以实现从标准输入重定向输出到目标文件：

```shell
[lsjarch@LsjsArch test_io]$ cat > test_cat.txt
test cat cmd with target file.^C
[lsjarch@LsjsArch test_io]$ cat test_cat.txt 
test cat cmd with target file.

```

了解了如何接受标准输入，接下来尝试重定向标准输入：

```shell
[lsjarch@LsjsArch test_io]$ cat < test_cat.txt 
test cat cmd with target.
```

`<`：重定向输入符，将标准输入源从键盘改到文件 test_cat.txt 。



### 6.5	管道线

管道线是一种 shell 的特性，它利用了命令能从标准输入读取数据再将数据输送到标准输出的原理。使用管道操作符“`|`”，一个命令的标准输出可以通过管道到达另一个命令的标准输入。

回顾之前学习的`less`命令，其实它还是一个能接受标准输入的命令。我们用`less`来一页一页地显示任何命令的输出，命令把它的运行结果输送到标准输出：

```shell
[lsjarch@LsjsArch test_io]$ ls -l /usr/bin | less

```

使用管道线，可以方便地检测会产生标准输出的任一命令的运行结果。

### 6.6	过滤器

管道线经常用来对数据完成复杂的操作，为了使结果易读，我们需要过滤器对输出结果优化。

`sort`：改变输出数据，使其称为一个有序列表，默认是升序。

```shell
[lsjarch@LsjsArch test_io]$ ls /bin /usr/bin | sort | less

```

### 6.7	报道或忽略重复行

`uniq`：从标准输入或单个文件名参数接受数据有序列表，然后从数据列表中删除任何重复行。常和`sort`命令结合使用；

```shell
[lsjarch@LsjsArch test_io]$ ls /bin /usr/bin | sort | uniq | less

```

如果为`uniq -d`，则会看到重复行。

### 6.8	打印行，字节和字节数

`wc`：用来显示文件所包含的行、字及字节数；

```shell
[lsjarch@LsjsArch test_io]$ cat test_cat.txt 
test cat cmd with target.

[lsjarch@LsjsArch test_io]$ wc test_cat.txt 
 2  5 27 test_cat.txt

```

如果`wc`不带命令行参数，则接受标准输入。添加`-l`选项可以限制命令输出只能报道行数。因此，添加`wc`到管道线可以用来统计数据：

```shell
[lsjarch@LsjsArch test_io]$ ls /bin /usr/bin | sort | uniq | wc 
   2215    2214   23082
```

### 6.9	打印匹配行

`grep`：用来寻找文件中匹配的文本；

```shell
grep pattern [file...]
```

当`grep`遇到一个文件中匹配的“模式/pattern”，就会打印出包含这个类型的所有行。`pattern`可以是简单的文本匹配，也可以是后面要学到的正则表达式。

```shell
# 若我们需要了解文件名中包含 zip 的情况，以获取系统中一些程序与文件压缩的关系
[lsjarch@LsjsArch test_io]$ ls /bin /usr/bin | sort | uniq | grep zip
bunzip2
bzip2
bzip2recover
gunzip
gzip
zipcmp
zipmerge
ziptool

```

注意，在Linux系统中是大小写敏感的，若要忽略大小写进行匹配，则需要为`grep`添加`-i`选项。而`-v`则会让`grep`只打印不匹配的行。

### 6.10	打印文件开头/结尾部分

`head`：打印文件前十行；

`tail`：打印文件后十行。两个命令都可以通过`-n`选项来指定所要打印的行数；

```shell
[lsjarch@LsjsArch test_io]$ ls -l /usr/bin > ls-output.txt 
[lsjarch@LsjsArch test_io]$ ls -l
总用量 136
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 16:46 ls-error.txt
-rw-r--r-- 1 lsjarch lsjarch 131756  1月  4 00:36 ls-output.txt
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 15:56 ls-wrong.txt
-rw-r--r-- 1 lsjarch lsjarch      0  1月  3 16:02 test1.txt
-rw-r--r-- 1 lsjarch lsjarch     27  1月  3 23:38 test_cat.txt
[lsjarch@LsjsArch test_io]$ head -n 8 ls-output.txt 
总用量 612068
-rwxr-xr-x 1 root root    59552  9月 29 21:56 [
lrwxrwxrwx 1 root root        9 12月 19 07:53 2to3 -> 2to3-3.10
-rwxr-xr-x 1 root root       96 12月 19 07:53 2to3-3.10
-rwxr-xr-x 1 root root    14176 10月 15  2020 4channels
-rwxr-xr-x 1 root root    14408  6月 22  2021 accessdb
-rwxr-xr-x 2 root root    36020 10月  5 03:45 aclocal
-rwxr-xr-x 2 root root    36020 10月  5 03:45 aclocal-1.16
[lsjarch@LsjsArch test_io]$ tail ls-output.txt 
-rwxr-xr-x 1 root root     4553  9月  4 10:01 znew
-rwxr-xr-x 1 root root   116904 12月  2 04:14 zramctl
-rwxr-xr-x 1 root root    23064  1月  8  2021 zresample
-rwxr-xr-x 1 root root    23032  1月  8  2021 zretune
lrwxrwxrwx 1 root root        6  6月 22  2021 zsoelim -> soelim
-rwxr-xr-x 1 root root  1108824 12月 24 18:18 zstd
lrwxrwxrwx 1 root root        4 12月 24 18:18 zstdcat -> zstd
-rwxr-xr-x 1 root root     3869 12月 24 18:18 zstdgrep
-rwxr-xr-x 1 root root       30 12月 24 18:18 zstdless
lrwxrwxrwx 1 root root       13 12月 24 18:18 zstdmt -> /usr/bin/zstd

```



这两个命令还能用在管道线中：

```shell
[lsjarch@LsjsArch test_io]$ ls /usr/bin | tail -n 5
zstd
zstdcat
zstdgrep
zstdless
zstdmt

```



`tail`的`-f`选项允许实时浏览文件，这在观察日志文件的进展时非常有用：

```shell
[lsjarch@LsjsArch test_io]$ tail -f /var/log/pacman.log 
[2022-01-03T02:13:05+0800] [PACMAN] Running 'pacman -S aprops'
[2022-01-03T02:13:12+0800] [PACMAN] Running 'pacman -S apropos'
[2022-01-03T13:53:28+0800] [PACKAGEKIT] synchronizing package lists
[2022-01-03T23:08:47+0800] [PACKAGEKIT] synchronizing package lists
[2022-01-03T23:46:13+0800] [ALPM] transaction started
[2022-01-03T23:46:13+0800] [ALPM] upgraded yay (11.0.2-1 -> 11.1.0-1)
[2022-01-03T23:46:13+0800] [PACKAGEKIT] upgraded yay (11.0.2-1 -> 11.1.0-1)
[2022-01-03T23:46:13+0800] [ALPM] transaction completed
[2022-01-03T23:46:13+0800] [ALPM] running '30-systemd-update.hook'...
[2022-01-03T23:46:13+0800] [ALPM] running '90-packagekit-refresh.hook'...

```

`tail`会持续监测这个文件，直到有新内容添加时会立即输出到屏幕，这会一直持续直到<kbd>ctrl</kbd>+<kbd>c</kbd>退出。



### 6.11	从 stdin 读取数据，并同时输出到 stdout 和文件

为了和管道隐喻保持一致，Linux提供了一个名为`tee`的命令。

`tee`会制造一个“tee”并安装在管道上，`tee`程序从标准输入读入数据，并且同时复制数据到标准输出（允许数据继续随着管道线流动）和一个或多个文件。这对某个中间处理阶段捕获一个管道线内容时非常有帮助；

```shell
# 通过 tee 实现在 grep 过滤管道线内容之前，捕获整个目录列表到文件 test_tee.txt
[lsjarch@LsjsArch test_io]$ ls /usr/bin | tee test_tee.txt | grep zip
bunzip2
bzip2
bzip2recover
gunzip
gzip
zipcmp
zipmerge
ziptool
[lsjarch@LsjsArch test_io]$ ls -l test_tee.txt 
-rw-r--r-- 1 lsjarch lsjarch 23065  1月  4 00:55 test_tee.txt

```

*****







## 七、shell 中的展开模式

本章命令：`echo`。

开始之前，先来看一下`echo`的文档吧：

```shell
[lsjarch@LsjsArch ~]$ help echo
echo: echo [-neE] [参数 ...]
    将参数写到标准输出。
    
    在标准输出上，显示用空格分割的 ARG 参数后跟一个换行。
    
    选项：
      -n        不要追加换行
      -e        启用下列反斜杠转义的解释
      -E        显式地抑制对于反斜杠转义的解释
    
    `echo' 对下列反斜杠字符进行转义：
        警告(响铃)
      \b        退格
      \c        抑制更多的输出
      \e        转义字符
      \f        换页字符
      \n        换行
      \r        回车
      \t        横向制表符
      \v        纵向制表符
      \\        反斜杠
      \0nnn     以 NNN（八进制）为 ASCII 码的字符。NNN 可以是 0 到 3 个八进制位
      \xHH      以 HH（十六进制）为值的八比特字符。HH 可以是一个或两个十六进制位
      \uHHHH    以 HHHH（十六进制）为值的 Unicode 字符。HHHH 可以是一个到四个十六进制位。
      \UHHHHHHHH 以 HHHHHHHH（十六进制）为值的 Unicode 字符。HHHHHHHH 可以是一到八个十六进制位。
    
    退出状态：
    返回成功除非有写错误发生。
```



### 7.1	字符展开

每一次从输入命令到摁下<kbd>Enter</kbd> bash执行命令之前，bash 会对输入的字符进行展开。让我们用`echo`来说明：

`echo`：是一个 shell 内部命令，用来在标准输出中打印它的所有文本参数；

```shell
[lsjarch@LsjsArch test_io]$ echo this is echo test
this is echo test

[lsjarch@LsjsArch test_io]$ echo *
ls-error.txt ls-output.txt ls-wrong.txt test1.txt test_cat.txt test_tee.txt
[lsjarch@LsjsArch test_io]$ mkdir test_echo
[lsjarch@LsjsArch test_io]$ echo *
ls-error.txt ls-output.txt ls-wrong.txt test1.txt test_cat.txt test_echo test_tee.txt

```

为什么`echo`不打印 “*” 呢？因为此处 shell 将通配符 * 展开成当前工作目录下全部文件或目录的名字（或任何符合条件的字符），然后再调用命令`echo`。

### 7.2	路径名展开

上面通配符的工作机制称为路径名展开。再来试试：

```shell
[lsjarch@LsjsArch ~]$ ls
cd  Desktop  Documents  Downloads  Music  Pictures  Postman  Public  Templates  test_io  Videos
[lsjarch@LsjsArch ~]$ echo D*
Desktop Documents Downloads
[lsjarch@LsjsArch ~]$ echo [[:upper:]]*
Desktop Documents Downloads Music Pictures Postman Public Templates Videos
[lsjarch@LsjsArch ~]$ echo /usr/*/share
/usr/*/share

```



***关于隐藏文件路径名的展开***

当使用 `echo *`这样并不会显示隐藏文件。那么，若加上一个圆点开头呢？

```shell
[lsjarch@LsjsArch ~]$ ls -a
.              .bash_profile  .config    .gtkrc-2.0  .lesshst  Pictures  .python_history  Videos      .Xauthority
..             .bashrc        Desktop    .icons      .local    .pki      Templates        .viminfo    .xprofile
.bash_history  .cache         Documents  .java       .mozilla  Postman   test_io          .vscode
.bash_logout   cd             Downloads  .kde4       Music     Public    .themes          .wget-hsts
[lsjarch@LsjsArch ~]$ echo *
cd Desktop Documents Downloads Music Pictures Postman Public Templates test_io Videos
[lsjarch@LsjsArch ~]$ echo .*
. .. .bash_history .bash_logout .bash_profile .bashrc .cache .config .gtkrc-2.0 .icons .java .kde4 .lesshst .local .mozilla .pki .python_history .themes .viminfo .vscode .wget-hsts .Xauthority .xprofile

```

奇怪的是，. 和 .. 这两个字符也被输出了，但这表示的是当前目录及其父目录。因此，使用`echo .*`命令可能会导致错误。

换个命令试试：

```shell
[lsjarch@LsjsArch ~]$ ls -d .* | less
# 输出结果是
.
..
.bash_history
.bash_logout
.bash_profile
.bashrc
.cache
.config
.gtkrc-2.0
.icons
.java
.kde4
.lesshst
.local
.mozilla
.pki
.python_history
.themes
.viminfo
.vscode
.wget-hsts
.Xauthority
.xprofile

# 让我们更精确一些
[lsjarch@LsjsArch ~]$ ls -d .[!.]?* 
.bash_history  .bashrc  .gtkrc-2.0  .kde4     .mozilla         .themes   .wget-hsts
.bash_logout   .cache   .icons      .lesshst  .pki             .viminfo  .Xauthority
.bash_profile  .config  .java       .local    .python_history  .vscode   .xprofile
# 这表示显示文件名第一个字符为 . 且第二个字符不为 . 且至少还有一个字符的文件。这个命令能够列出大多数隐藏文件，但仍不能包含以多个圆点开头的文件名

```



### 7.3	波浪线展开

波浪线字符`~`用在一个单词开头时，它会展开成指定用户的家目录名，如果没有指定用户名则默认是当前用户的家目录；

```shell
[lsjarch@LsjsArch ~]$ echo ~
/home/lsjarch

```

### 7.4	算数表达式展开

shell 允许算数表达式通过展开来执行；算数表达式只支持整数，且操作有+、-、*、/、%、**(取幂)五种。

```shell
[lsjarch@LsjsArch ~]$ echo $((1+1))
2

# 表达式中空格并不重要，并且支持嵌套
[lsjarch@LsjsArch ~]$ echo $(($((5**2))*  3))
75
[lsjarch@LsjsArch ~]$ echo $(((5**2)*3))
75

[lsjarch@LsjsArch ~]$ echo $((5/2))
2
# 注意到，小数部分会直接舍弃
```

### 7.5	花括号展开

通过花括号展开，可以从一个包含花括号的模式中创建多个文本字符串：

```shell
[lsjarch@LsjsArch ~]$ echo Front-{A,B,C}-Back
Front-A-Back Front-B-Back Front-C-Back

```

花括号展开模式可能包含一个开头部分叫做报头，一个结尾部分叫做附言。花括号表达式本身可能包含一个由逗号分开的字符串列表，或者一系列整数，或者单个字符串，但不能是空白字符：

```shell
[lsjarch@LsjsArch ~]$ echo Number_{1..5}
Number_1 Number_2 Number_3 Number_4 Number_5

[lsjarch@LsjsArch ~]$ echo {Z..A}
Z Y X W V U T S R Q P O N M L K J I H G F E D C B A

# 支持嵌套
[lsjarch@LsjsArch ~]$ echo a{A{1,2},B{2,3}}b
aA1b aA2b aB2b aB3b

```

花括号展开有什么用？最普遍的应用是，创建一系列的文件或目录列表：

```shell
[lsjarch@LsjsArch ~]$ mkdir test_{}
[lsjarch@LsjsArch ~]$ cd test_\{\}/
[lsjarch@LsjsArch test_{}]$ mkdir {2021..2000}-{7,6}
[lsjarch@LsjsArch test_{}]$ ls
2000-6  2001-7  2003-6  2004-7  2006-6  2007-7  2009-6  2010-7  2012-6  2013-7  2015-6  2016-7  2018-6  2019-7  2021-6
2000-7  2002-6  2003-7  2005-6  2006-7  2008-6  2009-7  2011-6  2012-7  2014-6  2015-7  2017-6  2018-7  2020-6  2021-7
2001-6  2002-7  2004-6  2005-7  2007-6  2008-7  2010-6  2011-7  2013-6  2014-7  2016-6  2017-7  2019-6  2020-7

```

### 7.6	参数展开

参数展开的特性在 shell 脚本中比命令行中更有用。它的性能和系统存储小块数据、并给每块数据命名的能力有关。许多这样的小块数据，更应称为变量，可以通过`echo`展开：

```shell
[lsjarch@LsjsArch test_{}]$ echo $USER
lsjarch

```

这表示USER变量中存储的是用户名。若要查看有效的变量列表，试试这个命令：

```shell
[lsjarch@LsjsArch test_{}]$ printenv | less

```

如果误输入一个模式，展开就不会发生，`echo`命令只简单地显示误键入模式。如果输错变量名，展开仍会进行，只不过是一个空字符串。

### 7.7	命令替换

命令替换允许我们把一个命令的输出作为一个展开模式来使用：

```shell
[lsjarch@LsjsArch ~]$ echo $(ls)
Desktop Documents Downloads Music Pictures Postman Public Templates test_{} Videos

[lsjarch@LsjsArch ~]$ ls -l $(which cp)
-rwxr-xr-x 1 root root 129216  9月 29 21:56 /usr/bin/cp

```

这里将括号内命令的执行结果作为参数传递给`ls`命令。

不止简单命令，整个管道线也可以作为参数传递：

```shell
[lsjarch@LsjsArch ~]$ file $(ls /usr/bin/* | grep zip)
/usr/bin/bunzip2:      symbolic link to bzip2
/usr/bin/bzip2:        ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=bac992d1c92699d8fda1909fafa696cf522e3308, for GNU/Linux 3.2.0, stripped
/usr/bin/bzip2recover: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=8e6d08aa02feac4a5259e97f1d265805bcd06a39, for GNU/Linux 3.2.0, stripped
/usr/bin/gunzip:       POSIX shell script, ASCII text executable
/usr/bin/gzip:         ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=39185aae1a17013de5f71b72c83990b833fe13a2, for GNU/Linux 4.4.0, stripped
/usr/bin/zipcmp:       ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=06c8a61d22a392a3190a24dfa5e5c3cdd6c84e9c, for GNU/Linux 4.4.0, stripped
/usr/bin/zipmerge:     ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=1612e190206dfa272ac681c9b03b8f89d70de45e, for GNU/Linux 4.4.0, stripped
/usr/bin/ziptool:      ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=2ae0a15c96381cfa5f9a671200a1785f252b3afe, for GNU/Linux 4.4.0, stripped
streamzip:             cannot open `streamzip' (No such file or directory)
zipdetails:            cannot open `zipdetails' (No such file or directory)

```

另外，在旧版 shell 程序中，\` \`  可以代替`$()`。

### 7.8	引用

shell 使用引用机制来有选择地禁止不需要的展开：

```shell
[lsjarch@LsjsArch ~]$ echo this is a   test
this is a test
# shell 从 echo 命令的参数列表中删除多余的空格

[lsjarch@LsjsArch ~]$ echo The total is $110.00
The total is 10.00
# 参数展开把 $1 展开为一个空字符串，因为1是没有定义的变量
```

***引用有两种类型：***

* 双引号

  * 如果将文本放在双引号中，shell 使用的特殊字符，除 $ 和 \ 以及 ‘ 之外，都将失去其特殊含义。

  * 这意味着单词分割、路径名展开、波浪线展开、花括号展开等方式都将被禁止。而参数展开、算数展开和命令替换仍可执行；

    ```shell
    [lsjarch@LsjsArch test_quote]$ echo "$USER $((1+1)) $(cal)"
    lsjarch 2       一月 2022     
    一 二 三 四 五 六 日
                    1  2
     3  4  5  6  7  8  9
    10 11 12 13 14 15 16
    17 18 19 20 21 22 23
    24 25 26 27 28 29 30
    31 
    ```

    

  * 使用双引号，可以处理包含空格的文件名：

    ```shell
    [lsjarch@LsjsArch test_quote]$ cat > "double quotation marks test.txt"
    hello,world
    [lsjarch@LsjsArch test_quote]$ ls
    'double quotation marks test.txt'
    
    ```

    借此可以防止单词分割，得到期望结果

  * 先来回顾一下单词分割机制中对空格的处理：默认情况下，单词分割机制会在单词中寻找空格、制表符、换行符，并将其看作单词之间的界定符。而双引号内单词分割被禁止，内嵌空格不再被当作分隔符：

    ```shell
    [lsjarch@LsjsArch test_quote]$ echo this is a    test
    this is a test
    [lsjarch@LsjsArch test_quote]$ echo "this is a    test"
    this is a    test
    
    [lsjarch@LsjsArch test_quote]$ echo $(cal)
    一月 2022 一 二 三 四 五 六 日 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
    [lsjarch@LsjsArch test_quote]$ echo "$(cal)"
          一月 2022     
    一 二 三 四 五 六 日
                    1  2
     3  4  5  6  7  8  9
    10 11 12 13 14 15 16
    17 18 19 20 21 22 23
    24 25 26 27 28 29 30
    31
    ```

    理解第二个例子，事实上单词分割机制将换行符看作界定符，而这对命令替换产生了一个微妙的影响。前者实例没有引用的命令替换导致命令行包含40个参数，后者只有一个参数，参数内包括嵌入的空格和换行符。

* 单引号

  * 要禁止所有的展开，就要使用单引号`' '`。理解下面这个例子：

    ```shell
    [lsjarch@LsjsArch test_quote]$ echo text ~/*.txt {a,b} $(echo foo) $((1+1)) $USER
    text /home/lsjarch/*.txt a b foo 2 lsjarch
    
    [lsjarch@LsjsArch test_quote]$ echo "text ~/*.txt {a,b} $(echo foo) $((1+1)) $USER"
    text ~/*.txt {a,b} foo 2 lsjarch
    
    [lsjarch@LsjsArch test_quote]$ echo 'text ~/*.txt {a,b} $(echo foo) $((1+1)) $USER'
    text ~/*.txt {a,b} $(echo foo) $((1+1)) $USER
    
    ```

    随着引用的增强，越来越多的展开被禁止。

### 7.9	转义字符

使用转义字符可以消除文件名中一个特殊字符的含义，可以有地阻止展开：

```shell
[lsjarch@LsjsArch test_quote]$ echo "The balance for user $USER is: \$50.00"
The balance for user lsjarch is: $50.00

```

***反斜杠转义字符序列：***

*反斜杠作为转义字符外，也是一种表示法的一部分。这种表示法代表控制码，如ASCII编码表中前32个字符。*

*反斜杠表示法来自于C语言。`echo`命令带上`-e`选项，能够解释转义序列。*

```shell
# 利用sleep命令和转义字符，创建一个简单倒数计数器
[lsjarch@LsjsArch ~]$ sleep 10; echo -e "Time's up \a"
Time's up 

# 也可以将转义序列放在$' '中
[lsjarch@LsjsArch ~]$ sleep 10; echo "Time's up" $'\a'
Time's up 

```



### 7.10	拓展阅读

* Bash 手册页有主要段落来讲述展开和引用，它们的介绍更高效准确；
* Bash 参考手册也包含介绍展开和引用的章节：<https://www.gnu.org/software/bash/manual/bashref.html>

*****







## 八、键盘高级操作技巧

命令行最重要的目标就是——懒，懒得只用简写英文单词作命令、用最少的击键次数完成最多的工作、手指不必离开键盘去使用鼠标。

本章命令：`clear`, `history`。

### 8.1	命令行编辑

Bash 使用了 Readline 库来实现命令行编辑，Readline 库是共享的线程集合，可以被不同的程序使用。

接下来，我们学习一些键盘操作。不过要注意，下面一些组合键可能会被GUI界面拦截，但使用虚拟控制台时所有按键组合都会正确工作。

### 8.2	移动光标

| 按键                         | 行动                       |
| ---------------------------- | -------------------------- |
| <kbd>ctrl</kbd>+<kbd>a</kbd> | 移动光标到行首             |
| <kbd>ctrl</kbd>+<kbd>e</kbd> | 移动光标到行尾             |
| <kbd>ctrl</kbd>+<kbd>f</kbd> | 光标前移一个字符，同右箭头 |
| <kbd>ctrl</kbd>+<kbd>b</kbd> | 光标后移一个字符，同左箭头 |
| <kbd>alt</kbd>+<kbd>f</kbd>  | 光标前移一个字             |
| <kbd>alt</kbd>+<kbd>b</kbd>  | 光标后移一个字             |
| <kbd>ctrl</kbd>+<kbd>l</kbd> | 清空屏幕，同`clear`命令    |

### 8.3	修改文本

| 按键                         | 行动                                   |
| ---------------------------- | -------------------------------------- |
| <kbd>ctrl</kbd>+<kbd>d</kbd> | 删除光标位置的字符                     |
| <kbd>ctrl</kbd>+<kbd>t</kbd> | 光标位置的字符和光标前面的字符互换位置 |
| <kbd>alt</kbd>+<kbd>t</kbd>  | 光标位置的字和其前面的字互换位置       |
| <kbd>alt</kbd>+<kbd>l</kbd>  | 把从光标位置到字尾的字符转换成小写字符 |
| <kbd>alt</kbd>+<kbd>u</kbd>  | 把从光标位置到字尾的字符转换成大写字符 |

### 8.4	剪切和粘贴文本

Readline 文档使用术语`killing`和`yanking`来指我们常说的剪切和粘贴。剪切下来的文本被存储在一个叫做剪切环`kill-ring`的缓冲区中。

| 按键                                | 行动                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| <kbd>ctrl</kbd>+<kbd>k</kbd>        | 剪切从光标位置到行尾的文本                                   |
| <kbd>ctrl</kbd>+<kbd>u</kbd>        | 剪切从光标位置到行首的文本                                   |
| <kbd>alt</kbd>+<kbd>d</kbd>         | 剪切从光标位置到词尾的文本                                   |
| <kbd>alt</kbd>+<kbd>backspace</kbd> | 剪切从光标位置到词头的文本。如果光标在一个单词的开头，则剪切前一个单词 |
| <kbd>ctrl</kbd>+<kbd>y</kbd>        | 把剪切环中的文本粘贴到光标位置                               |

### 8.5	自动补全

<kbd>tab</kbd>键可以完成键入命令时自动补全的工作。

自动补全不仅可以补全当前工作目录下包含已输入字符的唯一路径，还可以补全变量（需要以 $ 开头）、补全用户名（ ~ 开头）、补全命令、补全主机名（ @ 开头，并且包含在/etc/hosts 文件中）。

*自动补全相关的组合键*：

| 按键                        | 行动                                                         |
| --------------------------- | ------------------------------------------------------------ |
| <kbd>alt</kbd>+<kbd>?</kbd> | 显示可能的自动补全列表。在大多数系统中，可以通过连按两次<kbd>tab</kbd>键来完成 |
| <kbd>alt</kbd>+<kbd>*</kbd> | 插入所有可能的自动补全。当需要使用多个匹配项时，非常有帮助   |

**可编程自动补全：**

可编程自动补全允许加入额外的自动补全规则。通常，用来为一个命令的选项列表，或者一个应用程序支持的特殊文件类型加入自动补全，并且需要加入特定程序的支持。

可编程自动补全是由 shell 函数实现的，shell 函数是一种小巧的 shell 脚本，后面会学习到，现在，可以尝试下`set | less`来找到它们。

### 8.6	利用历史命令

bash 会维护家目录下`.bash_history`文件，其中保存着已经执行过的命令的历史列表，当然，是当前用户的；

#### 8.6.1	搜索历史命令

```shell
[lsjarch@LsjsArch ~]$ history | less

```

默认情况下，bash 会保存最后输入的500个命令。

比如说，我们想要获取历史命令中有关目录 /usr/bin 内容的命令：

```shell
[lsjarch@LsjsArch ~]$ history | grep /usr/bin
  284  ls -l /usr/bin > test_io/ls-output.txt
  298  ls -l /usr/bin >> ls-output.txt 
  300  ls -l /usr/bin 2> ls-error.txt
  302  ls -l /usr/bin 2> ls-error.txt
  338  ls -l /usr/bin | less
  339  ls /bin /usr/bin | sort | less
  340  ls /bin /usr/bin | sort | uniq | less
  345  ls /bin /usr/bin | sort | uniq | wc 
  346  ls /bin /usr/bin | sort | uniq | grep zip
  347  head -n 8 /usr/bin
  349  ls -l /usr/bin > ls-output.txt 
  353  ls /usr/bin | tail -n 5
  357  ls /usr/bin | tee test_tee.txt | grep zip
  359  ls /usr/bin | tee test_tee.txt | grep zip
  407  file $(ls /usr/bin/* | grep zip)
  449  history | grep /usr/bin

```

第一个字段的数字表示这个命令在历史列表中的行号，随后在使用到`历史命令展开`时，我们会用到这个数字：

```shell
[lsjarch@LsjsArch ~]$ !346
ls /bin /usr/bin | sort | uniq | grep zip
bunzip2
bzip2
bzip2recover
gunzip
gzip
zipcmp
zipmerge
ziptool

```

bash 会将`!346`展开成历史列表中346行的内容。

bash 还具有按递增顺序来搜索历史列表的能力。即随着字符输入，我们可以一步步提高对历史列表的搜索能力。启动递增搜索：

```shell
# ctrl+r，命令行会变成这样。提示符改变，表示我们正在执行反向递增搜索，即从“当前”向“过去某个时间段”的顺序搜索
(reverse-i-search)`': 

# 之后输入要查找的文本，此处是 /usr/bin
(reverse-i-search)`/usr/bin': ls -l /usr/bin | less

# 按下 Enter 键即可执行这个命令，或者输入 ctrl+j，这个命令就会从历史命令中复制到当前命令行

# 再次输入 ctrl+r ，来找到下一个匹配项

```

一些操作历史列表的键盘组合键：

| 按键                         | 行为                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| <kbd>ctrl</kbd>+<kbd>p</kbd> | 移动到上一个历史条目，类似于上箭头键                         |
| <kbd>ctrl</kbd>+<kbd>n</kbd> | 移动到下一个历史条目，类似于下箭头键                         |
| <kbd>alt</kbd>+<kbd><</kbd>  | 移动到历史列表开头                                           |
| <kbd>alt</kbd>+<kbd>></kbd>  | 移动到历史列表结尾，即当前命令行                             |
| <kbd>ctrl</kbd>+<kbd>r</kbd> | 反向递增搜索，从当前命令行开始，向上递增搜索                 |
| <kbd>alt</kbd>+<kbd>p</kbd>  | 反向搜索，但不是递增。输入查询字符串，按下Enter进行搜索      |
| <kbd>alt</kbd>+<kbd>n</kbd>  | 向前搜索，非递增顺序                                         |
| <kbd>ctrl</kbd>+<kbd>o</kbd> | 执行历史列表中的当前项，并移到下一个。这对执行历史列表中的一系列命令非常方便 |



#### 8.6.2	展开历史命令

除了使用`！`字符可以展开对应行数的历史命令，还有：

| 序列     | 行为                                               |
| -------- | -------------------------------------------------- |
| !!       | 重复最后一次执行的命令。可能按下上箭头键更简单些（ |
| !number  | 重复历史列表中第 number 行的命令                   |
| !string  | 重复最近历史列表中，以这个字符串开头的命令         |
| !?string | 重复最近历史列表中，包含这个字符串的命令           |

应该小心使用`!string`和`!?string`，除非你完全信任历史列表条目的内容。



历史展开机制比较晦涩，更多的说明可以参考 bash 手册页的 HISTORY EXPANSION 部分。

另外，除了 bash 中有命令历史特性，shell 会话也是可以被记录的。它们多是被 script 程序存储在一个文件中，其基本语法是`script [file]`，如果没有指定 file 名，则会使用文件 typesrcipt。查看 script 手册页，可以得到关于 script 程序选项和特点的完整列表



### 8.7	拓展阅读

* 一篇关于计算机终端的好文章：<https://en.wikipedia.org/wiki/Computer_terminal>

*****







## 九、权限

传统Unix操作系统不同于MS-DOS系统，它是多任务多用户系统，即多个用户可以在同一时间使用同一台计算机，即使是远程用户通过SSH(secure shell)登录也可以操纵此电脑，只要该电脑连接到网络。

权限就是用来管理不同用户使用同一电脑的策略。除管理员用户外，普通用户行为既不能导致计算机崩溃，也不应该修改其他用户的文件。

本章命令：`id`, `chmod`, `umask`, `su`, `sudo` ,`chown`, `chgrp`, `passwd`。

### 9.1	拥有者，组成员，其他人

 在Unix安全模型中，当一个用户拥有一个文件或目录时，用户对这个文件或目录的访问权限拥有控制权；而用户又属于若干用户组成的用户组，用户组成员由文件和目录的所有者授予的对文件和目录的访问权限。

`id`：查找自己的身份信息；

```shell
[lsjarch@LsjsArch ~]$ id
用户id=1000(lsjarch) 组id=1000(lsjarch) 组=1000(lsjarch),998(wheel)

```

用户账户定义在`/etc/passwd`中，其中定义了用户名、uid、gid、帐号的真实姓名、家目录和登录shell，还有root用户(uid 0)的帐号以及各种各样的系统用户；

用户组定义在`/etc/group`中；

当用户账户和用户组创建后，这些文件随着`/etc/shadow`的变动而修改，`/etc/shadow`包含了关于用户密码的信息。

### 9.2	读取，写入，执行

文件和目录的访问权限由读访问、写访问、执行访问三项来定义。来看下权限的实现：

```shell
[lsjarch@LsjsArch ~]$ mkdir test_authority
[lsjarch@LsjsArch ~]$ cd test_authority
[lsjarch@LsjsArch test_authority]$ > test1.txt
[lsjarch@LsjsArch test_authority]$ mkdir test2
[lsjarch@LsjsArch test_authority]$ ln -s test1.txt test1.sym

[lsjarch@LsjsArch test_authority]$ ls -l
总用量 4
lrwxrwxrwx 1 lsjarch lsjarch    9  1月  5 01:17 test1.sym -> test1.txt
-rw-r--r-- 1 lsjarch lsjarch    0  1月  5 01:06 test1.txt
drwxr-xr-x 2 lsjarch lsjarch 4096  1月  5 01:16 test2

```

`ls -l`的结果列表第一字段，就表示了文件的属性。

之前学习到，第一个字符`-, d, l`分别 表示普通文件、目录、符号链接，要注意符号链接的文件属性总是`rwxrwxrwx`，事实上这是虚拟值，真正的文件属性是指符号链接所指向的文件的属性。第一个字符还可以是`c, b`，分别表示字符设备文件和块设备文件，字符设备文件是按照字节流来处理数据的设备，比如终端机、调制解调器；块设备文件是按照数据块来处理数据的设备，比如硬盘、CD-ROM盘。

之后九个字符，每三个一组，分别代表文件所有者、文件组所有者、其他人的读、写、执行的权限。设置权限后，rwx的权限属性会对文件或目录产生以下影响：

| 属性 | 文件                                                         | 目录                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| r    | 允许打开并读取文件内容                                       | 允许列出目录中的内容，前提是目录必须设置了可执行属性 x       |
| w    | 允许写入文件内容或截断文件，但是不允许对文件进行重命名或删除。重命名或删除是由目录的属性决定的 | 允许在目录下新建、删除或重命名文件，前提是目录必须设置了可执行属性 x |
| x    | 允许将文件作为程序来执行，使用脚本语言编写的程序必须设置为可读才能被执行 | 允许进入目录                                                 |

下面是权限属性的一些例子：

| 文件属性   | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| -rwx------ | 普通文件，对文件所有者来说可读、写、执行，其他人无法访问     |
| -rw------- | 普通文件，对文件所有者来说可读、写，其他人无法访问           |
| -rw-r--r-- | 普通文件，对文件所有者来说可读、写，文件所有者的组成员可读，其他所有人也可读 |
| -rwxr-xr-x | 普通文件，对文件所有者来说可读、写、执行，也可以被组成员、其他所有人读、执行 |
| -rw-rw---- | 普通文件，对文件所有者和文件所有者的组成员可读、写           |
| lrwxrwxrwx | 符号链接                                                     |
| drwxrwx--- | 目录，文件所有者及其组成员可以访问目录，且可以在目录下新建、删除、重命名文件 |
| drwxr-x--- | 目录，文件所有者可以访问该目录并在目录下新建、删除、重命名文件，文件所有者的组成员可以访问目录，但不能新建、删除、重命名文件 |



### 9.3	更改文件模式

`chmod`：更改文件或目录的模式。只有文件所有者或超级用户才有权限修改文件或目录的模式。

`chmod`支持八进制数字表示法和符号表示法两种方法来改变文件模式；

* 八进制表示法：每个八进制数字代表了3个二进制数字，正好映射到文件的模式方案：

  | 十进制 | 二进制 | 文件模式 |
  | ------ | ------ | -------- |
  | 0      | 000    | ---      |
  | 1      | 001    | --x      |
  | 2      | 010    | -w-      |
  | 3      | 011    | -wx      |
  | 4      | 100    | r--      |
  | 5      | 101    | r-x      |
  | 6      | 110    | rw-      |
  | 7      | 111    | rwx      |

  试着修改文件的权限：

  ```shell
  # 之前的权限
  -rw-r--r-- 1 lsjarch lsjarch    0  1月  5 01:06 test1.txt
  
  # 修改权限
  [lsjarch@LsjsArch test_authority]$ chmod 600 test1.txt 
  [lsjarch@LsjsArch test_authority]$ ls -l test1.txt 
  -rw------- 1 lsjarch lsjarch 0  1月  5 01:06 test1.txt
  
  ```

  

* 符号表示法：其中有三个部分，更改会影响谁、要执行哪个操作、要设置哪种权限：

  * 指定要影响的对象：

    | 影响对象 | 解释                                 |
    | -------- | ------------------------------------ |
    | u        | user的简写，意思是文件或目录的所有者 |
    | g        | 用户组                               |
    | o        | others的简写，意思是其他所有人       |
    | a        | all的简写，是u、g、o的联合           |

    如果没有指定，则默认使用 all 。

  * 执行的操作用 + 和 - 分别表示加上一个权限或减去一个权限，= 表示赋予权限；

  * 符号表示法的实例：

    | 符号表示  | 含义                                                         |
    | --------- | ------------------------------------------------------------ |
    | u+x       | 为文件所有者添加执行权限                                     |
    | u-x       | 删除文件所有者的执行权限                                     |
    | +x        | 为 all 添加可执行权限                                        |
    | o-rw      | 除了文件所有者和其用户组，，删除其他人的读写权限             |
    | go=rw     | 为群组的主人和任意文件拥有者的人赋予读写权限。如果群组的主人或全局之前已经有了执行权限，则会被移除 |
    | u+x,go=rw | 给文件所有者执行权限并给组和其他人读和执行权限，多种设定用逗号分隔 |
    
    

  * 符号表示法的优点之一在于，允许设置文件模式的单个组成部分的属性，而不影响其他部分。

最后来看一下`chmod`的文档吧：

```shell
[lsjarch@LsjsArch test_authority]$ chmod --help 
用法：chmod [选项]... 模式[,模式]... 文件...
　或：chmod [选项]... 八进制模式 文件...
　或：chmod [选项]... --reference=参考文件 文件...
将每个文件的权限模式变更至指定模式。
使用 --reference 选项时，把指定文件的模式设置为与参考文件相同。

  -c, --changes             类似 verbose 选项，但仅在做出修改时进行报告
  -f, --silent, --quiet     不显示大多数错误消息
  -v, --verbose             输出各个处理的文件的诊断信息
      --no-preserve-root    不特殊对待“/”（默认行为）
      --preserve-root       不允许在“/”上递归操作
      --reference=参考文件  使用参考文件的模式而非给定模式的值
  -R, --recursive           递归修改文件和目录。但不总是如我们期望地有用，因为文件和目录的权限常常不是相同的
      --help                显示此帮助信息并退出
      --version             显示版本信息并退出

每个模式字符串都应该匹配如下格式："[ugoa]*([-+=]([rwxXst]*|[ugo]))+|[-+=][0-7]+"。
```



### 9.4	设置默认权限

`umask`：在创建文件时控制文件的默认权限。使用八进制表示法来表达从文件模式属性中删除一个位掩码：

```shell
[lsjarch@LsjsArch test_authority]$ ls
test1.sym  test1.txt  test2
[lsjarch@LsjsArch test_authority]$ umask 
0022
# 0022是当前umask的八进制掩码值

[lsjarch@LsjsArch test_authority]$ > test_umask.txt
[lsjarch@LsjsArch test_authority]$ ls -l test_umask.txt 
-rw-r--r-- 1 lsjarch lsjarch 0  1月  5 02:44 test_umask.txt
# 可以看到，此时 test_umask.txt 的权限是文件所有者可以读写、用户组和其他用户只能读

#现在，设置新的 umask 值
[lsjarch@LsjsArch test_authority]$ rm test_umask.txt 
[lsjarch@LsjsArch test_authority]$ umask 0000
[lsjarch@LsjsArch test_authority]$ > test_umask.txt
[lsjarch@LsjsArch test_authority]$ ls -ls test_umask.txt 
0 -rw-rw-rw- 1 lsjarch lsjarch 0  1月  5 02:50 test_umask.txt
# 可以看到，修改 umask 的值后，新创建的 test_umask.txt 的权限与原先不同，变成了所有人都可读写

```

事实上，来看看掩码的八进制形式与权限的对应情况：

| Original file mode | --- rw- rw- rw- |
| ------------------ | --------------- |
| Mask               | 000 000 010 010 |
| Result             | --- rw- r-- r-- |
|                    |                 |
| Original file mode | --- rw- rw- rw- |
| Mask               | 000 000 000 000 |
| Result             | --- rw- rw- rw- |

这下可以明显的看到，掩码中 1 会将对应位置上的属性删除。

最后，不要忘记清理现场：

```shell
[lsjarch@LsjsArch test_authority]$ rm test_umask.txt 
[lsjarch@LsjsArch test_authority]$ umask 0022
[lsjarch@LsjsArch test_authority]$ umask
0022
```



**一些特殊权限**

虽然上面八进制的权限设置都使用三位表示，但技术上讲用四位表示更加确切，这是因为除了读、写、执行还有其他特殊权限：

* `setuid`位：八进制为4000，作用是当应用到一个可执行文件时把有效用户ID从实际运行程序的用户设置成程序所有者的ID。

  通常会应用到一些由超级用户所拥有的程序。当普通用户运行一个由超级用户所有的程序，且它已经设置了`setuid`位，则这个程序在运行时拥有超级用户的权限，可以访问普通用户禁止访问的文件或目录。显然，这可能引发安全问题，所以设置了`setuid`的程序数量必须尽量小；

* `setgid`位：八进制为2000，类似于`setuid`，只不过是将有效用户组ID从真正用户组ID修改为文件所有组的ID。

  如果设置了一个目录的`setgid`位，则目录中新创建的文件具有这个目录用户组的所有权，而不是文件创建者所属用户组的所有权。对共享目录来说，当一个普通用户组中成员需要访问共享目录中的所有文件，而不管文件所有者的主用户组时，设置`setgid`位很有用；

* `sticky`位：八进制为1000，继承自Unix，这表示“不可交换的”。在Linux中，会忽略`sticky`位，但如果设置了则会阻止用户删除或重命名文件，除非用户是这个目录或文件的所有者、或是超级用户。这个位经常用来控制访问共享目录，如 /tmp。

用`chmod`来设置特殊权限：

```shell
# 首先，设置一个程序 setuid 权限
chmod u+s program
# 下一步，授予一个目录 setgid 权限
chmod g+s dir
# 最后，授予一个目录 sticky 权限
chmod +t dir

# 当浏览 ls 命令的输出结果时，可以确定这些特殊权限
# 设置为 setuid 的程序
-rwsr-xr-x
# 设置为 setgid 的目录
drwxrwsr-x
# 设置为 sticky 的目录
drwxrwxrwt
```



### 9.5	更改身份

有三种方式可以更改身份：

* 注销系统并以其他用户身份重新登录；
* 使用`su`命令：允许假定为另一个用户的身份并以该用户的ID启动一个新的shell会话，或者是以这个用户的身份发布一个命令；
* 使用`sudo`命令：允许一个管理员设置`/etc/sudoers`文件并定义一些具体可使用的命令，供当前身份用户获取管理员权限

### 9.6 `su`

`su`：以其他用户身份和组ID来运行一个shell；

```shell
[lsjarch@LsjsArch ~]$ su -h

用法：
 su [选项] [-] [<用户> [<参数>...]]

Change the effective user ID and group ID to that of <user>.
A mere - implies -l.  If <user> is not given, root is assumed.

选项：
 -m, -p, --preserve-environment      不重置环境变量
 -w, --whitelist-environment <list>  don't reset specified variables

 -g, --group <组>                指定主组
 -G, --supp-group <group>        specify a supplemental group

 -, -l, --login                  使 shell 成为登录 shell
 -c, --command <命令>            使用 -c 向 shell 传递一条命令
 --session-command <命令>        使用 -c 向 shell 传递一条命令而不创建新会话
 -f, --fast                      向shell 传递 -f 选项(csh 或 tcsh)
 -s, --shell <shell>             若 /etc/shells 允许，运行<shell>
 -P, --pty                       create a new pseudo-terminal

 -h, --help                      显示此帮助
 -V, --version                   显示版本

```

可以看到，如果包含`-l`选项，`su`会为指定用户启动一个需要登录的shell，这个选项可以简写为`-`；若没有指定用户，则默认是超级用户：

```shell
[lsjarch@LsjsArch ~]$ su -
密码： 
[root@LsjsArch ~]# 

[root@LsjsArch ~]# pwd
/root

[root@LsjsArch ~]# exit
logout
[lsjarch@LsjsArch ~]$ 

```

注意，此处输入的密码是超级用户的密码，而不是当前用户的密码，这与`sudo`是不同的。之后，打开一个新的shell，切换到超级用户，此时的工作目录是超级用户的家目录`/root`。当完成工作后，输入`exit`退出超级用户，返回原来的shell。

也可以只执行单个命令，而不是启动一个新的可交互的shell：

```shell
[lsjarch@LsjsArch ~]$ su -c 'ls -l /root/*'
密码： 
-rw-r--r-- 1 root root 1995219 12月 29 09:09 /root/qv2ray-git-3080.dac7ed16.r.-1-x86_64.pkg.tar.zst
-rw-r--r-- 1 root root       0 12月 28 18:33 /root/visudo

```

注意，需要将要执行的命令用单引号引起，因为我们需要这条命令在新的shell中展开，而不是当前shell。

### 9.7	`sudo`

`sudo`：以另一个用户身份执行命令。

`sudo`有一个不同于`su`的功能，即管理员能够配置`sudo`从而允许一个普通用户以不同身份通过一种非常可控的方式来执行命令，尤其是只有一个用户可以执行若干特殊命令时。另一大差异是`sudo`不需要管理员用户的密码，而是**当前用户密码**。

`sudo`不会重新启动一个新的shell，也不会加载另一个用户的shell环境，意味着不用单引号将命令单独引起。

```shell
[lsjarch@LsjsArch ~]$ sudo --help
sudo - 以其他用户身份执行一条命令

usage: sudo -h | -K | -k | -V
usage: sudo -v [-ABknS] [-g group] [-h host] [-p prompt] [-u user]
usage: sudo -l [-ABknS] [-g group] [-h host] [-p prompt] [-U user] [-u user] [command]
usage: sudo [-ABbEHknPS] [-C num] [-D directory] [-g group] [-h host] [-p prompt] [-R directory] [-T timeout] [-u user]
            [VAR=value] [-i|-s] [<command>]
usage: sudo -e [-ABknS] [-C num] [-D directory] [-g group] [-h host] [-p prompt] [-R directory] [-T timeout] [-u user] file
            ...

选项：
  -A, --askpass                 使用助手程序进行密码提示
  -b, --background              在后台运行命令
  -B, --bell                    提示时响铃
  -C, --close-from=num          关闭所有 >= num 的文件描述符
  -D, --chdir=directory         运行命令前改变工作目录
  -E, --preserve-env            在执行命令时保留用户环境
      --preserve-env=list       保留特定的环境变量
  -e, --edit                    编辑文件而非执行命令
  -g, --group=group             以指定的用户组或 ID 执行命令
  -H, --set-home                将 HOME 变量设为目标用户的主目录
  -h, --help                    显示帮助消息并退出
  -h, --host=host               在主机上运行命令(如果插件支持)
  -i, --login                   以目标用户身份运行一个登录 shell；可同时指定一条命令
  -K, --remove-timestamp        完全移除时间戳文件
  -k, --reset-timestamp         无效的时间戳文件
  -l, --list                    列出用户权限或检查某个特定命令；对于长格式，使用两次
  -n, --non-interactive         非交互模式，不提示
  -P, --preserve-groups         保留组向量，而非设置为目标的组向量
  -p, --prompt=prompt           使用指定的密码提示
  -R, --chroot=directory        运行命令前改变根目录
  -S, --stdin                   从标准输入读取密码
  -s, --shell                   以目标用户运行 shell；可同时指定一条命令
  -T, --command-timeout=timeout 在达到指定时间限制后终止命令
  -U, --other-user=user         在列表模式中显示用户的权限
  -u, --user=user               以指定用户或 ID 运行命令(或编辑文件)
  -V, --version                 显示版本信息并退出
  -v, --validate                更新用户的时间戳而不执行命令
  --                            停止处理命令行参数

```

可以看到，通过添加选项`-l`可以了解`sudo`所授予的权限有哪些：

```shell
[lsjarch@LsjsArch ~]$ sudo -l
[sudo] lsjarch 的密码：
用户 lsjarch 可以在 LsjsArch 上运行以下命令：
    (ALL) ALL

```

### 9.8	更改文件所有者和用户组

`chown`：用来更改文件或目录的所有者和用户组。使用这个命令需要超级用户权限。

```shell
[lsjarch@LsjsArch ~]$ chown --help
用法：chown [选项]... [所有者][:[组]] 文件...
　或：chown [选项]... --reference=参考文件 文件...
修改每个<文件>的所有者和/或所属组为给定的<所有者>和/或<组>。
如同时使用 --reference，将每个给定<文件>的所有者和属组修改为<参考文件>
所具有的对应值。
  -c, --changes          类似 verbose 选项，但仅在做出修改时进行报告
  -f, --silent, --quiet  不显示大多数错误消息
  -v, --verbose          输出各个处理的文件的诊断信息
      --dereference      影响每个符号链接的原始引用文件（这是默认行为），而非符号链接本身
  -h, --no-dereference   只影响符号链接，而非被引用的任何文件(仅当系统支持更改符号链接的所有者时，该选项才有用）
      --from=当前所有者:当前所属组
                                只当每个文件的所有者和组符合选项所指定时才更改所
                                有者和组。其中一个可以省略，这时已省略的属性就不
                                需要符合原有的属性
      --no-preserve-root  不特殊对待“/”（默认行为）
      --preserve-root     不允许在“/”上递归操作
      --reference=<参考文件>  使用指定<参考文件>的所有者和所属组信息，而非手工指定 所有者:组 的值
  -R, --recursive        递归操作文件和目录

以下选项是在指定了 -R 选项时被用于设置如何遍历目录结构体系。如果您指定了多于一个选项，那么只有最后一个会生效。

  -H                     如果命令行参数是一个指向目录的符号链接，则对其
                         进行遍历
  -L                     遍历每一个遇到的指向目录的符号链接
  -P                     不遍历任何符号链接（默认）

      --help            显示此帮助信息并退出
      --version         显示版本信息并退出

如果没有指定所有者，则不会更改所有者信息。若所属组若没有指定也不会对其更改，但当加上 ':' 时 GROUP 会更改为指定所有者的主要组。所有者和所属组可以是
数字或名称。

示例：
  chown root /u         将 /u 的属主更改为"root"。
  chown root:staff /u   和上面类似，但同时也将其属组更改为"staff"。
  chown :staff /u       将其属组更改为"staff"，而属主不变
  chown user_name: /u        属主改为用户"user_name"，属组改为用户"user_name"登录系统时所属的用户组
  chown -hR root /u     将 /u 及其子目录下所有文件的属主更改为"root"。
```

来看一个假想环境的实例吧：

假如当前有两个用户——janet，拥有超级用户访问权限；tony，一个普通用户。如果janet想要从她的家目录复制一个文件到tony的家目录，并且希望tony也能够编辑这个文件：

```shell
[janet@linuxbox ~]$ sudo cp myfile.txt ~tony
Password:
[janet@linuxbox ~]$ sudo ls -l ~tony/myfile.txt
-rw-r--r-- 1 root root 8031 2008-03-20 14:30 /home/tony/myfile.txt
[janet@linuxbox ~]$ sudo chown tony: ~tony/myfile.txt
[janet@linuxbox ~]$ sudo ls -l ~tony/myfile.txt
-rw-r--r-- 1 tony tony 8031 2008-03-20 14:30 /home/tony/myfile.txt

```



### 9.9	更改用户组所有权

`chgrp`：更改用户组所有权。在旧Unix系统中，`chmod`只能修改文件所有权，而不是用户组所有权。而`chgrp`除了限制多一点外，用法和`chmod`几乎相同，而现代的Linux都支持使用`chmod`来更改文件所有者和用户组，故不赘述。

### 9.10	综合练习

依然假想9.8中的两个人——janet和tony，他们都有音乐CD收藏品，也都愿意设置一个共享目录。在这个共享目录中，他们分别以Ogg Vorbis或MP3的格式来存储他们的音乐文件，通过`sudo`命令，janet可以获取超级用户权限。

首先，janet创建一个以janet和tony为成员的用户组music：

```shell
[janet@linuxbox ~]$ sudo groupadd music
[janet@linuxbox ~]$ sudo usermod -g janet music
[janet@linuxbox ~]$ sudo usermod -g tony music

```

下一步，janet创建了存储音乐文件的目录：

```shell
[janet@linuxbox ~]$ sudo mkdir /usr/local/share/Music
password:

[janet@linuxbox ~]$ ls -ld /usr/local/share/Music
drwxr-xr-x 2 root root 4096 2008-03-21 18:05 /usr/local/share/Music
```

可以看到，这个目录由root用户拥有，且权限属性为755，为了使该目录共享——允许tony写入，janet需要修改目录用户组的所有权和权限：

```shell
[janet@linuxbox ~]$ sudo chown :music /usr/local/share/Music
[janet@linuxbox ~]$ sudo chmod 775 /usr/local/share/Music
[janet@linuxbox ~]$ ls -ld /usr/local/share/Music
drwxrwxr-x 2 root music 4096 2008-03-31 18:05 /usr/local/share/Music

```

现在，`/usr/local/share/Music`目录由root用户拥有，允许用户组music的成员读取和写入，其他用户能够列出目录中内容但不能创建或修改内容。

但仍有一个问题，通过当前权限在`/usr/local/share/Music`中创建的文件，只具有用户janet和tony的普通权限：

```shell
[janet@linuxbox ~]$ > /usr/local/share/Music/test_file
[janet@linuxbox ~]$ ls -l /usr/local/share/Music/test_file
-rw-r--r-- 1 janet janet 0 2008-03-24 20:03 test_file
```

这是因为两个问题：

* 系统默认的掩码是0022，这会禁止用户组成员编辑属于同组成员的文件。如果共享目录只包含文件，这就不是问题，但此时目录会存放音乐文件，通常音乐会根据艺术家和唱片的层次结构来组织分类，所以用户组成员需要在同组其他成员创建的目录中创建文件和目录。因此，我们应该将`umask`修改为0002；

* 用户组成员创建的文件和目录的用户组，将会设置为用户的主要组，而不是用户组music。这可以通过设置此目录的`setgid`位来解决：

  ```shell
  [janet@linuxbox ~]$ sudo chmod g+s /usr/local/share/Music
  [janet@linuxbox ~]$ ls -ls /usr/local/share/Music
  drwxrwsr-x 2 root music 4096 2008-03-24 20:03 /usr/local/share/Music
  ```

最后，测试一下结果：

```shell
[janet@linuxbox ~]$ umask 0002
[janet@linuxbox ~]$ rm /usr/local/share/Music/test_file

[janet@linuxbox ~]$ > /usr/local/share/Music/test_file
[janet@linuxbox ~]$ mkdir /usr/local/share/Music/test_dir
[janet@linuxbox ~]$ ls -l /usr/local/share/Music
drwxrwsr-x 2 janet music 4096 2008-03-04 20:24 test_dir
-rw-rw-r-- 1 janet music 0 2008-03-04 20:25 test_file

```

现在，创建的文件和目录都具有正确的权限，允许用户组music的所有成员在目录`/usr/local/share/Music`中创建文件和目录。

需要注意的是，修改`umask`的值只在当前shell 会话中有效，若当前shell会话结束后，必须重新设置。

### 9.11	修改用户密码

`passwd`：可以修改用户密码。

```shell
[lsjarch@LsjsArch ~]$ passwd
为 lsjarch 更改 STRESS 密码。
当前的密码： 
新的密码： 
重新输入新的密码： 
passwd：已成功更新密码

```

该命令拒绝接受太短的密码、与先前密码相似的密码、字典中的单词作为的密码、太容易猜到的密码等。

如果具有超级用户权限，可以指定一个用户名作为`passwd`的参数，以设置另一个用户的密码。

最后，看下`passwd`的帮助文档吧：

```shell
[lsjarch@LsjsArch ~]$ passwd --help
用法：passwd [选项] [登录名]

选项：
  -a, --all                     报告所有帐户的密码状态
  -d, --delete                  删除指定帐户的密码
  -e, --expire                  强制使指定帐户的密码过期
  -h, --help                    显示此帮助信息并退出
  -k, --keep-tokens             仅在过期后修改密码
  -i, --inactive INACTIVE       密码过期后设置密码不活动为 INACTIVE
  -l, --lock                    锁定指定的帐户
  -n, --mindays MIN_DAYS        设置到下次修改密码所须等待的最短天数
                                为 MIN_DAYS
  -q, --quiet                   安静模式
  -r, --repository REPOSITORY   在 REPOSITORY 库中改变密码
  -R, --root CHROOT_DIR         chroot 到的目录
  -S, --status                  报告指定帐户密码的状态
  -u, --unlock                  解锁被指定帐户
  -w, --warndays WARN_DAYS      设置过期警告天数为 WARN_DAYS
  -x, --maxdays MAX_DAYS        设置到下次修改密码所须等待的最多天数为 MAX_DAYS

```

### 9.12	拓展阅读

* 一篇关于 malware （恶意软件）的文章：<https://en.wikipedia.org/wiki/Malware>
* 一些命令行程序来创建和维护用户及用户组，请查看手册以了解：`adduser`, `useradd`, `groupadd`。

*****







## 十、进程

众所周知，多任务操作系统在宏观上并行，微观上串行。Linux内核通过使用进程，来安排不同的程序等待使用CPU，以管理多任务。

本章将学习一些可用的命令行工具，来帮助查看程序的执行状态，以及怎样终止行为不当的进程。

本章命令：`ps`, `top`, `jobs`, `bg`, `fg`, `kill`, `killall`, `shutdown`。

### 10.1	进程是怎样工作的？

* 系统启动时，内核先把一些它自己的程序初始化为进程，然后运行一个叫做`init`的程序。

* `init`再运行一系列的称为`init脚本`的`shell脚本`，这些脚本位于`/etc`，它们可以启动所有的系统服务。

* 其中许多系统服务以守护程序(`daemon`)的形式实现，守护程序仅在后台运行，没有任何用户接口。这样，即使没用用户登录，系统也在运行例行事物。

* 一个程序可以发动另一个程序，通常表述为为一个父进程创建一个子进程。

* 内核维护每个进程的信息，以使事务有序。例如，系统分配给每个进程一个ID，通常称为PID，PID以升序分配，`init`进程的PID总是1。内核也对分配给每个进程的内存进行跟踪。

* 同文件一样，进程也有其所有者和用户ID、有效用户ID等。

### 10.2	查看进程

`ps`：最常用的查看进程的命令；

```shell
[lsjarch@LsjsArch ~]$ ps
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  16845 pts/1    00:00:00 ps

```

默认情况下，`ps`只会列出当前终端会话相关的进程，其中`TTY`是`Teletype`的简写，指进程的控制终端。`TIME`字段表示进程所消耗的CPU时间数量。

给`ps`加上选项，可以得到 更多关于系统运行状态的信息：

```shell
[lsjarch@LsjsArch ~]$ ps x
    PID TTY      STAT   TIME COMMAND
    646 ?        Ss     0:00 /usr/lib/systemd/systemd --user
    647 ?        S      0:00 (sd-pam)
    657 ?        Sl     0:00 /usr/bin/kwalletd5 --pam-login 6 8
    658 ?        Sl     0:00 /usr/bin/startplasma-x11
    661 ?        Sl     0:11 fcitx5
    664 ?        Rs     0:20 /usr/bin/dbus-daemon --session --address=systemd: --nofork --nopidfile --systemd-activation --sy
    711 ?        Sl     0:12 /usr/bin/kded5
    715 ?        Sl    10:11 /usr/bin/kwin_x11
    734 ?        Ssl    0:01 /usr/bin/kglobalaccel5
    750 ?        Ssl    0:00 /usr/lib/kactivitymanagerd
    757 ?        Ssl    0:00 /usr/lib/dconf-service
    771 ?        Sl     0:01 /usr/bin/ksmserver
    806 ?        Sl     0:00 /usr/bin/xembedsniproxy
    810 ?        Sl     0:02 /usr/lib/org_kde_powerdevil
    812 ?        Sl     0:01 /usr/lib/polkit-kde-authentication-agent-1
    814 ?        Sl     0:01 /usr/bin/kaccess
    818 ?        Sl     0:07 /usr/bin/plasmashell
	...
	and many more...
```

可以将`ps`的输出结果管道到`less`，这样可以方便浏览。

`ps x`表示展示所有进程，不论它们由什么终端控制。`TTY`一栏中`?`表示没有控制终端。`STAT`是`state`的简写，表示进程当前的状态：

| 状态 | 含义                                                         |
| ---- | ------------------------------------------------------------ |
| R    | 进程正在运行或准备运行                                       |
| S    | 进程睡眠。等待一个事件来唤醒                                 |
| D    | 不可中断睡眠。进程正在等待I/O，比如磁盘驱动器的I/O           |
| T    | 表示进程已停止运行                                           |
| Z    | 僵尸进程，表示一个已经终止的子进程，但它的父进程还没有把子进程从进程表中删除 |
| <    | 一个高优先级进程，能够获取更多CPU资源，同样也会造成其他进程获取CPU时间变少，常被认为不好的进程`less nice` |
| N    | 低优先级进程，只有当其他高优先级进程执行后才会得到CPU，常被认为好进程`nice` |

状态符后可以跟其他字符，表示外来进程的特性。

另一个流行的选项组合是`ps aux`：

```shell
[lsjarch@LsjsArch ~]$ ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0 102568 13216 ?        Ss   12:52   0:02 /usr/lib/systemd/systemd --system --deserialize 12
root           2  0.0  0.0      0     0 ?        S    12:52   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<   12:52   0:00 [rcu_gp]
root           4  0.0  0.0      0     0 ?        I<   12:52   0:00 [rcu_par_gp]
root           6  0.0  0.0      0     0 ?        I<   12:52   0:00 [kworker/0:0H-events_highpri]
root           8  0.0  0.0      0     0 ?        I<   12:52   0:00 [mm_percpu_wq]
root          10  0.0  0.0      0     0 ?        S    12:52   0:00 [rcu_tasks_kthre]
root          11  0.0  0.0      0     0 ?        S    12:52   0:00 [rcu_tasks_rude_]
root          12  0.0  0.0      0     0 ?        S    12:52   0:00 [rcu_tasks_trace]
root          13  0.0  0.0      0     0 ?        S    12:52   0:01 [ksoftirqd/0]
root          14  0.0  0.0      0     0 ?        I    12:52   0:08 [rcu_preempt]
root          15  0.0  0.0      0     0 ?        S    12:52   0:00 [rcub/0]
root          16  0.0  0.0      0     0 ?        S    12:52   0:00 [rcuc/0]
root          17  0.0  0.0      0     0 ?        S    12:52   0:00 [migration/0]
root          18  0.0  0.0      0     0 ?        S    12:52   0:00 [idle_inject/0]
root          19  0.0  0.0      0     0 ?        S    12:52   0:00 [cpuhp/0]
root          20  0.0  0.0      0     0 ?        S    12:52   0:00 [cpuhp/1]
...
```

这会展示更多的信息：

| 标题  | 含义                                         |
| ----- | -------------------------------------------- |
| USER  | 用户ID，表示进程的所有者                     |
| %CPU  | 以百分比表示CPU的使用率                      |
| %MEM  | 以百分比表示内存的使用率                     |
| VSZ   | 虚拟内存的大小                               |
| RSS   | 进程占用的物理内存大小，以千字节为单位       |
| START | 进程运行的起始时间，若超过24小时，则用天表示 |



### 10.3 动态查看进程

`top`：`ps`只是提供执行时刻系统状态的快照，而`top`能够看到更多动态信息；

```shell
top - 16:02:43 up  3:09,  1 user,  load average: 0.93, 0.99, 0.95
任务: 277 total,   3 running, 274 sleeping,   0 stopped,   0 zombie
%Cpu(s):  4.3 us,  2.2 sy,  0.0 ni, 92.9 id,  0.1 wa,  0.3 hi,  0.2 si,  0.0 st
MiB Mem :  15852.7 total,  10311.1 free,   2270.6 used,   3270.9 buff/cache
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  12603.4 avail Mem 

 进程号 USER      PR  NI    VIRT    RES    SHR    %CPU  %MEM     TIME+ COMMAND                                               
  12675 lsjarch   20   0 5077572 599852 260504 R  33.2   3.7   0:57.55 GeckoMain                                             
    482 root      20   0 1964320 103832  63400 S  13.0   0.6  12:59.90 Xorg                                                  
    715 lsjarch   20   0 3438420 175456 121736 S  13.0   1.1  13:03.88 kwin_x11                                              
  16826 lsjarch   20   0 1527504 133552 107244 S   9.3   0.8   0:14.79 konsole                                               
   6867 lsjarch   20   0 1172776 355516 139720 S   6.0   2.2  12:15.49 qqmusic                                               
    863 lsjarch    9 -11 1364988  15796  10888 S   2.3   0.1   4:52.42 pulseaudio                                            
   4571 root      20   0 4932284  70380  19288 S   1.0   0.4   4:26.03 v2raya                                                
   6456 root      20   0 6320064  59972  18896 S   1.0   0.4   2:50.04 v2ray                                                     
   6859 lsjarch   20   0  307164  87100  68888 S   0.7   0.5   1:04.00 qqmusic                                               
    461 dbus      20   0   15284   8080   5436 S   0.3   0.0   1:35.63 dbus-daemon                                           
   ...
```

`top`程序连续显示系统进程更新的信息（默认每三分钟一次）。这个命令是用来查看系统中的“顶端”进程的，其显示结果有两部分——系统概要和进程列表。进程列表以CPU使用率排序。来看看系统概要各字段的含义：

| 行号 | 字段                          | 含义                                                         |
| ---- | ----------------------------- | ------------------------------------------------------------ |
| 1    | top                           | 程序名                                                       |
|      | 16:02:43                      | 当前时间                                                     |
|      | up 3:09                       | 指计算机从上从启动到现在所运行的时间                         |
|      | 1 user                        | 有一个用户登录系统                                           |
|      | load average:0.93, 0.99, 0.95 | 加载平均值，指等待运行的进程数目，即处于运行状态的进程个数，这些进程共享CPU。三个数值对应不同的时间周期，第一个是最后60秒的平均值，第二个数值是前5分钟的平均值，第三个数值是前15分钟的平均值。若平均值低于1.0，表示计算机工作不忙碌 |
| 2    | 任务：                        | 总借了进程数目和各种进程状态                                 |
| 3    | %Cpu(s):                      | 描述了CPU正在执行的进程的特性                                |
|      | 4.3us                         | 表示4.3% of the CPU is being used for user process.这意味着进程在内核之外 |
|      | 2.2sy                         | 2.2%的CPU时间被用于系统内核进程                              |
|      | 0.0ni                         | 0.0%的CPU时间被用于低优先级`nice`进程                        |
|      | 92.9id                        | 92.9%的CPU时间是空闲的                                       |
|      | 0.1wa                         | 0.1%的CPU时间备用来等待I/O                                   |
| 4    | MiB Mem                       | 展示物理内存的使用情况                                       |
| 5    | MiB Swap                      | 展示交换分区（虚拟内存）的使用情况                           |

`top`程序可以接受一系列键盘输入命令，其中`h`显示程序的帮助页面，`q`退出`top`程序。

虽然GUI界面都提供了CPU状态的图形化应用程序，但`top`优点是运行速度快且消耗系统资源更少。



### 10.4	控制进程

来进行一项控制进程的练习。

```shell
[lsjarch@LsjsArch ~]$ kwrite
```

如果没有kwrite，可以使用gedit等代替，不过这并不重要。输入上述命令后，屏幕上会打开一个窗口，并且没有shell提示符没有返回，这是因为shell在等待这个程序结束，如果关闭kwrite窗口，shell提示符就会返回。

下面开始操作：

1. *中断一个进程：*

   回到bash窗口，按下<kbd>ctrl</kbd>+<kbd>c</kbd>，中断当前程序(kwrite)的运行。我们会看到，kwrite窗口关闭，shell提示符返回。

2. *把一个进程放置到后台：*

   如果我们想让shell提示符返回，但又不终止kwrite，即将其放置后台运行。

   ```shell
   [lsjarch@LsjsArch ~]$ kwrite &
   [1] 19536
   [lsjarch@LsjsArch ~]$
   ```

   信息`[1] 19536`表示启动了工作号为1、PID为19536的程序。此时运行ps命令：

   ```shell
   [lsjarch@LsjsArch ~]$ ps
       PID TTY          TIME CMD
     16843 pts/1    00:00:00 bash
     19613 pts/1    00:00:00 kwrite
     19634 pts/1    00:00:00 ps
   
   ```

   *工作控制：*

   这个shell功能可以列出从终端中启动的任务，执行`jobs`命令：

   ```shell
   [lsjarch@LsjsArch ~]$ jobs
   [1]+  运行中               kwrite &
   
   ```

   `jobs`显示我们有一个编号为 1 的任务正在运行，其命令是kwrite &

3. *结果返回前台：*

   一个后台运行的进程不能获取shell中键盘的输入，也不能通过<kbd>ctrl</kbd>+<kbd>c</kbd>来中断，此时需要`fg`来让一个进程返回前台执行：

   ```shell
   [lsjarch@LsjsArch ~]$ jobs
   [1]+  运行中               kwrite &
   [lsjarch@LsjsArch ~]$ fg %1
   kwrite
   
   ```

   其中，`%1`称为 jobspec ，对于只有一个后台任务的情况 jobspec 可有可无，但多任务需要以此来准确控制进程。最后，输入<kbd>ctrl</kbd>+<kbd>c</kbd>中断程序。

4. *停止一个进程：*

   停止一个进程而不是终止，即将前台进程移到后台等待，我们需要组合键<kbd>ctrl</kbd>+<kbd>z</kbd>

   ```shell
   [lsjarch@LsjsArch ~]$ kwrite
   ^Z
   [1]+  已停止               kwrite
   [lsjarch@LsjsArch ~]$ 
   
   ```

   此时，打开GUI中的kwrite，我们发现无法对其操作，就像其死掉一样。通过`fg`命令，可以恢复程序到前台运行，或者用`bg`把程序移到后台。

   ```shell
   [lsjarch@LsjsArch ~]$ bg %1
   [1]+ kwrite &
   [lsjarch@LsjsArch ~]$ 
   ```

   

5. *为什么要从命令行启动程序呢？*

   * 有时所要启动的程序没有在窗口管理器的菜单列出来；
   * 从命令行启动程序可以看到运行中的错误信息，而窗口系统不能看到；
   * 有可能从图形界面菜单中启动不了，而从命令行界面启动可以了解其错误信息。

### 10.5	Signals

`kill`：杀死需要终止的程序；

```shell
[lsjarch@LsjsArch ~]$ jobs 
[1]+  运行中               kwrite &
[lsjarch@LsjsArch ~]$ ps 
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  20540 pts/1    00:00:01 kwrite
  20850 pts/1    00:00:00 ps
[lsjarch@LsjsArch ~]$ kill 20540
[lsjarch@LsjsArch ~]$ ps
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  20853 pts/1    00:00:00 ps
[1]+  已终止               kwrite

```

准确说，`kill`不是杀死程序，而是给程序发送信号。信号是程序与操作系统进行通信的手段之一。我们之前使用组合键操作终端时，终端会给前端运行的程序发送一个信号，<kbd>ctrl</kbd>+<kbd>c</kbd>是INT中断信号，<kbd>ctrl</kbd>+<kbd>z</kbd>是TSTP终端停止信号。程序接受到信号后作出相应响应，比如，接收终止信号后保存当前工作并退出。

### 10.6	通过`kill`给进程发送信号

`kill`发送信号的语法类似这样：

```shell
kill [-signal] PID...
```



如果命令行中没有指定信号，则默认发送TERM终止信号，而其他信号含义是：

| 编号 | 名字 | 含义                                                         |
| ---- | ---- | ------------------------------------------------------------ |
| 1    | HUP  | 挂起。发送这个信号到终端机上的前台程序，程序会终止。许多守护进程也使用这个信号来重新初始化。这表明，当发送这个信号到一个守护进程后，这个进程会重新启动，并重新读取它的配置文件。 |
| 2    | INT  | 中断。<kbd>ctrl</kbd>+<kbd>c</kbd>一样的功能，通常会终止一个程序 |
| 9    | KILL | 杀死。事实上，并不是发送KILL信号到目标进程，而是内核立刻终止这个进程，当一个进程以这种方式终止时，没有机会去做清理工作，因此要慎用 |
| 15   | TERM | 终止。`kill`的默认信号，如果程序仍然“活着”，可以接受信号，那么程序终止。 |
| 18   | CONT | 继续。在停止一段时间后，进程恢复运行                         |
| 19   | STOP | 停止。类似于KILL信号，不是发送给进程，因此不能被进程忽略。这个信号将导致进程停止运行，而不是终止。 |

来用实验理解：

```shell
[lsjarch@LsjsArch ~]$ kwrite &
[1] 22269
[lsjarch@LsjsArch ~]$ kill -1 22269
[lsjarch@LsjsArch ~]$ ps
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  23368 pts/1    00:00:00 ps
[1]+  挂起                  kwrite

# 还可以用名字指定要发送的信号，不过要在名字前加上"SIG"
[lsjarch@LsjsArch ~]$ kwrite &
[1] 23431
[lsjarch@LsjsArch ~]$ ps
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  23431 pts/1    00:00:00 kwrite
  23467 pts/1    00:00:00 ps
[lsjarch@LsjsArch ~]$ kill -SIGHUP 23431
[lsjarch@LsjsArch ~]$ ps
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  23607 pts/1    00:00:00 ps
[1]+  挂起                  kwrite

```

试着用其他信号重复上述实验。

进程和文件一样，拥有所有者，所以为了能够通过`kill`命令来给进程发送信号，必须是进程的所有者或超级用户。

*其他系统频繁使用的信号*

| 编号 | 名字  | 含义                                                         |
| ---- | ----- | ------------------------------------------------------------ |
| 3    | QUIT  | 退出                                                         |
| 11   | SEGV  | 段错误。如果一个程序非法使用内存，就会发送这个信号           |
| 20   | TSTP  | 终端停止。按下<kbd>ctrl</kbd>+<kbd>z</kbd>组合键，中断发送至进程。但与STOP信号不同，TSTP信号由目标进程接收且可能被忽略 |
| 28   | WINCH | 改变窗口大小。当改变窗口大小时，系统会发送这个信号，像`top`和`less`会响应这个信号并刷新现实的内容 |

实际上，完整的信号列表有：

```shell
[lsjarch@LsjsArch ~]$ kill -l
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS      34) SIGRTMIN    35) SIGRTMIN+1  36) SIGRTMIN+2  37) SIGRTMIN+3
38) SIGRTMIN+4  39) SIGRTMIN+5  40) SIGRTMIN+6  41) SIGRTMIN+7  42) SIGRTMIN+8
43) SIGRTMIN+9  44) SIGRTMIN+10 45) SIGRTMIN+11 46) SIGRTMIN+12 47) SIGRTMIN+13
48) SIGRTMIN+14 49) SIGRTMIN+15 50) SIGRTMAX-14 51) SIGRTMAX-13 52) SIGRTMAX-12
53) SIGRTMAX-11 54) SIGRTMAX-10 55) SIGRTMAX-9  56) SIGRTMAX-8  57) SIGRTMAX-7
58) SIGRTMAX-6  59) SIGRTMAX-5  60) SIGRTMAX-4  61) SIGRTMAX-3  62) SIGRTMAX-2
63) SIGRTMAX-1  64) SIGRTMAX

```



### 10.7	给多个进程发送信号

`killall`：给匹配特定程序或用户名的多个进程发送信号；

```shell
killall [-u user] [-signal] name...
```

来测试一下：

```shell
[lsjarch@LsjsArch ~]$ kwrite &
[1] 23773
[lsjarch@LsjsArch ~]$ kwrite &
[2] 23801

[lsjarch@LsjsArch ~]$ ps 
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  23773 pts/1    00:00:00 kwrite
  23801 pts/1    00:00:00 kwrite
  23826 pts/1    00:00:00 ps
[lsjarch@LsjsArch ~]$ killall kwrite
[lsjarch@LsjsArch ~]$ ps
    PID TTY          TIME CMD
  16843 pts/1    00:00:00 bash
  23844 pts/1    00:00:00 ps
[1]-  已终止               kwrite
[2]+  已终止               kwrite

```



### 10.8	更多和进程相关的命令

| 命令名 | 命令描述                                                     |
| ------ | ------------------------------------------------------------ |
| pstree | 输出一个树型结构的进程列表，这个列表展示了进程间父/子关系    |
| vmstat | 输出一个系统资源使用快照，包括内存、交换分区、磁盘I/O。为了看到连续的显示结果，可以在命令名后加上延时时间(单位：秒)。如`vmstat 5` |
| xload  | 一个图形界面程序，可以画出系统负载的图形                     |
| tload  | 在终端中画出图形                                             |























