// 第27章：资源加载优化 - 内容数据
window.htmlContentData_27 = {
    section: {
        title: "资源加载优化",
        icon: "📦"
    },
    topics: [
        {
            type: "concept",
            title: "资源加载策略",
            content: {
                description: "合理的资源加载策略可以显著提升页面性能。包括资源优先级、并行加载、按需加载、缓存策略等。",
                keyPoints: [
                    "关键资源优先加载",
                    "非关键资源延迟或按需加载",
                    "利用浏览器缓存",
                    "减少资源体积",
                    "使用CDN加速",
                    "HTTP/2多路复用"
                ]
            }
        },
        {
            type: "code-example",
            title: "资源提示（Resource Hints）",
            content: {
                description: "使用资源提示优化资源加载。",
                examples: [
                    {
                        title: "DNS预解析",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- DNS预解析 -->
    <link rel="dns-prefetch" href="https://cdn.example.com">
    <link rel="dns-prefetch" href="https://api.example.com">
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    
    <!-- 
    作用：提前解析域名
    时机：页面加载早期
    节省：DNS查询时间（20-120ms）
    适用：已知会使用的第三方域名
    -->
</head>
<body>
    <!-- 稍后会从这些域名加载资源 -->
    <img src="https://cdn.example.com/image.jpg" alt="图片">
</body>
</html>`,
                        notes: "DNS预解析节省域名查询时间"
                    },
                    {
                        title: "预连接",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 预连接（DNS + TCP + TLS） -->
    <link rel="preconnect" href="https://api.example.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- 
    包含：
    1. DNS解析
    2. TCP握手
    3. TLS协商（HTTPS）
    
    节省：200-500ms
    限制：最多6个并发连接
    适用：确定会使用的关键第三方资源
    -->
    
    <!-- dns-prefetch作为回退 -->
    <link rel="dns-prefetch" href="https://api.example.com">
</head>
<body>
    <script>
    // 稍后发起API请求
    fetch('https://api.example.com/data');
    </script>
</body>
</html>`,
                        notes: "预连接比DNS预解析更彻底"
                    },
                    {
                        title: "预加载（Preload）",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 预加载关键资源 -->
    
    <!-- 字体 -->
    <link rel="preload" 
          href="/fonts/main.woff2" 
          as="font" 
          type="font/woff2"
          crossorigin>
    
    <!-- 关键CSS -->
    <link rel="preload" 
          href="/css/critical.css" 
          as="style">
    
    <!-- 关键JavaScript -->
    <link rel="preload" 
          href="/js/app.js" 
          as="script">
    
    <!-- 图片 -->
    <link rel="preload" 
          href="/images/hero.jpg" 
          as="image">
    
    <!-- 
    as属性值：
    - font: 字体
    - style: CSS
    - script: JavaScript
    - image: 图片
    - fetch: XHR/Fetch
    - document: HTML文档
    - audio/video: 媒体
    -->
    
    <link rel="stylesheet" href="/css/critical.css">
</head>
<body>
    <img src="/images/hero.jpg" alt="Hero">
    <script src="/js/app.js"></script>
</body>
</html>`,
                        notes: "预加载提高关键资源优先级"
                    },
                    {
                        title: "预获取（Prefetch）",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 预获取下一页资源 -->
    <link rel="prefetch" href="/page2.html">
    <link rel="prefetch" href="/css/page2.css">
    <link rel="prefetch" href="/js/page2.js">
    <link rel="prefetch" href="/images/page2-hero.jpg">
    
    <!-- 
    特点：
    - 低优先级
    - 浏览器空闲时加载
    - 用于下一页可能需要的资源
    - 不阻塞当前页面
    -->
</head>
<body>
    <nav>
        <a href="/page2.html">下一页</a>
    </nav>
</body>
</html>`,
                        notes: "预获取提前加载下一页资源"
                    },
                    {
                        title: "预渲染",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 预渲染下一页 -->
    <link rel="prerender" href="/page2.html">
    
    <!-- 
    注意：
    - 在后台渲染整个页面
    - 消耗较多资源
    - 用户点击链接时立即显示
    - 谨慎使用（隐私、资源消耗）
    - Chrome已废弃，改用NoState Prefetch
    -->
</head>
<body>
    <a href="/page2.html">下一页（已预渲染）</a>
</body>
</html>

<!-- 推荐替代方案：prefetch -->
<link rel="prefetch" href="/page2.html">`,
                        notes: "预渲染消耗大，谨慎使用"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "脚本加载优化",
            content: {
                description: "优化JavaScript加载和执行。",
                examples: [
                    {
                        title: "defer和async",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>脚本加载</title>
    
    <!-- ❌ 同步脚本（阻塞HTML解析） -->
    <script src="/js/jquery.js"></script>
</head>
<body>
    <h1>内容</h1>
    
    <!-- ✅ defer：延迟执行 -->
    <script src="/js/app.js" defer></script>
    <script src="/js/utils.js" defer></script>
    <!-- 
    defer特点：
    - 不阻塞HTML解析
    - 按顺序执行
    - 在DOMContentLoaded前执行
    - 适合需要DOM的脚本
    -->
    
    <!-- ✅ async：异步执行 -->
    <script src="/js/analytics.js" async></script>
    <script src="/js/ads.js" async></script>
    <!-- 
    async特点：
    - 不阻塞HTML解析
    - 加载完立即执行
    - 执行顺序不确定
    - 适合独立的脚本（统计、广告）
    -->
</body>
</html>

<!-- defer vs async 对比 -->
<!--
            下载    执行    顺序    DOMContentLoaded
同步        阻塞    阻塞    保证    阻塞
defer       不阻塞  延迟    保证    前
async       不阻塞  立即    不保证  可能阻塞
-->`,
                        notes: "defer适合大多数脚本，async适合独立脚本"
                    },
                    {
                        title: "动态加载脚本",
                        code: `<!-- 按需加载脚本 -->
<script>
// 方式1：动态创建script标签
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 使用
loadScript('/js/chart.js').then(() => {
    // 图表库加载完成
    new Chart(ctx, config);
});

// 方式2：import()动态导入（ES模块）
button.addEventListener('click', async () => {
    const module = await import('/js/heavy-module.js');
    module.doSomething();
});

// 方式3：Intersection Observer懒加载
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadScript('/js/component.js');
            observer.unobserve(entry.target);
        }
    });
});

observer.observe(document.getElementById('component'));
</script>`,
                        notes: "按需加载减少初始加载时间"
                    },
                    {
                        title: "模块预加载",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- ES模块预加载 -->
    <link rel="modulepreload" href="/js/app.js">
    <link rel="modulepreload" href="/js/utils.js">
    
    <!-- 
    modulepreload特点：
    - 仅用于ES模块
    - 预加载模块及其依赖
    - 提高模块加载性能
    -->
</head>
<body>
    <script type="module" src="/js/app.js"></script>
</body>
</html>

<!-- ES模块示例 -->
<script type="module">
import { init } from '/js/app.js';
init();
</script>`,
                        notes: "modulepreload优化ES模块加载"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "CSS加载优化",
            content: {
                description: "优化CSS加载策略。",
                examples: [
                    {
                        title: "关键CSS内联",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- ✅ 内联关键CSS（首屏样式） -->
    <style>
        /* 关键样式 < 14KB */
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .header {
            background: #333;
            color: white;
            padding: 1rem;
        }
        .hero {
            min-height: 400px;
            background: linear-gradient(to bottom, #667eea, #764ba2);
        }
    </style>
    
    <!-- ✅ 异步加载非关键CSS -->
    <link rel="preload" 
          href="/css/main.css" 
          as="style" 
          onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="/css/main.css">
    </noscript>
</head>
<body>
    <header class="header">导航</header>
    <section class="hero">英雄区</section>
</body>
</html>`,
                        notes: "关键CSS内联，非关键CSS异步"
                    },
                    {
                        title: "媒体查询加载",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 根据媒体查询加载CSS -->
    <link rel="stylesheet" 
          href="/css/mobile.css" 
          media="(max-width: 767px)">
    
    <link rel="stylesheet" 
          href="/css/desktop.css" 
          media="(min-width: 768px)">
    
    <!-- 打印样式 -->
    <link rel="stylesheet" 
          href="/css/print.css" 
          media="print">
    
    <!-- 
    优点：
    - 只下载适用的样式
    - 减少不必要的下载
    - 提高加载速度
    -->
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>`,
                        notes: "媒体查询避免下载不需要的CSS"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "图片加载优化",
            content: {
                description: "优化图片资源加载。",
                examples: [
                    {
                        title: "响应式图片",
                        code: `<!-- 方式1：srcset和sizes -->
<img src="image-800.jpg"
     srcset="image-400.jpg 400w,
             image-800.jpg 800w,
             image-1200.jpg 1200w,
             image-1600.jpg 1600w"
     sizes="(max-width: 600px) 400px,
            (max-width: 1000px) 800px,
            (max-width: 1400px) 1200px,
            1600px"
     alt="响应式图片"
     loading="lazy">

<!-- 方式2：picture元素 -->
<picture>
    <!-- 移动端 -->
    <source media="(max-width: 767px)" 
            srcset="mobile.jpg">
    
    <!-- 平板 -->
    <source media="(max-width: 1023px)" 
            srcset="tablet.jpg">
    
    <!-- 桌面 -->
    <source media="(min-width: 1024px)" 
            srcset="desktop.jpg">
    
    <!-- 回退 -->
    <img src="desktop.jpg" alt="图片">
</picture>

<!-- 现代格式 -->
<picture>
    <source type="image/avif" srcset="image.avif">
    <source type="image/webp" srcset="image.webp">
    <img src="image.jpg" alt="图片">
</picture>`,
                        notes: "提供多种尺寸和格式"
                    },
                    {
                        title: "懒加载",
                        code: `<!-- 原生懒加载 -->
<img src="image1.jpg" loading="lazy" alt="图片1">
<img src="image2.jpg" loading="lazy" alt="图片2">

<!-- 首屏图片立即加载 -->
<img src="hero.jpg" loading="eager" alt="英雄图">

<!-- 自定义懒加载 -->
<img data-src="image.jpg" 
     src="placeholder.jpg" 
     class="lazy"
     alt="图片">

<script>
// Intersection Observer实现
const lazyImages = document.querySelectorAll('.lazy');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px' // 提前50px开始加载
});

lazyImages.forEach(img => imageObserver.observe(img));
</script>`,
                        notes: "非首屏图片使用懒加载"
                    },
                    {
                        title: "图片预加载",
                        code: `<!-- 预加载关键图片 -->
<link rel="preload" 
      href="/images/hero.jpg" 
      as="image">

<!-- 预加载响应式图片 -->
<link rel="preload" 
      href="/images/hero-800.jpg" 
      as="image"
      imagesrcset="hero-400.jpg 400w,
                   hero-800.jpg 800w,
                   hero-1200.jpg 1200w"
      imagesizes="(max-width: 600px) 400px, 800px">

<script>
// JavaScript预加载
function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

preloadImages([
    '/images/slide1.jpg',
    '/images/slide2.jpg',
    '/images/slide3.jpg'
]);
</script>`,
                        notes: "预加载轮播图等关键图片"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "资源缓存策略",
            content: {
                description: "利用缓存提升加载速度。",
                examples: [
                    {
                        title: "HTTP缓存头",
                        code: `<!-- 服务器端设置（示例） -->
<!--
静态资源（带版本号/hash）：
Cache-Control: public, max-age=31536000, immutable

HTML文档：
Cache-Control: no-cache

API响应：
Cache-Control: private, max-age=300

Cache-Control指令：
- public: 可被任何缓存
- private: 只能被浏览器缓存
- no-cache: 每次需验证
- no-store: 完全不缓存
- max-age: 缓存时间（秒）
- immutable: 资源不会改变
-->

<!-- 在HTML中使用版本号 -->
<link rel="stylesheet" href="/css/main.css?v=1.2.3">
<script src="/js/app.js?v=1.2.3"></script>

<!-- 或使用文件hash -->
<link rel="stylesheet" href="/css/main.a1b2c3d4.css">
<script src="/js/app.e5f6g7h8.js"></script>`,
                        notes: "合理设置缓存提升性能"
                    },
                    {
                        title: "Service Worker缓存",
                        code: `<!-- 注册Service Worker -->
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered', reg))
        .catch(err => console.log('SW error', err));
}
</script>

<!-- sw.js -->
<script>
// Service Worker缓存策略示例
const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/js/app.js',
    '/images/logo.png'
];

// 安装时缓存资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 拦截请求，优先使用缓存
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存命中则返回，否则请求网络
                return response || fetch(event.request);
            })
    );
});

