# 第 26 章：媒体查询 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 媒体查询基础

### 题目

媒体查询的语法是？

**选项：**
- A. `@query (条件)`
- B. `@media (条件)`
- C. `@screen (条件)`
- D. `@device (条件)`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**媒体查询语法**

```css
@media (条件) {
  /* CSS 规则 */
}
```

**基本示例：**
```css
@media (max-width: 768px) {
  .container {
    width: 100%;
  }
}
```

**多条件：**
```css
@media (min-width: 768px) and (max-width: 1024px) {
  /* 平板设备 */
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 常用断点

### 题目

常见的移动端断点是？

**选项：**
- A. 320px
- B. 768px
- C. 1024px
- D. 1920px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**常见断点**

```css
/* 手机 */
@media (max-width: 767px) { }

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面 */
@media (min-width: 1024px) { }
```

**Bootstrap 断点：**
```css
/* XS: < 576px */
/* SM: ≥ 576px */
@media (min-width: 576px) { }

/* MD: ≥ 768px */
@media (min-width: 768px) { }

/* LG: ≥ 992px */
@media (min-width: 992px) { }

/* XL: ≥ 1200px */
@media (min-width: 1200px) { }

/* XXL: ≥ 1400px */
@media (min-width: 1400px) { }
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** min-width vs max-width

### 题目

Mobile First 策略应该使用 `min-width`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Mobile First vs Desktop First**

**Mobile First（推荐）：**
```css
/* 基础样式：移动端 */
.container {
  width: 100%;
}

/* 逐步增强：平板 */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}
```

**Desktop First：**
```css
/* 基础样式：桌面 */
.container {
  width: 960px;
}

/* 逐步降级：平板 */
@media (max-width: 1023px) {
  .container {
    width: 750px;
  }
}

/* 移动端 */
@media (max-width: 767px) {
  .container {
    width: 100%;
  }
}
```

**Mobile First 优势：**
- 性能更好（移动端加载更少CSS）
- 渐进增强
- 符合现代开发趋势

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 媒体类型

### 题目

以下哪些是有效的媒体类型？

**选项：**
- A. `screen`
- B. `print`
- C. `speech`
- D. `mobile`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**媒体类型**

**✅ A. screen（屏幕）**
```css
@media screen and (max-width: 768px) {
  /* 屏幕设备 */
}
```

**✅ B. print（打印）**
```css
@media print {
  .no-print {
    display: none;
  }
}
```

**✅ C. speech（语音）**
```css
@media speech {
  /* 屏幕阅读器 */
}
```

**❌ D. mobile（无效）**
```css
/* 没有 mobile 类型 */
/* 使用 screen + width 条件 */
```

**常用媒体类型：**
```css
@media all { }       /* 所有设备（默认）*/
@media screen { }    /* 屏幕 */
@media print { }     /* 打印 */
@media speech { }    /* 语音合成 */
```

**实用示例：**
```css
/* 打印样式 */
@media print {
  header, footer, nav {
    display: none;
  }
  
  body {
    font-size: 12pt;
    color: black;
  }
  
  a::after {
    content: " (" attr(href) ")";
  }
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 逻辑运算符

### 题目

`@media (min-width: 768px) and (max-width: 1024px)` 的含义是？

**选项：**
- A. 宽度小于768px或大于1024px
- B. 宽度在768px到1024px之间
- C. 宽度等于768px或1024px
- D. 语法错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**媒体查询逻辑运算符**

**and（且）：**
```css
@media (min-width: 768px) and (max-width: 1024px) {
  /* 768px ≤ 宽度 ≤ 1024px */
}
```

**or（或，使用逗号）：**
```css
@media (max-width: 767px), (min-width: 1025px) {
  /* 宽度 < 768px 或 宽度 > 1024px */
}
```

**not（非）：**
```css
@media not screen {
  /* 非屏幕设备 */
}
```

**only（仅）：**
```css
@media only screen and (max-width: 768px) {
  /* 防止旧浏览器应用样式 */
}
```

**组合使用：**
```css
/* 平板横屏 */
@media screen 
  and (min-width: 768px) 
  and (max-width: 1024px) 
  and (orientation: landscape) {
  /* 复杂条件 */
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 媒体特性

### 题目

`orientation` 媒体特性的值有哪些？

**选项：**
- A. horizontal, vertical
- B. landscape, portrait
- C. row, column
- D. left, right

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**orientation（方向）**

```css
/* 横屏 */
@media (orientation: landscape) {
  /* 宽度 > 高度 */
}

/* 竖屏 */
@media (orientation: portrait) {
  /* 高度 > 宽度 */
}
```

**实用场景：**
```css
/* 移动端横屏提示 */
@media screen 
  and (max-width: 767px) 
  and (orientation: landscape) {
  .rotate-message {
    display: block;
  }
}
```

**其他媒体特性：**

**尺寸相关：**
```css
@media (width: 1024px) { }
@media (min-width: 768px) { }
@media (max-width: 1024px) { }
@media (height: 768px) { }
@media (aspect-ratio: 16/9) { }
```

**显示相关：**
```css
@media (resolution: 2dppx) { }  /* Retina */
@media (color) { }  /* 彩色设备 */
@media (monochrome) { }  /* 黑白设备 */
```

**交互相关：**
```css
@media (hover: hover) { }  /* 支持 hover */
@media (pointer: fine) { }  /* 精确指针（鼠标）*/
@media (pointer: coarse) { }  /* 粗糙指针（触摸）*/
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 高分辨率屏幕

### 题目

如何检测 Retina 屏幕？

**选项：**
- A. `@media (resolution: 2x)`
- B. `@media (min-resolution: 2dppx)`
- C. `@media (retina: true)`
- D. `@media (high-dpi: true)`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**检测高分辨率屏幕**

```css
/* 标准语法 */
@media (min-resolution: 2dppx) {
  .logo {
    background-image: url('logo@2x.png');
  }
}
```

**兼容写法：**
```css
@media 
  (-webkit-min-device-pixel-ratio: 2),
  (min-resolution: 192dpi),
  (min-resolution: 2dppx) {
  /* Retina 样式 */
}
```

**单位说明：**
```css
/* dppx: dots per pixel */
1dppx = 96dpi
2dppx = 192dpi (Retina)
3dppx = 288dpi

/* 等价写法 */
@media (min-resolution: 2dppx) { }
@media (min-resolution: 192dpi) { }
```

**实用示例：**
```css
/* 普通屏幕 */
.icon {
  background-image: url('icon.png');
  background-size: 24px 24px;
}

/* Retina 屏幕 */
@media (min-resolution: 2dppx) {
  .icon {
    background-image: url('icon@2x.png');
  }
}

/* 更高分辨率 */
@media (min-resolution: 3dppx) {
  .icon {
    background-image: url('icon@3x.png');
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 断点策略

### 题目

以下哪种断点策略更好？

**选项：**
- A. 基于设备（iPhone, iPad）
- B. 基于内容（content-based）
- C. 固定断点（768px, 1024px）
- D. 无断点（fluid）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**断点策略对比**

**❌ A. 基于设备**
```css
/* 不推荐：设备型号多变 */
@media (width: 375px) { /* iPhone 6/7/8 */ }
@media (width: 768px) { /* iPad */ }
```

**✅ B. 基于内容（推荐）**
```css
/* 根据内容需要设置断点 */
@media (max-width: 45em) {
  /* 当内容开始拥挤时 */
  .navigation {
    flex-direction: column;
  }
}
```

**⚠️ C. 固定断点**
```css
/* 可用但不够灵活 */
@media (min-width: 768px) { }
@media (min-width: 1024px) { }
```

**⚠️ D. 无断点**
```css
/* 纯流式布局，某些场景适用 */
.container {
  width: 90%;
  max-width: 1200px;
}
```

**最佳实践：**

**1. 内容优先：**
```css
/* 观察内容，当布局开始破坏时添加断点 */
@media (max-width: 37.5em) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

**2. 使用 em 单位：**
```css
/* em 更适合断点（支持用户缩放）*/
@media (min-width: 48em) { /* 768px / 16 */ }
@media (min-width: 64em) { /* 1024px / 16 */ }
```

**3. 语义化命名：**
```css
/* 使用 CSS 变量 */
:root {
  --bp-small: 30em;
  --bp-medium: 48em;
  --bp-large: 64em;
}

/* SCSS 示例 */
$breakpoints: (
  'small': 30em,
  'medium': 48em,
  'large': 64em
);
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 交互媒体特性

### 题目

如何为触摸设备和鼠标设备提供不同的交互？

**选项：**
- A. `@media (touch: true)`
- B. `@media (pointer: coarse)`
- C. `@media (input: touch)`
- D. 无法检测

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**交互媒体特性**

**pointer（指针精度）：**
```css
/* 精确指针（鼠标）*/
@media (pointer: fine) {
  .button {
    padding: 8px 16px;
  }
  
  .button:hover {
    background: #ddd;
  }
}

/* 粗糙指针（触摸）*/
@media (pointer: coarse) {
  .button {
    padding: 12px 24px;  /* 更大的触摸区域 */
  }
  
  .button:hover {
    /* 触摸设备通常不需要 hover */
  }
}
```

**hover（悬停能力）：**
```css
/* 支持 hover */
@media (hover: hover) {
  .link:hover {
    text-decoration: underline;
  }
}

/* 不支持 hover */
@media (hover: none) {
  .link:active {
    text-decoration: underline;
  }
}
```

**any-pointer（任意输入设备）：**
```css
/* 至少有一个精确指针 */
@media (any-pointer: fine) {
  /* 可能有鼠标 */
}

/* 至少有一个粗糙指针 */
@media (any-pointer: coarse) {
  /* 可能有触摸屏 */
}
```

**实用组合：**
```css
/* 纯触摸设备 */
@media (hover: none) and (pointer: coarse) {
  .interactive {
    /* 优化触摸交互 */
    min-height: 44px;  /* iOS 推荐最小触摸区域 */
  }
}

/* 桌面设备 */
@media (hover: hover) and (pointer: fine) {
  .interactive {
    /* 鼠标交互优化 */
    transition: all 0.2s;
  }
  
  .interactive:hover {
    transform: scale(1.05);
  }
}

/* 混合设备（触摸 + 鼠标）*/
@media (any-hover: hover) and (any-pointer: fine) {
  /* 同时支持两种交互 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 媒体查询最佳实践

### 题目

关于媒体查询的最佳实践，以下说法正确的是？

**选项：**
- A. 使用 em 而非 px 作为断点单位
- B. 采用 Mobile First 策略
- C. 避免过多断点
- D. 基于内容而非设备设置断点

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**媒体查询最佳实践（全部正确）**

**✅ A. 使用 em 单位**
```css
/* ✅ 推荐：em（支持用户缩放）*/
@media (min-width: 48em) {
  /* 768px / 16 = 48em */
}

/* ❌ 不推荐：px */
@media (min-width: 768px) {
  /* 不随用户字体缩放 */
}
```

**✅ B. Mobile First**
```css
/* 基础：移动端 */
.container { width: 100%; }

/* 渐进增强 */
@media (min-width: 48em) {
  .container { width: 750px; }
}
```

**✅ C. 避免过多断点**
```css
/* ❌ 过多断点 */
@media (min-width: 320px) { }
@media (min-width: 375px) { }
@media (min-width: 414px) { }
@media (min-width: 768px) { }
/* ... */

/* ✅ 合理断点 */
@media (min-width: 48em) { }   /* 平板 */
@media (min-width: 64em) { }   /* 桌面 */
@media (min-width: 80em) { }   /* 大屏 */
```

**✅ D. 基于内容**
```css
/* 观察内容，当需要时添加断点 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* 只在必要时调整 */
@media (max-width: 30em) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

**其他最佳实践：**

**1. 组织媒体查询：**
```scss
// 组件内聚合
.component {
  // 移动端样式
  
  @media (min-width: 48em) {
    // 平板样式
  }
  
  @media (min-width: 64em) {
    // 桌面样式
  }
}
```

**2. 使用变量/Mixin：**
```scss
// SCSS
$breakpoints: (
  'small': 30em,
  'medium': 48em,
  'large': 64em
);

@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

.component {
  @include respond-to('medium') {
    // 样式
  }
}
```

**3. 性能优化：**
```css
/* 避免复杂选择器 */
@media (min-width: 48em) {
  .simple { }  /* ✅ */
  
  body > div > section:nth-child(2) { }  /* ❌ */
}
```

**4. 测试多设备：**
```
- 真机测试
- Chrome DevTools
- 响应式设计模式
- 不同浏览器
```

</details>

---

**导航**  
[上一章：第 25 章 - Grid进阶](./chapter-25.md) | [返回目录](../README.md) | [下一章：第 27 章 - 响应式布局单位](./chapter-27.md)
