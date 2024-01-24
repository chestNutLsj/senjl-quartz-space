---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
date: 2023-12-30
---
![[00-ML-foundation-Intro-logo.png]]

<center>课程 Logo（学到第 13 节时会揭秘它的由来）</center>

## Prerequisites

- 数据结构
- 线性代数
- 概率论与数理统计
- 高等数学（微积分、泰勒展开、解析几何、拉格朗日乘数法）

## Rules

学习基础原理，做驾驭机器学习技术的人，而非被眼花缭乱的机器学习技术所束缚。

## Roadmap

### When Can Machines Learn?

1. [[10-The-Learning-Problem|The Learning Problem]]: $\mathcal{A}$ takes $\mathcal{D}$ and $\mathcal{H}$ to get *g*;
2. [[20-Learning-to-Answer-Y-N|Learning to Answer Yes or No]]: **PLA** $\mathcal{A}$ takes **linear separable** $\mathcal{D}$ and **perceptrons** $\mathcal{H}$ to get **hypothesis** *g*;
3. [[30-Types-of-Learning|Types of Learning]]: **Binary classification** or **regression** from a **batch** of **supervised** data with **concrete** features;
4. [[40-Feasibility-of-Learning|Feasibility of Learning]]:  Learning is **PAC-possible** if enough **statistical data** and **finite** $|\mathcal{H}|$;

### Why Can Machines Learn?

1. [[50-Training-versus-Testing|Training versus Testing]]: **effective** price of choice in training: **growth function** $m_{\mathcal{H}}(N)$ with a **break point**;
2. [[60-Theory-of-Generalization|Theory of Generalization]]: $E_{out}\approx E_{in}$ possible if **$m_{\mathcal{H}}$ breaks somewhere** and ***N* large enough**;
3. [[70-The-VC-Dimension|The VC Dimension]]: learning happens in **finite** $d_{VC}$, **large** $N$, and **low** $E_{in}$;
4. [[80-Noise-and-Error|Noise and Error]]: learning can happen with **target distribution** $P(y|\mathbf{x})$ and **low** $E_{in}$ **with respect to** $\text{err}$;

### How Can Machines Learn?

1. [[90-Linear-Regression|Linear Regression]]: analytic solution $\mathbf{w}_{LIN}=\rm X^{\dagger}\mathbf{y}$ with **linear regression hypotheses** and **squared error**;
2. [[A0-Logistic-Regression|Logistic Regression]]: **gradient descent** on **cross-entropy error** to get good **logistic hypothesis**;
3. [[B0-Linear-Models-for-Classification|Linear Models for Classification]]: **binary classification** via (logistic) **regression**; **multiclass** via **OVA/OVO decomposition**;
4. [[C0-Nonlinear-Transformation|Nonlinear Transformation]]: **nonlinear** $\mathcal{H}$ via **nonlinear feature transform** $\Phi$ plus **linear** $\mathcal{H}$ with price of **model complexity**;

### How Can Machines Learn Better?

1. [[D0-Hazard-of-Overfitting|Hazard of Overfitting]]: overfitting happens with **excessive power**, **stochastic/deterministic noise**, and **limited data**;
2. [[E0-Regularization|Regularization]]: minimizes **augmented error**, where the added **regularizer** effectively **limits model complexity**;
3. [[F0-Validation|Validation]]: (**crossly**) reserve **validation data** to simulate testing procedure for **model selection**;
4. [[G0-Three-Learning-Principles|Three Learning Principles]]: **Occam's Razor**, **Sampling Bias** and **Data Snooping**.