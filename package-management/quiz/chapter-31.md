# 第 31 章：Monorepo 构建优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 增量构建

### 题目

什么是增量构建（Incremental Build）？

**选项：**
- A. 完整重新构建
- B. 只构建变更的部分
- C. 并行构建
- D. 分布式构建

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**增量构建原理**

#### 定义

只重新构建发生变更的文件和依赖它们的文件。

#### 对比

**全量构建：**
```bash
pnpm -r run build
# 构建所有包
# 耗时：5分钟
```

**增量构建：**
```bash
turbo run build
# 只构建变更的包
# 耗时：30秒 ⚡
```

#### 工作原理

```
1. 计算文件哈希
2. 对比上次构建
3. 发现变更
4. 只构建变更+依赖
```

#### 示例

```
修改：packages/ui/Button.tsx

构建：
✓ packages/ui     (变更)
✓ apps/web        (依赖 ui)
✗ packages/utils  (跳过)
✗ apps/admin      (跳过)
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 构建缓存

### 题目

Turborepo 的缓存可以跨机器共享。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Turborepo 远程缓存**

#### 本地缓存

```bash
turbo run build
# 缓存到：.turbo/cache/
```

**只在本地生效**

#### 远程缓存

**配置：**
```bash
# 登录 Vercel
turbo login

# 链接项目
turbo link
```

**效果：**
```bash
# 开发者 A 构建
turbo run build
# 上传缓存到远程

# 开发者 B 拉取
turbo run build
# 下载缓存
# >>> FULL TURBO ⚡
```

**团队共享缓存**

#### 自托管

```yaml
# turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

**环境变量：**
```bash
TURBO_API="https://cache.company.com"
TURBO_TOKEN="xxx"
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 并行构建

### 题目

pnpm 如何并行运行脚本？

**选项：**
- A. pnpm -r run build
- B. pnpm -r --parallel run build
- C. pnpm run --parallel
- D. pnpm parallel build

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm 并行执行**

#### 串行（默认）

```bash
pnpm -r run build

# 按拓扑顺序执行
# icons → utils → ui → app
```

#### 并行

```bash
pnpm -r --parallel run build

# 同时执行所有包
# 不考虑依赖顺序
```

**注意：可能导致依赖问题**

#### 安全并行

**使用 Turborepo：**
```bash
turbo run build

# 智能并行
# - 按依赖顺序
# - 最大化并行
```

**示例：**
```
icons ─┐
utils ─┼─→ app
ui ────┘

# 并行：icons + utils + ui
# 然后：app
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 构建优化策略

### 题目

Monorepo 构建优化的方法有哪些？

**选项：**
- A. 增量构建
- B. 缓存复用
- C. 并行执行
- D. 按需构建

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**构建优化策略**

#### A. 增量构建 ✅

```bash
# Turborepo
turbo run build --filter="[HEAD^1]"

# 只构建变更的包
```

**节省 70-90% 时间**

#### B. 缓存复用 ✅

```bash
# 本地缓存
turbo run build

# 远程缓存
TURBO_TEAM=xxx turbo run build
```

**二次构建 0.1s**

#### C. 并行执行 ✅

```bash
# 智能并行
turbo run build

# 4核CPU
# 串行：40s
# 并行：12s ⚡
```

#### D. 按需构建 ✅

```bash
# 只构建特定包
turbo run build --filter=@myorg/app

# 只构建变更影响的包
turbo run build --filter="...[origin/main]"
```

#### 完整优化

**turbo.json：**
```json
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
turbo run build
# 5分钟

# 无变更
turbo run build
# 0.1s ⚡⚡⚡⚡⚡

# 只改一个文件
turbo run build
# 5s ⚡⚡⚡⚡
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Nx缓存配置

### 题目

如何配置 Nx 的构建缓存？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Nx 缓存配置**

#### nx.json

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "cacheDirectory": ".nx/cache"
      }
    }
  },
  "targetDefaults": {
    "build": {
      "inputs": [
        "{projectRoot}/**/*",
        "!{projectRoot}/**/*.spec.ts"
      ],
      "outputs": ["{workspaceRoot}/dist/{projectName}"],
      "cache": true
    }
  }
}
```

#### 字段说明

**cacheableOperations：**
```json
{
  "cacheableOperations": ["build", "test", "lint"]
}
```

**这些任务的结果会被缓存**

