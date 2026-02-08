# 第 40 章：自定义属性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** CSS变量语法

### 题目

CSS自定义属性的定义语法？

**选项：**
- A. `$variable: value;`
- B. `--variable: value;`
- C. `@variable: value;`
- D. `var(variable): value;`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
:root {
  --primary-color: #007bff;
  --spacing: 16px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 作用域

### 题目

CSS变量的作用域规则？

**选项：**
- A. 全局作用域
- B. 继承规则，子元素可访问父元素的变量
- C. 块级作用域
- D. 函数作用域

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
:root {
  --color: red;
}

.parent {
  --color: blue;
}

.child {
  color: var(--color);  /* 继承父元素的 blue */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** fallback值

### 题目

`var()` 函数支持fallback值。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

```css
.box {
  color: var(--text-color, black);
  /* 如果 --text-color 未定义，使用 black */
}

/* 多层fallback */
.box {
  color: var(--primary, var(--secondary, var(--fallback, black)));
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 变量特性

### 题目

CSS自定义属性的特性？

**选项：**
- A. 区分大小写
- B. 可以在媒体查询中改变
- C. 可以通过JavaScript修改
- D. 支持继承

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. 区分大小写**
```css
--color: red;
--Color: blue;  /* 不同的变量 */
```

**✅ B. 媒体查询**
```css
:root {
  --padding: 20px;
}

@media (max-width: 768px) {
  :root {
    --padding: 10px;
  }
}
```

**✅ C. JavaScript修改**
```javascript
document.documentElement.style.setProperty('--color', 'blue');
const color = getComputedStyle(document.documentElement).getPropertyValue('--color');
```

**✅ D. 继承**
```css
.parent {
  --size: 20px;
}

.child {
  font-size: var(--size);  /* 继承父元素的值 */
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** JavaScript交互

### 题目

如何用JavaScript读取CSS变量？

**选项：**
- A. `element.style.--variable`
- B. `getComputedStyle(element).getPropertyValue('--variable')`
- C. `element.cssVariables.variable`
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```javascript
// 读取
const root = document.documentElement;
const color = getComputedStyle(root).getPropertyValue('--primary-color');

// 设置
root.style.setProperty('--primary-color', '#ff0000');

// 删除
root.style.removeProperty('--primary-color');
```

**实用示例：**
```javascript
// 动态主题切换
function setTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.style.setProperty('--bg-color', '#1a1a1a');
    root.style.setProperty('--text-color', '#ffffff');
  } else {
    root.style.setProperty('--bg-color', '#ffffff');
    root.style.setProperty('--text-color', '#000000');
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 变量计算

### 题目

CSS变量可以用于calc()吗？

**选项：**
- A. 不可以
- B. 可以
- C. 只能用于数字
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
:root {
  --base-size: 16px;
  --multiplier: 2;
}

.box {
  font-size: calc(var(--base-size) * var(--multiplier));
  /* 16px * 2 = 32px */
  
  width: calc(100% - var(--base-size) * 2);
  /* 动态计算 */
}
```

**复杂计算：**
```css
:root {
  --gap: 20px;
  --cols: 3;
}

.grid {
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: var(--gap);
  width: calc(100% - var(--gap) * 2);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 变量命名

### 题目

CSS变量的命名最佳实践？

**选项：**
- A. 使用驼峰命名
- B. 使用kebab-case
- C. 使用下划线
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* ✅ 推荐：kebab-case */
:root {
  --primary-color: #007bff;
  --text-size-large: 24px;
  --spacing-unit: 8px;
}

/* ❌ 不推荐 */
:root {
  --primaryColor: #007bff;    /* 驼峰 */
  --primary_color: #007bff;   /* 下划线 */
}
```

**语义化命名：**
```css
:root {
  /* 颜色 */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  
  /* 尺寸 */
  --size-sm: 0.875rem;
  --size-md: 1rem;
  --size-lg: 1.25rem;
  
  /* 间距 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 主题切换

### 题目

实现完整的主题切换系统？

**选项：**
- A. 只用CSS
- B. CSS变量 + JavaScript
- C. 只用JavaScript
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* 默认主题 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
}

/* 暗色主题 */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #404040;
}

/* 应用变量 */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

```javascript
// JavaScript切换
const themeToggle = document.getElementById('theme-toggle');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

themeToggle.addEventListener('click', () => {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
});

// 初始化
setTheme(getTheme());
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能考虑

### 题目

大量使用CSS变量对性能的影响？

**选项：**
- A. 显著影响性能
- B. 轻微影响，现代浏览器优化良好
- C. 无影响
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**性能特点：**

**✅ 现代浏览器优化良好**
```css
:root {
  /* 定义100个变量也不会有明显性能问题 */
  --color-1: #000;
  --color-2: #111;
  /* ... */
}
```

**⚠️ 注意事项：**
```css
/* ❌ 避免过度嵌套计算 */
.box {
  width: calc(
    var(--a) * 
    calc(var(--b) + 
      calc(var(--c) - var(--d))
    )
  );
}

/* ✅ 简化计算 */
:root {
  --final-width: calc(var(--base) * var(--multiplier));
}

.box {
  width: var(--final-width);
}
```

**最佳实践：**
```css
/* 1. 合理组织变量 */
:root {
  /* 基础变量 */
  --primary: #007bff;
  --spacing: 8px;
  
  /* 派生变量 */
  --primary-dark: color-mix(in srgb, var(--primary), black 20%);
  --spacing-2x: calc(var(--spacing) * 2);
}

/* 2. 避免频繁修改 */
/* ❌ 每次滚动都修改 */
window.addEventListener('scroll', () => {
  root.style.setProperty('--scroll', window.scrollY);
});

/* ✅ 节流优化 */
window.addEventListener('scroll', throttle(() => {
  root.style.setProperty('--scroll', window.scrollY);
}, 100));
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 实用场景

### 题目

CSS变量的实用场景？

**选项：**
- A. 主题切换
- B. 响应式设计
- C. 动态样式
- D. 组件化

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. 主题切换**
```css
[data-theme="light"] {
  --bg: white;
  --text: black;
}

[data-theme="dark"] {
  --bg: black;
  --text: white;
}
```

**✅ B. 响应式设计**
```css
:root {
  --container-width: 1200px;
  --padding: 20px;
}

@media (max-width: 768px) {
  :root {
    --container-width: 100%;
    --padding: 10px;
  }
}
```

**✅ C. 动态样式**
```javascript
// 根据滚动位置改变样式
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  document.documentElement.style.setProperty('--scroll', scroll);
});
```

```css
.header {
  opacity: calc(1 - var(--scroll) / 500);
}
```

**✅ D. 组件化**
```css
.button {
  --button-bg: var(--primary);
  --button-color: white;
  --button-padding: 0.5rem 1rem;
  
  background: var(--button-bg);
  color: var(--button-color);
  padding: var(--button-padding);
}

.button--large {
  --button-padding: 1rem 2rem;
}

.button--secondary {
  --button-bg: var(--secondary);
}
```

</details>

---

**导航**  
[上一章：第 39 章 - 混合模式](./chapter-39.md) | [返回目录](../README.md) | [下一章：第 41 章 - 动态主题实现](./chapter-41.md)
