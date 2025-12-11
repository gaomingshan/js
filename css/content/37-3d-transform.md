# 第 37 章：3D 变换

## 概述

CSS 3D变换提供立体空间的变换能力。

---

## 一、3D变换函数

### 1.1 translate3d

```css
.box {
  transform: translateZ(100px);
  transform: translate3d(50px, 100px, 150px);
}
```

### 1.2 rotate3d

```css
.box {
  transform: rotateX(45deg);
  transform: rotateY(45deg);
  transform: rotateZ(45deg);
  transform: rotate3d(1, 1, 0, 45deg);
}
```

### 1.3 scale3d

```css
.box {
  transform: scaleZ(2);
  transform: scale3d(1.5, 2, 1);
}
```

---

## 二、perspective（透视）

### 2.1 透视距离

```css
.parent {
  perspective: 1000px;  /* 观察距离 */
}

.child {
  transform: rotateY(45deg);
}
```

### 2.2 透视原点

```css
.parent {
  perspective: 1000px;
  perspective-origin: 50% 50%;  /* 默认中心 */
}
```

---

## 三、transform-style

### 3.1 保留3D空间

```css
.parent {
  transform-style: preserve-3d;  /* 保留3D */
  /* transform-style: flat; */   /* 默认，扁平 */
}
```

---

## 四、backface-visibility

### 4.1 背面可见性

```css
.box {
  backface-visibility: hidden;   /* 背面隐藏 */
  /* backface-visibility: visible; */ /* 默认 */
}
```

---

## 五、实用案例

### 5.1 3D立方体

```css
.cube {
  width: 200px;
  height: 200px;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 10s infinite linear;
}

.cube-face {
  position: absolute;
  width: 200px;
  height: 200px;
  opacity: 0.9;
}

.front { transform: translateZ(100px); }
.back { transform: translateZ(-100px) rotateY(180deg); }
.right { transform: rotateY(90deg) translateZ(100px); }
.left { transform: rotateY(-90deg) translateZ(100px); }
.top { transform: rotateX(90deg) translateZ(100px); }
.bottom { transform: rotateX(-90deg) translateZ(100px); }

@keyframes rotate {
  to { transform: rotateX(360deg) rotateY(360deg); }
}
```

---

## 参考资料

- [MDN - CSS Transforms](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transforms)

---

**导航**  
[上一章：第 36 章 - 2D变换](./36-2d-transform.md)  
[返回目录](../README.md)  
[下一章：第 38 章 - Filter滤镜](./38-filter.md)
