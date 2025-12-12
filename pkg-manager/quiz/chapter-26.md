# 第 26 章：依赖分析与优化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 依赖树分析

### 题目

查看项目完整依赖树的命令是什么？

**选项：**
- A. npm list
- B. npm ls --all
- C. npm list --depth=Infinity
- D. A 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**依赖树查看**

#### npm list

```bash
# 显示所有依赖（默认深度）
npm list

# 指定深度
npm list --depth=0  # 只显示直接依赖
npm list --depth=2  # 显示2层

# 完整树
npm list --depth=Infinity
npm list --all
```

#### 不同包管理器

**npm：**
```bash
npm list --depth=Infinity
```

**yarn：**
```bash
yarn list --depth=0
```

**pnpm：**
```bash
pnpm list --depth=Infinity
```

#### 输出格式

```
my-app@1.0.0
├── react@18.2.0
│   └── loose-envify@1.4.0
│       └── js-tokens@4.0.0
└── lodash@4.17.21
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 重复依赖

### 题目

npm dedupe 可以去除重复的依赖。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm dedupe 命令**

#### 基本用法

```bash
npm dedupe
# 或
npm ddp
```

**去重优化 node_modules**

#### 工作原理

**去重前：**
```
node_modules/
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.21
├── pkg-b/
│   └── node_modules/
│       └── lodash@4.17.21
└── lodash@4.17.20
```

**去重后：**
```
node_modules/
├── pkg-a/
├── pkg-b/
└── lodash@4.17.21  ← 提升
```

#### 使用场景

```bash
# 安装后优化
npm install
npm dedupe

# 减少磁盘占用
# 加快安装速度
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 依赖大小

### 题目

查看包大小的工具是什么？

**选项：**
- A. npm-size
- B. bundlephobia
- C. package-size
- D. size-check

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**包大小分析工具**

#### Bundlephobia

**网站：** https://bundlephobia.com

```bash
# 查询包大小
# 在网站输入包名

# 显示：
# - Minified size: 压缩后大小
# - Gzipped size: gzip后大小
# - Dependencies: 依赖数量
# - 下载时间
```

#### CLI 工具

```bash
# 安装
npm install -g bundle-size

# 使用
bundle-size lodash
# Size: 72.48 KB
# Gzipped: 25.42 KB
```

#### package-phobia

```bash
npx package-phobia lodash

# 显示：
# Install size: 1.4 MB
# Publish size: 544 KB
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 依赖分析工具

### 题目

常用的依赖分析工具有哪些？

**选项：**
- A. depcheck
- B. npm-check
- C. webpack-bundle-analyzer
- D. source-map-explorer

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**依赖分析工具集**

#### A. depcheck ✅

**检查未使用的依赖：**
```bash
npx depcheck

# 输出：
# Unused dependencies
# * lodash
# * moment
#
# Missing dependencies
# * axios (used in src/api.js)
```

#### B. npm-check ✅

**检查过期和未使用：**
```bash
npx npm-check

# 交互式界面
# ❯ ◯ lodash  (unused)
#   ◯ axios    (update available)
```

#### C. webpack-bundle-analyzer ✅

**分析打包体积：**
```bash
npm install -D webpack-bundle-analyzer
```

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

**生成可视化报告**

#### D. source-map-explorer ✅

**分析 bundle 组成：**
```bash
npx source-map-explorer build/static/js/*.js

# 显示每个包占用的大小
```

#### 完整工作流

```bash
# 1. 检查未使用
npx depcheck

# 2. 检查更新
npx npm-check -u

# 3. 分析打包
npm run build
npx source-map-explorer build/**/*.js

# 4. 优化
# - 移除未使用的包
# - 更新过期包
# - 替换大包
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 循环依赖

### 题目

如何检测项目中的循环依赖？

**选项：**
- A. madge
- B. dpdm
- C. circular-dependency-plugin
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**循环依赖检测**

