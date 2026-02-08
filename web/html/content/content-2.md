# HTML 文档的生命周期

## 核心概念

HTML 文档从服务器发送到用户看到页面，经历了一个完整的**处理管线**（Pipeline）。这个过程类似于后端的请求处理流程，包含多个阶段：

```
网络传输 → 字节流接收 → 字符编码 → 词法分析 
→ 语法分析 → DOM 构建 → 样式计算 → 布局 → 绘制 → 合成
```

理解这个生命周期是掌握 HTML 性能优化、SSR、首屏加载的基础。

## 从网络传输到 DOM 树的完整链路

### 阶段 1：HTTP 请求与响应

```
浏览器 → 服务器
GET /index.html HTTP/1.1
Host: example.com
Accept: text/html

服务器 → 浏览器
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 2048

<!DOCTYPE html><html>...
```

**后端类比**：类似于数据库查询的网络往返（RTT）。

### 阶段 2：字节流接收

浏览器接收到的是**字节流**（Byte Stream），而非完整的字符串：

```
原始字节流（16进制）：
3C 21 44 4F 43 54 59 50 45 20 68 74 6D 6C 3E ...

↓ 根据 Content-Type 中的 charset 解码

字符流：
<!DOCTYPE html><html>...
```

**关键点**：
- 字节流可以**分块接收**（HTTP Chunked Transfer）
- 浏览器可以在接收过程中**边下载边解析**

**后端类比**：类似于流式读取文件（Stream）而非一次性加载。

### 阶段 3：词法分析（Tokenization）

HTML 解析器将字符流转换为 Token：

```html
输入：<html><head><title>标题</title></head></html>

Token 序列：
[StartTag: html]
[StartTag: head]
[StartTag: title]
[Character: 标题]
[EndTag: title]
[EndTag: head]
[EndTag: html]
```

**后端类比**：类似于编译器的词法分析阶段（Lexer）。

### 阶段 4：语法分析与 DOM 构建

解析器根据 Token 构建 DOM 树：

```
Token: [StartTag: html]
→ 创建 HTMLHtmlElement 节点
→ 将其设为 document 的子节点

Token: [StartTag: head]
→ 创建 HTMLHeadElement 节点
→ 将其设为 html 的子节点

Token: [Character: 标题]
→ 创建 Text 节点
→ 将其设为 title 的子节点
```

**DOM 树结构**：

```
Document
└── html (HTMLHtmlElement)
    ├── head (HTMLHeadElement)
    │   └── title (HTMLTitleElement)
    │       └── "标题" (Text)
    └── body (HTMLBodyElement)
```

**后端类比**：
- DOM 树 ≈ 语法树（AST）
- DOM 节点 ≈ 对象实例

### 阶段 5：资源加载

解析过程中遇到外部资源时，触发子资源加载：

```html
<link rel="stylesheet" href="style.css">
<!-- 触发 CSS 文件请求 -->

<script src="app.js"></script>
<!-- 触发 JS 文件请求，可能阻塞解析 -->

<img src="logo.png">
<!-- 触发图片请求，不阻塞解析 -->
```

**加载策略**：
- CSS：阻塞渲染，不阻塞解析
- 同步 JS：阻塞解析和渲染
- 异步 JS（async/defer）：不阻塞解析
- 图片/视频：异步加载，不阻塞

**后端类比**：类似于数据库查询中的：
- 同步查询（阻塞）
- 异步查询（非阻塞）
- 预加载（Query Cache）

## HTML 解析与执行的分阶段模型

### 模型概览

```
┌─────────────────────────────────────┐
│  1. HTML 解析（Parsing）            │
│     - 字节流 → DOM 树               │
│     - 可以边下载边解析              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. 样式计算（Style Calculation）   │
│     - CSS 解析 → CSSOM 树           │
│     - 计算每个节点的样式            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. 布局（Layout）                  │
│     - 计算元素的几何位置            │
│     - 构建布局树（Layout Tree）     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  4. 绘制（Paint）                   │
│     - 生成绘制指令                  │
│     - 绘制列表（Paint Records）     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  5. 合成（Composite）               │
│     - 图层合成                      │
│     - 生成最终像素                  │
└─────────────────────────────────────┘
```

### 关键时间节点

```javascript
// DOM 解析完成
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 树构建完成');
  // 此时 HTML 已解析，但图片、样式表可能未加载完成
});

// 所有资源加载完成
window.addEventListener('load', () => {
  console.log('页面完全加载');
  // 此时图片、CSS、JS 等所有资源都已加载
});
```

