# 第 24 章：Grid 基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Grid 容器

### 题目

如何创建 Grid 容器？

**选项：**
- A. `display: grid`
- B. `grid: 1`
- C. `grid-template: auto`
- D. `grid-column: 1`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**创建 Grid 容器**

```css
.container {
  display: grid;  /* 块级 Grid 容器 */
}

.inline-container {
  display: inline-grid;  /* 行内 Grid 容器 */
}
```

**基本用法：**
```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 200px;
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** fr 单位

### 题目

Grid 中的 `fr` 单位代表什么？

**选项：**
- A. fraction（份数）
- B. frame（框架）
- C. free（自由）
- D. fixed ratio（固定比例）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**fr - fraction（剩余空间的份数）**

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}
```

**计算：**
```
容器宽度：800px
总份数：1 + 2 + 1 = 4

列1：800 × (1/4) = 200px
列2：800 × (2/4) = 400px
列3：800 × (1/4) = 200px
```

**混合单位：**
```css
grid-template-columns: 100px 1fr 2fr;
width: 700px;

/*
  固定：100px
  剩余：600px
  
  列1：100px
  列2：600 × (1/3) = 200px
  列3：600 × (2/3) = 400px
*/
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Grid vs Flexbox

### 题目

Grid 是二维布局，Flexbox 是一维布局。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Grid 与 Flexbox 的维度**

**Flexbox（一维）：**
```css
.flex {
  display: flex;
  /* 只控制一个方向（行或列）*/
}
```

**Grid（二维）：**
```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 列 */
  grid-template-rows: 100px 200px;  /* 行 */
  /* 同时控制行和列 */
}
```

**可视化：**
```
Flexbox:
→ [1][2][3] 或 ↓ [1]
                   [2]
                   [3]

Grid:
  列1  列2  列3
行1 [1] [2] [3]
行2 [4] [5] [6]
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** Grid 容器属性

### 题目

以下哪些是 Grid 容器属性？

**选项：**
- A. `grid-template-columns`
- B. `gap`
- C. `grid-column`
- D. `grid-auto-rows`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**Grid 属性分类**

**✅ 容器属性：**
```css
.container {
  /* 显式网格 */
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 100px 200px;
  grid-template-areas: "header header";
  
  /* 隐式网格 */
  grid-auto-rows: 100px;
  grid-auto-columns: 1fr;
  grid-auto-flow: row;
  
  /* 间距 */
  gap: 20px;
  
  /* 对齐 */
  justify-items: center;
  align-items: center;
  justify-content: center;
  align-content: center;
}
```

**❌ C. grid-column（项目属性）**
```css
.item {
  grid-column: 1 / 3;  /* 项目属性 */
  grid-row: 1 / 2;
  grid-area: header;
  justify-self: center;
  align-self: center;
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** repeat() 函数

### 题目

`grid-template-columns: repeat(3, 1fr)` 创建几列？

**选项：**
- A. 1列
- B. 3列
- C. 取决于内容
- D. 无限列

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**repeat() 函数**

```css
/* 简写 */
grid-template-columns: repeat(3, 1fr);

/* 等同于 */
grid-template-columns: 1fr 1fr 1fr;
```

**高级用法：**

**复杂模式：**
```css
repeat(2, 100px 200px)
/* = 100px 200px 100px 200px */
```

**auto-fill：**
```css
repeat(auto-fill, 200px)
/* 自动填充，尽可能多的列 */
```

**auto-fit：**
```css
repeat(auto-fit, minmax(200px, 1fr))
/* 自动适应，拉伸列 */
```

**实用示例：**
```css
/* 固定3列 */
.grid {
  grid-template-columns: repeat(3, 1fr);
}

