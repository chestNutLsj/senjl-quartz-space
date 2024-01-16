wiki：[Using Fcitx 5 on Wayland - Fcitx](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland#KDE_Plasma)

在出现 chromium 内核浏览器缩放异常问题后，我又出现了无法在这些浏览器中使用 fcitx5 输入法的问题。

解决办法正是 wiki 中提到的虚拟键盘设置、配置浏览器 `flag.conf` 文件：
```
--enable-features=UseOzonePlatform 
--ozone-platform=wayland 
--enable-wayland-ime
```

![[Pasted image 20230824105448.png]]

其它情况的问题，请自行对照解决。