# 第 44 章：大型团队统一方案

## 概述

百人以上的大型团队面临跨团队协作、多项目管理、规范一致性等挑战。本章介绍企业级代码规范体系的建设方案。

## 一、企业级挑战

### 1.1 主要问题

| 挑战 | 影响 |
|------|------|
| 团队众多 | 各团队规范不一致 |
| 项目分散 | 配置重复维护 |
| 人员流动 | 规范传承困难 |
| 技术栈多样 | 难以统一管理 |

### 1.2 解决方案

```
统一规范体系
├── 中心化配置包
├── 自动化工具链
├── 规范治理流程
└── 监控与度量
```

## 二、中心化配置包

### 2.1 内部 NPM 包结构

```
@company/eslint-config/
├── package.json
├── index.js          # 基础配置
├── react.js          # React 项目
├── vue.js            # Vue 项目
├── node.js           # Node.js 项目
└── typescript.js     # TypeScript 增强
```

### 2.2 基础配置

```javascript
// @company/eslint-config/index.js
module.exports = {
  extends: ['eslint:recommended'],
  env: { es2021: true },
  rules: {
    // 公司统一规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always']
  }
};
```

### 2.3 框架配置

```javascript
// @company/eslint-config/react.js
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  }
};
```

### 2.4 项目使用

```javascript
// 各项目 .eslintrc.js
module.exports = {
  extends: ['@company/eslint-config/react'],
  rules: {
    // 项目特定规则（需审批）
  }
};
```

## 三、自动化工具链

### 3.1 CLI 工具

```javascript
// @company/lint-cli
// 统一的规范检查入口
const commands = {
  init: '初始化规范配置',
  check: '检查代码规范',
  fix: '自动修复问题',
  report: '生成规范报告'
};

// 使用
// npx @company/lint-cli init
// npx @company/lint-cli check
```

### 3.2 项目脚手架集成

```javascript
// 脚手架自动配置规范
module.exports = {
  prompts: [
    { name: 'projectType', choices: ['react', 'vue', 'node'] }
  ],
  actions: [
    // 根据项目类型安装对应配置
    { type: 'add', files: '.eslintrc.js', template: 'eslint-{{projectType}}' },
    { type: 'add', files: '.prettierrc', template: 'prettier' }
  ]
};
```

### 3.3 CI/CD 集成

```yaml
# 统一的 CI 模板
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: company/lint-action@v1
        with:
          config: '@company/eslint-config/react'
```

## 四、规范治理流程

### 4.1 组织架构

```
技术委员会
├── 规范工作组
│   ├── 规范制定
│   ├── 工具维护
│   └── 培训支持
└── 各业务团队
    └── 规范执行
```

### 4.2 规则变更流程

```
1. 提出 RFC（规则变更提案）
       ↓
2. 技术评审（影响评估）
       ↓
3. 试点验证（1-2个项目）
       ↓
4. 全员公示（2周）
       ↓
5. 正式发布
```

### 4.3 RFC 模板

```markdown
# RFC: 添加 xxx 规则

## 背景
描述为什么需要这个规则

## 方案
具体的规则配置

## 影响
- 影响项目数：约 50 个
- 预计工作量：每项目 1 小时
- 可自动修复：是

## 时间表
- 试点期：2024-01-15 ~ 2024-01-31
- 正式生效：2024-02-15
```

## 五、监控与度量

### 5.1 中央仪表盘

```javascript
// 收集各项目规范数据
const metrics = {
  projects: [
    {
      name: 'project-a',
      team: 'team-1',
      errors: 0,
      warnings: 12,
      configVersion: '2.1.0',
      lastCheck: '2024-01-15'
    }
  ],
  summary: {
    totalProjects: 50,
    compliantProjects: 48,
    totalErrors: 15,
    avgWarnings: 8.5
  }
};
```

### 5.2 合规检查

```yaml
# 定期检查各项目配置版本
- name: Check config version
  run: |
    CURRENT=$(cat package.json | jq -r '.devDependencies["@company/eslint-config"]')
    LATEST=$(npm view @company/eslint-config version)
    if [ "$CURRENT" != "$LATEST" ]; then
      echo "::warning::Config outdated: $CURRENT vs $LATEST"
    fi
```

### 5.3 团队排名

```markdown
# 代码规范月度排名

| 排名 | 团队 | 合规率 | 问题数 |
|------|------|--------|--------|
| 1 | Team A | 100% | 0 |
| 2 | Team B | 98% | 5 |
| 3 | Team C | 95% | 12 |
```

## 六、培训体系

### 6.1 培训层次

| 层次 | 对象 | 内容 |
|------|------|------|
| 基础 | 全员 | 规范使用、工具配置 |
| 进阶 | 技术骨干 | 规范原理、问题处理 |
| 专家 | 规范维护者 | 规范制定、工具开发 |

### 6.2 培训材料

- 新人入职手册
- 视频教程（录播）
- 定期技术分享
- FAQ 知识库

## 七、例外处理

### 7.1 例外申请流程

```markdown
# 规范例外申请

## 项目信息
- 项目：xxx
- 团队：xxx
- 申请人：xxx

## 申请内容
- 规则：no-console
- 当前配置：error
- 申请配置：off
- 原因：日志服务需要 console

## 审批
- [ ] 团队负责人
- [ ] 规范工作组
```

### 7.2 临时豁免

```javascript
// 允许特定文件例外
overrides: [
  {
    files: ['src/legacy/**'],
    rules: {
      // 历史代码临时豁免
      'no-unused-vars': 'warn'
    }
  }
]
```

## 八、版本管理

### 8.1 版本策略

```
major.minor.patch

major: 不兼容变更（需要迁移）
minor: 新增规则（默认 warn）
patch: bug 修复、文档更新
```

### 8.2 升级通知

```markdown
# @company/eslint-config v3.0.0 发布

## 重大变更
- 升级 ESLint 到 9.x
- 迁移到 flat config

## 迁移指南
1. 运行迁移脚本：`npx @company/lint-cli migrate`
2. 检查并修复问题
3. 提交变更

## 截止日期
- 2024-03-31 前完成迁移
```

## 九、成功指标

| 指标 | 目标 |
|------|------|
| 配置统一率 | > 95% |
| 最新版本采用率 | > 80% |
| CI 通过率 | > 99% |
| 新项目合规率 | 100% |

## 十、经验总结

### 10.1 成功要素

- **高层支持**：获得管理层认可
- **工具先行**：自动化减少阻力
- **循序渐进**：分阶段推进
- **持续运营**：长期维护和优化

### 10.2 常见陷阱

- 规则过严导致抵触
- 缺乏例外机制
- 忽视历史项目
- 培训不到位

## 参考资料

- [Google Engineering Practices](https://google.github.io/eng-practices/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [微软 TypeScript 编码规范](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
