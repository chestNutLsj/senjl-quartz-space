---
publish: "true"
tags:
  - Algorithm
  - AcWing
date: 2024-02-24
---
## 链表

### 存储

在机试中不要使用动态创建节点再组成链表的方式，在链表较大时甚至直接超时：
```cpp
struct Node{
	int val;
	Node *next;
};

Node* head = new Node(); // 非常耗时
```

通常使用数组模拟链表的方式，这样的优势就是**快**，这种方式也称为静态链表，能够做到指针式的动态链表的所有操作：

![[20-data-struct-linkedtable-storage.png]]

### 单链表

单链表一般是邻接表的形式，用于存储图和树

```cpp
// head存储链表头，e[]存储节点的值，ne[]存储节点的next指针，idx表示当前用到了哪个节点
int head, e[N], ne[N], idx;

// 初始化
void init()
{
    head = -1; 
    idx = 0;   // 数组中所有位置都还未被分配
}

// 在链表头插入一个数a
void insertAsHead(int a)
{
    e[idx] = a, ne[idx] = head, head = idx ++ ;
}

void insertAsSucc(int k, int a){ //在k位置的节点后插入
	e[idx]=a;
	ne[idx]=ne[k];
	ne[k]=idx;
	idx++;
}

void removeSucc(int k){ //删除k位置后面的一个节点
	ne[k]=ne[ne[k]]; //不要在意浪费，这不是工程
}

// 将头结点删除，需要保证头结点存在
void remove()
{
    head = ne[head];
}
```

### 双链表

常用于优化特殊问题。

```cpp
// e[]表示节点的值，l[]表示节点的左指针，r[]表示节点的右指针，idx表示当前用到了哪个节点
int e[N], l[N], r[N], idx;

// 初始化
void init()
{
    //0是左端点，1是右端点
    r[0] = 1, l[1] = 0;
    idx = 2; // 位置0、1都已占用
}

// 在节点a的右边插入一个数x
void insert(int a, int x)
{
    e[idx] = x;
    l[idx] = a, r[idx] = r[a];
    l[r[a]] = idx, r[a] = idx ++ ;
}

// 删除节点a
void remove(int a)
{
    l[r[a]] = l[a];
    r[l[a]] = r[a];
}
```

## 栈

### 建栈

同样使用数组模拟栈，并且栈的操作非常简单，使用栈顶指针完全能够实现：

```cpp
// tt表示栈顶
int stk[N], tt = 0;

// 向栈顶插入一个数
stk[ ++ tt] = x;

// 从栈顶弹出一个数
tt -- ;

// 栈顶的值
stk[tt];

// 判断栈是否为空，如果 tt > 0，则表示不为空
if (tt > 0)
{

}
```

### 单调栈

```cpp
// 常见模型：找出每个数左边离它最近的比它大/小的数
int tt = 0;
for (int i = 1; i <= n; i ++ )
{
    while (tt && check(stk[tt], i)) tt -- ;
    stk[ ++ tt] = i;
}
```

## 队列

### 建队

```cpp
/*****************单向队列******************/
// hh 表示队头，tt表示队尾
int q[N], hh = 0, tt = -1;

// 向队尾插入一个数
q[ ++ tt] = x;

// 从队头弹出一个数
hh ++ ;

// 队头的值
q[hh];

// 判断队列是否为空，如果 hh <= tt，则表示不为空
if (hh <= tt)
{

}

/*****************循环单向队列******************/
// hh 表示队头，tt表示队尾的后一个位置
int q[N], hh = 0, tt = 0;

// 向队尾插入一个数
q[tt ++ ] = x;
if (tt == N) tt = 0;

// 从队头弹出一个数
hh ++ ;
if (hh == N) hh = 0;

// 队头的值
q[hh];

// 判断队列是否为空，如果hh != tt，则表示不为空
if (hh != tt)
{

}
```

### 单调队列

```cpp
//常见模型：找出滑动窗口中的最大值/最小值
int hh = 0, tt = -1;
for (int i = 0; i < n; i ++ )
{
    while (hh <= tt && check_out(q[hh])) hh ++ ;  // 判断队头是否滑出窗口
    while (hh <= tt && check(q[tt], i)) tt -- ;
    q[ ++ tt] = i;
}
```

数组实现的线性表，比 STL 的优势就是速度快、占用小，但是编译器开 O2 优化的话，STL 的速度也相差无几。

## 字符串模式匹配

### KMP

```cpp
// s[]是长文本，p[]是模式串，n是s的长度，m是p的长度
求模式串的Next数组：
for (int i = 2, j = 0; i <= m; i ++ )
{
    while (j && p[i] != p[j + 1]) j = ne[j];
    if (p[i] == p[j + 1]) j ++ ;
    ne[i] = j;
}

// 匹配
for (int i = 1, j = 0; i <= n; i ++ )
{
    while (j && s[i] != p[j + 1]) j = ne[j];
    if (s[i] == p[j + 1]) j ++ ;
    if (j == m)
    {
        j = ne[j];
        // 匹配成功后的逻辑
    }
}
```

