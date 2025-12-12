# 第 23 章：pnpm 性能优化与缓存 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 缓存机制

### 题目

pnpm 的缓存目录在哪里？

**选项：**
- A. ~/.pnpm
- B. ~/.pnpm-store
- C. ~/.local/share/pnpm/store
- D. 项目目录下

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**pnpm store 位置**

#### 默认位置

**Linux/macOS：**
```bash
pnpm store path
# ~/.local/share/pnpm/store/v3
```

**Windows：**
```bash
pnpm store path
# %LOCALAPPDATA%\pnpm\store\v3
```

#### 查看和管理

```bash
# 查看位置
pnpm store path

# 查看状态
pnpm store status

# 清理未使用的包
pnpm store prune
```

#### 自定义位置

```bash
# 环境变量
export PNPM_HOME=/custom/path

# 配置文件
pnpm config set store-dir /custom/path
```

**.npmrc：**
```ini
store-dir=/custom/pnpm-store
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 硬链接优势

### 题目

pnpm 使用硬链接可以节省磁盘空间。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**硬链接节省空间**

#### 对比

**npm（重复存储）：**
```
项目A/node_modules/lodash/  # 1.4MB
项目B/node_modules/lodash/  # 1.4MB
项目C/node_modules/lodash/  # 1.4MB

总计：4.2MB
```

**pnpm（硬链接共享）：**
```
~/.local/share/pnpm/store/
└── lodash@4.17.21/  # 1.4MB（唯一副本）

项目A/node_modules/lodash → 硬链接
项目B/node_modules/lodash → 硬链接
项目C/node_modules/lodash → 硬链接

总计：1.4MB ⚡
```

**节省 67% 空间**

#### 验证

```bash
# 查看 inode（相同表示硬链接）
ls -i ~/.local/share/pnpm/store/v3/files/00/abc...
# 12345

ls -i project-a/node_modules/.pnpm/lodash@4.17.21/.../index.js
# 12345  ← 相同的 inode
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 安装速度

### 题目

pnpm 为什么安装速度快？

**选项：**
- A. 使用更快的服务器
- B. 硬链接 + 内容寻址
- C. 压缩算法
- D. 并行下载

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm 速度优势**

#### 核心原理

**1. 内容寻址存储：**
```bash
# 文件内容的哈希
sha512(file) = abc123...

# Store 路径
~/.local/share/pnpm/store/v3/files/ab/c123...
```

**相同内容只下载一次**

**2. 硬链接：**
```bash
# 不需要复制文件
# 直接创建硬链接
ln store/abc... node_modules/.pnpm/pkg/...

# 几乎瞬间完成
```

#### 性能对比

```bash
# 首次安装（需要下载）
npm:  60s
pnpm: 20s ⚡⚡⚡

# 有缓存（已下载过）
npm:  30s（需要解压复制）
pnpm: 5s（直接硬链接）⚡⚡⚡⚡⚡

# 多项目共享缓存
npm:  60s × 项目数
pnpm: 5s × 项目数（共享 store）⚡⚡⚡⚡⚡
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 性能优化

### 题目

如何进一步优化 pnpm 安装性能？

**选项：**
- A. 使用镜像源
- B. 启用并行安装
- C. 使用 --frozen-lockfile
- D. 配置 network-concurrency

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、C、D

### 📖 解析

**pnpm 性能优化**

#### A. 使用镜像源 ✅

**.npmrc：**
```ini
registry=https://registry.npmmirror.com
```

```bash
# 官方源（国外慢）
pnpm install  # 60s

# 淘宝镜像（国内快）
pnpm install  # 15s ⚡⚡⚡⚡
```

#### C. --frozen-lockfile ✅

```bash
pnpm install --frozen-lockfile

# 跳过：
# - lock 文件更新检查
# - 版本解析
# 直接安装锁定的版本

# CI 必用
```

#### D. network-concurrency ✅

**.npmrc：**
```ini
network-concurrency=16  # 并发数
```

```bash
# 默认 16
# 可调整 8-32
```

#### B. 并行安装 ❌

**pnpm 默认已并行**
- 不需要特殊配置
- 自动优化

#### 完整优化配置

**.npmrc：**
```ini
# Registry
registry=https://registry.npmmirror.com

# 网络
network-concurrency=16
fetch-retries=3
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 性能
package-import-method=hardlink  # 明确使用硬链接
side-effects-cache=true
```

#### 性能对比

```bash
# 默认配置
pnpm install  # 20s

