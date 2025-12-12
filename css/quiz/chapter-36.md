# 第 36 章：2D 变换 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** transform 函数

### 题目

`translate(50px, 100px)` 的效果是？

**选项：**
- A. 向右50px，向上100px
- B. 向右50px，向下100px
- C. 向左50px，向下100px
- D. 旋转

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**translate 平移**

```css
.box {
  transform: translate(50px, 100px);
  /* X轴右移50px，Y轴下移100px */
}
```

**单轴平移：**
```css
transform: translateX(50px);   /* 只水平移动 */
transform: translateY(100px);  /* 只垂直移动 */
```

**负值：**
```css
transform: translate(-50px, -100px);
/* 向左50px，向上100px */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** scale

### 题目

`scale(2)` 等同于？

**选项：**
- A. `scale(2, 2)`
- B. `scale(2, 1)`
- C. `scale(1, 2)`
- D. `scaleX(2)`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**scale 缩放**

```css
/* 等比缩放 */
transform: scale(2);        /* = scale(2, 2) */
transform: scale(0.5);      /* 缩小到50% */

/* 非等比缩放 */
transform: scale(2, 1);     /* 水平2倍，垂直不变 */
transform: scaleX(2);       /* 只水平缩放 */
transform: scaleY(0.5);     /* 只垂直缩放 */
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** transform-origin

### 题目

`transform-origin` 默认值是 `center center`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**transform-origin 变换原点**

```css
/* 默认值 */
transform-origin: center center;  /* 或 50% 50% */

/* 其他值 */
transform-origin: top left;       /* 左上角 */
transform-origin: 0 0;            /* 同上 */
transform-origin: 25% 75%;        /* 自定义 */
```

**影响效果：**
```css
.rotate-center {
  transform-origin: center;
  transform: rotate(45deg);  /* 绕中心旋转 */
}

.rotate-corner {
  transform-origin: top left;
  transform: rotate(45deg);  /* 绕左上角旋转 */
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 2D transform 函数

### 题目

2D transform 包含哪些函数？

**选项：**
- A. translate, rotate
- B. scale, skew
- C. matrix
- D. perspective

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**2D transform 函数**

**✅ A. 平移和旋转**
```css
translate(x, y)
translateX(x)
translateY(y)
rotate(angle)
```

**✅ B. 缩放和倾斜**
```css
scale(x, y)
scaleX(x)
scaleY(y)
skew(x-angle, y-angle)
skewX(angle)
skewY(angle)
```

**✅ C. 矩阵**
```css
matrix(a, b, c, d, e, f)
/* 
  a: scaleX
  b: skewY
  c: skewX
  d: scaleY
  e: translateX
  f: translateY
*/
```

**❌ D. perspective（3D）**
```css
perspective(length)  /* 这是3D变换 */
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 组合变换

### 题目

`transform: translate(50px) rotate(45deg)` 的执行顺序？

**选项：**
- A. 先旋转，后平移
- B. 先平移，后旋转
- C. 同时执行
- D. 从右到左：先旋转，后平移

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**transform 执行顺序：从右到左**

```css
transform: translate(50px) rotate(45deg);
/* 执行：1.rotate → 2.translate */
```

**顺序影响结果：**
```css
/* 先平移后旋转 */
transform: rotate(45deg) translate(50px);
/* 沿着旋转后的坐标轴平移 */

/* 先旋转后平移 */
transform: translate(50px) rotate(45deg);
/* 沿着原始坐标轴平移 */
```

**可视化：**
```
translate → rotate:
□ → □(向右50px) → ◇(旋转45°)

rotate → translate:
□ → ◇(旋转45°) → ◇(沿新坐标轴移动)
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** skew

### 题目

`skew(30deg, 0)` 的效果是？

**选项：**
- A. 水平倾斜30度
- B. 垂直倾斜30度
- C. 旋转30度
- D. 缩放30%

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**skew 倾斜**

```css
skew(x-angle, y-angle)

skew(30deg, 0)     /* 水平倾斜 */
skew(0, 30deg)     /* 垂直倾斜 */
skewX(30deg)       /* = skew(30deg, 0) */
skewY(30deg)       /* = skew(0, 30deg) */
```

**可视化效果：**
```
原始：
┌──┐
│  │
└──┘

skewX(30deg):
   ┌──┐
  /  /
 └──┘

skewY(30deg):
┌──┐
│ /
│/
└
```

**实用场景：**
```css
/* 平行四边形 */
.parallelogram {
  transform: skewX(-20deg);
}

