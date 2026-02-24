# 库模式

## 概述

Vite 支持库模式（Library Mode），用于构建可发布到 npm 的库或组件。本章介绍库模式配置、输出格式、外部依赖处理、TypeScript 类型声明等内容。

## 库模式配置（build.lib）

### 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MyLib',
      fileName: 'my-lib'
    }
  }
})
```

### 完整配置

```javascript
export default defineConfig({
  build: {
    lib: {
      // 入口文件
      entry: resolve(__dirname, 'src/index.js'),
      
      // 库名称（UMD/IIFE 全局变量名）
      name: 'MyLib',
      
      // 输出文件名
      fileName: (format) => `my-lib.${format}.js`,
      
      // 输出格式
      formats: ['es', 'umd', 'cjs']
    },
    
    // 不生成 .vite 目录
    outDir: 'dist',
    
    // 生成 sourcemap
    sourcemap: true,
    
    // Rollup 选项
    rollupOptions: {
      // 外部化依赖
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

## 输出格式

### ES Module（推荐）

```javascript
export default {
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es']
    }
  }
}
```

**输出**：
```javascript
// dist/my-lib.es.js
import { ref } from 'vue';

function myFunction() {
  const count = ref(0);
  return { count };
}

export { myFunction };
```

### CommonJS

```javascript
export default {
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['cjs']
    }
  }
}
```

**输出**：
```javascript
// dist/my-lib.cjs.js
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const vue = require('vue');

function myFunction() {
  const count = vue.ref(0);
  return { count };
}

exports.myFunction = myFunction;
```

### UMD（浏览器兼容）

```javascript
export default {
  build: {
    lib: {
      entry: './src/index.js',
      name: 'MyLib',
      formats: ['umd']
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
}
```

**输出**：
```javascript
// dist/my-lib.umd.js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('vue'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'vue'], factory)
    : ((global = global || self), factory(global.MyLib = {}, global.Vue));
})(this, function (exports, vue) {
  'use strict';
  
  function myFunction() {
    const count = vue.ref(0);
    return { count };
  }
  
  exports.myFunction = myFunction;
});
```

### IIFE（立即执行）

```javascript
export default {
  build: {
    lib: {
      entry: './src/index.js',
      name: 'MyLib',
      formats: ['iife']
    }
  }
}
```

### 多格式输出

```javascript
export default {
  build: {
    lib: {
      entry: './src/index.js',
      name: 'MyLib',
      formats: ['es', 'umd', 'cjs'],
      fileName: (format) => `my-lib.${format}.js`
    }
  }
}
```

**输出文件**：
```
dist/
├── my-lib.es.js      # ES Module
├── my-lib.umd.js     # UMD
└── my-lib.cjs.js     # CommonJS
```

## 外部依赖处理

### 排除 peerDependencies

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js'
    },
    rollupOptions: {
      // 不打包这些依赖
      external: ['vue', 'vue-router', 'pinia'],
      
      output: {
        // UMD 全局变量映射
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia'
        }
      }
    }
  }
})
```

### 自动读取 package.json

```javascript
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default {
  build: {
    lib: {
      entry: './src/index.js'
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]
    }
  }
}
```

### 正则匹配外部依赖

```javascript
export default {
  build: {
    rollupOptions: {
      external: [
        /^vue/,          // vue, vue-router, vue-i18n...
        /^@vueuse\//,    // @vueuse/*
        /^lodash/        // lodash, lodash-es...
      ]
    }
  }
}
```

## TypeScript 类型声明

### 配置 TypeScript

```typescript
// src/index.ts
export interface MyLibOptions {
  debug?: boolean
}

export function createMyLib(options: MyLibOptions = {}) {
  return {
    // 实现
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "declaration": true,           // 生成 .d.ts
    "declarationDir": "./dist",    // 输出目录
    "emitDeclarationOnly": false,
    "strict": true
  },
  "include": ["src"]
}
```

### 生成类型声明

```bash
# 使用 tsc 生成类型
tsc --emitDeclarationOnly
```

**package.json**：
```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

