# 第 12 章：正常流 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 正常流定义

### 题目

正常流（Normal Flow）是指？

**选项：**
- A. 元素按照浮动规则排列
- B. 元素按照绝对定位排列
- C. 元素按照默认的块级和行内规则排列
- D. 元素按照 flex 规则排列

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**正常流（Normal Flow）**

元素在未设置浮动、定位的情况下，按照默认规则排列。

**包含：**
- 块级盒的块级格式化
- 行内盒的行内格式化
- 块级盒和行内盒的相对定位

**在正常流中：**
```css
/* 块级元素 */
div, p, h1 { display: block; }
/* 垂直排列，独占一行 */

/* 行内元素 */
span, a { display: inline; }
/* 水平排列，不换行 */
```

**脱离正常流：**
```css
float: left/right;          /* 浮动 */
position: absolute/fixed;   /* 绝对/固定定位 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 块级盒

### 题目

块级盒的特点是？

**选项：**
- A. 不独占一行
- B. 独占一行，垂直排列
- C. 宽度由内容决定
- D. 不能设置宽高

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**块级盒（Block-level Box）**

```css
div, p, h1, section, article {
  display: block;
}
```

**特点：**
- ✅ 独占一行
- ✅ 垂直排列
- ✅ 可设置宽高
- ✅ 默认宽度 100%
- ✅ 垂直 margin 会合并

**示例：**
```html
<div>Block 1</div>
<div>Block 2</div>
<!-- 垂直排列 ↓ -->
```

**对比行内盒：**
```css
span, a {
  display: inline;
}
/* 水平排列，不独占一行 */
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 行内盒

### 题目

行内盒可以设置 width 和 height。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**行内盒不能设置宽高**

```css
span {
  display: inline;
  width: 100px;     /* 无效 ❌ */
  height: 50px;     /* 无效 ❌ */
  padding: 10px;    /* 有效（但不影响行高）✅ */
  margin: 10px;     /* 水平有效，垂直无效 */
}
```

**行内盒特点：**
- ❌ 不能设置 width/height
- ⚠️ 垂直 padding/margin 不影响布局
- ✅ 水平 padding/margin 有效
- ✅ 宽度由内容决定

**如需设置宽高：**
```css
/* 方案1：inline-block */
span {
  display: inline-block;
  width: 100px;   ✅
  height: 50px;   ✅
}

/* 方案2：block */
span {
  display: block;
  width: 100px;   ✅
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** inline-block

### 题目

`display: inline-block` 的特点是？

**选项：**
- A. 不独占一行
- B. 可以设置宽高
- C. 可以设置垂直 margin
- D. 元素之间有空白间隙

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**inline-block 特性（全部正确）**

**✅ A. 不独占一行**
```css
.box {
  display: inline-block;
}
/* 像 inline 一样水平排列 */
```

**✅ B. 可设置宽高**
```css
.box {
  display: inline-block;
  width: 100px;   ✅
  height: 50px;   ✅
}
```

**✅ C. 垂直 margin 有效**
```css
.box {
  display: inline-block;
  margin: 20px;   /* 上下左右都有效 ✅ */
}
```

**✅ D. 空白间隙问题**
```html
<div class="box">A</div>
<div class="box">B</div>
<!-- HTML中的换行会产生空格 -->
```

**解决空白间隙：**
```css
/* 方案1：父元素 */
.parent {
  font-size: 0;
}
.box {
  font-size: 16px;
}

/* 方案2：负 margin */
.box {
  margin-right: -4px;
}

/* 方案3：不换行 */
<div class="box">A</div><div class="box">B</div>
```

**对比：**

| 特性 | inline | inline-block | block |
|------|--------|--------------|-------|
| 独占一行 | ❌ | ❌ | ✅ |
| 设置宽高 | ❌ | ✅ | ✅ |
| 垂直margin | ❌ | ✅ | ✅ |
| 空白间隙 | ✅ | ✅ | ❌ |

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 匿名盒

### 题目

以下代码会产生几个盒子？

```html
<div>
  Some text
  <span>inline</span>
  more text
</div>
```

**选项：**
- A. 1个
- B. 2个
- C. 3个
- D. 4个

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**匿名盒生成**

```html
<div>
  Some text        ← 匿名行内盒 1
  <span>inline</span>  ← 显式盒 2
  more text        ← 匿名行内盒 3
</div>              ← 块级盒 4
```

**生成的盒子：**
1. `<div>` - 块级盒
2. "Some text" - 匿名行内盒
3. `<span>` - 行内盒
4. "more text" - 匿名行内盒

**匿名盒规则：**
- 直接文本节点会被包装成匿名行内盒
- 不能通过 CSS 选择器选中
- 继承父元素样式

**完整结构：**
```
块级盒 (div)
  ├─ 匿名行内盒 ("Some text")
  ├─ 行内盒 (<span>)
  └─ 匿名行内盒 ("more text")
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 块级格式化

### 题目

在正常流中，块级盒的垂直外边距会？

**选项：**
- A. 相加
- B. 合并（取较大值）
- C. 相减
- D. 不受影响

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**外边距合并（Margin Collapse）**

```css
.box1 {
  margin-bottom: 30px;
}

.box2 {
  margin-top: 20px;
}

/* 实际间距 = max(30px, 20px) = 30px */
```

**合并规则：**
- 垂直方向才会合并
- 取较大值
- 只发生在正常流的块级盒

