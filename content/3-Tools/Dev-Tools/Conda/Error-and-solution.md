## `conda init powershell` 无效
在 windows 上，常常由于用户文件夹为中文名称而导致脚本运行失败，例如此处使用 `conda init powershell` 脚本对 powershell 环境初始化时，可能导致初始化无效。（然而 `conda init cmd.exe` 则可以成功） 

查看报错信息，最后几行如下：
![[conda-init-pwsh-no-effect.png]]
这表示 conda 调用 onedrive 下 powershell 的 `profile.ps1` 来初始化 powershell 环境，可以看到其中有个目录的名称出现乱码。打开文件资源管理器可以知道那个乱码目录是“文档”，英文名称是“Documents”。那么修复方式可以如下：

在 OneDrive 网页版中，将“文档”改名为“Documents”，同步之后再重新执行 `conda init powershell` 就可以在正确路径下生成配置文件了。

## 安装时发生包冲突
解决办法是使用 conda-forge 频道。

conda-forge 是除 Anaconda 公司默认频道外的一个开源频道，其中软件包比官方更新更快叶更安全，并且具有强大的依赖关系解析实现。因此可以将其加入到 conda 配置文件中：
```shell
# 配置文件为 ~/.condarc
conda config --add channels conda-forge

# 如果要添加其他频道，如pytorch、nvidia
conda config --append channels pytorch nvidia
```

较新的conda版本(>=4.6)引入了严格的通道优先级功能。类型

```shell
conda config --describe channel_priority
```

解决方案是在使用conda-forge包时，将conda-forge通道添加到.condarc文件中的默认值之上，并使用以下命令激活严格的通道优先级：

```shell
conda config --set channel_priority strict
```

这将确保所有依赖项都来自 conda-forge 通道，除非它们只存在于缺省值上。

## 在目标环境中没有写入权限
在安装 pytorch 时，使用命令 
```shell
conda install pytorch torchvision torchaudio pytorch-cuda=11.7 -c pytorch -c nvidia
```

运行结束时会报错：
```shell
EnvironmentNotWritableError: The current user does not have write permissions to the target environment.
  Environment location: /opt/miniconda3
  ```

对此解决办法是为目标文件夹开启写入权限：
```shell
sudo chmod -R 777 /opt/miniconda3
```

之后重新输入命令即可运行成功。

## 配置国内镜像源
配置代理比较麻烦，但可以一劳永逸（我推荐这个办法）。

但如果实在没有条件，可以为 conda 配置国内镜像源，提高下载速度：
```shell
# 查看已有源
conda config --show-sources

# 删除安装源
conda config --remove channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/

# 换回默认源
conda config --remove-key channels
```

以下是几个常用软件镜像站：

**清华：**
```
channels:
  - defaults
show_channel_urls: true
channel_alias: https://mirrors.tuna.tsinghua.edu.cn/anaconda
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/pro
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  msys2: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  bioconda: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  menpo: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  simpleitk: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
```

**上交：**
```
channels:
  - defaults
show_channel_urls: true
channel_alias: https://anaconda.mirrors.sjtug.sjtu.edu.cn/
default_channels:
  - https://anaconda.mirrors.sjtug.sjtu.edu.cn/pkgs/main
  - https://anaconda.mirrors.sjtug.sjtu.edu.cn/pkgs/free
  - https://anaconda.mirrors.sjtug.sjtu.edu.cn/pkgs/mro
  - https://anaconda.mirrors.sjtug.sjtu.edu.cn/pkgs/msys2
  - https://anaconda.mirrors.sjtug.sjtu.edu.cn/pkgs/pro
  - https://anaconda.mirrors.sjtug.sjtu.edu.cn/pkgs/r
custom_channels:
  conda-forge: https://anaconda.mirrors.sjtug.sjtu.edu.cn/conda-forge
  soumith: https://anaconda.mirrors.sjtug.sjtu.edu.cn/cloud/soumith
  bioconda: https://anaconda.mirrors.sjtug.sjtu.edu.cn/cloud/bioconda
  menpo: https://anaconda.mirrors.sjtug.sjtu.edu.cn/cloud/menpo
  viscid-hub: https://anaconda.mirrors.sjtug.sjtu.edu.cn/cloud/viscid-hub
  atztogo: https://anaconda.mirrors.sjtug.sjtu.edu.cn/cloud/atztogo
```

## 在 vscode 中配置正确的 conda executable 路径

![[报错及解决办法-conda-path.png]]