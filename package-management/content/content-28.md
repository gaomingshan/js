# 依赖审计与安全

## npm audit 原理

### 漏洞数据库

**Advisory Database**：
```
npm audit 查询的数据源：
├─ GitHub Advisory Database
├─ npm Security Advisories
└─ National Vulnerability Database (NVD)
```

**数据结构**：
```json
{
  "id": 1337,
  "severity": "high",
  "title": "Prototype Pollution in lodash",
  "vulnerable_versions": "<4.17.21",
  "patched_versions": ">=4.17.21",
  "cve": "CVE-2020-8203",
  "affected_package": "lodash",
  "published": "2020-07-15"
}
```

### 审计流程

**npm audit 工作原理**：
```javascript
async function audit(lockfile) {
  // 1. 提取所有依赖及其版本
  const packages = extractPackages(lockfile);
  
  // 2. 发送到 registry 审计端点
  const vulnerabilities = await fetch('https://registry.npmjs.org/-/npm/v1/security/audits', {
    method: 'POST',
    body: JSON.stringify({
      name: 'my-app',
      version: '1.0.0',
      requires: packages,
      dependencies: packages
    })
  });
  
  // 3. 匹配漏洞
  const matched = matchVulnerabilities(packages, vulnerabilities);
  
  // 4. 计算修复方案
  const fixes = calculateFixes(matched);
  
  return { vulnerabilities: matched, fixes };
}
```

**示例请求**：
```bash
npm audit --json

# POST https://registry.npmjs.org/-/npm/v1/security/audits
# Body:
{
  "name": "my-app",
  "version": "1.0.0",
  "requires": {
    "lodash": "4.17.20",
    "express": "4.17.0"
  },
  "dependencies": {
    "lodash": {
      "version": "4.17.20"
    },
    "express": {
      "version": "4.17.0",
      "requires": {
        "body-parser": "1.19.0"
      }
    }
  }
}
```

---

## 漏洞数据库（GitHub Advisory）

### Advisory 格式

**GHSA (GitHub Security Advisory)**：
```yaml
# GHSA-jf85-cpcp-j695.yml
id: GHSA-jf85-cpcp-j695
summary: Prototype Pollution in lodash
description: |
  Versions of lodash prior to 4.17.21 are vulnerable to prototype pollution.
  
severity: high
affected:
  - package:
      ecosystem: npm
      name: lodash
    ranges:
      - type: SEMVER
        events:
          - introduced: "0"
          - fixed: "4.17.21"
references:
  - type: ADVISORY
    url: https://nvd.nist.gov/vuln/detail/CVE-2020-8203
  - type: WEB
    url: https://github.com/lodash/lodash/issues/4874
published: 2020-07-15T00:00:00Z
updated: 2023-01-15T00:00:00Z
```

### 查询 Advisory

**GitHub API**：
```bash
curl -H "Accept: application/vnd.github+json" \
  https://api.github.com/advisories?ecosystem=npm&package=lodash

# 响应
[
  {
    "ghsa_id": "GHSA-jf85-cpcp-j695",
    "cve_id": "CVE-2020-8203",
    "summary": "Prototype Pollution in lodash",
    "severity": "high",
    "vulnerable_version_range": "< 4.17.21",
    "first_patched_version": {
      "identifier": "4.17.21"
    }
  }
]
```

**npm view**：
```bash
npm view lodash --json | jq '.vulnerabilities'
```

---

## 自动修复 vs 手动修复

### 自动修复（npm audit fix）

**工作原理**：
```javascript
async function auditFix() {
  const audit = await runAudit();
  
  for (const vuln of audit.vulnerabilities) {
    const { name, current, patched } = vuln;
    
    // 检查是否在 semver 范围内
    const spec = packageJson.dependencies[name];
    if (semver.satisfies(patched, spec)) {
      // 在范围内，安全升级
      await updatePackage(name, patched);
    } else {
      // 超出范围，需要 --force
      console.warn(`Cannot auto-fix ${name}: requires major update`);
    }
  }
}
```

**示例**：
```bash
# package.json: "lodash": "^4.17.0"
# 当前版本: 4.17.20
# 修复版本: 4.17.21

npm audit fix
# ✅ 在 ^4.17.0 范围内，自动升级
```

**--force 选项**：
```bash
# package.json: "lodash": "^4.16.0"
# 当前版本: 4.16.6
# 修复版本: 4.17.21

npm audit fix
# ⚠️ Cannot fix (out of semver range)

npm audit fix --force
# ✅ 强制升级（可能引入破坏性变更）
```

### 手动修复

**场景 1**：直接依赖漏洞
```bash
# 查看漏洞
npm audit

# 手动升级
npm install lodash@latest
```

