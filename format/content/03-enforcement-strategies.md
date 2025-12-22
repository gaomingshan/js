# 第 3 章：规范执行策略

## 概述

制定代码规范只是第一步，关键在于如何有效地执行这些规范。本章将探讨规范执行的各种策略，从工具自动化到团队文化建设，帮助团队将规范从理论转化为实践。

## 一、规范执行的层次

### 1.1 执行策略层级

代码规范执行可以在多个层级进行，形成一个完整的防护网：

```
┌─────────────────────────────────────────────────────┐
│ 文化层: 团队共识与自觉执行                          │
├─────────────────────────────────────────────────────┤
│ 流程层: 代码审查与反馈                             │
├─────────────────────────────────────────────────────┤
│ 工程层: CI/CD 集成检查                             │
├─────────────────────────────────────────────────────┤
│ 工具层: 编辑器集成与 Git Hooks                      │
└─────────────────────────────────────────────────────┘
```

**每层作用:**
- **文化层**: 建立规范意识，从源头保证规范遵循
- **流程层**: 人工审核与讨论，捕获细微或复杂问题
- **工程层**: 自动化验证，阻止不合规代码进入主分支
- **工具层**: 即时反馈，在编码阶段就发现问题

> **💡 提示**  
> 最有效的规范执行战略结合了多个层级，既有自动化工具提供即时反馈，也有团队文化促进自觉遵守。

### 1.2 执行强度的选择

规范执行的强度应根据项目阶段和团队情况进行调整：

| 执行强度 | 适用场景 | 实施方式 |
|---------|---------|---------|
| 严格模式 | 核心库、关键系统 | 所有规则强制执行，CI 阻断部署 |
| 标准模式 | 一般业务项目 | 核心规则强制，风格规则警告 |
| 引导模式 | 项目早期、规范过渡期 | 主要以警告和建议为主 |
| 教育模式 | 新团队、培训阶段 | 仅提供反馈，不阻断任何流程 |

**执行强度示例：**

```javascript
// ESLint 配置 - 严格模式
{
  "rules": {
    "no-console": "error",        // 禁止 console
    "no-unused-vars": "error",    // 禁止未使用的变量
    "quotes": ["error", "single"] // 强制单引号
  }
}

// ESLint 配置 - 引导模式
{
  "rules": {
    "no-console": "warn",         // 警告但允许 console
    "no-unused-vars": "error",    // 仍然禁止未使用的变量
    "quotes": "off"               // 不强制引号风格
  }
}
```

> **📊 最佳实践**  
> 团队通常从较宽松的执行强度开始，随着成员适应和规范成熟度提高，逐步提高执行强度。根据调查，这种渐进式策略的成功率比一步到位高出约 65%。

## 二、编辑器集成

### 2.1 主流编辑器插件配置

通过编辑器插件提供即时规范反馈：

**VS Code 配置**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "stylelint.validate": [
    "css",
    "scss",
    "sass",
    "less"
  ],
  "prettier.requireConfig": true
}
```

**WebStorm 配置**
```
Preferences > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
✓ Automatic ESLint configuration
✓ Run eslint --fix on save

