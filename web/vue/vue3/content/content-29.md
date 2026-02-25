# SFC 工具链

> 单文件组件的工具链配置和优化。

## 核心工具

### Vite

Vue 3 官方推荐的构建工具。

```bash
# 创建 Vue 3 项目
npm create vite@latest my-vue-app -- --template vue

# 或使用 TypeScript
npm create vite@latest my-vue-app -- --template vue-ts
```

#### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      // SFC 自定义块
      include: [/\.vue$/],
      // 启用 script setup 语法糖
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  // 构建配置
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus']
        }
      }
    }
  }
})
```

### Vue CLI（传统方案）

```bash
# 安装
npm install -g @vue/cli

# 创建项目
vue create my-project

# 添加插件
vue add typescript
vue add router
vue add vuex
```

---

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 类型声明

```typescript
// env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Volar 配置

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "vue.inlayHints.missingProps": true,
  "vue.inlayHints.optionsWrapper": true
}
```

---

## ESLint 配置

### 安装

```bash
npm install -D eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
```

---

## Prettier 配置

### .prettierrc.json

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "auto",
  "vueIndentScriptAndStyle": false
}
```

### .prettierignore

```
dist
node_modules
*.min.js
*.min.css
```

---

## 样式预处理器

### SCSS

```bash
npm install -D sass
```

```vue
<style lang="scss" scoped>
$primary-color: #42b983;

.container {
  color: $primary-color;
  
  .title {
    font-size: 24px;
  }
}
</style>
```

#### 全局样式变量

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

### Less

```bash
npm install -D less
```

```vue
<style lang="less" scoped>
@primary-color: #42b983;

.container {
  color: @primary-color;
  
  .title {
    font-size: 24px;
  }
}
</style>
```

---

## 路径别名

### Vite 配置

```typescript
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
})
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### 使用

```typescript
import MyComponent from '@/components/MyComponent.vue'
import { formatDate } from '@utils/date'
```

---

## 环境变量

### .env 文件

```bash
# .env - 所有环境
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_URL=http://localhost:8080

# .env.production - 生产环境
VITE_API_URL=https://api.example.com
```

### 使用

```typescript
// TypeScript
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// 类型提示
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}
```

---

## 组件自动导入

### unplugin-vue-components

```bash
npm install -D unplugin-vue-components
```

```typescript
// vite.config.ts
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      // 自动导入 src/components 下的组件
      dirs: ['src/components'],
      // 自动导入 Element Plus
      resolvers: [ElementPlusResolver()],
      // 生成类型声明
      dts: 'src/components.d.ts'
    })
  ]
})
```

使用：

```vue
<template>
  <!-- 无需手动导入 -->
  <MyButton />
  <el-button />
</template>
```

### unplugin-auto-import

```bash
npm install -D unplugin-auto-import
```

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 相关函数
      imports: ['vue', 'vue-router', 'pinia'],
      // 自动导入 Element Plus 相关函数
      resolvers: [ElementPlusResolver()],
      // 生成类型声明
      dts: 'src/auto-imports.d.ts'
    })
  ]
})
```

使用：

```vue
<script setup>
// 无需手动导入 ref, computed 等
const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```

---

## 图标处理

### unplugin-icons

```bash
npm install -D unplugin-icons @iconify/json
```

```typescript
// vite.config.ts
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [
    vue(),
    Icons({
      autoInstall: true
    })
  ]
})
```

使用：

```vue
<script setup>
import IconHome from '~icons/mdi/home'
import IconUser from '~icons/carbon/user'
</script>

<template>
  <IconHome />
  <IconUser />
</template>
```

---

## 性能优化

### 代码分割

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI 库
          'ui-vendor': ['element-plus'],
          // 工具库
          'utils': ['axios', 'lodash-es']
        }
      }
    }
  }
})
```

### 压缩

```bash
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
})
```

### 图片优化

```bash
npm install -D vite-plugin-imagemin
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    vue(),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ]
})
```

---

## 调试工具

### Vue DevTools

浏览器扩展，用于调试 Vue 应用。

**功能**：
- 组件树查看
- 状态检查
- 事件追踪
- 路由信息
- 性能分析

### vite-plugin-vue-devtools

```bash
npm install -D vite-plugin-vue-devtools
```

```typescript
// vite.config.ts
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools()
  ]
})
```

---

## 测试配置

### Vitest

```bash
npm install -D vitest @vue/test-utils
```

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  }
})
```

```typescript
// MyComponent.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: { msg: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })
})
```

---

## 项目结构

```
my-vue-app/
├── public/              # 静态资源
│   └── favicon.ico
├── src/
│   ├── assets/         # 资源文件
│   │   ├── images/
│   │   └── styles/
│   ├── components/     # 通用组件
│   │   ├── common/
│   │   └── layout/
│   ├── composables/    # 组合式函数
│   ├── directives/     # 自定义指令
│   ├── plugins/        # 插件
│   ├── router/         # 路由
│   │   └── index.ts
│   ├── stores/         # 状态管理
│   │   └── user.ts
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue
│   ├── main.ts
│   └── env.d.ts
├── .env
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc.json
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 构建与部署

### 构建

```bash
# 开发环境
npm run dev

# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

### 部署到 Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy --prod --dir=dist
```

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 最佳实践

1. **使用 Vite**：开发体验更好
2. **TypeScript**：提供类型安全
3. **代码规范**：ESLint + Prettier
4. **自动导入**：减少重复代码
5. **环境变量**：区分开发和生产
6. **代码分割**：优化加载性能
7. **测试覆盖**：保证代码质量
8. **CI/CD**：自动化部署

---

## 参考资料

- [Vite 官方文档](https://vitejs.dev/)
- [Vue CLI 官方文档](https://cli.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [ESLint 官方文档](https://eslint.org/)
