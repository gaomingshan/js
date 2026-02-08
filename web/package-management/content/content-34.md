# CI/CD 优化实践

## 缓存策略（node_modules、pnpm store）

### GitHub Actions 缓存

**npm 缓存**：
```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'  # 自动缓存 ~/.npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
```

**手动缓存控制**：
```yaml
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
  
- name: Install dependencies
  if: steps.cache.outputs.cache-hit != 'true'
  run: npm ci
```

**pnpm store 缓存**：
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Get pnpm store directory
  id: pnpm-cache
  run: |
    echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

**缓存效果对比**：
```
无缓存：
└── Install dependencies: 3 分钟

有缓存（npm）：
├── Restore cache: 20 秒
└── Install dependencies: 30 秒
总计：50 秒（快 72%）

有缓存（pnpm + store）：
├── Restore cache: 15 秒
└── Install dependencies: 10 秒
总计：25 秒（快 86%）
```

### GitLab CI 缓存

**配置**：
```yaml
variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"
  CYPRESS_CACHE_FOLDER: "$CI_PROJECT_DIR/cache/Cypress"

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
    - .npm/

install:
  stage: install
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

build:
  stage: build
  dependencies:
    - install
  script:
    - npm run build
```

**pnpm 配置**：
```yaml
variables:
  PNPM_HOME: "$CI_PROJECT_DIR/.pnpm"
  
cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store/

before_script:
  - corepack enable
  - pnpm config set store-dir .pnpm-store

install:
  script:
    - pnpm install --frozen-lockfile
```

---

## 增量测试与构建

### 检测受影响的包

**Lerna**：
```bash
# 获取变更的包
lerna changed

# 只测试变更的包
lerna run test --since origin/main
```

**Nx**：
```bash
# 检测受影响的项目
nx affected:apps --base=origin/main

# 只测试受影响的
nx affected --target=test --base=origin/main
```

**Turborepo**：
```bash
# 基于 Git 的增量构建
turbo run build --filter=[HEAD^1]

# 自定义基准
turbo run test --filter=[origin/main]
```

### CI 配置

**GitHub Actions**：
```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  affected:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build affected
        run: pnpm turbo run build --filter=[origin/main]
      
      - name: Test affected
        run: pnpm turbo run test --filter=[origin/main]
      
      - name: Lint affected
        run: pnpm turbo run lint --filter=[origin/main]
```

**效果对比**：
```
完整构建：
└── Build all packages: 5 分钟

增量构建（修改 1 个包）：
├── Detect affected: 5 秒
├── Build 2 packages: 30 秒
└── Test 2 packages: 20 秒
总计：55 秒（快 82%）
```

---

## 受影响包检测（affected packages）

### Git Diff 分析

**基本原理**：
```javascript
function getChangedFiles(base, head) {
  const diff = execSync(`git diff ${base}...${head} --name-only`).toString();
  return diff.split('\n').filter(Boolean);
}

function getAffectedPackages(changedFiles, packages) {
  const affected = new Set();
  
  for (const file of changedFiles) {
    // 找到文件所属的包
    const pkg = packages.find(p => file.startsWith(p.location));
    if (pkg) {
      affected.add(pkg.name);
    }
  }
  
  return Array.from(affected);
}
```

**依赖传播**：
```javascript
function propagateAffected(affected, dependencyGraph) {
  const result = new Set(affected);
  
  // 遍历依赖图，找到所有依赖者
  for (const pkg of affected) {
    const dependents = getDependents(pkg, dependencyGraph);
    for (const dep of dependents) {
      result.add(dep);
      // 递归传播
      const transitive = propagateAffected([dep], dependencyGraph);
      transitive.forEach(t => result.add(t));
    }
  }
  
  return Array.from(result);
}
```

**示例**：
```
变更文件：
- packages/utils/src/string.ts

直接受影响：
- @my-org/utils

依赖者：
- @my-org/core (依赖 utils)
- @my-org/ui (依赖 core)
- @my-org/app (依赖 ui)

最终受影响列表：
[@my-org/utils, @my-org/core, @my-org/ui, @my-org/app]
```

