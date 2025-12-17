# 第 30 章：Monorepo 架构设计 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Monorepo定义

### 题目

Monorepo 是什么？

**选项：**
- A. 单一仓库管理多个项目
- B. 单一项目
- C. 多仓库管理
- D. 代码库合并工具

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Monorepo（单一代码库）**

#### 定义

在一个 Git 仓库中管理多个相关项目或包。

#### 结构示例

```
my-monorepo/
├── packages/
│   ├── ui/           # 组件库
│   ├── utils/        # 工具库
│   └── icons/        # 图标库
├── apps/
│   ├── web/          # Web 应用
│   └── admin/        # 管理后台
└── package.json      # 根配置
```

#### 对比

**Monorepo：**
```
single-repo/
└── 所有项目
```

**Polyrepo（多仓库）：**
```
repo-1/  project-1
repo-2/  project-2
repo-3/  project-3
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** Monorepo优势

### 题目

Monorepo 可以简化跨项目的代码共享。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Monorepo 的优势**

#### 代码共享

**Polyrepo（复杂）：**
```bash
# 1. 修改 utils
cd utils-repo
git commit && git push

# 2. 发布 npm
npm version patch
npm publish

# 3. 更新依赖
cd ../web-repo
npm update utils
git commit && git push
```

**Monorepo（简单）：**
```bash
# 1. 修改 utils
cd packages/utils
# 修改代码

# 2. 立即生效
cd ../../apps/web
# 自动使用最新代码
```

**无需发布，实时同步**

#### 其他优势

- ✅ 统一依赖版本
- ✅ 原子提交
- ✅ 简化重构
- ✅ 统一工具链

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** Monorepo工具

### 题目

常用的 Monorepo 工具是？

**选项：**
- A. Turborepo
- B. Nx
- C. Lerna
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Monorepo 工具对比**

#### Turborepo

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

**特点：**
- 快速构建
- 智能缓存
- 远程缓存

#### Nx

```bash
nx build my-app
nx affected:build
```

**特点：**
- 依赖图分析
- 增量构建
- 丰富插件

#### Lerna

```bash
lerna publish
lerna version
```

**特点：**
- 版本管理
- 发布管理
- 传统工具

#### Rush

```bash
rush build
rush publish
```

**特点：**
- 企业级
- 严格管理

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** Monorepo挑战

### 题目

Monorepo 面临的挑战有哪些？

**选项：**
- A. 构建速度慢
- B. Git 性能问题
- C. 权限管理复杂
- D. 依赖关系混乱

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**Monorepo 的挑战**

#### A. 构建速度慢 ✅

**问题：**
```bash
# 所有包都要构建
pnpm -r run build
# 耗时：5-10分钟
```

**解决：**
```bash
# 增量构建
turbo run build
# 耗时：30秒 ⚡
```

#### B. Git 性能问题 ✅

**问题：**
```bash
# 仓库变大
.git/  # 5GB+

# 操作变慢
git status  # 5秒+
git log     # 3秒+
```

**解决：**
```bash
# Git LFS
git lfs track "*.png"

# Sparse checkout
git sparse-checkout set packages/ui
```

#### C. 权限管理复杂 ✅

**问题：**
```
团队 A → 只能访问 packages/ui
团队 B → 只能访问 apps/web
```

**解决：**
```yaml
# GitHub CODEOWNERS
packages/ui/  @team-ui
apps/web/     @team-web
```

#### D. 依赖关系混乱 ✅

**问题：**
```
app → utils → icons → ui → utils
循环依赖！
```

**解决：**
```bash
# 检测工具
madge --circular packages/
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Turborepo配置

### 题目

如何配置 Turborepo 的构建流水线？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Turborepo 流水线配置**

#### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["tsconfig.json"],
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
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### 字段说明

**dependsOn：**
```json
{
  "build": {
    "dependsOn": ["^build"]
    // ^ 表示依赖的包先构建
  }
}
```

**示例：**
```
app → utils

1. utils build
2. app build
```

