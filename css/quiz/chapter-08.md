# 第 8 章：继承机制 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 可继承属性

### 题目

以下哪个属性是可继承的？

**选项：**
- A. `margin`
- B. `padding`
- C. `color`
- D. `border`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**可继承 vs 不可继承属性**

**✅ 可继承属性（主要是文本相关）**
```css
/* 文本属性 */
color, font-size, font-family, font-weight, font-style
line-height, text-align, text-indent, letter-spacing

/* 列表属性 */
list-style, list-style-type, list-style-position

/* 其他 */
visibility, cursor
```

**❌ 不可继承属性（主要是盒模型）**
```css
/* 盒模型 */
width, height, margin, padding, border

/* 定位 */
position, top, left, z-index

/* 布局 */
display, float, overflow

/* 背景 */
background, background-color, background-image
```

**示例：**
```html
<div style="color: red; margin: 20px;">
  <p>继承了红色 ✅ 但没有继承 margin ❌</p>
</div>
```

**特殊情况：**
```css
/* 某些属性的某些值可继承 */
border-color: currentColor;  /* 继承 color */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** inherit 关键字

### 题目

`inherit` 关键字的作用是？

**选项：**
- A. 使用浏览器默认值
- B. 强制继承父元素的值
- C. 重置属性值
- D. 删除属性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**inherit 关键字详解**

**作用：强制继承父元素的属性值**

```css
.parent {
  color: red;
  border: 1px solid blue;
}

.child {
  color: inherit;      /* 继承 red */
  border: inherit;     /* 继承 1px solid blue */
}
```

**应用场景：**

**1. 让不可继承属性继承**
```css
.parent { padding: 20px; }
.child { padding: inherit; }  /* 强制继承 */
```

**2. 重置继承**
```css
a {
  color: inherit;  /* 继承父元素颜色，而非默认蓝色 */
}
```

**3. 响应式设计**
```css
.container { font-size: 16px; }

.small-text { font-size: 14px; }

@media (max-width: 768px) {
  .small-text { font-size: inherit; }  /* 继承 16px */
}
```

**对比其他关键字：**
```css
/* initial - 浏览器默认值 */
color: initial;  /* 通常是黑色 */

/* unset - 可继承则继承，否则 initial */
color: unset;    /* 继承父元素 */
margin: unset;   /* = initial（不可继承）*/

/* revert - 回退到用户代理样式 */
color: revert;
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 继承优先级

### 题目

继承的样式优先级低于任何直接指定的样式。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**继承的优先级最低**

```css
.parent {
  color: red;
}

* {
  color: blue;  /* 通配符（0,0,0）> 继承 */
}

.child {
  /* color: blue（通配符优先）*/
}
```

**优先级排序：**
```
!important
内联样式
ID选择器（1,0,0）
类选择器（0,1,0）
元素选择器（0,0,1）
通配符（0,0,0）      ← 仍优于继承
继承                 ← 最低
浏览器默认
```

**示例对比：**

**场景1：继承 vs 通配符**
```css
body { color: red; }
* { color: blue; }
p { }  /* blue ✅ 通配符优先 */
```

**场景2：继承 vs 直接指定**
```css
.parent { color: red; }
.child { color: blue; }  /* blue ✅ 直接指定优先 */
```

**场景3：多层继承**
```css
html { color: red; }
body { color: blue; }
p { }  /* blue ✅ 继承最近的祖先 */
```

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** unset 关键字

### 题目

以下代码中，`<p>` 的 `color` 和 `margin` 是多少？

```css
body {
  color: red;
  margin: 20px;
}

p {
  color: unset;
  margin: unset;
}
```

**选项：**
- A. color: red, margin: 20px
- B. color: red, margin: 0
- C. color: black, margin: 0
- D. color: black, margin: 20px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**unset 关键字规则**

**unset = 可继承则继承，不可继承则 initial**

**本题分析：**

**color（可继承）**
```css
p {
  color: unset;  /* = inherit（继承父元素）*/
  /* 结果：red ✅ */
}
```

**margin（不可继承）**
```css
p {
  margin: unset;  /* = initial（浏览器默认）*/
  /* 结果：0 ✅ （margin 的初始值）*/
}
```

