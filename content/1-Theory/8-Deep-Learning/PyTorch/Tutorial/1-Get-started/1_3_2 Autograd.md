---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/1_3_2_autograd_tutorial/
title: 1.3.2 Autograd - PyTorch Tutorial
date: 2023-04-04 11:16:17
tag: 
summary: PyTorch 中所有神经网络的核心是 autograd 包。我们先简单介绍一下这个包，然后训练第一个简单的神经网络。
---
```
%matplotlib inline
```

PyTorch 中所有神经网络的核心是 `autograd` 包。 我们先简单介绍一下这个包，然后训练第一个简单的神经网络。

`autograd`包为张量上的所有操作提供了自动求导。 它是一个在运行时定义的框架，这意味着反向传播是根据你的代码来确定如何运行，并且每次迭代可以是不同的。

## 张量（Tensor）

`torch.Tensor`是这个包的核心类。如果设置 `.requires_grad` 为 `True`，那么将会追踪所有对于该张量的操作。 当完成计算后通过调用 `.backward()`，自动计算所有的梯度， 这个张量的所有梯度将会自动积累到 `.grad` 属性。

要阻止张量跟踪历史记录，可以调用`.detach()`方法将其与计算历史记录分离，并禁止跟踪它将来的计算记录。

为了防止跟踪历史记录（和使用内存），可以将代码块包装在`with torch.no_grad()：`中。 在评估模型时特别有用，因为模型可能具有`requires_grad = True`的可训练参数，但是我们不需要梯度计算。

在自动梯度计算中还有另外一个重要的类`Function`.

> `Tensor` and `Function` are interconnected and build up an acyclic graph, that encodes a complete history of computation. Each tensor has a `.grad_fn` attribute that references a `Function` that has created the `Tensor` (except for Tensors created by the user - their `grad_fn is None`).
> 
> `Tensor` 和 `Function`互相连接并生成一个非循环图，它表示和存储了完整的计算历史。 每个张量都有一个`.grad_fn`属性，这个属性引用了一个创建了`Tensor`的`Function`（除非这个张量是用户手动创建的，即，这个张量的 `grad_fn` 是 `None`）。

如果需要计算导数，你可以在`Tensor`上调用`.backward()`。 如果`Tensor`是一个标量（即它包含一个元素数据）则不需要为`backward()`指定任何参数， 但是如果它有更多的元素，你需要指定一个`gradient` 参数来匹配张量的形状。

> [! warning] 不要再包裹 Variable 中
>在其他的文章中你可能会看到说将 Tensor 包裹到 Variable 中提供自动梯度计算，Variable 这个在 0.41 版中已经被标注为过期了，现在可以直接使用 Tensor，官方文档在这里：
> [Automatic differentiation package - torch.autograd — PyTorch 2.0 documentation](https://pytorch.org/docs/stable/autograd.html#variable-deprecated)

### 例子

```
import torch
```

创建一个张量并设置 requires_grad=True 用来追踪他的计算历史

```
x = torch.ones(2, 2, requires_grad=True)
print(x)
```

```
tensor([[1., 1.],
        [1., 1.]], requires_grad=True)
```

对张量进行操作:

```
y = x + 2
print(y)
```

```
tensor([[3., 3.],
        [3., 3.]], grad_fn=<AddBackward>)
```

结果`y`已经被计算出来了，所以，`grad_fn`已经被自动生成了。

```
print(y.grad_fn)
```

```
<AddBackward object at 0x00000232535FD860>
```

对 y 进行一个操作

```
z = y * y * 3
out = z.mean()

print(z, out)
```

```
tensor([[27., 27.],
        [27., 27.]], grad_fn=<MulBackward>) tensor(27., grad_fn=<MeanBackward1>)
```

`.requires_grad_( ... )` 可以改变现有张量的 `requires_grad`属性。 如果没有指定的话，默认输入的 flag 是 `False`。

```
a = torch.randn(2, 2)
a = ((a * 3) / (a - 1))
print(a.requires_grad)
a.requires_grad_(True)
print(a.requires_grad)
b = (a * a).sum()
print(b.grad_fn)
```

```
False
True
<SumBackward0 object at 0x000002325360B438>
```

## 梯度

反向传播 

因为 `out`是一个纯量（scalar），`out.backward()` 等于`out.backward(torch.tensor(1))`。

```
out.backward()
```

print gradients d(out)/dx

```
print(x.grad)
```

```
tensor([[4.5000, 4.5000],
        [4.5000, 4.5000]])
```

得到矩阵后，调用 `out` _Tensor_ “$o$”.

得到 $o = \frac{1}{4}\sum_i z_i$, $z_i = 3(x_i+2)^2$ and $z_i\bigr\rvert_{x_i=1} = 27$.

因此，$\frac{\partial o}{\partial x_i} = \frac{3}{2}(x_i+2)$, 

因此，$\frac{\partial o}{\partial x_i}\bigr\rvert_{x_i=1} = \frac{9}{2} = 4.5$.

可以使用 autograd 做更多的操作

```
x = torch.randn(3, requires_grad=True)

y = x * 2
while y.data.norm() < 1000:
    y = y * 2

print(y)
```

```
tensor([-920.6895, -115.7301, -867.6995], grad_fn=<MulBackward>)
```

```
gradients = torch.tensor([0.1, 1.0, 0.0001], dtype=torch.float)
y.backward(gradients)

print(x.grad)
```

```
tensor([ 51.2000, 512.0000,   0.0512])
```

如果`.requires_grad=True`但是你又不希望进行 autograd 的计算， 那么可以将变量包裹在 `with torch.no_grad()`中:

```
print(x.requires_grad)
print((x ** 2).requires_grad)

with torch.no_grad():
    print((x ** 2).requires_grad)
```

```
True
True
False
```

> [! tip] **稍后阅读:**
> `autograd` 和 `Function` 的官方文档 https://pytorch.org/docs/autograd