# UniversalRendererV2 通用内容渲染器

> 一个强大的、支持多学科的内容渲染引擎，适用于HTML/CSS/Vue/React等学习内容和面试题系统

## 📚 特性

- ✅ **23+ 种内容类型** - 涵盖概念讲解、代码示例、交互演示、测验题等
- ✅ **多学科通用** - HTML/CSS/Vue/React 使用同一套系统
- ✅ **数据驱动** - 纯 JSON 配置，无需编写 HTML
- ✅ **实时代码运行** - 支持在线编辑和执行代码
- ✅ **侧边栏布局** - 灵活展示示例代码和说明
- ✅ **响应式设计** - 自适应各种屏幕尺寸
- ✅ **主题系统** - 每个学科独立主题配色
- ✅ **插件扩展** - 支持自定义类型和钩子

## 🗂️ 目录结构

```
common/
├── core/
│   └── universal-renderer-v2.js      # 核心渲染器 (23+种类型)
├── templates/
│   └── content-universal.html        # 通用HTML模板
├── styles/
│   ├── base.css                      # 基础样式
│   ├── content-types.css             # 内容类型样式
│   ├── quiz-types.css                # 测验类型样式
│   └── themes/                       # 主题文件
│       ├── html-theme.css
│       ├── css-theme.css
│       ├── vue-theme.css
│       └── react-theme.css
├── demo/                             # 示例演示
│   ├── renderer-showcase.html        # 效果展示页
│   ├── example-content-data.js       # 示例数据
│   └── demo-content.html             # 完整演示
└── README.md                         # 本文档
```

## 🚀 快速开始

### 1. 创建HTML页面

使用通用模板或创建自己的页面：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>我的内容</title>
    
    <!-- 引入样式 -->
    <link rel="stylesheet" href="../common/styles/base.css">
    <link rel="stylesheet" href="../common/styles/content-types.css">
    <link rel="stylesheet" href="../common/styles/quiz-types.css">
    <link rel="stylesheet" href="../common/styles/themes/vue-theme.css">
</head>
<body>
    <div class="container">
        <header class="content-header">
            <h1 id="section-title"></h1>
        </header>
        <main id="content-container"></main>
        <nav id="nav-links"></nav>
    </div>
    
    <!-- 引入渲染器和数据 -->
    <script src="../common/core/universal-renderer-v2.js"></script>
    <script src="./data/content-01.js"></script>
    <script>
        const renderer = new UniversalRendererV2({
            subject: 'vue',
            theme: { primary: '#42b883' }
        });
        renderer.init(window.vueContentData_01);
    </script>
