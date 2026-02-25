# npm install 深入解析

## 概述

`npm install` 是 npm 最核心的命令，用于安装项目依赖。理解其完整执行流程、各种参数选项和优化技巧，对于提升开发效率和排查安装问题至关重要。

## 基本用法

### 安装所有依赖

```bash
# 根据 package.json 安装所有依赖
npm install
npm i  # 简写
```

**执行流程：**
```
1. 读取 package.json 和 package-lock.json
2. 解析依赖树
3. 检查缓存
4. 下载缺失的包
5. 安装到 node_modules
6. 运行生命周期脚本
7. 更新 package-lock.json
```

### 安装单个包

```bash
# 安装并添加到 dependencies
npm install lodash
npm install lodash@4.17.21  # 指定版本

# 安装到 devDependencies
npm install -D webpack
npm install --save-dev webpack

# 安装到 optionalDependencies
npm install -O fsevents
npm install --save-optional fsevents
```

### 安装多个包

```bash
# 同时安装多个包
npm install react react-dom axios
npm install -D webpack webpack-cli babel-loader
```

## 完整执行流程

### 阶段 1：读取配置

```
1. 读取 .npmrc 配置（项目、用户、全局、内置）
2. 读取 package.json
3. 读取 package-lock.json（如果存在）
4. 确定 registry 地址
5. 确定缓存目录
```

**配置优先级：**
```
项目 .npmrc > 用户 ~/.npmrc > 全局 /etc/npmrc > 内置配置
```

### 阶段 2：依赖解析

```bash
# 如果存在 lock 文件
→ 使用 lock 文件中的精确版本
→ 跳过版本范围解析

# 如果不存在 lock 文件
→ 解析 package.json 中的版本范围
→ 从 registry 获取最新满足版本
→ 递归解析所有依赖
→ 构建依赖树
→ 扁平化处理
```

**依赖树示例：**
```json
{
  "react": {
    "version": "18.2.0",
    "dependencies": {
      "loose-envify": "^1.1.0"
    }
  },
  "axios": {
    "version": "1.4.0",
    "dependencies": {
      "follow-redirects": "^1.15.0"
    }
  }
}
```

### 阶段 3：缓存检查

**缓存目录：**
```bash
# 查看缓存目录
npm config get cache
# Windows: %APPDATA%\npm-cache
# macOS/Linux: ~/.npm
```

**缓存结构：**
```
~/.npm/
├── _cacache/  # 内容寻址缓存
│   ├── content-v2/  # 实际文件
│   └── index-v5/    # 索引
└── _logs/  # 日志
```

**检查流程：**
```
1. 根据包名、版本生成缓存 key
2. 在 _cacache 中查找
3. 验证 integrity（SHA-512）
4. 缓存命中 → 直接使用
5. 缓存未命中 → 下载
```

### 阶段 4：下载包

```bash
# 从 registry 下载 tarball
GET https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz

# 下载流程
1. 发送 HTTP 请求
2. 验证响应状态
3. 计算 integrity 哈希
4. 保存到缓存
```

**并行下载：**
```
npm 默认并行下载多个包
并发数由 maxsockets 控制（默认 50）
```

### 阶段 5：解压安装

```bash
# 解压 tarball 到 node_modules
1. 创建目录 node_modules/lodash
2. 解压 .tgz 文件
3. 设置文件权限
4. 创建符号链接（如果需要）
```

**目录结构：**
```
node_modules/
├── lodash/
│   ├── package.json
│   ├── lodash.js
│   └── ...
└── .package-lock.json
```

### 阶段 6：生命周期脚本

**执行顺序：**
```
preinstall (根项目)
  ↓
preinstall (每个依赖)
  ↓
install (每个依赖)
  ↓
postinstall (每个依赖)
  ↓
install (根项目)
  ↓
postinstall (根项目)
  ↓
prepublish (废弃)
  ↓
preprepare
  ↓
prepare
  ↓
postprepare
```

**示例：**
```json
{
  "scripts": {
    "preinstall": "echo 'before install'",
    "postinstall": "node scripts/postinstall.js",
    "prepare": "npm run build"
  }
}
```

### 阶段 7：更新 lock 文件

```bash
# 更新 package-lock.json
1. 记录安装的精确版本
2. 记录依赖树结构
3. 记录 resolved URL 和 integrity
4. 写入磁盘
```

