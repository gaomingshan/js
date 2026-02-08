# npm 缓存机制

## 缓存目录结构

### 缓存位置

**默认路径**：
```bash
# macOS/Linux
~/.npm/_cacache/

# Windows
%LOCALAPPDATA%/npm-cache/

# 查看当前配置
npm config get cache
```

### 目录结构

```
~/.npm/_cacache/
├── content-v2/          # 实际文件内容
│   ├── sha512/
│   │   ├── 00/
│   │   │   └── 01/
│   │   │       └── abc123...  # 按 hash 前缀分层
│   │   ├── 01/
│   │   └── ...
├── index-v5/            # 索引数据
│   ├── 00/
│   │   └── 01/
│   │       └── xyz789...
├── tmp/                 # 临时下载目录
└── _logs/               # 日志文件
```

**设计原理**：
- **内容寻址**：文件名是其内容的 SHA-512 hash
- **分层存储**：前缀分层避免单目录文件过多
- **索引分离**：快速查找而不扫描所有文件

---

## 缓存验证与失效策略

### 缓存键（Cache Key）

**组成**：
```javascript
const cacheKey = {
  name: 'lodash',
  version: '4.17.21',
  resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
  integrity: 'sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=='
};
```

### 缓存命中判断

**查找流程**：
```javascript
function getCached(packageSpec) {
  // 1. 生成缓存键
  const key = `make-fetch-happen:request-cache:${packageSpec.resolved}`;
  
  // 2. 查询索引
  const entry = await index.find(key);
  if (!entry) return null;
  
  // 3. 验证 integrity
  if (entry.integrity !== packageSpec.integrity) {
    return null;  // integrity 不匹配，缓存失效
  }
  
  // 4. 读取内容
  const content = await contentRead(entry.integrity);
  
  // 5. 验证内容完整性
  const actualHash = calculateHash(content);
  if (actualHash !== entry.integrity) {
    return null;  // 文件损坏
  }
  
  return content;
}
```

### 失效策略

**何时失效**：
1. **integrity 不匹配**（版本更新）
2. **文件损坏**（磁盘错误）
3. **手动清理**（`npm cache clean`）

**不会失效**：
- 时间过期（npm 缓存永久有效）
- 空间不足（不自动清理）

---

## offline 模式与网络容错

### offline 模式

**启用**：
```bash
# 完全离线
npm install --offline

# 优先使用缓存
npm install --prefer-offline

# 优先使用网络
npm install --prefer-online  # 默认行为
```

**行为差异**：

| 模式 | 缓存存在 | 缓存不存在 |
|------|---------|-----------|
| `--offline` | 使用缓存 | **报错** |
| `--prefer-offline` | 使用缓存 | 从网络下载 |
| `--prefer-online` | 先验证，再使用缓存 | 从网络下载 |

### 网络容错

**超时重试**：
```bash
# 配置
npm config set fetch-retries 5        # 重试次数
npm config set fetch-retry-mintimeout 10000  # 最小间隔 (ms)
npm config set fetch-retry-maxtimeout 60000  # 最大间隔 (ms)
```

**指数退避**：
```
第 1 次失败 → 等待 10s → 重试
第 2 次失败 → 等待 20s → 重试
第 3 次失败 → 等待 40s → 重试
...
第 5 次失败 → 放弃
```

**降级策略**：
```javascript
async function fetchWithFallback(url) {
  try {
    return await fetch(url);
  } catch (primaryError) {
    // 降级到镜像源
    const mirrorUrl = url.replace('registry.npmjs.org', 'registry.npmmirror.com');
    try {
      return await fetch(mirrorUrl);
    } catch (mirrorError) {
      // 最后尝试缓存
      return await getCached(url);
    }
  }
}
```

---

## 缓存优化实践

### 清理策略

**验证缓存完整性**：
```bash
npm cache verify

# 输出示例：
# Cache verified and compressed (~/.npm/_cacache)
# Content verified: 1234 (56.7 MB)
# Index entries: 1234
# Finished in 2.345s
```

**清理所有缓存**：
```bash
npm cache clean --force

# 等价于
rm -rf ~/.npm/_cacache
```

**部分清理**（不推荐手动操作）：
```bash
# 删除超过 30 天未使用的缓存
find ~/.npm/_cacache -type f -atime +30 -delete
```

### CI 环境优化

**缓存共享**：
```yaml
# GitHub Actions
- name: Cache npm dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

**效果对比**：
```
无缓存：npm install → 3 分钟
有缓存：npm ci → 30 秒
节省时间：83%
```

**GitLab CI**：
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline
```

### Monorepo 缓存优化

**问题**：多个子包共享依赖，但重复下载

**pnpm 的解决方案**：
```
~/.pnpm-store/
└── v3/
    └── files/
        └── 00/
            └── abc123  (全局唯一存储)

projects/
├── app-a/node_modules/lodash/  → hard link
└── app-b/node_modules/lodash/  → hard link
```

**效果**：
- 磁盘占用减少 70%
- 安装速度提升 2-3 倍

