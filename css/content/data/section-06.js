// 第6章：样式表加载与阻塞
window.cssContentData_Section06 = {
    section: {
        id: 6,
        title: "样式表加载与阻塞",
        icon: "📊",
        topics: [
            {
                id: "css-loading",
                title: "CSS加载时机",
                type: "principle",
                content: {
                    description: "CSS的加载和解析会影响页面的渲染时机。",
                    mechanism: "浏览器遇到<link>标签时会立即开始下载CSS，CSS下载和解析会阻塞渲染树构建。",
                    steps: [
                        "浏览器解析HTML，遇到<link>标签",
                        "发起CSS文件请求（不阻塞HTML解析）",
                        "CSS下载完成后开始解析",
                        "CSSOM构建完成前，渲染被阻塞",
                        "CSSOM+DOM → 渲染树 → 渲染"
                    ]
                }
            },
            {
                id: "render-blocking",
                title: "渲染阻塞",
                type: "concept",
                content: {
                    description: "CSS是渲染阻塞资源，必须等待CSS加载和解析完成才能渲染页面。",
                    keyPoints: [
                        "CSS会阻塞渲染，但不阻塞HTML解析",
                        "CSS会阻塞后续的JavaScript执行",
                        "媒体查询可以将CSS标记为非阻塞",
                        "关键CSS应内联或优先加载",
                        "非关键CSS可以异步加载"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/Performance/CSS_performance"
                }
            },
            {
                id: "critical-css",
                title: "关键CSS优化",
                type: "code-example",
                content: {
                    description: "关键CSS是首屏渲染必需的样式，应优先加载。",
                    examples: [
                        {
                            title: "内联关键CSS",
                            code: '<head>\n  <style>\n    /* 首屏关键样式内联 */\n    body { margin: 0; }\n    header { height: 60px; }\n  </style>\n</head>',
                            result: "减少首屏渲染时间"
                        },
                        {
                            title: "异步加载非关键CSS",
                            code: '<link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="style.css"></noscript>',
                            result: "非阻塞加载"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第5章：CSS解析机制", url: "05-css-parsing.html" },
        next: { title: "第7章：层叠算法", url: "07-cascade.html" }
    }
};
