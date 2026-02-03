# Prettier 设计哲学与协作机制

## 概述

Prettier 专注于代码格式化，通过"零配置"与 Opinionated 设计消除团队格式争论。理解 Prettier 的核心在于掌握其与 ESLint 的职责划分。

**核心认知**：
- Prettier 解决"格式混乱对协作的影响"，而非代码质量
- "零配置"降低决策成本，Opinionated 设计统一风格
- ESLint 负责质量，Prettier 负责格式，两者互补

**后端类比**：
- Prettier ≈ gofmt、Black（代码格式化工具）
- 零配置 ≈ 约定优于配置
- Opinionated 设计 ≈ 框架的默认行为

---

## Prettier 的工程价值

### 格式统一 vs 个人风格

**无格式统一的问题**：

```javascript
// 开发者 A
const user = {
    name: "Alice",
    age: 18
};

// 开发者 B
const user = { name: "Bob", age: 20 };

// 开发者 C
const user = {
  name:    "Charlie",
  age:     25
};
```

**协作成本**：
- Git diff 充斥格式变更
- Code Review 陷入格式争论
- 认知负担高

---

**Prettier 统一后**：

```javascript
// 所有开发者使用相同格式
const user = {
  name: "Alice",
  age: 18,
};
```

**收益**：
- Git diff 只显示逻辑变更
- Code Review 专注于逻辑
- 认知负担降低

**后端类比**：数据库命名规范统一（user_info）。

---

### 格式混乱对协作的影响

**场景 1：Git 历史混乱**

```diff
# 无 Prettier
- const name = "Alice";
+ const name = 'Alice';
- const age=18;
+ const age = 18;

# 有 Prettier
- return user.name;
+ return user.profile.name;  // 真实逻辑变更
```

---

**场景 2：Code Review 陷入格式争论**

```
无 Prettier：
Reviewer: "这里应该用单引号"
Author: "我习惯用双引号"
Reviewer: "团队标准是单引号"
→ 浪费 10 分钟讨论格式

有 Prettier：
自动格式化
→ Review 专注于逻辑
→ 节省 100% 格式讨论时间
```

---

## Prettier 的设计哲学

### "零配置"的工程考量

**传统格式化工具**：
```json
// 繁琐的配置
{
  "indent": 2,
  "quotes": "single",
  "semi": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  // ... 50+ 配置项
}
```

**Prettier 的简化**：
```json
// 最小配置
{
  "singleQuote": true,
  "printWidth": 80
}
```

**设计目标**：
> 减少决策，统一风格。

**工程收益**：
- 降低上手成本
- 减少团队争论
- 快速达成共识

---

### Opinionated 设计的优势与代价

**Opinionated（固执己见）**：Prettier 对大部分格式有默认选择，不提供配置。

**示例**：
```javascript
// 对象换行规则（不可配置）
const user = {
  name: "Alice",
  age: 18,
};  // 自动添加尾逗号

// 字符串拼接（不可配置）
const message = 
  "Hello, " +
  "World";  // 自动换行
```

**优势**：
1. 减少配置争论
2. 快速达成统一
3. 降低维护成本

**代价**：
1. 部分团队习惯需要调整
2. 某些场景格式可能不符合预期
3. 灵活性降低

**核心理念**：
> 统一比完美更重要。

**后端类比**：Spring Boot 的"约定优于配置"。

---

## ESLint 与 Prettier 职责划分

### 职责边界

| 工具 | 职责 | 示例 |
|------|------|------|
| ESLint | 代码质量 | `no-unused-vars`、`eqeqeq` |
| Prettier | 代码格式 | 缩进、引号、换行 |

**为什么分离**：
1. Prettier 格式化速度快（不需要 AST 深度分析）
2. ESLint 专注于质量检查
3. 避免规则冲突
4. 职责清晰，易于维护

**后端类比**：
- ESLint ≈ SonarQube（质量分析）
- Prettier ≈ gofmt（格式化）

---

### 规则冲突解决

**问题场景**：

```javascript
// ESLint 要求单引号
// Prettier 格式化为双引号
// → 保存后反复修改
```

