# 第 34 章：Transition 与 Animation 原理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** transition 基础

### 题目

`transition` 的四个属性是？

**选项：**
- A. property, duration, delay, function
- B. property, duration, timing-function, delay
- C. name, duration, timing-function, delay
- D. property, time, ease, delay

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**transition 四大属性**

```css
.box {
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transition-delay: 0.1s;
}

/* 简写 */
.box {
  transition: transform 0.3s ease-in-out 0.1s;
}
```

**详细说明：**

**1. property（属性）：**
```css
transition-property: width;
transition-property: transform, opacity;
transition-property: all;
```

**2. duration（时长）：**
```css
transition-duration: 0.3s;
transition-duration: 300ms;
```

**3. timing-function（缓动函数）：**
```css
transition-timing-function: ease;
transition-timing-function: linear;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

**4. delay（延迟）：**
```css
transition-delay: 0.1s;
transition-delay: 100ms;
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** animation vs transition

### 题目

animation 和 transition 的主要区别？

**选项：**
- A. 性能不同
- B. transition 需要触发，animation 自动播放
- C. 浏览器支持不同
- D. 语法不同

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**transition vs animation**

**transition（被动）：**
```css
.box {
  transition: transform 0.3s;
}

.box:hover {
  transform: scale(1.2);
  /* 需要触发（hover、click等）*/
}
```

**animation（主动）：**
```css
.box {
  animation: bounce 1s infinite;
  /* 自动播放，无需触发 */
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

**对比表：**

| 特性 | transition | animation |
|------|-----------|-----------|
| 触发方式 | 需要触发 | 自动播放 |
| 关键帧 | 只有开始/结束 | 多个关键帧 |
| 循环 | 不支持 | 支持 |
| 暂停/播放 | 不支持 | 支持 |
| 方向 | 单向 | 双向/反向 |

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** timing-function

### 题目

`ease` 是 `transition-timing-function` 的默认值。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**timing-function 默认值**

```css
.box {
  transition: transform 0.3s;
  /* 等同于 */
  transition: transform 0.3s ease;
}
```

**常用缓动函数：**

**预设值：**
```css
ease          /* 慢-快-慢（默认）*/
linear        /* 匀速 */
ease-in       /* 慢-快 */
ease-out      /* 快-慢 */
ease-in-out   /* 慢-快-慢 */
```

**贝塞尔曲线：**
```css
cubic-bezier(0.4, 0, 0.2, 1)  /* Material Design */
cubic-bezier(0.25, 0.1, 0.25, 1)  /* ease */
cubic-bezier(0, 0, 1, 1)  /* linear */
```

**步进函数：**
```css
steps(4, end)       /* 4步，跳到结束 */
step-start          /* 立即跳到结束 */
step-end            /* 等待后跳到结束 */
```

**可视化工具：**
```
https://cubic-bezier.com/
https://easings.net/
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** animation 属性

### 题目

animation 的完整属性有？

**选项：**
- A. animation-name, animation-duration
- B. animation-timing-function, animation-delay
- C. animation-iteration-count, animation-direction
- D. animation-fill-mode, animation-play-state

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**animation 8大属性（全部正确）**

**✅ A. 名称和时长**
```css
animation-name: slideIn;
animation-duration: 1s;
```

**✅ B. 缓动和延迟**
```css
animation-timing-function: ease-in-out;
animation-delay: 0.5s;
```

**✅ C. 循环和方向**
```css
animation-iteration-count: 3;        /* 次数 */
animation-iteration-count: infinite; /* 无限 */
animation-direction: normal;         /* 正常 */
animation-direction: reverse;        /* 反向 */
animation-direction: alternate;      /* 交替 */
```

**✅ D. 填充和状态**
```css
animation-fill-mode: forwards;    /* 保持结束状态 */
animation-fill-mode: backwards;   /* 应用开始状态 */
animation-fill-mode: both;        /* 两者都应用 */

animation-play-state: running;    /* 播放 */
animation-play-state: paused;     /* 暂停 */
```

**完整简写：**
```css
.box {
  animation: 
    slideIn           /* name */
    1s                /* duration */
    ease-in-out       /* timing-function */
    0.5s              /* delay */
    3                 /* iteration-count */
    alternate         /* direction */
    both              /* fill-mode */
    running;          /* play-state */
}
```

**实用示例：**
```css
/* 无限循环 */
.spinner {
  animation: spin 1s linear infinite;
}

/* 播放一次，保持结束状态 */
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* 延迟后播放 */
.delayed {
  animation: slideUp 0.3s ease-out 1s both;
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 关键帧

### 题目

`@keyframes` 中 `from` 和 `to` 等同于？

**选项：**
- A. 0 和 100
- B. 0% 和 100%
- C. start 和 end
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**关键帧语法**

**from/to：**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**等同于 0%/100%：**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**多个关键帧：**
```css
@keyframes bounce {
  0% { transform: translateY(0); }
  25% { transform: translateY(-20px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
```

**合并相同状态：**
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
```

**注意事项：**
```css
/* ⚠️ 必须使用百分号 */
@keyframes wrong {
  0 { opacity: 0; }    /* ❌ 无效 */
  100 { opacity: 1; }  /* ❌ 无效 */
}

@keyframes correct {
  0% { opacity: 0; }   /* ✅ 正确 */
  100% { opacity: 1; } /* ✅ 正确 */
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** fill-mode

### 题目

`animation-fill-mode: forwards` 的作用是？

**选项：**
- A. 向前播放
- B. 动画结束后保持最后一帧的状态
- C. 加速播放
- D. 正向循环

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**animation-fill-mode 详解**

**none（默认）：**
```css
.box {
  animation: fadeIn 1s none;
}
/* 动画前后都是初始状态 */
```

**forwards（保持结束状态）：**
```css
.box {
  opacity: 0;
  animation: fadeIn 1s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
/* 动画结束后保持 opacity: 1 */
```

**backwards（应用开始状态）：**
```css
.box {
  opacity: 0;
  animation: fadeIn 1s 2s backwards;
}

@keyframes fadeIn {
  from { opacity: 1; }
  to { opacity: 1; }
}
/* 延迟期间应用 from 的状态 */
```

**both（两者都应用）：**
```css
.box {
  animation: slideIn 1s 0.5s both;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
/* 延迟期间应用 from，结束后保持 to */
```

**可视化：**
```
none:
初始 → [延迟] → 初始 → [动画] → 结束 → 初始

forwards:
初始 → [延迟] → 初始 → [动画] → 结束 → 保持结束 ✅

backwards:
初始 → [延迟] → 应用开始 ✅ → [动画] → 结束 → 初始

both:
初始 → [延迟] → 应用开始 ✅ → [动画] → 结束 → 保持结束 ✅
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** steps()

### 题目

`steps(4, end)` 的作用是？

**选项：**
- A. 分4步平滑过渡
- B. 分4个跳跃步骤，在每步结束时跳转
- C. 延迟4秒
- D. 循环4次

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**steps() 步进函数**

**语法：**
```css
steps(n, jump-term)

n: 步骤数
jump-term: jump-start | jump-end | jump-both | jump-none
```

**steps(4, end)：**
```css
.sprite {
  animation: play 1s steps(4, end) infinite;
}

@keyframes play {
  to { background-position-x: -400px; }
}
/* 4个跳跃，在每步结束时跳转 */
```

**可视化：**
```
steps(4, end):
0% ──┐  25% ──┐  50% ──┐  75% ──┐  100%
     └────┘     └────┘     └────┘

steps(4, start):
0% ──┐  25% ──┐  50% ──┐  75% ──┐  100%
   └────┘     └────┘     └────┘
```

**实用场景：**

**1. 雪碧图动画：**
```css
.sprite {
  width: 100px;
  height: 100px;
  background: url('sprite.png');
  animation: sprite 0.8s steps(8) infinite;
}

@keyframes sprite {
  to { background-position-x: -800px; }
}
```

**2. 打字机效果：**
```css
.typing {
  width: 20ch;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid;
  animation: 
    typing 2s steps(20) forwards,
    blink 0.5s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

**3. 帧动画：**
```css
.loader {
  animation: rotate 1s steps(12) infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}
/* 12个方向的加载动画 */
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 缓动函数原理

### 题目

`cubic-bezier(0.4, 0, 0.2, 1)` 的四个参数代表什么？

**选项：**
- A. 开始/结束的速度
- B. 两个控制点的 x、y 坐标
- C. 时间和速度
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**贝塞尔曲线参数**

```css
cubic-bezier(x1, y1, x2, y2)

P0(0, 0)     起点（固定）
P1(x1, y1)   第一个控制点
P2(x2, y2)   第二个控制点
P3(1, 1)     终点（固定）
```

**坐标系：**
```
Y轴（进度）
1 ┤         ╱P3
  │       ╱
  │     ╱ P2
  │   ╱
  │ ╱ P1
0 ┤P0───────────
  0             1
     X轴（时间）
```

**参数说明：**
```css
cubic-bezier(0.4, 0, 0.2, 1)
/*
  x1: 0.4  第一个控制点X（时间比例）
  y1: 0    第一个控制点Y（进度）
  x2: 0.2  第二个控制点X（时间比例）
  y2: 1    第二个控制点Y（进度）
*/
```

**预设值对应的贝塞尔：**
```css
ease:         cubic-bezier(0.25, 0.1, 0.25, 1)
linear:       cubic-bezier(0, 0, 1, 1)
ease-in:      cubic-bezier(0.42, 0, 1, 1)
ease-out:     cubic-bezier(0, 0, 0.58, 1)
ease-in-out:  cubic-bezier(0.42, 0, 0.58, 1)
```

**自定义缓动：**
```css
/* Material Design */
.material {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 弹性效果（超出范围）*/
.bounce {
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 快速开始 */
.fast-start {
  transition: all 0.3s cubic-bezier(0.7, 0, 0.3, 1);
}
```

**在线工具：**
```
https://cubic-bezier.com/
可视化调整贝塞尔曲线
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 动画性能

### 题目

以下哪个动画性能最好？

```css
/* A */
@keyframes moveA {
  to { left: 100px; }
}

/* B */
@keyframes moveB {
  to { margin-left: 100px; }
}

/* C */
@keyframes moveC {
  to { transform: translateX(100px); }
}
```

**选项：**
- A. A 最好
- B. B 最好
- C. C 最好
- D. 性能相同

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**动画性能对比**

**❌ A. left（触发重排+重绘）**
```css
@keyframes moveA {
  to { left: 100px; }
}
/* 每一帧：
   1. Recalculate Style
   2. Layout（重排）
   3. Paint（重绘）
   4. Composite
*/
```

**❌ B. margin-left（触发重排+重绘）**
```css
@keyframes moveB {
  to { margin-left: 100px; }
}
/* 影响其他元素布局
   性能更差
*/
```

**✅ C. transform（只触发合成）**
```css
@keyframes moveC {
  to { transform: translateX(100px); }
}
/* 只触发 Composite
   GPU 加速
*/
```

**性能测试：**
```javascript
// 测试工具
const perfA = performance.now();
elementA.style.left = '100px';
const timeA = performance.now() - perfA;

const perfC = performance.now();
elementC.style.transform = 'translateX(100px)';
const timeC = performance.now() - perfC;

console.log('left:', timeA);      // ~15ms
console.log('transform:', timeC);  // ~2ms
```

**推荐的动画属性：**
```css
/* ✅ 只用这些 */
transform
opacity
filter

/* ❌ 避免这些 */
left, top, right, bottom
width, height
margin, padding
background, color
```

**完整优化示例：**
```css
.box {
  /* 初始状态 */
  will-change: transform, opacity;
}

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

.box.animate {
  animation: slideIn 0.5s ease-out forwards;
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 动画最佳实践

### 题目

CSS 动画的最佳实践有？

**选项：**
- A. 优先使用 transform 和 opacity
- B. 使用 will-change 提示浏览器
- C. 避免同时动画过多元素
- D. 使用 requestAnimationFrame

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**动画优化全指南（全部正确）**

**✅ A. 优先合成属性**
```css
/* ✅ 推荐 */
@keyframes good {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* ❌ 避免 */
@keyframes bad {
  from {
    width: 0;
    background: red;
  }
  to {
    width: 100px;
    background: blue;
  }
}
```

**✅ B. will-change 提示**
```css
.animating {
  will-change: transform, opacity;
}

.animating.active {
  animation: bounce 1s ease-out;
}
```

**✅ C. 限制元素数量**
```javascript
// ❌ 同时动画1000个元素
items.forEach(item => {
  item.classList.add('animate');
});

// ✅ 分批动画
items.forEach((item, i) => {
  setTimeout(() => {
    item.classList.add('animate');
  }, i * 50);  // 交错延迟
});
```

**✅ D. requestAnimationFrame**
```javascript
function animate() {
  requestAnimationFrame(() => {
    element.style.transform = `translateX(${x}px)`;
    
    if (x < 100) {
      x += 2;
      animate();
    }
  });
}
```

**完整优化清单：**

**1. CSS 层面：**
```css
/* 合成属性 */
.box {
  transform: translateX(100px);
  opacity: 0.5;
}

/* 提示浏览器 */
.box {
  will-change: transform;
}

/* 硬件加速 */
.box {
  transform: translate3d(0, 0, 0);
}
```

**2. JavaScript 层面：**
```javascript
// 使用 rAF
requestAnimationFrame(animate);

// 批量操作
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(item));
container.appendChild(fragment);

// 事件委托
container.addEventListener('animationend', (e) => {
  if (e.target.matches('.item')) {
    e.target.style.willChange = 'auto';
  }
});
```

**3. 性能监控：**
```javascript
// FPS 监控
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    const fps = Math.round(frames * 1000 / (now - lastTime));
    console.log('FPS:', fps);
    frames = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(measureFPS);
}

// Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});
observer.observe({ entryTypes: ['measure'] });
```

**4. 降级策略：**
```css
/* 检测动画支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 低端设备降级 */
@media (max-width: 768px) {
  .fancy-animation {
    animation: none;
  }
}
```

</details>

---

**导航**  
[上一章：第 33 章 - transform与opacity优化](./chapter-33.md) | [返回目录](../README.md) | [下一章：第 35 章 - 动画性能优化](./chapter-35.md)
