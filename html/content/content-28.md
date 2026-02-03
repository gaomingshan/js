# HTML 解析性能

## 核心概念

HTML 解析性能直接影响 DOM 构建速度和首屏时间。优化解析性能需要从多个维度入手。

## 避免解析阻塞

### Script 放置优化

```html
<!-- ❌ 错误：script 在 head 中阻塞 -->
<head>
  <script src="app.js"></script>
</head>

<!-- ✅ 正确：使用 defer -->
<head>
  <script src="app.js" defer></script>
</head>

<!-- ✅ 或放在 body 底部 -->
<body>
  <h1>内容</h1>
  <script src="app.js"></script>
</body>
```

### CSS 优化

```html
<!-- ❌ 大量外部 CSS 阻塞渲染 -->
<link rel="stylesheet" href="framework.css">
<link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="pages.css">

<!-- ✅ 合并 CSS -->
<link rel="stylesheet" href="all.css">

<!-- ✅ 或内联关键 CSS -->
<style>/* 关键样式 */</style>
<link rel="preload" href="all.css" as="style" onload="this.rel='stylesheet'">
```

## 减少重排重绘

```javascript
// ❌ 频繁触发重排
for (let i = 0; i < 100; i++) {
  element.style.left = i + 'px';
}

// ✅ 使用 transform
element.style.transform = 'translateX(100px)';

// ✅ 批量操作
element.style.cssText = 'left: 100px; top: 100px;';

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

## HTML 结构设计

```html
<!-- ❌ 过深嵌套 -->
<div><div><div><div><div><div>
  <p>内容</p>
</div></div></div></div></div></div>

<!-- ✅ 扁平结构 -->
<p>内容</p>

<!-- ❌ 过多节点 -->
<ul>
  <!-- 10000 个 li -->
</ul>

<!-- ✅ 虚拟滚动 -->
<ul id="virtual-list">
  <!-- 只渲染可见的 20 个 li -->
</ul>
```

## Performance API 监控

```javascript
window.addEventListener('load', () => {
  const perfData = performance.timing;
  
  const metrics = {
    // DNS 查询
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    
    // TCP 连接
    tcp: perfData.connectEnd - perfData.connectStart,
    
    // 请求响应
    request: perfData.responseEnd - perfData.requestStart,
    
    // HTML 解析
    domParsing: perfData.domInteractive - perfData.domLoading,
    
    // DOM 完成
    domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    
    // 完全加载
    load: perfData.loadEventEnd - perfData.navigationStart
  };
  
  console.table(metrics);
  
  // 上报到监控系统
  sendMetrics(metrics);
});

// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

**后端类比**：性能监控 ≈ APM（Application Performance Monitoring）。

## 参考资源

- [Web.dev - Performance](https://web.dev/performance/)
- [MDN - Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
