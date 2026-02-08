# 第 44 章：CSS 方法论 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** BEM

### 题目

BEM 代表什么？

**选项：**
- A. Block Element Module
- B. Block Element Modifier
- C. Base Element Modifier
- D. Box Element Model

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**BEM = Block Element Modifier**

```html
<!-- Block -->
<div class="card">
  <!-- Element -->
  <h2 class="card__title">Title</h2>
  <p class="card__text">Text</p>
  <!-- Modifier -->
  <button class="card__button card__button--primary">Click</button>
</div>
```

**命名规则：**
```
Block:    .block
Element:  .block__element
Modifier: .block--modifier
          .block__element--modifier
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** OOCSS

### 题目

OOCSS 的核心原则是？

**选项：**
- A. 继承和组合
- B. 结构与皮肤分离，容器与内容分离
- C. 单一职责
- D. 模块化

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**OOCSS - Object-Oriented CSS**

**原则1：结构与皮肤分离**
```css
/* 结构 */
.box {
  padding: 20px;
  border: 1px solid;
}

/* 皮肤 */
.box-primary {
  background: blue;
  border-color: darkblue;
}

.box-secondary {
  background: gray;
  border-color: darkgray;
}
```

**原则2：容器与内容分离**
```css
/* ❌ 依赖容器 */
.sidebar h3 {
  font-size: 1.2rem;
}

