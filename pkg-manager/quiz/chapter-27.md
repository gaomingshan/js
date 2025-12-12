# 第 27 章：依赖安全与审计 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 安全审计命令

### 题目

检查项目安全漏洞的命令是什么？

**选项：**
- A. npm check
- B. npm audit
- C. npm security
- D. npm scan

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm audit 命令**

#### 基本用法

```bash
# 检查漏洞
npm audit

# 输出：
# found 5 vulnerabilities (2 low, 1 moderate, 2 high)
```

#### 自动修复

```bash
# 修复漏洞
npm audit fix

# 强制修复（可能破坏性）
npm audit fix --force
```

#### 查看详情

```bash
# JSON 格式
npm audit --json

# 只显示生产依赖
npm audit --production
```

#### 其他包管理器

**yarn：**
```bash
yarn audit
yarn audit --level high
```

**pnpm：**
```bash
pnpm audit
pnpm audit --fix
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** package-lock安全

### 题目

package-lock.json 包含依赖的完整性哈希。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**package-lock.json 完整性校验**

#### integrity 字段

```json
{
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="
    }
  }
}
```

**SHA-512 哈希值**

#### 工作原理

```bash
# 安装时验证
npm install

# 1. 下载包
# 2. 计算 SHA-512
# 3. 对比 integrity 字段
# 4. 不匹配则报错
```

**防止包被篡改**

#### 示例

**如果包被修改：**
```bash
npm install

# Error: Integrity check failed!
# Expected: sha512-abc...
# Actual:   sha512-xyz...
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 安全工具

### 题目

Snyk 是什么类型的工具？

**选项：**
- A. 构建工具
- B. 安全扫描工具
- C. 测试工具
- D. 打包工具

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Snyk 安全扫描工具**

#### 功能

- 🔍 依赖漏洞扫描
- 🔧 自动修复
- 📊 持续监控
- 🎯 许可证检查

#### 使用

```bash
# 安装
npm install -g snyk

# 认证
snyk auth

# 测试
snyk test

# 监控
snyk monitor
```

#### 输出示例

```
Testing /path/to/project...

✗ High severity vulnerability found in lodash
  Description: Prototype Pollution
  Info: https://snyk.io/vuln/SNYK-JS-LODASH-590103
  From: lodash@4.17.19
  Fixed in: 4.17.21
  
Tested 245 dependencies for known issues
Found 3 issues
```

#### CI 集成

```yaml
- name: Run Snyk
  run: |
    npm install -g snyk
    snyk test --severity-threshold=high
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 安全最佳实践

### 题目

依赖安全的最佳实践有哪些？

**选项：**
- A. 定期运行 audit
- B. 锁定版本
- C. 使用 .npmrc 配置验证
- D. 代码审查

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**依赖安全最佳实践**

#### A. 定期审计 ✅

```bash
# 开发环境
npm audit

# CI/CD
npm audit --production --audit-level=moderate
```

**自动化检测**

#### B. 锁定版本 ✅

**package.json：**
```json
{
  "dependencies": {
    "lodash": "4.17.21"  // ✅ 精确版本
  }
}
```

**避免：**
```json
{
  "dependencies": {
    "lodash": "*"  // ❌ 任意版本
  }
}
```

#### C. .npmrc 配置 ✅

```ini
# 强制完整性检查
strict-ssl=true

# 验证签名
audit=true

# 只允许特定 registry
registry=https://registry.npmjs.org
```

#### D. 代码审查 ✅

```bash
# PR 流程
1. 查看 package.json 变更
2. 检查新增依赖
3. 运行 npm audit
4. 评估风险
```

#### 完整安全策略

**1. 安装前检查：**
```bash
# 查看包信息
npm info lodash

# 检查下载量、维护状态
```

**2. 自动化扫描：**
```yaml
# GitHub Actions
- name: Security audit
  run: npm audit --production
```

**3. 依赖更新策略：**
```bash
# 定期更新
npm update

# 测试后发布
```

**4. 监控告警：**
```bash
# Dependabot
# Snyk
# 自动 PR
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 漏洞修复

### 题目

如何处理无法自动修复的安全漏洞？

**选项：**
- A. 忽略
- B. 手动更新
- C. 使用 overrides
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**无法自动修复的漏洞处理**

#### 场景

```bash
npm audit fix

# 输出：
# fixed 3 of 5 vulnerabilities
# 
# 2 vulnerabilities require manual review
# - lodash (in pkg-a > pkg-b > lodash)
```

#### 方案 B：手动更新 ✅

