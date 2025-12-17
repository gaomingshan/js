# 第 14 章：npm 性能优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 缓存机制

### 题目

npm 的缓存目录默认在哪里？

**选项：**
- A. node_modules/.cache
- B. ~/.npm
- C. /tmp/npm-cache
- D. 项目根目录

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm 缓存位置**

```bash
# 查看缓存目录
npm config get cache

# macOS/Linux
~/.npm

# Windows
%APPDATA%\npm-cache
```

#### 缓存结构

```
~/.npm/
├── _cacache/
│   ├── content-v2/    # 包内容（按哈希存储）
│   ├── index-v5/      # 索引
│   └── tmp/           # 临时文件
├── _logs/             # 日志
└── anonymous-cli-metrics.json
```

#### 缓存工作流程

```bash
npm install lodash

# 1. 生成 cache key
#    name + version + integrity

# 2. 查询缓存
#    ~/.npm/_cacache/index-v5/

# 3. 命中缓存
#    → 从 content-v2/ 提取
#    → 解压到 node_modules/

# 4. 未命中
#    → 下载
#    → 存入缓存
#    → 解压到 node_modules/
```

#### 缓存管理

```bash
# 验证缓存完整性
npm cache verify

# 清空缓存
npm cache clean --force

# 查看缓存大小
du -sh ~/.npm
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 离线安装

### 题目

npm 支持完全离线安装依赖。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm 离线模式**

#### 使用缓存

```bash
npm install --offline

# 只使用本地缓存
# 如果缓存未命中 → 报错
```

#### 前提条件

```bash
# 1. 先联网安装一次（填充缓存）
npm install

# 2. 之后可以离线安装
npm install --offline  # ✅ 成功
```

#### prefer-offline 模式

```bash
npm install --prefer-offline

# 优先使用缓存
# 缓存未命中 → 联网下载
```

**更实用的选择**

#### 配置

```bash
# 设置为默认
npm config set prefer-offline true

# 或在 .npmrc
prefer-offline=true
```

#### 应用场景

**飞机上开发：**
```bash
npm install --offline
# 使用缓存，不需要网络
```

**CI 优化：**
```bash
# 缓存 ~/.npm
npm ci --prefer-offline
# 加速安装
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 并行安装

### 题目

npm 默认并行安装多少个包？

**选项：**
- A. 1（串行）
- B. 4
- C. 取决于 CPU 核心数
- D. 无限制

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm 并行安装**

#### 默认行为

```bash
# npm 自动检测 CPU 核心数
# 并行安装数 = CPU 核心数

# 4 核 CPU → 4 个并行
# 8 核 CPU → 8 个并行
```

#### 自定义并行数

```bash
# 设置最大并行数
npm config set maxsockets 10

# 或环境变量
npm_config_maxsockets=10 npm install
```

#### 性能影响

```bash
# 单线程安装
maxsockets=1
# 安装时间：60s

# 4 线程安装
maxsockets=4
# 安装时间：20s ⚡

# 16 线程安装
maxsockets=16
# 安装时间：15s（收益递减）
```

**并非越多越好：**
- 网络带宽限制
- 磁盘 I/O 瓶颈
- Registry 限流

#### 推荐配置

```ini
# .npmrc
maxsockets=10  # 适中的值
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 安装优化

### 题目

以下哪些方法可以加速 npm install？

**选项：**
- A. 使用 npm ci
- B. 使用镜像源
- C. 启用缓存
- D. 使用 --prefer-offline

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**npm 安装加速技巧**

#### A. 使用 npm ci ✅

```bash
# npm install
# 增量安装，较慢

# npm ci
npm ci
# 删除 node_modules 重装
# 跳过某些检查
# 通常更快 30-50%
```

#### B. 使用镜像源 ✅

```bash
# 官方源（国外慢）
npm install  # 60s

# 淘宝镜像
npm install --registry https://registry.npmmirror.com
# 15s ⚡⚡⚡⚡
```

**.npmrc：**
```ini
registry=https://registry.npmmirror.com
```

#### C. 启用缓存 ✅

```bash
# 首次安装
npm install  # 45s

# 二次安装（有缓存）
npm install  # 10s ⚡⚡⚡
```

**CI 中缓存：**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ hashFiles('**/package-lock.json') }}
```

#### D. prefer-offline ✅

```bash
npm install --prefer-offline

# 优先使用缓存
# 减少网络请求
```

#### 综合优化

```bash
# 最快组合
npm ci \
  --prefer-offline \
  --registry https://registry.npmmirror.com
```

