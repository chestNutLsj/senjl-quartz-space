---
publish: "true"
tags:
  - ArchLinux
  - Linux
---

### 00. Pacman常用命令
#### 0000. 安装软件包
```shell
$ sudo pacman -S package_name # 安装软件包
$ sudo pacman -S $(pacman -Ssq package_regular_expression) # 通过包正则表达式安装一系列软件包
$ sudo pacman -S repo_name/package_name # 安装指定仓库的软件包
$ sudo pacman -S gnome # 安装gnome包组内所有软件包
$ pacman -Sg gnome # 查看属于包组gnome的所有包
```

> [!tip]
> 有的包组包含大量的软件包，有时用户只需其中几个。除了逐一键入序号外，pacman 还支持选择或排除某个区间内的的软件包：
> `Enter a selection (default=all): 1-10 15`
> 这将选中序号 1 至 10 和 15 的软件包。而
> `Enter a selection (default=all): ^5-8 ^2`
> 将会选中除了序号 5 至 8 和 2 之外的所有软件包。

> [!tip]
> 如果列表中的包已经安装在系统中，它会被重新安装，即使它已经是最新的。可以用 `--needed` 选项覆盖这种行为。

> [!warning]
> 在 Arch 上安装软件包时，请避免在还没有[更新系统](https://wiki.archlinuxcn.org/wiki/Pacman?rdfrom=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%3Ftitle%3DPacman_%28%25E7%25AE%2580%25E4%25BD%2593%25E4%25B8%25AD%25E6%2596%2587%29%26redirect%3Dno#%E5%8D%87%E7%BA%A7%E8%BD%AF%E4%BB%B6%E5%8C%85)前刷新同步软件包列表（例如，当官方软件仓库[不再提供某个软件包](https://wiki.archlinuxcn.org/wiki/Pacman?rdfrom=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%3Ftitle%3DPacman_%28%25E7%25AE%2580%25E4%25BD%2593%25E4%25B8%25AD%25E6%2596%2587%29%26redirect%3Dno#%E5%AE%89%E8%A3%85%E6%97%B6%E6%97%A0%E6%B3%95%E8%8E%B7%E5%8F%96%E8%BD%AF%E4%BB%B6%E5%8C%85)时）。实际操作上，请使用 `pacman -Syu _软件包名_`, 而**不要**使用 `pacman -Sy _软件包名_`，因为后者可能会导致依赖问题。参见 [System maintenance#不支持部分升级](https://wiki.archlinuxcn.org/wiki/System_maintenance#%E4%B8%8D%E6%94%AF%E6%8C%81%E9%83%A8%E5%88%86%E5%8D%87%E7%BA%A7 "System maintenance")一文和 [BBS#89328 论坛讨论](https://bbs.archlinux.org/viewtopic.php?id=89328)。

#### 0001. 删除软件包
```shell
$ sudo pacman -R package_name # 删除软件包，保留其全部已经安装的依赖关系
$ sudo pacman -Rs package_name # 删除软件包，及其所有没有被其他已安装软件包使用的依赖包
$ sudo pacman -Rsu package_name # 在上一条指令被拒绝时运行
$ sudo pacman -Rsc package_name # 递归删除软件包及所有依赖这个包的程序（千万小心使用）
$ sudo pacman -Rdd pkg_name # 删除一个被其他软件包所依赖的软件包，但不删除依赖这个软件包的其他软件包（此命令也很危险，尽量避免使用）
$ sudo pacman -Rn pkg_name # pacman删除某些程序时会备份重要配置文件，在其后添加`.pacsave`扩展名，使用-n选项可以避免备份这些文件
```

#### 0002. 升级软件包
```shell
$ sudo pacman -Syyu # 升级系统，同步远程软件仓库并升级系统的软件包 -yy：标记强制刷新、-u：标记升级动作
```

> [!warning]
> - 建议用户遵守[System maintenance#更新系统](https://wiki.archlinuxcn.org/wiki/System_maintenance#%E6%9B%B4%E6%96%B0%E7%B3%BB%E7%BB%9F "System maintenance")的指导，定期更新系统，并不盲目地执行这些命令。
> - Arch 只支持系统完整升级，详细参见[System maintenance#不支持部分升级](https://wiki.archlinuxcn.org/wiki/System_maintenance#%E4%B8%8D%E6%94%AF%E6%8C%81%E9%83%A8%E5%88%86%E5%8D%87%E7%BA%A7 "System maintenance")和[安装软件包](https://wiki.archlinuxcn.org/wiki/Pacman?rdfrom=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%3Ftitle%3DPacman_%28%25E7%25AE%2580%25E4%25BD%2593%25E4%25B8%25AD%25E6%2596%2587%29%26redirect%3Dno#%E5%AE%89%E8%A3%85%E8%BD%AF%E4%BB%B6%E5%8C%85)。

#### 0003. 查询软件包
pacman 使用 `-Q` 参数查询本地软件包数据库， `-S` 查询同步数据库，以及 `-F`查询文件数据库。要了解每个参数的子选项，分别参见 `pacman -Q --help`，`pacman -S --help`和`pacman -F --help`。
```shell
$ pacman -Ss string1 string2 # 在同步数据库中搜索包，包括包的名称和描述
$ pacman -Si pkg_name # 显示软件包的详细信息

$ pacman -Qs package_name # 检查已安装包的相关信息。-Q：查询本地软件包数据库
$ pacman -Qi pkg_name # 查询本地安装包的详细信息
$ pacman -Qii pkg_name # 同时显示备份文件和修改状态
$ pacman -Ql pkg_name # 获取已安装软件包所含文件的列表
$ pacman -Qk pkg_name # 查询软件包安装的文件是否都存在
$ pacman -Qo /path/to/file_name # 查询数据库获取参数中文件属于那个软件包
$ pacman -Qdt # 找出孤立包。-d：标记依赖包、-t：标记不需要的包、-dt：合并标记孤立包
$ pacman -Qet # 罗列所有明确安装且不被其他包依赖的软件包
$ sudo pacman -Rns $(pacman -Qtdq) #  组合命令，删除孤立包

$ pacman -F string1 string2 # 按文件名查找软件库
$ pacman -Fy # 更新命令查询文件列表数据库
$ pacman -Fl pkg_name # 查询远程库中软件包包含的文件
```


#### 0004. 依赖查询
```shell
$ pactree package_name # 查看一个包的依赖树（需要安装pacman-contrib才能使用)
$ pactree -r pkg_name # 查看一个包被哪些软件包所依赖
```

#### 0005. 数据库结构
pacman数据库通常位于 `/var/lib/pacman/sync`. 对于每一个在`/etc/pacman.conf`中指定的软件仓库， 这里都有一个一致的数据库。数据库文件夹里每个tar.gz文件都包含着一个仓库的软件包信息。例如`which`包:
```shell
$ tree which-2.21-5

which-2.21-5
|-- desc
```
这个 `depends` 项列出了该软件的依赖包， 而`desc`有该包的介绍，例如文件大小和MD5值 。

#### 0006. 清理软件包缓存
pacman 将下载的软件包保存在 `/var/cache/pacman/pkg/` 并且不会自动移除旧的和未安装版本的软件包。这样做有一些好处：

1.  这样允许[降级](https://wiki.archlinuxcn.org/wiki/Downgrading_packages "Downgrading packages")软件包而不需要通过其他方式提取旧版本，例如 [Arch Linux Archive](https://wiki.archlinuxcn.org/wiki/Arch_Linux_Archive "Arch Linux Archive").
2.  被卸载的软件包可以轻易地直接从缓存文件夹重新安装，不需要重新从软件仓库下载。

然而，需要定期手动清理缓存来避免该文件夹无限制增大。

[pacman-contrib](https://archlinux.org/packages/?name=pacman-contrib)包 提供的 [paccache(8)](https://man.archlinux.org/man/paccache.8) 脚本默认会删除所有缓存的版本和已卸载的软件包，除了最近的3个会被保留：
```shell
$ paccache -r
```

[启用](https://wiki.archlinuxcn.org/wiki/Enable "Enable") (systemctl enable)和 [启动](https://wiki.archlinuxcn.org/wiki/Start "Start") (systemctl start)`paccache.timer`来每周删除不使用的包。
![[paccache.timer.png]]

> [!tip]
**提示：** 可以使用[钩子](https://wiki.archlinuxcn.org/wiki/Pacman?rdfrom=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%3Ftitle%3DPacman_%28%25E7%25AE%2580%25E4%25BD%2593%25E4%25B8%25AD%25E6%2596%2587%29%26redirect%3Dno#%E9%92%A9%E5%AD%90)自动执行清理，[安装](https://wiki.archlinuxcn.org/wiki/%E5%AE%89%E8%A3%85 "安装") [pacman-cleanup-hook](https://aur.archlinux.org/packages/pacman-cleanup-hook/)AUR 参考[[1]](https://bbs.archlinux.org/viewtopic.php?pid=1694743#p1694743)。

也可以自己设置保留最近几个版本：
```shell
$ paccache -rk1
```

添加`-u`/`--uninstalled`开关来限制paccache的行为只作用于卸载的包。例如清理所有卸载的包的缓存版本，可以用以下命令:
```shell
$ paccache -ruk0
```
更多参数参见`paccache -h`。

pacman也有一些内建参数用于清除缓存和那些不再在`/etc/pacman.conf`配置文件中列出的软件仓库残留数据库文件。然而 pacman 并不提供保留一定数量的过去版本的功能，因此它比 paccache 的默认选项更加激进。

要删除目前没有安装的所有缓存的包，和没有被使用的同步数据库，执行：
```shell
$ pacman -Sc
```

要删除缓存中的全部文件，使用两次`-c`开关。这是最为激进的方式，将会清空缓存文件夹：
```shell
$ pacman -Scc
```

> [!warning]
**警告：** 应当避免从缓存中删除所有过去版本和卸载的包，除非需要更多磁盘空间。这样会导致无法降级或重新安装包而不再次下载他们

[pkgcacheclean](https://aur.archlinux.org/packages/pkgcacheclean/)以及[pacleaner](https://aur.archlinux.org/packages/pacleaner/)是两个进一步清理缓存的替代工具。

#### 0007. 其他命令
下载包而不安装它：
```shell
$ pacman -Sw package_name
```

安装一个**本地**包(不从源里下载）：
```shell
$ pacman -U /path/to/package/package_name-version.pkg.tar.zst
```

要将本地包保存至缓存，可执行：
```shell
$ pacman -U file://path/to/package/package_name-version.pkg.tar.zst
```

安装一个**远程**包（不在 _pacman_ 配置的源里面）：
```shell
$ pacman -U  http://www.example.com/repo/example.pkg.tar.zst
```

要禁用 `-S`, `-U` 和 `-R` 动作，可以使用 `-p` 选项.
_pacman_ 会列出需要安装和删除的软件，并在执行动作前要求需要的权限。
进一步查看：[pacman ArchWiki](https://wiki.archlinux.org/title/Pacman)。

#### 0008. yay
`yay`用法和`pacman`基本一致，有几条额外常用命令值得注意：
```shell
$ yay # 等同于 yay -Syu
$ yay package_name # 等同于 yay -Ss package_name && yay -S package_name
$ yay -Ps # 打印系统统计信息
$ yay -Yc # 清理不需要的依赖
```