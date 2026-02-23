---
title: "How to write a fast Softmax CUDA kernel?"
author:
  - "[[GitHub]]"
published:
date: "2026-01-19T18:23:34+08:00"
description: "AITemplate is a Python framework which renders neural network into high performance CUDA/HIP C++ code. Specialized for FP16 TensorCore (NVIDIA GPU) and MatrixCore (AMD GPU) inference. - How to write a fast Softmax CUDA kernel? · facebookincubator/AITemplate Wiki"
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：https://github.com/facebookincubator/AITemplate/wiki/How-to-write-a-fast-Softmax-CUDA-kernel%3F

**Author: Zhijing Li**

**TLDR**: This is a study note to implement efficient softmax on CUDA. I decide to write this since

- The technique can be widely applied to various block reduction operations, e.g layernorm.
- By implementing vectorized read and write, it can achieve
	- at most 50% speedup compared to state-of-the-art oneflow implementation on A100.
	- on average 10% gain when the reduction dimension K < 4000, which is the mostly used case for softmax operation.

## Background

### Softmax

Softmax is a smooth approximation to arg max function. It is continuous and converge quickly at max and min of input vector and thus widely applied to various neural networks. Mathematically, it takes a vector z of K real numbers as input and normalize to probabilities them with exponentials of the input vector.

![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/softmax.png)

In computer science, before taking exponentials of the input, we have to subtract maximum of the vector to avoid overflow.

```
def softmax(x): # x[M, K]
    """Compute softmax values for each sets of scores in x."""
    e_x = exp(x - max(x, axis=1)) # subtract max to avoid overflow
    return e_x / e_x.sum(axis=1)
```

The above persudo code illustrates the operations of a softmax with input `x[M, K]`. On GPU, we need to consider the operation operations:

- `subtract` and `divide`. They are elementwise operations. We can easily achieve maximum concurrency with independent threads
- `max` and `sum` are reduction operations. They are non-elementwise operations. We need communication between GPU threads to reduce the result.

### GPU Structure

GPU (graphics processing units) is a computer designed for parallel processing. A GPU is composed of several grids, each grid is composed of several blocks and each block is composed of several threads. There are several things we take into consider when we launch GPU from CPU.

- We need to decide the grid and block size. If we launch a grid with gridDim.x=32, gridDim=16, it means we launch a total of 32\*16 = 512 blocks. Similarly, if we launch a block with blockDim.x=32, blockDim=16, it means we launch a total of 32\*16 = 512 threads. How many blocks and threads we should launch is decided by input size and block size:
	- The memory access at each level is at different expenses. For communication between grids, we need to synchronous through global memory; to perform reduction within a block, we need to access shared memory; for each thread, it has local registers that’s only visible to itself. The expense of accessing of memories:
		- `global memory >> shared memory > register.`
	- Because the access latency is lower for register compared to shared memory, ideally, we would like all reductions to happen within the same thread, i.e. elementwise operations. However, we won’t have infinite parallelism within one thread for non-elementwise operations like `sum` and `max`. **How to balance them becomes a design topic.**
- Grid and block are logical partition of GPU. At actual implementation, in a GPU, the basic unit of execution is the warp. A warp is a colletion of 32 threads that are executed simultaneously by a streaming multiprocessor (SM).
	- **Within a wrap, there is a software abstraction of “register cache”.** It is an optimization technique that develops a virtual caching layer for threads in a single warp. This abstraction helps optimize kernels that use shared memory to cache thread inputs.
	- In 2012, NVIDIA introduced the primitive functions `shfl_*_sync(m, r, t)`. It can issuing thread to share a value stored in register `r` while reading the value shared by thread `t` in the same warp (`m` is a 32-bit mask of participating threads within the warp). This way, GPU can performe reduction within a wrap without accessing shared memory and achieve higher bandwdith.

![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/gpu_grid_block.png)

Assuming that we have a 2D `input[M, K]`, i.e. 2D matrix with M rows and K columns and we would like to perform reduction among columns.