</body>
</html>
```

### 2. 准备数据文件

创建数据文件 `data/content-01.js`：

```javascript
window.vueContentData_01 = {
    section: {
        title: "Vue响应式原理",
        icon: "💚",
        layout: {
            type: "sidebar",      // 可选：启用侧边栏
            sidebarSticky: true
        }
    },
    
    // 可选：侧边栏示例
    sidebar: {
        title: "代码示例",
        icon: "📋",
        examples: [
            {
                title: "ref 基础用法",
                code: "const count = ref(0)\ncount.value++",
                runnable: true
            }
        ]
    },
    
    // 主内容
    topics: [
        {
            type: "concept",
            title: "什么是响应式",
            content: {
                description: "Vue的响应式系统...",
                keyPoints: ["自动追踪", "自动更新"]
            }
        },
        {
            type: "quiz",
            title: "知识测验",
            content: {
                question: "ref 和 reactive 的区别？",
                options: ["A选项", "B选项", "C选项"],
                correctAnswer: 0,
                explanation: {
                    content: "ref用于基本类型..."
                }
            }
        }
    ],
    
    navigation: {
        prev: { title: "上一章", url: "..." },
        next: { title: "下一章", url: "..." }
    }
};
```

### 3. 访问页面

在浏览器中打开 HTML 文件，内容将自动渲染！

## 📋 支持的内容类型

### 基础内容类型 (6种)

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| `concept` | 概念讲解 | 知识点说明、定义 |
| `code-example` | 代码示例 | 展示代码用法 |
| `principle` | 原理讲解 | 深入机制说明 |
| `comparison` | 对比说明 | 多方案对比 |
| `best-practice` | 最佳实践 | 推荐做法 |
| `checklist` | 检查清单 | 要点检查 |

### 交互类型 (7种)

| 类型 | 说明 | 特性 |
|------|------|-----|
| `live-code` | 实时代码编辑器 | HTML/CSS/JS在线运行 |
| `playground` | 代码游乐场 | 集成编辑器 |
| `visual-demo` | 可视化演示 | 滑块控制CSS属性 |
| `split-view` | 分屏对比 | 左右对比展示 |
| `tab-content` | 标签页内容 | 多内容分tab |
| `color-palette` | 调色板 | 颜色展示和复制 |
| `component-demo` | 组件演示 | Vue/React组件 |

### 测验类型 (6种)

| 类型 | 说明 | 用途 |
|------|------|-----|
| `quiz` | 单选题 | 基础测验 |
| `quiz-multi` | 多选题 | 多答案选择 |
| `quiz-bool` | 判断题 | 对错判断 |
| `quiz-code` | 代码题 | 代码输出/结果 |
| `quiz-fill` | 填空题 | 代码补全 |
| `props-table` | 属性表格 | API文档 |

## 🎨 数据格式详解

### 完整数据结构

```javascript
{
    // 章节信息
    section: {
        title: "章节标题",
        icon: "📚",
        layout: {
            type: "sidebar" | "standard",
            sidebarPosition: "right" | "left",
            sidebarSticky: true | false,
            sidebarWidth: "400px"
        }
    },
    
    // 侧边栏（可选）
    sidebar: {
        title: "侧边栏标题",
        icon: "📋",
        examples: [
            {
                title: "示例标题",
                description: "示例说明",
                code: "代码内容",
                language: "javascript",
                runnable: true
            }
        ]
    },
    
    // 主内容
    topics: [
        // 各种topic...
    ],
    
    // 导航
    navigation: {
        prev: { title: "上一章", url: "..." },
        next: { title: "下一章", url: "..." }
    }
}
```

### topic 类型示例

#### 1. Concept - 概念讲解

```javascript
{
    type: "concept",
    title: "概念标题",
    content: {
        description: "概念描述文字",
        keyPoints: [
            "要点1",
            "要点2",
            "要点3"
        ],
        mdn: "https://developer.mozilla.org/..."  // 可选
    }
}
```

#### 2. Code Example - 代码示例

```javascript
{
    type: "code-example",
    title: "代码示例",
    content: {
        description: "示例说明",
        examples: [
            {
                title: "示例1",
                code: "const x = 1;",
                result: "1",           // 可选
                notes: "说明文字"       // 可选
            }
        ]
    }
}
```

#### 3. Live Code - 实时代码

```javascript
{
    type: "live-code",
    title: "在线编辑",
    content: {
        description: "实时编辑HTML/CSS/JS",
        html: "<div>Hello</div>",
        css: "div { color: red; }",
        js: "console.log('Hello');"
    }
}
```

#### 4. Quiz - 测验题

```javascript
{
    type: "quiz",
    title: "测验题目",
    content: {
        difficulty: "easy" | "medium" | "hard",
        tags: ["标签1", "标签2"],
        question: "问题内容",
        options: ["选项A", "选项B", "选项C", "选项D"],
        correctAnswer: 0,  // 正确答案索引
        explanation: {
            title: "答案解析",
            content: "解析内容",
            sections: [
                {
                    subtitle: "知识点",
                    text: "详细说明"
                },
                {
                    subtitle: "代码示例",
                    code: "示例代码"
                }
            ]
        }
    }
}
```

#### 5. Split View - 分屏对比

```javascript
{
    type: "split-view",
    title: "对比展示",
    content: {
        description: "左右对比说明",
        left: {
            title: "左侧标题",
            code: "左侧代码"
        },
        right: {
            title: "右侧标题",
            code: "右侧代码"
        }
    }
}
```

#### 6. Tab Content - 标签页

```javascript
{
    type: "tab-content",
    title: "多标签内容",
    content: {
        tabs: [
            {
                title: "Tab 1",
                icon: "📄",
                content: "<p>内容1</p>"
            },
            {
                title: "Tab 2",
                icon: "📊",
                content: "<p>内容2</p>"
            }
        ]
    }
}
```

## ⚙️ 配置选项

### 渲染器配置

```javascript
const config = {
    // 学科名称
    subject: 'vue',
    
    // 数据命名空间
    namespace: 'vueContentData',
    
    // 主题配置
    theme: {
        primary: '#42b883',
        secondary: '#35495e',
        icon: '💚'
    },
    
    // 功能开关
    features: {
        codeRunner: true,       // 代码运行
        livePreview: true,      // 实时预览
        copyCode: true,         // 复制代码
        syntaxHighlight: true   // 语法高亮
    },
    
    // 自定义类型
    customTypes: {
        'my-custom-type': function(topic) {
            return `<div>自定义渲染</div>`;
        }
    },
    
    // 生命周期钩子
    hooks: {
        beforeRender: function(data) {
            console.log('渲染前', data);
        },
        afterRender: function(data) {
            console.log('渲染后', data);
        },
        beforeTopicRender: function(topic) {
            console.log('topic渲染前', topic);
        },
        afterTopicRender: function(topic, html) {
            console.log('topic渲染后', topic, html);
        }
    }
};

