# 第 13 章：盒的生成与布局 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** display 属性

### 题目

`display` 属性的值决定了什么？

**选项：**
- A. 元素的颜色
- B. 元素生成的盒类型
- C. 元素的字体大小
- D. 元素的边框样式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**display 决定盒类型**

```css
/* 块级盒 */
display: block;

/* 行内盒 */
display: inline;

/* 行内块盒 */
display: inline-block;

/* 弹性盒 */
display: flex;

/* 网格盒 */
display: grid;
```

**盒类型影响：**
- 布局方式
- 是否独占一行
- 能否设置宽高
- 子元素的排列方式

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** display 双值语法

### 题目

`display: block` 的完整双值语法是？

**选项：**
- A. `display: block block`
- B. `display: block flow`
- C. `display: outer inner`
- D. `display: block inline`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**display 双值语法**

**格式：`display: <outer> <inner>`**

```css
/* 单值 → 双值 */
display: block;        /* = block flow */
display: inline;       /* = inline flow */
display: flex;         /* = block flex */
display: inline-flex;  /* = inline flex */
display: grid;         /* = block grid */
display: inline-grid;  /* = inline grid */
```

**outer（外部显示类型）：**
- `block` - 块级
- `inline` - 行内

**inner（内部显示类型）：**
- `flow` - 正常流
- `flex` - 弹性布局
- `grid` - 网格布局
- `table` - 表格布局

**示例：**
```css
.container {
  display: block flex;
  /* 外部：块级（独占一行）
     内部：flex（子元素弹性布局）*/
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** display: none

### 题目

`display: none` 的元素不占据空间且不渲染。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**display: none 效果**

```css
.hidden {
  display: none;
}
```

**特点：**
- ✅ 不生成盒
- ✅ 不占据空间
- ✅ 不渲染
- ✅ 子元素也不显示

**对比其他隐藏方式：**

**visibility: hidden**
```css
.invisible {
  visibility: hidden;
}
/* 占据空间，不可见 */
```

**opacity: 0**
```css
.transparent {
  opacity: 0;
}
/* 占据空间，透明 */
```

**对比表：**

| 属性 | 占据空间 | 可见 | 事件响应 |
|------|---------|------|---------|
| display: none | ❌ | ❌ | ❌ |
| visibility: hidden | ✅ | ❌ | ❌ |
| opacity: 0 | ✅ | ❌ | ✅ |

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 特殊 display 值

### 题目

以下哪些是有效的 `display` 值？

**选项：**
- A. `contents`
- B. `flow-root`
- C. `list-item`
- D. `table-cell`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**特殊 display 值（全部正确）**

**✅ A. contents**
```css
.wrapper {
  display: contents;
}
/* 元素本身不生成盒，子元素直接参与父级布局 */
```

```html
<div class="grid">
  <div class="wrapper" style="display: contents;">
    <div>A</div>
    <div>B</div>
  </div>
</div>
<!-- A、B 直接成为 grid 的子项 -->
```

**✅ B. flow-root**
```css
.container {
  display: flow-root;
}
/* 创建 BFC，清除浮动 */
```

**✅ C. list-item**
```css
div {
  display: list-item;
}
/* 显示列表项标记 */
```

**✅ D. table-cell**
```css
div {
  display: table-cell;
}
/* 表现为表格单元格 */
```

**其他表格相关值：**
```css
display: table;
display: table-row;
display: table-column;
display: table-header-group;
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** display: contents

### 题目

以下代码的布局结果是？

```html
<div class="grid">
  <div class="wrapper">
    <div>A</div>
    <div>B</div>
  </div>
  <div>C</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.wrapper {
  display: contents;
}
```

**选项：**
- A. wrapper、A、B 占 3 列
- B. A、B、C 各占 1 列
- C. wrapper 占 1 列，A、B、C 占剩余空间
- D. 布局错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**display: contents 效果**

**实际结构：**
```
.wrapper 不生成盒，其子元素提升

grid 的直接子元素：
1. <div>A</div>
2. <div>B</div>
3. <div>C</div>
```

**布局：**
```
┌───┬───┬───┐
│ A │ B │ C │
└───┴───┴───┘
```

**如果没有 contents：**
```css
.wrapper {
  /* display: block; */
}
```

**结构：**
```
grid 的直接子元素：
1. <div class="wrapper"> (包含 A、B)
2. <div>C</div>

┌─────────┬───┬───┐
│ wrapper │ C │   │
│  (A, B) │   │   │
└─────────┴───┴───┘
```

**实用场景：**
```html
<!-- 语义化 wrapper 不影响布局 -->
<div class="grid">
  <section style="display: contents;">
    <div>Item 1</div>
    <div>Item 2</div>
  </section>
  <div>Item 3</div>
</div>
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** flow-root

### 题目

`display: flow-root` 的主要作用是？

**选项：**
- A. 创建浮动
- B. 创建 BFC
- C. 创建网格布局
- D. 创建弹性布局

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flow-root 创建 BFC**

```css
.container {
  display: flow-root;
}
```

**作用：**
- 创建新的块级格式化上下文（BFC）
- 清除浮动
- 防止 margin 塌陷

**清除浮动示例：**
```html
<div class="container">
  <div class="float">Float</div>
</div>
```

```css
.float {
  float: left;
}

/* 传统方法 */
.container {
  overflow: hidden;  /* 副作用：裁剪溢出 */
}

/* 推荐方法 */
.container {
  display: flow-root;  /* 无副作用 ✅ */
}
```

**对比其他创建 BFC 的方式：**
```css
overflow: hidden;     /* 裁剪溢出 */
position: absolute;   /* 脱离文档流 */
float: left;          /* 脱离文档流 */
display: flow-root;   /* 无副作用 ✅ */
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 盒模型转换

