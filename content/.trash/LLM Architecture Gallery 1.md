---
title: "LLM Architecture Gallery"
author:
  - "[[Sebastian Raschka]]"
published:
date: "2026-03-31T21:14:38+08:00"
description: "A gallery that collects architecture figures from The Big LLM Architecture Comparison and related articles, with fact sheets and links back to the original sections."
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：https://sebastianraschka.com/llm-architecture-gallery/

Last updated: March 15, 2026

This page collects architecture figures and fact sheets from [The Big LLM Architecture Comparison](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison) and [A Dream of Spring for Open-Weight LLMs](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight). It focuses on the architecture panels only. Click a figure to enlarge it and use the model title to jump to the corresponding article section.

If you spot an inaccurate fact sheet, mislabeled architecture, or broken link, please file an issue here: [Architecture Gallery issue tracker](https://github.com/rasbt/LLMs-from-scratch/issues/new?labels=architecture-gallery&title=Architecture%20Gallery%3A%20).

Upon popular request, you can now also get this as a physical poster via [Redbubble](https://www.redbubble.com/i/poster/LLM-Architecture-Gallery-by-Ahead-of-AI/179274487/flk2) and [Zazzle](https://www.zazzle.com/llm_architecture_gallery_poster-256467233163163206). The preview there may look a bit low-resolution, but the upload is based on a fresh high-resolution export at 14570 x 12490 pixels (a 56 MB PNG file with 182 megapixels). I just ordered one myself but please be aware that I haven't been able to verify the quality, yet.

### Llama 3 8B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A723-olmo-2-summary) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/07_gpt_to_llama) [config.json](https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/config.json "meta-llama/Meta-Llama-3-8B") [Tech report](https://arxiv.org/pdf/2407.21783)

Reference dense Llama stack used to contrast OLMo 2's normalization and attention choices.

Scale

8B parameters

Date

2024-04-18

Decoder type

Dense

Attention

GQA with RoPE

Key detail

Pre-norm baseline; wider than OLMo 2 at a similar scale.

### OLMo 2 7B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A723-olmo-2-summary) [config.json](https://huggingface.co/allenai/OLMo-2-1124-13B/blob/main/config.json "allenai/OLMo-2-1124-13B") [Tech report](https://arxiv.org/pdf/2501.00656)

Transparent dense model that keeps classic MHA and pushes normalization changes for training stability.

Scale

7B parameters

Date

2024-11-25

Decoder type

Dense

Attention

MHA with QK-Norm

Key detail

Uses inside-residual post-norm instead of the usual pre-norm layout.

### DeepSeek V3

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A75-llama-4) [config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/config.json "deepseek-ai/DeepSeek-V3") [Tech report](https://arxiv.org/pdf/2412.19437)

DeepSeek's flagship template kicked off the recent wave of large open MoE models.

Scale

671B total, 37B active

Date

2024-12-26

Decoder type

Sparse MoE

Attention

MLA

Key detail

Uses a dense prefix plus a shared expert to keep a very large model practical at inference.

### DeepSeek R1

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A78-kimi-k2-and-kimi-k2-thinking) [config.json](https://huggingface.co/deepseek-ai/DeepSeek-R1/blob/main/config.json "deepseek-ai/DeepSeek-R1") [Tech report](https://arxiv.org/pdf/2501.12948)

Reasoning-tuned DeepSeek model built on the V3 architecture rather than a new base design.

Scale

671B total, 37B active

Date

2025-01-20

Decoder type

Sparse MoE

Attention

MLA

Key detail

Architecture matches DeepSeek V3; the main change is the reasoning-oriented training recipe.

### Gemma 3 27B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A74-mistral-small-31) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/12_gemma3) [config.json](https://huggingface.co/google/gemma-3-27b-it/blob/main/config.json "google/gemma-3-27b-it") [Tech report](https://arxiv.org/pdf/2503.19786)

Gemma's flagship text stack leans on local attention more aggressively than Gemma 2.

Scale

27B parameters

Date

2025-03-11

Decoder type

Dense

Attention

GQA with QK-Norm and 5:1 sliding-window/global attention

Key detail

Built around a 27B sweet spot with heavier local attention and a large multilingual vocabulary.

### Mistral Small 3.1 24B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A74-mistral-small-31) [config.json](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503/blob/main/config.json "mistralai/Mistral-Small-3.1-24B-Base-2503") [Tech report](https://mistral.ai/news/mistral-small-3-1)

Fast dense 24B model that drops the sliding-window setup used in older Mistral releases.

Scale

24B parameters

Date

2025-03-18

Decoder type

Dense

Attention

Standard GQA

Key detail

Latency-focused design with a smaller KV cache and fewer layers than Gemma 3 27B.

### Llama 4 Maverick

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A75-llama-4) [config.json](https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct/blob/main/config.json "meta-llama/Llama-4-Maverick-17B-128E-Instruct") [Tech report](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)

Meta's large MoE follows the DeepSeek V3 playbook but with a more conventional attention stack.

Scale

400B total, 17B active

Date

2025-04-05

Decoder type

Sparse MoE

Attention

GQA

Key detail

Alternates dense and MoE blocks and uses fewer, larger experts than DeepSeek V3.

### Qwen3 235B-A22B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A762-qwen3-moe) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/config.json "Qwen/Qwen3-235B-A22B") [Tech report](https://arxiv.org/pdf/2505.09388)

Large sparse Qwen variant that stays very close to DeepSeek V3 while removing the shared expert.

Scale

235B total, 22B active

Date

2025-04-28

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Key detail

High-capacity MoE design optimized for serving efficiency without a shared expert.

### Qwen3 32B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/config.json "Qwen/Qwen3-235B-A22B") [Tech report](https://arxiv.org/pdf/2505.09388)

Large dense Qwen3 model that serves as the clearest like-for-like comparison for OLMo 3 32B.

Scale

32B parameters

Date

2025-04-28

Decoder type

Dense

Attention

GQA with QK-Norm

Key detail

Reference dense Qwen stack with QK-Norm and 8 KV heads.

### Qwen3 4B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A77-smollm3) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/config.json "Qwen/Qwen3-235B-A22B") [Tech report](https://arxiv.org/pdf/2505.09388)

Mid-size dense Qwen3 model used here as a clean baseline against SmolLM3 and Tiny Aya.

Scale

4B parameters

Date

2025-04-28

Decoder type

Dense

Attention

GQA with QK-Norm

Key detail

Compact Qwen3 dense stack with QK-Norm and a 151k vocabulary.

### Qwen3 8B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/config.json "Qwen/Qwen3-235B-A22B") [Tech report](https://arxiv.org/pdf/2505.09388)

Dense Qwen3 baseline used here to show how little OLMo 3 changed the overall decoder recipe.

Scale

8B parameters

Date

2025-04-28

Decoder type

Dense

Attention

GQA with QK-Norm

Key detail

Reference Qwen3 dense stack with QK-Norm and 8 KV heads.

### SmolLM3 3B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A77-smollm3) [config.json](https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base/blob/main/config.json "HuggingFaceTB/SmolLM3-3B-Base") [Tech report](https://huggingface.co/blog/smollm3)

Compact dense model that experiments with leaving out positional encodings in selected layers.

Scale

3B parameters

Date

2025-06-19

Decoder type

Dense

Attention

GQA with periodic NoPE layers

Key detail

Every fourth layer omits RoPE to test a NoPE-style cadence.

### Kimi K2

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A78-kimi-k2-and-kimi-k2-thinking) [config.json](https://huggingface.co/moonshotai/Kimi-K2-Base/blob/main/config.json "moonshotai/Kimi-K2-Base") [Tech report](https://arxiv.org/pdf/2507.20534)

Trillion-parameter Moonshot model that essentially scales the DeepSeek V3 recipe upward.

Scale

1T total, 32B active

Date

2025-07-10

Decoder type

Sparse MoE

Attention

MLA

Key detail

More experts and fewer MLA heads than DeepSeek V3.

### GLM-4.5 355B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A711-glm-45) [config.json](https://huggingface.co/zai-org/GLM-4.5/blob/main/config.json "zai-org/GLM-4.5") [Tech report](https://arxiv.org/pdf/2508.06471)

Agent-oriented instruction/reasoning hybrid that borrows DeepSeek's dense-prefix MoE layout.

Scale

355B total, 32B active

Date

2025-07-28

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Key detail

Starts with three dense layers before MoE routing and keeps a shared expert.

### GPT-OSS 120B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A79-gpt-oss) [config.json](https://huggingface.co/openai/gpt-oss-120b/blob/main/config.json "openai/gpt-oss-120b") [Tech report](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)

Larger gpt-oss variant keeps the same alternating-attention recipe as the 20B model.

Scale

120B parameters

Date

2025-08-04

Decoder type

Sparse MoE

Attention

GQA with alternating sliding-window and global layers

Key detail

Shared architectural template scaled up for OpenAI's flagship open-weight release.

### GPT-OSS 20B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A79-gpt-oss) [config.json](https://huggingface.co/openai/gpt-oss-20b/blob/main/config.json "openai/gpt-oss-20b") [Tech report](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)

OpenAI's smaller open-weight MoE model favors width and alternating local/global attention.

Scale

20B total, 3.6B active

Date

2025-08-04

Decoder type

Sparse MoE

Attention

GQA with alternating sliding-window and global layers

Key detail

Wider and shallower than Qwen3, with attention bias and sink mechanisms.

### Grok 2.5 270B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A710-grok-25) [config.json](https://huggingface.co/xai-org/grok-2/blob/main/config.json "xai-org/grok-2")

Rare production-model release that shows an older MoE style with fewer, larger experts.

Scale

270B parameters

Date

2025-08-22

Decoder type

Sparse MoE

Attention

GQA

Key detail

Adds an always-on SwiGLU path that effectively behaves like a shared expert.

### MiniMax M2 230B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7131-per-layer-qk-norm) [config.json](https://huggingface.co/MiniMaxAI/MiniMax-M2/blob/main/config.json "MiniMaxAI/MiniMax-M2")

MiniMax's flagship returns to full attention and looks like a leaner, sparser cousin of Qwen3.

Scale

230B total, 10B active

Date

2025-10-23

Decoder type

Sparse MoE

Attention

GQA with QK-Norm and partial RoPE

Key detail

Uses per-layer QK-Norm and much sparser MoE routing than Qwen3.

### Kimi Linear 48B-A3B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7144-kimi-linear-vs-qwen3-next) [config.json](https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Base/blob/main/config.json "moonshotai/Kimi-Linear-48B-A3B-Base") [Tech report](https://arxiv.org/pdf/2510.26692)

Linear-attention hybrid that keeps a transformer backbone but replaces most full-attention layers.

Scale

48B total, 3B active

Date

2025-10-30

Decoder type

Sparse hybrid

Attention

3:1 Kimi Delta Attention and MLA

Key detail

Uses NoPE in MLA layers and channel-wise gating for long-context efficiency.

### OLMo 3 32B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/13_olmo3) [config.json](https://huggingface.co/allenai/Olmo-3-32B-Think/blob/main/config.json "allenai/Olmo-3-32B-Think") [Tech report](https://arxiv.org/pdf/2512.13961)

Scaled-up OLMo 3 keeps the same block design but moves to grouped-query attention.

Scale

32B parameters

Date

2025-11-20

Decoder type

Dense

Attention

GQA with QK-Norm and 3:1 sliding-window/global attention

Key detail

Keeps post-norm while scaling width and applying YaRN only on global layers.

### OLMo 3 7B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/13_olmo3) [config.json](https://huggingface.co/allenai/Olmo-3-32B-Think/blob/main/config.json "allenai/Olmo-3-32B-Think") [Tech report](https://arxiv.org/pdf/2512.13961)

New transparent Allen AI model that keeps OLMo's post-norm flavor while modernizing context handling.

Scale

7B parameters

Date

2025-11-20

Decoder type

Dense

Attention

MHA with QK-Norm and 3:1 sliding-window/global attention

Key detail

Retains post-norm, keeps MHA, and applies YaRN only on global layers.

### DeepSeek V3.2

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A716-deepseek-v32) [config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3.2/blob/main/config.json "deepseek-ai/DeepSeek-V3.2") [Tech report](https://arxiv.org/pdf/2512.02556)

DeepSeek's successor keeps the V3 template but adds sparse attention to cut long-context costs.

Scale

671B total, 37B active

Date

2025-12-01

Decoder type

Sparse MoE

Attention

MLA with DeepSeek Sparse Attention

Key detail

An evolutionary update focused on efficiency rather than a new base layout.

### Mistral 3 Large

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A717-mistral-3-large) [params.json](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512/blob/main/params.json "mistralai/Mistral-Large-3-675B-Instruct-2512")

