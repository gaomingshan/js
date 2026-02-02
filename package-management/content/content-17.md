# Yarn Berry（v2+）架构革新

## Plug'n'Play（PnP）模式原理

### 传统 node_modules 的问题

**问题 1：磁盘 I/O 开销巨大**
```bash
# 典型 React 项目
node_modules/
├── 30,000+ 文件
├── 3,000+ 目录
└── 总大小：300 MB

# 安装时间分布
下载：30%
解压：40%  ← I/O 瓶颈
复制：30%  ← I/O 瓶颈
```

**问题 2：模块解析效率低**
```javascript
require('lodash');

// Node.js 查找路径（最坏情况）
/path/to/project/node_modules/lodash  ← 不存在
/path/to/project/node_modules/lodash.js
/path/to/project/node_modules/lodash.json
/path/to/node_modules/lodash
/path/node_modules/lodash
/node_modules/lodash  ← 找到！

// 可能需要检查 10+ 个路径
```

**问题 3：幽灵依赖无法避免**
```
node_modules/
├── express/
└── body-parser/  ← 提升，可被意外访问
```

### PnP 的核心思想

**理念**：不安装 node_modules，生成依赖映射表

**工作流程**：
```bash
yarn install

# 不创建 node_modules
# 而是生成 .pnp.cjs
```

**.pnp.cjs 内容**：
```javascript
const packageRegistry = new Map([
  ["lodash", [
    ["npm:4.17.21", {
      packageLocation: "./.yarn/cache/lodash-npm-4.17.21-abc123.zip/node_modules/lodash/",
      packageDependencies: new Map([
        ["lodash", "npm:4.17.21"]
      ])
    }]
  ]],
  ["express", [
    ["npm:4.18.0", {
      packageLocation: "./.yarn/cache/express-npm-4.18.0-def456.zip/node_modules/express/",
      packageDependencies: new Map([
        ["body-parser", "npm:1.20.0"],
        ["cookie", "npm:0.5.0"]
      ])
    }]
  ]]
]);
```

**解析逻辑**：
```javascript
// 替代 Node.js 的模块解析
function resolveModule(request, issuer) {
  // 1. 查找调用者的包
  const issuerPkg = findPackageForPath(issuer);
  
  // 2. 检查是否在依赖列表中
  const dependencies = issuerPkg.packageDependencies;
  if (!dependencies.has(request)) {
    throw new Error(`Package '${request}' is not declared in dependencies`);
  }
  
  // 3. 获取实际位置
  const version = dependencies.get(request);
  const pkgInfo = packageRegistry.get(request).get(version);
  
  return pkgInfo.packageLocation;
}
```

---

## .pnp.cjs 文件结构

### 完整结构

```javascript
// .pnp.cjs
#!/usr/bin/env node

/* eslint-disable */

const {fileURLToPath} = require('url');
const path = require('path');

// 包注册表
const packageRegistryData = [
  [null, [
    [null, {
      packageLocation: path.resolve(__dirname, "./"),
      packageDependencies: new Map([
        ["express", "npm:4.18.0"],
        ["lodash", "npm:4.17.21"]
      ]),
      linkType: "SOFT"
    }]
  ]],
  ["lodash", [
    ["npm:4.17.21", {
      packageLocation: path.resolve(__dirname, "./.yarn/cache/lodash-npm-4.17.21-abc.zip/node_modules/lodash/"),
      packageDependencies: new Map([
        ["lodash", "npm:4.17.21"]
      ]),
      linkType: "HARD"
    }]
  ]],
  // ... 更多包
];

// 解析器
function setupModule(module, require) {
  module.exports = {
    resolveToUnqualified: resolveToUnqualified,
    resolveRequest: resolveRequest,
    resolveVirtual: resolveVirtual
  };
}

// 注册解析器（劫持 require）
require('module').Module._resolveFilename = /* 自定义逻辑 */;

setupModule(module, require);
```

### 关键字段

