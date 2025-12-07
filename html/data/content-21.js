// 第21章：语义化实战 - 内容数据
window.htmlContentData_21 = {
    section: {
        title: "语义化实战",
        icon: "🎯"
    },
    topics: [
        {
            type: "concept",
            title: "语义化实战概述",
            content: {
                description: "将语义化HTML、ARIA、微数据等知识综合应用到实际项目中，构建既美观又可访问的Web页面。",
                keyPoints: [
                    "综合运用语义化标签",
                    "结构化数据提升SEO",
                    "ARIA增强可访问性",
                    "响应式设计考虑",
                    "性能优化",
                    "跨浏览器兼容"
                ]
            }
        },
        {
            type: "code-example",
            title: "博客文章页面",
            content: {
                description: "一个完整的博客文章页面示例。",
                examples: [
                    {
                        title: "HTML结构",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML5语义化完全指南 - 技术博客</title>
    <meta name="description" content="详细介绍HTML5语义化标签的使用方法和最佳实践">
    
    <!-- 结构化数据 -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "HTML5语义化完全指南",
      "image": "https://example.com/article-image.jpg",
      "author": {
        "@type": "Person",
        "name": "张三"
      },
      "datePublished": "2024-01-15",
      "dateModified": "2024-01-16"
    }
    </script>
</head>
<body>
    <!-- 页面级header -->
    <header class="site-header">
        <div class="container">
            <a href="/" class="logo">
                <img src="logo.svg" alt="技术博客">
            </a>
            
            <nav aria-label="主导航">
                <ul>
                    <li><a href="/">首页</a></li>
                    <li><a href="/blog" aria-current="page">博客</a></li>
                    <li><a href="/about">关于</a></li>
                </ul>
            </nav>
            
            <form role="search" action="/search">
                <label for="search">搜索</label>
                <input type="search" 
                       id="search" 
                       name="q"
                       placeholder="搜索文章...">
                <button type="submit">搜索</button>
            </form>
        </div>
    </header>
    
    <!-- 面包屑导航 -->
    <nav aria-label="面包屑">
        <ol>
            <li><a href="/">首页</a></li>
            <li><a href="/blog">博客</a></li>
            <li aria-current="page">HTML5语义化完全指南</li>
        </ol>
    </nav>
    
    <!-- 主内容 -->
    <main class="container">
        <article>
            <!-- 文章header -->
            <header>
                <h1>HTML5语义化完全指南</h1>
                
                <div class="article-meta">
                    <time datetime="2024-01-15T10:00:00+08:00">
                        2024年1月15日
                    </time>
                    
                    <address class="author">
                        作者：<a href="/author/zhangsan" rel="author">张三</a>
                    </address>
                    
                    <p>阅读时间：约10分钟</p>
                </div>
                
                <img src="article-header.jpg" 
                     alt="HTML5语义化标签示意图"
                     class="article-image">
            </header>
            
            <!-- 文章摘要 -->
            <div class="article-summary">
                <p>本文详细介绍HTML5的语义化标签，包括使用方法、最佳实践等内容。</p>
            </div>
            
            <!-- 目录 -->
            <nav class="table-of-contents" aria-labelledby="toc-heading">
                <h2 id="toc-heading">目录</h2>
                <ol>
                    <li><a href="#intro">引言</a></li>
                    <li><a href="#semantic-tags">语义化标签</a></li>
                    <li><a href="#best-practices">最佳实践</a></li>
                </ol>
            </nav>
            
            <!-- 文章内容 -->
            <div class="article-content">
                <section id="intro">
                    <h2>引言</h2>
                    <p>语义化HTML是现代Web开发的重要原则...</p>
                </section>
                
                <section id="semantic-tags">
                    <h2>语义化标签</h2>
                    <p>HTML5引入了许多新的语义化标签...</p>
                    
                    <aside class="note" role="note">
                        <h3>💡 提示</h3>
                        <p>语义化标签不影响页面外观，主要提升可访问性和SEO。</p>
                    </aside>
                </section>
                
                <section id="best-practices">
                    <h2>最佳实践</h2>
                    <p>使用语义化标签时应遵循以下原则...</p>
                </section>
            </div>
            
            <!-- 文章footer -->
            <footer>
                <div class="tags">
                    <h3>标签</h3>
                    <ul>
                        <li><a href="/tag/html" rel="tag">HTML</a></li>
                        <li><a href="/tag/semantic" rel="tag">语义化</a></li>
                        <li><a href="/tag/tutorial" rel="tag">教程</a></li>
                    </ul>
                </div>
                
                <div class="share">
                    <h3>分享</h3>
                    <a href="#" aria-label="分享到微博">微博</a>
                    <a href="#" aria-label="分享到微信">微信</a>
                </div>
            </footer>
        </article>
        
        <!-- 相关文章 -->
        <section aria-labelledby="related-heading">
            <h2 id="related-heading">相关文章</h2>
            <div class="article-grid">
                <article>
                    <h3><a href="/article2">CSS布局技巧</a></h3>
                    <p>介绍现代CSS布局方法...</p>
                </article>
            </div>
        </section>
        
        <!-- 评论区 -->
        <section class="comments" aria-labelledby="comments-heading">
            <h2 id="comments-heading">评论 (3)</h2>
            
            <form class="comment-form">
                <h3>发表评论</h3>
                <label for="comment-name">姓名</label>
                <input type="text" id="comment-name" required>
                
                <label for="comment-text">评论</label>
                <textarea id="comment-text" rows="5" required></textarea>
                
                <button type="submit">提交评论</button>
            </form>
            
            <div class="comment-list">
                <article class="comment">
                    <header>
                        <img src="avatar1.jpg" alt="">
                        <h4>用户A</h4>
                        <time datetime="2024-01-15T14:30">1小时前</time>
                    </header>
                    <p>文章写得很好！</p>
                </article>
            </div>
        </section>
    </main>
    
    <!-- 侧边栏 -->
    <aside class="sidebar">
        <section aria-labelledby="popular-heading">
            <h2 id="popular-heading">热门文章</h2>
            <ul>
                <li><a href="/popular1">文章1</a></li>
                <li><a href="/popular2">文章2</a></li>
            </ul>
        </section>
        
        <section aria-labelledby="categories-heading">
            <h2 id="categories-heading">分类</h2>
            <nav aria-label="文章分类">
                <ul>
                    <li><a href="/category/html">HTML</a></li>
                    <li><a href="/category/css">CSS</a></li>
                    <li><a href="/category/js">JavaScript</a></li>
                </ul>
            </nav>
        </section>
    </aside>
    
    <!-- 页脚 -->
    <footer class="site-footer">
        <div class="container">
            <nav aria-label="页脚导航">
                <ul>
                    <li><a href="/privacy">隐私政策</a></li>
                    <li><a href="/terms">使用条款</a></li>
                    <li><a href="/contact">联系我们</a></li>
                </ul>
            </nav>
            
            <p>&copy; 2024 技术博客. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
                        notes: "完整的语义化博客页面结构"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "电商产品页面",
            content: {
                description: "电商网站产品详情页的语义化实现。",
                examples: [
                    {
                        title: "产品页面结构",
                        code: `<main class="product-page">
    <!-- 产品信息 -->
    <article itemscope itemtype="https://schema.org/Product">
        <header>
            <h1 itemprop="name">MacBook Pro 16寸</h1>
            
            <div class="product-rating" 
                 itemprop="aggregateRating"
                 itemscope 
                 itemtype="https://schema.org/AggregateRating">
                <span aria-label="评分 4.5 分，满分 5 分">
                    ★★★★★
                </span>
                <span itemprop="ratingValue">4.5</span>/5
                (<span itemprop="reviewCount">128</span>条评价)
            </div>
        </header>
        
        <!-- 产品图片 -->
        <figure class="product-gallery">
            <img itemprop="image" 
                 src="macbook-main.jpg" 
                 alt="MacBook Pro 16寸正面图">
            <figcaption>银色款</figcaption>
        </figure>
        
        <!-- 产品描述 -->
        <div itemprop="description">
            <h2>产品特性</h2>
            <ul>
                <li>M2 Pro芯片</li>
                <li>16GB内存</li>
                <li>512GB存储</li>
            </ul>
        </div>
        
        <!-- 价格和购买 -->
        <div class="product-purchase" 
             itemprop="offers"
             itemscope 
             itemtype="https://schema.org/Offer">
            
            <data itemprop="price" value="19999">¥19,999</data>
            <meta itemprop="priceCurrency" content="CNY">
            <link itemprop="availability" 
                  href="https://schema.org/InStock">
            
            <form action="/cart/add" method="post">
                <label for="quantity">数量：</label>
                <input type="number" 
                       id="quantity" 
                       name="quantity"
                       min="1" 
                       max="10" 
                       value="1"
                       aria-label="购买数量">
                
                <button type="submit">加入购物车</button>
                <button type="button">立即购买</button>
            </form>
        </div>
        
        <!-- 产品详情标签页 -->
        <div class="product-tabs">
            <div role="tablist" aria-label="产品信息">
                <button role="tab" 
                        aria-selected="true"
                        aria-controls="specs-panel"
                        id="specs-tab">
                    技术规格
                </button>
                <button role="tab" 
                        aria-selected="false"
                        aria-controls="reviews-panel"
                        id="reviews-tab">
                    用户评价
                </button>
            </div>
            
            <section role="tabpanel" 
                     id="specs-panel"
                     aria-labelledby="specs-tab">
                <h3>技术规格</h3>
                <table>
                    <tr>
                        <th scope="row">处理器</th>
                        <td>M2 Pro</td>
                    </tr>
                    <tr>
                        <th scope="row">内存</th>
                        <td>16GB</td>
                    </tr>
                </table>
            </section>
            
            <section role="tabpanel" 
                     id="reviews-panel"
                     aria-labelledby="reviews-tab"
                     hidden>
                <h3>用户评价</h3>
                <!-- 评价列表 -->
            </section>
        </div>
    </article>
    
    <!-- 相关产品 -->
    <aside aria-labelledby="related-products">
        <h2 id="related-products">相关产品</h2>
        <!-- 产品列表 -->
    </aside>
</main>

<!-- JSON-LD -->
<script type="application/ld+json">
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
    "priceCurrency": "CNY",
    "price": "19999",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "128"
  }
}
</script>`,
                        notes: "产品页面结合微数据和JSON-LD"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "企业官网首页",
            content: {
                description: "企业官网首页的语义化结构。",
                examples: [
                    {
                        title: "首页结构",
                        code: `<body>
    <header class="site-header">
        <div class="container">
            <a href="/" class="logo">
                <img src="logo.svg" alt="某某科技">
            </a>
            
            <nav aria-label="主导航">
                <ul>
                    <li><a href="/" aria-current="page">首页</a></li>
                    <li><a href="/products">产品</a></li>
                    <li><a href="/solutions">解决方案</a></li>
                    <li><a href="/about">关于我们</a></li>
                    <li><a href="/contact">联系我们</a></li>
                </ul>
            </nav>
        </div>
    </header>
    
    <main>
        <!-- Hero区域 -->
        <section class="hero" aria-labelledby="hero-heading">
            <div class="container">
                <h1 id="hero-heading">创新科技，引领未来</h1>
                <p>为企业提供一流的技术解决方案</p>
                <a href="/contact" class="cta-button">立即咨询</a>
            </div>
        </section>
        
        <!-- 特色服务 -->
        <section aria-labelledby="services-heading">
            <div class="container">
                <h2 id="services-heading">我们的服务</h2>
                
                <div class="services-grid">
                    <article>
                        <img src="service1.svg" alt="" role="presentation">
                        <h3>云计算</h3>
                        <p>提供可靠的云计算服务...</p>
                        <a href="/services/cloud">了解更多</a>
                    </article>
                    
                    <article>
                        <img src="service2.svg" alt="" role="presentation">
                        <h3>大数据</h3>
                        <p>专业的大数据分析...</p>
                        <a href="/services/bigdata">了解更多</a>
                    </article>
                </div>
            </div>
        </section>
        
        <!-- 客户案例 -->
        <section class="case-studies" 
                 aria-labelledby="cases-heading">
            <div class="container">
                <h2 id="cases-heading">客户案例</h2>
                
                <div class="cases-grid">
                    <article>
                        <img src="case1.jpg" alt="某银行案例">
                        <h3>某银行数字化转型</h3>
                        <p>帮助客户实现全面数字化...</p>
                    </article>
                </div>
            </div>
        </section>
        
        <!-- 客户评价 -->
        <section class="testimonials" 
                 aria-labelledby="testimonials-heading">
            <div class="container">
                <h2 id="testimonials-heading">客户评价</h2>
                
                <div class="testimonial-slider">
                    <blockquote>
                        <p>某某科技提供的解决方案非常专业...</p>
                        <footer>
                            — <cite>某某公司CEO 李四</cite>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </section>
        
        <!-- CTA区域 -->
        <section class="cta" aria-labelledby="cta-heading">
            <div class="container">
                <h2 id="cta-heading">准备开始了吗？</h2>
                <p>联系我们，获取专业咨询</p>
                <a href="/contact" class="button">立即联系</a>
            </div>
        </section>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">
                <section>
                    <h3>关于我们</h3>
                    <p>某某科技成立于2010年...</p>
                </section>
                
                <section>
                    <h3>快速链接</h3>
                    <nav aria-label="页脚导航">
                        <ul>
                            <li><a href="/products">产品</a></li>
                            <li><a href="/solutions">解决方案</a></li>
                        </ul>
                    </nav>
                </section>
                
                <section>
                    <h3>联系方式</h3>
                    <address>
                        电话: <a href="tel:+861012345678">010-12345678</a><br>
                        邮箱: <a href="mailto:info@example.com">info@example.com</a><br>
                        地址: 北京市朝阳区某某路123号
                    </address>
                </section>
            </div>
            
            <p>&copy; 2024 某某科技. All rights reserved.</p>
        </div>
    </footer>
</body>`,
                        notes: "企业官网的完整语义化结构"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "语义化实战要点",
            content: {
                description: "实际项目中应用语义化的关键点：",
                practices: [
                    {
                        title: "规划文档结构",
                        description: "先设计内容结构，再选择合适的标签。",
                        example: `1. 分析页面内容层次
2. 确定主要区域（header、main、aside、footer）
3. 划分内容板块（section、article）
4. 选择合适的标题层级（h1-h6）
5. 考虑可访问性和SEO`
                    },
                    {
                        title: "渐进增强",
                        description: "从基础HTML开始，逐步添加样式和交互。",
                        example: `1. HTML提供基础结构和内容
2. CSS提供视觉呈现
3. JavaScript增强交互
4. 确保无JS时基本功能可用`
                    },
                    {
                        title: "测试和验证",
                        description: "多维度测试页面质量。",
                        example: `- HTML验证：W3C Validator
- 可访问性：Lighthouse、axe DevTools
- SEO：Google Search Console
- 屏幕阅读器：NVDA、VoiceOver
- 性能：PageSpeed Insights`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "语义化实战检查清单",
            content: {
                description: "确保项目正确实现语义化：",
                items: [
                    { id: "check21-1", text: "使用了合适的语义化标签" },
                    { id: "check21-2", text: "标题层级正确且完整" },
                    { id: "check21-3", text: "添加了结构化数据" },
                    { id: "check21-4", text: "ARIA属性使用恰当" },
                    { id: "check21-5", text: "所有图片有alt属性" },
                    { id: "check21-6", text: "表单有完整的label" },
                    { id: "check21-7", text: "通过HTML验证" },
                    { id: "check21-8", text: "可访问性测试通过" },
                    { id: "check21-9", text: "支持键盘导航" },
                    { id: "check21-10", text: "SEO基础优化完成" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "ARIA可访问性", url: "content.html?chapter=20" },
        next: { title: "SEO优化", url: "content.html?chapter=22" }
    }
};
