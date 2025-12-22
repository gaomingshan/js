# 第 17 章：工作流集成

## 概述

将 ESLint 集成到开发工作流中，能在代码进入仓库前自动发现问题。本章介绍如何将 ESLint 与编辑器、Git Hooks 和 CI/CD 系统集成，实现多层次的代码质量保障。

## 一、编辑器集成

### 1.1 VS Code 配置

**安装扩展：** ESLint (dbaeumer.vscode-eslint)

```json
// .vscode/settings.json
{
  // 启用ESLint
  "eslint.enable": true,
  
  // 检查的语言
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  
  // 保存时自动修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  
  // 工作目录配置（monorepo）
  "eslint.workingDirectories": [
    { "directory": "./packages/web", "changeProcessCWD": true },
    { "directory": "./packages/server", "changeProcessCWD": true }
  ]
}
```

### 1.2 WebStorm 配置

1. **启用 ESLint**：Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. **选择配置**：Automatic ESLint configuration
3. **保存时修复**：勾选 "Run eslint --fix on save"

### 1.3 团队共享配置

```
项目根目录/
├── .vscode/
│   ├── settings.json      # 编辑器配置
│   └── extensions.json    # 推荐扩展
└── .editorconfig          # 基础编辑器配置
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

## 二、Git Hooks 集成

### 2.1 Husky 配置

```bash
# 安装 husky
npm install husky -D

# 初始化
npx husky init
```

```bash
# .husky/pre-commit
npm run lint
```

### 2.2 lint-staged 配置

只检查暂存的文件，提升效率：

```bash
npm install lint-staged -D
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

### 2.3 commitlint 集成

规范提交信息：

```bash
npm install @commitlint/cli @commitlint/config-conventional -D
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

### 2.4 完整的 Hooks 配置

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix"],
    "*.{js,jsx,ts,tsx,css,md,json}": ["prettier --write"]
  }
}
```

## 三、CI/CD 集成

### 3.1 GitHub Actions

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript check
        run: npm run typecheck
```

### 3.2 GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build

lint:
  stage: lint
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run lint
  only:
    - merge_requests
    - main
```

### 3.3 生成报告

```yaml
# GitHub Actions 带报告
- name: Run ESLint
  run: npm run lint -- --format json --output-file eslint-report.json
  continue-on-error: true

- name: Upload ESLint report
  uses: actions/upload-artifact@v4
  with:
    name: eslint-report
    path: eslint-report.json
```

### 3.4 PR 注释

使用 reviewdog 在 PR 中显示 ESLint 问题：

```yaml
- name: Run ESLint with reviewdog
  uses: reviewdog/action-eslint@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    reporter: github-pr-review
    eslint_flags: 'src/'
```

## 四、npm scripts 配置