# + 镜像源
pnpm install  # 5s

# + frozen-lockfile
pnpm install --frozen-lockfile  # 3s

# + network-concurrency=32
pnpm install --frozen-lockfile  # 2s ⚡
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** store管理

### 题目

如何清理 pnpm store 中未使用的包？

**选项：**
- A. 删除 store 目录
- B. pnpm store prune
- C. pnpm cache clean
- D. 手动查找删除

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm store 管理**

#### 查看状态

```bash
pnpm store status

# 输出：
# ✔ Store size: 2.5 GB
# ✔ Packages: 1234
# ✔ Referenced packages: 567
# ⚠ Unreferenced packages: 667
```

#### 清理未引用的包

```bash
pnpm store prune

# 删除未被任何项目引用的包
# 节省空间
```

#### 完全清理（危险）

```bash
# 删除整个 store
rm -rf ~/.local/share/pnpm/store

# 下次安装需要重新下载所有包
```

#### 项目级清理

```bash
# 删除项目 node_modules
rm -rf node_modules

# 重新安装
pnpm install
```

#### 自动清理脚本

```json
{
  "scripts": {
    "clean": "rm -rf node_modules",
    "clean:store": "pnpm store prune",
    "reset": "npm run clean && pnpm install"
  }
}
```

#### CI 中的清理

```yaml
# 定期清理 store
- name: Cleanup store
  run: pnpm store prune
  # 减少缓存大小
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 内容寻址

### 题目

pnpm 的内容寻址存储是如何工作的？

**选项：**
- A. 按包名存储
- B. 按版本号存储
- C. 按文件内容哈希存储
- D. 按下载时间存储

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**内容寻址存储（CAS）**

#### 原理

```bash
# 文件内容
echo "console.log('hello')" > file.js

# 计算哈希
sha512(file.js) = a1b2c3d4...

# Store 路径
~/.local/share/pnpm/store/v3/files/a1/b2c3d4...
```

**路径由内容决定，不是名称**

#### 优势

**1. 去重：**
```bash
# 两个包包含相同文件
pkg-a/utils.js  # 内容：function add() {...}
pkg-b/utils.js  # 内容：function add() {...}（相同）

# Store 中只存一份
store/files/ab/cd1234...

# 两个包都硬链接到这里
```

**2. 完整性：**
```bash
# 下载后验证
downloaded_hash = sha512(downloaded_file)
expected_hash = "a1b2c3d4..."

if (downloaded_hash !== expected_hash) {
  throw Error("Integrity check failed")
}
```

**3. 高效：**
```bash
# 快速查找
hash = sha512(file)
path = store/files/${hash[0:2]}/${hash[2:]}

# O(1) 查找
```

#### 结构

```
~/.local/share/pnpm/store/v3/
├── files/
│   ├── 00/
│   │   └── abc123...  # 内容哈希
│   ├── 01/
│   └── ...
└── tmp/
```

#### 验证

```bash
# 查看文件哈希
openssl dgst -sha512 node_modules/.pnpm/lodash@4.17.21/.../index.js

# 对比 store 中的路径
ls ~/.local/share/pnpm/store/v3/files/00/abc...

# 相同的哈希值
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 安装模式

### 题目

pnpm 的 `package-import-method` 有哪些选项？

**选项：**
- A. auto
- B. hardlink
- C. copy
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**package-import-method 配置**

#### 选项

**.npmrc：**
```ini
package-import-method=auto  # 默认
```

**可选值：**

**1. auto（默认）：**
```ini
package-import-method=auto
```
- 优先硬链接
- 不支持时自动降级

**2. hardlink：**
```ini
package-import-method=hardlink
```
- 强制硬链接
- 不支持时报错

**3. copy：**
```ini
package-import-method=copy
```
- 复制文件
- 兼容性最好
- 但占用空间

**4. clone：**
```ini
package-import-method=clone
```
- 使用 CoW（写时复制）
- 需要文件系统支持

**5. clone-or-copy：**
```ini
package-import-method=clone-or-copy
```
- 优先 clone
- 不支持时复制

#### 对比

| 方法 | 空间 | 速度 | 兼容性 |
|------|------|------|--------|
| **hardlink** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **copy** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **clone** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **auto** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

#### 使用建议

**开发环境：**
```ini
package-import-method=hardlink
```

**Docker：**
```ini
# 某些文件系统不支持硬链接
package-import-method=copy
```

