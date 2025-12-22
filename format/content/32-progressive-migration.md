# 第 32 章：渐进式迁移

## 概述

为遗留项目引入代码规范是一项挑战。全量修复可能带来大量代码变更和潜在风险，而完全忽略历史代码又会导致规范形同虚设。本章介绍渐进式迁移策略，在保证稳定性的同时逐步提升代码质量。

## 一、迁移挑战

### 1.1 常见困境

| 挑战 | 影响 |
|------|------|
| 历史代码量大 | 一次性修复工作量巨大 |
| 风险不可控 | 大量变更可能引入 bug |
| 团队抵触 | 突然的严格规范降低开发效率 |
| git 历史污染 | 格式化提交淹没业务提交 |

### 1.2 迁移原则

```
1. 不破坏现有功能
2. 新代码立即执行新规范
3. 旧代码逐步迁移
4. 可量化的迁移进度
```

## 二、迁移策略

### 2.1 策略对比

| 策略 | 风险 | 工作量 | 适用场景 |
|------|------|--------|----------|
| 全量修复 | 高 | 集中 | 小型项目、重构期 |
| 完全忽略旧代码 | 低 | 低 | 临时方案 |
| 渐进式迁移 | 中 | 分散 | 大型项目（推荐） |

### 2.2 渐进式迁移流程

```
阶段1: 基础设施搭建
    ↓
阶段2: 新代码强制执行
    ↓
阶段3: 高优先级旧代码修复
    ↓
阶段4: 逐步提升覆盖率
    ↓
阶段5: 全量执行
```

## 三、阶段一：基础设施搭建

### 3.1 安装工具

```bash
npm install eslint prettier stylelint -D
npm install eslint-config-prettier -D
npm install husky lint-staged -D
```

### 3.2 宽松的初始配置

```javascript
// .eslintrc.js - 初始宽松配置
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    // 只启用关键规则
    'no-debugger': 'error',
    'no-dupe-keys': 'error',
    'no-unreachable': 'error',
    
    // 其他规则暂时关闭或警告
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'off'
  }
};
```

### 3.3 忽略历史代码

```javascript
// .eslintrc.js
module.exports = {
  ignorePatterns: [
    'src/legacy/**',      // 忽略遗留代码目录
    'src/**/*.old.js'     // 忽略特定文件
  ]
};
```

## 四、阶段二：新代码强制执行

### 4.1 lint-staged 配置

只对新增/修改的文件执行检查：

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 4.2 Git Hooks

```bash
# .husky/pre-commit
npx lint-staged
```

### 4.3 overrides 差异化规则

```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'prefer-const': 'off'  // 默认宽松
  },
  overrides: [
    {
      // 新代码目录使用严格规则
      files: ['src/features/**/*.{js,ts}', 'src/components/**/*.{js,ts}'],
      rules: {
        'prefer-const': 'error',
        'no-var': 'error',
        'no-unused-vars': 'error'
      }
    },
    {
      // 旧代码目录使用宽松规则
      files: ['src/legacy/**/*.js'],
      rules: {
        'no-unused-vars': 'warn',
        'prefer-const': 'off'
      }
    }
  ]
};
```

## 五、阶段三：高优先级修复

### 5.1 确定优先级

| 优先级 | 规则类型 | 示例 |
|--------|----------|------|
| P0 | 安全问题 | `no-eval`, `no-implied-eval` |
| P1 | 潜在错误 | `no-unused-vars`, `no-undef` |
| P2 | 最佳实践 | `eqeqeq`, `no-var` |
| P3 | 代码风格 | `quotes`, `semi` |

### 5.2 分批修复脚本

```json
{
  "scripts": {
    "lint:critical": "eslint src/ --rule 'no-eval: error' --rule 'no-debugger: error'",
    "lint:errors": "eslint src/ --quiet",
    "lint:all": "eslint src/"
  }
}
```

### 5.3 自动修复安全规则

```bash
# 只修复可自动修复的问题
npx eslint src/ --fix --rule 'prefer-const: error' --rule 'no-var: error'

# 分目录修复
npx eslint src/utils/ --fix
npx eslint src/components/ --fix
```

## 六、阶段四：逐步提升覆盖率

### 6.1 规则渐进式启用

```javascript
// 第一周：启用基础规则
rules: {
  'no-var': 'warn',
  'prefer-const': 'warn'
}

// 第二周：升级为错误
rules: {
  'no-var': 'error',
  'prefer-const': 'error'
}

// 第三周：添加新规则
rules: {
  'no-var': 'error',
  'prefer-const': 'error',
  'arrow-body-style': 'warn'  // 新规则先警告
}
```

### 6.2 目录渐进式覆盖

