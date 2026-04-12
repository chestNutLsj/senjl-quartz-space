---
title: "Achieve 23x LLM Inference Throughput & Reduce p50 Latency"
author:
  - "[[Cade Daniel]]"
  - "[[Chen Shen]]"
  - "[[Eric Liang]]"
  - "[[Richard Liaw]]"
source: "https://www.anyscale.com/blog/continuous-batching-llm-inference"
published: 2023-06-22
date: 2026-04-01
lang: en
clip-status: reviewed
clip-domain: LLM
clip-grade: a-important
tags:
  - Clipping
  - LLM
  - Inference
  - Serving
  - ContinuousBatching
  - DynamicBatching
  - IterationLevelScheduling
  - vLLM
  - RayServe
  - PagedAttention
  - Anyscale
  - lang-en
  - status-reviewed
  - grade-a-important
---
> [!info]
> 本文截取自互联网博客原文并按本仓库 clipping 规则整理：<https://www.anyscale.com/blog/continuous-batching-llm-inference>
>
> 关联整理笔记：[[Continuous Batching in LLM Inference：Annotation]]

# How continuous batching enables 23x throughput in LLM inference while reducing p50 latency

![cover](assets/00_cover.png)

By [[Cade Daniel]], [[Chen Shen]], [[Eric Liang]] and [[Richard Liaw]] | June 22, 2023

In this blog, we cover the basics of LLM inference, explain why traditional static batching wastes GPU opportunities, and show why **continuous batching** can improve both throughput and latency under load. The key benchmark claim is straightforward: with continuous batching and memory-efficient runtime support such as **vLLM + PagedAttention**, users can achieve up to **23x throughput** improvement over naive static batching while also reducing p50 latency.

## The Basics of LLM Inference

For each request, an LLM starts from a prompt and then generates output tokens one by one. Each new token requires another forward pass. This iterative nature is what makes serving different from ordinary feed-forward inference workloads.

![llm-basics](assets/01_diagram-llm-basics_aspect_ratio.png)

Three system facts matter here:

1. **Prefill and decode are different phases**. The initial prompt ingestion (prefill) has a different compute pattern from the later token-by-token decode loop.
2. **LLM inference is often memory-IO bound, not compute bound**. Loading model parameters and KV cache traffic dominates more than raw flops.
3. **GPU memory usage scales with both model size and sequence length**. Even if the model fits, the available room for batching can be sharply constrained by KV cache growth.

The practical implication is that throughput depends heavily on how many active sequences can be packed into GPU memory without wasting space.

## LLM Batching Explained

Batching lets the system load model parameters once and use them for multiple sequences, improving memory bandwidth efficiency and GPU utilization.

### Naive Batching / Static Batching

With **static batching**, the batch is fixed until the whole batch finishes generation.

![static-batching](assets/cb_02_diagram-static-batching.png)

If one sequence finishes early, its slot still sits idle until the longest sequence in the batch completes. This is acceptable only when request lengths are nearly uniform. For realistic chatbot or assistant workloads with highly variable prompt and generation lengths, static batching leaves visible white space on the GPU timeline and turns into direct cost waste.

### Continuous Batching

The core idea is simple: instead of waiting for the whole batch to finish, the server makes scheduling decisions **every iteration**.

![continuous-batching](assets/cb_03_diagram-continuous-batching.png)

Once one sequence completes, a new request can be inserted into the freed slot immediately. In the serving literature this is also called **dynamic batching** or **iteration-level scheduling**. The blog cites [[Orca: A Distributed Serving System for Transformer-Based Generative Models]] as the early system that made this idea explicit.

The real-world system is slightly more complicated than the toy diagram because prefill and decode have different resource profiles. Frameworks therefore need a policy to decide when to admit waiting prefill requests into an ongoing decode-heavy batch.

## PagedAttention and vLLM

Continuous batching is useful on its own, but the Anyscale team’s stronger claim is that it also unlocks better **memory management**.

PagedAttention, introduced by [[vLLM]], treats the KV cache more like paged virtual memory than a single pre-allocated contiguous buffer. Instead of reserving `max_context_length` for every request ahead of time, the runtime allocates block-sized chunks on demand.

This matters because most live requests never consume the entire theoretical context window. With dynamic block allocation, memory waste stays low and the runtime can hold a larger effective batch.

![frameworks](assets/06_frameworks_aspect_ratio.png)

The blog’s interpretation is:

- Continuous batching fixes **scheduling waste**.
- PagedAttention fixes **memory waste**.
- Combining the two yields materially higher batch sizes and therefore materially higher serving throughput.

## Benchmark Setup

The benchmarks use a single NVIDIA A100 40GB GPU and Meta OPT-13B. Tensor parallelism is intentionally excluded to keep the comparison simple. The tested systems are:

- Static batching:
  - Hugging Face Pipelines
  - NVIDIA FasterTransformer
- Continuous batching:
  - Hugging Face text-generation-inference
  - A Ray Serve re-implementation of continuous batching
  - vLLM

The throughput benchmark processes 1000 requests with 512 input tokens each and generation lengths sampled from exponential distributions with increasing variance. The latency benchmark uses 100 requests with variable prompt lengths, variable output lengths, and Poisson arrivals at QPS=1 and QPS=4.

## Benchmark Results: Throughput

![throughput-table](assets/cb_07_throughput_table.png)

As sequence-length variance rises, naive static batching collapses badly. FasterTransformer improves the static baseline a lot, but still remains materially behind the continuous batching systems once variability becomes large.

The Ray Serve reimplementation and Hugging Face TGI are roughly equal, which supports the claim that the scheduling algorithm itself is the main reason for their similarity. The standout result is **vLLM**, which more than doubles naive continuous batching in every dataset and reaches the headline-level improvement multiple versus naive static batching.

![throughput-graph](assets/cb_08_throughput_graph.png)

The blog’s own reading is that vLLM’s dynamic memory reservation is probably what most strongly explains the gap.

## Benchmark Results: Latency

![latency-table](assets/cb_09_latency_table.png)

The interesting result is not just higher throughput. Under realistic online arrivals, continuous batching also improves median latency, because newly arrived requests can join an already running batch without waiting for the current batch to drain fully.

![latency-qps1](assets/cb_10_latency_cdf_qps_1.png)

At QPS=1, all continuous batchers show clearly better latency curves than naive static batching.

![latency-qps4](assets/cb_11_latency_cdf_qps_4.png)

At QPS=4, systems begin to saturate, so the room for immediate request injection shrinks. That is exactly where vLLM’s memory efficiency shows up again: it retains a noticeably stronger latency curve because its higher effective batch capacity delays saturation.

## Conclusion

The article’s main message is not merely that “bigger batches are better.” The more precise statement is:

- **Static batching wastes scheduling opportunities** when requests have heterogeneous lengths.
- **Continuous batching reclaims those opportunities** through per-iteration admission.
- **Memory-aware runtimes such as vLLM amplify the benefit** by allowing larger practical batch sizes with low fragmentation.

This is why continuous batching can improve both cost efficiency and latency at the same time, at least until the system is driven close to saturation.

## Related Notes

- [[Continuous Batching in LLM Inference：Annotation]]
- [[Throughput is Not All You Need Maximizing Goodput in LLM Serving using Prefill-Decode Disaggregation]]
- [[真实集群上调优SGLang过程记录]]
