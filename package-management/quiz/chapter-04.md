# 第 4 章：registry 与镜像源 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** registry 基础

### 题目

npm registry 的默认地址是什么？

**选项：**
- A. https://registry.npm.org
- B. https://registry.npmjs.org
- C. https://www.npmjs.com
- D. https://npm.taobao.org

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm registry 地址**

#### 官方 registry

```bash
# 默认地址
https://registry.npmjs.org
```

**查看当前 registry：**

```bash
npm config get registry
# https://registry.npmjs.org/
```

#### registry 的作用

**1. 包存储和分发**
- 存储所有公开的 npm 包
- 提供下载服务

**2. 包元数据**
```bash
# 查看包信息
https://registry.npmjs.org/lodash

# 返回 JSON
{
  "name": "lodash",
  "versions": {...},
  "dist-tags": {
    "latest": "4.17.21"
  }
}
```

**3. 包搜索**
```bash
npm search lodash
```

#### 其他选项说明

**A. https://registry.npm.org**
- 旧地址，已重定向到 npmjs.org

**C. https://www.npmjs.com**
- npm 网站，不是 registry API

**D. https://npm.taobao.org**
- 淘宝镜像（已废弃）
- 新地址：https://registry.npmmirror.com

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 镜像源

### 题目

使用淘宝镜像会影响 npm publish 发布包。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**镜像源只影响下载，不影响发布**

#### 镜像源配置

```ini
# .npmrc
registry=https://registry.npmmirror.com
```

**影响的命令：**
- ✅ npm install
- ✅ npm search
- ✅ npm view
- ❌ npm publish（不受影响）

#### npm publish 行为

```bash
npm publish
```

**发布流程：**
1. 读取 package.json 中的 publishConfig
2. 如果未配置，使用官方 registry
3. 忽略全局 registry 配置

**原因：**
- 镜像只读，不支持发布
- 发布必须到官方或私有 registry

#### 正确配置发布

```json
// package.json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org"
  }
}
```

**或临时指定：**

```bash
npm publish --registry https://registry.npmjs.org
```

#### 作用域包

```json
{
  "name": "@mycompany/package",
  "publishConfig": {
    "registry": "https://npm.mycompany.com"
  }
}
```

**.npmrc 配置：**

```ini
@mycompany:registry=https://npm.mycompany.com
```

#### 实际场景

```bash
# 1. 开发时使用淘宝镜像（快）
npm config set registry https://registry.npmmirror.com

# 2. 发布时自动使用官方源
npm publish  # 不受影响

# 3. 确认发布成功
npm view mypackage
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** .npmrc

### 题目

.npmrc 配置文件的优先级顺序是什么（从高到低）？

**选项：**
- A. 项目 > 用户 > 全局 > 内置
- B. 全局 > 用户 > 项目 > 内置
- C. 用户 > 项目 > 全局 > 内置
- D. 内置 > 全局 > 用户 > 项目

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**.npmrc 配置优先级**

#### 优先级顺序（从高到低）

**1. 项目级配置（最高）**
```bash
/path/to/project/.npmrc
```

**2. 用户级配置**
```bash
# macOS/Linux
~/.npmrc

# Windows
%USERPROFILE%\.npmrc
```

**3. 全局配置**
```bash
# 通过 npm config 设置
npm config get globalconfig
# /usr/local/etc/npmrc
```

**4. npm 内置默认配置（最低）**
```bash
# npm 源码中的默认值
```

#### 配置覆盖示例

**全局配置：**
```ini
# ~/.npmrc
registry=https://registry.npmjs.org
```

**项目配置：**
```ini
# /project/.npmrc
registry=https://registry.npmmirror.com  # ← 覆盖全局
```

**最终生效：**
```bash
cd /project
npm config get registry
# https://registry.npmmirror.com  ← 项目配置生效
```

#### 查看配置来源

```bash
# 查看所有配置
npm config list

# 输出：
; "user" config from /Users/xxx/.npmrc
registry = "https://registry.npmjs.org"

; "project" config from /project/.npmrc  ← 优先级高
registry = "https://registry.npmmirror.com"
```

#### 配置命令

```bash
# 设置项目配置
npm config set registry xxx

