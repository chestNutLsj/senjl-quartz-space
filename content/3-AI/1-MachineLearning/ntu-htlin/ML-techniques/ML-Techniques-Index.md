---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
---
![[ML-techniques-Intro-course-logo.png]]
<center>课程 Logo</center>

## Prerequisites

- 数据结构
- Python
- [[ML-Foundations-Index|机器学习基石]]

## Rules

从《基石》中的原理出发，深入一些复杂的机器学习模型。

## Roadmap

这门课中一个关键就是**特征转换**，处理特征转换有三个关键技巧，并各自代表了三个重要模型：

### Embedding Numerous Features: Kernel Models

> How to **exploit** and **regularize** numerous features?

1. [[10-Linear-Support-Vector-Machine|Linear Support Vector Machine]]: **linear** SVM: more **robust** and solvable with **quadratic programming**;
2. [[20-Dual-Support-Vector-Machine|Dual Support Vector Machine]]: **dual** SVM: another QP with **valuable geometric messages** and *almost* **no dependence on** $\tilde{d}$ ;
3. [[30-Kernel-Support-Vector-Machine|Kernel Support Vector Machine]]: **kernel** as a shortcut to (transform + inner product) to **remove dependence on** $\tilde{d}$ : allowing a spectrum of simple (**linear**) models to infinite dimensional (**Gaussian**) ones with margin control;
4. [[40-Soft-Margin-Support-Vector-Machine|Soft-Margin Support Vector Machine]]: allow some **margin violations** $\xi_{n}$ while penalizing them by $C$ ;equivalent to **upper-bounding** $\alpha_{n}$ by $C$ ;
5. [[50-Kernel-Logistic-Regression|Kernel Logistic Regression]]: **two-level** learning for **SVM-like sparse model** for soft classification, or using **representer theorem** with **regularized logistic error** for dense model;
6. [[60-Support-Vector-Regression|Support Vector Regression]]:

### Combining Predictive Features: Aggregation Models

> How to **construct** and **blend** predictive features?

1. [[70-Blending-and-Bagging|Blending and Bagging]]: **blending** known diverse hypotheses **uniformly**, **linearly**, or even **non-linearly**; obtaining diverse hypotheses from **bootstrapped data**; 
2. [[80-Adaptive-Boosting|Adaptive Boosting]]: 

### Distilling Implicit Features: Extraction Models

> How to identify and learn implicit features?