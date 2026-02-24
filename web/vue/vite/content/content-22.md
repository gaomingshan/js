# 模块解析机制

## 概述

Vite 的模块解析是其核心功能之一，负责将各种导入语句转换为浏览器可识别的 URL。本章深入解析 ESM 模块解析规则、裸模块处理、依赖图构建等底层机制。

## ESM 模块解析规则

### 浏览器原生 ESM

浏览器只支持以下三种导入方式：

```javascript
// 1. 相对路径
import { foo } from './module.js'
import { bar } from '../utils/helper.js'

// 2. 绝对路径
import { baz } from '/src/components/App.vue'

// 3. 完整 URL
import { qux } from 'https://cdn.example.com/library.js'
```

**不支持的导入**（Vite 需要转换）：
```javascript
// 裸模块导入（bare import）
import { ref } from 'vue'  // ❌ 浏览器不识别

// 省略扩展名
import App from './App'  // ❌ 需要完整路径
```

### Vite 转换过程

**源码**：
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
```

**浏览器接收到的代码**：
```javascript
import { createApp } from '/@fs/node_modules/.vite/deps/vue.js?v=abc123'
import App from '/src/App.vue?t=1234567890'
import '/src/style.css?t=1234567890'
```

## 裸模块导入处理（Bare Import）

### 什么是裸模块

裸模块是不以 `.`、`/` 或 `http` 开头的导入：

```javascript
// 裸模块
import vue from 'vue'
import axios from 'axios'
import { debounce } from 'lodash-es'

// 非裸模块
import App from './App.vue'
import utils from '/src/utils.js'
```

### 解析流程

```
1. 检测裸模块导入
     ↓
2. 查找 node_modules
     ↓
3. 读取 package.json
     ↓
4. 确定入口文件（module/main）
     ↓
5. 预构建（如需要）
     ↓
6. 重写为完整路径
```

### 预构建路径重写

```javascript
// 源码
import { ref } from 'vue'

// Vite 重写为
import { ref } from '/@fs/node_modules/.vite/deps/vue.js?v=abc123'

// 其中：
// /@fs/ - 文件系统路径前缀
// .vite/deps/ - 预构建目录
// ?v=abc123 - 版本标识（缓存控制）
```

### Package.json 解析优先级

```json
{
  "name": "my-package",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",  // 1. 最高优先级
      "require": "./dist/index.cjs"
    }
  },
  "module": "./dist/index.esm.js",   // 2. ESM 入口
  "main": "./dist/index.js"           // 3. CommonJS 入口
}
```

Vite 解析顺序：
```
1. exports.import
2. module
3. main (需要预构建转换)
```

## 依赖图构建

### 依赖图结构

```javascript
// 入口文件
index.html
  └─ /src/main.js
      ├─ vue (预构建依赖)
      ├─ /src/App.vue
      │   ├─ /src/components/Header.vue
      │   └─ /src/components/Footer.vue
      └─ /src/style.css
```

### 模块节点

Vite 为每个模块创建一个节点：

```javascript
class ModuleNode {
  url: string                    // 模块 URL
  id: string | null              // 解析后的完整路径
  file: string | null            // 文件系统路径
  type: 'js' | 'css'             // 模块类型
  
  importers: Set<ModuleNode>     // 哪些模块导入了它
  importedModules: Set<ModuleNode>  // 它导入了哪些模块
  
  transformResult: TransformResult | null  // 转换结果缓存
  ssrTransformResult: TransformResult | null
  
  lastHMRTimestamp: number       // 最后 HMR 时间戳
}
```

### 依赖图操作

```javascript
// Vite 内部使用 ModuleGraph
class ModuleGraph {
  // 获取模块
  getModuleById(id: string): ModuleNode | undefined
  
  // 获取模块的所有导入者
  getModulesByFile(file: string): Set<ModuleNode> | undefined
  
  // 使模块失效（HMR）
  invalidateModule(mod: ModuleNode): void
  
  // 更新模块
  updateModuleInfo(mod: ModuleNode, ...): void
}
```

### HMR 更新传播

```javascript
// 文件修改后
1. 找到对应的 ModuleNode
2. 遍历其 importers（导入者）
3. 检查是否有 HMR 边界
4. 向上传播直到找到边界或到达根
5. 发送 HMR 更新到客户端
```

## 循环依赖处理

### 循环依赖示例

```javascript
// A.js
import { b } from './B.js'
export const a = 'A' + b

// B.js
import { a } from './A.js'
export const b = 'B' + a
```

### ESM 循环依赖机制

ESM 支持循环依赖，通过"活绑定"（live binding）实现：

```javascript
// 执行顺序：
1. 创建 A.js 模块
2. 开始执行 A.js
3. 遇到 import B，暂停 A.js
4. 创建 B.js 模块
5. 开始执行 B.js
6. 遇到 import A，此时 A.js 的导出还未定义
7. 继续执行 B.js，导出 b（此时引用的 a 是 undefined）
8. 返回 A.js，继续执行
9. 导出 a
```

### 实际运行结果

```javascript
// A.js
import { b } from './B.js'
console.log('A:', b)  // 'B' + undefined
export const a = 'A'

// B.js
import { a } from './A.js'
console.log('B:', a)  // undefined
export const b = 'B' + a  // 'Bundefined'
```

### 避免循环依赖

```javascript
// ✅ 方案1：使用函数延迟访问
// A.js
import { getB } from './B.js'
export const a = 'A'
export function getA() {
  return a + getB()
}

// B.js
import { getA } from './A.js'
export const b = 'B'
export function getB() {
  return b + getA()
}

// ✅ 方案2：提取公共依赖
// shared.js
export const config = {}

// A.js
import { config } from './shared.js'