**inputs：**
```json
{
  "inputs": [
    "{projectRoot}/**/*",
    "!{projectRoot}/**/*.spec.ts"
  ]
}
```

**影响缓存的输入文件**

**outputs：**
```json
{
  "outputs": [
    "{workspaceRoot}/dist/{projectName}"
  ]
}
```

**缓存的输出文件**

#### 使用

```bash
# 首次构建
nx build my-app
# Building...
# Done in 30s

# 再次构建（无变更）
nx build my-app
# Cached
# Done in 0.1s ⚡
```

#### 远程缓存

**Nx Cloud：**
```bash
# 连接 Nx Cloud
nx connect-to-nx-cloud

# 自动启用远程缓存
```

**自托管：**
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test"],
        "accessToken": "xxx",
        "url": "https://cache.company.com"
      }
    }
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 构建产物

### 题目

如何处理 Monorepo 的构建产物？

**选项：**
- A. 提交到 Git
- B. 不提交，CI 构建
- C. 部分提交
- D. B 是最佳实践

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**构建产物管理**

#### 方案 B：不提交（推荐） ✅

**.gitignore：**
```
dist/
build/
*.tgz
```

**CI 构建：**
```yaml
- run: turbo run build
- run: npm publish
```

**优势：**
- ✅ 仓库体积小
- ✅ 避免冲突
- ✅ 确保一致性

#### 方案 A：提交（不推荐） ❌

**问题：**
```bash
# 每次构建产生大量变更
dist/
  main.js     # 100KB → 105KB
  vendor.js   # 2MB → 2.1MB
```

- ❌ 仓库膨胀
- ❌ 合并冲突
- ❌ Code Review 困难

#### 方案 C：部分提交

**场景：发布到 npm 的包**

```json
{
  "files": ["dist"],
  "scripts": {
    "prepublishOnly": "npm run build"
  }
}
```

**发布时自动构建**

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 构建依赖

### 题目

如何确保构建的依赖顺序正确？

<details>
<summary>查看答案</summary>

### ✅ 答案

**构建依赖管理**

#### Turborepo 方式

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

**`^build` = 先构建依赖**

**执行：**
```bash
turbo run build

# 自动顺序：
# 1. icons
# 2. utils (依赖 icons)
# 3. ui (依赖 icons)
# 4. app (依赖 utils, ui)
```

#### pnpm 方式

```bash
# 默认按拓扑顺序
pnpm -r run build

# 等待依赖完成
```

#### package.json 显式声明

**packages/app/package.json：**
```json
{
  "scripts": {
    "prebuild": "pnpm -C ../ui run build && pnpm -C ../utils run build",
    "build": "vite build"
  }
}
```

**不推荐：维护困难**

#### Nx 方式

**project.json：**
```json
{
  "targets": {
    "build": {
      "dependsOn": [
        {
          "projects": "dependencies",
          "target": "build"
        }
      ]
    }
  }
}
```

**自动管理依赖**

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 构建性能

### 题目

如何诊断 Monorepo 构建慢的问题？

<details>
<summary>查看答案</summary>

### ✅ 答案

**构建性能诊断**

#### 1. 测量基线

```bash
# 记录构建时间
time turbo run build

# 输出：
# real    5m30s
# user    18m40s
# sys     1m10s
```

#### 2. 分析瓶颈

**Turborepo 分析：**
```bash
turbo run build --profile=profile.json

# 生成性能分析文件
```

**查看：**
```bash
# 使用 Chrome DevTools
chrome://tracing
# 加载 profile.json
```

**Nx 分析：**
```bash
nx build my-app --profile

# 输出分析报告
```

#### 3. 识别慢任务

**示例输出：**
```
Tasks:
✓ packages/icons build    2s
✓ packages/utils build    5s
✓ packages/ui build       45s  ← 瓶颈
✓ apps/web build          12s
```

#### 4. 优化策略

**问题 1：TypeScript 编译慢**

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,     // 增量编译
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**问题 2：依赖扫描慢**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['react', 'react-dom']  // 预构建
  }
};
```

**问题 3：文件过多**

```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

**问题 4：重复构建**

```bash
# 使用缓存
turbo run build  # 启用缓存

# 远程缓存
turbo login
turbo link
```

#### 5. 并行优化

**识别并行机会：**
```
icons ──┐
utils ──┼── 可并行
types ──┘

ui ─────┐
hooks ──┼── 可并行
stores ─┘

app ────── 等待上述完成
```

