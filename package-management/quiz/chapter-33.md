# 第 33 章：工程化最佳实践 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 代码规范

### 题目

ESLint 和 Prettier 的区别是什么？

**选项：**
- A. 功能完全相同
- B. ESLint 检查代码质量，Prettier 格式化代码
- C. Prettier 检查质量，ESLint 格式化
- D. 都只做格式化

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**ESLint vs Prettier**

#### ESLint

**代码质量检查：**
```javascript
// ❌ ESLint 错误
const x = 1;
x = 2;  // 不可修改常量

if (true) {
  console.log('always');  // 无用条件
}
```

#### Prettier

**代码格式化：**
```javascript
// 格式化前
const obj={a:1,b:2,c:3};

// 格式化后
const obj = { a: 1, b: 2, c: 3 };
```

#### 配合使用

```json
{
  "extends": [
    "eslint:recommended",
    "prettier"  // 禁用 ESLint 格式规则
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** Git Hooks

### 题目

Husky 可以在 Git commit 前运行检查。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Husky Git Hooks**

#### 安装配置

```bash
npm install -D husky
npx husky install
```

#### pre-commit Hook

```bash
npx husky add .husky/pre-commit "npm test"
```

**.husky/pre-commit：**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm test
```

**commit 前自动运行**

#### 配合 lint-staged

```json
{
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit：**
```bash
npx lint-staged
```

**只检查暂存的文件**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 提交规范

### 题目

Conventional Commits 的格式是什么？

**选项：**
- A. [type] message
- B. type: message
- C. type(scope): message
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Conventional Commits 规范**

#### 基本格式

```
type(scope): subject

body

footer
```

#### 示例

**简单：**
```
feat: add login feature
fix: resolve button color issue
```

**完整：**
```
feat(auth): add OAuth login

Add Google and GitHub OAuth providers

BREAKING CHANGE: remove password login
Closes #123
```

#### Type 类型

- **feat** - 新功能
- **fix** - 修复
- **docs** - 文档
- **style** - 格式
- **refactor** - 重构
- **test** - 测试
- **chore** - 构建/工具

#### 工具

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

**commitlint.config.js：**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

**.husky/commit-msg：**
```bash
npx --no -- commitlint --edit $1
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 工程化工具

### 题目

现代前端工程化包括哪些方面？

**选项：**
- A. 代码规范
- B. 自动化测试
- C. 持续集成
- D. 性能监控

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**前端工程化体系**

#### A. 代码规范 ✅

```json
{
  "scripts": {
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

#### B. 自动化测试 ✅

```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage"
  }
}
```

#### C. 持续集成 ✅

```yaml
# .github/workflows/ci.yml
- run: npm run lint
- run: npm test
- run: npm run build
```

#### D. 性能监控 ✅

```javascript
// 性能监控
import { report } from 'web-vitals';

report(console.log);
```

#### 完整工程化方案

```
代码规范
├── ESLint
├── Prettier
├── Stylelint
└── Commitlint

测试
├── 单元测试 (Vitest)
├── 集成测试 (Testing Library)
└── E2E测试 (Playwright)

构建
├── Vite/Webpack
├── TypeScript
└── Babel

CI/CD
├── GitHub Actions
├── 代码审查
└── 自动部署

监控
├── 性能监控
├── 错误追踪
└── 日志分析
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 配置共享

### 题目

如何在 Monorepo 中共享 ESLint 配置？

<details>
<summary>查看答案</summary>

### ✅ 答案

**共享 ESLint 配置**

#### 方案 1：创建共享包

**tooling/eslint-config/package.json：**
```json
{
  "name": "@myorg/eslint-config",
  "version": "1.0.0",
  "main": "index.js"
}
```

**tooling/eslint-config/index.js：**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

#### 使用

**packages/ui/.eslintrc.js：**
```javascript
module.exports = {
  extends: ['@myorg/eslint-config']
};
```

#### 方案 2：根目录配置

**.eslintrc.js：**
```javascript
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn'
  },
  overrides: [
    {
      files: ['packages/ui/**'],
      rules: {
        'react/prop-types': 'error'
      }
    }
  ]
};
```

**子包继承**

#### 完整示例

**tooling/eslint-config/package.json：**
```json
{
  "name": "@myorg/eslint-config",
  "main": "index.js",
  "peerDependencies": {
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

**tooling/eslint-config/index.js：**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  env: {
    node: true,
    es2020: true
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' }
    ]
  }
};
```

