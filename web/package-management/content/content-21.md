# pnpm 的设计哲学

## 内容寻址存储（content-addressable store）

### 核心概念

**传统包管理器的问题**：
```
项目 A：
node_modules/lodash/  (50 MB)

项目 B：
node_modules/lodash/  (50 MB，重复！)

项目 C：
node_modules/lodash/  (50 MB，重复！)

磁盘占用：150 MB
```

**pnpm 的解决方案**：内容寻址存储

```
全局 store：
~/.pnpm-store/
└── v3/
    └── files/
        └── 00/
            └── 1a2b3c...  (lodash 的唯一副本，50 MB)

项目 A、B、C：
node_modules/lodash → 硬链接到 store

磁盘占用：50 MB（节省 67%）
```

### 内容寻址原理

**文件标识**：基于内容的 SHA-512 hash

**存储逻辑**：
```javascript
function storePackage(tarball) {
  // 1. 解压 tarball
  const files = extractTarball(tarball);
  
  // 2. 为每个文件计算 hash
  for (const file of files) {
    const hash = crypto.createHash('sha512')
      .update(file.content)
      .digest('hex');
    
    const storePath = path.join(
      store,
      'v3/files',
      hash.slice(0, 2),  // 分层
      hash.slice(2, 4),
      hash
    );
    
    // 3. 只存储一次（去重）
    if (!fs.existsSync(storePath)) {
      fs.writeFileSync(storePath, file.content);
    }
  }
}
```

**效果**：
- 相同文件只存储一次
- 跨项目共享
- 跨版本共享（部分文件可能相同）

---

## 符号链接（symlink）策略

### 三层链接结构

**pnpm 的 node_modules 结构**：
```
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/  ← 硬链接到 store
│   └── express@4.18.0/
│       └── node_modules/
│           ├── express/  ← 硬链接到 store
│           └── body-parser@ → ../../body-parser@1.20.0/node_modules/body-parser
└── lodash@ → .pnpm/lodash@4.17.21/node_modules/lodash
```

**三层关系**：
```
1. 顶层符号链接：
   node_modules/lodash → .pnpm/lodash@4.17.21/node_modules/lodash

2. 虚拟存储：
   .pnpm/lodash@4.17.21/node_modules/lodash ← 硬链接到 store

3. 全局存储：
   ~/.pnpm-store/v3/files/00/1a2b3c.../
```

### 为什么需要三层？

**问题 1**：直接符号链接到 store
```
node_modules/lodash → ~/.pnpm-store/v3/files/.../lodash

# 问题：
1. lodash 的依赖怎么办？
2. require.resolve 路径错误
```

**问题 2**：只有虚拟存储
```
node_modules/
└── .pnpm/
    └── lodash@4.17.21/node_modules/lodash

# 问题：无法直接 require('lodash')
```

**pnpm 的解决**：
```
顶层符号链接：提供可访问性
虚拟存储：提供依赖隔离
硬链接：节省磁盘空间
```

---

## 硬链接（hard link）机制

### 硬链接 vs 符号链接

**符号链接（Symlink）**：
```bash
ln -s target link
# link 是一个指针，指向 target
# 删除 target，link 失效
```

**硬链接（Hard Link）**：
```bash
ln target link
# link 和 target 指向同一个 inode
# 删除任意一个，另一个仍然有效
```

**示例**：
```bash
# 创建文件
echo "hello" > file1.txt

# 创建硬链接
ln file1.txt file2.txt

# 查看 inode
ls -li file*.txt
# 12345678 -rw-r--r-- 2 user user 6 Dec 1 12:00 file1.txt
# 12345678 -rw-r--r-- 2 user user 6 Dec 1 12:00 file2.txt
#         ^^^^^^^^ 同一个 inode

# 修改任意一个
echo "world" >> file1.txt
cat file2.txt
# hello
# world  ← 两个文件同步

# 删除 file1
rm file1.txt
cat file2.txt
# hello
# world  ← file2 仍然可用
```

