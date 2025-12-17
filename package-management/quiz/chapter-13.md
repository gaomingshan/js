# 第 13 章：npm 私有包与企业应用 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 私有包基础

### 题目

如何区分公有包和私有包？

**选项：**
- A. 公有包免费，私有包付费
- B. 公有包使用作用域，私有包不使用
- C. 私有包需要认证才能访问
- D. 没有区别

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**公有包 vs 私有包**

#### 公有包

```bash
npm install lodash
# 任何人都可以访问
# 无需认证
```

#### 私有包

```bash
npm install @company/utils
# 需要认证
# 只有授权用户可访问
```

**区别：**

| 特性 | 公有包 | 私有包 |
|------|--------|--------|
| **访问** | 公开 | 需认证 |
| **费用** | 免费 | 付费/私有registry免费 |
| **作用域** | 可选 | 通常使用 |
| **npm.com** | ✅ | 需付费订阅 |
| **私有registry** | ✅ | ✅ 免费 |

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** Verdaccio

### 题目

Verdaccio 是一个轻量级的私有 npm registry。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Verdaccio 简介**

#### 特点

```bash
# 安装
npm install -g verdaccio

# 运行
verdaccio

# 监听端口 4873
http://localhost:4873
```

**优势：**
- ✅ 开源免费
- ✅ 零配置启动
- ✅ 支持私有包
- ✅ 上游代理（缓存公有包）
- ✅ 轻量级（适合小团队）

#### 基础使用

**发布私有包：**
```bash
# 1. 配置 registry
npm set registry http://localhost:4873

# 2. 创建用户
npm adduser --registry http://localhost:4873

# 3. 发布
npm publish
```

**安装：**
```bash
npm install @company/package --registry http://localhost:4873
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** npmrc配置

### 题目

如何配置项目使用私有 registry？

**选项：**
- A. 修改 package.json
- B. 创建 .npmrc 文件
- C. 运行 npm config set
- D. 修改 package-lock.json

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**配置私有 registry**

#### 方法 1：项目级 .npmrc（推荐）

```ini
# .npmrc
registry=https://npm.company.com

# 或仅作用域包
@company:registry=https://npm.company.com
```

**优势：**
- ✅ 团队共享配置
- ✅ 版本控制
- ✅ 项目隔离

#### 方法 2：用户级配置

```bash
npm config set registry https://npm.company.com

# 写入 ~/.npmrc
```

#### 方法 3：命令行参数

```bash
npm install --registry https://npm.company.com
```

**临时使用，不推荐**

#### 混合配置示例

```ini
# .npmrc
# 公有包使用官方源
registry=https://registry.npmjs.org

# 私有包使用企业源
@company:registry=https://npm.company.com
//npm.company.com/:_authToken=${NPM_TOKEN}

# 镜像加速
@myorg:registry=https://registry.npmmirror.com
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 私有registry方案

### 题目

企业可以使用哪些私有 npm registry 方案？

**选项：**
- A. Verdaccio
- B. npm Enterprise
- C. Artifactory
- D. Nexus

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**私有 Registry 方案对比**

#### A. Verdaccio ✅（开源）

```bash
npm install -g verdaccio
verdaccio
```

**特点：**
- 免费开源
- 简单易用
- 适合小团队
- 支持 Docker

#### B. npm Enterprise ✅（官方）

```bash
# npm 官方企业版
# 商业付费
```

**特点：**
- 官方支持
- 高可用
- 安全审计
- 适合大企业

#### C. JFrog Artifactory ✅（企业级）

**特点：**
- 支持多种包管理器
- 企业级功能
- 高度可扩展
- 付费

#### D. Sonatype Nexus ✅（企业级）

**特点：**
- 开源/商业版
- 多格式支持
- 企业级
- 安全扫描

#### 方案对比

| 方案 | 类型 | 费用 | 适用规模 | 推荐度 |
|------|------|------|----------|--------|
| **Verdaccio** | 开源 | 免费 | 小团队 | ⭐⭐⭐⭐⭐ |
| **npm Enterprise** | 商业 | 付费 | 大企业 | ⭐⭐⭐⭐ |
| **Artifactory** | 商业 | 付费 | 大企业 | ⭐⭐⭐⭐⭐ |
| **Nexus** | 开源/商业 | 免费/付费 | 中大型 | ⭐⭐⭐⭐ |

#### Docker 部署示例

