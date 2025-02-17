---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter02_basics/2_1_3_pytorch-basics-nerual-network/
title: 2.1.3 Nerual Network - PyTorch Tutorial
date: 2023-04-06 16:35:28
tags:
---
torch.nn 是专门为神经网络设计的模块化接口。nn 构建于 Autograd 之上，可用来定义和运行神经网络。 这里我们主要介绍几个一些常用的类

**约定：torch.nn 我们为了方便使用，会为他设置别名为 nn, 本章除 nn 以外还有其他的命名约定**

```
# 首先要引入相关的包
import torch
# 引入torch.nn并指定别名
import torch.nn as nn
#打印一下版本
torch.__version__
```

```
'2.0.0'
```

除了 nn 别名以外，我们还引用了 nn.functional，这个包中包含了神经网络中使用的一些常用函数，这些函数的特点是，不具有可学习的参数 (如 ReLU，pool，DropOut 等)，这些函数可以放在构造函数中，也可以不放，但是这里建议不放。

一般情况下我们会**将 nn.functional 设置为大写的 F**，这样缩写方便调用

```
import torch.nn.functional as F
```

## 定义一个网络

PyTorch 中已经为我们准备好了现成的网络模型，只要继承 nn.Module，并实现它的 forward 方法，PyTorch 会根据 autograd，自动实现 backward 函数，在 forward 函数中可使用任何 tensor 支持的函数，还可以使用 if、for 循环、print、log 等 Python 语法，写法和标准的 Python 写法一致。

```
class Net(nn.Module):
    def __init__(self):
        # nn.Module子类的函数必须在构造函数中执行父类的构造函数
        super(Net, self).__init__()

        # 卷积层 '1'表示输入图片为单通道, '6'表示输出通道数，'3'表示卷积核为3*3
        self.conv1 = nn.Conv2d(1, 6, 3) 
        #线性层，输入1350个特征，输出10个特征
        self.fc1   = nn.Linear(1350, 10)  #这里的1350是如何计算的呢？这就要看后面的forward函数
    #正向传播 
    def forward(self, x): 
        print(x.size()) # 结果：[1, 1, 32, 32]
        # 卷积 -> 激活 -> 池化 
        x = self.conv1(x) #根据卷积的尺寸计算公式，计算结果是30，具体计算公式后面第二章第四节 卷积神经网络 有详细介绍。
        x = F.relu(x)
        print(x.size()) # 结果：[1, 6, 30, 30]
        x = F.max_pool2d(x, (2, 2)) #我们使用池化层，计算结果是15
        x = F.relu(x)
        print(x.size()) # 结果：[1, 6, 15, 15]
        # reshape，‘-1’表示自适应
        #这里做的就是压扁的操作 就是把后面的[1, 6, 15, 15]压扁，变为 [1, 1350]
        x = x.view(x.size()[0], -1) 
        print(x.size()) # 这里就是fc1层的的输入1350 
        x = self.fc1(x)        
        return x

net = Net()
print(net)
```

```
Net(
  (conv1): Conv2d(1, 6, kernel_size=(3, 3), stride=(1, 1))
  (fc1): Linear(in_features=1350, out_features=10, bias=True)
)
```

网络的可学习参数通过 `net.parameters()` 返回

```
for parameters in net.parameters():
    print(parameters)
```

