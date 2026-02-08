# 第 45 章：Sass/Less 原理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 预处理器

### 题目

CSS 预处理器的作用是？

**选项：**
- A. 压缩CSS
- B. 扩展CSS语法，编译成标准CSS
- C. 优化性能
- D. 自动添加前缀

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS 预处理器**

```scss
// Sass/SCSS 代码
$primary: #007bff;

.button {
  background: $primary;
  
  &:hover {
    background: darken($primary, 10%);
  }
}
```

**编译后：**
```css
.button {
  background: #007bff;
}

.button:hover {
  background: #0056b3;
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Sass vs SCSS

### 题目

Sass 和 SCSS 的区别？

**选项：**
- A. 功能不同
- B. 语法不同，SCSS 兼容CSS
- C. 性能不同
- D. 没有区别

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Sass（缩进语法）：**
```sass
$primary: blue

.button
  background: $primary
  &:hover
    opacity: 0.8
```

**SCSS（CSS-like）：**
```scss
$primary: blue;

.button {
  background: $primary;
  
  &:hover {
    opacity: 0.8;
  }
}
```

**推荐使用 SCSS**（更接近CSS，易学习）

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 嵌套

### 题目

Sass/Less 支持嵌套规则。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**嵌套规则**

```scss
.nav {
  background: white;
  
  &__item {
    padding: 10px;
    
    &:hover {
      background: gray;
    }
    
    &--active {
      color: blue;
    }
  }
}
```

**编译后：**
```css
.nav {
  background: white;
}

.nav__item {
  padding: 10px;
}

.nav__item:hover {
  background: gray;
}

.nav__item--active {
  color: blue;
}
```

**⚠️ 避免过度嵌套（建议不超过3层）**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 核心特性

### 题目

Sass/Less 的核心特性有？

**选项：**
- A. 变量
- B. 嵌套
- C. Mixin（混合）
- D. 函数

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. 变量**
```scss
$primary: #007bff;
$spacing: 1rem;

.button {
  background: $primary;
  padding: $spacing;
}
```

**✅ B. 嵌套**
```scss
.nav {
  &__item {
    &:hover { }
  }
}
```

**✅ C. Mixin**
```scss
@mixin button-style($bg) {
  padding: 10px 20px;
  background: $bg;
  border: none;
}

.button {
  @include button-style(blue);
}
```

**✅ D. 函数**
```scss
@function px-to-rem($px) {
  @return $px / 16 * 1rem;
}

