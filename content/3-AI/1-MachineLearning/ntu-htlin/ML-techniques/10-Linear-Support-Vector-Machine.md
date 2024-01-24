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

为了解这个标准问题，我们考虑一种简单情形：现有四个样本点，分别特征向量和标签为：
$$
\rm X=\begin{bmatrix}0\ 0\\2\ 2\\2\ 0\\3\ 0\end{bmatrix},\mathbf{y}=\begin{bmatrix}-1\\-1\\+1\\+1 \end{bmatrix}
$$ 
，因此待定系数求解分类器的方程组为：
$$
\begin{cases}-b\ge 1,\\-2w_{1}-2w_{2}-b\ge 1,\\2w_{1}+b\ge 1,\\3w_{1}+b\ge 1\end{cases}
$$
，最终可以解得 $w_{1}\ge +1,w_{2}\le -1$ ，这样就有 $\mathbf{w}^{T}\mathbf{w}\ge 2$ ，上文我们在这个权重向量的内积前多乘了一个 $\frac{1}{2}$ ，这样就得到 $\frac{1}{2}\mathbf{w}^{T}\mathbf{w}\ge 1$ 。

因此要使得 $\frac{1}{2}\mathbf{w}^{T}\mathbf{w}$ 最小，即等于 1 ，此时可以设 $w_{1}=1,w_{2}=-1,b=-1$ ，即分类器的数学表达形式为 $g_{\text{SVM}}(\mathbf{x})=\text{sign}(x_{1}-x_{2}-1)$ 。等等，哪里蹦出一个 SVM ？
- 在这个特殊情形中，四个样本点中有三个处于边界上，它们到分类器的距离为 $\frac{1}{||\mathbf{w}||}=\frac{1}{\sqrt{2}}$ ：![[10-Linear-Support-Vector-Machine-SVM.png]]
- 在这类问题中只有处于边界上的点才有考虑的价值，因此 ML 中称为 ***support vector*** （虽然这里其实是候选 candidate ，但这个会在后续课程解释，这里只需要了解）
- 因此所谓 ***support vector machine*** ，就是可以从 largest-margin hyperplanes 中学习的模型；

### General SVM: QP problem

不过从这个特殊情形向一般化推广比较麻烦，我们可以先从问题的特征入手：
$$
\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}\text{ s.t. }y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)\ge 1,\text{for all }n\ 
$$
这里 SVM 的数学形式是一个二次函数，参数为 $(b,\mathbf{w})$ ，其受线性条件约束，条件的参数也是 $(b,\mathbf{w})$ ，这类问题称为 [Quadratic Programming](https://en.wikipedia.org/wiki/Quadratic_programming?useskin=vector) 问题，已有前人做了详尽的实现，我们现在只需要套用：
- 左边是我们现在的问题，右边是常规 QP 问题的形式，因此只要找到我们问题中什么对应 QP 问题的 $Q,p,A,c$ 四个参数，然后代入 QP solver 中运算即可： ![[10-Linear-Support-Vector-Machine-QP.png]]
- QP 问题的解决方案在各类 ML 平台/框架上都有实现，比如：
	- [LIBSVM -- A Library for Support Vector Machines](https://www.csie.ntu.edu.tw/~cjlin/libsvm/)
	- [GitHub - qpsolvers/qpsolvers: Quadratic programming solvers in Python with a unified API](https://github.com/qpsolvers/qpsolvers)

另外我们需要知道这里谈论的 SVM 实际上是一种 hard-margin 、linear 的模型，即边界是硬性规定的、样本空间是线性的。若要得到非线性的 SVM？那就使用特征转换吧！

### 练习：找到 QP solver 的参数

![[10-Linear-Support-Vector-Machine-quiz-QP-solver.png]]

## Reasons behind Large-Margin Hyperplane