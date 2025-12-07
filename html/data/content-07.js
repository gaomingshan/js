// 第7章：图片处理 - 内容数据
window.htmlContentData_07 = {
    section: {
        title: "图片处理",
        icon: "🖼️"
    },
    topics: [
        {
            type: "concept",
            title: "<img>标签基础",
            content: {
                description: "<img>标签用于在HTML页面中嵌入图片。它是一个空元素（自闭合标签），通过src属性指定图片源，通过alt属性提供替代文本。",
                keyPoints: [
                    "img是替换元素，内容来自外部资源",
                    "src属性指定图片的URL（必需）",
                    "alt属性提供替代文本（强烈推荐）",
                    "width和height可以指定尺寸",
                    "图片默认是行内块元素（inline-block）",
                    "支持多种图片格式：JPG、PNG、GIF、SVG、WebP等"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img"
            }
        },
        {
            type: "code-example",
            title: "img标签的基本用法",
            content: {
                description: "学习img标签的基础使用方法和常用属性。",
                examples: [
                    {
                        title: "基本图片",
                        code: `<!-- 基本用法 -->
<img src="photo.jpg" alt="风景照片">

<!-- 指定尺寸 -->
<img src="logo.png" 
     alt="公司Logo" 
     width="200" 
     height="100">

<!-- 相对路径 -->
<img src="images/banner.jpg" alt="横幅图片">
<img src="../assets/icon.png" alt="图标">

<!-- 绝对路径 -->
<img src="/static/images/hero.jpg" alt="主图">

<!-- 外部URL -->
<img src="https://example.com/image.jpg" alt="外部图片">`,
                        notes: "src和alt是最重要的属性"
                    },
                    {
                        title: "alt属性的重要性",
                        code: `<!-- ✅ 好：描述性的alt文本 -->
<img src="sunset.jpg" alt="海边的日落景色">
<img src="product.jpg" alt="红色运动鞋，耐克品牌">
<img src="chart.jpg" alt="2024年销售增长图表">

<!-- ⚠️ 装饰性图片：空alt -->
<img src="decorative-line.png" alt="">

<!-- ❌ 不好：无alt或无意义的alt -->
<img src="photo.jpg">
<img src="photo.jpg" alt="图片">
<img src="photo.jpg" alt="image">

<!-- 链接中的图片 -->
<a href="products.html">
    <img src="shop-icon.png" alt="查看所有产品">
</a>`,
                        notes: "alt文本对可访问性和SEO都很重要"
                    },
                    {
                        title: "width和height属性",
                        code: `<!-- 指定尺寸避免布局偏移 -->
<img src="banner.jpg" 
     alt="横幅" 
     width="1200" 
     height="400">

<!-- 保持纵横比 -->
<img src="photo.jpg" 
     alt="照片" 
     width="300"
     style="height: auto;">

<!-- CSS控制尺寸 -->
<img src="avatar.jpg" 
     alt="用户头像"
     style="width: 100px; height: 100px; object-fit: cover;">

<!-- 响应式图片 -->
<img src="image.jpg" 
     alt="响应式图片"
     style="max-width: 100%; height: auto;">`,
                        notes: "设置width和height可以避免CLS（累积布局偏移）"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "图片格式选择",
            content: {
                description: "不同的图片格式适用于不同的场景，正确选择格式可以优化性能和质量。",
                examples: [
                    {
                        title: "常见图片格式对比",
                        code: `<!-- JPEG/JPG - 照片、复杂图像 -->
<img src="photo.jpg" alt="风景照片">
<!-- 优点：文件小，适合照片
     缺点：有损压缩，不支持透明 -->

<!-- PNG - 需要透明背景的图片 -->
<img src="logo.png" alt="Logo">
<!-- 优点：无损压缩，支持透明
     缺点：文件较大 -->

<!-- GIF - 简单动画 -->
<img src="loading.gif" alt="加载中">
<!-- 优点：支持动画
     缺点：最多256色，文件可能很大 -->

<!-- WebP - 现代浏览器推荐 -->
<img src="image.webp" alt="WebP图片">
<!-- 优点：压缩率高，支持透明和动画
     缺点：旧浏览器不支持 -->

<!-- SVG - 矢量图形 -->
<img src="icon.svg" alt="图标">
<!-- 优点：可无限缩放，文件小
     缺点：不适合复杂图像 -->

<!-- AVIF - 下一代格式 -->
<img src="image.avif" alt="AVIF图片">
<!-- 优点：压缩率极高
     缺点：浏览器支持有限 -->`,
                        notes: "根据内容类型选择合适的格式"
                    },
                    {
                        title: "图片格式使用建议",
                        code: `<!-- 照片 → JPEG/WebP -->
<img src="landscape.jpg" alt="风景">

<!-- Logo/图标 → SVG/PNG -->
<img src="logo.svg" alt="Logo">

<!-- 截图/图表 → PNG -->
<img src="screenshot.png" alt="界面截图">

<!-- 简单动画 → GIF/WebP -->
<img src="loading.gif" alt="加载动画">

<!-- 需要透明 → PNG/WebP -->
<img src="transparent-icon.png" alt="透明图标">`,
                        notes: "选择格式要平衡质量和文件大小"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "响应式图片 - srcset和sizes",
            content: {
                description: "响应式图片技术允许浏览器根据设备特性选择最合适的图片。",
                examples: [
                    {
                        title: "srcset - 像素密度描述符",
                        code: `<!-- 为不同像素密度提供不同图片 -->
<img src="image.jpg"
     srcset="image.jpg 1x,
             image@2x.jpg 2x,
             image@3x.jpg 3x"
     alt="响应式图片">

<!-- 实际示例 -->
<img src="logo-200.png"
     srcset="logo-200.png 1x,
             logo-400.png 2x"
     alt="Logo"
     width="200"
     height="100">`,
                        notes: "1x用于普通屏幕，2x用于Retina屏幕"
                    },
                    {
                        title: "srcset - 宽度描述符",
                        code: `<!-- 为不同视口宽度提供不同尺寸的图片 -->
<img src="image-800.jpg"
     srcset="image-400.jpg 400w,
             image-800.jpg 800w,
             image-1200.jpg 1200w,
             image-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw,
            (max-width: 1200px) 50vw,
            800px"
     alt="响应式图片">

<!-- 解释：
     srcset: 提供不同宽度的图片
     sizes: 告诉浏览器在不同条件下图片的显示宽度
     - 视口≤600px时，图片占100%视口宽度
     - 视口≤1200px时，图片占50%视口宽度
     - 其他情况，图片宽度为800px
-->`,
                        notes: "浏览器会根据sizes选择最合适的图片"
                    },
                    {
                        title: "实际应用示例",
                        code: `<!-- 文章配图 -->
<img src="article-800.jpg"
     srcset="article-400.jpg 400w,
             article-800.jpg 800w,
             article-1200.jpg 1200w"
     sizes="(max-width: 768px) 100vw,
            (max-width: 1024px) 70vw,
            800px"
     alt="文章配图">

<!-- 产品缩略图 -->
<img src="product-thumb.jpg"
     srcset="product-thumb.jpg 300w,
             product-medium.jpg 600w,
             product-large.jpg 1200w"
     sizes="(max-width: 768px) 50vw,
            (max-width: 1200px) 33vw,
            300px"
     alt="产品图片">`,
                        notes: "根据实际布局调整sizes值"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<picture>元素 - 艺术方向",
            content: {
                description: "<picture>元素提供了更灵活的响应式图片解决方案，支持不同图片格式和艺术方向。",
                examples: [
                    {
                        title: "艺术方向 - 不同布局用不同图片",
                        code: `<!-- 移动端竖图，桌面端横图 -->
<picture>
    <source media="(max-width: 768px)" 
            srcset="hero-mobile.jpg">
    <source media="(min-width: 769px)" 
            srcset="hero-desktop.jpg">
    <img src="hero-desktop.jpg" alt="主图">
</picture>

<!-- 根据视口大小裁剪不同部分 -->
<picture>
    <!-- 移动端：特写 -->
    <source media="(max-width: 600px)"
            srcset="portrait-closeup.jpg">
    <!-- 平板：中景 -->
    <source media="(max-width: 1024px)"
            srcset="portrait-medium.jpg">
    <!-- 桌面：全景 -->
    <source media="(min-width: 1025px)"
            srcset="portrait-wide.jpg">
    <img src="portrait-wide.jpg" alt="人物照片">
</picture>`,
                        notes: "艺术方向允许为不同设备提供不同构图的图片"
                    },
                    {
                        title: "现代图片格式回退",
                        code: `<!-- 优先使用现代格式，提供回退 -->
<picture>
    <!-- AVIF - 最新最优 -->
    <source srcset="image.avif" type="image/avif">
    <!-- WebP - 次优选择 -->
    <source srcset="image.webp" type="image/webp">
    <!-- JPEG - 兼容回退 -->
    <img src="image.jpg" alt="图片">
</picture>

<!-- 多种格式 + 响应式 -->
<picture>
    <source srcset="image-400.avif 400w,
                    image-800.avif 800w"
            type="image/avif"
            sizes="(max-width: 600px) 100vw, 800px">
    <source srcset="image-400.webp 400w,
                    image-800.webp 800w"
            type="image/webp"
            sizes="(max-width: 600px) 100vw, 800px">
    <img src="image-800.jpg" alt="图片"
         srcset="image-400.jpg 400w,
                 image-800.jpg 800w"
         sizes="(max-width: 600px) 100vw, 800px">
</picture>`,
                        notes: "浏览器会选择支持的第一个格式"
                    },
                    {
                        title: "深色模式适配",
                        code: `<!-- 根据主题切换图片 -->
<picture>
    <source srcset="logo-dark.svg"
            media="(prefers-color-scheme: dark)">
    <source srcset="logo-light.svg"
            media="(prefers-color-scheme: light)">
    <img src="logo-light.svg" alt="Logo">
</picture>

<!-- 实际应用 -->
<picture>
    <source srcset="hero-dark.jpg"
            media="(prefers-color-scheme: dark)">
    <img src="hero-light.jpg" alt="主图">
</picture>`,
                        notes: "根据用户系统主题偏好选择图片"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "图片加载优化",
            content: {
                description: "优化图片加载可以显著提升页面性能和用户体验。",
                examples: [
                    {
                        title: "懒加载 - loading属性",
                        code: `<!-- 原生懒加载（推荐） -->
<img src="image.jpg" 
     alt="图片" 
     loading="lazy">

<!-- 立即加载（默认） -->
<img src="hero.jpg" 
     alt="主图" 
     loading="eager">

<!-- 实际应用 -->
<!-- 首屏图片 -->
<img src="above-fold.jpg" alt="首屏" loading="eager">

<!-- 首屏外图片 -->
<img src="below-fold-1.jpg" alt="内容1" loading="lazy">
<img src="below-fold-2.jpg" alt="内容2" loading="lazy">
<img src="below-fold-3.jpg" alt="内容3" loading="lazy">`,
                        notes: "loading='lazy'延迟加载视口外的图片"
                    },
                    {
                        title: "预加载关键图片",
                        code: `<!-- 在<head>中预加载关键图片 -->
<head>
    <!-- 预加载主图 -->
    <link rel="preload" 
          as="image" 
          href="hero.jpg">
    
    <!-- 预加载响应式图片 -->
    <link rel="preload"
          as="image"
          href="hero-mobile.jpg"
          media="(max-width: 768px)">
    <link rel="preload"
          as="image"
          href="hero-desktop.jpg"
          media="(min-width: 769px)">
    
    <!-- 预加载WebP图片 -->
    <link rel="preload"
          as="image"
          href="hero.webp"
          type="image/webp">
</head>

<body>
    <img src="hero.jpg" alt="主图">
</body>`,
                        notes: "预加载可以让关键图片更早开始下载"
                    },
                    {
                        title: "decoding属性",
                        code: `<!-- 异步解码（推荐用于大图） -->
<img src="large-image.jpg" 
     alt="大图" 
     decoding="async">

<!-- 同步解码（小图、关键图） -->
<img src="small-icon.png" 
     alt="图标" 
     decoding="sync">

<!-- 自动（默认） -->
<img src="photo.jpg" 
     alt="照片" 
     decoding="auto">

<!-- 实际应用 -->
<img src="hero-banner.jpg"
     alt="主横幅"
     loading="eager"
     decoding="sync">

<img src="article-image.jpg"
     alt="文章配图"
     loading="lazy"
     decoding="async">`,
                        notes: "decoding控制图片解码方式"
                    },
                    {
                        title: "fetchpriority属性",
                        code: `<!-- 高优先级（LCP图片） -->
<img src="hero.jpg"
     alt="主图"
     fetchpriority="high"
     loading="eager">

<!-- 低优先级 -->
<img src="footer-logo.png"
     alt="页脚Logo"
     fetchpriority="low"
     loading="lazy">

<!-- 自动（默认） -->
<img src="content.jpg"
     alt="内容"
     fetchpriority="auto">`,
                        notes: "fetchpriority提示浏览器加载优先级"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "图片样式与效果",
            content: {
                description: "使用CSS增强图片的显示效果。",
                examples: [
                    {
                        title: "object-fit - 控制图片适应方式",
                        code: `<style>
    .container {
        width: 300px;
        height: 200px;
        border: 1px solid #ccc;
    }
    
    /* 填充整个容器，可能裁剪 */
    .cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    /* 完整显示，可能留白 */
    .contain {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    /* 拉伸填充 */
    .fill {
        width: 100%;
        height: 100%;
        object-fit: fill;
    }
    
    /* 保持原始尺寸 */
    .none {
        width: 100%;
        height: 100%;
        object-fit: none;
    }
</style>

<div class="container">
    <img src="photo.jpg" alt="Cover" class="cover">
</div>`,
                        notes: "object-fit类似CSS的background-size"
                    },
                    {
                        title: "object-position - 调整定位",
                        code: `<style>
    .img-container {
        width: 300px;
        height: 200px;
    }
    
    .img-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        /* 调整图片位置 */
        object-position: center top;
    }
    
    /* 其他位置 */
    .pos-left { object-position: left center; }
    .pos-right { object-position: right center; }
    .pos-bottom { object-position: center bottom; }
    
    /* 精确像素 */
    .pos-custom { object-position: 50px 20px; }
    
    /* 百分比 */
    .pos-percent { object-position: 75% 25%; }
</style>

<div class="img-container">
    <img src="photo.jpg" alt="照片">
</div>`,
                        notes: "object-position控制图片在容器中的位置"
                    },
                    {
                        title: "图片滤镜和效果",
                        code: `<style>
    /* 灰度 */
    .grayscale {
        filter: grayscale(100%);
    }
    
    /* 模糊 */
    .blur {
        filter: blur(5px);
    }
    
    /* 亮度 */
    .brightness {
        filter: brightness(1.2);
    }
    
    /* 对比度 */
    .contrast {
        filter: contrast(1.5);
    }
    
    /* 组合滤镜 */
    .vintage {
        filter: sepia(30%) contrast(1.2) brightness(0.9);
    }
    
    /* 圆角 */
    .rounded {
        border-radius: 8px;
    }
    
    /* 圆形头像 */
    .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    /* 阴影 */
    .shadow {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
</style>

<img src="photo.jpg" alt="照片" class="grayscale rounded shadow">`,
                        notes: "CSS filter可以实现各种图片效果"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "图片优化最佳实践",
            content: {
                description: "遵循这些最佳实践可以优化图片性能和用户体验：",
                practices: [
                    {
                        title: "总是提供alt文本",
                        description: "alt文本对可访问性和SEO至关重要。",
                        example: `<!-- ✅ 好：描述性alt -->
<img src="product.jpg" 
     alt="红色耐克运动鞋，Air Max系列">

<!-- ⚠️ 装饰性图片用空alt -->
<img src="decorative-bg.png" alt="">

<!-- ❌ 不好：缺少alt -->
<img src="product.jpg">`
                    },
                    {
                        title: "指定图片尺寸",
                        description: "设置width和height避免布局偏移（CLS）。",
                        example: `<!-- ✅ 好：指定尺寸 -->
<img src="banner.jpg"
     alt="横幅"
     width="1200"
     height="400">

<!-- 或使用CSS -->
<img src="banner.jpg"
     alt="横幅"
     style="width: 100%; height: auto; aspect-ratio: 3/1;">`
                    },
                    {
                        title: "使用现代图片格式",
                        description: "优先使用WebP/AVIF，提供回退方案。",
                        example: `<picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="图片">
</picture>`
                    },
                    {
                        title: "实现响应式图片",
                        description: "为不同设备提供合适尺寸的图片。",
                        example: `<img src="image-800.jpg"
     srcset="image-400.jpg 400w,
             image-800.jpg 800w,
             image-1200.jpg 1200w"
     sizes="(max-width: 600px) 100vw, 800px"
     alt="响应式图片">`
                    },
                    {
                        title: "懒加载非关键图片",
                        description: "首屏外的图片使用懒加载。",
                        example: `<!-- 首屏图片 -->
<img src="hero.jpg" 
     alt="主图" 
     loading="eager"
     fetchpriority="high">

<!-- 首屏外图片 -->
<img src="content.jpg" 
     alt="内容" 
     loading="lazy">`
                    },
                    {
                        title: "压缩图片",
                        description: "使用工具压缩图片减小文件大小。",
                        example: `<!-- 工具推荐 -->
<!-- - TinyPNG/TinyJPG (在线压缩) -->
<!-- - ImageOptim (Mac) -->
<!-- - Squoosh (Google工具) -->
<!-- - Sharp (Node.js库) -->

<!-- 目标：
     - JPEG: 质量80-85
     - PNG: 使用pngquant压缩
     - WebP: 质量80-90
-->`
                    }
                ]
            }
        },
        {
            type: "accessibility",
            title: "图片可访问性",
            content: {
                description: "确保图片对所有用户都可访问，包括使用屏幕阅读器的用户。",
                guidelines: [
                    "所有有意义的图片都必须有描述性的alt文本",
                    "装饰性图片使用空alt（alt=\"\"）",
                    "复杂图表提供详细的文本说明",
                    "不要在alt中使用'图片'、'照片'等词",
                    "图片链接的alt应描述链接目标",
                    "使用figure和figcaption提供图片说明"
                ],
                examples: [
                    {
                        title: "正确的alt文本",
                        code: `<!-- ✅ 有意义的图片 -->
<img src="chart.jpg" 
     alt="2024年销售额增长25%的柱状图">

<!-- ✅ 装饰性图片 -->
<img src="border-decoration.png" alt="">

<!-- ✅ 图片链接 -->
<a href="products.html">
    <img src="shop-icon.png" alt="查看所有产品">
</a>

<!-- ✅ 使用figure -->
<figure>
    <img src="chart.jpg" alt="销售数据图表">
    <figcaption>
        图1: 2024年月度销售趋势，显示持续增长态势
    </figcaption>
</figure>`,
                        explanation: "提供清晰、简洁的描述"
                    },
                    {
                        title: "复杂图片的处理",
                        code: `<!-- 复杂图表提供详细说明 -->
<figure>
    <img src="complex-chart.jpg" 
         alt="公司2024年财务数据对比图">
    <figcaption>
        详细说明：该图表显示了收入、支出和利润的
        季度对比。Q1收入100万，Q2增长至120万...
    </figcaption>
</figure>

<!-- 或使用longdesc（已废弃，不推荐） -->
<!-- 推荐方法：在页面中提供文字描述 -->
<img src="chart.jpg" 
     alt="年度财务报表" 
     aria-describedby="chart-desc">
<div id="chart-desc">
    <h3>图表详细说明</h3>
    <p>该图表展示了...</p>
</div>`,
                        explanation: "复杂图片需要详细的文字说明"
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "图片使用检查清单",
            content: {
                description: "使用这个清单确保图片的正确使用和优化：",
                items: [
                    { id: "check7-1", text: "所有图片都有适当的alt文本" },
                    { id: "check7-2", text: "图片指定了width和height属性" },
                    { id: "check7-3", text: "使用了适当的图片格式" },
                    { id: "check7-4", text: "图片已经压缩优化" },
                    { id: "check7-5", text: "实现了响应式图片（srcset/picture）" },
                    { id: "check7-6", text: "非关键图片使用了懒加载" },
                    { id: "check7-7", text: "LCP图片设置了高优先级" },
                    { id: "check7-8", text: "提供了现代格式的回退方案" },
                    { id: "check7-9", text: "图片链接有描述性的alt文本" },
                    { id: "check7-10", text: "复杂图片提供了详细说明" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "链接与导航", url: "content.html?chapter=06" },
        next: { title: "音频与视频", url: "content.html?chapter=08" }
    }
};
