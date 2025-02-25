
## 1 . Windows 下打开代理
----------------

### 1.1 允许局域网

以 `Clash` 为例，购买相关 `配置`，选择 `主页` 选项卡，开启 `允许局域网`：

![[Pasted image 20230714103320.png]]

### 1.2 开启防火墙

打开 `Windows Defender 防火墙`，选择 `允许应用或功能通过 Windows Defender 防火墙`：

![[Pasted image 20230714104946.png]]

点击 `更改设置`，找到 `Clash for Windows`，然后勾选 `专用` 和 `公用`：

![[Pasted image 20230714104958.png]]

> 如果找不到 `Clash for Windows`，点击下方的 `允许其他应用`，然后找到安装路径，将 `Clash for Windows.exe` 文件加入进来。

## 2 . 配置 WSL 2
----------

### 2.1 单次配置

这种配置方法适用于**单次配置**，也就是在重启终端后会失效。在终端中输入如下语句：

如果是采用 `HTTP` 协议：

```
export hostip=$(cat /etc/resolv.conf |grep -oP '(?<=nameserver\ ).*')
export https_proxy="http://${hostip}:7890";
export http_proxy="http://${hostip}:7890";
```

> 其中后两行的 `7890` 需要更换为自己代理服务器的端口号，在 `Clash` 的 `主页` 选项卡中可以查看。

如果采用 `socket5` 协议：

```
export hostip=$(cat /etc/resolv.conf |grep -oP '(?<=nameserver\ ).*')
export http_proxy="socks5://${hostip}:7890"
export https_proxy="socks5://${hostip}:7890"
```

如果端口号一样则可以合并成为一句话：

```
export all_proxy="socks5://${hostip}:7890"
```

使用 `curl` 即可验证代理是否成功，如果有返回值则说明代理成功。

```
curl www.google.com
```

### 2.2 长期配置

这种配置方法适用于**长期配置**，也就是写一个脚本，然后可以通过命令启动代理。新建 `proxy.sh` 脚本如下：

```bash
#!/bin/sh
hostip=$(cat /etc/resolv.conf | grep nameserver | awk '{ print $2 }')
wslip=$(hostname -I | awk '{print $1}')
port=7890
 
PROXY_HTTP="http://${hostip}:${port}"
 
set_proxy(){
  export http_proxy="${PROXY_HTTP}"
  export HTTP_PROXY="${PROXY_HTTP}"
 
  export https_proxy="${PROXY_HTTP}"
  export HTTPS_proxy="${PROXY_HTTP}"
 
  export ALL_PROXY="${PROXY_SOCKS5}"
  export all_proxy=${PROXY_SOCKS5}
 
  git config --global http.https://github.com.proxy ${PROXY_HTTP}
  git config --global https.https://github.com.proxy ${PROXY_HTTP}
 
  echo "Proxy has been opened."
}
 
unset_proxy(){
  unset http_proxy
  unset HTTP_PROXY
  unset https_proxy
  unset HTTPS_PROXY
  unset ALL_PROXY
  unset all_proxy
  git config --global --unset http.https://github.com.proxy
  git config --global --unset https.https://github.com.proxy
 
  echo "Proxy has been closed."
}
 
test_setting(){
  echo "Host IP:" ${hostip}
  echo "WSL IP:" ${wslip}
  echo "Try to connect to Google..."
  resp=$(curl -I -s --connect-timeout 5 -m 5 -w "%{http_code}" -o /dev/null www.google.com)
  if [ ${resp} = 200 ]; then
    echo "Proxy setup succeeded!"
  else
    echo "Proxy setup failed!"
  fi
}
 
if [ "$1" = "set" ]
then
  set_proxy
 
elif [ "$1" = "unset" ]
then
  unset_proxy
 
elif [ "$1" = "test" ]
then
  test_setting
else
  echo "Unsupported arguments."
fi
```

> 注意：其中第 4 行的 `<PORT>` 更换为自己的代理端口号。

*   `source ./proxy.sh set`：开启代理
*   `source ./proxy.sh unset`：关闭代理
*   `source ./proxy.sh test`：查看代理状态

#### 2.1 任意路径下开启代理

可以在 `~/.bashrc` 中添加如下内容，并将其中的路径修改为上述脚本的路径：

```
alias proxy="source /path/to/proxy.sh"
```

然后输入如下命令：

```
source ~/.bashrc
```

那么可以直接在任何路径下使用如下命令：

*   `proxy set`：开启代理
*   `proxy unset`：关闭代理
*   `proxy test`：查看代理状态

#### 2.2 自动设置代理

也可以添加如下内容，即在每次 shell 启动时自动设置代理，同样的，更改其中的路径为自己的脚本路径：

```
. /path/to/proxy.sh set
```