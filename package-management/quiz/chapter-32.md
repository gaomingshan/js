# 第 32 章：CI/CD 集成 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** GitHub Actions基础

### 题目

GitHub Actions 的配置文件放在哪里？

**选项：**
- A. .github/actions/
- B. .github/workflows/
- C. .ci/
- D. workflows/

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**GitHub Actions 配置**

#### 目录结构

```
.github/
└── workflows/
    ├── ci.yml
    ├── release.yml
    └── deploy.yml
```

#### 基本配置

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 缓存依赖

### 题目

GitHub Actions 可以缓存 node_modules。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**GitHub Actions 缓存**

#### 使用 actions/cache

```yaml
- uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

#### 使用 actions/setup-node

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: 18
    cache: 'npm'  # 自动缓存
```

**自动缓存 npm/yarn/pnpm**

#### 效果

```
无缓存: npm install 60s
有缓存: npm ci 10s ⚡
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 触发条件

### 题目

如何配置 PR 时才运行 CI？

**选项：**
- A. on: pull_request
- B. on: pr
- C. on: merge
- D. on: review

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**GitHub Actions 触发条件**

#### pull_request

```yaml
on:
  pull_request:
    branches: [main]
```

#### 多种触发

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # 每天运行
```

#### 条件过滤

```yaml
on:
  pull_request:
    paths:
      - 'packages/**'
      - 'apps/**'
    paths-ignore:
      - '**.md'
```

**只在特定文件变更时运行**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** Monorepo CI策略

### 题目

Monorepo CI/CD 的最佳实践有哪些？

**选项：**
- A. 只构建变更的包
- B. 并行运行测试
- C. 缓存构建产物
- D. 按需部署

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**Monorepo CI/CD 最佳实践**

#### A. 只构建变更 ✅

```yaml
- name: Build affected
  run: |
    # Turborepo
    turbo run build --filter="[HEAD^1]"
    
    # Nx
    nx affected:build
```

**节省时间和资源**

#### B. 并行测试 ✅

```yaml
strategy:
  matrix:
    package: [ui, utils, hooks]

steps:
  - run: turbo run test --filter=${{ matrix.package }}
```

**多任务并行**

#### C. 缓存产物 ✅

```yaml
- uses: actions/cache@v3
  with:
    path: |
      .turbo
      node_modules/.cache
    key: ${{ runner.os }}-turbo-${{ github.sha }}
```

#### D. 按需部署 ✅

```yaml
- name: Deploy web
  if: contains(github.event.head_commit.message, '[deploy:web]')
  run: npm run deploy:web
```

#### 完整示例

```yaml
name: Monorepo CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            ui: 'packages/ui/**'
            utils: 'packages/utils/**'
            web: 'apps/web/**'
  
  test:
    needs: changes
    if: ${{ needs.changes.outputs.packages != '[]' }}
    
    strategy:
      matrix:
        package: ${{ fromJSON(needs.changes.outputs.packages) }}
    
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      
      - uses: actions/setup-node@v3
        with:
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - run: turbo run test --filter=${{ matrix.package }}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 变更检测

### 题目

如何在 CI 中检测哪些包发生了变更？

<details>
<summary>查看答案</summary>

### ✅ 答案

**变更检测方案**

#### 方案 1：Turborepo

```yaml
- name: Get changed packages
  id: changed
  run: |
    CHANGED=$(turbo run build --filter="[HEAD^1]" --dry-run=json | jq -r '.packages[]')
    echo "packages=$CHANGED" >> $GITHUB_OUTPUT

- name: Test changed
  run: turbo run test --filter="[HEAD^1]"
```

#### 方案 2：Nx

```yaml
- name: Affected
  run: |
    nx affected:test --base=origin/main
    nx affected:build --base=origin/main
```

#### 方案 3：paths-filter

```yaml
- uses: dorny/paths-filter@v2
  id: filter
  with:
    filters: |
      ui:
        - 'packages/ui/**'
      utils:
        - 'packages/utils/**'
      web:
        - 'apps/web/**'

- name: Test UI
  if: steps.filter.outputs.ui == 'true'
  run: pnpm --filter @myorg/ui test
```

#### 方案 4：自定义脚本

```javascript
// scripts/get-changed.js
const { execSync } = require('child_process');

// 获取变更的文件
const files = execSync('git diff --name-only HEAD^1', {
  encoding: 'utf8'
}).split('\n').filter(Boolean);

// 提取包名
const packages = new Set();
files.forEach(file => {
  const match = file.match(/^(packages|apps)\/([^\/]+)/);
  if (match) {
    packages.add(match[2]);
  }
});

console.log(JSON.stringify(Array.from(packages)));
```

**使用：**
```yaml
- name: Get changed packages
  id: changed
  run: |
    PKGS=$(node scripts/get-changed.js)
    echo "packages=$PKGS" >> $GITHUB_OUTPUT

- name: Test changed
  run: |
    for pkg in ${{ fromJSON(steps.changed.outputs.packages) }}; do
      pnpm --filter $pkg test
    done
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 发布自动化

### 题目

Changesets 如何集成到 CI/CD？

**选项：**
- A. 手动发布
- B. 使用 changesets/action
- C. 自定义脚本
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Changesets CI 集成**

#### 方案 B：changesets/action ✅

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      
      - uses: actions/setup-node@v3
        with:
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**自动创建 Release PR 和发布**

#### 方案 C：自定义脚本 ✅

```yaml
- name: Check for changesets
  id: changesets
  run: |
    if [ -n "$(ls .changeset/*.md 2>/dev/null)" ]; then
      echo "has_changesets=true" >> $GITHUB_OUTPUT
    fi

- name: Version
  if: steps.changesets.outputs.has_changesets == 'true'
  run: |
    pnpm changeset version
    git add .
    git commit -m "chore: version packages"
    git push

- name: Publish
  if: github.ref == 'refs/heads/main'
  run: pnpm changeset publish
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 多环境部署

### 题目

如何在 CI 中管理多环境部署？

<details>
<summary>查看答案</summary>

### ✅ 答案

**多环境部署策略**

#### 环境配置

```yaml
name: Deploy

on:
  push:
    branches:
      - develop    # 开发环境
      - staging    # 预发布
      - main       # 生产环境

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set environment
        id: env
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "name=production" >> $GITHUB_OUTPUT
            echo "url=https://app.example.com" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "name=staging" >> $GITHUB_OUTPUT
            echo "url=https://staging.example.com" >> $GITHUB_OUTPUT
          else
            echo "name=development" >> $GITHUB_OUTPUT
            echo "url=https://dev.example.com" >> $GITHUB_OUTPUT
          fi
      
      - name: Build
        run: |
          pnpm install
          pnpm build
        env:
          NODE_ENV: ${{ steps.env.outputs.name }}
          API_URL: ${{ steps.env.outputs.url }}
      
      - name: Deploy
        run: |
          echo "Deploying to ${{ steps.env.outputs.name }}"
          # 部署逻辑
```

#### 使用 GitHub Environments

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: ${{ matrix.env }}
      url: ${{ steps.deploy.outputs.url }}
    
    strategy:
      matrix:
        env: [development, staging, production]
    
    steps:
      - name: Deploy
        id: deploy
        run: |
          # 使用环境变量
          echo ${{ secrets.API_KEY }}
          echo ${{ vars.API_URL }}
```

**环境级别的 secrets 和 variables**

#### 条件部署

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment:
    name: production
    url: https://app.example.com
  run: npm run deploy:prod
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** CI优化

### 题目

如何优化 Monorepo 的 CI 性能？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Monorepo CI 性能优化**

#### 1. 智能缓存

```yaml
- name: Cache Turborepo
  uses: actions/cache@v3
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-

- name: Cache pnpm
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Cache build outputs
  uses: actions/cache@v3
  with:
    path: |
      packages/**/dist
      apps/**/.next
    key: ${{ runner.os }}-build-${{ github.sha }}
```

#### 2. 并行任务

```yaml
strategy:
  matrix:
    task: [lint, test, build, type-check]

steps:
  - run: turbo run ${{ matrix.task }}
```

#### 3. 增量构建

```yaml
- name: Build affected
  run: |
    BASE=${{ github.event.pull_request.base.sha || 'HEAD^1' }}
    turbo run build --filter="...[${BASE}]"
```

#### 4. 远程缓存

```yaml
- name: Build with remote cache
  run: turbo run build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

#### 5. 条件跳过

```yaml
- name: Check if tests needed
  id: check
  run: |
    if git diff --name-only HEAD^1 | grep -q "\.test\."; then
      echo "run=true" >> $GITHUB_OUTPUT
    fi

- name: Test
  if: steps.check.outputs.run == 'true'
  run: turbo run test
```

#### 完整优化配置

```yaml
name: Optimized CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      affected: ${{ steps.affected.outputs.packages }}
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - id: affected
        run: |
          PKGS=$(turbo run build --filter="[HEAD^1]" --dry-run=json | jq -c '.packages')
          echo "packages=$PKGS" >> $GITHUB_OUTPUT
  
  test:
    needs: setup
    if: needs.setup.outputs.affected != '[]'
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        package: ${{ fromJSON(needs.setup.outputs.affected) }}
      max-parallel: 4
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      
      - uses: actions/setup-node@v3
        with:
          cache: 'pnpm'
      
      - uses: actions/cache@v3
        with:
          path: .turbo
          key: turbo-${{ github.sha }}
          restore-keys: turbo-
      
      - run: pnpm install --frozen-lockfile
      
      - run: turbo run test --filter=${{ matrix.package }}
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
```

### 📖 解析

**优化效果**

```
优化前：
- 全量构建：10分钟
- 并行度：1

优化后：
- 增量构建：2分钟 ⚡⚡⚡⚡⚡
- 远程缓存：30秒 ⚡⚡⚡⚡⚡
- 并行度：4
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 安全扫描

### 题目

如何在 CI 中集成安全扫描？

<details>
<summary>查看答案</summary>

### ✅ 答案

**CI 安全扫描集成**

#### 1. npm audit

```yaml
- name: Security Audit
  run: npm audit --production --audit-level=moderate
  continue-on-error: true
```

#### 2. Snyk

```yaml
- name: Snyk Test
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

#### 3. CodeQL

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript

- name: Build
  run: npm run build

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

#### 4. 依赖审查

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v3
  with:
    fail-on-severity: moderate
```

#### 5. 许可证检查

```yaml
- name: License Check
  run: |
    npm install -g license-checker
    license-checker --failOn 'GPL;AGPL'
```

#### 完整安全流程

```yaml
name: Security Scan

on:
  pull_request:
  schedule:
    - cron: '0 0 * * *'  # 每天扫描

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
      
      - run: npm ci
      
      # 1. 依赖漏洞
      - name: NPM Audit
        run: npm audit --production
        continue-on-error: true
      
      # 2. Snyk 扫描
      - name: Snyk Test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --all-projects
      
      # 3. 代码分析
      - name: CodeQL
        uses: github/codeql-action/init@v2
      
      - run: npm run build
      
      - uses: github/codeql-action/analyze@v2
      
      # 4. 许可证
      - name: License Check
        run: |
          npx license-checker --json > licenses.json
          node scripts/check-licenses.js
      
      # 5. 生成报告
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: |
            licenses.json
            snyk-report.json
```

**scripts/check-licenses.js：**
```javascript
const fs = require('fs');

const licenses = JSON.parse(fs.readFileSync('licenses.json', 'utf8'));
const forbidden = ['GPL', 'AGPL'];

const violations = Object.entries(licenses)
  .filter(([pkg, info]) => 
    forbidden.some(f => info.licenses?.includes(f))
  );

if (violations.length > 0) {
  console.error('❌ 许可证违规:');
  violations.forEach(([pkg]) => console.error(`  ${pkg}`));
  process.exit(1);
}

console.log('✅ 许可证检查通过');
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** CI状态检查

### 题目

实现一个 CI 状态通知系统。

<details>
<summary>查看答案</summary>

### ✅ 答案

**CI 状态通知系统**

```yaml
# .github/workflows/notify.yml
name: CI Status Notification

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Get workflow result
        id: result
        run: |
          echo "status=${{ github.event.workflow_run.conclusion }}" >> $GITHUB_OUTPUT
          echo "url=${{ github.event.workflow_run.html_url }}" >> $GITHUB_OUTPUT
      
      - name: Notify
        run: node scripts/notify-ci.js
        env:
          STATUS: ${{ steps.result.outputs.status }}
          URL: ${{ steps.result.outputs.url }}
          WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

**scripts/notify-ci.js：**
```javascript
const https = require('https');
const { URL } = require('url');

class CINotifier {
  constructor() {
    this.status = process.env.STATUS;
    this.url = process.env.URL;
    this.webhook = process.env.WEBHOOK;
    
    this.commit = process.env.GITHUB_SHA?.slice(0, 7);
    this.branch = process.env.GITHUB_REF?.replace('refs/heads/', '');
    this.actor = process.env.GITHUB_ACTOR;
  }

  // 生成消息
  generateMessage() {
    const emoji = this.status === 'success' ? '✅' : '❌';
    const color = this.status === 'success' ? '#28a745' : '#dc3545';

    return {
      username: 'CI Bot',
      icon_emoji: ':robot_face:',
      attachments: [{
        color,
        title: `${emoji} CI ${this.status.toUpperCase()}`,
        title_link: this.url,
        fields: [
          {
            title: 'Branch',
            value: this.branch,
            short: true
          },
          {
            title: 'Commit',
            value: this.commit,
            short: true
          },
          {
            title: 'Author',
            value: this.actor,
            short: true
          },
          {
            title: 'Status',
            value: this.status,
            short: true
          }
        ],
        footer: 'GitHub Actions',
        ts: Math.floor(Date.now() / 1000)
      }]
    };
  }

  // 发送到 Slack
  sendToSlack() {
    if (!this.webhook) {
      console.log('⚠️  未配置 Webhook');
      return Promise.resolve();
    }

    const message = this.generateMessage();
    const url = new URL(this.webhook);

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ 通知已发送');
          resolve();
        } else {
          console.error('❌ 通知发送失败:', res.statusCode);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(JSON.stringify(message));
      req.end();
    });
  }

  // 发送到钉钉
  sendToDingTalk() {
    const emoji = this.status === 'success' ? '✅' : '❌';
    
    const message = {
      msgtype: 'markdown',
      markdown: {
        title: `CI ${this.status}`,
        text: `
