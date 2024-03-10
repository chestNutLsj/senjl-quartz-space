---
publish: "true"
tags:
  - Algorithm
  - AcWing
date: 2024-02-28
---
## 质数

所有小于等于 1 的整数既不是质数也不是合数。

### 试除法求素数

>[!note] 质数的判定：试除法
>1) d|n 代表的含义是 d 能整除 n, (这里的”|”代表整除)
>2) 一个合数的约数总是成对出现的, 如果 d|n,那么 (n/d)|n, 因此我们判断一个数是否为质数的时候,只需要判断较小的那一个数能否整除 n 就行了, 即只需枚举 d<=(n/d), 即 dd<=n, d<=sqrt (n)就行了.
>3) `sqrt(n)` 这个函数执行的时候比较慢.

如果想要快速求出大于某个数的素数（这对设置散列表的表长非常有用），可以：

```cpp
for (int i = 100000;; i++) {
	bool flag = true;
	for (int j = 2; j * j <= i; j++) {
		if (i % j == 0) {
			flag = false;
			break;
		}
	}
	if (flag) {
		cout << i << endl;
		break;
	}
}

// 要判断一个数是不是素数，只需要：
bool is_prime(int x)
{
    if (x < 2) return false;
    for (int i = 2; i <= x / i; i ++ )
        if (x % i == 0)
            return false;
    return true;
}
```

### 分解质因数

5. 分解质因数------试除法. (用到的原理:唯一分解定理 (算数基本定理))
(1). 特别要注意------分解质因数与质因数不一样!!!!!!
(2). 分解质因数是一个过程, 而质因数是一个数.
(3). 一个合数分解而成的质因数最多只包含一个大于 sqrt (n)的质因数
(反证法, 若 n 可以被分解成两个大于 sqrt (n)的质因数, 则这两个质因数相乘的结果大于 n, 与事实矛盾).
(4). 当枚举到某一个数 i 的时候, n 的因子里面已经不包含 2-i-1 里面的数,
如果 `n%i==0`, 则 i 的因子里面也已经不包含 2-i-1 里面的数, 因此每次枚举的数都是质数.
(5).算数基本定理 (唯一分解定理): 任何一个大于 1 的自然数 N, 如果 N 不为质数, 那么 N 可以唯一分解成有限个质数的乘积
N=P1a1P2a2P3a3...... Pnan，这里 P1<P2<P3......<Pn 均为质数，其中指数 ai 是正整数。
这样的分解称为 N 的标准分解式。最早证明是由欧几里得给出的，由陈述证明。
此定理可推广至更一般的交换代数和代数数论。
(6). 质因子（或质因数）在数论里是指能整除给定正整数的质数。根据算术基本定理，不考虑排列顺序的情况下，
每个正整数都能够以唯一的方式表示成它的质因数的乘积。
(7). 两个没有共同质因子的正整数称为互质。因为 1 没有质因子，1 与任何正整数（包括 1 本身）都是互质。
(8). 只有一个质因子的正整数为质数。


```cpp
// 判断质因数
void divide(int x) 
{
    for (int i = 2; i <= x / i; i ++ )
        if (x % i == 0)
        {
            int s = 0;
            while (x % i == 0) x /= i, s ++ ;
            cout << i << ' ' << s << endl;
        }
    if (x > 1) cout << x << ' ' << 1 << endl;
    cout << endl;
}
/*从小到大的顺序输出其分解质因数后，每个质因数的底数和指数，每个底数和指数占一行。

每个正整数的质因数全部输出完毕后，输出一个空行。*/
```

### 朴素筛法