**Verdaccio：**
```yaml
# docker-compose.yml
version: '3'
services:
  verdaccio:
    image: verdaccio/verdaccio
    ports:
      - "4873:4873"
    volumes:
      - ./storage:/verdaccio/storage
      - ./config:/verdaccio/conf
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 认证配置

### 题目

如何在 CI/CD 中安全地使用私有 registry？

**选项：**
- A. 硬编码 token
- B. 使用环境变量
- C. 提交 .npmrc
- D. 使用 npm login

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CI/CD 认证最佳实践**

#### 方案 B：环境变量 ✅

**.npmrc（提交到 Git）：**
```ini
@company:registry=https://npm.company.com
//npm.company.com/:_authToken=${NPM_TOKEN}
```

**GitHub Actions：**
```yaml
- name: Install
  run: npm ci
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**优势：**
- ✅ token 不暴露在代码中
- ✅ 可以提交 .npmrc
- ✅ 灵活管理凭证

#### 错误方案

**A. 硬编码 ❌**
```ini
//npm.company.com/:_authToken=npm_abc123  # ❌ 危险
```

**C. 提交 .npmrc ❌**
```ini
# .npmrc 包含 token
//npm.company.com/:_authToken=real_token  # ❌ 泄露
```

**D. npm login ❌**
```yaml
- run: npm login  # ❌ 交互式，CI 无法使用
```

#### 完整 CI 配置

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Create .npmrc
        run: |
          echo "@company:registry=https://npm.company.com" > .npmrc
          echo "//npm.company.com/:_authToken=\${NPM_TOKEN}" >> .npmrc
      
      - name: Install
        run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Test
        run: npm test
```

#### 多 registry 配置

```ini
# .npmrc
registry=https://registry.npmjs.org

@company:registry=https://npm.company.com
//npm.company.com/:_authToken=${COMPANY_TOKEN}

@partner:registry=https://npm.partner.com
//npm.partner.com/:_authToken=${PARTNER_TOKEN}
```

```yaml
env:
  COMPANY_TOKEN: ${{ secrets.COMPANY_TOKEN }}
  PARTNER_TOKEN: ${{ secrets.PARTNER_TOKEN }}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 包代理

### 题目

Verdaccio 的 uplinks 配置用于什么？

**选项：**
- A. 配置多个存储位置
- B. 配置上游 registry 代理
- C. 配置用户权限
- D. 配置网络链接

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Verdaccio uplinks 配置**

#### 基础配置

```yaml
# config.yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  
  taobao:
    url: https://registry.npmmirror.com/
```

**作用：** 配置上游 registry，作为代理缓存

#### 包路由

```yaml
packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    # 不使用 uplinks（纯私有）
  
  '*':
    access: $all
    proxy: npmjs  # 代理到 npmjs uplink
```

#### 工作流程

```bash
npm install lodash

# 1. 检查 Verdaccio 本地缓存
# 2. 未命中 → 请求 uplinks.npmjs
# 3. 下载并缓存
# 4. 返回给客户端

# 下次安装
# 1. 命中本地缓存 ✅
# 2. 直接返回（更快）
```

#### 高级配置

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    timeout: 30s
    maxage: 2m
    max_fails: 3
    fail_timeout: 5m
  
  internal:
    url: https://npm.internal.com/
    auth:
      type: bearer
      token: ${INTERNAL_TOKEN}
```

#### 多 uplink 策略

```yaml
packages:
  'react':
    proxy: npmjs  # React 从官方源
  
  '@babel/*':
    proxy: taobao  # Babel 从镜像
  
  '*':
    proxy: npmjs taobao  # 其他包尝试多个源
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 包访问控制

### 题目

以下 Verdaccio 配置中，谁可以发布包？

```yaml
packages:
  '@company/*':
    access: $authenticated
    publish: admin
  
  '*':
    access: $all
    publish: $authenticated
```

**选项：**
- A. 所有人
- B. 认证用户
- C. 只有 admin 组
- D. @company 包只有 admin，其他包认证用户可发布

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Verdaccio 访问控制**

#### 配置解读

```yaml
packages:
  '@company/*':        # 作用域包
    access: $authenticated    # 已认证用户可访问
    publish: admin            # 只有 admin 组可发布 ✅
  
  '*':                 # 其他所有包
    access: $all              # 所有人可访问
    publish: $authenticated   # 已认证用户可发布 ✅
```

#### 权限级别

