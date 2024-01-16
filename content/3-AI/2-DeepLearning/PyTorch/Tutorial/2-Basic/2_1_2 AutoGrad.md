---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter02_basics/2_1_2_pytorch-basics-autograd/
title: 2.1.2 AutoGrad - PyTorch Tutorial
date: 2023-04-06 16:35:09
tag: 
summary: PyTorch 的 Autograd 模块实现了深度学习的算法中的向传播求导数，在张量（Tensor 类）上的所有操作，Autograd 都能为他们自动提供微分，简化了手动计算导数的复杂过程。
---
```
import torch
torch.__version__
```

```
'2.0.0'
```

PyTorch 的 Autograd 模块实现了深度学习的算法中的向传播求导数，在张量（Tensor 类）上的所有操作，Autograd 都能为他们自动提供微分，简化了手动计算导数的复杂过程。

在 0.4 以前的版本中，Pytorch 使用 Variable 类来自动计算所有的梯度。

Variable 类主要包含三个属性：
- data：保存 Variable 所包含的 Tensor；
- grad：保存 data 对应的梯度，grad 也是个 Variable，而不是 Tensor，它和 data 的 shape 一样；
- grad_fn：指向一个 Function 对象，这个 Function 用来反向传播计算输入的梯度。

从 0.4 起, Variable 正式合并入 Tensor 类, 通过 Variable 嵌套实现的自动微分功能已经整合进入了 Tensor 类中。虽然为了代码的兼容性还是可以使用 Variable(tensor) 这种方式进行嵌套, 但是这个操作其实什么都没做。

所以，以后的代码建议直接使用 Tensor 类进行操作，因为官方文档中已经将 Variable 设置成过期模块。

要想通过 Tensor 类本身就支持了使用 autograd 功能，只需要设置`requries_grad=True`

Variable 类中的的 grad 和 grad_fn 属性已经整合进入了 Tensor 类中

## Autograd

在张量创建时，通过设置 requires_grad 标识为 Ture 来告诉 Pytorch 需要对该张量进行自动求导，PyTorch 会记录该张量的每一步操作历史并自动计算

```python
x = torch.rand(5, 5, requires_grad=True)
x
```

```
tensor([[0.0403, 0.5633, 0.2561, 0.4064, 0.9596],
        [0.6928, 0.1832, 0.5380, 0.6386, 0.8710],
        [0.5332, 0.8216, 0.8139, 0.1925, 0.4993],
        [0.2650, 0.6230, 0.5945, 0.3230, 0.0752],
        [0.0919, 0.4770, 0.4622, 0.6185, 0.2761]], requires_grad=True)
```

```
y = torch.rand(5, 5, requires_grad=True)
y
```

```
tensor([[0.2269, 0.7673, 0.8179, 0.5558, 0.0493],
        [0.7762, 0.9242, 0.2872, 0.0035, 0.4197],
        [0.4322, 0.5281, 0.9001, 0.7276, 0.3218],
        [0.5123, 0.6567, 0.9465, 0.0475, 0.9172],
        [0.9899, 0.9284, 0.5303, 0.1718, 0.3937]], requires_grad=True)
```

PyTorch 会自动追踪和记录对与张量的所有操作，当计算完成后调用 `.backward()` 方法自动计算梯度并且将计算结果保存到 grad 属性中。

```
z=torch.sum(x+y)
z
```

```
tensor(25.6487, grad_fn=<SumBackward0>)
```

在张量进行操作后，grad_fn 已经被赋予了一个新的函数，这个函数引用了一个创建了这个 Tensor 类的 Function 对象。 Tensor 和 Function 互相连接生成了一个非循环图，它记录并且编码了完整的计算历史。每个张量都有一个 `.grad_fn` 属性，如果这个张量是用户手动创建的那么这个张量的 grad_fn 是 None。

下面我们来调用反向传播函数，计算其梯度

## 简单的自动求导
```
z.backward()
print(x.grad,y.grad)
```

```
tensor([[1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.]]) tensor([[1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.],
        [1., 1., 1., 1., 1.]])
```

如果 Tensor 类表示的是一个标量（即它包含一个元素的张量），则不需要为 backward() 指定任何参数，但是如果它有更多的元素，则需要指定一个 gradient 参数，它是形状匹配的张量。

以上的 `z.backward()`相当于是`z.backward(torch.tensor(1.))`的简写。 这种参数常出现在图像分类中的单标签分类，输出一个标量代表图像的标签。

## 复杂的自动求导

```
x = torch.rand(5, 5, requires_grad=True)
y = torch.rand(5, 5, requires_grad=True)
z= x**2+y**3
z
```

