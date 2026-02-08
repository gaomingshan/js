# 第 42 章：计算函数 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** calc()

### 题目

`calc()` 函数的作用是？

**选项：**
- A. 计算颜色
- B. 动态计算CSS值
- C. 动画计算
- D. 性能计算

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
.box {
  width: calc(100% - 50px);
  padding: calc(1rem + 10px);
  font-size: calc(16px + 0.5vw);
}
```

**支持的运算符：**
```css
+ - * /
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** min()/max()

### 题目

`min(50%, 500px)` 的含义是？

**选项：**
- A. 取最大值
- B. 取最小值
- C. 取平均值
- D. 语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
.box {
  width: min(50%, 500px);
  /* 取两者中较小的值 */
}

.box {
  width: max(300px, 50%);
  /* 取两者中较大的值 */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** clamp()

### 题目

`clamp(最小值, 首选值, 最大值)` 可以限制值的范围。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

```css
.text {
  font-size: clamp(1rem, 2.5vw, 2rem);
  /* 最小1rem，最大2rem，中间流式 */
}
```

**等同于：**
```css
font-size: max(1rem, min(2.5vw, 2rem));
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** calc() 用法

### 题目

calc() 可以用于哪些场景？

**选项：**
- A. 长度计算
- B. 时间计算
- C. 角度计算
- D. 颜色计算

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**✅ A. 长度**
```css
width: calc(100% - 50px);
margin: calc(1rem + 10px);
```

**✅ B. 时间**
```css
transition-duration: calc(0.3s + 100ms);
animation-delay: calc(1s * 2);
```

**✅ C. 角度**
```css
transform: rotate(calc(45deg + 90deg));
```

**❌ D. 颜色（不支持）**
```css
/* 不支持 */
color: calc(#ff0000 + #00ff00);
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 混合单位

### 题目

calc() 中可以混合不同单位吗？

**选项：**
- A. 不可以
- B. 可以，但仅限加减
- C. 完全可以
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* ✅ 加减：可以混合 */
width: calc(100% - 50px);
padding: calc(1rem + 10px);

/* ✅ 乘除：一个必须是数字 */
width: calc(100% / 2);
padding: calc(1rem * 1.5);

/* ❌ 乘除：不能两个都是单位 */
width: calc(100% * 50px);  /* 错误 */
```

**空格要求：**
```css
/* ✅ 加减必须有空格 */
calc(100% - 50px)

/* ❌ 没有空格会出错 */
calc(100%-50px)

/* ✅ 乘除空格可选但推荐 */
calc(100% / 2)
calc(100%/2)  /* 也可以，但不推荐 */
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** CSS变量

### 题目

calc() 可以配合CSS变量使用吗？

**选项：**
- A. 不可以
- B. 可以
- C. 只能用于简单计算
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
:root {
  --base-size: 16px;
  --spacing: 1rem;
  --multiplier: 2;
}

.box {
  width: calc(var(--base-size) * var(--multiplier));
  padding: calc(var(--spacing) + 10px);
  margin: calc(100% - var(--base-size) * 4);
}
```

**动态计算：**
```javascript
document.documentElement.style.setProperty('--multiplier', 3);
// width 自动更新为 48px
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** clamp() 响应式

### 题目

使用 clamp() 实现流式响应式字体？

**选项：**
- A. `clamp(1rem, 5vw, 3rem)`
- B. `clamp(1rem, 2.5vw + 0.5rem, 3rem)`
- C. 两者都可以
- D. C 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**方式1：纯vw**
```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

**方式2：vw + rem（更好）**
```css
h1 {
  font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
  /* 更平滑的缩放曲线 */
}
```

**完整响应式排版：**
```css
:root {
  --fluid-min-width: 320;
  --fluid-max-width: 1200;
  
  --fluid-screen: 100vw;
  --fluid-bp: calc(
    (var(--fluid-screen) - var(--fluid-min-width) / 16 * 1rem) /
    (var(--fluid-max-width) - var(--fluid-min-width))
  );
}

h1 {
  font-size: clamp(
    1.5rem,
    calc(1rem + 2 * var(--fluid-bp)),
    3rem
  );
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 嵌套计算

### 题目

calc() 支持嵌套吗？

**选项：**
- A. 不支持
- B. 支持，但不推荐过度嵌套
- C. 只支持一层
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* ✅ 支持嵌套 */
.box {
  width: calc(
    100% - 
    calc(var(--padding) * 2)
  );
}

/* ❌ 过度嵌套（可读性差）*/
.complex {
  width: calc(
    calc(
      calc(100% - 50px) / 2
    ) + calc(1rem * 2)
  );
}

/* ✅ 简化嵌套 */
.simple {
  --half-minus-padding: calc((100% - 50px) / 2);
  width: calc(var(--half-minus-padding) + 2rem);
}
```

**最佳实践：**
```css
/* 使用CSS变量拆分复杂计算 */
:root {
  --container-width: 1200px;
  --padding: 2rem;
  --gap: 1rem;
  
  /* 预计算 */
  --content-width: calc(var(--container-width) - var(--padding) * 2);
  --item-width: calc((var(--content-width) - var(--gap) * 3) / 4);
}

.item {
  width: var(--item-width);  /* 清晰易读 */
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能考虑

### 题目

calc() 对性能的影响？

**选项：**
- A. 显著影响
- B. 轻微影响，浏览器优化良好
- C. 无影响
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**性能特点：**

**✅ 现代浏览器优化良好**
```css
/* 一次性计算，无性能问题 */
.box {
  width: calc(100% - 50px);
}
```

**⚠️ 避免过度复杂**
```css
/* ❌ 过于复杂 */
.complex {
  width: calc(
    (100% - var(--a) * var(--b)) / 
    (var(--c) + var(--d) - var(--e))
  );
}

/* ✅ 简化 */
:root {
  --numerator: calc(100% - var(--a) * var(--b));
  --denominator: calc(var(--c) + var(--d) - var(--e));
}

.simple {
  width: calc(var(--numerator) / var(--denominator));
}
```

**与JavaScript对比：**
```javascript
// JavaScript计算（每次重排都执行）
element.style.width = `${window.innerWidth - 50}px`;

// CSS calc（浏览器优化）
element.style.width = 'calc(100vw - 50px)';
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 实用场景

### 题目

计算函数的实用场景？

**选项：**
- A. 响应式布局
- B. 流式排版
- C. 居中对齐
- D. 间距系统

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. 响应式布局**
```css
.container {
  width: min(90%, 1200px);
  padding: clamp(1rem, 5%, 3rem);
}

.sidebar {
  width: calc(25% - 1rem);
}
```

**✅ B. 流式排版**
```css
h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}

p {
  line-height: calc(1em + 0.5rem);
}
```

**✅ C. 居中对齐**
```css
.centered {
  margin-left: calc(50% - 50vw);
  /* 突破容器限制的全宽元素 */
}
```

**✅ D. 间距系统**
```css
:root {
  --spacing-unit: 8px;
}

.box {
  padding: calc(var(--spacing-unit) * 2);  /* 16px */
  margin: calc(var(--spacing-unit) * 3);   /* 24px */
  gap: calc(var(--spacing-unit) * 1.5);    /* 12px */
}
```

**综合示例：**
```css
/* 完整响应式系统 */
:root {
  --min-width: 320px;
  --max-width: 1200px;
  --container-padding: clamp(1rem, 5vw, 3rem);
}

.container {
  width: min(100% - var(--container-padding) * 2, var(--max-width));
  margin-inline: auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(250px, 100%), 1fr)
  );
  gap: clamp(1rem, 3vw, 2rem);
}

h1 {
  font-size: clamp(1.5rem, 5vw + 1rem, 3rem);
  line-height: calc(1em + 0.5rem);
}
```

</details>

---

**导航**  
[上一章：第 41 章 - 动态主题实现](./chapter-41.md) | [返回目录](../README.md) | [下一章：第 43 章 - 图形函数](./chapter-43.md)