**完整对比：**

```css
/* 可继承属性 */
body { color: red; }
p {
  color: inherit;   /* red */
  color: unset;     /* red（= inherit）*/
  color: initial;   /* black（浏览器默认）*/
  color: revert;    /* black（用户代理样式）*/
}

/* 不可继承属性 */
body { margin: 20px; }
p {
  margin: inherit;  /* 20px */
  margin: unset;    /* 0（= initial）*/
  margin: initial;  /* 0 */
  margin: revert;   /* 浏览器默认的 p margin */
}
```

**实用场景：**
```css
/* 重置所有属性 */
.reset {
  all: unset;  /* 重置所有属性 */
}

/* 选择性重置 */
button {
  all: unset;
  cursor: pointer;  /* 保留必要样式 */
}
```

</details>

---

## 第 5 题 🟡

**类型：** 多选题  
**标签：** 继承控制

### 题目

以下哪些关键字可以控制属性继承？

**选项：**
- A. `inherit`
- B. `initial`
- C. `unset`
- D. `revert`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**继承控制关键字（全部正确）**

**✅ A. inherit - 强制继承**
```css
.child {
  border: inherit;  /* 继承父元素的 border */
}
```

**✅ B. initial - 初始值**
```css
.element {
  color: initial;  /* 浏览器默认值（通常是黑色）*/
}
```

**✅ C. unset - 智能重置**
```css
.element {
  color: unset;    /* 可继承 = inherit */
  margin: unset;   /* 不可继承 = initial */
}
```

**✅ D. revert - 回退**
```css
.element {
  color: revert;  /* 回退到用户代理样式 */
}
```

**详细对比：**

**color（可继承）**
```css
.parent { color: red; }
.child {
  color: inherit;   /* red（继承父元素）*/
  color: initial;   /* black（CSS规范初始值）*/
  color: unset;     /* red（= inherit）*/
  color: revert;    /* black（浏览器样式）*/
}
```

**margin（不可继承）**
```css
.parent { margin: 20px; }
.child {
  margin: inherit;  /* 20px（强制继承）*/
  margin: initial;  /* 0（CSS规范初始值）*/
  margin: unset;    /* 0（= initial）*/
  margin: revert;   /* 浏览器默认的 margin */
}
```

**all 属性：**
```css
/* 重置所有属性 */
.reset-inherit { all: inherit; }
.reset-initial { all: initial; }
.reset-unset { all: unset; }
.reset-revert { all: revert; }
```

**使用场景：**

**1. 按钮重置**
```css
button {
  all: unset;
  cursor: pointer;
  padding: 10px 20px;
}
```

**2. 链接重置**
```css
a {
  color: inherit;      /* 继承父元素颜色 */
  text-decoration: none;
}
```

**3. 响应式重置**
```css
@media (max-width: 768px) {
  .desktop-only {
    all: revert;  /* 回退到默认 */
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** currentColor

### 题目

`currentColor` 关键字继承的是什么值？

**选项：**
- A. 父元素的 color
- B. 当前元素的 color
- C. 浏览器默认 color
- D. body 的 color

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**currentColor 详解**

**定义：当前元素的 color 值**

```css
.box {
  color: red;
  border: 1px solid currentColor;  /* border-color: red */
  box-shadow: 0 0 10px currentColor;  /* shadow-color: red */
}
```

**继承链：**
```css
.parent { color: blue; }

.child {
  color: red;
  border-color: currentColor;  /* red（当前元素）*/
}
```

**动态变化：**
```css
.box {
  color: red;
  border: 1px solid currentColor;
}

.box:hover {
  color: blue;  /* border 自动变为 blue ✅ */
}
```

**实用场景：**

**1. SVG 图标**
```css
.icon {
  fill: currentColor;  /* 跟随文字颜色 */
}

.button {
  color: blue;
}

.button:hover {
  color: red;  /* 图标自动变红 */
}
```

**2. 统一配色**
```css
.card {
  color: #3b82f6;
  border: 1px solid currentColor;
  box-shadow: 0 0 10px currentColor;
}
```

**3. 主题切换**
```css
.theme-blue { color: blue; }
.theme-red { color: red; }

