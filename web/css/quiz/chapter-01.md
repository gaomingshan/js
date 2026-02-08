# 第 1 章：CSS 核心概念 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 基础概念

### 题目

CSS 的全称是什么？

**选项：**
- A. Computer Style Sheets
- B. Cascading Style Sheets
- C. Creative Style Sheets
- D. Colorful Style Sheets

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS (Cascading Style Sheets) - 层叠样式表**

**关键词解释：**
- **Cascading（层叠）**：多个样式规则可以叠加，按优先级生效
- **Style（样式）**：控制网页的视觉表现
- **Sheets（表）**：样式规则的集合

**CSS 的作用：**
```css
/* 控制网页外观 */
h1 {
  color: blue;
  font-size: 24px;
}
```

**核心特性：**
- 与 HTML 分离，专注样式
- 支持层叠和继承
- 可复用，提高开发效率

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 引入方式

### 题目

以下哪种方式引入 CSS 的优先级最高？

**选项：**
- A. 外部样式表（`<link>`）
- B. 内部样式表（`<style>`）
- C. 内联样式（`style` 属性）
- D. 浏览器默认样式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**CSS 引入方式的优先级（从高到低）**

**1. 内联样式（优先级最高）**
```html
<h1 style="color: red;">标题</h1>
```

**2. 内部样式表**
```html
<style>
  h1 { color: blue; }
</style>
```

**3. 外部样式表**
```html
<link rel="stylesheet" href="style.css">
```

**4. 浏览器默认样式（优先级最低）**

**注意：**
- `!important` 可以提升优先级
- 相同优先级时，后定义的覆盖先定义的

