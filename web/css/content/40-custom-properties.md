# 第 40 章：自定义属性

## 概述

CSS自定义属性（CSS变量）提供可复用的值，支持动态修改。

---

## 一、定义与使用

### 1.1 基本语法

```css
:root {
  --main-color: #3b82f6;
  --spacing: 20px;
}

.box {
  color: var(--main-color);
  padding: var(--spacing);
}
```

---

## 二、作用域

### 2.1 全局变量

```css
:root {
  --primary: blue;
}
```

### 2.2 局部变量

```css
.container {
  --gap: 10px;
}

.item {
  margin: var(--gap);  /* 继承父元素变量 */
}
```

---

## 三、fallback值

### 3.1 默认值

```css
.box {
  color: var(--text-color, #333);  /* --text-color不存在时用#333 */
}
```

---

## 四、动态修改

### 4.1 JavaScript

```javascript
// 设置变量
document.documentElement.style.setProperty('--main-color', 'red');

// 读取变量
const color = getComputedStyle(document.documentElement)
  .getPropertyValue('--main-color');
```

---

## 五、实用案例

### 5.1 主题切换

```css
:root {
  --bg-color: white;
  --text-color: black;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: white;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

---

## 参考资料

- [MDN - CSS Variables](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)

---

**导航**  
[上一章：第 39 章 - 混合模式](./39-blend-modes.md)  
[返回目录](../README.md)  
[下一章：第 41 章 - 动态主题实现](./41-theme-implementation.md)
