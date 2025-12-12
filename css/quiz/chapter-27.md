# 第 27 章：响应式布局单位 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** vw/vh 单位

### 题目

`1vw` 等于？

**选项：**
- A. 视口宽度的 1%
- B. 视口高度的 1%
- C. 根元素字体大小的 1%
- D. 父元素宽度的 1%

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**视口单位**

```css
/* 视口宽度 */
1vw = 视口宽度的 1%
100vw = 视口宽度

/* 视口高度 */
1vh = 视口高度的 1%
100vh = 视口高度

/* 最小值 */
1vmin = min(1vw, 1vh)

/* 最大值 */
1vmax = max(1vw, 1vh)
```

**示例：**
```css
.full-screen {
  width: 100vw;
  height: 100vh;
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** rem vs em

### 题目

`rem` 相对于什么计算？

**选项：**
- A. 父元素字体大小
- B. 根元素字体大小
- C. 浏览器默认字体大小
- D. 视口宽度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**rem - root em**

```css
html {
  font-size: 16px;  /* 根元素 */
}

.box {
  width: 10rem;  /* 10 × 16px = 160px */
  padding: 1rem;  /* 16px */
}
```

**em vs rem：**

**em（相对父元素）：**
```css
.parent {
  font-size: 20px;
}

.child {
  font-size: 1.5em;  /* 1.5 × 20px = 30px */
  padding: 1em;      /* 1 × 30px = 30px */
}
```

**rem（相对根元素）：**
```css
html { font-size: 16px; }

.child {
  font-size: 1.5rem;  /* 1.5 × 16px = 24px */
  padding: 1rem;      /* 1 × 16px = 16px */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 百分比单位

### 题目

百分比 `width` 相对于父元素的 `width` 计算。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**百分比计算规则**

**width/height：**
```css
.parent {
  width: 500px;
}

.child {
  width: 50%;  /* 50% × 500px = 250px */
}
```

**padding/margin：**
```css
.parent {
  width: 500px;
}

.child {
  padding-top: 10%;    /* 50px（相对父元素宽度）*/
  margin-left: 20%;    /* 100px（相对父元素宽度）*/
}
```

**注意：垂直方向也相对宽度**
```css
/* ⚠️ 特殊：垂直 padding/margin 也相对宽度 */
.box {
  padding-top: 10%;  /* 相对父元素宽度 */
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 容器查询单位

### 题目

CSS 容器查询单位有哪些？

**选项：**
- A. `cqw` - 容器宽度
- B. `cqh` - 容器高度
- C. `cqi` - 容器内联尺寸
- D. `cqb` - 容器块尺寸

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**容器查询单位（全部正确）**

**✅ 物理单位：**
```css
cqw  /* 容器宽度的 1% */
cqh  /* 容器高度的 1% */
cqmin  /* min(cqw, cqh) */
cqmax  /* max(cqw, cqh) */
```

**✅ 逻辑单位：**
```css
cqi  /* 容器内联尺寸的 1% */
cqb  /* 容器块尺寸的 1% */
```

**使用示例：**
```css
.container {
  container-type: inline-size;
}

.card {
  font-size: 5cqw;  /* 响应容器宽度 */
  padding: 2cqh;
}

@container (min-width: 400px) {
  .card {
    font-size: 3cqw;
  }
}
```

**对比视口单位：**

| 单位 | 参考对象 |
|------|---------|
| vw/vh | 视口 |
| cqw/cqh | 容器 |
| % | 父元素 |
| rem | 根元素字体 |

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** vmin/vmax

### 题目

`vmin` 和 `vmax` 的区别是？

**选项：**
- A. vmin 是最小视口，vmax 是最大视口
- B. vmin = min(vw, vh)，vmax = max(vw, vh)
- C. vmin 用于小屏，vmax 用于大屏
- D. 没有区别

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**vmin 和 vmax**

**vmin - 较小的视口尺寸：**
```css
/* 视口：1000px × 600px */
1vmin = min(1vw, 1vh) = min(10px, 6px) = 6px
```

**vmax - 较大的视口尺寸：**
```css
/* 视口：1000px × 600px */
1vmax = max(1vw, 1vh) = max(10px, 6px) = 10px
```

**实用场景：**

**正方形（响应视口）：**
```css
.square {
  width: 50vmin;
  height: 50vmin;
  /* 始终保持正方形 */
}
```

**全屏背景：**
```css
.bg-image {
  width: 100vmax;
  height: 100vmax;
  /* 确保覆盖整个视口 */
}
```

**响应式字体：**
```css
h1 {
  font-size: 5vmin;
  /* 横竖屏都合适 */
}
```

**方向变化时的行为：**
```
竖屏（375px × 667px）:
vmin = 3.75px
vmax = 6.67px

横屏（667px × 375px）:
vmin = 3.75px
vmax = 6.67px
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** ch 单位

### 题目

`ch` 单位代表什么？

**选项：**
- A. 字符高度
- B. "0"字符的宽度
- C. 中文字符宽度
- D. 容器宽度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**ch - "0"字符宽度**

```css
.input {
  width: 20ch;
  /* 可容纳约 20 个"0"字符 */
}
```

**实用场景：**

**固定字符宽度的输入框：**
```css
.phone-input {
  width: 11ch;  /* 手机号：11位 */
}

.zip-code {
  width: 6ch;   /* 邮编：6位 */
}
```

**等宽字体布局：**
```css
.code {
  font-family: monospace;
  width: 80ch;  /* 每行约 80 个字符 */
}
```

**其他字体相关单位：**

```css
/* ex: x 字符高度 */
.small {
  height: 2ex;
}

/* ch: 0 字符宽度 */
.input {
  width: 10ch;
}

/* cap: 大写字母高度 */
.heading {
  line-height: 2cap;
}

/* ic: CJK 字符宽度（"水"）*/
.cjk {
  width: 10ic;
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** clamp()

### 题目

`clamp(1rem, 2.5vw, 2rem)` 的含义是？

**选项：**
- A. 最小1rem，首选2.5vw，最大2rem
- B. 在1rem和2rem之间随机
- C. 固定2.5vw
- D. 语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**clamp() 函数**

```css
clamp(最小值, 首选值, 最大值)
```

**计算规则：**
```css
font-size: clamp(1rem, 2.5vw, 2rem);

/* 等同于 */
font-size: max(1rem, min(2.5vw, 2rem));

/* 行为：
   - 2.5vw < 1rem → 使用 1rem
   - 1rem ≤ 2.5vw ≤ 2rem → 使用 2.5vw
   - 2.5vw > 2rem → 使用 2rem
*/
```

**实用场景：**

**响应式字体：**
```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  /* 小屏：1.5rem，大屏：3rem，中间流式 */
}
```

**响应式间距：**
```css
.container {
  padding: clamp(1rem, 5%, 3rem);
}
```

**响应式宽度：**
```css
.box {
  width: clamp(300px, 50%, 600px);
}
```

**对比其他函数：**

**min()：**
```css
width: min(500px, 100%);
/* 取较小值 */
```

**max()：**
```css
width: max(300px, 50%);
/* 取较大值 */
```

**calc()：**
```css
width: calc(100% - 40px);
/* 计算 */
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 100vh 问题

