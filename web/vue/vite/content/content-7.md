# TypeScript 与 JSX

## 概述

Vite 原生支持 TypeScript 和 JSX，无需额外配置即可使用。本章介绍 TypeScript 转译、类型检查、JSX 配置以及最佳实践。

## TypeScript 支持

### 开箱即用

Vite 使用 esbuild 转译 TypeScript，速度极快：

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

**转译特点**：
- 仅转译，不进行类型检查
- 速度极快（比 tsc 快 20-30 倍）
- 支持最新 TS 特性

### 仅转译模式

Vite **不进行类型检查**，只负责将 TS 转换为 JS：

```typescript
// 这段代码有类型错误，但 Vite 不会报错
const num: number = "hello"  // 类型错误

// esbuild 只负责转译，输出：
const num = "hello"
```

**设计原因**：
- 类型检查很慢，影响开发体验
- 类型检查应该由 IDE 和 CI 完成
- 开发环境追求速度，生产环境追求质量

## 类型检查策略

### 方式1：IDE 实时检查

使用 VSCode + Volar/TypeScript 插件：
- 实时类型检查
- 类型提示
- 自动补全

### 方式2：构建前检查

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "type-check": "vue-tsc --noEmit"
  }
}
```

```bash
# 类型检查
npm run type-check

# 构建前先检查类型
npm run build
```

### 方式3：使用插件

```bash
npm install -D vite-plugin-checker
```

```typescript
// vite.config.ts
import checker from 'vite-plugin-checker'

export default {
  plugins: [
    checker({
      typescript: true,
      vueTsc: true,
    })
  ]
}
```

运行时会在浏览器中显示类型错误。

## esbuild vs tsc

### 性能对比

```
类型检查 + 转译（tsc）：    10-30秒
仅转译（esbuild）：         0.5-2秒

性能提升：10-50倍
```

### 功能差异

| 特性 | esbuild | tsc |
|------|---------|-----|
| 转译速度 | 极快 | 慢 |
| 类型检查 | 不支持 | 支持 |
| 装饰器 | 部分支持 | 完全支持 |
| const enum | 不支持 | 支持 |
| namespace | 部分支持 | 完全支持 |

### 不支持的特性

**const enum**：
```typescript
// ❌ esbuild 不支持
const enum Direction {
  Up,
  Down
}

// ✅ 使用普通 enum
enum Direction {
  Up,
  Down
}
```

**装饰器元数据**：
```typescript
// ❌ esbuild 不完全支持
@Reflect.metadata('design:type', String)
class MyClass {}

// ✅ 避免使用 emitDecoratorMetadata
```

## JSX/TSX 配置

### React JSX

```tsx
// Button.tsx
interface ButtonProps {
  text: string
  onClick: () => void
}

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  )
}
```

**配置**：
```typescript
// vite.config.ts
import react from '@vitejs/plugin-react'

export default {
  plugins: [react()]
}
```

### Vue JSX

```tsx
// Button.tsx
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    text: String
  },
  setup(props) {
    return () => (
      <button>{props.text}</button>
    )
  }
})
```

**配置**：
```typescript
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default {
  plugins: [
    vue(),
    vueJsx()
  ]
}
```

### JSX 编译选项

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",  // Vite 会处理 JSX
    "jsxImportSource": "vue"  // Vue JSX
  }
}
```

## Vue 与 React JSX 配置差异

### React 配置

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    react({
      // Fast Refresh
      fastRefresh: true,
      
      // Babel 配置
      babel: {
        plugins: ['@babel/plugin-proposal-decorators']
      }
    })
  ]
}

// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",  // React 17+ 新 JSX 转换
    "lib": ["DOM", "ESNext"]
  }
}
```

### Vue 配置

```typescript
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default {
  plugins: [
    vue(),
    vueJsx({
      // 自定义转换
      transformOn: true,
      optimize: true
    })
  ]
}

// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

## 路径别名与类型提示

### 配置路径别名

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
})
```

### TypeScript 类型提示

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**使用**：
```typescript
// ✅ 带类型提示
import Button from '@/components/Button.vue'
import { formatDate } from '@/utils/date'
```

### Vite 类型声明

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vue 文件类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 图片类型
declare module '*.png' {
  const src: string
  export default src
}
```

## 实战配置

### Vue + TypeScript 完整配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  server: {
    port: 3000
  }
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

### React + TypeScript 完整配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

## 常见问题

### 1. 类型检查不生效

```bash
# 确保安装了 TypeScript
npm install -D typescript

# Vue 项目需要 vue-tsc
npm install -D vue-tsc

# 运行类型检查
npx tsc --noEmit
# 或
npx vue-tsc --noEmit
```

### 2. 路径别名无类型提示

检查 `tsconfig.json` 的 `paths` 配置是否与 `vite.config.ts` 一致。

### 3. Vue 文件类型错误

```typescript
// 添加 Vue 类型声明
// src/vite-env.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
```

## 参考资料

- [Vite TypeScript](https://cn.vitejs.dev/guide/features.html#typescript)
- [esbuild 文档](https://esbuild.github.io/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
