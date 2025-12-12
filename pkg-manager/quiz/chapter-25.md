# 第 25 章：pnpm 迁移与最佳实践 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 迁移基础

### 题目

从 npm 迁移到 pnpm 的第一步是什么？

**选项：**
- A. 删除 node_modules
- B. 安装 pnpm
- C. 删除 package-lock.json
- D. 修改 package.json

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm → pnpm 迁移步骤**

#### 1. 安装 pnpm

```bash
# 方法 1：npm 安装
npm install -g pnpm

# 方法 2：Corepack（推荐）
corepack enable
corepack prepare pnpm@latest --activate
```

#### 2. 清理旧文件

```bash
rm package-lock.json
rm -rf node_modules
```

#### 3. 导入依赖

```bash
# 从 package-lock.json 导入（可选）
pnpm import

# 或直接安装
pnpm install
```

#### 4. 验证

```bash
pnpm --version
pnpm list --depth=0
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** pnpm import

### 题目

pnpm import 可以从 package-lock.json 导入依赖。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**pnpm import 命令**

#### 基本用法

```bash
# 导入 npm lock 文件
pnpm import

# 读取 package-lock.json
# 生成 pnpm-lock.yaml
```

#### 支持的格式

```bash
# npm
pnpm import  # 从 package-lock.json

# Yarn
pnpm import  # 从 yarn.lock
```

**自动检测 lock 文件类型**

#### 导入后

```bash
ls
# package.json
# package-lock.json  ← 保留
# pnpm-lock.yaml     ← 新生成
# node_modules/
```

**可以删除旧的 lock 文件**

```bash
rm package-lock.json
# 或
rm yarn.lock
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 兼容性

### 题目

pnpm 和 npm 的 package.json 是否兼容？

**选项：**
- A. 完全兼容
- B. 需要修改
- C. 部分兼容
- D. 不兼容

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

**npm 和 pnpm 都能使用，无需修改**

#### pnpm 扩展字段（可选）

```json
{
  "name": "my-app",
  "dependencies": {...},
  
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    },
    "peerDependencyRules": {
      "ignoreMissing": ["react"]
    }
  }
}
```

**npm 会忽略 pnpm 字段**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 迁移挑战

### 题目

迁移到 pnpm 可能遇到哪些问题？

**选项：**
- A. 幽灵依赖暴露
- B. 工具不兼容
- C. 性能下降
- D. 磁盘空间不足

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B

### 📖 解析

**迁移常见问题**

#### A. 幽灵依赖暴露 ✅

**npm（宽松）：**
```javascript
// 未声明的依赖也能用
const lodash = require('lodash');  // ✅ 可能成功
```

**pnpm（严格）：**
```javascript
const lodash = require('lodash');  // ❌ Error
```

**解决：显式声明**
```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

#### B. 工具不兼容 ✅

**问题：**
```bash
# 某些工具依赖扁平 node_modules
tool-x  # ❌ 找不到包
```

**解决：**
```ini
# .npmrc
shamefully-hoist=true  # 临时方案

# 或
public-hoist-pattern[]=tool-x
```

#### C. 性能下降 ❌

**pnpm 更快：**
```bash
npm:  60s
pnpm: 20s ⚡⚡⚡
```

#### D. 磁盘空间不足 ❌

**pnpm 节省空间：**
```bash
npm:  5GB
pnpm: 500MB ⚡⚡⚡⚡⚡
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 迁移脚本

### 题目

如何编写 npm 到 pnpm 的迁移脚本？

<details>
<summary>查看答案</summary>

### ✅ 答案

**迁移自动化脚本**

