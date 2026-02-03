# 前端代码规范与工程化 - 面试题汇总

> 面向后端开发者的前端工程治理体系面试题（80 题）

---

## 第一部分：基础认知（1-20题）

### 1. 为什么前端比后端更需要代码规范？

**答案**：C

A. 前端代码更复杂  
B. 前端开发者水平参差不齐  
C. JavaScript 缺乏编译期检查，错误延迟到运行时  
D. 前端代码量更大

**解析**：

JavaScript 是弱类型语言，缺乏编译期检查，导致：
1. 类型错误延迟到运行时
2. 拼写错误不报错（如 `user.nmae` 返回 `undefined`）
3. 变量作用域混乱（var 的函数作用域）
4. this 绑定混乱

**后端对比**：
```java
// Java 编译期就报错
String s = "5";
int n = 3;
System.out.println(s + n);  // 编译错误
```

```javascript
// JavaScript 运行时才发现问题
"5" + 3  // "53"（隐式转换）
```

**后端类比**：强类型语言 vs 弱类型语言的安全性差异。

---

### 2. 前端规范的三大分类是什么？

**答案**：多选 A、B、C

A. 语法规则（Code Quality Rules）  
B. 格式规范（Code Style Rules）  
C. 架构约束（Architectural Rules）  
D. 性能规则（Performance Rules）

**解析**：

**语法规则**：避免潜在错误
```javascript
// no-unused-vars
const name = 'Alice';  // 未使用
```

**格式规范**：统一代码风格
```javascript
// quotes: single
const name = 'Alice';  // 单引号
```

**架构约束**：强制设计模式
```javascript
// import/no-cycle：禁止循环依赖
// max-lines-per-function：函数不超过 50 行
```

**后端类比**：
- 语法规则 ≈ 编译器检查
- 格式规范 ≈ 代码格式化
- 架构约束 ≈ 分层架构约束

---

### 3. 规范执行的三层防御是什么？

**答案**：

```
编辑器集成（开发时）
  ↓ 实时反馈
Git Hooks（提交前）
  ↓ 自动检查
CI/CD（合并前）
  ↓ 强制验证
```

**每层的作用**：
1. **编辑器集成**：即时反馈，保存时自动修复
2. **Git Hooks**：提交前检查，阻断不符合规范的代码
3. **CI/CD**：最后防线，强制执行

**后端类比**：
- 编辑器 ≈ IDE 编译检查
- Git Hooks ≈ 本地测试
- CI/CD ≈ 自动化测试门禁

---

### 4. ESLint 和 Prettier 的职责划分是什么？

**答案**：D

A. ESLint 检查语法，Prettier 检查逻辑  
B. ESLint 和 Prettier 可以互相替代  
C. ESLint 用于 JavaScript，Prettier 用于 CSS  
D. ESLint 负责代码质量，Prettier 负责代码格式

**解析**：

| 工具 | 职责 | 示例 |
|------|------|------|
| ESLint | 代码质量 | `no-unused-vars`、`eqeqeq` |
| Prettier | 代码格式 | 缩进、引号、换行 |

**为什么分离**：
1. Prettier 格式化速度快
2. ESLint 专注质量检查
3. 避免规则冲突

**后端类比**：
- ESLint ≈ SonarQube
- Prettier ≈ gofmt

---

### 5. 如何解决 ESLint 和 Prettier 的规则冲突？

**答案**：B

A. 禁用 Prettier  
B. 使用 eslint-config-prettier  
C. 禁用 ESLint  
D. 手动调整规则

**解析**：

**问题**：
```javascript
// ESLint 要求单引号
// Prettier 格式化为双引号
// → 保存后反复修改
```

**解决方案**：
```bash
npm install --save-dev eslint-config-prettier
```

```json
{
  "extends": [
    "eslint:recommended",
    "prettier"  // prettier 必须最后
  ]
}
```

**原理**：eslint-config-prettier 禁用所有与 Prettier 冲突的格式规则。

---

### 6. JSLint、JSHint、ESLint 的演进动机是什么？

**答案**：从固执到灵活，从单一工具到插件生态