### Nx 受影响检测

**配置**（nx.json）：
```json
{
  "affected": {
    "defaultBase": "origin/main"
  },
  "implicitDependencies": {
    "package.json": "*",
    "tsconfig.json": "*",
    ".eslintrc.json": "*"
  }
}
```

**执行**：
```bash
# 查看受影响的项目
nx affected:graph --base=origin/main

# 输出受影响列表
nx print-affected --base=origin/main --select=projects

# 只运行受影响的测试
nx affected --target=test --parallel=3
```

**优化策略**：
```yaml
# GitHub Actions
- name: Set affected base
  id: set-base
  run: |
    if [ "${{ github.event_name }}" == "pull_request" ]; then
      echo "BASE=${{ github.event.pull_request.base.sha }}" >> $GITHUB_OUTPUT
    else
      echo "BASE=HEAD~1" >> $GITHUB_OUTPUT
    fi

- name: Run affected tests
  run: |
    nx affected --target=test --base=${{ steps.set-base.outputs.BASE }}
```

---

## 部署策略（独立部署 vs 批量部署）

### 独立部署

**场景**：每个包独立发布

**Lerna**：
```bash
# 只发布变更的包
lerna publish --conventional-commits

# 选择性发布
lerna publish --scope=@my-org/core
```

**CI 配置**：
```yaml
name: Publish

on:
  push:
    tags:
      - '@my-org/core@*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Extract package name
        id: package
        run: |
          TAG="${{ github.ref }}"
          PACKAGE=$(echo $TAG | sed 's/@\(.*\)@.*/\1/')
          echo "name=$PACKAGE" >> $GITHUB_OUTPUT
      
      - name: Publish package
        run: |
          cd packages/${{ steps.package.outputs.name }}
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**优势**：
- 快速部署
- 风险隔离
- 按需发布

**劣势**：
- 版本管理复杂
- 依赖协调困难

### 批量部署

**场景**：所有包统一发布

**Lerna Fixed Mode**：
```json
// lerna.json
{
  "version": "1.0.0",
  "packages": ["packages/*"],
  "command": {
    "publish": {
      "message": "chore(release): publish %s"
    }
  }
}
```

**发布流程**：
```bash
# 1. 更新版本
lerna version patch

# 2. 发布所有包
lerna publish from-package
```

**CI 配置**：
```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    if: "!contains(github.event.head_commit.message, 'chore(release)')"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN }}
      
      - name: Setup Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      
      - name: Version
        run: lerna version --yes --conventional-commits
      
      - name: Publish
        run: lerna publish from-git --yes
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**优势**：
- 版本一致
- 简化管理
- 避免依赖冲突

**劣势**：
- 全量发布慢
- 未变更的包也升版本

### 混合策略

**Changesets 工作流**：
```bash
# 开发者添加 changeset
npx changeset

# CI 创建 PR
# - 汇总所有 changesets
# - 生成 CHANGELOG
# - 更新版本号

# 合并 PR 后自动发布
npx changeset publish
```

**GitHub Actions**：
```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**特点**：
- 只发布变更的包
- 自动化版本管理
- 团队协作友好

---

## 常见误区

### 误区 1：过度缓存

**问题**：缓存所有内容

```yaml
# 错误示例
cache:
  paths:
    - node_modules/
    - dist/
    - .next/
    - coverage/
    - .turbo/
    - tmp/
```

**后果**：
- 缓存恢复时间长
- 磁盘占用大
- 可能缓存错误结果

**正确做法**：
```yaml
# 只缓存依赖
cache:
  paths:
    - node_modules/
    # 或 pnpm store
    - .pnpm-store/
```

### 误区 2：忽略缓存失效

**问题**：缓存键不完整

```yaml
# 错误
cache:
  key: node-modules  # 固定 key
```

**后果**：
- package.json 变化不触发重新安装
- 使用旧版本依赖

**正确**：
```yaml
cache:
  key:
    files:
      - package-lock.json  # 基于 lockfile
