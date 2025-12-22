# 第 35 章：代码评审规范

## 概述

代码评审是规范落地的重要环节。结合自动化工具的代码评审，既能避免重复检查格式问题，又能聚焦于更高层次的代码质量。本章介绍如何构建高效的代码评审流程。

## 一、评审与自动化的分工

### 1.1 自动化检查范围

| 检查项 | 工具 | 说明 |
|--------|------|------|
| 代码格式 | Prettier | 缩进、空格、换行 |
| 语法错误 | ESLint | 潜在错误、未使用变量 |
| 类型错误 | TypeScript | 类型不匹配 |
| 样式规范 | Stylelint | CSS 规则检查 |
| 测试覆盖 | Jest | 覆盖率报告 |

### 1.2 人工评审聚焦点

| 检查项 | 说明 |
|--------|------|
| 业务逻辑 | 实现是否符合需求 |
| 架构设计 | 代码结构是否合理 |
| 可维护性 | 代码是否易于理解和修改 |
| 性能考量 | 是否存在性能问题 |
| 安全风险 | 是否存在安全漏洞 |
| 边界情况 | 异常处理是否完善 |

## 二、评审流程设计

### 2.1 标准流程

```
1. 开发者提交 PR
       ↓
2. CI 自动检查（lint、test、build）
       ↓
3. 自动检查通过 → 分配评审人
       ↓
4. 评审人审查代码
       ↓
5. 提出修改建议 / 批准合并
       ↓
6. 开发者修改 → 重新评审
       ↓
7. 合并代码
```

### 2.2 CI 自动检查配置

```yaml
# .github/workflows/pr-check.yml
name: PR Check

on: pull_request

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npm run typecheck
      
      - name: Test
        run: npm run test -- --coverage
      
      - name: Build
        run: npm run build
```

### 2.3 自动分配评审人

```yaml
# .github/CODEOWNERS
# 前端代码
/src/components/  @frontend-team
/src/pages/       @frontend-team

# 样式文件
*.css             @frontend-team @design-team
*.scss            @frontend-team @design-team

# 配置文件
.eslintrc*        @tech-lead
.prettierrc*      @tech-lead
```

## 三、评审检查清单

### 3.1 通用检查清单

```markdown
# 代码评审检查清单

## 功能实现
- [ ] 代码实现是否符合需求
- [ ] 边界情况是否处理
- [ ] 错误处理是否完善

## 代码质量
- [ ] 命名是否清晰表达意图
- [ ] 函数是否职责单一
- [ ] 是否存在重复代码
- [ ] 复杂逻辑是否有注释

## 性能
- [ ] 是否有不必要的计算
- [ ] 是否有内存泄漏风险
- [ ] 依赖是否合理引入

## 安全
- [ ] 用户输入是否验证
- [ ] 敏感数据是否保护
- [ ] API 调用是否安全

## 测试
- [ ] 关键逻辑是否有测试
- [ ] 测试是否覆盖边界情况
```

### 3.2 React 特定检查清单

```markdown
# React 代码评审检查清单

## 组件设计
- [ ] 组件职责是否单一
- [ ] Props 定义是否合理
- [ ] 是否需要拆分子组件

## Hooks 使用
- [ ] useEffect 依赖数组是否正确
- [ ] 是否有不必要的 re-render
- [ ] 自定义 Hook 命名是否以 use 开头

## 性能优化
- [ ] 大列表是否使用虚拟滚动
- [ ] 是否合理使用 useMemo/useCallback
- [ ] 图片是否懒加载

## 可访问性
- [ ] 交互元素是否可键盘操作
- [ ] 是否有适当的 aria 属性
- [ ] 图片是否有 alt 文本
```

## 四、评审意见规范

### 4.1 意见分类

```markdown
## 意见类型标记

**[必须]** - 必须修改才能合并
> [必须] 这里存在空指针风险，需要添加判空处理

**[建议]** - 建议修改，但不阻塞合并
> [建议] 这个函数可以提取为独立的工具函数

**[讨论]** - 需要讨论的问题
> [讨论] 这里用 Map 还是 Object 更合适？

**[疑问]** - 不理解的地方
> [疑问] 这个条件判断的业务含义是什么？

**[赞]** - 写得好的地方
> [赞] 这个封装很优雅！
```

### 4.2 好的评审意见示例

