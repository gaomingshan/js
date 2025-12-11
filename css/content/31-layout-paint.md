# 第 31 章：布局与绘制

## 概述

布局（Layout）和绘制（Paint）是渲染的核心阶段，理解这两个过程对性能优化至关重要。

---

## 一、布局（Layout/Reflow）

### 1.1 什么是布局

计算元素的几何信息（位置、大小）。

### 1.2 触发布局的操作

```javascript
// 修改几何属性
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '10px';
element.style.border = '1px solid';

// 读取几何属性（强制布局）
element.offsetWidth;
element.offsetHeight;
element.clientWidth;
element.getBoundingClientRect();
getComputedStyle(element).width;
```

---

## 二、绘制（Paint）

### 2.1 什么是绘制

将渲染对象绘制成像素。

### 2.2 触发绘制的操作

```css
/* 修改视觉属性 */
color
background
box-shadow
border-radius
visibility
```

---

## 三、性能影响

### 3.1 性能消耗

```
重排（Layout）> 重绘（Paint）> 合成（Composite）
```

### 3.2 优化策略

```css
/* ❌ 触发重排 */
.box {
  width: 100px;
  left: 50px;
}

/* ✅ 只触发合成 */
.box {
  transform: translateX(50px) scale(1.5);
}
```

---

## 四、避免布局抖动

### 4.1 Layout Thrashing

```javascript
// ❌ 布局抖动
for (let i = 0; i < elements.length; i++) {
  const height = elements[i].offsetHeight;  // 读
  elements[i].style.height = height + 10 + 'px';  // 写
}

// ✅ 批量读写
const heights = [];
for (let i = 0; i < elements.length; i++) {
  heights[i] = elements[i].offsetHeight;  // 批量读
}
for (let i = 0; i < elements.length; i++) {
  elements[i].style.height = heights[i] + 10 + 'px';  // 批量写
}
```

---

## 五、最佳实践

### 5.1 使用CSS而非JavaScript

```css
/* ✅ 推荐 */
.box {
  transition: transform 0.3s;
}
.box:hover {
  transform: scale(1.1);
}
```

```javascript
// ❌ 避免
element.addEventListener('mouseover', () => {
  element.style.width = '110%';
});
```

---

## 参考资料

- [Rendering Performance](https://web.dev/rendering-performance/)

---

**导航**  
[上一章：第 30 章 - 渲染树构建](./30-render-tree.md)  
[返回目录](../README.md)  
[下一章：第 32 章 - 图层与合成](./32-layer-composite.md)
