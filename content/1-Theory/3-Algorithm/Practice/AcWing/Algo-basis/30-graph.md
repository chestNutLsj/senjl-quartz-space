---
publish: "true"
tags:
  - Algorithm
  - AcWing
date: 2024-02-27
---
## Storage

树是一种特殊的图，与图的存储方式相同。
对于无向图中的边 ab，存储两条有向边 a->b, b->a。
因此我们可以只考虑有向图的存储。

1) 邻接矩阵：`g[a][b]` 存储边 a->b

2) 邻接表：
```cpp
// 对于每个点k，开一个单链表，存储k所有可以走到的点。h[k]存储这个单链表的头结点
int h[N], e[N], ne[N], idx;

// 添加一条边a->b
void add(int a, int b)
{
    e[idx] = b, ne[idx] = h[a], h[a] = idx ++ ;
}

// 初始化
idx = 0;
memset(h, -1, sizeof(h));
```

>[!note] `memset(h,-1,sizeof(h));` 是什么意思？
> `memset(h, -1, sizeof(h));` 这段代码使用 C++标准库函数 `memset` 来设置一段内存区域。具体到这个例子中，它的作用是将数组 `h` 中的每个字节都设置为 `-1`。这里的 `sizeof(h)` 用于确定 `h` 占用的总字节数，以确保整个数组都被设置。**值 `-1` 在大多数平台上以补码形式表示为所有位都为** `1`。
>
> 此代码片段通常用于初始化或重置数据。使用 `-1` 作为填充值，特别是在 `h` 数组用于表示一些特殊的标记或状态时（例如，使用非负整数索引数组时，`-1` 可以表示某些特殊条件，如“未使用”或“无效”）。
> 
> 需要注意的是，当 `h` 是基本类型（如 `int`、`float` 等）数组时，这种初始化方式通常没有问题。然而，如果 `h` 是非 POD（Plain Old Data，简单旧数据类型）类型的对象数组，使用 `memset` 可能会破坏对象状态或跳过构造函数调用，引入潜在的 bug。在 C++中，更推荐使用类型安全的初始化方法，例如构造函数或 `std::fill` 等 STL 算法。

## Traverse

时间复杂度都是 $O(n+e)$ ，$n$ 表示节点数，$e$ 表示边数。不过由于实现，DFS 由栈实现，因此空间占用为 $O(n)$ ；而 BFS 由队列实现，因此空间占用是 $\mathcal{O}(2^n)$ 。

### BFS

常用于“最短路”情形。

```cpp
queue<int> q;
st[1] = true; // 表示1号点已经被遍历过
q.push(1);

while (q.size())
{
    int t = q.front();
    q.pop();

    for (int i = h[t]; i != -1; i = ne[i])
    {
        int j = e[i];
        if (!st[j])
        {
            st[j] = true; // 表示点j已经被遍历过
            q.push(j);
        }
    }
}
```

#### [847. 图中点的层次](https://www.acwing.com/problem/content/849/)

### DFS

其余情形、或比较怪异的情形，都可以使用 DFS。

```cpp
int dfs(int u)
{
    st[u] = true; // st[u] 表示点u已经被遍历过

    for (int i = h[u]; i != -1; i = ne[i])
    {
        int j = e[i];
        if (!st[j]) dfs(j);
    }
}
```

#### [842. 排列数字](https://www.acwing.com/problem/content/844/)

![[30-graph-dfs-fully-arranged.png]]



#### [843. N-Queens](https://www.acwing.com/problem/content/845/)

#### [846. 树的重心](https://www.acwing.com/problem/content/848/)

## Topology Sort

```cpp
bool topsort()
{
    int hh = 0, tt = -1;

    // d[i] 存储点i的入度
    for (int i = 1; i <= n; i ++ )
        if (!d[i])
            q[ ++ tt] = i;

    while (hh <= tt)
    {
        int t = q[hh ++ ];

        for (int i = h[t]; i != -1; i = ne[i])
        {
            int j = e[i];
            if (-- d[j] == 0)
                q[ ++ tt] = j;
        }
    }

    // 如果所有点都入队了，说明存在拓扑序列；否则不存在拓扑序列。
    return tt == n - 1;
}
```

## Shortest Path

![[30-graph-shortest-path.png]]

### Dijkstra