**outputs：**
```json
{
  "build": {
    "outputs": ["dist/**"]
    // 缓存 dist 目录
  }
}
```

**cache：**
```json
{
  "build": {
    "cache": true
    // 启用缓存
  }
}
```

#### 使用

```bash
# 构建所有
turbo run build

# 只构建变更
turbo run build --filter="[HEAD^1]"

# 并行任务
turbo run build test lint
```

#### 缓存效果

```bash
# 首次构建
turbo run build
# Building packages/ui... 30s
# Building apps/web... 45s
# Total: 75s

# 再次构建（无变更）
turbo run build
# >>> FULL TURBO ⚡
# Total: 0.5s
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 包拓扑排序

### 题目

什么是包的拓扑排序（Topological Sort）？

**选项：**
- A. 按字母排序
- B. 按依赖顺序排序
- C. 按大小排序
- D. 随机排序

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**拓扑排序**

#### 定义

按依赖关系排序，被依赖的包在前。

#### 示例

**依赖关系：**
```
app → utils → icons
app → ui → icons
```

**拓扑排序：**
```
1. icons  （无依赖）
2. utils  （依赖 icons）
3. ui     （依赖 icons）
4. app    （依赖 utils, ui）
```

#### 构建顺序

```bash
# 正确顺序
pnpm -r run build

# 执行：
# 1. icons build
# 2. utils build
# 3. ui build
# 4. app build
```

#### 错误顺序

```bash
# 错误：先构建 app
cd packages/app
pnpm build

# Error: Cannot find module 'utils'
# utils 还未构建
```

#### 自动排序

```bash
# pnpm 自动拓扑排序
pnpm -r run build

# Turborepo 自动排序
turbo run build
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 依赖关系图

### 题目

如何可视化 Monorepo 的依赖关系？

**选项：**
- A. nx graph
- B. pnpm list --graph
- C. turbo graph
- D. A 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**依赖关系可视化**

#### A. nx graph ✅

```bash
# 安装 Nx
npm install -D nx

# 生成依赖图
nx graph

# 打开浏览器查看
# http://localhost:4211
```

**交互式依赖图**

#### C. Turborepo ✅

```bash
turbo run build --graph

# 或
turbo run build --dry=json | jq .
```

#### 其他工具

**Madge：**
```bash
npm install -g madge

# 依赖图
madge --image graph.png packages/

# 循环依赖
madge --circular packages/
```

**Graphviz：**
```bash
pnpm list --depth=Infinity --json | graph-tool
```

#### 依赖图示例

```
        icons
       ↗     ↖
    utils    ui
       ↖   ↗
        app
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** Monorepo架构

### 题目

设计一个大型 Monorepo 的目录结构。

<details>
<summary>查看答案</summary>

### ✅ 答案

**企业级 Monorepo 架构**

#### 完整目录结构

```
company-monorepo/
├── packages/               # 可复用的包
│   ├── ui/                # UI 组件库
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── utils/             # 工具函数
│   ├── icons/             # 图标库
│   ├── hooks/             # React Hooks
│   ├── stores/            # 状态管理
│   ├── types/             # TypeScript 类型
│   └── config/            # 共享配置
│
├── apps/                  # 应用程序
│   ├── web/               # Web 应用
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   ├── admin/             # 管理后台
│   ├── mobile/            # 移动端 H5
│   └── docs/              # 文档站点
│
├── services/              # 后端服务（可选）
│   ├── api/
│   ├── auth/
│   └── worker/
│
├── tooling/               # 开发工具
│   ├── eslint-config/     # ESLint 配置
│   ├── tsconfig/          # TS 配置
│   ├── scripts/           # 构建脚本
│   └── test-utils/        # 测试工具
│
├── docs/                  # 项目文档
│   ├── architecture.md
│   ├── contributing.md
│   └── deployment.md
│
├── .github/               # GitHub 配置
│   ├── workflows/         # CI/CD
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── deploy.yml
│   └── CODEOWNERS
│
├── .changeset/            # Changesets 配置
├── turbo.json             # Turborepo 配置
├── pnpm-workspace.yaml    # pnpm workspace
├── package.json           # 根配置
└── README.md
```

#### 包的标准结构

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── dist/                  # 构建输出
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

#### 配置文件

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'services/*'
  - 'tooling/*'

catalog:
  react: ^18.2.0
  typescript: ^5.0.0
```

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**根 package.json：**
```json
{
  "name": "company-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "turbo": "^1.10.0"
  }
}
```

