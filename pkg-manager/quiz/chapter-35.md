# 第 35 章：故障排查与调试 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 依赖问题

### 题目

遇到 "Cannot find module" 错误时，首先应该做什么？

**选项：**
- A. 删除项目
- B. 检查是否安装了依赖
- C. 重装系统
- D. 换一个包管理器

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**"Cannot find module" 排查步骤**

#### 1. 检查依赖是否安装

```bash
# 查看依赖
npm list <package>

# 没有？安装
npm install <package>
```

#### 2. 检查 node_modules

```bash
ls node_modules/<package>

# 不存在？重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 3. 检查导入路径

```javascript
// ❌ 错误
import util from 'utils';  // 包名错误

// ✅ 正确
import util from './utils';  // 本地文件
import util from 'my-utils';  // npm 包
```

#### 4. 检查 package.json

```json
{
  "dependencies": {
    "my-utils": "^1.0.0"  // 确认已声明
  }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 版本冲突

### 题目

peer dependencies 冲突可以通过 --legacy-peer-deps 解决。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**peer dependencies 冲突处理**

#### 问题

```bash
npm install

# 错误：
# ERESOLVE unable to resolve dependency tree
# peer react@"^18.0.0" from some-package
# but you have react@"^17.0.0"
```

#### 解决方案 1：--legacy-peer-deps

```bash
npm install --legacy-peer-deps
```

**忽略 peer dependencies 检查（npm 6 行为）**

#### 解决方案 2：--force

```bash
npm install --force
```

**强制安装（可能有风险）**

#### 解决方案 3：升级依赖

```bash
# 升级到兼容版本
npm install react@^18.0.0
```

#### .npmrc 配置

```ini
legacy-peer-deps=true
```

**永久启用**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 缓存问题

### 题目

npm 安装出现问题时，如何清理缓存？

**选项：**
- A. npm clean
- B. npm cache clean
- C. npm cache clean --force
- D. npm clear

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm 缓存清理**

#### 清理缓存

```bash
npm cache clean --force
```

**需要 --force 强制清理**

#### 验证缓存

```bash
npm cache verify
```

**检查缓存完整性**

#### 缓存位置

```bash
npm config get cache

# 输出：~/.npm
```

#### 完整清理

```bash
# 1. 清理缓存
npm cache clean --force

# 2. 删除 node_modules
rm -rf node_modules

# 3. 删除 lock 文件
rm package-lock.json

# 4. 重新安装
npm install
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 常见错误

### 题目

npm install 失败的常见原因有哪些？

**选项：**
- A. 网络问题
- B. 权限问题
- C. 版本冲突
- D. 磁盘空间不足

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**npm install 故障排查**

#### A. 网络问题 ✅

**症状：**
```bash
npm ERR! network timeout
npm ERR! network socket hang up
```

**解决：**
```bash
# 使用镜像源
npm config set registry https://registry.npmmirror.com

# 增加超时
npm config set timeout 60000
```

#### B. 权限问题 ✅

**症状：**
```bash
npm ERR! EACCES: permission denied
```

**解决：**
```bash
# 不要用 sudo
# 修改 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 或使用 nvm
```

#### C. 版本冲突 ✅

**症状：**
```bash
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决：**
```bash
npm install --legacy-peer-deps
# 或更新依赖版本
```

#### D. 磁盘空间不足 ✅

**症状：**
```bash
npm ERR! ENOSPC: no space left on device
```

**解决：**
```bash
# 清理空间
npm cache clean --force
rm -rf node_modules

# 检查磁盘
df -h
```

#### 完整诊断脚本

```bash
#!/bin/bash
# diagnose-npm.sh

echo "🔍 npm 安装诊断"
echo

# 1. 检查 Node 和 npm 版本
echo "Node 版本: $(node -v)"
echo "npm 版本: $(npm -v)"
echo

# 2. 检查网络
echo "检查网络..."
if curl -I https://registry.npmjs.org > /dev/null 2>&1; then
  echo "✓ 网络正常"
else
  echo "✗ 网络异常"
fi
echo

# 3. 检查磁盘空间
echo "磁盘空间:"
df -h | grep -E "^/dev"
echo

# 4. 检查缓存
echo "缓存位置: $(npm config get cache)"
echo

# 5. 验证缓存
echo "验证缓存..."
npm cache verify
echo

# 6. 检查权限
echo "全局目录: $(npm config get prefix)"
echo

echo "✅ 诊断完成"
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 依赖分析

### 题目

如何查找包的依赖链？

<details>
<summary>查看答案</summary>

### ✅ 答案

**依赖链查询**

#### npm why

```bash
npm why lodash

# 输出：
# lodash@4.17.21
# node_modules/lodash
#   lodash@"^4.17.21" from the root project
#   lodash@"^4.17.21" from webpack@5.0.0
#   node_modules/webpack
```

#### npm ls

```bash
# 查看依赖树
npm ls lodash

# 输出：
# my-app@1.0.0
# ├─┬ webpack@5.0.0
# │ └── lodash@4.17.21
# └── lodash@4.17.21
```

#### pnpm why

```bash
pnpm why lodash

# 更详细的依赖链
```

#### 自定义脚本

```javascript
// scripts/find-dependency-chain.js
const fs = require('fs');

function findDependencyChain(target, lockfile) {
  const chains = [];
  
  function traverse(pkg, path = []) {
    path.push(pkg);
    
    if (pkg === target) {
      chains.push([...path]);
      return;
    }
    
    const deps = lockfile.packages?.[pkg]?.dependencies || {};
    
    Object.keys(deps).forEach(dep => {
      if (!path.includes(dep)) {
        traverse(dep, [...path]);
      }
    });
  }
  
  // 从根开始遍历
  const rootDeps = lockfile.dependencies || {};
  Object.keys(rootDeps).forEach(dep => {
    traverse(dep, []);
  });
  
  return chains;
}

// 使用
const lockfile = JSON.parse(
  fs.readFileSync('package-lock.json', 'utf8')
);

const chains = findDependencyChain('lodash', lockfile);

console.log('依赖链:');
chains.forEach(chain => {
  console.log(chain.join(' → '));
});
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** lock文件

### 题目

package-lock.json 损坏时应该如何处理？

**选项：**
- A. 手动修复
- B. 删除后重新生成
- C. 从 Git 恢复
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**lock 文件修复**

#### 方案 B：重新生成 ✅

```bash
# 1. 删除损坏的文件
rm package-lock.json

# 2. 清理 node_modules
rm -rf node_modules

# 3. 重新安装
npm install
```

#### 方案 C：Git 恢复 ✅

```bash
# 恢复到上次提交
git checkout package-lock.json

# 或恢复到特定版本
git checkout <commit> package-lock.json

# 重新安装
npm ci
```

#### 验证 lock 文件

```bash
# npm 审计
npm audit

# 检查一致性
npm ls
```

#### 预防措施

```yaml
# .github/workflows/ci.yml
- name: Validate lockfile
  run: |
    npm install --package-lock-only
    git diff --exit-code package-lock.json
```

**确保 lock 文件是最新的**

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 调试技巧

### 题目

如何调试 npm scripts？

<details>
<summary>查看答案</summary>

### ✅ 答案

**npm scripts 调试**

#### 查看实际命令

```bash
npm run build --dry-run

# 显示将要执行的命令
# 但不实际执行
```

#### 详细日志

```bash
npm run build --loglevel verbose

# 或
npm run build --verbose
```

#### 调试模式

```bash
npm run build --dd

# 或
npm run build --loglevel silly
```

#### 查看脚本

```bash
npm run

# 列出所有 scripts

npm run-script build --dry-run
# 显示 build 命令
```

#### 使用环境变量

```json
{
  "scripts": {
    "build": "NODE_ENV=production webpack",
    "build:debug": "NODE_ENV=development webpack --mode development"
  }
}
```

#### 脚本钩子调试

```json
{
  "scripts": {
    "prebuild": "echo 'Running prebuild'",
    "build": "echo 'Running build'",
    "postbuild": "echo 'Running postbuild'"
  }
}
```

```bash
npm run build --verbose

# 输出：
# > prebuild
# Running prebuild
# > build
# Running build
# > postbuild
# Running postbuild
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 复杂问题

### 题目

如何排查 Monorepo 中的依赖问题？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Monorepo 依赖问题排查**

#### 1. 检查 workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**确保包路径正确**

#### 2. 验证包链接

```bash
# 检查是否正确链接
pnpm list --depth=0

# 查看特定包
pnpm list @myorg/ui
```

#### 3. 检查幽灵依赖

```bash
# 严格模式检查
pnpm install --strict-peer-dependencies

# 找出未声明的依赖
```

#### 4. 版本冲突检测

```bash
# 查找重复依赖
pnpm list <package>

# 输出：
# @myorg/app
# └── lodash@4.17.20
# @myorg/ui
# └── lodash@4.17.21  ← 版本冲突
```

**解决：**
```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
```

#### 5. 循环依赖检测

```bash
npx madge --circular packages/

# 或
pnpm -r exec madge --circular src/
```

#### 6. 类型问题

```bash
# TypeScript 项目引用
pnpm -r run type-check

# 检查类型错误
```

#### 完整诊断工具

```javascript
// scripts/diagnose-monorepo.js
const { execSync } = require('child_process');
const fs = require('fs');

class MonorepoDiagnostics {
  async run() {
    console.log('🔍 Monorepo 诊断\n');

    // 1. Workspace 配置
    this.checkWorkspace();

    // 2. 包链接
    this.checkLinks();

    // 3. 重复依赖
    this.checkDuplicates();

    // 4. 循环依赖
    this.checkCircular();

    // 5. 类型检查
    this.checkTypes();

    console.log('\n✅ 诊断完成');
  }

  checkWorkspace() {
    console.log('📦 检查 Workspace 配置...');

    const configFile = 'pnpm-workspace.yaml';
    if (!fs.existsSync(configFile)) {
      console.log('  ✗ 缺少 pnpm-workspace.yaml');
      return;
    }

    console.log('  ✓ 配置文件存在');
  }

  checkLinks() {
    console.log('\n🔗 检查包链接...');

    try {
      const output = execSync('pnpm list --depth=0 --json', {
        encoding: 'utf8'
      });

      const packages = JSON.parse(output);
      console.log(`  ✓ 发现 ${Object.keys(packages.dependencies || {}).length} 个包`);
    } catch (e) {
      console.log('  ✗ 链接检查失败');
    }
  }

  checkDuplicates() {
    console.log('\n🔄 检查重复依赖...');

    try {
      const output = execSync('pnpm list --depth=Infinity --json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // 分析重复
      const versions = {};
      // ... 解析 JSON 并统计版本

      console.log('  ✓ 重复检查完成');
    } catch (e) {
      console.log('  ⚠️  检查失败');
    }
  }

  checkCircular() {
    console.log('\n⚠️  检查循环依赖...');

    try {
      execSync('npx madge --circular --json packages/', {
        stdio: 'pipe'
      });

      console.log('  ✓ 无循环依赖');
    } catch (e) {
      console.log('  ✗ 发现循环依赖');
    }
  }

  checkTypes() {
    console.log('\n🔷 检查类型...');

    try {
      execSync('pnpm -r run type-check', {
        stdio: 'pipe'
      });

      console.log('  ✓ 类型检查通过');
    } catch (e) {
      console.log('  ✗ 类型错误');
    }
  }
}

new MonorepoDiagnostics().run();
```

### 📖 解析

**常见问题**

1. ✅ 幽灵依赖
2. ✅ 版本冲突
3. ✅ 循环依赖
4. ✅ 类型错误
5. ✅ 链接问题

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 生产问题

### 题目

生产环境依赖安装失败，如何快速恢复？

<details>
<summary>查看答案</summary>

### ✅ 答案

**生产环境紧急修复**

#### 场景

```bash
# 生产部署失败
npm install --production

# Error: Cannot resolve dependency
```

#### 应急方案 1：使用缓存

```bash
# 从备份恢复 node_modules
aws s3 cp s3://backup/node_modules.tar.gz .
tar -xzf node_modules.tar.gz

# 或使用 Docker 镜像
docker pull my-app:last-known-good
```

#### 应急方案 2：锁定版本

```bash
# 使用上次成功的 lock 文件
git checkout HEAD~1 package-lock.json

# 安装
npm ci --production
```

#### 应急方案 3：跳过问题依赖

```bash
# 暂时移除问题依赖
npm uninstall problematic-package

# 安装其他依赖
npm install --production

# 手动处理问题依赖
```

#### 防御性部署

**1. 预构建镜像：**
```dockerfile
# 多阶段构建
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY . .
```

**2. 依赖缓存：**
```yaml
# CI 缓存
- uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ hashFiles('package-lock.json') }}
```

**3. 回滚机制：**
```bash
# 保留上次成功的部署
cp -r node_modules node_modules.backup

