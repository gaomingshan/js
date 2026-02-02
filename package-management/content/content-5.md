# npm 安装流程详解

## npm install 完整生命周期

### 执行阶段分解

```bash
npm install express
```

**完整流程**：

```
1. 解析阶段（Parse）
   ├─ 读取 package.json
   ├─ 读取 package-lock.json（如果存在）
   └─ 构建初始依赖树

2. 解析依赖（Resolve）
   ├─ 查询 registry 获取包元数据
   ├─ 计算版本满足性
   └─ 构建完整依赖图

3. 获取阶段（Fetch）
   ├─ 检查本地缓存
   ├─ 下载 tarball
   └─ 验证完整性（checksum）

4. 提取阶段（Extract）
   ├─ 解压 tarball 到临时目录
   └─ 移动到 node_modules

5. 链接阶段（Link）
   ├─ 创建符号链接（可执行文件）
   └─ 处理 bin 字段

6. 构建阶段（Build）
   ├─ 执行 preinstall 脚本
   ├─ 执行 install 脚本
   ├─ 执行 postinstall 脚本
   └─ 处理原生模块编译

7. 锁定阶段（Lock）
   └─ 更新 package-lock.json
```

### 时间消耗分析

**典型 React 项目**：
```
解析依赖: 200ms   (5%)
下载包:   3000ms  (70%)
解压安装: 800ms   (20%)
运行脚本: 200ms   (5%)
总计:     4200ms
```

**优化重点**：网络下载占主要时间。

---

## 网络请求与缓存机制

### Registry 查询流程

**1. 元数据查询**：
```http
GET https://registry.npmjs.org/express
```

**响应示例**：
```json
{
  "name": "express",
  "versions": {
    "4.18.0": {
      "dist": {
        "tarball": "https://registry.npmjs.org/express/-/express-4.18.0.tgz",
        "shasum": "abc123...",
        "integrity": "sha512-..."
      },
      "dependencies": {
        "accepts": "~1.3.8",
        "body-parser": "1.20.0"
      }
    }
  }
}
```

**2. Tarball 下载**：
```http
GET https://registry.npmjs.org/express/-/express-4.18.0.tgz
```

### 缓存策略

**缓存目录**（npm 6+）：
```
~/.npm/_cacache/
├── content-v2/     # 实际文件内容（按 hash 存储）
├── index-v5/       # 索引（快速查找）
└── tmp/            # 临时下载目录
```

**缓存命中判断**：
```javascript
function getCachedPackage(name, version) {
  const integrity = getIntegrity(name, version);  // 从 lockfile 获取
  const cacheKey = `${name}@${version}`;
  
  // 查找索引
  const entry = cache.index.find(cacheKey);
  if (!entry || entry.integrity !== integrity) {
    return null;  // 缓存失效
  }
  
  // 读取内容
  return cache.content.get(entry.contentHash);
}
```

**缓存验证**：
```bash
# 验证缓存完整性
npm cache verify

# 清理缓存
npm cache clean --force
```

---

## node_modules 目录结构演变

### npm v2：嵌套结构

```
node_modules/
└── express/
    ├── package.json
    └── node_modules/
        ├── body-parser/
        │   └── node_modules/
        │       └── bytes/
        ├── cookie/
        └── debug/
```

**特点**：
- 完全嵌套，依赖树直观
- 路径过长（Windows 限制）
- 大量重复安装

### npm v3-6：扁平化结构

```
node_modules/
├── express/
├── body-parser/  (提升)
├── bytes/        (提升)
├── cookie/       (提升)
├── debug/        (提升)
└── accepts/
    └── node_modules/
        └── mime-types/  (版本冲突，保持嵌套)
```

**特点**：
- 减少重复安装
- 幽灵依赖问题
- 安装顺序影响结果

### npm v7+：改进的扁平化

```
node_modules/
├── .package-lock.json  (锁文件副本)
├── express/
├── body-parser/
└── ...
```

**新特性**：
- 自动安装 peer dependencies
- 更智能的冲突解决
- 隐藏的 `.package-lock.json`

---

## 扁平化安装的副作用

### 1. 幽灵依赖（Phantom Dependencies）

**问题**：
```javascript
// 你的代码
const bodyParser = require('body-parser');  // 未声明依赖

// 但能正常运行，因为 express 依赖了 body-parser
```

**危害**：
```json
// package.json（未声明 body-parser）
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 如果 express 移除了对 body-parser 的依赖
// 你的代码会突然报错
```

**解决方案**：
```bash
# 使用 dependency-check 检测
npx depcheck

# 或使用 pnpm 的严格模式
pnpm install  # 默认隔离依赖
```

### 2. 不确定性安装

**场景**：
```json
// 两个包依赖不同版本的 lodash
{
  "dependencies": {
    "pkg-a": "1.0.0",  // 依赖 lodash@^4.17.0
    "pkg-b": "1.0.0"   // 依赖 lodash@^4.16.0
  }
}
```

