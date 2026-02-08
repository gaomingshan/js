# 第 30 章：渲染树构建 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 渲染树基础

### 题目

渲染树（Render Tree）由什么构成？

**选项：**
- A. 只有 DOM
- B. 只有 CSSOM
- C. DOM + CSSOM
- D. DOM + JavaScript

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**渲染树构建过程**

```
DOM Tree + CSSOM Tree → Render Tree
```

**流程：**
```
1. 解析 HTML → DOM Tree
2. 解析 CSS  → CSSOM Tree
3. 合并       → Render Tree
4. 布局       → Layout
5. 绘制       → Paint
```

**示例：**
```html
<div class="container">
  <p>Hello</p>
  <span style="display: none">Hidden</span>
</div>
```

```css
.container { color: blue; }
p { font-size: 16px; }
```

**DOM Tree：**
```
div.container
  ├─ p
  │   └─ "Hello"
  └─ span
      └─ "Hidden"
```

**Render Tree（display:none 不在其中）：**
```
RenderBlock (div.container)
  └─ RenderBlock (p)
      └─ RenderText ("Hello")
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 渲染树节点

### 题目

以下哪个元素不会出现在渲染树中？

**选项：**
- A. `<head>`
- B. `visibility: hidden` 的元素
- C. `opacity: 0` 的元素
- D. A 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**不出现在渲染树中的元素**

**❌ A. `<head>` 及其子元素**
```html
<head>
  <title>不渲染</title>
  <meta>
  <style>...</style>
</head>
```

**❌ `display: none`**
```html
<div style="display: none">不在渲染树中</div>
```

**✅ B. `visibility: hidden`（在渲染树中）**
```html
<div style="visibility: hidden">
  在渲染树中，占据空间，只是不可见
</div>
```

**✅ C. `opacity: 0`（在渲染树中）**
```html
<div style="opacity: 0">
  在渲染树中，占据空间，只是透明
</div>
```

**对比表：**

| 属性 | 在渲染树中 | 占据空间 | 子元素可见 |
|------|-----------|---------|-----------|
| `display: none` | ❌ | ❌ | ❌ |
| `visibility: hidden` | ✅ | ✅ | 可覆盖 |
| `opacity: 0` | ✅ | ✅ | ❌ |

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** CSSOM

### 题目

CSSOM 构建会阻塞 DOM 构建。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**CSS 不阻塞 DOM 构建，但阻塞渲染**

**DOM 构建（不阻塞）：**
```html
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div>Content</div>
  </body>
</html>
```

**执行流程：**
```
1. 开始解析 HTML
2. 遇到 <link>，异步下载 CSS
3. 继续解析 HTML，构建 DOM（不等待 CSS）✅
4. CSS 下载完成，构建 CSSOM
5. DOM + CSSOM → Render Tree
6. 开始渲染
```

**但 CSS 阻塞渲染：**
```
DOM 构建完成 → 等待 CSSOM → 构建渲染树 → 渲染
```

**CSS 也阻塞 JavaScript 执行：**
```html
<link rel="stylesheet" href="style.css">
<script>
  // 必须等待 CSS 加载完成
  // 因为 JS 可能读取样式信息
</script>
```

**关键点：**
- CSS **不阻塞** DOM 构建
- CSS **阻塞**渲染树构建
- CSS **阻塞** JS 执行

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 渲染关键路径

### 题目

关键渲染路径（Critical Rendering Path）包括哪些步骤？

**选项：**
- A. 构建 DOM 树
- B. 构建 CSSOM 树
- C. 执行 JavaScript
- D. 构建渲染树

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**关键渲染路径（全部正确）**

**完整流程：**
```
1. 处理 HTML → 构建 DOM
2. 处理 CSS  → 构建 CSSOM
3. 执行 JS    → DOM API / CSSOM API
4. DOM + CSSOM → Render Tree
5. Layout     → 计算位置和尺寸
6. Paint      → 绘制像素
7. Composite  → 合成图层
```

**✅ A. 构建 DOM 树**
```html
HTML → Tokenizer → Tokens → DOM Tree
```

**✅ B. 构建 CSSOM 树**
```css
CSS → Tokenizer → Tokens → CSSOM Tree
```

**✅ C. 执行 JavaScript**
```javascript
// 可能修改 DOM/CSSOM
document.querySelector('.box').style.color = 'red';
```

**✅ D. 构建渲染树**
```
DOM + CSSOM → Render Tree
（排除 display:none、<head> 等）
```

**优化策略：**

**1. 减少关键资源：**
```html
<!-- ❌ 阻塞渲染 -->
<link rel="stylesheet" href="style.css">

