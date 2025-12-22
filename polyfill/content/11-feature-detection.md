# 第 11 章：特性检测原理

## 概述

特性检测是判断浏览器能力的运行时技术，比 UA 检测更可靠。理解特性检测原理，是实现优雅降级的基础。

## 一、为什么不用 UA 检测

### 1.1 UA 检测的问题

```javascript
// ❌ UA 检测（User-Agent）
const isChrome = navigator.userAgent.includes('Chrome');
if (isChrome) {
  // 假设 Chrome 支持某特性
}

// 问题：
// 1. UA 可以伪造
// 2. 同一浏览器不同版本能力不同
// 3. 新浏览器无法预测
// 4. 代码难以维护
```

### 1.2 特性检测的优势

```javascript
// ✅ 特性检测
if ('fetch' in window) {
  // 浏览器支持 fetch
  fetch('/api');
} else {
  // 使用 XMLHttpRequest
  const xhr = new XMLHttpRequest();
}

// 优势：
// 1. 直接检测能力，不依赖 UA
// 2. 自动适应新浏览器
// 3. 代码意图清晰
```

## 二、特性检测的方式

### 2.1 属性检测

```javascript
// 检测全局对象属性
if ('Promise' in window) { /* ... */ }
if ('localStorage' in window) { /* ... */ }
if ('IntersectionObserver' in window) { /* ... */ }

// 检测原型方法
if ('includes' in Array.prototype) { /* ... */ }
if ('padStart' in String.prototype) { /* ... */ }

// 检测 CSS 属性
if ('grid' in document.body.style) { /* ... */ }
```

### 2.2 typeof 检测

```javascript
// 检测函数是否存在
if (typeof fetch === 'function') { /* ... */ }
if (typeof Symbol === 'function') { /* ... */ }

// 检测对象
if (typeof localStorage === 'object') { /* ... */ }
```

### 2.3 try-catch 检测

```javascript
// 某些特性需要尝试使用
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl');
  } catch (e) {
    return false;
  }
}

// CSS 特性检测
function supportsCSSGrid() {
  try {
    return CSS.supports('display', 'grid');
  } catch (e) {
    return false;
  }
}
```

### 2.4 CSS.supports()

```javascript
// 现代浏览器的 CSS 特性检测
if (CSS.supports('display', 'grid')) {
  // 支持 Grid 布局
}

if (CSS.supports('backdrop-filter', 'blur(10px)')) {
  // 支持背景模糊
}

// 复杂条件
if (CSS.supports('(display: grid) and (gap: 10px)')) {
  // 支持 Grid 和 gap
}
```

## 三、Modernizr

### 3.1 什么是 Modernizr

Modernizr 是一个特性检测库，提供：
- 统一的 API
- 大量预置检测
- CSS 类名注入

### 3.2 基本使用

```bash
npm install modernizr
```

```javascript
// 使用 Modernizr
if (Modernizr.flexbox) {
  // 支持 flexbox
}

if (Modernizr.promises) {
  // 支持 Promise
}

if (Modernizr.webgl) {
  // 支持 WebGL
}
```

### 3.3 CSS 类名

```html
<!-- Modernizr 会在 html 元素添加类名 -->
<html class="js flexbox canvas webgl no-touch">

<!-- CSS 中根据能力应用样式 -->
<style>
.flexbox .container {
  display: flex;
}
.no-flexbox .container {
  display: table;
}
</style>
```

### 3.4 自定义构建

```javascript
// modernizr-config.json
{
  "feature-detects": [
    "css/flexbox",
    "css/grid",
    "es6/promises",
    "storage/localstorage"
  ],
  "options": [
    "setClasses"
  ]
}
```

```bash
# 生成自定义 Modernizr
npx modernizr -c modernizr-config.json -d modernizr-custom.js
```

## 四、@supports CSS 规则

### 4.1 基本语法

```css
/* 条件样式 */
@supports (display: grid) {
  .container {
    display: grid;
  }
}

/* 不支持时的回退 */
@supports not (display: grid) {
  .container {
    display: flex;
  }
}
```