```yaml
$all            # 所有人（包括匿名）
$authenticated  # 已认证用户
$anonymous      # 匿名用户
admin           # admin 组
developer       # developer 组
```

#### 用户组配置

```yaml
auth:
  htpasswd:
    file: ./htpasswd

# htpasswd 文件
# admin:$apr1$...（密码哈希）
# developer:$apr1$...
```

**创建用户：**
```bash
htpasswd -c htpasswd admin
htpasswd htpasswd developer
```

#### 实际场景

```yaml
packages:
  # 核心库：只有管理员
  '@company/core':
    access: $authenticated
    publish: admin
    unpublish: admin
  
  # 工具库：开发者可发布
  '@company/utils':
    access: $authenticated
    publish: developer admin
  
  # 实验性包：所有认证用户
  '@company/experimental':
    access: $authenticated
    publish: $authenticated
  
  # 公有包代理：只读
  '*':
    access: $all
    publish: nobody
    proxy: npmjs
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 企业部署

### 题目

如何在企业中部署高可用的私有 npm registry？

**选项：**
- A. 单机部署 Verdaccio
- B. Verdaccio + 云存储 + 负载均衡
- C. 使用商业方案
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**企业级部署方案**

#### 方案 B：Verdaccio 高可用 ✅

**架构：**
```
用户 → 负载均衡 → Verdaccio 实例1 →  云存储（S3/OSS）
                → Verdaccio 实例2 ↗
                → Verdaccio 实例3 ↗
```

**Docker Compose：**
```yaml
version: '3'

services:
  verdaccio-1:
    image: verdaccio/verdaccio
    volumes:
      - ./config:/verdaccio/conf
      - s3-storage:/verdaccio/storage
    environment:
      - VERDACCIO_PORT=4873
  
  verdaccio-2:
    image: verdaccio/verdaccio
    volumes:
      - ./config:/verdaccio/conf
      - s3-storage:/verdaccio/storage
  
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - verdaccio-1
      - verdaccio-2

volumes:
  s3-storage:
    driver: rexray/s3fs
```

**Verdaccio 配置（S3）：**
```yaml
# config.yaml
storage: /verdaccio/storage

store:
  aws-s3-storage:
    bucket: my-npm-registry
    region: us-east-1
    keyPrefix: packages/

uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true

packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
  
  '*':
    access: $all
    proxy: npmjs
```

**Nginx 负载均衡：**
```nginx
upstream verdaccio {
    server verdaccio-1:4873;
    server verdaccio-2:4873;
}

