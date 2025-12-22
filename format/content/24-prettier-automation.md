# 第 24 章：CI 与自动化

## 概述

将 Prettier 集成到 CI/CD 流程中，可以确保所有提交的代码都符合格式规范。本章介绍如何在各种 CI 平台配置 Prettier 检查，以及自动化格式化的最佳实践。

## 一、CI 集成策略

### 1.1 检查 vs 修复

| 策略 | 命令 | 适用场景 |
|------|------|----------|
| 检查 | `prettier --check` | CI 验证，PR 检查 |
| 修复 | `prettier --write` | 本地开发，自动提交 |

### 1.2 工作流设计

```
开发者本地
├── 编辑器保存时自动格式化
├── 提交前 lint-staged 检查
└── 推送代码

CI 流程
├── 拉取代码
├── prettier --check (验证格式)
├── eslint (代码质量)
└── 测试 & 构建
```

## 二、GitHub Actions

### 2.1 基础检查

```yaml
# .github/workflows/format.yml
name: Format Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  prettier:
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
      
      - name: Check formatting
        run: npx prettier --check "src/**/*.{js,ts,jsx,tsx,css,json,md}"
```

### 2.2 带缓存的配置

```yaml
name: Lint & Format

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Cache Prettier
        uses: actions/cache@v4
        with:
          path: node_modules/.cache/prettier
          key: prettier-${{ hashFiles('**/package-lock.json') }}
      
      - run: npm ci
      
      - name: ESLint
        run: npm run lint
      
      - name: Prettier
        run: npm run format:check
```

### 2.3 自动修复并提交

```yaml
name: Auto Format

on:
  push:
    branches: [main]

jobs:
  format:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Format code
        run: npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
      
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "style: auto-format code with prettier"
          commit_user_name: "github-actions[bot]"
          commit_user_email: "github-actions[bot]@users.noreply.github.com"
```

### 2.4 PR 评论反馈

```yaml
name: PR Format Check

on: pull_request

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Check formatting
        id: prettier
        run: |
          npx prettier --check "src/**/*.{js,ts,jsx,tsx}" 2>&1 | tee prettier-output.txt
        continue-on-error: true
      
      - name: Comment on PR
        if: steps.prettier.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const output = fs.readFileSync('prettier-output.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## ❌ Prettier Check Failed\n\n\`\`\`\n${output}\n\`\`\`\n\nPlease run \`npm run format\` to fix formatting issues.`
            });
      
      - name: Fail if formatting issues
        if: steps.prettier.outcome == 'failure'
        run: exit 1
```

## 三、GitLab CI

### 3.1 基础配置

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build

format:
  stage: lint
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npx prettier --check "src/**/*.{js,ts,jsx,tsx}"
  only:
    - merge_requests
    - main
    - develop

eslint:
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

### 3.2 并行检查

```yaml
lint:
  stage: lint
  image: node:20
  parallel:
    matrix:
      - LINT_TYPE: [prettier, eslint, stylelint]
  script:
    - npm ci
    - |
      case $LINT_TYPE in
        prettier) npx prettier --check "src/**/*.{js,ts}" ;;
        eslint) npm run lint ;;
        stylelint) npx stylelint "src/**/*.css" ;;
      esac
```

## 四、其他 CI 平台

### 4.1 CircleCI

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  lint:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          paths:
            - node_modules
          key: npm-deps-{{ checksum "package-lock.json" }}
      - run:
          name: Prettier Check
          command: npx prettier --check "src/**/*.{js,ts,jsx,tsx}"
      - run:
          name: ESLint
          command: npm run lint

workflows:
  main:
    jobs:
      - lint
```

### 4.2 Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent {
        docker { image 'node:20' }
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Format Check') {
            steps {
                sh 'npx prettier --check "src/**/*.{js,ts,jsx,tsx}"'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
    }
    
    post {
        failure {
            echo 'Format or lint check failed!'
        }
    }
}
```

### 4.3 Azure DevOps

```yaml
# azure-pipelines.yml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
  
  - script: npm ci
    displayName: 'Install dependencies'
  
  - script: npx prettier --check "src/**/*.{js,ts,jsx,tsx}"
    displayName: 'Prettier Check'
  
  - script: npm run lint
    displayName: 'ESLint'
```

## 五、Git Hooks 自动化

### 5.1 Husky + lint-staged

```bash
npm install husky lint-staged -D
npx husky init
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

### 5.2 只格式化暂存文件

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx,css,json,md}": "prettier --write"
  }
}
```

### 5.3 跳过 Hooks

```bash
# 紧急情况跳过检查
git commit --no-verify -m "hotfix: urgent fix"

# 或设置环境变量
HUSKY=0 git commit -m "skip hooks"
```

## 六、npm Scripts 配置

### 6.1 完整脚本配置

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,ts,jsx,tsx,css,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,ts,jsx,tsx,css,json,md}\"",
    "format:diff": "prettier --list-different \"src/**/*.{js,ts,jsx,tsx}\"",
    
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    
    "check": "npm run format:check && npm run lint",
    "fix": "npm run format && npm run lint:fix",
    
    "precommit": "lint-staged",
    "prepare": "husky"
  }
}
```

### 6.2 并行执行

```bash
npm install npm-run-all -D
```

```json
{
  "scripts": {
    "check:all": "npm-run-all --parallel format:check lint typecheck",
    "typecheck": "tsc --noEmit"
  }
}
```

## 七、自动修复策略

### 7.1 PR 自动修复

```yaml
# 在 PR 中自动修复格式问题
name: Auto Fix

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  fix:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      - name: Fix formatting
        run: |
          npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
          npx eslint --fix "src/**/*.{js,ts,jsx,tsx}" || true
      
      - name: Check for changes
        id: changes
        run: |
          git diff --quiet || echo "changes=true" >> $GITHUB_OUTPUT
      
      - name: Commit fixes
        if: steps.changes.outputs.changes == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "style: auto-fix formatting"
          git push
```

### 7.2 定时格式化

```yaml
name: Weekly Format

on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日午夜

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      - run: npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
      
      - name: Create PR
        uses: peter-evans/create-pull-request@v6
        with:
          title: "style: weekly code formatting"
          commit-message: "style: apply prettier formatting"
          branch: auto-format
          delete-branch: true
```

## 八、报告与监控

### 8.1 生成格式化报告

```bash
# 输出需要格式化的文件列表
npx prettier --list-different "src/**/*.{js,ts}" > format-report.txt

# JSON 格式输出
npx prettier --check "src/**/*.{js,ts}" 2>&1 | tee format-check.log
```

### 8.2 CI 产物上传

```yaml
- name: Check formatting
  run: npx prettier --check "src/**/*.{js,ts}" 2>&1 | tee format-report.txt
  continue-on-error: true

- name: Upload report
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: format-report
    path: format-report.txt
```

### 8.3 状态徽章

```markdown
<!-- README.md -->
![Format](https://github.com/user/repo/actions/workflows/format.yml/badge.svg)
```

## 九、最佳实践

### 9.1 推荐工作流

```
1. 本地开发
   └── 编辑器保存时自动格式化

2. 提交前
   └── lint-staged 检查暂存文件

3. CI 检查
   └── prettier --check (不修改，只验证)

4. 合并策略
   └── PR 必须通过格式检查才能合并
```

### 9.2 CI 配置建议

| 建议 | 原因 |
|------|------|
| 使用 `--check` 而非 `--write` | CI 不应修改代码 |
| 缓存 node_modules | 加速 CI 执行 |
| 并行运行检查 | 缩短 CI 时间 |
| 失败时提供清晰信息 | 帮助开发者快速修复 |

### 9.3 团队协作

```json
// 确保团队成员都能正确执行
{
  "scripts": {
    "postinstall": "husky",
    "precommit": "lint-staged"
  }
}
```

### 9.4 迁移策略

```bash
# 一次性格式化所有代码
npx prettier --write "src/**/*.{js,ts,jsx,tsx,css,json,md}"

# 单独提交格式化变更
git add -A
git commit -m "style: apply prettier formatting to entire codebase"

# 之后启用 CI 检查
```

## 十、故障排除

### 10.1 CI 失败常见原因

1. **本地未格式化**：运行 `npm run format`
2. **Prettier 版本不一致**：检查 `package-lock.json`
3. **配置文件差异**：确保 `.prettierrc` 已提交

### 10.2 调试命令

```bash
# 查看 Prettier 版本
npx prettier --version

# 查看配置
npx prettier --find-config-path src/index.js

# 查看忽略的文件
npx prettier --check . --debug-check
```

## 参考资料

- [Prettier CLI](https://prettier.io/docs/en/cli.html)
- [GitHub Actions](https://docs.github.com/en/actions)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Husky](https://typicode.github.io/husky/)
