---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2024-01-25
---
## Motivation of Dual SVM

上节课提到，我们要实现非线性的 SVM ，就必须要借助特征转换这个工具：
$$
\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}\text{ s.t. }y_{n}(\mathbf{w}^{T}\underbrace{\mathbf{z}_{n}}_{\Phi(\mathbf{x}_{n})}+b)\ge1,\text{ for }n=1,2,...,N
$$
不过在涉及到特征转换时，要求解这个 QP 问题就会比较麻烦：
- ![[20-Dual-Support-Vector-Machine-nonlinear-QP.png]]
- 这里 $\tilde{d}$ 就是特征转换的空间维数，QP 的解法就与 $\tilde{d}+1$ 个变量和样本规模 $N$ 的限制有关，当 $\tilde{d}$ 非常大时，计算效率很低；

因此我们的目标是移除 SVM 在空间维数 $\tilde{d}$ 上的依赖：
- 我们提出等价的 SVM ，称为 Dual SVM（对偶支持向量机），其只与样本规模 N 有关：![[20-Dual-Support-Vector-Machine-equiv-SVM.png]]

那么如何实现这种等价互换呢？回想之前使用 [[E0-Regularization#Weight Decay Regularization|正则化]] 对高维空间的限制：
- ![[20-Dual-Support-Vector-Machine-lagrange-multiplier.png]]
- 在这里，左右两式可以通过求梯度 $\nabla E_{in}(\mathbf{w})+ \frac{2\lambda}{N}\mathbf{w}=0$ 建立联系，从而得知 $C$ 与 $\lambda(\ge 0)$ 实际上是等价的，在正则化中我们将 $\lambda$ 视作 $C$ 的一个替代；

那么在 Dual SVM 中，我们也将 $\lambda$ 视作未知的既定限制，作为变量来求解，并且 SVM 中限制条件数与输入样本的规模相同（限制条件为 $E_{in}=0$ ，即对所有输入样本的判断都正确），因此作为变量求出的 $\lambda$ 数量将会有 $N$ 个。故，原本有条件限制的 SVM 问题：
$$
\underset{b,\mathbf{w}}{\min} \frac{1}{2}\mathbf{w}^{T}\mathbf{w}\text{ s.t. }y_{n}(\mathbf{w}^{T}\mathbf{z}_{n}+b)\ge1,\text{ for }n=1,2,...,N
$$
就可以利用拉格朗日乘子 $\lambda_{n}\alpha_{n}$ 设立拉格朗日函数，求解极值：
$$
\mathcal{L}(b,\mathbf{w},\alpha)=\underbrace{\frac{1}{2}\mathbf{w}^{T}\mathbf{w}}_{\text{objective}}+\sum\limits_{n=1}^{N}\alpha_{n}(\underbrace{1-y_{n}(\mathbf{w}^{T}\mathbf{z}_{n}+b)}_{\text{constraint}})
$$
这里 objective 部分就是要求解的极小值的部分，constaint 部分就是限制条件 $\lambda_{n}$ （*这里与大陆课本的拉格朗日函数不同，$\alpha_{n}$ 实际上充作了课本中的那个作为限制条件的系数的 $\lambda$ ，这里的差异不过是为了前后 $\lambda$ 符号的含义统一，无需疑虑*）

现在，我们可以将 SVM 问题看作是求解拉格朗日函数的问题：
$$
SVM\equiv\underset{b,\mathbf{w}}{\min}\left(\underset{\text{all }\alpha_{n}\ge 0}{\max}\mathcal{L}(b,\mathbf{w},\alpha)\right)
$$
这里要分析，
- 如果拉格朗日函数中限制条件 $1-y_{n}(\mathbf{w}^{T}\mathbf{z}_{n}+b)$ 为正，说明这样的 $\mathbf{w}$ 违反了限制，要使得拉格朗日函数最大，就会一直增长到无穷大；
- 而若限制条件为负，则说明可行，因此拉格朗日函数最大也不超过 $\frac{1}{2}\mathbf{w}^{T}\mathbf{w}$ ；

最终，我们将 SVM 中的限制纳入了对拉格朗日函数求最值的问题中。

### 练习：写出拉格朗日函数的形式

![[20-Dual-Support-Vector-Machine-quiz-lagrange.png]]

## Lagrange Dual SVM



## Solving Dual SVM

## Message behind Dual SVM