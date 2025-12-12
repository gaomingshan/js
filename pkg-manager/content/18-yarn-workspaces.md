# Yarn Workspaces

## 概述

Yarn Workspaces 是 Yarn 的 Monorepo 解决方案，比 npm workspaces 更成熟，功能更强大。

## 一、基础配置

### 1.1 初始化

```json
// 根 package.json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

### 1.2 目录结构

```
my-monorepo/
├── package.json
├── yarn.lock
├── node_modules/
└── packages/
    ├── package-a/
    │   └── package.json
    └── package-b/
        └── package.json
```

## 二、依赖管理

### 2.1 自动提升

```bash
yarn install

# 结果：
node_modules/
├── react/           # 提升的公共依赖
└── lodash/
```

### 2.2 nohoist（阻止提升）

```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/react-native",
      "**/react-native/**"
    ]
  }
}
```

**使用场景：**
- React Native（需要扁平结构）
- 特定工具链要求

## 三、workspace 协议

### 3.1 引用其他 workspace

```json
// packages/package-b/package.json
{
  "dependencies": {
    "package-a": "workspace:^1.0.0"
  }
}
```

**发布时自动替换：**
```json
{
  "dependencies": {
    "package-a": "^1.0.0"
  }
}
```

### 3.2 workspace 协议版本

```json
{
  "dependencies": {
    "pkg": "workspace:*",      // 任意版本
    "pkg": "workspace:^",      // 遵循 package.json 版本范围
    "pkg": "workspace:~",      // ~版本范围
    "pkg": "workspace:^1.0.0"  // 指定版本范围
  }
}
```

## 四、批量操作

### 4.1 在所有 workspace 运行命令

```bash
# 运行所有 workspace 的 build
yarn workspaces run build

# 运行所有 workspace 的测试
yarn workspaces run test
```

### 4.2 在特定 workspace 运行

```bash
# 为 package-a 添加依赖
yarn workspace package-a add lodash

# 运行 package-a 的脚本
yarn workspace package-a run dev
```

### 4.3 foreach（Yarn Berry）

```bash
# 串行执行
yarn workspaces foreach run build

# 并行执行
yarn workspaces foreach -p run test

# 拓扑排序（按依赖顺序）
yarn workspaces foreach -pt run build
```

## 五、依赖关系

### 5.1 查看依赖图

```bash
yarn workspaces info

# 输出：
{
  "package-a": {
    "location": "packages/package-a",
    "workspaceDependencies": []
  },
  "package-b": {
    "location": "packages/package-b",
    "workspaceDependencies": [
      "package-a"
    ]
  }
}
```

### 5.2 为什么安装了这个包

```bash
yarn why lodash
```

## 六、发布工作流

### 6.1 版本管理

```bash
# 更新所有 workspace 版本
yarn workspaces foreach version patch

# 更新特定 workspace
yarn workspace package-a version minor
```

### 6.2 发布

```bash
# 发布特定 workspace
yarn workspace package-a npm publish

# 发布所有 workspaces
yarn workspaces foreach npm publish
```

## 七、实际应用

### 7.1 共享配置

```
my-monorepo/
├── tsconfig.base.json
├── .eslintrc.js
└── packages/
    ├── package-a/
    │   └── tsconfig.json  # 继承 base
    └── package-b/
        └── tsconfig.json
```

### 7.2 统一脚本

```json
{
  "scripts": {
    "build": "yarn workspaces run build",
    "test": "yarn workspaces run test",
    "clean": "yarn workspaces run clean",
    "dev:a": "yarn workspace package-a run dev"
  }
}
```

## 八、最佳实践

### 8.1 推荐结构

```
my-monorepo/
├── package.json
├── packages/          # 库
│   ├── ui/
│   └── utils/
├── apps/              # 应用
│   ├── web/
│   └── admin/
└── tools/             # 工具
    └── scripts/
```

### 8.2 版本策略

**固定版本：**
```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "version": "1.0.0"
  }
}
```

**独立版本：**
每个 workspace 独立管理版本。

## 参考资料

- [Yarn Workspaces 文档](https://yarnpkg.com/features/workspaces)

---

**导航**  
[上一章：Yarn基础命令](./17-yarn-commands.md) | [返回目录](../README.md) | [下一章：Yarn Plug'n'Play](./19-yarn-pnp.md)
