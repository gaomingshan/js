# 开发服务器原理

## 概述

Vite 的开发服务器是其核心创新所在，通过充分利用浏览器原生 ES modules（ESM）支持，实现了极速的冷启动和即时的模块更新。本章深入剖析 Vite 开发服务器的工作原理。

## 基于 ESM 的开发服务器

### 传统打包式开发服务器（Webpack）

```
启动流程：
1. 解析入口文件
2. 递归构建依赖图（所有模块）
3. 使用 loader 转换模块
4. 打包所有模块到内存
5. 启动服务器
6. 浏览器请求 bundle.js

时间：10-60秒（取决于项目规模）
```

```javascript
// Webpack 开发模式
// 浏览器只能请求打包后的文件
<script src="/dist/bundle.js"></script>

// bundle.js 包含所有模块（可能几MB）
```

### Vite ESM 开发服务器

```
启动流程：
1. 启动 HTTP 服务器（无需打包）
2. 预构建依赖（仅 npm 包）
3. 服务器就绪

时间：200-500ms（项目规模无关）
```

```javascript
// Vite 开发模式
// 浏览器请求原生 ESM 模块
<script type="module" src="/src/main.js"></script>

// 浏览器解析 import，按需请求模块
```

## 按需编译：请求时转换模块

### 工作流程

```
1. 浏览器请求 /src/main.js
       ↓
2. Vite 拦截请求
       ↓
3. 读取 main.js 源码
       ↓
4. 转换代码（处理 import）
       ↓
5. 返回转换后的 ESM 模块
       ↓
6. 浏览器解析 import，继续请求依赖
```

### 实际示例

**源码**（`src/main.js`）：
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

**浏览器收到的代码**：
```javascript
// 裸模块 (bare import) 被重写为预构建路径
import { createApp } from '/@fs/node_modules/.vite/deps/vue.js?v=abc123'

// 相对导入添加扩展名和时间戳
import App from '/src/App.vue?t=1234567890'
import '/src/style.css?t=1234567890'

createApp(App).mount('#app')
```

**关键转换**：
1. **裸模块重写**：`'vue'` → `'/@fs/node_modules/.vite/deps/vue.js'`
2. **相对路径处理**：确保是有效的 URL
3. **添加查询参数**：用于缓存失效（`?t=timestamp`）

### Vue 单文件组件转换

**源码**（`App.vue`）：
```vue
<template>
  <div>{{ msg }}</div>
</template>

<script setup>
import { ref } from 'vue'
const msg = ref('Hello Vite!')
</script>

<style scoped>
div { color: red; }
</style>
```

**转换步骤**：

1. **首次请求**（`/src/App.vue`）：
```javascript
// 返回脚本部分
import { ref } from '/@fs/node_modules/.vite/deps/vue.js'

const __sfc__ = {
  setup(__props) {
    const msg = ref('Hello Vite!')
    return { msg }
  }
}

// 导入模板和样式
import { render } from '/src/App.vue?type=template'
import '/src/App.vue?type=style&index=0'

__sfc__.render = render
export default __sfc__
```

2. **模板请求**（`/src/App.vue?type=template`）：
```javascript
import { toDisplayString as _toDisplayString } from 'vue'

export function render(_ctx, _cache) {
  return _openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.msg))
}
```

3. **样式请求**（`/src/App.vue?type=style&index=0`）：
```javascript
// CSS 被注入为 <style> 标签
const css = "div[data-v-abc123] { color: red; }"
const style = document.createElement('style')
style.textContent = css
document.head.appendChild(style)
```

## 冷启动性能优势

### 性能对比

**小型项目（50 个模块）**：
```
Webpack：  5-10s
Vite：     0.3-0.5s
提升：     10-30x
```

**中型项目（500 个模块）**：
```
Webpack：  15-30s
Vite：     0.5-0.8s
提升：     20-50x
```

**大型项目（5000+ 模块）**：
```
Webpack：  60-120s
Vite：     0.8-1.5s
提升：     50-100x
```

### 为什么 Vite 这么快

**1. 无需预打包**
```javascript
// Webpack 需要处理所有模块
入口 → 模块1 → 模块2 → ... → 模块5000 → 打包完成

// Vite 只处理当前访问的路由需要的模块
入口 → 模块1 → 模块2 → 模块10 → 完成（只处理10个）
```

**2. 原生 ESM 延迟加载**
- 浏览器自动实现代码分割
- 只加载当前页面需要的模块
- 路由切换时才加载新模块

**3. esbuild 预构建依赖**
- Go 语言编写，比 JavaScript 快 10-100 倍
- 仅处理 node_modules 依赖
- 缓存结果，只需构建一次

## 浏览器模块解析机制

### 原生 ESM 工作流程

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>
```

浏览器行为：
```
1. 请求 /src/main.js
2. 解析文件，发现 import 语句
3. 并行请求所有直接依赖
4. 递归处理依赖的依赖
5. 执行模块（深度优先）
```

### 模块请求示例

```javascript
// main.js
import { createApp } from 'vue'      // 请求 1
import App from './App.vue'          // 请求 2
import './style.css'                 // 请求 3

// App.vue
import HelloWorld from './components/HelloWorld.vue'  // 请求 4

// HelloWorld.vue
import { ref } from 'vue'  // 已缓存，无需请求
```

**网络瀑布流**：
```
main.js ━━━━━━━┓
                ├─ vue.js ━━━━━
                ├─ App.vue ━━━━┓
                │               ├─ HelloWorld.vue ━━━━
                └─ style.css ━━━
