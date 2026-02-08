# 任务编排与增量构建

## 依赖图驱动的构建顺序

### 依赖图构建

**分析 package.json**：
```javascript
function buildDependencyGraph(packages) {
  const graph = new Map();
  
  for (const pkg of packages) {
    const deps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ];
    
    // 只保留内部依赖
    const internalDeps = deps.filter(dep => 
      packages.some(p => p.name === dep)
    );
    
    graph.set(pkg.name, internalDeps);
  }
  
  return graph;
}
```

**示例**：
```
packages/
├── utils/        (无依赖)
├── core/         (依赖 utils)
├── ui/           (依赖 core)
└── app/          (依赖 ui, core)

依赖图：
{
  'utils': [],
  'core': ['utils'],
  'ui': ['core'],
  'app': ['ui', 'core']
}
```

### 拓扑排序

**算法实现**：
```javascript
function topologicalSort(graph) {
  const sorted = [];
  const visited = new Set();
  const visiting = new Set();
  
  function visit(node) {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      throw new Error(`Circular dependency detected: ${node}`);
    }
    
    visiting.add(node);
    
    const deps = graph.get(node) || [];
    for (const dep of deps) {
      visit(dep);
    }
    
    visiting.delete(node);
    visited.add(node);
    sorted.push(node);
  }
  
  for (const node of graph.keys()) {
    visit(node);
  }
  
  return sorted;
}
```

**构建顺序**：
```javascript
const graph = {
  'utils': [],
  'core': ['utils'],
  'ui': ['core'],
  'app': ['ui', 'core']
};

const order = topologicalSort(graph);
// ['utils', 'core', 'ui', 'app']

// 按此顺序构建
for (const pkg of order) {
  await build(pkg);
}
```

### 并行层级构建

**分层算法**：
```javascript
function buildLevels(graph) {
  const levels = [];
  const inDegree = new Map();
  
  // 初始化入度
  for (const [node, deps] of graph.entries()) {
    inDegree.set(node, deps.length);
  }
  
  while (inDegree.size > 0) {
    const level = [];
    
    // 找到入度为0的节点
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        level.push(node);
      }
    }
    
    if (level.length === 0) {
      throw new Error('Circular dependency detected');
    }
    
    levels.push(level);
    
    // 移除已处理节点，更新入度
    for (const node of level) {
      inDegree.delete(node);
      
      for (const [other, deps] of graph.entries()) {
        if (deps.includes(node)) {
          inDegree.set(other, inDegree.get(other) - 1);
        }
      }
    }
  }
  
  return levels;
}
```

**并行执行**：
```javascript
const levels = buildLevels(graph);
// [
//   ['utils'],           // Level 0: 无依赖
//   ['core'],            // Level 1: 依赖 Level 0
//   ['ui'],              // Level 2: 依赖 Level 1
//   ['app']              // Level 3: 依赖 Level 2
// ]

// 按层级并行构建
for (const level of levels) {
  await Promise.all(level.map(pkg => build(pkg)));
}
```

**性能提升**：
```
串行：utils(3s) + core(5s) + ui(4s) + app(6s) = 18s

并行分层（假设有多依赖）：
Level 0: max(utils, config) = max(3s, 2s) = 3s
Level 1: core = 5s
Level 2: max(ui, api) = max(4s, 3s) = 4s
Level 3: app = 6s
总计：18s

如果依赖图更复杂，收益更明显
```

---

## 任务缓存机制

### 缓存键生成

**输入因子**：
```javascript
function generateCacheKey(task) {
  const inputs = {
    // 1. 任务配置
    command: task.command,
    args: task.args,
    
    // 2. 源代码
    sourceFiles: hashFiles(task.inputs),
    
    // 3. 依赖的输出
    dependencies: task.deps.map(d => d.outputHash),
    
    // 4. 环境变量
    env: task.envVars.map(key => process.env[key]),
    
    // 5. 配置文件
    config: hashFiles(['package.json', 'tsconfig.json'])
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(inputs))
    .digest('hex');
}
```

**示例**：
```javascript
const task = {
  name: 'build',
  command: 'tsc',
  inputs: ['src/**/*.ts'],
  deps: [coreTask],
  envVars: ['NODE_ENV'],
  outputs: ['dist/**']
};

const key = generateCacheKey(task);
// "a1b2c3d4e5f6..."
```

### 缓存存储

**本地缓存结构**：
```
.turbo/cache/
└── a1b2c3d4e5f6.../
    ├── outputs/
    │   └── dist/
    │       └── index.js
    ├── log
    └── manifest.json
```

**manifest.json**：
```json
{
  "hash": "a1b2c3d4e5f6...",
  "task": "build",
  "outputs": ["dist/**"],
  "timestamp": 1672531200000,
  "duration": 5000
}
```

