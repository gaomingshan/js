# npm scripts 脚本系统

## 概述

npm scripts 是 package.json 中的脚本系统，用于自动化项目任务。它是前端工程化的核心工具之一，可以运行测试、构建、部署等各种任务。理解 scripts 的工作机制和高级特性，能大幅提升开发效率。

## 基础用法

### 定义脚本

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "build": "webpack --mode production"
  }
}
```

### 运行脚本

```bash
# 运行脚本
npm run start
npm run test
npm run build

# 预定义脚本可以省略 run
npm start
npm test
npm stop
npm restart
```

**预定义脚本（可省略 run）：**
- `start`
- `stop`
- `restart`
- `test`

## 生命周期钩子

### 前置和后置脚本

**命名规则：**
```
pre<script>  # 前置脚本
<script>     # 主脚本
post<script> # 后置脚本
```

**示例：**
```json
{
  "scripts": {
    "prebuild": "rm -rf dist",
    "build": "webpack",
    "postbuild": "cp README.md dist/"
  }
}
```

**执行顺序：**
```bash
npm run build

# 实际执行：
1. npm run prebuild   # 删除 dist
2. npm run build      # 运行 webpack
3. npm run postbuild  # 复制文件
```

### 内置生命周期

**安装相关：**
```json
{
  "scripts": {
    "preinstall": "echo 'before install'",
    "install": "node-gyp rebuild",
    "postinstall": "node scripts/postinstall.js",
    
    "preuninstall": "echo 'before uninstall'",
    "uninstall": "rm -rf build",
    "postuninstall": "echo 'after uninstall'"
  }
}
```

**发布相关：**
```json
{
  "scripts": {
    "prepublishOnly": "npm run build",
    "prepack": "echo 'before pack'",
    "postpack": "echo 'after pack'",
    "prepare": "npm run build"
  }
}
```

**完整生命周期：**
```
npm install:
  preinstall → install → postinstall → 
  prepublish (废弃) → preprepare → prepare → postprepare

npm publish:
  prepublishOnly → prepack → prepare → postpack → publish → postpublish

npm pack:
  prepack → prepare → postpack
```

## 参数传递

### 使用 -- 传递参数

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

```bash
# 传递参数给 jest
npm run test -- --watch --coverage

# 等价于
jest --watch --coverage
```

### 使用环境变量

```json
{
  "scripts": {
    "dev": "NODE_ENV=development webpack",
    "build": "NODE_ENV=production webpack"
  }
}
```

**访问环境变量：**
```javascript
// webpack.config.js
const mode = process.env.NODE_ENV || 'development';
```

### 使用 npm_package_ 变量

**package.json 字段自动暴露为环境变量：**
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "config": {
    "port": "8080"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

```javascript
// server.js
console.log(process.env.npm_package_name);    // "my-app"
console.log(process.env.npm_package_version); // "1.0.0"
console.log(process.env.npm_package_config_port); // "8080"
```

### 使用 npm_config_ 变量

**.npmrc 配置也可访问：**
```ini
# .npmrc
custom_value=hello
```

```javascript
console.log(process.env.npm_config_custom_value); // "hello"
```

## 串行与并行执行

### 串行执行（&&）

```json
{
  "scripts": {
    "build": "npm run clean && npm run compile && npm run minify"
  }
}
```

**特点：**
- 顺序执行
- 前一个失败，后续不执行
- Unix 和 Windows 都支持

### 并行执行（&）

```json
{
  "scripts": {
    "dev": "npm run watch-css & npm run watch-js & npm run server"
  }
}
```

**问题：**
- `&` 在 Windows 不兼容
- 需要跨平台方案

### 使用 npm-run-all

**安装：**
```bash
npm install -D npm-run-all
```

**串行执行：**
```json
{
  "scripts": {
    "build": "npm-run-all clean compile minify"
  }
}
```

**并行执行：**
```json
{
  "scripts": {
    "dev": "npm-run-all --parallel watch:*",
    "watch:css": "...",
    "watch:js": "...",
    "watch:server": "..."
  }
}
```

**混合执行：**
```json
{
  "scripts": {
    "build": "npm-run-all clean --parallel build:*",
    "clean": "rm -rf dist",
    "build:css": "sass src:dist",
    "build:js": "webpack",
    "build:html": "pug src -o dist"
  }
}
```

### 使用 concurrently

```bash
npm install -D concurrently
```

```json
{
  "scripts": {
    "dev": "concurrently \"npm run watch-css\" \"npm run watch-js\" \"npm run server\""
  }
}
```

**优势：**
- 彩色输出
- 进程管理
- 自动重启

## 跨平台兼容性

### 问题

```json
{
  "scripts": {
    "clean": "rm -rf dist"  // ❌ Windows 不支持 rm
  }
}
```

### 解决方案

**使用 cross-env（环境变量）：**
```bash
npm install -D cross-env
```

```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

