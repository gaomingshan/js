# 第 49 节：安全性考虑

## 概述

状态管理中的安全性涉及数据保护、访问控制、注入防护等多个方面。本节介绍如何构建安全的状态管理系统。

## 一、数据安全与隐私

### 1.1 敏感数据处理

```javascript
// security/dataProtection.js
export class SecureStore {
  constructor(options = {}) {
    this.encryptionKey = options.encryptionKey
    this.sensitiveFields = new Set(options.sensitiveFields || [])
    this.dataClassification = options.dataClassification || {}
  }
  
  // 数据脱敏
  sanitizeData(data, level = 'public') {
    if (typeof data !== 'object' || data === null) {
      return data
    }
    
    const sanitized = Array.isArray(data) ? [] : {}
    
    for (const [key, value] of Object.entries(data)) {
      const classification = this.dataClassification[key] || 'public'
      
      if (this.shouldRedact(classification, level)) {
        sanitized[key] = this.redactValue(value, key)
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value, level)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
  
  shouldRedact(dataLevel, accessLevel) {
    const levels = { public: 0, internal: 1, confidential: 2, secret: 3 }
    return levels[dataLevel] > levels[accessLevel]
  }
  
  redactValue(value, fieldName) {
    if (fieldName.toLowerCase().includes('password')) {
      return '***'
    }
    if (fieldName.toLowerCase().includes('token')) {
      return `${String(value).slice(0, 4)}...`
    }
    if (fieldName.toLowerCase().includes('email')) {
      const email = String(value)
      const [local, domain] = email.split('@')
      return `${local.slice(0, 2)}***@${domain}`
    }
    if (fieldName.toLowerCase().includes('phone')) {
      const phone = String(value)
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
    }
    
    return typeof value === 'string' ? '***' : null
  }
  
  // 加密敏感数据
  encryptSensitiveData(data) {
    if (!this.encryptionKey) return data
    
    const processed = { ...data }
    
    for (const field of this.sensitiveFields) {
      if (processed[field]) {
        processed[field] = this.encrypt(processed[field])
      }
    }
    
    return processed
  }
  
  // 解密敏感数据
  decryptSensitiveData(data) {
    if (!this.encryptionKey) return data
    
    const processed = { ...data }
    
    for (const field of this.sensitiveFields) {
      if (processed[field]) {
        try {
          processed[field] = this.decrypt(processed[field])
        } catch (error) {
          console.warn(`Failed to decrypt field ${field}:`, error)
        }
      }
    }
    
    return processed
  }
  
  encrypt(data) {
    // 简化的加密实现，生产环境应使用 Web Crypto API
    const jsonData = JSON.stringify(data)
    return btoa(jsonData + '::' + this.encryptionKey)
  }
  
  decrypt(encryptedData) {
    const decoded = atob(encryptedData)
    const [data, key] = decoded.split('::')
    
    if (key !== this.encryptionKey) {
      throw new Error('Invalid encryption key')
    }
    
    return JSON.parse(data)
  }
}
```

### 1.2 访问控制系统

```javascript
// security/accessControl.js
export class AccessControl {
  constructor() {
    this.permissions = new Map()
    this.roles = new Map()
    this.userRoles = new Map()
  }
  
  // 定义权限
  definePermission(name, description) {
    this.permissions.set(name, { name, description })
  }
  
  // 定义角色
  defineRole(name, permissions = []) {
    this.roles.set(name, new Set(permissions))
  }
  
  // 分配角色给用户
  assignRole(userId, roleName) {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set())
    }
    this.userRoles.get(userId).add(roleName)
  }
  
  // 检查权限
  hasPermission(userId, permission) {
    const userRoles = this.userRoles.get(userId)
    if (!userRoles) return false
    
    for (const roleName of userRoles) {
      const rolePermissions = this.roles.get(roleName)
      if (rolePermissions && rolePermissions.has(permission)) {
        return true
      }
    }
    
    return false
  }
  
  // 获取用户权限列表
  getUserPermissions(userId) {
    const userRoles = this.userRoles.get(userId)
    if (!userRoles) return []
    
    const permissions = new Set()
    
    for (const roleName of userRoles) {
      const rolePermissions = this.roles.get(roleName)
      if (rolePermissions) {
        rolePermissions.forEach(permission => permissions.add(permission))
      }
    }
    
    return Array.from(permissions)
  }
}

// Pinia 访问控制插件
export function createAccessControlPlugin(accessControl) {
  return (context) => {
    const { store, options } = context
    
    // 检查 store 访问权限
    if (options.requiredPermissions) {
      const originalActions = {}
      
      // 包装需要权限的 actions
      Object.keys(store).forEach(key => {
        if (typeof store[key] === 'function' && !key.startsWith('$')) {
          const requiredPermission = options.requiredPermissions[key]
          
          if (requiredPermission) {
            originalActions[key] = store[key]
            
            store[key] = function(...args) {
              const currentUser = getCurrentUser()
              
              if (!currentUser || !accessControl.hasPermission(currentUser.id, requiredPermission)) {
                throw new Error(`Permission denied: ${requiredPermission} required for action ${key}`)
              }
              
              return originalActions[key].apply(this, args)
            }
          }
        }
      })
    }
  }
}

function getCurrentUser() {
  // 从认证 store 或其他地方获取当前用户
  return JSON.parse(localStorage.getItem('currentUser'))
}
```

