# pnpm 性能优化

## 概述

pnpm 本身已经很快，但通过合理配置和使用技巧，可以进一步提升性能，特别是在 CI/CD 和大型 Monorepo 中。

## 一、全局 Store 优化

### 1.1 Store 位置

```bash
# 查看 store 路径
pnpm store path

# 自定义 store 位置
pnpm config set store-dir /path/to/store
```

**.npmrc：**
```ini
store-dir=~/.pnpm-store
```

**建议：**
- SSD 硬盘上
- 足够的磁盘空间
- CI 环境：使用缓存卷

### 1.2 Store 清理

```bash
# 查看可清理的空间
pnpm store prune --dry-run

# 清理未使用的包
pnpm store prune
```

**自动清理：**
```bash
# 定期清理（crontab）
0 0 * * 0 pnpm store prune
```

## 二、缓存策略

### 2.1 启用全局缓存

```ini
# .npmrc
# 使用全局 store（默认）
store-dir=~/.pnpm-store

# 项目级缓存（不推荐）
# store-dir=node_modules/.pnpm-store
```

### 2.2 网络缓存

```ini
# HTTP 缓存
fetch-retries=5
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 网络并发
network-concurrency=16
```

### 2.3 Side Effects Cache

```ini
# 缓存构建结果
side-effects-cache=true
side-effects-cache-readonly=false
```

## 三、并行安装

### 3.1 调整并发数

```ini
# 网络并发
network-concurrency=16

# 子进程并发
child-concurrency=5
```

**根据硬件调整：**
- CPU 核心数多：增加 `child-concurrency`
- 网络带宽大：增加 `network-concurrency`

### 3.2 并行构建

```bash
# Monorepo 并行构建
pnpm -r --parallel run build

# 限制并发数
pnpm -r --workspace-concurrency=4 run build
```

## 四、CI/CD 优化

### 4.1 缓存 Store

**GitHub Actions：**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Get pnpm store directory
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

**GitLab CI：**
```yaml
variables:
  PNPM_HOME: ${CI_PROJECT_DIR}/.pnpm-store

cache:
  paths:
    - .pnpm-store

before_script:
  - corepack enable
  - pnpm config set store-dir ${PNPM_HOME}
  - pnpm install --frozen-lockfile
```

### 4.2 frozen-lockfile

```bash
# CI 中使用（不更新 lock 文件）
pnpm install --frozen-lockfile

# 快速失败
pnpm install --frozen-lockfile --strict-peer-dependencies
```

### 4.3 prefer-offline

```bash
# 优先使用缓存
pnpm install --prefer-offline
```

## 五、Monorepo 性能

### 5.1 过滤器优化

```bash
# 只构建改动的包
pnpm --filter ...[HEAD^1] build

# 只测试受影响的包
pnpm --filter "...[origin/main]" test
```

### 5.2 增量构建

```bash
# 使用 Turborepo
pnpm dlx turbo run build --filter ...[HEAD^1]

# 或 Nx
pnpm exec nx affected:build
```

### 5.3 共享依赖

**提升公共依赖：**
```ini
# .npmrc
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

## 六、性能监控

### 6.1 安装速度分析

```bash
# 详细日志
pnpm install --loglevel verbose

# 性能追踪
time pnpm install
```

### 6.2 依赖分析

```bash
# 查看包大小
pnpm why lodash

# 依赖树
pnpm ls --depth 0
```

### 6.3 Store 状态

```bash
# Store 大小
du -sh ~/.pnpm-store

# 包数量
find ~/.pnpm-store -type f | wc -l
```

## 七、磁盘优化

### 7.1 定期清理

```bash
# 清理 store
pnpm store prune

# 清理 node_modules
rm -rf node_modules
pnpm install
```

### 7.2 Store 压缩

pnpm 自动使用硬链接，无需手动压缩。

## 八、网络优化

### 8.1 使用镜像源

```ini
# .npmrc
registry=https://registry.npmmirror.com

# 二进制文件镜像
electron_mirror=https://npmmirror.com/mirrors/electron/
node_mirror=https://npmmirror.com/mirrors/node/
```

### 8.2 代理配置

```ini
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080

# 不走代理的地址
noproxy=localhost,127.0.0.1
```

## 九、最佳实践

### 9.1 推荐配置

```ini
# .npmrc - 性能优化配置
store-dir=~/.pnpm-store
side-effects-cache=true
strict-peer-dependencies=false

# 并发
network-concurrency=16
child-concurrency=5

# 缓存
fetch-retries=5
```

### 9.2 CI 配置

```yaml
# .github/workflows/ci.yml
- name: Install
  run: |
    corepack enable
    pnpm install --frozen-lockfile --prefer-offline
  env:
    HUSKY: 0  # 跳过 Git hooks
```

### 9.3 开发环境

```bash
# 定期清理
pnpm store prune

# 检查过期包
pnpm outdated

# 更新依赖
pnpm update -i
```

## 十、性能对比

### 10.1 安装速度

```bash
# 项目：200+ 依赖
# 硬件：MacBook Pro M1, SSD

冷安装（无缓存）:
npm:    45s
yarn:   28s
pnpm:   14s  ⚡⚡

热安装（有缓存）:
npm:    10s
yarn:   5s
pnpm:   1s   ⚡⚡⚡
```

### 10.2 磁盘占用

```bash
# 10个相同项目

npm/yarn:
10 × 520MB = 5.2GB

pnpm:
1 × 180MB (store) = 180MB  # 节省 96%
```

### 10.3 CI 时间

```bash
# GitHub Actions

npm + cache:   3min
yarn + cache:  2min
pnpm + cache:  45s  ⚡⚡⚡
```

## 参考资料

- [pnpm 性能文档](https://pnpm.io/benchmarks)
- [CI 集成](https://pnpm.io/continuous-integration)

---

**导航**  
[上一章：pnpm高级特性](./24-pnpm-advanced.md) | [返回目录](../README.md) | [下一章：依赖冲突解决](./26-conflict-resolution.md)
