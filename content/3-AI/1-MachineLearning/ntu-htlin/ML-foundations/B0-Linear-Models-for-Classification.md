---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
---
## Linear Models for Binary Classification

回想之前学过的三种线性模型，它们的共同点是计算分数的 scoring function 都是线性的：$s=\mathbf{w}^{T}\mathbf{x}$ ，最关键的差别就是对这个 score 的处理函数，并由此导致错误估计的不同：
- ![[B0-Linear-Models-for-Classification-different-linear-model.png]]
- 我们曾考虑使用 [[90-Linear-Regression#Linear Regression for Binary Classification|线性回归策略]] 缩短二元分类问题的迭代时间， Logistic Regression 的梯度下降策略也可以快速地找到最小的 $E_{in}(\mathbf{w})$ （至少比 NP-hard 复杂度高效得多），如何使用 Logistic Regression 优化二元分类问题呢？我们接下来就探讨这个。

### Summary for Error Evaluating

来回顾一下这三个模型在二元分类问题上的错误评估函数：
- ![[B0-Linear-Models-for-Classification-error-evaluate.png]]
- 将三者用相同的参数统一表达，我们得到了上面的错误评估函数形式，其中 $ys$ 的物理意义是分类问题中分类正确的程度，其正负表明分类是否正确，其值越大则越正确；
- 将这三个函数可视化：![[B0-Linear-Models-for-Classification-visualizing-error.png]] 可以总结出以下这些结论：
	- 当 $|ys|\rightarrow 1$ 时，线性回归的错误评估 $\text{err}_{SQR}$ 很小，但在 $|ys|\rightarrow\infty$ 时，反而增大（无论正负），回想之前说 $\text{err}_{SQR}$ 是 $\text{err}_{0/1}$ 的宽松上界，在 $|ys|$ 较大时尤为如此，在 $|ys|\rightarrow1$ 时才勉强可以认为 $\text{err}_{0/1}\approx\text{err}_{SQR}$ ；
	- Logistic Regression 的错误评估 $\text{err}_{CE}$ 是一个单调递减的函数，不过根据图像可知，当 $\text{err}_{CE}$ 足够小时，也可以认为 $\text{err}_{CE}\approx\text{err}_{0/1}$ ；
	- 另外原始的 $\text{err}_{CE}$ 是 $\ln$ 形式的，它与 $\text{err}_{0/1}$ 有两个交点，我们换底成 $\log_{2}$ 形式，则转换成下图：![[B0-Linear-Models-for-Classification-visualizing-2.png]]

由此，我们再对错误评估函数做一些放缩：考虑到 
$$
\text{err}_{0/1}(s,y)\le\text{err}_{SCE}(s,y)=\frac{1}{\ln2}\text{err}_{CE}(s,y)
$$
，可以认为在 $E_{in}$ 上满足 
$$
E_{in}^{\text{0/1}}(\mathbf{w})\le E_{in}^{\text{SCE}}(\mathbf{w})=\frac{1}{\ln2}E_{in}^{\text{CE}}(\mathbf{w})
$$
，从而在 $E_{out}$ 上满足 
$$
E_{out}^{\text{0/1}}(\mathbf{w})\le E_{out}^{\text{SCE}}(\mathbf{w})=\frac{1}{\ln2}E_{out}^{\text{CE}}(\mathbf{w})
$$
，因此回想之前 [[70-The-VC-Dimension#Penalty for Model Complexity|VC Dimension]] 中关于 $E_{in}$ 和 $E_{out}$ 的关系：
$$
E_{out}^{\text{0/1}}(\mathbf{w})\le E_{in}^{\text{0/1}}(\mathbf{w})+\Omega^{\text{0/1}}
$$
，我们可以放缩 $E_{out}^{\text{0/1}}$ 为：
$$
\begin{aligned}
E_{out}^{\text{0/1}}(\mathbf{w})&\le \frac{1}{\ln2}E_{out}^{\text{CE}}(\mathbf{w})\\
&\le \frac{1}{\ln2}E_{in}^{\text{CE}}(\mathbf{w})+ \frac{1}{\ln2}\Omega^{\text{CE}}
\end{aligned}
$$
，因此我们有理由相信，足够小的 $E_{in}^{\text{CE}}$ 也能够得到足够小的 $E_{out}^{\text{0/1}}$ 。

### Regression for Classification

因此，无论线性回归还是 Logistic Regression，我们都论证了其用于二元分类问题的可行之处：
- ![[B0-Linear-Models-for-Classification-regression-for-calssification.png]]
- 综合起来，我们可以用线性回归找到较好的 $\mathbf{w}_{0}$ 作为起始，然后再运行 PLA/pocket/Logistic Regression 这些算法。

## Stochastic Gradient Descent

我们学习了两种迭代式的优化方法，一种是 PLA 风格的，一种是 pocket 或 Logistic Regression 风格的：
- 不过这两者在每轮迭代的时间复杂度相去甚远：![[B0-Linear-Models-for-Classification-complexity-two-iterative-optimization.png]]

### Decrease the Iterative Complexity

如何将 Logistic Regression 的每轮复杂度也降低到 $\mathcal{O}(1)$ 呢？回想其迭代的公式：
$$
\mathbf{w}_{t+1}\leftarrow \mathbf{w}_{t}-\eta\underbrace{\frac{1}{N}\sum\limits_{n=1}^{N}\theta(-y_{n}\mathbf{w}_{t}^{T}\mathbf{x}_{n})(-y_{n}\mathbf{x}_{n}))}_{-\nabla E_{in}(\mathbf{w}_{t})}
$$
，我们想要更新方向是趋于单位长度的，这里**经过连加后求平均**的式子是 $\mathcal{O}(N)$ 的罪魁祸首，因此为了优化复杂度，我们选择在 n 个输入中随机地挑选一个，那么在**期望上是接近平均值**的（类比：要求 1~999 的平均数，连加起来复杂度很高，而随机抽一个数，这个数在平均数 500 附近的概率就会服从均匀分布），这就是 ***stochastic gradient*** ：在随机的 n 上做偏微分 $\nabla_{\mathbf{w}}\text{err}(\mathbf{w},\mathbf{x}_{n},y_{n})$ ，此时，真正的微分形式就变成：
$$
\nabla_{\mathbf{w}}E_{in}(\mathbf{w})=\underset{\text{random }n}{\epsilon}\nabla_{\mathbf{w}}\text{err}(\mathbf{w},\mathbf{x}_{n},y_{n})
$$

### Understand SGD

如何理解 SGD？实际上，随机梯度可以看作是真实梯度和“噪音”的混合：
$$
\rm stochastic\ gradient=true\ gradient+\text{`noise' }directions
$$
，因此将真实梯度换作随机梯度，就是**随机梯度下降**。
- 经过足够轮次的迭代，我们可以期望地认为，$\rm average\ true\ gradient\approx average\ stochastic\ average$ ；
- SGD 的优势是简单、高效，尤其是在==大量数据==和==在线学习==两种情况中；但是相应的，会导致运行过程不够稳定，因此只能通过增加迭代轮次来提高稳定结果的概率；

SGD 的迭代公式可以写作：
$$
\mathbf{w}_{t+1}\leftarrow \mathbf{w}_{t}+\eta\underbrace{\theta(-y_{n}\mathbf{w}_{t}^{T}\mathbf{x}_{n})(y_{n}\mathbf{x}_{n}))}_{-\nabla \text{err}(\mathbf{w}_{t},\mathbf{x}_{n},y_{n})}
$$
，这看起来与 PLA 的迭代公式十分类似：
$$
\mathbf{w}_{t+1}\leftarrow \mathbf{w}_{t}+1\cdot[y_{n}\ne \text{sign}(\mathbf{w}_{t}^{T}\mathbf{x}_{n})](y_{n}\mathbf{x}_{n})
$$
，实际上 SGD Logistic Regression 可以看作“soft”PLA ；或者在 $\eta=1$ 且当 $\mathbf{w}_{t}^{T}\mathbf{x}_{n}$ 足够大时，可以认为 $\rm PLA\approx SGD$ ；

在使用 SGD 时有两点值得注意：
1. 何时停止？由于 SGD 的原理，我们不方便计算确切的梯度，因此考虑运行足够多轮次时就停止；
2. $\eta$ 取何值？经验上，$\eta=0.1$ 比较合适；

### 练习：应用 SGD 策略

![[B0-Linear-Models-for-Classification-quiz-SGD-apply.png]]
- 从物理意义上讲，**残差越大就更新越多**，所谓残差就是 $y_{n}$ 与 $\mathbf{w}_{t}^{T}\mathbf{x}_{n}$ 的差值，代表着实际与预测的差距；

## Multiclass via Logistic Regression

## Multiclass via Binary Classification