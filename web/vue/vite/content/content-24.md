# Rollup 构建流程

## 概述

Vite 使用 Rollup 进行生产构建，提供优秀的代码分割和 Tree Shaking 能力。本章深入解析 Rollup 工作原理、构建阶段、优化技术等内容。

## Rollup 工作原理

### 核心概念

**模块打包器**：
- 将多个模块打包成少数文件
- 消除未使用代码（Tree Shaking）
- 优化模块加载顺序

**ES Module 优先**：
- 基于 ESM 的静态分析
- 更好的 Tree Shaking
- 更小的产物体积

### 构建流程

```
源码模块
    ↓
[Build 阶段]
  ├─ 解析入口（resolveId）
  ├─ 加载模块（load）
  ├─ 转换代码（transform）
  ├─ 构建模块图
  └─ Tree Shaking
    ↓
[Generate 阶段]
  ├─ 代码分割
  ├─ 作用域提升
  ├─ 生成代码
  └─ 写入文件（writeBundle）
    ↓
输出文件
```

## 构建阶段与钩子

### Build 阶段钩子

```javascript
export default {
  plugins: [
    {
      name: 'my-plugin',
      
      // 1. 配置选项（最先执行）
      options(options) {
        console.log('1. options:', options)
        return options
      },
      
      // 2. 构建开始
      buildStart(options) {
        console.log('2. buildStart')
      },
      
      // 3. 解析模块 ID（每个模块）
      resolveId(source, importer) {
        console.log('3. resolveId:', source)
        return null  // 使用默认解析
      },
      
      // 4. 加载模块（每个模块）
      load(id) {
        console.log('4. load:', id)
        return null  // 使用默认加载
      },
      
      // 5. 转换代码（每个模块）
      transform(code, id) {
        console.log('5. transform:', id)
        return null  // 不转换
      },
      
      // 6. 构建结束
      buildEnd(error) {
        console.log('6. buildEnd')
      }
    }
  ]
}
```

### Generate 阶段钩子

```javascript
export default {
  plugins: [
    {
      name: 'my-plugin',
      
      // 1. 输出选项
      outputOptions(options) {
        console.log('1. outputOptions')
        return options
      },
      
      // 2. 渲染开始
      renderStart(outputOptions, inputOptions) {
        console.log('2. renderStart')
      },
      
      // 3. 生成 chunk
      renderChunk(code, chunk, options) {
        console.log('3. renderChunk:', chunk.fileName)
        return null
      },
      
      // 4. 生成 bundle
      generateBundle(options, bundle) {
        console.log('4. generateBundle')
        
        // 遍历所有输出文件
        for (const fileName in bundle) {
          const chunk = bundle[fileName]
          console.log('  -', fileName, chunk.type)
        }
      },
      
      // 5. 写入文件
      writeBundle(options, bundle) {
        console.log('5. writeBundle')
      },
      
      // 6. 关闭
      closeBundle() {
        console.log('6. closeBundle')
      }
    }
  ]
}
```

## 代码分割算法

### 自动分割

Rollup 自动分割共享模块：

```javascript
// main.js
import { shared } from './shared.js'
import './page-a.js'

// page-a.js
import { shared } from './shared.js'

// page-b.js
import { shared } from './shared.js'
```

**输出**：
```
main.js         # 入口
page-a.js       # 动态导入
page-b.js       # 动态导入
shared.js       # 自动提取的共享模块
```

### 手动分割

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的代码分割到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          
          // 将 utils 目录分割到 utils chunk
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
        }
      }
    }
  }
}
```

### 分割策略优化

```javascript
// 精细化分割
manualChunks(id) {
  // 1. 大型库单独分割
  if (id.includes('node_modules/echarts')) {
    return 'vendor-echarts'
  }
  
  // 2. 框架核心
  if (id.includes('node_modules/vue')) {
    return 'vendor-vue'
  }
  
  // 3. UI 库
  if (id.includes('node_modules/element-plus')) {
    return 'vendor-ui'
  }
  
  // 4. 其他依赖
  if (id.includes('node_modules')) {
    return 'vendor-common'
  }
  
  // 5. 业务代码按功能分割
  if (id.includes('/src/features/admin/')) {
    return 'admin'
  }
  
  if (id.includes('/src/features/user/')) {
    return 'user'
  }
}
```

### 动态导入分割

```javascript
// 自动代码分割
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')

// 每个动态导入生成独立 chunk
// 输出：
// Home.abc123.js
// About.def456.js
```

## Tree Shaking 实现

### 静态分析

Rollup 通过 ESM 的静态结构进行分析：

```javascript
// library.js
export function used() {
  return 'used'
}

export function unused() {
  return 'unused'
}

// main.js
import { used } from './library.js'
console.log(used())
```

**构建后**：
```javascript
// bundle.js
function used() {
  return 'used'
}
console.log(used())

// unused 函数被移除
```

### 副作用检测

```javascript
// ✅ 无副作用（可以安全移除）
export function pure() {
  return 1 + 1
}

