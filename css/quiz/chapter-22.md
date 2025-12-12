# 第 22 章：Flexbox 基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Flex 容器

### 题目

如何创建 flex 容器？

**选项：**
- A. `display: flex`
- B. `flex: 1`
- C. `flex-direction: row`
- D. `justify-content: center`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**创建 flex 容器**

```css
.container {
  display: flex;  /* 块级 flex 容器 */
}

.inline-container {
  display: inline-flex;  /* 行内 flex 容器 */
}
```

**效果：**
- 子元素自动成为 flex 项目
- 沿主轴排列
- 可使用 flex 相关属性

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 主轴方向

### 题目

`flex-direction` 的默认值是？

**选项：**
- A. column
- B. row
- C. row-reverse
- D. column-reverse

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex-direction 默认值**

```css
.container {
  display: flex;
  flex-direction: row;  /* 默认值 */
}
```

**所有值：**
```css
flex-direction: row;             /* 水平，从左到右 */
flex-direction: row-reverse;     /* 水平，从右到左 */
flex-direction: column;          /* 垂直，从上到下 */
flex-direction: column-reverse;  /* 垂直，从下到上 */
```

**可视化：**
```
row:           [1][2][3] →
row-reverse:   ← [3][2][1]

column:        [1]
               [2]
               [3]
               ↓

column-reverse: ↑
               [3]
               [2]
               [1]
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** flex 简写

### 题目

`flex: 1` 等同于 `flex: 1 1 0%`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**flex 简写语法**

```css
.item {
  flex: 1;
  /* 等同于 */
  flex: 1 1 0%;
  /* flex-grow: 1 */
  /* flex-shrink: 1 */
  /* flex-basis: 0% */
}
```

**常用简写：**
```css
flex: 1;        /* 1 1 0% */
flex: auto;     /* 1 1 auto */
flex: none;     /* 0 0 auto */
flex: 0;        /* 0 1 0% */
```

**完整语法：**
```css
flex: <flex-grow> <flex-shrink> <flex-basis>;
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 容器属性

### 题目

以下哪些是 flex 容器属性？

**选项：**
- A. `justify-content`
- B. `align-items`
- C. `flex-wrap`
- D. `flex-grow`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**flex 属性分类**

**✅ 容器属性：**
```css
.container {
  /* 方向 */
  flex-direction: row;
  flex-wrap: wrap;
  flex-flow: row wrap;  /* 简写 */
  
  /* 主轴对齐 */
  justify-content: center;
  
  /* 交叉轴对齐 */
  align-items: center;
  align-content: center;
  
  /* 间距 */
  gap: 20px;
}
```

**❌ D. flex-grow（项目属性）**
```css
.item {
  flex-grow: 1;  /* 项目属性 */
  flex-shrink: 1;
  flex-basis: auto;
  flex: 1;  /* 简写 */
  
  align-self: center;
  order: 1;
}
```

**完整分类表：**

| 容器属性 | 项目属性 |
|---------|---------|
| flex-direction | flex-grow |
| flex-wrap | flex-shrink |
| justify-content | flex-basis |
| align-items | flex (简写) |
| align-content | align-self |
| gap | order |

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** justify-content

### 题目

`justify-content: space-between` 的效果是？

**选项：**
- A. 项目间距相等，两端无间距
- B. 项目间距相等，两端有间距
- C. 所有间距相等（包括两端）
- D. 居中对齐

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**justify-content 对齐方式**

**space-between（两端对齐）：**
```css
.container {
  display: flex;
  justify-content: space-between;
}
```

```
|[1]    [2]    [3]|
  ↑      ↑      ↑
两端贴边，中间等距
```

**其他值对比：**

**flex-start（起始对齐）：**
```
|[1][2][3]       |
```

**center（居中）：**
```
|    [1][2][3]   |
```

**space-around（环绕间距）：**
```
| [1]  [2]  [3] |
  ↑    ↑    ↑
项目两侧间距相等
```

**space-evenly（均匀分布）：**
```
| [1] [2] [3] |
  ↑   ↑   ↑
所有间距完全相等
```

**可视化对比：**
```
space-between:  |[1]    [2]    [3]|
space-around:   | [1]  [2]  [3] |
space-evenly:   | [1] [2] [3] |
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** align-items

### 题目

如何实现 flex 项目垂直居中？

**选项：**
- A. `justify-content: center`
- B. `align-items: center`
- C. `align-content: center`
- D. `vertical-align: middle`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex 垂直居中**

```css
.container {
  display: flex;
  align-items: center;  /* 交叉轴居中 */
  height: 200px;
}
```

**完全居中（水平 + 垂直）：**
```css
.container {
  display: flex;
  justify-content: center;  /* 主轴居中 */
  align-items: center;      /* 交叉轴居中 */
  height: 200px;
}
```

**属性说明：**

**justify-content：**
- 控制主轴对齐
- row：水平对齐
- column：垂直对齐

**align-items：**
- 控制交叉轴对齐
- row：垂直对齐 ✅
- column：水平对齐

**align-content：**
- 多行对齐
- 需要 `flex-wrap: wrap`

**记忆技巧：**
```
justify- → 主轴
align-   → 交叉轴

默认 row（水平）：
justify → 水平
align   → 垂直
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** flex-wrap

### 题目

`flex-wrap: wrap` 的作用是？

**选项：**
- A. 禁止换行
- B. 允许换行
- C. 反向换行
- D. 自动换行

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex-wrap 换行控制**

```css
.container {
  display: flex;
  flex-wrap: wrap;  /* 允许换行 */
}
```

**所有值：**

**nowrap（默认）：**
```css
flex-wrap: nowrap;
/* 不换行，压缩项目 */
```