.decorated {
  border-color: currentColor;  /* 自动跟随主题 */
}
```

**对比 inherit：**
```css
.parent { color: blue; }

.child {
  color: red;
  
  /* currentColor */
  border-color: currentColor;  /* red（自己的 color）*/
  
  /* inherit */
  border-color: inherit;       /* 继承 border-color，非 color */
}
```

</details>

---

## 第 7 题 🟡

**类型：** 单选题  
**标签：** 继承机制

### 题目

`visibility: hidden` 会被子元素继承吗？

**选项：**
- A. 会，子元素也隐藏
- B. 不会，子元素可见
- C. 取决于子元素的 display
- D. 取决于浏览器

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**visibility 继承特性**

**visibility 是可继承属性**

```css
.parent {
  visibility: hidden;  /* 父元素隐藏 */
}

.child {
  /* 自动继承 visibility: hidden */
  /* 子元素也隐藏 ✅ */
}
```

**但可以覆盖：**
```css
.parent {
  visibility: hidden;
}

.child {
  visibility: visible;  /* 子元素可见 ✅ */
}
```

**对比 display: none：**

**visibility: hidden**
```css
.parent { visibility: hidden; }
.child { visibility: visible; }  /* 子元素可见 ✅ */
```

**display: none**
```css
.parent { display: none; }
.child { display: block; }  /* 子元素仍隐藏 ❌ */
```

**区别总结：**

| 特性 | visibility: hidden | display: none |
|------|-------------------|---------------|
| 占据空间 | ✅ 是 | ❌ 否 |
| 可继承 | ✅ 是 | ❌ 否 |
| 子元素可覆盖 | ✅ 是 | ❌ 否 |
| 触发重排 | ❌ 否 | ✅ 是 |

**实用场景：**
```css
/* 可切换显示的子元素 */
.dropdown {
  visibility: hidden;
}

.dropdown.active {
  visibility: visible;
}

