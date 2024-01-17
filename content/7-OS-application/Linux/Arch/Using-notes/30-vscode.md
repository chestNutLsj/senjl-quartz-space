### 00. vscode

#### 0000. 写入登录信息到钥匙链失败

![[vscode_problem_01.png]]


问题描述：
使用github帐号登录vscode，每次关闭vscode之后再启动都需要重新登录Github帐号，而不能自动登录，其报错是右下角出现“将登录信息写入到钥匙链失败”的对话框，异常条目是`org.freedesktop.DBus.Error.ServiceUnknown`：没有任何`.service files`文件提供名为`org.freedesktop.secrets`的服务。

解决办法：
参考[Github中vscode问题#92972]
安装`gnome-keyring`以解决：
```shell
$ yay -S qtkeychain gnome-keyring
```

然后验证一下：
```shell
$ ls -l /usr/share/dbus-1/services/ | grep secret
-rw-r--r-- 1 root root 122 Oct 29 11:38 org.freedesktop.secrets.service

$ cat /usr/share/dbus-1/services/org.freedesktop.secrets.service
[D-BUS Service]
Name=org.freedesktop.secrets
Exec=/usr/bin/gnome-keyring-daemon --start --foreground --components=secrets
```

在这之后重启电脑即可成功登录。

如有需要，可以进一步了解[Gnome/Keyring](https://wiki.archlinux.org/title/GNOME_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29/Keyring_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29)。简要的说，`Gnome Keyring`是`Gnome`提供的一组工具，能够存储密码、密钥、认证并提供给其他程序使用。

### 01. 文件格式化
#### 0100. C/Cpp 格式化
在安装插件`C/C++`之后，vscode就有了对cpp源代码格式化处理的能力，但如果想要定制自己的需求，需要在当前工程的根目录创建一个 `.clang-format` 文件，并写入如下内容：
![[cpp-clang-format]]