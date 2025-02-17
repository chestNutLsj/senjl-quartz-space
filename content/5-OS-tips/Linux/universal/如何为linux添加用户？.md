```shell
# 添加用户并创建其家目录
$ useradd -m user_name

# 为该用户设置密码
$ passwd user_name # 注意：输入密码时无法看到，并且要输入两次

# 为添加的用户赋予权限（-a 添加，-G群组）
$ usermod -a -G sudo user_name

# 查看当前系统所有的shell并为用户设置默认shell
$ cat /etc/shells
$ chsh -s /usr/bin/zsh user_name

# 查看用户信息
$ id user_name

# 删除账户
$ userdel user_name
```