# 版本管理策略

## 固定版本 vs 语义化范围

### 固定版本策略

**定义**：精确锁定依赖版本

**配置**：
```json
{
  "dependencies": {
    "react": "18.2.0",
    "lodash": "4.17.21"
  }
}
```

**优势**：
- 完全可预测
- 避免意外升级
- 适合生产环境

**劣势**：
- 错过安全补丁
- 手动维护成本高
- 可能过时

### 语义化范围策略

**Caret (^) - 次版本范围**：
```json
{
  "dependencies": {
    "react": "^18.2.0"  // >=18.2.0 <19.0.0
  }
}
```

**使用场景**：
- 信任 semver 承诺
- 希望自动获取新功能和补丁
- 开发环境

**Tilde (~) - 补丁范围**：
```json
{
  "dependencies": {
    "express": "~4.18.0"  // >=4.18.0 <4.19.0
  }
}
```

**使用场景**：
- 保守升级策略
- 只接受安全补丁
- 关键依赖

### 混合策略（推荐）

**应用项目**：
```json
{
  "dependencies": {
    "react": "18.2.0",        // 核心框架：固定
    "axios": "^1.4.0",        // 工具库：次版本
    "lodash": "~4.17.21"      // 稳定库：补丁
  },
  "devDependencies": {
    "typescript": "^5.0.0",   // 开发工具：次版本
    "jest": "^29.0.0"
  }
}
```

**库项目**：
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"       // 宽松范围
  },
  "devDependencies": {
    "react": "18.2.0"         // 固定测试版本
  }
}
```

---

## 依赖升级策略（保守 vs 激进）

### 保守策略

**原则**：只在必要时升级

**升级触发条件**：
- 安全漏洞
- 关键 bug 修复
- 必需的新功能

**流程**：
```bash
# 1. 查看可升级的包
npm outdated

# 2. 逐个评估
npm view react versions
npm view react dist-tags

# 3. 小范围升级
npm update react --save-exact

# 4. 充分测试
npm test
npm run build

# 5. 逐步推进
```

**适用场景**：
- 大型生产系统
- 关键业务应用
- 稳定性优先

### 激进策略

**原则**：持续保持最新

**自动化升级**：
```json
// package.json
{
  "scripts": {
    "update:minor": "npm update",
    "update:major": "npx npm-check-updates -u"
  }
}
```

**流程**：
```bash
# 1. 自动升级次版本
npm update

# 2. 升级主版本
npx npm-check-updates -u
npm install

# 3. 自动化测试
npm test

# 4. CI 验证
```

**适用场景**：
- 新项目
- 积极维护的项目
- 重视新特性

### 平衡策略（推荐）

**分层升级**：
```
每周：补丁版本 (npm update)
每月：次版本 (npm update)
每季度：主版本（手动评估）
```

**风险评估矩阵**：
```
低风险（自动升级）：
- 补丁版本
- 开发依赖
- 成熟的库

中风险（测试后升级）：
- 次版本
- 常用库

高风险（谨慎升级）：
- 主版本
- 核心框架
- 不兼容变更
```

---

## 自动化依赖更新工具

### Renovate

**配置**（renovate.json）：
```json
{
  "extends": ["config:base"],
  "schedule": ["before 3am on Monday"],
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true
    },
    {
      "matchUpdateTypes": ["minor"],
      "groupName": "minor updates"
    },
    {
      "matchUpdateTypes": ["major"],
      "groupName": "major updates",
      "schedule": ["every weekend"]
    }
  ]
}
```

**特性**：
- 自动创建 PR
- 按类型分组
- 可配置合并策略
- 支持 Monorepo

### Dependabot

**配置**（.github/dependabot.yml）：
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    
    # 自动合并补丁版本
    reviewers:
      - "my-team"
    labels:
      - "dependencies"
    
    # 版本策略
    versioning-strategy: "increase"
```

**特性**：
- GitHub 原生集成
- 安全更新优先
- 免费（公开仓库）

### npm-check-updates

**基本用法**：
```bash
# 检查可升级的包
npx npm-check-updates

# 输出示例：
# react     18.2.0  →  18.3.0
# lodash    4.17.20 →  4.17.21
# typescript 4.9.0  →  5.1.0

# 交互式升级
npx npm-check-updates -i

# 自动升级所有
npx npm-check-updates -u
npm install
```

**高级选项**：
```bash
# 只升级次版本
npx npm-check-updates -u --target minor

# 只升级特定包
npx npm-check-updates -u react typescript

# 排除特定包
npx npm-check-updates -u -x react
```

---

## 安全漏洞响应流程

### 漏洞检测

**npm audit**：
```bash
npm audit

# 输出示例：
# ┌──────────────────────────────────────────────────────┐
# │                                                      │
# │       Critical severity vulnerabilities              │
# │                                                      │
# ├──────────────────────────────────────────────────────┤
# │  Package: lodash                                     │
# │  Dependency of: express [dev]                        │
# │  Path: express > lodash                              │
# │  More info: https://github.com/advisories/...       │
# └──────────────────────────────────────────────────────┘
```

**严重级别**：
- **Critical**：立即修复
- **High**：1 周内修复
- **Moderate**：1 月内修复
- **Low**：评估后决定

### 自动修复

