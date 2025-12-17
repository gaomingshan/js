# 第 5 章：npm 安装与配置 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Node版本管理

### 题目

nvm、n、fnm 三个版本管理工具中，哪个是用 Rust 编写的？

**选项：**
- A. nvm
- B. n
- C. fnm
- D. 都不是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Node.js 版本管理工具对比**

#### fnm (Fast Node Manager) - Rust ✅

```bash
# 安装
curl -fsSL https://fnm.vercel.app/install | bash

# 特点
- 用 Rust 编写
- 速度极快 ⚡⚡⚡
- 跨平台（Windows/macOS/Linux）
- .node-version 文件支持
```

#### nvm - Shell 脚本

```bash
# 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 特点
- 用 Shell 编写
- 最流行
- 只支持 macOS/Linux
```

#### n - Node.js

```bash
# 安装
npm install -g n

# 特点
- 用 Node.js 编写
- 简单易用
- 需要先有 Node.js
```

**性能对比：**

```bash
# 切换版本速度
nvm use 16    # 1.2s
n 16          # 0.8s
fnm use 16    # 0.1s  ⚡最快
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** npm配置

### 题目

npm 的全局配置文件位于用户主目录的 .npmrc 文件中。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**npm 配置文件层级**

#### 用户级配置（~/.npmrc）

```bash
# 位置
~/.npmrc  # macOS/Linux
%USERPROFILE%\.npmrc  # Windows
```

**这是用户级配置，不是全局配置**

#### 全局配置

```bash
# 查看全局配置文件位置
npm config get globalconfig

# 通常在
/usr/local/etc/npmrc  # macOS
/etc/npmrc  # Linux
C:\ProgramData\npm\etc\npmrc  # Windows
```

#### 四个配置层级

```
1. 项目级（最高优先级）
   /path/to/project/.npmrc

2. 用户级
   ~/.npmrc

3. 全局级
   /usr/local/etc/npmrc

4. npm 内置默认（最低优先级）
```

**配置查看：**

```bash
npm config list

# 输出显示来源
; "user" config from ~/.npmrc
; "global" config from /usr/local/etc/npmrc
; "builtin" config from ...
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** npm初始化

### 题目

`npm init -y` 的作用是什么？

**选项：**
- A. 安装所有依赖
- B. 使用默认值快速创建 package.json
- C. 更新 npm 版本
- D. 初始化 Git 仓库

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm init 命令**

#### 交互式初始化

```bash
npm init

# 会提问：
package name: (my-app)
version: (1.0.0)
description:
entry point: (index.js)
test command:
git repository:
keywords:
author:
license: (ISC)
```

#### 快速初始化（-y）

```bash
npm init -y
# 或
npm init --yes
```

**使用默认值，跳过所有提问**

**生成的 package.json：**

```json
{
  "name": "current-directory-name",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

#### 自定义默认值

```bash
# 配置默认作者
npm config set init-author-name "Your Name"
npm config set init-author-email "you@example.com"
npm config set init-license "MIT"

# 再次 init -y
npm init -y
```

**新的默认值：**

```json
{
  "author": "Your Name <you@example.com>",
  "license": "MIT"
}
```

#### 使用模板

```bash
# 使用 create-* 包
npm init react-app my-app
# 等同于
npx create-react-app my-app

# 其他模板
npm init vite@latest
npm init next-app
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 环境变量

### 题目

以下哪些环境变量会影响 npm 的行为？

**选项：**
- A. NPM_CONFIG_REGISTRY
- B. NODE_ENV
- C. NPM_TOKEN
- D. PATH

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**npm 相关环境变量**

#### A. NPM_CONFIG_REGISTRY ✅

```bash
# 设置 registry
export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

npm install
# 使用环境变量指定的源
```

**规则：**
- `NPM_CONFIG_*` 格式
- 对应 npm config 的配置项
- 优先级高于配置文件

**示例：**

```bash
NPM_CONFIG_REGISTRY=xxx
NPM_CONFIG_LOGLEVEL=verbose
NPM_CONFIG_CACHE=/path/to/cache
```

#### B. NODE_ENV ✅

```bash
# 生产环境
export NODE_ENV=production

npm install
# 不安装 devDependencies
```

**影响：**
- 某些包的行为（如 webpack）
- 条件依赖安装

#### C. NPM_TOKEN ✅

```bash
# 设置认证令牌
export NPM_TOKEN=xxx

# 用于私有包认证
```

**.npmrc 中使用：**

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

#### D. PATH ✅

```bash
# npm 全局包的可执行文件路径
export PATH="$PATH:$(npm bin -g)"
```

