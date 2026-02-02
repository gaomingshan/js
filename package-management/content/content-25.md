# pnpm 性能优化原理

## 安装速度优化技术

### 并行操作流水线

**传统包管理器的串行流程**：
```javascript
// npm/Yarn Classic 简化流程
for (const pkg of packages) {
  await fetchMetadata(pkg);
  await downloadTarball(pkg);
  await extractTarball(pkg);
  await linkPackage(pkg);
}
```

**pnpm 的并行流水线**：
```javascript
// pnpm 三阶段并行
async function install(packages) {
  // 阶段 1：并行获取元数据
  const metadata = await Promise.all(
    packages.map(pkg => fetchMetadata(pkg))
  );
  
  // 阶段 2：并行下载
  const tarballs = await Promise.all(
    packages.map(pkg => downloadTarball(pkg))
  );
  
  // 阶段 3：并行提取和链接
  await Promise.all(
    packages.map((pkg, i) => {
      extractToStore(tarballs[i]);
      linkFromStore(pkg);
    })
  );
}
```

**性能提升**：
```
npm (串行):     200 个包 × 1s = 200s
pnpm (并行):    200 个包 ÷ 10 并发 = 20s
提升：10 倍
```

### 内容寻址加速

**传统方式**：每次都解压
```bash
npm install lodash
# 1. 下载 tarball
# 2. 解压到 node_modules/lodash/
# 3. 复制所有文件
```

**pnpm 方式**：只解压一次
```bash
pnpm install lodash

# 首次：
# 1. 下载 tarball
# 2. 解压到 store
# 3. 创建硬链接

# 再次（其他项目）：
# 1. 检查 store（已存在）
# 2. 创建硬链接（瞬间完成）
```

**时间对比**：
```
npm (解压):       200ms
pnpm (硬链接):    5ms（快 40 倍）
```

---

## 并发下载与并行安装

### 并发控制策略

**动态并发数**：
```javascript
function getOptimalConcurrency() {
  const cpus = os.cpus().length;
  const networkSpeed = measureNetworkSpeed();
  
  if (networkSpeed > 100) {  // 100 Mbps
    return Math.min(cpus * 4, 50);
  } else if (networkSpeed > 10) {
    return Math.min(cpus * 2, 20);
  } else {
    return Math.min(cpus, 10);
  }
}
```

**队列管理**：
```javascript
class DownloadQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.active = 0;
    this.queue = [];
  }
  
  async add(task) {
    if (this.active >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
```

### 智能重试机制

**指数退避**：
```javascript
async function downloadWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await download(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
      await sleep(delay);
    }
  }
}
```

**故障转移**：
```javascript
async function downloadWithFallback(pkg) {
  const registries = [
    'https://registry.npmjs.org',
    'https://registry.npmmirror.com',
    'https://registry.yarnpkg.com'
  ];
  
  for (const registry of registries) {
    try {
      return await download(registry, pkg);
    } catch (error) {
      console.warn(`Failed to download from ${registry}`);
    }
  }
  
  throw new Error('All registries failed');
}
```

---

## 磁盘 I/O 优化

### 减少文件系统调用

**问题**：传统方式创建数万个文件
```bash
npm install

# 创建文件：
# node_modules/lodash/index.js
# node_modules/lodash/package.json
# node_modules/lodash/... (100+ 文件)
# × 200 个包 = 20,000+ 文件
```

**pnpm 优化**：
```bash
pnpm install

# 创建硬链接（不复制文件）：
# .pnpm/lodash@4.17.21/node_modules/lodash → store
# node_modules/lodash → .pnpm/...
# × 200 个包 = 400 个链接
```

**系统调用对比**：
```
npm:
- 20,000× open()
- 20,000× write()
- 20,000× close()

pnpm:
- 400× symlink()
- 200× link()（硬链接）
```

### 批量操作