**可能的结果 A**（pkg-a 先处理）：
```
node_modules/
├── lodash@4.17.21  (提升)
└── pkg-b/
    └── node_modules/
        └── lodash@4.16.6
```

**可能的结果 B**（pkg-b 先处理）：
```
node_modules/
├── lodash@4.16.6  (提升)
└── pkg-a/
    └── node_modules/
        └── lodash@4.17.21
```

**影响**：顶层的 lodash 版本不确定。

### 3. 分身问题（Doppelgangers）

**问题**：
```javascript
// 包 A 和包 B 都导出 React 组件
import ComponentA from 'pkg-a';  // 使用 react@17.0.0
import ComponentB from 'pkg-b';  // 使用 react@18.0.0

// 两个 React 版本在运行时共存
// 导致 Context、Hooks 失效
```

**检测**：
```bash
npm ls react

react@17.0.0
├── pkg-a
└── UNMET PEER DEPENDENCY react@18.0.0
    └── pkg-b
```

---

## 常见误区

### 误区 1：node_modules 可以提交到 Git

**错误做法**：
```bash
git add node_modules/
git commit -m "Add dependencies"
```

**问题**：
- 仓库体积暴增（几百 MB）
- 跨平台兼容性问题（原生模块）
- 合并冲突频繁

**正确做法**：
```bash
# .gitignore
node_modules/

# 使用锁文件保证一致性
git add package-lock.json
```

### 误区 2：npm install 等于 npm ci

**npm install**：
- 使用 package.json 的版本范围
- 可能更新依赖
- 会修改 package-lock.json

**npm ci**（Continuous Integration）：
- 严格使用 package-lock.json
- 不会修改锁文件
- 删除现有 node_modules 后全新安装

**CI 环境最佳实践**：
```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: npm ci  # 而不是 npm install
```

### 误区 3：删除 node_modules 可以解决所有问题

**盲目操作**：
```bash
rm -rf node_modules
npm install
```

**更好的诊断流程**：
```bash
# 1. 检查锁文件一致性
npm ls

# 2. 验证缓存
npm cache verify

# 3. 清理缓存（如果必要）
npm cache clean --force

# 4. 重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 工程实践

### 场景 1：加速 CI 构建

**缓存 node_modules**：
```yaml
# GitHub Actions
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

- name: Install dependencies
  run: npm ci
```

**使用 npm ci**：
```bash
# 对比
npm install  # 3-5 分钟
npm ci       # 1-2 分钟（快 60%）
```

### 场景 2：离线安装

**准备离线包**：
```bash
# 下载所有依赖到本地
npm install --prefer-offline

# 打包缓存
tar -czf npm-cache.tar.gz ~/.npm
```

**离线环境安装**：
```bash
# 恢复缓存
tar -xzf npm-cache.tar.gz -C ~/

# 离线安装
npm install --offline
```

### 场景 3：并行安装优化

**npm 默认并发数**：
```bash
# 查看配置
npm config get maxsockets

# 默认值：50
```

**调整并发**：
```bash
# 增加并发（网络好时）
npm config set maxsockets 100

# 减少并发（网络差时，避免超时）
npm config set maxsockets 10
```

---

## 深入一点

### npm 的并行下载策略

**伪代码**：
```javascript
async function downloadPackages(packages) {
  const queue = [...packages];
  const concurrent = 50;
  const downloading = new Set();
  
  while (queue.length > 0 || downloading.size > 0) {
    // 启动新的下载任务
    while (downloading.size < concurrent && queue.length > 0) {
      const pkg = queue.shift();
      const promise = downloadPackage(pkg)
        .finally(() => downloading.delete(promise));
      downloading.add(promise);
    }
    
    // 等待任意一个完成
    await Promise.race(downloading);
  }
}
```

### package-lock.json 的锁定机制

**v1 vs v2 vs v3**：

**lockfileVersion 1**（npm 5-6）：
```json
{
  "lodash": {
    "version": "4.17.21",
    "resolved": "https://...",
    "integrity": "sha512-..."
  }
}
```

**lockfileVersion 2**（npm 7）：
```json
{
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://...",
      "integrity": "sha512-..."
    }
  }
}
```

**lockfileVersion 3**（npm 9+）：
- 包含 v2 的所有信息
- 移除了冗余字段
- 更紧凑的表示

### 原生模块的编译

**node-gyp 流程**：
```bash
# 检测环境
node-gyp configure

# 编译 C++ 代码
node-gyp build

# 输出 .node 二进制文件
```

**常见问题**：
```bash
# Windows 缺少构建工具
npm install --global windows-build-tools

# macOS 缺少 Xcode
xcode-select --install

# Linux 缺少编译器
sudo apt-get install build-essential
```

---

## 参考资料

- [npm CLI 源码](https://github.com/npm/cli)
- [npm install 详细流程](https://docs.npmjs.com/cli/v9/commands/npm-install)
- [cacache 缓存实现](https://github.com/npm/cacache)
