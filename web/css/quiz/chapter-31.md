# 第 31 章：布局与绘制 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 重排与重绘

### 题目

重排（Reflow）和重绘（Repaint）的区别是？

**选项：**
- A. 没有区别
- B. 重排计算布局，重绘绘制像素
- C. 重绘性能消耗更大
- D. 重排只发生一次

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**重排（Reflow）vs 重绘（Repaint）**

**重排（布局计算）：**
```javascript
// 修改几何属性
element.style.width = '200px';
// → 重新计算布局（Reflow）→ 重绘（Repaint）
```

**重绘（像素绘制）：**
```javascript
// 修改视觉属性
element.style.color = 'red';
// → 重绘（Repaint）（无需重排）
```

**流程对比：**
```
重排：样式变化 → 重新计算布局 → 重绘 → 合成
重绘：样式变化 → 重绘 → 合成
合成：样式变化 → 合成
```

**性能消耗：**
```
重排 > 重绘 > 合成
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 触发重排

### 题目

以下哪个操作会触发重排？

**选项：**
- A. 修改 `color`
- B. 修改 `width`
- C. 修改 `opacity`
- D. 修改 `transform`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**触发重排的属性**

**✅ B. width（几何属性）**
```javascript
element.style.width = '200px';
// → 重排 + 重绘
```

**❌ A. color（视觉属性）**
```javascript
element.style.color = 'red';
// → 重绘（无重排）
```

**❌ C. opacity（合成属性）**
```javascript
element.style.opacity = 0.5;
// → 合成（无重排、无重绘）
```

**❌ D. transform（合成属性）**
```javascript
element.style.transform = 'translateX(100px)';
// → 合成（无重排、无重绘）
```

**属性分类：**

**触发重排：**
```
width, height, padding, margin, border
top, left, right, bottom
font-size, line-height
display, position, float
```

**只触发重绘：**
```
color, background, box-shadow
border-color, outline
visibility
```

**只触发合成：**
```
transform, opacity
filter, will-change
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 强制同步布局

### 题目

读取 `offsetWidth` 会强制浏览器进行同步布局计算。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**强制同步布局（Forced Synchronous Layout）**

```javascript
// 写入样式（异步）
element.style.width = '100px';

// 读取布局信息（强制同步）
const width = element.offsetWidth;
// ⚠️ 浏览器必须立即计算布局
```

**触发强制同步布局的属性：**
```javascript
// 尺寸
offsetWidth, offsetHeight
clientWidth, clientHeight
scrollWidth, scrollHeight

// 位置
offsetTop, offsetLeft
getBoundingClientRect()

// 滚动
scrollTop, scrollLeft

// 计算样式
getComputedStyle()
```

**性能问题：**
```javascript
// ❌ 布局抖动（Layout Thrashing）
for (let i = 0; i < 100; i++) {
  element.style.width = element.offsetWidth + 10 + 'px';
  // 每次循环都强制重排
}

// ✅ 批量读写
const width = element.offsetWidth;
for (let i = 0; i < 100; i++) {
  element.style.width = width + 10 + 'px';
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 优化重排

### 题目

避免频繁重排的方法有？

**选项：**
- A. 批量修改 DOM
- B. 使用 DocumentFragment
- C. 离线操作 DOM
- D. 使用 transform

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**优化重排策略（全部正确）**

**✅ A. 批量修改 DOM**
```javascript
// ❌ 多次重排
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// ✅ 一次重排（使用 cssText）
element.style.cssText = 'width:100px;height:100px;margin:10px';

// ✅ 一次重排（使用类名）
element.className = 'box';
```

**✅ B. 使用 DocumentFragment**
```javascript
// ❌ 多次重排
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div);
}

// ✅ 一次重排
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

