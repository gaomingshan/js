# 第 24 章：CSRF 防护 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | CSRF 定义
### 题目
CSRF 是什么？

**A.** 跨站请求伪造 | **B.** SQL注入 | **C.** XSS攻击 | **D.** 点击劫持

<details><summary>查看答案</summary>
### ✅ 答案：A
CSRF (Cross-Site Request Forgery) = 跨站请求伪造，利用用户身份发起恶意请求。
**来源：** OWASP
</details>

---

## 第 2 题 🟢 | CSRF Token
### 题目
CSRF Token 的作用？

**A.** 验证用户身份 | **B.** 验证请求来源 | **C.** 加密数据 | **D.** 存储数据

<details><summary>查看答案</summary>
### ✅ 答案：B
```html
<form method="POST">
  <input type="hidden" name="_csrf" value="random_token">
  <button>提交</button>
</form>
```
**来源：** CSRF 防护
</details>

---

## 第 3 题 🟢 | SameSite Cookie
### 题目
`SameSite` 属性的作用？

**A.** 限制跨站发送Cookie | **B.** 加密Cookie | **C.** 删除Cookie | **D.** 压缩Cookie

<details><summary>查看答案</summary>
### ✅ 答案：A
```javascript
res.cookie('session', 'xxx', {
  sameSite: 'strict'  // 完全禁止跨站
  // sameSite: 'lax'  // 部分允许
  // sameSite: 'none' // 允许跨站（需HTTPS）
});
```
**来源：** SameSite Cookies
</details>

---

## 第 4 题 🟡 | CSRF 攻击场景
### 题目
描述一个 CSRF 攻击流程。

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- 1. 用户登录 bank.com -->
<!-- 2. 攻击者发送钓鱼邮件 -->

<!-- evil.com 页面 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">

<!-- 3. 用户点击链接，浏览器自动携带 bank.com 的 Cookie -->
<!-- 4. 转账成功 -->
```
**来源：** CSRF 攻击示例
</details>

---

## 第 5 题 🟡 | Double Submit Cookie
### 题目
Double Submit Cookie 模式？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 1. 设置 Cookie
res.cookie('csrf-token', token);

// 2. 表单包含相同 token
<input type="hidden" name="csrf-token" value="token">

// 3. 服务器验证
if (req.cookies['csrf-token'] !== req.body['csrf-token']) {
  return res.status(403).send('CSRF 验证失败');
}
```
**来源：** CSRF 防护模式
</details>

---

## 第 6 题 🟡 | Referer 检查
### 题目
Referer 检查的局限性？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 检查 Referer
app.post('/transfer', (req, res) => {
  const referer = req.headers.referer;
  
  if (!referer || !referer.startsWith('https://bank.com')) {
    return res.status(403).send('非法请求');
  }
  
  // 处理请求
});
```

**局限：**
- Referer 可能为空
- 用户可能禁用 Referer
- HTTPS → HTTP 不发送 Referer
**来源：** Referer 验证
</details>

---

## 第 7 题 🟡 | 自定义请求头
### 题目
如何使用自定义请求头防护 CSRF？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 客户端
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCsrfToken(),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// 服务器
app.post('/api/transfer', (req, res) => {
  const token = req.headers['x-csrf-token'];
  
  if (!validateToken(token)) {
    return res.status(403).json({ error: 'CSRF 验证失败' });
  }
  
  // 处理请求
});
```
**原理：** 跨域请求无法设置自定义请求头（需CORS）
**来源：** CSRF 防护策略
</details>

---

## 第 8 题 🔴 | 完整 CSRF 防护
### 题目
实现完整的 CSRF 防护系统。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// csrf.js
const crypto = require('crypto');
const tokens = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function csrfMiddleware(req, res, next) {
  // 生成 token
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  
  // 暴露给模板
  res.locals.csrfToken = req.session.csrfToken;
  
  // GET 请求跳过验证
  if (req.method === 'GET') {
    return next();
  }
  
  // 验证 token
  const token = req.body._csrf || req.headers['x-csrf-token'];
  
  if (token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF 验证失败' });
  }
  
  next();
}

// app.js
app.use(session({ secret: 'xxx' }));
app.use(csrfMiddleware);

// 表单
<form method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <button>提交</button>
</form>

// Ajax
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.querySelector('[name="_csrf"]').value
  }
});
```
**来源：** CSRF 中间件
</details>

---

## 第 9 题 🔴 | SameSite 配置
### 题目
不同 SameSite 值的区别？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// Strict：完全禁止跨站
res.cookie('session', 'xxx', { sameSite: 'strict' });
// 场景：从 google.com 点击链接到 bank.com
// 结果：不发送 Cookie，用户需重新登录

// Lax：部分允许（默认）
res.cookie('session', 'xxx', { sameSite: 'lax' });
// 允许：顶级导航（<a>链接）
// 禁止：<img>, <iframe>, fetch, XHR

// None：允许跨站（需 HTTPS）
res.cookie('session', 'xxx', { 
  sameSite: 'none',
  secure: true  // 必须
});
// 场景：嵌入第三方页面的组件
```

**选择建议：**
- 默认用 `Lax`
- 高安全场景用 `Strict`
- 跨站组件用 `None`

**来源：** SameSite Cookies 详解
</details>

---

## 第 10 题 🔴 | CSRF vs XSS
### 题目
对比 CSRF 和 XSS。

<details><summary>查看答案</summary>
### ✅ 答案

| 特性 | CSRF | XSS |
|------|------|-----|
| **全称** | 跨站请求伪造 | 跨站脚本攻击 |
| **攻击方式** | 利用用户身份发请求 | 注入恶意脚本 |
| **是否需要登录** | 需要 | 不需要 |
| **能否获取数据** | 不能 | 能 |
| **能否执行代码** | 不能 | 能 |
| **防护** | Token、SameSite | 转义、CSP |

**CSRF 示例：**
```html
<!-- 攻击者网站 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">
```

**XSS 示例：**
```html
<!-- 受害网站 -->
<div>评论：<script>alert(document.cookie)</script></div>
```

**联合攻击：**
XSS 可以绕过 CSRF 防护（读取页面中的 Token）

**来源：** Web 安全对比
</details>

---

**📌 本章总结**
- CSRF = 跨站请求伪造
- 防护：Token、SameSite、Referer、自定义头
- Token 放在：表单隐藏域、请求头
- SameSite：Strict > Lax > None
- Double Submit Cookie：Cookie + 表单同时验证
- 与 XSS 区别：CSRF利用身份，XSS注入代码

**上一章** ← [第 23 章：XSS防护](./chapter-23.md)  
**下一章** → [第 25 章：性能优化基础](./chapter-25.md)
