// 第34章：代码规范 - 内容数据
window.htmlContentData_34 = {
    section: {
        title: "代码规范",
        icon: "📏"
    },
    topics: [
        {
            type: "concept",
            title: "代码规范的重要性",
            content: {
                description: "统一的代码规范提高代码可读性、可维护性和团队协作效率。良好的规范能减少bug、提升开发效率、降低维护成本。",
                keyPoints: [
                    "提高代码可读性",
                    "便于团队协作",
                    "减少代码审查时间",
                    "降低维护成本",
                    "避免常见错误",
                    "提升代码质量"
                ]
            }
        },
        {
            type: "best-practice",
            title: "文档结构规范",
            content: {
                description: "标准的HTML文档结构：",
                practices: [
                    {
                        title: "文档声明",
                        description: "使用HTML5 DOCTYPE。",
                        example: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
</head>
<body>
    <!-- 内容 -->
</body>
</html>`
                    },
                    {
                        title: "缩进和格式",
                        description: "使用一致的缩进（2或4个空格）。",
                        example: `<!-- ✅ 一致的缩进 -->
<nav>
    <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
    </ul>
</nav>

<!-- ❌ 不一致的缩进 -->
<nav>
  <ul>
      <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>`
                    },
                    {
                        title: "每行一个元素",
                        description: "块级元素独占一行。",
                        example: `<!-- ✅ 清晰的结构 -->
<div class="card">
    <h3>标题</h3>
    <p>内容</p>
</div>

<!-- ⚠️ 可接受：简单的内联元素 -->
<p>这是<strong>重要</strong>的内容。</p>

<!-- ❌ 难以阅读 -->
<div class="card"><h3>标题</h3><p>内容</p></div>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "命名规范",
            content: {
                description: "统一的命名约定：",
                practices: [
                    {
                        title: "class命名",
                        description: "使用kebab-case（短横线）命名。",
                        example: `<!-- ✅ kebab-case -->
<div class="user-card">
    <h3 class="user-name">张三</h3>
    <p class="user-bio">简介</p>
</div>

<!-- ❌ 其他格式 -->
<div class="UserCard">        <!-- PascalCase -->
<div class="userCard">        <!-- camelCase -->
<div class="user_card">       <!-- snake_case -->`
                    },
                    {
                        title: "ID命名",
                        description: "使用有意义的唯一ID。",
                        example: `<!-- ✅ 有意义的ID -->
<header id="main-header">...</header>
<nav id="primary-nav">...</nav>
<form id="contact-form">...</form>

<!-- ❌ 无意义的ID -->
<div id="div1">...</div>
<div id="content">...</div>
<div id="box">...</div>`
                    },
                    {
                        title: "BEM命名方法",
                        description: "Block__Element--Modifier模式。",
                        example: `<!-- BEM命名示例 -->
<div class="card">                    <!-- Block -->
    <div class="card__header">        <!-- Element -->
        <h3 class="card__title">标题</h3>
    </div>
    <div class="card__body">
        <p class="card__text">内容</p>
    </div>
    <div class="card__footer">
        <button class="card__button card__button--primary">
            确定
        </button>
    </div>
</div>

<!-- 
Block: 独立的组件
Element: 组件的组成部分（__）
Modifier: 变体或状态（--）
-->`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "属性规范",
            content: {
                description: "属性的书写规范：",
                practices: [
                    {
                        title: "属性顺序",
                        description: "按照逻辑顺序排列属性。",
                        example: `<!-- 推荐的属性顺序：
     1. class
     2. id, name
     3. data-*
     4. src, for, type, href, value
     5. title, alt
     6. role, aria-*
     7. disabled, checked, selected
-->

<input 
    class="form-control"
    id="username"
    name="username"
    type="text"
    value=""
    placeholder="请输入用户名"
    aria-label="用户名"
    required>`
                    },
                    {
                        title: "布尔属性",
                        description: "省略布尔属性的值。",
                        example: `<!-- ✅ 简洁写法 -->
<input type="checkbox" checked>
<button disabled>提交</button>
<script async src="app.js"></script>

<!-- ❌ 冗余写法 -->
<input type="checkbox" checked="checked">
<button disabled="disabled">提交</button>`
                    },
                    {
                        title: "引号使用",
                        description: "属性值统一使用双引号。",
                        example: `<!-- ✅ 双引号 -->
<a href="/about" class="nav-link">关于</a>

<!-- ❌ 单引号或无引号 -->
<a href='/about' class='nav-link'>关于</a>
<a href=/about class=nav-link>关于</a>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "注释规范",
            content: {
                description: "清晰的注释提高可维护性：",
                practices: [
                    {
                        title: "区块注释",
                        description: "为主要区块添加注释。",
                        example: `<!-- ========== Header ========== -->
<header class="site-header">
    <!-- Logo -->
    <div class="logo">...</div>
    
    <!-- Navigation -->
    <nav class="main-nav">...</nav>
</header>

<!-- ========== Main Content ========== -->
<main class="content">
    <!-- ... -->
</main>

<!-- ========== Footer ========== -->
<footer class="site-footer">
    <!-- ... -->
</footer>`
                    },
                    {
                        title: "TODO注释",
                        description: "标记待办事项。",
                        example: `<!-- TODO: 添加搜索功能 -->
<div class="search-placeholder"></div>

<!-- FIXME: 修复IE11兼容性问题 -->
<div class="legacy-component">...</div>

<!-- NOTE: 这个组件需要jQuery -->
<script src="jquery.js"></script>`
                    },
                    {
                        title: "结束标签注释",
                        description: "为长代码块的结束标签添加注释。",
                        example: `<div class="complex-component">
    <!-- 很多嵌套内容 -->
    <div class="level-1">
        <div class="level-2">
            <div class="level-3">
                <!-- ... -->
            </div><!-- /.level-3 -->
        </div><!-- /.level-2 -->
    </div><!-- /.level-1 -->
</div><!-- /.complex-component -->`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "性能规范",
            content: {
                description: "性能相关的编码规范：",
                practices: [
                    {
                        title: "资源加载",
                        description: "优化资源加载顺序。",
                        example: `<head>
    <!-- 1. 关键CSS内联 -->
    <style>
        /* 首屏样式 */
    </style>
    
    <!-- 2. 预加载关键资源 -->
    <link rel="preload" href="font.woff2" as="font" crossorigin>
    
    <!-- 3. 异步加载非关键CSS -->
    <link rel="preload" href="main.css" as="style" 
          onload="this.rel='stylesheet'">
</head>
<body>
    <!-- 内容 -->
    
    <!-- 4. 脚本放底部或使用defer -->
    <script src="app.js" defer></script>
</body>`
                    },
                    {
                        title: "图片优化",
                        description: "始终指定图片尺寸。",
                        example: `<!-- ✅ 指定宽高，避免布局偏移 -->
<img src="photo.jpg" 
     alt="描述" 
     width="800" 
     height="600"
     loading="lazy">

<!-- ❌ 未指定尺寸 -->
<img src="photo.jpg" alt="描述">`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "可访问性规范",
            content: {
                description: "确保可访问性的编码规范：",
                practices: [
                    {
                        title: "语义化标签",
                        description: "优先使用语义化标签。",
                        example: `<!-- ✅ 语义化 -->
<nav>
    <ul>
        <li><a href="/">首页</a></li>
    </ul>
</nav>

<!-- ❌ 无语义 -->
<div class="nav">
    <div class="list">
        <div class="item">
            <a href="/">首页</a>
        </div>
    </div>
</div>`
                    },
                    {
                        title: "ARIA使用",
                        description: "适当使用ARIA增强可访问性。",
                        example: `<!-- 地标角色 -->
<nav aria-label="主导航">...</nav>

<!-- 状态 -->
<button aria-expanded="false" aria-controls="menu">
    菜单
</button>

<!-- 实时区域 -->
<div role="status" aria-live="polite">
    加载中...
</div>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "团队协作规范",
            content: {
                description: "团队开发的规范约定：",
                practices: [
                    {
                        title: "使用EditorConfig",
                        description: "统一编辑器配置。",
                        example: `# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.html]
indent_size = 2

[*.md]
trim_trailing_whitespace = false`
                    },
                    {
                        title: "使用Prettier",
                        description: "自动格式化代码。",
                        example: `// .prettierrc
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "htmlWhitespaceSensitivity": "css"
}`
                    },
                    {
                        title: "使用HTMLHint",
                        description: "代码检查工具。",
                        example: `// .htmlhintrc
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true,
  "title-require": true
}`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "代码规范检查清单",
            content: {
                description: "确保代码符合规范：",
                items: [
                    { id: "check34-1", text: "使用HTML5 DOCTYPE" },
                    { id: "check34-2", text: "一致的缩进（2或4空格）" },
                    { id: "check34-3", text: "class使用kebab-case命名" },
                    { id: "check34-4", text: "属性值使用双引号" },
                    { id: "check34-5", text: "布尔属性省略值" },
                    { id: "check34-6", text: "属性按推荐顺序排列" },
                    { id: "check34-7", text: "为主要区块添加注释" },
                    { id: "check34-8", text: "图片指定宽高" },
                    { id: "check34-9", text: "使用语义化标签" },
                    { id: "check34-10", text: "配置EditorConfig" },
                    { id: "check34-11", text: "配置Prettier" },
                    { id: "check34-12", text: "配置HTMLHint" },
                    { id: "check34-13", text: "通过代码检查" },
                    { id: "check34-14", text: "代码审查通过" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "HTML最佳实践", url: "content.html?chapter=33" },
        next: { title: "测试与验证", url: "content.html?chapter=35" }
    }
};
