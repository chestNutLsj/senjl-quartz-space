---
tags:
  - DeepSeek
  - MLA
  - Attention
date: 2025-02-18
publish: "true"
zhihu-title: 【技术解析】如何理解 MLA 的设计思路？MLA 带来哪些优势？
zhihu-topics: Multi-head Latent Attention
zhihu-link: https://zhuanlan.zhihu.com/p/2010833448533771487
zhihu-created-at: 2026-02-27 21:47
zhihu-updated-at: 2026-03-01 18:33
---
> [!NOTE] 一句话介绍
> **Multi-Head Latent Attention (MLA)** 是 DeepSeek-V3 模型中用于高效推理的核心注意力机制。MLA 通过 **低秩键值联合压缩**（Low-rank Key-Value Joint Compression） 技术，减少了推理时的 KV cache，从而在保持性能的同时显著降低了内存占用。

在标准的 Transformer 模型 中，多头注意力（Multi-Head Attention, MHA）机制通过并行计算多个注意力头来捕捉输入序列中的不同特征。每个注意力头都有自己的 Query、Key 和Value 矩阵：

* **查询矩阵 Q**：用于计算输入序列中每个位置的注意力分数。
* **键矩阵 K**：用于与查询矩阵 Q 计算注意力分数。
* **值矩阵 V**：用于根据注意力分数加权求和，得到最终的输出。

MLA 的核心思想是**通过低秩联合压缩，减少 K 和 V 矩阵的存储和计算开销**。

## 1. 低秩联合压缩

### 键值矩阵的低秩压缩

MLA 通过以下步骤对 K 和 V 矩阵进行低秩联合压缩：

**压缩键和值**：
$$
 \mathbf{c}_t^{KV} = W^{DKV} \mathbf{h}_t\tag{1}
 $$
设输入序列的第 $t$ 个 token 的注意力输入为 $\mathbf{h}_t \in \mathbb{R}^d$ ，其中 $d$ 是嵌入维度（embedding dimension）。通过一个下投影矩阵 $W^{DKV} \in \mathbb{R}^{d_c \times d}$ ，将 $\mathbf{h}_t$ 压缩为一个低维的潜在向量（latent vector）$\mathbf{c}_t^{KV} \in \mathbb{R}^{d_c}$ ，其中 $d_c \ll d_h n_h$ ，$d_h$ 是每个注意力头的维度， $n_h$ 是注意力头的数量[^1]。

**重建键和值**：通过上投影矩阵 $W^{UK} \in \mathbb{R}^{d_h n_h \times d_c}$ 和 $W^{UV} \in \mathbb{R}^{d_h n_h \times d_c}$ ，将压缩后的潜在向量 $\mathbf{c}_t^{KV}$ 重建为键和值矩阵：
$$
\begin{align}
\mathbf{[}\mathbf{k}_{t,1}^{C};\mathbf{k}_{t,2}^{C};...;\mathbf{k}_{t,n_{h}}^{C}\mathbf{]}=\mathbf{k}_t^C = W^{UK} \mathbf{c}_t^{KV}\tag{2}\\
\mathbf{[}\mathbf{v}_{t,1}^{C};\mathbf{v}_{t,2}^{C};...;\mathbf{v}_{t,n_{h}}^{C}\mathbf{]}=\mathbf{v}_t^C = W^{UV} \mathbf{c}_t^{KV}\tag{5}
\end{align}
$$

其中 $W^{UK} \in \mathbb{R}^{n_h d_h \times d_c}$ 可视为按 head 分块：
$$
W^{UK} = [W^{UK}_1; W^{UK}_2; \ldots; W^{UK}_{n_h}],\qquad W^{UK}_i \in \mathbb{R}^{d_h \times d_c}
$$
每一块 $W^{UK}_i$ 对应第 $i$ 个 head 的 Key 上投影。同理 $W^{UV}$ 也可按 head 分块（$W^{UV}_i \in \mathbb{R}^{d_v \times d_c}$）。

**应用旋转位置编码**：为了引入位置信息，MLA 对键矩阵应用旋转位置编码（Rotary Positional Encoding）：
 $$
\mathbf{k}_t^R = \text{RoPE}(W^{KR} \mathbf{h}_t)\tag{3}
$$
其中， $W^{KR} \in \mathbb{R}^{d_h^R \times d}$ 是用于生成携带 RoPE 位置信息的解耦 Key 分量（RoPE 分量）的投影矩阵，$d_h^R$ 是 $\mathbf{k}_t^R$ 向量的维度，这个向量会被复制到每个头，与每个头的压缩键 $\mathbf{k}_{t,i}^C$ 拼接：