**packages/ui/.eslintrc.js：**
```javascript
module.exports = {
  extends: ['@myorg/eslint-config'],
  env: {
    browser: true
  },
  rules: {
    // 覆盖或新增规则
    'react/prop-types': 'error'
  }
};
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 类型检查

### 题目

如何在 Monorepo 中配置 TypeScript？

**选项：**
- A. 每个包独立配置
- B. 根目录统一配置
- C. 使用继承机制
- D. C 是最佳实践

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**TypeScript Monorepo 配置**

#### 根配置

**tsconfig.base.json：**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

#### 包配置

**packages/ui/tsconfig.json：**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "jsx": "react"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### 项目引用

**tsconfig.json：**
```json
{
  "files": [],
  "references": [
    { "path": "./packages/ui" },
    { "path": "./packages/utils" },
    { "path": "./apps/web" }
  ]
}
```

**增量构建支持**

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 文档生成

### 题目

如何为包生成 API 文档？

<details>
<summary>查看答案</summary>

### ✅ 答案

**API 文档生成**

#### TypeDoc

```bash
npm install -D typedoc
```

**typedoc.json：**
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "excludePrivate": true,
  "excludeProtected": true,
  "readme": "README.md"
}
```

**package.json：**
```json
{
  "scripts": {
    "docs": "typedoc"
  }
}
```

#### TSDoc 注释

```typescript
/**
 * 添加两个数字
 * 
 * @param a - 第一个数字
 * @param b - 第二个数字
 * @returns 两数之和
 * 
 * @example
 * ```typescript
 * add(1, 2) // 3
 * ```
 * 
 * @public
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

#### API Extractor

```bash
npm install -D @microsoft/api-extractor
```

**api-extractor.json：**
```json
{
  "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
  "apiReport": {
    "enabled": true,
    "reportFolder": "<projectFolder>/temp/"
  },
  "docModel": {
    "enabled": true,
    "apiJsonFilePath": "<projectFolder>/temp/<unscopedPackageName>.api.json"
  },
  "dtsRollup": {
    "enabled": true,
    "untrimmedFilePath": "<projectFolder>/dist/index.d.ts"
  }
}
```

**生成统一的 .d.ts 和 API 报告**

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 完整工具链

### 题目

设计一个完整的 Monorepo 工具链。

<details>
<summary>查看答案</summary>

### ✅ 答案

**Monorepo 完整工具链**

#### 1. 包管理

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tooling/*'
```

#### 2. 代码规范

**tooling/eslint-config/index.js：**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ]
};
```

**tooling/prettier-config/index.js：**
```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all'
};
```

**tooling/tsconfig/base.json：**
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

#### 3. Git Hooks

**package.json：**
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit：**
```bash
#!/bin/sh
npx lint-staged
```

**.husky/commit-msg：**
```bash
#!/bin/sh
npx --no -- commitlint --edit $1
```

#### 4. 构建工具

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

#### 5. 测试框架

**vitest.config.ts：**
```typescript
export default {
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html']
    }
  }
};
```

#### 6. CI/CD

**.github/workflows/ci.yml：**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      
      - uses: actions/setup-node@v3
        with:
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - run: turbo run lint test build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
```

#### 7. 文档

**scripts/generate-docs.js：**
```javascript
const { execSync } = require('child_process');

// 为每个包生成文档
execSync('turbo run docs');

// 聚合到统一文档站点
```

#### 8. 发布管理

**.changeset/config.json：**
```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main"
}
```

### 📖 解析

**工具链清单**

- ✅ pnpm Workspace
- ✅ Turborepo
- ✅ TypeScript
- ✅ ESLint + Prettier
- ✅ Husky + lint-staged
- ✅ Commitlint
- ✅ Vitest
- ✅ Changesets
- ✅ GitHub Actions
- ✅ TypeDoc

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 迁移方案

### 题目

如何将传统项目迁移到现代工程化体系？

<details>
<summary>查看答案</summary>

### ✅ 答案

**工程化迁移方案**

#### Phase 1：基础设施

**1. 包管理器：**
```bash
# 迁移到 pnpm
npm install -g pnpm
pnpm import  # 从 package-lock.json 导入
pnpm install
```

**2. TypeScript：**
```bash
pnpm add -D typescript @types/node
npx tsc --init
```

**tsconfig.json：**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "allowJs": true,
    "checkJs": true,
    "strict": false  // 逐步启用
  }
}
```

**3. 代码规范：**
```bash
pnpm add -D eslint prettier
npx eslint --init
```

#### Phase 2：工具集成

**1. Git Hooks：**
```bash
pnpm add -D husky lint-staged
npx husky install
```

**2. Commitlint：**
```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

**3. 测试框架：**
```bash
pnpm add -D vitest @testing-library/react
```

#### Phase 3：构建优化

**1. Vite：**
```bash
pnpm add -D vite
```

