/**
 * 第14章：npm安全
 * npm audit漏洞扫描、依赖签名、.npmignore、安全最佳实践
 */

window.content = {
    section: {
        title: '第14章：npm安全',
        icon: '🔒'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'npm安全威胁',
            content: {
                description: 'npm生态系统面临多种安全威胁，包括恶意包、依赖漏洞、供应链攻击等，需要采取多层防护措施。',
                keyPoints: [
                    '恶意包：故意植入恶意代码的包',
                    '依赖漏洞：已知的安全漏洞',
                    '供应链攻击：攻击上游依赖',
                    '账号劫持：npm账号被盗用',
                    '类型混淆：包名相似的钓鱼包',
                    'postinstall攻击：安装时执行恶意代码',
                    '传递依赖：间接依赖的安全问题'
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm audit工作原理',
            content: {
                description: 'npm audit通过将项目依赖与npm的安全漏洞数据库比对，识别已知的安全问题并提供修复建议。',
                mechanism: 'npm audit将package-lock.json中的依赖列表发送到npm registry的安全API，返回匹配的漏洞信息、严重程度、影响版本和修复方案。',
                keyPoints: [
                    '漏洞数据库：npm维护的CVE数据库',
                    '严重等级：low、moderate、high、critical',
                    '自动修复：audit fix尝试自动更新',
                    '手动审查：某些漏洞需要手动处理',
                    '依赖树分析：检查直接和传递依赖',
                    'CVSS评分：通用漏洞评分系统'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm audit使用详解',
            content: {
                description: 'npm audit是保障项目安全的第一道防线，应该定期运行并及时修复。',
                examples: [
                    {
                        title: '运行audit扫描',
                        code: `# 运行安全审计
npm audit

# 输出示例：
# === npm audit security report ===
# 
# found 5 vulnerabilities (2 moderate, 3 high) in 1234 scanned packages
#   run \`npm audit fix\` to fix 3 of them.
#   2 vulnerabilities require manual review.

# 详细格式
npm audit --audit-level=moderate

# JSON格式（CI中使用）
npm audit --json

# 只审计生产依赖
npm audit --production

# 设置退出码阈值
npm audit --audit-level=high  # 只有high及以上才返回非0`,
                        notes: 'CI中应该运行npm audit'
                    },
                    {
                        title: 'audit fix自动修复',
                        code: `# 自动修复（安全更新）
npm audit fix

# 查看修复计划（不实际执行）
npm audit fix --dry-run

# 强制修复（可能破坏兼容性）
npm audit fix --force

# 只修复生产依赖
npm audit fix --production

# 修复后查看剩余问题
npm audit

# 输出示例：
# fixed 3 of 5 vulnerabilities in 1234 scanned packages
#   2 vulnerabilities required manual review and could not be updated`,
                        notes: 'fix会尝试更新到最新的安全版本'
                    },
                    {
                        title: 'CI中集成audit',
                        code: `# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run audit
        run: npm audit --audit-level=moderate
      
      - name: Try auto-fix
        if: failure()
        run: |
          npm audit fix
          npm test
          git diff --exit-code package-lock.json`,
                        notes: '定期自动扫描，发现问题及时处理'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '漏洞处理策略',
            content: {
                description: '发现安全漏洞后，需要根据严重程度、影响范围、修复成本等因素制定处理策略。',
                mechanism: '评估漏洞的实际影响，优先修复critical和high级别的漏洞，对于无法修复的漏洞评估风险是否可接受。',
                keyPoints: [
                    '严重级别：critical > high > moderate > low',
                    '实际影响：评估漏洞在项目中的实际风险',
                    '修复优先级：生产依赖 > 开发依赖',
                    '版本兼容性：平衡安全和稳定性',
                    '临时措施：无法立即修复时的缓解方案',
                    '监控跟踪：记录无法修复的漏洞'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '处理无法自动修复的漏洞',
            content: {
                description: '某些漏洞需要手动处理，包括升级依赖、使用替代方案等。',
                examples: [
                    {
                        title: '手动升级依赖',
                        code: `# 场景：lodash有漏洞，但被间接依赖

# 1. 查看依赖树
npm ls lodash
# 输出：
# ├─┬ dependency-a@1.0.0
# │ └── lodash@4.17.20  ← 有漏洞
# └─┬ dependency-b@2.0.0
#   └── lodash@4.17.21  ← 安全

# 2. 使用overrides强制版本（npm 8.3+）
{
  "overrides": {
    "lodash": "4.17.21"  // 强制所有lodash使用安全版本
  }
}

# 3. 或使用resolutions（yarn）
{
  "resolutions": {
    "**/lodash": "4.17.21"
  }
}

# 4. 重新安装
npm install`,
                        notes: 'overrides可以强制更新间接依赖'
                    },
                    {
                        title: '评估和记录风险',
                        code: `// security-exceptions.md
# 安全例外清单

## 1. lodash 原型污染漏洞（CVE-2019-10744）

**严重程度**: High

**影响范围**: 仅在开发环境使用，不影响生产

**原因**: 
- 依赖的webpack-dev-server使用
- 升级会破坏现有构建配置

**缓解措施**:
- 生产构建不包含此依赖
- 定期检查是否有兼容的更新

**计划**: 2024 Q2升级webpack到v5

**责任人**: @security-team

**最后审查**: 2024-01-01`,
                        notes: '记录无法立即修复的漏洞'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖完整性验证',
            content: {
                description: 'npm使用SHA-512哈希值验证包的完整性，确保下载的包未被篡改。',
                mechanism: 'package-lock.json记录每个包的integrity（SHA-512哈希），npm install时下载后验证哈希值，不匹配则拒绝安装。',
                keyPoints: [
                    'integrity字段：SHA-512哈希值',
                    '自动验证：npm install自动检查',
                    'package-lock.json：记录完整性信息',
                    '防篡改：检测中间人攻击',
                    'npm ci：严格验证',
                    'Subresource Integrity：类似浏览器的SRI'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '完整性验证',
            content: {
                description: 'package-lock.json的integrity字段保证依赖完整性。',
                examples: [
                    {
                        title: 'integrity字段',
                        code: `// package-lock.json
{
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+..."
    }
  }
}

// npm install时会：
// 1. 下载lodash-4.17.21.tgz
// 2. 计算文件的SHA-512
// 3. 与integrity字段对比
// 4. 不匹配则报错并拒绝安装`,
                        notes: 'integrity防止包被篡改'
                    },
                    {
                        title: '验证失败处理',
                        code: `# 验证失败错误
npm ERR! sha512-... integrity checksum failed when using sha512
npm ERR! Verification failed while extracting lodash@4.17.21

# 可能原因：
# 1. 网络问题导致下载不完整
# 2. 代理或CDN缓存了损坏的文件
# 3. 中间人攻击（少见）

# 解决方法：
# 1. 清除缓存重试
npm cache clean --force
npm install

# 2. 使用官方registry
npm config set registry https://registry.npmjs.org
npm install

# 3. 删除lock文件重新生成
rm package-lock.json
npm install`,
                        notes: '验证失败通常是网络问题'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '双因素认证（2FA）',
            content: {
                description: '启用2FA可以保护npm账号免受密码泄露的影响，是账号安全的重要措施。',
                mechanism: '2FA要求登录和发布时除了密码，还需要手机App生成的一次性验证码，即使密码泄露也无法登录。',
                keyPoints: [
                    'TOTP：基于时间的一次性密码',
                    'Auth App：Google Authenticator、Authy等',
                    '发布保护：发布时必须输入OTP',
                    '恢复码：保存恢复码以防手机丢失',
                    '强制2FA：组织可以要求成员启用',
                    'npm token：API token不受2FA影响'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '启用和使用2FA',
            content: {
                description: '2FA是保护npm账号的标准做法，所有包维护者都应该启用。',
                examples: [
                    {
                        title: '启用2FA',
                        code: `# 1. 在npm网站启用2FA
# https://www.npmjs.com/settings/your-username/tfa

# 选择模式：
# - Auth only: 仅登录需要OTP
# - Auth and writes: 登录和发布都需要OTP（推荐）

# 2. 扫描二维码到Authenticator App

# 3. 保存恢复码（重要！）

# 4. 输入验证码完成启用`,
                        notes: '推荐选择"Auth and writes"模式'
                    },
                    {
                        title: '使用2FA发布',
                        code: `# 发布时需要OTP
npm publish --otp=123456

# 或在交互式提示时输入
npm publish
# Enter one-time password: 123456

# CI/CD中使用automation token
# 1. 在npm网站创建automation token
# 2. 设置为环境变量
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx

# 3. 配置.npmrc
//registry.npmjs.org/:_authToken=\${NPM_TOKEN}

# 4. CI中发布无需OTP
npm publish`,
                        notes: 'CI使用automation token绕过2FA'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '.npmignore和files',
            content: {
                description: '正确配置发布文件，避免意外泄露敏感信息或源码。',
                mechanism: 'files字段白名单或.npmignore黑名单控制发布内容，防止.env、私钥等敏感文件被发布。',
                keyPoints: [
                    'files字段：白名单，明确包含',
                    '.npmignore：黑名单，明确排除',
                    '默认排除：node_modules、.git等',
                    '敏感信息：.env、密钥、配置',
                    '源码保护：可选择不发布源码',
                    'npm pack：发布前预览'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '安全的发布配置',
            content: {
                description: '避免将敏感信息和不必要的文件发布到npm。',
                examples: [
                    {
                        title: '使用files白名单（推荐）',
                        code: `{
  "files": [
    "dist",          // 只发布构建产物
    "README.md",
    "LICENSE"
  ]
}

// 自动排除（无需配置）：
// - node_modules/
// - .git/
// - .env
// - *.log
// - npm-debug.log

// 自动包含（无需配置）：
// - package.json
// - README（任何扩展名）
// - LICENSE / LICENCE（任何扩展名）`,
                        notes: 'files白名单最安全'
                    },
                    {
                        title: '.npmignore配置',
                        code: `# .npmignore
# 源码
src/
test/
*.test.js

# 配置文件
.env
.env.*
config.local.js
*.config.js
tsconfig.json

# 开发文件
.vscode/
.idea/
.DS_Store

# 文档
docs/
examples/
*.md
!README.md

# CI/CD
.github/
.gitlab-ci.yml

# 注意：如果有files字段，.npmignore会被忽略`,
                        notes: '.npmignore语法与.gitignore相同'
                    },
                    {
                        title: '发布前检查',
                        code: `# 1. 打包查看内容
npm pack

# 2. 解压.tgz文件
tar -xzf my-package-1.0.0.tgz

# 3. 检查package/目录
ls -la package/

# 4. 确认没有敏感文件
grep -r "API_KEY" package/
grep -r "password" package/

# 5. 或使用dry-run
npm publish --dry-run

# 6. 清理
rm -rf package/ my-package-1.0.0.tgz`,
                        notes: '发布前务必检查包内容'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'npm安全最佳实践',
            content: {
                description: '多层安全措施组合使用，全方位保护项目和账号安全。',
                keyPoints: [
                    '启用2FA：保护npm账号',
                    '定期audit：每周或每月扫描',
                    '及时更新：快速修复high/critical漏洞',
                    'lock文件：提交package-lock.json',
                    'npm ci：CI中使用而不是install',
                    'files白名单：只发布必要文件',
                    '最小权限：npm token使用最小权限',
                    '依赖审查：新增依赖时检查来源和维护状态',
                    '监控告警：关键漏洞及时通知',
                    '供应链：使用Snyk、Dependabot等工具'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第13章：npm生命周期钩子',
            url: './render.html?subject=pkg-manager&type=content&chapter=13'
        },
        next: {
            title: '第15章：npm Workspaces',
            url: './render.html?subject=pkg-manager&type=content&chapter=15'
        }
    }
};
