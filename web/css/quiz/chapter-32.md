# 第 32 章：图层与合成 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 合成层基础

### 题目

什么是合成层（Compositing Layer）？

**选项：**
- A. DOM 层
- B. 独立的绘制层，由 GPU 处理
- C. CSS 层叠上下文
- D. 渲染树节点

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**合成层（Compositing Layer）**

```
浏览器渲染层级：
1. RenderObject（渲染对象）
2. RenderLayer（渲染层）
3. GraphicsLayer（图形层/合成层）⭐
```

**合成层特点：**
- 独立的绘制表面
- GPU 处理（硬件加速）
- 不影响其他层
- 可独立变换

**示例：**
```css
.box {
  transform: translateZ(0);
  /* 创建合成层 */
}
```

**Chrome DevTools 查看：**
```
More tools → Layers
可视化查看所有合成层
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** GPU 加速

### 题目

GPU 加速的优势是？

**选项：**
- A. 减少内存使用
- B. 动画更流畅，不阻塞主线程
- C. 减少代码量
- D. 提高 JavaScript 性能

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**GPU 加速优势**

**流程对比：**

**CPU 渲染：**
```
主线程：计算 → 布局 → 绘制 → 上传到 GPU
（阻塞其他任务）
```

**GPU 合成：**
```
主线程：创建合成层
GPU：独立处理变换和透明度
（不阻塞主线程）
```

**性能提升：**
```css
/* ❌ CPU 渲染（每帧重绘）*/
@keyframes move {
  to { left: 100px; }
}

/* ✅ GPU 合成（60fps 流畅）*/
@keyframes move {
  to { transform: translateX(100px); }
}
```

**适用场景：**
- 动画和过渡
- 大量元素变换
- 视频播放
- Canvas 渲染

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 层爆炸

### 题目

创建过多合成层会导致性能问题。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**层爆炸（Layer Explosion）**

**问题：**
```css
/* ❌ 过多合成层 */
.item {
  will-change: transform;
}
/* 1000个元素 → 1000个合成层 → GPU 内存爆炸 */
```

**后果：**
- GPU 内存耗尽
- 页面卡顿甚至崩溃
- 移动设备更明显

**解决方案：**

**1. 按需创建：**
```javascript
// 动画开始时创建
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform';
});

