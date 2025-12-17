# npm 常用命令

## 概述

掌握 npm 常用命令是日常开发的必备技能。本章介绍最常用的 npm 命令及其使用场景。

## 一、安装相关命令

### 1.1 npm install

**安装所有依赖：**
```bash
npm install
npm i  # 简写
```

**安装指定包：**
```bash
npm install lodash
npm install lodash@4.17.21  # 指定版本
npm install lodash@latest   # 最新版本
```

**安装到不同依赖类型：**
```bash
npm install react --save            # dependencies（默认）
npm install typescript --save-dev   # devDependencies
npm install -D typescript           # 简写

npm install react --save-prod       # 强制 dependencies
npm install -P react                # 简写
```

**全局安装：**
```bash
npm install -g typescript
npm install --global typescript
```

### 1.2 npm ci（CI/CD 推荐）

```bash
npm ci
```

**特点：**
- ✅ 完全按照 lock 文件安装
- ✅ 速度更快
- ✅ 适合 CI/CD 环境
- ⚠️ 要求必须有 lock 文件
- ⚠️ 会删除 node_modules 重新安装

**对比：**
```bash
# npm install
- 可能更新 lock 文件
- 不删除 node_modules
- 适合开发环境

# npm ci
- 严格按 lock 文件
- 删除 node_modules 重装
- 适合 CI/CD
```

### 1.3 npm uninstall

```bash
npm uninstall lodash
npm uninstall -D typescript  # 从 devDependencies 移除
npm uninstall -g typescript  # 全局卸载

npm un lodash    # 简写
npm remove lodash
npm rm lodash
```

## 二、更新相关命令

### 2.1 npm update

```bash
# 更新所有包（遵循 package.json 版本范围）
npm update

# 更新指定包
npm update lodash

# 全局更新
npm update -g
```

**示例：**
```json
{
  "dependencies": {
    "lodash": "^4.17.20"  // 范围：>=4.17.20 <5.0.0
  }
}
```

```bash
npm update lodash
# 如果有 4.17.21，会更新到 4.17.21
# 不会更新到 5.0.0（超出范围）
```

### 2.2 npm outdated

```bash
# 检查过期包
npm outdated

# 输出示例：
Package    Current  Wanted  Latest  Location
lodash     4.17.20  4.17.21 4.17.21 my-app
react      17.0.0   17.0.2  18.2.0  my-app
```

**字段说明：**
- **Current**：当前安装版本
- **Wanted**：满足 package.json 范围的最新版
- **Latest**：registry 中的最新版

### 2.3 npm upgrade（实际是 update 别名）

```bash
npm upgrade lodash
```

## 三、查看相关命令

### 3.1 npm list

```bash
# 查看项目依赖树
npm list
npm ls  # 简写

# 只显示顶层依赖
npm ls --depth=0

# 查看指定包
npm ls lodash

# 查看全局包
npm ls -g --depth=0
```

**输出示例：**
```
my-app@1.0.0
├── react@18.2.0
├── lodash@4.17.21
└── axios@1.4.0
    └── follow-redirects@1.15.2
```

### 3.2 npm view（查看包信息）

```bash
# 查看包的详细信息
npm view lodash

# 查看指定字段
npm view lodash version          # 最新版本
npm view lodash versions         # 所有版本
npm view lodash dependencies     # 依赖
npm view lodash repository.url   # 仓库地址
npm view lodash maintainers      # 维护者

# 别名
npm info lodash
npm show lodash
```

### 3.3 npm search

```bash
# 搜索包
npm search react

# 搜索结果包含关键词
npm search "state management"
```

## 四、脚本相关命令

### 4.1 npm run

```bash
# 运行 scripts 中的脚本
npm run dev
npm run build
npm run test

# 查看所有可用脚本
npm run
```

**内置脚本简写：**
```bash
npm test    # npm run test
npm start   # npm run start
npm stop    # npm run stop
npm restart # npm run restart
```

### 4.2 npm run-script

```bash
# 完整命令（run 是简写）
npm run-script dev
```

### 4.3 传递参数

```bash
# 使用 -- 传递参数
npm run dev -- --port 3000
npm test -- --watch

# scripts 中接收
{
  "scripts": {
    "dev": "vite"  // 实际运行：vite --port 3000
  }
}
```

## 五、包管理命令

### 5.1 npm cache

```bash
# 查看缓存目录
npm cache dir

# 验证缓存
npm cache verify

# 清理缓存
npm cache clean --force
```

### 5.2 npm prune

