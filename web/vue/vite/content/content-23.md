# esbuild 集成原理

## 概述

esbuild 是 Vite 的核心依赖，负责依赖预构建和代码转译。本章深入解析 esbuild 架构、预构建流程、转换机制、以及性能优势。

## esbuild 架构与优势

### 核心特点

**1. Go 语言编写**
- 编译为原生机器码
- 无需 JavaScript 运行时
- 充分利用多核 CPU

**2. 并行处理**
- 同时处理多个文件
- 并行解析、转换、生成
- 最大化 CPU 利用率

**3. 高效的内存使用**
- 最少的数据传递
- 共享 AST 数据
- 避免序列化/反序列化

### 性能对比

```
转译 TypeScript (10000 个文件):
Babel:      20-30s
tsc:        30-40s
esbuild:    1-2s

性能提升：15-30倍
```

### 架构设计

```
源码
  ↓
[解析器]（并行）
  ↓
AST
  ↓
[转换器]（并行）
  ↓
转换后的 AST
  ↓
[生成器]（并行）
  ↓
输出代码
```

## 预构建流程详解

### 完整流程

```
1. 扫描入口文件
     ↓
2. 发现裸模块导入
     ↓
3. 确定需要预构建的依赖
     ↓
4. 使用 esbuild 打包依赖
     ↓
5. 输出到 .vite/deps/
     ↓
6. 生成元数据文件
     ↓
7. 重写模块导入路径
```

### 扫描阶段

```javascript
// Vite 内部实现
async function scanImports(entry: string) {
  const deps = new Set<string>()
  
  // 使用 esbuild 扫描
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [
      {
        name: 'scan-deps',
        setup(build) {
          // 拦截裸模块导入
          build.onResolve({ filter: /^[\w@]/ }, ({ path }) => {
            deps.add(path)
            return { path, external: true }
          })
        }
      }
    ]
  })
  
  return Array.from(deps)
}
```

### 预构建阶段

```javascript
async function optimizeDeps(deps: string[]) {
  const result = await esbuild.build({
    entryPoints: deps,
    bundle: true,
    format: 'esm',
    splitting: true,
    outdir: 'node_modules/.vite/deps',
    
    // 性能优化
    minify: false,          // 开发环境不压缩
    sourcemap: 'inline',    // 内联 sourcemap
    target: 'esnext',       // 最新语法
    
    // 插件
    plugins: [
      // 处理 CommonJS
      commonjsPlugin(),
      // 处理外部依赖
      externalPlugin()
    ]
  })
  
  return result
}
```

### 输出结果

```
node_modules/.vite/deps/
├── vue.js                  # 预构建的 vue
├── vue.js.map             # sourcemap
├── axios.js               # 预构建的 axios
├── chunk-XXX.js           # 共享代码块
└── _metadata.json         # 元数据
```

## TS/JSX 转换机制

### TypeScript 转译

```typescript
// 源码
interface User {
  id: number
  name: string
}

const user: User = {
  id: 1,
  name: 'John'
}

export function getUser(): User {
  return user
}
```

**esbuild 转译后**：
```javascript
const user = {
  id: 1,
  name: "John"
}

export function getUser() {
  return user
}
```

**特点**：
- 仅移除类型注解
- 不进行类型检查
- 保留 JavaScript 语义

### JSX 转换

```jsx
// 源码 (React)
function Button({ text, onClick }) {
  return (
    <button className="btn" onClick={onClick}>
      {text}
    </button>
  )
}
```

**esbuild 转译后**：
```javascript
import { jsx } from "react/jsx-runtime"

function Button({ text, onClick }) {
  return jsx("button", {
    className: "btn",
    onClick,
    children: text
  })
}
```

### 配置选项

```javascript
// vite.config.js
export default {
  esbuild: {
    // JSX 工厂函数
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    
    // JSX 运行时（React 17+）
    jsxDev: false,
    
    // 目标环境
    target: 'es2020',
    
    // 保留函数名
    keepNames: true
  }
}
```

## 代码压缩优化

### esbuild 压缩

```javascript
export default {
  build: {
    minify: 'esbuild',
    
    // esbuild 选项
    esbuildOptions: {
      minify: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      
      // 保留特定标识
      keepNames: false,
      
      // 移除 console
      drop: ['console', 'debugger'],
      
      // 定义常量
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    }
  }
}
```

### 压缩效果

```javascript
// 源码
function calculateSum(numbers) {
  const result = numbers.reduce((acc, num) => {
    return acc + num
  }, 0)
  return result
}

// esbuild 压缩后
function calculateSum(n){return n.reduce((a,u)=>a+u,0)}
```

### 与 terser 对比

```
压缩效果：
terser:   100%（最优）
esbuild:  95-98%（略逊）

压缩速度：
terser:   100%（基准）
esbuild:  2000-3000%（20-30倍）
```

**选择建议**：
- 开发构建：使用 esbuild（速度优先）
- 生产构建：根据需求选择（terser 体积更小，esbuild 速度更快）

## esbuild 限制与替代

### 不支持的特性

**1. const enum**：
```typescript
// ❌ esbuild 不支持
const enum Direction {
  Up,
  Down
}

// ✅ 替代方案：使用普通 enum
enum Direction {
  Up,
  Down
}
```

