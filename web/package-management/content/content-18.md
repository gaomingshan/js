# Yarn PnP 的优势与挑战

## PnP 解决的问题

### 问题 1：node_modules 的膨胀

**传统项目**：
```bash
# 典型 React 项目
du -sh node_modules/
# 300 MB

# 文件数量
find node_modules/ -type f | wc -l
# 30,000+ 文件

# 目录数量
find node_modules/ -type d | wc -l
# 3,000+ 目录
```

**磁盘 I/O 开销**：
```
安装时间分布：
├── 下载 tarball：    30%
├── 解压：            40%  ← I/O 密集
└── 复制到 node_modules： 30%  ← I/O 密集
```

**PnP 解决**：
```bash
# 不创建 node_modules
.yarn/cache/
├── lodash-npm-4.17.21.zip    (100 KB)
├── react-npm-18.2.0.zip      (500 KB)
└── ...
总大小：50 MB（减少 83%）

# 文件数量
find .yarn/cache/ -type f | wc -l
# 500 文件（减少 98%）
```

### 问题 2：模块解析性能

**Node.js 传统解析**：
```javascript
require('lodash');

// 可能的查找路径
/path/to/project/src/node_modules/lodash
/path/to/project/node_modules/lodash  ← 找到
/path/to/node_modules/lodash
/path/node_modules/lodash
/node_modules/lodash

// 每个路径都需要：
1. fs.stat() 检查是否存在
2. 检查是文件还是目录
3. 如果是目录，查找 package.json
4. 解析 main 字段
```

**性能测试**：
```bash
# 冷启动（清除缓存）
node -e "require('lodash')"
# 传统：50ms
# PnP：   10ms（快 5 倍）
```

**PnP 解析**：
```javascript
// 直接查表
const location = packageRegistry.get('lodash').get('4.17.21').packageLocation;
// O(1) 复杂度，无 I/O
```

### 问题 3：幽灵依赖

**传统 node_modules**：
```javascript
// package.json（未声明 body-parser）
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 代码中可以访问
const bodyParser = require('body-parser');  // ✅ 能运行（危险）
```

**PnP 严格模式**：
```javascript
const bodyParser = require('body-parser');
// Error: body-parser is not declared in dependencies
```

**效果**：
- 强制显式声明依赖
- 防止隐性耦合
- 提升代码可维护性

---

## 性能提升量化分析

### 安装速度对比

**测试项目**：React 应用（200 个依赖）

**冷启动（清除缓存）**：
```
npm install:           180 秒
Yarn Classic:          120 秒（快 33%）
Yarn Berry PnP:        60 秒（快 67%）
pnpm:                  50 秒（快 72%）
```

**热启动（有缓存）**：
```
npm install:           30 秒
Yarn Classic:          20 秒
Yarn Berry PnP:        5 秒（快 83%）
pnpm:                  8 秒
```

**分析**：
```
PnP 优势：
1. 无需解压数万个文件
2. 只需更新 .pnp.cjs（几百 KB）
3. 直接使用 ZIP 缓存
```

### 磁盘占用对比

**单个项目**：
```
传统 node_modules:     300 MB
Yarn Berry PnP cache:  50 MB（减少 83%）
pnpm store:           50 MB（相近）
```

**多个项目（同样的依赖）**：
```
传统方式（5 个项目）:
project-a/node_modules: 300 MB
project-b/node_modules: 300 MB
project-c/node_modules: 300 MB
project-d/node_modules: 300 MB
project-e/node_modules: 300 MB
总计：1.5 GB

Yarn Berry（共享 cache）:
.yarn/cache: 50 MB（全局共享）
总计：50 MB（节省 97%）

pnpm（共享 store）:
~/.pnpm-store: 50 MB
总计：50 MB（相近）
```

### 模块解析性能

**基准测试**：
```javascript
// 测试代码
const start = Date.now();
for (let i = 0; i < 1000; i++) {
  require('lodash');
}
const end = Date.now();
console.log(`Time: ${end - start}ms`);
```

**结果**：
```
传统 node_modules:  150ms
PnP:                30ms（快 5 倍）
```

