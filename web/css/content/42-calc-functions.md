# 第 42 章：计算函数

## 概述

CSS计算函数提供动态值计算能力。

---

## 一、calc()

### 1.1 基本用法

```css
.box {
  width: calc(100% - 80px);
  height: calc(100vh - 60px);
  padding: calc(1rem + 10px);
}
```

---

## 二、min() / max()

### 2.1 最小值/最大值

```css
.box {
  width: min(100%, 500px);  /* 取最小值 */
  height: max(200px, 50vh); /* 取最大值 */
}
```

---

## 三、clamp()

### 3.1 限制范围

```css
.box {
  /* clamp(最小值, 首选值, 最大值) */
  font-size: clamp(1rem, 2vw, 3rem);
  width: clamp(300px, 50%, 800px);
}
```

---

## 四、实用案例

### 4.1 响应式字体

```css
h1 {
  font-size: clamp(1.5rem, 2vw + 1rem, 3rem);
}
```

### 4.2 流式容器

```css
.container {
  width: clamp(320px, 90%, 1200px);
  margin: 0 auto;
}
```

---

## 参考资料

- [MDN - calc()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/calc)
- [MDN - clamp()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clamp)

---

**导航**  
[上一章：第 41 章 - 动态主题实现](./41-theme-implementation.md)  
[返回目录](../README.md)  
[下一章：第 43 章 - 图形函数](./43-shape-functions.md)
