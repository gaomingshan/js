# HTML 文档的顶层结构

## 核心概念

HTML 文档的顶层结构是**强制性约定**，类似于协议报文的固定格式。一个标准的 HTML 文档必须包含以下四个顶层元素：

```html
<!DOCTYPE html>          <!-- 文档类型声明 -->
<html lang="zh-CN">      <!-- 根元素 -->
  <head>                 <!-- 元数据容器 -->
    <meta charset="UTF-8">
    <title>页面标题</title>
  </head>
  <body>                 <!-- 内容容器 -->
    <!-- 可见内容 -->
  </body>
</html>
```

**后端类比**：
- DOCTYPE ≈ 协议版本声明（HTTP/1.1）
- html ≈ 数据包的根节点
- head ≈ HTTP Headers
- body ≈ HTTP Body

## DOCTYPE、html、head、body 的职责划分

### 1. DOCTYPE：文档类型声明

#### 作用

告诉浏览器使用哪种 HTML 规范解析文档：

```html
<!-- HTML5（推荐） -->
<!DOCTYPE html>

<!-- XHTML 1.0 Strict（过时） -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<!-- HTML 4.01 Transitional（过时） -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
  "http://www.w3.org/TR/html4/loose.dtd">
```

#### 为什么需要 DOCTYPE

**历史原因**：早期浏览器有两种渲染模式：
- **标准模式**（Standards Mode）：严格按 W3C 标准渲染
- **怪异模式**（Quirks Mode）：兼容旧网页的不规范写法

```javascript
// 检查当前文档模式
console.log(document.compatMode);
// "CSS1Compat" → 标准模式
// "BackCompat" → 怪异模式
```

**缺少 DOCTYPE 的后果**：

```html
<!-- 无 DOCTYPE，进入怪异模式 -->
<html>
<head>
  <style>
    .box { width: 100px; padding: 10px; border: 1px solid #000; }
  </style>
</head>
<body>
  <div class="box">内容</div>
  <!-- 怪异模式下，width 包含 padding 和 border -->
  <!-- 实际宽度：100px（而非 122px） -->
</body>
</html>
```

**后端类比**：类似于 HTTP 版本声明影响协议行为。

### 2. html：根元素

#### 职责

作为文档的**唯一根节点**，包含所有其他元素：

```html
<html lang="zh-CN" dir="ltr">
  <!-- lang：文档语言 -->
  <!-- dir：文本方向（ltr=从左到右，rtl=从右到左） -->
</html>
```

#### 关键属性

**`lang` 属性**：

```html
<html lang="zh-CN">  <!-- 简体中文 -->
<html lang="en-US">  <!-- 美式英语 -->
<html lang="ja">     <!-- 日语 -->
```

**作用**：
1. 辅助搜索引擎识别页面语言
2. 帮助屏幕阅读器选择发音规则
3. 影响浏览器的默认字体选择

**后端类比**：类似于 HTTP 的 `Content-Language` 头。

#### 为什么只能有一个根元素

**XML/HTML 的树形结构约束**：

```
正确（单根）：
Document
└── html
    ├── head
    └── body

错误（多根）：
Document
├── html
└── div  ← 不允许
```

**后端类比**：类似于 JSON 只能有一个顶层对象或数组。

### 3. head：元数据容器

#### 职责

存放**不可见的元数据**，影响文档解析、渲染、SEO：

```html
<head>
  <!-- 字符编码（必需，且应放在最前） -->
  <meta charset="UTF-8">
  
  <!-- 页面标题（必需） -->
  <title>页面标题</title>
  
  <!-- 视口设置（移动端必需） -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO 相关 -->
  <meta name="description" content="页面描述">
  <meta name="keywords" content="关键词1,关键词2">
  
  <!-- 外部资源 -->
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="favicon.ico">
  
  <!-- 预加载资源 -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- JavaScript -->
  <script src="app.js" defer></script>
</head>
```

#### 必需元素

```html
<head>
  <!-- 1. 字符编码声明（必需） -->
  <meta charset="UTF-8">
  <!-- 必须在前 1024 字节内，避免编码错误 -->
  
  <!-- 2. 页面标题（必需） -->
  <title>网站名称 - 页面标题</title>
  <!-- 用于：浏览器标签页、搜索结果、收藏夹 -->
</head>
```

**后端类比**：
- `<meta charset>` ≈ HTTP `Content-Type: text/html; charset=UTF-8`
- `<title>` ≈ 响应的摘要信息

#### 常用元数据标签

**基础元数据**：

```html
<!-- 页面描述（搜索引擎摘要） -->
<meta name="description" content="不超过 160 字的页面描述">

<!-- 关键词（已不影响 SEO，但仍可用） -->
<meta name="keywords" content="关键词1,关键词2,关键词3">

<!-- 作者 -->
<meta name="author" content="作者名">

<!-- 版权 -->
<meta name="copyright" content="© 2024 公司名">
```

**移动端适配**：

