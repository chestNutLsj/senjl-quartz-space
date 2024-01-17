## 安装
```shell
sudo pacman -S fcitx5 fcitx5-im fcitx5-qt fcitx5-gtk fcitx5-chinese-addons fcitx5-configtool fcitx5-rime

# 雾凇拼音，很好用的词库
yay -S rime-ice
```

## 设置环境变量
不必多说，按照 ArchWiki 上的指示在 `/etc/environment` 中写入：
```
# Fcitx envs  
GTK_IM_MODULE=fcitx  
QT_IM_MODULE=fcitx  
XMODIFIERS=@im=fcitx  
SDL_IM_MODULE=fcitx  
GLFW_IM_MODULE=ibus  
INPUT_METHOD=fcitx  
IMSETTINGS_MODULE=fcitx
```
此时即可在绝大多数情境下使用，如浏览器、vscode 等 electron 应用、终端；

## 解决 JetBrains 产品中无法输入中文
根据各类帖子，我尝试了这三种办法，具体哪个有效，还请自行试用：

### 设置 `/etc/security/pam_env.conf`
将 `/etc/enviroment` 中的环境变量注释，并复制到 `/etc/security/pam_env.conf` 的末尾。

据说在 Hyprland 下有效，但我使用的是 KDE，这个方法并没有效果。

### 设置 VM options
在 CLion 等需要使用的 JetBrains 产品中，菜单栏找到 Help->Edit Custom VM Options... ，然后在末尾输入: `--Decreate.x11.input.method=true`

这个是由 Ubuntu 用户指出的，但我用起来也没效果。

### 设置正确的 locale
首先检查一下 locale 配置，`locale -a` 看一下结果中是否有 `zh_CN.utf8`，如果没有请先修改 `/etc/locale.gen` 文件将 `zh_CN.utf8` 取消注释，然后使用 `sudo locale-gen` 重新生成。

PS. 我安装 Arch Linux 时使用的是 archinstall，在设置语言时选择了 `en_US.utf8`，后来安装了中文字体包后忘了重新生成 locale。我用这个方法确实有效了，能够正确输入，只是输入法框在左下角，想要跟随的话需要手动编译 JetBrainsRuntime 然后切换，我懒得搞了。