1). 做法: 把 2~(n-1)中的所有的数的倍数都标记上, 最后没有被标记的数就是质数.
(2). 原理: 假定有一个数 p 未被 2~(p-1)中的数标记过, 那么说明, 不存在 2~(p-1)中的任何一个数的倍数是 p,
也就是说 p 不是 2~(p-1)中的任何数的倍数, 也就是说 2~(p-1)中不存在 p 的约数, 因此, 根据质数的定义可知:
p 是质数.
(3). 调和级数: 当 n 趋近于正无穷的时候, 1/2+1/3+1/4+1/5+…+1/n=lnn+c.(c 是欧阳常数, 约等于 0.577 左右.).
(4). 底数越大, log 数越小
(4). 时间复杂度: 约为 O (nlogn);(注: 此处的 log 数特指以 2 为底的 log 数).

```cpp
int primes[N], cnt;     // primes[]存储所有素数
bool st[N];         // st[x]存储x是否被筛掉

void get_primes(int n)
{
    for (int i = 2; i <= n; i ++ )
    {
        if (st[i]) continue;
        primes[cnt ++ ] = i;
        for (int j = i + i; j <= n; j += i)
            st[j] = true;
    }
}
```

### 埃氏筛法

(1). 质数定理:1~n 中有 n/lnn 个质数.
(2). 原理: 在朴素筛法的过程中只用质数项去筛.
(3). 时间复杂度:粗略估计: O (n).实际: O (nlog (logn)).
(4). 1~n 中, 只计算质数项的话,”1/2+1/3+1/4+1/5+…+1/n”的大小约为 log (logn).

### 线性筛法

首先，线性筛法是对埃氏筛法的优化：因为即使埃氏筛法是朴素做法的优化版，但是还是会重复标记一个合数。
因此，线性筛法的核心步骤，就是避免将一个合数被标记多次，以此达到 $O (n)$ 的时间复杂度。体现在代码里面，就是：`if (i % primes[j] == 0) break;`。

y 总的解释是：`primes[j]` 一定是 i 的最小质因子。但是这句话并不清晰，或者说由这句话还可以得出一个结论：i 是个合数，并且之前已经被 primes[j] 筛过了。再换个说法，就是说 i 不论乘什么数，都是 primes[j] 的倍数。这就意味着，不需要再使用 i 去筛其他的数，因为 primes[j] 会代劳。
例如：如果 i 是 10，第一个质数是 2，那么 10 % 2 == 0。10 不论乘多少（得到 30, 50, 70, ......），都是第一个质数 2 的倍数，所以没必要用 10 去筛其他数，避免重复标记，因此 break 掉。

但是为什么要把 st[primes[j] * i] = true; 放在前面？我个人是这么理解的，例如 20，分解质因数为 2 * 2 * 5，但是因为每次只有一个质数和 i 相乘，所以只有在 i == 10 的情况下才能筛掉 20（分解为 2 * 10）。依此类推。

还有一个问题，为什么不用写 j < cnt？因为：
- 如果 i 是质数，那么在循环之前已经被加入到了 primes[] 中，所以一定会存在 i % primes[j] == 0 成立（两个相同的数相除，和为 1，余数为 0），break 掉。
- 如果 i 是合数，一定会存在一个最小质因子，使得 if 语句成立，break 掉；或者在这之前，因为不满足循环条件从而停止循环。

还需注意的是，此处的循环条件 primes[j] <= n / i 代表的不是 primes[j] <= sqrt (n)。取原式的等号，可以得到：primes[j] = n / i，因此可以得到 n = primes[j] * i。也就是说这个条件所代表的是：在 i 已经确定的情况下，primes[j] 为多少才能使得结果小于约束条件 n。因为在这个写法里，要求出的是 1~n 之间的质数。

```cpp
vector<int> get_divisors(int x)
{
    vector<int> res;
    for (int i = 1; i <= x / i; i ++ )
        if (x % i == 0)
        {
            res.push_back(i);
            if (i != x / i) res.push_back(x / i);
        }
    sort(res.begin(), res.end());
    return res;
}
```

## 约数

### [869. 试除法求约数](https://www.acwing.com/problem/content/description/871/)