**vite.config.js：**
```javascript
export default {
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs']
    }
  }
};
```

**2. 代码分割：**
```javascript
// 懒加载
const Component = lazy(() => import('./Component'));
```

#### Phase 4：CI/CD

**1. GitHub Actions：**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

**2. 自动发布：**
```yaml
- name: Publish
  if: github.ref == 'refs/heads/main'
  run: pnpm publish
```

#### 迁移清单

```markdown
## Phase 1: 基础设施 (Week 1-2)
- [ ] pnpm
- [ ] TypeScript (allowJs + checkJs)
- [ ] ESLint + Prettier

## Phase 2: 工具集成 (Week 3-4)
- [ ] Husky + lint-staged
- [ ] Commitlint
- [ ] 测试框架

## Phase 3: 构建优化 (Week 5-6)
- [ ] Vite/Webpack
- [ ] 代码分割
- [ ] Tree Shaking

## Phase 4: CI/CD (Week 7-8)
- [ ] GitHub Actions
- [ ] 自动测试
- [ ] 自动发布

## Phase 5: 监控优化 (Week 9-10)
- [ ] 性能监控
- [ ] 错误追踪
- [ ] 日志分析
```

#### 渐进式策略

```
传统项目
    ↓ 添加工具
现代化项目
    ↓ 优化构建
高性能项目
    ↓ 自动化
完全工程化
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 质量检查

### 题目

实现一个项目质量检查工具。

<details>
<summary>查看答案</summary>

### ✅ 答案

**项目质量检查工具**

```javascript
#!/usr/bin/env node
// scripts/quality-check.js

const fs = require('fs');
const { execSync } = require('child_process');

class QualityChecker {
  constructor() {
    this.score = 100;
    this.issues = [];
    this.passed = [];
  }

