// 第30章：渲染树构建
window.cssContentData_Section30 = {
    section: {
        id: 30,
        title: "渲染树构建",
        icon: "🌲",
        topics: [
            {
                id: "rendering-process",
                title: "浏览器渲染流程概览",
                type: "principle",
                content: {
                    description: "浏览器将HTML、CSS和JavaScript转换为屏幕上像素的过程称为渲染流程，也叫关键渲染路径（Critical Rendering Path）。",
                    mechanism: "渲染流程分为五个主要步骤：1) 解析HTML构建DOM树；2) 解析CSS构建CSSOM树；3) 将DOM和CSSOM合并成渲染树（Render Tree）；4) 布局（Layout）计算元素的几何信息；5) 绘制（Paint）将渲染树转换为屏幕像素。",
                    steps: [
                        "1. DOM构建：HTML Parser解析HTML生成DOM Tree",
                        "2. CSSOM构建：CSS Parser解析CSS生成CSSOM Tree",
                        "3. 渲染树构建：DOM + CSSOM → Render Tree",
                        "4. 布局（Layout/Reflow）：计算元素位置和尺寸",
                        "5. 绘制（Paint）：将元素绘制到屏幕上",
                        "6. 合成（Composite）：将多个图层合成最终图像"
                    ]
                }
            },
            {
                id: "dom-construction",
                title: "DOM树构建过程",
                type: "principle",
                content: {
                    description: "DOM（Document Object Model）树是HTML文档的对象表示，浏览器通过HTML Parser将HTML标记转换为DOM节点树。",
                    mechanism: "HTML Parser采用增量解析方式：1) Tokenization（词法分析）：将HTML字符流转为token序列；2) Tree Construction（树构建）：根据token创建DOM节点并构建树结构；3) 遇到script标签时暂停解析，执行JavaScript；4) 异步script和defer script不阻塞DOM构建。",
                    keyPoints: [
                        "DOM构建是增量的，边解析边构建，无需等待全部HTML加载",
                        "script标签会阻塞DOM构建（除非有async或defer）",
                        "DOM树包含所有HTML元素，包括display:none的元素",
                        "构建DOM的同时会触发资源请求（img、link等）",
                        "DOMContentLoaded事件在DOM构建完成时触发"
                    ]
                }
            },
            {
                id: "cssom-construction",
                title: "CSSOM树构建过程",
                type: "principle",
                content: {
                    description: "CSSOM（CSS Object Model）树是CSS规则的对象表示，浏览器通过CSS Parser将CSS样式表转换为可计算的样式树。",
                    mechanism: "CSS Parser处理流程：1) Tokenization：将CSS文本转为token；2) 解析规则：识别选择器和声明块；3) 计算特异性：确定样式优先级；4) 构建CSSOM：按层叠规则组织样式。CSSOM构建是阻塞渲染的，因为需要完整的样式信息才能正确渲染页面。",
                    keyPoints: [
                        "CSSOM构建会阻塞渲染，CSS被称为'渲染阻塞资源'",
                        "浏览器会先下载并解析所有CSS才开始渲染",
                        "@import会阻塞并串行下载，影响性能",
                        "媒体查询不匹配的CSS仍会下载但不阻塞渲染",
                        "内联CSS不需要额外请求，可以加快首屏渲染"
                    ]
                }
            },
            {
                id: "render-tree-construction",
                title: "渲染树的构建规则",
                type: "principle",
                content: {
                    description: "渲染树（Render Tree）是DOM树和CSSOM树的合成，只包含需要显示的内容及其样式信息。",
                    mechanism: "渲染树构建算法：1) 从DOM树的根节点开始遍历；2) 对每个可见节点，查找CSSOM匹配的样式规则；3) 合并节点及其样式信息，生成渲染对象；4) 跳过不可见节点（display:none、<head>、<script>等）；5) 构建渲染树的层级结构。注意：visibility:hidden的元素会包含在渲染树中（占据空间），但display:none的元素不会。",
                    keyPoints: [
                        "渲染树只包含可见内容，display:none的元素不在渲染树中",
                        "visibility:hidden的元素在渲染树中，只是不显示",
                        "伪元素（::before、::after）会生成渲染树节点",
                        "渲染树节点称为渲染对象（Render Object）或渲染框（Render Box）",
                        "渲染树与DOM树结构不完全一致（如<table>会生成多个渲染对象）"
                    ]
                }
            },
            {
                id: "render-tree-vs-dom",
                title: "渲染树与DOM树的区别",
                type: "comparison",
                content: {
                    description: "渲染树和DOM树虽然都是树形结构，但它们的用途和内容有重要区别。",
                    items: [
                        {
                            name: "DOM树",
                            pros: [
                                "包含所有HTML元素，包括不可见元素",
                                "是HTML文档的完整对象表示",
                                "包括<head>、<script>、display:none等元素",
                                "用于JavaScript操作和文档结构表示",
                                "节点类型包括元素、文本、注释等"
                            ]
                        },
                        {
                            name: "渲染树",
                            pros: [
                                "只包含可见元素及其样式",
                                "不包含<head>、<script>、display:none等",
                                "包含计算后的样式信息",
                                "用于布局和绘制",
                                "节点是渲染对象，包含盒模型信息"
                            ]
                        }
                    ]
                }
            },
            {
                id: "critical-rendering-path",
                title: "关键渲染路径优化",
                type: "code-example",
                content: {
                    description: "优化关键渲染路径可以加快首屏渲染速度，提升用户体验。",
                    examples: [
                        {
                            title: "1. 优化CSS加载",
                            code: '<!-- 关键CSS内联 -->\n<head>\n  <style>\n    /* 首屏关键样式 */\n    body { margin: 0; font: 16px/1.5 sans-serif; }\n    .header { height: 60px; background: #333; }\n  </style>\n  \n  <!-- 非关键CSS延迟加载 -->\n  <link rel="preload" href="styles.css" as="style" \n        onload="this.onload=null;this.rel=\'stylesheet\'">\n  <noscript><link rel="stylesheet" href="styles.css"></noscript>\n</head>',
                            result: "减少渲染阻塞，加快首屏显示"
                        },
                        {
                            title: "2. 使用媒体查询拆分CSS",
                            code: '<!-- 按媒体类型加载CSS -->\n<link rel="stylesheet" href="print.css" media="print">\n<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">\n\n<!-- 非匹配的媒体查询不阻塞渲染 -->',
                            result: "只有匹配的媒体查询才阻塞渲染"
                        },
                        {
                            title: "3. 优化JavaScript加载",
                            code: '<!-- async：异步下载，下载完立即执行 -->\n<script async src="analytics.js"></script>\n\n<!-- defer：异步下载，DOMContentLoaded前执行 -->\n<script defer src="app.js"></script>\n\n<!-- 普通script会阻塞DOM构建 -->',
                            result: "减少脚本对DOM和CSSOM构建的阻塞"
                        },
                        {
                            title: "4. 减少DOM深度和复杂度",
                            code: '/* 不推荐：DOM层级过深 */\n<div><div><div><div><div>\n  <p>内容</p>\n</div></div></div></div></div>\n\n/* 推荐：扁平化DOM结构 */\n<div class="container">\n  <p>内容</p>\n</div>',
                            result: "减少DOM树和渲染树构建时间"
                        }
                    ]
                }
            },
            {
                id: "render-blocking",
                title: "渲染阻塞与优化策略",
                type: "principle",
                content: {
                    description: "理解哪些资源会阻塞渲染，以及如何优化它们，是提升页面性能的关键。",
                    mechanism: "CSS会阻塞渲染（render-blocking），因为浏览器需要完整的CSSOM才能构建渲染树。JavaScript会阻塞DOM构建（parser-blocking），因为脚本可能修改DOM和CSSOM。图片、字体等资源不阻塞初始渲染，但会触发重新布局。",
                    keyPoints: [
                        "CSS是渲染阻塞资源：浏览器等待所有CSS下载和解析完成",
                        "JavaScript是解析阻塞资源：script标签暂停DOM构建",
                        "async script不阻塞DOM构建，下载完立即执行",
                        "defer script不阻塞DOM构建，DOMContentLoaded前按顺序执行",
                        "preload可以预加载资源，preconnect可以预建立连接",
                        "关键资源应尽早加载，非关键资源应延迟加载"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "响应式单位", url: "29-responsive-units.html" },
        next: { title: "布局与绘制", url: "31-layout-paint.html" }
    }
};
