---
publish: "true"
tags:
  - ArchLinux
  - Linux
---

由于 archlinux 的更新策略很激进, 导致某些软件过新, 而一些依赖并没有支持, 比如著名的 [virtualbox 在 linux5.18 内核下的崩溃open in new window](https://bugs.archlinux.org/task/74900) ， 所以有时候不得不安装过时的软件或者降级已安装的软件。

在 archlinux 上安装旧版软件都通过 downgrade 来进行管理。
为了使用 downgrade 额外的命令需要先安装 `downgrade` 软件包：

```
yay -S downgrade
```
之后就可以使用`downgrade`降级软件。