**原因**：
- PnP：内存中查表（O(1)）
- 传统：磁盘 I/O（多次 fs.stat）

---

## 生态兼容性问题

### 不兼容的工具

**React Native**：
```bash
# React Native Metro 不支持 PnP
yarn set version berry
yarn install

# 运行
yarn react-native start
# Error: Unable to resolve module lodash
```

**解决方案**：
```yaml
# .yarnrc.yml
nodeLinker: node-modules  # 禁用 PnP
```

**Electron**：
```javascript
// Electron 主进程不支持 PnP
const { app } = require('electron');

// 解决：使用 node_modules 模式
// 或打包时处理
```

**某些 Webpack 插件**：
```javascript
// 某些插件假设 node_modules 存在
const path = require('path');
const configPath = path.join(process.cwd(), 'node_modules', '.cache');
// PnP 下失败
```

### 需要适配的场景

**原生模块**：
```bash
# node-gyp 构建时查找头文件
node-gyp rebuild
# 可能找不到依赖的原生模块
```

**解决**：
```yaml
# .yarnrc.yml
supportedArchitectures:
  os: [linux, darwin, win32]
  cpu: [x64, arm64]
```

**Monorepo 工具**：
```bash
# Lerna 部分功能依赖 node_modules 结构
lerna bootstrap
# 可能不兼容 PnP
```

**替代方案**：
```bash
# 使用 Yarn Workspaces + Turborepo
yarn workspace @my-org/app build
```

### 兼容性列表

**完全兼容**：
- TypeScript
- ESLint
- Prettier
- Jest（配置后）
- Webpack 5+
- Next.js 12+

**部分兼容**：
- Create React App（需 eject）
- React Native（需 node_modules 模式）
- Electron（需特殊配置）

**不兼容**：
- 某些老旧工具
- 假设 node_modules 存在的脚本

---

## 何时选择 PnP vs node_modules

### 决策矩阵

**推荐使用 PnP**：
```
✅ 新项目（无历史包袱）
✅ 前端应用（React/Vue/Angular）
✅ TypeScript 项目
✅ Monorepo（性能优势明显）
✅ 追求极致性能
✅ 严格的依赖管理
```

**推荐使用 node_modules**：
```
⭕ React Native 项目
⭕ Electron 应用
⭕ 大量使用原生模块
⭕ 依赖不兼容工具
⭕ 团队不熟悉 PnP
⭕ 开源项目（降低贡献门槛）
```

### 项目类型建议

**前端 SPA**：
```yaml
# .yarnrc.yml
# 使用 PnP（推荐）
nodeLinker: pnp
pnpMode: strict
```

**Node.js 后端**：
```yaml
# 视情况而定
# 如果无兼容性问题 → PnP
# 否则 → node_modules
nodeLinker: node-modules
```

**全栈应用**：
```yaml
# 混合模式
# 前端用 PnP，后端用 node_modules
# 使用 Monorepo 分离
```

**库/组件**：
```yaml
# 推荐 node_modules
# 降低使用者门槛
nodeLinker: node-modules
```

---

## 常见误区

### 误区 1：PnP 一定更快

**反例**：小项目可能差异不大

**测试**：10 个依赖的项目
```
npm install:        5 秒
Yarn Berry PnP:     4 秒
差异：20%（不明显）
```

**结论**：PnP 的优势在大型项目中更明显

### 误区 2：PnP 完全替代 node_modules

**真相**：PnP 是可选模式，Yarn Berry 同时支持

**配置**：
```yaml
# .yarnrc.yml

# 选项 1：PnP（默认）
nodeLinker: pnp

# 选项 2：node_modules
nodeLinker: node-modules

# 选项 3：pnpm 风格（实验性）
nodeLinker: pnpm
```

### 误区 3：Zero-Installs 是必须的

**真相**：Zero-Installs 与 PnP 独立

**组合选择**：
```
PnP + Zero-Installs:    最激进
PnP + .gitignore cache: 平衡（推荐）
node_modules + 传统:     最保守
```

**.gitignore 配置**：
```bash
# 不使用 Zero-Installs
.yarn/cache/
.yarn/unplugged/
.yarn/build-state.yml
.yarn/install-state.gz
```