**✅ C. 离线操作 DOM**
```javascript
// 方法1：display: none
element.style.display = 'none';
// 进行多次修改
element.style.width = '100px';
element.style.height = '100px';
element.style.display = 'block';

// 方法2：克隆节点
const clone = element.cloneNode(true);
// 修改 clone
clone.style.width = '100px';
element.parentNode.replaceChild(clone, element);

// 方法3：文档片段
const parent = element.parentNode;
const next = element.nextSibling;
parent.removeChild(element);
// 修改 element
parent.insertBefore(element, next);
```

**✅ D. 使用 transform**
```javascript
// ❌ 触发重排
element.style.left = '100px';

// ✅ 只触发合成
element.style.transform = 'translateX(100px)';
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 布局抖动

### 题目

什么是布局抖动（Layout Thrashing）？

**选项：**
- A. 布局计算错误
- B. 频繁的读写布局属性导致多次重排
- C. CSS 动画卡顿
- D. DOM 结构混乱

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**布局抖动（Layout Thrashing）**

**问题示例：**
```javascript
// ❌ 布局抖动
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
  // 读取布局 → 强制重排
  const height = box.offsetHeight;
  
  // 写入样式 → 标记需要重排
  box.style.height = height + 10 + 'px';
  
  // 下次循环又读取 → 再次强制重排
});
// 总共触发 N 次重排
```

**优化方案：**
```javascript
// ✅ 批量读写
const boxes = document.querySelectorAll('.box');

// 1. 先读取所有
const heights = Array.from(boxes).map(box => box.offsetHeight);

// 2. 再写入所有
boxes.forEach((box, i) => {
  box.style.height = heights[i] + 10 + 'px';
});
// 只触发 1 次重排
```

**FastDOM 库：**
```javascript
import fastdom from 'fastdom';

boxes.forEach(box => {
  fastdom.measure(() => {
    const height = box.offsetHeight;
    
    fastdom.mutate(() => {
      box.style.height = height + 10 + 'px';
    });
  });
});
// 自动批量处理读写
```

**可视化：**
```
❌ 布局抖动：
读 → 强制重排 → 写 → 读 → 强制重排 → 写 ...

✅ 批量读写：
读 → 读 → 读 → 写 → 写 → 写 → 重排（一次）
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 绘制层

### 题目

什么情况下元素会被提升到单独的绘制层？

**选项：**
- A. `position: absolute`
- B. `transform: translateZ(0)`
- C. `overflow: scroll`
- D. B 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**创建绘制层（Paint Layer）的条件**

**❌ A. position: absolute（不创建）**
```css
.box {
  position: absolute;
  /* 不创建独立绘制层 */
}
```

**✅ B. transform 3D**
```css
.box {
  transform: translateZ(0);
  /* 创建合成层 */
}
```

**✅ C. overflow: scroll**
```css
.box {
  overflow: scroll;
  /* 创建绘制层 */
}
```

**完整创建条件：**

**合成层（Compositing Layer）：**
```css
/* 3D transform */
transform: translateZ(0);
transform: translate3d(0,0,0);

/* will-change */
will-change: transform;

/* video, canvas */
<video>, <canvas>

/* opacity 动画 */
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* filter */
filter: blur(5px);
```

**绘制层（Paint Layer）：**
```css
/* overflow */
overflow: auto;
overflow: scroll;

/* 定位 + z-index */
position: relative;
z-index: 1;

/* opacity < 1 */
opacity: 0.9;
```

**Chrome DevTools 查看：**
```
1. 打开 DevTools
2. More tools → Layers
3. 查看图层树
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** will-change

### 题目

`will-change` 的作用是什么？

**选项：**
- A. 强制重排
- B. 提示浏览器元素将要变化，提前优化
- C. 阻止重绘
- D. 创建动画

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**will-change 属性**

**作用：提示浏览器提前优化**
```css
.box {
  will-change: transform, opacity;
  /* 浏览器会提前创建合成层 */
}
```

**使用场景：**
```css
/* 即将发生的动画 */
.menu {
  will-change: transform;
}

