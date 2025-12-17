# 第 28 章：版本控制与发布策略 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 语义化版本

### 题目

Semver 版本号 `1.2.3` 中，`2` 代表什么？

**选项：**
- A. MAJOR（主版本）
- B. MINOR（次版本）
- C. PATCH（补丁）
- D. BUILD（构建）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**语义化版本（Semver）**

#### 格式

```
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

#### 含义

**MAJOR（主版本）：**
- 不兼容的 API 变更
- 破坏性更新

**MINOR（次版本）：**
- 向后兼容的功能性新增
- 新特性

**PATCH（补丁）：**
- 向后兼容的问题修复
- Bug 修复

#### 示例

```
1.0.0 → 1.0.1  // 修复 bug
1.0.1 → 1.1.0  // 新增特性
1.1.0 → 2.0.0  // 破坏性更新
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 版本范围

### 题目

`^1.2.3` 可以匹配 `1.3.0`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**版本范围符号**

#### ^ 符号（兼容版本）

```
^1.2.3 匹配：
✅ 1.2.3
✅ 1.2.4
✅ 1.3.0
✅ 1.9.9
❌ 2.0.0  // MAJOR 变更
```

**规则：不修改左边第一个非零数字**

#### 特殊情况

```
^0.2.3 匹配：
✅ 0.2.3
✅ 0.2.4
❌ 0.3.0  // 0.x 视为不稳定

^0.0.3 匹配：
✅ 0.0.3
❌ 0.0.4  // 精确匹配
```

#### ~ 符号（近似版本）

```
~1.2.3 匹配：
✅ 1.2.3
✅ 1.2.4
❌ 1.3.0  // MINOR 变更
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** npm version命令

### 题目

自动递增 PATCH 版本的命令是？

**选项：**
- A. npm version major
- B. npm version minor
- C. npm version patch
- D. npm version update

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm version 命令**

#### 基本用法

```bash
# 递增 PATCH：1.0.0 → 1.0.1
npm version patch

# 递增 MINOR：1.0.1 → 1.1.0
npm version minor

# 递增 MAJOR：1.1.0 → 2.0.0
npm version major
```

#### 自动操作

```bash
npm version patch

# 自动：
# 1. 更新 package.json
# 2. 创建 git commit
# 3. 创建 git tag (v1.0.1)
```

#### 跳过 git

```bash
npm version patch --no-git-tag-version
```

#### 预发布版本

```bash
# 1.0.0 → 1.0.1-beta.0
npm version prepatch --preid=beta

# 1.0.0 → 1.1.0-alpha.0
npm version preminor --preid=alpha
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 发布策略

### 题目

常见的版本发布策略有哪些？

**选项：**
- A. Fixed Versions（固定版本）
- B. Independent Versions（独立版本）
- C. Semantic Release（语义发布）
- D. Continuous Deployment（持续部署）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**版本发布策略**

#### A. Fixed Versions ✅

**所有包统一版本：**
```json
// packages/ui/package.json
{ "version": "1.0.0" }

// packages/utils/package.json
{ "version": "1.0.0" }

// 同步递增
```

**适用：紧密耦合的包**

#### B. Independent Versions ✅

**每个包独立版本：**
```json
// packages/ui/package.json
{ "version": "2.3.0" }

// packages/utils/package.json
{ "version": "1.5.2" }
```

**适用：松散耦合的包**

#### C. Semantic Release ✅

**根据 commit 自动发布：**
```bash
# Commit 格式
feat: add feature    → MINOR
fix: bug fix        → PATCH
feat!: breaking     → MAJOR

# 自动：
# 1. 分析 commits
# 2. 确定版本
# 3. 生成 CHANGELOG
# 4. 发布
```

#### D. Continuous Deployment ✅

**每次 merge 自动发布：**
```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    - run: npm version patch
    - run: npm publish
```

#### 对比

| 策略 | 复杂度 | 灵活性 | 适用场景 |
|------|--------|--------|----------|
| **Fixed** | 低 | 低 | 小型 Monorepo |
| **Independent** | 高 | 高 | 大型 Monorepo |
| **Semantic** | 中 | 高 | 自动化项目 |
| **CD** | 中 | 中 | 快速迭代 |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Changesets工作流

