# 第 8 章：npm scripts 脚本 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 生命周期钩子

### 题目

执行 `npm start` 时，会按什么顺序执行脚本？

**选项：**
- A. start
- B. prestart → start
- C. prestart → start → poststart
- D. start → poststart

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm scripts 生命周期**

```json
{
  "scripts": {
    "prestart": "echo '启动前'",
    "start": "node server.js",
    "poststart": "echo '启动后'"
  }
}
```

**执行顺序：**
```bash
npm start

# 1. prestart
# 2. start
# 3. poststart
```

**输出：**
```
启动前
Server started on port 3000
启动后
```

**规则：** 任何脚本都可以有 `pre*` 和 `post*` 钩子

**示例：**
```json
{
  "scripts": {
    "pretest": "echo '测试前'",
    "test": "jest",
    "posttest": "echo '测试后'",
    
    "prebuild": "npm run clean",
    "build": "webpack",
    "postbuild": "npm run deploy"
  }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 内置变量

### 题目

在 npm scripts 中，可以通过 `$npm_package_version` 访问 package.json 的 version 字段。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm 内置环境变量**

```json
{
  "name": "my-app",
  "version": "1.2.3",
  "description": "My awesome app",
  "config": {
    "port": "8080"
  },
  "scripts": {
    "print-info": "echo $npm_package_name@$npm_package_version"
  }
}
```

**执行：**
```bash
npm run print-info
# my-app@1.2.3
```

**常用变量：**

```bash
# package.json 字段
$npm_package_name           # my-app
$npm_package_version        # 1.2.3
$npm_package_description    # My awesome app

# 嵌套字段（下划线分隔）
$npm_package_config_port    # 8080

# npm 相关
$npm_lifecycle_event        # 当前脚本名称
$npm_lifecycle_script       # 当前脚本内容
```

**跨平台注意：**
```json
{
  "scripts": {
    "print": "echo $npm_package_version",      // Unix
    "print:win": "echo %npm_package_version%"  // Windows
  }
}
```

**使用 cross-var：**
```bash
npm install -D cross-var
```

```json
{
  "scripts": {
    "print": "cross-var echo $npm_package_version"
  }
}
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 参数传递

### 题目

如何向 npm scripts 传递参数？

**选项：**
- A. npm run build --env=production
- B. npm run build -- --env=production
- C. npm run build -env=production
- D. 无法传递参数

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**参数传递语法**

#### 使用 `--` 分隔符

```json
{
  "scripts": {
    "build": "webpack"
  }
}
```

```bash
# 正确
npm run build -- --mode=production --watch

# 等价于
webpack --mode=production --watch
```

**`--` 的作用：** 将后面的参数传递给脚本，而不是 npm

#### 错误方式

```bash
# ❌ 参数会被 npm 使用，而不是脚本
npm run build --mode=production
```

#### 在脚本中接收参数

**Node.js 脚本：**
```javascript
// build.js
const args = process.argv.slice(2);
console.log(args);  // ['--mode=production', '--watch']

// 或使用库
const yargs = require('yargs');
const argv = yargs.argv;
console.log(argv.mode);  // 'production'
```

**使用示例：**
```json
{
  "scripts": {
    "build": "node build.js"
  }
}
```

```bash
npm run build -- --mode=production
```

#### 环境变量方式

```json
{
  "scripts": {
    "build:dev": "NODE_ENV=development webpack",
    "build:prod": "NODE_ENV=production webpack"
  }
}
```

**或使用 cross-env：**
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 串行与并行

### 题目

以下哪些方式可以并行执行多个 npm scripts？

**选项：**
- A. npm run lint && npm run test
- B. npm run lint & npm run test
- C. npm-run-all --parallel lint test
- D. concurrently "npm run lint" "npm run test"

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B、C、D

### 📖 解析

**并行执行方式**

#### A. && 操作符 ❌ 串行

