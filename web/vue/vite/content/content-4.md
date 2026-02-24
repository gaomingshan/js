# 依赖预构建

## 概述

依赖预构建是 Vite 性能优化的核心机制之一。通过 esbuild 将 node_modules 中的依赖预先打包，Vite 实现了快速的依赖加载和高效的模块解析。本章深入解析依赖预构建的原理、流程和优化策略。

## 为什么需要预构建

### 问题1：CommonJS 和 UMD 兼容性

浏览器只支持 ESM，但许多 npm 包仍使用 CommonJS 或 UMD 格式：

```javascript
// lodash 使用 CommonJS
const _ = require('lodash')  // ❌ 浏览器不支持 require

// 预构建后转换为 ESM
import _ from 'lodash'  // ✅ 浏览器支持
```

### 问题2：大量的小文件请求

某些包（如 lodash-es）包含数百个模块。预构建将多个模块合并为一个文件。

### 问题3：模块解析性能

浏览器解析大量小模块会占用大量时间，预构建可以优化这一过程。

## esbuild 预构建流程

### 完整流程

```
1. 启动 Vite 开发服务器
2. 扫描入口文件（index.html）
3. 发现 import 的裸模块（bare imports）
4. 使用 esbuild 预构建这些依赖
5. 输出到 node_modules/.vite/deps/
6. 生成 _metadata.json（缓存信息）
7. 服务器就绪
```

### 输出结构

```
node_modules/.vite/
├── deps/
│   ├── vue.js
│   ├── axios.js
│   └── lodash-es.js
└── _metadata.json
```

## 预构建配置优化

### 1. 手动指定依赖（include）

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'axios',
    ]
  }
}
```

### 2. 排除依赖（exclude）

```javascript
export default {
  optimizeDeps: {
    exclude: [
      'your-local-package',
    ]
  }
}
```

### 3. 强制重新预构建

```bash
vite --force
```

## 参考资料

- [Vite 依赖预构建](https://cn.vitejs.dev/guide/dep-pre-bundling.html)
- [esbuild 官网](https://esbuild.github.io/)
