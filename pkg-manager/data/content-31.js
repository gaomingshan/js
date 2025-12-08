/**
 * 第31章：Lerna与Monorepo管理
 * Lerna配置、版本策略、bootstrap/run/publish
 */

window.content = {
    section: {
        title: '第31章：Lerna与Monorepo管理',
        icon: '🐉'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Lerna简介',
            content: {
                description: 'Lerna是老牌的Monorepo管理工具，由Babel团队开发，专注于多包发布和版本管理。虽然性能不如现代工具，但在版本管理方面仍有独特优势。',
                keyPoints: [
                    '发布工具：专注npm发布流程',
                    '版本管理：Fixed和Independent模式',
                    '变更日志：自动生成CHANGELOG',
                    '老牌工具：社区成熟',
                    '与npm/yarn集成：透明使用',
                    '现状：维护缓慢，考虑替代方案',
                    '替代：Changesets更现代'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Lerna初始化',
            content: {
                description: 'Lerna的安装和初始化配置。',
                examples: [
                    {
                        title: '初始化Lerna项目',
                        code: `# 1. 初始化项目
mkdir my-lerna-repo
cd my-lerna-repo
npm init -y

# 2. 安装Lerna
npm install -D lerna

# 3. 初始化Lerna
npx lerna init

# 生成的文件：
# lerna.json      ← Lerna配置
# packages/       ← 包目录

# lerna.json
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "0.0.0",  // Fixed模式：统一版本
  "packages": [
    "packages/*"
  ]
}

# package.json
{
  "name": "root",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "lerna": "^7.0.0"
  }
}`,
                        notes: 'Lerna通常与workspace配合使用'
                    },
                    {
                        title: '创建包',
                        code: `# 使用Lerna创建包
npx lerna create @my/utils
npx lerna create @my/ui

# 生成的结构：
packages/
├── utils/
│   ├── lib/
│   │   └── utils.js
│   ├── package.json
│   └── README.md
└── ui/
    ├── lib/
    │   └── ui.js
    ├── package.json
    └── README.md

# packages/utils/package.json
{
  "name": "@my/utils",
  "version": "0.0.0",
  "main": "lib/utils.js"
}`,
                        notes: 'lerna create快速创建包'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '版本管理策略',
            content: {
                description: 'Lerna支持两种版本管理模式：Fixed（固定）和Independent（独立），适用不同场景。',
                mechanism: 'Fixed模式所有包共享版本号，一起发布。Independent模式每个包独立版本，单独发布。选择取决于包的关联程度。',
                keyPoints: [
                    'Fixed模式：统一版本号',
                    'Independent模式：独立版本',
                    'Fixed适用：紧密耦合的包',
                    'Independent适用：松散关联',
                    '版本同步：Fixed简化管理',
                    '灵活发布：Independent精细控制',
                    '语义化版本：遵循SemVer'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '版本管理配置',
            content: {
                description: 'Fixed和Independent模式的配置和使用。',
                examples: [
                    {
                        title: 'Fixed模式（默认）',
                        code: `// lerna.json
{
  "version": "1.0.0",  // 所有包的统一版本
  "packages": ["packages/*"]
}

// 发布流程：
npx lerna version
# 提示选择版本更新类型：
# ? Select a new version (currently 1.0.0)
#   patch (1.0.1)
#   minor (1.1.0)
#   major (2.0.0)

# 选择patch后：
# 1. 所有包的package.json更新到1.0.1
# 2. 创建Git commit
# 3. 创建Git tag: v1.0.1
# 4. 推送到远程

# 发布：
npx lerna publish

# 场景：React生态包（react/react-dom）
# 版本号始终保持一致`,
                        notes: 'Fixed模式简化版本管理'
                    },
                    {
                        title: 'Independent模式',
                        code: `// lerna.json
{
  "version": "independent",  // 独立版本模式
  "packages": ["packages/*"]
}

// 发布流程：
npx lerna version

# 逐个包提示：
# ? Select a new version for @my/utils (currently 1.0.0)
#   patch (1.0.1)
#   minor (1.1.0)
#   major (2.0.0)
#   skip (no changes)

# ? Select a new version for @my/ui (currently 2.3.0)
#   patch (2.3.1)
#   minor (2.4.0)
#   major (3.0.0)
#   skip (no changes)

# 结果：
# @my/utils: 1.0.0 → 1.0.1
# @my/ui:    2.3.0 → 2.4.0

# 创建两个Git tag：
# - @my/utils@1.0.1
# - @my/ui@2.4.0

# 场景：Babel生态包
# 每个包独立演进`,
                        notes: 'Independent模式灵活发布'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Lerna核心命令',
            content: {
                description: 'Lerna提供一系列命令管理Monorepo。',
                examples: [
                    {
                        title: 'lerna bootstrap（已废弃）',
                        code: `# ⚠️ 已废弃：推荐使用包管理器的workspace功能

# 旧版本：
npx lerna bootstrap

# 功能：
# 1. npm install所有包的依赖
# 2. 链接内部依赖（npm link）
# 3. 运行prepublish脚本

# 现代替代：
npm install  # npm workspaces
yarn install # yarn workspaces
pnpm install # pnpm workspaces

# 如果必须使用：
npx lerna bootstrap --use-workspaces`,
                        notes: 'bootstrap已被workspace取代'
                    },
                    {
                        title: 'lerna run',
                        code: `# 在所有包中运行脚本
npx lerna run build

# 等价于在每个包中运行：
# cd packages/utils && npm run build
# cd packages/ui && npm run build

# 指定包：
npx lerna run test --scope @my/utils

# 排除包：
npx lerna run lint --ignore @my/legacy

# 并行执行：
npx lerna run build --parallel

# 按拓扑顺序（依赖顺序）：
npx lerna run build --stream

# 场景：
# 1. 构建所有包
# 2. 测试所有包
# 3. 代码检查

# 现代替代：
pnpm -r run build  # pnpm
yarn workspaces run build  # yarn`,
                        notes: 'lerna run批量执行脚本'
                    },
                    {
                        title: 'lerna version',
                        code: `# 版本管理（Lerna的核心功能）
npx lerna version

# 选项：
# patch/minor/major: 指定版本类型
npx lerna version patch

# 跳过Git操作：
npx lerna version --no-git-tag-version

# 跳过推送：
npx lerna version --no-push

# 自动确定版本（基于conventional commits）：
npx lerna version --conventional-commits

# 生成CHANGELOG：
npx lerna version --conventional-commits --changelog-preset angular

# 完整流程示例：
npx lerna version --conventional-commits --create-release github

# 步骤：
# 1. 检测变更的包
# 2. 提示版本更新
# 3. 更新package.json
# 4. 生成/更新CHANGELOG.md
# 5. Git commit
# 6. Git tag
# 7. 推送到远程
# 8. 创建GitHub Release`,
                        notes: 'version是Lerna的强项'
                    },
                    {
                        title: 'lerna publish',
                        code: `# 发布包到npm
npx lerna publish

# 发布流程：
# 1. 运行lerna version（如果未运行）
# 2. npm publish每个包

# 只发布（不更新版本）：
npx lerna publish from-package

# 从Git tag发布：
npx lerna publish from-git

# 指定dist-tag：
npx lerna publish --dist-tag next

# 完整示例：
npx lerna publish --conventional-commits --create-release github

# 场景：
# 1. 正式发布：lerna publish
# 2. 预发布：lerna publish --dist-tag beta
# 3. 修复发布：lerna publish patch`,
                        notes: 'publish自动发布到npm'
                    },
                    {
                        title: 'lerna changed/diff',
                        code: `# 查看变更的包
npx lerna changed

# 输出：
# @my/utils
# @my/ui

# 查看详细差异：
npx lerna diff

# 查看特定包的差异：
npx lerna diff @my/utils

# 应用场景：
# 1. PR审查：了解影响哪些包
# 2. CI：只测试变更的包
# 3. 发布前：确认变更范围`,
                        notes: 'changed检测包变更'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Conventional Commits',
            content: {
                description: 'Lerna结合Conventional Commits可以自动确定版本号和生成CHANGELOG。',
                mechanism: 'Conventional Commits规范化commit message格式，Lerna解析commit历史，自动判断版本更新类型（patch/minor/major）并生成变更日志。',
                keyPoints: [
                    '格式：<type>(<scope>): <subject>',
                    'feat：新功能（minor）',
                    'fix：bug修复（patch）',
                    'BREAKING CHANGE：破坏性变更（major）',
                    '自动版本：根据commit确定',
                    'CHANGELOG：自动生成',
                    '工具：commitlint验证'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Conventional Commits实践',
            content: {
                description: '使用Conventional Commits规范化提交。',
                examples: [
                    {
                        title: 'Commit格式',
                        code: `# Conventional Commits格式
<type>(<scope>): <subject>

<body>

<footer>

# 示例：
feat(@my/utils): add debounce function

feat: 新功能（minor版本）
fix: bug修复（patch版本）
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具

# BREAKING CHANGE（major版本）：
feat(@my/ui)!: redesign Button API

BREAKING CHANGE: Button组件API完全重写

# scope: 包名或模块名
# !: 表示破坏性变更`,
                        notes: '规范化commit message'
                    },
                    {
                        title: 'commitlint配置',
                        code: `# 安装commitlint
npm install -D @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'utils',
      'ui',
      'api',
      'docs'
    ]]
  }
};

# 使用husky
npm install -D husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'

# 现在提交会被验证：
git commit -m "add feature"  # ❌ 错误格式
git commit -m "feat: add feature"  # ✅ 正确`,
                        notes: 'commitlint强制规范'
                    },
                    {
                        title: '自动化版本和CHANGELOG',
                        code: `# lerna.json
{
  "version": "1.0.0",
  "command": {
    "version": {
      "conventionalCommits": true,
      "changelogPreset": "angular",
      "message": "chore(release): publish %s"
    }
  }
}

# 发布流程：
npx lerna version --conventional-commits

# Lerna会：
# 1. 分析commit历史
# feat: 增加minor版本
# fix: 增加patch版本
# BREAKING CHANGE: 增加major版本

# 2. 生成CHANGELOG.md
# ## [1.1.0] - 2023-12-08
# ### Features
# - add debounce function (@my/utils)
#
# ### Bug Fixes
# - fix memory leak (@my/ui)

# 3. 创建commit和tag

# 完全自动化！`,
                        notes: 'Conventional Commits自动化版本'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Lerna vs Changesets',
            content: {
                description: 'Lerna和Changesets是两种主流的版本管理方案。',
                items: [
                    {
                        name: 'Lerna',
                        pros: [
                            '老牌：社区成熟',
                            '自动化：Conventional Commits',
                            'CHANGELOG：自动生成',
                            'CLI：命令行友好'
                        ],
                        cons: [
                            '性能：较慢',
                            '维护：更新缓慢',
                            '复杂：配置较多'
                        ]
                    },
                    {
                        name: 'Changesets',
                        pros: [
                            '现代：设计优秀',
                            'PR友好：changeset文件',
                            '灵活：手动控制',
                            '快速：性能好',
                            '推荐：新项目首选'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Lerna使用建议',
            content: {
                description: 'Lerna虽然不是最快的工具，但在版本管理方面仍有价值。',
                keyPoints: [
                    '仅用于版本管理：结合pnpm/Turborepo',
                    'Conventional Commits：自动化版本',
                    '考虑Changesets：新项目推荐',
                    'Fixed vs Independent：根据耦合度选择',
                    'CI集成：自动发布',
                    'CHANGELOG：提升发布透明度',
                    '逐步迁移：Lerna → Changesets',
                    '文档：说明发布流程',
                    '权限管理：npm组织和token',
                    '测试发布：先发布到私有registry'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第30章：Monorepo概念与实践',
            url: './render.html?subject=pkg-manager&type=content&chapter=30'
        },
        next: {
            title: '第32章：私有npm registry',
            url: './render.html?subject=pkg-manager&type=content&chapter=32'
        }
    }
};
