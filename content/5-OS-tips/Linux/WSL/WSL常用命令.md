## 注销 WSL 中特定分发

```shell
# list the local distro
wsl -l -v
# unregister the specified distro
wsl --unregister distro_name
```

>[! warning] 危险行为！
>需要注意，这一操作与宿主机上注销用户不同，运行上述命令会将 WSL 中对应分发直接删除，包括其中应用和文件！
>请做好备份后再行操作，或者你需要知道自己在做什么！

