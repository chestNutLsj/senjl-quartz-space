---
tags: [LLM, Inference, SGLang, Cluster, Tuning]
date: 2026-03-06
---

# 背景与目标

这篇笔记用于记录我在**真实集群**上调优 SGLang 的全过程，重点不是单次 benchmark 分数，而是梳理：

- 当前瓶颈到底在哪里
- 每一轮调优改了什么
- 指标为什么变好或变坏
- 最终哪些经验可以沉淀为稳定方法论

> [!info] 记录原则
> - 先固定 workload，再做调优
> - 每次只改少量变量，避免结论相互污染
> - 同时记录吞吐、时延、显存、GPU 利用率、网络与稳定性

# 实验目标

- 目标模型：
- 服务框架版本：SGLang ``
- 目标优化方向：
	- [ ] 吞吐优先
	- [ ] 首 token 延迟（TTFT）优先
	- [ ] 单请求尾延迟（P99）优先
	- [ ] 显存占用优化
	- [ ] 稳定性 / 长时间运行
- 目标指标：
	- Throughput:
	- TTFT:
	- TPOT / Decode latency:
	- P95 / P99 latency:
	- GPU memory:
	- GPU utilization:

# 集群与运行环境

## 硬件环境

- 节点数：
- 每节点 GPU 数：
- GPU 型号：
- GPU 显存：
- CPU / 内存：
- 网络类型：
- 网络带宽：
- 存储类型：

## 软件环境

- CUDA 版本：
- Driver 版本：
- PyTorch 版本：
- SGLang 版本 / commit：
- 依赖框架（如 FlashInfer / Triton / NCCL）：
- 容器镜像 / 环境管理方式：

## 部署方式

- 单机 / 多机：
- TP / DP / EP / PD 配置：
- 启动命令：

```bash
# 在这里贴最终实际使用的启动命令
python3 -m sglang.launch_server \
    --model-path=/mnt/ceph/checkpoints/GLM-5/ \          # 确保路径正确
    --tp=8 \
    --trust-remote-code \
    --host=0.0.0.0 --port=8080 \
    --enable-metrics \                           # 测试时可保留，便于观察
    --log-requests \
    --enable-request-time-stats-logging \
    --max-prefill-tokens=202752 \
    --context-length=202752 \
    --mem-fraction-static=0.9 \
    --max-running-requests=8 \                   # 测试环境降低并发
    --preferred-sampling-params='{"skip_special_tokens":false,"spaces_between_special_tokens":false}' \
    --model-loader-extra-config='{"enable_multithread_load":true,"num_threads":32}' \
    --attention-backend nsa \
    --nsa-prefill-backend flashmla_sparse \
    --nsa-decode-backend flashmla_sparse \
    --chunked-prefill-size 32768 \
    --page-size 64 \
    --reasoning-parser glm5 \
    --tool-call-parser glm5stream \
    --disaggregation-transfer-backend=mooncake \   # 确认 MoonCake 可用，否则可改为 tcp
    --disaggregation-ib-device=mlx5_0              # 根据实际 RDMA 设备名调整（可先用 ibstatus 查看）
    --disaggregation-mode=prefill \
    --enable-hierarchical-cache \
    --hicache-size=1280 \
    --glm-nsa-shared-hicache \
    --speculative-algorithm=EAGLE \
    --speculative-num-steps=5 \
    --speculative-eagle-topk=1 \
    --glm-stream-speculated-tokens \
    --speculative-draft-model-path=/path/to/draft/model \  # 草稿模型路径
    --glm-decoding-constraint-module=sglang.srt.constrained.glm \
    --glm-ignore-decoding-constraint-exception \
    --watchdog-timeout=600 \
    --soft-watchdog-timeout=120 \
    --enable-nsa-prefill-context-parallel
```

kubectl get pods -n lisenj-1p1d-same-rack-prefill

kubectl logs -n lisenj-1p1d-same-rack-prefill -f sglang-prefill-76444cc9f4-bqkbs

# Workload 定义

## 请求特征

- 并发数：
- 输入长度分布：
- 输出长度分布：
- 是否包含长上下文：
- 是否包含多轮对话：
- 是否开启 structured output / tool use：

## 压测方式

- 压测工具：
- 压测命令：
- 持续时间：
- 采样窗口：
- 统计口径：

