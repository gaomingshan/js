# 第 24 章：CSRF 防护

## 概述

CSRF（Cross-Site Request Forgery）跨站请求伪造攻击利用用户身份执行非授权操作。

## 一、CSRF 攻击原理

```html
<!-- 攻击者的页面 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">

<!-- 或表单自动提交 -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit();</script>
```

## 二、防御措施

### 2.1 CSRF Token

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="<?php echo $token; ?>">
  <input type="text" name="amount">
  <button>提交</button>
</form>
```

### 2.2 SameSite Cookie

```
Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly
```

### 2.3 验证 Referer

```javascript
// 服务器端检查
if (req.headers.referer !== 'https://trusted-site.com') {
  return res.status(403).send('Forbidden');
}
```

### 2.4 双重 Cookie

```javascript
// 设置 cookie
document.cookie = 'csrf_token=' + token;

// 请求时发送
fetch('/api', {
  headers: {
    'X-CSRF-Token': getCookie('csrf_token')
  }
});
```

## 参考资料

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**上一章** ← [第 23 章：XSS 防护](./23-xss-protection.md)  
**下一章** → [第 25 章：性能优化基础](./25-performance-basics.md)