> [!question] 什么是“解耦 Query / Key”？为什么解耦后要在 head 间共享？
> **Q1：这里的“解耦（decoupled）”到底指什么？**  
> 指把用于注意力计算的 Query/Key **拆成两段并分别生成**：一段主要表达**内容（content）**，另一段主要承载**位置信息（RoPE）**，最后在特征维度上做拼接（concatenate）。  
> - Key：$\mathbf{k}_{t,i} = [\mathbf{k}_{t,i}^C; \mathbf{k}_t^R]$。其中 $\mathbf{k}_{t,i}^C$ 由潜在向量 $\mathbf{c}_t^{KV}$ 上投影重建（位置无关、便于压缩/缓存），$\mathbf{k}_t^R$ 则由 $W^{KR}\mathbf{h}_t$ 生成并施加 RoPE（位置相关，但维度很小）。  
> - Query：$\mathbf{q}_{t,i} = [\mathbf{q}_{t,i}^C; \mathbf{q}_{t,i}^R]$。其中 $\mathbf{q}_{t,i}^C$ 来自压缩向量 $\mathbf{c}_t^Q$ 的上投影重建，$\mathbf{q}_{t,i}^R$ 来自单独的 RoPE 分支（下文公式 (8)）。  
>  
> **为什么需要这种解耦？（KV 压缩 vs. RoPE 的“冲突”）**  
> MLA 的 KV 压缩希望缓存尽可能小：KV cache 的核心是缓存压缩后的 $\mathbf{c}_t^{KV}$（以及额外很小的 $\mathbf{k}_t^R$），需要时再用位置无关的 $W^{UK}$ 重建 $\mathbf{k}_{t,i}^C$。但 RoPE 是**位置敏感**的：如果把 RoPE 直接施加在“内容 Key”上，要么不得不缓存旋转后的高维 Key（缓存膨胀、失去压缩意义），要么每步都重建并旋转（增加延迟），同时还会破坏很多工程上“矩阵可融合/可吸收”的优化空间。  
> 解耦的关键点是：**让 RoPE 只作用在一段小维度的 $\mathbf{k}_t^R / \mathbf{q}_{t,i}^R$ 上**，而把可压缩、可缓存、位置无关的内容部分留在 $\mathbf{k}_{t,i}^C / \mathbf{q}_{t,i}^C$ 路径里。
>  
> **Q2：解耦之后，“每个 head 共享”有什么意义？**  
> 这里的共享主要指 **Key 的 RoPE 分量 $\mathbf{k}_t^R$ 在所有 head 之间共享**（而 $\mathbf{k}_{t,i}^C$ 仍是每个 head 私有的内容分量）。直觉上，位置信息对所有 head 是一致的：token 的“坐标/相对距离”不因 head 不同而改变。共享带来的收益是非常直接的：  
> - **KV cache 更小**：若不共享，每个 token 需要为每个 head 存一份 $\mathbf{k}_{t,i}^R$（$n_h \cdot d_h^R$）；共享后每个 token 只需缓存一份 $\mathbf{k}_t^R$（$d_h^R$）。  
> - **参数与计算更省**：共享意味着只需一个 $W^{KR}\in\mathbb{R}^{d_h^R\times d}$（而不是 $d_h^R n_h\times d$），并且每个 token 的 RoPE 只需对这一份 $\mathbf{k}_t^R$ 计算一次。  
> - **表达能力不受太大影响**：head 的多样性主要由 $\mathbf{k}_{t,i}^C/\mathbf{q}_{t,i}^C$ 的内容分量提供；位置分量作为“统一坐标系”共享即可。  
>  
> 补充：在本文给出的公式里，Query 的 RoPE 分量 $\mathbf{q}_{t,i}^R$ 是**按 head 生成的**（见 $W^{QR}\in\mathbb{R}^{d_h^R n_h\times d_c'}$ 的输出维度），而不是像 Key 那样跨 head 共享。

**最终键和值**：最终的键和值矩阵由压缩后的键和值以及旋转位置编码后的键组合而成：
$$
\begin{align}
\mathbf{k}_{t,i} &= [\mathbf{k}_{t,i}^C; \mathbf{k}_t^R]\tag{4}\\
\\
\mathbf{v}_t &= \mathbf{v}_t^C
\end{align}
$$

### 查询矩阵的低秩压缩

MLA 同时还对查询矩阵 Q 进行低秩压缩，以减少训练时的激活内存：

**压缩查询**：
$$
\mathbf{c}_t^Q = W^{DQ} \mathbf{h}_t\tag{6}
$$
通过下投影矩阵 $W^{DQ} \in \mathbb{R}^{d_c' \times d}$ ，将 $\mathbf{h}_t$ 压缩为一个低维的潜在向量 $\mathbf{c}_t^Q \in \mathbb{R}^{d_c'}$ ，其中 $d_c' \ll d_h n_h$ 。  

**重建查询**：通过上投影矩阵 $W^{UQ} \in \mathbb{R}^{d_h n_h \times d_c'}$ ，将压缩后的潜在向量 $\mathbf{c}_t^Q$ 重建为查询矩阵：
$$
\mathbf{[}\mathbf{q}_{t,1}^{C};\mathbf{q}_{t,2}^{C};...;\mathbf{q}_{t,n_{h}}^{C}\mathbf{]}=\mathbf{q}_t^C = W^{UQ} \mathbf{c}_t^Q\tag{7}
$$

**应用 RoPE ：**
$$
\mathbf{q}_t^R = \text{RoPE}(W^{QR} \mathbf{c}_t^Q)\tag{8}
$$
其中， $W^{QR} \in \mathbb{R}^{d_h^R n_h \times d_c'}$ 是用于生成解耦查询的矩阵。它会为每个注意力头生成对应的 $\mathbf{q}_{t,i}^R$（可理解为把 $\mathbf{q}_t^R$ reshape 为 $n_h \times d_h^R$）。

**最终查询**：最终的查询矩阵由压缩后的查询和旋转位置编码后的查询组合而成：
$$
\mathbf{q}_t = [\mathbf{q}_t^C; \mathbf{q}_t^R]\tag{9}
$$

## 2. 注意力计算

最终的注意力输出通过以下步骤计算：

**计算注意力分数**：对于每个注意力头 $i$ ，计算查询 $\mathbf{q}_{t,i}$ 和键 $\mathbf{k}_{j,i}$ 的点积，并除以 $\sqrt{d_h + d_h^R}$ 进行缩放：
$$
\text{score}_{t, j, i} = \frac{\mathbf{q}_{t, i}^T \mathbf{k}_{j, i}}{\sqrt{d_h + d_h^R}}
$$

**计算注意力分数**：对注意力分数进行 softmax 归一化，得到：
$$
\alpha_{t, j, i} = \text{Softmax}_j (\text{score}_{t, j, i})
$$

**加权求和**：使用注意力分数对值 $\mathbf{v}_{j, i}^C$ 进行加权求和，得到每个注意力头的输出：
$$
\mathbf{o}_{t, i} = \sum_{j=1}^t \alpha_{t, j, i} \mathbf{v}_{j, i}^C\tag{10}
$$

**合并多头输出**：将所有注意力头的输出拼接起来，并通过输出投影矩阵 $W^O \in \mathbb{R}^{d \times d_h n_h}$ 进行线性变换，得到最终的输出：
$$
\mathbf{u}_t = W^O [\mathbf{o}_{t, 1}; \mathbf{o}_{t, 2}; \ldots; \mathbf{o}_{t, n_h}]\tag{11}
$$

汇总起整个流程，就是：
$$
\begin{array}{ccccc}
\hline
\text{序号} & \text{步骤} & \text{公式} & \text{维度变化} & \text{备注} \\
\hline
1 & \text{kv 压缩} 
& c_t^{KV} = W^{DKV} h_t 
& 7168 \rightarrow 512 
& \text{kv cache 保存} \\

2 & \text{k 非 RoPE 部分} 
& [k^C_{t,1};\dots;k^C_{t,n_h}] = k_t^C = W^{UK} c_t^{KV} 
& 512 \rightarrow 128 \times 128 
& \text{128 头 128 维} \\

3 & \text{k RoPE 部分} 
& k_t^R = \mathrm{RoPE}(W^{KR} h_t) 
& 7168 \rightarrow 64 
& \text{kv cache 保存；128 头共用一个 64 维} \\

4 & \text{k 的最终表示} 
& k_{t,i} = [k^C_{t,i}; k_t^R] 
& 128 \times (128 + 64) 
& \text{128 头 192 维} \\

5 & \text{v 的最终表示} 
& [v^C_{t,1};\dots;v^C_{t,n_h}] = v_t^C = W^{UV} c_t^{KV} 
& 512 \rightarrow 128 \times 128 
& \text{128 头 128 维} \\

6 & \text{q 压缩} 
	& c_t^Q = W^{DQ} h_t 
	& 7168 \rightarrow 1536 
	& \text{减少 Q 投影参数量/优化器状态；配合重算降低激活内存} \\

7 & \text{q 非 RoPE 部分} 
	& [q^C_{t,1};\dots;q^C_{t,n_h}] = q_t^C = W^{UQ} c_t^Q 
	& 1536 \rightarrow 128 \times 128 
	& \text{128 头 128 维} \\

8 & \text{q RoPE 部分} 
	& [q^R_{t,1};\dots;q^R_{t,n_h}] = q_t^R = \mathrm{RoPE}(W^{QR} c_t^Q) 
	& 1536 \rightarrow 128 \times 64 
	& \text{128 头 64 维} \\

9 & \text{q 的最终表示} 
& q_{t,i} = [q^C_{t,i}; q^R_{t,i}] 
& 128 \times (128 + 64) 
& \text{128 头 192 维} \\

10 & \text{self-attention} 
& o_{t,i} = \sum_{j=1}^{t} \mathrm{Softmax}_j\!\left(
\frac{q_{t,i}^T k_{j,i}}{\sqrt{d_h + d_h^R}}
\right) v^C_{j,i}
& - 
& - \\

\hline
\end{array}
$$ 
## 3. 思考问题

### 低维潜在向量维度的取值

> _低维的潜在向量的维度应该如何取值，这个维度和原始 token 的嵌入维度是否存在比例关系，如果存在的话，比例通常设置多少？依据什么来设置？_

在 MLA 中，低维潜在向量的维度 $d_c$（KV 压缩维度）与 $d_c'$（Query 压缩维度）是两个最关键的超参数：它们决定了**信息瓶颈有多窄**，从而直接影响性能与效率（KV cache、计算、激活内存）。

> [!note] DeepSeek-V3（MLA）相关维度配置（便于对照）
> | 参数 | 符号（本文记法） | DeepSeek-V3 设置值 |
> | :--- | :--- | :--- |
> | 隐藏层维度 | $d$ | 7168 |
> | 注意力头数量 | $n_h$ | 128 |
> | 非 RoPE 的 Q/K 每头维度 | $d_h$（对应 `qk_nope_head_dim`） | 128 |
> | 解耦 RoPE 的 Q/K 维度 | $d_h^R$（对应 `qk_rope_head_dim`） | 64 |
> | 值的每头维度 | $d_v$（对应 `v_head_dim`） | 128 |
> | KV 压缩维度 | $d_c$（对应 `kv_lora_rank`） | 512 |
> | Query 压缩维度 | $d_c'$（对应 `q_lora_rank`） | 1536 |

1) 先明确：$d_c$ / $d_c'$ 控制的是“有效自由度（rank）”，不是输出形状
    以 Key 的内容分量为例（不含 RoPE 的那条压缩路径）：
    $$
    \mathbf{k}_t^C = W^{UK}\mathbf{c}_t^{KV}=W^{UK}W^{DKV}\mathbf{h}_t
    $$
    如果把它看成一个“等价的普通线性层”，它的权重就是 $W^{UK}W^{DKV}\in\mathbb{R}^{(n_h d_h)\times d}$，输出维度是 $n_h d_h$；但它的秩被 $d_c$ 限死（$\mathrm{rank}\le d_c$）。  
    所以 **$n_h d_h$ 可以大于 $d$**，这只是“输出形状更宽”，并不代表模型真的拥有 $n_h d_h$ 维的独立信息通道；真正的瓶颈是 $d_c$（KV）与 $d_c'$（Q）。

2) 为什么 $d_c$（KV）可以更小，而 $d_c'$（Q）通常更大？
    **KV cache 是推理的主要内存瓶颈，而 Query 不进 cache。**
    - **$d_c$ 越小，KV cache 越省，但信息瓶颈风险越大**。推理时每个 token 至少需要缓存 $\mathbf{c}_t^{KV}\in\mathbb{R}^{d_c}$，以及共享的 $\mathbf{k}_t^R\in\mathbb{R}^{d_h^R}$（用于位置相关的 RoPE 分量）。在 DeepSeek-V3 的配置下，单 token 缓存维度大约是：
      $$
      d_c + d_h^R = 512 + 64 = 576
      $$
      如果对比“把每个 token 的 K/V 都按 head 完整缓存”的做法（这里按 MLA 最终的 head 维度来算：Key 每头 $d_h+d_h^R$，Value 每头 $d_v$），则单 token 的缓存维度大约是：
      $$
      n_h(d_h+d_h^R) + n_h d_v = 128(128+64)+128\cdot 128=40960
      $$
      粗略压缩比约为 $40960/576\approx 71\times$。（具体节省还与 dtype、对齐、实现细节有关。）
    
    - **$d_c'$ 主要影响训练/推理每步计算与激活内存**。它不需要跨 token 长度线性累积地缓存，所以可以设置得更大来减少信息损失。DeepSeek-V3 的 $d_c'=1536$（约为 $d$ 的 $0.214$）明显大于 $d_c=512$（约为 $d$ 的 $0.071$），就是“KV 极致压缩、Q 更侧重保真”的直接体现。

3) 取值依据：
    1. **性能/压缩的主权衡**：$d_c$、$d_c'$ 太小会成为信息瓶颈，注意力质量下降；太大则 KV cache/计算收益下降。
    2. **与 head 形状的耦合**：当 $n_h d_h$ 很大时，如果 $d_c$ 太小，等价投影矩阵的秩上限过低，可能不足以支撑“每个 head 都有有用的内容分量”。因此 $d_c$ 往往需要与模型规模、head 配置一起调参。
    3. **Q 与 KV 的差异化目标**：KV 维度选择要优先服务推理内存；Q 维度选择要优先服务注意力打分的稳定与精度（尤其对大模型/复杂任务）。
    4. **低秩注意力的经验类比**：像 Linformer 这类方法也证明了“把注意力相关表示投到低秩空间”可以在合理的 rank 下保持性能。![[DeepSeek-MLA-Principle-linformer.png]]

### 与 MHA 在 head 数量与维度上的不同

上一问可以观察到，head 数量与维度之积 $128\times 128 =16384 \ne 7168$ ， 这与标准 MHA 不同。原因如下：

1) **经典 MHA 的“等式”更多是工程习惯**，不是数学硬约束
    很多实现会令：
    $$
    d \;=\; n_h\cdot d_h
    $$
    这样 $W^Q,W^K,W^V$ 的输出维度都是 $d$，实现上最方便（也便于与残差、FFN 等模块对齐）。但从数学上讲，MHA 只需要：
    - $W^Q \in \mathbb{R}^{(n_h d_q)\times d}$，$W^K \in \mathbb{R}^{(n_h d_k)\times d}$，$W^V \in \mathbb{R}^{(n_h d_v)\times d}$
    - 最后再用 $W^O\in\mathbb{R}^{d\times (n_h d_v)}$ 投回 $d$
    
    因此 $n_h d_h$ **可以不等于** $d$。只是当你用的是“普通全连接投影”时，这么做会显著增加参数量与算力，所以不常见。

1) MLA 为什么敢让 $n_h d_h$ 变得很大？因为它是**低秩重建**（LoRA-style factorization）
    MLA 的 Q/K（内容分量）不是直接用一个大矩阵从 $d$ 投到 $n_h d_h$，而是“先压缩到 $d_c$/$d_c'$，再上投影回去”。以 KV 为例：
    $$
    \mathbf{c}_t^{KV}=W^{DKV}\mathbf{h}_t,\quad
    \mathbf{k}_t^C=W^{UK}\mathbf{c}_t^{KV}
    $$
    等价地看，它实现的是一个大矩阵 $W^{UK}W^{DKV}$，但这个大矩阵的秩被 $d_c$ 限制（$\le d_c$）。这使得：
    - **输出形状**可以是 $n_h d_h=128\times 128=16384$，并不要求等于 $d=7168$
    - 但它的“有效自由度”并不会随着输出形状线性爆炸（因为 rank 被 $d_c$ 卡住了）
    
    这也是 MLA 能在扩大 head 形状的同时，仍然把 KV cache 压到很小的根本原因。

3) **每头维度 $d_h=128$ 在 MLA 里应如何理解**？
    在 DeepSeek-V3 的配置里，最终用于注意力打分的 Query/Key 是拼接向量：
    $$
    \mathbf{q}_{t,i} = [\mathbf{q}_{t,i}^C;\mathbf{q}_{t,i}^R],\quad
    \mathbf{k}_{t,i} = [\mathbf{k}_{t,i}^C;\mathbf{k}_t^R]
    $$
    因此单头的最终 Q/K 维度是：
    $$
    d_h + d_h^R = 128 + 64 = 192
    $$
    这里技术报告里提到的 “per-head dimension $d_h=128$” 更准确地说对应的是 **非 RoPE 的内容分量维度**（`qk_nope_head_dim`），而不是最终拼接后的总维度。

### 为什么要对 Query 和 Key 应用 RoPE？

RoPE（Rotary Positional Embedding）通过对向量施加与位置相关的旋转，把**相对位置信息**“内生”地写进注意力分数（点积）里。MLA 沿用这一设计，同时对 Query 和 Key 应用 RoPE，主要原因可以归纳为三点：

1. **对称性与对齐**：注意力分数来自 Query 与 Key 的点积。如果只对一侧做旋转，点积会依赖单侧的绝对位置而非两者的相对位置；同时对两侧应用 RoPE，才能在同一数学空间里对齐位置信息，让打分稳定地表达 token 间的距离关系。

