---
publish: "true"
---
这个问题在 tg 上的 archlinuxcn 群里得到了详细的解答，记录如下。

## 提问

> 请教一下大佬们，我的 arch+kde+wayland 想要外接一个显示器，但是在设备里找不到它该怎么办？
> 
> 我看过本群里之前的讨论，逐个阅读后，还是没有理解怎么修复，在依云佬提供帮助的一个帖子里，有人提供信息时使用了 `xrandr --listproviders` 这条命令，而我使用它则输出 `providers: number: 0`
> 
> 我去年使用 xorg 时可以正确找到多个显示器，但是今年用了一段时间 wayland 后，想起来去扩展显示屏，失败了，而且再切换回 xorg 也不行，每次在 sddm 那里登录时就会失败。

![[41-KDE-Wayland-HDMI外接显示器识别失败-1.png]]

在 csdn 中有一篇相关的解决办法，但是我不是很想使用：

![[41-KDE-Wayland-HDMI外接显示器识别失败-3.png]]

原因是它要下载 optimus-manager，我之前用这个的时候不仅会导致画面极其卡顿，甚至还出现过内核挂掉，必须从 archiso 里面手动删除掉它才可以，所以有些心理阴影。

## 问题定位

首先是双显卡 intel+nvidia ，因此使用命令查看 nvidia 的 drm modeset：

![[41-KDE-Wayland-HDMI外接显示器识别失败-4.png]]

可以发现这里禁用了 nvidia，所以我们要在内核参数里打开：

## 添加内核参数

以我的内核启动器 rEFInd 为例，应该在 `/boot/refind_linux.conf` 中：

![[41-KDE-Wayland-HDMI外接显示器识别失败-2.png]]

其它 bootloader 的启动参数添加，可以参考这篇 wiki：[Kernel parameters - ArchWiki](https://wiki.archlinux.org/title/Kernel_parameters)

然后修改之：

![[41-KDE-Wayland-HDMI外接显示器识别失败-5.png]]

重启即可看到输出，并且此时 nvidia drm 输出如下：

![[41-KDE-Wayland-HDMI外接显示器识别失败-Y.png]]