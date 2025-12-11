# 第 43 章：图形函数

## 概述

CSS图形函数用于创建复杂的形状和路径。

---

## 一、clip-path

### 1.1 裁剪形状

```css
/* 圆形 */
.circle { clip-path: circle(50%); }

/* 椭圆 */
.ellipse { clip-path: ellipse(50% 30%); }

/* 矩形 */
.rect { clip-path: inset(10px 20px 30px 40px); }

/* 多边形 */
.triangle { 
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%); 
}
```

---

## 二、shape-outside

### 2.1 文字环绕

```css
.image {
  float: left;
  shape-outside: circle(50%);
  clip-path: circle(50%);
}
```

---

## 三、path()

### 3.1 SVG路径

```css
.box {
  clip-path: path('M 0 0 L 100 0 L 100 100 Z');
}
```

---

## 四、实用案例

### 4.1 六边形

```css
.hexagon {
  width: 200px;
  height: 200px;
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
}
```

---

## 参考资料

- [MDN - clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path)
- [CSS Shapes](https://css-tricks.com/almanac/properties/c/clip-path/)

---

**导航**  
[上一章：第 42 章 - 计算函数](./42-calc-functions.md)  
[返回目录](../README.md)  
[下一章：第 44 章 - CSS方法论](./44-css-methodology.md)
