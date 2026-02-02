# 依赖冲突与解决方案

## 依赖冲突的分类

### 版本冲突

**定义**：多个包依赖同一个库的不同版本

**示例**：
```
my-app
├── react-router@6.0.0
│   └── react@^18.0.0  (需要 18.x)
└── react-bootstrap@2.0.0
    └── react@^17.0.0  (需要 17.x)
```

**冲突类型**：

**1. 可解决冲突**（版本范围有交集）
```
依赖 A: lodash@^4.17.0  (4.17.0 - 4.x)
依赖 B: lodash@^4.16.0  (4.16.0 - 4.x)
交集:   4.17.0 - 4.x
解决方案: 安装 lodash@4.17.21
```

**2. 不可解决冲突**（无交集）
```
依赖 A: react@^18.0.0  (18.x)
依赖 B: react@^17.0.0  (17.x)
交集:   无
解决方案: 安装多个版本（嵌套 node_modules）
```

### 结构冲突

**定义**：依赖提升导致的结构不一致

**场景 1**：幽灵依赖
```
my-app
├── express (依赖 body-parser)
└── node_modules/
    ├── express/
    └── body-parser/  ← 提升到顶层

# 你的代码可以访问未声明的 body-parser
require('body-parser');  // 危险！
```

**场景 2**：重复依赖
```
node_modules/
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.20
└── lodash@4.17.21  (顶层)

# pkg-a 使用自己的 lodash，而不是顶层的
```

---

## npm 的冲突解决策略

### 自动解决机制

**策略 1**：提升兼容版本到顶层
```javascript
// 依赖树
{
  "pkg-a": { "lodash": "^4.17.0" },
  "pkg-b": { "lodash": "^4.16.0" }
}

// 解决后的 node_modules
node_modules/
├── lodash@4.17.21  (满足两者，提升)
├── pkg-a/
└── pkg-b/
```

**策略 2**：嵌套不兼容版本
```javascript
{
  "react-router": { "react": "^18.0.0" },
  "old-lib": { "react": "^16.0.0" }
}

// node_modules
node_modules/
├── react@18.2.0  (新版本提升)
├── react-router/
└── old-lib/
    └── node_modules/
        └── react@16.14.0  (旧版本嵌套)
```

### 提升优先级规则

**规则 1**：先遇到的包优先提升
```json
// package.json
{
  "dependencies": {
    "pkg-a": "1.0.0",  // 先声明，其依赖优先提升
    "pkg-b": "1.0.0"
  }
}
```

**规则 2**：版本范围更宽的优先
```
^4.0.0 (4.x 全部) > ~4.17.0 (4.17.x) > 4.17.21 (精确版本)
```

**规则 3**：依赖深度浅的优先
```
直接依赖 > 间接依赖的一级 > 间接依赖的二级
```

---

## resolutions 字段强制版本

### Yarn resolutions

**基本用法**：
```json
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}
```

**效果**：所有包都使用 lodash@4.17.21，无论声明的是什么版本

**模式匹配**：
```json
{
  "resolutions": {
    "**/lodash": "4.17.21",              // 所有依赖的 lodash
    "webpack/**/loader-utils": "2.0.0",  // webpack 依赖树中的 loader-utils
    "react-native/metro": "0.70.0"       // react-native 的直接依赖 metro
  }
}
```

### 使用场景

**场景 1**：修复安全漏洞
```json
{
  "resolutions": {
    "minimist": "1.2.6"  // 修复 CVE-2021-44906
  }
}
```

**场景 2**：统一版本减少重复
```bash
# 发现重复依赖
npm ls lodash

lodash@4.17.20
lodash@4.17.21
lodash@4.17.19
```

```json
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}
```

**场景 3**：强制使用兼容版本
```json
{
  "dependencies": {
    "react": "^18.0.0"
  },
  "resolutions": {
    "**/react": "18.2.0"  // 确保所有包使用 React 18.2.0
  }
}
```

---

## overrides 字段（npm 8.3+）

### 基本语法

**扁平语法**：
```json
{
  "overrides": {
    "foo": "1.0.0"
  }
}
```

**嵌套语法**：
```json
{
  "overrides": {
    "bar": {
      "foo": "1.0.0"
    }
  }
}
```

**含义**：只覆盖 bar 依赖树中的 foo

### 高级用法

**引用当前版本**：
```json
{
  "dependencies": {
    "foo": "^1.0.0"
  },
  "overrides": {
    "foo": "$foo"  // 使用 dependencies 中的版本
  }
}
```

**条件覆盖**：
```json
{
  "overrides": {
    "baz": {
      ".": "1.0.0",       // baz 本身使用 1.0.0
      "bar": "2.0.0"      // baz 的依赖 bar 使用 2.0.0
    }
  }
}
```

### npm vs Yarn 对比

**语法差异**：
```json
// npm (overrides)
{
  "overrides": {
    "foo": {
      "bar": "1.0.0"
    }
  }
}

// Yarn (resolutions)
{
  "resolutions": {
    "foo/bar": "1.0.0"
  }
}
```

**功能对比**：

| 功能 | npm overrides | Yarn resolutions |
|------|--------------|-----------------|
| 扁平覆盖 | ✅ | ✅ |
| 嵌套覆盖 | ✅ | ✅ (不同语法) |
| 模式匹配 | ❌ | ✅ (`**/pkg`) |
| 引用版本 | ✅ (`$var`) | ❌ |

