# 第 2 章：选择器系统 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 基础选择器

### 题目

以下哪个选择器的优先级最高？

**选项：**
- A. `div`
- B. `.box`
- C. `#header`
- D. `*`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**选择器优先级（从高到低）**

```css
/* 优先级：(1,0,0) - 最高 */
#header { }

/* 优先级：(0,1,0) */
.box { }

/* 优先级：(0,0,1) */
div { }

/* 优先级：(0,0,0) - 最低 */
* { }
```

**优先级计算规则：**
- ID 选择器：+100
- 类/属性/伪类选择器：+10
- 元素/伪元素选择器：+1
- 通配符：0

**示例对比：**
```css
#header .nav li { }  /* (1,1,1) = 111 */
.header .nav li { }  /* (0,2,1) = 21 */
div ul li { }        /* (0,0,3) = 3 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 组合选择器

### 题目

`div > p` 选择器选择的是什么？

**选项：**
- A. div 内的所有 p 元素
- B. div 的直接子元素 p
- C. div 之后的 p 元素
- D. div 的兄弟元素 p

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**组合选择器对比**

**`>`（子选择器）- 直接子元素**
```html
<div>
  <p>选中✅</p>
  <section>
    <p>不选中❌</p>
  </section>
</div>
```
```css
div > p { }  /* 只选中直接子元素 */
```

**空格（后代选择器）- 所有后代**
```css
div p { }  /* 选中所有后代 p */
```

**`+`（相邻兄弟选择器）**
```html
<div></div>
<p>选中✅</p>
<p>不选中❌</p>
```
```css
div + p { }  /* 紧邻的下一个兄弟 */
```

**`~`（通用兄弟选择器）**
```css
div ~ p { }  /* 所有后面的兄弟 p */
```

</details>

---

## 第 3 题 🟢

**类型：** 多选题  
**标签：** 伪类

### 题目

以下哪些是有效的伪类选择器？

**选项：**
- A. `:hover`
- B. `:first-child`
- C. `:nth-child(2)`
- D. `:before`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**伪类 vs 伪元素**

**✅ 伪类（单冒号）**
```css
a:hover { }         /* 鼠标悬停 */
li:first-child { }  /* 第一个子元素 */
li:nth-child(2) { } /* 第二个子元素 */
input:focus { }     /* 获得焦点 */
```

**❌ D 选项是伪元素（双冒号）**
```css
/* 正确写法 */
div::before { }
div::after { }

/* 旧写法（仍可用） */
div:before { }
div:after { }
```

**常用伪类：**
- 动态伪类：`:hover`, `:active`, `:focus`
- 结构伪类：`:first-child`, `:last-child`, `:nth-child()`
- 状态伪类：`:checked`, `:disabled`, `:valid`

**常用伪元素：**
- `::before`, `::after`
- `::first-line`, `::first-letter`
- `::selection`, `::placeholder`

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 权重计算

### 题目

以下选择器的优先级从高到低排序是？

```css
1. div#header .nav li
2. #header .nav li
3. .header .nav li
4. div.header .nav li
```

**选项：**
- A. 1 > 2 > 4 > 3
- B. 2 > 1 > 4 > 3
- C. 1 > 2 > 3 > 4
- D. 2 > 1 > 3 > 4

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**优先级计算**

**计算规则：(ID, Class, Element)**

```css
/* 1. div#header .nav li */
/*    1个元素 + 1个ID + 1个类 + 1个元素 */
/*    优先级：(1, 1, 2) = 112 */

/* 2. #header .nav li */
/*    1个ID + 1个类 + 1个元素 */
/*    优先级：(1, 1, 1) = 111 */

/* 3. .header .nav li */
/*    2个类 + 1个元素 */
/*    优先级：(0, 2, 1) = 21 */

