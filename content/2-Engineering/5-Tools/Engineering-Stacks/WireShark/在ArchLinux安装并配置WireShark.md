[Wireshark](https://www.wireshark.org/) 是一款免费且开源的包分析器。可用于网络排错、网络分析、软件和通讯协议开发以及教学等。
参考 Wiki： [Wireshark - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Wireshark)

## 安装
Wireshark 软件包分为 CLI 版本和依赖 CLI 版本的前端界面（TUI or Qt），它们都存在于 community 仓库中，因此如下命令即可安装：
```shell
yay -S community/wireshark-qt
```

## 为普通用户添加抓包权限
以 root 身份运行 wireshark 是不安全的，wireshark 已经实现了权限分离——在使用其图形界面时以普通用户身份运行，在使用数据包捕获工具时使用 root 身份。

在上述安装中会自动安装 wireshark-cli 依赖，其会为 `/usr/bin/dumpcap` 设置数据包捕获能力。而 `/usr/bin/dumpcap` 仅能被 root 用户或 `wireshark` 群组用户执行，因此需要将用户加入 wireshark 用户组以使普通用户能够正常运行 wireshark：
```shell
sudo groupadd wireshark
sudo usermod -a -G wireshark $USER
sudo chgrp wireshark /usr/bin/dumpcap
sudo setcap cap_net_raw,cap_net_admin=eip /usr/bin/dumpcap
```

执行完上述命令重启后生效。