**不合并的情况：**
```css
/* 1. 水平方向 */
.box {
  margin-left: 10px;
  margin-right: 20px;
  /* 不合并 */
}

/* 2. 浮动或定位 */
.box {
  float: left;
  /* margin 不合并 */
}

/* 3. flex/grid 容器 */
.container {
  display: flex;
}
.item {
  /* margin 不合并 */
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 行内格式化

### 题目

以下代码中，`<span>` 元素之间的间距是多少？

```css
span {
  margin: 10px;
}
```

```html
<span>A</span><span>B</span>
```

**选项：**
- A. 0
- B. 10px
- C. 20px
- D. 由浏览器决定

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**行内盒的水平 margin**

```css
span {
  margin: 10px;  /* 左右各10px */
}
```

**计算：**
```
<span>A</span>  margin-right: 10px
                间距 = 10px + 10px = 20px
<span>B</span>  margin-left: 10px
```

**关键点：**
- 行内盒的水平 margin **不合并**
- 垂直 margin 无效

**对比块级盒：**
```css
/* 块级盒垂直 margin 合并 */
div {
  margin: 10px;
}

<div>A</div>
<!-- 间距 = max(10px, 10px) = 10px -->
<div>B</div>
```

**完整对比：**

| 方向 | 块级盒 | 行内盒 |
|------|--------|--------|
| 水平 margin | 不合并，相加 | 不合并，相加 |
| 垂直 margin | 合并，取大 | 无效 |

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 匿名块级盒

### 题目

以下代码会生成几个块级盒？

```html
<div>
  <p>Paragraph 1</p>
  Some text
  <p>Paragraph 2</p>
</div>
```

**选项：**
- A. 2个
- B. 3个
- C. 4个
- D. 5个

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**匿名块级盒生成**

**结构分析：**
```html
<div>                    ← 块级盒 1
  <p>Paragraph 1</p>     ← 块级盒 2
  Some text              ← 匿名块级盒 3
  <p>Paragraph 2</p>     ← 块级盒 4
</div>
```

**生成规则：**
- `<div>` 是块级盒
- `<p>` 是块级盒
- "Some text" 在两个块级盒之间
- 会被包装成**匿名块级盒**

**为什么是块级盒？**
```
块级盒中混合块级和行内内容时，
行内内容会被包装成匿名块级盒
```

**完整盒树：**
```
块级盒 (div)
  ├─ 块级盒 (p) - "Paragraph 1"
  ├─ 匿名块级盒 - "Some text"
  └─ 块级盒 (p) - "Paragraph 2"
```

**如果是行内元素：**
```html
<div>
  <span>Inline 1</span>
  Some text
  <span>Inline 2</span>
</div>
<!-- 不会生成匿名块级盒，只有行内盒 -->
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 行盒生成

### 题目

在正常流中，行内盒是如何排列的？

**选项：**
- A. 每个行内盒占一行
- B. 行内盒在行盒（line box）中水平排列
- C. 行内盒垂直排列
- D. 行内盒随机排列

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**行盒（Line Box）机制**

```html
<div style="width: 200px;">
  <span>Short</span>
  <span>Very long text that will wrap</span>
  <span>End</span>
</div>
```

**行盒生成：**
```
行盒 1: [Short] [Very long text that]
行盒 2: [will wrap] [End]
```

**关键概念：**

**行盒（Line Box）：**
- 包含一行的所有行内盒
- 高度由内容决定
- 垂直堆叠

**行内盒（Inline Box）：**
- 在行盒中水平排列
- 宽度不够时自动换行
- 创建新的行盒

**示例：**
```css
.container {
  width: 300px;
}
```

```html
<div class="container">
  <span>A</span>
  <span>B</span>
  <span>C</span>
</div>
```

**布局：**
```
┌─────────────────┐
│ [A] [B] [C]     │ ← 行盒 1
└─────────────────┘
```

**换行：**
```css
.container { width: 100px; }
```

```
┌──────────┐
│ [A] [B]  │ ← 行盒 1
│ [C]      │ ← 行盒 2
└──────────┘
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 脱离正常流

### 题目

以下哪些会使元素脱离正常流？

**选项：**
- A. `float: left`
- B. `position: absolute`
- C. `position: relative`
- D. `position: fixed`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**脱离正常流的方式**

**✅ A. float**
```css
.box {
  float: left;  /* 脱离正常流 */
}
```

**✅ B. position: absolute**
```css
.box {
  position: absolute;  /* 脱离正常流 */
}
```

**❌ C. position: relative（错误）**
```css
.box {
  position: relative;  /* 仍在正常流中 */
  top: 10px;           /* 相对原位置偏移 */
}
```

**✅ D. position: fixed**
```css
.box {
  position: fixed;  /* 脱离正常流 */
}
```

**详细说明：**

**relative 的特殊性：**
- 元素仍占据原始空间
- 只是视觉位置偏移
- 不影响其他元素布局

```css
.box {
  position: relative;
  top: 20px;
}
/* 原始空间保留，视觉下移20px */
```

**脱离正常流的影响：**
```css
/* 浮动 */
.float {
  float: left;
}
/* 不占据空间，其他元素环绕 */

/* 绝对定位 */
.absolute {
  position: absolute;
}
/* 不占据空间，其他元素无视它 */
```

**对比表：**

| 定位类型 | 脱离正常流 | 占据空间 | 影响布局 |
|---------|-----------|---------|---------|
| static | ❌ | ✅ | ✅ |
| relative | ❌ | ✅ | ❌ |
| absolute | ✅ | ❌ | ❌ |
| fixed | ✅ | ❌ | ❌ |
| float | ✅ | ❌ | ⚠️ 部分 |

</details>

---

**导航**  
[上一章：第 11 章 - 包含块](./chapter-11.md) | [返回目录](../README.md) | [下一章：第 13 章 - 盒的生成与布局](./chapter-13.md)