/* 4. div.header .nav li */
/*    1个元素 + 2个类 + 1个元素 */
/*    优先级：(0, 2, 2) = 22 */
```

**排序：**
```
1. (1, 1, 2) = 112  最高
2. (1, 1, 1) = 111
4. (0, 2, 2) = 22
3. (0, 2, 1) = 21   最低
```

**答案：1 > 2 > 4 > 3**

**优先级比较原则：**
- ID 数量最重要
- 其次是 Class 数量
- 最后是 Element 数量
- 从左到右逐位比较

</details>

---

## 第 5 题 🟡

**类型：** 单选题  
**标签：** 现代选择器

### 题目

`:is()` 选择器的作用是什么？

**选项：**
- A. 检查元素是否存在
- B. 简化选择器列表
- C. 检查元素是否可见
- D. 选择第一个匹配的元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**`:is()` 伪类 - 简化选择器**

**传统写法：**
```css
header p,
main p,
footer p {
  color: blue;
}
```

**使用 `:is()` 简化：**
```css
:is(header, main, footer) p {
  color: blue;
}
```

**优势：**
- 减少代码重复
- 提高可读性
- 易于维护

**更多示例：**
```css
/* 选择所有标题内的链接 */
:is(h1, h2, h3, h4, h5, h6) a {
  color: red;
}

/* 嵌套使用 */
:is(.header, .footer) :is(a, button) {
  padding: 10px;
}
```

**注意：**
- `:is()` 的优先级取决于参数中最高的优先级
- 与 `:where()` 类似，但 `:where()` 优先级为 0

</details>

---

## 第 6 题 🟡

**类型：** 多选题  
**标签：** 属性选择器

### 题目

以下哪些是有效的属性选择器？

**选项：**
- A. `[type="text"]`
- B. `[class^="btn"]`
- C. `[href$=".pdf"]`
- D. `[title*="hello"]`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**属性选择器语法（全部正确）**

**A. 精确匹配 `=`**
```css
input[type="text"] {
  /* 选择 type 属性值为 "text" 的 input */
}
```

**B. 开头匹配 `^=`**
```css
[class^="btn"] {
  /* 选择 class 以 "btn" 开头的元素 */
  /* 匹配：btn-primary, btn-large */
}
```

**C. 结尾匹配 `$=`**
```css
a[href$=".pdf"] {
  /* 选择 href 以 ".pdf" 结尾的链接 */
}
```

**D. 包含匹配 `*=`**
```css
[title*="hello"] {
  /* 选择 title 包含 "hello" 的元素 */
}
```

**其他属性选择器：**
```css
/* 存在属性 */
[disabled] { }

/* 包含单词（空格分隔）*/
[class~="active"] { }

/* 以-分隔的开头匹配 */
[lang|="en"] { }  /* 匹配 en, en-US, en-GB */
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 伪类选择器

### 题目

`:nth-child(3n+1)` 选择器选择的是哪些元素？

**选项：**
- A. 第 1, 4, 7, 10... 个子元素
- B. 第 3, 6, 9, 12... 个子元素
- C. 每隔 3 个元素
- D. 第 1, 2, 3 个子元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**`:nth-child()` 计算公式**

**公式：`an + b`**
- `n` 从 0 开始递增（0, 1, 2, 3...）
- `a` 是步长
- `b` 是偏移量

**`:nth-child(3n+1)` 计算：**
```
n = 0: 3×0 + 1 = 1  ✅
n = 1: 3×1 + 1 = 4  ✅
n = 2: 3×2 + 1 = 7  ✅
n = 3: 3×3 + 1 = 10 ✅
...
```

**常用模式：**
```css
/* 奇数行 */
:nth-child(odd)    /* = 2n+1 */
:nth-child(2n+1)

/* 偶数行 */
:nth-child(even)   /* = 2n */
:nth-child(2n)

/* 前 3 个 */
:nth-child(-n+3)   /* 1, 2, 3 */

/* 从第 4 个开始 */
:nth-child(n+4)    /* 4, 5, 6... */
```

**示例应用：**
```css
/* 每3行变色 */
tr:nth-child(3n+1) {
  background: #f0f0f0;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂选择器

### 题目

以下代码中，哪些 `<p>` 元素会被选中？

```html
<div class="container">
  <p>A</p>
  <div>
    <p>B</p>
  </div>
  <p>C</p>
  <span>
    <p>D</p>
  </span>
