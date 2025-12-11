# 第 6 章：样式表加载与阻塞

## 概述

CSS加载直接影响页面渲染性能。理解CSS加载机制和阻塞行为，是优化页面首屏渲染的关键。

---

## 一、CSS加载方式

### 1.1 外部样式表

```html
<!-- 标准加载 -->
<link rel="stylesheet" href="style.css">

<!-- 媒体查询 -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- 预加载 -->
<link rel="preload" href="critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 1.2 内联样式

```html
<style>
  body { margin: 0; }
  .critical { color: red; }
</style>
```

### 1.3 @import

```css
@import url('base.css');
@import url('theme.css') screen;
```

> ⚠️ **性能问题**：@import阻塞并行下载，不推荐使用。

---

## 二、CSS阻塞渲染

### 2.1 渲染阻塞

**CSS会阻塞渲染**：浏览器必须等待CSSOM构建完成才能渲染。

```
HTML解析 → DOM树
    ↓
CSS加载 → CSSOM树（阻塞）
    ↓
DOM + CSSOM → 渲染树 → 渲染
```

### 2.2 不阻塞DOM解析

CSS不会阻塞HTML解析，但会阻塞渲染：

```html
<link rel="stylesheet" href="style.css">
<script>
  // CSS加载时，DOM继续解析
  console.log(document.body); // 可访问
</script>
```

### 2.3 阻塞JavaScript

CSS会阻塞JavaScript执行（因为JS可能访问样式）：

```html
<link rel="stylesheet" href="style.css">
<script>
  // 必须等待CSS加载完成
  console.log(getComputedStyle(document.body).color);
</script>
```

---

## 三、关键CSS优化

### 3.1 内联关键CSS

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 内联首屏关键样式 -->
  <style>
    body { margin: 0; font-family: Arial; }
    .header { height: 80px; background: #333; }
    .hero { min-height: 400px; }
  </style>
  
  <!-- 非关键CSS异步加载 -->
  <link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>
</head>
<body>
  <!-- 首屏内容 -->
</body>
</html>
```

### 3.2 提取关键CSS

**工具**：
- Critical
- Critters
- PurgeCSS

```javascript
// 使用 Critical
const critical = require('critical');

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  width: 1300,
  height: 900
});
```

### 3.3 媒体查询优化

```html
<!-- 只在打印时阻塞渲染 -->
<link rel="stylesheet" href="print.css" media="print">

<!-- 移动端才加载 -->
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">
```

---

## 四、CSS加载优化

### 4.1 使用多个link

```html
<!-- ✅ 好：并行加载 -->
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="theme.css">
<link rel="stylesheet" href="components.css">

<!-- ❌ 避免：串行加载 -->
<style>
  @import url('base.css');
  @import url('theme.css');
  @import url('components.css');
</style>
```

### 4.2 资源提示

```html
<!-- DNS预解析 -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.gstatic.com">

<!-- 预加载 -->
<link rel="preload" href="style.css" as="style">

<!-- 预获取（低优先级） -->
<link rel="prefetch" href="next-page.css">
```

### 4.3 压缩与合并

```bash
# 压缩CSS
cssnano input.css output.css

# 合并CSS（生产环境）
cat base.css theme.css > bundle.css
```

---

## 五、加载性能指标

### 5.1 关键指标

- **FCP (First Contentful Paint)**：首次内容绘制
- **LCP (Largest Contentful Paint)**：最大内容绘制
- **CLS (Cumulative Layout Shift)**：累积布局偏移

### 5.2 优化目标

```
关键CSS < 14KB（一个TCP包）
首屏渲染时间 < 1秒
总CSS大小 < 100KB
```

---

## 六、最佳实践

### 6.1 优化策略

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. 内联关键CSS -->
  <style>
    /* 首屏样式 */
    body { margin: 0; }
    .header { /* ... */ }
  </style>
  
  <!-- 2. 预连接字体 -->
  <link rel="preconnect" href="https://fonts.gstatic.com">
  
  <!-- 3. 异步加载非关键CSS -->
  <link rel="preload" href="full.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="full.css"></noscript>
  
  <!-- 4. 字体异步加载 -->
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

### 6.2 避免的做法

```html
<!-- ❌ 避免：@import -->
<style>@import url('style.css');</style>

<!-- ❌ 避免：头部太多CSS -->
<link rel="stylesheet" href="1.css">
<link rel="stylesheet" href="2.css">
<!-- ... 20+ files ... -->

<!-- ❌ 避免：阻塞的字体 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
```

---

## 七、调试工具

### 7.1 Chrome DevTools

```
1. Network面板 → 筛选CSS
2. 查看加载时间和优先级
3. Coverage面板 → 查看未使用CSS
```

### 7.2 Lighthouse

```
1. 运行Lighthouse审计
2. 查看"Eliminate render-blocking resources"
3. 优化建议
```

---

## 参考资料

- [Render-Blocking CSS](https://web.dev/render-blocking-resources/)
- [Critical CSS](https://web.dev/extract-critical-css/)
- [Resource Hints](https://w3c.github.io/resource-hints/)

---

**导航**  
[上一章：第 5 章 - CSS解析机制](./05-css-parsing.md)  
[返回目录](../README.md)  
[下一章：第 7 章 - 层叠算法详解](./07-cascade.md)