```bash
npm run lint && npm run test

# 顺序执行
# 1. lint（完成后）
# 2. test
```

#### B. & 操作符 ✅ 并行（Unix）

```bash
npm run lint & npm run test

# 同时执行（后台运行）
# ⚠️ 只在 Unix/Mac 有效，Windows 无效
```

#### C. npm-run-all ✅ 跨平台并行

```bash
npm install -D npm-run-all
```

```json
{
  "scripts": {
    "lint:js": "eslint .",
    "lint:css": "stylelint **/*.css",
    "test:unit": "jest",
    "test:e2e": "playwright test",
    
    "lint": "npm-run-all --parallel lint:*",
    "test": "npm-run-all --parallel test:*"
  }
}
```

```bash
npm run lint
# 并行执行 lint:js 和 lint:css
```

#### D. concurrently ✅ 跨平台并行

```bash
npm install -D concurrently
```

```json
{
  "scripts": {
    "dev": "concurrently \"npm run watch:js\" \"npm run watch:css\" \"npm run serve\""
  }
}
```

**特点：**
- 彩色输出
- 带前缀标识

**输出：**
```
[0] webpack watching...
[1] sass watching...
[2] Server started on port 3000
```

#### 对比总结

| 方式 | 跨平台 | 易用性 | 推荐度 |
|------|--------|--------|--------|
| **&&** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐（串行） |
| **&** | ❌ | ⭐⭐⭐ | ⭐（Unix并行） |
| **npm-run-all** | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **concurrently** | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

#### 实际示例

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build:js": "webpack",
    "build:css": "sass src:dist",
    "build:html": "html-minifier",
    
    "build": "npm run clean && npm-run-all --parallel build:*",
    
    "watch:js": "webpack --watch",
    "watch:css": "sass --watch src:dist",
    "watch:server": "nodemon server.js",
    
    "dev": "concurrently \"npm run watch:*\""
  }
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 跨平台脚本

### 题目

以下脚本在 Windows 上会失败，如何修复？

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "build": "NODE_ENV=production webpack"
  }
}
```

**选项：**
- A. 使用 PowerShell 命令
- B. 使用 rimraf 和 cross-env
- C. 只能在 Unix 使用
- D. 使用 && 连接

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**跨平台脚本解决方案**

#### 问题分析

**Unix（Mac/Linux）：**
```bash
rm -rf dist           # ✅ 有效
NODE_ENV=production   # ✅ 有效
```

**Windows：**
```cmd
rm -rf dist           # ❌ 无效（无 rm 命令）
NODE_ENV=production   # ❌ 无效（设置环境变量语法不同）
```

#### 解决方案 B：使用跨平台工具 ✅

**1. rimraf（跨平台删除）**

```bash
npm install -D rimraf
```

```json
{
  "scripts": {
    "clean": "rimraf dist"  // ✅ Windows/Unix 都有效
  }
}
```

**2. cross-env（跨平台环境变量）**

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

**完整修复：**
```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "cross-env NODE_ENV=production webpack"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "cross-env": "^7.0.0"
  }
}
```

#### 其他跨平台工具

**mkdirp（创建目录）：**
```json
{
  "scripts": {
    "mkdir": "mkdirp dist/js dist/css"
  }
}
```

**copyfiles（复制文件）：**
```json
{
  "scripts": {
    "copy": "copyfiles -u 1 src/**/*.html dist"
  }
}
```

**cross-var（跨平台变量）：**
```json
{
  "scripts": {
    "print": "cross-var echo $npm_package_version"
  }
}
```

#### 完整跨平台脚本示例

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "mkdir": "mkdirp dist/js dist/css",
    "copy": "copyfiles -u 1 src/**/*.html dist",
    "build:js": "cross-env NODE_ENV=production webpack",
    "build:css": "sass src:dist/css",
    "build": "npm run clean && npm run mkdir && npm-run-all --parallel build:*",
    "watch": "concurrently \"npm run watch:js\" \"npm run watch:css\"",
    "test": "cross-env NODE_ENV=test jest"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "mkdirp": "^3.0.0",
    "copyfiles": "^2.4.0",
    "cross-env": "^7.0.0",
    "npm-run-all": "^4.1.0",
    "concurrently": "^8.0.0"
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 脚本调试

### 题目

如何查看 npm scripts 的详细执行信息？

**选项：**
- A. npm run script --verbose
- B. npm run script --loglevel verbose
- C. DEBUG=* npm run script
- D. npm run script -v

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm 日志级别**

#### 设置日志级别

```bash
# 方法 1：命令行参数
npm run build --loglevel verbose

# 方法 2：环境变量
npm_config_loglevel=verbose npm run build

# 方法 3：配置文件
npm config set loglevel verbose
```

#### 日志级别

```
silent    # 无输出
error     # 只显示错误
warn      # 错误和警告
notice    # 默认
http      # HTTP 请求信息
timing    # 性能信息
info      # 一般信息
verbose   # 详细信息（包括执行的命令）
silly     # 所有信息
```

#### 查看执行的命令

**verbose 级别：**
```bash
npm run build --loglevel verbose

# 输出：
npm verb run-script [ 'prebuild', 'build', 'postbuild' ]
npm info lifecycle my-app@1.0.0~prebuild: my-app@1.0.0
npm verb lifecycle my-app@1.0.0~prebuild: CWD: /path/to/project
npm silly lifecycle my-app@1.0.0~prebuild: Args: [ 'rimraf dist' ]
npm timing command:run-script Completed in 123ms
```

#### 调试技巧

**1. 查看环境变量：**
```json
{
  "scripts": {
    "debug": "node -p 'process.env' | grep npm"
  }
}
```

**2. 输出脚本信息：**
```bash
npm run build --dry-run  # 显示但不执行
```

**3. 使用 DEBUG 变量：**
```bash
DEBUG=* npm run build
# 显示所有调试信息
```

**4. 查看完整配置：**
```bash
npm config list -l
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 脚本引用

### 题目

以下脚本的执行顺序是什么？

```json
{
  "scripts": {
    "prebuild": "echo 1",
    "build": "npm run compile",
    "postbuild": "echo 3",
    "precompile": "echo 2",
    "compile": "webpack",
    "postcompile": "echo 4"
  }
}
```

执行 `npm run build`

**选项：**
- A. 1, 2, webpack, 4, 3
- B. 1, webpack, 3
- C. 1, 2, 3, 4, webpack
- D. 2, webpack, 4

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**嵌套脚本的生命周期**

#### 执行流程

```bash
npm run build

1. prebuild → echo 1
2. build → npm run compile
   2.1. precompile → echo 2
   2.2. compile → webpack
   2.3. postcompile → echo 4
3. postbuild → echo 3
```

**输出顺序：** 1, 2, webpack, 4, 3

#### 关键规则

**规则 1：** `npm run` 会触发目标脚本的生命周期

```bash
npm run compile
# 执行：precompile → compile → postcompile
```

**规则 2：** 嵌套调用会完整执行内层生命周期

```bash
npm run build
# build 调用 npm run compile
# compile 的完整生命周期在 build 和 postbuild 之间执行
```

#### 复杂示例

```json
{
  "scripts": {
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "npm run coverage",
    
    "prelint": "echo 'Linting...'",
    "lint": "eslint .",
    "postlint": "echo 'Lint complete'",
    
    "precoverage": "echo 'Coverage...'",
    "coverage": "jest --coverage",
    "postcoverage": "echo 'Coverage complete'"
  }
}
```

**执行 `npm test`：**
```
1. pretest → npm run lint
   1.1. prelint → echo 'Linting...'
   1.2. lint → eslint .
   1.3. postlint → echo 'Lint complete'
2. test → jest
3. posttest → npm run coverage
   3.1. precoverage → echo 'Coverage...'
   3.2. coverage → jest --coverage
   3.3. postcoverage → echo 'Coverage complete'
```

