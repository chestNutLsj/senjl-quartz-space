## 1. 字符串

### [无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

暴力法（$O (n²)$）

最直接的思路：枚举所有子串的起始位置 `i` 和结束位置 `j`，然后检查子串 `s[i..j]` 是否有重复字符。检查过程可以用哈希集合或数组，每次检查 O (j-i+1)，总复杂度 O (n³)。若优化检查过程，固定起始点 `i`，逐步扩展 `j` 并维护一个集合，可以做到 $O (n²)$。但这对长字符串仍然太慢。

---

二分答案 + 滑动窗口检查（$O (n \log n)$）

思路
假设最长无重复子串的长度为 `L`，那么：
- 对于任何长度 `≤ L`，肯定存在一个无重复子串（因为最长子串本身及其子串都满足）。
- 对于任何长度 `> L`，肯定不存在无重复子串。

因此 `L` 具有单调性，我们可以用**二分法**来猜长度。  
具体做法：在区间 `[0, n]` 中二分，每次猜测一个长度 `mid`，然后**检查**是否存在某个长度为 `mid` 的无重复子串。如果存在，说明答案至少为 `mid`，尝试更大的长度；否则答案小于 `mid`。

检查函数（滑动窗口固定大小）

如何高效检查是否存在长度为 `mid` 的无重复子串？  
我们可以用一个固定大小为 `mid` 的滑动窗口，从左到右扫描字符串，同时维护窗口内每个字符出现的次数。  
- 用一个数组 `cnt[256]` 记录当前窗口内每个字符的出现次数（假设字符集为 ASCII 128 或 256）。  
- 用变量 `duplicate` 记录窗口内出现次数超过 1 的字符种类数。当 `duplicate == 0` 时，说明窗口内所有字符都只出现一次，即找到了无重复子串。  

**滑动过程**：
1. 先统计第一个窗口（下标 `0` 到 `mid-1`）的字符计数，并更新 `duplicate`。
2. 然后从 `i = mid` 开始向右移动窗口：
   - 移出左边字符 `s[i - mid]`：将其计数减 1。如果减 1 后该字符计数从 2 变成 1，说明它原来重复，现在不再重复，`duplicate--`。
   - 加入右边新字符 `s[i]`：将其计数加 1。如果加 1 后该字符计数从 1 变成 2，说明它变得重复了，`duplicate++`。
3. 每次移动后检查 `duplicate`，若为 0 则返回 `true`。

这样检查一个长度需要 O (n) 时间，二分需要 O (log n) 次检查，总复杂度 O (n log n)。

代码：

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.size();
        if (n == 0) return 0;
        int left = 1, right = n, ans = 1;  // 答案至少为1（空串已处理）

        // 检查是否存在长度为 len 的无重复子串
        auto check = [&](int len) -> bool {
            int cnt[256] = {0};            // 字符计数
            int duplicate = 0;              // 窗口内出现次数>1的字符种类数

            // 初始化第一个窗口 [0, len-1]
            for (int i = 0; i < len; ++i) {
                cnt[s[i]]++;
                if (cnt[s[i]] == 2) duplicate++;  // 出现第二次，重复种类+1
            }
            if (duplicate == 0) return true;       // 第一个窗口已满足

            // 滑动窗口
            for (int i = len; i < n; ++i) {
                // 移除左边字符 s[i-len]
                cnt[s[i - len]]--;
                if (cnt[s[i - len]] == 1) duplicate--; // 从2变1，重复消失
                // 加入右边字符 s[i]
                cnt[s[i]]++;
                if (cnt[s[i]] == 2) duplicate++;      // 从1变2，新增重复
                if (duplicate == 0) return true;
            }
            return false;
        };

        // 二分查找最大长度
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (check(mid)) {
                ans = mid;          // 当前长度可行，尝试更大
                left = mid + 1;
            } else {
                right = mid - 1;     // 当前长度不可行，缩小范围
            }
        }
        return ans;
    }
};
```

---

直接滑动窗口（O (n)）

思路

其实我们可以不用二分，直接在扫描过程中动态维护一个**可变大小的窗口**，保证窗口内始终无重复字符。  
- 用两个指针 `left` 和 `right` 表示当前窗口的左右边界（左闭右闭）。初始 `left = 0`，`right` 逐步向右移动。
- 对于每个新字符 `s[right]`，我们需要知道它是否已经在当前窗口中出现过。为了快速判断，可以用一个哈希表（或数组）记录每个字符**最近一次出现的位置**。
- 如果 `s[right]` 之前出现过，且上次出现的位置 `last[s[right]]` **在当前窗口内**（即 `last[s[right]] >= left`），那么窗口的左边界必须跳到 `last[s[right]] + 1`，以剔除重复字符，保证窗口内无重复。
- 然后更新 `last[s[right]]` 为当前位置 `right`，并计算当前窗口长度 `right - left + 1`，更新答案。

为什么这样能保证 O (n)？因为 `left` 和 `right` 都只向右移动，每个字符最多被处理两次（一次作为右边界，一次被 left 跳过），所以是线性时间。

代码：

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.size();
        // 记录每个字符最近出现的位置，初始化为 -1 表示未出现
        // 假设字符集为 ASCII 128，实际可以用 unordered_map 但数组更快
        vector<int> last(128, -1);
        int left = 0;          // 窗口左边界
        int ans = 0;

        for (int right = 0; right < n; ++right) {
            char c = s[right];
            // 如果 c 之前出现过，并且上次出现位置在窗口内，则移动左边界
            if (last[c] != -1 && last[c] >= left) {
                left = last[c] + 1;
            }
            // 更新 c 的最新出现位置
            last[c] = right;
            // 当前窗口长度为 right - left + 1，更新答案
            ans = max(ans, right - left + 1);
        }
        return ans;
    }
};
```

关键点解释
- `last` 数组：因为题目通常只包含 ASCII 字符（如字母、数字、符号），用大小为 128 或 256 的数组就够了。如果字符集更大，可以用 `unordered_map`。
- `last[c] >= left`：判断重复字符是否在当前窗口内。因为 `last[c]` 记录的是字符 c 上一次出现的位置，如果这个位置小于 `left`，说明它已经被窗口排除，不影响当前窗口。
- 移动 `left` 后，窗口内所有字符仍然是不重复的，因为被跳过的部分包含了重复字符。
- 每次更新 `last[c]` 为最新的 `right`，保证后续判断正确。

---

| 方法 | 时间复杂度 | 空间复杂度 | 特点 |
|------|------------|------------|------|
| 二分+滑动窗口 | O (n log n) | O (字符集大小) | 思路巧妙，但不如直接滑动高效 |
| 直接滑动窗口 | O (n) | O (字符集大小) | 简洁高效，是标准解法 |

对于本题，直接滑动窗口是最优解，时间复杂度 O (n)，空间 O (字符集大小)。  
二分方法虽然复杂度稍高，但体现了一种“答案单调性 → 二分”的通用解题思想，在其他问题（如分割数组的最大值）中非常有用。

### [寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays)