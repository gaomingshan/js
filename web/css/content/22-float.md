# 第 22 章：浮动原理

## 概述

浮动（float）是CSS早期的布局技术，虽然现在有flex和grid，但理解浮动仍很重要。

---

## 一、浮动基础

### 1.1 语法

```css
.box {
  float: left;       /* 左浮动 */
  float: right;      /* 右浮动 */
  float: none;       /* 不浮动（默认） */
}
```

---

## 二、浮动特性

### 2.1 脱离文档流

```css
.float {
  float: left;
  /* 脱离正常流，不占据空间 */
}
```

### 2.2 块级化

```css
.inline {
  display: inline;
  float: left;       /* display变为block */
}
```

### 2.3 包裹性

```css
.float {
  float: left;
  /* 宽度收缩为内容宽度 */
}
```

---

## 三、浮动规则

### 3.1 浮动元素排列

```html
<div class="box1" style="float: left;">1</div>
<div class="box2" style="float: left;">2</div>
<div class="box3" style="float: left;">3</div>
```

**排列**：1 2 3（水平排列）

### 3.2 浮动元素与正常流

```html
<div class="float">浮动</div>
<p>正常流文本环绕浮动元素...</p>
```

**效果**：文字环绕浮动元素

---

## 四、高度塌陷

### 4.1 问题

```html
<div class="parent">
  <div class="float">浮动元素</div>
</div>
```

```css
.float {
  float: left;
  height: 100px;
}

.parent {
  border: 1px solid red;
  /* 高度塌陷为0 */
}
```

### 4.2 解决方案见第23章

---

## 五、浮动方向

### 5.1 左浮动

```css
.left {
  float: left;       /* 靠左排列 */
}
```

### 5.2 右浮动

```css
.right {
  float: right;      /* 靠右排列 */
}
```

### 5.3 混合浮动

```css
.left { float: left; }
.right { float: right; }
/* 左右分布 */
```

---

## 六、实用案例

### 6.1 两栏布局

```html
<div class="sidebar">侧边栏</div>
<div class="main">主内容</div>
```

```css
.sidebar {
  float: left;
  width: 200px;
}

.main {
  margin-left: 220px;  /* 留出sidebar空间 */
}
```

### 6.2 图文混排

```css
.image {
  float: left;
  margin-right: 20px;
}
/* 文字自动环绕图片 */
```

---

## 参考资料

- [MDN - float](https://developer.mozilla.org/zh-CN/docs/Web/CSS/float)

---

**导航**  
[上一章：第 21 章 - 偏移属性计算](./21-offset-properties.md)  
[返回目录](../README.md)  
[下一章：第 23 章 - 清除浮动](./23-clearing-float.md)
