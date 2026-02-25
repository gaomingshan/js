# package-lock.json 锁文件机制

## 概述

package-lock.json 是 npm 5+ 引入的锁文件，用于记录依赖树的精确状态，确保团队成员和 CI/CD 环境安装完全相同的依赖版本。理解锁文件机制是保证项目稳定性和可重现性的关键。

## 锁文件的作用

### 核心价值

**1. 确定性安装**
```bash
# 开发者 A（2023-07-01）
npm install
# 安装 lodash@4.17.20

# 开发者 B（2023-07-15，lodash 发布了 4.17.21）
npm install
# 有 lock 文件：仍安装 lodash@4.17.20 ✅
# 无 lock 文件：安装 lodash@4.17.21 ❌
```

**2. 锁定依赖树结构**
```
不仅锁定直接依赖版本
还锁定所有子依赖的版本和安装位置
```

**3. 提升安装速度**
```
有 lock 文件：
- 跳过依赖解析
- 直接下载指定版本
- 安装速度提升 2-3 倍
```

### 实际案例

**没有 lock 文件的风险：**
```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

```bash
# 2023-01-01 安装
npm install
# 安装 express@4.18.0 + 它的所有依赖

# 2023-06-01 安装（express 发布了 4.18.2）
npm install
# 安装 express@4.18.2 + 可能不同的依赖版本
# 可能引入新 Bug 或破坏性变更
```

**有 lock 文件：**
```bash
# 所有时间点安装
npm ci  # 或 npm install（如果 lock 文件未变）
# 始终安装相同版本
```

## 文件结构

### lockfileVersion

**版本演变：**
```json
{
  "lockfileVersion": 1,  // npm 5-6
  "lockfileVersion": 2,  // npm 7+（向后兼容 v1）
  "lockfileVersion": 3   // npm 9+（仅 v3 格式）
}
```

**版本 1（npm 5-6）：**
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
    "lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**版本 2（npm 7-8）：**
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "": {
      "name": "my-project",
      "version": "1.0.0",
      "dependencies": {
        "lodash": "^4.17.21"
      }
    },
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-..."
    }
  },
  "dependencies": {
    // v1 格式，向后兼容
  }
}
```

### 核心字段

**version（版本）：**
```json
{
  "node_modules/express": {
    "version": "4.18.2"
  }
}
```

**resolved（下载地址）：**
```json
{
  "node_modules/express": {
    "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz"
  }
}
```

**integrity（完整性校验）：**
```json
{
  "node_modules/express": {
    "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ=="
  }
}
```

**子资源完整性（SRI）：**
```
算法：sha512
作用：验证下载的包未被篡改
```

**dependencies（依赖）：**
```json
{
  "node_modules/express": {
    "version": "4.18.2",
    "dependencies": {
      "body-parser": "1.20.1",
      "cookie": "0.5.0"
    }
  }
}
```

**dev（开发依赖标记）：**
```json
{
  "node_modules/webpack": {
    "version": "5.88.0",
    "dev": true  // 标记为 devDependency
  }
}
```

**optional（可选依赖标记）：**
```json
{
  "node_modules/fsevents": {
    "version": "2.3.2",
    "optional": true
  }
}
```

## lock 文件生成时机

### 首次安装

```bash
# 项目没有 lock 文件
npm install

# 流程：
1. 读取 package.json
2. 解析依赖树
3. 下载所有依赖
4. 生成 package-lock.json
```

### 添加新依赖

```bash
npm install axios

# 流程：
1. 更新 package.json（添加 axios）
2. 解析 axios 的依赖
3. 下载 axios 及其依赖
4. 更新 package-lock.json
```

### 更新依赖

```bash
npm update lodash

# 流程：
1. 检查 lodash 的新版本（符合 package.json 范围）
2. 下载新版本
3. 更新 package-lock.json 中的版本和 integrity
```

### 不生成 lock 文件的场景

```bash
# 全局安装
npm install -g typescript  # 不生成 lock

# package.json 中没有 name
{
  "dependencies": {}  # 缺少 name 字段
}
```

## lock 文件与 package.json 的关系

### 同步规则

**package.json 是源，lock 文件是结果：**
```
package.json 变化 → 更新 lock 文件
lock 文件变化 ← 不影响 package.json
```

**npm install 行为：**
```bash
# 情况 1：lock 文件与 package.json 一致
npm install
# → 使用 lock 文件，快速安装

# 情况 2：package.json 新增依赖
npm install
# → 解析新依赖，更新 lock 文件

# 情况 3：package.json 版本范围变宽
{
  "dependencies": {
    "lodash": "^4.17.0"  // 原来是 "^4.17.21"
  }
}
npm install
# → 检查是否有更新，可能更新 lock 文件

# 情况 4：package.json 版本范围变窄
{
  "dependencies": {
    "lodash": "~4.17.21"  // 原来是 "^4.17.21"
  }
}
npm install
# → 重新解析，更新 lock 文件
```