## 二、XSS 与注入防护

### 2.1 输入验证与清理

```javascript
// security/inputValidation.js
export class InputValidator {
  constructor() {
    this.rules = new Map()
    this.sanitizers = new Map()
    
    this.setupDefaultRules()
    this.setupDefaultSanitizers()
  }
  
  setupDefaultRules() {
    // 基本验证规则
    this.addRule('required', (value) => {
      return value !== null && value !== undefined && value !== ''
    })
    
    this.addRule('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    })
    
    this.addRule('minLength', (value, length) => {
      return String(value).length >= length
    })
    
    this.addRule('maxLength', (value, length) => {
      return String(value).length <= length
    })
    
    this.addRule('pattern', (value, regex) => {
      return new RegExp(regex).test(value)
    })
    
    this.addRule('noScript', (value) => {
      const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
      return !scriptRegex.test(value)
    })
  }
  
  setupDefaultSanitizers() {
    // HTML 转义
    this.addSanitizer('html', (value) => {
      const div = document.createElement('div')
      div.textContent = value
      return div.innerHTML
    })
    
    // 移除脚本标签
    this.addSanitizer('removeScript', (value) => {
      return String(value).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    })
    
    // 清理 SQL 注入字符
    this.addSanitizer('sql', (value) => {
      return String(value).replace(/['";\\]/g, '')
    })
    
    // 移除危险属性
    this.addSanitizer('attributes', (value) => {
      return String(value).replace(/on\w+\s*=/gi, '')
    })
  }
  
  addRule(name, validator) {
    this.rules.set(name, validator)
  }
  
  addSanitizer(name, sanitizer) {
    this.sanitizers.set(name, sanitizer)
  }
  
  validate(data, schema) {
    const errors = {}
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors = []
      
      for (const rule of rules) {
        const { name, params = [], message } = typeof rule === 'string' 
          ? { name: rule, params: [], message: `${field} validation failed` }
          : rule
        
        const validator = this.rules.get(name)
        if (!validator) {
          console.warn(`Unknown validation rule: ${name}`)
          continue
        }
        
        if (!validator(value, ...params)) {
          fieldErrors.push(message || `${field} failed ${name} validation`)
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  sanitize(data, schema) {
    const sanitized = { ...data }
    
    for (const [field, sanitizers] of Object.entries(schema)) {
      if (sanitized[field] !== undefined) {
        for (const sanitizerName of sanitizers) {
          const sanitizer = this.sanitizers.get(sanitizerName)
          if (sanitizer) {
            sanitized[field] = sanitizer(sanitized[field])
          }
        }
      }
    }
    
    return sanitized
  }
}

export const inputValidator = new InputValidator()
```

### 2.2 安全的状态更新

```javascript
// security/secureStore.js
export function createSecureStorePlugin(options = {}) {
  const validator = options.validator || inputValidator
  
  return (context) => {
    const { store, options: storeOptions } = context
    
    // 验证和清理配置
    const validationSchema = storeOptions.validation || {}
    const sanitizationSchema = storeOptions.sanitization || {}
    
    // 包装 $patch 方法
    const originalPatch = store.$patch
    
    store.$patch = function(stateOrFn) {
      let updates = stateOrFn
      
      if (typeof stateOrFn === 'function') {
        const currentState = { ...store.$state }
        updates = {}
        stateOrFn(updates)
      }
      
      // 验证更新数据
      if (Object.keys(validationSchema).length > 0) {
        const validation = validator.validate(updates, validationSchema)
        
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`)
        }
      }
      
      // 清理更新数据
      if (Object.keys(sanitizationSchema).length > 0) {
        updates = validator.sanitize(updates, sanitizationSchema)
      }
      
      return originalPatch.call(this, updates)
    }
    
    // 包装 actions
    Object.keys(store).forEach(key => {
      if (typeof store[key] === 'function' && !key.startsWith('$')) {
        const originalAction = store[key]
        
        store[key] = function(...args) {
          // 验证 action 参数
          const actionValidation = storeOptions.actionValidation?.[key]
          if (actionValidation) {
            for (let i = 0; i < args.length && i < actionValidation.length; i++) {
              const argValidation = validator.validate(
                { arg: args[i] }, 
                { arg: actionValidation[i] }
              )
              
              if (!argValidation.isValid) {
                throw new Error(`Action ${key} argument ${i} validation failed`)
              }
            }
          }
          
          return originalAction.apply(this, args)
        }
      }
    })
  }
}
```

## 三、认证与授权集成

### 3.1 JWT Token 管理

```javascript
// auth/tokenManager.js
export class TokenManager {
  constructor(options = {}) {
    this.options = {
      tokenKey: 'auth-token',
      refreshKey: 'refresh-token',
      autoRefresh: true,
      refreshThreshold: 300, // 5分钟
      ...options
    }
    
    this.refreshPromise = null
    this.setupAutoRefresh()
  }
  
