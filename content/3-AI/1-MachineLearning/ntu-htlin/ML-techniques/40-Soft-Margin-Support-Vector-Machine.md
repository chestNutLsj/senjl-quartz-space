---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2024-01-29
---
## Motivation and Primal Problem

### Soft-Margin SVM

前三节讨论的都是 Hard-Margin SVM ，即要求所有对样本的判断都要正确：
$$
\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}\text{ s.t. }y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)\ge 1,\text{for all }n\ 
$$
这样的缺点就是在有噪音的数据集中，会导致过拟合现象发生：
![[40-Soft-Margin-Support-Vector-Machine-overfit-risk.png]]

因此，为了避免过拟合现象，我们必须考虑舍弃这些噪音样本。回想 [[20-Learning-to-Answer-Y-N#Learning with Noisy Data|pocket]] 算法中对噪音样本的处理：$\underset{b,\mathbf{w}}{\min}\sum\limits_{n=1}^{N}[y_{n}\ne \text{sign}(\mathbf{w}^{T}\mathbf{z}_{n}+b)]$ ，我们可以结合 pocket 和 hard-margin SVM ，以实现对噪音容忍的 ***soft-margin SVM*** ：
$$
\begin{aligned}
&\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}+C\cdot\sum\limits_{n=1}^{N}[y_{n}\ne \text{sign}(\mathbf{w}^{T}\mathbf{z}_{n}+b)]\\
&\color{red}\text{ s.t. }\color{black}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)\ge 1,\text{for correct }n\ \\
&\quad \quad y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)> -\infty,\text{ for incorrect }n
\end{aligned}
$$
- 这里目标中的 $C$ 作用是对 SVM 的 margin 宽度和噪音容忍度的权衡，
- 限制条件中对正确的样本点要判断正确，而对噪音点的样本判断结果不至于过大；

### Solution of Soft-Margin SVM

对 soft-margin SVM 的假设仔细察看，可以很容易发现，这里 $[y_{n}\ne \text{sign}(\mathbf{w}^{T}\mathbf{z}_{n}+b)]$ 并不是线性的条件，它是对每个样本的 label 和预测的正误判断，因此就不是 QP 问题，而之前讨论的 Dual SVM 、Kernel SVM 在这里也就不再适用。😢

并且，我们这样笼统地说判断结果与实际 label 的差异不致于过大（即， $> -\infty$），这也未免太过宽松。毕竟，有的预测可能仅与 boundary 差距毫厘，而有的预测却谬之千里，我们上面的 soft-margin SVM 不能很好地区分这两种预测错误，因此势必要对 soft-margin SVM 的假设做进一步改进。

我们提出对判断与 label 差距程度的考量，即 margin violation ，记作 $\xi_{n}$ ，通过对 margin violation 的惩罚代替犯错数的限制，从而转化为 linear constraints 的 QP 问题。于是 soft-margin SVM 的假设修改为：
$$
\begin{aligned}
&\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}+C\cdot\sum\limits_{n=1}^{N}\xi_{n}\\
&\color{red}\text{ s.t. }\color{black}y_{n}(\mathbf{w}^{T}\mathbf{x}_{n}+b)\ge 1-\xi_{n},\quad\text{and } \xi_{n}\ge0\text{ for all }n
\end{aligned}
$$
- 这里 $C$ 的作用仍然没有变化，但是更进一步地可以理解为调节 margin length 和 margin violation 的权重，大 $C$ 代表对噪音的容忍度更低；而小 $C$ 代表更大的 margin ，提高对噪音的容忍度；

于是，soft-margin SVM 就转化为 $\tilde{d}+1+N$ 个变量、$2N$ 个条件限制的 QP 问题，我们可以从此推导出 Dual Soft-Margin SVM ，进行更细致的考量。

### 练习：理解 margin violation

![[40-Soft-Margin-Support-Vector-Machine-quiz-margin-violation.png]]

## Dual Problem

