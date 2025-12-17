# npm scripts 脚本

## 概述

npm scripts 是 package.json 中的脚本系统，可以自动化常见任务。理解 scripts 机制能够大幅提升开发效率。

## 一、基础用法

### 1.1 定义和运行脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  }
}
```

```bash
npm run dev
npm run build
npm test  # 内置脚本可省略 run
```

### 1.2 内置脚本（无需 run）

```bash
npm start    # npm run start
npm stop     # npm run stop
npm test     # npm run test
npm restart  # npm run restart
```

## 二、生命周期钩子

### 2.1 pre 和 post 钩子

```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "tsc",
    "postbuild": "npm run copy-assets"
  }
}
```

**执行顺序：**
```bash
npm run build
# → prebuild → build → postbuild
```

### 2.2 常用生命周期

**install 相关：**
```json
{
  "scripts": {
    "preinstall": "node scripts/check-env.js",
    "install": "node-gyp rebuild",
    "postinstall": "patch-package"
  }
}
```

**publish 相关：**
```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test",
    "prepublish": "npm run build",
    "publish": "git push --tags",
    "postpublish": "npm run deploy-docs"
  }
}
```

**version 相关：**
```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

### 2.3 完整生命周期列表

```
npm install:
  preinstall → install → postinstall → prepublish → preprepare → prepare → postprepare

npm publish:
  prepublishOnly → prepack → prepare → postpack → publish → postpublish

npm version:
  preversion → version → postversion
```

## 三、内置变量

### 3.1 package.json 字段

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "config": {
    "port": 3000
  },
  "scripts": {
    "info": "echo $npm_package_name@$npm_package_version",
    "start": "node server.js"
  }
}
```

**可用变量：**
```bash
$npm_package_name           # my-app
$npm_package_version        # 1.0.0
$npm_package_config_port    # 3000
```

### 3.2 npm 配置变量

```bash
$npm_config_registry
$npm_config_prefix
$npm_lifecycle_event  # 当前脚本名称
$npm_execpath         # npm 可执行文件路径
```

**示例：**
```json
{
  "scripts": {
    "info": "echo Registry: $npm_config_registry",
    "which": "echo Current script: $npm_lifecycle_event"
  }
}
```

## 四、传递参数

### 4.1 使用 -- 传递参数

```bash
npm run dev -- --port 3000 --host 0.0.0.0
```

**接收参数：**
```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

**实际执行：**
```bash
vite --port 3000 --host 0.0.0.0
```

### 4.2 通过环境变量传递

```bash
PORT=3000 npm run dev
```

```json
{
  "scripts": {
    "dev": "vite --port ${PORT:-8080}"
  }
}
```

## 五、串行和并行执行

### 5.1 串行执行（&&）

```json
{
  "scripts": {
    "build": "npm run clean && npm run compile && npm run bundle"
  }
}
```

**特点：**
- 按顺序执行
- 前一个失败，后续不执行

### 5.2 并行执行（&）

```json
{
  "scripts": {
    "dev": "npm run dev:server & npm run dev:client"
  }
}
```

**问题：** 跨平台兼容性差

### 5.3 使用 npm-run-all

```bash
npm install -D npm-run-all
```

**串行：**
```json
{
  "scripts": {
    "build": "npm-run-all clean compile bundle",
    "build:s": "run-s clean compile bundle"
  }
}
```

**并行：**
```json
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:server": "nodemon server.js",
    "dev:client": "vite",
    "dev:p": "run-p dev:*"
  }
}
```

**通配符：**
```json
{
  "scripts": {
    "test": "run-s test:*",
    "test:unit": "vitest",
    "test:e2e": "playwright test",
    "test:lint": "eslint ."
  }
}
```

## 六、跨平台脚本

### 6.1 环境变量设置

**❌ 问题：**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development vite"
  }
}
```
Windows 不支持这种写法。

**✅ 解决：使用 cross-env**

```bash
npm install -D cross-env
```

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development vite",
    "build": "cross-env NODE_ENV=production vite build"
  }
}
```

### 6.2 文件操作

