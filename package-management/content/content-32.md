# Monorepo 工具链对比

## Lerna 的演进与局限

### Lerna 的历史

**诞生背景**（2016）：
- Babel 项目需要管理多个包
- 缺乏 Monorepo 工具
- Lerna 应运而生

**核心功能**：
```bash
# 初始化
lerna init

# 安装依赖
lerna bootstrap

# 运行脚本
lerna run build

# 发布
lerna publish
```

### 演进历程

**v2（2017）**：
- 基础 Monorepo 管理
- 版本管理（fixed/independent）
- 发布流程

**v3（2018）**：
- 集成 Yarn Workspaces
- 性能优化
- 选择性发布

**v4-6（2019-2022）**：
- 维护停滞
- 社区接管
- 功能停滞

**v7（2023）**：
- Nx 团队接手
- 集成 Nx 缓存
- 现代化改造

### Lerna 的局限

**性能问题**：
```bash
# 传统 Lerna
lerna run build
# 串行执行，10 个包 × 10s = 100s

# 即使并行
lerna run build --concurrency 4
# 仍然慢于现代工具
```

**缓存缺失**：
```bash
# 无变更时仍重新构建
lerna run build
# 每次都执行，无缓存
```

**依赖图分析弱**：
```bash
# 无法智能检测受影响的包
# 需要手动指定
lerna run test --scope=package-a
```

---

## Nx 的智能缓存

### Nx 架构

**核心概念**：
- **项目图（Project Graph）**：自动分析依赖关系
- **任务图（Task Graph）**：基于依赖图生成执行顺序
- **计算缓存（Computation Caching）**：缓存任务结果

**初始化**：
```bash
npx create-nx-workspace my-org --preset=npm
```

### 智能缓存机制

**缓存键计算**：
```javascript
function calculateCacheKey(task) {
  return hash({
    command: task.command,              // "build"
    inputs: hashFiles(task.inputs),     // 源代码 hash
    dependencies: task.deps.map(d => d.outputs),  // 依赖的输出
    runtime: process.version            // Node.js 版本
  });
}
```

**示例**：
```bash
# 第一次运行
nx run build

# packages/utils: 编译 TypeScript (3s)
# packages/core: 编译 TypeScript (5s)
# packages/app: 打包 (10s)
# Total: 18s

# 再次运行（无变更）
nx run build

# packages/utils: [existing outputs match the cache, left as is]
# packages/core: [existing outputs match the cache, left as is]
# packages/app: [existing outputs match the cache, left as is]
# Total: 0.5s (命中缓存)
```

### 受影响包检测

**nx affected**：
```bash
# 检测受影响的项目
nx affected:apps

# 输出：
# apps/web (changed)
# apps/admin (depends on changed library)

# 只构建受影响的项目
nx affected --target=build

# 只测试受影响的项目
nx affected --target=test --base=origin/main
```

**工作原理**：
```javascript
function getAffectedProjects(base, head) {
  // 1. Git diff 获取变更文件
  const changedFiles = execSync(`git diff ${base}...${head} --name-only`);
  
  // 2. 映射文件到项目
  const changedProjects = mapFilesToProjects(changedFiles);
  
  // 3. 遍历项目图，找到所有依赖者
  const affected = new Set(changedProjects);
  
  for (const project of changedProjects) {
    const dependents = projectGraph.getDependents(project);
    dependents.forEach(dep => affected.add(dep));
  }
  
  return Array.from(affected);
}
```

### 远程缓存

**配置**（nx.json）：
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "accessToken": "YOUR_NX_CLOUD_TOKEN"
      }
    }
  }
}
```

**效果**：
```bash
# 开发者 A 构建
nx run build
# 上传缓存到 Nx Cloud

# 开发者 B 拉取同一 commit
nx run build
# [remote cache] packages/core: 5s (从云端下载)
# Total: 5s (vs 18s 本地构建)
```

---

## Turborepo 的增量构建

### 核心特性

**1. 基于内容的哈希**：
```javascript
// Turborepo 计算任务 hash
{
  "task": "build",
  "inputs": {
    "files": ["src/**/*.ts", "package.json"],
    "hash": "abc123..."
  },
  "env": ["NODE_ENV"],
  "outputs": ["dist/**"]
}
```

**2. 管道配置**：
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // ^ 表示依赖的包
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**3. 并行执行**：
```bash
turbo run build