```

### 模块缓存

浏览器会缓存已加载的模块：
```javascript
// 第一次导入：发送网络请求
import { ref } from 'vue'

// 后续导入：使用缓存
import { reactive } from 'vue'  // 不会重新请求
```

Vite 使用查询参数控制缓存：
```javascript
// 源码修改后，时间戳变化
import App from '/src/App.vue?t=1234567890'  // 旧版本
import App from '/src/App.vue?t=1234567999'  // 新版本（缓存失效）
```

## 开发服务器配置

### 基础配置

```javascript
// vite.config.js
export default {
  server: {
    // 端口
    port: 3000,
    
    // 是否自动打开浏览器
    open: true,
    
    // 主机名
    host: 'localhost',
    
    // 启用 HTTPS
    https: false,
    
    // 启用 CORS
    cors: true,
    
    // 强制预优化
    force: false,
  }
}
```

### 端口配置

```javascript
export default {
  server: {
    port: 3000,
    
    // 端口被占用时自动尝试下一个可用端口
    strictPort: false,
  }
}
```

自动选择端口：
```javascript
export default {
  server: {
    port: 3000,
    strictPort: false,
  }
}

// 如果 3000 被占用，自动尝试 3001, 3002...
```

强制使用指定端口：
```javascript
export default {
  server: {
    port: 3000,
    strictPort: true,  // 端口被占用时报错退出
  }
}
```

### 代理配置

解决跨域问题：

```javascript
export default {
  server: {
    proxy: {
      // 字符串简写
      '/api': 'http://localhost:8080',
      
      // 完整配置
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      
      // 多个代理规则
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
      },
      '/socket': {
        target: 'ws://localhost:8080',
        ws: true,  // 代理 WebSocket
      }
    }
  }
}
```

**实际应用**：
```javascript
// 前端代码
fetch('/api/users')
  .then(res => res.json())

// 实际请求
// 开发环境：http://localhost:3000/api/users → http://localhost:8080/api/users
// 生产环境：http://your-domain.com/api/users （需要配置 Nginx）
```

### HTTPS 配置

#### 方式1：使用自签名证书

```javascript
export default {
  server: {
    https: true,  // 自动生成自签名证书
  }
}
```

#### 方式2：使用自定义证书

```javascript
import fs from 'fs'

export default {
  server: {
    https: {
      key: fs.readFileSync('path/to/server.key'),
      cert: fs.readFileSync('path/to/server.crt'),
    }
  }
}
```

#### 方式3：使用 @vitejs/plugin-basic-ssl

```bash
npm install @vitejs/plugin-basic-ssl -D
```

```javascript
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()],
  server: {
    https: true,
  }
}
```

### 主机配置

**监听所有地址**（局域网访问）：
```javascript
export default {
  server: {
    host: '0.0.0.0',  // 或 true
  }
}
```

命令行方式：
```bash
vite --host
# 或
vite --host 0.0.0.0
```

**输出局域网地址**：
```
VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### 预热常用文件

提升首屏加载速度：

```javascript
export default {
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/components/HomePage.vue',
        './src/components/Header.vue',
      ]
    }
  }
}
```

## 性能优化技巧

### 1. 依赖预构建优化

```javascript
export default {
  optimizeDeps: {
    // 手动指定需要预构建的依赖
    include: ['vue', 'vue-router', 'pinia'],
    
    // 排除不需要预构建的依赖
    exclude: ['your-local-package'],
  }
}
```

### 2. 文件系统缓存

Vite 会缓存预构建的依赖：
```
node_modules/.vite/
  ├── deps/              # 预构建的依赖
  ├── deps_temp/         # 临时目录
  └── _metadata.json     # 缓存元数据
```

清除缓存：
```bash
# 删除缓存
rm -rf node_modules/.vite

# 或使用命令行参数
vite --force
```

### 3. 减少模块数量

**优化前**：
```javascript
// 导入整个库
import _ from 'lodash-es'  // 上百个模块
```

**优化后**：
```javascript
// 按需导入
import debounce from 'lodash-es/debounce'  // 只加载需要的模块
```

### 4. 使用动态导入

```javascript
// 同步导入（所有路由一起加载）
import Home from './views/Home.vue'
import About from './views/About.vue'

// 动态导入（路由懒加载）
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')
```

## 常见问题

### 1. 开发服务器启动慢

**检查依赖预构建**：
```bash
# 查看哪些依赖被预构建
vite --debug optimize
```

**优化方案**：
```javascript
export default {
  optimizeDeps: {
    // 明确指定需要预构建的依赖
    include: ['vue', 'vue-router', 'axios'],
  }
}
```

### 2. 模块请求过多

开发环境可能有上百个模块请求，这是正常的：
- 生产环境会打包优化
- HTTP/2 支持多路复用，性能影响小
- 首次加载后浏览器会缓存

### 3. 跨域问题

使用代理配置：
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-server.com',
        changeOrigin: true,
      }
    }
  }
}
```

## 工程实践建议

### 开发配置模板

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    // 端口
    port: 3000,
    
    // 自动打开浏览器
    open: true,
    
    // 局域网访问
    host: true,
    
    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
    
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/components/**/*.vue'],
    }
  },
  
  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  }
})
```

## 参考资料

- [Vite 服务器选项](https://cn.vitejs.dev/config/server-options.html)
- [依赖预构建](https://cn.vitejs.dev/guide/dep-pre-bundling.html)
- [浏览器 ESM 规范](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