```

### 误区 3：全量构建

**问题**：每次 PR 都构建所有包

```yaml
# 低效
- run: npm run build
```

**优化**：
```yaml
# 只构建受影响的
- run: turbo run build --filter=[origin/main]
```

---

## 工程实践

### 场景 1：大型 Monorepo CI 优化

**优化前**：
```
├── Install: 5 分钟
├── Lint: 10 分钟
├── Test: 15 分钟
├── Build: 20 分钟
└── 总计: 50 分钟
```

**优化后**：
```yaml
name: Optimized CI

on: [pull_request]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - uses: pnpm/action-setup@v2
      
      - name: Cache pnpm store
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: pnpm-${{ hashFiles('pnpm-lock.yaml') }}
      
      - name: Install
        run: pnpm install --frozen-lockfile
      
      - name: Upload node_modules
        uses: actions/upload-artifact@v3
        with:
          name: node_modules
          path: node_modules/
  
  lint:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
      - run: turbo run lint --filter=[origin/main]
  
  test:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
      - run: turbo run test --filter=[origin/main]
  
  build:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
      - run: turbo run build --filter=[origin/main]
```

**优化后**：
```
├── Setup (并行): 1 分钟
├── Lint: 2 分钟
├── Test: 3 分钟
├── Build: 4 分钟
└── 总计: 6 分钟（快 88%）
```

### 场景 2：多环境部署

**配置**：
```yaml
name: Deploy

on:
  push:
    branches:
      - main
      - staging
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set environment
        id: env
        run: |
          case "${{ github.ref }}" in
            refs/heads/main)
              echo "env=production" >> $GITHUB_OUTPUT
              ;;
            refs/heads/staging)
              echo "env=staging" >> $GITHUB_OUTPUT
              ;;
            refs/heads/develop)
              echo "env=development" >> $GITHUB_OUTPUT
              ;;
          esac
      
      - name: Build
        run: |
          export NODE_ENV=${{ steps.env.outputs.env }}
          pnpm build
      
      - name: Deploy
        run: |
          pnpm deploy --env=${{ steps.env.outputs.env }}
```

### 场景 3：Docker 多阶段构建

**Dockerfile**：
```dockerfile
# 阶段 1：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

# 阶段 2：构建
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 阶段 3：运行
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

CMD ["node", "dist/index.js"]
```

**构建缓存**：
```yaml
- name: Build Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    cache-from: type=gha
    cache-to: type=gha,mode=max
    push: true
    tags: myapp:latest
```

---

## 深入一点

### CI 缓存的命中率分析

**缓存命中率计算**：
```
命中率 = 缓存命中次数 / 总构建次数

影响因素：
1. lockfile 变更频率
2. 分支数量
3. 并行构建数
```

**优化策略**：
```yaml
# 使用 restore-keys 提高命中率
cache:
  key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
  restore-keys: |
    ${{ runner.os }}-node-
    ${{ runner.os }}-
```

### 增量构建的理论极限

**Amdahl's Law**：
```
加速比 = 1 / ((1 - P) + P / S)

P = 可并行部分比例
S = 并行加速倍数

示例：
80% 可并行，4 核并行
加速比 = 1 / (0.2 + 0.8 / 4) = 2.5 倍
```

### CI 成本优化

**GitHub Actions 成本**：
```
免费额度：
- 公开仓库：无限
- 私有仓库：2000 分钟/月

超出成本：
- Linux: $0.008/分钟
- macOS: $0.08/分钟

优化前：50 分钟/次 × 100 次/月 = 5000 分钟
成本：(5000 - 2000) × $0.008 = $24/月

优化后：6 分钟/次 × 100 次/月 = 600 分钟
成本：$0（在免费额度内）

节省：$24/月 = $288/年
```

---

## 参考资料

- [GitHub Actions 缓存](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Turborepo CI 配置](https://turbo.build/repo/docs/ci)
- [Nx CI 优化](https://nx.dev/recipes/ci)
- [Docker 多阶段构建](https://docs.docker.com/build/building/multi-stage/)
