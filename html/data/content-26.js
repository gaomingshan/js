// 第26章：性能优化 - 内容数据
window.htmlContentData_26 = {
    section: {
        title: "性能优化",
        icon: "⚡"
    },
    topics: [
        {
            type: "concept",
            title: "Web性能优化概述",
            content: {
                description: "Web性能直接影响用户体验和SEO排名。优化HTML可以显著提升页面加载速度和渲染性能，包括减少DOM大小、优化关键渲染路径、延迟加载等。",
                keyPoints: [
                    "首次内容绘制（FCP）要快",
                    "最大内容绘制（LCP）在2.5秒内",
                    "累积布局偏移（CLS）要小",
                    "首次输入延迟（FID）要短",
                    "减少DOM深度和节点数量",
                    "优化关键渲染路径"
                ]
            }
        },
        {
            type: "code-example",
            title: "HTML结构优化",
            content: {
                description: "优化HTML结构提升性能。",
                examples: [
                    {
                        title: "减少DOM深度",
                        code: `<!-- ❌ 过深的DOM结构 -->
<div class="wrapper">
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <div class="content">
                            <p>内容</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ✅ 扁平化的DOM结构 -->
<div class="card">
    <p>内容</p>
</div>

<!-- 优化建议：
     - 避免不必要的嵌套
     - 使用CSS布局（Flexbox/Grid）减少容器
     - DOM深度保持在6层以内
     - 单页面DOM节点控制在1500以内
-->`,
                        notes: "DOM越深，渲染越慢"
                    },
                    {
                        title: "减少DOM节点",
                        code: `<!-- ❌ 过多的DOM节点 -->
<ul class="list">
    <li><span class="icon">•</span> 项目1</li>
    <li><span class="icon">•</span> 项目2</li>
    <!-- 1000+ 项 -->
</ul>

<!-- ✅ 虚拟滚动/分页 -->
<ul class="list">
    <!-- 只渲染可见的20项 -->
    <li>项目1</li>
    <li>项目2</li>
    <!-- ... -->
</ul>

<script>
// 虚拟滚动示例
class VirtualList {
    constructor(container, items, itemHeight) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
        this.render();
        
        container.addEventListener('scroll', () => this.render());
    }
    
    render() {
        const scrollTop = this.container.scrollTop;
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = startIndex + this.visibleCount;
        
        // 只渲染可见项
        const visibleItems = this.items.slice(startIndex, endIndex);
        this.container.innerHTML = visibleItems.map((item, i) => 
            \`<li style="position:absolute;top:\${(startIndex + i) * this.itemHeight}px">\${item}</li>\`
        ).join('');
        
        // 设置容器高度
        this.container.style.height = this.items.length * this.itemHeight + 'px';
    }
}
</script>`,
                        notes: "大量数据使用虚拟滚动或分页"
                    },
                    {
                        title: "语义化标签性能",
                        code: `<!-- ✅ 语义化标签（推荐） -->
<article>
    <header>
        <h1>标题</h1>
    </header>
    <section>
        <p>内容</p>
    </section>
</article>

<!-- ❌ 过度使用div -->
<div class="article">
    <div class="header">
        <div class="title">标题</div>
    </div>
    <div class="section">
        <div class="text">内容</div>
    </div>
</div>

<!-- 注意：
     - 语义化标签不会影响性能
     - 但过度嵌套会影响性能
     - 使用合适的标签，避免多余容器
-->`,
                        notes: "语义化标签本身不影响性能"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "关键渲染路径优化",
            content: {
                description: "优化关键渲染路径，加快首屏显示。",
                examples: [
                    {
                        title: "CSS优化",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>性能优化示例</title>
    
    <!-- ✅ 关键CSS内联 -->
    <style>
        /* 首屏关键样式 */
        body { margin: 0; font-family: sans-serif; }
        .header { background: #333; color: white; padding: 1rem; }
        .hero { min-height: 400px; }
    </style>
    
    <!-- ✅ 非关键CSS异步加载 -->
    <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
    
    <!-- ❌ 阻塞渲染的CSS -->
    <!-- <link rel="stylesheet" href="/css/all.css"> -->
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>`,
                        notes: "关键CSS内联，非关键CSS异步加载"
                    },
                    {
                        title: "JavaScript优化",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>JavaScript加载优化</title>
</head>
<body>
    <!-- 页面内容 -->
    
    <!-- ✅ 脚本放在body底部 -->
    <script src="/js/main.js"></script>
    
    <!-- ✅ 使用defer（推荐） -->
    <script src="/js/app.js" defer></script>
    
    <!-- ✅ 使用async（不依赖DOM） -->
    <script src="/js/analytics.js" async></script>
    
    <!-- defer vs async：
         defer: 按顺序执行，DOMContentLoaded前
         async: 加载完立即执行，顺序不保证
    -->
</body>
</html>

<!-- ❌ 头部同步脚本（阻塞渲染） -->
<!--
<head>
    <script src="/js/jquery.js"></script>
</head>
-->`,
                        notes: "脚本使用defer或放在底部"
                    },
                    {
                        title: "预加载和预连接",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- DNS预解析 -->
    <link rel="dns-prefetch" href="https://cdn.example.com">
    
    <!-- 预连接（DNS + TCP + TLS） -->
    <link rel="preconnect" href="https://api.example.com">
    
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/images/hero.jpg" as="image">
    
    <!-- 预获取下一页资源 -->
    <link rel="prefetch" href="/page2.html">
    <link rel="prefetch" href="/images/page2-hero.jpg">
    
    <!-- 预渲染下一页 -->
    <link rel="prerender" href="/page2.html">
</head>
<body>
    <img src="/images/hero.jpg" alt="Hero">
</body>
</html>`,
                        notes: "使用资源提示优化加载"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "图片优化",
            content: {
                description: "优化图片加载提升性能。",
                examples: [
                    {
                        title: "响应式图片",
                        code: `<!-- ✅ 使用srcset提供多尺寸 -->
<img src="image-800.jpg"
     srcset="image-400.jpg 400w,
             image-800.jpg 800w,
             image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px,
            (max-width: 1000px) 800px,
            1200px"
     alt="响应式图片"
     width="800"
     height="600">

<!-- ✅ picture元素 -->
<picture>
    <!-- WebP格式（现代浏览器） -->
    <source type="image/webp" 
            srcset="image.webp">
    
    <!-- AVIF格式（更新的浏览器） -->
    <source type="image/avif" 
            srcset="image.avif">
    
    <!-- 回退到JPEG -->
    <img src="image.jpg" alt="图片">
</picture>`,
                        notes: "使用现代图片格式和响应式图片"
                    },
                    {
                        title: "延迟加载",
                        code: `<!-- ✅ 原生延迟加载 -->
<img src="image.jpg" 
     alt="延迟加载的图片"
     loading="lazy"
     width="800"
     height="600">

<!-- ✅ iframe延迟加载 -->
<iframe src="https://example.com" 
        loading="lazy"
        width="800"
        height="600">
</iframe>

<!-- 首屏图片立即加载 -->
<img src="hero.jpg" 
     alt="英雄图"
     loading="eager"
     width="1200"
     height="800">

<script>
// 检查浏览器支持
if ('loading' in HTMLImageElement.prototype) {
    // 支持原生延迟加载
} else {
    // 回退到Intersection Observer
    const images = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => observer.observe(img));
}
</script>`,
                        notes: "非首屏图片使用loading=lazy"
                    },
                    {
                        title: "指定图片尺寸",
                        code: `<!-- ✅ 指定width和height -->
<img src="image.jpg" 
     alt="图片"
     width="800"
     height="600">

<!-- ❌ 不指定尺寸 -->
<img src="image.jpg" alt="图片">

<!-- 为什么重要：
     1. 避免布局偏移（CLS）
     2. 浏览器预留空间
     3. 提升Core Web Vitals
-->

<style>
/* CSS保持宽高比 */
img {
    max-width: 100%;
    height: auto;
}
</style>`,
                        notes: "始终指定图片宽高避免布局偏移"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "字体优化",
            content: {
                description: "优化Web字体加载。",
                examples: [
                    {
                        title: "字体加载策略",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- ✅ 预加载关键字体 -->
    <link rel="preload" 
          href="/fonts/main.woff2" 
          as="font" 
          type="font/woff2"
          crossorigin>
    
    <style>
        @font-face {
            font-family: 'CustomFont';
            src: url('/fonts/main.woff2') format('woff2'),
                 url('/fonts/main.woff') format('woff');
            /* font-display控制显示策略 */
            font-display: swap;
            /* 
             - auto: 浏览器默认
             - block: 短暂隐藏文本（最多3秒）
             - swap: 立即显示备用字体（推荐）
             - fallback: 100ms隐藏，3秒内切换
             - optional: 100ms隐藏，之后不切换
            */
        }
        
        body {
            font-family: 'CustomFont', -apple-system, BlinkMacSystemFont, 
                         'Segoe UI', sans-serif;
        }
    </style>
</head>
<body>
    <h1>字体优化示例</h1>
</body>
</html>`,
                        notes: "使用font-display: swap避免FOIT"
                    },
                    {
                        title: "字体子集化",
                        code: `@font-face {
    font-family: 'CustomFont';
    src: url('/fonts/main-subset.woff2') format('woff2');
    /* 只包含中文常用字 */
    unicode-range: U+4E00-9FFF;
    font-display: swap;
}

@font-face {
    font-family: 'CustomFont';
    src: url('/fonts/latin.woff2') format('woff2');
    /* 拉丁字符 */
    unicode-range: U+0000-00FF;
    font-display: swap;
}

<!-- 优化建议：
     1. 只加载需要的字符
     2. 使用WOFF2格式（最佳压缩）
     3. 限制字体变体数量
     4. 考虑使用系统字体
-->`,
                        notes: "字体子集化减小文件大小"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "减少重排和重绘",
            content: {
                description: "优化DOM操作减少重排重绘。",
                examples: [
                    {
                        title: "批量DOM操作",
                        code: `// ❌ 多次重排
for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    document.body.appendChild(div);
    // 每次都触发重排
}

// ✅ 使用DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    fragment.appendChild(div);
}
document.body.appendChild(fragment);
// 只触发一次重排

// ✅ 使用innerHTML（适合简单内容）
const html = Array.from({length: 1000}, (_, i) => 
    \`<div>\${i}</div>\`
).join('');
document.body.innerHTML = html;`,
                        notes: "批量操作减少重排次数"
                    },
                    {
                        title: "避免强制同步布局",
                        code: `// ❌ 强制同步布局（布局抖动）
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
    box.style.width = box.offsetWidth + 10 + 'px';
    // 读取offsetWidth强制布局
    // 写入width
    // 再次强制布局...
});

// ✅ 先读取，再写入
const boxes = document.querySelectorAll('.box');
const widths = Array.from(boxes).map(box => box.offsetWidth);
boxes.forEach((box, i) => {
    box.style.width = widths[i] + 10 + 'px';
});

// ✅ 使用requestAnimationFrame
function updateLayout() {
    // 读取
    const width = element.offsetWidth;
    
    // 写入
    requestAnimationFrame(() => {
        element.style.width = width + 10 + 'px';
    });
}`,
                        notes: "避免读写交错导致的布局抖动"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "性能优化最佳实践",
            content: {
                description: "提升Web性能的关键实践：",
                practices: [
                    {
                        title: "优化首屏加载",
                        description: "关键内容优先加载。",
                        example: `1. 内联关键CSS
2. 延迟加载非关键资源
3. 首屏图片eager，其他lazy
4. 脚本使用defer
5. 减少首屏DOM节点`
                    },
                    {
                        title: "减少HTTP请求",
                        description: "合并和压缩资源。",
                        example: `1. 合并CSS和JavaScript文件
2. 使用CSS Sprites（小图标）
3. 使用SVG替代图片
4. 启用HTTP/2多路复用
5. 使用CDN`
                    },
                    {
                        title: "启用缓存",
                        description: "合理设置缓存策略。",
                        example: `<!-- Service Worker -->
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
</script>`
                    },
                    {
                        title: "监控性能",
                        description: "使用工具监控和优化。",
                        example: `// Performance API
const navigation = performance.getEntriesByType('navigation')[0];
console.log('DOMContentLoaded:', navigation.domContentLoadedEventEnd);
console.log('Load:', navigation.loadEventEnd);

// Core Web Vitals
// - LCP: Largest Contentful Paint
// - FID: First Input Delay  
// - CLS: Cumulative Layout Shift`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "性能优化检查清单",
            content: {
                description: "确保页面性能优化：",
                items: [
                    { id: "check26-1", text: "DOM深度小于6层" },
                    { id: "check26-2", text: "单页面DOM节点少于1500个" },
                    { id: "check26-3", text: "关键CSS内联" },
                    { id: "check26-4", text: "JavaScript使用defer或放底部" },
                    { id: "check26-5", text: "图片指定width和height" },
                    { id: "check26-6", text: "非首屏图片使用loading=lazy" },
                    { id: "check26-7", text: "使用现代图片格式（WebP/AVIF）" },
                    { id: "check26-8", text: "字体使用font-display: swap" },
                    { id: "check26-9", text: "预加载关键资源" },
                    { id: "check26-10", text: "LCP在2.5秒内" },
                    { id: "check26-11", text: "CLS小于0.1" },
                    { id: "check26-12", text: "通过Lighthouse性能审计" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "CSRF防护", url: "content.html?chapter=25" },
        next: { title: "资源加载优化", url: "content.html?chapter=27" }
    }
};