# 执行顺序（基于依赖图）：
# Level 1: utils, config (并行)
# Level 2: core (等待 utils)
# Level 3: ui, api (并行，等待 core)
# Level 4: app (等待 ui, api)
```

### 增量构建原理

**哈希计算**：
```javascript
function computeHash(task) {
  const inputs = [];
  
  // 1. 输入文件内容
  for (const pattern of task.inputs) {
    const files = glob(pattern);
    inputs.push(...files.map(f => hashFile(f)));
  }
  
  // 2. 依赖的输出
  for (const dep of task.dependencies) {
    inputs.push(dep.outputHash);
  }
  
  // 3. 环境变量
  for (const env of task.env) {
    inputs.push(process.env[env]);
  }
  
  return crypto.createHash('sha256').update(inputs.join()).digest('hex');
}
```

**缓存查找**：
```javascript
async function runTask(task) {
  const hash = computeHash(task);
  const cacheDir = `.turbo/cache/${hash}`;
  
  if (fs.existsSync(cacheDir)) {
    // 缓存命中
    console.log(`cache hit, replaying output`);
    restoreFromCache(cacheDir, task.outputs);
    return;
  }
  
  // 缓存未命中，执行任务
  await executeTask(task);
  
  // 保存到缓存
  saveToCache(cacheDir, task.outputs);
}
```

### 远程缓存（Vercel）

**配置**：
```bash
# 登录 Vercel
npx turbo login

# 链接项目
npx turbo link
```

**turbo.json**：
```json
{
  "remoteCache": {
    "enabled": true
  }
}
```

**效果**：
```bash
# CI 构建
turbo run build
# → 上传到 Vercel

# 本地开发
turbo run build
# → cache hit, replaying output from Vercel
# Total: 2s (vs 60s)
```

---

## Rush 的企业级特性

### 架构设计

**严格的包管理**：
```json
// rush.json
{
  "pnpmVersion": "8.0.0",
  "rushVersion": "5.100.0",
  "projects": [
    {
      "packageName": "@my-org/core",
      "projectFolder": "packages/core",
      "reviewCategory": "production"
    }
  ]
}
```

**策略执行**：
```bash
# 严格的版本策略
rush check

# 检查：
# - lockfile 一致性
# - 依赖版本统一
# - CHANGELOG 完整性
# - 代码审查要求
```

### 审批工作流

**变更文件（Change Files）**：
```bash
# 创建变更文件
rush change

# 交互式：
# ? Select type of change: patch/minor/major
# ? Describe the changes: Fixed memory leak
```

**生成文件**：
```json
// common/changes/@my-org/core/fix-memory-leak.json
{
  "changes": [
    {
      "packageName": "@my-org/core",
      "comment": "Fixed memory leak",
      "type": "patch"
    }
  ],
  "packageName": "@my-org/core",
  "email": "developer@company.com"
}
```

**发布流程**：
```bash
# 1. 合并变更文件到 CHANGELOG
rush version --bump

# 2. 代码审查
# PR review required

# 3. 发布
rush publish --include-all
```

### 企业级功能

**子空间（Subspaces）**：
```json
// rush.json
{
  "projects": [
    {
      "packageName": "@backend/api",
      "projectFolder": "backend/api",
      "subspaceName": "backend"
    },
    {
      "packageName": "@frontend/app",
      "projectFolder": "frontend/app",
      "subspaceName": "frontend"
    }
  ]
}
```

**分离构建**：
```bash
# 只构建后端子空间
rush build --to-subspace backend

# 只构建前端子空间
rush build --to-subspace frontend
```

**增量发布**：
```bash
# 只发布变更的包
rush publish --include-all --version-policy