```bash
# 移除未在 package.json 中声明的包
npm prune

# 移除 devDependencies
npm prune --production
```

### 5.3 npm dedupe

```bash
# 去重，简化依赖树
npm dedupe
npm ddp  # 简写
```

**作用：**
```
优化前：
node_modules/
├── A/
│   └── node_modules/
│       └── C@1.0.0/
└── B/
    └── node_modules/
        └── C@1.0.0/

优化后：
node_modules/
├── A/
├── B/
└── C@1.0.0/  # 提升公共依赖
```

## 六、发布相关命令

### 6.1 npm publish

```bash
# 发布包
npm publish

# 发布 beta 版本
npm publish --tag beta

# 发布作用域包（公开）
npm publish --access public
```

### 6.2 npm unpublish

```bash
# 撤销发布（72小时内）
npm unpublish my-package@1.0.0

# 完全删除包（慎用）
npm unpublish my-package --force
```

### 6.3 npm version

```bash
# 更新版本号
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# 指定版本
npm version 1.2.3

# 预发布版本
npm version prerelease  # 1.0.0 → 1.0.1-0
npm version prepatch    # 1.0.0 → 1.0.1-0
npm version preminor    # 1.0.0 → 1.1.0-0
npm version premajor    # 1.0.0 → 2.0.0-0
```

## 七、用户相关命令

### 7.1 npm login

```bash
# 登录 npm
npm login

# 指定 registry
npm login --registry=https://npm.mycompany.com
```

### 7.2 npm logout

```bash
npm logout
```

### 7.3 npm whoami

```bash
# 查看当前登录用户
npm whoami

# 指定 registry
npm whoami --registry=https://npm.mycompany.com
```

## 八、初始化命令

### 8.1 npm init

```bash
# 交互式创建 package.json
npm init

# 使用默认值
npm init -y

# 使用初始化器
npm init react-app my-app
npm init vite@latest
npm init @vitejs/app
```

**create 别名：**
```bash
npm create vite@latest  # 等同于 npm init vite@latest
```

## 九、审计命令

### 9.1 npm audit

```bash
# 扫描漏洞
npm audit

# 自动修复漏洞
npm audit fix

# 强制修复（可能破坏性更新）
npm audit fix --force

# 查看详细信息
npm audit --json
```

**输出示例：**
```
found 3 vulnerabilities (1 moderate, 2 high)
run `npm audit fix` to fix them
```

## 十、其他实用命令

### 10.1 npm doctor

```bash
# 检查环境
npm doctor
```

**检查项：**
- npm 版本
- node 版本
- 网络连接
- registry 可访问性
- 缓存有效性

### 10.2 npm ping

```bash
# 测试 registry 连接
npm ping
```

### 10.3 npm repo

```bash
# 在浏览器打开包的仓库
npm repo lodash
```

### 10.4 npm docs

```bash
# 在浏览器打开包的文档
npm docs lodash
```

### 10.5 npm bugs

```bash
# 在浏览器打开包的 issues
npm bugs lodash
```

## 十一、命令速查表

| 命令 | 作用 | 常用选项 |
|------|------|----------|
| `npm install` | 安装依赖 | `-D`, `-g`, `--save-exact` |
| `npm ci` | CI 安装 | 无 |
| `npm uninstall` | 卸载 | `-D`, `-g` |
| `npm update` | 更新 | `-g` |
| `npm outdated` | 检查过期 | 无 |
| `npm list` | 查看依赖树 | `--depth=0`, `-g` |
| `npm view` | 查看包信息 | 无 |
| `npm run` | 运行脚本 | 无 |
| `npm cache clean` | 清理缓存 | `--force` |
| `npm audit` | 漏洞扫描 | `fix`, `--force` |
| `npm publish` | 发布 | `--tag`, `--access` |
| `npm version` | 版本管理 | `patch/minor/major` |

## 十二、常用组合命令

```bash
# 清理重装
rm -rf node_modules package-lock.json
npm install

# 更新所有依赖到最新
npm outdated
npm update

# 生产环境安装
npm ci --only=production

# 查看全局包
npm ls -g --depth=0

# 查看某个包的所有版本
npm view react versions --json

# 安装特定 npm 版本
npm install -g npm@9.6.7
```

## 参考资料

- [npm CLI 文档](https://docs.npmjs.com/cli/v9/commands)
- [npm 命令速查表](https://docs.npmjs.com/cli/v9/commands)

---

**导航**  
[上一章：package.json详解](./06-package-json.md) | [返回目录](../README.md) | [下一章：npm scripts脚本](./08-npm-scripts.md)