#### 避免无限循环

```json
{
  "scripts": {
    "build": "npm run build"  // ❌ 无限循环
  }
}
```

**正确：**
```json
{
  "scripts": {
    "build": "webpack",
    "build:prod": "npm run build -- --mode=production"
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 最佳实践

### 题目

为什么不推荐在 scripts 中直接使用全局安装的命令？

**选项：**
- A. 全局命令更慢
- B. 团队成员可能未安装，导致不一致
- C. 全局命令不支持参数
- D. npm 禁止使用全局命令

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**依赖本地包 vs 全局包**

#### 问题场景

**错误做法：**
```json
{
  "scripts": {
    "build": "webpack"  // 假设 webpack 全局安装
  }
}
```

**问题：**
```bash
# 开发者 A（有全局 webpack）
npm run build  # ✅ 成功

# 开发者 B（无全局 webpack）
npm run build  # ❌ webpack: command not found

# CI 环境（无全局 webpack）
npm run build  # ❌ 失败
```

#### 正确做法

**1. 本地安装：**
```json
{
  "devDependencies": {
    "webpack": "^5.0.0"
  },
  "scripts": {
    "build": "webpack"  // 使用本地 webpack
  }
}
```

**工作原理：**
```bash
npm run build

# npm 自动添加 node_modules/.bin 到 PATH
# 优先使用本地安装的 webpack
```

**2. 使用 npx：**
```json
{
  "scripts": {
    "build": "npx webpack"  // 明确使用本地版本
  }
}
```

#### 版本一致性

**全局安装的问题：**
```bash
# 开发者 A
npm install -g webpack@5.0.0

# 开发者 B
npm install -g webpack@4.0.0

# 版本不一致！
```

**本地安装的优势：**
```json
{
  "devDependencies": {
    "webpack": "^5.0.0"  // 锁定版本范围
  }
}
```

```bash
# 所有人安装相同版本
npm install