### 使用 vite-plugin-dts

```bash
npm install -D vite-plugin-dts
```

```javascript
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts']
    })
  ],
  
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib'
    }
  }
})
```

**输出**：
```
dist/
├── my-lib.es.js
├── my-lib.umd.js
├── index.d.ts         # 类型声明
└── components/
    └── Button.d.ts
```

## 组件库打包

### Vue 组件库

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MyComponentLib',
      fileName: (format) => `my-component-lib.${format}.js`
    },
    
    rollupOptions: {
      // Vue 不打包
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        
        // 导出所有组件
        exports: 'named',
        
        // 保留组件名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'my-component-lib.css'
          }
          return assetInfo.name
        }
      }
    }
  }
})
```

### 组件导出

```javascript
// src/index.js
import Button from './components/Button.vue'
import Input from './components/Input.vue'
import Dialog from './components/Dialog.vue'

// 单独导出
export { Button, Input, Dialog }

// 默认导出（可选）
export default {
  install(app) {
    app.component('MyButton', Button)
    app.component('MyInput', Input)
    app.component('MyDialog', Dialog)
  }
}
```

### 按需导入支持

```javascript
// src/button/index.js
export { default } from './Button.vue'

// src/input/index.js
export { default } from './Input.vue'

// 主入口
export { default as Button } from './button'
export { default as Input } from './input'
```

**使用**：
```javascript
// 完整导入
import MyLib from 'my-lib'
app.use(MyLib)

// 按需导入
import { Button, Input } from 'my-lib'
```

### React 组件库

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyReactLib',
      fileName: (format) => `my-react-lib.${format}.js`,
      formats: ['es', 'umd']
    },
    
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

## npm 发布流程

### package.json 配置

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "description": "My awesome library",
  "type": "module",
  
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.js",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  },
  
  "files": [
    "dist",
    "README.md"
  ],
  
  "scripts": {
    "build": "tsc && vite build",
    "prepublishOnly": "npm run build"
  },
  
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  },
  
  "keywords": ["vite", "vue", "component"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourname/my-lib.git"
  }
}
```

### 发布前检查

```bash
# 1. 构建
npm run build

# 2. 测试包内容
npm pack
# 生成 my-lib-1.0.0.tgz

# 3. 查看包内容
tar -tzf my-lib-1.0.0.tgz

# 4. 本地测试
npm install ./my-lib-1.0.0.tgz
```

### 发布到 npm

```bash
# 1. 登录 npm
npm login

# 2. 发布
npm publish

# 发布到特定 tag
npm publish --tag beta
```

### 版本管理

```bash
# 更新版本
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# 发布新版本
git push && git push --tags
npm publish
```

## 实战示例

### 完整的组件库配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.{ts,vue}'],
      staticImport: true,
      insertTypesEntry: true
    })
  ],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyComponentLib',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css'
          }
          return assetInfo.name
        }
      }
    },
    
    cssCodeSplit: false,
    sourcemap: true
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 目录结构

```
my-component-lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.vue
│   │       └── index.ts
│   ├── styles/
│   │   └── index.css
│   └── index.ts
├── dist/              # 构建输出
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.js
```

## 常见问题

### 1. CSS 未被打包

确保导入了 CSS：
```javascript
// src/index.js
import './styles/index.css'
```

### 2. 类型声明未生成

检查 TypeScript 配置：
```json
{
  "compilerOptions": {
    "declaration": true
  }
}
```

### 3. 外部依赖被打包

检查 `external` 配置是否正确。

## 参考资料

- [Vite 库模式](https://cn.vitejs.dev/guide/build.html#library-mode)
- [npm 发布指南](https://docs.npmjs.com/cli/v8/commands/npm-publish)