**.npmrc（最优配置）：**
```ini
registry=https://registry.npmmirror.com
prefer-offline=true
maxsockets=10
fetch-retries=3
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
```

#### 性能对比

| 方法 | 首次安装 | 二次安装 | 提升 |
|------|---------|---------|------|
| **默认** | 60s | 45s | - |
| **+ 镜像** | 15s | 12s | ⚡⚡⚡⚡ |
| **+ 缓存** | 15s | 5s | ⚡⚡⚡⚡⚡ |
| **+ npm ci** | 12s | 4s | ⚡⚡⚡⚡⚡ |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** package-lock性能

### 题目

为什么 package-lock.json 能提升安装速度？

**选项：**
- A. 压缩了依赖信息
- B. 跳过了版本解析过程
- C. 缓存了下载链接
- D. 减少了网络请求

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**package-lock.json 性能优势**

#### 无 lock 文件

```bash
npm install

# 1. 读取 package.json
#    "lodash": "^4.17.0"

# 2. 查询 registry
#    GET /lodash

# 3. 解析版本范围
#    ^4.17.0 → 4.17.21（最新）

# 4. 递归解析依赖
#    每个包重复上述步骤

# 5. 解决冲突
#    计算依赖树

# 总时间：45s
```

#### 有 lock 文件

```bash
npm install

# 1. 读取 package-lock.json
#    已有精确版本和 resolved URL

# 2. 直接下载
#    无需版本解析
#    无需递归查询

# 3. 验证 integrity
#    SHA-512 校验

# 总时间：15s ⚡⚡⚡
```

**跳过了耗时的版本解析！**

#### lock 文件内容

```json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.21",  // 精确版本
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",  // 直接下载链接
      "integrity": "sha512-v2kDEe...",  // 完整性校验
      "dependencies": {}  // 已解析的依赖树
    }
  }
}
```

**所有信息都已计算好**

#### 性能对比

```bash
# 无 lock
npm install
# - 版本解析：20s
# - 下载：15s
# - 安装：10s
# 总计：45s

# 有 lock
npm install
# - 版本解析：0s ⚡
# - 下载：10s（缓存）
# - 安装：5s
# 总计：15s
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** node_modules优化

### 题目

如何减小 node_modules 体积？

**选项：**
- A. 使用 npm dedupe
- B. 使用 pnpm
- C. 删除 devDependencies
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**node_modules 瘦身方法**

#### A. npm dedupe ✅

```bash
# 去重前
node_modules/
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.21
└── lodash@4.17.21

# 去重
npm dedupe

# 去重后
node_modules/
├── pkg-a/  # 移除嵌套
└── lodash@4.17.21  # 共享

# 体积减少 20-30%
```

#### B. 使用 pnpm ✅

```bash
# npm
node_modules/  # 500MB

# pnpm
node_modules/  # 200MB ⚡⚡
.pnpm/         # 硬链接存储
```

**节省 40-60% 空间**

#### C. 删除 devDependencies ✅

```bash
# 开发安装
npm install
# node_modules: 500MB

# 生产安装
npm ci --production
# node_modules: 200MB ⚡⚡

# 体积减少 60%
```

#### 其他优化

**1. prune 清理：**
```bash
npm prune --production
# 删除 devDependencies
```

**2. 分析工具：**
```bash
npx cost-of-modules

# 输出：
┌─────────────────┬──────────┬──────────┐
│ name            │ size     │ children │
├─────────────────┼──────────┼──────────┤
│ webpack         │ 12.5 MB  │ 542      │
│ @babel/core     │ 8.3 MB   │ 234      │
│ typescript      │ 5.2 MB   │ 0        │
└─────────────────┴──────────┴──────────┘
```

**3. 使用轻量级替代：**
```json
{
  "dependencies": {
    "dayjs": "^1.11.0"      // 2KB
    // "moment": "^2.29.0"  // 232KB ❌
  }
}
```

#### 完整优化方案

```bash
# 1. 切换到 pnpm
npm install -g pnpm
pnpm import  # 从 package-lock.json 导入
pnpm install

# 2. 去重
pnpm dedupe

# 3. 生产构建
pnpm install --prod

# 4. 清理
pnpm prune --prod

# 最终：100MB ⚡⚡⚡⚡
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** CI缓存

### 题目

GitHub Actions 中如何缓存 npm 依赖？

<details>
<summary>查看答案</summary>

### ✅ 答案

```yaml
name: CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'  # ✅ 自动缓存
      
      - run: npm ci
```

### 📖 解析

**CI 缓存策略**