**配置：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    }
  }
}
```

#### 6. 完整诊断脚本

```javascript
// scripts/diagnose-build.js
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 构建性能诊断\n');

// 1. 清理缓存
console.log('清理缓存...');
execSync('rm -rf .turbo node_modules/.cache');

// 2. 全量构建
console.log('全量构建...');
const start = Date.now();
execSync('turbo run build', { stdio: 'inherit' });
const fullBuildTime = Date.now() - start;

console.log(`\n全量构建: ${fullBuildTime}ms\n`);

// 3. 缓存构建
console.log('缓存构建...');
const cacheStart = Date.now();
execSync('turbo run build', { stdio: 'inherit' });
const cacheTime = Date.now() - cacheStart;

console.log(`\n缓存构建: ${cacheTime}ms\n`);

// 4. 增量构建
console.log('修改文件...');
fs.appendFileSync('packages/ui/src/index.ts', '\n// test\n');

const incStart = Date.now();
execSync('turbo run build', { stdio: 'inherit' });
const incTime = Date.now() - incStart;

console.log(`\n增量构建: ${incTime}ms\n`);

// 5. 报告
console.log('='.repeat(60));
console.log('📊 性能报告');
console.log('='.repeat(60));
console.log(`全量构建: ${(fullBuildTime / 1000).toFixed(1)}s`);
console.log(`缓存构建: ${(cacheTime / 1000).toFixed(1)}s (${((1 - cacheTime / fullBuildTime) * 100).toFixed(0)}% 提升)`);
console.log(`增量构建: ${(incTime / 1000).toFixed(1)}s (${((1 - incTime / fullBuildTime) * 100).toFixed(0)}% 提升)`);
```

### 📖 解析

**优化目标**

- 全量构建 < 5分钟
- 缓存构建 < 10秒
- 增量构建 < 30秒

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 分布式构建

### 题目

如何实现 Monorepo 的分布式构建？

<details>
<summary>查看答案</summary>

### ✅ 答案

**分布式构建方案**

#### 方案 1：Nx Cloud

**配置：**
```bash
# 连接 Nx Cloud
nx connect-to-nx-cloud
```

**nx.json：**
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test"],
        "accessToken": "xxx",
        "parallel": 4
      }
    }
  }
}
```

**CI 配置：**
```yaml
- name: Build
  run: nx affected:build --parallel=4
  env:
    NX_CLOUD_DISTRIBUTED_EXECUTION: true
```

**效果：**
```
Agent 1: packages/ui
Agent 2: packages/utils
Agent 3: apps/web
Agent 4: apps/admin

并行执行，共享缓存
```

#### 方案 2：GitHub Actions Matrix

```yaml
strategy:
  matrix:
    package:
      - ui
      - utils
      - icons
      - hooks

steps:
  - run: turbo run build --filter=@myorg/${{ matrix.package }}
```

**并行任务**

#### 方案 3：自定义分布式

**scripts/distributed-build.js：**
```javascript
const { Worker } = require('worker_threads');
const os = require('os');

class DistributedBuilder {
  constructor(packages) {
    this.packages = packages;
    this.workers = os.cpus().length;
  }

  async build() {
    // 拓扑排序
    const sorted = this.topologicalSort();
    
    // 按层级分组
    const levels = this.groupByLevel(sorted);
    
    // 逐层并行构建
    for (const level of levels) {
      await this.buildLevel(level);
    }
  }

  async buildLevel(packages) {
    const workers = packages.map(pkg => {
      return new Promise((resolve, reject) => {
        const worker = new Worker('./build-worker.js', {
          workerData: { package: pkg }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
      });
    });

    await Promise.all(workers);
  }

  topologicalSort() {
    // 实现拓扑排序
  }

  groupByLevel(sorted) {
    // 按依赖层级分组
    // Level 0: 无依赖
    // Level 1: 只依赖 Level 0
    // Level 2: 只依赖 Level 0-1
  }
}
```

**build-worker.js：**
```javascript
const { parentPort, workerData } = require('worker_threads');
const { execSync } = require('child_process');

const { package } = workerData;

try {
  execSync(`pnpm --filter ${package} run build`, {
    stdio: 'inherit'
  });
  
  parentPort.postMessage({ success: true, package });
} catch (error) {
  parentPort.postMessage({ success: false, package, error });
}
```

