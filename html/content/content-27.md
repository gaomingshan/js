# 首屏渲染优化策略

## 核心概念

首屏渲染优化的目标是让用户尽快看到可用的内容，核心指标包括 FCP、LCP、TTI。

```
FCP (First Contentful Paint): 首次内容绘制
LCP (Largest Contentful Paint): 最大内容绘制
TTI (Time to Interactive): 可交互时间
```

## Above the Fold 优化

```html
<head>
  <!-- 1. 内联关键 CSS -->
  <style>
    /* 首屏样式 */
    .header { background: #333; }
    .hero { min-height: 600px; }
  </style>
  
  <!-- 2. 预加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  <link rel="preload" href="/images/hero.jpg" as="image">
  
  <!-- 3. 异步加载非关键 CSS -->
  <link rel="preload" href="/css/below-fold.css" as="style" onload="this.rel='stylesheet'">
</head>

<body>
  <!-- 4. 首屏内容优先 -->
  <header class="header">头部</header>
  <section class="hero">首屏内容</section>
  
  <!-- 5. 非首屏内容延迟加载 -->
  <section style="min-height: 800px;">
    <!-- 懒加载 -->
  </section>
  
  <!-- 6. JavaScript 放底部 -->
  <script src="/js/app.js" defer></script>
</body>
```

## 关键资源识别

```javascript
// 使用 Performance API 分析
window.addEventListener('load', () => {
  const resources = performance.getEntriesByType('resource');
  
  resources.forEach(resource => {
    if (resource.initiatorType === 'css' || resource.initiatorType === 'script') {
      console.log(`${resource.name}: ${resource.duration}ms`);
    }
  });
});
```

## 骨架屏

```html
<!-- 骨架屏占位 -->
<div class="skeleton">
  <div class="skeleton-header"></div>
  <div class="skeleton-content"></div>
</div>

<style>
.skeleton {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

<script>
// 内容加载后替换骨架屏
fetch('/api/data').then(data => {
  document.querySelector('.skeleton').innerHTML = renderContent(data);
});
</script>
```

## 懒加载

```html
<!-- 图片懒加载 -->
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy">

<!-- Intersection Observer 懒加载 -->
<script>
const images = document.querySelectorAll('img[data-src]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

images.forEach(img => observer.observe(img));
</script>
```

**后端类比**：首屏优化 ≈ 数据库查询优化（索引、缓存）。

## 参考资源

- [Web.dev - First Contentful Paint](https://web.dev/fcp/)
- [Web.dev - Largest Contentful Paint](https://web.dev/lcp/)
