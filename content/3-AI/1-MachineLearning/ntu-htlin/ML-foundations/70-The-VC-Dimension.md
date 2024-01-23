---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2024-01-07
---
## Definition of VC Dimension

### Probably Learning

上节课我们证明了 $m_{\mathcal{H}}(N)\text{ of break point }k\le B(N,k)=\sum\limits_{i=0}^{k-1}\binom{N}{i}=\mathcal{O}(N^{k-1})$ ，那么联系 ML 的整个流程，我们可以推断出：对任何 $g=\mathcal{A}(\mathcal{D})\in\mathcal{H}$，在足够大的取样 $\mathcal{D}$ 上，由 Hoeffding 不等式可知，
$$
\begin{aligned}
&\text{Prob}[|E_{in}(g)-E_{out}(g)|>\epsilon]\\
&\le \text{Prob}[\exists h\in\mathcal{H},\text{s.t. }|E_{in}(g)-E_{out}(g)|>\epsilon]\\
&\le 4m_{\mathcal{H}}(2N)e^{-\frac{1}{8}\epsilon^{2}N}\\
&\underset{k \text{ exists}}{\le} 4(2N)^{k-1}e^{-\frac{1}{8}\epsilon^{2}N}
\end{aligned}
$$

这告诉我们，如果
- 有一个**好的假设集** $\mathcal{H}$，即 $m_{\mathcal{H}}$ 会在 $k$ 处 break ；
- 有一个**好的取样** $\mathcal{D}$，即 $N$ 足够大，那么可以 probably 地认为 $E_{out}\approx E_{in}$ ；
- 有一个**好的学习算法** $\mathcal{A}$，即 $\mathcal{A}$ 能够取到一个 $E_{in}$ 很小的对目标函数的估计 *g* ，那么 learning 是 probably 可以做到的，且有意义的。

### VC Dimension and Learning

前文中一个关键的概念是 break point $k$ ，而此处我们将 VC Dimension 定义为：the formal name of maximum non-break point，即最大的非间断点
- 记作 $d_{VC}(\mathcal{H})$，即对假设集 $\mathcal{H}$，其 VC Dimension 为最大的满足 $m_{\mathcal{H}}(N)=2^N$ 的点，
- 换句话说，$d_{VC}=\min(k)-1$ ，
- 如此一来，对输入样本数 $N\le d_{VC}$ 时，则 $\mathcal{H}$ **能够**（不是必然） shatter $N$ 个输入中的一部分。

按照上节课的举例，同样对应了四种 VC Dimension：
- ![[70-The-VC-Dimension-4-vc-dimension.png]]
- 因此，只要 $d_{VC}$ 是有限的，那么就称为“好的”、“可行的”、“复杂度足够令人满意”的假设集；

那么，VC Dimension 对 ML 的意义是什么呢？即，**只要存在有限大小的 $d_{VC}$，那么对目标函数的估计 *g* 就是可以采用、信任、一般化的**：
- ![[70-The-VC-Dimension-VC-dimension-learning.png]]
- 不必考虑学习算法（只是影响 $E_{in}$ 的大小而已，但不改变 $E_{out}\approx E_{in}$ 的事实）、输入的分布情况、目标函数的实际形式等诸多因素，从而证明 ML 是可行的！

### 练习：理解 VC Dimension

![[70-The-VC-Dimension-quiz-vc-dimension.png]]

## VC Dimension of Perceptrons

回想之前线性划分的 *PLA* 的问题中，我们通过以下两个方面论证了 ML 的可行性：
1. 训练集 $\mathcal{D}$ 是线性可分的，因此 PLA 能够最终停止，即在足够轮次的运行后，能够找到对目标函数 *f* 的最佳估计 *g* ，使得 $E_{in}(g)=0$ ；
2. 如果样本数据服从特定分布 $\mathbf{x}\sim P$ ，并且存在目标函数 *f* 使得 $y_{n}=f(\mathbf{x}_{n})$，那么由 Hoeffding 不等式及该问题的 $d_{VC}=3$ 可知，当采样数 *N* 足够大时，有 $E_{out}(g)\approx E_{in}(g)$，进而 $E_{out}(g)\approx 0$ ；

> 那么，如果在更高维问题上，$d_{VC}$ 又是怎样的？*PLA* 还能继续有效吗？

### Calculate VC Dimension

