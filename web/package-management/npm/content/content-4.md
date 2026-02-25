# 依赖类型与使用场景

## 概述

npm 提供了多种依赖类型，每种类型都有其特定的用途和安装行为。正确区分和使用依赖类型，是管理项目依赖的基础，也是避免包体积膨胀和依赖冲突的关键。

## 依赖类型概览

| 依赖类型 | 字段名 | 安装时机 | 使用场景 |
|---------|--------|---------|---------|
| **生产依赖** | dependencies | 总是安装 | 运行时必需 |
| **开发依赖** | devDependencies | 仅开发时 | 构建、测试工具 |
| **同伴依赖** | peerDependencies | 由宿主安装 | 插件、组件库 |
| **可选依赖** | optionalDependencies | 尝试安装 | 平台特定功能 |
| **捆绑依赖** | bundledDependencies | 打包发布 | 私有或特定版本 |

## dependencies（生产依赖）

### 定义与用途

生产依赖是项目运行时必须的包，无论在开发、测试还是生产环境都会被安装。

**示例：**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0",
    "lodash": "^4.17.21"
  }
}
```

### 安装方式

```bash
# 方式 1：默认安装到 dependencies
npm install axios

# 方式 2：显式指定（npm 5+ 不需要）
npm install axios --save
npm install axios -S

# 安装多个包
npm install axios lodash react
```

### 使用场景

**✅ 应该放入 dependencies：**
- 核心框架：React、Vue、Angular
- 工具库：Lodash、Moment.js、Axios
- 状态管理：Redux、Vuex、Zustand
- UI 组件库：Ant Design、Material-UI
- 运行时必需的包

**❌ 不应该放入 dependencies：**
- 构建工具：Webpack、Rollup、Vite
- 测试工具：Jest、Mocha、Vitest
- 代码检查：ESLint、Prettier
- 类型定义：@types/* 包

### 实际案例

**前端 SPA 项目：**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.4.0",
    "antd": "^5.7.0"
  }
}
```

**Node.js 后端项目：**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.3.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0"
  }
}
```

## devDependencies（开发依赖）

### 定义与用途

开发依赖仅在开发和构建阶段需要，不会在生产环境安装。

**示例：**
```json
{
  "devDependencies": {
    "webpack": "^5.88.0",
    "babel-loader": "^9.1.0",
    "eslint": "^8.45.0",
    "jest": "^29.6.0",
    "@types/react": "^18.2.0"
  }
}
```

### 安装方式

```bash
# 安装到 devDependencies
npm install -D webpack
npm install --save-dev webpack

# 同时安装多个
npm install -D webpack webpack-cli babel-loader
```

### 生产环境排除

```bash
# 仅安装 dependencies
npm install --production
npm install --omit=dev

# CI/CD 中推荐使用
npm ci --production
```

**包体积对比：**
```bash
# 完整安装
npm install
du -sh node_modules  # 500MB

