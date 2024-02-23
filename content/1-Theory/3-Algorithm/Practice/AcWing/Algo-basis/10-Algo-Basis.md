## 快速排序

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
### 练习

- [AcWing-785](https://www.acwing.com/problem/content/787/)
- [AcWing-786](https://www.acwing.com/problem/content/788/)

## 归并排序

![[10-Algo-Basis-merge-1.png]]

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

    while (i <= mid) tmp[k ++ ] = q[i ++ ];
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