# npm scripts 高级技巧

## 概述

npm scripts 不仅是简单的命令执行器，还提供了许多高级特性。掌握这些技巧可以构建复杂的自动化工作流，提升团队开发效率。

## 环境变量高级用法

### 动态环境变量

```json
{
  "scripts": {
    "build": "node -e \"process.env.BUILD_TIME = new Date().toISOString()\" && webpack"
  }
}
```

### 使用 dotenv

**安装：**
```bash
npm install -D dotenv-cli
```

**配置文件：**
```ini
# .env.development
API_URL=http://localhost:3000
DEBUG=true
```

```ini
# .env.production
API_URL=https://api.production.com
DEBUG=false
```

**使用：**
```json
{
  "scripts": {
    "dev": "dotenv -e .env.development -- webpack",
    "build": "dotenv -e .env.production -- webpack"
  }
}
```

### 条件执行

```json
{
  "scripts": {
    "build": "node scripts/conditional-build.js"
  }
}
```

```javascript
// scripts/conditional-build.js
const { execSync } = require('child_process');

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  console.log('Building for production...');
  execSync('webpack --mode production --optimize-minimize', { stdio: 'inherit' });
} else {
  console.log('Building for development...');
  execSync('webpack --mode development', { stdio: 'inherit' });
}
```

## 复杂工作流编排

### 多步骤构建

```json
{
  "scripts": {
    "prebuild": "npm run clean && npm run lint",
    "build": "npm run build:types && npm run build:js && npm run build:css",
    "build:types": "tsc --emitDeclarationOnly",
    "build:js": "webpack",
    "build:css": "sass src:dist",
    "postbuild": "npm run copy-assets && npm run generate-manifest",
    "clean": "rimraf dist",
    "lint": "eslint src",
    "copy-assets": "copyfiles -u 1 'src/assets/**/*' dist",
    "generate-manifest": "node scripts/generate-manifest.js"
  }
}
```

### 条件钩子

```json
{
  "scripts": {
    "build": "npm run maybe-test && webpack",
    "maybe-test": "node -e \"if (process.env.SKIP_TESTS !== 'true') process.exit(1)\" || npm test"
  }
}
```

```bash
# 跳过测试
SKIP_TESTS=true npm run build

# 运行测试
npm run build
```

### 循环处理

```json
{
  "scripts": {
    "build:packages": "node scripts/build-all-packages.js"
  }
}
```

```javascript
// scripts/build-all-packages.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(pkg => {
  console.log(`Building ${pkg}...`);
  execSync(`npm run build --workspace=packages/${pkg}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
});
```

## 错误处理

### 忽略错误

```json
{
  "scripts": {
    "lint": "eslint src || true",
    "test": "jest || echo 'Tests failed but continuing...'"
  }
}
```

### 错误时清理

```json
{
  "scripts": {
    "build": "webpack || npm run cleanup",
    "cleanup": "rimraf dist"
  }
}
```

### 使用 trap（Unix）

```json
{
  "scripts": {
    "dev": "trap 'npm run cleanup' EXIT; webpack-dev-server"
  }
}
```

### 自定义错误处理

```javascript
// scripts/build-with-retry.js
const { execSync } = require('child_process');

const MAX_RETRIES = 3;
let retries = 0;

function build() {
  try {
    execSync('webpack', { stdio: 'inherit' });
    console.log('Build successful!');
  } catch (error) {
    retries++;
    if (retries < MAX_RETRIES) {
      console.log(`Build failed, retrying (${retries}/${MAX_RETRIES})...`);
      setTimeout(build, 1000 * retries);
    } else {
      console.error('Build failed after max retries');
      process.exit(1);
    }
  }
}

build();
```

## 交互式脚本

### 使用 inquirer

```bash
npm install -D inquirer
```

```javascript
// scripts/interactive-build.js
const inquirer = require('inquirer');
const { execSync } = require('child_process');

async function run() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'env',
      message: 'Select environment:',
      choices: ['development', 'staging', 'production']
    },
    {
      type: 'confirm',
      name: 'minify',
      message: 'Minify output?',
      default: true
    }
  ]);

  const minifyFlag = answers.minify ? '--optimize-minimize' : '';
  const command = `NODE_ENV=${answers.env} webpack ${minifyFlag}`;
  
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

