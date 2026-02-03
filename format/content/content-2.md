# 规范执行策略与工具链自动化

## 概述

代码规范的价值在于**执行**，而非制定。工程化的本质是将规范从"人工审查"升级为"自动化约束"，通过工具链集成实现三层防御。

**核心认知**：
- 能自动化的，绝不人工
- 分层防御：编辑器 → Git Hooks → CI/CD
- 工具演进反映工程化思维成熟：从固执到灵活，从单一到生态

**后端类比**：
- 人工 Code Review ≈ 人工测试
- 工具自动化 ≈ 单元测试 + CI/CD
- 三层防御 ≈ 多层安全防护

---

## 规范执行的三层防御

### 第一层：编辑器集成（开发时）

**目标**：实时反馈，即时修复

**VSCode 配置**：
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.run": "onType"
}
```

**推荐插件**：
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

**优势**：
- 即时反馈（边写边检查）
- 自动修复（保存时格式化）
- 零人工成本

**问题**：依赖开发者本地配置，可能被禁用。

**后端类比**：IDE 的编译错误实时提示。

---

### 第二层：Git Hooks（提交前）

**目标**：提交前自动检查，阻断不符合规范的代码

**Husky + lint-staged 配置**：
```bash
# 安装
npm install --save-dev husky lint-staged

# 初始化
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**package.json 配置**：
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}
```

**工作流程**：
```
git commit
  ↓
husky 触发 pre-commit hook
  ↓
lint-staged 检查暂存文件
  ↓
ESLint --fix 自动修复
  ↓
Prettier 格式化
  ↓
通过 → 提交成功
失败 → 提交阻断
```

**优势**：
- 强制执行（无法轻易绕过）
- 只检查变更文件（性能好）
- 自动修复（减少人工成本）

**问题**：可以用 `--no-verify` 绕过（需要 CI 补充）。

**后端类比**：提交前的本地单元测试。

---

### 第三层：CI/CD 集成（合并前）

**目标**：最后一道防线，确保代码质量

**GitHub Actions 配置**：
```yaml
# .github/workflows/lint.yml
name: Code Quality Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: ESLint Check
        run: npm run lint
      
      - name: Prettier Check
        run: npm run format:check
      
      - name: TypeScript Check
        run: npm run type-check
```

**优势**：
- 强制执行（无法绕过）
- 统一标准（所有人相同环境）
- 自动化报告

**后端类比**：CI 中的自动化测试门禁。

---

## 前端规范工具演进史

### 2002：JSLint 诞生

**特点**：严格且固执（Opinionated），不可配置

**示例规则**：
```javascript
// JSLint 强制要求
for (var i = 0; i < 10; i++) {}  // 必须用空格

// JSLint 禁止
++i;  // 禁止 ++ 运算符
```

**问题**：规则过于严格，团队难以适应。

**设计理念**：
> "JSLint will hurt your feelings."

---

### 2011：JSHint 诞生

**特点**：JSLint 的分支，可配置，更友好

**配置示例**：
```json
{
  "undef": true,
  "unused": true,
  "eqeqeq": true,
  "browser": true
}
```

**改进**：团队可以选择启用/禁用规则。

**问题**：规则相对简单，不支持自定义规则。

---

### 2013：ESLint 诞生

**特点**：完全可配置、插件化架构、支持自定义规则

**设计目标**：
```
1. 所有规则可插拔
2. 任何规则可配置
3. 易于扩展
4. 支持 JSX、ES6+
```

**成功原因**：
- React 社区推动（支持 JSX）
- 灵活的配置
- 丰富的插件生态
- 自动修复能力

**后端类比**：SonarQube 的插件化架构。

---

### 2017：Prettier 诞生

**特点**：专注于代码格式化，"零配置"理念

**设计哲学**：
> "格式化不应该有争议，交给工具决定。"

**配置最小化**：
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80
}
```

**为什么需要 Prettier**：

ESLint 的格式规则繁多且冲突：
```json
// ESLint 格式规则
{
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "max-len": ["error", { "code": 80 }],
    // ... 100+ 格式规则
  }
}
```

Prettier 简化为：
```json
{
  "singleQuote": true,
  "printWidth": 80
}
```

**职责分离**：
- ESLint：代码质量
- Prettier：代码格式

**后端类比**：
- ESLint ≈ SonarQube（质量分析）
- Prettier ≈ gofmt（格式化）

---

### 2018：TypeScript 的革命性影响

**TypeScript 对规范的改变**：

**传统规范**：
```javascript
// 依赖 ESLint 检查
function add(a, b) {
  return a + b;
}
add(1, "2");  // ESLint 无法发现类型错误
```

**TypeScript 规范**：
```typescript
// 类型系统编译期检查
function add(a: number, b: number): number {
  return a + b;
}
add(1, "2");  // 编译错误：类型不匹配
```

