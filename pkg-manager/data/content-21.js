/**
 * 第21章：pnpm原理与优势
 * 内容寻址存储、硬链接、严格依赖、幽灵依赖
 */

window.content = {
    section: {
        title: '第21章：pnpm原理与优势',
        icon: '⚡'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'pnpm的诞生与定位',
            content: {
                description: 'pnpm (performant npm) 由Zoltan Kochan于2017年创建，旨在解决npm/yarn的磁盘空间浪费和幽灵依赖问题，通过创新的存储方式实现极致性能。',
                keyPoints: [
                    '创建时间：2017年',
                    '核心理念：节省磁盘、严格依赖',
                    '存储创新：内容寻址存储 + 硬链接',
                    '性能优势：最快的包管理器',
                    '严格模式：彻底消除幽灵依赖',
                    '兼容性：完全兼容npm生态',
                    '现状：快速增长，大厂采用'
                ],
                mdn: 'https://pnpm.io/'
            }
        },
        
        {
            type: 'principle',
            title: '内容寻址存储（CAS）',
            content: {
                description: 'pnpm使用内容寻址存储，所有包只在全局存储一次，通过硬链接在项目中使用，实现极致的空间效率。',
                mechanism: '包下载后存储在全局store（~/.pnpm-store），文件按内容哈希命名，项目中的node_modules通过硬链接指向store，多个项目共享同一份文件。',
                keyPoints: [
                    '全局store：~/.pnpm-store/',
                    '内容哈希：SHA-512',
                    '硬链接：inode共享',
                    '去重：相同文件只存一份',
                    '即时：安装即可用',
                    '空间节省：可达70%+',
                    '跨项目共享：多项目零额外空间'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm存储结构',
            content: {
                description: 'pnpm的存储结构与npm/yarn完全不同，理解其结构是掌握pnpm的关键。',
                examples: [
                    {
                        title: '全局store结构',
                        code: `# 全局store位置
~/.pnpm-store/
└── v3/
    └── files/
        ├── 00/
        │   └── abc123...  ← 某个文件的内容哈希
        ├── 01/
        │   └── def456...
        └── ...

# 查看store位置
pnpm store path
# 输出：/Users/username/.pnpm-store/v3

# 存储机制：
# 1. 下载lodash-4.17.21.tgz
# 2. 解压，每个文件计算SHA-512
# 3. 存储到store，按哈希命名
# 4. 项目中的文件是硬链接

# 硬链接特点：
# - 指向相同的inode
# - 修改一处，所有处都变（pnpm有保护机制）
# - 不占用额外磁盘空间`,
                        notes: 'store是pnpm的核心，全局唯一'
                    },
                    {
                        title: '项目node_modules结构',
                        code: `# pnpm项目结构
my-project/
├── node_modules/
│   ├── .pnpm/  ← pnpm虚拟存储目录
│   │   ├── lodash@4.17.21/
│   │   │   └── node_modules/
│   │   │       └── lodash/  ← 硬链接到store
│   │   │           ├── index.js
│   │   │           └── ...
│   │   └── react@18.2.0/
│   │       └── node_modules/
│   │           ├── react/  ← 硬链接到store
│   │           └── loose-envify/  ← react的依赖
│   ├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
│   └── react -> .pnpm/react@18.2.0/node_modules/react
└── package.json

# 结构特点：
# 1. 扁平的顶层：只有直接依赖的符号链接
# 2. .pnpm目录：真实的依赖树
# 3. 硬链接：.pnpm中的文件链接到store
# 4. 严格依赖：未声明的依赖无法访问`,
                        notes: 'pnpm的node_modules是符号链接树'
                    },
                    {
                        title: '与npm/yarn的对比',
                        code: `# npm/yarn（扁平化）
node_modules/
├── lodash/  ← 直接依赖
├── axios/   ← 直接依赖
├── follow-redirects/  ← axios的依赖，被提升
└── ...  ← 大量被提升的依赖

# 问题：幽灵依赖
# 可以require('follow-redirects')，虽然没声明

# pnpm（符号链接 + 硬链接）
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/...
│   ├── axios@1.4.0/
│   │   └── node_modules/
│   │       ├── axios/  ← 硬链接到store
│   │       └── follow-redirects/  ← axios的依赖
│   └── follow-redirects@1.15.2/...
├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
└── axios -> .pnpm/axios@1.4.0/node_modules/axios

# 严格：无法require('follow-redirects')
# 因为顶层没有它的符号链接`,
                        notes: 'pnpm彻底解决幽灵依赖'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '硬链接机制',
            content: {
                description: 'pnpm使用硬链接（hard link）而不是复制文件，实现零额外空间占用。',
                mechanism: '硬链接是文件系统级别的特性，多个文件名指向同一个inode（数据块），修改任意一个都会影响所有链接，但pnpm通过copy-on-write保护机制避免误修改。',
                keyPoints: [
                    'inode共享：多个路径指向同一数据',
                    '零复制：不占用额外空间',
                    '即时生效：链接创建极快',
                    'copy-on-write：修改时自动复制',
                    '跨文件系统限制：必须同一分区',
                    '性能优势：比复制快数倍'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '硬链接验证',
            content: {
                description: '通过实验可以验证pnpm的硬链接机制。',
                examples: [
                    {
                        title: '检查硬链接',
                        code: `# 安装包
pnpm add lodash

# 检查inode（Unix/Linux/macOS）
ls -li node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/index.js
# 输出：12345678 ... index.js
#       ^^^^^^^^ inode号

# 检查store中的文件
find ~/.pnpm-store -name "*index.js*" -ls | grep lodash
# 输出：12345678 ... index.js
#       ^^^^^^^^ 相同的inode号！

# 说明：项目中的文件和store中的文件是同一个
# 不占用额外空间

# 查看硬链接数
stat node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/index.js
# Links: 3  ← 有3个路径指向这个文件`,
                        notes: '相同inode号证明是硬链接'
                    },
                    {
                        title: 'copy-on-write保护',
                        code: `# pnpm的保护机制

# 1. 尝试修改node_modules中的文件
echo "// modified" >> node_modules/lodash/index.js

# 2. pnpm检测到修改，自动复制
# 此时该文件不再是硬链接，而是独立副本

# 3. 不影响store和其他项目
# store中的原文件保持不变

# 实现原理：
# pnpm在运行时检查文件的修改时间
# 如果发现被修改，自动断开硬链接并创建副本`,
                        notes: 'pnpm保护store不被误修改'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '严格依赖与幽灵依赖',
            content: {
                description: 'pnpm通过符号链接树强制严格依赖，彻底消除幽灵依赖问题。',
                mechanism: 'node_modules顶层只有直接依赖的符号链接，间接依赖在.pnpm嵌套目录中，Node.js无法向上遍历访问，强制开发者显式声明所有依赖。',
                keyPoints: [
                    '扁平顶层：只有直接依赖',
                    '嵌套实际依赖：.pnpm目录',
                    '符号链接：隔离依赖',
                    '严格模式：默认开启',
                    '发现问题：编译/运行时报错',
                    '强制声明：必须在package.json中',
                    '质量保证：避免隐式依赖'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '幽灵依赖对比',
            content: {
                description: 'npm/yarn的提升机制导致幽灵依赖，pnpm彻底解决。',
                items: [
                    {
                        name: 'npm/yarn（有幽灵依赖）',
                        pros: [
                            '示例：安装axios',
                            'package.json: { "dependencies": { "axios": "^1.0.0" } }',
                            'node_modules提升了follow-redirects',
                            '代码可以require("follow-redirects") ✅',
                            '问题：没有声明却能用',
                            '风险：axios更新可能移除依赖，代码崩溃'
                        ],
                        cons: [
                            '幽灵依赖',
                            '不确定性',
                            '维护困难'
                        ]
                    },
                    {
                        name: 'pnpm（无幽灵依赖）',
                        pros: [
                            '同样安装axios',
                            'node_modules顶层只有axios符号链接',
                            'follow-redirects在.pnpm/axios@1.0.0内',
                            'require("follow-redirects") ❌ 报错',
                            '强制：必须显式添加依赖',
                            '安全：依赖关系明确'
                        ],
                        cons: [
                            '需要显式声明所有依赖',
                            '迁移时可能发现隐藏问题'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '幽灵依赖演示',
            content: {
                description: '实际代码演示幽灵依赖问题及pnpm的解决方案。',
                examples: [
                    {
                        title: 'npm/yarn的幽灵依赖',
                        code: `// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// npm install后，node_modules包含：
// - express
// - body-parser（express的依赖，被提升）
// - accepts（express的依赖，被提升）
// - ... 大量被提升的依赖

// index.js
const express = require('express');
const bodyParser = require('body-parser');  // ✅ 能用，但没声明

app.use(bodyParser.json());

// 问题：
// 1. express@5.0可能不再依赖body-parser
// 2. 升级express后，代码崩溃
// 3. 很难追踪为什么body-parser可用`,
                        notes: 'npm/yarn允许使用未声明的依赖'
                    },
                    {
                        title: 'pnpm的严格依赖',
                        code: `// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// pnpm install后
// index.js
const express = require('express');
const bodyParser = require('body-parser');  // ❌ 报错
// Error: Cannot find module 'body-parser'

// 解决：显式添加依赖
pnpm add body-parser

// package.json
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"  // 显式声明
  }
}

// 现在可以正常使用，依赖关系明确`,
                        notes: 'pnpm强制显式声明所有依赖'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'pnpm vs npm vs yarn 性能对比',
            content: {
                description: 'pnpm在各项指标上都有显著优势。',
                items: [
                    {
                        name: 'pnpm',
                        pros: [
                            '安装速度：最快（2-3倍）',
                            '磁盘空间：最省（70%+）',
                            '严格依赖：是',
                            '缓存效率：最高',
                            'Monorepo：优秀',
                            '兼容性：完全兼容npm'
                        ]
                    },
                    {
                        name: 'Yarn Berry PnP',
                        pros: [
                            '安装速度：很快',
                            '磁盘空间：省',
                            '严格依赖：是',
                            '创新：PnP模式',
                            'Monorepo：优秀'
                        ],
                        cons: [
                            '兼容性：较差（PnP）'
                        ]
                    },
                    {
                        name: 'npm/Yarn Classic',
                        pros: [
                            '成熟稳定',
                            '兼容性：最好'
                        ],
                        cons: [
                            '安装速度：慢',
                            '磁盘空间：浪费',
                            '幽灵依赖：是'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm优势总结',
            content: {
                description: 'pnpm的多项优势使其成为现代项目的首选。',
                examples: [
                    {
                        title: '性能基准测试',
                        code: `# 真实项目测试（Next.js应用，~500个包）

# npm
time npm install
# 首次：120秒
# 缓存后：45秒
# 磁盘：500MB

# Yarn Classic
time yarn install
# 首次：90秒
# 缓存后：35秒
# 磁盘：500MB

# pnpm
time pnpm install
# 首次：40秒
# 缓存后：12秒
# 磁盘：150MB（硬链接到store）

# Yarn Berry PnP
time yarn install
# 首次：35秒
# 缓存后：8秒
# 磁盘：200MB（零安装可选）

# 结论：pnpm和Yarn PnP最快，pnpm兼容性更好`,
                        notes: 'pnpm在性能和空间上都有优势'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'pnpm适用场景',
            content: {
                description: 'pnpm适合大多数现代项目，特别是Monorepo。',
                keyPoints: [
                    '新项目：强烈推荐使用pnpm',
                    'Monorepo：pnpm Workspaces性能最佳',
                    '磁盘敏感：节省70%+空间',
                    '严格依赖：提升代码质量',
                    'CI/CD：缓存利用率高',
                    '大型项目：性能优势明显',
                    '团队开发：依赖明确，易维护',
                    '迁移：完全兼容npm，迁移简单',
                    '不适合：极老旧的工具链（罕见）'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第20章：Yarn Berry高级特性',
            url: './render.html?subject=pkg-manager&type=content&chapter=20'
        },
        next: {
            title: '第22章：pnpm基础使用',
            url: './render.html?subject=pkg-manager&type=content&chapter=22'
        }
    }
};
