# pnpm 高级特性

## 概述

pnpm 提供了 .pnpmfile.cjs、hoist 配置、peer 依赖管理、overrides 等高级功能，用于解决复杂场景。

## 一、.pnpmfile.cjs

### 1.1 钩子函数

```javascript
// .pnpmfile.cjs
function readPackage(pkg, context) {
  // 修改依赖版本
  if (pkg.name === 'some-package') {
    pkg.dependencies = {
      ...pkg.dependencies,
      'lodash': '^4.17.21'  // 强制使用特定版本
    };
  }
  
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
```

### 1.2 实际应用

**统一依赖版本：**
```javascript
function readPackage(pkg) {
  // 所有包使用相同的 React 版本
  if (pkg.dependencies?.react) {
    pkg.dependencies.react = '18.2.0';
  }
  return pkg;
}
```

**移除不需要的依赖：**
```javascript
function readPackage(pkg) {
  // 移除某个依赖
  if (pkg.dependencies?.['problematic-package']) {
    delete pkg.dependencies['problematic-package'];
  }
  return pkg;
}
```

## 二、Hoist 配置

### 2.1 什么是 Hoist

默认情况下，pnpm 不提升依赖，但可以配置提升特定包。

**.npmrc：**
```ini
# 提升所有依赖（不推荐）
hoist=true

# 提升匹配模式的包
hoist-pattern[]=*eslint*
hoist-pattern[]=*types*

# 公共提升（提升到根 node_modules）
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
```

### 2.2 shamefully-hoist

```ini
# 完全扁平化（类似 npm/yarn）
shamefully-hoist=true
```

**使用场景：**
- 某些工具不兼容 pnpm 的严格模式
- 快速修复兼容性问题

**缺点：**
- 失去严格依赖的优势
- 可能产生幽灵依赖

## 三、Peer 依赖管理

### 3.1 自动安装 peer 依赖

```ini
# .npmrc
auto-install-peers=true
```

```bash
# 安装时自动安装缺失的 peer 依赖
pnpm install
```

### 3.2 严格 peer 依赖

```ini
strict-peer-dependencies=true
```

**效果：** peer 依赖版本不匹配时报错

```bash
pnpm install
# ERR_PNPM_PEER_DEP_ISSUES
```

### 3.3 覆盖 peer 依赖

```json
{
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["react"],
      "allowedVersions": {
        "react": "18"
      }
    }
  }
}
```

## 四、Overrides（覆盖）

### 4.1 覆盖依赖版本

```json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21",
      "foo>bar": "1.0.0"
    }
  }
}
```

**规则：**
- `"lodash": "^4.17.21"` - 所有 lodash 使用此版本
- `"foo>bar": "1.0.0"` - foo 的 bar 依赖使用 1.0.0

### 4.2 包选择器

```json
{
  "pnpm": {
    "overrides": {
      "@pkg/foo>bar@^1.0.0": "npm:bar@^2.0.0"
    }
  }
}
```

## 五、Patch（补丁）

### 5.1 创建补丁

```bash
# 1. 准备补丁
pnpm patch lodash@4.17.21

# 输出：
# You can now edit the package at:
# /tmp/.pnpm-patch/lodash@4.17.21

# 2. 修改文件
vim /tmp/.pnpm-patch/lodash@4.17.21/index.js

# 3. 提交补丁
pnpm patch-commit /tmp/.pnpm-patch/lodash@4.17.21
```

**生成：**
```
patches/
└── lodash@4.17.21.patch
```

### 5.2 应用补丁

**package.json：**
```json
{
  "pnpm": {
    "patchedDependencies": {
      "lodash@4.17.21": "patches/lodash@4.17.21.patch"
    }
  }
}
```

## 六、Catalogs（目录）

### 6.1 定义 Catalog

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'

catalog:
  react: ^18.2.0
  lodash: ^4.17.21
  typescript: ^5.0.0
```

### 6.2 使用 Catalog

```json
{
  "dependencies": {
    "react": "catalog:",
    "lodash": "catalog:"
  }
}
```

**优势：**
- 统一版本管理
- 易于更新

## 七、执行命令

### 7.1 pnpm exec

```bash
# 执行本地 bin
pnpm exec eslint .

# 等同于
./node_modules/.bin/eslint .
```

### 7.2 pnpm dlx

```bash
# 临时运行包（类似 npx）
pnpm dlx create-react-app my-app

# 指定版本
pnpm dlx create-react-app@4.0.0 my-app
```

## 八、部署优化

### 8.1 仅安装生产依赖

```bash
# 安装时
pnpm install --prod

# 或
pnpm install --production
```

### 8.2 Dockerfile 优化

```dockerfile
FROM node:18-alpine

# 启用 corepack
RUN corepack enable

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile --prod

# 复制源代码
COPY . .

RUN pnpm build

CMD ["pnpm", "start"]
```

## 九、配置参考

### 9.1 完整 .npmrc

```ini
# 基础配置
registry=https://registry.npmmirror.com
store-dir=~/.pnpm-store

# Workspace
link-workspace-packages=true
shared-workspace-lockfile=true

# Peer 依赖
auto-install-peers=true
strict-peer-dependencies=false

# Hoist
hoist=false
shamefully-hoist=false
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*

# 其他
side-effects-cache=true
child-concurrency=5
```

### 9.2 package.json 配置

```json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    },
    "peerDependencyRules": {
      "ignoreMissing": ["react"],
      "allowedVersions": {
        "react": "18"
      }
    },
    "patchedDependencies": {
      "some-pkg@1.0.0": "patches/some-pkg@1.0.0.patch"
    }
  }
}
```

## 十、常见问题解决

### 10.1 某个包不兼容

```ini
# 使用 shamefully-hoist
shamefully-hoist=true

# 或只提升特定包
public-hoist-pattern[]=problematic-package
```

### 10.2 peer 依赖冲突

```json
{
  "pnpm": {
    "peerDependencyRules": {
      "allowedVersions": {
        "react": "17 || 18"
      }
    }
  }
}
```

### 10.3 需要修改第三方包

```bash
# 使用 patch
pnpm patch package-name
# 编辑文件
pnpm patch-commit /tmp/.pnpm-patch/...
```

## 参考资料

- [pnpm 配置文档](https://pnpm.io/npmrc)
- [.pnpmfile.cjs](https://pnpm.io/pnpmfile)
- [Overrides](https://pnpm.io/package_json#pnpmoverrides)

---

**导航**  
[上一章：pnpm Workspaces](./23-pnpm-workspaces.md) | [返回目录](../README.md) | [下一章：pnpm性能优化](./25-pnpm-performance.md)
