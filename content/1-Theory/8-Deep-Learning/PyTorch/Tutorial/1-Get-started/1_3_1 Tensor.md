---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/1_3_1_tensor_tutorial/
title: 1.3.1 Tensor - PyTorch Tutorial
date: 2023-04-03 14:38:01
tag: 
summary: 
---

PyTorch 是什么？基于 Python 的科学计算包，服务于以下两种场景:
*   作为 NumPy 的替代品，可以使用 GPU 的强大计算能力
*   提供最大的灵活性和高速的深度学习研究平台

## 开始

### Tensors（张量）

Tensors 与 Numpy 中的 ndarrays 类似，但是在 PyTorch 中 Tensors 可以使用 GPU 进行计算.

#### 1. 导入模块
```
from __future__ import print_function
import torch
```

#### 2. 创建矩阵

未初始化的矩阵：empty()

```
x = torch.empty(5, 3)
print(x)
```

```
tensor([[0.0000, 0.0000, 0.0000],
        [0.0000, 0.0000, 0.0000],
        [0.0000, 0.0000, 0.0000],
        [0.0000, 0.0000, 0.0000],
        [0.0000, 0.0000, 0.0000]])
```

随机初始化的矩阵：rand()

```
x = torch.rand(5, 3)
print(x)
```

```
tensor([[0.6972, 0.0231, 0.3087],
        [0.2083, 0.6141, 0.6896],
        [0.7228, 0.9715, 0.5304],
        [0.7727, 0.1621, 0.9777],
        [0.6526, 0.6170, 0.2605]])
```

用 0 填充的矩阵，数据类型为 long：

```
x = torch.zeros(5, 3, dtype=torch.long)
print(x)
```

```
tensor([[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]])
```

#### 3. 创建 tensor 

使用现有数据初始化：

```
x = torch.tensor([5.5, 3])
print(x)
```

```
tensor([5.5000, 3.0000])
```

根据现有的张量创建张量。 
这些方法将重用输入张量的属性，例如， dtype，除非设置新的值进行覆盖：

```
x = x.new_ones(5, 3, dtype=torch.double)      # new_* 方法来创建对象
print(x)

tensor([[1., 1., 1.],
        [1., 1., 1.],
        [1., 1., 1.],
        [1., 1., 1.],
        [1., 1., 1.]], dtype=torch.float64)

                                    #  对象的size 是相同的，只是值和类型发生了变化
```

```
x = torch.randn_like(x, dtype=torch.float)    # 覆盖 dtype!
print(x)  

tensor([[ 0.5691, -2.0126, -0.4064],
        [-0.0863,  0.4692, -1.1209],
        [-1.1177, -0.5764, -0.5363],
        [-0.4390,  0.6688,  0.0889],
        [ 1.3334, -1.1600,  1.8457]])
```

#### 4. 获取 size

_译者注：使用 size 方法与 Numpy 的 shape 属性返回的相同，张量也支持 shape 属性，后面会详细介绍_

```
print(x.size())
```

```
torch.Size([5, 3])
```

> [! note] torch. size 的返回值类型
> `torch.Size` 返回值是 tuple 类型, 所以它支持 tuple 类型的所有操作。

### Operations（操作）

#### 1. 加法

语法 1：`X` + `Y` 

```
y = torch.rand(5, 3)
print(x + y)
```

```
tensor([[ 0.7808, -1.4388,  0.3151],
        [-0.0076,  1.0716, -0.8465],
        [-0.8175,  0.3625, -0.2005],
        [ 0.2435,  0.8512,  0.7142],
        [ 1.4737, -0.8545,  2.4833]])
```

语法 2：`add(x,y)`

```
print(torch.add(x, y))
```

```
tensor([[ 0.7808, -1.4388,  0.3151],
        [-0.0076,  1.0716, -0.8465],
        [-0.8175,  0.3625, -0.2005],
        [ 0.2435,  0.8512,  0.7142],
        [ 1.4737, -0.8545,  2.4833]])
```

提供输出 tensor 作为参数：`out=result`