/* 响应式：至少200px，自动适应 */
.grid-responsive {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** grid-template-areas

### 题目

`grid-template-areas` 的作用是？

**选项：**
- A. 设置网格列数
- B. 命名网格区域
- C. 设置网格行数
- D. 设置网格间距

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**grid-template-areas 命名区域**

```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

**可视化：**
```
┌────────────────────────┐
│ header header header   │
├──────┬─────────────────┤
│side- │ main      main  │
│bar   │                 │
├──────┴─────────────────┤
│ footer footer footer   │
└────────────────────────┘
```

**占位符：**
```css
grid-template-areas:
  "header header ."
  "sidebar main main"
  ". footer footer";
/* . 表示空单元格 */
```

**响应式布局：**
```css
/* 移动端 */
.container {
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

/* 桌面端 */
@media (min-width: 768px) {
  .container {
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** gap 属性

### 题目

`gap: 20px 30px` 的含义是？

**选项：**
- A. 行间距 20px，列间距 30px
- B. 列间距 20px，行间距 30px
- C. 所有间距 20px
- D. 语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**gap 间距设置**

```css
.grid {
  gap: 20px 30px;
  /* row-gap: 20px */
  /* column-gap: 30px */
}
```

**语法：**
```css
/* 单值：行列相同 */
gap: 20px;

/* 双值：行间距 列间距 */
gap: 20px 30px;

/* 分开设置 */
row-gap: 20px;
column-gap: 30px;
```

**旧语法（兼容）：**
```css
grid-gap: 20px;
grid-row-gap: 20px;
grid-column-gap: 30px;
```

**可视化：**
```
gap: 20px 30px
     ↓     ↓
   行间距 列间距

  30px  30px
  ↓    ↓
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤ ← 20px
│ 4 │ 5 │ 6 │
└───┴───┴───┘
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
  grid-template-columns: repeat(3, 1fr);
}

.item {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}
```

**选项：**
- A. 1个单元格
- B. 2个单元格
- C. 4个单元格
- D. 6个单元格

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Grid 线编号**

**线编号：**
```
    1   2   3   4
  ┌───┬───┬───┐
1 │   │   │   │
  ├───┼───┼───┤
2 │   │   │   │
  ├───┼───┼───┤
3 │   │   │   │
  └───┴───┴───┘
```

**grid-column: 1 / 3**
```
从线1到线3 = 2列（第1和第2列）
```

**grid-row: 1 / 3**
```
从线1到线3 = 2行（第1和第2行）
```

**结果：2列 × 2行 = 4个单元格 ✅**

**可视化：**
```
    1   2   3   4
  ┌───┬───┬───┐
1 │ X │ X │   │
  ├───┼───┼───┤
2 │ X │ X │   │
  ├───┼───┼───┤
3 │   │   │   │
  └───┴───┴───┘
```

**简写形式：**
```css
/* 完整 */
grid-column-start: 1;
grid-column-end: 3;
grid-row-start: 1;
grid-row-end: 3;

/* 简写 */
grid-column: 1 / 3;
grid-row: 1 / 3;

/* 更简写 */
grid-area: 1 / 1 / 3 / 3;
/* row-start / col-start / row-end / col-end */
```

**span 语法：**
```css
grid-column: 1 / span 2;  /* 从线1开始，跨2列 */
grid-row: span 2;  /* 从当前位置跨2行 */
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** minmax() 函数

### 题目

`minmax(200px, 1fr)` 的含义是？

**选项：**
- A. 最小200px，最大不限
- B. 最小200px，最大1fr
- C. 固定200px或1fr
- D. 200px到1fr之间

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**minmax() 定义尺寸范围**

```css
.grid {
  grid-template-columns: minmax(200px, 1fr);
}
```

**含义：**
- 最小：200px
- 最大：1fr（剩余空间的1份）

**实用场景：**

**响应式列：**
```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 每列最小200px，自动适应 */
```

**固定侧边栏 + 弹性主区域：**
```css
grid-template-columns: minmax(200px, 300px) 1fr;
/* 侧边栏：200-300px */
/* 主区域：剩余空间 */
```

**常用组合：**

**1. 自适应网格：**
```css
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
/* 自动填充，每列至少200px */
```

**2. 响应式三列：**
```css
grid-template-columns: 
  minmax(150px, 200px)
  minmax(300px, 1fr)
  minmax(150px, 200px);
/* 侧边栏固定范围，中间弹性 */
```

**3. 等高行：**
```css
grid-auto-rows: minmax(100px, auto);
/* 最小100px，内容多时自动增长 */
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** Grid 对齐

### 题目

Grid 中的对齐属性有？

**选项：**
- A. `justify-items` - 项目在单元格内的水平对齐
- B. `align-items` - 项目在单元格内的垂直对齐
- C. `justify-content` - 整个网格的水平对齐
- D. `align-content` - 整个网格的垂直对齐

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**Grid 对齐属性（全部正确）**

**✅ A. justify-items（项目水平对齐）**
```css
.grid {
  justify-items: center;
  /* 项目在单元格内水平居中 */
}
```

**✅ B. align-items（项目垂直对齐）**
```css
.grid {
  align-items: center;
  /* 项目在单元格内垂直居中 */
}
```

**✅ C. justify-content（网格水平分布）**
```css
.grid {
  justify-content: center;
  /* 整个网格在容器内水平居中 */
}
```

**✅ D. align-content（网格垂直分布）**
```css
.grid {
  align-content: center;
  /* 整个网格在容器内垂直居中 */
}
```

**完整对齐体系：**

**容器属性：**
```css
/* 所有项目 */
justify-items: start | end | center | stretch;
align-items: start | end | center | stretch;

/* 整个网格 */
justify-content: start | end | center | space-between | space-around;
align-content: start | end | center | space-between | space-around;
```

**项目属性：**
```css
/* 单个项目 */
justify-self: start | end | center | stretch;
align-self: start | end | center | stretch;
```

**简写：**
```css
/* 容器 */
place-items: <align-items> <justify-items>;
place-content: <align-content> <justify-content>;

/* 项目 */
place-self: <align-self> <justify-self>;
```

**记忆技巧：**
```
justify- → 水平（行轴）
align-   → 垂直（列轴）

-items   → 项目在单元格内
-content → 网格在容器内
-self    → 单个项目
```

**实用示例：**
```css
/* 项目居中 */
.grid {
  place-items: center;
  /* = align-items: center; justify-items: center; */
}

/* 网格居中 */
.grid {
  place-content: center;
  height: 500px;
}

/* 单个项目特殊对齐 */
.special-item {
  place-self: end;
}
```

</details>

---

**导航**  
[上一章：第 23 章 - Flexbox进阶](./chapter-23.md) | [返回目录](../README.md) | [下一章：第 25 章 - Grid 进阶](./chapter-25.md)
