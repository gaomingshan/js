# 第 17 章：GFC 网格格式化上下文 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** GFC 定义

### 题目

GFC（Grid Formatting Context）是由什么创建的？

**选项：**
- A. `display: block`
- B. `display: grid` 或 `display: inline-grid`
- C. `display: flex`
- D. `display: table`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**GFC - 网格格式化上下文**

```css
.container {
  display: grid;         /* 块级 grid 容器，创建 GFC */
}

.inline-container {
  display: inline-grid;  /* 行内 grid 容器，创建 GFC */
}
```

**GFC 特点：**
- 二维布局系统
- 行和列同时控制
- Grid 项目按网格排列
- 强大的对齐能力

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Grid 术语

### 题目

Grid 容器的子元素称为？

**选项：**
- A. grid cell
- B. grid item
- C. grid element
- D. grid box

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Grid 术语**

```css
.container {
  display: grid;  /* Grid 容器 */
}
```

```html
<div class="container">
  <div>Grid Item 1</div>  <!-- Grid 项目 -->
  <div>Grid Item 2</div>  <!-- Grid 项目 -->
</div>
```

**核心概念：**
- **Grid 容器**：设置 `display: grid` 的元素
- **Grid 项目**：Grid 容器的直接子元素
- **Grid 线**：分隔网格的线
- **Grid 轨道**：行或列
- **Grid 单元格**：行和列的交叉区域
- **Grid 区域**：多个单元格组成的矩形区域

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Grid vs Flex

### 题目

Grid 是二维布局系统，Flex 是一维布局系统。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Grid vs Flex 维度**

**Flex - 一维布局**
```css
.flex {
  display: flex;
  /* 只能控制主轴方向的排列 */
}
```

**Grid - 二维布局**
```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 200px;
  /* 同时控制行和列 */
}
```

**可视化对比：**

**Flex（一维）**
```
→ → → → →  (主轴)
[1][2][3][4]
```

**Grid（二维）**
```
  列1  列2  列3
行1 [1] [2] [3]
行2 [4] [5] [6]
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** Grid 属性

### 题目

以下哪些是 Grid 容器属性？

**选项：**
- A. `grid-template-columns`
- B. `grid-gap`
- C. `grid-auto-flow`
- D. `grid-column`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**Grid 容器属性**

**✅ A. grid-template-columns（容器）**
```css
.container {
  grid-template-columns: 1fr 2fr 1fr;
}
```

**✅ B. grid-gap（容器）**
```css
.container {
  gap: 20px;  /* 新语法 */
  grid-gap: 20px;  /* 旧语法 */
}
```

**✅ C. grid-auto-flow（容器）**
```css
.container {
  grid-auto-flow: row;  /* 或 column, dense */
}
```

**❌ D. grid-column（项目属性）**
```css
.item {
  grid-column: 1 / 3;  /* 项目属性 */
}
```

**完整分类：**

**容器属性：**
```css
grid-template-columns
grid-template-rows
grid-template-areas
gap (grid-gap)
justify-items
align-items
justify-content
align-content
grid-auto-columns
grid-auto-rows
grid-auto-flow
```

**项目属性：**
```css
grid-column
grid-row
grid-area
justify-self
align-self
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** fr 单位

### 题目

以下代码会创建什么样的布局？

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  width: 800px;
}
```

**选项：**
- A. 三列等宽
- B. 200px, 400px, 200px
- C. 100px, 600px, 100px
- D. 由内容决定

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**fr 单位计算**

**fr（fraction）- 剩余空间的份数**

```css
grid-template-columns: 1fr 2fr 1fr;
width: 800px;
```

**计算：**
```
总份数：1 + 2 + 1 = 4
每份：800px / 4 = 200px

列1：1fr = 200px
列2：2fr = 400px
列3：1fr = 200px
```

**结果：200px, 400px, 200px ✅**

**混合单位：**
```css
grid-template-columns: 100px 1fr 2fr;
width: 700px;

/* 
  固定：100px
  剩余：700 - 100 = 600px
  总份数：1 + 2 = 3
  每份：600 / 3 = 200px
  
  列1：100px
  列2：200px
  列3：400px
*/
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** repeat() 函数

### 题目

`grid-template-columns: repeat(3, 1fr)` 等同于？

**选项：**
- A. `1fr 1fr 1fr`
- B. `3fr`
- C. `repeat(1fr, 3)`
- D. `auto auto auto`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**repeat() 函数**

```css
/* 简写 */
grid-template-columns: repeat(3, 1fr);

/* 等同于 */
grid-template-columns: 1fr 1fr 1fr;
```

**语法：**
```css
repeat(次数, 模式)
```

**示例：**

**基础重复**
```css
repeat(4, 100px)
/* = 100px 100px 100px 100px */
```

**复杂模式**
```css
repeat(2, 1fr 2fr)
/* = 1fr 2fr 1fr 2fr */
```

**auto-fill**
```css
repeat(auto-fill, 200px)
/* 自动填充，尽可能多的列 */
```

**auto-fit**
```css
repeat(auto-fit, minmax(200px, 1fr))
/* 自动适应，拉伸列 */
```

**混合使用：**
```css
grid-template-columns: 100px repeat(3, 1fr) 100px;
/* = 100px 1fr 1fr 1fr 100px */
```

</details>

---

## 第 7 题 🟡

**类型：** 单选题  
**标签：** Grid 对齐

### 题目

`justify-items` 控制的是？

