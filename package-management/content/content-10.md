# npm scripts 与生命周期

## scripts 执行环境与 PATH

### 自动注入的 PATH

**问题**：为什么可以直接运行 `webpack`？

```json
{
  "scripts": {
    "build": "webpack"
  }
}
```

**原理**：npm 自动将 `node_modules/.bin` 添加到 PATH

**实际执行**：
```bash
# npm run build 时的 PATH
PATH=./node_modules/.bin:$PATH webpack
```

**验证**：
```bash
# 手动执行（失败）
webpack
# bash: webpack: command not found

# 通过 npm scripts 执行（成功）
npm run build
# 等价于：./node_modules/.bin/webpack
```

### 环境变量注入

**npm 提供的变量**：
```json
{
  "name": "my-app",
  "version": "1.2.3",
  "scripts": {
    "print-info": "echo $npm_package_name@$npm_package_version"
  }
}
```

**执行**：
```bash
npm run print-info
# 输出：my-app@1.2.3
```

**完整变量列表**：
```bash
npm_package_name=my-app
npm_package_version=1.2.3
npm_package_description=...
npm_package_scripts_build=webpack
npm_config_registry=https://registry.npmjs.org
npm_lifecycle_event=build  # 当前执行的 script 名称
```

**使用场景**：
```json
{
  "scripts": {
    "docker-tag": "docker tag app:latest app:$npm_package_version"
  }
}
```

---

## pre/post 钩子机制

### 自动钩子

**命名规范**：
```json
{
  "scripts": {
    "prebuild": "echo 'Before build'",
    "build": "webpack",
    "postbuild": "echo 'After build'"
  }
}
```

**执行顺序**：
```bash
npm run build
# 1. prebuild
# 2. build
# 3. postbuild
```

### 内置生命周期钩子

**install 相关**：
```json
{
  "scripts": {
    "preinstall": "echo 'Before install'",
    "install": "node-gyp rebuild",
    "postinstall": "patch-package",
    "prepublish": "npm run build",  // 已废弃
    "prepare": "husky install",
    "preprepare": "echo 'Before prepare'",
    "postprepare": "echo 'After prepare'"
  }
}
```

**完整执行顺序**：
```
npm install
├─ preinstall
├─ install
├─ postinstall
├─ prepublish (deprecated, use prepublishOnly)
├─ preprepare
├─ prepare
└─ postprepare
```

**publish 相关**：
```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build",
    "prepack": "echo 'Before pack'",
    "postpack": "echo 'After pack'",
    "publish": "echo 'Publishing'",
    "postpublish": "echo 'Published'"
  }
}
```

**执行顺序**：
```
npm publish
├─ prepublishOnly
├─ prepack
├─ pack
├─ postpack
├─ publish
└─ postpublish
```

### prepare vs prepublish

**历史问题**：`prepublish` 在 `npm install` 和 `npm publish` 都会执行

**现代实践**：
```json
{
  "scripts": {
    "prepare": "husky install",           // npm install 时执行
    "prepublishOnly": "npm run build"      // npm publish 时执行
  }
}
```

**使用场景**：
- `prepare`：Git hooks 设置、构建 TypeScript
- `prepublishOnly`：测试、构建产物

---

## 跨平台脚本兼容性

### 问题场景

**Unix 风格命令**：
```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "copy": "cp -r src dist"
  }
}
```

**Windows 执行失败**：
```
'rm' is not recognized as an internal or external command
```

### 解决方案 1：cross-env

**安装**：
```bash
npm install --save-dev cross-env
```

**使用**：
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

**原理**：统一环境变量设置方式
```bash
# Unix
NODE_ENV=production webpack

# Windows (cmd)
set NODE_ENV=production && webpack

# cross-env（跨平台）
cross-env NODE_ENV=production webpack
```

### 解决方案 2：rimraf / mkdirp

**文件操作**：
```bash
npm install --save-dev rimraf mkdirp
```

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "mkdir": "mkdirp dist/assets"
  }
}
```

### 解决方案 3：npm-run-all

**并行执行**：
```json
{
  "scripts": {
    "build:js": "webpack",
    "build:css": "sass src:dist",
    "build": "npm-run-all --parallel build:*"
  }
}
```

**串行执行**：
```json
{
  "scripts": {
    "deploy": "npm-run-all build test upload"
  }
}
```

### 解决方案 4：使用 Node.js 脚本

**复杂逻辑用 JS 实现**：
```json
{
  "scripts": {
    "clean": "node scripts/clean.js"
  }
}
```

```javascript
// scripts/clean.js
const fs = require('fs');
const path = require('path');

