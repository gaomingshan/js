# 第 29 章：响应式单位

## 概述

响应式单位能够根据视口大小自动调整，是实现响应式设计的重要工具。

---

## 一、视口单位

### 1.1 基本单位

```css
.box {
  width: 50vw;       /* 视口宽度的50% */
  height: 100vh;     /* 视口高度的100% */
  font-size: 5vmin;  /* min(5vw, 5vh) */
  padding: 2vmax;    /* max(2vw, 2vh) */
}
```

---

## 二、相对单位

### 2.1 rem

```css
html { font-size: 16px; }

.text {
  font-size: 1.5rem;  /* 24px */
  padding: 1rem;      /* 16px */
}
```

### 2.2 em

```css
.parent { font-size: 16px; }
.child {
  font-size: 1.5em;   /* 24px */
  padding: 1em;       /* 24px（相对自身font-size） */
}
```

---

## 三、响应式字体

### 3.1 clamp()

```css
.text {
  font-size: clamp(1rem, 2vw + 1rem, 3rem);
  /* 最小1rem，首选2vw+1rem，最大3rem */
}
```

### 3.2 calc()

```css
.text {
  font-size: calc(16px + 2vw);
}
```

---

## 四、容器查询单位

### 4.1 新单位（CSS Container Queries）

```css
.container {
  container-type: inline-size;
}

.child {
  font-size: 5cqi;   /* 容器inline-size的5% */
  width: 50cqw;      /* 容器宽度的50% */
}
```

---

## 五、最佳实践

### 5.1 响应式布局

```css
.container {
  width: clamp(320px, 90vw, 1200px);
  padding: clamp(1rem, 2vw, 3rem);
}
```

### 5.2 响应式排版

```css
h1 {
  font-size: clamp(1.5rem, 2vw + 1rem, 3rem);
  line-height: 1.2;
}

p {
  font-size: clamp(1rem, 1vw + 0.5rem, 1.25rem);
}
```

---

## 参考资料

- [MDN - CSS Values and Units](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Values_and_Units)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)

---

**导航**  
[上一章：第 28 章 - 媒体查询原理](./28-media-queries.md)  
[返回目录](../README.md)  
[下一章：第 30 章 - 渲染树构建](./30-render-tree.md)