run();
```

```json
{
  "scripts": {
    "build:interactive": "node scripts/interactive-build.js"
  }
}
```

### 确认提示

```javascript
// scripts/dangerous-operation.js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Are you sure you want to delete all data? (yes/no) ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    console.log('Deleting...');
    // 执行危险操作
  } else {
    console.log('Cancelled');
  }
  rl.close();
});
```

## 性能监控

### 测量执行时间

```json
{
  "scripts": {
    "build": "node scripts/timed-build.js"
  }
}
```

```javascript
// scripts/timed-build.js
const { execSync } = require('child_process');

console.time('Build');
execSync('webpack', { stdio: 'inherit' });
console.timeEnd('Build');
```

### 详细性能报告

```javascript
// scripts/performance-build.js
const { performance } = require('perf_hooks');
const { execSync } = require('child_process');

const start = performance.now();

console.log('Starting build...');
execSync('webpack', { stdio: 'inherit' });

const end = performance.now();
const duration = ((end - start) / 1000).toFixed(2);

console.log(`\n✓ Build completed in ${duration}s`);

// 生成报告
const report = {
  timestamp: new Date().toISOString(),
  duration,
  environment: process.env.NODE_ENV
};

require('fs').writeFileSync(
  'build-report.json',
  JSON.stringify(report, null, 2)
);
```

## 通知系统

### 桌面通知

```bash
npm install -D node-notifier
```

```javascript
// scripts/build-with-notification.js
const notifier = require('node-notifier');
const { execSync } = require('child_process');

try {
  execSync('webpack', { stdio: 'inherit' });
  
  notifier.notify({
    title: 'Build Success',
    message: 'Your build completed successfully!',
    sound: true
  });
} catch (error) {
  notifier.notify({
    title: 'Build Failed',
    message: error.message,
    sound: true
  });
  process.exit(1);
}
```

### Slack 通知

```javascript
// scripts/notify-slack.js
const https = require('https');

function notifySlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const data = JSON.stringify({ text: message });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(webhookUrl, options);
  req.write(data);
  req.end();
}

module.exports = notifySlack;
```

## 版本管理集成

### 自动化版本发布

```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags && npm publish",
    
    "release:patch": "npm version patch -m 'chore: release v%s'",
    "release:minor": "npm version minor -m 'feat: release v%s'",
    "release:major": "npm version major -m 'feat!: release v%s'"
  }
}
```

### 生成 CHANGELOG

```bash
npm install -D conventional-changelog-cli
```

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "version": "npm run changelog && git add CHANGELOG.md"
  }
}
```

### 语义化发布

```bash
npm install -D semantic-release
```

```json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

## Git Hooks 集成

### 使用 husky

```bash
npm install -D husky
```

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**创建 hooks：**
```bash
# pre-commit
npx husky add .husky/pre-commit "npm run lint"

# commit-msg
npx husky add .husky/commit-msg "npx commitlint --edit $1"

# pre-push
npx husky add .husky/pre-push "npm test"
```

### 使用 lint-staged

```bash
npm install -D lint-staged
```

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit：**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

## Monorepo 脚本管理

### workspace 脚本

```json
{
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces --if-present",
    
    "build:pkg-a": "npm run build --workspace=packages/pkg-a",
    "test:pkg-b": "npm run test --workspace=packages/pkg-b"
  }
}
```

### lerna 脚本

```json
{
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "build": "lerna run build",
    "test": "lerna run test --parallel",
    "publish": "lerna publish"
  }
}
```

### 依赖拓扑排序

```javascript
// scripts/build-in-order.js
const { execSync } = require('child_process');

const buildOrder = [
  'packages/utils',
  'packages/components',
  'packages/app'
];

buildOrder.forEach(pkg => {
  console.log(`Building ${pkg}...`);
  execSync('npm run build', {
    cwd: pkg,
    stdio: 'inherit'
  });
});
```

## 远程脚本执行

### SSH 部署

```json
{
  "scripts": {
    "deploy": "node scripts/deploy.js"
  }
}
```

```javascript
// scripts/deploy.js
const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to server');
  
  conn.exec('cd /var/www/app && git pull && npm install && npm run build && pm2 restart app', (err, stream) => {
    if (err) throw err;
    
    stream.on('close', (code) => {
      console.log('Deployment complete');
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    });
  });
}).connect({
  host: process.env.DEPLOY_HOST,
  username: process.env.DEPLOY_USER,
  privateKey: require('fs').readFileSync(process.env.DEPLOY_KEY)
});
```

## 脚本生成器

### 动态生成脚本

```javascript
// scripts/generate-scripts.js
const fs = require('fs');
const path = require('path');