// ❌ 有副作用（不能移除）
export function impure() {
  console.log('side effect')
  return 42
}
```

**package.json 标记**：
```json
{
  "sideEffects": false  // 整个包无副作用
  
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "./src/polyfills.js"
  ]
}
```

### Pure 注释

```javascript
// 标记纯函数
const result = /*#__PURE__*/ expensiveFunction()

// 如果 result 未使用，整个调用会被移除
```

### Tree Shaking 优化

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      // 启用 Tree Shaking（默认）
      treeshake: {
        // 更激进的 Tree Shaking
        moduleSideEffects: false,
        
        // 保留的导出（防止被移除）
        // manualPureFunctions: ['console.log']
      }
    }
  }
}
```

## 产物生成与优化

### 输出格式

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // ES Module（推荐）
        format: 'es',
        
        // CommonJS
        // format: 'cjs',
        
        // UMD（浏览器 + Node.js）
        // format: 'umd',
        // name: 'MyLib',
        
        // IIFE（立即执行）
        // format: 'iife',
        // name: 'MyLib'
      }
    }
  }
}
```

### 命名模式

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 入口文件命名
        entryFileNames: 'js/[name]-[hash].js',
        
        // chunk 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        
        // 资源文件命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
}
```

### 作用域提升

Rollup 自动进行作用域提升（Scope Hoisting）：

```javascript
// 源码
// module-a.js
export const a = 1

// module-b.js
import { a } from './module-a.js'
export const b = a + 1

// main.js
import { b } from './module-b.js'
console.log(b)
```

**未优化的输出**：
```javascript
const a = 1
const b = a + 1
console.log(b)

// 所有模块被内联，消除了模块包装器
```

### 代码压缩

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 压缩选项
        compact: true,
        
        // 去除空格
        generatedCode: {
          constBindings: true
        }
      }
    },
    
    // 使用外部压缩器
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

## Rollup 插件生态

### 常用插件

**1. @rollup/plugin-commonjs**：
```javascript
import commonjs from '@rollup/plugin-commonjs'

export default {
  plugins: [
    commonjs({
      include: /node_modules/
    })
  ]
}
```

**2. @rollup/plugin-node-resolve**：
```javascript
import resolve from '@rollup/plugin-node-resolve'

export default {
  plugins: [
    resolve({
      browser: true,
      extensions: ['.js', '.ts']
    })
  ]
}
```

**3. @rollup/plugin-json**：
```javascript
import json from '@rollup/plugin-json'

export default {
  plugins: [
    json()
  ]
}

// 使用
import pkg from './package.json'
console.log(pkg.version)
```

**4. @rollup/plugin-replace**：
```javascript
import replace from '@rollup/plugin-replace'

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      '__VERSION__': JSON.stringify('1.0.0')
    })
  ]
}
```

### 插件兼容性

Vite 插件兼容 Rollup 插件：

```javascript
// Rollup 插件可以直接用在 Vite 中
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer()  // Rollup 插件
  ]
}  
})
```

## 性能优化

### 1. 缓存优化

```javascript
export default {
  build: {
    rollupOptions: {
      // 启用缓存（Rollup 3+）
      cache: true
    }
  }
}
```

### 2. 并行构建

```javascript
// Rollup 自动利用多核 CPU
// 无需额外配置
```

### 3. 减少输出文件

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 合并小文件
        inlineDynamicImports: false,
        
        // 手动控制分割
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
}
```

### 4. 外部化依赖

```javascript
export default {
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router'],
      
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  }
}
```

## 调试技巧

### 1. 查看构建日志

```bash
# 详细日志
vite build --debug

# 或在配置中
export default {
  logLevel: 'info'  // 'info' | 'warn' | 'error' | 'silent'
}
```

### 2. 生成元文件

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 生成构建元信息
        // Rollup 不直接支持，使用插件
      }
    }
  }
}
```

### 3. 分析产物

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true
    })
  ]
}
```

## 实战配置

### 完整生产配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 资源目录
    assetsDir: 'assets',
    
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Rollup 配置
    rollupOptions: {
      // 输入
      input: {
        main: 'index.html'
      },
      
      // 输出
      output: {
        // 文件命名
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        // 代码分割
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['element-plus'],
          'vendor-utils': ['axios', 'dayjs', 'lodash-es']
        },
        
        // 作用域提升
        hoistTransitiveImports: true,
        
        // 代码格式
        generatedCode: {
          constBindings: true
        }
      },
      
      // Tree Shaking
      treeshake: {
        moduleSideEffects: false
      },
      
      // 外部依赖
      external: [],
      
      // 插件
      plugins: [
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ]
    },
    
    // 大小警告
    chunkSizeWarningLimit: 1000
  }
})
```

## 参考资料

- [Rollup 官网](https://rollupjs.org/)
- [Rollup 插件开发](https://rollupjs.org/plugin-development/)
- [Vite Rollup 选项](https://cn.vitejs.dev/config/build-options.html#build-rollupoptions)
