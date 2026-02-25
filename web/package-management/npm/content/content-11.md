# npm audit 安全审计机制

## 概述

`npm audit` 是 npm 内置的安全审计工具，用于检测项目依赖中的已知安全漏洞。随着供应链攻击日益增多，定期审计依赖安全已成为项目维护的必要环节。

## npm audit 基本用法

### 运行安全审计

```bash
# 检查所有依赖的安全漏洞
npm audit
```

**输出示例：**
```
                       === npm audit security report ===

found 3 vulnerabilities (1 moderate, 2 high) in 1200 scanned packages
  run `npm audit fix` to fix 2 of them.
  1 vulnerability requires manual review. See the full report for details.
```

### 详细报告

```bash
# JSON 格式
npm audit --json

# 详细输出
npm audit --json | jq
```

**报告结构：**
```json
{
  "vulnerabilities": {
    "minimist": {
      "name": "minimist",
      "severity": "high",
      "via": [
        {
          "source": 1179,
          "name": "minimist",
          "dependency": "minimist",
          "title": "Prototype Pollution",
          "url": "https://github.com/advisories/GHSA-xvch-5gv4-984h",
          "severity": "high",
          "range": "<0.2.1 || >=1.0.0 <1.2.6"
        }
      ],
      "effects": [],
      "range": "<0.2.1 || >=1.0.0 <1.2.6",
      "nodes": ["node_modules/minimist"],
      "fixAvailable": true
    }
  }
}
```

## 漏洞严重级别

### 级别分类

**Critical（严重）：**
- 立即可被利用
- 导致完全系统控制
- 示例：远程代码执行（RCE）

**High（高危）：**
- 容易被利用
- 重大影响
- 示例：原型污染、SQL 注入

**Moderate（中危）：**
- 需要特定条件
- 中等影响
- 示例：DoS、信息泄露

**Low（低危）：**
- 难以利用
- 影响有限
- 示例：小范围信息泄露

### 查看特定级别

```bash
# 仅显示高危及以上
npm audit --audit-level=high

# 仅显示严重漏洞
npm audit --audit-level=critical

# 设置级别阈值
npm config set audit-level moderate
```

## 自动修复

### npm audit fix

```bash
# 自动修复兼容的漏洞
npm audit fix
```

**工作原理：**
```
1. 分析漏洞报告
2. 查找修复版本
3. 检查是否符合 package.json 版本范围
4. 更新到安全版本
5. 更新 package-lock.json
```

**示例：**
```
package.json: "lodash": "^4.17.15"
当前版本: 4.17.15（有漏洞）
修复版本: 4.17.21

npm audit fix
→ 更新到 4.17.21（符合 ^4.17.15 范围）
```

### npm audit fix --force

```bash
# 强制修复，可能引入破坏性变更
npm audit fix --force
```

**风险：**
```
package.json: "lodash": "^4.17.15"
当前版本: 4.17.15
修复版本: 5.0.0（主版本更新）

npm audit fix --force
→ 更新到 5.0.0（破坏性变更）
```

**使用建议：**
- 仅在测试环境使用
- 运行完整测试套件
- 检查 CHANGELOG

### 试运行

```bash
# 查看将会执行的操作，不实际修复
npm audit fix --dry-run
```

## 审计报告解读

### 完整报告示例

```
# Run  npm audit  for details

┌───────────────┬──────────────────────────────────────────────────────┐
│ High          │ Prototype Pollution                                  │
├───────────────┼──────────────────────────────────────────────────────┤
│ Package       │ minimist                                             │
├───────────────┼──────────────────────────────────────────────────────┤
│ Patched in    │ >=0.2.1 <1.0.0 || >=1.2.6                           │
├───────────────┼──────────────────────────────────────────────────────┤
│ Dependency of │ webpack                                              │
├───────────────┼──────────────────────────────────────────────────────┤
│ Path          │ webpack > yargs > yargs-parser > minimist            │
├───────────────┼──────────────────────────────────────────────────────┤
│ More info     │ https://github.com/advisories/GHSA-xvch-5gv4-984h   │
└───────────────┴──────────────────────────────────────────────────────┘
```

