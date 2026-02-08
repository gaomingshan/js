# pnpm 的 node_modules 结构

## .pnpm 虚拟存储目录

### 目录结构

**完整结构**：
```
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/          ← 硬链接到 store
│   ├── express@4.18.0/
│   │   └── node_modules/
│   │       ├── express/          ← 硬链接到 store
│   │       ├── body-parser@ → ../../body-parser@1.20.0/node_modules/body-parser
│   │       ├── cookie@ → ../../cookie@0.5.0/node_modules/cookie
│   │       └── ...
│   ├── body-parser@1.20.0/
│   │   └── node_modules/
│   │       ├── body-parser/      ← 硬链接到 store
│   │       └── bytes@ → ../../bytes@3.1.2/node_modules/bytes
│   └── ...
├── lodash@ → .pnpm/lodash@4.17.21/node_modules/lodash
├── express@ → .pnpm/express@4.18.0/node_modules/express
└── .modules.yaml  ← pnpm 元数据
```

### .pnpm 的命名规则

**格式**：`package-name@version`

**示例**：
```
.pnpm/
├── lodash@4.17.21/
├── @babel+core@7.20.0/           ← scope 包（+ 替代 /）
├── express@4.18.0/
└── react@18.2.0_react-dom@18.2.0/  ← peer dependency 变体
```

**peer dependency 变体**：
```
# 同一个包，不同 peer dependency 组合
.pnpm/
├── react-router@6.0.0_react@17.0.0/
└── react-router@6.0.0_react@18.0.0/
```

### .modules.yaml 文件

**元数据文件**：
```yaml
# node_modules/.modules.yaml
hoistedDependencies:
  /lodash/4.17.21: public
  /express/4.18.0: public

included:
  dependencies: true
  devDependencies: true
  optionalDependencies: true

injectedDeps: {}

layoutVersion: 5
packageManager: pnpm@8.0.0
pendingBuilds: []

publicHoistPattern:
  - '*eslint*'
  - '*prettier*'

registries:
  default: https://registry.npmjs.org/
  '@my-org': https://npm.pkg.github.com/

skipped: []

storeDir: /Users/username/.pnpm-store/v3

virtualStoreDir: .pnpm
```

**关键字段**：
- `virtualStoreDir`：虚拟存储位置（默认 `.pnpm`）
- `storeDir`：全局 store 位置
- `hoistedDependencies`：提升的依赖
- `publicHoistPattern`：公共提升模式

---

## 真实依赖与符号链接

### 依赖访问路径

**直接依赖**：
```javascript
// 项目代码
require('lodash');

// 解析路径
node_modules/lodash  ← 符号链接
  ↓
.pnpm/lodash@4.17.21/node_modules/lodash  ← 硬链接
  ↓
~/.pnpm-store/v3/files/.../lodash/
```

**间接依赖**：
```javascript
// express 内部代码
require('body-parser');

// 解析路径（从 express 所在目录开始）
.pnpm/express@4.18.0/node_modules/body-parser  ← 符号链接
  ↓
.pnpm/body-parser@1.20.0/node_modules/body-parser  ← 硬链接
  ↓
~/.pnpm-store/v3/files/.../body-parser/
```

### 依赖隔离机制

**场景**：项目依赖 lodash，但未声明

**npm/Yarn Classic（扁平化）**：
```
node_modules/
├── lodash/  ← 因 express 依赖而提升
└── express/

// 项目代码可以访问
require('lodash');  ✅ 能运行（幽灵依赖）
```

**pnpm（严格隔离）**：
```
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/
│   └── express@4.18.0/
│       └── node_modules/
│           └── body-parser@ → ...
└── express@ → .pnpm/express@4.18.0/node_modules/express

// 项目代码无法访问
require('lodash');  ❌ Error: Cannot find module 'lodash'
```

**原理**：
- lodash 只存在于 `.pnpm/lodash@4.17.21/`
- 顶层 `node_modules/` 没有 lodash
- 只有 express 可以访问（通过相对路径）

---

