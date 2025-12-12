# 第 43 章：图形函数 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** clip-path

### 题目

`clip-path` 的作用是？

**选项：**
- A. 裁剪路径
- B. 创建形状
- C. 隐藏元素
- D. A 和 B

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
.circle {
  clip-path: circle(50%);
  /* 裁剪成圆形 */
}

.triangle {
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
  /* 三角形 */
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 基础形状

### 题目

clip-path 支持的基础形状函数有？

**选项：**
- A. circle, ellipse
- B. polygon, inset
- C. path
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* circle */
clip-path: circle(50%);

/* ellipse */
clip-path: ellipse(50% 30%);

/* polygon */
clip-path: polygon(0 0, 100% 0, 100% 100%);

/* inset */
clip-path: inset(10px 20px);

/* path */
clip-path: path('M 0 0 L 100 100');
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** shape-outside

### 题目

`shape-outside` 可以让文本环绕非矩形元素。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

```css
.image {
  float: left;
  width: 200px;
  height: 200px;
  shape-outside: circle(50%);
  clip-path: circle(50%);
  /* 文本围绕圆形排列 */
}
```

**注意：** `shape-outside` 只对浮动元素有效。

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** polygon

### 题目

使用 polygon() 可以创建哪些形状？

**选项：**
- A. 三角形
- B. 六边形
- C. 星形
- D. 任意多边形

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. 三角形**
```css
.triangle {
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
}
```

**✅ B. 六边形**
```css
.hexagon {
  clip-path: polygon(
    50% 0,
    100% 25%,
    100% 75%,
    50% 100%,
    0 75%,
    0 25%
  );
}
```

**✅ C. 星形**
```css
.star {
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}
```

**✅ D. 任意多边形**
```css
.custom {
  clip-path: polygon(/* 任意点 */);
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 动画过渡

### 题目

clip-path 支持动画吗？

**选项：**
- A. 不支持
- B. 支持，但形状点数必须相同
- C. 完全支持
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* ✅ 点数相同，可以动画 */
.morph {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  transition: clip-path 0.5s;
}

.morph:hover {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  /* 正方形变菱形 */
}

/* ❌ 点数不同，无法动画 */
.wrong {
  clip-path: polygon(0 0, 100% 0, 100% 100%);  /* 3点 */
}

.wrong:hover {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);  /* 4点 */
  /* 跳变，无过渡 */
}
```

**动画示例：**
```css
@keyframes morphShape {
  0% {
    clip-path: circle(30%);
  }
  50% {
    clip-path: circle(50%);
  }
  100% {
    clip-path: circle(30%);
  }
}

.animated {
  animation: morphShape 2s infinite;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** inset

### 题目

`inset()` 函数的参数顺序？

**选项：**
- A. left, top, right, bottom
- B. top, right, bottom, left
- C. top, left, bottom, right
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* 顺时针：上右下左 */
clip-path: inset(10px 20px 30px 40px);
/*              ↑   ↑   ↑   ↑
            top right bottom left */

/* 简写 */
clip-path: inset(10px);          /* 四边 */
clip-path: inset(10px 20px);     /* 上下 左右 */
clip-path: inset(10px 20px 30px); /* 上 左右 下 */
```

**带圆角：**
```css
clip-path: inset(10px round 20px);
/* 10px内缩，20px圆角 */
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** path()

### 题目

path() 函数使用什么语法？

**选项：**
- A. CSS 语法
- B. SVG path 语法
- C. 自定义语法
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
.custom-shape {
  clip-path: path('M 0 0 L 100 0 L 100 100 Z');
  /* 使用 SVG path 命令 */
}
```

**SVG path 命令：**
```
M = moveto（移动到）
L = lineto（直线到）
H = horizontal lineto（水平线）
V = vertical lineto（垂直线）
C = curveto（三次贝塞尔曲线）
Q = quadratic Bézier curve（二次贝塞尔曲线）
A = elliptical Arc（椭圆弧）
Z = closepath（闭合路径）
```

**实用示例：**
```css
/* 心形 */
.heart {
  clip-path: path('
    M 140,20 
    C 73,20 20,74 20,140 
    C 20,275 156,310 200,350 
    C 244,310 380,275 380,140 
    C 380,74 327,20 260,20 
    C 220,20 200,40 200,40 
    C 200,40 180,20 140,20 Z
  ');
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

clip-path 的性能考虑？

**选项：**
- A. 无性能影响
- B. 创建合成层，GPU 加速
- C. 复杂路径影响性能
- D. B 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**✅ 创建合成层**
```css
.clipped {
  clip-path: circle(50%);
  /* 创建独立合成层 */
}
```

**⚠️ 复杂路径**
```css
/* ❌ 过于复杂 */
.complex {
  clip-path: polygon(/* 100个点 */);
}

/* ✅ 适度复杂 */
.simple {
  clip-path: polygon(/* 10个点以内 */);
}
```

**优化建议：**
```css
/* 1. 使用简单形状 */
clip-path: circle(50%);       /* ✅ */
clip-path: polygon(/* ... */); /* ⚠️ 按需使用 */

/* 2. 避免动画复杂路径 */
/* ❌ */
@keyframes complexMorph {
  from { clip-path: polygon(/* 50个点 */); }
  to { clip-path: polygon(/* 50个点 */); }
}

/* ✅ */
@keyframes simpleMorph {
  from { clip-path: circle(30%); }
  to { clip-path: circle(50%); }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 浏览器兼容

### 题目

clip-path 的兼容性处理？

**选项：**
- A. 所有浏览器都支持
- B. 需要-webkit-前缀
- C. 提供降级方案
- D. B 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* 兼容性写法 */
.shape {
  -webkit-clip-path: circle(50%);
  clip-path: circle(50%);
}
```

**降级方案：**
```css
.avatar {
  /* 降级：border-radius */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

/* 渐进增强 */
@supports (clip-path: circle(50%)) {
  .avatar {
    border-radius: 0;
    overflow: visible;
    clip-path: circle(50%);
  }
}
```

**检测支持：**
```javascript
if (CSS.supports('clip-path', 'circle(50%)')) {
  element.classList.add('supports-clip-path');
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 实用场景

### 题目

clip-path 的实用场景？

**选项：**
- A. 创建特殊形状
- B. 图片裁剪
- C. 悬停效果
- D. 加载动画

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**✅ A. 特殊形状**
```css
.hexagon {
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}

.star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
```

**✅ B. 图片裁剪**
```css
.circular-image {
  clip-path: circle(50%);
}

.diagonal-cut {
  clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
}
```

**✅ C. 悬停效果**
```css
.card {
  clip-path: inset(0);
  transition: clip-path 0.3s;
}

.card:hover {
  clip-path: inset(0 0 50% 0);
}
```

**✅ D. 加载动画**
```css
@keyframes reveal {
  from {
    clip-path: circle(0 at 50% 50%);
  }
  to {
    clip-path: circle(100% at 50% 50%);
  }
}

.loading {
  animation: reveal 1s forwards;
}
```

**综合示例：**
```css
/* 对话气泡 */
.speech-bubble {
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% 75%,
    75% 75%,
    75% 100%,
    50% 75%,
    0% 75%
  );
}

/* 进度条reveal */
@keyframes progress {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0);
  }
}
```

</details>

---

**导航**  
[上一章：第 42 章 - 计算函数](./chapter-42.md) | [返回目录](../README.md) | [下一章：第 44 章 - CSS方法论](./chapter-44.md)