```cpp
int match ( char* P, char* T ) {  //KMP算法
	int* next = buildNext ( P ); //构造next表
	int n = ( int ) strlen ( T ), i = 0; //文本串指针
	int m = ( int ) strlen ( P ), j = 0; //模式串指针
	while ( j < m  && i < n ) { //自左向右逐个比对字符  
	    if ( 0 > j || T[i] == P[j] ) //若匹配，或P已移出最左侧（两个判断的次序不可交换）
	        { i ++;  j ++; } //则转到下一字符
	    else //否则
	        j = next[j]; //模式串右移（注意：文本串不用回退）

	delete [] next; //释放next表
	return i - j;
}

int* buildNext ( char* P ) { //构造模式串P的next表
	size_t m = strlen ( P ), j = 0; //“主”串指针
	int* next = new int[m]; int t = next[0] = -1; //next表，首项必为-1
	while ( j < m - 1 )
	    if ( 0 > t || P[t] == P[j] ) { //匹配
	        ++t; ++j; next[j] = t; //则递增赋值：此处可改进...
	    } else //否则
	        t = next[t]; //继续尝试下一值得尝试的位置
	return next;
}
```

## Trie 树

高效地存储和查找字符串集合的数据结构：
- 存储：从 root 开始，逐个存储字符串，每层存放一个字符，在字符串结束时做结束标记；
- 查找：从 root 开始，从上到下检验节点是否与给定字符串的对应字符匹配；

![[20-data-struct-trie.png]]

```cpp
int son[N][26], cnt[N], idx;
// 0号点既是根节点，又是空节点
// son[][]存储树中每个节点的子节点
// cnt[]存储以每个节点结尾的单词数量

// 插入一个字符串
void insert(char *str)
{
    int p = 0;
    for (int i = 0; str[i]; i ++ )
    {
        int u = str[i] - 'a';
        if (!son[p][u]) son[p][u] = ++ idx;
        p = son[p][u];
    }
    cnt[p] ++ ;
}

// 查询字符串出现的次数
int query(char *str)
{
    int p = 0;
    for (int i = 0; str[i]; i ++ )
    {
        int u = str[i] - 'a';
        if (!son[p][u]) return 0;
        p = son[p][u];
    }
    return cnt[p];
}
```

### [最大异或对](https://www.acwing.com/problem/content/145/)

## 并查集

优势：
1. 将两个集合合并
2. 询问两个元素是否在一个集合当中

```cpp
/*************Init****************/
int fa[MAXN];
inline void init(int n)
{
    for (int i = 1; i <= n; ++i)
        fa[i] = i;
}

/*************Find****************/
int find(int x)
{
    if(fa[x] == x)
        return x;
    else
        return find(fa[x]);
}

/*************Merge****************/
inline void merge(int i, int j)
{
    fa[find(i)] = find(j);
}

/*************Erase****************/
struct dsu {
  vector<size_t> pa, size;

  explicit dsu(size_t size_) : pa(size_ * 2), size(size_ * 2, 1) {
    iota(pa.begin(), pa.begin() + size_, size_);
    iota(pa.begin() + size_, pa.end(), size_);
  }

  void erase(size_t x) {
    --size[find(x)];
    pa[x] = x;
  }
};


/*************Move****************/
void dsu::move(size_t x, size_t y) {
  auto fx = find(x), fy = find(y);
  if (fx == fy) return;
  pa[x] = fy;
  --size[fx], ++size[fy];
}

/*************Compress****************/
int find(int x)
{
    if(x == fa[x])
        return x;
    else{
        fa[x] = find(fa[x]); //父节点设为根节点
        return fa[x];        //返回父节点
    }
}

/************Rank-based Merge************/
inline void init(int n)
{
    for (int i = 1; i <= n; ++i)
    {
        fa[i] = i;
        rank[i] = 1;
    }
}
inline void merge(int i, int j)
{
    int x = find(i), y = find(j);    //先找到两个根节点
    if (rank[x] <= rank[y])
        fa[x] = y;
    else
        fa[y] = x;
    if (rank[x] == rank[y] && x != y)
        rank[y]++;                   //如果深度相同且根节点不同，则新的根节点的深度+1
}
```

## 二叉堆

这里建立的是小顶堆

```cpp
// h[N]存储堆中的值, h[1]是堆顶，x的左儿子是2x, 右儿子是2x + 1
// ph[k]存储第k个插入的点在堆中的位置
// hp[k]存储堆中下标是k的点是第几个插入的
int h[N], ph[N], hp[N], size;

// 交换两个点，及其映射关系
void heap_swap(int a, int b)
{
    swap(ph[hp[a]],ph[hp[b]]);
    swap(hp[a], hp[b]);
    swap(h[a], h[b]);
}

void down(int u)
{
    int t = u;
    if (u * 2 <= size && h[u * 2] < h[t]) t = u * 2;
    if (u * 2 + 1 <= size && h[u * 2 + 1] < h[t]) t = u * 2 + 1;
    if (u != t)
    {
        heap_swap(u, t);
        down(t);
    }
}

void up(int u)
{
    while (u / 2 && h[u] < h[u / 2])
    {
        heap_swap(u, u / 2);
        u >>= 1;
    }
}

// O(n)建堆
for (int i = n / 2; i; i -- ) down(i);
```