<!-- ✅ 非关键 CSS 异步加载 -->
<link rel="stylesheet" href="print.css" media="print">
```

**2. 减少关键字节：**
```
- 压缩 HTML/CSS/JS
- 移除无用代码
- 使用 gzip/brotli
```

**3. 缩短关键路径长度：**
```html
<!-- ❌ 多层依赖 -->
<script src="a.js"></script>  <!-- 依赖 b.js -->

<!-- ✅ 内联关键 CSS -->
<style>/* 关键样式 */</style>
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 渲染阻塞

### 题目

以下哪种方式不会阻塞首次渲染？

**选项：**
- A. `<script src="app.js"></script>`
- B. `<script src="app.js" defer></script>`
- C. `<link rel="stylesheet" href="style.css">`
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**资源加载对渲染的影响**

**❌ A. 普通 script（阻塞）**
```html
<script src="app.js"></script>
<!-- 阻塞 HTML 解析和渲染 -->
```

**✅ B. defer（不阻塞）**
```html
<script src="app.js" defer></script>
<!-- 异步下载，DOMContentLoaded 前执行 -->
```

**❌ C. stylesheet（阻塞渲染）**
```html
<link rel="stylesheet" href="style.css">
<!-- 阻塞渲染，但不阻塞 DOM 构建 -->
```

**对比表：**

| 类型 | 下载 | HTML解析 | 渲染 | 执行时机 |
|------|------|---------|------|---------|
| `<script>` | 阻塞 | 阻塞 | 阻塞 | 立即 |
| `<script defer>` | 异步 | 不阻塞 | 不阻塞 | DOMContentLoaded前 |
| `<script async>` | 异步 | 不阻塞 | 可能阻塞 | 下载完立即执行 |
| `<link>` | 异步 | 不阻塞 | 阻塞 | - |

**最佳实践：**

**1. 关键资源内联：**
```html
<head>
  <style>/* 首屏关键 CSS */</style>
</head>
```

**2. 非关键资源延迟：**
```html
<link rel="preload" href="style.css" as="style" onload="this.rel='stylesheet'">
```

**3. JavaScript 放底部或使用 defer：**
```html
<body>
  <!-- 内容 -->
  <script src="app.js" defer></script>
</body>
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 渲染树与可见性

### 题目

以下元素中，哪些会创建渲染树节点？

**选项：**
- A. `<div style="display: none"><span>A</span></div>`
- B. `<div style="visibility: hidden">B</div>`
- C. `<div style="opacity: 0">C</div>`
- D. B 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**渲染树节点创建规则**

**❌ A. `display: none`（不创建）**
```html
<div style="display: none">
  <span>A</span>
</div>
<!-- div 和 span 都不在渲染树中 -->
```

**✅ B. `visibility: hidden`（创建）**
```html
<div style="visibility: hidden">B</div>
<!-- 创建渲染树节点，占据空间 -->
```

**✅ C. `opacity: 0`（创建）**
```html
<div style="opacity: 0">C</div>
<!-- 创建渲染树节点，占据空间，创建合成层 -->
```

**详细对比：**

```html
<div class="container">
  <div class="none">display: none</div>
  <div class="hidden">visibility: hidden</div>
  <div class="transparent">opacity: 0</div>
</div>
```

**渲染树：**
```
RenderBlock (div.container)
  ├─ RenderBlock (div.hidden) ✅
  │   └─ RenderText ("visibility: hidden")
  └─ RenderBlock (div.transparent) ✅
      └─ RenderText ("opacity: 0")
