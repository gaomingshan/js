# 第 38 章：定期规范更新

## 概述

代码规范不是一成不变的，需要随着技术发展、团队成长和项目演进不断调整。本章介绍如何建立规范更新机制，在保持稳定性的同时持续改进。

## 一、更新触发条件

### 1.1 何时需要更新

| 触发条件 | 示例 | 优先级 |
|----------|------|--------|
| 工具升级 | ESLint 9 发布 | 高 |
| 新技术采用 | 引入 React Server Components | 高 |
| 团队反馈 | 规则过严影响效率 | 中 |
| 行业实践变化 | 社区推荐新规则 | 中 |
| 定期审视 | 季度规范回顾 | 低 |

### 1.2 更新原则

```markdown
1. **稳定优先** - 避免频繁变更影响开发
2. **渐进过渡** - 大变更分阶段执行
3. **充分沟通** - 变更前告知团队
4. **可回滚** - 保留回退方案
```

## 二、更新流程

### 2.1 标准流程

```
1. 提出更新需求
       ↓
2. 评估影响范围
       ↓
3. 团队讨论决策
       ↓
4. 制定实施计划
       ↓
5. 灰度发布
       ↓
6. 全量推广
       ↓
7. 文档更新
```

### 2.2 更新申请模板

```markdown
# 规范更新申请

## 基本信息
- 申请人：xxx
- 日期：2024-01-15
- 类型：[ ] 新增规则  [x] 修改规则  [ ] 移除规则

## 更新内容
- 规则：`prefer-const`
- 当前配置：`warn`
- 建议配置：`error`

## 更新原因
团队已适应该规则，`warn` 级别存在被忽略的情况，
建议升级为 `error` 确保执行。

## 影响评估
- 影响文件数：约 50 个
- 可自动修复：是
- 预计工作量：1 小时

## 实施计划
1. 发布公告告知团队
2. 运行 `eslint --fix` 自动修复
3. 单独提交修复变更
4. 更新配置为 `error`
```

### 2.3 评审机制

```markdown
# 规范更新评审

## 评审人员
- 技术负责人（必须）
- 受影响团队代表（必须）
- 架构师（可选）

## 评审标准
- [ ] 变更理由充分
- [ ] 影响范围可控
- [ ] 有明确的实施计划
- [ ] 文档同步更新

## 决策方式
- 小变更：技术负责人批准
- 大变更：团队投票（>50% 同意）
```

## 三、版本管理

### 3.1 语义化版本

```markdown
# 规范版本号规则

## 格式：major.minor.patch

### major（主版本）
- 不兼容的规则变更
- 大量规则升级为 error
- 例：1.0.0 → 2.0.0

### minor（次版本）
- 新增规则（warn 级别）
- 工具版本升级
- 例：1.0.0 → 1.1.0

### patch（修订版本）
- 文档修正
- 配置优化
- 例：1.0.0 → 1.0.1
```

### 3.2 配置包版本管理

```json
// packages/eslint-config/package.json
{
  "name": "@myorg/eslint-config",
  "version": "2.1.0",
  "peerDependencies": {
    "eslint": "^8.0.0"
  }
}
```

```javascript
// 项目中指定版本
{
  "devDependencies": {
    "@myorg/eslint-config": "^2.1.0"
  }
}
```

### 3.3 更新日志

```markdown
# Changelog

## [2.1.0] - 2024-01-15

### Added
- 新增 `@typescript-eslint/strict-boolean-expressions` 规则

### Changed
- `prefer-const` 从 warn 升级为 error
- 更新 `@typescript-eslint/eslint-plugin` 到 6.x

### Deprecated
- `@typescript-eslint/no-explicit-any` 将在 3.0 中设为 error

---

## [2.0.0] - 2024-01-01

### BREAKING CHANGES
- 升级 ESLint 到 9.x
- 迁移到 flat config 格式

### Removed
- 移除对 Node.js 16 的支持
```

## 四、工具升级策略

### 4.1 ESLint 版本升级

```markdown
# ESLint 升级检查清单

## 升级前
- [ ] 阅读官方迁移指南
- [ ] 检查插件兼容性
- [ ] 在测试分支验证

## 升级步骤
1. 升级 eslint 包
2. 升级 @typescript-eslint/* 包
3. 升级其他插件
4. 运行 lint 检查新增问题
5. 修复或调整规则配置

## 验证
- [ ] lint 检查通过
- [ ] CI 流程正常
- [ ] 编辑器集成正常
```

### 4.2 依赖更新脚本

```json
{
  "scripts": {
    "deps:check": "npm outdated",
    "deps:update-lint": "npm update eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier stylelint"
  }
}
```

### 4.3 自动化依赖更新

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      eslint:
        patterns:
          - "eslint*"
          - "@typescript-eslint/*"
      prettier:
        patterns:
          - "prettier*"
      stylelint:
        patterns:
          - "stylelint*"
