# 第 24 章：pnpm 高级特性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** overrides基础

### 题目

pnpm 的 overrides 字段用于什么？

**选项：**
- A. 覆盖脚本
- B. 强制使用特定版本的依赖
- C. 覆盖配置
- D. 重写代码

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm overrides**

#### 基本用法

**package.json：**
```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
```

**强制所有包使用指定版本**

#### 应用场景

**1. 修复安全漏洞：**
```json
{
  "pnpm": {
    "overrides": {
      "minimist": "^1.2.6"  // 修复漏洞版本
    }
  }
}
```

**2. 统一版本：**
```json
{
  "pnpm": {
    "overrides": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
}
```

#### 高级用法

**只覆盖特定包的依赖：**
```json
{
  "pnpm": {
    "overrides": {
      "pkg-a>lodash": "4.17.21",  // 只覆盖 pkg-a 的 lodash
      "pkg-b>lodash": "3.10.1"    // pkg-b 仍用旧版本
    }
  }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** peerDependencyRules

### 题目

pnpm 可以配置忽略缺失的 peerDependencies 警告。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**peerDependencyRules 配置**

#### 忽略缺失

**package.json：**
```json
{
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["react", "react-dom"]
    }
  }
}
```

**不再警告缺失的 react 和 react-dom**

#### 其他规则

**允许特定版本：**
```json
{
  "pnpm": {
    "peerDependencyRules": {
      "allowedVersions": {
        "react": "17",
        "eslint": "7"
      }
    }
  }
}
```

**允许任意版本：**
```json
{
  "pnpm": {
    "peerDependencyRules": {
      "allowAny": ["@babel/*"]
    }
  }
}
```

#### .npmrc 配置

```ini
# 全局忽略
auto-install-peers=false
strict-peer-dependencies=false
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** patch补丁

### 题目

pnpm 如何为第三方包打补丁？

**选项：**
- A. 直接修改 node_modules
- B. 使用 pnpm patch
- C. fork 仓库
- D. 提 PR 等待合并

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm patch 命令**

#### 创建补丁

```bash
# 1. 编辑包
pnpm patch lodash@4.17.21

# 输出临时目录
# 编辑 /tmp/xxx/lodash/index.js

# 2. 修改文件
cd /tmp/xxx/lodash
vim index.js

# 3. 生成补丁
pnpm patch-commit /tmp/xxx/lodash
```

**自动生成补丁文件**

#### 补丁文件

**patches/lodash@4.17.21.patch：**
```diff
diff --git a/index.js b/index.js
index 1234567..abcdefg 100644
--- a/index.js
+++ b/index.js
@@ -1,3 +1,4 @@
+// My custom change
 module.exports = {
   // ...
 };
```

#### package.json 记录

```json
{
  "pnpm": {
    "patchedDependencies": {
      "lodash@4.17.21": "patches/lodash@4.17.21.patch"
    }
  }
}
```

**下次安装自动应用补丁**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 钩子脚本

### 题目

pnpm 支持哪些 hooks？

**选项：**
- A. readPackage
- B. afterAllResolved
- C. preInstall
- D. A 和 B 都支持

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**pnpm hooks**

#### readPackage Hook

**.pnpmfile.cjs：**
```javascript
module.exports = {
  hooks: {
    readPackage(pkg, context) {
      // 修改依赖
      if (pkg.name === 'some-package') {
        pkg.dependencies = {
          ...pkg.dependencies,
          lodash: '4.17.21'
        };
      }
      
      return pkg;
    }
  }
};
```

**在读取 package.json 时修改**

#### afterAllResolved Hook

```javascript
module.exports = {
  hooks: {
    afterAllResolved(lockfile, context) {
      // lockfile 已生成
      console.log('所有依赖已解析');
      return lockfile;
    }
  }
};
```

#### 实际应用

**1. 强制版本：**
```javascript
module.exports = {
  hooks: {
    readPackage(pkg) {
      // 统一 React 版本
      if (pkg.dependencies?.react) {
        pkg.dependencies.react = '^18.2.0';
      }
      if (pkg.peerDependencies?.react) {
        pkg.peerDependencies.react = '^18.2.0';
      }
      return pkg;
    }
  }
};
```

**2. 添加依赖：**
```javascript
module.exports = {
  hooks: {
    readPackage(pkg) {
      // 为所有包添加 polyfill
      if (pkg.name !== 'my-app') {
        pkg.dependencies = {
          ...pkg.dependencies,
          'core-js': '^3.0.0'
        };
      }
      return pkg;
    }
  }
};
```

