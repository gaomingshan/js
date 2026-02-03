# 资源加载的优先级与时序

## 核心概念

浏览器在加载页面时，会同时请求多种资源（HTML、CSS、JS、图片等）。资源加载的**优先级**和**时序**直接影响页面性能和用户体验。

```
资源加载优先级（从高到低）：
1. HTML 文档
2. CSS 文件（阻塞渲染）
3. 字体文件（preload）
4. 同步 JavaScript
5. XHR / Fetch 请求
6. 图片（viewport 内）
7. 图片（viewport 外）
8. 低优先级资源
```

**后端类比**：
- 资源优先级 ≈ 任务队列的优先级
- 关键渲染路径 ≈ 数据库查询的关键路径

## 关键渲染路径（Critical Rendering Path）

### 完整的渲染流程

```
1. HTML 下载
   ↓
2. HTML 解析 → DOM 树
   ↓（遇到 CSS）
3. CSS 下载
   ↓
4. CSS 解析 → CSSOM 树
   ↓
5. DOM + CSSOM → 渲染树
   ↓
6. 布局计算（Layout）
   ↓
7. 绘制（Paint）
   ↓
8. 合成（Composite）
```

**关键资源**：阻塞渲染的资源
- HTML（必需）
- CSS（阻塞渲染）
- 同步 JavaScript（阻塞解析）

**优化目标**：减少关键资源的数量、大小、往返次数

**后端类比**：类似于优化数据库查询的关键路径（减少 JOIN、索引优化）

### 测量关键渲染路径

```javascript
window.addEventListener('load', () => {
  const perfData = performance.timing;
  
  const CRP = {
    // DNS 查询
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    
    // TCP 连接
    tcp: perfData.connectEnd - perfData.connectStart,
    
    // 请求响应时间（TTFB）
    ttfb: perfData.responseStart - perfData.requestStart,
    
    // HTML 下载
    htmlDownload: perfData.responseEnd - perfData.responseStart,
    
    // DOM 构建
    domParsing: perfData.domInteractive - perfData.domLoading,
    
    // 首次渲染（FCP）
    fcp: perfData.domContentLoadedEventStart - perfData.navigationStart,
    
    // 完全加载
    load: perfData.loadEventEnd - perfData.navigationStart
  };
  
  console.table(CRP);
});
```

## 资源加载的优先级规则

### 浏览器的默认优先级

**Highest（最高）**：
```html
<link rel="stylesheet" href="critical.css">
<!-- CSS 在 head 中 -->

<script src="app.js"></script>
<!-- 同步脚本 -->
```

**High（高）**：
```html
<link rel="preload" href="font.woff2" as="font">
<!-- 预加载资源 -->

<img src="hero.jpg" alt="首屏图片">
<!-- viewport 内的图片 -->
```

**Medium（中）**：
```html
<script src="app.js" defer></script>
<!-- defer 脚本 -->

<link rel="stylesheet" href="print.css" media="print">
<!-- 非关键 CSS -->
```

**Low（低）**：
```html
<img src="footer-img.jpg" alt="页脚图片" loading="lazy">
<!-- viewport 外的图片 -->

<script src="analytics.js" async></script>
<!-- async 脚本 -->
```

**Lowest（最低）**：
```html
<link rel="prefetch" href="next-page.html">
<!-- 预取下一页资源 -->
```

### 手动调整优先级

#### 1. preload（提高优先级）

```html
<!-- 提前加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="hero.jpg" as="image">
<link rel="preload" href="app.js" as="script">
```

**使用场景**：
- 字体文件（避免 FOIT）
- 首屏图片
- 关键 JavaScript

**注意**：过度使用会降低整体性能

#### 2. prefetch（降低优先级）

```html
<!-- 预取未来可能需要的资源 -->
<link rel="prefetch" href="next-page.html">
<link rel="prefetch" href="next-page.css">
```

**使用场景**：
- 下一页的资源
- 用户可能访问的页面
- 空闲时加载