```

## 五、规则调整策略

### 5.1 新增规则

```javascript
// 新规则先用 warn
rules: {
  'new-rule': 'warn'  // 试行期
}

// 一段时间后升级为 error
rules: {
  'new-rule': 'error'  // 正式启用
}
```

### 5.2 严格化规则

```markdown
# 规则严格化流程

## 第一周：公告
- 发布变更通知
- 说明原因和时间表

## 第二周：warn 过渡
- 将规则设为 warn
- 收集问题反馈

## 第三周：修复期
- 团队修复现有问题
- 运行自动修复

## 第四周：正式启用
- 升级为 error
- 更新文档
```

### 5.3 移除规则

```markdown
# 规则移除流程

## 条件
- 规则已过时
- 与其他工具冲突
- 团队一致认为不适用

## 流程
1. 标记为 deprecated
2. 公告移除计划
3. 在下个主版本移除
4. 更新文档说明原因
```

## 六、团队沟通

### 6.1 变更通知模板

```markdown
# 代码规范更新通知

**日期**：2024-01-15
**版本**：2.1.0
**生效时间**：2024-01-22

## 变更内容

### 新增规则
- `prefer-nullish-coalescing`：优先使用 ?? 运算符

### 规则调整
- `prefer-const`：warn → error

### 工具升级
- ESLint: 8.50.0 → 8.56.0

## 影响说明
- 现有代码需要修复约 30 处 prefer-const 问题
- 可运行 `npm run lint:fix` 自动修复

## 行动项
1. 更新依赖：`npm install`
2. 修复问题：`npm run lint:fix`

## 问题反馈
如有疑问请联系 @tech-lead 或在 #code-standards 频道讨论
```

### 6.2 季度回顾

```markdown
# Q1 代码规范回顾

## 执行情况
- 错误数：120 → 0（-100%）
- 警告数：450 → 200（-56%）
- 首次通过率：65% → 85%

## 收到的反馈
1. `import/order` 规则配置不合理 - 已调整
2. 希望添加 React Hooks 规则 - 已添加

## 下季度计划
1. 升级 ESLint 到 9.x
2. 添加 TypeScript strict 规则
3. 完善 CSS 命名规范

## 讨论事项
- 是否引入 `no-console` 为 error？
- 是否采用新的 flat config 格式？
```

## 七、灰度发布

### 7.1 分阶段推广

```javascript
// eslint.config.js
const isCanary = process.env.ESLINT_CANARY === 'true';

module.exports = {
  rules: {
    // 正式规则
    'prefer-const': 'error',
    
    // 灰度测试的新规则
    ...(isCanary && {
      'new-experimental-rule': 'warn'
    })
  }
};
```

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:canary": "ESLINT_CANARY=true eslint src/"
  }
}
```

### 7.2 A/B 测试

```yaml
# CI 中同时运行两套配置
- name: Lint (current)
  run: npm run lint

- name: Lint (canary)
  run: npm run lint:canary
  continue-on-error: true
```

## 八、回滚机制

### 8.1 配置回滚

```bash
# 使用 git 回滚配置
git revert <commit-hash>

# 或恢复到特定版本
npm install @myorg/eslint-config@2.0.0
```

### 8.2 紧急禁用

```javascript
// 紧急情况临时禁用问题规则
rules: {
  'problematic-rule': 'off'  // TODO: 待修复后恢复
}
```

## 九、自动化工具

### 9.1 配置迁移脚本

```javascript
// scripts/migrate-config.js
const fs = require('fs');

function migrateConfig() {
  const config = JSON.parse(fs.readFileSync('.eslintrc.json'));
  
  // 应用迁移规则
  if (config.rules['old-rule']) {
    config.rules['new-rule'] = config.rules['old-rule'];
    delete config.rules['old-rule'];
  }
  
  fs.writeFileSync('.eslintrc.json', JSON.stringify(config, null, 2));
}

migrateConfig();
```

### 9.2 批量修复脚本

```bash
#!/bin/bash
# scripts/apply-update.sh

echo "Updating lint configuration..."

# 更新依赖
npm install

# 运行自动修复
npm run lint:fix

# 提交变更
git add -A
git commit -m "style: apply lint config update"

echo "Done!"
```

## 十、最佳实践

| 实践 | 说明 |
|------|------|
| 定期审视 | 每季度回顾规范适用性 |
| 渐进变更 | 大变更分阶段实施 |
| 充分测试 | 变更前在测试环境验证 |
| 及时沟通 | 变更前后都要通知团队 |
| 文档同步 | 配置和文档同步更新 |
| 保留回退 | 确保能快速回滚 |

## 参考资料

- [ESLint 迁移指南](https://eslint.org/docs/latest/use/migrating-to-9.0.0)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
