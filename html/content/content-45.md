# Meta 标签与 SEO 实战

## 核心概念

`<meta>` 标签位于 `<head>` 中，为文档提供**元数据**——不直接展示给用户，但对浏览器、搜索引擎和社交平台至关重要。

**后端类比**：
- `<meta>` ≈ HTTP 响应头（描述内容属性，不是内容本身）
- `<title>` ≈ 日志摘要（一行文字概括全部内容）
- Open Graph ≈ API 的 Schema 文档（告诉消费方如何展示）
- JSON-LD ≈ 数据库的元数据表（结构化描述数据含义）

## 必备 Meta 标签

### 最小化 head 模板

```html
<head>
  <!-- 字符编码（必须在前 1024 字节内） -->
  <meta charset="UTF-8">

  <!-- 视口设置（移动端必须） -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 页面标题 -->
  <title>页面标题 - 网站名称</title>

  <!-- 页面描述 -->
  <meta name="description" content="一段 150 字以内的页面摘要，用于搜索结果展示">
</head>
```

### charset：字符编码

```html
<meta charset="UTF-8">
```

- 必须是 `<head>` 中的**第一个元素**（或紧跟 `<head>` 开标签之后）
- 浏览器需要在解析文档前确定编码，否则可能出现乱码
- UTF-8 是现代 Web 的唯一合理选择

**后端类比**：类似于 HTTP 响应头的 `Content-Type: text/html; charset=utf-8`。两者功能重叠时，HTTP 头优先级更高。

### viewport：视口控制

```html
<!-- 标准配置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| 属性 | 含义 | 推荐值 |
|------|------|-------|
| `width` | 视口宽度 | `device-width` |
| `initial-scale` | 初始缩放比例 | `1.0` |
| `minimum-scale` | 最小缩放 | 通常不设置 |
| `maximum-scale` | 最大缩放 | 通常不设置 |
| `user-scalable` | 允许用户缩放 | `yes`（无障碍要求） |

```html
<!-- ❌ 禁止缩放：损害可访问性 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- ✅ 允许缩放 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

不设置 viewport 的页面在移动端会以 980px 宽度渲染后缩小显示，导致文字极小、需要手动缩放。

### title：页面标题

```html
<!-- 格式：页面标题 - 网站名称 -->
<title>HTML 系统化学习 - 前端知识库</title>

<!-- 首页 -->
<title>前端知识库 - 系统化学习前端技术</title>

<!-- 列表页 -->
<title>HTML 教程列表 - 前端知识库</title>

<!-- 详情页 -->
<title>Meta 标签详解 - HTML 教程 - 前端知识库</title>
```

**最佳实践**：
- 长度控制在 50-60 个字符（搜索结果会截断）
- 每个页面标题唯一
- 关键词靠前放置
- 使用分隔符（`-` 或 `|`）分隔层级

### description：页面描述

```html
<meta name="description" content="深入理解 HTML meta 标签的作用与配置，包括 charset、viewport、Open Graph 协议、结构化数据等，面向后端开发者的实战指南。">
```

**最佳实践**：
- 长度控制在 120-160 个字符
- 包含页面核心关键词
- 每个页面描述唯一
- 描述内容应与页面实际内容一致（搜索引擎会惩罚不匹配）

### robots：爬虫控制

```html
<!-- 默认行为（可省略） -->
<meta name="robots" content="index, follow">

<!-- 禁止索引此页面 -->
<meta name="robots" content="noindex">

<!-- 禁止跟踪此页面的链接 -->
<meta name="robots" content="nofollow">

<!-- 禁止索引且不跟踪 -->
<meta name="robots" content="noindex, nofollow">

<!-- 禁止缓存 -->
<meta name="robots" content="noarchive">

<!-- 针对特定爬虫 -->
<meta name="googlebot" content="noindex">
<meta name="bingbot" content="noindex">
```

**后端类比**：`robots` ≈ API 的权限控制，决定哪些内容对外可见。

## Open Graph 协议

### 用途

Open Graph（OG）协议由 Facebook 制定，定义了页面在**社交平台分享**时的展示信息。微信、Twitter、LinkedIn、Slack 等平台都支持。

### 基本配置

```html
<head>
  <!-- 基础 OG 标签 -->
  <meta property="og:title" content="HTML Meta 标签完全指南">
  <meta property="og:description" content="深入理解 HTML meta 标签的配置与 SEO 实战">
  <meta property="og:image" content="https://example.com/images/meta-guide.jpg">
  <meta property="og:url" content="https://example.com/html/meta-tags">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="前端知识库">
  <meta property="og:locale" content="zh_CN">
</head>
```

### og:type 常用值

| type | 适用场景 |
|------|---------|
| `website` | 首页、通用页面 |
| `article` | 文章、博客 |
| `product` | 商品页 |
| `profile` | 个人主页 |
| `video.other` | 视频页面 |
| `music.song` | 音乐页面 |

