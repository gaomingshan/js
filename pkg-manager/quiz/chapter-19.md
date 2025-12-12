# 第 19 章：Yarn 性能优化与最佳实践 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Yarn缓存

### 题目

Yarn 的离线镜像功能如何实现？

**选项：**
- A. 下载所有包到本地
- B. 使用本地缓存
- C. 复制 node_modules
- D. 使用代理服务器

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Yarn 离线模式**

#### 基于缓存

```bash
# 首次联网安装
yarn install
# 包被缓存到 ~/.yarn/cache 或 .yarn/cache

# 离线安装
yarn install --offline
# 直接使用缓存，无需网络
```

#### Yarn 1.x 离线

```bash
# 缓存位置
~/.yarn/cache/

# 离线安装
yarn install --offline
```

#### Yarn 2+ 离线（Zero-Installs）

```bash
# 提交缓存
git add .yarn/cache

# clone 后
git clone repo
cd repo
yarn install --immutable
# 0秒安装！直接使用提交的缓存
```

#### 创建离线镜像

```bash
# 生成离线包
yarn install
tar -czf yarn-offline.tar.gz .yarn/cache yarn.lock

# 在离线环境
tar -xzf yarn-offline.tar.gz
yarn install --offline
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** immutable

### 题目

`yarn install --immutable` 会在 lock 文件变化时报错。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**--immutable 模式**

#### 严格检查

```bash
yarn install --immutable

# 如果 yarn.lock 需要更新
# ❌ Error: The lockfile would have been modified
```

**CI 环境必用！**

#### 用途

**防止意外变更：**
```yaml
# .github/workflows/ci.yml
- run: yarn install --immutable
  # 确保 CI 使用的是提交的 lock 文件
```

#### 相关参数

```bash
# --immutable
# 不允许更新 lock 文件

# --immutable-cache
# 不允许下载新包到缓存（Zero-Installs）

# --check-cache
# 验证缓存完整性

# 组合使用（最严格）
yarn install --immutable --immutable-cache
```

#### 开发 vs CI

```json
{
  "scripts": {
    "install": "yarn",
    "install:ci": "yarn install --immutable --immutable-cache"
  }
}
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 并行安装

### 题目

如何提升 Yarn Workspaces 的构建速度？

**选项：**
- A. 串行构建所有包
- B. 使用 -p 并行构建
- C. 使用 -pt 拓扑并行
- D. 手动控制顺序

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Workspace 构建优化**

#### 串行（慢）

```bash
yarn workspaces foreach run build
# 一个接一个构建
# 总时间：5分钟
```

#### 并行（快但可能失败）

```bash
yarn workspaces foreach -p run build
# 所有包同时构建
# 总时间：1分钟
# ⚠️ 但可能因依赖未构建而失败
```

#### 拓扑并行（最优）✅

```bash
yarn workspaces foreach -pt run build

# 智能并行：
# 1. 按依赖关系分层
# 2. 同层并行
# 3. 不同层按顺序

# 总时间：1.5分钟
# ✅ 保证正确性
```

**示例执行：**
```
层级 1（并行）:
  @pkg/utils  ⚡
  @pkg/icons  ⚡

层级 2（等待层级1完成后并行）:
  @pkg/ui  ⚡（依赖 utils, icons）

层级 3（等待层级2）:
  @pkg/app  ⚡（依赖 ui）
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 性能优化

### 题目

以下哪些方法可以加速 Yarn 安装？

**选项：**
- A. 使用 PnP 模式
- B. 启用 Zero-Installs
- C. 使用镜像源
- D. 增加网络带宽

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C

### 📖 解析

**Yarn 安装加速**

#### A. PnP 模式 ✅

```yaml
# .yarnrc.yml
nodeLinker: pnp
```

```bash
# node-modules
yarn install  # 45s

# PnP
yarn install  # 5s ⚡⚡⚡⚡⚡
```

**快 9 倍！**

#### B. Zero-Installs ✅

```bash
# 提交缓存
git add .yarn/cache

