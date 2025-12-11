# 第 23 章：清除浮动

## 概述

清除浮动是解决浮动布局高度塌陷问题的关键技术。

---

## 一、清除浮动方法

### 1.1 clear属性

```css
.clear {
  clear: left;       /* 清除左浮动 */
  clear: right;      /* 清除右浮动 */
  clear: both;       /* 清除两侧浮动 */
}
```

```html
<div class="float">浮动</div>
<div class="clear">清除浮动</div>
```

### 1.2 伪元素清除（推荐）

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

```html
<div class="parent clearfix">
  <div class="float">浮动元素</div>
</div>
```

### 1.3 overflow触发BFC

```css
.parent {
  overflow: hidden;  /* 触发BFC，包含浮动 */
}
```

### 1.4 display: flow-root

```css
.parent {
  display: flow-root;  /* 专门用于清除浮动 */
}
```

---

## 二、最佳实践

### 2.1 推荐方案

```css
/* 方案1：伪元素（兼容性好） */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* 方案2：flow-root（现代浏览器） */
.container {
  display: flow-root;
}
```

---

## 参考资料

- [MDN - clear](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clear)

---

**导航**  
[上一章：第 22 章 - 浮动原理](./22-float.md)  
[返回目录](../README.md)  
[下一章：第 24 章 - Flexbox布局算法](./24-flexbox-algorithm.md)