```
tensor([[3.3891e-01, 4.9468e-01, 8.0797e-02, 2.5656e-01, 2.9529e-01],
        [7.1946e-01, 1.6977e-02, 1.7965e-01, 3.2656e-01, 1.7665e-01],
        [3.1353e-01, 2.2096e-01, 1.2251e+00, 5.5087e-01, 5.9572e-02],
        [1.3015e+00, 3.8029e-01, 1.1103e+00, 4.0392e-01, 2.2055e-01],
        [8.8726e-02, 6.9701e-01, 8.0164e-01, 9.7221e-01, 4.2239e-04]],
       grad_fn=<AddBackward0>)
```

```
#我们的返回值不是一个标量，所以需要输入一个大小相同的张量作为参数，这里我们用ones_like函数根据x生成一个张量
z.backward(torch.ones_like(x))
print(x.grad)
```

```
tensor([[0.2087, 1.3554, 0.5560, 1.0009, 0.9931],
        [1.2655, 0.1223, 0.8008, 1.1127, 0.7261],
        [1.1052, 0.2579, 1.8006, 0.1544, 0.3646],
        [1.8855, 1.2296, 1.9061, 0.9313, 0.0648],
        [0.5952, 1.6190, 0.8430, 1.9213, 0.0322]])
```

我们可以使用 with torch.no_grad() 上下文管理器临时禁止对已设置 requires_grad=True 的张量进行自动求导。这个方法在测试集计算准确率的时候会经常用到，例如：

```
with torch.no_grad():
    print((x +y*2).requires_grad)
```

```
False
```

使用 `.no_grad()` 进行嵌套后，代码不会跟踪历史记录也就是说保存这部分记录的内存不会减少内存的使用量并且会加快少许的运算速度。

## Autograd 过程解析

为了说明 Pytorch 的自动求导原理，我们来尝试分析一下 PyTorch 的源代码，虽然 Pytorch 的 Tensor 和 TensorBase 都是使用 Cpp 来实现的，但是可以使用一些 Python 的一些方法查看这些对象在 Python 的属性和状态。

Python 的 `dir()` 返回参数的属性、方法列表。`z` 是一个 Tensor 变量，看看里面有哪些成员变量。

```
dir(z)
```