.text {
  font-size: px-to-rem(24);  // 1.5rem
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** Mixin vs Extend

### 题目

`@mixin` 和 `@extend` 的区别？

**选项：**
- A. 功能相同
- B. mixin 复制代码，extend 合并选择器
- C. 性能相同
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**@mixin（复制代码）：**
```scss
@mixin button-base {
  padding: 10px 20px;
  border: none;
}

.button-primary {
  @include button-base;
  background: blue;
}

.button-secondary {
  @include button-base;
  background: gray;
}
```

**编译后：**
```css
.button-primary {
  padding: 10px 20px;
  border: none;
  background: blue;
}

.button-secondary {
  padding: 10px 20px;
  border: none;
  background: gray;
}
```

---

**@extend（合并选择器）：**
```scss
.button-base {
  padding: 10px 20px;
  border: none;
}

.button-primary {
  @extend .button-base;
  background: blue;
}

.button-secondary {
  @extend .button-base;
  background: gray;
}
```

**编译后：**
```css
.button-base,
.button-primary,
.button-secondary {
  padding: 10px 20px;
  border: none;
}

.button-primary {
  background: blue;
}

.button-secondary {
  background: gray;
}
```

**选择建议：**
- Mixin：需要传参数时
- Extend：纯粹的样式继承

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 循环

### 题目

Sass 如何实现循环？

**选项：**
- A. `@for`
- B. `@each`
- C. `@while`
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**@for 循环：**
```scss
@for $i from 1 through 5 {
  .col-#{$i} {
    width: 20% * $i;
  }
}
```

**@each 循环：**
```scss
$colors: red, green, blue;

@each $color in $colors {
  .bg-#{$color} {
    background: $color;
  }
}
```

**@while 循环：**
```scss
$i: 1;

@while $i <= 5 {
  .item-#{$i} {
    width: 20% * $i;
  }
  $i: $i + 1;
}
```

**实用示例：**
```scss
// 生成间距工具类
$spacings: 0, 4, 8, 12, 16, 20, 24;

@each $space in $spacings {
  .mt-#{$space} {
    margin-top: #{$space}px;
  }
  
  .p-#{$space} {
    padding: #{$space}px;
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 模块化

### 题目

Sass 如何实现模块化？

**选项：**
- A. `@import`
- B. `@use`
- C. `@forward`
- D. B 和 C（现代方式）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**@import（旧方式，已弃用）：**
```scss
@import 'variables';
@import 'mixins';
@import 'components/button';
```

**@use（现代方式）：**
```scss
// _variables.scss
$primary: blue;

// main.scss
@use 'variables';

.button {
  background: variables.$primary;
}
```

**@use with namespace：**
```scss
@use 'variables' as vars;

.button {
  background: vars.$primary;
}
```

**@forward（转发）：**
```scss
// _index.scss
@forward 'variables';
@forward 'mixins';
@forward 'functions';

// main.scss
@use 'index' as *;  // 使用所有导出的内容
```

**最佳实践：**
```
styles/
  ├── abstracts/
  │   ├── _variables.scss
  │   ├── _mixins.scss
  │   └── _index.scss  (@forward all)
  ├── components/
  │   ├── _button.scss
  │   └── _card.scss
  └── main.scss
```

```scss
// main.scss
@use 'abstracts' as *;
@use 'components/button';
@use 'components/card';
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 编译原理

### 题目

Sass 的编译过程？

**选项：**
- A. 直接生成CSS
- B. 解析 → AST → 处理 → 生成CSS
- C. 只是字符串替换
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**编译流程：**

```
1. Tokenization（词法分析）
   └─ 源代码 → Tokens

2. Parsing（语法分析）
   └─ Tokens → AST（抽象语法树）

3. Processing（处理）
   └─ 变量替换、Mixin展开、函数计算

4. Code Generation（代码生成）
   └─ AST → CSS 代码

5. Optimization（优化）
   └─ 压缩、去重等
```

**示例：**

**输入（SCSS）：**
```scss
$primary: blue;

.button {
  background: $primary;
  
  &:hover {
    background: darken($primary, 10%);
  }
}
```

**编译步骤：**
```
1. 解析变量 $primary = blue
2. 解析嵌套规则
3. 调用函数 darken(blue, 10%)
4. 展开 & 引用
5. 生成最终 CSS
```

**输出（CSS）：**
```css
.button {
  background: blue;
}

.button:hover {
  background: #0000cc;
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

Sass/Less 的性能优化策略？

**选项：**
- A. 避免过度嵌套
- B. 合理使用 mixin
- C. 按需引入
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**优化策略（全部正确）**

**✅ A. 避免过度嵌套**
```scss
/* ❌ 过度嵌套（生成复杂选择器）*/
.header {
  .nav {
    .menu {
      .item {
        .link {
          color: blue;  // .header .nav .menu .item .link
        }
      }
    }
  }
}

/* ✅ 扁平化 */
.nav-link {
  color: blue;
}
```

**✅ B. 合理使用 mixin**
```scss
/* ❌ 简单样式用 mixin（代码冗余）*/
@mixin text-center {
  text-align: center;
}

.a { @include text-center; }
.b { @include text-center; }
.c { @include text-center; }

/* ✅ 复杂样式或带参数时用 mixin */
@mixin button($bg, $color) {
  padding: 10px 20px;
  background: $bg;
  color: $color;
  border: none;
  border-radius: 4px;
}
```

**✅ C. 按需引入**
```scss
/* ❌ 全量引入 */
@use 'bootstrap';  // 整个 Bootstrap

/* ✅ 按需引入 */
@use 'bootstrap/scss/functions';
@use 'bootstrap/scss/variables';
@use 'bootstrap/scss/mixins';
@use 'bootstrap/scss/buttons';
```

**完整优化清单：**
```scss
// 1. 使用变量避免重复
$colors: (
  'primary': #007bff,
  'secondary': #6c757d
);

// 2. 合理组织文件
@use 'abstracts/variables';
@use 'abstracts/mixins';

// 3. 避免深层嵌套
.nav {
  &__item { }  // 最多2-3层
}

// 4. 使用 @extend 减少重复
%button-base {
  padding: 10px 20px;
}

.btn-primary {
  @extend %button-base;
}

// 5. 编译时优化
// - 启用 compressed 模式
// - 使用 source maps
// - Tree-shaking 未使用的代码
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

Sass/Less 的最佳实践？

**选项：**
- A. 使用变量管理设计系统
- B. Mixin 封装可复用样式
- C. 文件模块化组织
- D. 避免过度工程化

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**最佳实践（全部正确）**

**✅ A. 设计系统**
```scss
// _variables.scss
$colors: (
  'primary': #007bff,
  'secondary': #6c757d,
  'success': #28a745
);

$spacing: (
  'xs': 0.25rem,
  'sm': 0.5rem,
  'md': 1rem,
  'lg': 1.5rem
);

$breakpoints: (
  'sm': 576px,
  'md': 768px,
  'lg': 992px
);
```

**✅ B. Mixin 封装**
```scss
// _mixins.scss
@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 使用
.container {
  @include flex-center;
  
  @include respond-to('md') {
    flex-direction: row;
  }
}
```

**✅ C. 文件组织**
```
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _functions.scss
│   └── _index.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _index.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _index.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   └── _index.scss
├── pages/
│   ├── _home.scss
│   └── _about.scss
└── main.scss
```

```scss
// main.scss
@use 'abstracts' as *;
@use 'base';
@use 'components';
@use 'layout';
@use 'pages';
```

**✅ D. 避免过度工程化**
```scss
/* ❌ 过度抽象 */
@mixin m($val) {
  margin: $val;
}

@function c($key) {
  @return map-get($colors, $key);
}

/* ✅ 清晰易懂 */
@mixin margin($value) {
  margin: $value;
}

@function get-color($key) {
  @return map-get($colors, $key);
}
```

</details>

---

**导航**  
[上一章：第 44 章 - CSS方法论](./chapter-44.md) | [返回目录](../README.md) | [下一章：第 46 章 - PostCSS与工程化](./chapter-46.md)
