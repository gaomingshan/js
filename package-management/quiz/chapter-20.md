# 第 20 章：Yarn 迁移与生态 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** npm到Yarn

### 题目

从 npm 迁移到 Yarn 的第一步是什么？

**选项：**
- A. 删除 node_modules
- B. 安装 Yarn
- C. 删除 package-lock.json
- D. 修改 package.json

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm → Yarn 迁移步骤**

#### 1. 安装 Yarn

```bash
# 使用 npm 安装（推荐）
npm install -g yarn

# 或使用 Corepack（Node.js 16.10+）
corepack enable
corepack prepare yarn@stable --activate
```

#### 2. 清理 npm 文件

```bash
# 删除 npm lock 文件
rm package-lock.json

# 删除 node_modules
rm -rf node_modules
```

#### 3. 安装依赖

```bash
yarn install
# 生成 yarn.lock
```

#### 4. 验证

```bash
yarn --version
# 检查版本

yarn list
# 验证依赖树
```

#### 5. 更新 CI/CD

```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: yarn install --frozen-lockfile
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 兼容性

### 题目

Yarn 1.x 和 npm 的 package.json 完全兼容。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**package.json 兼容性**

#### 完全兼容

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0"
  },
  "scripts": {
    "start": "node index.js"
  }
}
```

**npm 和 Yarn 都能使用**

#### 无需修改

```bash
# npm 项目
npm install

# 直接改用 Yarn
yarn install
# ✅ 完全兼容
```

#### 唯一区别：lock 文件

```bash
# npm
package-lock.json

# Yarn
yarn.lock
```

**package.json 本身完全相同**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 命令对应

### 题目

Yarn 中对应 `npm run` 的命令是什么？

**选项：**
- A. yarn run
- B. yarn
- C. yarn exec
- D. A 和 B 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm vs Yarn 命令**

#### 运行脚本

```bash
# npm
npm run dev

# Yarn
yarn run dev
# 或简写
yarn dev  # ✅ 也可以
```

**注意：** `yarn` 不带参数是 `yarn install`

#### 完整对照表

| 操作 | npm | Yarn |
|------|-----|------|
| **安装所有** | npm install | yarn / yarn install |
| **添加依赖** | npm install pkg | yarn add pkg |
| **移除依赖** | npm uninstall pkg | yarn remove pkg |
| **运行脚本** | npm run script | yarn run script / yarn script |
| **全局安装** | npm install -g | yarn global add |
| **初始化** | npm init | yarn init |
| **发布** | npm publish | yarn publish |

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** Yarn生态

### 题目

Yarn 生态中有哪些重要工具？

**选项：**
- A. Plug'n'Play
- B. Yarn Workspaces
- C. Berry (Yarn 2+)
- D. npm

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C

### 📖 解析

**Yarn 生态工具**

#### A. Plug'n'Play ✅

```yaml
# .yarnrc.yml
nodeLinker: pnp
```

**特性：**
- 无 node_modules
- 极速安装
- 严格依赖

#### B. Workspaces ✅

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**特性：**
- Monorepo 支持
- 依赖提升
- 跨包引用

#### C. Berry (Yarn 2+) ✅

```bash
yarn set version berry
```

**特性：**
- 完全重写
- 插件系统
- 现代化架构

#### 相关生态工具

**1. Changesets：**
```bash
yarn add -D @changesets/cli
```

**用途：** 版本管理和发布

**2. Turborepo：**
```bash
yarn add -D turbo
```

**用途：** Monorepo 构建加速

**3. Yarn SDKs：**
```bash
yarn sdks vscode
```

**用途：** IDE 集成

**4. Yarn Plugins：**
```bash
yarn plugin import workspace-tools
yarn plugin import interactive-tools
```

**用途：** 功能扩展

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 迁移问题

### 题目

从 npm 迁移到 Yarn 2+ 可能遇到哪些问题？

**选项：**
- A. PnP 兼容性问题
- B. lock 文件格式不同
- C. 配置文件变化
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**迁移常见问题**

#### A. PnP 兼容性 ✅

**问题：**
```javascript
// 某些包依赖 node_modules 结构
const pkg = require('legacy-package');
// Error: Cannot find module
```

**解决：**
```yaml
# 回退到 node-modules
nodeLinker: node-modules

# 或 unplug 特定包
packageExtensions:
  "legacy-package@*":
    unplugged: true
```

#### B. Lock 文件格式 ✅

**npm：**
```json
{
  "lockfileVersion": 3,
  "packages": {...}
}
```

**Yarn 2+：**
```yaml
__metadata:
  version: 6

"pkg@npm:1.0.0":
  version: 1.0.0
```

**解决：** 重新生成 lock 文件

```bash
rm package-lock.json
yarn install
```

#### C. 配置文件 ✅

**npm：**
```ini
# .npmrc
registry=https://registry.npmjs.org
```

**Yarn 2+：**
```yaml
# .yarnrc.yml
npmRegistryServer: "https://registry.npmjs.org"
```

**解决：** 转换配置

```bash
# .npmrc
registry=https://npm.example.com
//npm.example.com/:_authToken=${TOKEN}

# 转换为 .yarnrc.yml
npmRegistryServer: "https://npm.example.com"
npmAuthToken: "${TOKEN}"
```

#### 其他常见问题

**问题 1：全局安装位置**
```bash
# npm
~/.npm-global/bin/

# Yarn 2+
~/.yarn/bin/
```

**问题 2：scripts 行为**
```bash
# npm
npm run build  # 总是运行 prebuild → build → postbuild

# Yarn 2+
yarn build  # 相同行为
```

**问题 3：依赖解析**
```bash
# npm
# 可能访问未声明的依赖（幽灵依赖）

# Yarn 2+ PnP
# 严格检查，拒绝幽灵依赖
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** Corepack

### 题目

Corepack 的作用是什么？

**选项：**
- A. 压缩包管理器
- B. 管理包管理器版本
- C. 核心包管理
- D. 包装工具

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Corepack - 包管理器管理器**

#### 概念

```bash
# Node.js 16.10+ 内置
corepack enable
```

**管理 Yarn、pnpm 等包管理器的版本**

#### 使用方式

**1. 启用：**
```bash
corepack enable
```

**2. 指定版本：**
```json
{
  "packageManager": "yarn@3.6.0"
}
```

**3. 自动使用：**
```bash
yarn --version
# 3.6.0（自动使用 package.json 指定的版本）
```

#### 优势

**统一团队环境：**
```json
// package.json
{
  "packageManager": "yarn@3.6.0"
}
```

```bash
# 团队成员
corepack enable
yarn install
# 自动使用 yarn@3.6.0
```

#### 支持的包管理器

```bash
# Yarn
corepack prepare yarn@3.6.0 --activate

# pnpm
corepack prepare pnpm@8.6.0 --activate

# npm 不需要（Node.js 自带）
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 互操作性

### 题目

npm 和 Yarn 可以在同一项目中混用吗？

**选项：**
- A. 可以，完全兼容
- B. 不推荐，可能导致问题
- C. 完全不能
- D. 只能在开发环境

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**混用包管理器的问题**

#### 技术上可行

```bash
# 使用 npm
npm install

# 切换到 Yarn
yarn install
```

**都能工作**

#### 不推荐的原因

**问题 1：Lock 文件冲突**
```bash
# npm install
package-lock.json  # 更新

# yarn install
yarn.lock  # 更新

# 两个 lock 文件可能不一致
```

**问题 2：依赖树差异**
```bash
# npm
node_modules/
├── pkg-a@1.0.0
└── pkg-b/
    └── node_modules/
        └── pkg-a@1.0.1

# Yarn
node_modules/
├── pkg-a@1.0.1  # 不同的提升结果
└── pkg-b/
```

**问题 3：脚本行为**
```json
{
  "scripts": {
    "postinstall": "husky install"
  }
}
```

```bash
# npm install
# ✅ 运行 postinstall

# yarn install
# ✅ 运行 postinstall

# 但可能在不同时机
```

#### 正确做法

**选择一个，统一使用：**

```bash
# 方法 1：.npmrc
echo "engine-strict=true" > .npmrc
```

```json
{
  "engines": {
    "yarn": ">=1.22.0",
    "npm": "please-use-yarn"
  }
}
```

**方法 2：only-allow**
```bash
npx only-allow yarn
```

**package.json：**
```json
{
  "scripts": {
    "preinstall": "npx only-allow yarn"
  }
}
```