**传统方式**：逐个文件操作
```javascript
for (const file of files) {
  await fs.writeFile(file.path, file.content);
}
```

**pnpm 优化**：批量操作
```javascript
await Promise.all(
  files.map(file => fs.writeFile(file.path, file.content))
);
```

### 流式处理

**内存优化**：
```javascript
// 传统方式：全部读入内存
const tarball = await fs.readFile('package.tgz');
const extracted = extract(tarball);
await fs.writeFile('output', extracted);

// pnpm 方式：流式处理
const readStream = fs.createReadStream('package.tgz');
const extractStream = tar.extract();
const writeStream = fs.createWriteStream('output');

readStream.pipe(extractStream).pipe(writeStream);
```

---

## 性能基准测试对比

### 测试环境

**硬件配置**：
```
CPU: 8 核
RAM: 16 GB
SSD: NVMe
网络: 100 Mbps
```

**测试项目**：
```
React 应用：
- 依赖数量：200 个
- node_modules 大小：300 MB
- 总文件数：30,000+
```

### 冷启动测试（无缓存）

**操作**：
```bash
rm -rf node_modules ~/.npm ~/.yarn ~/.pnpm-store
time <package-manager> install
```

**结果**：
```
npm 6:          240 秒
npm 7:          180 秒
Yarn Classic:   120 秒
Yarn Berry PnP: 90 秒
pnpm:           60 秒  ← 最快
```

**分析**：
```
pnpm 优势：
1. 并行下载（40 秒）
2. 硬链接安装（15 秒）
3. 符号链接创建（5 秒）
```

### 热启动测试（有缓存）

**操作**：
```bash
rm -rf node_modules
time <package-manager> install
```

**结果**：
```
npm 6:          60 秒
npm 7:          40 秒
Yarn Classic:   25 秒
Yarn Berry PnP: 8 秒
pnpm:           10 秒  ← 第二快
```

**分析**：
```
Yarn Berry PnP 最快：无需 node_modules
pnpm 第二快：硬链接速度快
```

### 增量安装测试

**操作**：
```bash
# 已有 node_modules
time <package-manager> install react-router
```

**结果**：
```
npm:    15 秒
Yarn:   10 秒
pnpm:   3 秒  ← 最快
```

**分析**：
```
pnpm 优势：
- 只需硬链接新包
- 不需要重新解析依赖树
- 不需要重新提升
```

### Monorepo 安装测试

**项目**：
```
10 个子包
平均每个：50 个依赖
80% 依赖重复
```

**结果**：
```
npm/Yarn Classic:
- 总依赖：500 个
- 磁盘占用：5 GB
- 安装时间：300 秒

pnpm:
- 去重后：150 个
- 磁盘占用：500 MB
- 安装时间：40 秒

提升：7.5 倍速度，10 倍磁盘节省
```

---

## 常见误区

### 误区 1：pnpm 总是最快

**反例**：小项目可能差异不大

**测试**：10 个依赖的项目
```
npm:    5 秒
pnpm:   4 秒
差异：20%（不明显）
```

**结论**：pnpm 的优势在大型项目中更明显

### 误区 2：硬链接会影响性能

**担忧**：硬链接会增加文件系统开销

**真相**：硬链接几乎无开销
```bash
# 创建硬链接
ln file1 file2
# 时间：< 1ms

# 复制文件
cp file1 file2
# 时间：100ms（100 KB 文件）
```

### 误区 3：并发数越高越好

**错误配置**：
```bash
pnpm config set network-concurrency 1000
```

**问题**：
- 超过带宽限制
- 系统文件描述符耗尽
- 实际速度下降

**推荐**：
```bash
# 默认值（自动调整）
pnpm config get network-concurrency
# 50

# 或根据网络调整
pnpm config set network-concurrency 20  # 慢速网络
```

---

## 工程实践

### 场景 1：CI 环境优化

