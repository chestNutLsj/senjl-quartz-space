# 注意力提示

感谢读者对本书的关注，因为读者的注意力是一种稀缺的资源：此刻读者正在阅读本书（而忽略了其他的书），因此读者的注意力是用机会成本（与金钱类似）来支付的。为了确保读者现在投入的注意力是值得的，作者们尽全力（全部的注意力）创作一本好书。

自经济学研究稀缺资源分配以来，人们正处在“注意力经济”时代，即**人类的注意力被视为可以交换的、有限的、有价值的且稀缺的商品**。许多商业模式也被开发出来去利用这一点：在音乐或视频流媒体服务上，人们要么消耗注意力在广告上，要么付钱来隐藏广告；为了在网络游戏世界的成长，人们要么消耗注意力在游戏战斗中，从而帮助吸引新的玩家，要么付钱立即变得强大。总之，注意力不是免费的。

***注意力是稀缺的***，而环境中的干扰注意力的信息却并不少。比如人类的视觉神经系统大约每秒收到$10^8$位的信息，这远远超过了大脑能够完全处理的水平。幸运的是，人类的祖先已经从经验（也称为数据）中认识到“并非感官的所有输入都是一样的”。在整个人类历史中，这种只将注意力引向感兴趣的一小部分信息的能力，使人类的大脑能够更明智地分配资源来生存、成长和社交，例如发现天敌、找寻食物和伴侣。

## 生物学中的注意力提示

注意力是如何应用于视觉世界中的呢？这要从当今十分普及的*双组件*（two-component）的框架开始讲起：这个框架的出现可以追溯到19世纪90年代的威廉·詹姆斯，他被认为是“美国心理学之父”[^1]。在这个框架中，受试者基于*非自主性提示*和*自主性提示*有选择地引导注意力的焦点。

> 心理学术语中描述为*不随意线索*和*随意线索*，本文中这些术语会与非自主性提示和自主性提示进行替换。

**非自主性提示是基于环境中物体的突出性和易见性**。想象一下，假如我们面前有五个物品：一份报纸、一篇研究论文、一杯咖啡、一本笔记本和一本书：
- ![[eye-coffee.svg]]
- 所有纸制品都是黑白印刷的，但咖啡杯是红色的。换句话说，==这个咖啡杯在这种视觉环境中是突出和显眼的，不由自主地引起人们的注意==。所以我们会把视力最敏锐的地方放到咖啡上，

喝咖啡后，我们会变得兴奋并想读书，所以转过头，重新聚焦眼睛，然后看看书：
- ![[eye-book.svg]]
- 与上一张图中由于突出性导致的选择不同，**此时选择书是受到了认知和意识的控制**，
- ==因此注意力在基于自主性提示去辅助选择时将更为谨慎。受试者的主观意愿推动，选择的力量也就更强大==。

## 查询、键和值

自主性的与非自主性的注意力提示解释了人类的注意力的方式，下面来看看如何通过这两种注意力提示，用神经网络来设计注意力机制的框架，

首先，考虑一个相对简单的状况，即只使用非自主性提示。要想将选择偏向于感官输入，则可以简单地使用参数化的全连接层，甚至是非参数化的最大汇聚层或平均汇聚层。因此，**“是否包含自主性提示”将注意力机制与全连接层或汇聚层区别开来**。

> 卷积、全连接层、汇聚层通常只考虑不随意线索，因为它们都暴力地将所有数据都直接输入到神经网络中，而不对目标加以区分。
> 
> 注意力机制则考虑随意线索。

在注意力机制中，自主性提示被称为*查询*（query），而非自主性提示（客观存在的咖啡杯和书本）作为*键*（key）与感官输入（sensory inputs）的*值*（value）构成一组 pair 作为输入。而给定任何查询，注意力机制通过*注意力汇聚*（attention pooling）将非自主性提示的 key 引导至感官输入。如下图所示，可以通过设计注意力汇聚的方式，便于给定的查询（自主性提示）与键（非自主性提示）进行匹配，这将引导得出最匹配的值（感官输入）：
- ![[qkv.svg]]

