# 历史代码改造与技术债治理

## 概述

历史代码的规范改造是技术债治理的核心。理解改造策略的关键在于掌握增量改造、技术债识别、规范失效场景的应对。

**核心认知**：
- 增量改造优于一次性重构，降低风险
- 技术债需要量化、分级、追踪
- 规范失效需要主动识别与修复

**后端类比**：
- 历史代码改造 ≈ 遗留系统重构
- 增量改造 ≈ 绞杀者模式（Strangler Pattern）
- 技术债追踪 ≈ Bug 管理系统

---

## 历史代码规范改造

### 增量改造 vs 一次性重构

**一次性重构**：
```
停止所有开发
  ↓
全面重写代码
  ↓
风险高、成本高
  ↓
可能失败
```

**问题**：
- 业务压力大（功能无法交付）
- 风险高（可能引入新 Bug）
- 成本高（团队全力投入）

---

**增量改造**（推荐）：
```
新代码严格执行规范
  ↓
旧代码分模块改造
  ↓
每周改造 1 个模块
  ↓
6 个月完成全部改造
```

**优势**：
- 风险可控
- 业务不中断
- 成本分摊

**后端类比**：微服务改造的绞杀者模式。

---

### 增量改造策略

**阶段 1：止血（新代码严格）**

```json
// .eslintrc.json
{
  "overrides": [
    {
      "files": ["src/new/**"],
      "rules": {
        "no-unused-vars": "error",
        "eqeqeq": "error"
      }
    },
    {
      "files": ["src/legacy/**"],
      "rules": {
        "no-unused-vars": "off",  // 旧代码暂时关闭
        "eqeqeq": "off"
      }
    }
  ]
}
```

**效果**：
- 技术债不再增加
- 新代码质量高

---

**阶段 2：分模块改造（3-6 个月）**

```
Week 1-2: 改造 src/user/ 模块
Week 3-4: 改造 src/product/ 模块
Week 5-6: 改造 src/order/ 模块
...
Week 24: 全部模块改造完成
```

**改造流程**：
```bash
# 1. 自动修复
eslint --fix src/user/**/*.js

# 2. 查看剩余问题
eslint src/user/**/*.js

# 3. 人工修复复杂问题
# 4. 测试验证
# 5. 提交代码
```

---

**阶段 3：统一规范（6 个月后）**

```json
// .eslintrc.json
{
  "extends": ["airbnb", "prettier"],
  "rules": {
    // 全部代码使用统一规范
  }
}
```

---

### 自动化迁移工具

**ESLint 自动修复**：
```bash
# 自动修复所有可修复问题
eslint --fix src/**/*.js

# 查看修复效果
git diff
```

**效果**：
- 修复 60-80% 的问题
- 剩余问题需要人工处理

---

**jscodeshift（代码转换工具）**：

**场景**：将 var 转换为 const/let

```javascript
// transform.js
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // 查找所有 var 声明
  root.find(j.VariableDeclaration, { kind: 'var' })
    .forEach(path => {
      const declarations = path.value.declarations;
      // 判断是否重新赋值
      const hasReassignment = checkReassignment(declarations);
      path.value.kind = hasReassignment ? 'let' : 'const';
    });
  
  return root.toSource();
};
```

**使用**：
```bash
jscodeshift -t transform.js src/**/*.js
```

**后端类比**：数据库 migration 工具。

---

## 技术债识别与优先级

### 技术债的量化

**SonarQube 示例指标**：
```javascript
{
  "技术债比率": "5%",    // < 5% 为健康
  "代码重复率": "3%",    // < 3% 为良好
  "圈复杂度": "8",      // < 10 为良好
  "代码异味": "50",     // 持续减少
  "安全漏洞": "0"       // 必须为 0
}
```

**ESLint 错误统计**：
```bash
# 统计错误数量
eslint src/**/*.js --format json | \
  jq '[.[] | .messages[]] | length'

# 按规则分类统计
eslint src/**/*.js --format json | \
  jq '.[] | .messages[] | .ruleId' | \
  sort | uniq -c | sort -rn
```

**输出示例**：
```
150 no-console
 80 no-unused-vars
 50 complexity
 30 max-lines-per-function
```

**后端类比**：代码质量平台（SonarQube）的指标。

---

### 技术债优先级判断

**P0：严重问题**（立即修复）
```
- 安全漏洞（eval、innerHTML）
- 未定义变量（no-undef）
- 类型错误（TypeScript）
```

**P1：质量问题**（3 个月内修复）
```
- 未使用变量（no-unused-vars）
- 使用 var（no-var）
- 使用 == 而非 ===（eqeqeq）
```

**P2：风格问题**（6 个月内修复）
```
- 代码格式（交给 Prettier）
- 命名规范
```

**P3：优化问题**（可选）
```
- 函数复杂度（complexity）
- 文件行数（max-lines）
```

---

### 技术债追踪

**创建技术债看板**：
```
TODO（待修复）
  ↓
IN PROGRESS（修复中）
  ↓
REVIEW（代码审查）
  ↓
DONE（已完成）
```