Mistral's new flagship effectively adopts the DeepSeek architecture and retunes the expert sizes.

Scale

673B total, 41B active

Date

2025-12-02

Decoder type

Sparse MoE

Attention

MLA

Key detail

Near-clone of DeepSeek V3 with larger experts, fewer routed experts, and multimodal support.

### Nemotron 3 Nano 30B-A3B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7181-nemotron-3-nano) [config.json](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16/blob/main/config.json "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16") [Tech report](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Nano-Technical-Report.pdf)

NVIDIA's Nano model is the most extreme transformer-state-space hybrid in the gallery.

Scale

30B total, 3B active

Date

2025-12-04

Decoder type

Hybrid MoE

Attention

Mostly Mamba-2 with a few GQA layers

Key detail

Interleaves Mamba-2 and MoE blocks, using attention only sparingly.

### Xiaomi MiMo-V2-Flash 309B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A719-xiaomi-mimo-v2-flash) [config.json](https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash/blob/main/config.json "XiaomiMiMo/MiMo-V2-Flash") [Tech report](https://arxiv.org/pdf/2601.02780)

Large MoE model that pushes sliding-window attention harder than most contemporaries.

Scale

309B total, 15B active

Date

2025-12-16

Decoder type

Sparse MoE

Attention

5:1 sliding-window/global attention