  setToken(token, refreshToken = null) {
    localStorage.setItem(this.options.tokenKey, token)
    
    if (refreshToken) {
      localStorage.setItem(this.options.refreshKey, refreshToken)
    }
    
    this.scheduleRefresh()
  }
  
  getToken() {
    return localStorage.getItem(this.options.tokenKey)
  }
  
  getRefreshToken() {
    return localStorage.getItem(this.options.refreshKey)
  }
  
  clearTokens() {
    localStorage.removeItem(this.options.tokenKey)
    localStorage.removeItem(this.options.refreshKey)
  }
  
  isTokenValid() {
    const token = this.getToken()
    if (!token) return false
    
    try {
      const payload = this.decodeToken(token)
      return payload.exp * 1000 > Date.now()
    } catch (error) {
      return false
    }
  }
  
  getTokenExpiration() {
    const token = this.getToken()
    if (!token) return null
    
    try {
      const payload = this.decodeToken(token)
      return new Date(payload.exp * 1000)
    } catch (error) {
      return null
    }
  }
  
  decodeToken(token) {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  }
  
  shouldRefresh() {
    const expiration = this.getTokenExpiration()
    if (!expiration) return false
    
    const timeUntilExpiry = expiration.getTime() - Date.now()
    return timeUntilExpiry < this.options.refreshThreshold * 1000
  }
  
  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise
    }
    
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    this.refreshPromise = this.performRefresh(refreshToken)
    
    try {
      const result = await this.refreshPromise
      this.scheduleRefresh()
      return result
    } finally {
      this.refreshPromise = null
    }
  }
  
  async performRefresh(refreshToken) {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    const { token, refreshToken: newRefreshToken } = await response.json()
    this.setToken(token, newRefreshToken)
    
    return token
  }
  
  setupAutoRefresh() {
    if (!this.options.autoRefresh) return
    
    setInterval(() => {
      if (this.isTokenValid() && this.shouldRefresh()) {
        this.refreshToken().catch(error => {
          console.error('Auto token refresh failed:', error)
        })
      }
    }, 60000) // 每分钟检查一次
  }
  
  scheduleRefresh() {
    if (!this.options.autoRefresh) return
    
    const expiration = this.getTokenExpiration()
    if (!expiration) return
    
    const delay = Math.max(
      0,
      expiration.getTime() - Date.now() - this.options.refreshThreshold * 1000
    )
    
    setTimeout(() => {
      if (this.isTokenValid() && this.shouldRefresh()) {
        this.refreshToken().catch(error => {
          console.error('Scheduled token refresh failed:', error)
        })
      }
    }, delay)
  }
}

export const tokenManager = new TokenManager()
```

### 3.2 认证状态管理

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    permissions: []
  }),
  
  getters: {
    userRole: (state) => state.user?.role,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    }
  },
  
  actions: {
    async login(credentials) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        if (!response.ok) {
          throw new Error('Login failed')
        }
        
        const { user, token, refreshToken, permissions } = await response.json()
        
        this.user = user
        this.token = token
        this.refreshToken = refreshToken
        this.permissions = permissions
        this.isAuthenticated = true
        
        tokenManager.setToken(token, refreshToken)
        
        return user
      } catch (error) {
        this.logout()
        throw error
      }
    },
    
    async logout() {
      try {
        if (this.token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
        }
      } catch (error) {
        console.error('Logout request failed:', error)
      }
      
      this.user = null
      this.token = null
      this.refreshToken = null
      this.permissions = []
      this.isAuthenticated = false
      
      tokenManager.clearTokens()
    },
    
    async refreshToken() {
      try {
        const newToken = await tokenManager.refreshToken()
        this.token = newToken
        return newToken
      } catch (error) {
        this.logout()
        throw error
      }
    },
    
    async checkAuth() {
      const token = tokenManager.getToken()
      
      if (!token || !tokenManager.isTokenValid()) {
        this.logout()
        return false
      }
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          this.logout()
          return false
        }
        
        const { user, permissions } = await response.json()
        
        this.user = user
        this.token = token
        this.permissions = permissions
        this.isAuthenticated = true
        
        return true
      } catch (error) {
        this.logout()
        return false
      }
    }
  }
}, {
  // 持久化认证状态（但不包括敏感信息）
  persist: {
    paths: ['user', 'isAuthenticated', 'permissions']
  }
})
```