**3. 移除依赖：**
```javascript
module.exports = {
  hooks: {
    readPackage(pkg) {
      // 移除问题依赖
      delete pkg.dependencies?.['problematic-package'];
      return pkg;
    }
  }
};
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 执行环境

### 题目

pnpm exec 和 pnpm dlx 的区别是什么？

**选项：**
- A. 完全相同
- B. exec 使用本地，dlx 临时下载
- C. exec 更快
- D. 没有 dlx 命令

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm exec vs pnpm dlx**

#### pnpm exec

```bash
# 执行本地安装的命令
pnpm exec eslint .

# 等价于
./node_modules/.bin/eslint .
```

**使用项目已安装的包**

#### pnpm dlx（download + execute）

```bash
# 临时下载并执行
pnpm dlx create-react-app my-app

# 1. 下载到临时目录
# 2. 执行
# 3. 清理
```

**类似 npx，但更快**

#### 对比

| 命令 | 用途 | 安装 | 速度 |
|------|------|------|------|
| **exec** | 执行本地包 | 需要 | ⚡⚡⚡ |
| **dlx** | 临时执行 | 临时 | ⚡⚡ |

#### 使用场景

**exec：**
```bash
# 项目脚本
pnpm exec jest
pnpm exec webpack
```

**dlx：**
```bash
# 一次性命令
pnpm dlx create-next-app
pnpm dlx typescript --init
```

#### 与 npx 对比

```bash
# npx
npx create-react-app my-app

# pnpm dlx（更快）
pnpm dlx create-react-app my-app

# 使用 store，避免重复下载
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** public-hoist-pattern

### 题目

public-hoist-pattern 的作用是什么？

**选项：**
- A. 公开发布包
- B. 提升特定包到根 node_modules
- C. 配置公共依赖
- D. 设置访问权限

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**public-hoist-pattern 配置**

#### 基本用法

**.npmrc：**
```ini
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
```

**提升匹配的包到根 node_modules**

#### 为什么需要？

**问题：pnpm 默认不提升**
```
node_modules/
└── .pnpm/
    └── eslint@8.0.0/
```

```bash
# IDE/工具可能找不到
eslint .  # ❌ 找不到
```

**提升后：**
```
node_modules/
├── eslint/  ← 提升
└── .pnpm/
```

```bash
eslint .  # ✅ 成功
```

#### 使用场景

**1. 开发工具：**
```ini
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*typescript*
```

**2. 类型定义：**
```ini
public-hoist-pattern[]=@types/*
```

**3. 编辑器插件：**
```ini
public-hoist-pattern[]=*vscode*
public-hoist-pattern[]=*jetbrains*
```

#### 对比 shamefully-hoist

```ini
# shamefully-hoist（提升所有）
shamefully-hoist=true  # ❌ 失去严格性

# public-hoist-pattern（只提升特定）
public-hoist-pattern[]=*eslint*  # ✅ 保持严格性
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** link-workspace-packages

### 题目

link-workspace-packages 配置的作用是什么？

**选项：**
- A. 自动链接 workspace 包
- B. 配置链接方式
- C. 控制是否使用 workspace 协议
- D. 设置链接深度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**link-workspace-packages 配置**

#### 默认行为（true）

**.npmrc：**
```ini
link-workspace-packages=true  # 默认
```

**自动链接本地 workspace 包：**
```json
// packages/app/package.json
{
  "dependencies": {
    "@myorg/ui": "^1.0.0"
  }
}
```

```bash
pnpm install

# 自动链接本地 @myorg/ui
# 而不是从 registry 下载
```

#### false - 不自动链接

```ini
link-workspace-packages=false
```

```bash
pnpm install

# 即使本地有 @myorg/ui
# 仍从 registry 下载
# 除非使用 workspace: 协议
```

#### deep - 深度链接

```ini
link-workspace-packages=deep
```

**链接依赖的依赖：**
```
app → ui → utils

# deep: 链接 ui 和 utils
# true: 只链接 ui
```

#### 使用建议

```ini
# 开发环境（推荐）
link-workspace-packages=true

# 测试生产版本
link-workspace-packages=false

# Monorepo 开发
link-workspace-packages=deep
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** node-linker

### 题目

pnpm 的 node-linker 有哪些选项？各有什么特点？

<details>
<summary>查看答案</summary>

### ✅ 答案

**node-linker 配置**

