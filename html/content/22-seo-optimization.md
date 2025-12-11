# 第 22 章：SEO 优化

## 概述

SEO（Search Engine Optimization）是提升网站在搜索引擎排名的技术。合理的 HTML 结构是 SEO 的基础。

## 一、HTML 基础 SEO

### 1.1 `<title>` 标签

```html
<!-- ✅ 好的标题 -->
<title>深入理解JavaScript闭包 - 技术博客</title>
<title>iPhone 15 Pro Max 256GB - Apple官网</title>

<!-- ❌ 不好的标题 -->
<title>首页</title>
<title>手机_电脑_数码_家电_京东</title>  <!-- 关键词堆砌 -->
```

**最佳实践：**
- 📏 长度：50-60 字符
- 🎯 包含主要关键词
- 📝 描述性强
- 🏢 品牌名称放后面

### 1.2 `<meta description>`

```html
<meta name="description" content="完整的HTML教程，涵盖基础标签、语义化、表单、多媒体等核心知识，适合前端开发者学习。">
```

**最佳实践：**
- 📏 长度：150-160 字符
- 🎯 包含关键词
- 💡 吸引点击
- 📝 准确描述页面内容

### 1.3 标题层级

```html
<!-- ✅ 正确的层级 -->
<h1>网站主标题</h1>
  <h2>第一部分</h2>
    <h3>1.1 小节</h3>
    <h3>1.2 小节</h3>
  <h2>第二部分</h2>

<!-- ❌ 错误：多个 h1 -->
<h1>标题1</h1>
<h1>标题2</h1>
```

## 二、语义化 HTML

### 2.1 使用语义标签

```html
<!-- ✅ SEO 友好 -->
<article>
  <header>
    <h1>文章标题</h1>
    <time datetime="2024-01-15">2024年1月15日</time>
  </header>
  
  <section>
    <h2>第一部分</h2>
    <p>内容...</p>
  </section>
  
  <footer>
    <address>作者信息</address>
  </footer>
</article>

<!-- ❌ 不友好 -->
<div class="article">
  <div class="title">文章标题</div>
  <div class="content">内容...</div>
</div>
```

### 2.2 导航结构

```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<!-- 面包屑导航 -->
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页</li>
  </ol>
</nav>
```

## 三、链接优化

### 3.1 内部链接

```html
<!-- ✅ 描述性锚文本 -->
<a href="/guide/javascript-closures">深入理解JavaScript闭包</a>

<!-- ❌ 无意义的锚文本 -->
<a href="/article/123">点击这里</a>
<a href="/page">更多</a>
```

### 3.2 外部链接

```html
<!-- nofollow：告诉搜索引擎不要跟踪 -->
<a href="https://external-site.com" rel="nofollow">外部链接</a>

<!-- noopener：安全性 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部链接
</a>
```

### 3.3 规范链接

```html
<!-- 指定规范URL，避免重复内容 -->
<link rel="canonical" href="https://example.com/page">
```

## 四、图片优化

### 4.1 alt 属性

```html
<!-- ✅ 描述性 alt -->
<img src="iphone15.jpg" alt="iPhone 15 Pro Max 深空黑色 256GB">

<!-- ❌ 无意义的 alt -->
<img src="img123.jpg" alt="图片">
<img src="photo.jpg" alt="IMG_1234">

<!-- ✅ 装饰性图片：空 alt -->
<img src="decoration.png" alt="">
```

### 4.2 图片文件名

```html
<!-- ✅ 描述性文件名 -->
<img src="iphone-15-pro-max-black.jpg" alt="iPhone 15 Pro Max 黑色">

<!-- ❌ 无意义的文件名 -->
<img src="img123.jpg" alt="iPhone">
```

### 4.3 响应式图片

```html
<img src="image.jpg"
     srcset="small.jpg 480w,
             medium.jpg 768w,
             large.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 50vw"
     alt="响应式图片">
```

## 五、结构化数据

