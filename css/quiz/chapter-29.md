# 第 29 章：现代布局技巧 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 圣杯布局

### 题目

实现圣杯布局的最佳方式是？

**选项：**
- A. 浮动
- B. Grid
- C. 定位
- D. 表格

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Grid 实现圣杯布局**

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

**响应式适配：**
```css
@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 等高列

### 题目

如何实现等高列？

**选项：**
- A. JavaScript 计算
- B. Flexbox
- C. 浮动 + 负margin
- D. padding-bottom: 100%

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Flexbox 等高列**

```css
.container {
  display: flex;
}

.column {
  /* 自动等高 */
}
```

**Grid 等高：**
```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.column {
  /* 自动等高 */
}
```

**对比传统方法：**
```css
/* ❌ 复杂的传统方法 */
.column {
  float: left;
  padding-bottom: 99999px;
  margin-bottom: -99999px;
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** sticky footer

### 题目

使用 `min-height: 100vh` 可以实现 sticky footer。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Sticky Footer 实现**

**Flexbox 方案：**
```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;  /* 占据剩余空间 */
}

footer {
  /* 固定在底部 */
}
```

**Grid 方案：**
```css
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* header, main, footer 自动分配 */
```

**传统方案：**
```css
html, body {
  height: 100%;
}

.wrapper {
  min-height: 100%;
  margin-bottom: -50px;  /* footer 高度 */
}

.footer {
  height: 50px;
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 水平垂直居中

### 题目

实现元素水平垂直居中的方法有？

**选项：**
- A. Flexbox
- B. Grid
- C. Position + Transform
- D. margin: auto

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**居中方案（A、B、C 正确）**

**✅ A. Flexbox**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**✅ B. Grid**
```css
.container {
  display: grid;
  place-items: center;
  height: 100vh;
}
```

**✅ C. Position + Transform**
```css
.container {
  position: relative;
  height: 100vh;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**❌ D. margin: auto（不完整）**
```css
/* 只有在特定条件下才能垂直居中 */
.child {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;   /* 需要固定尺寸 */
  height: 100px;
}
```

**对比表：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| Flexbox | 简单，灵活 | 需要容器 |
| Grid | 最简洁 | 较新特性 |
| Position | 兼容性好 | 需要 transform |
| margin: auto | 无 transform | 需要固定尺寸 |

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 流式布局

### 题目

实现自适应卡片网格的最佳方式？

**选项：**
- A. Flexbox + flex-wrap
- B. Grid + auto-fit
- C. 浮动
- D. inline-block

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Grid auto-fit 自适应网格**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

**行为：**
- 最小 250px
- 自动计算列数
- 平分剩余空间

**auto-fit vs auto-fill：**

**auto-fit（拉伸）：**
```css
repeat(auto-fit, minmax(200px, 1fr))
/* 拉伸现有列填满容器 */
```

**auto-fill（保留空列）：**
```css
repeat(auto-fill, minmax(200px, 1fr))
/* 保留空列不拉伸 */
```

**Flexbox 方案（备选）：**
```css
.flex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 1 1 250px;
  /* 但需要处理最后一行对齐 */
}
```

**完整示例：**
```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 5vw, 3rem);
}

.card {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .card {
    /* 卡片内部响应 */
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 侧边栏布局

### 题目

实现可折叠侧边栏的最佳方式？

**选项：**
- A. Grid + grid-template-columns
- B. Flexbox
- C. Position
- D. A 更好

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Grid 实现可折叠侧边栏**

```html
<div class="layout">
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main</main>
</div>
```

```css
.layout {
  display: grid;
  grid-template-columns: var(--sidebar-width, 250px) 1fr;
  transition: grid-template-columns 0.3s;
}

/* 折叠状态 */
.layout.collapsed {
  --sidebar-width: 60px;
}

.sidebar {
  overflow: hidden;
  transition: all 0.3s;
}
```

**响应式折叠：**
```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
```

**使用 CSS 变量：**
```css
:root {
  --sidebar-expanded: 250px;
  --sidebar-collapsed: 60px;
}

.layout {
  grid-template-columns: var(--sidebar-width, var(--sidebar-expanded)) 1fr;
}

.layout.collapsed {
  --sidebar-width: var(--sidebar-collapsed);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 宽高比

### 题目

如何保持元素固定宽高比？

**选项：**
- A. padding-bottom 技巧
- B. aspect-ratio 属性
- C. JavaScript
- D. B 更好

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**aspect-ratio 属性（现代）**

```css
.box {
  aspect-ratio: 16 / 9;
  width: 100%;
}
/* 宽度自适应，高度自动计算 */
```

**常用比例：**
```css
aspect-ratio: 1;        /* 正方形 */
aspect-ratio: 16 / 9;   /* 视频 */
aspect-ratio: 4 / 3;    /* 照片 */
aspect-ratio: 21 / 9;   /* 超宽屏 */
```

**传统方法（降级）：**
```css
.box {
  position: relative;
  width: 100%;
}

.box::before {
  content: "";
  display: block;
  padding-top: 56.25%;  /* 16:9 = 9/16 = 56.25% */
}

.box-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**完整降级方案：**
```css
.video-wrapper {
  /* 降级 */
  position: relative;
  width: 100%;
}

.video-wrapper::before {
  content: "";
  display: block;
  padding-top: 56.25%;
}

/* 现代浏览器覆盖 */
@supports (aspect-ratio: 1) {
  .video-wrapper::before {
    display: none;
  }
  
  .video-wrapper {
    aspect-ratio: 16 / 9;
  }
}

.video {
  width: 100%;
  height: 100%;
}
```

**响应式图片：**
```css
img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂布局

### 题目

实现 Pinterest 瀑布流布局的方式？

**选项：**
- A. Grid + grid-auto-rows: dense
- B. Flexbox + column-count
- C. column-count + column-gap
- D. JavaScript + 绝对定位

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**瀑布流布局方案**

**✅ C. CSS Multi-column（最简单）**
```css
.masonry {
  column-count: 3;
  column-gap: 20px;
}

.item {
  break-inside: avoid;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .masonry {
    column-count: 2;
  }
}

@media (max-width: 480px) {
  .masonry {
    column-count: 1;
  }
}
```

**Grid 方案（实验性）：**
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: masonry;  /* 实验性 */
  gap: 20px;
}
```

**JavaScript 方案（完全控制）：**
```javascript
// Masonry.js 或自定义实现
const masonry = new Masonry('.grid', {
  itemSelector: '.grid-item',
  columnWidth: 200,
  gutter: 20
});
```

**对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| Multi-column | 简单，无JS | 垂直排列 |
| Grid masonry | 灵活 | 浏览器支持差 |
| JavaScript | 完全控制 | 需要JS |

**完整 Multi-column 示例：**
```css
.pinterest-layout {
  column-count: 4;
  column-gap: 1rem;
  padding: 1rem;
}

.card {
  break-inside: avoid;
  margin-bottom: 1rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.card img {
  width: 100%;
  display: block;
}

/* 响应式 */
@media (max-width: 1200px) {
  .pinterest-layout { column-count: 3; }
}

@media (max-width: 768px) {
  .pinterest-layout { column-count: 2; }
}

@media (max-width: 480px) {
  .pinterest-layout { column-count: 1; }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 表单布局

### 题目

实现响应式表单布局的最佳实践？

**选项：**
- A. Grid + grid-template-areas
- B. Flexbox
- C. 浮动
- D. 表格布局

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Grid 表单布局**

```html
<form class="form-grid">
  <label for="name">Name:</label>
  <input type="text" id="name">
  
  <label for="email">Email:</label>
  <input type="email" id="email">
  
  <label for="message">Message:</label>
  <textarea id="message"></textarea>
  
  <button type="submit">Submit</button>
</form>
```

```css
.form-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  max-width: 600px;
}

label {
  text-align: right;
  padding-top: 0.5rem;
}

/* 跨列元素 */
button {
  grid-column: 1 / -1;
  justify-self: start;
}

textarea {
  grid-column: 2;
}

/* 响应式 */
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  label {
    text-align: left;
  }
}
```

**使用 grid-template-areas：**
```css
.form-complex {
  display: grid;
  grid-template-areas:
    "fname lname"
    "email email"
    "message message"
    "submit reset";
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.firstname { grid-area: fname; }
.lastname { grid-area: lname; }
.email { grid-area: email; }
.message { grid-area: message; }
.submit { grid-area: submit; }
.reset { grid-area: reset; }

@media (max-width: 600px) {
  .form-complex {
    grid-template-areas:
      "fname"
      "lname"
      "email"
      "message"
      "submit"
      "reset";
    grid-template-columns: 1fr;
  }
}
```

**现代表单组件：**
```css
.form-field {
  display: grid;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 布局技巧

### 题目

现代CSS布局的最佳实践有？

**选项：**
- A. 优先使用 Flexbox 和 Grid
- B. 使用逻辑属性（如 margin-inline）
- C. 使用 CSS 变量管理布局
- D. 避免使用浮动

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**现代布局最佳实践（全部正确）**

**✅ A. 优先现代布局**
```css
/* ✅ Flexbox：一维布局 */
.nav {
  display: flex;
  gap: 1rem;
}

/* ✅ Grid：二维布局 */
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* ❌ 避免浮动（除非文字环绕）*/
.column {
  float: left;  /* 不推荐 */
}
```

**✅ B. 逻辑属性**
```css
/* 传统物理属性 */
.box {
  margin-left: 1rem;
  padding-right: 2rem;
}

/* 逻辑属性（支持 RTL）*/
.box {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
}

/* 简写 */
.box {
  margin-inline: 1rem 2rem;  /* start end */
  margin-block: 1rem 2rem;   /* top bottom */
}
```

**✅ C. CSS 变量**
```css
:root {
  --container-width: 1200px;
  --gutter: clamp(1rem, 3vw, 2rem);
  --sidebar-width: 250px;
}

.container {
  max-width: var(--container-width);
  padding-inline: var(--gutter);
}

.layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  gap: var(--gutter);
}
```

**✅ D. 避免浮动**
```css
/* ❌ 浮动布局 */
.column {
  float: left;
  width: 33.33%;
}
.clearfix::after {
  content: "";
  clear: both;
  display: table;
}

/* ✅ Grid 布局 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

**完整现代布局示例：**

```css
/* 1. CSS 变量 */
:root {
  --content-width: min(90%, 70rem);
  --spacing-unit: clamp(1rem, 2.5vw, 2rem);
}

/* 2. 逻辑属性 */
.section {
  padding-block: calc(var(--spacing-unit) * 2);
  margin-inline: auto;
  inline-size: var(--content-width);
}

/* 3. 现代布局 */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: var(--spacing-unit);
}

/* 4. 容器查询 */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

/* 5. 流式设计 */
h1 {
  font-size: clamp(1.5rem, 5vw + 1rem, 3rem);
}

/* 6. 宽高比 */
.media {
  aspect-ratio: 16 / 9;
  inline-size: 100%;
}

/* 7. 间距 */
.stack > * + * {
  margin-block-start: var(--spacing-unit);
}
```

**可访问性考虑：**
```css
/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 强制颜色模式 */
@media (forced-colors: active) {
  .custom-color {
    color: CanvasText;
  }
}
```

</details>

---

**导航**  
[上一章：第 28 章 - Container Queries](./chapter-28.md) | [返回目录](../README.md) | [下一章：第 30 章 - 渲染树构建](./chapter-30.md)