2. **相对位置建模（无需 $L\times L$ 的相对偏置参数化）**：RoPE 的关键性质是把“绝对位置旋转”转化为“相对位移”：
    $$
    \langle R_i \mathbf{q},\, R_j \mathbf{k}\rangle \;=\; \langle \mathbf{q},\, R_{j-i}\mathbf{k}\rangle
    $$
    其中 $R_i$ 表示位置 $i$ 对应的旋转。因而相对位置 $j-i$ 会自然进入点积结果。相比之下，T5-style `relative_position_bias` 通常以 bucket 形式参数化（**参数量不随 $L^2$ 增长**），但在计算 attention logits 时会广播/形成形如 $[n_{\text{heads}},L,L]$ 的 bias 张量参与运算，因此**运行时的中间张量与计算仍与 $L^2$ 相关**。RoPE 的优势在于避免了 $L\times L$ 的相对偏置参与参数化；实现上位置相关项一般以 $\sin/\cos$ 形式按位置生成或缓存（缓存时约为 $O(L\cdot d_{\text{rope}})$）。

3. **长序列外推与工程可扩展性**：RoPE 的形式允许通过调整旋转频率（例如缩放因子）来扩展上下文窗口，这是一个通用手段。DeepSeek-V3 的技术报告中，为了获得更可靠的外推效果，采用的是“两阶段继续训练”：先在 4K 长度上预训练，再结合 **YaRN**（一种 RoPE 扩展方法）分别在 32K 与 128K 长度上继续训练；并且 YaRN 只作用于解耦出来、跨 head 共享的 RoPE Key 分量 $\mathbf{k}_t^R$，不作用于内容压缩/重建路径。由于 $\mathbf{k}_t^R$ 在 Key 侧只有一份共享表示，这也让长上下文扩展策略的工程实现更简单。

需要强调的是：在 MLA 里，RoPE 并不是作用在整段的 Query/Key 上，而是只作用于解耦出来的 RoPE 分量（上文的 $\mathbf{q}_{t,i}^R$ 与 $\mathbf{k}_t^R$）。由于最终是拼接：
$$
\mathbf{q}_{t,i} = [\mathbf{q}_{t,i}^C;\mathbf{q}_{t,i}^R],\quad
\mathbf{k}_{j,i} = [\mathbf{k}_{j,i}^C;\mathbf{k}_{j}^R]
$$
因此**注意力打分会自然分解为“内容匹配 + 位置匹配”两部分**：
$$
\mathbf{q}_{t,i}^T\mathbf{k}_{j,i} \;=\; (\mathbf{q}_{t,i}^C)^T\mathbf{k}_{j,i}^C \;+\; (\mathbf{q}_{t,i}^R)^T\mathbf{k}_{j}^R
$$
其中第二项由 RoPE 提供相对位置信号，而第一项保持在低秩压缩/可融合的内容路径上。

对比其他位置编码方法：

| **方法**                 | **特点**                                | **局限性**                  |
| ---------------------- | ------------------------------------- | ------------------------ |
| **绝对位置编码（Sinusoidal）** | 固定频率的正弦函数编码位置，简单易用。                   | 无法建模相对位置关系，长序列性能下降。      |
| **相对位置偏置（T5-style）**   | 为位置差引入偏置（常见为 bucket 参数化），直接建模相对位置。 | 参数量不随 $L^2$ 增长，但 logits 的 bias 广播/中间张量与计算仍与 $L^2$ 相关。 |
| **RoPE**               | 通过旋转把相对位置融入 Q/K 表示（对称地作用在两侧）。       | 无需 $L\times L$ 的偏置参数表，但需要生成/缓存 $\sin/\cos$（可视实现为 $O(L\cdot d_{\text{rope}})$ 或以算换存）。       |

*注：推理时的 RoPE scaling 属于通用手段；DeepSeek-V3 为追求更好的外推效果，采用了 YaRN + 继续训练来扩展上下文（YaRN 作用在共享的 $\mathbf{k}_t^R$ 分支上）。*

### 对 Q 和 K 进行 RoPE 的不同之处

在 MLA 中，RoPE 分支对 Query/Key 的输入并不对称：
- Query：$\mathbf{q}_{t,i}^R = \mathrm{RoPE}(W^{QR}\mathbf{c}_t^Q)$（输入是压缩向量 $\mathbf{c}_t^Q$）
- Key：$\mathbf{k}_t^R = \mathrm{RoPE}(W^{KR}\mathbf{h}_t)$（输入是原始向量 $\mathbf{h}_t$，且 $\mathbf{k}_t^R$ 跨 head 共享）

这背后的核心考量可以概括为：**KV 侧的设计首先服务于“可缓存、可复用”，因此尽量把会造成瓶颈/干扰的东西从 KV 压缩路径里解耦出去；而 Q 侧的设计首先服务于“当前步的计算高效”，因此能在已压缩空间里算就尽量在已压缩空间里算。**

1) KV 侧（Key）的 RoPE 分量：避免把“位置相关分量”塞进 KV 压缩瓶颈
    MLA 已经用 $\mathbf{c}_t^{KV}\in\mathbb{R}^{d_c}$ 承担了内容分量的极致压缩（推理时需要缓存并被未来反复复用）。如果再让 $\mathbf{k}_t^R$ 也从 $\mathbf{c}_t^{KV}$ 产生，那么**位置相关的 RoPE 分支也会被强行限制在同一个 $d_c$ 的信息瓶颈里**，容易造成“压缩路径既要负责内容、又要负责位置”的相互干扰（这也会削弱前面提到的解耦动机）。
    
    因此，MLA 选择让 $\mathbf{k}_t^R$ 直接由 $\mathbf{h}_t$ 产生：在写入 cache 的当下，$\mathbf{h}_t$ 本来就已计算得到；用一个很小的投影 $W^{KR}\in\mathbb{R}^{d_h^R\times d}$ 生成 $d_h^R$ 维向量并施加 RoPE，开销很低，但能让“位置相关分量”独立于 $\mathbf{c}_t^{KV}$ 的压缩瓶颈。

> [!note] 这并不意味着要缓存 $\mathbf{h}_t$
> 推理时缓存的是 $\mathbf{c}_t^{KV}$（以及额外很小的、共享的 $\mathbf{k}_t^R$），而不是高维的 $\mathbf{h}_t$。

2) Q 侧（Query）的 RoPE 分量：把“每步都算的东西”尽量放在已压缩空间里算
    Query 不进 KV cache（不会随序列长度线性累积存储），它的主要压力来自**每个解码步的即时计算与训练激活**。既然 Query 路径已经先得到 $\mathbf{c}_t^Q\in\mathbb{R}^{d_c'}$，那么让 $\mathbf{q}_{t,i}^R$ 也从 $\mathbf{c}_t^Q$ 生成有两个直接收益：
    - **更省参数/算力**：用 $W^{QR}$ 从 $d_c'$ 映射到 $n_h d_h^R$，比从 $d$ 映射要便宜。
    - **压缩不至于过猛**：在 DeepSeek-V3 里 $d_c'=1536$ 相对 $d=7168$ 并不算极端压缩，通常足以支撑 RoPE 分支所需的信息。

3) “复用 vs. 私有”的差异：Key 的 $\mathbf{k}_t^R$ 共享，Query 的 $\mathbf{q}_{t,i}^R$ 按 head 生成
    Key 的 RoPE 分量 $\mathbf{k}_t^R$ 需要被未来所有 Query 重复使用，且位置信息对不同 head 是一致的，因此跨 head 共享非常自然；而 Query 的 RoPE 分量由 $W^{QR}$ 一次性生成 $n_h$ 份（每头一份）$\mathbf{q}_{t,i}^R$，与每头的内容分量配对使用。

这个设计的底层逻辑可以用下表来概括：

| 维度         | Key路径                               | Query路径                            |
| ---------- | ----------------------------------- | ---------------------------------- |
| **核心目标**   | 极致压缩KV Cache                        | 减少计算量，保持准确性                        |
| **输入来源**   | 原始向量 $h_t$ (7168维)                  | 压缩向量 $c_t^Q$ (1536维)               |
| **原因**     | 让 RoPE 位置分量不受 $d_c$ 的 KV 压缩瓶颈影响；同时仍然保持 KV cache 极小 | Query 不入 cache，可在 $d_c'$ 空间里高效生成 RoPE 分量（且 $d_c'$ 压缩不算过猛） |
| **共享性**    | 全局共享：一个 $c_t^{KV}$ 服务所有未来头          | 私有：只用于当前token的当前头                  |
| **RoPE来源** | 从原始 $h_t$ 生成共享的解耦键 $k_t^R$          | 从压缩 $c_t^Q$ 生成解耦查询 $q_t^R$         |
| **缓存**     | 缓存 $c_t^{KV}$ (512维) 与共享的 $k_t^R$ (64维) | 不缓存任何东西                            |

所以，这个不对称设计的本质是：**Key 侧把“位置相关但小维度”的部分单独拎出来（共享且轻量），避免干扰 KV 的极致压缩；Query 侧则在已压缩的 $\mathbf{c}_t^Q$ 空间里完成 RoPE 分量生成，以降低每步计算与训练激活开销。**

### 压缩查询矩阵的必要性：分维度精细化分析

在进入分析前先明确一个已知的前提：**MLA 对 Query 与 KV 的压缩策略并不对称**。在 DeepSeek-V3 的配置中，Query 压缩维度 $d_c'=1536$ 明显大于 KV 压缩维度 $d_c=512$：KV 侧更偏向推理阶段的 KV cache 极致压缩；Query 侧更偏向训练阶段的激活内存/计算效率，同时尽量保留信息。

为避免口径混乱，下面把“显存/计算/通信/参数”拆成几个相互独立的分析维度。

1) 分析维度的界定

| 分析维度 | 涵盖内容 | 与序列长度 $L$ 的关系 | 对比口径说明 |
| :--- | :--- | :--- | :--- |
| **KV cache per token** | 推理时每新增 1 个 token，需要为该 token 缓存的历史信息量 | **线性增长**（总 cache $\propto L$） | MLA vs MHA 的核心差异点 |
| **训练激活内存** | 前向中需为反向保留/可重算的中间激活 | 与 $L$、batch size、kernel 实现相关 | Query 压缩的主要收益落在这里 |
| **参数量** | 模型静态权重（投影矩阵等） | 与 $L$ 无关 | 不能混入“随 $L$ 增长的显存项” |
| **运行时中间张量/算子开销** | logits、softmax、重建/吸收等算子产生的中间量与 FLOPs | 通常与 $L^2$ 或 $L$ 相关（视训练/推理而定） | MLA 不是简单把“点积维度”整体降到 $d_c$ |

2) **KV cache per token**（推理阶段的核心收益）
    这部分是 MLA 最关键的优势点：**cache 缓存的对象改变了**。
    
    **标准 MHA 的 KV cache（按每 token 计）**：每个 token 需要为所有 head 缓存 Key 与 Value：
    $$
    \mathrm{MHA\_cache/token} \;=\; n_h(d_k + d_v)
    $$
    在常见设置 $d_k=d_v=d_h$ 下，就是 $2n_h d_h$。以 DeepSeek-V3 的 $n_h=128,d_h=d_v=128$ 为例：
    $$
    2\cdot 128\cdot 128 = 32768
    $$
    （个浮点数；若 FP16 约 64 KiB/ token）
    
    **MLA 的 KV cache（按每 token 计）** ：DeepSeek-V3 报告强调推理需要 cache 的核心是两类向量：
    - 压缩后的潜在向量 $\mathbf{c}_t^{KV}\in\mathbb{R}^{d_c}$（内容信息）
    - 解耦 RoPE Key 分量 $\mathbf{k}_t^R\in\mathbb{R}^{d_h^R}$（位置信息，跨 head 共享）
    
    因此每 token 的 cache 大小约为：
    $$
    \mathrm{MLA\_cache/token} \;=\; d_c + d_h^R = 512 + 64 = 576
    $$
    （个浮点数；若 FP16 约 1.1 KiB/ token）
    
    压缩比（以“标准 MHA 缓存 K/V”作为 baseline）约为：
    $$
    32768/576 \approx 56.9\times
    $$
    这也就是 DeepSeek V2 报告中初次提出 MLA 所说的 KV Cache 压缩率 97%+ 的来源。

