---
publish: "true"
tags:
  - Algorithm
  - AcWing
date: 2024-02-24
---
## 排序

### 快速排序

![[10-Algo-Basis-quick-sort.png]]

```cpp
void quick_sort(int q[], int l, int r)
{
    if (l >= r) return; // 递归基

    int i = l - 1, j = r + 1, x = q[l + r >> 1]; // 设置哨兵、分界点
    while (i < j)
    {
        do i ++ ; while (q[i] < x);
        do j -- ; while (q[j] > x); // 分别从左右两端开始，一直找到不符合区间要求的点
        if (i < j) swap(q[i], q[j]); // 交换之
    }
    quick_sort(q, l, j), quick_sort(q, j + 1, r); // 递归处理
}
```

```cpp
//使用三数取中法进行改进
#include <algorithm> // For std::swap
#include <iostream>

// Utility function to find the median of three values
int medianOfThree(int a, int b, int c) {
    if ((a < b) ^ (a < c))
        return a;
    else if ((b < a) ^ (b < c))
        return b;
    else
        return c;
}

void quickSort(int q[], int l, int r) {
    if (l >= r) return; // Base case

    // Middle of three method for pivot selection
    int mid = l + (r - l) / 2;
    int pivot = medianOfThree(q[l], q[mid], q[r]);

    int i = l, j = r;
    while (i <= j) {
        while (q[i] < pivot) i++;
        while (q[j] > pivot) j--;
        if (i <= j) {
            std::swap(q[i], q[j]);
            i++;
            j--;
        }
    }
    // Recursively sort the two partitions
    if (l < j) quickSort(q, l, j);
    if (i < r) quickSort(q, i, r);
}

// Example usage
int main() {
    int arr[] = {9, -3, 5, 2, 6, 8, -6, 1, 3};
    int n = sizeof(arr) / sizeof(arr[0]);

    quickSort(arr, 0, n - 1);

    for (int i = 0; i < n; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}

```

