# 包管理器最佳实践总结

## 概述

本章总结包管理器的选型决策、团队规范、性能优化、安全最佳实践和未来趋势。

## 一、包管理器选型

### 1.1 决策树

```
项目类型？
├─ 小型项目/个人项目
│  └─ npm（简单，兼容性好）
│
├─ 中型项目/团队项目
│  ├─ 已有 npm/yarn → 继续使用
│  └─ 新项目 → pnpm ⭐
│
├─ Monorepo
│  └─ pnpm + Turborepo ⭐⭐⭐
│
└─ 追求极致性能
   ├─ pnpm ⭐⭐⭐
   └─ Yarn Berry (PnP)
```

### 1.2 对比总结

| 特性 | npm | Yarn Classic | pnpm | Yarn Berry |
|------|-----|--------------|------|------------|
| **速度** | 🐌 | ⚡ | ⚡⚡⚡ | ⚡⚡⚡ |
| **空间** | 💾💾💾 | 💾💾💾 | 💾 | 💾 |
| **兼容性** | ✅✅✅ | ✅✅ | ✅✅ | ⚠️ |
| **学习成本** | 低 | 低 | 中 | 高 |
| **Monorepo** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **推荐度** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### 1.3 推荐配置

**pnpm（推荐）：**
```ini
# .npmrc
registry=https://registry.npmmirror.com
store-dir=~/.pnpm-store
auto-install-peers=true
strict-peer-dependencies=false
```

**npm：**
```ini
registry=https://registry.npmmirror.com
save-exact=false
engine-strict=false
```

## 二、团队规范

### 2.1 统一工具

```json
// package.json
{
  "packageManager": "pnpm@8.6.0",
  "engines": {
    "node": ">=16.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**使用 Corepack：**
```bash
corepack enable
# 自动使用项目指定的包管理器
```

### 2.2 提交规范

```markdown
必须提交：
- ✅ package.json
- ✅ lock 文件（package-lock.json / yarn.lock / pnpm-lock.yaml）
- ❌ node_modules

.gitignore：
node_modules/
.pnpm-store/
```

### 2.3 脚本规范

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky install",
    "precommit": "lint-staged"
  }
}
```

### 2.4 依赖管理规范

```markdown
1. 版本策略
   - 生产依赖：使用 ^ (允许 minor 更新)
   - 开发工具：使用 ~ (只允许 patch 更新)
   - 关键依赖：精确版本

2. 添加依赖
   - 评估必要性
   - 检查包质量（stars、维护状况、bundle 大小）
   - 审查许可证
   - 团队 review

3. 更新依赖
   - 每周检查过期包
   - 每月更新 minor 版本
   - 每季度更新 major 版本
   - 安全更新立即处理
```

## 三、性能最佳实践

### 3.1 安装优化

```bash
# ✅ 推荐
pnpm install                        # 最快
npm ci                              # CI/CD 使用
pnpm install --frozen-lockfile      # CI/CD 使用

# ❌ 避免
npm install                         # 慢
npm install --no-package-lock       # 不确定性
```

### 3.2 缓存策略

```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 3.3 Monorepo 优化

```bash
# 使用 Turborepo
pnpm add -D turbo

# 增量构建
turbo run build --filter ...[HEAD^1]

# 远程缓存
turbo run build --api="https://cache.example.com"
```

## 四、安全最佳实践

### 4.1 依赖安全

```markdown
1. 定期审计
   - 每天：npm audit（CI/CD）
   - 每周：手动review新增依赖
   - 每月：全面安全审计

2. 自动化
   - Dependabot自动更新
   - Snyk监控
   - CI集成安全扫描

3. 应急响应
   - 高危漏洞24小时修复
   - 中危漏洞1周修复
   - 低危漏洞随正常更新
```

### 4.2 发布安全

```markdown
1. 认证
   - 启用 2FA
   - 使用 Access Token
   - 限制发布权限

2. 包保护
   - 使用 .npmignore
   - 检查发布内容（npm pack --dry-run）
   - 启用 provenance

3. 私有包
   - 使用作用域包 @company/name
   - 配置私有 registry
   - 设置访问控制
```

## 五、可维护性

### 5.1 文档规范

```markdown
# README.md 必需内容
- 项目简介
- 安装说明
- 开发指南
- 构建部署
- 贡献指南

# 依赖说明
- 为什么选择这个包
- 主要依赖的作用
- 已知问题和解决方案
```

### 5.2 版本管理

**Semver 规范：**
```bash
1.2.3
│ │ └─ PATCH: 向后兼容的bug修复
│ └─── MINOR: 向后兼容的新功能
└───── MAJOR: 不兼容的API变更
```

**Conventional Commits：**
```bash
feat: 新功能（MINOR）
fix: bug修复（PATCH）
feat!: 破坏性变更（MAJOR）
chore: 杂项（不影响版本）
```

### 5.3 Changelog

```markdown
# CHANGELOG.md