function clean(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

clean(path.join(__dirname, '../dist'));
```

---

## 脚本组合与任务编排

### 任务分层

**基础任务**：
```json
{
  "scripts": {
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "build": "webpack"
  }
}
```

**组合任务**：
```json
{
  "scripts": {
    "validate": "npm run lint && npm run typecheck && npm run test",
    "ci": "npm run validate && npm run build"
  }
}
```

### 并行 vs 串行

**并行（`&`）**：
```json
{
  "scripts": {
    "watch": "webpack --watch & nodemon server.js"
  }
}
```

**问题**：
- Unix 支持，Windows 不支持
- 进程管理困难

**推荐使用 npm-run-all**：
```json
{
  "scripts": {
    "watch:webpack": "webpack --watch",
    "watch:server": "nodemon server.js",
    "watch": "npm-run-all --parallel watch:*"
  }
}
```

### 条件执行

**使用 `&&` 和 `||`**：
```json
{
  "scripts": {
    "deploy": "npm run test && npm run build && npm run upload",
    "fallback": "npm run primary || npm run secondary"
  }
}
```

**复杂条件**：
```json
{
  "scripts": {
    "build": "node -e \"process.exit(process.env.CI ? 0 : 1)\" && npm run build:prod || npm run build:dev"
  }
}
```

---

## 常见误区

### 误区 1：scripts 中的命令必须全局安装

**错误理解**：
```bash
# 全局安装 webpack
npm install -g webpack

# 然后在 scripts 中使用
{
  "scripts": {
    "build": "webpack"
  }
}
```

**正确做法**：
```bash
# 本地安装（devDependencies）
npm install --save-dev webpack

# npm 自动找到 node_modules/.bin/webpack
{
  "scripts": {
    "build": "webpack"
  }
}
```

### 误区 2：忽略 scripts 的执行失败

**场景**：
```json
{
  "scripts": {
    "build": "webpack",
    "deploy": "npm run build && npm run upload"
  }
}
```

**如果 build 失败**：
```bash
npm run deploy
# build 失败 → deploy 停止（正确）
```

**强制继续（危险）**：
```json
{
  "scripts": {
    "deploy": "npm run build || true && npm run upload"
  }
}
```

### 误区 3：在 scripts 中使用相对路径

**问题**：
```json
{
  "scripts": {
    "build": "./scripts/build.sh"
  }
}
```

**在子目录执行**：
```bash
cd packages/app
npm run build
# Error: ./scripts/build.sh not found
```

**解决**：
```json
{
  "scripts": {
    "build": "node scripts/build.js"  # Node.js 解析相对于 package.json
  }
}
```

---

## 工程实践

### 场景 1：标准化项目脚本

**最佳实践**：
```json
{
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src",
    "typecheck": "tsc --noEmit",
    "validate": "npm-run-all --parallel lint typecheck test",
    "clean": "rimraf dist",
    "prebuild": "npm run clean",
    "prepare": "husky install",
    "prepublishOnly": "npm run validate && npm run build"
  }
}
```

### 场景 2：Monorepo 脚本管理

**根目录**：
```json
{
  "scripts": {
    "build": "lerna run build",
    "test": "lerna run test --stream",
    "publish": "lerna publish"
  }
}
```

**子包**：
```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest"
  }
}
```

**工作区过滤**：
```bash
# 只运行特定包的脚本
npm run build --workspace=packages/core

# 所有包
npm run build --workspaces
```

### 场景 3：自定义钩子传参

**使用 `--`**：
```json
{
  "scripts": {
    "test": "jest"
  }
}
```

```bash
# 传递参数
npm run test -- --watch
# 等价于：jest --watch

npm run test -- --testPathPattern=user
# 等价于：jest --testPathPattern=user
```

---

## 深入一点

### npm-lifecycle 的实现

**源码简化**：
```javascript
function runScript(pkg, event) {
  const script = pkg.scripts[event];
  if (!script) return;
  
  // 1. 运行 pre 钩子
  await runScript(pkg, `pre${event}`);
  
  // 2. 设置环境变量
  const env = {
    ...process.env,
    npm_package_name: pkg.name,
    npm_package_version: pkg.version,
    npm_lifecycle_event: event,
    PATH: `${pkg.path}/node_modules/.bin:${process.env.PATH}`
  };
  
  // 3. 运行脚本
  await exec(script, { env, cwd: pkg.path });
  
  // 4. 运行 post 钩子
  await runScript(pkg, `post${event}`);
}
```

### 脚本执行的 shell

**Unix/macOS**：
```bash
# 默认使用 sh
/bin/sh -c "webpack"
```

**Windows**：
```cmd
# 默认使用 cmd
cmd /c "webpack"
```

**指定 shell**：
```bash
npm config set script-shell "/bin/bash"
```

### 性能优化

**避免重复执行**：
```json
{
  "scripts": {
    "build:js": "webpack",
    "build:css": "sass src:dist",
    "build": "npm-run-all build:*",  // 串行
    "build:parallel": "npm-run-all --parallel build:*"  // 并行
  }
}
```

**时间对比**：
```
串行：2分钟
并行：40秒（节省 67%）
```

---

## 参考资料

- [npm scripts 文档](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [npm-run-all](https://github.com/mysticatea/npm-run-all)
- [cross-env](https://github.com/kentcdodds/cross-env)