3) **计算量**：MLA 的关键在**权重吸收**，而非把点积维度替换成 $d_c$
    MLA 的注意力 logits 依然来自每头最终的拼接向量：
    $$
    \mathbf{q}_{t,i} = [\mathbf{q}_{t,i}^C;\mathbf{q}_{t,i}^R],\quad
    \mathbf{k}_{j,i} = [\mathbf{k}_{j,i}^C;\mathbf{k}_{j}^R]
    $$
    其中内容分量维度是 $d_h$，RoPE 分量维度是 $d_h^R$，缩放项也写成 $\sqrt{d_h+d_h^R}$。
    
    MLA 的“计算侧”优化重点在于：虽然 $\mathbf{k}_{j,i}^C$ 的数学定义是上投影重建，但实现时可以通过**权重吸收/算子重排**避免显式重建所有历史 token 的 K/V：
    $$
    (\mathbf{q}_{t,i}^C)^T\mathbf{k}_{j,i}^C
    \,=\,
    (\mathbf{q}_{t,i}^C)^T(W^{UK}_i\mathbf{c}_j^{KV})
    \,=\,
    \big((W^{UK}_i)^T\mathbf{q}_{t,i}^C\big)^T \mathbf{c}_j^{KV}
    $$
    也就是说，对每个 head $i$，可以先把当前 Query 的内容分量投到 latent 空间：
    $$
    \tilde{\mathbf{q}}_{t,i}^C = (W^{UK}_i)^T\mathbf{q}_{t,i}^C \in \mathbb{R}^{d_c}
    $$
    然后与 cache 中的 $\mathbf{c}_j^{KV}$ 做点积，得到内容项 logits。这样做的收益主要是：
    - **内存带宽更友好**：历史侧读取的是小向量 $\mathbf{c}_j^{KV}$（而不是大 K/V）。
    - **避免显式物化 K/V**：减少中间张量与写回。
    
    同理，Value 的“重建 + 加权求和”也可重排为先在 latent 空间做加权，再一次性上投影：
    $$
    \mathbf{o}_{t,i}
    =
    \sum_{j\le t}\alpha_{t,j,i}\mathbf{v}_{j,i}^C
    =
    \sum_{j\le t}\alpha_{t,j,i}(W^{UV}_i\mathbf{c}_j^{KV})
    =
    W^{UV}_i\!\left(\sum_{j\le t}\alpha_{t,j,i}\mathbf{c}_j^{KV}\right)
    $$
    
    因此，更准确的说法是：**MLA 把“对历史 token 的开销”尽可能推到对小向量 $\mathbf{c}^{KV}$ 的读写与点积上，并通过吸收/融合减少大张量重建与访存**，而不是简单把注意力从 $O(L^2 d)$ 变成 $O(L^2 d_c)$。

4) **训练激活内存**：Query 压缩主要在这里省
    训练时显存瓶颈通常来自激活（以及注意力 kernel 的实现方式）。从“可持久化激活”的角度看：
    - 标准 MHA 往往需要为反向保存/重算 $Q,K,V$（形状约 $L\times n_h\times d_h$）以及相关中间量。
    - MLA 的 Query 路径可以把“可保留的核心表示”压缩到 $\mathbf{c}_t^Q\in\mathbb{R}^{d_c'}$，并在反向时重算上投影与 RoPE 分支。DeepSeek-V3 的实现也明确提到会在反向中重算 RMSNorm 与 MLA up-projection，以减少需要持久化存储的激活。
    
    同时，Query 的低秩分解也会改变 Q 投影的参数规模：标准 MHA 的 $W^Q$ 通常为 $d\times (n_h d_h)$；而 MLA 将其分解为 $W^{DQ}\in\mathbb{R}^{d_c'\times d}$ 与 $W^{UQ}\in\mathbb{R}^{(n_h d_h)\times d_c'}$，参数量从 $d\cdot n_h d_h$ 变为 $d\cdot d_c' + n_h d_h\cdot d_c'$，优化器状态（如 Adam 的动量/方差）也会相应变化。训练时若仅持久化保存低维的 $\mathbf{c}_t^Q$ 并在反向重算上投影，则能进一步降低需要长期保留的激活内存。
    
    需要注意：**注意力 logits/softmax 的 $L\times L$ 级别中间量是否物化**取决于 kernel（如 FlashAttention 类方法通常不显式存整张 $L\times L$ 矩阵）。MLA 的 Query 压缩并不改变“注意力的几何维度”，但能显著降低 Q/K/V 相关的激活与反向重算成本。

5) **参数量的空间占用**：
    以 KV 相关投影为例：
    - 标准 MHA 的 KV 相关参数量（假设 $d_k=d_v=d_h$）：
    $$
    \#\theta_{\text{MHA,KV}} = d\cdot(n_h d_h) + d\cdot(n_h d_v) = d\cdot n_h(d_h+d_v)
    $$
    代入 $d=7168,n_h=128,d_h=d_v=128$，约为 $2\cdot 7168\cdot 16384 \approx 235\text{M}$。
    
    - MLA 的 KV 相关参数量：
    $$
    \#\theta_{\text{MLA,KV}}
    =
    \underbrace{d_c\cdot d}_{W^{DKV}}
    \underbrace{(n_h d_h)\cdot d_c}_{W^{UK}}
    \underbrace{(n_h d_v)\cdot d_c}_{W^{UV}}
    \underbrace{d_h^R\cdot d}_{W^{KR}}
    $$
    代入 $d=7168,d_c=512,n_h d_h=16384,d_v=128,d_h^R=64$，约为 $3.67\text{M}+8.39\text{M}+8.39\text{M}+0.46\text{M}\approx 20.9\text{M}$，约 **11.2×** 的参数压缩。

5) 通信开销（分布式训练/推理）：取决于并行策略与实现
    在张量并行/序列并行等设置下，通信量与“需要跨设备同步/传输的激活张量”相关。直观上：
    - 若实现允许在更低维的 $\mathbf{c}^{KV}$ / $\mathbf{c}^{Q}$ 空间先做一部分聚合/同步，再在本地完成重建与后续算子，则通信带宽压力可能下降；
    - 但 attention logits/softmax 相关的通信（例如序列并行下的部分归约）是否减少，取决于具体 kernel 与并行切分方式，不能一概而论。

| 维度 | 标准 MHA | MLA | 主要变化 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **KV cache per token** | $n_h(d_k+d_v)$（常见为 $2n_h d_h$） | $d_c + d_h^R$ | **大幅减少**（DeepSeek-V3 约 $56.9\times$） | 推理核心收益：缓存的是 latent + 共享 RoPE Key |
| **训练激活（Q 侧核心表示）** | $n_h d_h$（需要保留/可重算的 Q 表示规模） | $d_c'$（保留 $\mathbf{c}^Q$ 并重算上投影） | **显著减少**（DeepSeek-V3 约 $16384/1536\approx 10.7\times$） | 具体节省取决于重算策略与 attention kernel |
| **注意力几何维度** | $d_h$ | $d_h+d_h^R$ | 略增 | logits/缩放依然基于最终拼接维度 |
| **KV 相关参数量** | $d\cdot n_h(d_h+d_v)$ | $d_cd + (n_h d_h)d_c + (n_h d_v)d_c + d_h^R d$ | **减少**（约 $11\times$） | 静态权重，与 $L$ 无关 |

核心洞察：MLA 的核心不是“把注意力点积维度整体降到 $d_c$”，而是通过低秩参数化与算子重排，把**随 $L$ 线性增长的 cache**从“完整 K/V”变成“latent + 小 RoPE 分量”，并在计算侧用吸收/融合尽量避免物化大张量；Query 压缩则主要服务训练激活与每步计算效率。

### 先降维再升维是否真的能减少显存和计算量？

这个问题的答案必须拆开说：**显存（尤其是推理 KV cache）几乎一定减少；但 FLOPs 未必减少，甚至可能增加。** MLA 的关键收益来自“带宽/访存”而不是“算术量”。

下面用 DeepSeek-V3 的典型配置做一个数量级估算（按乘法次数计，忽略常数与实现细节；并以解码单步、历史长度 $L=4096$ 为例）：
$$
d=7168,\; n_h=128,\; d_h=128,\; d_c=512,\; d_h^R=64,\; d_c'=1536
$$

1. **推理显存：KV cache 的缩减（这是确定的）**  
    标准 MHA（按 $d_k=d_v=d_h$ 的常见口径）每 token 缓存：
    $$
    2n_h d_h = 32768
    $$
    MLA 每 token 缓存：
    $$
    d_c + d_h^R = 576
    $$
    压缩比约 $32768/576\approx 56.9\times$。这意味着在“KV cache 主导”时，MLA 往往能显著扩大可用上下文长度或 batch 上限；但是否真的能“扩大 56.9 倍”还会受到其他显存项（如激活、框架开销、对齐/分页策略等）的约束。

2. **推理计算：FLOPs 可能增加**  
    直觉上，MLA 的历史交互在内容分量上是对 $d_c$ 做点积/加权，而标准 MHA 是对 $d_h$ 做点积/加权；在 DeepSeek-V3 的数值下 $d_c/d_h=4$，因此仅看“历史交互”这部分，MLA 的算术量通常会更大。
    
    更具体地，如果按“标准 MHA 缓存完整 K/V”作为 baseline，则其与历史交互（logits + 加权求和）的大致乘法次数是：
    $$
    \mathrm{MHA}_{L\text{-dep}} \approx 2L n_h d_h
    $$
    而 MLA 的对应部分（内容分量在 latent 空间，位置分量在 RoPE 空间）更接近：
    $$
    \mathrm{MLA}_{L\text{-dep}} \approx 2L n_h d_c \;+\; L n_h d_h^R
    $$
    注意：这里的 $L n_h d_h^R$ **不能省略**，因为在本文公式设定下 $\mathbf{q}_{t,i}^R$ 是按 head 生成的（每头要与共享的 $\mathbf{k}_j^R$ 做一次 $d_h^R$ 维点积），并不是“所有 head 共享同一个 $\mathbf{q}^R$”。
    
    代入 $L=4096$ 可得：
    - MHA 历史交互：$2\cdot 4096\cdot 128\cdot 128 \approx 1.34\times 10^8$
    - MLA 历史交互：$2\cdot 4096\cdot 128\cdot 512 + 4096\cdot 128\cdot 64 \approx 5.70\times 10^8$
    
    因此在长上下文下，MLA 的算术量确实可能高于“标准 MHA”口径。