.menu.open {
  transform: translateX(0);
  transition: transform 0.3s;
}
```

**注意事项：**

**❌ 不要滥用：**
```css
/* ❌ 错误：给所有元素添加 */
* {
  will-change: transform;
  /* 浪费内存 */
}
```

**✅ 动态添加/移除：**
```javascript
// 动画前添加
element.style.willChange = 'transform';

element.addEventListener('transitionend', () => {
  // 动画后移除
  element.style.willChange = 'auto';
});
```

**✅ 只在需要时使用：**
```css
.box:hover {
  will-change: transform;
}

.box:active {
  transform: scale(1.1);
}
```

**可选值：**
```css
will-change: auto;         /* 默认 */
will-change: transform;    /* 单个属性 */
will-change: opacity, transform;  /* 多个属性 */
will-change: scroll-position;  /* 滚动 */
will-change: contents;     /* 内容 */
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能分析

### 题目

如何使用 Chrome DevTools 分析重排和重绘？

**选项：**
- A. Performance 面板
- B. Elements 面板
- C. Console 面板
- D. A 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**使用 Performance 面板分析**

**步骤：**
```
1. 打开 DevTools（F12）
2. 切换到 Performance 面板
3. 点击录制按钮（●）
4. 执行操作
5. 停止录制
6. 分析火焰图
```

**关键指标：**

**Rendering（渲染）：**
```
- Layout（重排）→ 黄色
- Paint（重绘）→ 绿色
- Composite（合成）→ 紫色
```

**Main（主线程）：**
```
- Recalculate Style（样式计算）
- Layout（布局）
- Update Layer Tree（更新图层树）
- Paint（绘制）
- Composite Layers（合成图层）
```

**性能优化检查清单：**

**1. Rendering 面板：**
```
DevTools → More tools → Rendering

勾选：
☑ Paint flashing（绘制闪烁）
☑ Layout Shift Regions（布局偏移）
☑ Layer borders（图层边界）
☑ Frame Rendering Stats（帧渲染统计）
```

**2. 命令面板快捷操作：**
```
Ctrl+Shift+P → 输入命令

- Show Rendering
- Show Performance monitor
- Show Layers
```

**3. 分析重排成本：**
```javascript
// 方法1：Performance.mark
performance.mark('start');
element.style.width = '100px';
performance.mark('end');
performance.measure('reflow', 'start', 'end');

// 方法2：Console.time
console.time('reflow');
element.style.width = '100px';
console.timeEnd('reflow');
```

