# 第 35 章：动画性能优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 60fps 原理

### 题目

为什么动画要达到 60fps？

**选项：**
- A. 标准规定
- B. 屏幕刷新率通常是 60Hz，16.67ms 一帧
- C. 浏览器限制
- D. CPU 性能限制

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**60fps 原理**

**刷新率：**
```
大多数屏幕：60Hz（每秒刷新60次）
一帧时间：1000ms / 60 = 16.67ms
```

**流畅动画要求：**
```
60fps：每帧 16.67ms
30fps：每帧 33.33ms（可感知卡顿）
24fps：每帧 41.67ms（明显卡顿）
```

**浏览器帧预算：**
```
16.67ms 预算分配：
- JavaScript 执行：<3ms
- 样式计算：<2ms
- 布局：<2ms
- 绘制：<2ms
- 合成：<2ms
- 余量：~5ms
```

**检测帧率：**
```javascript
let lastTime = performance.now();
let frames = 0;

function checkFPS() {
  frames++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    console.log('FPS:', frames);
    frames = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(checkFPS);
}
checkFPS();
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** requestAnimationFrame

### 题目

`requestAnimationFrame` 的优势是？

**选项：**
- A. 代码更简洁
- B. 与浏览器刷新率同步，节省性能
- C. 支持暂停
- D. 更快的执行速度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**requestAnimationFrame (rAF)**

**对比 setTimeout：**

**❌ setTimeout（不精确）：**
```javascript
function animate() {
  element.style.left = left + 'px';
  left += 1;
  setTimeout(animate, 16);  // 不精确
}
```

**✅ rAF（精确同步）：**
```javascript
function animate() {
  element.style.transform = `translateX(${x}px)`;
  x += 1;
  requestAnimationFrame(animate);  // 同步屏幕刷新
}
```

**优势：**
```
1. 与屏幕刷新同步
2. 页面不可见时暂停（节省性能）
3. 自动优化时间间隔
4. 避免掉帧
```

**实用示例：**
```javascript
let rafId;

function start() {
  function animate(timestamp) {
    // 动画逻辑
    element.style.transform = `translateX(${x}px)`;
    
    if (x < 100) {
      rafId = requestAnimationFrame(animate);
    }
  }
  rafId = requestAnimationFrame(animate);
}

function stop() {
  cancelAnimationFrame(rafId);
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 布局抖动

### 题目

在循环中读取布局信息会导致布局抖动。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**布局抖动（Layout Thrashing）**

**❌ 问题代码：**
```javascript
boxes.forEach(box => {
  const width = box.offsetWidth;  // 读取 → 强制重排
  box.style.width = width + 10 + 'px';  // 写入 → 标记重排
  // 下次循环又读取 → 再次强制重排
});
// 总共 N 次强制重排
```

**✅ 优化方案：**
```javascript
// 批量读取
const widths = boxes.map(box => box.offsetWidth);

// 批量写入
boxes.forEach((box, i) => {
  box.style.width = widths[i] + 10 + 'px';
});
// 只触发 1 次重排
```

**FastDOM 库：**
```javascript
import fastdom from 'fastdom';

boxes.forEach(box => {
  fastdom.measure(() => {
    const width = box.offsetWidth;
    
    fastdom.mutate(() => {
      box.style.width = width + 10 + 'px';
    });
  });
});
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 性能分析工具

### 题目

Chrome DevTools 中分析动画性能的工具有？

**选项：**
- A. Performance 面板
- B. Rendering 面板
- C. Layers 面板
- D. Performance Monitor

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**性能分析工具（全部正确）**

**✅ A. Performance 面板**
```
录制性能：
1. 打开 Performance
2. 点击录制（●）
3. 执行动画
4. 停止录制
5. 分析火焰图

关键指标：
- FPS（帧率）
- CPU 使用率
- 内存占用
```

**✅ B. Rendering 面板**
```
More tools → Rendering

勾选：
☑ Paint flashing（绘制闪烁）
☑ Layout Shift Regions（布局偏移）
☑ Layer borders（图层边界）
☑ Frame Rendering Stats（FPS）
☑ Scrolling performance issues（滚动性能）
```

**✅ C. Layers 面板**
```
More tools → Layers

显示：
- 合成层结构
- 每层内存占用
- 创建原因
- 绘制次数
```

**✅ D. Performance Monitor**
```
More tools → Performance monitor

实时监控：
- CPU usage
- JS heap size
- DOM Nodes
- JS event listeners
- Layouts / sec
- Style recalcs / sec
```

**命令面板快捷方式：**
```
Ctrl+Shift+P 输入：
- Show Performance
- Show Rendering
- Show Layers
- Show Performance monitor
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 虚拟滚动

### 题目

什么是虚拟滚动？

**选项：**
- A. CSS 滚动效果
- B. 只渲染可见区域的项，优化长列表性能
- C. 平滑滚动
- D. 滚动动画

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**虚拟滚动（Virtual Scrolling）**

**问题：大列表性能**
```javascript
// ❌ 渲染 10000 项
for (let i = 0; i < 10000; i++) {
  const item = document.createElement('div');
  item.textContent = `Item ${i}`;
  container.appendChild(item);
}
// DOM 节点过多，卡顿
```

**解决方案：只渲染可见项**
```javascript
class VirtualScroll {
  constructor(container, totalItems, itemHeight) {
    this.container = container;
    this.totalItems = totalItems;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    
    this.render();
    this.container.addEventListener('scroll', () => this.render());
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;
    
    // 只渲染可见项
    this.container.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= this.totalItems) break;
      
      const item = document.createElement('div');
      item.style.height = this.itemHeight + 'px';
      item.style.transform = `translateY(${i * this.itemHeight}px)`;
      item.textContent = `Item ${i}`;
      this.container.appendChild(item);
    }
    
    // 设置总高度
    this.container.style.height = this.totalItems * this.itemHeight + 'px';
  }
}

// 使用
new VirtualScroll(container, 10000, 50);
```

**库推荐：**
```
react-window
react-virtualized
vue-virtual-scroller
```

**优化效果：**
```
10000 项列表：
普通渲染：10000 个 DOM 节点
虚拟滚动：~20 个 DOM 节点（只渲染可见区域）

性能提升：500 倍
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 节流与防抖

### 题目

滚动事件优化应该用节流还是防抖？

**选项：**
- A. 防抖（debounce）
- B. 节流（throttle）
- C. 两者都可以
- D. B 更好

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**节流 vs 防抖**

**节流（throttle）- 滚动优化**
```javascript
function throttle(fn, delay) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用
window.addEventListener('scroll', throttle(() => {
  console.log('滚动处理');
}, 100));  // 每 100ms 最多执行一次
```

**防抖（debounce）- 输入优化**
```javascript
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
input.addEventListener('input', debounce(() => {
  console.log('搜索');
}, 300));  // 停止输入 300ms 后执行
```

**对比：**

| 场景 | 使用 | 原因 |
|------|------|------|
| scroll | throttle | 需要持续响应 |
| resize | throttle | 需要持续响应 |
| input | debounce | 等待输入完成 |
| button | debounce | 防止重复点击 |

**完整示例：**
```javascript
// 滚动加载更多（节流）
window.addEventListener('scroll', throttle(() => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore();
  }
}, 200));

// 搜索建议（防抖）
searchInput.addEventListener('input', debounce((e) => {
  fetchSuggestions(e.target.value);
}, 300));
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** passive 事件

### 题目

`{ passive: true }` 的作用是？

**选项：**
- A. 禁用事件
- B. 告诉浏览器不会调用 preventDefault，优化滚动性能
- C. 异步执行
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**passive 事件监听器**

**问题：滚动卡顿**
```javascript
// ❌ 浏览器必须等待事件处理完成
document.addEventListener('touchstart', (e) => {
  // 浏览器不知道是否会调用 preventDefault()
  // 必须等待才能开始滚动
  doSomething();
});
```

**解决方案：passive**
```javascript
// ✅ 告诉浏览器不会阻止默认行为
document.addEventListener('touchstart', (e) => {
  doSomething();
}, { passive: true });
// 浏览器可以立即开始滚动
```

**适用场景：**
```javascript
// 滚动事件
window.addEventListener('scroll', handler, { passive: true });

// 触摸事件
element.addEventListener('touchstart', handler, { passive: true });
element.addEventListener('touchmove', handler, { passive: true });

// 鼠标滚轮
element.addEventListener('wheel', handler, { passive: true });
```

**注意事项：**
```javascript
// ⚠️ passive + preventDefault 冲突
element.addEventListener('touchstart', (e) => {
  e.preventDefault();  // ❌ 无效，会警告
}, { passive: true });

// ✅ 需要 preventDefault 时不用 passive
element.addEventListener('touchstart', (e) => {
  e.preventDefault();
});
```

**检测支持：**
```javascript
let passiveSupported = false;

try {
  const options = {
    get passive() {
      passiveSupported = true;
      return false;
    }
  };
  
  window.addEventListener('test', null, options);
  window.removeEventListener('test', null, options);
} catch (err) {
  passiveSupported = false;
}

// 使用
element.addEventListener('scroll', handler, 
  passiveSupported ? { passive: true } : false
);
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 交叉观察器

### 题目

使用 IntersectionObserver 优化什么场景？

**选项：**
- A. 懒加载图片
- B. 无限滚动
- C. 动画触发
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**IntersectionObserver 应用（全部正确）**

**✅ A. 懒加载图片**
```javascript
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

```html
<img data-src="real-image.jpg" src="placeholder.jpg">
```

**✅ B. 无限滚动**
```javascript
const loadMore = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    fetchMoreItems();
  }
});

loadMore.observe(document.querySelector('.load-trigger'));
```

**✅ C. 动画触发**
```javascript
const animateOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      animateOnScroll.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.5  // 50% 可见时触发
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  animateOnScroll.observe(el);
});
```

**配置选项：**
```javascript
const observer = new IntersectionObserver(callback, {
  root: null,           // 视口（null）或容器元素
  rootMargin: '0px',    // 根边距（类似 margin）
  threshold: [0, 0.5, 1]  // 触发阈值
});
```

**完整示例：**
```javascript
class LazyLoader {
  constructor(selector, options = {}) {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersect(entries),
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.01
      }
    );
    
    document.querySelectorAll(selector).forEach(el => {
      this.observer.observe(el);
    });
  }
  
  handleIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      
      const target = entry.target;
      
      // 加载图片
      if (target.dataset.src) {
        target.src = target.dataset.src;
        target.removeAttribute('data-src');
      }
      
      // 加载背景
      if (target.dataset.bg) {
        target.style.backgroundImage = `url(${target.dataset.bg})`;
        target.removeAttribute('data-bg');
      }
      
      // 触发动画
      target.classList.add('loaded');
      
      this.observer.unobserve(target);
    });
  }
  
  destroy() {
    this.observer.disconnect();
  }
}

// 使用
new LazyLoader('img[data-src], [data-bg]');
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** Web Worker

### 题目

什么时候使用 Web Worker？

**选项：**
- A. 所有 JavaScript 计算
- B. 复杂计算不阻塞主线程
- C. DOM 操作
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Web Worker 使用场景**

**适用：密集计算**
```javascript
// worker.js
self.addEventListener('message', (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

function heavyComputation(data) {
  // 复杂计算
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}
```

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: 100 });

worker.addEventListener('message', (e) => {
  console.log('Result:', e.data);
});
```

**不适用：DOM 操作**
```javascript
// ❌ Worker 中无法访问 DOM
self.addEventListener('message', () => {
  document.querySelector('.box');  // 错误！
});
```

**实用场景：**

**1. 图片处理：**
```javascript
// imageWorker.js
self.addEventListener('message', (e) => {
  const { imageData } = e.data;
  
  // 应用滤镜
  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = gray;
    imageData.data[i + 1] = gray;
    imageData.data[i + 2] = gray;
  }
  
  self.postMessage({ imageData });
});
```

**2. 数据处理：**
```javascript
// dataWorker.js
self.addEventListener('message', (e) => {
  const { data } = e.data;
  
  // 排序大数据
  const sorted = data.sort((a, b) => a - b);
  
  self.postMessage({ sorted });
});
```

**3. 加密/解密：**
```javascript
// cryptoWorker.js
self.importScripts('crypto-lib.js');

self.addEventListener('message', (e) => {
  const encrypted = encrypt(e.data);
  self.postMessage(encrypted);
});
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 性能优化总结

### 题目

动画性能优化的核心策略有？

**选项：**
- A. 只用 transform 和 opacity
- B. 使用 requestAnimationFrame
- C. 避免布局抖动
- D. 减少合成层数量

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**动画性能优化完整指南（全部正确）**

**✅ A. 合成属性**
```css
/* ✅ 只用这些 */
.animate {
  transform: translateX(100px);
  opacity: 0.5;
  filter: blur(5px);
}

/* ❌ 避免这些 */
.bad {
  left: 100px;           /* 重排 */
  width: 200px;          /* 重排 */
  background: red;       /* 重绘 */
}
```

**✅ B. requestAnimationFrame**
```javascript
let x = 0;

function animate() {
  element.style.transform = `translateX(${x}px)`;
  x += 2;
  
  if (x < 100) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);
```

**✅ C. 批量读写**
```javascript
// ❌ 布局抖动
boxes.forEach(box => {
  const width = box.offsetWidth;  // 读
  box.style.width = width + 10 + 'px';  // 写
});

// ✅ 批量处理
const widths = boxes.map(box => box.offsetWidth);
boxes.forEach((box, i) => {
  box.style.width = widths[i] + 10 + 'px';
});
```

**✅ D. 控制合成层**
```javascript
// 动画前
element.style.willChange = 'transform';

// 动画中
element.style.transform = 'translateX(100px)';

// 动画后
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
}, { once: true });
```

**完整优化清单：**

**1. CSS 优化：**
```css
/* 合成属性 */
transform, opacity, filter

/* 硬件加速 */
transform: translate3d(0,0,0);
will-change: transform;

/* 减少选择器复杂度 */
.item { }  /* ✅ */
body > nav > ul > li:nth-child(2) { }  /* ❌ */

/* contain 隔离 */
.widget {
  contain: layout style paint;
}
```

**2. JavaScript 优化：**
```javascript
// rAF
requestAnimationFrame(animate);

// 批量操作
const fragment = document.createDocumentFragment();

// 虚拟滚动
const visibleItems = getVisibleItems();

// 节流防抖
const throttled = throttle(handler, 100);

// passive 事件
{ passive: true }

// IntersectionObserver
const observer = new IntersectionObserver(callback);

// Web Worker
const worker = new Worker('heavy.js');
```

**3. 性能监控：**
```javascript
// FPS
const fps = measureFPS();

// Performance API
performance.mark('start');
performance.measure('duration', 'start');

// Performance Observer
const observer = new PerformanceObserver((list) => {
  // 分析性能
});

// Chrome DevTools
// Performance, Rendering, Layers, Performance Monitor
```

**4. 降级策略：**
```css
/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 低端设备 */
@media (max-width: 768px) {
  .fancy {
    animation: none;
  }
}
```

**性能目标：**
```
✅ 60fps（16.67ms/帧）
✅ 首次内容绘制 < 1.8s
✅ 最大内容绘制 < 2.5s
✅ 首次输入延迟 < 100ms
✅ 累积布局偏移 < 0.1
```

</details>

---

**导航**  
[上一章：第 34 章 - Transition与Animation原理](./chapter-34.md) | [返回目录](../README.md) | [下一章：第 36 章 - 2D变换](./chapter-36.md)