// 动画结束时销毁
element.addEventListener('mouseleave', () => {
  element.style.willChange = 'auto';
});
```

**2. 限制数量：**
```css
/* ✅ 只给需要的元素 */
.animated-item:hover {
  will-change: transform;
}
```

**3. 使用 contain：**
```css
.item {
  contain: layout paint;
  /* 限制影响范围 */
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 创建合成层

### 题目

以下哪些会创建合成层？

**选项：**
- A. `transform: translateZ(0)`
- B. `will-change: transform`
- C. `<video>` 元素
- D. `opacity < 1`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**合成层触发条件**

**✅ A. 3D transform**
```css
.layer {
  transform: translateZ(0);
  transform: translate3d(0,0,0);
  transform: rotateX(1deg);
}
```

**✅ B. will-change**
```css
.layer {
  will-change: transform;
  will-change: opacity;
}
```

**✅ C. 媒体元素**
```html
<video></video>
<canvas></canvas>
<iframe></iframe>
```

**❌ D. opacity < 1（不一定）**
```css
/* ❌ 不创建合成层 */
.box {
  opacity: 0.9;
}

/* ✅ 动画中的 opacity 会创建 */
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**完整列表：**

**肯定创建：**
```css
/* 3D 变换 */
transform: translateZ(0);

/* will-change */
will-change: transform, opacity;

/* 媒体元素 */
<video>, <canvas>, <iframe>

/* filter */
filter: blur(5px);

/* backdrop-filter */
backdrop-filter: blur(10px);

/* mix-blend-mode */
mix-blend-mode: multiply;

/* transform/opacity 动画 */
animation: move 1s;
@keyframes move {
  to { transform: translateX(100px); }
}
```

**可能创建：**
```css
/* position: fixed（某些情况）*/
position: fixed;

/* overflow + 滚动 */
overflow: scroll;
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 层提升

### 题目

如何查看元素的合成层信息？

**选项：**
- A. console.log(element)
- B. Chrome DevTools Layers 面板
- C. getComputedStyle()
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Chrome DevTools Layers 面板**

**打开方式：**
```
1. DevTools → More tools → Layers
2. 或按 Ctrl+Shift+P → 输入 "Show Layers"
```

**查看信息：**
```
- 图层树结构
- 每层的内存占用
- 创建原因
- 绘制次数
```

**实用技巧：**

**1. 查看层创建原因：**
```
点击图层 → 右侧显示
"Compositing Reasons"
```

**2. 高亮显示：**
```
Rendering → Layer borders
绿色边框 = 合成层
```

**3. Paint flashing：**
```
Rendering → Paint flashing
绿色闪烁 = 重绘区域
```

**编程方式检测：**
```javascript
// 方法1：检查 transform
const style = getComputedStyle(element);
console.log(style.transform);

// 方法2：Performance API
performance.mark('start');
element.style.transform = 'translateZ(0)';
performance.mark('end');

// 方法3：检查渲染
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'Composite') {
      console.log('合成发生', entry);
    }
  }
});
observer.observe({ entryTypes: ['measure'] });
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 层隐式提升

### 题目

什么是层的隐式提升？

**选项：**
- A. 浏览器自动优化
- B. 为了保持正确的层叠顺序，强制提升某些层
- C. JavaScript 触发
- D. 用户操作触发

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**隐式合成（Implicit Compositing）**

**问题场景：**
```html
<div class="bottom">z-index: 1</div>
<div class="top">z-index: 2, transform: translateZ(0)</div>
```

```css
.bottom {
  position: relative;
  z-index: 1;
  background: red;
}

.top {
  position: relative;
  z-index: 2;
  transform: translateZ(0);  /* 创建合成层 */
  background: blue;
}
```

**层级关系：**
```
.top → 合成层（z-index: 2）
.bottom → 普通层（z-index: 1）
```

**问题：如果 .bottom 在 .top 上方会怎样？**

**浏览器解决：隐式提升 .bottom**
```
.top → 合成层
.bottom → 被提升为合成层（保持层叠顺序）
```

**避免不必要的提升：**

**❌ 导致隐式提升：**
```css
.parent {
  /* 1000个子元素 */
}

.child:first-child {
  transform: translateZ(0);
  /* 其他 999 个可能被隐式提升 */
}
```

**✅ 使用 isolation：**
```css
.parent {
  isolation: isolate;
  /* 限制合成层提升范围 */
}

.child:first-child {
  transform: translateZ(0);
}
```

**查看隐式提升：**
```
DevTools Layers 面板
Compositing Reason: "Overlap"
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** contain 属性

### 题目

CSS `contain` 属性的作用是？

**选项：**
- A. 包含浮动
- B. 限制渲染影响范围，优化性能
- C. 创建 BFC
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**CSS Containment（包含）**

**作用：告诉浏览器元素的变化不会影响外部**

**语法：**
```css
.widget {
  contain: layout;        /* 布局包含 */
  contain: paint;         /* 绘制包含 */
  contain: size;          /* 尺寸包含 */
  contain: style;         /* 样式包含 */
  contain: strict;        /* = layout + paint + size */
  contain: content;       /* = layout + paint */
}
```

**layout（布局包含）：**
```css
.widget {
  contain: layout;
}
/* 内部布局变化不影响外部 */
```

**paint（绘制包含）：**
```css
.widget {
  contain: paint;
}
/* 绘制范围限制在边界内 */
```

**size（尺寸包含）：**
```css
.widget {
  contain: size;
  width: 300px;
  height: 200px;
}
/* 必须指定尺寸，内容不会撑开 */
```

**实用示例：**

**1. 列表优化：**
```css
.list-item {
  contain: layout paint;
  /* 每个项独立渲染 */
}
```

**2. 虚拟滚动：**
```css
.virtual-item {
  contain: strict;
  width: 100%;
  height: 50px;
}
```

**3. 组件隔离：**
```css
.component {
  contain: content;
  /* 内部变化不影响外部布局 */
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

以下哪种方式内存占用最小？

**选项：**
- A. `will-change: transform`
- B. `transform: translateZ(0)`
- C. 不创建合成层
- D. C 最小

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**合成层内存占用**

**❌ A & B：创建合成层（占用 GPU 内存）**
```css
.box {
  will-change: transform;
  /* 额外的 GPU 内存 */
}

.box {
  transform: translateZ(0);
  /* 额外的 GPU 内存 */
}
```

**✅ C：不创建合成层（最省内存）**
```css
.box {
  /* 普通渲染层 */
}
```

**内存计算：**
```
合成层内存 ≈ 宽度 × 高度 × 4（RGBA）

例：1000px × 1000px = 4MB
10 个这样的层 = 40MB GPU 内存
```

**性能权衡：**

| 方案 | 内存 | 动画性能 | 适用场景 |
|------|------|---------|---------|
| 不创建层 | 最低 | 差 | 静态内容 |
| translateZ(0) | 中 | 好 | 频繁动画 |
| will-change | 高 | 最好 | 即将动画 |

**最佳实践：**

**1. 按需创建：**
```javascript
// 动画前
element.style.willChange = 'transform';

// 动画
element.style.transform = 'translateX(100px)';

// 动画后清理
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
});
```

**2. 监控内存：**
```
DevTools → Performance Monitor
- GPU memory（GPU 内存）
- Heap size（堆内存）
```

**3. 限制合成层：**
```css
/* ❌ 过多 */
.item {
  will-change: transform;
}

