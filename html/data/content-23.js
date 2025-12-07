// 第23章：安全基础 - 内容数据
window.htmlContentData_23 = {
    section: {
        title: "安全基础",
        icon: "🔒"
    },
    topics: [
        {
            type: "concept",
            title: "Web安全概述",
            content: {
                description: "Web安全是前端开发的重要组成部分。HTML作为网页的基础，需要防范各种安全威胁，包括XSS、CSRF、点击劫持等攻击。",
                keyPoints: [
                    "永远不要信任用户输入",
                    "XSS（跨站脚本攻击）是最常见的威胁",
                    "CSRF（跨站请求伪造）针对已登录用户",
                    "点击劫持通过iframe欺骗用户",
                    "使用HTTPS保护数据传输",
                    "Content Security Policy加强防护"
                ]
            }
        },
        {
            type: "comparison",
            title: "常见Web安全威胁",
            content: {
                description: "了解主要的Web安全威胁及其防护方法。",
                items: [
                    {
                        name: "XSS（跨站脚本攻击）",
                        pros: [],
                        cons: [
                            "注入恶意JavaScript代码",
                            "窃取Cookie和用户数据",
                            "劫持用户会话",
                            "篡改页面内容",
                            "重定向到恶意网站"
                        ]
                    },
                    {
                        name: "CSRF（跨站请求伪造）",
                        pros: [],
                        cons: [
                            "利用用户已登录状态",
                            "执行未授权操作",
                            "转账、修改密码等",
                            "用户不知情的情况下触发"
                        ]
                    },
                    {
                        name: "点击劫持",
                        pros: [],
                        cons: [
                            "透明iframe覆盖",
                            "诱导用户点击",
                            "执行意外操作",
                            "盗取敏感信息"
                        ]
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "安全的HTML属性",
            content: {
                description: "使用HTML属性增强安全性。",
                examples: [
                    {
                        title: "链接安全",
                        code: `<!-- ✅ 安全的外部链接 -->
<a href="https://example.com" 
   target="_blank"
   rel="noopener noreferrer">
    外部网站
</a>

<!-- rel属性说明：
     noopener: 防止新窗口访问window.opener
     noreferrer: 不发送Referer头
-->

<!-- ❌ 不安全的链接 -->
<a href="https://example.com" target="_blank">
    外部网站
</a>

<!-- 安全风险：
     新窗口可以通过window.opener修改原页面
     window.opener.location = 'http://phishing.com';
-->`,
                        notes: "外部链接必须添加rel=\"noopener noreferrer\""
                    },
                    {
                        title: "iframe安全",
                        code: `<!-- ✅ 安全的iframe -->
<iframe src="https://trusted.com/content"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy">
</iframe>

<!-- sandbox属性限制：
     (空值): 所有限制
     allow-forms: 允许表单提交
     allow-scripts: 允许脚本
     allow-same-origin: 允许同源
     allow-popups: 允许弹窗
     allow-top-navigation: 允许导航父页面
-->

<!-- ❌ 不安全的iframe -->
<iframe src="https://untrusted.com"></iframe>

<!-- 最严格的沙箱 -->
<iframe src="https://example.com" sandbox></iframe>`,
                        notes: "使用sandbox属性限制iframe权限"
                    },
                    {
                        title: "表单安全",
                        code: `<!-- ✅ 安全的表单 -->
<form action="/api/submit" 
      method="POST"
      autocomplete="off">
    
    <!-- 密码字段 -->
    <label for="password">密码：</label>
    <input type="password" 
           id="password"
           name="password"
           autocomplete="new-password"
           required>
    
    <!-- 防止自动填充敏感信息 -->
    <input type="text" 
           name="creditcard"
           autocomplete="off">
</form>

<!-- autocomplete属性：
     on: 允许自动填充（默认）
     off: 禁止自动填充
     new-password: 新密码
     current-password: 当前密码
-->`,
                        notes: "敏感表单禁用自动填充"
                    },
                    {
                        title: "下载安全",
                        code: `<!-- ✅ 安全的下载链接 -->
<a href="/files/document.pdf" 
   download="report.pdf"
   rel="noopener">
    下载报告
</a>

<!-- 强制下载而非打开 -->
<a href="/files/image.jpg" download>
    下载图片
</a>

<!-- ❌ 不安全：直接链接可执行文件 -->
<a href="/files/program.exe">下载</a>

<!-- 安全建议：
     1. 验证文件类型
     2. 限制文件大小
     3. 使用download属性
     4. 扫描病毒
-->`,
                        notes: "使用download属性控制文件下载"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Content Security Policy（CSP）",
            content: {
                description: "使用CSP防止XSS和其他注入攻击。",
                examples: [
                    {
                        title: "基础CSP设置",
                        code: `<!-- 方式1：HTTP响应头（推荐） -->
<!--
Content-Security-Policy: default-src 'self'; 
                         script-src 'self' https://trusted-cdn.com;
                         style-src 'self' 'unsafe-inline';
                         img-src 'self' data: https:;
-->

<!-- 方式2：meta标签 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://trusted-cdn.com; 
               style-src 'self' 'unsafe-inline';">

<!-- CSP指令说明：
     default-src: 默认策略
     script-src: JavaScript来源
     style-src: CSS来源
     img-src: 图片来源
     font-src: 字体来源
     connect-src: Ajax/WebSocket来源
     frame-src: iframe来源
-->`,
                        notes: "CSP是防止XSS的重要手段"
                    },
                    {
                        title: "严格的CSP",
                        code: `<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none';
               script-src 'self';
               style-src 'self';
               img-src 'self';
               font-src 'self';
               connect-src 'self';
               frame-ancestors 'none';
               base-uri 'self';
               form-action 'self';">

<!-- 最严格的CSP：
     - 禁止内联脚本和样式
     - 只允许同源资源
     - 禁止被嵌入iframe
     - 限制base标签
     - 限制表单提交
-->`,
                        notes: "生产环境应使用严格的CSP"
                    },
                    {
                        title: "CSP报告",
                        code: `<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self';
               report-uri /csp-report;
               report-to csp-endpoint;">

<!-- 仅报告模式（不阻止） -->
<meta http-equiv="Content-Security-Policy-Report-Only" 
      content="default-src 'self'; report-uri /csp-report;">

<!-- CSP违规报告示例：
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "violated-directive": "script-src",
    "blocked-uri": "https://evil.com/script.js",
    "line-number": 10,
    "source-file": "https://example.com/page"
  }
}
-->`,
                        notes: "CSP可以报告违规行为"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "防止点击劫持",
            content: {
                description: "使用HTTP头和CSP防止点击劫持。",
                examples: [
                    {
                        title: "X-Frame-Options",
                        code: `<!-- HTTP响应头设置（服务器端） -->
<!--
X-Frame-Options: DENY
// 完全禁止被嵌入iframe

X-Frame-Options: SAMEORIGIN
// 只允许同源页面嵌入

X-Frame-Options: ALLOW-FROM https://trusted.com
// 只允许指定域名嵌入（已废弃）
-->

<!-- CSP方式（推荐） -->
<meta http-equiv="Content-Security-Policy" 
      content="frame-ancestors 'none';">

<!-- frame-ancestors选项：
     'none': 禁止所有嵌入
     'self': 只允许同源
     https://trusted.com: 指定域名
-->`,
                        notes: "防止页面被恶意网站嵌入"
                    },
                    {
                        title: "JavaScript检测",
                        code: `<!-- 检测是否被嵌入iframe -->
<script>
if (window !== window.top) {
    // 页面被嵌入iframe中
    
    // 方式1：跳出iframe
    window.top.location = window.location;
    
    // 方式2：显示警告
    document.body.innerHTML = '<h1>此页面不允许被嵌入</h1>';
    
    // 方式3：隐藏内容
    document.body.style.display = 'none';
}
</script>

<!-- 注意：JavaScript防护可被绕过，
     应配合HTTP头使用 -->`,
                        notes: "JavaScript检测作为辅助手段"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "安全的cookie设置",
            content: {
                description: "正确设置cookie属性防止攻击。",
                examples: [
                    {
                        title: "cookie安全属性",
                        code: `<!-- HTTP响应头设置cookie -->
<!--
Set-Cookie: sessionId=abc123; 
            Secure; 
            HttpOnly; 
            SameSite=Strict; 
            Path=/; 
            Max-Age=3600

Cookie属性说明：

1. Secure
   - 只在HTTPS下传输
   - 防止中间人攻击

2. HttpOnly
   - 禁止JavaScript访问
   - 防止XSS窃取cookie

3. SameSite
   - Strict: 完全禁止跨站发送
   - Lax: GET请求可跨站（默认）
   - None: 允许跨站（需配合Secure）
   - 防止CSRF攻击

4. Domain
   - 指定cookie的域
   - 默认为当前域

5. Path
   - 指定cookie的路径
   - 默认为当前路径

6. Max-Age / Expires
   - 设置过期时间
-->`,
                        notes: "生产环境必须设置Secure和HttpOnly"
                    },
                    {
                        title: "JavaScript设置cookie",
                        code: `// ❌ 不安全的cookie
document.cookie = "token=abc123";

// ✅ 较安全的cookie（有限制）
document.cookie = "token=abc123; Secure; SameSite=Strict; Path=/; Max-Age=3600";

// 注意：JavaScript无法设置HttpOnly
// 敏感cookie应由服务器端设置

// 读取cookie
function getCookie(name) {
    const value = \`; \${document.cookie}\`;
    const parts = value.split(\`; \${name}=\`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}`,
                        notes: "敏感cookie应由服务器端设置HttpOnly"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "HTTPS和安全传输",
            content: {
                description: "确保使用HTTPS保护数据传输。",
                examples: [
                    {
                        title: "强制HTTPS",
                        code: `<!-- 1. HSTS（HTTP Strict Transport Security） -->
<!--
HTTP响应头：
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

参数说明：
- max-age: HTTPS有效期（秒）
- includeSubDomains: 包含所有子域
- preload: 加入HSTS预加载列表
-->

<!-- 2. 自动跳转HTTPS -->
<script>
if (location.protocol !== 'https:') {
    location.replace('https:' + location.href.substring(location.protocol.length));
}
</script>

<!-- 3. meta标签升级不安全请求 -->
<meta http-equiv="Content-Security-Policy" 
      content="upgrade-insecure-requests">`,
                        notes: "生产环境必须使用HTTPS"
                    },
                    {
                        title: "混合内容问题",
                        code: `<!-- HTTPS页面中的HTTP资源会被阻止 -->

<!-- ❌ 混合内容（被阻止） -->
<script src="http://example.com/script.js"></script>
<img src="http://example.com/image.jpg">

<!-- ✅ 使用HTTPS -->
<script src="https://example.com/script.js"></script>
<img src="https://example.com/image.jpg">

<!-- ✅ 协议相对URL -->
<script src="//example.com/script.js"></script>

<!-- 检测混合内容 -->
<script>
// 监听混合内容警告
window.addEventListener('securitypolicyviolation', (e) => {
    console.warn('Mixed content:', e.violatedDirective);
});
</script>`,
                        notes: "HTTPS页面不应加载HTTP资源"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "HTML安全最佳实践",
            content: {
                description: "保护Web应用安全的关键实践：",
                practices: [
                    {
                        title: "验证和过滤输入",
                        description: "永远不要信任用户输入。",
                        example: `// ❌ 危险：直接使用用户输入
element.innerHTML = userInput;

// ✅ 安全：转义HTML
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
element.textContent = userInput; // 更安全

// ✅ 验证输入
function validateEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}`
                    },
                    {
                        title: "使用安全的API",
                        description: "优先使用安全的DOM API。",
                        example: `// ❌ 危险
element.innerHTML = data;
eval(code);
new Function(code);

// ✅ 安全
element.textContent = data;
element.insertAdjacentText('beforeend', data);
JSON.parse(data);`
                    },
                    {
                        title: "实施CSP",
                        description: "使用Content Security Policy。",
                        example: `<!-- 严格的CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self';
               object-src 'none';
               base-uri 'self';
               form-action 'self';">`
                    },
                    {
                        title: "保护敏感数据",
                        description: "正确处理敏感信息。",
                        example: `// ❌ 危险：敏感数据存储在localStorage
localStorage.setItem('token', token);

// ✅ 较安全：使用HttpOnly cookie
// 由服务器设置

// ❌ 危险：URL中包含敏感信息
window.location = '/page?token=abc123';

// ✅ 安全：使用POST或存储
fetch('/api', {
    method: 'POST',
    body: JSON.stringify({ token })
});`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "HTML安全检查清单",
            content: {
                description: "确保Web应用的安全性：",
                items: [
                    { id: "check23-1", text: "所有外部链接使用rel=\"noopener noreferrer\"" },
                    { id: "check23-2", text: "iframe使用sandbox属性限制权限" },
                    { id: "check23-3", text: "实施Content Security Policy" },
                    { id: "check23-4", text: "使用HTTPS（生产环境）" },
                    { id: "check23-5", text: "设置HSTS头" },
                    { id: "check23-6", text: "Cookie设置Secure和HttpOnly" },
                    { id: "check23-7", text: "防止点击劫持（X-Frame-Options或CSP）" },
                    { id: "check23-8", text: "验证和过滤所有用户输入" },
                    { id: "check23-9", text: "避免使用innerHTML等危险API" },
                    { id: "check23-10", text: "敏感表单禁用autocomplete" },
                    { id: "check23-11", text: "定期安全审计和测试" },
                    { id: "check23-12", text: "保持依赖库更新" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "SEO优化", url: "content.html?chapter=22" },
        next: { title: "XSS防护", url: "content.html?chapter=24" }
    }
};
