---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2023-12-30
---
## What is Machine Learning?

从学习到机器学习：
- 学习：观察➡学习、总结➡技能
- 机器学习：数据集➡机器学习➡机器的技能

什么是技能？
- 改进某一行为的性能，如预测时正确率的提高

![[10-The-Learning-Problem-ML.png]]

机器学习的适用场景：
- 在人类无法预先编写好全部的规则时
- 人们无法简单地定义结果时
- ![[10-The-Learning-Problem-ML-scenarios.png]]

**授之以“渔”而非授之以“鱼”！**

机器学习的 performance 进步之关键：
- 存在某些潜在的可以被学习的模式
- 并不是简单地可以编程的、确定的问题
- 存在可以学习的数据集

## Applications of Machine Learning

![[10-The-Learning-Problem-ML-app.png]]

- **推荐系统**：
	- ![[10-The-Learning-Problem-recommender-system.png]]
	- 对用户喜好和电影特点分别做特征提取——得到特征向量，二者特征向量内积，高者代表用户喜好与本电影的特点匹配程度更高，于是将本电影推荐给该用户
- **正确率预测**

## Components of Machine Learning

以银行批准申请信用卡为例，提出 ML 的数学标记：
![[10-The-Learning-Problem-approve-credit.png]]

![[10-The-Learning-Problem-formalize.png]]
- **输入**：客户的数据情况，其中样本为 $\mathbf{x}$，数据集为 $\mathcal{X}$,
- **输出**：机器学习模型对批准信用卡与否的预测概率，其中对应每个样本的输出为 $y$，全部输出的集合为 $\mathcal{Y}$,
- **目标函数**：从数据集到预测概率的映射 $f:\mathcal{X}\rightarrow\mathcal{Y}$，注意==这个映射关系从始至终都是未知的、未定的==，能够确定的是它的确存在，但形式未知,
- **训练样本、数据集**：对每一个输入 $\mathbf{x}$ 所对应输出 $y$ 的 pair 集合，$\mathcal{D}=\{(\mathbf{x}_1,y_1),(\mathbf{x}_2,y_2),(\mathbf{x}_3,y_3),...,(\mathbf{x}_N,y_N)\}$,
- **选择的最佳假设**：达到足够精度的预测 $g:\mathcal{X}\rightarrow\mathcal{Y}$，这里 *g* 就是对 *f* 的一个最佳估计。

![[10-The-Learning-Problem-learning-model.png]]
- 假设集 $\mathcal{H}$ 是对这个未定的映射 *f* 的估计的集合，训练的过程就是**通过对数据的学习**找到其中最好的一个假设，即是 *g* ；
- 所谓机器学习的模型，就是**学习算法** $\mathcal{A}$ 和**假设集** $\mathcal{H}$ 的结合。

## Machine Learning and Other Fields

- **数据挖掘**：
	- ![[10-The-Learning-Problem-ML-vs-DM.png]]

- **人工智能**：
	- ![[10-The-Learning-Problem-ML-vs-AI.png]]
	- ML 是实现 AI 的一种方法；
	- 譬如下棋，既可以从数据集中学习高胜率的方法，也可以尝试“这样下会输”从而避免之；

- **统计**：
	- ![[10-The-Learning-Problem-ML-vs-statistics.png]]
	- 统计有许多实现 ML 的手段；