# 第 11 章：npm 发布与版本控制 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 发布基础

### 题目

首次发布 npm 包需要执行什么操作？

**选项：**
- A. npm init
- B. npm login
- C. npm publish
- D. npm register

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm 发布流程**

#### 1. 注册账号

```bash
# 在 npmjs.com 注册
# 或命令行注册
npm adduser
```

#### 2. 登录

```bash
npm login

# 输入：
Username: your-username
Password: ********
Email: you@example.com
```

**验证登录：**
```bash
npm whoami
# your-username
```

#### 3. 初始化包

```bash
npm init
```

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}
```

#### 4. 发布

```bash
npm publish
```

**完整流程：**
```bash
npm login       # ✅ B 首次必须
npm init        # A 创建 package.json
npm publish     # C 发布
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 作用域包

### 题目

作用域包（如 @myorg/package）默认发布为私有包。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**作用域包发布**

#### 默认行为

```bash
# 作用域包
npm publish

# ❌ 报错
npm ERR! You must sign up for private packages
```

**作用域包默认为私有，需要付费！**

#### 公开发布

```bash
# 方法 1：命令行参数
npm publish --access public

# 方法 2：package.json
{
  "name": "@myorg/package",
  "publishConfig": {
    "access": "public"
  }
}

npm publish  # ✅ 公开发布
```

#### 普通包 vs 作用域包

**普通包（默认公开）：**
```json
{
  "name": "my-package"
}
```

```bash
npm publish  # ✅ 默认公开
```

**作用域包（默认私有）：**
```json
{
  "name": "@myorg/my-package"
}
```

```bash
npm publish  # ❌ 需要付费
npm publish --access public  # ✅ 免费公开
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 版本号递增

### 题目

`npm version patch` 会将版本 `1.2.3` 更新为？

**选项：**
- A. 1.2.4
- B. 1.3.0
- C. 2.0.0
- D. 1.2.3-patch

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm version 命令**

#### 版本递增规则

```bash
# 当前版本：1.2.3

npm version patch   # 1.2.4  ✅ A
npm version minor   # 1.3.0
npm version major   # 2.0.0
```

#### 完整命令列表

```bash
# 基础递增
npm version patch   # 1.2.3 → 1.2.4
npm version minor   # 1.2.3 → 1.3.0
npm version major   # 1.2.3 → 2.0.0

# 预发布
npm version prepatch    # 1.2.3 → 1.2.4-0
npm version preminor    # 1.2.3 → 1.3.0-0
npm version premajor    # 1.2.3 → 2.0.0-0
npm version prerelease  # 1.2.3 → 1.2.4-0
                        # 1.2.4-0 → 1.2.4-1

# 指定版本
npm version 2.0.0       # → 2.0.0
```

#### 自动操作

```bash
npm version patch

# 自动执行：
# 1. 修改 package.json 版本
# 2. 创建 Git commit
# 3. 创建 Git tag (v1.2.4)
```

**禁用 Git：**
```bash
npm version patch --no-git-tag-version
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 发布钩子

### 题目

以下哪些是 npm publish 的生命周期钩子？

**选项：**
- A. prepublishOnly
- B. prepare
- C. prepack
- D. postpublish

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**npm publish 生命周期**

#### 完整流程

```json
{
  "scripts": {
    "prepublishOnly": "npm test",     // A ✅
    "prepare": "npm run build",       // B ✅
    "prepack": "echo packing",        // C ✅
    "postpack": "echo packed",
    "publish": "echo publishing",
    "postpublish": "echo published"   // D ✅
  }
}
```

#### 执行顺序

```bash
npm publish

# 1. prepublishOnly  ← npm 7+
# 2. prepare
# 3. prepack
# 4. [打包]
# 5. postpack
# 6. publish
# 7. [上传]
# 8. postpublish
```

#### 各钩子用途

**prepublishOnly（推荐）：**
```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build"
  }
}
```

- 只在 `npm publish` 时执行
- 不在 `npm install` 时执行
- 适合测试和构建

