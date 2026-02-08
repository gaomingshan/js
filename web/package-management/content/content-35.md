# 最佳实践与经验总结

## 包管理器选择指南

### 项目类型决策树

**小型项目（< 50 个依赖）**：
```
推荐：npm
理由：
- 内置，无需额外安装
- 功能足够
- 社区支持最广

替代：yarn classic
理由：
- 速度稍快
- lockfile 更友好
```

**中型项目（50-200 个依赖）**：
```
推荐：pnpm
理由：
- 磁盘空间节省显著
- 速度最快
- 严格的依赖隔离

替代：yarn berry
理由：
- PnP 性能优秀
- 但兼容性问题较多
```

**大型项目（200+ 个依赖）**：
```
推荐：pnpm
理由：
- 多项目共享 store
- 磁盘节省 80%+
- 安装速度最快

备选：yarn berry (PnP)
理由：
- 极致性能
- 需要解决兼容性问题
```

**Monorepo**：
```
推荐：pnpm + Turborepo/Nx
理由：
- pnpm workspace 功能强大
- 增量构建工具加持
- 整体性能最优

替代：yarn + Nx
理由：
- 生态成熟
- 工具链完善
```

### 团队技能决策

**团队熟悉 npm**：
```
建议：npm 或 pnpm
原因：学习曲线低
迁移成本：pnpm < yarn
```

**团队追求性能**：
```
建议：pnpm
原因：综合性能最优
投入：学习新工具
回报：显著性能提升
```

**团队规模考虑**：
```
小团队（< 5 人）：
└── npm/pnpm 都可以

中型团队（5-20 人）：
└── 推荐 pnpm（一致性保证）

大型团队（20+ 人）：
└── 强烈推荐 pnpm + Monorepo 工具
```

---

## 依赖管理原则

### 最小依赖原则

**问题**：过度依赖
```json
// ❌ 不好的实践
{
  "dependencies": {
    "lodash": "^4.17.0",
    "lodash.get": "^4.4.0",      // 冗余
    "lodash.debounce": "^4.0.8",  // 冗余
    "moment": "^2.29.0",
    "date-fns": "^2.29.0"         // 功能重复
  }
}
```

**改进**：
```json
// ✅ 好的实践
{
  "dependencies": {
    "lodash": "^4.17.0",  // 统一使用
    "date-fns": "^2.29.0"  // 选择一个日期库
  }
}
```

**工具检查**：
```bash
# depcheck
npx depcheck

# 输出：
# Unused dependencies
# * moment
# 
# Missing dependencies
# * react (used in src/App.tsx)
```

### 语义化版本策略

**核心依赖**：精确版本
```json
{
  "dependencies": {
    "react": "18.2.0",      // 固定
    "next": "13.4.12"       // 固定
  }
}
```

**工具库**：补丁范围
```json
{
  "dependencies": {
    "lodash": "~4.17.21",   // 只升级补丁
    "axios": "~1.4.0"
  }
}
```

**开发依赖**：次版本范围
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",  // 接受新功能
    "jest": "^29.0.0"
  }
}
```

### 锁文件规范

**强制规则**：
```json
// package.json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "postinstall": "node scripts/check-lockfile.js"
  }
}
```

**检查脚本**：
```javascript
// scripts/check-lockfile.js
const fs = require('fs');

const lockfile = 'pnpm-lock.yaml';

if (!fs.existsSync(lockfile)) {
  console.error(`Error: ${lockfile} not found`);
  process.exit(1);
}

// 检查 lockfile 是否被修改
const packageJson = require('../package.json');
const lockContent = fs.readFileSync(lockfile, 'utf8');

// 简单检查（实际应该更复杂）
if (!lockContent.includes(packageJson.name)) {
  console.error('Lockfile appears to be invalid');
  process.exit(1);
}

console.log('✓ Lockfile is valid');
```

---

## 版本发布流程

### 语义化发布

**Conventional Commits**：
```bash
# 功能
git commit -m "feat: add user authentication"
→ 次版本升级（1.0.0 → 1.1.0）

