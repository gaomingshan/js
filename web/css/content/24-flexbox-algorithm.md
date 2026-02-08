# 第 24 章：Flexbox 布局算法

## 概述

Flexbox是现代CSS布局的核心技术，提供强大的一维布局能力。

---

## 一、基本概念

### 1.1 主轴与交叉轴

```
主轴（Main Axis）→
┌─────────────────────────┐
│ ↓                       │
│ 交叉轴                   │
│ (Cross Axis)            │
└─────────────────────────┘
```

```css
.container {
  display: flex;
  flex-direction: row;  /* 主轴水平 */
}
```

---

## 二、容器属性

### 2.1 flex-direction

```css
.container {
  flex-direction: row;           /* 水平→ */
  flex-direction: row-reverse;   /* 水平← */
  flex-direction: column;        /* 垂直↓ */
  flex-direction: column-reverse;/* 垂直↑ */
}
```

### 2.2 flex-wrap

```css
.container {
  flex-wrap: nowrap;    /* 不换行（默认） */
  flex-wrap: wrap;      /* 换行 */
  flex-wrap: wrap-reverse; /* 反向换行 */
}
```

### 2.3 justify-content（主轴对齐）

```css
.container {
  justify-content: flex-start;    /* 起点 */
  justify-content: flex-end;      /* 终点 */
  justify-content: center;        /* 居中 */
  justify-content: space-between; /* 两端对齐 */
  justify-content: space-around;  /* 环绕 */
  justify-content: space-evenly;  /* 均匀 */
}
```

### 2.4 align-items（交叉轴对齐）

```css
.container {
  align-items: flex-start;  /* 起点 */
  align-items: flex-end;    /* 终点 */
  align-items: center;      /* 居中 */
  align-items: baseline;    /* 基线 */
  align-items: stretch;     /* 拉伸（默认） */
}
```

---

## 三、项目属性

### 3.1 flex简写

```css
.item {
  flex: 1;           /* flex: 1 1 0% */
  flex: auto;        /* flex: 1 1 auto */
  flex: none;        /* flex: 0 0 auto */
}
```

### 3.2 flex-grow（放大）

```css
.item1 { flex-grow: 1; }  /* 占1份 */
.item2 { flex-grow: 2; }  /* 占2份 */
```

### 3.3 flex-shrink（缩小）

```css
.item {
  flex-shrink: 1;  /* 默认，可缩小 */
  flex-shrink: 0;  /* 不缩小 */
}
```

### 3.4 flex-basis（基准大小）

```css
.item {
  flex-basis: auto;   /* 默认 */
  flex-basis: 200px;  /* 固定大小 */
  flex-basis: 0;      /* 忽略内容 */
}
```

---

## 四、常见布局

### 4.1 水平垂直居中

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 4.2 等分布局

```css
.container { display: flex; }
.item { flex: 1; }
```

### 4.3 固定+自适应

```css
.sidebar { flex: 0 0 200px; }  /* 固定 */
.main { flex: 1; }              /* 自适应 */
```

---

## 参考资料

- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

**导航**  
[上一章：第 23 章 - 清除浮动](./23-clearing-float.md)  
[返回目录](../README.md)  
[下一章：第 25 章 - Flex属性详解](./25-flex-properties.md)
