# 第 33 章：transform 与 opacity 优化

## 概述

transform和opacity是性能最佳的动画属性，理解其优化原理能够创建流畅的动画。

---

## 一、为什么高效

### 1.1 原理

```
transform/opacity变化：
1. 创建合成层
2. GPU处理
3. 只触发合成，不触发重排/重绘
```

---

## 二、transform优化

### 2.1 替代方案

```css
/* ❌ 触发重排 */
.box {
  left: 100px;
  top: 50px;
}

/* ✅ 只触发合成 */
.box {
  transform: translate(100px, 50px);
}
```

### 2.2 3D加速

```css
/* 强制GPU加速 */
.box {
  transform: translateZ(0);
  /* 或 */
  transform: translate3d(0, 0, 0);
}
```

---

## 三、opacity优化

### 3.1 替代visibility

```css
/* ❌ 触发重绘 */
.box { visibility: hidden; }

/* ✅ 触发合成 */
.box { opacity: 0; }
```

---

## 四、动画最佳实践

### 4.1 使用transform

```css
/* ✅ 推荐 */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

### 4.2 组合使用

```css
.box {
  transition: transform 0.3s, opacity 0.3s;
}

.box:hover {
  transform: scale(1.1) rotate(5deg);
  opacity: 0.8;
}
```

---

## 参考资料

- [High Performance Animations](https://web.dev/animations-guide/)

---

**导航**  
[上一章：第 32 章 - 图层与合成](./32-layer-composite.md)  
[返回目录](../README.md)  
[下一章：第 34 章 - Transition与Animation原理](./34-transition-animation.md)
