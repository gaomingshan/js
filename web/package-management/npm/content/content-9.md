# npm update 与依赖升级策略

## 概述

依赖升级是项目维护的重要环节。合理的升级策略既能获取新特性和安全修复，又能避免引入破坏性变更。理解 `npm update` 命令的工作机制和最佳实践，是保持项目健康的关键。

## npm update 基本用法

### 更新所有依赖

```bash
# 更新所有包到 package.json 允许的最新版本
npm update
npm up  # 简写
```

**行为：**
```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.20"  // 允许 4.x.x
  }
}

// 当前安装：4.17.20
// registry 最新：4.17.21
npm update
// 更新到：4.17.21
```

### 更新特定包

```bash
# 更新单个包
npm update lodash

# 更新多个包
npm update lodash axios react
```

### 更新并保存到 package.json

```bash
# npm 默认不修改 package.json
npm update lodash
# package.json 仍然是 "^4.17.20"
# package-lock.json 更新到 4.17.21

# npm 7.20+ 可以使用 --save
npm update lodash --save
# package.json 更新到 "^4.17.21"
```

## npm update 工作原理

### 更新流程

```
1. 读取 package.json 中的版本范围
2. 从 registry 获取最新版本信息
3. 计算满足范围的最新版本
4. 检查是否高于当前版本
5. 如果是，下载并安装
6. 更新 package-lock.json
7. 不修改 package.json（除非使用 --save）
```

### 版本范围限制

**示例 1：^ 符号**
```json
{
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

```bash
# 当前：18.0.0
# registry：18.2.0, 19.0.0
npm update react
# 更新到：18.2.0（不会到 19.0.0）
```

**示例 2：~ 符号**
```json
{
  "dependencies": {
    "lodash": "~4.17.20"
  }
}
```

```bash
# 当前：4.17.20
# registry：4.17.21, 4.18.0
npm update lodash
# 更新到：4.17.21（不会到 4.18.0）
```

**示例 3：精确版本**
```json
{
  "dependencies": {
    "axios": "1.4.0"
  }
}
```

```bash
npm update axios
# 不会更新（版本已锁定）
```

## 查看可更新依赖

### npm outdated

```bash
# 查看所有过时的包
npm outdated
```

**输出示例：**
```
Package    Current  Wanted  Latest  Location
react      18.0.0   18.2.0  18.2.0  project
webpack    5.70.0   5.70.0  5.88.0  project
lodash     4.17.20  4.17.21 4.17.21 project
```

**字段含义：**
- **Current**：当前安装版本
- **Wanted**：满足 package.json 范围的最新版本（npm update 会安装的版本）
- **Latest**：registry 最新版本
- **Location**：包的位置

**颜色标识：**
```
红色：Latest 版本是主版本更新（破坏性）
黄色：Latest 版本是次版本更新
绿色：Latest 版本是修订版本更新
```

### 输出格式

```bash
# JSON 格式
npm outdated --json

# 长格式（显示类型）
npm outdated --long
```

## 跨主版本更新

### 问题

```bash
# package.json
{
  "dependencies": {
    "react": "^17.0.0"
  }
}

npm update react
# 不会更新到 18.x（主版本限制）
```

### 解决方案

**方案 1：手动修改 package.json**
```json
{
  "dependencies": {
    "react": "^18.0.0"  // 修改版本范围
  }
}
```

```bash
npm install
```

**方案 2：使用 npm install**
```bash
npm install react@latest
# 自动更新 package.json 和安装最新版本
```

**方案 3：使用 npm-check-updates**
```bash
# 安装工具
npm install -g npm-check-updates

# 查看可更新版本
ncu

# 交互式更新
ncu -i

