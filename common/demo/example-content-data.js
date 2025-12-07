/**
 * 示例数据文件
 * 演示 UniversalRendererV2 的各种 topic 类型
 */

window.exampleContentData_01 = {
    section: {
        title: "渲染器功能演示",
        icon: "🚀",
        layout: {
            type: "sidebar",          // 启用侧边栏布局
            sidebarPosition: "right", // 右侧
            sidebarSticky: true       // 固定位置
        }
    },
    
    // 右侧示例面板
    sidebar: {
        title: "代码示例",
        icon: "📋",
        examples: [
            {
                title: "示例1：Hello World",
                description: "最简单的示例",
                code: `console.log('Hello, World!');
console.log('欢迎使用新渲染器');`,
                language: "javascript",
                runnable: true
            },
            {
                title: "示例2：数组操作",
                description: "演示数组方法",
                code: `const arr = [1, 2, 3, 4, 5];
const doubled = arr.map(x => x * 2);
console.log('原数组:', arr);
console.log('加倍后:', doubled);`,
                language: "javascript",
                runnable: true
            },
            {
                title: "示例3：对象解构",
                description: "ES6解构赋值",
                code: `const person = {
  name: 'Alice',
  age: 25,
  city: 'Beijing'
};

const { name, age } = person;
console.log(\`姓名: \${name}, 年龄: \${age}\`);`,
                language: "javascript",
                runnable: true
            }
        ]
    },
    
    // 主内容区
    topics: [
        // 1. Concept - 概念讲解
        {
            type: "concept",
            title: "什么是通用渲染器",
            content: {
                description: "UniversalRendererV2 是一个强大的内容渲染引擎，支持多种学科和内容类型，可以轻松创建交互式学习内容。",
                keyPoints: [
                    "支持 HTML/CSS/Vue/React 等多种学科",
                    "23+ 种内容类型，涵盖讲解、演示、测验等",
                    "数据驱动，纯 JSON 配置",
                    "响应式设计，自适应各种屏幕",
                    "侧边栏布局支持，灵活展示示例代码"
                ],
                mdn: "https://github.com/example/universal-renderer"
            }
        },
        
        // 2. Code Example - 代码示例
        {
            type: "code-example",
            title: "基础用法示例",
            content: {
                description: "以下是使用渲染器的基本步骤：",
                examples: [
                    {
                        title: "1. 引入渲染器",
                        code: `<!-- HTML模板 -->
<script src="../core/universal-renderer-v2.js"></script>`,
                        notes: "在页面中引入核心渲染器文件"
                    },
                    {
                        title: "2. 准备数据",
                        code: `// 数据文件
window.myContentData_01 = {
  section: {
    title: "我的章节",
    icon: "📚"
  },
  topics: [
    {
      type: "concept",
      title: "概念标题",
      content: { ... }
    }
  ]
};`,
                        notes: "定义内容数据结构"
                    },
                    {
                        title: "3. 初始化渲染器",
                        code: `// 创建渲染器实例
const renderer = new UniversalRendererV2({
  subject: 'vue',
  theme: { primary: '#42b883' }
});

// 渲染内容
renderer.init(window.myContentData_01);`,
                        notes: "配置并启动渲染器"
                    }
                ]
            }
        },
        
        // 3. Comparison - 对比
        {
            type: "comparison",
            title: "新旧渲染器对比",
            content: {
                description: "UniversalRendererV2 相比旧版本有显著提升：",
                items: [
                    {
                        name: "旧版HTML渲染器",
                        pros: [
                            "简单易用",
                            "稳定可靠"
                        ],
                        cons: [
                            "仅支持10种类型",
                            "缺乏交互功能",
                            "不支持侧边栏布局",
                            "无法运行代码"
                        ]
                    },
                    {
                        name: "新版通用渲染器V2",
                        pros: [
                            "支持23+种内容类型",
                            "实时代码编辑运行",
                            "侧边栏布局支持",
                            "完整的测验题系统",
                            "多学科通用",
                            "插件化扩展"
                        ],
                        cons: [
                            "配置稍复杂（但更灵活）"
                        ]
                    }
                ]
            }
        },
        
        // 4. Tab Content - 标签页
        {
            type: "tab-content",
            title: "支持的内容类型",
            content: {
                tabs: [
                    {
                        title: "基础类型",
                        icon: "📄",
                        content: `
                            <h3>基础内容类型</h3>
                            <ul>
                                <li><strong>concept</strong> - 概念讲解</li>
                                <li><strong>code-example</strong> - 代码示例</li>
                                <li><strong>principle</strong> - 原理讲解</li>
                                <li><strong>comparison</strong> - 对比说明</li>
                                <li><strong>best-practice</strong> - 最佳实践</li>
                                <li><strong>checklist</strong> - 检查清单</li>
                            </ul>
                        `
                    },
                    {
                        title: "交互类型",
                        icon: "⚡",
                        content: `
                            <h3>交互式内容类型</h3>
                            <ul>
                                <li><strong>live-code</strong> - 实时代码编辑器</li>
                                <li><strong>playground</strong> - 代码游乐场</li>
                                <li><strong>visual-demo</strong> - 可视化演示</li>
                                <li><strong>split-view</strong> - 分屏对比</li>
                                <li><strong>tab-content</strong> - 标签页内容</li>
                            </ul>
                        `
                    },
                    {
                        title: "测验类型",
                        icon: "❓",
                        content: `
                            <h3>测验/面试题类型</h3>
                            <ul>
                                <li><strong>quiz</strong> - 单选题</li>
                                <li><strong>quiz-multi</strong> - 多选题</li>
                                <li><strong>quiz-bool</strong> - 判断题</li>
                                <li><strong>quiz-code</strong> - 代码题</li>
                                <li><strong>quiz-fill</strong> - 填空题</li>
                            </ul>
                        `
                    }
                ]
            }
        },
        
        // 5. Best Practice - 最佳实践
        {
            type: "best-practice",
            title: "使用建议",
            content: {
                description: "以下是使用新渲染器的最佳实践：",
                practices: [
                    {
                        title: "合理组织内容结构",
                        description: "将相关的 topic 分组，使用不同类型增强表达效果。例如：概念讲解 → 代码示例 → 测验题。",
                        example: `topics: [
  { type: "concept", ... },      // 先讲解
  { type: "code-example", ... }, // 再示例
  { type: "quiz", ... }          // 后测验
]`
                    },
                    {
                        title: "善用侧边栏布局",
                        description: "对于需要参考代码示例的内容，启用侧边栏布局可以让学习更高效。",
                        example: `layout: {
  type: "sidebar",
  sidebarSticky: true  // 固定在右侧
}`
                    },
                    {
                        title: "提供丰富的解析",
                        description: "测验题的 explanation 应该详细，包含知识点、示例代码和相关资源链接。",
                        example: `explanation: {
  title: "答案解析",
  sections: [
    { subtitle: "知识点", text: "..." },
    { subtitle: "代码示例", code: "..." },
    { subtitle: "扩展阅读", text: "..." }
  ]
}`
                    }
                ]
            }
        },
        
        // 6. Split View - 分屏对比
        {
            type: "split-view",
            title: "数据格式对比",
            content: {
                description: "新旧数据格式的对比：",
                left: {
                    title: "❌ 旧格式（HTML专用）",
                    code: `// 仅支持HTML
window.htmlContentData_01 = {
  chapter: "第1章",
  title: "HTML基础",
  topics: [...]
};`
                },
                right: {
                    title: "✅ 新格式（通用）",
                    code: `// 支持所有学科
window.vueContentData_01 = {
  section: {
    title: "Vue基础",
    icon: "💚",
    layout: { type: "sidebar" }
  },
  sidebar: { examples: [...] },
  topics: [...]
};`
                }
            }
        },
        
        // 7. Quiz - 测验题
        {
            type: "quiz",
            title: "知识测验",
            content: {
                difficulty: "medium",
                question: "UniversalRendererV2 支持多少种内容类型？",
                options: [
                    "10种",
                    "15种",
                    "23+种",
                    "30种"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "答案解析",
                    content: "UniversalRendererV2 支持 23+ 种内容类型，包括基础类型、交互类型、测验类型等，并且支持通过自定义类型进行扩展。",
                    sections: [
                        {
                            subtitle: "类型分类",
                            text: "基础内容类型（6种）+ 交互类型（7种）+ 可视化类型（4种）+ 测验类型（6种）= 23种核心类型"
                        },
                        {
                            subtitle: "扩展性",
                            text: "通过 customTypes 配置，可以为特定学科添加专属类型，如 Vue 的 component-demo、React 的 hooks-demo 等。"
                        }
                    ]
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "返回演示页",
            url: "renderer-showcase.html"
        },
        next: {
            title: "创建你的第一个内容",
            url: "#"
        }
    }
};
