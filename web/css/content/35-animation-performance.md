# 第 35 章：动画性能优化

## 概述

创建60fps流畅动画的关键技术和最佳实践。

---

## 一、60fps目标

### 1.1 帧率计算

```
60fps → 16.67ms/帧
浏览器处理约6ms
留给JS/CSS约10ms
```

---

## 二、性能优化技巧

### 2.1 使用transform/opacity

```css
/* ✅ GPU加速 */
.box {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ 触发重排 */
.box {
  left: 100px;
  visibility: hidden;
}
```

### 2.2 避免Layout Thrashing

```javascript
// ❌ 读写交替
elements.forEach(el => {
  const height = el.offsetHeight;
  el.style.height = height + 10 + 'px';
});

// ✅ 批量读写
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});
```

### 2.3 使用requestAnimationFrame

```javascript
function animate() {
  element.style.transform = `translateX(${x}px)`;
  x += 1;
  if (x < 100) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

---

## 三、will-change

### 3.1 正确使用

```css
/* ✅ 动画前声明 */
.box {
  will-change: transform;
}

/* ✅ JS动态添加 */
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform';
});

element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

---

## 四、调试工具

### 4.1 Chrome DevTools

```
Performance → 录制 → 查看FPS
Rendering → Frame Rendering Stats
```

---

## 五、最佳实践清单

```
✅ 使用transform/opacity
✅ 添加will-change
✅ 使用requestAnimationFrame
✅ 避免频繁读取布局属性
✅ 减少动画元素数量
✅ 使用CSS动画优于JS
✅ 避免复杂选择器
```

---

## 参考资料

- [Web Performance](https://web.dev/rendering-performance/)
- [Accelerated Rendering in Chrome](https://www.html5rocks.com/en/tutorials/speed/layers/)

---

**导航**  
[上一章：第 34 章 - Transition与Animation原理](./34-transition-animation.md)  
[返回目录](../README.md)  
[下一章：第 36 章 - 2D变换](./36-2d-transform.md)
