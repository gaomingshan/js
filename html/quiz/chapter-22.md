# 第 22 章：SEO 优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | title 标签

### 题目
`<title>` 标签的最佳长度？

**A.** 无限制 | **B.** 50-60字符 | **C.** 100字符 | **D.** 越长越好

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```html
<!-- ✅ 好的title -->
<title>HTML5 完整教程 - 技术博客</title>

<!-- ❌ 太短 -->
<title>教程</title>

<!-- ❌ 太长（会被截断） -->
<title>HTML5完整教程包含语义化标签表单验证响应式设计性能优化...</title>
```

**建议：** 50-60字符，包含关键词

**来源：** Google SEO指南
</details>

---

## 第 2 题 🟢 | meta description

### 题目
`meta description` 的作用？

**A.** 排名因素 | **B.** 搜索结果摘要 | **C.** 页面内容 | **D.** 无用

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```html
<meta name="description" content="学习HTML5的完整指南，包含语义化、表单、SEO优化等核心知识点。">
```

**要点：**
- 150-160字符
- 包含关键词
- 吸引点击
- 每页唯一

**来源：** SEO最佳实践
</details>

---

## 第 3 题 🟢 | 语义化标签

### 题目
语义化标签对SEO的影响？

**A.** 无影响 | **B.** 有帮助 | **C.** 必须使用 | **D.** 有害

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```html
<!-- ✅ 语义化：搜索引擎易理解 -->
<article>
  <header>
    <h1>文章标题</h1>
  </header>
  <p>内容...</p>
</article>

<!-- ❌ 非语义化 -->
<div class="article">
  <div class="header">
    <div class="title">文章标题</div>
  </div>
  <div>内容...</div>
</div>
```

**来源：** HTML5 SEO
</details>

---

## 第 4 题 🟡 | 标题层级

### 题目
标题层级对SEO的重要性？

<details><summary>查看答案</summary>

### ✅ 答案

```html
<!-- ✅ 正确层级 -->
<h1>页面主标题</h1>
  <h2>章节1</h2>
    <h3>小节1.1</h3>
  <h2>章节2</h2>

<!-- ❌ 跳级 -->
<h1>标题</h1>
<h4>跳过h2、h3</h4>

<!-- ❌ 多个h1（SEO角度不推荐） -->
<h1>标题1</h1>
<h1>标题2</h1>
```

**建议：**
- 每页一个 h1
- 标题连续不跳级
- h1 包含主要关键词

**来源：** SEO 文档结构
</details>

---

## 第 5 题 🟡 | 图片优化

### 题目
图片SEO优化要点？**（多选）**

**A.** alt 属性 | **B.** 文件名 | **C.** 尺寸 | **D.** 格式

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析
```html
<!-- ✅ 优化完整 -->
<img 
  src="html5-tutorial-cover.webp"     <!-- 描述性文件名 + 现代格式 -->
  alt="HTML5 教程封面图"              <!-- 描述性alt -->
  width="800"                         <!-- 指定尺寸 -->
  height="600"
  loading="lazy">                     <!-- 懒加载 -->

<!-- ❌ 未优化 -->
<img src="img001.jpg">
```

**要点：**
- **alt：** 准确描述
- **文件名：** 关键词-连字符
- **尺寸：** 适当压缩
- **格式：** WebP优先

**来源：** 图片 SEO
</details>

---

## 第 6 题 🟡 | canonical 标签

### 题目
`canonical` 标签的作用？

<details><summary>查看答案</summary>

### ✅ 答案

指定规范URL，避免重复内容：

```html
<!-- 原始页面 -->
<link rel="canonical" href="https://example.com/article">

<!-- 以下URL都指向同一内容 -->
<!-- https://example.com/article -->
<!-- https://example.com/article?ref=twitter -->
<!-- https://example.com/article?utm_source=email -->
```

**场景：**
- 多个URL同一内容
- 分页内容
- HTTP vs HTTPS
- www vs non-www

**来源：** Google 规范URL
</details>

---

## 第 7 题 🟡 | robots meta

### 题目
`robots` meta 标签的值？**（多选）**

**A.** index / noindex | **B.** follow / nofollow | **C.** noarchive | **D.** nosnippet

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析
```html
<!-- 允许索引和跟踪 -->
<meta name="robots" content="index, follow">

<!-- 禁止索引 -->
<meta name="robots" content="noindex">

<!-- 禁止跟踪链接 -->
<meta name="robots" content="nofollow">

<!-- 禁止缓存 -->
<meta name="robots" content="noarchive">

<!-- 禁止摘要 -->
<meta name="robots" content="nosnippet">

<!-- 组合 -->
<meta name="robots" content="noindex, nofollow">
```

