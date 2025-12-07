// 第36章：项目实战 - 内容数据
window.htmlContentData_36 = {
    section: {
        title: "项目实战",
        icon: "🚀"
    },
    topics: [
        {
            type: "concept",
            title: "项目实战概述",
            content: {
                description: "通过实际项目整合所学的HTML知识，包括响应式布局、语义化结构、可访问性、性能优化、安全防护等最佳实践，构建完整的Web应用。",
                keyPoints: [
                    "综合运用HTML知识",
                    "遵循最佳实践",
                    "注重用户体验",
                    "确保可访问性",
                    "优化性能",
                    "实施安全措施"
                ]
            }
        },
        {
            type: "code-example",
            title: "项目一：个人博客",
            content: {
                description: "构建一个完整的个人博客网站。",
                examples: [
                    {
                        title: "首页结构",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="张三的技术博客，分享前端开发经验和技术文章">
    <title>张三的技术博客 - 前端开发与技术分享</title>
    
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preconnect" href="https://cdn.example.com">
    
    <!-- 关键CSS内联 -->
    <style>
        /* 首屏关键样式 */
        :root {
            --primary: #2196F3;
            --text: #333;
            --bg: #fff;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    </style>
    
    <!-- 非关键CSS异步加载 -->
    <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
    
    <!-- 结构化数据 -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "张三的技术博客",
      "description": "前端开发与技术分享",
      "author": {
        "@type": "Person",
        "name": "张三"
      }
    }
    </script>
</head>
<body>
    <!-- 跳过导航链接（可访问性） -->
    <a href="#main-content" class="skip-link">跳到主内容</a>
    
    <!-- 页眉 -->
    <header class="site-header" role="banner">
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <img src="/images/logo.svg" alt="张三的技术博客" width="120" height="40">
                </a>
                
                <nav aria-label="主导航">
                    <ul class="nav-list">
                        <li><a href="/" aria-current="page">首页</a></li>
                        <li><a href="/blog">博客</a></li>
                        <li><a href="/projects">项目</a></li>
                        <li><a href="/about">关于</a></li>
                    </ul>
                </nav>
                
                <button class="theme-toggle" 
                        aria-label="切换深色模式"
                        aria-pressed="false">
                    🌙
                </button>
            </div>
        </div>
    </header>
    
    <!-- 主内容 -->
    <main id="main-content" class="container">
        <!-- 英雄区 -->
        <section class="hero" aria-labelledby="hero-heading">
            <h1 id="hero-heading">欢迎来到我的技术博客</h1>
            <p class="hero-subtitle">分享前端开发经验与技术见解</p>
        </section>
        
        <!-- 最新文章 -->
        <section aria-labelledby="latest-posts">
            <h2 id="latest-posts">最新文章</h2>
            
            <div class="post-grid">
                <article class="post-card">
                    <a href="/posts/html5-guide">
                        <img src="/images/post1.jpg" 
                             alt="HTML5完全指南封面图" 
                             width="400" 
                             height="250"
                             loading="lazy">
                    </a>
                    
                    <div class="post-content">
                        <h3>
                            <a href="/posts/html5-guide">HTML5完全指南</a>
                        </h3>
                        
                        <p class="post-excerpt">
                            深入介绍HTML5的各种特性和最佳实践...
                        </p>
                        
                        <div class="post-meta">
                            <time datetime="2024-01-15">2024年1月15日</time>
                            <span>·</span>
                            <span>10分钟阅读</span>
                        </div>
                        
                        <div class="post-tags">
                            <a href="/tag/html" class="tag">HTML</a>
                            <a href="/tag/tutorial" class="tag">教程</a>
                        </div>
                    </div>
                </article>
                
                <!-- 更多文章卡片... -->
            </div>
        </section>
        
        <!-- Newsletter订阅 -->
        <section class="newsletter" aria-labelledby="newsletter-heading">
            <h2 id="newsletter-heading">订阅Newsletter</h2>
            <p>获取最新文章推送</p>
            
            <form class="newsletter-form" action="/subscribe" method="POST">
                <label for="email" class="visually-hidden">邮箱地址</label>
                <input type="email" 
                       id="email" 
                       name="email"
                       placeholder="your@email.com"
                       required
                       aria-required="true">
                
                <button type="submit">订阅</button>
            </form>
        </section>
    </main>
    
    <!-- 侧边栏 -->
    <aside class="sidebar" aria-label="侧边栏">
        <section aria-labelledby="popular-posts">
            <h2 id="popular-posts">热门文章</h2>
            <ul class="popular-list">
                <li>
                    <a href="/posts/javascript-tips">JavaScript实用技巧</a>
                </li>
                <!-- 更多文章... -->
            </ul>
        </section>
        
        <section aria-labelledby="tags">
            <h2 id="tags">标签云</h2>
            <div class="tag-cloud">
                <a href="/tag/html" class="tag">HTML</a>
                <a href="/tag/css" class="tag">CSS</a>
                <a href="/tag/javascript" class="tag">JavaScript</a>
            </div>
        </section>
    </aside>
    
    <!-- 页脚 -->
    <footer class="site-footer" role="contentinfo">
        <div class="container">
            <div class="footer-content">
                <section aria-labelledby="about-footer">
                    <h3 id="about-footer">关于</h3>
                    <p>专注于前端开发技术分享</p>
                </section>
                
                <section aria-labelledby="links-footer">
                    <h3 id="links-footer">链接</h3>
                    <nav aria-label="页脚导航">
                        <ul>
                            <li><a href="/privacy">隐私政策</a></li>
                            <li><a href="/terms">使用条款</a></li>
                            <li><a href="/contact">联系方式</a></li>
                        </ul>
                    </nav>
                </section>
                
                <section aria-labelledby="social-footer">
                    <h3 id="social-footer">社交媒体</h3>
                    <div class="social-links">
                        <a href="https://github.com/zhangsan" 
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="GitHub">
                            GitHub
                        </a>
                        <a href="https://twitter.com/zhangsan"
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="Twitter">
                            Twitter
                        </a>
                    </div>
                </section>
            </div>
            
            <div class="copyright">
                <p>&copy; 2024 张三. All rights reserved.</p>
            </div>
        </div>
    </footer>
    
    <!-- 脚本 -->
    <script src="/js/main.js" defer></script>
    
    <!-- 分析脚本 -->
    <script async src="https://analytics.example.com/script.js"></script>
</body>
</html>`,
                        notes: "完整的博客首页，遵循所有最佳实践"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "项目二：电商产品页",
            content: {
                description: "构建电商网站的产品详情页。",
                examples: [
                    {
                        title: "产品页结构",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MacBook Pro 16寸 - 专业笔记本电脑 | 在线商城</title>
    <meta name="description" content="MacBook Pro 16寸，M2 Pro芯片，16GB内存，512GB存储，现货发售。">
    
    <!-- Open Graph -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="MacBook Pro 16寸">
    <meta property="og:description" content="强大的性能，专业的选择">
    <meta property="og:image" content="https://shop.example.com/images/macbook.jpg">
    <meta property="og:url" content="https://shop.example.com/products/macbook-pro-16">
    
    <!-- 产品结构化数据 -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "MacBook Pro 16寸",
      "image": "https://shop.example.com/images/macbook.jpg",
      "description": "M2 Pro芯片，专业级笔记本电脑",
      "brand": {
        "@type": "Brand",
        "name": "Apple"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://shop.example.com/products/macbook-pro-16",
        "priceCurrency": "CNY",
        "price": "19999",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "在线商城"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "128"
      }
    }
    </script>
</head>
<body>
    <header class="site-header">
        <!-- 导航栏 -->
    </header>
    
    <!-- 面包屑导航 -->
    <nav aria-label="面包屑">
        <ol class="breadcrumb">
            <li><a href="/">首页</a></li>
            <li><a href="/products">产品</a></li>
            <li><a href="/products/laptops">笔记本电脑</a></li>
            <li aria-current="page">MacBook Pro 16寸</li>
        </ol>
    </nav>
    
    <main class="product-page">
        <article class="product-detail">
            <!-- 产品图片 -->
            <section class="product-gallery" aria-label="产品图片">
                <div class="main-image">
                    <img src="/images/macbook-main.jpg" 
                         alt="MacBook Pro 16寸银色款正面图"
                         width="800"
                         height="600">
                </div>
                
                <div class="thumbnail-list" role="list">
                    <button role="listitem" 
                            aria-label="查看图片1"
                            aria-pressed="true">
                        <img src="/images/macbook-thumb1.jpg" 
                             alt="正面图缩略图"
                             width="100"
                             height="75">
                    </button>
                    <!-- 更多缩略图 -->
                </div>
            </section>
            
            <!-- 产品信息 -->
            <section class="product-info">
                <header>
                    <h1>MacBook Pro 16寸</h1>
                    
                    <div class="rating" 
                         role="img" 
                         aria-label="评分 4.5 分，满分 5 分">
                        <span class="stars">★★★★★</span>
                        <span class="rating-text">4.5</span>
                        <a href="#reviews">(128条评价)</a>
                    </div>
                </header>
                
                <div class="price">
                    <data value="19999">¥19,999</data>
                </div>
                
                <div class="product-description">
                    <h2>产品特点</h2>
                    <ul>
                        <li>M2 Pro芯片，性能强劲</li>
                        <li>16GB统一内存</li>
                        <li>512GB SSD存储</li>
                        <li>16英寸Liquid Retina XDR显示屏</li>
                    </ul>
                </div>
                
                <!-- 购买表单 -->
                <form class="purchase-form" action="/cart/add" method="POST">
                    <input type="hidden" name="product_id" value="123">
                    
                    <div class="form-group">
                        <label for="color">颜色：</label>
                        <select id="color" name="color" required>
                            <option value="">请选择</option>
                            <option value="silver">银色</option>
                            <option value="space-gray">深空灰色</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="quantity">数量：</label>
                        <input type="number" 
                               id="quantity" 
                               name="quantity"
                               min="1" 
                               max="10" 
                               value="1"
                               required
                               aria-describedby="quantity-note">
                        <small id="quantity-note">库存充足</small>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        加入购物车
                    </button>
                    <button type="button" class="btn-secondary">
                        立即购买
                    </button>
                </form>
            </section>
        </article>
        
        <!-- 产品详情标签页 -->
        <section class="product-tabs">
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
            
            <div role="tabpanel" 
                 id="specs-panel"
                 aria-labelledby="specs-tab">
                <h2>技术规格</h2>
                <table>
                    <tr>
                        <th scope="row">处理器</th>
                        <td>M2 Pro芯片</td>
                    </tr>
                    <tr>
                        <th scope="row">内存</th>
                        <td>16GB</td>
                    </tr>
                    <!-- 更多规格 -->
                </table>
            </div>
            
            <div role="tabpanel" 
                 id="reviews-panel"
                 aria-labelledby="reviews-tab"
                 hidden>
                <h2 id="reviews">用户评价 (128)</h2>
                <!-- 评价列表 -->
            </div>
        </section>
        
        <!-- 相关产品 -->
        <section aria-labelledby="related-products">
            <h2 id="related-products">相关产品</h2>
            <div class="product-grid">
                <!-- 产品卡片 -->
            </div>
        </section>
    </main>
    
    <footer class="site-footer">
        <!-- 页脚内容 -->
    </footer>
    
    <script src="/js/product.js" defer></script>
</body>
</html>`,
                        notes: "完整的电商产品页，包含结构化数据"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "项目开发流程",
            content: {
                description: "标准的项目开发流程：",
                practices: [
                    {
                        title: "1. 需求分析",
                        description: "明确项目目标和要求。",
                        example: `需求清单：
- 目标用户群
- 功能需求
- 性能要求
- 兼容性要求
- 可访问性标准
- SEO需求`
                    },
                    {
                        title: "2. 设计阶段",
                        description: "制定技术方案和设计。",
                        example: `设计内容：
- 信息架构
- 页面结构
- 组件设计
- 交互设计
- 响应式布局
- 性能预算`
                    },
                    {
                        title: "3. 开发阶段",
                        description: "编写代码实现功能。",
                        example: `开发规范：
- 使用语义化HTML
- 遵循代码规范
- 组件化开发
- 版本控制（Git）
- 代码审查
- 单元测试`
                    },
                    {
                        title: "4. 测试阶段",
                        description: "全面测试确保质量。",
                        example: `测试内容：
- HTML验证
- 可访问性测试
- 性能测试
- 跨浏览器测试
- 移动端测试
- 用户测试`
                    },
                    {
                        title: "5. 部署上线",
                        description: "发布到生产环境。",
                        example: `部署清单：
- 构建优化
- 资源压缩
- CDN配置
- 缓存策略
- 监控配置
- 备份计划`
                    },
                    {
                        title: "6. 维护优化",
                        description: "持续改进和优化。",
                        example: `维护工作：
- 性能监控
- 错误追踪
- 用户反馈
- 功能迭代
- 安全更新
- 定期审计`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "项目上线检查清单",
            content: {
                description: "上线前的完整检查：",
                items: [
                    { id: "check36-1", text: "所有页面通过HTML验证" },
                    { id: "check36-2", text: "可访问性评分达标（90+）" },
                    { id: "check36-3", text: "性能评分达标（90+）" },
                    { id: "check36-4", text: "SEO基础优化完成" },
                    { id: "check36-5", text: "所有链接正常" },
                    { id: "check36-6", text: "所有图片有alt属性" },
                    { id: "check36-7", text: "表单验证正常" },
                    { id: "check36-8", text: "跨浏览器测试通过" },
                    { id: "check36-9", text: "移动端适配完成" },
                    { id: "check36-10", text: "安全措施实施（HTTPS、CSP）" },
                    { id: "check36-11", text: "404页面配置" },
                    { id: "check36-12", text: "sitemap.xml生成" },
                    { id: "check36-13", text: "robots.txt配置" },
                    { id: "check36-14", text: "分析工具配置" },
                    { id: "check36-15", text: "监控工具配置" },
                    { id: "check36-16", text: "备份方案就绪" }
                ]
            }
        },
        {
            type: "concept",
            title: "持续学习",
            content: {
                description: "Web技术不断发展，持续学习是关键。保持对新技术的关注，不断实践和总结，提升自己的技能。",
                keyPoints: [
                    "关注Web标准更新",
                    "学习新的HTML特性",
                    "实践最佳实践",
                    "参与开源项目",
                    "分享技术经验",
                    "保持好奇心和学习热情"
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "测试与验证", url: "content.html?chapter=35" },
        next: null
    }
};
