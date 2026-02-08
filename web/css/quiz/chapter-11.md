# 第 11 章：包含块 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 包含块定义

### 题目

包含块（Containing Block）的作用是什么？

**选项：**
- A. 决定元素的颜色
- B. 作为元素尺寸和定位的参照
- C. 控制元素的层叠顺序
- D. 决定元素的字体大小

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**包含块的作用**

包含块是元素尺寸和定位的参照系。

**影响的属性：**
```css
.box {
  width: 50%;        /* 相对包含块宽度 */
  height: 50%;       /* 相对包含块高度 */
  top: 10%;          /* 相对包含块 */
  left: 20%;         /* 相对包含块 */
  margin: 5%;        /* 相对包含块宽度 */
  padding: 10%;      /* 相对包含块宽度 */
}
```

**包含块的确定规则：**
- static/relative：父元素的内容区
- absolute：最近的 positioned 祖先的 padding box
- fixed：视口
- absolute + transform：含 transform 的祖先

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** static/relative 定位

### 题目

对于 `position: static` 或 `relative` 的元素，其包含块是？

**选项：**
- A. 视口
- B. 根元素
- C. 最近的块级祖先元素的内容区
- D. 最近的定位祖先元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**static/relative 的包含块**

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
.parent {
  width: 1000px;
  padding: 50px;
}

.child {
  position: relative;
  width: 50%;  /* 500px（父元素内容区宽度的50%）*/
}
```

**关键点：**
- 包含块是父元素的**内容区**（content box）
- 不包括 padding 和 border

**计算示例：**
```css
.parent {
  width: 1000px;     /* content */
  padding: 50px;     /* 不计入 */
  border: 10px solid;/* 不计入 */
  /* 包含块宽度 = 1000px */
}

.child {
  width: 50%;  /* 500px */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** absolute 定位

### 题目

`position: absolute` 的元素，其包含块是最近的 `position: relative` 祖先元素。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**absolute 包含块规则**

包含块是最近的 **positioned**（非 static）祖先，不限于 relative。

**可能的 positioned 值：**
```css
/* ✅ 都可以作为包含块 */
position: relative;
position: absolute;
position: fixed;
position: sticky;

/* ❌ 不能作为包含块 */
position: static;  /* 默认值 */
```

**示例：**
```html
<div style="position: absolute;">
  <div style="position: fixed;">
    <div style="position: absolute;">
      <!-- 包含块是 position: fixed 的祖先 -->
    </div>
  </div>
</div>
```

**如果没有 positioned 祖先：**
```css
/* 包含块是初始包含块（ICB，通常是视口）*/
```

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 百分比计算

### 题目

以下代码中，`.box` 的实际宽度是多少？

```html
<div class="parent">
  <div class="box"></div>
</div>
```

```css
.parent {
  width: 500px;
  padding: 50px;
  border: 10px solid;
}

.box {
  width: 50%;
}
```

**选项：**
- A. 250px
- B. 300px
- C. 310px
- D. 500px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**包含块是内容区**

```
父元素结构：
├─ border: 10px
├─ padding: 50px
├─ content: 500px  ← 包含块
├─ padding: 50px
└─ border: 10px
```

**计算：**
```css
.box {
  width: 50%;
  /* 50% × 500px = 250px ✅ */
}
```

**关键点：**
- static/relative 元素的包含块 = 父元素的内容区
- 不包括 padding 和 border

**如果是 absolute：**
```css
.parent { position: relative; }
.box {
  position: absolute;
  width: 50%;
  /* 包含块 = padding box */
  /* 50% × (500 + 50×2) = 300px */
}
```

</details>

---

## 第 5 题 🟡

**类型：** 多选题  
**标签：** 特殊包含块

### 题目

以下哪些属性会改变绝对定位元素的包含块？

**选项：**
- A. `transform`
- B. `filter`
- C. `perspective`
- D. `will-change: transform`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**改变包含块的属性（全部正确）**

**✅ A. transform**
```css
.parent {
  transform: translateX(0);  /* 创建包含块 */
}

.child {
  position: absolute;
  /* 包含块是 .parent，而非继续向上查找 */
}
```

**✅ B. filter**
```css
.parent {
  filter: blur(5px);  /* 创建包含块 */
}
```

**✅ C. perspective**
```css
.parent {
  perspective: 1000px;  /* 创建包含块 */
}
```

**✅ D. will-change: transform**
```css
.parent {
  will-change: transform;  /* 创建包含块 */
}
```

**完整列表：**
```css
/* 以下属性会使元素成为 absolute 子元素的包含块 */
transform: any;
filter: any;
perspective: any;
will-change: transform/filter/perspective;
contain: paint/layout/strict;
backdrop-filter: any;
```

**实用场景：**
```css
/* 固定定位相对于容器 */
.container {
  transform: translateZ(0);  /* 创建包含块 */
}

.fixed-child {
  position: fixed;
  /* 相对于 .container，而非视口 */
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** fixed 定位

### 题目

`position: fixed` 的包含块通常是什么？

**选项：**
- A. 父元素
- B. 视口（viewport）
- C. 根元素
- D. body 元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**fixed 的包含块**

**默认情况：视口**
```css
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;  /* 视口宽度 */
}
```

**特殊情况：transform 祖先**
```css
.parent {
  transform: translateX(0);  /* 改变包含块 */
}

