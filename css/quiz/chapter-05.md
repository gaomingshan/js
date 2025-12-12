# 第 5 章：CSS 解析机制 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 解析流程

### 题目

浏览器解析CSS的基本流程是？

**选项：**
- A. 下载 → 渲染 → 解析
- B. 下载 → 解析 → 构建CSSOM
- C. 解析 → 下载 → 渲染
- D. 直接渲染

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS解析流程**

```
1. 下载CSS文件
   ↓
2. 词法分析（Tokenization）
   ↓
3. 语法分析（Parsing）
   ↓
4. 构建CSSOM树
   ↓
5. 与DOM结合生成渲染树
```

**详细过程：**

**1. 词法分析**
```css
.box { color: red; }
```
分解为：
```
.box { | color | : | red | ; | }
```

**2. 语法分析**
```
选择器：.box
属性：color
值：red
```

**3. 构建CSSOM**
```
.box
  ├─ color: red
```

**CSSOM的作用：**
- 存储所有CSS规则
- 用于样式计算
- 与DOM结合生成渲染树

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** @规则

### 题目

`@import` 必须放在CSS文件的什么位置？

**选项：**
- A. 任意位置
- B. 文件开头（除了@charset）
- C. 文件末尾
- D. 选择器之前

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**@import 位置规则**

**✅ 正确用法**
```css
@charset "UTF-8";  /* 只有@charset可以在前面 */
@import url("reset.css");
@import url("base.css");

/* 其他规则必须在@import之后 */
body {
  font-size: 16px;
}
```

**❌ 错误用法**
```css
body { font-size: 16px; }
@import url("base.css");  /* 无效！在规则之后 */
```

**@规则顺序：**
```css
@charset "UTF-8";     /* 1. 字符集声明 */
@import url("a.css"); /* 2. 导入 */
@namespace prefix;     /* 3. 命名空间 */
/* 其他@规则和普通规则 */
```

**性能问题：**
```css
/* ❌ 性能差：串行加载 */
@import url("a.css");
@import url("b.css");

/* ✅ 更好：并行加载 */
<link rel="stylesheet" href="a.css">
<link rel="stylesheet" href="b.css">
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 选择器解析

### 题目

浏览器解析CSS选择器是从左到右的。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**选择器解析方向：从右到左**

**原因：性能优化**

```css
div .container .box span { }
```

**从右到左解析：**
```
1. 找到所有 span 元素
2. 检查父元素是否有 .box 类
3. 检查祖先是否有 .container 类
4. 检查祖先是否是 div
```

**为什么不从左到右？**
```
从左到右（效率低）：
1. 找到所有 div
2. 找 div 下的 .container
3. 找 .container 下的 .box
4. 找 .box 下的 span
→ 需要遍历整个DOM树

从右到左（效率高）：
1. 直接定位到 span
2. 向上检查是否匹配
→ 快速排除不匹配的元素
```

**性能影响：**
```css
/* ❌ 低效 */
div div div span { }  /* 需要检查很多层 */

/* ✅ 高效 */
.target-span { }      /* 直接定位 */
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** @规则

### 题目

以下哪些是CSS中的@规则？

**选项：**
- A. `@media`
- B. `@keyframes`
- C. `@font-face`
- D. `@select`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**常用@规则**

**✅ A. @media（媒体查询）**
```css
@media (max-width: 768px) {
  .box { width: 100%; }
}
```

**✅ B. @keyframes（动画关键帧）**
```css
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}
```

**✅ C. @font-face（自定义字体）**
```css
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2');
}
```

**❌ D. @select（不存在）**

**其他@规则：**
```css
/* @import - 导入 */
@import url("base.css");

/* @charset - 字符集 */
@charset "UTF-8";

/* @supports - 特性查询 */
@supports (display: grid) {
  .container { display: grid; }
}

/* @page - 打印 */
@page { margin: 1cm; }

/* @namespace - 命名空间 */
@namespace svg "http://www.w3.org/2000/svg";

/* @layer - 层叠层 */
@layer reset, base, components;
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 解析错误

### 题目

以下CSS代码中，哪条规则会生效？

```css
.box {
  color: red;
  font-size: 16px
  background: blue;
}
```

**选项：**
- A. 只有 color: red
- B. color 和 background
- C. 全部生效
- D. 全部无效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**CSS错误恢复机制**

**问题：**
```css
.box {
  color: red;           /* ✅ 有效 */
  font-size: 16px       /* ❌ 缺少分号 */
  background: blue;     /* ❌ 被忽略（与上一行视为一体）*/
}
```

**解析过程：**
```
1. color: red;         → 有效
2. font-size: 16px background: blue;  → 无效声明
   （浏览器尝试解析，但无法识别）
