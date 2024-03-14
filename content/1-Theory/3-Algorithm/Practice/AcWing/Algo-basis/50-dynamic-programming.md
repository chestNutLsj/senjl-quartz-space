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

![[50-dynamic-programming-01-kanp.png]]

```cpp
// 01-knapsack
#include <iostream>

using namespace std;

const int N = 1010;
int       f[N][N];    // f[i][j] 表示只看前i件物品，总体积是j的情况下，最大的总价值
int       v[N], w[N]; // 记录每个物品的体积和价值

/*

result = max{f[n][0],f[n][1],f[n][2],...,f[n][V]}

计算f[i][j]:

    0. f[0][0]=0 ，最开始时只有一个合法状态;(全局变量会在堆中存储，所有元素都会初始化为0)
    1. 不选第i个物品，f[i][j]=f[i-1][j];
    2. 选第i个物品，  f[i][j]=f[i-1][j-v[i]];
    3. f[i][j]=max{(1.), (2.)}

时间复杂度：O(n*V)

*/

int main() {
    int num, vol;
    cin >> num >> vol;
    for (int i = 1; i <= num; i++)
        cin >> v[i] >> w[i];

    for (int i = 1; i <= num; i++)
        for (int j = 0; j <= vol; j++) {
            f[i][j] = f[i - 1][j];
            if (j >= v[i]) // 背包体积至少要大于物品体积才可以选择
                f[i][j] = max(f[i][j], f[i - 1][j - v[i]] + w[i]);
        }

    int res = 0;
    for (int i = 0; i <= vol; i++) res = max(res, f[num][i]);
    cout << res << endl;

    return 0;
}
```

DP 优化都是对基本递推方程的变形，所以一切基于基本的递推方程。上面的二阶矩阵可以考虑改用滚动数组的形式来优化：由于对 $f_i$ 有影响的只有 $f_{i-1}$，可以去掉第一维，直接用 $f_{i}$ 来表示处理到当前物品时背包容量为 $i$ 的最大价值，得出以下方程：：
$$
f_j=\max \left(f_j,f_{j-v_i}+w_i\right)
$$

```cpp
#include <iostream>
using namespace std;
const int N = 1010;
int       f[N];       // f[i] 表示总体积是i的情况下，最大的总价值
int       v[N], w[N]; // 记录每个物品的体积和价值
int main() {
    int num, vol;
    cin >> num >> vol;
    for (int i = 1; i <= num; i++)
        cin >> v[i] >> w[i];
    for (int i = 1; i <= num; i++)
        for (int j = vol; j >= v[i]; j--)
            f[j] = max(f[j], f[j - v[i]] + w[i]);
    cout << f[vol] << endl;
    return 0;
}
```

### [003. 完全背包问题](https://www.acwing.com/problem/content/3/)

![[50-dynamic-programming-full-knap.png]]

```cpp
// 未优化状态方程版
#include <iostream>
using namespace std;
const int N = 1010;
int       f[N][N];    // f[i][j] 表示前i件物品在总体积是j的情况下，最大的总价值
int       v[N], w[N]; // 记录每个物品的体积和价值

int main() {
    int num, vol;
    cin >> num >> vol;
    for (int i = 1; i <= num; i++)
        cin >> v[i] >> w[i];
    for (int i = 1; i <= num; i++)
        for (int j = 0; j <= vol; j++)
            for (int k = 0; k * v[i] <= j; k++)
                f[i][j] = max(f[i][j], f[i - 1][j - k * v[i]] + k * w[i]);
    cout << f[num][vol] << endl;
    return 0;
}

// 优化状态方程版
int main() {
    int num, vol;
    cin >> num >> vol;
    for (int i = 1; i <= num; i++)
        cin >> v[i] >> w[i];

    for (int i = 1; i <= num; i++)
        for (int j = 0; j <= vol; j++)
            if (v[i] <= j) // 第 i 种能放进去
                f[i][j] = max(f[i - 1][j], f[i][j - v[i]] + w[i]);
            else // 如果第 i 件物品不能放进去
                f[i][j] = f[i - 1][j];

    cout << f[num][vol] << endl;

    return 0;
}
```

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