---

## 常见误区

### 误区 1：缓存会自动过期

**真相**：npm 缓存永久有效，不会自动清理。

**验证**：
```bash
# 安装包
npm install lodash@4.17.20

# 一年后
npm install lodash@4.17.20
# 仍然使用缓存（如果 lockfile 未变）
```

**问题**：缓存目录可能持续增长

**解决**：
```bash
# 定期验证和清理
npm cache verify

# 或使用工具自动化
npx npm-cache-clean
```

### 误区 2：删除 node_modules 会清理缓存

**错误理解**：
```bash
rm -rf node_modules  # 只删除项目依赖
npm cache  # 仍然存在
```

**正确理解**：
- `node_modules/`：项目依赖安装目录
- `~/.npm/_cacache/`：全局缓存目录
- 两者独立

### 误区 3：缓存导致安装了旧版本

**场景**：
```bash
# 2023-01-01 安装
npm install react  # 安装 18.2.0，写入缓存

# 2023-06-01 React 发布 18.3.0

# 2023-06-02 安装
npm install react  # 仍然安装 18.2.0？
```

**真相**：
- 如果 package-lock.json 锁定了 18.2.0，则使用缓存
- 如果没有锁文件，会查询 registry 获取最新版本

**缓存不会阻止版本更新，只加速已知版本的安装。**

---

## 工程实践

### 场景 1：加速本地开发

**预热缓存**：
```bash
# 项目初始化时
npm install

# 后续开发
rm -rf node_modules
npm install  # 使用缓存，秒级安装
```

**多项目共享缓存**：
```
项目 A：npm install react@18.2.0 → 下载并缓存
项目 B：npm install react@18.2.0 → 直接使用缓存
项目 C：npm install react@18.2.0 → 直接使用缓存
```

### 场景 2：离线开发环境

**准备**：
```bash
# 在线环境下载所有依赖
npm install --prefer-online

# 打包缓存
tar -czf npm-cache.tar.gz ~/.npm
```

**离线环境**：
```bash
# 恢复缓存
tar -xzf npm-cache.tar.gz -C ~/

# 离线安装
npm install --offline
```

### 场景 3：诊断缓存问题

**步骤**：
```bash
# 1. 验证缓存
npm cache verify

# 2. 检查特定包是否缓存
npm cache ls lodash

# 3. 如果有问题，清理重建
npm cache clean --force
npm install
```

**常见问题**：
```
问题：npm install 很慢，但缓存存在
原因：integrity 不匹配，缓存未命中
解决：检查 package-lock.json 是否正确
```

---

## 深入一点

### cacache 的实现原理

**内容寻址存储（CAS）**：
```javascript
// 写入缓存
async function put(cache, key, data) {
  // 1. 计算内容 hash
  const integrity = ssri.fromData(data);  // sha512-...
  
  // 2. 存储内容（按 hash）
  const contentPath = contentPath(cache, integrity);
  await fs.writeFile(contentPath, data);
  
  // 3. 写入索引（key → integrity）
  await index.insert(cache, key, {
    integrity,
    time: Date.now(),
    size: data.length,
    metadata: { ... }
  });
}

// 读取缓存
async function get(cache, key) {
  // 1. 查询索引
  const entry = await index.find(cache, key);
  if (!entry) return null;
  
  // 2. 读取内容
  const data = await contentRead(cache, entry.integrity);
  
  // 3. 验证完整性
  if (!ssri.checkData(data, entry.integrity)) {
    throw new Error('Cache corruption');
  }
  
  return data;
}
```

### 缓存的哈希冲突处理

**SHA-512 碰撞概率**：
```
理论上：2^256 次操作才可能碰撞一次
实际上：在宇宙热寂之前不会发生
```

**即使碰撞**：
```javascript
// npm 的验证机制
if (downloadedFile.hash === cachedFile.hash) {
  // 进一步验证内容
  if (downloadedFile.content !== cachedFile.content) {
    // 检测到碰撞（几乎不可能）
    throw new Error('Hash collision detected!');
  }
}
```

### 不同包管理器的缓存对比

| 包管理器 | 缓存位置 | 策略 | 磁盘占用 |
|---------|---------|------|---------|
| npm | `~/.npm` | 内容寻址 | 中等 |
| Yarn Classic | `~/.yarn/cache` | 内容寻址 | 中等 |
| Yarn Berry | `.yarn/cache` | 零安装 | 大（提交到 Git） |
| pnpm | `~/.pnpm-store` | 硬链接 | 最小 |

**pnpm 的极致优化**：
```
项目 A：100 个包，300 MB
项目 B：100 个包（80% 相同），320 MB

npm 缓存占用：620 MB
pnpm 缓存占用：320 MB（共享 80%）
```

---

## 参考资料

- [cacache 源码](https://github.com/npm/cacache)
- [npm cache 命令文档](https://docs.npmjs.com/cli/v9/commands/npm-cache)
- [内容寻址存储](https://en.wikipedia.org/wiki/Content-addressable_storage)
