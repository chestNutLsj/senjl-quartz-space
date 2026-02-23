
This file provides guidance to Codex/Opencode when working with code in this repository.

## Vault Overview

这是一个个人知识管理库（Obsidian Vault），用于组织计算机科学学习、研究论文阅读、工程实践和生活记录。笔记采用中文撰写，使用 Obsidian Flavored Markdown 格式，并通过 Quartz + GitHub Pages 发布为个人博客。

## Directory Structure

笔记库采用数字前缀的分类系统，主要结构如下：

- **0-Assets/**: 资产文件夹
  - `Templates/`: 笔记模板（包括 Zotero 引用模板）
  - `Excalidraw/`: 手绘图表
  - `Diary/`: 日记
  - `Inbox/`: 临时收件箱
  - `assets/`: 附件默认存储位置（配置在 `.obsidian/app.json`）

- **1-Theory/**: 计算机科学理论基础
  - `1-Algorithm/`: 数据结构与算法
  - `2-Software/`: 软件工程
  - `3-System/`: 操作系统、计算机组成、网络
  - `4-AI-Stack/`: 机器学习、深度学习、强化学习、System for AI

- **2-Engineering/**: 工程实践
  - `1-FrontEnd/`: 前端开发
  - `2-MobileEnd/`: 移动端开发
  - `3-BackEnd/`: 后端开发
  - `4-VibeCoding/`: 随意编程实践
  - `5-Tools/`: 工具学习（LaTeX, Mermaid 等）

- **3-Research/**: 学术研究
  - `0-Report Slides/`: 组会汇报记录
  - `1-DataCenter/`: 数据中心网络研究（路由、架构、集体通信、联邦学习等）
  - `2-LLM/`: 大语言模型研究（训练、推理、基础模型、调研）
  - `3-GPU/`: GPU 相关研究
  - `Paper Reading Records.md`: 论文阅读记录总表
  - `Paper-Reading-Template.md`: 论文阅读模板
  - `Paper-Reading-Methods.md`: 论文阅读方法论与 AI 辅助 prompts

- **7-Life/**: 生活记录
  - `Health/`: 健康相关

- **8-ComputerCulture/**: 计算机文化

- **9-Marxist/**: 马克思主义经典著作阅读
  - 按照理论家分类：`10-Marx&Engels/`, `20-Lenin/`, `30-Mao/`, `40-Deng/`

- **index.md**: 首页，作为数字花园的入口，包含学习计划、知识体系索引

## Note Organization Principles

### 笔记命名与链接

1. **命名约定**:
   - 论文笔记通常包含后缀：`：Annotation` (详细注解) 或 `：Conclusion` (总结)
   - 理论笔记使用中英文混合或纯中文命名
   - 使用连字符或驼峰命名法

2. **内部链接**:
   - 使用 Obsidian 的 wikilink 格式：`[[链接文本]]`
   - 链接格式设置为 "shortest"（`.obsidian/app.json` 配置）
   - 尽量不使用 Markdown 链接（`useMarkdownLinks: false`），除非使用上传到图床的图片时

3. **Frontmatter 约定**:
   ```yaml
   ---
   tags: [tag1, tag2]
   date: YYYY-MM-DD
   ---
   ```

### 研究论文笔记结构

论文笔记遵循标准化模板（`3-Research/Paper-Reading-Template.md`），包含以下核心问题：

1. **Problem**: 论文解决什么问题？为什么重要？
2. **Context**: 之前的 state of the art 是什么？本文如何推进？
3. **Design**: 系统如何设计？关键见解是什么？
4. **Results**: 如何评估设计？关键结果是什么？
5. **Questions**: 还有哪些问题尚未解决？

论文阅读方法详见 `3-Research/Paper-Reading-Methods.md`，包含按章节分析的详细 AI prompts。

### 分类系统

研究笔记按主题细分子目录：
- 数据中心网络：`Architecture`, `Routing Algorithm`, `CollectiveComm`, `LLMTraining`, `Path Control`, `Storage` 等
- 大语言模型：`Training`, `Inference`, `BaseModel`, `Survey`

## Working with Notes

### 创建新笔记

1. **论文笔记**:
   - 放置在 `3-Research/` 下对应的子目录
   - 命名格式：`论文标题：Annotation` 或 `论文标题：Conclusion`
   - 在 `Paper Reading Records.md` 中添加记录

2. **理论笔记**:
   - 放置在 `1-Theory/` 下对应的子目录，对于零碎的知识或是不容易进行分类的知识，可以归放到 `_wiki/` 子目录中
   - 使用清晰的层级结构（数字前缀表示章节顺序）

3. **工程实践笔记**:
   - 放置在 `2-Engineering/` 下对应的子目录

### 资产管理

- 新文件默认创建在当前目录（`newFileLocation: "current"`）
- 附件自动存储在当前笔记目录下的 `./assets/` 文件夹
- 链接更新：修改文件名时自动更新链接（`alwaysUpdateLinks: true`）
- 删除文件移至本地 `.trash/` 目录（`trashOption: "local"`）

### Obsidian 插件生态

该笔记库使用了大量插件来增强功能，重要插件包括：
- **Dataview**: 数据查询与可视化（暂时没有启用）
- **Excalidraw**: 手绘图表
- **Bibnotes**: 文献管理（连接 Zotero）
- **Pandoc/Better Export PDF**: 文档导出
- **Homepage**: 设置首页为 `index.md`
- **Obsidian Linter**: 笔记格式化
- **Easy Typing**: 中英文输入优化

### 博客发布

- 笔记通过 Quartz + GitHub Pages 发布
- 使用 frontmatter 中的 `publish: "true"` 控制发布，但不要每篇都如此设置，具体发布到博客与否需要经过我的决策
- 首页为 `index.md`，作为数字花园入口

## Best Practices for Note Assistance

### 撰写笔记时

1. 保持中文为主要语言，专业术语可使用英文
2. 遵循既有的目录结构和命名约定
3. 论文笔记使用标准模板结构
4. 使用 wikilink 格式创建内部链接
5. 适当添加 frontmatter 元数据（tags, date, publish）

### 整理笔记结构时

1. 尊重现有的数字前缀分类系统（0-9）
2. 在对应主题目录下创建子目录以细分主题
3. 保持 `index.md` 作为知识体系的总索引
4. 维护 `Paper Reading Records.md` 的论文阅读记录

### 链接与引用时

1. 优先使用 `[[wikilink]]` 格式
2. 检查链接的有效性

### 语言与风格

1. 主要使用中文撰写，保持学术严谨性
2. 技术术语可保留英文原文
3. 论文笔记中的关键概念需要精炼总结
4. 适当使用 callout 语法（`> [!tip]`, `> [!question]` 等）增强可读性
5. LaTeX 公式格式：块级公式的 `$$` 分隔符必须单独成行
   ```markdown
   $$
   E = mc^2
   $$
   ```
   这是由于 Quartz 底层解析库的限制要求

## Research Focus Areas

当前研究重点（基于 `index.md` 和目录结构）：

1. **数据中心网络**: 路由算法、网络架构、集体通信、LLM 训练与推理
2. **大语言模型**: 训练系统、推理优化、基础模型分析
3. **GPU 编程**: CUDA、Triton、TileLang
4. **System for AI**: AI 系统优化

## Notes on File Operations

- 当修改现有笔记时，确保保留原有的 frontmatter 和结构
- 创建新笔记时，参考同类笔记的格式
- 图片和附件应存储在笔记同目录的 `assets/` 文件夹
- 避免在笔记库根目录创建临时文件