### 题目

Changesets 的发布流程是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Changesets 完整流程**

#### 1. 安装配置

```bash
# 安装
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init
```

**.changeset/config.json：**
```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

#### 2. 添加变更

```bash
# 交互式添加
pnpm changeset

# 选择包
? Which packages would you like to include?
❯ ◉ @myorg/ui
  ◉ @myorg/utils

# 选择类型
? What kind of change is this for @myorg/ui?
❯ patch - bug fix
  minor - new feature
  major - breaking change

# 描述变更
? Summary: Fix button styles
```

**生成文件：**
```markdown
<!-- .changeset/random-id.md -->
---
"@myorg/ui": patch
"@myorg/utils": patch
---

Fix button styles
```

#### 3. 版本递增

```bash
pnpm changeset version

# 自动：
# 1. 读取 changeset 文件
# 2. 更新 package.json 版本
# 3. 生成 CHANGELOG.md
# 4. 删除 changeset 文件
```

**结果：**
```json
// packages/ui/package.json
{
  "version": "1.0.1"  // 从 1.0.0
}
```

**CHANGELOG.md：**
```markdown
## 1.0.1

### Patch Changes

- abc1234: Fix button styles
```

#### 4. 发布

```bash
pnpm changeset publish

# 自动：
# 1. 构建包
# 2. 发布到 npm
# 3. 创建 git tags
```

#### 5. CI 自动化

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

### 📖 解析

**优势**

1. ✅ 规范化流程
2. ✅ 自动 CHANGELOG
3. ✅ 依赖更新
4. ✅ CI 集成
5. ✅ 团队协作

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 预发布版本

### 题目

如何发布 beta 版本？

**选项：**
- A. npm publish --beta
- B. npm publish --tag beta
- C. npm version beta
- D. npm beta

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm dist-tags**

#### 发布 beta

**1. 更新版本：**
```bash
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0
```

**2. 发布：**
```bash
npm publish --tag beta
```

**3. 安装：**
```bash
npm install my-package@beta
```

#### 常用 tags

**latest（默认）：**
```bash
npm publish
# 等同于
npm publish --tag latest
```

**next：**
```bash
npm publish --tag next
```

**beta/alpha：**
```bash
npm publish --tag beta
npm publish --tag alpha
```

#### 查看 tags

```bash
npm dist-tag ls my-package

# 输出：
# latest: 1.0.0
# beta: 1.0.1-beta.0
# next: 2.0.0-rc.1
```

#### 管理 tags

```bash
# 添加 tag
npm dist-tag add my-package@1.0.0 stable

# 删除 tag
npm dist-tag rm my-package beta
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** version钩子

### 题目

npm version 支持哪些生命周期钩子？

**选项：**
- A. preversion
- B. version
- C. postversion
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**npm version 生命周期**

#### package.json 配置

```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add dist",
    "postversion": "git push && git push --tags"
  }
}
```

#### 执行顺序

```bash
npm version patch

# 执行流程：
# 1. preversion   - 测试
# 2. 更新版本号
# 3. version      - 构建
# 4. git commit
# 5. git tag
# 6. postversion  - 推送
```

#### 详细示例

**preversion（版本前）：**
```json
{
  "preversion": "npm run lint && npm test"
}
```

**确保代码质量**

**version（版本时）：**
```json
{
  "version": "npm run build && git add -A"
}
```

**构建并提交产物**

**postversion（版本后）：**
```json
{
  "postversion": "git push origin main --follow-tags && npm publish"
}
```

**推送并发布**

#### 完整流程

```bash
npm version minor

# 1. preversion
# ├─ npm run lint     ✓
# ├─ npm test         ✓
#
# 2. 更新版本
# ├─ package.json: 1.0.0 → 1.1.0
#
# 3. version
# ├─ npm run build    ✓
# ├─ git add dist/    ✓
#
# 4. git commit
# ├─ "chore: bump version to 1.1.0"
#
# 5. git tag
# ├─ v1.1.0
#
# 6. postversion
# ├─ git push         ✓
# ├─ npm publish      ✓
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 发布自动化

### 题目

如何实现完全自动化的发布流程？

<details>
<summary>查看答案</summary>

### ✅ 答案

**完全自动化发布方案**

#### 方案：Semantic Release

**1. 安装：**
```bash
npm install -D semantic-release
npm install -D @semantic-release/changelog
npm install -D @semantic-release/git
```

**2. 配置：**
```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

