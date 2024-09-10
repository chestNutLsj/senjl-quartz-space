参考博客：[Linux Windows双系统时间不一致](https://eason0210.github.io/post/clock-issue-with-dual-system/)。

简要描述：从windows端解决这个问题，就是让windows认为硬件时钟是UTC时间
1. 第一步打开注册表编辑器<kbd>win</kbd>+<kbd>R</kbd> $\rightarrow$ regedit，
2. 第二步定位到这个目录`\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation`
3. 在该目录下新建一个`DWORD`类型，名称为`RealTimeIsUniversal`的键，设置值为`1`；

