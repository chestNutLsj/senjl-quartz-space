---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/1_1_pytorch-introduction/
title: 1.1 PyTorch Tntroduction - PyTorch Tutorial
date: 2023-04-02 14:46:34
tag: 
summary: 很多人都会拿 PyTorch 和 Google 的 Tensorflow 进行比较，这个肯定是没有问题的，因为他们是最火的两个深度学习框架了。但是说到 PyTorch，其实应该先说 Torch。
---

## PyTorch 的由来

很多人都会拿 PyTorch 和 Google 的 Tensorflow 进行比较，这个肯定是没有问题的，因为他们是最火的两个深度学习框架了。但是说到 PyTorch，其实应该先说 [Torch](http://torch.ch/)。

## Torch 是什么？

**Torch 英译中：火炬**

> A Tensor library like Numpy, unlike Numpy it has strong GPU support. Lua is a wrapper for Torch (Yes! you need to have a good understanding of Lua), and for that you will need LuaRocks package manager.

Torch 是一个与 Numpy 类似的张量（Tensor）操作库，与 Numpy 不同的是 Torch 对 GPU 支持的很好，Lua 是 Torch。[lua - What is the relationship between PyTorch and Torch? - Stack Overflow](https://stackoverflow.com/questions/44371560/what-is-the-relationship-between-pytorch-and-torch) 

> Torch is not going anywhere. PyTorch and Torch use the same C libraries that contain all the performance: TH, THC, THNN, THCUNN and they will continue to be shared.  
> 
   We still and will have continued engineering on Torch itself, and we have no immediate plan to remove that.

PyTorch 和 Torch 使用包含所有相同性能的 C 库：TH, THC, THNN, THCUNN，并且它们将继续共享这些库。  
这样的回答就很明确了，其实 PyTorch 和 Torch 都使用的是相同的底层，只是使用了不同的上层包装语言。  
LUA 虽然快，但是太小众了，所以才会有 PyTorch 的出现。[Roadmap for torch and pytorch - PyTorch Forums](https://discuss.pytorch.org/t/roadmap-for-torch-and-pytorch/38) 

## 重新介绍 PyTorch

> PyTorch is an open source machine learning library for Python, based on Torch, used for applications such as natural language processing. It is primarily developed by Facebook's artificial-intelligence research group, and Uber's "Pyro" software for probabilistic programming is built on it.

PyTorch 是一个基于 Torch 的 Python 开源机器学习库，用于自然语言处理等应用程序。 它主要由 Facebook 的人工智能研究小组开发。[PyTorch - Wikipedia](https://en.wikipedia.org/wiki/PyTorch) 

> [! note]
  PyTorch is a Python package that provides two high-level features:  
> - Tensor computation (like NumPy) with strong GPU acceleration  
> - Deep neural networks built on a tape-based autograd system
> - You can reuse your favorite Python packages such as NumPy, SciPy and Cython to extend PyTorch when needed.

PyTorch 是一个 Python 包，提供两个高级功能： 
1. 具有强大的 GPU 加速的张量计算（如 NumPy)
2. 包含自动求导系统的的深度神经网络

任何时候，你可以用你喜欢的 Python 包，如 NumPy、SciPy 和 Cython 去扩展 PyTorch。[GitHub - pytorch/pytorch: Tensors and Dynamic neural networks in Python with strong GPU acceleration](https://github.com/pytorch/pytorch)

## 对比 PyTorch 和 Tensorflow

没有好的框架，只有合适的框架， [这篇知乎文章](https://zhuanlan.zhihu.com/p/28636490)有个简单的对比，2019 年 6 月 25 日 [机器之心] 翻译的 [PyTorch 和 Keras 的最新对比](https://mp.weixin.qq.com/s/zS6KwLmx_cC3d14vas8DJA)，所以这里就不详细再说了。 并且技术是发展的，知乎上的对比也不是绝对的，比如 Tensorflow 在 1.5 版的时候就引入了 Eager Execution 机制实现了动态图，PyTorch 的可视化, windows 支持，沿维翻转张量等问题都已经不是问题了。

## 再次总结

*   PyTorch 算是相当简洁优雅且高效快速的框架
*   设计追求最少的封装，尽量避免重复造轮子
*   算是所有的框架中面向对象设计的最优雅的一个，设计最符合人们的思维，它让用户尽可能地专注于实现自己的想法
*   大佬支持，与 google 的 Tensorflow 类似，FAIR 的支持足以确保 PyTorch 获得持续的开发更新
*   不错的的文档（相比 FB 的其他项目，PyTorch 的文档简直算是完善了，参考 Thrift），PyTorch 作者亲自维护的论坛 供用户交流和求教问题
*   入门简单