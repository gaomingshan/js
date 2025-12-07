// 第22章：SEO优化 - 内容数据
window.htmlContentData_22 = {
    section: {
        title: "SEO优化",
        icon: "🔍"
    },
    topics: [
        {
            type: "concept",
            title: "HTML与SEO",
            content: {
                description: "搜索引擎优化（SEO）的基础在于HTML的正确使用。良好的HTML结构、语义化标签和元数据能显著提升搜索引擎的理解和排名。",
                keyPoints: [
                    "语义化HTML帮助搜索引擎理解内容",
                    "title和meta标签是SEO的关键",
                    "结构化数据提升搜索结果展示",
                    "URL结构要清晰简洁",
                    "页面性能影响排名",
                    "移动友好性至关重要"
                ]
            }
        },
        {
            type: "code-example",
            title: "头部元数据优化",
            content: {
                description: "head部分的元数据对SEO至关重要。",
                examples: [
                    {
                        title: "基础元数据",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- 页面标题（最重要的SEO元素） -->
    <title>HTML5完全指南 - 从入门到精通 | 技术博客</title>
    
    <!-- 页面描述（显示在搜索结果中） -->
    <meta name="description" 
          content="详细介绍HTML5的各种特性、语义化标签、表单、多媒体等内容，适合初学者和进阶开发者。">
    
    <!-- 关键词（现在权重较低） -->
    <meta name="keywords" content="HTML5,教程,语义化,前端开发">
    
    <!-- 规范链接（避免重复内容） -->
    <link rel="canonical" href="https://example.com/html5-guide">
    
    <!-- 语言和地区 -->
    <link rel="alternate" hreflang="zh-CN" href="https://example.com/zh-cn/html5-guide">
    <link rel="alternate" hreflang="en" href="https://example.com/en/html5-guide">
</head>
</html>`,
                        notes: "title和description是最重要的SEO元素"
                    },
                    {
                        title: "Open Graph标签",
                        code: `<head>
    <!-- 基础OG标签 -->
    <meta property="og:title" content="HTML5完全指南">
    <meta property="og:description" content="详细介绍HTML5的各种特性...">
    <meta property="og:image" content="https://example.com/og-image.jpg">
    <meta property="og:url" content="https://example.com/html5-guide">
    <meta property="og:type" content="article">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="HTML5完全指南">
    <meta name="twitter:description" content="详细介绍HTML5的各种特性...">
    <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
</head>`,
                        notes: "OG标签优化社交媒体分享效果"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "语义化标签与SEO",
            content: {
                description: "正确使用语义化标签提升SEO。",
                examples: [
                    {
                        title: "标题层级",
                        code: `<!-- ✅ 正确的标题层级 -->
<main>
    <h1>页面主标题</h1>
    
    <section>
        <h2>第一部分</h2>
        <p>内容...</p>
        
        <h3>子标题</h3>
        <p>内容...</p>
    </section>
    
    <section>
        <h2>第二部分</h2>
        <p>内容...</p>
    </section>
</main>

<!-- 标题优化原则：
     1. 每页只有一个h1
     2. 不跳级使用（h1→h2→h3）
     3. 包含关键词
     4. 反映内容结构
-->`,
                        notes: "正确的标题层级帮助搜索引擎理解结构"
                    },
                    {
                        title: "图片SEO",
                        code: `<!-- ✅ 优化的图片 -->
<img src="html5-tutorial.jpg" 
     alt="HTML5教程示例代码截图"
     width="800"
     height="600"
     loading="lazy">

<!-- 图片优化要点：
     1. alt属性描述准确
     2. 文件名有意义（html5-tutorial.jpg）
     3. 指定宽高避免布局偏移
     4. 使用loading="lazy"延迟加载
     5. 压缩图片减小文件大小
     6. 使用WebP等现代格式
-->

<!-- ❌ 未优化的图片 -->
<img src="img123.jpg">`,
                        notes: "图片优化提升页面速度和SEO"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "结构化数据",
            content: {
                description: "使用结构化数据获得富文本摘要。",
                examples: [
                    {
                        title: "面包屑导航",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "教程",
      "item": "https://example.com/tutorials"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "HTML5",
      "item": "https://example.com/tutorials/html5"
    }
  ]
}
</script>`,
                        notes: "面包屑可以显示在搜索结果中"
                    },
                    {
                        title: "FAQ页面",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什么是HTML5？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HTML5是最新版本的HTML标准，增加了许多新特性和API。"
      }
    },
    {
      "@type": "Question",
      "name": "HTML5有哪些新特性？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HTML5引入了语义化标签、多媒体支持、Canvas、本地存储等新特性。"
      }
    }
  ]
}
</script>`,
                        notes: "FAQ可以直接显示在搜索结果中"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "SEO最佳实践",
            content: {
                description: "提升网站SEO的关键实践：",
                practices: [
                    {
                        title: "优化页面标题",
                        description: "每个页面有唯一、描述性的标题。",
                        example: `<!-- ✅ 好的标题 -->
<title>JavaScript闭包详解 - 概念、原理与应用 | 技术博客</title>

<!-- 标题原则：
     - 长度：50-60个字符
     - 包含主关键词
     - 品牌名称放最后
     - 每页标题唯一
-->`
                    },
                    {
                        title: "创建优质内容",
                        description: "内容是SEO的核心。",
                        example: `内容优化要点：
1. 原创、有价值
2. 定期更新
3. 合理使用关键词（不堆砌）
4. 结构清晰，易于阅读
5. 图文并茂
6. 回答用户问题`
                    },
                    {
                        title: "提升页面速度",
                        description: "速度影响排名和用户体验。",
                        example: `优化措施：
1. 压缩图片
2. 延迟加载
3. 最小化CSS/JS
4. 使用CDN
5. 启用压缩（gzip/brotli）
6. 减少HTTP请求`
                    },
                    {
                        title: "移动友好",
                        description: "移动优先索引。",
                        example: `<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 移动优化：
     - 响应式设计
     - 大号可点击元素（44x44px）
     - 可读的字体大小（16px+）
     - 快速加载
-->`
                    },
                    {
                        title: "使用HTTPS",
                        description: "HTTPS是排名因素。",
                        example: `<!-- 自动跳转到HTTPS -->
<script>
if (location.protocol !== 'https:') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
</script>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "技术SEO检查",
            content: {
                description: "技术层面的SEO优化：",
                practices: [
                    {
                        title: "robots.txt",
                        description: "控制搜索引擎爬取。",
                        example: `# robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml`
                    },
                    {
                        title: "sitemap.xml",
                        description: "帮助搜索引擎发现页面。",
                        example: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2024-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
                    },
                    {
                        title: "404页面",
                        description: "友好的错误页面。",
                        example: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>404 - 页面未找到 | 技术博客</title>
</head>
<body>
    <main>
        <h1>抱歉，页面未找到</h1>
        <p>您访问的页面不存在或已被移除。</p>
        
        <nav>
            <h2>您可能想访问：</h2>
            <ul>
                <li><a href="/">返回首页</a></li>
                <li><a href="/blog">查看博客</a></li>
                <li><a href="/search">搜索</a></li>
            </ul>
        </nav>
    </main>
</body>
</html>`
                    },
                    {
                        title: "URL结构",
                        description: "清晰、简短、描述性。",
                        example: `<!-- ✅ 好的URL -->
https://example.com/html5-tutorial
https://example.com/blog/javascript-closures

<!-- ❌ 不好的URL -->
https://example.com/page?id=123
https://example.com/article/2024/01/15/12345

<!-- URL优化原则：
     - 使用连字符（-）而非下划线
     - 小写字母
     - 包含关键词
     - 避免参数过多
     - 简短易记
-->`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "SEO优化检查清单",
            content: {
                description: "确保页面SEO优化到位：",
                items: [
                    { id: "check22-1", text: "每页有唯一的title标签（50-60字符）" },
                    { id: "check22-2", text: "每页有唯一的meta description（150-160字符）" },
                    { id: "check22-3", text: "使用语义化HTML标签" },
                    { id: "check22-4", text: "标题层级正确（一个h1，h2-h6有序）" },
                    { id: "check22-5", text: "所有图片有描述性alt属性" },
                    { id: "check22-6", text: "添加了结构化数据（JSON-LD）" },
                    { id: "check22-7", text: "URL清晰简洁" },
                    { id: "check22-8", text: "页面加载速度快" },
                    { id: "check22-9", text: "移动端友好" },
                    { id: "check22-10", text: "使用HTTPS" },
                    { id: "check22-11", text: "创建了sitemap.xml和robots.txt" },
                    { id: "check22-12", text: "内部链接使用描述性锚文本" },
                    { id: "check22-13", text: "通过Google Search Console验证" },
                    { id: "check22-14", text: "通过Lighthouse SEO审计" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "语义化实战", url: "content.html?chapter=21" },
        next: { title: "安全基础", url: "content.html?chapter=23" }
    }
};