# 设置全局配置
npm config set registry xxx --global
npm config set registry xxx -g

# 删除配置
npm config delete registry

# 编辑配置文件
npm config edit
npm config edit --global
```

#### 最佳实践

**项目级（.npmrc）：**
```ini
# 提交到版本控制
registry=https://registry.npmmirror.com
@mycompany:registry=https://npm.mycompany.com
```

**用户级（~/.npmrc）：**
```ini
# 个人配置，不提交
//registry.npmjs.org/:_authToken=xxx
init-author-name=Your Name
```

**注意：**
```bash
# .gitignore
.npmrc  # 如果包含敏感信息
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 镜像源

### 题目

淘宝 npm 镜像的优势有哪些？

**选项：**
- A. 下载速度快（国内）
- B. 完全同步官方包
- C. 支持 npm publish
- D. 缓解官方 registry 压力

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、D

### 📖 解析

**淘宝 npm 镜像**

#### 镜像地址变更

**旧地址（已废弃）：**
```bash
https://registry.npm.taobao.org
```

**新地址：**
```bash
https://registry.npmmirror.com
```

#### 选项 A：下载速度快 ✅

**对比测试：**

```bash
# 官方源
time npm install lodash --registry https://registry.npmjs.org
# 2.5s

# 淘宝镜像
time npm install lodash --registry https://registry.npmmirror.com
# 0.8s  ⚡⚡⚡
```

**优势：**
- CDN 分发（国内节点）
- 带宽充足
- 延迟低

#### 选项 B：完全同步 ✅

**同步策略：**

```
官方 registry → 10分钟同步一次 → 淘宝镜像
```

**验证同步：**

```bash
# 查看最新版本
npm view lodash version --registry https://registry.npmjs.org
# 4.17.21

npm view lodash version --registry https://registry.npmmirror.com
# 4.17.21  ✅ 一致
```

**同步状态：**
```bash
# 访问
https://npmmirror.com/
# 显示同步进度
```

#### 选项 C：不支持 publish ❌

**镜像特性：**
- 只读镜像
- 不接受 npm publish
- 发布仍需官方源

```bash
npm publish --registry https://registry.npmmirror.com
# Error: This registry is read-only
```

#### 选项 D：缓解压力 ✅

**分流效果：**

```
官方 registry
├── 国外用户 → 直接访问
└── 国内用户 → 通过镜像（减轻官方负载）
```

**统计数据：**
- 淘宝镜像：每天数亿次请求
- 大幅减少对官方源的压力

#### 其他镜像源

**1. 华为云镜像**
```bash
https://repo.huaweicloud.com/repository/npm/
```

**2. 腾讯云镜像**
```bash
https://mirrors.cloud.tencent.com/npm/
```

**3. 公司私有镜像**
```bash
https://npm.company.com/
```

#### 配置镜像

**方式 1：.npmrc**
```ini
registry=https://registry.npmmirror.com
```

