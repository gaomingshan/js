# 第 25 章：性能优化基础

## 概述

页面性能直接影响用户体验和 SEO。优化 HTML 是提升性能的第一步。

## 一、关键渲染路径

### 1.1 优化关键资源

```html
<head>
  <!-- 关键 CSS 内联 -->
  <style>
  /* 首屏关键样式 */
  .header { /* ... */ }
  </style>
  
  <!-- 非关键 CSS 延迟加载 -->
  <link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  
  <!-- JavaScript 延迟 -->
  <script src="app.js" defer></script>
</head>
```

### 1.2 资源优先级

```html
<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预获取 -->
<link rel="prefetch" href="next-page.html">
```

## 二、图片优化

### 2.1 现代格式

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="图片">
</picture>
```

### 2.2 懒加载

```html
<img src="image.jpg" loading="lazy" alt="图片">
```

### 2.3 响应式图片

```html
<img srcset="small.jpg 480w, large.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 50vw"
     src="large.jpg" alt="响应式图片">
```

## 三、减少请求

### 3.1 合并资源

```html
<!-- ❌ 多个请求 -->
<script src="lib1.js"></script>
<script src="lib2.js"></script>
<script src="lib3.js"></script>

<!-- ✅ 合并后 -->
<script src="bundle.js"></script>
```

### 3.2 CSS Sprites

```css
.icon {
  background: url('sprites.png');
}
.icon-home { background-position: 0 0; }
.icon-user { background-position: -20px 0; }
```

## 四、缓存策略

```html
<meta http-equiv="Cache-Control" content="max-age=31536000">
```

## 五、性能测量

```javascript
// Performance API
const perfData = performance.getEntriesByType('navigation')[0];
console.log('DOM 加载:', perfData.domContentLoadedEventEnd);
console.log('完全加载:', perfData.loadEventEnd);

// Core Web Vitals
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
});
observer.observe({entryTypes: ['largest-contentful-paint']});
```

## 参考资料

- [Web.dev - Performance](https://web.dev/performance/)
- [MDN - Web Performance](https://developer.mozilla.org/zh-CN/docs/Web/Performance)

---

**上一章** ← [第 24 章：CSRF 防护](./24-csrf-protection.md)  
**下一章** → [第 26 章：资源加载优化](./26-resource-loading.md)
