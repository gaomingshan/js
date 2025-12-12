# pnpm 基础使用

## 概述

pnpm 的命令与 npm 高度兼容，学习成本低。本章介绍 pnpm 的安装、配置和常用命令。

## 一、安装 pnpm

### 1.1 使用 npm 安装

```bash
npm install -g pnpm

# 验证
pnpm --version
# 8.6.0
```

### 1.2 使用独立脚本

```bash
# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 1.3 使用 Corepack（推荐）

```bash
# Node.js 16.13+ 内置
corepack enable
corepack prepare pnpm@latest --activate
```

**package.json 声明：**
```json
{
  "packageManager": "pnpm@8.6.0"
}
```

## 二、基础命令

### 2.1 安装依赖

```bash
# 安装所有依赖
pnpm install
pnpm i  # 简写

# 添加依赖
pnpm add lodash
pnpm add -D typescript
pnpm add --save-peer react

# 全局安装
pnpm add -g typescript
```

### 2.2 移除依赖

```bash
pnpm remove lodash
pnpm rm lodash  # 简写
```

### 2.3 更新依赖

```bash
# 更新所有依赖
pnpm update

# 更新指定包
pnpm update lodash

# 交互式更新
pnpm update -i
```

## 三、pnpm-lock.yaml

### 3.1 锁文件结构

```yaml
lockfileVersion: '6.0'

dependencies:
  lodash:
    specifier: ^4.17.21
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe...}
    dev: false
```

**特点：**
- 更简洁（相比 package-lock.json）
- 人类可读
- 包含完整性哈希

### 3.2 导入 lock 文件

```bash
# 从 package-lock.json 导入
pnpm import

# 从 yarn.lock 导入
pnpm import
```

## 四、配置

### 4.1 .npmrc 配置

```ini
# pnpm 配置
shamefully-hoist=false        # 不提升依赖
strict-peer-dependencies=true # 严格 peer 依赖
auto-install-peers=true       # 自动安装 peer 依赖

# 镜像源
registry=https://registry.npmmirror.com

# store 位置
store-dir=~/.pnpm-store
```

### 4.2 查看配置

```bash
# 查看所有配置
pnpm config list

# 查看单个配置
pnpm config get store-dir

# 设置配置
pnpm config set store-dir /path/to/store
```

## 五、store 管理

### 5.1 查看 store

```bash
# store 路径
pnpm store path
# ~/.pnpm-store

# store 状态
pnpm store status
```

### 5.2 清理 store

```bash
# 清理未使用的包
pnpm store prune

# 查看可节省的空间
pnpm store prune --dry-run
```

## 六、其他实用命令

### 6.1 查看依赖

```bash
# 查看依赖树
pnpm list
pnpm ls

# 只显示顶层
pnpm ls --depth 0

# 查看全局包
pnpm ls -g
```

### 6.2 查看包信息

```bash
pnpm view lodash

# 查看版本
pnpm view lodash version
pnpm view lodash versions
```

### 6.3 运行脚本

```bash
# 运行 scripts
pnpm dev
pnpm build

# 等同于 npm run
pnpm run dev
```

### 6.4 执行包命令

```bash
# 执行本地包
pnpm exec eslint .

# 临时运行包（类似 npx）
pnpm dlx create-react-app my-app
```

## 七、迁移到 pnpm

### 7.1 迁移步骤

```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 删除旧文件
rm -rf node_modules
rm package-lock.json  # 或 yarn.lock

# 3. 导入 lock 文件（可选）
pnpm import

# 4. 安装依赖
pnpm install
```

### 7.2 修复问题

**常见错误：** 找不到模块（幽灵依赖）

```bash
# pnpm 会报错并提示缺失的依赖
pnpm install
# ERR_PNPM_MISSING_PEER_DEPENDENCY

# 添加缺失的依赖
pnpm add missing-package
```

## 八、性能对比

### 8.1 安装速度测试

```bash
# 清理缓存
pnpm store prune
npm cache clean --force

# 测试安装（Vue 3 + 200+ 依赖）
time npm install    # 45s
time yarn install   # 28s
time pnpm install   # 14s ⚡
```

### 8.2 磁盘占用对比

```bash
# 10个相同项目
du -sh */node_modules | tail -1

npm:   520MB × 10 = 5.2GB
yarn:  500MB × 10 = 5.0GB
pnpm:  180MB store + 链接 = 1.8GB
```

## 九、兼容性

### 9.1 与 npm 兼容

**大部分 npm 命令可直接使用：**
```bash
pnpm install
pnpm add package
pnpm remove package
pnpm update
pnpm run script
```

### 9.2 与工具集成

**支持的工具：**
- ✅ Vite
- ✅ Webpack
- ✅ Rollup
- ✅ TypeScript
- ✅ ESLint
- ✅ Prettier

**可能需要配置的工具：**
- ⚠️ 某些旧的构建工具
- ⚠️ 依赖硬编码 node_modules 路径的工具

## 十、命令速查表

| 操作 | npm | pnpm |
|------|-----|------|
| **安装** | `npm install` | `pnpm install` |
| **添加** | `npm install pkg` | `pnpm add pkg` |
| **移除** | `npm uninstall pkg` | `pnpm remove pkg` |
| **更新** | `npm update` | `pnpm update` |
| **脚本** | `npm run dev` | `pnpm dev` |
| **全局** | `npm install -g` | `pnpm add -g` |
| **执行** | `npx command` | `pnpm dlx command` |

## 参考资料

- [pnpm 官方文档](https://pnpm.io/)
- [pnpm CLI 参考](https://pnpm.io/cli/add)

---

**导航**  
[上一章：pnpm原理与优势](./21-pnpm-principle.md) | [返回目录](../README.md) | [下一章：pnpm Workspaces](./23-pnpm-workspaces.md)