# clone 后
yarn install --immutable
# 0s ⚡⚡⚡⚡⚡
```

**瞬间完成！**

#### C. 镜像源 ✅

```yaml
# .yarnrc.yml
npmRegistryServer: "https://registry.npmmirror.com"
```

```bash
# 官方源（国外）
yarn install  # 60s

# 淘宝镜像（国内）
yarn install  # 15s ⚡⚡⚡⚡
```

#### D. 网络带宽 ⭐

**影响有限：**
- 下载占比小（20%）
- 解压和安装占比大（80%）
- PnP 跳过解压更重要

#### 综合优化

```yaml
# .yarnrc.yml
# 1. PnP
nodeLinker: pnp

# 2. 镜像
npmRegistryServer: "https://registry.npmmirror.com"

# 3. 并行
httpsConcurrency: 8

# 4. 缓存
enableGlobalCache: false  # 项目级缓存
```

**性能提升对比：**
```bash
# 默认配置
yarn install  # 60s

# + 镜像
yarn install  # 15s

# + PnP
yarn install  # 3s

# + Zero-Installs
yarn install  # 0s
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 依赖优化

### 题目

如何分析和减小 Yarn 项目的依赖体积？

**选项：**
- A. 使用 yarn why
- B. 使用 webpack-bundle-analyzer
- C. 删除 devDependencies
- D. A 和 B 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**依赖分析工具**

#### A. yarn why ✅

```bash
# 为什么安装了这个包？
yarn why lodash

# 输出：
=> Found "lodash@4.17.21"
info Reasons this module exists
   - "@myorg#ui" depends on it
   - Specified in "dependencies"
   - Hoisted from "@myorg#ui#lodash"
```

**查找依赖路径**

#### B. webpack-bundle-analyzer ✅

```bash
npm install -D webpack-bundle-analyzer
```

**webpack.config.js：**
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

```bash
yarn build
# 自动打开分析页面
```

**可视化包大小**

#### 其他分析工具

**1. yarn info：**
```bash
yarn info lodash

# 查看包信息：
# - 版本
# - 依赖
# - 大小
```

**2. 依赖树：**
```bash
yarn list --pattern "lodash"

# 显示所有 lodash 版本
```

**3. 重复依赖：**
```bash
yarn dedupe --check

# 检查可去重的包
```

#### 优化策略

**1. 替换大包：**
```json
{
  "dependencies": {
    "dayjs": "^1.11.0",        // 2KB ✅
    // "moment": "^2.29.0"     // 232KB ❌
    
    "lodash-es": "^4.17.21",   // Tree-shakable ✅
    // "lodash": "^4.17.21"    // 全量 ❌
  }
}
```

**2. 按需引入：**
```javascript
// ❌ 全量引入
import _ from 'lodash';

// ✅ 按需引入
import debounce from 'lodash/debounce';
```

**3. 动态导入：**
```javascript
// ✅ 代码分割
const heavyLib = () => import('heavy-lib');
```

**4. 移除未使用：**
```bash
yarn dlx depcheck

# 显示未使用的依赖
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 缓存策略

### 题目

Yarn 2+ 的 `enableGlobalCache` 配置的作用是什么？

**选项：**
- A. 启用全局缓存
- B. 禁用全局缓存，使用项目级缓存
- C. 清空缓存
- D. 共享缓存

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A/B（取决于值）

### 📖 解析

**enableGlobalCache 配置**

#### true - 全局缓存

```yaml
# .yarnrc.yml
enableGlobalCache: true
```

```bash
# 缓存位置
~/.yarn/berry/cache/

# 优势：
# - 多项目共享
# - 节省磁盘空间

# 劣势：
# - 无法 Zero-Installs
```

#### false - 项目缓存（推荐）

```yaml
# .yarnrc.yml
enableGlobalCache: false
```

```bash
# 缓存位置
.yarn/cache/

# 优势：
# - 支持 Zero-Installs
# - 可提交到 Git
# - 完全离线

# 劣势：
# - 占用空间（但可接受）
```

#### 使用建议

**开发机器：**
```yaml
enableGlobalCache: true  # 节省空间
```

**CI/CD 或 Zero-Installs：**
```yaml
enableGlobalCache: false  # 项目级
```

#### 缓存大小对比

```bash
# 全局缓存（10个项目）
~/.yarn/berry/cache/  # 500MB（共享）

# 项目缓存（10个项目）
project1/.yarn/cache/  # 100MB
project2/.yarn/cache/  # 100MB
...
# 总计：1GB

# 差异不大，Zero-Installs 价值更高
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 锁文件

### 题目

如何确保 Yarn 锁文件的一致性？

```bash
yarn install
# 修改了 yarn.lock
```

**选项：**
- A. 提交新的 lock 文件
- B. 使用 --frozen-lockfile
- C. 使用 --immutable
- D. B 和 C 在不同版本中

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**锁文件一致性**

#### Yarn 1.x

```bash
# 开发
yarn install  # 可能更新 lock

# CI（禁止更新）
yarn install --frozen-lockfile

# 如果 lock 需要更新 → 报错
```

#### Yarn 2+

```bash
# 开发
yarn install  # 可能更新 lock

# CI（禁止更新）
yarn install --immutable

# 如果 lock 需要更新 → 报错
```

**--frozen-lockfile 已废弃，使用 --immutable**

#### package.json 配置

```json
{
  "scripts": {
    "install": "yarn",
    "install:ci": "yarn install --immutable"
  }
}
```

#### CI 配置

```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: yarn install --immutable
  # Yarn 1: --frozen-lockfile
  # Yarn 2+: --immutable
```

#### 自动检测

```yaml
# Yarn 1 & 2+ 兼容
- name: Install
  run: |
    if yarn --version | grep -q '^1\.'; then
      yarn install --frozen-lockfile
    else
      yarn install --immutable
    fi
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** Monorepo性能

### 题目

如何优化大型 Yarn Workspace 的性能？

**选项：**
- A. 使用 Turborepo
- B. 启用 PnP
- C. 配置缓存策略
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**大型 Monorepo 优化**

#### A. Turborepo 加速 ✅

```bash
yarn add -D turbo
```

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "cache": true
    }
  }
}
```

**优势：**
- 智能缓存
- 并行执行
- 远程缓存

**性能：**
```bash
# 无缓存
yarn workspaces foreach -pt run build
# 5分钟

# Turborepo（首次）
turbo run build
# 3分钟

# Turborepo（有缓存）
turbo run build
# 10秒 ⚡⚡⚡⚡⚡
```

#### B. PnP 模式 ✅

```yaml
# .yarnrc.yml
nodeLinker: pnp
```

**节省：**
- 安装时间：80%
- 磁盘空间：60%
- CI 时间：90%（Zero-Installs）

#### C. 缓存策略 ✅

**1. 项目级缓存：**
```yaml
enableGlobalCache: false
```

**2. 提交缓存：**
```bash
git add .yarn/cache
```

**3. CI 缓存：**
```yaml
- uses: actions/cache@v3
  with:
    path: .yarn/cache
    key: ${{ hashFiles('yarn.lock') }}
```

#### 完整优化方案

**1. 架构层面：**
```yaml
# .yarnrc.yml
nodeLinker: pnp
enableGlobalCache: false
compressionLevel: 9
```

**2. 工具层面：**
```json
{
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

**3. 依赖层面：**
```json
{
  "resolutions": {
    "lodash": "4.17.21"  // 统一版本
  }
}
```

**4. CI 层面：**
```yaml
# Zero-Installs
- run: yarn install --immutable --immutable-cache