# 修复
git commit -m "fix: resolve memory leak"
→ 补丁版本升级（1.1.0 → 1.1.1）

# 破坏性变更
git commit -m "feat!: redesign API

BREAKING CHANGE: removed deprecated endpoints"
→ 主版本升级（1.1.1 → 2.0.0）
```

**standard-version**：
```bash
# 安装
npm install -D standard-version

# package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# 执行发布
npm run release

# 自动完成：
# 1. 分析 commit 历史
# 2. 确定版本号
# 3. 生成 CHANGELOG.md
# 4. 创建 Git tag
```

### Changesets 工作流

**完整流程**：
```bash
# 1. 开发功能
git checkout -b feature/new-api
# 开发...

# 2. 创建 changeset
npx changeset
# ? Which packages would you like to include?
#   ✔ @my-org/core
# ? What kind of change is this for @my-org/core?
#   minor
# ? Please enter a summary
#   Add new authentication API

# 3. 提交
git add .changeset/
git commit -m "feat: add authentication API"

# 4. 合并到 main
git push origin feature/new-api
# 创建 PR → 审查 → 合并

# 5. CI 自动创建 Version PR
# 包含：
# - 更新版本号
# - 生成 CHANGELOG
# - 删除 changeset 文件

# 6. 合并 Version PR
# CI 自动发布到 npm
```

**CI 配置**：
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - uses: pnpm/action-setup@v2
      
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 安全检查清单

### 依赖审计

**定期审计**：
```bash
# 每日自动检查
npm audit

# 高严重级别才失败
npm audit --audit-level=high

# 修复
npm audit fix
```

**CI 集成**：
```yaml
name: Security

on:
  schedule:
    - cron: '0 0 * * *'  # 每天
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Audit dependencies
        run: npm audit --audit-level=moderate
      
      - name: Create issue if vulnerabilities found
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Security vulnerabilities detected',
              body: 'Run `npm audit` to see details'
            })
```

### License 合规检查

**工具**：
```bash
# license-checker
npx license-checker --summary

# 输出：
# ├─ MIT: 150
# ├─ Apache-2.0: 20
# ├─ ISC: 10
# └─ UNLICENSED: 1 ⚠️
```

**禁止特定许可证**：
```bash
# license-checker
npx license-checker \
  --onlyAllow "MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause" \
  --production

# 或配置文件
{
  "scripts": {
    "check:licenses": "license-checker --onlyAllow 'MIT;Apache-2.0;ISC'"
  }
}
```

### 包完整性验证

**npm audit signatures**：
```bash
npm audit signatures

# 输出：
# audited 200 packages
# verified 200 package signatures
# ✓ All package signatures verified
```

**package.json 校验**：
```json
{
  "scripts": {
    "prepare": "node scripts/validate-package.js"
  }
}
```

**验证脚本**：
```javascript
// scripts/validate-package.js
const pkg = require('../package.json');

// 必需字段
const required = ['name', 'version', 'description', 'license'];
for (const field of required) {
  if (!pkg[field]) {
    console.error(`Missing required field: ${field}`);
    process.exit(1);
  }
}

// 检查私有字段
if (pkg.private && pkg.publishConfig) {
  console.error('Private packages should not have publishConfig');
  process.exit(1);
}

// 检查 engines
if (!pkg.engines || !pkg.engines.node) {
  console.warn('Warning: engines.node not specified');
}

console.log('✓ package.json is valid');
```

---

## 团队协作规范

### Code Review 检查点

**依赖变更检查**：
```markdown
## Dependency Changes Checklist

- [ ] lockfile 已更新
- [ ] 无不必要的依赖
- [ ] 版本范围合理
- [ ] 无安全漏洞（npm audit）
- [ ] License 合规
- [ ] 包大小影响可接受
```

**PR 模板**：
```markdown
## 依赖变更说明

### 新增依赖
- `package-name@version`: 用途说明

### 升级依赖
- `package-name`: 1.0.0 → 2.0.0
  - 原因：修复安全漏洞 CVE-XXXX
  - Breaking Changes: 无
  - 测试：已通过回归测试