### 题目

移动端 `100vh` 的问题是什么？

**选项：**
- A. 不支持
- B. 包含地址栏高度，导致内容溢出
- C. 性能问题
- D. 没有问题

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**移动端 100vh 陷阱**

**问题：**
```css
.full-screen {
  height: 100vh;
}
/* 移动端浏览器地址栏会隐藏/显示
   导致 100vh 计算不准确 */
```

**可视化：**
```
显示地址栏时：
┌──────────┐
│ 地址栏   │
├──────────┤
│          │
│ 内容区   │ ← 100vh 包含地址栏
│          │
│ 溢出 ❌  │
└──────────┘

隐藏地址栏时：
┌──────────┐
│          │
│ 内容区   │ ← 100vh 重新计算
│          │
└──────────┘
```

**解决方案：**

**方案1：CSS 自定义属性（推荐）：**
```javascript
// JavaScript
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
```

```css
.full-screen {
  height: calc(var(--vh, 1vh) * 100);
}
```

**方案2：新视口单位（较新）：**
```css
.full-screen {
  /* 小视口（地址栏显示时）*/
  height: 100svh;
  
  /* 大视口（地址栏隐藏时）*/
  height: 100lvh;
  
  /* 动态视口（推荐）*/
  height: 100dvh;
}
```

**新视口单位对比：**

| 单位 | 说明 |
|------|------|
| vh | 传统视口高度 |
| svh | Small Viewport Height（地址栏显示）|
| lvh | Large Viewport Height（地址栏隐藏）|
| dvh | Dynamic Viewport Height（动态）|

**方案3：min-height：**
```css
.full-screen {
  min-height: 100vh;
  min-height: 100dvh;
}
```

**最佳实践：**
```css
.full-screen {
  /* 降级 */
  height: 100vh;
  
  /* 现代浏览器 */
  height: 100dvh;
  
  /* JS 兜底 */
  height: calc(var(--vh, 1vh) * 100);
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 响应式字体

### 题目

实现流式响应式字体的最佳方式是？

**选项：**
- A. 使用多个媒体查询
- B. 使用 clamp() + vw
- C. 使用 JavaScript
- D. 固定字体大小

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**响应式字体方案对比**

**❌ A. 媒体查询（阶梯式）：**
```css
h1 {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  h1 { font-size: 2rem; }
}