**缓存恢复**：
```javascript
async function restoreFromCache(cacheKey, outputs) {
  const cacheDir = `.turbo/cache/${cacheKey}`;
  
  if (!fs.existsSync(cacheDir)) {
    return false;  // 缓存未命中
  }
  
  // 复制缓存的输出到工作目录
  for (const output of outputs) {
    const src = path.join(cacheDir, 'outputs', output);
    const dest = path.join(process.cwd(), output);
    await fs.copy(src, dest);
  }
  
  console.log(`cache hit, replaying output`);
  return true;
}
```

### 缓存失效策略

**何时失效**：
```javascript
function shouldInvalidateCache(oldKey, newKey) {
  if (oldKey !== newKey) {
    return true;  // 任何输入变化都失效
  }
  
  // 检查输出是否存在
  const cacheDir = `.turbo/cache/${oldKey}`;
  if (!fs.existsSync(cacheDir)) {
    return true;
  }
  
  // 检查输出完整性
  const manifest = readManifest(cacheDir);
  for (const output of manifest.outputs) {
    if (!fs.existsSync(output)) {
      return true;  // 输出被删除
    }
  }
  
  return false;
}
```

---

## 远程缓存共享

### 架构设计

**客户端 - 服务器架构**：
```
开发者 A → 构建 → 上传缓存 → 远程服务器
                                    ↓
开发者 B → 构建 → 下载缓存 ← 远程服务器
```

**API 接口**：
```
PUT /cache/:hash
  上传缓存 tarball

GET /cache/:hash
  下载缓存 tarball

HEAD /cache/:hash
  检查缓存是否存在
```

### Turborepo Remote Cache

**配置**：
```bash
# 登录 Vercel
npx turbo login

# 链接项目
npx turbo link
```

**工作流程**：
```javascript
async function runWithRemoteCache(task) {
  const hash = generateCacheKey(task);
  
  // 1. 检查本地缓存
  if (await restoreFromCache(hash, task.outputs)) {
    return;
  }
  
  // 2. 检查远程缓存
  const remoteExists = await fetch(`${REMOTE_API}/cache/${hash}`, {
    method: 'HEAD',
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  
  if (remoteExists.ok) {
    // 下载并恢复
    const tarball = await fetch(`${REMOTE_API}/cache/${hash}`);
    await extractCache(tarball, hash);
    await restoreFromCache(hash, task.outputs);
    return;
  }
  
  // 3. 执行任务
  await executeTask(task);
  
  // 4. 保存到本地缓存
  await saveToCache(hash, task.outputs);
  
  // 5. 上传到远程缓存
  const tarball = await createTarball(hash);
  await fetch(`${REMOTE_API}/cache/${hash}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: tarball
  });
}
```

### Nx Cloud

**配置**（nx.json）：
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "accessToken": "YOUR_TOKEN"
      }
    }
  }
}
```

**分布式执行**：
```bash
# 分布式任务执行（Nx Cloud DTE）
nx affected --target=test --parallel=10

# Nx Cloud 自动分发到多个 agent
# Agent 1: packages/a, packages/b
# Agent 2: packages/c, packages/d
# ...
```

---

## 并行构建策略

### 并发控制

**p-limit 模式**：
```javascript
const pLimit = require('p-limit');

async function buildPackages(packages, concurrency = 4) {
  const limit = pLimit(concurrency);
  
  const tasks = packages.map(pkg => 
    limit(() => build(pkg))
  );
  
  await Promise.all(tasks);
}
```

**动态调整并发数**：
```javascript
function getOptimalConcurrency() {
  const cpus = os.cpus().length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  // 基于 CPU 核心数
  let concurrency = cpus;
  
  // 内存限制
  if (freeMem < totalMem * 0.3) {
    concurrency = Math.max(1, Math.floor(cpus / 2));
  }
  
  // CI 环境调整
  if (process.env.CI) {
    concurrency = Math.min(concurrency, 4);
  }
  
  return concurrency;
}
```

### 任务调度

**优先级队列**：
```javascript
class TaskScheduler {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = new Set();
    this.queue = new PriorityQueue();
  }
  
  async schedule(task, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.enqueue({ task, priority, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    while (this.running.size < this.concurrency && this.queue.size() > 0) {
      const { task, resolve, reject } = this.queue.dequeue();
      
      const promise = this.execute(task)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running.delete(promise);
          this.process();
        });
      
      this.running.add(promise);
    }
  }
  
  async execute(task) {
    console.log(`Starting ${task.name}`);
    const start = Date.now();
    
    await task.run();
    
    const duration = Date.now() - start;
    console.log(`Finished ${task.name} in ${duration}ms`);
  }
}
```

**使用示例**：
```javascript
const scheduler = new TaskScheduler(4);

// 高优先级：核心包
await scheduler.schedule(buildCore, 10);

// 普通优先级：应用包
await scheduler.schedule(buildApp, 5);

// 低优先级：文档
await scheduler.schedule(buildDocs, 1);
```

---

## 常见误区

### 误区 1：并行数越多越快

**错误**：
```javascript
// 100 个包，100 并发
await Promise.all(packages.map(build));
```

**问题**：
- CPU 过载
- 内存耗尽
- 磁盘 I/O 瓶颈

