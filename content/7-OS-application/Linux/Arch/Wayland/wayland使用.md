## 什么是 wayland

### 与 xorg 的对比


## 在 wayland 中使用腾讯会议共享屏幕
飞书会议已经支持了 wayland，但腾讯会议还没有，如果使用 xorg 桌面能够正常捕获桌面，但 wayland 却不行。有一种曲线救国的办法是使用 OBS-Studio 开启虚拟摄像头，然后推流至腾讯会议的摄像头，具体步骤如下：

### 1. 安装 OBS 及相关组件
```shell
sudo pacman -S obs-studio
# 在安装obs结束后可以看到一些提示，其中有下列组件的简单介绍，依此下载
# virtual camera
sudo pacman -S v4l2loopback-dkms
# intel hard encoder
sudo pacman -S libva-intel-driver
sudo pacman -S libfdk-aac
```

### 2. 启动 OBS-Studio 并设置
初次启动时需要进行简单配置，但这与该话题无关，自行选择合适的选项就好。

接下来在来源中添加 Pipewire 作为屏幕捕捉源：
![[obs-source-pipewire.png]]
如果没有看到这一选项，请参考这篇文章：[在 Linux 中使用 OBS 和 Wayland 进行屏幕录制](https://cloud.tencent.com/developer/article/1903737)。

选中笔记本屏幕并共享：
![[obs-pipewire-setting.png]]

这时你应该递归地看到自己的桌面：
![[obs-pipewire-display.png]]

之后点击右侧控制按钮中的 `启动虚拟摄像机`：
![[obs-enable-virtual-camera.png]]

### 3. 在腾讯会议中选中对应的摄像头
随意开启一个快速会议，在其中开启视频，注意选择正确的摄像头：
![[wemeet-choose-camera.png]]

如果发现展示的图像颠倒，可以在视频选项中关闭对应摄像头的镜像功能：
![[wemeet-camera-mirror.png]]

🎉 设置完成，可以开始使用了！