# 更新所有到最新版本
ncu -u
npm install
```

## 依赖升级策略

### 策略 1：保守升级（推荐）

**只更新补丁版本：**
```json
{
  "dependencies": {
    "lodash": "~4.17.21"  // 仅 4.17.x
  }
}
```

**优势：**
- 风险最低
- 仅修复 Bug 和安全问题
- 不引入新功能

**劣势：**
- 错过新特性
- 长期积累技术债

**适用：**
- 稳定运行的生产项目
- 关键业务系统
- 人力有限的团队

### 策略 2：渐进升级（平衡）

**允许次版本更新：**
```json
{
  "dependencies": {
    "react": "^18.2.0"  // 允许 18.x.x
  }
}
```

**定期小步更新：**
```bash
# 每月执行一次
npm outdated
npm update
npm test
git commit -m "chore: update dependencies"
```

**优势：**
- 平衡新特性和稳定性
- 风险可控
- 渐进式适应变化

**劣势：**
- 需要定期维护
- 仍可能遇到次版本的 Breaking Change

**适用：**
- 大多数项目
- 活跃开发的项目

### 策略 3：激进升级（高风险）

**始终使用最新版本：**
```json
{
  "dependencies": {
    "framework": "latest"  // ❌ 不推荐
  }
}
```

**或使用 dependabot：**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**优势：**
- 始终使用最新特性
- 及时获取安全更新
- 避免技术债积累

**劣势：**
- 高风险
- 频繁破坏性变更
- 需要大量测试

**适用：**
- 实验性项目
- 有完善测试的项目
- 技术探索项目

### 策略 4：分层升级

**区分核心依赖和工具依赖：**
```json
{
  "dependencies": {
    "react": "~18.2.0",        // 核心：保守
    "lodash": "~4.17.21"       // 工具：保守
  },
  "devDependencies": {
    "eslint": "^8.45.0",       // 工具：渐进
    "prettier": "^3.0.0",      // 工具：渐进
    "vitest": "^0.34.0"        // 测试：激进
  }
}
```

## 升级前检查清单

### 1. 查看 CHANGELOG

```bash
# 访问项目 GitHub
https://github.com/lodash/lodash/blob/master/CHANGELOG.md

# 或使用 npm info
npm info lodash versions
npm info lodash@5.0.0 --json
```

**重点关注：**
- Breaking Changes
- Deprecated Features
- Migration Guide

### 2. 检查依赖关系

```bash
# 查看哪些包依赖目标包
npm ls react

# 输出示例
project@1.0.0
├─┬ react-dom@18.2.0
│ └── react@18.2.0  # react-dom 依赖 react
└── react@18.2.0
```

**风险评估：**
- 被多个包依赖：升级影响大
- 仅项目直接依赖：影响小

### 3. 运行测试

```bash
# 升级前
npm test  # 确保测试通过

# 升级
npm update

# 升级后
npm test  # 验证无回归
```

### 4. 检查兼容性

**Node.js 版本：**
```json
{
  "engines": {
    "node": ">=18.0.0"  // 新版本可能有要求
  }
}
```

**浏览器兼容性：**
```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions"
  ]
}
```

## 批量升级工具

### npm-check-updates (ncu)

**安装：**
```bash
npm install -g npm-check-updates
```

**基本用法：**
```bash
# 查看可更新包
ncu

# 输出示例
react     18.0.0  →  18.2.0
webpack   5.70.0  →  5.88.0
```

**交互式升级：**
```bash
ncu -i
# 选择要升级的包
```

**更新 package.json：**
```bash
# 更新所有到最新版本
ncu -u

# 更新特定包
ncu -u react webpack

# 仅次版本和修订版本
ncu --target minor
```

**过滤包：**
```bash
# 仅更新 dependencies
ncu --dep prod

# 仅更新 devDependencies
ncu --dep dev

# 排除特定包
ncu -x react,vue
```

### npm-check

**安装：**
```bash
npm install -g npm-check
```

**交互式更新：**
```bash
npm-check -u
```

**功能：**
- 检查过时包
- 检查未使用的包
- 安全漏洞检查
- 交互式选择更新

### Dependabot（GitHub）

**配置文件：.github/dependabot.yml**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
    labels:
      - "dependencies"
    versioning-strategy: increase
```

