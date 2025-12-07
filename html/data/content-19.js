// 第19章：微格式与微数据 - 内容数据
window.htmlContentData_19 = {
    section: {
        title: "微格式与微数据",
        icon: "📊"
    },
    topics: [
        {
            type: "concept",
            title: "结构化数据概述",
            content: {
                description: "结构化数据帮助搜索引擎更好地理解网页内容，提升搜索结果的展示效果。微格式、微数据和JSON-LD是三种主要的结构化数据实现方式。",
                keyPoints: [
                    "结构化数据提升SEO和搜索结果展示",
                    "Schema.org定义了通用的数据词汇",
                    "微数据使用HTML属性标记",
                    "JSON-LD是推荐的实现方式",
                    "富文本摘要（Rich Snippets）增强展示",
                    "Google、Bing等搜索引擎支持"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Microdata"
            }
        },
        {
            type: "code-example",
            title: "Schema.org和微数据",
            content: {
                description: "使用微数据标记内容，帮助搜索引擎理解。",
                examples: [
                    {
                        title: "文章标记",
                        code: `<article itemscope itemtype="https://schema.org/Article">
    <header>
        <h1 itemprop="headline">HTML5完全指南</h1>
        <p>
            作者：<span itemprop="author" itemscope itemtype="https://schema.org/Person">
                <span itemprop="name">张三</span>
            </span>
        </p>
        <p>
            发布于：<time itemprop="datePublished" datetime="2024-01-15">
                2024年1月15日
            </time>
        </p>
    </header>
    
    <div itemprop="articleBody">
        <p>HTML5是现代Web开发的基础...</p>
    </div>
    
    <img itemprop="image" src="article-image.jpg" alt="文章配图">
</article>`,
                        notes: "itemscope定义范围，itemtype指定类型，itemprop标记属性"
                    },
                    {
                        title: "产品标记",
                        code: `<div itemscope itemtype="https://schema.org/Product">
    <h2 itemprop="name">MacBook Pro 16寸</h2>
    
    <img itemprop="image" src="macbook.jpg" alt="MacBook Pro">
    
    <p itemprop="description">
        强大的性能，专业的选择...
    </p>
    
    <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <span itemprop="priceCurrency" content="CNY">¥</span>
        <span itemprop="price" content="19999">19,999</span>
        <link itemprop="availability" href="https://schema.org/InStock">
        <span>现货</span>
    </div>
    
    <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
        评分：<span itemprop="ratingValue">4.5</span>/5
        (<span itemprop="reviewCount">128</span>条评价)
    </div>
</div>`,
                        notes: "产品标记可以显示价格、评分等"
                    },
                    {
                        title: "评论标记",
                        code: `<div itemscope itemtype="https://schema.org/Review">
    <div itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
        <meta itemprop="worstRating" content="1">
        <span itemprop="ratingValue">5</span>/
        <span itemprop="bestRating">5</span>星
    </div>
    
    <span itemprop="author" itemscope itemtype="https://schema.org/Person">
        <span itemprop="name">李四</span>
    </span>
    
    <time itemprop="datePublished" datetime="2024-01-10">
        2024年1月10日
    </time>
    
    <div itemprop="reviewBody">
        这款产品非常好用，强烈推荐！
    </div>
</div>`,
                        notes: "评论可以显示在搜索结果中"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "JSON-LD格式（推荐）",
            content: {
                description: "JSON-LD是Google推荐的结构化数据格式。",
                examples: [
                    {
                        title: "文章JSON-LD",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "HTML5完全指南",
  "image": "https://example.com/article-image.jpg",
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
  "dateModified": "2024-01-16",
  "description": "详细介绍HTML5的各种特性和最佳实践"
}
</script>`,
                        notes: "JSON-LD不影响HTML结构，易于维护"
                    },
                    {
                        title: "产品JSON-LD",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "MacBook Pro 16寸",
  "image": "https://example.com/macbook.jpg",
  "description": "强大的性能，专业的选择",
  "brand": {
    "@type": "Brand",
    "name": "Apple"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product/macbook",
    "priceCurrency": "CNY",
    "price": "19999",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Apple Store"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "128"
  }
}
</script>`,
                        notes: "产品数据可以显示富文本摘要"
                    },
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
      "name": "产品",
      "item": "https://example.com/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "笔记本电脑",
      "item": "https://example.com/products/laptops"
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
        "text": "HTML5是最新版本的HTML标准，增加了许多新特性..."
      }
    },
    {
      "@type": "Question",
      "name": "如何学习HTML5？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "学习HTML5可以从基础标签开始，然后逐步学习..."
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
            type: "code-example",
            title: "常用Schema类型",
            content: {
                description: "Schema.org提供了多种常用的数据类型。",
                examples: [
                    {
                        title: "组织/公司",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "某某科技有限公司",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-10-12345678",
    "contactType": "客户服务",
    "areaServed": "CN",
    "availableLanguage": ["zh-CN", "en"]
  },
  "sameAs": [
    "https://www.facebook.com/example",
    "https://www.twitter.com/example",
    "https://www.linkedin.com/company/example"
  ]
}
</script>`,
                        notes: "组织信息可以显示在知识图谱中"
                    },
                    {
                        title: "本地商家",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "张三餐厅",
  "image": "https://example.com/restaurant.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "朝阳区某某街123号",
    "addressLocality": "北京",
    "addressRegion": "BJ",
    "postalCode": "100000",
    "addressCountry": "CN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "39.9042",
    "longitude": "116.4074"
  },
  "telephone": "+86-10-87654321",
  "openingHours": "Mo-Su 11:00-22:00",
  "priceRange": "¥¥"
}
</script>`,
                        notes: "本地商家可以显示在地图搜索中"
                    },
                    {
                        title: "活动",
                        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Web开发技术大会",
  "startDate": "2024-03-15T09:00:00+08:00",
  "endDate": "2024-03-15T18:00:00+08:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "北京国际会议中心",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "朝阳区某某路456号",
      "addressLocality": "北京",
      "addressCountry": "CN"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "技术协会"
  }
}
</script>`,
                        notes: "活动信息可以显示日期、地点等"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "结构化数据最佳实践",
            content: {
                description: "正确使用结构化数据：",
                practices: [
                    {
                        title: "使用JSON-LD",
                        description: "Google推荐使用JSON-LD格式。",
                        example: `<!-- ✅ 推荐：JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题"
}
</script>

<!-- 可以，但不推荐：微数据 -->
<article itemscope itemtype="https://schema.org/Article">
    <h1 itemprop="headline">文章标题</h1>
</article>`
                    },
                    {
                        title: "验证结构化数据",
                        description: "使用Google的测试工具验证。",
                        example: `<!-- 验证工具：
     - Google Rich Results Test
     - Schema Markup Validator
     - 检查是否有错误
     - 预览搜索结果展示
-->`
                    },
                    {
                        title: "提供完整信息",
                        description: "填写所有必需和推荐的属性。",
                        example: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "标题（必需）",
  "image": "图片URL（必需）",
  "datePublished": "2024-01-15（必需）",
  "dateModified": "2024-01-16（推荐）",
  "author": {...}（推荐）,
  "publisher": {...}（必需）
}`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "结构化数据检查清单",
            content: {
                description: "确保结构化数据正确实现：",
                items: [
                    { id: "check19-1", text: "使用了JSON-LD格式" },
                    { id: "check19-2", text: "选择了正确的Schema类型" },
                    { id: "check19-3", text: "提供了所有必需属性" },
                    { id: "check19-4", text: "通过了Google富文本测试" },
                    { id: "check19-5", text: "数据与页面内容一致" },
                    { id: "check19-6", text: "图片URL使用绝对路径" },
                    { id: "check19-7", text: "日期使用ISO 8601格式" },
                    { id: "check19-8", text: "价格包含货币代码" },
                    { id: "check19-9", text: "没有标记不可见内容" },
                    { id: "check19-10", text: "定期检查搜索结果展示" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "HTML5语义化标签", url: "content.html?chapter=18" },
        next: { title: "ARIA可访问性", url: "content.html?chapter=20" }
    }
};
