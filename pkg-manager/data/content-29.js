/**
 * 第29章：幽灵依赖与依赖提升
 * 幽灵依赖问题、扁平化vs嵌套、提升算法、最佳实践
 */

window.content = {
    section: {
        title: '第29章：幽灵依赖与依赖提升',
        icon: '👻'
    },
    
    topics: [
        {
            type: 'concept',
            title: '幽灵依赖问题',
            content: {
                description: '幽灵依赖（Phantom/Ghost Dependencies）是指项目代码中使用了未在package.json中声明的依赖，这些依赖因为扁平化被提升到node_modules根目录而可以访问。',
                keyPoints: [
                    '定义：未声明但可用的依赖',
                    '根源：扁平化提升机制',
                    '风险：隐式依赖，不确定性',
                    '表现：require/import未声明的包成功',
                    '问题：依赖更新可能破坏',
                    '发现：切换包管理器或CI失败',
                    '解决：显式声明所有依赖'
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖提升机制',
            content: {
                description: 'npm和Yarn使用扁平化算法（hoisting）将依赖提升到node_modules根目录，减少重复和嵌套深度，但引入了幽灵依赖问题。',
                mechanism: '安装时，包管理器尝试将所有依赖提升到根目录，如果版本冲突则嵌套安装。这使得所有提升的包都可以被项目代码访问，即使没有声明。',
                keyPoints: [
                    'npm v3+：默认扁平化',
                    'Yarn Classic：默认扁平化',
                    '提升算法：优先提升常用版本',
                    '冲突处理：嵌套安装不兼容版本',
                    '副作用：幽灵依赖',
                    'pnpm：严格隔离，无幽灵依赖',
                    'Yarn PnP：彻底解决'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '幽灵依赖示例',
            content: {
                description: '真实案例展示幽灵依赖如何产生和造成的问题。',
                examples: [
                    {
                        title: '幽灵依赖产生',
                        code: `// 场景：使用express但依赖body-parser

// package.json
{
  "dependencies": {
    "express": "^4.18.0"
    // 注意：没有声明body-parser
  }
}

// npm install后的node_modules结构（扁平化）
node_modules/
├── express/
├── body-parser/  ← express的依赖，被提升
├── accepts/      ← express的依赖，被提升
├── cookie/       ← express的依赖，被提升
└── ... 大量提升的依赖

// index.js
const express = require('express');
const bodyParser = require('body-parser');  // ✅ 成功！

app.use(bodyParser.json());

// 问题：body-parser没有在package.json中声明
// 但因为它被提升到根目录，所以可以使用

// 风险：
// 1. express@5.0可能不再依赖body-parser
// 2. 升级express后，代码崩溃
// 3. 在pnpm中直接失败（严格依赖）`,
                        notes: 'npm/yarn允许访问未声明的依赖'
                    },
                    {
                        title: '幽灵依赖导致的问题',
                        code: `// 时间线：幽灵依赖的生命周期

// === 2023年1月 ===
// package.json
{
  "dependencies": {
    "package-a": "^1.0.0"  // 依赖lodash@3.x
  }
}

// index.js
const lodash = require('lodash');  // ✅ 工作（幽灵依赖）
lodash.chunk([1, 2, 3], 2);

// === 2023年6月：package-a升级 ===
// package-a@2.0.0不再依赖lodash

npm update package-a

// index.js
const lodash = require('lodash');  // ❌ Error: Cannot find module 'lodash'

// 应用崩溃！💥
// 问题根源：从未正式声明lodash依赖

// === 修复 ===
// package.json
{
  "dependencies": {
    "package-a": "^2.0.0",
    "lodash": "^4.17.21"  // 显式声明
  }
}

// 教训：永远不要依赖幽灵依赖`,
                        notes: '隐式依赖导致不确定性'
                    },
                    {
                        title: '检测幽灵依赖',
                        code: `# 方法1：使用pnpm检测
# pnpm严格隔离，幽灵依赖会立即报错

# 1. 临时切换到pnpm
npm install -g pnpm
rm -rf node_modules package-lock.json
pnpm install

# 如果有幽灵依赖：
# Error: Cannot find module 'body-parser'

# 2. 找到所有幽灵依赖并添加到package.json

# 方法2：使用depcheck
npm install -g depcheck
depcheck

# 输出：
# Unused dependencies
#   ...
# Missing dependencies (幽灵依赖)
#   body-parser: ./index.js

# 方法3：使用eslint-plugin-import
// .eslintrc.js
{
  "plugins": ["import"],
  "rules": {
    "import/no-extraneous-dependencies": "error"
  }
}

# ESLint会检查import/require的包是否在package.json中`,
                        notes: 'pnpm是最有效的检测工具'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '扁平化 vs 嵌套',
            content: {
                description: 'npm历史上经历了从嵌套到扁平化的演变，两种结构各有优缺点。',
                mechanism: 'npm v2及以前使用嵌套结构，每个包的依赖独立安装在其node_modules中。npm v3+使用扁平化，尽可能提升依赖到根目录。',
                keyPoints: [
                    '嵌套结构：npm v2，深度嵌套',
                    '扁平结构：npm v3+，提升依赖',
                    '嵌套优点：隔离清晰，无幽灵依赖',
                    '嵌套缺点：重复安装，路径过长',
                    '扁平优点：减少重复，路径短',
                    '扁平缺点：幽灵依赖，不确定性',
                    'pnpm方案：符号链接 + 硬链接'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '嵌套vs扁平对比',
            content: {
                description: '直观对比两种结构的差异。',
                examples: [
                    {
                        title: '嵌套结构（npm v2）',
                        code: `// package.json
{
  "dependencies": {
    "package-a": "1.0.0",  // 依赖lodash@3.0.0
    "package-b": "1.0.0"   // 依赖lodash@4.0.0
  }
}

// node_modules结构（嵌套）
node_modules/
├── package-a/
│   ├── index.js
│   └── node_modules/
│       └── lodash/  ← 3.0.0（独立安装）
│           └── ...
└── package-b/
    ├── index.js
    └── node_modules/
        └── lodash/  ← 4.0.0（独立安装）
            └── ...

// 特点：
// ✅ 隔离清晰：每个包的依赖独立
// ✅ 无幽灵依赖：只能访问声明的依赖
// ❌ 重复安装：lodash安装2次
// ❌ 深度嵌套：路径过长（Windows限制260字符）
// ❌ 磁盘浪费：重复占用空间

// 问题：Windows路径长度限制
// C:\\...\\node_modules\\a\\node_modules\\b\\node_modules\\c\\...
// 超过260字符导致错误`,
                        notes: 'npm v2的嵌套结构'
                    },
                    {
                        title: '扁平结构（npm v3+）',
                        code: `// package.json
{
  "dependencies": {
    "package-a": "1.0.0",  // 依赖lodash@3.0.0
    "package-b": "1.0.0"   // 依赖lodash@4.0.0
  }
}

// node_modules结构（扁平化）
node_modules/
├── lodash/  ← 3.0.0（提升，第一个安装的版本）
├── package-a/  ← 使用顶层的lodash@3.0.0
└── package-b/
    └── node_modules/
        └── lodash/  ← 4.0.0（冲突，嵌套安装）

// 提升算法：
// 1. 按package.json顺序安装
// 2. 尝试提升每个依赖到根目录
// 3. 如果版本冲突，嵌套安装
// 4. 结果不确定（取决于安装顺序）

// 特点：
// ✅ 减少重复：兼容版本共享
// ✅ 路径短：避免Windows限制
// ❌ 幽灵依赖：可访问所有提升的包
// ❌ 不确定性：安装顺序影响结构
// ❌ 难以理解：复杂的提升规则`,
                        notes: 'npm v3+的扁平化'
                    },
                    {
                        title: 'pnpm方案（最佳）',
                        code: `// package.json
{
  "dependencies": {
    "package-a": "1.0.0",
    "package-b": "1.0.0"
  }
}

// node_modules结构（pnpm）
node_modules/
├── .pnpm/  ← 虚拟存储目录
│   ├── lodash@3.0.0/
│   │   └── node_modules/
│   │       └── lodash/  ← 硬链接到store
│   ├── lodash@4.0.0/
│   │   └── node_modules/
│   │       └── lodash/  ← 硬链接到store
│   ├── package-a@1.0.0/
│   │   └── node_modules/
│   │       ├── package-a/  ← 硬链接到store
│   │       └── lodash -> ../../lodash@3.0.0/node_modules/lodash
│   └── package-b@1.0.0/
│       └── node_modules/
│           ├── package-b/  ← 硬链接到store
│           └── lodash -> ../../lodash@4.0.0/node_modules/lodash
├── package-a -> .pnpm/package-a@1.0.0/node_modules/package-a
└── package-b -> .pnpm/package-b@1.0.0/node_modules/package-b

// 特点：
// ✅ 无幽灵依赖：严格隔离
// ✅ 零重复：硬链接到全局store
// ✅ 确定性：结构始终一致
// ✅ 快速：硬链接零复制
// ✅ 省空间：全局去重

// 原理：
// 1. 所有包存储在全局store
// 2. 通过硬链接引入项目
// 3. 通过符号链接组织依赖关系
// 4. 顶层只有声明的依赖`,
                        notes: 'pnpm完美解决方案'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '提升算法详解',
            content: {
                description: 'npm/yarn的提升算法决定了哪些包被提升到根目录。',
                examples: [
                    {
                        title: '提升规则',
                        code: `// npm/yarn提升算法

// 规则1：按安装顺序
// package.json中dependencies的顺序决定提升优先级

{
  "dependencies": {
    "package-a": "1.0.0",  // 先安装
    "package-b": "1.0.0"   // 后安装
  }
}

// package-a依赖lodash@^3.0.0
// package-b依赖lodash@^4.0.0

// 结果：lodash@3.x被提升（第一个）
node_modules/
├── lodash/  ← 3.10.1
├── package-a/
└── package-b/
    └── node_modules/
        └── lodash/  ← 4.17.21

// 规则2：版本兼容优先
// 如果某个版本能满足多个依赖范围，优先提升

// package-a依赖lodash@^4.10.0
// package-b依赖lodash@^4.15.0
// package-c依赖lodash@^4.0.0

// 提升lodash@4.17.21（满足所有范围）
node_modules/
├── lodash/  ← 4.17.21
├── package-a/  ← 使用4.17.21
├── package-b/  ← 使用4.17.21
└── package-c/  ← 使用4.17.21

// 规则3：不兼容版本嵌套
// 无法提升的版本嵌套安装

// package-a依赖lodash@3.x
// package-b依赖lodash@4.x

// 结果：一个提升，一个嵌套`,
                        notes: '提升算法复杂且不确定'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '包管理器依赖隔离对比',
            content: {
                description: '不同包管理器处理依赖隔离的方式对比。',
                items: [
                    {
                        name: 'pnpm',
                        pros: [
                            '严格隔离：无幽灵依赖',
                            '符号链接树：清晰结构',
                            '硬链接：零重复',
                            '确定性：始终一致',
                            '最佳方案'
                        ]
                    },
                    {
                        name: 'Yarn Berry PnP',
                        pros: [
                            '彻底隔离：无node_modules',
                            '严格依赖：无幽灵依赖',
                            '极速：跳过IO'
                        ],
                        cons: [
                            '兼容性：工具支持差'
                        ]
                    },
                    {
                        name: 'npm/Yarn Classic',
                        pros: [
                            '兼容性：最好'
                        ],
                        cons: [
                            '扁平化：幽灵依赖',
                            '不确定性：提升算法',
                            '重复安装：冲突嵌套'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '迁移到pnpm消除幽灵依赖',
            content: {
                description: '将现有项目迁移到pnpm，暴露并修复幽灵依赖。',
                examples: [
                    {
                        title: '迁移步骤',
                        code: `# 迁移到pnpm，发现幽灵依赖

# 1. 安装pnpm
npm install -g pnpm

# 2. 清理现有依赖
rm -rf node_modules package-lock.json yarn.lock

# 3. 使用pnpm安装
pnpm install

# 可能出现的错误：
# Error: Cannot find module 'body-parser'
#   at index.js:3:21

# 这是幽灵依赖！

# 4. 找到所有缺失的模块
# 运行应用/测试，记录所有错误

# 5. 添加到package.json
pnpm add body-parser express-session cookie-parser

# 6. 重新安装并测试
pnpm install
npm test

# 7. 提交修复
git add package.json pnpm-lock.yaml
git commit -m "fix: add missing dependencies (ghost deps)"`,
                        notes: 'pnpm暴露隐藏的问题'
                    },
                    {
                        title: '批量检测工具',
                        code: `# 使用depcheck批量检测

# 1. 安装depcheck
npm install -g depcheck

# 2. 运行检测
depcheck

# 输出：
# Unused dependencies
#   * unused-package
# Unused devDependencies
#   * unused-dev-package
# Missing dependencies
#   * body-parser: ./src/index.js
#   * express-session: ./src/middleware/auth.js

# 3. 修复missing dependencies
pnpm add body-parser express-session

# 4. 移除unused dependencies
pnpm remove unused-package unused-dev-package

# package.json配置忽略
{
  "depcheck": {
    "ignoreMatches": [
      "@types/*"  // 类型定义不检测
    ]
  }
}`,
                        notes: 'depcheck自动化检测'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '避免幽灵依赖最佳实践',
            content: {
                description: '预防和处理幽灵依赖的最佳实践。',
                keyPoints: [
                    '使用pnpm：从源头解决幽灵依赖',
                    '显式声明：所有使用的包都添加到package.json',
                    '代码审查：检查import/require',
                    'ESLint规则：import/no-extraneous-dependencies',
                    'depcheck：定期检测',
                    'CI验证：pnpm install --frozen-lockfile',
                    'TypeScript：类型检查辅助发现',
                    'Monorepo：统一依赖管理',
                    '文档：说明依赖管理规范',
                    '培训：团队理解幽灵依赖风险'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'ESLint防止幽灵依赖',
            content: {
                description: '配置ESLint规则在开发阶段就捕获幽灵依赖。',
                examples: [
                    {
                        title: 'ESLint配置',
                        code: `// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    // 禁止导入未声明的依赖
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/test/**',
        '**/scripts/**'
      ],
      optionalDependencies: false,
      peerDependencies: false
    }],
    
    // 要求导入路径可解析
    'import/no-unresolved': 'error'
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
};

// 现在如果使用未声明的依赖：
// index.js
const bodyParser = require('body-parser');

// ESLint错误：
// 'body-parser' should be listed in the project's dependencies.
// Run 'npm i -S body-parser' to add it`,
                        notes: 'ESLint在开发时就发现问题'
                    }
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第28章：依赖更新策略',
            url: './render.html?subject=pkg-manager&type=content&chapter=28'
        },
        next: {
            title: '返回目录',
            url: './index.html?subject=pkg-manager'
        }
    }
};
