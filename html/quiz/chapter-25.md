# 第 25 章：性能优化基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 关键渲染路径
### 题目
关键渲染路径包括哪些步骤？**（多选）**

**A.** DOM构建 | **B.** CSSOM构建 | **C.** 渲染树 | **D.** 布局、绘制

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D

DOM → CSSOM → 渲染树 → 布局 → 绘制

**来源：** 浏览器渲染原理
</details>

---

## 第 2 题 🟢 | 阻塞渲染
### 题目
哪些资源会阻塞渲染？**（多选）**

**A.** CSS | **B.** JavaScript | **C.** 图片 | **D.** 字体

<details><summary>查看答案</summary>
### ✅ 答案：A, B

CSS 阻塞渲染，JS 阻塞解析

**来源：** 渲染阻塞
</details>

---

## 第 3 题 🟢 | async vs defer
### 题目
`async` 和 `defer` 的区别？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- async：下载完立即执行 -->
<script src="analytics.js" async></script>

<!-- defer：DOM解析完后执行 -->
<script src="app.js" defer></script>
```

| 特性 | async | defer |
|------|-------|-------|
| **下载** | 异步 | 异步 |
| **执行时机** | 下载完 | DOMContentLoaded前 |
| **顺序** | 不保证 | 保证 |

**来源：** Script Loading
</details>

---

## 第 4 题 🟡 | 懒加载
### 题目
实现图片懒加载。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- 方法1：原生 -->
<img src="placeholder.jpg" data-src="real.jpg" loading="lazy" alt="Image">

<!-- 方法2：Intersection Observer -->
<img data-src="image.jpg" alt="Image">

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

**来源：** 图片优化
</details>

---

## 第 5 题 🟡 | 资源提示
### 题目
`preload`、`prefetch`、`preconnect` 的区别？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- preload：当前页立即需要 -->
<link rel="preload" href="main.css" as="style">

<!-- prefetch：未来页面可能需要 -->
<link rel="prefetch" href="/next-page.js">

<!-- preconnect：提前建立连接 -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- dns-prefetch：仅DNS解析 -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```

**来源：** Resource Hints
</details>

---

## 第 6 题 🟡 | 关键CSS
### 题目
什么是关键CSS？如何实现？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- 内联关键CSS -->
<style>
  /* 首屏样式 */
  body { margin: 0; font-family: Arial; }
  .header { background: #333; }
</style>

<!-- 异步加载非关键CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

**工具：** Critical, Penthouse

**来源：** Critical CSS
</details>

---

## 第 7 题 🟡 | 减少DOM操作
### 题目
为什么要减少DOM操作？如何优化？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// ❌ 慢：多次操作
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div);
}

// ✅ 快：批量操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);

// ✅ 快：innerHTML
const html = Array.from({length: 1000}, () => '<div></div>').join('');
document.body.innerHTML = html;
```

**来源：** DOM 性能
</details>

---

## 第 8 题 🔴 | 响应式图片
### 题目
实现完整的响应式图片方案。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```html
<picture>
  <!-- WebP格式（现代浏览器） -->
  <source 
    srcset="hero-small.webp 480w,
            hero-medium.webp 768w,
            hero-large.webp 1200w"
    sizes="(max-width: 600px) 480px,
           (max-width: 1000px) 768px,
           1200px"
    type="image/webp">
  
  <!-- JPEG格式（降级） -->
  <source 
    srcset="hero-small.jpg 480w,
            hero-medium.jpg 768w,
            hero-large.jpg 1200w"
    sizes="(max-width: 600px) 480px,
           (max-width: 1000px) 768px,
           1200px"
    type="image/jpeg">
  
  <!-- 默认图片 -->
  <img src="hero-medium.jpg" alt="Hero Image" loading="lazy">
</picture>
```

**来源：** 响应式图片
</details>

---

## 第 9 题 🔴 | Web Vitals
### 题目
Core Web Vitals 三大指标？

<details><summary>查看答案</summary>
### ✅ 答案

**1. LCP (Largest Contentful Paint)**
- 最大内容绘制
- 目标：< 2.5s

**2. FID (First Input Delay)**
- 首次输入延迟
- 目标：< 100ms

**3. CLS (Cumulative Layout Shift)**
- 累积布局偏移
- 目标：< 0.1

```javascript
// 测量
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({type: 'largest-contentful-paint', buffered: true});
```

**来源：** Core Web Vitals
</details>

---

## 第 10 题 🔴 | 性能优化清单
### 题目
总结 HTML 性能优化清单。

<details><summary>查看答案</summary>
### ✅ 答案

**1. 资源优化**
- 压缩：Gzip/Brotli
- 缓存：强缓存、协商缓存
- CDN：静态资源分发

**2. 渲染优化**
```html
<!-- 关键CSS内联 -->
<style>/* 首屏样式 */</style>

<!-- 非关键CSS异步 -->
<link rel="preload" href="styles.css" as="style">

<!-- JS defer/async -->
<script src="app.js" defer></script>
```

**3. 图片优化**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" loading="lazy" alt="">
</picture>
```

**4. 预加载**
```html
<link rel="preconnect" href="https://cdn.com">
<link rel="dns-prefetch" href="https://fonts.com">
<link rel="preload" href="font.woff2" as="font">
```

**5. 字体优化**
```css
@font-face {
  font-family: 'Custom';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* 立即显示备用字体 */
}
```

**6. 减少请求**
- 雪碧图
- 内联小图片（base64）
- 合并文件

**7. 监控**
```javascript
// Performance API
const timing = performance.timing;
const loadTime = timing.loadEventEnd - timing.navigationStart;

// Web Vitals
import {getCLS, getFID, getLCP} from 'web-vitals';
getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

**来源：** 性能优化最佳实践
</details>

---

**📌 本章总结**
- 关键渲染路径：DOM → CSSOM → 渲染树 → 布局 → 绘制
- 资源提示：preload, prefetch, preconnect
- 脚本加载：async, defer
- 图片优化：懒加载、响应式、WebP
- Core Web Vitals：LCP, FID, CLS
- 关键CSS：内联首屏样式

**上一章** ← [第 24 章：CSRF防护](./chapter-24.md)  
**下一章** → [第 26 章：资源加载优化](./chapter-26.md)