**解决方案：eslint-config-prettier**

```bash
npm install --save-dev eslint-config-prettier
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "prettier"  // prettier 必须最后，禁用冲突规则
  ]
}
```

**工作原理**：
- eslint-config-prettier 禁用所有与 Prettier 冲突的 ESLint 格式规则
- ESLint 只负责代码质量
- Prettier 负责代码格式

**验证冲突**：
```bash
npx eslint-config-prettier 'src/**/*.js'
```

---

### 工具协作示例

**配置**：

**.eslintrc.json**（代码质量）：
```json
{
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "error",
    "eqeqeq": "error"
  }
}
```

**.prettierrc**（代码格式）：
```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

**执行顺序**：
```
1. ESLint 检查代码质量
2. ESLint --fix 自动修复质量问题
3. Prettier 格式化代码
4. 提交
```

---

## 自动化执行

### 保存时格式化

**VSCode 配置**：
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**优势**：
- 即时反馈
- 零人工成本
- 提升开发体验

---

### Git Hooks 格式化

**lint-staged 配置**：
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

**工作流程**：
```
git commit
  ↓
husky 触发 pre-commit
  ↓
lint-staged 执行
  ↓
ESLint --fix（质量问题）
  ↓
Prettier（格式化）
  ↓
提交成功
```

---

### CI 中的格式化验证

**GitHub Actions**：
```yaml
# .github/workflows/format.yml
name: Format Check

on: [push, pull_request]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Prettier Check
        run: npm run format:check
```

**package.json 脚本**：
```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

**效果**：
- 强制执行格式统一
- 阻断不符合格式的代码合并

---

## Prettier 配置原则

### 最小配置原则

**推荐配置**（仅 4 项）：
```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

**原因**：
- Prettier 的默认配置经过深思熟虑
- 过度配置违背"零配置"理念
- 减少团队争论

---

### 常见配置项的工程意义

**singleQuote**（单引号 vs 双引号）：
```json
{
  "singleQuote": true  // 单引号
}
```

**工程意义**：技术上无差异，统一即可。

---

**printWidth**（每行字符数）：
```json
{
  "printWidth": 100  // 默认 80
}
```

**工程意义**：
- 80：适合小屏幕、严格风格
- 100：适合现代显示器、宽松风格
- 120：可能过宽，降低可读性

---

**trailingComma**（尾逗号）：
```json
{
  "trailingComma": "es5"  // 数组、对象末尾加逗号
}
```

**工程意义**：
- 减少 Git diff（添加新元素时不修改上一行）
- 避免手动添加逗号的遗漏

**示例**：
```javascript
// trailingComma: "es5"
const arr = [
  1,
  2,
  3,  // 尾逗号
];
```

---

## 深入一点：为什么 Prettier 不是 ESLint 的替代品

### Prettier 的局限性

**1. 只处理格式，不检查质量**

```javascript
// Prettier 不会发现的问题
const name = 'Alice';  // 未使用变量
if (value == null) {}  // 应使用 ===
```

**2. 无法检查逻辑错误**

```javascript
// Prettier 不会发现的问题
function add(a, b) {
  return a - b;  // 逻辑错误
}
```

**3. 无法强制架构约束**

```javascript
// Prettier 不会发现的问题
import utils from '../../../utils';  // 跨层级导入
```

---

### ESLint 的局限性

**1. 格式规则繁多且冲突**

ESLint 有 100+ 条格式规则，配置复杂：
```json
{
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    // ... 100+ 条
  }
}
```

**2. 格式化速度慢**

ESLint 需要深度 AST 分析，格式化速度不如 Prettier。

---

### 最佳组合

```
ESLint：代码质量
  +
Prettier：代码格式
  =
完整的代码规范体系
```

**后端类比**：
- ESLint ≈ 单元测试（保证逻辑正确）
- Prettier ≈ 代码格式化（保证风格统一）

---

## 参考资料

- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Prettier vs Linters](https://prettier.io/docs/en/comparison.html)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [Prettier Playground](https://prettier.io/playground/)
