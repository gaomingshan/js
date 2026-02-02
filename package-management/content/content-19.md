# Yarn Workspaces 实践

## workspace 协议（workspace:）

### 基本语法

**声明内部依赖**：
```json
// packages/app/package.json
{
  "name": "@my-org/app",
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

**workspace: 协议的含义**：
- `workspace:*`：使用工作区中的任意版本
- `workspace:^`：使用工作区版本，保留语义化范围
- `workspace:~`：使用工作区版本，保留补丁范围

### 版本解析规则

**workspace:***：
```json
// packages/core/package.json
{
  "name": "@my-org/core",
  "version": "1.2.3"
}

// packages/app/package.json
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}

// 解析结果
node_modules/@my-org/core → ../../packages/core
```

**workspace:^**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:^1.0.0"
  }
}

// 发布时替换为
{
  "dependencies": {
    "@my-org/core": "^1.2.3"  // 实际版本
  }
}
```

**workspace:~**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:~1.2.0"
  }
}

// 发布时替换为
{
  "dependencies": {
    "@my-org/core": "~1.2.3"
  }
}
```

### 发布时的自动替换

**发布前**：
```json
{
  "name": "@my-org/app",
  "version": "2.0.0",
  "dependencies": {
    "@my-org/core": "workspace:*",
    "@my-org/utils": "workspace:^1.0.0"
  }
}
```

**发布后**（自动替换）：
```json
{
  "name": "@my-org/app",
  "version": "2.0.0",
  "dependencies": {
    "@my-org/core": "1.5.0",      // 替换为实际版本
    "@my-org/utils": "^1.3.2"     // 保留范围符号
  }
}
```

---

## 跨包依赖管理

### 依赖链

**示例结构**：
```
packages/
├── utils/         (基础工具)
├── core/          (依赖 utils)
└── app/           (依赖 core, utils)
```

**package.json 配置**：
```json
// packages/utils/package.json
{
  "name": "@my-org/utils",
  "version": "1.0.0"
}

// packages/core/package.json
{
  "name": "@my-org/core",
  "version": "2.0.0",
  "dependencies": {
    "@my-org/utils": "workspace:*"
  }
}

// packages/app/package.json
{
  "name": "@my-org/app",
  "version": "3.0.0",
  "dependencies": {
    "@my-org/core": "workspace:*",
    "@my-org/utils": "workspace:*"
  }
}
```

**依赖图**：
```
app → core → utils
  ↘_________↗
```

### 循环依赖检测

**问题场景**：
```
packages/a → packages/b
packages/b → packages/a  ← 循环
```

**Yarn 处理**：
```bash
yarn install
# Warning: Circular dependency detected
# packages/a → packages/b → packages/a
```

**允许但警告**：
- Yarn 创建符号链接
- 运行时由 Node.js 处理
- 可能导致初始化顺序问题

**避免策略**：
```
拆分共享代码到 packages/shared
packages/a → packages/shared
packages/b → packages/shared
```

### 版本不一致处理

**场景**：
```json
// packages/app/package.json
{
  "dependencies": {
    "@my-org/core": "workspace:^1.0.0"
  }
}

// packages/core/package.json
{
  "version": "2.0.0"  // 不满足 ^1.0.0
}
```

**Yarn 行为**：
```bash
yarn install
# Error: Workspace version mismatch
# @my-org/core@2.0.0 doesn't satisfy ^1.0.0
```

**解决方案**：
```json
// 选项 1：更新版本约束
{
  "dependencies": {
    "@my-org/core": "workspace:*"  // 接受任意版本
  }
}

// 选项 2：降级包版本
{
  "version": "1.5.0"  // 满足 ^1.0.0
}
```

---

## 独立版本发布策略

### 固定版本模式（Babel 风格）

**特点**：所有包使用相同版本号

**配置**：
```json
// lerna.json
{
  "version": "7.0.0",
  "packages": ["packages/*"]
}
```

**发布**：
```bash
lerna version patch
# 所有包：7.0.0 → 7.0.1