**使用 rimraf（删除文件）：**
```bash
npm install -D rimraf
```

```json
{
  "scripts": {
    "clean": "rimraf dist"
  }
}
```

**使用 mkdirp（创建目录）：**
```bash
npm install -D mkdirp
```

```json
{
  "scripts": {
    "mkdir": "mkdirp dist/assets"
  }
}
```

**使用 copyfiles（复制文件）：**
```bash
npm install -D copyfiles
```

```json
{
  "scripts": {
    "copy": "copyfiles -u 1 src/**/*.html dist"
  }
}
```

**使用 shx（Shell 命令）：**
```bash
npm install -D shx
```

```json
{
  "scripts": {
    "clean": "shx rm -rf dist",
    "mkdir": "shx mkdir -p dist",
    "copy": "shx cp -r src/* dist"
  }
}
```

## 常用脚本模式

### 开发环境

```json
{
  "scripts": {
    "dev": "webpack-dev-server --mode development",
    "dev:hot": "webpack-dev-server --hot",
    "dev:https": "webpack-dev-server --https",
    "start": "npm run dev"
  }
}
```

### 构建

```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "webpack --mode production",
    "build:dev": "webpack --mode development",
    "build:analyze": "webpack --mode production --analyze",
    "clean": "rimraf dist"
  }
}
```

### 测试

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### 代码质量

```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit"
  }
}
```

### 发布

```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags",
    
    "prepublishOnly": "npm run build",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}
```

### Git Hooks（配合 husky）

```json
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "pre-push": "npm test"
  }
}
```

## 脚本组织策略

### 按功能分组

```json
{
  "scripts": {
    "dev": "npm run dev:client",
    "dev:client": "vite",
    "dev:server": "nodemon server.js",
    "dev:all": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### 使用命名空间

```json
{
  "scripts": {
    "watch:css": "sass --watch src:dist",
    "watch:js": "webpack --watch",
    "watch:all": "npm-run-all --parallel watch:*",
    
    "lint:js": "eslint src",
    "lint:css": "stylelint src/**/*.css",
    "lint:all": "npm-run-all lint:*"
  }
}
```

### 提取复杂脚本

```json
{
  "scripts": {
    "build": "node scripts/build.js",
    "deploy": "node scripts/deploy.js"
  }
}
```

```javascript
// scripts/build.js
const { execSync } = require('child_process');

console.log('清理目录...');
execSync('rimraf dist', { stdio: 'inherit' });

console.log('构建客户端...');
execSync('vite build', { stdio: 'inherit' });

console.log('构建服务端...');
execSync('tsc -p tsconfig.server.json', { stdio: 'inherit' });

console.log('构建完成！');
```

## 调试脚本

### 显示命令

```json
{
  "scripts": {
    "build": "echo 'Building...' && webpack"
  }
}
```

### 使用 --verbose

```bash
npm run build --verbose
# 显示详细执行信息
```

### 使用 --dry-run

```bash
npm run build --dry-run
# 模拟执行，不实际运行
```

### 检查脚本定义

```bash
# 查看所有脚本
npm run