> [!note] 关于“MLA 的 FLOPs 只多一点点”的口径差异
> 计算量对计数方式非常敏感。举例来说，Query 的 RoPE 分支并不是 $64\times d_c'$ 量级：由于 $W^{QR}\in\mathbb{R}^{(n_h d_h^R)\times d_c'}$，其矩阵乘规模是 $(n_h d_h^R)\times d_c'$，在本配置下约为 $8192\times 1536 \approx 1.26\times 10^7$ 次乘法；并且每个 head 还需要计算一次 $\mathbf{q}_{t,i}^R\cdot \mathbf{k}_j^R$（对应上面的 $L n_h d_h^R$ 项）。把这些都计入后，在 $L=4096$ 的条件下，MLA 解码单步的总乘法次数粗略落在 $7.6\times 10^8$ 量级，而该 baseline 的“标准 MHA”约为 $6.0\times 10^8$（约 +25%），具体比例仍会随实现的融合/重算策略变化。

3. **那为什么 MLA 仍可能更快？带宽瓶颈与 FlashMLA**  
    现代 GPU 在推理时的**解码**场景常常是**内存带宽受限**：每一步都要从 HBM 读取大量历史 KV。MLA 的关键优势是把“每个历史 token 需要读的数据量”从：
    $$
    \underbrace{n_h(d_k+d_v)}_{\text{标准 MHA，常见为 }2n_h d_h}
    $$
    降到：
    $$
    \underbrace{d_c + d_h^R}_{\text{MLA（latent + RoPE Key）}}
    $$
    在 DeepSeek-V3 的数字下，这正是约 $56.9\times$ 的 HBM 读流量缩减。即便 FLOPs 略高，**更小的 cache + 更规整的访问模式**往往能显著降低“等数据”的时间。

    **解码步的 HBM 读流量对比（以 FP16 为例）**：  
    - **标准 MHA**：每步需读取所有历史 token 的 Key/Value，字节数约为
      $$
      L \times (2n_h d_h) \times 2\text{ bytes}
      $$
      以 $L=4096,n_h=128,d_h=128$ 估算，约为 $4096\times 32768\times 2=268{,}435{,}456$ bytes（约 256 MiB，约 268 MB）。
    - **MLA**：每步读取历史 token 的 $\mathbf{c}^{KV}$ 与共享的 $\mathbf{k}^R$，字节数约为
      $$
      L \times (d_c + d_h^R) \times 2\text{ bytes}
      $$
      以 $L=4096,d_c=512,d_h^R=64$ 估算，约为 $4096\times 576\times 2=4{,}718{,}592$ bytes（约 4.5 MiB，约 4.7 MB）。
    
    读流量缩减约 $268/4.7\approx 57\times$，与 KV cache 压缩比一致。需要注意：这只是在对齐“历史 KV 读取”这一项的物理量级，不包含权重读取、输出写回、以及 kernel 内部的其他访存与算子开销。
    
    这也是 FlashMLA（以及类似的 MLA 解码 kernel）优化的核心出发点：  
    1. **不物化完整 K/V**：cache 只存 `ckv_cache`（$\mathbf{c}^{KV}$）与 `kpe_cache`（$\mathbf{k}^R$），历史侧只流式读取这两类小向量。  
    2. **矩阵吸收/重排**：把内容分量的 logits 与输出计算改写为“Query 侧先投影到 latent / latent 空间先加权再上投影”，减少大张量重建与写回（前文的等价式就是数学基础）。  
    3. **分块与在线 softmax**：沿着历史维度按块处理 KV（tile/split-KV），在线更新 softmax 归一化与累加结果，避免显式存 $L\times L$ 的中间矩阵，并提高数据复用。  
    4. **分页 KV cache（工程）**：用 block table 等结构支持变长序列与高效的 cache 管理，使实际部署更可控。

> [!note] 一个更稳妥的结论表述
> - “先降维再升维”对 **KV cache 显存** 的节省非常确定（MLA 的核心卖点）。  
> - 对 **FLOPs** 的影响取决于 $(d_c,d_h,d_h^R)$ 与实现（是否吸收/融合、kernel 是否带宽受限等），并不保证减少；在 DeepSeek-V3 这组数值下，历史交互的算术量通常会增大。  
> - FlashMLA 的意义在于把“以算换存”的设计变成高吞吐的 kernel：让额外算术尽量落在 Tensor Core / SRAM 友好的路径上，同时把 HBM 读写压到最低。

### 矩阵吸收及其在 MLA 实现中的应用

#### 1) 数学本质：结合律 + 转置

矩阵吸收（matrix absorption / weight folding）不是一种新算子，而是把一串**线性变换**用等价的方式重新结合（重排计算图），从而改变“什么时候、在哪个张量上、用哪条 GEMM/点积”去做同一件事。——其数学本质就是**矩阵乘法的结合律**和**转置**这种内积搬移的 trick。

它依赖的核心前提是：你要重排的那段计算子图是**纯线性**（中间没有 softmax/归一化/门控等非线性，或依赖数据的分支）；这些非线性是不能被“跨过去吸收”的。MLA 的吸收恰好发生在打分的点积结构与 Value 的线性加权结构两侧。在此前提下，你可以做两类常见的“吸收”：

1. **结合律：把两次线性变换折叠成一次**
    如果有
    $$
    y = A(Bx),
    $$
    那么可以离线预先算出
    $$
    C = AB,
    $$
    推理时直接做
    $$
    y = Cx.
    $$
    这就是把 $B$ “吸收到” $A$ 里（或反过来）。这在推理里很常见：例如把 LoRA/Adapter 等线性分支融合到主权重里，减少一次 GEMM。

> [!note] “可以随意换序”是不正确的
> 纯线性链条一般只允许**重新结合（re-associate）**，不能任意交换矩阵乘法顺序（除非满足可交换等额外条件）。MLA 里更常用的是下面的“内积搬移”，它并不是换序，而是利用转置把线性变换搬到点积的另一侧。

2. **内积搬移：把 Key 侧的线性变换搬到 Query 侧**
    注意力里最关键的一步是点积。如果 $k$ 不是原始缓存，而是压缩后的向量 $k=Wc$，则恒等式成立：
    $$
    q^\top (Wc) = (W^\top q)^\top c.
    $$
    含义很直观：你不一定要显式算出 $k=Wc$（把 Key 展开并物化成大张量，再参与后续点积）；而是可以先算 $q' = W^\top q$，再跟 $c$ 做内积。两者完全等价，但**计算/访存路径**不同。
    
    这第二种就是 MLA 解码里“吸收”的核心：它让历史侧只需要缓存/读取小维度的 latent vector（$\mathbf{c}^{KV}$），而不必把它展开成每个 head 的大维度 $k^C,v^C$ 才能算注意力。

#### 2) 工程落地：把“吸收”落在哪（融权重 vs. 融计算）

矩阵吸收在落地时常见有两种完全不同的目标函数：一种追求**减少运行时的 GEMM 次数**，另一种追求**避免物化/缓存某个大中间张量**。两者都源自上一节的线性代数恒等式，但优化对象不同。

- **A. 融权重（offline folding / 参数级融合）**：对应上一节的结合律。把一串固定的线性层（或线性分支）在**加载权重/部署前**就合成一个等价权重。典型例子是把 LoRA/Adapter 的线性更新折叠进主权重、或把连续的线性层 $y=A(Bx)$ 预先合成 $y=(AB)x$，从而推理时少一次 GEMM。
    这类做法的限制也很明确：如果权重是量化态（INT8/FP8 等）或需要特定缩放/分组，折叠可能要求先反量化再重量化，带来精度与工程复杂度问题；另外它主要影响“当前 token 的前向投影”，对“历史侧反复读取”的瓶颈帮助有限。

- **B. 融计算（on-the-fly re-parameterization / 计算图级重排）**：对应 transpose trick 与线性性质（把 $W$ 搬到点积另一侧、把 $W$ 推迟到加权求和之后）。它不一定减少 GEMM 次数，但能改变“算在哪个张量上”，从而**不显式物化**某些大张量。
    MLA 解码阶段用的就是这一类：历史侧缓存的是 $\mathbf{c}^{KV}$（以及小维度的 $\mathbf{k}^R$），计算时用 $\tilde{\mathbf{q}}=(W^{UK})^\top \mathbf{q}^C$ 与 $\mathbf{c}^{KV}$ 点积得到 logits，并在 latent 空间完成加权累加后再用 $W^{UV}$ 上投影得到输出。这里的关键不是少一次 GEMM，而是把“历史侧需要读/写的对象”压到最小。

在 MLA 的讨论里，基本都属于 **B（融计算）** 的范畴。这里关键的是**把计算图重排成等价形式**：利用 transpose trick 与线性性质，让解码时不必物化/缓存历史 token 的大 $\mathbf{k}^C,\mathbf{v}^C$ 张量，而是直接让历史侧只缓存/读取 $\mathbf{c}^{KV}$（外加很小的 $\mathbf{k}^R$）。

下面的推导与实现讨论都聚焦这种“在计算图里做吸收/重排”的用法。

#### 3) MLA 中怎么吸收？（数学层面）

下面只讨论 **内容分支**（不含 RoPE 分支）。回忆前文：
- 每个 token 缓存的是 $\mathbf{c}_\tau^{KV}\in\mathbb{R}^{d_c}$
- 第 $i$ 个 head 的内容 Key/Value 为
$$
\mathbf{k}_{\tau,i}^C = W^{UK}_i\mathbf{c}_\tau^{KV},\qquad
\mathbf{v}_{\tau,i}^C = W^{UV}_i\mathbf{c}_\tau^{KV},
$$
其中 $W^{UK}_i\in\mathbb{R}^{d_h\times d_c},\,W^{UV}_i\in\mathbb{R}^{d_v\times d_c}$（见前面对 $W^{UK},W^{UV}$ 的分块说明）。

1. **Key 吸收：把 $W^{UK}_i$ 从 Key 侧搬到 Query 侧**  
    内容分数（忽略 RoPE 拼接项）为：
    $$
    s_{t,i}(\tau)
    =
    (\mathbf{q}_{t,i}^C)^\top \mathbf{k}_{\tau,i}^C
    =
    (\mathbf{q}_{t,i}^C)^\top (W^{UK}_i\mathbf{c}_\tau^{KV}).
    $$
    用 transpose trick：
    $$
    (\mathbf{q}_{t,i}^C)^\top (W^{UK}_i\mathbf{c}_\tau^{KV})
    =
    \big((W^{UK}_i)^\top \mathbf{q}_{t,i}^C\big)^\top \mathbf{c}_\tau^{KV}.
    $$
    定义
    $$
    \tilde{\mathbf{q}}_{t,i}^C \triangleq (W^{UK}_i)^\top \mathbf{q}_{t,i}^C \in \mathbb{R}^{d_c},
    $$
    则
    $$
    s_{t,i}(\tau)= (\tilde{\mathbf{q}}_{t,i}^C)^\top \mathbf{c}_\tau^{KV}.
    $$
    效果：历史侧不需要读/存 $\mathbf{k}_{\tau,i}^C$，只需读 $\mathbf{c}_\tau^{KV}$。
    
    进一步，如果 $\mathbf{q}_{t,i}^C$ 本身来自 $\mathbf{c}_t^Q$ 的上投影（$\mathbf{q}_{t,i}^C=W^{UQ}_i\mathbf{c}_t^Q$），那么还可以把两步线性变换继续结合：
    $$
    \tilde{\mathbf{q}}_{t,i}^C = (W^{UK}_i)^\top W^{UQ}_i\, \mathbf{c}_t^Q,
    $$
    这也是很多实现里所谓“把 $W^{UQ}$ 吸收到 $W^{UK}$（或反过来）”的来源：本质仍是线性重排。

