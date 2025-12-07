// 第3章：头部元素详解 - 内容数据
window.htmlContentData_03 = {
    section: {
        title: "头部元素详解",
        icon: "🎯"
    },
    topics: [
        {
            type: "concept",
            title: "<head>元素概述",
            content: {
                description: "<head>元素包含了HTML文档的元数据（metadata），这些信息不会直接显示在页面上，但对浏览器、搜索引擎和其他服务非常重要。",
                keyPoints: [
                    "<head>必须是<html>的第一个子元素",
                    "<title>是<head>中唯一必需的元素",
                    "元数据包括字符集、视口设置、SEO信息等",
                    "外部资源链接（CSS、图标）也放在<head>中",
                    "脚本可以放在<head>或<body>底部"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/head"
            }
        },
        {
            type: "code-example",
            title: "<title>标签",
            content: {
                description: "<title>定义文档标题，显示在浏览器标签页上，也是搜索结果中的主要标题。",
                examples: [
                    {
                        title: "基本用法",
                        code: `<head>
    <title>网站名称 - 页面标题</title>
</head>`,
                        notes: "建议格式：页面标题 - 网站名称"
                    },
                    {
                        title: "不同页面的title示例",
                        code: `<!-- 首页 -->
<title>公司名称 - 专业的XX服务提供商</title>

<!-- 文章页 -->
<title>文章标题 | 博客名称</title>

<!-- 产品页 -->
<title>产品名称 - 产品类别 - 商城名称</title>

<!-- 错误页 -->
<title>404 - 页面未找到 | 网站名称</title>`,
                        notes: "title应准确描述页面内容，长度建议50-60个字符"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<meta>标签 - 字符编码与视口",
            content: {
                description: "<meta>标签提供关于HTML文档的元数据，包括字符集、视口、描述等。",
                examples: [
                    {
                        title: "字符编码",
                        code: `<!-- UTF-8是推荐的字符编码 -->
<meta charset="UTF-8">

<!-- 旧版写法（HTML4） -->
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`,
                        notes: "charset必须在<head>的前1024字节内"
                    },
                    {
                        title: "视口设置（移动端必需）",
                        code: `<!-- 标准移动端视口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 禁止缩放 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- 详细参数说明 -->
<meta name="viewport" content="
    width=device-width,       /* 视口宽度等于设备宽度 */
    initial-scale=1.0,        /* 初始缩放比例 */
    minimum-scale=0.5,        /* 最小缩放比例 */
    maximum-scale=2.0,        /* 最大缩放比例 */
    user-scalable=yes         /* 允许用户缩放 */
">`,
                        notes: "移动端响应式网站必须设置viewport"
                    },
                    {
                        title: "其他常用meta",
                        code: `<!-- 兼容性设置 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- 渲染模式 -->
<meta name="renderer" content="webkit">

<!-- 禁止自动识别 -->
<meta name="format-detection" content="telephone=no,email=no,address=no">

<!-- 移动端全屏 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">`,
                        notes: "根据项目需求选择合适的meta标签"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<meta>标签 - SEO优化",
            content: {
                description: "SEO相关的meta标签帮助搜索引擎更好地理解和展示你的页面。",
                examples: [
                    {
                        title: "基础SEO meta",
                        code: `<!-- 页面描述 (150-160字符) -->
<meta name="description" content="这是页面的简短描述，会显示在搜索结果中。应该准确、吸引人，包含关键词。">

<!-- 关键词 (已不太重要，但可以添加) -->
<meta name="keywords" content="关键词1,关键词2,关键词3">

<!-- 作者 -->
<meta name="author" content="作者名称">

<!-- 版权 -->
<meta name="copyright" content="© 2024 公司名称">`,
                        notes: "description是最重要的SEO meta标签"
                    },
                    {
                        title: "搜索引擎指令",
                        code: `<!-- 默认：允许索引和跟踪链接 -->
<meta name="robots" content="index,follow">

<!-- 不允许索引此页面 -->
<meta name="robots" content="noindex,follow">

<!-- 不跟踪页面上的链接 -->
<meta name="robots" content="index,nofollow">

<!-- 完全不索引 -->
<meta name="robots" content="noindex,nofollow">

<!-- 不缓存 -->
<meta name="robots" content="noarchive">

<!-- 不在搜索结果中显示描述 -->
<meta name="robots" content="nosnippet">`,
                        notes: "robots指令告诉搜索引擎如何处理页面"
                    },
                    {
                        title: "Open Graph协议（社交分享）",
                        code: `<!-- Facebook、LinkedIn等使用 -->
<meta property="og:type" content="website">
<meta property="og:title" content="页面标题">
<meta property="og:description" content="页面描述">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:site_name" content="网站名称">

<!-- 可选 -->
<meta property="og:locale" content="zh_CN">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">`,
                        notes: "OG标签优化社交媒体分享效果"
                    },
                    {
                        title: "Twitter Card",
                        code: `<!-- Twitter分享卡片 -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@网站Twitter账号">
<meta name="twitter:creator" content="@作者Twitter账号">
<meta name="twitter:title" content="页面标题">
<meta name="twitter:description" content="页面描述">
<meta name="twitter:image" content="https://example.com/image.jpg">

<!-- card类型选项 -->
<!-- summary: 小图卡片 -->
<!-- summary_large_image: 大图卡片 -->
<!-- app: 应用卡片 -->
<!-- player: 视频/音频播放器 -->`,
                        notes: "Twitter Card增强Twitter分享体验"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<link>标签",
            content: {
                description: "<link>标签定义文档与外部资源的关系，最常用于链接样式表。",
                examples: [
                    {
                        title: "引入CSS样式表",
                        code: `<!-- 基本用法 -->
<link rel="stylesheet" href="styles.css">

<!-- 指定媒体类型 -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="screen and (max-width: 768px)">

<!-- 外部CDN -->
<link rel="stylesheet" href="https://cdn.example.com/bootstrap.min.css">

<!-- 字体文件 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto">`,
                        notes: "rel='stylesheet'表示链接的是样式表"
                    },
                    {
                        title: "网站图标（favicon）",
                        code: `<!-- 标准favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- PNG格式（推荐） -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple设备图标 -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android设备图标 -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">

<!-- Safari固定标签图标 -->
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">`,
                        notes: "提供多种尺寸的图标以适配不同设备"
                    },
                    {
                        title: "预加载和预连接",
                        code: `<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="script.js" as="script">

<!-- 预连接到外部域 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预获取下一页资源 -->
<link rel="prefetch" href="next-page.html">`,
                        notes: "预加载可以优化页面加载性能"
                    },
                    {
                        title: "规范链接（Canonical）",
                        code: `<!-- 指定页面的规范URL，避免重复内容 -->
<link rel="canonical" href="https://example.com/page">

<!-- 多语言页面的替代版本 -->
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
<link rel="alternate" hreflang="zh" href="https://example.com/zh/page">

<!-- RSS订阅 -->
<link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml">`,
                        notes: "canonical告诉搜索引擎哪个是主要URL"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<style>和<script>标签",
            content: {
                description: "<style>用于嵌入CSS，<script>用于嵌入或引入JavaScript。",
                examples: [
                    {
                        title: "内联样式",
                        code: `<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
</style>`,
                        notes: "小型项目或关键CSS可以内联"
                    },
                    {
                        title: "脚本引入",
                        code: `<!-- 外部脚本 -->
<script src="script.js"></script>

<!-- 延迟执行（推荐） -->
<script src="script.js" defer></script>

<!-- 异步加载 -->
<script src="script.js" async></script>

<!-- 内联脚本 -->
<script>
    console.log('页面已加载');
</script>

<!-- 模块脚本 -->
<script type="module" src="app.js"></script>`,
                        notes: "defer和async控制脚本加载时机"
                    },
                    {
                        title: "defer vs async",
                        code: `<!-- defer: 按顺序执行，DOMContentLoaded前完成 -->
<script src="jquery.js" defer></script>
<script src="app.js" defer></script>

<!-- async: 加载完立即执行，不保证顺序 -->
<script src="analytics.js" async></script>
<script src="ads.js" async></script>

<!-- 无属性: 立即下载并执行，阻塞HTML解析 -->
<script src="critical.js"></script>`,
                        notes: "defer适合依赖DOM的脚本，async适合独立脚本"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<base>标签",
            content: {
                description: "<base>为页面上的所有相对URL指定基准URL和默认目标。",
                examples: [
                    {
                        title: "基准URL",
                        code: `<head>
    <base href="https://example.com/">
    <!-- 所有相对链接都基于此URL -->
</head>
<body>
    <!-- 实际链接到: https://example.com/page.html -->
    <a href="page.html">链接</a>
    
    <!-- 实际链接到: https://example.com/images/logo.png -->
    <img src="images/logo.png" alt="Logo">
</body>`,
                        notes: "一个文档只能有一个<base>元素"
                    },
                    {
                        title: "默认target",
                        code: `<head>
    <base target="_blank">
</head>
<body>
    <!-- 这个链接会在新标签页打开 -->
    <a href="page.html">链接</a>
    
    <!-- 除非显式指定其他target -->
    <a href="page.html" target="_self">在当前页打开</a>
</body>`,
                        notes: "base target影响所有链接的默认打开方式"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "head元素组织最佳实践",
            content: {
                description: "合理组织head元素可以提高可维护性和加载性能：",
                practices: [
                    {
                        title: "推荐的head元素顺序",
                        description: "按照这个顺序组织head内容更加合理。",
                        example: `<head>
    <!-- 1. 字符编码（必须最先） -->
    <meta charset="UTF-8">
    
    <!-- 2. IE兼容性 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- 3. 视口设置 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- 4. 标题 -->
    <title>页面标题</title>
    
    <!-- 5. SEO meta -->
    <meta name="description" content="...">
    <meta name="keywords" content="...">
    
    <!-- 6. 社交分享 meta -->
    <meta property="og:title" content="...">
    <meta property="og:description" content="...">
    
    <!-- 7. 图标 -->
    <link rel="icon" href="/favicon.ico">
    
    <!-- 8. 样式表 -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- 9. 预加载资源 -->
    <link rel="preload" href="font.woff2" as="font">
    
    <!-- 10. 脚本（带defer） -->
    <script src="script.js" defer></script>
</head>`
                    },
                    {
                        title: "性能优化技巧",
                        description: "优化head元素以提升加载速度。",
                        example: `<!-- 使用defer延迟脚本 -->
<script src="app.js" defer></script>

<!-- 预连接到外部资源 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 关键CSS内联 -->
<style>
    /* 首屏关键样式 */
    body { margin: 0; }
</style>

<!-- 非关键CSS延迟加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>`
                    },
                    {
                        title: "避免常见错误",
                        description: "注意这些容易出错的地方。",
                        example: `<!-- ❌ 错误：charset不在前1024字节 -->
<head>
    <title>很长很长的标题...</title>
    <meta charset="UTF-8">
</head>

<!-- ✅ 正确：charset靠前 -->
<head>
    <meta charset="UTF-8">
    <title>页面标题</title>
</head>

<!-- ❌ 错误：多个base -->
<base href="https://example.com/">
<base href="https://other.com/">

<!-- ✅ 正确：只有一个base -->
<base href="https://example.com/">`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "head元素检查清单",
            content: {
                description: "使用这个清单确保head元素配置完整：",
                items: [
                    { id: "check3-1", text: "设置了字符编码（UTF-8）" },
                    { id: "check3-2", text: "设置了viewport（移动端）" },
                    { id: "check3-3", text: "title准确描述页面内容" },
                    { id: "check3-4", text: "添加了description meta" },
                    { id: "check3-5", text: "配置了favicon" },
                    { id: "check3-6", text: "引入了必要的CSS文件" },
                    { id: "check3-7", text: "脚本使用了defer或async" },
                    { id: "check3-8", text: "添加了OG标签（需要社交分享时）" },
                    { id: "check3-9", text: "设置了canonical URL（避免重复内容）" },
                    { id: "check3-10", text: "配置了预加载/预连接（性能优化）" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "文档结构与语法", url: "content.html?chapter=02" },
        next: { title: "文本内容标签", url: "content.html?chapter=04" }
    }
};
