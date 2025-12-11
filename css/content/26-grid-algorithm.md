# 第 26 章：Grid 布局算法

## 概述

Grid提供强大的二维布局能力，是现代CSS布局的首选。

---

## 一、基本概念

### 1.1 网格线

```
   1    2    3    4
1  ┌────┬────┬────┐
   │    │    │    │
2  ├────┼────┼────┤
   │    │    │    │
3  └────┴────┴────┘
```

---

## 二、容器属性

### 2.1 定义网格

```css
.container {
  display: grid;
  grid-template-columns: 100px 200px 100px;  /* 3列 */
  grid-template-rows: 50px auto 50px;        /* 3行 */
  gap: 10px;                                 /* 间距 */
}
```

### 2.2 fr单位

```css
.container {
  grid-template-columns: 1fr 2fr 1fr;
  /* 按比例分配：1/4  2/4  1/4 */
}
```

### 2.3 repeat()

```css
.container {
  grid-template-columns: repeat(3, 1fr);
  /* 等同于：1fr 1fr 1fr */
}
```

### 2.4 auto-fill vs auto-fit

```css
/* auto-fill：保留空轨道 */
grid-template-columns: repeat(auto-fill, 100px);

/* auto-fit：折叠空轨道 */
grid-template-columns: repeat(auto-fit, 100px);
```

---

## 三、项目属性

### 3.1 网格线定位

```css
.item {
  grid-column: 1 / 3;  /* 列：1-3 */
  grid-row: 1 / 2;     /* 行：1-2 */
}
```

### 3.2 跨越

```css
.item {
  grid-column: span 2;  /* 跨2列 */
  grid-row: span 3;     /* 跨3行 */
}
```

---

## 四、高级特性

### 4.1 网格区域

```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
```

### 4.2 minmax()

```css
.container {
  grid-template-columns: minmax(100px, 1fr) 2fr;
  /* 第一列：最小100px，最大1fr */
}
```

---

## 五、常见布局

### 5.1 响应式网格

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
```

### 5.2 圣杯布局

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "left main right"
    "footer footer footer";
  min-height: 100vh;
}
```

---

## 参考资料

- [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**导航**  
[上一章：第 25 章 - Flex属性详解](./25-flex-properties.md)  
[返回目录](../README.md)  
[下一章：第 27 章 - Grid对齐与放置](./27-grid-alignment.md)
