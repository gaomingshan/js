// 第19章：元数据管理 - 面试题
window.htmlQuizData_19 = {
    config: {
        title: "元数据管理",
        icon: "📋",
        description: "测试你对HTML元数据的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["基础", "meta标签"],
            question: "常用的meta标签有哪些？",
            type: "multiple-choice",
            options: [
                "charset字符集",
                "viewport视口",
                "description描述",
                "keywords关键词"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "常用meta标签",
                description: "meta标签提供页面的元数据信息。",
                sections: [
                    {
                        title: "字符集",
                        code: '<!-- 必需：字符编码 -->\n<meta charset="UTF-8">\n\n<!-- 旧写法（HTML4） -->\n<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n\n<!-- 建议 -->\n1. 必须在<head>最前面\n2. 在任何内容之前\n3. 始终使用UTF-8',
                        points: [
                            "UTF-8支持所有语言",
                            "必须放在前面",
                            "避免乱码",
                            "HTML5简化写法"
                        ]
                    },
                    {
                        title: "viewport（必需）",
                        code: '<!-- 响应式必需 -->\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\n<!-- 完整配置 -->\n<meta name="viewport" \n      content="width=device-width,\n               initial-scale=1.0,\n               minimum-scale=1.0,\n               maximum-scale=5.0,\n               user-scalable=yes">\n\n<!-- 属性说明 -->\nwidth=device-width    - 宽度等于设备宽度\ninitial-scale=1.0     - 初始缩放比例\nminimum-scale         - 最小缩放\nmaximum-scale         - 最大缩放\nuser-scalable         - 是否允许缩放（yes/no）',
                        points: [
                            "移动端必需",
                            "width=device-width",
                            "不要禁止缩放（可访问性）",
                            "影响移动端SEO"
                        ]
                    },
                    {
                        title: "description（SEO重要）",
                        code: '<!-- 页面描述 -->\n<meta name="description" \n      content="这是一个全面的HTML教程，涵盖HTML5、语义化、表单、多媒体等内容。适合初学者和进阶开发者学习。">\n\n<!-- 建议 -->\n1. 150-160个字符\n2. 包含主要关键词\n3. 准确描述页面内容\n4. 每个页面唯一\n5. 吸引用户点击',
                        points: [
                            "搜索结果摘要",
                            "影响点击率",
                            "不影响排名",
                            "简洁准确",
                            "每页唯一"
                        ]
                    },
                    {
                        title: "keywords（已过时）",
                        code: '<!-- 不推荐使用 -->\n<meta name="keywords" content="HTML, CSS, JavaScript">\n\n<!-- 原因 -->\n1. Google已忽略\n2. 容易被滥用\n3. 浪费时间\n4. 暴露关键词策略\n\n<!-- 建议：专注于优质内容，而非keywords -->',
                        content: "keywords已不重要，可省略。"
                    },
                    {
                        title: "作者和版权",
                        code: '<!-- 作者 -->\n<meta name="author" content="张三">\n\n<!-- 版权 -->\n<meta name="copyright" content="© 2024 公司名称">\n\n<!-- 生成器 -->\n<meta name="generator" content="Hugo 0.100.0">\n\n<!-- 创建时间 -->\n<meta name="date" content="2024-01-15">\n<meta name="revised" content="2024-01-20">',
                        content: "文档元信息。"
                    },
                    {
                        title: "robots（索引控制）",
                        code: '<!-- 允许索引和跟踪 -->\n<meta name="robots" content="index, follow">\n\n<!-- 不索引，不跟踪链接 -->\n<meta name="robots" content="noindex, nofollow">\n\n<!-- 其他指令 -->\nindex         - 允许索引\nnoindex       - 不索引\nfollow        - 跟踪链接\nnofollow      - 不跟踪链接\nnoarchive     - 不缓存\nnosnippet     - 不显示摘要\nnoimageindex  - 不索引图片\nnotranslate   - 不翻译\n\n<!-- 特定爬虫 -->\n<meta name="googlebot" content="noindex">\n<meta name="bingbot" content="noindex">',
                        content: "控制搜索引擎行为。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["Open Graph", "社交分享"],
            question: "Open Graph协议用于什么？",
            type: "single-choice",
            options: [
                "优化社交媒体分享",
                "提升SEO排名",
                "加快页面加载",
                "增强安全性"
            ],
            correctAnswer: "A",
            explanation: {
                title: "Open Graph协议",
                description: "优化社交媒体分享展示。",
                sections: [
                    {
                        title: "基础Open Graph",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <!-- 必需的4个属性 -->\n  <meta property="og:title" content="页面标题">\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="https://example.com/page">\n  <meta property="og:image" content="https://example.com/image.jpg">\n  \n  <!-- 推荐属性 -->\n  <meta property="og:description" content="页面描述">\n  <meta property="og:site_name" content="网站名称">\n  <meta property="og:locale" content="zh_CN">\n</head>\n</html>',
                        points: [
                            "Facebook创建",
                            "优化分享卡片",
                            "LinkedIn、微信等支持",
                            "og:前缀",
                            "property属性"
                        ]
                    },
                    {
                        title: "完整配置",
                        code: '<!-- 文章页面 -->\n<head>\n  <!-- 基础信息 -->\n  <meta property="og:title" content="HTML语义化标签详解">\n  <meta property="og:type" content="article">\n  <meta property="og:url" content="https://example.com/article/html-semantic">\n  <meta property="og:image" content="https://example.com/images/article-cover.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="HTML语义化标签示意图">\n  <meta property="og:description" content="深入讲解HTML5语义化标签的使用和最佳实践">\n  <meta property="og:site_name" content="前端学习网">\n  <meta property="og:locale" content="zh_CN">\n  \n  <!-- 文章特有 -->\n  <meta property="article:published_time" content="2024-01-15T08:00:00+08:00">\n  <meta property="article:modified_time" content="2024-01-16T10:30:00+08:00">\n  <meta property="article:author" content="https://example.com/author/zhangsan">\n  <meta property="article:section" content="HTML教程">\n  <meta property="article:tag" content="HTML">\n  <meta property="article:tag" content="语义化">\n  <meta property="article:tag" content="前端">\n</head>',
                        content: "文章类型的完整配置。"
                    },
                    {
                        title: "图片要求",
                        code: '<!-- 推荐尺寸 -->\nFacebook: 1200x630 (1.91:1)\nTwitter: 1200x675 (16:9)\nLinkedIn: 1200x627 (1.91:1)\n\n<!-- 配置 -->\n<meta property="og:image" content="https://example.com/image.jpg">\n<meta property="og:image:secure_url" content="https://example.com/image.jpg">\n<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="图片描述">\n\n<!-- 多张图片 -->\n<meta property="og:image" content="https://example.com/image1.jpg">\n<meta property="og:image" content="https://example.com/image2.jpg">',
                        points: [
                            "1200x630推荐",
                            "JPG或PNG",
                            "< 8MB",
                            "使用HTTPS",
                            "提供alt描述"
                        ]
                    },
                    {
                        title: "不同类型",
                        code: '<!-- 网站 -->\n<meta property="og:type" content="website">\n\n<!-- 文章 -->\n<meta property="og:type" content="article">\n<meta property="article:published_time" content="2024-01-15">\n<meta property="article:author" content="作者">\n\n<!-- 视频 -->\n<meta property="og:type" content="video.movie">\n<meta property="og:video" content="https://example.com/video.mp4">\n<meta property="og:video:width" content="1280">\n<meta property="og:video:height" content="720">\n<meta property="og:video:type" content="video/mp4">\n\n<!-- 音频 -->\n<meta property="og:type" content="music.song">\n<meta property="og:audio" content="https://example.com/audio.mp3">\n\n<!-- 图书 -->\n<meta property="og:type" content="book">\n<meta property="book:author" content="作者">\n<meta property="book:isbn" content="978-3-16-148410-0">\n\n<!-- 产品 -->\n<meta property="og:type" content="product">\n<meta property="product:price:amount" content="99.00">\n<meta property="product:price:currency" content="CNY">',
                        content: "根据内容类型选择。"
                    },
                    {
                        title: "测试工具",
                        code: '<!-- Facebook调试工具 -->\nhttps://developers.facebook.com/tools/debug/\n\n<!-- LinkedIn Post Inspector -->\nhttps://www.linkedin.com/post-inspector/\n\n<!-- Twitter Card Validator -->\nhttps://cards-dev.twitter.com/validator\n\n<!-- 微信分享测试 -->\n使用微信开发者工具\n\n<!-- 测试步骤 -->\n1. 输入URL\n2. 点击Scrape/Debug\n3. 查看预览\n4. 修复问题\n5. 重新抓取',
                        content: "使用工具测试分享效果。"
                    }
                ]
            },
            source: "Open Graph Protocol"
        },
        {
            difficulty: "medium",
            tags: ["Twitter Card", "社交分享"],
            question: "Twitter Card和Open Graph的区别？",
            type: "multiple-choice",
            options: [
                "Twitter Card专为Twitter设计",
                "可以共存使用",
                "Twitter也支持Open Graph",
                "提供不同的卡片类型"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Twitter Card",
                description: "Twitter的分享卡片。",
                sections: [
                    {
                        title: "基础配置",
                        code: '<!-- Twitter Card -->\n<head>\n  <!-- 卡片类型 -->\n  <meta name="twitter:card" content="summary_large_image">\n  \n  <!-- 网站Twitter账号 -->\n  <meta name="twitter:site" content="@website">\n  \n  <!-- 作者Twitter账号 -->\n  <meta name="twitter:creator" content="@author">\n  \n  <!-- 标题 -->\n  <meta name="twitter:title" content="文章标题">\n  \n  <!-- 描述 -->\n  <meta name="twitter:description" content="文章描述">\n  \n  <!-- 图片 -->\n  <meta name="twitter:image" content="https://example.com/image.jpg">\n  <meta name="twitter:image:alt" content="图片描述">\n</head>',
                        points: [
                            "name属性（不是property）",
                            "twitter:前缀",
                            "指定卡片类型",
                            "可添加账号"
                        ]
                    },
                    {
                        title: "卡片类型",
                        code: '<!-- 1. Summary Card（小图） -->\n<meta name="twitter:card" content="summary">\n<!-- 图片：1:1，最小144x144 -->\n\n<!-- 2. Summary Card with Large Image（大图） -->\n<meta name="twitter:card" content="summary_large_image">\n<!-- 图片：2:1，最小300x157，推荐1200x628 -->\n\n<!-- 3. App Card（应用） -->\n<meta name="twitter:card" content="app">\n<meta name="twitter:app:name:iphone" content="App名称">\n<meta name="twitter:app:id:iphone" content="123456789">\n<meta name="twitter:app:url:iphone" content="appscheme://...">\n\n<!-- 4. Player Card（视频/音频） -->\n<meta name="twitter:card" content="player">\n<meta name="twitter:player" content="https://example.com/player">\n<meta name="twitter:player:width" content="1280">\n<meta name="twitter:player:height" content="720">',
                        content: "4种卡片类型。"
                    },
                    {
                        title: "与Open Graph共存",
                        code: '<!-- 推荐方式：同时使用 -->\n<head>\n  <!-- Open Graph（通用） -->\n  <meta property="og:title" content="文章标题">\n  <meta property="og:description" content="文章描述">\n  <meta property="og:image" content="https://example.com/image.jpg">\n  <meta property="og:url" content="https://example.com/article">\n  \n  <!-- Twitter Card（Twitter专用） -->\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:site" content="@website">\n  <meta name="twitter:creator" content="@author">\n  \n  <!-- Twitter会优先使用twitter:标签 -->\n  <!-- 如无，则使用og:标签 -->\n</head>\n\n<!-- 最小配置（只用OG） -->\n<head>\n  <!-- Twitter会回退到OG标签 -->\n  <meta property="og:title" content="标题">\n  <meta property="og:description" content="描述">\n  <meta property="og:image" content="图片">\n  \n  <!-- 只需指定卡片类型 -->\n  <meta name="twitter:card" content="summary_large_image">\n</head>',
                        content: "Twitter支持Open Graph回退。"
                    },
                    {
                        title: "完整示例",
                        code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>HTML语义化标签详解 - 前端学习网</title>\n  \n  <!-- 基础meta -->\n  <meta name="description" content="深入讲解HTML5语义化标签的使用和最佳实践">\n  \n  <!-- Open Graph -->\n  <meta property="og:title" content="HTML语义化标签详解">\n  <meta property="og:type" content="article">\n  <meta property="og:url" content="https://example.com/article/html-semantic">\n  <meta property="og:image" content="https://example.com/images/cover.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:description" content="深入讲解HTML5语义化标签的使用和最佳实践">\n  <meta property="og:site_name" content="前端学习网">\n  <meta property="og:locale" content="zh_CN">\n  <meta property="article:published_time" content="2024-01-15">\n  <meta property="article:author" content="张三">\n  \n  <!-- Twitter Card -->\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:site" content="@frontendlearn">\n  <meta name="twitter:creator" content="@zhangsan">\n  <!-- Twitter会使用OG的title、description、image -->\n</head>\n<body>\n  <!-- 内容 -->\n</body>\n</html>',
                        content: "综合配置示例。"
                    },
                    {
                        title: "验证工具",
                        code: '<!-- Twitter Card Validator -->\nhttps://cards-dev.twitter.com/validator\n\n<!-- 使用步骤 -->\n1. 输入URL\n2. 点击"Preview card"\n3. 查看预览效果\n4. 检查错误\n5. 修复后重新验证\n\n<!-- 注意 -->\n- 首次使用需申请（现已自动批准）\n- 图片必须可访问\n- 遵守Twitter内容政策',
                        content: "使用验证工具测试。"
                    }
                ]
            },
            source: "Twitter Developer"
        },
        {
            difficulty: "hard",
            tags: ["favicon", "图标"],
            question: "如何正确设置网站图标（favicon）？",
            type: "multiple-choice",
            options: [
                "提供多种尺寸",
                "支持不同平台",
                "使用SVG格式",
                "Apple Touch Icon"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "网站图标",
                description: "为不同设备和平台提供合适的图标。",
                sections: [
                    {
                        title: "基础favicon",
                        code: '<!-- 传统方式（自动查找） -->\n<!-- 浏览器会自动查找 /favicon.ico -->\n\n<!-- 推荐方式（显式指定） -->\n<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n\n<!-- PNG格式 -->\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
                        points: [
                            "ICO兼容性最好",
                            "SVG现代且灵活",
                            "PNG清晰",
                            "提供多种尺寸",
                            "放在<head>中"
                        ]
                    },
                    {
                        title: "完整尺寸",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <!-- 标准favicon -->\n  <link rel="icon" href="/favicon.ico" sizes="any">\n  <link rel="icon" href="/favicon.svg" type="image/svg+xml">\n  \n  <!-- 不同尺寸PNG -->\n  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">\n  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">\n  <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">\n  \n  <!-- Apple设备 -->\n  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n  \n  <!-- Safari标签栏（mask-icon） -->\n  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">\n  \n  <!-- Microsoft -->\n  <meta name="msapplication-TileColor" content="#da532c">\n  <meta name="msapplication-TileImage" content="/mstile-144x144.png">\n  <meta name="msapplication-config" content="/browserconfig.xml">\n  \n  <!-- 主题色 -->\n  <meta name="theme-color" content="#ffffff">\n</head>\n</html>',
                        content: "全平台图标配置。"
                    },
                    {
                        title: "SVG Favicon",
                        code: '<!-- SVG优势 -->\n1. 矢量，任意缩放\n2. 文件小\n3. 支持深色模式\n4. 可动画\n\n<!-- favicon.svg -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <style>\n    /* 深色模式适配 */\n    @media (prefers-color-scheme: dark) {\n      circle { fill: white; }\n      text { fill: black; }\n    }\n    @media (prefers-color-scheme: light) {\n      circle { fill: #007bff; }\n      text { fill: white; }\n    }\n  </style>\n  <circle cx="50" cy="50" r="45"/>\n  <text x="50" y="65" \n        text-anchor="middle" \n        font-size="50" \n        font-weight="bold">H</text>\n</svg>\n\n<!-- HTML -->\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
                        content: "SVG支持深色模式。"
                    },
                    {
                        title: "Apple Touch Icon",
                        code: '<!-- iOS主屏幕图标 -->\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<!-- 默认：180x180 -->\n\n<!-- 不同尺寸 -->\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png">\n<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png">\n<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png">\n<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76.png">\n\n<!-- 建议 -->\n1. 方形，圆角iOS自动添加\n2. 无透明背景\n3. 180x180主要尺寸\n4. PNG格式\n\n<!-- 启动画面 -->\n<link rel="apple-touch-startup-image" href="/launch.png">\n\n<!-- Web App设置 -->\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black">\n<meta name="apple-mobile-web-app-title" content="App名称">',
                        content: "iOS专用图标。"
                    },
                    {
                        title: "Manifest.json",
                        code: '<!-- manifest.json（PWA） -->\n{\n  "name": "应用全名",\n  "short_name": "应用短名",\n  "description": "应用描述",\n  "start_url": "/",\n  "display": "standalone",\n  "background_color": "#ffffff",\n  "theme_color": "#007bff",\n  "icons": [\n    {\n      "src": "/icon-192.png",\n      "sizes": "192x192",\n      "type": "image/png",\n      "purpose": "any maskable"\n    },\n    {\n      "src": "/icon-512.png",\n      "sizes": "512x512",\n      "type": "image/png",\n      "purpose": "any maskable"\n    }\n  ]\n}\n\n<!-- HTML -->\n<link rel="manifest" href="/manifest.json">\n\n<!-- Maskable Icon（自适应） -->\n<!-- 图标需要在安全区内，周围留白 -->',
                        content: "PWA图标配置。"
                    },
                    {
                        title: "生成工具",
                        code: '<!-- 在线生成器 -->\n1. RealFaviconGenerator\n   https://realfavicongenerator.net/\n   - 上传图片\n   - 自动生成所有尺寸\n   - 生成配置代码\n\n2. Favicon.io\n   https://favicon.io/\n   - 文字生成\n   - 图片转换\n   - Emoji转换\n\n3. PWA Asset Generator\n   npx pwa-asset-generator logo.svg ./icons\n\n<!-- 文件结构 -->\n/\n├── favicon.ico\n├── favicon.svg\n├── favicon-16x16.png\n├── favicon-32x32.png\n├── apple-touch-icon.png\n├── android-chrome-192x192.png\n├── android-chrome-512x512.png\n├── manifest.json\n└── browserconfig.xml',
                        content: "使用工具自动生成。"
                    }
                ]
            },
            source: "Web标准"
        },
        {
            difficulty: "medium",
            tags: ["link标签", "资源"],
            question: "link标签的rel属性有哪些值？",
            type: "multiple-choice",
            options: [
                "stylesheet样式表",
                "preload预加载",
                "canonical规范链接",
                "alternate备用版本"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "link rel属性",
                description: "定义文档与外部资源的关系。",
                sections: [
                    {
                        title: "stylesheet",
                        code: '<!-- 链接CSS -->\n<link rel="stylesheet" href="style.css">\n\n<!-- 备用样式 -->\n<link rel="stylesheet" href="default.css" title="默认">\n<link rel="alternate stylesheet" href="dark.css" title="深色">\n<link rel="alternate stylesheet" href="large.css" title="大字体">\n\n<!-- 媒体查询 -->\n<link rel="stylesheet" href="print.css" media="print">\n<link rel="stylesheet" href="mobile.css" media="(max-width: 600px)">\n\n<!-- 预加载CSS -->\n<link rel="preload" href="style.css" as="style">\n<link rel="stylesheet" href="style.css">',
                        content: "链接样式表。"
                    },
                    {
                        title: "icon",
                        code: '<!-- 网站图标 -->\n<link rel="icon" href="/favicon.ico">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n\n<!-- Apple -->\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">\n\n<!-- 快捷方式（已弃用） -->\n<link rel="shortcut icon" href="/favicon.ico">',
                        content: "网站图标。"
                    },
                    {
                        title: "canonical",
                        code: '<!-- 规范链接（SEO重要） -->\n<link rel="canonical" href="https://example.com/article">\n\n<!-- 场景：多个URL指向同一内容 -->\n<!-- 原始页面 -->\nhttps://example.com/article\n<!-- 分页 -->\nhttps://example.com/article?page=2\n<!-- 追踪参数 -->\nhttps://example.com/article?utm_source=twitter\n<!-- 所有变体都指向canonical -->\n\n<!-- 防止重复内容惩罚 -->\n<link rel="canonical" href="https://example.com/article">',
                        points: [
                            "指定首选URL",
                            "防止重复内容",
                            "SEO必需",
                            "使用绝对URL",
                            "指向自己也可以"
                        ]
                    },
                    {
                        title: "alternate",
                        code: '<!-- 多语言版本 -->\n<link rel="alternate" hreflang="en" href="https://example.com/en/">\n<link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/">\n<link rel="alternate" hreflang="ja" href="https://example.com/ja/">\n<link rel="alternate" hreflang="x-default" href="https://example.com/">\n\n<!-- RSS订阅 -->\n<link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml">\n<link rel="alternate" type="application/atom+xml" title="Atom" href="/atom.xml">\n\n<!-- AMP版本 -->\n<link rel="amphtml" href="https://example.com/article.amp">\n\n<!-- 移动版本 -->\n<link rel="alternate" media="only screen and (max-width: 640px)" \n      href="https://m.example.com/article">',
                        content: "备用版本。"
                    },
                    {
                        title: "preload/prefetch",
                        code: '<!-- preload（当前页面必需） -->\n<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="/hero.jpg" as="image">\n<link rel="preload" href="/script.js" as="script">\n<link rel="preload" href="/style.css" as="style">\n\n<!-- prefetch（下一页可能需要） -->\n<link rel="prefetch" href="/next-page.html">\n<link rel="prefetch" href="/next-page.js">\n\n<!-- modulepreload（ES模块） -->\n<link rel="modulepreload" href="/module.js">\n\n<!-- dns-prefetch -->\n<link rel="dns-prefetch" href="https://fonts.googleapis.com">\n\n<!-- preconnect -->\n<link rel="preconnect" href="https://cdn.example.com" crossorigin>',
                        content: "资源提示。"
                    },
                    {
                        title: "其他rel值",
                        code: '<!-- manifest（PWA） -->\n<link rel="manifest" href="/manifest.json">\n\n<!-- sitemap -->\n<link rel="sitemap" type="application/xml" href="/sitemap.xml">\n\n<!-- license（版权） -->\n<link rel="license" href="/license.html">\n\n<!-- author（作者） -->\n<link rel="author" href="/about">\n\n<!-- help（帮助） -->\n<link rel="help" href="/faq">\n\n<!-- search（搜索） -->\n<link rel="search" type="application/opensearchdescription+xml" \n      title="搜索" href="/opensearch.xml">\n\n<!-- prev/next（分页） -->\n<link rel="prev" href="/page1">\n<link rel="next" href="/page3">',
                        content: "其他关系类型。"
                    },
                    {
                        title: "完整示例",
                        code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>页面标题</title>\n  \n  <!-- 图标 -->\n  <link rel="icon" href="/favicon.svg" type="image/svg+xml">\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n  \n  <!-- 样式 -->\n  <link rel="stylesheet" href="/style.css">\n  \n  <!-- SEO -->\n  <link rel="canonical" href="https://example.com/page">\n  <link rel="alternate" hreflang="en" href="https://example.com/en/page">\n  \n  <!-- 资源提示 -->\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preload" href="/font.woff2" as="font" crossorigin>\n  \n  <!-- RSS -->\n  <link rel="alternate" type="application/rss+xml" href="/feed.xml">\n  \n  <!-- PWA -->\n  <link rel="manifest" href="/manifest.json">\n</head>\n<body>\n  <!-- 内容 -->\n</body>\n</html>',
                        content: "综合使用示例。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["http-equiv", "元数据"],
            question: "meta http-equiv属性的作用？",
            type: "multiple-choice",
            options: [
                "模拟HTTP响应头",
                "设置字符集",
                "刷新和重定向",
                "CSP安全策略"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "http-equiv属性",
                description: "在HTML中模拟HTTP响应头。",
                sections: [
                    {
                        title: "Content-Type",
                        code: '<!-- HTML5之前的字符集设置 -->\n<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n\n<!-- HTML5简化写法（推荐） -->\n<meta charset="UTF-8">\n\n<!-- 等价于HTTP响应头 -->\nContent-Type: text/html; charset=UTF-8',
                        content: "设置内容类型和字符集。"
                    },
                    {
                        title: "refresh刷新/重定向",
                        code: '<!-- 5秒后刷新 -->\n<meta http-equiv="refresh" content="5">\n\n<!-- 3秒后跳转 -->\n<meta http-equiv="refresh" content="3; url=https://example.com">\n\n<!-- 立即重定向 -->\n<meta http-equiv="refresh" content="0; url=https://example.com">\n\n<!-- 不推荐理由 -->\n1. 不利于可访问性\n2. 无法控制\n3. SEO不友好\n4. 用户体验差\n\n<!-- 推荐替代方案 -->\n<!-- 1. 服务器端301/302重定向 -->\n<!-- 2. JavaScript重定向 -->\n<script>\n  setTimeout(() => {\n    window.location.href = "https://example.com";\n  }, 3000);\n</script>\n\n<!-- 3. HTML5 History API -->\n<script>\n  history.replaceState(null, "", "/new-url");\n</script>',
                        content: "自动刷新或重定向（不推荐）。"
                    },
                    {
                        title: "Content-Security-Policy",
                        code: '<!-- CSP安全策略 -->\n<meta http-equiv="Content-Security-Policy" \n      content="default-src \'self\'; script-src \'self\' https://trusted.com">\n\n<!-- 等价于HTTP响应头（更推荐） -->\nContent-Security-Policy: default-src \'self\'; script-src \'self\' https://trusted.com\n\n<!-- 示例策略 -->\n<meta http-equiv="Content-Security-Policy" \n      content="default-src \'self\';\n               script-src \'self\' \'unsafe-inline\';\n               style-src \'self\' \'unsafe-inline\';\n               img-src \'self\' data: https:;\n               font-src \'self\';\n               connect-src \'self\' https://api.example.com;\n               frame-ancestors \'none\';\n               base-uri \'self\';\n               form-action \'self\';">\n\n<!-- 注意 -->\n1. 服务器端设置更好\n2. meta无法设置某些指令（如report-uri）\n3. 可能有兼容性问题',
                        content: "内容安全策略。"
                    },
                    {
                        title: "X-UA-Compatible",
                        code: '<!-- IE兼容模式（已过时） -->\n<meta http-equiv="X-UA-Compatible" content="IE=edge">\n\n<!-- 说明 -->\nIE=edge  - 使用最新渲染引擎\nIE=11    - 使用IE11模式\nIE=9     - 使用IE9模式\n\n<!-- 现在不需要了 -->\n1. IE已停止支持\n2. Edge基于Chromium\n3. 可以移除此标签',
                        content: "IE兼容模式（已过时）。"
                    },
                    {
                        title: "Cache-Control",
                        code: '<!-- 禁用缓存 -->\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">\n\n<!-- 等价于HTTP响应头 -->\nCache-Control: no-cache, no-store, must-revalidate\nPragma: no-cache\nExpires: 0\n\n<!-- 注意 -->\n1. 服务器端设置更可靠\n2. meta标签可能被忽略\n3. 代理服务器不认meta\n\n<!-- 推荐：服务器配置 -->\n# Apache\nHeader set Cache-Control "no-cache, no-store, must-revalidate"\n\n# Nginx\nadd_header Cache-Control "no-cache, no-store, must-revalidate";',
                        content: "缓存控制（服务器端更好）。"
                    },
                    {
                        title: "其他http-equiv",
                        code: '<!-- default-style（默认样式） -->\n<meta http-equiv="default-style" content="default">\n\n<!-- content-language（内容语言） -->\n<meta http-equiv="content-language" content="zh-CN">\n<!-- 推荐使用html lang属性 -->\n<html lang="zh-CN">\n\n<!-- X-Frame-Options（点击劫持防护） -->\n<meta http-equiv="X-Frame-Options" content="DENY">\n<!-- 值：DENY, SAMEORIGIN, ALLOW-FROM uri -->\n<!-- 推荐用CSP的frame-ancestors -->\n\n<!-- Permissions-Policy（权限策略） -->\n<meta http-equiv="Permissions-Policy" \n      content="geolocation=(), microphone=()">\n<!-- 禁用地理位置和麦克风 -->',
                        content: "其他http-equiv值。"
                    },
                    {
                        title: "总结建议",
                        code: '<!-- ✅ 推荐在meta中设置 -->\n<meta charset="UTF-8">  <!-- 字符集 -->\n<meta http-equiv="X-UA-Compatible" content="IE=edge">  <!-- 如需支持旧IE -->\n\n<!-- ❌ 不推荐在meta中设置（用服务器） -->\nCache-Control         - 用服务器响应头\nContent-Security-Policy - 用服务器响应头\nX-Frame-Options       - 用服务器响应头\nrefresh               - 用JavaScript或服务器重定向\n\n<!-- 原因 -->\n1. 服务器端更可靠\n2. 更好的控制\n3. 支持更多功能\n4. meta可能被忽略',
                        content: "使用建议。"
                    }
                ]
            },
            source: "HTML规范"
        }
    ],
    navigation: {
        prev: { title: "最佳实践", url: "quiz.html?chapter=18" },
        next: { title: "浏览器渲染原理", url: "quiz.html?chapter=20" }
    }
};
