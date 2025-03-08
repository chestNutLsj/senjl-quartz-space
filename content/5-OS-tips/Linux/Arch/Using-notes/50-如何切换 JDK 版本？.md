---
image-auto-upload: false
publish: "true"
date: 2023-07-23
tags:
  - ArchLinux
  - Linux
---

### 00. 如何切换 JDK 版本？

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