### 冲突检测

**npm 5-6：**
```bash
npm install
# 自动更新 lock 文件以匹配 package.json
```

**npm 7+：**
```bash
npm install
# 如果 lock 文件冲突，报错
npm ERR! The package-lock.json file is outdated

# 解决：
npm install --legacy-peer-deps
# 或
rm package-lock.json && npm install
```

## npm ci 命令

### 与 npm install 的区别

| 特性 | npm install | npm ci |
|------|-------------|--------|
| **速度** | 较慢 | 快 2-3 倍 |
| **依据** | package.json + lock | 仅 lock 文件 |
| **行为** | 可能更新 lock | 严格按 lock 安装 |
| **node_modules** | 增量更新 | 先删除再安装 |
| **适用场景** | 开发环境 | **CI/CD** |
| **lock 不存在** | 生成 | 报错 |

### npm ci 工作流程

```bash
npm ci

# 步骤：
1. 检查 package-lock.json 是否存在（不存在则报错）
2. 检查 lock 与 package.json 是否一致（不一致则报错）
3. 删除整个 node_modules 目录
4. 严格按照 lock 文件安装
5. 不会修改 package.json 或 lock 文件
```

**报错示例：**
```bash
npm ci
npm ERR! package-lock.json not found

npm ci
npm ERR! package-lock.json is outdated
```

### CI/CD 最佳实践

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci  # ✅ 使用 ci，不是 install
      
      - name: Run tests
        run: npm test
```

**优势：**
- 确定性：所有构建使用相同依赖
- 速度快：跳过依赖解析
- 避免意外：不会修改文件

## lock 文件冲突解决

### 冲突产生场景

**多人协作：**
```
开发者 A：
1. npm install packageA
2. 提交 lock 文件

开发者 B：
1. npm install packageB
2. 提交 lock 文件

合并时：package-lock.json 冲突
```

### 解决策略

**策略 1：使用最新的 npm**
```bash
# npm 7+ 有更好的合并支持
npm install -g npm@latest
```

**策略 2：手动解决（不推荐）**
```bash
# Git 合并冲突
git checkout --theirs package-lock.json  # 使用他们的
# 或
git checkout --ours package-lock.json    # 使用我们的

# 重新生成
npm install
```

**策略 3：删除重建（推荐）**
```bash
# 解决冲突时
git checkout main package-lock.json  # 使用主分支版本
rm -rf node_modules
npm install  # 重新生成 lock 文件
npm test  # 确保一切正常
git add package-lock.json
git commit -m "resolve lock file conflict"
```

**策略 4：使用 npm ci + install**
```bash
# 1. 拉取最新代码
git pull

# 2. 清理安装
rm -rf node_modules package-lock.json

# 3. 重新安装
npm install

# 4. 提交
git add package-lock.json
git commit -m "regenerate lock file"
```

## lock 文件最佳实践

### 1. 始终提交 lock 文件

**.gitignore 不应包含：**
```gitignore
node_modules/
.DS_Store
.env

# ❌ 不要忽略 lock 文件
# package-lock.json
```

**原因：**
- 确保团队安装相同版本
- CI/CD 可重现构建
- 避免"我这里能跑"问题

### 2. CI/CD 使用 npm ci

```yaml
# ✅ 推荐
- run: npm ci

# ❌ 不推荐
- run: npm install
```

### 3. 定期更新依赖

```bash
# 查看过时依赖
npm outdated

# 更新到 package.json 允许的最新版本
npm update

# 更新并提交 lock 文件
git add package-lock.json
git commit -m "chore: update dependencies"
```

### 4. 审查 lock 文件变更

```bash
# 查看 lock 文件变更
git diff package-lock.json

# 确保变更符合预期
# - 新增的包是否合理
# - 版本更新是否安全
# - 是否有意外的大版本升级
```

### 5. 处理 lock 文件冲突

```bash
# 拉取最新代码
git pull

# 如果有冲突
rm -rf node_modules package-lock.json
npm install
npm test  # 确保正常工作