# 生产安装
npm install --production
du -sh node_modules  # 150MB
```

### 使用场景

**✅ 应该放入 devDependencies：**
- **构建工具**：Webpack、Vite、Rollup、Parcel
- **编译器**：Babel、TypeScript、SWC
- **测试框架**：Jest、Vitest、Mocha、Chai
- **代码质量**：ESLint、Prettier、Stylelint
- **类型定义**：@types/* 包
- **开发服务器**：webpack-dev-server、nodemon
- **文档工具**：JSDoc、TypeDoc

**实际案例：**
```json
{
  "devDependencies": {
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.1.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.0",
    "prettier": "^3.0.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.4.0"
  }
}
```

## peerDependencies（同伴依赖）

### 定义与用途

同伴依赖声明包与宿主项目共享的依赖，避免重复安装相同的包。

**设计动机：**
- 插件需要与宿主使用同一个库实例
- 避免多版本冲突
- 减少包体积

### 典型场景：插件模式

**React 组件库示例：**
```json
{
  "name": "my-react-components",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

**为什么需要 peer 依赖？**
```javascript
// 如果组件库和宿主项目各自安装 React

// my-react-components/node_modules/react（版本 18.0.0）
// 项目/node_modules/react（版本 18.2.0）

// 问题：
// 1. React Hooks 规则失效
// 2. Context 无法共享
// 3. 包体积增大
```

### npm 版本差异

**npm 3-6：仅警告**
```bash
npm install my-react-components

npm WARN peerDependencies react@>=16.8.0 required
npm WARN peerDependencies react-dom@>=16.8.0 required

# 不会自动安装，需要手动安装
npm install react react-dom
```

**npm 7+：自动安装**
```bash
npm install my-react-components

# 自动安装 peer 依赖
✓ Installed react@18.2.0
✓ Installed react-dom@18.2.0
```

**版本冲突处理：**
```bash
# 项目已有 react@17.0.0
# 安装需要 react@>=18.0.0 的包

npm install some-react-package

# npm 7+ 报错
npm ERR! Could not resolve dependency:
npm ERR! peer react@">=18.0.0" from some-react-package

# 解决方案 1：升级 react
npm install react@^18.0.0

# 解决方案 2：使用 legacy 模式
npm install --legacy-peer-deps

# 解决方案 3：使用 force（不推荐）
npm install --force
```

### peerDependenciesMeta（可选同伴依赖）

**npm 7+ 新特性：**
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-native": ">=0.60.0"
  },
  "peerDependenciesMeta": {
    "react-native": {
      "optional": true
    }
  }
}
```

**使用场景：**
- 多平台支持（Web + React Native）
- 可选功能增强

### 实际案例

**Webpack 插件：**
```json
{
  "name": "my-webpack-plugin",
  "peerDependencies": {
    "webpack": "^5.0.0"
  }
}
```

**ESLint 插件：**
```json
{
  "name": "eslint-plugin-custom",
  "peerDependencies": {
    "eslint": ">=7.0.0"
  }
}
```

### 版本范围最佳实践

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",        // ✅ 宽松，兼容性好
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",  // ✅ 多版本支持
    "react": "18.2.0",          // ❌ 过于严格
    "react": "*"                // ❌ 过于宽松
  }
}
```

## optionalDependencies（可选依赖）

### 定义与用途

可选依赖即使安装失败也不会导致整个安装过程失败。

**示例：**
```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  }
}
```

### 使用场景

**平台特定依赖：**
```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // 仅 macOS 可用
  }
}
```

**性能优化依赖：**
```json
{
  "optionalDependencies": {
    "sharp": "^0.32.0"  // 原生图片处理，失败时降级到 JS 实现
  }
}
```

### 代码处理

```javascript
let fsevents;
try {
  fsevents = require('fsevents');
  console.log('使用原生文件监听');
} catch (err) {
  console.log('降级到轮询方式');
  fsevents = null;
}

function watchFile(path) {
  if (fsevents) {
    return fsevents.watch(path);
  } else {
    return fs.watch(path);  // 降级方案
  }
}
```

### 注意事项

**覆盖规则：**
```json
{
  "dependencies": {
    "package-a": "^1.0.0"
  },
  "optionalDependencies": {
    "package-a": "^2.0.0"  // 会覆盖 dependencies
  }
}
```

**建议：**
- 优先使用 optional peer 依赖
- 确保有降级方案
- 明确文档说明可选功能

## bundledDependencies（捆绑依赖）

### 定义与用途

捆绑依赖会在 `npm pack` 和 `npm publish` 时一起打包。

**示例：**
```json
{
  "bundledDependencies": [
    "private-module",
    "forked-package"
  ],
  "dependencies": {
    "private-module": "^1.0.0",
    "forked-package": "file:./local-fork"
  }
}
```

### 使用场景

**1. 私有模块**
```json
{
  "bundledDependencies": ["internal-lib"],
  "dependencies": {
    "internal-lib": "file:../internal-lib"
  }
}
```

**2. 修改过的第三方包**
```json
{
  "bundledDependencies": ["patched-package"],
  "dependencies": {
    "patched-package": "file:./patches/patched-package"
  }
}
```

**3. 确保版本一致性**
- 避免依赖源失效
- 锁定特定版本

### 发布效果

