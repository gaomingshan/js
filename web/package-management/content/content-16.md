# Yarn Classic 的设计动机

## Yarn 诞生背景（2016）

### npm 3-4 时代的痛点

**2016 年 Facebook 面临的问题**：

**1. 安装速度慢**
```bash
# 大型项目（1000+ 依赖）
npm install
# 耗时：5-10 分钟
```

**原因**：
- 串行下载（虽然有并发，但效率低）
- 每次都查询 registry 元数据
- 无并行解压优化

**2. 不确定性安装**
```bash
# 开发者 A（2016-01-01）
npm install
→ lodash@4.17.0

# 开发者 B（2016-06-01）
npm install  # 同一个 package.json
→ lodash@4.17.5  # registry 更新了
```

**后果**：
- "在我机器上可以运行"
- CI 构建不稳定
- 难以复现问题

**3. 网络不稳定**
```bash
npm install
# 连接超时
# 重试机制不完善
# 经常失败
```

### Facebook 的需求

**内部痛点**：
- React 仓库：200+ 依赖
- 每次 CI 构建：10 分钟
- 团队规模：数千工程师

**核心诉求**：
1. **确定性**：相同的 package.json 产生相同的 node_modules
2. **速度**：并行下载 + 并行安装
3. **可靠性**：离线缓存 + 重试机制
4. **安全性**：checksum 验证

---

## 相比 npm 的核心改进

### 改进 1：yarn.lock 锁文件

**npm 的问题**（2016 年，npm 5 前）：
```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}
```

**没有锁文件**：
- 依赖版本随时间漂移
- 团队成员版本不一致

**Yarn 的解决**：
```yaml
# yarn.lock
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#..."
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...
```

**保证**：
- 版本精确锁定
- URL 固定
- checksum 验证

### 改进 2：并行下载与安装

**npm 的串行逻辑**（简化）：
```javascript
for (const pkg of packages) {
  await downloadPackage(pkg);
  await extractPackage(pkg);
  await installPackage(pkg);
}
```

**Yarn 的并行策略**：
```javascript
// 阶段 1：并行下载
await Promise.all(packages.map(pkg => downloadPackage(pkg)));

// 阶段 2：并行解压
await Promise.all(packages.map(pkg => extractPackage(pkg)));

// 阶段 3：链接（顺序确定）
for (const pkg of packages) {
  await linkPackage(pkg);
}
```

**性能对比**：
```
npm install（2016）：  5-10 分钟
yarn install（2016）： 1-2 分钟
提升：5-10 倍
```

### 改进 3：离线模式

**npm 的缓存**：
- 缓存存在但不可靠
- 离线安装困难

**Yarn 的离线缓存**：
```bash
# 首次安装（在线）
yarn install
# 缓存所有包到 ~/.yarn/cache

# 后续安装（离线）
yarn install --offline
# 完全使用缓存，无需网络
```

**缓存结构**：
```
~/.yarn/cache/
└── v6/
    ├── npm-lodash-4.17.21-sha512-abc123
    └── npm-react-18.2.0-sha512-def456
```

**优势**：
- 可预测的缓存命中
- 支持完全离线
- 便于企业内网部署

### 改进 4：扁平化依赖树

**npm 3 的扁平化问题**：
- 安装顺序影响结果
- 不确定性

**Yarn 的改进**：
```javascript
// 确定性的扁平化算法
function flattenDependencies(tree) {
  // 1. 按字母序排序（确定性）
  const sorted = sortPackages(tree);
  
  // 2. 优先提升最常用的版本
  const stats = analyzeVersionUsage(sorted);
  
  // 3. 一致性提升
  return hoist(sorted, stats);
}
```

**效果**：
- 相同输入产生相同输出
- 减少重复依赖

---

## yarn.lock 格式设计

### 文件格式

**YAML 风格**：
```yaml
# yarn.lock

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#..."
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...

"lodash@^4.16.0", "lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#..."
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...
```

**设计特点**：

**1. 多约束合并**
```yaml
"lodash@^4.16.0", "lodash@^4.17.0":
  version "4.17.21"
```
含义：两个版本范围都满足 4.17.21

**2. 可读性强**
- YAML 格式易读
- 手动 diff 友好
- 合并冲突少

**3. 紧凑表示**
```yaml
# 不需要记录完整的依赖树
# 只记录解析结果
```

### 与 package-lock.json 对比

**package-lock.json（v1）**：
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "dependencies": {
    "lodash": {
      "version": "4.17.21",
      "resolved": "https://...",
      "integrity": "sha512-...",
      "requires": {}
    },
    "express": {
      "version": "4.18.0",
      "requires": {
        "body-parser": "1.20.0"
      }
    },
    "body-parser": {
      "version": "1.20.0"
    }
  }
}
```

**yarn.lock**：
```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "..."
  integrity sha512-...

express@^4.18.0:
  version "4.18.0"
  resolved "..."
  dependencies:
    body-parser "1.20.0"

body-parser@1.20.0:
  version "1.20.0"
  resolved "..."