### 4.1 基础脚本

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "lint:report": "eslint src/ --format html --output-file reports/eslint.html"
  }
}
```

### 4.2 高级脚本

```json
{
  "scripts": {
    // 带缓存
    "lint": "eslint --cache src/",
    
    // 并行检查
    "lint:all": "npm-run-all --parallel lint:js lint:css lint:ts",
    "lint:js": "eslint 'src/**/*.js'",
    "lint:ts": "eslint 'src/**/*.ts'",
    "lint:css": "stylelint 'src/**/*.css'",
    
    // 只检查修改的文件
    "lint:changed": "eslint $(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\\.(js|ts|jsx|tsx)$' | xargs)",
    
    // 预提交检查
    "precommit": "lint-staged",
    
    // 完整检查
    "check": "npm run typecheck && npm run lint && npm run test"
  }
}
```

### 4.3 跨平台脚本

```bash
npm install cross-env rimraf npm-run-all -D
```

```json
{
  "scripts": {
    "clean": "rimraf dist coverage",
    "lint": "cross-env NODE_ENV=production eslint src/",
    "build": "npm-run-all clean lint build:*"
  }
}
```

## 五、Monorepo 工作流

### 5.1 根目录配置

```
monorepo/
├── .eslintrc.js           # 根配置
├── packages/
│   ├── web/
│   │   ├── .eslintrc.js   # 继承根配置
│   │   └── package.json
│   └── server/
│       ├── .eslintrc.js
│       └── package.json
└── package.json
```

```javascript
// 根目录 .eslintrc.js
module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  ignorePatterns: ["**/dist/**", "**/node_modules/**"]
};
```

### 5.2 工作区脚本

```json
// 根 package.json (使用 npm workspaces)
{
  "workspaces": ["packages/*"],
  "scripts": {
    "lint": "npm run lint --workspaces",
    "lint:web": "npm run lint -w packages/web",
    "lint:server": "npm run lint -w packages/server"
  }
}
```

### 5.3 Turborepo 集成

```json
// turbo.json
{
  "pipeline": {
    "lint": {
      "outputs": [],
      "cache": true
    },
    "build": {
      "dependsOn": ["^build", "lint"],
      "outputs": ["dist/**"]
    }
  }
}
```

```bash
# 运行所有包的 lint
npx turbo lint
```

## 六、增量检查策略

### 6.1 只检查变更文件

```bash
# 检查暂存文件
npx eslint $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$')

# 检查与 main 分支的差异
npx eslint $(git diff --name-only origin/main | grep -E '\.(js|ts|jsx|tsx)$')
```

### 6.2 使用 ESLint 缓存

```bash
# 启用缓存
npx eslint --cache src/

# 指定缓存位置
npx eslint --cache --cache-location .eslintcache src/

# 更改时才重新检查
npx eslint --cache --cache-strategy content src/
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint --cache --cache-location node_modules/.cache/eslint src/"
  }
}
```

### 6.3 渐进式迁移

```javascript
// .eslintrc.js
module.exports = {
  extends: ["eslint:recommended"],
  
  // 新代码严格检查
  rules: {
    "no-var": "error",
    "prefer-const": "error"
  },
  
  // 旧代码放宽规则
  overrides: [
    {
      files: ["src/legacy/**/*.js"],
      rules: {
        "no-var": "warn",
        "prefer-const": "warn"
      }
    }
  ]
};
```

## 七、错误处理策略

### 7.1 CI 中的错误处理

```yaml
# 警告不阻止构建
- name: Run ESLint
  run: npm run lint -- --max-warnings 10

# 区分错误和警告
- name: Run ESLint (errors only)
  run: npm run lint -- --quiet
```

### 7.2 阻止合并条件

```yaml
# GitHub branch protection
# Settings → Branches → Add rule
# - Require status checks to pass
# - Select "lint" job
```

### 7.3 自动修复 PR

```yaml
# 自动修复并提交
- name: Run ESLint fix
  run: npm run lint:fix
  
- name: Commit changes
  uses: stefanzweifel/git-auto-commit-action@v5
  with:
    commit_message: "style: auto-fix eslint errors"
```

## 八、最佳实践

### 8.1 工作流层次

```
层级1：编辑器实时检查
    ↓ 开发时即时反馈
层级2：保存时自动修复
    ↓ 格式问题自动处理
层级3：提交前检查 (lint-staged)
    ↓ 阻止问题代码进入仓库
层级4：CI 完整检查
    ↓ 最终保障
层级5：PR 强制通过
```

### 8.2 推荐配置组合

```json
// package.json
{
  "scripts": {
    "lint": "eslint --cache src/",
    "lint:fix": "eslint --cache --fix src/",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 8.3 团队协作建议

- **统一开发环境**：共享 `.vscode/settings.json`
- **渐进式严格化**：新规则先 warn 后 error
- **保持 CI 快速**：使用缓存和增量检查
- **文档化流程**：在 README 中说明 lint 命令

## 参考资料

- [Husky 文档](https://typicode.github.io/husky/)
- [lint-staged 文档](https://github.com/okonet/lint-staged)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [reviewdog](https://github.com/reviewdog/reviewdog)
