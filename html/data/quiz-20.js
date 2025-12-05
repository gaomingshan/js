// 第20章：浏览器渲染原理 - 面试题
window.htmlQuizData_20 = {
    config: {
        title: "浏览器渲染原理",
        icon: "🔄",
        description: "测试你对浏览器渲染机制的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "hard",
            tags: ["渲染流程", "基础"],
            question: "浏览器渲染HTML的完整流程是什么？",
            type: "multiple-choice",
            options: [
                "解析HTML构建DOM树",
                "解析CSS构建CSSOM树",
                "合成渲染树",
                "布局和绘制"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "浏览器渲染流程",
                description: "从HTML到屏幕显示的完整过程。",
                sections: [
                    {
                        title: "完整流程",
                        code: '1. 解析HTML → DOM树\n2. 解析CSS → CSSOM树\n3. JavaScript执行（可能修改DOM/CSSOM）\n4. DOM + CSSOM → 渲染树（Render Tree）\n5. 布局（Layout/Reflow）：计算位置和大小\n6. 绘制（Paint）：绘制像素\n7. 合成（Composite）：合成图层\n\n关键渲染路径（Critical Rendering Path）：\nHTML → DOM\nCSS → CSSOM\nDOM + CSSOM → Render Tree\nRender Tree → Layout\nLayout → Paint\nPaint → Composite',
                        points: [
                            "DOM和CSSOM并行构建",
                            "JS会阻塞DOM解析",
                            "CSS会阻塞渲染",
                            "渲染树只包含可见元素",
                            "布局计算几何信息",
                            "绘制转为像素"
                        ]
                    },
                    {
                        title: "1. 构建DOM树",
                        code: '<!-- HTML文档 -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>示例</title>\n  </head>\n  <body>\n    <div id="container">\n      <p>段落</p>\n    </div>\n  </body>\n</html>\n\n/* DOM树结构 */\nDocument\n└─ html\n   ├─ head\n   │  └─ title\n   │     └─ "示例"\n   └─ body\n      └─ div#container\n         └─ p\n            └─ "段落"\n\n过程：\n1. 字节流 → 字符\n2. 字符 → Token（标签、文本、注释）\n3. Token → Node\n4. Node → DOM树',
                        content: "HTML解析为DOM树。"
                    },
                    {
                        title: "2. 构建CSSOM树",
                        code: '/* CSS */\nbody { font-size: 16px; }\ndiv { display: block; }\np { color: blue; }\n\n/* CSSOM树 */\nbody\n├─ font-size: 16px\n└─ div\n   ├─ display: block\n   └─ p\n      └─ color: blue\n\n特点：\n1. 级联和继承\n2. 计算最终样式\n3. 阻塞渲染\n4. 不阻塞DOM解析',
                        content: "CSS解析为CSSOM树。"
                    },
                    {
                        title: "3. 构建渲染树",
                        code: '/* 渲染树 = DOM + CSSOM */\n\nDOM树：\nhtml\n└─ body\n   ├─ div.header (display: none)\n   ├─ div.content\n   │  └─ p\n   └─ span (visibility: hidden)\n\n渲染树（只包含可见元素）：\nbody\n└─ div.content\n   └─ p\n\n不在渲染树中的元素：\n1. display: none\n2. <head>及其子元素\n3. <script>\n4. <meta>\n\n在渲染树中但不可见：\n1. visibility: hidden（占位）\n2. opacity: 0（占位）',
                        content: "合成渲染树。"
                    },
                    {
                        title: "4. 布局（Layout/Reflow）",
                        code: '/* 计算元素的几何信息 */\n\n输入：渲染树\n输出：盒模型（位置、大小）\n\n<div style="width: 50%">\n  <p>内容</p>\n</div>\n\n布局计算：\n1. 从根节点开始\n2. 递归计算子节点\n3. 确定位置：x, y\n4. 确定大小：width, height\n5. 盒模型：margin, border, padding\n\n触发重排的操作：\n- 添加/删除元素\n- 改变尺寸\n- 改变位置\n- 改变内容\n- 浏览器窗口resize\n- 读取某些属性（offsetWidth等）',
                        content: "计算布局信息。"
                    },
                    {
                        title: "5. 绘制（Paint）",
                        code: '/* 将渲染树转为像素 */\n\n绘制顺序（从后到前）：\n1. background-color\n2. background-image\n3. border\n4. children（子元素）\n5. outline\n\n绘制列表示例：\n[\n  { type: "rectangle", x: 0, y: 0, width: 100, height: 100, color: "blue" },\n  { type: "text", x: 10, y: 20, text: "Hello", font: "16px Arial" },\n  { type: "image", x: 0, y: 50, src: "image.jpg" }\n]\n\n触发重绘的操作：\n- color\n- background\n- visibility\n- outline\n- box-shadow',
                        content: "绘制像素。"
                    },
                    {
                        title: "6. 合成（Composite）",
                        code: '/* 图层合成 */\n\n创建图层的条件：\n1. 3D transform\n2. video, canvas, iframe\n3. position: fixed\n4. will-change\n5. animation, transition（transform, opacity）\n6. 有合成层子元素的元素\n\n/* 强制创建图层 */\n.element {\n  transform: translateZ(0);\n  /* 或 */\n  will-change: transform;\n}\n\n优点：\n- 某些属性变化不触发重排/重绘\n- transform, opacity动画性能好\n\n缺点：\n- 过多图层消耗内存\n- 图层合成也有开销',
                        content: "合成图层。"
                    },
                    {
                        title: "性能优化",
                        code: '/* 1. 减少重排 */\n// ❌ 多次重排\nelement.style.width = "100px";\nelement.style.height = "100px";\n\n// ✅ 一次重排\nelement.style.cssText = "width: 100px; height: 100px;";\n\n/* 2. 使用transform代替position */\n// ❌ 触发重排\nelement.style.left = "100px";\n\n// ✅ 只触发合成\nelement.style.transform = "translateX(100px)";\n\n/* 3. 避免强制同步布局 */\n// ❌ 读写交替\nfor (let i = 0; i < elements.length; i++) {\n  elements[i].style.width = container.offsetWidth + "px";\n}\n\n// ✅ 批量读，批量写\nconst width = container.offsetWidth;\nfor (let i = 0; i < elements.length; i++) {\n  elements[i].style.width = width + "px";\n}\n\n/* 4. 使用requestAnimationFrame */\nrequestAnimationFrame(() => {\n  // 动画更新\n});',
                        content: "优化渲染性能。"
                    }
                ]
            },
            source: "浏览器工作原理"
        },
        {
            difficulty: "hard",
            tags: ["DOMContentLoaded", "load"],
            question: "DOMContentLoaded和load事件的区别？",
            type: "single-choice",
            options: [
                "DOMContentLoaded：DOM解析完成；load：所有资源加载完成",
                "DOMContentLoaded：所有资源加载完成；load：DOM解析完成",
                "两者相同，只是不同名称",
                "DOMContentLoaded只在IE中触发"
            ],
            correctAnswer: "A",
            explanation: {
                title: "文档加载事件",
                description: "理解页面加载的不同阶段。",
                sections: [
                    {
                        title: "事件顺序",
                        code: '/* 完整的加载顺序 */\n\n1. 开始解析HTML\n2. 遇到<link>标签，异步加载CSS\n3. 遇到<script>标签（无async/defer），暂停解析，加载并执行\n4. HTML解析完成\n5. 触发 DOMContentLoaded\n6. 图片、样式等资源继续加载\n7. 所有资源加载完成\n8. 触发 load（window.onload）\n\n时间线：\nHTML解析开始\n    ↓\n[解析HTML...]\n    ↓\nDOM构建完成\n    ↓\n【DOMContentLoaded】 ← DOM可操作\n    ↓\n[加载图片等资源...]\n    ↓\n所有资源加载完成\n    ↓\n【load】 ← 页面完全加载',
                        content: "加载事件的时间线。"
                    },
                    {
                        title: "DOMContentLoaded",
                        code: '/* DOMContentLoaded事件 */\n\n// 监听DOMContentLoaded\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("DOM已构建完成");\n  // 可以安全地操作DOM\n  const element = document.getElementById("app");\n  element.textContent = "已加载";\n});\n\n// jQuery的$(document).ready()\n$(document).ready(function() {\n  // 等同于DOMContentLoaded\n});\n\n// 或简写\n$(function() {\n  // 等同于DOMContentLoaded\n});\n\n触发时机：\n1. HTML解析完成\n2. DOM树构建完成\n3. defer脚本执行完成\n4. 不等待图片、样式表、iframe等资源\n\n适用场景：\n- 尽早操作DOM\n- 不需要等待所有资源\n- 提升交互时间',
                        content: "DOM解析完成时触发。"
                    },
                    {
                        title: "load事件",
                        code: '/* window.onload事件 */\n\n// 方式1\nwindow.onload = function() {\n  console.log("所有资源已加载");\n};\n\n// 方式2（推荐，可以多个监听器）\nwindow.addEventListener("load", function() {\n  console.log("所有资源已加载");\n  // 图片、CSS、字体等都已加载\n});\n\n// 监听特定资源\nconst img = document.querySelector("img");\nimg.addEventListener("load", function() {\n  console.log("图片加载完成");\n});\n\n触发时机：\n1. DOMContentLoaded之后\n2. 所有资源加载完成：\n   - 图片\n   - 样式表\n   - iframe\n   - 字体\n   - 等等\n\n适用场景：\n- 需要知道图片尺寸\n- 操作依赖外部资源的功能\n- 性能测量',
                        content: "所有资源加载完成时触发。"
                    },
                    {
                        title: "对比",
                        code: '/* 时间对比 */\n\n<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n  <script>\n    const startTime = performance.now();\n    \n    document.addEventListener("DOMContentLoaded", function() {\n      const domTime = performance.now() - startTime;\n      console.log(`DOMContentLoaded: ${domTime}ms`);\n      // 通常：100-500ms\n    });\n    \n    window.addEventListener("load", function() {\n      const loadTime = performance.now() - startTime;\n      console.log(`load: ${loadTime}ms`);\n      // 通常：500-3000ms（取决于资源）\n    });\n  </script>\n</head>\n<body>\n  <img src="large-image.jpg">\n  <!-- 更多内容 -->\n</body>\n</html>\n\n输出示例：\nDOMContentLoaded: 250ms\nload: 1500ms',
                        content: "时间差异明显。"
                    },
                    {
                        title: "script标签的影响",
                        code: '/* 普通script：阻塞DOMContentLoaded */\n<script src="script.js"></script>\n<!-- DOMContentLoaded等待此脚本 -->\n\n/* async script：不阻塞DOMContentLoaded */\n<script async src="script.js"></script>\n<!-- DOMContentLoaded不等待 -->\n\n/* defer script：阻塞DOMContentLoaded */\n<script defer src="script.js"></script>\n<!-- DOMContentLoaded等待defer脚本 -->\n\n时间线对比：\n\n【普通script】\nHTML解析 → [暂停] 下载+执行script → 继续解析 → DOMContentLoaded\n\n【async script】\nHTML解析 → 继续... → DOMContentLoaded\n           ↓\n        [并行] 下载script → 执行（可能在DOMContentLoaded之前或之后）\n\n【defer script】\nHTML解析 → 继续... → 解析完成 → 执行defer脚本 → DOMContentLoaded\n           ↓\n        [并行] 下载script',
                        content: "脚本加载方式的影响。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 1. 初始化应用 */\ndocument.addEventListener("DOMContentLoaded", function() {\n  // 尽早初始化\n  initApp();\n  bindEvents();\n  loadData();\n});\n\n/* 2. 图片相关操作 */\nwindow.addEventListener("load", function() {\n  // 需要图片尺寸\n  const img = document.querySelector("img");\n  console.log(img.width, img.height);\n  \n  // 瀑布流布局\n  initMasonry();\n});\n\n/* 3. 性能测量 */\nwindow.addEventListener("load", function() {\n  const perfData = performance.timing;\n  const loadTime = perfData.loadEventEnd - perfData.navigationStart;\n  const domTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;\n  \n  console.log(`DOM加载: ${domTime}ms`);\n  console.log(`完全加载: ${loadTime}ms`);\n});\n\n/* 4. 懒加载 */\ndocument.addEventListener("DOMContentLoaded", function() {\n  // DOM准备好后开始懒加载\n  const lazyImages = document.querySelectorAll("[data-src]");\n  const imageObserver = new IntersectionObserver(/* ... */);\n  lazyImages.forEach(img => imageObserver.observe(img));\n});',
                        content: "根据场景选择合适的事件。"
                    },
                    {
                        title: "检测是否已加载",
                        code: '/* 检测DOM是否已加载 */\nif (document.readyState === "loading") {\n  // 仍在加载\n  document.addEventListener("DOMContentLoaded", init);\n} else {\n  // DOM已加载\n  init();\n}\n\n/* document.readyState的值 */\n"loading"     - 正在加载\n"interactive" - DOM加载完成，资源仍在加载\n"complete"    - 所有资源加载完成\n\n/* 监听readyState变化 */\ndocument.addEventListener("readystatechange", function() {\n  console.log(document.readyState);\n  \n  if (document.readyState === "interactive") {\n    // 等同于DOMContentLoaded\n    console.log("DOM已加载");\n  }\n  \n  if (document.readyState === "complete") {\n    // 等同于window.onload\n    console.log("所有资源已加载");\n  }\n});',
                        content: "检测加载状态。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["关键渲染路径", "性能"],
            question: "什么是关键渲染路径（Critical Rendering Path）？",
            type: "multiple-choice",
            options: [
                "首次渲染所需的最小资源",
                "HTML、CSS、JS的处理顺序",
                "优化可提升首屏速度",
                "包括DOM、CSSOM、渲染树"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "关键渲染路径",
                description: "优化首次渲染的关键。",
                sections: [
                    {
                        title: "CRP概念",
                        code: '/* 关键渲染路径（Critical Rendering Path） */\n\n定义：\n浏览器从接收HTML到首次渲染页面的过程。\n\n步骤：\n1. 处理HTML → 构建DOM\n2. 处理CSS → 构建CSSOM\n3. 合成渲染树\n4. 布局（Layout）\n5. 绘制（Paint）\n\n关键资源：\n- HTML（必需）\n- CSS（阻塞渲染）\n- JavaScript（可能阻塞）\n\n目标：\n最小化首次渲染时间（First Contentful Paint）',
                        content: "CRP是首屏渲染的关键路径。"
                    },
                    {
                        title: "阻塞渲染的资源",
                        code: '/* CSS阻塞渲染 */\n<!DOCTYPE html>\n<html>\n<head>\n  <!-- CSS阻塞渲染 -->\n  <link rel="stylesheet" href="style.css">\n  <!-- 浏览器必须等待CSS下载并解析 -->\n</head>\n<body>\n  <!-- 页面内容不会渲染，直到CSS加载完成 -->\n</body>\n</html>\n\n为什么CSS阻塞渲染？\n- 防止FOUC（Flash of Unstyled Content）\n- 避免重新渲染\n\n/* JavaScript阻塞解析 */\n<body>\n  <div>内容1</div>\n  \n  <script src="script.js"></script>\n  <!-- HTML解析暂停，等待JS下载和执行 -->\n  \n  <div>内容2</div>\n  <!-- 这部分要等JS执行完才解析 -->\n</body>\n\n为什么JS阻塞解析？\n- JS可能修改DOM\n- document.write()等API\n- 保证执行顺序',
                        content: "CSS阻塞渲染，JS阻塞解析。"
                    },
                    {
                        title: "优化策略1：减少关键资源",
                        code: '/* 1. 内联关键CSS */\n<!DOCTYPE html>\n<html>\n<head>\n  <!-- 内联首屏CSS -->\n  <style>\n    /* 只包含首屏样式 */\n    body { margin: 0; font-family: Arial; }\n    .header { background: #333; }\n    .hero { min-height: 100vh; }\n  </style>\n  \n  <!-- 异步加载完整CSS -->\n  <link rel="preload" href="style.css" as="style" \n        onload="this.onload=null;this.rel=\'stylesheet\'">\n  <noscript>\n    <link rel="stylesheet" href="style.css">\n  </noscript>\n</head>\n\n/* 2. 延迟非关键CSS */\n<link rel="stylesheet" href="print.css" media="print">\n<link rel="stylesheet" href="desktop.css" media="(min-width: 1200px)">\n\n/* 3. 使用defer/async */\n<script defer src="app.js"></script>\n<script async src="analytics.js"></script>',
                        content: "减少阻塞资源数量。"
                    },
                    {
                        title: "优化策略2：减少资源大小",
                        code: '/* 1. 压缩资源 */\n// CSS\ncssnano / clean-css\n\n// JavaScript\nUglifyJS / Terser\n\n// HTML\nhtml-minifier\n\n/* 2. 移除未使用代码 */\n// CSS\nPurgeCSS / UnCSS\n\n// JavaScript\nTree Shaking（Webpack）\n\n/* 3. Gzip/Brotli压缩 */\n// 服务器配置\n# Nginx\ngzip on;\ngzip_types text/css application/javascript;\n\n# Apache\nAddOutputFilterByType DEFLATE text/html text/css application/javascript\n\n/* 4. 图片优化 */\n- WebP格式\n- 压缩\n- 响应式图片\n- 懒加载',
                        content: "压缩和优化资源。"
                    },
                    {
                        title: "优化策略3：减少往返次数",
                        code: '/* 1. 使用CDN */\n<link rel="stylesheet" href="https://cdn.example.com/style.css">\n\n/* 2. 资源提示 */\n<link rel="dns-prefetch" href="https://cdn.example.com">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preload" href="font.woff2" as="font" crossorigin>\n\n/* 3. HTTP/2多路复用 */\n// 自动并行请求多个资源\n\n/* 4. 缓存 */\nCache-Control: max-age=31536000, immutable\n\n/* 5. 合并资源（HTTP/1.1时代） */\n// 合并CSS\n// 合并JS\n// CSS Sprites\n// 注意：HTTP/2时代可能不需要',
                        content: "减少网络往返。"
                    },
                    {
                        title: "测量CRP",
                        code: '/* 1. Performance API */\nconst perfData = performance.timing;\n\n// 首次绘制\nconst fp = perfData.domLoading - perfData.fetchStart;\n\n// DOM加载\nconst domReady = perfData.domContentLoadedEventEnd - perfData.fetchStart;\n\n// 页面加载\nconst onload = perfData.loadEventEnd - perfData.fetchStart;\n\nconsole.log(`First Paint: ${fp}ms`);\nconsole.log(`DOM Ready: ${domReady}ms`);\nconsole.log(`Page Load: ${onload}ms`);\n\n/* 2. Lighthouse */\n// Chrome DevTools > Lighthouse\n// 分析：\n- First Contentful Paint (FCP)\n- Largest Contentful Paint (LCP)\n- Time to Interactive (TTI)\n- Total Blocking Time (TBT)\n\n/* 3. WebPageTest */\nhttps://www.webpagetest.org/\n// 查看瀑布图\n// 分析关键路径\n\n/* 4. Chrome DevTools Performance */\n// 录制页面加载\n// 查看：\n- Parse HTML\n- Parse CSS\n- Evaluate Script\n- Layout\n- Paint',
                        content: "测量和分析CRP性能。"
                    },
                    {
                        title: "完整优化示例",
                        code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>优化示例</title>\n  \n  <!-- 1. DNS预解析 -->\n  <link rel="dns-prefetch" href="https://fonts.googleapis.com">\n  <link rel="dns-prefetch" href="https://cdn.example.com">\n  \n  <!-- 2. 预连接关键域名 -->\n  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>\n  \n  <!-- 3. 预加载关键资源 -->\n  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>\n  \n  <!-- 4. 内联关键CSS -->\n  <style>\n    /* 首屏关键样式 */\n    *{box-sizing:border-box}body{margin:0;font:16px/1.5 Arial}\n    .header{background:#333;color:#fff;padding:1rem}\n    .hero{min-height:100vh;display:flex;align-items:center}\n  </style>\n  \n  <!-- 5. 异步加载完整CSS -->\n  <link rel="preload" href="/css/main.css" as="style" \n        onload="this.onload=null;this.rel=\'stylesheet\'">\n  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>\n  \n  <!-- 6. 按需加载CSS -->\n  <link rel="stylesheet" href="/css/print.css" media="print">\n</head>\n<body>\n  <header class="header">\n    <h1>网站标题</h1>\n  </header>\n  \n  <main class="hero">\n    <h2>首屏内容</h2>\n  </main>\n  \n  <!-- 7. defer加载应用脚本 -->\n  <script defer src="/js/main.js"></script>\n  \n  <!-- 8. async加载分析脚本 -->\n  <script async src="/js/analytics.js"></script>\n</body>\n</html>\n\n结果：\n- FCP < 1.5s\n- LCP < 2.5s\n- TTI < 3.5s',
                        content: "综合优化方案。"
                    }
                ]
            },
            source: "Web性能优化"
        },
        {
            difficulty: "medium",
            tags: ["重排", "重绘"],
            question: "哪些操作会触发重排（Reflow）？",
            type: "multiple-choice",
            options: [
                "修改元素尺寸",
                "添加/删除元素",
                "改变字体大小",
                "读取offsetWidth等属性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "重排（Reflow）",
                description: "重新计算元素的几何属性。",
                sections: [
                    {
                        title: "触发重排的操作",
                        code: '/* 1. 修改几何属性 */\nelement.style.width = "100px";\nelement.style.height = "100px";\nelement.style.padding = "10px";\nelement.style.margin = "10px";\nelement.style.border = "1px solid";\n\n/* 2. 修改内容 */\nelement.textContent = "新内容";\nelement.innerHTML = "<div>新内容</div>";\n\n/* 3. 添加/删除元素 */\nparent.appendChild(newElement);\nparent.removeChild(element);\n\n/* 4. 修改类名 */\nelement.className = "new-class";\n\n/* 5. 修改字体 */\nelement.style.fontSize = "20px";\nelement.style.fontFamily = "Arial";\n\n/* 6. 激活伪类 */\nelement:hover { width: 200px; }\n\n/* 7. 窗口resize */\nwindow.addEventListener("resize", handler);\n\n/* 8. 滚动 */\nwindow.addEventListener("scroll", handler);',
                        content: "多种操作触发重排。"
                    },
                    {
                        title: "读取属性触发重排",
                        code: '/* 读取这些属性会强制重排 */\n\n// 尺寸\nelement.offsetWidth\nelement.offsetHeight\nelement.offsetLeft\nelement.offsetTop\n\nelement.clientWidth\nelement.clientHeight\nelement.clientLeft\nelement.clientTop\n\nelement.scrollWidth\nelement.scrollHeight\nelement.scrollLeft\nelement.scrollTop\n\n// 位置\nelement.getBoundingClientRect()\nelement.getClientRects()\n\n// 计算样式\nwindow.getComputedStyle(element)\n\n// 为什么会触发重排？\n// 浏览器需要确保返回最新值\n// 必须立即计算布局\n\n/* 强制同步布局（Layout Thrashing）*/\n// ❌ 不好：读写交替\nfor (let i = 0; i < elements.length; i++) {\n  const width = container.offsetWidth;  // 读：触发重排\n  elements[i].style.width = width + "px";  // 写\n}\n\n// ✅ 好：批量读，批量写\nconst width = container.offsetWidth;  // 读一次\nfor (let i = 0; i < elements.length; i++) {\n  elements[i].style.width = width + "px";  // 批量写\n}',
                        content: "读取某些属性会强制重排。"
                    },
                    {
                        title: "重排的范围",
                        code: '/* 全局重排 */\n// 影响整个文档\nwindow.resize\ndocument.body.style.fontSize = "20px";\n\n/* 局部重排 */\n// 只影响子树\n.container {\n  width: 100px;  // 只影响.container及其子元素\n}\n\n/* 减少重排范围 */\n// 1. 使用绝对定位\n.element {\n  position: absolute;  // 脱离文档流\n  width: 100px;        // 不影响其他元素\n}\n\n// 2. 使用fixed\n.element {\n  position: fixed;  // 脱离文档流\n}\n\n// 3. 使用transform\n.element {\n  transform: translateX(100px);  // 不触发重排\n}',
                        content: "重排有不同的范围。"
                    },
                    {
                        title: "避免重排",
                        code: '/* 1. 批量修改样式 */\n// ❌ 多次重排\nelement.style.width = "100px";\nelement.style.height = "100px";\nelement.style.margin = "10px";\n\n// ✅ 一次重排\nelement.style.cssText = "width:100px;height:100px;margin:10px";\n// 或\nelement.className = "new-class";\n\n/* 2. 离线操作DOM */\n// ❌ 在线修改\nfor (let i = 0; i < 1000; i++) {\n  ul.appendChild(createLi());  // 1000次重排\n}\n\n// ✅ 离线修改\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  fragment.appendChild(createLi());\n}\nul.appendChild(fragment);  // 1次重排\n\n/* 3. 克隆节点 */\nconst clone = element.cloneNode(true);\n// 修改clone\nclone.style.width = "200px";\n// 替换\nelement.parentNode.replaceChild(clone, element);\n\n/* 4. display: none */\nelement.style.display = "none";  // 1次重排\n// 多次修改\nelement.style.width = "100px";\nelement.style.height = "100px";\nelement.style.display = "block";  // 1次重排\n// 总共2次重排',
                        content: "多种方式避免重排。"
                    },
                    {
                        title: "使用transform代替",
                        code: '/* ❌ 触发重排 */\n.box {\n  transition: left 0.3s;\n}\n.box:hover {\n  left: 100px;  // 重排\n}\n\n/* ✅ 只触发合成 */\n.box {\n  transition: transform 0.3s;\n}\n.box:hover {\n  transform: translateX(100px);  // 不重排\n}\n\n/* ❌ 触发重排 */\n@keyframes move {\n  to { left: 100px; }\n}\n\n/* ✅ 只触发合成 */\n@keyframes move {\n  to { transform: translateX(100px); }\n}\n\n/* 推荐动画属性 */\ntransform  - 位置、缩放、旋转\nopacity    - 透明度\n\n/* 避免动画属性 */\nwidth, height  - 触发重排\nleft, top      - 触发重排\nmargin, padding - 触发重排',
                        content: "transform性能更好。"
                    },
                    {
                        title: "浏览器优化",
                        code: '/* 浏览器的优化机制 */\n\n// 1. 渲染队列\n// 浏览器会将多次DOM修改放入队列\n// 在合适时机统一执行\n\nelement.style.width = "100px";\nelement.style.height = "100px";\nelement.style.margin = "10px";\n// 浏览器可能合并为1次重排\n\n// 2. 强制刷新队列\nelement.style.width = "100px";\nconst width = element.offsetWidth;  // 强制立即重排\nelement.style.height = "100px";\n// 因为读取offsetWidth，无法合并\n\n/* 使用requestAnimationFrame */\nfunction updateStyles() {\n  element.style.width = "100px";\n  element.style.height = "100px";\n}\n\n// ❌ 可能在不合适的时机\nupdateStyles();\n\n// ✅ 在浏览器下一帧\nrequestAnimationFrame(updateStyles);',
                        content: "浏览器有优化机制。"
                    },
                    {
                        title: "检测工具",
                        code: '/* Chrome DevTools */\n\n// 1. Performance面板\n// - 录制页面操作\n// - 查看Rendering区域\n// - 紫色表示Layout（重排）\n// - 绿色表示Paint（重绘）\n\n// 2. Rendering面板\n// More tools > Rendering\n// 勾选：\n// - Paint flashing（绘制闪烁）\n// - Layout Shift Regions（布局偏移）\n// - Layer borders（图层边界）\n// - FPS meter（帧率）\n\n// 3. 代码检测\nconst start = performance.now();\n// 可能触发重排的操作\nconst width = element.offsetWidth;\nconst end = performance.now();\nconsole.log(`Time: ${end - start}ms`);\n\n/* PerformanceObserver */\nconst observer = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    console.log(entry);\n  }\n});\nobserver.observe({ entryTypes: ["measure", "layout-shift"] });',
                        content: "使用工具检测重排。"
                    }
                ]
            },
            source: "浏览器工作原理"
        },
        {
            difficulty: "medium",
            tags: ["GPU加速", "图层"],
            question: "什么是GPU加速（硬件加速）？",
            type: "multiple-choice",
            options: [
                "使用GPU处理图形",
                "创建合成图层",
                "transform和opacity不触发重排",
                "will-change提示浏览器"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "GPU加速",
                description: "利用GPU提升渲染性能。",
                sections: [
                    {
                        title: "合成图层",
                        code: '/* 创建合成图层的条件 */\n\n1. 3D或透视变换\n.element {\n  transform: translateZ(0);\n  transform: translate3d(0, 0, 0);\n  transform: perspective(1000px);\n}\n\n2. video, canvas, iframe\n<video></video>\n<canvas></canvas>\n<iframe></iframe>\n\n3. CSS动画或过渡（transform, opacity）\n.element {\n  animation: move 1s;\n}\n@keyframes move {\n  to { transform: translateX(100px); }\n}\n\n4. will-change\n.element {\n  will-change: transform;\n  will-change: opacity;\n}\n\n5. 有合成层子元素\n.parent {}\n.child {\n  transform: translateZ(0);  // 创建图层\n}\n\n6. position: fixed\n.element {\n  position: fixed;\n}',
                        content: "多种方式创建合成图层。"
                    },
                    {
                        title: "GPU加速原理",
                        code: '/* 渲染流程对比 */\n\n【CPU渲染】\nJavaScript → Style → Layout → Paint → Composite\n  ↓           ↓        ↓        ↓         ↓\n所有步骤都在CPU上执行\n\n【GPU加速】\nJavaScript → Style → Layout → Paint → Composite\n  ↓           ↓        ↓        ↓         ↓\nCPU         CPU      CPU      CPU       GPU\n                                         ↓\n                                  某些属性只需GPU\n\n/* 只触发Composite的属性 */\ntransform  - GPU处理\nopacity    - GPU处理\n\n/* 需要Paint的属性 */\ncolor, background  - 需要重绘\nvisibility         - 需要重绘\n\n/* 需要Layout的属性 */\nwidth, height      - 需要重排\nleft, top          - 需要重排',
                        content: "GPU加速跳过重排和重绘。"
                    },
                    {
                        title: "强制GPU加速",
                        code: '/* 方法1：translateZ */\n.element {\n  transform: translateZ(0);\n}\n\n/* 方法2：translate3d */\n.element {\n  transform: translate3d(0, 0, 0);\n}\n\n/* 方法3：will-change */\n.element {\n  will-change: transform;\n}\n\n/* 方法4：backface-visibility */\n.element {\n  backface-visibility: hidden;\n}\n\n/* 使用场景 */\n// 频繁动画的元素\n.animated {\n  will-change: transform;\n  animation: move 1s infinite;\n}\n\n// 滚动容器\n.scroll-container {\n  transform: translateZ(0);\n  overflow-y: scroll;\n}\n\n// 固定定位元素\n.fixed-header {\n  position: fixed;\n  transform: translateZ(0);\n}',
                        content: "多种方式触发GPU加速。"
                    },
                    {
                        title: "will-change",
                        code: '/* will-change提示浏览器 */\n\n/* 语法 */\n.element {\n  will-change: transform;        // 单个属性\n  will-change: transform, opacity;  // 多个属性\n  will-change: scroll-position;  // 滚动位置\n  will-change: contents;         // 内容\n  will-change: auto;             // 默认\n}\n\n/* 最佳实践 */\n\n// ❌ 不好：过度使用\n* {\n  will-change: transform;  // 所有元素\n}\n\n// ✅ 好：动态添加\nconst element = document.querySelector(".animated");\n\n// 动画前添加\nelement.addEventListener("mouseenter", () => {\n  element.style.willChange = "transform";\n});\n\n// 动画后移除\nelement.addEventListener("animationend", () => {\n  element.style.willChange = "auto";\n});\n\n// ✅ 或CSS\n.element {\n  /* 默认不设置 */\n}\n\n.element:hover,\n.element:focus {\n  will-change: transform;  // 交互时才设置\n}\n\n/* 注意事项 */\n1. 不要过度使用（消耗内存）\n2. 给浏览器足够的准备时间\n3. 动画结束后移除\n4. 不要用于所有元素',
                        content: "合理使用will-change。"
                    },
                    {
                        title: "优缺点",
                        code: '/* 优点 */\n1. transform, opacity动画非常流畅\n2. 不触发重排和重绘\n3. 60fps性能\n4. 节省CPU资源\n\n/* 缺点 */\n1. 额外内存开销\n   - 每个图层占用内存\n   - 移动端内存有限\n\n2. 可能更慢\n   - 创建图层有开销\n   - 图层合成有开销\n   - 简单动画可能更慢\n\n3. 可能引起bug\n   - z-index问题\n   - 文字渲染问题\n   - 子像素渲染\n\n/* 何时使用 */\n✅ 使用：\n- 频繁动画\n- 复杂动画\n- 长时间动画\n- transform/opacity动画\n\n❌ 不使用：\n- 静态元素\n- 简单动画\n- 内存受限\n- 短暂动画',
                        content: "权衡利弊。"
                    },
                    {
                        title: "检测图层",
                        code: '/* Chrome DevTools */\n\n// 1. Layers面板\n// More tools > Layers\n// 查看：\n// - 图层列表\n// - 图层原因\n// - 图层大小\n// - 内存占用\n\n// 2. Rendering面板\n// More tools > Rendering\n// 勾选 Layer borders\n// - 橙色边框：有自己的图层\n// - 蓝色网格：Tile边界\n\n// 3. Performance面板\n// 录制后查看：\n// - Composite Layers\n// - Paint\n// - Layout\n\n/* 代码检测 */\n// 检查是否有图层\nfunction hasLayer(element) {\n  const style = getComputedStyle(element);\n  return style.transform !== "none" ||\n         style.backfaceVisibility === "hidden" ||\n         style.willChange !== "auto";\n}\n\nconsole.log(hasLayer(document.querySelector(".element")));',
                        content: "使用DevTools检测图层。"
                    },
                    {
                        title: "性能对比",
                        code: '/* 测试：1000次动画 */\n\n// ❌ 使用left（触发重排）\n.box {\n  position: absolute;\n  left: 0;\n  transition: left 1s;\n}\n.box:hover {\n  left: 100px;\n}\n// 结果：卡顿，20fps\n\n// ✅ 使用transform（GPU加速）\n.box {\n  transform: translateX(0);\n  transition: transform 1s;\n}\n.box:hover {\n  transform: translateX(100px);\n}\n// 结果：流畅，60fps\n\n/* 实际测试代码 */\nconst boxes = document.querySelectorAll(".box");\n\n// 方案1：left\nfunction animateWithLeft() {\n  boxes.forEach(box => {\n    box.style.left = Math.random() * 1000 + "px";\n  });\n  requestAnimationFrame(animateWithLeft);\n}\n\n// 方案2：transform\nfunction animateWithTransform() {\n  boxes.forEach(box => {\n    const x = Math.random() * 1000;\n    box.style.transform = `translateX(${x}px)`;\n  });\n  requestAnimationFrame(animateWithTransform);\n}\n\n// 测试结果：transform快10倍以上',
                        content: "性能差异巨大。"
                    }
                ]
            },
            source: "浏览器渲染优化"
        }
    ],
    navigation: {
        prev: { title: "元数据管理", url: "quiz.html?chapter=19" },
        next: { title: "事件系统", url: "quiz.html?chapter=21" }
    }
};