#### 方案 4：BuildKite

**.buildkite/pipeline.yml：**
```yaml
steps:
  - label: ":package: Build packages"
    command: turbo run build
    parallelism: 4
    env:
      TURBO_TOKEN: "${TURBO_TOKEN}"
      TURBO_TEAM: "${TURBO_TEAM}"
```

**自动分配任务到多个 agent**

### 📖 解析

**方案对比**

| 方案 | 成本 | 复杂度 | 效果 |
|------|------|--------|------|
| **Nx Cloud** | $$$ | 低 | ⭐⭐⭐⭐⭐ |
| **GitHub Matrix** | $ | 中 | ⭐⭐⭐⭐ |
| **自定义** | $ | 高 | ⭐⭐⭐ |
| **BuildKite** | $$ | 中 | ⭐⭐⭐⭐ |

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 构建监控

### 题目

实现一个构建性能监控系统。

<details>
<summary>查看答案</summary>

### ✅ 答案

**构建性能监控**

```javascript
// scripts/build-monitor.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      duration: {},
      cacheHit: {},
      errors: [],
      warnings: []
    };
  }

  // 运行构建并监控
  async runBuild(command = 'turbo run build') {
    console.log('🚀 开始构建监控\n');

    const startTime = Date.now();

    try {
      // 捕获输出
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.parseOutput(output);
      
    } catch (error) {
      this.metrics.errors.push({
        message: error.message,
        code: error.status
      });
    }

    this.metrics.totalDuration = Date.now() - startTime;

    this.generateReport();
    this.saveMetrics();
    this.sendAlert();
  }

  // 解析构建输出
  parseOutput(output) {
    const lines = output.split('\n');

    lines.forEach(line => {
      // Turborepo 输出解析
      if (line.includes('>>> FULL TURBO')) {
        this.metrics.fullCache = true;
      }

      // 任务时间
      const taskMatch = line.match(/(.+?): (\d+)ms/);
      if (taskMatch) {
        const [, task, time] = taskMatch;
        this.metrics.duration[task] = parseInt(time);
      }

      // 缓存命中
      if (line.includes('cache hit')) {
        const pkg = line.split(':')[0].trim();
        this.metrics.cacheHit[pkg] = true;
      }

      // 警告
      if (line.includes('warning')) {
        this.metrics.warnings.push(line);
      }
    });
  }

  // 生成报告
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 构建性能报告');
    console.log('='.repeat(60));

    // 总时间
    const totalSec = (this.metrics.totalDuration / 1000).toFixed(1);
    console.log(`\n⏱️  总耗时: ${totalSec}s`);

    // 缓存状态
    const cacheCount = Object.keys(this.metrics.cacheHit).length;
    const totalTasks = Object.keys(this.metrics.duration).length;
    const cacheRate = totalTasks > 0 
      ? ((cacheCount / totalTasks) * 100).toFixed(0)
      : 0;

    console.log(`💾 缓存命中: ${cacheCount}/${totalTasks} (${cacheRate}%)`);

    if (this.metrics.fullCache) {
      console.log('⚡ FULL TURBO!');
    }

    // 最慢的任务
    console.log('\n🐌 最慢的任务:');
    const sorted = Object.entries(this.metrics.duration)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sorted.forEach(([task, time]) => {
      const sec = (time / 1000).toFixed(1);
      console.log(`  ${task}: ${sec}s`);
    });

    // 警告
    if (this.metrics.warnings.length > 0) {
      console.log(`\n⚠️  警告: ${this.metrics.warnings.length} 个`);
      this.metrics.warnings.slice(0, 3).forEach(w => {
        console.log(`  ${w}`);
      });
    }

    // 错误
    if (this.metrics.errors.length > 0) {
      console.log(`\n❌ 错误: ${this.metrics.errors.length} 个`);
      this.metrics.errors.forEach(e => {
        console.log(`  ${e.message}`);
      });
    }

    console.log('\n');
  }

  // 保存指标
  saveMetrics() {
    const dir = 'build-metrics';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${dir}/${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.metrics, null, 2));

    console.log(`📄 指标已保存: ${filename}`);

    // 保存历史趋势
    this.updateTrend();
  }

  // 更新趋势
  updateTrend() {
    const trendFile = 'build-metrics/trend.json';
    let trend = [];

    if (fs.existsSync(trendFile)) {
      trend = JSON.parse(fs.readFileSync(trendFile, 'utf8'));
    }

    trend.push({
      timestamp: this.metrics.timestamp,
      duration: this.metrics.totalDuration,
      cacheRate: this.calculateCacheRate()
    });

    // 只保留最近 100 次
    if (trend.length > 100) {
      trend = trend.slice(-100);
    }

    fs.writeFileSync(trendFile, JSON.stringify(trend, null, 2));

    // 分析趋势
    this.analyzeTrend(trend);
  }

  // 计算缓存率
  calculateCacheRate() {
    const cacheCount = Object.keys(this.metrics.cacheHit).length;
    const totalTasks = Object.keys(this.metrics.duration).length;
    return totalTasks > 0 ? (cacheCount / totalTasks) * 100 : 0;
  }

  // 分析趋势
  analyzeTrend(trend) {
    if (trend.length < 5) return;

    const recent = trend.slice(-5);
    const avgDuration = recent.reduce((sum, t) => sum + t.duration, 0) / 5;
    const current = this.metrics.totalDuration;

    // 性能退化检测
    if (current > avgDuration * 1.5) {
      console.log('⚠️  构建时间显著增加！');
      console.log(`   当前: ${(current / 1000).toFixed(1)}s`);
      console.log(`   平均: ${(avgDuration / 1000).toFixed(1)}s`);
    }

    // 缓存率下降检测
    const avgCacheRate = recent.reduce((sum, t) => sum + t.cacheRate, 0) / 5;
    const currentCacheRate = this.calculateCacheRate();

    if (currentCacheRate < avgCacheRate - 20) {
      console.log('⚠️  缓存命中率下降！');
      console.log(`   当前: ${currentCacheRate.toFixed(0)}%`);
      console.log(`   平均: ${avgCacheRate.toFixed(0)}%`);
    }
  }

  // 发送告警
  sendAlert() {
    // 阈值检查
    const thresholds = {
      maxDuration: 5 * 60 * 1000,  // 5分钟
      minCacheRate: 50,             // 50%
      maxErrors: 0
    };

    const alerts = [];

    if (this.metrics.totalDuration > thresholds.maxDuration) {
      alerts.push(`构建超时: ${(this.metrics.totalDuration / 1000).toFixed(0)}s`);
    }

    const cacheRate = this.calculateCacheRate();
    if (cacheRate < thresholds.minCacheRate) {
      alerts.push(`缓存率过低: ${cacheRate.toFixed(0)}%`);
    }

    if (this.metrics.errors.length > thresholds.maxErrors) {
      alerts.push(`构建失败: ${this.metrics.errors.length} 个错误`);
    }

    if (alerts.length > 0) {
      console.log('\n🚨 告警触发:');
      alerts.forEach(alert => console.log(`  ${alert}`));

      // Webhook 通知
      this.sendWebhook(alerts);
    }
  }

  // Webhook 通知
  sendWebhook(alerts) {
    const webhook = process.env.BUILD_WEBHOOK;
    if (!webhook) return;

    const payload = {
      text: '构建性能告警',
      alerts,
      metrics: {
        duration: this.metrics.totalDuration,
        cacheRate: this.calculateCacheRate()
      }
    };

    // 发送到 Slack/钉钉等
    try {
      const https = require('https');
      const url = new URL(webhook);

      const req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      req.write(JSON.stringify(payload));
      req.end();
    } catch (e) {
      console.error('Webhook 发送失败:', e.message);
    }
  }
}

// 运行
const monitor = new BuildMonitor();
monitor.runBuild().catch(console.error);
```

**使用：**
```bash
node scripts/build-monitor.js
```

**CI 集成：**
```yaml
- name: Build with monitoring
  run: node scripts/build-monitor.js
  env:
    BUILD_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}

- name: Upload metrics
  uses: actions/upload-artifact@v3
  with:
    name: build-metrics
    path: build-metrics/
```

### 📖 解析

**监控指标**

1. ✅ 构建时间
2. ✅ 缓存命中率
3. ✅ 任务耗时
4. ✅ 错误/警告
5. ✅ 趋势分析
6. ✅ 自动告警

</details>

---

**导航**  
[上一章：第 30 章面试题](./chapter-30.md) | [返回目录](../README.md) | [下一章：第 32 章面试题](./chapter-32.md)