#### isolated（默认）

**.npmrc：**
```ini
node-linker=isolated
```

**特点：**
```
node_modules/
├── .pnpm/
│   └── pkg@1.0.0/
│       └── node_modules/
│           └── pkg/  ← 硬链接
└── pkg → .pnpm/pkg@1.0.0/node_modules/pkg
```

- ✅ 严格依赖
- ✅ 消除幽灵依赖
- ✅ 节省空间
- ⚠️ 某些工具可能不兼容

#### hoisted

```ini
node-linker=hoisted
```

**特点：**
```
node_modules/
├── pkg/  ← 提升
├── dep1/
└── dep2/
```

- ✅ 兼容性好
- ❌ 可能有幽灵依赖
- ❌ 占用更多空间

#### pnp（实验性）

```ini
node-linker=pnp
```

**特点：**
```
.pnp.cjs  # 类似 Yarn PnP
.pnp/
```

- ✅ 最快
- ✅ 最省空间
- ❌ 兼容性问题
- ⚠️ 实验性功能

### 📖 解析

**选择建议**

| 场景 | 推荐 | 原因 |
|------|------|------|
| **新项目** | isolated | 严格，现代 |
| **迁移** | hoisted | 兼容性 |
| **实验** | pnp | 极致性能 |

**配置示例：**

**严格模式：**
```ini
node-linker=isolated
shamefully-hoist=false
```

**兼容模式：**
```ini
node-linker=hoisted
shamefully-hoist=true
```

**混合模式：**
```ini
node-linker=isolated
public-hoist-pattern[]=*eslint*
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 自定义协议

### 题目

如何在 pnpm 中使用自定义协议？

<details>
<summary>查看答案</summary>

### ✅ 答案

**pnpm 自定义协议**

#### Git 协议

**package.json：**
```json
{
  "dependencies": {
    "my-package": "git+https://github.com/user/repo.git#branch"
  }
}
```

**或指定 commit：**
```json
{
  "dependencies": {
    "my-package": "git+https://github.com/user/repo.git#abc1234"
  }
}
```

#### File 协议

```json
{
  "dependencies": {
    "local-package": "file:../local-package"
  }
}
```

**或绝对路径：**
```json
{
  "dependencies": {
    "local-package": "file:/path/to/package"
  }
}
```

#### Link 协议

```json
{
  "dependencies": {
    "dev-package": "link:../dev-package"
  }
}
```

**创建符号链接，实时更新**

#### Workspace 协议

```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

#### 自定义解析器

**.pnpmfile.cjs：**
```javascript
module.exports = {
  hooks: {
    readPackage(pkg) {
      // 自定义协议处理
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
          const version = pkg.dependencies[dep];
          
          // custom: 协议
          if (version.startsWith('custom:')) {
            const realVersion = resolveCustomProtocol(version);
            pkg.dependencies[dep] = realVersion;
          }
        });
      }
      
      return pkg;
    }
  }
};

function resolveCustomProtocol(spec) {
  // custom:feature-x → git+...
  const feature = spec.replace('custom:', '');
  return `git+https://github.com/org/repo.git#${feature}`;
}
```

**使用：**
```json
{
  "dependencies": {
    "my-lib": "custom:feature-x"
  }
}
```

### 📖 解析

**协议对比**

| 协议 | 用途 | 示例 |
|------|------|------|
| **git** | Git 仓库 | `git+https://...` |
| **file** | 本地路径 | `file:../pkg` |
| **link** | 符号链接 | `link:../pkg` |
| **workspace** | Workspace | `workspace:*` |
| **http(s)** | tarball | `https://.../pkg.tgz` |

**最佳实践：**

**开发：**
```json
{
  "dependencies": {
    "utils": "workspace:*",      // 本地包
    "lib": "link:../lib"         // 开发中的包
  }
}
```