## 哈希表

### 哈希操作

```cpp
// 拉链法
int h[N], e[N], ne[N], idx;

// 向哈希表中插入一个数
void insert(int x)
{
	int k = (x % N + N) % N; // 让余数变为正数，k就是哈希值，C++中对负数取模比较诡异
	e[idx] = x; // 链表的插入操作
	ne[idx] = h[k];
	h[k] = idx ++ ;
}

// 在哈希表中查询某个数是否存在
bool find(int x)
{
	int k = (x % N + N) % N;
	for (int i = h[k]; i != -1; i = ne[i])
		if (e[i] == x)
			return true;

	return false;
}

//开放寻址法
//经验上说，这里数组长度要开到题目的数据范围的2~3倍
int h[N];

// 如果x在哈希表中，返回x的下标；如果x不在哈希表中，返回x应该插入的位置
int find(int x)
{
	int t = (x % N + N) % N;
	while (h[t] != null && h[t] != x) //这里null设置一个不在数据范围内的任意数即可，作为位置为空的标记
	{
		t ++ ;
		if (t == N) t = 0;
	}
	return t;
}
```

### [字符串哈希](https://www.acwing.com/problem/content/843/)

核心思想：将字符串看成 P 进制数，P 的经验值是 131 或 13331，取这两个值的冲突概率低
小技巧：取模的数用 2^64，这样直接用 unsigned long long 存储，溢出的结果就是取模的结果

```cpp
typedef unsigned long long ULL;
ULL h[N], p[N]; // h[k]存储字符串前k个字母的哈希值, p[k]存储 P^k mod 2^64

// 初始化
p[0] = 1;
for (int i = 1; i <= n; i ++ )
{
    h[i] = h[i - 1] * P + str[i];
    p[i] = p[i - 1] * P;
}

// 计算子串 str[l ~ r] 的哈希值
ULL get(int l, int r)
{
    return h[r] - h[l - 1] * p[r - l + 1];
}
```

注意，不能将字母映射为 0 。

## STL

vector, 变长数组，倍增的思想
    size ()  返回元素个数
    empty ()  返回是否为空
    clear ()  清空
    front ()/back ()
    push_back ()/pop_back ()
    begin ()/end ()
    [] 支持随机寻址
    支持比较运算，按元素的字典序比较

pair<int, int>
    first, 第一个元素
    second, 第二个元素
    支持比较运算，以 first 为第一关键字，以 second 为第二关键字（字典序）
    make_pair ()

string，字符串
    size ()/length ()  返回字符串长度
    empty ()
    clear ()
    substr (起始下标，(子串长度))  返回子串
    c_str ()  返回字符串所在字符数组的起始地址

queue, 队列
    size ()
    empty ()
    push ()  向队尾插入一个元素
    front ()  返回队头元素
    back ()  返回队尾元素
    pop ()  弹出队头元素

priority_queue, 优先队列，默认是大根堆
    size ()
    empty ()
    push ()  插入一个元素
    top ()  返回堆顶元素
    pop ()  弹出堆顶元素
    定义成小根堆的方式：priority_queue<int, vector<int>, greater<int>> q;

stack, 栈
    size ()
    empty ()
    push ()  向栈顶插入一个元素
    top ()  返回栈顶元素
    pop ()  弹出栈顶元素

deque, 双端队列
    size ()
    empty ()
    clear ()
    front ()/back ()
    push_back ()/pop_back ()
    push_front ()/pop_front ()
    begin ()/end ()
    []

set, map, multiset, multimap, 基于平衡二叉树（红黑树），动态维护有序序列
    size ()
    empty ()
    clear ()
    begin ()/end ()
    ++, -- 返回前驱和后继，时间复杂度 O (logn)

    set/multiset
        insert ()  插入一个数
        find ()  查找一个数
        count ()  返回某一个数的个数
        erase ()
            (1) 输入是一个数 x，删除所有 x   O (k + logn)
            (2) 输入一个迭代器，删除这个迭代器
        lower_bound ()/upper_bound ()
            lower_bound (x)  返回大于等于 x 的最小的数的迭代器
            upper_bound (x)  返回大于 x 的最小的数的迭代器
    map/multimap
        insert ()  插入的数是一个 pair
        erase ()  输入的参数是 pair 或者迭代器
        find ()
        []  注意 multimap 不支持此操作。 时间复杂度是 O (logn)
        lower_bound ()/upper_bound ()

unordered_set, unordered_map, unordered_multiset, unordered_multimap, 哈希表
    和上面类似，增删改查的时间复杂度是 O (1)
    不支持 lower_bound ()/upper_bound ()， 迭代器的++，--

bitset, 圧位
    bitset<10000> s;
    ~, &, |, ^
    >>, <<
    ==, !=
    []

    count ()  返回有多少个 1

    any ()  判断是否至少有一个 1
    none ()  判断是否全为 0

    set ()  把所有位置成 1
    set (k, v)  将第 k 位变成 v
    reset ()  把所有位变成 0
    flip ()  等价于~
    flip (k) 把第 k 位取反