### 📖 解析

**架构原则**

1. **清晰分层** - packages/apps/tooling
2. **独立构建** - 每个包可独立构建
3. **按域划分** - UI/业务/工具分开
4. **统一工具** - 共享配置和工具
5. **文档完善** - README + 架构文档

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 迁移Monorepo

### 题目

如何将多个独立仓库迁移到 Monorepo？

<details>
<summary>查看答案</summary>

### ✅ 答案

**多仓库迁移 Monorepo 方案**

#### 准备阶段

**当前状态：**
```
ui-repo/
utils-repo/
web-repo/
admin-repo/
```

**目标：**
```
monorepo/
├── packages/
│   ├── ui/
│   └── utils/
└── apps/
    ├── web/
    └── admin/
```

#### 迁移步骤

**1. 创建 Monorepo：**
```bash
mkdir monorepo
cd monorepo
pnpm init
```

**2. 配置 workspace：**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**3. 迁移第一个仓库（保留历史）：**
```bash
# 克隆 ui-repo
git clone ui-repo.git temp-ui
cd temp-ui

# 移动文件到子目录
mkdir ui
git mv * ui/
git commit -m "chore: prepare for monorepo"

# 推送到新位置
cd ../monorepo
git subtree add --prefix=packages/ui temp-ui main
```

**4. 迁移其他仓库：**
```bash
# utils
git subtree add --prefix=packages/utils utils-repo main

# web
git subtree add --prefix=apps/web web-repo main

# admin
git subtree add --prefix=apps/admin admin-repo main
```

**5. 调整依赖：**
```bash
# 之前：web-repo
{
  "dependencies": {
    "ui": "^1.0.0",      # npm 包
    "utils": "^2.0.0"
  }
}

# 之后：monorepo/apps/web
{
  "dependencies": {
    "ui": "workspace:*",     # 本地包
    "utils": "workspace:*"
  }
}
```

**6. 统一工具链：**
```bash
# 根目录安装工具
pnpm add -Dw turbo @changesets/cli

# 创建 turbo.json
# 创建 .changeset/
```

**7. 测试验证：**
```bash
# 构建所有包
turbo run build

# 运行测试
turbo run test

# 启动应用
turbo run dev
```

#### 渐进式迁移

**Phase 1：创建 Monorepo 但保留独立发布**
```bash
# 仍然独立发布到 npm
cd packages/ui
npm publish

cd packages/utils
npm publish
```

**Phase 2：内部使用 workspace**
```bash
# apps 使用 workspace 协议
{
  "dependencies": {
    "ui": "workspace:*"
  }
}
```

**Phase 3：完全 Monorepo**
```bash
# 统一发布管理
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

#### 团队沟通

**1. 培训：**
- Monorepo 概念
- 工具使用（pnpm/turbo）
- 工作流变更

**2. 文档：**
```markdown
# MIGRATION.md

## 新工作流

### 开发
```bash
pnpm dev
```

### 构建
```bash
turbo run build
```

