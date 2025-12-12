# 第 38 章：Filter 滤镜 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** filter 基础

### 题目

`filter: blur(5px)` 的效果是？

**选项：**
- A. 边框模糊
- B. 整个元素模糊
- C. 文本模糊
- D. 背景模糊

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**filter 滤镜**

```css
.blur {
  filter: blur(5px);
  /* 整个元素模糊5px */
}
```

**常用滤镜：**
```css
filter: blur(5px);           /* 模糊 */
filter: brightness(1.5);     /* 亮度 */
filter: contrast(200%);      /* 对比度 */
filter: grayscale(100%);     /* 灰度 */
filter: hue-rotate(90deg);   /* 色相旋转 */
filter: invert(100%);        /* 反色 */
filter: opacity(50%);        /* 透明度 */
filter: saturate(200%);      /* 饱和度 */
filter: sepia(100%);         /* 褐色 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** backdrop-filter

### 题目

`backdrop-filter` 和 `filter` 的区别？

**选项：**
- A. 没有区别
- B. backdrop-filter 作用于元素背后的内容
- C. backdrop-filter 性能更好
- D. 语法不同

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**filter vs backdrop-filter**

**filter（元素本身）：**
```css
.box {
  filter: blur(10px);
  /* 元素内容模糊 */
}
```

**backdrop-filter（背后内容）：**
```css
.glass {
  backdrop-filter: blur(10px);
  /* 元素背后的内容模糊（毛玻璃效果）*/
  background: rgba(255, 255, 255, 0.3);
}
```

**应用场景：**
```css
/* 毛玻璃卡片 */
.card {
  backdrop-filter: blur(10px) saturate(180%);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 组合滤镜

### 题目

可以同时使用多个 filter 函数。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**组合滤镜**

```css
.photo {
  filter: 
    brightness(1.1)
    contrast(1.2)
    saturate(1.3)
    blur(2px);
  /* 多个滤镜按顺序应用 */
}
```

**顺序影响结果：**
```css
/* 先模糊后提亮 */
filter: blur(5px) brightness(1.5);

/* 先提亮后模糊 */
filter: brightness(1.5) blur(5px);
/* 视觉效果略有不同 */
```

**实用示例：**
```css
/* Instagram风格滤镜 */
.vintage {
  filter: 
    sepia(30%)
    contrast(1.2)
    brightness(1.1)
    saturate(1.3);
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 滤镜函数

### 题目

CSS filter 函数包括？

**选项：**
- A. blur, brightness, contrast
- B. grayscale, hue-rotate, invert
- C. opacity, saturate, sepia
- D. drop-shadow

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**所有 filter 函数（全部正确）**

**✅ A. 基础滤镜**
```css
blur(5px)           /* 模糊 */
brightness(1.5)     /* 亮度 */
contrast(200%)      /* 对比度 */
```

**✅ B. 颜色滤镜**
```css
grayscale(100%)     /* 灰度 */
hue-rotate(90deg)   /* 色相旋转 */
invert(100%)        /* 反色 */
```

**✅ C. 效果滤镜**
```css
opacity(50%)        /* 透明度 */
saturate(200%)      /* 饱和度 */
sepia(100%)         /* 褐色 */
```

**✅ D. 阴影滤镜**
```css
drop-shadow(2px 2px 5px rgba(0,0,0,0.5))
/* 投影，类似box-shadow但遵循元素形状 */
```

**完整列表：**
```css
filter:
  blur(px)
  brightness(%)
  contrast(%)
  drop-shadow(x y blur color)
  grayscale(%)
  hue-rotate(deg)
  invert(%)
  opacity(%)
  saturate(%)
  sepia(%)
  url(svg-filter);
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** drop-shadow vs box-shadow

### 题目

`drop-shadow()` 和 `box-shadow` 的区别？

**选项：**
- A. 没有区别
- B. drop-shadow 遵循元素形状，box-shadow 是矩形
- C. 性能不同
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**drop-shadow vs box-shadow**

**box-shadow（矩形阴影）：**
```css
.box {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  box-shadow: 5px 5px 10px rgba(0,0,0,0.5);
  /* 阴影是正方形的 */
}
```

**drop-shadow（形状阴影）：**
```css
.circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.5));
  /* 阴影是圆形的 */
}
```

**PNG透明图片：**
```css
/* box-shadow：矩形阴影 */
.logo {
  box-shadow: 5px 5px 10px rgba(0,0,0,0.5);
}

/* drop-shadow：跟随图片形状 */
.logo {
  filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.5));
}
```

**语法差异：**
```css
/* box-shadow：支持多个阴影，支持inset */
box-shadow: 
  5px 5px 10px rgba(0,0,0,0.3),
  inset 0 0 5px rgba(255,255,255,0.5);

/* drop-shadow：不支持多个，不支持inset */
filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.3));
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** SVG 滤镜

### 题目

如何使用 SVG 滤镜？

**选项：**
- A. `filter: svg()`
- B. `filter: url(#filterId)`
- C. 不支持 SVG
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**使用 SVG 滤镜**

```html
<svg>
  <defs>
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
      <feColorMatrix values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 18 -7" />
    </filter>
  </defs>
</svg>
```

```css
.blob {
  filter: url(#goo);
}
```

**实用示例：**

**融合效果：**
```html
<svg>
  <filter id="gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="
      1 0 0 0 0  
      0 1 0 0 0  
      0 0 1 0 0  
      0 0 0 18 -7" result="goo" />
  </filter>
</svg>

<style>
  .menu {
    filter: url(#gooey);
  }
</style>
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 暗黑模式

### 题目

使用 filter 实现暗黑模式？

**选项：**
- A. `filter: dark()`
- B. `filter: invert(1) hue-rotate(180deg)`
- C. `filter: brightness(0)`
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**暗黑模式滤镜**

```css
/* 简单反转 */
html {
  filter: invert(1);
}

/* 更好的方案：反转+色相旋转 */
html {
  filter: invert(1) hue-rotate(180deg);
}

/* 再次反转图片 */
img, video {
  filter: invert(1) hue-rotate(180deg);
}
```

**完整暗黑模式：**
```css
@media (prefers-color-scheme: dark) {
  html {
    filter: invert(1) hue-rotate(180deg);
  }
  
  img, video, iframe {
    filter: invert(1) hue-rotate(180deg);
  }
}
```

**CSS变量方案（推荐）：**
```css
:root {
  --bg: white;
  --text: black;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: black;
    --text: white;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能影响

### 题目

filter 对性能的影响？

**选项：**
- A. 无影响
- B. 创建合成层，GPU加速，但计算密集
- C. 阻塞渲染
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**filter 性能**

**✅ 创建合成层**
```css
.box {
  filter: blur(5px);
  /* 创建独立合成层，GPU处理 */
}
```

**⚠️ 计算密集**
```css
/* blur、drop-shadow 计算量大 */
filter: blur(20px);
filter: drop-shadow(0 0 20px rgba(0,0,0,0.5));

/* grayscale、sepia 计算量小 */
filter: grayscale(100%);
filter: sepia(100%);
```

**性能优化：**

**1. 限制滤镜范围：**
```css
/* ❌ 整个页面 */
body {
  filter: blur(5px);
}

/* ✅ 小区域 */
.modal-backdrop {
  filter: blur(5px);
}
```

**2. 避免动画昂贵滤镜：**
```css
/* ❌ 动画blur */
@keyframes blurAnimation {
  from { filter: blur(0); }
  to { filter: blur(20px); }
}

/* ✅ 动画opacity */
@keyframes fadeAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**3. 使用will-change：**
```css
.animating {
  will-change: filter;
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** backdrop-filter 兼容性

### 题目

backdrop-filter 的降级方案？

**选项：**
- A. 使用filter
- B. 使用半透明背景
- C. 使用@supports检测
- D. B和C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**backdrop-filter 降级**

```css
.glass {
  /* 降级：半透明背景 */
  background: rgba(255, 255, 255, 0.8);
}

/* 渐进增强 */
@supports (backdrop-filter: blur(10px)) {
  .glass {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.3);
  }
}
```

**完整方案：**
```css
.glass-card {
  /* 基础样式（所有浏览器）*/
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 支持backdrop-filter的浏览器 */
@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .glass-card {
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    backdrop-filter: blur(10px) saturate(180%);
    background: rgba(255, 255, 255, 0.3);
  }
}
```

**JavaScript检测：**
```javascript
const supportsBackdropFilter = 
  CSS.supports('backdrop-filter', 'blur(10px)') ||
  CSS.supports('-webkit-backdrop-filter', 'blur(10px)');

if (supportsBackdropFilter) {
  element.classList.add('supports-backdrop-filter');
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 滤镜应用

### 题目

filter 的实用场景有？

**选项：**
- A. 图片效果（黑白、褐色、模糊）
- B. 毛玻璃效果
- C. 暗黑模式
- D. 悬停效果

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**filter 实用场景（全部正确）**

**✅ A. 图片效果**
```css
/* 黑白照片 */
.grayscale {
  filter: grayscale(100%);
}

/* 老照片 */
.vintage {
  filter: sepia(60%) contrast(1.2);
}

/* 模糊背景 */
.blur-bg {
  filter: blur(10px);
}
```

**✅ B. 毛玻璃效果**
```css
.glass {
  backdrop-filter: blur(10px) saturate(180%);
  background: rgba(255, 255, 255, 0.3);
}
```

**✅ C. 暗黑模式**
```css
@media (prefers-color-scheme: dark) {
  html {
    filter: invert(1) hue-rotate(180deg);
  }
}
```

**✅ D. 悬停效果**
```css
.card {
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.card:hover {
  filter: grayscale(0);
}

/* 图片提亮 */
img:hover {
  filter: brightness(1.2);
}

/* Logo反色 */
.logo:hover {
  filter: invert(1);
}
```

**综合示例：**
```css
/* 照片墙 */
.photo-grid img {
  filter: grayscale(100%) brightness(0.8);
  transition: filter 0.3s;
}

.photo-grid img:hover {
  filter: grayscale(0) brightness(1.1) contrast(1.1);
}

/* 毛玻璃导航 */
.nav {
  backdrop-filter: blur(10px) saturate(180%);
  background: rgba(255, 255, 255, 0.7);
}

/* 禁用状态 */
.disabled {
  filter: grayscale(100%) opacity(0.5);
  pointer-events: none;
}
```

</details>

---

**导航**  
[上一章：第 37 章 - 3D变换](./chapter-37.md) | [返回目录](../README.md) | [下一章：第 39 章 - 混合模式](./chapter-39.md)