### 5.1 JSON-LD

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Article",
  "headline": "深入理解JavaScript闭包",
  "image": "https://example.com/image.jpg",
  "author": {
    "@type": "Person",
    "name": "张三"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20",
  "publisher": {
    "@type": "Organization",
    "name": "技术博客",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
</script>
```

### 5.2 面包屑导航

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "首页",
    "item": "https://example.com"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "分类",
    "item": "https://example.com/category"
  },{
    "@type": "ListItem",
    "position": 3,
    "name": "当前页"
  }]
}
</script>
```

## 六、性能优化

### 6.1 页面加载速度

```html
<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<!-- 异步加载脚本 -->
<script src="script.js" defer></script>
<script src="analytics.js" async></script>
```

### 6.2 图片懒加载

```html
<!-- 原生懒加载 -->
<img src="image.jpg" loading="lazy" alt="图片">

<!-- 非首屏图片 -->
<img src="hero.jpg" loading="eager" alt="首屏图片">
```

## 七、移动优化

### 7.1 视口设置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 7.2 移动友好

```html
<!-- 避免使用固定宽度 -->
<!-- ❌ -->
<div style="width: 1200px;">内容</div>

<!-- ✅ -->
<div style="max-width: 100%;">内容</div>
```

### 7.3 可点击元素

```css
/* 按钮和链接至少 44x44 像素 */
button, a {
  min-height: 44px;
  min-width: 44px;
}
```

## 八、内容优化

### 8.1 原创内容

```html
<!-- ✅ 原创、有价值的内容 -->
<article>
  <h1>深入理解JavaScript闭包</h1>
  <p>闭包是JavaScript中的核心概念，本文将从原理、应用到最佳实践全面讲解...</p>
</article>

<!-- ❌ 重复、低质量内容 -->
```

### 8.2 内容长度

- 📏 文章至少 300 字
- 🎯 详细但不冗余
- 📝 解决用户问题

### 8.3 关键词密度

```html
<!-- ✅ 自然出现关键词 -->
<article>
  <h1>JavaScript闭包教程</h1>
  <p>闭包是JavaScript的核心概念之一...</p>
  <p>理解闭包对于掌握JavaScript至关重要...</p>
</article>

<!-- ❌ 关键词堆砌 -->
<p>JavaScript闭包，闭包JavaScript，学习闭包...</p>
```

## 九、robots.txt 和 sitemap

### 9.1 robots.txt

```txt
# 允许所有搜索引擎
User-agent: *
Allow: /

# 禁止访问特定目录
Disallow: /admin/
Disallow: /private/

# Sitemap 位置
Sitemap: https://example.com/sitemap.xml
```

### 9.2 sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/article/1</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## 十、避免的错误

### 10.1 常见 SEO 错误

```html
<!-- ❌ 隐藏文本 -->
<div style="display:none;">关键词 关键词 关键词</div>

<!-- ❌ 关键词堆砌 -->
<title>手机 手机 手机 买手机 手机价格 手机商城</title>

<!-- ❌ 重复内容 -->
<!-- 多个页面有相同内容 -->

<!-- ❌ Flash 内容 -->
<embed src="content.swf">

<!-- ❌ 框架 -->
<frameset>...</frameset>
```

### 10.2 黑帽 SEO（禁止）

- ❌ 隐藏文本和链接
- ❌ 关键词堆砌
- ❌ 门页（doorway pages）
- ❌ 内容农场
- ❌ 购买链接

## 十一、SEO 检查清单

> **✅ 基础 SEO 清单**
> 
> **Meta 标签**
> - [ ] 每页独特的 `<title>`
> - [ ] 每页独特的 `<meta description>`
> - [ ] 视口设置
> 
> **内容**
> - [ ] 每页一个 `<h1>`
> - [ ] 标题层级正确
> - [ ] 原创、有价值的内容
> - [ ] 合理的关键词密度
> 
> **链接**
> - [ ] 描述性锚文本
> - [ ] 面包屑导航
> - [ ] 内部链接结构
> 
> **图片**
> - [ ] 所有图片有 alt
> - [ ] 描述性文件名
> - [ ] 图片优化（大小）
> 
> **性能**
> - [ ] 页面加载速度 < 3秒
> - [ ] 移动友好
> - [ ] HTTPS
> 
> **技术**
> - [ ] robots.txt
> - [ ] sitemap.xml
> - [ ] 结构化数据
> - [ ] 规范链接

## 十二、工具推荐

### 12.1 分析工具

- **Google Search Console**：监控搜索表现
- **Google Analytics**：流量分析
- **PageSpeed Insights**：性能分析

### 12.2 SEO 工具

- **Lighthouse**：综合评测
- **Screaming Frog**：网站爬取
- **Ahrefs/SEMrush**：关键词研究

### 12.3 测试工具

```javascript
// 检查标题
console.log('标题长度:', document.title.length);

// 检查 meta description
const desc = document.querySelector('meta[name="description"]');
console.log('描述长度:', desc?.content.length);

// 检查 h1
const h1Count = document.querySelectorAll('h1').length;
console.log('h1 数量:', h1Count);

// 检查图片 alt
const imgsWithoutAlt = document.querySelectorAll('img:not([alt])');
console.log('缺少 alt 的图片:', imgsWithoutAlt.length);
```

## 参考资料

- [Google 搜索中心](https://developers.google.com/search)
- [Moz SEO 学习中心](https://moz.com/learn/seo)
- [Schema.org](https://schema.org/)

---

**上一章** ← [第 21 章：微数据](./21-microdata.md)  
**下一章** → [第 23 章：XSS 防护](./23-xss-protection.md)

---

✅ **第四部分：语义化HTML（18-22章）已完成！**
