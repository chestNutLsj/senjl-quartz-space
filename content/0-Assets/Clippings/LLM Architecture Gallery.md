---
title: LLM Architecture Gallery
author: Sebastian Raschka
published: 2026-03-27
date: 2026-03-29
tags: [LLM, Architecture, Clipping]
---

> [!info] Source
> - URL: https://sebastianraschka.com/llm-architecture-gallery/
> - Page marked `Last updated: March 27, 2026`
> - Captured on: 2026-03-29
> - Note: the source page does not expose an obvious original publication date in the clipped body, so `published` here records the page's latest update date.

Last updated: March 27, 2026 [(view changes)](https://sebastianraschka.com/llm-architecture-gallery/changelog/) If you do not see the latest changes, try a hard reload: `Cmd+Shift+R` on Mac or `Ctrl+F5` on Windows.

This page collects architecture figures and fact sheets from [The Big LLM Architecture Comparison](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison), [From GPT-2 to gpt-oss](https://magazine.sebastianraschka.com/p/from-gpt-2-to-gpt-oss-analyzing-the), [From DeepSeek V3 to V3.2](https://magazine.sebastianraschka.com/p/technical-deepseek), and [A Dream of Spring for Open-Weight LLMs](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight), plus selected release posts or technical reports when a new architecture has not been covered in one of those articles yet. It focuses on the architecture panels only. Click a figure to enlarge it and use the model title to jump to the corresponding article section.

`KV cache / token (bf16)` is shown as a logical batch-size-1 estimate from the cache geometry, not a framework-specific runtime-memory measurement.

If you spot an inaccurate fact sheet, mislabeled architecture, or broken link, please file an issue here: [Architecture Gallery issue tracker](https://github.com/rasbt/LLMs-from-scratch/issues/new?labels=architecture-gallery&title=Architecture%20Gallery%3A%20).

Upon popular request, you can now also get this as a physical poster via [Redbubble](https://www.redbubble.com/i/poster/LLM-Architecture-Gallery-by-Ahead-of-AI/179274487/flk2). I ordered a Redbubble poster myself to check the print quality, and it just arrived. This one is the Medium size (26.9 x 23.4 in). The smallest font elements are very small but still sharp and just readable at this size, though I probably wouldn't go any smaller.

### Select two models and compare the stack

If you want to compare two architectures side by side instead of browsing the gallery, use this diff tool. You can use the selectors here or the `Model A` / `Model B` actions on each card.

Compare

#### GPT-2 XL (1.5B)

[View in article](https://magazine.sebastianraschka.com/p/from-gpt-2-to-gpt-oss-analyzing-the#%C2%A72-coming-from-gpt-2) [config.json](https://huggingface.co/openai-community/gpt2-xl/blob/main/config.json "openai-community/gpt2-xl") [Tech report](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)

Late-2019 dense baseline included here as a reference point for how much decoder stacks have changed since GPT-2.

Scale

1.5B parameters

Context (tokens)

1,024

License

OpenAI "Modified MIT" license

Date

2019-11-05

Decoder type

Dense

Attention

MHA with learned absolute positional embeddings

Layer mix

48 MHA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

300 KiB · High

Key detail

Classic GPT-2 recipe with dropout, GELU, LayerNorm, and full multi-head attention.

Compare

#### Llama 3 (8B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A723-olmo-2-summary) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/07_gpt_to_llama) [config.json](https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/config.json "meta-llama/Meta-Llama-3-8B") [License](https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2407.21783)

Reference dense Llama stack used to contrast OLMo 2's normalization and attention choices.

Scale

8B parameters

Context (tokens)

8,192

License

Llama 3 Community License Agreement

Date

2024-04-18

Decoder type

Dense

Attention

GQA with RoPE

Layer mix

32 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

128 KiB · Moderate

Key detail

Pre-norm baseline; wider than OLMo 2 at a similar scale.

Compare

#### Llama 3.2 (1B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A761-qwen3-dense) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/07_gpt_to_llama) [License](https://huggingface.co/meta-llama/Llama-3.2-1B/blob/main/LICENSE.txt)

Small dense Llama baseline in the Qwen comparison, with fewer layers but more width.

Scale

1B parameters

Context (tokens)

128,000

License

Llama Community License Agreement (variant-specific)

Date

2024-09-25

Decoder type

Dense

Attention

GQA

Layer mix

16 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

32 KiB · Low

Key detail

Wider architecture with more heads than Qwen3 0.6B.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [6.3](https://artificialanalysis.ai/models/llama-3-2-instruct-1b)

Compare

#### OLMo 2 (7B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A723-olmo-2-summary) [config.json](https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct/blob/main/config.json "allenai/OLMo-2-1124-7B-Instruct") [Tech report](https://arxiv.org/pdf/2501.00656)

Transparent dense model that keeps classic MHA and pushes normalization changes for training stability.

Scale

7B parameters

Context (tokens)

4,096

License

Apache License 2.0

Date

2024-11-25

Decoder type

Dense

Attention

MHA with QK-Norm

Layer mix

32 MHA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

512 KiB · Very high

Key detail

Uses inside-residual post-norm instead of the usual pre-norm layout.

Compare

#### DeepSeek V3 (671B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A75-llama-4) [config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/config.json "deepseek-ai/DeepSeek-V3") [License](https://huggingface.co/deepseek-ai/DeepSeek-V3/blame/main/LICENSE-MODEL) [Tech report](https://arxiv.org/pdf/2412.19437)

DeepSeek's flagship template kicked off the recent wave of large open MoE models.

Scale

671B total, 37B active (5.5% active)

Context (tokens)

128,000

License

DeepSeek License Agreement v1.0

Date

2024-12-26

Decoder type

Sparse MoE

Attention

MLA

Layer mix

61 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

68.6 KiB · Low

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [16.5](https://artificialanalysis.ai/models/deepseek-v3)

Compare

#### DeepSeek R1 (671B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A78-kimi-k2-and-kimi-k2-thinking) [config.json](https://huggingface.co/deepseek-ai/DeepSeek-R1/blob/main/config.json "deepseek-ai/DeepSeek-R1") [License](https://huggingface.co/deepseek-ai/DeepSeek-R1/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2501.12948)

Reasoning-tuned DeepSeek model built on the V3 architecture rather than a new base design.

Scale

671B total, 37B active (5.5% active)

Context (tokens)

128,000

License

MIT License

Date

2025-01-20

Decoder type

Sparse MoE

Attention

MLA

Layer mix

61 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

68.6 KiB · Low

Key detail

Architecture matches DeepSeek V3; the main change is the reasoning-oriented training recipe.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [18.8](https://artificialanalysis.ai/models/deepseek-r1-0120)

Compare

#### Gemma 3 (27B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A74-mistral-small-31) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/12_gemma3) [config.json](https://huggingface.co/google/gemma-3-27b-it/blob/main/config.json "google/gemma-3-27b-it") [License](https://ai.google.dev/gemma/prohibited_use_policy) [Tech report](https://arxiv.org/pdf/2503.19786)

Gemma's flagship text stack leans on local attention more aggressively than Gemma 2.

Scale

27B parameters

Context (tokens)

128,000

Date

2025-03-11

Decoder type

Dense

Attention

GQA with QK-Norm and 5:1 sliding-window/global attention

Layer mix

52 sliding-window + 10 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

496 KiB · Very high

Key detail

Built around a 27B sweet spot with heavier local attention and a large multilingual vocabulary.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [10.3](https://artificialanalysis.ai/models/gemma-3-27b)

Compare

#### Mistral Small 3.1 (24B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A74-mistral-small-31) [config.json](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503/blob/main/config.json "mistralai/Mistral-Small-3.1-24B-Base-2503") [Tech report](https://mistral.ai/news/mistral-small-3-1)

Fast dense 24B model that drops the sliding-window setup used in older Mistral releases.

Scale

24B parameters

Context (tokens)

128,000

License

Apache License 2.0

Date

2025-03-18

Decoder type

Dense

Attention

Standard GQA

Layer mix

40 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

160 KiB · Moderate

Key detail

Latency-focused design with a smaller KV cache and fewer layers than Gemma 3 27B.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [14.5](https://artificialanalysis.ai/models/mistral-small-3-1)

Compare

#### Llama 4 Maverick (400B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A75-llama-4) [config.json](https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct/blob/main/config.json "meta-llama/Llama-4-Maverick-17B-128E-Instruct") [Tech report](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)

Meta's large MoE follows the DeepSeek V3 playbook but with a more conventional attention stack.

Scale

400B total, 17B active (4.3% active)

Context (tokens)

1,000,000

License

Llama 4 Community License Agreement

Date

2025-04-05

Decoder type

Sparse MoE

Attention

GQA

Layer mix

36 chunked + 12 full GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

192 KiB · High

Key detail

Alternates dense and MoE blocks and uses fewer, larger experts than DeepSeek V3.

Compare

#### Qwen3 (235B-A22B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A762-qwen3-moe) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/config.json "Qwen/Qwen3-235B-A22B") [License](https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2505.09388)

Large sparse Qwen variant that stays very close to DeepSeek V3 while removing the shared expert.

Scale

235B total, 22B active (9.4% active)

Context (tokens)

128,000

License

Apache License 2.0

Date

2025-04-28

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Layer mix

94 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

188 KiB · High

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [17.0](https://artificialanalysis.ai/models/qwen3-235b-a22b-instruct)

Compare

#### Qwen3 (32B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-32B/blob/main/config.json "Qwen/Qwen3-32B") [License](https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2505.09388)

Large dense Qwen3 model that serves as the clearest like-for-like comparison for OLMo 3 32B.

Scale

32B parameters

Context (tokens)

128,000

License

Apache License 2.0

Date

2025-04-28

Decoder type

Dense

Attention

GQA with QK-Norm

Layer mix

64 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

256 KiB · High

Key detail

Reference dense Qwen stack with QK-Norm and 8 KV heads.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [14.5](https://artificialanalysis.ai/models/qwen3-32b-instruct)

Compare

#### Qwen3 (4B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A77-smollm3) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-4B/blob/main/config.json "Qwen/Qwen3-4B") [License](https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2505.09388)

Mid-size dense Qwen3 model used here as a clean baseline against SmolLM3 and Tiny Aya.

Scale

4B parameters

Context (tokens)

32,768

License

Apache License 2.0

Date

2025-04-28

Decoder type

Dense

Attention

GQA with QK-Norm

Layer mix

36 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

144 KiB · Moderate

Key detail

Compact Qwen3 dense stack with QK-Norm and a 151k vocabulary.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [12.5](https://artificialanalysis.ai/models/qwen3-4b-instruct)

Compare

#### Qwen3 (8B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json "Qwen/Qwen3-8B") [License](https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2505.09388)

Dense Qwen3 baseline used here to show how little OLMo 3 changed the overall decoder recipe.

Scale

8B parameters

Context (tokens)

128,000

License

Apache License 2.0

Date

2025-04-28

Decoder type

Dense

Attention

GQA with QK-Norm

Layer mix

36 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

144 KiB · Moderate

Key detail

Reference Qwen3 dense stack with QK-Norm and 8 KV heads.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [10.6](https://artificialanalysis.ai/models/qwen3-8b-instruct)

Compare

#### SmolLM3 (3B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A77-smollm3) [config.json](https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base/blob/main/config.json "HuggingFaceTB/SmolLM3-3B-Base") [Tech report](https://huggingface.co/blog/smollm3)

Compact dense model that experiments with leaving out positional encodings in selected layers.

Scale

3B parameters

Context (tokens)

131,072

License

Apache License 2.0

Date

2025-06-19

Decoder type

Dense

Attention

GQA with periodic NoPE layers

Layer mix

36 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

72 KiB · Low

Key detail

Every fourth layer omits RoPE to test a NoPE-style cadence.

Compare

#### Kimi K2 (1T)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A78-kimi-k2-and-kimi-k2-thinking) [config.json](https://huggingface.co/moonshotai/Kimi-K2-Base/blob/main/config.json "moonshotai/Kimi-K2-Base") [License](https://huggingface.co/moonshotai/Kimi-K2-Base/blame/main/LICENSE) [Tech report](https://arxiv.org/pdf/2507.20534)

Trillion-parameter Moonshot model that essentially scales the DeepSeek V3 recipe upward.

Scale

1T total, 32B active (3.2% active)

Context (tokens)

128,000

License

Modified MIT License

Date

2025-07-10

Decoder type

Sparse MoE

Attention

MLA

Layer mix

61 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

68.6 KiB · Low

Key detail

More experts and fewer MLA heads than DeepSeek V3.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [26.3](https://artificialanalysis.ai/models/kimi-k2)

Compare

#### GLM-4.5 (355B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A711-glm-45) [config.json](https://huggingface.co/zai-org/GLM-4.5/blob/main/config.json "zai-org/GLM-4.5") [Tech report](https://arxiv.org/pdf/2508.06471)

Agent-oriented instruction/reasoning hybrid that borrows DeepSeek's dense-prefix MoE layout.

Scale

355B total, 32B active (9% active)

Context (tokens)

128,000

License

MIT License

Date

2025-07-28

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Layer mix

92 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

368 KiB · Very high

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [26.4](https://artificialanalysis.ai/models/glm-4.5)

Compare

#### GPT-OSS (120B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A79-gpt-oss) [config.json](https://huggingface.co/openai/gpt-oss-120b/blob/main/config.json "openai/gpt-oss-120b") [License](https://huggingface.co/openai/gpt-oss-120b/blob/main/LICENSE) [Tech report](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)

Larger gpt-oss variant keeps the same alternating-attention recipe as the 20B model.

Scale

117B total, 5.1B active (4.4% active)

Context (tokens)

128,000

License

Apache License 2.0

Date

2025-08-04

Decoder type

Sparse MoE

Attention

GQA with alternating sliding-window and global layers

Layer mix

18 sliding-window + 18 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

72 KiB · Low

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [33.3](https://artificialanalysis.ai/models/gpt-oss-120b)

Compare

#### GPT-OSS (20B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A79-gpt-oss) [config.json](https://huggingface.co/openai/gpt-oss-20b/blob/main/config.json "openai/gpt-oss-20b") [License](https://huggingface.co/openai/gpt-oss-20b/blob/main/LICENSE) [Tech report](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)

OpenAI's smaller open-weight MoE model favors width and alternating local/global attention.

Scale

21B total, 3.6B active (17.1% active)

Context (tokens)

128,000

License

Apache License 2.0

Date

2025-08-04

Decoder type

Sparse MoE

Attention

GQA with alternating sliding-window and global layers

Layer mix

12 sliding-window + 12 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

48 KiB · Low

Key detail

Wider and shallower than Qwen3, with attention bias and sink mechanisms.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [24.5](https://artificialanalysis.ai/models/gpt-oss-20b)

Compare

#### Gemma 3 (270M)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A74-mistral-small-31) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/12_gemma3) [config.json](https://huggingface.co/google/gemma-3-270m/blob/main/config.json "google/gemma-3-270m") [License](https://ai.google.dev/gemma/prohibited_use_policy) [Tech report](https://arxiv.org/pdf/2503.19786)

Tiny Gemma 3 variant that preserves the family's local-global attention recipe at a toy scale.

Scale

270M parameters

Context (tokens)

128,000

Date

2025-08-14

Decoder type

Dense

Attention

Multi-query attention with QK-Norm and 5:1 sliding-window/global attention

Layer mix

15 sliding-window + 3 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

18 KiB · Very low

Key detail

Keeps the Gemma 3 stack shape while shrinking down to 4 attention heads and a single KV head.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [7.7](https://artificialanalysis.ai/models/gemma-3-270m)

Compare

#### Grok 2.5 (270B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A710-grok-25) [config.json](https://huggingface.co/xai-org/grok-2/blob/main/config.json "xai-org/grok-2")

Rare production-model release that shows an older MoE style with fewer, larger experts.

Scale

270B parameters

Context (tokens)

131,072

License

Grok 2 Community License Agreement

Date

2025-08-22

Decoder type

Sparse MoE

Attention

GQA

Layer mix

64 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

256 KiB · High

Compare

#### MiniMax M2 (230B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7131-per-layer-qk-norm) [config.json](https://huggingface.co/MiniMaxAI/MiniMax-M2/blob/main/config.json "MiniMaxAI/MiniMax-M2")

MiniMax's flagship returns to full attention and looks like a leaner, sparser cousin of Qwen3.

Scale

230B total, 10B active (4.3% active)

Context (tokens)

196,608

License

Modified MIT License

Date

2025-10-23

Decoder type

Sparse MoE

Attention

GQA with QK-Norm and partial RoPE

Layer mix

62 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

248 KiB · High

Key detail

Uses per-layer QK-Norm and much sparser MoE routing than Qwen3.

Compare

#### Kimi Linear (48B-A3B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7144-kimi-linear-vs-qwen3-next) [config.json](https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Base/blob/main/config.json "moonshotai/Kimi-Linear-48B-A3B-Base") [Tech report](https://arxiv.org/pdf/2510.26692)

Linear-attention hybrid that keeps a transformer backbone but replaces most full-attention layers.

Scale

48B total, 3B active (6.3% active)

Context (tokens)

1,000,000

License

MIT License

Date

2025-10-30

Decoder type

Sparse hybrid

Attention

3:1 Kimi Delta Attention and MLA

Layer mix

7 MLA + 20 Kimi Delta Attention

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

7.9 KiB · Very low

Key detail

Uses NoPE in MLA layers and channel-wise gating for long-context efficiency.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [14.4](https://artificialanalysis.ai/models/kimi-linear-48b-a3b-instruct)

Compare

#### OLMo 3 (32B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/13_olmo3) [config.json](https://huggingface.co/allenai/Olmo-3-32B-Think/blob/main/config.json "allenai/Olmo-3-32B-Think") [Tech report](https://arxiv.org/pdf/2512.13961)

Scaled-up OLMo 3 keeps the same block design but moves to grouped-query attention.

Scale

32B parameters

Context (tokens)

65,536

License

Apache License 2.0

Date

2025-11-20

Decoder type

Dense

Attention

GQA with QK-Norm and 3:1 sliding-window/global attention

Layer mix

48 sliding-window + 16 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

256 KiB · High

Key detail

Keeps post-norm while scaling width and applying YaRN only on global layers.

Compare

#### OLMo 3 (7B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A715-olmo-3-thinking) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/13_olmo3) [config.json](https://huggingface.co/allenai/Olmo-3-1025-7B/blob/main/config.json "allenai/Olmo-3-1025-7B") [Tech report](https://arxiv.org/pdf/2512.13961)

New transparent Allen AI model that keeps OLMo's post-norm flavor while modernizing context handling.

Scale

7B parameters

Context (tokens)

65,536

License

Apache License 2.0

Date

2025-11-20

Decoder type

Dense

Attention

MHA with QK-Norm and 3:1 sliding-window/global attention

Layer mix

24 sliding-window + 8 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

512 KiB · Very high

Key detail

Retains post-norm, keeps MHA, and applies YaRN only on global layers.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [8.2](https://artificialanalysis.ai/models/olmo-3-7b-instruct)

Compare

#### DeepSeek V3.2 (671B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A716-deepseek-v32) [config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3.2/blob/main/config.json "deepseek-ai/DeepSeek-V3.2") [License](https://huggingface.co/deepseek-ai/DeepSeek-V3.2/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2512.02556)

DeepSeek's successor keeps the V3 template but adds sparse attention to cut long-context costs.

Scale

671B total, 37B active (5.5% active)

Context (tokens)

128,000

License

MIT License

Date

2025-12-01

Decoder type

Sparse MoE

Attention

MLA with DeepSeek Sparse Attention

Layer mix

61 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

68.6 KiB · Low

Key detail

An evolutionary update focused on efficiency rather than a new base layout.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [32.1](https://artificialanalysis.ai/models/deepseek-v3-2)

Compare

#### Mistral Large 3 (673B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A717-mistral-3-large) [params.json](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512/blob/main/params.json "mistralai/Mistral-Large-3-675B-Instruct-2512")

Mistral's new flagship effectively adopts the DeepSeek architecture and retunes the expert sizes.

Scale

673B total, 41B active (6.1% active)

Context (tokens)

262,144

License

Apache License 2.0

Date

2025-12-02

Decoder type

Sparse MoE

Attention

MLA

Layer mix

61 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

68.6 KiB · Low

Key detail

Near-clone of DeepSeek V3 with larger experts, fewer routed experts, and multimodal support.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [22.8](https://artificialanalysis.ai/models/mistral-large-3)

Compare

#### Nemotron 3 Nano (30B-A3B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7181-nemotron-3-nano) [config.json](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16/blob/main/config.json "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16") [License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/) [Tech report](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Nano-Technical-Report.pdf)

NVIDIA's Nano model is the most extreme transformer-state-space hybrid in the gallery.

Scale

30B total, 3B active (10% active)

Context (tokens)

1,000,000

License

NVIDIA Nemotron Open Model License

Date

2025-12-04

Decoder type

Hybrid MoE

Attention

Mostly Mamba-2 with a few GQA layers

Layer mix

6 GQA + 23 Mamba-2 + 23 MoE

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

6 KiB · Very low

Key detail

Interleaves Mamba-2 and MoE blocks, using attention only sparingly.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [13.2](https://artificialanalysis.ai/models/nvidia-nemotron-3-nano-30b-a3b)

Compare

#### Xiaomi MiMo-V2-Flash (309B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A719-xiaomi-mimo-v2-flash) [config.json](https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash/blob/main/config.json "XiaomiMiMo/MiMo-V2-Flash") [Tech report](https://arxiv.org/pdf/2601.02780)

Large MoE model that pushes sliding-window attention harder than most contemporaries.

Scale

309B total, 15B active (4.9% active)

Context (tokens)

262,144

License

MIT License

Date

2025-12-16

Decoder type

Sparse MoE

Attention

5:1 sliding-window/global attention

Layer mix

40 sliding-window + 8 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

144 KiB · Moderate

Key detail

Uses an unusually small 128-token local window plus multi-token prediction.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [30.4](https://artificialanalysis.ai/models/mimo-v2-flash)

Compare

#### GLM-4.7 (355B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A721-glm-5) [config.json](https://huggingface.co/zai-org/GLM-4.7/blob/main/config.json "zai-org/GLM-4.7") [Tech report](https://arxiv.org/pdf/2508.06471)

Immediate GLM predecessor that stays closer to the older GLM-4.5 style before the MLA shift.

Scale

355B total, 32B active (9% active)

Context (tokens)

202,752

License

MIT License

Date

2025-12-22

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Layer mix

92 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

368 KiB · Very high

Key detail

Serves as the pre-MLA, pre-sparse-attention baseline with the same 32B active path as GLM-4.5.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [34.2](https://artificialanalysis.ai/models/glm-4-7-non-reasoning)

Compare

#### Arcee AI Trinity Large (400B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A720-arcee-ai-trinity-large) [config.json](https://huggingface.co/arcee-ai/Trinity-Large-Base/blob/main/config.json "arcee-ai/Trinity-Large-Base") [Tech report](https://arxiv.org/pdf/2602.17004)

Arcee's flagship blends several efficiency tricks into a DeepSeek-like coarse MoE design.

Scale

400B total, 13B active (3.3% active)

Context (tokens)

512,000

License

Apache License 2.0

Date

2026-01-27

Decoder type

Sparse MoE

Attention

GQA with gated attention and 3:1 sliding-window/global attention

Layer mix

45 sliding-window + 15 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

240 KiB · High

Key detail

Combines QK-Norm, RoPE+NoPE, sandwich norm, and a coarse-grained MoE.

Compare

#### GLM-5 (744B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A721-glm-5) [config.json](https://huggingface.co/zai-org/GLM-5/blob/main/config.json "zai-org/GLM-5") [Tech report](https://arxiv.org/pdf/2602.15763)

Huge GLM refresh that adopts both MLA and DeepSeek Sparse Attention for flagship-scale inference.

Scale

744B total, 40B active (5.4% active)

Context (tokens)

202,752

License

MIT License

Date

2026-02-11

Decoder type

Sparse MoE

Attention

MLA with DeepSeek Sparse Attention

Layer mix

78 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

87.8 KiB · Moderate

Key detail

Bigger than GLM-4.7, with more experts and fewer layers.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [40.6](https://artificialanalysis.ai/models/glm-5-non-reasoning)

Compare

#### Nemotron 3 Super (120B-A12B)

[View in article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison#%C2%A7182-nemotron-3-super) [config.json](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16/blob/main/config.json "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16") [License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/) [Tech report](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf)

The Super variant scales up Nano and adds both latent experts and native speculative decoding support.

Scale

120B total, 12B active (10% active)

Context (tokens)

1,000,000

License

NVIDIA Nemotron Open Model License

Date

2026-03-11

Decoder type

Hybrid MoE

Attention

Mostly Mamba-2 with a few GQA layers

Layer mix

8 GQA + 40 Mamba-2 + 40 MoE

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

8 KiB · Very low

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [36.0](https://artificialanalysis.ai/models/nvidia-nemotron-3-super-120b-a12b)

Compare

#### Phi-4 (14B)

[config.json](https://huggingface.co/microsoft/phi-4/blob/main/config.json "microsoft/phi-4") [License](https://huggingface.co/microsoft/phi-4/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2412.08905)

Microsoft's 14B dense Phi refresh stays close to Phi-3-medium but swaps its sliding-window attention for full-context GQA and a larger tokenizer.

Scale

14B parameters

Context (tokens)

16,384

License

MIT License

Date

2024-12-12

Decoder type

Dense

Attention

GQA with RoPE

Layer mix

40 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

200 KiB · High

Key detail

Classic pre-norm RMSNorm stack with GQA, 40 heads, 10 KV heads, and a 100,352-token vocabulary.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [10.4](https://artificialanalysis.ai/models/phi-4)

Compare

#### xLSTM (7B)

[config.json](https://huggingface.co/NX-AI/xLSTM-7b/blob/main/config.json "NX-AI/xLSTM-7b") [License](https://huggingface.co/NX-AI/xLSTM-7b/blob/main/LICENSE) [Tech report](https://arxiv.org/abs/2503.13427)

Recurrent 7B language model that replaces self-attention with xLSTM blocks built around matrix memory.

Scale

7B parameters

Context (tokens)

No explicit limit

License

NXAI Community License Agreement

Date

2025-03-17

Decoder type

Recurrent

Attention

No self-attention; mLSTM recurrent layers with matrix memory

Layer mix

32 mLSTM

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

0 B · No cache

Key detail

Stateful recurrent architecture aimed at fast long-context inference without an explicit context window.

Compare

#### Qwen3 Coder Flash (30B-A3B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A74-qwen3-coder-next-an-attention-hybrid-for-coding) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3) [config.json](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/config.json "Qwen/Qwen3-Coder-30B-A3B-Instruct") [License](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE)

Coding-tuned Qwen model that keeps a straightforward grouped-query MoE stack instead of the newer hybrid-attention variants.

Scale

30B total, 3.3B active (11% active)

Context (tokens)

256,000

License

Apache License 2.0

Date

2025-07-31

Decoder type

Sparse MoE

Attention

GQA

Layer mix

48 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

96 KiB · Moderate

Key detail

Uses 128 experts with 8 active per token and a native 256k context window for coding workloads.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [20.0](https://artificialanalysis.ai/models/qwen3-coder-30b-a3b-instruct)

Compare

#### Kimi K2.5 (1T)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A72-moonshot-ais-kimi-k25-a-deepseek-like-model-at-a-1-trillion-parameter-scale) [config.json](https://huggingface.co/moonshotai/Kimi-K2.5/blob/main/config.json "moonshotai/Kimi-K2.5") [License](https://huggingface.co/moonshotai/Kimi-K2.5/blob/main/LICENSE) [Tech report](https://arxiv.org/pdf/2602.02276)

Native-multimodal Moonshot flagship that keeps the K2/DeepSeek-style MoE layout and pushes native context to 256k.

Scale

1T total, 32B active (3.2% active)

Context (tokens)

256,000

License

Modified MIT License

Date

2026-01-27

Decoder type

Sparse MoE

Attention

MLA

Layer mix

61 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

68.6 KiB · Low

Key detail

Keeps the 384-expert K2 backbone, but adds multimodal capabilities (not shown) and doubles the native context length.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [37.3](https://artificialanalysis.ai/models/kimi-k2-5-non-reasoning)

Compare

#### Step 3.5 Flash (196B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A73-stepfuns-step-35-flash-good-performance-at-great-tokens-sec-throughput) [config.json](https://huggingface.co/stepfun-ai/Step-3.5-Flash/blob/main/config.json "stepfun-ai/Step-3.5-Flash") [Tech report](https://arxiv.org/pdf/2602.10604)

Throughput-oriented MoE model that stays competitive with much larger DeepSeek-style systems.

Scale

196B total, 11B active (5.6% active)

Context (tokens)

262,144

License

Apache License 2.0

Date

2026-02-01

Decoder type

Sparse MoE

Attention

GQA with 3:1 sliding-window attention

Layer mix

36 sliding-window + 12 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

192 KiB · High

Key detail

Uses MTP-3 during both training and inference for unusually high throughput.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [37.8](https://artificialanalysis.ai/models/step-3-5-flash)

Compare

#### Nanbeige 4.1 (3B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A77-nanbeige-41-3b-a-strong-llama-3-successor) [config.json](https://huggingface.co/Nanbeige/Nanbeige4.1-3B/blob/main/config.json "Nanbeige/Nanbeige4.1-3B") [Tech report](https://arxiv.org/pdf/2602.13367)

Small on-device oriented model that stays close to Llama 3.2 while nudging the scaling choices.

Scale

3B parameters

Context (tokens)

262,144

License

Apache License 2.0

Date

2026-02-10

Decoder type

Dense

Attention

GQA

Layer mix

32 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

64 KiB · Low

Key detail

Llama-like stack without tying input embeddings to the output layer.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [16.1](https://artificialanalysis.ai/models/nanbeige4-1-3b)

Compare

#### MiniMax-M2.5 (230B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A76-minimax-m25-a-strong-coder-with-only-230b-parameters) [config.json](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/config.json "MiniMaxAI/MiniMax-M2.5")

Popular 230B coder that opts for a classic architecture instead of the newer hybrid-attention ideas.

Scale

230B total, 10B active (4.3% active)

Context (tokens)

196,608

License

Modified MIT License

Date

2026-02-12

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Layer mix

62 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

248 KiB · High

Key detail

Deliberately avoids sliding-window or linear-attention hybrids while keeping a 10B active path.

Compare

#### Tiny Aya (3.35B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A710-tiny-aya-a-335b-model-with-strong-multilingual-support) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/15_tiny-aya) [config.json](https://huggingface.co/CohereLabs/tiny-aya-base/blob/main/config.json "CohereLabs/tiny-aya-base") [Tech report](https://arxiv.org/pdf/2603.11510)

Compact multilingual model from Cohere with a rare parallel transformer block.

Scale

3.35B parameters

Context (tokens)

8,192

License

Creative Commons Attribution-NonCommercial 4.0

Date

2026-02-13

Decoder type

Dense

Attention

GQA with 3:1 sliding-window attention

Layer mix

27 sliding-window + 9 global

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

72 KiB · Low

Key detail

Runs attention and the MLP in parallel while mixing RoPE with NoPE.

Compare

#### Ling 2.5 (1T)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A79-ant-groups-ling-25-1t-with-lightning-attention) [config.json](https://huggingface.co/inclusionAI/Ling-2.5-1T/blob/main/config.json "inclusionAI/Ling-2.5-1T")

Trillion-parameter long-context model that swaps DeltaNet for Lightning Attention.

Scale

1T total, 63B active (6.3% active)

Context (tokens)

256,000

License

MIT License

Date

2026-02-15

Decoder type

Sparse hybrid

Attention

Lightning Attention plus MLA

Layer mix

10 MLA + 70 Lightning Attention

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

11.2 KiB · Very low

Key detail

Uses a 7:1 linear-attention/MLA ratio and a much larger 63B active path.

Compare

#### Qwen3.5 (397B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A78-qwen35-and-the-continutation-of-hybrid-attention) [From scratch](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/16_qwen3.5) [config.json](https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/config.json "Qwen/Qwen3.5-397B-A17B") [License](https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/LICENSE)

Mainline Qwen refresh that brings the Next-style hybrid attention into the flagship series.

Scale

397B total, 17B active (4.3% active)

Context (tokens)

262,144

License

Apache License 2.0

Date

2026-02-16

Decoder type

Sparse hybrid

Attention

3:1 Gated DeltaNet and Gated Attention

Layer mix

15 gated attention + 45 DeltaNet

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

30 KiB · Low

Key detail

Turns the former Qwen3-Next side branch into the new core design with 512 experts and 17B active parameters.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [40.1](https://artificialanalysis.ai/models/qwen3-5-397b-a17b-non-reasoning)

Compare

#### Sarvam (30B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A7update-1-sarvam-30b-and-105b-mar-6-2026) [config.json](https://huggingface.co/sarvamai/sarvam-30b/blob/main/config.json "sarvamai/sarvam-30b") [Tech report](https://www.sarvam.ai/blogs/sarvam-30b-105b)

Reasoning-oriented Indian-language sparse MoE that keeps GQA at the smaller size.

Scale

30B total, 2.4B active (8% active)

Context (tokens)

131,072

License

Apache License 2.0

Date

2026-03-03

Decoder type

Sparse MoE

Attention

GQA with QK-Norm

Layer mix

19 GQA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

19 KiB · Very low

Key detail

Large vocabulary and strong Indic language support paired with a reasoning-focused sparse MoE design.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [12.3](https://artificialanalysis.ai/models/sarvam-30b)

Compare

#### Sarvam (105B)

[View in article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight#%C2%A7update-1-sarvam-30b-and-105b-mar-6-2026) [config.json](https://huggingface.co/sarvamai/sarvam-105b/blob/main/config.json "sarvamai/sarvam-105b") [Tech report](https://www.sarvam.ai/blogs/sarvam-30b-105b)

Larger Sarvam variant keeps the sparse MoE layout but switches from GQA to MLA.

Scale

105B total, 10.3B active (9.8% active)

Context (tokens)

131,072

License

Apache License 2.0

Date

2026-03-03

Decoder type

Sparse MoE

Attention

MLA with KV LayerNorm and NoPE + RoPE

Layer mix

32 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

36 KiB · Low

Key detail

Large vocabulary and strong Indic language support carried into the larger MLA-based sparse MoE variant.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [18.2](https://artificialanalysis.ai/models/sarvam-105b)

Compare

#### Mistral Small 4 (119B)

[config.json](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603/blob/main/config.json "mistralai/Mistral-Small-4-119B-2603") [Tech report](https://mistral.ai/news/mistral-small-4)

Multimodal Mistral Small refresh that jumps from the older dense 24B stack to an MLA-based sparse MoE design.

Scale

119B total, 6.63B active (5.6% active)

Context (tokens)

256,000

License

Apache License 2.0

Date

2026-03-16

Decoder type

Sparse MoE

Attention

MLA

Layer mix

36 MLA

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

22.5 KiB · Very low

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [26.9](https://artificialanalysis.ai/models/mistral-small-4)

Compare

#### Nemotron 3 Nano (4B)

[config.json](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16/blob/main/config.json "nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16") [License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/) [Tech report](https://huggingface.co/blog/nvidia/nemotron-3-nano-4b)

Compact on-device hybrid that compresses Nemotron Nano 9B v2 into a mostly Mamba-2 stack with only four attention layers.

Scale

4B parameters

Context (tokens)

262,144

License

NVIDIA Nemotron Open Model License

Date

2026-03-16

Decoder type

Dense hybrid

Attention

GQA with only 4 attention layers

Layer mix

4 GQA + 21 Mamba-2 + 17 FFN

KV cache / token (bf16) [info](https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/)

16 KiB · Very low

Key detail

Uses a 42-layer stack with 21 Mamba-2 blocks, 17 ReLU² FFNs, and just 4 GQA layers.

AA Intelligence Index [info](https://sebastianraschka.com/llm-architecture-gallery/aa-intelligence-index/)

Total score [14.7](https://artificialanalysis.ai/models/nvidia-nemotron-3-nano-4b)

The original comparison article that walks through the architecture figures in context and explains the key design choices across dense, MoE, MLA, and hybrid decoder families.

[Read article](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)

[![The Big LLM Architecture Comparison overview figure](https://sebastianraschka.com/llm-architecture-gallery/images/source-articles/the-big-llm-architecture-comparison.webp)](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)

A focused follow-up article on the GPT-2 to gpt-oss shift, covering the architectural changes around RoPE, SwiGLU, MoE, GQA, sliding-window attention, and RMSNorm.

[Read article](https://magazine.sebastianraschka.com/p/from-gpt-2-to-gpt-oss-analyzing-the)

[![From GPT-2 to gpt-oss: Analyzing the Architectural Advances hero image](https://sebastianraschka.com/llm-architecture-gallery/images/source-articles/from-gpt-2-to-gpt-oss.jpg)](https://magazine.sebastianraschka.com/p/from-gpt-2-to-gpt-oss-analyzing-the)

A DeepSeek-focused follow-up covering the V3.2 architecture updates, sparse attention changes, and the broader RL-related developments around the release.

[Read article](https://magazine.sebastianraschka.com/p/technical-deepseek)

[![From DeepSeek V3 to V3.2: Architecture, Sparse Attention, and RL Updates hero image](https://sebastianraschka.com/images/blog/2025/technical-deepseek/hero.jpg)](https://magazine.sebastianraschka.com/p/technical-deepseek)

Follow-up article covering the additional open-weight architecture releases from early 2026, including the newer MiniMax, Qwen, Ling, and Sarvam families.

[Read article](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight)

[![A Dream of Spring for Open-Weight LLMs hero image](https://sebastianraschka.com/llm-architecture-gallery/images/source-articles/a-dream-of-spring-for-open-weight.webp)](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight)