---
title: GEMM/Reduce 操作在... - 腾讯iWiki
author:
published:
date: 2025-12-03T18:37:09+08:00
description:
tags:
---
## GEMM

## CUDA 中的实现

下面以一个单精度 GEMM 算子的基础实现为例，结合图示讲解 CUDA 中实现 GEMM 的流程：

```cpp
#define OFFSET(row, col, ld) ((row) * (ld) + (col))

__global__ void naiveSgemm(

    float * __restrict__ a, float * __restrict__ b, float * __restrict__ c,

    const int M, const int N, const int K) {

    

    // 线程到矩阵元素的映射

    int n = blockIdx.x * blockDim.x + threadIdx.x;

    int m = blockIdx.y * blockDim.y + threadIdx.y;

    

    if (m < M && n < N) {

        float psum = 0.0;

        #pragma unroll  // 循环展开提示

        for (int k = 0; k < K; k++) {

            psum += a[OFFSET(m, k, K)] * b[OFFSET(k, n, N)];

        }

        c[OFFSET(m, n, N)] = psum;

    }

}

const int BM = 32, BN = 32;

dim3 blockDim(BN, BM);        // 每个block有32x32=1024个线程

dim3 gridDim((N + BN - 1) / BN, (M + BM - 1) / BM);

float testPerformance(

    void (*gpuSgemm) (float *, float *, float *, const int, const int, const int),

    dim3 gridDim, dim3 blockDim, const int M, const int N, const int K, const int repeat) {

    size_t size_a = M * K * sizeof(float);

    size_t size_b = K * N * sizeof(float);

    size_t size_c = M * N * sizeof(float);

    float *d_a, *d_b, *d_c;

    cudaMalloc(&d_a, size_a);

    cudaMalloc(&d_b, size_b);

    cudaMalloc(&d_c, size_c);

    cudaEvent_t start, end;

    cudaEventCreate(&start);

    cudaEventCreate(&end);

    cudaEventRecord(start);

    for (int i = 0; i < repeat; i++)

        gpuSgemm<<<gridDim, blockDim>>>(d_a, d_b, d_c, M, N, K);

    cudaEventRecord(end);

    cudaEventSynchronize(end);

    float msec, sec;

    cudaEventElapsedTime(&msec, start, end);

    sec = msec / 1000.0 / repeat;

    cudaFree(d_a);

    cudaFree(d_b);

    cudaFree(d_c);

    return sec;

}
```

代码理解：

- `OFFSET` 宏负责行主序矩阵的内存偏移计算。这是因为在 C++中，多维数组在内存中按行存储，其中 ld 指的是 leading dimension，为矩阵的步长，通常是列数。举个例子，2x3 的矩阵 A 在内存中的布局为 `A[0][0], A[0][1], A[0][2], A[1][0], A[1][1], ...`，如要计算 `A[1][2]` 的偏移，则为 `OFFSET(1,2,3)=1*3+2=5` ，对应内存中第 5 个元素。
- CUDA 线程层次结构：  
	```text
	Grid (整个计算网格)
	  │
	  ├── Block 0 ── Thread (0,0) Thread (0,1) ... Thread (0,31)
	  ├── Block 1 ── Thread (1,0) Thread (1,1) ... Thread (1,31)
	  ├── ...
	  └── Block N ── Thread (N,0) Thread (N,1) ... Thread (N,31)
	```
	- `blockIdx.x, blockIdx.y` ：当前线程块在网格中的坐标；
	- `blockDim.x, blockDim.y` ：每个线程块的尺寸（线程数量）；
	- `threadIdx.x, threadIdx.y` ：当前线程在线程块内的坐标。
	- 因此， `blockIdx.x * blockDim.x + threadIdx.x` 计算得当前元素的列索引， `blockIdx.y * blockDim.y + threadIdx.y` 计算得当前元素的行索引。
	- 举个例子：假设有一个2x2的线程网格（ `gridDim.x=2`, `gridDim.y=2` ），每个线程块有2x2个线程（ `blockDim.x=2`, `blockDim.y=2` ），那么：
		- 对于线程块(0,0)内的线程(0,0): `n=0*2+0=0, m=0*2+0=0` -> 负责C\[0\]\[0\]
		- 线程块(0,0)内的线程(1,0): `n=0*2+1=1, m=0*2+0=0` -> 负责C\[0\]\[1\]
		- 线程块(0,0)内的线程(0,1): `n=0*2+0=0, m=0*2+1=1` -> 负责C\[1\]\[0\]
		- 线程块(0,0)内的线程(1,1): `n=0*2+1=1, m=0*2+1=1` -> 负责C\[1\]\[1\]
- 对比 CPU 版本的 GEMM：  
	```javascript
	for (int m = 0; m < M; m++) {          // 遍历所有行
	    for (int n = 0; n < N; n++) {      // 遍历所有列  
	        float psum = 0.0;
	        for (int k = 0; k < K; k++) {  // 计算单个元素的内积
	            psum += a[m][k] * b[k][n];
	        }
	        c[m][n] = psum;
	    }
	}
	```
	  
	这里一个线程需要计算 MxN 个元素，需要三重循环来遍历所有位置。
- 而 GPU 版本的并行计算 GEMM 为：  
	```javascript
	// 每个线程只计算一个输出元素！
	int n = ...;  // 这个线程负责的列
	int m = ...;  // 这个线程负责的行
	float psum = 0.0;
	for (int k = 0; k < K; k++) {  // 只计算这一个元素的内积
	    psum += a[m][k] * b[k][n];
	}
	c[m][n] = psum;
	```
	  
	即 MxN 个线程各自计算一个输出元素，每个线程只需要一重循环（循环次数为 K 次）来计算自己负责的那个元素。更具体地说，矩阵 A 和 B 都存储在 global memory，每个线程直接从 global memory 上进行读数，每个线程每次都需要读取 A 矩阵的一行（K 个元素）和 B 矩阵的一列（K 个元素，从而每个线程从 global memory 上读取次数为 2K），逐个相乘得到 C 矩阵的一个元素（为了计算 C，一共有 MxN 个线程，从而对 global memory 的读取次数为 2MNK）。 ![[Different languages to implement GEMM kernel-naive-gemm.png]]
- 这个 naive 版本的 GEMM kernel 问题在于需要重复从 global memory 上读取数据，所以读取数据上消耗了大量时间，没有充分利用 GPU 的算力。

### 更高性能的 GEMM

在 GEMM 操作中，优化的目标是尽可能减少内存访问的延迟并提高计算吞吐量。常见的优化维度有：

1. 内存优化：
	- 共享内存： 使用共享内存来存储 A 和 B 的子矩阵，减少全局内存访问。
	- 内存对齐： 确保内存访问是对齐的，避免未对齐的内存访问带来的性能损失。