Preferences > Languages & Frameworks > Style Sheets > Stylelint
✓ Enable
✓ Run on save
```

**编辑器设置共享**

```
project/
├── .vscode/                # VS Code 设置
│   ├── settings.json
│   └── extensions.json     # 推荐扩展
├── .idea/                  # WebStorm 设置
│   └── codeStyles/
└── .editorconfig           # 跨编辑器基础设置
```

### 2.2 实时反馈与自动修复

配置编辑器实现实时反馈和自动修复功能：

**实时反馈机制：**

![编辑器实时反馈](https://via.placeholder.com/600x300?text=编辑器实时规范反馈示例)

```javascript
// 编辑器中的实时反馈
function badFunction(){         // 波浪线: 缺少空格
  var x = 1;                   // 波浪线: 使用 let 或 const
  console.log(x)               // 波浪线: 缺少分号, 避免使用 console
  return x                     // 波浜线: 缺少分号
}
```

**自动修复配置：**
- **保存时自动修复**：在保存文件时自动应用可修复的规则
- **命令面板执行**：通过编辑器命令手动触发修复
- **快捷键绑定**：为常用修复操作设置键盘快捷键

**自定义修复范围：**
```json
// 部分规则自动修复
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true,
    "source.organizeImports": false  // 不自动组织导入
  }
}
```

> **⚠️ 注意**  
> 某些自动修复可能改变代码语义。特别是对于旧项目，建议先在非关键代码上试用自动修复功能，确认安全后再全面应用。

## 三、Git Hooks 集成

### 3.1 pre-commit 钩子

使用 Git pre-commit 钩子在代码提交前进行检查：

**使用 husky 配置 Git hooks:**

```bash
# 安装 husky 和 lint-staged
npm install --save-dev husky lint-staged
```

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix"
    ],
    "*.html": [
      "prettier --write"
    ]
  }
}
```

**使用 .husky 目录方式（现代 husky）:**

```bash
# 初始化 husky
npx husky install

# 创建 pre-commit 钩子
npx husky add .husky/pre-commit "npx lint-staged"
```

```
.husky/
├── _/
│   └── husky.sh
├── pre-commit
└── commit-msg
```

**lint-staged 配置文件分离:**

```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests'  // 运行相关测试
  ],
  '*.{css,scss,less}': ['stylelint --fix'],
  '*.{json,md}': ['prettier --write']
};
```

### 3.2 commit-msg 钩子

规范化 Git 提交信息：

**使用 commitlint:**

```bash
# 安装 commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 样式调整
        'refactor', // 重构
        'test',     // 测试
        'chore'     // 构建过程或辅助工具变更
      ]
    ],
    'scope-case': [0]  // 不验证 scope 的格式
  }
};
```

**Git 提交模板:**

```
# .gitmessage
<type>(<scope>): <subject>

<body>

<footer>

# 类型:
#   feat     : 新功能
#   fix      : 修复
#   docs     : 文档
#   style    : 格式调整
#   refactor : 重构
#   test     : 测试
#   chore    : 构建/工具
```

```bash
# 配置 Git 使用提交模板
git config --local commit.template .gitmessage
```

### 3.3 自定义 Git 钩子

针对特定项目需求创建自定义 Git 钩子：

**检查敏感信息泄露:**

```bash
#!/bin/bash
# .husky/pre-commit

# 检查是否包含 API 密钥
if git diff --cached | grep -E 'API_KEY|SECRET_KEY|password.*='; then
  echo "警告: 提交包含潜在的敏感信息!"
  exit 1
fi

# 继续其他检查
npx lint-staged
```

**检查大文件:**

```bash
#!/bin/bash
# .husky/pre-commit

# 检查新增文件大小
max_size_kb=500
files=$(git diff --cached --name-only --diff-filter=A)

for file in $files; do
  size=$(du -k "$file" | cut -f1)
  if [ $size -gt $max_size_kb ]; then
    echo "错误: $file 大小超过 ${max_size_kb}KB"
    exit 1
  fi
done
```

> **💡 提示**  
> 虽然 Git 钩子是强大的规范执行工具，但应该避免在钩子中执行过于耗时的操作，以免影响开发流程。通常将耗时检查放在 CI/CD 流程中更为合适。

## 四、CI/CD 集成

### 4.1 持续集成检查

在 CI 环境中集成代码规范检查：

**GitHub Actions 配置:**

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint JavaScript
        run: npm run lint:js
      
      - name: Lint CSS
        run: npm run lint:css
      
      - name: Check formatting
        run: npm run format:check
```

**GitLab CI 配置:**

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build

lint-job:
  stage: lint
  image: node:16-alpine
  script:
    - npm ci
    - npm run lint:js
    - npm run lint:css
    - npm run format:check
  artifacts:
    reports:
      junit: lint-results.xml
```

**生成规范检查报告:**

