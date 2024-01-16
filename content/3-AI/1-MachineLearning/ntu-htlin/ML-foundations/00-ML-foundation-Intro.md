---
publish: "true"
tags:
  - 机器学习
  - 林轩田
  - ML
---
## Prerequisites

- 数据结构
- Python
- 线性代数
- 概率论与数理统计

## Rules

专注基础原理，做运用机器学习技术的人，而非被眼花缭乱的机器学习技术所束缚。

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
3. [[B0-Linear-Models-for-Classification|Linear Models for Classification]]: 

### How Can Machines Learn Better?

