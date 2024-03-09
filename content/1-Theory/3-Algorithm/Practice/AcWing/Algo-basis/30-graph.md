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
//邻接表
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

//邻接矩阵
void bfs() {
    d[1] = 0; // 从1号点出发，到自身的距离是0
    st[1] = true;
    q.push(1);
    while (!q.empty()) {
        int t = q.front();
        q.pop();
        for (int i = 1; i <= n; i++) {
            // 对于t的每个邻接点，如果没有被访问过，则更新距离，并加入队列
            if (g[t][i] == 1 && !st[i]) {
                d[i] = d[t] + 1;
                q.push(i);
                st[i] = true;
            }
        }
    }
}
```

#### [844. 迷宫问题](https://www.acwing.com/problem/content/description/846/)

**思路**：从起点开始，往前走第一步，记录下所有第一步能走到的点，然后从所第一步能走到的点开始，往前走第二步，记录下所有第二步能走到的点，重复下去，直到走到终点。输出步数即可。

**实现方式**：BFS
- 用 g 存储地图，f 存储起点到其他各个点的距离。从起点开始广度优先遍历地图。当地图遍历完，就求出了起点到各个点的距离，输出 `f[n][m]` 即可。
- ![[30-graph-maze.png]]
- `void bfs (int a, int b)`：广度优遍历函数。输入的是起点坐标。
- `queue<PII> q;`：用来存储每一步走到的点。
- `while (!q.empty ())` 循环：循环依次取出同一步数能走到的点，再往前走一步。
- `int dx[4] = {0, 1, 0, -1}, dy[4] = {-1, 0, 1, 0};`：一个点往下一步走得时候，可以往上下左右四方向走。

```cpp
#include <algorithm>
#include <cstring>
#include <iostream>
#include <queue>

using namespace std;
typedef pair<int, int> PII;

const int N = 110;
int       g[N][N]; // 存储地图
int       f[N][N]; // 存储距离
int       n, m;

void bfs(int a, int b) // 广度优先遍历
{
    queue<PII> q;
    q.push({a, b});

    while (!q.empty()) {
        PII start = q.front();
        q.pop();

        int dx[4] = {0, 1, 0, -1}, dy[4] = {-1, 0, 1, 0};
        for (int i = 0; i < 4; i++) // 往四个方向走
        {
            // 当前点能走到的点
            int x = start.first + dx[i], y = start.second + dy[i];
            // 如果还没有走过
            if (g[x][y] == 0) {
                // 走到这个点，并计算距离
                g[x][y] = 1;
                f[x][y] = f[start.first][start.second] + 1; // 从当前点走过去，则距离等于当前点的距离+1.
                // 这个点放入队列，用来走到和它相邻的点。
                q.push({x, y});
            }
        }
    }
    cout << f[n][m] << endl;
}

// void bfs_print() {
//     int        target = f[n][m];
//     queue<PII> q;
//     q.push({n, m});
//     cout << n << " " << m << endl;
//     while (!q.empty()) {
//         PII start = q.front();
//         q.pop();

//         int dx[4] {0, 1, 0, -1}, dy[4] {1, 0, -1, 0};
//         for (int i = 0; i < 4; i++) {
//             int x = dx[i] + start.first, y = dy[i] + start.second;
//             if (x >= 1 && y >= 1 && x <= n && x <= m && f[x][y] == target - 1) {
//                 q.push({x, y});
//                 cout << x << " " << y << endl;
//             }
//         }
//         target--;
//         if (target == 1) {
//			   break;
//		   }
//     }
// }