## [1.1.0] - 2024-01-15

### Added
- 新增 `helper` 函数

### Changed
- 优化性能

### Fixed
- 修复边界情况bug

### Breaking Changes
- 移除废弃的 `oldAPI`
```

## 六、CI/CD 最佳实践

### 6.1 推荐流程

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Enable Corepack
        run: corepack enable
        
      - name: Cache
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          
      - name: Install
        run: pnpm install --frozen-lockfile
        
      - name: Lint
        run: pnpm lint
        
      - name: Test
        run: pnpm test
        
      - name: Build
        run: pnpm build
```

### 6.2 发布流程

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      
      - name: Publish
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 七、未来趋势

### 7.1 技术趋势

**1. 更快的安装速度**
- 并行下载优化
- 更智能的缓存
- 增量安装

**2. 更小的磁盘占用**
- 内容寻址存储（pnpm）
- 压缩和去重
- PnP 模式（Yarn Berry）

**3. 更严格的依赖管理**
- 消除幽灵依赖
- 严格的 peer 依赖
- 依赖隔离

**4. 更好的 Monorepo 支持**
- 原生 Workspaces
- 增量构建（Turborepo、Nx）
- 远程缓存

### 7.2 工具趋势

```
pnpm → 成为主流（性能+严格依赖）
Turborepo → Monorepo 标准工具
Corepack → 统一包管理器版本
ESM → 逐步替代 CommonJS
```

### 7.3 安全趋势

```
- 包签名和证明（Provenance）
- SBOM 标准化
- 供应链安全自动化
- AI 驱动的漏洞检测
```

## 八、推荐技术栈

### 8.1 个人项目

```
包管理器: npm / pnpm
构建工具: Vite
TypeScript: ✅
测试: Vitest
代码规范: ESLint + Prettier
```

### 8.2 团队项目

```
包管理器: pnpm ⭐
构建工具: Vite / Webpack
TypeScript: ✅
测试: Vitest / Jest
代码规范: ESLint + Prettier
Git Hooks: Husky + lint-staged
CI/CD: GitHub Actions
```

### 8.3 Monorepo

```
包管理器: pnpm ⭐⭐⭐
构建工具: Turborepo ⭐⭐⭐
版本管理: Changesets
TypeScript: ✅
测试: Vitest
代码规范: 共享配置
CI/CD: 增量构建 + 缓存
```

## 九、快速参考

### 9.1 常用命令

```bash
# 安装
pnpm install

# 添加依赖
pnpm add lodash
pnpm add -D typescript

# 更新
pnpm update -i

# 审计
pnpm audit

# 清理
pnpm store prune
```

### 9.2 配置模板

```ini
# .npmrc
registry=https://registry.npmmirror.com
store-dir=~/.pnpm-store
auto-install-peers=true
```

```json
// package.json
{
  "packageManager": "pnpm@8.6.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 十、总结

### 10.1 核心要点

```markdown
1. 选择合适的包管理器
   - 新项目优先 pnpm
   - Monorepo 必用 pnpm + Turborepo
   
2. 遵循最佳实践
   - 提交 lock 文件
   - 定期更新依赖
   - 重视安全审计
   
3. 优化性能
   - 使用缓存
   - 增量构建
   - 并行执行
   
4. 保障安全
   - 自动化扫描
   - 许可证合规
   - 供应链安全
```

### 10.2 学习路径

```
1. 基础：npm 命令和 package.json
2. 进阶：lock 文件、版本管理、安全审计
3. 高级：Monorepo、性能优化、工程化
4. 专家：自定义工具、CI/CD、最佳实践
```

## 参考资料

- [pnpm 官方文档](https://pnpm.io/)
- [npm 官方文档](https://docs.npmjs.com/)
- [Yarn 官方文档](https://yarnpkg.com/)
- [Turborepo 文档](https://turbo.build/repo)
- [Monorepo.tools](https://monorepo.tools/)

---

**导航**  
[上一章：包安全与合规](./35-security-compliance.md) | [返回目录](../README.md)

---

## 🎉 完成

恭喜！你已经完成了包管理器学习系统的所有36章内容。

**总结：**
- 📚 36章系统化内容
- 🎯 涵盖npm、Yarn、pnpm三大包管理器
- 🔧 从基础到高级的完整知识体系
- 💼 企业级最佳实践和安全规范
- 🚀 Monorepo和工程化实战

**下一步：**
- 实践各章节的示例代码
- 在实际项目中应用最佳实践
- 持续关注包管理器的最新发展

**感谢学习！** 🙏
