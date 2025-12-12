# 第 3 章：盒模型基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 盒模型组成

### 题目

CSS 盒模型从内到外的组成顺序是？

**选项：**
- A. content → padding → border → margin
- B. content → margin → padding → border
- C. content → border → padding → margin
- D. margin → border → padding → content

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**盒模型的四个组成部分（从内到外）**

```
┌─────────────────────────────┐
│   margin（外边距）            │
│  ┌──────────────────────┐   │
│  │ border（边框）        │   │
│  │ ┌────────────────┐   │   │
│  │ │ padding（内边距）│  │   │
│  │ │ ┌──────────┐   │   │   │
│  │ │ │ content  │   │   │   │
│  │ │ │（内容区）│   │   │   │
│  │ │ └──────────┘   │   │   │
│  │ └────────────────┘   │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

**各部分说明：**
- **content**：实际内容（文本、图片等）
- **padding**：内边距，内容与边框之间的空间
- **border**：边框，围绕 padding
- **margin**：外边距，与其他元素的距离

**示例：**
```css
.box {
  width: 200px;        /* content 宽度 */
  padding: 20px;       /* 内边距 */
  border: 5px solid;   /* 边框 */
  margin: 10px;        /* 外边距 */
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** box-sizing

### 题目

`box-sizing: border-box` 的作用是什么？

**选项：**
- A. 设置边框样式
- B. width 包含 padding 和 border
- C. 移除边框
- D. 设置边框大小

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**box-sizing 属性**

**`content-box`（默认值）**
```css
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
/* 实际宽度 = 200 + 20×2 + 5×2 = 250px */
```

**`border-box`（推荐）**
```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
/* 实际宽度 = 200px（padding和border内缩）*/
/* content宽度 = 200 - 20×2 - 5×2 = 150px */
```

**对比图示：**
```
content-box:
├─ content: 200px
├─ padding: 20px × 2
├─ border: 5px × 2
└─ 总宽度: 250px

border-box:
├─ 总宽度: 200px
├─ border: 5px × 2
├─ padding: 20px × 2
└─ content: 150px
```

**最佳实践：**
```css
* {
  box-sizing: border-box;
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** margin 特性

### 题目

垂直方向的 margin 会发生外边距合并（margin collapsing）。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**外边距合并（Margin Collapsing）**

**发生条件：**
- 垂直方向的相邻元素
- 块级元素
- 处于正常流中

**合并规则：**
```css
/* 相邻兄弟元素 */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* 实际间距 = max(30px, 20px) = 30px */
```

**三种合并情况：**

**1. 相邻兄弟**
```html
<div style="margin-bottom: 30px;">Box 1</div>
<div style="margin-top: 20px;">Box 2</div>
<!-- 间距：30px，而非 50px -->
```

**2. 父子元素**
```html
<div style="margin-top: 50px;">
  <p style="margin-top: 30px;">Text</p>
</div>
<!-- margin-top 合并为 50px -->
```

**3. 空元素**
```html
<div style="margin-top: 20px; margin-bottom: 30px;"></div>
<!-- 自身的 top 和 bottom 合并为 30px -->
```

**阻止合并：**
- 使用 padding/border 隔开
- 浮动或绝对定位
- 触发 BFC
- flex/grid 容器

**水平方向：**
```css
/* 水平 margin 不合并 */
.box1 { margin-right: 20px; }
.box2 { margin-left: 30px; }
/* 总间距 = 50px */
```

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 盒模型计算

### 题目

以下元素的实际占用宽度是多少？

```css
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 10px 20px;
  border: 5px solid;
  margin: 0 15px;
}
```

**选项：**
- A. 200px
- B. 240px
- C. 250px
- D. 280px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**盒模型宽度计算**

**组成部分：**
```
content:     200px
padding-left:  20px
padding-right: 20px
border-left:    5px
border-right:   5px
──────────────────
占用宽度:    250px
```

**详细计算：**
```
200 (width)
+ 20 (padding-left)
+ 20 (padding-right)
+ 5 (border-left)
+ 5 (border-right)
────────────────
= 250px
```

**注意：**
- margin 不计入元素宽度
- `box-sizing: content-box` 时，width 只是内容宽度
- padding 简写 `10px 20px` = 上下10px，左右20px

**如果是 border-box：**
```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 10px 20px;
  border: 5px solid;
}
/* 占用宽度 = 200px */
```

**完整占用空间（包含margin）：**
```
250px (元素宽度)
+ 15px (margin-left)
+ 15px (margin-right)
────────────────
= 280px (总占用空间)
```

</details>

---

## 第 5 题 🟡

**类型：** 多选题  
**标签：** display 属性

### 题目

以下哪些 display 值会使元素表现为块级元素？

**选项：**
- A. `block`
- B. `inline-block`
- C. `flex`
- D. `inline`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, C

### 📖 解析

**display 值分类**

**✅ 块级元素（独占一行）**
```css
display: block;      /* 块级 */
display: flex;       /* 块级 flex 容器 */
display: grid;       /* 块级 grid 容器 */
display: table;      /* 块级表格 */
```

**❌ 行内元素（不独占一行）**
```css
display: inline;         /* 行内 */
display: inline-block;   /* 行内块 */
display: inline-flex;    /* 行内 flex */
display: inline-grid;    /* 行内 grid */
```

**特性对比：**

| 特性 | block | inline | inline-block |
|------|-------|--------|--------------|
| 独占一行 | ✅ | ❌ | ❌ |
| 设置宽高 | ✅ | ❌ | ✅ |
| 垂直margin | ✅ | ❌ | ✅ |

**示例：**
```css
/* A. block - 块级 */
div { display: block; }