**(2) Value 吸收：把 $W^{UV}_i$ 推迟到加权求和之后**  
    每个头的输出 $\mathbf{o}_{t,i}^{C}$ 由注意力权重 $\alpha_{t,i}$ 对 Value 加权求和得到：
    $$
    \mathbf{o}_{t,i}^C
    =
    \sum_{\tau\le t}\alpha_{t,i}(\tau)\mathbf{v}_{\tau,i}^C
    =
    \sum_{\tau\le t}\alpha_{t,i}(\tau)\, (W^{UV}_i\mathbf{c}_\tau^{KV}).
    $$
    利用线性性质把 $W^{UV}_i$ 提到求和外：
    $$
    \mathbf{o}_{t,i}^C
    =
    W^{UV}_i\!\left(\sum_{\tau\le t}\alpha_{t,i}(\tau)\mathbf{c}_\tau^{KV}\right).
    $$
    定义
    $$
    \mathbf{m}_{t,i}\triangleq \sum_{\tau\le t}\alpha_{t,i}(\tau)\mathbf{c}_\tau^{KV}\in\mathbb{R}^{d_c},
    $$
    则
    $$
    \mathbf{o}_{t,i}^C = W^{UV}_i\, \mathbf{m}_{t,i}.
    $$
    效果：历史侧同样只需要读 $\mathbf{c}_\tau^{KV}$ 做加权累加，最后才做一次 $d_c\to d_v$ 的上投影。

把两步合起来就能看出：注意力对历史序列的**被访问对象从 $(\mathbf{k}^C_{\tau,i}, \mathbf{v}^C_{\tau,i})$ 变成了单个 $\mathbf{c}_\tau^{KV}$（外加 RoPE 的小分量）**，这才是 MLA 在系统层面能兑现 KV cache/HBM 带宽收益的关键。

#### 4) RoPE 解耦分支在吸收里怎么处理？

MLA 的 Key 实际是拼接 $[\mathbf{k}^C_{\tau,i}; \mathbf{k}_\tau^R]$，其中 $\mathbf{k}_\tau^R$ 是跨 head 共享的小维度且要施加 RoPE。这一段通常保持为“独立的 RoPE 分支”，原因是：
1. $\mathbf{k}_\tau^R$ 本来就小，缓存它成本低；
2. RoPE 的旋转与位置索引相关，不是一个可以预先折叠成常量的矩阵乘。

因此 MLA 的吸收主要发生在内容分支的 $W^{UK}_i、W^{UV}_i$ 上；RoPE 分支则以
$$
(\mathbf{q}_{t,i}^R)^\top \mathbf{k}_\tau^R
$$
的形式直接贡献位置项分数（在本文的公式设定下，$\mathbf{q}_{t,i}^R$ 是按 head 生成的，因此每个 head 都要计算一次该点积）。

#### 5) “训练时 MHA、推理时 MQA”这句话怎么理解？

在 DeepSeek V3.2 的技术报告和一些博客讨论中[^2][^3][^4]，常常将 MLA 在不同场景下的应用描述为：训练时 MHA、推理时 MQA。
![[DeepSeek-MLA-Principle-MHA-MQA-mode.png]]
这句话更像是一种**实现侧的类比**：这里的 “MHA/MQA” 不是在说模型的注意力机制真的换成了另一套方案，而是在说 **不同阶段的计算形态与缓存形态更像哪一种**。

首先澄清一下三个概念及其特点：
- **MHA（Multi-Head Attention）**：每个头有独立的 Query、Key、Value 投影矩阵，计算时每个头的 Key 和 Value 是独立的，表达能力最强。
- **MQA（Multi-Query Attention）**：所有头共享同一组 Key 和 Value 投影矩阵，因此 KV Cache 只需存一份，但表达能力受限。
- **MLA（Multi-head Latent Attention）**：通过低秩压缩，每个头仍有独立的 Key/Value 上投影矩阵（$W_{i}^{UV},W_{i}^{UK}$），但 KV Cache 只存共享的潜在向量 $c_{t}^{KV}$ ​。

其次，我们需要明确这两个“模式”在 MLA 的语境中究竟指的什么：

| 模式         | 对应阶段                       | 核心计算特征                                                                                                                                                          | 缓存内容                                                                                                                   |
| :--------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **MHA 模式** | 训练（Training）& 预填充（Prefill） | 计算上更接近“按 head 展开”的多头注意力：显式重建每个头的 $\mathbf{k}_{t,i}^C,\mathbf{v}_{t,i}^C$ 后做标准 MHA 计算（算术更省，吞吐更高）                                                                 | 训练：不维护解码 KV cache；Prefill：会把 $\mathbf{c}_t^{KV},\mathbf{k}_t^R$ 写入 cache 供后续 decode，但 prefill 内部不会像 decode 那样每步反复读取长历史 |
| **MQA 模式** | 解码（Decoding）               | 通过矩阵吸收/重排，在 latent 空间完成“当前 query ↔ 历史 token”的交互；历史侧只读所有头共享的 $\mathbf{c}_\tau^{KV}$（外加 $\mathbf{k}_\tau^R$），避免物化历史 $\mathbf{k}_{\tau,i}^C,\mathbf{v}_{\tau,i}^C$ | 压缩后的向量 $\mathbf{c}_\tau^{KV}$ + 共享的位置信息 $\mathbf{k}_\tau^R$                                                            |

 MLA 向不同模式切换之所以能够实现，完全依赖于**矩阵吸收**：同一个注意力在数学上有两条等价计算路径，训练/Prefill 更倾向走“展开式”（类 MHA），Decode 必须走“吸收式”（类 MQA），这样就实现了**训练时保留 MHA 的表达能力，推理时享受 MQA 的缓存效率**的理想效果。

我们之前已经讨论过，这两条路径只是计算顺序不同：

- **展开式（类 MHA）**：
    训练/prefill 中严格按照定义式计算，先显式重建 KV—— $\mathbf{k}_{\tau,i}^C=W^{UK}_i\mathbf{c}_\tau^{KV}$、$\mathbf{v}_{\tau,i}^{C} = \mathbf{c}_{\tau}^{KV} W_{i}^{UV}$，再算每个头的注意力分数后拼接
    $$
    s_{t,i}(\tau)=(\mathbf{q}_{t,i}^C)^\top \mathbf{k}_{\tau,i}^C.
    $$
    整个过程中每个头都有自己独立的 Key 和 Value，这就是 MHA 的核心特征。

- **吸收式（类 MQA）**：
    解码阶段，为了利用 KV cache，就要改变计算顺序，把 $W^{UK}_i$ 搬到 Query 侧，先算 $\tilde{\mathbf{q}}_{t,i}^C=(W^{UK}_i)^\top \mathbf{q}_{t,i}^C$，再算
    $$
    s_{t,i}(\tau)=(\tilde{\mathbf{q}}_{t,i}^C)^\top \mathbf{c}_\tau^{KV}.
    $$
    于是，计算分数时，不再需要为每个历史 token $j$ 重建完整的 $\mathbf{k}_{j,i}^C$，只需要读取缓存的 $\mathbf{c}_j^{KV}$ 并与 $\tilde{\mathbf{q}}_{t,i}^C$ 点积。**$W_i^{UK}$ 被成功“吸收”到了 Query 侧**。此时，所有头的 $\mathbf{c}_j^{KV}$ 都是共享的，缓存形式与 MQA 完全一致。
    Value 侧同理：先在 latent 空间做加权累加 $\mathbf{m}_{t,i}=\sum_\tau \alpha_{t,i}(\tau)\mathbf{c}_\tau^{KV}$，最后再做一次上投影得到 $\mathbf{o}_{t,i}^C=W^{UV}_i\mathbf{m}_{t,i}$，回到原始维度。$W_i^{UV}$ 被“吸收”到了输出侧，避免了为每个历史 token 重建 Value 的巨大开销。

因此，从“缓存对象”看，Decode 阶段 MLA 的 cache/token 形态确实很像 MQA（历史侧共享一份表示，而不是每个 head 一份）；但从“表达能力/参数化”看，MLA 依然保留每个 head 自己的 $W^{UK}_i,W^{UV}_i$，并没有像 MQA 那样把 KV 投影彻底共享成一套参数。

> [!note] 为什么还需要“解耦 RoPE”？
> 上面的吸收恒等式依赖于“内容分支是纯线性链条”：$\mathbf{k}_{\tau,i}^C=W^{UK}_i\mathbf{c}_\tau^{KV}$。而 RoPE 是一个与位置相关的、非线性的旋转操作。如果把位置相关的 RoPE 直接施加到这条内容路径上，打分会变成
> $$
> (\mathbf{q}_{t,i}^C)^\top R_t^\top R_\tau W^{UK}_i\mathbf{c}_\tau^{KV},
> $$
> 其中 $R_t^\top R_\tau$ 随 $\tau$ 变化，导致你无法先算一个与 $\tau$ 无关的 $(W^{UK}_i)^\top\mathbf{q}_{t,i}^C$ 再对所有历史 token 复用。MLA 的解决方案正是之前笔记里详细分析的 **“解耦”**：把 Key 拆成两部分——不包含位置信息、可以自由吸收的内容部分 $\mathbf{k}_{t,i}^C$，和一个专门负责携带 RoPE 位置信息的共享解耦键 $\mathbf{k}_t^R$。这样，内容部分依然可以完美执行矩阵吸收，而位置信息则通过另一条轻量级路径独立传递。

#### 6) Prefill vs. Decode：矩阵吸收的动机差异

这一节通过计算量这一角度来判断 Prefill/Decode 中选择矩阵吸收的差异。

**Prefill（处理整段 prompt）**  
这阶段更像“矩阵-矩阵”的问题：你要一次性计算长度 $L$ 的整段注意力（通常会用 FlashAttention 类 kernel 来避免物化 $L\times L$ 中间矩阵）。在这个阶段，“是否做吸收”的关键不在于 cache（prefill 还没有很长的历史 cache），而在于**算术量（尤其是 $L^2$ 项）**。

下面用 DeepSeek-V3 的典型配置解释为什么很多实现会在 prefill 阶段**倾向于不走吸收路径**（而把吸收留给 decode）：

**核心对比：注意力的 $L^2$ 项**  
prefill 的主要计算量来自两件事：计算 logits（$QK^\top$）与对 Value 做加权求和（$\alpha V$）。把“内容分支 + RoPE 分支”的维度写出来：

| $L^2$ 级别计算项 | 非吸收（先重建 $\mathbf{k}^C,\mathbf{v}^C$） | 吸收（在 latent 空间交互） |
| :--- | :--- | :--- |
| 内容 logits | $L^2\cdot n_h\cdot d_h$ | $L^2\cdot n_h\cdot d_c$ |
| RoPE logits | $L^2\cdot n_h\cdot d_h^R$ | 相同：$L^2\cdot n_h\cdot d_h^R$ |
| Value 加权和 | $L^2\cdot n_h\cdot d_v$ | 若在 latent 累加：$L^2\cdot n_h\cdot d_c$（再加 $O(L\cdot n_h\cdot d_v d_c)$ 的一次性上投影） |