**4. 避免的模式：**
```javascript
// ❌ 强制同步布局
function bad() {
  element.style.width = '100px';
  const width = element.offsetWidth;  // 强制重排
  console.log(width);
}

// ✅ 批量读写
function good() {
  const width = element.offsetWidth;  // 读
  element.style.width = width + 100 + 'px';  // 写
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 渲染优化

### 题目

以下哪种方式性能最好？

**选项：**
- A. 修改 `left` 实现动画
- B. 修改 `margin-left` 实现动画
- C. 修改 `transform: translateX()` 实现动画
- D. C 最好

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**动画性能对比**

**❌ A. left（最差）**
```css
@keyframes moveLeft {
  from { left: 0; }
  to { left: 100px; }
}
/* 每一帧都触发重排 + 重绘 */
```

**❌ B. margin-left（差）**
```css
@keyframes moveMargin {
  from { margin-left: 0; }
  to { margin-left: 100px; }
}
/* 每一帧都触发重排 + 重绘 */
```

**✅ C. transform（最好）**
```css
@keyframes moveTransform {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
/* 只触发合成，GPU 加速 */
```

**性能对比表：**

| 属性 | 重排 | 重绘 | 合成 | 性能 |
|------|------|------|------|------|
| left | ✅ | ✅ | ✅ | 差 |
| margin-left | ✅ | ✅ | ✅ | 差 |
| transform | ❌ | ❌ | ✅ | 好 |
| opacity | ❌ | ❌ | ✅ | 好 |

**完整优化示例：**

**❌ 低性能：**
```css
.box {
  position: absolute;
  transition: left 0.3s;
}

.box:hover {
  left: 100px;
}
```

**✅ 高性能：**
```css
.box {
  transition: transform 0.3s;
  will-change: transform;
}

.box:hover {
  transform: translateX(100px);
}
```

**60fps 动画检查：**
```javascript
let lastTime = performance.now();
let frame = 0;

function animate() {
  const now = performance.now();
  const delta = now - lastTime;
  
  if (delta > 16.67) {
    console.warn('掉帧！', delta);
  }
  
  element.style.transform = `translateX(${frame}px)`;
  frame++;
  
  lastTime = now;
  requestAnimationFrame(animate);
}
```

**推荐的动画属性：**
```css
/* ✅ 只用这些属性做动画 */
transform: translate(), scale(), rotate()
opacity
filter
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 渲染优化最佳实践

### 题目

渲染性能优化的最佳实践有？

**选项：**
- A. 避免强制同步布局
- B. 减少重排范围
- C. 使用 transform 和 opacity
- D. 合理使用 will-change

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**渲染性能优化全指南（全部正确）**

**✅ A. 避免强制同步布局**
```javascript
// ❌ 强制同步布局
for (let i = 0; i < boxes.length; i++) {
  const width = boxes[i].offsetWidth;  // 读
  boxes[i].style.width = width + 10 + 'px';  // 写
}

// ✅ 批量读写
const widths = boxes.map(box => box.offsetWidth);
boxes.forEach((box, i) => {
  box.style.width = widths[i] + 10 + 'px';
});
```

**✅ B. 减少重排范围**
```css
/* ❌ 影响整个文档 */
body {
  font-size: 20px;
}

/* ✅ 只影响子树 */
.container {
  font-size: 20px;
}

/* ✅ 使用 BFC 隔离 */
.isolated {
  contain: layout;
  /* 内部变化不影响外部 */
}
```

**✅ C. 使用 transform 和 opacity**
```css
/* ❌ 触发重排 */
.move { left: 100px; }
.fade { visibility: hidden; }

/* ✅ 只触发合成 */
.move { transform: translateX(100px); }
.fade { opacity: 0; }
```

**✅ D. 合理使用 will-change**
```javascript
// 动画前
element.style.willChange = 'transform';

// 执行动画
element.style.transform = 'translateX(100px)';

// 动画后清理
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
});
```

**完整优化清单：**

**1. CSS 优化：**
```css
/* 减少选择器复杂度 */
.nav-item { }  /* ✅ */
body > nav > ul > li:nth-child(2) { }  /* ❌ */

/* 避免昂贵的属性 */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);  /* ✅ */
box-shadow: 0 0 50px 20px rgba(0,0,0,0.5);  /* ❌ */

/* 使用 contain */
.widget {
  contain: layout style paint;
}
```

**2. JavaScript 优化：**
```javascript
// 使用 requestAnimationFrame
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)';
});

// 虚拟滚动
const visibleItems = getVisibleItems();
renderItems(visibleItems);

// 防抖/节流
const handleScroll = throttle(() => {
  // 滚动处理
}, 16);
```

**3. 资源优化：**
```html
<!-- 字体加载 -->
<link rel="preload" href="font.woff2" as="font">

<!-- 图片懒加载 -->
<img loading="lazy" src="image.jpg">

<!-- CSS 关键路径 -->
<style>/* 关键 CSS */</style>
<link rel="preload" href="main.css" as="style">
```

**4. 性能监控：**
```javascript
// PerformanceObserver
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});

observer.observe({ entryTypes: ['measure', 'paint'] });
```

</details>

---

**导航**  
[上一章：第 30 章 - 渲染树构建](./chapter-30.md) | [返回目录](../README.md) | [下一章：第 32 章 - 图层与合成](./chapter-32.md)
