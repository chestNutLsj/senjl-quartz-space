---
publish: "true"
tags:
  - D2L
  - Deep_Learning
  - PyTorch
date: 2024-02-18
---
# GPU

在 [[40-introduction#深度学习的发展|计算能力随时间进步的表格]] 中，我们回顾了过去20年计算能力的快速增长。简而言之，自2000年以来，GPU 性能每十年增长1000倍。

本节，我们将讨论如何利用这种计算性能进行研究。首先是如何使用单个 GPU，然后是如何使用多个 GPU 和多个服务器（具有多个 GPU）。

我们先看看如何使用单个 NVIDIA GPU 进行计算。首先，确保至少安装了一个 NVIDIA GPU。然后，下载 [NVIDIA驱动和CUDA](https://developer.nvidia.com/cuda-downloads) 并按照提示设置适当的路径。当这些准备工作完成，就可以使用 `nvidia-smi` 命令来查看显卡信息。

```python
!nvidia-smi

# 输出与个人电脑配置有关
```

```output
Sat Feb 17 14:13:53 2024       
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 545.29.06              Driver Version: 545.29.06    CUDA Version: 12.3     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA GeForce GTX 1660 Ti     Off | 00000000:01:00.0 Off |                  N/A |
| N/A   44C    P8               6W /  80W |      5MiB /  6144MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
                                                                                         
+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|    0   N/A  N/A       619      G   /usr/lib/Xorg                                 4MiB |
+---------------------------------------------------------------------------------------+

```

在 PyTorch 中，每个数组都有一个设备（device），我们通常将其称为环境（context）。默认情况下，所有变量和相关的计算都分配给 CPU。有时环境可能是 GPU。当我们跨多个服务器部署作业时，事情会变得更加棘手。通过智能地将数组分配给环境，我们可以最大限度地减少在设备之间传输数据的时间。例如，当在带有 GPU 的服务器上训练神经网络时，我们通常希望模型的参数在 GPU 上。

要运行此部分中的程序，至少需要两个GPU。注意，对大多数桌面计算机来说，这可能是奢侈的，但在云中很容易获得。例如可以使用AWS EC2的多GPU实例。本书的其他章节大都不需要多个GPU，而本节只是为了展示数据如何在不同的设备之间传递。

## 计算设备

我们可以指定用于存储和计算的设备，如CPU和GPU。默认情况下，张量是在内存中创建的，然后使用CPU计算它。

在 PyTorch 中，CPU 和 GPU 可以用 `torch.device('cpu')` 和 `torch.device('cuda')` 表示。应该注意的是，`cpu` 设备意味着所有物理 CPU 和内存，这意味着 PyTorch 的计算将尝试使用所有 CPU 核心。然而，`gpu` 设备只代表一个卡和相应的显存。如果有多个 GPU，我们使用 `torch.device(f'cuda:{i}')` 来表示第 $i$ 块 GPU（$i$ 从0开始）。另外，`cuda:0` 和 `cuda` 是等价的。

```python
import torch
from torch import nn

torch.device('cpu'), torch.device('cuda'), torch.device('cuda:1')
```

我们可以查询可用gpu的数量。

```python
torch.cuda.device_count()
```

现在我们定义了两个方便的函数，这两个函数允许我们在不存在所需所有GPU的情况下运行代码。

```python
def try_gpu(i=0):  #@save
    """如果存在，则返回gpu(i)，否则返回cpu()"""
    if torch.cuda.device_count() >= i + 1:
        return torch.device(f'cuda:{i}')
    return torch.device('cpu')

def try_all_gpus():  #@save
    """返回所有可用的GPU，如果没有GPU，则返回[cpu(),]"""
    devices = [torch.device(f'cuda:{i}')
             for i in range(torch.cuda.device_count())]
    return devices if devices else [torch.device('cpu')]

try_gpu(), try_gpu(10), try_all_gpus()
```

## 张量与GPU

我们可以查询张量所在的设备。默认情况下，张量是在CPU上创建的。

```python
x = torch.tensor([1, 2, 3])
x.device
```

需要注意的是，无论何时我们要对多个项进行操作，它们都**必须在同一个设备上**。例如，如果我们对两个张量求和，我们需要确保两个张量都位于同一个设备上，否则框架将不知道在哪里存储结果，甚至不知道在哪里执行计算。

### 存储在GPU上

有几种方法可以在 GPU 上存储张量。例如，我们**可以在创建张量时指定存储设备**。接下来，我们在第一个 `gpu` 上创建张量变量 `X`。在 GPU 上创建的张量只消耗这个 GPU 的显存。我们可以使用 `nvidia-smi` 命令查看显存使用情况。一般来说，我们需要确保不创建超过 GPU 显存限制的数据。

```python
X = torch.ones(2, 3, device=try_gpu())
X
```

假设我们至少有两个GPU，下面的代码将在第二个GPU上创建一个随机张量。

```python
Y = torch.rand(2, 3, device=try_gpu(1))
Y
```

### 复制

如果我们要计算 `X + Y`，我们需要决定在哪里执行这个操作。例如，
- 我们可以将 `X` 复制到第二个 GPU 并在那里执行操作： ![[copyto.svg]]
- ***不要***简单地 `X` 加上 `Y`，因为这会导致异常——运行时引擎不知道该怎么做，它在同一设备上找不到数据会导致失败，由于`Y`位于第二个GPU上，所以我们需要将`X`移到那里，然后才能执行相加运算。

```python
Z = X.cuda(1)
print(X)
print(Z)
```

现在数据在同一个 GPU 上（`Z` 和 `Y` 都在），我们可以将它们相加。

```python
Y + Z
```

假设变量 `Z` 已经存在于第二个 GPU 上。如果我们还是调用 `Z.cuda(1)` 会发生什么？它将返回 `Z`，而不会复制并分配新内存。

```python
Z.cuda(1) is Z
```

### 旁注

人们使用 GPU 来进行机器学习，因为单个 GPU 相对运行速度快。但是在设备（CPU、GPU 和其他机器）之间传输数据比计算慢得多。这也使得并行化变得更加困难，因为我们必须等待数据被发送（或者接收），然后才能继续进行更多的操作。这就是为什么拷贝操作要格外小心。根据经验，多个小操作比一个大操作糟糕得多。此外，一次执行几个操作比代码中散布的许多单个操作要好得多。如果一个设备必须等待另一个设备才能执行其他操作，那么这样的操作可能会阻塞。这有点像排队订购咖啡，而不像通过电话预先订购：当客人到店的时候，咖啡已经准备好了。

最后，当我们打印张量或将张量转换为 NumPy 格式时，如果数据不在内存中，框架会首先将其复制到内存中，这会导致额外的传输开销。更糟糕的是，它现在受制于全局解释器锁，使得一切都得等待 Python 完成。

## 神经网络与GPU

类似地，神经网络模型可以指定设备。下面的代码将模型参数放在GPU上。

```python
net = nn.Sequential(nn.Linear(3, 1))
net = net.to(device=try_gpu())
```

在接下来的几章中，我们将看到更多关于如何在GPU上运行模型的例子，因为它们将变得更加计算密集。

当输入为GPU上的张量时，模型将在同一GPU上计算结果。

```python
net(X)
```

让我们确认模型参数存储在同一个GPU上。

```python
net[0].weight.data.device
```

总之，只要所有的数据和参数都在同一个设备上，我们就可以有效地学习模型。在下面的章节中，我们将看到几个这样的例子。

## 小结

* 我们可以指定用于存储和计算的设备，例如CPU或GPU。默认情况下，数据在主内存中创建，然后使用CPU进行计算。
* 深度学习框架要求计算的所有输入数据都在同一设备上，无论是CPU还是GPU。
* 不经意地移动数据可能会显著降低性能。一个典型的错误如下：计算GPU上每个小批量的损失，并在命令行中将其报告给用户（或将其记录在NumPy `ndarray`中）时，将触发全局解释器锁，从而使所有GPU阻塞。最好是为GPU内部的日志分配内存，并且只移动较大的日志。

## 练习

### CPU Vs. GPU

1. 尝试一个计算量更大的任务，比如大矩阵的乘法，看看CPU和GPU之间的速度差异。再试一个计算量很小的任务呢？

100个500x500矩阵的矩阵乘法所需的时间，并记录输出矩阵的Frobenius范数的时间对比：
```python
import time
import torch

def try_gpu(i=0):  #@save
    """如果存在，则返回 gpu(i)，否则返回 cpu()"""
    if torch.cuda.device_count() >= i + 1:
        return torch.device(f'cuda:{i}')
    return torch.device('cpu')

startTime1=time.time()
for i in range(100):
    A = torch.ones(500,500)
    B = torch.ones(500,500)
    C = torch.matmul(A,B)
endTime1=time.time()

startTime2=time.time()
for i in range(100):
    A = torch.ones(500,500,device=try_gpu())
    B = torch.ones(500,500,device=try_gpu())
    C = torch.matmul(A,B)
endTime2=time.time()

print('cpu 计算总时长: ', round((endTime1 - startTime1)*1000, 2),'ms')
print('gpu 计算总时长: ', round((endTime2 - startTime2)*1000, 2),'ms')
```

运行结果非常有趣，值得思考：

在 vscode 的 python 文件中直接运行，第一次的结果是

```
cpu 计算总时长:  86.31 ms
gpu 计算总时长:  155.42 ms
```

而在 jupyter 中测试得到的结果是：

```
cpu 计算总时长:  92.91 ms
gpu 计算总时长:  146.79 ms
```

不过尝试再次运行，结果变成了：

```
cpu 计算总时长:  95.03 ms
gpu 计算总时长:  4.95 ms
```

于是猜测可能是初时没有调动起显卡，它热身的耗时导致的，于是又去 python 文件中测试，第二次运行结果：

```
cpu 计算总时长:  77.73 ms
gpu 计算总时长:  123.66 ms
```

似乎没有什么变化，不过注意到当关闭了 jupyter 后，风扇声立马变小，因此猜测可能是 jupyter 中一旦调用了 pytorch 库，就会一直保持运行，因此显卡不必花费时间在热身上，于是我查看了此时显卡的运行情况：

```
Sat Feb 17 14:49:44 2024       
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 545.29.06              Driver Version: 545.29.06    CUDA Version: 12.3     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA GeForce GTX 1660 Ti     Off | 00000000:01:00.0 Off |                  N/A |
| N/A   41C    P8               5W /  80W |    122MiB /  6144MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
                                                                                         
+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|    0   N/A  N/A       619      G   /usr/lib/Xorg                                 4MiB |
|    0   N/A  N/A    118995      C   ...enjl/miniforge3/envs/d2l/bin/python      114MiB |
+---------------------------------------------------------------------------------------+

```

最后一行果然如此，jupyter 占用了 110MB 的显存。不过为什么 python 文件中直接运行，gpu 的效果不好，我猜测可能每一次调用 python 文件执行，都是一次全新的过程，都要重新向 gpu 申请显存等一些列操作，所以耗时较多。

### Save and Load Params on GPU

2. 我们应该如何在 GPU 上读写模型参数？
3. 测量计算1000个 $100 \times 100$ 矩阵的矩阵乘法所需的时间，并记录输出矩阵的 Frobenius 范数，一次记录一个结果，而不是在 GPU 上保存日志并仅传输最终结果。
4. 测量同时在两个GPU上执行两个矩阵乘法与在一个GPU上按顺序执行两个矩阵乘法所需的时间。提示：应该看到近乎线性的缩放。

[Discussions](https://discuss.d2l.ai/t/1841)