#### 3. dns-prefetch / preconnect

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://cdn.example.com">
```

**效果**：
```
dns-prefetch: 节省 DNS 查询时间（~20-120ms）
preconnect: 节省完整连接时间（~100-500ms）
```

**后端类比**：
- preload ≈ 数据预加载到内存
- prefetch ≈ 数据预取到缓存
- preconnect ≈ 数据库连接池预热

## preload、prefetch、dns-prefetch 的使用场景

### preload：立即需要的资源

```html
<head>
  <!-- 关键字体（避免文字闪烁） -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- 首屏图片 -->
  <link rel="preload" href="/images/hero.jpg" as="image">
  
  <!-- 关键 CSS -->
  <link rel="preload" href="/css/critical.css" as="style">
  
  <!-- 延迟加载的 CSS -->
  <link rel="preload" href="/css/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

**工作原理**：
1. 浏览器看到 `<link rel="preload">`
2. 立即以高优先级开始下载
3. 下载完成后缓存
4. 实际使用时从缓存读取

**常见问题**：

```html
<!-- ❌ 错误：preload 后未使用 -->
<link rel="preload" href="unused.js" as="script">
<!-- 浪费带宽，控制台警告 -->

<!-- ✅ 正确：preload 后使用 -->
<link rel="preload" href="app.js" as="script">
<script src="app.js" defer></script>
```

### prefetch：未来可能需要的资源

```html
<!-- 预取下一页的资源 -->
<link rel="prefetch" href="/page2.html">
<link rel="prefetch" href="/page2.css">
<link rel="prefetch" href="/page2.js">

<!-- 预取可能需要的图片 -->
<link rel="prefetch" href="/images/gallery/photo1.jpg">
```

**使用时机**：
- 用户可能点击的链接
- 多步骤流程的下一步
- 空闲时加载

**与 preload 的区别**：

| 特性 | preload | prefetch |
|------|---------|----------|
| 优先级 | 高 | 低 |
| 使用时机 | 当前页面 | 未来页面 |
| 缓存时长 | 短（仅当前页面） | 长（跨页面） |
| 典型场景 | 字体、关键资源 | 下一页资源 |

### dns-prefetch：优化跨域请求

```html
<head>
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://api.example.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
</head>
```

**效果**：
```
正常流程：
1. 遇到跨域 URL
2. DNS 查询（20-120ms）
3. 建立连接
4. 请求资源

使用 dns-prefetch：
1. 预先 DNS 查询（后台进行）
2. 遇到跨域 URL
3. 使用已解析的 IP
4. 建立连接
5. 请求资源
```

### preconnect：完整的连接预热

```html
<!-- 预连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
```

**与 dns-prefetch 的对比**：

```
dns-prefetch:
  只做 DNS 解析
  开销小
  适合大量域名

preconnect:
  DNS + TCP + TLS 握手
  开销大
  适合少量关键域名（2-3个）
```

**后端类比**：
- dns-prefetch ≈ 域名解析缓存
- preconnect ≈ HTTP Keep-Alive 连接复用

## 后端类比：数据库连接池、缓存预热

### 资源加载 ≈ 数据库连接池

```javascript
// 前端资源加载策略
<link rel="preconnect" href="https://api.example.com">
// 预先建立连接

// 后端连接池
const pool = mysql.createPool({
  host: 'localhost',
  connectionLimit: 10,  // 预先创建连接
  waitForConnections: true
});
```

**相似点**：
- 都是预先准备，减少延迟
- 都需要权衡资源消耗

### preload ≈ 缓存预热

```javascript
// 前端：preload 关键资源
<link rel="preload" href="app.js" as="script">

// 后端：预热缓存
async function warmUpCache() {
  const popularData = await db.query('SELECT * FROM popular_items');
  await cache.set('popular', popularData);
}
```

### prefetch ≈ 预测性数据加载

```javascript
// 前端：预取下一页
<link rel="prefetch" href="/page2.html">

// 后端：预测性查询
app.get('/page1', async (req, res) => {
  const page1Data = await getPage1Data();
  
  // 后台预加载下一页数据
  getPage2Data().then(data => cache.set('page2', data));
  
  res.json(page1Data);
});
```

## 工程实践示例

### 场景 1：优化字体加载（避免 FOIT）

```html
<head>
  <meta charset="UTF-8">
  <title>字体优化</title>
  
  <!-- 1. preconnect 到字体 CDN -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- 2. preload 关键字体 -->
  <link 
    rel="preload" 
    href="/fonts/main.woff2" 
    as="font" 
    type="font/woff2" 
    crossorigin
  >
  
  <!-- 3. 使用 font-display: swap 避免阻塞 -->
  <style>
    @font-face {
      font-family: 'CustomFont';
      src: url('/fonts/main.woff2') format('woff2');
      font-display: swap;  /* 先显示系统字体，字体加载后切换 */
    }
  </style>
</head>
```

