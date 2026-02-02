# pnpm workspace 机制

## pnpm-workspace.yaml 配置

### 基本配置

**文件位置**：项目根目录

**基本语法**：
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**glob 模式**：
```yaml
packages:
  # 包含所有 packages 下的子目录
  - 'packages/*'
  
  # 包含嵌套子目录
  - 'packages/**'
  
  # 排除特定目录
  - '!**/test/**'
  - '!**/fixtures/**'
  
  # 多个根目录
  - 'apps/*'
  - 'libs/*'
  - 'tools/*'
```

**完整示例**：
```yaml
packages:
  # 应用
  - 'apps/web'
  - 'apps/admin'
  - 'apps/mobile'
  
  # 库
  - 'packages/*'
  
  # 排除
  - '!packages/legacy'
  - '!**/__tests__/**'
```

### 验证配置

**查看 workspace 列表**：
```bash
pnpm list -r --depth -1

# 输出示例：
# Legend: production dependency, optional only, dev only
# 
# apps/web
# apps/admin
# packages/core
# packages/utils
```

**检查配置错误**：
```bash
pnpm install

# 如果 pnpm-workspace.yaml 有误
# Error: No projects matched the patterns in pnpm-workspace.yaml
```

---

## 过滤器（filter）语法

### 基本过滤

**按名称过滤**：
```bash
# 在特定包运行命令
pnpm --filter @my-org/core build

# 在多个包运行
pnpm --filter "@my-org/{core,utils}" test

# 使用通配符
pnpm --filter "@my-org/*" lint
```

**按路径过滤**：
```bash
# 路径匹配
pnpm --filter "./packages/core" build

# 多个路径
pnpm --filter "./packages/*" test
```

### 依赖图过滤

**依赖者过滤**：
```bash
# 构建 core 及其所有依赖者
pnpm --filter @my-org/core... build

# 示例：
# @my-org/core
# @my-org/app (依赖 core)
# @my-org/web (依赖 core)
```

**被依赖者过滤**：
```bash
# 构建 app 及其所有依赖
pnpm --filter ...@my-org/app build

# 示例：
# @my-org/utils (被 app 依赖)
# @my-org/core (被 app 依赖)
# @my-org/app
```

**依赖图范围**：
```bash
# core 到 app 的完整依赖链
pnpm --filter "@my-org/core...@my-org/app" build

# 相当于：
# @my-org/core
# @my-org/utils (core → utils → app)
# @my-org/app
```

### 变更检测过滤

**基于 Git 变更**：
```bash
# 只构建变更的包
pnpm --filter "[HEAD]" build

# 与主分支对比
pnpm --filter "[origin/main]" test

# 自定义 commit
pnpm --filter "[abc123]" lint
```

**组合变更和依赖**：
```bash
# 变更的包及其依赖者
pnpm --filter "[origin/main]..." build

# 变更的包及其依赖
pnpm --filter "...[origin/main]" build
```

### 高级过滤

**排除过滤**：
```bash
# 所有包，排除 test-utils
pnpm --filter "!@my-org/test-utils" build

# 组合排除
pnpm --filter "@my-org/*" --filter "!@my-org/legacy" test
```

**并行控制**：
```bash
# 并行构建（默认）
pnpm --filter "@my-org/*" -r build

# 拓扑排序（按依赖顺序）
pnpm --filter "@my-org/*" -r --workspace-concurrency=1 build
```

---

## 依赖协议（workspace:、link:）

### workspace: 协议

**基本用法**：
```json
// packages/app/package.json
{
  "name": "@my-org/app",
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

**版本范围**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:*",      // 任意版本
    "@my-org/utils": "workspace:^",     // 保留 ^
    "@my-org/ui": "workspace:~1.2.0"    // 保留 ~
  }
}
```

**发布时替换**：
```json
// 发布前
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}

// 发布后（自动替换）
{
  "dependencies": {
    "@my-org/core": "1.5.0"  // 实际版本
  }
}
```

### link: 协议

**用途**：引用本地路径（非 workspace）

**语法**：
```json
{
  "dependencies": {
    "my-local-lib": "link:../my-local-lib"
  }
}
```

**与 workspace: 的区别**：

| 特性 | workspace: | link: |
|------|-----------|-------|
| 用途 | workspace 内部依赖 | 外部本地包 |
| 发布时 | 替换为版本号 | 保持原样 |
| 验证 | 检查版本匹配 | 不检查 |

**使用场景**：
```json
// 开发时引用未发布的包
{
  "dependencies": {
    "experimental-lib": "link:../../experiments/lib"
  }
}
```

### file: 协议

**用途**：打包本地文件

**语法**：
```json
{
  "dependencies": {
    "local-pkg": "file:../local-pkg"
  }
}
```

**行为**：
```bash
pnpm install

# pnpm 会：
# 1. 打包 ../local-pkg 为 tarball
# 2. 安装到 node_modules
# 3. 不会监听文件变化
```

**对比**：
```
workspace: → 符号链接（实时更新）
link:      → 符号链接（实时更新）
file:      → 打包安装（不实时）
```

---

## 增量构建与任务缓存

### 依赖图驱动构建

**拓扑排序构建**：
```bash
pnpm -r --filter "@my-org/*" run build

# 执行顺序：
# 1. @my-org/utils (无依赖)
# 2. @my-org/core (依赖 utils)
# 3. @my-org/ui (依赖 core)
# 4. @my-org/app (依赖 ui)
```

**并行优化**：
```bash
# 自动并行（相同层级）
pnpm -r run build

# 执行顺序：
# 层级 1: utils, config (并行)
# 层级 2: core (等待 utils)
# 层级 3: ui, api (并行，等待 core)
# 层级 4: app (等待 ui, api)
```

### 变更检测