```cpp
int g[N][N];  // 存储每条边
int dist[N];  // 存储1号点到每个点的最短距离
bool st[N];   // 存储每个点的最短路是否已经确定

// 求1号点到n号点的最短路，如果不存在则返回-1
int dijkstra()
{
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;

    for (int i = 0; i < n - 1; i ++ )
    {
        int t = -1;     // 在还未确定最短路的点中，寻找距离最小的点
        for (int j = 1; j <= n; j ++ )
            if (!st[j] && (t == -1 || dist[t] > dist[j]))
                t = j;

        // 用t更新其他点的距离
        for (int j = 1; j <= n; j ++ )
            dist[j] = min(dist[j], dist[t] + g[t][j]);

        st[t] = true;
    }

    if (dist[n] == 0x3f3f3f3f) return -1;
    return dist[n];
}
```

>[!note] `memset(dist,0x3f,sizeof(dist));` 又是什么意思？
>使用 `memset(h, 0x3f, sizeof(h));` 的写法在 C++中是一种常见的初始化技巧，特别是在图论和动态规划中初始化距离或者成本数组时。这行代码的目的是将数组 `h` 中的每个字节都设置为 `0x3f`。在大多数情况下，这是为了实现以下目的：
>- **初始化为一个较大的数**：`0x3f` 在内存中的二进制表示为 `0011 1111`。连续填充这个值会使整个整数变为一个相对较大的数。具体来说，如果 `h` 是一个 `int` 数组，每个 `int` 由四个这样的字节组成（假设是 32 位系统），那么每个元素会被初始化为 `0x3f3f3f3f`，这在十进制中大约是 `1061109567`。这个数足够大，可以在不影响算法逻辑的前提下，代表“无穷大”或“未初始化”的状态。
>- **图论算法中的应用**：在图论中，尤其是在执行最短路径算法如 Dijkstra 算法时，通常需要一个较大的数来初始化距离数组。使用 `0x3f3f3f3f` 作为初始值是一种常见的做法，因为它既足够大，又不至于在进行加法操作时溢出。
>- **动态规划中的应用**：在动态规划中，特别是在需要最小化成本或距离的问题中，使用 `0x3f3f3f3f` 初始化可以确保任何实际的成本值都会小于这个初始值，从而可以在算法的迭代过程中被更新。
>
>这种初始化方法的优点是快速且简洁。然而，它也要求程序员了解这个值的含义，并注意不要在需要精确表示“无穷大”或在可能发生整数溢出的场景中误用它。

```cpp
// 堆优化版 dijkstra
typedef pair<int, int> PII;

int n;      // 点的数量
int h[N], w[N], e[N], ne[N], idx;       // 邻接表存储所有边
int dist[N];        // 存储所有点到1号点的距离
bool st[N];     // 存储每个点的最短距离是否已确定

// 求1号点到n号点的最短距离，如果不存在，则返回-1
int dijkstra()
{
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    priority_queue<PII, vector<PII>, greater<PII>> heap;
    heap.push({0, 1});      // first存储距离，second存储节点编号

    while (heap.size())
    {
        auto t = heap.top();
        heap.pop();

        int ver = t.second, distance = t.first;

        if (st[ver]) continue;
        st[ver] = true;

        for (int i = h[ver]; i != -1; i = ne[i])
        {
            int j = e[i];
            if (dist[j] > distance + w[i])
            {
                dist[j] = distance + w[i];
                heap.push({dist[j], j});
            }
        }
    }

    if (dist[n] == 0x3f3f3f3f) return -1;
    return dist[n];
}
```

实现堆优化，既可以自己手搓一个堆，也可以调用 `priority_queue` 来实现，
- 前者的优势是可以确保只需要占用 N 个元素的空间，并且支持对任意元素直接修改；
- 后者优势是调用简单，但不支持任意元素直接修改，通常是通过冗余的方式实现，即向堆中插入一个新的元素，从而最终可能达到 M 个元素，如果是稀疏图的话还好，稠密图的话 M 可能会达到 N^2 数量级。不过其实影响也不大，不过是将时间复杂度恶化到 $\mathcal{O}(M\log M)$ ，但是 $\log M$ 和 $\log N$ 仍是同一数量级。

### Bellman-Ford

多源汇最短路：起点不确定，终点不确定，多个询问，每次询问到一对起点和终点之间的最短路径。