**来源：** Robots Meta 标签
</details>

---

## 第 8 题 🔴 | 结构化数据

### 题目
为文章添加结构化数据。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>HTML5 完整教程 - 技术博客</title>
  <meta name="description" content="从零开始学习HTML5，掌握语义化、表单、SEO等核心技能。">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "HTML5 完整教程",
    "image": "https://example.com/cover.jpg",
    "author": {
      "@type": "Person",
      "name": "张三",
      "url": "https://example.com/author/zhangsan"
    },
    "publisher": {
      "@type": "Organization",
      "name": "技术博客",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    },
    "datePublished": "2024-01-15",
    "dateModified": "2024-01-20",
    "description": "从零开始学习HTML5，掌握语义化、表单、SEO等核心技能。"
  }
  </script>
  
  <!-- Open Graph -->
  <meta property="og:title" content="HTML5 完整教程">
  <meta property="og:description" content="从零开始学习HTML5">
  <meta property="og:image" content="https://example.com/cover.jpg">
  <meta property="og:url" content="https://example.com/article">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="HTML5 完整教程">
  <meta name="twitter:description" content="从零开始学习HTML5">
  <meta name="twitter:image" content="https://example.com/cover.jpg">
</head>
<body>
  <article>
    <h1>HTML5 完整教程</h1>
    <p>内容...</p>
  </article>
</body>
</html>
```

**来源：** 结构化数据最佳实践
</details>

---

## 第 9 题 🔴 | 链接策略

### 题目
内部链接优化策略？

<details><summary>查看答案</summary>

### ✅ 答案

**1. 描述性锚文本**
```html
<!-- ❌ 不好 -->
<a href="/article">点击这里</a>

<!-- ✅ 好 -->
<a href="/html5-tutorial">查看HTML5完整教程</a>
```

**2. 相关内容链接**
```html
<article>
  <p>学习完HTML基础后，可以继续学习
    <a href="/css-tutorial">CSS样式</a>和
    <a href="/js-tutorial">JavaScript编程</a>。
  </p>
</article>
```

**3. 面包屑导航**
```html
<nav aria-label="面包屑">
  <a href="/">首页</a> /
  <a href="/tutorials">教程</a> /
  <span>HTML5</span>
</nav>
```

**4. 避免的做法**
```html
<!-- ❌ 隐藏链接 -->
<a href="/spam" style="display:none">隐藏链接</a>

<!-- ❌ 过多关键词 -->
<a href="/article">HTML HTML5 教程 学习 前端 开发...</a>

<!-- ❌ nofollow 内部链接 -->
<a href="/important-page" rel="nofollow">重要页面</a>
```

**来源：** 内部链接最佳实践
</details>

---

## 第 10 题 🔴 | 页面速度优化

### 题目
提升页面速度的HTML优化？**（多选）**

**A.** 资源预加载 | **B.** 懒加载 | **C.** 压缩 | **D.** CDN

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析

**1. 资源预加载**
```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="main.css" as="style">
<link rel="preload" href="hero.jpg" as="image">

<!-- 预获取下一页 -->
<link rel="prefetch" href="/next-page">
```

**2. 图片懒加载**
```html
<img src="hero.jpg" alt="Hero">
<img src="placeholder.jpg" data-src="image.jpg" loading="lazy" alt="Image">
```

**3. 脚本优化**
```html
<!-- async：不阻塞，下载完立即执行 -->
<script src="analytics.js" async></script>

<!-- defer：不阻塞，DOMContentLoaded前执行 -->
<script src="app.js" defer></script>

<!-- 模块 -->
<script type="module" src="main.js"></script>
```

**4. CSS优化**
```html
<!-- 内联关键CSS -->
<style>
  /* 首屏样式 */
</style>

<!-- 异步加载非关键CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

**5. 字体优化**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
```

**6. 响应式图片**
```html
<picture>
  <source srcset="hero-small.webp" media="(max-width: 600px)" type="image/webp">
  <source srcset="hero-large.webp" media="(min-width: 601px)" type="image/webp">
  <img src="hero.jpg" alt="Hero">
</picture>
```

**来源：** Web 性能优化
</details>

---

**📌 本章总结**
- title：50-60字符，包含关键词
- meta description：150-160字符
- 语义化标签：帮助搜索引擎理解
- 标题层级：h1唯一，连续不跳级
- 图片：alt、描述性文件名、WebP
- canonical：规范URL
- 结构化数据：JSON-LD
- 页面速度：预加载、懒加载、压缩

**上一章** ← [第 21 章：微数据](./chapter-21.md)  
**下一章** → [第 23 章：XSS防护](./chapter-23.md)