2. 线程优化：
	- 线程块大小： 选择合适的线程块大小（通常是 16×16 或 32×32），以优化内存访问和计算效率。
3. 循环展开：将内层循环展开，以减少循环控制的开销。
4. SIMT（Single Instruction Multiple Threads）优化：利用 SIMT 架构，将更多的计算放入每个线程，避免线程闲置。

```cpp
__global__ void sgemm_V3(

    float * __restrict__ a, float * __restrict__ b, float * __restrict__ c,

    const int M, const int N, const int K) {

    const int BM = 128;

    const int BN = 128;

    const int BK = 8;

    const int TM = 8;

    const int TN = 8;

    const int bx = blockIdx.x;

    const int by = blockIdx.y;

    const int tx = threadIdx.x;

    const int ty = threadIdx.y;

    const int tid = ty * blockDim.x + tx;

    __shared__ float s_a[2][BK][BM];

    __shared__ float s_b[2][BK][BN];

    float r_load_a[4];

    float r_load_b[4];

    float r_comp_a[TM];

    float r_comp_b[TN];

    float r_c[TM][TN] = {0.0};

    int load_a_smem_m = tid >> 1;

    int load_a_smem_k = (tid & 1) << 2;

    int load_b_smem_k = tid >> 5;

    int load_b_smem_n = (tid & 31) << 2;

    int load_a_gmem_m = by * BM + load_a_smem_m;

    int load_b_gmem_n = bx * BN + load_b_smem_n;

    {

        int load_a_gmem_k = load_a_smem_k;

        int load_a_gmem_addr = OFFSET(load_a_gmem_m, load_a_gmem_k, K);

        int load_b_gmem_k = load_b_smem_k;

        int load_b_gmem_addr = OFFSET(load_b_gmem_k, load_b_gmem_n, N);

        FLOAT4(r_load_a[0]) = FLOAT4(a[load_a_gmem_addr]);

        FLOAT4(r_load_b[0]) = FLOAT4(b[load_b_gmem_addr]);

        s_a[0][load_a_smem_k    ][load_a_smem_m] = r_load_a[0];

        s_a[0][load_a_smem_k + 1][load_a_smem_m] = r_load_a[1];

        s_a[0][load_a_smem_k + 2][load_a_smem_m] = r_load_a[2];

        s_a[0][load_a_smem_k + 3][load_a_smem_m] = r_load_a[3];

        FLOAT4(s_b[0][load_b_smem_k][load_b_smem_n]) = FLOAT4(r_load_b[0]);

    }

    for (int bk = 1; bk < (K + BK - 1) / BK; bk++) {

        int smem_sel = (bk - 1) & 1;

        int smem_sel_next = bk & 1;

        int load_a_gmem_k = bk * BK + load_a_smem_k;

        int load_a_gmem_addr = OFFSET(load_a_gmem_m, load_a_gmem_k, K);

        int load_b_gmem_k = bk * BK + load_b_smem_k;

        int load_b_gmem_addr = OFFSET(load_b_gmem_k, load_b_gmem_n, N);

        FLOAT4(r_load_a[0]) = FLOAT4(a[load_a_gmem_addr]);

        FLOAT4(r_load_b[0]) = FLOAT4(b[load_b_gmem_addr]);

        #pragma unroll

        for (int tk = 0; tk < BK; tk++) {

            FLOAT4(r_comp_a[0]) = FLOAT4(s_a[smem_sel][tk][ty * TM / 2         ]);

            FLOAT4(r_comp_a[4]) = FLOAT4(s_a[smem_sel][tk][ty * TM / 2 + BM / 2]);

            FLOAT4(r_comp_b[0]) = FLOAT4(s_b[smem_sel][tk][tx * TN / 2         ]);

            FLOAT4(r_comp_b[4]) = FLOAT4(s_b[smem_sel][tk][tx * TN / 2 + BN / 2]);

            #pragma unroll

            for (int tm = 0; tm < TM; tm++) {

                #pragma unroll

                for (int tn = 0; tn < TN; tn++) {

                    r_c[tm][tn] += r_comp_a[tm] * r_comp_b[tn];

                }

            }

        }

        s_a[smem_sel_next][load_a_smem_k    ][load_a_smem_m] = r_load_a[0];

        s_a[smem_sel_next][load_a_smem_k + 1][load_a_smem_m] = r_load_a[1];

        s_a[smem_sel_next][load_a_smem_k + 2][load_a_smem_m] = r_load_a[2];

        s_a[smem_sel_next][load_a_smem_k + 3][load_a_smem_m] = r_load_a[3];

        FLOAT4(s_b[smem_sel_next][load_b_smem_k][load_b_smem_n]) = FLOAT4(r_load_b[0]);

        __syncthreads();

    }

    #pragma unroll

    for (int tk = 0; tk < BK; tk++) {

        FLOAT4(r_comp_a[0]) = FLOAT4(s_a[1][tk][ty * TM / 2         ]);

        FLOAT4(r_comp_a[4]) = FLOAT4(s_a[1][tk][ty * TM / 2 + BM / 2]);

        FLOAT4(r_comp_b[0]) = FLOAT4(s_b[1][tk][tx * TN / 2         ]);

        FLOAT4(r_comp_b[4]) = FLOAT4(s_b[1][tk][tx * TN / 2 + BN / 2]);

        #pragma unroll

        for (int tm = 0; tm < TM; tm++) {

            #pragma unroll

            for (int tn = 0; tn < TN; tn++) {

                r_c[tm][tn] += r_comp_a[tm] * r_comp_b[tn];

            }

        }

    }

    #pragma unroll

    for (int i = 0; i < TM / 2; i++) {

        int store_c_gmem_m = by * BM + ty * TM / 2 + i;

        int store_c_gmem_n = bx * BN + tx * TN / 2;

        int store_c_gmem_addr = OFFSET(store_c_gmem_m, store_c_gmem_n, N);

        FLOAT4(c[store_c_gmem_addr]) = FLOAT4(r_c[i][0]);

        FLOAT4(c[store_c_gmem_addr + BN / 2]) = FLOAT4(r_c[i][4]);

    }

    #pragma unroll

    for (int i = 0; i < TM / 2; i++) {

        int store_c_gmem_m = by * BM + BM / 2 + ty * TM / 2 + i;

        int store_c_gmem_n = bx * BN + tx * TN / 2;

        int store_c_gmem_addr = OFFSET(store_c_gmem_m, store_c_gmem_n, N);

        FLOAT4(c[store_c_gmem_addr]) = FLOAT4(r_c[i + TM / 2][0]);

        FLOAT4(c[store_c_gmem_addr + BN / 2]) = FLOAT4(r_c[i + TM / 2][4]);

    }

}
```

## Triton 中的实现