.child {
  position: fixed;
  /* 包含块变为 .parent，而非视口 */
}
```

**对比：**

**无 transform：**
```html
<div style="width: 500px;">
  <div style="position: fixed; width: 100%;">
    <!-- 宽度 = 视口宽度（如 1920px）-->
  </div>
</div>
```

**有 transform：**
```html
<div style="width: 500px; transform: translateX(0);">
  <div style="position: fixed; width: 100%;">
    <!-- 宽度 = 500px -->
  </div>
</div>
```

</details>

---

## 第 7 题 🟡

**类型：** 单选题  
**标签：** 初始包含块

### 题目

初始包含块（ICB）的尺寸等于什么？

**选项：**
- A. html 元素的尺寸
- B. body 元素的尺寸
- C. 视口的尺寸
- D. 浏览器窗口的尺寸

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**初始包含块（Initial Containing Block）**

**定义：**
- 尺寸等于视口
- 固定在画布原点
- 是所有绝对定位元素的最终包含块（如果没有 positioned 祖先）

**与视口的关系：**
```
初始包含块 = 视口尺寸

连续媒体（屏幕）：等于视口
分页媒体（打印）：等于页面区域
```

**示例：**
```css
html {
  /* 没有定位 */
}

body {
  /* 没有定位 */
}

.absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;  /* 视口宽度 */
  height: 100%; /* 视口高度 */
  /* 包含块是初始包含块（ICB）*/
}
```

**对比：**
```css
/* html 元素本身的包含块是 ICB */
html {
  width: 100%;  /* ICB 宽度（视口）*/
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂包含块

### 题目

以下代码中，`.target` 的包含块是哪个元素？

```html
<div class="a">
  <div class="b">
    <div class="c">
      <div class="target"></div>
    </div>
  </div>
</div>
```

```css
.a { position: static; }
.b { transform: translateX(0); }
.c { position: relative; }
.target { position: absolute; }
```

**选项：**
- A. .a
- B. .b
- C. .c
- D. 初始包含块

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**包含块查找顺序**

**规则：absolute 的包含块查找**
1. 向上查找最近的 positioned 或 transform 祖先
2. transform 优先级更高

**本题分析：**

```html
.a (static)     ❌ 不是 positioned
.b (transform)  ✅ 有 transform，成为包含块
.c (relative)   ⏭️ 被跳过（.b 已满足）
```

**结果：包含块是 .b**

**详细说明：**

**查找过程：**
```
1. .target (absolute) 向上查找
2. .c (relative) → positioned ✅ 但继续检查
3. .b (transform) → 满足条件 ✅ 停止
```

**transform 的特殊性：**
- 即使没有 position，也能创建包含块
- 优先级：transform > positioned

**如果没有 .b 的 transform：**
```css
.b { /* 无 transform */ }

/* 包含块变为 .c (relative) */
```

**如果 .c 也没有定位：**
```css
.c { /* 无 position */ }

/* 包含块是初始包含块 */
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** padding box

### 题目

以下代码中，`.child` 的宽度是多少？

```css
.parent {
  position: relative;
  width: 500px;
  padding: 50px;
  border: 10px solid;
}

.child {
  position: absolute;
  width: 50%;
}
```

**选项：**
- A. 250px
- B. 275px
- C. 300px
- D. 305px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**absolute 的包含块是 padding box**

**父元素结构：**
```
├─ border: 10px     ❌ 不计入
├─ padding: 50px    ✅ 计入
├─ content: 500px   ✅ 计入
├─ padding: 50px    ✅ 计入
└─ border: 10px     ❌ 不计入

包含块宽度 = 500 + 50×2 = 600px
```

**计算：**
```css
.child {
  width: 50%;
  /* 50% × 600px = 300px ✅ */
}
```

**对比不同定位：**

**static/relative（内容区）：**
```css
.parent { width: 500px; padding: 50px; }
.child { width: 50%; }
/* 50% × 500 = 250px */
```

**absolute（padding box）：**
```css
.parent { position: relative; width: 500px; padding: 50px; }
.child { position: absolute; width: 50%; }
/* 50% × 600 = 300px */
```

**完整对比表：**

| 定位类型 | 包含块 | 示例计算 |
|---------|-------|---------|
| static/relative | 内容区 | 50% × 500 = 250px |
| absolute | padding box | 50% × 600 = 300px |
| fixed | 视口 | 50% × 视口宽度 |

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 综合应用

### 题目

关于包含块，以下说法正确的是？

**选项：**
- A. margin 的百分比相对于包含块的宽度
- B. transform 会为 absolute 子元素创建包含块
- C. fixed 定位的元素包含块总是视口
- D. height: 100% 依赖包含块有明确的高度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**包含块综合知识**

**✅ A. margin 百分比相对宽度**
```css
.box {
  margin-top: 10%;     /* 相对包含块宽度 */
  margin-left: 10%;    /* 相对包含块宽度 */
  /* 即使是垂直方向，也相对宽度 */
}
```

**✅ B. transform 创建包含块**
```css
.parent {
  transform: translateX(0);
}

.child {
  position: absolute;
  /* 包含块是 .parent */
}
```

**❌ C. fixed 不总是视口（错误）**
```css
/* 通常是视口 */
.fixed { position: fixed; }

/* 但 transform 会改变 */
.parent { transform: translateX(0); }
.fixed {
  position: fixed;
  /* 包含块是 .parent，非视口 */
}
```

**✅ D. height 百分比依赖**
```css
.parent {
  height: auto;  /* 或未设置 */
}

.child {
  height: 50%;   /* 无效 → auto */
}

/* 需要明确高度 */
.parent { height: 500px; }
.child { height: 50%; }  /* 250px ✅ */
```

**补充说明：**

**百分比规则：**
```css
/* 相对包含块宽度 */
width, margin, padding

/* 相对包含块高度 */
height

/* 特殊：top/right/bottom/left */
top, bottom  → 包含块高度
left, right  → 包含块宽度
```

**创建包含块的属性：**
```css
position: relative/absolute/fixed/sticky
transform: any
filter: any
perspective: any
will-change: transform/filter/perspective
contain: layout/paint/strict
```

</details>

---

**导航**  
[上一章：第 10 章 - 单位与值转换](./chapter-10.md) | [返回目录](../README.md) | [下一章：第 12 章 - 正常流](./chapter-12.md)
