// 第17章：性能优化 - 面试题
window.htmlQuizData_17 = {
    config: {
        title: "性能优化",
        icon: "⚡",
        description: "测试你对HTML性能优化的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["资源加载", "优化"],
            question: "script标签的defer和async有什么区别？",
            type: "multiple-choice",
            options: [
                "都不阻塞HTML解析",
                "defer保证执行顺序",
                "async立即执行",
                "defer在DOMContentLoaded前执行"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "script加载方式",
                description: "理解defer和async对性能的影响。",
                sections: [
                    {
                        title: "默认行为",
                        code: '<!-- 阻塞解析 -->\n<script src="script.js"></script>\n\n执行流程：\n1. HTML解析到script\n2. 暂停HTML解析\n3. 下载script.js\n4. 执行script.js\n5. 继续解析HTML',
                        points: [
                            "阻塞HTML解析",
                            "按顺序执行",
                            "可能延迟页面渲染",
                            "适合需要立即执行的脚本"
                        ]
                    },
                    {
                        title: "async",
                        code: '<!-- 异步加载 -->\n<script async src="analytics.js"></script>\n<script async src="ads.js"></script>\n\n执行流程：\n1. HTML解析继续\n2. 并行下载script\n3. 下载完成立即执行（可能打断HTML解析）\n4. 执行顺序不确定',
                        points: [
                            "不阻塞HTML解析",
                            "并行下载",
                            "下载完立即执行",
                            "执行顺序不确定",
                            "适合独立脚本（如统计）"
                        ]
                    },
                    {
                        title: "defer",
                        code: '<!-- 延迟执行 -->\n<script defer src="app.js"></script>\n<script defer src="utils.js"></script>\n\n执行流程：\n1. HTML解析继续\n2. 并行下载script\n3. HTML解析完成后，按顺序执行\n4. DOMContentLoaded前执行',
                        points: [
                            "不阻塞HTML解析",
                            "并行下载",
                            "HTML解析完后执行",
                            "保证执行顺序",
                            "DOMContentLoaded前完成",
                            "推荐用于大部分脚本"
                        ]
                    },
                    {
                        title: "对比图解",
                        code: '<!-- 正常 -->\n<script src="a.js"></script>  \n[HTML解析] -> [暂停] [下载+执行a] -> [继续解析]\n\n<!-- async -->\n<script async src="a.js"></script>\n[HTML解析] -> [继续...] \n             ↓\n          [下载a] -> [执行a（可能打断解析）]\n\n<!-- defer -->\n<script defer src="a.js"></script>\n[HTML解析] -> [继续...] -> [解析完成] -> [执行a] -> [DOMContentLoaded]\n             ↓\n          [下载a]',
                        content: "三种方式的时序对比。"
                    },
                    {
                        title: "实际应用",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <!-- 关键CSS内联 -->\n  <style>\n    /* 首屏样式 */\n  </style>\n  \n  <!-- 非关键CSS延迟加载 -->\n  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n</head>\n<body>\n  <!-- 内容 -->\n  \n  <!-- 主要脚本 -->\n  <script defer src="main.js"></script>\n  \n  <!-- 第三方脚本 -->\n  <script async src="analytics.js"></script>\n  <script async src="ads.js"></script>\n  \n  <!-- 不支持defer/async的浏览器 -->\n  <script>\n    if (!("async" in document.createElement("script"))) {\n      // 降级处理\n    }\n  </script>\n</body>\n</html>',
                        content: "合理组合使用。"
                    },
                    {
                        title: "选择建议",
                        points: [
                            "默认：需要立即执行且依赖DOM",
                            "defer：大部分应用脚本",
                            "async：独立的第三方脚本",
                            "关键脚本放</body>前",
                            "避免在<head>中使用阻塞脚本"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["资源提示", "预加载"],
            question: "preload、prefetch、preconnect的区别？",
            type: "multiple-choice",
            options: [
                "preload预加载当前页面资源",
                "prefetch预取下一页面资源",
                "preconnect预连接域名",
                "dns-prefetch仅做DNS解析"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "资源提示（Resource Hints）",
                description: "提前加载和连接资源以提升性能。",
                sections: [
                    {
                        title: "preload",
                        code: '<!-- 预加载关键资源 -->\n<head>\n  <!-- 字体 -->\n  <link rel="preload" \n        href="/fonts/main.woff2" \n        as="font" \n        type="font/woff2"\n        crossorigin>\n  \n  <!-- 图片 -->\n  <link rel="preload" \n        href="/images/hero.jpg" \n        as="image">\n  \n  <!-- 脚本 -->\n  <link rel="preload" \n        href="/js/critical.js" \n        as="script">\n  \n  <!-- 样式 -->\n  <link rel="preload" \n        href="/css/main.css" \n        as="style">\n</head>',
                        points: [
                            "高优先级加载",
                            "当前页面必需资源",
                            "as属性指定类型",
                            "crossorigin用于跨域",
                            "避免过度使用"
                        ]
                    },
                    {
                        title: "prefetch",
                        code: '<!-- 预取下一页资源 -->\n<head>\n  <!-- 用户可能访问的页面 -->\n  <link rel="prefetch" href="/next-page.html">\n  \n  <!-- 下一页的资源 -->\n  <link rel="prefetch" href="/js/next-page.js">\n  <link rel="prefetch" href="/images/next-page.jpg">\n</head>\n\n<script>\n// 动态prefetch\nfunction prefetchNextPage(url) {\n  const link = document.createElement("link");\n  link.rel = "prefetch";\n  link.href = url;\n  document.head.appendChild(link);\n}\n\n// 鼠标悬停时预取\ndocument.querySelectorAll("a").forEach(link => {\n  link.addEventListener("mouseenter", function() {\n    prefetchNextPage(this.href);\n  });\n});\n</script>',
                        points: [
                            "低优先级加载",
                            "未来可能需要的资源",
                            "空闲时加载",
                            "适合预测式加载",
                            "不阻塞当前页面"
                        ]
                    },
                    {
                        title: "preconnect",
                        code: '<!-- 预连接外部域名 -->\n<head>\n  <!-- Google Fonts -->\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  \n  <!-- CDN -->\n  <link rel="preconnect" href="https://cdn.example.com">\n  \n  <!-- API服务器 -->\n  <link rel="preconnect" href="https://api.example.com">\n</head>',
                        points: [
                            "DNS解析 + TCP连接 + TLS协商",
                            "减少后续请求延迟",
                            "用于关键第三方域",
                            "最多2-3个连接",
                            "较早建立连接"
                        ]
                    },
                    {
                        title: "dns-prefetch",
                        code: '<!-- 仅DNS预解析 -->\n<head>\n  <!-- 第三方资源 -->\n  <link rel="dns-prefetch" href="https://www.google-analytics.com">\n  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">\n  <link rel="dns-prefetch" href="https://img.example.com">\n</head>',
                        points: [
                            "仅做DNS解析",
                            "开销最小",
                            "兼容性最好",
                            "用于非关键资源",
                            "可以有多个"
                        ]
                    },
                    {
                        title: "prerender（谨慎使用）",
                        code: '<!-- 预渲染下一页 -->\n<link rel="prerender" href="/next-page.html">\n\n<!-- 注意：\n- 消耗大量资源\n- 会执行JS\n- 可能浪费带宽\n- 只用于非常确定的导航\n-->',
                        content: "完整渲染下一页，开销很大。"
                    },
                    {
                        title: "modulepreload",
                        code: '<!-- 预加载ES模块 -->\n<link rel="modulepreload" href="/js/module.js">\n\n<!-- 及其依赖 -->\n<link rel="modulepreload" href="/js/utils.js">\n\n<script type="module">\n  import { func } from "/js/module.js";\n</script>',
                        content: "专门用于ES模块的预加载。"
                    },
                    {
                        title: "对比总结",
                        code: '<!-- 优先级 -->\npreload    > preconnect > prefetch\n\n<!-- 时机 -->\npreload    - 当前页面，立即需要\npreconnect - 当前页面，即将请求\nprefetch   - 下一页面，可能需要\n\n<!-- 开销 -->\nprerender  > preload > preconnect > dns-prefetch\n\n<!-- 选择 -->\n关键资源     -> preload\n第三方域     -> preconnect / dns-prefetch\n下一页资源   -> prefetch\n模块         -> modulepreload',
                        content: "根据场景选择合适的提示。"
                    }
                ]
            },
            source: "Resource Hints"
        },
        {
            difficulty: "medium",
            tags: ["图片优化", "性能"],
            question: "如何优化图片加载性能？",
            type: "multiple-choice",
            options: [
                "使用现代图片格式",
                "响应式图片",
                "懒加载",
                "指定尺寸避免重排"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "图片优化",
                description: "图片是性能优化的重点。",
                sections: [
                    {
                        title: "现代图片格式",
                        code: '<!-- WebP格式（更好的压缩） -->\n<picture>\n  <source srcset="image.webp" type="image/webp">\n  <source srcset="image.jpg" type="image/jpeg">\n  <img src="image.jpg" alt="描述">\n</picture>\n\n<!-- AVIF格式（最新，压缩更好） -->\n<picture>\n  <source srcset="image.avif" type="image/avif">\n  <source srcset="image.webp" type="image/webp">\n  <img src="image.jpg" alt="描述">\n</picture>',
                        points: [
                            "WebP：30%更小",
                            "AVIF：50%更小",
                            "提供降级方案",
                            "压缩时平衡质量和大小",
                            "工具：Squoosh、ImageOptim"
                        ]
                    },
                    {
                        title: "响应式图片",
                        code: '<!-- srcset：不同分辨率 -->\n<img src="image-800.jpg"\n     srcset="image-400.jpg 400w,\n             image-800.jpg 800w,\n             image-1200.jpg 1200w"\n     sizes="(max-width: 600px) 400px,\n            (max-width: 1000px) 800px,\n            1200px"\n     alt="响应式图片">\n\n<!-- picture：不同场景 -->\n<picture>\n  <!-- 移动端 -->\n  <source media="(max-width: 600px)"\n          srcset="mobile.jpg">\n  \n  <!-- 平板 -->\n  <source media="(max-width: 1200px)"\n          srcset="tablet.jpg">\n  \n  <!-- 桌面 -->\n  <img src="desktop.jpg" alt="描述">\n</picture>\n\n<!-- 高分辨率屏幕 -->\n<img src="image.jpg"\n     srcset="image.jpg 1x,\n             image@2x.jpg 2x,\n             image@3x.jpg 3x"\n     alt="高清图片">',
                        content: "根据设备加载合适尺寸。"
                    },
                    {
                        title: "懒加载",
                        code: '<!-- 原生懒加载 -->\n<img src="image.jpg" \n     loading="lazy"\n     alt="懒加载图片">\n\n<!-- 首屏图片用eager -->\n<img src="hero.jpg" \n     loading="eager"\n     alt="首屏图片">\n\n<!-- 结合placeholder -->\n<img src="placeholder.jpg"\n     data-src="full-image.jpg"\n     loading="lazy"\n     class="lazy"\n     alt="图片">\n\n<script>\n// IntersectionObserver降级方案\nif ("loading" in HTMLImageElement.prototype) {\n  // 原生支持\n} else {\n  // 使用IntersectionObserver\n  const images = document.querySelectorAll("img[loading=lazy]");\n  const imageObserver = new IntersectionObserver(\n    (entries) => {\n      entries.forEach(entry => {\n        if (entry.isIntersecting) {\n          const img = entry.target;\n          img.src = img.dataset.src;\n          imageObserver.unobserve(img);\n        }\n      });\n    }\n  );\n  \n  images.forEach(img => imageObserver.observe(img));\n}\n</script>',
                        points: [
                            "loading='lazy'原生支持",
                            "节省带宽",
                            "提升首屏速度",
                            "首屏用loading='eager'",
                            "降级方案"
                        ]
                    },
                    {
                        title: "指定尺寸",
                        code: '<!-- 避免布局偏移 -->\n<img src="image.jpg"\n     width="800"\n     height="600"\n     alt="图片">\n\n<!-- 或CSS -->\n<style>\n.image-container {\n  width: 100%;\n  aspect-ratio: 16/9;\n}\n\n.image-container img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n</style>\n\n<div class="image-container">\n  <img src="image.jpg" alt="图片">\n</div>',
                        points: [
                            "避免CLS（布局偏移）",
                            "width和height属性",
                            "CSS aspect-ratio",
                            "提升用户体验",
                            "Core Web Vitals"
                        ]
                    },
                    {
                        title: "SVG优化",
                        code: '<!-- 内联SVG -->\n<svg width="100" height="100">\n  <circle cx="50" cy="50" r="40" fill="blue"/>\n</svg>\n\n<!-- 外部SVG -->\n<img src="icon.svg" alt="图标">\n\n<!-- 优化工具：SVGO -->\n<!-- 压缩前 -->\n<svg xmlns="http://www.w3.org/2000/svg" \n     width="100" height="100">\n  <circle cx="50" cy="50" r="40" fill="blue" />\n</svg>\n\n<!-- 压缩后 -->\n<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>',
                        content: "SVG也需要优化。"
                    },
                    {
                        title: "图片CDN",
                        code: '<!-- Cloudinary示例 -->\n<img src="https://res.cloudinary.com/demo/image/upload/\n           w_400,h_300,c_fill,q_auto,f_auto/\n           sample.jpg"\n     alt="CDN优化图片">\n\n<!-- 参数说明 -->\nw_400    - 宽度400px\nh_300    - 高度300px\nc_fill   - 填充裁剪\nq_auto   - 自动质量\nf_auto   - 自动格式（WebP/AVIF）',
                        content: "使用图片CDN自动优化。"
                    }
                ]
            },
            source: "性能最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["Critical CSS", "渲染优化"],
            question: "什么是Critical CSS？如何实现？",
            type: "multiple-choice",
            options: [
                "首屏关键CSS内联",
                "非关键CSS延迟加载",
                "减少渲染阻塞",
                "提升FCP"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Critical CSS",
                description: "优化CSS加载以提升首屏渲染。",
                sections: [
                    {
                        title: "问题",
                        code: '<!-- 传统方式（阻塞渲染） -->\n<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <!-- 需要等styles.css下载完才能渲染 -->\n</body>\n</html>',
                        content: "外部CSS会阻塞首屏渲染。"
                    },
                    {
                        title: "Critical CSS方案",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <!-- 1. 内联关键CSS -->\n  <style>\n    /* 首屏样式 */\n    body {\n      margin: 0;\n      font-family: sans-serif;\n    }\n    \n    .header {\n      background: #333;\n      color: white;\n      padding: 20px;\n    }\n    \n    .hero {\n      min-height: 100vh;\n      background: #f0f0f0;\n    }\n  </style>\n  \n  <!-- 2. 异步加载完整CSS -->\n  <link rel="preload" \n        href="styles.css" \n        as="style" \n        onload="this.onload=null;this.rel=\'stylesheet\'">\n  \n  <!-- 3. noscript降级 -->\n  <noscript>\n    <link rel="stylesheet" href="styles.css">\n  </noscript>\n</head>\n<body>\n  <!-- 首屏内容立即渲染 -->\n</body>\n</html>',
                        points: [
                            "提取首屏CSS",
                            "内联到<style>",
                            "异步加载完整CSS",
                            "提升FCP",
                            "减少渲染阻塞"
                        ]
                    },
                    {
                        title: "提取工具",
                        code: '// 1. Critical（Node.js）\nconst critical = require("critical");\n\ncritical.generate({\n  inline: true,\n  base: "dist/",\n  src: "index.html",\n  target: {\n    html: "index-critical.html",\n    css: "critical.css"\n  },\n  width: 1300,\n  height: 900\n});\n\n// 2. Penthouse\nconst penthouse = require("penthouse");\n\npenthouse({\n  url: "https://example.com",\n  css: "./styles.css",\n  width: 1300,\n  height: 900\n}).then(criticalCss => {\n  // 使用critical CSS\n});\n\n// 3. Critters（Webpack插件）\nconst Critters = require("critters-webpack-plugin");\n\nmodule.exports = {\n  plugins: [\n    new Critters({\n      preload: "swap"\n    })\n  ]\n};',
                        content: "自动化提取Critical CSS。"
                    },
                    {
                        title: "media属性优化",
                        code: '<!-- 按媒体查询分离 -->\n<head>\n  <!-- 打印样式不阻塞 -->\n  <link rel="stylesheet" \n        href="print.css" \n        media="print">\n  \n  <!-- 大屏样式延迟 -->\n  <link rel="stylesheet" \n        href="desktop.css" \n        media="(min-width: 1200px)">\n  \n  <!-- 技巧：先设为print，加载后改为all -->\n  <link rel="stylesheet" \n        href="non-critical.css" \n        media="print" \n        onload="this.media=\'all\'">\n</head>',
                        content: "利用media属性控制加载。"
                    },
                    {
                        title: "CSS-in-JS方案",
                        code: '// 自动处理Critical CSS\n// styled-components示例\nimport styled from "styled-components";\nimport { ServerStyleSheet } from "styled-components";\n\n// 服务端渲染时\nconst sheet = new ServerStyleSheet();\nconst html = renderToString(\n  sheet.collectStyles(<App />)\n);\nconst styleTags = sheet.getStyleTags();\n\n// styleTags自动包含首屏样式',
                        content: "CSS-in-JS框架自动优化。"
                    },
                    {
                        title: "完整示例",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Performance Optimized Page</title>\n  \n  <!-- 1. Critical CSS内联 -->\n  <style>\n    /* 自动提取的首屏样式 */\n    *{box-sizing:border-box}body{margin:0;font:16px/1.5 Arial}\n    .header{background:#333;color:#fff;padding:1rem}\n    .hero{min-height:100vh;display:flex;align-items:center}\n  </style>\n  \n  <!-- 2. 预加载字体 -->\n  <link rel="preload" \n        href="/fonts/main.woff2" \n        as="font" \n        type="font/woff2"\n        crossorigin>\n  \n  <!-- 3. 异步加载完整CSS -->\n  <link rel="preload" \n        href="/css/main.css" \n        as="style" \n        onload="this.onload=null;this.rel=\'stylesheet\'">\n  <noscript>\n    <link rel="stylesheet" href="/css/main.css">\n  </noscript>\n  \n  <!-- 4. 预连接第三方域 -->\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n</head>\n<body>\n  <header class="header">\n    <h1>Website</h1>\n  </header>\n  \n  <main class="hero">\n    <h2>Hero Section</h2>\n  </main>\n  \n  <!-- 5. defer加载脚本 -->\n  <script defer src="/js/main.js"></script>\n</body>\n</html>',
                        content: "综合优化方案。"
                    }
                ]
            },
            source: "性能最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["iframe", "优化"],
            question: "如何优化iframe的性能？",
            type: "multiple-choice",
            options: [
                "使用loading='lazy'",
                "sandbox限制权限",
                "尽量避免使用",
                "异步加载"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "iframe优化",
                description: "iframe是性能杀手，需谨慎使用。",
                sections: [
                    {
                        title: "iframe的问题",
                        points: [
                            "阻塞页面onload",
                            "增加HTTP请求",
                            "独立的渲染进程",
                            "消耗大量内存",
                            "影响SEO",
                            "安全风险"
                        ]
                    },
                    {
                        title: "懒加载iframe",
                        code: '<!-- 原生懒加载 -->\n<iframe src="https://example.com/embed"\n        loading="lazy"\n        width="560"\n        height="315">\n</iframe>\n\n<!-- 手动懒加载 -->\n<iframe data-src="https://example.com/embed"\n        width="560"\n        height="315"\n        class="lazy-iframe">\n</iframe>\n\n<script>\nconst iframes = document.querySelectorAll(".lazy-iframe");\nconst observer = new IntersectionObserver(\n  (entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        const iframe = entry.target;\n        iframe.src = iframe.dataset.src;\n        observer.unobserve(iframe);\n      }\n    });\n  }\n);\n\niframes.forEach(iframe => observer.observe(iframe));\n</script>',
                        content: "按需加载iframe。"
                    },
                    {
                        title: "sandbox限制",
                        code: '<!-- 限制iframe权限 -->\n<iframe src="https://untrusted.com"\n        sandbox="allow-scripts allow-same-origin">\n</iframe>\n\n<!-- sandbox可选值 -->\nallow-forms          - 允许表单提交\nallow-modals         - 允许模态框\nallow-orientation-lock - 允许锁定屏幕方向\nallow-pointer-lock   - 允许指针锁定\nallow-popups         - 允许弹窗\nallow-popups-to-escape-sandbox - 弹窗不继承sandbox\nallow-presentation   - 允许演示\nallow-same-origin    - 允许同源\nallow-scripts        - 允许脚本\nallow-top-navigation - 允许导航顶层窗口\n\n<!-- 空sandbox（最严格） -->\n<iframe src="content.html" sandbox></iframe>',
                        points: [
                            "提升安全性",
                            "限制能力",
                            "按需添加权限",
                            "第三方内容必用"
                        ]
                    },
                    {
                        title: "异步加载",
                        code: '<!-- 页面加载后再插入iframe -->\n<div id="iframe-container"></div>\n\n<script>\nwindow.addEventListener("load", function() {\n  // 页面加载完成后\n  setTimeout(function() {\n    const container = document.getElementById("iframe-container");\n    const iframe = document.createElement("iframe");\n    iframe.src = "https://example.com/embed";\n    iframe.width = "560";\n    iframe.height = "315";\n    container.appendChild(iframe);\n  }, 1000);\n});\n</script>',
                        content: "不阻塞页面加载。"
                    },
                    {
                        title: "替代方案",
                        code: '<!-- 1. 使用链接代替嵌入 -->\n<a href="https://youtube.com/watch?v=xxx" target="_blank">\n  <img src="thumbnail.jpg" alt="观看视频">\n</a>\n\n<!-- 2. 点击后加载 -->\n<div class="video-placeholder" \n     data-src="https://youtube.com/embed/xxx">\n  <img src="thumbnail.jpg" alt="视频缩略图">\n  <button onclick="loadVideo(this)">播放视频</button>\n</div>\n\n<script>\nfunction loadVideo(btn) {\n  const placeholder = btn.parentElement;\n  const iframe = document.createElement("iframe");\n  iframe.src = placeholder.dataset.src;\n  iframe.width = "560";\n  iframe.height = "315";\n  iframe.allow = "accelerometer; autoplay; encrypted-media";\n  placeholder.replaceWith(iframe);\n}\n</script>\n\n<!-- 3. 使用postMessage通信 -->\n<!-- 父页面 -->\n<iframe id="myFrame" src="child.html"></iframe>\n<script>\nconst frame = document.getElementById("myFrame");\nframe.contentWindow.postMessage({type: "init"}, "*");\n\nwindow.addEventListener("message", function(e) {\n  console.log("收到消息:", e.data);\n});\n</script>\n\n<!-- 子页面 -->\n<script>\nwindow.addEventListener("message", function(e) {\n  if (e.data.type === "init") {\n    // 初始化\n    parent.postMessage({type: "ready"}, "*");\n  }\n});\n</script>',
                        content: "考虑iframe的替代方案。"
                    }
                ]
            },
            source: "性能最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["渲染性能", "优化"],
            question: "如何减少重排（Reflow）和重绘（Repaint）？",
            type: "multiple-choice",
            options: [
                "批量修改DOM",
                "使用DocumentFragment",
                "CSS硬件加速",
                "避免强制同步布局"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "渲染性能优化",
                description: "减少重排重绘提升性能。",
                sections: [
                    {
                        title: "重排vs重绘",
                        code: '// 重排（Reflow）：影响布局\nelement.style.width = "100px";   // 重排\nelement.style.height = "100px";  // 重排\nelement.style.margin = "10px";   // 重排\n\n// 重绘（Repaint）：仅影响外观\nelement.style.color = "red";       // 重绘\nelement.style.backgroundColor = "blue";  // 重绘\n\n// 触发重排的属性/方法\noffsetTop, offsetLeft, offsetWidth, offsetHeight\nscrollTop, scrollLeft, scrollWidth, scrollHeight\nclientTop, clientLeft, clientWidth, clientHeight\ngetComputedStyle()\ngetBoundingClientRect()',
                        points: [
                            "重排必定重绘",
                            "重绘不一定重排",
                            "重排开销更大",
                            "避免频繁触发"
                        ]
                    },
                    {
                        title: "批量修改",
                        code: '// ❌ 不好：多次重排\nelement.style.width = "100px";\nelement.style.height = "100px";\nelement.style.margin = "10px";\n\n// ✅ 好：一次修改\nelement.style.cssText = "width:100px;height:100px;margin:10px";\n\n// ✅ 或使用className\nelement.className = "new-style";\n\n// ✅ 或使用classList\nelement.classList.add("new-style");\n\n// ❌ 不好：循环中修改样式\nfor (let i = 0; i < items.length; i++) {\n  items[i].style.left = i * 10 + "px";\n}\n\n// ✅ 好：使用CSS类\nfor (let i = 0; i < items.length; i++) {\n  items[i].classList.add("positioned");\n}\n\n.positioned:nth-child(1) { left: 0px; }\n.positioned:nth-child(2) { left: 10px; }',
                        content: "合并样式修改。"
                    },
                    {
                        title: "DocumentFragment",
                        code: '// ❌ 不好：多次插入DOM\nfor (let i = 0; i < 1000; i++) {\n  const li = document.createElement("li");\n  li.textContent = `Item ${i}`;\n  ul.appendChild(li);  // 1000次重排\n}\n\n// ✅ 好：使用DocumentFragment\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  const li = document.createElement("li");\n  li.textContent = `Item ${i}`;\n  fragment.appendChild(li);\n}\nul.appendChild(fragment);  // 1次重排\n\n// ✅ 或先拼接HTML\nconst html = items.map(item => `<li>${item}</li>`).join("");\nul.innerHTML = html;',
                        content: "批量插入DOM。"
                    },
                    {
                        title: "离线修改",
                        code: '// ❌ 不好\nelement.style.display = "none";\n// ... 多次修改 ...\nelement.style.display = "block";\n\n// ✅ 好：使用cloneNode\nconst clone = element.cloneNode(true);\n// 修改clone\nclone.style.width = "200px";\nclone.textContent = "New content";\n// 一次性替换\nelement.parentNode.replaceChild(clone, element);\n\n// ✅ 或移除后修改\nconst parent = element.parentNode;\nconst next = element.nextSibling;\nparent.removeChild(element);\n\n// 修改element\nelement.style.width = "200px";\nelement.textContent = "New";\n\n// 重新插入\nparent.insertBefore(element, next);',
                        content: "离线操作DOM。"
                    },
                    {
                        title: "避免强制同步布局",
                        code: '// ❌ 不好：强制同步布局\nfor (let i = 0; i < elements.length; i++) {\n  elements[i].style.width = box.offsetWidth + "px";  // 读写交替\n}\n\n// ✅ 好：先读后写\nconst width = box.offsetWidth;  // 读\nfor (let i = 0; i < elements.length; i++) {\n  elements[i].style.width = width + "px";  // 写\n}\n\n// ❌ 不好\nfunction animate() {\n  box.style.left = box.offsetLeft + 1 + "px";  // 读写\n  requestAnimationFrame(animate);\n}\n\n// ✅ 好\nlet left = 0;\nfunction animate() {\n  left += 1;\n  box.style.left = left + "px";  // 只写\n  requestAnimationFrame(animate);\n}',
                        content: "分离读写操作。"
                    },
                    {
                        title: "CSS硬件加速",
                        code: '/* 触发GPU加速 */\n.animated {\n  transform: translateZ(0);  /* 或translate3d(0,0,0) */\n  will-change: transform;    /* 提示浏览器 */\n}\n\n/* 动画用transform */\n.box {\n  /* ❌ 触发重排 */\n  transition: left 0.3s;\n}\n\n.box:hover {\n  left: 100px;\n}\n\n/* ✅ 使用transform */\n.box {\n  transition: transform 0.3s;\n}\n\n.box:hover {\n  transform: translateX(100px);\n}\n\n/* 推荐动画属性 */\ntransform    - 位置、缩放、旋转\nopacity      - 透明度\n\n/* 避免动画属性 */\nwidth, height, top, left  - 触发重排',
                        content: "利用GPU加速。"
                    },
                    {
                        title: "使用requestAnimationFrame",
                        code: '// ❌ 不好\nsetInterval(() => {\n  element.style.left = element.offsetLeft + 1 + "px";\n}, 16);\n\n// ✅ 好\nfunction animate() {\n  element.style.left = element.offsetLeft + 1 + "px";\n  requestAnimationFrame(animate);\n}\nrequestAnimationFrame(animate);\n\n// ✅ 批量读写\nconst positions = [];\n\n// 读阶段\nrequestAnimationFrame(() => {\n  elements.forEach(el => {\n    positions.push(el.offsetLeft);\n  });\n  \n  // 写阶段\n  requestAnimationFrame(() => {\n    elements.forEach((el, i) => {\n      el.style.left = positions[i] + 10 + "px";\n    });\n  });\n});',
                        content: "使用rAF优化动画。"
                    }
                ]
            },
            source: "性能最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["缓存", "优化"],
            question: "如何利用浏览器缓存优化性能？",
            type: "multiple-choice",
            options: [
                "设置Cache-Control",
                "使用ETag验证",
                "Service Worker缓存",
                "版本化资源URL"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "浏览器缓存",
                description: "合理使用缓存可大幅提升性能。",
                sections: [
                    {
                        title: "HTTP缓存头",
                        code: '<!-- 强缓存 -->\nCache-Control: max-age=31536000  # 1年\nCache-Control: max-age=86400     # 1天\nCache-Control: max-age=0         # 不缓存\nCache-Control: no-store          # 禁止缓存\n\n<!-- 协商缓存 -->\nCache-Control: no-cache          # 每次验证\nETag: "abc123"\nLast-Modified: Wed, 15 Jan 2024 00:00:00 GMT\n\n<!-- 组合使用 -->\nCache-Control: public, max-age=31536000, immutable\n\npublic    - 可被任何缓存\nprivate   - 只能被浏览器缓存\nimmutable - 不会改变（适合带hash的文件）',
                        points: [
                            "强缓存：直接使用",
                            "协商缓存：验证后使用",
                            "合理设置过期时间",
                            "静态资源长缓存"
                        ]
                    },
                    {
                        title: "资源版本化",
                        code: '<!-- ❌ 不好：无版本 -->\n<script src="/js/app.js"></script>\n<link rel="stylesheet" href="/css/style.css">\n\n<!-- ✅ 好：文件名hash -->\n<script src="/js/app.abc123.js"></script>\n<link rel="stylesheet" href="/css/style.def456.css">\n\n<!-- 或查询参数（不推荐） -->\n<script src="/js/app.js?v=1.0.0"></script>\n\n<!-- Webpack配置 -->\noutput: {\n  filename: "[name].[contenthash].js",\n  chunkFilename: "[name].[contenthash].js"\n}\n\n<!-- 结果 -->\nmain.abc123def456.js  # 内容变化，hash变化\nvendor.789xyz.js      # 内容不变，hash不变',
                        content: "内容hash确保缓存更新。"
                    },
                    {
                        title: "Service Worker缓存",
                        code: '// sw.js\nconst CACHE_NAME = "v1";\n\nself.addEventListener("install", (e) => {\n  e.waitUntil(\n    caches.open(CACHE_NAME).then(cache => {\n      return cache.addAll([\n        "/",\n        "/index.html",\n        "/css/style.css",\n        "/js/app.js"\n      ]);\n    })\n  );\n});\n\nself.addEventListener("fetch", (e) => {\n  e.respondWith(\n    caches.match(e.request).then(response => {\n      // 缓存优先\n      if (response) {\n        return response;\n      }\n      \n      // 网络请求\n      return fetch(e.request).then(response => {\n        // 动态缓存\n        if (response.status === 200) {\n          const clone = response.clone();\n          caches.open(CACHE_NAME).then(cache => {\n            cache.put(e.request, clone);\n          });\n        }\n        return response;\n      });\n    })\n  );\n});',
                        content: "SW提供离线能力。"
                    },
                    {
                        title: "缓存策略",
                        code: '// 1. Cache First（缓存优先）\n// 适合：静态资源\nif (cachedResponse) return cachedResponse;\nreturn fetch(request);\n\n// 2. Network First（网络优先）\n// 适合：API数据\ntry {\n  const response = await fetch(request);\n  cache.put(request, response.clone());\n  return response;\n} catch (err) {\n  return caches.match(request);\n}\n\n// 3. Stale While Revalidate（后台更新）\n// 适合：经常更新的资源\nconst cached = await caches.match(request);\nconst fetchPromise = fetch(request).then(response => {\n  cache.put(request, response.clone());\n  return response;\n});\nreturn cached || fetchPromise;\n\n// 4. Network Only（仅网络）\n// 适合：实时数据\nreturn fetch(request);\n\n// 5. Cache Only（仅缓存）\n// 适合：离线应用\nreturn caches.match(request);',
                        content: "根据资源类型选择策略。"
                    },
                    {
                        title: "HTML缓存",
                        code: '<!-- 不要缓存HTML -->\n<meta http-equiv="Cache-Control" \n      content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">\n\n<!-- 或服务器配置 -->\nCache-Control: no-cache, no-store, must-revalidate\nPragma: no-cache\nExpires: 0',
                        content: "HTML通常不缓存，确保获取最新。"
                    },
                    {
                        title: "预缓存",
                        code: '<!-- 关键资源预缓存 -->\n<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>\n<link rel="prefetch" href="/js/next-page.js">\n\n<!-- SW预缓存 -->\n// install时缓存\nself.addEventListener("install", (e) => {\n  e.waitUntil(\n    caches.open("v1").then(cache => {\n      return cache.addAll([\n        // 核心资源\n        "/",\n        "/app.js",\n        "/style.css"\n      ]);\n    })\n  );\n});',
                        content: "提前缓存关键资源。"
                    }
                ]
            },
            source: "HTTP缓存"
        }
    ],
    navigation: {
        prev: { title: "SEO优化", url: "quiz.html?chapter=16" },
        next: { title: "最佳实践", url: "quiz.html?chapter=18" }
    }
};