```python
@triton.jit

def matmul_kernel(

        # Pointers to matrices

        a_ptr, b_ptr, c_ptr,

        # Matrix dimensions

        M, N, K,

        # The stride variables represent how much to increase the ptr by when moving by 1

        # element in a particular dimension. E.g. \`stride_am\` is how much to increase \`a_ptr\`

        # by to get the element one row down (A has M rows).

        stride_am, stride_ak,  #

        stride_bk, stride_bn,  #

        stride_cm, stride_cn,

        # Meta-parameters

        BLOCK_SIZE_M: tl.constexpr, BLOCK_SIZE_N: tl.constexpr, BLOCK_SIZE_K: tl.constexpr,  #

        GROUP_SIZE_M: tl.constexpr,  #

        ACTIVATION: tl.constexpr  #

):

    """Kernel for computing the matmul C = A x B.

    A has shape (M, K), B has shape (K, N) and C has shape (M, N)

    """

    # -----------------------------------------------------------

    # Map program ids \`pid\` to the block of C it should compute.

    # This is done in a grouped ordering to promote L2 data reuse.

    # See above \`L2 Cache Optimizations\` section for details.

    pid = tl.program_id(axis=0)

    num_pid_m = tl.cdiv(M, BLOCK_SIZE_M)

    num_pid_n = tl.cdiv(N, BLOCK_SIZE_N)

    num_pid_in_group = GROUP_SIZE_M * num_pid_n

    group_id = pid // num_pid_in_group

    first_pid_m = group_id * GROUP_SIZE_M

    group_size_m = min(num_pid_m - first_pid_m, GROUP_SIZE_M)

    pid_m = first_pid_m + ((pid % num_pid_in_group) % group_size_m)

    pid_n = (pid % num_pid_in_group) // group_size_m

    # -----------------------------------------------------------

    # Add some integer bound assumptions.

    # This helps to guide integer analysis in the backend to optimize

    # load/store offset address calculation

    tl.assume(pid_m >= 0)

    tl.assume(pid_n >= 0)

    tl.assume(stride_am > 0)

    tl.assume(stride_ak > 0)

    tl.assume(stride_bn > 0)

    tl.assume(stride_bk > 0)

    tl.assume(stride_cm > 0)

    tl.assume(stride_cn > 0)

    # ----------------------------------------------------------

    # Create pointers for the first blocks of A and B.

    # We will advance this pointer as we move in the K direction

    # and accumulate

    # \`a_ptrs\` is a block of [BLOCK_SIZE_M, BLOCK_SIZE_K] pointers

    # \`b_ptrs\` is a block of [BLOCK_SIZE_K, BLOCK_SIZE_N] pointers

    # See above \`Pointer Arithmetic\` section for details

    offs_am = (pid_m * BLOCK_SIZE_M + tl.arange(0, BLOCK_SIZE_M)) % M

    offs_bn = (pid_n * BLOCK_SIZE_N + tl.arange(0, BLOCK_SIZE_N)) % N

    offs_k = tl.arange(0, BLOCK_SIZE_K)

    a_ptrs = a_ptr + (offs_am[:, None] * stride_am + offs_k[None, :] * stride_ak)

    b_ptrs = b_ptr + (offs_k[:, None] * stride_bk + offs_bn[None, :] * stride_bn)

    # -----------------------------------------------------------

    # Iterate to compute a block of the C matrix.

    # We accumulate into a \`[BLOCK_SIZE_M, BLOCK_SIZE_N]\` block

    # of fp32 values for higher accuracy.

    # \`accumulator\` will be converted back to fp16 after the loop.

    accumulator = tl.zeros((BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.float32)

    for k in range(0, tl.cdiv(K, BLOCK_SIZE_K)):

        # Load the next block of A and B, generate a mask by checking the K dimension.

        # If it is out of bounds, set it to 0.

        a = tl.load(a_ptrs, mask=offs_k[None, :] < K - k * BLOCK_SIZE_K, other=0.0)

        b = tl.load(b_ptrs, mask=offs_k[:, None] < K - k * BLOCK_SIZE_K, other=0.0)

        # We accumulate along the K dimension.

        accumulator = tl.dot(a, b, accumulator)

        # Advance the ptrs to the next K block.

        a_ptrs += BLOCK_SIZE_K * stride_ak

        b_ptrs += BLOCK_SIZE_K * stride_bk

    # You can fuse arbitrary activation functions here

    # while the accumulator is still in FP32!

    if ACTIVATION == "leaky_relu":

        accumulator = leaky_relu(accumulator)

    c = accumulator.to(tl.float16)

    # -----------------------------------------------------------

    # Write back the block of the output matrix C with masks.

    offs_cm = pid_m * BLOCK_SIZE_M + tl.arange(0, BLOCK_SIZE_M)

    offs_cn = pid_n * BLOCK_SIZE_N + tl.arange(0, BLOCK_SIZE_N)

    c_ptrs = c_ptr + stride_cm * offs_cm[:, None] + stride_cn * offs_cn[None, :]

    c_mask = (offs_cm[:, None] < M) & (offs_cn[None, :] < N)

    tl.store(c_ptrs, c, mask=c_mask)
```

代码解析：

- 输入参数与内存布局：  
	```python
	def matmul_kernel(
	        a_ptr, b_ptr, c_ptr,
	        M, N, K,
	        stride_am, stride_ak,  
	        stride_bk, stride_bn,  
	        stride_cm, stride_cn,
	        BLOCK_SIZE_M: tl.constexpr, BLOCK_SIZE_N: tl.constexpr, BLOCK_SIZE_K: tl.constexpr,
	        GROUP_SIZE_M: tl.constexpr,
	        ACTIVATION: tl.constexpr
	):
	```
	- `a_ptr`, `b_ptr`, `c_ptr` ：分别是矩阵 A、B 和 C 的指针。Triton 通过指针操作访问这些矩阵的数据块。
	- `M`, `N`, `K` ：矩阵 A 为 M×K，矩阵 B 为 K×N，矩阵 C 为 M×N。
	- `stride_*` ：这些参数表示矩阵在内存中的步长。通过这些步长，可以进行指针偏移，直接访问数据。
	- `BLOCK_SIZE_*` 和 `GROUP_SIZE_*` ：这些是元参数，定义了每个线程块的大小和分组的大小，用于数据分块和并行计算。