**生产：**
```json
{
  "dependencies": {
    "utils": "^1.0.0",           // npm 版本
    "lib": "^2.0.0"
  }
}
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 插件系统

### 题目

如何为 pnpm 开发插件？

<details>
<summary>查看答案</summary>

### ✅ 答案

**pnpm 插件开发**

#### 1. 基础插件

**.pnpmfile.cjs：**
```javascript
// pnpm 插件接口
module.exports = {
  hooks: {
    // 读取 package.json 时
    readPackage(pkg, context) {
      console.log(`Reading ${pkg.name}`);
      
      // 修改依赖
      if (pkg.dependencies) {
        // 自动修复常见问题
        if (pkg.dependencies.react && !pkg.dependencies['react-dom']) {
          pkg.dependencies['react-dom'] = pkg.dependencies.react;
        }
      }
      
      return pkg;
    },
    
    // 所有依赖解析后
    afterAllResolved(lockfile, context) {
      console.log('All dependencies resolved');
      return lockfile;
    }
  }
};
```

#### 2. 复杂插件

**plugins/security-checker.cjs：**
```javascript
// 安全检查插件
const knownVulnerabilities = {
  'lodash': ['4.17.20', '4.17.19'],
  'minimist': ['1.2.5']
};

module.exports = {
  hooks: {
    readPackage(pkg, context) {
      // 检查依赖安全性
      Object.entries(pkg.dependencies || {}).forEach(([name, version]) => {
        const vulnerable = knownVulnerabilities[name];
        
        if (vulnerable && vulnerable.some(v => version.includes(v))) {
          console.warn(`⚠️  ${pkg.name} uses vulnerable ${name}@${version}`);
          
          // 自动升级到安全版本
          pkg.dependencies[name] = getLatestSafeVersion(name);
        }
      });
      
      return pkg;
    }
  }
};

function getLatestSafeVersion(packageName) {
  // 查询最新安全版本
  switch (packageName) {
    case 'lodash':
      return '^4.17.21';
    case 'minimist':
      return '^1.2.6';
    default:
      return '*';
  }
}
```

#### 3. 依赖分析插件

**plugins/dependency-analyzer.cjs：**
```javascript
const fs = require('fs');

let stats = {
  packages: 0,
  totalSize: 0,
  warnings: []
};

module.exports = {
  hooks: {
    readPackage(pkg, context) {
      stats.packages++;
      
      // 检查大包
      if (pkg.name === 'moment') {
        stats.warnings.push(`Consider using day.js instead of moment`);
      }
      
      // 检查重复依赖
      const deps = Object.keys(pkg.dependencies || {});
      const devDeps = Object.keys(pkg.devDependencies || {});
      const duplicates = deps.filter(d => devDeps.includes(d));
      
      if (duplicates.length > 0) {
        stats.warnings.push(
          `${pkg.name} has duplicates: ${duplicates.join(', ')}`
        );
      }
      
      return pkg;
    },
    
    afterAllResolved(lockfile, context) {
      // 生成报告
      const report = {
        timestamp: new Date().toISOString(),
        packages: stats.packages,
        warnings: stats.warnings
      };
      
      fs.writeFileSync(
        'dependency-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log(`\n📊 Dependency Report:`);
      console.log(`   Packages: ${stats.packages}`);
      console.log(`   Warnings: ${stats.warnings.length}`);
      
      if (stats.warnings.length > 0) {
        console.log(`\n⚠️  Warnings:`);
        stats.warnings.forEach(w => console.log(`   - ${w}`));
      }
      
      return lockfile;
    }
  }
};
```

#### 4. 使用插件

**.pnpmfile.cjs：**
```javascript
// 加载插件
const securityChecker = require('./plugins/security-checker.cjs');
const dependencyAnalyzer = require('./plugins/dependency-analyzer.cjs');

// 合并 hooks
module.exports = {
  hooks: {
    readPackage(pkg, context) {
      pkg = securityChecker.hooks.readPackage(pkg, context);
      pkg = dependencyAnalyzer.hooks.readPackage(pkg, context);
      return pkg;
    },
    
    afterAllResolved(lockfile, context) {
      lockfile = securityChecker.hooks.afterAllResolved?.(lockfile, context) || lockfile;
      lockfile = dependencyAnalyzer.hooks.afterAllResolved?.(lockfile, context) || lockfile;
      return lockfile;
    }
  }
};
```

### 📖 解析

**插件能力**

**可以做：**
- ✅ 修改依赖
- ✅ 添加/删除依赖
- ✅ 版本检查
- ✅ 安全审计
- ✅ 性能分析
- ✅ 自定义逻辑

**不能做：**
- ❌ 修改 pnpm 核心行为
- ❌ 拦截网络请求
- ❌ 修改文件系统

**最佳实践：**
1. 保持插件轻量
2. 避免副作用
3. 提供清晰日志
4. 处理错误
5. 文档化

</details>

---

**导航**  
[上一章：第 23 章面试题](./chapter-23.md) | [返回目录](../README.md) | [下一章：第 25 章面试题](./chapter-25.md)
