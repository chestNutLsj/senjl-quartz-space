本篇是学习Linux Shell的第三篇——系统、设备管理及Linux工具使用

## 1. 软件包管理

本章命令：`pacman`, `apt-get`, `rpm`, `yum`等。

决定Linux发行版本质量最重要的因素是软件包系统和支持该发行版本社区的活力。我们常常可以看到，主流的Linux发行版每半年到一年都会推出全新的版本，无数的个人程序每天都有更新，要同步这些日新月异的软件，我们就需要软件包管理软件。

软件包管理是一种在系统上安装、维护软件的方法。早期Linux要安装软件必须下载源码然后编译，虽然公开源码赋予用户自主检查软件、提升系统的权利，但它有时候会很麻烦。使用预先编译好的软件包会更快更容易。

本章会主要介绍ArchLinux上的软件包管理软件——pacman和yay，并且Linux经典包管理工具的工作方式。

### 1.1 Linux发行版

不同的Linux发行版用的是不同的软件包系统，原则上适用于一种发行版的软件包与其他发行版是不兼容的。这里，我们有必要了解一些关于Linux发行版的知识：

Linux 发行版（英语：Linux distribution，也被叫做GNU/Linux 发行版），为一般使用者预先整合好的Linux作业系统及各种应用软体。一般使用者不需要重新编译，在直接安装之后，只需要小幅度更改设定就可以使用，通常以软件包管理系统来进行应用软体的管理。Linux发行版通常包含了包括桌面环境、办公套件、媒体播放器、数据库等应用软件。这些操作系统通常由Linux内核、以及来自GNU计划的大量的函式库，和基于X Window或者Wayland的图形界面。有些发行版考虑到容量大小而没有预装 X Window，而使用更加轻量级的软件，如：BusyBox、musl或uClibc-ng。现在有超过300个Linux发行版。大部分都正处于活跃的开发中，不断地改进。

由于大多数软件包是自由软件和开源软件，所以Linux发行版的形式多种多样——从功能齐全的桌面系统以及服务器系统到小型系统（通常在嵌入式设备，或者启动软盘）。除了一些定制软件（如安装和配置工具），发行版通常只是将特定的应用软件安装在一堆函式库和内核上，以满足特定使用者的需求。