```

**CSS容错机制：**
- 遇到无效声明，跳过该声明
- 继续解析后续有效声明
- 不会影响其他规则

**修复：**
```css
.box {
  color: red;
  font-size: 16px;      /* 添加分号 */
  background: blue;
}
```

**其他常见错误：**
```css
/* 1. 拼写错误 */
.box {
  colour: red;          /* 无效，跳过 */
  color: blue;          /* 有效 */
}

/* 2. 无效值 */
.box {
  width: abc;           /* 无效，跳过 */
  width: 100px;         /* 有效 */
}

/* 3. 未闭合 */
.box {
  color: red;
}  /* 缺少闭合括号会影响后续规则 */
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** CSSOM

### 题目

CSSOM（CSS Object Model）的主要作用是？

**选项：**
- A. 优化CSS文件大小
- B. 存储CSS规则并用于样式计算
- C. 压缩CSS代码
- D. 检查CSS语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSSOM详解**

**定义：**
- CSS对象模型
- 类似DOM，但用于CSS
- 将CSS规则转换为可操作的树形结构

**CSSOM结构：**
```
StyleSheetList
  └─ CSSStyleSheet
      └─ CSSRuleList
          ├─ CSSStyleRule (.box { color: red })
          ├─ CSSMediaRule (@media ...)
          └─ CSSKeyframesRule (@keyframes ...)
```

**作用：**

**1. 样式计算**
```
DOM + CSSOM → 计算元素最终样式
```

**2. JavaScript访问**
```javascript
// 读取样式表
const sheet = document.styleSheets[0];

// 读取规则
const rules = sheet.cssRules;

// 修改样式
sheet.insertRule('.new { color: blue; }', 0);
```

**3. 渲染树构建**
```
DOM树 + CSSOM树 → 渲染树 → 布局 → 绘制
```

**性能影响：**
- CSSOM构建会阻塞渲染
- 优化CSS可加快CSSOM构建
- 关键CSS应内联

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 解析优先级

### 题目

以下CSS规则的解析顺序是？

```html
<link rel="stylesheet" href="a.css">
<style>
  .box { color: blue; }
</style>
<link rel="stylesheet" href="b.css">
```

**选项：**
- A. a.css → style → b.css
- B. style → a.css → b.css
- C. 并行加载，按完成顺序
- D. 只有最后一个生效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**CSS加载与解析顺序**

**解析顺序：按文档顺序**
```html
<!-- 1. 先加载和解析 -->
<link rel="stylesheet" href="a.css">

<!-- 2. 再解析 -->
<style>
  .box { color: blue; }
</style>

<!-- 3. 最后加载和解析 -->
<link rel="stylesheet" href="b.css">
```

**层叠规则：**
```
相同选择器：后定义覆盖先定义

例如：
a.css:  .box { color: red; }
style:  .box { color: blue; }  ← 覆盖a.css
b.css:  .box { color: green; } ← 覆盖style
```

**加载 vs 解析：**
```
加载：可能并行（浏览器优化）
解析：按文档顺序
应用：按层叠规则
```

**性能优化：**
```html
<!-- 预加载 -->
<link rel="preload" href="a.css" as="style">

<!-- 异步加载（不阻塞渲染）-->
<link rel="stylesheet" href="non-critical.css" 
      media="print" onload="this.media='all'">
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 选择器性能

### 题目

以下哪个选择器的性能最好？

```css
A. * { }
B. div { }
C. .box { }
D. #header { }
```

**选项：**
- A. A
- B. B
- C. C
- D. D

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**选择器性能排序（从快到慢）**

```
1. ID选择器      #header { }        最快 ✅
2. 类选择器      .box { }           快
3. 元素选择器    div { }            较慢
4. 通配符选择器  * { }              最慢 ❌
```

**原因：**

**ID选择器（最快）**
```css
#header { }
```
- 唯一性，直接定位
- 使用哈希表查找
- O(1) 时间复杂度

**类选择器**
```css
.box { }
```
- 使用类名索引
- 较快查找
- O(n) 但n较小

**元素选择器**
```css
div { }
```
- 需要遍历所有该类型元素
- O(n)

**通配符（最慢）**
```css
* { }
```
- 匹配所有元素
- 需要遍历整个DOM

**复杂选择器性能：**
```css
/* 慢 */
div div div span { }

/* 快 */
.target { }

/* 更快 */
#target { }
```

**性能优化建议：**
```css
/* ❌ 避免 */
* { }
div * { }
div > * { }

/* ✅ 推荐 */
.specific-class { }
#unique-id { }

/* ⚠️ 谨慎 */
.parent .child .grandchild { }  /* 层级不要太深 */
```

**注意：**
- 现代浏览器已高度优化
- 选择器性能影响较小
- 可读性和维护性更重要

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** @supports

### 题目

以下代码的作用是什么？

```css
@supports (display: grid) {
  .container {
    display: grid;
  }
}

