详细文档可参考[Archwiki-Ranger](https://wiki.archlinux.org/title/Ranger_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))，[Ranger-Official-user-guide](https://github.com/ranger/ranger/wiki/Official-user-guide)。

使用命令`sudo pacman -S ranger`下载完成后，在终端中运行`ranger`来启动，

| 快捷键       |                   命令                   |
| ------------ |----------------------------------------|
| `?`          | 打开帮助手册或列出快捷键、命令以及设置项 |
| `l`, `Enter` |                 打开文件                 |
| `j`, `k`     |           选择当前目录中的文件           |
| `h`, `l`     |           在目录树中上移和下移           |
| `q`          |                   退出                   |

## 配置文件

第一次启动 ranger 会创建一个目录 `~/.config/ranger/`。可以使用以下命令复制默认配置文件到这个目录:

```
$ ranger --copy-config=all
```

了解一些基本的 python 知识可能对定制 ranger 会有帮助。

* `rc.conf` - 选项设置和快捷键
* `commands.py` - 能通过 `:` 执行的命令
* `rifle.conf` - 指定不同类型的文件的默认打开程序。
* `scope.sh` - 文件预览相关配置

`rc.conf `只需要包含与默认配置文件不同的部分, 因为它们都会被加载。对于 `commands.py`，如果你没有包含整个文件，把下面这一行加入到文件起始处：

```
from ranger.api.commands import *
```

## 文件选择

标记/取消标记：<kbd>space</kbd>
反选：<kbd>v</kbd>
视觉模式开启/关闭：<kbd>V</kbd> ，在视觉模式下，移动光标即可选择条目。也可以按 <kbd>uV</kbd> 或者 <kbd>ESC</kbd> 退出。
取消当前目录的全部标记：<kbd>uv</kbd>，

> 黄色的 Mrk 符号位于终端右下角，表示此文件夹里有标记的文件。黄色的 Mrk 并不会因为切换目录而消失。

## 文件操作

复制：yy
剪切：dd
粘贴：pp
删除：dD

更多操作请看(https://blog.csdn.net/HideOnLie/article/details/103719698)，

将不同目录的文件加入操作列表：ya
 重命名：cw
 在当前名称基础上重命名：A
 类似A, 但是光标会跳到起始位置：I
 向下翻一页：Ctrl+f或PAGEDOWN
 向上翻一页：Ctrl+b或PAGEUP
 向上翻半页：Ctrl+u或者K
 向下翻半页：Ctrl+d或者 J
 后退到上一个历史记录：H
 前进到下一个历史记录：L

## 移动到回收站

如果想添加一个把文件移动到目录 `~/.local/share/Trash/files/` 的快捷键 `DD`, 把以下这一行添加到 `~/.config/ranger/rc.conf`:

```
map DD shell mv %s /home/${USER}/.local/share/Trash/files/
```

## 清空垃圾箱命令定义

在 `~/.config/ranger/commands.py` 增加如下代码将会定义一个清空垃圾箱 `~/.Trash` 的命令。

```
class empty(Command):
    """:empty

    Empties the trash directory ~/.Trash
    """

    def execute(self):
        self.fm.run("rm -rf /home/myname/.Trash/{*,.[^.]*}")
```

输入 `:empty` 与 `Enter` 来执行命令， 如果希望的话，也可以使用 tab 补全。

其他命令定义可以在这个[RangerWiki](https://github.com/ranger/ranger/wiki/Custom-Commands)中找到示例。

## 配色方案

Ranger 配备了四个配色方案：`默认`、`丛林`、`积雪`和`烈日`。 下列命令可自定义配色：

```
 set colorscheme scheme
```

自定义配色方案放在 `~/.config/ranger/colorschemes`。

## 文件打开程序

Ranger 使用自己的文件打开程序，名为`rifle`，它的配置文件为 `~/.config/ranger/rifle.conf`。如果该文件不存在，可运行 `ranger --copy-config=rifle` 生成。例如，如下的代码指定 [kile](https://archlinux.org/packages/?name=kile) 为打开 tex 文件的默认程序。

```
ext tex = kile "$@"
```

使用 [xdg-utils](https://archlinux.org/packages/?name=xdg-utils) 来打开所有文件，设置 `$EDITOR` 和 `$PAGER`:

```
else = xdg-open "$1"
label editor = "$EDITOR" -- "$@"
label pager  = "$PAGER" -- "$@"
```