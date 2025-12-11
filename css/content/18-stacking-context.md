# 第 18 章：层叠上下文原理

## 概述

层叠上下文（Stacking Context）决定元素在Z轴上的显示顺序，理解层叠上下文是处理元素重叠问题的关键。

---

## 一、什么是层叠上下文

### 1.1 定义

层叠上下文是一个三维概念，决定元素在Z轴（垂直于屏幕）上的层叠顺序。

```
屏幕
  ↑ Z轴
  │
  └─→ X轴
```

---

## 二、创建层叠上下文

### 2.1 创建条件

```css
/* 1. 根元素 <html> */

/* 2. position + z-index */
.box {
  position: relative;  /* absolute | fixed */
  z-index: 1;          /* 非auto */
}

/* 3. opacity */
.box {
  opacity: 0.99;       /* < 1 */
}

/* 4. transform */
.box {
  transform: translateZ(0);  /* 任意值 */
}

/* 5. filter */
.box {
  filter: blur(5px);   /* 任意值 */
}

/* 6. flex/grid子元素 + z-index */
.parent { display: flex; }
.child { z-index: 1; }

/* 7. will-change */
.box {
  will-change: opacity;  /* transform | opacity等 */
}

/* 8. isolation */
.box {
  isolation: isolate;
}
```

---

## 三、层叠顺序

### 3.1 同一层叠上下文内的顺序（从下到上）

```
1. 背景和边框（层叠上下文元素）
2. z-index为负值（定位元素）
3. 块级盒子（正常流）
4. 浮动盒子
5. 行内盒子（正常流）
6. z-index: 0（定位元素）
7. z-index为正值（定位元素）
```

### 3.2 可视化

```html
<div class="context">
  <div style="z-index: -1">负z-index</div>
  <div>正常流块</div>
  <div style="float: left">浮动</div>
  <span>行内元素</span>
  <div style="position: relative; z-index: 0">z-index:0</div>
  <div style="position: relative; z-index: 1">z-index:1</div>
</div>
```

---

## 四、层叠上下文的嵌套

### 4.1 父子关系

```html
<div class="parent" style="position: relative; z-index: 1;">
  <div class="child" style="position: relative; z-index: 999;">
    子元素
  </div>
</div>

<div class="sibling" style="position: relative; z-index: 2;">
  兄弟元素
</div>
```

**结果**：sibling在child上方，因为parent的z-index(1) < sibling的z-index(2)。

**规则**：子元素的z-index只在父级层叠上下文内有效。

---

## 五、常见问题

### 5.1 z-index不生效

**原因**：没有定位

```css
/* ❌ 无效 */
.box {
  z-index: 999;
  /* 缺少position */
}

/* ✅ 有效 */
.box {
  position: relative;
  z-index: 999;
}
```

### 5.2 高z-index仍被覆盖

**原因**：不在同一层叠上下文

```html
<div style="position: relative; z-index: 1;">
  <div style="position: relative; z-index: 9999;">A</div>
</div>

<div style="position: relative; z-index: 2;">
  <div>B</div>  <!-- B在A上方 -->
</div>
```

---

## 六、实用技巧

### 6.1 创建独立层

```css
.isolated {
  isolation: isolate;  /* 创建层叠上下文，不影响z-index */
}
```

### 6.2 模态框z-index

```css
.modal-backdrop {
  position: fixed;
  z-index: 1000;
}

.modal {
  position: fixed;
  z-index: 1001;
}
```

### 6.3 调试层叠问题

```javascript
// Chrome DevTools
// Elements → Computed → 查看 "Stacking Context"
```

---

## 七、最佳实践

### 7.1 z-index规范

```css
/* 定义z-index变量 */
:root {
  --z-dropdown: 100;
  --z-modal: 1000;
  --z-tooltip: 1100;
  --z-notification: 1200;
}

.dropdown { z-index: var(--z-dropdown); }
.modal { z-index: var(--z-modal); }
```

### 7.2 避免过大值

```css
/* ❌ 避免 */
.box { z-index: 999999; }

/* ✅ 推荐 */
.box { z-index: 10; }
```

---

## 参考资料

- [MDN - 层叠上下文](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [What No One Told You About Z-Index](https://philipwalton.com/articles/what-no-one-told-you-about-z-index/)

---

**导航**  
[上一章：第 17 章 - GFC网格格式化上下文](./17-gfc.md)  
[返回目录](../README.md)  
[下一章：第 19 章 - z-index详解](./19-z-index.md)