```
['__abs__',
 '__add__',
 '__and__',
 '__array__',
 '__array_priority__',
 '__array_wrap__',
 '__bool__',
 '__class__',
 '__deepcopy__',
 '__delattr__',
 '__delitem__',
 '__dict__',
 '__dir__',
 '__div__',
 '__doc__',
 '__eq__',
 '__float__',
 '__floordiv__',
 '__format__',
 '__ge__',
 '__getattribute__',
 '__getitem__',
 '__gt__',
 '__hash__',
 '__iadd__',
 '__iand__',
 '__idiv__',
 '__ilshift__',
 '__imul__',
 '__index__',
 '__init__',
 '__init_subclass__',
 '__int__',
 '__invert__',
 '__ior__',
 '__ipow__',
 '__irshift__',
 '__isub__',
 '__iter__',
 '__itruediv__',
 '__ixor__',
 '__le__',
 '__len__',
 '__long__',
 '__lshift__',
 '__lt__',
 '__matmul__',
 '__mod__',
 '__module__',
 '__mul__',
 '__ne__',
 '__neg__',
 '__new__',
 '__nonzero__',
 '__or__',
 '__pow__',
 '__radd__',
 '__rdiv__',
 '__reduce__',
 '__reduce_ex__',
 '__repr__',
 '__reversed__',
 '__rfloordiv__',
 '__rmul__',
 '__rpow__',
 '__rshift__',
 '__rsub__',
 '__rtruediv__',
 '__setattr__',
 '__setitem__',
 '__setstate__',
 '__sizeof__',
 '__str__',
 '__sub__',
 '__subclasshook__',
 '__truediv__',
 '__weakref__',
 '__xor__',
 '_backward_hooks',
 '_base',
 '_cdata',
 '_coalesced_',
 '_dimI',
 '_dimV',
 '_grad',
 '_grad_fn',
 '_indices',
 '_make_subclass',
 '_nnz',
 '_values',
 '_version',
 'abs',
 'abs_',
 'acos',
 'acos_',
 'add',
 'add_',
 'addbmm',
 'addbmm_',
 'addcdiv',
 'addcdiv_',
 'addcmul',
 'addcmul_',
 'addmm',
 'addmm_',
 'addmv',
 'addmv_',
 'addr',
 'addr_',
 'all',
 'allclose',
 'any',
 'apply_',
 'argmax',
 'argmin',
 'argsort',
 'as_strided',
 'as_strided_',
 'asin',
 'asin_',
 'atan',
 'atan2',
 'atan2_',
 'atan_',
 'backward',
 'baddbmm',
 'baddbmm_',
 'bernoulli',
 'bernoulli_',
 'bincount',
 'bmm',
 'btrifact',
 'btrifact_with_info',
 'btrisolve',
 'byte',
 'cauchy_',
 'ceil',
 'ceil_',
 'char',
 'cholesky',
 'chunk',
 'clamp',
 'clamp_',
 'clamp_max',
 'clamp_max_',
 'clamp_min',
 'clamp_min_',
 'clone',
 'coalesce',
 'contiguous',
 'copy_',
 'cos',
 'cos_',
 'cosh',
 'cosh_',
 'cpu',
 'cross',
 'cuda',
 'cumprod',
 'cumsum',
 'data',
 'data_ptr',
 'dense_dim',
 'det',
 'detach',
 'detach_',
 'device',
 'diag',
 'diag_embed',
 'diagflat',
 'diagonal',
 'digamma',
 'digamma_',
 'dim',
 'dist',
 'div',
 'div_',
 'dot',
 'double',
 'dtype',
 'eig',
 'element_size',
 'eq',
 'eq_',
 'equal',
 'erf',
 'erf_',
 'erfc',
 'erfc_',
 'erfinv',
 'erfinv_',
 'exp',
 'exp_',
 'expand',
 'expand_as',
 'expm1',
 'expm1_',
 'exponential_',
 'fft',
 'fill_',
 'flatten',
 'flip',
 'float',
 'floor',
 'floor_',
 'fmod',
 'fmod_',
 'frac',
 'frac_',
 'gather',
 'ge',
 'ge_',
 'gels',
 'geometric_',
 'geqrf',
 'ger',
 'gesv',
 'get_device',
 'grad',
 'grad_fn',
 'gt',
 'gt_',
 'half',
 'hardshrink',
 'histc',
 'ifft',
 'index_add',
 'index_add_',
 'index_copy',
 'index_copy_',
 'index_fill',
 'index_fill_',
 'index_put',
 'index_put_',
 'index_select',
 'indices',
 'int',
 'inverse',
 'irfft',
 'is_coalesced',
 'is_complex',
 'is_contiguous',
 'is_cuda',
 'is_distributed',
 'is_floating_point',
 'is_leaf',
 'is_nonzero',
 'is_pinned',
 'is_same_size',
 'is_set_to',
 'is_shared',
 'is_signed',
 'is_sparse',
 'isclose',
 'item',
 'kthvalue',
 'layout',
 'le',
 'le_',
 'lerp',
 'lerp_',
 'lgamma',
 'lgamma_',
 'log',
 'log10',
 'log10_',
 'log1p',
 'log1p_',
 'log2',
 'log2_',
 'log_',
 'log_normal_',
 'log_softmax',
 'logdet',
 'logsumexp',
 'long',
 'lt',
 'lt_',
 'map2_',
 'map_',
 'masked_fill',
 'masked_fill_',
 'masked_scatter',
 'masked_scatter_',
 'masked_select',
 'matmul',
 'matrix_power',
 'max',
 'mean',
 'median',
 'min',
 'mm',
 'mode',
 'mul',
 'mul_',
 'multinomial',
 'mv',
 'mvlgamma',
 'mvlgamma_',
 'name',
 'narrow',
 'narrow_copy',
 'ndimension',
 'ne',
 'ne_',
 'neg',
 'neg_',
 'nelement',
 'new',
 'new_empty',
 'new_full',
 'new_ones',
 'new_tensor',
 'new_zeros',
 'nonzero',
 'norm',
 'normal_',
 'numel',
 'numpy',
 'orgqr',
 'ormqr',
 'output_nr',
 'permute',
 'pin_memory',
 'pinverse',
 'polygamma',
 'polygamma_',
 'potrf',
 'potri',
 'potrs',
 'pow',
 'pow_',
 'prelu',
 'prod',
 'pstrf',
 'put_',
 'qr',
 'random_',
 'reciprocal',
 'reciprocal_',
 'record_stream',
 'register_hook',
 'reinforce',
 'relu',
 'relu_',
 'remainder',
 'remainder_',
 'renorm',
 'renorm_',
 'repeat',
 'requires_grad',
 'requires_grad_',
 'reshape',
 'reshape_as',
 'resize',
 'resize_',
 'resize_as',
 'resize_as_',
 'retain_grad',
 'rfft',
 'roll',
 'rot90',
 'round',
 'round_',
 'rsqrt',
 'rsqrt_',
 'scatter',
 'scatter_',
 'scatter_add',
 'scatter_add_',
 'select',
 'set_',
 'shape',
 'share_memory_',
 'short',
 'sigmoid',
 'sigmoid_',
 'sign',
 'sign_',
 'sin',
 'sin_',
 'sinh',
 'sinh_',
 'size',
 'slogdet',
 'smm',
 'softmax',
 'sort',
 'sparse_dim',
 'sparse_mask',
 'sparse_resize_',
 'sparse_resize_and_clear_',
 'split',
 'split_with_sizes',
 'sqrt',
 'sqrt_',
 'squeeze',
 'squeeze_',
 'sspaddmm',
 'std',
 'stft',
 'storage',
 'storage_offset',
 'storage_type',
 'stride',
 'sub',
 'sub_',
 'sum',
 'svd',
 'symeig',
 't',
 't_',
 'take',
 'tan',
 'tan_',
 'tanh',
 'tanh_',
 'to',
 'to_dense',
 'to_sparse',
 'tolist',
 'topk',
 'trace',
 'transpose',
 'transpose_',
 'tril',
 'tril_',
 'triu',
 'triu_',
 'trtrs',
 'trunc',
 'trunc_',
 'type',
 'type_as',
 'unbind',
 'unfold',
 'uniform_',
 'unique',
 'unsqueeze',
 'unsqueeze_',
 'values',
 'var',
 'view',
 'view_as',
 'where',
 'zero_']
```