- 计算每个线程的工作量：  
	```python
	pid = tl.program_id(axis=0)
	num_pid_m = tl.cdiv(M, BLOCK_SIZE_M)
	num_pid_n = tl.cdiv(N, BLOCK_SIZE_N)
	num_pid_in_group = GROUP_SIZE_M * num_pid_n
	group_id = pid // num_pid_in_group
	first_pid_m = group_id * GROUP_SIZE_M
	group_size_m = min(num_pid_m - first_pid_m, GROUP_SIZE_M)
	pid_m = first_pid_m + ((pid % num_pid_in_group) % group_size_m)
	pid_n = (pid % num_pid_in_group) // group_size_m
	```
	- `tl.program_id(axis=0)` 获取当前线程的 ID。Triton 会根据程序 ID 来计算每个线程应该负责矩阵 C 的哪个块。通过这些计算，可以分配线程计算不同的 C 矩阵元素。
	- 另外这里还对块的加载进行了优化（简单的行主序会影响 L2 cache 的命中率）。例如，在以下 9 块×9 块的矩阵乘法中，如果按行主序计算输出，需要将 90 块加载到 SRAM 中以计算前 9 个输出块，但如果按分组顺序进行，只需要加载 54 块。 ![../../_images/grouped_vs_row_major_ordering.png](https://iwiki.woa.com/tencent/api/attachments/s3/url?attachmentid=35632895)
- 数据加载和计算：  
	```python
	a_ptrs = a_ptr + (offs_am[:, None] * stride_am + offs_k[None, :] * stride_ak)
	b_ptrs = b_ptr + (offs_k[:, None] * stride_bk + offs_bn[None, :] * stride_bn)
	```
	- 这里， `a_ptrs` 和 `b_ptrs` 是指向 A 和 B 数据块的指针。通过偏移量 `offs_am`, `offs_bn`, 和 `offs_k` 来获取每个线程需要处理的数据。Triton 在加载数据时会根据偏移量来计算每个线程的数据块，从而避免不必要的内存访问。
	- Triton 使用 `tl.load()` 来加载数据， `mask` 用于确保加载的元素在矩阵范围内有效。
- 计算过程：  
	```python
	accumulator = tl.zeros((BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.float32)
	for k in range(0, tl.cdiv(K, BLOCK_SIZE_K)):
	    a = tl.load(a_ptrs, mask=offs_k[None, :] < K - k * BLOCK_SIZE_K, other=0.0)
	    b = tl.load(b_ptrs, mask=offs_k[:, None] < K - k * BLOCK_SIZE_K, other=0.0)
	    accumulator = tl.dot(a, b, accumulator)
	    a_ptrs += BLOCK_SIZE_K * stride_ak
	    b_ptrs += BLOCK_SIZE_K * stride_bk
	```
	- 在 `for` 循环中，Triton 每次加载 A 和 B 的一个数据块，进行乘法并累加到 `accumulator` 。 `tl.dot(a, b, accumulator)` 是 Triton 提供的高效矩阵乘法接口，用于计算矩阵 A 和 B 的部分乘积。
	- `a_ptrs` 和 `b_ptrs` 会在每次迭代后根据步长更新，指向下一个数据块。
- 存储计算结果：  
	```python
	c_ptrs = c_ptr + stride_cm * offs_cm[:, None] + stride_cn * offs_cn[None, :]
	c_mask = (offs_cm[:, None] < M) & (offs_cn[None, :] < N)
	tl.store(c_ptrs, c, mask=c_mask)
	```
	- 最后， `tl.store()` 会将计算结果存回 C 矩阵中。通过 `c_mask` 确保只在有效位置存储计算结果。

### 与 CUDA GEMM 的对照

1. **内存管理**
	- **CUDA** ：在 CUDA 中，内存管理非常重要，开发者需要显式地使用 `cudaMalloc` 和 `cudaMemcpy` 来管理内存。通常还需要使用共享内存来提高数据访问效率。
	- **Triton** ：Triton 隐式地处理内存管理，开发者只需关注计算过程，不需要显式管理内存分配。通过 `a_ptr`, `b_ptr`, `c_ptr` 这样的指针，Triton 会自动在内存中进行分配和管理。
2. **线程和块管理**
	- **CUDA** ：CUDA 需要手动计算每个线程的工作范围，使用 `threadIdx` 和 `blockIdx` 来计算每个线程需要处理的数据。
	- **Triton** ：Triton 的 `tl.program_id()` 和自动调度使得线程和块管理更加简洁，开发者只需要关注逻辑，而不需要手动计算线程分配。
3. **自动调优**
	- **CUDA** ：CUDA 开发者需要手动调整线程块大小、循环展开等优化技巧。
	- **Triton** ：Triton 通过 `@triton.autotune` 和配置的 `triton.Config` 自动化了这些优化步骤，系统会根据不同的输入尺寸和硬件自动选择最佳配置，减少了手动调优的复杂性。
4. **代码简洁性**
	- **CUDA** ：编写 CUDA GEMM 时，开发者需要明确地编写数据加载、计算、存储等过程，代码较为冗长。
	- **Triton** ：Triton 使得编写 GEMM 更为简洁，主要集中在数学逻辑的实现，而底层细节由 Triton 处理。
5. **性能差异** ：  
	![03 matrix multiplication](https://iwiki.woa.com/tencent/api/attachments/s3/url?attachmentid=35632939)  
	```javascript
	M       N       K      cuBLAS      Triton
	0    256.0   256.0   256.0    4.096000    4.096000
	1    384.0   384.0   384.0   11.059200   11.059200
	2    512.0   512.0   512.0   26.214401   23.831273
	3    640.0   640.0   640.0   42.666665   42.666665
	4    768.0   768.0   768.0   63.195428   58.982401
	5    896.0   896.0   896.0   78.051553   87.808000
	6   1024.0  1024.0  1024.0  104.857603   83.886082
	7   1152.0  1152.0  1152.0  129.825388  110.592000
	8   1280.0  1280.0  1280.0  157.538463  132.129034
	9   1408.0  1408.0  1408.0  151.438217  123.903999
	10  1536.0  1536.0  1536.0  172.631417  147.455995
	11  1664.0  1664.0  1664.0  179.978245  163.616581
	12  1792.0  1792.0  1792.0  172.914215  190.498706
	13  1920.0  1920.0  1920.0  197.485709  153.599998
	14  2048.0  2048.0  2048.0  217.885931  171.196087
	15  2176.0  2176.0  2176.0  216.383306  179.675426
	16  2304.0  2304.0  2304.0  231.921091  188.093471
	17  2432.0  2432.0  2432.0  203.583068  184.832008
	18  2560.0  2560.0  2560.0  221.405396  198.593933
	19  2688.0  2688.0  2688.0  198.602388  174.004843
	20  2816.0  2816.0  2816.0  208.680416  184.805961
	21  2944.0  2944.0  2944.0  220.513412  181.883335
	22  3072.0  3072.0  3072.0  211.280236  191.942722
	23  3200.0  3200.0  3200.0  217.687077  201.257858
	24  3328.0  3328.0  3328.0  211.118166  183.651271
	25  3456.0  3456.0  3456.0  222.097984  184.488710
	26  3584.0  3584.0  3584.0  220.922331  193.783168
	27  3712.0  3712.0  3712.0  209.428397  202.221353
	28  3840.0  3840.0  3840.0  212.676922  183.099338
	29  3968.0  3968.0  3968.0  209.663117  186.012101
	30  4096.0  4096.0  4096.0  220.752852  198.253668
	```
	- **cuBLAS** 是经过多年的优化并且深度集成到 NVIDIA GPU 的硬件特性中的。cuBLAS 利用了低级硬件加速（如 Tensor Cores）和丰富的内存优化技术，这些优化是为了最大化性能。 **Triton** 相较于 cuBLAS，其优化层面可能尚未涵盖所有细节。例如，Triton 编写的 GEMM kernel 可能还没有对某些硬件特性进行完全优化，尤其是在非常大的矩阵和高度并行的计算任务上，某些低层次的优化（如内存访问模式、计算精度选择等）可能没有 cuBLAS 那么精细。
	- **Triton** 更侧重于通过自定义 kernel 提供灵活性，允许开发者进行更高层的控制，但牺牲了一些在更广泛硬件上的性能适配。例如，开发者需要手动配置各种元参数（如共享内存大小、线程块配置等），而 cuBLAS 提供的 API 已经在很多场景下自动进行了优化。

### Triton 的优势与特点

- **简化编程** ：通过装饰器和元参数配置，Triton 大大简化了 GPU 编程的复杂度。
- **自动调优** ：Triton 内建自动调优机制，可以根据硬件和输入的大小选择最佳的配置。
- **性能优化** ：通过高效的数据加载、计算和存储机制，Triton 提供了与手写 CUDA 代码相当或更好的性能。
- **易于集成** ：Triton 与 PyTorch 紧密集成，便于在深度学习框架中使用。

### Triton 在 PyTorch 中的应用

PyTorch 中可以调用 Triton 编写的 kernel 从而实现更优的性能：

```python
def matmul(a, b, activation=""):

    # Check constraints.

    assert a.shape[1] == b.shape[0], "Incompatible dimensions"

    assert a.is_contiguous(), "Matrix A must be contiguous"

    M, K = a.shape

    K, N = b.shape

    # Allocates output.

    c = torch.empty((M, N), device=a.device, dtype=torch.float16)

    # 1D launch kernel where each block gets its own program.

    grid = lambda META: (triton.cdiv(M, META['BLOCK_SIZE_M']) * triton.cdiv(N, META['BLOCK_SIZE_N']), )

    matmul_kernel[grid](

        a, b, c,  #

        M, N, K,  #

        a.stride(0), a.stride(1),  #

        b.stride(0), b.stride(1),  #

        c.stride(0), c.stride(1),  #

        ACTIVATION=activation  #

    )

    return c
```

调用步骤如下：

1. **编译**  
	Triton JIT：Triton 提供了 @triton.jit 装饰器，用于将 Python 中的 Triton kernel 转换为低级 CUDA 代码。编译过程会根据输入数据的形状和硬件特性，选择合适的优化路径。这个过程是自动进行的，开发者只需定义核心的计算逻辑（如矩阵乘法、卷积等），而 Triton 会在后台处理 JIT 编译。
2. **集成到 PyTorch 中**  
	自定义操作：Triton 编写的 GEMM kernel 可以通过 PyTorch 的自定义操作（custom operators）进行集成。PyTorch 为开发者提供了 torch.ops 接口，可以将 Triton kernel 注册为自定义操作，供模型训练和推理使用。当 PyTorch 执行GEMM 时，Triton 编写的 kernel 会被调用执行。PyTorch 通过 torch.Tensor 对象将数据传递给 Triton kernel，这些数据会在 GPU 上处理，并且在执行完成后将结果返回给 PyTorch。
3. **动态调优**  
	Triton 支持自动调优功能，可以根据输入的大小和硬件特性，选择最优的 kernel 配置（例如线程数、内存大小等）。

## TileLang 中的实现

### 直接调用 T.gemm 的最粗粒度实现版本

```python
import tilelang

from tilelang import Profiler

import tilelang.language as T

def matmul(M, N, K, block_M, block_N, block_K, dtype="float16", accum_dtype="float"):

    @T.prim_func

    def main(

        A: T.Tensor((M, K), dtype),

        B: T.Tensor((K, N), dtype),

        C: T.Tensor((M, N), dtype),

    ):

        # Define a grid with enough blocks to cover M×N

        with T.Kernel(T.ceildiv(N, block_N), T.ceildiv(M, block_M), threads=128) as (bx, by):

            # Allocate shared memory for the current tile of A and B

            A_shared = T.alloc_shared((block_M, block_K), dtype)

            B_shared = T.alloc_shared((block_K, block_N), dtype)

            # Allocate a local (register) fragment for partial accumulations

            C_local = T.alloc_fragment((block_M, block_N), accum_dtype)

            # Initialize the local accumulation buffer to zero

            T.clear(C_local)

            # Loop over the K dimension in block_K chunks, using a 3-stage pipeline

            for k in T.Pipelined(T.ceildiv(K, block_K), num_stages=3):

                # Copy from global memory to shared memory

                T.copy(A[by * block_M, k * block_K], A_shared)

                T.copy(B[k * block_K, bx * block_N], B_shared)

                # Perform a matrix multiply-accumulate on the tile

                T.gemm(A_shared, B_shared, C_local)

            # Copy the accumulated result from local memory (C_local) to global memory (C)

            T.copy(C_local, C[by * block_M, bx * block_N])

    return main
```

代码分析：

- 定义 kernel 启动的相关配置： `T.Kernel()` 创建一个由线程块组成的网格，每个块包含 128 个线程； `ceildiv(M, block_M)` 和 `ceildiv(N, block_N)` 确保网格的维度足够覆盖矩阵 C 的所有元素。每个线程块会负责计算矩阵 C 的一个子块（tile），每个线程则负责计算这个子块中的一个元素。  
	```python
	with T.Kernel(T.ceildiv(N, block_N), T.ceildiv(M, block_M), threads=128) as (bx, by):
	```
- 共享内存的分配：将 A 和 B 的 tile 加载到共享内存缓冲区中，提高访问速度。 `A_shared` 和 `B_shared` 是共享内存（在不同线程块间共享的数据）。它们用来存储矩阵 A 和 B 的子块（tile）。共享内存的使用能够减少访问全局内存的延迟，提高计算效率。
- 局部片段的累积：计算过程中的部分结果存储在 寄存器/本地内存 中，以减少对全局内存的写入。 `C_local` 是局部内存，用于存储矩阵 C 的部分累加值（accumulation）。这种方式通过在寄存器中进行计算，避免了频繁的全局内存访问，从而加快计算速度。  
	```python
	C_local = T.alloc_fragment((block_M, block_N), accum_dtype)
	```
- 流水线加载和 GEMM：以流水线的方式加载 A 和 B 的块，利用了数据传输和计算的 overlap  
	```python
	for k in T.Pipelined(T.ceildiv(K, block_K), num_stages=3):
	    T.copy(...)
	    T.gemm(...)
	```
	  
	![Software Pipeline Inference](https://tilelang.com/_images/software_pipeline_inference.png)
- 输出结果：将 寄存器/共享内存中最终计算出的 tile 写入 global memory  
	```python
	T.copy(C_local, C[by * block_M, bx * block_N])
	```

性能对比：  
![gemm fp16 performance on Gpus](https://github.com/tile-ai/tilelang/raw/main/images/op_benchmark_consistent_gemm_fp16.png)

#### T.gemm 的内部实现

```python
def gemm(

    A: Union[tir.Buffer, tir.Var],

    B: Union[tir.Buffer, tir.Var],

    C: Union[tir.Buffer, tir.Var],

    transpose_A: bool = False,

    transpose_B: bool = False,

    policy: GemmWarpPolicy = GemmWarpPolicy.Square,

    clear_accum: bool = False,

    k_pack: int = 1,

    wg_wait: int = 0,

    mbar: Optional[tir.Buffer] = None,

):

    """Perform a General Matrix Multiplication (GEMM) operation.

    This function computes C = A @ B where A and B can optionally be transposed.

    The operation supports various warp policies and accumulation modes.

    Args:

        A (Union[tir.Buffer, tir.Var]): First input matrix

        B (Union[tir.Buffer, tir.Var]): Second input matrix

        C (Union[tir.Buffer, tir.Var]): Output matrix for results

        transpose_A (bool, optional): Whether to transpose matrix A. Defaults to False.

        transpose_B (bool, optional): Whether to transpose matrix B. Defaults to False.

        policy (GemmWarpPolicy, optional): Warp execution policy. Defaults to GemmWarpPolicy.Square.

        clear_accum (bool, optional): Whether to clear accumulator before computation. Defaults to False.

        k_pack (int, optional): Number of k dimensions packed into a single warp. Defaults to 1.

        wg_wait (int, optional): Warp group wait count. Defaults to 0.

            On hopper it is equivalent to \`wgmma.wait_group.sync.aligned <wg_wait>\` if wg_wait is not -1

            On sm100, \`wg_wait\` can only be 0 or -1. \`mbarrier_wait(TCGEN5MMA barrier)\` will be appended if wg_wait is 0.

        mbar (tir.Buffer, optional): mbarrier for TCGEN5MMA synchronization

    Returns:

        tir.Call: A handle to the GEMM operation

    Raises:

        AssertionError: If the K dimensions of matrices A and B don't match

    """

    def legalize_arguments(arg: Union[tir.Buffer, tir.Var]):

        """Convert let-bound variables to their corresponding buffers.

        Args:

            arg (Union[tir.Buffer, tir.Var]): Input argument to legalize

        Returns:

            Union[tir.Buffer, tir.Var]: The legalized argument

        """

        if isinstance(arg, tir.Var) and T.has_let_value(arg):

            return T.get_let_value(arg).buffer

        return arg

    A = legalize_arguments(A)

    B = legalize_arguments(B)

    C = legalize_arguments(C)

    mbar = legalize_arguments(mbar) if mbar is not None else None

    def retrieve_shape(object: Union[tir.Buffer, tir.BufferRegion]) -> List[int]:

        if isinstance(object, tir.Buffer):

            return object.shape

        elif isinstance(object, tir.BufferRegion):

            region = object.region

            shape = []

            for r in region:

                shape.append(r.extent)

            return shape

        elif isinstance(object, tir.BufferLoad):

            region = get_buffer_region_from_load(object).region

            shape = []

            for r in region:

                shape.append(r.extent)

            return shape

        else:

            raise ValueError(

                f"Unsupported retrieve_shape argument type: {type(object)} for buffer {object}")

    def retrieve_stride(object: Union[tir.Buffer, tir.BufferRegion]) -> List[int]:

        if isinstance(object, tir.Buffer):

            strides = []

            stride = 1

            for s in reversed(object.shape):

                strides.insert(0, stride)

                stride *= s

            return strides

        elif isinstance(object, tir.BufferRegion):

            buffer, _ = object.buffer, object.region

            strides = []

            stride = 1

            for s in reversed(buffer.shape):

                strides.insert(0, stride)

                stride *= s

            return strides

        elif isinstance(object, tir.BufferLoad):

            buffer = object.buffer

            strides = []

            stride = 1

            for s in reversed(buffer.shape):

                strides.insert(0, stride)

                stride *= s

            return strides

        else:

            raise ValueError(

                f"Unsupported retrieve_stride argument type: {type(object)} for buffer {object}")

    A_shape = retrieve_shape(A)

    B_shape = retrieve_shape(B)

    C_shape = retrieve_shape(C)

    A_stride = retrieve_stride(A)

    B_stride = retrieve_stride(B)

    assert len(C_shape) == 2, "current only support C as a 2D tensor"

    assert len(A_shape) >= 2, "current only support A as a 2D or higher-order tensor"

    assert len(B_shape) >= 2, "current only support B as a 2D or higher-order tensor"

    if len(A_shape) > 2:

        for i in range(len(A_shape) - 2):

            assert A_shape[i] == 1, \

                "current only support A as a 2D or higher-order tensor with the last two dimensions being the matrix dimensions"

    if len(B_shape) > 2:

        for i in range(len(B_shape) - 2):

            assert B_shape[i] == 1, \

                "current only support B as a 2D or higher-order tensor with the last two dimensions being the matrix dimensions"

    M, N = C_shape

    K = A_shape[-2] if transpose_A else A_shape[-1]

    K_B = B_shape[-1] if transpose_B else B_shape[-2]

    assert K == K_B, f"T.gemm K shape check failed: K_A = {K}, K_B = {K_B}"

    stride_a = A_stride[-2]

    stride_b = B_stride[-2]

    def retrieve_ptr(object: Union[tir.Buffer, tir.BufferRegion],

                     access_type: str = "r") -> tir.PrimExpr:

        if isinstance(object, tir.Buffer):

            return object.access_ptr(access_type)

        elif isinstance(object, tir.BufferRegion):

            buffer, region = object.buffer, object.region

            indices = []

            for r in region:

                indices.append(r.min)

            strides = []

            stride = 1

            for s in reversed(buffer.shape):

                strides.insert(0, stride)

                stride *= s

            offset = 0

            # not offset the last two dimension

            for i in range(len(indices) - 2):

                offset += indices[i] * strides[i]

            return buffer.access_ptr(access_mask=access_type, offset=offset)

        elif isinstance(object, tir.BufferLoad):

            buffer = object.buffer

            region = get_buffer_region_from_load(object).region

            indices = []

            for r in region:

                indices.append(r.min)

            strides = []

            stride = 1

            for s in reversed(buffer.shape):

                strides.insert(0, stride)

                stride *= s

            offset = 0

            for i in range(len(indices) - 2):

                offset += indices[i] * strides[i]

            return buffer.access_ptr(access_mask=access_type, offset=offset)

        else:

            raise ValueError(

                f"Unsupported retrieve_ptr argument type: {type(object)} for buffer {object}")

    def retrieve_offset(object: Union[tir.Buffer, tir.BufferRegion]) -> tir.PrimExpr:

        """Retrieve the offset of the buffer or buffer region."""

        if isinstance(object, tir.Buffer):

            return [0] * len(object.shape)

        elif isinstance(object, tir.BufferRegion):

            _, region = object.buffer, object.region

            indices = []

            for r in region:

                indices.append(r.min)

            return indices

        elif isinstance(object, tir.BufferLoad):

            region = get_buffer_region_from_load(object).region

            indices = []

            for r in region:

                indices.append(r.min)

            return indices

        else:

            raise ValueError(

                f"Unsupported retrieve_offset argument type: {type(object)} for buffer {object}")

    A_offset = retrieve_offset(A)

    B_offset = retrieve_offset(B)

    assert A_offset[-2] == 0, "The offset of the first dimension of A must be 0"

    assert B_offset[-2] == 0, "The offset of the first dimension of B must be 0"

    offset_a = A_offset[-1]

    offset_b = B_offset[-1]

    Aptr = retrieve_ptr(A, "r")

    Bptr = retrieve_ptr(B, "r")

    Cptr = retrieve_ptr(C, "rw")

    mbarptr = retrieve_ptr(mbar, "rw") if mbar is not None else tir.const(0, "uint32")

    C_coords = [r.min for r in C.region] if isinstance(C, tir.BufferRegion) else [0, 0]

    return tir.call_intrin("handle", tir.op.Op.get("tl.gemm"), Aptr, Bptr, Cptr, transpose_A,

                           transpose_B, M, N, K, policy, clear_accum, stride_a, stride_b, offset_a,

                           offset_b, k_pack, wg_wait, mbarptr, C_coords[0], C_coords[1])
```

TileLang 内部的 gemm 实现负责处理矩阵乘法的低层细节，如内存管理、数据传输等。它涉及以下几个主要步骤：

1. 参数合法性检查：TileLang 会首先检查输入矩阵的形状，确保它们符合矩阵乘法的要求。  
	```javascript
	A_shape = retrieve_shape(A)
	B_shape = retrieve_shape(B)
	C_shape = retrieve_shape(C)
	```
2. 内存指针获取  
	```javascript
	Aptr = retrieve_ptr(A, "r")
	Bptr = retrieve_ptr(B, "r")
	Cptr = retrieve_ptr(C, "rw")
	```
	  
	TileLang 会通过 retrieve\_ptr 函数获取矩阵 A、B 和 C 的内存地址。
3. 矩阵乘法操作  
	```javascript
	return tir.call_intrin("handle", tir.op.Op.get("tl.gemm"), Aptr, Bptr, Cptr, ...)
	```
	  
	最后， `tir.call_intrin` 会调用 TileLang 内部的 tl.gemm 操作，进行矩阵乘法的计算。

### 启用 swizzling、并行化复制等优化的中粒度版本

```python
import tilelang.language as T

# \`make_mma_swizzle_layout\` is a python-defined layout function

# that helps align data for MMA (Matrix Multiply-Accumulate) operations.

from tilelang.intrinsics import make_mma_swizzle_layout as make_swizzle_layout

def matmul(M, N, K, block_M, block_N, block_K, dtype="float16", accum_dtype="float"):

    @T.prim_func

    def main(

        A: T.Tensor((M, K), dtype),

        B: T.Tensor((K, N), dtype),

        C: T.Tensor((M, N), dtype),

    ):

        with T.Kernel(T.ceildiv(N, block_N), T.ceildiv(M, block_M), threads=128) as (bx, by):

            # Allocate shared and local fragments

            A_shared = T.alloc_shared((block_M, block_K), dtype)

            B_shared = T.alloc_shared((block_K, block_N), dtype)

            C_local  = T.alloc_fragment((block_M, block_N), accum_dtype)

            # Annotate memory layout

            T.annotate_layout({

                A_shared: make_swizzle_layout(A_shared),

                B_shared: make_swizzle_layout(B_shared),

            })

            # Enable swizzle-based rasterization for better L2 locality

            T.use_swizzle(panel_size=10, enable=True)

            # Clear the local accumulation buffer

            T.clear(C_local)

            # Pipelined iteration over K dimension

            for idx in T.Pipelined(T.ceildiv(K, block_K), num_stages=3):

                # Copy tile of A

                T.copy(A[by * block_M, idx * block_K], A_shared)

                # Parallel copy tile of B

                for ko, j in T.Parallel(block_K, block_N):

                    B_shared[ko, j] = B[idx * block_K + ko, bx * block_N + j]

                # Perform local GEMM on the shared-memory tiles

                T.gemm(A_shared, B_shared, C_local)

            # Copy the result tile back

            T.copy(C_local, C[by * block_M, bx * block_N])

    return main
```

与上一个示例的区别：

1. `T.annotate_layout(...)` 注释说明数据在共享内存中的组织方式
2. `T.use_swizzle(...)` 启用基于 swizzle 的光栅化
3. `T.Parallel(...)` 使用并行复制循环，将全局到共享内存的复制分配到所有线程，向量化 load/store 指令。

![GEMM with Multi-Level Tiling on GPUs](https://tilelang.com/_images/LayoutInference.png)

### warp 级完全控制的细粒度 MMA 计算

```python
@simplify_prim_func

def tl_matmul(

    M,

    N,

    K,

    in_dtype,

    out_dtype,

    accum_dtype,

):

    assert in_dtype in [

        "float16",

        "int8",

    ], "Currently only float16 and int8 are supported"

    assert out_dtype in [

        "float16",

        "float32",

        "int32",

    ], "Currently only float16, float32 and int32 are supported"

    micro_size_x = micro_size_y = micro_size_k = 16

    if out_dtype == "int32":

        micro_size_k = 32

    # This is a debug config

    block_row_warps = 2

    block_col_warps = 2

    warp_row_tiles = 32

    warp_col_tiles = 32

    chunk = 32

    shared_scope = "shared.dyn"

    # Pipeline Stage

    stage = 2

    block_M = block_row_warps * warp_row_tiles

    block_N = block_col_warps * warp_col_tiles

    block_K = chunk

    A_shape = (M, K)

    B_shape = (N, K)

    A_shared_shape = (block_M, block_K)

    B_shared_shape = (block_N, block_K)

    C_shared_shape = (

        block_M // micro_size_x,

        block_N // micro_size_y,

        micro_size_x,

        micro_size_y,

    )

    warp_size = 32

    threads = warp_size * (block_row_warps * block_col_warps)

    local_size_a = (micro_size_x * micro_size_k) // warp_size

    local_size_b = (micro_size_y * micro_size_k) // warp_size

    local_size_c = (micro_size_x * micro_size_y) // warp_size

    warp_rows = warp_row_tiles // micro_size_x

    warp_cols = warp_col_tiles // micro_size_y

    # MMA Wrapper to Auto Generate Code for MMA

    mma_emitter = TensorCoreIntrinEmitter(

        a_dtype=in_dtype,

        b_dtype=in_dtype,

        accum_dtype=accum_dtype,

        a_transposed=False,

        b_transposed=True,

        block_row_warps=block_row_warps,

        block_col_warps=block_col_warps,

        warp_row_tiles=warp_row_tiles,

        warp_col_tiles=warp_col_tiles,

        chunk=chunk,

    )

    @T.prim_func

    def main(

            A: T.Tensor(A_shape, in_dtype),

            B: T.Tensor(B_shape, in_dtype),

            C: T.Tensor((M, N), out_dtype),

    ):

        with T.Kernel(T.ceildiv(N, block_N), T.ceildiv(M, block_M), threads=threads) as (bx, by):

            A_shared = T.alloc_shared(A_shared_shape, in_dtype, scope=shared_scope)

            B_shared = T.alloc_shared(B_shared_shape, in_dtype, scope=shared_scope)

            C_shared = T.alloc_shared(C_shared_shape, out_dtype, scope=shared_scope)

            A_local = T.alloc_local((warp_rows * local_size_a), in_dtype)

            B_local = T.alloc_local((warp_cols * local_size_b), in_dtype)

            C_local = T.alloc_local((warp_rows * warp_cols * local_size_c), accum_dtype)

            T.annotate_layout({

                A_shared: make_swizzle_layout(A_shared),

                B_shared: make_swizzle_layout(B_shared),

            })

            # Improve L2 Cache

            T.use_swizzle(panel_size=10)

            T.clear(C_local)

            for ko in T.Pipelined((K // block_K), num_stages=stage):

                # Load A into shared memory

                for i, k in T.Parallel(block_M, block_K):

                    A_shared[i, k] = A[by * block_M + i, ko * block_K + k]

                # Load B into shared memory

                for j, k in T.Parallel(block_N, block_K):

                    B_shared[j, k] = B[bx * block_N + j, ko * block_K + k]

                for ki in T.serial(0, (block_K // micro_size_k)):

                    # Load A into fragment

                    mma_emitter.ldmatrix_a(

                        A_local,

                        A_shared,

                        ki

                    )

                    # Load B into fragment

                    mma_emitter.ldmatrix_b(

                        B_local,

                        B_shared,

                        ki

                    )

                    # Perform Matrix Multiplication

                    mma_emitter.mma(A_local, B_local, C_local)

            # Perform STMatrix

            mma_emitter.stmatrix(

                C_local,

                C_shared,

            )

            # Store shared into global

            for i, j in T.Parallel(block_M, block_N):

                C[by * block_M + i, bx * block_N + j] = C_shared[

                    i // micro_size_x,

                    j // micro_size_y,

                    i % micro_size_x,

                    j % micro_size_y,

                ]
```

代码理解：

1. **设置 Tile 尺寸和线程绑定** ：像在 CUDA 中一样，首先定义每个块中想要的 warp 或线程数量，以及矩阵如何细分。在 TileLang 中，这是通过 `T.Kernel(...)` 和 `T.thread_binding(...),` 完成的，它们确保了正确数量的线程处于活动状态，并且每个线程被绑定到一个特定的角色（例如，warp ID 或 lane ID）。  
	```python
	micro_size_x = micro_size_y = micro_size_k = 16
	if out_dtype == "int32":
	    micro_size_k = 32
	block_row_warps = 2
	block_col_warps = 2
	warp_row_tiles = 32
	warp_col_tiles = 32
	chunk = 32
	```
2. **分配 Warp 局部片段** ：不再使用一个共享缓冲区来存储部分和，而是分配本地缓冲区（寄存器片段）来存储矩阵 A 和 B 的子块，在 TileLang 中以如下方式完成：（每个 local 分配都代表一个线程存储的区域，这些区域共同形成了 warp 的寄存器 tile）  
	```python
	A_local = T.alloc_local((warp_rows * local_size_a), in_dtype)
	B_local = T.alloc_local((warp_cols * local_size_b), in_dtype)
	C_local = T.alloc_local((warp_rows * warp_cols * local_size_c), accum_dtype)
	```
3. **通过 `ldmatrix` 加载数据** ：细粒度的加载指令允许用户指定数据从共享内存移动到 warp 级片段的确切方式。下面代码中， `mma_emitter.ldmatrix_a()` 和 `mma_emitter.ldmatrix_b()` 是 warp 同步内联函数的更高层包装器（也可按需编写自己的加载逻辑）  
	  
	在内部，这些调用协调每个 warp 中的线程发出正确的加载指令、执行地址计算并将数据存储到寄存器中。
4. **执行 MMA 指令** ：加载子瓦片（片段）后，warp 执行 `mma` 指令。此操作本质上为： $Clocal+=Alocal×Blocal$ ，其中 warp 中的每个线程计算最终瓦片的一小部分。例如：  
	```python
	mma_emitter.mma(A_local, B_local, C_local)
	```
	  
	在底层，这转化为 Tensor Core 指令（例如 PTX 中的 `wmma.mma.sync` ），这些指令并行处理 warp 中的多个数据元素。
5. **通过 `stmatrix` 存储结果** ：

通过结合 warp 同步内联函数（ `ldmatrix` ， `mma` ， `stmatrix` ）与手动线程绑定和内存分配，可以在 TileLang 上复制原始 CUDA 的控制和性能。这种方法最适合那些熟悉 GPU warp 级别编程的专家用户，因为它确实需要深入理解硬件并发性、内存层次结构和调度。然而，对于性能关键路径来说，这种回报可能是显著的，其中每一字节的带宽和每一周期的延迟都必须精心编排。

### 与 CUDA 和 Triton 的对比

- **CUDA** ：需要开发者手动管理内存、线程分配和块调度，且需要手动优化每个细节（例如局部内存的使用、共享内存的调度等）。
- **Triton** ：提供了一定的高级抽象和自动化，简化了很多 CUDA 编程的细节，但仍允许开发者进行细粒度的调优（例如通过配置 `BLOCK_SIZE` 和 `num_stages` ）。
- **TileLang** ：提供更高层次的抽象，使得开发者能够通过简洁的 API 控制硬件资源，尤其是细粒度的 warp 级别控制，可以直接利用 Tensor Core 等硬件加速单元，显著提高矩阵乘法的性能。