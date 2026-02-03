# 语义化标签的增强

## 核心概念

HTML5 引入了大量新的语义化标签，目的是让 HTML 更具表达力，减少对 div/span 的依赖。

```html
<!-- HTML4 时代 -->
<div id="header">
  <div id="nav">...</div>
</div>
<div id="main">
  <div class="article">...</div>
</div>

<!-- HTML5 -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
```

**后端类比**：类似于强类型语言 vs 弱类型语言，更明确的类型定义。

## 新增结构标签的设计动机

### 主要新增标签

- `<header>`, `<footer>`, `<nav>`, `<main>`
- `<article>`, `<section>`, `<aside>`
- `<figure>`, `<figcaption>`
- `<time>`, `<mark>`

**设计动机**：
1. 提高可访问性
2. 改善 SEO
3. 提升代码可读性

## 向后兼容性处理策略

```html
<!-- 为旧浏览器添加样式支持 -->
<style>
  header, nav, main, article, section, aside, footer {
    display: block;
  }
</style>

<!-- 使用 HTML5 Shiv -->
<!--[if lt IE 9]>
<script src="html5shiv.js"></script>
<![endif]-->
```

## 渐进式增强

```html
<!-- 基础功能：所有浏览器支持 -->
<div class="video-container">
  <a href="video.mp4">下载视频</a>
</div>

<!-- 增强功能：现代浏览器 -->
<video src="video.mp4" controls>
  <a href="video.mp4">下载视频</a>
</video>
```

**后端类比**：类似于 API 版本兼容策略。

## 参考资源

- [MDN - HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML/HTML5)
- [Can I Use - HTML5](https://caniuse.com/?search=html5)
