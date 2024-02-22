---
publish: "true"
tags:
  - D2L
  - Deep_Learning
  - PyTorch
date: 2024-02-20
---
# 网络中的网络（NiN）

LeNet、AlexNet 和 VGG 都有一个共同的设计模式：**通过一系列的卷积层与汇聚层来提取空间结构特征；然后通过全连接层对特征的表征进行处理**。AlexNet 和 VGG 对 LeNet 的改进主要在于如何扩大和加深这两个模块。或者，可以想象在这个过程的早期使用全连接层。然而，如果使用了全连接层，可能会完全放弃所表征的空间结构。

*网络中的网络*（*NiN*）提供了一个非常简单的解决方案：在每个像素的通道上分别使用多层感知机[^1]。

## NiN块

回想一下，卷积层的输入和输出由四维张量组成，张量的每个轴分别对应样本、通道、高度和宽度。另外，全连接层的输入和输出通常是分别对应于样本和特征的二维张量。NiN 的想法是**在每个像素位置（针对每个高度和宽度）应用一个全连接层**。如果我们将权重连接到每个空间位置，我们可以将其视为 $1\times 1$ 卷积层（如 [[40-channels#1 $ times$ 1 卷积层|5.4 节]] 中所述），或作为在每个像素位置上独立作用的全连接层。从另一个角度看，即将空间维度中的每个像素视为单个样本，将通道维度视为不同特征（feature）。

下图说明了 VGG 和 NiN 及它们的块之间主要架构差异：
- ![[nin.svg]]
- NiN块以一个普通卷积层开始，后面是两个$1 \times 1$的卷积层。这两个$1 \times 1$卷积层充当带有ReLU激活函数的逐像素全连接层。
- 第一层的卷积窗口形状通常由用户设置。随后的卷积窗口形状固定为$1 \times 1$。

```python
from d2l import torch as d2l
import torch
from torch import nn

def nin_block(in_channels, out_channels, kernel_size, strides, padding):
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size, strides, padding),
        nn.ReLU(),
        nn.Conv2d(out_channels, out_channels, kernel_size=1), nn.ReLU(),
        nn.Conv2d(out_channels, out_channels, kernel_size=1), nn.ReLU())
```

## NiN模型

最初的 NiN 网络是在 AlexNet 后不久提出的，显然从中得到了一些启示。NiN 使用窗口形状为 $11\times 11$、$5\times 5$ 和 $3\times 3$ 的卷积层，输出通道数量与 AlexNet 中的相同。每个 NiN 块后有一个最大汇聚层，汇聚窗口形状为 $3\times 3$，步幅为2。

NiN 和 AlexNet 之间的一个显著区别是 NiN 完全取消了全连接层。相反，NiN 使用一个 NiN 块，其输出通道数等于标签类别的数量。最后放一个*全局平均汇聚层*（global average pooling layer），生成一个对数几率	（logits）。NiN 设计的一个优点是，它**显著减少了模型所需参数的数量**。然而，在实践中，这种设计有时会增加训练模型的时间。

```python
net = nn.Sequential(
    nin_block(1, 96, kernel_size=11, strides=4, padding=0),
    nn.MaxPool2d(3, stride=2),
    nin_block(96, 256, kernel_size=5, strides=1, padding=2),
    nn.MaxPool2d(3, stride=2),
    nin_block(256, 384, kernel_size=3, strides=1, padding=1),
    nn.MaxPool2d(3, stride=2),
    nn.Dropout(0.5),
    # 标签类别数是10
    nin_block(384, 10, kernel_size=3, strides=1, padding=1),
    nn.AdaptiveAvgPool2d((1, 1)),
    # 将四维的输出转成二维的输出，其形状为(批量大小,10)
    nn.Flatten())
```

我们创建一个数据样本来查看每个块的输出形状。

```python
X = torch.rand(size=(1, 1, 224, 224))
for layer in net:
    X = layer(X)
    print(layer.__class__.__name__,'output shape:\t', X.shape)
```

```output
Sequential output shape:	 torch.Size([1, 96, 54, 54])
MaxPool2d output shape:	 torch.Size([1, 96, 26, 26])
Sequential output shape:	 torch.Size([1, 256, 26, 26])
MaxPool2d output shape:	 torch.Size([1, 256, 12, 12])
Sequential output shape:	 torch.Size([1, 384, 12, 12])
MaxPool2d output shape:	 torch.Size([1, 384, 5, 5])
Dropout output shape:	 torch.Size([1, 384, 5, 5])
Sequential output shape:	 torch.Size([1, 10, 5, 5])
AdaptiveAvgPool2d output shape:	 torch.Size([1, 10, 1, 1])
Flatten output shape:	 torch.Size([1, 10])

```

## 训练模型

和以前一样，我们使用 Fashion-MNIST 来训练模型。训练 NiN 与训练 AlexNet、VGG 时相似。

```python
lr, num_epochs, batch_size = 0.1, 10, 128
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size, resize=224)
d2l.train_ch6(net, train_iter, test_iter, num_epochs, lr, d2l.try_gpu())
```

不过训练结果颇为奇怪，这是第一次训练的结果：

```
loss 2.303, train acc 0.100, test acc 0.100
986.3 examples/sec on cuda:0

```

![[nin-lr-01.svg]]

可以看出在第 2 个 epoch 之后，训练损失度陡增，再也无法收敛。

而我又重新训练了一次，这次能够正常收敛：

```output
loss 0.336, train acc 0.874, test acc 0.871
974.4 examples/sec on cuda:0

```

![[nin-lr-01-2.svg]]

这里让我感到困惑，需要查找资料再做理解。

另外我尝试使用 `lr=0.01` ，这样的训练收敛速度极慢，第 10 epoch 时训练损失率才勉强小于 1 。而若调整到 `lr=0.05` ，则训练结果如下：

```output
loss 0.369, train acc 0.864, test acc 0.859
556.6 examples/sec on cuda:0

```

![[nin-lr-005.svg]]

NiN 占用的显存空间和 AlexNet 差不多：

```
Mon Feb 19 21:26:40 2024          
+---------------------------------------------------------------------------------------+  
| NVIDIA-SMI 545.29.06              Driver Version: 545.29.06    CUDA Version: 12.3     |  
|-----------------------------------------+----------------------+----------------------+  
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |  
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |  
|                                         |                      |               MIG M. |  
|=========================================+======================+======================|  
|   0  NVIDIA GeForce GTX 1660 Ti     Off | 00000000:01:00.0 Off |                  N/A |  
| N/A   51C    P0              72W /  80W |   1760MiB /  6144MiB |     94%      Default |  
|                                         |                      |                  N/A |  
+-----------------------------------------+----------------------+----------------------+  
                                                                                           
+---------------------------------------------------------------------------------------+  
| Processes:                                                                            |  
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |  
|        ID   ID                                                             Usage      |  
|=======================================================================================|  
|    0   N/A  N/A       617      G   /usr/lib/Xorg                                 4MiB |  
|    0   N/A  N/A    222152      C   ...enjl/miniforge3/envs/d2l/bin/python     1752MiB |  
+---------------------------------------------------------------------------------------+
```

## 小结

* NiN使用由一个卷积层和多个$1\times 1$卷积层组成的块。该块可以在卷积神经网络中使用，以允许更多的每像素非线性。
* NiN去除了容易造成过拟合的全连接层，将它们替换为全局平均汇聚层（即在所有位置上进行求和）。该汇聚层通道数量为所需的输出数量（例如，Fashion-MNIST的输出为10）。
* 移除全连接层可减少过拟合，同时显著减少NiN的参数。
* NiN的设计影响了许多后续卷积神经网络的设计。

## 练习

1. 调整NiN的超参数，以提高分类准确性。
1. 为什么NiN块中有两个$1\times 1$卷积层？删除其中一个，然后观察和分析实验现象。
1. 计算NiN的资源使用情况。
    1. 参数的数量是多少？
    1. 计算量是多少？
    1. 训练期间需要多少显存？
    1. 预测期间需要多少显存？
1. 一次性直接将$384 \times 5 \times 5$的表示缩减为$10 \times 5 \times 5$的表示，会存在哪些问题？

:begin_tab:`mxnet`
[Discussions](https://discuss.d2l.ai/t/1870)
:end_tab:

:begin_tab:`pytorch`
[Discussions](https://discuss.d2l.ai/t/1869)
:end_tab:

:begin_tab:`tensorflow`
[Discussions](https://discuss.d2l.ai/t/1868)
:end_tab:

:begin_tab:`paddle`
[Discussions](https://discuss.d2l.ai/t/11790)
:end_tab:

[^1]: Lin M, Chen Q, Yan S. Network in network[J]. arXiv preprint arXiv:1312.4400, 2013.