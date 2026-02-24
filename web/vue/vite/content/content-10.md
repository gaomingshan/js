# 环境变量与模式

## 概述

Vite 提供了完善的环境变量管理方案，支持通过 `.env` 文件配置不同环境的变量。本章介绍环境变量的使用、模式配置以及安全性注意事项。

## .env 文件规则

### 文件类型

```
.env                # 所有情况下都会加载
.env.local          # 所有情况下都会加载，但会被 git 忽略
.env.[mode]         # 只在指定模式下加载
.env.[mode].local   # 只在指定模式下加载，但会被 git 忽略
```

### 加载优先级

```
.env.[mode].local > .env.[mode] > .env.local > .env
```

**示例**：
```
项目根目录/
├── .env                    # 基础配置
├── .env.local             # 本地覆盖（不提交）
├── .env.development       # 开发环境
├── .env.production        # 生产环境
└── .env.staging           # 预发布环境
```

### 文件内容格式

```bash
# .env
# 基础配置
VITE_APP_TITLE=My App
VITE_API_BASE=https://api.example.com

# .env.development
# 开发环境配置
VITE_API_BASE=http://localhost:8080
VITE_ENABLE_MOCK=true

# .env.production
# 生产环境配置
VITE_API_BASE=https://api.production.com
VITE_ENABLE_MOCK=false
```

## 环境变量前缀（VITE_）

### 为什么需要前缀

只有以 `VITE_` 开头的变量才会暴露给客户端代码，防止敏感信息泄露：

```bash
# .env
VITE_API_URL=https://api.example.com  # ✅ 暴露给客户端
DATABASE_PASSWORD=secret123            # ❌ 不暴露，保持安全
```

### 自定义前缀

```javascript
// vite.config.js
export default {
  envPrefix: 'APP_',  // 使用 APP_ 作为前缀
}
```

```bash
# .env
APP_API_URL=https://api.example.com  # 使用自定义前缀
```

### 内置环境变量

Vite 提供了内置环境变量：

```javascript
import.meta.env.MODE          // 当前模式: 'development' | 'production' | ...
import.meta.env.BASE_URL      // 部署基础路径
import.meta.env.PROD          // 是否生产环境
import.meta.env.DEV           // 是否开发环境
import.meta.env.SSR           // 是否服务端渲染
```

## 模式配置

### 默认模式

```bash
# 开发模式（默认 development）
vite

# 构建模式（默认 production）
vite build

# 预览模式（默认 production）
vite preview
```

### 自定义模式

```bash
# 使用 staging 模式
vite --mode staging
vite build --mode staging

# 使用 test 模式
vite --mode test
```

**package.json 配置**：
```json
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:test": "vite build --mode test"
  }
}
```

### 创建对应的 .env 文件

```bash
# .env.staging
VITE_API_BASE=https://api.staging.example.com
VITE_ENV_NAME=staging

# .env.test
VITE_API_BASE=https://api.test.example.com
VITE_ENV_NAME=test
```

### 覆盖默认模式

```javascript
// vite.config.js
export default ({ mode }) => {
  // 强制使用 development 模式，即使运行 build
  if (mode === 'staging') {
    process.env.NODE_ENV = 'development'
  }
  
  return {
    // 配置
  }
}
```

## import.meta.env 使用

### 访问环境变量

```javascript
// 访问自定义变量
const apiUrl = import.meta.env.VITE_API_URL

// 访问内置变量
if (import.meta.env.DEV) {
  console.log('开发环境')
}

if (import.meta.env.PROD) {
  console.log('生产环境')
}

// 当前模式
console.log('当前模式:', import.meta.env.MODE)
```

### TypeScript 类型提示

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

使用时会有类型提示：
```typescript
// ✅ 有类型提示
const apiUrl: string = import.meta.env.VITE_API_URL

// ❌ 类型错误
const wrongVar = import.meta.env.NOT_EXIST  // 错误：属性不存在
```

### 动态环境变量

```javascript
// ❌ 不支持动态访问
const key = 'VITE_API_URL'
const value = import.meta.env[key]  // undefined

// ✅ 直接访问
const value = import.meta.env.VITE_API_URL
```

### 环境变量替换

构建时，Vite 会静态替换环境变量：

```javascript
// 源码
console.log(import.meta.env.VITE_API_URL)

// 构建后（假设 VITE_API_URL=https://api.example.com）
console.log("https://api.example.com")
```

## 构建时注入变量

### 使用 define

```javascript
// vite.config.js
export default {
  define: {
    // 字符串值需要引号
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    
    // 布尔值
    __DEV__: true,
    
    // 对象
    __CONFIG__: JSON.stringify({
      apiUrl: 'https://api.example.com',
      timeout: 5000
    })
  }
}
```

使用：
```javascript
console.log(__APP_VERSION__)  // '1.0.0'
console.log(__BUILD_TIME__)   // '2024-01-01T00:00:00.000Z'

if (__DEV__) {
  console.log('开发模式')
}
```

