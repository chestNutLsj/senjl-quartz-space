---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
---
## Quadratic Hypotheses

之前我们学习了线性模型，但是对于一些问题，任何线性模型产生的 $E_{in}$ 都大得难以接受，我们不得不考虑非线性模型：
- 以圆形模型为例：![[C0-Nonlinear-Transformation-circular-separable.png]] 这个数据集是圆形可分的，其分类函数为 $h_{CircSEP}(\mathbf{x})=\text{sign}(-x_{1}^{2}-x_{2}^{2}+0.6)$ 

### Circular Separable to Linear Separable

如果对这个圆形模型再像之前的探讨一样做一遍 circular-PLA、circular-Regression... 未免太过笨拙，我们考虑化非线性为线性，从而直接套用之前的分类器：
- 考虑圆形分类函数的各项含义，我们可以类似地分离出权重和各维变量：$h(\mathbf{x})=\text{sign}\left(\underbrace{0.6}_{\tilde{w}_{0}}\cdot\underbrace{1}_{z_{0}}+\underbrace{(-1)}_{\tilde{w}_{1}}\cdot\underbrace{x_{1}^{2}}_{z_{1}}+\underbrace{(-1)}_{\tilde{w}_{2}}\cdot\underbrace{x_{2}^{2}}_{z_{2}}\right)=\text{sign}\left(\tilde{\mathbf{w}}^{T}\mathbf{z}\right)$ ，将平方项用一次项代替，我们就又得到了线性模型；
- 这实现了从 **圆形可分**$\{(\mathbf{x}_{n},y_{n})\}$ 到 **线性可分**$\{(\mathbf{z}_{n},y_{n})\}$ 的转换，在 ML 中称这样的转换为**特征转换**（ ***feature transform***, denote as $\Phi$ ）：$\mathbf{x}\in\mathcal{X}\overset{\Phi}{\mapsto}\mathbf{z}\in\mathcal{Z}$ 
- ![[C0-Nonlinear-Transformation-feature-transform.png]]

### Linear Separable to Circular Separable

从二维的圆形可分转换到线性可分是可行的，那么反过来，还能从线性可分转换成圆形可分吗？
- 写成数学语言，就是对线性特征向量 $\mathbf{z}=(z_0,z_1,z_2)$ 经过特征转换得到 $\Phi(\mathbf{x})=\Phi(1,x_{1}^{2},x_{2}^{2})$ ，是否有假设函数能实现：$h(\mathbf{x})=\tilde{h}(\mathbf{z})=\text{sign}\left(\tilde{\mathbf{w}}^{T}\Phi(\mathbf{x})\right)=\text{sign}\left(\tilde{w_{0}}+\tilde{w_{1}}x_{1}^{2}+\tilde{w_{2}}x_{2}^{2}\right)$ ？
- 结合解析几何，我们对不同的权重向量 $\tilde{\mathbf{w}}=(\tilde{w_{0}},\tilde{w_{1}},\tilde{w_{2}})$ ，实际上可以得出以下的线性到非线性的转换：![[C0-Nonlinear-Transformation-linear2nonlinear.png]]
- 不过显然，我们这里实现的转换其实是在 $\mathcal{Z}$ 空间中的直线对 $\mathcal{X}$ 空间中**特定二次曲线**的转换，而不是任意的转换都能实现；这是由于维度限制的；

如果想实现任意直线到二次曲线的转换，我们需要扩充 $\mathcal{Z}$ 空间的维度：$\Phi_{2}(\mathbf{x})=(1,x_{1},x_{2},x_{1}^{2},x_{1}x_{2},x_{2}^{2})$ ，经过这样转换后的假设集才能包含全部的二维空间的曲线：$\mathcal{H}_{\Phi_{2}}=\left\{h(\mathbf{x}):\quad h(\mathbf{x})=\tilde{h}(\Phi_{2}(\mathbf{x}))\text{ for some linear }\tilde{h}\text{ on }\mathcal{Z}\right\}$ 。

试看下面这个例子，对于一个偏心椭圆 $2(x_{1}+x_{2}-3)^{2}+(x_{1}-x_{2}-4)^{2}=1$ ，其可以通过 $\tilde{\mathbf{w}}^{T}\Phi_{2}(\mathbf{x})$ 实现，其中 $\tilde{\mathbf{w}}^{T}=[33,-20,-4,3,2,3]$ 。

站在二次曲线的角度，我们可以将线性直线看作是其中的特例，即二次项的系数全部为 0 。

### 练习：熟悉曲线到直线的转换

![[C0-Nonlinear-Transformation-quiz-feature-transform.png]]

## Nonlinear Transform

现在，一切真相大白：
- 只要我们能够实现特征转换，那么在线性模型上的假设就可以应用到非线性模型，并且这样的转换实质上只是符号的转换，而不会带来精度的影响：![[C0-Nonlinear-Transformation-Zspace-to-Xspace.png]]
### Nonlinear Perceptron to Linear Perceptron

只要将数据也经过同样的转换，那么在 $\mathcal{Z}$ 空间中的好的==线性感知器==在经过特征转换后，就是在 $\mathcal{X}$ 空间中同样优秀的==非线性感知器==，具体步骤如下：
1. 将原始非线性数据 $\{(\mathbf{x}_{n},y_{n})\}$ 通过特征转换 $\Phi$ 转换为线性数据 $\{(\mathbf{z}_{n},y_{n})\}$ ；
2. 在 $\mathcal{Z}$ 空间中使用合适的线性模型 $\mathcal{A}$（如：PLA、pocket、Linear Regression、Logistic Regression）获取一个足够好的感知器 $\tilde{\mathbf{w}}$ 
3. 返回的最佳估计为 $g(\mathbf{x})=\text{sign}(\tilde{\mathbf{w}}^{T}\Phi(\mathbf{x})$ ；

![[C0-Nonlinear-Transformation-nonlinear2linear.png]]
现在，我们完成了思路的梳理，余下最关键的就是特征转换如何找到了。

在探讨特征转换之前，考虑之前谈论过的一个例子，第三节我们讨论过将 [[30-Types-of-Learning#Raw Features|手写数字的像素图转换为二维图]] 的例子：
- ![[C0-Nonlinear-Transformation-MNIST.png]]
- 这里我们将 $16\times16$ 的 256 维 的数字像素图，进行特征转换（提取）后，得到可以二元分类的两个特征——密度、对称性；

### 练习：特征转换的维度变化

![[C0-Nonlinear-Transformation-quiz-transform.png]]

## Price of Nonlinear Transform



## Structured Hypothesis Sets