---
url: https://zhuanlan.zhihu.com/p/251068800
publish: "true"
tags:
  - Deep_Learning
  - PyTorch
date: 2024-02-19
---
> 本文摘自知乎大佬@双手插袋的博客：[CNN卷积核与通道讲解 - 知乎](https://zhuanlan.zhihu.com/p/251068800)
> 笔者在看 D2L 这本书初学 CNN 时，对这个“通道”也感到十分迷惑，因此搜索到这篇文章的解释，豁然开朗。

CNN 在图像和提取空间信息中有着广泛应用，本篇博客以图像解释为主，省去了 CNN 基础内容的概述，主要讲述单通道卷积核多通道卷积的详细过程，并以 Pytorch 代码示例。

## 单通道卷积

以单通道卷积为例，输入为（1,5,5），分别表示 1 个通道，宽为 5，高为 5。假设卷积核大小为 3x3，padding=0，stride=1。

**卷积过程如下：**

![[11-what-is-channel-conv.png]]

**相应的卷积核不断的在图像上进行遍历，最后得到 3x3 的卷积结果，结果如下：**

![](https://pic4.zhimg.com/v2-a432774af1ae5156097da84a5bd36b13_r.jpg)

## 多通道卷积

### 单输出通道

以彩色图像为例：
- 包含三个通道，分别表示 RGB 三原色的像素值，
- 输入为（3,5,5），分别表示 3 个通道，每个通道的宽为 5，高为 5 ，
- 假设卷积核只有 1 个，卷积核通道为 3，每个通道的卷积核大小仍为 3x3，padding=0，stride=1。

卷积过程如下，每一个通道的像素值与对应的卷积核通道的数值进行卷积，因此每一个通道会对应一个输出卷积结果，三个卷积结果对应位置累加求和，得到最终的卷积结果（**这里卷积输出结果的通道只有 1 个，因为卷积核只有 1 个。）** 可以这么理解：最终得到的卷积结果是原始图像各个通道上的综合信息结果。

![[11-what-is-channel-conv-multi-input.png]]

上述过程中，每一个卷积核的通道数量，必须要求与输入通道数量一致，因为要对每一个通道的像素值要进行卷积运算，所以每一个卷积核的通道数量必须要与输入通道数量保持一致。

我们把上述图像通道如果放在一块，计算原理过程还是与上面一样，堆叠后的表示如下：

![[11-what-is-channel-conv-illustrate.png]]

### 多输出通道

在上面的卷积例子中，输出的卷积结果只有 1 个通道，把整个卷积的整个过程抽象表示，过程如下：

![[11-what-is-channel-CNN-abstract.png]]

即：由于只有一个卷积核，因此卷积后只输出单通道的卷积结果（黄色的块状部分表示一个卷积核，黄色块是由三个通道堆叠在一起表示的，每一个黄色通道与输入卷积通道分别进行卷积，也就是 channel 数量要保持一致，图片组这里只是堆叠放在一起表示而已）。

那么，如果要卷积后也输出多通道，增加卷积核（filers）的数量即可，示意图如下：

![[11-what-is-channel-more-filers.png]]

> **备注**：上面的 feature map 的颜色，只是为了表示不同的卷积核对应的输出通道结果，不是表示对应的输出颜色

## 代码样例

Pytorch 中可以简单的调用卷积：

```python
nn.Conv2d (in_channels，out_channels，kernel_size，stride=1，padding=0，dilation=1，groups=1，bias=True)。
```

参数解释如下：
- `in_channels`：输入维度
- `out_channels`：输出维度
- `kernel_size`：卷积核大小，可以理解为对每个通道上的卷积的尺寸大小
- `stride`：步长大小
- `padding`：补 0
- `dilation`：kernel 间距

代码演示：

```python
import torch
 
in_channels = 5  #输入通道数量
out_channels =10 #输出通道数量
width = 100      #每个输入通道上的卷积尺寸的宽
heigth = 100     #每个输入通道上的卷积尺寸的高
kernel_size = 3  #每个输入通道上的卷积尺寸
batch_size = 1   #批数量
 
input = torch.randn(batch_size,in_channels,width,heigth)
conv_layer = torch.nn.Conv2d(in_channels,out_channels,kernel_size=kernel_size)
 
out_put = conv_layer(input)
 
print(input.shape)
print(out_put.shape)
print(conv_layer.weight.shape)
```

输出结果如下：

```
torch.Size([1, 5, 100, 100])
torch.Size([1, 10, 98, 98])
torch.Size([10, 5, 3, 3])
```

结果解释：
1) 输入的张量信息为 `[1,5,100,100]` 分别表示 batch_size，in_channels，width，height
2) 输出的张量信息为 `[1,10,98,98]` 分别表示 batch_size，out_channels，width'，height'，其中 width'，height'表示卷积后的每个通道的新尺寸大小
3) `conv_layer.weight.shape` 的输出结果为 `[10, 5, 3, 3]`，分表表示 out_channels，in_channels，kernel_size ，kernel_size 。

## 总结

最后，总结下上述内容（其实也很简单....），即：
1. **输入通道个数** 等于 **卷积核通道个数**
2. **卷积核个数** 等于 **输出通道个数**