```
result = torch.empty(5, 3)
torch.add(x, y, out=result)
print(result)
```

```
tensor([[ 0.7808, -1.4388,  0.3151],
        [-0.0076,  1.0716, -0.8465],
        [-0.8175,  0.3625, -0.2005],
        [ 0.2435,  0.8512,  0.7142],
        [ 1.4737, -0.8545,  2.4833]])
```

原地相加：`y.add_(x)` 

```
# adds x to y
y.add_(x)
print(y)
```

```
tensor([[ 0.7808, -1.4388,  0.3151],
        [-0.0076,  1.0716, -0.8465],
        [-0.8175,  0.3625, -0.2005],
        [ 0.2435,  0.8512,  0.7142],
        [ 1.4737, -0.8545,  2.4833]])
```

>[! note] 其他原地操作
> 任何 以 `_` 结尾的操作都会用结果替换原变量. 例如: `x.copy_(y)`, `x.t_()`, 都会改变 `x`。


#### 2. 索引操作

可以使用与 NumPy 索引方式相同的操作来进行对张量的操作

```
print(x[:, 1])
```

```
tensor([-2.0126,  0.4692, -0.5764,  0.6688, -1.1600])
```

#### 3. 改变大小

可以用 `torch.view` 改变张量的维度和大小

_译者注：torch.view 与 Numpy 的 reshape 类似_

```python
x = torch.randn(4, 4)
y = x.view(16)
z = x.view(-1, 8)  #  size -1 从其他维度推断
print(x.size(), y.size(), z.size())
```

```python
torch.Size([4, 4]) torch.Size([16]) torch.Size([2, 8])
```

#### 4. 获取单元素张量的数值

对于只有一个元素的张量，使用 `.item()` 来得到其数值

```
x = torch.randn(1)
print(x)
print(x.item())
```

```
tensor([-0.2368])
-0.23680149018764496
```

> [! tip] Other Tensor Operations
> 100+ Tensor operations, including transposing, indexing, slicing, mathematical operations, linear algebra, random numbers, etc., are described here: 
> [https://pytorch.org/docs/torch](https://pytorch.org/docs/torch)

## NumPy 转换

> Converting a Torch Tensor to a NumPy array and vice versa is a breeze.
> 将 Torch Tensor 和 NumPy 数组相互转化

> The Torch Tensor and NumPy array will share their underlying memory locations, and changing one will change the other.
> Torch Tensor 和 NumPy 数组共享内存位置，改变其中一个会相应改变另一者

### Torch Tensor 转成 NumPy Array

```
a = torch.ones(5)
print(a)
```

```
tensor([1., 1., 1., 1., 1.])
```

```
b = a.numpy()
print(b)
```

```
[1. 1. 1. 1. 1.]
```

See how the numpy array changed in value.

```
a.add_(1)
print(a)
print(b)
```

```
tensor([2., 2., 2., 2., 2.])
[2. 2. 2. 2. 2.]
```

### NumPy Array 转成 Torch Tensor

使用 from_numpy 自动转化

```
import numpy as np
a = np.ones(5)
b = torch.from_numpy(a)
np.add(a, 1, out=a)
print(a)
print(b)
```

```
[2. 2. 2. 2. 2.]
tensor([2., 2., 2., 2., 2.], dtype=torch.float64)
```

所有的 Tensor 类型默认都是基于 CPU， CharTensor 类型不支持到 NumPy 的转换.

## CUDA 张量

使用`.to` 方法 可以将 Tensor 移动到任何设备中

```
# is_available 函数判断是否有cuda可以使用
# torch.device 将张量移动到指定的设备中
if torch.cuda.is_available():
    device = torch.device("cuda")          # 创建 CUDA 设备对象
    y = torch.ones_like(x, device=device)  # 直接从GPU创建张量
    x = x.to(device)                       # 或者直接使用.to("cuda")将张量移动到cuda中
    z = x + y
    print(z)
    print(z.to("cpu", torch.double))       # .to 也会对变量的类型做更改
```

```
tensor([0.7632], device='cuda:0')
tensor([0.7632], dtype=torch.float64)
```