// B.js
import { config } from './shared.js'
```

## 动态导入实现

### 语法转换

```javascript
// 源码
const module = await import('./module.js')

// Vite 转换为
const module = await import('/src/module.js?t=1234567890')
```

### 动态导入的代码分割

```javascript
// 自动生成独立 chunk
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')

// 构建产物
// dist/
//   ├── main.js
//   ├── Home.js      # 独立 chunk
//   └── About.js     # 独立 chunk
```

### 动态变量处理

```javascript
// ❌ 完全动态（不支持）
import(dynamicPath)

// ✅ 部分动态（支持）
import(`./views/${name}.vue`)

// Vite 会分析可能的模块范围
// 并预先打包这些模块
```

### Glob 导入

Vite 提供的特殊语法：

```javascript
// 导入所有匹配的模块
const modules = import.meta.glob('./views/*.vue')

// 等价于
const modules = {
  './views/Home.vue': () => import('./views/Home.vue'),
  './views/About.vue': () => import('./views/About.vue')
}

// 使用
const Home = await modules['./views/Home.vue']()
```

**Eager 模式**：
```javascript
// 直接导入（不使用动态导入）
const modules = import.meta.glob('./views/*.vue', { eager: true })

// 等价于
import Home from './views/Home.vue'
import About from './views/About.vue'

const modules = {
  './views/Home.vue': Home,
  './views/About.vue': About
}
```

## 模块联邦支持

### 基础概念

模块联邦允许多个独立构建的应用共享模块：

```javascript
// App A 暴露模块
export default {
  name: 'app-a',
  exposes: {
    './Button': './src/Button.vue'
  }
}

// App B 消费模块
import Button from 'app-a/Button'
```

### Vite 实现

```bash
npm install -D @originjs/vite-plugin-federation
```

```javascript
// vite.config.js
import federation from '@originjs/vite-plugin-federation'

export default {
  plugins: [
    federation({
      name: 'host-app',
      remotes: {
        remote_app: 'http://localhost:5001/assets/remoteEntry.js'
      },
      shared: ['vue', 'vue-router']
    })
  ]
}
```

## 路径解析优化

### 缓存机制

```javascript
// Vite 内部缓存
const resolveCache = new Map<string, string>()

function resolveId(id: string, importer?: string) {
  const cacheKey = `${id}:${importer}`
  
  if (resolveCache.has(cacheKey)) {
    return resolveCache.get(cacheKey)
  }
  
  const resolved = actualResolve(id, importer)
  resolveCache.set(cacheKey, resolved)
  
  return resolved
}
```

### 文件扩展名补全

```javascript
// 尝试顺序
const extensions = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']

function tryResolve(path: string) {
  // 1. 尝试原路径
  if (fs.existsSync(path)) return path
  
  // 2. 尝试添加扩展名
  for (const ext of extensions) {
    const withExt = path + ext
    if (fs.existsSync(withExt)) return withExt
  }
  
  // 3. 尝试 index 文件
  for (const ext of extensions) {
    const indexPath = path + '/index' + ext
    if (fs.existsSync(indexPath)) return indexPath
  }
  
  return null
}
```

### 符号链接处理

```javascript
// 处理 npm link 或 Monorepo
function resolveSymlink(path: string) {
  const realPath = fs.realpathSync(path)
  
  // 如果是符号链接，解析真实路径
  if (realPath !== path) {
    console.log(`符号链接: ${path} -> ${realPath}`)
  }
  
  return realPath
}
```

## 调试技巧

### 1. 查看模块图

```javascript
// 在插件中访问 ModuleGraph
export default {
  name: 'debug-module-graph',
  
  configureServer(server) {
    // 打印所有模块
    server.httpServer?.on('listening', () => {
      setTimeout(() => {
        console.log('=== Module Graph ===')
        server.moduleGraph.idToModuleMap.forEach((mod, id) => {
          console.log(`${id}:`)
          console.log(`  导入者: ${mod.importers.size}`)
          console.log(`  导入: ${mod.importedModules.size}`)
        })
      }, 2000)
    })
  }
}
```

### 2. 调试模块解析

```javascript
// vite.config.js
export default {
  plugins: [
    {
      name: 'debug-resolve',
      
      resolveId(id, importer) {
        console.log('解析:', id, '来自:', importer)
        return null  // 继续默认解析
      },
      
      load(id) {
        console.log('加载:', id)
        return null  // 继续默认加载
      }
    }
  ]
}
```

### 3. 启用调试日志

```bash
# 模块解析日志
DEBUG=vite:resolve vite

# 依赖预构建日志
DEBUG=vite:deps vite

# 所有日志
DEBUG=vite:* vite
```

## 性能监控

### 解析性能统计

```javascript
const resolveStats = {
  count: 0,
  totalTime: 0,
  cache: {
    hits: 0,
    misses: 0
  }
}

function resolveWithStats(id, importer) {
  resolveStats.count++
  const start = performance.now()
  
  const cached = cache.get(id)
  if (cached) {
    resolveStats.cache.hits++
    return cached
  }
  
  resolveStats.cache.misses++
  const result = actualResolve(id, importer)
  cache.set(id, result)
  
  resolveStats.totalTime += performance.now() - start
  
  return result
}

// 输出统计
setInterval(() => {
  console.log('解析统计:', {
    总次数: resolveStats.count,
    平均耗时: (resolveStats.totalTime / resolveStats.count).toFixed(2) + 'ms',
    缓存命中率: ((resolveStats.cache.hits / resolveStats.count) * 100).toFixed(2) + '%'
  })
}, 10000)
```

## 参考资料

- [ESM 规范](https://tc39.es/ecma262/#sec-modules)
- [Node.js 模块解析](https://nodejs.org/api/modules.html)
- [Vite 源码 - Module Graph](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/moduleGraph.ts)