```html
<!-- 视口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- 
  width=device-width: 视口宽度等于设备宽度
  initial-scale=1.0: 初始缩放比例 1:1
-->

<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">

<!-- Android Chrome -->
<meta name="mobile-web-app-capable" content="yes">
```

**社交媒体分享**：

```html
<!-- Open Graph（Facebook、LinkedIn） -->
<meta property="og:title" content="页面标题">
<meta property="og:description" content="页面描述">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="article">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="页面标题">
<meta name="twitter:description" content="页面描述">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

**后端类比**：类似于 API 响应的元数据字段。

### 4. body：内容容器

#### 职责

包含所有**可见的页面内容**：

```html
<body>
  <header>页头</header>
  <nav>导航</nav>
  <main>主要内容</main>
  <aside>侧边栏</aside>
  <footer>页脚</footer>
</body>
```

#### 全局属性

```html
<body
  class="dark-mode"
  id="page"
  data-page-type="article"
  onload="init()"
>
```

**后端类比**：body ≈ HTTP 响应体，包含实际数据。

## 为什么需要 head：元数据与资源声明

### 1. 分离关注点

**内容 vs 元数据**：

```html
<!-- head：关于文档的信息 -->
<head>
  <meta name="description" content="这是一篇文章">
  <link rel="stylesheet" href="style.css">
</head>

<!-- body：文档的实际内容 -->
<body>
  <h1>文章标题</h1>
  <p>文章内容...</p>
</body>
```

**后端类比**：
- HTTP Headers（元数据）vs Body（数据）
- 数据库表结构（Schema）vs 数据（Data）

### 2. 优化加载顺序

**关键资源提前声明**：

```html
<head>
  <!-- 优先加载关键 CSS -->
  <link rel="stylesheet" href="critical.css">
  
  <!-- 预加载字体 -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- 预连接到 API 服务器 -->
  <link rel="preconnect" href="https://api.example.com">
  
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://cdn.example.com">
</head>
```

**后端类比**：类似于数据库连接池的预热（Warm-up）。

### 3. SEO 与可访问性

**搜索引擎爬虫依赖 head 信息**：

```html
<head>
  <!-- 标题：搜索结果中的链接文本 -->
  <title>如何学习 HTML - 前端教程</title>
  
  <!-- 描述：搜索结果中的摘要 -->
  <meta name="description" content="系统化学习 HTML 的教程...">
  
  <!-- 规范链接（避免重复内容） -->
  <link rel="canonical" href="https://example.com/html-tutorial">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "如何学习 HTML",
    "author": "作者名"
  }
  </script>
</head>
```

## 文档结构的约束规则与验证机制

### HTML 结构约束

#### 1. 嵌套规则

```html
<!-- 正确 -->
<html>
  <head>...</head>
  <body>...</body>
</html>

<!-- 错误：head 和 body 顺序颠倒 -->
<html>
  <body>...</body>
  <head>...</head>  ← 浏览器会自动修复
</html>

<!-- 错误：head 和 body 是兄弟，不能嵌套 -->
<html>
  <head>
    <body>...</body>  ← 非法
  </head>
</html>
```

#### 2. 元素唯一性

```html
<!-- 正确：每个文档只有一个 head 和 body -->
<html>
  <head>...</head>
  <body>...</body>
</html>

<!-- 错误：多个 head -->
<html>
  <head>...</head>
  <head>...</head>  ← 第二个会被忽略
  <body>...</body>
</html>
```

#### 3. 内容模型约束

```html
<!-- head 只能包含元数据标签 -->
<head>
  <title>标题</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="style.css">
  <script src="app.js"></script>
  
  <!-- 错误：不能包含可见内容 -->
  <h1>标题</h1>  ← 会被移到 body
</head>

<!-- body 只能包含内容标签 -->
<body>
  <h1>标题</h1>
  <p>段落</p>
  
  <!-- 错误：不能包含 meta 标签 -->
  <meta name="description" content="...">  ← 无效
</body>
```

### 验证工具

#### 1. W3C HTML Validator

```bash
# 在线验证
https://validator.w3.org/

# 本地验证
npm install -g html-validator-cli
html-validator --file=index.html
```

#### 2. 浏览器开发者工具

```javascript
// Chrome DevTools Console
// 检查文档模式
console.log(document.compatMode);

// 检查 DOCTYPE
console.log(document.doctype);

// 检查根元素
console.log(document.documentElement);
```

#### 3. ESLint 插件

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['html'],
  rules: {
    'html/require-doctype': 'error',
    'html/require-lang': 'error',
    'html/no-duplicate-attrs': 'error'
  }
};
```

## 常见误区

### 误区 1：DOCTYPE 是 HTML 标签

**错误理解**：DOCTYPE 是一个 HTML 元素。

**正确认知**：DOCTYPE 是**文档类型声明**（Document Type Declaration），不是标签。

```html
<!-- 不是标签，不需要闭合 -->
<!DOCTYPE html>

<!-- 不能这样写 -->
<DOCTYPE html></DOCTYPE>  ← 错误
```

