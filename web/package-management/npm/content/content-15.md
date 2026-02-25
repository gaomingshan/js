# npm 缓存机制与优化

## 概述

npm 使用缓存来加速包安装，减少网络请求。理解缓存机制对于优化安装性能、排查问题至关重要，特别是在 CI/CD 环境中。

## 缓存目录结构

### 默认位置

```bash
# 查看缓存目录
npm config get cache

# Windows: %APPDATA%\npm-cache
# macOS/Linux: ~/.npm
```

### 目录结构

```
~/.npm/
├── _cacache/           # 内容寻址缓存（npm 5+）
│   ├── content-v2/     # 实际文件内容
│   │   ├── sha512/     # 按哈希值存储
│   │   │   ├── 00/
│   │   │   ├── 01/
│   │   │   └── ...
│   ├── index-v5/       # 索引数据
│   │   └── ...
│   └── tmp/            # 临时文件
├── _logs/              # npm 日志
└── anonymous-cli-metrics.json  # 匿名统计
```

## 缓存工作原理

### 内容寻址存储

**哈希计算：**
```javascript
// 伪代码
const hash = sha512(packageTarball);
const cachePath = `_cacache/content-v2/sha512/${hash.slice(0,2)}/${hash.slice(2,4)}/${hash}`;
```

**查找流程：**
```
1. 根据包名、版本、integrity 生成 key
2. 在 index-v5 中查找
3. 如果存在，验证 integrity
4. 从 content-v2 读取文件
5. 如果不存在或损坏，重新下载
```

### 缓存命中

```bash
npm install lodash

# 首次安装
1. 查询 registry
2. 下载 tarball
3. 计算 sha512
4. 保存到缓存
5. 解压到 node_modules

# 再次安装
1. 查询 registry（获取元数据）
2. 检查缓存（通过 integrity）
3. 从缓存读取（无需下载）
4. 解压到 node_modules
```

## 缓存命令

### 查看缓存信息

```bash
# 查看缓存大小
npm cache verify

# 输出示例
Cache verified and compressed (~/.npm/_cacache)
Content verified: 1234 (56.7 MB)
Index entries: 1234
Finished in 3.456s
```

### 清理缓存

```bash
# 完全清理缓存
npm cache clean --force

# 验证缓存完整性
npm cache verify
```

**警告：**
- 清理缓存会删除所有已缓存的包
- 下次安装需要重新下载
- 通常不需要手动清理

### 查看缓存内容

```bash
# 列出缓存的包（需要工具）
npm cache ls  # npm 6+ 已移除

# 使用 cacache
npx cacache ls ~/.npm/_cacache
```

## 离线安装

### 优先使用缓存

```bash
# 优先离线模式
npm install --prefer-offline

# 完全离线（缓存不存在则失败）
npm install --offline
```

### 离线镜像

**创建离线包：**
```bash
# 打包依赖
npm pack

# 或使用 npm-offline
npm install -g npm-offline
npm-offline save
```

**使用离线包：**
```bash
npm-offline install
```

## CI/CD 缓存优化

### GitHub Actions

```yaml
name: CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'  # 自动缓存 npm
      
      - run: npm ci
      - run: npm test
```

**手动缓存配置：**
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### GitLab CI

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 使用挂载缓存
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

COPY . .
RUN npm run build

CMD ["node", "server.js"]
```

**构建：**
```bash
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t myapp .
```

## 缓存性能对比

```bash
# 无缓存
rm -rf ~/.npm node_modules
time npm install
# real: 45s

# 有缓存（首次）
time npm install
# real: 40s（下载 + 缓存）

# 有缓存（再次）
rm -rf node_modules
time npm install
# real: 8s（仅从缓存）

# npm ci（有缓存）
rm -rf node_modules
time npm ci
# real: 5s（最快）
```

## 最佳实践

### 1. CI/CD 使用缓存

```yaml
# ✅ 推荐
steps:
  - uses: actions/setup-node@v3
    with:
      cache: 'npm'
  - run: npm ci

# ❌ 不推荐（不使用缓存）
steps:
  - run: npm install
```

### 2. 定期验证缓存

```bash
# 每月运行一次
npm cache verify
```

### 3. 不要频繁清理

```bash
# ❌ 不必要
npm cache clean --force && npm install

# ✅ 仅在问题时清理
# 例如：缓存损坏、磁盘空间不足
```

### 4. 使用 prefer-offline

```bash
# 开发环境
npm install --prefer-offline

# 或配置
npm config set prefer-offline true
```

### 5. 监控缓存大小

```bash
# 定期检查
du -sh ~/.npm

# 如果过大（>5GB），考虑清理
```

## 常见问题

### 问题 1：缓存损坏

```bash
npm ERR! integrity check failed

# 解决
npm cache verify
# 或
npm cache clean --force
```

### 问题 2：磁盘空间不足

```bash
# 查看缓存大小
npm cache verify

# 清理缓存
npm cache clean --force
```

### 问题 3：安装缓慢（有缓存）

```bash
# 可能是网络慢（仍需查询 registry）
# 使用完全离线
npm install --offline
```

## 参考资料

- [npm cache 文档](https://docs.npmjs.com/cli/v9/commands/npm-cache)
- [cacache](https://github.com/npm/cacache)

---

**上一章：**[npm scripts 高级技巧](./content-14.md)  
**下一章：**[npm 包发布完整流程](./content-16.md)
