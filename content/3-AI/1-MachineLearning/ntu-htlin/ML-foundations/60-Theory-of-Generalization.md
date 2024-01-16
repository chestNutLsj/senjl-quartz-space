---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
time: 2024-01-07
---
## Restriction of Break Point

[[50-Training-versus-Testing#Break Point|上节课]] 我们猜测了 break point 对 $m_{\mathcal{H}}$ 的数量级的估计，那么 break point 究竟如何限制其增长的呢？
- 来讨论这样的情形：当 minimum break point $k=2$ 时，意味着**任意两个输入样本，都不能被假设集 $\mathcal{H}$ 完全 shatter**（此处可以理解为枚举、代表、表示之意），
- 那么当输入样本数 $N=1$ 时，$m_{\mathcal{H}}=2$；当 $N=2$ 时，$m_{\mathcal{H}}=3<4$；当 $N=3$ 时呢？![[60-Theory-of-Generalization-max-possible-3input.png]] 此时 $m_{\mathcal{H}}=4\ll8$，
- 可以看出，break point k 极大程度地限制了 $m_{\mathcal{H}}$ 可以取得的最大值，回想之前的猜测，$m_{\mathcal{H}}\le\text{maximum possible }m_{\mathcal{H}} \text{ given } k\le \mathcal{O}(poly(N))$

### 练习：k=1 时的 $m_{\mathcal{H}}$ 最大值

![[60-Theory-of-Generalization-quiz-mh-k=1.png]]

## Bounding Function: Basic Cases

我们定义 bounding function $B(N,k): \text{maximum possible }m_{\mathcal{H}(N)} \text{ given break point } k$ ，如果能够判断 $B(N,k)\le\mathcal{O}(poly(N))$，那么之前对 $m_{\mathcal{H}}$ 的估计也就必然成立：
- $B(N,k)$ 实际上是一个组合数，其等于 **元素都只取自 $(\times,\circ)$ 的、长度为 *N* 的、不能被长度为 *k* 的子向量所 shatter 的向量的数量**；
- $B(N,k)$ 实际上**与假设集 $\mathcal{H}$ 的具体内容无关**，例如 $B(N,3)$ 既可以表示 positive intervals 问题，又可以表示 1D perceptrons 问题，越抽象的函数越是需要少的依赖；
- 如此，我们可以填写这样的表以期找出 $B(N,k)$ 的关系：![[60-Theory-of-Generalization-bounding-func-half.png]]

## Bounding Function: Inductive Cases

现在，我们来尝试找出上面矩阵的下半三角部分的规律：
- $B(4,3)$ 表示 4 个输入样本时，那么必然与 3 个输入样本有关，我们尝试找出 $B(4,3)$ 与 $B(3,?)$ 的关系：![[60-Theory-of-Generalization-B(4,3).png]] 注意这里 dichotomies set 的数量为 $2^{16}$，是怎么算出来的呢？一个 dichotomy 中有 4 个元素，故有 $2^4$ 种 dichotomy，而 dichotomies set 是指 dichotomy 有几种选择方法，故总共 $2^{2^{4}}$ 种；
- 对这 11 种 dichotomy 进行分类：![[60-Theory-of-Generalization-11dichotomy.png]] 其中橙色部分是两两有 3 个元素完全相同的，而紫色部分则没有；
- 记 $B(4,3)=11=2\alpha+\beta$，其中 $\alpha+\beta$ 表示 3 个输入样本 $(\mathbf{x}_1,\mathbf{x}_2,\mathbf{x}_3)$ 时 dichotomies 的数量，![[60-Theory-of-Generalization-2α+β.png]] 于是将 **$B(4,3)$ 表示的不能由 3 个子向量 shatter 的问题** 缩小 为在 **3 个输入中不能被 3 个长度的子向量 shatter 的问题**，即 $B(3,3)$ ；
- 更进一步地，$\alpha$ 表示对成对的 $\mathbf{x}_4$ 来说，在输入样本 $(\mathbf{x}_1,\mathbf{x}_2,\mathbf{x}_3)$ 上 dichotomies 的数量，![[60-Theory-of-Generalization-B(3,2).png]] 从而 $B(4,3)$ 又缩小为 **3 个输入中不能被 2 个长度的子向量 shatter 的问题**，即 $B(3,2)$ ；
- 将这两个不等式联立，我们可以得知： ![[60-Theory-of-Generalization-putting-together.png]] 代换其中的 4 和 3，我们得到 $B(N,k)\le B(N-1,k)+B(N-1,k-1)$ 这个递推关系式，即 **$m_{\mathcal{H}}$ 的上界的上界**；
- 推导递推关系式，可以得到这样的关于 *N* 和 *k* 的关系式：$B(N,k)\le\sum\limits_{i=0}^{k-1}\binom{N}{i}=\mathcal{O}(N^{k-1})$，另外 $≤$ 其实可以在数学上证明为 $=$；
- 如此，我们完成了证明：只要 break point 存在，那么 $m_{\mathcal{H}}$ 必然是多项式复杂度的![[60-Theory-of-Generalization-poly-N.png]]

### 练习：理解 $m_{\mathcal{H}}$ 的上界

![[60-Theory-of-Generalization-MH-bound.png]]

## A Pictorial Proof

现在，我们能够直接使用 $m_{\mathcal{H}}$ 来代替原来的 M 了吗？实际上，还差一些，经过 ML 前辈的推导，当 $N$ 足够大时，关系式变成了这样：
$$
\text{Prob}[\exists h\in\mathcal{H}\text{ s.t. }|E_{in}(h)-E_{out}(h)|>\epsilon]\le 2\cdot2m_{\mathcal{H}}(2N)\cdot e^{-2\cdot \frac{1}{16}\epsilon^{2}N}
$$

这个关系式由 Vapnik-Chervonenkis 发现，于是命名为 VC-bound 公式，其证明步骤比较麻烦，总的来说可以分成三步：
1. 化未知为已知：![[60-Theory-of-Generalization-Eout-to-newEin.png]]
2. 将无穷大的假设集 $\mathcal{H}$ 分类为有限种：![[60-Theory-of-Generalization-decompose-H.png]]
3. 利用 Hoeffding 不等式消去 Prob 关系式：![[60-Theory-of-Generalization-hoeffding-replace-Prob.png]]

### 练习：VC-bound 使用

![[60-Theory-of-Generalization-quiz-VC-bound.png]]