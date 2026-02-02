# 依赖提升与去重

## 提升规则与冲突处理

### 提升算法

**npm v3+ 的扁平化算法**：
```javascript
function hoistDependencies(tree) {
  const hoisted = new Map();
  
  function tryHoist(pkg, depth = 0) {
    const key = pkg.name;
    
    if (!hoisted.has(key)) {
      // 首次遇到，提升到顶层
      hoisted.set(key, pkg.version);
      return { hoisted: true, level: 0 };
    }
    
    const existingVersion = hoisted.get(key);
    
    if (existingVersion === pkg.version) {
      // 版本相同，共享
      return { hoisted: true, level: 0 };
    }
    
    if (semver.satisfies(existingVersion, pkg.spec)) {
      // 已提升版本满足要求，共享
      return { hoisted: true, level: 0 };
    }
    
    // 版本冲突，保持嵌套
    return { hoisted: false, level: depth };
  }
  
  // 深度优先遍历
  traverse(tree, tryHoist);
  
  return hoisted;
}
```

### 提升顺序的影响

**package.json 声明顺序**：
```json
{
  "dependencies": {
    "package-a": "1.0.0",  // 先声明
    "package-b": "1.0.0"
  }
}
```

**场景**：
```
package-a → lodash@^4.17.0
package-b → lodash@^4.16.0
```

**结果 A**（package-a 先处理）：
```
node_modules/
├── lodash@4.17.21  (满足 package-a)
└── package-b/
    └── node_modules/
        └── lodash@4.16.6  (package-b 需要嵌套)
```

**结果 B**（package-b 先处理）：
```
node_modules/
├── lodash@4.16.6  (满足 package-b)
└── package-a/
    └── node_modules/
        └── lodash@4.17.21  (package-a 需要嵌套)
```

**锁文件保证一致性**：
```json
// package-lock.json 记录确定的提升结果
{
  "lodash": {
    "version": "4.17.21"  // 固定在顶层
  }
}
```

---

## shamefully-hoist 配置

### pnpm 的严格隔离

**默认行为**：
```
node_modules/
├── .pnpm/
│   ├── express@4.18.0/
│   │   └── node_modules/
│   │       ├── express/
│   │       └── body-parser@  # 只有 express 能访问
│   └── body-parser@1.20.0/
└── express@  → .pnpm/express@4.18.0/node_modules/express
```

**问题**：某些工具假设扁平化
```javascript
// 某些 Webpack 插件
const configPath = path.join(process.cwd(), 'node_modules', '.cache');
// pnpm 下，node_modules 结构不同，找不到
```

### shamefully-hoist 选项

**配置**（.npmrc）：
```
shamefully-hoist=true
```

**效果**：
```
node_modules/
├── .pnpm/
├── express/  # 符号链接
├── body-parser/  # 提升（幽灵依赖）
├── cookie/  # 提升
└── ...
```

**权衡**：
- ✅ 兼容性提升
- ❌ 失去严格隔离
- ❌ 幽灵依赖重现

### public-hoist-pattern

**更精确的控制**（.npmrc）：
```
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
```

**效果**：
```
node_modules/
├── eslint/  # 提升
├── prettier/  # 提升
├── @types/
│   ├── node/  # 提升
│   └── react/  # 提升
├── .pnpm/
└── express@  # 其他包仍然隔离
```

---

## 公共依赖的版本统一

### 问题识别

**检测版本不一致**：
```bash
npm ls lodash

# 输出：
# my-app@1.0.0
# ├── lodash@4.17.21
# ├─┬ package-a@1.0.0
# │ └── lodash@4.17.20
# └─┬ package-b@1.0.0
#   └── lodash@4.17.21 deduped
```

**统计**：
```bash
# 使用 npm-check-duplicates
npx npm-check-duplicates

# 输出：
# lodash
# ├─ 4.17.20 (1 instance)
# └─ 4.17.21 (2 instances)
# 
# Total duplicate packages: 1
# Wasted disk space: 500 KB
```

### 解决方案