# 失败时回滚
if [ $? -ne 0 ]; then
  mv node_modules.backup node_modules
fi
```

#### 完整应急脚本

```bash
#!/bin/bash
# emergency-deploy.sh

set -e

echo "🚨 应急部署"

# 1. 尝试正常安装
echo "尝试正常安装..."
if npm ci --production; then
  echo "✅ 安装成功"
  exit 0
fi

# 2. 使用缓存
echo "尝试使用缓存..."
if [ -f "node_modules.tar.gz" ]; then
  tar -xzf node_modules.tar.gz
  echo "✅ 从缓存恢复"
  exit 0
fi

# 3. 使用上次的 lock 文件
echo "尝试上次的 lock 文件..."
git checkout HEAD~1 package-lock.json
if npm ci --production; then
  echo "✅ 使用旧版本成功"
  exit 0
fi

# 4. 失败
echo "❌ 所有方案都失败"
exit 1
```

### 📖 解析

**应急原则**

1. ✅ 快速恢复服务
2. ✅ 使用已知可用版本
3. ✅ 保留现场日志
4. ✅ 事后分析根因

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 故障工具

### 题目

实现一个依赖问题诊断工具。

<details>
<summary>查看答案</summary>

### ✅ 答案

**依赖诊断工具**

```javascript
#!/usr/bin/env node
// scripts/dependency-doctor.js

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