**影响：**
- 全局安装的命令是否可用
- npm 自身的查找

#### 其他重要环境变量

**CI 环境变量：**

```bash
CI=true  # 自动进入 CI 模式
HUSKY=0  # 跳过 Git hooks
```

**代理：**

```bash
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=http://proxy:8080
NO_PROXY=localhost,127.0.0.1
```

**npm 特定：**

```bash
npm_config_*  # 小写，自动设置
npm_package_*  # package.json 字段
npm_lifecycle_event  # 当前脚本名称
```

**查看所有 npm 环境变量：**

```bash
npm run env | grep npm_
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 配置优先级

### 题目

以下三个配置文件同时存在，最终 registry 是什么？

```ini
# ~/.npmrc
registry=https://registry.npmjs.org

# /project/.npmrc
registry=https://registry.npmmirror.com

# 命令行
npm install --registry https://custom.registry.com
```

**选项：**
- A. https://registry.npmjs.org
- B. https://registry.npmmirror.com
- C. https://custom.registry.com
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm 配置优先级（从高到低）**

#### 1. 命令行参数（最高）✅

```bash
npm install --registry https://custom.registry.com
```

**优先级最高，覆盖所有配置**

#### 2. 环境变量

```bash
NPM_CONFIG_REGISTRY=https://env.registry.com npm install
```

#### 3. 项目级 .npmrc

```ini
# /project/.npmrc
registry=https://registry.npmmirror.com
```

#### 4. 用户级 .npmrc

```ini
# ~/.npmrc
registry=https://registry.npmjs.org
```

#### 5. 全局级 .npmrc

```ini
# /usr/local/etc/npmrc
registry=...
```

#### 6. npm 内置默认（最低）

**完整优先级链：**

```
命令行 > 环境变量 > 项目配置 > 用户配置 > 全局配置 > 内置默认
```

**验证：**

```bash
# 查看最终生效的配置
npm config list

# 查看特定配置
npm config get registry

# 查看配置来源
npm config list -l
```

**实际场景：**

```bash
# 临时使用官方源发布
npm publish --registry https://registry.npmjs.org

# 不影响项目配置
cat .npmrc
# registry=https://registry.npmmirror.com  # 保持不变
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** nvm使用

### 题目

如何使用 nvm 安装 Node.js LTS 版本？

