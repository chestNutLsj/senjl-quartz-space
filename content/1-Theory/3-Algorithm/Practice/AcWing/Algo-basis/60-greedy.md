---
publish: "true"
tags:
  - Algorithm
  - AcWing
date: 2024-03-04
---
## 区间问题

### [905. 区间选点](https://www.acwing.com/problem/content/907/)

![[60-greedy-interval.png]]

```cpp
// 区间选点
#include <algorithm>
#include <iostream>

using namespace std;
typedef pair<int, int> PII;

const int N = 100010;
PII       interval[N]; // 存放区间的数组,pair.first存放闭区间的左端，second存放闭区间的右端

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> interval[i].first >> interval[i].second;
    }

    // 使用lambda表达式按照区间的右端点从小到大排序
    sort(interval, interval + n, [](const PII &a, const PII &b) {
        return a.second < b.second;
    });

    // 贪心策略，从前往后逐个枚举每个区间的右端点，如果当前区间包含该点，就pass并查询下一个区间，
    // 否则包含当前区间的右端点
    int count    = 0;         // 选取的点的数量
    int endPoint = -1e9 - 10; // 上一个选取的点的位置，初始化为一个非常小的数
    for (int i = 0; i < n; i++) {
        // 如果当前区间的左端点大于上一个选取的点的位置，则需要在当前区间选取一个新的点
        if (interval[i].first > endPoint) {
            count++;                       // 增加选点的数量
            endPoint = interval[i].second; // 更新上一个选取的点的位置为当前区间的右端点
        }
    }
    cout << count << endl;

    return 0;
}
```

```cpp
// 高效利用STL
#include <vector>
#include <utility>
#include <iostream>
#include <algorithm>

int main() {
  int N, ans = 0, t = -2e9; std::cin >> N;
  std::vector<std::pair<int, int>> range(N);
  for (auto &[b, a] : range) std::cin >> a >> b;
  std::sort(range.begin(), range.end());
  for (auto &[b, a] : range)
    if (a > t) ++ans, t = b;
  std::cout << ans << std::endl;
  return 0;
}
```

### [908. 最大不相交区间数量](https://www.acwing.com/problem/content/910/)

```transform-text-base64

```
```cpp
// 最大不相交区间的数量
#include <algorithm>
#include <iostream>

using namespace std;

const int N = 100010, INF = 1e9 + 10;
struct Range {
    int  l, r;                             // 区间左右端点
    bool operator<(const Range &W) const { // 重载运算符
        return r < W.r;
    }
} range[N]; // 存放区间的结构体数组

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> range[i].l >> range[i].r;
    }

    // 使用重载后的运算符，按照区间的右端点从小到大排序
    sort(range, range + n);

    // 贪心策略，从前往后逐个枚举每个区间的右端点，如果当前区间的左端点小于等于上一个区间的右端点，就pass并查询下一个区间，
    // 否则包含当前区间的右端点
    int count    = 1;          // 选取的不想交区间的数量
    int endPoint = range[0].r; // 上一个选取的点的位置，初始化为第一个区间的右端点
    for (int i = 1; i < n; i++) {
        // 如果当前区间的左端点小于等于上一个区间的右端点，跳过，否则计数+1
        if (range[i].l > endPoint) {
            count++;               // 更新不相交区间的计数
            endPoint = range[i].r; // 更新上一个选取的点的位置为当前区间的右端点
        }
    }
    cout << count << endl;

    return 0;
}
```

### [906. 区间分组](https://www.acwing.com/problem/content/908/)

```cpp
// 区间分组
#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>

using namespace std;
typedef pair<int, int> PII;

vector<PII> intervals;

bool cmp(const PII &a, const PII &b) { return a.first < b.first; }

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int l, r;
        cin >> l >> r;
        intervals.push_back({l, r});
    }

    // 使用自定义的比较函数，按照区间的左端点从小到大排序
    sort(intervals.begin(), intervals.end(), cmp);

    // 贪心策略，按每个区间的右端点从小到大逐个枚举，堆里存已检查分组的最小右端点，
    // 当前要判断的区间的左端点至少要大于已检查分组中的某个右端点，才不用开新组，
    // 若小于 / 等于所有分组的最小右端点（也就是小于 / 等于堆顶），则需要开新组

    priority_queue<int, vector<int>, greater<int>> heap; // 优先队列，存储每个组的最大右端点
    for (const auto &r : intervals) {
        if (!heap.empty() && heap.top() < r.first) {
            // 如果当前区间的左端点大于堆顶元素（也就是目前所有组中最小的右端点），
            // 则可以复用这个组
            heap.pop(); // 移除这个组的旧的右端点
        }
        // 将当前区间的右端点加入优先队列（代表开启新组或加入现有组）
        heap.push(r.second);
    }

    cout << heap.size() << endl;

    return 0;
}
```

>[!question] 为什么这里要用左端点排序呢？
>***按左端点排序***
>1. **贪心策略的正确性**：当我们按照左端点从小到大对区间进行排序时，我们实际上是在按照区间的开始顺序来组织这些区间。这样做的好处是，对于任何一个给定的区间，如果它不能加入到当前的任何一个组中（即它的左端点小于或等于当前组的最大右端点），那么它必须开启一个新的组。因为之后的所有区间的左端点都将更大，所以它们也不可能加入到当前的组中。
>2. **最小化分组数**：这种排序方式有助于最小化所需的分组数。因为我们总是尝试将当前的区间加入到已有的组中（如果可能的话），并且这种尝试是基于区间开始顺序进行的，这有助于我们尽可能地利用每个组，从而减少总的分组数。
>3. **简化逻辑**：按照左端点排序还简化了实现逻辑。我们只需依次考虑每个区间是否能加入到某个现有组中（基于右端点）。如果不能，则开启新组。这种逻辑非常直接，易于实现。
>
>***按右端点排序***
>按照右端点排序虽然也是一种常见的排序策略，但在区间分组问题中，它并不适用。这是因为：
>- 当区间按照右端点排序时，我们确实可以确保每个选择的点都能覆盖尽可能多的区间（例如，在区间选点问题中）。但在区间分组问题中，我们的目标是最小化分组数量，而不仅仅是覆盖所有区间。按照右端点排序，不能保证尽可能多地利用每个组，因为一个区间的结束不一定告诉我们它是否能与之前的区间形成不相交的组。

### [907. 区间覆盖](https://www.acwing.com/problem/content/909/)

![[60-greedy-interval-overlap.png]]

## Huffman 树

### [148. 合并果子](https://www.acwing.com/problem/content/150/)



## 排序不等式

### [913. 排队打水](https://www.acwing.com/problem/content/description/915/)



## 绝对值不等式

### [104. 货仓选址](https://www.acwing.com/problem/content/106/)

![[60-greedy-dist-2.png]]

## 推公式

### [125. 耍杂技的牛](https://www.acwing.com/problem/content/127/)

![[60-greedy-king-game.png]]

