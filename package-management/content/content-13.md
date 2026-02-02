# Peer Dependencies 设计

## peer dependencies 的设计初衷

### 插件系统的依赖模型

**核心问题**：插件如何声明对宿主的依赖？

**错误方案 1**：插件自己安装宿主
```json
// react-router 的 package.json（错误）
{
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

**后果**：
```
node_modules/
├── react@18.2.0  (应用安装)
└── react-router/
    └── node_modules/
        └── react@18.2.0  (插件安装，重复！)
```

**问题**：
- 两个 React 实例共存
- Context 失效
- Hooks 报错

**错误方案 2**：不声明依赖
```json
// react-router 的 package.json（错误）
{
  "dependencies": {}
}
```

**后果**：
- 没有版本约束
- 用户可能安装不兼容的 React
- 运行时错误

### 正确方案：peerDependencies

```json
// react-router 的 package.json（正确）
{
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**语义**：
- "我需要 React，但不自己安装"
- "请使用者提供兼容的 React"
- "React 由应用层统一管理"

**结果**：
```
node_modules/
├── react@18.2.0  (应用安装，唯一实例)
└── react-router/  (使用应用的 React)
```

---

## 插件系统的依赖模型

### 典型场景

**1. UI 框架插件**：
```json
// @mui/icons-material
{
  "peerDependencies": {
    "@mui/material": "^5.0.0",
    "react": "^17.0.0 || ^18.0.0"
  }
}
```

**2. 构建工具插件**：
```json
// babel-plugin-transform-runtime
{
  "peerDependencies": {
    "@babel/core": "^7.0.0"
  }
}
```

**3. 测试框架插件**：
```json
// jest-enzyme
{
  "peerDependencies": {
    "enzyme": "^3.0.0",
    "jest": ">=20.0.0"
  }
}
```

### 单例模式的保障

**为什么需要单例？**

**场景**：React Context
```javascript
// 应用代码
const ThemeContext = React.createContext();

<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// 插件代码（如果使用不同的 React 实例）
const theme = useContext(ThemeContext);  // undefined!
```

**原因**：
```javascript
// 应用的 React（实例 A）
const React_A = require('react');
React_A.createContext();

// 插件的 React（实例 B）
const React_B = require('react');
React_B.useContext();  // 访问不同的上下文池
```

**peerDependencies 确保**：
```javascript
// 应用和插件共享同一个 React 实例
const React = require('react');  // 唯一实例
```

---

## npm 3-6 vs npm 7+ 的行为差异

### npm 3-6：警告但不安装

**行为**：
```bash
npm install react-router

# 警告
npm WARN react-router@6.0.0 requires a peer of react@>=16.8.0 but none is installed.

# 不会自动安装 react
```

**用户需要手动安装**：
```bash
npm install react@18.2.0
```

### npm 7+：自动安装

**行为**：
```bash
npm install react-router

# 自动安装 peer dependencies
npm install react@latest  # 自动安装
```

**版本选择逻辑**：
```
peerDependencies: react@>=16.8.0
可用版本: [16.8.0, 17.0.0, 18.0.0, 18.2.0]
选择: 18.2.0 (最新的满足约束的版本)
```

### 冲突处理

**场景**：
```json
{
  "dependencies": {
    "react": "17.0.0",      // 应用指定 17
    "react-router": "6.0.0"  // 需要 >=16.8.0
  }
}
```

**npm 7+ 行为**：
```bash
npm install

# 使用应用指定的版本（17.0.0）
# 不会覆盖已存在的依赖
```

**冲突检测**：
```bash
npm install
# 如果 react@17.0.0 不满足 react-router 的要求
# npm ERR! Could not resolve dependency:
# npm ERR! peer react@">=18.0.0" from react-router@6.0.0
```

---

## peerDependenciesMeta 的使用

### 可选的 peer dependency

**场景**：TypeScript 类型定义
```json
{
  "name": "react-query",
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "typescript": ">=4.0.0"  // TypeScript 项目才需要
  },
  "peerDependenciesMeta": {
    "typescript": {
      "optional": true
    }
  }
}
```

**效果**：
```bash
# JavaScript 项目
npm install react-query
# 不会安装 typescript，也不会警告

# TypeScript 项目
npm install react-query typescript
# 使用类型定义
```

### 版本覆盖元数据

**npm 8.3+ 支持**：
```json
{
  "peerDependenciesMeta": {
    "react": {
      "optional": false,
      "version": "18.2.0"  // 覆盖 peerDependencies 中的版本
    }
  }
}
```

---

## 常见误区

### 误区 1：peerDependencies 和 dependencies 可以互换

**错误理解**：
```json
// 库项目（错误）
{
  "dependencies": {
    "react": "^18.0.0"  // ❌ 会被打包到库中
  }
}
```

**后果**：
```
应用安装库 → 安装了两份 React
→ Context/Hooks 失效
```

**正确做法**：
```json
{
  "peerDependencies": {
    "react": "^18.0.0"  // ✅ 由应用提供
  },
  "devDependencies": {
    "react": "^18.2.0"  // 开发时使用
  }
}
```

### 误区 2：忽略 peer dependency 警告

**危险**：
```bash
npm WARN package-a@1.0.0 requires a peer of react@^17.0.0 but none is installed.
# 继续开发...

# 运行时
Error: Invalid hook call. Hooks can only be called inside the body of a function component.
```

**根因**：缺少 peer dependency

**正确处理**：
```bash
# 查看所有 peer dependencies
npm ls --depth=0

# 安装缺失的依赖
npm install react@17.0.0
```

### 误区 3：peerDependencies 的版本范围过窄

**过严格**：
```json
{
  "peerDependencies": {
    "react": "18.2.0"  // ❌ 精确版本
  }
}
```

**问题**：
- 用户无法使用 React 18.2.1
- 灵活性差

**推荐**：
```json
{
  "peerDependencies": {
    "react": "^18.0.0"  // ✅ 允许 18.x
    // 或
    "react": ">=16.8.0"  // ✅ 更宽松
  }
}
```

---

## 工程实践

### 场景 1：库的 peerDependencies 配置

**React 组件库**：
```json
{
  "name": "my-ui-lib",
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true  // 服务端渲染可能不需要
    }
  },
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/react": "^18.0.0"
  }
}
```

**Webpack 插件**：
```json
{
  "name": "webpack-custom-plugin",
  "peerDependencies": {
    "webpack": "^5.0.0"
  },
  "devDependencies": {
    "webpack": "^5.75.0"
  }
}
```

### 场景 2：诊断 peer dependency 问题

**步骤**：
```bash
# 1. 查看所有 peer dependencies
npm ls

# 2. 检查未满足的 peer dependencies
npm ls | grep "UNMET PEER DEPENDENCY"

# 3. 查看特定包的 peer dependencies
npm info react-router peerDependencies

# 4. 检查版本兼容性
npm view react@17.0.0
npm view react-router peerDependencies
```

**自动修复**：
```bash
# npm 7+
npm install --legacy-peer-deps  # 忽略 peer dependencies 冲突
npm install --strict-peer-deps  # 严格检查 peer dependencies
```

### 场景 3：Monorepo 中的 peer dependencies

**问题**：
```
packages/
├── ui-lib/  (peerDependencies: react@^18.0.0)
└── app/     (dependencies: react@17.0.0)
```

**解决方案 1**：统一版本
```json
// 根目录 package.json
{
  "dependencies": {
    "react": "18.2.0"  // 所有子包共享
  }
}
```

**解决方案 2**：使用 workspace 协议
```json
// packages/app/package.json
{
  "dependencies": {
    "ui-lib": "workspace:*",
    "react": "workspace:*"  // 引用根目录的 react
  }
}
```

---

## 深入一点

### peer dependencies 的版本解析算法

**输入**：
```json
{
  "dependencies": {
    "pkg-a": "1.0.0",  // peerDependencies: react@^17.0.0
    "pkg-b": "1.0.0"   // peerDependencies: react@^18.0.0
  }
}
```

**解析逻辑**：
```javascript
function resolvePeerDependencies(packages) {
  const peerConstraints = [];
  
  for (const pkg of packages) {
    peerConstraints.push(...pkg.peerDependencies);
  }
  
  // 查找满足所有约束的版本
  const intersection = findIntersection(peerConstraints);
  
  if (!intersection) {
    throw new Error('Cannot satisfy peer dependencies');
  }
  
  return intersection;
}
```

**冲突示例**：
```
pkg-a: react@^17.0.0  (17.x)
pkg-b: react@^18.0.0  (18.x)
交集: 无

npm ERR! Could not resolve dependency
```

### 不同包管理器的处理差异

| 包管理器 | 自动安装 | 冲突处理 | 可选支持 |
|---------|---------|---------|---------|
| npm 3-6 | ❌ | 警告 | ❌ |
| npm 7+ | ✅ | 报错 | ✅ |
| Yarn Classic | ✅ | 警告 | ✅ |
| Yarn Berry | ✅ | 报错 | ✅ |
| pnpm | ✅ | 报错 | ✅ |

**pnpm 的严格性**：
```bash
pnpm install

# 如果缺少 peer dependency
ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies

react-router@6.0.0 requires a peer of react but none was installed.
```

### peer dependencies 的传递性

**问题**：peer dependencies 不传递

**示例**：
```
app → lib-a (peerDependencies: react)
app → lib-b → lib-c (peerDependencies: react)
```

**结果**：
- lib-a 的 peer dependency 对 app 可见
- lib-c 的 peer dependency 对 app **不可见**

**影响**：
```bash
npm install lib-b
# 不会提示 lib-c 需要 react
# 运行时可能报错
```

---

## 参考资料

- [npm peer dependencies 文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#peerdependencies)
- [Yarn peer dependencies](https://yarnpkg.com/configuration/manifest#peerDependencies)
- [peerDependenciesMeta](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#peerdependenciesmeta)