int main() {
    memset(g, 1, sizeof(g));
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            cin >> g[i][j];

    bfs(1, 1);
    // bfs_print();

    return 0;
}
```

#### [845. 八数码](https://www.acwing.com/problem/content/847/)

![[30-graph-845.png]]

从题目中提取信息：求最小步数 $\to$ BFS 策略。
那么如何实现状态的转换？通过将 x 上下左右移动，作为一次状态转换：
![[30-graph-845-2.png]]
而移动方式可以通过两个数组实现：`dx[4]={1,-1,0,0}` 和 `dy[x]={0,0,1,-1}` ，于是移动之后 x 的坐标 `(a,b)=(x+dx[i],y+dy[i])` 。

将每一种情况视作一个节点，那么目标情况就是终点，从初试状况移动到目标情况的最小步数，就是一个抽象的最短路问题。

那么如何存储每个情况？将矩阵转化为字符串！
![[30-graph-4.png]]
如何记录每一个状态的“距离”？队列可以用 `queue<string>` 直接存转化后的字符串，dist 数组用 `unordered_map<string, int>` 将字符串和数字联系在一起，字符串表示状态，数字表示距离。

```cpp
#include <algorithm>
#include <iostream>
#include <queue>
#include <unordered_map>

using namespace std;

int bfs(string start) {
    // 定义目标状态
    string end = "12345678x";
    // 定义队列和dist数组
    queue<string>              q;
    unordered_map<string, int> d;
    // 初始化队列和dist数组
    q.push(start);
    d[start] = 0;
    // 转移方式
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};

    while (q.size()) {
        auto t = q.front();
        q.pop();
        // 记录当前状态的距离，如果是最终状态则返回距离
        int distance = d[t];
        if (t == end) return distance;
        // 查询x在字符串中的下标，然后转换为在矩阵中的坐标
        int k = t.find('x');
        int x = k / 3, y = k % 3;

        for (int i = 0; i < 4; i++) {
            // 求转移后x的坐标
            int a = x + dx[i], b = y + dy[i];
            // 当前坐标没有越界
            if (a >= 0 && a < 3 && b >= 0 && b < 3) {
                // 转移x
                swap(t[k], t[a * 3 + b]);
                // 如果当前状态是第一次遍历，记录距离，入队
                if (!d.count(t)) {
                    d[t] = distance + 1;
                    q.push(t);
                }
                // 还原状态，为下一种转换情况做准备
                swap(t[k], t[a * 3 + b]);
            }
        }
    }
    // 无法转换到目标状态，返回-1
    return -1;
}

int main() {
    string c, start;
    // 输入起始状态
    for (int i = 0; i < 9; i++) {
        cin >> c;
        start += c;
    }

    cout << bfs(start) << endl;

    return 0;
}
```

#### [847. 图中点的层次](https://www.acwing.com/problem/content/849/)

```cpp
// 图中点的层次
#include <iostream>
#include <queue>

using namespace std;

const int N = 100010;
int       n, m; // n nodes,m edges
int       a, b; // 有向边a-->b的两个端点
// int        g[N][N] = {0}; //! 邻接矩阵存储图。不可行⚠️因为N*N*1Byte=10^10Byte=10GB，远超系统能够提供给一般程序的内存空间
int        h[N], e[N], ne[N], idx; // 邻接表存储图
queue<int> q;                      // 维护遍历到的节点
int        st[N];                  // 标记节点是否被访问过
int        d[N];                   // 存储从1号点到每个点的最短距离

void add(int a, int b) {
    e[idx] = b, ne[idx] = h[a], h[a] = idx++;
}

void init() {
    idx = 0;
    fill(h, h + N, -1);
    fill(d, d + N, -1); // 初始化距离数组
    fill(st, st + N, 0);
}

void bfs() { // 1号点到其它点的最短距离
    st[1] = true;
    d[1]  = 0;
    q.push(1);
    while (!q.empty()) {
        int t = q.front();
        q.pop();
        for (int i = h[t]; i != -1; i = ne[i]) { // 对于t的每个邻接点，如果没有被访问过，则更新距离并加入队列之中
            int j = e[i];
            if (!st[j]) {
                st[j] = true;
                d[j]  = d[t] + 1;
                q.push(j);
            }
        }
    }
}

int main() {
    cin >> n >> m;
    init();
    for (int i = 0; i < m; i++) { // 存储图
        cin >> a >> b;
        add(a, b);
    }

    bfs(); // 从1节点开始bfs
    cout << d[n];
    return 0;
}
```

### DFS

其余情形、或比较怪异的情形，都可以使用 DFS。

```cpp
void dfs(int u) {
    st[u] = true; // 做标记，已经被搜索过了
    for (int i = h[u]; i != -1; i = ne[i]) {
        int tmp = e[i]; // 暂存当前链表中节点对应图中点的编号
        if (!st[tmp]) {
            dfs(tmp); // 如果没有搜索过，那就深入搜索
        }
    }
}
```

#### [842. 排列数字](https://www.acwing.com/problem/content/844/)

![[30-graph-dfs-fully-arranged.png]]

```cpp
// fully arrangement
#include <iostream>

