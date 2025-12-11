# 第 8 章：继承机制

## 概述

继承是CSS的核心特性之一，某些属性会从父元素自动传递给子元素。理解继承机制能够编写更简洁的CSS。

---

## 一、什么是继承

### 1.1 继承定义

子元素自动获得父元素的某些属性值：

```html
<div style="color: blue;">
  <p>这段文字是蓝色的</p>  <!-- 继承color -->
</div>
```

```css
body {
  color: #333;
  font-size: 16px;
}

/* 所有子元素继承 color 和 font-size */
p { /* color: #333; font-size: 16px; */ }
```

---

## 二、可继承属性

### 2.1 文本相关

```css
/* 可继承 */
color
font-family
font-size
font-weight
font-style
line-height
text-align
text-indent
letter-spacing
word-spacing
white-space
direction
```

### 2.2 列表相关

```css
/* 可继承 */
list-style-type
list-style-position
list-style-image
list-style
```

### 2.3 其他可继承属性

```css
/* 可继承 */
cursor
visibility
quotes
```

---

## 三、不可继承属性

### 3.1 盒模型

```css
/* 不可继承 */
width, height
margin, padding
border
```

### 3.2 定位与布局

```css
/* 不可继承 */
position
top, right, bottom, left
float
display
overflow
```

### 3.3 背景与装饰

```css
/* 不可继承 */
background
box-shadow
border-radius
transform
```

---

## 四、控制继承

### 4.1 inherit - 强制继承

```css
/* 强制继承父元素的属性 */
.box {
  border: inherit;      /* 继承父元素border */
  margin: inherit;      /* 继承父元素margin */
}
```

**示例**：

```html
<div style="border: 2px solid red;">
  <p style="border: inherit;">继承红色边框</p>
</div>
```

### 4.2 initial - 初始值

```css
/* 重置为CSS规范定义的初始值 */
.text {
  color: initial;       /* 重置为black */
  font-size: initial;   /* 重置为medium */
}
```

### 4.3 unset - 重置

```css
/* 可继承属性 → inherit，不可继承 → initial */
.box {
  color: unset;         /* 等同于 inherit */
  border: unset;        /* 等同于 initial */
}
```

### 4.4 revert - 还原

```css
/* 还原到浏览器默认样式 */
.box {
  display: revert;      /* 还原浏览器默认 */
}
```

---

## 五、继承的特殊值

### 5.1 currentColor

```css
/* 使用当前color值 */
.box {
  color: blue;
  border-color: currentColor;  /* 边框颜色=blue */
  box-shadow: 0 0 10px currentColor;
}
```

**实用场景**：

```css
.icon {
  color: red;
  fill: currentColor;    /* SVG颜色跟随文字 */
}
```

### 5.2 inherit关键字的妙用

```css
/* 按钮继承父容器颜色 */
.theme-dark {
  color: white;
}

.theme-dark .btn {
  color: inherit;        /* 白色 */
  border-color: currentColor;
}
```

---

## 六、继承的优先级

### 6.1 继承值优先级最低

```css
/* 优先级：继承 < 通配符 < 标签选择器 */
body { color: blue; }    /* 继承 */
* { color: green; }      /* 通配符胜出 */
p { color: red; }        /* 标签选择器胜出 */
```

### 6.2 显式继承优先级正常

```css
body { color: blue; }
p {
  color: inherit;        /* 蓝色，正常优先级 */
}
```

---

## 七、实用技巧

### 7.1 全局字体设置

```css
/* 根元素设置字体 */
html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

/* 所有元素自动继承 */
```

### 7.2 主题切换

```css
/* 使用继承实现主题 */
.theme-light {
  color: #333;
  background: #fff;
}

.theme-dark {
  color: #fff;
  background: #333;
}

/* 子元素自动跟随 */
a { color: inherit; }
```

### 7.3 重置继承

```css
/* 阻止继承 */
.isolated {
  all: initial;          /* 重置所有属性 */
}

.independent {
  all: unset;            /* 重置所有属性 */
}
```

---

## 八、常见问题

### 8.1 为什么有些属性不继承？

**原因**：盒模型、定位等属性继承会导致布局混乱。

```css
/* 如果margin可继承 */
.parent { margin: 20px; }
.child { /* margin: 20px */ }  /* 层层叠加，布局崩溃 */
```

### 8.2 如何查看继承值？

**Chrome DevTools**：
```
1. 检查元素
2. Computed标签
3. 查看"Inherited from"部分
```

---

## 九、最佳实践

### 9.1 利用继承简化代码

```css
/* ✅ 好：在父元素设置 */
body {
  font-family: Arial;
  color: #333;
  line-height: 1.6;
}

/* ❌ 避免：重复设置 */
h1, h2, h3, p, div, span {
  font-family: Arial;
  color: #333;
}
```

### 9.2 显式声明重要属性

```css
/* ✅ 好：显式声明 */
button {
  font-family: inherit;  /* 明确继承 */
  font-size: inherit;
}

/* ❌ 避免：依赖隐式继承 */
/* 某些元素（如button）不会自动继承font-family */
```

---

## 参考资料

- [MDN - 继承](https://developer.mozilla.org/zh-CN/docs/Web/CSS/inheritance)
- [CSS Inheritance Specification](https://www.w3.org/TR/css-cascade-4/#inheritance)

---

**导航**  
[上一章：第 7 章 - 层叠算法详解](./07-cascade.md)  
[返回目录](../README.md)  
[下一章：第 9 章 - 样式值计算过程](./09-computed-values.md)