**方案 1：npm dedupe**
```bash
npm dedupe

# 算法：
# 1. 分析依赖树
# 2. 找到可以共享的版本
# 3. 移除重复，使用符号链接
```

**优化前**：
```
node_modules/
├── lodash@4.17.21
├── package-a/
│   └── node_modules/
│       └── lodash@4.17.20
└── package-b/
    └── node_modules/
        └── lodash@4.17.21  # 重复
```

**优化后**：
```
node_modules/
├── lodash@4.17.21  # 共享
├── package-a/
│   └── node_modules/
│       └── lodash@4.17.20  # 必须保留（版本不同）
└── package-b/  # 使用顶层的 lodash
```

**方案 2：升级依赖**
```bash
# 升级 package-a 到兼容新版本
npm update package-a

# 或强制统一版本
npm install lodash@4.17.21
```

**方案 3：使用 overrides**
```json
{
  "overrides": {
    "lodash": "4.17.21"  # 强制所有依赖使用此版本
  }
}
```

### Monorepo 版本统一

**工具：syncpack**
```bash
# 检查不一致
npx syncpack list-mismatches

# 输出：
# react
# ├─ 18.2.0 in packages/web
# ├─ 18.1.0 in packages/admin
# └─ 18.0.0 in packages/mobile

# 自动修复
npx syncpack fix-mismatches
```

**配置**（.syncpackrc.json）：
```json
{
  "source": ["package.json", "packages/*/package.json"],
  "semverGroups": [
    {
      "label": "Use exact versions for React",
      "dependencies": ["react", "react-dom"],
      "packages": ["**"],
      "range": ""
    }
  ],
  "versionGroups": [
    {
      "label": "Pin all packages to 18.2.0",
      "dependencies": ["react", "react-dom"],
      "pinVersion": "18.2.0"
    }
  ]
}
```

---

## 提升带来的隐患

### 隐患 1：幽灵依赖

**问题**：
```javascript
// package.json 未声明 moment
{
  "dependencies": {
    "some-lib": "^1.0.0"  // 依赖 moment
  }
}

// 代码中使用
const moment = require('moment');  // 能运行（危险）
```

**风险**：
```bash
# some-lib 升级，移除对 moment 的依赖
npm update some-lib

# 代码崩溃
Error: Cannot find module 'moment'
```

### 隐患 2：版本分歧

**问题**：
```
开发者 A 安装顺序：package-a → package-b
→ lodash@4.17.21 提升

开发者 B 安装顺序：package-b → package-a
→ lodash@4.16.6 提升

代码行为可能不同
```

**缓解**：
```bash
# 使用锁文件
git add package-lock.json

# CI 严格检查
npm ci  # 而不是 npm install
```

### 隐患 3：包大小膨胀

**问题**：
```
打包时可能包含多个版本：
bundle.js 包含：
├── lodash@4.17.21 (顶层)
└── lodash@4.16.6 (嵌套)

总大小：50 KB + 50 KB = 100 KB
```

**检测**：
```bash
# Webpack Bundle Analyzer
npx webpack-bundle-analyzer dist/stats.json

# 输出：
# lodash@4.17.21: 50 KB
# lodash@4.16.6: 50 KB (duplicate!)
```

**解决**：
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      lodash: require.resolve('lodash')  // 强制使用同一个
    }
  }
};
```

---

## 常见误区

### 误区 1：提升总是有益的

**反例**：某些包依赖特定版本

```javascript
// package-a 依赖 lodash@4.17.20 的特定 bug
// （虽然不推荐，但现实中存在）

// 强制提升到 4.17.21
npm dedupe

// package-a 崩溃
```

**教训**：提升前充分测试

### 误区 2：dedupe 是无损操作

**风险**：
```bash
npm dedupe

# 可能改变依赖解析结果
# 某些包可能使用不同版本的依赖
```

**安全做法**：
```bash
# 1. 在分支上尝试
git checkout -b dedupe-test
npm dedupe

# 2. 运行测试
npm test

# 3. 检查差异
git diff package-lock.json