>[!example] Practice
>- [AcWing-785](https://www.acwing.com/problem/content/787/)
>- [AcWing-786](https://www.acwing.com/problem/content/788/)

### 归并排序

![[10-Algo-Basis-merge.png]]

```cpp
void merge_sort(int q[], int l, int r)
{
    if (l >= r) return; // 递归基

    int mid = l + r >> 1;
    merge_sort(q, l, mid);
    merge_sort(q, mid + 1, r); // 递归

    int k = 0, i = l, j = mid + 1; //k用于计数已经完成了多少个合并，i和j分别表示左右边界
    while (i <= mid && j <= r)
        if (q[i] <= q[j]) tmp[k ++ ] = q[i ++ ];
        else tmp[k ++ ] = q[j ++ ];

    while (i <= mid) tmp[k ++ ] = q[i ++ ]; //有剩余元素的话直接接到末尾
    while (j <= r) tmp[k ++ ] = q[j ++ ];

    for (i = l, j = 0; i <= r; i ++, j ++ ) q[i] = tmp[j];
}
```

```cpp
#include <vector>
#include <iostream>

void merge(int q[], int l, int mid, int r, std::vector<int>& temp) {
    int i = l, j = mid + 1, k = 0;
    // Merge the two halves into a temporary vector
    while (i <= mid && j <= r) {
        if (q[i] <= q[j]) {
            temp[k++] = q[i++];
        } else {
            temp[k++] = q[j++];
        }
    }
    // Copy the remaining elements of the left half, if there are any
    while (i <= mid) {
        temp[k++] = q[i++];
    }
    // Copy the remaining elements of the right half, if there are any
    while (j <= r) {
        temp[k++] = q[j++];
    }
    // Copy back the merged elements to original array
    for (i = l, k = 0; i <= r; ++i, ++k) {
        q[i] = temp[k];
    }
}

void merge_sort(int q[], int l, int r, std::vector<int>& temp) {
    if (l >= r) return; // Base case

    int mid = l + (r - l) / 2; // Avoid overflow
    merge_sort(q, l, mid, temp); // Sort the first half
    merge_sort(q, mid + 1, r, temp); // Sort the second half
    merge(q, l, mid, r, temp); // Merge the sorted halves
}

// Example usage
int main() {
    int arr[] = {9, -3, 5, 2, 6, 8, -6, 1, 3};
    int n = sizeof(arr) / sizeof(arr[0]);
    std::vector<int> temp(n); // Temporary array for merging

    merge_sort(arr, 0, n - 1, temp);

    for (int i = 0; i < n; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

## 二分搜索

### 整数二分

```cpp
bool check(int x) {/* ... */} // 检查x是否满足某种性质

// 区间[l, r]被划分成[l, mid]和[mid + 1, r]时使用：
int bsearch_1(int l, int r)
{
    while (l < r)
    {
        int mid = l + r >> 1;
        if (check(mid)) r = mid;    // check()判断mid是否满足性质
        else l = mid + 1;
    }
    return l;
}
// 区间[l, r]被划分成[l, mid - 1]和[mid, r]时使用：
int bsearch_2(int l, int r)
{
    while (l < r)
    {
        int mid = l + r + 1 >> 1;
        if (check(mid)) l = mid;
        else r = mid - 1;
    }
    return l;
}
```

```cpp
int bin_search(int *arr, int target, int lo, int hi) { // [lo,hi)
    while (lo < hi) {
        int mi = lo + (hi - lo) / 2;
        if (arr[mi] < target)
            lo = mi + 1;
        else if (arr[mi] > target)
            hi = mi;
        else
            return mi;
            
    }
    return -1;
}
```

#### [789. 数的范围](https://www.acwing.com/problem/content/791/)

```cpp
#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;

// const int N = 100010;

int main() {
    int n, q;
    cin >> n >> q;

    vector<int> arr(n);
    unordered_map<int, int> first_occurrence, last_occurrence;

    for (int i = 0; i < n; ++i) {
        cin >> arr[i];
        if (first_occurrence.find(arr[i]) == first_occurrence.end()) {
            first_occurrence[arr[i]] = i;
        }
        last_occurrence[arr[i]] = i;
    }

    for (int i = 0; i < q; ++i) {
        int query;
        cin >> query;

        if (first_occurrence.find(query) == first_occurrence.end()) {
            cout << "-1 -1\n";
        } else {
            cout << first_occurrence[query] << " " << last_occurrence[query]
                 << "\n";
        }
    }

    return 0;
}
```

### 浮点数二分

```cpp
bool check(double x) {/* ... */} // 检查x是否满足某种性质

double bsearch_3(double l, double r)
{
    const double eps = 1e-6;   // eps 表示精度，取决于题目对精度的要求
    while (r - l > eps) // 当区间长度足够小时，就可以认为查找结束
    {
        double mid = (l + r) / 2;
        if (check(mid)) r = mid;
        else l = mid;
    }
    return l;
}
```

- 注意设置精度，应当比题目要求多两个数量级

### [790. 数的三次方根](https://www.acwing.com/problem/content/792/)

```cpp
#include <iostream>

using namespace std;

const double eps = 1e-8;

double cubic_root(double x) {
    double l, r;
    if (x == 0.000000) {
        return 0.000000;
    } else if (x > 0) {
        l = 0.000000, r = x + 1; // 处理0<x<1的部分，下面同理
        while (r - l > eps) {
            double mid = (l + r) / 2;
            if (mid * mid * mid > x)
                r = mid;
            else
                l = mid;
        }
    } else {
        l = x - 1, r = -0.000000;
        while (r - l > eps) {
            double mid = (l + r) / 2;
            if (mid * mid * mid > x)
                r = mid;
            else
                l = mid;
        }
    }
    return l;
}

int main() {
    double n;
    cin >> n;

    double res = cubic_root(n);
    printf("%.6f", res);
    //cout<<fixed<<setprecision(6)<<res; // 记得添加iomanip头文件来使用这条语句

    return 0;
}
```

## 高精度计算

### 数据存储

**数组存大整数，并且小端存法**——数组低位存放数据的低位。

```cpp
int main() {
  string a, b;
  vector<int> A, B;

  cin >> a >> b; // a = "123456"
  for (int i = a.size() - 1; i >= 0; i--)
    A.push_back(a[i] - '0'); // A = [6,5,4,3,2,1]，之所以要减'0'，是为了将字符转换为int
  for (int i = b.size() - 1; i >= 0; i--)
    B.push_back(b[i] - '0');

  auto C = add(A, B);
}
```

### 加法

通常是两个大整数相加，各自的**位数在 $10^6$ 量级**；

![[10-algo-basis-bigint-add.png]]

```cpp
// C = A + B, A >= 0, B >= 0
vector<int> add(vector<int> &A, vector<int> &B)
{
    if (A.size() < B.size()) return add(B, A);

    vector<int> C;
    int t = 0;
    for (int i = 0; i < A.size(); i ++ )
    {
        t += A[i];
        if (i < B.size()) t += B[i];
        C.push_back(t % 10);
        t /= 10;
    }

    if (t) C.push_back(t);
    return C;
}
```

### 减法

通常是两个大整数相减，各自的**位数在 $10^6$ 量级**；

![[10-algo-basis-bigint-suber.png]]

```cpp
// C = A - B, 满足A >= B, A >= 0, B >= 0
// 如果不满足 A >= B 呢？只需要计算 -(B - A) 即可
vector<int> sub(vector<int> &A, vector<int> &B)
{
    vector<int> C;
    for (int i = 0, t = 0; i < A.size(); i ++ )
    {
        t = A[i] - t;
        if (i < B.size()) t -= B[i];
        C.push_back((t + 10) % 10); // 当t<0时需要借位，此时要+10，否则不必借位，因此将这两种情况合起来写
        if (t < 0) t = 1;
        else t = 0;
    }

    while (C.size() > 1 && C.back() == 0) C.pop_back(); // 去掉前缀的0
    return C;
}
```

```cpp
// 判断 A 和 B 的大小
bool cmp(vector<int> &A, vector<int> &B) {
  if (A.size() != B.size())
    return A.size() > B.size();
  for (int i = A.size() - 1; i >= 0; i--)
    if (A[i] != B[i])
      return A[i] > B[i];
  return true;
}
```

### 乘法

通常是一个大整数乘一个稍小的数，**大整数的位数在 $10^6$  量级，稍小数的数值在 $10^6$ 量级**；

![[10-algo-basis-bigint-multiplier.png]]

```cpp
// C = A * b, A >= 0, b >= 0
vector<int> mul(vector<int> &A, int b)
{
    vector<int> C;

    int t = 0;
    for (int i = 0; i < A.size() || t; i ++ )
    {
        if (i < A.size()) t += A[i] * b;
        C.push_back(t % 10);
        t /= 10;
    }

    while (C.size() > 1 && C.back() == 0) C.pop_back();

    return C;
}
```

### 除法

通常是一个大整数除以一个稍小的数，**大整数的位数在 $10^6$  量级，稍小数的数值在 $10^6$ 量级**；

![[10-algo-basis-bigint-divider.png]]

```cpp
// A / b = C ... r, A >= 0, b > 0
vector<int> div(vector<int> &A, int b, int &r)
{
    vector<int> C;
    r = 0;
    for (int i = A.size() - 1; i >= 0; i -- )
    {
        r = r * 10 + A[i];
        C.push_back(r / b);
        r %= b;
    }
    reverse(C.begin(), C.end());
    while (C.size() > 1 && C.back() == 0) C.pop_back();
    return C;
}
```

## 前缀和与差分

一维前缀和：

![[10-algo-basis-1d-prefix-sum.png]]

二维前缀和：

![[10-algo-basis-2d-prefix-sum.png]]

> [!tip] 缩短输入数据所占用的时间
> scanf 在输入较大的数（通常指 1,000,000 以上）时效率比 `std::cin` 更高，不过想要继续使用 `std::cin` ，则可以：
> ```cpp
> int main(){
> 	ios::sync_with_stdio(false);
> 	...;
> }
> ```
> 这段代码的作用是使 `std::cin` 变为异步操作，提高执行效率，副作用是不能再使用scanf

### [795. 一维前缀和](https://www.acwing.com/problem/content/797/)

```cpp
#include <iostream>

using namespace std;

const int N = 100010;

int main() {
    ios::sync_with_stdio(false);
    int n, m;
    cin >> n >> m;
    int arr[N] = {0};
    int sum[N] = {0};
    for (int i = 1; i <= n; i++) {
        cin >> arr[i];
        sum[i] = sum[i - 1] + arr[i];
    }

    int l, r;
    for (int i = 1; i <= m; i++) {
        cin >> l >> r;
        cout << sum[r] - sum[l - 1] << endl;
    }
    return 0;
}
```

### [796. 子矩阵的和](https://www.acwing.com/problem/content/798/)

```cpp
#include <iostream>
using namespace std;

const int N = 1010;

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    int arr[N][N], sum[N][N] = {0};
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cin >> arr[i][j];
            sum[i][j] =
                arr[i][j] + sum[i][j - 1] + sum[i - 1][j] - sum[i - 1][j - 1];
        }
    }
    int x1, x2, y1, y2;
    for (int i = 0; i < q; i++) {
        cin >> x1 >> y1 >> x2 >> y2;
        cout << sum[x2][y2] - sum[x2][y1 - 1] - sum[x1 - 1][y2]
                    + sum[x1 - 1][y1 - 1]
             << endl;
    }
    return 0;
}
```

## 位运算

### 整数二进制表示的第 k 位的值

```cpp
int kth_val(int x){
	return (x>>k)&1;
}
```

### 整数的最后一位 1

```cpp
//      x     = 1010...100...00
//     ~x     = 0101...011...11
//    ~x+1    = 0101...100...00
// x & (~x+1) = 0000...100...00
// -x == ~x+1 (-x 就是取补码操作) 