### 误区 2：head 可以省略

**错误理解**：head 不是必需的。

**正确认知**：虽然浏览器会自动补全，但**不应省略**。

```html
<!-- 错误（会自动修复） -->
<html>
<body>
  <h1>标题</h1>
</body>
</html>

<!-- 浏览器解析后 -->
<html>
  <head></head>  ← 自动添加
  <body>
    <h1>标题</h1>
  </body>
</html>
```

### 误区 3：meta 标签可以放在 body 中

**错误理解**：meta 标签可以放在任何位置。

**正确认知**：大部分 meta 标签**只能放在 head 中**。

```html
<!-- 错误 -->
<body>
  <meta charset="UTF-8">  ← 无效
  <h1>标题</h1>
</body>

<!-- 正确 -->
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>标题</h1>
</body>
```

**例外**：`<meta itemprop>` 可以用在 body 中（微数据）。

## 工程实践示例

### 场景 1：标准的 HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 1. 字符编码（必需，放在最前） -->
  <meta charset="UTF-8">
  
  <!-- 2. 视口设置（移动端必需） -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 3. IE 兼容性 -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
  <!-- 4. 页面标题（必需） -->
  <title>页面标题 - 网站名称</title>
  
  <!-- 5. SEO 元数据 -->
  <meta name="description" content="页面描述，不超过 160 字">
  <meta name="keywords" content="关键词1,关键词2,关键词3">
  
  <!-- 6. 社交媒体 -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/image.jpg">
  
  <!-- 7. Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  
  <!-- 8. 样式表 -->
  <link rel="stylesheet" href="/css/style.css">
  
  <!-- 9. 预加载资源 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  
  <!-- 10. JavaScript -->
  <script src="/js/app.js" defer></script>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

### 场景 2：服务端渲染（SSR）生成 HTML

```javascript
// Node.js + Express
app.get('/article/:id', async (req, res) => {
  const article = await getArticle(req.params.id);
  
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <!-- 动态生成 title -->
      <title>${article.title} - 我的博客</title>
      
      <!-- 动态生成 description -->
      <meta name="description" content="${article.excerpt}">
      
      <!-- 动态生成 Open Graph -->
      <meta property="og:title" content="${article.title}">
      <meta property="og:description" content="${article.excerpt}">
      <meta property="og:image" content="${article.cover}">
      <meta property="og:url" content="https://blog.com/article/${article.id}">
      
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <article>
        <h1>${article.title}</h1>
        <div>${article.content}</div>
      </article>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(html);
});
```

**后端视角**：类似于数据库查询结果映射到响应格式。

### 场景 3：单页应用（SPA）的 HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/static/js/main.chunk.js" as="script">
  <link rel="preload" href="/static/css/main.chunk.css" as="style">
  
  <link rel="stylesheet" href="/static/css/main.chunk.css">
</head>
<body>
  <!-- SPA 挂载点 -->
  <div id="root"></div>
  
  <!-- 初始状态注入 -->
  <script>
    window.__INITIAL_STATE__ = {
      user: null,
      theme: 'light'
    };
  </script>
  
  <!-- React 运行时 -->
  <script src="/static/js/runtime.js"></script>
  <script src="/static/js/vendor.chunk.js"></script>
  <script src="/static/js/main.chunk.js"></script>
  
  <!-- 无 JS 时的提示 -->
  <noscript>请启用 JavaScript 以使用本应用。</noscript>
</body>
</html>
```

## 深入一点：浏览器如何处理不规范的 HTML

### 自动修复机制

浏览器有强大的**容错能力**，会自动修复常见错误：

```html
<!-- 输入：缺少 DOCTYPE 和闭合标签 -->
<html>
<head>
<title>页面
<body>
<h1>标题
<p>段落

<!-- 浏览器解析后 -->
<html>
  <head>
    <title>页面</title>
  </head>
  <body>
    <h1>标题</h1>
    <p>段落</p>
  </body>
</html>
```

### 修复规则示例

**1. 自动添加缺失的标签**：

```html
<!-- 输入 -->
<!DOCTYPE html>
<html>
<body>
  <h1>标题</h1>
</body>
</html>

<!-- 浏览器添加 head -->
<!DOCTYPE html>
<html>
  <head></head>  ← 自动添加
  <body>
    <h1>标题</h1>
  </body>
</html>
```

**2. 修正错误的嵌套**：

```html
<!-- 输入：p 标签中嵌套 div -->
<p>
  段落
  <div>块级元素</div>
</p>

<!-- 浏览器修正 -->
<p>段落</p>  ← 自动闭合
<div>块级元素</div>
<p></p>  ← 自动添加空 p
```

**后端类比**：类似于数据库的自动类型转换（如字符串 "123" 转为数字 123）。

## 参考资源

- [HTML Living Standard - The html element](https://html.spec.whatwg.org/multipage/semantics.html#the-html-element)
- [MDN - HTML Document Structure](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started)
- [W3C HTML Validator](https://validator.w3.org/)