Key detail

Uses an unusually small 128-token local window plus multi-token prediction.

### GLM-4.7 355B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A721-glm-5) [config.json](https://huggingface.co/zai-org/GLM-4.7/blob/main/config.json "zai-org/GLM-4.7") [Tech report](https://arxiv.org/pdf/2508.06471)

Immediate GLM predecessor that stays closer to the older GLM-4.5 style before the MLA shift.

Scale

355B total, 32B active

Date

2025-12-22

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Key detail

Serves as the pre-MLA, pre-sparse-attention baseline with the same 32B active path as GLM-4.5.

### Arcee AI Trinity Large 400B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A720-arcee-ai-trinity-large) [config.json](https://huggingface.co/arcee-ai/Trinity-Large-Base/blob/main/config.json "arcee-ai/Trinity-Large-Base") [Tech report](https://arxiv.org/pdf/2602.17004)

Arcee's flagship blends several efficiency tricks into a DeepSeek-like coarse MoE design.

Scale

400B total, 13B active

Date

2026-01-27

Decoder type

Sparse MoE

Attention

GQA with gated attention and 3:1 sliding-window/global attention

Key detail

Combines QK-Norm, RoPE+NoPE, sandwich norm, and a coarse-grained MoE.

### GLM-5 744B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A721-glm-5) [config.json](https://huggingface.co/zai-org/GLM-5/blob/main/config.json "zai-org/GLM-5") [Tech report](https://arxiv.org/pdf/2602.15763)

