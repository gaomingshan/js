// 第1章：HTML简介与历史 - 面试题
window.htmlQuizData_01 = {
    config: {
        title: "HTML简介与历史",
        icon: "📜",
        description: "测试你对HTML历史、版本演进和标准的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["HTML历史", "基础概念"],
            question: "HTML的全称是什么？",
            options: [
                "HyperText Markup Language",
                "HyperText Making Language",
                "High Text Markup Language",
                "HyperText Management Language"
            ],
            correctAnswer: "A",
            explanation: {
                title: "HTML全称",
                description: "HTML是HyperText Markup Language（超文本标记语言）的缩写。",
                points: [
                    "HyperText（超文本）：指可以包含指向其他文本的链接",
                    "Markup（标记）：使用标签来描述文档结构",
                    "Language（语言）：一套用于创建网页的标记规范",
                    "HTML是Web的基础技术，由Tim Berners-Lee在1991年发明"
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "easy",
            tags: ["版本演进", "HTML5"],
            question: "HTML5相比HTML4，新增了哪些语义化标签？",
            type: "multiple-choice",
            options: [
                "<header>、<nav>、<footer>",
                "<section>、<article>、<aside>",
                "<audio>、<video>、<canvas>",
                "<div>、<span>、<p>"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "HTML5新增标签",
                description: "HTML5引入了大量新标签，显著提升了HTML的语义化能力。",
                sections: [
                    {
                        title: "语义化结构标签",
                        points: [
                            "<header>：页面或区域的头部",
                            "<nav>：导航链接区域",
                            "<footer>：页面或区域的底部",
                            "<section>：文档的章节",
                            "<article>：独立的内容单元",
                            "<aside>：侧边栏内容"
                        ]
                    },
                    {
                        title: "多媒体标签",
                        points: [
                            "<audio>：音频内容",
                            "<video>：视频内容",
                            "<canvas>：图形绘制"
                        ]
                    },
                    {
                        title: "注意",
                        content: "<div>、<span>、<p>是HTML4时代就有的标签，不是HTML5新增的。"
                    }
                ]
            },
            source: "W3C HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["标准组织", "规范"],
            question: "当前HTML标准的维护者是哪个组织？",
            options: [
                "W3C（万维网联盟）",
                "WHATWG（网页超文本应用技术工作组）",
                "ECMA International",
                "ISO（国际标准化组织）"
            ],
            correctAnswer: "B",
            explanation: {
                title: "HTML标准维护者",
                description: "HTML标准的维护权经历了从W3C到WHATWG的转变。",
                sections: [
                    {
                        title: "历史演变",
                        points: [
                            "早期：W3C主导HTML标准制定",
                            "2004年：WHATWG成立，由浏览器厂商组成",
                            "2019年：W3C和WHATWG达成协议",
                            "现在：WHATWG维护HTML Living Standard"
                        ]
                    },
                    {
                        title: "HTML Living Standard",
                        content: "WHATWG维护的是一个持续演进的标准，称为\"Living Standard\"（活标准），不再有版本号，始终保持更新。"
                    },
                    {
                        title: "浏览器厂商",
                        content: "WHATWG由Apple、Google、Mozilla、Microsoft等浏览器厂商主导，确保标准与实际实现紧密结合。"
                    }
                ]
            },
            source: "WHATWG"
        },
        {
            difficulty: "medium",
            tags: ["XHTML", "HTML对比"],
            question: "XHTML与HTML的主要区别是什么？",
            options: [
                "XHTML要求所有标签必须闭合，属性值必须用引号",
                "XHTML支持更多的标签",
                "XHTML性能更好",
                "XHTML是HTML的下一个版本"
            ],
            correctAnswer: "A",
            explanation: {
                title: "XHTML vs HTML",
                description: "XHTML是HTML的XML化版本，遵循更严格的语法规则。",
                sections: [
                    {
                        title: "XHTML语法规则",
                        points: [
                            "所有标签必须闭合（<br />而不是<br>）",
                            "标签和属性名必须小写",
                            "属性值必须用引号包裹",
                            "必须有根元素",
                            "文档必须是良构的XML"
                        ]
                    },
                    {
                        title: "HTML语法",
                        points: [
                            "允许某些标签不闭合（如<br>、<img>）",
                            "标签名大小写不敏感",
                            "某些属性可以省略引号",
                            "更宽松的语法规则"
                        ]
                    },
                    {
                        title: "历史地位",
                        content: "XHTML 2.0计划最终被放弃，HTML5成为主流标准。现代HTML5吸收了XHTML的部分优点，但保持了更宽松的语法。"
                    }
                ]
            },
            source: "W3C"
        },
        {
            difficulty: "medium",
            tags: ["浏览器", "渲染模式"],
            question: "以下哪个DOCTYPE声明会触发标准模式（Standards Mode）？",
            options: [
                "<!DOCTYPE html>",
                "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\">",
                "<!-- DOCTYPE html -->",
                "没有DOCTYPE声明"
            ],
            correctAnswer: "A",
            explanation: {
                title: "DOCTYPE与渲染模式",
                description: "DOCTYPE声明决定了浏览器的渲染模式。",
                sections: [
                    {
                        title: "三种渲染模式",
                        points: [
                            "标准模式（Standards Mode）：完全按照W3C标准渲染",
                            "怪异模式（Quirks Mode）：模拟旧浏览器的非标准行为",
                            "接近标准模式（Almost Standards Mode）：只在表格单元格中有轻微差异"
                        ]
                    },
                    {
                        title: "触发标准模式",
                        points: [
                            "HTML5：<!DOCTYPE html>（推荐）",
                            "HTML 4.01 Strict：完整的Strict DOCTYPE",
                            "XHTML 1.0 Strict：完整的XHTML DOCTYPE"
                        ]
                    },
                    {
                        title: "触发怪异模式",
                        points: [
                            "缺少DOCTYPE声明",
                            "DOCTYPE前有XML声明",
                            "使用过渡型或框架集型DOCTYPE但未指定DTD URL"
                        ]
                    },
                    {
                        title: "最佳实践",
                        content: "始终使用<!DOCTYPE html>，这是HTML5的标准声明，简洁且能触发标准模式。"
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "hard",
            tags: ["HTML5", "特性"],
            question: "HTML5引入的\"Living Standard\"（活标准）理念是什么意思？",
            options: [
                "标准持续演进，没有固定的版本号",
                "标准每年更新一次",
                "标准永远不会改变",
                "标准由用户投票决定"
            ],
            correctAnswer: "A",
            explanation: {
                title: "HTML Living Standard",
                description: "Living Standard是一种新的标准制定模式，由WHATWG采用。",
                sections: [
                    {
                        title: "Living Standard特点",
                        points: [
                            "没有版本号：不再有HTML6、HTML7等版本",
                            "持续演进：标准随时更新，添加新特性",
                            "向后兼容：新特性不破坏现有内容",
                            "实践驱动：基于浏览器实现和开发者反馈"
                        ]
                    },
                    {
                        title: "与传统标准的区别",
                        points: [
                            "传统：制定版本 → 发布 → 长期稳定 → 制定下一版本",
                            "Living Standard：持续更新 → 即时发布 → 实时反馈 → 持续改进"
                        ]
                    },
                    {
                        title: "优势",
                        points: [
                            "更快响应Web开发需求",
                            "避免长期等待下一个版本",
                            "浏览器和标准保持同步",
                            "开发者能更快使用新特性"
                        ]
                    },
                    {
                        title: "查看标准",
                        content: "可以在 https://html.spec.whatwg.org/ 查看最新的HTML Living Standard。"
                    }
                ]
            },
            source: "WHATWG"
        },
        {
            difficulty: "hard",
            tags: ["浏览器兼容", "polyfill"],
            question: "如何让旧浏览器（如IE8）支持HTML5新标签？",
            type: "multiple-choice",
            options: [
                "使用HTML5 Shiv/Shim脚本",
                "使用JavaScript创建这些元素",
                "设置CSS display属性",
                "完全不可能实现"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "旧浏览器HTML5兼容方案",
                description: "虽然旧浏览器不认识HTML5新标签，但可以通过一些技术手段使其工作。",
                sections: [
                    {
                        title: "问题原因",
                        points: [
                            "旧浏览器不识别HTML5新标签",
                            "将新标签视为行内元素",
                            "不能应用块级样式",
                            "无法正确构建DOM树"
                        ]
                    },
                    {
                        title: "解决方案1：HTML5 Shiv",
                        code: "<!--[if lt IE 9]>\n<script src=\"https://cdn.jsdelivr.net/html5shiv/3.7.3/html5shiv.min.js\"></script>\n<![endif]-->",
                        content: "HTML5 Shiv通过JavaScript创建HTML5元素的DOM节点，使浏览器能够识别和样式化这些元素。"
                    },
                    {
                        title: "解决方案2：手动创建",
                        code: "// 创建元素让浏览器识别\ndocument.createElement('header');\ndocument.createElement('nav');\ndocument.createElement('article');\n// 然后在CSS中设置\nheader, nav, article { display: block; }",
                        content: "只要用JavaScript创建过一次，浏览器就会记住这个元素。"
                    },
                    {
                        title: "解决方案3：CSS设置",
                        code: "/* 设置HTML5元素为块级 */\nheader, nav, section, article, aside, footer {\n  display: block;\n}",
                        content: "配合方案1或2使用，确保元素正确显示为块级。"
                    },
                    {
                        title: "现代实践",
                        content: "现在IE8等旧浏览器市场份额已极低，大多数项目不再需要兼容。如果需要兼容，推荐使用HTML5 Shiv。"
                    }
                ]
            },
            source: "Modernizr"
        },
        {
            difficulty: "hard",
            tags: ["语义化", "最佳实践"],
            question: "为什么HTML5强调语义化标签？",
            type: "multiple-choice",
            options: [
                "提升SEO效果，搜索引擎更容易理解内容结构",
                "增强可访问性，辅助技术能更好地解析页面",
                "提高代码可读性和可维护性",
                "提升页面渲染性能"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "HTML5语义化的重要性",
                description: "语义化是HTML5的核心理念之一，带来多方面的好处。",
                sections: [
                    {
                        title: "1. SEO优化",
                        points: [
                            "搜索引擎爬虫能更准确理解内容结构",
                            "<article>标签明确标识文章内容",
                            "<nav>标签标识导航区域",
                            "<header>/<footer>标识页面重要区域",
                            "语义化标签提供额外的上下文信息"
                        ]
                    },
                    {
                        title: "2. 可访问性提升",
                        points: [
                            "屏幕阅读器能更好地导航页面",
                            "用户可以快速跳转到main、nav等区域",
                            "语义化标签提供隐含的ARIA角色",
                            "帮助视障用户理解页面结构"
                        ]
                    },
                    {
                        title: "3. 代码可维护性",
                        points: [
                            "代码自解释，减少注释需求",
                            "团队成员更容易理解代码结构",
                            "便于代码重构和维护",
                            "减少<div>嵌套，结构更清晰"
                        ]
                    },
                    {
                        title: "4. 性能影响",
                        content: "语义化标签本身不直接提升渲染性能，但清晰的结构有利于CSS选择器优化，间接提升性能。"
                    },
                    {
                        title: "示例对比",
                        code: "<!-- 非语义化 -->\n<div class=\"header\">\n  <div class=\"nav\">...</div>\n</div>\n<div class=\"content\">...</div>\n\n<!-- 语义化 -->\n<header>\n  <nav>...</nav>\n</header>\n<main>...</main>",
                        content: "语义化版本更清晰、更有意义。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["标准", "API"],
            question: "HTML5除了新增标签，还引入了哪些重要的JavaScript API？",
            type: "multiple-choice",
            options: [
                "Canvas API、Web Storage API",
                "Geolocation API、Drag and Drop API",
                "Web Workers、WebSocket",
                "jQuery API、React API"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "HTML5 JavaScript API",
                description: "HTML5不仅仅是标签，还引入了大量强大的JavaScript API。",
                sections: [
                    {
                        title: "图形和多媒体API",
                        points: [
                            "Canvas API：2D图形绘制",
                            "WebGL：3D图形",
                            "Web Audio API：音频处理",
                            "Web Video API：视频控制"
                        ]
                    },
                    {
                        title: "存储和通信API",
                        points: [
                            "Web Storage：localStorage和sessionStorage",
                            "IndexedDB：客户端数据库",
                            "WebSocket：双向通信",
                            "Server-Sent Events：服务器推送"
                        ]
                    },
                    {
                        title: "设备和系统API",
                        points: [
                            "Geolocation API：地理位置",
                            "Device Orientation API：设备方向",
                            "Vibration API：震动",
                            "Battery Status API：电池状态"
                        ]
                    },
                    {
                        title: "性能和并发API",
                        points: [
                            "Web Workers：后台线程",
                            "Service Workers：离线应用",
                            "Performance API：性能监控",
                            "Page Visibility API：页面可见性"
                        ]
                    },
                    {
                        title: "交互API",
                        points: [
                            "Drag and Drop API：拖放",
                            "File API：文件操作",
                            "History API：历史记录管理",
                            "Fullscreen API：全屏控制"
                        ]
                    },
                    {
                        title: "注意",
                        content: "jQuery和React不是HTML5 API，它们是第三方JavaScript库/框架。"
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "medium",
            tags: ["历史", "Web标准"],
            question: "Web的发明者Tim Berners-Lee在哪一年发明了HTML？",
            options: [
                "1989年",
                "1991年",
                "1995年",
                "1999年"
            ],
            correctAnswer: "B",
            explanation: {
                title: "HTML诞生历史",
                description: "HTML的诞生标志着万维网（World Wide Web）的开始。",
                sections: [
                    {
                        title: "重要时间节点",
                        points: [
                            "1989年：Tim Berners-Lee提出万维网概念",
                            "1991年：发布第一个HTML版本（HTML 1.0）",
                            "1993年：第一个图形化浏览器Mosaic发布",
                            "1995年：HTML 2.0成为正式标准",
                            "1997年：HTML 3.2和HTML 4.0发布",
                            "1999年：HTML 4.01发布",
                            "2000年：XHTML 1.0发布",
                            "2008年：HTML5草案发布",
                            "2014年：HTML5成为正式推荐标准",
                            "2019年：WHATWG成为唯一标准维护者"
                        ]
                    },
                    {
                        title: "Tim Berners-Lee的贡献",
                        points: [
                            "发明了HTML（超文本标记语言）",
                            "发明了HTTP（超文本传输协议）",
                            "发明了URL（统一资源定位符）",
                            "创建了第一个Web浏览器和服务器",
                            "被称为'万维网之父'"
                        ]
                    },
                    {
                        title: "第一个网页",
                        content: "第一个网页于1991年8月6日上线，介绍了万维网项目。这个页面至今仍可访问：http://info.cern.ch/hypertext/WWW/TheProject.html"
                    }
                ]
            },
            source: "W3C历史文档"
        }
    ],
    navigation: {
        prev: null,
        next: { title: "文档结构与语法", url: "quiz.html?chapter=02" }
    }
};