**prepare：**
```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

- `npm publish` 时执行
- `npm install`（无参数）时也执行
- `git clone` 后的 install 也执行

**prepack：**
```json
{
  "scripts": {
    "prepack": "npm run minify"
  }
}
```

- `npm pack` 时执行
- `npm publish` 时执行

**postpublish：**
```json
{
  "scripts": {
    "postpublish": "echo '发布成功！' && npm run deploy-docs"
  }
}
```

- 发布完成后执行
- 适合通知、部署文档等

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** dist-tags

### 题目

执行以下命令后，用户 `npm install react` 会安装哪个版本？

```bash
npm publish --tag beta    # 发布 19.0.0-beta.1
npm publish --tag latest  # 发布 18.2.0
```

**选项：**
- A. 19.0.0-beta.1
- B. 18.2.0
- C. 报错
- D. 最新发布的版本

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**dist-tags 机制**

#### 默认标签：latest

```bash
npm install react
# 等价于
npm install react@latest

# 安装 latest 标签指向的版本
```

#### dist-tags 配置

```bash
# 查看所有标签
npm dist-tag ls react

# 输出：
beta: 19.0.0-beta.1
latest: 18.2.0  ← npm install 使用这个
next: 18.3.0-rc.1
```

#### 发布到不同标签

**发布 beta：**
```bash
npm version 19.0.0-beta.1
npm publish --tag beta

# 不影响 latest
```

**发布正式版：**
```bash
npm version 18.2.0
npm publish  # 默认标签是 latest

# 或显式指定
npm publish --tag latest
```

#### 安装特定标签

```bash
npm install react          # latest
npm install react@beta     # beta 标签
npm install react@next     # next 标签
npm install react@18.2.0   # 精确版本
```

#### 管理标签

```bash
# 添加标签
npm dist-tag add react@19.0.0 next

# 删除标签
npm dist-tag rm react next

# 查看标签
npm dist-tag ls react
```

#### 发布流程示例

```bash
# 1. 开发新版本
npm version 19.0.0-alpha.1
npm publish --tag alpha

# 2. Beta 测试
npm version 19.0.0-beta.1
npm publish --tag beta

# 3. RC 版本
npm version 19.0.0-rc.1
npm publish --tag next

# 4. 正式发布
npm version 19.0.0
npm publish  # 自动标记为 latest

# 用户安装
npm install react          # 19.0.0 (latest)
npm install react@beta     # 19.0.0-beta.1
npm install react@18.2.0   # 继续使用旧版本
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 撤销发布

### 题目

npm 包发布后多久内可以撤销？

**选项：**
- A. 24小时
- B. 72小时
- C. 永远可以
- D. 永远不能

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm unpublish 规则**

#### 72小时窗口

```bash
# 发布后 72 小时内可以撤销
npm unpublish my-package@1.0.0
```

**超过 72 小时后不能撤销！**

#### 撤销条件

```bash
# ✅ 可以撤销
- 发布时间 < 72 小时
- 没有其他包依赖它
- 你是包的维护者

# ❌ 不能撤销
- 发布时间 > 72 小时
- 有其他包依赖
```

#### 撤销命令

```bash
# 撤销特定版本
npm unpublish my-package@1.0.0

# 撤销整个包（危险！）
npm unpublish my-package --force
```

**警告：** 撤销整个包会删除所有版本

#### 废弃版本（推荐）

```bash
# 不撤销，只标记为废弃
npm deprecate my-package@1.0.0 "请使用 1.0.1"
```

**用户安装时会看到警告：**
```bash
npm install my-package@1.0.0

npm WARN deprecated my-package@1.0.0: 请使用 1.0.1
```

#### 最佳实践

```bash
# ❌ 错误做法
npm unpublish my-package@1.0.0  # 破坏依赖

# ✅ 正确做法
# 1. 标记废弃
npm deprecate my-package@1.0.0 "有严重bug，请升级到 1.0.1"

# 2. 发布修复版本
npm version patch
npm publish
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 版本策略

### 题目

执行 `npm version` 后发生了什么？

```bash
git status
# On branch main, nothing to commit

npm version patch