# 查看特定脚本
npm run-script build --dry-run
```

## 性能优化

### 避免不必要的脚本

```json
{
  "scripts": {
    "test": "jest --onlyChanged"  // 仅测试修改的文件
  }
}
```

### 使用缓存

```json
{
  "scripts": {
    "build": "webpack --cache",
    "test": "jest --cache"
  }
}
```

### 并行化任务

```json
{
  "scripts": {
    "build": "npm-run-all --parallel build:*",
    "build:css": "sass src:dist",
    "build:js": "webpack"
  }
}
```

## 安全注意事项

### 避免执行不信任的脚本

```bash
# ⚠️ 危险：postinstall 可能执行恶意代码
npm install untrusted-package

# 安全：跳过脚本
npm install untrusted-package --ignore-scripts
```

### 审查依赖的脚本

```bash
# 查看包的 scripts
npm view package-name scripts
```

### 使用 --ignore-scripts

```bash
# 安装时跳过所有脚本
npm install --ignore-scripts

# CI 环境建议
npm ci --ignore-scripts
```

## 常用工具库

### scripty

**将脚本提取到文件：**
```bash
npm install -D scripty
```

**目录结构：**
```
scripts/
├── build.sh
├── test.sh
└── deploy.sh
```

```json
{
  "scripts": {
    "build": "scripty",
    "test": "scripty",
    "deploy": "scripty"
  }
}
```

### nps（npm-package-scripts）

**更强大的脚本管理：**
```bash
npm install -D nps
```

```javascript
// package-scripts.js
module.exports = {
  scripts: {
    build: {
      description: 'Build the project',
      default: 'webpack --mode production',
      dev: 'webpack --mode development'
    },
    test: {
      default: 'jest',
      watch: 'jest --watch',
      coverage: 'jest --coverage'
    }
  }
};
```

```json
{
  "scripts": {
    "start": "nps"
  }
}
```

```bash
npm start build
npm start test.watch
```

## 最佳实践

### 1. 脚本命名规范

```json
{
  "scripts": {
    "dev": "...",           // 开发环境
    "build": "...",         // 构建
    "start": "...",         // 启动生产服务
    "test": "...",          // 测试
    "test:watch": "...",    // 监听测试
    "lint": "...",          // 代码检查
    "lint:fix": "...",      // 自动修复
    "format": "...",        // 格式化
    "clean": "...",         // 清理
    "deploy": "..."         // 部署
  }
}
```

### 2. 使用注释

```json
{
  "scripts": {
    "//": "开发相关",
    "dev": "vite",
    "dev:https": "vite --https",
    
    "//build": "构建相关",
    "build": "vite build",
    "build:analyze": "vite build --mode analyze"
  }
}
```

### 3. 提供文档

```markdown
# 脚本说明

## 开发
- `npm run dev` - 启动开发服务器
- `npm run dev:https` - 使用 HTTPS 启动

## 构建
- `npm run build` - 生产构建
- `npm run build:analyze` - 构建并分析包体积

## 测试
- `npm test` - 运行所有测试
- `npm run test:watch` - 监听模式
```

### 4. 错误处理

```json
{
  "scripts": {
    "build": "npm run clean && npm run compile || echo 'Build failed!'"
  }
}
```

### 5. 环境检查

```json
{
  "scripts": {
    "preinstall": "node -v && npm -v",
    "check-node": "node scripts/check-node-version.js"
  }
}
```

## 参考资料

- [npm scripts 文档](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [npm-run-all](https://github.com/mysticatea/npm-run-all)
- [scripty](https://github.com/testdouble/scripty)
- [脚本最佳实践](https://docs.npmjs.com/cli/v9/using-npm/scripts#best-practices)

---

**上一章：**[.npmrc 配置文件详解](./content-12.md)  
**下一章：**[npm scripts 高级技巧](./content-14.md)