# package-lock.json 确保精确版本
```

#### 最佳实践

**✅ 推荐：**
```json
{
  "devDependencies": {
    "webpack": "^5.88.0",
    "eslint": "^8.45.0",
    "jest": "^29.6.0"
  },
  "scripts": {
    "build": "webpack",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

**❌ 避免：**
```json
{
  "scripts": {
    "build": "webpack",  // 依赖全局安装
    "lint": "eslint .",
    "test": "jest"
  }
  // 没有 devDependencies
}
```

#### CI/CD 配置

**正确：**
```yaml
# .github/workflows/ci.yml
- name: Install
  run: npm ci

- name: Build
  run: npm run build  # 使用本地 webpack
```

**错误：**
```yaml
- name: Install global tools
  run: npm install -g webpack eslint  # ❌ 不推荐

- name: Build
  run: webpack
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** Husky集成

### 题目

如何配置 Git hooks 在提交前自动运行 lint 和 test？

<details>
<summary>查看答案</summary>

### ✅ 答案

**使用 Husky + lint-staged**

#### 1. 安装依赖

```bash
npm install -D husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

#### 2. 配置 package.json

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint .",
    "test": "jest"
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  },
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### 3. 创建 Git hooks

```bash
# pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# pre-push hook
npx husky add .husky/pre-push "npm test"
```

#### 4. 文件结构

```
.husky/
├── pre-commit   # 提交前执行
└── pre-push     # 推送前执行
```

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**.husky/pre-push:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

### 📖 解析

**工作流程**

#### Git commit 流程

```bash
git add .
git commit -m "feat: add feature"

# 1. 触发 pre-commit hook
# 2. 执行 lint-staged
#    - 只检查暂存的文件
#    - 运行 eslint --fix
#    - 运行 prettier --write
# 3. 如果失败，阻止提交
# 4. 如果成功，继续提交
```

#### Git push 流程

```bash
git push

# 1. 触发 pre-push hook
# 2. 运行 npm test
# 3. 如果失败，阻止推送
# 4. 如果成功，继续推送
```

#### 高级配置

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

**只测试相关文件：**
```bash
jest --findRelatedTests file1.js file2.js
# 只运行受影响的测试
```

#### 跳过 hooks（紧急情况）

```bash
# 跳过 pre-commit
git commit -m "fix" --no-verify

# 跳过 pre-push
git push --no-verify
```

**⚠️ 谨慎使用**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 复杂脚本

### 题目

编写一个完整的构建流程脚本，包括清理、编译、压缩、部署。

<details>
<summary>查看答案</summary>

### ✅ 答案

```json
{
  "name": "my-app",
  "scripts": {
    "clean": "rimraf dist",
    "prebuild": "npm run clean",
    "build": "npm run build:prod",
    "postbuild": "npm run minify",
    
    "build:dev": "cross-env NODE_ENV=development webpack --mode development",
    "build:prod": "cross-env NODE_ENV=production webpack --mode production",
    
    "minify:js": "terser dist/**/*.js -o dist/bundle.min.js",
    "minify:css": "cssnano dist/**/*.css dist/style.min.css",
    "minify": "npm-run-all --parallel minify:*",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    "lint": "npm-run-all --parallel lint:*",
    "lint:js": "eslint src --fix",
    "lint:css": "stylelint src/**/*.css --fix",
    "lint:format": "prettier --write \"src/**/*.{js,css,json}\"",
    
    "validate": "npm-run-all lint test build",
    
    "deploy:staging": "npm run validate && npm run upload:staging",
    "deploy:prod": "npm run validate && npm run upload:prod",
    
    "upload:staging": "aws s3 sync dist/ s3://my-bucket-staging",
    "upload:prod": "aws s3 sync dist/ s3://my-bucket-prod",
    
    "watch": "concurrently \"npm run watch:js\" \"npm run watch:css\"",
    "watch:js": "webpack --watch",
    "watch:css": "sass --watch src:dist",
    
    "serve": "http-server dist -p 8080",
    "dev": "concurrently \"npm run watch\" \"npm run serve\"",
    
    "prepare": "husky install",
    "precommit": "lint-staged",
    "prepush": "npm test"
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.css": ["stylelint --fix", "prettier --write"]
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "cross-env": "^7.0.0",
    "npm-run-all": "^4.1.0",
    "concurrently": "^8.0.0",
    "webpack": "^5.88.0",
    "terser": "^5.19.0",
    "cssnano-cli": "^1.0.0",
    "jest": "^29.6.0",
    "eslint": "^8.45.0",
    "stylelint": "^15.10.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.2.0",
    "http-server": "^14.1.0"
  }
}
```

### 📖 解析

**脚本分类**

#### 1. 构建相关

```bash
npm run clean      # 清理
npm run build:dev  # 开发构建
npm run build:prod # 生产构建
npm run minify     # 压缩
```

#### 2. 测试相关

```bash
npm test              # 运行测试
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率
```

#### 3. 代码质量

```bash
npm run lint          # 所有检查
npm run lint:js       # JS 检查
npm run lint:css      # CSS 检查
npm run lint:format   # 格式化
```

#### 4. 部署相关

```bash
npm run deploy:staging  # 部署到测试环境
npm run deploy:prod     # 部署到生产环境
```

#### 5. 开发相关

```bash
npm run dev    # 开发模式（监听+服务）
npm run watch  # 监听变化
npm run serve  # 启动服务器
```

**完整流程示例**

```bash
# 开发
npm run dev

# 提交前验证
npm run validate

# 部署
npm run deploy:prod
```

</details>

---

**导航**  
[上一章：第 7 章面试题](./chapter-07.md) | [返回目录](../README.md) | [下一章：第 9 章面试题](./chapter-09.md)