**npm audit fix**：
```bash
# 自动修复（兼容范围内）
npm audit fix

# 强制修复（可能引入破坏性变更）
npm audit fix --force

# 仅报告，不修复
npm audit --dry-run
```

**修复策略**：
```bash
# 1. 尝试自动修复
npm audit fix

# 2. 如果失败，手动升级
npm update vulnerable-package

# 3. 如果仍失败，使用 overrides
{
  "overrides": {
    "vulnerable-package": "safe-version"
  }
}
```

### 漏洞响应流程

**标准流程**：
```
1. 检测 → npm audit (CI 自动化)
2. 评估 → 查看漏洞详情和影响范围
3. 修复 → 升级或使用 workaround
4. 测试 → 完整测试套件
5. 部署 → 紧急发布（Critical/High）
6. 监控 → 确认修复有效
```

**CI 集成**：
```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 0 * * *'  # 每天检查
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate
```

---

## 常见误区

### 误区 1：自动升级所有依赖

**危险**：
```json
// Renovate 配置
{
  "automerge": true  // ❌ 所有 PR 自动合并
}
```

**后果**：
- 未经测试的版本进入生产
- 可能引入 bug
- 破坏性变更

**正确做法**：
```json
{
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true  // ✅ 只自动合并补丁
    }
  ]
}
```

### 误区 2：忽略安全警告

**错误态度**："Low severity 可以忽略"

**真相**：
- Low 可能升级为 High
- 多个 Low 可能组合成攻击链
- 技术债务累积

**最佳实践**：
```bash
# 定期审查所有级别
npm audit

# 评估每个漏洞
npm audit --json | jq
```

### 误区 3：锁文件阻止安全更新

**误解**："有锁文件就无法获取安全补丁"

**真相**：
```bash
# 锁文件存在时
npm audit fix
# 会在兼容范围内更新锁文件

# 示例：
# package.json: "lodash": "^4.17.0"
# 旧锁文件: lodash@4.17.20
# 安全版本: 4.17.21
# npm audit fix 会更新到 4.17.21
```

---

## 工程实践

### 场景 1：生产环境依赖管理

**版本策略**：
```json
{
  "dependencies": {
    "react": "18.2.0",          // 固定核心框架
    "next": "13.4.12",          // 固定框架
    "axios": "~1.4.0",          // 补丁范围（工具库）
    "@sentry/react": "^7.0.0"   // 次版本（监控工具）
  }
}
```

**升级流程**：
```bash
# 每月例行升级
1. 创建升级分支
2. npm outdated
3. 评估每个包
4. 分批升级
5. 测试
6. 灰度发布
```

### 场景 2：Monorepo 依赖统一

**问题**：多个包使用不同版本

**解决方案 1**：根目录统一
```json
// 根 package.json
{
  "devDependencies": {
    "typescript": "5.1.0",  // 所有包共享
    "jest": "29.5.0"
  }
}
```

**解决方案 2**：使用工具
```bash
# 使用 syncpack
npx syncpack list-mismatches
npx syncpack fix-mismatches
```

### 场景 3：自动化工作流

**完整配置**：
```yaml
# .github/workflows/dependencies.yml
name: Dependencies

on:
  schedule:
    - cron: '0 0 * * MON'  # 每周一
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Update dependencies
        run: |
          npm update  # 次版本和补丁
          npm audit fix
      
      - name: Run tests
        run: npm test
      
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update dependencies'
          branch: deps/auto-update
          labels: dependencies
```

---

## 深入一点

### 语义化版本的信任模型

**理想模型**：
```
补丁版本 → 100% 安全
次版本 → 99% 安全
主版本 → 需要迁移
```

**现实**：
```javascript
// 研究数据（基于 npm 生态）
const breakingChangeRate = {
  patch: 0.05,   // 5% 的补丁版本有破坏性变更
  minor: 0.15,   // 15% 的次版本有破坏性变更
  major: 0.80    // 80% 的主版本有破坏性变更
};
```

**风险缓解**：
- 充分的测试覆盖
- 渐进式升级
- 锁文件保护

### 依赖更新的成本收益分析

**成本**：
```
升级时间 + 测试时间 + 修复 bug 时间 + 风险成本
```

**收益**：
```
新功能 + 性能提升 + 安全补丁 + 技术债务减少
```

**量化示例**：
```
项目规模：100 个依赖
平均升级时间：30 分钟/包
每月升级 10 个包 = 5 小时

收益：
- 避免 1 次安全事故 = 节省 40 小时
- 性能提升 10% = 节省服务器成本
- 新功能 = 提升开发效率

结论：ROI 为正
```

### 不同包管理器的更新策略

**npm**：
```bash
npm update      # 在范围内更新
npm outdated    # 查看过时包
```

**Yarn**：
```bash
yarn upgrade              # 交互式升级
yarn upgrade-interactive  # 可视化选择
```

**pnpm**：
```bash
pnpm update      # 更新依赖
pnpm outdated    # 查看过时包
pnpm update -i   # 交互式（需插件）
```

---

## 参考资料

- [语义化版本规范](https://semver.org/)
- [npm audit 文档](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Renovate 配置](https://docs.renovatebot.com/)
- [Dependabot 配置](https://docs.github.com/en/code-security/dependabot)