lerna publish
# 发布所有变更的包
```

**优点**：
- 版本管理简单
- 用户理解成本低
- 发布流程统一

**缺点**：
- 未变更的包也会升版本
- 版本号浪费

### 独立版本模式（Yarn 推荐）

**特点**：每个包独立版本

**配置**：
```json
// lerna.json
{
  "version": "independent",
  "packages": ["packages/*"]
}
```

**版本示例**：
```
@my-org/core@2.1.0
@my-org/utils@1.3.5
@my-org/app@3.0.2
```

**发布**：
```bash
lerna version
# ? Select a new version for @my-org/core (currently 2.1.0)
#   Patch (2.1.1)
#   Minor (2.2.0)
#   Major (3.0.0)

# 只升级变更的包
```

**优点**：
- 版本号语义化
- 避免不必要的升级
- 更细粒度的控制

**缺点**：
- 版本管理复杂
- 依赖更新需要协调

### Changesets 工作流

**安装**：
```bash
yarn add -D @changesets/cli
yarn changeset init
```

**创建 changeset**：
```bash
yarn changeset
# ? Which packages would you like to include?
#   ✔ @my-org/core
#   ✔ @my-org/utils
# ? What kind of change is this for @my-org/core?
#   Patch
# ? Please enter a summary for this change
#   Fix memory leak in event handlers
```

**生成 changeset 文件**：
```markdown
<!-- .changeset/cool-panda-123.md -->
---
"@my-org/core": patch
"@my-org/utils": patch
---

Fix memory leak in event handlers
```

**发布**：
```bash
# 1. 生成版本号和 CHANGELOG
yarn changeset version

# 2. 发布到 npm
yarn changeset publish
```

---

## Monorepo 脚本协调

### 并行执行

**yarn workspaces foreach**：
```bash
# 在所有 workspace 运行测试
yarn workspaces foreach run test

# 并行执行（快速）
yarn workspaces foreach -p run test

# 按拓扑顺序执行（考虑依赖）
yarn workspaces foreach -pt run build
```

**拓扑排序示例**：
```
依赖图：
utils (无依赖)
core (依赖 utils)
app (依赖 core)

执行顺序：
1. utils
2. core
3. app
```

### 选择性执行

**按名称过滤**：
```bash
# 只在 @my-org/app 运行
yarn workspace @my-org/app run build

# 在多个包运行
yarn workspaces foreach -A --include "@my-org/{app,core}" run test
```

**按路径过滤**：
```bash
# 只在 packages/app 运行
yarn workspaces foreach --include "./packages/app" run dev
```

**排除特定包**：
```bash
# 排除测试包
yarn workspaces foreach --exclude "@my-org/test-utils" run build
```

### 脚本编排

**根目录 package.json**：
```json
{
  "scripts": {
    "build": "yarn workspaces foreach -pt run build",
    "test": "yarn workspaces foreach -p run test",
    "lint": "yarn workspaces foreach -p run lint",
    "clean": "yarn workspaces foreach -p run clean",
    "dev": "yarn workspaces foreach -pi run dev",
    "typecheck": "yarn workspaces foreach -p run typecheck"
  }
}
```

**依赖感知构建**：
```json
{
  "scripts": {
    "build:affected": "yarn workspaces foreach -pt --since origin/main run build"
  }
}
```

**--since 参数**：
- 只构建变更的包及其依赖者
- 加速 CI 构建

---

## 常见误区

### 误区 1：workspace:* 等于最新版本

**误解**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:*"  // 误以为是 latest
  }
}
```

**真相**：
- `workspace:*` 引用本地工作区的包
- 版本号来自该包的 package.json
- 与 `*` 通配符不同

### 误区 2：所有依赖都用 workspace:

**错误示例**：
```json
{
  "dependencies": {
    "react": "workspace:*"  // ❌ React 不在工作区
  }
}
```

**报错**：
```
Error: react@workspace:* not found in any workspace
```

