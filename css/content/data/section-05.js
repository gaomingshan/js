// 第5章：CSS解析机制
window.cssContentData_Section05 = {
    section: {
        id: 5,
        title: "CSS解析机制",
        icon: "🔍",
        topics: [
            {
                id: "css-parsing",
                title: "CSS解析流程",
                type: "principle",
                content: {
                    description: "浏览器将CSS文本转换为可用的样式规则需要经过词法分析和语法分析两个阶段。",
                    mechanism: "CSS解析器将CSS文本流转换为标记流（词法分析），再将标记流转换为样式规则对象（语法分析）。",
                    steps: [
                        "1. 词法分析：将CSS文本分解为标记（tokens）",
                        "2. 语法分析：根据CSS语法规则构建规则树",
                        "3. 构建CSSOM：创建CSS对象模型",
                        "4. 样式计算：计算每个元素的最终样式",
                        "5. 处理@规则：@import、@media等特殊规则"
                    ],
                    code: '/* CSS文本 */\n.box { color: red; }\n\n/* 词法分析后的标记流 */\nSELECTOR(".box")\nLBRACE\nIDENT("color")\nCOLON\nIDENT("red")\nSEMICOLON\nRBRACE'
                }
            },
            {
                id: "cssom",
                title: "CSSOM构建",
                type: "concept",
                content: {
                    description: "CSSOM（CSS Object Model）是CSS的对象表示，类似于DOM对DOM文档的表示。",
                    keyPoints: [
                        "CSSOM是一棵树结构，包含所有CSS规则",
                        "每个规则包含选择器和声明块",
                        "CSSOM与DOM结合生成渲染树",
                        "可通过JavaScript访问和修改CSSOM",
                        "document.styleSheets可访问样式表"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/API/CSS_Object_Model"
                }
            },
            {
                id: "import-processing",
                title: "@import处理",
                type: "principle",
                content: {
                    description: "@import规则用于引入外部样式表，但会影响性能。",
                    mechanism: "浏览器遇到@import时需要下载并解析新的CSS文件，形成串行加载链。",
                    steps: [
                        "@import必须在所有其他规则之前",
                        "每个@import都会产生额外的HTTP请求",
                        "@import会阻塞页面渲染",
                        "嵌套@import会形成串行加载链",
                        "建议使用<link>代替@import"
                    ],
                    code: '/* 不推荐：@import */\n@import url("base.css");\n@import url("theme.css");\n\n/* 推荐：link标签 */\n<link rel="stylesheet" href="base.css">\n<link rel="stylesheet" href="theme.css">'
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第4章：基础样式属性", url: "04-basic-styles.html" },
        next: { title: "第6章：样式表加载", url: "06-stylesheet-loading.html" }
    }
};