#### A. madge ✅

```bash
# 安装
npm install -g madge

# 检测循环依赖
madge --circular src/

# 输出：
# Circular dependencies:
# src/a.js > src/b.js > src/a.js
```

**可视化：**
```bash
madge --circular --image graph.png src/
```

#### B. dpdm ✅

```bash
npx dpdm --circular src/index.js

# 输出：
# Circular dependencies:
# src/a.js -> src/b.js -> src/a.js
```

#### C. circular-dependency-plugin ✅

```javascript
// webpack.config.js
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false
    })
  ]
};
```

**构建时检测**

#### 示例循环依赖

**a.js：**
```javascript
import { funcB } from './b.js';

export function funcA() {
  return funcB();
}
```

**b.js：**
```javascript
import { funcA } from './a.js';

export function funcB() {
  return funcA();  // 循环！
}
```

**检测结果：**
```
⚠️ Circular: a.js -> b.js -> a.js
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 树摇优化

### 题目

Tree Shaking 主要依赖什么特性？

**选项：**
- A. CommonJS
- B. ES Modules
- C. AMD
- D. UMD

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Tree Shaking 原理**

#### ES Modules 静态结构

**可以 Tree Shake（ES Modules）：**
```javascript
// utils.js
export function add(a, b) { return a + b; }
export function sub(a, b) { return a - b; }

// main.js
import { add } from './utils.js';  // 只导入 add

// 打包后：sub 被移除 ✅
```

**不能 Tree Shake（CommonJS）：**
```javascript
// utils.js
module.exports = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b
};

// main.js
const { add } = require('./utils.js');

// 打包后：整个对象都包含 ❌
```

#### 为什么？

**ES Modules：**
- 静态导入/导出
- 编译时确定
- 可分析依赖关系

**CommonJS：**
- 动态 require
- 运行时确定
- 无法静态分析

#### 最佳实践

```javascript
// ✅ 使用命名导出
export function func1() {}
export function func2() {}

// ❌ 避免默认导出对象
export default {
  func1,
  func2
};
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 依赖替换

### 题目

如何用更小的包替换 moment.js？

**选项：**
- A. date-fns
- B. dayjs
- C. luxon
- D. 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Moment.js 替代方案**

#### 体积对比

| 包 | Minified | Gzipped |
|---|----------|---------|
| **moment** | 289 KB | 72 KB |
| **date-fns** | 78 KB | 13 KB |
| **dayjs** | 7 KB | 3 KB |
| **luxon** | 73 KB | 23 KB |

#### A. date-fns ✅

```javascript
// 替换前（moment）
import moment from 'moment';
const date = moment().format('YYYY-MM-DD');

// 替换后（date-fns）
import { format } from 'date-fns';
const date = format(new Date(), 'yyyy-MM-dd');
```

**特点：**
- 函数式
- Tree-shakable
- 不可变

#### B. dayjs ✅

```javascript
// 替换（dayjs）
import dayjs from 'dayjs';
const date = dayjs().format('YYYY-MM-DD');
```

**特点：**
- API 兼容 moment
- 极小体积
- 插件系统

#### C. luxon ✅

```javascript
// 替换（luxon）
import { DateTime } from 'luxon';
const date = DateTime.now().toFormat('yyyy-MM-dd');
```

**特点：**
- 现代 API
- 国际化
- 时区支持

#### 迁移建议

**1. 评估使用情况：**
```bash
# 查找 moment 使用
grep -r "moment()" src/
```

**2. 选择替代：**
- 简单场景 → dayjs
- 复杂场景 → date-fns
- 时区重度 → luxon

**3. 渐进迁移：**
```javascript
// 保留 moment，逐步替换
import moment from 'moment';
import dayjs from 'dayjs';

// 新代码用 dayjs
const newDate = dayjs();
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 依赖优化策略

### 题目

如何系统性地优化项目依赖？

<details>
<summary>查看答案</summary>

### ✅ 答案

**依赖优化完整方案**

#### 1. 分析现状

```bash
# 安装分析工具
npm install -g depcheck npm-check madge