## 常用参数详解

### --save / -S（已废弃）

```bash
# npm 5+ 默认行为，无需指定
npm install lodash  # 自动添加到 dependencies
```

### --save-dev / -D

```bash
# 安装到 devDependencies
npm install -D webpack
npm install --save-dev webpack babel-loader
```

### --save-optional / -O

```bash
# 安装到 optionalDependencies
npm install -O fsevents
```

### --no-save

```bash
# 安装但不修改 package.json
npm install lodash --no-save
```

**使用场景：**
- 临时测试包
- 一次性使用的工具

### --production

```bash
# 仅安装 dependencies，跳过 devDependencies
npm install --production
npm install --omit=dev
```

**Docker 生产镜像：**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production  # 仅生产依赖
COPY . .
CMD ["node", "server.js"]
```

### --legacy-peer-deps

```bash
# 忽略 peer 依赖冲突（npm 7+ 行为降级到 npm 6）
npm install --legacy-peer-deps
```

**场景：**
```bash
# 已有 react@17
npm install react-package  # 需要 react@18

# 报错
npm ERR! peer react@">=18.0.0"

# 使用 legacy 模式
npm install react-package --legacy-peer-deps
```

### --force / -f

```bash
# 强制重新安装所有包
npm install --force
```

**效果：**
- 忽略缓存
- 重新下载所有包
- 覆盖现有文件

**使用场景：**
- 缓存损坏
- 包安装不完整
- 强制更新

### --ignore-scripts

```bash
# 跳过所有生命周期脚本
npm install --ignore-scripts
```

**使用场景：**
- 安全审计
- 避免恶意脚本
- 快速安装（跳过构建）

### --global / -g

```bash
# 全局安装
npm install -g typescript
npm install --global vue-cli
```

**安装位置：**
```bash
# 查看全局安装目录
npm root -g
# Windows: C:\Users\<user>\AppData\Roaming\npm\node_modules
# macOS/Linux: /usr/local/lib/node_modules
```

### --dry-run

```bash
# 模拟安装，不实际执行
npm install --dry-run
```

**输出：**
```
added 142 packages in 3s
# 仅显示会执行的操作，不修改文件
```

### --prefer-offline

```bash
# 优先使用缓存，减少网络请求
npm install --prefer-offline
```

### --offline

```bash
# 完全离线安装（缓存不存在则失败）
npm install --offline
```

## 安装来源

### 从 registry 安装

```bash
# 默认：npmjs.org
npm install lodash

# 指定版本
npm install lodash@4.17.21

# 指定 tag
npm install react@next
npm install vue@beta
```

### 从 Git 安装

```bash
# GitHub
npm install user/repo
npm install github:user/repo
npm install git+https://github.com/user/repo.git

# GitLab
npm install gitlab:user/repo
npm install git+https://gitlab.com/user/repo.git

# 指定分支/标签/commit
npm install user/repo#branch
npm install user/repo#v1.0.0
npm install user/repo#abc123
```

**package.json 中：**
```json
{
  "dependencies": {
    "my-package": "github:user/repo#main",
    "forked-lib": "git+https://github.com/me/forked-lib.git"
  }
}
```

### 从本地路径安装

```bash
# 相对路径
npm install ../my-local-package
npm install ./packages/utils

# 绝对路径
npm install /Users/me/projects/my-lib
```

**package.json 中：**
```json
{
  "dependencies": {
    "local-lib": "file:../local-lib",
    "utils": "file:./packages/utils"
  }
}
```

**效果：**
- 创建符号链接（symlink）
- 实时反映本地修改

### 从 tarball 安装

```bash
# 本地 tarball
npm install ./package-1.0.0.tgz

# 远程 tarball
npm install https://example.com/package-1.0.0.tgz
```

**package.json 中：**
```json
{
  "dependencies": {
    "custom-pkg": "https://cdn.example.com/custom-pkg-1.0.0.tgz"
  }
}
```

## 性能优化

### 使用 npm ci

```bash
# CI/CD 环境推荐
npm ci

# 对比
npm install  # 10-15s
npm ci      # 5-8s（快 2-3 倍）
```

**原因：**
- 跳过依赖解析
- 删除旧 node_modules
- 严格按 lock 文件安装

### 使用缓存

```bash
# 查看缓存大小
du -sh ~/.npm