# 提交
git add package-lock.json
git commit
```

## 深入一点：lockfileVersion 差异

### Version 1（npm 5-6）

**特点：**
- 扁平结构
- 仅记录 dependencies 树
- 不包含根项目信息

**示例：**
```json
{
  "lockfileVersion": 1,
  "dependencies": {
    "lodash": {
      "version": "4.17.21",
      "resolved": "...",
      "integrity": "..."
    }
  }
}
```

### Version 2（npm 7-8）

**特点：**
- 同时包含 v1 和 v2 格式（兼容性）
- 新增 packages 字段
- 包含根项目信息

**示例：**
```json
{
  "lockfileVersion": 2,
  "packages": {
    "": {
      "name": "my-project",
      "version": "1.0.0"
    },
    "node_modules/lodash": {
      "version": "4.17.21"
    }
  },
  "dependencies": {
    "lodash": {
      "version": "4.17.21"
    }
  }
}
```

### Version 3（npm 9+）

**特点：**
- 仅保留 packages 格式
- 不再向后兼容 v1
- 文件更小

**示例：**
```json
{
  "lockfileVersion": 3,
  "packages": {
    "": {
      "name": "my-project"
    },
    "node_modules/lodash": {
      "version": "4.17.21"
    }
  }
}
```

### 版本兼容性

```
npm 5-6：只支持 lockfileVersion 1
npm 7-8：支持 1 和 2，默认生成 2
npm 9+：支持 2 和 3，默认生成 3
```

**向下兼容问题：**
```bash
# npm 9 生成的 v3 lock 文件
# npm 6 无法使用

# 解决：锁定 lockfileVersion
npm config set lockfileVersion 2
```

## yarn.lock 与 pnpm-lock.yaml

### yarn.lock

**格式：**
```yaml
# This file is generated by running "yarn install"

lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-...
```

**特点：**
- YAML 格式
- 更简洁
- 冲突更容易解决

### pnpm-lock.yaml

**格式：**
```yaml
lockfileVersion: 5.4

specifiers:
  lodash: ^4.17.21

dependencies:
  lodash: 4.17.21

packages:
  /lodash/4.17.21:
    resolution: {integrity: sha512-...}
    dev: false
```

**特点：**
- 更详细的依赖信息
- 支持 workspace
- 严格的依赖隔离

### 迁移

```bash
# npm → yarn
yarn import  # 从 package-lock.json 生成 yarn.lock

# npm → pnpm
pnpm import  # 从 package-lock.json 生成 pnpm-lock.yaml
```

## 常见问题

### 问题 1：lock 文件频繁变动

**原因：**
- 团队使用不同 npm 版本
- lockfileVersion 不一致

**解决：**
```bash
# 统一 npm 版本
npm install -g npm@9

# 或使用 .nvmrc
echo "18" > .nvmrc
nvm use

# 统一 lockfileVersion
npm config set lockfileVersion 2
```

### 问题 2：lock 文件过大

**现象：**
```bash
du -h package-lock.json
# 10MB+
```

**优化：**
```bash
# 去重依赖
npm dedupe

# 移除未使用的包
npm prune

# 重新生成
rm package-lock.json
npm install
```

### 问题 3：CI/CD 安装失败

**错误：**
```
npm ERR! The package-lock.json file is outdated
```

**解决：**
```bash
# 本地更新 lock 文件
npm install

# 或在 CI 中使用
npm install --legacy-peer-deps
```

### 问题 4：lock 文件与 package.json 不同步

**检测：**
```bash
# 检查一致性
npm install --dry-run

# 如果不一致
npm install  # 更新 lock 文件
```

## 安全性考虑

### integrity 校验

**作用：**
```json
{
  "node_modules/express": {
    "integrity": "sha512-..."
  }
}
```

**验证流程：**
```
1. 下载包
2. 计算哈希值
3. 与 lock 文件中的 integrity 比对
4. 不匹配则报错（防止篡改）
```

### 锁定 registry

```json
{
  "node_modules/lodash": {
    "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
  }
}
```

**防止：**
- 包替换攻击
- 中间人攻击

### 审计 lock 文件变更

```bash
# 查看新增的包
git diff package-lock.json | grep '+"'

# 检查可疑包
npm audit
```

## 工具推荐

### lockfile-lint

```bash
# 安装
npm install -g lockfile-lint

# 验证 lock 文件
lockfile-lint --path package-lock.json --type npm \
  --allowed-hosts npm --allowed-schemes https:
```

### lock 文件可视化

```bash
# 可视化依赖树
npx npm-lockfile-viz

# 生成 HTML 报告
npx npm-lockfile-viz --depth 2 > deps.html
```

## 参考资料

- [package-lock.json 官方文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)
- [npm ci 文档](https://docs.npmjs.com/cli/v9/commands/npm-ci)
- [lockfileVersion 变更](https://github.com/npm/rfcs/blob/main/implemented/0042-lockfileVersion-3.md)

---

**上一章：**[依赖解析算法与扁平化机制](./content-6.md)  
**下一章：**[npm install 深入解析](./content-8.md)