### 题目

以下元素会生成什么类型的盒？

```css
span {
  display: block;
  float: left;
}
```

**选项：**
- A. 行内盒
- B. 块级盒
- C. 浮动盒
- D. 行内块盒

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**display 计算值变化**

**规则：浮动或绝对定位会修改 display 计算值**

```css
span {
  display: block;    /* 声明值 */
  float: left;
  /* 计算值：block */
  /* 实际生成：浮动盒 */
}
```

**转换规则：**

**浮动元素：**
```css
display: inline;       → block
display: inline-block; → block
display: table-*;      → table
```

**绝对定位：**
```css
position: absolute;
display: inline;       → block
display: inline-flex;  → flex
```

**示例：**
```css
/* 原本是 inline */
span {
  display: inline;
  float: left;
}
/* 计算值变为 block */

/* 原本是 inline-flex */
div {
  display: inline-flex;
  position: absolute;
}
/* 计算值变为 flex */
```

**不转换的情况：**
```css
/* flex/grid 不转换 */
display: flex;
float: left;  /* 无效，flex 优先 */
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂布局

### 题目

以下代码中，哪些元素会成为 flex 容器的直接子项？

```html
<div class="flex">
  <div>A</div>
  Text node
  <div style="display: contents;">
    <div>B</div>
    <div>C</div>
  </div>
  <div>D</div>
</div>
```

```css
.flex {
  display: flex;
}
```

**选项：**
- A. A, Text node, contents div, D
- B. A, Text node, B, C, D
- C. A, B, C, D
- D. A, contents div, D

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**flex 子项确定**

**处理规则：**

**1. display: contents**
```html
<div style="display: contents;">
  <div>B</div>
  <div>C</div>
</div>
<!-- 不生成盒，B、C 提升 -->
```

**2. 文本节点**
```
Text node → 包装为匿名 flex 项
```

**最终子项：**
```
1. <div>A</div>
2. 匿名盒 (Text node)
3. <div>B</div>  (从 contents 提升)
4. <div>C</div>  (从 contents 提升)
5. <div>D</div>
```

**可视化：**
```
┌───┬────┬───┬───┬───┐
│ A │Text│ B │ C │ D │
└───┴────┴───┴───┴───┘
```

**对比没有 contents：**
```html
<div class="flex">
  <div>A</div>
  <div>  <!-- 普通 div -->
    <div>B</div>
    <div>C</div>
  </div>
  <div>D</div>
</div>

<!-- 子项：A, wrapper(B,C), D -->
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** display 组合

### 题目

以下哪个组合无效？

**选项：**
- A. `display: inline-flex`
- B. `display: inline-grid`
- C. `display: inline-table`
- D. `display: inline-block-flex`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**有效的 display 组合**

**✅ A. inline-flex（有效）**
```css
.box {
  display: inline-flex;
  /* = inline flex */
}
/* 外部：inline，内部：flex */
```

**✅ B. inline-grid（有效）**
```css
.box {
  display: inline-grid;
  /* = inline grid */
}
```

**✅ C. inline-table（有效）**
```css
.box {
  display: inline-table;
  /* = inline table */
}
```

**❌ D. inline-block-flex（无效）**
```css
.box {
  display: inline-block-flex;  /* 语法错误 */
}
```

**正确的组合模式：**
```
<outer>-<inner>
或
<inner>（默认 outer 为 block）

有效：
- inline flex
- inline grid
- inline table
- block flex (= flex)
- block grid (= grid)

无效：
- inline block flex
- block inline grid
```

**双值语法示例：**
```css
/* 单值 → 双值转换 */
display: flex;         /* = block flex */
display: inline-flex;  /* = inline flex */
display: grid;         /* = block grid */
display: inline-grid;  /* = inline grid */
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

关于 `display` 属性的使用，以下说法正确的是？

**选项：**
- A. 使用 `flow-root` 代替 `overflow: hidden` 清除浮动
- B. 浮动元素的 `display` 会被修改为 `block`
- C. `display: none` 的元素不参与布局
- D. `contents` 可用于去除语义化标签的布局影响

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**display 最佳实践（全部正确）**

**✅ A. flow-root 清除浮动**
```css
/* ❌ 传统方法 */
.container {
  overflow: hidden;  /* 副作用：裁剪 */
}

/* ✅ 现代方法 */
.container {
  display: flow-root;  /* 无副作用 */
}
```

**✅ B. 浮动修改 display**
```css
span {
  display: inline;
  float: left;
}
/* 计算值变为 block */
```

**✅ C. display: none 不参与布局**
```css
.hidden {
  display: none;
}
/* 完全移除，不占空间 */
```

**✅ D. contents 去除布局影响**
```html
<div class="grid">
  <section style="display: contents;">
    <!-- 语义化包装，不影响布局 -->
    <div>Item 1</div>
    <div>Item 2</div>
  </section>
</div>
```

**其他最佳实践：**

**1. 语义化 + 布局分离**
```html
<article style="display: contents;">
  <div>Content</div>
</article>
```

**2. BFC 创建**
```css
/* 推荐 */
display: flow-root;

/* 备选 */
overflow: auto;  /* 如需滚动 */
```

**3. 隐藏元素**
```css
/* 完全移除 */
display: none;

/* 保留空间 */
visibility: hidden;

/* 可交互透明 */
opacity: 0;
```

</details>

---

**导航**  
[上一章：第 12 章 - 正常流](./chapter-12.md) | [返回目录](../README.md) | [下一章：第 14 章 - BFC](./chapter-14.md)