这些发行版可以分为商业发行版，比如Ubuntu（Canonical公司）、Red Hat Enterprise Linux、SUSE Linux Enterpise；和社区发行版，它们由自由软件社区提供支持，如Debian、Fedora、Arch、openSUSE和Gentoo。详细的划分可以参考这篇wiki：[Linux发行版列表](https://zh.wikipedia.org/wiki/Linux%E5%8F%91%E8%A1%8C%E7%89%88%E5%88%97%E8%A1%A8)。

如果你想了解更多的Linux发行版的知识，可以查看这个网站：[Linux发行版小览](https://distrowatch.com)。

如果你实在不知道自己该选择什么发行版，可以尝试一下这个网站：[Linux发行版选择器](https://distrochooser.de/)。

笔者第一个使用的Linux发行版是Ubuntu 20.04，但那种“带着镣铐起舞”的感觉实在不好受，既然我选择使用Linux，那么当然想要全面自定制。最终，我选择了ArchLinux发行版。

下面是关于**ArchLinux**的一些介绍：

The KISS (keep it simple, stupid) philosophy of [Arch](https://distrowatch.com/arch) Linux was devised around the year 2002 by Judd Vinet, a Canadian  computer science graduate who launched the distribution in the same  year. For several years it lived as a marginal project designed for  intermediate and advanced Linux users and only shot to stardom when it  began promoting itself as a "rolling-release" distribution that only  needs to be installed once and which is then kept up-to-date thanks to  its powerful package manager and an always fresh software repository. As a result, Arch Linux "releases" are simply monthly snapshots of the  install media.

Arch Linux 的 KISS（保持简单，愚蠢）哲学是在 2002 年左右由加拿大计算机科学专业的毕业生 Judd Vinet  设计的，他在同年推出了该发行版。几年来，它作为一个为中级和高级 Linux  用户设计的边缘项目一直存在，当它开始将自己宣传为只需要安装一次并保持更新的“滚动发布”发行版时，它才一炮而红。得益于其强大的包管理器和始终新鲜的软件存储库。因此，Arch Linux“发布”只是安装媒体的每月快照。



Besides featuring the much-loved "rolling-release"  update mechanism, Arch Linux is also renowned for its fast and powerful  package manager called "Pacman", the ability to install software  packages from source code, easy creation of binary packages thanks to  its AUR infrastructure, and the ever increasing software repository of  well-tested packages. Its highly-regarded documentation, complemented by the excellent Arch Linux Handbook, makes it possible for even less  experienced Linux users to install and customise the distribution. The  powerful tools available at the user's disposal mean that the distro is  infinitely customisable to the most minute detail and that no two  installations can possibly be the same.

除了备受喜爱的“滚动发布”更新机制外，Arch Linux 还以其名为“Pacman”的快速而强大的包管理器而闻名，能够从源代码安装软件包，由于其 AUR  可以轻松创建二进制包基础设施，以及不断增加的经过良好测试的软件包的软件存储库。其备受推崇的文档，加上优秀的 Arch Linux  手册，使经验不足的 Linux  用户也可以安装和定制发行版。用户可以使用的强大工具意味着该发行版可以无限定制到最细微的细节，并且没有两个安装可能是相同的。



On the negative side, any rolling-release update  mechanism has its dangers: a human mistake creeps in, a library or  dependency goes missing, a new version of an application already in the  repository has a yet-to-be-reported critical bug... It's not unheard of  to end up with an unbootable system following a Pacman upgrade. As such, Arch Linux is a kind of distribution that requires its users to be  alert and to have enough knowledge to fix any such possible problems.  Also, the distribution's rolling nature means that sometimes it is no  longer possible to use the old media to install the distribution due to  important system changes or lack of hardware support in the older Linux  kernel.

不利的一面是，任何滚动发布更新机制都有其危险：人为错误蔓延，库或依赖项丢失，存储库中已有应用程序的新版本存在尚未报告的严重错误。在 Pacman 升级后出现无法启动的系统并非闻所未闻。因此，Arch Linux  是一种发行版，它要求其用户保持警惕并拥有足够的知识来解决任何此类可能的问题。此外，发行版的滚动特性意味着有时由于重要的系统更改或旧版 Linux 内核缺乏硬件支持，不再可能使用旧媒体来安装发行版。



* **Pros:** Excellent software management infrastructure; unparalleled customisation and tweaking options; superb on-line documentation

  优点：优秀的软件管理基础设施；无与伦比的定制和调整选项；一流的在线文档
                  

* **Cons:** Occasional instability and risk of breakdown

  缺点：偶尔的不稳定和故障风险
                  

* **Software package management**

  软件包管理：Pacman
                  

* **Available editions:** Minimal installation CD and network installation CD images for 64-bit (x86_64) processors

  可用版本：64 位 (x86_64) 处理器的最小安装 CD 和网络安装 CD 映像

  

* **Suggested Arch-based and Arch-like alternatives:** [Manjaro](https://distrowatch.com/manjaro) Linux, [EndeavourOS](https://distrowatch.com/endeavour), [Artix](https://distrowatch.com/artix) Linux, [Parabola](https://distrowatch.com/parabola) GNU/Linux (free software), [KaOS](https://distrowatch.com/kaos)

  建议的基于 Arch 和类似 Arch 的替代方案：Manjaro Linux、EndeavourOS、Artix Linux、Parabola GNU/Linux（免费软件）、KaOS

### 1.2 软件包系统的工作方式

Linux系统的所有软件都可以在互联网上找到，并且多数是以软件包文件的形式由发行商提供，其余则以可以手动编译安装的源代码形式存在。本部分笔记将会学习到如何通过编译源代码安装软件，但现在我们先学习软件包管理。

#### 1.2.1 软件包文件

包文件是组成软件包系统的基本软件单元，它是由组成软件包的文件压缩而成的文件集。

一个包可能包含大量的程序以及支持这些程序的数据文件，包文件既包含了安装文件，又包含了有关包自身及其内容的文件说明之类的软件包元数据，此外大多还包含了安装软件包前后执行配置任务的安装脚本。

包文件通常由软件包维护者创建。包维护者从上游供应商（程序作者）获得软件源代码，然后进行编译，创建包的元数据及其它必须的安装脚本，通常还会作出一些修改来提高该软件包与该Linux发行版其他部分的兼容性。

#### 1.2.2 库

如今多数软件包均由发行商或感兴趣的第三方创建，Linux用户可以从其所使用的Linux发行版的中心库获得软件包。所谓中心库，一般包含了成千上万个软件包，而且每一个都是专门为该发行版建立和维护的。

在软件开发的不同生命周期阶段，一个发行版本可能会维护多个不同的仓库。通常会有一个测试库，存放刚创建的、用于调试者在软件包正式发布前查找漏洞的软件包；另外还有一个开发库，存放的是下一个公开发行版本中所包含的开发中的软件包。

除中心库外，一些发行版还可能有第三方库，这些库通常提供因法律原因（专利、数字版权管理等）、未在Linux操作系统上发布官方软件（如QQ）的一些软件包。这些库完全独立于它们所支持的Linux版本，用户必须充分了解后手动将其加入到软件包文件管理系统的配置文件中，才能使用它们。

对应到ArchLinux的Pacman包管理工具，其中心库通常有core、extra、community、multilib、archlinuxcn等；而其第三方库有AUR(Arch User Repository)，里面有大量Arch用户开发、维护的包。

#### 1.2.3 依赖关系

几乎没有一个程序是独立存在的。对于庞大、精巧的计算机系统，程序之间相互依赖，完成既定的工作。

比如输入/输出操作，就是由多个程序共享的例程执行，这些例程存储在共享库里，共享库里的文件为多个程序提供必要的服务。如果一个软件包需要共享库之类的共享资源，说明其具有依赖性。

软件包管理系统必须提供依赖性解决策略，以保证用户安装了软件包的同时也安装了其所有的依赖关系。

#### 1.2.4 高级和低级软件包工具

软件包管理系统通常包含两类工具——执行如安装、删除软件包文件等任务的低级工具，进行元数据搜索及提供依赖性解决的高级工具。

接下来我们将学习Debian系软件包管理工具、Red-Hat系软件包工具、ArchLinux的软件包管理工具Pacman以及AUR包管理工具yay。

| 发行版本                                   | 低级工具 | 高级工具          |
| ------------------------------------------ | -------- | ----------------- |
| Debian系                                   | dpkg     | apt-get、aptitude |
| Fedora、Red Hat Enterprise Linux、CentOS等 | rpm      | yum               |
| ArchLinux                                  |          | pacman、yay       |



### 1.3 软件源与pacman工具

在学习命令之前，我们先学习一下有关ArchLinux的包管理工具pacman和安装源的相关知识：

**ArchLinux的版本库中包括：**

* core：核心软件包；
* community：社区软件包，如MySQL；
* testing：测试阶段、还没有正式加入源的软件包。通常软件版本比较新，但不够稳定；
* release：已经发布的软件包；
* unstable：非正式的软件包，可能包括以前版本的软件或者测试软件。

由于Pacman的软件都是从软件源里面更新，因此在`/etc/pacman.d`里面配置这些软件源的地址。在`/etc/pacman.d`目录里有上面几种软件类型对应的文件名，可以自己手动配置这些软件源。



**pacman软件包管理器简介：**

简单来说，就是和apt-get之于Ubuntu一样，pacman就是Arch的apt-get。要想轻松玩转Arch，学会pacman是必需的。

pacman包管理器是ArchLinux的一大亮点。它汲取了其他Linux版本软件管理的优点，譬如Debian的APT机制、Redhat的 Yum机制、 Suse的Yast等，对于安装软件提供了无与伦比的方便。另外由于ArchLinux是一个针对i686架构优化的发行版，因此对于软件的效率提高也有一定的帮助。

pacman可以说是ArchLinux的基础，因为ArchLinux默认安装非常少的软件，其他软件都是使用pacman通过网络来安装的。它将一个简单的二进制包格式和易用的构建系统结合了起来。pacman使得简单的管理与自定义软件包成为了可能，而不论他们来自于官方的Arch软件库或是用户自己创建的。pacman可以通过和主服务器同步包列表来进行系统更新，这使得注重安全的系统管理员的维护工作成为轻而易举的事情。

要完全了解pacman可以做什么，请阅读`man pacman`。其中文文档在这里：[pacman中文文档](https://wiki.archlinux.org/title/Pacman_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))。

配置：pacman的配置文件位于/etc/pacman.conf。关于配置文件的进一步信息可以用`man pacman.conf`查看。



### 1.4 使用包软件管理工具

在下面的讨论中，`package_name`指软件包的实际名称，`package_file`指包含该软件包的文件名。

#### 1.4.1 在库中查找包

使用高级工具来搜索库中元数据时，可以根据包文件名或其描述来查找包。

| 系统类型  | 命令                                             |
| --------- | ------------------------------------------------ |
| Debian系  | `apt-get update; apt-cache search search_string` |
| Red Hat系 | `yum search search_string`                       |

对于Arch的pacman命令，我们要更详细的了解：

* `pacman -Ss package`：在包数据库中查询软件包，查询位置包含了包的名字和描述；
* `pacman -Q -help`：查询本地软件包数据库；
* `pacman -S -help`：查询远程同步的数据库；
* `pacman -F -help`：查询文件数据库；

#### 1.4.2 安装库中的软件包

从库中下载、安装软件包，同时安装所有依赖包。

| 系统类型  | 命令                                           |
| --------- | ---------------------------------------------- |
| Debian系  | `apt-get update; apt-get install package_name` |
| Red Hat系 | `yum install package_name`                     |

对于pacman，我们需要了解：

* `pacman -S package_name1 package_name2`：安装或升级所列出名字的软件包；
* `pacman -S repo_name/package_name`：如果不同软件仓库中一个软件包有不同的版本，这时就需要指定仓库。
* `pacman -Sw package_name`：下载包而不安装它；

这里，`-S`选项的意思是同步（synchronization），在安装之前先与软件库进行同步。

#### 1.4.3 安装软件包文件中的软件包

如果软件包文件不是从库源中下载的，那么可以使用低级工具直接安装，但这并不会解决依赖关系。

| 系统类型  | 命令                          |
| --------- | ----------------------------- |
| Debian系  | `dpkg --install package_file` |
| Red Hat系 | `rpm -i package_file`         |

由于这些低级工具不提供依赖性关系的解决方案，所有一旦安装过程中遇到缺少的依赖，就会报错并退出安装。



对于Arch，强大的包管理工具pacman可以解决一切：

* `pacman -U /path/to/local/package`：安装一个本地包（不从源里）；
* `pacman -U https://url/package_name-version.pkg.tar.gz`：安装一个远程包（不从源里）；

并且，pacman安装本地包是会解决依赖问题的。



pacman数据库根据安装的原因将安装的包分为两组：

* 显示安装：由`pacman -S/-U`命令直接安装的包；
* 依赖安装：由于被其他显式安装的包所依赖，而被自动安装的包。

#### 1.4.4 删除软件包

卸载软件包既可用高级工具也可用低级工具。

| 系统类型  | 命令                          |
| --------- | ----------------------------- |
| Debian系  | `apt-get remove package_name` |
| Red Hat系 | `yum erase package_name`      |

而pacman的删除命令是：

* `pacman -R package_name`：删除单个软件包，保留其全部已安装的依赖关系；
* `pacman -Rs package_name`：删除指定软件包，及其所有没有被其他已安装软件包所使用的依赖关系；
* `pacman -Rn package_name`：默认的，pacman会备份被删除程序的配置文件，并加上`*.pacsave`的扩展名。如果想要删除相应的配置文件，可以使用此命令；（这在Debian系中称为清除purging）
* `pacman -Rsn package_name`：当然，也可以加上-s参数来删除当前无用的依赖。这样的话就真正删除一个软件包、它的配置文件、所有不再需要的依赖。
* `pacman -Qdtq | pacman -Rs -`：如果需要这个依赖的包已经被删除了，这条命令可以删除所有不再需要的依赖项；

#### 1.4.5 更新库中的软件包及pacman配置跳过更新指定软件包

最常见的软件包管理任务就是保持系统安装最新的软件包。

| 系统类型  | 命令                              |
| --------- | --------------------------------- |
| Debian系  | `apt-get update; apt-get upgrade` |
| Red Hat系 | `yum update`                      |

而pacman只用一个指令就可以升级系统中所有已安装的包：

* `pacman -Su`：升级系统中所有已安装的包；
* `pacman -Syu`：这里，`y`代表更新本地存储库；`u`代表系统更新。因此这条命令的含义是，同步到中央软件库（主程序包数据库），刷新主程序包数据库的本地副本，然后执行系统更新（通过更新所有版本更新可用的程序包）。

> Warning!
>
> 对于 Arch Linux 用户，在系统升级前，建议你访问 [Arch-Linux 主页](https://www.archlinux.org/) 查看最新消息，以了解异常更新的情况。如果系统更新需要人工干预，主页上将发布相关的新闻。你也可以订阅 [RSS 源](https://www.archlinux.org/feeds/news/) 或 [Arch 的声明邮件](https://mailman.archlinux.org/mailman/listinfo/arch-announce/)。
>
> 在升级基础软件（如 kernel、xorg、systemd 或 glibc） 之前，请注意查看相应的 [论坛](https://bbs.archlinux.org/)，以了解大家报告的各种问题。
>
> 在 Arch 和 Manjaro 等滚动发行版中不支持**部分升级**。这意味着，当新的库版本被推送到软件库时，软件库中的所有包都需要根据库版本进行升级。例如，如果两个包依赖于同一个库，则仅升级一个包可能会破坏依赖于该库的旧版本的另一个包。

跳过升级软件包：

出于某些原因（稳定性等），有时不希望升级某个软件包，可以在pacman.conf文件中加入以下内容：

```shell
IgnorePkg = 软件包名
```

跳过升级软件包组：

```shell
IgnoreGroup = kde
```



#### 1.4.6 更新软件包文件中的软件包

如果软件包的更新版本已从非库源中下载，那么可以用下面这些命令进行安装更新：

| 系统类型  | 命令                          |
| --------- | ----------------------------- |
| Debian系  | `dpkg --install package_file` |
| Red Hat系 | `rpm -U package_file`         |



#### 1.4.7 列出所有已安装的软件包列表

| 系统类型  | 命令          |
| --------- | ------------- |
| Debian系  | `dpkg --list` |
| Red Hat系 | `rpm -qa`     |

pacman的对应命令：

* `pacman -Qs package_name`：查询已安装的软件包；
* `pacman -Ql package_name`：获取已安装软件包所包含文件的列表；
* `pacman -Qdt`：罗列所有不再作为依赖的孤立包（orphans）；

#### 1.4.8 判断软件包是否安装

| 系统类型  | 命令                         |
| --------- | ---------------------------- |
| Debian系  | `dpkg --status package_name` |
| Red Hat系 | `rpm -q package_name`        |



#### 1.4.9 显示已安装软件包的相关信息

在已知已安装的软件包的名称的情况下，便可以使用下面命令显示该软件包的描述信息。

| 系统类型  | 命令                          |
| --------- | ----------------------------- |
| Debian系  | `apt-cache show package_name` |
| Red Hat系 | `yum info package_name`       |

pacman的对应命令：

* `pacman -Si package_name`：获取远程同步软件包的详尽信息；
* `pacman -Qi package_name`：获取本地软件包的详尽信息；

#### 1.4.10 查看某具体文件由哪个软件包安装得到

下面命令可以判断某个特定文件是由哪个软件包负责安装的：

| 系统类型  | 命令                      |
| --------- | ------------------------- |
| Debian系  | `dkpg --search file_name` |
| Red Hat系 | `rpm -qf file_name`       |

pacman中相应命令：

* `pacman -Qo /path/to/a/file`：通过查询数据库获知目前文件系统中某个文件是属于哪个软件包；
* `pacman -F package_name`：根据文件名在远程软件库中查找它所属的包；
* `pactree 软件包名`：查看一个包的依赖树；

#### 1.4.11 清理包缓存

`pacman` 将其下载的包存储在 `/var/cache/Pacman/pkg/` 中，并且不会自动删除旧版本或卸载的版本。这有一些优点：

1. 它允许 [降级](https://wiki.archlinux.org/index.php/Downgrade) 一个包，而不需要通过其他来源检索以前的版本。
2. 已卸载的软件包可以轻松地直接从缓存文件夹重新安装。

但是，有必要定期清理缓存以防止文件夹增大：

* `pacman -Sc`：清理当前未被安装软件包的缓存（/var/cache/pacman/pkg）；
* `pacman -Scc`：完全清理包缓存；

## 2. 存储介质

本章命令：`mount`, `unmount`, `fdisk`, `fsck`, `fdformat`, `mkf`, `dd`, `genisoimage`, `wodim`, `md5sum`。

前面我们主要学习的是文件级别的数据处理，本章将学习设备级别的数据处理。对于硬盘之类的物理存储器、网络存储器以及像RAID（独立冗余磁盘阵列）、LVM（逻辑卷管理）之类的虚拟存储器，Linux都有高效的处理能力。

### 2.1 挂载、卸载存储设备

现代Linux图形界面已经使得用户能够轻易的管理存储设备，大多只要连接上系统就能运作。但在2004年之前，这必须手动操作，这些需求在当前服务器的配置中也会用到。

管理存储设备首先要做的就是将该设备添加到文件系统树中，从而允许操作系统可以操作该设备，这个过程就是**挂载**。回忆一下之前所讲述的Linux文件系统结构，它只有一个文件系统树，设备连接到树的不同节点上。

`/etc/fstab`文件内容列出了系统启动时挂载的设备：

```shell
LABEL=/12			/			ext3			defaults			1 1
LABEL=/home			/home		 ext3			  defaults			  1 2
LABEL=/boot			/boot		 ext3			  defaults			  1 2
devpts			    /dev/pts	 devpts			  gid=5,mode=620	    0 0
```

这是书中的例子。我们拿来理解一下。这里前三行所列出的是要重点关注的。

这三行内容指的是硬盘分区，文件中每一行含6个字段：

| 字段 | 内容         | 描述                                                         |
| ---- | ------------ | ------------------------------------------------------------ |
| 1    | 设备         | 通常，该字段表示的是与物理设备相关的设备文件的真实名称，比如dev/hda1就代表第一个IDE通道上的主设备的第一块分区。但如今计算机需要支持更多的热插拔设备，所以多用文本标签来关联设备。当设备与系统连接后，该标签（格式化后就会加到存储介质中）就会被操作系统识别。通过这样的方式，不管实际的物理设备被分配到哪个设备文件，它仍能被正确识别。 |
| 2    | 挂载节点     | 设备附加到文件系统树上的目录                                 |
| 3    | 文件系统类型 | Linux能够挂载许多文件系统类型，最常见的原始文件系统是ext3，还有其他如FAT16(msdos)、FAT32(vfat)、NTFS(ntfs)、CD-ROM(iso9660)等 |
| 4    | 选项         | 文件系统挂载时可以使用许多选项参数，比如，可以设置文件系统以只读的方式挂载或是阻止任何程序修改它们（对于可移动设备是一个很有用的维护安全性的方法） |
| 5    | 频率         | 这个数值被dump命令用来决定是否对该文件进行备份以及多久备份一次 |
| 6    | 优先级       | 此数值被fsck命令用来决定在启动时需要被扫描的文件系统的顺序   |

#### 2.1.1 查看已挂载的文件系统列表

`mount`：不带任何参数输入将会调出目前已挂载的文件系统列表；

```shell
<lsjarch@LsjsArch cmd_hisNum:499 ~>$ mount
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
sys on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
dev on /dev type devtmpfs (rw,nosuid,relatime,size=8106136k,nr_inodes=2026534,mode=755,inode64)
run on /run type tmpfs (rw,nosuid,nodev,relatime,mode=755,inode64)
efivarfs on /sys/firmware/efi/efivars type efivarfs (rw,nosuid,nodev,noexec,relatime)
/dev/nvme0n1p2 on / type ext4 (rw,relatime)
securityfs on /sys/kernel/security type securityfs (rw,nosuid,nodev,noexec,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev,inode64)
devpts on /dev/pts type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620,ptmxmode=000)
cgroup2 on /sys/fs/cgroup type cgroup2 (rw,nosuid,nodev,noexec,relatime,nsdelegate,memory_recursiveprot)
pstore on /sys/fs/pstore type pstore (rw,nosuid,nodev,noexec,relatime)
bpf on /sys/fs/bpf type bpf (rw,nosuid,nodev,noexec,relatime,mode=700)
systemd-1 on /proc/sys/fs/binfmt_misc type autofs (rw,relatime,fd=30,pgrp=1,timeout=0,minproto=5,maxproto=5,direct,pipe_ino=10588)
hugetlbfs on /dev/hugepages type hugetlbfs (rw,relatime,pagesize=2M)
mqueue on /dev/mqueue type mqueue (rw,nosuid,nodev,noexec,relatime)
debugfs on /sys/kernel/debug type debugfs (rw,nosuid,nodev,noexec,relatime)
tracefs on /sys/kernel/tracing type tracefs (rw,nosuid,nodev,noexec,relatime)
fusectl on /sys/fs/fuse/connections type fusectl (rw,nosuid,nodev,noexec,relatime)
configfs on /sys/kernel/config type configfs (rw,nosuid,nodev,noexec,relatime)
ramfs on /run/credentials/systemd-sysusers.service type ramfs (ro,nosuid,nodev,noexec,relatime,mode=700)
tmpfs on /tmp type tmpfs (rw,nosuid,nodev,size=8116464k,nr_inodes=1048576,inode64)
/dev/nvme0n1p3 on /home type ext4 (rw,relatime)
/dev/nvme0n1p1 on /efi type vfat (rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro)
tmpfs on /run/user/1000 type tmpfs (rw,nosuid,nodev,relatime,size=1623292k,nr_inodes=405823,mode=700,uid=1000,gid=1000,inode64)
/dev/nvme0n1p4 on /run/media/lsjarch/Reserve type fuseblk (rw,nosuid,nodev,relatime,user_id=0,group_id=0,default_permissions,allow_other,blksize=4096,uhelper=udisks2)

```

这个列表的格式是：`device on mont_point type filesystem_type(options)`。接下来，我们插入一个新的设备——U盘，重新调用`mount`命令，可以发现新出现一个设备项：

```shell
/dev/sdb1 on /run/media/lsjarch/Ventoy_Lsj type exfat (rw,nosuid,nodev,relatime,uid=1000,gid=1000,fmask=0022,dmask=0022,iocharset=utf8,errors=remount-ro,uhelper=udisks2)

```

接下来，我们尝试先将该设备卸载，然后挂载到文件系统树的另外一个节点上：（注意要先获取root权限）

```shell
<lsjarch@LsjsArch cmd_hisNum:507 ~>$ sudo -s
[sudo] lsjarch 的密码：
[root@LsjsArch lsjarch]# umount /dev/sdb1
[root@LsjsArch lsjarch]# mkdir /mnt/udisk
[root@LsjsArch lsjarch]# mount -t exfat /dev/sdb1 /mnt/udisk
[root@LsjsArch lsjarch]# cd /mnt/udisk/
[root@LsjsArch udisk]# ls
 打印                                 高中   archlinux-2021.12.01-x86_64.iso   Lsj     'System Volume Information'
'《大话数据结构》程杰_(有目录).pdf'   实验   bin                               p3.asm
[root@LsjsArch udisk]# 

```

这一套流程是：先查询到某一设备的名字，将其使用`umount`卸载，在任意处创建一个空目录作为挂载节点，使用带`-t file_type`选项的`mount`命令将该设备挂载到所创建目录。之后就可以正常访问。

要注意的是，这里创建的挂载节点本质就是一个目录，甚至都不需要空目录，尽管非空目录上挂载设备会将原有内容隐藏直到该设备被卸载。



接下来，如果想要直接卸载设备就会出现问题：

```shell
[root@LsjsArch udisk]# umount /dev/sdb1
umount: /mnt/udisk: 目标忙.

```

这是因为设备正在被某个用户或程序使用，仔细看当前工作目录就是挂载点。只要将工作目录切换到挂载节点以外的地方就可以正常卸载：

```shell
[root@LsjsArch udisk]# cd
[root@LsjsArch ~]# umount /dev/sdb1

```



**拓展阅读：**

> 为什么记得卸载很重要？
>
> 如果你看一下 free 命令的输出结果，这个命令用来显示关于内存使用情况的统计信息，你会看到一个统计值叫做”buffers“。计算机系统旨在尽可能快地运行。系统运行速度的 一个阻碍是缓慢的设备。打印机是一个很好的例子。即使最快速的打印机相比于计算机标准也 极其地缓慢。一台计算机如果它要停下来等待一台打印机打印完一页，再去执行其他操作，就会变得很慢。 在早期的个人电脑时代（多任务之前），这真是个问题。如果你正在编辑电子表格 或者是文本文档，每次你要打印文件时，计算机都会停下来而且变得不能使用。 计算机能以打印机可接受的最快速度把数据发送给打印机，但由于打印机不能快速地打印， 这个发送速度会非常慢。由于打印机缓存的出现，这个问题被解决了。打印机缓存是一个包含 RAM 内存 的设备，位于计算机和打印机之间。通过打印机缓存，计算机把要打印的结果发送到这个缓存区， 数据会迅速地存储到这个 RAM 中，这样计算机就能回去工作，而不用等待。与此同时，打印机缓存将会 以打印机可接受的速度把缓存中的数据缓慢地输出给打印机。
>
> 缓存被广泛地应用于计算机中，使其运行得更快。别让偶尔地的读取或写入慢设备的需求阻碍了 系统的运行速度。在真正与比较慢的设备交互之前，操作系统会尽可能多的读取或写入数据到内存中的 存储设备里。以 Linux 操作系统为例，你会注意到系统看似占用了多于它所需要的内存。 这不意味着 Linux 正在使用这些内存，而是意味着 Linux 正在利用所有可用的内存，来作为缓存区。
>
> 这个缓存区允许非常快速地对存储设备进行写入，因为写入物理设备的操作被延迟到后面进行。同时， 这些注定要传送到设备中的数据正在内存中堆积起来。时不时地，操作系统会把这些数据 写入物理设备。
>
> 卸载一个设备需要把所有剩余的数据写入这个设备，所以设备可以被安全地移除。如果 没有卸载设备，就移除了它，就有可能没有把注定要发送到设备中的数据输送完毕。在某些情况下， 这些数据可能包含重要的目录更新信息，这将导致文件系统损坏，这是发生在计算机中的最坏的事情之一。

#### 2.1.2 确定设备名称

上面例子中我们利用到现代Linux操作系统的一种能力——支持热插拔，自动挂载设备后确定设备名。但是如果在操作服务器或不支持自动挂载操作的计算机时，我们就需要确定设备的名称。

首先，我们要了解系统是如何命名设备的。首先查看一下/dev目录（所有设备都包含在此）：

```shell
<lsjarch@LsjsArch cmd_hisNum:498 ~>$ ls /dev
autofs           full       loop-control  nvme0n1p4  shm       tty18  tty35  tty52   ttyS11  ttyS29   vcs2   vfio
block            fuse       mapper        nvme1      snapshot  tty19  tty36  tty53   ttyS12  ttyS3    vcs3   vga_arbiter
bsg              gpiochip0  media0        nvme1n1    snd       tty2   tty37  tty54   ttyS13  ttyS30   vcs4   vhci
btrfs-control    hidraw0    mei0          nvme1n1p1  stderr    tty20  tty38  tty55   ttyS14  ttyS31   vcs5   vhost-net
bus              hidraw1    mem           nvme1n1p2  stdin     tty21  tty39  tty56   ttyS15  ttyS4    vcs6   vhost-vsock
char             hidraw2    mqueue        nvme1n1p3  stdout    tty22  tty4   tty57   ttyS16  ttyS5    vcsa   video0
console          hidraw3    mtd0          nvme1n1p4  tpm0      tty23  tty40  tty58   ttyS17  ttyS6    vcsa1  video1
core             hidraw4    mtd0ro        nvme1n1p5  tpmrm0    tty24  tty41  tty59   ttyS18  ttyS7    vcsa2  watchdog
cpu              hidraw5    mtd1          nvram      tty       tty25  tty42  tty6    ttyS19  ttyS8    vcsa3  watchdog0
cpu_dma_latency  hidraw6    mtd1ro        port       tty0      tty26  tty43  tty60   ttyS2   ttyS9    vcsa4  zero
cuse             hidraw7    net           ppp        tty1      tty27  tty44  tty61   ttyS20  udmabuf  vcsa5
disk             hidraw8    ng0n1         psaux      tty10     tty28  tty45  tty62   ttyS21  uhid     vcsa6
dma_heap         hpet       ng1n1         ptmx       tty11     tty29  tty46  tty63   ttyS22  uinput   vcsu
dri              hugepages  null          pts        tty12     tty3   tty47  tty7    ttyS23  urandom  vcsu1
drm_dp_aux0      hwrng      nvme0         random     tty13     tty30  tty48  tty8    ttyS24  usb      vcsu2
drm_dp_aux1      input      nvme0n1       rfkill     tty14     tty31  tty49  tty9    ttyS25  userio   vcsu3
drm_dp_aux2      kmsg       nvme0n1p1     rtc        tty15     tty32  tty5   ttyS0   ttyS26  v4l      vcsu4
fb0              kvm        nvme0n1p2     rtc0       tty16     tty33  tty50  ttyS1   ttyS27  vcs      vcsu5
fd               log        nvme0n1p3     sda        tty17     tty34  tty51  ttyS10  ttyS28  vcs1     vcsu6

```

有一些设备命名是有规律的：

| 模式 | 设备                                                         |
| ---- | ------------------------------------------------------------ |
| fd*  | 软盘驱动器                                                   |
| hd*  | 旧系统上的IDE（或PATA）硬盘。虽然个人机现在已经不再使用这类硬盘，但我们还是可以了解一下：过去典型主板有两个IDE连接点或通道，并且每个都有两个驱动器附着点。线缆上第一个驱动器叫主设备，第二个叫从设备，设备命名有这样的规则：/dev/had代表第一个通道上的主设备，/dev/hdb代表第一个通道上从设备；/dev/hdc代表第二个通道上的主设备，以此类推。末尾的数字代表设备的分区号，如/dev/had代表整个硬盘时，/dev/had1表示该硬盘驱动上的第一块分区。 |
| lp*  | 打印机设备                                                   |
| sd*  | SCSI硬盘。现代Linux系统将所有类硬盘设备（PATA/SATA硬盘、闪存、USB海量存储设备等）都当做SCSI硬盘，剩下命名规则与之前类似 |
| sr*  | 光驱（CD/DV播放机和刻录机）                                  |



如果使用的系统不能自动挂载可移动设备，那么可以用以下方法来配置：

获取插入设备的名称（在多数Linux发行版中可以使用`sudo tail -f /var/log/messages`来实时查看插入系统的可移动设备，好像通过比较`mount`命令比较插入设备签后的输出，也可以获取其名字）$\rarr$挂载到指定目录。只要设备一直与计算机保持连接并且系统没有重启，设备名就不会改变。

#### 2.1.3 配置开机自动挂载windows系统的硬盘

但由于我在ArchLinux中没有找到这个文件，并且我也遇到了需要自动挂载windows系统的其他硬盘的需求，通过查找资料、配置`/etc/fstab`文件实现：

* [fstab(5)](https://man.archlinux.org/man/fstab.5)文件可用于定义磁盘分区，各种其他块设备或远程文件系统应如何装入文件系统。

  每个文件系统在一个单独的行中描述。这些定义将在引导时动态地转换为系统挂载单元，并在系统管理器的配置重新加载时转换。在启动需要挂载的服务之前，默认设置会自动[fsck](https://wiki.archlinux.org/title/Fsck)和挂载文件系统。例如，[systemd](https://wiki.archlinux.org/title/Systemd)会自动确保远程文件系统挂载（如[NFS](https://wiki.archlinux.org/title/NFS)或[Samba](https://wiki.archlinux.org/title/Samba)）仅在网络设置完成后启动。因此，在`/etc/fstab`中指定的本地和远程文件系统挂载应该是开箱即用的。有关详细信息，请参阅 [systemd.mount(5)](https://man.archlinux.org/man/systemd.mount.5) 。

  `mount`命令将使用fstab，如果仅给出其中一个目录或设备，则填充其他参数的值。 这样做时，也将使用fstab中列出的挂载选项。

* **文件示例：**

  ```shell
  <lsjarch@LsjsArch cmd_hisNum:501 ~>$ cat /etc/fstab 
  # Static information about the filesystems.
  # See fstab(5) for details.
  
  # <file system> <dir> <type> <options> <dump> <pass>
  # /dev/nvme0n1p2
  UUID=94ee265d-94ba-4bae-86a5-fcee2cf63672       /               ext4            rw,relatime     0 1
  
  # /dev/nvme0n1p1
  UUID=193E-F519          /efi            vfat            rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro        0 2
  
  # /dev/nvme0n1p3
  UUID=ee5c1505-dc62-4bcd-a5d0-677def51a2a9       /home           ext4            rw,relatime     0 2
  ```

  

* **字段定义：**可以看到，上述示例中第五行列出了一串字段，通过空格或Tab分隔，它们的含义及可选值为：

  * `<file system>`：要挂载的分区或存储设备，通常使用UUID标识；

  * `<dir>`：挂载目录；

  * `<type>`：要挂载设备或是分区的文件系统类型；

  * `<option>`：挂载时使用的参数，一些比较常用的参数有：

            auto - 在启动时或键入了 mount -a 命令时自动挂载。
            noauto - 只在你的命令下被挂载。
            exec - 允许执行此分区的二进制文件。
            noexec - 不允许执行此文件系统上的二进制文件。
            ro - 以只读模式挂载文件系统。
            rw - 以读写模式挂载文件系统。
            user - 允许任意用户挂载此文件系统，若无显示定义，隐含启用 noexec, nosuid, nodev 参数。
            users - 允许所有 users 组中的用户挂载文件系统.
            nouser - 只能被 root 挂载。
            owner - 允许设备所有者挂载.
            sync - I/O 同步进行。
            async - I/O 异步进行。
            dev - 解析文件系统上的块特殊设备。
            nodev - 不解析文件系统上的块特殊设备。
            suid - 允许 suid 操作和设定 sgid 位。这一参数通常用于一些特殊任务，使一般用户运行程序时临时提升权限。
            nosuid - 禁止 suid 操作和设定 sgid 位。
            noatime - 不更新文件系统上 inode 访问记录，可以提升性能(参见 atime 参数)。
            nodiratime - 不更新文件系统上的目录 inode 访问记录，可以提升性能(参见 atime 参数)。
            relatime - 实时更新 inode access 记录。只有在记录中的访问时间早于当前访问才会被更新。（与 noatime 相似，但不会打断如 mutt 或其它程序探测文件在上次访问后是否被修改的进程。），可以提升性能(参见 atime 参数)。
            flush - vfat 的选项，更频繁的刷新数据，复制对话框或进度条在全部数据都写入后才消失。
            defaults - 使用文件系统的默认挂载参数，例如 ext4 的默认参数为:rw, suid, dev, exec, auto, nouser, async.

  * `<dump>`：dump 工具通过它决定何时作备份. dump 会检查其内容，并用数字来决定是否对这个文件系统进行备份。 允许的数字是 0 和 1 。0 表示忽略， 1 则进行备份。大部分的用户是没有安装 dump 的 ，对他们而言 <dump> 应设为 0。

  * `<pass>`：  fsck 读取 <pass> 的数值来决定需要检查的文件系统的检查顺序。允许的数字是0, 1, 和2。 根目录应当获得最高的优先权 1, 其它所有需要被检查的设备设置为 2. 0 表示设备不会被 fsck 所检查。

* **文件系统标识：**在 `/etc/fstab`配置文件中你可以以三种不同的方法表示文件系统：内核名称、UUID 或者 label。使用  UUID 或是 label 的好处在于它们与磁盘顺序无关。如果你在 BIOS 中改变了你的存储设备顺序，或是重新拔插了存储设备，或是因为一些  BIOS 可能会随机地改变存储设备的顺序，那么用 UUID 或是 label 来表示将更有效。参见 [持久化块设备名称](https://wiki.archlinux.org/title/Persistent_block_device_naming) 。

  要显示分区的基本信息，请运行命令`lsblk -f`:

  ```shell
  <lsjarch@LsjsArch cmd_hisNum:502 ~>$ lsblk -f
  NAME        FSTYPE FSVER LABEL   UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
  sda                                                                                  
  nvme0n1                                                                              
  ├─nvme0n1p1 vfat   FAT32         193E-F519                             798.1M     0% /efi
  ├─nvme0n1p2 ext4   1.0           94ee265d-94ba-4bae-86a5-fcee2cf63672     77G    16% /
  ├─nvme0n1p3 ext4   1.0           ee5c1505-dc62-4bcd-a5d0-677def51a2a9  102.4G    25% /home
  └─nvme0n1p4 ntfs         Reserve 9270B9BB70B9A67F                       95.8G    58% /mnt/w_reserve
  nvme1n1                                                                              
  ├─nvme1n1p1 vfat   FAT32         D048-BB18                                           
  ├─nvme1n1p2                                                                          
  ├─nvme1n1p3 ntfs         Windows 7CF0C5EFF0C5AFA6                       73.3G    58% /mnt/win_c
  ├─nvme1n1p4 ntfs         WinData 0E2AE8D52AE8BB3B                      114.1G    62% /mnt/win_windata
  └─nvme1n1p5 ntfs                 0CAA4A2BAA4A119E  
  ```

  

* **内核名称：**使用`fdisk -l`来获得内核名称，前缀是`dev`；

* **UUID：**所有分区和设备都有唯一的 UUID。它们由文件系统生成工具 (`mkfs.*`) 在创建文件系统时生成。

  `lsblk -f` 命令将显示所有设备的 UUID 值。

* 配置好的内容：

  ```shell
  <lsjarch@LsjsArch cmd_hisNum:505 ~>$ cat /etc/fstab 
  # Static information about the filesystems.
  # See fstab(5) for details.
  
  # <file system> <dir> <type> <options> <dump> <pass>
  # /dev/nvme0n1p2
  UUID=94ee265d-94ba-4bae-86a5-fcee2cf63672       /               ext4            rw,relatime     0 1
  
  # /dev/nvme0n1p1
  UUID=193E-F519          /efi            vfat            rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro        0 2
  
  # /dev/nvme0n1p3
  UUID=ee5c1505-dc62-4bcd-a5d0-677def51a2a9       /home           ext4            rw,relatime     0 2
  
  /swapfile none swap defaults 0 0
  
  
  # /dev/nvme0n1p4 E:windows_reserve
  UUID=9270B9BB70B9A67F /mnt/w_reserve    ntfs    rw,user,exec,sync,relatime 0 2
  
  # /dev/nvme1n1p3 C:windows
  UUID=7CF0C5EFF0C5AFA6 /mnt/win_c        ntfs    rw,user,exec,sync,relatime 0 2
  
  # /dev/nvme1n1p4 D:windata
  UUID=0E2AE8D52AE8BB3B /mnt/win_windata  ntfs    rw,user,exec,sync,relatime 0 2
  
  ```

  

* 如何查看Linux中硬盘信息的详细博客：[Linux中查看硬盘信息](https://daemon369.github.io/linux/2018/01/06/01-get-disks-info-in-linux)

* fstab的Arch官方文档：[fstab ArckWiki](https://wiki.archlinux.org/title/Fstab_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))；

### 2.2 创建新的文件系统



## 3. 网络

本章命令：`ping`, `traceroute`,`netstat`, `ftp`, `lftp`, `wget`, `ssh`, `scp`, `sftp`。

Linux工具可以建立各种网络系统及应用，包括防火墙、路由器、域名服务器、NAS（网络附加存储）盒等。

有些概念需要我们提前了解：

* IP address：互联网协议地址；
* host and domain name：主机名和域名；
* URI(Uniform resource identifier)：统一资源标识符；
* URL(Uniform resource locator)：统一资源定位符；

### 3.1 检查、监测网络

检查网络的性能和运行情况非常有必要。

#### 3.1.1 Ping——向网络主机发送特殊数据包

`ping`：会向指定的网络主机发送特殊网络数据包ICMP ECHO_REQUEST，多数网络设备收到数据包后会作出回应，通过此法可以验证网络连接是否正常；

> 注意：有时从安全角度出发，通常会配置部分网络通信设备以忽略这些数据包，这样可以降低主机遭受潜在攻击者攻击的可能性。当然，防火墙通常被设置为阻碍ICMP通信。

使用`ping`命令，会以既定的时间间隔（默认1s）传送数据包直到该命令被中断：

```shell
<lsjarch@LsjsArch cmd_hisNum:508 ~>$ ping baidu.com
PING baidu.com (220.181.38.148) 56(84) 字节的数据。
64 字节，来自 220.181.38.148 (220.181.38.148): icmp_seq=1 ttl=53 时间=16.2 毫秒
64 字节，来自 220.181.38.148 (220.181.38.148): icmp_seq=2 ttl=53 时间=16.1 毫秒
64 字节，来自 220.181.38.148 (220.181.38.148): icmp_seq=3 ttl=53 时间=16.3 毫秒
64 字节，来自 220.181.38.148 (220.181.38.148): icmp_seq=4 ttl=53 时间=16.0 毫秒
64 字节，来自 220.181.38.148 (220.181.38.148): icmp_seq=5 ttl=53 时间=16.1 毫秒
64 字节，来自 220.181.38.148 (220.181.38.148): icmp_seq=6 ttl=53 时间=16.1 毫秒
^C64 字节，来自 220.181.38.148: icmp_seq=7 ttl=53 时间=15.8 毫秒

--- baidu.com ping 统计 ---
已发送 7 个包， 已接收 7 个包, 0% packet loss, time 30222ms
rtt min/avg/max/mdev = 15.801/16.085/16.266/0.144 ms

```

按<kbd>ctrl</kbd>+<kbd>c</kbd>组合键终止Ping程序，Ping程序会将反映运行情况的数据显示出来，数据包丢失0%表示网络运行正常，Ping连接成功则表明网络各组成成员（接口卡、电缆、路由和网关）总体都处于连通状态。

#### 3.1.2 traceroute——跟踪网络数据包的传输路径

`traceroute(or tracepath)`：显示文件通过网络从本地系统传输到指定主机过程中所有停靠点的列表。

```shell
# traceroute命令
<lsjarch@LsjsArch cmd_hisNum:514 ~>$ traceroute baidu.com
traceroute to baidu.com (220.181.38.148), 30 hops max, 60 byte packets
 1  _gateway (192.168.1.1)  1.068 ms  1.089 ms  1.447 ms
 2  * * *
 3  219.149.132.205 (219.149.132.205)  4.453 ms  4.442 ms 219.149.132.1 (219.149.132.1)  4.827 ms
 4  * 219.149.132.129 (219.149.132.129)  6.159 ms 53.145.149.219.dial.ty.sx.dynamic.163data.com.cn (219.149.145.53)  5.900 ms
 5  202.97.34.97 (202.97.34.97)  13.568 ms 202.97.34.69 (202.97.34.69)  13.692 ms 202.97.21.125 (202.97.21.125)  20.333 ms
 6  36.110.246.50 (36.110.246.50)  16.410 ms 36.110.245.70 (36.110.245.70)  17.708 ms 36.110.243.42 (36.110.243.42)  19.358 ms
 7  36.110.246.209 (36.110.246.209)  21.994 ms 36.110.249.70 (36.110.249.70)  22.688 ms 36.110.249.58 (36.110.249.58)  12.917 ms
 8  * * *
 9  * 106.38.244.134 (106.38.244.134)  14.049 ms 106.38.244.150 (106.38.244.150)  17.081 ms
10  * * *
11  * * *
12  * * *
13  * * *
14  * * *
15  * * *
16  * * *
17  * * *
18  * * *
19  * * *
20  * * *
21  * * *
22  * * *
23  * * *
24  * * *
25  * * *
26  * * *
27  * * *
28  * * *
29  * * *
30  * * *

# tracepath命令
<lsjarch@LsjsArch cmd_hisNum:512 ~>$ tracepath baidu.com
 1?: [LOCALHOST]                      pmtu 1500
 1:  _gateway                                              2.997 毫秒 
 1:  _gateway                                              3.057 毫秒 
 2:  _gateway                                              3.402 毫秒 pmtu 1492
 2:  无应答
 3:  219.149.132.205                                       7.849 毫秒 
 4:  219.149.138.65                                        7.275 毫秒 
 5:  202.97.34.49                                         20.943 毫秒 
 6:  无应答
 7:  无应答
 8:  220.181.17.146                                       22.223 毫秒 
 9:  106.38.244.162                                       15.058 毫秒 
10:  无应答
11:  无应答
12:  无应答
13:  无应答
14:  无应答
15:  无应答
16:  无应答
17:  无应答
18:  无应答
19:  无应答
20:  无应答
21:  无应答
22:  无应答
23:  无应答
24:  无应答
25:  无应答
26:  无应答
27:  无应答
28:  无应答
29:  无应答
30:  无应答
     Too many hops: pmtu 1492
     回程: 路径MTU 1492 
```

由该列表可知，从测试系统本地到http://www.baidu.com的连接路径需要经过30个路由器，对于那些提供身份信息的路由器，此列表则列出了它们的主机名、IP地址以及运行状态信息，这些信息包含了文件从本地系统到路由器3次往返时间。而对于那些因为路由器配置、网络堵塞或是防火墙等原因不提供身份信息的路由器，则直接用星号行表示。

#### 3.1.3 netstat——检查网络设置及相关统计数据

`netstat`：用于查看不同的网络设置及数据。通过其丰富的参数选项，可以查看网络启动过程的许多特性。

> 如果输入该命令有“未找到命令”的报错，则应该安装net-tools：`sudo pacman -S net-tools`；

**使用`-ie`选项可以检查系统中的网络接口信息：**

```shell
<lsjarch@LsjsArch cmd_hisNum:520 ~>$ netstat -ie
Kernel Interface table
enp4s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.31  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 240e:325:75d:5d00:31f9:eab7:9b21:6747  prefixlen 64  scopeid 0x0<global>
        inet6 fe80::6ba:7939:b502:d1dd  prefixlen 64  scopeid 0x20<link>
        ether b0:25:aa:30:58:48  txqueuelen 1000  (Ethernet)
        RX packets 1460450  bytes 1897541732 (1.7 GiB)
        RX errors 0  dropped 100  overruns 0  frame 0
        TX packets 694280  bytes 64766432 (61.7 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 1156310  bytes 1748724611 (1.6 GiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1156310  bytes 1748724611 (1.6 GiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.24  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::c94b:e8a5:76d0:9d81  prefixlen 64  scopeid 0x20<link>
        inet6 240e:325:75d:5d00:dc57:c020:5c6a:ee55  prefixlen 64  scopeid 0x0<global>
        ether 90:78:41:a2:02:33  txqueuelen 1000  (Ethernet)
        RX packets 16095  bytes 4834009 (4.6 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 6097  bytes 1056449 (1.0 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

```

以上输出信息显示，本机系统有三个网络端口：第一个为enp4s0，是以太网端口；第二个为lo，是系统用来自己访问自己的回环虚拟接口；第三个为wlan0，是无线局域网接口。

对网络进行日常诊断，关键是看能否在每个接口信息第二行的inet addr字段找到有效的IP地址。对于使用动态主机配置协议的系统（DHCP），inet addr字段里面的有效IP地址则说明了DHCP正在工作。

**使用`-r`选项将显示内核的网络路由表**，此表显示了网络之间传送数据包时网络的配置情况：

```shell
<lsjarch@LsjsArch cmd_hisNum:523 ~>$ netstat -r
Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
default         _gateway        0.0.0.0         UG        0 0          0 wlan0
default         _gateway        0.0.0.0         UG        0 0          0 enp4s0
192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 enp4s0
192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 wlan0

```

此例显示的是运行在防火墙/路由器后面的局域网（LAN）上一客户端的典型路由表。接受方的IP地址如果以0结尾，表示接收方是网络而非个人主机，也就是说接收方可以是局域网（LAN）上的任何主机。Gateway参数字段，表示的是建立当前主机与目标网络之间联系的网关（或路由）的名称或IP地址，此参数是星号则表示无需网关。

`netstat`程序也有很多参数选项，而以上只列举了其中两个，要了解其整个参数列表可以查看`netstat`的`man`手册。

### 3.2 通过网络传输文件

网络的关键价值，就是在于可以传输文件。

#### 3.2.1 ftp——采用FTP传输文件

ftp，全称是File Transfer Protocol，即文件传输协议。ftp程序比Web浏览器出现的更早，它用来与FTP服务器进行通信，而FTP服务器就是提供网络上传、下载文件的机器。

不过FTP并不安全，因为它以明文的方式传送账户名及密码，这意味着这些信息并没有加密，任何一个接触网络的人都能看到它们。鉴于此，几乎所有使用FTP协议进行的网络文件传输都是由匿名FTP服务器处理的，匿名服务器允许任何人使用anonymous登录名以及无意义的密码登录。

#### 3.2.2 lftp——更好地ftp

由Alexander Lukyanov编写的lftp命令，除传统的ftp程序功能外还提供多协议支持(HTTP)、下载失败时自动重新尝试、后台进程支持、Tab键完成用户名输入等许多其他功能。

```shell
<lsjarch@LsjsArch cmd_hisNum:531 ~>$ lftp
lftp :~> help 
    !<shell-command>                     (commands)                           alias [<name> [<value>]]
    attach [PID]                         bookmark [SUBCMD]                    cache [SUBCMD]
    cat [-b] <files>                     cd <rdir>                            chmod [OPTS] mode file...
    close [-a]                           [re]cls [opts] [path/][pattern]      debug [OPTS] [<level>|off]
    du [options] <dirs>                  edit [OPTS] <file>                   exit [<code>|bg]
    get [OPTS] <rfile> [-o <lfile>]      glob [OPTS] <cmd> <args>             help [<cmd>]
    history -w file|-r file|-c|-l [cnt]  jobs [-v] [<job_no...>]              kill all|<job_no>
    lcd <ldir>                           lftp [OPTS] <site>                   ln [-s] <file1> <file2>
    ls [<args>]                          mget [OPTS] <files>                  mirror [OPTS] [remote [local]]
    mkdir [OPTS] <dirs>                  module name [args]                   more <files>
    mput [OPTS] <files>                  mrm <files>                          mv <file1> <file2>
    mmv [OPTS] <files> <target-dir>      [re]nlist [<args>]                   open [OPTS] <site>
    pget [OPTS] <rfile> [-o <lfile>]     put [OPTS] <lfile> [-o <rfile>]      pwd [-p]
    queue [OPTS] [<cmd>]                 quote <cmd>                          repeat [OPTS] [delay] [command]
    rm [-r] [-f] <files>                 rmdir [-f] <dirs>                    scache [<session_no>]
    set [OPT] [<var> [<val>]]            site <site_cmd>                      source <file>
    torrent [OPTS] <file|URL>...         user <user|URL> [<pass>]             wait [<jobno>]
    zcat <files>                         zmore <files>

```



#### 3.2.3 wget——非交互式网络下载工具

`wget`是另一个用于文件下载的命令行程序，该命令既可以用于从网站上下载内容，也可以用于从FTP站点下载，单个文件、多个文件甚至整个网站都可以被下载。我们尝试用`wget`下载网站https://www.linuxcommand.org/第一页内容：

```shell
<lsjarch@LsjsArch cmd_hisNum:532 ~>$ wget https://linuxcommand.org/index.php
--2022-02-03 01:23:03--  https://linuxcommand.org/index.php
SSL_INIT
已载入 CA 证书“/etc/ssl/certs/ca-certificates.crt”
正在解析主机 linuxcommand.org (linuxcommand.org)... 216.105.38.11
正在连接 linuxcommand.org (linuxcommand.org)|216.105.38.11|:443... 已连接。
已发出 HTTP 请求，正在等待回应... 200 OK
长度：3868 (3.8K) [text/html]
正在保存至: “index.php”

index.php                       100%[====================================================>]   3.78K  --.-KB/s  用时 0s      

2022-02-03 01:23:05 (102 MB/s) - 已保存 “index.php” [3868/3868])

<lsjarch@LsjsArch cmd_hisNum:533 ~>$ ls | grep index
index.php
# 可以看到，下载文件的保存路径默认为当前工作路径
```

wget命令的许多参数选项支持递归下载、后台文件下载（允许下线的情况下继续下载）以及继续下载部分被下载的文件等操作，这些特点都清楚地写在该命令的better-than-average man手册页中。

### 3.3 与远程主机的安全通信

#### 3.3.1 ssh——安全登录远程计算机

SSH(Secure Shell的缩写)协议解决了与远程主机进行安全通信的两个基本问题：

1. 该协议能验证远程主机的身份是否真实，从而避免中间人攻击；
2. 该协议将本机与远程主机之间的通信内容全部加密；

SSH协议包括两个部分：

1. 运行在远程主机上的SSH服务端，用来监听端口22上可能传来的连接请求；
2. 本地系统上的SSH客户端，用来与远程服务器进行通信。

多数Linux发行版都采用BSD项目的openSSH（SSH的开源免费实现）方法来实现SSH。有些发行版如Red Hat会默认包含客户端包和服务端包；而有的发行版如Ubuntu则只提供客户端包，系统想要接受远程连接，就必须安装、配置以及运行openSSH-server软件包，并且必须允许TCP端口22上进来的网络连接（当服务器正在运行防火墙或是在防火墙后面时）。

> 注意，如果没有可以连接的远程系统，可以在系统安装了openSSH-server软件包的基础上将远程主机名设置为本机主机名，这样机器就会与自身建立网络连接。



## 4. 文件搜索

本章命令：`locate`, `find`, `xargs`, `touch`, `stat`。

### 4.1 `locate`——简单地查找文件

`locate`：通过快速搜索数据库，以寻找路径名与给定子字符串相匹配的文件，同时输出所有匹配结果。

例如，要查找以`zip`字符串开头的所有程序，可以先认为这些文件都位于`bin`目录下，因此可以尝试下面这个命令：

```shell
<lsjarch@LsjsArch cmd_hisNum:500 ~>$ locate bin/zip
```

之后，`locate`程序将会搜索该路径名数据库，并输出文件名包含字符串`bin/zip`的所有文件：

```shell
/usr/bin/zip
/usr/bin/zipcloak
/usr/bin/zipcmp
/usr/bin/zipmerge
/usr/bin/zipnote
/usr/bin/zipsplit
/usr/bin/ziptool

```

如果有更多需求，可以结合`grep`工具实现：

```shell
<lsjarch@LsjsArch cmd_hisNum:501 ~>$ locate zip | grep bin
/home/lsjarch/.gradle/wrapper/dists/gradle-7.0.2-bin/857tjihv64xamwrf0h14cai3r/gradle-7.0.2-bin.zip
/home/lsjarch/.gradle/wrapper/dists/gradle-7.0.2-bin/857tjihv64xamwrf0h14cai3r/gradle-7.0.2-bin.zip.lck
/home/lsjarch/.gradle/wrapper/dists/gradle-7.0.2-bin/857tjihv64xamwrf0h14cai3r/gradle-7.0.2-bin.zip.ok
/home/lsjarch/.gradle/wrapper/dists/gradle-7.2-bin/2dnblmf4td7x66yl1d74lt32g/gradle-7.2-bin.zip
/home/lsjarch/.gradle/wrapper/dists/gradle-7.2-bin/2dnblmf4td7x66yl1d74lt32g/gradle-7.2-bin.zip.lck
/home/lsjarch/.gradle/wrapper/dists/gradle-7.2-bin/2dnblmf4td7x66yl1d74lt32g/gradle-7.2-bin.zip.ok
/home/lsjarch/.local/share/JetBrains/Toolbox/apps/CLion/ch-0/213.6461.75/bin/gdb/linux/lib/python38.zip
/home/lsjarch/.local/share/JetBrains/Toolbox/apps/CLion/ch-0/213.6461.75/bin/lldb/linux/lib/python38.zip
/usr/bin/bunzip2
/usr/bin/bzip2
/usr/bin/bzip2recover
/usr/bin/gunzip
/usr/bin/gzip
/usr/bin/zip
/usr/bin/zipcloak
/usr/bin/zipcmp
/usr/bin/zipmerge
/usr/bin/zipnote
/usr/bin/zipsplit
/usr/bin/ziptool
/usr/bin/core_perl/streamzip
/usr/bin/core_perl/zipdetails

```

`locate`历史悠久，已经有很多高级版，现代Linux系统多用`slocate`和`mlocate`，它们通常都是由名为`locate`的符合连接访问。在ArchLinux的官方源中有`plocate`工具可供使用。具体如何使用，可以查看`locate`的`man`手册。

> `locate`的搜索数据库从何而来？
>
> 刚下载`locate`工具后就立即使用，多半会报错：
>
> ```shell
> pread: Short read (file corrupted?)
> ```
>
> 这是因为`locate`的搜索数据库是由叫做`updatedb`的程序创建，而该程序作为一个`cron`任务定期执行。`cron`任务就是指定期由`cron`守护进程执行的任务，通常是每天执行一次。因此，如果`locate`报错可能是由于该数据库还未更新。可以切换到root用户手动运行`updatedb`程序：
>
> ```shell
> <lsjarch@LsjsArch cmd_hisNum:498 ~>$ sudo -s
> [root@LsjsArch lsjarch]# updatedb
> ```
>
> 之后就可以正常运行`locate`程序。

### 4.2 `find`——复杂地查找文件

`find`：依据文件的各种属性在既定目录（及其子目录）里查找。而`locate`仅仅是依据文件名。

`find`最简单的用法就是用户给定一个或是多个目录名作为搜索范围，如`find`列出当前系统主目录（~）下的文件列表清单：

```shell
<lsjarch@LsjsArch cmd_hisNum:504 ~>$ find ~
```

这时你的`bash`一定会被大量信息刷屏:smile:，不过要知道这些信息是以标准形式列出的，这意味着可以直接将这些输出结果作为其他程序的输入。如用`wc`程序计算`find`到的文件总数：

```shell
[root@LsjsArch lsjarch]# find ~ | wc -l
6110
```

接下来，我们将学习综合`test`选项、`action`选项、`options`选项来实现高级文件搜索。

#### 4.2.1 `test`选项

添加`test`参数`-type d`可以将搜索范围限制为目录：

```shell
[root@LsjsArch lsjarch]# find ~ -type d | wc -l
2587
```

而`-type f`则只对普通文件进行搜索：

```shell
[root@LsjsArch lsjarch]# find ~ -type f | wc -l
3522
```

下表列出了`find`命令的支持文件类型：

| 文件类型 | 描述         |
| -------- | ------------ |
| b        | 块设备文件   |
| c        | 字符设备文件 |
| d        | 目录         |
| f        | 普通文件     |
| l        | 符号链接     |

另外可以添加其他`test`参数来实现依据文件大小和文件名的搜索：

```shell
[root@LsjsArch lsjarch]# find ~ -type f -name "*.txt" -size 1M | wc -l
1
```

这条命令表示搜索该目录下所有符合以`.txt`结尾的大小等于1MB的文件。

* `-name`选项中用双引号包围所查文件名，是为了放置通配符的路径名扩散；
* `-size`选项中用`+`表示查找比给定值大的文件，`-`表示查找比给定值小的文件，不添加符号则表示等于，这个写法适用于所有用到数值参数的情况。末尾`M`是计量单位`MB`的简写；

下表列出了每个字母与特定计量单位之间的对应关系：

| 字母 | 计量单位              |
| ---- | --------------------- |
| b    | 512字节的块（默认值） |
| c    | 字节                  |
| w    | 两个字节的字          |
| k    | KB                    |
| M    | MB                    |
| G    | GB                    |

常见的`test`参数还有：

| test参数       | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| -cmin n        | 匹配n分钟前改变状态（内容或属性）的文件或目录。如果不到n分钟，就用`-n`，超过n分钟就用`+n` |
| -cnewer file   | 匹配内容或属性的修改时间比文件file更晚的文件或目录           |
| -ctime n       |                                                              |
| -empty         |                                                              |
| -group name    |                                                              |
| -iname pattern |                                                              |
| -inum n        |                                                              |
| -mmin n        |                                                              |
| -mtime n       |                                                              |
| -name pattern  |                                                              |
| -newer file    |                                                              |
| -nouser        |                                                              |

## 5. 归档和备份

## 6. 正则表达式

## 7. 文本处理

## 8. 格式化输出

## 9. 打印

## 10. 编译程序