```

**性能影响：**

```css
/* ❌ 性能最好（不参与渲染）*/
.hide { display: none; }

/* ⚠️ 占据空间，影响布局 */
.invisible { visibility: hidden; }

/* ⚠️ 创建合成层，GPU 内存 */
.transparent { opacity: 0; }
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 伪元素

### 题目

伪元素会在渲染树中创建节点吗？

**选项：**
- A. 不会
- B. 会
- C. 只有 `::before` 和 `::after`
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**伪元素在渲染树中**

```html
<div class="box">Content</div>
```

```css
.box::before {
  content: "Before";
}

.box::after {
  content: "After";
}
```

**渲染树：**
```
RenderBlock (div.box)
  ├─ RenderInline (::before)
  │   └─ RenderText ("Before")
  ├─ RenderText ("Content")
  └─ RenderInline (::after)
      └─ RenderText ("After")
```

**其他伪元素：**

```css
/* 首字母 */
p::first-letter {
  font-size: 2em;
}

/* 首行 */
p::first-line {
  color: blue;
}

/* 选中文本 */
::selection {
  background: yellow;
}
```

**所有伪元素都会创建渲染节点**

**DOM vs 渲染树：**

```
DOM（看不到伪元素）:
div.box
  └─ "Content"

Render Tree（包含伪元素）:
RenderBlock (div.box)
  ├─ RenderInline (::before)
  ├─ RenderText ("Content")
  └─ RenderInline (::after)
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 渲染优化

### 题目

如何优化首次渲染时间（FCP）？

**选项：**
- A. 内联关键 CSS
- B. 延迟加载非关键资源
- C. 减少渲染阻塞资源
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**首次内容绘制（FCP）优化（全部正确）**

**✅ A. 内联关键 CSS**
```html
<head>
  <style>
    /* 首屏关键样式 */
    .hero { height: 100vh; }
    .nav { display: flex; }
  </style>
  
  <!-- 非关键 CSS 延迟加载 -->
  <link rel="preload" href="main.css" as="style" 
        onload="this.rel='stylesheet'">
</head>
```

**✅ B. 延迟加载非关键资源**
```html
<!-- 懒加载图片 -->
<img src="placeholder.jpg" 
     data-src="real-image.jpg" 
     loading="lazy">

<!-- 延迟字体加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

**✅ C. 减少渲染阻塞资源**
```html
<!-- ❌ 阻塞 -->
<link rel="stylesheet" href="all.css">
<script src="app.js"></script>

<!-- ✅ 优化 -->
<link rel="stylesheet" href="critical.css">
<link rel="stylesheet" href="non-critical.css" 
      media="print" onload="this.media='all'">
<script src="app.js" defer></script>
```

**完整优化策略：**

**1. HTML 优化：**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 关键 CSS 内联 -->
  <style>/* 首屏样式 */</style>
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="font.woff2" as="font">
  
  <!-- 非关键 CSS -->
  <link rel="preload" href="main.css" as="style"
        onload="this.rel='stylesheet'">
</head>
<body>
  <!-- 内容 -->
  
  <!-- JS 延迟 -->
  <script src="app.js" defer></script>
</body>
</html>
```

**2. CSS 优化：**
```css
/* 关键 CSS（内联）*/
.above-fold { /* 首屏样式 */ }

/* 非关键 CSS（延迟）*/
.below-fold { /* 懒加载 */ }
```

**3. 资源提示：**
```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="//api.example.com">

<!-- 预加载 -->
<link rel="preload" href="critical.css" as="style">

<!-- 预获取 -->
<link rel="prefetch" href="next-page.html">
```

**4. 性能指标：**
```
FCP: First Contentful Paint（首次内容绘制）
LCP: Largest Contentful Paint（最大内容绘制）
FID: First Input Delay（首次输入延迟）
CLS: Cumulative Layout Shift（累积布局偏移）
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 渲染树构建时机

### 题目

什么时候会重新构建渲染树？

**选项：**
- A. DOM 变化
- B. CSSOM 变化
- C. 样式计算变化
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**渲染树重建触发条件（全部正确）**