返回很多，我们直接排除掉一些 Python 中特殊方法（以__开头和结束的）和私有方法（以_开头的，直接看几个比较主要的属性：
-  `.is_leaf`：记录是否是叶子节点。通过这个属性来确定这个变量的类型 

在官方文档中所说的 “graph leaves”,“leaf variables”，都是指像 `x`, `y` 这样的手动创建的、而非运算得到的变量，这些变量成为创建变量。 像 `z` 这样的，是通过计算后得到的结果称为结果变量。

一个变量是创建变量还是结果变量是通过`.is_leaf`来获取的。

```
print("x.is_leaf="+str(x.is_leaf))
print("z.is_leaf="+str(z.is_leaf))
```

```
x.is_leaf=True
z.is_leaf=False
```

`x`是手动创建的没有通过计算，所以他被认为是一个叶子节点也就是一个创建变量，而`z`是通过`x`与`y`的一系列计算得到的，所以不是叶子结点也就是结果变量。

为什么我们执行`z.backward()`方法会更新`x.grad`和`y.grad`呢？ `.grad_fn`属性记录的就是这部分的操作，虽然`.backward()`方法也是 CPP 实现的，但是可以通过 Python 来进行简单的探索。

`grad_fn`：记录并且编码了完整的计算历史

```
z.grad_fn
```

```
<AddBackward0 at 0x120840a90>
```

`grad_fn`是一个`AddBackward0`类型的变量 `AddBackward0`这个类也是用 Cpp 来写的, 但是我们从名字里就能够大概知道，他是加法 (ADD) 的反向传播（Backward），看看里面有些什么东西

```
dir(z.grad_fn)
```

```
['__call__',
 '__class__',
 '__delattr__',
 '__dir__',
 '__doc__',
 '__eq__',
 '__format__',
 '__ge__',
 '__getattribute__',
 '__gt__',
 '__hash__',
 '__init__',
 '__init_subclass__',
 '__le__',
 '__lt__',
 '__ne__',
 '__new__',
 '__reduce__',
 '__reduce_ex__',
 '__repr__',
 '__setattr__',
 '__sizeof__',
 '__str__',
 '__subclasshook__',
 '_register_hook_dict',
 'metadata',
 'name',
 'next_functions',
 'register_hook',
 'requires_grad']
```

`next_functions`就是`grad_fn`的精华

```
z.grad_fn.next_functions
```

```
((<PowBackward0 at 0x1208409b0>, 0), (<PowBackward0 at 0x1208408d0>, 0))
```

`next_functions`是一个 tuple of tuple of PowBackward0 and int。

为什么是 2 个 tuple ？ 因为我们的操作是`z= x**2+y**3` 刚才的`AddBackward0`是相加，而前面的操作是乘方 `PowBackward0`。tuple 第一个元素就是 x 相关的操作记录

```
xg = z.grad_fn.next_functions[0][0]
dir(xg)
```

