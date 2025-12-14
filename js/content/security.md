# 安全防护实践

## 概述

Web 安全是前端开发的重要组成部分，了解常见安全问题和防护措施至关重要。

---

## 一、XSS（跨站脚本攻击）

### 1.1 什么是 XSS

攻击者将恶意脚本注入到网页中，在用户浏览器执行。

**类型**：
- **存储型 XSS**：恶意脚本存储在服务器
- **反射型 XSS**：恶意脚本在 URL 中
- **DOM 型 XSS**：通过修改 DOM 执行

### 1.2 防护措施

```js
// ❌ 危险：直接插入 HTML
element.innerHTML = userInput;

// ✅ 安全：使用 textContent
element.textContent = userInput;

// ✅ 转义 HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

element.innerHTML = escapeHTML(userInput);

// ✅ 使用安全的 API
const text = document.createTextNode(userInput);
element.appendChild(text);
```

### 1.3 Content Security Policy

```html
<!-- 设置 CSP 头 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://trusted.cdn.com">
```

```js
// 避免内联脚本
// ❌ 不安全
<script>alert('XSS')</script>

// ✅ 使用外部脚本
<script src="app.js"></script>
```

---

## 二、CSRF（跨站请求伪造）

### 2.1 什么是 CSRF

攻击者诱导用户在已登录的网站上执行非预期操作。

### 2.2 防护措施

```js
// 1. CSRF Token
const token = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token
  },
  body: JSON.stringify({ amount: 100 })
});

// 2. SameSite Cookie
// Set-Cookie: sessionid=xxx; SameSite=Strict

// 3. 验证 Referer
fetch('/api/sensitive', {
  headers: {
    'Referer': window.location.origin
  }
});

// 4. 双重提交 Cookie
const csrfToken = getCookie('csrf_token');
fetch('/api/action', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

---

## 三、点击劫持（Clickjacking）

### 3.1 什么是点击劫持

攻击者使用透明 iframe 覆盖页面，诱导用户点击。

### 3.2 防护措施

```js
// X-Frame-Options 头
// X-Frame-Options: DENY
// X-Frame-Options: SAMEORIGIN

// 使用 CSP
// Content-Security-Policy: frame-ancestors 'self'

// JavaScript 检测
if (window.top !== window.self) {
  window.top.location = window.self.location;
}
```

---

## 四、SQL 注入（前端角度）

### 4.1 防护措施

```js
// ❌ 拼接 SQL（后端问题，但前端也要注意）
const query = `SELECT * FROM users WHERE name = '${userName}'`;

// ✅ 参数化查询（后端）
// SELECT * FROM users WHERE name = ?

// 前端：验证和清理输入
function sanitizeInput(input) {
  // 移除特殊字符
  return input.replace(/['";\-\-]/g, '');
}

const cleanInput = sanitizeInput(userInput);
```

---

## 五、敏感数据保护

### 5.1 本地存储安全

```js
// ❌ 存储敏感信息在 localStorage
localStorage.setItem('password', userPassword);
localStorage.setItem('creditCard', cardNumber);

// ✅ 不要存储敏感信息
// ✅ 如果必须存储，使用加密
import CryptoJS from 'crypto-js';

const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
sessionStorage.setItem('data', encrypted);

// 读取时解密
const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey);
const data = decrypted.toString(CryptoJS.enc.Utf8);
```

### 5.2 HTTPS

```js
// 强制使用 HTTPS
if (location.protocol !== 'https:') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}

// 检测混合内容
if (window.location.protocol === 'https:') {
  // 确保所有资源都使用 HTTPS
  const images = document.querySelectorAll('img[src^="http:"]');
  if (images.length > 0) {
    console.warn('检测到非 HTTPS 资源');
  }
}
```

---

## 六、输入验证

### 6.1 前端验证

```js
// 验证邮箱
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 验证 URL
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 限制输入长度
function validateLength(input, min, max) {
  return input.length >= min && input.length <= max;
}

// 白名单验证
function validateInput(input, allowedChars) {
  const regex = new RegExp(`^[${allowedChars}]+$`);
  return regex.test(input);
}
```

### 6.2 服务端验证

```js
// ⚠️ 前端验证不能替代服务端验证
// 前端验证只是第一道防线，提升用户体验
// 必须在服务端再次验证
```

---

## 七、依赖安全

### 7.1 定期更新依赖

```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update

# 审计依赖
npm audit

# 修复漏洞
npm audit fix
```

### 7.2 使用可信来源

```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

### 7.3 锁定版本

```bash
# 使用 package-lock.json
npm install

# 或 yarn.lock
yarn install
```

---

## 八、安全的第三方脚本

### 8.1 使用 SRI（子资源完整性）

```html
<!-- 使用 SRI 验证 CDN 资源 -->
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous">
</script>
```

### 8.2 审查第三方脚本

```js
// 避免使用不可信的第三方脚本
// 定期审查第三方脚本的更新
```

---

## 九、安全的 API 调用

### 9.1 认证和授权

```js
// 使用 JWT
const token = localStorage.getItem('token');

fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 刷新 token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('/api/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    }
  });
  const { token } = await response.json();
  localStorage.setItem('token', token);
}
```

### 9.2 CORS 配置

```js
// 后端正确配置 CORS
// Access-Control-Allow-Origin: https://trusted-domain.com
// Access-Control-Allow-Credentials: true

// 前端发送凭证
fetch('/api/data', {
  credentials: 'include'
});
```

---

## 十、安全检查清单

### 开发阶段
- [ ] 输入验证和清理
- [ ] 输出编码
- [ ] 使用参数化查询
- [ ] 设置 CSP
- [ ] 使用 HTTPS
- [ ] 设置安全的 Cookie 属性

### 部署阶段
- [ ] 启用 HTTPS
- [ ] 设置安全响应头
- [ ] 配置 CORS
- [ ] 启用防火墙
- [ ] 定期更新依赖

### 运行阶段
- [ ] 日志监控
- [ ] 安全审计
- [ ] 漏洞扫描
- [ ] 事件响应计划

---

## 参考资料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN - Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