### ${emoji} CI ${this.status.toUpperCase()}

- **Branch**: ${this.branch}
- **Commit**: ${this.commit}
- **Author**: ${this.actor}

[查看详情](${this.url})
        `
      }
    };

    // 发送逻辑同 Slack
  }

  // 发送邮件通知
  async sendEmail() {
    // 使用 nodemailer 或 SendGrid
    const subject = `CI ${this.status} - ${this.branch}`;
    const html = `
      <h2>CI ${this.status.toUpperCase()}</h2>
      <ul>
        <li>Branch: ${this.branch}</li>
        <li>Commit: ${this.commit}</li>
        <li>Author: ${this.actor}</li>
      </ul>
      <p><a href="${this.url}">查看详情</a></p>
    `;

    // 发送邮件...
  }

  // 执行通知
  async notify() {
    console.log(`📢 CI ${this.status} - 发送通知\n`);

    try {
      await this.sendToSlack();
      console.log('\n✅ 通知完成');
    } catch (error) {
      console.error('\n❌ 通知失败:', error.message);
      process.exit(1);
    }
  }
}

// 运行
const notifier = new CINotifier();
notifier.notify().catch(console.error);
```

**增强功能：**

```javascript
// scripts/ci-dashboard.js
const fs = require('fs');

class CIDashboard {
  constructor() {
    this.dataFile = 'ci-history.json';
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    } catch {
      return [];
    }
  }

  saveHistory() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.history, null, 2));
  }

  recordBuild(data) {
    this.history.push({
      timestamp: new Date().toISOString(),
      ...data
    });

    // 只保留最近 100 次
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    this.saveHistory();
  }

  generateStats() {
    const total = this.history.length;
    const success = this.history.filter(b => b.status === 'success').length;
    const failed = total - success;
    const successRate = ((success / total) * 100).toFixed(1);

    // 计算平均构建时间
    const avgDuration = this.history.reduce((sum, b) => {
      return sum + (b.duration || 0);
    }, 0) / total;

    return {
      total,
      success,
      failed,
      successRate: `${successRate}%`,
      avgDuration: `${(avgDuration / 1000).toFixed(0)}s`
    };
  }

  generateHTML() {
    const stats = this.generateStats();
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>CI Dashboard</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .stats { display: flex; gap: 20px; }
    .card { padding: 20px; border-radius: 8px; background: #f5f5f5; }
    .success { color: #28a745; }
    .failed { color: #dc3545; }
  </style>
</head>
<body>
  <h1>CI Dashboard</h1>
  
  <div class="stats">
    <div class="card">
      <h3>总构建次数</h3>
      <p style="font-size: 32px;">${stats.total}</p>
    </div>
    
    <div class="card">
      <h3>成功率</h3>
      <p style="font-size: 32px;" class="success">${stats.successRate}</p>
    </div>
    
    <div class="card">
      <h3>平均时间</h3>
      <p style="font-size: 32px;">${stats.avgDuration}</p>
    </div>
  </div>
  
  <h2>最近构建</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <th>时间</th>
      <th>分支</th>
      <th>提交</th>
      <th>状态</th>
      <th>耗时</th>
    </tr>
    ${this.history.slice(-10).reverse().map(b => `
      <tr>
        <td>${new Date(b.timestamp).toLocaleString()}</td>
        <td>${b.branch}</td>
        <td>${b.commit}</td>
        <td class="${b.status}">${b.status}</td>
        <td>${(b.duration / 1000).toFixed(0)}s</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
    `;
  }
}
```

### 📖 解析

**通知系统功能**

1. ✅ 多渠道通知（Slack/钉钉/邮件）
2. ✅ 详细状态信息
3. ✅ 历史记录
4. ✅ 统计分析
5. ✅ 可视化面板

</details>

---

**导航**  
[上一章：第 31 章面试题](./chapter-31.md) | [返回目录](../README.md) | [下一章：第 33 章面试题](./chapter-33.md)