```
['__call__',
 '__class__',
 '__delattr__',
 '__dir__',
 '__doc__',
 '__eq__',
 '__format__',
 '__ge__',
 '__getattribute__',
 '__gt__',
 '__hash__',
 '__init__',
 '__init_subclass__',
 '__le__',
 '__lt__',
 '__ne__',
 '__new__',
 '__reduce__',
 '__reduce_ex__',
 '__repr__',
 '__setattr__',
 '__sizeof__',
 '__str__',
 '__subclasshook__',
 '_register_hook_dict',
 'metadata',
 'name',
 'next_functions',
 'register_hook',
 'requires_grad']
```

继续深挖

```
x_leaf=xg.next_functions[0][0]
type(x_leaf)
```

```
AccumulateGrad
```

在 PyTorch 的反向图计算中，`AccumulateGrad`类型代表的就是叶子节点类型，也就是计算图终止节点。`AccumulateGrad`类中有一个`.variable`属性指向叶子节点。

```
x_leaf.variable
```

```
tensor([[0.1044, 0.6777, 0.2780, 0.5005, 0.4966],
        [0.6328, 0.0611, 0.4004, 0.5564, 0.3631],
        [0.5526, 0.1290, 0.9003, 0.0772, 0.1823],
        [0.9428, 0.6148, 0.9530, 0.4657, 0.0324],
        [0.2976, 0.8095, 0.4215, 0.9606, 0.0161]], requires_grad=True)
```

这个`.variable`的属性就是我们的生成的变量`x`

```
print("x_leaf.variable的id:"+str(id(x_leaf.variable)))
print("x的id:"+str(id(x)))
```

```
x_leaf.variable的id:4840553424
x的id:4840553424
```

```
assert(id(x_leaf.variable)==id(x))
```

这样整个规程就很清晰了：

1.  当我们执行 z.backward() 的时候。这个操作将调用 z 里面的 grad_fn 这个属性，执行求导的操作。
2.  这个操作将遍历 grad_fn 的 next_functions，然后分别取出里面的 Function（AccumulateGrad），执行求导操作。这部分是一个递归的过程直到最后类型为叶子节点。
3.  计算出结果以后，将结果保存到他们对应的 variable 这个变量所引用的对象（x 和 y）的 grad 这个属性里面。
4.  求导结束。所有的叶节点的 grad 变量都得到了相应的更新

最终当我们执行完 c.backward() 之后，a 和 b 里面的 grad 值就得到了更新。

## 扩展 Autograd

如果需要自定义 autograd 扩展新的功能，就需要扩展 Function 类。因为 Function 使用 autograd 来计算结果和梯度，并对操作历史进行编码。 在 Function 类中最主要的方法就是`forward()`和`backward()`他们分别代表了前向传播和反向传播。

一个自定义的 Function 需要一下三个方法：

```
__init__ (optional)：如果这个操作需要额外的参数则需要定义这个Function的构造函数，不需要的话可以忽略。

forward()：执行前向传播的计算代码

backward()：反向传播时梯度计算的代码。 参数的个数和forward返回值的个数一样，每个参数代表传回到此操作的梯度。
```

```
# 引入Function便于扩展
from torch.autograd.function import Function
```

```
# 定义一个乘以常数的操作(输入参数是张量)
# 方法必须是静态方法，所以要加上@staticmethod 
class MulConstant(Function):
 @staticmethod 
    def forward(ctx, tensor, constant):
        # ctx 用来保存信息这里类似self，并且ctx的属性可以在backward中调用
        ctx.constant=constant
        return tensor *constant
 @staticmethod
    def backward(ctx, grad_output):
        # 返回的参数要与输入的参数一样.
        # 第一个输入为3x3的张量，第二个为一个常数
        # 常数的梯度必须是 None.
        return grad_output, None
```

定义完我们的新操作后，我们来进行测试

```
a=torch.rand(3,3,requires_grad=True)
b=MulConstant.apply(a,5)
print("a:"+str(a))
print("b:"+str(b)) # b为a的元素乘以5
```

```
a:tensor([[0.0118, 0.1434, 0.8669],
        [0.1817, 0.8904, 0.5852],
        [0.7364, 0.5234, 0.9677]], requires_grad=True)
b:tensor([[0.0588, 0.7169, 4.3347],
        [0.9084, 4.4520, 2.9259],
        [3.6820, 2.6171, 4.8386]], grad_fn=<MulConstantBackward>)
```

反向传播，返回值不是标量，所以`backward`方法需要参数

```
b.backward(torch.ones_like(a))
```

```
a.grad
```

```
tensor([[1., 1., 1.],
        [1., 1., 1.],
        [1., 1., 1.]])
```

梯度因为 1