参考书：《Flask Web 全栈开发实战》—— 黄勇

## 环境配置
python=3.9
Flask=2.0.1

```shell
conda create -n flask-dev python=3.9 -c conda-forge -y

conda install flask -c conda-forge -y
```

## 开发软件
PyCharm Professional

VSCode

## Hello Flask
在 PyCharm 中新建项目->选择解释器为刚才创建的 conda 环境->创建
![[new-project.png]]

> [! warning] 环境的选择
> 如果项目不是用来学习的，那么建议使用新建环境，保持环境中软件包版本的一致性。

### 项目结构

![[project-structure.png]]

- `app.py`：项目的入口文件，默认生成一个主路由，并且视图函数叫做 `hello_world`
- `templates/`：存放模版文件的目录
- `static/`：存放静态文件的目录