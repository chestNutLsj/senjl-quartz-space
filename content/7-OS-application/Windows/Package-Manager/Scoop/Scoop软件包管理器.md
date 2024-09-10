## 为什么要用软件包管理器？
类似Mac、Linux下的软件包管理器homebrew、apt、pacman等，Scoop是Windows下的软件包管理器，使用软件包管理器进行软件安装和管理好处多多，比如：
- 安装软件包时快捷地添加用户环境变量，方便在终端中直接运行`.exe`；
- 方便统一对软件包进行查找、安装、升级、移除等操作；
- 最大限度的避免流氓软件问题，大量软件都可以在Scoop官方校验过的源中获得，唯一有可能出现问题的就是第三方源，这方面选择热门的源也可以降低风险；
- 可以选择回滚或安装特定版本的软件，方便地清理软件数据和进行备份迁移等操作；
- balabala...

## Scoop基本介绍
参考Scoop官方的介绍：[Scoop](https://github.com/ScoopInstaller/Scoop)。。

Scoop的软件管理逻辑：
- 对于Scoop来说，其数据存储逻辑是先划好一块地盘——「Scoop」根目录，然后软件本体一个「apps」目录，用户数据一个「persist」目录。当然实际使用过程中，其实有挺多第三方仓库中的软件没有实现这一逻辑，依然把用户数据藏在「AppData」目录中，这就是需要优化的后话了。

## Scoop 安装

### 前置条件
根据官方的条件要求，需要：
1. Windows 7 SP1+或Windows Server 2008+（当然你用主流的Windows 10或Windows 11更没有什么问题）。
2. [PowerShell 5](https://link.zhihu.com/?target=https%3A//www.microsoft.com/en-us/download/details.aspx%3Fid%3D54616)（及以上，包含[PowerShell Core](https://link.zhihu.com/?target=https%3A//docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows%3Fview%3Dpowershell-7.2%26viewFallbackFrom%3Dpowershell-6)）和[.NET Framework 4.5](https://link.zhihu.com/?target=https%3A//docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows%3Fview%3Dpowershell-7.2%26viewFallbackFrom%3Dpowershell-6)（及以上）（当然我相信读者朋友们肯定都满足了，实在未满足可通过文本链接前去下载）。

还有两个中国用户需要确认的额外的条件：
1. 由于众所周知的天朝网络原因，你需要能够正常访问Github并下载其资源。（这里我建议使用Clash_for_windows，其可以方便的对终端进行代理，如果只代理桌面和浏览器，有些通信协议没有经过代理仍然会导致Scoop无法成功运行）
2. 由于环境变量中文路径的支持问题，你的Windows用户名或自定义的安装路径不得包含中文。（如果不幸在安装Windows时将用户文件夹设置为中文名，那你可能需要查看这篇文章：[[修改C盘User目录中用户名]]）

### 安装PowerShell和Windows Terminal
这二者分别是Windows下好用的Shell软件和终端软件，且都可以在Microsoft Store中快速获取、安装

### 设置PowerShell权限
这一点非常关键，有可能涉及到接下来的安装。

首先是设置PowerShell对脚本的执行策略：
```shell
# 在powershell中键入以下命令
$ Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 安装Scoop
官方提供了一个安装脚本[ScoopInstaller/Install](https://github.com/ScoopInstaller/Install)，键入如下命令即可一键安装Scoop：
```shell
$ irm get.scoop.sh | iex
# Use proxies if you have network trouble in accessing Github, e.g.
$ irm get.scoop.sh -Proxy 'http://<ip.port>' | iex
```
但很可惜，在大陆地区由于网络问题这个命令无法运行，其无法连接到远端仓库，甚至在我运行时开启了Clash系统代理，仍然无法解决；
并且这个命令会将Scoop默认安装到`C:\Users\<your username>\scoop`，但对于我这样的系统盘洁癖患者来说，这是无法容忍的，好在官方安装说明中给出了如下解决办法：
```shell
# If you want to have an advanced installation. You can download the installer and manually execute it with parameters.
$ irm get.scoop.sh -outfile 'install.ps1'

# To see all configurable parameters of the installer.
$ .\install.ps1 -?

# For example, install scoop to a custom directory, configure scoop to install global programs to a custom directory, and bypass system proxy while installation.
$ .\install.ps1 -ScoopDir 'D:\Applications\Scoop' -ScoopGlobalDir 'D:\Applications\GlobalScoopApps' -NoProxy
```
还有一种修改环境变量的方法来修改安装目录，但这并不推荐。

#### 取巧办法
综合以上策略，我得出如下方法来给大陆地区成功安装Scoop的步骤：
1. 开启脚本执行策略
2. 使用代理下载安装脚本`install.ps1`
3. 解压安装包，在对应目录下打开PowerShell，执行安装脚本的命令，不要忘记设置Scoop安装目录和全局目录
4. 如遇执行策略权限问题，可以选择根据报错信息查找Microsoft的文档，开启另一条执行策略权限，然后再次执行