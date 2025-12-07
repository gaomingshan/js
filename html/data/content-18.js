// 第18章：HTML5语义化标签 - 内容数据
window.htmlContentData_18 = {
    section: {
        title: "HTML5语义化标签",
        icon: "🏗️"
    },
    topics: [
        {
            type: "concept",
            title: "语义化HTML概述",
            content: {
                description: "语义化HTML是指使用恰当的标签来描述内容的含义，而不仅仅是外观。HTML5引入了许多新的语义化标签，使网页结构更加清晰。",
                keyPoints: [
                    "语义化标签描述内容的含义和结构",
                    "提高代码可读性和可维护性",
                    "有利于SEO和搜索引擎理解",
                    "增强可访问性，帮助屏幕阅读器",
                    "HTML5新增：header、nav、main、section、article、aside、footer",
                    "避免过度使用div，选择有语义的标签"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Glossary/Semantics#html_中的语义"
            }
        },
        {
            type: "comparison",
            title: "div vs 语义化标签",
            content: {
                description: "对比传统div布局和HTML5语义化标签的区别。",
                items: [
                    {
                        name: "传统div布局",
                        pros: [
                            "浏览器兼容性好",
                            "使用简单直接"
                        ],
                        cons: [
                            "无语义，难以理解内容结构",
                            "不利于SEO",
                            "可访问性差",
                            "代码可维护性低",
                            "需要大量class来区分用途"
                        ]
                    },
                    {
                        name: "HTML5语义化标签",
                        pros: [
                            "标签名直接表达内容含义",
                            "代码结构清晰易读",
                            "有利于SEO优化",
                            "提升可访问性",
                            "更易维护",
                            "符合Web标准"
                        ],
                        cons: [
                            "需要理解各标签的正确用途",
                            "旧版浏览器需要polyfill"
                        ]
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<header>页眉元素",
            content: {
                description: "header表示引导性内容，通常包含logo、导航、搜索等。",
                examples: [
                    {
                        title: "页面级header",
                        code: `<!-- 网站主header -->
<header class="site-header">
    <div class="container">
        <a href="/" class="logo">
            <img src="logo.png" alt="网站Logo">
        </a>
        
        <nav class="main-nav">
            <ul>
                <li><a href="/">首页</a></li>
                <li><a href="/products">产品</a></li>
                <li><a href="/about">关于</a></li>
                <li><a href="/contact">联系</a></li>
            </ul>
        </nav>
        
        <form class="search-form">
            <input type="search" placeholder="搜索...">
            <button type="submit">搜索</button>
        </form>
    </div>
</header>`,
                        notes: "页面级header通常包含全局导航"
                    },
                    {
                        title: "区块级header",
                        code: `<article>
    <!-- 文章的header -->
    <header>
        <h1>文章标题</h1>
        <p class="meta">
            <time datetime="2024-01-15">2024年1月15日</time>
            <span>作者：张三</span>
            <span>分类：技术</span>
        </p>
    </header>
    
    <div class="content">
        <p>文章正文...</p>
    </div>
</article>

<section>
    <!-- 章节的header -->
    <header>
        <h2>第一章</h2>
        <p>章节简介...</p>
    </header>
    
    <p>章节内容...</p>
</section>`,
                        notes: "header可以用于article、section等元素"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<nav>导航元素",
            content: {
                description: "nav元素表示导航链接的区块。",
                examples: [
                    {
                        title: "主导航",
                        code: `<nav class="main-navigation" aria-label="主导航">
    <ul>
        <li><a href="/" aria-current="page">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/services">服务</a></li>
        <li><a href="/about">关于我们</a></li>
        <li><a href="/contact">联系我们</a></li>
    </ul>
</nav>`,
                        notes: "主导航应该使用nav标签"
                    },
                    {
                        title: "多个导航区域",
                        code: `<!-- 主导航 -->
<nav aria-label="主导航">
    <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/blog">博客</a></li>
    </ul>
</nav>

<!-- 面包屑导航 -->
<nav aria-label="面包屑">
    <ol>
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li aria-current="page">笔记本电脑</li>
    </ol>
</nav>

<!-- 侧边栏导航 -->
<aside>
    <nav aria-label="相关链接">
        <h3>相关文章</h3>
        <ul>
            <li><a href="/article1">文章1</a></li>
            <li><a href="/article2">文章2</a></li>
        </ul>
    </nav>
</aside>

<!-- 页脚导航 -->
<footer>
    <nav aria-label="页脚导航">
        <ul>
            <li><a href="/privacy">隐私政策</a></li>
            <li><a href="/terms">使用条款</a></li>
        </ul>
    </nav>
</footer>`,
                        notes: "多个nav使用aria-label区分"
                    },
                    {
                        title: "目录导航",
                        code: `<nav class="table-of-contents">
    <h2>目录</h2>
    <ol>
        <li>
            <a href="#introduction">引言</a>
        </li>
        <li>
            <a href="#chapter1">第一章</a>
            <ol>
                <li><a href="#section1-1">1.1 小节</a></li>
                <li><a href="#section1-2">1.2 小节</a></li>
            </ol>
        </li>
        <li>
            <a href="#chapter2">第二章</a>
        </li>
        <li>
            <a href="#conclusion">结论</a>
        </li>
    </ol>
</nav>`,
                        notes: "文章目录也应该使用nav"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<main>主内容元素",
            content: {
                description: "main元素表示文档的主要内容，一个页面只能有一个main。",
                examples: [
                    {
                        title: "基本main结构",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>页面标题</title>
</head>
<body>
    <header>
        <!-- 页眉：logo、导航 -->
    </header>
    
    <main>
        <!-- 页面主要内容 -->
        <h1>页面主标题</h1>
        <p>主要内容...</p>
    </main>
    
    <aside>
        <!-- 侧边栏：相关链接、广告 -->
    </aside>
    
    <footer>
        <!-- 页脚：版权、链接 -->
    </footer>
</body>
</html>`,
                        notes: "main包含页面的主要内容"
                    },
                    {
                        title: "main的使用规则",
                        code: `<!-- ✅ 正确：一个页面只有一个main -->
<body>
    <header>导航</header>
    <main>
        <article>主要文章</article>
    </main>
    <footer>页脚</footer>
</body>

<!-- ❌ 错误：多个main -->
<body>
    <main>内容1</main>
    <main>内容2</main>
</body>

<!-- ❌ 错误：main在article/section内 -->
<article>
    <main>错误使用</main>
</article>

<!-- ✅ 正确：article在main内 -->
<main>
    <article>文章内容</article>
</main>`,
                        notes: "main不能是article、aside、footer、header、nav的后代"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<article>文章元素",
            content: {
                description: "article表示独立的、完整的内容单元。",
                examples: [
                    {
                        title: "博客文章",
                        code: `<main>
    <article>
        <header>
            <h1>如何学习HTML5</h1>
            <p class="meta">
                <time datetime="2024-01-15T10:00:00">
                    2024年1月15日
                </time>
                <address class="author">
                    作者：<a href="/author/zhangsan">张三</a>
                </address>
            </p>
        </header>
        
        <div class="content">
            <p>HTML5是现代Web开发的基础...</p>
            <h2>第一部分：基础知识</h2>
            <p>首先我们需要了解...</p>
        </div>
        
        <footer>
            <p>标签：
                <a href="/tag/html">HTML</a>,
                <a href="/tag/tutorial">教程</a>
            </p>
            <p>分享到：
                <a href="#">微博</a>
                <a href="#">微信</a>
            </p>
        </footer>
    </article>
</main>`,
                        notes: "article代表一篇完整的文章"
                    },
                    {
                        title: "评论列表",
                        code: `<section class="comments">
    <h2>评论</h2>
    
    <article class="comment">
        <header>
            <img src="avatar1.jpg" alt="用户头像">
            <p>
                <strong>用户A</strong>
                <time datetime="2024-01-15T14:30">1小时前</time>
            </p>
        </header>
        <p>这篇文章写得很好！</p>
    </article>
    
    <article class="comment">
        <header>
            <img src="avatar2.jpg" alt="用户头像">
            <p>
                <strong>用户B</strong>
                <time datetime="2024-01-15T15:00">30分钟前</time>
            </p>
        </header>
        <p>受益匪浅，感谢分享。</p>
    </article>
</section>`,
                        notes: "每条评论也是独立的article"
                    },
                    {
                        title: "产品卡片",
                        code: `<div class="product-list">
    <article class="product-card">
        <img src="product1.jpg" alt="产品1">
        <h3>笔记本电脑</h3>
        <p class="price">¥5,999</p>
        <p class="description">高性能轻薄本...</p>
        <a href="/product/1" class="btn">查看详情</a>
    </article>
    
    <article class="product-card">
        <img src="product2.jpg" alt="产品2">
        <h3>无线鼠标</h3>
        <p class="price">¥99</p>
        <p class="description">人体工学设计...</p>
        <a href="/product/2" class="btn">查看详情</a>
    </article>
</div>`,
                        notes: "独立的产品项可以用article"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<section>章节元素",
            content: {
                description: "section表示文档或应用的一个通用章节。",
                examples: [
                    {
                        title: "文章章节",
                        code: `<article>
    <h1>Web开发完整指南</h1>
    
    <section>
        <h2>前端开发</h2>
        <p>前端开发包括HTML、CSS和JavaScript...</p>
        
        <section>
            <h3>HTML基础</h3>
            <p>HTML是网页的骨架...</p>
        </section>
        
        <section>
            <h3>CSS样式</h3>
            <p>CSS用于美化页面...</p>
        </section>
    </section>
    
    <section>
        <h2>后端开发</h2>
        <p>后端开发负责服务器端逻辑...</p>
    </section>
</article>`,
                        notes: "section用于主题分组"
                    },
                    {
                        title: "页面区块",
                        code: `<main>
    <!-- 特色区域 -->
    <section class="hero">
        <h1>欢迎来到我们的网站</h1>
        <p>提供最优质的服务</p>
    </section>
    
    <!-- 产品展示 -->
    <section class="products">
        <h2>热门产品</h2>
        <div class="product-grid">
            <!-- 产品列表 -->
        </div>
    </section>
    
    <!-- 客户评价 -->
    <section class="testimonials">
        <h2>客户评价</h2>
        <div class="reviews">
            <!-- 评价列表 -->
        </div>
    </section>
</main>`,
                        notes: "section组织页面的不同主题区域"
                    },
                    {
                        title: "section vs div",
                        code: `<!-- ✅ 使用section：有标题的主题区域 -->
<section>
    <h2>关于我们</h2>
    <p>公司介绍...</p>
</section>

<!-- ✅ 使用div：纯样式容器 -->
<div class="container">
    <div class="row">
        <div class="col">内容</div>
    </div>
</div>

<!-- 原则：
     - section用于有主题标题的内容分组
     - div用于纯样式/布局目的
-->`,
                        notes: "section应该有明确的主题，通常包含标题"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<aside>侧边栏元素",
            content: {
                description: "aside表示与主内容相关但独立的内容。",
                examples: [
                    {
                        title: "侧边栏",
                        code: `<main>
    <article>
        <h1>主要文章</h1>
        <p>文章内容...</p>
    </article>
</main>

<aside class="sidebar">
    <!-- 相关文章 -->
    <section>
        <h3>相关文章</h3>
        <ul>
            <li><a href="/article1">相关文章1</a></li>
            <li><a href="/article2">相关文章2</a></li>
        </ul>
    </section>
    
    <!-- 标签云 -->
    <section>
        <h3>热门标签</h3>
        <div class="tags">
            <a href="/tag/html">HTML</a>
            <a href="/tag/css">CSS</a>
        </div>
    </section>
    
    <!-- 广告 -->
    <section class="ad">
        <h3>赞助商</h3>
        <!-- 广告内容 -->
    </section>
</aside>`,
                        notes: "aside通常用于侧边栏"
                    },
                    {
                        title: "文章内的aside",
                        code: `<article>
    <h1>JavaScript高级技巧</h1>
    
    <p>JavaScript是一门强大的语言...</p>
    
    <!-- 文章内的补充信息 -->
    <aside class="note">
        <h4>💡 提示</h4>
        <p>这个技巧在现代浏览器中都得到了支持。</p>
    </aside>
    
    <p>继续我们的主题...</p>
    
    <aside class="warning">
        <h4>⚠️ 注意</h4>
        <p>在使用此功能时需要注意浏览器兼容性。</p>
    </aside>
</article>`,
                        notes: "aside也可用于文章中的补充说明"
                    },
                    {
                        title: "引用说明",
                        code: `<article>
    <p>根据最新研究...</p>
    
    <aside class="callout">
        <h4>研究背景</h4>
        <p>这项研究由某某大学于2023年完成...</p>
    </aside>
    
    <p>研究结果表明...</p>
</article>`,
                        notes: "aside可用于补充说明或引用"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<footer>页脚元素",
            content: {
                description: "footer表示章节或页面的页脚信息。",
                examples: [
                    {
                        title: "页面级footer",
                        code: `<footer class="site-footer">
    <div class="container">
        <div class="footer-content">
            <section>
                <h3>关于我们</h3>
                <p>公司简介...</p>
            </section>
            
            <section>
                <h3>快速链接</h3>
                <nav>
                    <ul>
                        <li><a href="/about">关于</a></li>
                        <li><a href="/contact">联系</a></li>
                        <li><a href="/privacy">隐私</a></li>
                    </ul>
                </nav>
            </section>
            
            <section>
                <h3>联系方式</h3>
                <address>
                    电话：010-12345678<br>
                    邮箱：info@example.com<br>
                    地址：北京市朝阳区
                </address>
            </section>
        </div>
        
        <div class="copyright">
            <p>&copy; 2024 公司名称. All rights reserved.</p>
            <p>
                <a href="/terms">使用条款</a> |
                <a href="/privacy">隐私政策</a>
            </p>
        </div>
    </div>
</footer>`,
                        notes: "页面footer包含版权、链接等信息"
                    },
                    {
                        title: "文章footer",
                        code: `<article>
    <header>
        <h1>文章标题</h1>
    </header>
    
    <div class="content">
        <p>文章内容...</p>
    </div>
    
    <footer>
        <p>
            作者：<a href="/author/zhangsan">张三</a> |
            发布于：<time datetime="2024-01-15">2024年1月15日</time>
        </p>
        <p>
            标签：
            <a href="/tag/html">HTML</a>,
            <a href="/tag/tutorial">教程</a>
        </p>
        <p>
            许可：<a href="https://creativecommons.org/licenses/by/4.0/">
                CC BY 4.0
            </a>
        </p>
    </footer>
</article>`,
                        notes: "article的footer包含元数据"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "完整页面结构示例",
            content: {
                description: "一个使用语义化标签的完整页面结构。",
                examples: [
                    {
                        title: "博客页面结构",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的博客</title>
</head>
<body>
    <!-- 页眉 -->
    <header class="site-header">
        <div class="container">
            <h1><a href="/">我的博客</a></h1>
            <nav aria-label="主导航">
                <ul>
                    <li><a href="/">首页</a></li>
                    <li><a href="/blog">博客</a></li>
                    <li><a href="/about">关于</a></li>
                </ul>
            </nav>
        </div>
    </header>
    
    <!-- 主内容 -->
    <main class="container">
        <!-- 文章 -->
        <article>
            <header>
                <h1>HTML5语义化标签详解</h1>
                <p class="meta">
                    <time datetime="2024-01-15">2024年1月15日</time>
                    <span>作者：张三</span>
                </p>
            </header>
            
            <div class="content">
                <section>
                    <h2>什么是语义化</h2>
                    <p>语义化是指...</p>
                </section>
                
                <section>
                    <h2>语义化的优势</h2>
                    <p>使用语义化标签的好处...</p>
                </section>
            </div>
            
            <footer>
                <p>标签：HTML, 教程</p>
            </footer>
        </article>
        
        <!-- 评论区 -->
        <section class="comments">
            <h2>评论</h2>
            <!-- 评论列表 -->
        </section>
    </main>
    
    <!-- 侧边栏 -->
    <aside class="sidebar">
        <section>
            <h3>最新文章</h3>
            <!-- 文章列表 -->
        </section>
    </aside>
    
    <!-- 页脚 -->
    <footer class="site-footer">
        <p>&copy; 2024 我的博客</p>
    </footer>
</body>
</html>`,
                        notes: "完整的语义化页面结构"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "语义化标签最佳实践",
            content: {
                description: "正确使用语义化标签的关键原则：",
                practices: [
                    {
                        title: "根据内容选择标签",
                        description: "标签应该反映内容的含义，而非样式。",
                        example: `<!-- ✅ 好：根据语义选择 -->
<article>文章</article>
<nav>导航</nav>
<aside>侧边栏</aside>

<!-- ❌ 不好：都用div -->
<div class="article">文章</div>
<div class="nav">导航</div>
<div class="sidebar">侧边栏</div>`
                    },
                    {
                        title: "保持标题层级",
                        description: "每个section/article应该有标题。",
                        example: `<!-- ✅ 好 -->
<section>
    <h2>章节标题</h2>
    <p>内容...</p>
</section>

<!-- ❌ 不好：section无标题 -->
<section>
    <p>内容...</p>
</section>`
                    },
                    {
                        title: "一个页面一个main",
                        description: "main标记页面的主要内容。",
                        example: `<!-- ✅ 正确 -->
<body>
    <header>导航</header>
    <main>主内容</main>
    <footer>页脚</footer>
</body>`
                    },
                    {
                        title: "合理嵌套",
                        description: "理解元素的嵌套规则。",
                        example: `<!-- ✅ 正确 -->
<main>
    <article>
        <section>...</section>
    </article>
</main>

<!-- ❌ 错误 -->
<section>
    <main>...</main>
</section>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "语义化HTML检查清单",
            content: {
                description: "确保正确使用语义化标签：",
                items: [
                    { id: "check18-1", text: "使用header标记页眉区域" },
                    { id: "check18-2", text: "使用nav标记导航区域" },
                    { id: "check18-3", text: "使用main标记主要内容（且只有一个）" },
                    { id: "check18-4", text: "使用article标记独立内容" },
                    { id: "check18-5", text: "使用section分组相关内容" },
                    { id: "check18-6", text: "使用aside标记补充内容" },
                    { id: "check18-7", text: "使用footer标记页脚信息" },
                    { id: "check18-8", text: "每个section/article有合适的标题" },
                    { id: "check18-9", text: "标题层级正确（h1-h6）" },
                    { id: "check18-10", text: "避免过度使用div" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "表单最佳实践", url: "content.html?chapter=17" },
        next: { title: "微格式与微数据", url: "content.html?chapter=19" }
    }
};
