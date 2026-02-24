# Vite 面试题汇总

> 涵盖 Vite 核心概念、配置优化、原理剖析、实战应用等方面

---

## 基础概念篇

### 1. Vite 相比 Webpack 的核心优势是什么？

**答案要点**：
- 极速冷启动（基于 ESM，无需预打包）
- 即时热更新（精确到模块级别）
- 开箱即用（内置常用功能）
- 优化的生产构建（基于 Rollup）

**原理解释**：
Vite 在开发环境利用浏览器原生 ESM，按需编译模块，无需打包整个应用。而 Webpack 需要先打包所有模块才能启动。Vite 使用 esbuild 预构建依赖，速度比 JavaScript 编写的打包器快 10-100 倍。

**实践建议**：
- 新项目优先考虑 Vite
- 大型项目迁移需评估成本
- 关注浏览器兼容性需求

**易错点**：
- Vite 不是 Webpack 的完全替代品，某些特殊场景仍需 Webpack
- 开发环境是 ESM，生产环境是打包后的代码

---

### 2. 什么是依赖预构建？为什么需要它？

**答案要点**：
- 将 CommonJS/UMD 转换为 ESM
- 合并多个小模块为单个文件
- 提升模块加载性能

**原理解释**：
浏览器只支持 ESM，许多 npm 包仍使用 CommonJS。Vite 使用 esbuild 在启动时预构建这些依赖，转换格式并合并碎片化的模块（如 lodash-es 有 600+ 个小文件）。预构建结果缓存在 `node_modules/.vite/`。

**实践建议**：
```javascript
// 手动指定需要预构建的依赖
export default {
  optimizeDeps: {
    include: ['vue', 'axios', 'lodash-es']
  }
}
```

**易错点**：
- 依赖更新后需清除缓存：`rm -rf node_modules/.vite`
- 动态导入的依赖也需要配置 include

---

### 3. HMR（热模块替换）的工作原理是什么？

**答案要点**：
- 通过 WebSocket 通信
- 只更新变化的模块
- 保持应用状态

**原理解释**：
Vite 开发服务器监听文件变化，计算受影响的模块，通过 WebSocket 通知浏览器。浏览器接收更新信息后，动态导入新模块并执行 HMR 回调，替换旧模块。Vue 和 React 框架已内置 HMR 支持，可保持组件状态。

**实践建议**：
```javascript
// 自定义 HMR 逻辑
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 应用新模块
  })
}
```

**易错点**：
- 没有 HMR 边界时会触发完全重载
- 循环依赖可能导致 HMR 失效

---

### 4. Vite 如何处理静态资源？

**答案要点**：
- 小于 4KB 的资源内联为 base64
- 大于 4KB 的资源生成独立文件
- CSS 自动注入和代码分割
- 支持 URL、内联、原始内容等多种导入方式

**原理解释**：
```javascript
// URL 导入（默认）
import logo from './logo.png'  // 返回 URL

// 显式 URL
import logo from './logo.png?url'

// 内联为 base64
import logo from './logo.png?inline'

// 原始内容
import svg from './icon.svg?raw'
```

**实践建议**：
```javascript
// 自定义内联阈值
export default {
  build: {
    assetsInlineLimit: 8192  // 8KB
  }
}
```

---

### 5. 如何配置路径别名？

**答案要点**：
- 在 `vite.config.js` 配置 `resolve.alias`
- 同步配置 `tsconfig.json` 的 `paths`
- 使用 `path.resolve` 或 `fileURLToPath`

**原理解释**：
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    }
  }
})

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

**易错点**：
- Vite 和 TypeScript 配置必须一致
- 别名路径需要是绝对路径

---

## 配置优化篇

### 6. 如何优化 Vite 的冷启动速度？

**答案要点**：
- 明确配置 `optimizeDeps.include`
- 排除不需要的文件监听
- 减少扫描范围

**原理解释**：
```javascript
export default {
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios'],
    entries: ['src/main.ts']  // 自定义扫描入口
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
}
```

**实践建议**：
- 大型依赖库明确列在 include 中
- 使用 `DEBUG=vite:deps vite` 查看预构建日志

**易错点**：
- 过度配置 include 反而可能变慢