**1. 查看依赖链：**
```bash
npm why lodash

# pkg-a@1.0.0
# └─┬ pkg-b@2.0.0
#   └── lodash@4.17.19  ← 旧版本
```

**2. 更新中间包：**
```bash
npm update pkg-b

# 如果 pkg-b 最新版使用了新的 lodash
```

**3. 联系维护者：**
```bash
# 提 issue
# 提 PR
```

#### 方案 C：使用 overrides ✅

**package.json：**
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

**强制使用安全版本**

```bash
npm install

# 所有 lodash 都变成 4.17.21
```

#### pnpm 方式

```json
{
  "pnpm": {
    "overrides": {
      "pkg-a>pkg-b>lodash": "4.17.21"
    }
  }
}
```

#### Yarn 方式

```json
{
  "resolutions": {
    "**/lodash": "4.17.21"
  }
}
```

#### 临时豁免（不推荐）

**仅用于无法修复且风险可控：**
```bash
# 创建 .auditignore
echo "GHSA-xxxx-xxxx-xxxx" > .auditignore

# 或
npm audit --audit-level=high
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 供应链攻击

### 题目

什么是供应链攻击（Supply Chain Attack）？

**选项：**
- A. 黑客攻击服务器
- B. 恶意代码注入依赖包
- C. DDoS 攻击
- D. SQL 注入

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**供应链攻击**

#### 定义

攻击者通过污染上游依赖来攻击下游应用。

#### 真实案例

**event-stream 事件（2018）：**
```javascript
// event-stream 被植入恶意代码
// 窃取比特币钱包
// 影响数百万项目
```

**ua-parser-js 事件（2021）：**
```javascript
// 包被劫持
// 植入挖矿和密码窃取代码
```

#### 攻击方式

**1. 账号劫持：**
```
攻击者获取维护者账号
→ 发布恶意版本
→ 用户自动更新
```

**2. 依赖混淆：**
```
创建同名内部包的公开版本
→ 包管理器优先安装公开版
→ 恶意代码执行
```

**3. 供应商妥协：**
```
收购或接管包维护权
→ 逐步植入恶意代码
```

#### 防护措施

**1. 锁定版本：**
```json
{
  "dependencies": {
    "lodash": "4.17.21"  // 不要用 ^~*
  }
}
```

**2. 审查更新：**
```bash
# 查看更新内容
npm diff lodash@4.17.20 lodash@4.17.21
```

**3. 使用私有 registry：**
```ini
# .npmrc
registry=https://private-registry.company.com
```

**4. 启用 2FA：**
```bash
npm profile enable-2fa auth-and-writes
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** license检查

### 题目

如何检查项目中依赖的开源许可证？

**选项：**
- A. license-checker
- B. npm-license
- C. legally
- D. A 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**许可证检查工具**

#### A. license-checker ✅

```bash
# 安装
npm install -g license-checker

# 检查
license-checker --summary

# 输出：
# MIT: 245
# Apache-2.0: 12
# BSD-3-Clause: 8
```

**详细信息：**
```bash
license-checker --json > licenses.json
```

#### C. legally ✅

```bash
# 安装
npm install -g legally

# 检查
legally

# 输出：
# ✓ All packages have valid licenses
# 
# Licenses found:
# - MIT (245 packages)
# - Apache-2.0 (12 packages)
```

#### 许可证风险

**兼容性问题：**
```
MIT + Apache-2.0  ✅ 兼容
MIT + GPL         ⚠️  需注意
GPL + 商业应用     ❌ 不兼容
```

#### CI 集成

```yaml
- name: Check licenses
  run: |
    npm install -g license-checker
    license-checker --failOn 'GPL;AGPL'
```

**拒绝特定许可证**

#### 配置白名单

**package.json：**
```json
{
  "license-checker-config": {
    "allow": ["MIT", "Apache-2.0", "BSD-3-Clause"],
    "reject": ["GPL", "AGPL"]
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 安全策略

### 题目

设计一个完整的依赖安全策略。

<details>
<summary>查看答案</summary>

### ✅ 答案

**企业级依赖安全策略**

#### 1. 预防阶段

**安装前验证：**
```bash
# 检查包信息
npm info <package>

# 查看：
# - 下载量（流行度）
# - 最后更新时间（活跃度）
# - 维护者（可信度）
# - GitHub stars
```

**自动化工具：**
```bash
# Socket.dev
npx socket npm install lodash

