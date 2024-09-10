## What is Docker?

Docker is a software platform designed for building an application in a loosely isolated environment called a container. Containers are essentially lightweight and contain everything required to run the application, so we don’t need to worry about files installed in the Host computer. We can run many containers on the host machine without affecting one another. Docker provides us with a way to create, run, manage and communicate with the containers.

Docker like any other software comes mainly in two different versions – the stable version and the development version. The stable version is recommended for most users, who want to get their work going without any hassle. The development version is the version that is being currently worked on. It contains newer/improved features, but it is generally unstable and is not generally not recommended for daily use. We will be going through the installations of both versions.
## Install docker-desktop on Windows
### 1. 下载安装包
下载链接：[Install Docker Desktop on Windows](https://docs.docker.com/desktop/windows/install/)

正常安装即可。旧的帖子里提到在安装过程中需要勾选 `install required windows components for wsl2` 这一选项，但近日我在下载时并没有这一步，这是官方在安装时已经默认选择了 `wsl 2 backend`：

![[docker-system-requirements.png]]

### 2. 配置 Docker Desktop

打开设置页，可以看到已经默认勾选了 `use wsl 2 based engine`，其理由是 `windows home can only run the wsl 2 backend`，印证上文：
![[docker-settings-general.png]]

勾选 Resources > WSL Integration > Enable integration with my default WSL distro, 启用与默认 WSL 发行版的集成：
![[docker-wsl-integration.png]]

点击 Apply & Restart, 之后就可以在 WSL 中查看到 docker
![[docker-check.png]]

### 3. 转移 docker-desktop 到非系统盘
docker-desktop 本质上是 WSL 2 的一个分发，因此转移它的方式和转移 wsl distro 一致，但是要注意转移的具体是哪一个 docker distro。

Docker 中下载的镜像容器都在 docker-desktop-data 里面，因此我们需要将其转移到非系统盘，步骤如下：

```powershell
# 终止所有子系统
wsl --shutdown
# 如果上述命令没有成功关闭，则使用：
# 终止指定的子系统
wsl --terminate docker-desktop-data

# 将子系统导出为 tar 包
wsl --export docker-desktop-data E:\docker\docker-desktop-data.tar

# 使用 wsl 命令注销并删除子系统
wsl --unregister docker-desktop-data

# 重新导入子系统到指定目录
wsl --import docker-desktop-data E:\docker\docker-desktop-data E:\docker\docker-desktop-data.tar

# 删除.tar包
del E:\docker\docker-desktop-data.tar
```

## Install Docker on Arch
![[在ArchLinux上安装docker.png]]
In this tutorial we walk through the steps to install Docker on Arch and Arch based systems (Manjaro, Garuda etc.). We’ll also go over the complete setup steps for Docker so you’re ready to go.

Btw, if you’re using Debian, we also have a guide to [install Docker on Debian](https://www.linuxfordevices.com/tutorials/debian/install-docker-on-debian). Let’s get started!

### 1A. Install the Official version of Docker on Arch

We will be using pacman to install the official binaries from the. We need to clone it and build it from the source. So we open up a terminal and first clone the repository. You need to have git installed for this.

```
sudo pacman -S docker docker-compose ctop dive lazydocker
```
- Docker Compose - Docker 官方的容器编排工具,通过 YAML 文件定义多容器应用。
- LazyDocker - 基于终端的Docker管理工具,提供类似GUI的界面,资源占用小。
- Dive - 一个构建和运行分析工具,可以深入探查Docker镜像每一层内容。
- Ctop - 基于终端的Docker监控工具,可以查看容器 metrics 和进程信息。

### 1B. Install the development version of Docker on Arch

```
yay -S docker-git
```

### 2. Starting the docker service on startup

Before we can use docker, we need to enable Docker daemon. We can easily do it using [**systemctl start**](https://www.linuxfordevices.com/tutorials/linux/start-stop-restart-services-linux).

```
sudo systemctl start docker. service
```

This becomes a tiring job to enable docker daemon every time after we boot our computer. We can make sure the docker daemon is run every time we boot our computer using systemctl enable.

```
sudo systemctl enable docker.service
```

### 3. Adding User to Docker group

Running docker requires sudo privileges. So we need to root every time we run docker. This can be eliminated by adding the user to the docker group. To add the user to the docker group, use the usermod command.

```
sudo usermod -aG docker $USER
```

==The user needs to log back in to see the effect.==

> Note: Anyone added to the `docker` group is root equivalent, so make sure you trust the user that you are adding to the docker group.

### 4. Hello Docker!

Now that we have docker installed we can run our first docker command- “Hello World”

```
❯ docker run hello-world  
Unable to find image 'hello-world:latest' locally  
latest: Pulling from library/hello-world  
719385e32844: Pull complete    
Digest: sha256:4f53e2564790c8e7856ec08e384732aa38dc43c52f02952483e3f003afbf23db  
Status: Downloaded newer image for hello-world:latest  
  
Hello from Docker!  
This message shows that your installation appears to be working correctly.  
  
To generate this message, Docker took the following steps:  
1. The Docker client contacted the Docker daemon.  
2. The Docker daemon pulled the "hello-world" image from the Docker Hub.  
   (amd64)  
3. The Docker daemon created a new container from that image which runs the  
   executable that produces the output you are currently reading.  
4. The Docker daemon streamed that output to the Docker client, which sent it  
   to your terminal.  
  
To try something more ambitious, you can run an Ubuntu container with:  
$ docker run -it ubuntu bash  
  
Share images, automate workflows, and more with a free Docker ID:  
https://hub.docker.com/  
  
For more examples and ideas, visit:  
https://docs.docker.com/get-started/
```

### Conclusion

You are now all set up to run docker, pull images and create your own application. To create your own docker based application you can refer to [this article](https://www.linuxfordevices.com/tutorials/linux/node-js-app-in-docker).