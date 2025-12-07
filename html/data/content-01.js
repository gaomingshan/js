// 第1章：HTML简介与历史 - 内容数据
window.htmlContentData_01 = {
    section: {
        title: "HTML简介与历史",
        icon: "📘"
    },
    topics: [
        {
            type: "concept",
            title: "什么是HTML？",
            content: {
                description: "HTML（HyperText Markup Language，超文本标记语言）是用于创建网页的标准标记语言。它描述了网页的结构和内容，通过标签（tags）来定义不同的元素。",
                keyPoints: [
                    "HTML不是编程语言，而是标记语言（Markup Language）",
                    "使用标签（如 <p>、<h1>、<div>）来描述内容的语义",
                    "HTML文档是纯文本文件，可以用任何文本编辑器编辑",
                    "浏览器读取HTML文档并将其渲染为可视化的网页",
                    "HTML定义结构，CSS定义样式，JavaScript定义行为"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML"
            }
        },
        {
            type: "principle",
            title: "HTML的诞生与发展",
            content: {
                description: "HTML由Tim Berners-Lee于1991年创建，目的是为科学家之间共享文档。从那时起，HTML经历了多个版本的演进。",
                mechanism: "HTML的演进史体现了Web技术从简单文档展示到复杂应用平台的转变过程。",
                keyPoints: [
                    "1991年：Tim Berners-Lee发布HTML第一个公开版本",
                    "1995年：HTML 2.0成为第一个标准版本",
                    "1997年：HTML 3.2引入表格、applet等特性",
                    "1999年：HTML 4.01成为广泛使用的版本",
                    "2000年：XHTML 1.0试图将HTML与XML结合",
                    "2014年：HTML5成为W3C推荐标准",
                    "2016年：HTML 5.1发布",
                    "2017年：HTML 5.2发布",
                    "至今：HTML Living Standard持续更新"
                ]
            }
        },
        {
            type: "code-example",
            title: "第一个HTML文档",
            content: {
                description: "让我们看看一个最简单的HTML文档是什么样的：",
                examples: [
                    {
                        title: "基础HTML文档结构",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>我的第一个网页</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>这是我的第一个HTML页面。</p>
</body>
</html>`,
                        result: "浏览器会显示一个标题「Hello, World!」和一段文字",
                        notes: "DOCTYPE声明告诉浏览器这是HTML5文档"
                    },
                    {
                        title: "HTML标签的基本结构",
                        code: `<tagname>内容</tagname>

<!-- 例如 -->
<p>这是一个段落</p>
<h1>这是一个标题</h1>
<a href="https://example.com">这是一个链接</a>`,
                        notes: "大多数HTML元素由开始标签、内容和结束标签组成"
                    },
                    {
                        title: "自闭合标签",
                        code: `<!-- 某些标签不需要结束标签 -->
<img src="image.jpg" alt="描述">
<br>
<hr>
<input type="text">
<meta charset="UTF-8">`,
                        notes: "这些元素没有内容，称为空元素或自闭合元素"
                    }
                ]
            }
        },
        {
            type: "comparison",
            title: "W3C vs WHATWG",
            content: {
                description: "HTML标准曾由两个组织维护：W3C（万维网联盟）和WHATWG（网页超文本应用技术工作组）。2019年后，WHATWG成为唯一标准制定者。",
                items: [
                    {
                        name: "W3C (万维网联盟)",
                        pros: [
                            "历史悠久，成立于1994年",
                            "制定了HTML 4.01、XHTML等早期标准",
                            "采用版本化发布模式（HTML5, 5.1, 5.2）",
                            "更注重形式化和规范性"
                        ],
                        cons: [
                            "标准更新较慢",
                            "与浏览器实际实现有时存在差距",
                            "2019年停止HTML标准维护"
                        ]
                    },
                    {
                        name: "WHATWG (Web超文本应用技术工作组)",
                        pros: [
                            "由主流浏览器厂商（Apple、Mozilla、Google）创建",
                            "采用Living Standard（持续更新）模式",
                            "更贴近浏览器实际实现",
                            "2019年后成为HTML唯一标准"
                        ],
                        cons: [
                            "没有明确的版本号",
                            "标准一直在演进，可能造成混淆"
                        ]
                    }
                ]
            }
        },
        {
            type: "principle",
            title: "HTML5的重大创新",
            content: {
                description: "HTML5不仅是对HTML的版本升级，更是Web平台的重大革新，引入了大量新特性。",
                keyPoints: [
                    "新的语义化标签：<header>、<nav>、<article>、<section>、<footer>等",
                    "多媒体支持：<video>、<audio>原生支持音视频",
                    "图形绘制：<canvas>和SVG支持",
                    "本地存储：localStorage、sessionStorage、IndexedDB",
                    "离线应用：Application Cache（已废弃）、Service Worker",
                    "新的表单控件：date、email、url、range等输入类型",
                    "地理定位：Geolocation API",
                    "拖放功能：Drag and Drop API",
                    "Web Workers：后台线程",
                    "WebSocket：双向通信"
                ]
            }
        },
        {
            type: "code-example",
            title: "HTML5新特性示例",
            content: {
                description: "以下是一些HTML5引入的新特性代码示例：",
                examples: [
                    {
                        title: "语义化标签",
                        code: `<article>
    <header>
        <h1>文章标题</h1>
        <time datetime="2024-01-15">2024年1月15日</time>
    </header>
    <section>
        <h2>章节标题</h2>
        <p>文章内容...</p>
    </section>
    <footer>
        <p>作者：张三</p>
    </footer>
</article>`,
                        notes: "使用语义化标签使HTML结构更清晰，有利于SEO和可访问性"
                    },
                    {
                        title: "多媒体元素",
                        code: `<!-- 视频 -->
<video controls width="640" height="360">
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.webm" type="video/webm">
    您的浏览器不支持视频标签。
</video>

<!-- 音频 -->
<audio controls>
    <source src="music.mp3" type="audio/mpeg">
    <source src="music.ogg" type="audio/ogg">
    您的浏览器不支持音频标签。
</audio>`,
                        notes: "HTML5提供了原生的音视频支持，无需Flash插件"
                    },
                    {
                        title: "新的表单输入类型",
                        code: `<form>
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" required>
    
    <label for="date">日期：</label>
    <input type="date" id="date" name="date">
    
    <label for="range">范围：</label>
    <input type="range" id="range" min="0" max="100">
    
    <label for="color">颜色：</label>
    <input type="color" id="color" name="color">
</form>`,
                        notes: "新的输入类型提供内置验证和更好的用户体验"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "HTML编码最佳实践",
            content: {
                description: "遵循这些最佳实践可以写出更规范、更易维护的HTML代码：",
                practices: [
                    {
                        title: "始终使用DOCTYPE声明",
                        description: "在文档开头声明DOCTYPE，确保浏览器以标准模式渲染。",
                        example: `<!DOCTYPE html>
<html lang="zh-CN">
<!-- 文档内容 -->
</html>`
                    },
                    {
                        title: "设置正确的字符编码",
                        description: "使用UTF-8编码，支持多语言字符。",
                        example: `<head>
    <meta charset="UTF-8">
    <title>页面标题</title>
</head>`
                    },
                    {
                        title: "使用语义化标签",
                        description: "选择合适的HTML标签来表达内容的含义，而不是仅考虑视觉效果。",
                        example: `<!-- 好的做法 -->
<article>
    <header>
        <h1>文章标题</h1>
    </header>
    <p>文章内容...</p>
</article>

<!-- 不好的做法 -->
<div class="article">
    <div class="header">
        <div class="title">文章标题</div>
    </div>
    <div class="content">文章内容...</div>
</div>`
                    },
                    {
                        title: "保持代码缩进和格式化",
                        description: "使用一致的缩进（通常是2或4个空格），让代码结构清晰可读。",
                        example: `<nav>
    <ul>
        <li><a href="#home">首页</a></li>
        <li><a href="#about">关于</a></li>
        <li><a href="#contact">联系</a></li>
    </ul>
</nav>`
                    },
                    {
                        title: "添加必要的注释",
                        description: "为复杂的结构添加注释，但避免过度注释。",
                        example: `<!-- 主导航栏 -->
<nav class="main-nav">
    <!-- 导航项 -->
</nav>

<!-- 主内容区 -->
<main>
    <!-- 内容... -->
</main>`
                    },
                    {
                        title: "验证HTML代码",
                        description: "使用W3C验证器检查HTML代码的合规性。",
                        example: `<!-- 使用在线工具验证 -->
https://validator.w3.org/`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "HTML学习检查清单",
            content: {
                description: "通过这个检查清单确保你掌握了HTML基础知识：",
                items: [
                    { id: "check1", text: "理解HTML是标记语言而非编程语言" },
                    { id: "check2", text: "了解HTML的发展历史和主要版本" },
                    { id: "check3", text: "知道W3C和WHATWG的区别" },
                    { id: "check4", text: "能够编写基本的HTML文档结构" },
                    { id: "check5", text: "了解HTML5的主要新特性" },
                    { id: "check6", text: "掌握语义化标签的重要性" },
                    { id: "check7", text: "理解DOCTYPE的作用" },
                    { id: "check8", text: "知道如何设置字符编码" },
                    { id: "check9", text: "了解HTML代码的最佳实践" },
                    { id: "check10", text: "会使用W3C验证器检查代码" }
                ]
            }
        }
    ],
    navigation: {
        prev: null,
        next: { title: "文档结构与语法", url: "content.html?chapter=02" }
    }
};