# 检查未使用
depcheck

# 检查过期
npm-check -u

# 检查循环依赖
madge --circular src/

# 分析体积
npx source-map-explorer build/**/*.js
```

#### 2. 移除未使用

```bash
# depcheck 输出
Unused dependencies:
* lodash
* moment
* jquery

# 移除
npm uninstall lodash moment jquery
```

#### 3. 替换大包

**moment → dayjs：**
```bash
npm uninstall moment
npm install dayjs

# 体积：289KB → 7KB
```

**lodash → lodash-es：**
```javascript
// 替换前
import _ from 'lodash';

// 替换后
import { debounce, throttle } from 'lodash-es';
```

**webpack-dev-server → vite：**
```bash
# 开发服务器优化
npm uninstall webpack webpack-dev-server
npm install -D vite

# 启动速度：10s → 0.5s
```

#### 4. 按需导入

**Ant Design：**
```javascript
// ❌ 全量导入
import { Button } from 'antd';

// ✅ 按需导入
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
```

**或使用插件：**
```javascript
// babel.config.js
plugins: [
  ['import', {
    libraryName: 'antd',
    style: true
  }]
]
```

#### 5. 代码分割

```javascript
// 路由懒加载
const Home = () => import('./pages/Home');
const About = () => import('./pages/About');

// 组件懒加载
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

#### 6. 优化配置

**webpack：**
```javascript
module.exports = {
  optimization: {
    usedExports: true,      // Tree shaking
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          priority: -10
        }
      }
    }
  }
};
```

#### 7. 监控优化效果

**优化前后对比：**
```bash
# 优化前
Bundle size: 2.5 MB
Gzipped: 800 KB
Dependencies: 450
Load time: 5s

# 优化后
Bundle size: 500 KB  ⬇️ 80%
Gzipped: 150 KB      ⬇️ 81%
Dependencies: 120    ⬇️ 73%
Load time: 1.2s      ⬇️ 76%
```

### 📖 解析

**优化清单**

- ✅ 移除未使用依赖
- ✅ 替换大包为小包
- ✅ 按需导入
- ✅ 代码分割
- ✅ Tree Shaking
- ✅ 持续监控

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 重复依赖问题

### 题目

如何解决同一个包多个版本的问题？

<details>
<summary>查看答案</summary>

### ✅ 答案

**重复版本解决方案**

#### 1. 检测问题

```bash
npm list lodash

# 输出：
# ├─┬ pkg-a
# │ └── lodash@4.17.20
# └─┬ pkg-b
#   └── lodash@4.17.21
```

**两个不同版本**

#### 2. 分析原因

```bash
# 查看依赖链
npm why lodash

# pkg-a@1.0.0
# └── lodash@^4.17.20
#
# pkg-b@2.0.0
# └── lodash@^4.17.21
```

#### 3. 解决方案

**方案 A：统一版本（package.json）**
```json
{
  "dependencies": {
    "lodash": "4.17.21"
  },
  "resolutions": {
    "lodash": "4.17.21"
  }
}
```

**方案 B：使用 overrides（npm 8.3+）**
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

**方案 C：pnpm overrides**
```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
```

**方案 D：Yarn resolutions**
```json
{
  "resolutions": {
    "lodash": "4.17.21",
    "**/lodash": "4.17.21"
  }
}
```

#### 4. 验证

```bash
# 重新安装
rm -rf node_modules package-lock.json
npm install

# 检查
npm list lodash

# 输出（只有一个版本）：
# └── lodash@4.17.21
```

#### 5. 自动化脚本

