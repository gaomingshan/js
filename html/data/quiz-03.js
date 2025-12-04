// 第3章：头部元素详解 - 面试题
window.htmlQuizData_03 = {
    config: {
        title: "头部元素详解",
        icon: "📋",
        description: "测试你对HTML头部元素的掌握程度",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["title标签", "SEO"],
            question: "<title>标签的作用是什么？",
            type: "multiple-choice",
            options: [
                "定义浏览器标签页或窗口的标题",
                "作为搜索引擎结果的标题",
                "作为浏览器收藏夹的标题",
                "定义页面内容的标题"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<title>标签的作用",
                description: "<title>是最重要的SEO元素之一。",
                points: [
                    "显示在浏览器标签页/窗口标题栏",
                    "搜索引擎结果中的点击链接文字",
                    "浏览器收藏夹/书签中的标题",
                    "社交媒体分享时的默认标题",
                    "不会显示在页面内容中（与<h1>不同）",
                    "每个HTML文档必须有且只有一个<title>"
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "easy",
            tags: ["meta标签", "viewport"],
            question: "以下哪个viewport设置是移动端网页的标准配置？",
            options: [
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                '<meta name="viewport" content="width=1024">',
                '<meta name="viewport" content="initial-scale=0.5">',
                '<meta name="viewport" content="maximum-scale=5">'
            ],
            correctAnswer: "A",
            explanation: {
                title: "viewport设置",
                description: "viewport meta标签控制移动端页面的显示。",
                sections: [
                    {
                        title: "标准配置",
                        code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                        points: [
                            "width=device-width：视口宽度等于设备宽度",
                            "initial-scale=1.0：初始缩放比例为1（不缩放）"
                        ]
                    },
                    {
                        title: "其他常用属性",
                        points: [
                            "minimum-scale：最小缩放比例",
                            "maximum-scale：最大缩放比例",
                            "user-scalable：是否允许用户缩放（no/yes）",
                            "viewport-fit：全面屏适配（cover/contain）"
                        ]
                    },
                    {
                        title: "完整示例",
                        code: '<meta name="viewport" \n      content="width=device-width, \n               initial-scale=1.0, \n               maximum-scale=5.0, \n               user-scalable=yes">'
                    },
                    {
                        title: "注意",
                        content: "不建议设置user-scalable=no，这会影响可访问性，阻止用户放大页面。"
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "medium",
            tags: ["meta标签", "SEO"],
            question: "以下哪些<meta>标签对SEO有帮助？",
            type: "multiple-choice",
            options: [
                '<meta name="description" content="页面描述">',
                '<meta name="keywords" content="关键词">',
                '<meta name="robots" content="index,follow">',
                '<meta name="author" content="作者名">'
            ],
            correctAnswer: ["A", "C"],
            explanation: {
                title: "SEO相关的meta标签",
                description: "不同的meta标签对SEO的影响各不相同。",
                sections: [
                    {
                        title: "重要的SEO meta标签",
                        points: [
                            "description：页面描述，显示在搜索结果中（非常重要）",
                            "robots：控制搜索引擎爬虫行为（index/noindex, follow/nofollow）",
                            "viewport：移动端友好性信号"
                        ]
                    },
                    {
                        title: "已失效的meta标签",
                        points: [
                            "keywords：已被主流搜索引擎忽略",
                            "原因：曾被大量滥用进行关键词堆砌",
                            "Google从2009年开始不再使用keywords"
                        ]
                    },
                    {
                        title: "其他meta标签",
                        points: [
                            "author：作者信息，对SEO影响很小",
                            "copyright：版权信息",
                            "generator：生成工具信息"
                        ]
                    },
                    {
                        title: "description最佳实践",
                        code: '<meta name="description" \n      content="简洁明了的页面描述，150-160字符，包含关键信息">',
                        points: [
                            "长度：150-160个字符",
                            "独特：每个页面应有不同的描述",
                            "包含关键词，但自然流畅",
                            "吸引用户点击"
                        ]
                    }
                ]
            },
            source: "Google SEO指南"
        },
        {
            difficulty: "medium",
            tags: ["link标签", "资源加载"],
            question: "<link>标签的rel='preload'和rel='prefetch'有什么区别？",
            options: [
                "preload用于当前页面必需的资源，prefetch用于未来可能需要的资源",
                "preload用于CSS，prefetch用于JavaScript",
                "preload优先级低，prefetch优先级高",
                "两者完全相同"
            ],
            correctAnswer: "A",
            explanation: {
                title: "资源预加载对比",
                description: "preload和prefetch是两种不同的资源加载优化策略。",
                sections: [
                    {
                        title: "preload（预加载）",
                        code: '<link rel="preload" href="style.css" as="style">\n<link rel="preload" href="font.woff2" as="font" crossorigin>',
                        points: [
                            "用途：当前页面必需的关键资源",
                            "优先级：高",
                            "加载时机：立即开始加载",
                            "使用场景：关键CSS、字体、首屏图片",
                            "必须指定as属性"
                        ]
                    },
                    {
                        title: "prefetch（预获取）",
                        code: '<link rel="prefetch" href="next-page.html">\n<link rel="prefetch" href="next-page.css">',
                        points: [
                            "用途：未来导航可能需要的资源",
                            "优先级：低",
                            "加载时机：浏览器空闲时",
                            "使用场景：下一页面的资源",
                            "不会阻塞当前页面"
                        ]
                    },
                    {
                        title: "其他预加载策略",
                        code: '<link rel="dns-prefetch" href="//example.com">\n<link rel="preconnect" href="//example.com">',
                        points: [
                            "dns-prefetch：提前解析DNS",
                            "preconnect：提前建立连接",
                            "modulepreload：预加载ES模块"
                        ]
                    },
                    {
                        title: "使用建议",
                        content: "preload用于优化LCP（最大内容绘制），prefetch用于优化下一页加载速度。不要过度使用，否则会浪费带宽。"
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "medium",
            tags: ["link标签", "图标"],
            question: "如何为网站设置favicon图标？",
            type: "multiple-choice",
            options: [
                '<link rel="icon" href="favicon.ico">',
                '<link rel="icon" type="image/png" href="favicon.png">',
                '<link rel="apple-touch-icon" href="apple-icon.png">',
                '<link rel="shortcut icon" href="favicon.ico">'
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Favicon设置",
                description: "不同的rel值用于不同平台和场景。",
                sections: [
                    {
                        title: "基础图标",
                        code: '<!-- 推荐的现代写法 -->\n<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png">\n\n<!-- ICO格式（兼容旧浏览器） -->\n<link rel="icon" href="favicon.ico">',
                        points: [
                            "icon：标准图标",
                            "sizes：指定图标尺寸",
                            "type：指定MIME类型"
                        ]
                    },
                    {
                        title: "Apple设备",
                        code: '<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">',
                        points: [
                            "用于iOS主屏幕图标",
                            "推荐尺寸：180x180px",
                            "会自动添加圆角和高光效果"
                        ]
                    },
                    {
                        title: "Android/Chrome",
                        code: '<link rel="manifest" href="site.webmanifest">',
                        content: "使用Web App Manifest文件定义各种尺寸的图标。"
                    },
                    {
                        title: "shortcut icon（旧写法）",
                        code: '<link rel="shortcut icon" href="favicon.ico">',
                        content: "这是旧的写法，rel='icon'就足够了，但为了兼容性有时会保留。"
                    },
                    {
                        title: "完整示例",
                        code: '<!-- 现代网站的完整favicon配置 -->\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">'
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "hard",
            tags: ["base标签", "URL"],
            question: "<base>标签的作用是什么？使用时需要注意什么？",
            options: [
                "为页面上所有相对URL指定基础URL",
                "必须放在<head>中，且只能有一个",
                "会影响锚点链接（#hash）的行为",
                "只影响CSS和JavaScript的URL"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<base>标签详解",
                description: "<base>标签设置页面的基础URL，影响所有相对链接。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<head>\n  <base href="https://example.com/">\n  <base target="_blank">\n</head>\n\n<body>\n  <a href="page.html">链接</a>  <!-- 实际指向 https://example.com/page.html -->\n  <img src="image.jpg">  <!-- 实际指向 https://example.com/image.jpg -->\n</body>',
                        points: [
                            "href属性：设置基础URL",
                            "target属性：设置默认打开方式",
                            "影响所有相对URL（HTML、CSS、JavaScript）"
                        ]
                    },
                    {
                        title: "使用限制",
                        points: [
                            "每个文档只能有一个<base>标签",
                            "必须在<head>中",
                            "必须在任何URL引用之前",
                            "一旦设置，无法通过JavaScript修改"
                        ]
                    },
                    {
                        title: "影响锚点链接",
                        code: '<base href="https://example.com/">\n<a href="#section">跳转</a>  <!-- 实际指向 https://example.com/#section -->\n<!-- 如果当前页面是 https://example.com/page.html，这个链接会导航到首页！ -->',
                        content: "这是一个常见陷阱：使用<base>后，锚点链接会指向基础URL+hash，而不是当前页面的hash。"
                    },
                    {
                        title: "解决方案",
                        code: '<!-- 使用当前页面的完整URL作为base -->\n<base href="https://example.com/page.html">\n<a href="#section">跳转</a>  <!-- 正确指向 https://example.com/page.html#section -->',
                        content: "或者避免使用<base>标签，改用绝对路径或服务器端处理。"
                    },
                    {
                        title: "使用场景",
                        points: [
                            "SPA应用设置基础路径",
                            "页面部署在子目录",
                            "内容分发网络（CDN）",
                            "但要注意潜在问题，谨慎使用"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["script标签", "加载"],
            question: "<script>标签应该放在<head>还是<body>底部？为什么？",
            options: [
                "放在<body>底部，避免阻塞页面渲染",
                "放在<head>中使用async/defer属性",
                "关键脚本放<head>，非关键脚本放底部",
                "没有区别，随意放置"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<script>标签位置策略",
                description: "script的位置和加载方式直接影响页面性能。",
                sections: [
                    {
                        title: "传统方式：放在底部",
                        code: '<body>\n  <!-- 页面内容 -->\n  <h1>标题</h1>\n  <p>内容</p>\n  \n  <!-- 脚本放在底部 -->\n  <script src="app.js"></script>\n</body>',
                        points: [
                            "优点：不阻塞HTML解析和渲染",
                            "优点：确保DOM已加载",
                            "缺点：脚本加载延迟",
                            "缺点：页面可能短暂无交互"
                        ]
                    },
                    {
                        title: "现代方式1：使用defer",
                        code: '<head>\n  <script src="app.js" defer></script>\n</head>',
                        points: [
                            "异步下载，不阻塞HTML解析",
                            "HTML解析完成后，DOMContentLoaded之前执行",
                            "保持脚本执行顺序",
                            "推荐用于主要应用脚本"
                        ]
                    },
                    {
                        title: "现代方式2：使用async",
                        code: '<head>\n  <script src="analytics.js" async></script>\n</head>',
                        points: [
                            "异步下载，下载完立即执行",
                            "不保证执行顺序",
                            "适合独立的第三方脚本（如统计代码）",
                            "可能在DOMContentLoaded之前或之后执行"
                        ]
                    },
                    {
                        title: "defer vs async",
                        code: '<!-- defer: 按顺序执行，等待DOM -->\n<script src="lib.js" defer></script>\n<script src="app.js" defer></script>  <!-- 会在lib.js之后执行 -->\n\n<!-- async: 谁先下载完谁先执行 -->\n<script src="analytics.js" async></script>\n<script src="ads.js" async></script>  <!-- 执行顺序不确定 -->'
                    },
                    {
                        title: "模块脚本",
                        code: '<script type="module" src="app.js"></script>  <!-- 默认defer行为 -->',
                        content: "ES模块默认具有defer行为。"
                    },
                    {
                        title: "最佳实践",
                        points: [
                            "主应用脚本：使用defer，放在<head>",
                            "独立第三方脚本：使用async",
                            "关键脚本：内联在<head>（如polyfill）",
                            "大型脚本：代码分割，按需加载",
                            "避免：在<head>中使用阻塞脚本"
                        ]
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "hard",
            tags: ["Open Graph", "社交分享"],
            question: "什么是Open Graph协议？如何使用？",
            options: [
                "Facebook创建的协议，用于控制社交媒体分享的内容展示",
                "Twitter创建的协议，用于推文展示",
                "Google创建的协议，用于搜索结果",
                "W3C的标准协议"
            ],
            correctAnswer: "A",
            explanation: {
                title: "Open Graph协议",
                description: "Open Graph让网页在社交媒体上有更好的展示效果。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<head>\n  <meta property="og:title" content="页面标题">\n  <meta property="og:description" content="页面描述">\n  <meta property="og:image" content="https://example.com/image.jpg">\n  <meta property="og:url" content="https://example.com/page.html">\n  <meta property="og:type" content="website">\n</head>',
                        points: [
                            "使用meta标签，property属性以og:开头",
                            "控制在Facebook、LinkedIn等平台的分享效果",
                            "提供标题、描述、图片等信息"
                        ]
                    },
                    {
                        title: "常用属性",
                        points: [
                            "og:title - 分享标题",
                            "og:description - 分享描述",
                            "og:image - 分享图片（建议1200x630px）",
                            "og:url - 规范URL",
                            "og:type - 内容类型（website/article/video等）",
                            "og:site_name - 网站名称",
                            "og:locale - 语言地区（zh_CN/en_US）"
                        ]
                    },
                    {
                        title: "Twitter Card",
                        code: '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:site" content="@username">\n<meta name="twitter:title" content="标题">\n<meta name="twitter:description" content="描述">\n<meta name="twitter:image" content="https://example.com/image.jpg">',
                        content: "Twitter有自己的Card协议，但如果没有设置，会回退使用Open Graph。"
                    },
                    {
                        title: "完整示例",
                        code: '<head>\n  <!-- 基础SEO -->\n  <title>文章标题 - 网站名</title>\n  <meta name="description" content="文章摘要">\n  \n  <!-- Open Graph -->\n  <meta property="og:title" content="文章标题">\n  <meta property="og:description" content="文章摘要">\n  <meta property="og:image" content="https://example.com/cover.jpg">\n  <meta property="og:url" content="https://example.com/article.html">\n  <meta property="og:type" content="article">\n  <meta property="og:site_name" content="网站名">\n  \n  <!-- Twitter Card -->\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:site" content="@username">\n</head>'
                    },
                    {
                        title: "测试工具",
                        points: [
                            "Facebook分享调试器：https://developers.facebook.com/tools/debug/",
                            "Twitter Card验证器：https://cards-dev.twitter.com/validator",
                            "LinkedIn检查器：https://www.linkedin.com/post-inspector/"
                        ]
                    }
                ]
            },
            source: "Open Graph Protocol"
        },
        {
            difficulty: "medium",
            tags: ["style标签", "CSS"],
            question: "<style>标签可以放在<body>中吗？",
            options: [
                "HTML5允许，但不推荐",
                "完全不允许",
                "推荐做法",
                "只能用于内联样式"
            ],
            correctAnswer: "A",
            explanation: {
                title: "<style>标签的位置",
                description: "HTML5放宽了<style>标签的位置限制。",
                sections: [
                    {
                        title: "HTML5规则",
                        points: [
                            "HTML5允许<style>放在<body>中",
                            "但必须具有scoped属性（已废弃）",
                            "或者放在允许元数据的地方"
                        ]
                    },
                    {
                        title: "为什么不推荐",
                        points: [
                            "影响性能：CSS会阻塞渲染",
                            "造成FOUC（无样式内容闪烁）",
                            "违背关注点分离原则",
                            "不利于缓存和维护"
                        ]
                    },
                    {
                        title: "使用场景",
                        code: '<body>\n  <!-- 关键CSS内联在顶部 -->\n  <style>\n    .above-fold { /* 首屏样式 */ }\n  </style>\n  \n  <!-- 页面内容 -->\n  <div class="above-fold">...</div>\n</body>',
                        content: "唯一合理的场景是内联关键CSS（Critical CSS）优化首屏渲染。"
                    },
                    {
                        title: "最佳实践",
                        points: [
                            "主要样式：外部CSS文件，放在<head>",
                            "关键样式：内联在<head>的<style>",
                            "组件样式：CSS-in-JS或CSS Modules",
                            "避免：在<body>中间插入<style>"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["meta标签", "http-equiv"],
            question: "<meta http-equiv>有哪些常用的值？",
            type: "multiple-choice",
            options: [
                "content-type - 设置内容类型和字符编码",
                "refresh - 自动刷新或跳转",
                "X-UA-Compatible - IE兼容模式",
                "Content-Security-Policy - 内容安全策略"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "http-equiv属性",
                description: "http-equiv模拟HTTP响应头。",
                sections: [
                    {
                        title: "content-type（已过时）",
                        code: '<!-- HTML4写法（不推荐） -->\n<meta http-equiv="content-type" content="text/html; charset=UTF-8">\n\n<!-- HTML5写法（推荐） -->\n<meta charset="UTF-8">',
                        content: "HTML5中应使用简化的charset属性。"
                    },
                    {
                        title: "refresh - 自动刷新/跳转",
                        code: '<!-- 5秒后刷新 -->\n<meta http-equiv="refresh" content="5">\n\n<!-- 3秒后跳转 -->\n<meta http-equiv="refresh" content="3; url=https://example.com">',
                        points: [
                            "可实现自动刷新或跳转",
                            "不推荐：影响可访问性和用户体验",
                            "更好的方案：JavaScript实现"
                        ]
                    },
                    {
                        title: "X-UA-Compatible - IE兼容",
                        code: '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
                        points: [
                            "告诉IE使用最新的渲染引擎",
                            "主要用于IE8-IE11",
                            "现在IE已停止支持，可以移除"
                        ]
                    },
                    {
                        title: "Content-Security-Policy",
                        code: '<meta http-equiv="Content-Security-Policy" \n      content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'">',
                        points: [
                            "设置内容安全策略",
                            "更推荐在HTTP头中设置",
                            "meta标签设置有一些限制"
                        ]
                    },
                    {
                        title: "其他值",
                        points: [
                            "cache-control - 缓存控制",
                            "expires - 过期时间",
                            "pragma - 缓存模式",
                            "注：这些最好在服务器HTTP头中设置"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        }
    ],
    navigation: {
        prev: { title: "文档结构与语法", url: "02-document-structure-quiz.html" },
        next: { title: "文本内容标签", url: "04-text-content-quiz.html" }
    }
};
