# 构建配置

## 概述

Vite 的生产构建基于 Rollup，提供了丰富的配置选项用于优化构建产物。本章介绍 build 配置、Rollup 集成、代码分割、产物优化等核心内容。

## build 配置选项

### 基础配置

```javascript
export default {
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 小于此阈值的资源将内联为 base64
    assetsInlineLimit: 4096,  // 4KB
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 生成 sourcemap
    sourcemap: false,
    
    // 压缩方式
    minify: 'esbuild',  // 'terser' | 'esbuild' | false
    
    // 构建目标
    target: 'modules',
    
    // chunk 大小警告限制
    chunkSizeWarningLimit: 500,  // KB
    
    // 清空输出目录
    emptyOutDir: true
  }
}
```

### 输出配置

```javascript
export default {
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 静态资源子目录
    assetsDir: 'static',
    
    // 构建后是否清空输出目录
    emptyOutDir: true,
    
    // 启用/禁用 gzip 压缩大小报告
    reportCompressedSize: true,
    
    // chunk 大小警告的限制（KB）
    chunkSizeWarningLimit: 500
  }
}
```

**构建产物结构**：
```
dist/
├── index.html
├── favicon.ico
└── static/          # assetsDir
    ├── index.abc123.js
    ├── index.def456.css
    └── logo.xyz789.png
```

## Rollup 配置集成

### 基础集成

```javascript
export default {
  build: {
    rollupOptions: {
      // Rollup 配置
      input: {
        main: 'index.html',
        admin: 'admin.html'
      },
      
      output: {
        // 输出配置
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
      
      // 外部化依赖
      external: ['vue'],
      
      // 插件
      plugins: []
    }
  }
}
```

### 多入口配置

```javascript
import { resolve } from 'path'

export default {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html')
      }
    }
  }
}
```

**构建产物**：
```
dist/
├── index.html          # main
├── admin/
│   └── index.html     # admin
└── mobile/
    └── index.html     # mobile
```

### 外部化依赖

```javascript
export default {
  build: {
    rollupOptions: {
      // 不打包这些依赖
      external: ['vue', 'vue-router'],
      
      output: {
        // 全局变量名映射
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  }
}
```

**使用场景**：
```html
<!-- index.html -->
<!-- 从 CDN 引入外部依赖 -->
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@4"></script>

<!-- 你的应用代码 -->
<script type="module" src="/src/main.js"></script>
```

## 输出目录与命名规则

### 自定义文件名

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // JS 入口文件
        entryFileNames: 'js/[name].[hash].js',
        
        // JS chunk 文件
        chunkFileNames: 'js/chunks/[name].[hash].js',
        
        // 静态资源
        assetFileNames: (assetInfo) => {
          // 图片
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return 'images/[name].[hash][extname]'
          }
          // 字体
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name].[hash][extname]'
          }
          // CSS
          if (/\.css$/i.test(assetInfo.name)) {
            return 'css/[name].[hash][extname]'
          }
          // 其他
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  }
}
```

**产物结构**：
```
dist/
├── index.html
├── js/
│   ├── main.abc123.js
│   └── chunks/
│       └── vendor.def456.js
├── css/
│   └── main.xyz789.css
├── images/
│   └── logo.uvw012.png
└── fonts/
    └── font.rst345.woff2
```

### 命名占位符

| 占位符 | 说明 |
|--------|------|
| `[name]` | 文件名 |
| `[hash]` | 基于内容的 hash |
| `[extname]` | 扩展名（含点） |
| `[ext]` | 扩展名（不含点） |

## 代码分割策略

### 自动代码分割

Vite 默认进行代码分割：

```javascript
// 动态导入自动分割
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')
```

### 手动分割 chunk

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库打包到 vue-vendor
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // UI 库单独打包
          'element-plus': ['element-plus'],
          
          // 工具库
          'utils': ['lodash-es', 'dayjs']
        }
      }
    }
  }
}
```

### 函数式分割

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules 中的代码
          if (id.includes('node_modules')) {
            // Vue 生态
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            // Element Plus
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // 其他第三方库
            return 'vendor'
          }
          
          // 源码按目录分割
          if (id.includes('/src/views/')) {
            return 'views'
          }
          if (id.includes('/src/components/')) {
            return 'components'
          }
        }
      }
    }
  }
}
```

### 优化分割策略

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 按包大小分割
          if (id.includes('node_modules')) {
            const packageName = id.split('node_modules/')[1].split('/')[0]
            
            // 大型库单独打包
            if (['echarts', 'monaco-editor', 'three'].includes(packageName)) {
              return packageName
            }
            
            // 其他库合并
            return 'vendor'
          }
        }
      }
    }
  }
}
```

## 产物压缩与混淆

### 压缩配置

```javascript
export default {
  build: {
    // 压缩方式
    minify: 'esbuild',  // 默认，速度快
    // minify: 'terser',  // 压缩效果更好
    // minify: false,     // 不压缩
    
    // terser 选项
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        // 移除 debugger
        drop_debugger: true,
        // 移除纯函数调用
        pure_funcs: ['console.log']
      },
      format: {
        // 移除注释
        comments: false
      }
    }
  }
}
```

### esbuild vs terser

| 特性 | esbuild | terser |
|------|---------|--------|
| 压缩速度 | 极快 | 较慢 |
| 压缩率 | 良好 | 更好 |
| 配置复杂度 | 简单 | 复杂 |
| 推荐场景 | 开发构建 | 生产构建 |

### CSS 压缩

```javascript
export default {
  build: {
    // CSS 压缩（默认启用）
    cssMinify: true,
    
    // 使用 lightningcss
    // cssMinify: 'lightningcss',
  }
}
```

## 浏览器兼容性

### 构建目标

```javascript
export default {
  build: {
    // 现代浏览器
    target: 'esnext',
    
    // 或指定多个目标
    target: ['es2020', 'chrome87', 'safari14'],
    
    // 支持旧浏览器
    target: 'es2015'
  }
}
```

### 支持旧浏览器（polyfill）

```bash
npm install -D @vitejs/plugin-legacy
```

```javascript
import legacy from '@vitejs/plugin-legacy'

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true
    })
  ]
}
```

**生成产物**：
```html
<!-- 现代浏览器 -->
<script type="module" src="/assets/index.js"></script>

<!-- 旧浏览器 -->
<script nomodule src="/assets/index-legacy.js"></script>
<script nomodule src="/assets/polyfills-legacy.js"></script>
```

## 实战配置

### 通用生产配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  build: {
    outDir: 'dist',
    assetsDir: 'static',
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
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'utils': ['lodash-es', 'dayjs', 'axios']
        }
      }
    },
    
    chunkSizeWarningLimit: 1000
  }
})
```

### 库模式配置

```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

## 常见问题

### 1. 构建后文件过大

```bash
# 分析构建产物
npm install -D rollup-plugin-visualizer
```

### 2. 某些依赖未被外部化

```javascript
export default {
  build: {
    rollupOptions: {
      external: ['large-library']
    }
  }
}
```

### 3. CSS 未被提取

```javascript
export default {
  build: {
    cssCodeSplit: true  // 确保启用
  }
}
```

## 参考资料

- [Vite 构建选项](https://cn.vitejs.dev/config/build-options.html)
- [Rollup 配置](https://rollupjs.org/configuration-options/)
- [Terser 文档](https://terser.org/)