# 分析：
# - 网络请求
# - 文件系统访问
# - Shell 命令
# - 环境变量读取
```

#### 2. 检测阶段

**多层扫描：**
```yaml
# .github/workflows/security.yml
name: Security

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # 1. npm audit
      - name: NPM Audit
        run: npm audit --production --audit-level=high
      
      # 2. Snyk
      - name: Snyk Test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      # 3. 许可证检查
      - name: License Check
        run: |
          npm install -g license-checker
          license-checker --failOn 'GPL;AGPL'
      
      # 4. 供应链检查
      - name: Socket Security
        run: npx @socketsecurity/cli scan
```

#### 3. 响应阶段

**漏洞响应流程：**
```
发现漏洞
    ↓
评估严重性
    ↓
┌─────────────────┐
│  Critical/High  │ → 立即修复（24h内）
├─────────────────┤
│  Medium         │ → 计划修复（1周内）
├─────────────────┤
│  Low            │ → 下次更新修复
└─────────────────┘
    ↓
修复验证
    ↓
部署上线
```

#### 4. 配置管理

**.npmrc（组织级）：**
```ini
# 强制 HTTPS
strict-ssl=true

# 私有 registry
registry=https://npm.company.com

# 启用审计
audit=true
audit-level=moderate

# 签名验证
verify-signatures=true
```

**package.json（项目级）：**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "overrides": {
    "lodash": "4.17.21",
    "minimist": "^1.2.6"
  }
}
```

#### 5. 监控告警

**Dependabot 配置：**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: daily
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

**Snyk 监控：**
```bash
# 持续监控
snyk monitor

# Slack 告警
# Email 通知
```

#### 6. 审计日志

```javascript
// scripts/audit-log.js
const fs = require('fs');
const { execSync } = require('child_process');

const log = {
  timestamp: new Date().toISOString(),
  dependencies: {},
  audit: {},
  licenses: {}
};

// 记录依赖变更
const lockfile = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
log.dependencies = {
  count: Object.keys(lockfile.packages).length,
  hash: execSync('sha256sum package-lock.json').toString().split(' ')[0]
};

// 审计结果
try {
  const audit = JSON.parse(execSync('npm audit --json').toString());
  log.audit = {
    vulnerabilities: audit.metadata.vulnerabilities,
    summary: audit.metadata.summary
  };
} catch (e) {}

// 保存
fs.appendFileSync('audit.log', JSON.stringify(log) + '\n');
```

### 📖 解析

**安全分层防御**

1. **预防** - 源头控制
2. **检测** - 多重扫描
3. **响应** - 快速修复
4. **配置** - 安全加固
5. **监控** - 持续跟踪
6. **审计** - 可追溯性

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 私有registry

### 题目

如何建立企业私有 npm registry？

<details>
<summary>查看答案</summary>

### ✅ 答案

**企业私有 Registry 方案**

#### 方案 1：Verdaccio（开源）

**安装：**
```bash
npm install -g verdaccio

# 启动
verdaccio
```

**config.yaml：**
```yaml
storage: ./storage

auth:
  htpasswd:
    file: ./htpasswd
    max_users: 1000

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
  
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs

listen: 0.0.0.0:4873
```

**Docker 部署：**
```dockerfile
FROM verdaccio/verdaccio:5

COPY config.yaml /verdaccio/conf/

EXPOSE 4873

CMD ["verdaccio", "--config", "/verdaccio/conf/config.yaml"]
```

#### 方案 2：npm Enterprise

**商业方案：**
- 完整功能
- 技术支持
- 高可用
- 审计日志

#### 方案 3：Nexus Repository

**配置 npm registry：**
```
1. 创建 npm (hosted) repository
2. 创建 npm (proxy) repository → npmjs.org
3. 创建 npm (group) repository
```

**使用：**
```bash
npm config set registry http://nexus.company.com/repository/npm-group/
```

#### 客户端配置

**.npmrc：**
```ini
# 全局配置
registry=http://npm.company.com

# Scope 配置
@company:registry=http://npm.company.com
@external:registry=https://registry.npmjs.org

# 认证
//npm.company.com/:_authToken=${NPM_TOKEN}
```

#### 发布流程

**1. 登录：**
```bash
npm login --registry=http://npm.company.com
```

**2. 发布：**
```bash
npm publish
```

**3. 安装：**
```bash
npm install @company/package
```

#### CI/CD 集成

```yaml
- name: Setup npm
  run: |
    echo "registry=http://npm.company.com" > .npmrc
    echo "//npm.company.com/:_authToken=${{ secrets.NPM_TOKEN }}" >> .npmrc

- name: Install
  run: npm ci

- name: Publish
  run: npm publish
```

### 📖 解析

**私有 Registry 优势**

