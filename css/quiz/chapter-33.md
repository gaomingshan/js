# 第 33 章：transform 与 opacity 优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** transform 优化

### 题目

为什么 `transform` 性能比 `left/top` 好？

**选项：**
- A. 代码更简洁
- B. 只触发合成，不触发重排重绘
- C. 浏览器支持更好
- D. 占用内存更少

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**transform 性能优势**

**❌ left/top（触发重排）**
```css
.box {
  position: absolute;
  left: 0;
  transition: left 0.3s;
}

.box:hover {
  left: 100px;
}
/* 每一帧：重排 → 重绘 → 合成 */
```

**✅ transform（只触发合成）**
```css
.box {
  transition: transform 0.3s;
}

.box:hover {
  transform: translateX(100px);
}
/* 每一帧：合成（GPU 加速）*/
```

**渲染流程对比：**
```
left/top:
样式变化 → 重排(Layout) → 重绘(Paint) → 合成(Composite)

transform:
样式变化 → 合成(Composite)
```

**性能差异：**
```
重排：10-20ms
重绘：5-10ms
合成：1-2ms
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** opacity 优化

### 题目

`opacity` 为什么性能好？

**选项：**
- A. 不创建合成层
- B. 创建合成层，GPU 处理
- C. 不影响布局
- D. B 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**opacity 性能优势**

**✅ B. 创建合成层**
```css
.fade {
  opacity: 0.5;
  /* 动画时创建合成层 */
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**✅ C. 不影响布局**
```css
.box {
  opacity: 0;
  /* 仍占据空间，不触发重排 */
}
```

**对比 visibility 和 display：**

| 属性 | 占据空间 | 触发重排 | 性能 |
|------|---------|---------|------|
| `display: none` | ❌ | ✅ | 差 |
| `visibility: hidden` | ✅ | ❌ | 中 |
| `opacity: 0` | ✅ | ❌ | 好 |

**GPU 加速：**
```css
.fade {
  opacity: 0;
  transition: opacity 0.3s;
  /* GPU 合成层处理 */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 合成属性

### 题目

只有 `transform` 和 `opacity` 才能触发 GPU 加速。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**触发 GPU 加速的属性**

**transform 和 opacity：**
```css
.box {
  transform: translateX(100px);
  opacity: 0.5;
}
```

**其他属性也可以：**

**filter：**
```css
.blur {
  filter: blur(10px);
  /* 创建合成层 */
}
```

**will-change：**
```css
.hint {
  will-change: transform, opacity;
  /* 提前创建合成层 */
}
```

**backdrop-filter：**
```css
.glass {
  backdrop-filter: blur(10px);
}
```

**完整列表：**
```css
/* 合成属性（GPU 加速）*/
transform
opacity
filter
backdrop-filter
will-change
/* 媒体元素 */
<video>, <canvas>
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** transform 函数

### 题目

以下哪些 transform 函数只触发合成？

**选项：**
- A. `translate()`
- B. `scale()`
- C. `rotate()`
- D. 全部

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D（全部）

### 📖 解析

**所有 transform 函数都只触发合成**

**✅ A. translate（平移）**
```css
.move {
  transform: translate(100px, 50px);
  transform: translateX(100px);
  transform: translateY(50px);
  transform: translateZ(0);
  transform: translate3d(100px, 50px, 0);
}
```

**✅ B. scale（缩放）**
```css
.zoom {
  transform: scale(1.5);
  transform: scaleX(1.5);
  transform: scaleY(1.5);
  transform: scale3d(1.5, 1.5, 1);
}
```

**✅ C. rotate（旋转）**
```css
.spin {
  transform: rotate(45deg);
  transform: rotateX(45deg);
  transform: rotateY(45deg);
  transform: rotateZ(45deg);
  transform: rotate3d(1, 1, 0, 45deg);
}
```

**✅ 其他函数：**
```css
/* skew（倾斜）*/
transform: skew(10deg, 5deg);

/* matrix（矩阵）*/
transform: matrix(1, 0, 0, 1, 100, 50);

/* perspective（透视）*/
transform: perspective(1000px);
```

**组合使用：**
```css
.complex {
  transform: 
    translateX(100px)
    rotate(45deg)
    scale(1.5);
  /* 所有都在 GPU 上执行 */
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 性能对比

### 题目

实现元素移动，哪种方式最优？

**选项：**
- A. 修改 `margin-left`
- B. 修改 `left`
- C. 使用 `transform: translateX()`
- D. C 最优

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**移动方案性能对比**

**❌ A. margin-left（最差）**
```css
.move {
  margin-left: 100px;
}
/* 影响布局，触发重排 */
```

**❌ B. left（差）**
```css
.move {
  position: relative;
  left: 100px;
}
/* 不影响其他元素布局，但仍需重绘 */
```

**✅ C. transform（最优）**
```css
.move {
  transform: translateX(100px);
}
/* 只触发合成，GPU 加速 */
```

**性能测试：**
```javascript
// 测试 1000 次移动
console.time('margin-left');
for (let i = 0; i < 1000; i++) {
  element.style.marginLeft = i + 'px';
}
console.timeEnd('margin-left');  // ~500ms

console.time('left');
for (let i = 0; i < 1000; i++) {
  element.style.left = i + 'px';
}
console.timeEnd('left');  // ~200ms

console.time('transform');
for (let i = 0; i < 1000; i++) {
  element.style.transform = `translateX(${i}px)`;
}
console.timeEnd('transform');  // ~50ms
```

**流程对比：**

| 方式 | Layout | Paint | Composite | 时间 |
|------|--------|-------|-----------|------|
| margin-left | ✅ | ✅ | ✅ | 慢 |
| left | ❌ | ✅ | ✅ | 中 |
| transform | ❌ | ❌ | ✅ | 快 |

**最佳实践：**
```css
/* ✅ 动画用 transform */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* ❌ 避免用 left/margin */
@keyframes slideWrong {
  from { left: 0; }
  to { left: 100px; }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 子像素渲染

### 题目

`transform: translateX(10.5px)` 会怎样？

**选项：**
- A. 四舍五入到 11px
- B. 支持子像素，保持 10.5px
- C. 向下取整到 10px
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**transform 子像素渲染**

**支持小数值：**
```css
.box {
  transform: translateX(10.5px);
  /* GPU 支持亚像素渲染 */
}
```

**对比其他属性：**

**left/top（可能取整）：**
```css
.box {
  left: 10.5px;
  /* 浏览器可能取整 */
}
```

**transform（精确）：**
```css
.box {
  transform: translateX(10.5px);
  /* GPU 精确计算 */
}
```

**实用场景：**

**平滑动画：**
```css
@keyframes smoothMove {
  0% { transform: translateX(0); }
  100% { transform: translateX(100.7px); }
  /* 精确到小数点 */
}
```

**居中偏移：**
```css
.centered {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  /* 精确居中，支持小数 */
}
```

**注意事项：**
```css
/* ⚠️ 可能导致模糊 */
.text {
  transform: translateX(10.5px);
  /* 文本可能在非整数像素上模糊 */
}

/* ✅ 文本保持清晰 */
.text {
  transform: translateX(10px);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 3D transform

### 题目

为什么推荐使用 `translate3d(x, y, 0)` 而非 `translate(x, y)`？

**选项：**
- A. 语法更简洁
- B. 强制开启 GPU 加速
- C. 兼容性更好
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**2D vs 3D Transform**

**2D（可能不创建合成层）：**
```css
.box {
  transform: translate(100px, 50px);
  /* 某些情况不会创建合成层 */
}
```

**3D（强制创建合成层）：**
```css
.box {
  transform: translate3d(100px, 50px, 0);
  /* 必定创建合成层，GPU 加速 */
}
```

**Hack 技巧：**
```css
/* translateZ(0) hack */
.box {
  transform: translateZ(0);
  /* 强制 GPU 加速 */
}

/* translate3d hack */
.box {
  transform: translate3d(0, 0, 0);
  /* 同样效果 */
}
```

**现代替代方案：**
```css
/* ✅ 推荐：will-change */
.box {
  will-change: transform;
  /* 语义更清晰 */
}

/* ⚠️ 老方法：translateZ(0) */
.box {
  transform: translateZ(0);
}
```

**对比表：**

| 方法 | 合成层 | 兼容性 | 推荐度 |
|------|--------|-------|--------|
| `translate()` | 可能 | 好 | ⭐⭐⭐ |
| `translate3d()` | 必定 | 好 | ⭐⭐⭐⭐ |
| `translateZ(0)` | 必定 | 好 | ⭐⭐⭐⭐ |
| `will-change` | 必定 | 新 | ⭐⭐⭐⭐⭐ |

**最佳实践：**
```css
/* 现代浏览器 */
.box {
  will-change: transform;
}

/* 降级方案 */
@supports not (will-change: transform) {
  .box {
    transform: translateZ(0);
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 动画优化

### 题目

如何优化以下动画？

```css
@keyframes fade {
  from { background: red; }
  to { background: blue; }
}
```

**选项：**
- A. 使用 `opacity`
- B. 使用 `filter`
- C. 使用伪元素 + opacity
- D. C 最优

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**背景色动画优化**

**❌ 原方案（触发重绘）**
```css
@keyframes fade {
  from { background: red; }
  to { background: blue; }
}
/* 每一帧都重绘 */
```

**⚠️ A. opacity（不能改变颜色）**
```css
/* 只能淡入淡出，无法改变颜色 */
```

**⚠️ B. filter（性能较差）**
```css
@keyframes tint {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(180deg); }
}
/* 创建合成层，但计算复杂 */
```

**✅ C. 伪元素 + opacity（最优）**
```css
.box {
  position: relative;
}

.box::before,
.box::after {
  content: '';
  position: absolute;
  inset: 0;
  transition: opacity 0.3s;
}

.box::before {
  background: red;
  opacity: 1;
}

.box::after {
  background: blue;
  opacity: 0;
}

.box:hover::before {
  opacity: 0;
}

.box:hover::after {
  opacity: 1;
}
```

**完整优化示例：**

**方案1：叠加层**
```html
<div class="gradient-box">
  <div class="layer layer-1"></div>
  <div class="layer layer-2"></div>
  <div class="content">Content</div>
</div>
```

```css
.gradient-box {
  position: relative;
}

.layer {
  position: absolute;
  inset: 0;
  transition: opacity 0.3s;
}

.layer-1 {
  background: linear-gradient(to right, red, yellow);
  opacity: 1;
}

.layer-2 {
  background: linear-gradient(to right, blue, green);
  opacity: 0;
}

.gradient-box:hover .layer-1 {
  opacity: 0;
}

.gradient-box:hover .layer-2 {
  opacity: 1;
}

.content {
  position: relative;
  z-index: 1;
}
```

**方案2：CSS 变量（现代）**
```css
.box {
  --color-1: red;
  --color-2: blue;
  --mix: 0;
  background: color-mix(
    in srgb,
    var(--color-1) calc((1 - var(--mix)) * 100%),
    var(--color-2) calc(var(--mix) * 100%)
  );
  transition: --mix 0.3s;
}

.box:hover {
  --mix: 1;
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** transform-origin

### 题目

`transform-origin` 影响性能吗？

**选项：**
- A. 影响，会触发重排
- B. 不影响，只改变变换中心
- C. 影响合成层创建
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**transform-origin 性能**

**不影响性能：**
```css
.box {
  transform-origin: center center;
  transform: rotate(45deg);
  /* origin 只改变计算基点 */
}

.box-2 {
  transform-origin: top left;
  transform: rotate(45deg);
  /* 同样的性能 */
}
```

**计算差异（GPU 处理）：**
```
center: 绕中心旋转
top left: 绕左上角旋转

两者都在 GPU 上计算，性能相同
```

**实用示例：**

**缩放中心：**
```css
.zoom {
  transform-origin: center;
  transition: transform 0.3s;
}

.zoom:hover {
  transform: scale(1.2);
  /* 从中心放大 */
}
```

**旋转门效果：**
```css
.door {
  transform-origin: left center;
  transition: transform 0.5s;
}

.door.open {
  transform: rotateY(90deg);
  /* 从左边缘旋转 */
}
```

**百分比值：**
```css
.box {
  transform-origin: 25% 75%;
  /* x: 25% from left, y: 75% from top */
}
```

**注意事项：**
```css
/* ✅ 不影响性能 */
.box {
  transform-origin: 10% 90%;
  transform: scale(2);
}

/* ❌ 改变 origin 本身不触发动画 */
.box {
  transition: transform-origin 0.3s;
  /* 无效 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 优化最佳实践

### 题目

使用 transform 和 opacity 的最佳实践？

**选项：**
- A. 只用这两个属性做动画
- B. 配合 will-change 使用
- C. 避免在动画中修改其他属性
- D. 使用 requestAnimationFrame

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**transform/opacity 优化全指南（全部正确）**

**✅ A. 专注两大属性**
```css
/* ✅ 推荐：只用 transform 和 opacity */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ❌ 避免：混合其他属性 */
@keyframes slideInBad {
  from {
    left: -100px;  /* 触发重排 */
    background: red;  /* 触发重绘 */
  }
  to {
    left: 0;
    background: blue;
  }
}
```

**✅ B. 配合 will-change**
```css
.animating {
  will-change: transform, opacity;
}

.animating.active {
  transform: scale(1.2);
  opacity: 0.8;
}
```

**✅ C. 隔离其他属性**
```javascript
// ❌ 混合修改
element.style.transform = 'translateX(100px)';
element.style.width = '200px';  // 触发重排

// ✅ 分离关注点
element.style.width = '200px';  // 先完成布局
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)';  // 后做动画
});
```

**✅ D. 使用 rAF**
```javascript
// ❌ 直接修改
element.style.transform = 'translateX(100px)';

// ✅ 使用 rAF
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)';
});

