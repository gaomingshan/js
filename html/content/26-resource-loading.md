# 第 26 章：资源加载优化

## 概述

合理的资源加载策略能显著提升页面性能。

## 一、Script 加载策略

### 1.1 defer vs async

```html
<!-- 默认：阻塞解析 -->
<script src="script.js"></script>

<!-- async：并行下载，下载完立即执行 -->
<script src="analytics.js" async></script>

<!-- defer：并行下载，DOM 解析完后执行 -->
<script src="app.js" defer></script>
```

**使用建议：**
- `defer`：依赖 DOM 的脚本
- `async`：独立脚本（统计、广告）

### 1.2 动态加载

```javascript
// 按需加载
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 使用
loadScript('/lib.js').then(() => {
  console.log('脚本加载完成');
});
```

## 二、CSS 加载优化

### 2.1 关键 CSS

```html
<style>
/* 首屏关键样式内联 */
.header { display: flex; }
.hero { height: 100vh; }
</style>

<link rel="stylesheet" href="main.css">
```

### 2.2 媒体查询

```html
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="screen and (max-width: 768px)">
```

## 三、预加载技术

### 3.1 Resource Hints

```html
<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预渲染 -->
<link rel="prerender" href="next-page.html">
```

### 3.2 优先级提示

```html
<link rel="preload" href="critical.css" as="style" importance="high">
<img src="hero.jpg" importance="high" alt="英雄图">
<img src="thumbnail.jpg" importance="low" alt="缩略图">
```

## 四、代码分割

```html
<!-- 主包 -->
<script src="vendor.js" defer></script>
<script src="main.js" defer></script>

<!-- 按路由分割 -->
<script>
import('/pages/about.js').then(module => {
  module.init();
});
</script>
```

## 五、Service Worker

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/style.css',
        '/script.js'
      ]);
    })
  );
});
```

## 参考资料

- [MDN - Resource Hints](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload)
- [Web.dev - Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)

---

**上一章** ← [第 25 章：性能优化基础](./25-performance-basics.md)  
**下一章** → [第 27 章：响应式设计](./27-responsive-design.md)