## 严格的依赖隔离

### 访问权限控制

**package.json 声明**：
```json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

**可访问**：
```javascript
require('express');  ✅
```

**不可访问**：
```javascript
require('body-parser');  ❌ 未声明
require('cookie');       ❌ 未声明
require('accepts');      ❌ 未声明（express 的依赖）
```

### 依赖边界示例

**依赖树**：
```
my-app
└── express
    ├── body-parser
    │   └── bytes
    └── cookie
```

**访问权限表**：
| 位置 | 可访问 |
|------|--------|
| my-app | express |
| express | body-parser, cookie |
| body-parser | bytes |

**验证**：
```javascript
// my-app/index.js
require('express');       ✅
require('body-parser');   ❌

// express 内部
require('body-parser');   ✅
require('bytes');         ❌（不是直接依赖）

// body-parser 内部
require('bytes');         ✅
```

### 公共提升模式

**问题**：某些工具（ESLint、Prettier）需要在顶层

**解决方案**：`public-hoist-pattern`

**.npmrc**：
```
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

**效果**：
```
node_modules/
├── eslint/  ← 提升到顶层
├── prettier/  ← 提升到顶层
└── .pnpm/
    └── ...
```

**使用场景**：
- IDE 插件（需要在顶层查找）
- CLI 工具
- 配置文件加载器

---

## 幽灵依赖的根治

### 对比传统包管理器

**npm/Yarn Classic 的问题**：
```json
// package.json（未声明 lodash）
{
  "dependencies": {
    "some-lib": "^1.0.0"  // 依赖 lodash
  }
}
```

**扁平化后**：
```
node_modules/
├── some-lib/
└── lodash/  ← 提升，可被意外访问
```

**危险代码**：
```javascript
const _ = require('lodash');  // ✅ 能运行

// 但当 some-lib 移除对 lodash 的依赖时
npm install
// Error: Cannot find module 'lodash'
```

### pnpm 的根治方案

**相同场景下的 pnpm**：
```
node_modules/
├── .pnpm/
│   ├── some-lib@1.0.0/
│   │   └── node_modules/
│   │       ├── some-lib/
│   │       └── lodash@ → ../../lodash@4.17.21/...
│   └── lodash@4.17.21/
└── some-lib@ → .pnpm/some-lib@1.0.0/node_modules/some-lib
```

**尝试访问**：
```javascript
require('lodash');
// Error: Cannot find module 'lodash'
// 必须显式声明依赖
```

**强制修复**：
```json
// package.json
{
  "dependencies": {
    "some-lib": "^1.0.0",
    "lodash": "^4.17.0"  // 显式声明
  }
}
```

### 检测工具

**pnpm 内置检查**：
```bash
pnpm install

# 如果代码使用了未声明依赖
# Warning: Undeclared dependencies detected:
#   - lodash (used by src/index.js)
```

**配合 ESLint**：
```javascript
// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-extraneous-dependencies': 'error'
  }
};
```

---

## 常见误区

### 误区 1：可以直接修改 .pnpm 目录

**危险操作**：
```bash
rm -rf node_modules/.pnpm/lodash@4.17.21
```

**后果**：
- 符号链接断裂
- 其他包的依赖失效
- 需要重新安装

**正确做法**：
```bash
pnpm remove lodash
pnpm install
```

### 误区 2：.pnpm 可以提交到 Git

**错误做法**：
```bash
git add node_modules/.pnpm
```

**问题**：
- 体积巨大
- 符号链接在不同系统不兼容
- 硬链接无法跨仓库

**正确做法**：
```bash
# .gitignore
node_modules/

# 提交锁文件
git add pnpm-lock.yaml
```

### 误区 3：所有包都在 .pnpm 中

**真相**：某些包会提升到顶层

**示例**：
```
node_modules/
├── .pnpm/
│   └── ...
├── eslint/  ← public-hoist-pattern 提升
└── lodash@ → .pnpm/...
```

**检查**：
```bash
ls -la node_modules/
# 查看哪些是符号链接，哪些是真实目录
```