// 更新缓存时清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
</script>`,
                        notes: "Service Worker实现离线缓存"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "资源加载最佳实践",
            content: {
                description: "优化资源加载的关键实践：",
                practices: [
                    {
                        title: "确定资源优先级",
                        description: "关键资源优先，非关键资源延后。",
                        example: `优先级排序：
1. 关键CSS（内联）
2. 首屏图片（preload）
3. 关键JavaScript（defer）
4. 字体（preload）
5. 非关键CSS（异步）
6. 非首屏图片（lazy）
7. 下一页资源（prefetch）`
                    },
                    {
                        title: "减小资源体积",
                        description: "压缩和优化资源。",
                        example: `1. 压缩CSS/JS（Minify）
2. 图片压缩（TinyPNG、ImageOptim）
3. 使用现代格式（WebP、AVIF）
4. 启用Gzip/Brotli
5. Tree Shaking移除未使用代码
6. Code Splitting按需加载`
                    },
                    {
                        title: "利用CDN",
                        description: "使用CDN加速全球访问。",
                        example: `1. 静态资源托管CDN
2. 选择就近节点
3. 启用HTTP/2
4. 设置合理缓存
5. DNS预解析CDN域名`
                    },
                    {
                        title: "监控和优化",
                        description: "持续监控和改进。",
                        example: `工具：
- Lighthouse
- WebPageTest
- Chrome DevTools
- Performance API
- Real User Monitoring (RUM)`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "资源加载检查清单",
            content: {
                description: "确保资源加载优化：",
                items: [
                    { id: "check27-1", text: "关键CSS内联" },
                    { id: "check27-2", text: "JavaScript使用defer" },
                    { id: "check27-3", text: "非首屏图片懒加载" },
                    { id: "check27-4", text: "预加载关键资源" },
                    { id: "check27-5", text: "DNS预解析第三方域名" },
                    { id: "check27-6", text: "使用响应式图片" },
                    { id: "check27-7", text: "使用现代图片格式" },
                    { id: "check27-8", text: "字体预加载并设置font-display" },
                    { id: "check27-9", text: "设置合理的缓存策略" },
                    { id: "check27-10", text: "启用HTTP/2" },
                    { id: "check27-11", text: "使用CDN" },
                    { id: "check27-12", text: "通过性能审计工具测试" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "性能优化", url: "content.html?chapter=26" },
        next: { title: "Web Components", url: "content.html?chapter=28" }
    }
};
