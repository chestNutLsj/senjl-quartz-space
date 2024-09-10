WSL 默认安装在 C 盘，接下来不论是安装发行版，亦或是在发行版中安装、运行应用，都会占用大量的 C 盘空间。这让本就狭小的 C 盘空间雪上加霜，为此我们需要将 WSL 的发行版迁移至非系统盘，具体位置随喜好即可。

## 详细步骤

只需要五行命令：

```shell
# list local wsl instances
wsl -l -v
# stop the specified distro in order to export
wsl --terminate distro_name
# export the distro as .tar file
# e.g. wsl --export Ubuntu E:\WSL\ubuntu.tar
wsl --export distro_name path_to_tar_file
# unregister the distro
wsl --unregister distro_name
# import the .tar file at the location you like, essentially, this step is install the distro from local file
wsl --import distro_name install_location path_to_tar
```

## 更多帮助

可以阅读 `wsl --help` 中有关管理 distro 的部分：

![[wsl-export-import-distro.png]]

## 我的实例

一个转移 WSL Ubuntu 的例子如下：

![[转移wsl子系统到非系统盘的命令总览.png]]