**功能：**
- 自动检测更新
- 创建 PR
- 运行 CI 测试
- 自动合并（可选）

## 安全更新

### npm audit

```bash
# 检查安全漏洞
npm audit

# 输出示例
found 3 vulnerabilities (1 moderate, 2 high)
```

**详细信息：**
```bash
npm audit --json
```

### 自动修复

```bash
# 自动修复（仅兼容更新）
npm audit fix

# 强制修复（可能破坏兼容性）
npm audit fix --force
```

**工作原理：**
```
1. 扫描 package-lock.json
2. 对比 npm 漏洞数据库
3. 查找修复版本
4. 更新到安全版本
```

### 忽略特定漏洞

**临时忽略：**
```bash
# 使用 --force 或 --audit-level
npm install --audit-level=moderate
```

**永久忽略：**
```json
// .npmrc
audit-level=high
```

**使用 .auditignore（非官方）：**
```
# 需要第三方工具
https://github.com/example/vulnerability-id
```

## 回滚策略

### 使用 Git

```bash
# 升级后出现问题
git diff package.json package-lock.json

# 回滚
git checkout HEAD -- package.json package-lock.json
npm install
```

### 使用 npm

```bash
# 安装之前的版本
npm install lodash@4.17.20

# 或使用 lock 文件
git checkout HEAD -- package-lock.json
npm ci
```

### 版本固定

```json
{
  "dependencies": {
    "critical-package": "1.2.3"  // 锁定版本
  }
}
```

## 最佳实践

### 1. 建立更新节奏

```bash
# 每月第一周
- 运行 npm outdated
- 更新补丁版本：npm update
- 测试并提交

# 每季度
- 检查主版本更新
- 评估升级价值
- 规划升级任务
```

### 2. 分批更新

```bash
# 不要一次更新所有包
# 分组更新，逐个测试

# 第一批：测试工具
npm update eslint prettier jest

# 第二批：构建工具
npm update webpack babel-loader

# 第三批：核心依赖
npm update react react-dom
```

### 3. 使用分支和 PR

```bash
# 创建更新分支
git checkout -b chore/update-dependencies

# 更新
npm update

# 测试
npm test

# 提交 PR
git add .
git commit -m "chore: update dependencies"
git push origin chore/update-dependencies
```

### 4. 文档更新内容

```markdown
## 依赖更新日志

### 2024-01-15
- react: 18.0.0 → 18.2.0
- webpack: 5.70.0 → 5.88.0
- 测试通过，无破坏性变更
```

### 5. 监控升级影响

```bash
# 包体积变化
npm install -g cost-of-modules
cost-of-modules

# 构建时间
time npm run build

# 运行时性能
npm run test:performance
```

## 常见问题

### 问题 1：update 无效果

```bash
npm update lodash
# 版本没变化

# 原因：已是 wanted 版本
npm outdated lodash
# Current = Wanted

# 解决：需要跨主版本升级
npm install lodash@latest
```

### 问题 2：update 后测试失败

```bash
# 回滚
git checkout HEAD -- package-lock.json
npm ci

# 逐个更新找出问题包
npm update packageA
npm test  # 通过
npm update packageB
npm test  # 失败 → packageB 有问题
```

### 问题 3：peer 依赖冲突

```bash
npm update
npm ERR! peer dep missing

# 解决
npm update --legacy-peer-deps
```

### 问题 4：node_modules 与 lock 不一致

```bash
# 现象
npm update 没有效果

# 解决
rm -rf node_modules
npm ci
npm update
```

## 参考资料

- [npm update 文档](https://docs.npmjs.com/cli/v9/commands/npm-update)
- [npm outdated 文档](https://docs.npmjs.com/cli/v9/commands/npm-outdated)
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [依赖更新最佳实践](https://docs.npmjs.com/cli/v9/using-npm/dependency-management)

---

**上一章：**[npm install 深入解析](./content-8.md)  
**下一章：**[npm link 本地调试与开发](./content-10.md)