As mentioned in previous section, max and sum are two reduction operations that need to be distributed among threads, while register access has minimal cost and wrap is the collections of threads within which registers of one thread are “visible” to other threads. Therefore, given the 2D `input[M, K]`, when `K` is small, we can distribute `K` among a wrap.

**How To do Wrap Reduction** The wrap reduction code looks like the following. We use `__shfl_xor_sync` to synchronously reduce among val among registers within a wrap. `xor` means using `xor` to shuffle input indexes.

```
template <typename T, int NUM>
__inline__ __device__ T warpReduceMax(T* val, int thread_group_width = 32) {
#pragma unroll
  for (int i = 0; i < NUM; i++) {
#pragma unroll
    for (int mask = thread_group_width / 2; mask > 0; mask >>= 1) {
      val[i] = max(val[i], __shfl_xor_sync(0xffffffff, val[i], mask, 32));
    }
  }
  return (T)(0.0f);
}
```
- Assuming `input[M, K]`, we use vector read with `pack_size` as length. **When `K/pack_size >= 32`**, we launch `M/pack_size` blocks and `128` threads. Each block is further partition into two dimensions x and y, where on x dimension we perform wrap reduction on columns, on y dimension we parallelize independent row operations. The warp size is `32` as `K > 32*pack_size`.
	- i.e. `GridDim = <M/pack_size>, BlockDim = <32, 4>`.
	- Each thread processes `K/32` columns. (Each thread process every `pack_size` in the inner loop.)
	- Each block processes `4` rows, `32` columns.
	- Each grid processes `M/4` rows.
- Assuming `input[M, K]`, we use vector read with pack\_size as length. When `K/pack_size < 32`. We launch `M*K/pack_size/128` blocks and `128` threads, each block is further partition into two dimensions x and y, where on x dimension we perform wrap reduction on columns, on y dimension we parallelize independent row operations. But this time the wrap size for wrapReduce method is `K/pack_size`.
	- i.e. `GridDim = <MK/128/pack_size>, BlockDim = <K/pack_size, 128/K*pack_size>`
	- Each thread processes `pack_size` columns.
	- Each block processes `128/K*pack_size` rows, `K/pack_size` columns.
	- Each grid processes `M*K/128/pack_size` rows.

The code snippet of wrap reduce is listed as following when pack\_size=4 and input datetype is `half`:

```
template<int cols_per_thread>
__global void softmax_stored_locally_multi_dim(const half4* input, half4* output, size_t m, size_t n) {
 constexpr int num_packs = (cols_per_thread+3) / 4;//pack_size = 4, k/32 = cols_per_thread, num_packs = k/32/4
 float4 buf[num_packs];
 const int m_idx = blockIdx.x * blockDim.y + threadIdx.y;//blockDim.y=4=thread_group_per_block
 const int tid = threadIdx.x;

 for (int64_t row = m_idx; row < m; row += gridDim.x * blockDim.y) {

   const int64_t row_offset = row * (n >> 2);
   const half4* row_x = input + row_offset;
   half4* row_y = output + row_offset;
   float local_max[1] = {-Inf<float>()};
#pragma unroll
   for (int pack_id = 0; pack_id < num_packs; ++pack_id) {
     const int col = pack_id * blockDim.x + tid;
     // row_y[col] = row_x[col];
     if (col < n/4) {
       buf[pack_id] = {
           half2float(row_x[col].x),
           __half2float(row_x[col].y),
           __half2float(row_x[col].z),
           __half2float(row_x[col].w)};
       local_max[0] = max(local_max[0], max(max(buf[pack_id].x, buf[pack_id].y), max(buf[pack_id].z, buf[pack_id].w)));
     } else {
       buf[pack_id].x = -Inf<float>();
       buf[pack_id].y = -Inf<float>();
       buf[pack_id].z = -Inf<float>();
       buf[pack_id].w = -Inf<float>();
     }
   }
   warpReduceMax<float,1>(local_max, blockDim.x);//cal the actual max among cols

   float local_sum[1] = {0.0f};
#pragma unroll
   for (int i = 0; i < num_packs; ++i) {
     buf[i].x = exp(buf[i].x - local_max[0]);
     buf[i].y = exp(buf[i].y - local_max[0]);
     buf[i].z = exp(buf[i].z - local_max[0]);
     buf[i].w = exp(buf[i].w - local_max[0]);
     local_sum[0] += buf[i].x;
     local_sum[0] += buf[i].y;
     local_sum[0] += buf[i].z;
     local_sum[0] += buf[i].w;
   }
   warpReduceSum<float, 1>(local_sum, blockDim.x);

   for (int i = 0; i < num_packs; ++i) {
     const int col = i * blockDim.x + tid;
     if (col < n/4) {
       row_y[col] = { buf[i].x/local_sum[0], buf[i].y/local_sum[0], buf[i].z/local_sum[0], buf[i].w/local_sum[0] };
     }
   }
 }
}
```