### 4.2 组合条件

```css
/* AND */
@supports (display: grid) and (gap: 20px) {
  /* ... */
}

/* OR */
@supports (display: flex) or (display: grid) {
  /* ... */
}

/* 组合 */
@supports ((display: flex) and (gap: 20px)) or (display: grid) {
  /* ... */
}
```

### 4.3 实用示例

```css
/* 渐进增强的布局 */
.gallery {
  /* 回退：float 布局 */
  overflow: hidden;
}

.gallery-item {
  float: left;
  width: 33.33%;
}

/* 支持 Grid 时使用 Grid */
@supports (display: grid) {
  .gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow: visible;
  }
  
  .gallery-item {
    float: none;
    width: auto;
  }
}
```

## 五、封装检测工具

### 5.1 统一的检测模块

```javascript
// features.js
export const features = {
  // JavaScript 特性
  promise: typeof Promise === 'function',
  fetch: typeof fetch === 'function',
  proxy: typeof Proxy === 'function',
  symbol: typeof Symbol === 'function',
  
  // 数组方法
  arrayIncludes: 'includes' in Array.prototype,
  arrayFlat: 'flat' in Array.prototype,
  
  // DOM API
  intersectionObserver: 'IntersectionObserver' in window,
  resizeObserver: 'ResizeObserver' in window,
  mutationObserver: 'MutationObserver' in window,
  
  // 存储
  localStorage: (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  })(),
  
  // CSS
  grid: CSS.supports?.('display', 'grid') ?? false,
  flexGap: CSS.supports?.('gap', '1px') ?? false
};

// 使用
import { features } from './features';
if (features.intersectionObserver) {
  // 使用 IntersectionObserver
}
```

### 5.2 检测 + 加载 polyfill

```javascript
// loadPolyfills.js
export async function loadPolyfills() {
  const polyfills = [];
  
  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }
  
  if (!('ResizeObserver' in window)) {
    polyfills.push(import('resize-observer-polyfill').then(m => {
      window.ResizeObserver = m.default;
    }));
  }
  
  await Promise.all(polyfills);
}

// main.js
import { loadPolyfills } from './loadPolyfills';

loadPolyfills().then(() => {
  import('./app');
});
```

## 六、常见特性检测列表

### 6.1 ES6+ 特性

```javascript
const esFeatures = {
  // ES6
  promise: typeof Promise === 'function',
  symbol: typeof Symbol === 'function',
  map: typeof Map === 'function',
  set: typeof Set === 'function',
  weakMap: typeof WeakMap === 'function',
  
  // ES2017+
  asyncAwait: (async () => {})().constructor === Promise,
  
  // ES2020+
  bigInt: typeof BigInt === 'function',
  optionalChaining: (() => {
    try { eval('({})?.a'); return true; } catch { return false; }
  })()
};
```

### 6.2 Web API

```javascript
const webFeatures = {
  serviceWorker: 'serviceWorker' in navigator,
  webWorker: typeof Worker === 'function',
  webSocket: typeof WebSocket === 'function',
  webGL: (() => {
    try {
      return !!document.createElement('canvas').getContext('webgl');
    } catch { return false; }
  })(),
  geolocation: 'geolocation' in navigator,
  notification: 'Notification' in window,
  clipboard: 'clipboard' in navigator
};
```

## 七、最佳实践

| 实践 | 说明 |
|------|------|
| 优先特性检测 | 不要依赖 UA 字符串 |
| 检测后缓存结果 | 避免重复检测 |
| 渐进增强 | 基础功能不依赖新特性 |
| 按需检测 | 只检测要用的特性 |
| 提供回退 | 检测失败时有备选方案 |

## 参考资料

- [Modernizr](https://modernizr.com/)
- [Can I Use](https://caniuse.com/)
- [MDN @supports](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@supports)

---

**下一章** → [第 12 章：条件加载实践](./12-conditional-loading.md)