**关键信息：**
- **Severity**：严重级别
- **Package**：有漏洞的包
- **Patched in**：修复版本范围
- **Dependency of**：哪个直接依赖引入的
- **Path**：完整依赖路径
- **More info**：漏洞详情链接

### 依赖路径分析

```
webpack > yargs > yargs-parser > minimist

解读：
- 项目直接依赖 webpack
- webpack 依赖 yargs
- yargs 依赖 yargs-parser
- yargs-parser 依赖 minimist（有漏洞）
```

**修复策略：**
```bash
# 1. 检查是否可以更新直接依赖
npm update webpack

# 2. 如果不行，等待上游修复
# 或使用 overrides 强制指定版本
```

## 审计配置

### 全局配置

```bash
# 设置审计级别
npm config set audit-level moderate

# 跳过审计
npm config set audit false

# 查看配置
npm config get audit
```

### 项目配置

**.npmrc 文件：**
```ini
# 设置审计级别
audit-level=high

# 禁用审计
audit=false

# 仅生产依赖
audit-level=production
```

### package.json 配置

```json
{
  "scripts": {
    "preinstall": "npm audit --audit-level=high"
  }
}
```

## 处理无法自动修复的漏洞

### 场景 1：需要主版本更新

```bash
# 漏洞报告
Package: lodash
Current: 4.17.15
Fixed in: 5.0.0

# audit fix 无法修复（主版本变更）
npm audit fix
# → No changes

# 手动更新
npm install lodash@5.0.0
npm test  # 验证兼容性
```

### 场景 2：上游未修复

```bash
# 漏洞在深层依赖中
webpack > yargs > minimist (vulnerable)

# yargs 未更新 minimist
```

**解决方案：**

**方案 1：使用 overrides（npm 8.3+）**
```json
{
  "overrides": {
    "minimist": "1.2.6"  // 强制所有 minimist 使用安全版本
  }
}
```

**方案 2：使用 resolutions（yarn）**
```json
{
  "resolutions": {
    "minimist": "1.2.6"
  }
}
```

**方案 3：等待上游修复**
```bash
# 关注上游仓库
# 提 issue 或 PR
```

**方案 4：寻找替代包**
```bash
# 如果 webpack 长期不修复
# 考虑切换到 vite 等替代方案
```

### 场景 3：误报或低风险

```bash
# 漏洞实际不影响你的使用场景
```

**处理方式：**
```bash
# 1. 评估风险
# 阅读漏洞详情，判断是否影响你的代码

# 2. 文档化
# 在项目文档中说明为什么忽略

# 3. 定期复查
# 每月检查是否有新的修复版本
```

## CI/CD 集成

### GitHub Actions

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 1'  # 每周一运行
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run audit
        run: npm audit --audit-level=moderate
```

### 严格模式

```yaml
- name: Run audit (strict)
  run: npm audit --audit-level=high
  continue-on-error: false  # 有高危漏洞则构建失败
```

### 生成报告

```yaml
- name: Generate audit report
  run: |
    npm audit --json > audit-report.json
    
- name: Upload report
  uses: actions/upload-artifact@v3
  with:
    name: audit-report
    path: audit-report.json
```

## 第三方审计工具

### Snyk

**更强大的漏洞扫描：**
```bash
# 安装
npm install -g snyk

# 认证
snyk auth

# 测试
snyk test

# 修复
snyk wizard
```

**特点：**
- 更全面的漏洞数据库
- 提供修复建议
- 支持多种语言
- 可视化报告

### npm-audit-resolver

**交互式处理审计结果：**
```bash
# 安装
npm install -g npm-audit-resolver

# 运行
npm-audit-resolver
```

**功能：**
- 交互式决定如何处理每个漏洞
- 生成审计决策记录
- 跳过已知的低风险漏洞

### audit-ci

**CI 专用审计工具：**
```bash
# 安装
npm install -g audit-ci

# 运行
audit-ci --moderate
```

**特点：**
- 可配置级别阈值
- 更好的 CI 集成
- 支持白名单

## 深入一点：漏洞数据库

### npm Advisory Database

**来源：**
- GitHub Advisory Database
- Node Security Platform (已合并)
- 社区报告

**更新频率：**
- 实时更新
- npm audit 每次运行都查询最新数据

**查询 API：**
```bash
# npm 使用的审计端点
POST https://registry.npmjs.org/-/npm/v1/security/audits

