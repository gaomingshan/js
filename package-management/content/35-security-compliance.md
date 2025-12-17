# 包安全与合规

## 概述

包安全和合规性是企业级应用的重要考虑因素。本章介绍漏洞扫描、许可证管理、供应链安全和 SBOM 生成。

## 一、漏洞扫描

### 1.1 npm audit

```bash
# 扫描漏洞
npm audit

# 输出示例：
found 3 vulnerabilities (1 moderate, 2 high)
  
  Moderate severity:
  - lodash < 4.17.21
  
  High severity:
  - axios < 0.21.1
  - minimist < 1.2.6
```

**自动修复：**
```bash
# 安全更新
npm audit fix

# 强制修复（可能破坏性）
npm audit fix --force

# 仅修复生产依赖
npm audit fix --only=prod
```

### 1.2 Snyk

```bash
# 安装
npm install -g snyk

# 认证
snyk auth

# 测试漏洞
snyk test

# 监控项目
snyk monitor

# 修复漏洞
snyk wizard
```

**集成到 CI：**
```yaml
# .github/workflows/security.yml
- name: Run Snyk
  run: snyk test --severity-threshold=high
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 1.3 GitHub Dependabot

**自动安全更新：**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"  # 每天检查安全更新
    open-pull-requests-limit: 5
```

## 二、License 合规

### 2.1 license-checker

```bash
npm install -g license-checker

# 查看所有许可证
license-checker

# 输出 CSV
license-checker --csv --out licenses.csv

# 排除特定许可证
license-checker --exclude "MIT,ISC,Apache-2.0"

# 只允许特定许可证
license-checker --onlyAllow "MIT;ISC;Apache-2.0"
```

**输出示例：**
```
├─ lodash@4.17.21
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/lodash/lodash
│  └─ licenseFile: /path/to/LICENSE

├─ react@18.2.0
│  ├─ licenses: MIT
│  └─ publisher: Facebook
```

### 2.2 许可证分类

**常见许可证：**
| 许可证 | 类型 | 商业使用 | 修改 | 分发 |
|--------|------|----------|------|------|
| MIT | 宽松 | ✅ | ✅ | ✅ |
| Apache-2.0 | 宽松 | ✅ | ✅ | ✅ |
| BSD | 宽松 | ✅ | ✅ | ✅ |
| ISC | 宽松 | ✅ | ✅ | ✅ |
| GPL | Copyleft | ✅ | ✅ | ⚠️ 需开源 |
| AGPL | 强 Copyleft | ⚠️ | ✅ | ⚠️ 需开源 |

**风险等级：**
```
✅ 低风险: MIT, ISC, Apache-2.0, BSD
⚠️ 中风险: LGPL
❌ 高风险: GPL, AGPL（商业软件需谨慎）
```

### 2.3 CI 检查

```yaml
# .github/workflows/license.yml
- name: Check licenses
  run: |
    npx license-checker \
      --failOn "GPL;AGPL" \
      --summary
```

## 三、供应链安全

### 3.1 依赖签名验证

**npm provenance (npm 9+)：**
```bash
# 发布时生成证明
npm publish --provenance

# 验证包来源
npm view package-name --json | jq .dist.signatures
```

### 3.2 锁定依赖版本

```json
{
  "dependencies": {
    "critical-package": "1.2.3"  // 精确版本
  }
}
```

**使用 lock 文件：**
```bash
# 严格按 lock 文件安装
npm ci
pnpm install --frozen-lockfile
yarn install --frozen-lockfile
```

### 3.3 依赖混淆攻击防护

**问题：** 攻击者发布与内部包同名的公共包

**防护：**
```json
{
  "publishConfig": {
    "registry": "https://npm.company.com"
  }
}
```

**配置作用域：**
```ini
# .npmrc
@mycompany:registry=https://npm.company.com
```

### 3.4 Subresource Integrity (SRI)

```html
<!-- CDN 引入时使用 SRI -->
<script 
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

## 四、SBOM 生成

### 4.1 什么是 SBOM

**Software Bill of Materials（软件物料清单）：**
- 列出所有依赖
- 版本信息
- 许可证
- 漏洞信息

### 4.2 生成 SBOM

**使用 @cyclonedx/cyclonedx-npm：**
```bash
npm install -g @cyclonedx/cyclonedx-npm