#### 方法 1：setup-node 内置缓存（推荐）

```yaml
- uses: actions/setup-node@v3
  with:
    cache: 'npm'  # 或 'yarn', 'pnpm'
```

**自动缓存 `~/.npm`**

#### 方法 2：手动缓存

```yaml
- name: Cache npm
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**缓存键基于 lock 文件哈希**

#### 方法 3：缓存 node_modules（不推荐）

```yaml
- uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ hashFiles('package-lock.json') }}

- run: npm install  # ❌ 可能导致问题
```

**问题：**
- 不同 OS 不兼容
- 可能有脏数据

#### 性能对比

```yaml
# 无缓存
npm ci  # 2m 30s

# 有缓存（首次）
npm ci  # 2m 30s（填充缓存）

# 有缓存（命中）
npm ci  # 30s ⚡⚡⚡⚡⚡
```

**加速 80%！**

#### 完整示例

```yaml
name: Optimized CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # 1. 设置 Node.js + 缓存
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      # 2. 快速安装
      - run: npm ci --prefer-offline
      
      # 3. 运行任务
      - run: npm test
      - run: npm run build
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** Monorepo性能

### 题目

在 Monorepo 中如何优化依赖安装性能？

**选项：**
- A. 使用 npm workspaces
- B. 使用 pnpm workspaces
- C. 使用 Lerna + Yarn
- D. B 性能最好

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Monorepo 包管理器性能对比**

#### npm workspaces

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

```bash
npm install
# 时间：120s
# 磁盘：800MB
```

**特点：**
- 扁平化依赖
- 重复依赖较多

#### Yarn workspaces

```bash
yarn install
# 时间：60s ⚡⚡
# 磁盘：600MB
```

**特点：**
- 并行安装
- 更好的缓存

#### pnpm workspaces ✅ 最快

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```bash
pnpm install
# 时间：20s ⚡⚡⚡⚡⚡
# 磁盘：200MB ⚡⚡⚡⚡⚡
```

**优势：**
- 硬链接共享
- 内容寻址存储
- 严格的依赖管理

#### 性能对比

| 工具 | 首次安装 | 二次安装 | 磁盘占用 | 推荐度 |
|------|---------|---------|---------|--------|
| **npm** | 120s | 60s | 800MB | ⭐⭐⭐ |
| **Yarn** | 60s | 30s | 600MB | ⭐⭐⭐⭐ |
| **pnpm** | 20s | 5s | 200MB | ⭐⭐⭐⭐⭐ |

#### pnpm 原理

```
全局存储（~/.pnpm-store）
├── lodash@4.17.21/
└── react@18.2.0/

项目 A（node_modules）
├── .pnpm/
│   └── lodash@4.17.21/ → 硬链接到全局
└── lodash → 符号链接到 .pnpm/

项目 B（node_modules）
└── lodash → 硬链接到相同文件

# 磁盘只有一份！
```

#### 迁移到 pnpm

```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 导入 lock 文件
pnpm import

# 3. 创建 workspace 配置
cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
EOF

# 4. 安装
pnpm install

# 5. 对比
du -sh node_modules
# Before: 800M
# After:  200M ⚡
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** Docker优化

### 题目

如何优化 Docker 镜像中的 npm 安装？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Docker 多阶段构建 + 缓存优化**

```dockerfile
# ===== 基础镜像 =====
FROM node:18-alpine AS base
RUN npm install -g pnpm

# ===== 依赖阶段 =====
FROM base AS deps

WORKDIR /app

# 只复制依赖文件（利用缓存层）
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# ===== 构建阶段 =====
FROM base AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建
RUN pnpm run build

# ===== 生产镜像 =====
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

# 只复制必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

CMD ["node", "dist/server.js"]
```

### 📖 解析

**优化技巧详解**

#### 1. 缓存层优化

**❌ 差的写法：**
```dockerfile
COPY . .
RUN npm install
```

**问题：** 代码改变 → 重新安装所有依赖

**✅ 好的写法：**
```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```

**优势：** package.json 不变 → 使用缓存层

#### 2. 使用 npm ci

```dockerfile
RUN npm ci --only=production

# 比 npm install 快
# 严格按 lock 文件
```

#### 3. 多阶段构建

```dockerfile
# 构建阶段（大）
FROM node:18 AS builder
# 包含 devDependencies
# 包含源码

# 运行阶段（小）
FROM node:18-alpine
# 只有生产依赖
# 只有构建产物