# 4. 确认无问题后合并
```

### 误区 3：pnpm 不需要去重

**真相**：pnpm 自动去重，但仍可能有多版本

**场景**：
```json
{
  "dependencies": {
    "pkg-a": "^1.0.0",  // 依赖 lodash@^4.17.0
    "pkg-b": "^1.0.0"   // 依赖 lodash@^3.10.0
  }
}
```

**结果**：
```
.pnpm/
├── lodash@4.17.21/  # 新版本
└── lodash@3.10.1/   # 旧版本（必须保留）
```

---

## 工程实践

### 场景 1：优化依赖树

**步骤**：
```bash
# 1. 分析当前状态
npm ls --depth=0
npm-check-duplicates

# 2. 去重
npm dedupe

# 3. 检查效果
npm ls --depth=0
du -sh node_modules/

# 4. 测试
npm test
npm run build

# 5. 提交
git add package-lock.json
git commit -m "chore: dedupe dependencies"
```

### 场景 2：Monorepo 版本统一流程

**配置**：
```json
// package.json
{
  "scripts": {
    "check:versions": "syncpack list-mismatches",
    "fix:versions": "syncpack fix-mismatches",
    "validate": "npm run check:versions && npm run lint && npm run test"
  }
}
```

**CI 检查**：
```yaml
# .github/workflows/ci.yml
- name: Check dependency versions
  run: npm run check:versions

- name: Fail on mismatches
  run: |
    MISMATCHES=$(npm run check:versions 2>&1)
    if [ -n "$MISMATCHES" ]; then
      echo "Version mismatches found!"
      exit 1
    fi
```

### 场景 3：打包优化

**Webpack 配置**：
```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html'
    })
  ],
  
  resolve: {
    alias: {
      // 统一版本
      'lodash': path.resolve(__dirname, 'node_modules/lodash'),
      'moment': path.resolve(__dirname, 'node_modules/moment')
    }
  },
  
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

---

## 深入一点

### 提升算法的复杂度

**理论分析**：
```
输入：依赖树，N 个包
输出：扁平化的 node_modules

最坏情况：
- 每个包都有不同版本的依赖
- 无法提升
- 复杂度：O(N^2)

最好情况：
- 所有包版本兼容
- 完全提升
- 复杂度：O(N)

实际：O(N × D)，D 为平均依赖深度
```

**优化技术**：
```javascript
// 缓存已处理的包
const cache = new Map();

function hoist(pkg) {
  const key = `${pkg.name}@${pkg.version}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = performHoist(pkg);
  cache.set(key, result);
  return result;
}
```

### 不同包管理器的去重策略

**npm**：
```
策略：扁平化 + dedupe 命令
去重率：约 60-70%
```

**Yarn Classic**：
```
策略：自动扁平化
去重率：约 70-80%
```

**pnpm**：
```
策略：内容寻址存储 + 硬链接
去重率：约 80-90%（跨项目）
```

**对比**：
```
项目大小：300 MB
npm:        300 MB × 3 项目 = 900 MB
Yarn:       300 MB × 3 × 0.7 = 630 MB
pnpm:       300 MB + (3 × 10 MB) = 330 MB
```

### 提升对性能的影响

**模块解析**：
```javascript
// 扁平化
require('lodash')
→ ./node_modules/lodash
   (1 次 fs 查找)

// 嵌套
require('lodash')
→ ./node_modules/lodash (不存在)
→ ../node_modules/lodash (不存在)
→ ../../node_modules/lodash (找到)
   (3 次 fs 查找)
```

**基准测试**：
```
扁平化：require 耗时 0.5ms
嵌套：   require 耗时 1.5ms

但扁平化的安装时间更长：
扁平化安装：60s
嵌套安装：   40s
```

---

## 参考资料

- [npm dedupe 文档](https://docs.npmjs.com/cli/v9/commands/npm-dedupe)
- [pnpm 提升配置](https://pnpm.io/npmrc#public-hoist-pattern)
- [syncpack](https://github.com/JamieMason/syncpack)
- [依赖提升的权衡](https://blog.npmjs.org/post/621733939456933888/npm-v7-series-why-keep-package-lockjson)
