# 第 34 章：Transition 与 Animation 原理

## 概述

CSS过渡和动画提供声明式的动画能力，理解其原理能够创建流畅的交互效果。

---

## 一、Transition

### 1.1 基本用法

```css
.box {
  transition: property duration timing-function delay;
}

.box {
  transition: all 0.3s ease 0s;
}
```

### 1.2 多属性过渡

```css
.box {
  transition: 
    width 0.3s ease,
    height 0.3s ease 0.1s,
    opacity 0.5s linear;
}
```

---

## 二、Animation

### 2.1 定义动画

```css
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* 或 */
@keyframes slide {
  0% { transform: translateX(0); }
  50% { transform: translateX(50px); }
  100% { transform: translateX(100px); }
}
```

### 2.2 应用动画

```css
.box {
  animation: slide 1s ease infinite;
}

/* 完整写法 */
.box {
  animation-name: slide;
  animation-duration: 1s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: normal;
  animation-fill-mode: none;
  animation-play-state: running;
}
```

---

## 三、timing-function

### 3.1 预设值

```css
ease            /* 默认，慢-快-慢 */
linear          /* 匀速 */
ease-in         /* 慢-快 */
ease-out        /* 快-慢 */
ease-in-out     /* 慢-快-慢 */
```

### 3.2 cubic-bezier

```css
.box {
  transition-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
}
```

### 3.3 steps

```css
.box {
  animation-timing-function: steps(4, end);
  /* 分4步，跳跃式 */
}
```

---

## 四、性能优化

### 4.1 使用transform/opacity

```css
/* ✅ 推荐 */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* ❌ 避免 */
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}
```

### 4.2 will-change

```css
.box {
  will-change: transform;
  animation: slide 1s;
}
```

---

## 参考资料

- [MDN - CSS Transitions](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transitions)
- [MDN - CSS Animations](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Animations)

---

**导航**  
[上一章：第 33 章 - transform与opacity优化](./33-transform-opacity.md)  
[返回目录](../README.md)  
[下一章：第 35 章 - 动画性能优化](./35-animation-performance.md)