```cpp
// 试除法求约数

#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        vector<int> res;
        // 因为约数成对出现，所以只需要循环到根号x
        //  不要是用 i *i <= n，因为可能溢出
        for (int i = 1; i <= n / i; i++) {
            if (n % i == 0) {
                res.push_back(i);
                // 如果i * i = x,添加i即可，不用添加 x / i
                if (n / i != i)
                    res.push_back(n / i);
            }
        }
        sort(res.begin(), res.end());
        for (auto x : res) cout << x << " ";
        cout << endl;
    }
}
```

### 最大公约数

```cpp
int gcd(int a, int b)
{
    return b ? gcd(b, a % b) : a;
}
```

![[40-math-knowledge-gcd.png]]

### 扩展欧几里得算法

```cpp
// 求x, y，使得ax + by = gcd(a, b)
int exgcd(int a, int b, int &x, int &y)
{
    if (!b)
    {
        x = 1; y = 0;
        return a;
    }
    int d = exgcd(b, a % b, y, x);
    y -= (a/b) * x;
    return d;
}
```

## 欧拉函数

```cpp
// 朴素欧拉
int phi(int x)
{
    int res = x;
    for (int i = 2; i <= x / i; i ++ )
        if (x % i == 0)
        {
            res = res / i * (i - 1);
            while (x % i == 0) x /= i;
        }
    if (x > 1) res = res / x * (x - 1);

    return res;
}

// 筛法求欧拉
int primes[N], cnt;     // primes[]存储所有素数
int euler[N];           // 存储每个数的欧拉函数
bool st[N];         // st[x]存储x是否被筛掉


void get_eulers(int n)
{
    euler[1] = 1;
    for (int i = 2; i <= n; i ++ )
    {
        if (!st[i])
        {
            primes[cnt ++ ] = i;
            euler[i] = i - 1;
        }
        for (int j = 0; primes[j] <= n / i; j ++ )
        {
            int t = primes[j] * i;
            st[t] = true;
            if (i % primes[j] == 0)
            {
                euler[t] = euler[i] * primes[j];
                break;
            }
            euler[t] = euler[i] * (primes[j] - 1);
        }
    }
}
```

## 解线性方程组

```cpp
// a[N][N]是增广矩阵
int gauss()
{
    int c, r;
    for (c = 0, r = 0; c < n; c ++ )
    {
        int t = r;
        for (int i = r; i < n; i ++ )   // 找到绝对值最大的行
            if (fabs(a[i][c]) > fabs(a[t][c]))
                t = i;

        if (fabs(a[t][c]) < eps) continue;

        for (int i = c; i <= n; i ++ ) swap(a[t][i], a[r][i]);      // 将绝对值最大的行换到最顶端
        for (int i = n; i >= c; i -- ) a[r][i] /= a[r][c];      // 将当前行的首位变成1
        for (int i = r + 1; i < n; i ++ )       // 用当前行将下面所有的列消成0
            if (fabs(a[i][c]) > eps)
                for (int j = n; j >= c; j -- )
                    a[i][j] -= a[r][j] * a[i][c];

        r ++ ;
    }

    if (r < n)
    {
        for (int i = r; i < n; i ++ )
            if (fabs(a[i][n]) > eps)
                return 2; // 无解
        return 1; // 有无穷多组解
    }

    for (int i = n - 1; i >= 0; i -- )
        for (int j = i + 1; j < n; j ++ )
            a[i][n] -= a[i][j] * a[j][n];

    return 0; // 有唯一解
}

```

## 组合数

### 递推法求组合数

```cpp
// c[a][b] 表示从a个苹果中选b个的方案数
for (int i = 0; i < N; i ++ )
    for (int j = 0; j <= i; j ++ )
        if (!j) c[i][j] = 1;
        else c[i][j] = (c[i - 1][j] + c[i - 1][j - 1]) % mod;
```

### 预处理逆元法求组合数

