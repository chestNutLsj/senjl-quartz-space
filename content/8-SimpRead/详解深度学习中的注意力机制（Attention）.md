---
url: https://zhuanlan.zhihu.com/p/379722366
title: 详解深度学习中的注意力机制（Attention）
date: 2023-04-02 16:22:32
tag: 
summary: 
---
今天我们来探讨下深度学习中的 Attention 机制，中文名为 “注意力”。

## **1 为什么要引入 Attention 机制？**

当我们用深度 CNN 模型识别图像时，一般是通过卷积核去提取图像的局部信息，然而，每个局部信息对图像能否被正确识别的影响力是不同的，如何让模型知道图像中不同局部信息的重要性呢？答案就是注意力机制。

![](https://pic2.zhimg.com/v2-e68d0744701e7e019455c85fdd9a597d_r.jpg)

视觉注意力机制是人类大脑的一种天生的能力。当我们看到一幅图片时，先是快速扫过图片，然后锁定需要重点关注的目标区域。比如当我们观察上述图片时，注意力很容易就集中在了人脸、文章标题和文章首句等位置。

试想，如果每个局部信息都不放过，那么必然耗费很多精力，不利于人类的生存进化。同样地，在深度学习网络中引入类似的机制，可以**简化模型，加速计算**。

另外，利用循环神经网络去处理 NLP 任务时，**长距离 “记忆” 能力一直是个大难题，而引入 “注意力机制” 也能有效缓解这一问题。**

## **2 Encoder-Decoder 框架**

常见的深度学习模型有 CNN、RNN、LSTM、AE 等，其实都可以归为一种通用框架 - Encoder-Decoder.

![](https://pic1.zhimg.com/v2-ac1a731879cc23c12e48bd7f16bb22c4_r.jpg)

在文本处理领域，有一类常见的任务就是从一个句子（Source）生成另一个句子（Target），比如翻译，其中 **xi** 是输入单词的向量表示，**yi** 表示输出单词。

![](https://pic1.zhimg.com/v2-ad908951ac78a46794d318393aff6d98_b.jpg)

Source 经过 Encoder，生成中间的语义编码 **C**，

![](https://pic3.zhimg.com/v2-9ee51cdd6c504ee06f9d302ae696f136_b.jpg)

C 经过 Decoder 之后，输出翻译后的句子。在循环神经网络中，先根据 **C** 生成 **y1**，再基于（**C，y1**）生成 **y2**，依此类推。

![](https://pic3.zhimg.com/v2-92ddbfa766f17268af80a76dd6be974a_b.jpg)

## **3 Soft Attention 模型**

![](https://pic1.zhimg.com/v2-29c7b6c7552f60c5039856077aa50a54_r.jpg)

传统的循环神经网络中，**y1**、**y2** 和 **y3** 的计算都是基于同一个 **C**. 深入思考一下，发现这可能并不是最好的方案，因为 Source 中不同单词对 **y1**、**y2** 和 **y3** 的影响是不同的，所以，很自然地就有了如下思路：

![](https://pic2.zhimg.com/v2-7260651c60d95f617fe9a918132f4585_r.jpg)

**上述改良模型中的 C1、C2、C3** **是怎么计算的呢？**其实也非常简单，就是在计算 **C1**、**C2** 和 **C3** 时，分别使用不同的权重向量：

![](https://pic3.zhimg.com/v2-1661a288d50be24fad370cf41e284156_r.jpg)

上述公式中的权重向量 (a11, a12, a13)、(a21, a22, a23)、(a31, a32, a33) 又是如何计算的呢？请看下图。

![](https://pic1.zhimg.com/v2-76fecb2c6aec26c63e5db808469611b0_r.jpg)

上述模型中： **h1** = f(Tom)、**h2** = f(**h1**, Chase)、**h3** = f(**h2**, Jerry).

当计算出 **Hi-1** 之后，通过函数 F(**hj**,**Hi-1**) 获得输入语句中不同单词（Tom、Chase、Jerry）对目标单词 **yi** 的影响力，F 的输出再经过 Softmax 进行归一化就得到了符合概率分布取值区间的注意力分配概率。其中，F 函数的实现方法有多种，比如余弦相似度、MLP 等。

![](https://pic2.zhimg.com/v2-114439489a6c0dfa037521ded6a096c5_r.jpg)

## **4 Attention 机制的本质**

现在，请你把 Source 想象成是内存里的一块存储空间，它里面存储的数据按 <Key, Value> 存储。给定 Query，然后取出对应的内容。**这里与一般的 hash 查询方式不同的是，每个地址都只取一部分内容，然后对所有的 Value 加权求和。**

![](https://pic3.zhimg.com/v2-bdab75088ba037b48db6a5a85f62941a_r.jpg)

公式描述如下：

![](https://pic3.zhimg.com/v2-6f9d9ec94f3b5e05d4ab964cefb405da_r.jpg)

Attention 的计算可以分成如下三个阶段：

![](https://pic1.zhimg.com/v2-f52572cd150732703a97d6a92305244c_r.jpg)

![](https://pic2.zhimg.com/v2-b56ff5ce9327999ed1dde2da04fa3bc9_r.jpg)

注意力打分机制

![](https://pic4.zhimg.com/v2-6ed835d05761d8988e74219ba381b38b_b.jpg)

归一化的注意力概率分配

![](https://pic4.zhimg.com/v2-6e982a357c11c6c92058ea388148a3c7_r.jpg)

上述公式中的 _Lx_ 表示输入语句的长度。上一节的例子中，Key 是等于 Value 的。

## **5 Self Attention 模型**

![](https://pic1.zhimg.com/v2-54d5f264438195cf41f569b3f1167880_r.jpg)

在 Soft Attention 模型中，Source 和输出 Target 的内容是不同的，比如中 - 英机器翻译，Source 对应中文语句，Target 对应英文语句。

现在有另一个任务，如上图所示：给定一个句子和句子中某个单词 making，如何找出与 making 强相关的其他单词呢？比如上图中的 more difficult（因为它们和 making 可以组成一个短语）.

这就用到了 Self Attention 机制，顾名思义，指的是 Source 内部元素之间或者 Target 内部元素之间发生的 Attention 机制，也可以理解为 Source = Target 这种特殊情况下的 Attention 机制，具体计算过程和 Soft Attention 是一样的。

## **6 总结**

下图展示了注意力机制如何在图片描述任务（Image-Caption）中发挥作用的。

图片描述任务，就是给你一张图片，请输出一句话去描述它。一般会用 CNN 来对图片进行特征提取，Decoder 部分使用 RNN 或者 LSTM 来输出描述语句。此时如果加入注意力机制，能够大大改善输出效果。

![](https://pic4.zhimg.com/v2-3251b16a739ff649c4c13e217c2f73eb_r.jpg)

另外，在语音识别、目标物体检测等领域，注意力机制同样取得了很好的效果。

实际上，**Attention 机制听起来高大上，其关键就是学出一个权重分布，然后作用在特征上**。

*   这个权重可以保留所有的分量，叫加权（Soft Attention），也可以按某种采样策略选取部分分量（Hard Attention）。
*   这个权重可以作用在原图上，如目标物体检测；也可以作用在特征图上，如 Image-Caption
*   这个权重可以作用在空间尺度上，也可以作用于 Channel 尺度上，给不同通道的特征加权
*   这个权重可以作用在不同时刻上，如机器翻译

文中图片及部分内容来源于 CSDN 账号 “csdn 人工智能” 的文章《深度学习中的注意力机制》，写得非常好，强烈推荐大家阅读。