**Windows：**
```ini
# Windows 对硬链接有限制
package-import-method=auto
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 性能诊断

### 题目

如何诊断 pnpm 安装慢的问题？

<details>
<summary>查看答案</summary>

### ✅ 答案

**pnpm 性能诊断**

#### 1. 启用详细日志

```bash
pnpm install --reporter=ndjson > install.log
```

**分析日志：**
```javascript
// parse-log.js
const fs = require('fs');
const lines = fs.readFileSync('install.log', 'utf8').split('\n');

const events = lines.filter(Boolean).map(JSON.parse);

// 统计各阶段耗时
const phases = {};
events.forEach(e => {
  if (e.level === 'info' && e.name === 'lifecycle') {
    phases[e.script] = (phases[e.script] || 0) + (e.duration || 0);
  }
});

console.table(phases);
```

#### 2. 检查网络

```bash
# 测试 registry 速度
time curl -I https://registry.npmjs.org

# 使用镜像
pnpm config set registry https://registry.npmmirror.com

# 增加并发
pnpm config set network-concurrency 32
```

#### 3. 检查磁盘 I/O

```bash
# 查看 store 位置
pnpm store path

# 检查磁盘性能
dd if=/dev/zero of=testfile bs=1M count=1024

# SSD vs HDD 差异巨大
```

#### 4. 检查 postinstall 脚本

```bash
# 禁用脚本测试
pnpm install --ignore-scripts

# 如果明显快 → 脚本耗时
```

**package.json：**
```json
{
  "scripts": {
    "postinstall": "node slow-script.js"  // 慢
  }
}
```

#### 5. 分析依赖

```bash
# 查看依赖数量
pnpm list --depth=0

# 大量依赖 → 考虑拆分或优化
```

#### 完整诊断脚本

```javascript
// diagnose.js
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 pnpm 性能诊断\n');

// 1. 环境信息
console.log('📋 环境：');
console.log('Node:', process.version);
console.log('pnpm:', execSync('pnpm --version').toString().trim());
console.log('OS:', process.platform);

// 2. Store 信息
const storePath = execSync('pnpm store path').toString().trim();
console.log('\n💾 Store：');
console.log('路径:', storePath);

const storeSize = execSync(`du -sh ${storePath}`).toString().split('\t')[0];
console.log('大小:', storeSize);

// 3. 网络测试
console.log('\n🌐 网络：');
const registry = execSync('pnpm config get registry').toString().trim();
console.log('Registry:', registry);

const start = Date.now();
try {
  execSync(`curl -I ${registry} -o /dev/null -s -w "%{time_total}"`, {
    stdio: 'pipe'
  });
  const time = Date.now() - start;
  console.log('延迟:', time + 'ms');
} catch (e) {
  console.log('⚠️ 网络测试失败');
}

// 4. 依赖分析
console.log('\n📦 依赖：');
try {
  const deps = JSON.parse(execSync('pnpm list --json --depth=0').toString());
  console.log('数量:', Object.keys(deps.dependencies || {}).length);
} catch (e) {
  console.log('⚠️ 无法分析依赖');
}

// 5. 性能测试
console.log('\n⚡ 性能测试：');
console.log('清理...');
execSync('rm -rf node_modules', { stdio: 'inherit' });

console.log('安装中...');
const installStart = Date.now();
execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' });
const installTime = Date.now() - installStart;

console.log('\n✅ 安装耗时:', installTime + 'ms');

// 生成报告
const report = {
  timestamp: new Date().toISOString(),
  environment: {
    node: process.version,
    pnpm: execSync('pnpm --version').toString().trim(),
    os: process.platform
  },
  store: {
    path: storePath,
    size: storeSize
  },
  network: {
    registry,
    latency: time
  },
  performance: {
    installTime
  }
};

fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
console.log('\n📊 报告已保存到 performance-report.json');
```

**使用：**
```bash
node diagnose.js
```

### 📖 解析

**常见瓶颈**

1. **网络慢** → 使用镜像源
2. **磁盘慢** → 使用 SSD，优化 store 位置
3. **脚本慢** → 优化 postinstall
4. **依赖多** → 减少不必要的依赖

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** CI优化

### 题目

如何在 CI/CD 中优化 pnpm 性能？

<details>
<summary>查看答案</summary>

### ✅ 答案

**CI/CD pnpm 优化**

#### 1. 缓存 store

**GitHub Actions：**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'  # ✅ 自动缓存
      
      - run: pnpm install --frozen-lockfile
```

**手动缓存：**
```yaml
- name: Get pnpm store directory
  id: pnpm-cache
  run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- uses: actions/cache@v3
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

#### 2. 使用 --frozen-lockfile

```yaml
- run: pnpm install --frozen-lockfile
  # 跳过 lock 文件更新
  # 更快
```

#### 3. 并行任务

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [16, 18, 20]
    steps:
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
  
  # 并行运行多个版本
```

#### 4. 优化网络

```yaml
- name: Configure pnpm
  run: |
    pnpm config set network-concurrency 32
    pnpm config set fetch-retries 5
```

#### 5. Docker 优化

```dockerfile
FROM node:18-alpine

# 启用 corepack
RUN corepack enable

WORKDIR /app

# 复制 lock 文件
COPY pnpm-lock.yaml ./

# 只安装依赖（缓存层）
RUN pnpm fetch

# 复制源码
COPY . .

# 安装（使用 fetch 的缓存）
RUN pnpm install --offline --frozen-lockfile

# 构建
RUN pnpm build

CMD ["pnpm", "start"]
```

**分层缓存：**
- `pnpm fetch` - 下载到虚拟 store
- `pnpm install --offline` - 使用缓存安装

#### 完整优化示例

```yaml
name: Optimized CI

on:
  push:
    branches: [main]
  pull_request:

env:
  PNPM_VERSION: 8.6.0

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      # 优化配置
      - name: Configure pnpm
        run: |
          pnpm config set network-concurrency 32
          pnpm config set store-dir ~/.pnpm-store
      
      # 快速安装
      - name: Install dependencies
        run: pnpm install --frozen-lockfile --prefer-offline
      
      # 并行任务
      - name: Build and test
        run: |
          pnpm -r --parallel run build
          pnpm -r --parallel run test
      
      # 缓存构建产物
      - uses: actions/cache@v3
        with:
          path: |
            **/dist
            **/.next
          key: ${{ runner.os }}-build-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 📖 解析

**性能提升**

```bash
# 无优化
安装：120s
构建：60s
测试：30s
总计：210s

# 有缓存
安装：10s  ⚡⚡⚡⚡⚡
构建：60s
测试：30s
总计：100s

# 完全优化
安装：5s   ⚡⚡⚡⚡⚡
构建：30s  ⚡⚡（并行）
测试：15s  ⚡⚡（并行）
总计：50s  ⚡⚡⚡⚡⚡
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 性能监控

### 题目

实现 pnpm 性能监控系统。

<details>
<summary>查看答案</summary>

### ✅ 答案

**pnpm 性能监控**

