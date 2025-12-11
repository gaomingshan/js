# 第 27 章：Grid 对齐与放置

## 概述

Grid提供丰富的对齐选项，实现精确的元素定位。

---

## 一、对齐系统

### 1.1 项目在单元格内对齐

```css
.container {
  justify-items: start;  /* 水平：start | end | center | stretch */
  align-items: start;    /* 垂直：start | end | center | stretch */
}
```

### 1.2 单个项目对齐

```css
.item {
  justify-self: center;  /* 水平 */
  align-self: center;    /* 垂直 */
}
```

### 1.3 网格在容器内对齐

```css
.container {
  justify-content: center;  /* 水平 */
  align-content: center;    /* 垂直 */
}
```

---

## 二、自动放置

### 2.1 放置算法

```css
.container {
  grid-auto-flow: row;     /* 按行填充（默认） */
  grid-auto-flow: column;  /* 按列填充 */
  grid-auto-flow: dense;   /* 紧密填充 */
}
```

---

## 三、简写属性

### 3.1 place-items

```css
.container {
  place-items: center;  /* align-items + justify-items */
}
```

### 3.2 place-content

```css
.container {
  place-content: center;  /* align-content + justify-content */
}
```

### 3.3 place-self

```css
.item {
  place-self: center;  /* align-self + justify-self */
}
```

---

## 参考资料

- [MDN - Box Alignment in Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Alignment/Box_Alignment_In_Grid_Layout)

---

**导航**  
[上一章：第 26 章 - Grid布局算法](./26-grid-algorithm.md)  
[返回目录](../README.md)  
[下一章：第 28 章 - 媒体查询原理](./28-media-queries.md)
