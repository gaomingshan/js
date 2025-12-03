// 第40章：自定义属性
window.cssContentData_Section40 = {
    section: {
        id: 40,
        title: "自定义属性",
        icon: "💎",
        topics: [
            {
                id: "custom-properties-intro",
                title: "CSS自定义属性概述",
                type: "concept",
                content: {
                    description: "CSS自定义属性（CSS Variables）允许你定义可重用的值，通过变量名在整个样式表中引用，极大地提升了CSS的可维护性和灵活性。",
                    keyPoints: [
                        "使用--前缀定义自定义属性",
                        "使用var()函数引用自定义属性",
                        "支持作用域和继承",
                        "可以通过JavaScript动态修改",
                        "支持fallback回退值",
                        "是实现主题切换的最佳方案"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*"
                }
            },
            {
                id: "defining-custom-properties",
                title: "定义自定义属性",
                type: "code-example",
                content: {
                    description: "自定义属性使用--作为前缀，可以在任何选择器中定义。",
                    examples: [
                        {
                            title: "1. 全局变量定义",
                            code: '/* 在:root中定义全局变量 */\n:root {\n  --primary-color: #667eea;\n  --secondary-color: #764ba2;\n  --font-size-base: 16px;\n  --spacing-unit: 8px;\n  --border-radius: 4px;\n}\n\n/* 使用变量 */\n.button {\n  background: var(--primary-color);\n  font-size: var(--font-size-base);\n  padding: var(--spacing-unit);\n  border-radius: var(--border-radius);\n}',
                            result: ":root定义的变量全局可用"
                        },
                        {
                            title: "2. 局部变量定义",
                            code: '/* 在特定选择器中定义局部变量 */\n.card {\n  --card-padding: 20px;\n  --card-bg: #fff;\n  \n  padding: var(--card-padding);\n  background: var(--card-bg);\n}\n\n/* 子元素可以访问父元素的变量 */\n.card__title {\n  padding: var(--card-padding);\n}',
                            result: "局部变量只在定义的元素及其子元素中可用"
                        },
                        {
                            title: "3. 变量命名规范",
                            code: '/* 推荐的命名方式 */\n:root {\n  /* 颜色系统 */\n  --color-primary: #667eea;\n  --color-success: #10b981;\n  --color-warning: #f59e0b;\n  --color-danger: #ef4444;\n  \n  /* 间距系统 */\n  --space-xs: 4px;\n  --space-sm: 8px;\n  --space-md: 16px;\n  --space-lg: 24px;\n  --space-xl: 32px;\n  \n  /* 字体系统 */\n  --font-size-xs: 12px;\n  --font-size-sm: 14px;\n  --font-size-base: 16px;\n  --font-size-lg: 18px;\n  --font-size-xl: 20px;\n}',
                            result: "清晰的命名提升可维护性"
                        }
                    ]
                }
            },
            {
                id: "using-var-function",
                title: "使用var()函数",
                type: "code-example",
                content: {
                    description: "var()函数用于引用自定义属性，支持fallback回退值。",
                    examples: [
                        {
                            title: "1. 基本使用",
                            code: '.element {\n  /* 使用单个变量 */\n  color: var(--primary-color);\n  \n  /* 变量可以用于任何CSS属性值 */\n  margin: var(--spacing-unit);\n  font-size: var(--font-size-base);\n  transform: translateX(var(--offset-x));\n}',
                            result: "var()获取变量的值"
                        },
                        {
                            title: "2. Fallback回退值",
                            code: '.element {\n  /* 如果--primary-color未定义，使用#667eea */\n  color: var(--primary-color, #667eea);\n  \n  /* 多层回退 */\n  color: var(--theme-color, var(--primary-color, #667eea));\n  \n  /* 复杂的回退值 */\n  box-shadow: var(--box-shadow, 0 2px 4px rgba(0,0,0,0.1));\n}',
                            result: "fallback确保变量未定义时有默认值"
                        },
                        {
                            title: "3. 变量组合使用",
                            code: ':root {\n  --spacing: 10px;\n  --multiplier: 2;\n}\n\n.element {\n  /* 变量可以与calc()结合 */\n  padding: calc(var(--spacing) * var(--multiplier));\n  \n  /* 组合多个变量 */\n  margin: var(--spacing) calc(var(--spacing) * 2);\n  \n  /* 在其他函数中使用 */\n  background: linear-gradient(\n    var(--gradient-angle, 45deg),\n    var(--color-start),\n    var(--color-end)\n  );\n}',
                            result: "变量可以灵活组合"
                        }
                    ]
                }
            },
            {
                id: "scope-and-inheritance",
                title: "作用域与继承",
                type: "principle",
                content: {
                    description: "自定义属性遵循CSS的级联和继承规则，具有作用域的概念。",
                    mechanism: "自定义属性会被继承到子元素。在:root中定义的变量全局可用；在特定选择器中定义的变量只在该元素及其子元素中可用。子元素可以重新定义同名变量，覆盖父元素的值（类似JavaScript的变量作用域）。",
                    keyPoints: [
                        "自定义属性会被继承给子元素",
                        ":root定义的变量具有全局作用域",
                        "局部定义的变量只在定义的元素及子元素中可用",
                        "子元素可以重新定义同名变量，覆盖父元素的值",
                        "变量的优先级遵循CSS特异性规则",
                        "可以利用作用域实现组件级别的样式隔离"
                    ]
                }
            },
            {
                id: "scope-examples",
                title: "作用域实际应用",
                type: "code-example",
                content: {
                    description: "利用作用域实现灵活的样式管理。",
                    examples: [
                        {
                            title: "1. 组件级变量",
                            code: '/* 全局变量 */\n:root {\n  --primary-color: #667eea;\n}\n\n/* Card组件的局部变量 */\n.card {\n  --card-bg: white;\n  --card-border: 1px solid #e5e7eb;\n  \n  background: var(--card-bg);\n  border: var(--card-border);\n}\n\n/* Dark主题的Card */\n.card--dark {\n  --card-bg: #1f2937;\n  --card-border: 1px solid #374151;\n  /* 其他样式不变，自动应用新的变量值 */\n}',
                            result: "通过覆盖变量实现主题切换"
                        },
                        {
                            title: "2. 嵌套作用域",
                            code: '.container {\n  --spacing: 20px;\n}\n\n.container .section {\n  /* 继承父元素的spacing */\n  padding: var(--spacing);\n}\n\n.container .section--compact {\n  /* 覆盖spacing变量 */\n  --spacing: 10px;\n  padding: var(--spacing); /* 使用10px */\n}\n\n.container .section--compact .item {\n  /* 继承section--compact的spacing */\n  margin: var(--spacing); /* 使用10px */\n}',
                            result: "变量沿DOM树向下继承"
                        },
                        {
                            title: "3. 媒体查询中修改变量",
                            code: ':root {\n  --container-width: 1200px;\n  --spacing: 16px;\n}\n\n@media (max-width: 768px) {\n  :root {\n    --container-width: 100%;\n    --spacing: 12px;\n  }\n}\n\n.container {\n  max-width: var(--container-width);\n  padding: var(--spacing);\n}',
                            result: "响应式设计的最佳实践"
                        }
                    ]
                }
            },
            {
                id: "javascript-interaction",
                title: "JavaScript交互",
                type: "code-example",
                content: {
                    description: "自定义属性可以通过JavaScript读取和修改，实现动态样式控制。",
                    examples: [
                        {
                            title: "1. 读取CSS变量",
                            code: '// 获取:root的CSS变量\nconst root = document.documentElement;\nconst primaryColor = getComputedStyle(root)\n  .getPropertyValue(\'--primary-color\');\n\nconsole.log(primaryColor); // "#667eea"\n\n// 获取特定元素的CSS变量\nconst element = document.querySelector(\'.card\');\nconst cardBg = getComputedStyle(element)\n  .getPropertyValue(\'--card-bg\');\n\nconsole.log(cardBg);',
                            result: "使用getComputedStyle读取变量"
                        },
                        {
                            title: "2. 修改CSS变量",
                            code: '// 修改:root的变量\nconst root = document.documentElement;\nroot.style.setProperty(\'--primary-color\', \'#ff6b6b\');\n\n// 修改特定元素的变量\nconst card = document.querySelector(\'.card\');\ncard.style.setProperty(\'--card-bg\', \'#f0f0f0\');\n\n// 批量修改\nfunction setTheme(colors) {\n  Object.entries(colors).forEach(([key, value]) => {\n    root.style.setProperty(`--${key}`, value);\n  });\n}\n\nsetTheme({\n  \'primary-color\': \'#667eea\',\n  \'secondary-color\': \'#764ba2\'\n});',
                            result: "使用setProperty修改变量"
                        },
                        {
                            title: "3. 动态主题切换",
                            code: '// 主题配置\nconst themes = {\n  light: {\n    \'--bg-color\': \'#ffffff\',\n    \'--text-color\': \'#333333\',\n    \'--border-color\': \'#e5e7eb\'\n  },\n  dark: {\n    \'--bg-color\': \'#1f2937\',\n    \'--text-color\': \'#f9fafb\',\n    \'--border-color\': \'#374151\'\n  }\n};\n\n// 切换主题\nfunction applyTheme(themeName) {\n  const theme = themes[themeName];\n  const root = document.documentElement;\n  \n  Object.entries(theme).forEach(([key, value]) => {\n    root.style.setProperty(key, value);\n  });\n  \n  localStorage.setItem(\'theme\', themeName);\n}\n\n// 应用保存的主题\nconst savedTheme = localStorage.getItem(\'theme\') || \'light\';\napplyTheme(savedTheme);',
                            result: "完整的主题切换系统"
                        }
                    ]
                }
            },
            {
                id: "advanced-usage",
                title: "高级用法",
                type: "code-example",
                content: {
                    description: "利用自定义属性的特性实现复杂的样式系统。",
                    examples: [
                        {
                            title: "1. 设计令牌（Design Tokens）",
                            code: ':root {\n  /* 颜色基础值 */\n  --color-blue-50: #eff6ff;\n  --color-blue-500: #3b82f6;\n  --color-blue-900: #1e3a8a;\n  \n  /* 语义化颜色 */\n  --color-primary: var(--color-blue-500);\n  --color-primary-light: var(--color-blue-50);\n  --color-primary-dark: var(--color-blue-900);\n  \n  /* 组件颜色 */\n  --button-bg: var(--color-primary);\n  --button-hover-bg: var(--color-primary-dark);\n  --button-text: white;\n}\n\n.button {\n  background: var(--button-bg);\n  color: var(--button-text);\n}\n\n.button:hover {\n  background: var(--button-hover-bg);\n}',
                            result: "多层次的变量系统"
                        },
                        {
                            title: "2. 动画参数控制",
                            code: ':root {\n  --animation-duration: 0.3s;\n  --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.animated {\n  transition: all \n    var(--animation-duration) \n    var(--animation-easing);\n}\n\n/* 用户偏好：减少动画 */\n@media (prefers-reduced-motion: reduce) {\n  :root {\n    --animation-duration: 0.01s;\n  }\n}',
                            result: "统一管理动画参数"
                        },
                        {
                            title: "3. 响应式间距系统",
                            code: ':root {\n  --space-unit: 8px;\n  --space-1: calc(var(--space-unit) * 1);\n  --space-2: calc(var(--space-unit) * 2);\n  --space-3: calc(var(--space-unit) * 3);\n  --space-4: calc(var(--space-unit) * 4);\n}\n\n@media (max-width: 768px) {\n  :root {\n    --space-unit: 6px;\n  }\n}\n\n.section {\n  padding: var(--space-4);\n  margin-bottom: var(--space-3);\n}\n\n.element {\n  gap: var(--space-2);\n}',
                            result: "基于基础单位的间距系统"
                        }
                    ]
                }
            },
            {
                id: "best-practices",
                title: "自定义属性最佳实践",
                type: "principle",
                content: {
                    description: "掌握自定义属性的最佳实践，构建可维护的样式系统。",
                    mechanism: "自定义属性是CSS的强大特性，但需要合理规划。建议采用分层结构：基础变量（颜色值、尺寸等）→ 语义化变量（primary、success等）→ 组件变量（button-bg等）。这种结构既保持灵活性，又便于维护。",
                    keyPoints: [
                        "使用:root定义全局变量，保持全局可访问性",
                        "采用清晰的命名规范（BEM、命名空间等）",
                        "建立分层的变量系统（基础→语义→组件）",
                        "为变量提供fallback值，增强健壮性",
                        "利用作用域实现组件级样式隔离",
                        "结合calc()实现响应式和动态计算",
                        "通过媒体查询调整变量实现响应式设计",
                        "使用JavaScript实现动态主题切换",
                        "考虑浏览器兼容性，提供回退方案",
                        "避免过度使用，保持代码可读性"
                    ]
                }
            },
            {
                id: "browser-compatibility",
                title: "浏览器兼容性",
                type: "code-example",
                content: {
                    description: "处理自定义属性的浏览器兼容性问题。",
                    examples: [
                        {
                            title: "1. 提供回退值",
                            code: '.element {\n  /* 不支持自定义属性的浏览器使用这个 */\n  color: #667eea;\n  /* 支持的浏览器会覆盖上面的值 */\n  color: var(--primary-color, #667eea);\n}\n\n/* 或使用@supports */\n.element {\n  color: #667eea;\n}\n\n@supports (--css: variables) {\n  .element {\n    color: var(--primary-color);\n  }\n}',
                            result: "优雅降级"
                        },
                        {
                            title: "2. JavaScript特性检测",
                            code: '// 检测是否支持CSS变量\nfunction supportsCSSVariables() {\n  return window.CSS && \n         window.CSS.supports && \n         window.CSS.supports(\'--test\', \'0\');\n}\n\nif (supportsCSSVariables()) {\n  // 使用CSS变量\n  document.documentElement.style\n    .setProperty(\'--primary-color\', \'#667eea\');\n} else {\n  // 使用传统方法\n  document.querySelectorAll(\'.button\').forEach(btn => {\n    btn.style.backgroundColor = \'#667eea\';\n  });\n}',
                            result: "根据支持情况选择方案"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "混合模式", url: "39-blend-modes.html" },
        next: { title: "动态主题实现", url: "41-theme-implementation.html" }
    }
};
