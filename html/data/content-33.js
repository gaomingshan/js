// 第33章：HTML最佳实践 - 内容数据
window.htmlContentData_33 = {
    section: {
        title: "HTML最佳实践",
        icon: "⭐"
    },
    topics: [
        {
            type: "concept",
            title: "HTML最佳实践概述",
            content: {
                description: "HTML最佳实践是经过验证的开发原则和模式，涵盖语义化、可访问性、性能、安全、SEO等多个方面，帮助开发者构建高质量的Web应用。",
                keyPoints: [
                    "编写语义化和结构化的HTML",
                    "确保可访问性（A11y）",
                    "优化性能和加载速度",
                    "实施安全最佳实践",
                    "优化SEO和搜索可见性",
                    "保持代码质量和可维护性"
                ]
            }
        },
        {
            type: "best-practice",
            title: "文档结构最佳实践",
            content: {
                description: "构建良好的HTML文档结构：",
                practices: [
                    {
                        title: "使用HTML5文档类型",
                        description: "始终使用简洁的HTML5 DOCTYPE。",
                        example: `<!-- ✅ HTML5 DOCTYPE -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
</head>
<body>
    <!-- 内容 -->
</body>
</html>

<!-- ❌ 旧的DOCTYPE -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">`
                    },
                    {
                        title: "声明字符编码",
                        description: "在head开头声明UTF-8编码。",
                        example: `<head>
    <!-- 必须在第一行 -->
    <meta charset="UTF-8">
    <title>页面标题</title>
</head>`
                    },
                    {
                        title: "设置viewport",
                        description: "为移动设备设置viewport。",
                        example: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
                    },
                    {
                        title: "使用语义化标签",
                        description: "使用有意义的HTML5语义化标签。",
                        example: `<!-- ✅ 语义化 -->
<header>
    <nav>导航</nav>
</header>
<main>
    <article>
        <h1>文章标题</h1>
        <section>内容</section>
    </article>
</main>
<footer>页脚</footer>

<!-- ❌ 过度使用div -->
<div class="header">
    <div class="nav">导航</div>
</div>
<div class="main">
    <div class="article">
        <div class="title">文章标题</div>
        <div class="content">内容</div>
    </div>
</div>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "可访问性最佳实践",
            content: {
                description: "确保所有用户都能访问内容：",
                practices: [
                    {
                        title: "提供替代文本",
                        description: "所有图片都要有alt属性。",
                        example: `<!-- ✅ 有意义的alt -->
<img src="logo.png" alt="公司Logo">
<img src="chart.png" alt="2024年销售数据柱状图">

<!-- 装饰性图片使用空alt -->
<img src="decoration.png" alt="">

<!-- ❌ 没有alt或无意义 -->
<img src="photo.jpg">
<img src="image.png" alt="image">`
                    },
                    {
                        title: "正确的标题层级",
                        description: "保持标题层级的逻辑顺序。",
                        example: `<!-- ✅ 正确的层级 -->
<h1>页面主标题</h1>
<section>
    <h2>第一部分</h2>
    <h3>小节</h3>
</section>
<section>
    <h2>第二部分</h2>
</section>

<!-- ❌ 跳级或顺序错误 -->
<h1>标题</h1>
<h3>跳过了h2</h3>
<h2>顺序错误</h2>`
                    },
                    {
                        title: "表单标签",
                        description: "每个表单控件都要有label。",
                        example: `<!-- ✅ 显式关联 -->
<label for="username">用户名：</label>
<input type="text" id="username" name="username">

<!-- ✅ 隐式关联 -->
<label>
    邮箱：
    <input type="email" name="email">
</label>

<!-- ❌ 没有label -->
<input type="text" placeholder="用户名">`
                    },
                    {
                        title: "键盘可访问",
                        description: "所有交互元素支持键盘操作。",
                        example: `<!-- ✅ 原生button -->
<button onclick="submit()">提交</button>

<!-- ✅ 自定义元素添加tabindex和键盘事件 -->
<div role="button" 
     tabindex="0"
     onclick="submit()"
     onkeydown="if(event.key==='Enter')submit()">
    提交
</div>

<!-- ❌ 不可键盘访问 -->
<div onclick="submit()">提交</div>`
                    },
                    {
                        title: "ARIA标签",
                        description: "适当使用ARIA增强可访问性。",
                        example: `<!-- 地标角色 -->
<nav aria-label="主导航">...</nav>
<nav aria-label="页脚导航">...</nav>

<!-- 状态和属性 -->
<button aria-expanded="false" aria-controls="menu">
    菜单
</button>

<!-- 实时区域 -->
<div role="status" aria-live="polite">
    操作成功
</div>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "性能最佳实践",
            content: {
                description: "优化页面性能：",
                practices: [
                    {
                        title: "优化资源加载",
                        description: "合理安排资源加载顺序。",
                        example: `<head>
    <!-- 关键CSS内联 -->
    <style>
        /* 首屏关键样式 */
        body { margin: 0; font-family: sans-serif; }
    </style>
    
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
    
    <!-- 非关键CSS异步加载 -->
    <link rel="preload" href="/css/main.css" as="style" 
          onload="this.onload=null;this.rel='stylesheet'">
</head>
<body>
    <!-- 内容 -->
    
    <!-- 脚本放底部或使用defer -->
    <script src="/js/app.js" defer></script>
</body>`
                    },
                    {
                        title: "图片优化",
                        description: "使用响应式图片和懒加载。",
                        example: `<!-- 响应式图片 -->
<img src="image-800.jpg"
     srcset="image-400.jpg 400w,
             image-800.jpg 800w,
             image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, 800px"
     alt="描述"
     width="800"
     height="600"
     loading="lazy">

<!-- 现代格式 -->
<picture>
    <source type="image/avif" srcset="image.avif">
    <source type="image/webp" srcset="image.webp">
    <img src="image.jpg" alt="描述">
</picture>`
                    },
                    {
                        title: "减少DOM大小",
                        description: "保持DOM结构简洁。",
                        example: `<!-- ✅ 扁平化结构 -->
<article class="card">
    <h2>标题</h2>
    <p>内容</p>
</article>

<!-- ❌ 过度嵌套 -->
<div class="wrapper">
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h2>标题</h2>
                        <p>内容</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "SEO最佳实践",
            content: {
                description: "优化搜索引擎可见性：",
                practices: [
                    {
                        title: "优化title和description",
                        description: "每个页面有唯一的title和description。",
                        example: `<head>
    <!-- 标题：50-60字符 -->
    <title>HTML5完全指南 - 从入门到精通 | 技术博客</title>
    
    <!-- 描述：150-160字符 -->
    <meta name="description" 
          content="详细介绍HTML5的各种特性、最佳实践和实战技巧，适合初学者和进阶开发者学习。">
</head>`
                    },
                    {
                        title: "使用语义化标签",
                        description: "帮助搜索引擎理解内容结构。",
                        example: `<article>
    <header>
        <h1>文章标题</h1>
        <time datetime="2024-01-15">2024年1月15日</time>
    </header>
    
    <section>
        <h2>第一部分</h2>
        <p>内容...</p>
    </section>
</article>`
                    },
                    {
                        title: "添加结构化数据",
                        description: "使用JSON-LD标记内容。",
                        example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "datePublished": "2024-01-15"
}
</script>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "安全最佳实践",
            content: {
                description: "保护应用安全：",
                practices: [
                    {
                        title: "防止XSS",
                        description: "转义用户输入，避免注入攻击。",
                        example: `<!-- ❌ 危险：直接输出 -->
<script>
    element.innerHTML = userInput;
</script>

<!-- ✅ 安全：使用textContent -->
<script>
    element.textContent = userInput;
</script>

<!-- ✅ 安全：转义HTML -->
<script>
    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[m]);
    }
</script>`
                    },
                    {
                        title: "安全的链接",
                        description: "外部链接添加安全属性。",
                        example: `<a href="https://example.com" 
   target="_blank"
   rel="noopener noreferrer">
    外部链接
</a>`
                    },
                    {
                        title: "实施CSP",
                        description: "使用Content Security Policy。",
                        example: `<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline';">`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "代码质量最佳实践",
            content: {
                description: "保持代码质量：",
                practices: [
                    {
                        title: "保持一致性",
                        description: "统一的代码风格和命名。",
                        example: `<!-- ✅ 一致的命名 -->
<div class="user-card">
    <h3 class="user-name">张三</h3>
    <p class="user-bio">简介</p>
</div>

<!-- ❌ 不一致 -->
<div class="UserCard">
    <h3 class="userName">张三</h3>
    <p class="user_bio">简介</p>
</div>`
                    },
                    {
                        title: "添加注释",
                        description: "为复杂部分添加注释。",
                        example: `<!-- 主导航栏 -->
<nav class="main-nav">
    <!-- ... -->
</nav>

<!-- 产品列表：支持无限滚动 -->
<div class="product-list" data-infinite-scroll>
    <!-- ... -->
</div>`
                    },
                    {
                        title: "验证HTML",
                        description: "使用验证工具检查HTML。",
                        example: `工具：
- W3C HTML Validator
- HTML Hint
- Lighthouse
- axe DevTools`
                    },
                    {
                        title: "避免内联样式和脚本",
                        description: "分离关注点。",
                        example: `<!-- ❌ 内联样式 -->
<div style="color: red; font-size: 20px;">内容</div>

<!-- ✅ 使用class -->
<div class="highlight">内容</div>

<style>
.highlight {
    color: red;
    font-size: 20px;
}
</style>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "HTML质量检查清单",
            content: {
                description: "确保HTML符合最佳实践：",
                items: [
                    { id: "check33-1", text: "使用HTML5 DOCTYPE" },
                    { id: "check33-2", text: "声明字符编码（UTF-8）" },
                    { id: "check33-3", text: "设置viewport meta标签" },
                    { id: "check33-4", text: "每页有唯一的title" },
                    { id: "check33-5", text: "使用语义化标签" },
                    { id: "check33-6", text: "标题层级正确" },
                    { id: "check33-7", text: "所有图片有alt属性" },
                    { id: "check33-8", text: "表单控件有label" },
                    { id: "check33-9", text: "支持键盘访问" },
                    { id: "check33-10", text: "外部链接有rel=\"noopener\"" },
                    { id: "check33-11", text: "实施CSP" },
                    { id: "check33-12", text: "图片指定宽高" },
                    { id: "check33-13", text: "使用loading=\"lazy\"" },
                    { id: "check33-14", text: "脚本使用defer" },
                    { id: "check33-15", text: "通过HTML验证" },
                    { id: "check33-16", text: "通过可访问性测试" },
                    { id: "check33-17", text: "通过Lighthouse审计" },
                    { id: "check33-18", text: "代码风格一致" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "Slots与组合", url: "content.html?chapter=32" },
        next: { title: "代码规范", url: "content.html?chapter=34" }
    }
};
