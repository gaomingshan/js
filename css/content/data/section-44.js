// 第44章：CSS方法论
window.cssContentData_Section44 = {
    section: {
        id: 44,
        title: "CSS方法论",
        icon: "🏗️",
        topics: [
            {
                id: "css-methodologies-intro",
                title: "CSS方法论概述",
                type: "concept",
                content: {
                    description: "CSS方法论是一套组织和编写CSS代码的系统化方法，旨在提高代码的可维护性、可扩展性和团队协作效率。",
                    keyPoints: [
                        "解决大型项目中的CSS组织问题",
                        "提供命名规范和代码结构指导",
                        "增强代码可维护性和可读性",
                        "减少样式冲突和覆盖问题",
                        "提升团队协作效率",
                        "常见方法论：BEM、OOCSS、SMACSS、Atomic CSS、ITCSS等"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Guidelines"
                }
            },
            {
                id: "bem",
                title: "BEM (Block Element Modifier)",
                type: "code-example",
                content: {
                    description: "BEM是一种基于组件的CSS命名方法，将界面划分为独立的块(Block)、元素(Element)和修饰符(Modifier)。",
                    examples: [
                        {
                            title: "1. BEM命名规则",
                            code: '/* Block（块）- 独立的功能组件 */\n.card { }\n\n/* Element（元素）- 块的组成部分，使用双下划线 */\n.card__header { }\n.card__body { }\n.card__footer { }\n\n/* Modifier（修饰符）- 块或元素的状态/变体，使用双中划线 */\n.card--featured { }\n.card--large { }\n.card__header--dark { }\n\n/* 完整示例 */\n.button { }\n.button__icon { }\n.button__text { }\n.button--primary { }\n.button--disabled { }',
                            result: "清晰的层级关系"
                        },
                        {
                            title: "2. BEM实际应用",
                            code: '/* HTML结构 */\n<div class="card card--featured">\n  <div class="card__header">\n    <h3 class="card__title">标题</h3>\n  </div>\n  <div class="card__body">\n    <p class="card__text">内容</p>\n  </div>\n  <div class="card__footer">\n    <button class="card__button card__button--primary">\n      确定\n    </button>\n  </div>\n</div>\n\n/* CSS */\n.card {\n  border: 1px solid #e5e7eb;\n  border-radius: 8px;\n}\n\n.card--featured {\n  border-color: #667eea;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n}\n\n.card__header {\n  padding: 16px;\n  border-bottom: 1px solid #e5e7eb;\n}\n\n.card__title {\n  margin: 0;\n  font-size: 18px;\n}\n\n.card__button {\n  padding: 8px 16px;\n  border: none;\n  border-radius: 4px;\n}\n\n.card__button--primary {\n  background: #667eea;\n  color: white;\n}',
                            result: "避免深层嵌套，提高可维护性"
                        },
                        {
                            title: "3. BEM的优缺点",
                            code: '/* 优点 */\n// 1. 类名语义清晰，一目了然\n// 2. 避免样式冲突\n// 3. 组件独立，易于复用\n// 4. 扁平的选择器结构，性能好\n\n/* 缺点 */\n// 1. 类名较长\n// 2. HTML会有很多class\n// 3. 需要团队统一执行\n\n/* 变体：简化版BEM */\n.card { }          /* Block */\n.card-header { }   /* Element - 使用单中划线 */\n.card--featured { } /* Modifier - 保持双中划线 */',
                            result: "权衡利弊选择使用"
                        }
                    ]
                }
            },
            {
                id: "oocss",
                title: "OOCSS (Object-Oriented CSS)",
                type: "principle",
                content: {
                    description: "OOCSS将CSS视为对象，强调结构与皮肤分离、容器与内容分离的原则，提高代码复用性。",
                    mechanism: "OOCSS的两个核心原则：1) 结构与皮肤分离：将布局样式（结构）和视觉样式（皮肤）分开；2) 容器与内容分离：对象不应依赖于其所在位置。通过创建可复用的CSS对象，减少重复代码。",
                    keyPoints: [
                        "原则1：分离结构与皮肤（布局 vs 视觉）",
                        "原则2：分离容器与内容（位置无关）",
                        "创建可复用的CSS对象",
                        "使用类而不是ID选择器",
                        "避免依赖元素选择器",
                        "提高代码复用率，减少文件大小"
                    ]
                }
            },
            {
                id: "oocss-examples",
                title: "OOCSS实践",
                type: "code-example",
                content: {
                    description: "OOCSS的实际应用示例。",
                    examples: [
                        {
                            title: "1. 结构与皮肤分离",
                            code: '/* 不推荐：结构和皮肤混合 */\n.button {\n  /* 结构 */\n  display: inline-block;\n  padding: 10px 20px;\n  /* 皮肤 */\n  background: #667eea;\n  color: white;\n  border-radius: 4px;\n}\n\n/* 推荐：分离结构和皮肤 */\n/* 结构（布局） */\n.btn {\n  display: inline-block;\n  padding: 10px 20px;\n  border: none;\n  cursor: pointer;\n}\n\n/* 皮肤（视觉） */\n.btn-primary {\n  background: #667eea;\n  color: white;\n}\n\n.btn-secondary {\n  background: #6b7280;\n  color: white;\n}\n\n.btn-rounded {\n  border-radius: 4px;\n}\n\n/* 使用 */\n<button class="btn btn-primary btn-rounded">按钮</button>',
                            result: "灵活组合不同样式"
                        },
                        {
                            title: "2. 容器与内容分离",
                            code: '/* 不推荐：内容依赖容器 */\n.sidebar h3 {\n  font-size: 18px;\n  color: #333;\n}\n\n.footer h3 {\n  font-size: 18px;\n  color: #333;\n}\n\n/* 推荐：内容独立 */\n.heading-3 {\n  font-size: 18px;\n  color: #333;\n}\n\n/* 在任何地方都可以使用 */\n<aside class="sidebar">\n  <h3 class="heading-3">标题</h3>\n</aside>\n\n<footer class="footer">\n  <h3 class="heading-3">标题</h3>\n</footer>',
                            result: "组件位置无关"
                        },
                        {
                            title: "3. 创建媒体对象",
                            code: '/* 经典的媒体对象模式 */\n.media {\n  display: flex;\n  align-items: flex-start;\n}\n\n.media-figure {\n  margin-right: 16px;\n  flex-shrink: 0;\n}\n\n.media-body {\n  flex: 1;\n}\n\n/* 可以应用于各种场景 */\n<div class="media">  /* 评论 */\n  <div class="media-figure">\n    <img src="avatar.jpg" />\n  </div>\n  <div class="media-body">\n    <p>评论内容...</p>\n  </div>\n</div>\n\n<div class="media">  /* 产品列表 */\n  <div class="media-figure">\n    <img src="product.jpg" />\n  </div>\n  <div class="media-body">\n    <h3>产品名称</h3>\n    <p>产品描述</p>\n  </div>\n</div>',
                            result: "一个模式多种用途"
                        }
                    ]
                }
            },
            {
                id: "smacss",
                title: "SMACSS (Scalable and Modular Architecture for CSS)",
                type: "principle",
                content: {
                    description: "SMACSS将CSS规则分为五个类别，提供了一种模块化和可扩展的CSS架构方法。",
                    mechanism: "SMACSS将样式分为五类：1) Base（基础）：元素默认样式；2) Layout（布局）：页面主要布局，使用l-或layout-前缀；3) Module（模块）：可复用组件；4) State（状态）：描述状态，使用is-前缀；5) Theme（主题）：描述外观。",
                    keyPoints: [
                        "Base：重置样式和元素默认样式",
                        "Layout：主要布局结构（header、sidebar、main等）",
                        "Module：可复用的模块组件",
                        "State：状态样式（is-active、is-hidden等）",
                        "Theme：主题相关样式",
                        "使用前缀区分不同类别",
                        "深度嵌套不超过3层"
                    ]
                }
            },
            {
                id: "smacss-examples",
                title: "SMACSS实践",
                type: "code-example",
                content: {
                    description: "SMACSS的分类和命名实践。",
                    examples: [
                        {
                            title: "SMACSS五类样式",
                            code: '/* 1. Base - 基础样式 */\nbody {\n  font-family: Arial, sans-serif;\n  line-height: 1.6;\n  color: #333;\n}\n\na {\n  color: #667eea;\n  text-decoration: none;\n}\n\n/* 2. Layout - 布局样式 */\n.l-header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 60px;\n}\n\n.l-sidebar {\n  width: 250px;\n  float: left;\n}\n\n.l-main {\n  margin-left: 250px;\n}\n\n/* 3. Module - 模块样式 */\n.card {\n  border: 1px solid #e5e7eb;\n  border-radius: 8px;\n  padding: 16px;\n}\n\n.button {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n}\n\n/* 4. State - 状态样式 */\n.is-active {\n  font-weight: bold;\n}\n\n.is-hidden {\n  display: none;\n}\n\n.is-disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* 5. Theme - 主题样式 */\n.theme-dark .card {\n  background: #1f2937;\n  color: #f9fafb;\n}',
                            result: "清晰的样式分类"
                        }
                    ]
                }
            },
            {
                id: "atomic-css",
                title: "Atomic CSS (原子化CSS)",
                type: "code-example",
                content: {
                    description: "Atomic CSS使用单一用途的类，每个类只做一件事，类似Tailwind CSS的理念。",
                    examples: [
                        {
                            title: "1. 原子类示例",
                            code: '/* 单一用途的原子类 */\n.m-0 { margin: 0; }\n.m-1 { margin: 4px; }\n.m-2 { margin: 8px; }\n.m-3 { margin: 16px; }\n\n.p-0 { padding: 0; }\n.p-1 { padding: 4px; }\n.p-2 { padding: 8px; }\n\n.text-center { text-align: center; }\n.text-left { text-align: left; }\n.text-right { text-align: right; }\n\n.flex { display: flex; }\n.block { display: block; }\n.inline-block { display: inline-block; }\n\n.bg-blue { background-color: #667eea; }\n.bg-gray { background-color: #6b7280; }\n\n.text-white { color: white; }\n.text-black { color: black; }\n\n/* 使用 */\n<div class="flex p-2 m-1 bg-blue text-white">\n  内容\n</div>',
                            result: "组合原子类实现样式"
                        },
                        {
                            title: "2. Atomic CSS的优缺点",
                            code: '/* 优点 */\n// 1. CSS文件体积小（类可复用）\n// 2. 不需要命名，开发快速\n// 3. 样式高度可预测\n// 4. 不会产生样式冲突\n\n/* 缺点 */\n// 1. HTML会有大量class\n// 2. 违背关注点分离原则\n// 3. 调整设计需要修改HTML\n// 4. 学习成本（记住类名）\n\n/* 现代方案：Tailwind CSS */\n<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">\n  按钮\n</button>',
                            result: "现代框架采用此理念"
                        }
                    ]
                }
            },
            {
                id: "itcss",
                title: "ITCSS (Inverted Triangle CSS)",
                type: "principle",
                content: {
                    description: "ITCSS是一种CSS架构方法，按照特异性从低到高组织CSS，形成倒三角形结构。",
                    mechanism: "ITCSS将CSS分为七层，从上到下特异性逐渐增加：Settings（设置/变量）→ Tools（工具/mixins）→ Generic（通用/reset）→ Elements（元素）→ Objects（对象/布局）→ Components（组件）→ Utilities（工具类）。这样组织避免了特异性冲突。",
                    keyPoints: [
                        "Settings：CSS变量、Sass变量",
                        "Tools：mixins、functions",
                        "Generic：normalize.css、reset",
                        "Elements：元素默认样式",
                        "Objects：布局对象（OOCSS）",
                        "Components：具体组件",
                        "Utilities：工具类、辅助类",
                        "特异性从低到高递增"
                    ]
                }
            },
            {
                id: "methodology-comparison",
                title: "方法论对比与选择",
                type: "comparison",
                content: {
                    description: "不同CSS方法论的特点对比，帮助选择合适的方案。",
                    items: [
                        {
                            name: "BEM",
                            pros: [
                                "命名清晰，易于理解",
                                "避免样式冲突",
                                "组件化思想",
                                "适合大型项目",
                                "扁平的选择器"
                            ],
                            cons: [
                                "类名较长",
                                "HTML中class数量多"
                            ]
                        },
                        {
                            name: "OOCSS",
                            pros: [
                                "代码复用率高",
                                "CSS文件更小",
                                "灵活组合",
                                "易于维护"
                            ],
                            cons: [
                                "需要理解对象概念",
                                "HTML结构可能复杂"
                            ]
                        },
                        {
                            name: "Atomic CSS",
                            pros: [
                                "CSS体积最小",
                                "开发速度快",
                                "高度可预测",
                                "无命名困扰"
                            ],
                            cons: [
                                "HTML冗长",
                                "违背关注点分离",
                                "学习成本"
                            ]
                        }
                    ]
                }
            },
            {
                id: "best-practices",
                title: "CSS组织最佳实践",
                type: "principle",
                content: {
                    description: "综合各种方法论的最佳实践，构建可维护的CSS架构。",
                    mechanism: "实际项目中往往需要结合多种方法论。可以使用BEM命名组件，OOCSS思想提取公共样式，SMACSS分类组织文件，Atomic CSS作为工具类补充。关键是团队达成共识，保持一致性。",
                    keyPoints: [
                        "选择适合团队的方法论，保持一致性",
                        "组件命名使用BEM或类似规范",
                        "提取可复用的对象和模式（OOCSS）",
                        "按类别组织CSS文件（SMACSS/ITCSS）",
                        "使用工具类处理边缘情况",
                        "避免深层嵌套（不超过3层）",
                        "使用CSS预处理器辅助",
                        "建立项目风格指南",
                        "使用linter强制规范",
                        "持续重构优化代码"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "图形函数", url: "43-shape-functions.html" },
        next: { title: "Sass/Less原理", url: "45-sass-less.html" }
    }
};