**packageLocation**：
```javascript
packageLocation: "./.yarn/cache/lodash-npm-4.17.21-abc.zip/node_modules/lodash/"
```
- 指向 ZIP 包内的目录
- Yarn 可以直接读取 ZIP 内容（无需解压）

**packageDependencies**：
```javascript
packageDependencies: new Map([
  ["body-parser", "npm:1.20.0"],
  ["cookie", "npm:0.5.0"]
])
```
- 声明该包可以访问的依赖
- 严格的依赖边界

**linkType**：
```javascript
linkType: "HARD"  // 真实依赖
linkType: "SOFT"  // peer dependency
```

---

## Zero-Installs 理念

### 核心概念

**传统流程**：
```bash
git clone repo
npm install  ← 耗时 5 分钟
npm run build
```

**Zero-Installs**：
```bash
git clone repo
# .yarn/cache/ 已提交到 Git
npm run build  ← 直接运行
```

### 实现机制

**目录结构**：
```
.yarn/
├── cache/
│   ├── lodash-npm-4.17.21-abc123.zip  ← 提交到 Git
│   ├── react-npm-18.2.0-def456.zip
│   └── express-npm-4.18.0-ghi789.zip
├── releases/
│   └── yarn-3.4.1.cjs  ← Yarn 本身也提交
└── sdk/  ← IDE 支持
.pnp.cjs  ← 提交到 Git
.yarnrc.yml
```

**.gitignore**：
```
# 传统方式
node_modules/

# Zero-Installs（反直觉）
# .yarn/cache/ 不在 .gitignore 中
```

### 优势与争议

**优势**：
```
1. 克隆即可用（无需 npm install）
2. CI 构建快（无依赖下载）
3. 离线可用
4. 历史可追溯（依赖变更在 Git 历史中）
```

**争议**：
```
1. Git 仓库体积巨大（增加数百 MB）
2. 代码审查困难（二进制 ZIP）
3. Git 性能下降（大文件处理）
4. 磁盘占用（每个分支都包含 cache）
```

**适用场景**：
- 小型项目（依赖少）
- 企业内网（Git 服务器性能好）
- 需要极致构建速度

**不适用**：
- 开源项目（贡献者克隆成本高）
- 大型 Monorepo（cache 可能数 GB）

---

## 向后兼容策略

### node_modules 模式

**问题**：某些工具不支持 PnP

**解决**：
```yaml
# .yarnrc.yml
nodeLinker: node-modules  # 使用传统 node_modules
```

**效果**：
```bash
yarn install
# 生成 node_modules/（类似 npm）
# 不生成 .pnp.cjs
```

### PnP Loose 模式

**问题**：PnP 严格模式阻止访问未声明依赖

**解决**：
```yaml
# .yarnrc.yml
pnpMode: loose
```

**效果**：
```javascript
// 即使未声明，也允许访问
const bodyParser = require('body-parser');  // 不报错（警告）
```

**适用**：逐步迁移到 PnP

### PnP 兼容性补丁

**问题**：某些包假设 node_modules 存在

**示例**：
```javascript
// 某些包的代码
const configPath = path.join(process.cwd(), 'node_modules', '.cache', 'config.json');
// PnP 下，node_modules 不存在
```

**解决**：
```yaml
# .yarnrc.yml
packageExtensions:
  webpack@*:
    dependencies:
      webpack-cli: "*"  # 添加缺失依赖
```

---

## 常见误区

### 误区 1：PnP 只是更快的安装

**真相**：PnP 的核心是**严格的依赖管理**，速度是副产品

**严格性示例**：
```javascript
// package.json（未声明 lodash）
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 代码
const _ = require('lodash');

// node_modules 模式：可能可用（幽灵依赖）
// PnP 模式：Error: lodash is not declared in dependencies
```

### 误区 2：Zero-Installs 适合所有项目

**误区**：提交 .yarn/cache/ 是最佳实践

**真相**：需权衡

**小型项目**：
```
依赖：50 个包，30 MB
Git 仓库增加：30 MB ✅ 可接受
```