# Turborepo 远程缓存
- run: turbo run build --cache-dir=.turbo
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
```

#### 性能对比

**优化前：**
```bash
安装：60s
构建：5分钟
测试：2分钟
总计：7分钟
```

**优化后（首次）：**
```bash
安装：3s（PnP）
构建：3分钟（Turbo）
测试：1分钟（Turbo）
总计：4分钟
```

**优化后（缓存命中）：**
```bash
安装：0s（Zero-Installs）
构建：10s（Turbo缓存）
测试：5s（Turbo缓存）
总计：15s ⚡⚡⚡⚡⚡
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 最佳实践

### 题目

设计一个生产级 Yarn Monorepo 的完整配置。

<details>
<summary>查看答案</summary>

### ✅ 答案

**生产级 Monorepo 配置**

#### 1. 目录结构

```
my-monorepo/
├── .yarn/
│   ├── cache/          # 依赖缓存（提交）
│   ├── plugins/        # Yarn 插件
│   ├── releases/       # Yarn 版本
│   └── sdks/           # IDE SDK
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── packages/
│   ├── ui/
│   ├── utils/
│   └── icons/
├── apps/
│   ├── web/
│   └── admin/
├── tools/
│   └── scripts/
├── .yarnrc.yml         # Yarn 配置
├── turbo.json          # Turborepo 配置
├── package.json        # 根配置
└── yarn.lock           # 锁文件
```

#### 2. .yarnrc.yml

```yaml
# Yarn 版本
yarnPath: .yarn/releases/yarn-3.6.0.cjs
nodeLinker: pnp

# 插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-version.cjs

# 缓存（Zero-Installs）
enableGlobalCache: false
compressionLevel: 9

# 网络
npmRegistryServer: "https://registry.npmmirror.com"
httpRetry: 3
networkTimeout: 60000

# 私有源
npmScopes:
  mycompany:
    npmRegistryServer: "https://npm.mycompany.com"
    npmAlwaysAuth: true

# 包扩展
packageExtensions:
  "react-redux@*":
    peerDependencies:
      react: "*"
```

