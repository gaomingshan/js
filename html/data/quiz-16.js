// 第16章：SEO优化 - 面试题
window.htmlQuizData_16 = {
    config: {
        title: "SEO优化",
        icon: "🔍",
        description: "测试你对搜索引擎优化的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["基础", "meta标签"],
            question: "哪些meta标签对SEO重要？",
            type: "multiple-choice",
            options: [
                "title标签",
                "description元描述",
                "keywords关键词",
                "viewport视口"
            ],
            correctAnswer: ["A", "B"],
            explanation: {
                title: "SEO相关meta标签",
                description: "正确设置meta标签有助于SEO。",
                sections: [
                    {
                        title: "title标签",
                        code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <!-- 最重要的SEO标签 -->\n  <title>页面标题 - 网站名称</title>\n</head>\n</html>',
                        points: [
                            "55-60个字符最佳",
                            "包含主要关键词",
                            "每个页面唯一",
                            "格式：页面标题 - 网站名称",
                            "搜索结果的标题"
                        ]
                    },
                    {
                        title: "description",
                        code: '<head>\n  <title>HTML教程 - 前端学习网</title>\n  <meta name="description" \n        content="全面的HTML教程，包含HTML5新特性、语义化标签、表单、多媒体等内容。适合初学者和进阶开发者。">\n</head>',
                        points: [
                            "150-160个字符",
                            "简洁描述页面内容",
                            "包含关键词",
                            "吸引用户点击",
                            "搜索结果的摘要"
                        ]
                    },
                    {
                        title: "keywords（已不重要）",
                        code: '<meta name="keywords" content="HTML, HTML5, 前端, 教程">',
                        points: [
                            "Google已忽略",
                            "可能被滥用",
                            "不建议花时间",
                            "历史遗留"
                        ]
                    },
                    {
                        title: "其他重要meta",
                        code: '<head>\n  <!-- 字符集 -->\n  <meta charset="UTF-8">\n  \n  <!-- 视口（移动端SEO） -->\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  \n  <!-- 语言 -->\n  <html lang="zh-CN">\n  \n  <!-- robots（索引控制） -->\n  <meta name="robots" content="index, follow">\n  <!-- noindex, nofollow: 不索引，不跟踪链接 -->\n  \n  <!-- canonical（规范链接） -->\n  <link rel="canonical" href="https://example.com/page">\n  \n  <!-- 作者 -->\n  <meta name="author" content="作者名">\n</head>',
                        content: "这些meta标签也很重要。"
                    },
                    {
                        title: "Open Graph（社交分享）",
                        code: '<head>\n  <!-- Facebook/LinkedIn等 -->\n  <meta property="og:title" content="页面标题">\n  <meta property="og:description" content="页面描述">\n  <meta property="og:image" content="https://example.com/image.jpg">\n  <meta property="og:url" content="https://example.com/page">\n  <meta property="og:type" content="website">\n  \n  <!-- Twitter -->\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="页面标题">\n  <meta name="twitter:description" content="页面描述">\n  <meta name="twitter:image" content="https://example.com/image.jpg">\n</head>',
                        content: "优化社交媒体分享效果。"
                    }
                ]
            },
            source: "SEO最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["语义化", "结构"],
            question: "语义化HTML对SEO的影响？",
            type: "multiple-choice",
            options: [
                "帮助搜索引擎理解内容",
                "标题层级很重要",
                "使用正确的HTML5标签",
                "避免过度使用div"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "语义化与SEO",
                description: "语义化HTML能提升SEO效果。",
                sections: [
                    {
                        title: "标题层级",
                        code: '<!-- 正确的标题结构 -->\n<body>\n  <h1>页面主标题</h1>\n  \n  <section>\n    <h2>第一部分</h2>\n    <h3>子章节1.1</h3>\n    <h3>子章节1.2</h3>\n  </section>\n  \n  <section>\n    <h2>第二部分</h2>\n    <h3>子章节2.1</h3>\n  </section>\n</body>\n\n<!-- 错误：跳级 -->\n<h1>标题</h1>\n<h3>子标题</h3>  <!-- 跳过h2 -->\n\n<!-- 错误：多个h1 -->\n<h1>标题1</h1>\n<h1>标题2</h1>  <!-- 一个页面只应有一个h1 -->',
                        points: [
                            "h1：页面主标题（唯一）",
                            "不要跳级",
                            "符合逻辑层级",
                            "搜索引擎重视h1-h6",
                            "标题包含关键词"
                        ]
                    },
                    {
                        title: "语义化标签",
                        code: '<!-- SEO友好的结构 -->\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <title>文章标题</title>\n</head>\n<body>\n  <header>\n    <nav>\n      <a href="/">首页</a>\n      <a href="/articles">文章</a>\n    </nav>\n  </header>\n  \n  <main>\n    <article>\n      <header>\n        <h1>文章标题</h1>\n        <time datetime="2024-01-15">2024年1月15日</time>\n      </header>\n      \n      <section>\n        <h2>第一节</h2>\n        <p>内容...</p>\n      </section>\n      \n      <section>\n        <h2>第二节</h2>\n        <p>内容...</p>\n      </section>\n    </article>\n  </main>\n  \n  <footer>\n    <p>&copy; 2024 网站名称</p>\n  </footer>\n</body>\n</html>',
                        content: "使用语义化标签构建清晰的文档结构。"
                    },
                    {
                        title: "强调标签",
                        code: '<!-- strong：重要内容 -->\n<p>这是<strong>非常重要</strong>的内容。</p>\n\n<!-- em：强调语气 -->\n<p>我<em>真的</em>很喜欢这个。</p>\n\n<!-- 不要仅为样式使用 -->\n<p>这是<b>粗体</b>文字。</p>  <!-- 仅样式，无语义 -->\n<p>这是<i>斜体</i>文字。</p>  <!-- 仅样式，无语义 -->',
                        content: "合理使用强调标签。"
                    },
                    {
                        title: "列表",
                        code: '<!-- 有序列表 -->\n<ol>\n  <li>第一步</li>\n  <li>第二步</li>\n  <li>第三步</li>\n</ol>\n\n<!-- 无序列表 -->\n<ul>\n  <li>特点一</li>\n  <li>特点二</li>\n</ul>\n\n<!-- 定义列表 -->\n<dl>\n  <dt>HTML</dt>\n  <dd>超文本标记语言</dd>\n  \n  <dt>CSS</dt>\n  <dd>层叠样式表</dd>\n</dl>',
                        content: "列表帮助搜索引擎理解内容结构。"
                    }
                ]
            },
            source: "SEO最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["链接", "内链"],
            question: "如何优化链接以提升SEO？",
            type: "multiple-choice",
            options: [
                "使用描述性锚文本",
                "内部链接建设",
                "nofollow控制权重",
                "避免过多外链"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "链接优化",
                description: "链接是SEO的重要因素。",
                sections: [
                    {
                        title: "锚文本优化",
                        code: '<!-- 不好的锚文本 -->\n<a href="/html-tutorial">点击这里</a>\n<a href="/css-guide">更多</a>\n<a href="/js-course">阅读全文</a>\n\n<!-- 好的锚文本 -->\n<a href="/html-tutorial">HTML完整教程</a>\n<a href="/css-guide">CSS布局指南</a>\n<a href="/js-course">JavaScript进阶课程</a>',
                        points: [
                            "描述性文字",
                            "包含关键词",
                            "避免点击这里",
                            "简短但有意义",
                            "与目标页面相关"
                        ]
                    },
                    {
                        title: "内部链接",
                        code: '<!-- 文章中的内部链接 -->\n<article>\n  <h1>HTML表单详解</h1>\n  <p>\n    在学习表单之前，建议先了解\n    <a href="/html-basics">HTML基础知识</a>。\n    表单中常用的<a href="/html-input">input标签</a>\n    有很多类型...\n  </p>\n</article>\n\n<!-- 相关文章 -->\n<aside>\n  <h3>相关阅读</h3>\n  <ul>\n    <li><a href="/form-validation">表单验证</a></li>\n    <li><a href="/form-styling">表单样式</a></li>\n  </ul>\n</aside>',
                        points: [
                            "合理的内链结构",
                            "帮助搜索引擎爬取",
                            "分配页面权重",
                            "提升用户体验",
                            "不要过度内链"
                        ]
                    },
                    {
                        title: "nofollow和rel属性",
                        code: '<!-- 外部链接 -->\n<a href="https://example.com" \n   target="_blank"\n   rel="noopener noreferrer">\n  外部网站\n</a>\n\n<!-- 不传递权重的链接 -->\n<a href="https://spam-site.com" rel="nofollow">\n  不可信链接\n</a>\n\n<!-- 赞助链接 -->\n<a href="https://sponsor.com" rel="sponsored">\n  赞助商\n</a>\n\n<!-- UGC链接 -->\n<a href="https://user-content.com" rel="ugc">\n  用户生成内容\n</a>',
                        points: [
                            "nofollow：不传递权重",
                            "sponsored：标记赞助",
                            "ugc：用户生成内容",
                            "noopener：安全性",
                            "external：外部链接"
                        ]
                    },
                    {
                        title: "面包屑导航",
                        code: '<!-- 面包屑 -->\n<nav aria-label="面包屑">\n  <ol itemscope itemtype="https://schema.org/BreadcrumbList">\n    <li itemprop="itemListElement" itemscope\n        itemtype="https://schema.org/ListItem">\n      <a itemprop="item" href="/">\n        <span itemprop="name">首页</span>\n      </a>\n      <meta itemprop="position" content="1" />\n    </li>\n    <li itemprop="itemListElement" itemscope\n        itemtype="https://schema.org/ListItem">\n      <a itemprop="item" href="/category">\n        <span itemprop="name">分类</span>\n      </a>\n      <meta itemprop="position" content="2" />\n    </li>\n    <li itemprop="itemListElement" itemscope\n        itemtype="https://schema.org/ListItem">\n      <span itemprop="name">当前页</span>\n      <meta itemprop="position" content="3" />\n    </li>\n  </ol>\n</nav>',
                        content: "面包屑有利于SEO和用户体验。"
                    }
                ]
            },
            source: "SEO最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["结构化数据", "Schema.org"],
            question: "什么是结构化数据？如何实现？",
            type: "multiple-choice",
            options: [
                "帮助搜索引擎理解内容",
                "支持富媒体搜索结果",
                "使用JSON-LD格式",
                "遵循Schema.org规范"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "结构化数据",
                description: "结构化数据能获得更好的搜索展示。",
                sections: [
                    {
                        title: "什么是结构化数据",
                        content: "结构化数据是一种标准化格式，用于向搜索引擎提供明确的页面信息，帮助搜索引擎更好地理解内容。",
                        points: [
                            "丰富搜索结果",
                            "提升点击率",
                            "更好的搜索展示",
                            "语音搜索优化",
                            "知识图谱"
                        ]
                    },
                    {
                        title: "JSON-LD格式（推荐）",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>文章标题</title>\n  \n  <!-- 文章结构化数据 -->\n  <script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@type": "Article",\n    "headline": "HTML语义化标签详解",\n    "image": "https://example.com/image.jpg",\n    "author": {\n      "@type": "Person",\n      "name": "张三"\n    },\n    "publisher": {\n      "@type": "Organization",\n      "name": "前端学习网",\n      "logo": {\n        "@type": "ImageObject",\n        "url": "https://example.com/logo.png"\n      }\n    },\n    "datePublished": "2024-01-15",\n    "dateModified": "2024-01-16"\n  }\n  </script>\n</head>\n<body>\n  <!-- 页面内容 -->\n</body>\n</html>',
                        content: "JSON-LD是Google推荐的格式。"
                    },
                    {
                        title: "面包屑导航",
                        code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "BreadcrumbList",\n  "itemListElement": [\n    {\n      "@type": "ListItem",\n      "position": 1,\n      "name": "首页",\n      "item": "https://example.com"\n    },\n    {\n      "@type": "ListItem",\n      "position": 2,\n      "name": "教程",\n      "item": "https://example.com/tutorials"\n    },\n    {\n      "@type": "ListItem",\n      "position": 3,\n      "name": "HTML",\n      "item": "https://example.com/tutorials/html"\n    }\n  ]\n}\n</script>',
                        content: "面包屑结构化数据。"
                    },
                    {
                        title: "产品信息",
                        code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "产品名称",\n  "image": "https://example.com/product.jpg",\n  "description": "产品描述",\n  "brand": {\n    "@type": "Brand",\n    "name": "品牌名"\n  },\n  "offers": {\n    "@type": "Offer",\n    "url": "https://example.com/product",\n    "priceCurrency": "CNY",\n    "price": "99.00",\n    "availability": "https://schema.org/InStock"\n  },\n  "aggregateRating": {\n    "@type": "AggregateRating",\n    "ratingValue": "4.5",\n    "reviewCount": "100"\n  }\n}\n</script>',
                        content: "产品页面的结构化数据。"
                    },
                    {
                        title: "FAQ",
                        code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "什么是HTML？",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "HTML是超文本标记语言..."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "如何学习HTML？",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "建议先学习基础标签..."\n      }\n    }\n  ]\n}\n</script>',
                        content: "FAQ页面可获得富媒体展示。"
                    },
                    {
                        title: "视频",
                        code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "VideoObject",\n  "name": "HTML教程 - 第1集",\n  "description": "HTML基础入门教程",\n  "thumbnailUrl": "https://example.com/thumb.jpg",\n  "uploadDate": "2024-01-15",\n  "duration": "PT10M30S",\n  "contentUrl": "https://example.com/video.mp4",\n  "embedUrl": "https://example.com/embed/video"\n}\n</script>',
                        content: "视频内容的结构化数据。"
                    },
                    {
                        title: "测试工具",
                        points: [
                            "Google富媒体搜索结果测试",
                            "Schema.org验证器",
                            "Google Search Console",
                            "查看搜索结果预览"
                        ]
                    }
                ]
            },
            source: "Schema.org"
        },
        {
            difficulty: "medium",
            tags: ["URL", "网站结构"],
            question: "SEO友好的URL结构是什么样的？",
            type: "multiple-choice",
            options: [
                "简短且描述性",
                "包含关键词",
                "使用连字符分隔",
                "避免参数过多"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "URL优化",
                description: "URL是SEO的重要排名因素。",
                sections: [
                    {
                        title: "好的URL vs 坏的URL",
                        code: '<!-- 不好的URL -->\nhttps://example.com/page.php?id=123&cat=5&page=2\nhttps://example.com/产品/详情?id=456\nhttps://example.com/p/a/g/e/s/article.html\n\n<!-- 好的URL -->\nhttps://example.com/html-tutorial\nhttps://example.com/tutorials/html/semantic-tags\nhttps://example.com/blog/2024/01/seo-best-practices',
                        points: [
                            "简短易记",
                            "描述性强",
                            "包含关键词",
                            "层级清晰",
                            "小写字母",
                            "使用连字符-而非下划线_"
                        ]
                    },
                    {
                        title: "URL结构",
                        code: '<!-- 扁平结构（推荐） -->\nhttps://example.com/category/product-name\n\n<!-- 过深的层级（不推荐） -->\nhttps://example.com/shop/category/subcategory/sub-subcategory/product\n\n<!-- 日期归档 -->\nhttps://example.com/blog/2024/01/article-title\n\n<!-- 产品页 -->\nhttps://example.com/products/smartphone-model-x\n\n<!-- 文章页 -->\nhttps://example.com/articles/html-semantic-tags',
                        points: [
                            "不超过3-4层",
                            "分类明确",
                            "可预测性",
                            "便于分享"
                        ]
                    },
                    {
                        title: "URL参数",
                        code: '<!-- 尽量避免 -->\n/search?q=html&sort=date&page=2\n\n<!-- 改为路径 -->\n/search/html/sort-date/page-2\n\n<!-- 或使用History API -->\n/search/html  <!-- URL不变 -->\n// 用pushState管理状态',
                        content: "参数过多不利于SEO。"
                    },
                    {
                        title: "重定向",
                        code: '<!-- .htaccess（Apache） -->\nRewriteEngine On\n\n# 301永久重定向\nRedirect 301 /old-page.html /new-page\n\n# www到非www\nRewriteCond %{HTTP_HOST} ^www\\.example\\.com [NC]\nRewriteRule ^(.*)$ https://example.com/$1 [L,R=301]\n\n# http到https\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
                        content: "正确使用301重定向。"
                    },
                    {
                        title: "规范链接",
                        code: '<!-- 防止重复内容 -->\n<head>\n  <link rel="canonical" href="https://example.com/article">\n</head>\n\n<!-- 场景 -->\n<!-- 原始页面 -->\nhttps://example.com/article\n\n<!-- 分页 -->\nhttps://example.com/article?page=2\n\n<!-- 追踪参数 -->\nhttps://example.com/article?utm_source=twitter\n\n<!-- 都应指向canonical -->\n<link rel="canonical" href="https://example.com/article">',
                        content: "canonical标签指定首选URL。"
                    }
                ]
            },
            source: "SEO最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["性能", "Core Web Vitals"],
            question: "页面性能如何影响SEO？",
            type: "multiple-choice",
            options: [
                "Core Web Vitals是排名因素",
                "页面加载速度影响排名",
                "移动端友好性很重要",
                "HTTPS是必需的"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "性能与SEO",
                description: "页面性能直接影响SEO排名。",
                sections: [
                    {
                        title: "Core Web Vitals",
                        points: [
                            "LCP（Largest Contentful Paint）：最大内容绘制 < 2.5s",
                            "FID（First Input Delay）：首次输入延迟 < 100ms",
                            "CLS（Cumulative Layout Shift）：累积布局偏移 < 0.1",
                            "Google将其作为排名因素",
                            "可在Search Console查看"
                        ]
                    },
                    {
                        title: "加载速度优化",
                        code: '<!-- 1. 压缩资源 -->\n<link rel="stylesheet" href="style.min.css">\n<script src="script.min.js" defer></script>\n\n<!-- 2. 图片优化 -->\n<img src="image.webp" \n     alt="描述"\n     loading="lazy"\n     width="800" \n     height="600">\n\n<!-- 3. 预加载关键资源 -->\n<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="hero.jpg" as="image">\n\n<!-- 4. DNS预解析 -->\n<link rel="dns-prefetch" href="https://cdn.example.com">\n\n<!-- 5. 预连接 -->\n<link rel="preconnect" href="https://fonts.googleapis.com">',
                        content: "多种方式优化加载速度。"
                    },
                    {
                        title: "移动端优化",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <!-- 响应式视口 -->\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  \n  <!-- 移动端友好 -->\n  <style>\n  body {\n    font-size: 16px;  /* 至少16px */\n  }\n  \n  button {\n    min-height: 48px;  /* 足够的点击区域 */\n    min-width: 48px;\n  }\n  \n  @media (max-width: 768px) {\n    /* 移动端样式 */\n  }\n  </style>\n</head>\n<body>\n  <!-- 内容 -->\n</body>\n</html>',
                        points: [
                            "响应式设计",
                            "移动端优先索引",
                            "避免Flash等",
                            "文字大小适中",
                            "点击目标足够大"
                        ]
                    },
                    {
                        title: "HTTPS",
                        code: '<!-- HTTP（不安全） -->\nhttp://example.com\n\n<!-- HTTPS（安全） -->\nhttps://example.com\n\n<!-- 强制HTTPS -->\n<meta http-equiv="Content-Security-Policy" \n      content="upgrade-insecure-requests">',
                        points: [
                            "Google排名因素",
                            "浏览器显示安全",
                            "用户信任",
                            "HTTP/2支持",
                            "免费证书：Let's Encrypt"
                        ]
                    },
                    {
                        title: "测试工具",
                        points: [
                            "Google PageSpeed Insights",
                            "Lighthouse",
                            "WebPageTest",
                            "Chrome DevTools",
                            "Google Search Console"
                        ]
                    }
                ]
            },
            source: "Google Search"
        },
        {
            difficulty: "hard",
            tags: ["sitemap", "robots.txt"],
            question: "sitemap和robots.txt的作用？",
            type: "multiple-choice",
            options: [
                "sitemap帮助爬虫发现页面",
                "robots.txt控制爬取",
                "都放在网站根目录",
                "向搜索引擎提交sitemap"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Sitemap和Robots.txt",
                description: "帮助搜索引擎更好地爬取网站。",
                sections: [
                    {
                        title: "robots.txt",
                        code: '# https://example.com/robots.txt\n\n# 允许所有爬虫\nUser-agent: *\nAllow: /\n\n# 禁止爬取某些目录\nDisallow: /admin/\nDisallow: /private/\nDisallow: /api/\n\n# 爬取延迟（秒）\nCrawl-delay: 10\n\n# Sitemap位置\nSitemap: https://example.com/sitemap.xml\n\n# 特定爬虫规则\nUser-agent: Googlebot\nDisallow: /temp/\n\nUser-agent: Bingbot\nDisallow: /staging/\n\n# 禁止所有爬虫\nUser-agent: *\nDisallow: /',
                        points: [
                            "位于网站根目录",
                            "控制爬虫行为",
                            "不是安全机制",
                            "重要页面不要Disallow"
                        ]
                    },
                    {
                        title: "XML Sitemap",
                        code: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n    <lastmod>2024-01-15</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://example.com/about</loc>\n    <lastmod>2024-01-10</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://example.com/blog/article-1</loc>\n    <lastmod>2024-01-15</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>',
                        points: [
                            "列出所有重要页面",
                            "lastmod：最后修改时间",
                            "changefreq：更新频率",
                            "priority：页面优先级（0.0-1.0）",
                            "最多50000个URL"
                        ]
                    },
                    {
                        title: "Sitemap索引",
                        code: '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>https://example.com/sitemap-posts.xml</loc>\n    <lastmod>2024-01-15</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>https://example.com/sitemap-pages.xml</loc>\n    <lastmod>2024-01-10</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>https://example.com/sitemap-products.xml</loc>\n    <lastmod>2024-01-14</lastmod>\n  </sitemap>\n</sitemapindex>',
                        content: "大型网站可以分割sitemap。"
                    },
                    {
                        title: "提交Sitemap",
                        code: '<!-- HTML中引用 -->\n<head>\n  <link rel="sitemap" \n        type="application/xml" \n        href="/sitemap.xml">\n</head>\n\n<!-- robots.txt中指定 -->\nSitemap: https://example.com/sitemap.xml\n\n# 通过ping提交\nhttps://www.google.com/ping?sitemap=https://example.com/sitemap.xml\nhttps://www.bing.com/ping?sitemap=https://example.com/sitemap.xml\n\n# Search Console提交\n# Google Search Console > Sitemaps > 添加新的站点地图',
                        content: "多种方式提交sitemap。"
                    },
                    {
                        title: "生成工具",
                        points: [
                            "在线生成器：xml-sitemaps.com",
                            "插件：WordPress等CMS",
                            "程序生成：Node.js、Python等",
                            "自动更新最佳"
                        ]
                    }
                ]
            },
            source: "SEO最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["内容优化", "关键词"],
            question: "如何优化页面内容以提升SEO？",
            type: "multiple-choice",
            options: [
                "优质原创内容",
                "合理使用关键词",
                "内容长度适中",
                "定期更新"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "内容优化",
                description: "内容是SEO的核心。",
                sections: [
                    {
                        title: "内容质量",
                        points: [
                            "原创且有价值",
                            "满足用户需求",
                            "深度和广度",
                            "避免重复内容",
                            "定期更新维护",
                            "E-A-T：专业性、权威性、可信度"
                        ]
                    },
                    {
                        title: "关键词使用",
                        code: '<!-- 自然融入关键词 -->\n<article>\n  <h1>HTML语义化标签详解</h1>\n  \n  <p>\n    <strong>HTML语义化标签</strong>是现代网页开发的重要概念。\n    本文将详细介绍常用的语义化标签及其最佳实践。\n  </p>\n  \n  <h2>什么是语义化标签</h2>\n  <p>\n    语义化标签能够明确表达内容的含义...\n  </p>\n  \n  <h2>常用的语义化标签</h2>\n  <ul>\n    <li>&lt;header&gt; - 页眉</li>\n    <li>&lt;nav&gt; - 导航</li>\n    <li>&lt;main&gt; - 主内容</li>\n  </ul>\n</article>',
                        points: [
                            "标题中包含主关键词",
                            "前100字包含关键词",
                            "自然分布，不堆砌",
                            "使用相关词和同义词",
                            "关键词密度1-2%"
                        ]
                    },
                    {
                        title: "内容结构",
                        code: '<!-- 清晰的结构 -->\n<article>\n  <header>\n    <h1>主标题（关键词）</h1>\n    <p>简介（包含关键词）</p>\n  </header>\n  \n  <section>\n    <h2>第一部分</h2>\n    <p>段落1...</p>\n    <p>段落2...</p>\n  </section>\n  \n  <section>\n    <h2>第二部分</h2>\n    <p>内容...</p>\n    <ul>\n      <li>要点1</li>\n      <li>要点2</li>\n    </ul>\n  </section>\n  \n  <footer>\n    <p>总结...</p>\n  </footer>\n</article>',
                        points: [
                            "清晰的层级",
                            "段落分明",
                            "列表总结要点",
                            "小标题分隔",
                            "可扫描性"
                        ]
                    },
                    {
                        title: "内容长度",
                        points: [
                            "没有固定标准",
                            "取决于主题",
                            "全面覆盖主题",
                            "长内容通常排名更好",
                            "质量>数量",
                            "1000-2000字是常见范围"
                        ]
                    },
                    {
                        title: "多媒体内容",
                        code: '<!-- 图片 -->\n<figure>\n  <img src="semantic-tags.png" \n       alt="HTML语义化标签示意图"\n       width="800"\n       height="600">\n  <figcaption>图1：常用语义化标签</figcaption>\n</figure>\n\n<!-- 视频 -->\n<video controls width="640" height="360">\n  <source src="tutorial.mp4" type="video/mp4">\n  <track kind="captions" src="captions.vtt" srclang="zh" label="中文">\n  您的浏览器不支持video标签。\n</video>',
                        points: [
                            "丰富内容形式",
                            "提升用户体验",
                            "增加停留时间",
                            "优化图片和视频",
                            "添加替代文本"
                        ]
                    }
                ]
            },
            source: "SEO最佳实践"
        }
    ],
    navigation: {
        prev: { title: "可访问性", url: "15-accessibility-quiz.html" },
        next: { title: "性能优化", url: "17-performance-quiz.html" }
    }
};