```
Parameter containing:
tensor([[[[ 0.2745,  0.2594,  0.0171],
          [ 0.0429,  0.3013, -0.0208],
          [ 0.1459, -0.3223,  0.1797]]],


        [[[ 0.1847,  0.0227, -0.1919],
          [-0.0210, -0.1336, -0.2176],
          [-0.2164, -0.1244, -0.2428]]],


        [[[ 0.1042, -0.0055, -0.2171],
          [ 0.3306, -0.2808,  0.2058],
          [ 0.2492,  0.2971,  0.2277]]],


        [[[ 0.2134, -0.0644, -0.3044],
          [ 0.0040,  0.0828, -0.2093],
          [ 0.0204,  0.1065,  0.1168]]],


        [[[ 0.1651, -0.2244,  0.3072],
          [-0.2301,  0.2443, -0.2340],
          [ 0.0685,  0.1026,  0.1754]]],


        [[[ 0.1691, -0.0790,  0.2617],
          [ 0.1956,  0.1477,  0.0877],
          [ 0.0538, -0.3091,  0.2030]]]], requires_grad=True)
Parameter containing:
tensor([ 0.2355,  0.2949, -0.1283, -0.0848,  0.2027, -0.3331],
       requires_grad=True)
Parameter containing:
tensor([[ 2.0555e-02, -2.1445e-02, -1.7981e-02,  ..., -2.3864e-02,
          8.5149e-03, -6.2071e-04],
        [-1.1755e-02,  1.0010e-02,  2.1978e-02,  ...,  1.8433e-02,
          7.1362e-03, -4.0951e-03],
        [ 1.6187e-02,  2.1623e-02,  1.1840e-02,  ...,  5.7059e-03,
         -2.7165e-02,  1.3463e-03],
        ...,
        [-3.2552e-03,  1.7277e-02, -1.4907e-02,  ...,  7.4232e-03,
         -2.7188e-02, -4.6431e-03],
        [-1.9786e-02, -3.7382e-03,  1.2259e-02,  ...,  3.2471e-03,
         -1.2375e-02, -1.6372e-02],
        [-8.2350e-03,  4.1301e-03, -1.9192e-03,  ..., -2.3119e-05,
          2.0167e-03,  1.9528e-02]], requires_grad=True)
Parameter containing:
tensor([ 0.0162, -0.0146, -0.0218,  0.0212, -0.0119, -0.0142, -0.0079,  0.0171,
         0.0205,  0.0164], requires_grad=True)
```

net.named_parameters 可同时返回可学习的参数及名称。

```
for name,parameters in net.named_parameters():
    print(name,':',parameters.size())
```

```
conv1.weight : torch.Size([6, 1, 3, 3])
conv1.bias : torch.Size([6])
fc1.weight : torch.Size([10, 1350])
fc1.bias : torch.Size([10])
```

forward 函数的输入和输出都是 Tensor

```
input = torch.randn(1, 1, 32, 32) # 这里的对应前面forward的输入是32
out = net(input)
out.size()
```

```
torch.Size([1, 1, 32, 32])
torch.Size([1, 6, 30, 30])
torch.Size([1, 6, 15, 15])
torch.Size([1, 1350])

torch.Size([1, 10])
```

```
input.size()
```

```
torch.Size([1, 1, 32, 32])
```

在反向传播前，先要将所有参数的梯度清零

```
net.zero_grad() 
out.backward(torch.ones(1,10)) # 反向传播是PyTorch自动实现的，我们只要调用这个函数即可
```

**注意**:torch.nn 只支持 mini-batches，不支持一次只输入一个样本，即一次必须是一个 batch。

也就是说，就算我们输入一个样本，也会对样本进行分批，所以，所有的输入都会增加一个维度，我们对比下刚才的 input，nn 中定义为 3 维，但是我们人工创建时多增加了一个维度，变为了 4 维，最前面的 1 即为 batch-size

## 损失函数

在 nn 中 PyTorch 还预制了常用的损失函数，下面我们用 MSELoss 用来计算均方误差

```
y = torch.arange(0,10).view(1,10).float()
criterion = nn.MSELoss()
loss = criterion(out, y)
#loss是个scalar，我们可以直接用item获取到他的python类型的数值
print(loss.item())
```

```
28.92203712463379
```

## 优化器

在反向传播计算完所有参数的梯度后，还需要使用优化方法来更新网络的权重和参数，例如随机梯度下降法 (SGD) 的更新策略如下：

weight = weight - learning_rate * gradient

在 torch.optim 中实现大多数的优化方法，例如 RMSProp、Adam、SGD 等，下面我们使用 SGD 做个简单的样例

```
import torch.optim
```

```
out = net(input) # 这里调用的时候会打印出我们在forword函数中打印的x的大小
criterion = nn.MSELoss()
loss = criterion(out, y)
#新建一个优化器，SGD只需要要调整的参数和学习率
optimizer = torch.optim.SGD(net.parameters(), lr = 0.01)
# 先梯度清零(与net.zero_grad()效果一样)
optimizer.zero_grad() 
loss.backward()

#更新参数
optimizer.step()
```

```
torch.Size([1, 1, 32, 32])
torch.Size([1, 6, 30, 30])
torch.Size([1, 6, 15, 15])
torch.Size([1, 1350])
```

这样，神经网络的数据的一个完整的传播就已经通过 PyTorch 实现了，下面一章将介绍 PyTorch 提供的数据加载和处理工具，使用这些工具可以方便的处理所需要的数据。

看完这节，大家可能对神经网络模型里面的一些参数的计算方式还有疑惑，这部分会在第二章第四节 卷积神经网络 有详细介绍，并且在第三章 第二节 MNIST 数据集手写数字识别 的实践代码中有详细的注释说明。