```bash
npm pack

# 生成的 tgz 文件包含：
my-package-1.0.0.tgz
├── package.json
├── index.js
└── node_modules/  # 包含 bundled 依赖
    └── private-module/
```

### 注意事项

- 会增大包体积
- 用户安装时不会重新下载
- 适合特殊场景，不要滥用

## 依赖类型选择决策树

```
需要安装的包？
├─ 生产环境运行时需要？
│  ├─ 是 → dependencies
│  └─ 否 → devDependencies
│
├─ 是插件/组件库？
│  └─ 需要宿主提供？
│     └─ 是 → peerDependencies
│
├─ 平台特定或可降级？
│  └─ 是 → optionalDependencies
│
└─ 需要打包发布？
   └─ 是 → bundledDependencies
```

## 深入一点：依赖提升与隔离

### npm/yarn 的依赖提升

```
项目 dependencies:
- A@1.0.0 (dev)
- B@1.0.0 (prod)

A devDependencies:
- C@1.0.0

结果（都提升到顶层）：
node_modules/
├── A/
├── B/
└── C/  # devDependency 也被提升
```

**问题：**
- 生产环境可能意外访问 dev 依赖
- 包体积分析不准确

### pnpm 的严格隔离

```
node_modules/
├── .pnpm/
│   ├── A@1.0.0/
│   │   └── node_modules/
│   │       ├── A/
│   │       └── C/  # 仅 A 可访问
│   └── B@1.0.0/
│       └── node_modules/
│           └── B/
├── A -> .pnpm/A@1.0.0/node_modules/A
└── B -> .pnpm/B@1.0.0/node_modules/B
```

**优势：**
- 严格依赖隔离
- 不会意外访问 dev 依赖

## 最佳实践

### 1. 依赖分类清晰

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "vitest": "^0.34.0",
    "@types/react": "^18.2.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

### 2. 版本范围合理

```json
{
  "dependencies": {
    "react": "^18.2.0",      // ✅ 允许次版本更新
    "lodash": "~4.17.21",    // ✅ 仅补丁更新
    "my-internal": "1.0.0"   // ✅ 锁定关键依赖
  }
}
```

### 3. 定期审查依赖

```bash
# 查看过时依赖
npm outdated

# 查看依赖树
npm ls --depth=0

# 查看包体积
npm install -g cost-of-modules
cost-of-modules
```

### 4. 生产环境优化

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# 仅安装生产依赖
RUN npm ci --production

COPY . .

CMD ["node", "server.js"]
```

### 5. Monorepo 依赖管理

```json
{
  "name": "root",
  "private": true,
  "workspaces": ["packages/*"],
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

**packages/pkg-a/package.json：**
```json
{
  "name": "@mono/pkg-a",
  "dependencies": {
    "@mono/pkg-b": "workspace:*"
  }
}
```

## 常见错误

### 错误 1：依赖类型混淆

```json
{
  "dependencies": {
    "webpack": "^5.0.0"  // ❌ 构建工具不应在这里
  }
}
```

**影响：**
- 生产包体积增大
- Docker 镜像膨胀

### 错误 2：peer 依赖版本过严

```json
{
  "peerDependencies": {
    "react": "18.2.0"  // ❌ 限制太死
  }
}
```

**后果：**
- 用户无法升级 React
- 兼容性差

### 错误 3：忘记声明 peer 依赖

```javascript
// 组件库代码
import React from 'react';  // 使用了 React

// package.json
{
  "dependencies": {
    // ❌ 没有声明 react
  }
}
```

**后果：**
- 可能安装多个 React 版本
- Hooks 报错

### 错误 4：滥用 optionalDependencies

```json
{
  "optionalDependencies": {
    "lodash": "^4.0.0"  // ❌ 核心依赖不应可选
  }
}
```

## 参考资料

- [npm dependencies 类型](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#dependencies)
- [peerDependencies 最佳实践](https://nodejs.org/en/blog/npm/peer-dependencies/)
- [npm 7 peer 依赖变化](https://github.blog/2021-02-02-npm-7-is-now-generally-available/)

---

**上一章：**[node_modules 目录结构与查找机制](./content-3.md)  
**下一章：**[语义化版本（SemVer）深入理解](./content-5.md)