```bash
# ESLint 输出 JUnit 格式报告
eslint --format junit --output-file reports/eslint.xml src/

# Stylelint 输出 JUnit 格式报告
stylelint --custom-formatter=./node_modules/stylelint-junit-formatter src/**/*.scss > reports/stylelint.xml
```

### 4.2 PR/MR 集成检查

在代码审查阶段集成自动化规范检查：

**GitHub PR 检查:**

```yaml
# .github/workflows/pr-checks.yml
name: Pull Request Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint changed files
        uses: reviewdog/action-eslint@v1
        with:
          reporter: github-pr-review
          fail_on_error: true
          eslint_flags: '--ext .js,.jsx,.ts,.tsx .'
```

**GitLab MR 检查:**

```yaml
# .gitlab-ci.yml
lint-mr:
  stage: lint
  script:
    - npm ci
    - git diff --name-only origin/main... | grep -E '\.(js|jsx|ts|tsx)$' | xargs eslint
  only:
    - merge_requests
```

**检查结果可视化:**

通过在 PR/MR 中直接展示检查结果，提高反馈效率：

![PR检查结果](https://via.placeholder.com/600x300?text=PR检查结果示例)

> **📊 最佳实践**  
> 研究表明，将规范检查结果直接嵌入到 PR/MR 评论中，能将规范问题修复率提高约 40%，因为开发者能够更直观地看到问题并快速修复。

### 4.3 部署前验证

确保部署到生产环境的代码符合规范要求：

**部署前验证流程:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm test
        
  build:
    needs: verify
    runs-on: ubuntu-latest
    steps:
      # 构建步骤...
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      # 部署步骤...
```

**使用质量门禁:**

```yaml
# 使用 SonarQube 质量门禁
quality-gate:
  stage: quality
  script:
    - sonar-scanner
    - |
      if [ $(curl -s -u "${SONAR_TOKEN}:" "${SONAR_HOST}/api/qualitygates/project_status?projectKey=${CI_PROJECT_NAME}" | jq -r '.projectStatus.status') != "OK" ]; then
        echo "质量门禁未通过"
        exit 1
      fi
```

## 五、代码审查与团队协作

### 5.1 结构化代码审查

将规范检查纳入代码审查流程：

**代码审查清单:**

```markdown
## 代码规范检查清单

### 通用规范
- [ ] 代码格式符合项目规范
- [ ] 命名遵循约定的风格
- [ ] 适当的注释和文档

### JavaScript/TypeScript
- [ ] 避免使用废弃的 API
- [ ] 类型定义完整（TypeScript）
- [ ] 错误处理妥善

### CSS/SCSS
- [ ] 选择器符合命名规范
- [ ] 避免过度嵌套
- [ ] 响应式设计合理

### 性能与安全
- [ ] 无明显性能问题
- [ ] 安全处理用户输入
- [ ] 避免敏感信息泄露
```

**审查工具集成:**

```
GitHub/GitLab + 自动化检查 + 审查模板 → 高效代码审查
```

**代码示例标注:**

```javascript
// 审查示例
function calculateTotal(items) {
  // [QUESTION] 这里是否需要检查 items 是否为数组?
  return items.reduce((sum, item) => {
    // [SUGGESTION] 考虑使用可空链操作符 item?.price || 0
    return sum + (item.price || 0);
  }, 0);
}
```

### 5.2 自动化反馈机制

利用自动化工具提供规范反馈：

**代码气味检测:**

```yaml
# 使用 Codeclimate 分析代码质量
- name: CodeClimate Analysis
  uses: codeclimate/github-actions@v1
  with:
    reporter-id: ${{ secrets.CC_REPORTER_ID }}
```

**技术债务跟踪:**

```javascript
// TODO: 需要重构这部分代码 [TECH_DEBT] [PRIORITY: HIGH]
function legacyFunction() {
  // 临时解决方案
}
```

**可视化报告生成:**

```bash
# 生成 ESLint HTML 报告
eslint --format html --output-file reports/eslint-report.html src/

# 使用 eslint-stats 生成统计报告
npx eslint-stats --json-filenames "./reports/eslint-*.json" --output-html "./reports/stats.html"
```

### 5.3 团队规范文化建设

建立积极的代码规范文化：

**规范知识分享:**
- 定期的规范分享会议
- 新规则引入前的团队讨论
- 规范痛点收集与改进

**规范执行激励:**
- 设立"代码质量冠军"
- 将规范遵循度纳入技术评估
- 分享规范带来的成功案例

**渐进式规范应用:**

```javascript
// 阶段 1: 标记废弃做法
/**
 * @deprecated 使用新的 API `newFunction()` 替代
 */
function oldFunction() {
  console.warn('请使用 newFunction() 替代');
  return newFunction();
}

// 阶段 2: 迁移期结束后通过 ESLint 禁用
// .eslintrc.js
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "./old-module",
        "message": "请使用 new-module 替代"
      }]
    }]
  }
}
```

> **💡 提示**  
> 规范文化建设是一个长期过程，重在创造积极的反馈循环。研究表明，团队成员看到规范带来的切实好处后，自觉遵守规范的意愿会显著提高。

## 六、规范执行数据与优化

### 6.1 执行效果度量

衡量规范执行的效果：

**关键指标:**
- 规范违规率（按规则/文件/团队）
- 修复时间（从发现到解决）
- PR/MR 质量提升（规范相关评论减少比例）
- 开发者满意度（规范工具链使用体验）

**度量工具:**

```bash
# ESLint 统计报告
npx eslint-stats src/