**效果对比**：

```
未优化：
0-100ms: 白屏（等待字体）
100ms+: 显示文字

优化后：
0ms: 显示系统字体
100ms: 切换为自定义字体
```

### 场景 2：多步骤表单的资源预取

```html
<!-- 第 1 步 -->
<form id="step1">
  <input name="username">
  <button type="submit">下一步</button>
</form>

<!-- 预取第 2 步的资源 -->
<link rel="prefetch" href="/step2.html">
<link rel="prefetch" href="/step2.css">
<link rel="prefetch" href="/step2.js">

<script>
document.getElementById('step1').addEventListener('submit', (e) => {
  e.preventDefault();
  // 第 2 步的资源已经缓存，加载很快
  location.href = '/step2.html';
});
</script>
```

### 场景 3：API 预连接

```html
<head>
  <!-- 预连接到 API 服务器 -->
  <link rel="preconnect" href="https://api.example.com">
  
  <!-- 预连接到 CDN -->
  <link rel="preconnect" href="https://cdn.example.com">
</head>

<script>
// 首次 API 请求时，连接已建立
fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log(data));
</script>
```

### 场景 4：后端动态生成资源提示

```javascript
// Express 中间件
app.use((req, res, next) => {
  // 根据用户行为预测下一页
  const nextPage = predictNextPage(req.session);
  
  // 设置 Link Header（HTTP/2 Server Push）
  res.set('Link', [
    `<${nextPage}>; rel=prefetch`,
    `<https://cdn.example.com>; rel=preconnect`,
    `</fonts/main.woff2>; rel=preload; as=font; crossorigin`
  ].join(', '));
  
  next();
});

function predictNextPage(session) {
  // 基于用户历史预测
  if (session.lastVisited === '/products') {
    return '/product-details';
  }
  return '/';
}
```

## 常见误区

### 误区 1：preload 所有资源

**错误做法**：

```html
<link rel="preload" href="a.js" as="script">
<link rel="preload" href="b.js" as="script">
<link rel="preload" href="c.js" as="script">
<link rel="preload" href="d.js" as="script">
<!-- 过度使用，反而降低性能 -->
```

**正确做法**：

```html
<!-- 只 preload 关键资源 -->
<link rel="preload" href="critical.js" as="script">
```

**原则**：preload 2-3 个最关键的资源

### 误区 2：混淆 preload 和 prefetch

**错误理解**：preload 和 prefetch 可以互换

**正确认知**：
- preload：**当前页面**立即需要
- prefetch：**未来页面**可能需要

### 误区 3：忽略 crossorigin

**错误做法**：

```html
<!-- 字体 preload 缺少 crossorigin -->
<link rel="preload" href="font.woff2" as="font">
<!-- 会重复下载！ -->

<style>
@font-face {
  src: url('font.woff2');  /* 再次下载 */
}
</style>
```

**正确做法**：

```html
<link rel="preload" href="font.woff2" as="font" crossorigin>
<!-- crossorigin 确保缓存匹配 -->
```

## 深入一点：HTTP/2 Server Push

### 服务端推送资源

```javascript
// Node.js + HTTP/2
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
});

server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/index.html') {
    // 推送关键资源
    stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
      pushStream.respondWithFile('style.css');
    });
    
    stream.pushStream({ ':path': '/app.js' }, (err, pushStream) => {
      pushStream.respondWithFile('app.js');
    });
    
    // 返回 HTML
    stream.respondWithFile('index.html');
  }
});

server.listen(443);
```

**效果**：
```
HTTP/1.1:
  客户端请求 HTML
  解析 HTML
  请求 CSS
  请求 JS

HTTP/2 Server Push:
  客户端请求 HTML
  服务器同时推送 HTML、CSS、JS
  （减少往返次数）
```

**后端类比**：类似于批量查询优化，一次返回多个相关数据。

## 参考资源

- [Web.dev - Prioritize Resources](https://web.dev/prioritize-resources/)
- [MDN - Link Types: preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload)
- [Chrome - Resource Priorities](https://developers.google.com/web/fundamentals/performance/resource-prioritization)
