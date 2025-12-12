# npm 安全

## 概述

npm 包的安全性直接影响应用安全。本章介绍如何防范安全风险、扫描漏洞和保护发布流程。

## 一、npm audit 漏洞扫描

### 1.1 扫描依赖漏洞

```bash
# 扫描漏洞
npm audit

# 输出示例：
found 3 vulnerabilities (1 moderate, 2 high)
  run `npm audit fix` to fix them
```

### 1.2 自动修复

```bash
# 自动修复（安全更新）
npm audit fix

# 强制修复（可能破坏性更新）
npm audit fix --force
```

### 1.3 生成报告

```bash
# JSON 格式报告
npm audit --json > audit-report.json

# 仅显示生产依赖
npm audit --production
```

## 二、依赖完整性校验

### 2.1 什么是 integrity

完整性哈希确保包未被篡改：

```json
// package-lock.json
{
  "lodash": {
    "version": "4.17.21",
    "integrity": "sha512-v2kDEe57lecTula...",
    "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
  }
}
```

### 2.2 验证完整性

```bash
# npm 自动验证
npm install

# 如果哈希不匹配，安装失败
npm ERR! Integrity check failed
```

## 三、.npmignore 防止泄露

### 3.1 排除敏感文件

```
# .npmignore
.env
.env.*
*.key
*.pem
secrets/
credentials/
.aws/
.npmrc
```

### 3.2 验证发布内容

```bash
# 模拟发布，查看包含哪些文件
npm pack --dry-run

# 查看生成的 tarball
npm pack
tar -tzf my-package-1.0.0.tgz
```

## 四、双因素认证（2FA）

### 4.1 启用 2FA

```bash
# 启用 2FA（发布和登录）
npm profile enable-2fa auth-and-writes

# 仅登录时启用
npm profile enable-2fa auth-only
```

### 4.2 使用 2FA 发布

```bash
# 发布时输入 OTP
npm publish --otp=123456
```

### 4.3 查看 2FA 状态

```bash
npm profile get
```

## 五、访问令牌（Token）

### 5.1 创建 Token

```bash
# Web 界面创建：
https://www.npmjs.com/settings/[username]/tokens

# 类型：
# - Automation: CI/CD 使用，不需要 OTP
# - Publish: 发布包
# - Read-only: 只读
```

### 5.2 使用 Token

```bash
# .npmrc 中配置
//registry.npmjs.org/:_authToken=npm_xxxxxx

# 环境变量（CI/CD）
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
```

### 5.3 撤销 Token

```bash
# Web 界面撤销或使用 CLI
npm token revoke [token_id]
```

## 六、依赖审查

### 6.1 检查依赖许可证

```bash
# 安装工具
npm install -g license-checker

# 查看所有许可证
license-checker

# 排除特定许可证
license-checker --exclude "MIT, Apache-2.0"
```

### 6.2 限制依赖来源

```json
// package.json
{
  "overrides": {
    "某个不安全的包": "安全版本"
  }
}
```

## 七、代码签名

### 7.1 使用 npm provenance（npm 9+）

```bash
# 发布时生成证明
npm publish --provenance
```

**效果：**
- 证明包来自特定 git 仓库
- 透明的构建过程
- 防止供应链攻击

### 7.2 在 GitHub Actions 中使用

```yaml
# .github/workflows/publish.yml
- run: npm publish --provenance
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 八、常见安全威胁

### 8.1 依赖混淆攻击

**问题：** 攻击者发布与内部包同名的公开包

**防护：**
```json
{
  "publishConfig": {
    "registry": "https://npm.mycompany.com"
  }
}
```

### 8.2 恶意依赖

**防护措施：**
- ✅ 只安装可信包
- ✅ 检查包的下载量和维护状态
- ✅ 使用 `npm audit`
- ✅ 锁定依赖版本

### 8.3 typosquatting（拼写劫持）

**例子：**
```
正确：lodash
恶意：loadash, lodash-, lodash-utils
```

**防护：**
- 仔细检查包名
- 使用 lock 文件

## 九、最佳实践

### 9.1 安全清单

```markdown
- [ ] 启用 2FA
- [ ] 定期运行 npm audit
- [ ] 使用 lock 文件
- [ ] 配置 .npmignore
- [ ] 最小化发布内容
- [ ] 使用 CI/CD 自动扫描
- [ ] 及时更新依赖
```

### 9.2 CI/CD 集成

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=high
```

### 9.3 定期审计

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "check:licenses": "license-checker"
  }
}
```

## 参考资料

- [npm 安全最佳实践](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [npm audit 文档](https://docs.npmjs.com/cli/v9/commands/npm-audit)

---

**导航**  
[上一章：npm生命周期钩子](./13-lifecycle-hooks.md) | [返回目录](../README.md) | [下一章：npm Workspaces](./15-npm-workspaces.md)