Ideally, reducing among wrap is fastest. However, we need local registers to store inputs as each thread needs to store `K/32*pack_size*sizeof(float)`. We have limited registers. When local register is not enough, CUDA will automatically use secondary shared memory and it becomes less ideal to stick with wrap reduction method. Also, when launching with large K, it would be fast enough to use shard memory.

**How To do Block Reduction** Because we perform reduction over the entire block, we need some way to synchronize among threads, i.e. we use shared memory. We perform reduction among each wrap, store to shared memory and load to first warp and perform reduction again.

- Here is an example. Assuming we have blocksize = 112, which can be decomposed to `32+32+32+16`,
	- We first reduce among each wrap, i.e. `32, 32, 32, 16`
	- We store to shared memory with `index = threadIdx.x / warp_size`
	- Read to first warp local register when `threadIdx.x < (blockDim.x / 32)`, e.g. threadIdx.x = 0,1,2,3
	- Perform reduction on first wrap, ie. `threadIdx.x / warp_size==0`.
- Assuming `input[M, K]`. We launch `M` blocks and `1024` (maximum) threads. Each block handles a column and we launch as many blocks as #rows.
	- i.e. We launch `GridDim = <M>, BlockDim = <block_size>, Shared memory = K*sizeof(float)`.
	- The block\_size can be one of `1024, 512, 256, 128`.
		- We first use `cudaOccupancyMaxActiveBlocksPerMultiprocessor` to calculate actual used threads.
		- If there is no waste, we would like it to be as large as possible to achieve higher concurrency (e.g 1024).
	- Each thread processes `K/block_size` columns.
	- Each block processes `block_size` columns.
	- Each grid processes `M` rows.

The code snippet of block reduce when pack size is `4` and input datetype is `half ` is listed as following:

```
// block_size = blockDim.x = 128,256,512,1024
template<int block_size>
__global void softmax_block_smem_half(
   const half4* input,
   half4* output,
   size_t m,
   const size_t n) {
 const int m_idx = blockIdx.x;
 const int tid = threadIdx.x;
 extern shared align(sizeof(float)) unsigned char shared_buf[];//size_t smem = nsizeof(float)
 auto buf = reinterpret_cast<float>(shared_buf);
 const int num_packs = n >> 2;
 for (int64_t row = m_idx; row < m; row += gridDim.x) {
   const int64_t row_offset = row  (n>>2);
   const half4* row_x = input + row_offset;
   half4* row_y = output + row_offset;
   float local_max[1] = {-Inf<float>()};

   for (int pack_id = tid; pack_id < num_packs; pack_id += blockDim.x) {
     const int col = pack_id;
     // store to local register, which is faster than shared memory
     float4 pack = {
         half2float(row_x[col].x),
         __half2float(row_x[col].y),
         __half2float(row_x[col].z),
         __half2float(row_x[col].w)};
     buf[col] = pack.x;
     buf[num_packs+col] = pack.y;
     buf[2num_packs+col] = pack.z;
     buf[3num_packs+col] = pack.w;

     local_max[0] = max(local_max[0], max(max(pack.x, pack.y), max(pack.z, pack.w)));
   }
   blockReduceMax<float, 1>(local_max);//reduce on a block of #blockDim.x

   __shared float s_max;
   if (threadIdx.x == 0) {
     s_max = local_max[0];
   }
   syncthreads();

   float local_sum[1] = {0.0f};
   for (int i = tid; i < n; i += blockDim.x) {
     float local_val = exp(buf[i]-s_max);
     buf[i] = local_val;
     local_sum[0] += local_val;
   }
   blockReduceSum<float, 1>(local_sum);

   __shared float s_sum;
   if (threadIdx.x == 0) {
     s_sum = local_sum[0];
   }
   syncthreads();

   for (int i = tid; i < num_packs; i += blockDim.x) {
     const int col = i;
     row_y[col] = {
       __float2half_rn(buf[i]/s_sum),
       __float2half_rn(buf[num_packs+i]/s_sum),
       __float2half_rn(buf[2num_packs+i]/s_sum),
       __float2half_rn(buf[3num_packs+i]/s_sum)};
   }
 }
}
```
- Finally, there is a special case where `K` is really large, we still use block reduction. In this case, we won’t have enough shared memory and we will not cache any kernel.
	- i.e. we no longer keep shared memory, but calculate `exp(buf[i]-s_max)` each time we need it.