首先预处理出所有阶乘取模的余数 `fact[N]`，以及所有阶乘取模的逆元 `infact[N]` 。如果取模的数是质数，可以用费马小定理求逆元。

```cpp
int qmi(int a, int k, int p)    // 快速幂模板
{
    int res = 1;
    while (k)
    {
        if (k & 1) res = (LL)res * a % p;
        a = (LL)a * a % p;
        k >>= 1;
    }
    return res;
}

// 预处理阶乘的余数和阶乘逆元的余数
fact[0] = infact[0] = 1;
for (int i = 1; i < N; i ++ )
{
    fact[i] = (LL)fact[i - 1] * i % mod;
    infact[i] = (LL)infact[i - 1] * qmi(i, mod - 2, mod) % mod;
}
```

### Lucas 定理

若 p 是质数，则对于任意整数 1 <= m <= n，有：
$$
C (n, m) = C (n \% p, m \% p) * C (\frac{n}{p},  \frac{m}{p}) \mod p
$$

```cpp
int qmi(int a, int k, int p)  // 快速幂模板
{
    int res = 1 % p;
    while (k)
    {
        if (k & 1) res = (LL)res * a % p;
        a = (LL)a * a % p;
        k >>= 1;
    }
    return res;
}

int C(int a, int b, int p)  // 通过定理求组合数C(a, b)
{
    if (a < b) return 0;

    LL x = 1, y = 1;  // x是分子，y是分母
    for (int i = a, j = 1; j <= b; i --, j ++ )
    {
        x = (LL)x * i % p;
        y = (LL) y * j % p;
    }

    return x * (LL)qmi(y, p - 2, p) % p;
}

int lucas(LL a, LL b, int p)
{
    if (a < p && b < p) return C(a, b, p);
    return (LL)C(a % p, b % p, p) * lucas(a / p, b / p, p) % p;
}
```

### 分解质因数法求组合数

当我们需要求出组合数的真实值，而非对某个数的余数时，分解质因数的方式比较好用：
1. 筛法求出范围内的所有质数
2. 通过 C (a, b) = a! / b! / (a - b)! 这个公式求出每个质因子的次数。 n! 中 p 的次数是 n / p + n / p^2 + n / p^3 + ...
3. 用高精度乘法将所有质因子相乘

```cpp
int primes[N], cnt;     // 存储所有质数
int sum[N];     // 存储每个质数的次数
bool st[N];     // 存储每个数是否已被筛掉


void get_primes(int n)      // 线性筛法求素数
{
    for (int i = 2; i <= n; i ++ )
    {
        if (!st[i]) primes[cnt ++ ] = i;
        for (int j = 0; primes[j] <= n / i; j ++ )
        {
            st[primes[j] * i] = true;
            if (i % primes[j] == 0) break;
        }
    }
}


int get(int n, int p)       // 求n！中的次数
{
    int res = 0;
    while (n)
    {
        res += n / p;
        n /= p;
    }
    return res;
}


vector<int> mul(vector<int> a, int b)       // 高精度乘低精度模板
{
    vector<int> c;
    int t = 0;
    for (int i = 0; i < a.size(); i ++ )
    {
        t += a[i] * b;
        c.push_back(t % 10);
        t /= 10;
    }

    while (t)
    {
        c.push_back(t % 10);
        t /= 10;
    }

    return c;
}

get_primes(a);  // 预处理范围内的所有质数

for (int i = 0; i < cnt; i ++ )     // 求每个质因数的次数
{
    int p = primes[i];
    sum[i] = get(a, p) - get(b, p) - get(a - b, p);
}

vector<int> res;
res.push_back(1);

for (int i = 0; i < cnt; i ++ )     // 用高精度乘法将所有质因子相乘
    for (int j = 0; j < sum[i]; j ++ )
        res = mul(res, primes[i]);

```

## 博弈论

### [891. NIM游戏](https://www.acwing.com/problem/content/893/)