**后端类比**：
- `DOMContentLoaded` ≈ 数据库连接建立
- `load` ≈ 所有预加载数据完成

### 渐进式渲染

HTML 的解析和渲染是**渐进式**的，不需要等待全部下载完成：

```html
<!DOCTYPE html>
<html>
<head>
  <title>页面</title>
</head>
<body>
  <h1>标题</h1>
  <!-- 此时用户已经可以看到标题 -->
  
  <p>第一段...</p>
  <!-- 用户看到第一段 -->
  
  <!-- 1MB 的内容... -->
  
  <p>最后一段</p>
  <!-- 最后才显示 -->
</body>
</html>
```

**优势**：
- 用户感知速度快（渐进式呈现）
- 减少"白屏时间"

**后端类比**：类似于流式响应（HTTP Streaming）。

## 对比后端：请求处理管线 vs HTML 渲染管线

### 后端请求处理管线

```
HTTP 请求 
→ 路由匹配 
→ 中间件处理 
→ 业务逻辑 
→ 数据查询 
→ 响应序列化 
→ HTTP 响应
```

### 前端 HTML 渲染管线

```
HTTP 响应（HTML）
→ 字节流解码 
→ HTML 解析 
→ DOM 构建 
→ 样式计算 
→ 布局计算 
→ 绘制 
→ 用户看到页面
```

### 相似性

| 后端阶段 | 前端阶段 | 共同特点 |
|---------|---------|---------|
| 路由匹配 | HTML 解析 | 识别结构 |
| 中间件 | 资源加载 | 预处理 |
| 业务逻辑 | JavaScript 执行 | 核心处理 |
| 数据查询 | AJAX 请求 | 数据获取 |
| 响应序列化 | 渲染 | 输出格式化 |

### 差异性

**后端**：
- 单次请求 → 单次响应（无状态）
- 处理完成即结束

**前端**：
- 单次响应 → 持续交互（有状态）
- 渲染完成后仍可修改（DOM 操作）

## 设计动机：为什么要分阶段处理

### 1. 性能优化

分阶段处理允许**并行化**：

```
时间轴：
0s    下载 HTML ━━━━━━━━━━━━━━━━━━━━━━→ 2s
0.5s    ↓ 开始解析
0.5s    解析 HTML ━━━━━━━━━━━━━━━━━→ 2s
1s      ↓ 发现 <link> 标签
1s      下载 CSS ━━━━━━━━━━━━━━━→ 1.8s
1.2s    ↓ 发现 <script> 标签
1.2s    下载 JS ━━━━━━━━━━━━━━→ 2.2s
2s      DOM 构建完成
2.2s    执行 JS
2.5s    首次渲染
```

如果不分阶段，需要等待所有资源下载完才能开始处理。

### 2. 渐进式增强

用户可以在页面未完全加载时就开始交互：

```html
<body>
  <header>...</header>
  <!-- 用户可以看到 header 并点击导航 -->
  
  <!-- 下面的内容还在加载... -->
  <main>...</main>
</body>
```

### 3. 错误恢复

分阶段处理允许**容错**：

```html
<body>
  <h1>标题</h1>
  <p>内容
  <!-- 缺少闭合标签，但前面的内容仍可显示 -->
```

**后端类比**：类似于数据库事务的部分提交（虽然不推荐）。

## 常见误区

### 误区 1：HTML 必须一次性加载完才能显示

**错误理解**：浏览器会等待整个 HTML 下载完成再渲染。

**正确认知**：浏览器是**流式处理**，边下载边解析边渲染。

```html
<!-- 3KB HTML -->
<body>
  <h1>标题</h1> <!-- 用户很快看到 -->
  
  <!-- 1MB 内容... -->
  
  <footer>页脚</footer> <!-- 最后才看到 -->
</body>
```

### 误区 2：JavaScript 执行不影响 HTML 解析

**错误理解**：JS 和 HTML 解析是并行的。

**正确认知**：同步 `<script>` 会**阻塞 HTML 解析**。

```html
<body>
  <h1>标题</h1>
  
  <script src="huge.js"></script>
  <!-- 解析暂停，等待 huge.js 下载并执行 -->
  
  <p>段落</p>
  <!-- huge.js 执行完才能看到这段 -->
</body>
```

**解决方案**：

```html
<!-- 异步加载，不阻塞解析 -->
<script src="app.js" async></script>

<!-- 延迟执行，不阻塞解析 -->
<script src="app.js" defer></script>
```

### 误区 3：DOM 构建完成即可交互

