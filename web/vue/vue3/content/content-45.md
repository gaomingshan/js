# 安全最佳实践

> 构建安全的 Vue 3 应用，防范常见安全威胁。

## XSS 防护

### 自动转义

Vue 默认对插值内容进行转义：

```vue
<template>
  <!-- ✅ 安全：自动转义 -->
  <div>{{ userInput }}</div>
  <!-- 输出：&lt;script&gt;alert('xss')&lt;/script&gt; -->
  
  <!-- ❌ 危险：使用 v-html -->
  <div v-html="userInput"></div>
  <!-- 输出：<script>alert('xss')</script> 会执行！ -->
</template>
```

### 安全使用 v-html

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  })
}
```

```vue
<script setup>
import { sanitizeHtml } from '@/utils/sanitize'

const props = defineProps<{
  content: string
}>()

const safeContent = computed(() => sanitizeHtml(props.content))
</script>

<template>
  <div v-html="safeContent"></div>
</template>
```

### URL 处理

```typescript
// ❌ 危险
<a :href="userProvidedUrl">Link</a>

// ✅ 安全
<script setup>
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

const safeUrl = computed(() => {
  return isSafeUrl(props.url) ? props.url : '#'
})
</script>

<template>
  <a :href="safeUrl">Link</a>
</template>
```

---

## CSRF 防护

### CSRF Token

```typescript
// api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// 添加 CSRF Token
api.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  
  if (token) {
    config.headers['X-CSRF-Token'] = token
  }
  
  return config
})

export default api
```

```html
<!-- index.html -->
<meta name="csrf-token" content="{{ csrfToken }}">
```

### SameSite Cookie

```typescript
// 服务端设置
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})
```

---

## 认证与授权

### JWT 存储

```typescript
// ❌ 不安全：存储在 localStorage
localStorage.setItem('token', jwt)

// ✅ 推荐：使用 HttpOnly Cookie
// 服务端设置
res.cookie('token', jwt, {
  httpOnly: true,  // 防止 JavaScript 访问
  secure: true,    // 仅 HTTPS
  sameSite: 'strict'
})

// 客户端请求时自动携带
axios.get('/api/protected', {
  withCredentials: true
})
```

### Token 刷新

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  
  async function refresh() {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken
    } catch (error) {
      // Token 失效，跳转登录
      await logout()
    }
  }
  
  // 自动刷新
  setInterval(() => {
    if (token.value) {
      refresh()
    }
  }, 14 * 60 * 1000) // 14分钟刷新一次
  
  return { token, refreshToken, refresh }
})
```

### 权限控制

```typescript
// composables/usePermission.ts
export function usePermission() {
  const userStore = useUserStore()
  
  function hasPermission(permission: string): boolean {
    return userStore.permissions.includes(permission)
  }
  
  function hasRole(role: string): boolean {
    return userStore.roles.includes(role)
  }
  
  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => hasPermission(p))
  }
  
  function hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => hasPermission(p))
  }
  
  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  }
}
```

```vue
<script setup>
const { hasPermission } = usePermission()
</script>

<template>
  <button v-if="hasPermission('delete')">删除</button>
  <button v-if="hasPermission('edit')">编辑</button>
</template>
```

---

## 输入验证

### 前端验证

```typescript
// utils/validator.ts
export const validators = {
  email: (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(value) || '邮箱格式不正确'
  },
  
  password: (value: string) => {
    if (value.length < 8) return '密码至少8位'
    if (!/[a-z]/.test(value)) return '密码必须包含小写字母'
    if (!/[A-Z]/.test(value)) return '密码必须包含大写字母'
    if (!/[0-9]/.test(value)) return '密码必须包含数字'
    return true
  },
  
  phone: (value: string) => {
    const regex = /^1[3-9]\d{9}$/
    return regex.test(value) || '手机号格式不正确'
  },
  
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return 'URL 格式不正确'
    }
  }
}
```

```vue
<script setup>
import { validators } from '@/utils/validator'

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

function validateField(field: keyof typeof form) {
  const result = validators[field](form[field])
  errors[field] = typeof result === 'string' ? result : ''
  return result === true
}

function validateForm() {
  const emailValid = validateField('email')
  const passwordValid = validateField('password')
  return emailValid && passwordValid
}

function handleSubmit() {
  if (validateForm()) {
    // 提交表单
  }
}
</script>
```

### 后端验证

前端验证仅用于用户体验，**必须在后端进行验证**。

---

## 敏感信息保护

### 环境变量

```bash
# .env.local (不提交到版本控制)
VITE_API_KEY=your-secret-key
VITE_API_URL=https://api.example.com
```

```typescript
// ✅ 安全：使用环境变量
const apiKey = import.meta.env.VITE_API_KEY

// ❌ 危险：硬编码
const apiKey = 'sk-1234567890'
```

### 敏感数据加密