```markdown
# ✅ 好的评审意见

## 具体且可操作
> [必须] 第 42 行的 `data.items` 可能为 undefined，建议改为：
> ```javascript
> const items = data?.items ?? [];
> ```

## 解释原因
> [建议] 建议将这个 useEffect 拆分为两个，因为它们有不同的依赖，
> 合在一起会导致不必要的执行。

## 提供替代方案
> [讨论] 这里使用 reduce 可读性不太好，考虑用 for...of 循环：
> ```javascript
> let total = 0;
> for (const item of items) {
>   total += item.price;
> }
> ```
```

### 4.3 避免的评审方式

```markdown
# ❌ 避免的评审方式

## 过于主观
> 这个代码不好看

## 没有建设性
> 重写这个函数

## 格式问题（应由工具处理）
> 这里缩进不对
> 应该用单引号

## 人身攻击
> 你怎么能写出这样的代码
```

## 五、评审效率优化

### 5.1 PR 大小控制

```markdown
# PR 提交规范

## 大小限制
- 单个 PR 不超过 400 行代码变更
- 超过时应拆分为多个 PR

## 拆分原则
- 重构与新功能分开
- 依赖升级单独 PR
- 配置变更单独 PR

## PR 描述模板
```

```markdown
<!-- .github/pull_request_template.md -->
## 变更说明
<!-- 简要描述这个 PR 做了什么 -->

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 配置变更

## 测试说明
<!-- 如何测试这个变更 -->

## 截图（如适用）
<!-- UI 变更请附截图 -->

## 检查清单
- [ ] 代码已自测
- [ ] 添加了必要的测试
- [ ] 文档已更新
```

### 5.2 自动化辅助评审

```yaml
# 自动添加标签
# .github/workflows/label.yml
name: Labeler

on: pull_request

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

```yaml
# .github/labeler.yml
frontend:
  - 'src/components/**'
  - 'src/pages/**'

backend:
  - 'src/api/**'
  - 'src/server/**'

tests:
  - '**/*.test.ts'
  - '**/*.spec.ts'

docs:
  - '**/*.md'
  - 'docs/**'
```

### 5.3 评审时间建议

| PR 大小 | 评审时间 | 建议 |
|---------|----------|------|
| < 100 行 | 15 分钟 | 快速评审 |
| 100-400 行 | 30-60 分钟 | 标准评审 |
| > 400 行 | 建议拆分 | 分批评审 |

## 六、评审工具集成

### 6.1 GitHub PR 评审

```yaml
# 要求评审通过才能合并
# Repository Settings → Branches → Branch protection rules
# ☑ Require a pull request before merging
# ☑ Require approvals: 1
# ☑ Require status checks to pass
```

### 6.2 自动化评审机器人

```yaml
# 使用 Danger.js 自动评审
# .github/workflows/danger.yml
- name: Danger
  run: npx danger ci
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

```javascript
// dangerfile.js
import { danger, warn, fail } from 'danger';

// PR 大小检查
const bigPRThreshold = 400;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn('PR 变更超过 400 行，建议拆分');
}

// 检查是否有测试
const hasTests = danger.git.modified_files.some(f => f.includes('.test.'));
const hasSourceChanges = danger.git.modified_files.some(f => f.includes('src/'));
if (hasSourceChanges && !hasTests) {
  warn('源代码有变更但没有测试，请考虑添加测试');
}

// 检查 PR 描述
if (danger.github.pr.body.length < 10) {
  fail('请添加 PR 描述');
}
```

## 七、评审文化建设

### 7.1 评审原则

```markdown
# 代码评审原则

## 尊重
- 评价代码，不评价人
- 使用建设性的语言
- 假设对方的意图是好的

## 学习
- 不懂就问
- 分享知识
- 接受不同意见

## 效率
- 及时响应评审请求
- 聚焦重要问题
- 避免过度追求完美
```

### 7.2 评审指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 首次响应时间 | < 4 小时 | 评审人首次查看 PR |
| 评审完成时间 | < 24 小时 | 完成一轮评审 |
| 评审轮次 | < 3 轮 | 减少来回修改 |

## 八、最佳实践

| 实践 | 说明 |
|------|------|
| 自动化优先 | 格式、语法问题交给工具 |
| 小步提交 | 保持 PR 小而专注 |
| 清晰描述 | PR 描述写清楚变更原因 |
| 及时响应 | 不要让 PR 等待太久 |
| 友善沟通 | 保持专业和尊重 |

## 参考资料

- [Google Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Danger.js](https://danger.systems/js/)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
