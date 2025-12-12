# 依赖版本管理

## 概述

版本管理是包管理器的核心功能。理解语义化版本、版本范围和锁文件，能够有效控制依赖更新和避免版本冲突。

## 一、语义化版本（Semver）

### 1.1 版本号格式

```
MAJOR.MINOR.PATCH
主版本号.次版本号.修订号

示例：1.2.3
```

**变更规则：**
- **MAJOR**：不兼容的 API 变更
- **MINOR**：向后兼容的功能新增
- **PATCH**：向后兼容的问题修复

### 1.2 版本号示例

```
1.0.0  →  1.0.1   (PATCH: 修复bug)
1.0.1  →  1.1.0   (MINOR: 新增功能)
1.1.0  →  2.0.0   (MAJOR: 破坏性变更)
```

### 1.3 先行版本

```
1.0.0-alpha.1    (Alpha 测试版)
1.0.0-beta.1     (Beta 测试版)
1.0.0-rc.1       (Release Candidate)
1.0.0            (正式版)
```

## 二、版本范围语法

### 2.1 精确版本

```json
{
  "dependencies": {
    "lodash": "4.17.21"
  }
}
```
只安装 `4.17.21`

### 2.2 插入符号（^）⭐ 最常用

```json
{
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

**规则：** 允许 MINOR 和 PATCH 更新

```
^1.2.3  →  >=1.2.3 <2.0.0
^0.2.3  →  >=0.2.3 <0.3.0   (0.x 特殊处理)
^0.0.3  →  >=0.0.3 <0.0.4   (0.0.x 精确到 PATCH)
```

**示例：**
```
^18.2.0 匹配：
✅ 18.2.0
✅ 18.2.1
✅ 18.3.0
✅ 18.99.99
❌ 19.0.0
```

### 2.3 波浪号（~）

```json
{
  "dependencies": {
    "axios": "~1.4.0"
  }
}
```

**规则：** 只允许 PATCH 更新

```
~1.2.3  →  >=1.2.3 <1.3.0
~1.2    →  >=1.2.0 <1.3.0
~1      →  >=1.0.0 <2.0.0
```

**示例：**
```
~1.4.0 匹配：
✅ 1.4.0
✅ 1.4.1
✅ 1.4.99
❌ 1.5.0
```

### 2.4 比较运算符

```json
{
  "dependencies": {
    "vue": ">=3.0.0 <4.0.0",
    "react": ">16.0.0",
    "lodash": "<=4.17.21"
  }
}
```

### 2.5 通配符

```json
{
  "dependencies": {
    "express": "4.x",      // >=4.0.0 <5.0.0
    "lodash": "4.17.*",    // >=4.17.0 <4.18.0
    "webpack": "*"         // 任意版本（不推荐）
  }
}
```

### 2.6 特殊关键字

```json
{
  "dependencies": {
    "typescript": "latest",   // 最新版本
    "react": "next"           // 下一个版本（通常是 beta）
  }
}
```

## 三、package-lock.json

### 3.1 作用

**没有 lock 文件：**
```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}

// 第一次安装：4.17.20
// 第二次安装：4.17.21（新版本发布）
// ❌ 不同时间，版本不一致
```

**有了 lock 文件：**
```json
// package-lock.json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.20",  // 锁定精确版本
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

### 3.2 lock 文件结构

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "": {
      "name": "my-app",
      "version": "1.0.0",
      "dependencies": {
        "lodash": "^4.17.21"
      }
    },
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="
    }
  }
}
```

**关键字段：**
- `version`：精确版本号
- `resolved`：下载地址
- `integrity`：完整性校验（防篡改）

### 3.3 lock 文件版本

| lockfileVersion | npm 版本 | 特点 |
|-----------------|----------|------|
| 1 | npm 5/6 | 旧格式 |
| 2 | npm 7+ | 新格式，向后兼容 |
| 3 | npm 9+ | 最新格式 |

### 3.4 lock 文件管理

**提交到版本控制：**
```bash
git add package-lock.json
git commit -m "update dependencies"
```

**更新 lock 文件：**
```bash
# 安装新包时自动更新
npm install lodash

