# Yarn 基础命令

## 概述

Yarn 命令与 npm 类似但更简洁。本章介绍 Yarn 的常用命令和用法。

## 一、依赖安装

### 1.1 安装所有依赖

```bash
yarn
# 或
yarn install
```

**特点：**
- 根据 yarn.lock 安装
- 并行下载
- 自动更新 yarn.lock

### 1.2 添加依赖

```bash
# 添加到 dependencies
yarn add lodash

# 添加到 devDependencies
yarn add -D typescript
yarn add --dev typescript

# 添加 peer 依赖
yarn add --peer react

# 精确版本
yarn add lodash@4.17.21 --exact
```

### 1.3 移除依赖

```bash
yarn remove lodash
```

## 二、更新依赖

### 2.1 更新单个包

```bash
# 更新到最新版本（遵循 package.json 范围）
yarn upgrade lodash

# 更新到最新版本（忽略范围）
yarn upgrade lodash --latest
```

### 2.2 交互式更新

```bash
yarn upgrade-interactive

# 只显示需要更新的
yarn upgrade-interactive --latest
```

**输出示例：**
```
? Choose which packages to update:
  ❯◯ lodash   4.17.20  ❯  4.17.21
   ◯ react    17.0.0   ❯  18.2.0
   ◯ axios    0.27.0   ❯  1.4.0
```

## 三、查看依赖

### 3.1 查看依赖树

```bash
# 查看所有依赖
yarn list

# 只显示顶层
yarn list --depth=0

# 查看特定包
yarn list --pattern lodash
```

### 3.2 查看包信息

```bash
# 查看包版本
yarn info lodash version

# 查看所有信息
yarn info lodash
```

### 3.3 为什么安装了这个包

```bash
yarn why lodash

# 输出：
# => Found "lodash@4.17.21"
# info Reasons this module exists
#    - "package-a" depends on it
#    - Hoisted from "package-a#lodash"
```

## 四、脚本命令

### 4.1 运行脚本

```bash
# 运行 scripts
yarn dev
yarn build

# 传递参数
yarn dev --port 3000
```

**无需 run：**
```bash
yarn dev        # ✅ 直接运行
npm run dev     # npm 需要 run
```

## 五、Workspaces 命令

### 5.1 在 workspace 中运行命令

```bash
# 在特定 workspace 运行
yarn workspace package-a add lodash

# 在所有 workspaces 运行
yarn workspaces run build

# 列出所有 workspaces
yarn workspaces list
```

### 5.2 执行脚本

```bash
# 在所有 workspace 运行测试
yarn workspaces foreach run test

# 并行运行
yarn workspaces foreach -p run build
```

## 六、缓存管理

### 6.1 查看缓存

```bash
# 查看缓存目录
yarn cache dir

# 查看缓存内容
yarn cache list
```

### 6.2 清理缓存

```bash
yarn cache clean

# 清理特定包
yarn cache clean lodash
```

## 七、其他实用命令

### 7.1 检查完整性

```bash
yarn check --integrity
```

### 7.2 自动清理

```bash
# 清理无用文件
yarn autoclean --init
yarn autoclean --force
```

### 7.3 发布包

```bash
yarn publish

# 指定版本
yarn publish --new-version 1.0.1

# 指定 tag
yarn publish --tag beta
```

## 八、Yarn Berry 特殊命令

### 8.1 插件管理

```bash
# 安装插件
yarn plugin import typescript

# 列出插件
yarn plugin list
```

### 8.2 dlx（类似 npx）

```bash
# 临时运行包
yarn dlx create-react-app my-app

# 等同于
npx create-react-app my-app
```

## 九、命令速查表

| 操作 | Yarn | npm |
|------|------|-----|
| **安装** | `yarn` | `npm install` |
| **添加** | `yarn add pkg` | `npm install pkg` |
| **移除** | `yarn remove pkg` | `npm uninstall pkg` |
| **更新** | `yarn upgrade pkg` | `npm update pkg` |
| **全局** | `yarn global add` | `npm install -g` |
| **脚本** | `yarn dev` | `npm run dev` |
| **查看** | `yarn list` | `npm ls` |
| **清理** | `yarn cache clean` | `npm cache clean` |

## 参考资料

- [Yarn CLI 文档](https://yarnpkg.com/cli)

---

**导航**  
[上一章：Yarn简介与特性](./16-yarn-intro.md) | [返回目录](../README.md) | [下一章：Yarn Workspaces](./18-yarn-workspaces.md)
