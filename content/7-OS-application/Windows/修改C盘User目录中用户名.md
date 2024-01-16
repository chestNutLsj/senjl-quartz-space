参考视频教程：[Windows修改C盘下Users用户文件夹下的中文名文件夹](https://www.bilibili.com/video/BV1eN4y157vj)。
😄

## 0x00实现步骤
总的来说一共三步：
1. 第一步打开注册表编辑器<kbd>win</kbd>+<kbd>R</kbd> $\rightarrow$ regedit，找到`\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList`目录下最长一串，通常是这种画风：`S-1-5-21-2377911553-2979677134-2714499410-1001`，然后修改其中`ProfileImagePath`中的数据（我是从`chest`改为`chestnutlsj`）
	- ![[修改注册表中用户名.png]]
	- 点击确定后，重启windows
2. 重启后会发现以临时管理员账户登陆，这时关闭即可，然后就能进入`C:\Users`目录下将所要修改的用户名文件夹修改为第一步中所改注册表的数据：
	- ![[临时管理员账户登录.png]]
	- ![[修改用户文件夹名字.png]]
3. 继续重启，这之后就会发现`C:\Users`目录下的用户文件夹修改成功，并且从终端的名字也可以看出：
	- ![[修改名字后的终端.png]]

至此，修改完毕。

## 0x01修改后可能出现的问题及解决办法
1. 在修改用户名称后，可能会导致一些 用户变量无法找到，从而出现无法正确运行某些默认安装在C盘的文件，比如在Windows Terminal中运行WSL Ubuntu，会报错`0x80070002`
	- ![[ubuntu报错0x80070002.png]]
	- 这时的解决办法就是打开环境变量，将用户环境变量中Path变量中的相关部分进行修改
	- ![[编辑用户环境变量.png]]
	- 之后重启Windows Terminal会话即可。
2. 