# 请求体
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": { ... },
  "dev": true
}
```

### 漏洞 ID 系统

**CVE（Common Vulnerabilities and Exposures）：**
```
CVE-2021-23337
│   │    │  └─ 序号
│   │    └─── 年份
│   └──────── 类型（CVE）
└──────────── 前缀
```

**GHSA（GitHub Security Advisory）：**
```
GHSA-xvch-5gv4-984h
└─ GitHub 安全公告 ID
```

### 漏洞评分

**CVSS（Common Vulnerability Scoring System）：**
```
Score: 7.5 (High)
Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

解读：
- AV:N - 网络可攻击
- AC:L - 攻击复杂度低
- PR:N - 无需特权
- UI:N - 无需用户交互
- C:H  - 高机密性影响
```

## 常见漏洞类型

### 1. 原型污染（Prototype Pollution）

**示例：**
```javascript
// 有漏洞的代码
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key];
  }
  return target;
}

// 攻击
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));

// 结果：所有对象都有 isAdmin 属性
({}).isAdmin  // true
```

**影响：**
- 权限提升
- 拒绝服务
- 远程代码执行

### 2. 命令注入

**示例：**
```javascript
// 有漏洞的代码
const exec = require('child_process').exec;
exec(`ping ${userInput}`);

// 攻击
userInput = "127.0.0.1; rm -rf /"
```

**影响：**
- 任意命令执行
- 服务器被控制

### 3. 路径遍历

**示例：**
```javascript
// 有漏洞的代码
app.get('/download', (req, res) => {
  const file = req.query.file;
  res.sendFile(`/uploads/${file}`);
});

// 攻击
GET /download?file=../../etc/passwd
```

### 4. 正则表达式拒绝服务（ReDoS）

**示例：**
```javascript
// 有漏洞的正则
const re = /^(a+)+$/;
re.test('aaaaaaaaaaaaaaaaaaaaaaaaa!');  // 挂起
```

## 最佳实践

### 1. 定期审计

```bash
# 每周运行一次
npm audit

# 或设置定时任务
# crontab
0 9 * * 1 cd /path/to/project && npm audit
```

### 2. 将审计集成到工作流

```json
{
  "scripts": {
    "precommit": "npm audit --audit-level=high",
    "pretest": "npm audit",
    "predeploy": "npm audit --production"
  }
}
```

### 3. 及时更新依赖

```bash
# 每月更新一次
npm outdated
npm update
npm audit fix
```

### 4. 使用 .npmrc 强制审计

```ini
# .npmrc
audit=true
audit-level=moderate
```

### 5. 文档化安全决策

```markdown
# 安全审计记录

## 2024-01-15
- 发现 minimist 漏洞 (GHSA-xvch-5gv4-984h)
- 评估：不影响我们的使用场景（仅在构建时使用）
- 决策：暂不修复，等待 webpack 上游更新
- 复查：每月检查
```

## 常见问题

### 问题 1：审计报告大量误报

```bash
# 开发依赖的漏洞通常影响较小
npm audit --production  # 仅审计生产依赖
```

### 问题 2：修复导致项目损坏

```bash
# 使用 dry-run 先查看
npm audit fix --dry-run

# 在分支中测试
git checkout -b fix/security-audit
npm audit fix
npm test
```

### 问题 3：CI 构建被审计阻塞

```yaml
# 允许低危漏洞
- run: npm audit --audit-level=moderate
  continue-on-error: true

# 或仅警告
- run: npm audit || true
```

### 问题 4：某些漏洞无法修复

```json
{
  "overrides": {
    "vulnerable-package": "safe-version"
  }
}
```

## 参考资料

- [npm audit 文档](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [GitHub Advisory Database](https://github.com/advisories)
- [Snyk 漏洞数据库](https://snyk.io/vuln)
- [CVSS 评分系统](https://www.first.org/cvss/)

---

**上一章：**[npm link 本地调试与开发](./content-10.md)  
**下一章：**[.npmrc 配置文件详解](./content-12.md)