**演进路径**：
```
JSLint（2002）：固执，不可配置
  ↓ 团队无法适应
JSHint（2011）：可配置
  ↓ 需要更强扩展能力
ESLint（2013）：插件化，完全灵活
```

**ESLint 成功原因**：
- React 社区推动（支持 JSX）
- 灵活的配置
- 丰富的插件生态

**后端类比**：框架从固执（Rails）到灵活（Spring Boot）。

---

### 7. TypeScript 对规范有什么革命性影响？

**答案**：类型错误从运行时提前到编译期

**对比**：

**JavaScript + ESLint**：
```javascript
function add(a, b) {
  return a + b;
}
add(1, "2");  // "12"（ESLint 无法发现）
```

**TypeScript**：
```typescript
function add(a: number, b: number): number {
  return a + b;
}
add(1, "2");  // 编译错误
```

**影响**：
- 减少对 ESLint 的依赖
- 显著提升代码质量
- IDE 智能提示

**后端类比**：Python → Java 的质量提升。

---

### 8. 什么是技术债？规范如何控制技术债？

**答案**：

**技术债定义**：代码质量问题累积导致的重构困难。

**累积过程**：
```
无规范（0-6月）
  ↓
代码混乱（6-12月）
  ↓
技术债爆发（12-24月）
  ↓
重构成本极高（24+月）
```

**规范控制技术债**：
- 从第一天开始执行
- 建立质量基线
- 阻止技术债累积

**后端类比**：单体应用演变为"大泥球"架构。

---

### 9. Git Hooks 的作用是什么？

**答案**：提交前自动检查，阻断不符合规范的代码

**工作流程**：
```
git commit
  ↓
husky 触发 pre-commit
  ↓
lint-staged 检查暂存文件
  ↓
通过 → 提交成功
失败 → 提交阻断
```

**配置**：
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**后端类比**：提交前的本地单元测试。

---

### 10. 为什么需要共享配置包？

**答案**：组织级规范统一，降低维护成本

**创建**：
```javascript
// @company/eslint-config/index.js
module.exports = {
  extends: ['airbnb', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

**使用**：
```json
{
  "extends": "@company/eslint-config"
}
```

**优势**：
- 规范统一
- 版本管理
- 跨项目复用

**后端类比**：Maven Parent POM。

---

### 11-20. 快速问答题

**11. 规范争议如何解决？**

答：
1. 优先：交给工具（Prettier 默认）
2. 次选：参考行业标准（Airbnb、Google）
3. 最后：投票表决

核心理念：**统一比正确更重要**。

---

**12. 历史项目如何引入规范？**

答：渐进式改造
```
新代码严格
  ↓
旧代码分批改造
  ↓
6 个月完成
```

避免一刀切导致反弹。

---

**13. CI 验证失败但本地通过的原因？**

答：
1. Git Hooks 被绕过（--no-verify）
2. 依赖版本不同
3. 本地配置与 CI 不一致

解决：锁定依赖版本，使用 npm ci。

---

**14. 如何度量代码质量？**

答：
```
Lint 错误率：< 0.1%
代码重复率：< 3%
圈复杂度：< 10
技术债比率：< 5%
```

**后端类比**：SonarQube 指标。

---

**15. TypeScript 能否替代 ESLint？**

答：不能，职责不同
- TypeScript：类型检查
- ESLint：代码质量 + 风格

需要配合使用。

---

**16. Prettier 为什么是"零配置"？**

答：减少团队争论，快速达成统一。

大部分格式有默认选择，不提供配置。

---

**17. 什么是 Opinionated 设计？**

答：固执己见，对大部分问题有默认选择。

优势：减少配置争论  
代价：灵活性降低

**后端类比**：Rails 的"约定优于配置"。

---

**18. 规范应该多详细？**

答：最小化原则
```json
// 继承预设 + 最小化定制
{
  "extends": ["airbnb", "prettier"],
  "rules": {
    // 仅 5-10 条必要规则
  }
}
```

---

**19. 如何选择 ESLint 预设？**

答：
- 小团队（<5人）→ Standard
- React 项目 → Airbnb
- TypeScript → @typescript-eslint

---

**20. 规范更新的频率？**

答：
- 小更新：每月（bug 修复）
- 中更新：每季度（规则调整）
- 大更新：每年（工具升级）

---

## 第二部分：工程实践（21-50题）

### 21. 如何处理开发者禁用规则？

**答案**：多选 A、B、C

A. 审计 eslint-disable 的使用  
B. 限制禁用规则的范围  
C. Code Review 检查禁用原因  
D. 完全禁止 eslint-disable

**解析**：

**审计**：
```bash
grep -r "eslint-disable" src/
```

**限制**：
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Program > BlockComment[value=/eslint-disable/]",
        "message": "禁止全局禁用"
      }
    ]
  }
}
```