**大型项目**：
```
依赖：500 个包，300 MB
Git 仓库增加：300 MB ❌ 过大

推荐：
.gitignore:
.yarn/cache/
```

### 误区 3：PnP 解决了所有问题

**兼容性问题**：
```
不支持 PnP 的工具：
- React Native
- Electron
- 某些 Webpack 插件
- 某些 Jest 配置
```

**解决**：
```yaml
# 针对性禁用
pnpMode: loose

# 或使用 node_modules
nodeLinker: node-modules
```

---

## 工程实践

### 场景 1：迁移到 Yarn Berry PnP

**步骤**：
```bash
# 1. 安装 Yarn Berry
yarn set version berry

# 2. 启用 PnP（默认启用）
# .yarnrc.yml 自动生成

# 3. 删除 node_modules
rm -rf node_modules

# 4. 安装依赖
yarn install
# 生成 .pnp.cjs

# 5. 测试
yarn build
yarn test

# 6. 可能需要修复兼容性
# .yarnrc.yml
packageExtensions:
  some-package@*:
    dependencies:
      missing-dep: "*"
```

### 场景 2：IDE 支持

**VSCode**：
```bash
# 生成 SDK
yarn dlx @yarnpkg/sdks vscode

# 生成文件
.vscode/
├── extensions.json
├── settings.json
└── ...
```

**settings.json**：
```json
{
  "typescript.tsdk": ".yarn/sdks/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

**效果**：
- TypeScript 识别 PnP 解析
- 自动完成正常工作

### 场景 3：CI 配置

**GitHub Actions（Zero-Installs）**：
```yaml
- name: Checkout
  uses: actions/checkout@v3

# 无需 yarn install（已在 Git 中）

- name: Build
  run: yarn build
```

**GitHub Actions（传统模式）**：
```yaml
- name: Cache Yarn
  uses: actions/cache@v3
  with:
    path: .yarn/cache
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}

- name: Install
  run: yarn install --immutable

- name: Build
  run: yarn build
```

---

## 深入一点

### PnP 的模块解析算法

**伪代码**：
```javascript
function resolvePnP(request, issuer) {
  // 1. 查找调用者所属的包
  const issuerPkg = locatePackage(issuer);
  
  // 2. 查找依赖映射
  const deps = packageRegistry
    .get(issuerPkg.name)
    .get(issuerPkg.reference)
    .packageDependencies;
  
  // 3. 检查权限
  if (!deps.has(request)) {
    throw new PnpApiError(`${issuerPkg.name} tried to access ${request}, but it isn't declared in its dependencies`);
  }
  
  // 4. 解析到实际路径
  const targetVersion = deps.get(request);
  const targetPkg = packageRegistry.get(request).get(targetVersion);
  
  return targetPkg.packageLocation;
}
```

### ZIP 包直接读取

**Node.js 集成**：
```javascript
// Yarn 扩展了 fs 模块
const fs = require('fs');

// 直接读取 ZIP 内文件
const content = fs.readFileSync(
  '.yarn/cache/lodash-npm-4.17.21.zip/node_modules/lodash/index.js',
  'utf8'
);

// Yarn 自动处理 ZIP 解压（内存中）
```

**性能影响**：
```
传统：读取 30,000 个文件（I/O 密集）
PnP：读取 100 个 ZIP 文件（更快）

冷启动：PnP 快 2-3 倍
热启动（缓存）：相近
```

### Yarn Berry 的架构演进

**Yarn 1.x（Classic）**：
- 基于 npm 架构
- node_modules
- JavaScript 实现

**Yarn 2+（Berry）**：
- 完全重写
- 插件化架构
- PnP 核心
- TypeScript 实现

**插件系统**：
```yaml
# .yarnrc.yml
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
```

---

## 参考资料

- [Yarn Berry 官方文档](https://yarnpkg.com/)
- [PnP 规范](https://yarnpkg.com/features/pnp)
- [Zero-Installs](https://yarnpkg.com/features/zero-installs)
- [迁移指南](https://yarnpkg.com/migration/guide)
