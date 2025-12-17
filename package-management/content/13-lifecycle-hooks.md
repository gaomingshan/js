# npm 生命周期钩子

## 概述

npm 提供了丰富的生命周期钩子，允许在特定时机自动执行脚本。理解这些钩子能够自动化工作流程。

## 一、生命周期概览

### 1.1 常用生命周期

```
npm install:
  preinstall → install → postinstall → 
  prepublish → preprepare → prepare → postprepare

npm publish:
  prepublishOnly → prepack → prepare → postpack → 
  publish → postpublish

npm version:
  preversion → version → postversion
```

### 1.2 钩子分类

**install 相关：**
- `preinstall` - 安装前
- `install` - 安装时
- `postinstall` - 安装后

**publish 相关：**
- `prepublishOnly` - 发布前（推荐）
- `prepack` - 打包前
- `postpack` - 打包后

**version 相关：**
- `preversion` - 更新版本前
- `version` - 更新版本时
- `postversion` - 更新版本后

## 二、install 生命周期

### 2.1 典型用法

```json
{
  "scripts": {
    "preinstall": "node scripts/check-node-version.js",
    "install": "node-gyp rebuild",
    "postinstall": "patch-package"
  }
}
```

### 2.2 preinstall - 环境检查

```javascript
// scripts/check-node-version.js
const { engines } = require('../package.json');
const currentVersion = process.version;

if (!require('semver').satisfies(currentVersion, engines.node)) {
  console.error(`需要 Node.js ${engines.node}，当前版本 ${currentVersion}`);
  process.exit(1);
}
```

### 2.3 postinstall - 自动修复

```json
{
  "scripts": {
    "postinstall": "patch-package"
  },
  "devDependencies": {
    "patch-package": "^7.0.0"
  }
}
```

**使用场景：**
- 修复第三方包的 bug
- 编译原生模块
- 生成配置文件

## 三、prepare 钩子

### 3.1 什么是 prepare

`prepare` 在以下时机运行：
- `npm install`（无参数）
- `npm publish`
- 本地 `npm link`

### 3.2 构建项目

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

**作用：**
- ✅ 发布前自动构建
- ✅ 安装依赖后自动构建
- ✅ 适合 TypeScript 项目

### 3.3 安装 Git Hooks

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.0"
  }
}
```

## 四、publish 生命周期

### 4.1 prepublishOnly（推荐）

```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build"
  }
}
```

**特点：**
- 只在 `npm publish` 时运行
- 不在 `npm install` 时运行
- 适合发布前检查

### 4.2 完整发布流程

```json
{
  "scripts": {
    "prepublishOnly": "npm run test",
    "prepack": "npm run build",
    "postpack": "echo '打包完成'",
    "publish": "echo '发布中'",
    "postpublish": "npm run deploy-docs"
  }
}
```

**执行顺序：**
```bash
npm publish
# → prepublishOnly
# → prepack
# → prepare (如果有)
# → postpack
# → publish
# → postpublish
```

## 五、version 生命周期

### 5.1 自动化版本管理

```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

**执行流程：**
```bash
npm version patch
# 1. preversion: 运行测试
# 2. 更新 package.json 版本号
# 3. version: 构建并提交
# 4. 创建 git tag
# 5. postversion: 推送代码和 tag
```

### 5.2 更新 CHANGELOG

```json
{
  "scripts": {
    "version": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md"
  }
}
```

## 六、pre 和 post 钩子

### 6.1 自动添加

任何脚本都可以有 pre/post 钩子：

```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "tsc",
    "postbuild": "npm run copy-assets"
  }
}
```

**执行：**
```bash
npm run build
# → prebuild → build → postbuild
```

### 6.2 钩子链

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "preclean": "echo '准备清理'",
    "postclean": "echo '清理完成'"
  }
}
```

```bash
npm run clean
# → preclean → clean → postclean
```

## 七、实际应用场景

### 7.1 TypeScript 项目

```json
{
  "scripts": {
    "prepare": "tsc",
    "prepublishOnly": "npm test && npm run lint",
    "preversion": "npm run lint",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

### 7.2 Monorepo 项目

```json
{
  "scripts": {
    "postinstall": "lerna bootstrap",
    "prepare": "lerna run build"
  }
}
```

### 7.3 原生模块

```json
{
  "scripts": {
    "install": "node-gyp rebuild"
  }
}
```

### 7.4 自动化工具链

```json
{
  "scripts": {
    "prepare": "husky install",
    "postinstall": "patch-package",
    "prepublishOnly": "npm run test && npm run build",
    "preversion": "npm run lint",
    "version": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md",
    "postversion": "git push --follow-tags"
  }
}
```

## 八、注意事项

### 8.1 避免在 postinstall 中做重操作

**❌ 不推荐：**
```json
{
  "scripts": {
    "postinstall": "webpack"
  }
}
```

**原因：**
- 用户安装慢
- 可能失败导致安装中断

### 8.2 使用 prepublishOnly 而不是 prepublish

```json
{
  "scripts": {
    "prepublishOnly": "npm run build"  // ✅ 推荐
  }
}
```

**原因：** `prepublish` 在 `npm install` 时也会运行，已废弃。

### 8.3 钩子失败会阻止操作

```bash
npm publish
# prepublishOnly 失败 → 中止发布
```

## 九、调试钩子

### 9.1 查看执行日志

```bash
npm publish --loglevel verbose
```

### 9.2 测试钩子

```bash
# 测试 prepublishOnly
npm run prepublishOnly

# 测试 version 流程
npm version patch --dry-run
```

## 参考资料

- [npm scripts 生命周期](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts)
- [package.json scripts](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#scripts)

---

**导航**  
[上一章：npm包开发最佳实践](./12-package-development.md) | [返回目录](../README.md) | [下一章：npm安全](./14-npm-security.md)
