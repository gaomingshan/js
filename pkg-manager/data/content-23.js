/**
 * 第23章：pnpm Workspaces
 * pnpm-workspace.yaml、workspace协议、过滤器
 */

window.content = {
    section: {
        title: '第23章：pnpm Workspaces',
        icon: '🏗️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'pnpm Workspaces特点',
            content: {
                description: 'pnpm Workspaces结合了pnpm的性能优势和Monorepo的管理能力，是目前最快、最省空间的Monorepo方案。',
                keyPoints: [
                    '性能最佳：硬链接 + 符号链接',
                    '空间最省：全局store共享',
                    '严格依赖：每个workspace严格隔离',
                    '过滤器：强大的选择性执行',
                    'workspace协议：引用内部包',
                    '配置文件：pnpm-workspace.yaml',
                    '完全兼容：npm/yarn无缝迁移'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm Workspaces配置',
            content: {
                description: 'pnpm通过pnpm-workspace.yaml配置workspaces。',
                examples: [
                    {
                        title: '基本配置',
                        code: `# 项目结构
my-monorepo/
├── pnpm-workspace.yaml  ← workspace配置
├── package.json
├── pnpm-lock.yaml
├── packages/
│   ├── utils/
│   │   └── package.json
│   ├── ui/
│   │   └── package.json
│   └── app/
│       └── package.json

# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  # 排除某些目录
  - '!**/test/**'

# 根package.json
{
  "name": "my-monorepo",
  "private": true
}`,
                        notes: 'pnpm-workspace.yaml是必需的'
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
    "@my/utils": "workspace:*"  // workspace协议
  }
}

// apps/web/package.json
{
  "name": "@my/web",
  "version": "1.0.0",
  "dependencies": {
    "@my/ui": "workspace:*",
    "@my/utils": "workspace:*",
    "react": "^18.2.0"  // 外部依赖
  }
}`,
                        notes: 'workspace:*引用内部包'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'workspace协议详解',
            content: {
                description: 'pnpm的workspace:协议明确标识内部依赖，支持版本约束和别名。',
                mechanism: 'workspace:协议告诉pnpm该依赖来自workspace，安装时创建符号链接，发布时自动替换为实际版本号或范围。',
                keyPoints: [
                    'workspace:*：任意版本',
                    'workspace:^：兼容版本（推荐）',
                    'workspace:~：近似版本',
                    'workspace:具体版本：固定版本',
                    '发布替换：自动转换',
                    '别名支持：workspace:alias@^',
                    '语义化：明确内外部依赖'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'workspace协议使用',
            content: {
                description: 'workspace:协议的各种用法和发布时的转换规则。',
                examples: [
                    {
                        title: 'workspace协议变体',
                        code: `// package.json
{
  "name": "@my/app",
  "dependencies": {
    // 推荐：workspace:^ （发布时转为^x.x.x）
    "@my/utils": "workspace:^",
    
    // 任意版本（发布时转为x.x.x）
    "@my/core": "workspace:*",
    
    // 近似版本（发布时转为~x.x.x）
    "@my/types": "workspace:~",
    
    // 固定版本（发布时转为x.x.x）
    "@my/config": "workspace:1.0.0",
    
    // 别名
    "my-utils": "workspace:@my/utils@^"
  }
}

// 发布时自动转换：
{
  "dependencies": {
    "@my/utils": "^1.0.0",
    "@my/core": "1.0.0",
    "@my/types": "~1.0.0",
    "@my/config": "1.0.0",
    "my-utils": "npm:@my/utils@^1.0.0"
  }
}`,
                        notes: 'workspace:^最常用'
                    },
                    {
                        title: '安装workspace依赖',
                        code: `# 安装所有workspace的依赖
pnpm install

# 为特定workspace添加依赖
pnpm add lodash --filter @my/utils
pnpm add -D typescript --filter @my/ui

# 添加workspace依赖
pnpm add @my/utils --filter @my/app --workspace

# 为所有workspace添加相同依赖
pnpm add lodash -r
# -r, --recursive: 所有workspace

# 为根添加依赖
pnpm add -D eslint -w
# -w, --workspace-root: 根package.json`,
                        notes: '--filter指定workspace'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '过滤器（Filtering）',
            content: {
                description: 'pnpm的过滤器系统非常强大，允许精确选择要操作的workspaces。',
                mechanism: '--filter参数支持包名、路径、依赖关系等多种选择器，可以组合使用，实现复杂的选择逻辑。',
                keyPoints: [
                    '包名匹配：--filter @my/ui',
                    '通配符：--filter "@my/*"',
                    '路径匹配：--filter ./packages/ui',
                    '依赖关系：--filter ...@my/ui',
                    '变更检测：--filter "[HEAD^1]"',
                    '组合使用：多个--filter',
                    '否定：--filter "!@my/test"'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '过滤器详解',
            content: {
                description: '过滤器让你精确控制要操作的workspaces。',
                examples: [
                    {
                        title: '基本过滤器',
                        code: `# 1. 按包名过滤
pnpm build --filter @my/ui

# 2. 通配符
pnpm test --filter "@my/*"  # 所有@my作用域的包
pnpm test --filter "*-utils" # 所有以-utils结尾的包

# 3. 按路径过滤
pnpm build --filter ./packages/ui
pnpm build --filter "./packages/**"  # packages下所有

# 4. 多个过滤器（OR关系）
pnpm test --filter @my/ui --filter @my/utils

# 5. 排除
pnpm test --filter "!@my/test-*"  # 排除test开头的包`,
                        notes: '过滤器支持多种模式'
                    },
                    {
                        title: '依赖关系过滤',
                        code: `# 场景：@my/app依赖@my/ui，@my/ui依赖@my/utils
# 依赖图：@my/utils → @my/ui → @my/app

# 1. 包及其依赖（dependencies）
pnpm build --filter ...@my/app
# 构建：@my/utils, @my/ui, @my/app

# 2. 包及其依赖者（dependents）
pnpm test --filter @my/utils...
# 测试：@my/utils, @my/ui, @my/app

# 3. 包的依赖（不含自己）
pnpm build --filter ...@my/app^
# 构建：@my/utils, @my/ui（不含@my/app）

# 4. 包的依赖者（不含自己）
pnpm test --filter @my/utils...^
# 测试：@my/ui, @my/app（不含@my/utils）

# 5. 仅直接依赖
pnpm build --filter @my/app^
# 构建：@my/ui（@my/app的直接依赖）

# 6. 仅直接依赖者
pnpm test --filter @my/utils^...
# 测试：@my/ui（@my/utils的直接依赖者）`,
                        notes: '...表示依赖关系'
                    },
                    {
                        title: '变更检测过滤',
                        code: `# 基于Git变更的过滤

# 1. 自上次commit变更的包
pnpm test --filter "[HEAD^1]"

# 2. 自特定commit变更的包
pnpm build --filter "[abc123]"

# 3. 自特定分支变更的包
pnpm test --filter "[origin/main]"

# 4. 变更的包及其依赖者
pnpm build --filter "...[origin/main]"

# 5. 变更的包及其依赖
pnpm test --filter "[origin/main]..."

# 场景：CI中只测试变更的包
pnpm test --filter "...[origin/main]"`,
                        notes: '变更检测用于CI优化'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm Workspaces命令',
            content: {
                description: 'pnpm提供-r/--recursive标志在所有workspaces执行命令。',
                examples: [
                    {
                        title: '批量执行命令',
                        code: `# 在所有workspace运行命令
pnpm run build -r
pnpm -r run build  # 等价

# 在所有workspace运行test
pnpm test -r

# 在所有workspace添加依赖
pnpm add lodash -r

# 递归安装（默认行为）
pnpm install

# 列出所有workspace
pnpm ls -r --depth 0`,
                        notes: '-r在所有workspace执行'
                    },
                    {
                        title: '结合过滤器',
                        code: `# 为特定workspace添加依赖
pnpm add axios --filter @my/app

# 构建特定包及其依赖
pnpm build --filter ...@my/app

# 测试变更的包
pnpm test --filter "[origin/main]..."

# 并行执行（默认并行）
pnpm build -r

# 串行执行（按拓扑顺序）
pnpm build -r --workspace-concurrency=1

# 流式输出
pnpm build -r --stream`,
                        notes: '过滤器与-r结合使用'
                    },
                    {
                        title: '根package.json脚本',
                        code: `// package.json
{
  "scripts": {
    // 构建所有
    "build": "pnpm -r run build",
    
    // 测试所有
    "test": "pnpm -r run test",
    
    // 代码检查
    "lint": "pnpm -r run lint",
    
    // 清理
    "clean": "pnpm -r run clean",
    
    // 并行开发
    "dev": "pnpm -r --parallel run dev",
    
    // 单个workspace快捷方式
    "dev:ui": "pnpm --filter @my/ui dev",
    "dev:app": "pnpm --filter @my/app dev",
    
    // 基于变更
    "test:changed": "pnpm --filter '[HEAD^1]...' test"
  }
}`,
                        notes: '根目录统一管理任务'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'pnpm vs npm vs Yarn Workspaces对比',
            content: {
                description: '三大工具的Workspaces实现各有特点。',
                items: [
                    {
                        name: 'pnpm Workspaces',
                        pros: [
                            '性能：最快',
                            '空间：最省（硬链接）',
                            '过滤器：最强大',
                            '严格依赖：是',
                            'workspace:协议：是',
                            '变更检测：内置',
                            '并行执行：默认'
                        ]
                    },
                    {
                        name: 'Yarn Workspaces',
                        pros: [
                            '成熟：时间最长',
                            'workspace:协议：是',
                            'nohoist：精细控制',
                            'Berry增强：插件系统'
                        ],
                        cons: [
                            '性能：一般',
                            '过滤器：较弱'
                        ]
                    },
                    {
                        name: 'npm Workspaces',
                        pros: [
                            '官方：无需额外安装',
                            '简单：配置简单'
                        ],
                        cons: [
                            '性能：最慢',
                            '功能：最少',
                            '无过滤器：需额外脚本'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Workspaces实战技巧',
            content: {
                description: 'pnpm Workspaces的高级用法和最佳实践。',
                examples: [
                    {
                        title: '共享配置',
                        code: `# 项目结构
my-monorepo/
├── tsconfig.base.json  ← 共享TS配置
├── .eslintrc.js        ← 共享ESLint配置
├── packages/
│   ├── utils/
│   │   ├── tsconfig.json  ← 继承base
│   │   └── src/
│   └── ui/
│       ├── tsconfig.json
│       └── src/

// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "paths": {
      "@my/*": ["packages/*/src"]
    }
  }
}

// packages/utils/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}

// .eslintrc.js
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  // 所有workspace共享
};`,
                        notes: '根目录统一配置'
                    },
                    {
                        title: 'CI优化',
                        code: `# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      # 只测试变更的包及其依赖者
      - name: Test changed packages
        run: pnpm test --filter "...[origin/main]"
      
      # 只构建变更的包
      - name: Build changed packages
        run: pnpm build --filter "[origin/main]..."`,
                        notes: '过滤器大幅优化CI时间'
                    },
                    {
                        title: '版本管理',
                        code: `# 使用changesets管理版本

# 1. 安装changesets
pnpm add -Dw @changesets/cli
pnpm changeset init

# 2. 创建changeset
pnpm changeset
# 选择要发布的包和版本类型

# 3. 版本更新
pnpm changeset version
# 自动更新版本号和CHANGELOG

# 4. 发布
pnpm changeset publish

# package.json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build -r && changeset publish"
  }
}`,
                        notes: 'changesets是Monorepo版本管理标准'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'pnpm Workspaces最佳实践',
            content: {
                description: 'pnpm Workspaces的最佳实践确保项目高效运行。',
                keyPoints: [
                    'workspace:^：使用workspace:^引用内部包',
                    'pnpm-workspace.yaml：必须配置',
                    '过滤器：充分利用--filter',
                    'CI优化：只测试/构建变更的包',
                    '共享配置：TS、ESLint等统一配置',
                    '版本管理：使用changesets',
                    '并行执行：默认并行，注意资源',
                    '严格依赖：不开启shamefully-hoist',
                    '根目录scripts：统一任务入口',
                    'Monorepo首选：pnpm性能最佳'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第22章：pnpm基础使用',
            url: './render.html?subject=pkg-manager&type=content&chapter=22'
        },
        next: {
            title: '第24章：pnpm高级特性',
            url: './render.html?subject=pkg-manager&type=content&chapter=24'
        }
    }
};
