# 第 23 章：Flexbox 进阶 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** flex-basis

### 题目

`flex-basis` 的作用是？

**选项：**
- A. 设置 flex 项目的初始主轴尺寸
- B. 设置 flex 项目的最大尺寸
- C. 设置 flex 项目的最小尺寸
- D. 设置 flex 项目的固定尺寸

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**flex-basis 定义初始尺寸**

```css
.item {
  flex-basis: 200px;
  /* 在分配剩余空间前的初始尺寸 */
}
```

**与 width 的区别：**
```css
/* flex-basis 优先级更高 */
.item {
  width: 100px;
  flex-basis: 200px;
  /* 实际使用 200px 作为基准 */
}
```

**特殊值：**
```css
flex-basis: auto;     /* 根据内容或 width/height */
flex-basis: 0;        /* 不考虑内容，完全按 flex-grow 分配 */
flex-basis: content;  /* 基于内容尺寸 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** flex-grow

### 题目

`flex-grow: 0` 表示？

**选项：**
- A. 项目会收缩
- B. 项目不会增长
- C. 项目会增长
- D. 项目占满容器

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex-grow 控制增长**

```css
.item {
  flex-grow: 0;  /* 不分配剩余空间，不增长 */
}
```

**数值含义：**
```css
flex-grow: 0;  /* 不增长（默认）*/
flex-grow: 1;  /* 分配剩余空间 */
flex-grow: 2;  /* 分配2倍的剩余空间 */
```

**示例：**
```css
.item1 { flex-grow: 0; }  /* 保持 flex-basis 尺寸 */
.item2 { flex-grow: 1; }  /* 占据剩余空间 */
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** flex-shrink

### 题目

`flex-shrink: 0` 可以防止项目收缩。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**flex-shrink 控制收缩**

```css
.item {
  flex-shrink: 0;  /* 不收缩，保持原始尺寸 */
}
```

**示例：**
```css
.container {
  display: flex;
  width: 300px;
}

.item {
  flex-basis: 200px;
  flex-shrink: 0;
  /* 即使空间不足，保持 200px */
}
```

**默认行为：**
```css
flex-shrink: 1;  /* 默认值，允许收缩 */
flex-shrink: 0;  /* 不收缩 */
flex-shrink: 2;  /* 收缩程度是 1 的两倍 */
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** order 属性

### 题目

关于 `order` 属性，以下说法正确的是？

**选项：**
- A. 可以改变项目的视觉顺序
- B. 不影响 DOM 结构
- C. 默认值为 0
- D. 值越大越靠前

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**order 属性特性**

**✅ A. 改变视觉顺序**
```css
.item1 { order: 2; }
.item2 { order: 1; }
.item3 { order: 3; }
/* 视觉顺序：item2, item1, item3 */
```

**✅ B. 不影响 DOM**
```html
<div class="item1">1</div>  <!-- DOM 顺序 -->
<div class="item2">2</div>
<div class="item3">3</div>
<!-- 但视觉显示：2, 1, 3 -->
```

**✅ C. 默认值为 0**
```css
.item {
  order: 0;  /* 默认值 */
}
```

**❌ D. 值越小越靠前（错误）**
```css
.item1 { order: 1; }
.item2 { order: 2; }
.item3 { order: 0; }
/* 顺序：item3(0), item1(1), item2(2) */
/* 值越小越靠前 ✅ */
```

**实用场景：**
```css
/* 移动端调整顺序 */
.sidebar { order: 2; }
.main { order: 1; }