**选项：**
- A. 项目在行轨道中的对齐
- B. 项目在列轨道中的对齐
- C. 网格在容器中的对齐
- D. 行轨道的分布

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Grid 对齐属性**

**justify-items - 行轨道（水平）对齐**
```css
.container {
  justify-items: center;
  /* 项目在单元格内水平居中 */
}
```

**align-items - 列轨道（垂直）对齐**
```css
.container {
  align-items: center;
  /* 项目在单元格内垂直居中 */
}
```

**对齐属性分类：**

**项目在单元格内：**
```css
justify-items: start | end | center | stretch;
align-items: start | end | center | stretch;
```

**网格在容器内：**
```css
justify-content: start | end | center | space-between;
align-content: start | end | center | space-between;
```

**单个项目：**
```css
.item {
  justify-self: center;  /* 覆盖 justify-items */
  align-self: center;    /* 覆盖 align-items */
}
```

**记忆技巧：**
```
justify- → 水平（行）
align-   → 垂直（列）

-items   → 所有项目
-self    → 单个项目
-content → 整体网格
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** Grid 线编号

### 题目

以下代码中，`.item` 占据哪些单元格？

```css
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.item {
  grid-column: 2 / 4;
  grid-row: 1 / 3;
}
```

**选项：**
- A. 列2-3，行1-2
- B. 列2-4，行1-3
- C. 列1-3，行0-2
- D. 列2，行1

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Grid 线编号规则**

**grid-column: 2 / 4**
```
线编号：1  2  3  4  5
列：    │  │  │  │  │
       第1 第2 第3 第4

2 / 4 表示从线2到线4
占据：第2列和第3列
```

**grid-row: 1 / 3**
```
行：占据第1行和第2行
```

**可视化：**
```
    1   2   3   4   5
  ┌───┬───┬───┬───┐
1 │   │ X │ X │   │
  ├───┼───┼───┼───┤
2 │   │ X │ X │   │
  ├───┼───┼───┼───┤
3 │   │   │   │   │
  └───┴───┴───┴───┘
```

**结果：列2-3，行1-2 ✅**

**简写：**
```css
/* 完整写法 */
grid-column-start: 2;
grid-column-end: 4;
grid-row-start: 1;
grid-row-end: 3;

/* 简写 */
grid-column: 2 / 4;
grid-row: 1 / 3;

/* 更简写 */
grid-area: 1 / 2 / 3 / 4;
/* row-start / col-start / row-end / col-end */
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** minmax() 函数

### 题目

`grid-template-columns: repeat(3, minmax(200px, 1fr))` 的效果是？

**选项：**
- A. 三列固定200px
- B. 三列最小200px，平分剩余空间
- C. 三列最大1fr
- D. 语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**minmax() 函数**

```css
minmax(最小值, 最大值)
```

**本题分析：**
```css
grid-template-columns: repeat(3, minmax(200px, 1fr));
```

**含义：**
- 创建3列
- 每列最小200px
- 最大1fr（平分剩余空间）

**示例场景：**

**容器600px（刚好）：**
```
每列：200px
```

**容器900px（有剩余）：**
```
最小总和：600px
剩余：300px
每列：200px + 100px = 300px
```

**容器500px（不够）：**
```
每列压缩到：166.67px
（无法满足最小值时会溢出）
```

**实用场景：**
```css
/* 响应式列 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 
  自动适应，每列至少200px
  能放多少列放多少列
*/
```

**对比：**
```css
/* 固定 */
repeat(3, 200px)

/* 弹性但有最小值 */
repeat(3, minmax(200px, 1fr))  ✅

/* 完全弹性 */
repeat(3, 1fr)
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** GFC 特性

### 题目

关于 GFC，以下说法正确的是？

**选项：**
- A. Grid 项目可以重叠
- B. Grid 项目的 margin 不会合并
- C. Grid 项目的 float 属性无效
- D. Grid 只能创建规则的网格

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**GFC 特性分析**

**✅ A. 项目可以重叠**
```css
.item1 {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

.item2 {
  grid-column: 2 / 4;
  grid-row: 2 / 4;
}
/* item1 和 item2 会重叠 */
/* 使用 z-index 控制层叠 */
```

**✅ B. Margin 不合并**
```css
.item {
  margin: 20px;
}
/* margin 完全保留，不合并 */
```

**✅ C. Float 无效**
```css
.item {
  float: left;  /* 被忽略 */
}
```

**❌ D. 可以创建不规则网格（错误）**
```css
/* 可以创建不规则网格 */
grid-template-columns: 100px 1fr 2fr;
grid-template-rows: auto 200px 1fr;

/* 项目可以跨越不同数量的单元格 */
.item1 {
  grid-column: 1 / 4;  /* 跨3列 */
}

.item2 {
  grid-row: 1 / 3;  /* 跨2行 */
}
```

**其他特性：**

**隐式网格：**
```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px;  /* 隐式行 */
}
/* 超出定义的网格会自动创建 */
```

**命名网格线：**
```css
grid-template-columns: [start] 1fr [middle] 2fr [end];

.item {
  grid-column: start / middle;
}
```

**网格区域：**
```css
grid-template-areas:
  "header header header"
  "sidebar main main"
  "footer footer footer";

.header {
  grid-area: header;
}
```

</details>

---

**导航**  
[上一章：第 16 章 - FFC](./chapter-16.md) | [返回目录](../README.md) | [下一章：第 18 章 - 层叠上下文原理](./chapter-18.md)
