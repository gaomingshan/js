# npm link 本地调试与开发

## 概述

`npm link` 是一个强大的开发工具，用于在本地调试包而无需发布到 registry。它通过创建符号链接（symlink）将本地包链接到全局或其他项目，实现实时调试和开发。

## npm link 基本原理

### 符号链接机制

**符号链接（Symbolic Link）：**
```
类似快捷方式，指向实际文件位置
修改源文件，链接处立即生效
```

**npm link 创建的链接：**
```
{全局 node_modules}/{包名} → {本地包路径}
{项目 node_modules}/{包名} → {全局 node_modules}/{包名}
```

### 工作流程

**两步操作：**
```bash
# 步骤 1：在要开发的包目录下
cd ~/projects/my-package
npm link
# 创建：全局 node_modules/my-package → ~/projects/my-package

# 步骤 2：在使用该包的项目中
cd ~/projects/my-app
npm link my-package
# 创建：my-app/node_modules/my-package → 全局 node_modules/my-package
```

**最终效果：**
```
my-app/node_modules/my-package 
  → 全局/my-package 
    → ~/projects/my-package
```

## 基本用法

### 场景 1：开发 npm 包

**目录结构：**
```
~/projects/
├── my-package/        # 正在开发的包
│   ├── package.json
│   ├── index.js
│   └── lib/
└── test-app/          # 测试应用
    ├── package.json
    └── index.js
```

**操作步骤：**
```bash
# 1. 在包目录下创建全局链接
cd ~/projects/my-package
npm link

# 输出：
# /usr/local/lib/node_modules/my-package -> ~/projects/my-package

# 2. 在测试应用中链接该包
cd ~/projects/test-app
npm link my-package

# 输出：
# ~/projects/test-app/node_modules/my-package -> /usr/local/lib/node_modules/my-package
```

**使用：**
```javascript
// test-app/index.js
const myPackage = require('my-package');
// 直接使用本地开发的包，修改实时生效
```

### 场景 2：调试依赖问题

**问题：**
```
项目使用 lodash，怀疑某个功能有 bug
想在 lodash 源码中添加 console.log 调试
```

**操作：**
```bash
# 1. Fork 并 clone lodash
git clone https://github.com/me/lodash.git
cd lodash

# 2. 创建全局链接
npm link

# 3. 在项目中使用本地 lodash
cd ~/my-project
npm link lodash

# 4. 修改 lodash 源码，添加调试代码
# 项目立即使用修改后的版本
```

### 场景 3：Monorepo 内部依赖

**结构：**
```
monorepo/
├── packages/
│   ├── utils/         # 工具包
│   └── components/    # 组件库（依赖 utils）
└── apps/
    └── web/           # Web 应用（依赖 components）
```

**不使用 workspaces 的替代方案：**
```bash
# 1. 链接 utils
cd packages/utils
npm link

# 2. 在 components 中链接 utils
cd ../components
npm link utils

# 3. 链接 components
npm link

# 4. 在 web 中链接 components
cd ../../apps/web
npm link components
```

## 高级用法

### 一步链接

```bash
# 直接从包目录链接到项目
cd ~/projects/my-package
npm link ~/projects/test-app

# 等价于：
# cd ~/projects/my-package && npm link
# cd ~/projects/test-app && npm link my-package
```

### 链接 scoped 包

```bash
# 1. 开发 scoped 包
cd ~/my-scoped-package
# package.json: "name": "@myorg/my-package"
npm link

# 2. 链接到项目
cd ~/my-project
npm link @myorg/my-package
```

### 链接多个包

```bash
# 同时链接多个包
npm link package-a package-b package-c
```

### 查看已链接的包

```bash
# 查看全局链接的包
npm ls -g --depth=0 --link

# 查看项目中链接的包
npm ls --link
```

## 取消链接

### 解除项目链接

```bash
# 在项目中取消链接
cd ~/my-project
npm unlink my-package

# 或使用 install 恢复正常版本
npm install my-package
```

### 解除全局链接

```bash
# 在包目录下取消全局链接
cd ~/my-package
npm unlink

# 或
npm unlink -g
```

### 清理所有链接

```bash
# 删除项目中所有符号链接
rm -rf node_modules
npm install
```

## 常见问题

### 问题 1：link 后 require 找不到模块

**原因：**
包的 package.json 中 main 字段指向不存在的文件。

**示例：**
```json
// my-package/package.json
{
  "name": "my-package",
  "main": "dist/index.js"  // 但 dist 目录未构建
}
```

**解决：**
```bash
cd ~/my-package
npm run build  # 构建生成 dist 目录
```

### 问题 2：修改代码不生效

**原因：**
某些工具缓存了模块。

**解决：**
```bash
# 清除缓存
# Node.js
node --no-warnings --loader ./clear-cache.mjs

# Webpack
rm -rf node_modules/.cache

# Next.js
rm -rf .next
```

**热更新配置（Webpack）：**
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    symlinks: true  // 默认值，启用符号链接解析
  },
  watchOptions: {
    followSymlinks: true,  // 监听符号链接
    ignored: /node_modules\/(?!my-package)/  // 不忽略 my-package
  }
};
```

### 问题 3：peer 依赖冲突

**现象：**
```bash
npm link my-package

# 错误
npm ERR! peer dep missing: react@>=18.0.0
```

**原因：**
链接的包有 peer 依赖，但项目中未安装。

**解决：**
```bash
# 在项目中安装 peer 依赖
npm install react@18.0.0