server {
    listen 80;
    server_name npm.company.com;

    location / {
        proxy_pass http://verdaccio;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 方案 C：商业方案 ✅

**JFrog Artifactory：**
```yaml
# Kubernetes 部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: artifactory
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: artifactory
        image: docker.bintray.io/jfrog/artifactory-pro
        volumeMounts:
        - name: data
          mountPath: /var/opt/jfrog/artifactory
```

**特点：**
- 高可用内置
- 企业级支持
- 完善的权限系统
- 多数据中心

#### 对比

| 方案 | 成本 | 复杂度 | 可用性 | 推荐场景 |
|------|------|--------|--------|----------|
| **单机 Verdaccio** | 💰 | ⭐ | ⭐⭐ | 开发测试 |
| **HA Verdaccio** | 💰💰 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 中小企业 |
| **Artifactory** | 💰💰💰💰 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 大企业 |

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 迁移策略

### 题目

如何将现有项目从公有 npm 迁移到私有 registry？

<details>
<summary>查看答案</summary>

### ✅ 答案

**迁移步骤**

#### 1. 搭建私有 Registry

```bash
# 使用 Docker
docker run -d \
  --name verdaccio \
  -p 4873:4873 \
  -v $PWD/storage:/verdaccio/storage \
  verdaccio/verdaccio
```

#### 2. 配置项目

**创建 .npmrc：**
```ini
# .npmrc
# 私有包使用私有源
@company:registry=http://localhost:4873

# 公有包仍使用官方源
registry=https://registry.npmjs.org
```

#### 3. 迁移私有包

```bash
# 登录私有 registry
npm adduser --registry http://localhost:4873

# 发布现有私有包
cd my-private-package
npm publish --registry http://localhost:4873
```

#### 4. 更新依赖

**package.json：**
```json
{
  "dependencies": {
    "@company/utils": "^1.0.0",  // 改为私有包
    "lodash": "^4.17.21"          // 公有包不变
  }
}
```

#### 5. 团队配置

**分发配置：**
```bash
# 1. 创建模板
cat > .npmrc.template << EOF
@company:registry=http://npm.company.com
//npm.company.com/:_authToken=\${NPM_TOKEN}
EOF

# 2. 文档说明
echo "复制 .npmrc.template 为 .npmrc 并设置 NPM_TOKEN"
```

#### 6. CI/CD 更新

```yaml
# 更新前
- run: npm install

# 更新后
- name: Setup npm
  run: |
    echo "@company:registry=http://npm.company.com" > .npmrc
    echo "//npm.company.com/:_authToken=\${NPM_TOKEN}" >> .npmrc
  
- run: npm ci
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 📖 解析

**完整迁移计划**

**阶段 1：准备（1-2天）**
- 搭建私有 registry
- 测试基础功能
- 准备文档

**阶段 2：试点（1周）**
- 选择 1-2 个项目试点
- 迁移私有包
- 收集反馈

**阶段 3：推广（2-4周）**
- 迁移所有项目
- 培训团队
- 更新 CI/CD

**阶段 4：优化（持续）**
- 监控性能
- 优化缓存
- 改进流程

**回滚方案：**
```ini
# 临时回滚到官方源
registry=https://registry.npmjs.org
# @company:registry=http://npm.company.com  # 注释掉
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 自动化管理

### 题目

如何自动化管理私有包的发布和版本？

<details>
<summary>查看答案</summary>

### ✅ 答案

**自动化发布方案**

#### 1. semantic-release 配置

**package.json：**
```json
{
  "name": "@company/utils",
  "version": "0.0.0-development",
  "publishConfig": {
    "registry": "https://npm.company.com",
    "access": "restricted"
  },
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      ["@semantic-release/npm", {
        "npmPublish": true
      }],
      "@semantic-release/git",
      ["@semantic-release/gitlab", {
        "gitlabUrl": "https://gitlab.company.com"
      }]
    ]
  }
}
```

#### 2. CI/CD 配置

**GitLab CI：**
```yaml
# .gitlab-ci.yml
stages:
  - test
  - release

test:
  stage: test
  script:
    - npm ci
    - npm test

release:
  stage: release
  only:
    - main
  script:
    # 配置 npm
    - echo "@company:registry=https://npm.company.com" > .npmrc
    - echo "//npm.company.com/:_authToken=${NPM_TOKEN}" >> .npmrc
    
    # 运行 semantic-release
    - npx semantic-release
  variables:
    NPM_TOKEN: $NPM_TOKEN
    GITLAB_TOKEN: $GITLAB_TOKEN
```

#### 3. Monorepo 管理

**使用 Changesets：**
```bash
npm install -D @changesets/cli
npx changeset init
```

**.changeset/config.json：**
```json
{
  "changelog": ["@changesets/changelog-github", {
    "repo": "company/monorepo"
  }],
  "commit": false,
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**GitHub Actions：**
```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v3
      
      - run: npm ci
      
      - name: Configure npm
        run: |
          echo "@company:registry=https://npm.company.com" > .npmrc
          echo "//npm.company.com/:_authToken=${NPM_TOKEN}" >> .npmrc
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          version: npm run version
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**package.json scripts：**
```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

#### 4. 版本策略

**Lerna + Conventional Commits：**
```json
{
  "version": "independent",
  "command": {
    "version": {
      "conventionalCommits": true,
      "createRelease": "gitlab",
      "message": "chore(release): publish"
    },
    "publish": {
      "registry": "https://npm.company.com",
      "ignoreChanges": ["*.md", "test/**"]
    }
  }
}
```

### 📖 解析

**完整自动化流程**

```
开发 → Commit → Push
  ↓
CI 检测到 main 分支
  ↓
运行测试
  ↓
分析 commits（conventional）
  ↓
确定版本号
  ├─ fix: → patch (1.0.0 → 1.0.1)
  ├─ feat: → minor (1.0.0 → 1.1.0)
  └─ BREAKING: → major (1.0.0 → 2.0.0)
  ↓
生成 CHANGELOG
  ↓
创建 Git tag
  ↓
发布到私有 registry
  ↓
创建 Release 页面
  ↓
发送通知
```

**零手动干预！**

</details>

---

**导航**  
[上一章：第 12 章面试题](./chapter-12.md) | [返回目录](../README.md) | [下一章：第 14 章面试题](./chapter-14.md)