```cpp
int n, m;       // n表示点数，m表示边数
int dist[N];        // dist[x]存储1到x的最短路距离

struct Edge     // 边，a表示出点，b表示入点，w表示边的权重
{
    int a, b, w;
}edges[M];

// 求1到n的最短路距离，如果无法从1走到n，则返回-1。
int bellman_ford()
{
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;

    // 如果第n次迭代仍然会松弛三角不等式，就说明存在一条长度是n+1的最短路径，由抽屉原理，路径中至少存在两个相同的点，说明图中存在负权回路。
    for (int i = 0; i < n; i ++ )
    {
        for (int j = 0; j < m; j ++ )
        {
            int a = edges[j].a, b = edges[j].b, w = edges[j].w;
            if (dist[b] > dist[a] + w)
                dist[b] = dist[a] + w;
        }
    }

    if (dist[n] > 0x3f3f3f3f / 2) return -1;
    return dist[n];
}
```

Bellman-Ford 算法循环结束后，可以证明，所有边一定满足 $\text{dist}[b]\le\text{dist}[a]+w$ ，更新过程称为松弛这个三角不等式的过程。

另外，如果有负权环路，那就未必存在最短路径:
- ![[30-graph-non-shortest-path.png]]

另外，Bellman-Ford 算法的迭代次数也是有实际意义的，如果迭代了 k 次，那么此时 `dist[]` 中数据的含义，就是从顶点 1 开始，经过不超过 k 条边，到达所有其他顶点的最小距离。

#### [853. 有边数限制的最短路](https://www.acwing.com/problem/content/855/)

> 通常 SPFA 在各方面都要好于 Bellman-Ford 算法，但是个别情形中只能使用 Bellman-Ford 算法，比如此题。



### SPFA

![[spfa.gif]]

只要没有负环，都可以用 SPFA 。

```cpp
// 队列优化的Bellman-Ford算法
int n;      // 总点数
int h[N], w[N], e[N], ne[N], idx;       // 邻接表存储所有边
int dist[N];        // 存储每个点到1号点的最短距离
bool st[N];     // 存储每个点是否在队列中

// 求1号点到n号点的最短路距离，如果从1号点无法走到n号点则返回-1
int spfa()
{
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;

    queue<int> q; // 队列中存放可以被更新的缩短的距离的点
    q.push(1);
    st[1] = true; // 防止存重复的点

    while (q.size())
    {
        auto t = q.front();
        q.pop();

        st[t] = false;

        for (int i = h[t]; i != -1; i = ne[i])
        {
            int j = e[i];
            if (dist[j] > dist[t] + w[i])
            {
                dist[j] = dist[t] + w[i];
                if (!st[j])     // 如果队列中已存在j，则不需要将j重复插入
                {
                    q.push(j);
                    st[j] = true;
                }
            }
        }
    }

    if (dist[n] == 0x3f3f3f3f) return -1;
    return dist[n];
}
```

```cpp
// SPFA 中是否存在负环
int n;      // 总点数
int h[N], w[N], e[N], ne[N], idx;       // 邻接表存储所有边
int dist[N], cnt[N];        // dist[x]存储1号点到x的最短距离，cnt[x]存储1到x的最短路中经过的点数
bool st[N];     // 存储每个点是否在队列中

// 如果存在负环，则返回true，否则返回false。
bool spfa()
{
    // 不需要初始化dist数组
    // 原理：如果某条最短路径上有n个点（除了自己），那么加上自己之后一共有n+1个点，由抽屉原理一定有两个点相同，所以存在环。

    queue<int> q;
    for (int i = 1; i <= n; i ++ )
    {
        q.push(i);
        st[i] = true;
    }

    while (q.size())
    {
        auto t = q.front();
        q.pop();

        st[t] = false;

        for (int i = h[t]; i != -1; i = ne[i])
        {
            int j = e[i];
            if (dist[j] > dist[t] + w[i])
            {
                dist[j] = dist[t] + w[i];
                cnt[j] = cnt[t] + 1;
                if (cnt[j] >= n) return true;       // 如果从1号点到x的最短路中包含至少n个点（不包括自己），则说明存在环
                if (!st[j])
                {
                    q.push(j);
                    st[j] = true;
                }
            }
        }
    }

    return false;
}
```

### Floyd

能处理负权边，但是不能有负权环

```cpp
初始化：
    for (int i = 1; i <= n; i ++ )
        for (int j = 1; j <= n; j ++ )
            if (i == j) d[i][j] = 0;
            else d[i][j] = INF;

// 算法结束后，d[a][b]表示a到b的最短距离
void floyd()
{
    for (int k = 1; k <= n; k ++ )
        for (int i = 1; i <= n; i ++ )
            for (int j = 1; j <= n; j ++ )
                d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
}
```

## Minimal Spanning Tree

### Prim

- 朴素版的时间复杂度是 $\mathcal{O}(n^{2})$ ，适用于稠密图；
- 堆优化版的时间复杂度是 $\mathcal{O}(m\log n)$ ，适用于稀疏图，不过稀疏图更建议使用 Kruskal 算法。