git status
# ?
```

**选项：**
- A. 没有变化
- B. package.json 被修改但未提交
- C. 自动创建了 commit 和 tag
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm version 的 Git 集成**

#### 自动 Git 操作

```bash
# 执行前
git log --oneline
# abc1234 feat: add feature

npm version patch  # 1.0.0 → 1.0.1

# 执行后
git log --oneline
# def5678 1.0.1  ← 自动创建的 commit
# abc1234 feat: add feature

git tag
# v1.0.1  ← 自动创建的 tag
```

**自动执行：**
1. 修改 package.json 的 version
2. 创建 Git commit（消息为版本号）
3. 创建 Git tag（`v` + 版本号）

#### 禁用 Git 操作

```bash
npm version patch --no-git-tag-version

# 只修改 package.json
# 不创建 commit 和 tag
```

#### 自定义 commit 消息

```bash
# .npmrc 或 package.json
npm config set message "chore: bump version to %s"

npm version patch
# 创建 commit: "chore: bump version to 1.0.1"
```

```json
{
  "version": "1.0.0",
  "config": {
    "version-git-message": "chore: release v%s"
  }
}
```

#### 发布流程

```bash
# 1. 完成开发
git add .
git commit -m "feat: new feature"

# 2. 版本号递增
npm version patch
# 自动 commit + tag

# 3. 推送
git push
git push --tags

# 4. 发布
npm publish
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 发布检查

### 题目

发布前应该检查哪些内容？

**选项：**
- A. 运行测试
- B. 检查 .npmignore
- C. 使用 npm pack 预览
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**发布前检查清单**

#### 1. 运行测试 ✅

```bash
npm test
npm run lint
npm run build
```

**确保代码质量**

#### 2. 检查文件包含 ✅

**package.json：**
```json
{
  "files": [
    "dist",
    "lib",
    "bin"
  ]
}
```

**.npmignore：**
```
tests/
*.test.js
.env
.DS_Store
```

**查看将包含的文件：**
```bash
npm pack --dry-run
```

#### 3. 预览包内容 ✅

```bash
# 打包（不发布）
npm pack

# 生成 my-package-1.0.0.tgz

# 解压查看
tar -xzf my-package-1.0.0.tgz
cd package
ls -la
```

#### 4. 本地测试

```bash
# 在测试项目中
npm install ../my-package/my-package-1.0.0.tgz

# 或
npm link ../my-package
```

#### 5. 检查 package.json 字段

```json
{
  "name": "my-package",           // ✅ 唯一
  "version": "1.0.0",             // ✅ 正确
  "description": "...",           // ✅ 描述
  "main": "./dist/index.js",      // ✅ 入口存在
  "types": "./dist/index.d.ts",   // ✅ 类型定义
  "keywords": [...],              // ✅ 关键词
  "license": "MIT",               // ✅ 许可证
  "repository": {                 // ✅ 仓库
    "type": "git",
    "url": "https://github.com/user/repo"
  },
  "bugs": "...",                  // ✅ 问题追踪
  "homepage": "..."               // ✅ 主页
}
```

#### 完整检查脚本

```json
{
  "scripts": {
    "prepublishOnly": "npm run check",
    "check": "npm run check:files && npm run check:quality",
    "check:files": "npm pack --dry-run",
    "check:quality": "npm run lint && npm run test && npm run build"
  }
}
```

#### 自动化检查

```bash
# 使用 np（推荐）
npx np

# 交互式发布流程
# ✓ 检查 Git 状态
# ✓ 运行测试
# ✓ 递增版本
# ✓ 发布
# ✓ 推送 Git
# ✓ 创建 GitHub Release
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** Monorepo发布

### 题目

在 Monorepo 中如何管理多个包的版本和发布？

**选项：**
- A. 手动逐个发布
- B. 使用 Lerna
- C. 使用 Changesets
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Monorepo 发布策略**

#### 方案 B：Lerna ✅

**安装配置：**
```bash
npm install -g lerna
lerna init
```

**lerna.json：**
```json
{
  "version": "independent",  // 独立版本
  "npmClient": "npm",
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore: release"
    }
  }
}
```

**发布流程：**
```bash
# 1. 检查变更
lerna changed