@media (min-width: 1024px) {
  h1 { font-size: 2.5rem; }
}
/* 跳跃式变化，不够平滑 */
```

**✅ B. clamp() + vw（流式）：**
```css
h1 {
  font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
}
/* 
  最小：1.5rem（小屏）
  流式：2.5vw + 1rem（中间）
  最大：3rem（大屏）
*/
```

**计算公式：**
```
首选值 = vw × (最大字号 - 最小字号) / (最大视口 - 最小视口) + 基础值

示例：
最小：16px @ 320px
最大：24px @ 1200px

slope = (24 - 16) / (1200 - 320) = 0.00909
intercept = 16 - 0.00909 × 320 = 13.09

font-size: clamp(1rem, 0.91vw + 0.82rem, 1.5rem);
```

**工具推荐：**
- [Fluid Type Scale Calculator](https://www.fluid-type-scale.com/)
- [Utopia](https://utopia.fyi/)

**完整方案：**
```css
/* 基础尺寸 */
:root {
  /* 最小字号 @ 320px */
  --font-size-min: 1rem;
  /* 最大字号 @ 1200px */
  --font-size-max: 1.5rem;
  
  /* 流式字号 */
  --font-size-fluid: clamp(
    var(--font-size-min),
    0.91vw + 0.82rem,
    var(--font-size-max)
  );
}

body {
  font-size: var(--font-size-fluid);
}

h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}

h2 {
  font-size: clamp(1.5rem, 3vw + 1rem, 3rem);
}
```

**可访问性考虑：**
```css
/* 确保最小字号 */
body {
  font-size: clamp(1rem, 2vw, 1.25rem);
  /* 不小于 16px */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 单位选择

### 题目

不同场景下应该使用什么单位？

**选项：**
- A. 字体大小用 rem
- B. 间距用 em 或 rem
- C. 边框用 px
- D. 容器宽度用 %

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**单位使用指南（全部正确）**

**✅ A. 字体大小 - rem**
```css
h1 {
  font-size: 2rem;  /* 相对根元素 */
}

/* 或流式 */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

**✅ B. 间距 - em/rem**
```css
/* rem：统一缩放 */
.container {
  padding: 2rem;
  margin-bottom: 1.5rem;
}

/* em：组件内部比例 */
.button {
  font-size: 1rem;
  padding: 0.5em 1em;  /* 随字体缩放 */
}
```

**✅ C. 边框 - px**
```css
.box {
  border: 1px solid #ddd;
  /* 边框不需要缩放 */
}
```

**✅ D. 容器宽度 - %**
```css
.container {
  width: 90%;
  max-width: 1200px;
}

.column {
  width: 50%;
}
```

**完整单位选择表：**

| 场景 | 推荐单位 | 原因 |
|------|---------|------|
| 字体大小 | rem, em | 可访问性，用户缩放 |
| 间距 | rem, em | 响应式，比例协调 |
| 边框 | px | 固定，不需缩放 |
| 容器宽度 | %, vw | 响应式 |
| 固定元素 | px | 精确控制 |
| 媒体查询 | em | 支持用户缩放 |
| 行高 | 无单位 | 相对字体大小 |
| 阴影 | px | 固定 |

**实际示例：**

```css
/* 组件示例 */
.card {
  /* 容器：百分比 */
  width: 100%;
  max-width: 600px;
  
  /* 间距：rem */
  padding: 2rem;
  margin-bottom: 1.5rem;
  
  /* 边框：px */
  border: 1px solid #ddd;
  border-radius: 8px;
  
  /* 阴影：px */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-title {
  /* 字体：rem */
  font-size: 1.5rem;
  
  /* 行高：无单位 */
  line-height: 1.4;
  
  /* 间距：em（相对自身）*/
  margin-bottom: 0.5em;
}

.card-text {
  /* 流式字体 */
  font-size: clamp(1rem, 2vw, 1.25rem);
}
```

**媒体查询：**
```css
/* em 单位（推荐）*/
@media (min-width: 48em) {  /* 768px / 16 */
  .container {
    width: 750px;
  }
}
```

**特殊场景：**

**1. 视口相关：**
```css
.hero {
  height: 100vh;
  height: 100dvh;
}

.full-width {
  width: 100vw;
}
```

**2. 容器查询：**
```css
.card {
  font-size: 3cqw;  /* 容器宽度的3% */
}
```

**3. 计算：**
```css
.sidebar {
  width: calc(100% - 300px);
}
```

</details>

---

**导航**  
[上一章：第 26 章 - 媒体查询](./chapter-26.md) | [返回目录](../README.md) | [下一章：第 28 章 - Container Queries](./chapter-28.md)