/* 标签效果 */
.ribbon {
  transform: skewY(-5deg);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 居中技巧

### 题目

使用 transform 实现居中的方法？

**选项：**
- A. `transform: translate(50%, 50%)`
- B. `left: 50%; transform: translateX(-50%)`
- C. `top: 50%; left: 50%; transform: translate(-50%, -50%)`
- D. C 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**transform 居中技巧**

```css
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**原理：**
```
1. top: 50% → 元素顶部到父元素中心
2. left: 50% → 元素左侧到父元素中心
3. translate(-50%, -50%) → 向回偏移自身宽高的50%
```

**优势：**
- 不需要知道元素尺寸
- 适用于任意大小元素
- 支持响应式

**对比其他方法：**
```css
/* Flexbox */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Grid */
.parent {
  display: grid;
  place-items: center;
}

/* margin auto（需要固定尺寸）*/
.child {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  margin: auto;
  width: 100px;
  height: 100px;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** matrix

### 题目

`matrix(a, b, c, d, e, f)` 的参数含义？

**选项：**
- A. 6个随机参数
- B. 变换矩阵的6个值
- C. 坐标点
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**matrix 矩阵变换**

```
matrix(a, b, c, d, e, f) 对应矩阵：
┌     ┐
│ a c e │
│ b d f │
│ 0 0 1 │
└     ┘

a: scaleX（水平缩放）
b: skewY（垂直倾斜）
c: skewX（水平倾斜）
d: scaleY（垂直缩放）
e: translateX（水平平移）
f: translateY（垂直平移）
```

**等价转换：**
```css
/* 平移 */
translate(tx, ty) = matrix(1, 0, 0, 1, tx, ty)

/* 缩放 */
scale(sx, sy) = matrix(sx, 0, 0, sy, 0, 0)

/* 旋转 */
rotate(θ) = matrix(cos(θ), sin(θ), -sin(θ), cos(θ), 0, 0)

/* 倾斜 */
skewX(θ) = matrix(1, 0, tan(θ), 1, 0, 0)
```

**实例：**
```css
/* 45度旋转 */
transform: rotate(45deg);
/* 等同于 */
transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

为什么推荐用 `transform` 而非 `position` 做动画？

**选项：**
- A. 语法简单
- B. 只触发合成，不触发重排重绘
- C. 浏览器支持更好
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**transform vs position 性能**

**❌ position（触发重排）**
```css
@keyframes movePosition {
  from { left: 0; }
  to { left: 100px; }
}
/* 每帧：Layout → Paint → Composite */
```

**✅ transform（只触发合成）**
```css
@keyframes moveTransform {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
/* 每帧：Composite（GPU加速）*/
```

**性能对比：**
```
position: 15-20ms/帧
transform: 1-2ms/帧

提升: 10倍以上
```

**推荐属性：**
```css
/* ✅ 高性能动画 */
transform
opacity
filter

/* ❌ 避免动画 */
width, height
left, top, right, bottom
margin, padding
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** transform 应用

### 题目

transform 的实用应用场景有？

**选项：**
- A. 居中布局
- B. 图形绘制
- C. 动画效果
- D. 响应式设计

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**transform 实用场景（全部正确）**

**✅ A. 居中布局**
```css
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**✅ B. 图形绘制**
```css
/* 三角形 */
.triangle {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-bottom-color: red;
  transform: rotate(180deg);
}

/* 平行四边形 */
.parallelogram {
  transform: skewX(-20deg);
}

/* 菱形 */
.diamond {
  transform: rotate(45deg);
}
```

**✅ C. 动画效果**
```css
/* 缩放悬停 */
.card:hover {
  transform: scale(1.05);
}

/* 旋转加载 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 翻转卡片 */
.card.flipped {
  transform: rotateY(180deg);
}
```

**✅ D. 响应式设计**
```css
/* 移动端缩小 */
@media (max-width: 768px) {
  .large-element {
    transform: scale(0.8);
  }
}

/* 旋转适配 */
@media (orientation: landscape) {
  .portrait-only {
    transform: rotate(90deg);
  }
}
```

**综合示例：**
```css
/* 卡片翻转效果 */
.card {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card:hover {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
```

</details>

---

**导航**  
[上一章：第 35 章 - 动画性能优化](./chapter-35.md) | [返回目录](../README.md) | [下一章：第 37 章 - 3D变换](./chapter-37.md)
