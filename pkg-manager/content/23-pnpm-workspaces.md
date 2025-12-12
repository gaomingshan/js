# pnpm Workspaces

## 概述

pnpm workspace 是目前最高效的 Monorepo 解决方案，性能优于 npm/yarn workspaces。

## 一、配置 Workspace

### 1.1 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

**根 package.json：**
```json
{
  "name": "my-monorepo",
  "private": true
}
```

### 1.2 目录结构

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── packages/
│   ├── pkg-a/
│   │   └── package.json
│   └── pkg-b/
│       └── package.json
└── apps/
    └── web/
        └── package.json
```

## 二、workspace 协议

### 2.1 引用其他 workspace

```json
// packages/pkg-b/package.json
{
  "dependencies": {
    "pkg-a": "workspace:^"
  }
}
```

**协议类型：**
```json
{
  "dependencies": {
    "pkg-a": "workspace:*",      // 任意版本
    "pkg-b": "workspace:^",      // 遵循 semver
    "pkg-c": "workspace:~",      
    "pkg-d": "workspace:^1.0.0"
  }
}
```

### 2.2 发布时自动替换

**开发时：**
```json
{
  "dependencies": {
    "pkg-a": "workspace:^1.0.0"
  }
}
```

**发布后：**
```json
{
  "dependencies": {
    "pkg-a": "^1.0.0"
  }
}
```

## 三、管理依赖

### 3.1 安装依赖到特定 workspace

```bash
# 为 pkg-a 添加依赖
pnpm add lodash --filter pkg-a

# 为所有 workspace 添加
pnpm add lodash -r

# 为根添加
pnpm add -D typescript -w
```

### 3.2 安装所有依赖

```bash
pnpm install

# 自动链接 workspace 包
```

## 四、过滤器（Filter）

### 4.1 基础过滤

```bash
# 在 pkg-a 中运行
pnpm --filter pkg-a build

# 简写
pnpm -F pkg-a build
```

### 4.2 通配符

```bash
# 所有以 @mycompany 开头的包
pnpm --filter "@mycompany/*" build

# packages 目录下所有包
pnpm --filter "./packages/*" test
```

### 4.3 依赖过滤

```bash
# pkg-a 及其所有依赖
pnpm --filter pkg-a... build

# pkg-a 的所有依赖（不含自己）
pnpm --filter ...pkg-a build

# pkg-a 及其所有依赖者
pnpm --filter ...pkg-a... build
```

### 4.4 组合过滤

```bash
# 多个过滤条件
pnpm --filter pkg-a --filter pkg-b build

# 排除
pnpm --filter "./packages/*" --filter "!pkg-a" test
```

## 五、批量操作

### 5.1 在所有 workspace 运行

```bash
# 递归运行
pnpm -r build

# 等同于
pnpm --recursive build
```

### 5.2 并行执行

```bash
# 并行运行测试
pnpm -r --parallel test

# 或使用 run 命令
pnpm run --parallel -r test
```

### 5.3 拓扑排序

```bash
# 按依赖顺序构建
pnpm -r build

# pnpm 自动按拓扑顺序执行
# pkg-a → pkg-b（依赖 pkg-a）→ app（依赖 pkg-b）
```

## 六、workspace 命令

### 6.1 列出所有 workspace

```bash
pnpm -r list --depth -1

# 只显示名称
pnpm -r list --depth -1 --json | jq -r '.[].name'
```

### 6.2 执行脚本

```bash
# 在所有 workspace 执行
pnpm -r run build

# 在特定 workspace 执行
pnpm --filter pkg-a run dev
```

## 七、高级配置

### 7.1 .npmrc 配置

```ini
# 链接 workspace 协议
link-workspace-packages=true

# 严格 peer 依赖
strict-peer-dependencies=true

# 共享 workspace lockfile
shared-workspace-lockfile=true

# hoist 配置
hoist=true
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*
```

### 7.2 public-hoist-pattern

```ini
# 提升特定包到根 node_modules
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
```

## 八、实战示例

### 8.1 Monorepo 脚本

**根 package.json：**
```json
{
  "scripts": {
    "build": "pnpm -r --filter \"./packages/*\" run build",
    "test": "pnpm -r test",
    "dev": "pnpm --parallel -r run dev",
    "clean": "pnpm -r exec rm -rf dist node_modules",
    "lint": "pnpm -r run lint"
  }
}
```

### 8.2 增量构建

```bash
# 只构建改动的包及其依赖者
pnpm --filter ...[HEAD^1] build
```

### 8.3 发布流程

```bash
# 1. 构建所有包
pnpm -r build

# 2. 测试
pnpm -r test

# 3. 发布（假设使用 changesets）
pnpm changeset version
pnpm -r publish
```

## 九、性能优势

### 9.1 vs npm/yarn workspaces

```bash
# 安装速度（200+ 依赖的 monorepo）
npm:   120s
yarn:  75s
pnpm:  25s  ⚡⚡⚡

# 磁盘占用
npm:   1.2GB
yarn:  1.1GB
pnpm:  400MB ⚡⚡⚡
```

### 9.2 硬链接优势

- ⚡ 安装极快
- 💾 节省空间
- 🔄 跨项目共享

## 十、最佳实践

### 10.1 目录结构

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── .npmrc
├── packages/
│   ├── ui/           # 组件库
│   ├── utils/        # 工具库
│   └── shared/       # 共享代码
├── apps/
│   ├── web/          # Web 应用
│   └── admin/        # 管理后台
└── tools/
    └── scripts/      # 构建脚本
```

### 10.2 依赖管理

```json
// 根 package.json - 共享开发依赖
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}

// workspace package.json - 特定依赖
{
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

## 参考资料

- [pnpm workspace 文档](https://pnpm.io/workspaces)
- [过滤器语法](https://pnpm.io/filtering)

---

**导航**  
[上一章：pnpm基础使用](./22-pnpm-basics.md) | [返回目录](../README.md) | [下一章：pnpm高级特性](./24-pnpm-advanced.md)
