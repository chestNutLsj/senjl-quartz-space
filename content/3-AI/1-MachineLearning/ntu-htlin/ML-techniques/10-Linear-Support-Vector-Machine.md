---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
  - SVM
date: 2024-01-23
---
## Large-Margin Separating Hyperplane

在线性分类问题中我们学习了 [[20-Learning-to-Answer-Y-N#Perceptron Learning Algorithm|PLA/pocket]] 算法，我们可以使用这两种算法在线性可分数据集上找到正确的分类器，但由于 PLA [[20-Learning-to-Answer-Y-N#Guarantee of PLA|遇错更新]] 的特点，找到哪一个分类器是随机的：
- ![[10-Linear-Support-Vector-Machine-which-rightmost.png]]

那么哪个分类器是最好的呢？这里，我们必须要考虑数据集（包括测试集）中**有噪音**的问题，并且 [[D0-Hazard-of-Overfitting#^7cb896|噪音通常服从正态分布]] ：
- 因此数据样本到分类器的最小距离越远，代表着**对噪音的容忍度越高**，而 [[D0-Hazard-of-Overfitting#How Overfitting Occurs？|噪音又与过拟合问题]] 密切相关，因此**离所有数据样本都远的分类器应对过拟合现象的健壮性越好**：![[10-Linear-Support-Vector-Machine-fat-hyperplane.png]]
- 上图中从两个角度分析了样本到分类器的最小距离，因此第三个分类器的健壮性最好，是最优的分类器；
- 在 ML 中这样的“数据样本到分类器的最小距离”称为 ***margin*** ，即分类器的边。

因此要找到最好的分类器，我们可以将其数学化为以下的描述：
$$
\underset{\mathbf{w}}{\max}\text{ margin}(\mathbf{w})\text{ s.t. }
\begin{cases}
\text{every }y_{n}\mathbf{w}^{T}\mathbf{x}_{n}>0\ , \\ \\ 
\text{margin}(\mathbf{w})=\underset{n=1,2,...,N}{\min}\text{distance}(\mathbf{x}_{n},\mathbf{w})
\end{cases}
$$
即，**分类器既要正确地实现分类，又要保证 margin 最大**。

### 练习：找到 largest-margin 的分类器

![[10-Linear-Support-Vector-Machine-quiz-largest-margin.png]]

## Standard Large-Margin Problem

在进一步简化这个找到最大 margin 的问题之前，我们对之前的符号做一些调整：
- 《基石》中设置权重向量中有一个特殊的维度 $w_0$ ，在这里我们将其分离出来，单独称作 $b$ ，而特征向量中 $x_{0}$ 则删去；
- 在这里假设函数形式如下：$h(\mathbf{x})=\text{sign}(\mathbf{w}^{T}\mathbf{x}+b)$ ；

现在，我们先对 $\text{distance}(\mathbf{x},b,\mathbf{w})$ 函数进行一些探讨：
- 对于分类器（hyperplane），我们设置其函数为 $\mathbf{w}^{T}\mathbf{x}+b=0$ ，因此对任意两个分类器上的样本点 $\mathbf{x}^{'}$ 和 $\mathbf{x}^{''}$ ，都可以构成一条 $\mathbf{x}^{'}\to \mathbf{x}^{''}$ 的向量，并且有 $\mathbf{w}^{T}\mathbf{x}^{'}=-b$ 、$\mathbf{w}^{T}\mathbf{x}^{''}=-b$ ，
- 从而 $\mathbf{w}^{T}(\mathbf{x}^{'}-\mathbf{x}^{''})=0$ ，这意味着向量 $\mathbf{w}$ 是垂直于分类器的：![[10-Linear-Support-Vector-Machine-hyperplane.png]]
- 因此**距离函数可以看作是两点函数在垂直方向上的投影**（project）：$\text{distance}(\mathbf{x},b,\mathbf{w})=\left|\frac{\mathbf{w}^{T}}{||\mathbf{w}||}(\mathbf{x}-\mathbf{x}^{'})\right| =\frac{1}{||\mathbf{w}||}|\mathbf{w}^{T}\mathbf{x}+b|$ ，
- 而对于线性分类问题，正确的分类会使得 label 与距离同号，因此可以脱去绝对值：$\text{distance}(\mathbf{x}_{n},b,\mathbf{w})=\frac{1}{||\mathbf{w}||}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)$ ；

因此，现在我们可以将选取最佳分类器的问题描述为：
$$
\underset{b,\mathbf{w}}{\max}\text{ margin}(b,\mathbf{w})\text{ s.t. }
\begin{cases}
\text{every }y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)>0\ , \\ \\ 
\text{margin}(b,\mathbf{w})=\underset{n=1,2,...,N}{\min}\frac{1}{||\mathbf{w}||}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)
\end{cases}
$$
而对于分类器 $\mathbf{w}^{T}\mathbf{x}+b=0$ 其与 $3\mathbf{w}^{T}\mathbf{x}+3b=0$ 的不同只是等比例放缩，因此同样的道理，我们可以将 $\underset{n=1,2,..., N}{\min}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)$ 放缩为 1 ，即 $\underset{n=1,2,..., N}{\min}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)=1$ ，此时 margin 函数的形式就变成 $\text{margin}(b,\mathbf{w})=\frac{1}{||\mathbf{w}||}$ ，因此原来的问题经过放缩后就变为：
$$
\underset{b,\mathbf{w}}{\max} \frac{1}{||\mathbf{w}||}\text{ s.t. }\underset{n=1,2,...,N}{\min}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)=1

$$
这里能够舍去第一个 $\text{every }y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)>0$ 的限制的原因是放缩为 1 的过程中必然要满足。

进一步地，考虑 $\underset{n=1,2,...,N}{\min}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)=1$ 可以如何简化？我们可以用反证法证明，其可以放宽为 $y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)\ge 1$ ，但同时这个等号必然会成立：
- ![[10-Linear-Support-Vector-Machine-constraint-transform.png]]
最后，要求得 $\frac{1}{||\mathbf{w}||}$ 最大，就要 $||\mathbf{w}||$ 最小，而 $||\mathbf{w}||=\sqrt{\mathbf{w}^{T}\mathbf{w}}$ ，因此最终我们可以得到对最佳分类器的选择问题描述为：
$$
\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}\text{ s.t. }y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)\ge 1,\text{for all }n\ 

$$
（这里冒出一个 $\frac{1}{2}$ 虽然很突兀，但在下文有所解释）

### 练习：理解到分类器的距离

![[10-Linear-Support-Vector-Machine-quiz-distance.png]]

## Support Vector Machine

## Reasons behind Large-Margin Hyperplane