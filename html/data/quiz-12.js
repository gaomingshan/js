// 第12章：语义化标签 - 面试题
window.htmlQuizData_12 = {
    config: {
        title: "语义化标签",
        icon: "🏷️",
        description: "测试你对HTML5语义化标签的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["语义化", "基础"],
            question: "什么是HTML语义化？为什么重要？",
            options: [
                "使用有意义的标签",
                "提升可访问性",
                "有利于SEO",
                "便于维护"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML语义化",
                description: "语义化是使用正确的标签表达正确的含义。",
                sections: [
                    {
                        title: "什么是语义化",
                        code: '<!-- 非语义化 -->\n<div class="header">\n  <div class="nav">\n    <div class="nav-item">首页</div>\n  </div>\n</div>\n<div class="main">\n  <div class="article">\n    <div class="title">文章标题</div>\n    <div class="content">内容...</div>\n  </div>\n</div>\n\n<!-- 语义化 -->\n<header>\n  <nav>\n    <a href="/">首页</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h1>文章标题</h1>\n    <p>内容...</p>\n  </article>\n</main>',
                        points: [
                            "用标签的语义而非外观",
                            "标签名能表达内容用途",
                            "HTML表达结构，CSS控制样式"
                        ]
                    },
                    {
                        title: "为什么重要",
                        points: [
                            "可访问性：屏幕阅读器能理解页面结构",
                            "SEO：搜索引擎更好地索引内容",
                            "可维护性：代码更易读易维护",
                            "团队协作：统一的语义理解",
                            "未来兼容：标准化的结构"
                        ]
                    },
                    {
                        title: "常见错误",
                        code: '<!-- 错误：滥用div -->\n<div class="button">点击</div>  <!-- 应该用<button> -->\n<div onclick="...">链接</div>  <!-- 应该用<a> -->\n\n<!-- 错误：滥用span -->\n<span class="heading">标题</span>  <!-- 应该用<h1>-<h6> -->\n\n<!-- 错误：语义不当 -->\n<b>重要</b>  <!-- 应该用<strong> -->\n<i>强调</i>  <!-- 应该用<em> -->\n\n<!-- 正确 -->\n<button>点击</button>\n<a href="...">链接</a>\n<h1>标题</h1>\n<strong>重要</strong>\n<em>强调</em>',
                        content: "选择语义正确的标签，而不是用div/span加样式。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["header", "nav", "footer"],
            question: "<header>、<nav>、<footer>的用法？",
            type: "multiple-choice",
            options: [
                "<header>表示页眉或章节头部",
                "<nav>包含导航链接",
                "<footer>表示页脚或章节尾部",
                "它们可以嵌套使用"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "结构性语义标签",
                description: "这些标签定义了页面的主要结构区域。",
                sections: [
                    {
                        title: "<header>标签",
                        code: '<!-- 页面header -->\n<header>\n  <img src="logo.svg" alt="网站Logo">\n  <nav>\n    <a href="/">首页</a>\n    <a href="/about">关于</a>\n  </nav>\n</header>\n\n<!-- article的header -->\n<article>\n  <header>\n    <h2>文章标题</h2>\n    <p>作者：张三 | 发布时间：2024-01-15</p>\n  </header>\n  <p>文章内容...</p>\n</article>\n\n<!-- section的header -->\n<section>\n  <header>\n    <h3>章节标题</h3>\n    <p>章节简介</p>\n  </header>\n  <p>章节内容...</p>\n</section>',
                        points: [
                            "介绍性内容",
                            "可以包含标题、Logo、导航",
                            "一个页面可以有多个header",
                            "不能嵌套header",
                            "不能在address、footer内"
                        ]
                    },
                    {
                        title: "<nav>标签",
                        code: '<!-- 主导航 -->\n<nav aria-label="主导航">\n  <ul>\n    <li><a href="/">首页</a></li>\n    <li><a href="/products">产品</a></li>\n    <li><a href="/about">关于</a></li>\n  </ul>\n</nav>\n\n<!-- 面包屑导航 -->\n<nav aria-label="面包屑">\n  <a href="/">首页</a> &gt;\n  <a href="/products">产品</a> &gt;\n  <span>详情</span>\n</nav>\n\n<!-- 文章内导航 -->\n<article>\n  <nav>\n    <h2>目录</h2>\n    <ul>\n      <li><a href="#section1">第一节</a></li>\n      <li><a href="#section2">第二节</a></li>\n    </ul>\n  </nav>\n</article>',
                        points: [
                            "主要导航链接",
                            "一个页面可以有多个nav",
                            "不是所有链接组都需要nav",
                            "footer中的链接不一定需要nav",
                            "用aria-label区分不同nav"
                        ]
                    },
                    {
                        title: "<footer>标签",
                        code: '<!-- 页面footer -->\n<footer>\n  <p>&copy; 2024 公司名称</p>\n  <nav>\n    <a href="/privacy">隐私政策</a>\n    <a href="/terms">服务条款</a>\n  </nav>\n</footer>\n\n<!-- article的footer -->\n<article>\n  <h2>文章标题</h2>\n  <p>内容...</p>\n  <footer>\n    <p>标签：<a href="/tag/html">HTML</a></p>\n    <p>分享：...</p>\n  </footer>\n</article>',
                        points: [
                            "页脚或章节尾部",
                            "版权信息、作者、链接",
                            "可以有多个footer",
                            "不能嵌套footer",
                            "不能在address、header内"
                        ]
                    },
                    {
                        title: "完整示例",
                        code: '<body>\n  <!-- 页面header -->\n  <header>\n    <h1>网站标题</h1>\n    <nav aria-label="主导航">\n      <a href="/">首页</a>\n      <a href="/blog">博客</a>\n    </nav>\n  </header>\n  \n  <!-- 主内容 -->\n  <main>\n    <article>\n      <!-- 文章header -->\n      <header>\n        <h2>文章标题</h2>\n        <p>作者：张三</p>\n      </header>\n      \n      <p>内容...</p>\n      \n      <!-- 文章footer -->\n      <footer>\n        <p>发布于：2024-01-15</p>\n      </footer>\n    </article>\n  </main>\n  \n  <!-- 页面footer -->\n  <footer>\n    <p>&copy; 2024 版权所有</p>\n  </footer>\n</body>',
                        content: "header、nav、footer可以在不同层级使用。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["main", "article", "section"],
            question: "<main>、<article>和<section>的区别？",
            options: [
                "<main>是页面的主要内容",
                "<article>是独立的内容单元",
                "<section>是主题性内容分组",
                "<main>一个页面只能有一个"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "内容区域标签",
                description: "区分页面的不同内容区域。",
                sections: [
                    {
                        title: "<main>标签",
                        code: '<body>\n  <header>...</header>\n  <nav>...</nav>\n  \n  <!-- 主要内容 -->\n  <main>\n    <h1>页面主标题</h1>\n    <article>...</article>\n  </main>\n  \n  <aside>...</aside>\n  <footer>...</footer>\n</body>',
                        points: [
                            "页面的主要内容",
                            "一个页面只能有一个可见的main",
                            "不能是header、footer、nav、aside的后代",
                            "直接包含核心内容",
                            "跳过导航的目标"
                        ]
                    },
                    {
                        title: "<article>标签",
                        code: '<!-- 博客文章 -->\n<article>\n  <h2>文章标题</h2>\n  <p>文章内容...</p>\n</article>\n\n<!-- 新闻列表 -->\n<section>\n  <h2>最新新闻</h2>\n  <article>\n    <h3>新闻1</h3>\n    <p>摘要...</p>\n  </article>\n  <article>\n    <h3>新闻2</h3>\n    <p>摘要...</p>\n  </article>\n</section>\n\n<!-- 论坛帖子 -->\n<article>\n  <h2>主题帖</h2>\n  <p>内容...</p>\n  \n  <!-- 嵌套：评论也是article -->\n  <section>\n    <h3>评论</h3>\n    <article>\n      <h4>用户A</h4>\n      <p>评论内容...</p>\n    </article>\n  </section>\n</article>',
                        points: [
                            "独立的、完整的内容单元",
                            "可以单独分发、重用",
                            "有自己的标题",
                            "可以嵌套",
                            "RSS feed中的每条就是article"
                        ]
                    },
                    {
                        title: "<section>标签",
                        code: '<!-- 文章的章节 -->\n<article>\n  <h1>HTML5教程</h1>\n  \n  <section>\n    <h2>第一章：简介</h2>\n    <p>内容...</p>\n  </section>\n  \n  <section>\n    <h2>第二章：标签</h2>\n    <p>内容...</p>\n  </section>\n</article>\n\n<!-- 页面的主题区域 -->\n<main>\n  <section>\n    <h2>关于我们</h2>\n    <p>公司简介...</p>\n  </section>\n  \n  <section>\n    <h2>我们的服务</h2>\n    <ul>...</ul>\n  </section>\n</main>',
                        points: [
                            "主题性内容分组",
                            "通常有标题",
                            "章节、选项卡、对话框",
                            "不仅仅是样式容器",
                            "没有更合适的语义标签时用section"
                        ]
                    },
                    {
                        title: "如何选择",
                        code: '<!-- main：页面主内容（唯一） -->\n<main>\n  <!-- article：独立内容 -->\n  <article>\n    <h2>博客文章</h2>\n    \n    <!-- section：文章章节 -->\n    <section>\n      <h3>第一节</h3>\n      <p>...</p>\n    </section>\n  </article>\n  \n  <!-- 多个article并列 -->\n  <article>...</article>\n  <article>...</article>\n</main>',
                        points: [
                            "main：整个页面的核心",
                            "article：可独立存在的内容",
                            "section：内容的逻辑分组",
                            "div：无语义的容器",
                            "从具体到通用：article > section > div"
                        ]
                    },
                    {
                        title: "判断方法",
                        points: [
                            'main：问"这是页面主要内容吗？"',
                            'article：问"这能单独作为RSS条目吗？"',
                            'section：问"这需要在目录中列出吗？"',
                            "如果都不是，可能只需要div"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["aside", "侧边栏"],
            question: "<aside>标签的正确用法？",
            options: [
                "表示与主内容相关但可分离的内容",
                "不限于侧边栏",
                "可以包含广告、引用等",
                "可以在article内"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<aside>标签",
                description: "aside表示辅助性内容。",
                sections: [
                    {
                        title: "页面级aside",
                        code: '<body>\n  <header>...</header>\n  <main>\n    <article>主要内容</article>\n  </main>\n  \n  <!-- 侧边栏 -->\n  <aside>\n    <section>\n      <h3>最新文章</h3>\n      <ul>...</ul>\n    </section>\n    \n    <section>\n      <h3>标签云</h3>\n      <div>...</div>\n    </section>\n    \n    <section>\n      <h3>广告</h3>\n      <div>...</div>\n    </section>\n  </aside>\n  \n  <footer>...</footer>\n</body>',
                        points: [
                            "页面级的辅助内容",
                            "侧边栏、相关链接、广告",
                            "与主内容间接相关",
                            "移除不影响主内容理解"
                        ]
                    },
                    {
                        title: "article内的aside",
                        code: '<article>\n  <h1>JavaScript闭包详解</h1>\n  \n  <p>闭包是JavaScript的重要概念...</p>\n  \n  <!-- 文章内的aside -->\n  <aside>\n    <h4>相关阅读</h4>\n    <ul>\n      <li><a href="/scope">作用域</a></li>\n      <li><a href="/this">this关键字</a></li>\n    </ul>\n  </aside>\n  \n  <p>继续正文...</p>\n  \n  <!-- 引用/注释 -->\n  <aside>\n    <p><strong>注意：</strong>某些浏览器实现可能不同。</p>\n  </aside>\n</article>',
                        content: "article内的aside与该文章相关。"
                    },
                    {
                        title: "不同类型的aside",
                        code: '<!-- 引用 -->\n<aside class="pullquote">\n  <blockquote>\n    "代码是写给人看的，顺便让机器执行。"\n  </blockquote>\n</aside>\n\n<!-- 提示信息 -->\n<aside class="tip">\n  <h4>💡 小贴士</h4>\n  <p>使用语义化标签可以提升SEO。</p>\n</aside>\n\n<!-- 相关链接 -->\n<aside class="related">\n  <h4>扩展阅读</h4>\n  <ul>\n    <li><a href="...">相关文章1</a></li>\n    <li><a href="...">相关文章2</a></li>\n  </ul>\n</aside>\n\n<!-- 广告 -->\n<aside class="advertisement">\n  <p>广告内容</p>\n</aside>',
                        content: "aside可以包含各种辅助性内容。"
                    },
                    {
                        title: "不适合用aside的情况",
                        code: '<!-- 错误：主要导航 -->\n<aside>\n  <nav>主导航</nav>  <!-- 应该直接用nav -->\n</aside>\n\n<!-- 错误：页脚 -->\n<aside>\n  <footer>版权信息</footer>  <!-- 应该直接用footer -->\n</aside>\n\n<!-- 正确 -->\n<nav>主导航</nav>\n<footer>版权信息</footer>',
                        content: "aside不是万能容器，要选择更合适的标签。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["time", "时间"],
            question: "<time>标签的datetime属性格式？",
            type: "multiple-choice",
            options: [
                "支持日期、时间、时长",
                "datetime是机器可读格式",
                "内容是人类可读格式",
                "对SEO和日历应用有帮助"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<time>标签详解",
                description: "time标签标记时间和日期。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 日期 -->\n<time datetime="2024-01-15">2024年1月15日</time>\n\n<!-- 日期+时间 -->\n<time datetime="2024-01-15T14:30:00">下午2:30</time>\n\n<!-- 带时区 -->\n<time datetime="2024-01-15T14:30:00+08:00">北京时间下午2:30</time>\n<time datetime="2024-01-15T14:30:00Z">UTC下午2:30</time>',
                        points: [
                            "datetime：机器可读",
                            "标签内容：人类可读",
                            "两者可以不同",
                            "datetime可选（如果内容是有效格式）"
                        ]
                    },
                    {
                        title: "日期格式",
                        code: '<!-- 完整日期 -->\n<time datetime="2024-01-15">2024年1月15日</time>\n\n<!-- 年月 -->\n<time datetime="2024-01">2024年1月</time>\n\n<!-- 年 -->\n<time datetime="2024">2024年</time>\n\n<!-- 月日 -->\n<time datetime="01-15">1月15日</time>',
                        content: "支持多种日期精度。"
                    },
                    {
                        title: "时间格式",
                        code: '<!-- 时间 -->\n<time datetime="14:30">下午2:30</time>\n<time datetime="14:30:00">14:30:00</time>\n<time datetime="14:30:00.123">带毫秒</time>\n\n<!-- 日期+时间 -->\n<time datetime="2024-01-15T14:30:00">2024年1月15日下午2:30</time>\n\n<!-- 时区 -->\n<time datetime="2024-01-15T14:30:00+08:00">CST下午2:30</time>\n<time datetime="2024-01-15T06:30:00Z">UTC早上6:30</time>',
                        points: [
                            "T分隔日期和时间",
                            "+HH:MM或-HH:MM表示时区",
                            "Z表示UTC时间",
                            "ISO 8601格式"
                        ]
                    },
                    {
                        title: "时长格式",
                        code: '<!-- 时长（Period） -->\n<time datetime="P2D">2天</time>\n<time datetime="P1Y2M10D">1年2个月10天</time>\n<time datetime="PT2H30M">2小时30分钟</time>\n<time datetime="PT1H30M45S">1小时30分45秒</time>\n\n<!-- 周 -->\n<time datetime="P4W">4周</time>\n\n<!-- 组合 -->\n<time datetime="P1DT2H">1天2小时</time>',
                        points: [
                            "P开头表示Period",
                            "T分隔日期和时间部分",
                            "Y=年, M=月, W=周, D=天",
                            "H=时, M=分, S=秒"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: '<!-- 发布时间 -->\n<article>\n  <h2>文章标题</h2>\n  <p>\n    发布于 <time datetime="2024-01-15T10:00:00+08:00" pubdate>\n      2024年1月15日\n    </time>\n  </p>\n</article>\n\n<!-- 活动时间 -->\n<div class="event">\n  <h3>技术分享会</h3>\n  <p>\n    时间：<time datetime="2024-02-01T14:00/2024-02-01T17:00">\n      2024年2月1日 14:00-17:00\n    </time>\n  </p>\n</div>\n\n<!-- 视频时长 -->\n<video src="video.mp4">\n  时长：<time datetime="PT1H30M">1小时30分钟</time>\n</video>\n\n<!-- 生日 -->\n<p>\n  生日：<time datetime="1990-05-20">1990年5月20日</time>\n</p>',
                        content: "time标签帮助机器理解时间信息。"
                    },
                    {
                        title: "SEO和结构化数据",
                        code: '<!-- 配合Schema.org -->\n<article itemscope itemtype="https://schema.org/Article">\n  <h1 itemprop="headline">文章标题</h1>\n  <time itemprop="datePublished" datetime="2024-01-15">\n    2024年1月15日\n  </time>\n</article>',
                        content: "time标签有助于搜索引擎理解和展示时间信息。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["address", "联系信息"],
            question: "<address>标签的用途和限制？",
            options: [
                "标记联系信息",
                "不仅限于物理地址",
                "只能包含联系方式",
                "不能嵌套header/footer"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<address>标签",
                description: "address标记联系信息，但有特定用法。",
                sections: [
                    {
                        title: "正确用法",
                        code: '<!-- 作者/所有者联系方式 -->\n<address>\n  <p>联系我们：</p>\n  <p>邮箱：<a href="mailto:info@example.com">info@example.com</a></p>\n  <p>电话：<a href="tel:+8613800138000">138-0013-8000</a></p>\n  <p>地址：北京市朝阳区某某大厦</p>\n</address>\n\n<!-- 文章作者 -->\n<article>\n  <h2>文章标题</h2>\n  <p>内容...</p>\n  <footer>\n    <address>\n      作者：<a href="mailto:author@example.com">张三</a>\n    </address>\n  </footer>\n</article>',
                        points: [
                            "最近的article或body的联系信息",
                            "可以包含邮箱、电话、地址等",
                            "通常在footer中",
                            "默认斜体"
                        ]
                    },
                    {
                        title: "不适合用address",
                        code: '<!-- 错误：普通地址 -->\n<p>请将包裹寄送到：</p>\n<address>  <!-- 错误！ -->\n  北京市朝阳区XXX路123号\n</address>\n\n<!-- 正确：普通地址 -->\n<p>请将包裹寄送到：</p>\n<p>北京市朝阳区XXX路123号</p>\n\n<!-- 错误：多个地址列表 -->\n<h3>分店地址</h3>\n<ul>\n  <li>\n    <address>北京分店：...</address>  <!-- 不恰当 -->\n  </li>\n</ul>',
                        points: [
                            "address不是用于任意地址",
                            "只用于联系信息",
                            "不是地理地址容器",
                            "普通地址用<p>就好"
                        ]
                    },
                    {
                        title: "内容限制",
                        code: '<!-- 可以包含 -->\n<address>\n  <p>...</p>  <!-- 段落 -->\n  <a href="...">...</a>  <!-- 链接 -->\n  <strong>...</strong>  <!-- 强调 -->\n</address>\n\n<!-- 不能包含 -->\n<address>\n  <header>...</header>  <!-- 不允许 -->\n  <footer>...</footer>  <!-- 不允许 -->\n  <article>...</article>  <!-- 不允许 -->\n  <section>...</section>  <!-- 不允许 -->\n  <address>...</address>  <!-- 不能嵌套 -->\n  <h1>...</h1>  <!-- 不建议 -->\n</address>',
                        content: "address有内容模型限制。"
                    },
                    {
                        title: "完整示例",
                        code: '<!DOCTYPE html>\n<html>\n<body>\n  <!-- 页面所有者联系方式 -->\n  <footer>\n    <address>\n      <p><strong>XX科技有限公司</strong></p>\n      <p>邮箱：<a href="mailto:contact@example.com">contact@example.com</a></p>\n      <p>电话：<a href="tel:+861012345678">010-1234-5678</a></p>\n      <p>地址：北京市海淀区中关村大街1号</p>\n    </address>\n  </footer>\n  \n  <!-- 文章作者联系方式 -->\n  <article>\n    <h1>如何学习HTML</h1>\n    <p>文章内容...</p>\n    <footer>\n      <address>\n        作者：<a href="mailto:zhangsan@example.com">张三</a><br>\n        博客：<a href="https://blog.zhangsan.com">blog.zhangsan.com</a>\n      </address>\n    </footer>\n  </article>\n</body>\n</html>',
                        content: "页面级和内容级address分别使用。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["figure", "figcaption"],
            question: "<figure>适合包含哪些内容？",
            type: "multiple-choice",
            options: [
                "图片和说明",
                "代码块",
                "引用",
                "表格"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<figure>和<figcaption>",
                description: "figure用于自包含的内容单元。",
                sections: [
                    {
                        title: "图片",
                        code: '<figure>\n  <img src="chart.jpg" alt="销售趋势图">\n  <figcaption>图1：2024年第一季度销售趋势</figcaption>\n</figure>\n\n<!-- 多张图片 -->\n<figure>\n  <img src="photo1.jpg" alt="场景1">\n  <img src="photo2.jpg" alt="场景2">\n  <img src="photo3.jpg" alt="场景3">\n  <figcaption>图2-4：项目现场照片</figcaption>\n</figure>',
                        content: "最常见的用法是图片+说明。"
                    },
                    {
                        title: "代码块",
                        code: '<figure>\n  <figcaption>代码1：快速排序实现</figcaption>\n  <pre><code class="language-javascript">\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  // ...\n}\n  </code></pre>\n</figure>',
                        content: "代码示例配合说明。"
                    },
                    {
                        title: "引用",
                        code: '<figure>\n  <blockquote>\n    <p>代码是写给人看的，顺便让机器执行。</p>\n  </blockquote>\n  <figcaption>—— Harold Abelson</figcaption>\n</figure>',
                        content: "引用和出处。"
                    },
                    {
                        title: "表格",
                        code: '<figure>\n  <figcaption>表1：2024年各季度销售数据（单位：万元）</figcaption>\n  <table>\n    <thead>\n      <tr><th>季度</th><th>销售额</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>Q1</td><td>100</td></tr>\n      <tr><td>Q2</td><td>150</td></tr>\n    </tbody>\n  </table>\n</figure>',
                        content: "表格和表名。"
                    },
                    {
                        title: "视频/音频",
                        code: '<figure>\n  <video src="demo.mp4" controls></video>\n  <figcaption>视频1：产品演示</figcaption>\n</figure>\n\n<figure>\n  <audio src="podcast.mp3" controls></audio>\n  <figcaption>第1集：HTML基础</figcaption>\n</figure>',
                        content: "多媒体内容及说明。"
                    },
                    {
                        title: "判断是否使用figure",
                        points: [
                            "内容是否自包含？",
                            "是否可以移到附录？",
                            "是否需要编号和标题？",
                            "移除是否不影响主内容流？",
                            "如果都是，用figure"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["details", "summary"],
            question: "<details>和<summary>的用法和浏览器支持？",
            options: [
                "创建可展开/收起的内容",
                "不需要JavaScript",
                "open属性控制默认状态",
                "所有现代浏览器支持"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<details>和<summary>",
                description: "原生的折叠面板组件。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<details>\n  <summary>点击查看详情</summary>\n  <p>这里是隐藏的内容。</p>\n  <p>可以包含任何HTML元素。</p>\n</details>\n\n<!-- 默认展开 -->\n<details open>\n  <summary>默认展开的内容</summary>\n  <p>这个details默认是展开的。</p>\n</details>',
                        points: [
                            "<details>：容器",
                            "<summary>：标题（可点击）",
                            "open属性：控制状态",
                            "浏览器提供默认样式和交互"
                        ]
                    },
                    {
                        title: "使用场景",
                        code: '<!-- FAQ -->\n<h2>常见问题</h2>\n<details>\n  <summary>如何注册账号？</summary>\n  <p>点击右上角的注册按钮...</p>\n</details>\n\n<details>\n  <summary>忘记密码怎么办？</summary>\n  <p>点击登录页面的忘记密码链接...</p>\n</details>\n\n<!-- 文章摘要 -->\n<article>\n  <h2>文章标题</h2>\n  <p>文章摘要...</p>\n  <details>\n    <summary>阅读全文</summary>\n    <p>完整内容...</p>\n  </details>\n</article>\n\n<!-- 产品规格 -->\n<details>\n  <summary>技术规格</summary>\n  <table>\n    <tr><td>CPU</td><td>Intel i7</td></tr>\n    <tr><td>内存</td><td>16GB</td></tr>\n  </table>\n</details>',
                        content: "适用于FAQ、详情展示、长内容折叠。"
                    },
                    {
                        title: "JavaScript交互",
                        code: 'const details = document.querySelector("details");\n\n// 监听状态变化\ndetails.addEventListener("toggle", function() {\n  if (this.open) {\n    console.log("展开了");\n  } else {\n    console.log("收起了");\n  }\n});\n\n// 编程控制\ndetails.open = true;  // 展开\ndetails.open = false; // 收起\n\n// 手风琴效果\nconst allDetails = document.querySelectorAll("details");\nallDetails.forEach(detail => {\n  detail.addEventListener("toggle", function() {\n    if (this.open) {\n      // 关闭其他details\n      allDetails.forEach(d => {\n        if (d !== this) d.open = false;\n      });\n    }\n  });\n});',
                        content: "toggle事件和编程控制。"
                    },
                    {
                        title: "CSS样式",
                        code: '<style>\ndetails {\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 10px;\n  margin: 10px 0;\n}\n\nsummary {\n  font-weight: bold;\n  cursor: pointer;\n  padding: 5px;\n  user-select: none;\n}\n\nsummary:hover {\n  background-color: #f0f0f0;\n}\n\n/* 移除默认三角形 */\nsummary::-webkit-details-marker {\n  display: none;\n}\n\n/* 自定义图标 */\nsummary::before {\n  content: "▶ ";\n}\n\ndetails[open] summary::before {\n  content: "▼ ";\n}\n\n/* 动画 */\ndetails[open] > *:not(summary) {\n  animation: slideDown 0.3s ease-out;\n}\n\n@keyframes slideDown {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n</style>',
                        content: "可以完全自定义样式。"
                    },
                    {
                        title: "嵌套details",
                        code: '<details>\n  <summary>第一层</summary>\n  <p>第一层内容</p>\n  \n  <details>\n    <summary>第二层</summary>\n    <p>第二层内容</p>\n    \n    <details>\n      <summary>第三层</summary>\n      <p>第三层内容</p>\n    </details>\n  </details>\n</details>',
                        content: "支持嵌套创建多级展开。"
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "Chrome 12+",
                            "Firefox 49+",
                            "Safari 6+",
                            "Edge 79+",
                            "IE不支持",
                            "移动浏览器：广泛支持"
                        ]
                    },
                    {
                        title: "可访问性",
                        code: '<details>\n  <summary aria-expanded="false">更多信息</summary>\n  <p>内容...</p>\n</details>\n\n<!-- aria-expanded会自动更新 -->',
                        points: [
                            "自动管理aria-expanded",
                            "键盘可访问（Enter/Space）",
                            "屏幕阅读器友好",
                            "语义清晰"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["dialog", "模态框"],
            question: "<dialog>标签的用法和API？",
            options: [
                "原生模态框/对话框",
                "show()和showModal()方法",
                "自动管理焦点",
                "支持backdrop样式"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<dialog>标签",
                description: "HTML5.2引入的原生对话框元素。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<dialog id="myDialog">\n  <h2>对话框标题</h2>\n  <p>对话框内容</p>\n  <button onclick="myDialog.close()">关闭</button>\n</dialog>\n\n<button onclick="myDialog.show()">显示对话框</button>\n<button onclick="myDialog.showModal()">显示模态框</button>\n\n<script>\nconst dialog = document.getElementById("myDialog");\n\n// 非模态\ndialog.show();  // 可以与页面其他元素交互\n\n// 模态\ndialog.showModal();  // 背景遮罩，无法与页面交互\n\n// 关闭\ndialog.close();\ndialog.close("returnValue");  // 带返回值\n</script>',
                        points: [
                            "show()：非模态对话框",
                            "showModal()：模态对话框",
                            "close()：关闭",
                            "默认隐藏"
                        ]
                    },
                    {
                        title: "模态框特性",
                        code: '<dialog id="modal">\n  <form method="dialog">\n    <h2>确认删除</h2>\n    <p>确定要删除这条记录吗？</p>\n    <button value="cancel">取消</button>\n    <button value="confirm">确定</button>\n  </form>\n</dialog>\n\n<script>\nconst modal = document.getElementById("modal");\n\n// 打开模态框\nmodal.showModal();\n\n// 监听关闭\nmodal.addEventListener("close", () => {\n  console.log("返回值:", modal.returnValue);\n  // cancel 或 confirm\n});\n\n// ESC键自动关闭\n// 焦点自动管理\n// 背景不可交互\n</script>',
                        points: [
                            "form[method=dialog]：按钮关闭对话框",
                            "ESC键自动关闭",
                            "自动焦点管理",
                            "背景遮罩",
                            "返回值通过returnValue获取"
                        ]
                    },
                    {
                        title: "CSS样式",
                        code: '<style>\n/* 对话框本身 */\ndialog {\n  border: none;\n  border-radius: 8px;\n  box-shadow: 0 0 20px rgba(0,0,0,0.3);\n  padding: 20px;\n  min-width: 300px;\n}\n\n/* 背景遮罩（仅模态框） */\ndialog::backdrop {\n  background: rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(3px);\n}\n\n/* 打开状态 */\ndialog[open] {\n  animation: fadeIn 0.3s;\n}\n\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n    transform: scale(0.9);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n</style>',
                        content: "::backdrop伪元素样式化背景遮罩。"
                    },
                    {
                        title: "阻止关闭",
                        code: 'const dialog = document.getElementById("dialog");\n\n// 阻止ESC关闭\ndialog.addEventListener("cancel", (e) => {\n  if (!confirmClose()) {\n    e.preventDefault();\n  }\n});\n\n// 阻止点击背景关闭（需要手动实现）\ndialog.addEventListener("click", (e) => {\n  if (e.target === dialog) {\n    // 点击背景\n    const rect = dialog.getBoundingClientRect();\n    const isInDialog = (\n      e.clientX >= rect.left &&\n      e.clientX <= rect.right &&\n      e.clientY >= rect.top &&\n      e.clientY <= rect.bottom\n    );\n    if (!isInDialog) {\n      dialog.close();\n    }\n  }\n});',
                        content: "可以控制关闭行为。"
                    },
                    {
                        title: "完整示例",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    dialog {\n      border: none;\n      border-radius: 8px;\n      padding: 0;\n      max-width: 500px;\n    }\n    \n    dialog::backdrop {\n      background: rgba(0, 0, 0, 0.5);\n    }\n    \n    dialog header {\n      background: #4CAF50;\n      color: white;\n      padding: 15px;\n    }\n    \n    dialog main {\n      padding: 20px;\n    }\n    \n    dialog footer {\n      padding: 15px;\n      text-align: right;\n      border-top: 1px solid #ddd;\n    }\n  </style>\n</head>\n<body>\n  <button id="openBtn">打开对话框</button>\n  \n  <dialog id="myDialog">\n    <header>\n      <h2>对话框标题</h2>\n    </header>\n    <main>\n      <p>这是对话框的内容。</p>\n      <label>\n        姓名：<input type="text" id="name">\n      </label>\n    </main>\n    <footer>\n      <button id="cancelBtn">取消</button>\n      <button id="confirmBtn">确定</button>\n    </footer>\n  </dialog>\n  \n  <script>\n    const dialog = document.getElementById("myDialog");\n    const openBtn = document.getElementById("openBtn");\n    const cancelBtn = document.getElementById("cancelBtn");\n    const confirmBtn = document.getElementById("confirmBtn");\n    \n    openBtn.onclick = () => {\n      dialog.showModal();\n      document.getElementById("name").focus();\n    };\n    \n    cancelBtn.onclick = () => {\n      dialog.close("cancelled");\n    };\n    \n    confirmBtn.onclick = () => {\n      const name = document.getElementById("name").value;\n      dialog.close(name);\n    };\n    \n    dialog.addEventListener("close", () => {\n      console.log("返回值:", dialog.returnValue);\n    });\n  </script>\n</body>\n</html>',
                        content: "完整的对话框实现。"
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "Chrome 37+",
                            "Firefox 98+",
                            "Safari 15.4+",
                            "Edge 79+",
                            "需要polyfill兼容旧浏览器"
                        ]
                    }
                ]
            },
            source: "HTML Living Standard"
        },
        {
            difficulty: "hard",
            tags: ["mark", "highlight"],
            question: "<mark>标签的语义和使用场景？",
            options: [
                "标记需要突出显示的文本",
                "不同于<strong>和<em>",
                "常用于搜索结果高亮",
                "默认黄色背景"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<mark>标签",
                description: "mark表示标记或高亮显示的文本。",
                sections: [
                    {
                        title: "语义",
                        code: '<!-- mark：标记/高亮 -->\n<p>搜索<mark>JavaScript</mark>，找到3个结果。</p>\n\n<!-- strong：重要性 -->\n<p>这很<strong>重要</strong>！</p>\n\n<!-- em：强调语气 -->\n<p>我<em>真的</em>很喜欢。</p>',
                        points: [
                            "mark：相关性、引起注意",
                            "strong：重要性",
                            "em：强调语气",
                            "三者语义不同"
                        ]
                    },
                    {
                        title: "搜索结果高亮",
                        code: '<form action="/search">\n  <input type="search" name="q" value="JavaScript">\n  <button>搜索</button>\n</form>\n\n<div class="results">\n  <article>\n    <h3><mark>JavaScript</mark>入门教程</h3>\n    <p>学习<mark>JavaScript</mark>的最佳实践...</p>\n  </article>\n  \n  <article>\n    <h3>深入理解<mark>JavaScript</mark>闭包</h3>\n    <p><mark>JavaScript</mark>闭包是一个重要概念...</p>\n  </article>\n</div>',
                        content: "最常见的用途：搜索关键词高亮。"
                    },
                    {
                        title: "引用中的标记",
                        code: '<blockquote>\n  <p>\n    代码是写给人看的，<mark>顺便</mark>让机器执行。\n  </p>\n</blockquote>\n<p>\n  注意这句话中的"顺便"一词，强调了代码可读性的重要性。\n</p>',
                        content: "标记引用中需要注意的部分。"
                    },
                    {
                        title: "差异对比",
                        code: '<!-- 代码diff -->\n<pre><code>\nfunction hello() {\n  <mark class="removed">console.log("old");</mark>\n  <mark class="added">console.log("new");</mark>\n}\n</code></pre>\n\n<style>\n.removed {\n  background-color: #ffcccc;\n  text-decoration: line-through;\n}\n\n.added {\n  background-color: #ccffcc;\n}\n</style>',
                        content: "配合类名实现差异对比。"
                    },
                    {
                        title: "JavaScript动态高亮",
                        code: 'function highlightText(element, keyword) {\n  const text = element.textContent;\n  const regex = new RegExp(`(${keyword})`, "gi");\n  const html = text.replace(regex, "<mark>$1</mark>");\n  element.innerHTML = html;\n}\n\n// 使用\nconst article = document.querySelector("article");\nhighlightText(article, "JavaScript");\n\n// 更好的方案：保留HTML结构\nfunction highlightKeyword(node, keyword) {\n  const regex = new RegExp(keyword, "gi");\n  \n  function walk(node) {\n    if (node.nodeType === 3) {  // 文本节点\n      const text = node.textContent;\n      if (regex.test(text)) {\n        const span = document.createElement("span");\n        span.innerHTML = text.replace(regex, "<mark>$&</mark>");\n        node.parentNode.replaceChild(span, node);\n      }\n    } else if (node.nodeType === 1 && node.tagName !== "MARK") {\n      Array.from(node.childNodes).forEach(walk);\n    }\n  }\n  \n  walk(node);\n}\n\nhighlightKeyword(document.body, "JavaScript");',
                        content: "动态标记搜索关键词。"
                    },
                    {
                        title: "样式自定义",
                        code: '<style>\nmark {\n  background-color: yellow;  /* 默认 */\n  color: black;\n  padding: 0 2px;\n}\n\n/* 不同类型的标记 */\nmark.search-result {\n  background-color: #ffeb3b;\n}\n\nmark.important {\n  background-color: #ff9800;\n  font-weight: bold;\n}\n\nmark.changed {\n  background-color: #4caf50;\n  color: white;\n}\n\n/* 动画效果 */\n@keyframes highlight {\n  from { background-color: transparent; }\n  to { background-color: yellow; }\n}\n\nmark.animated {\n  animation: highlight 0.5s ease-in;\n}\n</style>',
                        content: "可以完全自定义mark样式。"
                    }
                ]
            },
            source: "HTML5规范"
        }
    ],
    navigation: {
        prev: { title: "表单高级", url: "11-forms-advanced-quiz.html" },
        next: { title: "HTML5 API（上）", url: "13-html5-api-1-quiz.html" }
    }
};