```
┌──────────────────┐
│[1][2][3][4][5][6]│ ← 压缩
└──────────────────┘
```

**wrap：**
```css
flex-wrap: wrap;
/* 换行，第一行在上 */
```

```
┌──────────────────┐
│[1][2][3]         │ ← 第一行
│[4][5][6]         │ ← 第二行
└──────────────────┘
```

**wrap-reverse：**
```css
flex-wrap: wrap-reverse;
/* 换行，第一行在下 */
```

```
┌──────────────────┐
│[4][5][6]         │ ← 第二行
│[1][2][3]         │ ← 第一行
└──────────────────┘
```

**实用场景：**
```css
/* 响应式网格 */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 0 0 calc(33.333% - 14px);
}

/* 小屏幕 */
@media (max-width: 768px) {
  .item {
    flex: 0 0 calc(50% - 10px);
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** flex 计算

### 题目

以下代码中，三个项目的宽度分别是？

```css
.container {
  display: flex;
  width: 600px;
}

.item1 { flex: 1 1 100px; }
.item2 { flex: 2 1 100px; }
.item3 { flex: 1 1 100px; }
```

**选项：**
- A. 100px, 200px, 100px
- B. 175px, 250px, 175px
- C. 150px, 300px, 150px
- D. 200px, 200px, 200px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex 计算公式**

**步骤1：计算 basis 总和**
```
100px + 100px + 100px = 300px
```

**步骤2：计算剩余空间**
```
600px - 300px = 300px
```

**步骤3：按 flex-grow 分配**
```
flex-grow 总和：1 + 2 + 1 = 4

item1: 100px + 300px × (1/4) = 100 + 75 = 175px
item2: 100px + 300px × (2/4) = 100 + 150 = 250px
item3: 100px + 300px × (1/4) = 100 + 75 = 175px
```

**结果：175px, 250px, 175px ✅**

**完整公式：**
```
最终宽度 = flex-basis + (剩余空间 × flex-grow / grow总和)
```

**如果空间不足（shrink）：**
```css
.container { width: 200px; }  /* 小于 basis 总和 */

.item1 { flex: 1 1 100px; }
.item2 { flex: 2 1 100px; }
.item3 { flex: 1 1 100px; }

/* 
  basis总和：300px
  缺少：100px
  
  按 flex-shrink 收缩：
  item1: 100 - (100 × 1/4) = 75px
  item2: 100 - (100 × 1/4) = 75px
  item3: 100 - (100 × 1/4) = 75px
  
  (简化计算，实际更复杂)
*/
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** align-self

### 题目

以下代码中，`.item2` 的对齐方式是？

```css
.container {
  display: flex;
  align-items: flex-start;
  height: 200px;
}

.item2 {
  align-self: flex-end;
}
```

**选项：**
- A. 顶部对齐
- B. 底部对齐
- C. 居中对齐
- D. 拉伸对齐

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**align-self 覆盖 align-items**

```css
.container {
  align-items: flex-start;  /* 所有项目顶部对齐 */
}

.item2 {
  align-self: flex-end;  /* item2 底部对齐 ✅ */
}
```

**可视化：**
```
┌──────────────────┐
│[1]        [3]    │ ← flex-start
│                  │
│          [2]     │ ← flex-end (align-self)
└──────────────────┘
```

**align-self 值：**
```css
align-self: auto;        /* 继承 align-items（默认）*/
align-self: flex-start;  /* 起始对齐 */
align-self: flex-end;    /* 末尾对齐 */
align-self: center;      /* 居中 */
align-self: stretch;     /* 拉伸 */
align-self: baseline;    /* 基线对齐 */
```

**优先级：**
```
align-self > align-items
```

**实用场景：**
```css
.card-container {
  display: flex;
  align-items: flex-start;
}

.card-featured {
  align-self: stretch;  /* 特殊卡片拉伸 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** Flexbox 优势

### 题目

相比浮动布局，flexbox 的优势有？

**选项：**
- A. 更简洁的代码
- B. 垂直居中更容易
- C. 不需要清除浮动
- D. 更好的响应式支持

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**Flexbox 优势（全部正确）**

**✅ A. 代码更简洁**
```css
/* 浮动 */
.float-col {
  float: left;
  width: 33.33%;
}
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Flexbox */
.flex-container {
  display: flex;
}
.flex-col {
  flex: 1;
}
```

**✅ B. 垂直居中容易**
```css
/* 浮动：困难 */

/* Flexbox：简单 */
.container {
  display: flex;
  align-items: center;
}
```

**✅ C. 无需清除浮动**
```css
/* 浮动：需要清除 */
.clearfix { }

/* Flexbox：不需要 */
.flex { display: flex; }
```

**✅ D. 响应式支持好**
```css
/* Flexbox 自适应 */
.container {
  display: flex;
  flex-wrap: wrap;
}

.item {
  flex: 1 1 300px;  /* 最小300px，自动换行 */
}
```

**完整对比：**

| 特性 | 浮动 | Flexbox |
|------|------|---------|
| 代码简洁 | ❌ | ✅ |
| 垂直居中 | 困难 | 容易 |
| 等高列 | 困难 | 自动 |
| 清除浮动 | 需要 | 不需要 |
| 响应式 | 复杂 | 简单 |
| 顺序控制 | 困难 | `order` |
| 间距控制 | `margin` | `gap` |

**何时使用 Flexbox：**
- 一维布局（行或列）
- 导航栏
- 卡片列表
- 工具栏
- 表单布局

**何时使用 Grid：**
- 二维布局（行和列）
- 整体页面布局
- 复杂网格

</details>

---

**导航**  
[上一章：第 21 章 - 浮动与清除](./chapter-21.md) | [返回目录](../README.md) | [下一章：第 23 章 - Flexbox 进阶](./chapter-23.md)