注意到在 1 维 perceptron （如 postive rays 问题）上 $d_{VC}=2$ ，在 2 维 perceptron 问题上 $d_{VC}=3$（[[50-Training-versus-Testing#Infinite to finite|回想是如何证明的？]]），那么不妨猜测，d 维 perceptron 上 $d_{VC}=d+1$，要证明之，则可用夹逼法：
1. 证明 $d_{VC}\ge d+1$：
	- 首先要确定如何描述这个命题？![[70-The-VC-Dimension-dvc>=d+1.png]] 即，**只要存在一种 $d+1$ 个输入的样例使得 $m_{\mathcal{H}}(d+1)=2^{d+1}$ ，就能说明 $d_{VC}\ge d+1$** 。
	- 因此接下来考虑一种特殊情形：![[70-The-VC-Dimension-trivial-inputs.png]] 这个矩阵 $\mathrm{X}$ 是**可逆**的，要使其可被长度为 $d+1$ 的向量 shatter ，即对任何 $\mathbf{y}=\begin{bmatrix}y_{1},\\ y_{2},\\...,\\ y_{d+1}\end{bmatrix}$，找到对应的 $\mathbf{w}$ 能够满足 $\text{sign}(\rm X\mathbf{w})=\mathbf{y}\Longleftrightarrow(\rm X\mathbf{w})=\mathbf{y}\Longleftrightarrow \mathbf{w}=\mathrm{X}^{-1}\mathbf{y}$ ，即能够说明这样一个特殊的矩阵 $\rm X$ 能够实现 $d_{VC}\ge d+1$ 的要求；

2. 证明 $d_{VC}\le d+1$：
	- 同样的，这个命题要如何描述？![[70-The-VC-Dimension-dVC<=d+1.png]] 与证明 ≥ 不同，此处要求**任何 $d+2$ 长度的输入都无法 shatter**。
	- 我们以下面一个特殊例子说明：![[70-The-VC-Dimension-linear-dependence.png]] 对于矩阵 $\rm X=\begin{bmatrix}1,0,0\\1,1,0\\1,0,1\\1,1,1\end{bmatrix}$ ，代表了 4 个输入，其中第一列是 0 维数据，不必考虑；而第二列、第三列所表示的输入分别为 $\mathbf{x}_{1}=(0,0), \mathbf{x}_{2}=(0,1), \mathbf{x}_{3}=(1,0)$ 这三个之前可以 shatter 的点，若再增加一个点，则第四个点必然与前三者线性相关，即可以表示成 $\mathbf{x}_{4}=\mathbf{x}_{2}+\mathbf{x}_{3}-\mathbf{x}_{1}$ ，由此，若 $f(\mathbf{x}_{2})=f(\mathbf{x}_{3})=\circ,f(\mathbf{x}_{1})=\times$ ，那么 $f(\mathbf{x}_{4})=\circ$ 是必然的而不会存在 $f(\mathbf{x}_{4})=\times$ 的可能，即不会存在 $\{\circ,\times,\circ,\times\}$ 这种 dichotomy 的情形，这也就从代数上证明了 [[50-Training-versus-Testing#Infinite to finite|4个输入时无法shatter的原因]] 。即，**线性相关性会限制可以产生 dichotomy 的数量**。
	- 如果推广到一般性的 $d+2$ 个长度的向量呢？![[70-The-VC-Dimension-d-D-d+2.png]] $d+2$ 个输入即行数为 $d+2$，但列数仍是 $d+1$，线性代数告诉我们这样的输入矩阵一定时线性相关的，由数学归纳，dichotomy 的数量必然是受限的，故 $d_{VC}\le d+1$ 得证。

## Physical Intuition of VC Dimension

上面的论证多少看着一头雾水，说了半天究竟什么是 VC Dimension？实际上，从物理地直觉来看，它代表了一种对**自由度**的估计：
- 一个假设被记作 $\mathbf{w}=(w_{0},w_{1},w_{2},...,w_{d})$ ，其中 $w_{i}$ 指的是为输入 $\mathbf{x}$ 中每个分量所对应的权重，**能够调整的权重的数量 $d+1$ 是这个假设的自由度**；
- 而假设集的规模 $M=|\mathcal{H}|$ 是与自由度相关的数据，那么 $d_{VC}=d+1$ 代表着二分类问题的有效假设的自由度的大小：$d_{VC}(\mathcal{H}):\text{powerfulness of }\mathcal{H}$ ，powerful 在这里的意思是该假设集对该问题的解释、包含的能力；

回想老问题：
- Positives Rays 中 $d_{VC}=1$，可以调整的自由度为 1，即那个正负的分界点；
- Positive Intervals 中 $d_{VC}=2$，即正负区间的分界点；
- ![[70-The-VC-Dimension-old-friends.png]]

从此，我们可以用 $d_{VC}$ 代替之前对 *M* 的估计：
- ![[70-The-VC-Dimension-M-dVC.png]]

### 练习：直觉理解 $d_{VC}$

![[70-The-VC-Dimension-quiz-dVC.png]]
- 这里权重 $w_0$ 处要求必须保持为 0，那么自由度就是在 $d+1$ 的基础上再 -1 ；

## Interpreting VC Dimension

### Penalty for Model Complexity

由前文论述可知，对任何 $g=\mathcal{A}(\mathcal{D})\in\mathcal{H}$，在足够大的取样 $\mathcal{D}$ 上，有
$$
\text{Prob}_{\mathcal{D}}[|E_{in}(g)-E_{out}(g)|>\epsilon]\le4(2N)^{d_{VC}}\cdot e^{- \frac{1}{8}\epsilon^{2}N}
$$
这个概率是 BAD events 发生的概率上界，换言之，GOOD events $|E_{in}(g)-E_{out}(g)|\le\epsilon$ 发生的概率下界是
$$
1-4(2N)^{d_{VC}}\cdot e^{- \frac{1}{8}\epsilon^{2}N}\overset{\text{denoted as}}{\Longrightarrow}1-\delta
$$
，因此我们可以得知
$$
\epsilon=\sqrt{\frac{8}{N}\ln( \frac{4(2N)^{d_{VC}}}{\delta})}
$$
，从而，我们可以得到 $E_{out}(g)$ 的置信区间为：
$$
E_{in}(g)-\sqrt{\frac{8}{N}\ln( \frac{4(2N)^{d_{VC}}}{\delta})}\le E_{out}(g)\le E_{in}(g)+\sqrt{\frac{8}{N}\ln( \frac{4(2N)^{d_{VC}}}{\delta})}
$$
，其中 $\sqrt{\frac{8}{N}\ln( \frac{4(2N)^{d_{VC}}}{\delta})}=\Omega(N,\mathcal{H},\delta)$ 称为**模型的代价**，即 ***penalty for model complexity***。

### VC Message

我们能从这个公式里得到什么信息？—— **一个非常全面、powerful 的 $\mathcal{H}$ 并不总是好的**：
- 我们可以大概率地认为，$E_{out}(g)\le E_{in}(g)+\sqrt{\frac{8}{N}\ln( \frac{4(2N)^{d_{VC}}}{\delta})}=E_{in}(g)+\Omega(N,\mathcal{H},\delta)$ ，将这个关系绘制成图：![[70-The-VC-Dimension-VC-message.png]]
- 随着 $d_{VC}$ 的增加，$E_{in}$ 会降低，但是 $\Omega$ 会增加，从而 $E_{out}$ 随之上升；
- 随着 $d_{VC}$ 的降低， $\Omega$ 会降低，但是 $E_{in}$ 会增加，从而 $E_{out}$ 也会上升；
- 找到最佳的 $d_{VC}^{*}$ 是最能令人满意的，**因此 $\mathcal{H}$ 不宜过大、也不宜过小**；

因此，对于 $\text{Prob}_{\mathcal{D}}[|E_{in}(g)-E_{out}(g)|>\epsilon]\le4(2N)^{d_{VC}}\cdot e^{- \frac{1}{8}\epsilon^{2}N}=\delta$ ，如果给定 $\epsilon=0.1,\delta=0.1,d_{VC}=3$，则对不同大小的输入样本数 *N* ，VC-bound 是这样：
-  ![[70-The-VC-Dimension-sample-complexity.png]] 
- 我们称之为样本复杂度（sample complexity），代表着样本数的规模，理论上 $N\approx10000d_{VC}$ 才够，但实际中发现 $N\approx10d_{VC}$ 已经足够令人满意；

理论与实践的巨大差异，表明 VC bound 实际上非常宽松：![[70-The-VC-Dimension-vc-bound.png]] 
- 这是由于一方面，Hoeffding 不等式对 $E_{out}$ 的估计本就非常宽松，
- 另一方面我们经过了一系列的取上界操作，如 $m_{\mathcal{H}}$ 等，进一步放宽了限制。

### 练习：如何降低获取 BAD data 的概率？

![[70-The-VC-Dimension-quiz-vcbound.png]]