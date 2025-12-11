# 第 3 章：头部元素详解

## 概述

`<head>` 元素包含页面的元数据，这些信息不会直接显示在页面上，但对搜索引擎、浏览器和用户体验至关重要。

## 一、`<title>` 页面标题

### 1.1 基本用法

```html
<title>页面标题 - 网站名称</title>
```

### 1.2 作用

- 🌐 **浏览器标签页**：显示在标签页上
- 🔖 **收藏夹**：保存书签时的名称
- 🔍 **搜索引擎**：显示在搜索结果中
- 📱 **社交分享**：分享链接时的标题

### 1.3 最佳实践

```html
<!-- ✅ 推荐格式 -->
<title>产品详情 - 京东商城</title>
<title>用户登录 - 淘宝网</title>

<!-- ✅ 首页格式 -->
<title>京东商城 - 正品低价、品质保障</title>

<!-- ✅ 长度控制：50-60 字符 -->
<title>iPhone 15 Pro Max 256GB - Apple 官网</title>

<!-- ❌ 避免 -->
<title>首页</title>
<title>手机,电脑,数码,家电,京东</title>  <!-- 关键词堆砌 -->
```

## 二、`<meta>` 元数据标签

### 2.1 字符编码（必需）

```html
<meta charset="UTF-8">
```

> **⚠️ 注意**  
> 必须放在 `<head>` 的前 1024 字节内，确保中文等字符正确显示。

### 2.2 视口设置（响应式必需）

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**参数说明：**

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `width` | 视口宽度 | `device-width` |
| `initial-scale` | 初始缩放 | `1.0` |
| `maximum-scale` | 最大缩放 | `5.0` |
| `user-scalable` | 允许缩放 | `yes` |

```html
<!-- ✅ 标准响应式配置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- ⚠️ 禁止缩放（影响可访问性，不推荐） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

### 2.3 SEO 相关

#### **页面描述**

```html
<meta name="description" content="全面的 HTML 学习教程，涵盖基础标签、语义化、表单、多媒体等核心知识点。">
```

**要点：**
- 📏 长度：150-160 字符
- 🎯 包含关键词但自然流畅
- 💡 每个页面使用不同描述

#### **搜索引擎控制**

```html
<meta name="robots" content="index, follow">
```

| 值 | 说明 |
|---|---|
| `index, follow` | 索引页面，跟踪链接（默认） |
| `noindex, nofollow` | 不索引，不跟踪 |
| `noarchive` | 不缓存页面 |
| `nosnippet` | 不显示摘要 |

### 2.4 社交媒体（Open Graph）

```html
<!-- Facebook、LinkedIn 等 -->
<meta property="og:title" content="页面标题">
<meta property="og:description" content="页面描述">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">
```

**Twitter Card**

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="页面标题">
<meta name="twitter:description" content="页面描述">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

### 2.5 移动端相关

```html
<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">

<!-- Android Chrome -->
<meta name="theme-color" content="#4285f4">
```

### 2.6 HTTP 等效标签

```html
<!-- 刷新和重定向 -->
<meta http-equiv="refresh" content="5">  <!-- 5秒后刷新 -->
<meta http-equiv="refresh" content="5; url=https://example.com">

<!-- IE 兼容模式 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

## 三、`<link>` 链接标签

### 3.1 样式表

```html
<!-- 外部 CSS -->
<link rel="stylesheet" href="css/style.css">

<!-- 指定媒体查询 -->
<link rel="stylesheet" href="css/print.css" media="print">
<link rel="stylesheet" href="css/mobile.css" media="screen and (max-width: 768px)">
```

### 3.2 网站图标

```html
<!-- 标准 favicon -->
<link rel="icon" href="/favicon.ico" type="image/x-icon">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
```

### 3.3 资源预加载

```html
<!-- 预连接：提前建立连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- DNS 预解析：提前解析域名 -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预加载：预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="hero.jpg" as="image">

<!-- 预获取：预获取未来资源 -->
<link rel="prefetch" href="next-page.html">
```

**对比：**

