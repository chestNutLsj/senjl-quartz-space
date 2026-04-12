---
tags:
  - LLM
  - Architecture
  - Survey
date: 2026-03-29
---

# LLM Architecture Gallery：Conclusion

> [!info] 来源
> - 原始页面：[LLM Architecture Gallery](https://sebastianraschka.com/llm-architecture-gallery/)
> - 页面标注最近更新时间：2026-03-27
> - 原始剪藏：[[LLM Architecture Gallery]]

> [!abstract] 一句话结论
> 这页最值得学的，不是“又出现了哪些新模型”，而是一个更清晰的架构演化主线：**LLM 正在从 dense + full attention，逐步走向 sparse MoE + 更便宜的注意力/KV 机制；参数规模仍在增长，但真正决定推理成本的越来越是 active parameters、KV cache 和长上下文策略。**

## 看这个 gallery 时，我会先盯住哪几个字段

| 字段 | 为什么重要 | 我会怎么理解 |
| --- | --- | --- |
| `Decoder type` | 决定模型是 dense、MoE 还是 hybrid/recurrent | 先判断“每个 token 到底激活多少参数” |
| `Attention` | 决定 KV cache、长上下文成本和 kernel 复杂度 | `MHA -> GQA/MQA -> MLA -> Linear/State-space` 基本对应越来越强的效率导向 |
| `Layer mix` | 告诉你到底是“所有层都一样”还是混搭 | 例如 `sliding-window + global`、`MLA + DeltaNet`、`GQA + Mamba-2` |
| `Scale` | 要同时看 total params 和 active params | 现在只看总参数已经不够了，MoE 的 active path 更关键 |
| `Context` | 告诉你窗口上限，但不直接等于“便宜地支持长上下文” | 需要和 attention 类型、KV cache 一起看 |
| `KV cache / token` | 这是这页最有价值的横向指标之一 | 它是 batch size=1 的逻辑估算值，不是框架实测值，但很适合比较架构趋势 |

## 我理解到的五个架构家族

| 家族 | 代表模型 | 典型做法 | 主要优点 | 主要代价 |
| --- | --- | --- | --- | --- |
| Dense baseline | GPT-2 XL, Llama 3, Phi-4 | dense decoder + 全局 attention，常见为 MHA/GQA + RoPE/RMSNorm | 结构直观，训练和部署最成熟 | 参数和 KV cache 都比较“老实”，扩展到长上下文时成本高 |
| Dense efficiency | OLMo 2, Gemma 3, OLMo 3, SmolLM3 | 在 dense 范式内加入 QK-Norm、sliding-window/global、NoPE 等技巧 | 不引入 MoE 路由复杂度，也能换来稳定性和部分长上下文收益 | 依旧是 dense，active params 不会像 MoE 那样降下来 |
| Sparse MoE + GQA | Qwen3, GPT-OSS, GLM-4.7, Qwen3 Coder Flash | token 只激活少量 expert，attention 仍以 GQA 为主 | 总参数能做大，但单 token 有效计算量相对可控 | 路由、并行、通信更复杂；如果不用 MLA，KV cache 仍然不低 |
| Sparse MoE + MLA | DeepSeek V3/V3.2, Mistral Large 3, GLM-5, Kimi K2.5, Mistral Small 4 | MoE 负责压 active params，MLA 负责压 KV cache，部分模型再叠加 sparse attention | 这是 2025-2026 开源旗舰里最主流的一条高性价比路线 | 对推理 kernel、serving stack、实现细节要求更高 |
| Hybrid / recurrent / linear | Kimi Linear, Nemotron 3 Nano/Super, xLSTM, Ling 2.5 | 用 Mamba-2、DeltaNet、Lightning、xLSTM 等替掉大部分 attention | 面向百万级上下文和极低 cache，长序列吞吐很有吸引力 | 训练 recipe 和生态还没有 Transformer 主线那么统一和成熟 |

## 这页背后的演化主线

### 1. 第一条主线：dense 还在，但纯 dense 已经不再是旗舰默认答案

Llama 3、Phi-4 这类模型仍然说明 dense + GQA 是一条非常稳的工业基线：实现成熟，行为可预期，适合做中等规模通用模型。

但如果继续往更大参数、更长上下文、更低推理成本推进，dense 的问题会越来越明显：  
- 每个 token 都要走完整个 MLP 路径，active params 没法降。  
- 即使用了 GQA，KV cache 还是会跟层数、头数、context 一起涨。  

所以 dense 现在更多像一个“可靠基线”，而不是“极限扩展的终点”。

### 2. 第二条主线：MoE 解决的是“参数继续长”，不是“所有成本都自动变便宜”

MoE 最大的价值，是把“总参数规模”与“单 token 激活参数”拆开。  
像 DeepSeek V3、Qwen3、GPT-OSS、GLM-5 这类模型，总参数都很大，但 active path 只占一小部分。

这意味着今天的大模型设计，已经不再是简单地问“模型一共有多少参数”，而是要问：

1. 每个 token 实际走了多少参数？
2. expert 路由是否稀疏、稳定、好并行？
3. attention/KV 这条线是否也一起优化了？

如果只上 MoE，但 attention 仍然很“重”，那你只是把一部分计算成本降下来了，长上下文和 KV cache 仍然可能很贵。

### 3. 第三条主线：GQA/MQA/MLA/Linear attention，本质上都在回答“KV cache 太贵怎么办”

我觉得这页最有启发的，不是具体某个模型，而是它把 `KV cache / token` 放成了一个一眼可比的字段。  
这会逼着我们换一种方式看模型架构：**推理时代，注意力结构本身就是成本模型的一部分。**

- `MHA`：最直观，但 KV 成本高。
- `MQA / GQA`：共享 KV heads，先把 cache 压一轮。
- `MLA`：进一步把 KV 表示压缩到 latent 空间，是最近旗舰 MoE 模型最关键的组合件之一。
- `Sliding-window / sparse attention`：不是所有层、所有 token 都做全局交互。
- `Mamba / DeltaNet / Lightning / xLSTM`：更进一步，直接减少甚至绕开传统 KV cache 形态。

所以从工程角度看，attention 设计已经从“建模选择”变成“系统选择”。

### 4. 第四条主线：长上下文不再只是“把 context number 写大”

这页里很多模型都写着 128K、256K、1M context，但真正有意思的是它们靠什么撑住这些窗口：

- Gemma 3、MiMo-V2-Flash 这类，靠 `sliding-window + 少量 global layer`。
- DeepSeek V3.2、GLM-5 这类，靠 `MLA + sparse attention`。
- Kimi Linear、Nemotron 3 Nano/Super、xLSTM 这类，则更激进，直接走 hybrid 或 recurrent 路线。

也就是说，“长上下文”已经从一个单纯的配置项，变成一整套结构设计问题。

## 三组特别值得记住的对比

### 1. Llama 3 (8B) vs OLMo 2 (7B)

- 两者规模接近，都是 dense。
- Llama 3 用 `GQA with RoPE`，KV cache / token 是 `128 KiB`。
- OLMo 2 用 `MHA with QK-Norm`，KV cache / token 是 `512 KiB`。

这个对比说明：**只看参数量，很容易低估 attention 方案对推理内存的影响。**  
哪怕模型大小相近，`MHA -> GQA` 也可能带来非常明显的 cache 差异。

### 2. GLM-4.7 vs GLM-5

- 两者都属于大规模 sparse MoE。
- GLM-4.7 还是 `GQA with QK-Norm`，KV cache / token 为 `368 KiB`。
- GLM-5 进一步改成 `MLA with DeepSeek Sparse Attention`，KV cache / token 降到 `87.8 KiB`。

这说明当前旗舰模型的竞争重点，已经从“做不做 MoE”进一步转向“MoE 之外，attention/KV 还能怎么压”。  
我会把它看成从“MoE 时代”进入“MoE + KV-efficient attention 时代”的一个典型例子。

### 3. DeepSeek V3 vs DeepSeek V3.2

- 两者都延续 `671B total, 37B active` 的主框架，都是 `Sparse MoE + MLA`。
- V3.2 的变化重点，不是重做 backbone，而是加入 `DeepSeek Sparse Attention` 来降低长上下文成本。

这很说明问题：**当 backbone 已经足够强时，下一轮优化往往不是“再发明一种完全不同的块”，而是继续优化长上下文和推理效率。**

## 如果我要把这些模型记成一张脑图

> [!tip] 一个够用的认知框架
> - `Dense vs MoE`：决定 active params 怎么控制。
> - `MHA/GQA/MLA/Linear`：决定 KV cache 怎么控制。
> - `Full / Sliding / Sparse / Recurrent`：决定长上下文怎么算得起。
> - `Norm / RoPE / NoPE / QK-Norm`：决定训练稳定性和长序列细节怎么处理。

## 我自己的结论

1. 2025-2026 的主流趋势，不是单点创新，而是多种效率技巧的组合：`MoE + GQA/MLA + sparse/local attention + normalization tweaks`。
2. 如果只想抓“大方向”，当前最值得记住的旗舰配方是：**Sparse MoE + MLA**。
3. 如果目标是超长上下文或设备侧部署，那么 hybrid/recurrent 家族值得单独跟踪，因为它们解决的不是“模型更大”，而是“序列更长时还能不能便宜地推理”。
4. 以后再看新模型，不要先问“多少 B”，而应该先问：**active params 是多少？attention 是什么？KV cache 多大？**