using namespace std;

const int N = 10;
int       n;
int       path[N];  // 从0到n-1共n个位置 存放一个排列
bool      state[N]; // 存放每个数字的使用状态 true表示使用了 false表示没使用过

void dfs(int u) {
    if (u == n) // 一个排列填充完成
    {
        for (int i = 0; i < n; i++) printf("%d ", path[i]);
        puts(""); // 相当于输出一个回车
        return;
    }

    for (int i = 1; i <= n; i++) {
        if (!state[i]) {
            path[u]  = i;     // 把 i 填入数字排列的位置上
            state[i] = true;  // 表示该数字用过了 不能再用
            dfs(u + 1);       // 这个位置的数填好 递归到右面一个位置
            state[i] = false; // 恢复现场 该数字后续可用
        }
    } // for 循环全部结束了 dfs(u)才全部完成 回溯

    return;
}

int main() {
    scanf("%d", &n);

    dfs(0); // 在path[0]处开始填数

    return 0;
}
```

#### [843. N-Queens](https://www.acwing.com/problem/content/845/)

![[30-graph-N-Queens.png]]

对角线 `dg[u+i]` 、反对角线 `udg[n-u+i]` 中的索引 `u+i` 和 `n-u+i` 表示的是截距。核心思路就是通过查找合法的下标表示 dg 和 udg ，看看是否被标记过。

```cpp
// N-Queens
#include <iostream>
using namespace std;
const int N = 20;

// bool数组用来判断搜索的下一个位置是否可行
// col列，dg对角线，udg反对角线
// g[N][N]用来存路径

int  n;
char g[N][N];
bool col[N], dg[N], udg[N];

void dfs(int u) {
    // u == n 表示已经搜了n行，故输出这条路径
    if (u == n) {
        for (int i = 0; i < n; i++) puts(g[i]); // 等价于cout << g[i] << endl;
        puts("");                               // 换行
        return;
    }

    // 枚举u这一行，搜索合法的列
    int x = u;
    for (int y = 0; y < n; y++)
        // 剪枝(对于不满足要求的点，不再继续往下搜索)
        if (col[y] == false && dg[y - x + n] == false && udg[y + x] == false) {
            col[y] = dg[y - x + n] = udg[y + x] = true;
            g[x][y]                             = 'Q';
            dfs(x + 1);
            g[x][y] = '.'; // 恢复现场
            col[y] = dg[y - x + n] = udg[y + x] = false;
        }
}

int main() {
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            g[i][j] = '.';

    dfs(0);

    return 0;
}
```

另一种一维数组的实现：
```cpp
#include <iostream>
using namespace std;
const int N = 10;
int       st[N], used[N];
int       n;

bool valid(int u) { // 判断函数，因为使用了used记录，所以一定不会在同一列，只需要判断对角线
    for (int i = 1; i < u; i++) {
        if ((abs((u - i)) == abs(st[u] - st[i])))
            return false;
    }
    return true;
    /*
    这里用到了数学知识 |u-i| == |st[u] - st[i]|

    比如st为{1,3,2,4}，列为1,2,3,4
    Q . . .
    . . Q .
    . Q . .
    . . . Q
    第3列 减 第2列 为 3 - 2 = 1
    |st[3] - st[1]| = |2 - 3| = 1
    所以在同一对角线
    */
}

// dfs模板
void dfs(int u) {
    // 结束条件，按st里的数字决定是Q还是.
    if (u > n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (j == st[i])
                    cout << 'Q';
                else {
                    cout << '.';
                }
            }
            puts("");
        }
        puts(""); // 答案之间有一个空行
        return;
    }

    for (int i = 1; i <= n; i++) {
        if (used[i] == 0) {
            st[u] = i;
            if (!valid(u)) {
                st[u] = 0;
                continue; // 如果当前数字不行，则跳过该数字，且不用改变used
            }
            used[i] = 1;
            dfs(u + 1); // 恢复现场
            used[i] = 0;
            st[u]   = 0;
        }
    }
}

