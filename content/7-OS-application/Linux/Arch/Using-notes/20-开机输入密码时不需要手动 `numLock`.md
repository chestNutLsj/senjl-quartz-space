### 20-开机输入密码时不需要手动 `numLock`

查看`sddm.conf`：

```shell
<lsjarch@LsjsArch cmd_hisNum:502 ~>$ cat /etc/sddm.conf
[General]
Numlock=on
```

如果没有这个文件，请使用`sudo`命令创建并写入。