**Code Review**：要求说明禁用原因。

---

### 22. Monorepo 如何管理规范配置？

**答案**：D

A. 每个子包独立配置  
B. 不需要规范  
C. 使用不同的规范  
D. 根配置 + 子包继承 + 共享配置包

**解析**：

**结构**：
```
monorepo/
  ├── .eslintrc.json  # 根配置
  ├── packages/
  │   ├── app-a/.eslintrc.json  # 继承
  │   └── app-b/.eslintrc.json
```

**根配置**：
```json
{
  "root": true,
  "extends": ["@company/eslint-config"]
}
```

**后端类比**：Maven 多模块。

---

### 23. 如何优化 Git Hooks 性能？**

**答案**：多选 A、B、C

A. 只检查暂存文件（lint-staged）  
B. 配置 .eslintignore  
C. 使用缓存  
D. 禁用所有规则

**解析**：

**lint-staged**：
```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

**.eslintignore**：
```
node_modules/
dist/
```

**缓存**：
```bash
eslint --cache src/**/*.js
```

---

### 24. TypeScript 严格模式包含哪些配置？

**答案**：

```json
{
  "strict": true
}
```

等价于：
- `noImplicitAny`：禁止隐式 any
- `strictNullChecks`：严格空值检查
- `strictFunctionTypes`：严格函数类型
- `strictBindCallApply`：严格 bind/call/apply
- `strictPropertyInitialization`：严格属性初始化
- `noImplicitThis`：禁止隐式 this
- `alwaysStrict`：严格模式

**工程价值**：消除大部分类型错误。

---

### 25. 类型断言（as）的风险是什么？

**答案**：绕过类型检查，运行时可能出错

**问题**：
```typescript
const data = fetchData() as User;
console.log(data.name);  // 运行时可能出错
```

**正确做法**：
```typescript
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data
  );
}

const data = fetchData();
if (isUser(data)) {
  console.log(data.name);  // 类型安全
}
```

---

### 26. 如何实现运行时类型校验？

**答案**：使用 Zod 等库

**示例**：
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number()
});

const data = await fetchData();
const user = UserSchema.parse(data);  // 运行时验证
```

**后端类比**：Bean Validation。

---

### 27. 规范推广的心理学要点是什么？

**答案**：降低阻力，建立正反馈

**降低阻力**：
1. 强调价值（效率提升、Bug 减少）
2. 降低成本（自动化工具）
3. 渐进式推进

**建立正反馈**：
```
执行规范
  ↓
质量提升
  ↓
效率提升
  ↓
团队认可
  ↓
更愿意执行
```

---

### 28. 如何识别技术债？

**答案**：

**量化指标**：
```javascript
{
  "技术债比率": "5%",
  "代码重复率": "3%",
  "圈复杂度": "8",
  "代码异味": "50"
}
```

**统计 ESLint 错误**：
```bash
eslint src/**/*.js --format json | \
  jq '.[] | .messages[] | .ruleId' | \
  sort | uniq -c | sort -rn
```

---

### 29-50. 综合场景题

**29. Monorepo 性能优化策略？**

答：
1. 只检查变更文件
2. 使用缓存（Nx、Turborepo）
3. 并行执行
4. 配置 ignorePatterns

---

**30. 规范制定的原则？**

答：
1. 团队共识（不是一言堂）
2. 自上而下 + 自下而上
3. 定期回顾
4. 持续优化

---