```cpp
int n;      // n表示点数
int g[N][N];        // 邻接矩阵，存储所有边
int dist[N];        // 存储其他点到当前最小生成树的距离
bool st[N];     // 存储每个点是否已经在生成树中


// 如果图不连通，则返回INF(值是0x3f3f3f3f), 否则返回最小生成树的树边权重之和
int prim()
{
    memset(dist, 0x3f, sizeof dist);

    int res = 0;
    for (int i = 0; i < n; i ++ ) // 找到集合外距离最近的点
    {
        int t = -1;
        for (int j = 1; j <= n; j ++ ) // 用t更新其它各点到集合的距离
            if (!st[j] && (t == -1 || dist[t] > dist[j]))
                t = j;

        if (i && dist[t] == INF) return INF; //距离是正无穷

        if (i) res += dist[t];
        st[t] = true; // 将点加入到集合中去

        for (int j = 1; j <= n; j ++ ) dist[j] = min(dist[j], g[t][j]);
    }

    return res;
}
```

### Kruskal

时间复杂度 $\mathcal{O}(m\log m)$ ；

```cpp
int n, m;       // n是点数，m是边数
int p[N];       // 并查集的父节点数组

struct Edge     // 存储边
{
    int a, b, w;

    bool operator< (const Edge &W)const
    {
        return w < W.w;
    }
}edges[M];

int find(int x)     // 并查集核心操作
{
    if (p[x] != x) p[x] = find(p[x]);
    return p[x];
}

int kruskal()
{
    sort(edges, edges + m); // 将所有边按权重从小到大排序 O(mlogm)

    for (int i = 1; i <= n; i ++ ) p[i] = i;    // 初始化并查集

    int res = 0, cnt = 0;
    for (int i = 0; i < m; i ++ )
    {
        int a = edges[i].a, b = edges[i].b, w = edges[i].w;

        a = find(a), b = find(b);
        if (a != b)     // 如果两个连通块不连通，则将这两个连通块合并
        {
            p[a] = b;
            res += w;
            cnt ++ ;
        }
    }

    if (cnt < n - 1) return INF; // 说明树不连通
    return res;
}
```

## Bipartite Graph

当一个图是二分图，当且仅当图中不含**奇数环**（环中的边数是奇数）。

### 染色法

时间复杂度 $\mathcal{O}(n+m)$ ；

```cpp
int n;      // n表示点数
int h[N], e[M], ne[M], idx;     // 邻接表存储图
int color[N];       // 表示每个点的颜色，-1表示未染色，0表示白色，1表示黑色

// 参数：u表示当前节点，c表示当前点的颜色
bool dfs(int u, int c)
{
    color[u] = c;
    for (int i = h[u]; i != -1; i = ne[i])
    {
        int j = e[i];
        if (color[j] == -1)
        {
            if (!dfs(j, !c)) return false;
        }
        else if (color[j] == c) return false;
    }

    return true;
}

bool check()
{
    memset(color, -1, sizeof color);
    bool flag = true;
    for (int i = 1; i <= n; i ++ )
        if (color[i] == -1)
            if (!dfs(i, 0))
            {
                flag = false;
                break;
            }
    return flag;
}
```

#### [257. 关押罪犯](https://www.acwing.com/problem/content/259/)

### 匈牙利算法

![[30-graph-hungary.png]]

时间复杂度为 $\mathcal{O}(mn)$ ，但实际运行时间远小于此复杂度。

```cpp
int n1, n2;     // n1表示第一个集合中的点数，n2表示第二个集合中的点数
int h[N], e[M], ne[M], idx;     // 邻接表存储所有边，匈牙利算法中只会用到从第一个集合指向第二个集合的边，所以这里只用存一个方向的边
int match[N];       // 存储第二个集合中的每个点当前匹配的第一个集合中的点是哪个
bool st[N];     // 表示第二个集合中的每个点是否已经被遍历过

bool find(int x)
{
    for (int i = h[x]; i != -1; i = ne[i])
    {
        int j = e[i];
        if (!st[j])
        {
            st[j] = true;
            if (match[j] == 0 || find(match[j]))
            {
                match[j] = x;
                return true;
            }
        }
    }

    return false;
}

// 求最大匹配数，依次枚举第一个集合中的每个点能否匹配第二个集合中的点
int res = 0;
for (int i = 1; i <= n1; i ++ )
{
    memset(st, false, sizeof st);
    if (find(i)) res ++ ;
}
```

