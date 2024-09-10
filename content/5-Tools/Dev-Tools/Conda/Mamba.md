官方文档：[Welcome to Mamba’s documentation! ](https://mamba.readthedocs.io/en/latest/index.html)；

## Intro
Mamba 是与 Conda 完全兼容的一个项目，其拥有并行下载功能，较 Conda 本身下载速度更快、界面更美观等特点。

## 安装
只需一行命令：
```shell
conda install mamba -n base -c conda-forge
```

## 使用
和使用 conda 一样，只是在 conda 命令时将 conda 替换为 mamba 即可，如：
```shell
# conda without mamba 
conda create -n py39 python=3.9 -y -c conda-forge
conda install sklearn

# conda with mamba
mamba create -n py39 python=3.9 -y -c conda-forge
mamba install sklearn
```