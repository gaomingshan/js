# 第 19 章：z-index 详解

## 概述

z-index控制定位元素在Z轴上的层叠顺序。深入理解z-index能够避免常见的层叠问题。

---

## 一、z-index基础

### 1.1 语法

```css
.box {
  position: relative;  /* 必须有定位 */
  z-index: 10;         /* 整数，可为负 */
}
```

### 1.2 有效范围

```css
/* 有效 */
position: relative;
position: absolute;
position: fixed;
position: sticky;

/* 无效 */
position: static;  /* 默认值，z-index不生效 */
```

---

## 二、z-index值

### 2.1 数值类型

```css
.box {
  z-index: 0;        /* 默认 */
  z-index: 1;        /* 正值 */
  z-index: -1;       /* 负值 */
  z-index: 999;      /* 大数值 */
}
```

### 2.2 auto值

```css
.box {
  z-index: auto;     /* 默认，不创建层叠上下文 */
}
```

**auto vs 0**：
- `auto`：不创建新层叠上下文
- `0`：创建新层叠上下文

---

## 三、z-index比较规则

### 3.1 同一层叠上下文

```html
<div class="parent">
  <div style="position: relative; z-index: 1;">A</div>
  <div style="position: relative; z-index: 2;">B</div>
  <div style="position: relative; z-index: 3;">C</div>
</div>
```

**顺序**：C > B > A

### 3.2 不同层叠上下文

```html
<div style="position: relative; z-index: 1;">
  <div style="position: relative; z-index: 9999;">A</div>
</div>

<div style="position: relative; z-index: 2;">
  <div>B</div>
</div>
```

**结果**：B在A上方（比较父级z-index）

---

## 四、负z-index

### 4.1 用途

```css
.background {
  position: absolute;
  z-index: -1;       /* 在正常流下方 */
  background: url(bg.jpg);
}
```

### 4.2 层叠顺序

```
层叠上下文背景
  ↓
z-index: -1
  ↓
正常流元素
  ↓
z-index: 0
  ↓
z-index: 1+
```

---

## 五、flex/grid中的z-index

### 5.1 特殊行为

```css
.parent {
  display: flex;     /* 或 grid */
}

.child {
  /* 不需要position，z-index就生效 */
  z-index: 1;
}
```

---

## 六、常见陷阱

### 6.1 忘记定位

```css
/* ❌ 无效 */
.box {
  z-index: 999;
}

/* ✅ 有效 */
.box {
  position: relative;
  z-index: 999;
}
```

### 6.2 层叠上下文隔离

```css
/* A和B在不同层叠上下文，无法直接比较 */
.parent1 {
  position: relative;
  z-index: 1;
}

.A {
  position: relative;
  z-index: 9999;  /* 仅在parent1内有效 */
}

.parent2 {
  position: relative;
  z-index: 2;
}

.B {
  position: relative;
  z-index: 1;     /* B仍在A上方 */
}
```

### 6.3 transform创建层叠上下文

```css
.parent {
  transform: translateZ(0);  /* 创建层叠上下文 */
}

.child {
  position: fixed;
  z-index: 9999;   /* 受限于parent */
}
```

---

## 七、最佳实践

### 7.1 z-index管理

```css
/* 定义z-index层级 */
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}
```

### 7.2 避免过大值

```css
/* ❌ 不好 */
.modal { z-index: 999999; }

/* ✅ 好 */
.modal { z-index: var(--z-modal); }
```

### 7.3 最小化使用

```css
/* ✅ 优先考虑DOM顺序 */
<div>A</div>
<div>B</div>  <!-- 自然在A上方 -->

/* ⚠️ 必要时才用z-index */
```

---

## 八、调试技巧

### 8.1 Chrome DevTools

```
1. Elements → Computed
2. 搜索 "z-index"
3. 查看层叠上下文
```

### 8.2 可视化层级

```css
/* 临时调试 */
* {
  outline: 1px solid red;
}

[style*="z-index"] {
  outline: 2px solid blue;
}
```

---

## 九、解决层叠问题步骤

### 9.1 诊断流程

```
1. 检查是否有定位（position）
2. 检查是否在同一层叠上下文
3. 检查父元素是否创建了层叠上下文
4. 比较z-index值
5. 检查DOM顺序
```

### 9.2 常用解决方案

```css
/* 方案1：调整z-index */
.fix { z-index: 10; }

/* 方案2：创建新层叠上下文 */
.fix { isolation: isolate; }

/* 方案3：提升DOM层级 */
/* 移动到body下 */

/* 方案4：移除不必要的层叠上下文 */
.parent {
  /* transform: translateZ(0); */ /* 移除 */
}
```

---

## 参考资料

- [MDN - z-index](https://developer.mozilla.org/zh-CN/docs/Web/CSS/z-index)
- [Understanding Z-Index](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index)

---

**导航**  
[上一章：第 18 章 - 层叠上下文原理](./18-stacking-context.md)  
[返回目录](../README.md)  
[下一章：第 20 章 - 定位原理](./20-positioning.md)