**正确做法**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:*",  // ✅ 内部包
    "react": "^18.0.0"               // ✅ 外部包
  }
}
```

### 误区 3：workspace 包可以独立发布

**场景**：
```bash
cd packages/core
yarn publish
# Error: Cannot publish workspace packages from inside
```

**正确方式**：
```bash
# 在根目录
yarn workspaces foreach --no-private npm publish

# 或使用工具
lerna publish
changeset publish
```

---

## 工程实践

### 场景 1：标准 Yarn Workspaces 结构

**目录结构**：
```
my-monorepo/
├── package.json
├── yarn.lock
├── .yarnrc.yml
├── packages/
│   ├── core/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── app/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
└── .gitignore
```

**根 package.json**：
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "yarn workspaces foreach -pt run build",
    "test": "yarn workspaces foreach -p run test",
    "dev": "yarn workspaces foreach -pi run dev",
    "clean": "yarn workspaces foreach run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "typescript": "^5.0.0"
  }
}
```

### 场景 2：依赖版本同步

**问题**：多个包依赖不同版本的 React

**解决方案 1：根目录统一**
```json
// 根 package.json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

**解决方案 2：resolutions**
```json
{
  "resolutions": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

**验证**：
```bash
yarn why react
# 检查是否所有包使用同一版本
```

### 场景 3：增量构建脚本

**package.json**：
```json
{
  "scripts": {
    "build:all": "yarn workspaces foreach -pt run build",
    "build:changed": "yarn workspaces foreach -pt --since origin/main run build",
    "test:affected": "yarn workspaces foreach -p --since HEAD~1 run test"
  }
}
```

**CI 配置**：
```yaml
# .github/workflows/ci.yml
- name: Build affected packages
  run: yarn build:changed

- name: Test affected packages
  run: yarn test:affected
```

---

## 深入一点

### workspace: 协议的实现

**解析逻辑**：
```javascript
function resolveWorkspaceProtocol(spec) {
  // spec: "workspace:*"
  const [protocol, range] = spec.split(':');
  
  if (protocol !== 'workspace') {
    return null;
  }
  
  // 查找工作区包
  const workspacePkg = findWorkspacePackage(spec.name);
  if (!workspacePkg) {
    throw new Error(`Workspace package not found: ${spec.name}`);
  }
  
  // 验证版本范围
  if (range !== '*' && !semver.satisfies(workspacePkg.version, range)) {
    throw new Error(`Version mismatch: ${workspacePkg.version} doesn't satisfy ${range}`);
  }
  
  return {
    version: workspacePkg.version,
    location: workspacePkg.location
  };
}
```

### 发布时的版本替换

**打包流程**：
```javascript
async function prepareForPublish(pkg) {
  const pkgJson = await readPackageJson(pkg.location);
  
  // 替换 workspace: 协议
  for (const [name, spec] of Object.entries(pkgJson.dependencies || {})) {
    if (spec.startsWith('workspace:')) {
      const workspacePkg = findWorkspacePackage(name);
      const range = spec.replace('workspace:', '');
      
      // 替换为实际版本
      pkgJson.dependencies[name] = range === '*' 
        ? workspacePkg.version 
        : `${range}${workspacePkg.version}`;
    }
  }
  
  return pkgJson;
}
```

### Yarn Workspaces vs Lerna

**Yarn Workspaces**：
- 包管理器内置
- 依赖安装和链接
- 轻量级

**Lerna**：
- 独立工具
- 版本管理和发布
- 功能丰富

**最佳组合**：
```json
// package.json
{
  "workspaces": ["packages/*"],  // Yarn 管理依赖
  "scripts": {
    "publish": "lerna publish"   // Lerna 管理发布
  }
}
```

**现代替代方案**：
- Changesets：版本管理
- Turborepo：任务编排
- Nx：智能缓存

---

## 参考资料

- [Yarn Workspaces 文档](https://yarnpkg.com/features/workspaces)
- [workspace: 协议](https://yarnpkg.com/features/protocols#workspace)
- [Changesets](https://github.com/changesets/changesets)
- [Lerna](https://lerna.js.org/)