### 发布
```bash
pnpm changeset
```
```

**3. 工具支持：**
```bash
# 快速命令
npm run web:dev     # 启动 web
npm run ui:build    # 构建 ui
npm run test:all    # 测试所有
```

### 📖 解析

**迁移要点**

1. ✅ 保留 Git 历史
2. ✅ 渐进式迁移
3. ✅ 充分测试
4. ✅ 团队培训
5. ✅ 回滚方案

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** Monorepo工具

### 题目

实现一个简单的 Monorepo 依赖分析工具。

<details>
<summary>查看答案</summary>

### ✅ 答案

**Monorepo 依赖分析工具**

```javascript
#!/usr/bin/env node
// scripts/analyze-deps.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class MonorepoAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.packages = new Map();
    this.graph = new Map();
  }

  // 发现所有包
  discoverPackages() {
    const workspaceConfig = this.readWorkspaceConfig();
    const patterns = workspaceConfig.packages || [];

    patterns.forEach(pattern => {
      const matches = glob.sync(pattern, { cwd: this.rootDir });
      
      matches.forEach(dir => {
        const pkgPath = path.join(this.rootDir, dir, 'package.json');
        
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          this.packages.set(pkg.name, {
            name: pkg.name,
            path: dir,
            version: pkg.version,
            dependencies: {
              ...pkg.dependencies,
              ...pkg.devDependencies
            }
          });
        }
      });
    });

    console.log(`✓ 发现 ${this.packages.size} 个包\n`);
  }

  // 读取 workspace 配置
  readWorkspaceConfig() {
    const yamlPath = path.join(this.rootDir, 'pnpm-workspace.yaml');
    
    if (fs.existsSync(yamlPath)) {
      const yaml = fs.readFileSync(yamlPath, 'utf8');
      return this.parseYAML(yaml);
    }

    const pkgPath = path.join(this.rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    return {
      packages: pkg.workspaces || []
    };
  }

  // 简单的 YAML 解析
  parseYAML(yaml) {
    const lines = yaml.split('\n');
    const packages = [];
    let inPackages = false;

    lines.forEach(line => {
      if (line.trim() === 'packages:') {
        inPackages = true;
      } else if (inPackages && line.trim().startsWith('-')) {
        const pattern = line.trim().slice(1).trim().replace(/['"]/g, '');
        packages.push(pattern);
      }
    });

    return { packages };
  }

  // 构建依赖图
  buildDependencyGraph() {
    this.packages.forEach((pkg, name) => {
      const deps = [];
      
      Object.keys(pkg.dependencies || {}).forEach(depName => {
        if (this.packages.has(depName)) {
          deps.push(depName);
        }
      });

      this.graph.set(name, deps);
    });
  }

  // 拓扑排序
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (name) => {
      if (temp.has(name)) {
        throw new Error(`循环依赖: ${name}`);
      }
      
      if (visited.has(name)) return;

      temp.add(name);

      const deps = this.graph.get(name) || [];
      deps.forEach(dep => visit(dep));

      temp.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    this.packages.forEach((_, name) => {
      if (!visited.has(name)) {
        visit(name);
      }
    });

    return sorted;
  }

  // 检测循环依赖
  detectCircularDeps() {
    const cycles = [];

    const findCycles = (start, current, path, visited) => {
      if (path.includes(current)) {
        const cycle = path.slice(path.indexOf(current));
        cycle.push(current);
        cycles.push(cycle);
        return;
      }

      if (visited.has(current)) return;

      visited.add(current);
      path.push(current);

      const deps = this.graph.get(current) || [];
      deps.forEach(dep => {
        findCycles(start, dep, [...path], visited);
      });
    };

    this.packages.forEach((_, name) => {
      findCycles(name, name, [], new Set());
    });

    return cycles;
  }

  // 查找依赖链
  findDependencyChain(target) {
    const chains = [];

    const findChains = (current, path) => {
      path.push(current);

      if (current === target) {
        chains.push([...path]);
        return;
      }

      const deps = this.graph.get(current) || [];
      deps.forEach(dep => {
        if (!path.includes(dep)) {
          findChains(dep, [...path]);
        }
      });
    };

    this.packages.forEach((_, name) => {
      if (name !== target) {
        findChains(name, []);
      }
    });

    return chains;
  }

  // 生成报告
  generateReport() {
    console.log('='.repeat(60));
    console.log('📊 Monorepo 依赖分析报告');
    console.log('='.repeat(60));

    // 基本信息
    console.log('\n📦 包统计：');
    console.log(`  总数: ${this.packages.size}`);

    const pkgsByPath = {};
    this.packages.forEach(pkg => {
      const dir = pkg.path.split('/')[0];
      pkgsByPath[dir] = (pkgsByPath[dir] || 0) + 1;
    });

    Object.entries(pkgsByPath).forEach(([dir, count]) => {
      console.log(`  ${dir}/: ${count}`);
    });

    // 依赖关系
    console.log('\n🔗 依赖关系：');
    this.packages.forEach((pkg, name) => {
      const deps = this.graph.get(name) || [];
      console.log(`  ${name}`);
      
      if (deps.length > 0) {
        deps.forEach(dep => {
          console.log(`    → ${dep}`);
        });
      } else {
        console.log(`    (无内部依赖)`);
      }
    });

    // 拓扑排序
    console.log('\n📋 构建顺序（拓扑排序）：');
    try {
      const sorted = this.topologicalSort();
      sorted.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
      });
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }

    // 循环依赖
    console.log('\n⚠️  循环依赖检测：');
    const cycles = this.detectCircularDeps();
    
    if (cycles.length === 0) {
      console.log('  ✓ 无循环依赖');
    } else {
      console.log(`  ✗ 发现 ${cycles.length} 个循环：`);
      cycles.forEach(cycle => {
        console.log(`    ${cycle.join(' → ')}`);
      });
    }

    // 依赖深度
    console.log('\n📊 依赖统计：');
    const depCounts = [];
    
    this.packages.forEach((pkg, name) => {
      const deps = this.graph.get(name) || [];
      depCounts.push({ name, count: deps.length });
    });

    depCounts.sort((a, b) => b.count - a.count);
    
    console.log('  最多依赖：');
    depCounts.slice(0, 5).forEach(({ name, count }) => {
      console.log(`    ${name}: ${count}`);
    });

    // 被依赖统计
    const dependedBy = new Map();
    this.graph.forEach((deps, name) => {
      deps.forEach(dep => {
        if (!dependedBy.has(dep)) {
          dependedBy.set(dep, []);
        }
        dependedBy.get(dep).push(name);
      });
    });

    const dependedByCounts = [];
    dependedBy.forEach((packages, name) => {
      dependedByCounts.push({ name, count: packages.length });
    });

    dependedByCounts.sort((a, b) => b.count - a.count);

    console.log('\n  被依赖最多：');
    dependedByCounts.slice(0, 5).forEach(({ name, count }) => {
      console.log(`    ${name}: ${count} 个包依赖它`);
    });

    console.log('\n');
  }

  // 运行分析
  run() {
    this.discoverPackages();
    this.buildDependencyGraph();
    this.generateReport();
  }
}