> 注意力机制通过注意力汇聚将*查询*（自主性提示）和*键*（非自主性提示）结合在一起，实现对*值*（感官输入）的**选择倾向**，这就是与 CNN 等模型的关键区别。 

上面的框架图所描述的模型是本章探讨的重点。然而，注意力机制的设计有许多替代方案。例如可以设计一个不可微的注意力模型，该模型可以使用强化学习方法[^2]进行训练。

## 注意力的可视化

平均汇聚层可以被视为输入的加权平均值，其中各输入的权重是一样的。实际上，**注意力汇聚得到的是加权平均的总和值，其中权重是在给定的查询和不同的键之间计算得出的**。

```python
from d2l import torch as d2l
import torch
```

为了可视化注意力权重，需要定义一个 `show_heatmaps` 函数。其输入 `matrices` 的形状是（要显示的行数，要显示的列数，查询的数目，键的数目）。

```python
#@save
def show_heatmaps(matrices, xlabel, ylabel, titles=None, figsize=(2.5, 2.5),
                  cmap='Reds'):
    """显示矩阵热图"""
    d2l.use_svg_display()
    num_rows, num_cols = matrices.shape[0], matrices.shape[1]
    fig, axes = d2l.plt.subplots(num_rows, num_cols, figsize=figsize,
                                 sharex=True, sharey=True, squeeze=False)
    for i, (row_axes, row_matrices) in enumerate(zip(axes, matrices)):
        for j, (ax, matrix) in enumerate(zip(row_axes, row_matrices)):
            pcm = ax.imshow(d2l.numpy(matrix), cmap=cmap)
            if i == num_rows - 1:
                ax.set_xlabel(xlabel)
            if j == 0:
                ax.set_ylabel(ylabel)
            if titles:
                ax.set_title(titles[j])
    fig.colorbar(pcm, ax=axes, shrink=0.6);
```

下面使用一个简单的例子进行演示。在本例子中，仅当查询和键相同时，注意力权重为1，否则为0。

```python
attention_weights = d2l.reshape(d2l.eye(10), (1, 1, 10, 10))
show_heatmaps(attention_weights, xlabel='Keys', ylabel='Queries')
```

![[10-attention-cues-heatmap.png]]

后面的章节内容将经常调用 `show_heatmaps` 函数来显示注意力权重。

## 小结

* 人类的注意力是有限的、有价值和稀缺的资源。
* 受试者使用非自主性和自主性提示有选择性地引导注意力。前者基于突出性，后者则依赖于意识。
* 注意力机制与全连接层或者汇聚层的区别源于增加的自主提示。
* 由于包含了自主性提示，注意力机制与全连接的层或汇聚层不同。
* 注意力机制通过注意力汇聚使选择偏向于值（感官输入），其中包含查询（自主性提示）和键（非自主性提示）。键和值是成对的。
* 可视化查询和键之间的注意力权重是可行的。

## 练习

1. 在机器翻译中通过解码序列词元时，其自主性提示可能是什么？非自主性提示和感官输入又是什么？
2. 随机生成一个 $10 \times 10$ 矩阵并使用 `softmax` 运算来确保每行都是有效的概率分布，然后可视化输出注意力权重。
```python
attention_weights = torch.rand(10, 10)  # generate 10x10 random matrix
m = torch.nn.Softmax(dim=0)  # softmax on dim0
out = m(attention_weights)  # apply softmax

# the following two lines are simply borrowed from the example
attention_weights = out.reshape((1, 1, 10, 10))
show_heatmaps(attention_weights, xlabel="Keys", ylabel="Queries")
```

[Discussions](https://discuss.d2l.ai/t/5764)

[^1]: James W. The principles of psychology[M]. Cosimo, Inc., 2007.
[^2]: Mnih V, Heess N, Graves A. Recurrent models of visual attention[J]. Advances in neural information processing systems, 2014, 27.