```javascript
// scripts/check-duplicates.js
const { execSync } = require('child_process');

// 检查重复依赖
const output = execSync('npm list --json --depth=Infinity').toString();
const tree = JSON.parse(output);

const versions = {};

function traverse(node, path = []) {
  if (!node.dependencies) return;
  
  for (const [name, info] of Object.entries(node.dependencies)) {
    const version = info.version;
    
    if (!versions[name]) {
      versions[name] = new Set();
    }
    
    versions[name].add(version);
  }
}

traverse(tree);

// 输出重复
const duplicates = Object.entries(versions)
  .filter(([name, vers]) => vers.size > 1)
  .map(([name, vers]) => ({
    package: name,
    versions: Array.from(vers)
  }));

if (duplicates.length > 0) {
  console.log('⚠️ 发现重复依赖：\n');
  duplicates.forEach(({ package: pkg, versions }) => {
    console.log(`  ${pkg}:`);
    versions.forEach(v => console.log(`    - ${v}`));
  });
  process.exit(1);
}

console.log('✅ 无重复依赖');
```

### 📖 解析

**最佳实践**

1. **预防为主** - 定期检查
2. **统一版本** - 使用 overrides
3. **自动化** - CI 中检测
4. **监控** - 持续跟踪

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 依赖健康度

### 题目

实现一个依赖健康度检查工具。

<details>
<summary>查看答案</summary>

### ✅ 答案

**依赖健康度检查工具**