int main() {
    cin >> n;
    dfs(1);
    return 0;
}

```

关键变量解释

- `int st[N]`: 存储每一行皇后的列位置。`st[i] = j`表示第`i`行的皇后放在第`j`列。
- `int used[N]`: 标记某一列是否已经放置了皇后，防止在同一列放置两个皇后。
- `int n`: 棋盘的大小，即行数和列数。

函数解释

- `valid` 函数：这个函数是用来判断当前位置 `(u, st[u])` 是否可以放置皇后，即它与之前放置的所有皇后都不在同一对角线上。通过计算行列差的绝对值是否相等来判断是否在同一对角线上。如果在同一对角线上，则返回 `false`；否则，返回 `true`。
- `dfs` 函数：这是深度优先搜索的核心逻辑，用来递归地在每一行尝试放置皇后。
	- `u` 是当前正在处理的行。
	- 当 `u` 超过 `n` 时，说明找到了一个解决方案，输出当前棋盘的状态，其中 `Q` 表示放置了皇后，`.` 表示空位。
	- 在每一行 `u`，尝试将皇后放置在所有可能的列 `i` 上。如果列 `i` 尚未使用（即 `used[i] == 0`），则检查在 `u` 行 `i` 列放置皇后是否有效（即不会与之前的皇后相互攻击）。
		- 如果放置无效，则继续尝试下一列。
		- 如果放置有效，则标记该列已被使用（`used[i] = 1`），并递归地在下一行继续放置皇后（`dfs(u + 1)`）。
		- 递归返回后，需要“恢复现场”，即撤销对当前行和列的放置和标记，以便尝试其他放置方案。

#### [846. 树的重心](https://www.acwing.com/problem/content/848/)

```cpp
// Tree's center of gravity
#include <cstring>
#include <iostream>

using namespace std;

const int N = 100010, M = N * 2;
int       h[N], e[M], ne[M], idx; // 树是稀疏图，故用邻接表存储
bool      st[N];                  // 存放节点是否已经遍历
int       ans;                    // 记录全局的答案
int       n;                      // 记录树的节点总数
int       a, b;                   // 记录树边a-->b

void add(int a, int b) { // 添加一条边a-->b
    e[idx]  = b;
    ne[idx] = h[a];
    h[a]    = idx++;
}

void init() {
    idx = 0;
    memset(h, -1, sizeof(h));
    memset(st, 0, sizeof(st));
    ans = n;
}

int dfs(int u) {          // 返回以u为根的子树的规模
    st[u]   = true;       // 做标记，已经被搜索过了
    int sum = 1, res = 0; // sum记录当前子树的规模，res记录删去该点后其余连通块的最大值
    for (int i = h[u]; i != -1; i = ne[i]) {
        int j = e[i]; // 暂存当前链表中节点对应图中点的编号
        if (!st[j]) {
            int s = dfs(j); // 如果没有搜索过，那就深入搜索，根据递归，返回的就是当前节点子树的规模
            res   = max(res, s);
            sum += s;
        }
    }
    res = max(res, n - sum); // 判断子树规模和父亲所在连通块的规模孰大
    ans = min(ans, res);
    return sum;
}

int main() {

    cin >> n;
    init();
    for (int i = 1; i < n; i++) {
        cin >> a >> b;
        add(a, b), add(b, a); // 无向边，所以要加两条
    }
    dfs(1);
    cout << ans << endl;
    return 0;
}
```

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

```cpp
#include <iostream>
#include <queue>

using namespace std;

const int   N = 100010;
int         n, m;
int         h[N], e[N], ne[N], idx;
int         d[N];   // 保存各个点的入度
queue<int>  q;      // 队列保存入度为0的点
vector<int> result; // 保存拓扑排序结果

void add(int a, int b) {
    e[idx]  = b;
    ne[idx] = h[a];
    h[a]    = idx++;
}