int lowbit(int x){
	return x & -x;
}
```

### 二进制中 1 的个数

```cpp
int countOnes( unsigned int n ) { 
	//O(ones)：正比于数位1的总数
	int ones = 0; //计数器复位
	while ( 0 < n ) { //在n缩减至0之前，反复地
		ones++; //计数（至少有一位为1）
		n &= n - 1; //清除当前最靠右的1
	}
	return ones; //返回计数
}
```

还可以使用 `lowbit()` 来实现：

```cpp
int countOnes(unsigned int n){
	int ones=0;
	while(n) n -= lowbit(n),ones++; // 每次减去n的最后一位1
	cout<<res<<endl;
}
```

### 快速幂

```cpp
// recursive style
inline __int64 sqr(__int64){return a*a;}
__int64 power2(int n){
	//计算幂函数2^n
	if(0==n) return 1;//递归基，否则视n的奇偶分别递归
	return (n&1)?sqr(power2(n>>1))<<1 : sqr(power2(n>>1));
} // O(logn)=O(r),r为输入指数n的比特位数

// recurrent style
__int64 power2_I ( int n ) { 
	//幂函数2^n算法（优化迭代版），n >= 0
	__int64 pow = 1; //O(1)：累积器初始化为2^0
	__int64 p = 2; //O(1)：累乘项初始化为2
	while ( 0 < n ) { //O(logn)：迭代log(n)轮，每轮都
		if ( n & 1 ) //O(1)：根据当前比特位是否为1，决定是否
			pow *= p; //O(1)：将当前累乘项计入累积器
		n >>= 1; //O(1)：指数减半
		p *= p; //O(1)：累乘项自乘
	}
	return pow; //O(1)：返回累积器
} //O(logn) = O(r)，r为输入指数n的比特位数

