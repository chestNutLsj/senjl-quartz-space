---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/4_2_1_visdom/
title: 4.2.1 Visdom - PyTorch Tutorial
date: 2023-04-12 20:15:46
tag: 
summary: 
---
```
import torch
import math
import numpy as np
from visdom import Visdom
import time
torch.__version__
```

```
'1.0.0'
```

Visdom 是 Facebook 在 2017 年发布的一款针对 PyTorch 的可视化工具。[官网](https://github.com/facebookresearch/visdom),visdom 由于其功能简单，一般会被定义为服务器端的 matplot，也就是说我们可以直接使用 python 的控制台模式进行开发并在服务器上执行，将一些可视化的数据传送到 Visdom 服务上，通过 Visdom 服务进行可视化

## 安装

Visdom 的安装很简单，直接使用命令`pip install visdom`安装即可。 在安装完成后，使用命令`python -m visdom.server` 在本地启动服务器，启动后会提示`It's Alive! You can navigate to http://localhost:8097` 这就说明服务已经可用，我们打开浏览器，输入`http://localhost:8097` 即可看到页面。

端口 8097 是默认的端口可以在启动命令后加 `-port`参数指定端口，常用的参数还有 `--hostname`，`-base_url`等

## 坑

Visdom 的服务在启动时会自动下载一些静态文件，这里坑就来了，因为某些无法描述的原因，导致下载会失败，比如类似这样的提示 `ERROR:root:Error 404 while downloading https://unpkg.com/layout-bin-packer@1.4.0` 就说明静态文件没有下载完全，这样有可能就会打不开或者页面中没有菜单栏，那么需要手动进行下载，这里我打包了一份正常的静态文件，直接复制到`Lib\site-packages\visdom`中即可。

如果不知道 conda 的环境目录在哪里，可以使用`conda env list` 查看。

感谢 CSDN 的伙伴提供的缺失文件，原文[这里](https://blog.csdn.net/qq_36941368/article/details/82288154)

## 基本概念

### Environments

Environments 的作用是对可视化区域进行分区，每个用户都会有一个叫做 main 的默认分区，如图所示:

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/1.PNG)

在程序指定的情况下，默认的图表都会放到这里面。

## Panes

Panes 是作为每一个可视化图表的容器，可以使用生成的图表，图片，文本进行填充，我们可以对 Panes 进行拖放，删除，调整大小和销毁等操作：

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/2.PNG)

Panes 和 Environments 是一对多的关系，即一个 Environments 可以包含多个 Panes。

### VIEW

在对 Panes 进行调整后，可以通过 VIEW 对状态进行管理：

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/3.PNG)

## 可视化接口

Visdom 是由 Plotly 提供的可视化支持，所以提供一下可视化的接口: - vis.scatter : 2D 或 3D 散点图 - vis.line : 线图 - vis.stem : 茎叶图 - vis.heatmap : 热力图 - vis.bar : 条形图 - vis.histogram: 直方图 - vis.boxplot : 箱型图 - vis.surf : 表面图 - vis.contour : 轮廓图 - vis.quiver : 绘出二维矢量场 - vis.image : 图片 - vis.text : 文本 - vis.mesh : 网格图 - vis.save : 序列化状态

## 使用

### 绘制简单的图形

这里我们使用官方的 DEMO 来做样例：

```
env = Visdom() 
assert env.check_connection() #测试一下链接，链接错误的话会报错
```

这里生成 sin 和 cos 两条曲线数据：

```
Y = np.linspace(0, 2 * math.pi, 70)
X = np.column_stack((np.sin(Y), np.cos(Y)))
```

使用茎叶图展示：

```
env.stem(
        X=X,
        Y=Y,
        opts=dict(legend=['Sine', 'Cosine'])
    )
```

```
'window_36f18bc34b4992'
```

可以通过 env 参数指定 Environments，如果名称包含了下划线`_`那么 visdom 会跟根据下划线分割并自动分组：

```
envtest = Visdom(env='test_mesh')
assert envtest.check_connection()
```

生成一个网格图：

```
x = [0, 0, 1, 1, 0, 0, 1, 1]
y = [0, 1, 1, 0, 0, 1, 1, 0]
z = [0, 0, 0, 0, 1, 1, 1, 1]
X = np.c_[x, y, z]
i = [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2]
j = [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3]
k = [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6]
Y = np.c_[i, j, k]
envtest.mesh(X=X, Y=Y, opts=dict(opacity=0.5))
```

```
'window_36f18bc533e990'
```

## 更新损失函数

在训练的时候我们每一批次都会打印一下训练的损失和测试的准确率，这样展示的图表是需要动态增加数据的，下面我们来模拟一下这种情况：

```
x,y=0,0
env2 = Visdom()
pane1= env2.line(
    X=np.array([x]),
    Y=np.array([y]),
    opts=dict(title='dynamic data'))
```

```
for i in range(10):
    time.sleep(1) #每隔一秒钟打印一次数据
    x+=i
    y=(y+i)*1.5
    print(x,y)
    env2.line(
        X=np.array([x]),
        Y=np.array([y]),
        win=pane1,#win参数确认使用哪一个pane
        update='append') #我们做的动作是追加，除了追加意外还有其他方式，这里我们不做介绍了
```

```
0 0.0
1 1.5
3 5.25
6 12.375
10 24.5625
15 44.34375
21 75.515625
28 123.7734375
36 197.66015625
45 309.990234375
```

在运行完上述程序时，切换到 visdom，看看效果吧🙂

visdom 的基本用法介绍完毕，下一节介绍更加强大的 tensorboardx。