代入 DeepSeek-V3：$d_h=128,\ d_v=128,\ d_c=512,\ d_h^R=64$：
- logits 的 $L^2$ 系数：非吸收为 $n_h(d_h+d_h^R)=n_h\cdot 192$；吸收为 $n_h(d_c+d_h^R)=n_h\cdot 576$，约 **3 倍**。
- 若把 Value 加权和也一并考虑，则 $L^2$ 系数从 $n_h(d_h+d_h^R+d_v)=n_h\cdot 320$ 变为 $n_h(d_c+d_h^R+d_c)=n_h\cdot 1088$，约 **3.4 倍**。

因此在 $L$ 较大（例如 2K/4K）的 prefill 阶段，仅从 FLOPs 角度看，吸收路径往往会更“贵”。而 $O(L)$ 级别的预处理（例如显式重建 $\mathbf{k}^C,\mathbf{v}^C$ 或计算 $\tilde{\mathbf{q}}$）相对 $L^2$ 主项通常不是决定性因素。

> [!note] 这不是说 prefill “绝对不能吸收”
> 如果你的 kernel 可以从 latent 直接做计算并显著减少中间张量/访存（例如 fused/FlashMLA 风格），那么在某些硬件与 batch/并行设置下仍可能选择吸收式实现；但对 DeepSeek-V3 这组维度，prefill 的动机通常更偏向“算术更省”的非吸收路径。

**Decode（逐 token 自回归生成）**  
这阶段每一步都要与所有历史 token 交互，历史长度逐步增长，导致“每步历史读取”线性上升。此时是否做吸收几乎是决定性的：  
- 如果你缓存/读取的是每个 head 的 $\mathbf{k}^C_{\tau,i},\mathbf{v}^C_{\tau,i}$，那么每步历史读流量是 $O(L\cdot n_h d_h)$；  
- 而 MLA + 吸收让历史侧只读 $O(L\cdot d_c)$（再加 $O(L\cdot d_h^R)$ 的小项），这正是前面 HBM 读流量量化（约 $57\times$）能够成立的前提。

| 阶段          | Prefill      | Decode       |
|-------------|--------------|--------------|
| 输入长度        | 长（prompt）    | 短（1 token）   |
| KV cache 长度 | 0            | 长（累积）        |
| 瓶颈类型        | 计算密集型        | 访存密集型        |
| 采用模式        | 类MHA（非吸收）    | 类MQA（吸收后）    |
| 核心收益        | 利用高性能 kernel | 57倍 HBM 读取减少 |
| 是否使用吸收      | 通常 ❌（视 kernel） | 通常 ✅          |

> [!note] 动态选择（实现相关）
> 一些推理引擎会根据“当前 prefill 的 query 长度”和“已有 cache 长度”等条件，动态选择更合适的实现路径（更偏向展开式还是吸收式）。具体切换条件与常数项强相关，应以实际 kernel/框架实现为准。

### MLA 对训练场景的意义

我们前面更多讨论的是 MLA 在**推理解码**阶段对 KV cache 的压缩。但在**训练**阶段（一次前向会同时计算整段序列，通常不会维护随 decode step 增长的 KV cache），MLA 依然有意义，只是收益点从“KV cache per token”转向了**训练激活内存、参数/优化器状态、以及与 kernel/重计算策略的协同**。

1) **核心认知**：训练不存“解码 KV cache”，但要为反向传播付出显存
    训练时确实不需要像推理那样把历史 K/V 按 token 追加到 cache 里供未来 step 复用；但为了反向传播，仍然需要保存（或可重算）大量中间量（activations）。这些激活值的规模与序列长度 $L$、batch size、并行策略和 attention kernel 实现强相关，往往才是训练的显存瓶颈。
    
    MLA 的低秩结构提供了一种更“便宜”的保存方式：与其持久化地存下高维 $Q/K/V$（或它们的关键中间量），可以保存更低维的 latent（如 $\mathbf{c}^{KV},\mathbf{c}^{Q}$），并在反向中重算 up-projection / RoPE 分支（DeepSeek-V3 的实现也提到会在反向传播中重算 RMSNorm 与 MLA up-projections，以减少需要持久化存储的激活）。

#### 训练视角下的低秩压缩：参数、梯度、优化器与激活

前面我们更多从“前向算子形态/激活保存”解释训练收益。这里补上一个**反向传播**视角：低秩压缩不仅影响前向的张量形状，也会影响训练时的**参数量、梯度张量与优化器状态**，并且让“存 latent + 反向重算”更自然。

##### 1) 参数量：低秩分解如何减少可训练参数

以 KV 的内容分支为例，标准 MHA 往往是两张大矩阵：
- $W_K, W_V \in \mathbb{R}^{(n_h d_h)\times d}$（注意这里按本文前文约定：$\mathbf{k}=W_K\mathbf{h}$，即左乘）

MLA 则用低秩分解替代：
- $W^{DKV}\in\mathbb{R}^{d_c\times d}$，先得到 $\mathbf{c}^{KV}\in\mathbb{R}^{d_c}$
- $W^{UK},W^{UV}\in\mathbb{R}^{(n_h d_h)\times d_c}$，再重建每头的 $\mathbf{k}^C,\mathbf{v}^C$

因此 KV 内容分支参数量从
$$
2\cdot (n_h d_h)\cdot d
$$
变为
$$
d_c d + 2\cdot (n_h d_h)\cdot d_c.
$$

代入 DeepSeek-V3：$d=7168,\ n_h d_h=16384,\ d_c=512$：
- 标准 MHA：$2\times 16384\times 7168 \approx 235\text{M}$
- MLA（仅 KV 内容分支）：$512\times 7168 + 2\times 16384\times 512 \approx 3.67\text{M}+16.78\text{M}=20.45\text{M}$

参数减少约 $235/20.45\approx 11.5\times$。需要注意：完整的 MLA 还包含 RoPE 解耦分支（如 $W^{KR}$）与 Query 侧的低秩分解（$W^{DQ},W^{UQ},W^{QR}$），这里只是在对齐“KV 内容投影”的核心差异。

这个减少会带来两个直接的“训练显存收益”（与序列长度无关，但与训练并行/优化器实现相关）：
- **梯度张量**：梯度与参数同形状，参数变少通常意味着梯度张量也变少（若使用 ZeRO/分片，收益会体现在通信与分片规模上）。
- **优化器状态**：以 Adam/AdamW 为例，常见实现会为每个参数维护一阶/二阶动量，状态量级通常与参数量线性相关，因此也会随低秩分解同比例下降。

##### 2) 反向传播：$\mathbf{c}^{KV}$ 作为链式法则的“枢纽”

KV 内容分支的前向（按本文符号）是：
$$
\mathbf{c}_t^{KV} = W^{DKV}\mathbf{h}_t,\quad
\mathbf{k}_{t,i}^C = W^{UK}_i\mathbf{c}_t^{KV},\quad
\mathbf{v}_{t,i}^C = W^{UV}_i\mathbf{c}_t^{KV}.
$$

在反向里，$\mathbf{c}_t^{KV}$ 会汇集来自两条路径的梯度贡献：
- 来自 **Value 聚合** 的 $\frac{\partial \mathcal{L}}{\partial \mathbf{v}_{t,i}^C}$
- 来自 **logits/softmax** 的 $\frac{\partial \mathcal{L}}{\partial \mathbf{k}_{t,i}^C}$（以及间接影响 $\alpha$ 的路径）

因此对 $\mathbf{c}_t^{KV}$ 的梯度可以写成形如（省略与 softmax/attention 细节相关的展开）：
$$
\frac{\partial \mathcal{L}}{\partial \mathbf{c}_t^{KV}}
=
\sum_{i=1}^{n_h}(W^{UV}_i)^\top \frac{\partial \mathcal{L}}{\partial \mathbf{v}_{t,i}^C}
\;+\;
\sum_{i=1}^{n_h}(W^{UK}_i)^\top \frac{\partial \mathcal{L}}{\partial \mathbf{k}_{t,i}^C}.
$$

随后梯度再通过下投影回到输入：
$$
\frac{\partial \mathcal{L}}{\partial \mathbf{h}_t} = (W^{DKV})^\top \frac{\partial \mathcal{L}}{\partial \mathbf{c}_t^{KV}}.
$$

直观理解：$\mathbf{c}_t^{KV}$ 是一个把“多头、多位置的注意力梯度”汇聚到低维瓶颈的节点。这并不意味着训练一定更快（算术量未必下降），但它解释了为什么 **“存一个低维 latent” 可以覆盖反向所需的关键信息**：所有 head 对 KV 的依赖都会通过同一个 $\mathbf{c}_t^{KV}$ 汇总回来。

##### 3) 激活保存：重计算（recomputation）为什么和 MLA 很“搭”

训练时显存往往被 activations 主导。若不做优化，你可能需要长期保存（或可重算）大量中间表示（例如每头的 $\mathbf{q},\mathbf{k},\mathbf{v}$，以及 attention kernel 需要的若干中间量）。

MLA 与激活重计算的协同点在于：**可把“必须长期保存的表示”尽量降到 latent 维度**。一种常见策略是：
- 前向只保存 $\mathbf{c}^{KV}$、$\mathbf{c}^{Q}$，以及小维度的 $\mathbf{k}^R$（和实现相关的少量额外元数据）
- 反向需要用到 $\mathbf{k}_{t,i}^C,\mathbf{v}_{t,i}^C$ 或 $\mathbf{q}_{t,i}^C$ 时，再从保存的 latent 通过上投影重算

这与 DeepSeek-V3 报告里“反向重算 RMSNorm 与 MLA up-projections”的描述是一致的：
> *We recompute all RMSNorm operations and MLA up-projections during back-propagation, thereby eliminating the need to persistently store their output activations.*

##### 4) 一个“每层每 token”视角的粗量级对齐（实现相关）

如果采用“存 latent + 反向重算上投影”的策略，那么每层每 token 需要长期保存的**核心表示**可以粗略对齐为：
- MLA：$d_c + d_h^R + d_c'$（对应 $\mathbf{c}^{KV},\mathbf{k}^R,\mathbf{c}^Q$）
- DeepSeek-V3 数值：$512 + 64 + 1536 = 2112$

对比标准 MHA 常见会长期保存（或在反向中可重算）的核心表示，至少包含 $Q/K/V$ 的某种形式（其量级通常与 $n_h d_h$ 成正比）。如果仅以“每 token 的 $Q$ 宽度”作一个最保守的参照，则是 $n_h d_h=16384$；若以 $Q+K+V$ 三者合计作参照，则是 $3n_h d_h=49152$。因此 $2112$ 相比这些量级确实显著更小。

> [!note] 口径提醒：训练显存高度依赖 kernel
> 训练显存是否由“Q/K/V 激活”主导、以及这些激活是否能被重算替代，强依赖 attention kernel（是否物化 $L\times L$ 中间量、是否保存 logsumexp/softmax 归一化所需中间量、是否 checkpoint）。因此这里把它当作“解释为什么 MLA 有空间节省激活”的直观量级对齐，而不是通用的精确显存账本。

##### 5) 小结：训练阶段 MLA 的“隐性收益”

从训练（含反向）看，低秩压缩的收益可以归纳为四类（与前文的训练总结互补）：
1. **参数/梯度/优化器状态**：低秩分解直接减少 KV（以及部分 Q）侧投影参数，连带减少梯度与优化器状态规模。
2. **激活保存更便宜**：把“必须长期保存的核心表示”下沉到 latent（$\mathbf{c}^{KV},\mathbf{c}^{Q}$）上，配合重算减少大张量持久化。
3. **反向传播更易重算**：上投影是纯线性层，重算开销可控，且天然适合与 fused kernel 搭配。
4. **收益条件明确**：当训练瓶颈由注意力相关 activations 主导、并采用重算/高效 kernel 时，MLA 的优势更容易兑现；否则收益可能被其他瓶颈掩盖。

