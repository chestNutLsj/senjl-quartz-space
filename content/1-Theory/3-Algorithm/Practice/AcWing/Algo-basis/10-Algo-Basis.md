## 快速排序

### 模板

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

### 练习

- [AcWing-785](https://www.acwing.com/problem/content/787/)

## 归并排序