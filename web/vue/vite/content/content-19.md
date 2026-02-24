# 开发性能优化

## 概述

Vite 开发环境性能优化直接影响开发体验。本章介绍冷启动优化、热更新优化、预构建策略、依赖分析等实用技巧。

## 冷启动速度优化

### 1. 优化依赖预构建

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 明确列出需要预构建的依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es'
    ],
    
    // 排除不需要预构建的
    exclude: [
      'your-local-package'
    ]
  }
}
```

**效果对比**：
```
未优化：启动 5-10s
优化后：启动 1-2s
```

### 2. 减少扫描范围

```javascript
export default {
  optimizeDeps: {
    // 自定义扫描入口
    entries: [
      'src/main.ts'
    ]
  }
}
```

### 3. 使用 esbuild 配置

```javascript
export default {
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',  // 减少转译
      keepNames: false,  // 不保留函数名
    }
  }
}
```

### 4. 文件监听优化

```javascript
export default {
  server: {
    watch: {
      // 忽略不必要的文件
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**'
      ]
    }
  }
}
```

## 热更新性能优化

### 1. 精确的 HMR 边界

```vue
<!-- ✅ 好的做法：组件独立 -->
<!-- Button.vue -->
<template>
  <button @click="handleClick">{{ text }}</button>
</template>

<script setup>
const props = defineProps(['text'])
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<!-- ❌ 避免：所有逻辑在一个文件 -->
<!-- App.vue 包含所有组件和逻辑 -->
```

### 2. 避免模块级副作用

```javascript
// ❌ 避免：模块加载时执行
console.log('模块加载')  // 每次 HMR 都会执行

// ✅ 推荐：封装在函数中
export function init() {
  console.log('初始化')
}
```

### 3. 优化导入路径

```javascript
// ❌ 避免：导入整个库
import _ from 'lodash-es'  // 上百个模块

// ✅ 推荐：按需导入
import { debounce } from 'lodash-es'
```

### 4. 使用动态导入

```javascript
// 路由懒加载
const routes = [
  {
    path: '/heavy',
    component: () => import('./views/Heavy.vue')  // 仅在访问时加载
  }
]
```

## 预构建优化策略

### 1. 手动配置常用依赖

```javascript
export default {
  optimizeDeps: {
    include: [
      // 核心依赖
      'vue',
      'vue-router',
      'pinia',
      
      // UI 库
      'element-plus',
      'element-plus/es/components/button/style/css',
      
      // 工具库
      'axios',
      'dayjs',
      'lodash-es'
    ]
  }
}
```

### 2. 处理深层导入

```javascript
export default {
  optimizeDeps: {
    include: [
      'library',
      'library/sub-package',
      'library/utils/helper'
    ]
  }
}
```

### 3. 条件导入处理

```javascript
// 动态导入也需要预构建
export default {
  optimizeDeps: {
    include: [
      'chart-lib'  // 即使是 import('chart-lib') 也要配置
    ]
  }
}
```

### 4. 强制重新预构建

```bash
# 依赖更新后
rm -rf node_modules/.vite
vite

# 或使用命令行参数
vite --force
```

## 大型项目优化技巧

### 1. 拆分大型组件

```javascript
// ❌ 避免：单个大文件
// BigComponent.vue (1000+ 行)

// ✅ 推荐：拆分为多个小组件
// BigComponent/
//   ├── index.vue          (100 行)
//   ├── Header.vue         (50 行)
//   ├── Content.vue        (100 行)
//   └── Footer.vue         (50 行)
```

### 2. 按功能模块组织

```
src/
├── features/
│   ├── auth/              # 认证模块
│   │   ├── components/
│   │   ├── stores/
│   │   └── utils/
│   ├── dashboard/         # 仪表盘模块
│   └── settings/          # 设置模块
```

### 3. 使用 Monorepo

```javascript
// packages/
//   ├── app/              # 主应用
//   ├── shared/           # 共享代码
//   └── ui/               # UI 组件

// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['@workspace/shared', '@workspace/ui']
  }
}
```

### 4. 预热常用路由

```javascript
export default {
  server: {
    warmup: {
      clientFiles: [
        './src/views/Home.vue',
        './src/views/Dashboard.vue',
        './src/components/Header.vue'
      ]
    }
  }
}
```

## 依赖分析与瘦身

### 1. 分析依赖大小

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
}
```

### 2. 替换大型依赖

