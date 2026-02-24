# 路径解析与别名

## 概述

Vite 提供了灵活的路径解析配置，通过别名（alias）可以简化模块导入路径。本章介绍路径别名配置、扩展名处理、Monorepo 场景以及外部化依赖等内容。

## resolve.alias 配置

### 基础别名配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  }
})
```

**使用**：
```javascript
// ❌ 不使用别名
import Button from '../../../components/Button.vue'
import { formatDate } from '../../../utils/date'

// ✅ 使用别名
import Button from '@/components/Button.vue'
import { formatDate } from '@/utils/date'
```

### 使用 fileURLToPath

```javascript
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### 数组形式配置

```javascript
export default {
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: /^~/, replacement: '' },  // 去除 ~ 前缀
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') }
    ]
  }
}
```

### 正则别名

```javascript
export default {
  resolve: {
    alias: {
      // 所有 ~/ 开头的导入映射到 src/
      '~/': `${path.resolve(__dirname, 'src')}/`,
      
      // $lib 开头映射到 lib/
      '$lib': path.resolve(__dirname, 'lib')
    }
  }
}
```

## 路径补全与扩展名

### 扩展名配置

```javascript
export default {
  resolve: {
    // 导入时可以省略的扩展名
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
}
```

**使用**：
```javascript
// 可以省略扩展名
import Button from '@/components/Button'  // 自动查找 Button.vue
import utils from '@/utils/index'         // 自动查找 index.js/ts
```

### 目录索引文件

```javascript
export default {
  resolve: {
    // 导入目录时查找的索引文件
    mainFields: ['module', 'jsnext:main', 'jsnext']
  }
}
```

### 查找优先级

```javascript
// import Button from '@/components/button'

// 查找顺序：
1. button.mjs
2. button.js
3. button.ts
4. button.jsx
5. button.tsx
6. button.json
7. button.vue
8. button/index.mjs
9. button/index.js
... 依此类推
```

## TypeScript 路径映射

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

### 保持一致性

确保 `vite.config.js` 和 `tsconfig.json` 的路径映射一致：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    }
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

## 条件导出

### package.json exports 字段

```json
{
  "name": "my-package",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

**使用**：
```javascript
import pkg from 'my-package'        // 使用 dist/index.mjs
import utils from 'my-package/utils'  // 使用 dist/utils.mjs
```

### Vite 条件导入

```javascript
export default {
  resolve: {
    conditions: ['module', 'browser', 'development|production']
  }
}
```

### 优先级

```
1. package.json "exports" 字段
2. package.json "module" 字段
3. package.json "main" 字段
```

## Monorepo 路径处理

### 工作区结构

```
monorepo/
├── packages/
│   ├── app/              # 主应用
│   ├── shared/           # 共享代码
│   └── ui-components/    # UI 组件库
└── pnpm-workspace.yaml
```

### 配置工作区依赖

```json
// packages/app/package.json
{
  "name": "app",
  "dependencies": {
    "shared": "workspace:*",
    "ui-components": "workspace:*"
  }
}
```

### Vite 配置

```javascript
// packages/app/vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'shared': path.resolve(__dirname, '../shared/src'),
      'ui-components': path.resolve(__dirname, '../ui-components/src')
    }
  }
})
```

### 使用工作区包

```javascript
// packages/app/src/main.js
import { Button } from 'ui-components'
import { formatDate } from 'shared'

// 直接导入，无需构建
```

### 优化依赖处理

```javascript
export default {
  optimizeDeps: {
    // 不预构建工作区包
    exclude: ['shared', 'ui-components']
  }
}
```

## 外部化依赖（external）

### 基础用法

```javascript
export default {
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia']
    }
  }
}
```

**效果**：
```javascript
// 源码
import { createApp } from 'vue'

// 构建后
import { createApp } from 'vue'  // 不打包 vue
```

### 正则匹配

```javascript
export default {
  build: {
    rollupOptions: {
      external: [
        /^vue/,           // vue, vue-router, vue-i18n 等
        /^@vueuse\//,     // @vueuse/* 包
        /^lodash/         // lodash 相关包
      ]
    }
  }
}
```

### 函数判断

```javascript
export default {
  build: {
    rollupOptions: {
      external: (id) => {
        // 外部化所有 node_modules 包
        return id.includes('node_modules')
      }
    }
  }
}
```

### SSR 外部化

```javascript
export default {
  ssr: {
    // SSR 构建时外部化依赖
    external: ['vue', 'vue-router'],
    
    // 不外部化这些依赖
    noExternal: ['element-plus']
  }
}
```

## 文件系统路由

### 使用 vite-plugin-pages

```bash
npm install -D vite-plugin-pages
```

```javascript
// vite.config.js
import Pages from 'vite-plugin-pages'

export default {
  plugins: [
    Pages({
      // 页面目录
      dirs: 'src/views',
      
      // 扩展名
      extensions: ['vue', 'jsx', 'tsx'],
      
      // 排除文件
      exclude: ['**/components/**'],
    })
  ]
}
```

**目录结构**：
```
src/views/
├── index.vue         → /
├── about.vue         → /about
├── users/
│   ├── index.vue     → /users
│   └── [id].vue      → /users/:id
└── [...all].vue      → /* (404)
```

**使用**：
```javascript
// src/router/index.js
import { createRouter } from 'vue-router'
import routes from '~pages'  // 自动生成的路由

const router = createRouter({
  routes
})
```

## 实战配置

### Vue 项目完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
    
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@store/*": ["src/store/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

### Monorepo 配置

```javascript
// packages/app/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@ui': path.resolve(__dirname, '../ui-components/src')
    }
  },
  
  optimizeDeps: {
    exclude: ['@shared', '@ui']
  },
  
  build: {
    rollupOptions: {
      external: (id) => {
        // 外部化其他工作区包（如果已构建）
        return id.startsWith('@workspace/')
      }
    }
  }
})
```

## 常见问题

### 1. 别名不生效

检查：
- [ ] 路径是否正确
- [ ] 是否重启了开发服务器
- [ ] TypeScript 是否配置了 paths

### 2. TypeScript 找不到模块

```typescript
// 确保 tsconfig.json 配置正确
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3. 第三方库路径解析失败

```javascript
// 使用 resolve.alias 重定向
export default {
  resolve: {
    alias: {
      'some-lib': 'some-lib/dist/index.esm.js'
    }
  }
}
```

### 4. Monorepo 热更新不生效

```javascript
export default {
  server: {
    watch: {
      // 监听工作区包
      ignored: ['!**/node_modules/@workspace/**']
    }
  },
  
  optimizeDeps: {
    exclude: ['@workspace/shared']
  }
}
```

## 参考资料

- [Vite 路径解析](https://cn.vitejs.dev/config/shared-options.html#resolve-alias)
- [TypeScript 路径映射](https://www.typescriptlang.org/tsconfig#paths)
- [package.json exports](https://nodejs.org/api/packages.html#exports)