```bash
# 在这里贴 benchmark / replay 命令
```

> [!question] 这个 workload 是否能代表真实线上流量？
> 如果不能，需要说明它和真实请求分布之间的差距。

# Baseline

## 初始配置

- 关键参数：
- 初始观察：

## Baseline 指标

| 指标 | 数值 | 备注 |
| --- | --- | --- |
| Throughput |  |  |
| TTFT |  |  |
| TPOT / ITL |  |  |
| P95 latency |  |  |
| P99 latency |  |  |
| GPU util |  |  |
| GPU memory |  |  |
| 网络带宽利用率 |  |  |

# 调优过程记录

## Round 0：问题定位

### 现象

- 

### 怀疑瓶颈

- [ ] Prefill 算力不足
- [ ] Decode 阶段调度不佳
- [ ] Continuous batching 没有吃满
- [ ] KV cache / prefix cache 配置不合理
- [ ] 显存碎片或显存水位过高
- [ ] TP / DP 通信开销
- [ ] 跨机网络瓶颈
- [ ] CPU 侧调度 / tokenization / sampling 开销
- [ ] 请求分布导致 batch 退化
- [ ] 其他：

### 证据

- 监控截图 / profiler / logs：
- 初步判断：

## Round 1

### 改动

- 参数 / 策略改动：
- 改动原因：

### 结果

| 指标 | 调优前 | 调优后 | 变化 |
| --- | --- | --- | --- |
| Throughput |  |  |  |
| TTFT |  |  |  |
| TPOT / ITL |  |  |  |
| P95 latency |  |  |  |
| P99 latency |  |  |  |
| GPU util |  |  |  |
| GPU memory |  |  |  |

### 分析

- 有效 / 无效：
- 为什么：
- 副作用：

## Round 2

### 改动

- 

### 结果

| 指标 | 调优前 | 调优后 | 变化 |
| --- | --- | --- | --- |
| Throughput |  |  |  |
| TTFT |  |  |  |
| TPOT / ITL |  |  |  |
| P95 latency |  |  |  |
| P99 latency |  |  |  |
| GPU util |  |  |  |
| GPU memory |  |  |  |

### 分析

- 

## Round N

### 改动

- 

### 结果

| 指标 | 调优前 | 调优后 | 变化 |
| --- | --- | --- | --- |
| Throughput |  |  |  |
| TTFT |  |  |  |
| TPOT / ITL |  |  |  |
| P95 latency |  |  |  |
| P99 latency |  |  |  |
| GPU util |  |  |  |
| GPU memory |  |  |  |

### 分析

- 

# 关键参数备忘

## SGLang / Serving 参数

- `--mem-fraction-static`:
- `--max-running-requests`:
- `--max-total-tokens`:
- `--context-length`:
- `--schedule-policy`:
- `--chunked-prefill-size`:
- `--enable-prefix-caching`:
- 其他关键参数：

## 系统层参数

- NCCL / 网络相关：
- CUDA Graph / 编译相关：
- CPU 绑定 / NUMA：
- 容器资源限制：

# 监控与诊断

## 我重点看的指标

- GPU 利用率是否长期打满
- SM 利用率和显存带宽谁先到瓶颈
- Decode 阶段是否出现小 batch 抖动
- 不同节点之间负载是否均衡
- 网络链路是否在高峰期成为瓶颈
- 长尾请求是否拖垮 batch 效率

## 排障 checklist

- [ ] 模型权重加载是否存在冷热不一致
- [ ] 请求分布是否导致基准不稳定
- [ ] prefix cache 命中率是否足够高
- [ ] prefill / decode 时间占比是否符合预期
- [ ] 多机通信是否遮蔽了算子优化收益
- [ ] 优化是否只是转移了瓶颈

# 当前结论

## 已确认有效的优化

- 

## 已确认无效的优化

- 

## 仍待验证的问题

- 

# 后续计划

- [ ] 补齐一组稳定可复现的 baseline
- [ ] 为不同 workload 建立分层 profile
- [ ] 沉淀一份“真实集群调优 SGLang”方法论

# 关联笔记

- [[Agent时代推理集群负载稳态化观点]]
- [[How-to-build-a-inference-engine]]
- [[nano-vLLM-0]]
- [[nano-vLLM-1]]

## Related Reading
- [[Continuous Batching in LLM Inference：Annotation]]