---

### 7. 生产构建如何进行代码分割？

**答案要点**：
- 使用 `manualChunks` 手动分割
- 动态 import 自动分割
- 提取公共依赖到 vendor chunk

**原理解释**：
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['element-plus'],
          'vendor-utils': ['axios', 'lodash-es']
        }
      }
    }
  }
}

// 或使用函数式
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('vue')) return 'vendor-vue'
    if (id.includes('element-plus')) return 'vendor-ui'
    return 'vendor-common'
  }
}
```

**实践建议**：
- 按库大小和更新频率分割
- 避免 chunk 过小导致请求过多

---

### 8. 如何配置环境变量？

**答案要点**：
- 使用 `.env` 文件
- 变量名必须以 `VITE_` 开头
- 通过 `import.meta.env` 访问

**原理解释**：
```bash
# .env.development
VITE_API_BASE=http://localhost:8080
VITE_APP_TITLE=My App Dev

# .env.production
VITE_API_BASE=https://api.example.com
VITE_APP_TITLE=My App
```

```javascript
// 使用
const apiUrl = import.meta.env.VITE_API_BASE
const isProd = import.meta.env.PROD
```

**实践建议**：
- 敏感信息不要使用 VITE_ 前缀
- 使用 `.env.local` 存放本地配置（不提交）

**易错点**：
- 所有 VITE_ 变量都会暴露到客户端
- 环境变量的值都是字符串

---

### 9. 如何配置代理解决跨域问题？

**答案要点**：
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

**原理解释**：
开发环境通过 Vite 服务器代理请求，避免浏览器跨域限制。`changeOrigin: true` 修改请求头的 origin。生产环境需配置 Nginx 或后端 CORS。

**实践建议**：
- 开发和生产环境分别配置
- 使用统一的 API 前缀便于代理

---

### 10. 如何优化生产构建的产物体积？

**答案要点**：
- 启用 Tree Shaking
- 使用 terser 压缩
- 移除 console
- 启用 Gzip/Brotli 压缩
- 分析产物大小

**原理解释**：
```javascript
export default {
  build: {
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
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
}
```

**实践建议**：
```bash
# 安装分析插件
npm install -D rollup-plugin-visualizer

# 使用
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [visualizer()]
```

---

## 原理剖析篇

### 11. esbuild 在 Vite 中扮演什么角色？

**答案要点**：
- 依赖预构建
- TypeScript/JSX 转译
- 代码压缩（可选）

**原理解释**：
esbuild 是用 Go 编写的极速构建工具，比 JavaScript 工具快 10-100 倍。Vite 用它预构建 node_modules 依赖，转译 TS/JSX。但 esbuild 不进行类型检查，仅转译。

**实践建议**：
- 生产构建速度优先用 esbuild
- 体积优先用 terser
- 类型检查单独运行 `tsc --noEmit`

**易错点**：
- esbuild 不支持某些 TS 特性（如 const enum）

---

### 12. Rollup 在 Vite 中的作用是什么？

**答案要点**：
- 生产环境打包
- 代码分割和 Tree Shaking
- 生成优化的产物

**原理解释**：
Vite 使用 Rollup 进行生产构建，因为 Rollup 专注于 ESM，Tree Shaking 效果更好，产物更小。开发环境用 esbuild 速度快，生产环境用 Rollup 质量高。

**实践建议**：
- 通过 `build.rollupOptions` 配置 Rollup
- 兼容 Rollup 插件生态

---

### 13. 浏览器如何加载 ESM 模块？

**答案要点**：
```html
<script type="module" src="/src/main.js"></script>
```

- 浏览器解析 import 语句
- 并行请求依赖模块
- 深度优先执行

**原理解释**：
浏览器原生支持 `<script type="module">`，会自动解析 import 并发起 HTTP 请求。Vite 拦截这些请求，即时转换模块后返回。每个模块作为独立的 HTTP 请求，利用浏览器缓存。

**易错点**：
- 开发环境模块请求多（正常现象）
- 生产环境会打包优化

---

### 14. HMR 边界是什么？

**答案要点**：
- 能够接受更新的模块
- 通过 `import.meta.hot.accept()` 定义
- 框架组件自带 HMR 边界

**原理解释**：
```javascript
// 自接受
if (import.meta.hot) {
  import.meta.hot.accept()
}

// 接受依赖更新
if (import.meta.hot) {
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 应用更新
  })
}
```

找不到边界时，更新会向上传播，直到完全重载。

**易错点**：
- 工具函数模块通常没有 HMR 边界

---

### 15. 为什么 Vite 开发环境不打包？

**答案要点**：
- 利用浏览器原生 ESM
- 按需编译，即时响应
- 避免打包开销

**原理解释**：
现代浏览器支持 ESM，可以直接加载模块。Vite 将每个文件作为独立模块，浏览器请求时再转换。这样改动一个文件只需重新转换这一个文件，而不是重新打包整个应用。

**实践建议**：
- 开发环境追求速度
- 生产环境需要打包优化

---

## 综合应用篇

### 16. 如何从 Vue CLI 迁移到 Vite？

**答案要点**：
1. 安装 Vite 和插件
2. 移动 `index.html` 到根目录
3. 修改 `index.html` 中的脚本引用
4. 创建 `vite.config.js`
5. 更新环境变量（`VUE_APP_` → `VITE_`）
6. 更新 npm scripts

**原理解释**：
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    port: 8080
  }
})
```

