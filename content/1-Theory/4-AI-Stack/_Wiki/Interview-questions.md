## Questions

### Attention

1. MLA 的机制，MLA 的矩阵吸收是什么？prefill 和 decode 阶段是否都要做矩阵吸收？—— [[DeepSeek-MLA-Principle#矩阵吸收及其在 MLA 实现中的应用|矩阵吸收在 MLA 中的应用]]。
2. Sparse Attention： [[DeepSeek Sparse Attention]]
3. Flash Attention

### MoE

### Inference

1. 介绍 continuous batching 和 chunked prefill
2. Prefix Caching：同一个 batch 内的 prompt 之间可能有共同的前缀，怎么在 prefill 阶段利用它来减少重复计算？

### Parallelism

1. 如何设计模型训练的 3D 并行
2. 训练占用的内存在 3D 并行下如何估计
3.  PP 的 bubble 问题

### CUDA/GPU

1. 多维 tentor 的 transpose kernel 怎么设计？是否需要根据 i, j 的位置设计不同的 kernel？
2. GPU 相关的基本术语

### Hybrid Precision Training

#### Quantinization

### Profiling

1. 如何用 roofline 分析系统瓶颈

## Code

1. LeetCode: LRU，
2. 1.leetcode 无重复字符的最长子串 图论：岛屿数量、岛屿最大面积 链表：反转链表、删除链表中重复的元素II、K个一组反转链表 二叉树：层序遍历、中序遍历 前K个高频元素 滑动窗口最大值 动态规划：买卖股票全系列，最长回文子串，最长公共子序列，编辑距离 合并区间 回溯：括号生成 2.非leetcode 快排 二分查找写一个开三次根号函数，误差在1e-5 输入123输出321 用随机数函数randf（）表示概率，如从一个数组中取出某个数的概率为0.5这样 3.cuda 尽量不要写naive版本 reduce（至少要用warp shuffle） 二维大矩阵reduce，（1000000，128）矩阵reduce到（1，128） GEMM的一些优化方法（一个thread算多个数，数据复用；访存合并；双buffer边读边算；避免bank conflict） layernorm softmax onlin softmax