---

## 工程实践

### 场景 1：诊断依赖问题

**查看实际结构**：
```bash
# 查看 .pnpm 目录
tree -L 3 node_modules/.pnpm

# 查看符号链接
ls -la node_modules/ | grep '^l'
```

**验证依赖访问**：
```bash
# 查找特定包
pnpm why lodash

# 输出示例：
# lodash 4.17.21
# └── express
#     └── my-app
```

**检查幽灵依赖**：
```bash
pnpm install --strict-peer-dependencies
# 严格检查所有依赖声明
```

### 场景 2：配置提升模式

**问题**：某些工具找不到依赖

**解决方案 1**：提升特定包
```
# .npmrc
public-hoist-pattern[]=*types*
public-hoist-pattern[]=@testing-library/*
```

**解决方案 2**：shamefully-hoist（不推荐）
```
# .npmrc
shamefully-hoist=true
```

**效果**：类似 npm，失去严格隔离优势

### 场景 3：Monorepo 配置

**pnpm-workspace.yaml**：
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

**共享配置**（.npmrc）：
```
link-workspace-packages=true
shared-workspace-lockfile=true
```

**依赖关系**：
```
apps/web
└── @my-org/ui (workspace)
    └── @my-org/utils (workspace)
```

**node_modules 结构**：
```
apps/web/node_modules/
├── .pnpm/
└── @my-org/
    ├── ui@ → ../../../packages/ui
    └── utils@ → ../../../packages/utils
```

---

## 深入一点

### 符号链接的性能影响

**文件系统调用**：
```javascript
require('lodash');

// 传统 node_modules（1 次查找）
fs.stat('node_modules/lodash')  ✅

// pnpm（2 次查找）
fs.readlink('node_modules/lodash')  → .pnpm/lodash@4.17.21/...
fs.stat('.pnpm/lodash@4.17.21/node_modules/lodash')  ✅
```

**性能测试**：
```
冷启动（无缓存）：
npm:  100ms
pnpm: 110ms（慢 10%）

热启动（有缓存）：
npm:  10ms
pnpm: 11ms（几乎无差异）
```

**结论**：符号链接的性能开销可忽略

### .pnpm 目录的大小

**虚拟存储大小**：
```bash
du -sh node_modules/.pnpm
# 0 MB（硬链接不占空间）

du -sh --apparent-size node_modules/.pnpm
# 500 MB（表观大小）
```

**符号链接元数据**：
```bash
# 每个符号链接约 1 KB
ls -l node_modules/ | grep '^l' | wc -l
# 200 个符号链接

# 总计约 200 KB
```

### 不同包管理器的结构对比

**npm/Yarn Classic（扁平化）**：
```
node_modules/ (所有包平铺)
├── pkg-a/
├── pkg-b/
├── pkg-c/
└── ...（3000+ 包）
```

**Yarn Berry PnP（无 node_modules）**：
```
.pnp.cjs (依赖映射表)
.yarn/cache/ (ZIP 包)
```

**pnpm（虚拟存储）**：
```
node_modules/
├── .pnpm/ (虚拟存储，3000+ 包)
└── pkg-a@ (符号链接，20 个包)
```

**优势对比**：
| 特性 | npm | Yarn PnP | pnpm |
|------|-----|----------|------|
| 磁盘占用 | 高 | 低 | 最低 |
| 安装速度 | 慢 | 快 | 最快 |
| 依赖隔离 | ❌ | ✅ | ✅ |
| 兼容性 | 最好 | 差 | 好 |

---

## 参考资料

- [pnpm node_modules 结构](https://pnpm.io/zh/symlinked-node-modules-structure)
- [.pnpm 虚拟存储](https://pnpm.io/zh/motivation#%E5%88%9B%E5%BB%BA%E9%9D%9E%E6%89%81%E5%B9%B3%E5%8C%96%E7%9A%84-node_modules)
- [public-hoist-pattern](https://pnpm.io/zh/npmrc#public-hoist-pattern)