```bash
#!/bin/bash
# migrate-to-pnpm.sh

echo "🔄 迁移到 pnpm"

# 1. 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装 pnpm..."
    npm install -g pnpm
fi

echo "✓ pnpm $(pnpm --version)"

# 2. 备份
echo "💾 创建备份..."
BACKUP_DIR=".migration-backup-$(date +%s)"
mkdir -p "$BACKUP_DIR"

if [ -f "package-lock.json" ]; then
    cp package-lock.json "$BACKUP_DIR/"
fi

if [ -d "node_modules" ]; then
    echo "⚠️  node_modules 已存在（不备份）"
fi

# 3. 清理
echo "🧹 清理旧文件..."
rm -f package-lock.json
rm -f yarn.lock

# 4. 导入依赖
echo "📥 导入依赖..."
if [ -f "$BACKUP_DIR/package-lock.json" ]; then
    cp "$BACKUP_DIR/package-lock.json" .
    pnpm import
    rm package-lock.json
else
    echo "⚠️  没有 lock 文件，直接安装"
fi

# 5. 安装
echo "📦 安装依赖..."
pnpm install

# 6. 验证
echo "🔍 验证安装..."
if pnpm list --depth=0 &> /dev/null; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖验证失败"
    exit 1
fi

# 7. 配置 .npmrc
if [ ! -f ".npmrc" ]; then
    echo "⚙️  创建 .npmrc..."
    cat > .npmrc << EOF
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=false
EOF
fi

# 8. 更新 .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "pnpm-lock.yaml" .gitignore; then
        echo "" >> .gitignore
        echo "# pnpm" >> .gitignore
        echo ".pnpm-debug.log" >> .gitignore
    fi
fi

# 9. 生成报告
echo "📊 生成迁移报告..."
cat > migration-report.md << EOF
# pnpm 迁移报告

- 时间：$(date)
- pnpm 版本：$(pnpm --version)
- Node 版本：$(node --version)
- 备份位置：$BACKUP_DIR

## 下一步

1. 运行测试：\`pnpm test\`
2. 运行构建：\`pnpm build\`
3. 提交 pnpm-lock.yaml：\`git add pnpm-lock.yaml && git commit\`
4. 更新 CI/CD 配置

## 回滚（如需）

\`\`\`bash
rm pnpm-lock.yaml
cp $BACKUP_DIR/package-lock.json .
rm -rf node_modules
npm install
\`\`\`
EOF

echo ""
echo "✨ 迁移完成！"
echo ""
echo "📝 查看报告：cat migration-report.md"
echo "🧪 运行测试：pnpm test"
echo ""
```

**使用：**
```bash
chmod +x migrate-to-pnpm.sh
./migrate-to-pnpm.sh
```

### 📖 解析

**脚本功能**

1. ✅ 检查环境
2. ✅ 自动备份
3. ✅ 清理旧文件
4. ✅ 导入依赖
5. ✅ 安装验证
6. ✅ 配置文件
7. ✅ 生成报告
8. ✅ 回滚方案

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** CI迁移

### 题目

如何在 CI/CD 中从 npm 切换到 pnpm？

**选项：**
- A. 只改 install 命令
- B. 需要缓存配置
- C. 需要安装 pnpm
- D. 以上都需要

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**CI/CD pnpm 配置**

#### GitHub Actions

**npm（之前）：**
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: 18
    cache: 'npm'

- run: npm ci
```

**pnpm（之后）：**
```yaml
# 1. 安装 pnpm
- uses: pnpm/action-setup@v2
  with:
    version: 8

# 2. 设置 Node.js + 缓存
- uses: actions/setup-node@v3
  with:
    node-version: 18
    cache: 'pnpm'

# 3. 安装依赖
- run: pnpm install --frozen-lockfile
```

#### 完整示例

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # pnpm 设置
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      # Node.js 设置
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'  # ✅ pnpm 缓存
      
      # 安装
      - run: pnpm install --frozen-lockfile
      
      # 任务
      - run: pnpm run build
      - run: pnpm test
```

#### GitLab CI

```yaml
image: node:18

cache:
  paths:
    - .pnpm-store/

before_script:
  - corepack enable
  - corepack prepare pnpm@latest --activate
  - pnpm config set store-dir .pnpm-store

test:
  script:
    - pnpm install --frozen-lockfile
    - pnpm run build
    - pnpm test
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 团队迁移

### 题目

如何确保团队统一使用 pnpm？

**选项：**
- A. 文档说明
- B. preinstall 脚本
- C. Corepack
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**强制使用 pnpm**

#### 方法 B：preinstall 脚本 ✅

**package.json：**
```json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

**效果：**
```bash
npm install
# ❌ Error: Use pnpm install

yarn install
# ❌ Error: Use pnpm install

pnpm install
# ✅ 成功
```

#### 方法 C：Corepack ✅

**package.json：**
```json
{
  "packageManager": "pnpm@8.6.0"
}
```

```bash
corepack enable

npm install
# ❌ Error: This project requires pnpm@8.6.0

pnpm install
# ✅ 自动使用 pnpm@8.6.0
```

#### 组合使用

```json
{
  "packageManager": "pnpm@8.6.0",
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  },
  "engines": {
    "pnpm": ">=8.0.0"
  }
}
```

**三重保护**

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 最佳实践

### 题目

总结 pnpm Monorepo 的最佳实践。

<details>
<summary>查看答案</summary>

### ✅ 答案

**pnpm Monorepo 最佳实践**

#### 1. 项目结构

```
my-monorepo/
├── .npmrc                  # pnpm 配置
├── pnpm-workspace.yaml     # workspace 配置
├── pnpm-lock.yaml          # lock 文件
├── package.json            # 根配置
├── packages/               # 库包
│   ├── ui/
│   ├── utils/
│   └── icons/
├── apps/                   # 应用
│   ├── web/
│   └── admin/
└── tools/                  # 工具
    └── scripts/
```

#### 2. 配置文件

**.npmrc：**
```ini
# 严格模式
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=false

# 公共提升（工具）
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*

# 性能
network-concurrency=16
fetch-retries=3
```

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'

# Catalog（pnpm 8.6+）
catalog:
  react: ^18.2.0
  typescript: ^5.0.0
```

#### 3. 根 package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@8.6.0",
  
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint",
    "dev": "pnpm -r --parallel run dev",
    "clean": "pnpm -r run clean",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    }
  }
}
```

#### 4. 包 package.json

```json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist"
  },
  
  "peerDependencies": {
    "react": "catalog:"
  },
  
  "devDependencies": {
    "react": "catalog:",
    "typescript": "catalog:",
    "tsup": "^7.0.0"
  }
}
```

#### 5. 版本管理

**使用 Changesets：**
```bash
# 开发完成
pnpm changeset

# 版本递增
pnpm changeset version

# 发布
pnpm release
```

#### 6. CI/CD

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - run: pnpm test
```

### 📖 解析

**关键原则**

1. **严格依赖** - 消除幽灵依赖
2. **workspace 协议** - 本地包引用
3. **catalog** - 统一版本管理
4. **Changesets** - 自动化发布
5. **类型安全** - TypeScript
6. **代码质量** - ESLint + Prettier
7. **测试覆盖** - 完整测试
8. **CI/CD** - 自动化流程

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 性能优化

### 题目

如何优化大型 pnpm Monorepo 的性能？

<details>
<summary>查看答案</summary>

### ✅ 答案

**大型 Monorepo 性能优化**

#### 1. 依赖优化

**使用 catalog：**
```yaml
# pnpm-workspace.yaml
catalog:
  # 统一版本，减少重复
  react: ^18.2.0
  typescript: ^5.0.0
```

**overrides：**
```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"  // 强制单一版本
    }
  }
}
```

#### 2. 构建优化

**使用 Turborepo：**
```bash
pnpm add -D turbo
```

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  }
}
```

**性能提升：**
```bash
# pnpm -r run build
5分钟

# turbo run build（有缓存）
10秒 ⚡⚡⚡⚡⚡
```

