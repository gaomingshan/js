# 第 45 章：开源项目规范案例

## 概述

开源项目面向全球开发者，规范设计需要兼顾易理解、易参与和可维护性。本章分析知名开源项目的规范策略，总结可借鉴的实践经验。

## 一、开源项目特点

### 1.1 特殊挑战

| 挑战 | 说明 |
|------|------|
| 贡献者分散 | 背景、经验差异大 |
| 异步协作 | 缺乏实时沟通 |
| 代码评审 | 维护者时间有限 |
| 版本兼容 | 用户环境多样 |

### 1.2 规范目标

```
1. 降低参与门槛
2. 保证代码一致性
3. 减少维护者负担
4. 提升社区信任
```

## 二、React 规范分析

### 2.1 配置特点

```javascript
// React 使用 fbjs 配置
{
  "extends": ["fbjs", "prettier"]
}
```

**核心规则**：
- 严格的 Flow 类型检查
- 一致的导入排序
- 禁止使用特定 API

### 2.2 贡献流程

```markdown
1. Fork 仓库
2. 阅读 CONTRIBUTING.md
3. 运行 `yarn lint` 确保通过
4. 提交 PR
5. CI 自动检查
6. 维护者评审
```

### 2.3 可借鉴点

- 完善的贡献指南
- 自动化 CI 检查
- 清晰的代码风格文档

## 三、Vue 规范分析

### 3.1 配置特点

```javascript
// Vue 3 源码配置
{
  "extends": [
    "plugin:vue-libs/recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier"
  ]
}
```

### 3.2 独特实践

- **自定义 ESLint 插件**：vue-libs 针对 Vue 生态
- **严格的 TypeScript**：完整的类型定义
- **Prettier 统一格式**：减少风格争议

### 3.3 贡献检查

```yaml
# Vue 的 CI 检查
- lint
- type-check
- unit-test
- e2e-test
```

## 四、Vite 规范分析

### 4.1 配置特点

```javascript
// Vite 使用简洁配置
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```

### 4.2 独特实践

- **Monorepo 结构**：统一的根配置
- **pnpm workspace**：依赖管理
- **Vitest**：测试覆盖

### 4.3 自动化

```yaml
# 自动格式化 PR
- name: Format
  run: pnpm format
- name: Commit if changed
  run: |
    git diff --quiet || git commit -m "chore: format"
```

## 五、Next.js 规范分析

### 5.1 配置特点

```javascript
// Next.js 内置 ESLint 配置
{
  "extends": ["next/core-web-vitals"]
}
```

### 5.2 独特实践

- **框架内置规范**：用户零配置
- **性能规则**：Core Web Vitals 相关检查
- **TypeScript 优先**：完善的类型支持

### 5.3 贡献者体验

```markdown
# 贡献指南亮点
- 详细的本地开发说明
- 清晰的 PR 模板
- 自动化的 changelog 生成
```

## 六、开源项目最佳实践

### 6.1 文档体系

```
docs/
├── CONTRIBUTING.md    # 贡献指南
├── CODE_OF_CONDUCT.md # 行为准则
├── STYLE_GUIDE.md     # 代码风格
└── DEVELOPMENT.md     # 开发指南
```

### 6.2 CONTRIBUTING.md 模板

```markdown
# 贡献指南

## 开发环境
1. Fork 并克隆仓库
2. 安装依赖：`npm install`
3. 运行测试：`npm test`

## 代码规范
- 运行 `npm run lint` 检查代码
- 运行 `npm run format` 格式化代码
- 确保所有测试通过

## 提交 PR
1. 创建功能分支
2. 提交有意义的 commit message
3. 确保 CI 通过
4. 请求 review

## Commit 规范
格式：`type(scope): message`
类型：feat, fix, docs, style, refactor, test, chore
```

### 6.3 PR 模板

```markdown
## 变更说明
<!-- 描述这个 PR 做了什么 -->

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新

## 检查清单
- [ ] 代码符合规范（lint 通过）
- [ ] 添加了测试
- [ ] 更新了文档
- [ ] 本地测试通过
```

### 6.4 CI 配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

## 七、Issue 和 PR 管理

### 7.1 Issue 模板

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug
body:
  - type: textarea
    attributes:
      label: Bug Description
    validations:
      required: true
  - type: textarea
    attributes:
      label: Steps to Reproduce
    validations:
      required: true
  - type: textarea
    attributes:
      label: Expected Behavior
  - type: input
    attributes:
      label: Version
```

### 7.2 自动化标签

```yaml
# .github/labeler.yml
documentation:
  - '**/*.md'
  - 'docs/**'

tests:
  - '**/*.test.ts'
  - '**/*.spec.ts'

dependencies:
  - 'package.json'
  - 'package-lock.json'
```

## 八、版本发布

### 8.1 语义化版本

```markdown
# 版本号规则
major.minor.patch

major: 不兼容的 API 变更
minor: 向后兼容的功能新增
patch: 向后兼容的问题修复
```

### 8.2 自动化发布

```yaml
# 使用 changesets 管理版本
- name: Create Release
  uses: changesets/action@v1
  with:
    publish: npm run release
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 九、社区运营

### 9.1 响应时间

| 类型 | 目标响应时间 |
|------|--------------|
| 安全问题 | 24小时 |
| Bug 报告 | 3天 |
| 功能请求 | 1周 |
| PR 评审 | 1周 |

### 9.2 贡献者认可

```markdown
# 贡献者列表
感谢所有贡献者！

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
```

### 9.3 行为准则

```markdown
# 行为准则

我们致力于为所有人提供友好、安全和包容的环境。

## 我们的标准
- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
```

## 十、经验总结

### 10.1 成功要素

| 要素 | 说明 |
|------|------|
| 清晰文档 | 降低参与门槛 |
| 自动化 | 减少人工审核负担 |
| 快速响应 | 维护社区活跃度 |
| 包容文化 | 吸引更多贡献者 |

### 10.2 推荐配置

```javascript
// 开源项目推荐 ESLint 配置
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // 保持简单，易于贡献者理解
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
```

### 10.3 检查清单

```markdown
# 开源项目规范检查清单

- [ ] README.md 完整
- [ ] CONTRIBUTING.md 清晰
- [ ] CODE_OF_CONDUCT.md 存在
- [ ] LICENSE 文件存在
- [ ] Issue/PR 模板配置
- [ ] CI 自动化检查
- [ ] 代码规范文档化
- [ ] 版本发布流程自动化
```

## 参考资料

- [GitHub Open Source Guides](https://opensource.guide/)
- [React Contributing Guide](https://reactjs.org/docs/how-to-contribute.html)
- [Vue Contributing Guide](https://github.com/vuejs/core/blob/main/.github/contributing.md)
- [All Contributors](https://allcontributors.org/)
