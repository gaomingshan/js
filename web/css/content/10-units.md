# 第 10 章：单位与值转换

## 概述

CSS支持多种单位类型，理解各种单位的计算规则和使用场景，是编写响应式布局的基础。

---

## 一、绝对单位

### 1.1 像素（px）

```css
.box {
  width: 100px;      /* 最常用 */
  font-size: 16px;
}
```

**特点**：
- 固定大小
- 在不同设备上显示可能不同
- 1px ≠ 1物理像素（视Retina屏）

### 1.2 其他绝对单位

```css
/* 很少使用 */
.box {
  width: 1cm;        /* 厘米 */
  width: 1mm;        /* 毫米 */
  width: 1in;        /* 英寸（1in = 2.54cm = 96px） */
  width: 1pt;        /* 点（1pt = 1/72in） */
  width: 1pc;        /* 派卡（1pc = 12pt） */
}
```

---

## 二、相对单位

### 2.1 em - 相对父元素字体大小

```css
.parent { font-size: 16px; }
.child {
  font-size: 2em;    /* 32px（16 × 2） */
  width: 10em;       /* 320px（32 × 10） */
  padding: 1em;      /* 32px */
}
```

**特点**：
- 可嵌套（层层放大）
- 用于 font-size 时相对父元素
- 用于其他属性时相对自身 font-size

**嵌套问题**：
```css
.parent { font-size: 1.2em; }  /* 19.2px */
.child { font-size: 1.2em; }   /* 23.04px（19.2 × 1.2） */
.grandchild { font-size: 1.2em; } /* 27.65px（层层放大） */
```

### 2.2 rem - 相对根元素字体大小

```css
html { font-size: 16px; }

.box {
  font-size: 2rem;   /* 32px（16 × 2） */
  width: 10rem;      /* 160px（16 × 10） */
  padding: 1rem;     /* 16px */
}
```

**特点**：
- 不会嵌套累积
- 全局统一基准
- 响应式设计首选

**实用技巧**：
```css
/* 设置基准为10px，方便计算 */
html { font-size: 62.5%; }  /* 10px */
.text { font-size: 1.6rem; } /* 16px */
```

### 2.3 % - 百分比

```css
.parent { width: 1000px; height: 500px; }
.child {
  width: 50%;        /* 500px（相对父元素宽度） */
  height: 50%;       /* 250px（相对父元素高度） */
  
  /* 特殊：padding/margin的百分比始终相对宽度 */
  padding: 10%;      /* 100px（相对父元素宽度） */
  margin-top: 10%;   /* 100px（相对父元素宽度） */
}
```

**特点**：
- width/height：相对父元素
- padding/margin：相对父元素**宽度**
- font-size：相对父元素字体大小
- line-height：相对自身字体大小

### 2.4 视口单位

```css
.box {
  /* 视口宽度 */
  width: 50vw;       /* 视口宽度的50% */
  
  /* 视口高度 */
  height: 100vh;     /* 视口高度的100% */
  
  /* 视口最小值 */
  font-size: 5vmin;  /* min(5vw, 5vh) */
  
  /* 视口最大值 */
  font-size: 5vmax;  /* max(5vw, 5vh) */
}
```

**实用场景**：
```css
/* 全屏高度 */
.hero { height: 100vh; }

/* 响应式字体 */
h1 { font-size: calc(2rem + 2vw); }
```

### 2.5 容器查询单位（新）

```css
.container {
  container-type: inline-size;
}

.child {
  width: 50cqw;      /* 容器宽度的50% */
  font-size: 5cqi;   /* 容器inline-size的5% */
}
```

---

## 三、calc() 函数

### 3.1 基本用法

```css
.box {
  width: calc(100% - 80px);
  margin: calc(1rem + 10px);
  font-size: calc(16px + 2vw);
}
```

### 3.2 混合单位

```css
.box {
  /* 固定 + 百分比 */
  width: calc(100% - 200px);
  
  /* 绝对 + 相对 */
  padding: calc(1rem + 5px);
  
  /* 视口单位 */
  height: calc(100vh - 80px);
}
```