#### 3. 安装优化

**.npmrc：**
```ini
# 并发
network-concurrency=32

# 重试
fetch-retries=5

# 镜像
registry=https://registry.npmmirror.com

# 硬链接
package-import-method=hardlink
```

#### 4. 过滤执行

```bash
# 只构建变更的包
pnpm --filter "[origin/main]" build

# 只测试相关包
pnpm --filter "...@myorg/ui" test
```

#### 5. 并行执行

```bash
# 并行构建
pnpm -r --parallel run build

# 但要注意依赖顺序
# 使用 turbo 更安全
```

#### 6. CI 优化

```yaml
jobs:
  test:
    strategy:
      matrix:
        package: [ui, utils, icons]
    
    steps:
      - run: pnpm --filter "@myorg/${{ matrix.package }}" test
  
  # 并行运行多个包
```

#### 7. Store 优化

```bash
# 定期清理
pnpm store prune

# 使用本地 store（Docker）
pnpm config set store-dir .pnpm-store
```

### 📖 解析

**优化效果**

```bash
# 优化前
安装：120s
构建：5分钟
测试：2分钟
总计：8分钟

# 优化后
安装：10s（缓存）
构建：20s（Turbo缓存）
测试：30s（并行）
总计：1分钟 ⚡⚡⚡⚡⚡
```

**7倍提升！**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 完整方案

### 题目

设计一个生产级 pnpm Monorepo 方案。

<details>
<summary>查看答案</summary>

### ✅ 答案

**生产级 pnpm Monorepo 完整方案**

#### 1. 项目初始化

```bash
#!/bin/bash
# setup-monorepo.sh

echo "🚀 初始化 pnpm Monorepo"

# 创建目录结构
mkdir -p packages apps tools/.scripts

# 初始化
pnpm init

# 安装工具
pnpm add -D \
  @changesets/cli \
  turbo \
  typescript \
  eslint \
  prettier \
  husky \
  lint-staged
```

#### 2. 配置文件

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'

catalog:
  # React 生态
  react: ^18.2.0
  react-dom: ^18.2.0
  '@types/react': ^18.2.0
  
  # 构建工具
  typescript: ^5.0.0
  vite: ^4.0.0
  tsup: ^7.0.0
  
  # 测试
  vitest: ^0.34.0
  '@testing-library/react': ^14.0.0
```

**.npmrc：**
```ini
# 严格模式
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=false

# 公共提升
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*typescript*
public-hoist-pattern[]=@types/*

# 性能
network-concurrency=16
registry=https://registry.npmmirror.com
```

**package.json：**
```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@8.6.0",
  
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish",
    
    "prepare": "husky install"
  },
  
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21",
      "@types/react": "^18.2.0"
    },
    "peerDependencyRules": {
      "ignoreMissing": [],
      "allowedVersions": {
        "react": "18"
      }
    }
  }
}
```

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### 3. Git Hooks

**.husky/pre-commit：**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

**package.json：**
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml}": [
      "prettier --write"
    ]
  }
}
```

#### 4. CI/CD

**.github/workflows/ci.yml：**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm run build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
      
      - run: pnpm run test
      - run: pnpm run lint
      - run: pnpm run type-check
  
  release:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 📖 解析

**方案特点**

**✅ 性能：**
- pnpm 硬链接
- Turborepo 缓存
- 并行执行
- 增量构建

**✅ 开发体验：**
- 统一工具链
- Git hooks
- 类型检查
- 代码规范

**✅ 发布管理：**
- Changesets
- 自动化
- 语义化版本
- CHANGELOG

**✅ 质量保证：**
- TypeScript
- ESLint
- Prettier
- 测试覆盖

**完整的生产级方案！**

</details>

---

**导航**  
[上一章：第 24 章面试题](./chapter-24.md) | [返回目录](../README.md) | [下一章：第 26 章面试题](./chapter-26.md)