# 2. 版本递增（交互式）
lerna version

# 3. 发布
lerna publish from-package
```

#### 方案 C：Changesets ✅（推荐）

**安装：**
```bash
npm install -D @changesets/cli
npx changeset init
```

**工作流：**

**1. 添加 changeset：**
```bash
npx changeset

# 交互式选择：
# - 哪些包变更了
# - 变更类型（major/minor/patch）
# - 变更描述
```

**2. 生成文件：**
```
.changeset/
└── quick-panda-123.md
```

**3. 版本递增：**
```bash
npx changeset version

# 自动：
# - 更新 package.json 版本
# - 生成 CHANGELOG.md
# - 删除 changeset 文件
```

**4. 发布：**
```bash
npx changeset publish

# 发布所有变更的包
```

#### 对比

| 特性 | Lerna | Changesets |
|------|-------|-----------|
| **学习曲线** | 中等 | 简单 |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **版本策略** | Fixed/Independent | Independent |
| **CHANGELOG** | ✅ | ✅ |
| **CI集成** | ✅ | ✅✅ |
| **推荐度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

#### 完整示例（Changesets）

**目录结构：**
```
my-monorepo/
├── .changeset/
│   └── config.json
├── packages/
│   ├── ui/
│   │   └── package.json
│   └── utils/
│       └── package.json
```

**package.json：**
```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

**GitHub Actions：**
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
      
      - uses: actions/setup-node@v3
      
      - run: npm ci
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**自动创建 Release PR！**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 发布自动化

### 题目

如何实现完全自动化的发布流程？

<details>
<summary>查看答案</summary>

### ✅ 答案

**使用 semantic-release**

#### 1. 安装配置

```bash
npm install -D semantic-release
```

**package.json：**
```json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

**.releaserc.json：**
```json
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

#### 2. Commit 约定

```bash
# feat: 新功能 → MINOR 版本
git commit -m "feat: add new feature"
# 1.0.0 → 1.1.0

# fix: bug修复 → PATCH 版本
git commit -m "fix: resolve issue"
# 1.0.0 → 1.0.1

# BREAKING CHANGE → MAJOR 版本
git commit -m "feat!: change API"
# 1.0.0 → 2.0.0
```

#### 3. CI/CD 集成

**GitHub Actions：**
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
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      
      - run: npm test
      
      - run: npm run build
      
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### 4. 自动化内容

**semantic-release 自动：**
- ✅ 分析 commits
- ✅ 确定版本号
- ✅ 生成 CHANGELOG
- ✅ 创建 Git tag
- ✅ 发布到 npm
- ✅ 创建 GitHub Release

### 📖 解析

**完整工作流**

#### 开发者：

```bash
# 1. 开发功能
git checkout -b feature/new-feature

# 2. 提交（遵循约定）
git commit -m "feat: add awesome feature"

# 3. 推送
git push origin feature/new-feature

# 4. 创建 PR
gh pr create

# 5. 合并到 main
gh pr merge
```

#### CI/CD 自动：

```
1. 检测到 main 分支推送
2. 运行测试
3. 分析 commits
   - "feat:" → MINOR 递增
4. 生成 CHANGELOG
5. 发布 npm 包
6. 创建 GitHub Release
7. 发送通知
```

#### 配置示例

**.releaserc.json（完整）：**
```json
{
  "branches": [
    "main",
    {
      "name": "beta",
      "prerelease": true
    }
  ],
  "plugins": [
    ["@semantic-release/commit-analyzer", {
      "preset": "conventionalcommits"
    }],
    ["@semantic-release/release-notes-generator", {
      "preset": "conventionalcommits"
    }],
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", {
      "npmPublish": true
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }],
    ["@semantic-release/github", {
      "assets": [
        {"path": "dist/**"}
      ]
    }]
  ]
}
```

**零手动操作发布！**

</details>

---

**导航**  
[上一章：第 10 章面试题](./chapter-10.md) | [返回目录](../README.md) | [下一章：第 12 章面试题](./chapter-12.md)
