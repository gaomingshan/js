/**
 * 第18章：Yarn Workspaces
 * Workspaces配置、依赖提升、nohoist、批量操作
 */

window.content = {
    section: {
        title: '第18章：Yarn Workspaces',
        icon: '🏗️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Yarn Workspaces优势',
            content: {
                description: 'Yarn Workspaces是Yarn对Monorepo的原生支持，比npm Workspaces更早、功能更丰富。',
                keyPoints: [
                    '早期支持：Yarn 1.0就支持，npm 7才支持',
                    '成熟稳定：经过多年实战验证',
                    'nohoist：精细控制依赖提升',
                    'workspace协议：引用内部包',
                    '批量操作：workspaces run',
                    '版本管理：与lerna配合使用',
                    'Berry增强：Yarn 2+更强大'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn Workspaces配置',
            content: {
                description: 'Yarn Workspaces通过package.json的workspaces字段配置。',
                examples: [
                    {
                        title: '基本配置',
                        code: `# 项目结构
my-monorepo/
├── package.json
├── yarn.lock
├── packages/
│   ├── utils/
│   │   └── package.json
│   ├── ui/
│   │   └── package.json
│   └── app/
│       └── package.json

// 根package.json
{
  "name": "my-monorepo",
  "private": true,  // 必须为true
  "workspaces": [
    "packages/*"
  ]
}

// packages/utils/package.json
{
  "name": "@my/utils",
  "version": "1.0.0"
}

// packages/ui/package.json
{
  "name": "@my/ui",
  "version": "1.0.0",
  "dependencies": {
    "@my/utils": "1.0.0"
  }
}`,
                        notes: '根package.json必须设置private: true'
                    },
                    {
                        title: '高级配置',
                        code: `// package.json
{
  "private": true,
  "workspaces": {
    "packages": [
      "packages/*",
      "apps/*",
      "tools/cli"  // 单个包
    ],
    // nohoist配置（防止某些包被提升）
    "nohoist": [
      "**/react-native",
      "**/react-native/**",
      "**/@types/**"
    ]
  }
}

// 或简写（无nohoist）
{
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}`,
                        notes: 'workspaces可以是数组或对象'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'workspace协议',
            content: {
                description: 'Yarn提供workspace:协议来引用内部包，支持版本别名和通配符。',
                mechanism: 'workspace:协议告诉Yarn该依赖来自workspace内部，安装时创建符号链接，发布时自动替换为实际版本号。',
                keyPoints: [
                    'workspace:*：任意版本',
                    'workspace:^：兼容版本',
                    'workspace:~：近似版本',
                    '发布替换：自动转为实际版本',
                    '别名：workspace:alias@*',
                    'Berry专属：Yarn 1部分支持'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'workspace协议使用',
            content: {
                description: 'workspace:协议明确标识内部依赖，更加语义化。',
                examples: [
                    {
                        title: 'workspace协议示例',
                        code: `// packages/ui/package.json
{
  "name": "@my/ui",
  "version": "1.0.0",
  "dependencies": {
    // 传统方式（Yarn 1）
    "@my/utils": "1.0.0",
    
    // workspace协议（推荐，Yarn 2+）
    "@my/utils": "workspace:*",  // 任意版本
    "@my/core": "workspace:^",   // ^当前版本
    "@my/types": "workspace:~"   // ~当前版本
  }
}

// 发布时自动转换：
// "dependencies": {
//   "@my/utils": "1.0.0",
//   "@my/core": "^1.0.0",
//   "@my/types": "~1.0.0"
// }`,
                        notes: '发布时workspace:会被替换'
                    },
                    {
                        title: 'workspace别名',
                        code: `// 场景：引用不同版本的同一个包

// package.json
{
  "dependencies": {
    "lodash": "^4.17.21",
    "lodash-legacy": "npm:lodash@^3.10.0",
    
    // workspace别名
    "my-utils": "workspace:@my/utils@*",
    "utils-v2": "workspace:@my/utils-v2@*"
  }
}`,
                        notes: 'workspace别名解决版本冲突'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn Workspaces命令',
            content: {
                description: 'Yarn提供专门的命令来操作workspaces。',
                examples: [
                    {
                        title: '基本workspace命令',
                        code: `# 安装所有workspaces的依赖
yarn install
# 或简写
yarn

# 列出所有workspaces
yarn workspaces info

# 输出示例：
# {
#   "@my/utils": {
#     "location": "packages/utils",
#     "workspaceDependencies": [],
#     "mismatchedWorkspaceDependencies": []
#   },
#   "@my/ui": {
#     "location": "packages/ui",
#     "workspaceDependencies": ["@my/utils"],
#     "mismatchedWorkspaceDependencies": []
#   }
# }`,
                        notes: 'workspaces info显示依赖关系'
                    },
                    {
                        title: '在workspace中执行命令',
                        code: `# 在特定workspace运行命令
yarn workspace @my/utils add lodash
yarn workspace @my/utils build
yarn workspace @my/ui test

# 在所有workspaces运行命令
yarn workspaces run build
yarn workspaces run test

# 并行执行（Berry）
yarn workspaces foreach run build
yarn workspaces foreach -p run build  # 并行

# 只在包含该脚本的workspace运行
yarn workspaces foreach --include '@my/*' run build`,
                        notes: 'workspace单数，指定；workspaces复数，全部'
                    },
                    {
                        title: '为workspace添加依赖',
                        code: `# 为特定workspace添加依赖
yarn workspace @my/utils add lodash
yarn workspace @my/utils add -D typescript

# 为多个workspace添加相同依赖
yarn workspaces run add lodash

# 为根添加依赖（开发工具）
yarn add -D -W eslint
# -W, --ignore-workspace-root-check 允许给根添加依赖`,
                        notes: '根目录添加依赖需要-W参数'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'nohoist机制',
            content: {
                description: 'nohoist阻止特定依赖被提升到根node_modules，保留在workspace自己的node_modules中。',
                mechanism: 'Yarn默认提升所有兼容的依赖，但某些包（如React Native、Electron）在提升后会出问题，nohoist让它们保持独立。',
                keyPoints: [
                    '默认提升：优化空间和速度',
                    '提升问题：某些包依赖路径',
                    'nohoist配置：阻止提升',
                    '通配符：*匹配所有',
                    '递归：包含子依赖',
                    '性能影响：nohoist会增加安装时间'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'nohoist配置',
            content: {
                description: 'nohoist解决依赖提升导致的问题。',
                examples: [
                    {
                        title: 'nohoist配置',
                        code: `// 根package.json
{
  "private": true,
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      // 阻止所有workspace的react-native提升
      "**/react-native",
      "**/react-native/**",
      
      // 只阻止mobile workspace的
      "mobile/react-native",
      "mobile/react-native/**",
      
      // 阻止所有@types包提升
      "**/@types/**"
    ]
  }
}

// 结果：
my-monorepo/
├── node_modules/
│   └── lodash/  ← 正常提升
└── packages/
    └── mobile/
        └── node_modules/
            └── react-native/  ← 不提升`,
                        notes: 'nohoist用于解决特殊包的问题'
                    },
                    {
                        title: 'workspace级nohoist',
                        code: `// packages/mobile/package.json
{
  "name": "@my/mobile",
  "workspaces": {
    "nohoist": [
      "react-native",
      "react-native/**"
    ]
  }
}

// 只影响该workspace，不影响其他`,
                        notes: 'workspace可以有自己的nohoist'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn Berry Workspaces增强',
            content: {
                description: 'Yarn 2+为Workspaces带来更多强大功能。',
                examples: [
                    {
                        title: 'foreach命令',
                        code: `# 在所有workspaces执行命令
yarn workspaces foreach run build

# 并行执行
yarn workspaces foreach -p run build
yarn workspaces foreach --parallel run build

# 拓扑排序（按依赖顺序）
yarn workspaces foreach -pt run build
yarn workspaces foreach --parallel --topological run build

# 过滤器
yarn workspaces foreach --include '@my/*' run build
yarn workspaces foreach --exclude '@my/test-*' run build

# 只在有该脚本的workspace运行
yarn workspaces foreach --no-private run build

# 详细输出
yarn workspaces foreach -v run build
yarn workspaces foreach --verbose run build`,
                        notes: 'foreach比run更强大'
                    },
                    {
                        title: 'focus命令（Berry）',
                        code: `# 只安装特定workspace及其依赖
yarn workspaces focus @my/ui

# 场景：只需要开发某个workspace
# 1. 克隆仓库
git clone https://github.com/my/monorepo.git
cd monorepo

# 2. 只安装ui包及其依赖
yarn workspaces focus @my/ui

# 3. 开始开发
cd packages/ui
yarn dev

# 优势：节省时间，不安装无关包`,
                        notes: 'focus用于大型monorepo'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Yarn vs npm Workspaces对比',
            content: {
                description: 'Yarn和npm的Workspaces功能类似但有细节差异。',
                items: [
                    {
                        name: 'Yarn Workspaces',
                        pros: [
                            '早期支持：Yarn 1就有',
                            'workspace:协议：语义化',
                            'nohoist：精细控制',
                            'workspaces foreach：批量操作',
                            'Berry增强：focus等高级功能',
                            '成熟度高：大量实战案例'
                        ],
                        cons: [
                            '需要安装Yarn',
                            'Berry学习成本高'
                        ]
                    },
                    {
                        name: 'npm Workspaces',
                        pros: [
                            '官方支持：无需额外工具',
                            '简单直接：配置简单',
                            '兼容性好：npm 7+'
                        ],
                        cons: [
                            '功能较少：无nohoist',
                            '较晚支持：2020年才有',
                            '批量操作弱：需要额外脚本'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Workspaces实战技巧',
            content: {
                description: '实际项目中Workspaces的使用技巧和最佳实践。',
                examples: [
                    {
                        title: '根package.json脚本',
                        code: `// package.json
{
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    // 构建所有
    "build": "yarn workspaces foreach -pt run build",
    
    // 测试所有
    "test": "yarn workspaces foreach run test",
    
    // 清理
    "clean": "yarn workspaces foreach run clean",
    
    // 类型检查
    "typecheck": "yarn workspaces foreach run typecheck",
    
    // 代码检查
    "lint": "eslint packages/**/src",
    
    // 发布（使用changeset）
    "version": "changeset version",
    "release": "yarn build && changeset publish",
    
    // 单个workspace快捷命令
    "dev:ui": "yarn workspace @my/ui dev",
    "dev:app": "yarn workspace @my/app dev"
  }
}`,
                        notes: '根目录统一管理任务'
                    },
                    {
                        title: '处理构建顺序',
                        code: `# 问题：ui依赖utils，必须先构建utils

# 方案1：使用-t（topological）标志
yarn workspaces foreach -pt run build
# -p: 并行
# -t: 拓扑排序（按依赖顺序）

# 方案2：使用lerna
// lerna.json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true
}

yarn lerna run build --stream
# lerna自动处理依赖顺序

# 方案3：手动指定顺序
{
  "scripts": {
    "build": "yarn workspace @my/utils build && yarn workspace @my/ui build"
  }
}`,
                        notes: 'topological自动处理依赖顺序'
                    },
                    {
                        title: '共享配置',
                        code: `# 共享TypeScript配置
my-monorepo/
├── tsconfig.base.json  ← 根配置
├── packages/
│   ├── utils/
│   │   └── tsconfig.json  ← 继承根配置
│   └── ui/
│       └── tsconfig.json

// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true
  }
}

// packages/utils/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// 类似地共享ESLint、Prettier配置`,
                        notes: '根目录统一配置，workspace继承'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Yarn Workspaces最佳实践',
            content: {
                description: 'Yarn Workspaces在大型Monorepo中的最佳实践。',
                keyPoints: [
                    '根目录private: true：必须设置',
                    'workspace:协议：使用workspace:*引用内部包',
                    '共享配置：TS、ESLint配置放根目录',
                    '统一版本：关键依赖保持版本一致',
                    'nohoist谨慎：只在必要时使用',
                    '版本管理：使用changesets或lerna',
                    'Berry考虑：新项目考虑Yarn 2+',
                    'CI优化：只构建/测试变更的包',
                    '文档完善：README说明workspace结构'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第17章：Yarn基础命令',
            url: './render.html?subject=pkg-manager&type=content&chapter=17'
        },
        next: {
            title: "第19章：Yarn Plug'n'Play (PnP)",
            url: './render.html?subject=pkg-manager&type=content&chapter=19'
        }
    }
};