---

## 工程实践

### 场景 1：逐步迁移 PnP

**Step 1：启用 Loose 模式**
```yaml
# .yarnrc.yml
pnpMode: loose  # 允许未声明依赖（警告）
```

**Step 2：修复警告**
```bash
yarn install
# Warning: package-a tried to access body-parser, but it isn't declared

# 添加到 package.json
{
  "dependencies": {
    "body-parser": "^1.20.0"
  }
}
```

**Step 3：切换到 Strict 模式**
```yaml
# .yarnrc.yml
pnpMode: strict  # 严格模式
```

### 场景 2：处理不兼容工具

**问题**：某个构建工具不支持 PnP

**解决方案 1：插件**
```yaml
# .yarnrc.yml
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-compat.cjs
  
packageExtensions:
  some-tool@*:
    dependencies:
      required-dep: "*"
```

**解决方案 2：临时 node_modules**
```bash
# 为特定命令生成 node_modules
yarn node_modules

# 运行工具
some-incompatible-tool

# 删除 node_modules
rm -rf node_modules
```

### 场景 3：Monorepo PnP 优化

**问题**：大型 Monorepo，100+ 子包

**优化前**：
```
yarn install:      300 秒
磁盘占用：        5 GB
```

**启用 PnP**：
```yaml
# .yarnrc.yml
nodeLinker: pnp
enableGlobalCache: true
```

**优化后**：
```
yarn install:      60 秒（快 5 倍）
磁盘占用：        500 MB（减少 90%）
```

---

## 深入一点

### PnP 的权限模型

**依赖边界**：
```javascript
// package.json
{
  "name": "my-app",
  "dependencies": {
    "react": "^18.0.0"
  }
}

// 允许访问
require('react')          ✅
require('react/jsx-runtime') ✅（子路径）

// 禁止访问
require('react-dom')      ❌（未声明）
require('scheduler')      ❌（React 的依赖）
```

**实现**：
```javascript
// .pnp.cjs
function resolveToUnqualified(request, issuer) {
  const issuerPkg = locatePackage(issuer);
  const allowedDeps = issuerPkg.packageDependencies;
  
  if (!allowedDeps.has(request)) {
    throw new PnpError(
      `${issuerPkg.name} tried to access ${request}, ` +
      `but it isn't declared in its dependencies`
    );
  }
  
  return resolvePackage(request, allowedDeps.get(request));
}
```

### ZIP 包的性能优化

**直接读取 ZIP**：
```javascript
// Node.js 扩展
const fs = require('fs');

// Yarn 拦截 fs 调用
fs.readFileSync(
  '.yarn/cache/lodash-npm-4.17.21.zip/node_modules/lodash/index.js'
);

// 内部实现：
1. 定位 ZIP 文件
2. 查找 central directory
3. 解压特定条目（内存中）
4. 返回内容
```

**缓存策略**：
```javascript
const zipCache = new Map();

function readZipEntry(zipPath, entryPath) {
  if (!zipCache.has(zipPath)) {
    zipCache.set(zipPath, openZip(zipPath));
  }
  
  const zip = zipCache.get(zipPath);
  return zip.getEntry(entryPath);
}
```

### PnP 的安全性增强

**checksum 验证**：
```javascript
// .pnp.cjs
["lodash", [
  ["npm:4.17.21", {
    packageLocation: ".yarn/cache/lodash-npm-4.17.21-abc123.zip/...",
    packageChecksum: "sha512-abc123..."
  }]
]]

// 安装时验证
if (calculateChecksum(tarball) !== expectedChecksum) {
  throw new Error('Checksum mismatch!');
}
```

**供应链攻击防护**：
- 每个包的 checksum 锁定
- yarn.lock 提交到 Git
- 任何篡改都会被检测

---

## 参考资料

- [PnP 性能基准](https://yarnpkg.com/features/pnp#performance)
- [PnP 兼容性表](https://yarnpkg.com/features/pnp#compatibility-table)
- [迁移指南](https://yarnpkg.com/migration/pnp)
- [Plug'n'Play 规范](https://github.com/yarnpkg/berry/tree/master/packages/yarnpkg-pnp)
