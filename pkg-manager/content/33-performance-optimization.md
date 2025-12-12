# 包管理器性能优化

## 概述

包管理器的性能直接影响开发体验和 CI/CD 效率。本章总结各类性能优化技巧。

## 一、安装速度优化

### 1.1 使用 pnpm

```bash
# 迁移到 pnpm
npm install -g pnpm
pnpm import
pnpm install

# 性能提升：
npm:  45s → pnpm: 14s  ⚡⚡
```

### 1.2 并行安装

**npm：**
```ini
# .npmrc
network-concurrency=16
```

**pnpm：**
```ini
network-concurrency=16
child-concurrency=5
```

### 1.3 使用缓存

**npm：**
```bash
# 查看缓存
npm config get cache

# CI 缓存
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

**pnpm：**
```yaml
# GitHub Actions
- name: Get pnpm store
  run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_ENV

- uses: actions/cache@v3
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 1.4 镜像源

```ini
# .npmrc
registry=https://registry.npmmirror.com

# 二进制文件镜像
electron_mirror=https://npmmirror.com/mirrors/electron/
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
```

## 二、磁盘空间优化

### 2.1 使用 pnpm（最有效）

```bash
# 10个项目对比
npm/yarn:  5.2GB
pnpm:      1.8GB  # 节省 65%
```

### 2.2 清理缓存

```bash
# npm
npm cache clean --force

# yarn
yarn cache clean

# pnpm
pnpm store prune
```

### 2.3 删除无用依赖

```bash
# 安装 depcheck
npm install -g depcheck

# 检查无用依赖
depcheck

# 删除
npm uninstall unused-package
```

## 三、CI/CD 优化

### 3.1 使用 ci 命令

```bash
# npm ci（比 install 快）
npm ci

# 特点：
# - 删除 node_modules 重装
# - 严格按 lock 文件
# - 不更新 package.json
```

### 3.2 frozen-lockfile

```bash
# Yarn
yarn install --frozen-lockfile

# pnpm
pnpm install --frozen-lockfile
```

### 3.3 缓存策略

**GitHub Actions：**
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.pnpm-store
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-deps-
```

**GitLab CI：**
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .pnpm-store
    - node_modules/

before_script:
  - pnpm config set store-dir .pnpm-store
  - pnpm install --frozen-lockfile
```

### 3.4 增量安装

```bash
# 只安装生产依赖
npm ci --only=production
pnpm install --prod
```

## 四、Monorepo 优化

### 4.1 使用 Turborepo

```bash
npm install turbo -D
```

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  }
}
```

**效果：**
```bash
# 首次构建
turbo run build  # 60s

# 增量构建（无改动）
turbo run build  # 100ms  ⚡⚡⚡
```

### 4.2 过滤构建

```bash
# 只构建改动的包
pnpm --filter ...[HEAD^1] build

# Turborepo
turbo run build --filter ...[HEAD^1]
```

### 4.3 并行执行

```bash
# pnpm
pnpm -r --parallel run build

# Turborepo（自动并行）
turbo run build
```

## 五、网络优化

### 5.1 代理配置

```ini
# .npmrc
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080
```

### 5.2 离线安装

**Yarn：**
```bash
# 离线镜像
yarn config set yarn-offline-mirror ./npm-packages-offline-cache

# 离线安装
yarn install --offline
```

**pnpm：**
```bash
# 使用 store
pnpm install --offline
```

### 5.3 重试配置

```ini
# .npmrc
fetch-retries=5
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
```

## 六、依赖优化

### 6.1 去重

```bash
# npm
npm dedupe

# yarn-deduplicate
npx yarn-deduplicate && yarn install
```

### 6.2 按需引入

```javascript
// ❌ 不好：引入整个库
import _ from 'lodash';

// ✅ 好：按需引入
import debounce from 'lodash/debounce';
```

### 6.3 替换大包

```json
{
  "dependencies": {
    "moment": "^2.29.0"  // ❌ 大（70KB）
  }
}
```

```json
{
  "dependencies": {
    "dayjs": "^1.11.0"   // ✅ 小（2KB）
  }
}
```

## 七、构建优化

### 7.1 并行构建

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:parallel": "pnpm -r --parallel run build"
  }
}
```

### 7.2 增量构建

**TypeScript：**
```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

**Webpack：**
```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem'
  }
};
```

## 八、性能监控

### 8.1 安装时间

```bash
# 测量安装时间
time npm install
time pnpm install
```

### 8.2 包体积分析

```bash
# bundlephobia
https://bundlephobia.com/package/lodash

# webpack-bundle-analyzer
npm install -D webpack-bundle-analyzer
```

### 8.3 依赖树分析

```bash
# 查看依赖树
npm ls --depth=0
pnpm ls --depth=0

# 查看包大小
du -sh node_modules/*
```

## 九、最佳实践清单

### 9.1 包管理器选择

```
- ✅ pnpm（推荐）- 最快，最省空间
- ⭐ Yarn Berry（PnP）- 零安装
- 🔄 Yarn Classic - 稳定
- 📦 npm - 兼容性最好
```

### 9.2 配置清单

```ini
# .npmrc 推荐配置
registry=https://registry.npmmirror.com
store-dir=~/.pnpm-store
network-concurrency=16
child-concurrency=5
side-effects-cache=true
```

### 9.3 CI/CD 清单

```markdown
- [ ] 使用 ci 命令（npm ci / pnpm install --frozen-lockfile）
- [ ] 缓存 node_modules 或 store
- [ ] 使用镜像源
- [ ] 只安装生产依赖
- [ ] 并行运行测试和构建
```

## 十、性能对比总结

### 10.1 安装速度

```bash
# 冷安装（无缓存）
npm:    45s
yarn:   28s
pnpm:   14s  ⚡⚡

# 热安装（有缓存）
npm:    10s
yarn:   5s
pnpm:   1s   ⚡⚡⚡
```

### 10.2 磁盘占用

```bash
# 10个项目
npm/yarn:  5.2GB
pnpm:      1.8GB  # 节省 65%
```

### 10.3 CI 时间

```bash
# GitHub Actions（带缓存）
npm:    3min
yarn:   2min
pnpm:   45s  ⚡⚡⚡
```

## 参考资料

- [pnpm 性能基准](https://pnpm.io/benchmarks)
- [Turborepo 文档](https://turbo.build/repo/docs)

---

**导航**  
[上一章：私有npm registry](./32-private-registry.md) | [返回目录](../README.md) | [下一章：依赖分析与优化](./34-dependency-analysis.md)
