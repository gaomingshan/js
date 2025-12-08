/**
 * 第30章：Monorepo概念与实践
 * Monorepo vs Multirepo、工具选型、包拆分原则
 */

window.content = {
    section: {
        title: '第30章：Monorepo概念与实践',
        icon: '🏗️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Monorepo定义',
            content: {
                description: 'Monorepo（单体仓库）是将多个相关项目/包放在同一个Git仓库中管理的开发策略，与传统的Multirepo（多仓库）形成对比。',
                keyPoints: [
                    '单一仓库：所有项目在一个repo',
                    '代码共享：轻松共享代码和依赖',
                    '统一工具链：一套构建/测试/发布',
                    '原子提交：跨项目修改一次提交',
                    '依赖管理：内部依赖明确',
                    '大厂实践：Google/Facebook/Microsoft',
                    '适用场景：相关联的多个包/应用'
                ],
                mdn: 'https://monorepo.tools/'
            }
        },
        
        {
            type: 'comparison',
            title: 'Monorepo vs Multirepo',
            content: {
                description: 'Monorepo和Multirepo各有优劣，需要根据团队和项目特点选择。',
                items: [
                    {
                        name: 'Monorepo（单仓库）',
                        pros: [
                            '代码共享：组件/工具复用容易',
                            '统一标准：eslint/prettier/tsconfig',
                            '原子提交：跨包修改一次性',
                            '依赖管理：版本统一，避免冲突',
                            '重构友好：跨包重构一气呵成',
                            '可见性：所有代码可见',
                            'CI统一：一套流程'
                        ],
                        cons: [
                            '仓库大：克隆和checkout慢',
                            '权限粗：难以细粒度控制',
                            '学习曲线：工具链复杂',
                            'CI慢：需要智能缓存',
                            '工具要求：需要Monorepo工具'
                        ]
                    },
                    {
                        name: 'Multirepo（多仓库）',
                        pros: [
                            '独立性：每个项目完全独立',
                            '权限细：仓库级别控制',
                            '简单：无需特殊工具',
                            '小而快：单个仓库小',
                            'CI快：只构建当前项目'
                        ],
                        cons: [
                            '代码重复：难以共享代码',
                            '版本割裂：依赖版本不一致',
                            '跨仓修改：需要多个PR',
                            '工具分散：每个仓库独立配置',
                            '依赖复杂：npm link或发布测试版'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Monorepo结构示例',
            content: {
                description: '典型的Monorepo项目结构。',
                examples: [
                    {
                        title: '基础Monorepo结构',
                        code: `# 典型Monorepo结构
my-monorepo/
├── packages/               # 库和工具包
│   ├── utils/             # 通用工具库
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui-components/     # UI组件库
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   └── types/             # 共享类型定义
│       ├── index.d.ts
│       └── package.json
│
├── apps/                  # 应用
│   ├── web/              # Web应用
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── mobile/           # 移动应用
│   │   └── package.json
│   └── admin/            # 管理后台
│       └── package.json
│
├── tools/                 # 构建工具和脚本
│   ├── eslint-config/    # 共享ESLint配置
│   ├── tsconfig/         # 共享TS配置
│   └── scripts/          # 构建脚本
│
├── docs/                  # 文档
│
├── package.json           # 根package.json
├── pnpm-workspace.yaml    # Workspace配置
├── tsconfig.base.json     # 基础TS配置
├── .eslintrc.js          # ESLint配置
├── .prettierrc           # Prettier配置
└── turbo.json            # Turborepo配置（可选）`,
                        notes: 'packages存放库，apps存放应用'
                    },
                    {
                        title: '根package.json',
                        code: `// package.json
{
  "name": "my-monorepo",
  "version": "0.0.0",
  "private": true,  // 根包不发布
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    // 全局命令
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    
    // 特定workspace
    "dev:web": "pnpm --filter web dev",
    "dev:ui": "pnpm --filter ui-components dev",
    
    // 工具
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.10.0"
}`,
                        notes: '根包协调所有workspace'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Monorepo工具选型',
            content: {
                description: 'Monorepo需要专门的工具来管理依赖、构建、测试和发布，不同工具适合不同场景。',
                mechanism: 'Monorepo工具提供workspace管理、任务编排、增量构建、缓存、依赖图分析等功能，显著提升大型项目的开发效率。',
                keyPoints: [
                    '包管理器：pnpm/Yarn/npm Workspaces',
                    '任务编排：Turborepo/Nx',
                    '版本管理：Changesets/Lerna',
                    '构建工具：Vite/Webpack/esbuild',
                    'CI/CD：增量构建和测试',
                    '代码生成：Nx generators',
                    '依赖图：可视化分析'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Monorepo工具对比',
            content: {
                description: '主流Monorepo工具的特点和适用场景。',
                items: [
                    {
                        name: 'pnpm Workspaces',
                        pros: [
                            '包管理：最快、最省空间',
                            '过滤器：强大的--filter',
                            '严格依赖：无幽灵依赖',
                            '简单：内置workspace支持',
                            '推荐：新项目首选'
                        ]
                    },
                    {
                        name: 'Turborepo',
                        pros: [
                            '任务编排：智能并行',
                            '远程缓存：云端缓存',
                            '增量构建：只构建变更',
                            '简单配置：turbo.json',
                            '适合：构建密集型项目'
                        ]
                    },
                    {
                        name: 'Nx',
                        pros: [
                            '功能最强：完整工具链',
                            '代码生成：generators',
                            '依赖图：可视化',
                            '插件生态：丰富',
                            '适合：大型企业项目'
                        ],
                        cons: [
                            '复杂：学习曲线陡'
                        ]
                    },
                    {
                        name: 'Lerna',
                        pros: [
                            '老牌：社区成熟',
                            '版本管理：强大',
                            '发布：npm发布流程'
                        ],
                        cons: [
                            '性能：较慢',
                            '维护：更新缓慢'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm Workspaces配置',
            content: {
                description: 'pnpm是Monorepo的最佳选择，性能和功能兼具。',
                examples: [
                    {
                        title: 'pnpm-workspace.yaml',
                        code: `# pnpm-workspace.yaml
packages:
  # 所有packages目录下的包
  - 'packages/*'
  
  # 所有apps目录下的应用
  - 'apps/*'
  
  # 排除测试目录
  - '!**/test/**'
  - '!**/__tests__/**'

# 注意：
# 1. 路径相对于根目录
# 2. 支持glob模式
# 3. !表示排除`,
                        notes: 'pnpm-workspace.yaml是必需的'
                    },
                    {
                        title: 'workspace依赖关系',
                        code: `// packages/utils/package.json
{
  "name": "@my/utils",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}

// packages/ui-components/package.json
{
  "name": "@my/ui",
  "version": "1.0.0",
  "dependencies": {
    "@my/utils": "workspace:^"  // 引用workspace
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}

// apps/web/package.json
{
  "name": "@my/web",
  "version": "1.0.0",
  "dependencies": {
    "@my/ui": "workspace:*",
    "@my/utils": "workspace:*",
    "react": "^18.2.0"
  }
}

# 安装
pnpm install

# 依赖关系：
# @my/web → @my/ui → @my/utils
#         ↘ @my/utils

# workspace:协议：
# - workspace:* : 任意版本
# - workspace:^ : 兼容版本（推荐）
# - workspace:~ : 近似版本`,
                        notes: 'workspace:明确内部依赖'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '包拆分原则',
            content: {
                description: 'Monorepo中如何拆分包是关键决策，需要平衡复用性、维护性和复杂度。',
                mechanism: '按功能、领域或技术栈拆分包，保持单一职责，明确依赖关系，避免循环依赖。',
                keyPoints: [
                    '单一职责：每个包专注一件事',
                    '领域驱动：按业务领域拆分',
                    '技术分层：utils/types/ui/api',
                    '复用优先：被多处使用的提取',
                    '避免循环：依赖单向流动',
                    '粒度适中：不要过度拆分',
                    '独立发布：可以独立npm发布'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '包拆分实践',
            content: {
                description: '实际项目中的包拆分策略。',
                examples: [
                    {
                        title: '按技术层次拆分',
                        code: `# 技术层次拆分
packages/
├── types/              # 共享类型定义
│   ├── src/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── index.ts
│   └── package.json
│
├── constants/          # 常量和配置
│   ├── src/
│   │   ├── api.ts
│   │   └── config.ts
│   └── package.json
│
├── utils/             # 工具函数
│   ├── src/
│   │   ├── string.ts
│   │   ├── date.ts
│   │   └── index.ts
│   └── package.json
│
├── api-client/        # API客户端
│   ├── src/
│   │   ├── user.api.ts
│   │   └── product.api.ts
│   └── package.json
│
└── ui-components/     # UI组件
    ├── src/
    │   ├── Button/
    │   ├── Input/
    │   └── index.ts
    └── package.json

# 依赖关系：
# ui-components → utils, types
# api-client → constants, types
# 应用 → ui-components, api-client`,
                        notes: '清晰的技术分层'
                    },
                    {
                        title: '按业务领域拆分',
                        code: `# 业务领域拆分（DDD）
packages/
├── shared/            # 共享代码
│   ├── types/
│   └── utils/
│
├── user/             # 用户领域
│   ├── src/
│   │   ├── models/
│   │   ├── services/
│   │   └── components/
│   └── package.json
│
├── product/          # 产品领域
│   ├── src/
│   │   ├── models/
│   │   ├── services/
│   │   └── components/
│   └── package.json
│
└── order/            # 订单领域
    ├── src/
    │   ├── models/
    │   ├── services/
    │   └── components/
    └── package.json

# 优点：
# - 领域内聚
# - 团队责任清晰
# - 独立演进

# 缺点：
# - 可能有跨领域依赖
# - 共享代码管理`,
                        notes: 'DDD风格拆分'
                    },
                    {
                        title: '避免循环依赖',
                        code: `# ❌ 错误：循环依赖
packages/
├── package-a/
│   └── dependencies:
│       └── @my/package-b  ← 依赖B
└── package-b/
    └── dependencies:
        └── @my/package-a  ← 依赖A（循环！）

# 问题：
# 1. 构建顺序不确定
# 2. 可能导致运行时错误
# 3. 难以理解和维护

# ✅ 正确：提取共享依赖
packages/
├── shared/           # 共享代码
│   └── package.json
├── package-a/
│   └── dependencies:
│       └── @my/shared  ← 依赖shared
└── package-b/
    └── dependencies:
        └── @my/shared  ← 依赖shared

# 依赖图：
# package-a → shared
# package-b → shared
# 单向依赖，清晰明确`,
                        notes: '单向依赖是关键'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Monorepo最佳实践',
            content: {
                description: '成功实施Monorepo的关键实践。',
                keyPoints: [
                    '选对工具：pnpm + Turborepo/Nx',
                    '清晰结构：packages/apps分离',
                    '统一配置：共享ESLint/TS配置',
                    'workspace:协议：明确内部依赖',
                    '版本管理：使用Changesets',
                    'CI优化：增量构建和测试',
                    '避免循环：依赖单向流动',
                    '文档完善：README和架构图',
                    '代码审查：注意跨包修改',
                    '渐进迁移：逐步从Multirepo转换'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第29章：幽灵依赖与依赖提升',
            url: './render.html?subject=pkg-manager&type=content&chapter=29'
        },
        next: {
            title: '第31章：Lerna与Monorepo管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=31'
        }
    }
};