const packages = fs.readdirSync(path.join(__dirname, '../packages'));

const scripts = {};

packages.forEach(pkg => {
  scripts[`build:${pkg}`] = `npm run build --workspace=packages/${pkg}`;
  scripts[`test:${pkg}`] = `npm run test --workspace=packages/${pkg}`;
});

const packageJson = require('../package.json');
packageJson.scripts = { ...packageJson.scripts, ...scripts };

fs.writeFileSync(
  path.join(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('Scripts generated!');
```

## 调试技巧

### 启用调试模式

```json
{
  "scripts": {
    "debug": "node --inspect-brk scripts/build.js"
  }
}
```

**Chrome DevTools：**
```
1. 运行 npm run debug
2. 打开 chrome://inspect
3. 点击 inspect
```

### 详细日志

```json
{
  "scripts": {
    "build:verbose": "webpack --progress --profile --verbose"
  }
}
```

### 脚本跟踪

```bash
# 显示脚本执行过程
npm run build --loglevel verbose
```

## 最佳实践总结

### 1. 保持脚本简洁

```json
{
  "scripts": {
    "build": "webpack",  // ✅ 简洁
    "build": "rimraf dist && cross-env NODE_ENV=production webpack --mode production --config webpack.prod.js && node scripts/post-build.js"  // ❌ 过长
  }
}
```

**改进：**
```json
{
  "scripts": {
    "clean": "rimraf dist",
    "webpack": "cross-env NODE_ENV=production webpack --mode production",
    "postbuild": "node scripts/post-build.js",
    "build": "npm run clean && npm run webpack"
  }
}
```

### 2. 使用有意义的命名

```json
{
  "scripts": {
    "s": "webpack-dev-server",  // ❌ 不清晰
    "dev": "webpack-dev-server",  // ✅ 清晰
    
    "b": "webpack",  // ❌
    "build": "webpack"  // ✅
  }
}
```

### 3. 提供帮助脚本

```json
{
  "scripts": {
    "help": "node scripts/help.js"
  }
}
```

```javascript
// scripts/help.js
const scripts = require('../package.json').scripts;

console.log('Available scripts:\n');

Object.entries(scripts)
  .filter(([name]) => !name.startsWith('pre') && !name.startsWith('post'))
  .forEach(([name, command]) => {
    console.log(`  ${name.padEnd(20)} ${command}`);
  });
```

### 4. 错误处理一致性

```javascript
// scripts/utils.js
function safeExec(command, options = {}) {
  const { execSync } = require('child_process');
  
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

module.exports = { safeExec };
```

### 5. 文档化复杂脚本

```json
{
  "scripts": {
    "//": "═══════════════════════════════════",
    "//dev": "Development Scripts",
    "//": "═══════════════════════════════════",
    "dev": "vite",
    "dev:https": "vite --https",
    
    "//build": "Build Scripts",
    "build": "vite build",
    "build:analyze": "vite build --mode analyze"
  }
}
```

## 工具推荐

### just

**简化脚本管理：**
```javascript
// justfile
build:
  npm run clean
  webpack --mode production

test *args:
  jest {{args}}

deploy env:
  node scripts/deploy.js --env={{env}}
```

### make

**传统但强大：**
```makefile
# Makefile
.PHONY: build test clean

build: clean
	npm run webpack

test:
	npm run jest

clean:
	rm -rf dist
```

### task runners（gulp/grunt）

**复杂工作流：**
```javascript
// gulpfile.js
const gulp = require('gulp');

gulp.task('build:css', () => {
  return gulp.src('src/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('build:css', 'build:js'));
```

## 参考资料

- [npm scripts 最佳实践](https://docs.npmjs.com/cli/v9/using-npm/scripts#best-practices)
- [scripty GitHub](https://github.com/testdouble/scripty)
- [npm-run-all](https://github.com/mysticatea/npm-run-all)
- [husky](https://typicode.github.io/husky/)

---

**上一章：**[npm scripts 脚本系统](./content-13.md)  
**下一章：**[npm 缓存机制与优化](./content-15.md)
