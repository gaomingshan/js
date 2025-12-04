// 第18章：最佳实践 - 面试题
window.htmlQuizData_18 = {
    config: {
        title: "最佳实践",
        icon: "✨",
        description: "测试你对HTML最佳实践的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["代码规范", "基础"],
            question: "HTML代码规范包括哪些？",
            type: "multiple-choice",
            options: [
                "使用小写标签名",
                "正确缩进",
                "闭合所有标签",
                "语义化标签"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML代码规范",
                description: "遵循规范提升代码质量和可维护性。",
                sections: [
                    {
                        title: "标签和属性命名",
                        code: '<!-- ❌ 不好 -->\n<DIV Class="Container">\n  <P ID="MainText">Content</P>\n</DIV>\n\n<!-- ✅ 好 -->\n<div class="container">\n  <p id="main-text">Content</p>\n</div>',
                        points: [
                            "标签名小写",
                            "属性名小写",
                            "属性值用引号",
                            "ID和class使用kebab-case或camelCase",
                            "保持一致性"
                        ]
                    },
                    {
                        title: "缩进和格式",
                        code: '<!-- ❌ 不好 -->\n<div><p>Text</p><span>More</span></div>\n\n<!-- ✅ 好 -->\n<div>\n  <p>Text</p>\n  <span>More</span>\n</div>\n\n<!-- 嵌套层级 -->\n<article>\n  <header>\n    <h1>标题</h1>\n    <p>副标题</p>\n  </header>\n  <section>\n    <h2>章节</h2>\n    <p>内容</p>\n  </section>\n</article>',
                        points: [
                            "使用2或4个空格缩进",
                            "块级元素换行",
                            "内联元素可同行",
                            "保持一致的缩进风格",
                            "合理的空行分隔"
                        ]
                    },
                    {
                        title: "闭合标签",
                        code: '<!-- ❌ 不好 -->\n<div>\n  <p>段落1\n  <p>段落2\n</div>\n\n<!-- ✅ 好 -->\n<div>\n  <p>段落1</p>\n  <p>段落2</p>\n</div>\n\n<!-- 自闭合标签 -->\n<img src="image.jpg" alt="图片">\n<br>\n<hr>\n<input type="text">\n\n<!-- XHTML风格（可选） -->\n<img src="image.jpg" alt="图片" />\n<br />\n<input type="text" />',
                        points: [
                            "始终闭合标签",
                            "自闭合标签可不加/",
                            "避免省略可选闭合标签",
                            "保持一致性"
                        ]
                    },
                    {
                        title: "属性顺序",
                        code: '<!-- 推荐顺序 -->\n<a \n  class="btn btn-primary"  <!-- 1. class -->\n  id="submit-btn"          <!-- 2. id -->\n  name="submit"            <!-- 3. name -->\n  data-toggle="modal"      <!-- 4. data-* -->\n  href="#"                 <!-- 5. src/href等 -->\n  title="提交"             <!-- 6. title/alt -->\n  aria-label="提交按钮"    <!-- 7. aria-* -->\n  disabled                 <!-- 8. 布尔属性 -->\n>\n  提交\n</a>',
                        content: "保持属性顺序一致。"
                    },
                    {
                        title: "注释规范",
                        code: '<!-- 区块注释 -->\n<!-- ==================== Header ==================== -->\n<header>\n  <!-- Logo -->\n  <div class="logo">Logo</div>\n  \n  <!-- Navigation -->\n  <nav>\n    <!-- TODO: 添加移动端导航 -->\n  </nav>\n</header>\n<!-- ==================== End Header ==================== -->\n\n<!-- 条件注释（IE） -->\n<!--[if lt IE 9]>\n  <script src="html5shiv.js"></script>\n<![endif]-->',
                        points: [
                            "注释说明复杂逻辑",
                            "区块开始和结束",
                            "TODO/FIXME标记",
                            "避免过度注释",
                            "及时更新注释"
                        ]
                    },
                    {
                        title: "工具辅助",
                        code: '// .editorconfig\nroot = true\n\n[*.html]\nindent_style = space\nindent_size = 2\ncharset = utf-8\ntrim_trailing_whitespace = true\ninsert_final_newline = true\n\n// HTMLHint配置\n{\n  "tagname-lowercase": true,\n  "attr-lowercase": true,\n  "attr-value-double-quotes": true,\n  "doctype-first": true,\n  "tag-pair": true,\n  "spec-char-escape": true,\n  "id-unique": true,\n  "src-not-empty": true,\n  "attr-no-duplication": true\n}\n\n// Prettier配置\n{\n  "printWidth": 100,\n  "tabWidth": 2,\n  "useTabs": false,\n  "htmlWhitespaceSensitivity": "css"\n}',
                        content: "使用工具自动化规范。"
                    }
                ]
            },
            source: "最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["兼容性", "跨浏览器"],
            question: "如何处理浏览器兼容性问题？",
            type: "multiple-choice",
            options: [
                "使用Polyfill",
                "特性检测",
                "渐进增强",
                "优雅降级"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "浏览器兼容性",
                description: "处理不同浏览器的差异。",
                sections: [
                    {
                        title: "特性检测",
                        code: '<!-- HTML特性检测 -->\n<script>\n// 检测video支持\nif (document.createElement("video").canPlayType) {\n  // 支持video\n} else {\n  // 降级方案\n}\n\n// 检测localStorage\nif (typeof Storage !== "undefined") {\n  localStorage.setItem("test", "1");\n} else {\n  // 使用cookie\n}\n\n// 检测WebP支持\nfunction supportsWebP() {\n  const canvas = document.createElement("canvas");\n  if (canvas.getContext && canvas.getContext("2d")) {\n    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;\n  }\n  return false;\n}\n\n// 使用Modernizr\nif (Modernizr.flexbox) {\n  // 支持Flexbox\n}\n</script>',
                        points: [
                            "检测而非猜测",
                            "不要UA检测",
                            "使用Modernizr",
                            "提供降级方案"
                        ]
                    },
                    {
                        title: "Polyfill",
                        code: '<!-- HTML5 Shiv（IE8-） -->\n<!--[if lt IE 9]>\n  <script src="html5shiv.min.js"></script>\n<![endif]-->\n\n<!-- 或动态加载 -->\n<script>\nif (!document.createElement("article").cloneNode().outerHTML) {\n  // 加载polyfill\n  const script = document.createElement("script");\n  script.src = "html5shiv.js";\n  document.head.appendChild(script);\n}\n</script>\n\n<!-- Respond.js（IE8-支持媒体查询） -->\n<!--[if lt IE 9]>\n  <script src="respond.min.js"></script>\n<![endif]-->\n\n<!-- Polyfill.io（按需加载） -->\n<script src="https://polyfill.io/v3/polyfill.min.js"></script>',
                        content: "使用polyfill填补功能缺失。"
                    },
                    {
                        title: "渐进增强",
                        code: '<!-- 基础功能 -->\n<form action="/submit" method="POST">\n  <input type="text" name="email" required>\n  <button type="submit">提交</button>\n</form>\n\n<!-- 增强功能 -->\n<script>\nconst form = document.querySelector("form");\n\n// 支持Fetch API\nif ("fetch" in window) {\n  form.addEventListener("submit", async (e) => {\n    e.preventDefault();\n    const data = new FormData(form);\n    const response = await fetch("/submit", {\n      method: "POST",\n      body: data\n    });\n    // Ajax提交\n  });\n}\n// 不支持则使用默认表单提交\n</script>\n\n<!-- 渐进增强图片 -->\n<picture>\n  <source srcset="image.avif" type="image/avif">\n  <source srcset="image.webp" type="image/webp">\n  <img src="image.jpg" alt="图片" loading="lazy">\n</picture>',
                        points: [
                            "基础功能优先",
                            "逐步增强体验",
                            "功能可选",
                            "向后兼容"
                        ]
                    },
                    {
                        title: "优雅降级",
                        code: '<!-- Grid布局降级 -->\n<style>\n.container {\n  /* 降级方案：Float */\n  overflow: hidden;\n}\n\n.item {\n  float: left;\n  width: 33.33%;\n}\n\n/* 支持Grid时覆盖 */\n@supports (display: grid) {\n  .container {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    overflow: visible;\n  }\n  \n  .item {\n    float: none;\n    width: auto;\n  }\n}\n</style>\n\n<!-- video降级 -->\n<video controls>\n  <source src="video.webm" type="video/webm">\n  <source src="video.mp4" type="video/mp4">\n  <!-- 降级内容 -->\n  <p>\n    您的浏览器不支持video标签。\n    <a href="video.mp4">下载视频</a>\n  </p>\n</video>',
                        content: "提供降级方案。"
                    },
                    {
                        title: "CSS前缀",
                        code: '<style>\n/* 自动添加前缀（Autoprefixer） */\n.box {\n  display: flex;\n  /* 编译后 */\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n\n/* 手动添加 */\n.element {\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n}\n</style>',
                        content: "处理CSS兼容性。"
                    },
                    {
                        title: "测试工具",
                        points: [
                            "BrowserStack：真实浏览器测试",
                            "Can I Use：特性支持查询",
                            "Modernizr：特性检测",
                            "Polyfill.io：自动polyfill",
                            "Autoprefixer：自动前缀",
                            "Babel：JS转译"
                        ]
                    }
                ]
            },
            source: "兼容性最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["安全", "最佳实践"],
            question: "HTML中有哪些安全问题需要注意？",
            type: "multiple-choice",
            options: [
                "XSS跨站脚本攻击",
                "CSRF跨站请求伪造",
                "点击劫持",
                "敏感信息泄露"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML安全",
                description: "防范常见的Web安全问题。",
                sections: [
                    {
                        title: "XSS防护",
                        code: '<!-- ❌ 危险：直接插入用户输入 -->\n<div id="content"></div>\n<script>\nconst userInput = "<script>alert(\'XSS\')<\\/script>";\ndocument.getElementById("content").innerHTML = userInput;\n</script>\n\n<!-- ✅ 安全：转义HTML -->\n<script>\nfunction escapeHtml(text) {\n  const div = document.createElement("div");\n  div.textContent = text;\n  return div.innerHTML;\n}\n\nconst userInput = "<script>alert(\'XSS\')<\\/script>";\ndocument.getElementById("content").textContent = userInput;\n// 或\ndocument.getElementById("content").innerHTML = escapeHtml(userInput);\n</script>\n\n<!-- ✅ 使用DOMPurify库 -->\n<script src="purify.min.js"></script>\n<script>\nconst dirty = \'<img src=x onerror=alert(1)>\';\nconst clean = DOMPurify.sanitize(dirty);\ndocument.getElementById("content").innerHTML = clean;\n</script>',
                        points: [
                            "永远不信任用户输入",
                            "使用textContent而非innerHTML",
                            "必要时使用转义",
                            "使用CSP策略",
                            "使用安全的库"
                        ]
                    },
                    {
                        title: "CSP内容安全策略",
                        code: '<!-- CSP Meta标签 -->\n<meta http-equiv="Content-Security-Policy" \n      content="default-src \'self\'; \n               script-src \'self\' https://trusted.com; \n               style-src \'self\' \'unsafe-inline\';\n               img-src \'self\' data: https:;\n               font-src \'self\';\n               connect-src \'self\' https://api.example.com;\n               frame-ancestors \'none\';\n               base-uri \'self\';\n               form-action \'self\';">\n\n<!-- 或HTTP响应头 -->\nContent-Security-Policy: default-src \'self\'\n\n<!-- 指令说明 -->\ndefault-src    - 默认策略\nscript-src     - 脚本源\nstyle-src      - 样式源\nimg-src        - 图片源\nfont-src       - 字体源\nconnect-src    - Ajax/WebSocket源\nframe-src      - iframe源\nframe-ancestors- 可嵌入的父页面\nobject-src     - <object>/<embed>源\nmedia-src      - <video>/<audio>源',
                        content: "CSP限制资源来源。"
                    },
                    {
                        title: "CSRF防护",
                        code: '<!-- CSRF Token -->\n<form action="/transfer" method="POST">\n  <input type="hidden" \n         name="csrf_token" \n         value="随机生成的token">\n  <input type="text" name="amount">\n  <button type="submit">转账</button>\n</form>\n\n<!-- SameSite Cookie -->\nSet-Cookie: sessionid=xxx; SameSite=Strict\n\n<!-- Strict: 完全禁止第三方Cookie -->\n<!-- Lax: GET请求可以，POST不行 -->\n<!-- None: 允许第三方（需HTTPS） -->\n\n<!-- 验证Referer -->\n<script>\nif (document.referrer.indexOf("https://mysite.com") !== 0) {\n  // 可疑请求\n}\n</script>',
                        points: [
                            "使用CSRF Token",
                            "SameSite Cookie",
                            "验证Referer",
                            "重要操作二次确认"
                        ]
                    },
                    {
                        title: "点击劫持防护",
                        code: '<!-- X-Frame-Options响应头 -->\nX-Frame-Options: DENY              # 不允许嵌入\nX-Frame-Options: SAMEORIGIN        # 同源可嵌入\nX-Frame-Options: ALLOW-FROM https://trusted.com\n\n<!-- 或CSP -->\nContent-Security-Policy: frame-ancestors \'none\'\nContent-Security-Policy: frame-ancestors \'self\'\n\n<!-- JS防护 -->\n<script>\nif (top !== self) {\n  // 检测到被嵌入\n  top.location = self.location;\n}\n</script>\n\n<!-- CSS防护 -->\n<style>\nhtml {\n  display: none;\n}\n</style>\n<script>\nif (self === top) {\n  document.documentElement.style.display = "block";\n} else {\n  top.location = self.location;\n}\n</script>',
                        content: "防止页面被恶意嵌入。"
                    },
                    {
                        title: "敏感信息处理",
                        code: '<!-- ❌ 不要在HTML中暴露 -->\n<input type="hidden" name="api_key" value="secret123">\n<script>\nconst API_KEY = "secret123";  // 可被查看\n</script>\n\n<!-- ✅ 密码字段 -->\n<input type="password" \n       name="password"\n       autocomplete="current-password">\n\n<!-- ✅ 禁用自动填充（敏感数据） -->\n<input type="text" \n       name="credit-card"\n       autocomplete="off">\n\n<!-- ✅ 禁用缓存 -->\n<meta http-equiv="Cache-Control" \n      content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">',
                        points: [
                            "不在前端存储密钥",
                            "使用HTTPS",
                            "password类型输入",
                            "敏感页面禁缓存",
                            "不在URL传递敏感信息"
                        ]
                    },
                    {
                        title: "安全的外部链接",
                        code: '<!-- 外部链接安全 -->\n<a href="https://untrusted.com"\n   target="_blank"\n   rel="noopener noreferrer">\n  外部链接\n</a>\n\n<!-- noopener: 防止window.opener访问 -->\n<!-- noreferrer: 不发送Referer -->\n\n<!-- 用户生成内容链接 -->\n<a href="https://user-site.com"\n   rel="nofollow noopener noreferrer ugc">\n  用户链接\n</a>\n\n<!-- nofollow: SEO，不传递权重 -->\n<!-- ugc: 标记为用户生成内容 -->',
                        content: "外部链接添加安全属性。"
                    },
                    {
                        title: "子资源完整性（SRI）",
                        code: '<!-- SRI确保CDN资源未被篡改 -->\n<script \n  src="https://cdn.example.com/library.js"\n  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."\n  crossorigin="anonymous">\n</script>\n\n<link \n  rel="stylesheet" \n  href="https://cdn.example.com/style.css"\n  integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUc...">\n\n<!-- 生成integrity hash -->\n# 命令行\nopenssl dgst -sha384 -binary library.js | openssl base64 -A\n\n# 在线工具\nhttps://www.srihash.org/',
                        content: "验证第三方资源完整性。"
                    }
                ]
            },
            source: "Web安全最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["组件化", "架构"],
            question: "如何使用Web Components？",
            type: "multiple-choice",
            options: [
                "Custom Elements自定义元素",
                "Shadow DOM封装样式",
                "HTML Templates模板",
                "可复用组件"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web Components",
                description: "原生的组件化方案。",
                sections: [
                    {
                        title: "Custom Elements",
                        code: '<!-- 定义自定义元素 -->\n<script>\nclass UserCard extends HTMLElement {\n  constructor() {\n    super();\n  }\n  \n  connectedCallback() {\n    // 元素插入DOM时\n    const name = this.getAttribute("name");\n    const avatar = this.getAttribute("avatar");\n    \n    this.innerHTML = `\n      <div class="user-card">\n        <img src="${avatar}" alt="${name}">\n        <h3>${name}</h3>\n      </div>\n    `;\n  }\n  \n  disconnectedCallback() {\n    // 元素从DOM移除时\n  }\n  \n  attributeChangedCallback(name, oldValue, newValue) {\n    // 属性变化时\n  }\n  \n  static get observedAttributes() {\n    return ["name", "avatar"];\n  }\n}\n\n// 注册元素\ncustomElements.define("user-card", UserCard);\n</script>\n\n<!-- 使用 -->\n<user-card \n  name="张三"\n  avatar="/avatar.jpg">\n</user-card>',
                        points: [
                            "继承HTMLElement",
                            "connectedCallback初始化",
                            "observedAttributes监听属性",
                            "customElements.define注册",
                            "命名必须包含连字符"
                        ]
                    },
                    {
                        title: "Shadow DOM",
                        code: '<script>\nclass MyButton extends HTMLElement {\n  constructor() {\n    super();\n    \n    // 创建Shadow DOM\n    const shadow = this.attachShadow({ mode: "open" });\n    \n    // 样式\n    const style = document.createElement("style");\n    style.textContent = `\n      button {\n        background: #007bff;\n        color: white;\n        border: none;\n        padding: 10px 20px;\n        border-radius: 4px;\n        cursor: pointer;\n      }\n      button:hover {\n        background: #0056b3;\n      }\n    `;\n    \n    // 内容\n    const button = document.createElement("button");\n    button.textContent = this.textContent;\n    \n    // 添加到Shadow DOM\n    shadow.appendChild(style);\n    shadow.appendChild(button);\n  }\n}\n\ncustomElements.define("my-button", MyButton);\n</script>\n\n<!-- 使用 -->\n<my-button>点击我</my-button>\n\n<!-- 外部样式不会影响Shadow DOM内部 -->\n<style>\nbutton {\n  background: red;  /* 不影响my-button */\n}\n</style>',
                        points: [
                            "attachShadow创建",
                            "mode: open/closed",
                            "样式隔离",
                            "DOM封装",
                            "::part伪元素暴露样式"
                        ]
                    },
                    {
                        title: "HTML Templates",
                        code: '<!-- 定义模板 -->\n<template id="user-card-template">\n  <style>\n    .card {\n      border: 1px solid #ddd;\n      border-radius: 8px;\n      padding: 20px;\n      margin: 10px;\n    }\n    .avatar {\n      width: 80px;\n      height: 80px;\n      border-radius: 50%;\n    }\n  </style>\n  \n  <div class="card">\n    <img class="avatar" src="" alt="">\n    <h3 class="name"></h3>\n    <p class="bio"></p>\n    <slot name="actions"></slot>\n  </div>\n</template>\n\n<script>\nclass UserCard extends HTMLElement {\n  constructor() {\n    super();\n    \n    const template = document.getElementById("user-card-template");\n    const content = template.content.cloneNode(true);\n    \n    const shadow = this.attachShadow({ mode: "open" });\n    shadow.appendChild(content);\n  }\n  \n  connectedCallback() {\n    const shadow = this.shadowRoot;\n    shadow.querySelector(".avatar").src = this.getAttribute("avatar");\n    shadow.querySelector(".name").textContent = this.getAttribute("name");\n    shadow.querySelector(".bio").textContent = this.getAttribute("bio");\n  }\n}\n\ncustomElements.define("user-card", UserCard);\n</script>\n\n<!-- 使用 -->\n<user-card \n  name="张三"\n  avatar="/avatar.jpg"\n  bio="前端开发者">\n  <div slot="actions">\n    <button>关注</button>\n    <button>消息</button>\n  </div>\n</user-card>',
                        content: "template定义可复用结构。"
                    },
                    {
                        title: "Slots插槽",
                        code: '<!-- 组件定义 -->\n<template id="card-template">\n  <style>\n    .card {\n      border: 1px solid #ddd;\n      padding: 20px;\n    }\n  </style>\n  \n  <div class="card">\n    <header>\n      <slot name="header">默认标题</slot>\n    </header>\n    <main>\n      <slot>默认内容</slot>\n    </main>\n    <footer>\n      <slot name="footer"></slot>\n    </footer>\n  </div>\n</template>\n\n<!-- 使用 -->\n<my-card>\n  <h2 slot="header">自定义标题</h2>\n  <p>这是卡片内容</p>\n  <div slot="footer">\n    <button>确定</button>\n  </div>\n</my-card>',
                        points: [
                            "默认slot",
                            "具名slot",
                            "slot默认内容",
                            "::slotted伪元素",
                            "灵活的内容投影"
                        ]
                    },
                    {
                        title: "生命周期",
                        code: '<script>\nclass MyElement extends HTMLElement {\n  constructor() {\n    super();\n    console.log("1. constructor - 元素创建");\n  }\n  \n  connectedCallback() {\n    console.log("2. connectedCallback - 插入DOM");\n  }\n  \n  disconnectedCallback() {\n    console.log("3. disconnectedCallback - 从DOM移除");\n  }\n  \n  adoptedCallback() {\n    console.log("4. adoptedCallback - 移动到新文档");\n  }\n  \n  attributeChangedCallback(name, oldValue, newValue) {\n    console.log(`5. attributeChangedCallback - ${name}从${oldValue}变为${newValue}`);\n  }\n  \n  static get observedAttributes() {\n    return ["name", "value"];\n  }\n}\n\ncustomElements.define("my-element", MyElement);\n</script>',
                        content: "五个生命周期回调。"
                    },
                    {
                        title: "完整示例",
                        code: '<!-- 下拉菜单组件 -->\n<template id="dropdown-template">\n  <style>\n    :host {\n      display: inline-block;\n      position: relative;\n    }\n    .trigger {\n      cursor: pointer;\n      padding: 8px 16px;\n      border: 1px solid #ddd;\n      border-radius: 4px;\n    }\n    .menu {\n      display: none;\n      position: absolute;\n      top: 100%;\n      left: 0;\n      background: white;\n      border: 1px solid #ddd;\n      border-radius: 4px;\n      margin-top: 4px;\n      min-width: 150px;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n    }\n    :host([open]) .menu {\n      display: block;\n    }\n    ::slotted(*) {\n      display: block;\n      padding: 8px 16px;\n      cursor: pointer;\n    }\n    ::slotted(*:hover) {\n      background: #f0f0f0;\n    }\n  </style>\n  \n  <div class="dropdown">\n    <div class="trigger">\n      <slot name="trigger">下拉菜单</slot>\n    </div>\n    <div class="menu">\n      <slot></slot>\n    </div>\n  </div>\n</template>\n\n<script>\nclass Dropdown extends HTMLElement {\n  constructor() {\n    super();\n    const template = document.getElementById("dropdown-template");\n    const shadow = this.attachShadow({ mode: "open" });\n    shadow.appendChild(template.content.cloneNode(true));\n    \n    this._open = false;\n  }\n  \n  connectedCallback() {\n    const trigger = this.shadowRoot.querySelector(".trigger");\n    trigger.addEventListener("click", () => this.toggle());\n    \n    document.addEventListener("click", (e) => {\n      if (!this.contains(e.target)) {\n        this.close();\n      }\n    });\n  }\n  \n  toggle() {\n    this._open = !this._open;\n    this.toggleAttribute("open", this._open);\n  }\n  \n  close() {\n    this._open = false;\n    this.removeAttribute("open");\n  }\n}\n\ncustomElements.define("my-dropdown", Dropdown);\n</script>\n\n<!-- 使用 -->\n<my-dropdown>\n  <span slot="trigger">选择操作</span>\n  <a href="#">编辑</a>\n  <a href="#">删除</a>\n  <a href="#">分享</a>\n</my-dropdown>',
                        content: "完整的下拉菜单组件。"
                    }
                ]
            },
            source: "Web Components规范"
        },
        {
            difficulty: "medium",
            tags: ["调试", "开发工具"],
            question: "如何调试HTML？",
            type: "multiple-choice",
            options: [
                "Chrome DevTools",
                "HTML验证器",
                "辅助功能审计",
                "性能分析"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML调试",
                description: "使用工具高效调试。",
                sections: [
                    {
                        title: "Chrome DevTools",
                        points: [
                            "Elements面板：查看和编辑DOM",
                            "Console：查看日志和错误",
                            "Network：查看资源加载",
                            "Performance：性能分析",
                            "Lighthouse：综合审计",
                            "快捷键：F12或Ctrl+Shift+I"
                        ]
                    },
                    {
                        title: "HTML验证",
                        code: '<!-- W3C HTML验证器 -->\nhttps://validator.w3.org/\n\n<!-- 常见错误 -->\n1. 未闭合标签\n2. 属性值未加引号\n3. ID重复\n4. 嵌套错误\n5. 废弃标签\n6. 缺少必需属性\n\n<!-- 命令行工具 -->\nnpm install -g html-validator-cli\nhtml-validator --file=index.html\n\n<!-- HTMLHint -->\nnpm install -g htmlhint\nhtmlhint index.html',
                        content: "验证HTML语法。"
                    },
                    {
                        title: "辅助功能审计",
                        code: '<!-- Lighthouse审计 -->\n1. Chrome DevTools > Lighthouse\n2. 选择Accessibility类别\n3. 生成报告\n\n<!-- axe DevTools扩展 -->\n安装axe DevTools扩展\n打开DevTools > axe面板\n运行扫描\n\n<!-- WAVE工具 -->\nhttps://wave.webaim.org/\n\n<!-- 键盘导航测试 -->\n1. 只使用Tab键导航\n2. 检查焦点可见性\n3. 测试所有交互\n4. 使用屏幕阅读器',
                        content: "测试可访问性。"
                    },
                    {
                        title: "性能调试",
                        code: '<!-- Performance面板 -->\n1. 开始录制\n2. 执行操作\n3. 停止录制\n4. 分析FPS、渲染、加载时间\n\n<!-- Lighthouse性能审计 -->\nFCP: First Contentful Paint\nLCP: Largest Contentful Paint\nTTI: Time to Interactive\nCLS: Cumulative Layout Shift\nTBT: Total Blocking Time\n\n<!-- Coverage工具 -->\n查看未使用的CSS/JS\nDevTools > More tools > Coverage\n\n<!-- Network瀑布图 -->\n查看资源加载顺序\n识别阻塞资源\n优化关键路径',
                        content: "分析性能问题。"
                    },
                    {
                        title: "调试技巧",
                        code: '<!-- 1. 断点调试 -->\n<button onclick="debugger; handleClick();">点击</button>\n\n<!-- 2. console技巧 -->\n<script>\nconsole.log("普通日志");\nconsole.warn("警告");\nconsole.error("错误");\nconsole.table([{a: 1}, {a: 2}]);\nconsole.time("timer");\n// ... 代码 ...\nconsole.timeEnd("timer");\n</script>\n\n<!-- 3. 临时编辑DOM -->\n// DevTools Console\ndocument.body.contentEditable = true;\n\n<!-- 4. 查找元素 -->\n// $0: 当前选中的元素\n// $1, $2...: 之前选中的元素\n$0.style.background = "red";\n\n<!-- 5. 监听事件 -->\nmonitorEvents(document.body, "click");\nunmonitorEvents(document.body);\n\n<!-- 6. 复制元素 -->\ncopy($0);  // 复制选中元素的HTML',
                        content: "实用调试技巧。"
                    }
                ]
            },
            source: "调试最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["国际化", "本地化"],
            question: "如何实现HTML国际化？",
            type: "multiple-choice",
            options: [
                "lang属性指定语言",
                "dir属性设置文本方向",
                "多语言内容",
                "格式化处理"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "国际化（i18n）",
                description: "支持多语言和地区。",
                sections: [
                    {
                        title: "lang属性",
                        code: '<!-- 全局语言 -->\n<html lang="zh-CN">\n  <!-- 中文简体 -->\n</html>\n\n<html lang="zh-TW">\n  <!-- 中文繁体 -->\n</html>\n\n<html lang="en-US">\n  <!-- 英语（美国） -->\n</html>\n\n<html lang="ja">\n  <!-- 日语 -->\n</html>\n\n<!-- 局部语言 -->\n<p>这是中文内容。</p>\n<p lang="en">This is English content.</p>\n<p lang="ja">これは日本語です。</p>\n\n<!-- 影响 -->\n1. 屏幕阅读器发音\n2. 浏览器翻译\n3. CSS引号样式\n4. 搜索引擎',
                        points: [
                            "html标签设置主语言",
                            "局部覆盖语言",
                            "使用BCP 47语言标签",
                            "影响辅助技术",
                            "有助于SEO"
                        ]
                    },
                    {
                        title: "文本方向",
                        code: '<!-- 从右到左语言 -->\n<html lang="ar" dir="rtl">\n  <!-- 阿拉伯语 -->\n</html>\n\n<html lang="he" dir="rtl">\n  <!-- 希伯来语 -->\n</html>\n\n<!-- 混合方向 -->\n<p dir="ltr">\n  英文 <span dir="rtl">العربية</span> 继续英文\n</p>\n\n<!-- CSS -->\n<style>\n/* 自动适配方向 */\n.element {\n  margin-inline-start: 20px;  /* 逻辑属性 */\n  padding-inline-end: 10px;\n}\n\n/* 而非 */\n.element {\n  margin-left: 20px;  /* 物理属性，不适配RTL */\n}\n</style>\n\n<!-- bdi元素（双向隔离） -->\n<p>用户 <bdi>المستخدم</bdi> 发表了评论</p>',
                        points: [
                            "dir='ltr' 从左到右",
                            "dir='rtl' 从右到左",
                            "使用逻辑CSS属性",
                            "bdi隔离双向文本"
                        ]
                    },
                    {
                        title: "多语言内容",
                        code: '<!-- 方案1：不同HTML文件 -->\nindex.html        （默认/英语）\nindex.zh-CN.html  （中文）\nindex.ja.html     （日语）\n\n<!-- 方案2：服务端渲染 -->\n// 检测Accept-Language\nconst lang = req.headers["accept-language"];\nrender(template, { lang, strings });\n\n<!-- 方案3：JavaScript切换 -->\n<select id="lang-select">\n  <option value="en">English</option>\n  <option value="zh">中文</option>\n  <option value="ja">日本語</option>\n</select>\n\n<script>\nconst strings = {\n  en: {\n    welcome: "Welcome",\n    greeting: "Hello"\n  },\n  zh: {\n    welcome: "欢迎",\n    greeting: "你好"\n  },\n  ja: {\n    welcome: "ようこそ",\n    greeting: "こんにちは"\n  }\n};\n\nfunction setLanguage(lang) {\n  document.documentElement.lang = lang;\n  document.querySelectorAll("[data-i18n]").forEach(el => {\n    const key = el.dataset.i18n;\n    el.textContent = strings[lang][key];\n  });\n}\n\ndocument.getElementById("lang-select").addEventListener("change", (e) => {\n  setLanguage(e.target.value);\n});\n</script>\n\n<h1 data-i18n="welcome"></h1>\n<p data-i18n="greeting"></p>',
                        content: "多种方式实现多语言。"
                    },
                    {
                        title: "日期时间格式化",
                        code: '<script>\n// Intl.DateTimeFormat\nconst date = new Date();\n\n// 中文\nconst zhFormat = new Intl.DateTimeFormat("zh-CN", {\n  year: "numeric",\n  month: "long",\n  day: "numeric"\n});\nconsole.log(zhFormat.format(date));\n// "2024年1月15日"\n\n// 英文\nconst enFormat = new Intl.DateTimeFormat("en-US", {\n  year: "numeric",\n  month: "long",\n  day: "numeric"\n});\nconsole.log(enFormat.format(date));\n// "January 15, 2024"\n\n// 日文\nconst jaFormat = new Intl.DateTimeFormat("ja-JP", {\n  year: "numeric",\n  month: "long",\n  day: "numeric"\n});\nconsole.log(jaFormat.format(date));\n// "2024年1月15日"\n</script>\n\n<!-- time元素 -->\n<time datetime="2024-01-15">\n  <span data-i18n-date="2024-01-15"></span>\n</time>',
                        content: "使用Intl API格式化。"
                    },
                    {
                        title: "数字和货币",
                        code: '<script>\nconst number = 1234567.89;\n\n// 中文\nconsole.log(new Intl.NumberFormat("zh-CN").format(number));\n// "1,234,567.89"\n\n// 货币\nconsole.log(new Intl.NumberFormat("zh-CN", {\n  style: "currency",\n  currency: "CNY"\n}).format(number));\n// "¥1,234,567.89"\n\nconsole.log(new Intl.NumberFormat("en-US", {\n  style: "currency",\n  currency: "USD"\n}).format(number));\n// "$1,234,567.89"\n\nconsole.log(new Intl.NumberFormat("ja-JP", {\n  style: "currency",\n  currency: "JPY"\n}).format(number));\n// "¥1,234,568"（日元无小数）\n</script>',
                        content: "格式化数字和货币。"
                    },
                    {
                        title: "字符编码",
                        code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <!-- UTF-8支持所有语言 -->\n  <meta charset="UTF-8">\n  <title>多语言网站</title>\n</head>\n<body>\n  <p>中文</p>\n  <p lang="en">English</p>\n  <p lang="ja">日本語</p>\n  <p lang="ar" dir="rtl">العربية</p>\n  <p lang="ko">한국어</p>\n  <p lang="ru">Русский</p>\n</body>\n</html>',
                        points: [
                            "始终使用UTF-8",
                            "meta charset第一行",
                            "服务器也要设置UTF-8",
                            "避免使用HTML实体"
                        ]
                    }
                ]
            },
            source: "国际化最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["移动端", "响应式"],
            question: "移动端HTML开发要注意什么？",
            type: "multiple-choice",
            options: [
                "viewport设置",
                "触摸友好",
                "性能优化",
                "设备特性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "移动端开发",
                description: "移动端特有的注意事项。",
                sections: [
                    {
                        title: "viewport设置",
                        code: '<!-- 基础viewport -->\n<meta name="viewport" \n      content="width=device-width, initial-scale=1.0">\n\n<!-- 禁止缩放 -->\n<meta name="viewport" \n      content="width=device-width, initial-scale=1.0, \n               maximum-scale=1.0, user-scalable=no">\n<!-- 注意：禁止缩放不利于可访问性 -->\n\n<!-- 完整配置 -->\n<meta name="viewport" \n      content="width=device-width,\n               initial-scale=1.0,\n               minimum-scale=1.0,\n               maximum-scale=5.0,\n               viewport-fit=cover">\n\n<!-- viewport-fit处理刘海屏 -->\nviewport-fit=contain  # 默认\nviewport-fit=cover    # 填充整个屏幕',
                        points: [
                            "width=device-width必需",
                            "initial-scale=1.0",
                            "谨慎禁止缩放",
                            "viewport-fit处理异形屏"
                        ]
                    },
                    {
                        title: "触摸友好",
                        code: '<!-- 足够大的点击区域 -->\n<style>\n.button {\n  min-width: 44px;   /* iOS推荐 */\n  min-height: 44px;\n  /* 或 */\n  min-width: 48px;   /* Material Design */\n  min-height: 48px;\n  \n  /* 间距 */\n  margin: 8px;\n}\n\n/* 移除点击高亮 */\n.no-highlight {\n  -webkit-tap-highlight-color: transparent;\n}\n\n/* 禁用iOS缩放双击 */\n* {\n  touch-action: manipulation;\n}\n</style>\n\n<!-- 触摸事件 -->\n<div id="touchable"></div>\n<script>\nconst el = document.getElementById("touchable");\n\nel.addEventListener("touchstart", (e) => {\n  // 触摸开始\n});\n\nel.addEventListener("touchmove", (e) => {\n  // 触摸移动\n  e.preventDefault();  // 阻止滚动\n});\n\nel.addEventListener("touchend", (e) => {\n  // 触摸结束\n});\n</script>',
                        points: [
                            "点击区域≥44x44px",
                            "足够的间距",
                            "移除点击高亮",
                            "touch-action优化",
                            "处理触摸事件"
                        ]
                    },
                    {
                        title: "移动端特性",
                        code: '<!-- 电话链接 -->\n<a href="tel:+8613800138000">拨打电话</a>\n\n<!-- 短信链接 -->\n<a href="sms:+8613800138000">发送短信</a>\n<a href="sms:+8613800138000?body=你好">带内容短信</a>\n\n<!-- 邮件 -->\n<a href="mailto:email@example.com">发邮件</a>\n\n<!-- 地图 -->\n<a href="geo:39.9,116.4">打开地图</a>\n<a href="https://maps.google.com/?q=北京">Google地图</a>\n\n<!-- iOS Safari特性 -->\n<!-- 添加到主屏幕 -->\n<link rel="apple-touch-icon" href="icon.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black">\n<meta name="apple-mobile-web-app-title" content="App名称">\n\n<!-- Android -->\n<meta name="mobile-web-app-capable" content="yes">\n<link rel="manifest" href="/manifest.json">',
                        content: "利用移动端特性。"
                    },
                    {
                        title: "性能优化",
                        code: '<!-- 1. 压缩图片 -->\n<picture>\n  <source media="(max-width: 600px)" srcset="small.webp">\n  <source media="(max-width: 1200px)" srcset="medium.webp">\n  <img src="large.webp" alt="图片" loading="lazy">\n</picture>\n\n<!-- 2. 懒加载 -->\n<img src="placeholder.jpg" \n     data-src="full.jpg"\n     loading="lazy"\n     alt="图片">\n\n<!-- 3. 减少资源 -->\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="dns-prefetch" href="https://cdn.example.com">\n\n<!-- 4. Critical CSS内联 -->\n<style>\n  /* 首屏样式 */\n</style>\n\n<!-- 5. 延迟加载JS -->\n<script defer src="app.js"></script>',
                        points: [
                            "响应式图片",
                            "懒加载",
                            "减少请求",
                            "关键资源内联",
                            "压缩资源"
                        ]
                    },
                    {
                        title: "输入优化",
                        code: '<!-- 移动端输入类型 -->\n<input type="tel" placeholder="手机号">\n<input type="email" placeholder="邮箱">\n<input type="url" placeholder="网址">\n<input type="number" placeholder="数字">\n<input type="search" placeholder="搜索">\n\n<!-- 输入模式 -->\n<input type="text" inputmode="numeric">  <!-- 数字键盘 -->\n<input type="text" inputmode="decimal">  <!-- 带小数点 -->\n<input type="text" inputmode="tel">      <!-- 电话键盘 -->\n<input type="text" inputmode="email">    <!-- 邮箱键盘 -->\n<input type="text" inputmode="url">      <!-- URL键盘 -->\n\n<!-- 自动完成 -->\n<input type="text" \n       autocomplete="name"\n       autocapitalize="words">  <!-- 首字母大写 -->\n\n<!-- 阻止自动缩放 -->\n<input type="text" style="font-size: 16px;">  <!-- ≥16px不缩放 -->',
                        content: "优化移动端输入体验。"
                    },
                    {
                        title: "PWA",
                        code: '<!-- manifest.json -->\n{\n  "name": "应用名称",\n  "short_name": "短名称",\n  "start_url": "/",\n  "display": "standalone",\n  "background_color": "#ffffff",\n  "theme_color": "#007bff",\n  "icons": [\n    {\n      "src": "/icon-192.png",\n      "sizes": "192x192",\n      "type": "image/png"\n    },\n    {\n      "src": "/icon-512.png",\n      "sizes": "512x512",\n      "type": "image/png"\n    }\n  ]\n}\n\n<!-- HTML -->\n<link rel="manifest" href="/manifest.json">\n<meta name="theme-color" content="#007bff">\n\n<!-- Service Worker -->\n<script>\nif ("serviceWorker" in navigator) {\n  navigator.serviceWorker.register("/sw.js");\n}\n</script>',
                        content: "实现PWA离线能力。"
                    }
                ]
            },
            source: "移动端最佳实践"
        }
    ],
    navigation: {
        prev: { title: "性能优化", url: "17-performance-quiz.html" },
        next: { title: "元数据管理", url: "19-metadata-quiz.html" }
    }
};