**方法 3：Corepack**
```json
{
  "packageManager": "yarn@3.6.0"
}
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** Yarn vs npm

### 题目

对比 Yarn 和 npm 的优缺点。

<details>
<summary>查看答案</summary>

### ✅ 答案

**Yarn vs npm 完整对比**

#### 性能

| 特性 | npm | Yarn 1.x | Yarn 2+ |
|------|-----|----------|---------|
| **安装速度** | ⚡⚡ | ⚡⚡⚡ | ⚡⚡⚡⚡⚡ |
| **缓存** | ✅ | ✅✅ | ✅✅✅ |
| **并行** | ✅ | ✅ | ✅ |
| **离线** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

#### 功能

**npm 优势：**
- ✅ 内置（无需安装）
- ✅ 生态最大
- ✅ 文档丰富
- ✅ 企业支持（npm Inc.）

**npm 劣势：**
- ❌ 速度较慢
- ❌ 确定性不足（改善中）
- ❌ Workspaces 较新（v7+）

**Yarn 1.x 优势：**
- ✅ 速度快
- ✅ 确定性强
- ✅ 离线模式
- ✅ Workspaces

**Yarn 1.x 劣势：**
- ❌ 需要安装
- ❌ 不再积极维护
- ❌ 无 PnP

**Yarn 2+ 优势：**
- ✅ 最快（PnP）
- ✅ Zero-Installs
- ✅ 插件系统
- ✅ 严格依赖

**Yarn 2+ 劣势：**
- ❌ 学习曲线
- ❌ 兼容性问题
- ❌ 生态较新

#### 使用建议

**选择 npm：**
- 小型项目
- 简单依赖
- 需要最大兼容性
- 企业标准

**选择 Yarn 1.x：**
- 中型项目
- 需要 Workspaces
- 追求稳定性

**选择 Yarn 2+：**
- 大型 Monorepo
- 追求极致性能
- 可接受新技术
- CI/CD 要求高

#### 迁移建议

**npm → Yarn 1.x：**
- ✅ 低风险
- ✅ 平滑过渡
- ✅ 立即受益

**npm → Yarn 2+：**
- ⚠️ 中等风险
- ⚠️ 需要调整
- ✅ 长期收益

**Yarn 1.x → Yarn 2+：**
- ⚠️ 需要测试
- ⚠️ 配置迁移
- ✅ 性能提升显著

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 迁移策略

### 题目

如何制定大型项目的 Yarn 迁移计划？

<details>
<summary>查看答案</summary>

### ✅ 答案

**大型项目迁移计划**

#### 阶段 1：评估（1周）

**1. 技术评估：**
```bash
# 检查项目规模
npm ls --depth=0
# 包数量：200+

# 检查依赖复杂度
npm ls > dependency-tree.txt

# 检查特殊依赖
grep "git+" package.json
grep "file:" package.json
```

**2. 兼容性评估：**
```bash
# 检查 native 模块
npm ls | grep "node-gyp"

# 检查 postinstall 脚本
npm pkg get scripts.postinstall
```

**3. 成本评估：**
- 开发时间：2-4周
- 测试时间：1-2周
- 风险评估：中等
- 收益评估：性能提升 50%+

#### 阶段 2：准备（1周）

**1. 搭建测试环境：**
```bash
# 克隆项目
git clone repo test-yarn-migration
cd test-yarn-migration

# 安装 Yarn
npm install -g yarn
```

**2. 迁移测试：**
```bash
# 删除 npm 文件
rm package-lock.json
rm -rf node_modules

# 安装 Yarn
yarn install

# 运行测试
yarn test

# 运行构建
yarn build
```

**3. 记录问题：**
```markdown
# migration-issues.md

## 发现的问题

1. native-module 不兼容 PnP
   - 解决方案：使用 node-modules 模式

2. 某些 postinstall 脚本失败
   - 解决方案：更新脚本路径
```

#### 阶段 3：试点（2周）

**1. 选择子项目：**
```bash
# 选择 1-2 个小项目试点
packages/utils/  # ✅ 简单，无 native 依赖
packages/ui/     # ✅ 中等复杂度
```

**2. 迁移并监控：**
```bash
cd packages/utils
rm package-lock.json
yarn install

# 监控
- 安装时间
- 构建时间
- 测试通过率
- 团队反馈
```

**3. 优化配置：**
```yaml
# .yarnrc.yml
nodeLinker: node-modules  # 暂不启用 PnP
npmRegistryServer: "https://registry.npmmirror.com"
```

#### 阶段 4：推广（3周）

**1. 分批迁移：**
```bash
# 第一批：工具库（1周）
packages/utils
packages/helpers
packages/constants

# 第二批：UI 组件（1周）
packages/ui
packages/icons

# 第三批：应用（1周）
apps/web
apps/admin
```

**2. 团队培训：**
```markdown
# Yarn 培训文档

## 常用命令
- yarn install
- yarn add pkg
- yarn remove pkg
- yarn workspace pkg-name run build

## 注意事项
- 使用 yarn，不要用 npm
- 提交 yarn.lock
- CI 使用 yarn install --frozen-lockfile
```

**3. CI/CD 更新：**
```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: |
    yarn --version
    yarn install --frozen-lockfile