实现 soft-margin SVM 的对偶问题转化，同样离不开拉格朗日函数：
$$
\begin{aligned}
\mathcal{L}(b,\mathbf{w},\xi,\alpha,\beta)=&\frac{1}{2}\mathbf{w}^{T}\mathbf{w}+C\sum\limits_{n=1}^{N}\xi_{n}\\
&+\sum\limits_{n=1}^{N}\alpha_{n}\cdot\left(1-\xi_{n}-y_{n}(\mathbf{w}^{T}\mathbf{z}_{n}+b)\right)+\sum\limits_{n=1}^{N}\beta_{n}\cdot(-\xi_{n})
\end{aligned}
$$
- 这里 $\alpha_{n},\beta_{n}$ 即是计算拉格朗日函数的两个限制的系数；

同理，我们要得到的拉格朗日对偶问题，形式如下：
$$
\begin{aligned}
&\underset{\alpha_{n}\ge0,\beta_{n}\ge0}{\max} \left(\underset{b,\mathbf{w},\mathbf{\xi}}{\min}\mathcal{L}(b,\mathbf{w},\xi,\alpha,\beta)\right)\\
\end{aligned}
$$
类似地，我们要求解这个对偶问题，首先要进行化简。先要在 $\mathcal{L}(b,\mathbf{w},\xi,\alpha,\beta)$ 中找到极小值，因此极小点处有：
$$
\frac{\partial\mathcal{L}}{\partial\xi_{n}}=0=C-\alpha_{n}-\beta_{n}
$$
和之前一样，我们按图索骥：直接将 $C-\alpha_{n}-\beta_{n}=0$ 作为限制，于是可以移除拉格朗日对偶问题中的 $\xi_{n}$ ：
$$
\begin{aligned}
&\underset{0\le\alpha_{n}\le C,\beta_{n}=C-\alpha_{n}}{\max} \left(\underset{b,\mathbf{w}}{\min}\frac{1}{2}\mathbf{w}^{T}\mathbf{w}+\sum\limits_{n=1}^{N}\alpha_{n}(1-y_{n}(\mathbf{w}^{T}\mathbf{z}_{n}+b))\right)\\
\end{aligned}
$$
- 这里之所以 $\alpha_{n}$ 的限制变为 $0\le\alpha_{n}\le C$ ，是因为 $\beta_{n}$ 发生了变化，并且要保证 $\alpha_{n}\ge0,\beta_{n}\ge0$ ；

现在，我们再细细查看简化后的拉格朗日对偶问题，似乎和之前 [[20-Dual-Support-Vector-Machine#Solution for Langrange Dual Problem|Dual hard-margin SVM]] 有些相似？仔细对比，实际上二者差异仅仅是限制条件，因此我们可以依葫芦画瓢，进一步实现化简：
- 由于极小值点 $\frac{\partial\mathcal{L}}{\partial b}=0$ ，因此我们可以得到限制条件 $\sum\limits_{n=1}^{N}\alpha_{n}y_{n}=0$ ；
- 并且 $\frac{\partial\mathcal{L}}{\partial w_{i}}=0$ ，我们可以得到限制条件 $\mathbf{w}=\sum\limits _{n=1}^{N}\alpha_{n}y_{n}\mathbf{z}_{n}$ ；

因此，最终化简后的 Soft-Margin SVM Dual 为：
$$
\begin{aligned}
&\underset{\mathbf{\alpha}}{\min} \frac{1}{2}\sum\limits_{n=1}^{N}\sum\limits_{m=1}^{N}\alpha_{n}\alpha_{m}y_{n}y_{m}\mathbf{z}_{n}^{T}\mathbf{z}_{m}-\sum\limits_{n=1}^{N}\alpha_{n}\\
&\color{red}\text{ s.t. }\color{black}\sum\limits_{n=1}^{N}y_{n}\alpha_{n}=0,0\le\alpha\le C\text{ for n}=1,2,...,N
\end{aligned}
$$
- 其中暗含的条件就是 $\mathbf{w}=\sum\limits _{n=1}^{N}\alpha_{n}y_{n}\mathbf{z}_{n}$ 和 $\beta_{n}=C-\alpha_{n},\text{for }n=1,2,...,N$ 

这样，我们通过对偶问题的转化，得到了仅有 $N$ 个变量、$2N+1$ 个限制的 QP 问题。

### 练习：理解 primal 问题中 C 的影响

![[40-Soft-Margin-Support-Vector-Machine-quiz-parameter-C.png]]


## Message behind Soft-Margin SVM

## Model Selection