```

## 双指针策略

```cpp
for (int i = 0, j = 0; i < n; i ++ ){
    while (j < i && check (i, j)) j ++ ;

    // 具体问题的逻辑
}
```

常见问题分类：
1) 对于一个序列，用两个指针维护一段区间
2) 对于两个序列，维护某种次序，比如归并排序中合并两个有序序列的操作

优势：将暴力方法中的逐项枚举，通过某种单调性质优化到 $\mathcal{O}(n)$ 
```cpp
// brute force
for (int i = 0; i < count; i++)
{
	for (int j = 0; j < count; j++)
	{
		/* code */
	}
} // O(n^2)
```

### [最长连续不重复子序列](https://www.acwing.com/problem/content/801/)

```cpp
#include <iostream>
#include <unordered_set>

using namespace std;

const int N = 100010;

int main() {
    int n;
    cin >> n;
    int arr[N];
    for (int i = 0; i < n; i++) cin >> arr[i];

    unordered_set<int> seen;
    int l = 0, r = 0, cnts = 0, max_length = 0;

    while (r < n) {
        if (seen.find(arr[r]) == seen.end()) {
            seen.insert(arr[r]);
            cnts       = r - l + 1; // Update the length of current subsequence
            max_length = max(max_length, cnts);
            r++;
        } else {
            seen.erase(arr[l]); // Remove element at left pointer
            l++;
        }
    }

    cout << max_length << endl;
}
```

![[10-algo-basis-longest-unique-subsequence.png]]

```cpp
/*
核心思路：

遍历数组a中的每一个元素a[i], 对于每一个i，找到j使得双指针[j, i]维护的是以a[i]结尾的最长连续不重复子序列，长度为i - j + 1, 将这一长度与r的较大者更新给r。
对于每一个i，如何确定j的位置：由于[j, i - 1]是前一步得到的最长连续不重复子序列，所以如果[j, i]中有重复元素，一定是a[i]，因此右移j直到a[i]不重复为止（由于[j, i - 1]已经是前一步的最优解，此时j只可能右移以剔除重复元素a[i]，不可能左移增加元素，因此，j具有“单调性”、本题可用双指针降低复杂度）。
用数组s记录子序列a[j ~ i]中各元素出现次数，遍历过程中对于每一个i有四步操作：cin元素a[i] -> 将a[i]出现次数s[a[i]]加1 -> 若a[i]重复则右移j（s[a[j]]要减1） -> 确定j及更新当前长度i - j + 1给r。

注意细节：当a[i]重复时，先把a[j]次数减1，再右移j。
*/
# include <iostream>
using namespace std;