**实践建议**：
- 先在分支上测试
- 逐步迁移，保留回滚方案

---

### 17. 如何在 Vite 中使用 Monorepo？

**答案要点**：
- 使用 pnpm workspaces
- 配置 `optimizeDeps.exclude` 排除本地包
- 配置路径别名指向源码

**原理解释**：
```javascript
export default {
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, '../shared/src')
    }
  },
  optimizeDeps: {
    exclude: ['shared', 'ui-components']
  },
  server: {
    fs: {
      allow: ['..']  // 允许访问上级目录
    }
  }
}
```

**实践建议**：
- 使用 Turborepo 优化构建
- 共享 Vite 配置

---

### 18. 如何配置库模式？

**答案要点**：
```javascript
export default {
  build: {
    lib: {
      entry: './src/index.js',
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
}
```

**原理解释**：
库模式用于构建可发布的 npm 包。需要外部化框架依赖，避免打包进库。支持多种输出格式（ES、UMD、CJS）。

**实践建议**：
- 配置 `package.json` 的 `main`、`module`、`exports`
- 使用 `vite-plugin-dts` 生成类型声明

---

### 19. Vite 如何支持 SSR？

**答案要点**：
- 分离客户端和服务端入口
- 使用 `vite.ssrLoadModule()` 加载服务端模块
- 配置 `ssr.noExternal` 处理依赖

**原理解释**：
```javascript
// server.js
const { render } = await vite.ssrLoadModule('/src/entry-server.js')
const html = await render(url)

// vite.config.js
export default {
  ssr: {
    noExternal: ['element-plus']
  }
}
```

**实践建议**：
- 避免在服务端使用浏览器 API
- 使用 `import.meta.env.SSR` 判断环境

---

### 20. 遇到 Vite 问题如何排查？

**答案要点**：
1. 清除缓存：`rm -rf node_modules/.vite`
2. 强制重新预构建：`vite --force`
3. 启用调试日志：`DEBUG=vite:* vite`
4. 查看浏览器控制台和网络请求
5. 检查 HMR WebSocket 连接

**原理解释**：
大多数问题源于：
- 依赖预构建缓存问题
- 路径解析错误
- HMR 配置问题
- 环境变量未生效

**实践建议**：
```javascript
// 开启详细日志
export default {
  logLevel: 'info',
  server: {
    hmr: {
      overlay: true  // 显示错误覆盖层
    }
  }
}
```

**易错点**：
- 很多问题清除缓存就能解决
- 检查 node_modules 是否正确安装

---

## 总结

掌握 Vite 需要理解：
1. **核心概念**：ESM、预构建、HMR
2. **配置能力**：开发配置、构建配置、优化配置
3. **底层原理**：esbuild、Rollup、模块解析
4. **工程实践**：迁移、优化、问题排查

持续关注 [Vite 官方文档](https://cn.vitejs.dev/) 和社区动态，在实践中不断提升。