```javascript
// .eslintrc.js
module.exports = {
  overrides: [
    // 第一批：核心模块
    {
      files: ['src/core/**/*.js'],
      rules: { /* 严格规则 */ }
    },
    // 第二批：组件
    {
      files: ['src/components/**/*.js'],
      rules: { /* 严格规则 */ }
    },
    // 第三批：页面
    {
      files: ['src/pages/**/*.js'],
      rules: { /* 严格规则 */ }
    }
  ]
};
```

### 6.3 进度追踪

```bash
# 统计问题数量
npx eslint src/ --format json | jq '.reduce(0; . + .[].errorCount)'

# 生成报告
npx eslint src/ --format html -o reports/eslint-report.html
```

## 七、阶段五：全量执行

### 7.1 移除忽略规则

```javascript
// 最终配置
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error'
  }
  // 移除 ignorePatterns 中的遗留目录
};
```

### 7.2 CI 强制检查

```yaml
# .github/workflows/lint.yml
- name: ESLint
  run: npm run lint
  # 移除 continue-on-error
```

## 八、格式化迁移

### 8.1 一次性格式化

```bash
# 单独提交格式化变更
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
git add -A
git commit -m "style: apply prettier formatting"
```

### 8.2 减少 git blame 影响

```bash
# 创建 .git-blame-ignore-revs 文件
echo "abc123def456" >> .git-blame-ignore-revs

# 配置 git 忽略该提交
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

### 8.3 分批格式化

```bash
# 按目录分批格式化
npx prettier --write "src/utils/**/*.js"
git commit -m "style: format utils"

npx prettier --write "src/components/**/*.js"
git commit -m "style: format components"
```

## 九、团队协作

### 9.1 沟通计划

```markdown
# 代码规范迁移计划

## 时间表
- Week 1-2: 基础设施搭建
- Week 3-4: 新代码强制执行
- Week 5-8: 逐步修复旧代码
- Week 9+: 全量执行

## 影响
- 新功能开发：需遵循新规范
- Bug 修复：顺便修复相关文件的规范问题
- 重构：按新规范重写

## 支持
- 问题反馈：#channel-code-quality
- 文档：/docs/code-standards
```

### 9.2 处理抵触

```
常见抵触及应对：

1. "太严格了"
   → 提供 warn 级别过渡期
   → 收集反馈调整规则

2. "修复太耗时"
   → 提供自动修复脚本
   → 允许 disable 注释（需说明原因）

3. "历史代码不想动"
   → 使用 overrides 差异化配置
   → 只要求改动文件符合规范
```

### 9.3 例外处理

```javascript
// 允许的例外情况（需注释说明原因）
// eslint-disable-next-line no-eval -- 第三方SDK要求
eval(thirdPartyCode);

/* eslint-disable no-unused-vars */
// TODO: 待重构时移除
const legacyHandler = () => {};
/* eslint-enable no-unused-vars */
```

## 十、监控与度量

### 10.1 定义指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| 错误数 | ESLint error count | 逐周下降 |
| 覆盖率 | 已迁移文件/总文件 | 每月+10% |
| 新增问题 | 本周新增error数 | 0 |

### 10.2 自动化报告

```yaml
# .github/workflows/metrics.yml
- name: Generate Lint Metrics
  run: |
    npx eslint src/ --format json > lint-report.json
    echo "errors=$(cat lint-report.json | jq '[.[].errorCount] | add')" >> $GITHUB_OUTPUT
    echo "warnings=$(cat lint-report.json | jq '[.[].warningCount] | add')" >> $GITHUB_OUTPUT
```

### 10.3 可视化仪表盘

```javascript
// scripts/lint-metrics.js
const { execSync } = require('child_process');
const result = execSync('npx eslint src/ --format json').toString();
const data = JSON.parse(result);

const metrics = {
  totalFiles: data.length,
  filesWithErrors: data.filter(f => f.errorCount > 0).length,
  totalErrors: data.reduce((sum, f) => sum + f.errorCount, 0),
  totalWarnings: data.reduce((sum, f) => sum + f.warningCount, 0)
};

console.log(JSON.stringify(metrics, null, 2));
```

## 十一、完整迁移检查清单

### 11.1 准备阶段

- [ ] 评估现有代码量和问题数
- [ ] 制定迁移时间表
- [ ] 获得团队和管理层支持
- [ ] 准备文档和培训材料

### 11.2 执行阶段

- [ ] 安装和配置工具
- [ ] 设置 Git Hooks
- [ ] 配置 CI 检查
- [ ] 逐步启用规则
- [ ] 定期报告进度

### 11.3 收尾阶段

- [ ] 移除所有临时忽略
- [ ] 全量执行规范检查
- [ ] 更新文档
- [ ] 团队总结回顾

## 参考资料

- [ESLint 迁移指南](https://eslint.org/docs/user-guide/migrating-to-8.0.0)
- [大规模代码重构实践](https://martinfowler.com/articles/refactoring-2nd-cd.html)
- [渐进式技术债务管理](https://www.thoughtworks.com/insights/blog/managing-technical-debt)