### 文章类型的扩展属性

```html
<meta property="og:type" content="article">
<meta property="article:published_time" content="2024-01-15T08:00:00+08:00">
<meta property="article:modified_time" content="2024-02-01T10:30:00+08:00">
<meta property="article:author" content="https://example.com/author/zhangsan">
<meta property="article:section" content="前端开发">
<meta property="article:tag" content="HTML">
<meta property="article:tag" content="SEO">
```

### og:image 要求

```html
<!-- 推荐尺寸：1200×630 像素 -->
<meta property="og:image" content="https://example.com/images/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="文章封面图描述">
<meta property="og:image:type" content="image/jpeg">
```

**注意**：`og:image` 必须是**绝对 URL**，相对路径不生效。

### Twitter Cards

```html
<!-- Twitter 特有标签 -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yoursite">
<meta name="twitter:creator" content="@author">
<meta name="twitter:title" content="HTML Meta 标签完全指南">
<meta name="twitter:description" content="深入理解 meta 标签">
<meta name="twitter:image" content="https://example.com/images/share.jpg">
```

| card 类型 | 效果 |
|----------|------|
| `summary` | 小图 + 标题 + 描述 |
| `summary_large_image` | 大图 + 标题 + 描述 |
| `player` | 视频/音频播放器 |
| `app` | 应用下载卡片 |

## Favicon 体系

### 完整配置

```html
<head>
  <!-- 标准 favicon -->
  <link rel="icon" href="/favicon.ico" sizes="32x32">

  <!-- SVG favicon（现代浏览器，支持暗色模式适配） -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">

  <!-- Apple Touch Icon（iOS 添加到主屏幕） -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <!-- Android Chrome -->
  <link rel="manifest" href="/site.webmanifest">

  <!-- 主题色（浏览器地址栏/标签页颜色） -->
  <meta name="theme-color" content="#3b82f6">
  <!-- 暗色模式主题色 -->
  <meta name="theme-color" content="#1e3a5f" media="(prefers-color-scheme: dark)">
</head>
```

### site.webmanifest

```json
{
  "name": "前端知识库",
  "short_name": "前端知识库",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### SVG Favicon 的暗色模式适配

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    circle { fill: #3b82f6; }
    @media (prefers-color-scheme: dark) {
      circle { fill: #60a5fa; }
    }
  </style>
  <circle cx="16" cy="16" r="14"/>
  <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">H</text>
</svg>
```

## 结构化数据

### JSON-LD（推荐方式）

JSON-LD（JSON for Linking Data）是 Google 推荐的结构化数据格式，放在 `<script>` 标签中：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "HTML Meta 标签完全指南",
  "description": "深入理解 HTML meta 标签的配置与 SEO 实战",
  "author": {
    "@type": "Person",
    "name": "张三",
    "url": "https://example.com/author/zhangsan"
  },
  "publisher": {
    "@type": "Organization",
    "name": "前端知识库",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-02-01",
  "image": "https://example.com/images/meta-guide.jpg",
  "mainEntityOfPage": "https://example.com/html/meta-tags"
}
</script>
```

**后端类比**：JSON-LD ≈ API 的 Schema 文档（OpenAPI / Swagger），用标准格式描述数据结构。

### 常用 Schema 类型

**面包屑导航**：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "HTML 教程", "item": "https://example.com/html/" },
    { "@type": "ListItem", "position": 3, "name": "Meta 标签" }
  ]
}
</script>
```

**FAQ**：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什么是 meta 标签？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "meta 标签是 HTML head 中的元数据标签，用于描述页面属性..."
      }
    },
    {
      "@type": "Question",
      "name": "viewport 有什么作用？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "viewport meta 标签控制页面在移动设备上的渲染方式..."
      }
    }
  ]
}
</script>
```

**产品**：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "机械键盘",
  "image": "https://example.com/keyboard.jpg",
  "description": "87 键红轴机械键盘",
  "brand": { "@type": "Brand", "name": "品牌名" },
  "offers": {
    "@type": "Offer",
    "price": "599",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "256"
  }
}
</script>
```

Google 会根据结构化数据在搜索结果中展示**富摘要**（Rich Snippets）：星级评分、价格、FAQ 展开等。

## SSR 页面的 head 管理

### 问题

SPA 应用默认只有一个空 HTML Shell，所有 meta 标签在客户端通过 JS 动态设置。搜索引擎爬虫可能无法获取这些动态内容。

### 框架解决方案

```jsx
// Next.js（App Router）
export const metadata = {
  title: 'Meta 标签详解 - HTML 教程',
  description: '深入理解 HTML meta 标签',
  openGraph: {
    title: 'Meta 标签详解',
    description: '深入理解 HTML meta 标签',
    images: ['/images/meta-guide.jpg'],
  },
};

export default function Page() {
  return <main>...</main>;
}
```

