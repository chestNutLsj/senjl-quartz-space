---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2024-01-27
---
## Kernel Trick

上节课我们通过提出 SVM 的对偶模型 Dual SVM ，实现了对空间维数 $\tilde{d}$ 依赖的减少，但 [[20-Dual-Support-Vector-Machine#Hidden Dimension|并没有完全祛除]] ：
- ![[30-Kernel-Support-Vector-Machine-goal-dual.png]]
- 在 SVM 中，在经过特征转换到一维空间后，才能正确使用 SVM 模型，因此**特征转换**和**向量内积**这两部分操作的耗时，将直接与空间维数 $\tilde{d}$ 相关，达到 $\mathcal{O}(\tilde{d})$ 的复杂度；

这样拆分成两步的操作必然会带来 $\mathcal{O}(\tilde{d})$ 的复杂度，因此要降低复杂度，我们必须深入探讨：
- 考虑在二维空间中的特征转换：![[30-Kernel-Support-Vector-Machine-inner-product-for-Phi2.png]]
- 仔细观察**特征转换+内积**这个组合操作的运算过程，我们可以分离出内积 $\mathbf{x}^{T}\mathbf{x}^{'}$ ，最终可以实现将 $\mathcal{O}(d^{2})$ 的复杂度降低到 $\mathcal{O}(d)$ ；

这样**一步完成特征转换+向量内积的过程**称为 ***kernel function*** ，每个特定的转换都对应特定的 kernel function ：
- ![[30-Kernel-Support-Vector-Machine-transform-kernel-function.png]]
- 因此，计算 QP 问题中矩阵 $Q_{D}$ 可以写为：$q_{n,m}=y_{n}y_{m}\mathbf{z}_{n}^{T}\mathbf{z}_{m}=y_{n}y_{m}K(\mathbf{x}_{n},\mathbf{x}_{m})$ ，由 kernel function 完成关键的转换与内积运算；
- 并且，回顾求解 $b$ 的过程，也可以运用 kernel function 进行简化：$b=y_{s}-\mathbf{w}^{T}\mathbf{z}_{s}=y_{s}-\left(\sum\limits_{n=1}^{N}\alpha_{n}y_{n}\mathbf{z}_{n}\right)^{T}\mathbf{z}_{s}=y_{s}-\sum\limits_{n=1}^{N}\alpha_{n}y_{n}\left(K(\mathbf{x}_{n},\mathbf{x}_{m})\right)$ 
- 同理，我们对最佳假设 $g_{SVM}$ 也可以如此处理：$g_{SVM}(\mathbf{x})=\text{sign}(\mathbf{w}^{T}\Phi(\mathbf{x})+b)=\text{sign}\left(\sum\limits_{n=1}^{N}\alpha_{n}y_{n}K(\mathbf{x}_{n},\mathbf{x})+b\right)$ 
- 这些操作都运用到称为 kernel trick 的技巧，即通过高效的 kernel function 避免对空间维数 $\tilde{d}$ 的依赖，
- 并且最终呈现出的 $q_{n,m},b,g_{SVM}$ 三者的计算都仅依赖于输入样本 $\mathbf{x}_{n}$ ；

在之前讨论的 SVM 模型中再加入 kernel function ，我们就得到了 Kernel SVM ：
- ![[30-Kernel-Support-Vector-Machine-kernel-SVM.png]]
- 使用 QP 问题求解 Kernel SVM 的过程就如上图，
- 其中值得注意的是，经过 kernel function ，计算 $q_{n,m}$ 的运算复杂度最终降低到 $\mathcal{O}(N^{2})$ ，计算 $b$ 和 $g_{SVM}$ 的复杂度降低到 $\mathcal{O}(\text{nums of SV})$ ，并且完全摆脱了对空间维数 $\tilde{d}$ 的依赖；

### 练习：计算 kernel function

![[30-Kernel-Support-Vector-Machine-quiz-kernel-function.png]]

## Polynomial Kernel

上节我们学到了 kernel function 在特定特征转换和向量内积中起作用的例子，现在我们对特征转换进行一些放缩，以便获得更简洁的 kernel function 形式：
- ![[30-Kernel-Support-Vector-Machine-general-poly2.png]]
- 第三种转换形式，可以使 kernel function 的形式转换为 $K_{2}(\mathbf{x},\mathbf{x}^{'})=(1+\gamma\mathbf{x}^{T}\mathbf{x}^{'})^{2}\text{ with }\gamma>0$ ，显然转换后的 kernel function 在计算上要更加简单；

不过这种转换除了计算简单外，还有什么实际意义吗？实际上，放缩导致内积的结果不同，进而导致 SVM 的几何形态不同——进而影响 SV 的数量：
- ![[30-Kernel-Support-Vector-Machine-poly2-kernels.png]]
- 因此选择 kernel function 也是同特征转换 $\Phi$ 一样值得细细考量的事情；

进一步地在不同空间中推广 kernel function ，并且特征转换函数 $\Phi_{Q}$ 有两个特殊的参数：$\zeta,\gamma$ ，这两个参数体现在 kernel function 中如下：
- ![[30-Kernel-Support-Vector-Machine-general-polynomial.png]]
- 另外，我们可以通过限制 margin 的宽度，来 [[10-Linear-Support-Vector-Machine#Constraint and Minimize Target|限制复杂度]] ，使得即是在高维转换中复杂度也不是太高：![[30-Kernel-Support-Vector-Machine-10th-margin-01.png]]
- 这样加入多项式形式的 kernel function 的 SVM，简称为 Polynomial SVM；

在通用的多项式形式的 kernel function 中，有一个特殊例子值得考虑：
- ![[30-Kernel-Support-Vector-Machine-linear-kernel.png]]
- 对于一维转换的 kernel function ，只需要用到向量内积，因此其又称作 linear kernel ，它的重要性在于我们的原则——从简单的线性模型做起，逐步提高复杂程度，避免过拟合风险；

### 练习：理解二维 kernel function 的一般形式推导

![[30-Kernel-Support-Vector-Machine-quiz-poly2.png]]

## Gaussian Kernel



## Comparison of Kernels