1. **安全** - 内部包不公开
2. **缓存** - 加速安装
3. **控制** - 审计、权限
4. **离线** - 断网可用

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 安全监控

### 题目

实现一个依赖安全监控系统。

<details>
<summary>查看答案</summary>

### ✅ 答案

**依赖安全监控系统**

```javascript
// scripts/security-monitor.js
const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');

class SecurityMonitor {
  constructor() {
    this.config = {
      checkInterval: 24 * 60 * 60 * 1000, // 24小时
      alertWebhook: process.env.ALERT_WEBHOOK,
      reportPath: 'security-reports'
    };
    
    this.baseline = this.loadBaseline();
  }

  // 加载基线
  loadBaseline() {
    try {
      return JSON.parse(fs.readFileSync('.security-baseline.json', 'utf8'));
    } catch {
      return {
        lockfileHash: '',
        vulnerabilities: {},
        licenses: {},
        timestamp: null
      };
    }
  }

  // 保存基线
  saveBaseline(data) {
    fs.writeFileSync('.security-baseline.json', JSON.stringify(data, null, 2));
  }

  // 计算 lockfile 哈希
  getLockfileHash() {
    const content = fs.readFileSync('package-lock.json', 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // 检查依赖变更
  checkDependencyChanges() {
    const currentHash = this.getLockfileHash();
    const changed = currentHash !== this.baseline.lockfileHash;
    
    if (changed) {
      console.log('⚠️  依赖已变更');
      
      // 记录变更
      this.logChange('dependency', {
        oldHash: this.baseline.lockfileHash,
        newHash: currentHash,
        timestamp: new Date().toISOString()
      });
    }
    
    return changed;
  }

  // 运行 npm audit
  async runAudit() {
    try {
      const output = execSync('npm audit --json', { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (e) {
      // audit 发现问题时会返回非0
      if (e.stdout) {
        return JSON.parse(e.stdout);
      }
      throw e;
    }
  }

  // 检查漏洞
  async checkVulnerabilities() {
    const audit = await this.runAudit();
    const vulns = audit.metadata?.vulnerabilities || {};
    
    const newVulns = this.compareVulnerabilities(vulns);
    
    if (newVulns.length > 0) {
      console.log(`🔴 发现 ${newVulns.length} 个新漏洞`);
      
      await this.alert('新漏洞', {
        count: newVulns.length,
        details: newVulns,
        audit: audit
      });
    }
    
    return { vulns, newVulns };
  }

  // 对比漏洞
  compareVulnerabilities(current) {
    const baseline = this.baseline.vulnerabilities || {};
    const newVulns = [];
    
    for (const [severity, count] of Object.entries(current)) {
      const oldCount = baseline[severity] || 0;
      if (count > oldCount) {
        newVulns.push({
          severity,
          increase: count - oldCount,
          total: count
        });
      }
    }
    
    return newVulns;
  }

  // 检查许可证
  async checkLicenses() {
    try {
      const output = execSync('npx license-checker --json', { encoding: 'utf8' });
      const licenses = JSON.parse(output);
      
      const forbidden = ['GPL', 'AGPL', 'LGPL'];
      const violations = [];
      
      for (const [pkg, info] of Object.entries(licenses)) {
        const license = info.licenses || '';
        if (forbidden.some(f => license.includes(f))) {
          violations.push({ package: pkg, license });
        }
      }
      
      if (violations.length > 0) {
        console.log(`⚠️  发现 ${violations.length} 个许可证违规`);
        
        await this.alert('许可证违规', {
          count: violations.length,
          violations
        });
      }
      
      return { licenses, violations };
    } catch (e) {
      console.warn('许可证检查失败');
      return { licenses: {}, violations: [] };
    }
  }

  // 检查供应链
  async checkSupplyChain() {
    try {
      // 使用 Socket.dev API 或其他供应链分析工具
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const risks = [];
      
      // 检查新增依赖
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      for (const [name, version] of Object.entries(deps)) {
        // 检查包的下载量、活跃度等
        const info = await this.getPackageInfo(name);
        
        if (info.downloads < 1000) {
          risks.push({
            package: name,
            risk: 'low_downloads',
            value: info.downloads
          });
        }
        
        if (info.daysSinceUpdate > 365) {
          risks.push({
            package: name,
            risk: 'unmaintained',
            value: info.daysSinceUpdate
          });
        }
      }
      
      return risks;
    } catch (e) {
      return [];
    }
  }

  // 获取包信息
  async getPackageInfo(name) {
    try {
      const output = execSync(`npm info ${name} --json`, { encoding: 'utf8' });
      const info = JSON.parse(output);
      
      const lastUpdate = new Date(info.time?.modified || info.time?.created);
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
      
      return {
        downloads: info.downloads || 0,
        daysSinceUpdate,
        maintainers: info.maintainers?.length || 0
      };
    } catch {
      return {
        downloads: 0,
        daysSinceUpdate: 999,
        maintainers: 0
      };
    }
  }

  // 生成报告
  generateReport(data) {
    const report = {
      timestamp: new Date().toISOString(),
      project: require('../package.json').name,
      checks: {
        dependencyChanges: data.dependencyChanged,
        vulnerabilities: data.vulnerabilities,
        licenses: data.licenses,
        supplyChain: data.supplyChain
      },
      summary: {
        status: this.getOverallStatus(data),
        newVulnerabilities: data.vulnerabilities.newVulns.length,
        licenseViolations: data.licenses.violations.length,
        supplyChainRisks: data.supplyChain.length
      }
    };
    
    // 保存报告
    const reportDir = this.config.reportPath;
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const filename = `${reportDir}/report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    return report;
  }

  // 获取总体状态
  getOverallStatus(data) {
    if (data.vulnerabilities.newVulns.some(v => v.severity === 'critical')) {
      return 'critical';
    }
    if (data.vulnerabilities.newVulns.length > 0) {
      return 'warning';
    }
    if (data.licenses.violations.length > 0) {
      return 'warning';
    }
    return 'ok';
  }

  // 发送告警
  async alert(type, data) {
    const message = {
      type,
      timestamp: new Date().toISOString(),
      project: require('../package.json').name,
      data
    };
    
    // 记录日志
    this.logChange('alert', message);
    
    // Webhook 通知
    if (this.config.alertWebhook) {
      try {
        const https = require('https');
        const url = new URL(this.config.alertWebhook);
        
        const req = https.request({
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        req.write(JSON.stringify(message));
        req.end();
      } catch (e) {
        console.error('Webhook 发送失败:', e);
      }
    }
  }

  // 记录变更
  logChange(type, data) {
    const log = {
      type,
      timestamp: new Date().toISOString(),
      data
    };
    
    fs.appendFileSync('security.log', JSON.stringify(log) + '\n');
  }

  // 运行完整检查
  async run() {
    console.log('🔒 开始安全监控...\n');
    
    const results = {
      dependencyChanged: false,
      vulnerabilities: { vulns: {}, newVulns: [] },
      licenses: { licenses: {}, violations: [] },
      supplyChain: []
    };
    
    // 1. 检查依赖变更
    results.dependencyChanged = this.checkDependencyChanges();
    
    // 2. 漏洞检查
    results.vulnerabilities = await this.checkVulnerabilities();
    
    // 3. 许可证检查
    results.licenses = await this.checkLicenses();
    
    // 4. 供应链检查
    results.supplyChain = await this.checkSupplyChain();
    
    // 5. 生成报告
    const report = this.generateReport(results);
    
    // 6. 更新基线
    this.saveBaseline({
      lockfileHash: this.getLockfileHash(),
      vulnerabilities: results.vulnerabilities.vulns,
      licenses: results.licenses.licenses,
      timestamp: new Date().toISOString()
    });
    
    // 7. 输出结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 安全监控报告');
    console.log('='.repeat(60));
    console.log(`\n状态: ${report.summary.status.toUpperCase()}`);
    console.log(`新漏洞: ${report.summary.newVulnerabilities}`);
    console.log(`许可证违规: ${report.summary.licenseViolations}`);
    console.log(`供应链风险: ${report.summary.supplyChainRisks}\n`);
    
    return report.summary.status === 'ok' ? 0 : 1;
  }
}

// 运行
const monitor = new SecurityMonitor();
monitor.run()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('❌ 监控失败:', err);
    process.exit(1);
  });
```

**使用：**
```bash
# 单次检查
node scripts/security-monitor.js

# 定时任务
crontab -e
0 */6 * * * cd /path/to/project && node scripts/security-monitor.js
```

**CI 集成：**
```yaml
- name: Security Monitor
  run: node scripts/security-monitor.js
  env:
    ALERT_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

### 📖 解析

**监控维度**

1. ✅ 依赖变更 - 追踪修改
2. ✅ 漏洞扫描 - 及时发现
3. ✅ 许可证检查 - 合规保障
4. ✅ 供应链风险 - 预防攻击
5. ✅ 自动告警 - 快速响应

</details>

---

**导航**  
[上一章：第 26 章面试题](./chapter-26.md) | [返回目录](../README.md) | [下一章：第 28 章面试题](./chapter-28.md)