```css
/* 示例 */
h1 { color: blue; }
h1 { color: red; }  /* red 生效 */
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** CSS 特性

### 题目

CSS 是一门编程语言。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**CSS 不是编程语言**

**CSS 的定位：**
- **样式表语言**：描述文档的呈现方式
- **声明式语言**：声明想要的效果，而非如何实现

**与编程语言的区别：**

| 特性 | 编程语言 | CSS |
|------|---------|-----|
| 逻辑控制 | ✅ 有（if/for/while） | ❌ 无 |
| 变量 | ✅ 有 | ⚠️ 有限（CSS变量） |
| 函数 | ✅ 有 | ⚠️ 有限（calc等） |
| 图灵完备 | ✅ 是 | ❌ 否 |

**CSS 的作用：**
```css
/* 描述样式，而非逻辑 */
.button {
  background: blue;
  padding: 10px 20px;
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** CSS 版本

### 题目

以下哪些是 CSS3 引入的新特性？

**选项：**
- A. Flexbox 布局
- B. Grid 布局
- C. 动画（animation）
- D. 自定义属性（CSS 变量）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**CSS3 的主要新特性（全部正确）**

**1. Flexbox 布局**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**2. Grid 布局**
```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
}
```

**3. 动画**
```css
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

.box {
  animation: slide 1s ease infinite;
}
```

**4. CSS 变量**
```css
:root {
  --primary-color: #3b82f6;
}

.box {
  color: var(--primary-color);
}
```

**其他 CSS3 特性：**
- 圆角（border-radius）
- 阴影（box-shadow）
- 渐变（linear-gradient）
- 媒体查询（@media）
- 过渡（transition）

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 语法结构

### 题目

以下 CSS 代码的输出结果是什么？

```css
.box {
  color: blue;
  color: red;
}
```

**选项：**
- A. 蓝色
- B. 红色
- C. 同时显示蓝色和红色
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS 的层叠规则：后定义覆盖先定义**

**工作原理：**
```css
.box {
  color: blue;  /* 先定义 */
  color: red;   /* 后定义，覆盖 blue */
}
/* 最终：color: red */
```

**相同选择器、相同属性时：**
- 最后定义的值生效
- 前面的值被覆盖

**对比不同属性：**
```css
.box {
  color: blue;   /* 生效 */
  background: red; /* 生效 */
}
/* 两者都生效，因为是不同属性 */
```

**层叠顺序：**
1. 浏览器默认样式
2. 外部样式表
3. 内部样式表
4. 内联样式
5. `!important`

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 工作流程

### 题目

浏览器处理 CSS 的基本流程是？

**选项：**
- A. HTML → CSS → 渲染
- B. HTML → DOM → CSS → CSSOM → 渲染树 → 渲染
- C. CSS → HTML → 渲染
- D. 直接渲染

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**浏览器渲染流程**

```
1. 解析 HTML → DOM 树
   ↓
2. 解析 CSS → CSSOM 树
   ↓
3. DOM + CSSOM → 渲染树（Render Tree）
   ↓
4. 布局（Layout）- 计算位置和大小
   ↓
5. 绘制（Paint）- 绘制像素
   ↓
6. 合成（Composite）- 合成图层
```

**详细说明：**

**DOM 树：**
```
html
  ├── head
  │   └── title
  └── body
      ├── h1
      └── p
```

**CSSOM 树：**
```
body { font-size: 16px }
  └── h1 { color: blue }
```

**渲染树（Render Tree）：**
- 结合 DOM 和 CSSOM
- 只包含可见元素
- 跳过 `display: none` 的元素

**性能优化：**
- CSS 会阻塞渲染
- 将关键 CSS 内联
- 异步加载非关键 CSS

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 层叠与继承

### 题目

以下哪些是 CSS 的核心特性？

**选项：**
- A. 层叠（Cascade）
- B. 继承（Inheritance）
- C. 特异性（Specificity）
- D. 模块化（Modularity）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**CSS 的三大核心特性**

**1. 层叠（Cascade）**
```css
/* 多个规则应用于同一元素 */
h1 { color: blue; }        /* 来源1 */
h1 { color: red; }         /* 来源2，覆盖来源1 */
```

**优先级顺序：**
- `!important`
- 内联样式
- ID 选择器
- 类选择器
- 元素选择器

**2. 继承（Inheritance）**
```css
body {
  color: #333;  /* 子元素继承 */
  font-size: 16px;
}

p {
  /* 自动继承 body 的 color 和 font-size */
}
```

**可继承属性：**
- 文本相关：color, font-size, font-family, line-height
- 列表相关：list-style
- 不可继承：width, height, margin, padding, border

**3. 特异性（Specificity）**
```css
/* 特异性计算 */
#header { }        /* (1,0,0) */
.nav { }           /* (0,1,0) */
div { }            /* (0,0,1) */
#header .nav div { /* (1,1,1) */
```

**D 选项（模块化）：**
- 不是 CSS 原生特性
- 是工程化实践（CSS Modules、BEM等）

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 层叠规则

### 题目

以下代码中，`<p>` 元素的文字颜色是什么？

```html
<div id="container" class="wrapper">
  <p class="text" style="color: green;">Hello</p>
</div>
```

```css
#container p { color: blue; }
.wrapper .text { color: red; }
p { color: yellow !important; }
```

**选项：**
- A. green
- B. blue
- C. red
- D. yellow

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**优先级计算**

**优先级规则（从高到低）：**
1. `!important`
2. 内联样式
3. ID 选择器
4. 类选择器
5. 元素选择器

**本题分析：**

```css
/* 1. 内联样式 */
style="color: green;"  /* 优先级：1000 */

/* 2. ID + 元素 */
#container p { color: blue; }  /* 优先级：101 */

/* 3. 类 + 类 */
.wrapper .text { color: red; }  /* 优先级：20 */

/* 4. 元素 + !important */
p { color: yellow !important; }  /* !important 最高 */
```

**优先级对比：**
```
!important          > 内联样式
yellow !important   > green (内联)
```

**结论：** `!important` 优先级最高，因此显示 **yellow**

**最佳实践：**
- 避免滥用 `!important`
- 通过提高选择器特异性解决问题
- 保持 CSS 代码的可维护性

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 继承与计算

### 题目

以下代码中，`<span>` 元素的字体大小是多少？

```html
<div style="font-size: 20px;">
  <p style="font-size: 1.5em;">
    <span></span>
  </p>
</div>
```

**选项：**
- A. 20px
- B. 30px
- C. 1.5em
- D. 继承浏览器默认值

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**em 单位的继承与计算**

**计算过程：**

```
1. div 的 font-size: 20px（设定值）

2. p 的 font-size: 1.5em
   计算：1.5 × 父元素字体大小
   = 1.5 × 20px = 30px

3. span 继承 p 的 font-size
   = 30px
```

**详细说明：**

**em 单位：**
- 相对于父元素的 font-size
- 会逐层计算并固定

```css
/* 示例 */
div { font-size: 20px; }
p { font-size: 1.5em; }    /* = 30px */
span { font-size: 1.2em; } /* = 1.2 × 30px = 36px */
```

**继承机制：**
- `font-size` 是可继承属性
- 子元素继承父元素的**计算值**（30px），而非相对值（1.5em）

**对比 rem：**
```css
html { font-size: 16px; }
p { font-size: 1.5rem; }  /* = 1.5 × 16px = 24px */
/* rem 始终相对根元素 */
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

以下哪些是推荐的 CSS 组织方式？

**选项：**
- A. 将所有样式写在一个超大的 CSS 文件中
- B. 使用语义化的类名（如 `.header`, `.nav`）
- C. 按功能模块拆分 CSS 文件
- D. 使用 CSS 方法论（如 BEM、OOCSS）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B, C, D

### 📖 解析

**CSS 组织最佳实践**

**✅ B. 语义化类名**
```css
/* 推荐：语义化 */
.header { }
.nav { }
.article { }

/* 不推荐：无意义 */
.box1 { }
.red-text { }
```

**✅ C. 模块化拆分**
```
styles/
  ├── base.css       # 基础样式
  ├── layout.css     # 布局
  ├── components.css # 组件
  └── utils.css      # 工具类
```

**✅ D. CSS 方法论**

**BEM（Block Element Modifier）：**
```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__content { }

/* Modifier */
.card--featured { }
```

**OOCSS（面向对象CSS）：**
```css
/* 结构与皮肤分离 */
.btn { padding: 10px 20px; }     /* 结构 */
.btn-primary { background: blue; } /* 皮肤 */
```

**❌ A. 单个超大文件**
- 难以维护
- 加载慢
- 多人协作困难

**其他最佳实践：**
- 使用 CSS 预处理器（Sass/Less）
- 采用 PostCSS 自动处理
- 模块化打包（Webpack/Vite）

</details>

---

**导航**  
[返回目录](../README.md) | [下一章：第 2 章 - 选择器系统](./chapter-02.md)