| 类型 | 优先级 | 用途 |
|------|--------|------|
| `preconnect` | 高 | 提前建立连接（DNS + TCP + TLS） |
| `dns-prefetch` | 中 | 提前解析域名 |
| `preload` | 高 | 当前页面必需资源 |
| `prefetch` | 低 | 未来页面可能用到 |

## 四、`<style>` 样式标签

### 4.1 基本用法

```html
<style>
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
</style>
```

### 4.2 指定媒体查询

```html
<style media="screen">
/* 屏幕样式 */
</style>

<style media="print">
/* 打印样式 */
</style>
```

### 4.3 最佳实践

```html
<!-- ✅ 关键 CSS 内联 -->
<style>
/* 首屏关键样式 */
.header { /* ... */ }
</style>
<link rel="stylesheet" href="style.css">

<!-- ❌ 大量内联样式（不推荐） -->
<style>
/* 几百行 CSS... */
</style>
```

## 五、`<script>` 脚本标签

### 5.1 基本用法

```html
<!-- 外部脚本 -->
<script src="script.js"></script>

<!-- 内联脚本 -->
<script>
console.log('Hello World');
</script>
```

### 5.2 加载策略

```html
<!-- 默认：阻塞解析 -->
<script src="script.js"></script>

<!-- async：异步加载，加载完立即执行 -->
<script src="script.js" async></script>

<!-- defer：异步加载，DOMContentLoaded 前执行 -->
<script src="script.js" defer></script>
```

**对比：**

| 属性 | 下载 | 执行时机 | 顺序 |
|------|------|---------|------|
| 默认 | 阻塞 | 立即 | 按顺序 |
| `async` | 并行 | 下载完立即 | 不保证顺序 |
| `defer` | 并行 | DOM 解析完 | 按顺序 |

```html
<!-- ✅ 推荐：defer 用于依赖 DOM 的脚本 -->
<script src="app.js" defer></script>

<!-- ✅ 推荐：async 用于独立脚本（如统计） -->
<script src="analytics.js" async></script>
```

## 六、`<base>` 基准 URL

### 6.1 基本用法

```html
<base href="https://example.com/">
<base target="_blank">
```

### 6.2 作用

```html
<!DOCTYPE html>
<html>
<head>
  <base href="https://example.com/path/">
</head>
<body>
  <!-- 相对 URL 会基于 base href -->
  <a href="page.html">链接</a>
  <!-- 实际指向：https://example.com/path/page.html -->
  
  <img src="image.jpg">
  <!-- 实际指向：https://example.com/path/image.jpg -->
</body>
</html>
```

> **⚠️ 注意**  
> `<base>` 影响页面所有相对 URL，慎用。

## 七、完整的 `<head>` 示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 字符编码：必须在前 1024 字节 -->
  <meta charset="UTF-8">
  
  <!-- 视口设置：响应式必需 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 页面标题：SEO 重要 -->
  <title>HTML 完整教程 - 从入门到精通</title>
  
  <!-- 页面描述：SEO 重要 -->
  <meta name="description" content="全面的 HTML 学习教程，涵盖基础标签、语义化、表单、多媒体等核心知识。">
  
  <!-- 搜索引擎控制 -->
  <meta name="robots" content="index, follow">
  
  <!-- 作者信息 -->
  <meta name="author" content="张三">
  
  <!-- Open Graph -->
  <meta property="og:title" content="HTML 完整教程">
  <meta property="og:description" content="全面的 HTML 学习教程">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  
  <!-- 网站图标 -->
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  
  <!-- 预连接 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="fonts/font.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- 样式表 -->
  <link rel="stylesheet" href="css/style.css">
  
  <!-- 关键 CSS 内联 -->
  <style>
  /* 首屏关键样式 */
  </style>
  
  <!-- JavaScript -->
  <script src="js/app.js" defer></script>
  <script src="js/analytics.js" async></script>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

## 参考资料

- [MDN - `<head>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/head)
- [MDN - `<meta>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/meta)
- [Open Graph Protocol](https://ogp.me/)

---

**上一章** ← [第 2 章：文档结构与语法](./02-document-structure.md)  
**下一章** → [第 4 章：文本内容标签](./04-text-content.md)