class DependencyDoctor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
  }

  // 运行诊断
  async diagnose() {
    console.log('🏥 依赖健康检查\n');

    await this.checkEnvironment();
    await this.checkPackageJson();
    await this.checkLockFile();
    await this.checkNodeModules();
    await this.checkDependencies();
    await this.checkSecurity();

    this.generateReport();
  }

  // 检查环境
  async checkEnvironment() {
    console.log('🔍 检查环境...');

    try {
      const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim();
      const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();

      console.log(`  Node: ${nodeVersion}`);
      console.log(`  npm: ${npmVersion}`);

      // 检查版本兼容性
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.engines) {
        // 验证版本
      }
    } catch (e) {
      this.issues.push({
        type: 'environment',
        message: '环境检查失败',
        error: e.message
      });
    }
  }

  // 检查 package.json
  async checkPackageJson() {
    console.log('\n📦 检查 package.json...');

    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // 检查必需字段
      if (!pkg.name) {
        this.issues.push({ type: 'pkg', message: '缺少 name 字段' });
      }

      if (!pkg.version) {
        this.issues.push({ type: 'pkg', message: '缺少 version 字段' });
      }

      // 检查依赖定义
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        // 检查版本格式
        if (version === '*' || version === 'latest') {
          this.warnings.push({
            type: 'version',
            message: `${name} 使用不安全的版本: ${version}`
          });
        }

        // 检查重复
        if (pkg.dependencies?.[name] && pkg.devDependencies?.[name]) {
          this.issues.push({
            type: 'duplicate',
            message: `${name} 同时在 dependencies 和 devDependencies`
          });
        }
      });

      console.log('  ✓ package.json 检查完成');
    } catch (e) {
      this.issues.push({
        type: 'pkg',
        message: 'package.json 无效',
        error: e.message
      });
    }
  }

  // 检查 lock 文件
  async checkLockFile() {
    console.log('\n🔒 检查 lock 文件...');

    const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    const existing = lockFiles.filter(f => fs.existsSync(f));

    if (existing.length === 0) {
      this.warnings.push({
        type: 'lock',
        message: '缺少 lock 文件'
      });
    } else if (existing.length > 1) {
      this.warnings.push({
        type: 'lock',
        message: `发现多个 lock 文件: ${existing.join(', ')}`
      });
    } else {
      console.log(`  ✓ 使用 ${existing[0]}`);

      // 验证 lock 文件
      try {
        const lockContent = fs.readFileSync(existing[0], 'utf8');
        JSON.parse(lockContent);  // 验证格式
      } catch (e) {
        this.issues.push({
          type: 'lock',
          message: `${existing[0]} 格式错误`
        });
      }
    }
  }

  // 检查 node_modules
  async checkNodeModules() {
    console.log('\n📁 检查 node_modules...');

    if (!fs.existsSync('node_modules')) {
      this.warnings.push({
        type: 'modules',
        message: 'node_modules 不存在'
      });
      return;
    }

    try {
      // 检查是否有未安装的依赖
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      const missing = [];
      Object.keys(deps).forEach(dep => {
        if (!fs.existsSync(path.join('node_modules', dep))) {
          missing.push(dep);
        }
      });

      if (missing.length > 0) {
        this.issues.push({
          type: 'modules',
          message: `缺少依赖: ${missing.join(', ')}`
        });
        this.suggestions.push('运行 npm install');
      } else {
        console.log('  ✓ 所有依赖已安装');
      }
    } catch (e) {
      this.issues.push({
        type: 'modules',
        message: '检查失败',
        error: e.message
      });
    }
  }

  // 检查依赖关系
  async checkDependencies() {
    console.log('\n🔗 检查依赖关系...');

    try {
      // 检查重复依赖
      const output = execSync('npm ls --json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const tree = JSON.parse(output);
      const versions = this.collectVersions(tree);

      // 找出多版本依赖
      Object.entries(versions).forEach(([name, vers]) => {
        if (vers.size > 1) {
          this.warnings.push({
            type: 'duplicate',
            message: `${name} 有多个版本: ${Array.from(vers).join(', ')}`
          });
        }
      });
    } catch (e) {
      // npm ls 可能返回非零
    }
  }

  collectVersions(node, versions = {}) {
    if (node.dependencies) {
      Object.entries(node.dependencies).forEach(([name, info]) => {
        if (!versions[name]) {
          versions[name] = new Set();
        }
        versions[name].add(info.version);

        this.collectVersions(info, versions);
      });
    }
    return versions;
  }

  // 检查安全性
  async checkSecurity() {
    console.log('\n🔐 检查安全性...');

    try {
      execSync('npm audit --json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('  ✓ 无安全问题');
    } catch (e) {
      const output = e.stdout || '';
      if (output) {
        try {
          const audit = JSON.parse(output);
          const vulns = audit.metadata?.vulnerabilities || {};
          const total = Object.values(vulns).reduce((sum, n) => sum + n, 0);

          if (total > 0) {
            this.warnings.push({
              type: 'security',
              message: `发现 ${total} 个安全漏洞`
            });
            this.suggestions.push('运行 npm audit fix');
          }
        } catch {}
      }
    }
  }

  // 生成报告
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 诊断报告');
    console.log('='.repeat(60));

    // 问题
    if (this.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      this.issues.forEach(issue => {
        console.log(`  [${issue.type}] ${issue.message}`);
        if (issue.error) {
          console.log(`       ${issue.error}`);
        }
      });
    } else {
      console.log('\n✅ 未发现严重问题');
    }

    // 警告
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach(warn => {
        console.log(`  [${warn.type}] ${warn.message}`);
      });
    }

    // 建议
    if (this.suggestions.length > 0) {
      console.log('\n💡 建议:');
      this.suggestions.forEach((sug, i) => {
        console.log(`  ${i + 1}. ${sug}`);
      });
    }

    console.log('\n');

    // 返回状态码
    return this.issues.length > 0 ? 1 : 0;
  }
}

// 运行
const doctor = new DependencyDoctor();
doctor.diagnose()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('❌ 诊断失败:', err);
    process.exit(1);
  });
```

**使用：**
```bash
node scripts/dependency-doctor.js
```

**CI 集成：**
```yaml
- name: Dependency Health Check
  run: node scripts/dependency-doctor.js
```

### 📖 解析

**诊断项目**

1. ✅ 环境检查
2. ✅ package.json 验证
3. ✅ lock 文件检查
4. ✅ node_modules 完整性
5. ✅ 依赖冲突
6. ✅ 安全漏洞

**全面诊断！**

</details>

---

**导航**  
[上一章：第 34 章面试题](./chapter-34.md) | [返回目录](../README.md) | [下一章：第 36 章面试题](./chapter-36.md)