#### 3. package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "yarn@3.6.0",
  
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "tsc --build",
    "clean": "turbo run clean && rimraf node_modules .turbo",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "yarn build && changeset publish",
    
    "prepare": "husky install"
  },
  
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  
  "resolutions": {
    "@types/react": "^18.2.0",
    "@types/node": "^18.0.0",
    "typescript": "5.1.6"
  }
}
```

#### 4. turbo.json

```json
{
  "globalDependencies": [
    "tsconfig.json"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### 5. CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Enable Corepack
        run: corepack enable
      
      # Zero-Installs（秒装）
      - name: Install
        run: yarn install --immutable --immutable-cache
      
      # Turborepo 缓存
      - uses: actions/cache@v3
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: ${{ runner.os }}-turbo-
      
      - name: Build
        run: yarn build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
      
      - name: Test
        run: yarn test
      
      - name: Lint
        run: yarn lint
```

### 📖 解析

**最佳实践清单**

**✅ 性能：**
- PnP 模式
- Zero-Installs
- Turborepo 缓存
- 远程缓存

**✅ 开发体验：**
- 统一工具链
- IDE 集成
- Git hooks
- 类型检查

**✅ 发布管理：**
- Changesets
- 语义化版本
- 自动 CHANGELOG
- CI/CD 自动发布

**✅ 代码质量：**
- ESLint
- Prettier
- TypeScript
- 测试覆盖

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 性能监控

### 题目

如何监控和分析 Yarn 的性能？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Yarn 性能监控**

#### 1. 安装时间分析

```bash
# 启用性能分析
time yarn install

# 输出：
real    0m5.234s
user    0m8.123s
sys     0m2.456s
```

#### 2. Yarn 2+ 内置分析

```bash
# 详细日志
yarn install --verbose

# JSON 输出
yarn install --json > install-log.json
```

**install-log.json 分析：**
```javascript
// parse-install-log.js
const fs = require('fs');
const logs = fs.readFileSync('install-log.json', 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(JSON.parse);

const fetchLogs = logs.filter(log => log.type === 'fetchPackage');
const totalTime = fetchLogs.reduce((sum, log) => sum + log.data.duration, 0);

console.log(`Total fetch time: ${totalTime}ms`);
console.log(`Average: ${totalTime / fetchLogs.length}ms`);
```

#### 3. 性能指标收集

```javascript
// scripts/monitor-install.js
const { performance } = require('perf_hooks');
const { execSync } = require('child_process');
const fs = require('fs');

const metrics = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  yarnVersion: execSync('yarn --version').toString().trim(),
  phases: {}
};

function measure(name, fn) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  metrics.phases[name] = Math.round(duration);
}

// 清理
measure('clean', () => {
  execSync('rm -rf node_modules .pnp.cjs', { stdio: 'inherit' });
});

// 安装
measure('install', () => {
  execSync('yarn install', { stdio: 'inherit' });
});

// 重新安装（测试缓存）
measure('reinstall', () => {
  execSync('rm -rf .pnp.cjs && yarn install', { stdio: 'inherit' });
});

// 保存指标
fs.writeFileSync(
  'performance-metrics.json',
  JSON.stringify(metrics, null, 2)
);

console.table(metrics.phases);
```

#### 4. CI 性能追踪

```yaml
# .github/workflows/perf.yml
name: Performance Tracking

on:
  push:
    branches: [main]

jobs:
  track:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
      
      - name: Enable Corepack
        run: corepack enable
      
      - name: Measure install time
        run: |
          echo "START_TIME=$(date +%s%3N)" >> $GITHUB_ENV
          yarn install --immutable
          echo "END_TIME=$(date +%s%3N)" >> $GITHUB_ENV
      
      - name: Calculate duration
        run: |
          DURATION=$((END_TIME - START_TIME))
          echo "INSTALL_DURATION=${DURATION}ms" >> $GITHUB_ENV
          echo "::notice::Install took ${DURATION}ms"
      
      - name: Send metrics
        run: |
          curl -X POST https://metrics.example.com/yarn-install \
            -H "Content-Type: application/json" \
            -d '{
              "duration": ${{ env.INSTALL_DURATION }},
              "commit": "${{ github.sha }}",
              "branch": "${{ github.ref }}"
            }'
```

#### 5. 性能对比报告

```javascript
// scripts/compare-performance.js
const fs = require('fs');

const baseline = JSON.parse(fs.readFileSync('baseline-metrics.json'));
const current = JSON.parse(fs.readFileSync('performance-metrics.json'));

console.log('\nPerformance Comparison:');
console.log('━'.repeat(50));

for (const phase in baseline.phases) {
  const baseTime = baseline.phases[phase];
  const currTime = current.phases[phase];
  const diff = currTime - baseTime;
  const pct = ((diff / baseTime) * 100).toFixed(1);
  
  const icon = diff > 0 ? '🔴' : '🟢';
  const sign = diff > 0 ? '+' : '';
  
  console.log(`${icon} ${phase.padEnd(15)} ${currTime}ms (${sign}${pct}%)`);
}

// 如果性能下降超过 20%，失败
const totalBase = Object.values(baseline.phases).reduce((a, b) => a + b);
const totalCurr = Object.values(current.phases).reduce((a, b) => a + b);
const totalDiff = ((totalCurr - totalBase) / totalBase) * 100;

if (totalDiff > 20) {
  console.error(`\n❌ Performance regression: ${totalDiff.toFixed(1)}%`);
  process.exit(1);
}
```

### 📖 解析

**性能优化循环**

```
1. 测量基线
   ↓
2. 识别瓶颈
   ↓
3. 实施优化
   ↓
4. 验证效果
   ↓
5. 持续监控
```

**关键指标：**
- 首次安装时间
- 缓存安装时间
- CI 安装时间
- 磁盘占用
- 内存使用

</details>

---

**导航**  
[上一章：第 18 章面试题](./chapter-18.md) | [返回目录](../README.md) | [下一章：第 20 章面试题](./chapter-20.md)
