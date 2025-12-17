# 依赖冲突解决

## 概述

依赖冲突是包管理中的常见问题。本章介绍如何识别、分析和解决版本冲突。

## 一、依赖冲突类型

### 1.1 直接依赖冲突

```json
// package.json
{
  "dependencies": {
    "pkg-a": "^1.0.0",  // 需要 lodash@^4.17.0
    "pkg-b": "^2.0.0"   // 需要 lodash@^3.10.0
  }
}
```

**结果：** 两个版本的 lodash

### 1.2 间接依赖冲突

```
my-app
├── react@18.2.0
└── some-lib
    └── react@17.0.0  # 冲突
```

### 1.3 Peer 依赖冲突

```json
// react-router 需要 react >= 16.8
// 但项目使用 react 15.x
```

## 二、识别冲突

### 2.1 查看依赖树

```bash
# npm
npm ls lodash

# yarn
yarn why lodash

# pnpm
pnpm why lodash
```

**输出示例：**
```
my-app
├─┬ pkg-a@1.0.0
│ └── lodash@4.17.21
└─┬ pkg-b@2.0.0
  └── lodash@3.10.1  # 版本冲突
```

### 2.2 检查 peer 依赖

```bash
npm ls --depth=0
# UNMET PEER DEPENDENCY react@16.8.0
```

## 三、解决方案

### 3.1 升级/降级依赖

```bash
# 升级到兼容版本
npm update pkg-a
npm update pkg-b

# 或手动指定版本
npm install pkg-a@latest
```

### 3.2 使用 resolutions (Yarn)

```json
{
  "resolutions": {
    "lodash": "4.17.21",
    "**/lodash": "4.17.21"
  }
}
```

```bash
yarn install
```

### 3.3 使用 overrides (npm 8.3+)

```json
{
  "overrides": {
    "lodash": "4.17.21",
    "pkg-a>lodash": "4.17.21"
  }
}
```

```bash
npm install
```

### 3.4 使用 pnpm overrides

```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21",
      "pkg-a>lodash": "4.17.21"
    }
  }
}
```

```bash
pnpm install
```

## 四、Peer 依赖处理

### 4.1 自动安装

**pnpm：**
```ini
# .npmrc
auto-install-peers=true
```

**npm/yarn：**
需要手动安装

### 4.2 忽略 peer 依赖警告

```json
{
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["react"],
      "allowedVersions": {
        "react": "17 || 18"
      }
    }
  }
}
```

## 五、依赖去重

### 5.1 npm dedupe

```bash
# 去重依赖
npm dedupe

# 查看效果
npm ls
```

**原理：** 提升可兼容的重复依赖到顶层

### 5.2 yarn deduplicate

```bash
# 安装工具
npm install -g yarn-deduplicate

# 去重
yarn-deduplicate yarn.lock
yarn install
```

### 5.3 pnpm 自动去重

pnpm 默认去重，无需手动操作。

## 六、实战案例

### 6.1 React 版本冲突

**问题：**
```
my-app
├── react@18.2.0
└── old-lib
    └── react@16.8.0
```

**解决：**
```json
{
  "overrides": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

### 6.2 TypeScript 版本冲突

**问题：** 多个包依赖不同的 TypeScript 版本

**解决：**
```json
{
  "resolutions": {
    "typescript": "5.0.0"
  },
  "devDependencies": {
    "typescript": "5.0.0"
  }
}
```

### 6.3 多个 lodash 版本

**问题：** 打包体积过大

**解决：**
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

## 七、避免冲突的最佳实践

### 7.1 使用精确版本

```json
{
  "dependencies": {
    "critical-pkg": "1.2.3"  // 不使用 ^ 或 ~
  }
}
```

### 7.2 定期更新依赖

```bash
# 检查过期包
npm outdated

# 交互式更新
npm-check -u
```

### 7.3 锁定依赖版本

```bash
# 提交 lock 文件
git add package-lock.json
git commit -m "Lock dependencies"

# CI 使用 ci 命令
npm ci
```

### 7.4 使用 pnpm（严格依赖）

pnpm 的严格模式避免了大部分依赖冲突。

## 八、工具推荐

### 8.1 npm-check-updates

```bash
npm install -g npm-check-updates

# 检查更新
ncu

# 更新 package.json
ncu -u
```

### 8.2 depcheck

```bash
npm install -g depcheck

# 检查未使用的依赖
depcheck
```

### 8.3 syncpack (Monorepo)

```bash
npm install -g syncpack

# 检查版本一致性
syncpack list-mismatches

# 修复
syncpack fix-mismatches
```

## 参考资料

- [npm overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [Yarn resolutions](https://yarnpkg.com/configuration/manifest#resolutions)
- [pnpm overrides](https://pnpm.io/package_json#pnpmoverrides)

---

**导航**  
[上一章：pnpm性能优化](./25-pnpm-performance.md) | [返回目录](../README.md) | [下一章：锁文件管理](./27-lockfile-management.md)