**3. Commit 规范：**
```bash
# feat → MINOR
git commit -m "feat: add new feature"

# fix → PATCH
git commit -m "fix: resolve bug"

# BREAKING CHANGE → MAJOR
git commit -m "feat!: breaking change"

# 或
git commit -m "feat: change API

BREAKING CHANGE: API changed"
```

**4. CI 配置：**
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm test
      - run: npm run build
      
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

#### 完整流程

```
Developer:
1. 开发功能
2. 规范 commit
3. Push 到 main

CI/CD:
4. 分析 commits
   ├─ feat: → minor
   ├─ fix: → patch
   └─ feat!: → major
5. 更新版本号
6. 生成 CHANGELOG
7. 创建 Release
8. 发布到 npm
9. 通知团队
```

#### Monorepo 方案

**使用 multi-semantic-release：**
```bash
npm install -D multi-semantic-release
```

**配置：**
```json
{
  "extends": "semantic-release-monorepo",
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        "pkgRoot": "."
      }
    ]
  ]
}
```

**CI：**
```yaml
- name: Release all packages
  run: npx multi-semantic-release
```

### 📖 解析

**自动化优势**

1. ✅ 零人工干预
2. ✅ 规范一致
3. ✅ 自动 CHANGELOG
4. ✅ 减少错误
5. ✅ 提高效率

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 版本回退

### 题目

如何回退已发布的 npm 包版本？

<details>
<summary>查看答案</summary>

### ✅ 答案

**npm 包版本回退策略**

#### 方案 1：deprecate（推荐）

```bash
# 标记版本为已废弃
npm deprecate my-package@1.0.1 "This version has critical bugs. Please use 1.0.0"
```

**效果：**
```bash
npm install my-package@1.0.1

# 警告：
# npm WARN deprecated my-package@1.0.1: This version has critical bugs.
```

**用户仍可安装，但会收到警告**

#### 方案 2：unpublish（限制）

```bash
# 取消发布（72小时内）
npm unpublish my-package@1.0.1

# 或完全删除（危险）
npm unpublish my-package --force
```

**限制：**
- 只能在发布后 72 小时内
- 影响已安装的用户
- 破坏性操作

#### 方案 3：发布修复版本（最佳）

```bash
# 1. 修复 bug
git revert abc1234

# 2. 发布新版本
npm version patch  # 1.0.1 → 1.0.2
npm publish

# 3. 标记旧版本
npm deprecate my-package@1.0.1 "Fixed in 1.0.2"

# 4. 更新 latest tag
npm dist-tag add my-package@1.0.2 latest
```

#### 完整回退流程

**场景：1.0.1 有严重 bug**

```bash
# 1. 评估影响
npm info my-package versions
npm info my-package dist-tags

# 2. 决策
# - 紧急 → unpublish（72h内）
# - 一般 → deprecate + 新版本

# 3. 执行回退
npm deprecate my-package@1.0.1 "Critical bug. Use 1.0.0 or 1.0.2"

# 4. 发布修复
npm version patch
npm publish

# 5. 通知用户
# - GitHub Release 说明
# - npm 公告
# - Email 通知

# 6. 监控
npm view my-package versions
npm view my-package dist-tags
```

#### 防范措施

**1. 发布前检查：**
```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build"
  }
}
```

**2. 使用 dist-tag：**
```bash
# 先发布 beta
npm publish --tag beta

# 测试通过后
npm dist-tag add my-package@1.0.1 latest
```

**3. 自动化测试：**
```yaml
- name: Test package
  run: |
    npm pack
    cd test-app
    npm install ../my-package-1.0.0.tgz
    npm test
```

### 📖 解析

**最佳实践**

1. ✅ 优先 deprecate
2. ✅ 快速发布修复
3. ✅ 清晰沟通
4. ✅ 预防为主

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 发布脚本

### 题目

实现一个安全的发布脚本。

<details>
<summary>查看答案</summary>

### ✅ 答案

**安全发布脚本**