/* ✅ 限制 */
.item:hover {
  will-change: transform;
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** backdrop-filter

### 题目

`backdrop-filter` 对性能的影响？

**选项：**
- A. 无影响
- B. 创建合成层，消耗 GPU 资源
- C. 阻塞渲染
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**backdrop-filter 性能影响**

**作用：对元素背后的区域应用滤镜**
```css
.glass {
  backdrop-filter: blur(10px);
  /* 毛玻璃效果 */
}
```

**性能特点：**

**✅ 创建合成层**
```css
.modal {
  backdrop-filter: blur(10px);
  /* 创建独立合成层 */
}
```

**⚠️ GPU 密集计算**
```
每一帧都要：
1. 捕获背景内容
2. 应用滤镜效果
3. 合成到当前层
```

**性能优化：**

**1. 限制范围：**
```css
/* ❌ 整个页面 */
body {
  backdrop-filter: blur(10px);
}

/* ✅ 小区域 */
.dialog {
  backdrop-filter: blur(10px);
  width: 400px;
  height: 300px;
}
```

**2. 降级方案：**
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
}

@supports (backdrop-filter: blur(10px)) {
  .glass {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.3);
  }
}
```

**3. 移动端谨慎使用：**
```css
/* 桌面端 */
@media (min-width: 1024px) {
  .glass {
    backdrop-filter: blur(10px);
  }
}

/* 移动端降级 */
@media (max-width: 1023px) {
  .glass {
    background: rgba(255, 255, 255, 0.9);
  }
}
```

**对比表：**

| 属性 | 影响范围 | 性能消耗 |
|------|---------|---------|
| filter | 元素本身 | 中 |
| backdrop-filter | 元素背后 | 高 |
| background | 元素本身 | 低 |

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 合成优化

### 题目

合成层优化的最佳实践有？

**选项：**
- A. 避免层爆炸
- B. 使用 isolation 隔离
- C. 动画结束后移除 will-change
- D. 监控 GPU 内存使用

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**合成层优化全指南（全部正确）**

**✅ A. 避免层爆炸**
```css
/* ❌ 创建太多层 */
.item {
  will-change: transform;
}
/* 1000 项 × 4MB = 4GB */

/* ✅ 按需创建 */
.item.animating {
  will-change: transform;
}
```

**✅ B. 使用 isolation**
```css
.container {
  isolation: isolate;
  /* 防止子元素隐式提升 */
}

.child {
  transform: translateZ(0);
  /* 不会导致兄弟元素提升 */
}
```

**✅ C. 清理 will-change**
```javascript
// 动画前
element.style.willChange = 'transform';

// 动画执行
element.classList.add('animate');

// 动画后清理
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
  element.classList.remove('animate');
}, { once: true });
```

**✅ D. 监控 GPU 内存**
```javascript
// Performance Monitor
// DevTools → More tools → Performance monitor

// 编程方式
if (performance.memory) {
  console.log('Used:', performance.memory.usedJSHeapSize);
  console.log('Total:', performance.memory.totalJSHeapSize);
}
```

**完整优化清单：**

**1. 创建策略：**
```css
/* ✅ 只在需要时创建 */
.box:hover {
  will-change: transform;
}

.box:active {
  transform: scale(0.95);
}
```

**2. 尺寸控制：**
```css
/* ❌ 巨大的合成层 */
.hero {
  width: 100vw;
  height: 200vh;
  will-change: transform;
}

/* ✅ 合理尺寸 */
.hero {
  width: 100%;
  max-height: 100vh;
}
```

**3. 数量限制：**
```javascript
// 限制同时存在的合成层
const MAX_LAYERS = 10;
let activeLayersCount = 0;

function createLayer(element) {
  if (activeLayersCount >= MAX_LAYERS) {
    return;
  }
  
  element.style.willChange = 'transform';
  activeLayersCount++;
}

function removeLayer(element) {
  element.style.willChange = 'auto';
  activeLayersCount--;
}
```

**4. 性能检测：**
```javascript
// 检测设备性能
const isLowEnd = navigator.hardwareConcurrency <= 4;

if (isLowEnd) {
  // 降级：不使用合成层
  element.classList.add('no-animation');
} else {
  // 完整效果
  element.style.willChange = 'transform';
}
```

</details>

---

**导航**  
[上一章：第 31 章 - 布局与绘制](./chapter-31.md) | [返回目录](../README.md) | [下一章：第 33 章 - transform与opacity优化](./chapter-33.md)