.dropdown-item {
  /* 继承父元素的 visibility */
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂继承

### 题目

以下代码中，`<span>` 的 `font-size` 是多少？

```css
html { font-size: 16px; }
body { font-size: 1.5em; }
div { font-size: 1.2em; }
p { font-size: inherit; }
```

```html
<html>
  <body>
    <div>
      <p>
        <span></span>
      </p>
    </div>
  </body>
</html>
```

**选项：**
- A. 16px
- B. 24px
- C. 28.8px
- D. 34.56px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**多层继承计算**

**逐层计算：**

```css
/* 1. html */
html { font-size: 16px; }  /* 基准 */

/* 2. body */
body { font-size: 1.5em; }
/* = 1.5 × 16px = 24px */

/* 3. div */
div { font-size: 1.2em; }
/* = 1.2 × 24px = 28.8px */

/* 4. p */
p { font-size: inherit; }
/* = 继承 div 的 28.8px */

/* 5. span */
/* 继承 p 的 28.8px ✅ */
```

**关键点：**

**em 的计算：**
- 相对于**父元素**的 font-size
- 计算后固定为像素值

**inherit 的作用：**
- 继承父元素的**计算值**
- p 继承 div 的 28.8px（而非 1.2em）

**完整计算过程：**
```
html:  16px（设定）
  ↓
body:  1.5 × 16 = 24px
  ↓
div:   1.2 × 24 = 28.8px
  ↓
p:     inherit = 28.8px
  ↓
span:  继承 = 28.8px ✅
```

**对比 rem：**
```css
html { font-size: 16px; }
div { font-size: 1.5rem; }  /* = 1.5 × 16 = 24px */
p { font-size: 1.2rem; }    /* = 1.2 × 16 = 19.2px */
/* rem 始终相对根元素 */
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** revert 关键字

### 题目

`revert` 关键字回退到的是什么样式？

**选项：**
- A. CSS 规范的初始值
- B. 父元素的值
- C. 用户代理（浏览器）样式
- D. 之前定义的值

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**revert 详解**

**定义：回退到用户代理（浏览器）样式**

```css
a {
  color: red;       /* 作者样式 */
  color: revert;    /* 回退到浏览器默认（蓝色）*/
}
```

**层叠来源回退：**
```
作者样式 → revert → 用户样式 → 浏览器样式
```

**示例对比：**

**color 属性：**
```css
/* 浏览器默认 */
a { color: blue; }  /* 链接默认蓝色 */

/* 作者样式 */
a { color: red; }

/* revert */
a { color: revert; }  /* blue（回退到浏览器样式）*/
```

**display 属性：**
```css
/* 浏览器默认 */
div { display: block; }

/* 作者样式 */
div { display: flex; }

/* revert */
div { display: revert; }  /* block（浏览器默认）*/
```

**对比其他关键字：**

```css
a {
  color: red;
  
  /* initial */
  color: initial;   /* black（CSS 规范初始值）*/
  
  /* inherit */
  color: inherit;   /* 继承父元素的 color */
  
  /* unset */
  color: unset;     /* 继承父元素（可继承属性）*/
  
  /* revert */
  color: revert;    /* blue（浏览器默认链接颜色）*/
}
```

**实用场景：**

**1. 重置特定元素**
```css
button {
  all: revert;  /* 回退到浏览器默认按钮样式 */
}
```

**2. 条件重置**
```css
@media print {
  a {
    color: revert;  /* 打印时使用浏览器默认 */
  }
}
```

**3. 覆盖第三方样式**
```css
.override {
  all: revert;      /* 移除第三方库样式 */
  margin: 20px;     /* 应用自定义样式 */
}
```

**层叠来源：**
```
1. 过渡动画
2. 用户 !important
3. 作者 !important
4. 作者样式        ← revert 从这里开始回退
5. 用户样式        ← 回退到这里（如果有）
6. 浏览器样式      ← 通常回退到这里
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 继承最佳实践

### 题目

关于 CSS 继承的最佳实践，以下说法正确的是？

**选项：**
- A. 在根元素设置基础字体样式
- B. 使用 `inherit` 让链接继承父元素颜色
- C. 避免过度依赖继承
- D. 所有属性都应该设置继承

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**继承最佳实践**

**✅ A. 根元素设置基础样式**
```css
html {
  font-size: 16px;
  font-family: -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* 所有元素自动继承 ✅ */
```

**好处：**
- 统一基础样式
- 易于维护
- 减少重复代码

**✅ B. 链接继承颜色**
```css
a {
  color: inherit;           /* 继承父元素颜色 */
  text-decoration: none;
}

.blue-section a {
  /* 自动变蓝 ✅ */
}
```

**✅ C. 避免过度依赖**
```css
/* ❌ 不好 */
.parent { padding: 20px; }
.child { padding: inherit; }  /* 不必要 */

/* ✅ 好 */
.parent { color: blue; }
.child { /* 自动继承 */ }
```

**❌ D. 不是所有属性都继承（错误）**
```css
/* 盒模型属性通常不应继承 */
.parent { width: 500px; }
.child { width: inherit; }  /* 通常不推荐 */
```

**其他最佳实践：**

**1. 使用 CSS 变量**
```css
:root {
  --primary-color: #3b82f6;
  --font-size-base: 16px;
}

body {
  color: var(--primary-color);
  font-size: var(--font-size-base);
}
```

**2. 模块化继承**
```css
/* 基础排版 */
.typography {
  font-family: Georgia, serif;
  line-height: 1.8;
}

/* 继承基础排版 */
.article {
  @extend .typography;  /* Sass */
}
```

**3. 响应式继承**
```css
html {
  font-size: 14px;
}

@media (min-width: 768px) {
  html { font-size: 16px; }
  /* 所有 em/rem 单位自动调整 */
}
```

**4. 性能优化**
```css
/* 减少选择器层级，利用继承 */
.container {
  color: #333;
  font-size: 16px;
}

/* 子元素自动继承，无需重复声明 */
```

**5. 语义化继承**
```css
/* 基于语义设置继承 */
article {
  font-size: 18px;
  line-height: 1.6;
}

article p, article li {
  /* 自动继承 article 的排版 */
}
```

</details>

---

**导航**  
[上一章：第 7 章 - 层叠算法详解](./chapter-07.md) | [返回目录](../README.md) | [下一章：第 9 章 - 样式值计算过程](./chapter-09.md)