Huge GLM refresh that adopts both MLA and DeepSeek Sparse Attention for flagship-scale inference.

Scale

744B total, 40B active

Date

2026-02-11

Decoder type

Sparse MoE

Attention

MLA with DeepSeek Sparse Attention

Key detail

Bigger than GLM-4.7, with more experts and fewer layers.

### Nemotron 3 Super 120B-A12B

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7182-nemotron-3-super) [config.json](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16/blob/main/config.json "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16") [Tech report](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf)

The Super variant scales up Nano and adds both latent experts and native speculative decoding support.

Scale

120B total, 12B active

Date

2026-03-11

Decoder type

Hybrid MoE

Attention

Mostly Mamba-2 with a few GQA layers

Key detail

Adds latent-space MoE and shared-weight MTP for fast inference.

### Step 3.5 Flash 196B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A73-stepfuns-step-35-flash-good-performance-at-great-tokens-sec-throughput) [config.json](https://huggingface.co/stepfun-ai/Step-3.5-Flash/blob/main/config.json "stepfun-ai/Step-3.5-Flash") [Tech report](https://arxiv.org/pdf/2602.10604)

Throughput-oriented MoE model that stays competitive with much larger DeepSeek-style systems.

Scale

196B total, 11B active

Date

2026-02-01

Decoder type

Sparse MoE

Attention

GQA with 3:1 sliding-window attention

Key detail

Uses MTP-3 during both training and inference for unusually high throughput.

