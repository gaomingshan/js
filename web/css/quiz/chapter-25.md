# 第 25 章：Grid 进阶 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 隐式网格

### 题目

`grid-auto-rows` 的作用是？

**选项：**
- A. 设置显式网格行高
- B. 设置隐式网格行高
- C. 设置网格列宽
- D. 自动计算行高

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**grid-auto-rows 设置隐式网格**

```css
.grid {
  display: grid;
  grid-template-rows: 100px 200px;  /* 显式：2行 */
  grid-auto-rows: 150px;  /* 隐式：超出后的行高 */
}
```

**示例：**
```html
<div class="grid">
  <div>1</div>  <!-- 第1行，100px -->
  <div>2</div>  <!-- 第2行，200px -->
  <div>3</div>  <!-- 第3行，150px（隐式）-->
  <div>4</div>  <!-- 第4行，150px（隐式）-->
</div>
```

**对比：**
```css
/* 显式网格 */
grid-template-rows: 100px 200px;

/* 隐式网格 */
grid-auto-rows: 150px;
grid-auto-columns: 100px;
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** grid-auto-flow

### 题目

`grid-auto-flow: column` 的效果是？

**选项：**
- A. 先填充行
- B. 先填充列
- C. 创建列
- D. 隐藏列

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**grid-auto-flow 控制自动放置**

```css
.grid {
  grid-auto-flow: column;
  /* 项目先按列填充 */
}
```

**对比：**

**row（默认）：**
```
[1][2][3]
[4][5][6]
```

**column：**
```
[1][4]
[2][5]
[3][6]
```

**dense（密集）：**
```css
grid-auto-flow: row dense;
/* 填充空隙，避免留空 */
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 命名线

### 题目

Grid 线可以命名。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**命名 Grid 线**

```css
.grid {
  grid-template-columns: 
    [start] 1fr 
    [middle] 2fr 
    [end];
}

.item {
  grid-column: start / middle;
}
```

**多个名称：**
```css
grid-template-columns: 
  [main-start sidebar-start] 200px 
  [sidebar-end content-start] 1fr 
  [content-end main-end];
```

**自动命名（-start/-end）：**
```css
grid-template-areas: "header header";
/* 自动创建：header-start, header-end */
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** auto-fill vs auto-fit

### 题目

关于 `auto-fill` 和 `auto-fit`，以下说法正确的是？

**选项：**
- A. auto-fill 会创建尽可能多的轨道
- B. auto-fit 会拉伸轨道填满容器
- C. 两者在有空余空间时表现不同
- D. 两者在没有空余空间时表现相同

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**auto-fill vs auto-fit（全部正确）**

**✅ A. auto-fill 创建尽可能多的轨道**
```css
.grid {
  grid-template-columns: repeat(auto-fill, 200px);
}
/* 创建多个200px列，包括空列 */
```

**✅ B. auto-fit 拉伸轨道**
```css
.grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
/* 拉伸现有列填满容器 */
```

**✅ C & D. 表现差异**

**容器宽度 1000px，项目3个：**

**auto-fill：**
```
┌────┬────┬────┬────┬────┐
│ 1  │ 2  │ 3  │空 │空 │
└────┴────┴────┴────┴────┘
200  200  200  200  200
```

**auto-fit：**
```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │
└─────┴─────┴─────┘
 333   333   333
```

**无空余空间时：**
```
两者表现相同（都填满）
```

**实用场景：**
```css
/* 固定列宽，允许空列 */
repeat(auto-fill, 200px)

/* 响应式，拉伸填满 */
repeat(auto-fit, minmax(200px, 1fr))
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 网格项重叠

### 题目

Grid 项目可以重叠吗？

**选项：**
- A. 不可以
- B. 可以，使用 z-index 控制层级
- C. 可以，但无法控制层级
- D. 需要特殊属性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Grid 项目可以重叠**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.item1 {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  z-index: 1;
}

.item2 {
  grid-column: 2 / 4;
  grid-row: 2 / 4;
  z-index: 2;  /* 在 item1 之上 */
}
```

**可视化：**
```
┌───────┬───┐
│ item1 │   │
│   ┌───┼───┼───┐
│   │重叠│item2  │
└───┴───┤       │
    └───┴───────┘
```

**实用场景：**
```css
/* 图片 + 文字叠加 */
.card-image {
  grid-area: 1 / 1;
  z-index: 1;
}