### pnpm 的硬链接应用

**store 到虚拟存储**：
```bash
# store 中的文件
~/.pnpm-store/v3/files/00/1a2b3c.../lodash/index.js

# 虚拟存储中的硬链接
.pnpm/lodash@4.17.21/node_modules/lodash/index.js
# ↑ 硬链接，指向同一个 inode

# 效果
du -sh ~/.pnpm-store
# 50 MB

du -sh .pnpm
# 0 MB（硬链接不占额外空间）
```

**磁盘空间计算**：
```
实际占用 = store 大小 + 符号链接元数据
符号链接元数据：每个链接约 1 KB
```

---

## 磁盘空间节省原理

### 单项目对比

**npm/Yarn Classic**：
```
node_modules/
├── lodash/           50 MB
├── react/           500 MB
├── webpack/         100 MB
└── ... (200+ 包)

总计：3 GB
```

**pnpm**：
```
~/.pnpm-store/       3 GB（全局共享）

项目 A：
.pnpm/               0 MB（硬链接）
node_modules/        10 MB（符号链接元数据）

总计：10 MB
```

### 多项目对比

**场景**：5 个项目，80% 依赖相同

**npm/Yarn Classic**：
```
project-a/node_modules/  3 GB
project-b/node_modules/  3 GB
project-c/node_modules/  3 GB
project-d/node_modules/  3 GB
project-e/node_modules/  3 GB

总计：15 GB
```

**pnpm**：
```
~/.pnpm-store/           3 GB（共享）

project-a/.pnpm/         10 MB
project-b/.pnpm/         10 MB
project-c/.pnpm/         10 MB
project-d/.pnpm/         10 MB
project-e/.pnpm/         10 MB

总计：3.05 GB（节省 80%）
```

### 跨版本去重

**场景**：lodash@4.17.20 和 lodash@4.17.21

**npm/Yarn Classic**：
```
lodash@4.17.20/  50 MB
lodash@4.17.21/  50 MB

总计：100 MB（完全重复）
```

**pnpm**：
```
分析两个版本的文件差异：
- 相同文件：48 MB（96%）
- 不同文件：2 MB + 2 MB = 4 MB

总计：52 MB（节省 48%）
```

**原理**：内容寻址存储，相同内容的文件共享

---

## 常见误区

### 误区 1：硬链接会导致文件冲突

**担忧**：修改一个项目的依赖会影响其他项目

**真相**：pnpm 的硬链接是只读的

**实验**：
```bash
# 尝试修改依赖文件
echo "// hacked" >> node_modules/lodash/index.js

# pnpm 检测到修改
pnpm install
# Error: Integrity check failed for lodash@4.17.21
# Expected: sha512-abc...
# Actual:   sha512-xyz...

# pnpm 会重新链接正确的文件
```

**机制**：
- store 中的文件权限：`r--r--r--`（只读）
- 任何修改都会被检测到

### 误区 2：硬链接在所有文件系统都可用

**限制**：
- **Windows**：需要管理员权限或开发者模式
- **跨文件系统**：硬链接无法跨磁盘

**Windows 解决方案**：
```bash
# 方案 1：启用开发者模式
# Settings → Update & Security → For developers → Developer mode

# 方案 2：使用符号链接模式（性能稍差）
pnpm install --symlink
```

**跨磁盘解决方案**：
```bash
# store 和项目在不同磁盘
/mnt/disk1/project/
/mnt/disk2/.pnpm-store/

# pnpm 自动降级到拷贝模式
pnpm install
# Warning: Hard links are not supported across file systems
# Falling back to copying files
```

### 误区 3：pnpm 只节省磁盘空间

**真相**：pnpm 还提升了性能

**安装速度**：
```
npm install（首次）：  180 秒
pnpm install（首次）： 120 秒（快 33%）

npm install（缓存）：  30 秒
pnpm install（缓存）： 10 秒（快 67%）
```

