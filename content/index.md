---
title: Welcome to Senj's Digital Garden
publish: "true"
tags:
  - quartz
  - Blog
---
欢迎来到我的数字花园，这里是我在学习、生活中的经历、思考、学习记录，欢迎阅读、斧正。

```dataviewjs
dv.span("** 😊 My HeatMap  📝**") /* optional ⏹️💤⚡⚠🧩↑↓⏳📔💾📁📝🔄🔀⌨️🕸️📅🔍✨ */
const calendarData = {
    year: 2024,  // (optional) defaults to current year
    colors: {    // (optional) defaults to green
        blue:        ["#8cb9ff", "#69a3ff", "#428bff", "#1872ff", "#0058e2"], // first entry is considered default if supplied
        green:       ["#c6e48b", "#7bc96f", "#49af5d", "#2e8840", "#196127"],
        red:         ["#ff9e82", "#ff7b55", "#ff4d1a", "#e73400", "#bd2a00"],
        orange:      ["#ffa244", "#fd7f00", "#dd6f00", "#bf6000", "#9b4e00"],
        pink:        ["#ff96cb", "#ff70b8", "#ff3a9d", "#ee0077", "#c30062"],
        orangeToRed: ["#ffdf04", "#ffbe04", "#ff9a03", "#ff6d02", "#ff2c01"]
    },
    showCurrentDayBorder: true, // (optional) defaults to true
    defaultEntryIntensity: 4,   // (optional) defaults to 4
    intensityScaleStart: 10,    // (optional) defaults to lowest value passed to entries.intensity
    intensityScaleEnd: 100,     // (optional) defaults to highest value passed to entries.intensity
    entries: [],                // (required) populated in the DataviewJS loop below
}

//DataviewJS loop
for (let page of dv.pages('"daily notes"').where(p => p.exercise)) {
    dv.span("<br>" + page.file.name) // uncomment for troubleshooting
    calendarData.entries.push({
        date: page.file.name,     // (required) Format YYYY-MM-DD
        intensity: page.exercise, // (required) the data you want to track, will map color intensities automatically
        content: "",           // (optional) Add text to the date cell
        color: "orange",          // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
    })
}
renderHeatmapCalendar(this.container, calendarData)
```

>[!tip] 🎵: Have a relax!
> ![[未闻花名.jpg]]
>![[V.A. - 未闻花名 (口琴版).mp3]]

## Learn in 2024

- [ ] 1 月 ~ 3 月：[[复试学习计划]]、[[健身减肥计划]] ；
- [ ] 4 月 ~ 8 月：健身计划、阅读《毛泽东选集》、阅读《费曼的物理学讲义》；

## 11912

我的清深上岸经验：[[从北雷村到五道口深圳分院]] ；

[[912学习攻略]] ；

## My CS Career

### 计算机科学基础

#### 编程语言

- Cpp

- Python

- Rust

#### 数据结构

- [邓俊辉老师](https://dsa.cs.tsinghua.edu.cn/~deng/ds/dsacpp/)的课程：[[Intro|数据结构C++版]]

#### 操作系统

- 《精髓与设计原理》读书笔记：[[Internal&Design-Principle-Notes]] ；
- 《rCore Tutorial Book v3》；

#### 计算机组成原理

- CSAPP
- RISC-V
- THU 刘卫东老师的PPT

#### 计算机网络

- [[Top2down-Summary|自顶向下 8th]]

#### 算法

- AcWing：算法基础课、算法提高课、算法进阶课

#### 编译原理

### 人工智能

#### 机器学习

- [林轩田老师](https://www.csie.ntu.edu.tw/~htlin/mooc/)的课程：
	- [[ML-foundations-Intro|机器学习基石]]
	- [[ML-techniques-Intro|机器学习技法]]

#### 深度学习

- 李宏毅老师的课程：

### 学术生涯

### 随便捣鼓

#### Linux

- [[ArchLinux使用笔记]]

## Keen to Explore the World

## Consider Society from the Perspective of Marxist

### Marx&Engels

### Lenin

### Mao

- [[论持久战]]

### Deng

- [[中国共产党中央委员会关于建国以来党的若干历史问题的决议]]

## Keep Healthy

## About me

- 个人介绍

- 如何利用 Obsidian+Quartz+GitHub Pages 构建个人知识管理库及博客分享站？