**方式 2：nrm 工具**
```bash
npm install -g nrm

# 列出镜像
nrm ls

# 切换镜像
nrm use taobao

# 测速
nrm test
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 作用域包

### 题目

以下配置的作用是什么？

```ini
# .npmrc
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=xxx
```

**选项：**
- A. 所有包都从私有源下载
- B. 只有 @mycompany 作用域的包从私有源下载
- C. 配置认证但不指定源
- D. 配置错误，无效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**作用域包配置**

#### 配置解析

**第一行：作用域 registry**
```ini
@mycompany:registry=https://npm.mycompany.com
```

**含义：**
- 只有 `@mycompany/*` 作用域的包使用私有源
- 其他包使用默认 registry

**第二行：认证令牌**
```ini
//npm.mycompany.com/:_authToken=xxx
```

**含义：**
- 访问 `npm.mycompany.com` 时使用的认证令牌
- 格式：`//{registry-domain}/:_authToken=token`

#### 实际效果

**安装作用域包：**

```bash
npm install @mycompany/utils
# ↓ 从私有源下载
# https://npm.mycompany.com/@mycompany/utils
```

**安装普通包：**

```bash
npm install lodash
# ↓ 从默认源下载
# https://registry.npmjs.org/lodash
```

#### 完整配置示例

```ini
# .npmrc
# 默认 registry（公共包）
registry=https://registry.npmmirror.com

# 作用域 registry（私有包）
@mycompany:registry=https://npm.mycompany.com
@another:registry=https://npm.another.com

# 认证
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
//npm.another.com/:_authToken=${ANOTHER_TOKEN}
```

#### package.json 示例

```json
{
  "dependencies": {
    "@mycompany/ui": "^1.0.0",      // 从私有源
    "@mycompany/utils": "^2.0.0",   // 从私有源
    "lodash": "^4.17.21",           // 从公共源
    "react": "^18.2.0"              // 从公共源
  }
}
```

#### 安全实践

**不要直接写 token：**

```ini
# ❌ 不要这样
//npm.mycompany.com/:_authToken=abc123

# ✅ 使用环境变量
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**设置环境变量：**

```bash
# macOS/Linux
export NPM_TOKEN=abc123

# Windows
set NPM_TOKEN=abc123

# .env 文件
NPM_TOKEN=abc123
```

**CI/CD：**

```yaml
# GitHub Actions
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### 多作用域配置

```ini
# 企业内部多个团队
@team-a:registry=https://npm.company.com/team-a
@team-b:registry=https://npm.company.com/team-b
@team-c:registry=https://npm.company.com/team-c

# 统一认证
//npm.company.com/:_authToken=${NPM_TOKEN}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 私有 registry

### 题目

搭建私有 npm registry 最轻量的方案是什么？

**选项：**
- A. Nexus Repository
- B. Verdaccio
- C. JFrog Artifactory
- D. 自建 HTTP 服务器

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**私有 registry 方案对比**

#### Verdaccio（最轻量）✅

**特点：**
- 轻量级（Node.js 编写）
- 安装简单
- 配置简单
- 适合中小团队

**安装：**

```bash
# 全局安装
npm install -g verdaccio

# 启动
verdaccio

# 访问
http://localhost:4873
```

**配置文件：**

```yaml
# config.yaml
storage: ./storage

auth:
  htpasswd:
    file: ./htpasswd

uplinks:
  npmjs:
    url: https://registry.npmmirror.com

packages:
  '@mycompany/*':
    access: $authenticated
    publish: $authenticated
    
  '**':
    access: $all
    proxy: npmjs

listen: 0.0.0.0:4873
```

#### Nexus Repository

**特点：**
- 功能强大
- 支持多种仓库（npm、Maven、Docker）
- 企业级
- 较重量（Java）

**适用场景：**
- 大型企业
- 需要多种仓库管理
- 已有 Nexus 环境

#### JFrog Artifactory

**特点：**
- 商业产品
- 功能最全
- 价格昂贵
- 支持 Monorepo

**适用场景：**
- 大型企业
- 预算充足
- 需要商业支持

#### 自建 HTTP 服务器

**特点：**
- 完全控制
- 复杂度高
- 不推荐

**需要实现：**
- registry API
- 包存储
- 认证授权
- 元数据管理

#### 方案对比

| 方案 | 难度 | 性能 | 功能 | 适用场景 |
|------|------|------|------|----------|
| **Verdaccio** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 中小团队 |
| **Nexus** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 大型企业 |
| **Artifactory** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 企业级 |
| **自建** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | 不推荐 |

#### Verdaccio Docker 部署

```dockerfile
FROM verdaccio/verdaccio:5

COPY config.yaml /verdaccio/conf/config.yaml

EXPOSE 4873

CMD ["verdaccio"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - "./storage:/verdaccio/storage"
      - "./config:/verdaccio/conf"
    restart: unless-stopped
```

#### 使用私有 registry

```bash
# 注册用户
npm adduser --registry http://localhost:4873

# 发布包
npm publish --registry http://localhost:4873

# 安装包
npm install @mycompany/pkg --registry http://localhost:4873

# 或配置 .npmrc
echo "registry=http://localhost:4873" > .npmrc
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** registry 优先级

### 题目

以下配置下，安装 `react` 会从哪个源下载？

```ini
# .npmrc
registry=https://registry.npmmirror.com

@types:registry=https://registry.npmjs.org
```

```bash
npm install react
```

**选项：**
- A. https://registry.npmmirror.com
- B. https://registry.npmjs.org
- C. 两个源都尝试
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**registry 匹配规则**

#### 包名分析

```
react  ← 普通包（无作用域）
```

**不匹配任何作用域规则**

#### 配置解析

**默认 registry：**
```ini
registry=https://registry.npmmirror.com  ← 生效
```

**作用域 registry：**
```ini
@types:registry=https://registry.npmjs.org
```

**只对 `@types/*` 包生效**

#### 匹配规则

```bash
# 普通包 → 使用默认 registry
npm install react
npm install lodash
# ↓ https://registry.npmmirror.com

# @types 作用域包 → 使用作用域 registry
npm install @types/react
npm install @types/node
# ↓ https://registry.npmjs.org

# 其他作用域包 → 使用默认 registry
npm install @babel/core
npm install @vue/compiler-core
# ↓ https://registry.npmmirror.com
```

#### 完整示例

```ini
# .npmrc
# 默认源（淘宝镜像）
registry=https://registry.npmmirror.com

# @types 包用官方源（类型定义可能更新快）
@types:registry=https://registry.npmjs.org

# 公司私有包
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**package.json：**

```json
{
  "dependencies": {
    "react": "^18.2.0",              // → 淘宝镜像
    "lodash": "^4.17.21",            // → 淘宝镜像
    "@types/react": "^18.2.0",       // → 官方源
    "@types/node": "^18.0.0",        // → 官方源
    "@mycompany/utils": "^1.0.0",    // → 私有源
    "@babel/core": "^7.0.0"          // → 淘宝镜像
  }
}
```

#### 调试 registry

```bash
# 查看配置
npm config list

# 查看特定包会使用哪个源
npm config get registry
npm config get @types:registry
npm config get @mycompany:registry

# 临时指定源
npm install react --registry https://registry.npmjs.org
```

#### 注意事项

**作用域必须精确匹配：**

```ini
# ✅ 正确
@types:registry=xxx

# ❌ 错误（不匹配 @types/react）
types:registry=xxx
@:registry=xxx
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 镜像同步

### 题目

为什么有时从淘宝镜像安装最新发布的包会失败？

**选项：**
- A. 淘宝镜像已关闭
- B. 镜像同步有延迟（10分钟）
- C. 包被镜像过滤
- D. 网络问题

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**镜像同步机制**

#### 同步延迟

**官方 → 镜像：**

```
1. 开发者发布包到官方源
2. 官方源更新
3. 10分钟后，镜像同步  ← 延迟
4. 镜像可用
```

**时间线：**

```
00:00  开发者 npm publish
00:00  官方源：lodash@4.17.22 ✅

00:05  镜像尚未同步
       npm install lodash@4.17.22 --registry 淘宝镜像
       ❌ 404 Not Found

00:10  镜像同步完成
       npm install lodash@4.17.22 --registry 淘宝镜像
       ✅ 成功
```

#### 解决方案

**方案 1：等待同步**

```bash
# 等10分钟再安装
```

**方案 2：临时使用官方源**

```bash
npm install lodash@latest --registry https://registry.npmjs.org
```

**方案 3：配置 fallback**

```ini
# .npmrc
registry=https://registry.npmmirror.com

# 如果镜像失败，自动使用官方源（某些工具支持）
```

#### 检查同步状态

**查看镜像信息：**

```bash
# 镜像包信息
npm view lodash --registry https://registry.npmmirror.com

# 官方包信息
npm view lodash --registry https://registry.npmjs.org

# 对比版本
npm view lodash version --registry https://registry.npmmirror.com
npm view lodash version --registry https://registry.npmjs.org
```

**访问镜像状态页：**

```
https://npmmirror.com/
# 显示最后同步时间
```

#### 其他可能原因

**选项 A：镜像关闭**
- 极少发生
- 通常有公告

**选项 C：包被过滤**
- 镜像通常同步所有包
- 除非特殊规则

**选项 D：网络问题**
- 可能但不是主要原因

#### 最佳实践

**1. 生产环境锁定版本**

```json
{
  "dependencies": {
    "lodash": "4.17.21"  // 精确版本，不会受影响
  }
}
```

**2. 使用 lock 文件**

```bash
npm ci  # 严格按 lock 文件安装
```

**3. 发布后等待**

```bash
# 发布包后
npm publish

# 告知用户：10分钟后可从镜像安装
```

**4. CI/CD 使用官方源**

```yaml
# .github/workflows/ci.yml
- name: Install
  run: npm ci
  env:
    NPM_CONFIG_REGISTRY: https://registry.npmjs.org
```

#### 镜像对比

| 镜像 | 同步间隔 | 可靠性 |
|------|---------|--------|
| 淘宝 npmmirror | 10分钟 | ⭐⭐⭐⭐⭐ |
| 华为云 | 30分钟 | ⭐⭐⭐⭐ |
| 腾讯云 | 1小时 | ⭐⭐⭐ |

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 私有包管理

### 题目

公司内部需要同时使用公共 npm 包和私有包，最佳方案是什么？

**选项：**
- A. 所有包都发布到私有 registry
- B. 使用作用域区分，私有包用作用域
- C. 维护两套项目
- D. fork 所有公共包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**混合使用公共包和私有包**

#### 推荐方案：作用域区分 ✅

**配置：**

```ini
# .npmrc
# 公共包 → 淘宝镜像
registry=https://registry.npmmirror.com

# 私有包 → 私有 registry
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**package.json：**

```json
{
  "dependencies": {
    "react": "^18.2.0",              // 公共包
    "lodash": "^4.17.21",            // 公共包
    "@mycompany/ui": "^1.0.0",       // 私有包
    "@mycompany/utils": "^2.0.0"     // 私有包
  }
}
```

**优势：**
- ✅ 配置简单
- ✅ 清晰区分
- ✅ 自动路由
- ✅ 无需维护公共包

#### 方案 A：全部私有 registry ❌

**做法：**
```
所有包（包括公共包）都缓存到私有 registry
```

**问题：**
- 需要同步所有公共包（200万+）
- 存储成本高
- 同步延迟
- 维护复杂

**适用场景：**
- 离线环境
- 严格审计要求

#### 方案 C：两套项目 ❌

**完全不合理**

#### 方案 D：fork 公共包 ❌

**问题：**
- 维护成本极高
- 无法及时更新
- 失去生态优势

#### 私有包命名规范

**推荐：**

```json
{
  "name": "@mycompany/package-name",
  "version": "1.0.0",
  "private": false,  // 允许发布
  "publishConfig": {
    "access": "restricted",  // 私有包
    "registry": "https://npm.mycompany.com"
  }
}
```

**包命名：**

```
@mycompany/ui           # UI 组件库
@mycompany/utils        # 工具库
@mycompany/api-client   # API 客户端
@mycompany/config       # 配置
```

#### 私有 registry 代理配置

**Verdaccio 配置：**

```yaml
# config.yaml
uplinks:
  npmjs:
    url: https://registry.npmmirror.com

packages:
  # 私有包
  '@mycompany/*':
    access: $authenticated
    publish: $authenticated
    
  # 公共包（代理到镜像）
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs
```

**工作流程：**

```
1. 安装 @mycompany/ui
   → 私有 registry 本地查找 ✅

2. 安装 lodash
   → 私有 registry 本地查找 ❌
   → 代理到 npmjs 镜像
   → 缓存到本地
   → 下次直接使用缓存
```

#### CI/CD 配置

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        
      - name: Configure npm
        run: |
          echo "@mycompany:registry=https://npm.mycompany.com" >> .npmrc
          echo "//npm.mycompany.com/:_authToken=${{ secrets.NPM_TOKEN }}" >> .npmrc
          
      - name: Install
        run: npm ci
```

#### 发布流程

```bash
# 发布私有包
cd packages/ui
npm publish  # 自动发布到私有 registry

# 验证
npm view @mycompany/ui --registry https://npm.mycompany.com
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 镜像切换

### 题目

如何快速切换 npm registry（不使用第三方工具）？

**选项：**
- A. 手动编辑 .npmrc
- B. 使用 npm config set
- C. 使用 shell alias
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**多种切换 registry 的方法**

#### 方法 A：手动编辑 .npmrc ✅

```bash
# 编辑配置文件
vim ~/.npmrc

# 修改
registry=https://registry.npmmirror.com
```

**优点：**
- 直观
- 持久化

**缺点：**
- 手动操作
- 容易出错

#### 方法 B：npm config ✅

```bash
# 切换到淘宝镜像
npm config set registry https://registry.npmmirror.com

# 切换到官方源
npm config set registry https://registry.npmjs.org

# 查看当前
npm config get registry

# 恢复默认
npm config delete registry
```

**优点：**
- 命令行操作
- 自动写入 .npmrc

#### 方法 C：Shell Alias ✅

**Bash/Zsh：**

```bash
# ~/.bashrc 或 ~/.zshrc
alias npm-taobao='npm config set registry https://registry.npmmirror.com'
alias npm-default='npm config set registry https://registry.npmjs.org'
alias npm-registry='npm config get registry'

# 使用
source ~/.bashrc
npm-taobao  # 切换到淘宝
npm-default # 切换到官方
npm-registry # 查看当前
```

**高级版本：**

```bash
# 函数
npm-use() {
  case $1 in
    taobao)
      npm config set registry https://registry.npmmirror.com
      echo "✅ 已切换到淘宝镜像"
      ;;
    npm)
      npm config set registry https://registry.npmjs.org
      echo "✅ 已切换到官方源"
      ;;
    *)
      echo "当前源：$(npm config get registry)"
      ;;
  esac
}

# 使用
npm-use taobao
npm-use npm
npm-use  # 查看当前
```

#### 方法 D：临时切换

**单次命令：**

```bash
# 临时使用淘宝镜像
npm install lodash --registry https://registry.npmmirror.com

# 临时使用官方源
npm publish --registry https://registry.npmjs.org
```

**项目级配置：**

```bash
# 在项目根目录创建 .npmrc
echo "registry=https://registry.npmmirror.com" > .npmrc

# 提交到版本控制
git add .npmrc
```

#### 推荐：nrm 工具

```bash
# 安装
npm install -g nrm

# 列出镜像
nrm ls

# 切换
nrm use taobao
nrm use npm

# 测速
nrm test

# 添加自定义
nrm add company https://npm.company.com
```

**nrm 原理：**
- 就是封装了 `npm config set registry`
- 提供更友好的交互

#### 完整脚本示例

```bash
#!/bin/bash
# npm-switch.sh

TAOBAO="https://registry.npmmirror.com"
NPM="https://registry.npmjs.org"

function show_current() {
  CURRENT=$(npm config get registry)
  echo "当前源：$CURRENT"
}

function switch_registry() {
  case $1 in
    taobao)
      npm config set registry $TAOBAO
      echo "✅ 已切换到淘宝镜像"
      ;;
    npm)
      npm config set registry $NPM
      echo "✅ 已切换到官方源"
      ;;
    show)
      show_current
      ;;
    *)
      echo "用法: npm-switch [taobao|npm|show]"
      show_current
      ;;
  esac
}

switch_registry $1
```

**使用：**

```bash
chmod +x npm-switch.sh

./npm-switch.sh taobao
./npm-switch.sh npm
./npm-switch.sh show
```

#### 最佳实践

**开发环境：**
```ini
# ~/.npmrc（全局）
registry=https://registry.npmmirror.com
```

**项目配置：**
```ini
# project/.npmrc
@mycompany:registry=https://npm.mycompany.com
```

**CI/CD：**
```bash
# 使用官方源，避免镜像延迟
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org
npm ci
```

</details>

---

**导航**  
[上一章：第 3 章面试题](./chapter-03.md) | [返回目录](../README.md) | [下一章：第 5 章面试题](./chapter-05.md)
