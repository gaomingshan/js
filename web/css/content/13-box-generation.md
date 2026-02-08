# 第 13 章：盒的生成与布局

## 概述

display属性决定元素生成什么类型的盒子，进而影响元素的布局方式。

---

## 一、display的双值语法

### 1.1 外部显示类型 + 内部显示类型

```css
/* 完整语法 */
.box {
  display: block flow;        /* 块级 + 正常流 */
  display: inline flow;       /* 行内 + 正常流 */
  display: block flex;        /* 块级 + flex布局 */
  display: inline flex;       /* 行内 + flex布局 */
}

/* 简写 */
.box {
  display: block;      /* = block flow */
  display: inline;     /* = inline flow */
  display: flex;       /* = block flex */
  display: inline-flex;/* = inline flex */
}
```

---

## 二、外部显示类型

### 2.1 block - 块级

```css
.block {
  display: block;
  /* 独占一行，可设置宽高 */
}
```

### 2.2 inline - 行内

```css
.inline {
  display: inline;
  /* 不独占一行，不可设置宽高 */
}
```

### 2.3 inline-block - 行内块

```css
.inline-block {
  display: inline-block;
  /* 不独占一行，可设置宽高 */
}
```

---

## 三、内部显示类型

### 3.1 flow - 正常流

```css
.flow {
  display: block;      /* 子元素正常流布局 */
}
```

### 3.2 flex - 弹性布局

```css
.flex {
  display: flex;       /* 子元素flex布局 */
}

.inline-flex {
  display: inline-flex;/* 自身行内，子元素flex */
}
```

### 3.3 grid - 网格布局

```css
.grid {
  display: grid;       /* 子元素grid布局 */
}

.inline-grid {
  display: inline-grid;/* 自身行内，子元素grid */
}
```

### 3.4 table - 表格布局

```css
.table {
  display: table;      /* 表格布局 */
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
}
```

---

## 四、特殊display值

### 4.1 none - 隐藏

```css
.hidden {
  display: none;       /* 不生成盒子，不占空间 */
}

/* vs visibility */
.invisible {
  visibility: hidden;  /* 生成盒子，占空间，不可见 */
}
```

### 4.2 contents - 移除盒子

```css
.contents {
  display: contents;   /* 移除自身盒子，子元素提升 */
}
```

```html
<div class="parent">
  <div class="contents">
    <span>A</span>
    <span>B</span>
  </div>
</div>

<!-- 渲染结果类似于 -->
<div class="parent">
  <span>A</span>
  <span>B</span>
</div>
```

---

## 五、display改变规则

### 5.1 float/absolute强制块级化

```css
.box {
  display: inline;
  float: left;         /* display变为block */
}

.box {
  display: inline;
  position: absolute;  /* display变为block */
}
```

### 5.2 flex/grid子元素块级化

```css
.parent {
  display: flex;
}

.child {
  display: inline;     /* 变为block（flex item） */
}
```

---

## 六、盒模型生成

### 6.1 块级盒生成

```css
div {
  display: block;
  /* 生成：块级盒 + 块容器盒 */
}
```

### 6.2 行内盒生成

```css
span {
  display: inline;
  /* 生成：行内盒 */
}
```

### 6.3 不生成盒

```css
.none {
  display: none;
  /* 不生成任何盒子 */
}
```

---

## 七、实用案例

### 7.1 响应式布局切换

```css
/* 移动端：块级 */
.item {
  display: block;
  width: 100%;
}

/* 桌面端：flex */
@media (min-width: 768px) {
  .container {
    display: flex;
  }
  
  .item {
    flex: 1;
  }
}
```

### 7.2 条件显示

```css
/* 默认隐藏 */
.modal {
  display: none;
}

/* 激活时显示 */
.modal.active {
  display: block;      /* 或flex */
}
```

---

## 参考资料

- [MDN - display](https://developer.mozilla.org/zh-CN/docs/Web/CSS/display)
- [CSS Display Specification](https://www.w3.org/TR/css-display-3/)

---

**导航**  
[上一章：第 12 章 - 正常流](./12-normal-flow.md)  
[返回目录](../README.md)  
[下一章：第 14 章 - BFC块级格式化上下文](./14-bfc.md)