**错误理解**：`DOMContentLoaded` 触发后页面就完全可用。

**正确认知**：此时 CSS 可能未加载完，页面可能"闪烁"（FOUC）。

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // 此时 DOM 已就绪，但样式可能未加载
  console.log(document.body.clientHeight); // 可能是错误的值
});

window.addEventListener('load', () => {
  // 此时样式、图片等都已加载
  console.log(document.body.clientHeight); // 正确的值
});
```

## 工程实践示例

### 场景 1：优化首屏加载（关键渲染路径）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>优化示例</title>
  
  <!-- 关键 CSS 内联，避免阻塞 -->
  <style>
    body { margin: 0; }
    .header { background: #333; color: #fff; }
  </style>
  
  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>
<body>
  <header class="header">
    <h1>网站标题</h1>
  </header>
  
  <main>内容...</main>
  
  <!-- JS 放在底部或使用 defer -->
  <script src="app.js" defer></script>
</body>
</html>
```

**后端类比**：类似于数据库查询优化：
- 内联 CSS ≈ 使用索引（快速查询）
- 异步 CSS ≈ 延迟加载非关键数据
- defer JS ≈ 异步任务队列

### 场景 2：流式 HTML 响应（SSR）

```javascript
// Node.js Express
app.get('/article/:id', async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  
  // 立即发送 HTML 头部
  res.write(`
    <!DOCTYPE html>
    <html>
    <head><title>文章</title></head>
    <body>
      <header>网站头部</header>
  `);
  
  // 异步查询数据
  const article = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  
  // 发送文章内容
  res.write(`
      <main>
        <h1>${article.title}</h1>
        <p>${article.content}</p>
      </main>
  `);
  
  // 发送页脚并结束
  res.write(`
      <footer>页脚</footer>
    </body>
    </html>
  `);
  
  res.end();
});
```

**优势**：
- 用户快速看到头部（减少感知延迟）
- 数据库查询时间不阻塞头部渲染

**后端类比**：类似于分页查询，先返回第一页数据。

### 场景 3：监控页面加载性能

```javascript
// 使用 Performance API
window.addEventListener('load', () => {
  const perfData = performance.timing;
  
  const metrics = {
    // DNS 查询时间
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    
    // TCP 连接时间
    tcp: perfData.connectEnd - perfData.connectStart,
    
    // 请求响应时间
    request: perfData.responseEnd - perfData.requestStart,
    
    // DOM 解析时间
    domParsing: perfData.domInteractive - perfData.domLoading,
    
    // DOM 构建完成
    domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    
    // 页面完全加载
    load: perfData.loadEventEnd - perfData.navigationStart
  };
  
  console.table(metrics);
  
  // 上报到监控系统
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metrics)
  });
});
```

**后端类比**：类似于 APM（Application Performance Monitoring）。

## 深入一点：浏览器的多进程架构

### Chrome 的进程模型

```
浏览器主进程（Browser Process）
├── 网络进程（Network Process）
│   └── 处理 HTTP 请求/响应
├── 渲染进程（Renderer Process，每个标签页一个）
│   ├── 主线程：解析 HTML、执行 JS、布局、绘制
│   ├── 合成线程：图层合成
│   └── 光栅化线程池：生成位图
└── GPU 进程
    └── 硬件加速渲染
```

### HTML 解析在哪个进程

**渲染进程的主线程**负责：
1. HTML 解析
2. JavaScript 执行
3. 样式计算
4. 布局计算

**为什么在同一个线程**：
- JavaScript 可以修改 DOM，必须与 HTML 解析同步
- 避免竞态条件（Race Condition）

**后端类比**：类似于单线程的事件循环（Node.js Event Loop）。

### 解析阻塞的本质

```html
<body>
  <h1>标题</h1>
  
  <script>
    // 同步执行，阻塞解析
    for (let i = 0; i < 1000000000; i++) {}
  </script>
  
  <p>段落</p> <!-- 必须等待上面的循环完成 -->
</body>
```

**原因**：JavaScript 可能修改 DOM，解析器必须等待执行完成才能继续。

## 参考资源

- [HTML Living Standard - Parsing](https://html.spec.whatwg.org/multipage/parsing.html)
- [Chrome - How Blink Works](https://docs.google.com/document/d/1aitSOucL0VHZa9Z2vbRJSyAIsAz24kX8LFByQ5xQnUg)
- [MDN - Critical Rendering Path](https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path)
- [Web.dev - Render-tree Construction](https://web.dev/critical-rendering-path-render-tree-construction/)
