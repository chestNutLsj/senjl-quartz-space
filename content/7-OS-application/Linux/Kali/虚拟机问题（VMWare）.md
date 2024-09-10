## 网络设置相关

### Cound not connect 'Ethernet0' to virtual network '/dev/vmnet0'

这是因为没有开启`vmware-networks.service`：
```shell
sudo modprobe vmnet && sudo vmware-networks --start
sudo systemctl start vmware-networks.service

# 开机自启动该服务
sudo systemctl enable vmware-networks.service
```

### Fail Network configuration is missing. Ensure that /etc/vmware-networking exits.
这通常在初次下载vmware workstation后，点击 `Virtual Network Editor Manager`会报此错。解决办法如下：
```shell
$ sudo systemctl start vmware-networks-configuration.service
$ sudo systemctl enable vmware-networks-configuration.service
```

### 如何连接宿主机的网络？
参考博客：[VMware虚拟机kali如何与互联网和其他虚拟机、真实主机互通（最简单）](https://blog.csdn.net/sunleibaba/article/details/128273778)；
关键点注意：
- VMware设置为桥接模式，自动连接网卡；
- 对虚拟的网络适配器部分，设置为NAT模式，共享主机的IP地址；
- 进入Kali系统后的网络设置为自动连接LAN；

## hostd无法加载
报错情形如下：终端使用`vmware`报错`I/O warning : failed to load external entity "/etc/vmware/hostd/proxy.xml"`；

解决方案：这个问题可以不用理睬，具体原因是linux永久性移除了hostd这个模块，但是vmware暂时没有从它的配置中移除这项检查，如果想要解决可以使用如下命令在检查的路径处创建相同名称的空文件，而且经实践，完成vmware的启动向导后，该错误将不会报出。
```shell
mkdir -p /etc/vmware/hostd
touch /etc/vmware/hostd/proxy.xml
```

## vmmon 模块
创建虚拟机后第一次运行时报错，通常是因为没有开启相应服务：
```shell
```text
sudo systemctl start vmware-networks.service  vmware-usbarbitrator.service                   #启动虚拟机的网络,USB,共享等服务
sudo systemctl enable vmware-networks.service  vmware-usbarbitrator.service                   #启动虚拟机的网络,USB,共享等服务
sudo modprobe -a vmw_vmci vmmon         #加载VMware模块
```


## 其他报错参考
1. [Ubuntu 22.04 上安装VMware - 零衣 - 博客园](https://www.cnblogs.com/wthuskyblog/p/16349940.html)；