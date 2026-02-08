# Link 标签与样式表加载

## 核心概念

`<link>` 标签用于引入外部资源，最常见的是 CSS 样式表。样式表的加载方式直接影响页面渲染性能和用户体验。

```html
<!-- 样式表加载 -->
<link rel="stylesheet" href="style.css">

<!-- 预加载资源 -->
<link rel="preload" href="font.woff2" as="font">

<!-- 页面图标 -->
<link rel="icon" href="favicon.ico">
```

**后端类比**：
- `<link>` ≈ 依赖声明（import、require）
- 样式表加载 ≈ 库文件加载

## CSS 为什么阻塞渲染

### 渲染阻塞的原因

```html
<head>
  <link rel="stylesheet" href="style.css">
  <!-- CSS 下载时，页面不渲染 -->
</head>
<body>
  <h1>标题</h1>
  <!-- 用户看不到内容，等待 CSS -->
</body>
```

**执行流程**：
```
1. 解析 HTML，构建 DOM 树
2. 遇到 <link>，开始下载 CSS（不阻塞 HTML 解析）
3. 继续解析 HTML，DOM 树构建完成
4. 等待 CSS 下载完成
5. 解析 CSS，构建 CSSOM 树
6. DOM + CSSOM → 渲染树
7. 渲染页面
```

**为什么必须等待 CSS**：

```html
<style>
h1 { display: none; }
</style>

<h1>标题</h1>
```

如果先渲染再加载 CSS，用户会看到标题闪现然后消失（FOUC - Flash of Unstyled Content）。

**后端类比**：类似于事务的原子性，确保数据状态一致。

### CSS 不阻塞 HTML 解析

```html
<head>
  <link rel="stylesheet" href="huge.css">
  <!-- CSS 下载时，HTML 继续解析 -->
</head>
<body>
  <h1>标题</h1>
  <p>段落</p>
  <!-- DOM 树已构建，只是不渲染 -->
</body>
```

**关键区别**：
- CSS：不阻塞解析，阻塞渲染
- 同步 JS：阻塞解析和渲染

## 样式表的加载与 CSSOM 构建

### CSSOM 树的构建

```css
/* style.css */
body {
  margin: 0;
  font-family: Arial;
}

h1 {
  color: blue;
  font-size: 24px;
}
```

**CSSOM 树结构**：
```
CSSStyleSheet
├── body
│   ├── margin: 0
│   └── font-family: Arial
└── h1
    ├── color: blue
    └── font-size: 24px
```

### DOM + CSSOM → 渲染树

```
DOM 树：
html
└── body
    └── h1
        └── "标题"

CSSOM 树：
body { margin: 0 }
h1 { color: blue; display: none }

渲染树（合并后）：
body (margin: 0)
└── h1 (不包含，因为 display: none)
```

**后端类比**：类似于数据模型 + 业务规则 → 最终输出。

## 关键 CSS 与首屏优化策略

### 策略 1：内联关键 CSS

```html
<head>
  <!-- 内联首屏 CSS -->
  <style>
    /* 只包含首屏可见元素的样式 */
    body { margin: 0; }
    .header { background: #333; color: white; }
    .hero { min-height: 500px; }
  </style>
  
  <!-- 异步加载完整 CSS -->
  <link rel="preload" href="full.css" as="style" onload="this.rel='stylesheet'">
</head>
```

**优势**：
- 首屏立即渲染
- 减少渲染阻塞时间

**提取关键 CSS 工具**：
```bash
# Critical CSS 提取
npm install -g critical

critical --base dist --inline index.html > index-critical.html
```

### 策略 2：media 属性优化

```html
<!-- 立即加载（阻塞渲染） -->
<link rel="stylesheet" href="screen.css">

<!-- 条件加载（不阻塞渲染） -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="large.css" media="(min-width: 1200px)">
```

**工作原理**：
```
浏览器下载所有 CSS（后台）
但只有匹配 media 的 CSS 阻塞渲染
```

### 策略 3：异步加载 CSS

```html
<!-- 方法 1：preload + onload -->
<link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="style.css"></noscript>

<!-- 方法 2：JavaScript 动态加载 -->
<script>
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'style.css';
document.head.appendChild(link);
</script>
```

### 策略 4：代码分割

```html
<!-- 核心样式 -->
<link rel="stylesheet" href="core.css">

<!-- 功能模块样式（按需加载） -->
<link rel="stylesheet" href="modal.css" disabled>

<script>
// 打开模态框时加载
function openModal() {
  const link = document.querySelector('link[href="modal.css"]');
  link.disabled = false;
}
</script>
```

## 工程实践示例

### 场景 1：优化首屏渲染

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>优化示例</title>
  
  <!-- 1. 内联关键 CSS -->
  <style>
    /* 首屏关键样式 */
    body {
      margin: 0;
      font-family: -apple-system, sans-serif;
    }
    .header {
      background: #333;
      color: white;
      padding: 20px;
    }
    .loading {
      text-align: center;
      padding: 50px;
    }
  </style>
  
  <!-- 2. 预连接到 CDN -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- 3. 预加载字体 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  
  <!-- 4. 异步加载完整 CSS -->
  <link rel="preload" href="/css/main.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
</head>
<body>
  <header class="header">网站头部</header>
  <main class="loading">加载中...</main>
  
  <script src="/js/app.js" defer></script>
</body>
</html>
```

### 场景 2：响应式 CSS 加载

```html
<head>
  <!-- 基础样式（所有设备） -->
  <link rel="stylesheet" href="base.css">
  
  <!-- 移动端样式 -->
  <link rel="stylesheet" href="mobile.css" media="(max-width: 767px)">
  
  <!-- 平板样式 -->
  <link rel="stylesheet" href="tablet.css" media="(min-width: 768px) and (max-width: 1023px)">
  
  <!-- 桌面样式 -->
  <link rel="stylesheet" href="desktop.css" media="(min-width: 1024px)">
</head>
```

### 场景 3：后端动态生成样式标签

```javascript
// Express
app.get('/page', (req, res) => {
  const userAgent = req.headers['user-agent'];
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  
  const cssLinks = isMobile
    ? '<link rel="stylesheet" href="/css/mobile.css">'
    : '<link rel="stylesheet" href="/css/desktop.css">';
  
  res.render('page', { cssLinks });
});
```

## 常见误区

### 误区 1：所有 CSS 都内联

**错误做法**：
```html
<style>
  /* 10000 行 CSS... */
</style>
```

**问题**：
- HTML 体积巨大
- 无法缓存
- 阻塞 HTML 解析

**正确做法**：只内联关键 CSS（2-5KB）

### 误区 2：CSS 放在 body 底部

**错误理解**：像 JS 一样，CSS 放底部不阻塞。

```html
<body>
  <h1>标题</h1>
  <link rel="stylesheet" href="style.css">
  <!-- 浏览器已经渲染了无样式的内容，然后重新渲染 -->
</body>
```

**问题**：FOUC（闪烁）

**正确做法**：CSS 放 head

### 误区 3：忽略 CSS 文件大小

**错误做法**：
```html
<link rel="stylesheet" href="huge-5mb.css">
<!-- 5MB CSS 严重影响性能 -->
```

**优化**：
- 压缩 CSS（Minify）
- 移除未使用的样式（PurgeCSS）
- 代码分割

## 参考资源

- [MDN - link Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link)
- [Web.dev - Critical Rendering Path](https://web.dev/critical-rendering-path/)
- [CSS-Tricks - Critical CSS](https://css-tricks.com/authoring-critical-fold-css/)