.card-text {
  grid-area: 1 / 1;
  z-index: 2;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** subgrid

### 题目

`subgrid` 的作用是？

**选项：**
- A. 创建子网格
- B. 继承父网格的轨道
- C. 嵌套网格布局
- D. 创建独立网格

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**subgrid 继承父网格轨道**

```css
.parent {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.child {
  display: grid;
  grid-column: span 3;
  grid-template-columns: subgrid;
  /* 继承父网格的3个列轨道 */
}
```

**对比普通嵌套：**

**独立网格（不使用 subgrid）：**
```css
.child {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  /* 创建新的独立网格 */
}
```

**subgrid：**
```css
.child {
  grid-template-columns: subgrid;
  /* 与父网格对齐 */
}
```

**浏览器支持：**
- Firefox：完全支持
- Chrome/Edge：逐步支持
- Safari：部分支持

**实用场景：**
```css
/* 卡片列表对齐 */
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  /* 所有卡片内容对齐 */
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** fit-content()

### 题目

`fit-content(300px)` 的含义是？

**选项：**
- A. 固定300px
- B. 最大300px，由内容决定
- C. 最小300px
- D. 自动计算

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**fit-content() 内容适配**

```css
.grid {
  grid-template-columns: fit-content(300px) 1fr;
}
```

**行为：**
```
min(max-content, max(min-content, 300px))

简化理解：
- 内容小于300px：使用内容宽度
- 内容大于300px：使用300px
```

**示例：**
```css
/* 侧边栏：内容适配，最大300px */
grid-template-columns: fit-content(300px) 1fr;

/* 内容20px：实际20px */
/* 内容400px：实际300px */
```

**对比其他方式：**
```css
/* minmax */
minmax(min-content, 300px)
/* 最小为min-content，最大300px */

/* fit-content */
fit-content(300px)
/* 优先内容，最大300px */

/* max-content */
max-content
/* 完全由内容决定 */
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂布局

### 题目

如何实现圣杯布局（header, footer 固定，中间三列）？

**选项：**
- A. 使用浮动
- B. 使用 flexbox
- C. 使用 grid
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**圣杯布局实现**

**Grid 方案（推荐）：**
```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header {
  grid-column: 1 / -1;
}

.sidebar-left {
  /* 自动放置 */
}

.main {
  /* 自动放置 */
}

.sidebar-right {
  /* 自动放置 */
}

.footer {
  grid-column: 1 / -1;
}
```

**Grid Areas 方案：**
```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "left main right"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar-left { grid-area: left; }
.main { grid-area: main; }
.sidebar-right { grid-area: right; }
.footer { grid-area: footer; }
```

**Flexbox 方案：**
```css
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.middle {
  display: flex;
  flex: 1;
}

.sidebar-left {
  width: 200px;
}

.main {
  flex: 1;
}

.sidebar-right {
  width: 200px;
}
```

**响应式适配：**
```css
@media (max-width: 768px) {
  .container {
    grid-template-areas:
      "header"
      "main"
      "left"
      "right"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

Grid 布局的性能考虑有哪些？

**选项：**
- A. 避免过多的隐式轨道
- B. 使用 auto-fit 而非 auto-fill
- C. 合理使用 gap 而非 margin
- D. A 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Grid 性能优化**

**✅ A. 避免过多隐式轨道**
```css
/* ❌ 可能创建大量隐式轨道 */
.grid {
  display: grid;
  /* 未定义 template */
}

/* ✅ 明确定义 */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 100px;
}
```

**❌ B. auto-fit vs auto-fill（性能相近）**
```css
/* 性能差异不明显 */
/* 根据需求选择 */
```

**✅ C. gap 优于 margin**
```css
/* ❌ 复杂的 margin */
.item {
  margin: 10px;
}
.item:nth-child(3n) {
  margin-right: 0;
}

/* ✅ 简洁的 gap */
.grid {
  gap: 20px;
}
```

**其他优化建议：**

**1. 避免频繁重排：**
```css
/* ❌ 动态改变 template */
.grid.active {
  grid-template-columns: 1fr 2fr 1fr;
}

/* ✅ 使用 CSS 变量 */
.grid {
  --col-width: 1fr;
  grid-template-columns: var(--col-width) 2fr var(--col-width);
}
```

**2. 合理使用 minmax：**
```css
/* ✅ 减少重排 */
grid-template-rows: minmax(100px, auto);
```

**3. 避免嵌套过深：**
```css
/* 尽量扁平化 */
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** Grid 最佳实践

### 题目

Grid 布局的最佳实践有？

**选项：**
- A. 使用语义化的区域命名
- B. 响应式设计使用 auto-fit/auto-fill
- C. 合理使用 gap 设置间距
- D. 优先使用 Grid 替代所有布局

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**Grid 最佳实践**

**✅ A. 语义化命名**
```css
grid-template-areas:
  "header header header"
  "nav main aside"
  "footer footer footer";
/* 清晰的布局意图 */
```

**✅ B. 响应式设计**
```css
/* 自适应网格 */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

**✅ C. 使用 gap**
```css
gap: 20px;
/* 比 margin 更简洁 */
```

**❌ D. 不是所有场景都用 Grid**
```css
/* Flexbox 更适合一维布局 */
/* Grid 适合二维布局 */
```

**完整最佳实践：**

**1. 选择合适的布局方式：**
```css
/* 一维：Flexbox */
.nav {
  display: flex;
}

/* 二维：Grid */
.layout {
  display: grid;
}
```

**2. 语义化结构：**
```css
.page-layout {
  grid-template-areas:
    "header"
    "nav"
    "main"
    "aside"
    "footer";
}

@media (min-width: 768px) {
  .page-layout {
    grid-template-areas:
      "header header"
      "nav main"
      "nav aside"
      "footer footer";
  }
}
```

**3. 渐进增强：**
```css
/* 基础布局 */
.grid {
  display: block;
}

/* 支持 Grid 的浏览器 */
@supports (display: grid) {
  .grid {
    display: grid;
  }
}
```

**4. 性能考虑：**
```css
/* 明确定义轨道 */
grid-template-columns: repeat(12, 1fr);
grid-auto-rows: minmax(50px, auto);
```

**5. 可维护性：**
```css
/* 使用 CSS 变量 */
:root {
  --grid-gap: 20px;
  --grid-columns: 12;
}

.grid {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(var(--grid-columns), 1fr);
}
```

</details>

---

**导航**  
[上一章：第 24 章 - Grid基础](./chapter-24.md) | [返回目录](../README.md) | [下一章：第 26 章 - 媒体查询](./chapter-26.md)