# SonarQube 代码质量指标
sonar-scanner \
  -Dsonar.projectKey=myproject \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=mytoken
```

**可视化仪表盘:**

![规范执行仪表盘](https://via.placeholder.com/600x300?text=规范执行仪表盘示例)

### 6.2 持续优化策略

基于数据不断优化规范执行：

**规则调整流程:**

```
数据收集 → 分析问题规则 → 调整规则 → 试行 → 全面推广
```

**版本控制配置:**

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    './eslint-config/base',
    './eslint-config/react',
    './eslint-config/typescript',
  ],
  rules: {
    // 项目特定覆盖
  }
};
```

**渐进式强化:**

```json
// 第一阶段: 主要规则设置为警告
{
  "rules": {
    "complexity": ["warn", 10],
    "max-depth": ["warn", 3]
  }
}

// 第二阶段: 提升为错误
{
  "rules": {
    "complexity": ["error", 10],
    "max-depth": ["error", 3]
  }
}

// 第三阶段: 调整阈值更严格
{
  "rules": {
    "complexity": ["error", 8],
    "max-depth": ["error", 2]
  }
}
```

## 学习建议

> **📚 进阶路径**
> 
> 1. **从编辑器集成开始**：首先配置开发环境，获得即时反馈
> 2. **渐进式引入 Git Hooks**：在本地提交前捕获问题
> 3. **建立 CI/CD 检查**：确保团队层面的规范执行
> 4. **完善代码审查流程**：结合自动化和人工审查
> 5. **度量与优化**：基于数据持续改进规范执行

> **⚠️ 常见误区**
> 
> - **过度自动化**：试图自动化检查所有规则，忽视人工判断价值
> - **检查而不修复**：只报告问题但不提供修复方案
> - **忽视规范例外**：没有提供合理的规则禁用机制
> - **执行过于严格**：初期就设置过高标准导致团队抵触
> - **缺乏持续关注**：规范工具配置一次后长期不更新

## 参考资料

- [Husky - Git hooks made easy](https://typicode.github.io/husky/) - Git hooks 工具官方文档
- [lint-staged - Run linters on git staged files](https://github.com/okonet/lint-staged) - 针对暂存文件的检查工具
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - GitHub CI/CD 集成指南
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/) - GitLab CI/CD 集成指南
- [SonarQube Documentation](https://docs.sonarqube.org/) - 代码质量管理平台

---

**下一章** → [第 4 章：规范工具发展史](./04-tools-history.md)