---

## 常见误区

### 误区 1：overrides 可以解决所有冲突

**反例**：peer dependencies 冲突
```json
{
  "dependencies": {
    "react": "18.0.0"
  },
  "overrides": {
    "react": "17.0.0"  // ❌ 无效
  }
}
```

**原因**：peer dependencies 由应用层决定，overrides 不影响

**正确做法**：
```json
{
  "dependencies": {
    "react": "17.0.0"  // 直接修改
  }
}
```

### 误区 2：过度使用 overrides

**危险示例**：
```json
{
  "overrides": {
    "**": "latest"  // ❌ 强制所有包使用最新版本
  }
}
```

**后果**：
- 破坏语义化版本约定
- 引入未测试的组合
- 难以追溯问题根源

**原则**：仅在必要时使用，并记录原因

```json
{
  "overrides": {
    // 原因：修复 CVE-2021-44906
    "minimist": "1.2.6"
  }
}
```

### 误区 3：忽略 overrides 的副作用

**场景**：
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

**副作用检查**：
```bash
# 安装后检查依赖树
npm ls lodash

# 所有 lodash 都是 4.17.21 吗？
# 是否有包不兼容这个版本？
```

**测试策略**：
```json
{
  "scripts": {
    "test:overrides": "npm ls && npm test"
  }
}
```

---

## 工程实践

### 场景 1：诊断依赖冲突

**步骤**：
```bash
# 1. 查看完整依赖树
npm ls

# 2. 查找特定包的所有版本
npm ls lodash

# 3. 解释为什么安装了某个包
npm explain lodash@4.17.20

# 4. 检查重复依赖
npx npm-check-duplicates
```

**输出解读**：
```
lodash@4.17.21
├── pkg-a@1.0.0
│   └── lodash@^4.17.0  (满足)
└── UNMET DEPENDENCY lodash@4.16.6
    └── pkg-b@1.0.0
        └── lodash@^4.16.0  (不满足顶层版本)
```

### 场景 2：逐步解决冲突

**方法 1**：升级依赖
```bash
# 升级 pkg-b 到兼容新版本的版本
npm update pkg-b
```

**方法 2**：使用 overrides
```json
{
  "overrides": {
    "pkg-b": {
      "lodash": "4.17.21"  // 只覆盖 pkg-b 的 lodash
    }
  }
}
```

**方法 3**：提升为直接依赖
```json
{
  "dependencies": {
    "lodash": "4.17.21",  // 显式声明
    "pkg-a": "1.0.0",
    "pkg-b": "1.0.0"
  }
}
```

### 场景 3：Monorepo 中的版本统一

**问题**：
```
packages/
├── app-a/package.json  (react@18.0.0)
├── app-b/package.json  (react@18.1.0)
└── app-c/package.json  (react@18.2.0)
```

**解决方案 1**：根目录 overrides
```json
// 根目录 package.json
{
  "overrides": {
    "react": "18.2.0"
  }
}
```

**解决方案 2**：pnpm 的 catalog
```yaml
# pnpm-workspace.yaml
catalog:
  react: 18.2.0

# packages/app-a/package.json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

---

## 深入一点

### 依赖冲突的数学模型

**约束满足问题（CSP）**：
```
变量：每个包的版本
域：每个包的可用版本集合
约束：semver 版本范围

目标：找到满足所有约束的赋值
```

**NP 完全性**：
```
给定 N 个包，每个包有 M 个可用版本
最坏情况：需要尝试 M^N 种组合
```

**npm 的启发式算法**：
- 贪心策略：优先选择最高版本
- 回溯机制：遇到冲突时尝试其他版本
- 剪枝优化：缓存已解决的子问题

### 不同语言的冲突处理对比

**Python (pip)**：
```bash
# 冲突直接报错
pip install pkg-a pkg-b
ERROR: Cannot install pkg-a and pkg-b because they require
incompatible versions of requests
```

**Ruby (Bundler)**：
```ruby
# 严格版本锁定
gem 'rails', '7.0.0'
# 不允许同一个 gem 的多个版本
```

**Go (modules)**：
```
# MVS（最小版本选择）
如果 A 需要 C@1.2，B 需要 C@1.3
选择 C@1.3（最小的满足所有要求的版本）
```

**JavaScript (npm/yarn/pnpm)**：
```
# 允许多版本共存
react@17.0.0 和 react@18.0.0 可以同时存在
通过嵌套 node_modules 实现
```

### overrides 的实现原理

**伪代码**：
```javascript
function applyOverrides(tree, overrides) {
  for (const node of traverseTree(tree)) {
    const override = findOverride(overrides, node.path);
    if (override) {
      node.version = override.version;
      // 递归更新子树
      updateDependencies(node, override.version);
    }
  }
}

function findOverride(overrides, path) {
  // 精确匹配
  if (overrides[path.join('/')]) {
    return overrides[path.join('/')];
  }
  
  // 模式匹配（Yarn）
  for (const pattern in overrides) {
    if (matchPattern(pattern, path)) {
      return overrides[pattern];
    }
  }
  
  return null;
}
```

---

## 参考资料

- [npm overrides 文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [Yarn resolutions 文档](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/)
- [依赖地狱问题](https://en.wikipedia.org/wiki/Dependency_hell)
