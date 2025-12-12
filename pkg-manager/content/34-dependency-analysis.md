# 依赖分析与优化

## 概述

依赖分析帮助识别无用依赖、大包、安全漏洞和优化空间。本章介绍各类分析工具和优化技巧。

## 一、依赖可视化

### 1.1 npm ls

```bash
# 查看依赖树
npm ls

# 只显示顶层
npm ls --depth=0

# 查看特定包
npm ls lodash

# JSON 格式
npm ls --json
```

### 1.2 可视化工具

**npm-dependency-graph：**
```bash
npm install -g npm-dependency-graph

# 生成依赖图
npm-dependency-graph > graph.html
```

**dependency-cruiser：**
```bash
npm install -g dependency-cruiser

# 生成依赖图
depcruise --output-type dot src | dot -T svg > dependency-graph.svg
```

## 二、包体积分析

### 2.1 bundlephobia

**在线工具：** https://bundlephobia.com/

```bash
# 查看包大小
https://bundlephobia.com/package/lodash@4.17.21

# 输出：
# Minified: 69.9 kB
# Minified + Gzipped: 25.2 kB
```

### 2.2 package-size

```bash
npm install -g package-size

# 分析包大小
package-size lodash
```

### 2.3 webpack-bundle-analyzer

```bash
npm install -D webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};

# 构建后自动打开分析页面
npm run build
```

## 三、无用依赖检测

### 3.1 depcheck

```bash
npm install -g depcheck

# 检查无用依赖
depcheck

# 输出：
Unused dependencies:
* lodash
* axios

Missing dependencies:
* react-router-dom  # 使用了但未声明
```

**配置：**
```json
// .depcheckrc
{
  "ignoreMatches": [
    "@types/*",
    "webpack"
  ],
  "ignoreDirs": [
    "dist",
    "build"
  ]
}
```

### 3.2 npm-check

```bash
npm install -g npm-check

# 交互式检查
npm-check -u

# 输出：
# ❯◯ lodash   未使用
# ◯ react     有更新 17.0.0 → 18.2.0
```

## 四、重复依赖分析

### 4.1 查找重复

```bash
# npm
npm ls lodash

# 输出：
my-app
├─┬ pkg-a
│ └── lodash@4.17.20
└─┬ pkg-b
  └── lodash@4.17.21  # 重复但版本不同
```

### 4.2 去重

```bash
# npm dedupe
npm dedupe

# yarn-deduplicate
npx yarn-deduplicate yarn.lock
yarn install

# pnpm（自动去重）
pnpm install
```

## 五、安全审计

### 5.1 npm audit

```bash
# 扫描漏洞
npm audit

# 输出：
found 3 vulnerabilities (1 moderate, 2 high)

# 自动修复
npm audit fix

# 强制修复
npm audit fix --force
```

### 5.2 Snyk

```bash
npm install -g snyk

# 测试漏洞
snyk test

# 监控项目
snyk monitor

# 自动修复
snyk wizard
```

### 5.3 GitHub Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## 六、许可证合规

### 6.1 license-checker

```bash
npm install -g license-checker

# 查看所有许可证
license-checker

# 输出 CSV
license-checker --csv > licenses.csv

# 排除特定许可证
license-checker --exclude "MIT, Apache-2.0"
```

### 6.2 许可证分类

```bash
# 查看许可证汇总
license-checker --summary

# 输出：
MIT: 245
ISC: 12
Apache-2.0: 8
```

## 七、按需加载优化

### 7.1 Tree Shaking

```javascript
// ❌ 不好：引入整个库
import _ from 'lodash';

// ✅ 好：按需引入
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

**package.json：**
```json
{
  "sideEffects": false  // 启用 Tree Shaking
}
```

### 7.2 动态导入

```javascript
// 按需加载大模块
async function loadHeavyModule() {
  const module = await import('./heavy-module');
  return module.default();
}
```

### 7.3 替换大包

```javascript
// ❌ 大包
import moment from 'moment';  // 70KB

// ✅ 轻量替代
import dayjs from 'dayjs';    // 2KB
```

**常见替换：**
| 原包 | 替代 | 大小对比 |
|------|------|----------|
| moment | dayjs | 70KB → 2KB |
| lodash | lodash-es | 支持 Tree Shaking |
| axios | ky | 12KB → 4KB |

## 八、Monorepo 依赖优化

### 8.1 版本统一

```bash
# 使用 syncpack
npm install -g syncpack

# 检查版本不一致
syncpack list-mismatches

# 修复
syncpack fix-mismatches
```

### 8.2 共享依赖

**提升公共依赖：**
```json
// 根 package.json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

### 8.3 workspace 依赖分析

```bash
# pnpm
pnpm -r list --depth=0

# 查看 workspace 间依赖
pnpm why @mycompany/utils
```

## 九、性能影响分析

### 9.1 安装时间分析

```bash
# 分析哪个包最慢
npm install --verbose

# 或使用 time
time npm install lodash
```

### 9.2 构建性能

```bash
# TypeScript 构建时间
time tsc

# Webpack 构建分析
npx webpack --profile --json > stats.json
npx webpack-bundle-analyzer stats.json
```

## 十、优化建议清单

### 10.1 依赖清理

```markdown
- [ ] 运行 depcheck 检查无用依赖
- [ ] 删除未使用的包
- [ ] 去重依赖（npm dedupe）
- [ ] 检查过期包（npm outdated）
```

### 10.2 体积优化

```markdown
- [ ] 替换大包为轻量级替代
- [ ] 启用 Tree Shaking
- [ ] 按需引入
- [ ] 检查 bundle 体积
```

### 10.3 安全审计

```markdown
- [ ] npm audit / snyk test
- [ ] 修复高危漏洞
- [ ] 检查许可证合规
- [ ] 定期更新依赖
```

## 十一、自动化脚本

### 11.1 检查脚本

```json
{
  "scripts": {
    "analyze": "npm run analyze:deps && npm run analyze:bundle",
    "analyze:deps": "depcheck",
    "analyze:bundle": "webpack-bundle-analyzer dist/stats.json",
    "check:unused": "depcheck",
    "check:outdated": "npm outdated",
    "check:security": "npm audit",
    "check:licenses": "license-checker --summary"
  }
}
```

### 11.2 CI 集成

```yaml
# .github/workflows/analyze.yml
name: Dependency Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install
        run: npm ci
        
      - name: Check unused deps
        run: npx depcheck
        
      - name: Security audit
        run: npm audit --audit-level=high
        
      - name: Check licenses
        run: npx license-checker --failOn "GPL;AGPL"
```

## 参考资料

- [bundlephobia](https://bundlephobia.com/)
- [depcheck](https://github.com/depcheck/depcheck)
- [Snyk](https://snyk.io/)
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

---

**导航**  
[上一章：包管理器性能优化](./33-performance-optimization.md) | [返回目录](../README.md) | [下一章：包安全与合规](./35-security-compliance.md)
