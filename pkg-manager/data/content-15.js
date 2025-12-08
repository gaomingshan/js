/**
 * 第15章：npm Workspaces
 * Workspaces配置、Monorepo管理、依赖提升、workspace命令
 */

window.content = {
    section: {
        title: '第15章：npm Workspaces',
        icon: '🏗️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Monorepo与Workspaces',
            content: {
                description: 'Monorepo（单仓库多包）是将多个相关项目放在同一个Git仓库中管理的模式，Workspaces是包管理器对Monorepo的原生支持。',
                keyPoints: [
                    'Monorepo：单个仓库包含多个包',
                    'Workspaces：npm/yarn/pnpm的Monorepo方案',
                    '统一管理：共享配置、工具、依赖',
                    '本地链接：自动link内部包',
                    '依赖提升：共享依赖安装到根目录',
                    '版本协调：统一管理包版本',
                    '适用场景：组件库、工具集、微服务'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/using-npm/workspaces'
            }
        },
        
        {
            type: 'principle',
            title: 'npm Workspaces工作原理',
            content: {
                description: 'npm Workspaces（npm 7+）通过在根package.json中配置workspaces字段，自动处理内部包的链接和依赖安装。',
                mechanism: 'npm install时，Workspaces将内部包通过符号链接相互连接，共享的依赖提升到根node_modules，每个workspace可以有独立的依赖。',
                keyPoints: [
                    'workspaces字段：指定workspace路径',
                    '符号链接：自动link内部包',
                    '依赖提升：hoisting到根目录',
                    '独立依赖：workspace特有依赖',
                    'workspace协议：引用内部包',
                    '命令执行：在workspace中运行命令'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '配置npm Workspaces',
            content: {
                description: '配置Workspaces的第一步是设置项目结构和根package.json。',
                examples: [
                    {
                        title: '基本Workspaces结构',
                        code: `# 项目结构
my-monorepo/
├── package.json          # 根package.json
├── package-lock.json
├── node_modules/
├── packages/
│   ├── utils/
│   │   ├── package.json  # @my/utils
│   │   └── src/
│   ├── ui/
│   │   ├── package.json  # @my/ui
│   │   └── src/
│   └── app/
│       ├── package.json  # @my/app
│       └── src/
└── apps/
    └── web/
        ├── package.json  # @my/web
        └── src/

# 根package.json
{
  "name": "my-monorepo",
  "private": true,  // 根包不发布
  "workspaces": [
    "packages/*",   // 匹配packages下所有包
    "apps/*"        // 匹配apps下所有包
  ]
}`,
                        notes: 'workspaces使用glob模式'
                    },
                    {
                        title: 'workspace包配置',
                        code: `// packages/utils/package.json
{
  "name": "@my/utils",
  "version": "1.0.0",
  "main": "./dist/index.js"
}

// packages/ui/package.json
{
  "name": "@my/ui",
  "version": "1.0.0",
  "dependencies": {
    "@my/utils": "^1.0.0"  // 引用workspace包
  }
}

// apps/web/package.json
{
  "name": "@my/web",
  "version": "1.0.0",
  "dependencies": {
    "@my/ui": "^1.0.0",     // 引用workspace包
    "@my/utils": "^1.0.0",
    "react": "^18.2.0"       // 外部依赖
  }
}`,
                        notes: 'workspace包可以相互引用'
                    },
                    {
                        title: '安装依赖',
                        code: `# 在根目录安装所有workspace的依赖
npm install

# npm会：
# 1. 读取所有workspace的package.json
# 2. 解析依赖关系
# 3. 提升共享依赖到根node_modules
# 4. 创建workspace包的符号链接
# 5. 安装特有依赖到各workspace

# 结果：
my-monorepo/
├── node_modules/
│   ├── @my/
│   │   ├── utils -> ../../packages/utils  # 符号链接
│   │   ├── ui -> ../../packages/ui
│   │   └── web -> ../../apps/web
│   └── react/  # 共享依赖提升到根目录
└── packages/
    └── utils/
        └── node_modules/  # workspace特有依赖（如果有）`,
                        notes: 'npm install自动处理workspace'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'workspace命令',
            content: {
                description: 'npm提供了-w参数在特定workspace中执行命令。',
                examples: [
                    {
                        title: '在workspace中运行命令',
                        code: `# 在特定workspace运行命令
npm run build -w @my/utils
npm run build --workspace=@my/utils

# 在多个workspace运行
npm run build -w @my/utils -w @my/ui

# 在所有workspace运行
npm run build --workspaces

# 只在包含build脚本的workspace运行
npm run build --workspaces --if-present

# 运行测试
npm test -w @my/utils`,
                        notes: '-w指定workspace名称'
                    },
                    {
                        title: '安装依赖到workspace',
                        code: `# 为特定workspace添加依赖
npm install lodash -w @my/utils

# 添加开发依赖
npm install -D typescript -w @my/utils

# 为所有workspace添加依赖
npm install lodash --workspaces

# 为根目录添加依赖
npm install eslint -w root
# 或
cd my-monorepo && npm install eslint`,
                        notes: '可以为单个或所有workspace添加依赖'
                    },
                    {
                        title: '其他workspace命令',
                        code: `# 列出所有workspace
npm ls --workspaces

# 查看workspace信息
npm exec -w @my/utils -- npm version

# 发布所有workspace包
npm publish --workspaces --access public

# 在workspace中执行任意命令
npm exec -w @my/utils -- ls -la`,
                        notes: 'npm exec在workspace中执行命令'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖提升（Hoisting）',
            content: {
                description: 'Workspaces会将多个包共享的依赖提升到根node_modules，减少重复安装，节省空间。',
                mechanism: 'npm分析所有workspace的依赖，将版本兼容的依赖提升到根目录，不兼容的版本保留在各workspace的node_modules。',
                keyPoints: [
                    '自动提升：npm自动处理',
                    '版本兼容：兼容的版本提升',
                    '冲突处理：不兼容版本各自安装',
                    '幽灵依赖：提升可能导致隐式依赖',
                    'nohoist：禁止提升特定依赖',
                    'pnpm优势：pnpm避免幽灵依赖'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '依赖提升示例',
            content: {
                description: '理解依赖提升的行为有助于解决workspace问题。',
                examples: [
                    {
                        title: '提升行为',
                        code: `// 场景：多个workspace依赖react

// packages/ui/package.json
{
  "dependencies": {
    "react": "^18.2.0"
  }
}

// packages/form/package.json
{
  "dependencies": {
    "react": "^18.2.0"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "react": "^18.2.0"
  }
}

// npm install后：
my-monorepo/
├── node_modules/
│   └── react@18.2.0  ← 提升到根目录（只安装一次）
├── packages/
│   ├── ui/
│   │   └── node_modules/  ← 空（没有特有依赖）
│   └── form/
│       └── node_modules/  ← 空
└── apps/
    └── web/
        └── node_modules/  ← 空`,
                        notes: '兼容版本的依赖只安装一次'
                    },
                    {
                        title: '版本冲突处理',
                        code: `// 场景：不同版本的依赖

// packages/ui/package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// packages/legacy/package.json
{
  "dependencies": {
    "lodash": "^3.10.0"  // 旧版本
  }
}

// npm install后：
my-monorepo/
├── node_modules/
│   └── lodash@4.17.21  ← 提升新版本
└── packages/
    └── legacy/
        └── node_modules/
            └── lodash@3.10.0  ← 旧版本保留在这里`,
                        notes: '不兼容版本各自安装'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'npm vs yarn vs pnpm Workspaces',
            content: {
                description: '三大包管理器都支持Workspaces，但实现和特性有差异。',
                items: [
                    {
                        name: 'npm Workspaces',
                        pros: [
                            '官方支持：npm 7+原生',
                            '无需额外工具',
                            '配置简单',
                            '广泛兼容'
                        ],
                        cons: [
                            '功能相对简单',
                            '幽灵依赖问题',
                            '性能一般',
                            '缺少高级功能'
                        ]
                    },
                    {
                        name: 'Yarn Workspaces',
                        pros: [
                            '成熟稳定',
                            'workspace:协议',
                            '性能较好',
                            'nohoist支持'
                        ],
                        cons: [
                            '需要安装yarn',
                            'yarn 1 vs yarn 3差异大',
                            '学习成本'
                        ]
                    },
                    {
                        name: 'pnpm Workspaces',
                        pros: [
                            '性能最佳',
                            '严格依赖：无幽灵依赖',
                            '节省磁盘空间',
                            '功能强大（filter等）',
                            '硬链接机制'
                        ],
                        cons: [
                            '需要安装pnpm',
                            '某些工具兼容性问题',
                            '学习曲线'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Monorepo工作流',
            content: {
                description: 'Workspaces的典型开发工作流和常见任务。',
                examples: [
                    {
                        title: '根package.json脚本',
                        code: `// 根package.json
{
  "scripts": {
    // 构建所有包
    "build": "npm run build --workspaces --if-present",
    
    // 测试所有包
    "test": "npm run test --workspaces --if-present",
    
    // 代码检查
    "lint": "npm run lint --workspaces --if-present",
    
    // 清理
    "clean": "npm run clean --workspaces --if-present",
    
    // 版本管理（使用lerna或changesets）
    "version": "changeset version",
    "release": "npm run build && changeset publish",
    
    // 开发
    "dev:utils": "npm run dev -w @my/utils",
    "dev:ui": "npm run dev -w @my/ui",
    "dev:app": "npm run dev -w @my/app"
  }
}`,
                        notes: '根目录统一管理常用任务'
                    },
                    {
                        title: '依赖更新策略',
                        code: `# 1. 更新所有workspace的依赖
npm update --workspaces

# 2. 更新特定workspace
npm update -w @my/utils

# 3. 更新根依赖
npm update

# 4. 检查过时依赖
npm outdated --workspaces

# 5. 使用npm-check-updates（推荐）
npx npm-check-updates -u --deep  # 更新所有workspace`,
                        notes: '定期更新保持依赖最新'
                    },
                    {
                        title: '发布流程',
                        code: `# 使用changesets管理版本（推荐）

# 1. 安装changesets
npm install -D @changesets/cli
npx changeset init

# 2. 开发完成后创建changeset
npx changeset
# 选择要发布的包和版本类型

# 3. 更新版本
npx changeset version
# 自动更新package.json和CHANGELOG

# 4. 构建
npm run build

# 5. 发布
npx changeset publish
# 自动发布所有更新的包

# package.json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "npm run build && changeset publish"
  }
}`,
                        notes: 'changesets是Monorepo版本管理标准'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Workspaces的挑战',
            content: {
                description: 'Workspaces虽然强大，但也带来一些挑战和需要注意的问题。',
                mechanism: 'Monorepo规模变大时，依赖管理、构建速度、版本协调等问题会变得复杂，需要额外工具和策略。',
                keyPoints: [
                    '幽灵依赖：未声明的依赖可用',
                    '构建顺序：需要处理依赖顺序',
                    '循环依赖：workspace间循环引用',
                    'CI/CD：需要增量构建',
                    '版本管理：多包版本协调复杂',
                    '代码共享：过度共享导致耦合'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '解决常见问题',
            content: {
                description: 'Workspaces开发中常见问题的解决方案。',
                examples: [
                    {
                        title: '处理构建顺序',
                        code: `// 场景：@my/ui依赖@my/utils，必须先构建utils

// 方案1：手动指定顺序
{
  "scripts": {
    "build": "npm run build -w @my/utils && npm run build -w @my/ui"
  }
}

// 方案2：使用lerna（自动处理依赖顺序）
npm install -D lerna

// lerna.json
{
  "version": "independent",
  "npmClient": "npm",
  "useWorkspaces": true
}

// package.json
{
  "scripts": {
    "build": "lerna run build --stream"
  }
}

// 方案3：使用Nx（更强大）
npm install -D nx
{
  "scripts": {
    "build": "nx run-many --target=build --all"
  }
}`,
                        notes: 'lerna或Nx可以自动处理构建顺序'
                    },
                    {
                        title: '避免幽灵依赖',
                        code: `// 问题：@my/ui没有声明react依赖，但能用（因为提升）

// packages/ui/src/Button.tsx
import React from 'react';  // 能用，但没在package.json中声明

// 解决方案1：明确声明所有依赖
// packages/ui/package.json
{
  "dependencies": {
    "react": "^18.2.0"  // 明确声明
  }
}

// 解决方案2：使用pnpm（严格模式）
// pnpm不提升依赖，避免幽灵依赖

// 解决方案3：使用dependency-cruiser检测
npm install -D dependency-cruiser
npx depcruise --validate .dependency-cruiser.js src`,
                        notes: '明确声明依赖，使用工具检测'
                    },
                    {
                        title: '增量构建（CI）',
                        code: `# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史
      
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      # 使用Nx增量构建
      - name: Build affected
        run: npx nx affected --target=build --base=origin/main
      
      # 只测试受影响的包
      - name: Test affected
        run: npx nx affected --target=test --base=origin/main`,
                        notes: 'Nx可以只构建/测试变更的包'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Workspaces最佳实践',
            content: {
                description: '合理使用Workspaces可以大幅提升Monorepo项目的开发效率。',
                keyPoints: [
                    '统一配置：共享ESLint、TypeScript、Prettier配置',
                    '明确依赖：所有依赖都要在package.json中声明',
                    '版本管理：使用changesets或lerna管理版本',
                    '构建工具：使用Nx或Turborepo优化构建',
                    '代码共享：合理抽象，避免过度耦合',
                    '文档完善：README说明workspace结构',
                    'CI优化：增量构建和测试',
                    '根目录private：根package.json设为private'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第14章：npm安全',
            url: './render.html?subject=pkg-manager&type=content&chapter=14'
        },
        next: {
            title: '第16章：Yarn简介与特性',
            url: './render.html?subject=pkg-manager&type=content&chapter=16'
        }
    }
};