# 清理缓存
npm cache clean --force

# 验证缓存
npm cache verify
```

**CI/CD 缓存配置：**
```yaml
# GitHub Actions
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    
- name: Install dependencies
  run: npm ci --prefer-offline
```

### 并行安装

```bash
# 默认并发数：50
npm config get maxsockets

# 调整并发数
npm config set maxsockets 100
npm install
```

### 使用镜像源

```bash
# 淘宝镜像
npm config set registry https://registry.npmmirror.com

# 华为云镜像
npm config set registry https://repo.huaweicloud.com/repository/npm/

# 腾讯云镜像
npm config set registry https://mirrors.cloud.tencent.com/npm/
```

**速度对比：**
```
官方源（国外）：200-500ms/包
淘宝镜像（国内）：50-100ms/包
```

## 常见问题排查

### 问题 1：安装失败

```bash
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules

# 原因：权限不足
# 解决：
sudo npm install -g package-name
# 或配置 npm 目录权限
```

### 问题 2：网络超时

```bash
npm ERR! network timeout

# 解决 1：使用镜像
npm config set registry https://registry.npmmirror.com

# 解决 2：增加超时时间
npm config set timeout 60000

# 解决 3：使用代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### 问题 3：依赖冲突

```bash
npm ERR! peer dep missing: react@>=16.8.0

# 解决 1：安装缺失依赖
npm install react@^16.8.0

# 解决 2：使用 legacy 模式
npm install --legacy-peer-deps

# 解决 3：使用 overrides
{
  "overrides": {
    "react": "^18.0.0"
  }
}
```

### 问题 4：安装卡住

```bash
# 现象
npm install
# 长时间无响应

# 排查
npm install --verbose  # 查看详细输出

# 解决
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 问题 5：包损坏

```bash
npm ERR! integrity check failed

# 解决
npm cache clean --force
npm install --force
```

## 深入一点：安装策略

### 安装算法对比

**npm v2（嵌套）：**
```
时间复杂度：O(n * d)  # n=包数，d=深度
空间复杂度：O(n * d)
优点：依赖隔离
缺点：重复安装
```

**npm v3+（扁平化）：**
```
时间复杂度：O(n log n)  # 需要排序和去重
空间复杂度：O(n)
优点：减少重复
缺点：幽灵依赖
```

**pnpm（硬链接）：**
```
时间复杂度：O(n)
空间复杂度：O(u)  # u=唯一文件数
优点：严格隔离 + 高效存储
```

### 缓存策略

**内容寻址存储：**
```bash
# 包的唯一标识
key = hash(包名 + 版本 + integrity)

# 缓存查找
~/.npm/_cacache/content-v2/${key[0:2]}/${key[2:4]}/${key}
```

**完整性验证：**
```javascript
// 伪代码
async function verifyPackage(tarball, expectedIntegrity) {
  const actualHash = await calculateSHA512(tarball);
  if (actualHash !== expectedIntegrity) {
    throw new Error('Integrity check failed');
  }
}
```

## 最佳实践

### 1. CI/CD 使用 npm ci

```yaml
# ✅ 推荐
steps:
  - run: npm ci

# ❌ 不推荐
steps:
  - run: npm install
```

### 2. 锁定 npm 版本

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 3. 使用 .npmrc 统一配置

```ini
# 项目 .npmrc
registry=https://registry.npmmirror.com
engine-strict=true
save-exact=false
```

### 4. 避免全局安装项目依赖

```bash
# ❌ 错误
npm install -g webpack

# ✅ 正确
npm install -D webpack
npx webpack
```

### 5. 定期清理缓存

```bash
# 每月清理一次
npm cache clean --force

# 或使用 npm-check
npx npm-check -u
```

## 参考资料

- [npm install 官方文档](https://docs.npmjs.com/cli/v9/commands/npm-install)
- [npm ci 文档](https://docs.npmjs.com/cli/v9/commands/npm-ci)
- [npm 缓存机制](https://docs.npmjs.com/cli/v9/commands/npm-cache)

---

**上一章：**[package-lock.json 锁文件机制](./content-7.md)  
**下一章：**[npm update 与依赖升级策略](./content-9.md)