## Profiling Softmax

When `K` is small, we shall use wrap reduction and when `K` is large, we shall use block reduction. However, what’s the threshold for `K`? We run experiment on NVIDIA A100 to get that threshold. The input size is `[4096, 128*2]` where `i = 2,3,4, ..,64`.

| pack\_size=1 | pack\_size=2 |
| --- | --- |
| ![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/pack_size_1.png) | ![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/pack_size_2.png) |

| pack\_size=4 | pack\_size=8 |
| --- | --- |
| ![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/pack_size_4.png) | ![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/pack_size_8.png) |

We can observe that WrapReduce is very efficient compared to block reduce when `pack_size` is small. But when `pack_size` is large, `wrapReduce` and `blockReduce` can match each others’ performance for a wide range of `K`. Among different `pack_sizes`, the larger the read vector is, i.e. larger `pack_size`, the quicker we can process data.

With this setup, we learn the required threshold `K` for different pack\_size on NVIDIA A100. I also highlighted it as a **yellow circle** in the graph.

| Pack Size | Threshold K |
| --- | --- |
| 1 | 1408 |
| 2 | 1152 |
| 4 | 1920 |
| 8 | 3840 |

Oneflow softmax is the state-of-the art implementation for softmax kernel. This post is also built based on their findings. It is using a mix of wrapReduce and blockReduce when `K/pack_size < 1024`. Their `pack size` is 2. We run oneflow softmax on NVIDIA A100.

- By comparing with oneflow, we at most 50% speedup when `pack size` is 8.
- On average we have 10% gain when the reduction dimension `K < 4000`, which is the mostly used case for softmax operation.

![](https://github.com/facebookincubator/AITemplate/raw/main/docs/image/vs_oneflow.png)

## References

- Register Cache: Caching for Warp-Centric CUDA Programs. [https://developer.nvidia.com/blog/register-cache-warp-cuda/](https://developer.nvidia.com/blog/register-cache-warp-cuda/)
- How to Implement an Efficient Softmax CUDA Kernel— OneFlow Performance Optimization. [https://developer.nvidia.com/blog/register-cache-warp-cuda/](https://developer.nvidia.com/blog/register-cache-warp-cuda/)
- AITemplate layernorm implementation. [https://github.com/fairinternal/AITemplate/blob/main/python/aitemplate/backend/cuda/layernorm\_sigmoid\_mul/layernorm\_sigmoid\_mul\_kernel.cuh](https://github.com/fairinternal/AITemplate/blob/main/python/aitemplate/backend/cuda/layernorm_sigmoid_mul/layernorm_sigmoid_mul_kernel.cuh)

## Acknowledge

I want to thank [Yang Chen](https://github.com/chenyang78) for discussions and suggestions, [Bing Xu](https://github.com/antinucleon) for proposing and providing references on this topic and [Terry Chen](https://github.com/terrychenism), [Hao Lu](https://github.com/hlu1) for their layernorm implementation as a good reference.