  // 检查 package.json
  checkPackageJson() {
    console.log('📦 检查 package.json...');

    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // 必需字段
      const required = ['name', 'version', 'description', 'license'];
      required.forEach(field => {
        if (!pkg[field]) {
          this.score -= 5;
          this.issues.push(`缺少 ${field} 字段`);
        }
      });

      // scripts
      const recommendedScripts = ['test', 'build', 'lint'];
      recommendedScripts.forEach(script => {
        if (!pkg.scripts?.[script]) {
          this.score -= 3;
          this.issues.push(`缺少 ${script} 脚本`);
        }
      });

      // engines
      if (!pkg.engines) {
        this.score -= 2;
        this.issues.push('未指定 engines');
      }

      this.passed.push('package.json 检查');
    } catch (e) {
      this.score -= 10;
      this.issues.push('package.json 无效');
    }
  }

  // 检查 README
  checkReadme() {
    console.log('📄 检查 README...');

    if (!fs.existsSync('README.md')) {
      this.score -= 10;
      this.issues.push('缺少 README.md');
      return;
    }

    const readme = fs.readFileSync('README.md', 'utf8');

    // 检查章节
    const sections = ['Installation', 'Usage', 'API'];
    sections.forEach(section => {
      if (!readme.includes(section)) {
        this.score -= 2;
        this.issues.push(`README 缺少 ${section} 章节`);
      }
    });

    this.passed.push('README 检查');
  }

  // 检查 LICENSE
  checkLicense() {
    console.log('⚖️  检查 LICENSE...');

    if (!fs.existsSync('LICENSE')) {
      this.score -= 5;
      this.issues.push('缺少 LICENSE 文件');
    } else {
      this.passed.push('LICENSE 检查');
    }
  }

  // 检查 TypeScript
  checkTypeScript() {
    console.log('🔷 检查 TypeScript...');

    if (!fs.existsSync('tsconfig.json')) {
      this.score -= 5;
      this.issues.push('未使用 TypeScript');
      return;
    }

    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.passed.push('TypeScript 类型检查');
    } catch (e) {
      this.score -= 10;
      this.issues.push('TypeScript 类型错误');
    }
  }

  // 检查代码规范
  checkLinting() {
    console.log('✨ 检查代码规范...');

    if (!fs.existsSync('.eslintrc.js') && !fs.existsSync('.eslintrc.json')) {
      this.score -= 5;
      this.issues.push('未配置 ESLint');
      return;
    }

    try {
      execSync('npx eslint . --max-warnings 0', { stdio: 'pipe' });
      this.passed.push('ESLint 检查');
    } catch (e) {
      this.score -= 10;
      this.issues.push('ESLint 有警告或错误');
    }
  }

  // 检查测试
  checkTests() {
    console.log('🧪 检查测试...');

    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (!pkg.scripts?.test) {
      this.score -= 10;
      this.issues.push('未配置测试脚本');
      return;
    }

    try {
      execSync('npm test', { stdio: 'pipe' });
      this.passed.push('测试通过');
    } catch (e) {
      this.score -= 15;
      this.issues.push('测试失败');
    }
  }

  // 检查测试覆盖率
  checkCoverage() {
    console.log('📊 检查测试覆盖率...');

    try {
      const output = execSync('npx vitest run --coverage --reporter=json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const coverage = JSON.parse(output);
      const percent = coverage.total?.lines?.pct || 0;

      if (percent < 50) {
        this.score -= 10;
        this.issues.push(`测试覆盖率过低: ${percent}%`);
      } else if (percent < 80) {
        this.score -= 5;
        this.issues.push(`测试覆盖率偏低: ${percent}%`);
      } else {
        this.passed.push(`测试覆盖率: ${percent}%`);
      }
    } catch (e) {
      // 跳过
    }
  }

  // 检查依赖
  checkDependencies() {
    console.log('📦 检查依赖...');

    try {
      const output = execSync('npm outdated --json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const outdated = JSON.parse(output || '{}');
      const count = Object.keys(outdated).length;

      if (count > 10) {
        this.score -= 10;
        this.issues.push(`${count} 个依赖过期`);
      } else if (count > 5) {
        this.score -= 5;
        this.issues.push(`${count} 个依赖过期`);
      }
    } catch (e) {
      // npm outdated 返回非零
    }

    // 安全审计
    try {
      execSync('npm audit --production --audit-level=high', {
        stdio: 'pipe'
      });
      this.passed.push('安全审计');
    } catch (e) {
      this.score -= 15;
      this.issues.push('存在安全漏洞');
    }
  }

  // 检查 CI
  checkCI() {
    console.log('🔄 检查 CI/CD...');

    const ciFiles = [
      '.github/workflows/ci.yml',
      '.gitlab-ci.yml',
      '.circleci/config.yml'
    ];

    const hasCI = ciFiles.some(f => fs.existsSync(f));

    if (!hasCI) {
      this.score -= 5;
      this.issues.push('未配置 CI/CD');
    } else {
      this.passed.push('CI/CD 配置');
    }
  }

  // 生成报告
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 项目质量报告');
    console.log('='.repeat(60));

    // 评分
    const score = Math.max(0, this.score);
    const grade = score >= 90 ? 'A' :
                  score >= 80 ? 'B' :
                  score >= 70 ? 'C' :
                  score >= 60 ? 'D' : 'F';

    console.log(`\n总分: ${score}/100 (${grade})\n`);

    // 通过的检查
    if (this.passed.length > 0) {
      console.log('✅ 通过的检查:');
      this.passed.forEach(item => {
        console.log(`  ✓ ${item}`);
      });
      console.log();
    }

    // 问题
    if (this.issues.length > 0) {
      console.log('⚠️  发现的问题:');
      this.issues.forEach(issue => {
        console.log(`  ✗ ${issue}`);
      });
      console.log();
    }

    // 建议
    console.log('💡 改进建议:');
    
    if (score < 70) {
      console.log('  1. 项目质量较低，需要全面改进');
      console.log('  2. 优先修复安全和测试问题');
    } else if (score < 90) {
      console.log('  1. 补充缺失的文档和配置');
      console.log('  2. 提高测试覆盖率');
    } else {
      console.log('  1. 保持当前质量水平');
      console.log('  2. 持续优化和改进');
    }

    console.log('\n');

    return score >= 70 ? 0 : 1;
  }

  // 运行所有检查
  async run() {
    console.log('🔍 开始项目质量检查\n');

    this.checkPackageJson();
    this.checkReadme();
    this.checkLicense();
    this.checkTypeScript();
    this.checkLinting();
    this.checkTests();
    this.checkCoverage();
    this.checkDependencies();
    this.checkCI();

    return this.generateReport();
  }
}

// 运行
const checker = new QualityChecker();
checker.run()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('❌ 检查失败:', err);
    process.exit(1);
  });
```

**使用：**
```bash
node scripts/quality-check.js
```

**CI 集成：**
```yaml
- name: Quality Check
  run: node scripts/quality-check.js
```

### 📖 解析

**检查项目**

1. ✅ package.json 完整性
2. ✅ README 文档
3. ✅ LICENSE
4. ✅ TypeScript 类型
5. ✅ 代码规范
6. ✅ 测试通过
7. ✅ 测试覆盖率
8. ✅ 依赖安全
9. ✅ CI/CD 配置

**确保项目质量！**

</details>

---

**导航**  
[上一章：第 32 章面试题](./chapter-32.md) | [返回目录](../README.md) | [下一章：第 34 章面试题](./chapter-34.md)
