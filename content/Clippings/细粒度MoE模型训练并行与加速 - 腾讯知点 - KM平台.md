---
title: "细粒度MoE模型训练并行与加速 - 腾讯知点 - KM平台"
author:
  - "[[GPU云原生实践案例--WXG模式识别]]"
published:
date: "2025-11-18T15:05:09+08:00"
description:
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：

细粒度MoE模型训练并行与加速

[josephyu](https://km.woa.com/user/josephyu)

2025-04-27 12:12

387

0

6

分享

文章摘要

思维导图

## 设计体现取舍的价值观

在真实产品中的大模型，其实是多个方面问题的取舍。对于用户体验来说，用户永远希望响应结果快。对于模型本身，在各种评测上，都希望效果更好。而对于预测和训练，我们都希望花小钱办大事儿，当同样大小的模型训练预测的卡时更小。

目前主流的LLM产品都在工程/算法/产品三个方向共同协同设计模型结构。而模型结构中，MoE模型的Expert Granularity 又是对计算效率，算法，产品效果影响较大的关键性决策。

专家粒度是指，激活少而大的专家，还是激活多而碎的专家网络。即使都是200B模型激活20B的MoE模型，一层从8个专家里选一个，还是从128个专家里选16个。这对算法效果，工程速度，以及产品效果都有不同的影响。

- 对于算法效果：细粒度的专家模型，有更好的算法效果。这因为细粒度的专家模型，相当于稀疏约束更低。
- 对于产品效果：细粒度的专家模型，成本高，latency大。细粒度的专家模型让小batch size的预测框架更难写。这因为每个专家参数的矩阵太小了，需要更大的batch size才能有比较好的成本。于是，PD分离，DeepEP等优化就变成了上线的必须项。
- 对于预训练工程来说：细粒度的专家模型，矩阵乘法规模小，通信量大。EP的通信量，和选择多少个专家有关系。也就是128选16个专家，约等于8选1个专家通信量的16倍。也就是同样的算力与优化方案下，选择更粗粒的模型，更容易训练一个“大”模型。

纵观LLM的产品，实际上对产品体验的决定性的因素排序是：模型效果，模型响应速度，模型预测成本，模型训练成本。WeLM在选择模型结构的时候，决定与其“为了追求用更少的资源，训练一个“大”模型”，不如“训练一个在约束响应速度，模型预测成本下，效果好的LLM”。

这让WeLM在选择模型结构时，多次选择了细粒度的模型。即128个专家激活6个的模型结构。

## MoE模型训练性能核心问题是如何overlap计算与通信

MoE的预训练通常是PP/EP的混合训练。

- 对于EP来说，Dispatch/Combine的通信Kernel，通常占到某一层MoE计算的30-50%的时间。
	- ![](https://km.woa.com/asset/000100052504003a77610c67094db602?height=1118&width=2700&imageMogr2/thumbnail/1540x%3E/ignore-error/1)
- 对于PP来说，大规模的PP，在mini-batch的warmup和收尾阶段，也有非常多的bubble
	- ![](https://km.woa.com/asset/00010002250400b7e563ac878d4a4401?height=644&width=2170&imageMogr2/thumbnail/1540x%3E/ignore-error/1)

所以，如何利用起bubble，通信的时间来计算，就是MoE预训练优化的关键问题。

  

### 最简单Overlap，利用SharedExperts

![](https://km.woa.com/asset/000100052504005c0efce920914e6102?height=728&width=2830&imageMogr2/thumbnail/1540x%3E/ignore-error/1)

shared experts在MoE中，就是无论Attn的hidden state如何route，都要去执行的计算。SharedExperts只要在整个MoE的专家计算结束之前，计算完成即可。计算时间约束很低。

最简单的Overlap思路，就是将Shared Experts的计算，和通信部分如Dispatch/Combine来Overlap。但通常，SharedExperts只是两层MLP。这里的计算量并不是很大。只能和Dispatch的一部分overlap掉。

当然，我们也可以对SharedExperts进行改造，甚至直接用一整个DenseLayer(Attn+MLP)来当作SharedExperts。并在SharedExperts这里独立的TP通信。这也是一种没有办法的办法。特别是当整个计算硬件的通信/计算Overlap控制自主性不高的时候(如一些国产芯片)，这么做可以简单的高效训练起超大规模的LLM。整个计算效率也可以打满硬件的计算能力。

但对Shared Experts的改造，会导致上线的代码和开源的模型结构相差过远。上线过程开发工作量会更大一些。而从上线成本来说，其实用一个矮胖型的网络，并行成本也可能会更低。而整个shared experts的改造，对算法效果的变化更大，需要验证的算法效果也会更多。但总体上，这套方案不失为在一些overlap编程困难的硬件上的一套解决方案。

  

### NanoBatch MoE PP并行

![](https://km.woa.com/asset/00010005250400335097513b44405002?height=1170&width=2850&imageMogr2/thumbnail/1540x%3E/ignore-error/1)

借用流水线并行的思路，将MoE部分的训练数据从micro batch再切分成Nano Batch。将Dispatch/Experts/Combine/MoESum做成4个Pipeline Stage。也能完成MoE这里的通信/计算Overlap。

这对粗粒度的MoE模型效果很好。而对于细粒度的MoE模型，每个Experts的参数宽度很小(通常是卡着Matmul最低能打满的size来的)。将一个micro batch切分成多个Nano-Batches的行为，等效将计算的输入token数量变少。这里有一个矛盾的权衡点。

- 如果追求计算效率大，一个NanoBatch的token数量要多。而MicroBatches的Token数量受到显卡显存的限制又不能很多。所以，要么增大并行规划(比如加多PP size或者加多EP size)，用复杂的通信来换更大的MicroBatch。要么，减少NanoBatch的数量。让每个NanoBatch的token数量更多。
- 如果追求通信的Overlap，那么NanoBatches的数量至少是2。如果比2小，就没有切分了。但是NanoBatches的数量太小，也会遇到流水线并行所固有的bubble问题。也就是最开始的NanoBatch的通信没有计算来Overlap。

![](https://km.woa.com/asset/0001000525040048514a50a7ce491b02?height=556&width=1044&imageMogr2/thumbnail/1540x%3E/ignore-error/1)

解决上述问题，可以借鉴zero bubble pp的思路。将pp并行中的dW计算延后。PP并行中，只有dIn是需要立即计算的。而dW只要在Optimize之前计算完就可以了。所以dW计算可以延后。

将dW计算延后之后，我们发现和NanoBatches的MoE并行中第一个NanoBatch的通信正好可以Overlap。于是便解决了NanoBatches的细粒度MoE并行的bubble问题:

- num nano batches可以等于2，因为只有第一个micro batch的第一个nano batch没有计算来overlap
- 第二个micro batch的第一个nano batch的dispatch，和第一个micro batch最后一个nano batch的dW overlap

整个思路在24年WeLM的训练中实现，我们也欣慰地看到25年的Megatron框架也实现了部分这个思路(1F1B ZeroBubble)。

## PP并行: Hanayo

  

![](https://km.woa.com/asset/00010005250400b1041ffb3abf405802?height=1634&width=1470&imageMogr2/thumbnail/1540x%3E/ignore-error/1)

在解决pp bubble上，welm这里使用了hanayo的技术。他是chimera的变种。hanayo和chimera一样，在解决bubble size的同时，又减少了不同的PP stage之间的通信与参数占用。具体思路，可以参考 [https://arxiv.org/abs/2308.15762](https://arxiv.org/abs/2308.15762) paper，具体本文不再赘述。

deepseek dualpipe整体上可以看作chimera 与 forward/backward fusion的结合。在dpsk v3 paper发表的时候，welm团队就着手开发 hanayo + forward/backward fusion了。不过开源业界，也提出了类似的dualpipev。

## 写在最后

整体性能的benchmark和模型结构、并行方案影响相关。每一种情况下都能找到一个“局部最优”来论证某种效果最好。最简单的调大SharedExperts，增大Experts参数量，降低EP Size，很容易就能打满显卡计算。并不是本文的目标范围了。

本文主要是介绍各种计算方案与他们的取舍，实现这些方案之后，可以针对不同的模型结构，来适用不同的并行技术，进而打满显卡计算，获得收益。

更新于：2025-04-27 12:12

标签： [LLM](https://km.woa.com/group/52663/articles?tag_id=187665)

![](https://km.woa.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) 微信扫一扫赞赏

我顶 2

收藏 6

转载

收录

反馈

[![](https://km.woa.com/asset/avatar/sylentli)](https://km.woa.com/user/sylentli)

评论

表情

图片

更多功能

已到底部

2

6

![](https://km.woa.com/img/download_openkm.png)

扫一扫安装手机KM