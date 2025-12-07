/**
 * HTML 学习系统 - 目录数据
 * 数据驱动的目录配置
 */

const htmlIndexData = {
    // 基本信息
    subject: 'html',
    title: 'HTML 学习系统',
    subtitle: '从基础到高级，系统掌握HTML核心知识与最佳实践',
    icon: '📄',
    
    // 主题配色
    theme: {
        primary: '#e96443',
        secondary: '#904e95',
        gradient: 'linear-gradient(135deg, #e96443 0%, #904e95 100%)'
    },
    
    // 标签页配置
    tabs: [
        {
            id: 'content',
            name: '内容学习',
            icon: '📚',
            urlTemplate: 'content.html?chapter={chapter}',
            sections: [
                {
                    name: '第一部分：HTML基础',
                    icon: '📘',
                    count: 6,
                    topics: [
                        {
                            chapter: 1,
                            title: 'HTML简介与历史',
                            description: 'HTML的诞生、版本演进、W3C与WHATWG标准'
                        },
                        {
                            chapter: 2,
                            title: '文档结构与语法',
                            description: 'DOCTYPE声明、html/head/body结构、语法规则'
                        },
                        {
                            chapter: 3,
                            title: '头部元素详解',
                            description: 'title、meta、link、style、script、base标签'
                        },
                        {
                            chapter: 4,
                            title: '文本内容标签',
                            description: '标题、段落、文本格式化、引用、代码展示'
                        },
                        {
                            chapter: 5,
                            title: '列表与定义',
                            description: '无序列表、有序列表、定义列表及嵌套'
                        },
                        {
                            chapter: 6,
                            title: '链接与导航',
                            description: 'a标签详解、锚点链接、download属性、安全性'
                        }
                    ]
                },
                {
                    name: '第二部分：媒体与嵌入',
                    icon: '🎬',
                    count: 5,
                    topics: [
                        {
                            chapter: 7,
                            title: '图片处理',
                            description: 'img标签、响应式图片、picture元素、懒加载'
                        },
                        {
                            chapter: 8,
                            title: '音频与视频',
                            description: 'audio、video标签、媒体属性、track字幕'
                        },
                        {
                            chapter: 9,
                            title: '嵌入内容',
                            description: 'iframe、embed、object、沙箱与安全'
                        },
                        {
                            chapter: 10,
                            title: 'SVG与Canvas',
                            description: '内联SVG、canvas基础、使用场景对比'
                        },
                        {
                            chapter: 11,
                            title: '图形与图表',
                            description: 'figure、figcaption、map、area图像映射'
                        }
                    ]
                },
                {
                    name: '第三部分：表格与表单',
                    icon: '📝',
                    count: 6,
                    topics: [
                        {
                            chapter: 12,
                            title: '表格基础',
                            description: 'table结构、thead/tbody/tfoot、合并单元格'
                        },
                        {
                            chapter: 13,
                            title: '表格高级特性',
                            description: 'colgroup、响应式表格、性能优化'
                        },
                        {
                            chapter: 14,
                            title: '表单基础',
                            description: 'form结构、input类型、label、button'
                        },
                        {
                            chapter: 15,
                            title: '表单高级控件',
                            description: 'textarea、select、datalist、progress、meter'
                        },
                        {
                            chapter: 16,
                            title: 'HTML5表单新特性',
                            description: '新input类型、表单验证、autocomplete'
                        },
                        {
                            chapter: 17,
                            title: '表单最佳实践',
                            description: '设计原则、用户体验、安全性、无障碍'
                        }
                    ]
                },
                {
                    name: '第四部分：语义化HTML',
                    icon: '🏗️',
                    count: 5,
                    topics: [
                        {
                            chapter: 18,
                            title: 'HTML5语义化标签',
                            description: 'header、nav、main、section、article、aside、footer'
                        },
                        {
                            chapter: 19,
                            title: '微格式与微数据',
                            description: 'Schema.org、itemscope、JSON-LD、富文本摘要'
                        },
                        {
                            chapter: 20,
                            title: 'ARIA可访问性',
                            description: 'ARIA角色、属性、状态、键盘导航'
                        },
                        {
                            chapter: 21,
                            title: '语义化实战',
                            description: '博客页面、电商页面、导航系统设计'
                        },
                        {
                            chapter: 22,
                            title: 'SEO优化',
                            description: '标题层级、Meta标签、Open Graph、Twitter Card'
                        }
                    ]
                },
                {
                    name: '第五部分：安全与性能',
                    icon: '🔒',
                    count: 5,
                    topics: [
                        {
                            chapter: 23,
                            title: 'HTML安全基础',
                            description: 'XSS攻击防护、HTML实体转义、安全DOM操作'
                        },
                        {
                            chapter: 24,
                            title: '内容安全策略（CSP）',
                            description: 'CSP概念、指令详解、配置实践、报告监控'
                        },
                        {
                            chapter: 25,
                            title: '跨域与安全属性',
                            description: 'CORS、iframe沙箱、rel安全属性、referrerpolicy'
                        },
                        {
                            chapter: 26,
                            title: 'HTML性能优化',
                            description: '关键渲染路径、资源预加载、懒加载、骨架屏'
                        },
                        {
                            chapter: 27,
                            title: '资源加载优化',
                            description: 'script加载策略、preload/prefetch、DNS预解析'
                        }
                    ]
                },
                {
                    name: '第六部分：现代HTML特性',
                    icon: '🚀',
                    count: 5,
                    topics: [
                        {
                            chapter: 28,
                            title: 'Web Components基础',
                            description: 'Custom Elements、Shadow DOM、Templates、Slots'
                        },
                        {
                            chapter: 29,
                            title: 'HTML5 API集成',
                            description: '本地存储、地理位置、拖放、History API'
                        },
                        {
                            chapter: 30,
                            title: '离线与PWA',
                            description: 'manifest清单、Service Worker、离线缓存'
                        },
                        {
                            chapter: 31,
                            title: '响应式HTML',
                            description: 'viewport设置、响应式图片、设备适配'
                        },
                        {
                            chapter: 32,
                            title: '新兴HTML特性',
                            description: 'dialog、details/summary、search、Popover API'
                        }
                    ]
                },
                {
                    name: '第七部分：工程化与最佳实践',
                    icon: '🛠️',
                    count: 4,
                    topics: [
                        {
                            chapter: 33,
                            title: 'HTML代码规范',
                            description: '代码风格、命名规范、格式化、Linter工具'
                        },
                        {
                            chapter: 34,
                            title: 'HTML模板引擎',
                            description: 'Handlebars、EJS、Pug、服务端渲染、静态生成'
                        },
                        {
                            chapter: 35,
                            title: 'HTML构建工具',
                            description: '压缩优化、验证工具、自动化测试、CI/CD'
                        },
                        {
                            chapter: 36,
                            title: 'HTML最佳实践总结',
                            description: '可维护性、性能、可访问性、安全、兼容性'
                        }
                    ]
                }
            ]
        },
        {
            id: 'quiz',
            name: '面试题库',
            icon: '💡',
            urlTemplate: 'quiz.html?chapter={chapter}',
            sections: [
                {
                    name: '第一部分：HTML基础 - 面试题',
                    icon: '📘',
                    topics: [
                        { chapter: 1, title: 'HTML简介与历史', description: '10道精选面试题' },
                        { chapter: 2, title: '文档结构与语法', description: '10道精选面试题' },
                        { chapter: 3, title: '头部元素详解', description: '10道精选面试题' },
                        { chapter: 4, title: '文本内容标签', description: '10道精选面试题' },
                        { chapter: 5, title: '列表与定义', description: '10道精选面试题' },
                        { chapter: 6, title: '链接与导航', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第二部分：媒体与嵌入 - 面试题',
                    icon: '🎬',
                    topics: [
                        { chapter: 7, title: '图片处理', description: '10道精选面试题' },
                        { chapter: 8, title: '音频与视频', description: '10道精选面试题' },
                        { chapter: 9, title: '嵌入内容', description: '10道精选面试题' },
                        { chapter: 10, title: 'SVG与Canvas', description: '10道精选面试题' },
                        { chapter: 11, title: '图形与图表', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第三部分：表格与表单 - 面试题',
                    icon: '📝',
                    topics: [
                        { chapter: 12, title: '表格基础', description: '10道精选面试题' },
                        { chapter: 13, title: '表格高级特性', description: '10道精选面试题' },
                        { chapter: 14, title: '表单基础', description: '10道精选面试题' },
                        { chapter: 15, title: '表单高级控件', description: '10道精选面试题' },
                        { chapter: 16, title: 'HTML5表单新特性', description: '10道精选面试题' },
                        { chapter: 17, title: '表单最佳实践', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第四部分：语义化HTML - 面试题',
                    icon: '🏗️',
                    topics: [
                        { chapter: 18, title: 'HTML5语义化标签', description: '10道精选面试题' },
                        { chapter: 19, title: '微格式与微数据', description: '10道精选面试题' },
                        { chapter: 20, title: 'ARIA可访问性', description: '10道精选面试题' },
                        { chapter: 21, title: '语义化实战', description: '10道精选面试题' },
                        { chapter: 22, title: 'SEO优化', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第五部分：安全与性能 - 面试题',
                    icon: '🔒',
                    topics: [
                        { chapter: 23, title: 'HTML安全基础', description: '10道精选面试题' },
                        { chapter: 24, title: '内容安全策略（CSP）', description: '10道精选面试题' },
                        { chapter: 25, title: '跨域与安全属性', description: '10道精选面试题' },
                        { chapter: 26, title: 'HTML性能优化', description: '10道精选面试题' },
                        { chapter: 27, title: '资源加载优化', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第六部分：现代HTML特性 - 面试题',
                    icon: '🚀',
                    topics: [
                        { chapter: 28, title: 'Web Components基础', description: '10道精选面试题' },
                        { chapter: 29, title: 'HTML5 API集成', description: '10道精选面试题' },
                        { chapter: 30, title: '离线与PWA', description: '10道精选面试题' },
                        { chapter: 31, title: '响应式HTML', description: '10道精选面试题' },
                        { chapter: 32, title: '新兴HTML特性', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第七部分：工程化与最佳实践 - 面试题',
                    icon: '🛠️',
                    topics: [
                        { chapter: 33, title: 'HTML代码规范', description: '10道精选面试题' },
                        { chapter: 34, title: 'HTML模板引擎', description: '10道精选面试题' },
                        { chapter: 35, title: 'HTML构建工具', description: '10道精选面试题' },
                        { chapter: 36, title: 'HTML最佳实践总结', description: '10道精选面试题' }
                    ]
                }
            ]
        }
    ],
    
    // 页脚配置
    footer: {
        text: '© 2024 HTML学习系统 | 系统化掌握前端核心技术',
        links: [
            { text: 'GitHub', url: 'https://github.com' },
            { text: 'MDN文档', url: 'https://developer.mozilla.org' }
        ]
    }
};
