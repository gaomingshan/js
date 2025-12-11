# 第 36 章：2D 变换

## 概述

CSS 2D变换提供旋转、缩放、平移、倾斜等变换能力。

---

## 一、transform属性

### 1.1 基本语法

```css
.box {
  transform: function(value);
}
```

---

## 二、变换函数

### 2.1 translate（平移）

```css
.box {
  transform: translateX(50px);      /* X轴 */
  transform: translateY(100px);     /* Y轴 */
  transform: translate(50px, 100px);/* X, Y */
}
```

### 2.2 scale（缩放）

```css
.box {
  transform: scaleX(1.5);          /* X轴 */
  transform: scaleY(2);            /* Y轴 */
  transform: scale(1.5, 2);        /* X, Y */
  transform: scale(1.5);           /* 等比例 */
}
```

### 2.3 rotate（旋转）

```css
.box {
  transform: rotate(45deg);        /* 顺时针45度 */
  transform: rotate(-45deg);       /* 逆时针45度 */
}
```

### 2.4 skew（倾斜）

```css
.box {
  transform: skewX(10deg);         /* X轴倾斜 */
  transform: skewY(20deg);         /* Y轴倾斜 */
  transform: skew(10deg, 20deg);   /* X, Y */
}
```

---

## 三、组合变换

### 3.1 多个函数

```css
.box {
  transform: translate(50px, 100px) rotate(45deg) scale(1.5);
}
```

> 📌 **注意**：变换顺序影响结果！

---

## 四、transform-origin

### 4.1 变换原点

```css
.box {
  transform-origin: center;        /* 默认 */
  transform-origin: top left;
  transform-origin: 50% 50%;
  transform-origin: 100px 50px;
}
```

---

## 五、实用案例

### 5.1 卡片翻转

```css
.card {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card:hover {
  transform: rotateY(180deg);
}
```

---

## 参考资料

- [MDN - transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform)

---

**导航**  
[上一章：第 35 章 - 动画性能优化](./35-animation-performance.md)  
[返回目录](../README.md)  
[下一章：第 37 章 - 3D变换](./37-3d-transform.md)
