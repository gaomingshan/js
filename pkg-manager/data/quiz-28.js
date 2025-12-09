/**
 * 第28章：依赖安全与审计 - 面试题
 * 涵盖依赖漏洞检测、修复和供应链安全
 */

window.content = {
    section: {
        title: "第28章：依赖安全与审计 - 面试题",
        icon: "🛡️",
        description: "掌握依赖漏洞检测、修复和供应链安全防护"
    },
    
    topics: [
        // ==================== 单选题 ====================
        {
            type: "quiz",
            title: "题目1：依赖审计命令",
            content: {
                questionType: "single",
                difficulty: "easy",
                tags: ["安全审计", "CLI"],
                question: "运行 `pnpm audit` 后，发现一个仅在开发依赖中存在的低危漏洞，最佳的处理方式是？",
                options: [
                    "立即运行 pnpm audit fix 自动修复",
                    "忽略它，因为只是开发依赖且是低危",
                    "评估影响范围，手动升级相关依赖或使用 overrides",
                    "删除该依赖"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "依赖漏洞处理",
                    description: "自动修复可能会引入破坏性变更，忽略漏洞则有安全风险。最佳实践是评估后手动处理。",
                    sections: [
                        {
                            title: "审计命令",
                            code: String.raw`# 检查漏洞
npm audit
pnpm audit
yarn audit

# 自动修复（慎用）
npm audit fix          # 只升级兼容版本
npm audit fix --force  # 强制升级（可能破坏）

# pnpm处理方式
pnpm audit --fix       # 自动修复`,
                            language: "bash"
                        },
                        {
                            title: "漏洞等级",
                            code: String.raw`┌──────────┬──────────────┬──────────────┐
│ 等级     │ 描述         │ 建议行动     │
├──────────┼──────────────┼──────────────┤
│ Critical │ 严重漏洞     │ 立即修复     │
│ High     │ 高危漏洞     │ 尽快修复     │
│ Moderate │ 中等风险     │ 计划修复     │
│ Low      │ 低风险       │ 评估修复     │
└──────────┴──────────────┴──────────────┘`,
                            language: "text"
                        },
                        {
                            title: "使用 overrides 修复嵌套依赖漏洞",
                            code: String.raw`// package.json
{
  "pnpm": {
    "overrides": {
      // 强制升级深层依赖
      "minimist": "^1.2.6"
    }
  }
}`,
                            language: "json"
                        }
                    ]
                },
                source: "pnpm安全文档"
            }
        },
        
        {
            type: "quiz",
            title: "题目2：Lockfile安全性",
            content: {
                questionType: "single",
                difficulty: "medium",
                tags: ["Lockfile", "安全"],
                question: "为什么提交 lockfile (package-lock.json / pnpm-lock.yaml) 对安全至关重要？",
                options: [
                    "它能加快安装速度",
                    "它能确保所有开发者使用完全相同的依赖树和完整性校验",
                    "它包含了所有依赖的源码",
                    "它能自动修复安全漏洞"
                ],
                correctAnswer: 1,
                explanation: {
                    title: "Lockfile的安全作用",
                    description: "Lockfile 不仅锁定版本，还包含完整性哈希（integrity），防止中间人攻击或篡改。",
                    sections: [
                        {
                            title: "Lockfile结构",
                            code: String.raw`# pnpm-lock.yaml 片段
packages:
  /lodash/4.17.21:
    resolution:
      integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+Lf6BKtDkrmyaKKzP4uF...
    dev: false

# 关键字段：
# resolution.integrity: 包含SHA-512哈希
# 确保下载的包内容未被篡改`,
                            language: "yaml"
                        },
                        {
                            title: "安全风险：Lockfile投毒",
                            code: String.raw`1. 攻击者提交恶意PR
2. 修改 package.json 引入恶意包
3. 修改 lockfile 隐藏恶意包或修改 integrity
4. 开发者合并PR，CI/CD自动部署
5. 生产环境被植入后门

# 防御措施：
# - 严格审查 lockfile 变更
# - 使用 \`npm ci\` 或 \`pnpm install --frozen-lockfile\`
# - 使用安全扫描工具`,
                            language: "text"
                        }
                    ]
                },
                source: "OWASP Top 10"
            }
        },
        
        // ==================== 多选题 ====================
        {
            type: "quiz",
            title: "题目3：供应链攻击防御",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["安全", "供应链"],
                question: "以下哪些措施可以有效防御软件供应链攻击？（多选）",
                options: [
                    "使用 CI/CD 自动运行依赖审计",
                    "启用 npm 的 2FA（双重认证）",
                    "使用私有镜像源（如 Verdaccio）代理和审核包",
                    "在 install 脚本中运行任意命令",
                    "锁定依赖版本（Pin versions）"
                ],
                correctAnswer: [0, 1, 2, 4],
                explanation: {
                    title: "供应链安全最佳实践",
                    description: "在 install 脚本中运行任意命令（install scripts）是主要的安全风险来源，应该禁用而非利用。",
                    sections: [
                        {
                            title: "防御措施详解",
                            code: String.raw`1. 自动化审计
# .github/workflows/audit.yml
- name: Audit dependencies
  run: pnpm audit --prod

2. 启用2FA
# 保护发布账户，防止凭证泄露
npm profile enable-2fa auth-and-writes

3. 禁用 Install Scripts
# .npmrc
ignore-scripts=true

# 风险：许多恶意包通过 preinstall/postinstall 脚本执行攻击
# 缺点：某些正常包（如 esbuild）需要脚本安装二进制文件
# 解决方案：使用 @lavamoat/allow-scripts 白名单机制

4. 版本锁定
// package.json
{
  "dependencies": {
    "react": "18.2.0"  // 去掉 ^ 或 ~
  },
  "engines": {
    "node": ">=16.0.0"
  }
}`,
                            language: "yaml"
                        },
                        {
                            title: "恶意包常见手法",
                            points: [
                                "Typosquatting（近似域名）：react-dom -> react-doom",
                                "Dependency Confusion（依赖混淆）：在公有源发布同名私有包",
                                "Brandjacking（品牌劫持）：伪装成流行库的维护者",
                                "Malicious Scripts（恶意脚本）：利用 postinstall窃取环境变量"
                            ]
                        }
                    ]
                },
                source: "Socket.dev 安全报告"
            }
        },
        
        {
            type: "quiz",
            title: "题目4：安全工具链",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["工具", "安全"],
                question: "以下哪些工具可以集成到开发流程中以提高依赖安全性？（多选）",
                options: [
                    "Snyk",
                    "Dependabot",
                    "Socket",
                    "ESLint-plugin-security",
                    "Owasp Dependency Check"
                ],
                correctAnswer: [0, 1, 2, 3, 4],
                explanation: {
                    title: "前端安全工具链",
                    description: "这些工具覆盖了从代码静态分析到依赖动态监控的各个环节。",
                    sections: [
                        {
                            title: "工具分类",
                            code: String.raw`┌────────────────┬─────────────────────────────┐
│ 类别           │ 工具                        │
├────────────────┼─────────────────────────────┤
│ 依赖漏洞扫描   │ Snyk, npm audit, Trivy      │
│ 自动更新       │ Dependabot, Renovate        │
│ 供应链安全     │ Socket, Owasp Dependency    │
│ 代码静态分析   │ ESLint-plugin-security      │
│ 运行时防护     │ LavaMoat                    │
└────────────────┴─────────────────────────────┘`,
                            language: "text"
                        },
                        {
                            title: "Socket.dev 特性",
                            description: "Socket 不仅检查已知漏洞（CVE），还分析包的行为（如是否有网络请求、文件系统访问等），能发现未知的恶意包。",
                            code: String.raw`# 安装
npm install -g @socketsecurity/cli

# 扫描项目
socket scan .

# 拦截高危包
# socket.yml
issues:
  installScripts: error
  networkAccess: error`,
                            language: "yaml"
                        }
                    ]
                },
                source: "各大安全工具文档"
            }
        },
        
        // ==================== 代码题 ====================
        {
            type: "quiz",
            title: "题目5：实现安全的安装脚本",
            content: {
                questionType: "code-single",
                difficulty: "hard",
                tags: ["Shell", "安全"],
                question: "编写一个安全的CI安装脚本，要求：使用CI模式、验证Lockfile、禁用脚本、处理私有源。",
                code: String.raw`#!/bin/bash
set -e

# 1. 验证环境
if [ -z "$NPM_TOKEN" ]; then
  echo "Error: NPM_TOKEN is missing"
  exit 1
fi

# 2. 配置认证
echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

# 3. 安全安装
# 补充命令...
`,
                options: [
                    "npm install --no-scripts",
                    "npm ci --ignore-scripts --audit",
                    "pnpm install --frozen-lockfile --ignore-scripts",
                    "yarn install --frozen-lockfile --ignore-scripts"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "安全安装脚本",
                    description: "使用 pnpm 的 CI 模式安装，并禁用脚本执行，是 Monorepo 场景下的最佳实践。",
                    sections: [
                        {
                            title: "完整脚本",
                            code: String.raw`#!/bin/bash
set -e

echo "🔒 Starting secure installation..."

# 1. 配置私有源认证
echo "@myorg:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}" >> .npmrc

# 2. pnpm 安全安装
# --frozen-lockfile: 确保 lockfile 不变（CI标准）
# --ignore-scripts: 禁止运行 postinstall 等脚本（防投毒）
# --prod: 仅安装生产依赖（构建镜像时）
pnpm install --frozen-lockfile --ignore-scripts

# 3. 允许特定包运行脚本（使用白名单）
# 需要安装 lava-moat/allow-scripts
npx allow-scripts

# 4. 运行审计
pnpm audit --prod --audit-level=high

echo "✅ Installation complete and audited."`,
                            language: "bash"
                        },
                        {
                            title: "为什么禁用 Scripts？",
                            code: String.raw`# 攻击案例：event-stream 事件
# 恶意代码被隐藏在依赖的依赖中
# payload 存放在 flatmap-stream 包的 test/data.js 中
# 只有在运行 npm run build 时才会触发

# 禁用脚本可以切断攻击链
# 但需要配合 allow-scripts 管理合法的构建脚本（如 esbuild, cypress）`,
                            language: "text"
                        }
                    ]
                },
                source: "CI/CD 安全最佳实践"
            }
        },
        
        {
            type: "quiz",
            title: "题目6：自动化依赖审计工作流",
            content: {
                questionType: "code-multiple",
                difficulty: "hard",
                tags: ["GitHub Actions", "自动化"],
                question: "以下 GitHub Actions 工作流实现了自动化的依赖审计和报告，哪些部分是有效的？（多选）",
                code: String.raw`name: Security Audit

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # 每天运行

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      # A. 运行审计并生成JSON报告
      - name: Run Audit
        id: audit
        run: |
          pnpm audit --json > audit-report.json || true
          
      # B. 解析报告并检查高危漏洞
      - name: Analyze Report
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('audit-report.json', 'utf8'));
            
            // pnpm audit json format
            const vulnerabilities = report.advisories || {};
            const highRisk = Object.values(vulnerabilities)
              .filter(v => v.severity === 'high' || v.severity === 'critical');
              
            if (highRisk.length > 0) {
              core.setFailed(\`Found \${highRisk.length} high/critical vulnerabilities!\`);
              
              // 生成Issue内容
              const body = highRisk.map(v => 
                \`### [\${v.title}](\${v.url})\n**Package:** \${v.module_name}\n**Severity:** \${v.severity}\n\`
              ).join('\n---\n');
              
              core.setOutput('issue_body', body);
            }

      # C. 创建Issue通知
      - name: Create Issue
        if: failure()
        uses: peter-evans/create-issue-from-file@v4
        with:
          title: "🚨 Security Alert: High Risk Vulnerabilities Detected"
          content-filepath: ./issue-body.md
          labels: security, automated`,
                options: [
                    "A部分：运行 audit 并忽略退出码（|| true）以防止直接中断",
                    "B部分：使用脚本解析 JSON 报告并筛选高危漏洞",
                    "C部分：当检测到漏洞时自动创建 GitHub Issue",
                    "Cron调度：确保即使没有代码提交也能定期检查新漏洞"
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: "自动化安全审计",
                    description: "这是一个完整的自动化安全审计工作流，结合了定期检查、自动分析和告警。",
                    sections: [
                        {
                            title: "工作流解析",
                            code: String.raw`1. 触发机制
- push: 提交代码时检查
- schedule: 每天定时检查（应对新披露的漏洞）

2. 错误处理
- \`|| true\`: 确保步骤不会立即导致 Workflow 失败，让我们有机会解析报告
- \`core.setFailed\`: 在脚本中根据逻辑手动标记失败

3. 报告解析
- 读取 audit 命令输出的 JSON
- 过滤严重程度（忽略低危）
- 格式化为 Markdown 用于 Issue`,
                            language: "yaml"
                        },
                        {
                            title: "改进建议",
                            code: String.raw`# 1. 自动创建PR修复
- uses: apps/renovate
  with:
    configurationFile: .github/renovate.json

# 2. 发送消息到 Slack/钉钉
- name: Slack Notification
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: \${{ secrets.SLACK_WEBHOOK }}
    SLACK_MESSAGE: '🚨 Security vulnerabilities detected!'`,
                            language: "yaml"
                        }
                    ]
                },
                source: "GitHub Actions文档"
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "第27章：Monorepo依赖管理",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=27"
        },
        next: {
            title: "第29章：版本升级策略",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=29"
        }
    }
};
