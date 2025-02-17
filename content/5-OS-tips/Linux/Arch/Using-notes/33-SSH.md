
## 安装、生成密钥、部署

对于Linux，首先安装openssh：
```shell
$ sudo pacman -S openssh
```

## SSH error solution

### error 22: Connection timed out

当尝试连接到 GitHub 时遇到 “ssh: connect to host github. com port 22: Connection timed out” 这个错误，这通常意味着有些东西阻止了你的连接。下面是一些建议的解决步骤：

1. 网络连接：确保你的网络连接是稳定的。

2. 端口阻塞：某些网络或 ISP 可能会阻塞 SSH 的默认端口（22）。尝试使用 443 端口连接到 GitHub：`ssh -T -p 443 git@ssh.github.com`

如果这成功了，你可以考虑永久地更改你的 SSH 配置以使用 443 端口。在 `~/.ssh/config` 文件中添加以下内容：  

```
Host github.com 
Hostname ssh.github.com 
Port 443
```

3.  代理设置：如果你在使用代理，确保你的 SSH 配置正确地设置了代理。
  
4.  SSH 密钥：确保你的公钥已经添加到 GitHub 的 SSH keys 列表中，并且你的私钥存在于你的机器上。
   
5.  防火墙设置：确保你的防火墙或安全软件没有阻止 SSH 连接。
   
6.  DNS 问题：尝试使用 IP 地址代替域名进行连接，以检查是否是 DNS 问题。但是注意，长期使用 IP 地址不是一个好办法，因为 GitHub 的 IP 地址可能会变化。
   
7.  ping 测试：尝试使用 `ping github.com` 来检查你的机器是否可以达到 GitHub。
   
8.  网络工具：使用 `traceroute github.com` 或 `mtr github.com` 来检查网络路径中可能存在的问题。

9.  GitHub 状态：虽然较少见，但有可能 GitHub 正在遇到问题。
   
10.  重新启动：有时简单地重新启动你的计算机和路由器可能会解决问题。