// ✅ 动画循环
let x = 0;
function animate() {
  x += 1;
  element.style.transform = `translateX(${x}px)`;
  
  if (x < 100) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

**完整优化模式：**

```javascript
class SmoothAnimator {
  constructor(element) {
    this.element = element;
    this.isAnimating = false;
  }
  
  start() {
    if (this.isAnimating) return;
    
    // 1. 准备阶段
    this.element.style.willChange = 'transform, opacity';
    
    // 2. 动画阶段
    this.isAnimating = true;
    this.animate();
  }
  
  animate() {
    requestAnimationFrame(() => {
      // 只修改 transform 和 opacity
      this.element.style.transform = `translateX(${this.x}px)`;
      this.element.style.opacity = this.opacity;
      
      if (this.isAnimating) {
        this.animate();
      }
    });
  }
  
  stop() {
    this.isAnimating = false;
    
    // 3. 清理阶段
    requestAnimationFrame(() => {
      this.element.style.willChange = 'auto';
    });
  }
}
```

**性能检查清单：**
```
☑ 只用 transform 和 opacity
☑ 动画前添加 will-change
☑ 动画后移除 will-change
☑ 使用 requestAnimationFrame
☑ 避免在动画中修改布局属性
☑ 批量读写 DOM
☑ 监控 FPS
```

</details>

---

**导航**  
[上一章：第 32 章 - 图层与合成](./chapter-32.md) | [返回目录](../README.md) | [下一章：第 34 章 - Transition与Animation原理](./chapter-34.md)