```

#### 阶段 5：优化（持续）

**1. 启用 PnP（可选）：**
```yaml
# .yarnrc.yml
nodeLinker: pnp
```

**2. Zero-Installs：**
```bash
git add .yarn/cache
```

**3. 性能监控：**
```javascript
// scripts/monitor-performance.js
// 持续监控安装时间
```

### 📖 解析

**迁移检查清单**

**✅ 迁移前：**
- [ ] 技术评估完成
- [ ] 兼容性测试通过
- [ ] 团队培训完成
- [ ] 回滚方案准备

**✅ 迁移中：**
- [ ] 分批次迁移
- [ ] 实时监控
- [ ] 问题记录
- [ ] 及时调整

**✅ 迁移后：**
- [ ] 性能验证
- [ ] 文档更新
- [ ] 团队反馈
- [ ] 持续优化

**风险控制：**
- 保留 npm 回滚能力
- 分阶段推进
- 充分测试
- 团队支持

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 迁移工具

### 题目

编写自动化迁移脚本。

<details>
<summary>查看答案</summary>

### ✅ 答案

**自动化迁移脚本**

```javascript
#!/usr/bin/env node
// migrate-to-yarn.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔄 npm → Yarn 迁移工具\n');

  // 1. 检查环境
  console.log('📋 检查环境...');
  
  try {
    execSync('yarn --version', { stdio: 'pipe' });
    console.log('✅ Yarn 已安装');
  } catch {
    console.log('❌ Yarn 未安装');
    const install = await ask('是否安装 Yarn? (y/n): ');
    if (install.toLowerCase() === 'y') {
      execSync('npm install -g yarn', { stdio: 'inherit' });
    } else {
      process.exit(1);
    }
  }

  // 2. 检查项目
  console.log('\n📦 检查项目...');
  
  if (!fs.existsSync('package.json')) {
    console.error('❌ 未找到 package.json');
    process.exit(1);
  }
  console.log('✅ package.json 存在');

  // 3. 备份
  console.log('\n💾 创建备份...');
  
  const backupDir = `.migration-backup-${Date.now()}`;
  fs.mkdirSync(backupDir);
  
  if (fs.existsSync('package-lock.json')) {
    fs.copyFileSync('package-lock.json', `${backupDir}/package-lock.json`);
    console.log('✅ 备份 package-lock.json');
  }
  
  if (fs.existsSync('node_modules')) {
    console.log('📁 node_modules 已存在（不备份）');
  }

  // 4. 清理
  console.log('\n🧹 清理旧文件...');
  
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✅ 删除 package-lock.json');
  }
  
  const clean = await ask('是否删除 node_modules? (y/n): ');
  if (clean.toLowerCase() === 'y') {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('✅ 删除 node_modules');
  }

  // 5. 安装依赖
  console.log('\n📥 使用 Yarn 安装依赖...');
  
  try {
    execSync('yarn install', { stdio: 'inherit' });
    console.log('✅ 依赖安装成功');
  } catch (error) {
    console.error('❌ 安装失败');
    console.log(`备份位置: ${backupDir}`);
    process.exit(1);
  }

  // 6. 验证
  console.log('\n🔍 验证安装...');
  
  try {
    execSync('yarn list --depth=0', { stdio: 'pipe' });
    console.log('✅ 依赖树正常');
  } catch (error) {
    console.warn('⚠️ 依赖树可能有问题');
  }

  // 7. 更新配置文件
  console.log('\n⚙️ 更新配置文件...');
  
  // 更新 .gitignore
  let gitignore = '';
  if (fs.existsSync('.gitignore')) {
    gitignore = fs.readFileSync('.gitignore', 'utf8');
  }
  
  if (!gitignore.includes('yarn-error.log')) {
    gitignore += '\n# Yarn\nyarn-error.log\n';
    fs.writeFileSync('.gitignore', gitignore);
    console.log('✅ 更新 .gitignore');
  }

  // 8. 生成迁移报告
  console.log('\n📊 生成迁移报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    yarnVersion: execSync('yarn --version').toString().trim(),
    nodeVersion: process.version,
    backup: backupDir,
    status: 'success'
  };
  
  fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
  console.log('✅ 报告已保存到 migration-report.json');

  // 9. 下一步
  console.log('\n✨ 迁移完成！\n');
  console.log('📝 下一步操作：');
  console.log('1. 运行测试：yarn test');
  console.log('2. 运行构建：yarn build');
  console.log('3. 提交 yarn.lock：git add yarn.lock && git commit');
  console.log('4. 更新 CI/CD 配置');
  console.log(`5. 如需回滚，备份在：${backupDir}\n`);

  rl.close();
}

main().catch(error => {
  console.error('❌ 迁移失败：', error);
  process.exit(1);
});
```

**使用方式：**

```bash
# 1. 保存脚本
chmod +x migrate-to-yarn.js

# 2. 运行
node migrate-to-yarn.js

# 3. 按提示操作
```

### 📖 解析

**脚本功能：**
1. ✅ 环境检查
2. ✅ 自动备份
3. ✅ 清理旧文件
4. ✅ 安装依赖
5. ✅ 验证结果
6. ✅ 更新配置
7. ✅ 生成报告
8. ✅ 回滚支持

**安全特性：**
- 交互式确认
- 自动备份
- 错误处理
- 详细日志

</details>

---

**导航**  
[上一章：第 19 章面试题](./chapter-19.md) | [返回目录](../README.md) | [下一章：第 21 章面试题](./chapter-21.md)