const int N = 100010;
int a[N], s[N];

int main()
{
    int n, r = 0;
    cin >> n;

    for (int i = 0, j = 0; i < n; ++ i)
    {
        cin >> a[i];
        ++ s[a[i]];
        while (s[a[i]] > 1) -- s[a[j++]]; // 先减次数后右移
        r = max(r, i - j + 1) ;
    }
    cout << r;

    return 0;
}
```

### [数组元素的目标和](https://www.acwing.com/problem/content/802/)

利用两个数组的升序性质，通过双指针的方式来减少时间复杂度。具体做法是从数组 A 的头部和数组 B 的尾部开始进行查找，逐步向中间移动指针，直到找到满足条件的元素对。

```cpp
#include <iostream>

using namespace std;

const int N = 100010;

int A[N], B[N];

int main() {
    int n, m, x;
    cin >> n >> m >> x;
    for (int i = 0; i < n; i++) cin >> A[i];
    for (int i = 0; i < m; i++) cin >> B[i];

    int i = 0, j = m - 1;
    while (i < n && j >= 0) {
        if (A[i] + B[j] == x) {
            cout << i << " " << j;
            return 0;
        } else if (A[i] + B[j] < x)
            i++;
        else
            j--;
    }

    return 0;
}
```

## 离散化

> 此处特指整数的离散化。

通常整数可取的值域非常大，在 $[0\sim 10^9]$ ，但是数组中元素数量却很少，如只有 $10^4$ 个，那么为了高效地存储数据，需要将整数映射到 $10^4$ 长度的数组中，这就是离散化。

```cpp
vector<int> alls; // 存储所有待离散化的值
sort(alls.begin(), alls.end()); // 将所有值排序
alls.erase(unique(alls.begin(), alls.end()), alls.end());   // 去掉重复元素

// 二分求出x对应的离散化的值
int find(int x) // 找到第一个大于等于x的位置
{
    int l = 0, r = alls.size() - 1;
    while (l < r)
    {
        int mid = l + r >> 1;
        if (alls[mid] >= x) r = mid;
        else l = mid + 1;
    }
    return r + 1; // 映射到1, 2, ...n
}
```

>[!tip] `std::unique` 如何使用？
> ![[8-sequence-operate#unique]]

### [802. 稀疏数组的区间和](https://www.acwing.com/problem/content/804/)



## 区间合并

按区间左端点进行排序

```cpp
// 将所有存在交集的区间合并
void merge(vector<PII> &segs)
{
    vector<PII> res;

    sort(segs.begin(), segs.end());

    int st = -2e9, ed = -2e9;
    for (auto seg : segs)
        if (ed < seg.first)
        {
            if (st != -2e9) res.push_back({st, ed});
            st = seg.first, ed = seg.second;
        }
        else ed = max(ed, seg.second);

    if (st != -2e9) res.push_back({st, ed});

    segs = res;
}
```

### [803. 对N个有交集的数组进行合并](https://www.acwing.com/problem/content/805/)

### [759. 格子染色 - AcWing题库](https://www.acwing.com/problem/content/761/)