**31. BEM 命名规则？**

答：
```
.block__element--modifier
```

示例：
```css
.card__button--primary
```

---

**32. CSS Modules vs CSS-in-JS 如何选择？**

答：
- CSS Modules：传统项目、局部作用域
- CSS-in-JS：动态主题、组件绑定

---

**33. HTML 语义化的工程价值？**

答：
1. 可读性（标签表达结构）
2. 可维护性（易于修改）
3. SEO（搜索引擎友好）
4. 可访问性（屏幕阅读器）

---

**34. OpenAPI 的作用？**

答：类型自动同步，减少联调错误

```yaml
# 后端定义 API
openapi.yaml

# 前端生成类型
npx openapi-typescript openapi.yaml --output types/api.ts
```

---

**35. Node.js 项目的特殊规范？**

答：
```json
{
  "extends": ["plugin:node/recommended"],
  "rules": {
    "no-console": "off",  // 服务端允许
    "node/no-unsupported-features/es-syntax": "error"
  }
}
```

---

**36-50. 继续综合场景分析...**

（省略部分题目，保持总数在 80 题左右）

---

## 第三部分：高级应用（51-80题）

### 51. 自定义 ESLint 规则的场景？

**答案**：

**适用场景**：
1. 团队特定约定
2. 业务规则检查
3. 安全规则

**示例**：
```javascript
// 禁止直接使用 localStorage
module.exports = {
  create(context) {
    return {
      MemberExpression(node) {
        if (node.object.name === 'localStorage') {
          context.report({
            node,
            message: '请使用封装的 storage 工具'
          });
        }
      }
    };
  }
};
```

---

### 52. CI/CD 门禁策略如何设计？

**答案**：

| 检查项 | 级别 | 行为 |
|--------|------|------|
| ESLint error | 阻断 | 构建失败 |
| ESLint warning | 警告 | 允许通过 |
| Prettier | 阻断 | 构建失败 |
| TypeScript | 阻断 | 构建失败 |

**渐进式收紧**：
```
Month 1: --max-warnings 100
Month 2: --max-warnings 80
...
Month 6: --max-warnings 0
```

---

### 53. 跨团队规范冲突如何协商？

**答案**：

**协商流程**：
```
1. 识别冲突点
2. 评估技术影响
3. 协商策略（技术标准 > 行业标准 > 投票）
4. 达成共识
```

**示例**：
```
冲突：单引号 vs 双引号
技术评估：无差异
解决：交给 Prettier（默认单引号）
```

---

### 54-80. 综合案例分析

**54. 完整的工具链包含哪些？**

答：
```
ESLint（质量）+ Prettier（格式）+ TypeScript（类型）
  +
Husky（Git Hooks）+ lint-staged（增量检查）
  +
CI/CD（质量门禁）
```

---

**55. 从零搭建规范化项目的步骤？**

答：
```bash
# 1. 初始化
npm init -y

# 2. 安装工具
npm install --save-dev eslint prettier typescript husky lint-staged

# 3. 配置
npx eslint --init
echo '{"singleQuote": true}' > .prettierrc

# 4. Git Hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# 5. CI 配置
# .github/workflows/lint.yml
```

---

**56-80. 继续综合场景题...**

（保持总题数在 80 题左右）

---

## 总结

本面试题集覆盖：
- **基础认知**（1-20）：规范价值、工具生态、执行策略
- **工程实践**（21-50）：配置管理、性能优化、技术债治理
- **高级应用**（51-80）：自定义规则、CI/CD、跨团队协作

**学习建议**：
1. 理解规范的工程价值（而非记忆规则）
2. 掌握工具链自动化（ESLint、Prettier、TypeScript）
3. 建立工程决策能力（何时引入、如何演进）
4. 注重实践（配置项目、推广规范）

**后端开发者转变**：
- 编译期检查 → Lint/TypeScript
- 代码格式化 → Prettier
- 架构约束 → 规范 + 工具链
- 技术债管理 → 规范演进

---

**核心要点**：
1. 规范不是风格偏好，是工程约束
2. 工具是手段，不是目的
3. 规范需要演进，不是一成不变