**GitHub Actions**：
```yaml
- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Install dependencies
  run: pnpm install --frozen-lockfile --prefer-offline

# 优化效果：
# 无缓存：60 秒
# 有缓存：10 秒（快 6 倍）
```

**配置调优**：
```bash
# .npmrc（CI 专用）
network-concurrency=50
fetch-retries=3
fetch-retry-mintimeout=10000
store-dir=/tmp/pnpm-store  # 使用 RAM disk
```

### 场景 2：本地开发优化

**预热 store**：
```bash
# 项目初始化
pnpm install

# 后续项目（使用已缓存的包）
cd ../new-project
pnpm install  # 极快
```

**共享 store**：
```bash
# 设置全局 store 位置
pnpm config set store-dir ~/.pnpm-store

# 所有项目共享
~/projects/project-a/  → ~/.pnpm-store
~/projects/project-b/  → ~/.pnpm-store
~/projects/project-c/  → ~/.pnpm-store
```

### 场景 3：性能分析

**启用详细日志**：
```bash
pnpm install --reporter=append-only

# 输出示例：
# Resolving: total 200, reused 180, downloaded 20
# Fetching: 200, done in 15s
# Linking: 200, done in 5s
# Total: 20s
```

**性能分析**：
```bash
time pnpm install --loglevel=debug

# 分析瓶颈：
# - Resolving 慢 → 网络问题
# - Fetching 慢 → 带宽限制
# - Linking 慢 → 磁盘性能
```

---

## 深入一点

### 并行算法的复杂度

**理论分析**：
```
串行复杂度：O(n)，n = 包数量
并行复杂度：O(n/c + log c)，c = 并发数

示例：
n = 200, c = 50
串行：O(200) = 200 秒
并行：O(200/50 + log 50) ≈ 4 + 5.6 = 10 秒
```

**实际瓶颈**：
```
理论并行度 = CPU 核数 × I/O 等待时间
实际并行度 = min(理论并行度, 网络带宽, 文件描述符)
```

### 硬链接的内核实现

**inode 引用计数**：
```c
// 简化的 Linux 内核代码
struct inode {
  unsigned long i_ino;     // inode 号
  atomic_t i_count;        // 引用计数
  // ...
};

int link(const char *oldpath, const char *newpath) {
  struct inode *inode = lookup_inode(oldpath);
  atomic_inc(&inode->i_count);  // 引用计数 +1
  create_dentry(newpath, inode);
  return 0;
}
```

**性能特性**：
```
创建硬链接：O(1)
删除硬链接：O(1)
访问文件：O(1)（与普通文件相同）
```

### 缓存命中率分析

**命中率计算**：
```javascript
function calculateHitRate(projects) {
  const totalPackages = projects.reduce((sum, p) => sum + p.packages.length, 0);
  const uniquePackages = new Set(projects.flatMap(p => p.packages)).size;
  
  return (totalPackages - uniquePackages) / totalPackages;
}

// 典型场景：
// 3 个 React 项目，平均 200 个包，80% 重复
// 命中率 = (600 - 120) / 600 = 80%
```

**磁盘节省**：
```
无缓存：600 个包 × 500 KB = 300 MB
pnpm store：120 个包 × 500 KB = 60 MB
节省：80%
```

### pnpm 的性能瓶颈

**网络瓶颈**：
```
下载速度 = min(
  registry CDN 速度,
  本地带宽,
  并发数 × 单连接速度
)
```

**磁盘瓶颈**：
```
SSD: 500 MB/s（足够快）
HDD: 100 MB/s（可能成为瓶颈）

优化：使用 SSD
```

**CPU 瓶颈**（少见）：
```
解压 tarball：CPU 密集
但现代 CPU 通常足够快
```

---

## 参考资料

- [pnpm 性能基准](https://pnpm.io/benchmarks)
- [为什么 pnpm 快](https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way)
- [内容寻址存储性能](https://en.wikipedia.org/wiki/Content-addressable_storage#Performance)
