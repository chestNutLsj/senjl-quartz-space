---
url: https://www.cnblogs.com/pipci/p/16109756.html
title: 如何在 Linux 中使用 AppImage [完整指南]
date: 2023-03-29 18:03:42
tag: 
summary: 
banner: "![[appimage.png]]"
---

有多种方法可以在 Ubuntu 或任何其他 Linux 发行版中安装软件。使用 apt、yum 、pacman等软件包管理器，或下载 .deb 或 .rpm 文件并双击它们以安装软件。

除此之外，某些应用程序以 .appimage 扩展名下载，这看起来很奇怪，但稍后我们就能看到它的方便之处。

## A. 什么是 AppImage？
![](https://i0.wp.com/itsfoss.com/wp-content/uploads/2017/07/use-appimage-linux.png?resize=800%2C450&ssl=1)

多年来，基于 Debian/Ubuntu 的 Linux 发行版提供 DEB 包，基于 Fedora /SUSE 的 Linux 发行版 提供 RPM 。虽然这些软件包为各自的分发用户提供了一种安装软件的便捷方式，但对于应用程序开发人员来说并不是最方便的。开发人员必须为多个发行版创建多个包。

[AppImage](http://appimage.org/) 是一种通用的软件包格式。通过将软件打包在 AppImage 中，开发人员只需提供一个文件即可 “统管所有”。可以在大多数现代 Linux 发行版中使用它。

### 不以传统方式安装软件

典型的 Linux 软件会在不同的地方创建文件，需要 root 权限才能对系统进行这些更改。

AppImage 不这样做。事实上，AppImage 并没有真正安装软件。它是一个压缩映像，包含运行所需软件所需的所有依赖项和库。

执行 AppImage 文件时，没有提取，没有安装。删除 AppImage 文件，软件就被删除了。可以将其与 Windows 中的 .exe 文件进行类比，这些文件允许在不实际执行安装过程的情况下运行软件。

### 功能和优点

*   发行版无关：可以在各种不同的 Linux 发行版上运行
*   无需安装和编译软件：点击运行
*   无需 root 权限：不触及系统文件
*   便携性：可以在任何地方运行，包括活动磁盘
*   应用程序处于只读模式
*   只需删除 AppImage 文件即可删除软件
*   默认情况下，AppImage 中打包的应用程序不被沙盒化

## B. 如何在 Linux 中使用 AppImage

使用 AppImage 相当简单。它通过以下 3 个简单的步骤完成：

*   下载 AppImage 文件
*   使其可执行
*   运行

### 第 1 步：下载 .appimage 包

有很多 AppImage 格式的软件可用。可以在[此处](https://github.com/AppImage/AppImageKit/wiki/AppImages)找到以 AppImage 格式提供的大量应用程序列表。

在本教程中使用 cursor 编辑器为例：[Cursor | Build Fast](https://www.cursor.so/)；

### 第 2 步：使其可执行

默认情况下，下载的 AppImage 文件没有执行权限。必须更改文件的权限才能使其可执行，更改权限不需要 root：
```shell
# 给予运行权限
chmod a+x name*.AppImage

# 运行之
./name*.AppImage
```

如果更喜欢图形方式，只需右键单击下载的 .appimage 文件并选择属性，转到 “权限” 选项卡并选中 “允许将文件作为程序执行” 框：
![[cursor-executable-property.png]]

![](https://i0.wp.com/itsfoss.com/wp-content/uploads/2017/07/FotoJetusing-appimage-in-linux-01.png?resize=466%2C473&ssl=1)

### 第 3 步：运行 AppImage 文件

使 AppImage 文件可执行后，只需双击它即可运行它。

## C. 如何卸载 AppImage 软件

由于从未安装过该软件，因此无需 “卸载” 它。只需删除关联的 AppImage 文件，您的软件就会从系统中删除。

## D. 在 Linux 中使用 AppImage 时要记住的事项

### 1. 打包不好的 AppImage 即使有执行权限也不会运行

AppImage 的概念是将所有依赖项都包含在包本身中。但是，如果开发人员认为他已经打包了所有依赖项但实际上并非如此呢？

在这种情况下，即使授予 AppImage 执行权限也无济于事。

可以通过打开终端并像运行 shell 脚本一样运行 AppImage 来检查是否存在此类错误。这是一个例子：

```
./compress-pdf-v0.1-x86_64\ \(1\).AppImage 
/tmp/.mount_compreWhr2rq/check: line 3: xterm: command not found
Traceback (most recent call last):
  File "compress-pdf_Qt.py", line 5, in <module>
    from PyQt5 import QtCore, QtGui, QtWidgets
ModuleNotFoundError: No module named 'PyQt5'
```

如上，尝试运行的 AppImage 存在一些打包问题。如果您遇到这样的事情，您应该联系开发人员并告知她 / 他这个问题。

### 2. 桌面集成

当运行 AppImage 文件时，某些软件可能会提示您 “安装桌面文件”。如果选择“是”，这个 AppImage 将像常规安装的应用程序一样与 Linux 系统集成。

![[Pasted image 20230329223649.png]]
![](https://i0.wp.com/itsfoss.com/wp-content/uploads/2017/07/using-appimage-in-linux-2.png?resize=784%2C147&ssl=1)

这意味着您的软件可以通过 GNOME 或 KDE 进行搜索。您可以在菜单中找到它并将其锁定到 Plank 或 Launcher。

### 3. 桌面集成可能需要手动清理删除后

如果您选择桌面集成，这将在系统中创建一些文件。不过，文件大小只有几 KB（因为它只是原 AppImage 的一个链接）。当您删除 AppImage 文件时，这些桌面文件可能仍保留在您的系统中。您可以保持原样或手动删除它。

### 4. 选择放置 AppImage 文件的位置

下载的 AppImage 文件应到达下载文件夹。但这可能不是保存它的最佳位置，因为它会随着时间的推移变得杂乱无章。最好将它们保存在单独的目录中，以便于管理。

另请记住，如果您选择桌面集成，然后将 AppImage 文件移动到其他位置，则必须先删除桌面文件。否则桌面集成可能不起作用。（理由如上，桌面的文件只是一个链接，当原 AppImage 文件的路径被更改，它也就失去了作用）

### 5. 更新并不总是直接可用

也许某些软件会自动检查更新并通知您更新版本的可用性。但这在大多数情况下不会发生。

有一个命令行选项可以检查和更新软件，但这也取决于开发人员是否提供了此选项。

简而言之，自动更新并非总是可行的。这取决于开发人员是否添加了该功能。大多数情况下，如果有更新版本的软件可用，您将不得不自己寻找。

### 结论

还有其他 “通用 Linux 应用程序”，例如 Ubuntu 的 Snap 和 Fedora 的 Flatpak。

相较而言，AppImage 是跨 Linux 发行版使用软件的好方法。

转自：[https://itsfoss.com/use-appimage-linux/](https://itsfoss.com/use-appimage-linux/)；
其他参考：
- [AppImage | 让 Linux 应用随处运行](https://appimage.org/)；
- [起始 - AppImage中文文档](https://doc.appimage.cn/docs/home/)；