### 3.3 嵌套计算

```css
.box {
  width: calc(100% - calc(2rem + 10px));
  
  /* 等同于 */
  width: calc(100% - 2rem - 10px);
}
```

### 3.4 CSS变量

```css
:root {
  --header-height: 80px;
  --gap: 20px;
}

.main {
  height: calc(100vh - var(--header-height));
  padding: var(--gap);
  width: calc(100% - var(--gap) * 2);
}
```

---

## 四、其他数学函数

### 4.1 min() / max()

```css
.box {
  /* 宽度最大500px */
  width: min(100%, 500px);
  
  /* 字体最小16px */
  font-size: max(16px, 2vw);
  
  /* 混合 */
  padding: min(5%, 30px);
}
```

### 4.2 clamp()

```css
/* clamp(最小值, 首选值, 最大值) */
.box {
  /* 字体16px-32px之间 */
  font-size: clamp(16px, 2vw, 32px);
  
  /* 宽度300px-800px */
  width: clamp(300px, 50%, 800px);
}
```

**实用场景**：
```css
/* 响应式字体 */
h1 {
  font-size: clamp(1.5rem, 2vw + 1rem, 3rem);
}

/* 响应式容器 */
.container {
  width: clamp(320px, 90%, 1200px);
  margin: 0 auto;
}
```

---

## 五、角度单位

### 5.1 角度类型

```css
.box {
  transform: rotate(45deg);   /* 度 */
  transform: rotate(0.25turn); /* 圈 */
  transform: rotate(50grad);   /* 百分度 */
  transform: rotate(0.785rad); /* 弧度 */
}

/* 换算 */
360deg = 1turn = 400grad = 2πrad
```

---

## 六、时间单位

### 6.1 s 和 ms

```css
.box {
  transition-duration: 0.3s;   /* 秒 */
  animation-duration: 300ms;   /* 毫秒 */
}

/* 1s = 1000ms */
```

---

## 七、单位选择指南

### 7.1 字体大小

```css
/* ✅ 推荐：rem（全局统一） */
html { font-size: 16px; }
.text { font-size: 1rem; }

/* ⚠️ 谨慎：em（可能嵌套放大） */
.parent { font-size: 1.2em; }
.child { font-size: 1.2em; }  /* 1.44倍 */

/* ✅ 好：响应式字体 */
h1 { font-size: clamp(1.5rem, 2vw + 1rem, 3rem); }
```

### 7.2 布局宽高

```css
/* ✅ 固定布局：px */
.sidebar { width: 200px; }

/* ✅ 流式布局：% */
.main { width: 70%; }

/* ✅ 响应式：rem + % */
.container {
  max-width: 1200px;
  width: 90%;
}

/* ✅ 视口：vw/vh */
.hero { height: 100vh; }
```

### 7.3 间距

```css
/* ✅ 推荐：rem（统一缩放） */
.box {
  margin: 1rem;
  padding: 2rem;
}

/* ✅ 可选：em（相对字体） */
.button {
  padding: 0.5em 1em;  /* 随字体缩放 */
}
```

---

## 八、最佳实践

### 8.1 统一基准

```css
/* 设置全局基准 */
:root {
  font-size: 16px;
  --spacing-unit: 8px;
  --max-width: 1200px;
}

/* 使用相对单位 */
.container {
  max-width: var(--max-width);
  padding: calc(var(--spacing-unit) * 2);
}
```

### 8.2 响应式设计

```css
/* 组合使用 */
.responsive {
  width: clamp(300px, 90%, 1200px);
  font-size: clamp(1rem, 2vw, 2rem);
  padding: calc(1rem + 1vw);
}
```

---

## 参考资料

- [MDN - CSS 值和单位](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Values_and_Units)
- [CSS Values and Units Specification](https://www.w3.org/TR/css-values-4/)

---

**导航**  
[上一章：第 9 章 - 样式值计算过程](./09-computed-values.md)  
[返回目录](../README.md)  
[下一章：第 11 章 - 包含块](./11-containing-block.md)