**技术债卡片**：
```markdown
## 技术债 #123

**类型**：P1 质量问题

**描述**：src/user/ 模块存在 50 个 no-var 错误

**影响范围**：用户模块

**修复计划**：
- Week 1: 自动修复 40 个
- Week 2: 人工修复 10 个

**负责人**：@Alice

**截止日期**：2024-03-01

**状态**：IN PROGRESS
```

**后端类比**：Bug 追踪系统（Jira）。

---

## 规范失效场景

### eslint-disable 审计

**问题场景**：
```javascript
// 开发者为了快速提交，禁用规则
/* eslint-disable */
function messy() {
  var a=1,b=2
  if(a==b)return true
}
```

**审计命令**：
```bash
# 查找所有 eslint-disable
grep -r "eslint-disable" src/

# 统计数量
grep -r "eslint-disable" src/ | wc -l

# 按文件分组
grep -r "eslint-disable" src/ | \
  cut -d: -f1 | sort | uniq -c | sort -rn
```

**输出示例**：
```
10 src/user/legacy.js
 5 src/product/old.js
 3 src/order/utils.js
```

**分析**：
- `legacy.js` 需要重点改造
- 定期清理临时禁用

---

### 规范被绕过的常见场景

**场景 1：使用 --no-verify 绕过 Git Hooks**

```bash
# 开发者绕过检查
git commit --no-verify -m "快速提交"
```

**检测**：
```bash
# CI 中强制验证
npm run lint
npm run format:check
npm run type-check
```

**解决**：
- CI 强制验证（无法绕过）
- 团队文化（禁止使用 --no-verify）

---

**场景 2：规则被全局禁用**

```javascript
// ❌ 全局禁用
/* eslint-disable */
// 整个文件的代码
/* eslint-enable */
```

**检测**：
```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Program > BlockComment[value=/eslint-disable/]",
        "message": "禁止全局禁用 ESLint"
      }
    ]
  }
}
```

---

**场景 3：配置文件被修改**

```json
// 开发者偷偷降低规则级别
{
  "rules": {
    "no-unused-vars": "off"  // 原本是 "error"
  }
}
```

**检测**：
- Code Review 检查配置变更
- 锁定配置文件（使用共享配置包）

---

### 规范执行的监控与度量

**定期审计**：
```bash
# 每周执行
npm run lint > lint-report-$(date +%Y%m%d).txt

# 统计错误趋势
grep "error" lint-report-*.txt | wc -l
```

**可视化**：
```javascript
// 错误趋势图
{
  "2024-01": 500,
  "2024-02": 400,
  "2024-03": 300,
  "2024-04": 200
}
```

**目标**：
- 错误数量持续下降
- 新增错误为 0

---

## 深入一点：技术债的心理账户

### 技术债的累积心理

**初期**：
```
"这个项目很小，不需要规范"
  ↓
无规范约束
  ↓
代码混乱
```

**中期**：
```
"代码有点乱，但还能改"
  ↓
技术债累积
  ↓
修改成本增加
```

**后期**：
```
"代码太乱了，不敢改"
  ↓
技术债爆发
  ↓
重写 vs 维持现状
```

**关键点**：
> 技术债要从第一天开始控制。

---

### 破窗理论

**一个小问题 → 更多问题**：
```
第一个 eslint-disable
  ↓
"既然别人可以禁用，我也可以"
  ↓
越来越多人禁用
  ↓
规范形同虚设
```

**应对**：
- 零容忍原则
- 及时修复小问题
- Code Review 严格把关

**后端类比**：代码腐化的加速效应。

---

## 工程实践案例

### 案例：某电商项目的技术债治理

**背景**：
- 项目 3 年，30 万行代码
- 无规范约束
- 技术债严重

**技术债表现**：
```
1. 全局变量 200+
2. 单个文件 5000+ 行
3. 函数嵌套 10+ 层
4. 重复代码 40%
5. 循环依赖 50+ 处
```

**改造方案**：

**阶段 1：止血（1-2 个月）**
```json
{
  "overrides": [
    {
      "files": ["src/new/**"],
      "rules": {
        "no-implicit-globals": "error",
        "max-lines": ["error", 500],
        "max-depth": ["error", 4],
        "import/no-cycle": "error"
      }
    }
  ]
}
```

**阶段 2：渐进式改造（3-12 个月）**
```
Month 1-3: 修复全局变量、循环依赖
Month 4-6: 拆分巨型文件
Month 7-9: 简化复杂函数
Month 10-12: 消除重复代码
```

**阶段 3：持续优化（12+ 个月）**
- 定期代码审计
- 技术债度量
- 持续改进

**效果**：
```
开发效率：+150%
Bug 率：-60%
离职率：-50%
新功能交付时间：5 天 → 2 天
```

---

## 参考资料

- [Working Effectively with Legacy Code](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052)
- [Refactoring](https://refactoring.com/)
- [Technical Debt - Martin Fowler](https://martinfowler.com/bliki/TechnicalDebt.html)
- [jscodeshift](https://github.com/facebook/jscodeshift)
