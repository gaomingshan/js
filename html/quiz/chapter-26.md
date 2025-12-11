# 第 26 章：资源加载优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 缓存策略
### 题目
强缓存和协商缓存的区别？

<details><summary>查看答案</summary>
### ✅ 答案
**强缓存：** 直接使用缓存，不请求服务器  
**协商缓存：** 询问服务器是否可用缓存

**来源：** HTTP 缓存
</details>

---

## 第 2 题 🟢 | CDN
### 题目
CDN 的作用？**（多选）**

**A.** 加速访问 | **B.** 减轻服务器压力 | **C.** 提高可用性 | **D.** 加密数据

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C

**来源：** CDN 原理
</details>

---

## 第 3 题 🟢 | 压缩
### 题目
Gzip 和 Brotli 的区别？

<details><summary>查看答案</summary>
### ✅ 答案
**Brotli：** 压缩率更高，速度略慢  
**Gzip：** 兼容性更好

```nginx
# Nginx 配置
gzip on;
gzip_types text/css application/javascript;

# Brotli（需模块）
brotli on;
brotli_types text/css application/javascript;
```

**来源：** 压缩算法
</details>

---

## 第 4 题 🟡 | HTTP/2
### 题目
HTTP/2 的优化特性？**（多选）**

**A.** 多路复用 | **B.** 头部压缩 | **C.** 服务器推送 | **D.** 二进制分帧

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D

**来源：** HTTP/2 规范
</details>

---

## 第 5 题 🟡 | Service Worker
### 题目
Service Worker 缓存策略。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
```

**来源：** Service Worker
</details>

---

## 第 6 题 🟡 | 雪碧图
### 题目
雪碧图的优缺点？

<details><summary>查看答案</summary>
### ✅ 答案
**优点：** 减少HTTP请求  
**缺点：** 维护困难、HTTP/2下不明显

```css
.icon-home {
  background: url('sprites.png') 0 0;
  width: 20px;
  height: 20px;
}
.icon-user {
  background: url('sprites.png') -20px 0;
}
```

**来源：** CSS Sprites
</details>

---

## 第 7 题 🟡 | 模块化加载
### 题目
ES Modules 的优势？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- 原生支持 -->
<script type="module">
  import { add } from './math.js';
  console.log(add(1, 2));
</script>

<!-- 动态导入 -->
<script type="module">
  button.addEventListener('click', async () => {
    const module = await import('./feature.js');
    module.init();
  });
</script>
```

**优势：**
- 按需加载
- Tree Shaking
- 严格模式
- 顶层 this 为 undefined

**来源：** ES Modules
</details>

---

## 第 8 题 🔴 | 资源优先级
### 题目
浏览器如何决定资源加载优先级？

<details><summary>查看答案</summary>
### ✅ 答案

**优先级（高到低）：**
1. HTML
2. CSS
3. 字体
4. 同步脚本
5. 异步脚本
6. 图片

**手动控制：**
```html
<!-- 提升优先级 -->
<link rel="preload" href="critical.css" as="style">

<!-- 降低优先级 -->
<img src="hero.jpg" fetchpriority="high">
<img src="footer.jpg" fetchpriority="low">

<script src="important.js" fetchpriority="high"></script>
```

**来源：** Resource Priority
</details>

---

## 第 9 题 🔴 | 代码分割
### 题目
实现代码分割方案。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 1. 动态导入
button.addEventListener('click', async () => {
  const { default: Chart } = await import('./chart.js');
  new Chart().render();
});

// 2. 路由懒加载（React）
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</Suspense>

// 3. Webpack 代码分割
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5
        }
      }
    }
  }
};
```

**来源：** Code Splitting
</details>

---

## 第 10 题 🔴 | 完整加载策略
### 题目
设计完整的资源加载优化方案。

<details><summary>查看答案</summary>
### ✅ 答案

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 1. DNS 预解析 -->
  <link rel="dns-prefetch" href="https://cdn.example.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  
  <!-- 2. 预连接 -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  
  <!-- 3. 预加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/styles/critical.css" as="style">
  <link rel="preload" href="/images/hero.jpg" as="image">
  
  <!-- 4. 内联关键 CSS -->
  <style>
    /* 首屏样式 */
    body { margin: 0; font-family: Arial; }
    .header { background: #333; color: white; }
  </style>
  
  <!-- 5. 异步加载非关键 CSS -->
  <link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
  
  <title>页面标题</title>
</head>
<body>
  <!-- 6. 内容 -->
  <header class="header">
    <h1>网站标题</h1>
  </header>
  
  <main>
    <!-- 7. 响应式图片 -->
    <picture>
      <source srcset="/images/hero.webp" type="image/webp">
      <img src="/images/hero.jpg" alt="Hero" width="1200" height="600" loading="eager" fetchpriority="high">
    </picture>
    
    <!-- 8. 懒加载图片 -->
    <img src="/images/placeholder.jpg" data-src="/images/content.jpg" loading="lazy" alt="Content">
  </main>
  
  <!-- 9. 脚本加载 -->
  <!-- 关键脚本：defer -->
  <script src="/js/app.js" defer></script>
  
  <!-- 分析脚本：async -->
  <script src="https://analytics.com/script.js" async></script>
  
  <!-- 10. 模块化脚本 -->
  <script type="module">
    import { init } from './main.js';
    init();
  </script>
  
  <!-- 11. Service Worker 注册 -->
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
  
  <!-- 12. 预获取下一页 -->
  <link rel="prefetch" href="/next-page.html">
  <link rel="prefetch" href="/js/next-page.js">
</body>
</html>
```

**Service Worker (sw.js):**
```javascript
const CACHE_NAME = 'v1';
const ASSETS = [
  '/',
  '/styles/main.css',
  '/js/app.js',
  '/images/logo.png'
];

// 安装
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// 激活
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // 缓存优先
      if (response) return response;
      
      // 网络请求
      return fetch(e.request).then(response => {
        // 缓存新资源
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    })
  );
});
```

**性能监控：**
```javascript
// Performance API
window.addEventListener('load', () => {
  const timing = performance.timing;
  
  console.log('DNS查询：', timing.domainLookupEnd - timing.domainLookupStart);
  console.log('TCP连接：', timing.connectEnd - timing.connectStart);
  console.log('首字节：', timing.responseStart - timing.requestStart);
  console.log('DOM解析：', timing.domComplete - timing.domLoading);
  console.log('页面加载：', timing.loadEventEnd - timing.navigationStart);
});

// Resource Timing
performance.getEntriesByType('resource').forEach(resource => {
  console.log(resource.name, resource.duration);
});
```

**来源：** 资源加载最佳实践
</details>

---

**📌 本章总结**
- 缓存：强缓存、协商缓存、Service Worker
- 压缩：Gzip、Brotli
- HTTP/2：多路复用、服务器推送
- 预加载：preload, prefetch, preconnect
- 代码分割：动态导入、路由懒加载
- 优先级：fetchpriority 属性
- CDN：静态资源分发

**上一章** ← [第 25 章：性能优化基础](./chapter-25.md)  
**下一章** → [第 27 章：响应式设计](./chapter-27.md)
