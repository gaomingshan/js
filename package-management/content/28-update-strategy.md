# 依赖更新策略

## 概述

依赖更新需要平衡安全性、稳定性和新特性。本章介绍手动更新、自动化工具和 CI 集成策略。

## 一、更新策略

### 1.1 保守策略

```json
{
  "dependencies": {
    "react": "18.2.0",      // 精确版本
    "lodash": "~4.17.21"    // 只更新 patch
  }
}
```

**适用：**
- 生产环境
- 关键应用
- 已知稳定版本

### 1.2 适中策略（推荐）

```json
{
  "dependencies": {
    "react": "^18.2.0",     // 允许 minor 更新
    "axios": "^1.4.0"
  }
}
```

**适用：**
- 大多数项目
- 平衡稳定性和新特性

### 1.3 激进策略

```json
{
  "dependencies": {
    "typescript": "latest"
  }
}
```

**适用：**
- 实验项目
- 追求最新特性

## 二、手动更新

### 2.1 检查过期包

```bash
# npm
npm outdated

# yarn
yarn outdated

# pnpm
pnpm outdated
```

**输出示例：**
```
Package  Current  Wanted  Latest
lodash   4.17.20  4.17.21 4.17.21
react    17.0.0   17.0.2  18.2.0
```

### 2.2 更新单个包

```bash
# 更新到 Wanted 版本
npm update lodash

# 更新到 Latest 版本
npm install lodash@latest
```

### 2.3 更新所有包

```bash
# npm（遵循 package.json 范围）
npm update

# yarn
yarn upgrade

# pnpm
pnpm update
```

### 2.4 交互式更新

**Yarn：**
```bash
yarn upgrade-interactive --latest
```

**pnpm：**
```bash
pnpm update -i
```

## 三、自动化工具

### 3.1 npm-check-updates (ncu)

```bash
# 安装
npm install -g npm-check-updates

# 检查更新
ncu

# 更新 package.json
ncu -u

# 安装新版本
npm install
```

**高级用法：**
```bash
# 只更新 minor 版本
ncu --target minor -u

# 只更新 patch 版本
ncu --target patch -u

# 排除特定包
ncu -u -x react,react-dom

# 只更新特定包
ncu -u --filter "lodash,axios"
```

### 3.2 Renovate（推荐）⭐

**GitHub App 自动化更新：**

```json
// renovate.json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ],
  "schedule": ["before 3am on Monday"]
}
```

**特点：**
- ✅ 自动创建 PR
- ✅ 运行测试
- ✅ 自动合并（可配置）
- ✅ 分组更新

### 3.3 Dependabot

**GitHub 原生支持：**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
```

**特点：**
- ✅ GitHub 集成
- ✅ 自动 PR
- ✅ 安全更新优先

## 四、更新流程

### 4.1 推荐流程

```bash
# 1. 检查过期包
npm outdated

# 2. 查看 CHANGELOG
# 访问包的 GitHub 仓库

# 3. 更新
ncu -u

# 4. 安装
npm install

# 5. 测试
npm test

# 6. 提交
git add package.json package-lock.json
git commit -m "Update dependencies"
```

### 4.2 大版本更新

```bash
# 1. 创建分支
git checkout -b upgrade-react-18

# 2. 更新主包
npm install react@18 react-dom@18

# 3. 更新相关包
npm install @types/react@18

# 4. 修复代码
# 根据 Breaking Changes 修改代码

# 5. 测试
npm test

# 6. PR 审查
git push origin upgrade-react-18
```

## 五、自动化 CI 集成

### 5.1 定期更新检查

```yaml
# .github/workflows/update-check.yml
name: Check Updates

on:
  schedule:
    - cron: '0 0 * * 1'  # 每周一

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g npm-check-updates
      - run: ncu
```

### 5.2 自动创建 PR

```yaml
# .github/workflows/auto-update.yml
name: Auto Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 1'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          ncu -u
          npm install
      - uses: peter-evans/create-pull-request@v5
        with:
          commit-message: Update dependencies
          title: 'chore: update dependencies'
```

## 六、版本策略

### 6.1 语义化版本策略

```json
{
  "dependencies": {
    "stable-lib": "^2.1.0",      // minor 更新
    "dev-tool": "~1.2.3",        // patch 更新
    "critical-pkg": "1.0.0",     // 锁定版本
    "experimental": "latest"      // 最新版本
  }
}
```

### 6.2 按类型分组

```json
{
  "dependencies": {
    "react": "^18.2.0"           // 核心框架
  },
  "devDependencies": {
    "typescript": "~5.0.0",      // 开发工具
    "eslint": "~8.40.0"
  }
}
```

## 七、安全更新

### 7.1 自动安全更新

```bash
# npm audit fix
npm audit fix

# 强制更新（可能破坏性）
npm audit fix --force
```

### 7.2 Dependabot 安全更新

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"  # 每天检查安全更新
```

### 7.3 Snyk

```bash
# 安装
npm install -g snyk

# 测试漏洞
snyk test

# 自动修复
snyk wizard
```

## 八、Monorepo 更新策略

### 8.1 统一版本

```bash
# 使用 syncpack
npm install -g syncpack

# 检查版本不一致
syncpack list-mismatches

# 修复
syncpack fix-mismatches
```

### 8.2 批量更新

```bash
# pnpm
pnpm -r update

# yarn
yarn workspaces run upgrade
```

## 九、最佳实践

### 9.1 定期更新

```
- 每周检查过期包
- 每月小版本更新
- 每季度大版本更新
- 立即处理安全更新
```

### 9.2 测试覆盖

```bash
# 更新前确保有测试
npm test

# 更新后运行测试
npm test

# E2E 测试
npm run test:e2e
```

### 9.3 渐进式更新

```bash
# 不要一次更新所有依赖
# 按组更新：
1. 安全补丁
2. 小版本更新
3. 大版本更新
```

### 9.4 文档化变更

```bash
# CHANGELOG.md
## [Unreleased]
### Updated
- lodash 4.17.20 → 4.17.21
- react 17.0.2 → 18.2.0
  - Breaking: 废弃 ReactDOM.render
  - 迁移到 createRoot API
```

## 十、常见问题

### 10.1 更新导致构建失败

**解决：**
```bash
# 回退版本
git checkout HEAD -- package.json package-lock.json
npm install

# 逐个更新
npm update lodash
npm test
```

### 10.2 Peer 依赖警告

**解决：**
```bash
# 安装 peer 依赖
npm install @types/react@18

# 或忽略（不推荐）
npm install --legacy-peer-deps
```

## 参考资料

- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [Renovate](https://docs.renovatebot.com/)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

---

**导航**  
[上一章：锁文件管理](./27-lockfile-management.md) | [返回目录](../README.md) | [下一章：幽灵依赖与依赖提升](./29-phantom-dependencies.md)
