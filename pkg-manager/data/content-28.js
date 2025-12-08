/**
 * 第28章：依赖更新策略
 * 手动/自动更新、ncu/Renovate/Dependabot工具
 */

window.content = {
    section: {
        title: '第28章：依赖更新策略',
        icon: '🔄'
    },
    
    topics: [
        {
            type: 'concept',
            title: '依赖更新的重要性',
            content: {
                description: '定期更新依赖是项目健康的关键，获取新特性、性能优化和安全修复，但需要平衡更新频率和稳定性。',
                keyPoints: [
                    '安全修复：及时修补漏洞',
                    '新特性：享受最新功能',
                    '性能优化：改进的实现',
                    'Bug修复：解决已知问题',
                    '兼容性：保持与生态同步',
                    '技术债：避免版本过旧',
                    '风险控制：测试和回滚机制'
                ]
            }
        },
        
        {
            type: 'principle',
            title: '语义化版本与更新策略',
            content: {
                description: '理解语义化版本（SemVer）是制定更新策略的基础，不同类型的更新有不同的风险。',
                mechanism: 'SemVer格式为major.minor.patch，^允许minor和patch更新，~只允许patch更新。Major版本可能有破坏性变更。',
                keyPoints: [
                    'patch更新：bug修复，低风险',
                    'minor更新：新特性，向后兼容',
                    'major更新：破坏性变更，高风险',
                    '^版本：允许minor更新',
                    '~版本：只允许patch更新',
                    '精确版本：不自动更新',
                    '更新频率：根据类型决定'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '手动更新依赖',
            content: {
                description: '手动更新提供最大控制权，适合关键项目。',
                examples: [
                    {
                        title: 'npm手动更新',
                        code: `# 查看过时的包
npm outdated
# 输出：
# Package    Current  Wanted  Latest  Location
# lodash     4.17.20  4.17.21 4.17.21 my-app
# react      17.0.2   17.0.2  18.2.0  my-app

# Wanted: package.json允许的最新版本（如^17.0.0 → 17.x.x）
# Latest: npm上的最新版本

# 更新到Wanted版本（遵循package.json范围）
npm update
# 或
npm up

# 更新特定包到Wanted
npm update lodash

# 更新到Latest（修改package.json）
npm install lodash@latest

# 查看某个包的版本历史
npm view lodash versions`,
                        notes: 'npm update遵循版本范围'
                    },
                    {
                        title: 'yarn手动更新',
                        code: `# 查看过时的包
yarn outdated

# 更新到Wanted版本
yarn upgrade

# 更新特定包
yarn upgrade lodash

# 更新到最新版本（忽略范围）
yarn upgrade lodash --latest

# 交互式更新
yarn upgrade-interactive
# 或
yarn upgrade-interactive --latest

# 界面：
# ? Choose which packages to update.
# ◯ lodash  4.17.20 ❯ 4.17.21
# ◉ react   17.0.2  ❯ 18.2.0
# 空格选择，回车确认`,
                        notes: 'yarn upgrade-interactive很方便'
                    },
                    {
                        title: 'pnpm手动更新',
                        code: `# 查看过时的包
pnpm outdated

# 更新到Wanted版本
pnpm update

# 更新特定包
pnpm update lodash

# 更新到最新版本
pnpm update lodash --latest
# 或
pnpm up -L lodash

# 交互式更新（需要插件）
pnpm update --interactive
# 或
pnpm up -i

# 递归更新所有workspace
pnpm up -r`,
                        notes: 'pnpm update功能完整'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm-check-updates (ncu)',
            content: {
                description: 'npm-check-updates是最流行的依赖更新工具，可以批量更新package.json到最新版本。',
                mechanism: 'ncu读取package.json，检查npm registry的最新版本，可以自动更新package.json，然后运行包管理器安装。',
                keyPoints: [
                    '批量检查：所有依赖',
                    '最新版本：忽略语义化范围',
                    '安全更新：只更新compatible',
                    '选择性更新：过滤特定包',
                    '预览模式：先查看再决定',
                    '自动化：CI集成',
                    '灵活配置：支持多种选项'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm-check-updates使用',
            content: {
                description: 'ncu提供强大的依赖更新功能。',
                examples: [
                    {
                        title: 'ncu基本用法',
                        code: `# 安装ncu
npm install -g npm-check-updates

# 检查所有过时的依赖（不修改文件）
ncu
# 输出：
# lodash  ^4.17.20 → ^4.17.21
# react   ^17.0.2  → ^18.2.0

# 更新package.json
ncu -u
# 或
ncu --upgrade

# 然后安装新版本
npm install

# 一步完成：更新并安装
ncu -u && npm install`,
                        notes: 'ncu更新package.json'
                    },
                    {
                        title: 'ncu高级选项',
                        code: `# 只检查生产依赖
ncu --dep prod

# 只检查开发依赖
ncu --dep dev

# 过滤特定包（支持glob）
ncu --filter lodash
ncu --filter "react*"
ncu --filter "/^@types\//"

# 排除特定包
ncu --reject eslint
ncu --reject "babel-*"

# 只更新minor和patch（避免breaking changes）
ncu --target minor

# 只更新patch
ncu --target patch

# 更新到最小满足版本（保守）
ncu --target smallest

# 交互式选择
ncu --interactive
# 或
ncu -i

# 只更新到满足engines.node的版本
ncu --enginesNode`,
                        notes: 'ncu选项丰富'
                    },
                    {
                        title: 'ncu在CI中',
                        code: `# package.json
{
  "scripts": {
    "update:check": "ncu",
    "update:minor": "ncu --target minor -u && npm install",
    "update:all": "ncu -u && npm install"
  }
}

# GitHub Actions定期检查更新
# .github/workflows/update-deps.yml
name: Check Dependencies
on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install -g npm-check-updates
      
      - name: Check updates
        run: ncu > updates.txt
      
      - name: Create issue
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const updates = fs.readFileSync('updates.txt', 'utf8');
            if (updates.trim()) {
              github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: '📦 Dependencies Update Available',
                body: \`\`\`\\n\${updates}\\n\`\`\`
              });
            }`,
                        notes: '自动检查并创建issue'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Renovate自动化',
            content: {
                description: 'Renovate是功能最强大的依赖更新自动化工具，支持多种包管理器和平台，可以自动创建更新PR。',
                mechanism: 'Renovate定期扫描仓库，检测依赖更新，自动创建PR，可配置更新策略、分组、自动合并等。',
                keyPoints: [
                    '自动PR：检测到更新自动创建',
                    '智能分组：相关更新一起',
                    '自动合并：测试通过自动合并',
                    '多平台：GitHub/GitLab/Bitbucket',
                    '配置灵活：renovate.json',
                    '安全优先：自动更新漏洞',
                    '大规模：企业级解决方案'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Renovate配置',
            content: {
                description: 'Renovate通过配置文件精确控制更新行为。',
                examples: [
                    {
                        title: '启用Renovate',
                        code: `# 1. 在GitHub安装Renovate App
# https://github.com/apps/renovate

# 2. 创建配置文件
# renovate.json
{
  "extends": [
    "config:base"  // 使用默认配置
  ]
}

# 或使用推荐配置
{
  "extends": [
    "config:recommended"
  ]
}

# Renovate会：
# 1. 每周检查依赖更新
# 2. 为每个更新创建单独的PR
# 3. 包含变更日志和发布说明
# 4. 自动rebased过时的PR`,
                        notes: '配置文件在仓库根目录'
                    },
                    {
                        title: 'Renovate高级配置',
                        code: `// renovate.json
{
  "extends": ["config:recommended"],
  
  // 更新计划
  "schedule": ["before 3am on Monday"],
  
  // 自动合并（仅patch和minor）
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "pin", "digest"],
      "automerge": true
    },
    {
      "matchUpdateTypes": ["minor"],
      "automerge": true,
      "automergeType": "pr"
    }
  ],
  
  // 分组：将所有eslint相关更新放在一个PR
  "packageRules": [
    {
      "matchPackagePatterns": ["^eslint"],
      "groupName": "eslint packages"
    },
    {
      "matchPackagePatterns": ["^@types/"],
      "groupName": "TypeScript definitions"
    }
  ],
  
  // 标签
  "labels": ["dependencies"],
  
  // PR标题格式
  "semanticCommits": "enabled",
  "commitMessagePrefix": "chore:",
  
  // 限制并发PR数量
  "prConcurrentLimit": 10,
  
  // 忽略特定包
  "ignoreDeps": ["react", "react-dom"],
  
  // 只在非工作时间
  "timezone": "Asia/Shanghai"
}`,
                        notes: 'Renovate功能强大'
                    },
                    {
                        title: 'Renovate Monorepo配置',
                        code: `// renovate.json
{
  "extends": ["config:recommended"],
  
  // Monorepo模式
  "monorepo": true,
  
  // 工作区包规则
  "packageRules": [
    {
      "matchPaths": ["packages/**"],
      "groupName": "workspace packages"
    },
    {
      // 统一React版本
      "matchPackageNames": ["react", "react-dom"],
      "groupName": "React",
      "rangeStrategy": "pin"  // 固定版本
    }
  ],
  
  // 不同workspace不同策略
  "packageRules": [
    {
      "matchPaths": ["packages/core/**"],
      "schedule": ["before 3am on Monday"]
    },
    {
      "matchPaths": ["apps/**"],
      "automerge": false,  // app不自动合并
      "reviewers": ["team:frontend"]
    }
  ]
}`,
                        notes: 'Renovate原生支持Monorepo'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Dependabot',
            content: {
                description: 'Dependabot是GitHub官方的依赖更新工具，深度集成GitHub，配置简单，适合GitHub项目。',
                mechanism: 'Dependabot定期检查依赖，自动创建PR，支持安全更新、版本更新，配置文件在.github/dependabot.yml。',
                keyPoints: [
                    'GitHub原生：无需安装',
                    '安全更新：自动修复漏洞',
                    '版本更新：定期检查',
                    '简单配置：YAML文件',
                    '限制：功能不如Renovate丰富',
                    '免费：GitHub用户可用'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Dependabot配置',
            content: {
                description: 'Dependabot配置简单，适合中小型项目。',
                examples: [
                    {
                        title: 'Dependabot基本配置',
                        code: `# .github/dependabot.yml
version: 2
updates:
  # npm依赖
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "03:00"
    open-pull-requests-limit: 10
    
    # 自动合并规则
    # （需要在GitHub设置中配置）
    
    # 标签
    labels:
      - "dependencies"
      - "javascript"
    
    # 提交消息
    commit-message:
      prefix: "chore"
      include: "scope"
    
    # 审查者
    reviewers:
      - "username"
    
    # 允许的更新类型
    allow:
      - dependency-type: "production"
      - dependency-type: "development"`,
                        notes: 'Dependabot配置在.github目录'
                    },
                    {
                        title: 'Dependabot Monorepo',
                        code: `# .github/dependabot.yml
version: 2
updates:
  # 根目录
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  
  # packages/ui
  - package-ecosystem: "npm"
    directory: "/packages/ui"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ui"
  
  # packages/utils
  - package-ecosystem: "npm"
    directory: "/packages/utils"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "utils"

# 注意：Dependabot对Monorepo支持有限
# 需要为每个package单独配置`,
                        notes: 'Monorepo需要多个配置'
                    },
                    {
                        title: 'Dependabot vs Renovate',
                        code: `# Dependabot优点：
# ✅ GitHub原生，无需安装
# ✅ 配置简单
# ✅ 安全更新自动启用
# ✅ 免费

# Dependabot限制：
# ❌ 功能较少
# ❌ 不支持自动合并（需手动配置）
# ❌ 分组功能弱
# ❌ Monorepo支持差

# Renovate优点：
# ✅ 功能强大
# ✅ 高度可配置
# ✅ 自动合并
# ✅ 智能分组
# ✅ Monorepo友好

# 选择建议：
# - 小项目：Dependabot
# - 大项目/Monorepo：Renovate
# - 企业项目：Renovate`,
                        notes: '根据项目规模选择'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '更新工具对比',
            content: {
                description: '不同更新工具适合不同场景。',
                items: [
                    {
                        name: '手动更新 (npm update)',
                        pros: [
                            '完全控制',
                            '无额外工具',
                            '适合小项目'
                        ],
                        cons: [
                            '容易忘记',
                            '耗时',
                            '无自动化'
                        ]
                    },
                    {
                        name: 'ncu',
                        pros: [
                            '简单易用',
                            '本地运行',
                            '灵活过滤',
                            '适合手动更新'
                        ],
                        cons: [
                            '不自动化',
                            '需要手动运行'
                        ]
                    },
                    {
                        name: 'Renovate',
                        pros: [
                            '功能最强',
                            '高度自动化',
                            'Monorepo友好',
                            '智能分组',
                            '自动合并',
                            '企业级'
                        ],
                        cons: [
                            '配置复杂',
                            '学习曲线'
                        ]
                    },
                    {
                        name: 'Dependabot',
                        pros: [
                            'GitHub原生',
                            '配置简单',
                            '免费',
                            '安全更新'
                        ],
                        cons: [
                            '功能有限',
                            '仅GitHub',
                            'Monorepo支持差'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '依赖更新最佳实践',
            content: {
                description: '建立合理的更新策略确保项目健康和稳定。',
                keyPoints: [
                    '定期更新：每周或每月review',
                    'patch快速：patch更新风险低，快速应用',
                    'minor谨慎：测试后再合并',
                    'major缓慢：充分测试，逐个更新',
                    '安全优先：安全更新立即应用',
                    '自动化测试：CI充分测试',
                    '分组更新：相关依赖一起更新',
                    '变更日志：阅读release notes',
                    '回滚准备：有问题快速回滚',
                    'Monorepo统一：保持版本一致'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第27章：锁文件管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=27'
        },
        next: {
            title: '第29章：幽灵依赖与依赖提升',
            url: './render.html?subject=pkg-manager&type=content&chapter=29'
        }
    }
};