</div>
```

```css
.container > p {
  color: red;
}
```

**选项：**
- A. 只有 A
- B. A 和 C
- C. A, B, C
- D. 全部

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**子选择器 `>` 详解**

**选择规则：**
- `>` 只选择**直接子元素**
- 不选择更深层的后代

**本题分析：**

```html
<div class="container">
  <p>A</p>          ← 直接子元素 ✅
  <div>
    <p>B</p>        ← 孙子元素 ❌
  </div>
  <p>C</p>          ← 直接子元素 ✅
  <span>
    <p>D</p>        ← 孙子元素 ❌
  </span>
</div>
```

**结果：只有 A 和 C 被选中**

**对比后代选择器：**
```css
.container p {
  /* 选中所有后代 p：A, B, C, D */
}
```

**实用场景：**
```css
/* 只样式化导航的直接子列表 */
.nav > ul {
  display: flex;
}

/* 不影响子菜单 */
.nav > ul > li > ul {
  display: block;
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 伪类组合

### 题目

`:not(:last-child)` 选择器的作用是什么？

**选项：**
- A. 选择第一个子元素
- B. 选择除最后一个子元素外的所有元素
- C. 选择倒数第二个子元素
- D. 不选择任何元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**`:not()` 否定伪类**

**基本用法：**
```css
/* 选择除最后一个外的所有 li */
li:not(:last-child) {
  margin-bottom: 10px;
}
```

**效果：**
```html
<ul>
  <li>Item 1</li> ← 选中✅ margin-bottom: 10px
  <li>Item 2</li> ← 选中✅ margin-bottom: 10px
  <li>Item 3</li> ← 不选中❌ 无margin-bottom
</ul>
```

**实用场景：**

**1. 列表间距（除最后一个）**
```css
.list-item:not(:last-child) {
  border-bottom: 1px solid #ddd;
}
```

**2. 按钮组间距**
```css
.btn-group .btn:not(:last-child) {
  margin-right: 10px;
}
```

**3. 排除特定类**
```css
p:not(.special) {
  color: gray;
}
```

**高级用法：**
```css
/* 多重否定 */
li:not(:first-child):not(:last-child) {
  /* 选择中间的所有元素 */
}

/* 组合否定 */
:not(p):not(div) {
  /* 选择非 p 和非 div 的元素 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 现代选择器

### 题目

关于 `:has()` 选择器，以下说法正确的是？

**选项：**
- A. `:has()` 可以根据子元素选择父元素
- B. `.card:has(img)` 选择包含图片的 card
- C. `:has()` 优先级为 0
- D. `:has()` 是 CSS4 的新特性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B

### 📖 解析

**`:has()` 关系伪类（父选择器）**

**✅ A. 根据子元素选择父元素**
```css
/* 选择包含 img 的 div */
div:has(img) {
  border: 1px solid blue;
}
```

**✅ B. 实际应用**
```css
/* 选择包含图片的卡片 */
.card:has(img) {
  padding: 20px;
}

/* 选择有选中复选框的表单 */
form:has(input:checked) {
  background: green;
}
```

**❌ C. 优先级不是 0**
- `:has()` 的优先级取决于其参数
- 类似于 `:is()`，而非 `:where()`

**❌ D. 不是 CSS4**
- CSS Selectors Level 4 的一部分
- 但 CSS 版本号已废弃，现在是"活标准"

**强大用法：**

**1. 相邻影响**
```css
/* 有相邻兄弟的元素 */
h2:has(+ p) {
  margin-bottom: 0.5em;
}
```

**2. 条件样式**
```css
/* 包含错误输入的表单 */
form:has(input:invalid) {
  border: 2px solid red;
}
```

**3. 复杂组合**
```css
/* 包含特定子元素的容器 */
.container:has(> .sidebar):has(> .main) {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

**浏览器支持：**
- 现代浏览器已广泛支持
- 注意兼容性（Can I Use）

</details>

---

**导航**  
[上一章：第 1 章 - CSS核心概念](./chapter-01.md) | [返回目录](../README.md) | [下一章：第 3 章 - 盒模型基础](./chapter-03.md)