# 手动更新
npm install
```

**删除并重新生成：**
```bash
rm package-lock.json
npm install
```

## 四、锁文件对比

### 4.1 三种锁文件

| 包管理器 | 锁文件 | 格式 |
|----------|--------|------|
| npm | package-lock.json | JSON |
| yarn | yarn.lock | YAML-like |
| pnpm | pnpm-lock.yaml | YAML |

### 4.2 yarn.lock 示例

```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
```

### 4.3 pnpm-lock.yaml 示例

```yaml
dependencies:
  lodash:
    specifier: ^4.17.21
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe...}
    dev: false
```

## 五、版本冲突处理

### 5.1 依赖冲突示例

```
A 依赖 C@^1.0.0
B 依赖 C@^2.0.0
```

**npm/yarn 处理：**
```
node_modules/
├── A/
├── B/
│   └── node_modules/
│       └── C@2.0.0/
└── C@1.0.0/
```

### 5.2 手动解决冲突

**方法1：resolutions（Yarn）**
```json
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}
```

**方法2：overrides（npm 8.3+）**
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

**方法3：pnpm overrides**
```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
```

## 六、版本更新策略

### 6.1 保守策略（~）

```json
{
  "dependencies": {
    "react": "~18.2.0"
  }
}
```

**适用：**
- 生产环境
- 稳定性第一

### 6.2 适中策略（^）⭐ 推荐

```json
{
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

**适用：**
- 大多数项目
- 平衡稳定性和新特性

### 6.3 激进策略（latest）

```json
{
  "dependencies": {
    "typescript": "latest"
  }
}
```

**适用：**
- 实验项目
- 紧跟最新特性

### 6.4 精确版本

```json
{
  "dependencies": {
    "react": "18.2.0"
  }
}
```

**适用：**
- 关键依赖
- 已知兼容版本

## 七、依赖更新工具

### 7.1 npm-check-updates (ncu)

```bash
# 安装
npm install -g npm-check-updates

# 检查可更新的包
ncu

# 更新 package.json
ncu -u

# 安装新版本
npm install
```

**示例输出：**
```
react      ^17.0.0  →  ^18.2.0
lodash     ^4.17.20 →  ^4.17.21
```

### 7.2 npm outdated

```bash
npm outdated

# 输出：
Package  Current  Wanted  Latest
lodash   4.17.20  4.17.21 4.17.21
react    17.0.0   17.0.2  18.2.0
```

### 7.3 自动化工具

**Dependabot（GitHub）：**
- 自动检测依赖更新
- 自动创建 PR

**Renovate：**
- 更强大的自动更新
- 支持多种包管理器

## 八、最佳实践

### 8.1 推荐配置

```json
{
  "dependencies": {
    "react": "^18.2.0",        // ✅ 使用 ^
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "~5.0.0",    // ✅ 开发工具更保守
    "eslint": "~8.40.0"
  }
}
```

### 8.2 版本选择建议

```json
{
  "dependencies": {
    // ✅ 推荐：主流包使用 ^
    "react": "^18.2.0",
    
    // ✅ 推荐：关键依赖精确版本
    "某个已知兼容版本": "1.2.3",
    
    // ❌ 不推荐：过于宽泛
    "lodash": "*",
    "axios": ">=1.0.0"
  }
}
```

### 8.3 lock 文件管理

```bash
# ✅ 推荐：提交 lock 文件
git add package-lock.json
git commit

# ✅ 推荐：CI/CD 使用 npm ci
npm ci

# ❌ 不推荐：忽略 lock 文件
echo "package-lock.json" >> .gitignore
```

## 九、常见问题

### 9.1 lock 文件冲突

**场景：** 多人协作时 lock 文件冲突

**解决：**
```bash
# 删除 lock 文件
rm package-lock.json

# 重新安装
npm install

# 提交新的 lock 文件
git add package-lock.json
git commit
```

### 9.2 package.json 和 lock 文件不一致

```bash
# 更新 lock 文件
npm install

# 或强制更新
rm package-lock.json
npm install
```

### 9.3 锁定所有依赖到精确版本

```bash
# 使用 npm shrinkwrap
npm shrinkwrap

# 生成 npm-shrinkwrap.json
# 优先级高于 package-lock.json
```

## 参考资料

- [Semver 语义化版本](https://semver.org/lang/zh-CN/)
- [package-lock.json 文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

---

**导航**  
[上一章：npm scripts脚本](./08-npm-scripts.md) | [返回目录](../README.md) | [下一章：npm link本地开发](./10-npm-link.md)