```javascript
#!/usr/bin/env node
// scripts/release.js

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

class ReleaseManager {
  constructor() {
    this.pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.currentVersion = this.pkg.version;
  }

  // 执行命令
  exec(cmd, options = {}) {
    try {
      return execSync(cmd, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      }).trim();
    } catch (e) {
      throw new Error(`Command failed: ${cmd}\n${e.message}`);
    }
  }

  // 询问用户
  async ask(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }

  // 检查工作区
  checkWorkingDirectory() {
    console.log('📋 检查工作区...');

    // 检查未提交的更改
    const status = this.exec('git status --porcelain');
    if (status) {
      throw new Error('工作区有未提交的更改，请先提交或暂存');
    }

    // 检查分支
    const branch = this.exec('git rev-parse --abbrev-ref HEAD');
    if (branch !== 'main' && branch !== 'master') {
      throw new Error(`当前在 ${branch} 分支，请切换到 main/master`);
    }

    // 检查远程同步
    this.exec('git fetch');
    const behind = this.exec('git rev-list HEAD..origin/' + branch + ' --count');
    if (parseInt(behind) > 0) {
      throw new Error(`本地落后远程 ${behind} 个提交，请先 pull`);
    }

    console.log('✓ 工作区检查通过\n');
  }

  // 运行测试
  runTests() {
    console.log('🧪 运行测试...');

    try {
      this.exec('npm test', { stdio: 'inherit' });
      console.log('✓ 测试通过\n');
    } catch {
      throw new Error('测试失败');
    }
  }

  // 运行构建
  runBuild() {
    console.log('🔨 运行构建...');

    try {
      this.exec('npm run build', { stdio: 'inherit' });
      console.log('✓ 构建成功\n');
    } catch {
      throw new Error('构建失败');
    }
  }

  // 选择版本类型
  async selectVersionType() {
    console.log('📦 选择版本类型：');
    console.log(`   当前版本: ${this.currentVersion}`);
    console.log('   1. patch - bug 修复');
    console.log('   2. minor - 新功能');
    console.log('   3. major - 破坏性更新');
    console.log('   4. custom - 自定义版本\n');

    const choice = await this.ask('选择 (1-4): ');

    const types = ['', 'patch', 'minor', 'major', 'custom'];
    const type = types[parseInt(choice)];

    if (!type) {
      throw new Error('无效选择');
    }

    if (type === 'custom') {
      const version = await this.ask('输入版本号: ');
      return { type: 'custom', version };
    }

    return { type };
  }

  // 更新版本
  updateVersion(versionInfo) {
    console.log('\n📝 更新版本...');

    if (versionInfo.type === 'custom') {
      this.exec(`npm version ${versionInfo.version} --no-git-tag-version`);
    } else {
      this.exec(`npm version ${versionInfo.type} --no-git-tag-version`);
    }

    // 重新读取版本
    this.pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const newVersion = this.pkg.version;

    console.log(`✓ 版本更新: ${this.currentVersion} → ${newVersion}\n`);

    return newVersion;
  }

  // 生成 CHANGELOG
  generateChangelog(newVersion) {
    console.log('📄 生成 CHANGELOG...');

    try {
      // 使用 conventional-changelog
      this.exec('npx conventional-changelog -p angular -i CHANGELOG.md -s');
      console.log('✓ CHANGELOG 已生成\n');
    } catch {
      console.log('⚠️  CHANGELOG 生成失败，跳过\n');
    }
  }

  // Git 提交
  async gitCommit(version) {
    console.log('📌 创建 Git commit 和 tag...');

    // 添加文件
    this.exec('git add package.json package-lock.json CHANGELOG.md');

    // 提交
    this.exec(`git commit -m "chore: release v${version}"`);

    // 创建 tag
    this.exec(`git tag -a v${version} -m "Release v${version}"`);

    console.log('✓ Git commit 和 tag 已创建\n');
  }

  // 确认发布
  async confirmRelease(version) {
    console.log('⚠️  即将发布：');
    console.log(`   包名: ${this.pkg.name}`);
    console.log(`   版本: ${version}`);
    console.log(`   Registry: ${this.exec('npm config get registry')}\n`);

    const answer = await this.ask('确认发布? (yes/no): ');

    if (answer.toLowerCase() !== 'yes') {
      throw new Error('发布已取消');
    }
  }

  // 发布到 npm
  publishToNpm() {
    console.log('\n🚀 发布到 npm...');

    try {
      // 检查登录
      const user = this.exec('npm whoami');
      console.log(`✓ 已登录: ${user}`);

      // 发布
      this.exec('npm publish', { stdio: 'inherit' });

      console.log('✓ 发布成功\n');
    } catch (e) {
      throw new Error(`发布失败: ${e.message}`);
    }
  }

  // 推送到远程
  pushToRemote() {
    console.log('📤 推送到远程...');

    this.exec('git push');
    this.exec('git push --tags');

    console.log('✓ 推送成功\n');
  }

  // 创建 GitHub Release
  async createGitHubRelease(version) {
    console.log('📢 创建 GitHub Release...');

    try {
      // 提取 CHANGELOG
      const changelog = this.extractChangelog(version);

      // 使用 gh CLI
      this.exec(`gh release create v${version} --title "v${version}" --notes "${changelog}"`);

      console.log('✓ GitHub Release 已创建\n');
    } catch (e) {
      console.log('⚠️  GitHub Release 创建失败，跳过\n');
    }
  }

  // 提取 CHANGELOG
  extractChangelog(version) {
    try {
      const content = fs.readFileSync('CHANGELOG.md', 'utf8');
      const versionRegex = new RegExp(`## \\[?${version}\\]?[\\s\\S]*?(?=## |$)`);
      const match = content.match(versionRegex);
      return match ? match[0].trim() : `Release ${version}`;
    } catch {
      return `Release ${version}`;
    }
  }

  // 回滚
  async rollback() {
    console.log('\n❌ 回滚更改...');

    try {
      // 删除 tag
      const tags = this.exec('git tag -l "v*"').split('\n');
      const latestTag = tags[tags.length - 1];
      if (latestTag) {
        this.exec(`git tag -d ${latestTag}`);
      }

      // 重置 commit
      this.exec('git reset --hard HEAD~1');

      // 恢复 package.json
      this.exec('git checkout package.json package-lock.json');

      console.log('✓ 回滚完成\n');
    } catch (e) {
      console.error('⚠️  回滚失败:', e.message);
    }
  }

  // 主流程
  async run() {
    console.log('🎯 开始发布流程\n');

    try {
      // 1. 检查
      this.checkWorkingDirectory();

      // 2. 测试
      this.runTests();

      // 3. 构建
      this.runBuild();

      // 4. 选择版本
      const versionInfo = await this.selectVersionType();

      // 5. 更新版本
      const newVersion = this.updateVersion(versionInfo);

      // 6. 生成 CHANGELOG
      this.generateChangelog(newVersion);

      // 7. Git 提交
      await this.gitCommit(newVersion);

      // 8. 确认发布
      await this.confirmRelease(newVersion);

      // 9. 发布
      this.publishToNpm();

      // 10. 推送
      this.pushToRemote();

      // 11. GitHub Release
      await this.createGitHubRelease(newVersion);

      console.log('✨ 发布完成！\n');
      console.log(`   版本: v${newVersion}`);
      console.log(`   npm: https://www.npmjs.com/package/${this.pkg.name}`);
      console.log(`   GitHub: https://github.com/${this.pkg.repository}`);

    } catch (error) {
      console.error('\n❌ 发布失败:', error.message);

      const answer = await this.ask('\n是否回滚? (yes/no): ');
      if (answer.toLowerCase() === 'yes') {
        await this.rollback();
      }

      process.exit(1);
    }
  }
}

// 运行
const manager = new ReleaseManager();
manager.run().catch(console.error);
```

**使用：**
```bash
node scripts/release.js
```

**package.json：**
```json
{
  "scripts": {
    "release": "node scripts/release.js"
  }
}
```

### 📖 解析

**安全检查点**

1. ✅ 工作区清洁
2. ✅ 测试通过
3. ✅ 构建成功
4. ✅ 版本正确
5. ✅ 确认发布
6. ✅ 支持回滚

</details>

---

**导航**  
[上一章：第 27 章面试题](./chapter-27.md) | [返回目录](../README.md) | [下一章：第 29 章面试题](./chapter-29.md)