void init() {
    idx = 0;
    fill(h, h + N, -1);
    fill(d, d + N, 0);
}

void topoSort() {
    for (int i = 1; i <= n; i++)
        if (d[i] == 0) q.push(i);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        result.push_back(u);
        for (int i = h[u]; i != -1; i = ne[i]) {
            int v = e[i];
            d[v]--;
            if (d[v] == 0)
                q.push(v);
        }
    }

    if (result.size() == n) { // 检查是否所有顶点都被访问，确保图为DAG
        for (int i = 0; i < n; ++i) {
            cout << result[i] << ' ';
        }
        cout << endl;
    } else {
        cout << -1 << endl; // 图中存在环，无法进行拓扑排序
    }
}

int main() {
    cin >> n >> m;
    init();
    while (m--) {
        int a, b; // a-->b
        cin >> a >> b;
        d[b]++;
        add(a, b);
    }
    topoSort();
    return 0;
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

#### [849. Dijkstra(1)](https://www.acwing.com/problem/content/851/)

```cpp
// Dijkstra
#include <iostream>

using namespace std;

const int N = 510, INF = 0x3f3f3f3f;
int       g[N][N]; // 存储图
int       dist[N]; // 存储1号点到每个点的最短距离
bool      st[N];   // 存储每个点的最短路是否已经确定
int       n, m;

void init() {
    fill(dist, dist + N, INF);
    fill(g[0], g[0] + N * N, INF);
    fill(st, st + N, 0);
    dist[1] = 0;
}

int dijkstra() {
    for (int i = 0; i < n - 1; i++) {
        int t = -1;
        for (int j = 1; j <= n; j++)
            if (!st[j] && (t == -1 || dist[t] > dist[j])) t = j;

        // 用t更新其它点的距离
        for (int j = 1; j <= n; j++)
            if (g[t][j] != INF)
                dist[j] = min(dist[j], dist[t] + g[t][j]);

        st[t] = true;
    }

    if (dist[n] == INF) return -1;
    return dist[n];
}

int main() {
    cin >> n >> m;
    init();
    while (m--) {
        int x, y, z;
        cin >> x >> y >> z;
        g[x][y] = min(g[x][y], z); // 防止重边，选择最小边
    }
    cout << dijkstra();
    return 0;
}
```

#### [850. Dijkstra(2)](https://www.acwing.com/problem/content/852/)

```cpp
// Heap-optimized Dijkstra
#include <iostream>
#include <queue>

using namespace std;
typedef pair<int, int> PII; // first存储距离，second存储节点编号

const int N = 200010, INF = 0x3f3f3f3f;
int       n, m;
int       h[N], e[N], w[N], ne[N], idx; // 邻接表存储各点的头、边、边权、下一节点、索引
int       dist[N];                      // 存储节点1到其余所有节点的距离
bool      st[N];

priority_queue<PII, vector<PII>, greater<PII>> heap;

void add(int a, int b, int c) {
    e[idx]  = b;
    w[idx]  = c;
    ne[idx] = h[a];
    h[a]    = idx++;
}

void init() {
    fill(dist, dist + N, INF);
    fill(st, st + N, 0);
    fill(h, h + N, -1);
    dist[1] = 0;
}

int dijkstra() { // 计算节点1到其余所有节点的距离
    heap.push({0, 1});
    while (heap.size()) {
        auto t = heap.top(); // 距离源点最近的点
        heap.pop();
        int vertex = t.second;
        if (st[vertex]) continue; // 如果距离已经确定，则跳过该点
        st[vertex] = true;

        for (int i = h[vertex]; i != -1; i = ne[i]) {
            int j = e[i];
            if (dist[j] > dist[vertex] + w[i]) {
                dist[j] = dist[vertex] + w[i];
                heap.push({dist[j], j}); // 距离变小，则入堆
            }
        }
    }
    if (dist[n] == INF) return -1;

    return dist[n];
}

int main() {
    cin >> n >> m;
    init();
    while (m--) {
        int x, y, z;
        cin >> x >> y >> z;
        add(x, y, z);
    }
    cout << dijkstra();
    return 0;
}
```

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

