---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/1_3_3_neural_networks_tutorial/
title: 1.3.3 Neural Networks - PyTorch Tutorial
date: 2023-04-04 12:13:48
tag: 
summary: 使用 torch.nn 包来构建神经网络。
---
```
%matplotlib inline
```

使用 torch.nn 包来构建神经网络。

上一讲已经讲过了`autograd`，`nn`包依赖`autograd`包来定义模型并求导。 一个`nn.Module`包含各个层和一个`forward(input)`方法，该方法返回`output`。

例如：

![](https://pytorch.org/tutorials/_images/mnist.png)

它是一个简单的前馈神经网络，它接受一个输入，然后一层接着一层地传递，最后输出计算的结果。

## 神经网络的典型训练过程

1.  定义包含一些可学习的参数 (或者叫权重) 神经网络模型；
2.  在数据集上迭代；
3.  通过神经网络处理输入；
4.  计算损失 (输出结果和正确值的差值大小)；
5.  将梯度反向传播回网络的参数；
6.  更新网络的参数，主要使用如下简单的更新原则： `weight = weight - learning_rate * gradient`

## 搭建网络

### 定义网络

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class Net(nn.Module):

    def __init__(self):
        super(Net, self).__init__()
        # 1 input image channel, 6 output channels, 5x5 square convolution
        # kernel
        self.conv1 = nn.Conv2d(1, 6, 5)
        self.conv2 = nn.Conv2d(6, 16, 5)
        # an affine operation: y = Wx + b
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        # Max pooling over a (2, 2) window
        x = F.max_pool2d(F.relu(self.conv1(x)), (2, 2))
        # If the size is a square you can only specify a single number
        x = F.max_pool2d(F.relu(self.conv2(x)), 2)
        x = x.view(-1, self.num_flat_features(x))
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x

    def num_flat_features(self, x):
        size = x.size()[1:]  # all dimensions except the batch dimension
        num_features = 1
        for s in size:
            num_features *= s
        return num_features


net = Net()
print(net)
```

```python
Net(
  (conv1): Conv2d(1, 6, kernel_size=(5, 5), stride=(1, 1))
  (conv2): Conv2d(6, 16, kernel_size=(5, 5), stride=(1, 1))
  (fc1): Linear(in_features=400, out_features=120, bias=True)
  (fc2): Linear(in_features=120, out_features=84, bias=True)
  (fc3): Linear(in_features=84, out_features=10, bias=True)
)
```

在模型中必须要定义 `forward` 函数，`backward` 函数（用来计算梯度）会被`autograd`自动创建。 可以在 `forward` 函数中使用任何针对 Tensor 的操作。

### 返回学习参数

`net.parameters()`返回可被学习的参数（权重）列表和值

```
params = list(net.parameters())
print(len(params))
print(params[0].size())  # conv1's .weight
```

```
torch.Size([6, 1, 5, 5])
```

### 测试

随机输入 32×32。 注：这个网络（LeNet）期望的输入大小是 32×32，如果使用 MNIST 数据集来训练这个网络，请把图片大小重新调整到 32×32。

```
input = torch.randn(1, 1, 32, 32)
out = net(input)
print(out)
```

```
tensor([[-0.0204, -0.0268, -0.0829,  0.1420, -0.0192,  0.1848,  0.0723, -0.0393,
         -0.0275,  0.0867]], grad_fn=<ThAddmmBackward>)
```

### 随机梯度反向传播
将所有参数的梯度缓存清零 ，然后进行随机梯度的的反向传播：

```
net.zero_grad()
out.backward(torch.randn(1, 10))
```

> [! Note]
> `torch.nn` 只支持小批量输入。整个 `torch.nn` 包都只支持小批量样本，而不支持单个样本。 
> 例如，`nn.Conv2d` 接受一个 4 维的张量， ` 每一维分别是 sSamples * nChannels * Height * Width（样本数 * 通道数 * 高 * 宽）`。 如果你有单个样本，只需使用 `input.unsqueeze(0)` 来添加其它的维数

在继续之前，我们回顾一下到目前为止用到的类。

**回顾:**
- `torch.Tensor`：一个用过自动调用 `backward()` 实现支持自动梯度计算的 _多维数组_ ， 并且保存关于这个向量的_梯度_ w.r.t. 
- `nn.Module`：神经网络模块。封装参数、移动到 GPU 上运行、导出、加载等。
- `nn.Parameter`：一种变量，当把它赋值给一个 `Module` 时，被 _自动_ 地注册为一个参数。
- `autograd.Function`：实现一个自动求导操作的前向和反向定义，每个变量操作至少创建一个函数节点，每一个`Tensor`的操作都回创建一个接到创建`Tensor`和 _编码其历史_ 的函数的`Function`节点。

**重点如下：**
- 定义一个网络 
- 处理输入，调用 backword

**还剩：** 
- 计算损失 
- 更新网络权重

## 损失函数

一个损失函数接受一对 (output, target) 作为输入，计算一个值来估计网络的输出和目标值相差多少。

_译者注：output 为网络的输出，target 为实际值_

nn 包中有很多不同的[损失函数](https://pytorch.org/docs/nn.html#loss-functions)。 `nn.MSELoss`是一个比较简单的损失函数，它计算输出和目标间的**均方误差**， 例如：

```python
output = net(input)
target = torch.randn(10)  # 随机值作为样例
target = target.view(1, -1)  # 使target和output的shape相同
criterion = nn.MSELoss()

loss = criterion(output, target)
print(loss)
```

```
tensor(1.3172, grad_fn=<MseLossBackward>)
```

Now, if you follow `loss` in the backward direction, using its `.grad_fn` attribute, you will see a graph of computations that looks like this:

::

```
input -> conv2d -> relu -> maxpool2d -> conv2d -> relu -> maxpool2d
      -> view -> linear -> relu -> linear -> relu -> linear
      -> MSELoss
      -> loss
```

So, when we call `loss.backward()`, the whole graph is differentiated w.r.t. the loss, and all Tensors in the graph that has `requires_grad=True` will have their `.grad` Tensor accumulated with the gradient.

For illustration, let us follow a few steps backward:

```
print(loss.grad_fn)  # MSELoss
print(loss.grad_fn.next_functions[0][0])  # Linear
print(loss.grad_fn.next_functions[0][0].next_functions[0][0])  # ReLU
```

## 反向传播[](#_3 "Permanent link")

调用 loss.backward() 获得反向传播的误差。

但是在调用前需要清除已存在的梯度，否则梯度将被累加到已存在的梯度。

现在，我们将调用 loss.backward()，并查看 conv1 层的偏差（bias）项在反向传播前后的梯度。

```
net.zero_grad()     # 清除梯度

print('conv1.bias.grad before backward')
print(net.conv1.bias.grad)

loss.backward()

print('conv1.bias.grad after backward')
print(net.conv1.bias.grad)
```

```
conv1.bias.grad before backward
tensor([0., 0., 0., 0., 0., 0.])
conv1.bias.grad after backward
tensor([ 0.0074, -0.0249, -0.0107,  0.0326, -0.0017, -0.0059])
```

如何使用损失函数

**稍后阅读：**

`nn`包，包含了各种用来构成深度神经网络构建块的模块和损失函数，完整的文档请查看 [here](https://pytorch.org/docs/nn)。

**剩下的最后一件事:**

*   新网络的权重

## 更新权重[](#_4 "Permanent link")

在实践中最简单的权重更新规则是随机梯度下降（SGD）：

```
``weight = weight - learning_rate * gradient``
```

我们可以使用简单的 Python 代码实现这个规则：

```
learning_rate = 0.01
    for f in net.parameters():
        f.data.sub_(f.grad.data * learning_rate)
```

但是当使用神经网络是想要使用各种不同的更新规则时，比如 SGD、Nesterov-SGD、Adam、RMSPROP 等，PyTorch 中构建了一个包`torch.optim`实现了所有的这些规则。 使用它们非常简单：

```
import torch.optim as optim

# create your optimizer
optimizer = optim.SGD(net.parameters(), lr=0.01)

# in your training loop:
optimizer.zero_grad()   # zero the gradient buffers
output = net(input)
loss = criterion(output, target)
loss.backward()
optimizer.step()    # Does the update
```

.. Note::

```
Observe how gradient buffers had to be manually set to zero using
  ``optimizer.zero_grad()``. This is because gradients are accumulated
  as explained in `Backprop`_ section.
```