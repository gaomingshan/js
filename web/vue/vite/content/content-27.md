# Monorepo 实践

## 概述

Monorepo 是管理多个相关项目的有效方式。本章介绍如何在 Monorepo 中使用 Vite，包括工具集成、包间依赖、共享配置、性能优化等内容。

## Monorepo 工具集成

### 使用 pnpm Workspaces

**安装 pnpm**：
```bash
npm install -g pnpm
```

**项目结构**：
```
monorepo/
├── packages/
│   ├── app/              # 主应用
│   ├── admin/            # 管理后台
│   ├── shared/           # 共享代码
│   └── ui-components/    # UI 组件库
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

**配置 workspace**：
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**根 package.json**：
```json
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 使用 Turborepo

**安装**：
```bash
npm install -g turbo
```

**配置**：
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

**使用**：
```bash
# 并行运行所有 dev
turbo run dev

# 并行构建（有依赖顺序）
turbo run build

# 仅构建变更的包
turbo run build --filter=...@HEAD
```

## 包间依赖管理

### 声明依赖

```json
// packages/app/package.json
{
  "name": "app",
  "dependencies": {
    "shared": "workspace:*",
    "ui-components": "workspace:*",
    "vue": "^3.0.0"
  }
}
```

### 链接本地包

```bash
# pnpm 自动处理 workspace 依赖
pnpm install

# 手动链接（不使用 workspace）
cd packages/app
pnpm link ../shared
```

### 使用本地包

```javascript
// packages/app/src/main.js
import { utils } from 'shared'
import { Button } from 'ui-components'

// 直接使用，无需额外配置
```

### 依赖提升

```json
// .npmrc
# 提升公共依赖到根目录
hoist=true
hoist-pattern[]=*
```

## 共享配置与组件

### 共享 Vite 配置

```javascript
// packages/shared/vite-config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export function createViteConfig(options = {}) {
  return defineConfig({
    plugins: [vue()],
    
    resolve: {
      alias: {
        '@': '/src',
        'shared': '/packages/shared/src'
      }
    },
    
    server: {
      port: options.port || 3000
    },
    
    ...options
  })
}
```

**使用**：
```javascript
// packages/app/vite.config.js
import { createViteConfig } from 'shared/vite-config'

export default createViteConfig({
  port: 3000,
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### 共享组件

```javascript
// packages/ui-components/src/index.js
export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'
export { default as Dialog } from './Dialog.vue'

// packages/app/src/main.js
import { Button, Input } from 'ui-components'
```

### 共享工具

```javascript
// packages/shared/src/utils/index.js
export function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN').format(date)
}

// packages/app/src/views/Home.vue
import { formatDate } from 'shared/utils'
```

### 共享类型定义

```typescript
// packages/shared/src/types/index.ts
export interface User {
  id: number
  name: string
  email: string
}

// packages/app/src/api/user.ts
import type { User } from 'shared/types'

