/**
 * 第23章：pnpm Workspaces - 面试题
 * 10道精选面试题：测试对pnpm monorepo、workspace管理、依赖提升等的掌握
 */

window.content = {
    section: {
        title: '第23章：pnpm Workspaces - 面试题',
        icon: '📦'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：workspace配置',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['workspace', 'monorepo'],
                question: 'pnpm workspace的配置文件名是什么？',
                options: [
                    'lerna.json',
                    'workspace.yaml',
                    'pnpm-workspace.yaml',
                    'workspaces.json'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'pnpm workspace配置',
                    description: 'pnpm-workspace.yaml是pnpm monorepo的核心配置文件。',
                    sections: [
                        {
                            title: '基础配置',
                            code: `# pnpm-workspace.yaml
packages:
  # 包含packages目录下所有子目录
  - 'packages/*'
  # 包含apps目录下所有子目录
  - 'apps/*'
  # 排除测试目录
  - '!**/test/**'`,
                            content: '定义哪些目录是workspace成员。'
                        },
                        {
                            title: 'monorepo结构',
                            code: `my-monorepo/
├── pnpm-workspace.yaml    # workspace配置
├── package.json            # 根package.json
├── pnpm-lock.yaml         # 统一lockfile
├── packages/              # 库代码
│   ├── ui/
│   │   └── package.json
│   └── utils/
│       └── package.json
└── apps/                  # 应用
    ├── web/
    │   └── package.json
    └── mobile/
        └── package.json

# 共享4个特点
1. 单一代码库
2. 统一依赖管理
3. 共享node_modules
4. 统一版本控制`
                        },
                        {
                            title: '高级配置',
                            code: `# pnpm-workspace.yaml
packages:
  # 基础包
  - 'packages/**'
  
  # 应用
  - 'apps/*'
  
  # 工具
  - 'tools/*'
  
  # 排除模式
  - '!**/test/**'
  - '!**/__tests__/**'
  - '!**/dist/**'
  - '!**/build/**'

# package.json命名规范
packages/ui/package.json:
{
  "name": "@myapp/ui",  # scope命名
  "version": "1.0.0"
}

packages/utils/package.json:
{
  "name": "@myapp/utils",
  "version": "1.0.0"
}`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm-workspace.yaml'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：workspace依赖',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['workspace', '依赖协议'],
                question: '如何在workspace中引用另一个workspace包？',
                options: [
                    '使用绝对路径',
                    '使用workspace:协议',
                    '使用file:协议',
                    '直接写包名'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'workspace依赖协议',
                    description: 'workspace:协议是pnpm的特色，实现本地包引用。',
                    sections: [
                        {
                            title: 'workspace:协议',
                            code: `// apps/web/package.json
{
  "name": "@myapp/web",
  "dependencies": {
    "@myapp/ui": "workspace:*",
    "@myapp/utils": "workspace:^1.0.0",
    "react": "^18.0.0"
  }
}

# workspace:协议的作用
1. 总是使用本地workspace包
2. 不会从registry下载
3. 发布时自动转换为实际版本号

# 版本范围
workspace:*      -> 任意版本
workspace:^      -> 兼容版本  
workspace:~      -> 补丁版本
workspace:1.0.0  -> 精确版本`
                        },
                        {
                            title: '发布时的转换',
                            code: `// 开发时 package.json
{
  "dependencies": {
    "@myapp/ui": "workspace:^1.2.0"
  }
}

// 执行 pnpm publish 后
// 发布到npm的package.json
{
  "dependencies": {
    "@myapp/ui": "^1.2.0"  // 自动转换
  }
}

# 优势
1. 开发时使用本地版本
2. 发布时引用registry版本
3. 版本号自动同步`
                        },
                        {
                            title: '对比其他协议',
                            code: `{
  "dependencies": {
    // workspace协议（推荐）
    "@myapp/ui": "workspace:*",
    // 使用本地workspace版本
    
    // file协议（不推荐）
    "@myapp/ui": "file:../../packages/ui",
    // 需要相对路径，不便维护
    
    // link协议（yarn）
    "@myapp/ui": "link:../../packages/ui",
    // pnpm不支持
    
    // 直接版本号（错误）
    "@myapp/ui": "^1.0.0",
    // 会从registry下载，不是本地包
  }
}`
                        }
                    ]
                },
                source: 'pnpm官方文档 - workspace'
            }
        },
        
        // 中等题 1 - 多选题
        {
            type: 'quiz',
            title: '题目3：workspace命令',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['命令', 'workspace', '多选题'],
                question: '以下哪些命令可以在所有workspace中执行脚本？',
                options: [
                    'pnpm -r run build',
                    'pnpm --recursive run build',
                    'pnpm run -r build',
                    'pnpm --parallel run build'
                ],
                correctAnswer: [0, 1],
                explanation: {
                    title: 'workspace命令详解',
                    description: 'pnpm提供强大的workspace批量操作能力。',
                    sections: [
                        {
                            title: '递归执行',
                            code: `# 基础递归命令
pnpm -r run build
pnpm --recursive run build
# 两者等价，在所有workspace执行build

# 并行执行
pnpm -r --parallel run test
# 所有workspace同时执行test

# 拓扑排序（默认）
pnpm -r run build
# 按依赖顺序执行
# lib-a -> lib-b -> app

# 控制并发数
pnpm -r --workspace-concurrency=2 run build
# 最多2个workspace同时执行

# 流式输出
pnpm -r --stream run dev
# 实时显示所有workspace的输出`
                        },
                        {
                            title: '过滤执行',
                            code: `# 按名称过滤
pnpm --filter "@myapp/web" run build
# 只在web包执行

pnpm --filter "@myapp/*" run test
# 所有@myapp scope的包

# 按依赖关系
pnpm --filter "...@myapp/web" run build
# web及其所有依赖

pnpm --filter "@myapp/web..." run test  
# web及所有依赖它的包

# 按Git变更
pnpm --filter "...[origin/main]" run test
# 只测试有变更的包

# 组合过滤
pnpm --filter "@myapp/*" --filter "...[HEAD~1]" run build
# @myapp包且最近有变更`
                        },
                        {
                            title: '常用场景',
                            code: `# 全量构建
pnpm -r run build

# 全量测试（并行）
pnpm -r --parallel run test

# 增量构建（CI优化）
pnpm --filter "...[origin/main]" run build

# 单包开发
pnpm --filter "@myapp/web" run dev

# 依赖链构建
pnpm --filter "...@myapp/web" run build

# 清理所有
pnpm -r exec rm -rf dist node_modules`
                        },
                        {
                            title: '其他workspace命令',
                            code: `# 安装所有依赖
pnpm install

# 为特定workspace添加依赖
pnpm --filter "@myapp/web" add react

# 更新特定workspace依赖
pnpm --filter "@myapp/web" update

# 列出所有workspace
pnpm list -r --depth=-1

# 查看依赖关系
pnpm why lodash -r

# 发布所有workspace
pnpm -r publish`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Filtering'
            }
        },
        
        // 中等题 2 - 代码题
        {
            type: 'quiz-code',
            title: '题目4：workspace依赖提升',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['hoisting', '依赖提升'],
                question: 'pnpm workspace中，共同依赖如何处理？',
                code: `// packages/ui/package.json
{
  "dependencies": {
    "react": "^18.0.0",
    "lodash": "^4.17.21"
  }
}

// apps/web/package.json  
{
  "dependencies": {
    "react": "^18.0.0",
    "axios": "^1.0.0"
  }
}

# react会被安装几次？`,
                options: [
                    '安装2次，各自独立',
                    '安装1次，提升到根node_modules',
                    '安装1次，通过硬链接共享',
                    '安装1次，创建符号链接'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'workspace依赖管理',
                    description: 'pnpm利用store和硬链接实现高效的依赖共享。',
                    sections: [
                        {
                            title: '依赖共享机制',
                            code: `# pnpm的处理方式
1. react@18.0.0只下载一次到store
2. ui和web的node_modules都硬链接到store
3. 物理上只有一份文件
4. 逻辑上每个包都有自己的依赖

~/.pnpm-store/
└── react@18.0.0/  # 只存一份

node_modules/
├── .pnpm/
│   └── react@18.0.0/  # 硬链接到store
├── packages/
│   └── ui/
│       └── node_modules/
│           └── react -> ../../.pnpm/react@18.0.0/
└── apps/
    └── web/
        └── node_modules/
            └── react -> ../../../.pnpm/react@18.0.0/`
                        },
                        {
                            title: '版本冲突处理',
                            code: `// 不同版本的依赖
// packages/ui/package.json
{
  "dependencies": {
    "react": "^18.0.0"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "react": "^17.0.0"  // 不同版本！
  }
}

# pnpm的处理
1. store存储两个版本
   ~/.pnpm-store/
   ├── react@17.0.0/
   └── react@18.0.0/

2. 各自链接到正确版本
   ui/node_modules/react -> store/react@18.0.0
   web/node_modules/react -> store/react@17.0.0

3. 不会冲突，各用各的版本`
                        },
                        {
                            title: '公共依赖优化',
                            code: `# .npmrc配置
# 默认：不提升（strict）
hoist=false

# 提升所有依赖到根（不推荐）
shamefully-hoist=true

# 按模式提升（推荐）
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
# 只提升类型定义和ESLint相关

# 查看实际安装位置
pnpm list react -r
# 显示每个workspace的react版本和位置`
                        },
                        {
                            title: 'workspace优势',
                            code: `# 对比传统monorepo (Lerna + npm)

传统方式：
packages/
├── ui/
│   └── node_modules/
│       ├── react/      (50MB)
│       └── lodash/     (10MB)
└── web/
    └── node_modules/
        ├── react/      (50MB) 重复！
        └── axios/      (5MB)
总计：115MB

pnpm workspace：
node_modules/
└── .pnpm/
    ├── react@18/       (50MB, 硬链接)
    ├── lodash@4/       (10MB, 硬链接)
    └── axios@1/        (5MB, 硬链接)
packages/ui/node_modules/
    ├── react -> ../../.pnpm/react@18
    └── lodash -> ../../.pnpm/lodash@4
apps/web/node_modules/
    ├── react -> ../../../.pnpm/react@18
    └── axios -> ../../../.pnpm/axios@1
总计：65MB（节省43%）`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Workspace'
            }
        },
        
        // 中等题 3 - 多选题
        {
            type: 'quiz',
            title: '题目5：catalog特性',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['catalog', '版本管理', '多选题'],
                question: 'pnpm catalog的优势有哪些？',
                options: [
                    '统一管理workspace依赖版本',
                    '避免版本不一致问题',
                    '简化依赖升级流程',
                    '自动安装所有依赖'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'pnpm catalog功能',
                    description: 'catalog集中管理依赖版本，确保workspace一致性。',
                    sections: [
                        {
                            title: 'catalog配置',
                            code: `// pnpm-workspace.yaml
catalog:
  react: ^18.2.0
  typescript: ^5.0.0
  vite: ^4.0.0
  '@types/node': ^18.0.0

packages:
  - 'packages/*'
  - 'apps/*'

# 或单独文件 catalog.yaml
react: ^18.2.0
typescript: ^5.0.0
vite: ^4.0.0`
                        },
                        {
                            title: '使用catalog',
                            code: `// packages/ui/package.json
{
  "dependencies": {
    "react": "catalog:",  // 使用catalog定义的版本
    "typescript": "catalog:"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "react": "catalog:",  // 同样版本
    "vite": "catalog:"
  }
}

# pnpm install时
# 所有使用catalog:的包都用统一版本`
                        },
                        {
                            title: '版本升级',
                            code: `# 升级前
catalog:
  react: ^18.2.0

# 修改catalog
catalog:
  react: ^18.3.0

# 运行pnpm install
# 所有workspace的react自动升级到18.3.0

# 无需逐个修改package.json！`
                        },
                        {
                            title: '对比其他方案',
                            code: `# 方案1：手动同步（容易出错）
packages/ui/package.json:    "react": "^18.2.0"
apps/web/package.json:       "react": "^18.2.0"
# 问题：忘记同步，版本不一致

# 方案2：pnpm catalog（推荐）
pnpm-workspace.yaml:
  catalog:
    react: ^18.2.0
    
packages/ui/package.json:    "react": "catalog:"
apps/web/package.json:       "react": "catalog:"
# 优势：统一管理，自动同步

# 方案3：workspace:*（不适用外部包）
"react": "workspace:*"
# 只适用本地workspace包`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Catalogs'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目6：workspace发布',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['发布', 'publish'],
                question: 'workspace包发布前需要做什么处理？',
                options: [
                    '手动替换workspace:协议',
                    'pnpm自动转换workspace:为实际版本',
                    '先删除workspace依赖',
                    '不能包含workspace依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'workspace发布机制',
                    description: 'pnpm在发布时自动处理workspace依赖。',
                    sections: [
                        {
                            title: '自动转换',
                            code: `// 开发时 package.json
{
  "name": "@myapp/web",
  "version": "1.0.0",
  "dependencies": {
    "@myapp/ui": "workspace:^1.2.0",
    "react": "^18.0.0"
  }
}

// 执行 pnpm publish
// 发布到npm的package.json
{
  "name": "@myapp/web",
  "version": "1.0.0",
  "dependencies": {
    "@myapp/ui": "^1.2.0",  // 自动转换！
    "react": "^18.0.0"
  }
}`
                        },
                        {
                            title: '批量发布',
                            code: `# 发布所有workspace
pnpm -r publish

# 发布特定workspace
pnpm --filter "@myapp/ui" publish

# 发布有变更的包
pnpm --filter "...[origin/main]" publish

# 配合changeset
pnpm changeset version
pnpm changeset publish`
                        },
                        {
                            title: '发布配置',
                            code: `// package.json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}

// 发布前脚本
{
  "scripts": {
    "prepublishOnly": "pnpm run build && pnpm run test"
  }
}`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Publishing'
            }
        },
        
        // 困难题 1 - 代码题
        {
            type: 'quiz-code',
            title: '题目7：monorepo实践',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['monorepo', '最佳实践'],
                question: '设计一个完整的monorepo结构，应该包含哪些元素？',
                code: `my-monorepo/
├── ?
├── ?
├── packages/
└── apps/`,
                options: [
                    '只需要pnpm-workspace.yaml',
                    'workspace配置 + 根package.json + tsconfig',
                    'workspace配置 + lockfile + CI配置 + 共享配置',
                    '与普通项目相同'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '完整monorepo架构',
                    description: '成功的monorepo需要完善的工程化配置。',
                    sections: [
                        {
                            title: '目录结构',
                            code: `my-monorepo/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD配置
├── packages/               # 共享库
│   ├── ui/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/
│   └── types/
├── apps/                   # 应用
│   ├── web/
│   └── mobile/
├── tools/                  # 工具脚本
│   ├── build.ts
│   └── deploy.ts
├── configs/                # 共享配置
│   ├── eslint/
│   ├── typescript/
│   └── prettier/
├── pnpm-workspace.yaml     # workspace配置
├── package.json            # 根配置
├── pnpm-lock.yaml          # 统一lockfile
├── tsconfig.base.json      # 基础TS配置
├── .npmrc                  # pnpm配置
└── turbo.json              # 构建缓存(可选)`
                        },
                        {
                            title: '根配置',
                            code: `// package.json (根)
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "clean": "pnpm -r exec rm -rf dist node_modules",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}`
                        },
                        {
                            title: 'TypeScript配置',
                            code: `// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@myapp/*": ["./packages/*/src"]
    }
  }
}

// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// apps/web/tsconfig.json  
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "references": [
    { "path": "../../packages/ui" }
  ]
}`
                        },
                        {
                            title: 'CI配置',
                            code: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史，用于changeset
          
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
          
      # 增量安装（只变更的包）
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      # 增量构建
      - name: Build changed packages
        run: pnpm --filter "...[origin/main]" run build
        
      # 增量测试  
      - name: Test changed packages
        run: pnpm --filter "...[origin/main]" run test
        
      # 类型检查
      - name: Type check
        run: pnpm -r exec tsc --noEmit`
                        },
                        {
                            title: 'pnpm配置',
                            code: `# .npmrc
# 严格的peer依赖
strict-peer-dependencies=true
auto-install-peers=true

# 不使用shamefully-hoist
shamefully-hoist=false

# 提升类型定义
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*

# 使用淘宝镜像
registry=https://registry.npmmirror.com

# 忽略脚本（安全）
ignore-scripts=false

# store位置
store-dir=~/.pnpm-store

# workspace并发
workspace-concurrency=4`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Workspace'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目8：依赖循环问题',
            content: {
                questionType: 'multiple',
                difficulty: 'hard',
                tags: ['循环依赖', '问题排查', '多选题'],
                question: 'workspace中出现循环依赖时，可以采取哪些措施？',
                options: [
                    '重构代码，拆分共同依赖',
                    '使用延迟导入(dynamic import)',
                    'pnpm会自动处理，无需干预',
                    '提取共同逻辑到新包'
                ],
                correctAnswer: [0, 1, 3],
                explanation: {
                    title: '循环依赖解决方案',
                    description: '循环依赖需要通过架构优化来解决。',
                    sections: [
                        {
                            title: '识别循环依赖',
                            code: `# 场景：循环依赖
packages/a/package.json:
{
  "dependencies": {
    "@myapp/b": "workspace:*"
  }
}

packages/b/package.json:
{
  "dependencies": {
    "@myapp/a": "workspace:*"  // 循环！
  }
}

# pnpm install会报错
ERR_PNPM_PEER_DEP_ISSUES  Cyclic dependencies detected

# 检查依赖关系
pnpm list -r --depth=999 > deps.txt
# 查找循环引用`
                        },
                        {
                            title: '解决方案1：拆分共同代码',
                            code: `# 重构前
packages/a -> packages/b
packages/b -> packages/a

# 重构后：提取共同依赖
packages/
├── shared/          # 新建共享包
│   └── common.ts
├── a/
│   └── index.ts     # 依赖shared
└── b/
    └── index.ts     # 依赖shared

packages/a -> packages/shared
packages/b -> packages/shared

// packages/shared/package.json
{
  "name": "@myapp/shared"
}

// packages/a/package.json
{
  "dependencies": {
    "@myapp/shared": "workspace:*"
  }
}

// packages/b/package.json  
{
  "dependencies": {
    "@myapp/shared": "workspace:*"
  }
}`
                        },
                        {
                            title: '解决方案2：动态导入',
                            code: `// packages/a/index.ts
export function useB() {
  // 静态导入会循环
  // import { funcB } from '@myapp/b';
  
  // 动态导入打破循环
  const { funcB } = await import('@myapp/b');
  return funcB();
}

// packages/b/index.ts
export function funcB() {
  // 可以静态导入a
  import { funcA } from '@myapp/a';
  return funcA();
}

// 优势：运行时加载，避免编译时循环
// 缺点：异步，类型推导弱`
                        },
                        {
                            title: '解决方案3：依赖倒置',
                            code: `# 重构前：直接依赖
packages/ui -> packages/utils
packages/utils -> packages/ui  # 循环

# 重构后：通过接口解耦
packages/
├── types/           # 只有类型定义
├── ui/              # 实现types接口
└── utils/           # 依赖types，不依赖ui

// packages/types/index.ts
export interface IFormatter {
  format(value: any): string;
}

// packages/ui/index.ts
import { IFormatter } from '@myapp/types';
export class UIFormatter implements IFormatter {
  format(value: any) { ... }
}

// packages/utils/index.ts
import { IFormatter } from '@myapp/types';
export function process(formatter: IFormatter) {
  // 依赖接口，不依赖具体实现
}`
                        },
                        {
                            title: '预防措施',
                            code: `// 1. ESLint规则
// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-cycle': 'error'  // 禁止循环导入
  }
};

// 2. 依赖可视化
pnpm add -D @pnpm/dependency-graph
pnpm dlx @pnpm/dependency-graph --output graph.html

// 3. 架构原则
- 单向依赖：低层 <- 高层
- 分层架构：
  types/interfaces
  ↑
  utils/shared
  ↑
  features/components
  ↑
  apps

// 4. Code Review检查清单
[ ] 新依赖是否引入循环
[ ] 是否可以提取共同代码
[ ] 是否需要依赖倒置`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Workspace'
            }
        },
        
        // 困难题 3 - 代码题
        {
            type: 'quiz-code',
            title: '题目9：workspace构建优化',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['构建优化', 'CI'],
                question: 'CI中如何优化workspace构建时间？',
                code: `# 100个workspace的monorepo
# 每次push都全量构建需要30分钟
# 如何优化？`,
                options: [
                    '购买更快的CI服务器',
                    '减少workspace数量',
                    '使用增量构建 + 构建缓存',
                    '串行改为并行构建'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'CI构建优化策略',
                    description: '增量构建和缓存是大型monorepo的关键。',
                    sections: [
                        {
                            title: '增量构建',
                            code: `# 只构建变更的包及其依赖者
# .github/workflows/ci.yml

- name: Get changed packages
  id: changed
  run: |
    # 获取变更文件
    git diff --name-only origin/main HEAD > changed-files.txt
    
- name: Install dependencies
  run: pnpm install --frozen-lockfile
  
- name: Build changed packages
  run: pnpm --filter "...[origin/main]" run build
  # 只构建有变更的包及其依赖链
  
- name: Test changed packages
  run: pnpm --filter "...[origin/main]" run test

# 效果：
全量：100个包 × 20秒 = 2000秒 (33分钟)
增量：5个包 × 20秒 = 100秒 (1.7分钟)
提升：95% ⚡⚡⚡`
                        },
                        {
                            title: 'Turbo构建缓存',
                            code: `# 安装Turborepo
pnpm add -D turbo

# turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  # 依赖的包先构建
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}

# package.json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test"
  }
}

# CI中配置缓存
# .github/workflows/ci.yml
- name: Turbo Cache
  uses: actions/cache@v3
  with:
    path: .turbo
    key: \${{ runner.os }}-turbo-\${{ github.sha }}
    restore-keys: |
      \${{ runner.os }}-turbo-

- name: Build with cache
  run: pnpm build
  # Turbo自动复用缓存
  
# 效果：
首次构建：2000秒
缓存命中：10秒
提升：99.5% ⚡⚡⚡`
                        },
                        {
                            title: '并行优化',
                            code: `# 分析依赖拓扑
packages/
├── shared (基础)
├── ui (依赖shared)
├── utils (依赖shared)
└── app (依赖ui, utils)

# 串行构建（慢）
pnpm -r run build
# shared (20s) -> ui (20s) -> utils (20s) -> app (20s)
# 总计：80秒

# 智能并行（快）
pnpm -r run build
# shared (20s)
# ui + utils 并行 (20s)  # 都依赖shared
# app (20s)
# 总计：60秒

# 纯并行（最快，无依赖时）
pnpm -r --parallel run test
# 所有包同时测试
# 总计：max(各包测试时间) = 30秒

# 限制并发（避免OOM）
pnpm -r --workspace-concurrency=4 run build`
                        },
                        {
                            title: '矩阵构建',
                            code: `# .github/workflows/ci.yml
jobs:
  # Job 1: 检测变更
  detect:
    runs-on: ubuntu-latest
    outputs:
      packages: \${{ steps.packages.outputs.value }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - id: packages
        run: |
          # 输出变更的包列表
          pnpm list --filter "...[origin/main]" --depth=-1 --json \
            | jq -r '[.[] | .name] | @json'
          
  # Job 2: 并行构建各包
  build:
    needs: detect
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: \${{ fromJson(needs.detect.outputs.packages) }}
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter "\${{ matrix.package }}" run build
      
# 效果：
传统：串行构建5个包，耗时100秒
矩阵：5个包并行构建，耗时20秒
提升：80% ⚡⚡⚡`
                        },
                        {
                            title: '综合优化',
                            code: `# 完整CI策略
1. 增量检测
   pnpm --filter "...[origin/main]"
   
2. 构建缓存
   Turbo + GitHub Actions Cache
   
3. 智能并行
   按拓扑排序 + workspace-concurrency
   
4. 矩阵构建
   独立包并行CI job
   
5. 远程缓存
   Turbo Remote Cache (Vercel/自建)

# 实际效果（100个workspace）
优化前：全量30分钟
优化后：
- 无变更：30秒（全缓存）
- 5%变更：3分钟（增量+缓存）
- 100%变更：8分钟（并行+缓存）
平均提速：90%+ ⚡⚡⚡`
                        }
                    ]
                },
                source: 'Turborepo官方文档'
            }
        },
        
        // 困难题 4
        {
            type: 'quiz',
            title: '题目10：workspace最佳实践',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['最佳实践', '架构设计'],
                question: 'monorepo架构设计的核心原则是什么？',
                options: [
                    '把所有代码放在一个repo',
                    '清晰的边界 + 单向依赖 + 自动化',
                    'workspace越多越好',
                    '禁止任何外部依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Monorepo最佳实践',
                    description: '成功的monorepo需要清晰的架构和完善的工具链。',
                    sections: [
                        {
                            title: '架构原则',
                            code: `1. 分层架构
   ┌─────────────────┐
   │   Apps Layer    │  应用层
   │  web, mobile    │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │ Features Layer  │  功能层
   │ auth, dashboard │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │   UI Layer      │  组件层
   │  components     │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │  Shared Layer   │  共享层
   │  utils, types   │
   └─────────────────┘

2. 单向依赖
   ✅ utils <- components <- features <- apps
   ❌ utils -> apps (禁止反向依赖)

3. 清晰边界
   每个包有明确的职责和API`
                        },
                        {
                            title: '命名规范',
                            code: `// 使用scope统一管理
packages/
├── @myapp-ui/
│   ├── button/
│   ├── input/
│   └── layout/
├── @myapp-utils/
│   ├── date/
│   ├── string/
│   └── validation/
├── @myapp-features/
│   ├── auth/
│   └── dashboard/
└── apps/
    ├── web/
    └── mobile/

// 包命名
@myapp-ui/button          # UI组件
@myapp-utils/date         # 工具函数
@myapp-features/auth      # 业务功能
@myapp/web                # 应用`
                        },
                        {
                            title: '版本管理',
                            code: `# 使用changesets管理版本
pnpm add -Dw @changesets/cli
pnpm changeset init

# 工作流程
# 1. 开发新功能
git checkout -b feat/new-button

# 2. 创建changeset
pnpm changeset
# 选择变更的包和版本类型

# 3. 提交代码
git add .
git commit -m "feat: add new button"

# 4. 发布前（CI）
pnpm changeset version     # 更新版本号
pnpm install               # 更新lockfile
pnpm changeset publish     # 发布到npm

# .changeset/config.json
{
  "baseBranch": "main",
  "access": "public",
  "changelog": "@changesets/cli/changelog"
}`
                        },
                        {
                            title: '代码共享',
                            code: `// 共享TypeScript配置
tsconfig.base.json

// 共享ESLint配置
configs/eslint/
├── base.js
├── react.js
└── node.js

// 使用共享配置
packages/ui/.eslintrc.js:
module.exports = {
  extends: ['../../configs/eslint/react']
};

// 共享构建脚本
tools/build.ts

// 共享GitHub Actions
.github/
├── workflows/
│   ├── ci.yml
│   └── release.yml
└── actions/        # 可复用action
    └── setup/`
                        },
                        {
                            title: '性能监控',
                            code: `// package.json
{
  "scripts": {
    "analyze": "pnpm -r exec du -sh node_modules",
    "why": "pnpm why",
    "outdated": "pnpm outdated -r",
    "audit": "pnpm audit -r"
  }
}

// CI中监控指标
- name: Report stats
  run: |
    echo "Packages: $(pnpm list -r --depth=-1 | wc -l)"
    echo "Dependencies: $(pnpm list -r | wc -l)"
    echo "Build time: \${{ steps.build.outputs.time }}"
    echo "Cache hit: \${{ steps.cache.outputs.cache-hit }}"
    
// 使用bundle analyzer
pnpm add -D webpack-bundle-analyzer
# 定期分析各包体积`
                        }
                    ]
                },
                source: 'monorepo.tools'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第22章：pnpm基础使用',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=22'
        },
        next: {
            title: '第24章：pnpm高级特性',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=24'
        }
    }
};