```javascript
// scripts/monitor-pnpm.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PnpmMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      environment: {},
      store: {},
      network: {},
      performance: {},
      dependencies: {}
    };
  }

  // 收集环境信息
  collectEnvironment() {
    this.metrics.environment = {
      node: process.version,
      pnpm: execSync('pnpm --version').toString().trim(),
      os: process.platform,
      arch: process.arch
    };
  }

  // 收集 store 信息
  collectStore() {
    const storePath = execSync('pnpm store path').toString().trim();
    
    try {
      const status = execSync('pnpm store status').toString();
      const sizeMatch = status.match(/Store size: ([\d.]+\s+\w+)/);
      const packagesMatch = status.match(/Packages: (\d+)/);
      
      this.metrics.store = {
        path: storePath,
        size: sizeMatch ? sizeMatch[1] : 'unknown',
        packages: packagesMatch ? parseInt(packagesMatch[1]) : 0
      };
    } catch (e) {
      this.metrics.store = { path: storePath, error: e.message };
    }
  }

  // 测试网络性能
  async collectNetwork() {
    const registry = execSync('pnpm config get registry').toString().trim();
    
    const start = Date.now();
    try {
      execSync(`curl -I ${registry} -o /dev/null -s`, {
        timeout: 5000
      });
      const latency = Date.now() - start;
      
      this.metrics.network = {
        registry,
        latency: `${latency}ms`,
        status: 'ok'
      };
    } catch (e) {
      this.metrics.network = {
        registry,
        status: 'failed',
        error: e.message
      };
    }
  }

  // 性能测试
  async testPerformance() {
    console.log('🧪 运行性能测试...\n');

    // 清理
    console.log('清理 node_modules...');
    if (fs.existsSync('node_modules')) {
      execSync('rm -rf node_modules');
    }

    // 测试冷启动（无缓存）
    console.log('测试冷启动...');
    execSync('pnpm store prune');
    const coldStart = Date.now();
    execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
    const coldTime = Date.now() - coldStart;

    // 清理
    execSync('rm -rf node_modules');

    // 测试热启动（有缓存）
    console.log('测试热启动...');
    const hotStart = Date.now();
    execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
    const hotTime = Date.now() - hotStart;

    this.metrics.performance = {
      coldStart: `${coldTime}ms`,
      hotStart: `${hotTime}ms`,
      improvement: `${((1 - hotTime / coldTime) * 100).toFixed(1)}%`
    };
  }

  // 分析依赖
  collectDependencies() {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const depCount = Object.keys(pkg.dependencies || {}).length;
      const devDepCount = Object.keys(pkg.devDependencies || {}).length;
      
      // 获取实际安装的包数量
      const list = execSync('pnpm list --depth=Infinity --json').toString();
      const total = (list.match(/"name":/g) || []).length;
      
      this.metrics.dependencies = {
        direct: depCount,
        dev: devDepCount,
        total: total
      };
    } catch (e) {
      this.metrics.dependencies = { error: e.message };
    }
  }

  // 生成报告
  generateReport() {
    const report = {
      ...this.metrics,
      recommendations: this.getRecommendations()
    };

    // 保存报告
    const reportPath = 'pnpm-performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 显示摘要
    console.log('\n' + '='.repeat(50));
    console.log('📊 性能报告摘要');
    console.log('='.repeat(50));
    console.log(`\n环境：${report.environment.pnpm} on Node ${report.environment.node}`);
    console.log(`Store：${report.store.size} (${report.store.packages} packages)`);
    console.log(`网络：${report.network.latency} to ${report.network.registry}`);
    console.log(`\n性能：`);
    console.log(`  冷启动：${report.performance.coldStart}`);
    console.log(`  热启动：${report.performance.hotStart}`);
    console.log(`  提升：${report.performance.improvement}`);
    console.log(`\n依赖：${report.dependencies.total} total (${report.dependencies.direct} direct)`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 建议：`);
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    console.log(`\n完整报告：${reportPath}\n`);
  }

  // 获取优化建议
  getRecommendations() {
    const recs = [];
    
    // 网络延迟高
    if (this.metrics.network.latency && 
        parseInt(this.metrics.network.latency) > 1000) {
      recs.push('网络延迟较高，建议使用镜像源');
    }
    
    // Store 过大
    if (this.metrics.store.size && 
        parseFloat(this.metrics.store.size) > 5) {
      recs.push('Store 体积较大，运行 pnpm store prune 清理');
    }
    
    // 依赖过多
    if (this.metrics.dependencies.total > 1000) {
      recs.push('依赖数量较多，考虑优化或拆分项目');
    }
    
    // 性能提升小
    if (this.metrics.performance.improvement && 
        parseFloat(this.metrics.performance.improvement) < 50) {
      recs.push('缓存效果不明显，检查 store 配置');
    }
    
    return recs;
  }

  // 运行完整监控
  async run() {
    console.log('🚀 pnpm 性能监控\n');
    
    this.collectEnvironment();
    console.log('✓ 环境信息');
    
    this.collectStore();
    console.log('✓ Store 信息');
    
    await this.collectNetwork();
    console.log('✓ 网络测试');
    
    await this.testPerformance();
    console.log('✓ 性能测试');
    
    this.collectDependencies();
    console.log('✓ 依赖分析');
    
    this.generateReport();
  }
}

// 运行
const monitor = new PnpmMonitor();
monitor.run().catch(console.error);
```

**使用：**
```bash
node scripts/monitor-pnpm.js
```

**CI 集成：**
```yaml
- name: Monitor pnpm performance
  run: node scripts/monitor-pnpm.js

- name: Upload report
  uses: actions/upload-artifact@v3
  with:
    name: performance-report
    path: pnpm-performance-report.json
```

### 📖 解析

**监控指标**

1. **环境信息** - Node、pnpm 版本
2. **Store 状态** - 大小、包数量
3. **网络性能** - Registry 延迟
4. **安装性能** - 冷/热启动时间
5. **依赖分析** - 包数量、大小

**持续优化**

定期运行监控，跟踪性能变化，及时发现问题。

</details>

---

**导航**  
[上一章：第 22 章面试题](./chapter-22.md) | [返回目录](../README.md) | [下一章：第 24 章面试题](./chapter-24.md)