### 动态注入

```javascript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      __VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  }
})
```

### 注入到 HTML

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>%VITE_APP_TITLE%</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

构建后自动替换为环境变量的值。

## 安全性注意事项

### 1. 不要暴露敏感信息

```bash
# ❌ 错误：暴露敏感信息
VITE_DATABASE_PASSWORD=secret123
VITE_API_SECRET_KEY=abc123xyz

# ✅ 正确：敏感信息不使用 VITE_ 前缀
DATABASE_PASSWORD=secret123
API_SECRET_KEY=abc123xyz
```

### 2. 使用 .env.local

```bash
# .env.local（不提交到 git）
VITE_API_KEY_DEV=dev-key-123
VITE_OAUTH_CLIENT_SECRET=secret
```

```bash
# .gitignore
.env.local
.env.*.local
```

### 3. 服务端处理敏感操作

```javascript
// ❌ 错误：在客户端使用敏感信息
const apiKey = import.meta.env.VITE_API_KEY
fetch(`https://api.example.com?key=${apiKey}`)

// ✅ 正确：通过服务端代理
fetch('/api/data')  // 服务端添加 API key
```

### 4. 生产环境变量

```bash
# .env.production
# 只包含非敏感的配置
VITE_API_BASE=https://api.production.com
VITE_ENABLE_ANALYTICS=true

# 敏感配置通过 CI/CD 环境变量注入
# 不写在 .env 文件中
```

## 实战示例

### 示例1：多环境配置

```bash
# .env
VITE_APP_TITLE=My Application
VITE_API_TIMEOUT=10000

# .env.development
VITE_API_BASE=http://localhost:8080
VITE_ENABLE_MOCK=true
VITE_LOG_LEVEL=debug

# .env.staging
VITE_API_BASE=https://api.staging.example.com
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=info

# .env.production
VITE_API_BASE=https://api.example.com
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=error
```

```javascript
// src/config/index.js
export default {
  apiBase: import.meta.env.VITE_API_BASE,
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT),
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD
}
```

### 示例2：根据环境加载不同配置

```javascript
// src/utils/request.js
import axios from 'axios'
import config from '@/config'

const service = axios.create({
  baseURL: config.apiBase,
  timeout: config.apiTimeout
})

// 开发环境启用 mock
if (config.enableMock) {
  import('@/mock').then(({ setupMock }) => {
    setupMock()
  })
}

export default service
```

### 示例3：构建时注入版本信息

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { execSync } from 'child_process'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __GIT_COMMIT__: JSON.stringify(
      execSync('git rev-parse --short HEAD').toString().trim()
    ),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
```

```javascript
// src/components/Version.vue
<template>
  <div>
    <p>版本: {{ version }}</p>
    <p>提交: {{ commit }}</p>
    <p>构建时间: {{ buildTime }}</p>
  </div>
</template>

<script setup>
const version = __APP_VERSION__
const commit = __GIT_COMMIT__
const buildTime = __BUILD_TIME__
</script>
```

### 示例4：Feature Flag

```bash
# .env.development
VITE_FEATURE_NEW_UI=true
VITE_FEATURE_PAYMENT=false

# .env.production
VITE_FEATURE_NEW_UI=true
VITE_FEATURE_PAYMENT=true
```

```vue
<template>
  <div>
    <NewUI v-if="featureFlags.newUI" />
    <OldUI v-else />
    
    <PaymentButton v-if="featureFlags.payment" />
  </div>
</template>

<script setup>
const featureFlags = {
  newUI: import.meta.env.VITE_FEATURE_NEW_UI === 'true',
  payment: import.meta.env.VITE_FEATURE_PAYMENT === 'true'
}
</script>
```

## 加载 .env 文件

### 在配置文件中加载

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // 使用环境变量配置
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE,
          changeOrigin: true
        }
      }
    }
  }
})
```

### loadEnv 参数

```javascript
loadEnv(
  mode,              // 模式: 'development' | 'production' | ...
  envDir,            // .env 文件目录，默认 process.cwd()
  prefixes           // 前缀，默认 'VITE_'
)
```

## 常见问题

### 1. 环境变量未生效

检查清单：
- [ ] 变量名以 `VITE_` 开头
- [ ] 重启开发服务器
- [ ] 检查 .env 文件位置（应在项目根目录）
- [ ] 检查文件名拼写

### 2. TypeScript 类型错误

```typescript
// 添加类型声明
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_YOUR_VAR: string
}
```

### 3. 环境变量值是字符串

```javascript
// ❌ 错误
if (import.meta.env.VITE_ENABLE_MOCK) { }  // 字符串 'false' 也是 truthy

// ✅ 正确
if (import.meta.env.VITE_ENABLE_MOCK === 'true') { }
```

## 参考资料

- [Vite 环境变量](https://cn.vitejs.dev/guide/env-and-mode.html)
- [dotenv 文档](https://github.com/motdotla/dotenv)
