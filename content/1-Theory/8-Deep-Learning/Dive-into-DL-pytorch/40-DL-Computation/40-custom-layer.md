---
publish: "true"
tags:
  - D2L
  - Deep_Learning
  - PyTorch
date: 2024-02-17
---
# 自定义层

深度学习成功背后的一个因素是神经网络的灵活性：我们可以用创造性的方式组合不同的层，从而设计出适用于各种任务的架构。例如，研究人员发明了专门用于处理图像、文本、序列数据和执行动态规划的层。有时我们会遇到或要自己发明一个现在在深度学习框架中还不存在的层。在这些情况下，必须构建自定义层。本节将展示如何构建自定义层。

## 不带参数的层

首先，我们构造一个没有任何参数的自定义层。回忆一下在 [[10-model-construction|4.1 节]] 对块的介绍，这应该看起来很眼熟。下面的 `CenteredLayer` 类要从其输入中减去均值。要构建它，我们只需继承基础层类并实现前向传播功能。

```python
import torch
from torch import nn
import torch.nn.functional as F

class CenteredLayer(nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, X):
        return X - X.mean()
```

让我们向该层提供一些数据，验证它是否能按预期工作。

```python
layer = CenteredLayer()
layer(torch.FloatTensor([1, 2, 3, 4, 5]))
```

```output
tensor([-2., -1.,  0.,  1.,  2.])
```

现在，我们可以将层作为组件合并到更复杂的模型中。

```python
net = nn.Sequential(nn.Linear(8, 128), CenteredLayer())
```

作为额外的健全性检查，我们可以在向该网络发送随机数据后，检查均值是否为0。由于我们处理的是浮点数，因为存储精度的原因，我们仍然可能会看到一个非常小的非零数。

```python
Y = net(torch.rand(4, 8))
Y.mean()
```

## 带参数的层

以上我们知道了如何定义简单的层，下面我们继续定义具有参数的层，这些参数可以通过训练进行调整。我们可以使用内置函数来创建参数，这些函数提供一些基本的管理功能。比如管理访问、初始化、共享、保存和加载模型参数。这样做的好处之一是：我们不需要为每个自定义层编写自定义的序列化程序。

现在，让我们实现自定义版本的全连接层。回想一下，该层需要两个参数，一个用于表示权重，另一个用于表示偏置项。在此实现中，我们使用修正线性单元作为激活函数。该层需要输入参数：`in_units` 和 `units`，分别表示输入数和输出数。

```python
class MyLinear(nn.Module):
    def __init__(self, in_units, units):
        super().__init__()
        self.weight = nn.Parameter(torch.randn(in_units, units))
        self.bias = nn.Parameter(torch.randn(units,))
    def forward(self, X):
        linear = torch.matmul(X, self.weight.data) + self.bias.data
        return F.relu(linear)
```

接下来，我们实例化`MyLinear`类并访问其模型参数。

```python
linear = MyLinear(5, 3)
linear.weight
```

我们可以使用自定义层直接执行前向传播计算。

```python
linear(torch.rand(2, 5))
```

我们还可以使用自定义层构建模型，就像使用内置的全连接层一样使用自定义层。

```python
net = nn.Sequential(MyLinear(64, 8), MyLinear(8, 1))
net(torch.rand(2, 64))
```

## 小结

* 我们可以通过基本层类设计自定义层。这允许我们定义灵活的新层，其行为与深度学习框架中的任何现有层不同。
* 在自定义层定义完成后，我们就可以在任意环境和网络架构中调用该自定义层。
* 层可以有局部参数，这些参数可以通过内置函数创建。

## 练习

1. 设计一个接受输入并计算张量降维的层，它返回$y_k = \sum_{i, j} W_{ijk} x_i x_j$。
2. 设计一个返回输入数据的傅立叶系数前半部分的层。

[Discussions](https://discuss.d2l.ai/t/1835)