```javascript
// Nuxt 3
useHead({
  title: 'Meta 标签详解 - HTML 教程',
  meta: [
    { name: 'description', content: '深入理解 HTML meta 标签' },
    { property: 'og:title', content: 'Meta 标签详解' },
    { property: 'og:image', content: 'https://example.com/images/meta-guide.jpg' },
  ],
});
```

```jsx
// React Helmet（纯 CSR 场景）
import { Helmet } from 'react-helmet';

function ArticlePage({ article }) {
  return (
    <>
      <Helmet>
        <title>{article.title} - 前端知识库</title>
        <meta name="description" content={article.summary} />
        <meta property="og:title" content={article.title} />
      </Helmet>
      <main>...</main>
    </>
  );
}
```

### 后端直出 head（Node.js SSR）

```javascript
function renderHead({ title, description, ogImage, url, type = 'article' }) {
  return `
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <meta name="description" content="${escapeHtml(description)}">
      
      <meta property="og:title" content="${escapeHtml(title)}">
      <meta property="og:description" content="${escapeHtml(description)}">
      <meta property="og:image" content="${ogImage}">
      <meta property="og:url" content="${url}">
      <meta property="og:type" content="${type}">
      
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${escapeHtml(title)}">
      <meta name="twitter:description" content="${escapeHtml(description)}">
      <meta name="twitter:image" content="${ogImage}">
      
      <link rel="icon" href="/favicon.ico" sizes="32x32">
      <link rel="icon" href="/favicon.svg" type="image/svg+xml">
      <link rel="apple-touch-icon" href="/apple-touch-icon.png">
      <link rel="canonical" href="${url}">
    </head>
  `;
}
```

## 其他实用 Meta 标签

### canonical：规范 URL

```html
<!-- 同一内容有多个 URL 时，指定规范版本 -->
<link rel="canonical" href="https://example.com/article/meta-tags">
<!-- 避免搜索引擎将 ?page=1&sort=date 等变体视为重复内容 -->
```

### 多语言 / 多地区

```html
<link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/article">
<link rel="alternate" hreflang="en" href="https://example.com/en/article">
<link rel="alternate" hreflang="x-default" href="https://example.com/article">
```

### HTTP 等价 meta

```html
<!-- 页面自动刷新 / 跳转 -->
<meta http-equiv="refresh" content="5;url=https://example.com/new-page">

<!-- CSP（备选方案，详见附录 G） -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

<!-- 兼容模式（旧 IE） -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

### 其他

```html
<!-- 禁止自动检测电话号码（iOS Safari） -->
<meta name="format-detection" content="telephone=no">

<!-- 应用名称（添加到主屏幕时） -->
<meta name="application-name" content="前端知识库">

<!-- 作者 -->
<meta name="author" content="张三">

<!-- 生成工具 -->
<meta name="generator" content="Next.js 14">
```

## 完整 head 模板

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO 基础 -->
  <title>页面标题 - 网站名称</title>
  <meta name="description" content="页面描述">
  <link rel="canonical" href="https://example.com/current-page">
  
  <!-- Open Graph -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/share-image.jpg">
  <meta property="og:url" content="https://example.com/current-page">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="网站名称">
  <meta property="og:locale" content="zh_CN">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="页面标题">
  <meta name="twitter:description" content="页面描述">
  <meta name="twitter:image" content="https://example.com/share-image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#3b82f6">
  
  <!-- 多语言 -->
  <link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/page">
  <link rel="alternate" hreflang="en" href="https://example.com/en/page">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Article", ... }
  </script>
  
  <!-- 样式 -->
  <link rel="stylesheet" href="/styles/main.css">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" as="font" href="/fonts/main.woff2" type="font/woff2" crossorigin>
  <link rel="preconnect" href="https://api.example.com">
</head>
```

## 常见误区

### 误区 1：keywords meta 仍有 SEO 价值

```html
<!-- ❌ Google 早已不使用 keywords 排名 -->
<meta name="keywords" content="HTML, meta, SEO, 前端">

<!-- 可以保留但不要在此上花时间 -->
```

### 误区 2：SPA 不需要 meta 标签

```html
<!-- ❌ SPA 空 shell 对 SEO 不友好 -->
<head>
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script src="app.js"></script>
</body>

<!-- ✅ SSR / SSG 输出完整 head -->
```

### 误区 3：og:image 使用相对路径

```html
<!-- ❌ 社交平台无法解析相对路径 -->
<meta property="og:image" content="/images/share.jpg">

<!-- ✅ 必须使用绝对 URL -->
<meta property="og:image" content="https://example.com/images/share.jpg">
```

## 参考资源

- [HTML Living Standard - Meta](https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [Google - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [Web.dev - Meta Tags](https://web.dev/learn/html/metadata/)