# 生成 SBOM
cyclonedx-npm --output-file sbom.json
```

**SBOM 格式（CycloneDX）：**
```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "components": [
    {
      "type": "library",
      "name": "lodash",
      "version": "4.17.21",
      "licenses": [
        { "license": { "id": "MIT" } }
      ]
    }
  ]
}
```

**SPDX 格式：**
```bash
npm install -g @spdx/tools-js

# 生成 SPDX SBOM
spdx-sbom-generator npm
```

### 4.3 SBOM 用途

```markdown
- 漏洞追踪
- 合规审计
- 许可证管理
- 供应链透明度
```

## 五、安全最佳实践

### 5.1 开发阶段

```markdown
- [ ] 只安装必需的依赖
- [ ] 审查新增依赖的安全性
- [ ] 使用 lock 文件
- [ ] 启用 2FA
- [ ] 定期更新依赖
```

### 5.2 CI/CD 阶段

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Audit
        run: npm audit --audit-level=high
        
      - name: Check licenses
        run: npx license-checker --failOn "GPL;AGPL"
        
      - name: Snyk scan
        run: npx snyk test
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 5.3 生产阶段

```markdown
- [ ] 使用私有 registry
- [ ] 启用包签名
- [ ] 监控漏洞通知
- [ ] 定期安全审计
- [ ] 维护 SBOM
```

## 六、安全工具对比

| 工具 | 漏洞扫描 | 许可证检查 | SBOM | 免费 |
|------|----------|-----------|------|------|
| **npm audit** | ✅ | ❌ | ❌ | ✅ |
| **Snyk** | ✅ | ✅ | ✅ | 部分 |
| **Dependabot** | ✅ | ❌ | ❌ | ✅ |
| **license-checker** | ❌ | ✅ | ❌ | ✅ |
| **CycloneDX** | ❌ | ❌ | ✅ | ✅ |

## 七、应急响应

### 7.1 发现高危漏洞

```bash
# 1. 立即评估影响
npm audit

# 2. 查看详情
npm audit --json > audit.json

# 3. 尝试自动修复
npm audit fix

# 4. 手动更新
npm install package@safe-version

# 5. 测试
npm test

# 6. 部署
git commit -am "fix: update vulnerable dependency"
```

### 7.2 无法立即修复

**临时措施：**
```json
{
  "overrides": {
    "vulnerable-package": "safe-version"
  }
}
```

**或使用 patch：**
```bash
# pnpm patch
pnpm patch vulnerable-package
# 手动修复漏洞
pnpm patch-commit
```

## 八、合规报告

### 8.1 生成报告

```bash
# 许可证报告
license-checker --csv > licenses-report.csv

# 漏洞报告
npm audit --json > vulnerabilities-report.json

# SBOM
cyclonedx-npm --output-file sbom.json
```

### 8.2 定期审计

```bash
# 每月审计脚本
#!/bin/bash

echo "=== Security Audit ==="
npm audit --audit-level=moderate

echo -e "\n=== License Check ==="
license-checker --summary

echo -e "\n=== Outdated Packages ==="
npm outdated

echo -e "\n=== SBOM Generation ==="
cyclonedx-npm --output-file sbom-$(date +%Y%m%d).json
```

## 九、企业级安全策略

### 9.1 策略清单

```markdown
1. 依赖审查
   - 新增依赖需审批
   - 检查包的活跃度和维护状况
   - 验证发布者身份

2. 自动化扫描
   - CI/CD 集成安全扫描
   - 每日漏洞检查
   - 自动创建修复 PR

3. 许可证管理
   - 维护允许的许可证白名单
   - 禁止高风险许可证
   - 定期合规审计

4. 供应链安全
   - 使用私有 registry
   - 依赖签名验证
   - 维护 SBOM

5. 应急响应
   - 高危漏洞 24 小时内修复
   - 建立漏洞通知机制
   - 定期安全演练
```

## 参考资料

- [npm 安全最佳实践](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [Snyk 文档](https://docs.snyk.io/)
- [CycloneDX](https://cyclonedx.org/)
- [SPDX](https://spdx.dev/)

---

**导航**  
[上一章：依赖分析与优化](./34-dependency-analysis.md) | [返回目录](../README.md) | [下一章：包管理器最佳实践总结](./36-best-practices-summary.md)
