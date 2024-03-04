---
publish: "true"
tags:
  - Algorithm
  - AcWing
date: 2024-02-28
---
## 背包问题

![[50-dynamic-programming-knapsack.png]]

### [002. 0/1背包问题](https://www.acwing.com/problem/content/2/)

![[50-dynamic-programming-01knap.png]]

DP 优化都是对基本递推方程的变形，所以一切基于基本的递推方程。

### [003. 完全背包问题](https://www.acwing.com/problem/content/3/)

![[50-dynamic-programming-full-knapsack.png]]

### [005. 多重背包问题 II](https://www.acwing.com/problem/content/5/)

### [006. 多重背包问题 III](https://www.acwing.com/problem/content/6/)

### [007. 混合背包问题](https://www.acwing.com/problem/content/7/)

### [009. 分组背包问题](https://www.acwing.com/problem/content/9/)

## 线性 DP

### [898. 数字三角形](https://www.acwing.com/problem/content/900/)

![[50-dynamic-programming-linear-dp.png]]

### [895. 最长上升子序列](https://www.acwing.com/problem/content/897/)

![[50-dynamic-programming-longest-increasing-seq.png]]

$\mathcal{O}(\text{状态数量}\times\text{计算每个状态需要的时间})=\mathcal{O}(n^{2})$

### [897. 最长公共子序列](https://www.acwing.com/problem/content/899/)

![[50-dynamic-programming-lcs.png]]

注意这里四种情况虽然有重叠，但取 Max 是没关系的，只要不漏就行。

## 区间 DP

### [282. 石子合并](https://www.acwing.com/problem/content/284/)

![[50-dynamic-programming-stone-1.png]]

![[50-dynamic-programming-stone-2.png]]

## 计数类 DP



## 数位统计 DP

### [338. 计数问题](https://www.acwing.com/problem/content/340/)

## 状态压缩 DP

### [291. 蒙德里安的梦想](https://www.acwing.com/problem/content/293/)

### [91. 最短Hamilton路径](https://www.acwing.com/problem/content/93/)

倒数第二个点做分类

![[50-dynamic-programming-number-dp-hilton.png]]

## 树形 DP

### [285. 没有上司的舞会](https://www.acwing.com/problem/content/287/)

![[50-dynamic-programming-tree-1.png]]

![[50-dynamic-programming-tree.png]]

## 记忆化搜索

### [901. 滑雪](https://www.acwing.com/problem/content/903/)

![[50-dynamic-programming-ski-1.png]]

几个要求：
1. 要能滑动下去
2. 不能存在环（不过这个由第(1)个条件可以保障）