**正确**：
```javascript
// 根据系统资源限制并发
const concurrency = Math.min(packages.length, os.cpus().length);
await buildWithConcurrency(packages, concurrency);
```

### 误区 2：缓存永远有效

**问题**：环境变化导致缓存失效

**示例**：
```javascript
// Node.js 16 构建的缓存
// Node.js 18 使用（可能不兼容）

// 解决：包含运行时版本
const cacheKey = hash({
  source: sourceHash,
  nodeVersion: process.version  // 加入版本
});
```

### 误区 3：忽略依赖顺序

**错误**：
```javascript
// 忽略依赖关系，直接并行
await Promise.all([
  build('app'),    // 依赖 core
  build('core')    // app 可能先完成，但缺少 core
]);
```

**正确**：
```javascript
// 使用拓扑排序
const order = topologicalSort(dependencyGraph);
for (const level of buildLevels(order)) {
  await Promise.all(level.map(build));
}
```

---

## 工程实践

### 场景 1：Turborepo 配置

**turbo.json**：
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
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
    }
  },
  "globalDependencies": [
    ".env",
    "tsconfig.json"
  ]
}
```

**执行**：
```bash
# 构建所有包
turbo run build

# 输出：
# • Packages in scope: 10
# • Running build in 10 packages
# • Remote caching enabled
# 
# utils:build: cache hit, replaying output
# core:build: cache miss, executing
# ui:build: cache hit, replaying output
# app:build: cache miss, executing
```

### 场景 2：Nx 缓存配置

**nx.json**：
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "cacheDirectory": "tmp/nx-cache"
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "production",
        "^production"
      ],
      "outputs": ["{projectRoot}/dist"]
    }
  }
}
```

**受影响包检测**：
```bash
# 只构建变更的包
nx affected --target=build --base=origin/main

# 输出：
# >  NX   Running target build for 3 projects:
# 
#   - core
#   - ui
#   - app
# 
# With additional flags:
#   --base=origin/main
```

### 场景 3：自定义缓存策略

**实现缓存包装器**：
```javascript
// build-with-cache.js
const crypto = require('crypto');
const fs = require('fs-extra');
const glob = require('glob');

async function buildWithCache(packageName, buildFn) {
  // 计算缓存键
  const files = glob.sync(`packages/${packageName}/src/**/*`);
  const hashes = files.map(f => hashFile(f));
  const cacheKey = crypto.createHash('sha256')
    .update(hashes.join(''))
    .digest('hex');
  
  const cacheDir = `.cache/${cacheKey}`;
  
  // 检查缓存
  if (fs.existsSync(cacheDir)) {
    console.log(`[${packageName}] cache hit`);
    await fs.copy(cacheDir, `packages/${packageName}/dist`);
    return;
  }
  
  // 执行构建
  console.log(`[${packageName}] building...`);
  await buildFn();
  
  // 保存缓存
  await fs.copy(`packages/${packageName}/dist`, cacheDir);
}
```

**使用**：
```javascript
await buildWithCache('core', async () => {
  execSync('tsc', { cwd: 'packages/core' });
});
```

---

## 深入一点

### 任务调度的复杂度

**拓扑排序**：
```
时间复杂度：O(V + E)
V = 包数量
E = 依赖关系数量

示例：
10 个包，平均 2 个依赖
O(10 + 20) = O(30)
```

**并行执行优化**：
```
串行：O(n × t)，n 个任务，每个耗时 t
并行：O((n / c) × t)，c 为并发数

示例：
10 个任务，每个 10s，4 并发
串行：10 × 10s = 100s
并行：(10 / 4) × 10s = 25s
加速比：4倍
```

### 缓存的存储成本

**本地缓存**：
```bash
# 计算缓存大小
du -sh .turbo/cache
# 5 GB

# 清理旧缓存（保留最近 30 天）
find .turbo/cache -mtime +30 -delete
```

**远程缓存**：
```
假设：
- 100 个任务
- 平均缓存大小：50 MB
- 总存储：5 GB

AWS S3 成本：
- 存储：$0.023/GB/月 × 5 GB = $0.115/月
- 传输：$0.09/GB × 5 GB × 30 次 = $13.5/月
总计：约 $14/月
```

### 增量构建的收益分析

**场景**：修改 1 个包

**无增量构建**：
```
构建所有 10 个包：100s
```

**有增量构建**：
```
构建 1 个包 + 2 个依赖者：30s
节省：70%
```

**ROI**：
```
开发者时间成本：$50/小时
每天节省：10 次构建 × 70s = 700s ≈ 12 分钟
每月节省：12 分钟 × 20 天 = 240 分钟 = 4 小时
成本节省：$200/月/开发者

工具成本（Nx Cloud/Turbo）：$20/月
净收益：$180/月/开发者
```

---

## 参考资料

- [Turborepo 文档](https://turbo.build/repo/docs)
- [Nx 缓存](https://nx.dev/concepts/how-caching-works)
- [拓扑排序算法](https://en.wikipedia.org/wiki/Topological_sorting)
- [任务并行模式](https://refactoring.guru/design-patterns/command)