## 四、安全配置与最佳实践

### 4.1 Content Security Policy (CSP)

```javascript
// security/csp.js
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // 仅开发环境
    'https://trusted-cdn.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:'
  ],
  'connect-src': [
    "'self'",
    'https://api.example.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
}

export function generateCSPHeader() {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// 在应用启动时设置 CSP
export function setupCSP() {
  const meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content = generateCSPHeader()
  document.head.appendChild(meta)
}
```

### 4.2 安全检查清单

```javascript
// security/securityAudit.js
export class SecurityAudit {
  constructor() {
    this.checks = [
      this.checkLocalStorageEncryption,
      this.checkSensitiveDataLogging,
      this.checkCSPHeaders,
      this.checkHTTPSUsage,
      this.checkTokenExpiration,
      this.checkInputValidation
    ]
  }
  
  async runAudit() {
    const results = []
    
    for (const check of this.checks) {
      try {
        const result = await check.call(this)
        results.push(result)
      } catch (error) {
        results.push({
          name: check.name,
          status: 'error',
          message: error.message
        })
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      results,
      summary: this.generateSummary(results)
    }
  }
  
  checkLocalStorageEncryption() {
    const sensitiveKeys = ['token', 'password', 'secret']
    const issues = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        if (this.looksLikePlainText(value)) {
          issues.push(`Potentially unencrypted sensitive data in localStorage: ${key}`)
        }
      }
    }
    
    return {
      name: 'Local Storage Encryption',
      status: issues.length === 0 ? 'pass' : 'warn',
      issues
    }
  }
  
  checkSensitiveDataLogging() {
    const originalConsoleLog = console.log
    let loggedSensitiveData = false
    
    // 临时拦截 console.log
    console.log = (...args) => {
      const message = args.join(' ')
      if (this.containsSensitiveData(message)) {
        loggedSensitiveData = true
      }
    }
    
    // 恢复原始 console.log
    setTimeout(() => {
      console.log = originalConsoleLog
    }, 100)
    
    return {
      name: 'Sensitive Data Logging',
      status: loggedSensitiveData ? 'fail' : 'pass',
      message: loggedSensitiveData ? 'Sensitive data found in console logs' : 'No sensitive data in logs'
    }
  }
  
  checkCSPHeaders() {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    
    return {
      name: 'Content Security Policy',
      status: cspMeta ? 'pass' : 'warn',
      message: cspMeta ? 'CSP header found' : 'No CSP header detected'
    }
  }
  
  checkHTTPSUsage() {
    const isHTTPS = location.protocol === 'https:'
    
    return {
      name: 'HTTPS Usage',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'Using HTTPS' : 'Not using HTTPS in production'
    }
  }
  
  checkTokenExpiration() {
    const token = tokenManager.getToken()
    
    if (!token) {
      return {
        name: 'Token Expiration',
        status: 'pass',
        message: 'No token found'
      }
    }
    
    const isValid = tokenManager.isTokenValid()
    
    return {
      name: 'Token Expiration',
      status: isValid ? 'pass' : 'fail',
      message: isValid ? 'Token is valid' : 'Token has expired'
    }
  }
  
  checkInputValidation() {
    // 检查是否有未验证的输入处理
    // 这是一个简化的检查，实际实现会更复杂
    
    return {
      name: 'Input Validation',
      status: 'manual',
      message: 'Manual review required for input validation'
    }
  }
  
  looksLikePlainText(value) {
    // 简单的启发式检查，看起来像是未加密的敏感数据
    if (value.length < 10) return true
    if (value.includes('@') && value.includes('.')) return true // 可能是邮箱
    if (/^\d{10,}$/.test(value)) return true // 可能是电话号码
    
    return false
  }
  
  containsSensitiveData(message) {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // 信用卡号
      /\b\d{3}-\d{2}-\d{4}\b/ // SSN
    ]
    
    return sensitivePatterns.some(pattern => pattern.test(message))
  }
  
  generateSummary(results) {
    const total = results.length
    const passed = results.filter(r => r.status === 'pass').length
    const warnings = results.filter(r => r.status === 'warn').length
    const failures = results.filter(r => r.status === 'fail').length
    const manual = results.filter(r => r.status === 'manual').length
    
    return {
      total,
      passed,
      warnings,
      failures,
      manual,
      overallStatus: failures > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass'
    }
  }
}

export const securityAudit = new SecurityAudit()
```

## 参考资料

- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

**下一节** → [第 50 节：测试策略](./50-testing-strategies.md)