**✅ A. DOM 变化**
```javascript
// 添加节点
const div = document.createElement('div');
document.body.appendChild(div);
// → 重建渲染树

// 删除节点
element.remove();
// → 重建渲染树
```

**✅ B. CSSOM 变化**
```javascript
// 修改样式表
document.styleSheets[0].insertRule('.new { color: red }', 0);
// → 重建 CSSOM → 重建渲染树
```

**✅ C. 样式计算变化**
```javascript
// 修改内联样式
element.style.color = 'blue';
// → 重新计算样式 → 重建渲染树

// 切换类名
element.classList.add('active');
// → 重新计算样式 → 重建渲染树
```

**渲染树更新流程：**

**局部更新（高效）：**
```javascript
// 只影响单个元素
element.style.color = 'red';
// → 局部样式重计算 → 局部渲染树更新
```

**全局更新（昂贵）：**
```javascript
// 影响多个元素
document.body.style.fontSize = '20px';
// → 全局样式重计算 → 全局渲染树更新
```

**优化建议：**

**1. 批量 DOM 操作：**
```javascript
// ❌ 多次重建
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div);
}

// ✅ 一次重建
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

**2. 使用类名而非内联样式：**
```javascript
// ❌ 多次样式重计算
element.style.width = '100px';
element.style.height = '100px';
element.style.background = 'red';

// ✅ 一次样式重计算
element.className = 'box';
```

**3. 离线 DOM 操作：**
```javascript
// 克隆节点，离线修改
const clone = element.cloneNode(true);
clone.style.color = 'red';
clone.textContent = 'New';
element.replaceWith(clone);
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 渲染性能

### 题目

关于渲染树构建性能优化，正确的是？

**选项：**
- A. 减少 DOM 深度
- B. 简化 CSS 选择器
- C. 避免复杂的 CSS 规则
- D. 使用 transform 代替 position

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**渲染树性能优化（全部正确）**

**✅ A. 减少 DOM 深度**
```html
<!-- ❌ 深层嵌套 -->
<div><div><div><div><div>
  <span>Content</span>
</div></div></div></div></div>

<!-- ✅ 扁平结构 -->
<div>
  <span>Content</span>
</div>
```

**✅ B. 简化 CSS 选择器**
```css
/* ❌ 复杂选择器 */
body > div.container > ul > li:nth-child(2) > a:hover {
  color: red;
}

/* ✅ 简单选择器 */
.nav-link:hover {
  color: red;
}
```

**✅ C. 避免复杂规则**
```css
/* ❌ 昂贵的属性 */
.box {
  box-shadow: 0 0 100px rgba(0,0,0,0.5);
  filter: blur(10px);
  border-radius: 50%;
}

/* ✅ 简单规则 */
.box {
  background: #f0f0f0;
  border: 1px solid #ccc;
}
```

**✅ D. transform 代替 position**
```css
/* ❌ 触发重排 */
.move {
  position: relative;
  left: 100px;
  top: 100px;
}

/* ✅ GPU 加速 */
.move {
  transform: translate(100px, 100px);
}
```

**性能对比表：**

| 操作 | 重建渲染树 | 重排 | 重绘 | 合成 |
|------|-----------|------|------|------|
| 添加 DOM | ✅ | ✅ | ✅ | ✅ |
| 修改 color | ❌ | ❌ | ✅ | ✅ |
| 修改 width | ❌ | ✅ | ✅ | ✅ |
| 修改 transform | ❌ | ❌ | ❌ | ✅ |

**最佳实践：**

```javascript
// 1. 批量读写
const width = element.offsetWidth;  // 读
element.style.width = width + 100 + 'px';  // 写

// 2. requestAnimationFrame
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)';
});

// 3. will-change 提示
element.style.willChange = 'transform';
// 动画后清除
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
});
```

</details>

---

**导航**  
[上一章：第 29 章 - 现代布局技巧](./chapter-29.md) | [返回目录](../README.md) | [下一章：第 31 章 - 布局与绘制](./chapter-31.md)