```

**对比**：

| 特性 | yarn.lock | package-lock.json (v1) |
|------|----------|----------------------|
| 格式 | YAML | JSON |
| 可读性 | 高 | 中 |
| 合并冲突 | 少 | 多 |
| 文件大小 | 小 | 大 |
| 精确度 | 高 | 高 |

---

## 确定性安装的实现

### 锁文件的验证机制

**安装流程**：
```javascript
async function yarnInstall() {
  // 1. 读取 package.json 和 yarn.lock
  const packageJson = readPackageJson();
  const yarnLock = parseYarnLock();
  
  // 2. 验证一致性
  if (!isLockfileValid(packageJson, yarnLock)) {
    throw new Error('Lockfile out of sync');
  }
  
  // 3. 严格按照 yarn.lock 安装
  for (const [name, spec] of Object.entries(yarnLock)) {
    const { version, resolved, integrity } = spec;
    
    // 精确版本、URL、checksum
    await installPackage(name, version, resolved, integrity);
  }
}
```

### checksum 验证

**完整性保障**：
```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            SHA-512 checksum
```

**验证流程**：
```javascript
async function verifyPackage(tarball, expectedIntegrity) {
  const actualHash = await calculateHash(tarball);
  
  if (actualHash !== expectedIntegrity) {
    throw new Error('Integrity check failed!');
  }
}
```

### 确定性的数学证明

**输入**：
- package.json（固定）
- yarn.lock（固定）
- registry 状态（固定 URL + checksum）

**输出**：
- node_modules 结构（固定）

**保证**：
```
∀ t1, t2 ∈ Time,
  install(package.json, yarn.lock, t1) = install(package.json, yarn.lock, t2)
```

---

## 常见误区

### 误区 1：Yarn 只是更快的 npm

**真相**：Yarn 的核心价值是**确定性**，速度是附带收益

**确定性的价值**：
- CI 构建可复现
- 团队协作无版本冲突
- 问题可追溯

### 误区 2：yarn.lock 可以手动编辑

**危险操作**：
```yaml
# 手动修改
lodash@^4.17.0:
  version "4.17.20"  # 改为 4.17.20
```

**后果**：
- integrity 不匹配
- 安装失败或安装错误版本

**正确做法**：
```bash
# 升级依赖
yarn upgrade lodash@4.17.20

# 或修改 package.json 后
yarn install
```

### 误区 3：Yarn 和 npm 可以混用

**问题**：
```bash
yarn install
npm install  # ❌
```

**后果**：
- yarn.lock 和 package-lock.json 冲突
- node_modules 结构不一致

**团队规范**：
```json
// package.json
{
  "engines": {
    "yarn": "^1.22.0"
  },
  "scripts": {
    "preinstall": "npx only-allow yarn"
  }
}
```

---

## 工程实践

### 场景 1：迁移到 Yarn

**步骤**：
```bash
# 1. 安装 Yarn
npm install -g yarn

# 2. 删除 npm 锁文件
rm package-lock.json

# 3. 安装依赖
yarn install
# 生成 yarn.lock

# 4. 验证
yarn run build
yarn test

# 5. 提交
git add yarn.lock
git commit -m "Migrate to Yarn"
```

### 场景 2：CI 配置

**GitHub Actions**：
```yaml
- name: Get yarn cache directory path
  id: yarn-cache-dir-path
  run: echo "dir=$(yarn cache dir)" >> $GITHUB_OUTPUT

- uses: actions/cache@v3
  with:
    path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}

- name: Install dependencies
  run: yarn install --frozen-lockfile
```

**--frozen-lockfile 参数**：
- yarn.lock 不存在 → 报错
- yarn.lock 与 package.json 不一致 → 报错
- 确保 CI 使用精确版本

### 场景 3：离线部署

**准备**：
```bash
# 生成离线镜像
yarn install
tar -czf yarn-offline.tar.gz ~/.yarn/cache yarn.lock
```

**部署**：
```bash
# 解压缓存
tar -xzf yarn-offline.tar.gz -C ~/

# 离线安装
yarn install --offline
```

---

## 深入一点

### Yarn 的锁文件解析算法

**伪代码**：
```javascript
function parseYarnLock(content) {
  const entries = {};
  const lines = content.split('\n');
  
  let currentKey = null;
  let currentEntry = {};
  
  for (const line of lines) {
    if (line.endsWith(':')) {
      // 新条目
      if (currentKey) {
        entries[currentKey] = currentEntry;
      }
      currentKey = line.slice(0, -1).replace(/"/g, '');
      currentEntry = {};
    } else if (line.includes(' ')) {
      // 字段
      const [key, value] = line.trim().split(' ');
      currentEntry[key] = value.replace(/"/g, '');
    }
  }
  
  return entries;
}
```

### Yarn 1.x 的性能优化

**并行下载**：
```javascript
const CONCURRENT_DOWNLOADS = 10;

async function downloadPackages(packages) {
  const queue = [...packages];
  const downloading = new Set();
  
  while (queue.length > 0 || downloading.size > 0) {
    while (downloading.size < CONCURRENT_DOWNLOADS && queue.length > 0) {
      const pkg = queue.shift();
      const promise = downloadPackage(pkg)
        .finally(() => downloading.delete(promise));
      downloading.add(promise);
    }
    
    await Promise.race(downloading);
  }
}
```

**缓存优化**：
```javascript
function getCacheKey(pkg) {
  // 内容寻址
  return `npm-${pkg.name}-${pkg.version}-${pkg.integrity}`;
}
```

### Yarn 的影响力

**推动 npm 改进**：
- npm 5（2017）：引入 package-lock.json
- npm 6（2018）：性能优化
- npm 7（2021）：自动安装 peer dependencies

**市场份额变化**：
```
2016: npm 100%, Yarn 0%
2017: npm 80%, Yarn 20%
2020: npm 60%, Yarn 30%, pnpm 10%
2023: npm 50%, Yarn 25%, pnpm 25%
```

---

## 参考资料

- [Yarn 诞生博客](https://engineering.fb.com/2016/10/11/web/yarn-a-new-package-manager-for-javascript/)
- [yarn.lock 格式](https://classic.yarnpkg.com/en/docs/yarn-lock)
- [Yarn Classic 文档](https://classic.yarnpkg.com/)