```javascript
// ❌ 避免：使用完整 moment.js (200KB)
import moment from 'moment'

// ✅ 推荐：使用轻量级 dayjs (7KB)
import dayjs from 'dayjs'
```

### 3. Tree Shaking 优化

```javascript
// ❌ 避免：副作用导入
import 'library'  // 整个库被打包

// ✅ 推荐：具名导入
import { function1 } from 'library'  // 仅打包使用的部分
```

### 4. 检查重复依赖

```bash
# 使用 npm ls 检查
npm ls vue

# 或使用 pnpm
pnpm list vue
```

## 开发体验提升

### 1. 自动打开浏览器

```javascript
export default {
  server: {
    open: true,
    // 或指定路径
    // open: '/dashboard'
  }
}
```

### 2. 自定义端口

```javascript
export default {
  server: {
    port: 3000,
    strictPort: false  // 端口被占用时自动尝试下一个
  }
}
```

### 3. 开发服务器代理

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 打印代理日志
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url)
          })
        }
      }
    }
  }
}
```

### 4. 错误覆盖层

```javascript
export default {
  server: {
    hmr: {
      overlay: true  // 显示错误覆盖层
    }
  }
}
```

## 实战优化案例

### 案例1：大型 Vue 项目优化

**优化前**：
- 冷启动：15s
- 热更新：2-5s
- 依赖：50+ npm 包

**优化配置**：
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'axios',
      'echarts',
      'lodash-es'
    ],
    
    exclude: ['@vueuse/core']  // 已经是 ESM
  },
  
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    },
    
    warmup: {
      clientFiles: [
        './src/views/Dashboard.vue',
        './src/components/Header.vue'
      ]
    }
  }
})
```

**优化后**：
- 冷启动：2s（提升 7.5x）
- 热更新：100-300ms（提升 10-20x）

### 案例2：Monorepo 项目优化

```javascript
// apps/web/vite.config.js
export default {
  optimizeDeps: {
    include: [
      'vue',
      'vue-router'
    ],
    
    exclude: [
      '@workspace/shared',
      '@workspace/ui'
    ]
  },
  
  server: {
    watch: {
      // 监听工作区包
      ignored: ['!**/node_modules/@workspace/**']
    }
  }
}
```

## 性能监控

### 1. 启动时间监控

```javascript
// vite.config.js
export default {
  plugins: [
    {
      name: 'startup-monitor',
      configResolved() {
        this.startTime = Date.now()
      },
      buildStart() {
        console.log(`启动耗时: ${Date.now() - this.startTime}ms`)
      }
    }
  ]
}
```

### 2. HMR 性能监控

```javascript
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.time('HMR')
  })
  
  import.meta.hot.on('vite:afterUpdate', () => {
    console.timeEnd('HMR')
  })
}
```

### 3. 依赖预构建监控

```bash
# 开启调试日志
DEBUG=vite:deps vite
```

## 常见性能问题

### 1. 启动慢

**原因**：
- 依赖过多
- 预构建慢

**解决**：
```javascript
export default {
  optimizeDeps: {
    include: ['heavy-lib'],  // 明确列出大型依赖
    force: true              // 强制重新预构建（排查问题时）
  }
}
```

### 2. HMR 慢

**原因**：
- 模块依赖链长
- 大文件修改

**解决**：
- 拆分大文件
- 优化组件结构

### 3. 内存占用高

**原因**：
- 监听文件过多
- 缓存积累

**解决**：
```javascript
export default {
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    }
  }
}
```

## 开发环境检查清单

✅ **启动优化**：
- [ ] 配置 optimizeDeps.include
- [ ] 排除不需要的文件监听
- [ ] 使用 warmup 预热常用文件

✅ **热更新优化**：
- [ ] 组件拆分合理
- [ ] 避免模块级副作用
- [ ] 使用动态导入

✅ **依赖管理**：
- [ ] 定期检查依赖大小
- [ ] 替换大型依赖
- [ ] 清理未使用的依赖

✅ **开发体验**：
- [ ] 配置代理
- [ ] 启用错误覆盖层
- [ ] 自定义端口和自动打开

## 参考资料

- [Vite 性能优化](https://cn.vitejs.dev/guide/performance.html)
- [依赖预构建](https://cn.vitejs.dev/guide/dep-pre-bundling.html)
- [HMR API](https://cn.vitejs.dev/guide/api-hmr.html)