/* B. inline-block - 行内块（不是纯块级）*/
span { display: inline-block; }

/* C. flex - 块级 flex 容器 */
.container { display: flex; }

/* D. inline - 行内 */
a { display: inline; }
```

**双值语法：**
```css
display: block flex;      /* = flex */
display: inline flex;     /* = inline-flex */
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** margin 负值

### 题目

使用负 margin 会产生什么效果？

```css
.box {
  margin-top: -20px;
}
```

**选项：**
- A. 元素向下移动 20px
- B. 元素向上移动 20px
- C. 无效果
- D. 元素消失

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**负 margin 的效果**

**垂直方向：**
```css
/* 向上移动 */
.box {
  margin-top: -20px;    /* 向上移 20px */
}

/* 向下移动（拉近下方元素）*/
.box {
  margin-bottom: -20px; /* 下方元素向上移 */
}
```

**水平方向：**
```css
/* 向左移动 */
.box {
  margin-left: -20px;   /* 向左移 20px */
}

/* 向右移动（拉近右侧元素）*/
.box {
  margin-right: -20px;  /* 右侧元素向左移 */
}
```

**实用场景：**

**1. 突破容器限制**
```css
.container {
  padding: 20px;
}

.full-width {
  margin-left: -20px;
  margin-right: -20px;
  /* 抵消父元素的 padding */
}
```

**2. 多列布局**
```css
.row {
  margin-left: -10px;
  margin-right: -10px;
}

.col {
  padding: 10px;
}
```

**3. 元素重叠**
```css
.overlap {
  margin-top: -50px;
  /* 与上方元素重叠 */
}
```

**注意事项：**
- 可能导致元素重叠
- 影响布局流
- 谨慎使用

</details>

---

## 第 7 题 🟡

**类型：** 单选题  
**标签：** overflow

### 题目

当内容超出元素尺寸时，`overflow: hidden` 会？

**选项：**
- A. 显示滚动条
- B. 裁剪溢出内容
- C. 自动扩展元素
- D. 不显示内容

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**overflow 属性值**

**`overflow: hidden`**
```css
.box {
  width: 200px;
  height: 100px;
  overflow: hidden;  /* 裁剪溢出，不显示滚动条 */
}
```

**其他值：**

**`visible`（默认）**
```css
overflow: visible;  /* 溢出可见，不裁剪 */
```

**`scroll`**
```css
overflow: scroll;   /* 始终显示滚动条 */
```

**`auto`**
```css
overflow: auto;     /* 需要时显示滚动条 */
```

**单向控制：**
```css
.box {
  overflow-x: hidden;  /* 水平裁剪 */
  overflow-y: auto;    /* 垂直滚动 */
}
```

**副作用：**
```css
/* overflow: hidden 会创建 BFC */
.parent {
  overflow: hidden;
}

.float {
  float: left;
}
/* parent 会包含浮动元素 */
```

**实用场景：**
- 清除浮动
- 隐藏溢出文本
- 创建滚动区域
- 单行文本省略

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 盒模型陷阱

### 题目

以下代码中，`.child` 的 `margin-top` 会应用到哪个元素上？