### Nanbeige 4.1 3B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A77-nanbeige-41-3b-a-strong-llama-3-successor) [config.json](https://huggingface.co/Nanbeige/Nanbeige4.1-3B/blob/main/config.json "Nanbeige/Nanbeige4.1-3B") [Tech report](https://arxiv.org/pdf/2602.13367)

Small on-device oriented model that stays close to Llama 3.2 while nudging the scaling choices.

Scale

3B parameters

Date

2026-02-10

Decoder type

Dense

Attention

GQA

Key detail

Llama-like stack without tying input embeddings to the output layer.

### MiniMax M2.5 230B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A76-minimax-m25-a-strong-coder-with-only-230b-parameters) [config.json](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/config.json "MiniMaxAI/MiniMax-M2.5")

Popular 230B coder that opts for a classic architecture instead of the newer hybrid-attention ideas.

Scale

230B total, 10B active

Date

2026-02-12

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Key detail

Deliberately avoids sliding-window or linear-attention hybrids while keeping a 10B active path.

### Tiny Aya 3.35B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A710-tiny-aya-a-335b-model-with-strong-multilingual-support) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/15_tiny-aya) [config.json](https://huggingface.co/CohereLabs/tiny-aya-base/blob/main/config.json "CohereLabs/tiny-aya-base") [Tech report](https://arxiv.org/pdf/2603.11510)

Compact multilingual model from Cohere with a rare parallel transformer block.

Scale

3.35B parameters

Date

2026-02-13

Decoder type

Dense

Attention

GQA with 3:1 sliding-window attention

Key detail

Runs attention and the MLP in parallel while mixing RoPE with NoPE.

### Ling 2.5 1T

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A79-ant-groups-ling-25-1t-with-lightning-attention) [config.json](https://huggingface.co/inclusionAI/Ling-2.5-1T/blob/main/config.json "inclusionAI/Ling-2.5-1T")

Trillion-parameter long-context model that swaps DeltaNet for Lightning Attention.

Scale

1T total, 63B active

Date

2026-02-15

Decoder type

Sparse hybrid

Attention

Lightning Attention plus MLA

Key detail

Uses a 7:1 linear-attention/MLA ratio and a much larger 63B active path.

### Qwen3.5 397B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A78-qwen35-and-the-continutation-of-hybrid-attention) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/16_qwen3.5) [config.json](https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/config.json "Qwen/Qwen3.5-397B-A17B")

Mainline Qwen refresh that brings the Next-style hybrid attention into the flagship series.

Scale

397B total, 17B active

Date

2026-02-16

Decoder type

Sparse hybrid

Attention

3:1 Gated DeltaNet and Gated Attention

Key detail

Turns the former Qwen3-Next side branch into the new core design with 512 experts and 17B active parameters.

### Sarvam 105B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A7update-1-sarvam-30b-and-105b-mar-6-2026) [config.json](https://huggingface.co/sarvamai/sarvam-105b/blob/main/config.json "sarvamai/sarvam-105b")

Larger Sarvam variant keeps the sparse MoE layout but switches from GQA to MLA.

Scale

105B total

Date

2026-03-03

Decoder type

Sparse MoE

Attention

MLA with KV LayerNorm and NoPE + RoPE

Key detail

Large vocabulary and strong Indic language support carried into the larger MLA-based sparse MoE variant.

### Sarvam 30B

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A7update-1-sarvam-30b-and-105b-mar-6-2026) [config.json](https://huggingface.co/sarvamai/sarvam-30b/blob/main/config.json "sarvamai/sarvam-30b")

Reasoning-oriented Indian-language sparse MoE that keeps GQA at the smaller size.

Scale

30B total

Date

2026-03-03

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Key detail

Large vocabulary and strong Indic language support paired with a reasoning-focused sparse MoE design.

The original comparison article that walks through the architecture figures in context and explains the key design choices across dense, MoE, MLA, and hybrid decoder families.

[Read article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)

[![The Big LLM Architecture Comparison overview figure](https://sebastianraschka.com/llm-architecture-gallery/images/source-articles/the-big-llm-architecture-comparison.webp)](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)

Follow-up article covering the additional open-weight architecture releases from early 2026, including the newer MiniMax, Qwen, Ling, and Sarvam families.

[Read article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight)

[![A Dream of Spring for Open-Weight LLMs hero image](https://sebastianraschka.com/llm-architecture-gallery/images/source-articles/a-dream-of-spring-for-open-weight.webp)](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight)