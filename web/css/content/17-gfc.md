# 第 17 章：GFC 网格格式化上下文

## 概述

GFC（Grid Formatting Context）是grid容器创建的格式化上下文，提供强大的二维布局能力。

---

## 一、什么是GFC

### 1.1 定义

当元素设置`display: grid`或`inline-grid`时，创建GFC。

```css
.container {
  display: grid;     /* 创建GFC */
}
```

---

## 二、GFC特性

### 2.1 子元素变为grid item

```html
<div class="container">
  <div>A</div>
  <span>B</span>  <!-- inline变为block-level -->
</div>
```

```css
.container {
  display: grid;
}

/* 子元素被"块级化" */
```

### 2.2 浮动和定位失效

```css
.container {
  display: grid;
}

.item {
  float: left;       /* 无效 */
  vertical-align: middle;  /* 无效 */
}
```

### 2.3 外边距不合并

```css
.item1 { margin-bottom: 20px; }
.item2 { margin-top: 30px; }
/* grid布局中不合并 */
```

---

## 三、网格轨道

### 3.1 显式网格

```css
.container {
  display: grid;
  grid-template-columns: 100px 200px 100px;  /* 3列 */
  grid-template-rows: 50px auto 50px;        /* 3行 */
}
```

### 3.2 隐式网格

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px;
  grid-auto-rows: 50px;  /* 超出部分自动创建行 */
}
```

---

## 四、对齐系统

### 4.1 项目对齐

```css
.container {
  /* 单元格内对齐 */
  justify-items: start;    /* 水平 */
  align-items: start;      /* 垂直 */
}

.item {
  /* 单独对齐 */
  justify-self: center;
  align-self: center;
}
```

### 4.2 网格对齐

```css
.container {
  /* 网格在容器内对齐 */
  justify-content: center;   /* 水平 */
  align-content: center;     /* 垂直 */
}
```

---

## 五、GFC vs FFC

### 5.1 区别

```
FFC（Flex）：
- 一维布局（主轴）
- 内容决定布局

GFC（Grid）：
- 二维布局（行列）
- 布局决定内容
- 精确控制
```

---

## 六、实用案例

### 6.1 响应式网格

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
```

### 6.2 完美居中

```css
.container {
  display: grid;
  place-items: center;  /* align-items + justify-items */
  height: 100vh;
}
```

---

## 参考资料

- [MDN - Grid Layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)

---

**导航**  
[上一章：第 16 章 - FFC弹性格式化上下文](./16-ffc.md)  
[返回目录](../README.md)  
[下一章：第 18 章 - 层叠上下文原理](./18-stacking-context.md)
