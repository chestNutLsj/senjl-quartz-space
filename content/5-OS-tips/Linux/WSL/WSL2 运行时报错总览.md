## 报错代码4294967295
打开wsl，显示`已退出进程，代码为 4294967295`，
修复帖子：[win10/win11下启动wsl/wsl2出现“占位程序接收到错误数据“启动失败的解决办法](https://blog.csdn.net/caiji112/article/details/124916376)。
解决方案：
1. 以管理员身份运行windows terminal
2. 输入netsh winsock reset
3. 重新打开windows terminal