**2. 装饰器元数据**：
```typescript
// ❌ esbuild 不完全支持
import "reflect-metadata"

@Injectable()
class Service {
  @Inject() repo: Repository
}

// ✅ 替代方案：使用 SWC 或 tsc
```

**3. namespace**：
```typescript
// ⚠️ esbuild 部分支持
namespace MyNamespace {
  export const value = 123
}

// ✅ 替代方案：使用 ES modules
export const MyNamespace = {
  value: 123
}
```

### 类型检查

esbuild 不进行类型检查：

```typescript
// 这段代码有类型错误，但 esbuild 不会报错
const num: number = "hello"  // 类型错误
```

**解决方案**：
```bash
# 使用 tsc 进行类型检查
tsc --noEmit

# 或使用 vue-tsc
vue-tsc --noEmit

# 在构建脚本中结合
"build": "tsc --noEmit && vite build"
```

### 使用插件解决限制

```bash
npm install -D @vitejs/plugin-react-swc
```

```javascript
import react from '@vitejs/plugin-react-swc'

export default {
  plugins: [
    react({
      // 使用 SWC 替代 esbuild 处理 React
      tsDecorators: true
    })
  ]
}
```

## 自定义 esbuild 插件

### 插件结构

```javascript
const myEsbuildPlugin = {
  name: 'my-plugin',
  setup(build) {
    // 解析钩子
    build.onResolve({ filter: /^virtual:/ }, (args) => {
      return { path: args.path, namespace: 'virtual' }
    })
    
    // 加载钩子
    build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
      return {
        contents: 'export default "virtual module"',
        loader: 'js'
      }
    })
  }
}
```

### 在 Vite 中使用

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [myEsbuildPlugin]
    }
  }
}
```

### 实战示例：环境变量注入

```javascript
const envInjectPlugin = (env) => ({
  name: 'env-inject',
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      const contents = await fs.readFile(args.path, 'utf8')
      
      // 替换环境变量
      const replaced = contents.replace(
        /process\.env\.(\w+)/g,
        (match, key) => {
          return JSON.stringify(env[key] || '')
        }
      )
      
      return {
        contents: replaced,
        loader: 'js'
      }
    })
  }
})

// 使用
export default {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        envInjectPlugin({
          API_URL: 'https://api.example.com'
        })
      ]
    }
  }
}
```

## 性能优化技巧

### 1. 减少文件数量

```javascript
// ❌ 避免：大量小文件
import util1 from './utils/util1'
import util2 from './utils/util2'
// ... 100 个导入

// ✅ 推荐：合并导出
// utils/index.js
export * from './util1'
export * from './util2'
// ...

import { util1, util2 } from './utils'
```

### 2. 使用缓存

```javascript
// esbuild 内部缓存机制
const cache = new Map()

build.onLoad({ filter: /\.ts$/ }, async (args) => {
  const cacheKey = args.path
  const cached = cache.get(cacheKey)
  
  // 检查文件是否修改
  const stat = await fs.stat(args.path)
  if (cached && cached.mtime === stat.mtimeMs) {
    return cached.result
  }
  
  // 转译文件
  const contents = await fs.readFile(args.path, 'utf8')
  const result = await transform(contents)
  
  // 缓存结果
  cache.set(cacheKey, {
    result,
    mtime: stat.mtimeMs
  })
  
  return result
})
```

### 3. 并行处理

```javascript
// 利用 esbuild 的并行能力
await esbuild.build({
  entryPoints: [
    'src/main.ts',
    'src/worker.ts',
    'src/sw.ts'
  ],
  bundle: true,
  // esbuild 会自动并行处理这些入口
})
```

### 4. 目标环境优化

```javascript
export default {
  esbuild: {
    // 现代浏览器，减少转译
    target: 'es2020',
    
    // 旧浏览器，增加转译
    // target: 'es2015'
  }
}
```

## 调试技巧

### 1. 查看 esbuild 输出

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    esbuildOptions: {
      // 输出详细日志
      logLevel: 'debug',
      
      // 不压缩，方便查看
      minify: false,
      
      // 生成 sourcemap
      sourcemap: true,
      
      // 输出元信息
      metafile: true
    }
  }
}
```

### 2. 分析构建结果

```javascript
import esbuild from 'esbuild'

const result = await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  metafile: true,
  write: false
})

// 分析元信息
const analysis = await esbuild.analyzeMetafile(result.metafile, {
  verbose: true
})

console.log(analysis)
```

### 3. 性能分析

```javascript
console.time('esbuild')

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js'
})

console.timeEnd('esbuild')
// esbuild: 123ms
```

## 实战配置

### 完整的 esbuild 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 全局 esbuild 配置
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`,
    target: 'es2020',
    keepNames: false,
    drop: ['console', 'debugger']
  },
  
  // 依赖预构建配置
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      
      plugins: [
        {
          name: 'custom-plugin',
          setup(build) {
            // 自定义处理
          }
        }
      ],
      
      define: {
        'process.env.NODE_ENV': '"development"'
      }
    }
  },
  
  // 构建配置
  build: {
    // 使用 esbuild 压缩（速度优先）
    minify: 'esbuild',
    
    // 或使用 terser（体积优先）
    // minify: 'terser',
    
    target: 'es2020'
  }
})
```

## 参考资料

- [esbuild 官网](https://esbuild.github.io/)
- [esbuild API](https://esbuild.github.io/api/)
- [Vite esbuild 配置](https://cn.vitejs.dev/config/shared-options.html#esbuild)