```javascript
// scripts/dependency-health.js
const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

class DependencyHealthChecker {
  constructor() {
    this.pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.report = {
      score: 100,
      issues: [],
      suggestions: []
    };
  }

  // 检查过期依赖
  async checkOutdated() {
    try {
      const output = execSync('npm outdated --json').toString();
      const outdated = JSON.parse(output || '{}');
      
      const count = Object.keys(outdated).length;
      
      if (count > 0) {
        this.report.score -= count * 2;
        this.report.issues.push({
          type: 'outdated',
          severity: 'medium',
          count,
          packages: Object.keys(outdated)
        });
        this.report.suggestions.push('运行 npm update 更新依赖');
      }
    } catch (e) {
      // outdated 返回 1，但有输出
    }
  }

  // 检查未使用依赖
  checkUnused() {
    try {
      const output = execSync('npx depcheck --json').toString();
      const result = JSON.parse(output);
      
      const unused = result.dependencies || [];
      
      if (unused.length > 0) {
        this.report.score -= unused.length * 5;
        this.report.issues.push({
          type: 'unused',
          severity: 'high',
          count: unused.length,
          packages: unused
        });
        this.report.suggestions.push(`移除未使用的包：${unused.join(', ')}`);
      }
    } catch (e) {
      console.warn('⚠️ depcheck 失败');
    }
  }

  // 检查安全漏洞
  async checkSecurity() {
    try {
      const output = execSync('npm audit --json').toString();
      const audit = JSON.parse(output);
      
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      const total = Object.values(vulnerabilities).reduce((sum, n) => sum + n, 0);
      
      if (total > 0) {
        this.report.score -= total * 10;
        this.report.issues.push({
          type: 'security',
          severity: 'critical',
          count: total,
          details: vulnerabilities
        });
        this.report.suggestions.push('运行 npm audit fix 修复漏洞');
      }
    } catch (e) {
      // audit 有问题时返回 1
    }
  }

  // 检查大包
  async checkLargePackages() {
    const large = [];
    const threshold = 500 * 1024; // 500KB
    
    const deps = {
      ...this.pkg.dependencies,
      ...this.pkg.devDependencies
    };
    
    for (const [name, version] of Object.entries(deps)) {
      try {
        const cleanVersion = version.replace(/^[\^~]/, '');
        const url = `https://bundlephobia.com/api/size?package=${name}@${cleanVersion}`;
        
        const size = await this.fetchPackageSize(url);
        
        if (size > threshold) {
          large.push({ name, size: Math.round(size / 1024) + 'KB' });
        }
      } catch (e) {
        // 跳过
      }
    }
    
    if (large.length > 0) {
      this.report.score -= large.length * 3;
      this.report.issues.push({
        type: 'large',
        severity: 'medium',
        count: large.length,
        packages: large
      });
      this.report.suggestions.push('考虑替换大包为更小的替代品');
    }
  }

  // 获取包大小
  fetchPackageSize(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.size || 0);
          } catch {
            reject();
          }
        });
      }).on('error', reject);
    });
  }

  // 检查循环依赖
  checkCircular() {
    try {
      const output = execSync('npx madge --circular --json src/').toString();
      const circular = JSON.parse(output || '[]');
      
      if (circular.length > 0) {
        this.report.score -= circular.length * 15;
        this.report.issues.push({
          type: 'circular',
          severity: 'high',
          count: circular.length,
          cycles: circular
        });
        this.report.suggestions.push('重构代码消除循环依赖');
      }
    } catch (e) {
      // 跳过
    }
  }

  // 生成报告
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 依赖健康度报告');
    console.log('='.repeat(60));
    
    // 分数
    const score = Math.max(0, this.report.score);
    const grade = score >= 90 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D';
    
    console.log(`\n健康度评分：${score} / 100  (${grade})\n`);
    
    // 问题
    if (this.report.issues.length === 0) {
      console.log('✅ 未发现问题\n');
    } else {
      console.log('⚠️ 发现的问题：\n');
      
      this.report.issues.forEach(issue => {
        const icon = issue.severity === 'critical' ? '🔴' :
                     issue.severity === 'high' ? '🟠' : '🟡';
        
        console.log(`${icon} ${issue.type.toUpperCase()}: ${issue.count} 个`);
        
        if (issue.packages) {
          const list = Array.isArray(issue.packages) ? issue.packages : 
                       Object.keys(issue.packages);
          list.slice(0, 5).forEach(pkg => {
            console.log(`   - ${typeof pkg === 'object' ? pkg.name : pkg}`);
          });
          if (list.length > 5) {
            console.log(`   ... 还有 ${list.length - 5} 个`);
          }
        }
        
        console.log();
      });
      
      // 建议
      console.log('💡 优化建议：\n');
      this.report.suggestions.forEach((sug, i) => {
        console.log(`  ${i + 1}. ${sug}`);
      });
      console.log();
    }
    
    // 保存JSON
    fs.writeFileSync(
      'dependency-health-report.json',
      JSON.stringify(this.report, null, 2)
    );
    
    console.log('📄 详细报告：dependency-health-report.json\n');
    
    // 返回状态码
    return score >= 70 ? 0 : 1;
  }

  // 运行所有检查
  async run() {
    console.log('🔍 开始检查依赖健康度...\n');
    
    await this.checkOutdated();
    console.log('✓ 过期检查');
    
    this.checkUnused();
    console.log('✓ 未使用检查');
    
    await this.checkSecurity();
    console.log('✓ 安全检查');
    
    await this.checkLargePackages();
    console.log('✓ 体积检查');
    
    this.checkCircular();
    console.log('✓ 循环依赖检查');
    
    return this.generateReport();
  }
}

// 运行
const checker = new DependencyHealthChecker();
checker.run()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('❌ 检查失败:', err);
    process.exit(1);
  });
```

**使用：**
```bash
node scripts/dependency-health.js
```

**CI 集成：**
```yaml
- name: Check dependency health
  run: node scripts/dependency-health.js
```

### 📖 解析

**检查维度**

1. ✅ 过期依赖 - 及时更新
2. ✅ 未使用依赖 - 清理冗余
3. ✅ 安全漏洞 - 修复风险
4. ✅ 包体积 - 优化性能
5. ✅ 循环依赖 - 改善架构

**自动化保障代码质量**

</details>

---

**导航**  
[上一章：第 25 章面试题](./chapter-25.md) | [返回目录](../README.md) | [下一章：第 27 章面试题](./chapter-27.md)
