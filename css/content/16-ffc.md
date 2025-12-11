# 第 16 章：FFC 弹性格式化上下文

## 概述

FFC（Flex Formatting Context）是flex容器创建的格式化上下文，理解FFC有助于深入掌握flexbox布局。

---

## 一、什么是FFC

### 1.1 定义

当元素设置`display: flex`或`inline-flex`时，创建FFC。

```css
.container {
  display: flex;     /* 创建FFC */
}
```

---

## 二、FFC特性

### 2.1 子元素变为flex item

```html
<div class="container">
  <div class="item">A</div>
  <span class="item">B</span>  <!-- inline变为block-level -->
</div>
```

```css
.container {
  display: flex;
}

/* item的display被"块级化" */
.item {
  /* display: inline → block */
}
```

### 2.2 浮动和清除失效

```css
.container {
  display: flex;
}

.item {
  float: left;       /* 无效 */
  clear: both;       /* 无效 */
}
```

### 2.3 垂直外边距不合并

```css
.item1 { margin-bottom: 20px; }
.item2 { margin-top: 30px; }
/* flex布局中不合并，间距 = 50px */
```

---

## 三、主轴与交叉轴

### 3.1 轴的方向

```css
/* 主轴方向 */
.container {
  flex-direction: row;           /* 水平→ */
  flex-direction: row-reverse;   /* 水平← */
  flex-direction: column;        /* 垂直↓ */
  flex-direction: column-reverse;/* 垂直↑ */
}
```

### 3.2 对齐

```css
.container {
  /* 主轴对齐 */
  justify-content: flex-start;   /* 起点 */
  justify-content: center;       /* 居中 */
  justify-content: space-between;/* 两端 */
  
  /* 交叉轴对齐 */
  align-items: flex-start;
  align-items: center;
  align-items: stretch;          /* 拉伸（默认） */
}
```

---

## 四、flex item特性

### 4.1 flex属性

```css
.item {
  flex: 1;           /* flex-grow: 1, flex-shrink: 1, flex-basis: 0% */
  flex: auto;        /* 1 1 auto */
  flex: none;        /* 0 0 auto */
}
```

### 4.2 order排序

```css
.item1 { order: 2; }
.item2 { order: 1; }   /* 先显示 */
.item3 { order: 3; }
```

### 4.3 align-self

```css
.container { align-items: center; }

.special-item {
  align-self: flex-end;  /* 单独对齐 */
}
```

---

## 五、FFC vs BFC

### 5.1 区别

```
BFC：
- 垂直排列
- 外边距合并
- 清除浮动

FFC：
- 主轴排列（可水平/垂直）
- 外边距不合并
- 浮动失效
- flex特有属性
```

---

## 六、实用案例

### 6.1 水平垂直居中

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

### 6.2 等高列

```css
.container {
  display: flex;
}

.item {
  flex: 1;
  /* 自动等高 */
}
```

### 6.3 底部对齐

```css
.card {
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: auto;  /* 推到底部 */
}
```

---

## 参考资料

- [MDN - Flex Formatting Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)

---

**导航**  
[上一章：第 15 章 - IFC行内格式化上下文](./15-ifc.md)  
[返回目录](../README.md)  
[下一章：第 17 章 - GFC网格格式化上下文](./17-gfc.md)
