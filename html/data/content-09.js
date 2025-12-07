// 第9章：iframe与嵌入内容 - 内容数据
window.htmlContentData_09 = {
    section: {
        title: "iframe与嵌入内容",
        icon: "🔲"
    },
    topics: [
        {
            type: "concept",
            title: "<iframe>元素概述",
            content: {
                description: "<iframe>（内联框架）允许在当前HTML文档中嵌入另一个HTML文档。它创建了一个独立的浏览上下文，常用于嵌入第三方内容、地图、视频等。",
                keyPoints: [
                    "iframe创建一个嵌套的浏览上下文",
                    "可以嵌入外部网站、文档、媒体等",
                    "有独立的DOM和JavaScript执行环境",
                    "存在安全性考虑，需要谨慎使用",
                    "现代Web开发中使用较少，但仍有特定用途",
                    "可以通过sandbox属性增强安全性"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe"
            }
        },
        {
            type: "code-example",
            title: "iframe基本用法",
            content: {
                description: "学习iframe的基础使用和常用属性。",
                examples: [
                    {
                        title: "基本iframe",
                        code: `<!-- 最简单的iframe -->
<iframe src="https://example.com"></iframe>

<!-- 指定尺寸 -->
<iframe src="page.html" 
        width="800" 
        height="600">
</iframe>

<!-- 完整属性 -->
<iframe src="https://example.com"
        width="800"
        height="600"
        title="示例网站"
        name="myFrame"
        frameborder="0">
    您的浏览器不支持iframe。
</iframe>`,
                        notes: "src指定嵌入的URL，width和height设置尺寸"
                    },
                    {
                        title: "常用属性",
                        code: `<iframe 
    src="content.html"
    
    <!-- 尺寸 -->
    width="100%"
    height="500"
    
    <!-- 标题（可访问性） -->
    title="嵌入内容描述"
    
    <!-- 名称（用于target） -->
    name="contentFrame"
    
    <!-- 边框（已废弃，用CSS代替） -->
    frameborder="0"
    
    <!-- 滚动条 -->
    scrolling="auto"
    
    <!-- 加载策略 -->
    loading="lazy"
    
    <!-- 引用策略 -->
    referrerpolicy="no-referrer"
    
    <!-- 允许全屏 -->
    allowfullscreen>
</iframe>`,
                        notes: "title属性对可访问性很重要"
                    },
                    {
                        title: "响应式iframe",
                        code: `<!-- 方法1：使用容器 -->
<div class="iframe-container">
    <iframe src="https://example.com" 
            title="响应式内容">
    </iframe>
</div>

<style>
    .iframe-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16:9 宽高比 */
        height: 0;
        overflow: hidden;
    }
    
    .iframe-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }
</style>

<!-- 方法2：使用aspect-ratio -->
<iframe src="https://example.com"
        style="width: 100%; aspect-ratio: 16/9; border: 0;">
</iframe>`,
                        notes: "容器方法兼容性更好"
                    }
                ]
            }
        },
        {
            type: "security",
            title: "iframe安全性 - sandbox属性",
            content: {
                description: "sandbox属性为iframe提供额外的安全限制，降低恶意内容的风险。",
                risks: [
                    "iframe可能包含恶意脚本",
                    "可能尝试导航父页面",
                    "可能提交表单到不安全的地址",
                    "可能打开弹窗",
                    "可能访问父页面数据（同源时）"
                ],
                solutions: [
                    "使用sandbox属性限制功能",
                    "使用CSP（Content Security Policy）",
                    "只嵌入可信来源的内容",
                    "使用X-Frame-Options防止被嵌入",
                    "设置适当的referrerpolicy"
                ],
                examples: [
                    {
                        title: "sandbox基本用法",
                        code: `<!-- 最严格：禁用所有功能 -->
<iframe src="untrusted.html" sandbox></iframe>

<!-- 允许脚本执行 -->
<iframe src="page.html" 
        sandbox="allow-scripts">
</iframe>

<!-- 允许表单提交 -->
<iframe src="form.html" 
        sandbox="allow-forms">
</iframe>

<!-- 组合多个权限 -->
<iframe src="content.html"
        sandbox="allow-scripts allow-forms allow-same-origin">
</iframe>`,
                        explanation: "不带值的sandbox最严格，完全禁用脚本等功能"
                    },
                    {
                        title: "sandbox属性值详解",
                        code: `<iframe src="content.html"
    sandbox="
        <!-- 允许脚本执行 -->
        allow-scripts
        
        <!-- 允许表单提交 -->
        allow-forms
        
        <!-- 允许弹窗 -->
        allow-popups
        
        <!-- 允许同源访问 -->
        allow-same-origin
        
        <!-- 允许导航顶层窗口 -->
        allow-top-navigation
        
        <!-- 允许模态对话框 -->
        allow-modals
        
        <!-- 允许自动播放媒体 -->
        allow-autoplay
        
        <!-- 允许全屏 -->
        allow-fullscreen
        
        <!-- 允许下载 -->
        allow-downloads
    ">
</iframe>`,
                        explanation: "根据需求选择合适的权限"
                    },
                    {
                        title: "推荐的安全配置",
                        code: `<!-- 嵌入不可信内容（最严格） -->
<iframe src="untrusted.html"
        sandbox="allow-scripts"
        referrerpolicy="no-referrer">
</iframe>

<!-- 嵌入半可信内容 -->
<iframe src="semi-trusted.html"
        sandbox="allow-scripts allow-forms"
        referrerpolicy="strict-origin">
</iframe>

<!-- 嵌入可信内容 -->
<iframe src="trusted.html"
        sandbox="allow-scripts allow-same-origin allow-forms"
        referrerpolicy="strict-origin-when-cross-origin">
</iframe>`,
                        explanation: "根据内容可信度调整安全级别"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "嵌入第三方内容",
            content: {
                description: "常见的第三方内容嵌入场景和最佳实践。",
                examples: [
                    {
                        title: "嵌入YouTube视频",
                        code: `<!-- YouTube嵌入代码 -->
<iframe width="560" 
        height="315" 
        src="https://www.youtube.com/embed/VIDEO_ID"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
</iframe>

<!-- 响应式YouTube -->
<div class="video-container">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID"
            title="YouTube视频"
            frameborder="0"
            allowfullscreen>
    </iframe>
</div>

<style>
    .video-container {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
    }
    
    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>`,
                        notes: "YouTube提供标准的嵌入代码"
                    },
                    {
                        title: "嵌入Google地图",
                        code: `<!-- Google Maps -->
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12..."
        width="600"
        height="450"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
</iframe>

<!-- 响应式地图 -->
<div class="map-container">
    <iframe src="https://www.google.com/maps/embed?..."
            title="地图"
            allowfullscreen
            loading="lazy">
    </iframe>
</div>

<style>
    .map-container {
        position: relative;
        padding-bottom: 75%; /* 4:3 宽高比 */
        height: 0;
        overflow: hidden;
    }
    
    .map-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }
</style>`,
                        notes: "可以从Google Maps获取嵌入代码"
                    },
                    {
                        title: "嵌入社交媒体",
                        code: `<!-- Twitter嵌入 -->
<iframe 
    src="https://platform.twitter.com/widgets/tweet_button.html"
    width="300"
    height="250"
    style="border:0; overflow:hidden;"
    sandbox="allow-scripts allow-popups allow-same-origin">
</iframe>

<!-- CodePen嵌入 -->
<iframe height="300"
        style="width: 100%;"
        scrolling="no"
        title="Demo"
        src="https://codepen.io/username/embed/HASH?default-tab=html,result"
        frameborder="no"
        loading="lazy"
        allowfullscreen="true">
</iframe>`,
                        notes: "第三方平台通常提供嵌入代码"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<embed>和<object>元素",
            content: {
                description: "embed和object是早期的嵌入元素，现在使用较少但仍有特定用途。",
                examples: [
                    {
                        title: "<embed>元素",
                        code: `<!-- 嵌入PDF -->
<embed src="document.pdf" 
       type="application/pdf" 
       width="800" 
       height="600">

<!-- 嵌入SVG -->
<embed src="image.svg" 
       type="image/svg+xml"
       width="300"
       height="300">

<!-- 注意：embed没有回退内容机制 -->`,
                        notes: "embed主要用于嵌入插件内容"
                    },
                    {
                        title: "<object>元素",
                        code: `<!-- 嵌入PDF（带回退） -->
<object data="document.pdf" 
        type="application/pdf" 
        width="800" 
        height="600">
    <p>
        您的浏览器不支持PDF预览。
        <a href="document.pdf">下载PDF</a>
    </p>
</object>

<!-- 嵌入SVG -->
<object data="image.svg" 
        type="image/svg+xml"
        width="300"
        height="300">
    <img src="fallback.png" alt="回退图片">
</object>

<!-- 嵌入Flash（已过时） -->
<object data="animation.swf" 
        type="application/x-shockwave-flash"
        width="800"
        height="600">
    <param name="movie" value="animation.swf">
    <p>需要Flash Player</p>
</object>`,
                        notes: "object支持回退内容"
                    },
                    {
                        title: "现代替代方案",
                        code: `<!-- ❌ 旧：使用embed嵌入PDF -->
<embed src="doc.pdf" type="application/pdf">

<!-- ✅ 新：使用iframe或直接链接 -->
<iframe src="doc.pdf" width="100%" height="600"></iframe>
<!-- 或 -->
<a href="doc.pdf" target="_blank">查看PDF</a>

<!-- ❌ 旧：使用object嵌入SVG -->
<object data="icon.svg" type="image/svg+xml"></object>

<!-- ✅ 新：直接使用img或inline SVG -->
<img src="icon.svg" alt="图标">
<!-- 或 -->
<svg>...</svg>

<!-- ❌ 旧：Flash -->
<object data="game.swf"></object>

<!-- ✅ 新：HTML5 Canvas/WebGL -->
<canvas id="gameCanvas"></canvas>`,
                        notes: "优先使用现代HTML5元素"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "iframe使用最佳实践",
            content: {
                description: "正确使用iframe可以避免安全问题并提升性能：",
                practices: [
                    {
                        title: "始终设置title属性",
                        description: "为屏幕阅读器用户提供上下文。",
                        example: `<!-- ✅ 好 -->
<iframe src="map.html" 
        title="公司位置地图">
</iframe>

<!-- ❌ 不好 -->
<iframe src="map.html"></iframe>`
                    },
                    {
                        title: "使用sandbox限制权限",
                        description: "为不可信内容添加安全限制。",
                        example: `<!-- ✅ 好：限制权限 -->
<iframe src="untrusted.html"
        sandbox="allow-scripts"
        title="第三方内容">
</iframe>

<!-- ❌ 不好：无限制 -->
<iframe src="untrusted.html"></iframe>`
                    },
                    {
                        title: "使用loading='lazy'延迟加载",
                        description: "优化页面加载性能。",
                        example: `<!-- 首屏外的iframe -->
<iframe src="content.html"
        loading="lazy"
        title="延迟加载的内容">
</iframe>`
                    },
                    {
                        title: "设置CSP策略",
                        description: "使用Content-Security-Policy限制嵌入来源。",
                        example: `<!-- 在HTTP头或meta标签中 -->
<meta http-equiv="Content-Security-Policy" 
      content="frame-src 'self' https://trusted-site.com;">

<!-- 只允许嵌入同源或指定域名的内容 -->`
                    },
                    {
                        title: "避免过度嵌套",
                        description: "iframe嵌套会影响性能和可维护性。",
                        example: `<!-- ❌ 不好：多层嵌套 -->
<iframe src="page1.html">
    <!-- page1.html 中又有 -->
    <iframe src="page2.html">
        <!-- page2.html 中又有... -->
    </iframe>
</iframe>

<!-- ✅ 好：扁平结构 -->
<iframe src="content.html"></iframe>`
                    },
                    {
                        title: "考虑替代方案",
                        description: "现代Web开发中有更好的选择。",
                        example: `<!-- iframe的替代方案： -->

<!-- 1. AJAX动态加载内容 -->
<div id="content"></div>
<script>
    fetch('content.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
        });
</script>

<!-- 2. Web Components -->
<my-widget></my-widget>

<!-- 3. 服务端包含（SSI） -->
<!--#include virtual="header.html" -->

<!-- 4. 模板引擎 -->
<!-- 使用Vue、React等组件化框架 -->`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "iframe检查清单",
            content: {
                description: "使用这个清单确保iframe的正确和安全使用：",
                items: [
                    { id: "check9-1", text: "设置了描述性的title属性" },
                    { id: "check9-2", text: "为不可信内容添加了sandbox属性" },
                    { id: "check9-3", text: "使用loading='lazy'优化加载" },
                    { id: "check9-4", text: "设置了适当的referrerpolicy" },
                    { id: "check9-5", text: "响应式iframe使用了容器方法" },
                    { id: "check9-6", text: "配置了CSP策略限制嵌入来源" },
                    { id: "check9-7", text: "提供了回退内容" },
                    { id: "check9-8", text: "避免了过度嵌套" },
                    { id: "check9-9", text: "考虑了是否有更好的替代方案" },
                    { id: "check9-10", text: "测试了跨浏览器兼容性" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "音频与视频", url: "content.html?chapter=08" },
        next: { title: "SVG基础", url: "content.html?chapter=10" }
    }
};