**选项：**
- A. nvm install lts
- B. nvm install --lts
- C. nvm install lts/*
- D. nvm install stable

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**nvm 常用命令**

#### 安装 LTS 版本

```bash
# 安装最新 LTS
nvm install --lts

# 或使用别名
nvm install lts/*
```

**两种方式都可以！**

#### 安装特定版本

```bash
# 安装指定版本
nvm install 18.16.0

# 安装最新 18.x
nvm install 18

# 安装最新版本
nvm install node
```

#### 使用版本

```bash
# 切换版本
nvm use 18

# 使用 LTS
nvm use --lts

# 使用最新
nvm use node
```

#### 查看版本

```bash
# 列出已安装版本
nvm ls

# 列出远程可用版本
nvm ls-remote

# 只列出 LTS
nvm ls-remote --lts

# 当前版本
nvm current
```

#### 设置默认版本

```bash
# 设置默认版本
nvm alias default 18

# 设置默认为 LTS
nvm alias default lts/*

# 每次新终端使用默认版本
```

#### 项目级版本控制

**.nvmrc 文件：**

```
18.16.0
```

**使用：**

```bash
# 读取 .nvmrc 并安装/使用
nvm install
nvm use

# 自动切换（需要配置）
cd project  # 自动切换到 .nvmrc 指定版本
```

#### Shell 集成

**Bash：**

```bash
# ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 自动切换版本
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** npm配置

### 题目

执行以下命令后，`npm config get prefix` 的输出是什么？

```bash
npm config set prefix /custom/path
npm config get prefix
```

**选项：**
- A. /usr/local
- B. /custom/path
- C. ~/.npm
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm prefix 配置**

#### prefix 的作用

**全局安装路径：**

```bash
npm install -g package

# 安装到
{prefix}/lib/node_modules/package

# 可执行文件链接到
{prefix}/bin/package
```

#### 默认 prefix

```bash
# 查看默认值
npm config get prefix

# macOS/Linux
/usr/local

# Windows
C:\Users\username\AppData\Roaming\npm
```

#### 修改 prefix

```bash
# 设置自定义 prefix
npm config set prefix /custom/path

# 验证
npm config get prefix
# /custom/path
```

**影响：**

```bash
# 全局安装
npm install -g typescript

# 安装位置
/custom/path/lib/node_modules/typescript

# 可执行文件
/custom/path/bin/tsc
```

#### 添加到 PATH

```bash
# 确保可执行文件可用
export PATH="/custom/path/bin:$PATH"

# ~/.bashrc 或 ~/.zshrc
echo 'export PATH="/custom/path/bin:$PATH"' >> ~/.bashrc
```

#### 推荐配置

**使用用户目录：**

```bash
# 避免权限问题
npm config set prefix ~/.npm-global

# 添加到 PATH
export PATH="$HOME/.npm-global/bin:$PATH"
```

**或使用 nvm：**

```bash
# nvm 自动管理 prefix
nvm use 18
npm config get prefix
# /Users/xxx/.nvm/versions/node/v18.16.0
```

#### 查看所有全局包

```bash
npm ls -g --depth=0

# 位置
$(npm config get prefix)/lib/node_modules/
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 版本管理最佳实践

### 题目

在团队协作中，如何确保所有成员使用相同的 Node.js 版本？

**选项：**
- A. 口头约定版本号
- B. 使用 .nvmrc + engines 字段
- C. 在 README 中说明
- D. 使用 Docker

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（最佳），D（也可以）

### 📖 解析

**统一 Node.js 版本的方案**

#### 方案 B：.nvmrc + engines ✅ 推荐

**1. 创建 .nvmrc**

```
18.16.0
```

**2. package.json 声明**

```json
{
  "engines": {
    "node": ">=18.16.0",
    "npm": ">=8.0.0"
  }
}
```

**3. 启用引擎检查**

```ini
# .npmrc
engine-strict=true
```

**效果：**

```bash
# 使用错误版本
nvm use 16
npm install

# 报错
npm ERR! engine Unsupported engine
npm ERR! Required: {"node":">=18.16.0"}
npm ERR! Actual: {"node":"16.0.0"}
```

**团队使用：**

```bash
# 成员 A
cd project
nvm install  # 自动安装 .nvmrc 指定版本
nvm use
npm install

# 成员 B
cd project
nvm use
npm install
```

#### 方案 D：Docker ✅ 也推荐

**Dockerfile：**

```dockerfile
FROM node:18.16.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "start"]
```

**优势：**
- 完全一致的环境
- 包括 OS、Node.js、npm
- 适合 CI/CD

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **.nvmrc + engines** | 轻量、简单 | 依赖开发者配置 | 团队开发 |
| **Docker** | 完全一致 | 重量级 | CI/CD、生产 |
| **README** | 无约束 | 易忘记 | 不推荐 |

#### 完整最佳实践

**1. .nvmrc**

```
18.16.0
```

**2. package.json**

```json
{
  "engines": {
    "node": "18.16.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "preinstall": "node -v | grep -q 'v18.16.0' || (echo 'Node version mismatch' && exit 1)"
  }
}
```

**3. .npmrc**

```ini
engine-strict=true
```

**4. GitHub Actions**

```yaml
- uses: actions/setup-node@v3
  with:
    node-version-file: '.nvmrc'
```

**5. 文档**

```markdown
# README.md

## 开发环境

Node.js: 18.16.0（见 .nvmrc）

### 快速开始

\`\`\`bash
nvm use
npm install
npm run dev
\`\`\`
```

#### Volta 替代方案

```bash
# 安装 Volta
curl https://get.volta.sh | bash

# 在项目中固定版本
volta pin node@18.16.0
volta pin npm@9.5.0
```

**package.json 自动更新：**

```json
{
  "volta": {
    "node": "18.16.0",
    "npm": "9.5.0"
  }
}
```

**优势：**
- 自动切换版本
- 无需手动 nvm use
- 跨平台

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 权限问题

### 题目

在 macOS/Linux 上全局安装 npm 包时遇到权限错误 `EACCES`，最佳解决方案是什么？

**选项：**
- A. 使用 sudo npm install -g
- B. 修改 npm prefix 到用户目录
- C. chmod -R 777 /usr/local
- D. 重装 Node.js

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm 权限问题解决方案**

#### ❌ 方案 A：使用 sudo（不推荐）

```bash
sudo npm install -g package
```

**问题：**
- 安全风险
- npm 脚本以 root 运行
- 可能破坏系统文件
- 依赖可能执行恶意代码

#### ✅ 方案 B：修改 prefix（推荐）

**步骤：**

```bash
# 1. 创建全局目录
mkdir -p ~/.npm-global

# 2. 配置 npm 使用新目录
npm config set prefix ~/.npm-global

# 3. 添加到 PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 4. 测试
npm install -g typescript
# ✅ 无需 sudo
```

**优势：**
- 不需要 sudo
- 用户完全控制
- 安全

#### ❌ 方案 C：chmod 777（危险）

```bash
sudo chmod -R 777 /usr/local  # ❌ 极度危险
```

**绝对不要这样做！**
- 巨大安全风险
- 破坏系统权限
- 可能被恶意利用

#### 方案 D：重装 Node.js

**使用 nvm 安装（推荐）：**

```bash
# 1. 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. 安装 Node.js
nvm install 18

# 3. 全局安装
npm install -g package
# ✅ 自动使用用户目录，无权限问题
```

**nvm prefix：**

```bash
npm config get prefix
# /Users/xxx/.nvm/versions/node/v18.16.0

# 无需 sudo
```

#### 完整解决方案对比

| 方案 | 安全性 | 便利性 | 推荐度 |
|------|--------|--------|--------|
| **修改 prefix** | ✅ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **使用 nvm** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **sudo** | ❌ | ⭐⭐ | ⭐ |
| **chmod 777** | ❌❌❌ | ⭐ | ❌ |

#### 已经使用 sudo 的补救

```bash
# 1. 删除全局包
sudo npm ls -g --depth=0

# 2. 卸载所有全局包
sudo npm uninstall -g package1 package2 ...

# 3. 修复权限（小心！）
sudo chown -R $USER /usr/local/lib/node_modules
sudo chown -R $USER /usr/local/bin

# 4. 或使用 nvm 重新开始
```

#### CI/CD 中的处理

```yaml
# GitHub Actions - 无权限问题
- uses: actions/setup-node@v3
- run: npm install -g package  # ✅ 直接可用

# Docker - 使用非 root 用户
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
RUN npm install -g package  # ✅ 用户目录
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** npm配置最佳实践

### 题目

如何在项目中配置 npm，确保团队成员使用淘宝镜像，但发布时使用官方源？

**选项：**
- A. 在 .npmrc 中配置 registry
- B. 在 package.json 中配置 publishConfig
- C. A + B 组合
- D. 使用 npm scripts

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**完整配置方案**

#### 方案 C：组合配置 ✅

**1. 项目 .npmrc（下载用）**

```ini
# .npmrc
registry=https://registry.npmmirror.com

# 作用域包使用私有源
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**2. package.json（发布用）**

```json
{
  "name": "my-package",
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

**工作流程：**

```bash
# 开发时（使用淘宝镜像）
npm install
# ↓ https://registry.npmmirror.com

# 发布时（自动使用官方源）
npm publish
# ↓ https://registry.npmjs.org（来自 publishConfig）
```

#### 为什么需要组合？

**只用 .npmrc：**
- ❌ 发布也会用淘宝镜像（失败，镜像只读）

**只用 publishConfig：**
- ❌ 下载仍用官方源（慢）

**组合使用：**
- ✅ 下载快（镜像）
- ✅ 发布成功（官方源）

#### 高级配置

**完整 .npmrc：**

```ini
# 下载源
registry=https://registry.npmmirror.com

# 二进制文件镜像
electron_mirror=https://npmmirror.com/mirrors/electron/
sass_binary_site=https://npmmirror.com/mirrors/node-sass/

# 私有包
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# 配置
engine-strict=true
save-exact=false
package-lock=true
```

**完整 package.json：**

```json
{
  "name": "@mycompany/utils",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "prepublishOnly": "npm run test && npm run build",
    "publish:beta": "npm publish --tag beta"
  }
}
```

#### 方案 D：npm scripts

**也是一种方案：**

```json
{
  "scripts": {
    "publish": "npm publish --registry https://registry.npmjs.org",
    "publish:beta": "npm publish --tag beta --registry https://registry.npmjs.org"
  }
}
```

**使用：**

```bash
npm run publish
```

**缺点：**
- 需要记住使用 `npm run publish`
- 容易忘记

#### Git 配置

**.gitignore：**

```
# 如果 .npmrc 包含敏感信息
.npmrc

# 保留示例文件
!.npmrc.example
```

**.npmrc.example：**

```ini
# 复制此文件为 .npmrc 并填入 token
registry=https://registry.npmmirror.com
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=YOUR_TOKEN_HERE
```

#### CI/CD 配置

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**自动使用 publishConfig 中的配置**

</details>

---

**导航**  
[上一章：第 4 章面试题](./chapter-04.md) | [返回目录](../README.md) | [下一章：第 6 章面试题](./chapter-06.md)