/* ✅ 独立样式 */
.heading-small {
  font-size: 1.2rem;
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Atomic CSS

### 题目

Atomic CSS 主张每个类只做一件事。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Atomic CSS（原子化CSS）**

```css
/* 每个类只负责一个样式 */
.mt-1 { margin-top: 0.25rem; }
.p-2 { padding: 0.5rem; }
.text-center { text-align: center; }
.bg-blue { background: blue; }
```

**使用：**
```html
<div class="mt-1 p-2 text-center bg-blue">
  Content
</div>
```

**代表框架：Tailwind CSS, Tachyons**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** CSS方法论对比

### 题目

常见的CSS方法论有？

**选项：**
- A. BEM
- B. OOCSS
- C. SMACSS
- D. Atomic CSS

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. BEM（Block Element Modifier）**
```css
.card { }
.card__title { }
.card__title--large { }
```

**✅ B. OOCSS（Object-Oriented CSS）**
```css
.media { }
.media-body { }
.skin-primary { }
```

**✅ C. SMACSS（Scalable and Modular Architecture）**
```css
/* Base */
html, body { }

/* Layout */
.l-header { }

/* Module */
.card { }

/* State */
.is-active { }

/* Theme */
.theme-dark { }
```

**✅ D. Atomic CSS**
```css
.m-0 { margin: 0; }
.p-4 { padding: 1rem; }
.text-center { text-align: center; }
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** BEM实践

### 题目

BEM 命名中，以下哪个是正确的？

**选项：**
- A. `.block-element-modifier`
- B. `.block__element--modifier`
- C. `.block_element_modifier`
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**BEM 命名规范**

```css
/* ✅ 正确 */
.nav { }                      /* Block */
.nav__item { }                /* Element */
.nav__item--active { }        /* Modifier */
.nav--vertical { }            /* Block Modifier */

/* ❌ 错误 */
.nav-item-active { }          /* 不清晰 */
.nav_item_active { }          /* 错误分隔符 */
.nav__item__link { }          /* 过深嵌套 */
```

**完整示例：**
```html
<nav class="nav nav--vertical">
  <a class="nav__item nav__item--active">Home</a>
  <a class="nav__item">About</a>
</nav>
```

```css
.nav {
  display: flex;
}

.nav--vertical {
  flex-direction: column;
}

.nav__item {
  padding: 10px;
  color: black;
}

.nav__item--active {
  color: blue;
  font-weight: bold;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** SMACSS分类

### 题目

SMACSS 的五大分类是？

**选项：**
- A. Base, Layout, Module, State, Theme
- B. Block, Layout, Module, Style, Theme
- C. Base, List, Module, State, Type
- D. A 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**SMACSS 五大分类**

**1. Base（基础）**
```css
html {
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

body {
  margin: 0;
  font-family: sans-serif;
}
```

**2. Layout（布局）**
```css
.l-header { }
.l-sidebar { }
.l-main { }
.l-footer { }
```

**3. Module（模块）**
```css
.card { }
.card-header { }
.card-body { }
.button { }
.nav { }
```

**4. State（状态）**
```css
.is-hidden { }
.is-active { }
.is-disabled { }
.is-loading { }
```

**5. Theme（主题）**
```css
.theme-dark { }
.theme-light { }
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 方法论选择

### 题目

小项目应该选择哪种方法论？

**选项：**
- A. BEM
- B. Atomic CSS
- C. 简单的命名约定
- D. C 更实用

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**项目规模与方法论**

**小项目（< 5页）：**
```css
/* ✅ 简单命名即可 */
.header { }
.nav { }
.nav-item { }
.active { }
```

**中型项目：**
```css
/* ✅ BEM */
.nav { }
.nav__item { }
.nav__item--active { }
```

**大型项目：**
```css
/* ✅ BEM + SMACSS */
/* Layout */
.l-header { }

/* Module (BEM) */
.nav { }
.nav__item { }
.nav__item--active { }

/* State */
.is-active { }
```

**企业级：**
```
✅ CSS Modules + BEM
✅ CSS-in-JS
✅ Tailwind CSS
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 方法论对比

### 题目

BEM vs Atomic CSS 的优缺点？

**选项：**
- A. BEM 更语义化，Atomic 更灵活
- B. BEM HTML 更干净，Atomic CSS 更小
- C. 各有优劣
- D. C 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**BEM**

**优点：**
- 语义化，易理解
- HTML 干净
- 组件独立

**缺点：**
- 类名冗长
- CSS 体积大
- 需要维护CSS

**BEM 示例：**
```html
<div class="card card--featured">
  <h2 class="card__title">Title</h2>
  <p class="card__text">Text</p>
</div>
```

```css
.card {
  padding: 20px;
  border: 1px solid #ddd;
}

.card--featured {
  border-color: blue;
}

.card__title {
  font-size: 1.5rem;
}

.card__text {
  color: gray;
}
```

---

**Atomic CSS**

**优点：**
- CSS 体积小（复用）
- 快速开发
- 不需要命名

**缺点：**
- HTML 冗长
- 语义性差
- 学习成本

**Atomic 示例：**
```html
<div class="p-5 border border-gray-300 rounded">
  <h2 class="text-2xl font-bold mb-2">Title</h2>
  <p class="text-gray-600">Text</p>
</div>
```

**对比表：**

| 维度 | BEM | Atomic CSS |
|------|-----|-----------|
| HTML | 简洁 | 冗长 |
| CSS | 冗长 | 简洁 |
| 语义 | 强 | 弱 |
| 灵活 | 中 | 强 |
| 学习 | 易 | 需要记忆 |

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 最佳实践

### 题目

实际项目中如何选择和混用方法论？

**选项：**
- A. 只用一种
- B. 根据场景混用
- C. 不用方法论
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**混合使用策略**

**方案1：BEM + Utility Classes**
```html
<div class="card card--featured mt-4">
  <h2 class="card__title">Title</h2>
  <p class="card__text text-center">Text</p>
</div>
```

```css
/* BEM 组件 */
.card { }
.card--featured { }
.card__title { }

/* Utility 工具类 */
.mt-4 { margin-top: 1rem; }
.text-center { text-align: center; }
```

**方案2：SMACSS + BEM**
```css
/* Layout (SMACSS) */
.l-container { }
.l-sidebar { }

/* Module (BEM) */
.nav { }
.nav__item { }
.nav__item--active { }

/* State (SMACSS) */
.is-active { }
.is-hidden { }
```

**方案3：CSS Modules + BEM**
```css
/* Card.module.css */
.card { }
.title { }         /* 编译后 Card_title_xxx */
.text { }

/* 在组件内仍遵循BEM思想 */
```

**推荐策略：**
```
✅ 组件层：BEM 或 CSS Modules
✅ 工具层：Atomic/Utility classes
✅ 布局层：SMACSS layout
✅ 状态层：SMACSS state
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 现代CSS架构

### 题目

现代CSS架构的趋势？

**选项：**
- A. CSS Modules
- B. CSS-in-JS
- C. Utility-First (Tailwind)
- D. 组件化思维

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**现代CSS方案（全部正确）**

**✅ A. CSS Modules**
```jsx
import styles from './Button.module.css';

<button className={styles.button}>
  Click
</button>
```

**✅ B. CSS-in-JS**
```jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background: blue;
`;
```

**✅ C. Utility-First (Tailwind)**
```html
<button class="px-4 py-2 bg-blue-500 text-white rounded">
  Click
</button>
```

**✅ D. 组件化思维**
```
每个组件包含：
- Component.jsx
- Component.module.css (或 styled-components)
- Component.test.js
```

**对比表：**

| 方案 | 优点 | 缺点 | 适用 |
|------|------|------|------|
| BEM | 语义化 | CSS冗余 | 传统项目 |
| CSS Modules | 作用域隔离 | 需要构建 | React/Vue |
| CSS-in-JS | 动态样式 | 性能开销 | React |
| Tailwind | 快速开发 | HTML冗长 | 快速原型 |

**选择建议：**
```
React项目：CSS Modules 或 styled-components
Vue项目：Scoped CSS 或 CSS Modules
快速原型：Tailwind CSS
传统项目：BEM + SMACSS
大型团队：CSS Modules + Utility Classes
```

</details>

---

**导航**  
[上一章：第 43 章 - 图形函数](./chapter-43.md) | [返回目录](../README.md) | [下一章：第 45 章 - Sass/Less原理](./chapter-45.md)