# 自动计算版本号
# 自动生成 CHANGELOG
# 自动推送 Git 标签
```

---

## 工具对比

### 功能对比

| 特性 | Lerna | Nx | Turborepo | Rush |
|------|-------|----|-----------| -----|
| 依赖管理 | ✅ | ✅ | ✅ | ✅ |
| 任务编排 | 基础 | 强大 | 强大 | 强大 |
| 本地缓存 | ❌ | ✅ | ✅ | ✅ |
| 远程缓存 | ❌ | ✅ | ✅ | ✅ |
| 受影响包检测 | 基础 | 智能 | 智能 | 智能 |
| 增量构建 | ❌ | ✅ | ✅ | ✅ |
| 代码生成 | ❌ | ✅ | ❌ | ❌ |
| 企业治理 | ❌ | ❌ | ❌ | ✅ |
| 学习曲线 | 低 | 中 | 低 | 高 |
| 适用规模 | 小中 | 中大 | 小中大 | 大型企业 |

### 性能对比

**测试项目**：10 个包，200 个依赖

**冷启动（首次构建）**：
```
Lerna:      120s
Nx:         80s
Turborepo:  75s
Rush:       85s
```

**热启动（缓存命中）**：
```
Lerna:      120s (无缓存)
Nx:         2s
Turborepo:  1s
Rush:       3s
```

**受影响包检测**：
```
Lerna:      手动指定
Nx:         自动 (5s)
Turborepo:  自动 (3s)
Rush:       自动 (4s)
```

### 选择建议

**小型项目（< 10 个包）**：
```
推荐：Lerna / Turborepo
理由：简单、易上手
```

**中型项目（10-50 个包）**：
```
推荐：Nx / Turborepo
理由：性能优秀、功能完善
```

**大型项目（> 50 个包）**：
```
推荐：Nx / Turborepo / Rush
理由：
- Nx: 功能最全面
- Turborepo: 最简单
- Rush: 企业治理最强
```

**企业级项目**：
```
推荐：Rush / Nx
理由：审批流程、权限控制
```

---

## 工程实践

### 场景 1：从 Lerna 迁移到 Turborepo

**步骤**：
```bash
# 1. 安装 Turborepo
npm install -D turbo

# 2. 创建 turbo.json
cat > turbo.json << 'EOF'
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
EOF

# 3. 更新 package.json
# "build": "lerna run build"
# 改为
# "build": "turbo run build"

# 4. 测试
turbo run build

# 5. 移除 Lerna（可选）
npm uninstall lerna
```

### 场景 2：Nx Cloud 配置

**步骤**：
```bash
# 1. 创建 Nx Cloud 账户
npx nx connect-to-nx-cloud

# 2. 配置缓存
# nx.json 自动更新

# 3. CI 配置
# .github/workflows/ci.yml
- name: Run affected
  env:
    NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_TOKEN }}
  run: |
    npx nx affected --target=build --base=origin/main
    npx nx affected --target=test --base=origin/main
```

### 场景 3：Rush 企业部署

**目录结构**：
```
my-rush-repo/
├── common/
│   ├── config/
│   │   └── rush/
│   │       ├── command-line.json
│   │       └── version-policies.json
│   └── changes/
├── backend/
│   └── api/
├── frontend/
│   └── app/
└── rush.json
```

**版本策略**（version-policies.json）：
```json
[
  {
    "policyName": "backend",
    "definitionName": "lockStepVersion",
    "version": "1.0.0",
    "mainProject": "@backend/api"
  },
  {
    "policyName": "frontend",
    "definitionName": "individualVersion"
  }
]
```

---

## 深入一点

### 缓存的数学模型

**缓存命中率**：
```
假设：
- N 个任务
- 每个任务独立变更概率 p

缓存命中率 = (1 - p)^N

示例：
N = 10, p = 0.1（10% 变更率）
命中率 = 0.9^10 ≈ 35%

实际：有依赖关系，命中率更高
```

**缓存收益**：
```
时间节省 = (1 - 缓存命中率) × 构建时间

示例：
构建时间 = 100s
命中率 = 90%
节省 = 0.9 × 100s = 90s
```

### 增量构建的算法

**Topological Sort（拓扑排序）**：
```javascript
function topologicalSort(graph) {
  const inDegree = new Map();
  const queue = [];
  const result = [];
  
  // 计算入度
  for (const node of graph.nodes) {
    inDegree.set(node, graph.getDependencies(node).length);
    if (inDegree.get(node) === 0) {
      queue.push(node);
    }
  }
  
  // BFS
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    
    for (const dependent of graph.getDependents(node)) {
      inDegree.set(dependent, inDegree.get(dependent) - 1);
      if (inDegree.get(dependent) === 0) {
        queue.push(dependent);
      }
    }
  }
  
  return result;
}
```

### 不同工具的缓存策略

**Nx**：
```
缓存键 = hash(源代码 + 依赖输出 + 环境变量 + 配置文件)
存储位置：.nx/cache/
远程缓存：Nx Cloud
```

**Turborepo**：
```
缓存键 = hash(inputs + dependencies + env)
存储位置：.turbo/cache/
远程缓存：Vercel
```

**Rush**：
```
缓存键 = hash(source + dependencies)
存储位置：common/temp/build-cache/
远程缓存：Azure Blob / S3
```

---

## 参考资料

- [Lerna 官方文档](https://lerna.js.org/)
- [Nx 文档](https://nx.dev/)
- [Turborepo 文档](https://turbo.build/)
- [Rush 文档](https://rushjs.io/)
- [Monorepo 工具对比](https://monorepo.tools/)