**原因**：
- 无需解压数万个文件
- 硬链接创建速度快
- 并行操作优化

---

## 工程实践

### 场景 1：迁移到 pnpm

**步骤**：
```bash
# 1. 全局安装 pnpm
npm install -g pnpm

# 2. 删除旧依赖
rm -rf node_modules package-lock.json yarn.lock

# 3. 安装依赖
pnpm install

# 4. 测试
pnpm run build
pnpm test

# 5. 提交
git add pnpm-lock.yaml
git commit -m "Migrate to pnpm"
```

### 场景 2：清理 store

**问题**：store 持续增长

**查看 store 大小**：
```bash
du -sh ~/.pnpm-store
# 10 GB
```

**清理未使用的包**：
```bash
# 查看可清理的大小
pnpm store prune --dry-run

# 执行清理
pnpm store prune
# Removed 500 MB of unreferenced packages
```

**完全清空**：
```bash
# 删除整个 store
rm -rf ~/.pnpm-store

# 重新安装（从 registry 下载）
pnpm install
```

### 场景 3：验证安装完整性

**检查依赖**：
```bash
# 验证所有包的 integrity
pnpm install --frozen-lockfile

# 如果有问题
# Error: Integrity check failed
```

**修复损坏的 store**：
```bash
# 重新下载损坏的包
pnpm install --force

# 或清理后重装
pnpm store prune
pnpm install
```

---

## 深入一点

### 内容寻址的数学模型

**哈希冲突概率**：
```
SHA-512 输出：512 位 = 2^512 种可能
地球上所有原子数：约 2^166

结论：碰撞概率 ≈ 0（在宇宙尺度上几乎不可能）
```

**文件去重效率**：
```javascript
function deduplicationRate(packages) {
  const uniqueFiles = new Set();
  let totalSize = 0;
  let uniqueSize = 0;
  
  for (const pkg of packages) {
    for (const file of pkg.files) {
      const hash = calculateHash(file.content);
      totalSize += file.size;
      
      if (!uniqueFiles.has(hash)) {
        uniqueFiles.add(hash);
        uniqueSize += file.size;
      }
    }
  }
  
  return 1 - (uniqueSize / totalSize);
}

// 典型项目：去重率 30-50%
```

### 硬链接的 inode 计数

**inode 引用计数**：
```bash
# 创建硬链接
ln ~/.pnpm-store/v3/files/.../file .pnpm/.../file

# 查看引用计数
stat ~/.pnpm-store/v3/files/.../file
# Links: 2  ← 两个硬链接

# 删除项目中的链接
rm .pnpm/.../file

# store 中的文件仍存在
stat ~/.pnpm-store/v3/files/.../file
# Links: 1  ← 引用计数减 1
```

**垃圾回收**：
```javascript
function cleanStore(store) {
  for (const file of listFiles(store)) {
    const stat = fs.statSync(file);
    
    // 引用计数为 1（只有 store 自己）
    if (stat.nlink === 1) {
      // 可以安全删除
      fs.unlinkSync(file);
    }
  }
}
```

### pnpm vs npm/Yarn 架构对比

**npm/Yarn Classic**：
```
registry → cache → node_modules（复制）
```

**pnpm**：
```
registry → store（唯一副本） → .pnpm（硬链接） → node_modules（符号链接）
```

**优势**：
- 全局去重
- 多层缓存
- 严格隔离

**劣势**：
- 结构复杂
- 兼容性问题（某些工具不支持符号链接）

---

## 参考资料

- [pnpm 动机](https://pnpm.io/zh/motivation)
- [内容寻址存储](https://en.wikipedia.org/wiki/Content-addressable_storage)
- [文件系统硬链接](https://en.wikipedia.org/wiki/Hard_link)
- [pnpm vs npm/Yarn](https://pnpm.io/zh/feature-comparison)
