> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [zhuanlan.zhihu.com](https://zhuanlan.zhihu.com/p/257900201)

刚接触机器学习框架 TensorFlow 的新手们，这篇由 Google 官方出品的[常用术语词汇表](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary%3Fhl%3Dzh-CN)，一定是你必不可少的入门资料！本术语表上篇按字母顺序（A-M），列出了基本的机器学习术语和 TensorFlow 专用术语的定义，希望能帮助您快速熟悉 TensorFlow 入门内容，轻松打开机器学习世界的大门。

**术语表下篇（N-Z）：**

[谷歌开发者：超全汇总！机器学习常用术语词汇表——下篇（建议收藏）](https://zhuanlan.zhihu.com/p/257987132)

A
-

*   _**A/B 测试 (A/B testing)**_

一种统计方法，用于将两种或多种技术进行比较，通常是将当前采用的技术与新技术进行比较。A/B 测试不仅旨在确定哪种技术的效果更好，而且还有助于了解相应差异是否具有显著的统计意义。A/B 测试通常是采用一种衡量方式对两种技术进行比较，但也适用于任意有限数量的技术和衡量方式。

*   _**准确率 (accuracy)**_

[分类模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23classification_model)的正确预测所占的比例。在[多类别分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23multi-class)中，准确率的定义如下：

![](https://pic2.zhimg.com/v2-9331cca33f7a8105558b06717a0d2359_b.jpg)

在[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)中，准确率的定义如下：

![](https://pic2.zhimg.com/v2-1ea1df60bc4e9983595d148f9558f351_r.jpg)

请参阅[正例](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23TP)和[负例](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23TN)。

*   _**激活函数 (activation function)**_

一种函数（例如 [ReLU](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23ReLU) 或 [S 型函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sigmoid_function)），用于对上一层的所有输入求加权和，然后生成一个输出值（通常为非线性值），并将其传递给下一层。

*   _**AdaGrad**_

一种先进的梯度下降法，用于重新调整每个参数的梯度，以便有效地为每个参数指定独立的[学习速率](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23learning_rate)。如需查看完整的解释，请参阅[这篇论文](https://link.zhihu.com/?target=http%3A//www.jmlr.org/papers/volume12/duchi11a/duchi11a.pdf)。

*   _**ROC 曲线下面积 (AUC, Area under the ROC Curve)**_

一种会考虑所有可能[分类阈值](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23classification_threshold)的评估指标。

[ROC 曲线](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23ROC)下面积是，对于随机选择的正类别样本确实为正类别，以及随机选择的负类别样本为正类别，分类器更确信前者的概率。

B
-

*   **_反向传播算法 (backpropagation)_**

在[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)上执行[梯度下降法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient_descent)的主要算法。该算法会先按前向传播方式计算（并缓存）每个节点的输出值，然后再按反向传播遍历图的方式计算损失函数值相对于每个参数的[偏导数](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Partial_derivative)。

*   _**基准 (baseline)**_

一种简单的[模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model)或启发法，用作比较模型效果时的参考点。基准有助于模型开发者针对特定问题量化最低预期效果。

*   _**批次 (batch)**_

[模型训练](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model_training)的一次[迭代](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23iteration)（即一次[梯度](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient)更新）中使用的样本集。

另请参阅[批次大小](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23batch_size)。

*   _**批次大小 (batch size)**_

一个[批次](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23batch)中的样本数。例如，[SGD](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23SGD) 的批次大小为 1，而[小批次](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23mini-batch)的大小通常介于 10 到 1000 之间。批次大小在训练和推断期间通常是固定的；不过，TensorFlow 允许使用动态批次大小。

*   _**偏差 (bias)**_

距离原点的截距或偏移。偏差（也称为偏差项）在机器学习模型中用 b 或 w0 表示。例如，在下面的公式中，偏差为 b：

![](https://pic3.zhimg.com/v2-1884b3c00e233856ef3cec798b5e5f6e_r.jpg)

请勿与[预测偏差](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23prediction_bias)混淆。

*   _**二元分类 (binary classification)**_

一种分类任务，可输出两种互斥类别之一。例如，对电子邮件进行评估并输出 “垃圾邮件” 或“非垃圾邮件”的机器学习模型就是一个二元分类器。

*   _**分箱 (binning)**_

请参阅[分桶](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23bucketing)。

*   _**分桶 (bucketing)**_

将一个特征（通常是[连续](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23continuous_feature)特征）转换成多个二元特征（称为桶或箱），通常根据值区间进行转换。例如，您可以将温度区间分割为离散分箱，而不是将温度表示成单个连续的浮点特征。假设温度数据可精确到小数点后一位，则可以将介于 0.0 到 15.0 度之间的所有温度都归入一个分箱，将介于 15.1 到 30.0 度之间的所有温度归入第二个分箱，并将介于 30.1 到 50.0 度之间的所有温度归入第三个分箱。

C
-

*   _**校准层 (calibration layer)**_

一种预测后调整，通常是为了降低[预测偏差](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23prediction_bias)的影响。调整后的预测和概率应与观察到的标签集的分布一致。

*   **_候选采样 (candidate sampling)_**

一种训练时进行的优化，会使用某种函数（例如 softmax）针对所有正类别标签计算概率，但对于负类别标签，则仅针对其随机样本计算概率。例如，如果某个样本的标签为 “小猎犬” 和“狗”，则候选采样将针对 “小猎犬” 和“狗”类别输出以及其他类别（猫、棒棒糖、栅栏）的随机子集计算预测概率和相应的损失项。这种采样基于的想法是，只要[正类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23positive_class)始终得到适当的正增强，[负类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23negative_class)就可以从频率较低的负增强中进行学习，这确实是在实际中观察到的情况。候选采样的目的是，通过不针对所有负类别计算预测结果来提高计算效率。

*   _**分类数据 (categorical data)**_

一种[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)，拥有一组离散的可能值。以某个名为 `house style` 的分类特征为例，该特征拥有一组离散的可能值（共三个），即 `Tudor, ranch, colonial`。通过将 `house style` 表示成分类数据，相应模型可以学习 `Tudor`、`ranch` 和 `colonial` 分别对房价的影响。

有时，离散集中的值是互斥的，只能将其中一个值应用于指定样本。例如，`car maker` 分类特征可能只允许一个样本有一个值 (`Toyota`)。在其他情况下，则可以应用多个值。一辆车可能会被喷涂多种不同的颜色，因此，`car color` 分类特征可能会允许单个样本具有多个值（例如 `red` 和 `white`）。

分类特征有时称为[离散特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23discrete_feature)。

与[数值数据](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23numerical_data)相对。

*   _**形心 (centroid)**_

聚类的中心，由 [k-means](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23k-means) 或 [k-median](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23k-median) 算法决定。例如，如果 k 为 3，则 k-means 或 k-median 算法会找出 3 个形心。

*   _**检查点 (checkpoint)**_

一种数据，用于捕获模型变量在特定时间的状态。借助检查点，可以导出模型[权重](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23weight)，跨多个会话执行训练，以及使训练在发生错误之后得以继续（例如作业抢占）。请注意，[图](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23graph)本身不包含在检查点中。

*   **_类别 (class)_**

为标签枚举的一组目标值中的一个。例如，在检测垃圾邮件的[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)模型中，两种类别分别是 “垃圾邮件” 和“非垃圾邮件”。在识别狗品种的[多类别分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23multi_class_classification)模型中，类别可以是 “贵宾犬”、“小猎犬”、“哈巴犬” 等等。

*   _**分类不平衡的数据集 (class-imbalanced data set)**_

一种[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)问题，在此类问题中，两种类别的[标签](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23label)在出现频率方面具有很大的差距。例如，在某个疾病数据集中，0.0001 的样本具有正类别标签，0.9999 的样本具有负类别标签，这就属于分类不平衡问题；但在某个足球比赛预测器中，0.51 的样本的标签为其中一个球队赢，0.49 的样本的标签为另一个球队赢，这就不属于分类不平衡问题。

*   _**分类模型 (classification model)**_

一种机器学习模型，用于区分两种或多种离散类别。例如，某个自然语言处理分类模型可以确定输入的句子是法语、西班牙语还是意大利语。请与[回归模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regression_model)进行比较。

*   **_分类阈值 (classification threshold)_**

一种标量值条件，应用于模型预测的得分，旨在将[正类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23positive_class)与[负类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23negative_class)区分开。将[逻辑回归](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23logistic_regression)结果映射到[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)时使用。以某个逻辑回归模型为例，该模型用于确定指定电子邮件是垃圾邮件的概率。如果分类阈值为 0.9，那么逻辑回归值高于 0.9 的电子邮件将被归类为 “垃圾邮件”，低于 0.9 的则被归类为 “非垃圾邮件”。

*   **_聚类 (clustering)_**

将关联的[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)分成一组，一般用于[非监督式学习](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23unsupervised_machine_learning)。在所有样本均分组完毕后，相关人员便可选择性地为每个聚类赋予含义。

聚类算法有很多。例如，[k-means](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23k-means) 算法会基于样本与[形心](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23centroid)的接近程度聚类样本，如下图所示：

![](https://pic2.zhimg.com/v2-0dcb0664599bd6d8edb4041ee0298585_r.jpg)

之后，研究人员便可查看这些聚类并进行其他操作，例如，将聚类 1 标记为 “矮型树”，将聚类 2 标记为 “全尺寸树”。

再举一个例子，例如基于样本与中心点距离的聚类算法，如下所示：

![](https://pic1.zhimg.com/v2-16c4185b02781371101f3a5c61fe02e8_r.jpg)

*   _**协同过滤 (collaborative filtering)**_

根据很多其他用户的兴趣来预测某位用户的兴趣。协同过滤通常用在推荐系统中。

*   _**混淆矩阵 (confusion matrix)**_

一种 NxN 表格，用于总结[分类模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23classification_model)的预测效果；即标签和模型预测的分类之间的关联。在混淆矩阵中，一个轴表示模型预测的标签，另一个轴表示实际标签。N 表示类别个数。在[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)问题中，N=2。例如，下面显示了一个二元分类问题的混淆矩阵示例：

![](https://pic1.zhimg.com/v2-3f9fd1d8a97367db5968816c292482d0_r.jpg)

上面的混淆矩阵显示，在 19 个实际有肿瘤的样本中，该模型正确地将 18 个归类为有肿瘤（18 个正例），错误地将 1 个归类为没有肿瘤（1 个假负例）。同样，在 458 个实际没有肿瘤的样本中，模型归类正确的有 452 个（452 个负例），归类错误的有 6 个（6 个假正例）。

多类别分类问题的混淆矩阵有助于确定出错模式。例如，某个混淆矩阵可以揭示，某个经过训练以识别手写数字的模型往往会将 4 错误地预测为 9，将 7 错误地预测为 1。

混淆矩阵包含计算各种效果指标（包括[精确率](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23precision)和[召回率](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23recall)）所需的充足信息。

*   **_连续特征 (continuous feature)_**

一种浮点特征，可能值的区间不受限制。与[离散特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23discrete_feature)相对。

*   _**收敛 (convergence)**_

通俗来说，收敛通常是指在训练期间达到的一种状态，即经过一定次数的迭代之后，训练[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)和验证损失在每次迭代中的变化都非常小或根本没有变化。也就是说，如果采用当前数据进行额外的训练将无法改进模型，模型即达到收敛状态。在深度学习中，损失值有时会在最终下降之前的多次迭代中保持不变或几乎保持不变，暂时形成收敛的假象。

另请参阅[早停法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23early_stopping)。

另请参阅 Boyd 和 Vandenberghe 合著的 [Convex Optimization](https://link.zhihu.com/?target=https%3A//web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf)（《凸优化》）。

*   _**凸函数 (convex function)**_

一种函数，函数图像以上的区域为[凸集](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convex_set)。典型凸函数的形状类似于字母 U。例如，以下都是凸函数：

![](https://pic2.zhimg.com/v2-006c03443a5b59d378e3375967721d01_r.jpg)

相反，以下函数则不是凸函数。请注意图像上方的区域如何不是凸集：

![](https://pic2.zhimg.com/v2-8c915c24c02cac959422179ebcce3a2d_r.jpg)

严格凸函数只有一个局部最低点，该点也是全局最低点。经典的 U 形函数都是严格凸函数。不过，有些凸函数（例如直线）则不是这样。

很多常见的[损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss_functions)（包括下列函数）都是凸函数：

*   [L2 损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23L2_loss)
*   [对数损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Log_Loss)
*   [L1 正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23L1_regularization)
*   [L2 正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23L2_regularization)

[梯度下降法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient_descent)的很多变体都一定能找到一个接近严格凸函数最小值的点。同样，[随机梯度下降法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23SGD)的很多变体都有很高的可能性能够找到接近严格凸函数最小值的点（但并非一定能找到）。

两个凸函数的和（例如 L2 损失函数 + L1 正则化）也是凸函数。

[深度模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23deep_model)绝不会是凸函数。值得注意的是，专门针对[凸优化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convex_optimization)设计的算法往往总能在深度网络上找到非常好的解决方案，虽然这些解决方案并不一定对应于全局最小值。

*   _**凸优化 (convex optimization)**_

使用数学方法（例如[梯度下降法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient_descent)）寻找[凸函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convex_function)最小值的过程。机器学习方面的大量研究都是专注于如何通过公式将各种问题表示成凸优化问题，以及如何更高效地解决这些问题。

如需完整的详细信息，请参阅 Boyd 和 Vandenberghe 合著的 [Convex Optimization](https://link.zhihu.com/?target=https%3A//web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf)（《凸优化》）。

*   _**凸集 (convex set)**_

欧几里得空间的一个子集，其中任意两点之间的连线仍完全落在该子集内。例如，下面的两个图形都是凸集：

![](https://pic1.zhimg.com/v2-e9c1dd4a297e09372d310ee98c941574_r.jpg)

相反，下面的两个图形都不是凸集：

![](https://pic4.zhimg.com/v2-dc41e0ded4b0cae18abc251253898503_r.jpg)

*   _**卷积 (convolution)**_

简单来说，卷积在数学中指两个函数的组合。在机器学习中，卷积结合使用卷积过滤器和输入矩阵来训练权重。

机器学习中的 “卷积” 一词通常是[卷积运算](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_operation)或[卷积层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_layer)的简称。

如果没有卷积，机器学习算法就需要学习大张量中每个单元格各自的权重。例如，用 2K x 2K 图像训练的机器学习算法将被迫找出 400 万个单独的权重。而使用卷积，机器学习算法只需在[卷积过滤器](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_filter)中找出每个单元格的权重，大大减少了训练模型所需的内存。在应用卷积过滤器后，它只需跨单元格进行复制，每个单元格都会与过滤器相乘。

*   _**卷积过滤器 (convolutional filter)**_

[卷积运算](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_operation)中的两个参与方之一。（另一个参与方是输入矩阵切片。）卷积过滤器是一种矩阵，其[等级](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23rank)与输入矩阵相同，但形状小一些。以 28×28 的输入矩阵为例，过滤器可以是小于 28×28 的任何二维矩阵。

在图形操作中，卷积过滤器中的所有单元格通常按照固定模式设置为 1 和 0。在机器学习中，卷积过滤器通常先选择随机数字，然后由网络训练出理想值。

*   _**卷积层 (convolutional layer)**_

深度神经网络的一个层，[卷积过滤器](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_filter)会在其中传递输入矩阵。以下面的 3x3 [卷积过滤器](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_filter)为例：

![](https://pic4.zhimg.com/v2-01ec59970b98310c1c0e24276b06846b_b.jpg)

下面的动画显示了一个由 9 个卷积运算（涉及 5x5 输入矩阵）组成的卷积层。请注意，每个卷积运算都涉及一个不同的 3x3 输入矩阵切片。由此产生的 3×3 矩阵（右侧）就包含 9 个卷积运算的结果：

![](https://pic1.zhimg.com/v2-f3158ee7561c8670eee0f55706036d84_b.gif)

*   _**卷积神经网络 (convolutional neural network)**_

一种神经网络，其中至少有一层为[卷积层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_layer)。典型的卷积神经网络包含以下几层的组合：

*   卷积层
*   池化层
*   密集层

卷积神经网络在解决某些类型的问题（如图像识别）上取得了巨大成功。

*   _**卷积运算 (convolutional operation)**_

如下所示的两步数学运算：

1.  对[卷积过滤器](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_filter)和输入矩阵切片执行元素级乘法。（输入矩阵切片与卷积过滤器具有相同的等级和大小。）
2.  对生成的积矩阵中的所有值求和。

以下面的 5x5 输入矩阵为例：

![](https://pic4.zhimg.com/v2-3c3f826c4c2cfb33f9a1ed2cd18dc127_r.jpg)

现在，以下面这个 2x2 卷积过滤器为例：

![](https://pic4.zhimg.com/v2-7f5b9c871551f23bc2c6f6fe7765d087_b.jpg)

每个卷积运算都涉及一个 2x2 输入矩阵切片。例如，假设我们使用输入矩阵左上角的 2x2 切片。这样一来，对此切片进行卷积运算将如下所示：

![](https://pic2.zhimg.com/v2-7b0bdaf9e4bdbcd47452bda57cc51499_r.jpg)

[卷积层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23convolutional_layer)由一系列卷积运算组成，每个卷积运算都针对不同的输入矩阵切片。

*   _**成本 (cost)**_

与[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)的含义相同。

*   _**交叉熵 (cross-entropy)**_

[对数损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Log_Loss)向[多类别分类问题](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23multi-class)的一种泛化。交叉熵可以量化两种概率分布之间的差异。另请参阅[困惑度](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23perplexity)。

*   _**自定义 Estimator (custom Estimator)**_

您按照[这些说明](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/extend/estimators%3Fhl%3Dzh-CN)自行编写的 [Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Estimators)。

与[预创建的 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23pre-made_Estimator) 相对。

D
-

*   _**数据分析 (data analysis)**_

根据样本、测量结果和可视化内容来理解数据。数据分析在首次收到数据集、构建第一个模型之前特别有用。此外，数据分析在理解实验和调试系统问题方面也至关重要。

*   _**DataFrame**_

一种热门的数据类型，用于表示 Pandas 中的数据集。DataFrame 类似于表格。DataFrame 的每一列都有一个名称（标题），每一行都由一个数字标识。

*   _**数据集 (data set)**_

一组[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)的集合。

*   _**Dataset API (tf.data)**_

一种高级别的 TensorFlow API，用于读取数据并将其转换为机器学习算法所需的格式。`tf.data.Dataset` 对象表示一系列元素，其中每个元素都包含一个或多个[张量](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23tensor)。`tf.data.Iterator` 对象可获取 `Dataset` 中的元素。

如需详细了解 Dataset API，请参阅《TensorFlow 编程人员指南》中的[导入数据](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/programmers_guide/datasets%3Fhl%3Dzh-CN)。

*   **_决策边界 (decision boundary)_**

在[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)或[多类别分类问题](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23multi-class)中，模型学到的类别之间的分界线。例如，在以下表示某个二元分类问题的图片中，决策边界是橙色类别和蓝色类别之间的分界线：

![](https://pic3.zhimg.com/v2-75083a6415a51393b7d45fd4a0e6a002_r.jpg)

*   _**密集层 (dense layer)**_

与[全连接层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23fully_connected_layer)的含义相同。

*   _**深度模型 (deep model)**_

一种[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)，其中包含多个[隐藏层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23hidden_layer)。深度模型依赖于可训练的非线性关系。

与[宽度模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23wide_model)相对。

*   _**密集特征 (dense feature)**_

一种大部分值是非零值的[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)，通常是浮点值[张量](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23tensor)。与[稀疏特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sparse_features)相对。

*   _**设备 (device)**_

一类可运行 TensorFlow 会话的硬件，包括 CPU、GPU 和 TPU。

*   _**离散特征 (discrete feature)**_

一种[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)，包含有限个可能值。例如，某个值只能是 “动物”、“蔬菜” 或“矿物”的特征便是一个离散特征（或分类特征）。与[连续特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23continuous_feature)相对。

*   _**丢弃正则化 (dropout regularization)**_

[正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regularization)的一种形式，在训练[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)方面非常有用。丢弃正则化的运作机制是，在一个梯度步长中移除从神经网络层中随机选择的固定数量的单元。丢弃的单元越多，正则化效果就越强。这类似于训练神经网络以模拟较小网络的指数级规模集成学习。如需完整的详细信息，请参阅 [Dropout: A Simple Way to Prevent Neural Networks from Overfitting](https://link.zhihu.com/?target=http%3A//jmlr.org/papers/volume15/srivastava14a.old/srivastava14a.pdf)（《丢弃：一种防止神经网络过拟合的简单方法》）。

*   **_动态模型 (dynamic model)_**

一种[模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model)，以持续更新的方式在线接受训练。也就是说，数据会源源不断地进入这种模型。

E
-

*   _**早停法 (early stopping)**_

一种[正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regularization)方法，是指在训练损失仍可以继续降低之前结束模型训练。使用早停法时，您会在[验证数据集](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23validation_set)的损失开始增大（也就是[泛化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23generalization)效果变差）时结束模型训练。

*   _**嵌套 (embeddings)**_

一种分类特征，以连续值特征表示。通常，嵌套是指将高维度向量映射到低维度的空间。例如，您可以采用以下两种方式之一来表示英文句子中的单词：

*   表示成包含百万个元素（高维度）的[稀疏向量](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sparse_features)，其中所有元素都是整数。向量中的每个单元格都表示一个单独的英文单词，单元格中的值表示相应单词在句子中出现的次数。由于单个英文句子包含的单词不太可能超过 50 个，因此向量中几乎每个单元格都包含 0。少数非 0 的单元格中将包含一个非常小的整数（通常为 1），该整数表示相应单词在句子中出现的次数。
*   表示成包含数百个元素（低维度）的[密集向量](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23dense_feature)，其中每个元素都存储一个介于 0 到 1 之间的浮点值。这就是一种嵌套。

在 TensorFlow 中，会按[反向传播](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23backpropagation)[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)训练嵌套，和训练[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)中的任何其他参数一样。

*   _**经验风险最小化 (ERM, empirical risk minimization)**_

用于选择可以将基于训练集的损失降至最低的函数。与[结构风险最小化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23SRM)相对。

*   _**集成学习 (ensemble)**_

多个[模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model)的预测结果的并集。您可以通过以下一项或多项来创建集成学习：

*   不同的初始化
*   不同的[超参数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23hyperparameter)
*   不同的整体结构

[深度模型和宽度模型](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/tutorials/wide_and_deep%3Fhl%3Dzh-CN)属于一种集成学习。

*   _**周期 (epoch)**_

在训练时，整个数据集的一次完整遍历，以便不漏掉任何一个样本。因此，一个周期表示（`N`/ [批次大小](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23batch_size)）次训练[迭代](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23iteration)，其中`N`是样本总数。

*   _**Estimator**_

`tf.Estimator`类的一个实例，用于封装负责构建 TensorFlow 图并运行 TensorFlow 会话的逻辑。您可以创建[自定义 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23custom_estimator)（如需相关介绍，请[点击此处](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/extend/estimators%3Fhl%3Dzh-CN)），也可以实例化其他人[预创建的 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23pre-made_Estimator)。

*   _**样本 (example)**_

数据集的一行。一个样本包含一个或多个[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)，此外还可能包含一个[标签](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23label)。另请参阅[有标签样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23labeled_example)和[无标签样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23unlabeled_example)。

F
-

*   _**假负例 (FN, false negative)**_

被模型错误地预测为[负类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23negative_class)的样本。例如，模型推断出某封电子邮件不是垃圾邮件（负类别），但该电子邮件其实是垃圾邮件。

*   _**假正例 (FP, false positive)**_

被模型错误地预测为[正类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23positive_class)的样本。例如，模型推断出某封电子邮件是垃圾邮件（正类别），但该电子邮件其实不是垃圾邮件。

*   _**假正例率（false positive rate, 简称 FP 率）**_

[ROC 曲线](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23ROC)中的 x 轴。FP 率的定义如下：

![](https://pic3.zhimg.com/v2-87018e898a7214b66c67652c387bb12e_r.jpg)

*   **_特征 (feature)_**

在进行[预测](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23prediction)时使用的输入变量。

*   _**特征列 (tf.feature_column)**_

指定模型应该如何解读特定特征的一种函数。此类函数的输出结果是所有 [Estimators](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Estimators) 构造函数的必需参数。

借助 `tf.feature_column` 函数，模型可对输入特征的不同表示法轻松进行实验。有关详情，请参阅《TensorFlow 编程人员指南》中的[特征列](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/get_started/feature_columns%3Fhl%3Dzh-CN)一章。

“特征列” 是 Google 专用的术语。特征列在 Yahoo/Microsoft 使用的 [VW](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Vowpal_Wabbit) 系统中称为 “命名空间”，也称为[场](https://link.zhihu.com/?target=https%3A//www.csie.ntu.edu.tw/~cjlin/libffm/)。

*   _**特征组合 (feature cross)**_

通过将单独的特征进行组合（求笛卡尔积）而形成的[合成特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23synthetic_feature)。特征组合有助于表达非线性关系。

*   _**特征工程 (feature engineering)**_

指以下过程：确定哪些[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)可能在训练模型方面非常有用，然后将日志文件及其他来源的原始数据转换为所需的特征。在 TensorFlow 中，特征工程通常是指将原始日志文件条目转换为 [tf.Example](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23tf.Example) 协议缓冲区。另请参阅 [tf.Transform](https://link.zhihu.com/?target=https%3A//github.com/tensorflow/transform)。

特征工程有时称为特征提取。

*   _**特征集 (feature set)**_

训练机器学习模型时采用的一组[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)。例如，对于某个用于预测房价的模型，邮政编码、房屋面积以及房屋状况可以组成一个简单的特征集。

*   _**特征规范 (feature spec)**_

用于描述如何从 [tf.Example](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23tf.Example) 协议缓冲区提取[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)数据。由于 tf.Example 协议缓冲区只是一个数据容器，因此您必须指定以下内容：

*   要提取的数据（即特征的键）
*   数据类型（例如 float 或 int）
*   长度（固定或可变）

[Estimator API](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Estimators) 提供了一些可用来根据给定 [FeatureColumns](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature_columns) 列表生成特征规范的工具。

*   _**少量样本学习 (few-shot learning)**_

一种机器学习方法（通常用于对象分类），旨在仅通过少量训练样本学习有效的分类器。

另请参阅[单样本学习](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23one-shot_learning)。

*   **_完整 softmax (full softmax)_**

请参阅 [softmax](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23softmax)。与[候选采样](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23candidate_sampling)相对。

*   _**全连接层 (fully connected layer)**_

一种[隐藏层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23hidden_layer)，其中的每个[节点](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23node)均与下一个隐藏层中的每个节点相连。

全连接层又称为[密集层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23dense_layer)。

G
-

*   _**泛化 (generalization)**_

指的是模型依据训练时采用的数据，针对以前未见过的新数据做出正确预测的能力。

*   **_广义线性模型 (generalized linear model)_**

[最小二乘回归](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23least_squares_regression)模型（基于[高斯噪声](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Gaussian_noise)）向其他类型的模型（基于其他类型的噪声，例如[泊松噪声](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Shot_noise)或分类噪声）进行的一种泛化。广义线性模型的示例包括：

*   [逻辑回归](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23logistic_regression)
*   多类别回归
*   最小二乘回归

可以通过[凸优化](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Convex_optimization)找到广义线性模型的参数。

广义线性模型具有以下特性：

*   最优的最小二乘回归模型的平均预测结果等于训练数据的平均标签。
*   最优的逻辑回归模型预测的平均概率等于训练数据的平均标签。

广义线性模型的功能受其特征的限制。与深度模型不同，广义线性模型无法 “学习新特征”。

*   _**梯度 (gradient)**_

[偏导数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23partial_derivative)相对于所有自变量的向量。在机器学习中，梯度是模型函数偏导数的向量。梯度指向最高速上升的方向。

*   _**梯度裁剪 (gradient clipping)**_

在应用[梯度](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient)值之前先设置其上限。梯度裁剪有助于确保数值稳定性以及防止[梯度爆炸](https://link.zhihu.com/?target=http%3A//www.cs.toronto.edu/~rgrosse/courses/csc321_2017/readings/L15%2520Exploding%2520and%2520Vanishing%2520Gradients.pdf)。

*   _**梯度下降法 (gradient descent)**_

一种通过计算并且减小梯度将[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)降至最低的技术，它以训练数据为条件，来计算损失相对于模型参数的梯度。通俗来说，梯度下降法以迭代方式调整参数，逐渐找到[权重](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23weight)和偏差的最佳组合，从而将损失降至最低。

*   _**图 (graph)**_

TensorFlow 中的一种计算规范。图中的节点表示操作。边缘具有方向，表示将某项操作的结果（一个[张量](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/api_docs/python/tf/Tensor%3Fhl%3Dzh-CN)）作为一个操作数传递给另一项操作。可以使用 [TensorBoard](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23TensorBoard) 直观呈现图。

H
-

*   _**启发法 (heuristic)**_

一种非最优但实用的问题解决方案，足以用于进行改进或从中学习。

*   _**隐藏层 (hidden layer)**_

[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)中的合成层，介于[输入层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23input_layer)（即特征）和[输出层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23output_layer)（即预测）之间。神经网络包含一个或多个隐藏层。

*   _**合页损失函数 (hinge loss)**_

一系列用于[分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23classification_model)的[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)函数，旨在找到距离每个训练样本都尽可能远的[决策边界](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23decision_boundary)，从而使样本和边界之间的裕度最大化。[KSVM](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23KSVMs) 使用合页损失函数（或相关函数，例如平方合页损失函数）。对于二元分类，合页损失函数的定义如下：

![](https://pic4.zhimg.com/v2-ebfab84bc249651458e095e5bba077eb_r.jpg)

其中 “y'” 表示分类器模型的原始输出：

![](https://pic1.zhimg.com/v2-20ff10c8a8d99c5813214bc34e3633f0_r.jpg)

“y” 表示真标签，值为 -1 或 +1。

因此，合页损失与 (y * y') 的关系图如下所示：

![](https://pic1.zhimg.com/v2-04ed550600905a76846f65564aee87dc_r.jpg)

*   _**维持数据 (holdout data)**_

训练期间故意不使用（“维持”）的[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)。[验证数据集](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23validation_set)和[测试数据集](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23test_set)都属于维持数据。维持数据有助于评估模型向训练时所用数据之外的数据进行泛化的能力。与基于训练数据集的损失相比，基于维持数据集的损失有助于更好地估算基于未见过的数据集的损失。

*   **_超参数 (hyperparameter)_**

在模型训练的连续过程中，您调节的 “旋钮”。例如，[学习速率](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23learning_rate)就是一种超参数。

与[参数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23parameter)相对。

*   **_超平面 (hyperplane)_**

将一个空间划分为两个子空间的边界。例如，在二维空间中，直线就是一个超平面，在三维空间中，平面则是一个超平面。在机器学习中更典型的是：超平面是分隔高维度空间的边界。[核支持向量机](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23KSVMs)利用超平面将正类别和负类别区分开来（通常是在极高维度空间中）。

I
-

*   _**独立同等分布 (i.i.d, independently and identically distributed)**_

从不会改变的分布中提取的数据，其中提取的每个值都不依赖于之前提取的值。i.i.d. 是机器学习的[理想气体](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Ideal_gas) - 一种实用的数学结构，但在现实世界中几乎从未发现过。例如，某个网页的访问者在短时间内的分布可能为 i.i.d.，即分布在该短时间内没有变化，且一位用户的访问行为通常与另一位用户的访问行为无关。不过，如果将时间窗口扩大，网页访问者的分布可能呈现出季节性变化。

*   _**推断 (inference)**_

在机器学习中，推断通常指以下过程：通过将训练过的模型应用于[无标签样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23unlabeled_example)来做出预测。在统计学中，推断是指在某些观测数据条件下拟合分布参数的过程。（请参阅[维基百科中有关统计学推断的文章](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Statistical_inference)。）

*   _**输入函数 (input function)**_

在 TensorFlow 中，用于将输入数据返回到 [Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Estimators) 的训练、评估或预测方法的函数。例如，训练输入函数会返回[训练集](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23training_set)中的[一批](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23batch)特征和标签。

*   _**输入层 (input layer)**_

[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)中的第一层（接收输入数据的层）。

*   _**实例 (instance)**_

与[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)的含义相同。

*   _**可解释性 (interpretability)**_

模型的预测可解释的难易程度。深度模型通常不可解释，也就是说，很难对深度模型的不同层进行解释。相比之下，线性回归模型和[宽度模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23wide_model)的可解释性通常要好得多。

*   **_评分者间一致性信度 (inter-rater agreement)_**

一种衡量指标，用于衡量在执行某项任务时评分者达成一致的频率。如果评分者未达成一致，则可能需要改进任务说明。有时也称为注释者间一致性信度或评分者间可靠性信度。另请参阅 [Cohen's kappa](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Cohen%2527s_kappa)（最热门的评分者间一致性信度衡量指标之一）。

*   **_迭代 (iteration)_**

模型的权重在训练期间的一次更新。迭代包含计算参数在单[批次](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23batch)数据上的梯度损失。

K
-

*   _**k-means**_

一种热门的[聚类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23clustering)算法，用于对非监督式学习中的样本进行分组。k-means 算法基本上会执行以下操作：

*   以迭代方式确定最佳的 k 中心点（称为[形心](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23centroid)）。
*   将每个样本分配到最近的形心。与同一个形心距离最近的样本属于同一个组。

k-means 算法会挑选形心位置，以最大限度地减小每个样本与其最接近形心之间的距离的累积平方。

以下面的小狗高度与小狗宽度的关系图为例：

![](https://pic2.zhimg.com/v2-c646318286187c4965cb56dd378406a9_r.jpg)

如果 k=3，则 k-means 算法会确定三个形心。每个样本都被分配到与其最接近的形心，最终产生三个组：

![](https://pic3.zhimg.com/v2-81c44cc97984bf5d1d0d8e2a00970742_r.jpg)

假设制造商想要确定小、中和大号狗毛衣的理想尺寸。在该聚类中，三个形心用于标识每只狗的平均高度和平均宽度。因此，制造商可能应该根据这三个形心确定毛衣尺寸。请注意，聚类的形心通常不是聚类中的样本。

上图显示了 k-means 应用于仅具有两个特征（高度和宽度）的样本。请注意，k-means 可以跨多个特征为样本分组。

*   _**k-median**_

与 [k-means](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23k-means) 紧密相关的聚类算法。两者的实际区别如下：

*   对于 k-means，确定形心的方法是，最大限度地减小候选形心与它的每个样本之间的距离平方和。
*   对于 k-median，确定形心的方法是，最大限度地减小候选形心与它的每个样本之间的距离总和。

请注意，距离的定义也有所不同：

*   k-means 采用从形心到样本的[欧几里得距离](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Euclidean_distance)。（在二维空间中，欧几里得距离即使用勾股定理来计算斜边。）例如，(2,2) 与 (5,-2) 之间的 k-means 距离为：

![](https://pic2.zhimg.com/v2-0627a9214510c3fdad172c9b369c1395_r.jpg)

*   k-median 采用从形心到样本的[曼哈顿距离](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Taxicab_geometry)。这个距离是每个维度中绝对差异值的总和。例如，(2,2) 与 (5,-2) 之间的 k-median 距离为：

![](https://pic1.zhimg.com/v2-b9926c744af909d08c1401b7adbc201c_r.jpg)

*   _**Keras**_

一种热门的 Python 机器学习 API。[Keras](https://link.zhihu.com/?target=https%3A//keras.io/) 能够在多种深度学习框架上运行，其中包括 TensorFlow（在该框架上，Keras 作为 [tf.keras](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/api_docs/python/tf/keras%3Fhl%3Dzh-CN) 提供）。

*   _**核支持向量机 (KSVM, Kernel Support Vector Machines)**_

一种分类算法，旨在通过将输入数据向量映射到更高维度的空间，来最大化[正类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23positive_class)和[负类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23negative_class)之间的裕度。以某个输入数据集包含一百个特征的分类问题为例。为了最大化正类别和负类别之间的裕度，KSVM 可以在内部将这些特征映射到百万维度的空间。KSVM 使用[合页损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23hinge-loss)。

L
-

*   _**L1 损失函数 (L₁ loss)**_

一种[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)函数，基于模型预测的值与[标签](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23label)的实际值之差的绝对值。与 [L2 损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23squared_loss)相比，L1 损失函数对离群值的敏感性弱一些。

*   _**L1 正则化 (L₁ regularization)**_

一种[正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regularization)，根据权重的绝对值的总和来惩罚权重。在依赖[稀疏特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sparse_features)的模型中，L1 正则化有助于使不相关或几乎不相关的特征的权重正好为 0，从而将这些特征从模型中移除。与 [L2 正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23L2_regularization)相对。

*   _**L2 损失函数 (L₂ loss)**_

请参阅[平方损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23squared_loss)。

*   _**L2 正则化 (L₂ regularization)**_

一种[正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regularization)，根据权重的平方和来惩罚权重。L2 正则化有助于使离群值（具有较大正值或较小负值）权重接近于 0，但又不正好为 0。（与 [L1 正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23L1_regularization)相对。）在线性模型中，L2 正则化始终可以改进泛化。

*   _**标签 (label)**_

在监督式学习中，标签指[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)的 “答案” 或“结果”部分。有标签数据集中的每个样本都包含一个或多个特征以及一个标签。例如，在房屋数据集中，特征可能包括卧室数、卫生间数以及房龄，而标签则可能是房价。在垃圾邮件检测数据集中，特征可能包括主题行、发件人以及电子邮件本身，而标签则可能是 “垃圾邮件” 或“非垃圾邮件”。

*   _**有标签样本 (labeled example)**_

包含[特征](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23feature)和[标签](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23label)的样本。在监督式训练中，模型从有标签样本中学习规律。

*   _**lambda**_

与[正则化率](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regularization_rate)的含义相同。

（多含义术语，我们在此关注的是该术语在[正则化](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regularization)中的定义。）

*   _**层 (layer)**_

[神经网络](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neural_network)中的一组[神经元](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23neuron)，负责处理一组输入特征，或一组神经元的输出。

此外还指 TensorFlow 中的抽象层。层是 Python 函数，以[张量](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23tensor)和配置选项作为输入，然后生成其他张量作为输出。当必要的张量组合起来后，用户便可以通过[模型函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model_function)将结果转换为 [Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Estimators)。

*   _**Layers API (tf.layers)**_

一种 TensorFlow API，用于以层组合的方式构建[深度](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23deep_model)神经网络。通过 Layers API，您可以构建不同类型的[层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23layer)，例如：

*   通过 `tf.layers.Dense` 构建[全连接层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23fully_connected_layer)。
*   通过 `tf.layers.Conv2D` 构建卷积层。

在编写[自定义 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23custom_estimator) 时，您可以编写 “层” 对象来定义所有[隐藏层](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23hidden_layers)的特征。

Layers API 遵循 [Keras](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Keras) layers API 规范。也就是说，除了前缀不同以外，Layers API 中的所有函数均与 Keras layers API 中的对应函数具有相同的名称和签名。

*   **_学习速率 (learning rate)_**

在训练模型时用于梯度下降的一个标量。在每次迭代期间，[梯度下降法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient_descent)都会将学习速率与梯度相乘。得出的乘积称为梯度步长。

学习速率是一个重要的[超参数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23hyperparameter)。

*   **_最小二乘回归 (least squares regression_)**

一种通过最小化 [L2 损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23L2_loss)训练出的线性回归模型。

*   _**线性回归 (linear regression)**_

一种[回归模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23regression_model)，通过将输入特征进行线性组合输出连续值。

*   _**逻辑回归 (logistic regression)**_

一种模型，通过将 [S 型函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sigmoid_function)应用于线性预测，生成分类问题中每个可能的离散标签值的概率。虽然逻辑回归经常用于[二元分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)问题，但也可用于[多类别](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23multi-class)分类问题（其叫法变为多类别逻辑回归或多项回归）。

*   _**对数 (logits)**_

分类模型生成的原始（非标准化）预测向量，通常会传递给标准化函数。如果模型要解决多类别分类问题，则对数通常变成 [softmax 函数](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/api_docs/python/tf/nn/softmax_cross_entropy_with_logits_v2%3Fhl%3Dzh-CN)的输入。之后，softmax 函数会生成一个（标准化）概率向量，对应于每个可能的类别。

此外，对数有时也称为 [S 型函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sigmoid_function)的元素级反函数。如需了解详细信息，请参阅 [tf.nn.sigmoid_cross_entropy_with_logits](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/api_docs/python/tf/nn/sigmoid_cross_entropy_with_logits%3Fhl%3Dzh-CN)。

*   _**对数损失函数 (Log Loss)**_

二元[逻辑回归](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23logistic_regression)中使用的[损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23loss)函数。

*   _**对数几率 (log-odds)**_

某个事件几率的对数。

如果事件涉及二元概率，则几率指的是成功概率 (p) 与失败概率 (1-p) 之比。例如，假设某个给定事件的成功概率为 90％，失败概率为 10％。在这种情况下，几率的计算公式如下：

![](https://pic2.zhimg.com/v2-81c29e4c50602be64f0bccb676549559_r.jpg)

简单来说，对数几率即几率的对数。按照惯例，“对数” 指自然对数，但对数的基数其实可以是任何大于 1 的数。若遵循惯例，上述示例的对数几率应为：

![](https://pic4.zhimg.com/v2-f489ff34ea4519f58b44fc01c48ab0af_r.jpg)

对数几率是 [S 型函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23sigmoid_function)的反函数。

*   _**损失 (Loss)**_

一种衡量指标，用于衡量模型的[预测](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23prediction)偏离其[标签](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23label)的程度。或者更悲观地说是衡量模型有多差。要确定此值，模型必须定义损失函数。例如，线性回归模型通常将[均方误差](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23MSE)用作损失函数，而逻辑回归模型则使用[对数损失函数](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Log_Loss)。

**M**
-----

*   _**机器学习 (machine learning)**_

一种程序或系统，用于根据输入数据构建（训练）预测模型。这种系统会利用学到的模型根据从分布（训练该模型时使用的同一分布）中提取的新数据（以前从未见过的数据）进行实用的预测。机器学习还指与这些程序或系统相关的研究领域。

*   _**均方误差 (MSE, Mean Squared Error)**_

每个样本的平均平方损失。MSE 的计算方法是[平方损失](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23squared_loss)除以[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)数。[TensorFlow Playground](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23TensorFlow_Playground) 显示的 “训练损失” 值和 “测试损失” 值都是 MSE。

*   _**指标 (metric)**_

您关心的一个数值。可能可以也可能不可以直接在机器学习系统中得到优化。您的系统尝试优化的指标称为[目标](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23objective)。

*   _**Metrics API (tf.metrics)**_

一种用于评估模型的 TensorFlow API。例如，`tf.metrics.accuracy` 用于确定模型的预测与标签匹配的频率。在编写[自定义 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23custom_estimator) 时，您可以调用 Metrics API 函数来指定应如何评估您的模型。

*   **_小批次 (mini-batch)_**

从整批[样本](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23example)内随机选择并在训练或推断过程的一次迭代中一起运行的一小部分样本。小批次的[批次大小](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23batch_size)通常介于 10 到 1000 之间。与基于完整的训练数据计算损失相比，基于小批次数据计算损失要高效得多。

*   _**小批次随机梯度下降法 (SGD, mini-batch stochastic gradient descent)**_

一种采用[小批次](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23mini-batch)样本的[梯度下降法](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23gradient_descent)。也就是说，小批次 SGD 会根据一小部分训练数据来估算梯度。[Vanilla SGD](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23SGD) 使用的小批次的大小为 1。

*   **_ML_**

[机器学习](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23machine_learning)的缩写。

*   _**模型 (model)**_

机器学习系统从训练数据学到的内容的表示形式。多含义术语，可以理解为下列两种相关含义之一：

*   一种 [TensorFlow](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23TensorFlow) 图，用于表示预测的计算结构。
*   该 TensorFlow 图的特定权重和偏差，通过[训练](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model_training)决定。

*   _**模型函数 (model function)**_

[Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23Estimators) 中的函数，用于实现机器学习训练、评估和推断。例如，模型函数的训练部分可以处理以下任务：定义深度神经网络的拓扑并确定其[优化器](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23optimizer)函数。如果使用[预创建的 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23pre-made_Estimator)，则有人已为您编写了模型函数。如果使用[自定义 Estimator](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23custom_estimator)，则必须自行编写模型函数。

有关编写模型函数的详细信息，请参阅[创建自定义 Estimator](https://link.zhihu.com/?target=https%3A//tensorflow.google.cn/get_started/custom_estimators%3Fhl%3Dzh-CN)。

*   _**模型训练 (model training)**_

确定最佳[模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23model)的过程。

*   _**动量 (Momentum)**_

一种先进的梯度下降法，其中学习步长不仅取决于当前步长的导数，还取决于之前一步或多步的步长的导数。动量涉及计算梯度随时间而变化的指数级加权移动平均值，与物理学中的动量类似。动量有时可以防止学习过程被卡在局部最小的情况。

*   _**多类别分类 (multi-class classification)**_

区分两种以上类别的分类问题。例如，枫树大约有 128 种，因此，确定枫树种类的模型就属于多类别模型。反之，仅将电子邮件分为两类（“垃圾邮件” 和 “非垃圾邮件”）的模型属于[二元分类模型](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23binary_classification)。

*   _**多项分类 (multinomial classification)**_

与[多类别分类](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary/%3Fhl%3Dzh-CN%23multi-class)的含义相同。

更多机器学习专业术语（N-Z），请至[谷歌开发者：超全汇总！机器学习常用术语词汇表——下篇（建议收藏）](https://zhuanlan.zhihu.com/p/257987132)查看！或点击下方链接至官网查看完整版：

[机器学习术语表 | Google Developers](https://link.zhihu.com/?target=https%3A//developers.google.cn/machine-learning/glossary%3Fhl%3Dzh-CN)

> 想获取更多 TensorFlow 学习资料？欢迎关注 TensorFlow 官方微信公众号（TensorFlow_official）！

![](https://pic1.zhimg.com/v2-c8664acbdcad2771265424f5991ebb40_b.jpg)