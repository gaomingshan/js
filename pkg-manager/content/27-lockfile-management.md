# 锁文件管理

## 概述

锁文件（Lock File）确保依赖的确定性安装。本章介绍三种锁文件的特点、管理策略和冲突处理。

## 一、三种锁文件对比

### 1.1 package-lock.json (npm)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe..."
    }
  }
}
```

**特点：**
- JSON 格式
- 详细但冗长
- npm 7+ 向后兼容

### 1.2 yarn.lock (Yarn)

```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-v2kDEe...
```

**特点：**
- YAML-like 格式
- 简洁易读
- Yarn 1.x 和 Berry 兼容

### 1.3 pnpm-lock.yaml (pnpm)

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
- YAML 格式
- 最简洁
- 包含 specifier 信息

## 二、提交策略

### 2.1 应该提交吗？

**✅ 推荐提交：**
- 应用项目
- CLI 工具
- 生产环境部署的项目

**❌ 可不提交：**
- 库项目（让使用者决定版本）

### 2.2 .gitignore 配置

**提交 lock 文件：**
```gitignore
# 不要忽略 lock 文件
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
```

**不提交（不推荐）：**
```gitignore
package-lock.json
yarn.lock
pnpm-lock.yaml
```

## 三、更新 Lock 文件

### 3.1 npm

```bash
# 添加新依赖（自动更新）
npm install lodash

# 更新现有依赖
npm update lodash

# 重新生成
rm package-lock.json
npm install
```

### 3.2 Yarn

```bash
# 添加新依赖
yarn add lodash

# 更新依赖
yarn upgrade lodash

# 重新生成
rm yarn.lock
yarn install
```

### 3.3 pnpm

```bash
# 添加新依赖
pnpm add lodash

# 更新依赖
pnpm update lodash

# 重新生成
rm pnpm-lock.yaml
pnpm install
```

## 四、合并冲突处理

### 4.1 冲突场景

```
<<<<<<< HEAD
  "lodash": "4.17.20"
=======
  "lodash": "4.17.21"
>>>>>>> feature-branch
```

### 4.2 解决方法

**方法1：接受一方版本**
```bash
# 接受当前分支
git checkout --ours package-lock.json

# 或接受合并分支
git checkout --theirs package-lock.json

# 重新安装
npm install
```

**方法2：重新生成**
```bash
# 删除 lock 文件
rm package-lock.json

# 合并 package.json
git merge feature-branch

# 重新安装
npm install

# 提交
git add package-lock.json
git commit
```

### 4.3 使用工具

**npm-merge-driver：**
```bash
# 安装
npm install -g npm-merge-driver

# 设置
npm-merge-driver install -g

# 自动合并 package-lock.json
```

## 五、Lock 文件审计

### 5.1 检查变更

```bash
# 查看 lock 文件变更
git diff package-lock.json

# 查看添加/删除的包
git diff package-lock.json | grep "+"
```

### 5.2 验证完整性

```bash
# npm
npm audit

# yarn
yarn audit

# pnpm
pnpm audit
```

### 5.3 CI 检查

```yaml
# .github/workflows/ci.yml
- name: Check lock file
  run: |
    npm install
    git diff --exit-code package-lock.json
```

## 六、Lock 文件迁移

### 6.1 npm → yarn

```bash
# 安装 Yarn
npm install -g yarn

# 导入 lock 文件
yarn import

# 删除旧文件
rm package-lock.json

# 安装
yarn install
```

### 6.2 yarn → pnpm

```bash
# 安装 pnpm
npm install -g pnpm

# 导入 lock 文件
pnpm import

# 删除旧文件
rm yarn.lock

# 安装
pnpm install
```

### 6.3 npm → pnpm

```bash
# 导入
pnpm import

# 删除
rm package-lock.json

# 安装
pnpm install
```

## 七、CI/CD 使用

### 7.1 npm ci

```bash
# 使用 lock 文件精确安装
npm ci

# 特点：
# - 删除 node_modules 重装
# - 严格按 lock 文件
# - 速度更快
```

### 7.2 yarn install --frozen-lockfile

```bash
# 不更新 lock 文件
yarn install --frozen-lockfile

# 如果不一致则失败
```

### 7.3 pnpm install --frozen-lockfile

```bash
# 严格模式
pnpm install --frozen-lockfile
```

## 八、最佳实践

### 8.1 始终提交 Lock 文件

```bash
# ✅ 推荐
git add package-lock.json
git commit -m "Update dependencies"
```

### 8.2 CI 使用严格模式

```yaml
# package.json
{
  "scripts": {
    "ci": "npm ci"
  }
}
```

### 8.3 定期审计

```bash
# 每周检查
npm audit
npm audit fix
```

### 8.4 文档化更新原因

```bash
git commit -m "Update lodash to 4.17.21 to fix security vulnerability CVE-2021-23337"
```

## 九、常见问题

### 9.1 Lock 文件过大

**原因：** 依赖过多

**解决：**
- 清理无用依赖
- 使用 pnpm（更简洁）

### 9.2 频繁冲突

**解决：**
- 定期同步主分支
- 使用 npm-merge-driver
- 重新生成 lock 文件

### 9.3 CI 安装失败

**检查：**
- lock 文件版本
- registry 可访问性
- 缓存是否损坏

## 参考资料

- [package-lock.json 文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)
- [yarn.lock 文档](https://yarnpkg.com/configuration/yarnrc#lockfile)
- [pnpm-lock.yaml 文档](https://pnpm.io/git#lockfiles)

---

**导航**  
[上一章：依赖冲突解决](./26-conflict-resolution.md) | [返回目录](../README.md) | [下一章：依赖更新策略](./28-update-strategy.md)
