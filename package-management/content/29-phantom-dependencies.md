# 幽灵依赖与依赖提升

## 概述

幽灵依赖（Phantom Dependencies）是 npm/yarn 扁平化导致的问题。本章深入分析原理、危害和解决方案。

## 一、什么是幽灵依赖

### 1.1 问题演示

```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

```javascript
// express 依赖了 body-parser
// body-parser 被提升到顶层

// 你可以直接使用（幽灵依赖）
import bodyParser from 'body-parser';  // ⚠️ 能用但不应该
```

**问题：**
- package.json 中没有声明
- express 更新可能移除 body-parser
- 代码突然报错

### 1.2 依赖提升机制

**npm v2（嵌套）：**
```
node_modules/
└── express/
    └── node_modules/
        └── body-parser/  # 无法直接访问
```

**npm v3+（扁平化）：**
```
node_modules/
├── express/
└── body-parser/  # 被提升，可以直接访问
```

## 二、依赖提升算法

### 2.1 提升规则

```javascript
// 简化的提升算法
function hoistDependencies(deps) {
  const hoisted = new Map();
  
  for (const [name, version] of deps) {
    // 如果顶层没有该包
    if (!hoisted.has(name)) {
      hoisted.set(name, version);  // 提升
    } else {
      // 版本冲突，保持嵌套
      // 不提升
    }
  }
  
  return hoisted;
}
```

### 2.2 提升顺序

```bash
# package.json 中的顺序影响提升
{
  "dependencies": {
    "pkg-a": "^1.0.0",  // 先安装，依赖 C@1.0
    "pkg-b": "^1.0.0"   // 后安装，依赖 C@2.0
  }
}

# 结果：
node_modules/
├── pkg-a/
├── pkg-b/
│   └── node_modules/
│       └── C@2.0/
└── C@1.0/  # pkg-a 的依赖被提升
```

**不确定性：** 安装顺序不同，结果可能不同

## 三、幽灵依赖的危害

### 3.1 隐式依赖

```javascript
// 代码中使用
import _ from 'lodash';

// 但 package.json 中没有
{
  "dependencies": {
    "some-lib": "^1.0.0"  // 它依赖了 lodash
  }
}
```

**风险：**
- ❌ 依赖关系不明确
- ❌ some-lib 更新可能移除 lodash
- ❌ 其他开发者不知道为什么能用 lodash

### 3.2 版本不确定

```bash
# 本地安装
npm install  # C@1.0 被提升

# CI 安装
npm ci       # C@2.0 被提升（顺序不同）

# 结果：本地和 CI 行为不一致
```

### 3.3 Monorepo 问题

```
packages/
├── pkg-a/
│   └── package.json  # 依赖 lodash
└── pkg-b/
    └── package.json  # 没有依赖 lodash
```

```javascript
// pkg-b/index.js
import _ from 'lodash';  // ⚠️ 能用，因为被 pkg-a 提升了
```

## 四、检测幽灵依赖

### 4.1 使用 depcheck

```bash
npm install -g depcheck

# 检查未声明的依赖
depcheck
```

**输出：**
```
Unused dependencies
* lodash  # 声明了但未使用

Missing dependencies  
* axios   # 使用了但未声明（幽灵依赖）
```

### 4.2 使用 pnpm

```bash
# pnpm 默认严格模式
pnpm install

# 如果使用了幽灵依赖，会报错
Error: Cannot find module 'lodash'
```

### 4.3 ESLint 规则

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-extraneous-dependencies': 'error'
  }
};
```

## 五、解决方案

### 5.1 显式声明依赖

```bash
# 如果使用了，就声明
npm install lodash
```

```json
{
  "dependencies": {
    "lodash": "^4.17.21",  // ✅ 显式声明
    "express": "^4.18.0"
  }
}
```

### 5.2 使用 pnpm

```bash
# 迁移到 pnpm
npm install -g pnpm
pnpm import
rm package-lock.json
pnpm install

# pnpm 会报错，强制修复幽灵依赖
```

**pnpm 的严格结构：**
```
node_modules/
├── .pnpm/
│   └── express@4.18.0/
│       └── node_modules/
│           ├── express/
│           └── body-parser/  # 只能被 express 访问
└── express -> .pnpm/express@4.18.0/node_modules/express
```

### 5.3 使用 Yarn PnP

```yaml
# .yarnrc.yml
nodeLinker: pnp
```

**PnP 模式：** 不生成 node_modules，没有幽灵依赖

## 六、依赖提升配置

### 6.1 npm 配置

```ini
# .npmrc
# 不提升（实验性）
legacy-bundling=true
```

### 6.2 Yarn nohoist

```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/react-native",
      "**/react-native/**"
    ]
  }
}
```

### 6.3 pnpm hoist

```ini
# .npmrc
# pnpm 默认不提升
hoist=false

# 提升特定包
public-hoist-pattern[]=*types*
```

## 七、最佳实践

### 7.1 代码审查

```markdown
PR Checklist:
- [ ] 所有 import 的包都在 package.json 中声明
- [ ] 运行 depcheck 检查
- [ ] CI 测试通过
```

### 7.2 使用严格的包管理器

```bash
# 推荐使用 pnpm
pnpm install

# 或 Yarn Berry PnP
yarn set version stable
yarn install
```

### 7.3 定期审计

```bash
# 每周运行
depcheck

# 修复幽灵依赖
pnpm add missing-package
```

### 7.4 Monorepo 管理

```json
// 使用 workspace 协议
{
  "dependencies": {
    "@myorg/utils": "workspace:^"
  }
}
```

## 八、扁平化 vs 嵌套对比

| 特性 | 扁平化 (npm/yarn) | 嵌套 (pnpm) |
|------|-------------------|-------------|
| **磁盘空间** | 💾💾 大 | 💾 小 |
| **安装速度** | 🐌 慢 | ⚡ 快 |
| **幽灵依赖** | ❌ 有 | ✅ 无 |
| **依赖隔离** | ⚠️ 弱 | ✅ 强 |
| **兼容性** | ✅ 好 | ⭐⭐⭐ |

## 九、实战案例

### 9.1 发现幽灵依赖

```bash
# 1. 运行检查
depcheck

# 输出：
Missing dependencies:
* lodash
* axios

# 2. 添加依赖
npm install lodash axios

# 3. 验证
npm test
```

### 9.2 迁移到 pnpm

```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 导入 lock 文件
pnpm import

# 3. 安装（会报错）
pnpm install
# Error: Cannot find module 'lodash'

# 4. 修复幽灵依赖
pnpm add lodash

# 5. 重新安装
pnpm install

# 6. 测试
pnpm test
```

## 参考资料

- [幽灵依赖问题](https://rushjs.io/pages/advanced/phantom_deps/)
- [pnpm 严格依赖](https://pnpm.io/motivation#creating-a-non-flat-node_modules-directory)
- [depcheck](https://github.com/depcheck/depcheck)

---

**导航**  
[上一章：依赖更新策略](./28-update-strategy.md) | [返回目录](../README.md) | [下一章：Monorepo概念与实践](./30-monorepo-concept.md)
