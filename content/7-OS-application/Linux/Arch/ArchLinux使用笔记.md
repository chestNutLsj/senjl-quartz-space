
## 0x00. Pacman

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

### 01. 系统更新时更新错误：无法提交处理（无效或已损坏的软件包）
如果当前系统未安装过密钥管理软件，则应当先安装：
```bash
sudo pacman -S archlinux-keyring
```

然后对密钥进行更新：
```bash
sudo pacman-key --refresh-keys
```

之后重新加载相应的签名密钥：
```bash
sudo pacman-key --init
sudo pacman-key --populate
```

最后再次更新：
```bash
sudo pacman -Syu
```

如果更新了密钥却还没有解决，则考虑：
```shell
pacman -Syu --ignore glibc

sudo pacman -Syu
```
（跳过更新失败的包，用pacman -S  单独重新安装），再执行安装。


### 02. yay如何在安装前编辑PKGBUILD

* `yay -G <package_name>`
* edit the `PKGBUILD`
* 在当前目录执行`makepkg -si`

### 03. 降级软件包downgrade
由于 archlinux 的更新策略很激进, 导致某些软件过新, 而一些依赖并没有支持, 比如著名的[virtualbox 在 linux5.18 内核下的崩溃open in new window](https://bugs.archlinux.org/task/74900) , 所以有时候不得不安装过时的软件或者降级已安装的软件。

在 archlinux 上安装旧版软件都通过 downgrade 来进行管理。
为了使用 downgrade 额外的命令需要先安装 `downgrade` 软件包：

```
yay -S downgrade
```
之后就可以使用`downgrade`降级软件。

## 0x01. 个性化

### 00. 字体
查看已安装字体：
```bash
fc-list | less
```

搜索库里可用字体：
```bash
fapacman -Ss ttf | less
```

找到要用的字体安装，比如Jetbrains-mono：
```bash
sudo pacman -S ttf-jetbrains-mono
```

或者手动安装，把ttf字体文件复制到`/usr/share/fonts/TTF`目录下，更新字体库：
```bash
fc-cache -vf
```

如果安装了KDE等图形化桌面，一般右键字体文件`ttf`, `otf`等就可以找到安装选项进行安装。

### 01. 输入法

具体参考[ArchWiki中关于Fcitx5的配置](https://wiki.archlinux.org/title/Fcitx5_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))。

详细的视频教程：[袁帅的fcitx5下载、美化、配置词库教程](https://www.bilibili.com/video/BV1Wu411o7Kd?spm_id_from=333.999.header_right.history_list.click&vd_source=77e5fb53d88adf1084faadbdb466558d)。

以及一篇很详细的博客[输入法配置 icekylin的arch教程](https://arch.icekylin.online/advanced/optional-cfg-1.html#%F0%9F%8D%80%EF%B8%8F-%E8%BE%93%E5%85%A5%E6%B3%95)，[更改Fcitx5输入法皮肤 icekylin](https://arch.icekylin.online/advanced/beauty-2.html#_2-%E6%9B%B4%E6%94%B9-fcitx5-%E8%BE%93%E5%85%A5%E6%B3%95%E7%9A%AE%E8%82%A4)。

输入法环境变量配置文件的目录：`/etc/environment`
```shell
❯ cat /etc/environment  
#  
# This file is parsed by pam_env module  
#  
# Syntax: simple "KEY=VAL" pairs on separate lines  
#  
# FCITX5  
INPUT_METHOD=fcitx5  
GTK_IM_MODULE=fcitx5  
QT_IM_MODULE=fcitx5  
XMODIFIERS=\@im=fcitx5  
SDL_IM_MODULE=fcitx5
```

### 02. Shell
#### 0200. 安装Zsh、配置oh-my-zsh

首先查看一下当前安装的`shell`环境：

```shell
$ cat /etc/shells
# Pathnames of valid login shells.
# See shells(5) for details.

/bin/sh
/bin/bash
/usr/bin/git-shell
/usr/bin/fish
/bin/fish
/bin/zsh
/usr/bin/zsh

# another instruction
$ chsh -l # 同样查看所安装的shell
$ chsh -s /usr/bin/zsh # 切换账户默认的shell
```

如果没有Zsh，则安装之，
```shell
sudo pacman -S zsh zsh-autosuggestions zsh-syntax-highlighting zsh-completions autojump
```

为方便配置Zsh及管理其插件，可以使用Github上的开源项目`oh-my-zsh`，虽然它在一定程度上可能会拖慢Zsh的运行速度，不过更加*noob friendly*：

```shell
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

在这个安装脚本运行中，会自动将当前系统的默认shell环境更换为Zsh，如果需要同时对Root用户进行更换，则可以使用：
```shell
$ sudo chsh -s /usr/bin/zsh root
```

接下来就可以对 ohmyzsh 进行配置了

##### (i) 修改主题

前往[ohmyzsh的官方wiki页面](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)查看想要的主题预览，记下名字即可，之后在`~/.zshrc`中找到`ZSH_THEME="robbyrussell"`一行进行编辑：

```shell
ZSH_THEME="robbyrussell"
```

如果将上述值设置为`random`，则会每次打开命令行窗口，都使用随机一个主题，~~当然，如果不是什么心理变态，应该不会这么设置~~

若要查看当前已有的主题文件有哪些，可以使用`ls ~/.oh-my-zsh/themes`查看命令行的输出：

```shell
> ls .oh-my-zsh/themes
3den.zsh-theme             kennethreitz.zsh-theme
adben.zsh-theme            kiwi.zsh-theme
af-magic.zsh-theme         kolo.zsh-theme
afowler.zsh-theme          kphoen.zsh-theme
agnoster.zsh-theme         lambda.zsh-theme
alanpeabody.zsh-theme      linuxonly.zsh-theme
amuse.zsh-theme            lukerandall.zsh-theme
apple.zsh-theme            macovsky-ruby.zsh-theme
...
```

这里我选择Powerlevel10k，~~因为网上教程就这么写的~~

1. 首先clone一下安装文件：
   ```shell
   # Github
   git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
   
   # Gitee
   git clone --depth=1 https://gitee.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
   ```

2. 然后在`~/.zshrc`的主题行中修改为`ZSH_THEME="powerlevel10k/powerlevel10k"`，之后重启终端就会进入配置页面，依序配置好自己喜欢的样式即可。
![[p10k_config.png]]

如果要使用其他社区插件，可以在[External-themes](https://github.com/ohmyzsh/ohmyzsh/wiki/External-themes)中查找，只需要将其安装到`~/.oh-my-zsh/custom/themes/`目录下即可。

##### (ii) 添加插件
同样插件也有[官方库](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)和[社区库](https://github.com/ohmyzsh/ohmyzsh/wiki/External-plugins)，推荐：

1. 自动补全插件`zsh-autosuggestions`，使用方向右键补齐
   ```shell
   git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
   ```

2. 语法高亮插件`zsh-syntax-highlighting`
   ```shell
   git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
   ```

3. 自动跳转历史目录`autojump`，这个是ohmyzsh自带，添加进plugins即可
   ```shell
   # Which plugins would you like to load?
   # Standard plugins can be found in $ZSH/plugins/
   # Custom plugins may be added to $ZSH_CUSTOM/plugins/
   # Example format: plugins=(rails git textmate ruby lighthouse)
   # Add wisely, as too many plugins slow down shell startup.
   plugins=(
           git
           zsh-autosuggestions
           zsh-syntax-highlighting
           autojump
   )
   ```
   
   不过奇怪的是，明明可以在`.oh-my-zsh/plugins/`目录下查找到`autojump`文件，但是直接添加却会提示需要安装，可能是版本问题？不过解决办法很简单，只需要`sudo pacman -S autojump`即可。

- 注意：上述操作只是配置了当前用户的zsh，如需配置root用户或其他用户，需要切换到对应用户并将之前的配置文件复制一份过去。

#### 0201 `oh-my-zsh`部分命令及使用

##### (i) 更新相关

`oh-my-zsh`会在每次上游更新时对用户发出更新提示，如果想让它自动更新而不提示，则在`.zshrc`中添加如下命令：
```shell
DISABLE_UPDATE_PROMPT=true
```

如果不想让`oh-my-zsh`自动更新，则同样设置`.zshrc`：
```shell
DISABLE_AUTO_UPDATE=true
```

若要手动对其进行更新，则使用命令`omz update`：
```shell
> omz update
Updating Oh My Zsh
         __                                     __   
  ____  / /_     ____ ___  __  __   ____  _____/ /_  
 / __ \/ __ \   / __ `__ \/ / / /  /_  / / ___/ __ \ 
/ /_/ / / / /  / / / / / / /_/ /    / /_(__  ) / / / 
\____/_/ /_/  /_/ /_/ /_/\__, /    /___/____/_/ /_/  
                        /____/                       

Oh My Zsh is already at the latest version.

To keep up with the latest news and updates, follow us on Twitter: @ohmyzsh
Want to get involved in the community? Join our Discord: Discord server
Get your Oh My Zsh swag at: Planet Argon Shop

```

##### (ii) `powerlevel10k`主题的高级配置

1. 字体库依赖
   根据[p10k的官方文档](https://github.com/romkatv/powerlevel10k#meslo-nerd-font-patched-for-powerlevel10k)，其在有如下字体库时会有更好的支持：`Meslo Nerd Font`、`Source Code Pro`、`Font Awesome`、`Powerline`，下面是部分安装方法：
   
   依赖`powerline/fonts`字体库，安装方式如下：
   ```shell
   # clone
   git clone https://github.com/powerline/fonts.git --depth=1
   # install
   cd fonts
   ./install.sh
   # clean-up a bit
   cd ..
   rm -rf fonts
   ```

   执行`install.sh`脚本时的输出为：
   ```shell
   Copying fonts...
   xargs: warning: options --max-args and --replace/-I/-i are mutually exclusive, ignoring previous --max-args value
   Resetting font cache, this may take a moment...
   Powerline fonts installed to /home/lsjarch/.local/share/fonts
   ```

   `Meslo Nerd Font`字体库的安装
   ```shell
   yay -S ttf-meslo-nerd-font-powerlevel10k
   ```

   `Font Awesome`图标库的安装
   ```shell
   yay -S ttf-font-awesome
   ```

(经测试，安装`jetbrainsmono nerd font`即可使用)

2. 手动配置提示符（在~/.p10k.zsh中）

   左边区域的配置：
   ```shell
     # The list of segments shown on the left. Fill it with the most important segments.
     typeset -g POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(
       os_icon                 # os identifier
       dir                     # current directory
       vcs                     # git status
       # prompt_char           # prompt symbol
     )
   
   ```

   右边区域的配置：
   ```shell
     # The list of segments shown on the right. Fill it with less important segments.
     # Right prompt on the last prompt line (where you are typing your commands) gets
     # automatically hidden when the input line reaches it. Right prompt above the
     # last prompt line gets hidden if it would overlap with left prompt.
     typeset -g POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(
       status                  # exit code of the last command
       command_execution_time  # duration of the last command
       background_jobs         # presence of background jobs
       direnv                  # direnv status (https://direnv.net/)
   ...
   ```

   对这些字段可以进行自定义配置以显示想要的效果，具体可以参考这篇博客——[p10k主题的自定义配置](https://juejin.cn/post/6887221986980790280#heading-9)。

3. 长路径折叠

   修改`POWERLEVEL9K_SHORTEN_DIR_LENGTH`，
   Powerlevel10k 默认将长路径折叠到只显示最上层和最底层，多少有些不方便，可以更改如下，推荐 2 或者 3。

#### 0202. 使用Zim对Zsh进行插件管理和美化
参考博客：
- [zsh 基础安装 by icekylin](https://arch.icekylin.online/advanced/optional-cfg-1.html#%F0%9F%9A%80-zsh)
- [zsh 进阶美化 by icekylin](https://arch.icekylin.online/advanced/beauty-3.html#_2-zsh-%E7%BE%8E%E5%8C%96)

Zim较ohmyzsh有更加快捷的启动速度

### 03 kde小部件
安装目录位于`~/.local/share/plasma/plasmamoids`。

#### 0300. Panon

直接在KDE商店中下载该插件会缺少很多python依赖，诸如`qt5-websockets python-docopt python-numpy python-pillow python-pyaudio python-cffi python-websockets`，

而万能的Archer在AUR中提交了依赖于`python-soundcard>=0.4.2`的[panon软件包](https://aur.archlinux.org/packages/plasma5-applets-panon)，那么直接从AUR中下载即可：

```shell
yay -S plasma5-applets-panon
```

下载好之后别忘了进行配置，需要修改视觉特效及音频数据源(改为PulseAudio，输入设备选择内置音频，模拟立体声)

如果不是Arch Linux，可以查看这篇[issue](https://github.com/rbn42/panon/issues/78)中的解决办法。

### 04. Customized Grub theme

### 05. Customized rEFInd theme
   

## 0x02. 系统维护
参考文档：[系统维护 ArchWiki](https://wiki.archlinuxcn.org/wiki/%E7%B3%BB%E7%BB%9F%E7%BB%B4%E6%8A%A4)。

### 00. 开机输入密码时不需要自动`numLock`
查看`sddm.conf`：

```shell
<lsjarch@LsjsArch cmd_hisNum:502 ~>$ cat /etc/sddm.conf
[General]
Numlock=on
```

如果没有这个文件，请使用`sudo`命令创建并写入。

### 01. 系统服务systemctl的用法
```shell
systemctl start dhcpcd # 启动服务
systemctl stop dhcpcd # 停止服务
systemctl restart dhcpcd # 重启服务
systemctl reload dhcpcd # 重新加载服务以及它的配置文件
systemctl status dhcpcd # 查看服务状态
systemctl enable dhcpcd # 设置开机启动服务
systemctl enable --now dhcpcd # 设置服务为开机启动并立即启动这个单元
systemctl disable dhcpcd # 取消开机自动启动
systemctl daemon-reload dhcpcd # 重新载入 systemd 配置。扫描新增或变更的服务单元、不会重新加载变更的配置
```

### 02. 磁盘空间信息
#### 0200. `df`命令
可以用来显示目前在Linux系统上的文件系统对应的磁盘空间使用情况的统计：
```shell
❯ df -h  
文件系统        大小  已用  可用 已用% 挂载点  
dev             7.8G     0  7.8G    0% /dev  
run             7.8G  1.8M  7.8G    1% /run  
/dev/nvme1n1p2  177G   61G  107G   37% /  
tmpfs           7.8G  174M  7.6G    3% /dev/shm  
tmpfs           7.8G   65M  7.7G    1% /tmp  
/dev/nvme1n1p3  290G   30G  246G   11% /home  
/dev/nvme1n1p1  2.0G  1.5M  2.0G    1% /efi  
/dev/nvme0n1p2   96M   28M   69M   29% /mnt/win  
tmpfs           1.6G   76K  1.6G    1% /run/user/1000
```

#### 0201. `Filelight`图形化显示磁盘占用情况
```shell
$ sudo pacman -S extra/filelight
```

#### 0202. 磁盘空间清理
经过磁盘空间信息对磁盘空间占用情况分析后，可以采用一些措施来解决：
1. 清理软件包缓存及孤立包
2.  清理yay缓存，`~/.cache/yay`
3. 通过Timeshift自动清理历史最久远的的快照

## 0x03. 应用软件问题

### 00. vscode
#### 0000. 写入登录信息到钥匙链失败

![[vscode_problem_01.png]]


问题描述：
使用github帐号登录vscode，每次关闭vscode之后再启动都需要重新登录Github帐号，而不能自动登录，其报错是右下角出现“将登录信息写入到钥匙链失败”的对话框，异常条目是`org.freedesktop.DBus.Error.ServiceUnknown`：没有任何`.service files`文件提供名为`org.freedesktop.secrets`的服务。

解决办法：
参考[Github中vscode问题#92972]
安装`gnome-keyring`以解决：
```shell
$ yay -S qtkeychain gnome-keyring
```

然后验证一下：
```shell
$ ls -l /usr/share/dbus-1/services/ | grep secret
-rw-r--r-- 1 root root 122 Oct 29 11:38 org.freedesktop.secrets.service

$ cat /usr/share/dbus-1/services/org.freedesktop.secrets.service
[D-BUS Service]
Name=org.freedesktop.secrets
Exec=/usr/bin/gnome-keyring-daemon --start --foreground --components=secrets
```

在这之后重启电脑即可成功登录。

如有需要，可以进一步了解[Gnome/Keyring](https://wiki.archlinux.org/title/GNOME_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29/Keyring_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29)。简要的说，`Gnome Keyring`是`Gnome`提供的一组工具，能够存储密码、密钥、认证并提供给其他程序使用。

### 01. 文件格式化
#### 0100. C/Cpp 格式化
在安装插件`C/C++`之后，vscode就有了对cpp源代码格式化处理的能力，但如果想要定制自己的需求，需要在当前工程的根目录创建一个 `.clang-format` 文件，并写入如下内容：
![[cpp-clang-format]]


### 02. 科学上网
#### 0200. V2ray

#### 0201. Clash

### 03. Steam

### 04. 解压缩
#### 0400. unzip解压避免中文乱码的办法
`unzip -O GBK file-name.zip`

#### 0401. 使用 Unarchiver  工具进行解压缩
可以避免解压Windows下的GBK编码的中文压缩包乱码问题：
```shell
$ sudo pacman -S unarchiver

# unzip the file_pkg
unar xxx.zip
```

## 0x04. SSH
### 00. 使用SSH连接GitHub以及部分报错解决
#### 0000. 安装、生成密钥、部署
对于Linux，首先安装openssh：
```shell
$ sudo pacman -S openssh
```

## 0x05. Desktop Environment
### 00. KDE平铺设置及快捷键
https://www.bilibili.com/read/cv10513474

## 0x06. 开发环境配置
### 00. 如何切换JDK版本？
由于ArchLinux滚动式更新的特性，JDK版本也常常保持最新，当前（2022.10）的版本是：
```shell
$ java --version
openjdk 18.0.2 2022-07-19  
OpenJDK Runtime Environment (build 18.0.2+0)  
OpenJDK 64-Bit Server VM (build 18.0.2+0, mixed mode)
```

这时如果使用某些软件包对旧版本JDK有依赖的话，可以进行如下操作进行切换JDK：

1. 下载目标版本JDK，如jdk8
```shell
$ sudo pacman -S jdk8-openjdk
```
需要注意的是，在下载过程中，如果系统中已经存在了更新版本的JDK，会有如下安装信息显示：
```shell
(1/3) 正在安装 jre8-openjdk-headless                                         [###########################################] 100%  
Default Java environment is already set to 'java-18-openjdk'  
See 'archlinux-java help' to change it  
jre8-openjdk-headless 的可选依赖  
   java-rhino: for some JavaScript support  
(2/3) 正在安装 jre8-openjdk                                         [###########################################] 100%  
Default Java environment is already set to 'java-18-openjdk'  
See 'archlinux-java help' to change it  
when you use a non-reparenting window manager,  
set _JAVA_AWT_WM_NONREPARENTING=1 in /etc/profile.d/jre.sh  
jre8-openjdk 的可选依赖  
   icedtea-web: web browser plugin + Java Web Start  
   alsa-lib: for basic sound support [已安装]  
   gtk2: for the Gtk+ look and feel - desktop usage [已安装]  
   java8-openjfx: for JavaFX GUI components support  
(3/3) 正在安装 jdk8-openjdk                                         [###########################################] 100%  
Default Java environment is already set to 'java-18-openjdk'  
See 'archlinux-java help' to change it
```

2. 切换JDK版本
在ArchLinux中可以很方便地使用`archlinux-java`进行JDK版本的切换：
```shell
$ archlinux-java 
archlinux-java <COMMAND>  
  
COMMAND:  
       status          List installed Java environments and enabled one  
       get             Return the short name of the Java environment set as default  
       set <JAVA_ENV>  Force <JAVA_ENV> as default  
       unset           Unset current default Java environment  
       fix             Fix an invalid/broken default Java environment configuration
```

要切换当前版本（openjdk-18)到目标版本（jdk8)，则使用如下命令：
```shell
$ sudo archlinux-java set java-8-openjdk
```

这时查看JDK版本如下：
```shell
$ java -version
openjdk version "1.8.0_345"  
OpenJDK Runtime Environment (build 1.8.0_345-b01)  
OpenJDK 64-Bit Server VM (build 25.345-b01, mixed mode)
```
切换成功！😆

### 01. 如何管理Python环境？
![[01.初识Python#管理不同版本的Python]]

That's all!

### 02. 安装并启用nvm管理nodejs
虽然archlinuxcn中也有nvm可供安装，但直接安装那个版本却没有激活nvm的命令提示，导致虽然安装了却无法使用。而安装aur中的`nvm-git`版本则会有清晰的提示：
```shell
You need to source nvm before you can use it. Do one of the following  
or similar depending on your shell (and then restart your shell):  
  
 echo 'source /usr/share/nvm/init-nvm.sh' >> ~/.bashrc  
 echo 'source /usr/share/nvm/init-nvm.sh' >> ~/.zshrc  
  
You can now install node.js versions (e.g. nvm install 10) and  
activate them (e.g. nvm use 10).  
  
init-nvm.sh is a convenience script which does the following:  
  
[ -z "$NVM_DIR" ] && export NVM_DIR="$HOME/.nvm"  
source /usr/share/nvm/nvm.sh  
source /usr/share/nvm/bash_completion  
source /usr/share/nvm/install-nvm-exec  
  
You may wish to customize and put these lines directly in your  
.bashrc (or similar) if, for example, you would like an NVM_DIR  
other than ~/.nvm or you don't want bash completion.  
  
See the nvm readme for more information: https://github.com/creationix/nvm
```