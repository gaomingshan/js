// 第1章第1节：CSS基础与引入方式
window.cssContentData_Section01 = {
    section: {
        id: 1,
        title: "CSS基础与引入方式",
        icon: "📖",
        topics: [
            {
                id: "what-is-css",
                title: "什么是CSS",
                type: "concept",
                content: {
                    description: "CSS（Cascading Style Sheets，层叠样式表）是一种用于描述HTML或XML文档外观和格式的样式表语言。它将内容（HTML）与表现（样式）分离，使得网页的维护和更新变得更加容易。",
                    keyPoints: [
                        "CSS = Cascading Style Sheets（层叠样式表）",
                        "负责网页的视觉呈现和布局",
                        "与HTML、JavaScript共同构成前端三大基石",
                        "支持响应式设计，适配不同设备和屏幕尺寸",
                        "通过选择器精确控制元素样式"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS"
                }
            },
            {
                id: "css-history",
                title: "CSS的发展历程",
                type: "principle",
                content: {
                    description: "CSS自1996年诞生以来，经历了多个版本的演进，每个版本都带来了新的特性和能力。",
                    mechanism: "CSS的版本演进遵循W3C标准制定流程，从工作草案到候选推荐标准，再到正式推荐标准。",
                    steps: [
                        "CSS1 (1996年) - 基础样式：字体、颜色、对齐等",
                        "CSS2 (1998年) - 定位、z-index、媒体类型",
                        "CSS2.1 (2011年) - 修复CSS2的错误，成为最稳定版本",
                        "CSS3 (2011年至今) - 模块化设计：圆角、阴影、动画、Flexbox、Grid等",
                        "CSS4及以后 - 部分模块已达到Level 4（如选择器、颜色）"
                    ]
                }
            },
            {
                id: "why-use-css",
                title: "为什么使用CSS",
                type: "comparison",
                content: {
                    description: "CSS解决了早期HTML样式混乱的问题，带来了内容与样式分离的设计理念。",
                    items: [
                        {
                            name: "不使用CSS（纯HTML）",
                            code: '<font color="red" size="5">标题</font>\n<table bgcolor="#cccccc">\n  <tr><td>内容</td></tr>\n</table>',
                            cons: [
                                "HTML代码臃肿，可读性差",
                                "样式修改困难，需要逐个标签修改",
                                "无法实现复杂的布局和效果",
                                "样式代码重复，文件体积大"
                            ]
                        },
                        {
                            name: "使用CSS",
                            code: '/* CSS */\n.title { color: red; font-size: 2rem; }\n.box { background: #ccc; }\n\n<!-- HTML -->\n<h1 class="title">标题</h1>\n<div class="box">内容</div>',
                            pros: [
                                "HTML结构清晰，专注于内容",
                                "统一管理样式，修改方便",
                                "样式可复用，减少代码重复",
                                "支持响应式、动画等高级特性"
                            ]
                        }
                    ]
                }
            },
            {
                id: "three-ways-to-include",
                title: "CSS的三种引入方式",
                type: "comparison",
                content: {
                    description: "CSS可以通过三种方式引入到HTML文档中，每种方式都有其适用场景。",
                    items: [
                        {
                            name: "1. 内联样式（Inline Style）",
                            code: '<div style="color: red; font-size: 16px;">文本内容</div>',
                            pros: [
                                "优先级最高（除了!important）",
                                "适合快速测试单个元素样式",
                                "动态生成的样式（如JavaScript控制）"
                            ],
                            cons: [
                                "无法复用，每个元素都要重复写",
                                "HTML代码混乱，违背内容与样式分离原则",
                                "难以维护，修改成本高",
                                "无法使用伪类、伪元素等高级选择器"
                            ]
                        },
                        {
                            name: "2. 内部样式表（Internal Style）",
                            code: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .text { color: red; font-size: 16px; }\n    .box { background: #f0f0f0; }\n  </style>\n</head>\n<body>\n  <div class="text">文本</div>\n</body>\n</html>',
                            pros: [
                                "页面级样式复用",
                                "加载速度快（无需额外HTTP请求）",
                                "适合单页面应用或特殊页面样式"
                            ],
                            cons: [
                                "无法跨页面复用",
                                "HTML文件体积增大",
                                "不利于浏览器缓存",
                                "多页面维护困难"
                            ]
                        },
                        {
                            name: "3. 外部样式表（External Style）",
                            code: '<!-- HTML文件 -->\n<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="text">文本</div>\n</body>\n</html>\n\n/* styles.css */\n.text { color: red; font-size: 16px; }',
                            pros: [
                                "完全分离内容与样式",
                                "可跨页面复用，维护方便",
                                "浏览器可缓存，提升性能",
                                "支持团队协作，样式统一管理",
                                "可使用预处理器（Sass、Less）"
                            ],
                            cons: [
                                "需要额外的HTTP请求（可通过CDN、HTTP/2优化）",
                                "首次加载稍慢（可通过preload优化）"
                            ]
                        }
                    ]
                }
            },
            {
                id: "include-priority",
                title: "样式引入优先级",
                type: "principle",
                content: {
                    description: "当同一个元素应用了多种方式的样式时，CSS会按照特定的优先级规则来决定最终生效的样式。",
                    mechanism: "浏览器会根据样式来源、选择器特异性（Specificity）和代码顺序来计算优先级。",
                    steps: [
                        "1. !important声明 > 其他所有样式（慎用）",
                        "2. 内联样式（style属性） > 内部/外部样式表",
                        "3. ID选择器 > 类选择器 > 标签选择器",
                        "4. 相同优先级时，后定义的样式覆盖先定义的（层叠性）",
                        "5. 继承的样式优先级最低"
                    ]
                }
            },
            {
                id: "best-practices",
                title: "引入方式最佳实践",
                type: "code-example",
                content: {
                    description: "在实际项目中，推荐的CSS引入策略如下：",
                    examples: [
                        {
                            title: "1. 主要使用外部样式表",
                            code: '<!-- 推荐：主样式文件 -->\n<link rel="stylesheet" href="main.css">\n<link rel="stylesheet" href="theme.css">',
                            result: "便于维护、缓存和复用"
                        },
                        {
                            title: "2. 关键CSS内联（性能优化）",
                            code: '<head>\n  <style>\n    /* 首屏关键样式，避免闪烁 */\n    body { margin: 0; font-family: sans-serif; }\n    .header { height: 60px; background: #333; }\n  </style>\n  <!-- 非关键CSS延迟加载 -->\n  <link rel="preload" href="main.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n</head>',
                            result: "提升首屏渲染速度"
                        },
                        {
                            title: "3. JavaScript动态样式使用内联",
                            code: '// 动态计算的样式使用内联\nconst box = document.querySelector(\'.box\');\nbox.style.width = `${calculatedWidth}px`;\nbox.style.transform = `translateX(${offset}px)`;',
                            result: "适合运行时计算的样式"
                        },
                        {
                            title: "4. 避免@import",
                            code: '/* 不推荐：@import会阻塞并行下载 */\n@import url("reset.css");\n@import url("layout.css");\n\n<!-- 推荐：使用多个link标签 -->\n<link rel="stylesheet" href="reset.css">\n<link rel="stylesheet" href="layout.css">',
                            result: "link标签支持并行下载，性能更好"
                        }
                    ]
                }
            },
            {
                id: "link-vs-import",
                title: "link 与 @import 的区别",
                type: "comparison",
                content: {
                    description: "link和@import都可以引入外部CSS，但它们有重要的区别。",
                    items: [
                        {
                            name: "link标签",
                            code: '<link rel="stylesheet" href="style.css">',
                            pros: [
                                "HTML标签，除了加载CSS还可加载其他资源",
                                "支持并行下载，不阻塞页面渲染",
                                "可以通过JavaScript动态插入",
                                "支持媒体查询：<link media='print'>",
                                "浏览器兼容性好"
                            ]
                        },
                        {
                            name: "@import规则",
                            code: '/* 在CSS文件中使用 */\n@import url("base.css");\n@import url("theme.css");',
                            cons: [
                                "CSS规则，只能导入CSS文件",
                                "串行下载，影响性能",
                                "必须放在样式表开头",
                                "不支持JavaScript动态控制",
                                "老版本浏览器可能不支持"
                            ]
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: null,
        next: {
            title: "CSS语法结构",
            url: "02-syntax.html"
        }
    }
};