# 最终镜像减小 70%
```

#### 4. .dockerignore

```.dockerignore
node_modules
npm-debug.log
.git
.env
*.md
test/
.cache
dist  # 构建产物
```

**减少构建上下文**

#### 5. 使用 pnpm

```dockerfile
# npm
FROM node:18
RUN npm ci --only=production
# 镜像大小：500MB

# pnpm
FROM node:18
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile
# 镜像大小：200MB ⚡⚡
```

#### 完整优化对比

| 优化 | 构建时间 | 镜像大小 |
|------|---------|---------|
| **基础** | 5m | 1.2GB |
| **+ 缓存层** | 2m | 1.2GB |
| **+ npm ci** | 1.5m | 1.2GB |
| **+ 多阶段** | 1.5m | 400MB |
| **+ pnpm** | 1m | 150MB |
| **+ alpine** | 45s | 80MB |

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 性能监控

### 题目

如何监控和分析 npm 安装性能？

<details>
<summary>查看答案</summary>

### ✅ 答案

**性能分析工具集**

#### 1. npm timing

```bash
npm install --timing

# 生成 npm-timing.json
cat npm-timing.json
```

```json
{
  "install": {
    "start": 1234567890,
    "end": 1234567920,
    "duration": 30000
  },
  "packages": {
    "lodash": {
      "download": 500,
      "extract": 200,
      "build": 0
    }
  }
}
```

#### 2. npm explain

```bash
# 为什么安装了某个包？
npm explain webpack

# 输出：
webpack@5.88.0
  devDependency
  
  webpack-dev-server@4.15.0
    dependency webpack@"^5.0.0"
```

**分析依赖路径**

#### 3. 自定义监控脚本

```javascript
// scripts/monitor-install.js
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

const phases = [
  'npm cache verify',
  'npm ci --prefer-offline'
];

const results = {};

for (const phase of phases) {
  console.log(`Running: ${phase}`);
  
  const start = performance.now();
  
  try {
    execSync(phase, {
      stdio: 'inherit',
      env: { ...process.env, TIMING: '1' }
    });
  } catch (error) {
    console.error(`Failed: ${phase}`);
  }
  
  const duration = performance.now() - start;
  results[phase] = {
    duration: Math.round(duration),
    success: true
  };
}

// 生成报告
console.log('\n=== Performance Report ===');
console.table(results);

// 保存到文件
const fs = require('fs');
fs.writeFileSync(
  'performance-report.json',
  JSON.stringify(results, null, 2)
);
```

**使用：**
```bash
node scripts/monitor-install.js
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
        with:
          node-version: 18
          cache: 'npm'
      
      # 记录开始时间
      - name: Start Timer
        run: echo "START_TIME=$(date +%s)" >> $GITHUB_ENV
      
      # 安装
      - name: Install Dependencies
        run: npm ci
      
      # 计算耗时
      - name: Calculate Duration
        run: |
          END_TIME=$(date +%s)
          DURATION=$((END_TIME - START_TIME))
          echo "DURATION=${DURATION}s" >> $GITHUB_ENV
      
      # 发送到监控系统
      - name: Send Metrics
        run: |
          curl -X POST https://metrics.company.com/npm-install \
            -H "Content-Type: application/json" \
            -d '{
              "duration": ${{ env.DURATION }},
              "commit": "${{ github.sha }}",
              "branch": "${{ github.ref }}"
            }'
      
      # 生成趋势图
      - name: Update Dashboard
        run: |
          node scripts/update-perf-dashboard.js \
            --duration ${{ env.DURATION }}
```

#### 5. 分析工具集成

```json
{
  "scripts": {
    "analyze:size": "npx cost-of-modules --no-install",
    "analyze:deps": "npx depcheck",
    "analyze:duplicate": "npx npm-check-duplicates",
    "analyze:speed": "npm install --timing && cat npm-timing.json",
    "analyze:all": "npm-run-all analyze:*"
  }
}
```

**完整分析：**
```bash
npm run analyze:all

# 输出：
# 1. 包大小排行
# 2. 未使用的依赖
# 3. 重复的依赖
# 4. 安装耗时分析
```

### 📖 解析

**性能优化循环**

```
测量 → 分析 → 优化 → 验证 → 重复
  ↓
监控指标：
- 安装时间
- 磁盘占用
- 缓存命中率
- 网络请求数
  ↓
设定目标：
- 安装时间 < 60s
- 磁盘占用 < 500MB
- 缓存命中 > 80%
  ↓
持续改进
```

</details>

---

**导航**  
[上一章：第 13 章面试题](./chapter-13.md) | [返回目录](../README.md) | [下一章：第 15 章面试题](./chapter-15.md)
