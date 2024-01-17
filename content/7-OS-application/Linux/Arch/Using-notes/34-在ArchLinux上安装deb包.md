> [! warning] 使用须知!!!
>  不推荐 Arch 小白直接使用此方法安装 deb 包，请先查看 AUR 中是否有前人发布过所需软件包。
>  DEB 包安装中所依赖的库、内核有极大可能与 Arch 并不相同，甚至安装目录也与 Arch 用户的习惯不一致，这将导致安装失败、无法使用、甚至污染环境等一系列问题，请谨慎小心！

使用debtap对deb包进行转换，再使用pacman安装本地包。具体步骤如下：

### 安装debtap
DEBTAP，意思是 **DEB** **T**o **A**rchlinux **P**ackage。在AUR中可以下载debtap：
```shell
$ yay -S debtap
```

同时，ArchLinux上应该具备`bash`, `binutils`, `pkgfile`, `fakeroot`包作为依赖。

### 更新debtap数据库
在特权模式下执行更新命令：
```shell
$ sudo debtap -u
```

示例输出如下：
```shell
==> Synchronizing pkgfile database...
:: Updating 6 repos...
download complete: archlinuxfr [ 151.7 KiB 67.5K/s 5 remaining]
download complete: multilib [ 319.5 KiB 36.2K/s 4 remaining]
download complete: core [ 707.7 KiB 49.5K/s 3 remaining]
download complete: testing [ 1716.3 KiB 58.2K/s 2 remaining]
download complete: extra [ 7.4 MiB 109K/s 1 remaining]
download complete: community [ 16.9 MiB 131K/s 0 remaining]
:: download complete in 131.47s < 27.1 MiB 211K/s 6 files >
:: waiting for 1 process to finish repacking repos...
==> Synchronizing debtap database...
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 34.1M 100 34.1M 0 0 206k 0 0:02:49 0:02:49 --:--:-- 180k
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 814k 100 814k 0 0 101k 0 0:00:08 0:00:08 --:--:-- 113k
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 120k 100 120k 0 0 61575 0 0:00:02 0:00:02 --:--:-- 52381
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 35.4M 100 35.4M 0 0 175k 0 0:03:27 0:03:27 --:--:-- 257k
==> Downloading latest virtual packages list...
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 149 0 149 0 0 49 0 --:--:-- 0:00:03 --:--:-- 44
100 11890 0 11890 0 0 2378 0 --:--:-- 0:00:05 --:--:-- 8456
==> Downloading latest AUR packages list...
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 264k 0 264k 0 0 30128 0 --:--:-- 0:00:09 --:--:-- 74410
==> Generating base group packages list...
==> All steps successfully completed!
```

### 转换deb软件包
使用如下命令：
```shell
$ debtap /path/to/deb_pkg
```

命令执行期间，需要输入包的维护者和许可证，转换速度取决于CPU速度，稍等即可。

示例输出如下 （来自Quadrapassel包示例）：
```shell
==> Extracting package data...
==> Fixing possible directories structure differencies...
==> Generating .PKGINFO file...
:: Enter Packager name:
quadrapassel
:: Enter package license (you can enter multiple licenses comma separated):
GPL
*** Creation of .PKGINFO file in progress. It may take a few minutes, please wait...
Warning: These dependencies (depend = fields) could not be translated into Arch Linux packages names:
gsettings-backend
==> Checking and generating .INSTALL file (if necessary)...
:: If you want to edit .PKGINFO and .INSTALL files (in this order), press (1) For vi (2) For nano (3) For default editor (4) For a custom editor or any other key to continue:
==> Generating .MTREE file...
==> Creating final package...
==> Package successfully created!
==> Removing leftover files...
```

有两个参数可以略过问题：
```shell
# 忽略除了编辑元数据外所有问题
$ debtap -q /path/to/deb_pkg

# 忽略所有问题（不推荐）
$ debtap -Q /path/to/deb_pkg
```

### 使用pacman本地化安装转换后的软件包
使用`-U`参数：
```shell
$ sudo pacman -U /path/to/pkg
```

### 可能的报错
在更新debtap数据库时我遇到了两种报错，都跟GFW有关，但二者报错并不一样。1. 一开始直连的时候，会显示所有环节均成功完成，但运行deptap转换deb包的命令时仍会显示“需要至少在特权模式下运行一次debtap -u”；
2. 在Clash开启TUN模式后使用代理，会卡在第四个数据库同步的地方然后报错。

解决办法是替换debtap的源：
```shell
$ sudo vim /usr/bin/debtap
```
在其中找到`http://ftp.debian.org/debian/dists`字段，将其替换为`https://mirrors.ustc.edu.cn/debian/dists`，共三处；
找到`http://archive.ubuntu.com/ubuntu/dists`字段，将其替换为`https://mirrors.ustc.edu.cn/ubuntu/dists`，共一处；

### 参考
- [How to Convert DEB Packages Into Arch Linux Packages?](https://ostechnix.com/convert-deb-packages-arch-linux-packages/)
- [如何解决debtap同步仓库国内执行慢的问题？](https://www.yisu.com/zixun/599026.html)