### 移除依赖
- `package-name`: 改用 native API
```

### 文档规范

**README.md**：
```markdown
# Project Name

## 开发环境

- Node.js: >= 18.0.0
- pnpm: >= 8.0.0

## 安装

\`\`\`bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
\`\`\`

## 依赖管理

- 使用 pnpm 作为包管理器
- 提交前检查 lockfile 变更
- 定期运行 `pnpm audit`
```

**CONTRIBUTING.md**：
```markdown
## 依赖管理规范

### 添加依赖

1. 评估必要性
2. 检查 License
3. 检查包大小
4. 选择稳定版本

### 升级依赖

1. 查看 CHANGELOG
2. 评估破坏性变更
3. 本地测试
4. 创建 changeset

### 发布流程

1. `npx changeset`
2. 描述变更
3. 提交 PR
4. 合并后自动发布
```

---

## 常见问题解决方案

### 问题 1：依赖冲突

**现象**：
```bash
npm install
# Error: ERESOLVE unable to resolve dependency tree
```

**解决**：
```bash
# 方案 1：使用 overrides
{
  "overrides": {
    "package-a": "2.0.0"
  }
}

# 方案 2：使用 legacy peer deps
npm install --legacy-peer-deps

# 方案 3：升级依赖
npm update package-b
```

### 问题 2：幽灵依赖

**现象**：
```javascript
const lodash = require('lodash');  // 未声明但能用
```

**解决**：
```bash
# 方案 1：使用 pnpm（自动隔离）
pnpm install

# 方案 2：显式声明
npm install lodash --save

# 方案 3：使用检查工具
npx depcheck
```

### 问题 3：lockfile 冲突

**解决流程**：
```bash
# 1. 接受一方的 package.json
git checkout --theirs package.json

# 2. 删除 lockfile
rm pnpm-lock.yaml

# 3. 重新生成
pnpm install

# 4. 提交
git add pnpm-lock.yaml
git commit -m "chore: resolve lockfile conflict"
```

---

## 深入一点

### 包管理器的发展趋势

**历史演进**：
```
npm v1-2 (2010-2014): 嵌套 node_modules
npm v3 (2015): 扁平化
Yarn Classic (2016): 锁文件 + 性能优化
pnpm (2017): 内容寻址 + 硬链接
Yarn Berry (2020): PnP + 零安装
npm v7 (2021): workspaces + peer deps 自动安装
```

**未来方向**：
```
1. 性能：持续优化安装速度
2. 安全：更强的完整性验证
3. 标准化：包管理器协议统一
4. AI 辅助：智能依赖升级建议
```

### 性能优化的理论极限

**安装速度瓶颈**：
```
网络下载：取决于带宽
磁盘 I/O：取决于硬件
CPU 解压：现代 CPU 足够快

理论最快 = 网络下载时间

实际：pnpm + 缓存 ≈ 理论极限
```

**磁盘占用极限**：
```
单项目：300 MB（典型）
pnpm store：50 MB（去重后）

理论极限 = 唯一包的总大小
```

### 企业级实践的 ROI 分析

**成本**：
```
工具成本：
- pnpm: 免费
- Nx Cloud: $20/月
- Turbo: $20/月

人力成本：
- 学习：2 天/人
- 迁移：1 周
```

**收益**：
```
开发效率：
- 安装速度：快 5 倍 = 节省 2 分钟/次
- 构建速度：快 10 倍 = 节省 5 分钟/次
- 每天节省：30 分钟/人

成本节省：
- 磁盘：节省 80% = $50/月（云服务器）
- CI 时间：节省 70% = $200/月
- 开发者时间：30 分钟/天 × 20 天 = 10 小时/月
  = $500/月（按 $50/小时）

总收益：$750/月
投资回报期：1-2 个月
```

---

## 参考资料

- [npm 最佳实践](https://docs.npmjs.com/cli/v9/using-npm/developers)
- [pnpm 最佳实践](https://pnpm.io/best-practices)
- [语义化版本规范](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