```html
<div class="parent">
  <div class="child">Content</div>
</div>
```

```css
.parent {
  background: lightblue;
}

.child {
  margin-top: 20px;
  background: lightcoral;
}
```

**选项：**
- A. child 元素
- B. parent 元素
- C. 两者之间的间距
- D. 无效果

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**外边距塌陷（Margin Collapse）- 父子元素**

**问题现象：**
```
预期：child 的 margin-top 在 parent 内部
实际：margin-top 传递给 parent，parent 向下移动
```

**原因：**
- 父元素没有 border/padding 隔开
- 触发了外边距合并
- 子元素的 margin 穿透到父元素

**解决方案：**

**方案1：添加 border**
```css
.parent {
  border-top: 1px solid transparent;
}
```

**方案2：添加 padding**
```css
.parent {
  padding-top: 1px;
}
```

**方案3：触发 BFC**
```css
.parent {
  overflow: hidden;
  /* 或 */
  display: flow-root;
}
```

**方案4：使用 flexbox**
```css
.parent {
  display: flex;
  flex-direction: column;
}
```

**最佳实践：**
```css
/* 推荐使用 padding 代替 margin */
.parent {
  padding-top: 20px;
}

.child {
  /* margin-top: 20px; */ /* 移除 */
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** inline-block 间隙

### 题目

为什么以下代码中的 `div` 之间会有间隙？

```html
<div class="box">A</div>
<div class="box">B</div>
```

```css
.box {
  display: inline-block;
  width: 100px;
}
```

**选项：**
- A. margin 默认值
- B. HTML 中的空白符被渲染
- C. border 占用空间
- D. CSS 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**inline-block 间隙问题**

**原因：**
- HTML 中的换行和空格被渲染为空白符
- inline-block 元素之间保留空白

**问题演示：**
```html
<!-- 有间隙 -->
<div class="box">A</div>
<div class="box">B</div>

<!-- 无间隙 -->
<div class="box">A</div><div class="box">B</div>
```

**解决方案：**

**方案1：移除 HTML 空白**
```html
<div class="box">A</div><div class="box">B</div>
```

**方案2：父元素 font-size: 0**
```css
.parent {
  font-size: 0;
}

.box {
  font-size: 16px;  /* 重置 */
}
```

**方案3：负 margin**
```css
.box {
  margin-right: -4px;  /* 约 4px 间隙 */
}
```

**方案4：使用 flexbox**
```css
.parent {
  display: flex;
}

.box {
  /* 不需要 inline-block */
}
```

**方案5：HTML 注释**
```html
<div class="box">A</div><!--
--><div class="box">B</div>
```

**最佳实践：**
```css
/* 推荐使用 flex */
.container {
  display: flex;
  gap: 10px;  /* 明确间距 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 怪异盒模型

### 题目

关于怪异盒模型（IE盒模型），以下说法正确的是？

**选项：**
- A. width 包含 padding 和 border
- B. 通过 `box-sizing: border-box` 启用
- C. 是现代浏览器的默认行为
- D. 在某些场景下更实用

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**标准盒模型 vs 怪异盒模型**

**✅ A. 怪异盒模型的特点**
```css
/* 怪异盒模型（IE盒模型）*/
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
/* width 包含 padding 和 border */
/* content = 200 - 40 - 10 = 150px */
```

**✅ B. 通过 box-sizing 启用**
```css
/* 启用怪异盒模型 */
* {
  box-sizing: border-box;
}
```

**❌ C. 不是默认行为**
```css
/* 现代浏览器默认 */
box-sizing: content-box;  /* 标准盒模型 */
```

**✅ D. 某些场景更实用**

**实用场景：**

**1. 响应式布局**
```css
.col-half {
  box-sizing: border-box;
  width: 50%;
  padding: 10px;  /* 不影响总宽度 */
}
```

**2. 表单元素**
```css
input, textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  border: 1px solid;
  /* 宽度固定，padding 内缩 */
}
```

**对比：**

**标准盒模型：**
```
width = content
总宽度 = width + padding + border
```

**怪异盒模型：**
```
width = content + padding + border
总宽度 = width
```

**全局推荐：**
```css
/* 现代开发推荐 */
*, *::before, *::after {
  box-sizing: border-box;
}
```

</details>

---

**导航**  
[上一章：第 2 章 - 选择器系统](./chapter-02.md) | [返回目录](../README.md) | [下一章：第 4 章 - 基础样式属性](./chapter-04.md)
