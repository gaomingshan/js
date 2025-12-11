# 第 32 章：图层与合成

## 概述

合成层（Composite Layer）是现代浏览器性能优化的关键，理解图层机制能够创建高性能动画。

---

## 一、合成层

### 1.1 什么是合成层

独立的渲染层，在GPU中处理，互不影响。

---

## 二、创建合成层

### 2.1 触发条件

```css
/* 1. 3D transform */
.layer { transform: translateZ(0); }
.layer { transform: translate3d(0, 0, 0); }

/* 2. will-change */
.layer { will-change: transform; }
.layer { will-change: opacity; }

/* 3. video、canvas、iframe */

/* 4. CSS动画/过渡（transform/opacity） */
.layer {
  animation: slide 1s;
}

/* 5. position: fixed */
.layer { position: fixed; }

/* 6. filter */
.layer { filter: blur(10px); }
```

---

## 三、GPU加速

### 3.1 优化属性

```css
/* ✅ GPU加速（不触发重排） */
transform
opacity

/* ❌ 触发重排 */
width, height, left, top, margin, padding
```

---

## 四、will-change

### 4.1 用法

```css
.box {
  will-change: transform;  /* 提前告知浏览器 */
}

.box:hover {
  transform: scale(1.2);
}
```

### 4.2 注意事项

```css
/* ❌ 不要滥用 */
* { will-change: transform; }  /* 消耗内存 */

/* ✅ 按需使用 */
.animated {
  will-change: transform;
}
```

---

## 五、层爆炸问题

### 5.1 问题

过多合成层导致内存消耗。

### 5.2 解决

```css
/* ❌ 避免 */
.item {
  transform: translateZ(0);  /* 每个都创建层 */
}

/* ✅ 仅动画元素 */
.item.animating {
  transform: translateZ(0);
}
```

---

## 参考资料

- [Compositing and Layers](https://developer.chrome.com/blog/inside-browser-part3/)

---

**导航**  
[上一章：第 31 章 - 布局与绘制](./31-layout-paint.md)  
[返回目录](../README.md)  
[下一章：第 33 章 - transform与opacity优化](./33-transform-opacity.md)
