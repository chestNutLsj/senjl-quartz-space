---
publish: "true"
tags:
  - D2L
  - Deep_Learning
  - PyTorch
date: 2024-02-16
---
# 多层感知机的简洁实现

本节将介绍通过高级API更简洁地实现多层感知机。

```python
from d2l import torch as d2l
import torch
from torch import nn
```

## 模型

与 softmax 回归的简洁实现（ [[70-softmax-regression-concise-implementation|2.7 节]] ）相比，唯一的区别是我们添加了2个全连接层（之前我们只添加了1个全连接层）。第一层是隐藏层，它包含256个隐藏单元，并使用了ReLU激活函数。第二层是输出层。

```python
net = nn.Sequential(nn.Flatten(),
                    nn.Linear(784, 256),
                    nn.ReLU(),
                    nn.Linear(256, 10))

def init_weights(m):
    if type(m) == nn.Linear:
        nn.init.normal_(m.weight, std=0.01)

net.apply(init_weights);
```

训练过程的实现与我们实现softmax回归时完全相同，这种模块化设计使我们能够将与模型架构有关的内容独立出来。

```python
batch_size, lr, num_epochs = 256, 0.1, 10
loss = nn.CrossEntropyLoss(reduction='none')
trainer = torch.optim.SGD(net.parameters(), lr=lr)

train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)
d2l.train_ch3(net, train_iter, test_iter, loss, num_epochs, trainer)
```

![[30-mlp-concise-implementation-train.png]]

## 小结

* 我们可以使用高级API更简洁地实现多层感知机。
* 对于相同的分类问题，多层感知机的实现与softmax回归的实现相同，只是多层感知机的实现里增加了带有激活函数的隐藏层。

## 练习

1. 尝试添加不同数量的隐藏层（也可以修改学习率），怎么样设置效果最好？
2. 尝试不同的激活函数，哪个效果最好？
3. 尝试不同的方案来初始化权重，什么方法效果最好？

[Discussions](https://discuss.d2l.ai/t/1802)