// 运行
const analyzer = new MonorepoAnalyzer(process.cwd());
analyzer.run();
```

**使用：**
```bash
node scripts/analyze-deps.js
```

**输出示例：**
```
✓ 发现 8 个包

============================================================
📊 Monorepo 依赖分析报告
============================================================

📦 包统计：
  总数: 8
  packages/: 4
  apps/: 2

🔗 依赖关系：
  @myorg/icons
    (无内部依赖)
  @myorg/utils
    → @myorg/icons
  @myorg/ui
    → @myorg/icons
  @myorg/app
    → @myorg/ui
    → @myorg/utils

📋 构建顺序（拓扑排序）：
  1. @myorg/icons
  2. @myorg/utils
  3. @myorg/ui
  4. @myorg/app

⚠️  循环依赖检测：
  ✓ 无循环依赖

📊 依赖统计：
  最多依赖：
    @myorg/app: 2
    @myorg/ui: 1

  被依赖最多：
    @myorg/icons: 2 个包依赖它
    @myorg/utils: 1 个包依赖它
```

### 📖 解析

**工具功能**

1. ✅ 包发现
2. ✅ 依赖图构建
3. ✅ 拓扑排序
4. ✅ 循环检测
5. ✅ 统计分析

</details>

---

**导航**  
[上一章：第 29 章面试题](./chapter-29.md) | [返回目录](../README.md) | [下一章：第 31 章面试题](./chapter-31.md)
