// 第6章：链接与导航 - 内容数据
window.htmlContentData_06 = {
    section: {
        title: "链接与导航",
        icon: "🔗"
    },
    topics: [
        {
            type: "concept",
            title: "HTML链接<a>标签概述",
            content: {
                description: "<a>（anchor，锚点）标签是HTML中最重要的元素之一，它创建了网页之间的连接，使互联网成为一个相互关联的信息网络。",
                keyPoints: [
                    "<a>标签通过href属性指定链接目标",
                    "可以链接到外部网站、页面内锚点、文件等",
                    "target属性控制链接打开方式",
                    "链接是网页导航的基础",
                    "正确使用链接对SEO和用户体验很重要"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a"
            }
        },
        {
            type: "code-example",
            title: "基本链接用法",
            content: {
                description: "最基本的链接形式是指向其他网页的超链接。",
                examples: [
                    {
                        title: "绝对URL和相对URL",
                        code: `<!-- 外部链接（绝对URL） -->
<a href="https://www.example.com">访问Example网站</a>
<a href="https://www.example.com/page.html">外部页面</a>

<!-- 相对URL（同一网站内） -->
<a href="about.html">关于我们</a>
<a href="products/item.html">产品详情</a>
<a href="../index.html">返回上级目录</a>

<!-- 根相对路径 -->
<a href="/home">首页</a>
<a href="/products/list">产品列表</a>`,
                        notes: "绝对URL包含完整域名，相对URL基于当前页面路径"
                    },
                    {
                        title: "链接文本的最佳实践",
                        code: `<!-- ✅ 好：描述性的链接文本 -->
<a href="products.html">查看所有产品</a>
<a href="download.pdf">下载用户手册（PDF, 2MB）</a>

<!-- ❌ 不好：含糊的链接文本 -->
<a href="products.html">点击这里</a>
<a href="download.pdf">下载</a>

<!-- ✅ 好：提供上下文 -->
<p>
    我们的<a href="products.html">产品系列</a>包含多款
    高质量商品，详情请查看<a href="catalog.pdf">产品目录</a>。
</p>`,
                        notes: "链接文本应该清楚说明链接指向的内容"
                    },
                    {
                        title: "链接的状态样式",
                        code: `<style>
    /* 未访问的链接 */
    a:link {
        color: blue;
        text-decoration: none;
    }
    
    /* 已访问的链接 */
    a:visited {
        color: purple;
    }
    
    /* 鼠标悬停 */
    a:hover {
        color: red;
        text-decoration: underline;
    }
    
    /* 激活状态（点击时） */
    a:active {
        color: orange;
    }
    
    /* 获得焦点时 */
    a:focus {
        outline: 2px solid #00f;
    }
</style>

<a href="page.html">链接示例</a>`,
                        notes: "CSS伪类控制链接的不同状态样式"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "target属性 - 链接打开方式",
            content: {
                description: "target属性控制链接在哪里打开。",
                examples: [
                    {
                        title: "target的值",
                        code: `<!-- _self: 当前窗口打开（默认） -->
<a href="page.html" target="_self">当前窗口</a>

<!-- _blank: 新标签页打开 -->
<a href="https://example.com" target="_blank">新标签页打开</a>

<!-- _parent: 父框架打开 -->
<a href="page.html" target="_parent">父框架</a>

<!-- _top: 顶层窗口打开 -->
<a href="page.html" target="_top">顶层窗口</a>

<!-- 指定框架名称 -->
<a href="page.html" target="myframe">在指定框架打开</a>`,
                        notes: "_blank是最常用的，用于打开外部链接"
                    },
                    {
                        title: "安全性：使用rel属性",
                        code: `<!-- 新窗口打开外部链接时，应添加安全属性 -->
<a href="https://example.com" 
   target="_blank" 
   rel="noopener noreferrer">
    外部链接
</a>

<!-- noopener: 防止新页面访问window.opener -->
<!-- noreferrer: 不发送referrer信息 -->

<!-- 外部链接不传递权重 -->
<a href="https://external-site.com" 
   rel="nofollow">
    外部网站
</a>

<!-- 赞助/付费链接 -->
<a href="https://sponsor.com" 
   rel="sponsored">
    赞助商
</a>`,
                        notes: "target='_blank'必须配合rel='noopener'使用"
                    },
                    {
                        title: "rel属性的其他值",
                        code: `<!-- alternate: 替代版本 -->
<a href="page-en.html" 
   rel="alternate" 
   hreflang="en">
    English Version
</a>

<!-- author: 作者页面 -->
<a href="author.html" rel="author">作者信息</a>

<!-- help: 帮助文档 -->
<a href="help.html" rel="help">帮助</a>

<!-- license: 版权许可 -->
<a href="license.html" rel="license">许可证</a>

<!-- next/prev: 分页导航 -->
<a href="page2.html" rel="next">下一页</a>
<a href="page1.html" rel="prev">上一页</a>`,
                        notes: "rel属性定义当前文档与链接的关系"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "锚点链接 - 页面内导航",
            content: {
                description: "锚点链接允许跳转到页面内的特定位置。",
                examples: [
                    {
                        title: "创建和使用锚点",
                        code: `<!-- 方法1：使用id属性 -->
<h2 id="section1">第一节</h2>
<p>内容...</p>

<h2 id="section2">第二节</h2>
<p>内容...</p>

<!-- 链接到锚点 -->
<a href="#section1">跳转到第一节</a>
<a href="#section2">跳转到第二节</a>

<!-- 回到页面顶部 -->
<a href="#top">返回顶部</a>
<a href="#">返回顶部（空锚点）</a>`,
                        notes: "锚点链接以#开头，指向元素的id"
                    },
                    {
                        title: "目录导航示例",
                        code: `<nav>
    <h3>目录</h3>
    <ul>
        <li><a href="#intro">引言</a></li>
        <li><a href="#chapter1">第一章</a></li>
        <li><a href="#chapter2">第二章</a></li>
        <li><a href="#conclusion">结论</a></li>
    </ul>
</nav>

<article>
    <section id="intro">
        <h2>引言</h2>
        <p>内容...</p>
    </section>
    
    <section id="chapter1">
        <h2>第一章</h2>
        <p>内容...</p>
        <a href="#top">返回顶部</a>
    </section>
    
    <section id="chapter2">
        <h2>第二章</h2>
        <p>内容...</p>
        <a href="#top">返回顶部</a>
    </section>
    
    <section id="conclusion">
        <h2>结论</h2>
        <p>内容...</p>
        <a href="#top">返回顶部</a>
    </section>
</article>`,
                        notes: "锚点导航适合长页面内容"
                    },
                    {
                        title: "跨页面锚点链接",
                        code: `<!-- 链接到其他页面的特定位置 -->
<a href="products.html#featured">查看推荐产品</a>
<a href="about.html#team">查看团队成员</a>
<a href="faq.html#payment">付款相关问题</a>

<!-- 外部网站的锚点 -->
<a href="https://example.com/docs#api">API文档</a>`,
                        notes: "可以组合页面URL和锚点"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "特殊类型的链接",
            content: {
                description: "除了HTTP链接，<a>标签还支持多种协议和功能。",
                examples: [
                    {
                        title: "邮件链接",
                        code: `<!-- 基本邮件链接 -->
<a href="mailto:info@example.com">发送邮件</a>

<!-- 带主题 -->
<a href="mailto:support@example.com?subject=技术支持">
    联系技术支持
</a>

<!-- 带主题和正文 -->
<a href="mailto:sales@example.com?subject=产品咨询&body=您好，我想了解...">
    产品咨询
</a>

<!-- 多个收件人 -->
<a href="mailto:user1@example.com,user2@example.com">
    发送给多人
</a>

<!-- CC和BCC -->
<a href="mailto:to@example.com?cc=cc@example.com&bcc=bcc@example.com">
    邮件（含抄送）
</a>`,
                        notes: "mailto链接会打开用户的邮件客户端"
                    },
                    {
                        title: "电话链接",
                        code: `<!-- 移动端拨打电话 -->
<a href="tel:+8613800138000">138-0013-8000</a>
<a href="tel:010-12345678">010-12345678</a>

<!-- 国际号码 -->
<a href="tel:+1-555-123-4567">+1 (555) 123-4567</a>

<!-- 短信链接 -->
<a href="sms:+8613800138000">发送短信</a>
<a href="sms:+8613800138000?body=你好">发送预填短信</a>`,
                        notes: "tel链接在移动设备上特别有用"
                    },
                    {
                        title: "文件下载",
                        code: `<!-- download属性触发下载 -->
<a href="document.pdf" download>下载PDF</a>

<!-- 指定下载文件名 -->
<a href="file.pdf" download="用户手册.pdf">
    下载用户手册
</a>

<!-- 下载图片 -->
<a href="image.jpg" download="产品图片.jpg">
    下载产品图片
</a>

<!-- 注意：download只对同源URL有效 -->
<a href="https://example.com/file.pdf" download>
    <!-- 跨域下载可能无效 -->
    下载文件
</a>`,
                        notes: "download属性提示浏览器下载而非打开"
                    },
                    {
                        title: "其他协议",
                        code: `<!-- FTP链接 -->
<a href="ftp://ftp.example.com/files">FTP服务器</a>

<!-- JavaScript伪协议（不推荐） -->
<a href="javascript:void(0)" onclick="doSomething()">
    点击执行
</a>

<!-- 更好的做法：使用button -->
<button type="button" onclick="doSomething()">
    点击执行
</button>

<!-- 跳转到WhatsApp -->
<a href="https://wa.me/8613800138000">WhatsApp联系</a>

<!-- 跳转到地图 -->
<a href="https://maps.google.com/?q=北京天安门">在地图中查看</a>`,
                        notes: "支持多种URL协议"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "导航菜单实现",
            content: {
                description: "使用链接和列表构建网站导航是最常见的应用。",
                examples: [
                    {
                        title: "基本导航栏",
                        code: `<nav>
    <ul>
        <li><a href="index.html">首页</a></li>
        <li><a href="products.html">产品</a></li>
        <li><a href="about.html">关于</a></li>
        <li><a href="contact.html">联系</a></li>
    </ul>
</nav>

<style>
    nav ul {
        list-style: none;
        padding: 0;
        display: flex;
        gap: 20px;
    }
    
    nav a {
        text-decoration: none;
        color: #333;
        padding: 10px 15px;
    }
    
    nav a:hover {
        background: #f0f0f0;
        border-radius: 4px;
    }
</style>`,
                        notes: "nav标签语义化标记导航区域"
                    },
                    {
                        title: "下拉菜单",
                        code: `<nav>
    <ul class="menu">
        <li><a href="index.html">首页</a></li>
        <li class="has-submenu">
            <a href="products.html">产品</a>
            <ul class="submenu">
                <li><a href="product1.html">产品A</a></li>
                <li><a href="product2.html">产品B</a></li>
                <li><a href="product3.html">产品C</a></li>
            </ul>
        </li>
        <li><a href="about.html">关于</a></li>
        <li><a href="contact.html">联系</a></li>
    </ul>
</nav>

<style>
    .submenu {
        display: none;
        position: absolute;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .has-submenu:hover .submenu {
        display: block;
    }
</style>`,
                        notes: "通过CSS实现下拉菜单效果"
                    },
                    {
                        title: "面包屑导航",
                        code: `<nav aria-label="面包屑">
    <ol class="breadcrumb">
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/products/electronics">电子产品</a></li>
        <li aria-current="page">笔记本电脑</li>
    </ol>
</nav>

<style>
    .breadcrumb {
        display: flex;
        list-style: none;
        padding: 0;
    }
    
    .breadcrumb li:not(:last-child)::after {
        content: " / ";
        padding: 0 8px;
        color: #999;
    }
    
    .breadcrumb a {
        color: #0066cc;
        text-decoration: none;
    }
    
    .breadcrumb li:last-child {
        color: #333;
    }
</style>`,
                        notes: "面包屑导航显示当前页面层级"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "链接使用最佳实践",
            content: {
                description: "遵循这些最佳实践可以创建更好的链接体验：",
                practices: [
                    {
                        title: "提供有意义的链接文本",
                        description: "链接文本应该清楚描述目标内容。",
                        example: `<!-- ✅ 好 -->
<a href="annual-report.pdf">
    下载2024年度报告（PDF, 5MB）
</a>

<!-- ❌ 不好 -->
<a href="annual-report.pdf">点击这里</a>

<!-- ✅ 好：在上下文中也清晰 -->
<p>
    我们的<a href="products.html">产品页面</a>
    展示了所有可用的选项。
</p>`
                    },
                    {
                        title: "外部链接的安全处理",
                        description: "打开新窗口的外部链接必须添加安全属性。",
                        example: `<!-- ✅ 安全的外部链接 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer">
    外部网站
</a>

<!-- ❌ 不安全 -->
<a href="https://external-site.com" target="_blank">
    外部网站
</a>`
                    },
                    {
                        title: "标明链接类型",
                        description: "非HTML链接应该告知用户文件类型和大小。",
                        example: `<!-- ✅ 好：标明文件信息 -->
<a href="manual.pdf">
    用户手册（PDF, 2.5MB）
</a>

<a href="data.xlsx">
    数据表格（Excel, 500KB）
</a>

<a href="https://external.com" target="_blank">
    外部链接
    <span aria-label="在新窗口打开">↗</span>
</a>`
                    },
                    {
                        title: "避免使用JavaScript伪协议",
                        description: "不要使用javascript:void(0)作为href。",
                        example: `<!-- ❌ 不好 -->
<a href="javascript:void(0)" onclick="doSomething()">
    点击
</a>

<!-- ✅ 好：使用#或button -->
<a href="#" onclick="doSomething(); return false;">
    点击
</a>

<!-- ✅ 更好：使用button -->
<button type="button" onclick="doSomething()">
    点击
</button>`
                    },
                    {
                        title: "链接的可访问性",
                        description: "确保链接对所有用户都可用。",
                        example: `<!-- ✅ 好：足够的链接文本 -->
<a href="products.html">
    查看所有产品
</a>

<!-- 图标链接添加文本说明 -->
<a href="settings.html" aria-label="设置">
    <svg>...</svg>
</a>

<!-- 链接按钮有足够的点击区域 -->
<style>
    a {
        min-height: 44px;  /* 至少44×44像素 */
        min-width: 44px;
        display: inline-block;
        padding: 10px 15px;
    }
</style>`
                    },
                    {
                        title: "优化链接的SEO",
                        description: "链接文本和属性对SEO很重要。",
                        example: `<!-- ✅ 好：描述性的链接文本 -->
<a href="html-tutorial.html">
    HTML完整教程
</a>

<!-- 图片链接必须有alt文本 -->
<a href="product.html">
    <img src="product.jpg" alt="产品名称">
</a>

<!-- 内部链接使用相对路径 -->
<a href="/about">关于我们</a>

<!-- 不希望传递权重的链接 -->
<a href="https://spam-site.com" rel="nofollow">
    广告
</a>`
                    }
                ]
            }
        },
        {
            type: "security",
            title: "链接安全性",
            content: {
                description: "链接可能存在安全风险，需要采取适当的防护措施。",
                risks: [
                    "target='_blank'的安全漏洞：新窗口可以访问原窗口",
                    "钓鱼链接：伪装成可信网站",
                    "XSS攻击：恶意JavaScript注入",
                    "开放重定向：利用重定向功能进行攻击"
                ],
                solutions: [
                    "target='_blank'必须配合rel='noopener noreferrer'",
                    "验证和过滤用户输入的URL",
                    "对外部链接添加明显的视觉标识",
                    "使用Content-Security-Policy限制可导航的域",
                    "避免在href中使用用户输入的内容"
                ],
                examples: [
                    {
                        title: "安全的外部链接",
                        code: `<!-- 安全实践 -->
<a href="https://external-site.com"
   target="_blank"
   rel="noopener noreferrer">
    外部链接
</a>`,
                        explanation: "防止新窗口访问window.opener"
                    },
                    {
                        title: "防止XSS",
                        code: `<!-- 永远不要这样做 -->
<a href="javascript:alert('XSS')">危险链接</a>

<!-- URL验证和过滤 -->
function sanitizeUrl(url) {
    // 只允许http和https协议
    if (!/^https?:\\/\\//i.test(url)) {
        return '#';
    }
    return url;
}`,
                        explanation: "过滤和验证URL防止注入攻击"
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "链接检查清单",
            content: {
                description: "使用这个清单确保链接的正确性和安全性：",
                items: [
                    { id: "check6-1", text: "所有链接都有有意义的链接文本" },
                    { id: "check6-2", text: "外部链接使用了target='_blank'和rel='noopener noreferrer'" },
                    { id: "check6-3", text: "文件链接标明了文件类型和大小" },
                    { id: "check6-4", text: "锚点链接指向存在的id" },
                    { id: "check6-5", text: "导航使用了nav和list标签" },
                    { id: "check6-6", text: "链接有足够的点击区域（至少44×44px）" },
                    { id: "check6-7", text: "图标链接添加了aria-label" },
                    { id: "check6-8", text: "没有使用javascript:void(0)" },
                    { id: "check6-9", text: "付费/广告链接使用了rel='nofollow'或'sponsored'" },
                    { id: "check6-10", text: "所有链接都已测试可正常访问" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "列表与定义", url: "content.html?chapter=05" },
        next: { title: "图片处理", url: "content.html?chapter=07" }
    }
};
