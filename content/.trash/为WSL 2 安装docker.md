## 在 windows 上安装 docker-desktop

1. 下载安装包
下载链接：[Install Docker Desktop on Windows](https://docs.docker.com/desktop/windows/install/)

正常安装即可。旧的帖子里提到在安装过程中需要勾选 `install required windows components for wsl2` 这一选项，但近日我在下载时并没有这一步，这是官方在安装时已经默认选择了 `wsl 2 backend`：

![[docker-system-requirements.png]]

2. 打开 Docker Desktop

打开设置页，可以看到已经默认勾选了 `use wsl 2 based engine`，其理由是 `windows home can only run the wsl 2 backend`，印证上文：
![[docker-settings-general.png]]

勾选 Resources > WSL Integration > Enable integration with my default WSL distro, 启用与默认 WSL 发行版的集成：
![[docker-wsl-integration.png]]

3. 点击 Apply & Restart, 之后就可以在 WSL 中查看到 docker
![[docker-check.png]]

## 转移 docker-desktop 到非系统盘
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