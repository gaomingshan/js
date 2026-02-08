# 第 12 章：正常流

## 概述

正常流（Normal Flow）是CSS的默认布局方式。理解正常流是掌握所有布局的基础。

---

## 一、什么是正常流

### 1.1 定义

元素按照在HTML中的顺序，从上到下、从左到右排列的布局方式。

```html
<div>块级元素1</div>
<div>块级元素2</div>
<span>行内元素1</span><span>行内元素2</span>
```

**布局结果**：
```
┌────────────────┐
│ 块级元素1       │
├────────────────┤
│ 块级元素2       │
├────────────────┤
│ 行内元素1行内元素2
└────────────────┘
```

---

## 二、块级盒（Block Box）

### 2.1 特点

- 独占一行
- 可设置宽高
- 默认宽度100%
- 垂直排列

```css
div, p, h1, ul, li, section {
  display: block;
}
```

### 2.2 块级盒的布局

```css
.block {
  width: 50%;        /* 可设置宽度 */
  height: 100px;     /* 可设置高度 */
  margin: 20px 0;    /* 垂直外边距 */
}
```

---

## 三、行内盒（Inline Box）

### 3.1 特点

- 不独占一行
- 不可设置宽高
- 宽度由内容决定
- 水平排列

```css
span, a, strong, em {
  display: inline;
}
```

### 3.2 行内盒的限制

```css
.inline {
  width: 100px;           /* 无效 */
  height: 50px;           /* 无效 */
  padding: 10px;          /* 水平有效，垂直不占空间 */
  margin: 10px;           /* 水平有效，垂直无效 */
  vertical-align: middle; /* 有效 */
}
```

---

## 四、行内块盒（Inline-Block Box）

### 4.1 特点

结合块级盒和行内盒的特点：
- 不独占一行（行内）
- 可设置宽高（块级）

```css
.inline-block {
  display: inline-block;
  width: 100px;      /* 有效 */
  height: 50px;      /* 有效 */
  margin: 10px;      /* 水平垂直都有效 */
}
```

### 4.2 应用场景

```css
/* 导航菜单 */
.nav li {
  display: inline-block;
  padding: 10px 20px;
}

/* 卡片布局 */
.card {
  display: inline-block;
  width: 200px;
  vertical-align: top;
}
```

---

## 五、匿名盒

### 5.1 匿名块盒

```html
<div>
  一些文本
  <p>段落</p>
  更多文本
</div>
```

浏览器会自动创建匿名块盒包裹文本：
```
div
├── 匿名块盒（"一些文本"）
├── p（块盒）
└── 匿名块盒（"更多文本"）
```

### 5.2 匿名行盒

```html
<p>
  一些文本 <em>强调</em> 更多文本
</p>
```

每行文本都被包含在匿名行盒中。

---

## 六、正常流的布局规则

### 6.1 块级盒布局

```css
/* 垂直方向 */
.block1 { margin-bottom: 20px; }
.block2 { margin-top: 30px; }
/* 实际间距 = max(20px, 30px) = 30px（外边距合并） */
```

### 6.2 行内盒布局

```css
/* 水平方向 */
.inline1 { margin-right: 10px; }
.inline2 { margin-left: 15px; }
/* 实际间距 = 10px + 15px = 25px（不合并） */
```

### 6.3 行盒（Line Box）

行内元素排列在行盒中：

```
行盒1: [inline1] [inline2] [inline3]
行盒2: [inline4] [inline5]
```

---

## 七、脱离正常流

### 7.1 float

```css
.float {
  float: left;  /* 脱离正常流 */
}
```

### 7.2 position: absolute/fixed

```css
.absolute {
  position: absolute;  /* 脱离正常流 */
}

.fixed {
  position: fixed;     /* 脱离正常流 */
}
```

### 7.3 position: relative

```css
.relative {
  position: relative;  /* 仍在正常流中 */
  top: 10px;           /* 视觉偏移，不影响其他元素 */
}
```

---

## 八、实用示例

### 8.1 文档流布局

```html
<header>头部</header>
<main>
  <article>文章内容</article>
  <aside>侧边栏</aside>
</main>
<footer>页脚</footer>
```

```css
header, main, footer {
  display: block;      /* 正常流 */
}

article, aside {
  display: inline-block;  /* 水平排列 */
  vertical-align: top;
}
```

### 8.2 行内元素居中

```css
.container {
  text-align: center;  /* 行内元素居中 */
}

.inline {
  display: inline-block;
}
```

---

## 参考资料

- [MDN - 正常流](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Normal_Flow)
- [CSS Display Specification](https://www.w3.org/TR/css-display-3/)

---

**导航**  
[上一章：第 11 章 - 包含块](./11-containing-block.md)  
[返回目录](../README.md)  
[下一章：第 13 章 - 盒的生成与布局](./13-box-generation.md)