**只构建变更的包**：
```bash
# 与主分支对比
pnpm --filter "[origin/main]" run build

# 示例：
# 如果只修改了 utils
# 只会构建：utils
```

**包含依赖者**：
```bash
# 变更的包 + 依赖它的包
pnpm --filter "[origin/main]..." run build

# 如果修改了 utils
# 会构建：utils, core, ui, app (依赖链)
```

### 任务缓存（实验性）

**配置**：
```yaml
# .npmrc
enable-pnpm-cache=true
```

**工作原理**：
```bash
# 第一次构建
pnpm run build
# ✓ @my-org/core build 完成 (2.5s)

# 再次构建（无变更）
pnpm run build
# ✓ @my-org/core build 命中缓存 (0.1s)
```

**缓存键**：
- 源代码 hash
- package.json
- 依赖的输出

**与 Turborepo 集成**：
```bash
# 使用 Turborepo 的缓存
pnpm dlx turbo run build

# 更强大的缓存策略
# 支持远程缓存
```

---

## 常见误区

### 误区 1：pnpm-workspace.yaml 可选

**错误理解**：workspace 会自动检测

**真相**：
```bash
# 没有 pnpm-workspace.yaml
pnpm install
# 按单仓库模式安装

# 有 pnpm-workspace.yaml
pnpm install
# 按 Monorepo 模式安装
```

### 误区 2：workspace: 可以引用外部包

**错误用法**：
```json
{
  "dependencies": {
    "react": "workspace:*"  // ❌ React 不在 workspace
  }
}
```

**报错**：
```
Error: Cannot resolve workspace protocol for "react"
```

**正确用法**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:*",  // ✅ 内部包
    "react": "^18.0.0"               // ✅ 外部包
  }
}
```

### 误区 3：过滤器可以嵌套

**错误语法**：
```bash
pnpm --filter "(@my-org/* AND [origin/main])" build
# ❌ 不支持 AND 逻辑
```

**正确组合**：
```bash
# 使用多个 --filter
pnpm --filter "@my-org/*" --filter "[origin/main]" build

# 或使用依赖图语法
pnpm --filter "@my-org/core...[origin/main]" build
```

---

## 工程实践

### 场景 1：标准 Monorepo 结构

**目录结构**：
```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── .npmrc
├── apps/
│   ├── web/
│   │   └── package.json
│   └── admin/
│       └── package.json
├── packages/
│   ├── core/
│   │   └── package.json
│   ├── utils/
│   │   └── package.json
│   └── ui/
│       └── package.json
└── tools/
    └── build/
        └── package.json
```

**pnpm-workspace.yaml**：
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

**根 package.json**：
```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter \"./packages/**\" run build",
    "build:apps": "pnpm -r --filter \"./apps/**\" run build",
    "test": "pnpm -r run test",
    "dev": "pnpm --filter \"@my-org/web\" run dev",
    "clean": "pnpm -r run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "turbo": "^1.10.0"
  }
}
```

### 场景 2：CI 优化

**只测试变更的包**：
```yaml
# .github/workflows/ci.yml
- name: Build affected packages
  run: pnpm --filter "[origin/main]..." run build

- name: Test affected packages
  run: pnpm --filter "[origin/main]..." run test
```

**缓存优化**：
```yaml
- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### 场景 3：开发工作流

**本地开发**：
```bash
# 启动 web 应用（自动启动依赖）
pnpm --filter @my-org/web run dev

# 监听所有包的变更
pnpm -r run watch
```

**依赖更新**：
```bash
# 更新特定包的依赖
pnpm --filter @my-org/core update

# 更新所有包
pnpm -r update
```

**发布**：
```bash
# 使用 Changesets
pnpm changeset
pnpm changeset version
pnpm -r publish
```

---

## 深入一点

### workspace: 协议的解析

**伪代码**：
```javascript
function resolveWorkspaceProtocol(spec, workspaces) {
  // spec: "workspace:*"
  const [protocol, range] = spec.split(':');
  
  if (protocol !== 'workspace') {
    return null;
  }
  
  // 查找 workspace 包
  const pkg = workspaces.find(w => w.name === spec.name);
  if (!pkg) {
    throw new Error(`Workspace package not found: ${spec.name}`);
  }
  
  // 验证版本
  if (range !== '*' && !semver.satisfies(pkg.version, range)) {
    throw new Error(`Version mismatch`);
  }
  
  return {
    version: pkg.version,
    path: pkg.location,
    type: 'workspace'
  };
}
```

### 过滤器的性能优化

**依赖图缓存**：
```javascript
// pnpm 缓存依赖图
const dependencyGraph = buildDependencyGraph(workspaces);

// 过滤时直接查询缓存
function filterPackages(pattern) {
  if (pattern.includes('...')) {
    return traverseDependencyGraph(dependencyGraph, pattern);
  }
  return matchPattern(workspaces, pattern);
}
```

**Git 变更缓存**：
```javascript
// 缓存 Git 变更文件列表
const changedFiles = execSync('git diff --name-only origin/main').toString();

// 映射文件到包
const changedPackages = mapFilesToPackages(changedFiles, workspaces);
```

### pnpm vs Yarn Workspaces 对比

| 特性 | pnpm | Yarn |
|------|------|------|
| 配置文件 | pnpm-workspace.yaml | package.json |
| 依赖协议 | workspace: | workspace: |
| 过滤器 | 强大（依赖图） | 基础 |
| 性能 | 最快 | 快 |
| 磁盘占用 | 最小 | 中等 |

---

## 参考资料

- [pnpm workspaces](https://pnpm.io/workspaces)
- [过滤器语法](https://pnpm.io/filtering)
- [workspace: 协议](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [pnpm vs Yarn Workspaces](https://pnpm.io/feature-comparison)
