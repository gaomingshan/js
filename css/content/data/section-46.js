// 第46章：PostCSS与工程化
window.cssContentData_Section46 = {
    section: {
        id: 46,
        title: "PostCSS与工程化",
        icon: "🔧",
        topics: [
            {
                id: "postcss-intro",
                title: "PostCSS概述",
                type: "concept",
                content: {
                    description: "PostCSS是一个用JavaScript插件转换CSS的工具。与Sass/Less不同，PostCSS本身只是一个平台，功能通过插件实现。",
                    keyPoints: [
                        "PostCSS是CSS转换工具，不是预处理器",
                        "通过插件系统扩展功能",
                        "可以做任何CSS转换",
                        "性能优秀，速度快",
                        "现代前端工具链的核心",
                        "Autoprefixer、Tailwind CSS等都基于PostCSS"
                    ],
                    mdn: "https://postcss.org/"
                }
            },
            {
                id: "postcss-vs-preprocessors",
                title: "PostCSS与预处理器的区别",
                type: "comparison",
                content: {
                    description: "PostCSS与Sass/Less的定位和使用方式不同。",
                    items: [
                        {
                            name: "Sass/Less（预处理器）",
                            pros: [
                                "提供一套完整的语言特性",
                                "有自己的语法",
                                "功能固定，开箱即用",
                                "适合快速开发"
                            ]
                        },
                        {
                            name: "PostCSS（后处理器）",
                            pros: [
                                "插件化架构，灵活",
                                "写标准CSS或未来CSS",
                                "可以做任何CSS转换",
                                "性能更好",
                                "可以与预处理器配合使用",
                                "现代工具链的标准"
                            ]
                        }
                    ]
                }
            },
            {
                id: "popular-plugins",
                title: "常用PostCSS插件",
                type: "code-example",
                content: {
                    description: "PostCSS有丰富的插件生态，以下是最常用的插件。",
                    examples: [
                        {
                            title: "1. Autoprefixer - 自动添加浏览器前缀",
                            code: '/* 输入 */\n.container {\n  display: flex;\n  transition: all 0.3s;\n}\n\n/* Autoprefixer处理后 */\n.container {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-transition: all 0.3s;\n  transition: all 0.3s;\n}\n\n/* postcss.config.js */\nmodule.exports = {\n  plugins: [\n    require(\'autoprefixer\')({\n      overrideBrowserslist: [\n        \'last 2 versions\',\n        \'> 1%\',\n        \'not dead\'\n      ]\n    })\n  ]\n}',
                            result: "自动处理浏览器兼容性"
                        },
                        {
                            title: "2. postcss-preset-env - 使用未来CSS",
                            code: '/* 输入：使用CSS未来特性 */\n:root {\n  --mainColor: #667eea;\n}\n\n.title {\n  color: var(--mainColor);\n  font-size: clamp(1rem, 2.5vw, 2rem);\n}\n\n.element {\n  color: color-mod(var(--mainColor) alpha(90%));\n}\n\n/* 配置 */\nmodule.exports = {\n  plugins: [\n    require(\'postcss-preset-env\')({\n      stage: 1,  // 启用stage 1及以上的特性\n      features: {\n        \'nesting-rules\': true,\n        \'custom-properties\': true\n      }\n    })\n  ]\n}',
                            result: "使用最新CSS特性，自动转换"
                        },
                        {
                            title: "3. cssnano - CSS压缩优化",
                            code: '/* 输入 */\n.button {\n  background-color: #667eea;\n  border-radius: 4px;\n  padding: 10px 20px;\n  margin: 0px;\n}\n\n/* cssnano处理后 */\n.button{background-color:#667eea;border-radius:4px;padding:10px 20px;margin:0}\n\n/* 配置 */\nmodule.exports = {\n  plugins: [\n    require(\'cssnano\')({\n      preset: [\'default\', {\n        discardComments: {\n          removeAll: true,\n        },\n      }]\n    })\n  ]\n}',
                            result: "压缩和优化CSS"
                        },
                        {
                            title: "4. postcss-nested - 嵌套语法",
                            code: '/* 输入：类似Sass的嵌套 */\n.card {\n  padding: 16px;\n  \n  & .title {\n    font-size: 18px;\n  }\n  \n  &:hover {\n    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n  }\n  \n  &--featured {\n    border: 2px solid #667eea;\n  }\n}\n\n/* 输出：标准CSS */\n.card {\n  padding: 16px;\n}\n.card .title {\n  font-size: 18px;\n}\n.card:hover {\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n}\n.card--featured {\n  border: 2px solid #667eea;\n}',
                            result: "在PostCSS中使用嵌套"
                        }
                    ]
                }
            },
            {
                id: "css-modules",
                title: "CSS Modules",
                type: "code-example",
                content: {
                    description: "CSS Modules通过PostCSS实现CSS的局部作用域，解决样式冲突问题。",
                    examples: [
                        {
                            title: "1. CSS Modules基本使用",
                            code: '/* Button.module.css */\n.button {\n  padding: 10px 20px;\n  background: #667eea;\n  color: white;\n  border: none;\n  border-radius: 4px;\n}\n\n.primary {\n  background: #667eea;\n}\n\n.secondary {\n  background: #6b7280;\n}\n\n/* Button.jsx */\nimport styles from \'./Button.module.css\';\n\nfunction Button() {\n  return (\n    <button className={styles.button + \' \' + styles.primary}>\n      Click me\n    </button>\n  );\n}\n\n/* 编译后的HTML */\n<button class="Button_button__2Rfj9 Button_primary__3kL8d">\n  Click me\n</button>\n\n/* 生成的CSS */\n.Button_button__2Rfj9 {\n  padding: 10px 20px;\n  color: white;\n  border: none;\n  border-radius: 4px;\n}\n\n.Button_primary__3kL8d {\n  background: #667eea;\n}',
                            result: "类名自动生成唯一标识"
                        },
                        {
                            title: "2. 组合样式",
                            code: '/* styles.module.css */\n.base {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n}\n\n.primary {\n  composes: base;\n  background: #667eea;\n  color: white;\n}\n\n.secondary {\n  composes: base;\n  background: #6b7280;\n  color: white;\n}\n\n/* 使用 */\nimport styles from \'./styles.module.css\';\n\n<button className={styles.primary}>Primary</button>\n// 实际class: "base_xxx primary_xxx"',
                            result: "通过composes复用样式"
                        },
                        {
                            title: "3. 全局样式",
                            code: '/* styles.module.css */\n/* 局部样式 */\n.button {\n  padding: 10px 20px;\n}\n\n/* 全局样式 */\n:global(.no-hash) {\n  color: red;\n}\n\n:global {\n  .global-class {\n    font-size: 16px;\n  }\n}\n\n/* 编译后 */\n.button_abc123 {\n  padding: 10px 20px;\n}\n\n.no-hash {\n  color: red;\n}\n\n.global-class {\n  font-size: 16px;\n}',
                            result: "混合使用局部和全局样式"
                        }
                    ]
                }
            },
            {
                id: "css-in-js",
                title: "CSS-in-JS",
                type: "principle",
                content: {
                    description: "CSS-in-JS是在JavaScript中编写CSS的方案，与组件紧密结合。",
                    mechanism: "CSS-in-JS将样式作为JavaScript对象或模板字符串编写，运行时或构建时生成CSS。主流方案：styled-components（运行时）、Emotion（运行时/编译时）、Linaria（零运行时）、vanilla-extract（类型安全）。优势是完全的组件化、动态样式、类型检查；劣势是运行时开销、调试困难、学习成本。",
                    keyPoints: [
                        "样式与组件共存",
                        "完全的作用域隔离",
                        "支持动态样式和主题",
                        "TypeScript类型支持",
                        "运行时方案有性能开销",
                        "零运行时方案编译时生成CSS",
                        "主流库：styled-components、Emotion、Linaria",
                        "适合React等组件化框架"
                    ]
                }
            },
            {
                id: "build-tools-integration",
                title: "构建工具集成",
                type: "code-example",
                content: {
                    description: "PostCSS与现代构建工具的集成配置。",
                    examples: [
                        {
                            title: "1. Webpack配置",
                            code: '/* webpack.config.js */\nmodule.exports = {\n  module: {\n    rules: [\n      {\n        test: /\\.css$/,\n        use: [\n          \'style-loader\',\n          {\n            loader: \'css-loader\',\n            options: {\n              modules: true,  // 启用CSS Modules\n            }\n          },\n          {\n            loader: \'postcss-loader\',\n            options: {\n              postcssOptions: {\n                plugins: [\n                  require(\'autoprefixer\'),\n                  require(\'postcss-preset-env\'),\n                  require(\'cssnano\')\n                ]\n              }\n            }\n          }\n        ]\n      }\n    ]\n  }\n};',
                            result: "Webpack中使用PostCSS"
                        },
                        {
                            title: "2. Vite配置",
                            code: '/* vite.config.js */\nimport { defineConfig } from \'vite\';\n\nexport default defineConfig({\n  css: {\n    postcss: {\n      plugins: [\n        require(\'autoprefixer\'),\n        require(\'postcss-preset-env\')({\n          stage: 1\n        })\n      ]\n    },\n    modules: {\n      // CSS Modules配置\n      localsConvention: \'camelCase\',\n      generateScopedName: \'[name]__[local]___[hash:base64:5]\'\n    }\n  }\n});',
                            result: "Vite中使用PostCSS"
                        },
                        {
                            title: "3. postcss.config.js",
                            code: '/* postcss.config.js - 通用配置文件 */\nmodule.exports = {\n  plugins: [\n    // 使用未来CSS特性\n    require(\'postcss-preset-env\')({\n      stage: 1,\n      features: {\n        \'nesting-rules\': true,\n        \'custom-media-queries\': true,\n        \'custom-selectors\': true\n      }\n    }),\n    \n    // 自动添加浏览器前缀\n    require(\'autoprefixer\')({\n      overrideBrowserslist: [\n        \'> 1%\',\n        \'last 2 versions\',\n        \'not dead\'\n      ]\n    }),\n    \n    // 开发环境跳过压缩\n    ...process.env.NODE_ENV === \'production\'\n      ? [require(\'cssnano\')({ preset: \'default\' })]\n      : []\n  ]\n};',
                            result: "独立的PostCSS配置"
                        }
                    ]
                }
            },
            {
                id: "modern-css-workflow",
                title: "现代CSS工作流",
                type: "principle",
                content: {
                    description: "现代前端项目的CSS工程化完整方案。",
                    mechanism: "现代CSS工作流整合多种工具：1) 预处理器（可选）提供高级特性；2) PostCSS处理转换和优化；3) CSS Modules或CSS-in-JS实现作用域；4) 构建工具整合流程；5) Linter检查代码质量；6) 格式化工具统一风格。根据项目需求选择合适的组合。",
                    keyPoints: [
                        "选择预处理器（Sass）或使用原生CSS + PostCSS",
                        "使用PostCSS插件增强功能",
                        "CSS Modules避免样式冲突",
                        "Autoprefixer自动处理兼容性",
                        "cssnano压缩优化生产代码",
                        "Stylelint检查代码质量",
                        "Prettier格式化代码",
                        "构建工具自动化流程",
                        "Source Map便于调试",
                        "Critical CSS优化首屏加载"
                    ]
                }
            },
            {
                id: "performance-optimization",
                title: "CSS性能优化",
                type: "code-example",
                content: {
                    description: "工程化工具辅助的CSS性能优化策略。",
                    examples: [
                        {
                            title: "1. Critical CSS提取",
                            code: '/* 使用critical插件提取首屏CSS */\nconst critical = require(\'critical\');\n\ncritical.generate({\n  inline: true,\n  base: \'dist/\',\n  src: \'index.html\',\n  target: {\n    html: \'index.html\',\n    css: \'critical.css\'\n  },\n  width: 1300,\n  height: 900\n});\n\n/* HTML中内联关键CSS */\n<style>\n  /* 首屏关键样式内联 */\n  body { margin: 0; }\n  .header { height: 60px; }\n</style>\n\n<!-- 非关键CSS延迟加载 -->\n<link rel="preload" href="styles.css" as="style" \n      onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript>\n  <link rel="stylesheet" href="styles.css">\n</noscript>',
                            result: "加速首屏渲染"
                        },
                        {
                            title: "2. CSS代码分割",
                            code: '/* Webpack代码分割 */\nmodule.exports = {\n  optimization: {\n    splitChunks: {\n      cacheGroups: {\n        styles: {\n          name: \'styles\',\n          type: \'css/mini-extract\',\n          chunks: \'all\',\n          enforce: true\n        },\n        vendor: {\n          name: \'vendor\',\n          test: /[\\\\/]node_modules[\\\\/]/,\n          priority: -10\n        }\n      }\n    }\n  }\n};\n\n/* 按路由分割CSS */\nimport(/* webpackChunkName: "home" */ \'./Home.css\');\nimport(/* webpackChunkName: "about" */ \'./About.css\');',
                            result: "按需加载CSS"
                        },
                        {
                            title: "3. 移除未使用的CSS",
                            code: '/* 使用PurgeCSS */\nconst purgecss = require(\'@fullhuman/postcss-purgecss\');\n\nmodule.exports = {\n  plugins: [\n    purgecss({\n      content: [\n        \'./src/**/*.html\',\n        \'./src/**/*.js\',\n        \'./src/**/*.jsx\'\n      ],\n      safelist: [\'active\', \'show\', /^is-/]\n    })\n  ]\n};\n\n/* Tailwind CSS自带purge */\n// tailwind.config.js\nmodule.exports = {\n  purge: [\n    \'./src/**/*.{js,jsx,ts,tsx}\',\n    \'./public/index.html\'\n  ],\n  // ...\n}',
                            result: "大幅减小CSS文件大小"
                        }
                    ]
                }
            },
            {
                id: "best-practices",
                title: "CSS工程化最佳实践",
                type: "principle",
                content: {
                    description: "构建现代CSS工程化体系的最佳实践。",
                    mechanism: "CSS工程化的目标是提高开发效率、代码质量和应用性能。需要在功能、性能、可维护性之间找到平衡。选择合适的工具组合，建立规范和流程，持续优化。",
                    keyPoints: [
                        "建立团队CSS编码规范",
                        "使用Linter和Formatter保证代码质量",
                        "选择合适的方法论（BEM等）",
                        "合理使用预处理器，避免过度复杂",
                        "PostCSS处理兼容性和优化",
                        "CSS Modules避免样式冲突",
                        "按需加载和代码分割",
                        "提取Critical CSS优化首屏",
                        "移除未使用的CSS",
                        "监控CSS文件大小",
                        "使用Source Map便于调试",
                        "自动化测试样式回归",
                        "文档化设计系统和组件库"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Sass/Less原理", url: "45-sass-less.html" },
        next: null
    }
};
