---
title: "Transformer 作者团队开源 DroPE，将如何影响大模型长上下文能力？ - 4567 的回答"
author:
  - "[[4567​ 关注]]"
  - "[[叫我Alonzo就好了​中国科学技术大学  信息与通信工程博士在读​ 关注]]"
  - "[[梅花K​东南大学 计算机技术硕士​ 关注]]"
published:
date: "2026-03-01T16:12:20+08:00"
description: "一句话总结，DroPE对MLA可能很有用。首先总结DroPEDroPE的结论是什么？LLM预训练的前90%过程使用RoPE位置…"
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：https://www.zhihu.com/question/1994493166221554651/answer/1997309968697804786

[查看全部 5 个回答](https://www.zhihu.com/question/1994493166221554651)

![4567](https://pica.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=2c26e567)

[4567](https://www.zhihu.com/people/4567-79-2)

86 人赞同了该回答

![](https://picx.zhimg.com/50/v2-0523459e47720c55d1f1fbcb71fe7cdd_720w.jpg?source=2c26e567)

一句话总结，DroPE对MLA可能很有用。 首先总结DroPE DroPE的结论是什么？ LLM预训练的前90%过程使用 RoPE 位置编码，最后10%时间去掉RoPE，得到的模型性能不但没下降，而且长文本外推能力还增强了。 DroPE对结论的解释是什么？ 通过 Causal Mask ，每个token实质上能够获取位置信息。 RoPE对相邻token的偏好，正面作用是加速收敛，提供了优化的方向。负面作用是在超出旋转周期之后，带来了噪声干扰。 令人惊讶的地方在于： 去除RoPE之后，LLM继续训练能力恢复速度如此的快。 DroPE研究的不足： 最多实验到了7B的模型。好消息是再scale up之后检验很容易。 引申思路到MLA： 有没有一种模型，训练完成需要推理的时候，不想要RoPE呢？有的，兄弟，有的，它就是大名鼎鼎的MLA( Multi-Head Latent Attention )。 MLA的核心之一，来自注意力分数计算的两种等价形式。 对于每一个注意力头： Q T K = ( W U c q ) k v 左边是训练时候用的，右边是推理时候用的。 推理时候为什么用右边？ 1. 因为kv cache只存,存储少。 2. 新来的一个q经过变化后与 相乘，虽然总体计算量FLOPs大了，但是推理是Memory-bound，所有head搬运同一个 ，搬运量变少了，速度也就快了。 总之是用更少的推理开销获得了更强大的表达能力，赢！ 为什么表达能力强？请参考苏剑林. (May. 13, 2024). 《缓存与效果的极限拉扯：从MHA、 MQA 、GQA到MLA 》\[Blog post\]. Retrieved from kexue.fm/archives/10091 训练的时候为什么用左边？ 因为训练时候是Computation bound，左边公式计算FLOPs少。 左边能加RoPE，右边不好加 左边是标准的attention形式，训练时候加RoPE非常方便 i R − j 右边如果照这个样子加，就是 这么一来，同一个q，对上不同的k，需要在矩阵乘法中做不同的变换，计算量就爆炸了。memory效率再高也盖不住。 DeepseekV3用MLA的时候做了一个妥协 他们把MLA和MQA（Multi-Query Attention)混着用，MQA加RoPE，MLA不加。粗略计算Deepseek V3 MQA的部分在训练阶段占MLA主体FLOPs的50%。推理阶段占12.5%。推理阶段因为ROPE对精度要求更高，如果MLA部分使用fp8进行量化存储，MLA使用bf16，MQA部分的存储大约是MLA部分的25%。（计算可能有误）。 DroPE赋能MLA 如果DroPE的结论真的能scale up的话，MLA完全可以训练的时候使用RoPE这个“脚手架”，在推理的时候弃用。然后抛弃MQA使用纯粹的MLA。这会使得推理的时候速度更快，存储更低。 小道消息， FlashMLA 代码库最新更新显示，可能DeekseekV4确实抛弃了MQA的部分。至于具体怎么做的，我们拭目以待。 下面是原回答

[编辑于 2026-01-21 23:02](https://www.zhihu.com/question/1994493166221554651/answer/1997309968697804786) ・北京

#### 更多回答[收录于 · 成为一名伟大的炼丹师吧](https://www.zhihu.com/column/c_1748503766591082496)

![](https://pic1.zhimg.com/50/v2-53d83398ee30b9cd5460f5ca1c1d9b20_720w.jpg?source=1def8aca)

DroPE文中关于长上下文失效的实验结果

[查看全部 5 个回答](https://www.zhihu.com/question/1994493166221554651)