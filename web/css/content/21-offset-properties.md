# 第 21 章：偏移属性计算

## 概述

top/right/bottom/left属性控制定位元素的位置，理解其计算规则对于精确定位至关重要。

---

## 一、偏移属性基础

### 1.1 四个方向

```css
.positioned {
  position: absolute;
  top: 10px;         /* 上偏移 */
  right: 20px;       /* 右偏移 */
  bottom: 30px;      /* 下偏移 */
  left: 40px;        /* 左偏移 */
}
```

---

## 二、值类型

### 2.1 长度值

```css
.box {
  top: 10px;         /* 固定值 */
  left: 2rem;        /* 相对单位 */
}
```

### 2.2 百分比

```css
.box {
  position: absolute;
  top: 50%;          /* 相对包含块高度 */
  left: 50%;         /* 相对包含块宽度 */
}
```

### 2.3 auto

```css
.box {
  position: absolute;
  top: auto;         /* 默认值 */
  left: auto;
}
```

---

## 三、计算规则

### 3.1 单边设置

```css
.box {
  position: absolute;
  top: 10px;         /* 距包含块顶部10px */
  left: 20px;        /* 距包含块左边20px */
}
```

### 3.2 对边同时设置

```css
.box {
  position: absolute;
  top: 10px;
  bottom: 10px;      /* 高度自动计算 */
  /* height = 包含块高度 - 20px */
}

.box {
  position: absolute;
  left: 10px;
  right: 10px;       /* 宽度自动计算 */
  /* width = 包含块宽度 - 20px */
}
```

---

## 四、与width/height的关系

### 4.1 优先级

```css
/* 冲突时的优先级 */
.box {
  position: absolute;
  left: 0;
  right: 0;
  width: 200px;      /* width被忽略，使用left+right */
}
```

### 4.2 拉伸布局

```css
/* 充满包含块 */
.stretch {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
```

---

## 五、居中定位

### 5.1 transform方式

```css
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 5.2 margin auto方式

```css
.center {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;      /* 必须指定宽高 */
  height: 100px;
}
```

---

## 六、负值

### 6.1 应用场景

```css
/* 超出包含块 */
.overflow {
  position: absolute;
  top: -10px;        /* 向上超出 */
  left: -20px;       /* 向左超出 */
}

/* 视觉居中 */
.visual-center {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -50px;  /* 高度的一半 */
  margin-left: -100px; /* 宽度的一半 */
}
```

---

## 七、sticky的偏移

### 7.1 阈值

```css
.sticky {
  position: sticky;
  top: 10px;         /* 距视口顶部10px时固定 */
}
```

### 7.2 多个阈值

```css
.sticky-top {
  position: sticky;
  top: 0;
}

.sticky-bottom {
  position: sticky;
  bottom: 0;
}
```

---

## 八、实用案例

### 8.1 固定宽高比

```css
.aspect-box {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;  /* 16:9 */
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### 8.2 角落定位

```css
/* 右上角 */
.top-right {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* 左下角 */
.bottom-left {
  position: absolute;
  bottom: 10px;
  left: 10px;
}
```

---

## 参考资料

- [MDN - top](https://developer.mozilla.org/zh-CN/docs/Web/CSS/top)
- [CSS Positioned Layout](https://www.w3.org/TR/css-position-3/)

---

**导航**  
[上一章：第 20 章 - 定位原理](./20-positioning.md)  
[返回目录](../README.md)  
[下一章：第 22 章 - 浮动原理](./22-float.md)