const renderer = new UniversalRendererV2(config);
```

## 🎯 使用场景

### 场景1：内容学习

```javascript
// vue/data/content-01.js
window.vueContentData_01 = {
    section: {
        title: "Vue响应式原理",
        icon: "💚"
    },
    topics: [
        { type: "concept", ... },
        { type: "code-example", ... },
        { type: "live-code", ... },
        { type: "quiz", ... }
    ]
};
```

### 场景2：面试题集

```javascript
// vue/data/quiz-01.js
window.vueContentData_quiz_01 = {
    section: {
        title: "Vue面试题 - 响应式篇",
        icon: "📝",
        type: "quiz-collection"
    },
    topics: [
        { type: "quiz", ... },
        { type: "quiz-code", ... },
        { type: "quiz-multi", ... }
    ]
};
```

### 场景3：API文档

```javascript
// vue/data/api-ref.js
window.vueContentData_api_01 = {
    section: {
        title: "Vue API参考",
        icon: "📖"
    },
    topics: [
        { type: "component-demo", ... },
        { type: "props-table", ... },
        { type: "code-example", ... }
    ]
};
```

## 📖 完整示例

查看 `common/demo/` 目录下的示例：

- **renderer-showcase.html** - 效果展示页面
- **demo-content.html** - 完整功能演示
- **example-content-data.js** - 数据格式示例

在浏览器中打开这些文件查看实际效果！

## 🔧 扩展开发

### 添加自定义类型

```javascript
const config = {
    customTypes: {
        'video-demo': function(topic) {
            const { url, title } = topic.content;
            return `
                <div class="topic-section video-section">
                    <h2>${this.escape(title)}</h2>
                    <video src="${this.escape(url)}" controls></video>
                </div>
            `;
        }
    }
};
```

### 使用钩子

```javascript
const config = {
    hooks: {
        afterRender: function(data) {
            // 添加自定义交互
            document.querySelectorAll('.custom-element').forEach(el => {
                el.addEventListener('click', () => {
                    console.log('点击了自定义元素');
                });
            });
        }
    }
};
```

## 📝 注意事项

1. **数据命名规范**：数据变量名遵循 `{subject}ContentData_{chapter}` 格式
2. **HTML转义**：所有用户输入都会自动转义，防止XSS攻击
3. **代码运行安全**：live-code 使用 iframe sandbox 隔离运行环境
4. **样式优先级**：主题样式会覆盖基础样式的CSS变量

## 🎨 主题定制

创建自定义主题文件：

```css
/* my-theme.css */
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    --bg-gradient: linear-gradient(...);
}

.topic-section {
    border-left-color: var(--primary-color);
}
```

## 🆚 与旧渲染器对比

| 特性 | 旧HTML渲染器 | UniversalRendererV2 |
|------|------------|-------------------|
| 支持学科 | 仅HTML | HTML/CSS/Vue/React/... |
| 内容类型 | 10种 | 23+种 |
| 代码运行 | ❌ | ✅ |
| 侧边栏 | ❌ | ✅ |
| 测验题 | ❌ | ✅ (6种题型) |
| 主题系统 | ❌ | ✅ |
| 插件扩展 | ❌ | ✅ |

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Powered by UniversalRendererV2** 🚀
