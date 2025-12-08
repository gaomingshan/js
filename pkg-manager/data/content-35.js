/**
 * 第35章：包安全与合规
 * 漏洞扫描、License合规、供应链安全、SBOM生成
 */

window.content = {
    section: {
        title: '第35章：包安全与合规',
        icon: '🔒'
    },
    
    topics: [
        {
            type: 'concept',
            title: '包安全的重要性',
            content: {
                description: '依赖安全是现代应用安全的基石，开源包可能包含漏洞、恶意代码或不兼容的许可证，需要持续监控和管理。',
                keyPoints: [
                    '安全漏洞：CVE数据库',
                    '恶意包：供应链攻击',
                    '许可证：法律合规',
                    '审计：定期检查',
                    '自动化：CI集成',
                    '响应：快速修复',
                    '政策：安全规范'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '漏洞扫描',
            content: {
                description: '使用工具检测依赖中的已知漏洞。',
                examples: [
                    {
                        title: 'npm audit',
                        code: `# 审计依赖
npm audit

# 输出：
# found 3 vulnerabilities (1 moderate, 2 high)
#
# moderate  Regular Expression Denial of Service
# Package   lodash
# Patched in >=4.17.21
# Dependency of express
# Path    express > lodash

# 自动修复
npm audit fix

# 强制修复（可能有破坏性变更）
npm audit fix --force

# 生成JSON报告
npm audit --json > audit-report.json

# CI中使用
npm audit --audit-level=moderate
# 如果有moderate及以上漏洞，返回非0退出码`,
                        notes: 'npm audit内置工具'
                    },
                    {
                        title: 'Snyk扫描',
                        code: `# Snyk是专业的安全工具

# 安装
npm install -g snyk

# 认证
snyk auth

# 测试
snyk test

# 输出：
# ✗ High severity vulnerability found in lodash
#   Prototype Pollution
#   Package: lodash
#   Fix: lodash@4.17.21

# 监控（持续监控）
snyk monitor

# CI集成
# .github/workflows/security.yml
- name: Run Snyk
  run: |
    npm install -g snyk
    snyk test --severity-threshold=high`,
                        notes: 'Snyk功能更强大'
                    },
                    {
                        title: 'OSSF Scorecard',
                        code: `# OSSF Scorecard评估包的安全性

# 在线查看：
# https://deps.dev/

# CLI
npm install -g @ossf/scorecard

scorecard --repo=github.com/lodash/lodash

# 输出：
# Check: Binary-Artifacts - 10/10
# Check: Branch-Protection - 0/10
# Check: CI-Tests - 10/10
# Check: Dangerous-Workflow - 10/10
# ...
# Overall Score: 7.5/10

# 用于选择更安全的依赖`,
                        notes: 'Scorecard评估包质量'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'License合规',
            content: {
                description: '开源许可证决定了代码的使用、修改和分发权限，企业需要确保符合许可证要求。',
                mechanism: '使用工具扫描依赖的许可证，识别不兼容或限制性许可证，确保合规使用。',
                keyPoints: [
                    'MIT/Apache：宽松许可',
                    'GPL：传染性许可',
                    '商业禁止：某些包限制商用',
                    '许可证冲突：检测不兼容',
                    '白名单：允许的许可证',
                    '黑名单：禁止的许可证',
                    '审计：定期检查'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'License检查',
            content: {
                description: '检查和管理依赖的许可证。',
                examples: [
                    {
                        title: 'license-checker',
                        code: `# 安装
npm install -g license-checker

# 列出所有许可证
license-checker

# 输出：
# lodash@4.17.21
#   licenses: MIT
#   repository: https://github.com/lodash/lodash
#
# express@4.18.2
#   licenses: MIT
#   repository: https://github.com/expressjs/express

# 只显示特定许可证
license-checker --onlyAllow "MIT;Apache-2.0"

# 排除GPL
license-checker --exclude "GPL"

# 生成CSV
license-checker --csv > licenses.csv

# 生成JSON
license-checker --json > licenses.json

# package.json配置
{
  "scripts": {
    "check:license": "license-checker --onlyAllow \\"MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause\\""
  }
}`,
                        notes: 'license-checker扫描许可证'
                    },
                    {
                        title: 'CI License检查',
                        code: `# .github/workflows/license-check.yml
name: License Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install -g license-checker
      
      - name: Check licenses
        run: |
          license-checker --onlyAllow "MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause" \\
            --excludePrivatePackages

# 不允许的许可证会导致失败`,
                        notes: 'CI自动化检查'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'SBOM（软件物料清单）',
            content: {
                description: 'SBOM是软件成分的完整清单，列出所有依赖及其版本、许可证、来源，用于合规、安全和供应链管理。',
                mechanism: '使用工具生成标准格式（SPDX/CycloneDX）的SBOM，记录软件供应链信息，支持审计和漏洞追踪。',
                keyPoints: [
                    'SPDX格式：Linux基金会标准',
                    'CycloneDX格式：OWASP标准',
                    '完整清单：所有依赖',
                    '可追溯：来源和版本',
                    '安全：漏洞关联',
                    '合规：许可证信息',
                    '自动生成：集成到CI'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'SBOM生成',
            content: {
                description: '生成标准格式的软件物料清单。',
                examples: [
                    {
                        title: 'CycloneDX',
                        code: `# 安装
npm install -g @cyclonedx/cyclonedx-npm

# 生成SBOM
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# sbom.json（CycloneDX格式）
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "lodash",
      "version": "4.17.21",
      "purl": "pkg:npm/lodash@4.17.21",
      "licenses": [
        {
          "license": {
            "id": "MIT"
          }
        }
      ]
    }
  ]
}

# CI集成
- name: Generate SBOM
  run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json

- name: Upload SBOM
  uses: actions/upload-artifact@v3
  with:
    name: sbom
    path: sbom.json`,
                        notes: 'CycloneDX是OWASP标准'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '安全最佳实践',
            content: {
                description: '构建安全的依赖管理体系。',
                keyPoints: [
                    'npm audit：定期扫描漏洞',
                    'Dependabot/Renovate：自动更新',
                    'License检查：CI强制',
                    'SBOM：生成物料清单',
                    '最小权限：npm token权限',
                    '私有registry：内部包管理',
                    '签名验证：包完整性',
                    '安全政策：制定规范',
                    '应急响应：快速修复流程',
                    '教育培训：提升安全意识'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第34章：依赖分析与优化',
            url: './render.html?subject=pkg-manager&type=content&chapter=34'
        },
        next: {
            title: '返回目录',
            url: './index.html?subject=pkg-manager'
        }
    }
};