@supports not (display: grid) {
  .container {
    display: flex;
  }
}
```

**选项：**
- A. 检测浏览器是否支持grid，提供降级方案
- B. 两个规则都会应用
- C. 只应用第一个规则
- D. 语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**@supports特性查询**

**用途：渐进增强和优雅降级**

**本题逻辑：**
```css
/* 如果支持grid */
@supports (display: grid) {
  .container {
    display: grid;        /* 使用grid布局 */
  }
}

/* 如果不支持grid */
@supports not (display: grid) {
  .container {
    display: flex;        /* 降级到flex布局 */
  }
}
```

**语法：**

**基本查询**
```css
@supports (property: value) {
  /* 支持时的样式 */
}
```

**逻辑运算**
```css
/* AND */
@supports (display: grid) and (gap: 10px) {
  .container { display: grid; gap: 10px; }
}

/* OR */
@supports (display: flex) or (display: grid) {
  .container { display: flex; }
}

/* NOT */
@supports not (display: grid) {
  .fallback { display: table; }
}
```

**实用场景：**

**1. CSS Grid降级**
```css
/* 基础布局 */
.grid {
  display: flex;
  flex-wrap: wrap;
}

/* 支持Grid时覆盖 */
@supports (display: grid) {
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

**2. 自定义属性降级**
```css
.box {
  background: red;  /* 降级 */
}

@supports (--custom: value) {
  .box {
    background: var(--primary-color);
  }
}
```

**3. 新特性检测**
```css
@supports (gap: 10px) {
  .flex-container {
    display: flex;
    gap: 10px;
  }
}

@supports not (gap: 10px) {
  .flex-container {
    display: flex;
  }
  .flex-container > * {
    margin: 5px;
  }
}
```

**JavaScript检测：**
```javascript
if (CSS.supports('display', 'grid')) {
  console.log('支持Grid');
}

// 或
if (CSS.supports('(display: grid) and (gap: 10px)')) {
  console.log('支持Grid和gap');
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 解析优化

### 题目

关于CSS解析性能优化，以下说法正确的是？

**选项：**
- A. 减少选择器层级可提升性能
- B. 避免使用通配符选择器
- C. 将关键CSS内联到HTML中
- D. CSS文件越小越好，应尽量压缩

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**CSS性能优化全解（全部正确）**

**✅ A. 减少选择器层级**
```css
/* ❌ 深层嵌套 */
.header .nav .menu .item .link { }

/* ✅ 扁平化 */
.nav-link { }
```

**原因：**
- 从右到左解析，层级越深越慢
- 减少DOM遍历次数

**✅ B. 避免通配符**
```css
/* ❌ 性能差 */
* { box-sizing: border-box; }
div * { margin: 0; }

/* ✅ 更好 */
html { box-sizing: border-box; }
*, *::before, *::after {
  box-sizing: inherit;
}
```

**✅ C. 内联关键CSS**
```html
<head>
  <style>
    /* 首屏关键CSS */
    body { font-family: sans-serif; }
    .hero { display: block; }
  </style>
  
  <!-- 非关键CSS异步加载 -->
  <link rel="preload" href="main.css" as="style">
</head>
```

**好处：**
- 减少渲染阻塞
- 加快首屏渲染

**✅ D. 压缩CSS**
```css
/* 压缩前 */
.box {
  color: red;
  background: blue;
}

/* 压缩后 */
.box{color:red;background:blue}
```

**优化方法：**
- 使用构建工具（cssnano, clean-css）
- 移除注释和空白
- 合并重复规则

**其他优化技巧：**

**1. 避免@import**
```css
/* ❌ 串行加载 */
@import url("a.css");

/* ✅ 并行加载 */
<link rel="stylesheet" href="a.css">
```

**2. 使用link而非@import**
```html
<!-- ✅ 推荐 -->
<link rel="stylesheet" href="style.css">
```

**3. 移除未使用的CSS**
```javascript
// 使用工具如PurgeCSS
```

**4. CSS拆分**
```html
<!-- 关键CSS -->
<style>/* 首屏样式 */</style>

<!-- 非关键CSS -->
<link rel="stylesheet" href="non-critical.css" 
      media="print" onload="this.media='all'">
```

**5. 使用现代语法**
```css
/* 使用CSS变量减少重复 */
:root {
  --primary: #3b82f6;
}

.btn { background: var(--primary); }
```

</details>

---

**导航**  
[上一章：第 4 章 - 基础样式属性](./chapter-04.md) | [返回目录](../README.md) | [下一章：第 6 章 - 样式表加载与阻塞](./chapter-06.md)