# 或在链接时使用 legacy 模式
npm link my-package --legacy-peer-deps
```

### 问题 4：Windows 权限问题

**错误：**
```
npm ERR! Error: EPERM: operation not permitted
```

**解决：**
```bash
# 以管理员身份运行 CMD 或 PowerShell
# 或使用 WSL
```

### 问题 5：TypeScript 类型定义找不到

**现象：**
```typescript
import myPackage from 'my-package';  // 类型报错
```

**原因：**
TypeScript 未正确解析符号链接的类型定义。

**解决：**
```json
// tsconfig.json
{
  "compilerOptions": {
    "preserveSymlinks": true,  // 保留符号链接
    "baseUrl": ".",
    "paths": {
      "my-package": ["../my-package/src"]  // 手动指定路径
    }
  }
}
```

## npm link 的限制

### 1. 依赖版本冲突

**问题：**
```
my-package 依赖 lodash@4.17.20
my-project 依赖 lodash@4.17.21

链接后可能使用 my-project 的版本
导致 my-package 行为异常
```

**解决：**
统一依赖版本或使用 pnpm。

### 2. 路径问题

**问题：**
```javascript
// my-package/index.js
const data = fs.readFileSync('./data.json');
// 相对路径基于执行目录，不是包目录
```

**解决：**
```javascript
const path = require('path');
const data = fs.readFileSync(
  path.join(__dirname, 'data.json')  // 使用 __dirname
);
```

### 3. 不适合 CI/CD

**问题：**
CI 环境无法使用 link，需要真实安装。

**解决：**
```bash
# 开发时使用 link
npm link my-package

# CI 时使用 registry 或 file:
npm install file:../my-package
```

## 替代方案

### 1. yalc

**更好的本地依赖管理工具。**

**安装：**
```bash
npm install -g yalc
```

**使用：**
```bash
# 1. 发布到本地 store
cd ~/my-package
yalc publish

# 2. 在项目中添加
cd ~/my-project
yalc add my-package

# 3. 更新
cd ~/my-package
yalc push  # 推送更新到所有使用的项目
```

**优势：**
- 真实复制文件，不是符号链接
- 避免路径问题
- 更接近真实安装

### 2. npm workspaces

**适合 Monorepo 项目。**

```json
// 根 package.json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**自动链接：**
```bash
npm install
# 自动链接 workspace 内的包
```

### 3. file: 协议

**package.json 中直接引用本地路径。**

```json
{
  "dependencies": {
    "my-package": "file:../my-package"
  }
}
```

```bash
npm install
# 创建符号链接或复制文件（取决于 npm 版本）
```

**优势：**
- 配置简单
- package.json 明确依赖关系

**劣势：**
- 路径写死
- 团队成员路径可能不同

### 4. npm install <folder>

**临时安装本地包。**

```bash
npm install ../my-package

# 效果：
# - 复制文件到 node_modules
# - 不创建符号链接
# - 修改不实时生效
```

**适用：**
- 一次性测试
- 不需要实时更新

## 最佳实践

### 1. 开发流程规范

```bash
# 开始开发
cd ~/my-package
npm link
cd ~/my-project
npm link my-package

# 开发和测试
# 修改 my-package 代码
# 在 my-project 中实时测试

# 完成开发
cd ~/my-project
npm unlink my-package
npm install my-package@latest  # 安装正式版本

cd ~/my-package
npm unlink
```

### 2. 构建自动化

**监听模式：**
```json
// my-package/package.json
{
  "scripts": {
    "dev": "tsc --watch",  // TypeScript
    "dev:babel": "babel src -d dist --watch"  // Babel
  }
}
```

```bash
# 开发时运行
cd ~/my-package
npm run dev  # 自动重新构建

# 另一个终端
cd ~/my-project
npm run dev  # 使用最新构建
```

### 3. 使用 package.json 脚本

```json
// my-project/package.json
{
  "scripts": {
    "link:dev": "npm link ../my-package",
    "unlink:dev": "npm unlink my-package && npm install"
  }
}
```

### 4. 文档化链接关系

```markdown
# 开发指南

## 本地开发依赖

本项目依赖以下本地包：
- `@company/utils`: ../shared/utils
- `@company/components`: ../shared/components

## 设置本地开发环境

\`\`\`bash
# 链接所有本地包
npm run link:all

# 或手动链接
cd ../shared/utils && npm link
cd ../../my-project && npm link @company/utils
\`\`\`
```

### 5. 清理脚本

```json
{
  "scripts": {
    "clean:links": "find node_modules -type l -delete && npm install"
  }
}
```

## Monorepo 中的 link

### 问题

在 Monorepo 中手动 link 很繁琐：

```bash
# 多个包相互依赖
cd packages/utils && npm link
cd ../components && npm link utils && npm link
cd ../app && npm link components
# ...
```

### 解决方案

**使用 npm workspaces（npm 7+）：**
```json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*"
  ]
}
```

```bash
# 一次安装，自动链接
npm install
```

**或使用 lerna：**
```bash
npx lerna bootstrap --use-workspaces
```

## 调试技巧

### 查看链接状态

```bash
# 查看是否是符号链接
ls -la node_modules/my-package

# 输出示例
lrwxr-xr-x  1 user  staff  32 Jan 15 10:00 my-package -> /Users/user/projects/my-package
```

### 验证链接路径

```bash
# 查看实际路径
readlink node_modules/my-package

# 或
node -e "console.log(require.resolve('my-package'))"
```

### 测试包入口

```bash
# 验证 package.json main 字段
node -e "console.log(require('my-package'))"
```

## 参考资料

- [npm link 官方文档](https://docs.npmjs.com/cli/v9/commands/npm-link)
- [yalc GitHub](https://github.com/wclr/yalc)
- [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [符号链接详解](https://en.wikipedia.org/wiki/Symbolic_link)

---

**上一章：**[npm update 与依赖升级策略](./content-9.md)  
**下一章：**[npm audit 安全审计机制](./content-11.md)