**场景 2**：间接依赖漏洞
```bash
# 漏洞链
my-app → express → body-parser@1.19.0 (vulnerable)

# 方案 1：等待 express 升级
# 方案 2：使用 overrides
{
  "overrides": {
    "body-parser": "1.20.0"
  }
}
```

**场景 3**：无修复版本
```bash
# 漏洞：某包 < 2.0.0 都有漏洞
# 当前：1.5.0
# 修复：2.0.0（破坏性变更）

# 选项：
# 1. 迁移到 2.0.0
# 2. 寻找替代包
# 3. 接受风险（临时）
```

---

## 企业级安全扫描

### Snyk

**集成**：
```bash
# 安装 Snyk CLI
npm install -g snyk

# 认证
snyk auth

# 测试项目
snyk test

# 监控（持续扫描）
snyk monitor
```

**输出示例**：
```
Testing my-app...

✗ High severity vulnerability found in lodash
  Description: Prototype Pollution
  Info: https://snyk.io/vuln/SNYK-JS-LODASH-590103
  Introduced through: express@4.17.0 > body-parser@1.19.0 > lodash@4.17.20
  From: express@4.17.0 > body-parser@1.19.0 > lodash@4.17.20
  Remediation: Upgrade to lodash@4.17.21
  
Organization: my-org
Tested 200 dependencies for known vulnerabilities
Found 1 vulnerability, 1 vulnerable path
```

**CI 集成**：
```yaml
# .github/workflows/security.yml
- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

### WhiteSource / Mend

**功能**：
- 开源许可证合规检查
- 漏洞扫描
- 依赖更新建议

**配置**（.whitesource）：
```json
{
  "scanSettings": {
    "configMode": "AUTO",
    "configExternalFile": "",
    "projectToken": "",
    "baseBranches": ["main"]
  },
  "checkRunSettings": {
    "vulnerableCheckRunConclusionLevel": "failure",
    "displayMode": "diff"
  },
  "issueSettings": {
    "minSeverityLevel": "LOW"
  }
}
```

### OWASP Dependency-Check

**运行**：
```bash
# 下载
wget https://github.com/jeremylong/DependencyCheck/releases/download/v8.0.0/dependency-check-8.0.0-release.zip
unzip dependency-check-8.0.0-release.zip

# 扫描
./dependency-check/bin/dependency-check.sh \
  --project my-app \
  --scan package-lock.json \
  --format HTML \
  --out reports/
```

**报告**：
```
High Severity Vulnerabilities: 2
Medium Severity Vulnerabilities: 5
Low Severity Vulnerabilities: 10

CVE-2020-8203: Prototype Pollution in lodash
CVSS Score: 7.4 (High)
```

---

## 常见误区

### 误区 1：只关注 Critical 和 High

**忽略 Low/Moderate 的风险**：
```
单个 Low 可能无害
但多个 Low 组合可能形成攻击链
```

**最佳实践**：
```bash
# 定期审查所有级别
npm audit --audit-level=low

# 评估每个漏洞的实际影响
```

### 误区 2：自动修复是安全的

**危险场景**：
```bash
npm audit fix --force

# 可能后果：
# 1. 破坏性 API 变更
# 2. 功能异常
# 3. 性能下降
```

**正确流程**：
```bash
# 1. 查看修复计划
npm audit fix --dry-run

# 2. 评估影响
# 3. 在测试环境验证
# 4. 执行修复
npm audit fix

# 5. 运行测试
npm test
```

### 误区 3：npm audit 能发现所有漏洞

**局限性**：
```
npm audit 只检测已知漏洞
不检测：
- 零日漏洞
- 逻辑漏洞
- 配置错误
- 代码质量问题
```

**补充工具**：
```bash
# 代码扫描
npm run lint

# 静态分析
npx eslint src/

# 类型检查
npx tsc --noEmit
```

---

## 工程实践

### 场景 1：CI 安全门禁

**严格模式**：
```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * *'  # 每天检查

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run audit
        run: npm audit --audit-level=moderate
      
      - name: Fail on vulnerabilities
        run: |
          AUDIT_RESULT=$(npm audit --json)
          HIGH=$(echo $AUDIT_RESULT | jq '.metadata.vulnerabilities.high')
          CRITICAL=$(echo $AUDIT_RESULT | jq '.metadata.vulnerabilities.critical')
          
          if [ "$HIGH" -gt 0 ] || [ "$CRITICAL" -gt 0 ]; then
            echo "Found high/critical vulnerabilities"
            exit 1
          fi
```

**宽松模式**（仅警告）：
```yaml
- name: Run audit (informational)
  run: npm audit || true  # 不阻止 CI
  
- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      const audit = execSync('npm audit --json').toString();
      const data = JSON.parse(audit);
      const comment = `### Security Audit
      - Critical: ${data.metadata.vulnerabilities.critical}
      - High: ${data.metadata.vulnerabilities.high}
      - Moderate: ${data.metadata.vulnerabilities.moderate}`;
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

### 场景 2：定期漏洞扫描

**Dependabot 配置**：
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    
    # 安全更新优先
    open-pull-requests-limit: 10
    
    # 自动合并补丁版本
    reviewers:
      - "security-team"
    labels:
      - "security"
      - "dependencies"
```

**自定义脚本**：
```bash
#!/bin/bash
# scripts/security-check.sh

echo "Running security audit..."

# 运行审计
AUDIT_JSON=$(npm audit --json)

# 解析结果
CRITICAL=$(echo $AUDIT_JSON | jq '.metadata.vulnerabilities.critical')
HIGH=$(echo $AUDIT_JSON | jq '.metadata.vulnerabilities.high')

# 生成报告
cat > security-report.md << EOF
# Security Audit Report
Date: $(date)

## Summary
- Critical: $CRITICAL
- High: $HIGH

## Details
\`\`\`
$(npm audit)
\`\`\`

## Recommendations
$(npm audit fix --dry-run)
EOF

# 发送通知（例如 Slack）
if [ "$CRITICAL" -gt 0 ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"⚠️ Critical vulnerabilities found!"}' \
    $SLACK_WEBHOOK_URL
fi
```

### 场景 3：漏洞响应流程

**SLA 定义**：
```
Critical: 24 小时内修复
High:     7 天内修复
Moderate: 30 天内修复
Low:      评估后决定
```

**响应流程**：
```
1. 检测 → 自动化扫描（CI/定时任务）
2. 通知 → Slack/Email 告警
3. 分类 → 评估严重性和影响范围
4. 修复 → 升级/workaround/接受风险
5. 验证 → 测试环境验证
6. 部署 → 紧急发布或常规发布
7. 复盘 → 更新安全流程
```

**问题跟踪**：
```markdown
## Security Issue: CVE-2020-8203

**Severity:** High
**Package:** lodash@4.17.20
**Path:** express > body-parser > lodash
**Fixed Version:** 4.17.21

### Impact Analysis
- [x] 评估代码是否使用受影响的功能
- [x] 检查是否可被外部输入触发
- [ ] 评估攻击面和风险等级

### Remediation Plan
- [ ] 升级 body-parser（等待上游）
- [x] 使用 overrides 临时修复
- [ ] 回归测试
- [ ] 部署到生产

### Timeline
- 2023-01-15: 漏洞发现
- 2023-01-16: 临时修复部署
- 2023-01-20: 正式修复部署
```

---

## 深入一点

### npm audit 的性能优化

**批量查询**：
```javascript
// npm 将所有依赖打包发送
// 而不是逐个查询
POST /security/audits
{
  "requires": {
    "pkg1": "1.0.0",
    "pkg2": "2.0.0",
    // ... 200 个包
  }
}

// 一次请求返回所有匹配的漏洞
```

**缓存机制**：
```bash
# npm 缓存审计结果
~/.npm/_cacache/
└── content-v2/
    └── sha512/
        └── audit-result-{hash}

# 24 小时内重复审计使用缓存
```

### 漏洞评分（CVSS）

**CVSS v3.1 计算**：
```
基础分 (Base Score):
├─ 攻击向量 (AV): Network/Adjacent/Local/Physical
├─ 攻击复杂度 (AC): Low/High
├─ 所需权限 (PR): None/Low/High
├─ 用户交互 (UI): None/Required
├─ 影响范围 (S): Changed/Unchanged
├─ 保密性影响 (C): High/Low/None
├─ 完整性影响 (I): High/Low/None
└─ 可用性影响 (A): High/Low/None

示例：CVE-2020-8203
AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:N
CVSS Score: 5.9 (Medium)
```

### 供应链攻击防护

**包完整性验证**：
```bash
# npm 自动验证 integrity
npm install

# 手动验证
npm audit signatures

# 输出：
# audited 200 packages
# verified 200 signatures
```

**限制 postinstall 脚本**：
```bash
# 禁用所有脚本
npm install --ignore-scripts

# 或选择性允许
npm config set ignore-scripts true
npm config set scripts-whitelist "husky,patch-package"
```

---

## 参考资料

- [npm audit 文档](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [GitHub Advisory Database](https://github.com/advisories)
- [CVSS 计算器](https://www.first.org/cvss/calculator/3.1)
- [Snyk 漏洞数据库](https://snyk.io/vuln)
