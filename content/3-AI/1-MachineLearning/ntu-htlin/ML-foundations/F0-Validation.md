---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2024-01-21 20:26:39
---
## Model Selection Problem

迄今为止我们学习了 ML 中许多概念，他们分属 ML 流程的各个阶段，诸如学习算法 $\mathcal{A}$ 、迭代轮次 $T$ 、迭代步长 $\eta$ 、转换函数 $\Phi$ 、正则化方法 $\Omega(\mathbf{w})$ 、正则限制 $\lambda$ ：
- ![[F0-Validation-flow-steps.png]]
- 这些方法的构成了大量的组合，从中如何选取应对目标问题最合适的方法组合呢？

选取最佳模型的问题可以更加规范的叙述如下：
- ![[F0-Validation-which-model-better.png]]
- 给定 *M* 个模型，它们分别来自假设集 $\mathcal{H}_{1},\mathcal{H}_{2},\mathcal{H}_{3},...,\mathcal{H}_{M}$ ，并通过 $\mathcal{A}_{1},\mathcal{A}_{2},\mathcal{A}_{3},...,\mathcal{A}_{M}$ 学习得来；
- 我们的目标是在某个假设集 $\mathcal{H}_{m^{*}}$ 中选取特定的假设 $g_{m^{*}}=\mathcal{A}_{m^{*}}(\mathcal{D})$ ，其能够获得较低的 $E_{out}$ ，
- 然而问题是我们并不知道具体的分布 $P(\mathbf{x})\& P(y|\mathbf{x})$ ，当然也就无从得知 $E_{out}$ ——这是 ML 中最关键的实操性问题。

### Why not Best $E_{in}$ ?

我们可以从所有假设中选取使得 $E_{in}$ 最小者吗？即 $m^{*}=arg\underset{1\le m\le M}{\min}(E_{m}=E_{in}(\mathcal{A}_{m}(\mathcal{D}))$ ？

当然不行，具体有以下几个原因：
1. 我们之前谈论过，高维假设集中获得的假设在 $E_{in}$ 上的表现通常优于低维假设集中的；同样，没有限制（即 $\lambda=0$）的表现也通常优于有限制时。但是这两种情况都有较大可能导致过拟合问题的发生；
2. 另外，如果算法 $\mathcal{A}_{1}$ 在假设集 $\mathcal{H}_{1}$ 中获得最小的 $E_{in}$ ，而算法 $\mathcal{A}_{2}$ 在假设集 $\mathcal{H}_{2}$ 中获得最小的 $E_{in}$ ，那么要找到 $g_{m^{*}}$，就要在两个假设集 $\mathcal{H}_{1}\cup\mathcal{H}_{2}$ 中选取，这时 VC dimension 将达到 $d_{VC}(\mathcal{H}_{1}\cup\mathcal{H}_{2})$ ，因此复杂度很大，不利于推广；

因此选取最小的 $E_{in}$ 是危险的、不可靠的。

### Why not a Fresh $\mathcal{D}_{test}$ ?

我们可以在一个新的数据集 $\mathcal{D}_{test}$ 上进行评估，选取使得最小的 $E_{test}$ 的假设吗？即 $m^{*}=arg\underset{1\le m\le M}{\min}(E_{m}=E_{test}(\mathcal{A}_{m}(\mathcal{D}))$ ？

尽管 Hoeffding 不等式可以确保这种推广是可信的：
$$
E_{out}(g_{m^{*}})\le E_{test}(g_{m^{*}})+O\left(\sqrt{\frac{\log M}{N_{test}}}\right)
$$
，但是 $\mathcal{D}_{test}$ 从何而来？难道拿着答案检验答案吗？这不过是自欺欺人罢了。

### Combination of $E_{in}$ and $E_{test}$ 

不过，我们比较、总结 $E_{in}$ 和 $E_{test}$ 这两种方式：
- ![[F0-Validation-Ein-vs-Etest.png]]
- 我们似乎可以结合二者的特点，推导出一种新的评估方式：计算数据集来自手头拥有的训练集 $\mathcal{D}$ ，并且**从中取出不被任何学习算法使用过的一小部分**：$\mathcal{D}_{val}$ ——自欺欺人，但是在自己的数据上😀

### 练习：理解最佳假设

![[F0-Validation-quiz-which-is-min-Ein.png]]

## Validation



## Leave-One-Out Cross Validation

## V-Fold Cross Validation