@media (min-width: 768px) {
  .sidebar { order: 1; }
  .main { order: 2; }
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** gap 属性

### 题目

`gap: 20px` 在 flexbox 中的作用是？

**选项：**
- A. 设置项目的内边距
- B. 设置项目之间的间距
- C. 设置容器的外边距
- D. 无效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**gap 设置项目间距**

```css
.container {
  display: flex;
  gap: 20px;
  /* 项目之间的间距为 20px */
}
```

**完整语法：**
```css
/* 单值：行列相同 */
gap: 20px;

/* 双值：行间距 列间距 */
gap: 20px 30px;

/* 分开设置 */
row-gap: 20px;
column-gap: 30px;
```

**对比 margin：**
```css
/* ❌ 传统方法 */
.item {
  margin-right: 20px;
}
.item:last-child {
  margin-right: 0;
}

/* ✅ 现代方法 */
.container {
  display: flex;
  gap: 20px;
}
```

**兼容性：**
- Grid：完全支持
- Flexbox：较新特性（Chrome 84+）
- 旧版浏览器使用 margin

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** flex 简写

### 题目

`flex: auto` 等同于？

**选项：**
- A. `flex: 0 0 auto`
- B. `flex: 1 1 auto`
- C. `flex: 1 0 auto`
- D. `flex: 0 1 auto`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex 常用简写值**

```css
/* flex: auto */
flex: auto;
/* = flex: 1 1 auto */
/* grow: 1, shrink: 1, basis: auto */
```

**常用简写对照表：**

```css
flex: 1;      /* 1 1 0% */
flex: auto;   /* 1 1 auto */
flex: none;   /* 0 0 auto */
flex: 0;      /* 0 1 0% */
flex: 2;      /* 2 1 0% */
```

**详细说明：**

**flex: 1（最常用）：**
```css
flex: 1;
/* 
  grow: 1    → 分配剩余空间
  shrink: 1  → 空间不足时收缩
  basis: 0%  → 不考虑内容，完全按比例分配
*/
```

**flex: auto：**
```css
flex: auto;
/* 
  grow: 1    → 分配剩余空间
  shrink: 1  → 空间不足时收缩
  basis: auto → 考虑内容尺寸
*/
```

**flex: none：**
```css
flex: none;
/* 
  grow: 0    → 不增长
  shrink: 0  → 不收缩
  basis: auto → 固定尺寸
*/
```

**实际应用：**
```css
/* 等宽列 */
.col {
  flex: 1;  /* 完全平分 */
}

/* 自适应列 */
.col {
  flex: auto;  /* 基于内容，再分配剩余 */
}

/* 固定列 */
.sidebar {
  flex: none;
  width: 200px;  /* 固定宽度 */
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 嵌套 flex

### 题目

嵌套 flex 容器的正确用法是？

**选项：**
- A. 只能嵌套一层
- B. 可以无限嵌套
- C. 需要特殊属性
- D. 不支持嵌套

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Flex 可以无限嵌套**

```html
<div class="outer">
  <div class="inner">
    <div class="item">Content</div>
  </div>
</div>
```

```css
.outer {
  display: flex;
  justify-content: center;
}

.inner {
  display: flex;  /* 嵌套 flex 容器 */
  flex-direction: column;
}

.item {
  /* flex 项目 */
}
```

**实用场景：**

**卡片布局：**
```css
.card-container {
  display: flex;
  gap: 20px;
}

.card {
  display: flex;  /* 嵌套 */
  flex-direction: column;
}

.card-header,
.card-body,
.card-footer {
  /* 卡片的 flex 项目 */
}
```

**导航栏：**
```css
.navbar {
  display: flex;
  justify-content: space-between;
}

.nav-menu {
  display: flex;  /* 嵌套 */
  gap: 20px;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** flex-basis 计算

### 题目

以下代码中，`.item` 的最终宽度是？

```css
.container {
  display: flex;
  width: 500px;
}

.item {
  width: 100px;
  flex: 1 1 200px;
}
```

**选项：**
- A. 100px
- B. 200px
- C. 500px
- D. 取决于剩余空间

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**flex-basis 优先级**

**优先级顺序：**
```
flex-basis > width/height
```

**计算过程：**

**1. 确定基准尺寸**
```css
flex-basis: 200px;  /* 使用 basis，忽略 width: 100px */
```

**2. 只有一个项目**
```
容器宽度：500px
basis：200px
剩余空间：500 - 200 = 300px
```

**3. 应用 flex-grow**
```
flex-grow: 1
最终宽度 = 200px + 300px = 500px
```

**结果：500px ✅**

**如果有多个项目：**
```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
</div>
```

```css
.container { width: 500px; }
.item { flex: 1 1 200px; }

/*
  basis总和：400px
  剩余：100px
  每个增长：100 / 2 = 50px
  
  最终：200 + 50 = 250px（每个）
*/
```

**flex-basis 与 width 的关系：**

```css
/* basis 优先 */
.item {
  width: 100px;
  flex-basis: 200px;  /* 使用 200px */
}

/* basis: auto 时使用 width */
.item {
  width: 100px;
  flex-basis: auto;  /* 使用 100px */
}

/* 都没有时使用内容 */
.item {
  flex-basis: auto;  /* 使用内容宽度 */
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** min-width 影响

### 题目

为什么 `flex: 1` 的项目有时不会等宽？

**选项：**
- A. flex 计算错误
- B. min-width 的默认值影响
- C. 浏览器兼容性问题
- D. 代码错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**min-width: auto 的影响**

```html
<div class="container">
  <div class="item">Short</div>
  <div class="item">Very long content text</div>
</div>
```

```css
.container {
  display: flex;
}

.item {
  flex: 1;
  /* min-width: auto（默认）→ 基于内容 */
}
```

**问题：**
- 第二个 item 的内容很长
- `min-width: auto` 阻止收缩到内容之下
- 导致宽度不等

**解决方案：**

**方案1：设置 min-width: 0**
```css
.item {
  flex: 1;
  min-width: 0;  /* 允许收缩 */
}
```

**方案2：overflow**
```css
.item {
  flex: 1;
  overflow: hidden;  /* 隐式设置 min-width: 0 */
}
```

**方案3：flex-basis: 0**
```css
.item {
  flex: 1 1 0%;  /* basis: 0 */
}
```

**完整示例：**
```css
/* ❌ 可能不等宽 */
.item {
  flex: 1;
  /* min-width: auto */
}

/* ✅ 确保等宽 */
.item {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**类似问题（Grid）：**
```css
.grid-item {
  /* min-width: auto 也会影响 Grid */
  min-width: 0;  /* 解决方案相同 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** Flexbox 陷阱

### 题目

使用 Flexbox 时常见的陷阱有？

**选项：**
- A. min-width/min-height 的默认值
- B. margin: auto 的特殊行为
- C. z-index 在 flex 项目上的作用
- D. flex-basis 与 width 的优先级

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**Flexbox 常见陷阱（全部正确）**

**✅ A. min-width/min-height**
```css
/* 陷阱 */
.item {
  flex: 1;
  /* min-width: auto → 基于内容 */
}

/* 解决 */
.item {
  flex: 1;
  min-width: 0;
}
```

**✅ B. margin: auto**
```css
/* 特殊行为：吸收剩余空间 */
.item {
  margin-left: auto;
  /* 推到右侧 */
}

.centered {
  margin: auto;
  /* 完全居中 */
}
```

**✅ C. z-index**
```css
/* flex 项目不需要 position */
.flex-item {
  z-index: 1;  /* 直接有效 ✅ */
}
```

**✅ D. flex-basis 优先级**
```css
.item {
  width: 100px;
  flex-basis: 200px;  /* 优先使用 basis */
}
```

**更多陷阱：**

**1. flex: 1 vs flex: auto**
```css
flex: 1;     /* basis: 0%，完全平分 */
flex: auto;  /* basis: auto，考虑内容 */
```

**2. align-items: stretch**
```css
/* 默认拉伸 */
.item {
  /* height: auto → 拉伸到容器高度 */
}

/* 阻止拉伸 */
.item {
  align-self: flex-start;
  /* 或设置固定高度 */
}
```

**3. gap 兼容性**
```css
/* 旧浏览器不支持 gap */
.container {
  display: flex;
  gap: 20px;  /* 可能无效 */
}

/* 降级方案 */
.item {
  margin-right: 20px;
}
.item:last-child {
  margin-right: 0;
}
```

**4. 百分比高度**
```css
.item {
  height: 50%;  /* 可能无效 */
}

/* 需要容器有明确高度 */
.container {
  display: flex;
  height: 400px;  /* 必须 */
}
```

</details>

---

**导航**  
[上一章：第 22 章 - Flexbox基础](./chapter-22.md) | [返回目录](../README.md) | [下一章：第 24 章 - Grid 基础](./chapter-24.md)