**影响**：
1. 类型错误从运行时提前到编译期
2. 减少对 ESLint 的依赖
3. 显著提升代码质量

**后端类比**：从动态语言（Python）迁移到静态语言（Java）。

---

## 工具选择策略

### ESLint vs Prettier vs TypeScript

**职责划分**：

| 工具 | 职责 | 示例 |
|------|------|------|
| ESLint | 代码质量 | `no-unused-vars`、`eqeqeq` |
| Prettier | 代码格式 | 缩进、引号、换行 |
| TypeScript | 类型检查 | `string` vs `number` |

**为什么要分离**：
1. Prettier 格式化速度快（不需要 AST 深度分析）
2. ESLint 专注于质量检查
3. TypeScript 提供类型安全
4. 避免规则冲突

**工具组合**：
```bash
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier
```

**后端类比**：微服务的职责分离原则。

---

### 主流预设选择

**推荐预设**：

| 预设 | 适用场景 | 特点 |
|------|---------|------|
| Airbnb | React 项目、大型团队 | 严格、工程化 |
| Standard | 小团队、快速上手 | 零配置、固执 |
| Google | Google 技术栈 | 简洁、实用 |

**选择策略**：
```
团队规模：
- 小团队（<5人）→ Standard
- 中大团队 → Airbnb / Google

技术栈：
- React 项目 → Airbnb
- Vue 项目 → eslint-plugin-vue
- TypeScript → @typescript-eslint
```

**配置示例**：
```json
{
  "extends": [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    // 仅覆盖必要的 5-10 条规则
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**原则**：继承主流预设 + 最小化定制。

---

## 工具链集成实战

### 完整配置步骤

**1. 初始化项目**：
```bash
npm init -y
```

**2. 安装工具**：
```bash
npm install --save-dev \
  eslint \
  prettier \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  husky \
  lint-staged
```

**3. 初始化配置**：
```bash
# ESLint 配置
npx eslint --init

# Prettier 配置
echo '{"singleQuote": true, "semi": true}' > .prettierrc

# Git Hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**4. package.json 脚本**：
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

### 配置文件详解

**.eslintrc.json**：
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**.prettierrc**：
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

**.prettierignore**：
```
node_modules/
dist/
build/
coverage/
*.min.js
```

---

## 常见问题与解决

### 问题 1：ESLint 和 Prettier 规则冲突

**现象**：
```
ESLint 要求单引号
Prettier 格式化为双引号
→ 保存后反复修改
```

**解决方案**：
```bash
npm install --save-dev eslint-config-prettier
```

```json
{
  "extends": [
    "eslint:recommended",
    "prettier"  // prettier 必须最后，禁用冲突规则
  ]
}
```

---

### 问题 2：Git Hooks 性能问题

**现象**：`git commit` 耗时过长

**解决方案**：

**1. 只检查暂存文件**：
```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

**2. 配置 .eslintignore**：
```
node_modules/
dist/
build/
```

**3. 使用缓存**：
```bash
eslint --cache src/**/*.js
```

---

### 问题 3：CI 验证失败但本地通过

**原因**：
1. Git Hooks 被绕过（`--no-verify`）
2. 依赖版本不同
3. 本地配置与 CI 不一致

**解决方案**：

**1. 锁定依赖版本**：
```json
{
  "devDependencies": {
    "eslint": "8.30.0",
    "prettier": "2.8.1"
  }
}
```

**2. CI 使用 npm ci**：
```yaml
- name: Install dependencies
  run: npm ci  # 使用 package-lock.json
```

**3. 本地验证**：
```bash
npm run lint
npm run format:check
npm run type-check
```

---

## 深入一点：工具演进的动机

### 动机 1：从固执到灵活

```
JSLint（固执）
  ↓ 团队无法适应
JSHint（可配置）
  ↓ 需要更强大的扩展能力
ESLint（插件化）
```

**工程启示**：工具必须适应团队，而非团队适应工具。

---

### 动机 2：从单一到生态

```
单一工具（JSLint）
  ↓ 需求多样化
工具生态（ESLint + Prettier + TypeScript）
```

**职责分离优势**：
- 各司其职，易于维护
- 工具升级独立
- 社区生态丰富

**后端类比**：微服务架构的演进。

---

### 动机 3：从人工到自动

```
人工检查
  ↓ 成本高、效率低
编辑器集成
  ↓ 依赖本地配置
Git Hooks + CI
  ↓ 强制执行
```

**自动化程度演进**：
```
2002: 手动运行 JSLint
2013: 编辑器集成 ESLint
2015: Git Hooks 自动检查
2018: CI 强制验证
```

**后端类比**：测试从手动到自动化的演进。

---

## 参考资料

- [ESLint Getting Started](https://eslint.org/docs/user-guide/getting-started)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
