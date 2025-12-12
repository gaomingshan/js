# 第 37 章：3D 变换 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** perspective

### 题目

`perspective` 属性的作用是？

**选项：**
- A. 设置透明度
- B. 设置观察者距离，产生透视效果
- C. 设置旋转角度
- D. 设置缩放比例

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**perspective 透视**

```css
.container {
  perspective: 1000px;
  /* 观察者距离屏幕1000px */
}

.child {
  transform: rotateY(45deg);
  /* 产生3D透视效果 */
}
```

**值越小，透视越强烈：**
```css
perspective: 500px;   /* 强透视 */
perspective: 2000px;  /* 弱透视 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** transform-style

### 题目

`transform-style: preserve-3d` 的作用是？

**选项：**
- A. 保存变换
- B. 保持子元素的3D空间
- C. 优化性能
- D. 创建阴影

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**transform-style**

```css
.parent {
  transform-style: preserve-3d;
  /* 子元素保持3D空间 */
}

.parent {
  transform-style: flat;
  /* 子元素扁平化（默认）*/
}
```

**应用场景：**
```css
/* 3D卡片翻转 */
.card {
  transform-style: preserve-3d;
}

.card-front,
.card-back {
  backface-visibility: hidden;
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** backface-visibility

### 题目

`backface-visibility: hidden` 可以隐藏元素背面。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**backface-visibility 背面可见性**

```css
.card-face {
  backface-visibility: hidden;
  /* 旋转超过90度时隐藏 */
}

.card-face {
  backface-visibility: visible;
  /* 背面可见（默认）*/
}
```

**实用场景：卡片翻转**
```css
.card {
  transform-style: preserve-3d;
}

.card-front,
.card-back {
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.card.flipped {
  transform: rotateY(180deg);
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 3D transform 函数

### 题目

3D transform 函数包括？

**选项：**
- A. `rotateX()`, `rotateY()`, `rotateZ()`
- B. `translateZ()`, `translate3d()`
- C. `scaleZ()`, `scale3d()`
- D. `perspective()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**3D transform 函数（全部正确）**

**✅ A. 3D旋转**
```css
rotateX(45deg)
rotateY(45deg)
rotateZ(45deg)
rotate3d(1, 1, 0, 45deg)
```

**✅ B. 3D平移**
```css
translateZ(100px)
translate3d(50px, 100px, 200px)
```

**✅ C. 3D缩放**
```css
scaleZ(2)
scale3d(1.5, 1.5, 2)
```

**✅ D. 透视**
```css
perspective(1000px)
```

**完整3D变换：**
```css
.box {
  transform: 
    perspective(1000px)
    rotateY(45deg)
    translateZ(100px)
    scale3d(1.2, 1.2, 1);
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** perspective vs perspective()

### 题目

`perspective` 属性和 `perspective()` 函数的区别？

**选项：**
- A. 没有区别
- B. 属性用于父元素，函数用于子元素
- C. 效果相反
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**perspective 两种用法**

**属性（父元素）：**
```css
.container {
  perspective: 1000px;
  /* 所有子元素共享同一透视点 */
}

.child {
  transform: rotateY(45deg);
}
```

**函数（子元素）：**
```css
.box {
  transform: perspective(1000px) rotateY(45deg);
  /* 每个元素有自己的透视点 */
}
```

**效果对比：**
```html
<!-- 共享透视点 -->
<div style="perspective: 1000px">
  <div class="box"></div>
  <div class="box"></div>
</div>

<!-- 独立透视点 -->
<div class="box" style="transform: perspective(1000px) rotateY(45deg)"></div>
<div class="box" style="transform: perspective(1000px) rotateY(45deg)"></div>
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 3D立方体

### 题目

创建3D立方体需要哪些关键CSS？

**选项：**
- A. perspective, transform-style
- B. 6个面的rotateX/Y
- C. translateZ定位
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**3D立方体实现**

```html
<div class="cube">
  <div class="face front">前</div>
  <div class="face back">后</div>
  <div class="face right">右</div>
  <div class="face left">左</div>
  <div class="face top">上</div>
  <div class="face bottom">下</div>
</div>
```

```css
.cube {
  width: 200px;
  height: 200px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(-20deg) rotateY(30deg);
  transition: transform 1s;
}

.face {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 1px solid #000;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.front  { transform: rotateY(  0deg) translateZ(100px); }
.back   { transform: rotateY(180deg) translateZ(100px); }
.right  { transform: rotateY( 90deg) translateZ(100px); }
.left   { transform: rotateY(-90deg) translateZ(100px); }
.top    { transform: rotateX( 90deg) translateZ(100px); }
.bottom { transform: rotateX(-90deg) translateZ(100px); }

.cube:hover {
  transform: rotateX(-20deg) rotateY(390deg);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** perspective-origin

### 题目

`perspective-origin` 的作用是？

**选项：**
- A. 设置透视强度
- B. 设置透视点位置
- C. 设置变换原点
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**perspective-origin 透视原点**

```css
.container {
  perspective: 1000px;
  perspective-origin: center center;  /* 默认 */
}

.container {
  perspective-origin: left top;       /* 左上角 */
  perspective-origin: 75% 25%;        /* 自定义 */
}
```

**效果对比：**
```css
/* 中心观察 */
perspective-origin: center;

/* 左侧观察 */
perspective-origin: left center;

/* 顶部观察 */
perspective-origin: center top;
```

**实用示例：**
```css
.scene {
  perspective: 1000px;
  perspective-origin: 50% 100%;  /* 从底部观察 */
}

.box {
  transform: rotateX(45deg);
  /* 产生从下往上看的效果 */
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

3D变换的性能考虑？

**选项：**
- A. 比2D变换性能差
- B. 创建合成层，GPU加速
- C. 避免过多3D元素
- D. B和C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**3D变换性能**

**✅ B. GPU加速**
```css
.box {
  transform: rotateY(45deg);
  /* 创建合成层，GPU处理 */
}
```

**✅ C. 避免过多**
```css
/* ❌ 过多3D元素 */
.item {
  transform: rotateY(10deg);
}
/* 1000个元素 = 1000个合成层 */

/* ✅ 按需使用 */
.item:hover {
  transform: rotateY(10deg);
}
```

**优化策略：**
```css
/* 1. 使用will-change */
.animating {
  will-change: transform;
}

/* 2. 动画后清理 */
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
});

/* 3. 降级方案 */
@media (max-width: 768px) {
  .fancy-3d {
    transform: none;  /* 移动端禁用 */
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 翻转卡片

### 题目

实现卡片翻转效果的关键？

**选项：**
- A. transform-style: preserve-3d
- B. backface-visibility: hidden
- C. rotateY(180deg)
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**卡片翻转完整实现**

```html
<div class="card">
  <div class="card-inner">
    <div class="card-front">正面</div>
    <div class="card-back">背面</div>
  </div>
</div>
```

```css
.card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;  /* ✅ A */
}

.card:hover .card-inner {
  transform: rotateY(180deg);  /* ✅ C */
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;  /* ✅ B */
}

.card-back {
  transform: rotateY(180deg);
}
```

**要点：**
1. 父元素设置 `perspective`
2. 容器设置 `transform-style: preserve-3d`
3. 两面都设置 `backface-visibility: hidden`
4. 背面预先旋转180度
5. hover时整体旋转180度

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 3D应用场景

### 题目

3D变换的实用场景有？

**选项：**
- A. 卡片翻转
- B. 3D轮播
- C. 立方体导航
- D. 视差滚动

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**3D变换应用（全部正确）**

**✅ A. 卡片翻转**
```css
.card:hover .card-inner {
  transform: rotateY(180deg);
}
```

**✅ B. 3D轮播**
```css
.carousel {
  transform-style: preserve-3d;
}

.item:nth-child(1) { transform: rotateY(0deg) translateZ(300px); }
.item:nth-child(2) { transform: rotateY(60deg) translateZ(300px); }
.item:nth-child(3) { transform: rotateY(120deg) translateZ(300px); }
```

**✅ C. 立方体导航**
```css
.cube-nav {
  transform-style: preserve-3d;
}

.cube-nav.show-top {
  transform: rotateX(-90deg);
}
```

**✅ D. 视差滚动**
```css
.layer {
  transform: translateZ(-100px) scale(2);
}

.layer-2 {
  transform: translateZ(-200px) scale(3);
}
```

</details>

---

**导航**  
[上一章：第 36 章 - 2D变换](./chapter-36.md) | [返回目录](../README.md) | [下一章：第 38 章 - Filter滤镜](./chapter-38.md)
