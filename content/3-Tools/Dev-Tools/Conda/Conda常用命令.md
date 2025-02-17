## 创建conda环境
```shell
conda create --name env_name python=3.9(env_package_name) -y
```

参数解释：
- `-n --name`：指定环境名字
- `python=3.9` ：自动下载 3.9 版本中最新的小版本；如果使用 `python==3.9.X`，则会下载指定的 3.9. X 版本；
- `-y --yes`：Sets any confirmation values to 'yes' automatically. Users will not be asked to confirm any adding, deleting, backups, etc.

## 删除 conda 环境及其中所有包
```shell
# list all the local envs
conda env list
# remove the specified env and its all pkgs
conda remove --name py39 --all
```

## 查看已创建 conda 环境
```shell
conda env list
# or
conda info -e
```

## 查看当前环境中已安装的包

```shell
$ conda list
```

## 激活/解除conda环境
```shell
# 如果没有对shell初始化的话，需要手动激活conda本身
source /opt/miniconda3/bin/activate base(or another env)

# activate specific conda env
conda activate py39

# deactivate conda env, deactivate does not accept arguments
conda deactivate
```

## 查找包
- 精确查找
```shell
$ conda search --full-name <package_full_name>
```

- 模糊查找
```shell
$ conda search <text>
```

## 在指定环境中安装包

```shell
$ conda install --name <env_name> <package_name>
$ conda install --name <env_name> -c conda-forge <package_name>
$ conda install --name <env_name> -c anaconda <package_name>
```

## 卸载包

```shell
$ conda remove --name <env_name> <package_name>
```

## 更新conda
```shell
conda update -n base -c conda-forge conda
```

## 复制环境

```shell
$ conda create --name <new_env_name> --clone <copied_env_name>
```

还有一种方法是导出环境配置：
```shell
# activate specific env
conda activate py37
# export env config, only for the same OS(win or linux)
conda env export > env_py37.yml
pip freeze > requirement.txt

# 重建环境只需要
conda env create -f env_py37.yml
pip install -r requirement.txt
```

## conda 环境重置
如果要回滚 conda 环境到之前的版本，则如下操作：
```shell
# 查看conda环境的历史版本
conda list --revisions

# 回滚到指定版本
conda install --revision <revision number>
```

## 使用 requirements.txt 安装

```shell
conda install --yes --file requirements.txt --name <env_name>
requirements.txt文件格式如下：
tensorflow==1.10.0
markupsafe
itsdangerous
wtforms==2.2.1
gevent==1.1.1
python-engineio==2.1.0
python-socketio==1.9.0
Flask==1.0.2
flask-wtf==0.14.2
flask-socketio==3.0.0
pandas==0.23.4
six
jpype1==0.6.3
gensim==3.4.0
jieba
scikit-learn
```

## conda 添加镜像源

```shell
$ conda config --add channels anaconda
$ conda config --add channels conda-forge
$ conda config --add channels
https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
```