2) **训练阶段的三个主要收益**：
    1. **激活内存**：把“需要保留的核心表示”换成 latent（并配合重计算）
    以 DeepSeek-V3 的典型配置（$n_h=128,d_h=128,d_c=512,d_c'=1536,d_h^R=64$）为例，如果采用“保存 latent、反向重算上投影”的策略，那么每层每 token 的“核心可保存表示”可以粗略对齐为：
    $$
    \begin{array}{cccc}
    \hline
    \text{对象（每层每 token）} & \text{标准 MHA（常见做法）} & \text{MLA（保存 latent）} & \text{数量级变化} \\
    \hline
    \text{Key/Value 的内容信息} &
    n_h d_h\ \text{（各一份）} &
    d_c\ \text{（保存 } \mathbf{c}^{KV} \text{ 一份）} &
    \approx 32 \times\ \text{更小} \\
    
    \text{Query 的核心表示} &
    n_h d_h &
    d_c'\ \text{（保存 } \mathbf{c}^{Q} \text{）} &
    \approx 10.7 \times\ \text{更小} \\
    
    \hline
    \end{array}
    $$
    前向计算仍会在某个阶段得到最终用于注意力的 $\mathbf{q}_{t,i},\mathbf{k}_{j,i},\mathbf{v}_{j,i}$（例如每头维度 $d_h+d_h^R$ 的 Q/K，以及 $d_v$ 的 V）。收益来自：这些量**不一定要作为激活长期保存**——可以通过重计算与 kernel 融合，把“该存的大量激活”替换成“存 latent + 反向重算”。
    
    另外一个关键点是：训练时 $L\times L$ 级别的 logits/softmax 中间量是否被**物化**，会极大影响显存与带宽；FlashAttention/FlashMLA 这类 kernel 的价值在于减少这类中间量的显存/访存开销。MLA 本身不改变注意力的几何维度（每头仍是 $d_h+d_h^R$），但它能显著降低 Q/K/V 相关的激活与重算成本，从而更容易把训练做成“算力密集”而不是“显存受限”。
    
    2. **参数/优化器状态**：低秩参数化降低 KV 相关权重规模
    我们在上文已经单独比较了 KV 相关参数量：MLA 用低秩分解显著减少了 KV 侧的投影参数。训练时这不仅减少参数显存，也往往会连带减少优化器状态（例如 Adam/AdamW 的动量/方差）与梯度相关的开销（它们通常与参数量线性相关）。
    
    3. **吞吐与稳定性**：收益取决于瓶颈（带宽 vs. 算术）与实现
    训练是否“更快”并没有一条必然结论：MLA 引入了额外的下投影/上投影与重计算，但也降低了激活保存与带宽压力，并为 kernel 融合创造空间。工程上常见的组合是：
    - **激活重计算**（减少保存，增加反向算术）
    - **更强的 attention kernel**（在线 softmax、分块、减少中间量）
    - **混合精度**（如 FP16/BF16/FP8）与缩放策略（在相同显存预算下换更大 batch / 更长 $L$）
    
    至于“低秩约束是否带来正则化/泛化收益”，这更偏经验现象：可以把它理解为一种结构性归纳偏置（information bottleneck 的味道），但是否成立取决于任务、超参与训练配方，通常需要实证支持。

3) **定长训练 vs. 变长推理**：差异在“主导的随长度增长项”
    **MLA 在定长训练和变长推理中都有收益，且收益都随序列长度增加而放大**。区别在于主导瓶颈不同：
    - **训练时（定长）**：当显存瓶颈主要由注意力相关激活（如 Q/K/V 中间表示）主导，且采用激活重计算策略时，MLA 使得需要持久化保存的核心表示从 $O(n_h d_h)$ 降至 $O(d_c)$（KV）与 $O(d_c')$（Q），从而显著降低激活内存随 $L$ 增长的斜率。当然实际收益还取决于 kernel 实现（例如是否物化 $L\times L$ 注意力矩阵）与并行策略。
    - **推理时（变长）**：主导瓶颈是 KV cache 与内存带宽；MLA 把每 token 的 cache 从 $O(n_h d_h)$ 量级压到 $d_c+d_h^R$，使长上下文推理与高吞吐解码更可行。

因此可以这样总结：**训练阶段 MLA 的价值主要体现在激活与工程实现（重计算 + kernel）上；推理阶段 MLA 的价值主要体现在 KV cache 与带宽上。** 两者都与长度相关，但瓶颈主导项不同。

### MLA 对比 GQA 的优势及归因

> 参考资料：苏剑林 [《缓存与效果的极限拉扯：从MHA、MQA、GQA到MLA》](https://spaces.ac.cn/archives/10091)。
> 下文记作“苏神博客”。

结论先行：三者都在优化**推理时 KV cache**，但采取的约束不同，导致“压缩率 vs. 表达能力”落点不同。

为便于统一对比，先约定符号：
- head 数：$n_h$
- 每头 Key/Value 维度：$d_k,d_v$（DeepSeek-V3 常见为 $d_k=d_v=128$，并额外拼接 RoPE 分量 $d_h^R=64$）
- GQA 的分组数：$g$（每组共享一份 KV）
- MLA 的 KV latent 维度：$d_c$（对应 `kv_lora_rank`）

1) 三种方法分别“共享/压缩”了什么？
    **(a) MQA：所有 head 共享同一份 KV（最激进的共享）**  
    在苏神博客的记法里：
    $$
    K_i = X_i W_k,\qquad V_i = X_i W_v
    $$
    即所有 head 都用同一组 $W_k,W_v$。因此 KV cache 的量级从 $n_h(d_k+d_v)$ 降为：
    $$
    \mathrm{cache/token} \approx (d_k+d_v)
    $$
    优点是 cache 最小；代价是 **KV 表达被强共享约束**，可能损伤模型效果（实践上通常靠更大模型/更强训练配方来弥补）。
    
    **(b) GQA：把 head 分成 $g$ 组，组内共享 KV（平滑折中）**  
    苏神博客写作：
    $$
    K_i = X_i W_k,\qquad V_i = X_i W_v,\qquad W_k\in\mathbb{R}^{d\times g d_k},\; W_v\in\mathbb{R}^{d\times g d_v}
    $$
    可理解为：每个 token 只需要缓存 $g$ 份 KV，于是：
    $$
    \mathrm{cache/token} \approx g(d_k+d_v)
    $$
    当 $g=n_h$ 时退化为标准 MHA，当 $g=1$ 时退化为 MQA。
    
    **(c) MLA：不做“硬共享”，而是把 KV 映射到低维 latent，再按 head 线性重建（低秩约束）**  
    苏神博客把 GQA 进一步改写成：
    $$
    K_i = C_i W_k,\qquad V_i = C_i W_v,\qquad C_i = [X_iW_{k0},X_iW_{v0}]
    $$
    并提出用一个更低维的 $C_i\in\mathbb{R}^{d_c}$ 替代“拼起来的 KV”，令：
    $$
    K_i = C_i W_k,\qquad V_i = C_i W_v,\qquad C_i = X_iW_c
    $$
    这等价于把 KV 的自由度限制在 $d_c$ 维 latent 空间（低秩/低维流形），然后用 $W_k,W_v$（按 head 切片）重建出“每头不同”的 $K,V$。

2) **为什么说 MLA 在“效果-压缩”上比 MQA/GQA 更灵活**？
    MQA/GQA 的约束是“共享”（共享得越多，KV 越缺少 head-specific 的表达）。  
    MLA 的约束是“低秩”（允许每个 head 仍然拥有不同的 $W_k,W_v$，差异由这些上投影矩阵承载；共享的只是低维 latent $C_i$）。
    直观上：
    - MQA/GQA 是“**减少 KV 的份数**”（从 $n_h$ 份变成 $g$ 份）
    - MLA 是“**每份 KV 都很小**”（把内容信息压到 $d_c$ 维 latent，再重建）

3) **计算侧的关键：矩阵吸收/算子重排，让解码不必显式重建历史 K/V**
    如果直接“先算 $K_i,V_i$ 再做注意力”，MLA 反而可能更慢。苏神博客给出的关键技巧是把注意力写成等价形式（可理解为把 $W_k,W_v$ 吸收到 Query 侧或输出侧）：
    $$
    \mathrm{softmax}(QK^\top)V
    =
    \mathrm{softmax}\big((QW_k^\top)C^\top\big)(CW_v)
    $$
    于是历史侧只需要 cache 低维的 $C$（对应本文的 $\mathbf{c}^{KV}$），而不是 cache/物化高维的 $K,V$。这与我们前面讨论的“在 latent 空间做点积/加权、最后再上投影”的推导是一致的，也是 FlashMLA 这类 kernel 能做高吞吐的数学基础。

4) 与 RoPE 的关系：**MLA 通过解耦把“位置分量”从 KV latent 路径里拿出来**
    如果把 RoPE 直接作用在“内容 Key”上，会破坏上述吸收/融合的优化空间。DeepSeek 的 MLA 用解耦 RoPE 分量 $\mathbf{k}^R$（跨 head 共享）把“位置”与“内容”拆开：
    - 内容：$\mathbf{c}^{KV}$ 负责（可极致压缩、可吸收）
    - 位置：$\mathbf{k}^R$ 负责（维度小、共享、独立 RoPE）

> [!note] MLA 并不一定比 MQA “更省 cache”
> 以 DeepSeek-V3 为例，标准 MHA 的 cache/token 约为 $2n_h d_h=32768$；MLA 约为 $d_c+d_h^R=512+64=576$（约 $56.9\times$ 压缩）；但若用 MQA（共享一份 KV）且 $d_k=d_v=128$，则 cache/token 约为 $256$，理论上仍小于 $576$。  
> MLA 的优势更多体现在：在**大幅压缩**的同时，仍能通过按 head 的上投影保留更接近 MHA 的表达能力与效果稳定性。

$$
\begin{array}{cccc}
\hline
\text{方法} & \text{核心手段} & \text{cache/token 量级} & \text{典型代价} \\
\hline
\text{MQA} &
\text{全 head 共享 KV} &
(d_k + d_v) &
\text{KV 表达受强共享约束} \\

\text{GQA} &
g \text{ 组共享 KV} &
g(d_k + d_v) &
\text{共享约束变弱但仍存在} \\

\text{MLA} &
\text{KV latent 低秩 + 吸收/融合} &
(d_c + d_h^R)\ \text{(DeepSeek-V3)} &
\text{FLOPs 可能增加，依赖 kernel 兑现带宽优势} \\

\hline
\end{array}
$$

# Footnotes

[^1]: 在标准 MHA 中，嵌入维度、模型维度、每个注意头维度 x 注意头数量三者在数值上相等。但在 MLA 中，这个关系不再成立，具体请看下文。
[^2]: Transformer 作者团队开源 DroPE，将如何影响大模型长上下文能力？ - [4567 的回答 - 知乎](https://www.zhihu.com/question/1994493166221554651/answer/1997309968697804786)
[^3]: [DeepSeek MLA 核心揭秘：如何实现 MHA 到 MQA 的无缝切换](https://blog.csdn.net/kebijuelun/article/details/155820286)
[^4]: [缓存与效果的极限拉扯：从 MHA、MQA、GQA 到 MLA](https://spaces.ac.cn/archives/10091)
