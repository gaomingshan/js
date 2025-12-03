// 第42章：计算函数
window.cssContentData_Section42 = {
    section: {
        id: 42,
        title: "计算函数",
        icon: "🔢",
        topics: [
            {
                id: "css-math-functions",
                title: "CSS数学函数概述",
                type: "concept",
                content: {
                    description: "CSS提供了多个数学函数用于动态计算值，包括calc()、min()、max()、clamp()等，让样式更加灵活和响应式。",
                    keyPoints: [
                        "calc()：执行基本数学运算",
                        "min()：返回最小值",
                        "max()：返回最大值",
                        "clamp()：将值限制在范围内",
                        "支持混合单位运算",
                        "可以嵌套使用",
                        "实时计算，无需JavaScript"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Functions"
                }
            },
            {
                id: "calc-function",
                title: "calc() 计算函数",
                type: "code-example",
                content: {
                    description: "calc()允许在CSS中执行加减乘除运算，支持混合不同单位。",
                    examples: [
                        {
                            title: "1. 基本运算",
                            code: '/* 加法 */\n.element {\n  width: calc(100% - 80px);\n}\n\n/* 减法 */\n.sidebar {\n  height: calc(100vh - 60px);\n}\n\n/* 乘法 */\n.box {\n  width: calc(100% * 0.5);\n}\n\n/* 除法 */\n.column {\n  width: calc(100% / 3);\n}',
                            result: "支持四则运算"
                        },
                        {
                            title: "2. 混合单位",
                            code: '/* 百分比 + 像素 */\n.container {\n  width: calc(100% - 40px);\n  padding: calc(2em + 10px);\n}\n\n/* 视口单位 + 像素 */\n.hero {\n  height: calc(100vh - 80px);\n  min-height: calc(50vh + 200px);\n}\n\n/* rem + px */\n.heading {\n  font-size: calc(1rem + 2px);\n}',
                            result: "可以混合不同单位"
                        },
                        {
                            title: "3. 与CSS变量结合",
                            code: ':root {\n  --header-height: 60px;\n  --sidebar-width: 200px;\n  --spacing: 16px;\n}\n\n.main-content {\n  /* 减去头部高度 */\n  height: calc(100vh - var(--header-height));\n  \n  /* 减去侧边栏宽度和间距 */\n  width: calc(100% - var(--sidebar-width) - var(--spacing));\n  \n  /* 动态计算内边距 */\n  padding: calc(var(--spacing) * 2);\n}',
                            result: "calc与CSS变量完美配合"
                        },
                        {
                            title: "4. 复杂计算",
                            code: '/* 嵌套calc */\n.element {\n  width: calc(\n    (100% - calc(var(--gap) * 3)) / 4\n  );\n}\n\n/* 多步计算 */\n.grid-item {\n  --columns: 3;\n  --gap: 20px;\n  width: calc(\n    (100% - (var(--gap) * (var(--columns) - 1))) \n    / var(--columns)\n  );\n}\n\n/* 响应式字体大小 */\n.responsive-text {\n  font-size: calc(16px + (24 - 16) * ((100vw - 320px) / (1920 - 320)));\n}',
                            result: "支持复杂的数学表达式"
                        }
                    ]
                }
            },
            {
                id: "min-max-functions",
                title: "min() 和 max() 函数",
                type: "code-example",
                content: {
                    description: "min()返回参数中的最小值，max()返回最大值，常用于设置响应式限制。",
                    examples: [
                        {
                            title: "1. min() 函数",
                            code: '/* 宽度不超过500px，但会响应容器 */\n.box {\n  width: min(500px, 100%);\n}\n\n/* 字体大小不超过24px */\n.heading {\n  font-size: min(5vw, 24px);\n}\n\n/* 等同于 */\n.heading {\n  font-size: 5vw;\n  max-font-size: 24px; /* 伪代码 */\n}\n\n/* 内边距在小屏幕上减小 */\n.container {\n  padding: min(50px, 5vw);\n}',
                            result: "限制最大值"
                        },
                        {
                            title: "2. max() 函数",
                            code: '/* 宽度至少200px */\n.sidebar {\n  width: max(200px, 20%);\n}\n\n/* 字体大小至少16px */\n.text {\n  font-size: max(16px, 1vw);\n}\n\n/* 等同于 */\n.text {\n  font-size: 1vw;\n  min-font-size: 16px; /* 伪代码 */\n}\n\n/* 高度至少占满视口 */\n.full-page {\n  min-height: max(100vh, 600px);\n}',
                            result: "限制最小值"
                        },
                        {
                            title: "3. 组合使用",
                            code: '/* 限制宽度范围 */\n.container {\n  /* 最小500px，最大1200px，默认80% */\n  width: min(max(500px, 80%), 1200px);\n}\n\n/* 响应式间距 */\n.section {\n  /* 最小20px，最大60px，中间根据视口调整 */\n  padding: min(max(20px, 5vw), 60px);\n}\n\n/* 响应式列数 */\n.grid {\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(300px, 100%), 1fr)\n  );\n}',
                            result: "创建灵活的响应式布局"
                        }
                    ]
                }
            },
            {
                id: "clamp-function",
                title: "clamp() 函数",
                type: "code-example",
                content: {
                    description: "clamp()接受三个参数（最小值、首选值、最大值），返回限制在范围内的值。",
                    examples: [
                        {
                            title: "1. 基本用法",
                            code: '/* clamp(最小值, 首选值, 最大值) */\n.element {\n  /* 宽度在300px-800px之间，默认50% */\n  width: clamp(300px, 50%, 800px);\n}\n\n/* 等同于 */\n.element {\n  width: max(300px, min(50%, 800px));\n}\n\n/* 或使用传统方式 */\n.element {\n  width: 50%;\n  min-width: 300px;\n  max-width: 800px;\n}',
                            result: "更简洁的范围限制"
                        },
                        {
                            title: "2. 响应式字体大小",
                            code: '/* 流体字体大小 */\n.heading {\n  /* 在16px-32px之间，根据视口动态调整 */\n  font-size: clamp(16px, 4vw, 32px);\n}\n\n.body-text {\n  font-size: clamp(14px, 2vw, 18px);\n}\n\n/* 更精确的控制 */\n.title {\n  font-size: clamp(\n    1rem,\n    0.5rem + 2vw,\n    3rem\n  );\n}',
                            result: "完美的流体排版"
                        },
                        {
                            title: "3. 响应式间距",
                            code: '/* 动态内边距 */\n.container {\n  padding: clamp(1rem, 5vw, 3rem);\n}\n\n/* 动态外边距 */\n.section {\n  margin-block: clamp(2rem, 8vh, 6rem);\n}\n\n/* 动态间隙 */\n.grid {\n  gap: clamp(0.5rem, 3vw, 2rem);\n}',
                            result: "适应不同屏幕的间距"
                        },
                        {
                            title: "4. 复杂的clamp表达式",
                            code: '/* 结合calc和CSS变量 */\n:root {\n  --min-size: 16px;\n  --max-size: 24px;\n  --viewport-width: 100vw;\n}\n\n.text {\n  font-size: clamp(\n    var(--min-size),\n    calc(var(--min-size) + (var(--max-size) - var(--min-size)) * ((var(--viewport-width) - 320px) / (1920 - 320))),\n    var(--max-size)\n  );\n}\n\n/* 或更简洁的 */\n.text {\n  font-size: clamp(\n    1rem,\n    0.75rem + 0.5vw,\n    1.5rem\n  );\n}',
                            result: "高级流体设计"
                        }
                    ]
                }
            },
            {
                id: "practical-examples",
                title: "实际应用示例",
                type: "code-example",
                content: {
                    description: "数学函数在实际项目中的应用场景。",
                    examples: [
                        {
                            title: "1. 流体布局系统",
                            code: ':root {\n  --content-width: clamp(300px, 90%, 1200px);\n  --gutter: clamp(1rem, 3vw, 2rem);\n}\n\n.container {\n  width: var(--content-width);\n  margin-inline: auto;\n  padding-inline: var(--gutter);\n}\n\n.grid {\n  display: grid;\n  gap: var(--gutter);\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(250px, 100%), 1fr)\n  );\n}',
                            result: "完全响应式的布局"
                        },
                        {
                            title: "2. 流体排版系统",
                            code: ':root {\n  /* 基础字体大小 */\n  --font-size-base: clamp(16px, 2vw, 18px);\n  \n  /* 排版比例 */\n  --ratio: 1.25;\n  \n  /* 字体大小级别 */\n  --font-xs: calc(var(--font-size-base) / var(--ratio) / var(--ratio));\n  --font-sm: calc(var(--font-size-base) / var(--ratio));\n  --font-base: var(--font-size-base);\n  --font-lg: calc(var(--font-size-base) * var(--ratio));\n  --font-xl: calc(var(--font-size-base) * var(--ratio) * var(--ratio));\n  --font-2xl: calc(var(--font-size-base) * var(--ratio) * var(--ratio) * var(--ratio));\n}\n\nh1 { font-size: var(--font-2xl); }\nh2 { font-size: var(--font-xl); }\nh3 { font-size: var(--font-lg); }\np { font-size: var(--font-base); }\nsmall { font-size: var(--font-sm); }',
                            result: "基于比例的排版系统"
                        },
                        {
                            title: "3. 响应式卡片网格",
                            code: '.card-grid {\n  display: grid;\n  gap: clamp(1rem, 3vw, 2rem);\n  \n  /* 自动适应的列数 */\n  grid-template-columns: repeat(\n    auto-fill,\n    minmax(\n      clamp(250px, calc((100% - 2rem) / 3), 350px),\n      1fr\n    )\n  );\n}\n\n.card {\n  padding: clamp(1rem, 3vw, 2rem);\n  border-radius: clamp(8px, 1vw, 16px);\n}',
                            result: "完全自适应的卡片布局"
                        },
                        {
                            title: "4. 动态间距系统",
                            code: ':root {\n  --space-unit: clamp(4px, 1vw, 8px);\n  --space-xs: var(--space-unit);\n  --space-sm: calc(var(--space-unit) * 2);\n  --space-md: calc(var(--space-unit) * 4);\n  --space-lg: calc(var(--space-unit) * 6);\n  --space-xl: calc(var(--space-unit) * 8);\n}\n\n.section {\n  padding-block: var(--space-xl);\n  margin-block: var(--space-lg);\n}\n\n.element {\n  gap: var(--space-md);\n  padding: var(--space-sm);\n}',
                            result: "基于基本单位的间距"
                        }
                    ]
                }
            },
            {
                id: "calc-gotchas",
                title: "calc() 注意事项",
                type: "principle",
                content: {
                    description: "使用calc()时需要注意的一些细节和陷阱。",
                    mechanism: "calc()虽然强大，但有一些需要注意的点：运算符两侧必须有空格（+和-）、除数不能为0、某些属性不支持calc()、单位不能混用于乘除法等。",
                    keyPoints: [
                        "加号和减号两侧必须有空格：calc(100% - 20px) ✓",
                        "乘号和除号不需要空格，但建议加上",
                        "除法的除数必须是无单位数字",
                        "乘法时至少有一个参数是无单位数字",
                        "不能用于content属性",
                        "0值可以不带单位，但建议带上",
                        "注意运算符优先级，使用括号明确",
                        "某些旧浏览器需要前缀（-webkit-calc等）"
                    ]
                }
            },
            {
                id: "math-functions-best-practices",
                title: "数学函数最佳实践",
                type: "code-example",
                content: {
                    description: "使用数学函数的最佳实践和技巧。",
                    examples: [
                        {
                            title: "1. 使用CSS变量提升可维护性",
                            code: ':root {\n  --min-width: 300px;\n  --max-width: 1200px;\n  --preferred-width: 80%;\n}\n\n.container {\n  /* 清晰易读 */\n  width: clamp(\n    var(--min-width),\n    var(--preferred-width),\n    var(--max-width)\n  );\n}',
                            result: "变量让代码更清晰"
                        },
                        {
                            title: "2. 添加注释说明",
                            code: '.element {\n  /* 宽度：最小300px，默认容器50%，最大600px */\n  width: clamp(300px, 50%, 600px);\n  \n  /* 字体：16px到24px之间流体变化 */\n  font-size: clamp(\n    1rem,              /* 最小16px */\n    0.875rem + 0.5vw, /* 根据视口调整 */\n    1.5rem            /* 最大24px */\n  );\n}',
                            result: "注释帮助理解"
                        },
                        {
                            title: "3. 提供回退方案",
                            code: '.element {\n  /* 不支持clamp的浏览器 */\n  font-size: 18px;\n  \n  /* 支持的浏览器会覆盖 */\n  font-size: clamp(16px, 4vw, 24px);\n}\n\n/* 或使用@supports */\n.element {\n  font-size: 18px;\n}\n\n@supports (font-size: clamp(1rem, 1vw, 2rem)) {\n  .element {\n    font-size: clamp(16px, 4vw, 24px);\n  }\n}',
                            result: "确保向后兼容"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "动态主题实现", url: "41-theme-implementation.html" },
        next: { title: "图形函数", url: "43-shape-functions.html" }
    }
};
