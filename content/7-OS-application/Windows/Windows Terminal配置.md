windows terminal算是Windows上比较好用的终端之一了，并且安装方便，直接在微软应用商店下载即可（win11内置了windows terminal），接下来我们进行一些配置来使得它更加美观、好用。

## 0x00快捷键启动
在windows里不能直接使应用通过快捷键启动，一般操作是将`.exe`文件创建一个桌面快捷方式，在快捷方式里设置快捷键：
![[任务管理器查找wt的文件位置.png]]
在打开的文件夹里找到`wt.exe`并右键选择创建快捷方式，它会自动创建一个桌面快捷方式：
![[创建wt快捷方式.png]]
在桌面快捷方式中右键$\rightarrow$属性$\rightarrow$快捷键：
![[快捷方式wt.png]]
但是，这种方法并不推荐，因为它平白在桌面创建一个快捷文件既不美观，也不能全局使用，更有可能热键冲突，所以可以选择这样的方法：
将`wt.exe`固定到任务栏，然后使用<kbd>win</kbd>+<kbd>数字键</kbd>的方法快捷访问：
![[wt_dock.png]]
此时使用<kbd>win</kbd>+<kbd>1</kbd>就可以全局快捷开启windows terminal。（需要注意的是，如果使用了外接键盘，它可能会默认禁用<kbd>win</kbd>功能键，这是为了防止游戏中误触<kbd>win</kbd>键，一般可以使用<kbd>Fn</kbd>+<kbd>win</kbd>解锁）

## 0x01 oh-my-posh美化

