---
title: "NVIDIA Tensor Core Evolution: From Volta To Blackwell"
author:
  - "[[Dylan Patel]]"
published: 2025-06-23
date: "2025-12-10T17:01:27+08:00"
description: "Amdahl’s Law, Strong Scaling, Asynchronous Execution, Blackwell, Hopper, Ampere, Turing, Volta, TMA"
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：https://newsletter.semianalysis.com/p/nvidia-tensor-core-evolution-from-volta-to-blackwell

### Amdahl’s Law, Strong Scaling, Asynchronous Execution, Blackwell, Hopper, Ampere, Turing, Volta, TMA

In our [AI Scaling Laws article from late last year](https://semianalysis.com/2024/12/11/scaling-laws-o1-pro-architecture-reasoning-training-infrastructure-orion-and-claude-3-5-opus-failures/), we discussed how multiple stacks of AI scaling laws have continued to drive the AI industry forward, enabling greater than Moore's Law growth in model capabilities as well as a commensurately rapid reduction in unit token costs. These scaling laws are driven by training and inference optimizations and innovations, but advancements in compute capabilities transcending Moore's Law have also played a critical role.

One this front, in the AI Scaling Laws article, we revisited the decades-long debate around compute scaling, recounting the end of Dennard Scaling in the late 2000s as well as the end of classic Moore's Law pace cost per transistor declines by the late 2010s. Despite this, compute capabilities have continued to improve at a rapid pace, with the baton being passed to other technologies such as [advanced packaging](https://semianalysis.com/2021/12/15/advanced-packaging-part-1-pad-limited/), [3D stacking](https://semianalysis.com/2025/02/05/iedm2024/), [new transistor types](https://semianalysis.com/2023/02/21/the-future-of-the-transistor/) and specialized architectures such as the GPU.

![](https://substackcdn.com/image/fetch/$s_!HuXj!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff787d2c-5a0d-482a-9e25-a90bcb570073_768x480.png)

Source: Nvidia

When it comes to AI and deep learning, GPU compute capabilities have improved at a faster than Moore's law pace, consistently delivering remarkable " [Huang's Law](https://en.wikipedia.org/wiki/Huang%27s_law) " performance improvements year after year. The technology that is at the heart of driving this improvement is the Tensor Core.

Though the Tensor Core is unquestionably the bedrock upon which the foundations of modern AI and machine learning are built, it is not well understood, even by many experienced practitioners in the field. The rapid evolution of GPU architecture and programming models that run on this architecture means that it is increasingly challenging for Machine Learning researchers and scientists to keep up with the latest changes to Tensor Cores and grasp the implications of these changes.

![](https://substackcdn.com/image/fetch/$s_!9KoD!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3ef2767c-1f00-44f5-92d2-2cffc1e7152c_1642x972.png)

Source: SemiAnalysis, HC2023-K2: Hardware for Deep Learning

In this report, we will introduce the core features of the major datacenter GPUs, first explaining important first principles of performance engineering. We will then trace the evolution of Nvidia’s Tensor Core architectures and programming models, highlighting the motivations behind this evolution. Our end goal is to provide a resource for understanding Nvidia’s GPU architecture and offer intuitive insights into their architectural evolution. Only after explaining each architecture can we explain the beauty of the Blackwell tensor core and the new memory hierarchy of it.

It is important that we explain that a solid grasp of computer architecture is a prerequisite for being able to follow many of the explanations and discussions in this article, and this article will provide a brief section about CUDA programming as a refresher rather than explaining foundational concepts of GPU architecture. Instead, we build on the forefront of Tensor Core knowledge, extending understanding of this cutting-edge technology by documenting what is currently tribal knowledge into accessible, structured insight through detailed explanation.

Just as a university will teach 101 courses as well as 4000 level courses, different articles at SemiAnalysis will cater to varying levels of understanding of the subject matter as well as to readers in different vocations and specializations.

We would like to thank our collaborators:

- [Jay Shah](https://research.colfax-intl.com/), Colfax Research: Terrific CUTLASS tutorials and numerous meetings meticulously checking the technical details
- [Ben Spector](https://benjaminfspector.com/), Stanford Hazy Research: Offered great insights into programming model change and writing advice
- [Tri Dao](https://tridao.me/), Princeton and Together AI: Reviewed drafts and gave detailed feedback
- [Neil Movva](https://www.neilmovva.com/about/), Together AI: Reviewed drafts and offered insights into GPU kernel writing
- [Charles Frye](https://charlesfrye.github.io/about/), Modal: Pedagogical GPU Glossary and general review of the draft
- [Simon Guo](https://simonguo.tech/), Stanford PhD student: Illustrated the cover picture and reviewed the draft
- NVIDIA: Shared context around the progression of Tensor Core designs. Teams include:
	- [Ian Buck](https://x.com/SemiAnalysis_/status/1916204055564849358), Inventor of CUDA
	- [Jonah Alben](https://x.com/SemiAnalysis_/status/1916204055564849358), Head of GPU Architecture and Engineering
- Many other GPU wizards

SemiAnalysis will be posting exclusive content on [Instagram Reels](http://instagram.com/semianalysis) and [TikTok](https://www.tiktok.com/@semianalysis) starting next week. Follow our socials to get the latest insights on the AI and GPU industry.

## Performance First Principles

### Amdahl’s Law

For a fixed problem size, Amdahl’s Law specifies the maximum speedup you can obtain by parallelizing with more compute resources. Concretely, scaling compute resources only drives down the execution time of the parallel portion, so the performance improvement is bounded by the serial portion. To quantify it, the maximum performance improvement is:

![](https://substackcdn.com/image/fetch/$s_!M_BR!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76cfb0cd-a8b0-4083-9f41-87a653bb5eae_1919x522.png)

where S is the parallel work execution time and p is the speedup of the parallelizable work. In an ideal world where the parallel portion is perfectly parallelized, the speedup p can be the number of processing units.

### Strong and Weak Scaling

Strong and weak scaling describe the performance improvement of scaling compute resources for different problem setups. Strong scaling refers to scaling compute resources to solve a fixed-size problem, and Amdahl's Law quantifies the speedup of strong scaling. On the other hand, weak scaling refers to scaling compute resources to solve larger problems at a constant time. For example, processing a 4x larger image in the same time using 4x more compute resources. We recommend [this blog post](https://acenet-arc.github.io/ACENET_Summer_School_General/05-performance/index.html) for more detailed explanations.

![](https://substackcdn.com/image/fetch/$s_!YqgC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe1f3a8a8-bb25-4efc-bd49-52d8c84109b5_2560x1807.png)

Source: SemiAnalysis, Performance and Scalability - SCENET Summer School

Strong and weak scaling imply different performance improvements across problem sizes. Strong scaling offers speedup for all problem sizes, while weak scaling only guarantees performance improvement when we use more compute to solve a larger problem.

![](https://substackcdn.com/image/fetch/$s_!95xZ!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F75450ff2-fd26-43fc-9fa5-f5b69e75340d_2115x1743.png)

Source: SemiAnalysis

### Data Movement is the Cardinal Sin

Data movement is a sin because in terms of runtime and scaling, computation is cheap and data movement is expensive. Data movement is fundamentally slower because modern DRAM cells operate at tens of nanoseconds, while transistors switch at sub-nanosecond speed. Regarding scaling, while computation speed gains have slowed since the 2000s, [memory speed has improved slower](https://semianalysis.com/2024/09/03/the-memory-wall/), creating the [memory wall](https://en.wikipedia.org/wiki/Random-access_memory#Memory_wall).

## Tensor Core Architecture Evolution

### Tensor Core Generation Overview

In this section, we introduce the main Nvidia GPU architectures that use Tensor Cores, namely the Tesla V100 GPU, A100 Tensor Core GPU, H100 Tensor Core GPU, as well as the Blackwell GPU. We have also included a pre-Tensor Core section as a refresher for the CUDA programming model. We will briefly go over the major features and changes that are relevant to understanding the Tensor Core, and we defer the details to other sources, which we link in each subsection.

### Pre-Tensor Core

#### PTX Programming Model

Parallel Thread Execution (PTX) is a virtual instruction set that abstracts over GPU generations. A PTX program describes a **kernel function** that is executed with a large number of GPU threads, which are executed on the GPU’s hardware execution units, i.e. CUDA cores. **Threads** are organized as a grid, and a **grid** consists of cooperative thread arrays (**CTA** s). PTX threads can access data from multiple state spaces, which are memory storage areas with different characteristics. Specifically, threads have per-thread **registers**, threads within a CTA have **shared memory**, and all threads can access **global memory**. For more information, please read [this section of the CUDA documentation](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#programming-model).

![](https://substackcdn.com/image/fetch/$s_!NfWh!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14486127-13d1-46c9-a425-092cd54e2370_573x164.png)

Source: SemiAnalysis

#### PTX Machine Model

The GPU architecture is built around an array of streaming multiprocessors (**SM** s). An SM consists of scalar processing cores, a multithreaded instruction unit, and an on-chip shared memory. An SM maps each thread to a scalar processing core (also known as a CUDA core), and the multithreaded instruction unit manages threads in groups of 32 parallel threads called **warps**.

At instruction issue time, the instruction unit selects a warp and issues an instruction to the threads of the warp. This execution method is called single-instruction, multiple threads (**SIMT**). Similar to single-instruction, multiple data (**SIMD**), SIMT controls multiple processing elements with a single instruction, but unlike SIMD, SIMT specifies a single thread behavior instead of vector width. For more information, please read [this section of the CUDA documentation](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#ptx-machine-model).

![](https://substackcdn.com/image/fetch/$s_!i22D!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa110ab3-2276-452f-9258-ee49b6e38825_1606x1630.png)

PTX Machine model. Source: SemiAnalysis, PTX ISA Documentation - Figure 4

#### Streaming Assembler

Streaming Assembler (SASS) is the architecture-specific instruction set that PTX virtualizes over. See the [CUDA binary utilities documentation](https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html#instruction-set-reference) for more information. Unfortunately, SASS is not well documented due to NVIDIA hiding their architecture ISA details from their competitors.

### Volta

#### Why NVIDIA Added Tensor Cores

As deep learning became more prominent, the industry noticed that ML workloads were in need of hardware acceleration. Early in 2015, Google deployed TPUv1 for accelerating their internal ML workloads, and in 2017, Nvidia introduced dedicated hardware for matrix math. Although GPUs consume a small amount of energy when issuing instructions (~30pJ) because of their simple hardware pipeline, simple floating point operations like `HFMA ` consume even less energy at only 1.5pJ. This creates a 20x overhead of power needed for instructions vs for the floating point operation itself. As a result, performing a lot of floating point operations for matrix multiplication is power inefficient. To amortize the instruction overhead, we need to use complex instructions that can perform more computation per instruction. To this end, Nvidia designed the **half-precision matrix multiply and accumulate (`HMMA`) instruction**, a specialized instruction that performs half-precision matrix multiplication. The corresponding dedicated hardware to execute this instruction is the Tensor Core, introduced in the Tesla V100 GPU of Volta architecture in 2017. The Volta tensor core was added very late into development of the Volta architecture, only a handful of months before tape out, a testament to how fast Nvidia can pivot their architecture.

![](https://substackcdn.com/image/fetch/$s_!ANbJ!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9a4ea94b-3148-4fb8-99d0-46fa53a7adf6_797x226.png)

Source: Trends in Deep Learning Hardware: Specialized Instructions Amortize Overhead

#### MMA Instruction Overview

Given a matrix, the multiply and accumulate (MMA) instruction computes D = A \* B + C:

- A is an M by K matrix
- B is a K by N matrix
- C and D are M by N matrices

We denote the matrix shapes as `mMnNkK` or MxNxK.

To perform the full computation, we first load matrices A, B, and C from shared memory to thread registers, so that each thread holds fragments of the matrices. Second, we execute the MMA instruction, which reads the matrices from thread registers, performs computation on Tensor Cores, and stores the result to thread registers. Finally, we store the results from thread registers back to shared memory. The full computation is collectively performed by multiple threads, meaning that every step requires a synchronization between the collaborating threads.

![](https://substackcdn.com/image/fetch/$s_!WvIY!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb80e6b8a-9e01-442f-ab3d-9e6d8ecca9ef_2359x2221.png)

Source: SemiAnalysis

#### 1st Generation Tensor Core - Warp-scoped MMA

An SM of a Tesla V100 GPU contains 8 Tensor Cores, grouped in partitions of two. Each Tensor Core is capable of computing an equivalent of 4x4x4 matrix multiplication per cycle, which amounts to 1024 FLOPs per cycle per SM.  

![](https://substackcdn.com/image/fetch/$s_!jbUo!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F87db8940-a658-48ee-b3bb-8b2a8afdd7c4_1398x784.png)

Source: Volta Tensor Core Training

NVIDIA designed PTX instruction mma to target the lower level `HMMA` instructions. On Volta architecture, an MMA instruction performs an 8x8x4 matrix multiplication, and a quadpair of 8 threads participate in the operation by collectively holding the input and output matrices. Here T0 refers to thread 0, \[T0, T1, T2, T3\] and \[T16, T17, T18, T19\] are threadgroups, and the 2 threadgroups form a quadpair.

![](https://substackcdn.com/image/fetch/$s_!AHSW!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F85a9c390-e85e-4358-b882-f278ddd50e1e_983x975.png)

Source: SemiAnalysis. Generated with CUTLASS visualizer

In terms of data types, Volta Tensor Cores support FP16 inputs with FP32 accumulation in correspondence with NVIDIA’s [mixed-precision training](https://arxiv.org/abs/1710.03740) technique. This technique showed it is possible to train models at lower precision without losing model accuracy.

To fully understand the MMA layout, please refer to Citadel’s microbenchmarking paper, [Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking](https://arxiv.org/abs/1804.06826). To see the interleaved layout pattern for Volta Tensor Core MMAs, please read the slides [Programming Tensor Cores: Native Tensor Cores with CUTLASS](https://developer.download.nvidia.com/video/gputechconf/gtc/2019/presentation/s9593-cutensor-high-performance-tensor-operations-in-cuda-v2.pdf). Finally, for other information of the Volta architecture, please refer to the whitepaper [NVIDIA Tesla V100 GPU Architecture](https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf).

### Turing

Turing architecture includes the **2nd generation Tensor Cores**, an enhanced version of Volta Tensor Cores, adding INT8 and INT4 precision support. Turing Tensor Cores support a new warp-level synchronous MMA, which we will discuss in the next section. Turing Tensor Cores also enabled Deep Learning Super Sampling (DLSS), marking the start of NVIDIA applying deep learning to gaming graphics. Interested readers can refer to NVIDIA’s blog post [NVIDIA Turing Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-turing-architecture-in-depth/) and the [Turing architecture whitepaper](https://images.nvidia.com/aem-dam/en-zz/Solutions/design-visualization/technologies/turing-architecture/NVIDIA-Turing-Architecture-Whitepaper.pdf).

### Ampere

#### Asynchronous Data Copy

With Ampere, NVIDIA introduced asynchronous data copy, a way of copying data directly from global memory to shared memory in an asynchronous fashion. To load data from global memory to shared memory on Volta, threads must first load data from global memory to registers, and then store it to shared memory. However, MMA instructions have high register usage and must share the register file with data-loading operations, causing high register pressure and wasting memory bandwidth for copying data in and out of RF.

Async data copy mitigates this issue by fetching data from global memory (DRAM) and directly storing it into shared memory (with optional L1 access), freeing up more registers for MMA instructions. Data loading and compute can happen asynchronously which is more difficult from a programming model perspective but unlocks higher performance.

This feature is implemented as PTX instruction thread-level async copy cp.async ([documentation](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#data-movement-and-conversion-instructions-non-bulk-copy)). The corresponding SASS is LDGSTS, asynchronous global to shared memory copy. The exact synchronization methods are async-group and mbarrier-based completion mechanisms, detailed [here](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#data-movement-and-conversion-instructions-asynchronous-copy-completion-mechanisms).

![](https://substackcdn.com/image/fetch/$s_!_oXC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F35ec2209-13ce-4a0e-8ff3-7cd5a45918df_1603x339.png)

Source: NVIDIA A100 Tensor Core GPU Architecture Whitepaper

#### 3rd Generation Tensor Core - Warp-level Synchronous MMA

Ampere has 4 Tensor Cores per SM, and each Tensor Core is capable of performing 512 FLOPs per cycle, amounting to 2048 Dense FLOPs per cycle per SM, doubling the performance of Volta.

While Volta requires a quadpair of 8 threads to participate in an MMA operation, Ampere requires a full warp of 32 threads. Having MMA instructions warp-wide simplifies the thread layout & reducing RF pressure for Ampere. For instance, here is the thread and data layout for mixed-precision floating point of shape 16x8x16:

![](https://substackcdn.com/image/fetch/$s_!jSuG!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e7f8f3e-0bda-4e4c-904f-c90c749dd783_806x1026.png)

Source: SemiAnalysis. Generated with CUTLASS visualizer

NVIDIA introduced `ldmatrix` in Ampere, an enhanced vectorized load operation. Like `mma`, `ldmatrix` is warp-wide, meaning that a warp of threads collectively loads a matrix. Compared to issuing multiple load instructions, this reduces address generation register use, lowering register pressure. See [the CUDA documentation](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#warp-level-matrix-instructions-ldmatrix) for more information.

`ldmatrix` loads data to registers in a layout that matches Tensor Core’s data layout. Compared to Volta’s interleaved pattern (See [Programming Tensor Cores: Native Tensor Cores with CUTLASS](https://developer.download.nvidia.com/video/gputechconf/gtc/2019/presentation/s9593-cutensor-high-performance-tensor-operations-in-cuda-v2.pdf)), a simpler thread and data layout greatly improves the programming ergonomics. Watch the GTC talk [Developing CUDA Kernels to Push Tensor Cores to the Absolute Limit on NVIDIA A100](https://www.nvidia.com/en-us/on-demand/session/gtcsj20-s21745/) to learn more about how exactly Ampere’s memory loading is coherent with Tensor Core.

Ampere MMA features Brain Floating Point Format (BF16), which has become the de facto standard for half-precision data types. BF16 provides the same 8-bit exponent range as FP32 but with a 7-bit mantissa, allowing FP32-level dynamic range at half the storage cost. BF16 also removes the need for loss scaling in mixed-precision training.

### Hopper

#### Thread Block Cluster

As the number of SMs grew, the size disparity between an SM and the whole GPU increased. To offer a finer granularity of control between CTAs (map to SMs) and the grid (maps to the whole GPU), on Hopper, NVIDIA added a new thread hierarchy level, **thread block cluster**, which maps to a group of SMs physically located in the same graphics processing cluster (GPC). Thread block cluster is also called cooperative grid array (CGA) and referred to as cluster in the CUDA documentation ([See here for more information](https://stackoverflow.com/questions/78510678/whats-cga-in-cuda-programming-model)).

CTAs in a thread block cluster are guaranteed to be co-scheduled on SMs in the same GPC and distributed one CTA per SM by default. The shared memory partitions of those SMs form a **distributed shared memory (DSMEM)**. A thread can access the shared memory from another SM with low latency through the dedicated SM-to-SM network (without going through L2 cache). By exposing the GPC hardware execution unit to the programming model, programmers can reduce data movement and improve the data locality.

![](https://substackcdn.com/image/fetch/$s_!jdh7!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc36abb58-a0b0-4fc4-8b77-f2636f9a9c61_2028x1004.png)

Source: GTC Talk Inside the NVIDIA Hopper Architecture

#### Tensor Memory Accelerator

To improve data fetch efficiency, NVIDIA added the Tensor Memory Accelerator (TMA) to each Hopper SM. TMA is a dedicated hardware unit that accelerates asynchronous data transfers of large quantities between global and shared memory (bulk asynchronous copies).

A single thread in a CTA can initiate a TMA copy operation. TMA frees up threads to execute other independent work, handling address generation and offering additional benefits such as out-of-bounds handling. In PTX, the corresponding instruction is `cp.async.bulk`, detailed in [this CUDA documentation section](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#data-movement-and-conversion-instructions-bulk-copy).

However, for small requests, TMA loads have higher latency than regular async data copies because of the address generation overhead. Thus, NVIDIA recommends programmers to use TMAs for large data copies to amortize the overhead. For example, in LLM inference, TMA is not suitable for workloads that load KV cache in small chunks, but works well when each chunk is a multiple of 16 bytes. For more concrete examples of this, see [SGLang prefix caching](https://lmsys.org/blog/2024-01-17-sglang/), paper [FlashInfer](https://arxiv.org/abs/2501.01005) section 3.2.1, paper [Hardware-Efficient Attention for Fast Decoding](https://arxiv.org/abs/2505.21487v1) section 4.2, and [ThunderKittens MLA decode](https://github.com/HazyResearch/ThunderKittens/blob/mla/kernels/attn/demo/mla_decode/template_mla_decode.cu#L117).

TMA also supports a mode of loading data called multicast, where TMA loads data from global memory to shared memory of multiple SMs in a thread block cluster, specified by a multicast mask. Instead of issuing multiple global memory loads loading the same piece of data into multiple SMs, multicast completes it in one load. Specifically, multiple CTAs in a thread block cluster load a portion of the data into their corresponding SMEMs and share the data through DSMEM. This reduces L2 cache traffic and subsequently reduces HBM traffic. We recommend reading [Jay Shah’s TMA tutorial](https://research.colfax-intl.com/tutorial-hopper-tma/) for more details.

![](https://substackcdn.com/image/fetch/$s_!zRvA!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7080c7fe-1604-4142-b641-46c4382cc150_1955x1940.png)

Source: SemiAnalysis, GTC Talk Developing Optimal CUDA Kernels on Hopper Tensor Cores

#### 4th Generation Tensor Core - Warpgroup-level Asynchronous MMA

NVIDIA introduced a new type of MMA with Hopper, warpgroup-level MMA (`wgmma`). `wgmma` is warpgroup-wide, meaning that a warpgroup of 4 warps collectively performs an MMA operation. `wgmma` supports a wider range of shapes. For example, mixed-precision MMA supports `m64nNk16`, where N can be multiples of 8 from 8 to 256. `wgmma.mma_async` lowers to a new set of SASS: `GMMA`. In another example, half-precision `wgmma` instructions lowers to `HGMMA`. See [this CUDA documentation section](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#asynchronous-warpgroup-level-matrix-shape) for the details of MMA shapes and data types.

While all threads in a warpgroup collectively hold the output matrix in their registers, Hopper Tensor Cores can directly load operands from shared memory instead of registers, saving register space and bandwidth. Specifically, operand matrix A can reside in either registers or shared memory, while operand matrix B can only be accessed through shared memory. See the [CUDA documentation wgmma section](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#asynchronous-warpgroup-level-matrix-instructions) for the details of `wgmma` ’s completion mechanism, SMEM layout, and more.

![](https://substackcdn.com/image/fetch/$s_!JE8K!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f36d6b6-04bf-4a81-9112-f31989ea1a08_2425x1903.png)

Source: SemiAnalysis

For `wgmma` data types, Hopper introduced 8-bit floating-point data types (E4M3 and E5M2) with FP32 accumulation. In practice, [the accumulation path was implemented as a 22-bit fixed-point format (13-bit mantissa plus sign and exponent bits),](https://arxiv.org/abs/2412.19437) limiting the dynamic range compared to true 32-bit accumulation. Due to the reduced tensor core precision, every N\_c accumulations has to happen in the CUDA core to prevent constraining training accuracy. ([See this paper section 3.3.2](https://arxiv.org/abs/2412.19437)). This reduced precision accumulation improves efficiency, but comes at the cost of accuracy.

For more information on the Hopper Architecture, see the following:

- GTC talk: [Inside the NVIDIA Hopper Architecture](https://www.nvidia.com/en-us/on-demand/session/gtcspring22-s42663/)
- NVIDIA blog post overview: [NVIDIA Hopper Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/)
- Whitepaper: [NVIDIA H100 Tensor Core GPU Architecture](https://resources.nvidia.com/en-us-data-center-overview/gtc22-whitepaper-hopper)
- Microbenchmarking: [Benchmarking and Dissecting the Nvidia Hopper GPU Architecture](https://arxiv.org/abs/2402.13499)
- Microbenchmarking: [Dissecting the NVIDIA Hopper Architecture through Microbenchmarking and Multiple Level Analysis](https://arxiv.org/abs/2501.12084)

For examples of how to program Hopper GPUs, see:

- GTC talk: [Optimizing Applications for Hopper Architecture](https://www.nvidia.com/en-us/on-demand/session/gtcspring23-s51119/?playlistId=playList-43cec6e2-ef10-488a-aba2-6ef775db065a)
- CUTLASS talk: [Developing Optimal CUDA Kernels on Hopper Tensor Cores](https://www.nvidia.com/en-us/on-demand/session/gtcspring23-s51413/)
- Colfax blog post: [CUTLASS Tutorial: Fast Matrix-Multiplication with WGMMA on NVIDIA Hopper GPUs](https://research.colfax-intl.com/cutlass-tutorial-wgmma-hopper/)

### Blackwell

#### Tensor Memory

The extreme register pressure did not let up on Hopper, which motivated **Tensor Memory (TMEM)**, a new piece of memory specialized for Tensor Core operations. On every SM, TMEM has 128 rows (lanes) and 512 columns of 4-byte cells, totaling to 256 KB, which is also the size of the register file on an SM.

TMEM has a restricted memory access pattern. Specifically, it takes a warpgroup to access the whole TMEM, and each warp in a warpgroup can only access a specific set of lanes. By limiting the memory access pattern, hardware designers can reduce the number of access ports, saving chip space. On the other hand, this design also means that epilogue operations need a warpgroup to operate. Unlike shared memory, programmers have to explicitly manage TMEM, including allocation, deallocation, and copying data in and out of TMEM.

![](https://substackcdn.com/image/fetch/$s_!6r4X!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe3575c3-3361-4ba2-a568-a4724a6d8935_1080x1005.png)

Source: GTC Talk Programming Blackwell Tensor Cores with CUTLASS

#### CTA Pair

Two CTAs in a thread block cluster form a **CTA pair** if their CTA ranks in their thread block cluster differ by the last bit, e.g. 0 and 1, 4 and 5. A CTA pair maps to a Texture Processing Cluster (TPC), which consists of two SMs and combines with other TPCs to form a GPC. When Blackwell Tensor Core operations perform at a CTA pair granularity, the two CTAs are able to share input operands. This sharing reduces both SMEM capacity and bandwidth requirements.

#### Tensor Core 5th Generation MMA

Tensor Core 5th Generation MMA instruction (`tcgen05.mma` in PTX) fully moved away from using registers for holding matrices. Operands now reside in shared memory and Tensor Memory.

Specifically, suppose the MMA computes D = A \* B + D: Not using thread registers removes the complex data layouts and frees up thread register space for other work such as epilogue operations. Unlike `wgmma` using a warpgroup to initiate an MMA operation, `tcgen05.mma` has single thread semantics, meaning that a single thread initiates an MMA operation. This removes the role of warps from issuing MMA.

![](https://substackcdn.com/image/fetch/$s_!P6j4!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1f358583-9d8f-41f0-9d77-720c6907784d_1954x2178.png)

Source: SemiAnalysis

One notable MMA variant is MMA.2SM, which uses 2 SMs to collectively perform an MMA operation. MMA.2SM executes at the CTA-pair level granularity, and since `tcgen05.mma` has single thread semantics, a single thread in the leader CTA of the CTA pair launches MMA.2SM. Here we illustrate data path organization [layout A](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#tcgen05-data-path-layout-a). Layout A shows MMA.2SM doubles the M dimension compared to the 1SM version ([layout D](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#tcgen05-data-path-layout-d)), so the two SMs load different matrix A and D tiles. In addition, MMA.2SM splits matrix B, halving the amount of data loaded.

![](https://substackcdn.com/image/fetch/$s_!4RVO!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd86ade4d-5978-4cfc-9c97-a6dffc3f3431_2002x2560.png)

Source: SemiAnalysis, GTC talk Programming Blackwell Tensor Cores with CUTLASS

Matrix B is shared across the two SMs, meaning tiles B0 and B1 need to be communicated across the DSMEM. Although there is a bandwidth difference between DSMEM and SMEM, the effects on the coordination are minimal because we are loading smaller tiles. That said, we suspect that on Blackwell the communication bandwidth between SMs in a TPC is higher than DSMEM’s, so MMA.2SM leverages this to achieve better performance.

5th-gen Tensor Cores can also perform convolutions in addition to general matrix multiplication. `tcgen05.mma` supports weight stationary patterns with a collector buffer, which caches matrix B for reuse. For more information, please refer to the [CUDA documentation](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#tcgen05-mma) and the corresponding [weight stationary MMA instruction](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#tcgen05-mma-instructions-mma-ws).

In terms of supported data types, Blackwell supports microscaling floating-point format (MXFP), including MXFP8, MXFP6, and MXFP4. See [this paper](https://arxiv.org/abs/2310.10537) for details. Blackwell also supports NVIDIA’s own NVFP4 format, which is known for being more accurate than MXFP4. This is likely because of its smaller block size, different scaling factor data format, and the two-level quantization method (See [this GitHub issue](https://github.com/NVIDIA/TensorRT-LLM/issues/3037)). See [this paper](https://arxiv.org/abs/2505.19115) for data format comparisons.

With Blackwell, since FP8 and FP6 have the same theoretical throughput, we believe that they share physical circuits in Tensor Cores. In contrast, CDNA4 has 2x the FP6 throughput compared to FP8 because their FP6 units share data paths with FP4 instead. We believe that UDNA will switch to having FP6 units share with FP8 instead.

### Side Note: Structured Sparsity

Ampere featured 2:4 structured sparsity, which in theory doubled the Tensor Core throughput. It achieves this by pruning the weight matrix such that for every 4 elements, 2 of them are zero. In this format, the matrix is compressed by removing zero elements, and an additional metadata index matrix records their positions, roughly halving the memory usage and bandwidth.

According to [this microbenchmarking paper from cracked chinese engineers](https://arxiv.org/abs/2501.12084), Ampere’s structured sparsity can realize 2x speedup for large shape MMA operations at the instruction level. It also shows that in Hopper, structured sparsity `wgmma` instructions can reach 2x speedup and save up to 2x on memory bandwidth used to load weights.

Unfortunately, 2:4 structured sparsity GEMMs kernels are unable to reach anywhere close to 2x speedup compared to their dense counterparts on hopper. This is due to difficulties in doing structured pruning while maintaining model accuracy, cuSPARSELt kernels being unoptimized, and TDP limitations. Except for Chinese AI labs and a limited number of experimental western [research](https://arxiv.org/abs/2503.16672) [papers](https://developers.redhat.com/articles/2024/12/18/24-sparse-llama-fp8-sota-performance-nvidia-hopper-gpus), most AI labs ignore 2:4 structured sparsity for production inferencing and focus on quantization & distillation. Meta is experimenting with it in Llama, but that is a dead end path in many cases as well.

Furthermore, there is a lack of closed or open models that have shown performance improvements with 2:4 FP8 structured sparsity or 4:8 FP4 structured sparsity while maintaining zero accuracy loss & a [general lack of resources dedicated](https://github.com/NVIDIA/TensorRT-Model-Optimizer/blame/main/modelopt/torch/sparsity/sparsegpt.py) to structured pruning. We recommend that NVIDIA should stop with [Jensen math](https://semianalysis.com/2025/03/19/nvidia-gtc-2025-built-for-reasoning-vera-rubin-kyber-cpo-dynamo-inference-jensen-math-feynman/#jensen-math-changes-every-year) structured sparsity flops in keynotes & marketing material unless they start consistently showing SOTA open models being able to take advantage of structured pruning for inferencing. A good first step would be to do structured sparsity on DeepSeek and also show that performance can stack on top of other techniques like distillation & quantization like NVFP4.

![](https://substackcdn.com/image/fetch/$s_!PoF1!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf23f81d-3638-4bc4-835b-6b45e888fa80_660x511.png)

Source: NVIDIA

In its fifth‑generation Tensor Cores, NVIDIA introduced pair‑wise 4: 8 structured sparsity for the NVFP4 data type. In this scheme, every eight elements are grouped into four consecutive pairs, and exactly two of those pairs must contain non‑zero values while the remaining two are pruned to zero. Because NVFP4 is a sub‑byte data type, we believe this constraint motivated NVIDIA to adopt the pair‑wise 4: 8 pattern. Although 4: 8 sparsity may appear more permissive than the earlier 2: 4 pattern, the added pair‑wise requirement means it is not, in practice, a more relaxed constraint for ML engineers seeking to preserve model accuracy while pruning.

![](https://substackcdn.com/image/fetch/$s_!nAyG!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F18969216-d3c3-440d-b503-b216c24bd9c7_809x355.png)

Source: NVIDIA

### Tensor Core Size Increases

![](https://substackcdn.com/image/fetch/$s_!Pkdq!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd9aa9938-e0cf-4bff-92e4-2ac1f73a0f34_1566x632.png)

Source: SemiAnalysis, NVIDIA

Over generations, NVIDIA scaled the Tensor Core size more aggressively than the number of Tensor Cores. NVIDIA chose scaling the tensor core size rather than number of cores because it suits the performance characteristics of matrix multiplication better. Specifically, when scaling the problem size, matrix multiplication computation grows cubically, but data movement grows quadratically, meaning the arithmetic intensity grows linearly. O(n) arithmetic intensity, combined with the fact that data movement is more expensive than computation, incentivized the tensor core size increase.

![](https://substackcdn.com/image/fetch/$s_!UTia!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc02c8a89-11eb-4d89-8e55-d84fd8139d11_882x350.png)

Source: SemiAnalysis, NVIDIA

However, both scaling core size and number of cores come at the cost of the quantization effects. Specifically, having a large number of cores suffer from the [tile quantization effect](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html#tile-quant), and having a large core size leads to [wave quantization effect](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html#wave-quant). The wave quantization effect occurs when the number of work units isn’t fully divisible by the number of workers, causing utilization to drop when processing the final, smaller batch of work. Increasing tensor core size is essentially increasing the work unit size, resulting in low utilization for small matrices (See this [ThunderKittens blog post](https://hazyresearch.stanford.edu/blog/2025-03-15-tk-blackwell)).

![](https://substackcdn.com/image/fetch/$s_!yLlV!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F843361b2-221e-4114-a346-56a0d163e482_2560x988.png)

Source: SemiAnalysis

The linear growth in arithmetic intensity also motivates the increase in MMA shape. Having larger MMA shapes enhances the operand sharing granularity. Specifically, launching fewer larger tiles would increase the data reuse, saving memory footprint and bandwidth of RF and SMEM. For architectures before Blackwell, this led to increasing the number of threads to collectively perform an MMA operation, from a quadpair of 8 threads (Volta), to a warp of 32 threads (Ampere), and then a warpgroup of 128 threads (Hopper).

### Memory Size Increase

![](https://substackcdn.com/image/fetch/$s_!FYAT!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F069490a4-6b85-41c1-b5da-4a4c4f1729c4_1464x432.png)

Source: SemiAnalysis, NVIDIA

Shared memory increased almost every generation, while register file size stayed constant. The reason for this is that Tensor Core throughput increase requires a deeper staging buffer.

Because Tensor Cores consume data much faster than global memory can load, we use a staging memory to buffer data, so memory loading can run ahead of MMA operations. **Tensor Core throughput doubled every generation, but global memory load latency didn’t decrease and in fact increased. As a result, we need to increase the staging memory size for buffering more data.** To implement this, NVIDIA chose shared memory as the staging memory for Tensor Cores, which explains why shared memory increased but register file size remained constant.

However, Blackwell’s shared memory size didn’t increase from Hopper. This is because tcgen05 MMA can leverage 2 SMs, so each SM’s shared memory only needs to load half of the operands. Thus, Blackwell’s shared memory size effectively doubled.

NVIDIA’s staging memory choice also explains why operand locations gradually moved away from registers to shared memory. That said, NVIDIA added TMEM on Blackwell to support the increased Tensor Core throughput. Since TMEM is placed closer to Tensor Cores, it can be more power efficient. In addition, having a separate memory increases the aggregate memory bandwidth for saturating the Tensor Cores.

Among all operands, matrix D always stays in TMEM. We can take advantage of TMEM’s power efficiency with this design because matrix D is more frequently accessed than matrix A and B. For example, to compute a tile in a naive tiled matrix multiplication, matrix D tile is accessed 2Kt times (Kt reads and Kt writes. Kt: The number of tiles along the K dimension), whereas matrix A tiles and matrix B tiles are accessed only once.

![](https://substackcdn.com/image/fetch/$s_!g8IN!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F55a6a58d-8317-4267-a501-1d39961b4ce8_1476x474.png)

Source: SemiAnalysis, NVIDIA

### Asynchrony of MMA Instruction

![](https://substackcdn.com/image/fetch/$s_!FIIN!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb266ea7a-4b6c-4dce-89d8-c429887d75c6_882x270.png)

Source: SemiAnalysis, NVIDIA

The “H” in `UTCHMMA,HGMMA,HMMA` stands for half precision since it is a 16 bit format while “Q” in `QGMMA,UTCQMMA` stands for quarter precision (8 bit) since 8 bits is a quarter of a full precision (32 bits). “O” stands for “Octal” which means one eighth of 32 bits as `UTCOMMA` is FP4.

MMA instructions seemingly jumped from synchronous to asynchronous. In reality, MMA instructions gradually became asynchronous at the SASS level because of the need to overlap `LDSM` instructions.

At SASS level, an MMA operation involves executing one `LDSM` instruction to load matrix tiles from shared memory to the register file, and then two `HMMA` instructions to perform MMA. During execution, the two `HMMA` instructions are issued asynchronously, and block the register usage with hardware interlocks. Since hardware interlocks disallows overlapping LDSM instructions, sequential execution of one `LDSM` and two `HMMA` instructions creates a small bubble in the instruction issue pipeline. However, Tensor Cores have become so fast that this bubble causes non-negligible amount of performance loss, which calls for an asynchronous completion mechanism for MMA.

Hopper supports asynchronous completion mechanism commit and fence for `wgmma`. When `HGMMA` instructions are issued, there are no hardware interlocks to guard register usage. Instead, the compiler schedules `LDSM` for the next MMA and uses `FENCE` instruction to keep the next `HGMMA` waiting. With Blackwell, the MMA operation is fully asynchronous. Instructions for loading into Tensor Memory ([tcgen05.ld /](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#tcgen05-memory-consistency-model-async-operations) [tcgen05.st](http://tcgen05.st/) [/ tcgen05.cp](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html?highlight=tcgen05%2520cp#tcgen05-memory-consistency-model-async-operations)) are all explicitly asynchronous.

![](https://substackcdn.com/image/fetch/$s_!Axw_!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faf48362e-e494-4efe-8d03-17e28243e2fa_1868x1235.png)

Source: SemiAnalysis

### Data Type Precision Reduction

![](https://substackcdn.com/image/fetch/$s_!gk1Z!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F451a1b28-b226-4e4d-b778-8e674314e4da_1956x960.png)

Source: SemiAnalysis, NVIDIA

Throughout each successive generation of NVIDIA Tensor Cores, NVIDIA continues to add lower precision data types, starting from 16-bit to 4-bits. This is because deep learning workloads are extremely tolerant of low precision. This is especially true for inference, where even lower precision can be used than during training. Low precision is more power efficient, takes up less silicon floor space and achieves higher compute throughput. In newer generations, we also see NVIDIA removing FP64 support to prioritize low precision data types under silicon area and power budgets.

Interestingly, the prioritization also affected integer data type support. Since Hopper, INT4 data types are deprecated, and on Blackwell Ultra, we see lower INT8 compute throughput. This is caused by the delayed popularity of low-precision integer data types. Although Turing supported INT8 and INT4, it wasn’t until 4 years later that new inference quantization methods were able to exploit the compactness of INT4 for serving LLMs. By that time, NVIDIA had already deprecated INT4 on Hopper `wgmma`.

Next, we will talk about how the programming model evolved, including the transition from high-occupancy to single-occupancy, the increase in explicit asynchronous execution, and how those designs relate to NVIDIA betting on strong scaling.