**❌ 问题：**
```json
{
  "scripts": {
    "clean": "rm -rf dist"
  }
}
```
Windows 不支持 `rm` 命令。

**✅ 解决：使用 rimraf**

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

### 6.3 其他跨平台工具

**copyfiles（复制文件）：**
```bash
npm install -D copyfiles
```

```json
{
  "scripts": {
    "copy": "copyfiles -u 1 src/**/*.css dist/"
  }
}
```

**mkdirp（创建目录）：**
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

## 七、实用脚本示例

### 7.1 开发环境

```json
{
  "scripts": {
    "dev": "run-p dev:*",
    "dev:server": "nodemon server.js",
    "dev:client": "vite",
    "dev:types": "tsc --watch --noEmit"
  }
}
```

### 7.2 构建流程

```json
{
  "scripts": {
    "build": "run-s clean build:*",
    "clean": "rimraf dist",
    "build:types": "tsc",
    "build:bundle": "vite build",
    "build:assets": "copyfiles -u 1 src/assets/**/* dist/"
  }
}
```

### 7.3 测试流程

```json
{
  "scripts": {
    "test": "run-s test:*",
    "test:lint": "eslint .",
    "test:types": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 7.4 发布流程

```json
{
  "scripts": {
    "release": "run-s test build version:patch publish",
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    
    "prepublishOnly": "run-s test build",
    "postpublish": "git push --follow-tags"
  }
}
```

### 7.5 代码规范

```json
{
  "scripts": {
    "lint": "run-p lint:*",
    "lint:js": "eslint . --ext .ts,.tsx",
    "lint:css": "stylelint 'src/**/*.css'",
    
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\""
  }
}
```

## 八、脚本最佳实践

### 8.1 命名规范

```json
{
  "scripts": {
    "dev": "开发服务器",
    "build": "构建生产版本",
    "test": "运行测试",
    "lint": "代码检查",
    "format": "代码格式化",
    "clean": "清理输出",
    
    "dev:server": "具体任务加后缀",
    "build:prod": "变体加后缀",
    "test:unit": "子任务加后缀"
  }
}
```

### 8.2 使用 pre/post 钩子

```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "tsc",
    "postbuild": "npm run copy-assets",
    
    "pretest": "npm run lint",
    "test": "vitest",
    "posttest": "npm run coverage"
  }
}
```

### 8.3 复杂脚本提取到文件

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

function build() {
  console.log('Cleaning...');
  execSync('rimraf dist', { stdio: 'inherit' });
  
  console.log('Building...');
  execSync('tsc', { stdio: 'inherit' });
  
  console.log('Done!');
}

build();
```

### 8.4 使用配置文件

```json
{
  "scripts": {
    "lint": "eslint . --config .eslintrc.js",
    "format": "prettier --config .prettierrc"
  }
}
```

## 九、调试脚本

### 9.1 查看实际执行的命令

```bash
npm run build --dry-run
```

### 9.2 查看所有可用脚本

```bash
npm run
```

### 9.3 静默输出

```bash
npm run build --silent
npm run build -s
```

### 9.4 详细日志

```bash
npm run build --loglevel verbose
npm run build --loglevel silly
```

## 十、常见问题

### 10.1 脚本不执行

**检查：**
1. 脚本名称拼写
2. 语法错误
3. 权限问题

```bash
# 查看详细错误
npm run build --loglevel verbose
```

### 10.2 找不到命令

**问题：**
```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

```bash
npm run lint
# Error: eslint: command not found
```

**解决：**
```bash
# 安装为 devDependency
npm install -D eslint
```

### 10.3 Windows 路径问题

```json
{
  "scripts": {
    "clean": "rimraf dist",           // ✅
    "clean-bad": "rm -rf dist"        // ❌ Windows 不支持
  }
}
```

## 参考资料

- [npm scripts 文档](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [npm-run-all](https://github.com/mysticatea/npm-run-all)
- [cross-env](https://github.com/kentcdodds/cross-env)

---

**导航**  
[上一章：npm常用命令](./07-npm-commands.md) | [返回目录](../README.md) | [下一章：依赖版本管理](./09-version-management.md)
