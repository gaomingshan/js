# 第 23 章：XSS 防护 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | XSS 定义
### 题目
XSS 是什么？

**A.** 跨站脚本攻击 | **B.** SQL注入 | **C.** CSRF攻击 | **D.** DDoS攻击

<details><summary>查看答案</summary>
### ✅ 答案：A
XSS (Cross-Site Scripting) = 跨站脚本攻击，攻击者注入恶意脚本到页面中执行。
**来源：** OWASP
</details>

---

## 第 2 题 🟢 | XSS 类型
### 题目
XSS 的三种类型？**（多选）**

**A.** 存储型 | **B.** 反射型 | **C.** DOM型 | **D.** 传输型

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C
**来源：** XSS 分类
</details>

---

## 第 3 题 🟢 | 基本防护
### 题目
防止 XSS 的基本方法？

**A.** 转义输出 | **B.** 过滤输入 | **C.** 使用 HTTPS | **D.** A 和 B

<details><summary>查看答案</summary>
### ✅ 答案：D
```javascript
// 转义 HTML
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });
}
```
**来源：** XSS 防护基础
</details>

---

## 第 4 题 🟡 | 存储型 XSS
### 题目
存储型 XSS 的特点？

<details><summary>查看答案</summary>
### ✅ 答案
恶意脚本存储在服务器，每次访问都会执行：
```html
<!-- 攻击者提交评论 -->
<script>alert('XSS')</script>

<!-- 其他用户浏览评论时执行 -->
```
**防护：** 服务器端验证 + HTML转义
**来源：** 存储型 XSS
</details>

---

## 第 5 题 🟡 | 反射型 XSS
### 题目
反射型 XSS 的攻击场景？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- 恶意链接 -->
https://example.com/search?q=<script>alert('XSS')</script>

<!-- 页面直接输出 -->
<div>搜索结果：<script>alert('XSS')</script></div>
```
**防护：** URL 参数转义
**来源：** 反射型 XSS
</details>

---

## 第 6 题 🟡 | DOM 型 XSS
### 题目
DOM 型 XSS 的防护方法？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// ❌ 危险
element.innerHTML = userInput;

// ✅ 安全
element.textContent = userInput;

// ✅ 转义后使用
element.innerHTML = escapeHtml(userInput);
```
**来源：** DOM XSS 防护
</details>

---

## 第 7 题 🟡 | CSP
### 题目
CSP 如何防止 XSS？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://cdn.example.com">
```
**限制：**
- 脚本来源
- 禁止内联脚本
- 禁止 eval()
**来源：** CSP 规范
</details>

---

## 第 8 题 🔴 | 完整防护方案
### 题目
实现完整的 XSS 防护。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 1. HTML 转义
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 2. URL 编码
function encodeUrl(str) {
  return encodeURIComponent(str);
}

// 3. 安全插入
function safeInsert(element, html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  element.appendChild(temp.firstChild);
}

// 4. DOMPurify（推荐）
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(dirtyHtml);
```
**来源：** XSS 防护最佳实践
</details>

---

## 第 9 题 🔴 | HttpOnly Cookie
### 题目
HttpOnly 如何防止 XSS 窃取 Cookie？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 服务器设置
res.cookie('session', 'xxx', {
  httpOnly: true,  // JavaScript 无法访问
  secure: true,    // 仅 HTTPS
  sameSite: 'strict'
});

// ❌ JavaScript 无法读取
document.cookie // 不包含 httpOnly cookie
```
**来源：** Cookie 安全
</details>

---

## 第 10 题 🔴 | 综合案例
### 题目
评论系统的 XSS 防护。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 客户端
function submitComment() {
  const content = commentInput.value;
  
  // 基本验证（不依赖）
  if (content.length > 1000) {
    alert('评论过长');
    return;
  }
  
  fetch('/api/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
}

// 服务器端（Node.js）
const DOMPurify = require('isomorphic-dompurify');

app.post('/api/comment', (req, res) => {
  let { content } = req.body;
  
  // 1. 长度验证
  if (content.length > 1000) {
    return res.status(400).json({ error: '评论过长' });
  }
  
  // 2. HTML 净化
  content = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
  
  // 3. 存储
  db.comments.insert({ content });
  
  res.json({ success: true });
});

// 渲染评论
function renderComments(comments) {
  comments.forEach(comment => {
    const div = document.createElement('div');
    // 使用 textContent（安全）
    div.textContent = comment.content;
    // 或已净化的 HTML
    // div.innerHTML = comment.content;
    container.appendChild(div);
  });
}
```
**来源：** XSS 防护实战
</details>

---

**📌 本章总结**
- XSS = 跨站脚本攻击
- 三种类型：存储型、反射型、DOM型
- 防护：转义输出、验证输入
- CSP：限制脚本来源
- HttpOnly：保护Cookie
- DOMPurify：HTML净化库

**上一章** ← [第 22 章：SEO优化](./chapter-22.md)  
**下一章** → [第 24 章：CSRF防护](./chapter-24.md)