export async function getUser(): Promise<User> {
  // ...
}
```

## 联合构建优化

### Vite 配置

```javascript
// packages/app/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  optimizeDeps: {
    // 不预构建 workspace 包
    exclude: ['shared', 'ui-components']
  },
  
  server: {
    watch: {
      // 监听 workspace 包的变化
      ignored: ['!**/node_modules/.pnpm/**']
    },
    
    fs: {
      // 允许访问 workspace 根目录
      allow: ['..']
    }
  }
})
```

### 开发环境热更新

```javascript
// packages/app/vite.config.js
export default {
  server: {
    watch: {
      // 监听所有 workspace 包
      ignored: [
        '**/node_modules/**',
        '!**/node_modules/.pnpm/**',
        '**/dist/**'
      ]
    }
  },
  
  // 源码别名，直接使用源码
  resolve: {
    alias: {
      'shared': '/packages/shared/src',
      'ui-components': '/packages/ui-components/src'
    }
  }
}
```

### 构建顺序

```json
// turbo.json
{
  "pipeline": {
    "build": {
      // 先构建依赖包
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

**或使用脚本**：
```json
// package.json
{
  "scripts": {
    "build": "pnpm -r --filter './packages/shared' build && pnpm -r --filter '!./packages/shared' build"
  }
}
```

## 版本发布策略

### 统一版本

所有包使用相同版本：

```json
// lerna.json
{
  "version": "1.0.0",
  "packages": ["packages/*"]
}
```

### 独立版本

每个包独立版本：

```bash
# 使用 changesets
npm install -D @changesets/cli

# 初始化
npx changeset init
```

**添加 changeset**：
```bash
npx changeset
# 选择要更新的包和版本类型
```

**发布**：
```bash
# 更新版本
npx changeset version

# 发布到 npm
npx changeset publish
```

### 版本依赖

```json
// packages/app/package.json
{
  "name": "app",
  "version": "1.0.0",
  "dependencies": {
    "shared": "workspace:^1.0.0",
    "ui-components": "workspace:~1.0.0"
  }
}
```

## Monorepo 性能优化

### 1. 增量构建

```bash
# Turborepo 缓存
turbo run build --cache-dir=.turbo
```

### 2. 按需构建

```bash
# 仅构建变更的包
turbo run build --filter=...@HEAD

# 仅构建特定包及其依赖
turbo run build --filter=app...
```

### 3. 并行开发

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel --no-cache"
  }
}
```

### 4. 共享依赖缓存

```javascript
// 根目录 vite.config.js
export default {
  cacheDir: './.vite',  // 共享缓存
  
  optimizeDeps: {
    // 共享预构建
    cacheDir: './node_modules/.vite'
  }
}
```

### 5. 使用 pnpm 的优势

```bash
# 硬链接节省空间
# 100 个包，每个有 node_modules
# npm/yarn: 10GB
# pnpm:      500MB

# 安装速度快
npm install:  30s
yarn:         25s
pnpm:         10s
```

## 实战示例

### 完整的 Monorepo 配置

```
monorepo/
├── packages/
│   ├── app/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── admin/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── shared/
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   ├── types/
│   │   │   └── api/
│   │   └── package.json
│   └── ui-components/
│       ├── src/
│       │   ├── Button/
│       │   ├── Input/
│       │   └── index.js
│       ├── package.json
│       └── vite.config.js
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── tsconfig.json
```

**pnpm-workspace.yaml**：
```yaml
packages:
  - 'packages/*'
```

**turbo.json**：
```json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**根 package.json**：
```json
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

**packages/app/vite.config.js**：
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'shared': path.resolve(__dirname, '../shared/src'),
      'ui-components': path.resolve(__dirname, '../ui-components/src')
    }
  },
  
  optimizeDeps: {
    exclude: ['shared', 'ui-components']
  },
  
  server: {
    port: 3000,
    fs: {
      allow: ['..']
    }
  }
})
```

**packages/shared/package.json**：
```json
{
  "name": "shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.js",
  "types": "./src/index.d.ts",
  "exports": {
    ".": "./src/index.js",
    "./utils": "./src/utils/index.js",
    "./types": "./src/types/index.ts"
  }
}
```

## 常见问题

### 1. 模块找不到

```javascript
// 确保配置了正确的别名和 fs.allow
export default {
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    fs: {
      allow: ['..', '../..']  // 允许访问上级目录
    }
  }
}
```

### 2. 热更新不生效

```javascript
export default {
  server: {
    watch: {
      // 监听 workspace 包
      ignored: ['!**/node_modules/.pnpm/**']
    }
  },
  
  optimizeDeps: {
    // 不预构建本地包
    exclude: ['shared', 'ui-components']
  }
}
```

### 3. 类型提示缺失

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "shared/*": ["../shared/src/*"],
      "ui-components": ["../ui-components/src"]
    }
  }
}
```

### 4. 构建顺序错误

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]  // 先构建依赖
    }
  }
}
```

## 最佳实践

### 1. 目录结构

```
monorepo/
├── apps/              # 应用
│   ├── web/
│   └── admin/
├── packages/          # 可复用包
│   ├── shared/
│   ├── ui/
│   └── utils/
└── tools/             # 工具脚本
```

### 2. 命名规范

```json
{
  "name": "@company/app-web",
  "name": "@company/shared-utils",
  "name": "@company/ui-components"
}
```

### 3. 共享配置

```
monorepo/
├── config/
│   ├── vite.config.base.js
│   ├── tsconfig.base.json
│   └── eslint.config.js
```

### 4. 版本管理

- 核心包：统一版本
- 应用：独立版本
- 工具库：独立版本

## 性能对比

### Monorepo vs 多仓库

**Monorepo 优势**：
- 代码复用方便
- 统一工具链
- 原子提交
- 依赖管理简单

**多仓库优势**：
- 独立部署
- 权限隔离
- 构建独立

### pnpm vs npm/yarn

```
安装时间（100 个包）：
npm:   45s
yarn:  35s
pnpm:  12s

磁盘空间：
npm:   2.5GB
yarn:  2.8GB
pnpm:  600MB
```

## 参考资料

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [Changesets](https://github.com/changesets/changesets)
- [Monorepo 最佳实践](https://monorepo.tools/)
