---
publish: "true"
tags:
  - D2L
  - Deep_Learning
  - PyTorch
date: 2024-02-17
---
# 延后初始化

到目前为止，我们忽略了建立网络时需要做的以下这些事情：

* 我们定义了网络架构，但没有指定输入维度。
* 我们添加层时没有指定前一层的输出维度。
* 我们在初始化参数时，甚至没有足够的信息来确定模型应该包含多少参数。

有些读者可能会对我们的代码能运行感到惊讶。毕竟，深度学习框架无法判断网络的输入维度是什么。这里的诀窍是框架的***延后初始化***（defers initialization），即**直到数据第一次通过模型传递时，框架才会动态地推断出每个层的大小**。

在以后，当使用卷积神经网络时，由于输入维度（即图像的分辨率）将影响每个后续层的维数，有了该技术将更加方便。现在我们在编写代码时无须知道维度是什么就可以设置参数，这种能力可以大大简化定义和修改模型的任务。接下来，我们将更深入地研究初始化机制。

## 实例化网络

首先，让我们实例化一个多层感知机。

```python
import torch
from torch import nn
from d2l import torch as d2l

net = nn.Sequential(nn.LazyLinear(256), nn.ReLU(), nn.LazyLinear(10))

# output
/home/senjl/miniforge3/envs/d2l/lib/python3.9/site-packages/torch/nn/modules/lazy.py:180: UserWarning: Lazy modules are a new feature under heavy development so changes to the API or functionality can happen at any moment.
  warnings.warn('Lazy modules are a new feature under heavy development '

```

此时，因为输入维数是未知的，所以网络不可能知道输入层权重的维数。因此，框架尚未初始化任何参数，我们通过尝试访问以下参数进行确认。

```python
net[0].weight

# output
<UninitializedParameter>
```

接下来将数据传递给网络，使得框架最终完成参数初始化。

```python
X = torch.rand(2, 20)
net(X)

net[0].weight.shape

# output
torch.Size([256, 20])
```

一旦我们知道输入维数是20，框架可以通过代入值20来识别第一层权重矩阵的形状。识别出第一层的形状后，框架处理第二层，依此类推，直到所有形状都已知为止。注意，在这种情况下，只有第一层需要延迟初始化，但是框架仍是按顺序初始化的。等到知道了所有的参数形状，框架就可以初始化参数。

以下方法通过网络传入虚拟输入进行试运行，以推断所有参数形状，并随后初始化参数。当不需要默认的随机初始化时，将会使用这个策略。

```python
@d2l.add_to_class(d2l.Module)  #@save
def apply_init(self, inputs, init=None):
    self.forward(*inputs)
    if init is not None:
        self.net.apply(init)
```

## 小结

* 延后初始化使框架能够自动推断参数形状，使修改模型架构变得容易，避免了一些常见的错误。
* 我们可以通过模型传递数据，使框架最终初始化参数。

## 练习

1. 如果指定了第一层的输入尺寸，但没有指定后续层的尺寸，会发生什么？是否立即进行初始化？
1. 如果指定了不匹配的维度会发生什么？
1. 如果输入具有不同的维度，需要做什么？提示：查看参数绑定的相关内容。

:begin_tab:`mxnet`
[Discussions](https://discuss.d2l.ai/t/5770)
:end_tab:

:begin_tab:`pytorch`
[Discussions](https://discuss.d2l.ai/t/5770)
:end_tab:

:begin_tab:`tensorflow`
[Discussions](https://discuss.d2l.ai/t/1833)
:end_tab:

:begin_tab:`paddle`
[Discussions](https://discuss.d2l.ai/t/11779)
:end_tab:
