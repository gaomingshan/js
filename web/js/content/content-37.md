# 性能优化实践

> 构建高性能的 JavaScript 应用

---

## 概述

性能优化是前端开发的重要环节。通过合理的优化策略，可以显著提升用户体验。

本章将深入：
- 性能指标
- 加载优化
- 运行时优化
- 渲染优化
- 监控与分析

---

## 1. 性能指标

### 1.1 Core Web Vitals

```javascript
// LCP - Largest Contentful Paint（最大内容绘制）
// 目标：< 2.5s

// FID - First Input Delay（首次输入延迟）
// 目标：< 100ms

// CLS - Cumulative Layout Shift（累积布局偏移）
// 目标：< 0.1

// 测量 LCP
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });

// 测量 FID
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('FID:', entry.processingStart - entry.startTime);
  }
}).observe({ entryTypes: ['first-input'] });
```

### 1.2 其他关键指标

```javascript
// FCP - First Contentful Paint
// TTFB - Time to First Byte
// TTI - Time to Interactive

// 获取性能指标
const perfData = performance.getEntriesByType('navigation')[0];

console.log('DNS查询:', perfData.domainLookupEnd - perfData.domainLookupStart);
console.log('TCP连接:', perfData.connectEnd - perfData.connectStart);
console.log('请求响应:', perfData.responseEnd - perfData.requestStart);
console.log('DOM解析:', perfData.domComplete - perfData.domInteractive);
console.log('页面加载:', perfData.loadEventEnd - perfData.navigationStart);
```

---

## 2. 加载优化

### 2.1 资源压缩

```javascript
// Gzip/Brotli 压缩
// 服务器配置（示例）

// Webpack 配置
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // 移除 console
            drop_debugger: true
          }
        }
      })
    ]
  }
};
```

### 2.2 代码分割

```javascript
// 动态导入
const loadModule = async () => {
  const module = await import('./heavy-module.js');
  module.initialize();
};

// React 路由懒加载
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}

// Webpack 魔法注释
import(
  /* webpackChunkName: "dashboard" */
  /* webpackPrefetch: true */
  './Dashboard'
);
```

### 2.3 资源预加载

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预获取未来资源 -->
<link rel="prefetch" href="next-page.js">
```

### 2.4 Tree Shaking

```javascript
// ✅ 支持 Tree Shaking
// utils.js
export function used() {}
export function unused() {}

// main.js
import { used } from './utils.js';  // unused 不会被打包

// ❌ 不支持 Tree Shaking
// utils.js
export default {
  used() {},
  unused() {}
};

// main.js
import utils from './utils.js';  // 整个对象都会被打包
utils.used();
```

---

## 3. 运行时优化

### 3.1 防抖和节流

```javascript
// 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流
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
  console.log('滚动事件');
}, 200));

input.addEventListener('input', debounce((e) => {
  console.log('搜索:', e.target.value);
}, 300));
```

### 3.2 requestIdleCallback

```javascript
// 在浏览器空闲时执行任务
function processLargeData(data) {
  const chunks = chunkArray(data, 100);
  
  function processChunk(deadline) {
    while (deadline.timeRemaining() > 0 && chunks.length > 0) {
      const chunk = chunks.shift();
      processItems(chunk);
    }
    
    if (chunks.length > 0) {
      requestIdleCallback(processChunk);
    }
  }
  
  requestIdleCallback(processChunk);
}
```

### 3.3 Web Workers

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: largeDataset });

worker.onmessage = (e) => {
  console.log('处理完成:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data.data);
  self.postMessage(result);
};
```

### 3.4 虚拟列表

```javascript
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.startIndex = 0;
    
    this.render();
    this.container.addEventListener('scroll', () => this.handleScroll());
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.render();
    }
  }
  
  render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleCount + 1,
      this.items.length
    );
    
    const fragment = document.createDocumentFragment();
    
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.items[i];
      fragment.appendChild(item);
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  }
}
```

---

## 4. 渲染优化

### 4.1 避免强制同步布局

```javascript
// ❌ 强制同步布局
elements.forEach(el => {
  el.style.width = el.offsetWidth + 10 + 'px';  // 读取触发布局
});

// ✅ 批量读取，批量写入
const widths = elements.map(el => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px';
});
```

### 4.2 使用 transform 和 opacity

```css
/* ❌ 触发重排 */
.box {
  transition: left 0.3s;
}
.box:hover {
  left: 100px;
}

/* ✅ 只触发合成 */
.box {
  transition: transform 0.3s;
}
.box:hover {
  transform: translateX(100px);
}
```

### 4.3 减少 DOM 操作

```javascript
// ❌ 多次 DOM 操作
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  container.appendChild(div);  // 每次触发重排
}

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}
container.appendChild(fragment);  // 一次重排
```

### 4.4 使用 CSS Containment

```css
/* 告诉浏览器元素独立渲染 */
.card {
  contain: layout style paint;
}

/* 或使用 content-visibility */
.lazy-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

---

## 5. 图片优化

### 5.1 响应式图片

```html
<!-- srcset 和 sizes -->
<img 
  src="small.jpg"
  srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Responsive image"
>

<!-- picture 元素 -->
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Image">
</picture>

<!-- WebP 格式 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Image">
</picture>
```

### 5.2 懒加载

```javascript
// Intersection Observer
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

// 原生 loading 属性
<img src="image.jpg" loading="lazy" alt="Lazy image">
```

### 5.3 图片压缩

```javascript
// 使用 Canvas 压缩图片
function compressImage(file, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
    };
    
    reader.readAsDataURL(file);
  });
}
```

---

## 6. 缓存策略

### 6.1 Service Worker

```javascript
// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 6.2 HTTP 缓存

```javascript
// 强缓存
Cache-Control: max-age=31536000, immutable

// 协商缓存
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
```

### 6.3 内存缓存

```javascript
class Cache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const value = this.cache.get(key);
    // LRU: 移到最后
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, value);
    
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

---

## 7. 监控与分析

### 7.1 性能监控

```javascript
// 自定义性能标记
performance.mark('task-start');

// 执行任务
await heavyTask();

performance.mark('task-end');

// 测量耗时
performance.measure('task-duration', 'task-start', 'task-end');

const measure = performance.getEntriesByName('task-duration')[0];
console.log('耗时:', measure.duration);
```

### 7.2 错误监控

```javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('错误:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // 上报错误
  reportError(event);
});

// Promise 错误捕获
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  reportError(event);
});
```

### 7.3 性能上报

```javascript
function reportPerformance() {
  const perfData = performance.getEntriesByType('navigation')[0];
  
  const metrics = {
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp: perfData.connectEnd - perfData.connectStart,
    ttfb: perfData.responseStart - perfData.requestStart,
    download: perfData.responseEnd - perfData.responseStart,
    domParse: perfData.domComplete - perfData.domInteractive,
    loadTime: perfData.loadEventEnd - perfData.navigationStart
  };
  
  // 上报数据
  navigator.sendBeacon('/api/performance', JSON.stringify(metrics));
}

// 页面卸载前上报
window.addEventListener('beforeunload', reportPerformance);
```

---

## 8. 优化清单

### 8.1 加载优化

```
□ 启用 Gzip/Brotli 压缩
□ 代码分割和懒加载
□ 资源预加载（preload/prefetch）
□ Tree Shaking
□ 使用 CDN
□ 启用 HTTP/2
□ 优化关键渲染路径
```

### 8.2 运行时优化

```
□ 防抖和节流
□ 使用 requestIdleCallback
□ Web Workers 处理复杂计算
□ 虚拟列表
□ 对象池复用
□ 避免内存泄漏
```

### 8.3 渲染优化

```
□ 避免强制同步布局
□ 使用 transform 和 opacity
□ 减少 DOM 操作
□ 使用 CSS Containment
□ 优化动画性能
```

### 8.4 资源优化

```
□ 图片懒加载
□ 响应式图片
□ 图片压缩
□ 使用现代图片格式（WebP）
□ 字体优化
```

---

## 关键要点

1. **性能指标**
   - Core Web Vitals
   - 自定义指标
   - 持续监控

2. **加载优化**
   - 代码分割
   - 资源压缩
   - 预加载

3. **运行时优化**
   - 防抖节流
   - Web Workers
   - 虚拟列表

4. **渲染优化**
   - 减少重排重绘
   - 使用 transform
   - CSS Containment

5. **监控分析**
   - 性能监控
   - 错误追踪
   - 数据上报

---

## 参考资料

- [Web.dev: Performance](https://web.dev/performance/)
- [MDN: Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**上一章**：[代码规范与质量](./content-36.md)  
**下一章**：[面试题汇总](../quiz/quiz.md)