```typescript
// utils/crypto.ts
import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

export function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

---

## API 安全

### 请求签名

```typescript
// utils/sign.ts
import CryptoJS from 'crypto-js'

export function signRequest(
  method: string,
  path: string,
  params: Record<string, any>,
  timestamp: number,
  secret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  const stringToSign = `${method}\n${path}\n${sortedParams}\n${timestamp}`
  
  return CryptoJS.HmacSHA256(stringToSign, secret).toString()
}

// 使用
api.interceptors.request.use((config) => {
  const timestamp = Date.now()
  const signature = signRequest(
    config.method!,
    config.url!,
    config.params || {},
    timestamp,
    SECRET_KEY
  )
  
  config.headers['X-Timestamp'] = timestamp
  config.headers['X-Signature'] = signature
  
  return config
})
```

### 速率限制

```typescript
// utils/rateLimiter.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  canMakeRequest(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // 清理过期请求
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= limit) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }
}

export const rateLimiter = new RateLimiter()

// 使用
async function login(credentials: LoginCredentials) {
  const key = `login:${credentials.username}`
  
  if (!rateLimiter.canMakeRequest(key, 5, 60000)) {
    throw new Error('请求过于频繁，请稍后再试')
  }
  
  return api.post('/auth/login', credentials)
}
```

---

## Content Security Policy

### 配置 CSP

```html
<!-- index.html -->
<meta 
  http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.example.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
  "
>
```

### 服务端设置

```typescript
// Express
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
  `)
  next()
})
```

---

## HTTPS 强制

### HSTS

```typescript
// 服务端设置
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  next()
})
```

### 重定向到 HTTPS

```typescript
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.get('host') + req.url)
  }
  next()
})
```

---

## 依赖安全

### 定期更新

```bash
# 检查过时的包
npm outdated

# 更新依赖
npm update

# 检查安全漏洞
npm audit

# 自动修复
npm audit fix
```

### 锁定版本

```json
// package.json
{
  "dependencies": {
    "vue": "3.3.4",        // 精确版本
    "vue-router": "~4.2.0", // 补丁版本
    "pinia": "^2.1.0"      // 次版本
  }
}
```

### Snyk 集成

```bash
npm install -g snyk
snyk test
snyk monitor
```

---

## 日志与监控

### 安全日志

```typescript
// utils/logger.ts
class SecurityLogger {
  log(event: string, details: any) {
    const log = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userId: getCurrentUserId(),
      ip: getClientIP(),
      userAgent: navigator.userAgent
    }
    
    // 发送到日志服务
    sendToLogService(log)
  }
  
  logLoginAttempt(username: string, success: boolean) {
    this.log('login_attempt', { username, success })
  }
  
  logPermissionDenied(resource: string) {
    this.log('permission_denied', { resource })
  }
  
  logSuspiciousActivity(activity: string) {
    this.log('suspicious_activity', { activity })
  }
}

export const securityLogger = new SecurityLogger()
```

### 异常监控

```typescript
// main.ts
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  beforeSend(event, hint) {
    // 过滤敏感信息
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.['authorization']
    }
    return event
  }
})
```

---

## 安全检查清单

### 开发阶段

- [ ] 使用 HTTPS
- [ ] 启用 CSP
- [ ] 输入验证
- [ ] 输出转义
- [ ] CSRF 保护
- [ ] 安全的认证机制
- [ ] 权限控制
- [ ] 敏感信息加密

### 部署阶段

- [ ] 移除 console.log
- [ ] 移除 source map
- [ ] 设置安全响应头
- [ ] 配置 CORS
- [ ] 启用 HSTS
- [ ] 定期更新依赖
- [ ] 安全审计

### 运维阶段

- [ ] 监控异常日志
- [ ] 定期安全扫描
- [ ] 备份重要数据
- [ ] 应急响应计划
- [ ] 定期更新补丁

---

## 常见漏洞防范

### 1. SQL 注入

使用参数化查询（后端）。

### 2. XSS

- 默认使用模板插值
- v-html 必须清理
- CSP 限制脚本执行

### 3. CSRF

- 使用 CSRF Token
- SameSite Cookie
- 验证 Referer

### 4. 点击劫持

```typescript
// 设置 X-Frame-Options
res.setHeader('X-Frame-Options', 'DENY')
```

### 5. 开放重定向

```typescript
function isSafeRedirect(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}
```

---

## 最佳实践

1. **纵深防御**：多层安全措施
2. **最小权限**：只授予必要权限
3. **默认安全**：安全配置为默认值
4. **定期审计**：代码和依赖审计
5. **安全培训**：团队安全意识
6. **及时更新**：修复已知漏洞
7. **监控告警**：及时发现异常
8. **应急预案**：安全事件响应

---

## 参考资料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vue 安全指南](https://vuejs.org/guide/best-practices/security.html)
- [MDN Web 安全](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
