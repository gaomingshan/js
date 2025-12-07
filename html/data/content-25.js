// 第25章：CSRF防护 - 内容数据
window.htmlContentData_25 = {
    section: {
        title: "CSRF防护",
        icon: "🔐"
    },
    topics: [
        {
            type: "concept",
            title: "CSRF攻击详解",
            content: {
                description: "CSRF（Cross-Site Request Forgery，跨站请求伪造）利用用户已登录的身份，在用户不知情的情况下执行非预期的操作，如转账、修改密码等。",
                keyPoints: [
                    "利用用户的登录状态（cookie）",
                    "在第三方网站发起请求",
                    "用户不知情的情况下执行操作",
                    "GET请求和POST请求都可能受攻击",
                    "防护需要验证请求来源",
                    "CSRF Token是主要防御手段"
                ]
            }
        },
        {
            type: "code-example",
            title: "CSRF攻击示例",
            content: {
                description: "了解CSRF攻击的工作原理。",
                examples: [
                    {
                        title: "GET请求攻击",
                        code: `<!-- 场景：用户登录了bank.com -->

<!-- 1. 正常转账链接 -->
https://bank.com/transfer?to=账户A&amount=100

<!-- 2. 攻击者在evil.com创建页面 -->
<!DOCTYPE html>
<html>
<head>
    <title>免费礼品！</title>
</head>
<body>
    <h1>恭喜！点击领取免费礼品</h1>
    
    <!-- ❌ 隐藏的恶意请求 -->
    <img src="https://bank.com/transfer?to=攻击者账户&amount=10000" 
         style="display:none">
    
    <!-- 或使用iframe -->
    <iframe src="https://bank.com/transfer?to=攻击者账户&amount=10000"
            style="display:none">
    </iframe>
</body>
</html>

<!-- 3. 用户访问evil.com -->
<!-- 4. 浏览器自动发送请求到bank.com，携带cookie -->
<!-- 5. 转账成功，用户不知情 -->`,
                        notes: "GET请求不应有副作用"
                    },
                    {
                        title: "POST请求攻击",
                        code: `<!-- 攻击者页面 -->
<!DOCTYPE html>
<html>
<body>
    <h1>精彩内容加载中...</h1>
    
    <!-- ❌ 自动提交的表单 -->
    <form id="csrf-form" 
          action="https://bank.com/transfer" 
          method="POST"
          style="display:none">
        <input name="to" value="攻击者账户">
        <input name="amount" value="10000">
    </form>
    
    <script>
    // 页面加载后自动提交
    document.getElementById('csrf-form').submit();
    </script>
</body>
</html>

<!-- 结果：
     1. 用户访问攻击页面
     2. 表单自动提交到bank.com
     3. 请求携带用户的cookie
     4. 转账成功
-->`,
                        notes: "POST请求也可能受CSRF攻击"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "CSRF Token防护",
            content: {
                description: "使用CSRF Token验证请求来源。",
                examples: [
                    {
                        title: "生成和使用Token",
                        code: `<!-- 1. 服务器生成CSRF Token -->
<!--
服务器端（例如Node.js）:
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
// 存储在session中
req.session.csrfToken = token;
-->

<!-- 2. 在表单中嵌入Token -->
<form action="/transfer" method="POST">
    <!-- Hidden字段包含CSRF Token -->
    <input type="hidden" 
           name="_csrf" 
           value="<%%= csrfToken %%>">
    
    <label>
        收款账户：
        <input type="text" name="to" required>
    </label>
    
    <label>
        金额：
        <input type="number" name="amount" required>
    </label>
    
    <button type="submit">转账</button>
</form>

<!-- 3. 服务器验证Token -->
<!--
if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send('Invalid CSRF token');
}
// 处理请求
-->`,
                        notes: "CSRF Token是最有效的防护方法"
                    },
                    {
                        title: "Ajax请求中的Token",
                        code: `<!-- 1. 在meta标签中存储Token -->
<meta name="csrf-token" content="<%%= csrfToken %%>">

<!-- 2. JavaScript读取并发送Token -->
<script>
// 方式1：从meta标签读取
const token = document.querySelector('meta[name="csrf-token"]').content;

// 方式2：发送在请求头中
fetch('/api/transfer', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
    },
    body: JSON.stringify({
        to: '账户',
        amount: 100
    })
});

// 方式3：发送在请求体中
fetch('/api/transfer', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        _csrf: token,
        to: '账户',
        amount: 100
    })
});

// 全局设置（axios示例）
axios.defaults.headers.common['X-CSRF-Token'] = token;
</script>`,
                        notes: "Ajax请求也需要包含CSRF Token"
                    },
                    {
                        title: "动态表单",
                        code: `<!-- 动态创建表单时添加Token -->
<script>
function createTransferForm() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/transfer';
    
    // 添加CSRF Token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_csrf';
    csrfInput.value = document.querySelector('meta[name="csrf-token"]').content;
    form.appendChild(csrfInput);
    
    // 添加其他字段
    const toInput = document.createElement('input');
    toInput.name = 'to';
    toInput.value = '账户';
    form.appendChild(toInput);
    
    document.body.appendChild(form);
    form.submit();
}
</script>`,
                        notes: "动态表单也要包含CSRF Token"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "SameSite Cookie",
            content: {
                description: "使用SameSite属性防止CSRF。",
                examples: [
                    {
                        title: "SameSite属性",
                        code: `<!-- 服务器端设置Cookie -->
<!--
Set-Cookie: sessionId=abc123; 
            SameSite=Strict; 
            Secure; 
            HttpOnly

SameSite属性值：

1. Strict（最严格）
   - 完全禁止跨站发送cookie
   - 从第三方网站跳转过来也不发送
   - 适用于敏感操作

2. Lax（默认，较宽松）
   - 允许部分跨站请求发送cookie
   - GET导航请求可以发送
   - POST、图片、iframe等不发送
   - 适用于大多数场景

3. None（不限制）
   - 允许所有跨站请求
   - 必须配合Secure使用（HTTPS）
   - 适用于需要跨站的场景
-->

<!-- 示例 -->
<!--
// 严格模式
Set-Cookie: session=abc; SameSite=Strict

// 宽松模式（默认）
Set-Cookie: session=abc; SameSite=Lax

// 不限制（需HTTPS）
Set-Cookie: session=abc; SameSite=None; Secure
-->`,
                        notes: "SameSite=Strict可防止大多数CSRF"
                    },
                    {
                        title: "SameSite的限制",
                        code: `<!-- SameSite=Strict的影响 -->

<!-- 场景1：用户从邮件点击链接 -->
<!-- 邮件：https://email.com -->
<!-- 链接：https://bank.com/dashboard -->
<!-- 结果：session cookie不发送，需要重新登录 -->

<!-- 场景2：从社交媒体分享 -->
<!-- 分享：https://facebook.com -->
<!-- 目标：https://bank.com/article -->
<!-- 结果：session cookie不发送 -->

<!-- 解决方案： -->
<!-- 1. 使用SameSite=Lax（推荐） -->
Set-Cookie: session=abc; SameSite=Lax

<!-- 2. 结合CSRF Token -->
<!-- Lax模式 + CSRF Token = 最佳实践 -->`,
                        notes: "Strict可能影响用户体验，推荐Lax"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "验证Referer和Origin",
            content: {
                description: "检查请求来源防止CSRF。",
                examples: [
                    {
                        title: "服务器端验证",
                        code: `<!-- 服务器端代码（Node.js示例） -->

// 验证Referer头
function validateReferer(req, res, next) {
    const referer = req.get('Referer');
    const host = req.get('Host');
    
    if (!referer) {
        return res.status(403).send('Missing Referer');
    }
    
    const refererHost = new URL(referer).host;
    if (refererHost !== host) {
        return res.status(403).send('Invalid Referer');
    }
    
    next();
}

// 验证Origin头（更可靠）
function validateOrigin(req, res, next) {
    const origin = req.get('Origin');
    const allowedOrigins = ['https://example.com', 'https://www.example.com'];
    
    if (!origin) {
        // 某些请求可能没有Origin头
        return next();
    }
    
    if (!allowedOrigins.includes(origin)) {
        return res.status(403).send('Invalid Origin');
    }
    
    next();
}

// 使用中间件
app.post('/transfer', validateOrigin, (req, res) => {
    // 处理转账
});`,
                        notes: "验证Referer和Origin作为辅助手段"
                    },
                    {
                        title: "注意事项",
                        code: `<!-- Referer和Origin的限制 -->

// 1. Referer可能被浏览器或代理隐藏
// 2. 某些隐私保护工具会移除Referer
// 3. HTTPS到HTTP的跳转不发送Referer
// 4. 不应作为唯一防护手段

<!-- 最佳实践： -->
// 1. CSRF Token（主要）
// 2. SameSite Cookie
// 3. Origin/Referer验证（辅助）
// 4. 重要操作需要二次确认`,
                        notes: "不应单独依赖Referer/Origin验证"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "其他防护措施",
            content: {
                description: "补充的CSRF防护方法。",
                examples: [
                    {
                        title: "双重Cookie验证",
                        code: `<!-- 双重Cookie模式 -->

<!-- 1. 设置CSRF Cookie -->
<!--
Set-Cookie: csrf_token=abc123; Path=/; SameSite=Strict
-->

<!-- 2. 在请求中同时发送Token -->
<script>
function getCookie(name) {
    const value = \`; \${document.cookie}\`;
    const parts = value.split(\`; \${name}=\`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

const csrfToken = getCookie('csrf_token');

fetch('/api/transfer', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
});
</script>

<!-- 3. 服务器验证 -->
<!--
const cookieToken = req.cookies.csrf_token;
const headerToken = req.get('X-CSRF-Token');

if (!cookieToken || cookieToken !== headerToken) {
    return res.status(403).send('CSRF validation failed');
}
-->`,
                        notes: "双重Cookie验证无需服务器端session"
                    },
                    {
                        title: "重要操作二次确认",
                        code: `<!-- 敏感操作需要额外验证 -->

<!-- 1. 密码确认 -->
<form action="/delete-account" method="POST">
    <input type="hidden" name="_csrf" value="<%%= csrfToken %%>">
    
    <label>
        确认密码：
        <input type="password" name="password" required>
    </label>
    
    <button type="submit">删除账户</button>
</form>

<!-- 2. 验证码 -->
<form action="/transfer" method="POST">
    <input type="hidden" name="_csrf" value="<%%= csrfToken %%>">
    
    <!-- 其他字段 -->
    
    <label>
        验证码：
        <input type="text" name="captcha" required>
    </label>
    <img src="/captcha" alt="验证码">
    
    <button type="submit">确认转账</button>
</form>

<!-- 3. 短信/邮件确认 -->
<form action="/bind-phone" method="POST">
    <input type="hidden" name="_csrf" value="<%%= csrfToken %%>">
    
    <label>
        手机号：
        <input type="tel" name="phone" required>
    </label>
    
    <label>
        验证码：
        <input type="text" name="sms_code" required>
    </label>
    
    <button type="submit">绑定</button>
</form>`,
                        notes: "重要操作增加额外验证"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "CSRF防护最佳实践",
            content: {
                description: "全面防护CSRF攻击：",
                practices: [
                    {
                        title: "使用CSRF Token",
                        description: "所有状态改变操作都需要Token。",
                        example: `<form method="POST">
    <input type="hidden" name="_csrf" value="<%%= token %%>">
    <!-- 表单字段 -->
</form>`
                    },
                    {
                        title: "设置SameSite Cookie",
                        description: "使用SameSite=Lax或Strict。",
                        example: `Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly`
                    },
                    {
                        title: "遵循REST原则",
                        description: "GET请求不应有副作用。",
                        example: `// ❌ 错误：GET请求修改数据
app.get('/delete-user', (req, res) => {
    deleteUser(req.query.id);
});

// ✅ 正确：使用POST/DELETE
app.delete('/users/:id', (req, res) => {
    deleteUser(req.params.id);
});`
                    },
                    {
                        title: "验证请求来源",
                        description: "检查Origin和Referer头。",
                        example: `app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).send('Forbidden');
    }
    next();
});`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "CSRF防护检查清单",
            content: {
                description: "确保全面防护CSRF攻击：",
                items: [
                    { id: "check25-1", text: "所有POST/PUT/DELETE请求使用CSRF Token" },
                    { id: "check25-2", text: "Cookie设置SameSite=Lax或Strict" },
                    { id: "check25-3", text: "验证Origin和Referer头" },
                    { id: "check25-4", text: "GET请求不修改数据" },
                    { id: "check25-5", text: "重要操作需要二次确认" },
                    { id: "check25-6", text: "Ajax请求包含CSRF Token" },
                    { id: "check25-7", text: "动态表单包含CSRF Token" },
                    { id: "check25-8", text: "使用HTTPS" },
                    { id: "check25-9", text: "定期更新CSRF Token" },
                    { id: "check25-10", text: "测试CSRF防护有效性" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "XSS防护", url: "content.html?chapter=24" },
        next: { title: "性能优化", url: "content.html?chapter=26" }
    }
};
