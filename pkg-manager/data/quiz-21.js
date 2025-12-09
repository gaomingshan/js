/**
 * 第21章：pnpm原理与优势 - 面试题
 * 10道精选面试题：测试对pnpm内容寻址存储、硬链接、严格依赖等核心原理的掌握
 */

window.content = {
    section: {
        title: '第21章：pnpm原理与优势 - 面试题',
        icon: '⚡'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：pnpm的核心优势',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['pnpm基础', '核心优势'],
                question: 'pnpm相比npm/yarn的最大优势是什么？',
                options: [
                    '安装速度更快',
                    '节省磁盘空间并消除幽灵依赖',
                    '配置更简单',
                    '支持TypeScript'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm的核心优势',
                    description: 'pnpm通过创新的存储方式实现了两大核心优势：节省磁盘空间和严格依赖管理。',
                    sections: [
                        {
                            title: '磁盘空间优势',
                            content: 'pnpm使用内容寻址存储（Content-Addressable Storage）+ 硬链接，所有版本的包只存储一次。',
                            code: `// npm/yarn的存储方式
项目A/node_modules/lodash@4.17.21  (1MB)
项目B/node_modules/lodash@4.17.21  (1MB)
项目C/node_modules/lodash@4.17.21  (1MB)
总计：3MB

// pnpm的存储方式
~/.pnpm-store/
  v3/files/
    00/abc123...  (lodash@4.17.21真实内容, 1MB)
    
项目A/node_modules/.pnpm/lodash@4.17.21/
  node_modules/lodash -> 硬链接到store
项目B/node_modules/.pnpm/lodash@4.17.21/
  node_modules/lodash -> 硬链接到store
项目C/node_modules/.pnpm/lodash@4.17.21/
  node_modules/lodash -> 硬链接到store
  
总计：1MB + 少量硬链接开销`
                        },
                        {
                            title: '严格依赖管理',
                            content: 'pnpm创建的node_modules是非平铺的，只有直接依赖在顶层，彻底消除幽灵依赖。',
                            code: `// npm/yarn (平铺结构 - 有幽灵依赖)
node_modules/
├── react          # 直接依赖
├── lodash         # 传递依赖，但可以直接require
└── axios          # 传递依赖，也可以直接用

// pnpm (非平铺结构 - 无幽灵依赖)
node_modules/
├── react -> .pnpm/react@18.2.0/node_modules/react
└── .pnpm/
    ├── react@18.2.0/
    │   └── node_modules/
    │       ├── react (真实文件)
    │       └── lodash -> ../../lodash@4.17.21/...
    └── lodash@4.17.21/
        └── node_modules/lodash`
                        },
                        {
                            title: '性能对比',
                            points: [
                                '磁盘空间：节省50-70%',
                                '安装速度：比npm快2倍，比Yarn快30%',
                                '严格性：100%消除幽灵依赖',
                                '兼容性：完全兼容npm生态'
                            ]
                        }
                    ]
                },
                source: 'pnpm官方文档'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：硬链接vs符号链接',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['硬链接', '文件系统'],
                question: 'pnpm使用硬链接（hard link）而非符号链接（symlink），原因是什么？',
                options: [
                    '硬链接速度更快',
                    '硬链接节省磁盘空间且不占用inode',
                    '符号链接不支持跨平台',
                    '硬链接更安全'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '硬链接 vs 符号链接',
                    description: '硬链接和符号链接是两种不同的文件系统特性，pnpm巧妙地同时使用了两者。',
                    sections: [
                        {
                            title: '硬链接（Hard Link）',
                            content: '硬链接是文件内容的直接引用，多个硬链接指向同一块磁盘数据。',
                            points: [
                                '特点：共享inode，不占用额外空间',
                                '优势：删除一个硬链接不影响其他',
                                '限制：不能跨文件系统，不能链接目录',
                                'pnpm用途：从全局store链接到项目'
                            ],
                            code: `// 硬链接示例
# 创建硬链接
ln /path/to/store/lodash.js /path/to/project/node_modules/lodash.js

# 查看inode（相同）
ls -i /path/to/store/lodash.js        # 12345678
ls -i /path/to/project/.../lodash.js  # 12345678 (相同)

# 磁盘占用
du -sh /path/to/store/lodash.js       # 100K
du -sh /path/to/project/.../lodash.js # 0K (不占用额外空间)`
                        },
                        {
                            title: '符号链接（Symbolic Link）',
                            content: '符号链接是文件路径的引用，类似快捷方式。',
                            points: [
                                '特点：独立inode，存储目标路径',
                                '优势：可以跨文件系统，可以链接目录',
                                '限制：目标删除后链接失效',
                                'pnpm用途：项目node_modules顶层'
                            ],
                            code: `// 符号链接示例
# 创建符号链接
ln -s .pnpm/lodash@4.17.21/node_modules/lodash node_modules/lodash

# 查看inode（不同）
ls -i .pnpm/lodash@4.17.21/.../lodash  # 12345678
ls -i node_modules/lodash              # 87654321 (不同)

# 查看目标
ls -l node_modules/lodash
# lrwxr-xr-x  lodash -> .pnpm/lodash@4.17.21/...`
                        },
                        {
                            title: 'pnpm的混合策略',
                            title: 'pnpm的混合策略',
                            code: `// pnpm的三层结构
1. 全局store（真实文件）
   ~/.pnpm-store/v3/files/00/abc123... (真实文件)
   
2. 虚拟store（硬链接）
   项目/.pnpm/lodash@4.17.21/node_modules/lodash/index.js
   └─> 硬链接到 ~/.pnpm-store/v3/files/00/abc123...
   
3. 项目node_modules（符号链接）
   项目/node_modules/lodash
   └─> 符号链接到 .pnpm/lodash@4.17.21/node_modules/lodash`,
                            content: '这种混合策略既节省空间（硬链接），又保持结构清晰（符号链接）。'
                        }
                    ]
                },
                source: 'pnpm官方文档 - Symlinked node_modules structure'
            }
        },
        
        // 中等题 1 - 多选题
        {
            type: 'quiz',
            title: '题目3：幽灵依赖的危害',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['幽灵依赖', '多选题'],
                question: 'npm/yarn的幽灵依赖（Phantom Dependencies）会导致哪些问题？',
                options: [
                    '代码可以引用未在package.json声明的依赖',
                    '依赖版本更新可能导致项目突然崩溃',
                    '无法准确追踪项目的真实依赖',
                    '安装速度变慢'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: '幽灵依赖的危害',
                    description: '幽灵依赖是npm/yarn平铺node_modules导致的严重问题，pnpm通过非平铺结构彻底解决。',
                    sections: [
                        {
                            title: '什么是幽灵依赖',
                            code: `// 项目package.json
{
  "dependencies": {
    "express": "^4.18.0"  // 只声明了express
  }
}

// express依赖了body-parser
// npm/yarn安装后：
node_modules/
├── express/
└── body-parser/  <-- 幽灵依赖

// 代码中可以直接使用
const bodyParser = require('body-parser'); // ✅ 能用
// 但package.json中没有声明！`,
                            content: '幽灵依赖是指可以访问但未在package.json中声明的依赖包。'
                        },
                        {
                            title: '危害1：隐式依赖',
                            code: `// 项目代码
import lodash from 'lodash';  // 直接使用
// 但package.json中没有lodash！

// 可能的情况：
// 1. 某个依赖包内部用了lodash
// 2. 被提升到了根node_modules
// 3. 你直接用了，但不知道从哪来的

// 风险：
// - 如果那个依赖包移除了lodash依赖
// - 你的代码就崩溃了
// - 但你没有在package.json中声明过`,
                            content: '代码依赖了未声明的包，维护噩梦。'
                        },
                        {
                            title: '危害2：版本不确定',
                            code: `// 场景：
// packageA 依赖 lodash@4.17.20
// packageB 依赖 lodash@4.17.21

// npm的提升规则（不确定性）：
node_modules/
├── lodash/        <-- 可能是4.17.20，也可能是4.17.21
├── packageA/
└── packageB/
    └── node_modules/
        └── lodash/ <-- 另一个版本

// 你的代码：
import lodash from 'lodash';
// 你得到的版本取决于安装顺序！
// 不同机器可能行为不同`,
                            content: '依赖版本不确定，难以复现问题。'
                        },
                        {
                            title: 'pnpm如何解决',
                            code: `// pnpm的非平铺结构
node_modules/
├── express -> .pnpm/express@4.18.0/node_modules/express
└── .pnpm/
    ├── express@4.18.0/
    │   └── node_modules/
    │       ├── express/
    │       └── body-parser -> ../../body-parser@1.20.0/...
    └── body-parser@1.20.0/
        └── node_modules/body-parser/

// 尝试引用幽灵依赖
const bodyParser = require('body-parser');
// ❌ Error: Cannot find module 'body-parser'
// 必须在package.json中显式声明才能使用！`,
                            content: 'pnpm的严格模式彻底消除幽灵依赖，提升项目稳定性。'
                        }
                    ]
                },
                source: 'pnpm官方文档 - Motivation'
            }
        },
        
        // 中等题 2 - 代码题
        {
            type: 'quiz-code',
            title: '题目4：内容寻址存储',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['CAS', '存储原理'],
                question: '观察pnpm的store目录结构，文件是如何组织的？',
                code: `// ~/.pnpm-store/v3/files/
00/
  1a/
    001a2b3c4d5e6f7890abcdef12345678-exec
  2b/
    002b3c4d5e6f7890abcdef123456789a
01/
  3c/
    013c4d5e6f7890abcdef123456789abc

// 每个文件命名格式：
<content-hash>[-exec]

// 示例：
// 文件内容：console.log('hello');
// SHA-512哈希：4d8f1a2b...
// 存储路径：~/.pnpm-store/v3/files/4d/8f/4d8f1a2b...`,
                options: [
                    '按包名和版本号组织目录',
                    '按文件内容的哈希值组织目录',
                    '按安装时间组织目录',
                    '按文件大小组织目录'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '内容寻址存储（CAS）',
                    description: 'pnpm使用CAS（Content-Addressable Storage）来存储所有包文件，相同内容只存储一次。',
                    sections: [
                        {
                            title: 'CAS原理',
                            content: '基于文件内容计算哈希值，作为存储地址。相同内容产生相同哈希，实现去重。',
                            code: `// CAS工作流程
1. 下载包文件
   原始文件：lodash/index.js (内容: "module.exports = ...")
   
2. 计算内容哈希
   SHA-512("module.exports = ...") 
   -> 4d8f1a2b3c4d5e6f7890abcdef123456789...
   
3. 存储到CAS
   路径：~/.pnpm-store/v3/files/4d/8f/4d8f1a2b3c...
   
4. 创建硬链接
   项目/.pnpm/lodash@4.17.21/node_modules/lodash/index.js
   -> 硬链接到 4d8f1a2b3c...`
                        },
                        {
                            title: '目录结构详解',
                            code: `~/.pnpm-store/
├── v3/                    # store版本
│   ├── files/            # 文件存储（CAS）
│   │   ├── 00/          # 哈希前2位分组
│   │   │   ├── 1a/      # 哈希第3-4位分组
│   │   │   │   └── 001a2b3c4d...-exec  # 可执行文件
│   │   │   └── 2b/
│   │   │       └── 002b3c4d...         # 普通文件
│   │   ├── 01/
│   │   └── ...
│   └── tmp/              # 临时文件
└── lock/                 # 锁文件`,
                            content: '使用两级目录分组（前2位+第3-4位）避免单个目录文件过多。'
                        },
                        {
                            title: 'CAS优势',
                            points: [
                                '去重：相同内容只存一份',
                                '完整性：哈希验证确保内容未被篡改',
                                '并发安全：基于内容寻址，无冲突',
                                '可追溯：从哈希可验证原始内容'
                            ],
                            code: `// 实际案例
// lodash@4.17.20 的 index.js
// lodash@4.17.21 的 index.js
// 如果内容完全相同，哈希值相同
// 两个版本共享同一个文件！

// 验证文件完整性
pnpm store verify
# 计算所有文件哈希，对比文件名
# 发现篡改会报错`
                        },
                        {
                            title: 'pnpm vs Git',
                            code: `// Git也使用CAS
.git/objects/
  4d/
    8f1a2b3c...  # Git对象，按内容哈希存储
    
// pnpm借鉴了Git的思想
~/.pnpm-store/v3/files/
  4d/
    8f/
      4d8f1a2b3c...  # 包文件，按内容哈希存储
      
# 核心思想相同：
# 1. 内容 -> 哈希
# 2. 哈希 -> 存储地址
# 3. 相同内容去重`,
                            content: 'pnpm的CAS设计深受Git启发。'
                        }
                    ]
                },
                source: 'pnpm官方文档 - Store Structure'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目5：node_modules结构对比',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['node_modules', '结构对比'],
                question: '下面哪个描述正确地说明了pnpm的node_modules结构？',
                options: [
                    'pnpm的node_modules是完全平铺的，所有依赖在同一层级',
                    'pnpm的node_modules顶层只有直接依赖的符号链接，真实文件在.pnpm目录',
                    'pnpm不创建node_modules，直接从全局store读取',
                    'pnpm的node_modules结构和npm完全相同'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm的node_modules结构',
                    description: 'pnpm创新性地设计了三层结构：顶层符号链接 + 虚拟store + 全局store。',
                    sections: [
                        {
                            title: 'npm/yarn的平铺结构',
                            code: `// npm/yarn (扁平化提升)
node_modules/
├── react/              # 直接依赖
│   └── package.json
├── react-dom/          # 直接依赖
│   └── package.json
├── scheduler/          # react依赖（被提升）
│   └── package.json
└── loose-envify/       # react依赖（被提升）
    └── package.json

// 问题：
// 1. 所有传递依赖都在顶层
// 2. 可以require('scheduler') 即使没声明
// 3. 幽灵依赖风险`,
                            content: 'npm/yarn将传递依赖提升到顶层，导致幽灵依赖。'
                        },
                        {
                            title: 'pnpm的三层结构',
                            code: `// pnpm (非平铺 + 符号链接)
node_modules/
├── react -> .pnpm/react@18.2.0/node_modules/react
├── react-dom -> .pnpm/react-dom@18.2.0/node_modules/react-dom
└── .pnpm/
    ├── react@18.2.0/
    │   └── node_modules/
    │       ├── react/           # 真实文件（硬链接到store）
    │       ├── loose-envify -> ../../loose-envify@1.4.0/...
    │       └── scheduler -> ../../scheduler@0.23.0/...
    ├── react-dom@18.2.0/
    │   └── node_modules/
    │       ├── react-dom/
    │       ├── react -> ../../react@18.2.0/...
    │       └── scheduler -> ../../scheduler@0.23.0/...
    ├── scheduler@0.23.0/
    │   └── node_modules/scheduler/
    └── loose-envify@1.4.0/
        └── node_modules/loose-envify/

// 第1层：顶层符号链接（用户可见）
// 第2层：.pnpm虚拟store（依赖关系）
// 第3层：全局store（真实文件）`,
                            content: 'pnpm通过三层结构既保证严格性又保证兼容性。'
                        },
                        {
                            title: '为什么需要.pnpm目录',
                            code: `// 如果没有.pnpm，直接符号链接到store
node_modules/
└── react -> ~/.pnpm-store/.../react/

// 问题：
// react内部：require('loose-envify')
// Node.js查找路径：
// 1. ~/.pnpm-store/.../react/node_modules/
// 2. ~/.pnpm-store/node_modules/  (不存在)
// ❌ 找不到依赖！

// 有了.pnpm目录
node_modules/.pnpm/react@18.2.0/
└── node_modules/
    ├── react/              # 真实包
    └── loose-envify -> ... # 依赖的符号链接
    
// react内部：require('loose-envify')
// Node.js查找路径：
// 1. .pnpm/react@18.2.0/node_modules/  (✅ 找到)
// ✅ 成功！`,
                            content: '.pnpm目录是虚拟store，维护正确的依赖关系。'
                        },
                        {
                            title: '优势总结',
                            points: [
                                '严格性：顶层只有直接依赖，无幽灵依赖',
                                '兼容性：符合Node.js模块查找算法',
                                '性能：硬链接到全局store，节省空间',
                                '可调试：结构清晰，依赖关系明确'
                            ]
                        }
                    ]
                },
                source: 'pnpm官方文档 - node_modules structure'
            }
        },
        
        // 中等题 4 - 多选题
        {
            type: 'quiz',
            title: '题目6：pnpm的性能优化',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['性能优化', '多选题'],
                question: 'pnpm相比npm/yarn实现性能优化的技术手段有哪些？',
                options: [
                    '全局内容寻址存储，避免重复下载',
                    '硬链接复用文件，避免重复拷贝',
                    '并行安装依赖包',
                    '使用Go语言重写核心模块'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'pnpm的性能优化技术',
                    description: 'pnpm通过存储优化、链接优化、并行优化实现了极致性能。',
                    sections: [
                        {
                            title: '优化1：全局CAS Store',
                            code: `// npm/yarn每次都下载
npm install lodash  # 下载到项目A
npm install lodash  # 下载到项目B (重复下载)
npm install lodash  # 下载到项目C (重复下载)

// pnpm使用全局store
pnpm add lodash     # 下载到全局store
pnpm add lodash     # 从store硬链接 (无需下载)
pnpm add lodash     # 从store硬链接 (无需下载)

// 性能提升
- 首次安装：与npm相当
- 重复安装：几乎瞬间完成
- 网络流量：大幅减少`,
                            content: '相同版本的包只下载一次，后续安装从本地store链接。'
                        },
                        {
                            title: '优化2：硬链接零拷贝',
                            code: `// npm/yarn拷贝文件
npm install
# 1. 下载到缓存 ~/.npm/_cacache/
# 2. 解压到 node_modules/
# 3. 拷贝文件（I/O密集）

// pnpm硬链接
pnpm install
# 1. 下载到store ~/.pnpm-store/
# 2. 创建硬链接到项目 (几乎无开销)

// 性能对比
# 100个包，每个1MB
npm:  100MB下载 + 100MB拷贝 = 200MB I/O
pnpm: 100MB下载 + 硬链接 = 100MB I/O + 少量元数据`,
                            content: '硬链接避免文件拷贝，节省50%的磁盘I/O。'
                        },
                        {
                            title: '优化3：并行安装',
                            code: `// npm v6及以前（串行）
1. 解析依赖树
2. 下载 packageA
3. 下载 packageB  
4. 下载 packageC
...

// pnpm（并行 + 流式）
1. 解析依赖树（同时开始下载）
2. 并行下载多个包
   ├── packageA (下载中)
   ├── packageB (下载中) 
   └── packageC (下载中)
3. 边下载边链接

// 配置并发数
pnpm install --network-concurrency=20`,
                            content: 'pnpm默认并行安装，充分利用网络和CPU资源。'
                        },
                        {
                            title: '性能测试结果',
                            code: `// 实际测试（React项目，~300个依赖）

场景1：首次安装（无缓存）
npm:     45秒
yarn:    35秒  
pnpm:    30秒  ⚡

场景2：已有缓存
npm:     25秒
yarn:    15秒
pnpm:    8秒   ⚡⚡

场景3：已在其他项目安装过（store已有）
npm:     25秒
yarn:    15秒
pnpm:    2秒   ⚡⚡⚡ (硬链接)

磁盘占用（10个相似项目）
npm:     2.5GB
yarn:    2.3GB
pnpm:    800MB  ⚡⚡⚡ (节省65%)`,
                            content: 'pnpm在重复安装场景下具有压倒性优势。'
                        }
                    ]
                },
                source: 'pnpm官方文档 - Benchmarks'
            }
        },
        
        // 困难题 1 - 代码题
        {
            type: 'quiz-code',
            title: '题目7：依赖解析深度',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['依赖解析', '深度理解'],
                question: '观察以下代码，pnpm如何处理不同包依赖同一个包的不同版本？',
                code: `// package.json
{
  "dependencies": {
    "packageA": "1.0.0",
    "packageB": "1.0.0"
  }
}

// packageA依赖
{
  "dependencies": {
    "lodash": "4.17.20"
  }
}

// packageB依赖
{
  "dependencies": {
    "lodash": "4.17.21"
  }
}`,
                options: [
                    '只安装一个版本，提升到根node_modules',
                    '在.pnpm中为每个版本创建独立目录，通过符号链接提供正确版本',
                    '报错，要求用户手动解决版本冲突',
                    '自动升级到最新版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm的版本管理策略',
                    description: 'pnpm通过.pnpm虚拟store的目录结构精确管理每个包的依赖版本。',
                    sections: [
                        {
                            title: 'npm/yarn的处理（版本提升）',
                            code: `// npm/yarn会尝试提升
node_modules/
├── packageA/
├── packageB/
├── lodash/           # 4.17.21 (提升的是哪个版本不确定)
└── packageA/
    └── node_modules/
        └── lodash/   # 4.17.20 (未被提升的版本)
        
// 问题：
// 1. 提升哪个版本由安装顺序决定
// 2. 不同机器可能不一致
// 3. package-lock.json也可能不同`,
                            content: 'npm/yarn的提升策略有不确定性。'
                        },
                        {
                            title: 'pnpm的处理（精确版本）',
                            code: `// pnpm的结构
node_modules/
├── packageA -> .pnpm/packageA@1.0.0/node_modules/packageA
├── packageB -> .pnpm/packageB@1.0.0/node_modules/packageB
└── .pnpm/
    ├── packageA@1.0.0/
    │   └── node_modules/
    │       ├── packageA/    (真实文件)
    │       └── lodash -> ../../lodash@4.17.20/node_modules/lodash
    ├── packageB@1.0.0/
    │   └── node_modules/
    │       ├── packageB/    (真实文件)
    │       └── lodash -> ../../lodash@4.17.21/node_modules/lodash
    ├── lodash@4.17.20/
    │   └── node_modules/lodash/  (真实文件 -> 硬链接到store)
    └── lodash@4.17.21/
        └── node_modules/lodash/  (真实文件 -> 硬链接到store)

// packageA内部
require('lodash')  // -> .pnpm/lodash@4.17.20/... (✅ 4.17.20)

// packageB内部  
require('lodash')  // -> .pnpm/lodash@4.17.21/... (✅ 4.17.21)

// 顶层
require('lodash')  // ❌ Error (未在package.json中声明)`,
                            content: '每个包得到它声明的确切版本，完全隔离。'
                        },
                        {
                            title: '符号链接的路径解析',
                            code: `// packageA require('lodash')的查找过程

1. packageA的实际位置：
   node_modules/.pnpm/packageA@1.0.0/node_modules/packageA/

2. Node.js查找lodash：
   先查找：.../packageA@1.0.0/node_modules/lodash
   -> 这是个符号链接
   -> 指向：../../lodash@4.17.20/node_modules/lodash
   
3. 最终找到：
   .pnpm/lodash@4.17.20/node_modules/lodash/
   
4. lodash的真实文件：
   这些文件是硬链接到：
   ~/.pnpm-store/v3/files/xx/xx/...`,
                            content: '多层符号链接确保每个包找到正确的依赖版本。'
                        },
                        {
                            title: '磁盘占用分析',
                            code: `// 两个lodash版本的磁盘占用

// 假设lodash@4.17.20 有100个文件 (1MB)
//      lodash@4.17.21 有101个文件 (1.01MB)
//      其中99个文件内容相同

// npm/yarn
项目/node_modules/lodash/          1MB
项目/node_modules/packageA/
  └── node_modules/lodash/          1.01MB
总计：2.01MB

// pnpm
~/.pnpm-store/v3/files/
  ├── ...  (99个相同文件，各1KB) = 99KB
  ├── ...  (1个4.17.20独有文件) = 1KB  
  └── ...  (2个4.17.21新文件) = 2KB
总计：102KB (仅存储不同的文件！)

项目/.pnpm/lodash@4.17.20/... (硬链接)
项目/.pnpm/lodash@4.17.21/... (硬链接)
额外开销：几乎为0`,
                            content: 'CAS + 硬链接实现文件级去重，进一步节省空间。'
                        },
                        {
                            title: '核心优势',
                            points: [
                                '确定性：每次安装结果完全相同',
                                '隔离性：每个包使用正确的依赖版本',
                                '节省空间：相同文件共享存储',
                                '兼容性：符合Node.js模块解析规范'
                            ]
                        }
                    ]
                },
                source: 'pnpm官方文档 - How peers are resolved'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目8：pnpm的局限性',
            content: {
                questionType: 'multiple',
                difficulty: 'hard',
                tags: ['局限性', '兼容性'],
                question: 'pnpm的严格依赖管理可能导致哪些兼容性问题？',
                options: [
                    '某些依赖幽灵依赖的老旧包可能无法运行',
                    'React Native等工具可能不支持符号链接',
                    '电子签名工具可能无法识别符号链接',
                    '无法在Windows系统上使用'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'pnpm的兼容性考虑',
                    description: 'pnpm的严格模式虽然更正确，但可能与一些不规范的工具冲突。',
                    sections: [
                        {
                            title: '问题1：依赖幽灵依赖的包',
                            code: `// 某个老包的代码
// package.json只声明了express
{
  "dependencies": {
    "express": "^4.0.0"
  }
}

// 但代码中使用了body-parser（express的依赖）
const bodyParser = require('body-parser');

// npm/yarn: ✅ 能运行
// body-parser被提升到根node_modules

// pnpm: ❌ 报错
// Error: Cannot find module 'body-parser'
// 因为没有在package.json中声明

// 解决方案1：修复包（推荐）
{
  "dependencies": {
    "express": "^4.0.0",
    "body-parser": "^1.20.0"  // 显式声明
  }
}

// 解决方案2：shamefully-hoist
.npmrc:
shamefully-hoist=true
# 类似npm，提升所有依赖（失去严格性优势）

// 解决方案3：public-hoist-pattern  
.npmrc:
public-hoist-pattern[]=body-parser
# 只提升特定包`,
                            content: '不规范的老包可能依赖幽灵依赖，需要修复或配置。'
                        },
                        {
                            title: '问题2：不支持符号链接的工具',
                            code: `// React Native Metro
// 问题：Metro bundler不完全支持符号链接
// 报错：Unable to resolve module

// 解决方案：
# .npmrc
node-linker=hoisted
# 使用npm风格的node_modules（放弃pnpm优势）

// Electron Builder
// 问题：打包时可能无法正确处理符号链接
// 解决方案：
package.json:
{
  "build": {
    "asar": false,  // 禁用asar打包
    "files": [
      "!node_modules/**/*",
      "node_modules/**/*"  // 显式包含
    ]
  }
}

// Docker
// 问题：COPY指令可能不复制符号链接目标
# Dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
# 确保复制.pnpm目录`,
                            content: '某些工具对符号链接支持不完善，需要特殊配置。'
                        },
                        {
                            title: '问题3：文件系统限制',
                            code: `// Windows
// 问题1：创建符号链接需要管理员权限
// 解决：pnpm v7+使用junction（不需要特权）

// 问题2：路径长度限制（260字符）
node_modules/.pnpm/very-long-package-name@1.0.0_
  peer-dep-1@1.0.0+peer-dep-2@1.0.0/node_modules/...
// 可能超过260字符限制

// 解决：
.npmrc:
modules-dir=node_modules  # 缩短路径
virtual-store-dir=.pnpm   # 默认值，已最短

// 部署/CI
// 问题：部分CI环境不支持硬链接
// 解决：使用copy模式
.npmrc:
package-import-method=copy
# 失去空间优势，但兼容性最好`,
                            content: '文件系统特性差异可能导致问题。'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '新项目：优先使用pnpm，享受严格性和性能',
                                '老项目迁移：先修复幽灵依赖问题',
                                'React Native/Electron：评估工具支持情况',
                                'CI/CD：测试部署流程的兼容性',
                                '混合方案：关键项目用pnpm，特殊项目用npm/yarn'
                            ]
                        }
                    ]
                },
                source: 'pnpm官方文档 - Limitations'
            }
        },
        
        // 困难题 3 - 代码题
        {
            type: 'quiz-code',
            title: '题目9：pnpm-lock.yaml解读',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['lockfile', '深度解析'],
                question: 'pnpm-lock.yaml中的dependencies和packages字段有什么区别？',
                code: `# pnpm-lock.yaml
lockfileVersion: 5.4

dependencies:
  react: 18.2.0
  react-dom: 18.2.0

packages:
  /loose-envify/1.4.0:
    resolution: {integrity: sha512-...}
    dependencies:
      js-tokens: 4.0.0
      
  /react-dom/18.2.0_react@18.2.0:
    resolution: {integrity: sha512-...}
    dependencies:
      loose-envify: 1.4.0
      react: 18.2.0
      scheduler: 0.23.0
    peerDependencies:
      react: ^18.2.0
      
  /react/18.2.0:
    resolution: {integrity: sha512-...}
    dependencies:
      loose-envify: 1.4.0`,
                options: [
                    'dependencies记录直接依赖，packages记录所有依赖',
                    'dependencies是包版本映射，packages是包的详细信息（依赖、校验等）',
                    'dependencies用于开发环境，packages用于生产环境',
                    '两者内容完全相同，只是格式不同'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm-lock.yaml深度解析',
                    description: 'pnpm-lock.yaml采用独特的结构，同时记录依赖图和包详情。',
                    sections: [
                        {
                            title: 'lockfile整体结构',
                            code: `# pnpm-lock.yaml完整结构
lockfileVersion: 5.4          # lockfile格式版本

dependencies:                 # 直接依赖版本映射
  package-name: version
  
devDependencies:             # 开发依赖版本映射
  package-name: version
  
packages:                    # 所有包的详细信息
  /package-name/version:
    resolution: {...}        # 来源和校验
    dependencies: {...}      # 依赖关系
    peerDependencies: {...}  # peer依赖
    ...`,
                            content: 'dependencies是顶层视图，packages是完整依赖图。'
                        },
                        {
                            title: 'dependencies字段',
                            code: `# dependencies: 直接依赖的版本映射
dependencies:
  react: 18.2.0              # 语义：安装18.2.0版本
  react-dom: 18.2.0_react@18.2.0  # 带peer依赖标识
  lodash: 4.17.21
  
devDependencies:
  @types/react: 18.0.26
  typescript: 4.9.4

# 作用：
# 1. 快速查看项目的直接依赖版本
# 2. 与package.json的依赖范围对应
# 3. 版本可能带后缀（peer依赖标识）`,
                            content: 'dependencies描述"我的项目依赖什么版本"。'
                        },
                        {
                            title: 'packages字段',
                            code: `# packages: 所有包的详细元数据
packages:
  # 包路径格式：/包名/版本[_peer依赖]
  /react/18.2.0:
    # 完整性校验（SHA-512）
    resolution: {
      integrity: sha512-/3IjMdb2L9QbBdWiW5e3P2/npwMBaU9mHCSCUzNln0ZCYbcfTsGbTJrU/kGemdH2IWmB2ioZ+zkxtmq6g09fGQ==
    }
    # npm注册表地址（可选）
    engines: {node: '>=0.10.0'}
    # 依赖关系
    dependencies:
      loose-envify: 1.4.0
    # 开发依赖
    dev: false
    
  /react-dom/18.2.0_react@18.2.0:
    resolution: {integrity: sha512-...}
    # peer依赖声明
    peerDependencies:
      react: ^18.2.0
    # 实际依赖
    dependencies:
      loose-envify: 1.4.0
      react: 18.2.0          # 满足peer依赖
      scheduler: 0.23.0`,
                            content: 'packages描述"每个包是什么、依赖什么"。'
                        },
                        {
                            title: 'peer依赖的处理',
                            code: `# 包名后缀表示peer依赖版本
# /package-name/version_peer1@ver1+peer2@ver2

/react-dom/18.2.0_react@18.2.0:
  # 表示：react-dom@18.2.0 配合 react@18.2.0
  peerDependencies:
    react: ^18.2.0
  dependencies:
    react: 18.2.0  # 实际使用的react版本

# 为什么需要后缀？
# 同一个包可能因为不同的peer依赖而实例化多次

# 例如：
/styled-components/5.3.6_react@18.2.0:
  # styled-components配合react 18
  
/styled-components/5.3.6_react@17.0.2:
  # 同样是5.3.6，但配合react 17
  # 这是两个不同的实例！`,
                            content: 'peer依赖后缀标识相同版本的不同实例。'
                        },
                        {
                            title: 'lockfile的作用',
                            code: `# 1. 确定性安装
# 相同的lockfile保证安装相同的依赖树
pnpm install --frozen-lockfile

# 2. 完整性验证
# 每个包都有integrity校验和
# 安装时验证文件未被篡改

# 3. 离线安装
# 有lockfile和store，可完全离线安装

# 4. 依赖分析
# 可以分析完整的依赖关系图
pnpm why lodash
# 查询lockfile找出所有依赖lodash的包

# 5. 冲突解决
# 记录如何解决版本冲突
# 例如：选择了哪个版本，如何满足peer依赖`,
                            content: 'lockfile是可重现构建的核心。'
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm-lock.yaml'
            }
        },
        
        // 困难题 4 - 综合题
        {
            type: 'quiz',
            title: '题目10：pnpm与Monorepo',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['Monorepo', '工作区'],
                question: 'pnpm在Monorepo项目中相比Yarn/Lerna的优势是什么？',
                options: [
                    'pnpm不支持Monorepo',
                    'pnpm的workspace功能更简单，且保留了硬链接优势',
                    'pnpm强制使用特定的目录结构',
                    'pnpm需要额外安装Lerna才能支持Monorepo'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm + Workspace = 极致Monorepo',
                    description: 'pnpm的workspace功能结合硬链接优势，为Monorepo提供最佳解决方案。',
                    sections: [
                        {
                            title: 'Monorepo的挑战',
                            code: `// Monorepo结构
monorepo/
├── packages/
│   ├── ui-components/
│   │   ├── package.json  (依赖react, lodash)
│   │   └── node_modules/
│   ├── utils/
│   │   ├── package.json  (依赖lodash)
│   │   └── node_modules/
│   └── app/
│       ├── package.json  (依赖ui-components, utils)
│       └── node_modules/

// 传统问题：
// 1. 每个包都安装lodash (重复)
// 2. 跨包依赖管理复杂
// 3. 安装时间 = n个包的总和
// 4. 磁盘占用 = n倍单个项目`,
                            content: 'Monorepo需要处理跨包依赖和重复安装问题。'
                        },
                        {
                            title: 'Yarn Workspaces的方案',
                            code: `// yarn的提升策略
monorepo/
├── package.json
├── node_modules/         # 提升到根目录
│   ├── react/           # 共享依赖
│   ├── lodash/          # 共享依赖
│   └── @monorepo/
│       ├── ui-components/  # 软链接到packages
│       └── utils/
└── packages/
    ├── ui-components/
    │   └── node_modules/   # 特定版本的依赖
    └── utils/
        └── node_modules/

// 问题：
// 1. 仍然有幽灵依赖
// 2. 提升规则复杂
// 3. 不同workspace可能看到不同版本
// 4. 磁盘占用较大`,
                            content: 'Yarn workspace通过提升共享依赖，但仍有问题。'
                        },
                        {
                            title: 'pnpm Workspace的方案',
                            code: `// pnpm-workspace.yaml
packages:
  - 'packages/*'
  
// pnpm的结构
monorepo/
├── pnpm-workspace.yaml
├── node_modules/
│   ├── @monorepo/
│   │   ├── ui-components -> ../packages/ui-components
│   │   └── utils -> ../packages/utils
│   └── .pnpm/
│       ├── react@18.2.0/...
│       └── lodash@4.17.21/...  # 全局只有一份！
└── packages/
    ├── ui-components/
    │   └── node_modules/  # 符号链接到根.pnpm
    └── utils/
        └── node_modules/  # 符号链接到根.pnpm

// 优势：
// 1. lodash只存储一次（硬链接到store）
// 2. 无幽灵依赖
// 3. workspace间依赖通过符号链接
// 4. 安装速度极快`,
                            content: 'pnpm的workspace保留硬链接优势，实现真正的零重复。'
                        },
                        {
                            title: '跨包依赖管理',
                            code: `// packages/app/package.json
{
  "dependencies": {
    "@monorepo/ui-components": "workspace:*",
    "@monorepo/utils": "workspace:^1.0.0"
  }
}

// workspace:协议
// workspace:*    - 任意版本（开发时）
// workspace:^    - 发布时转为semver
// workspace:~    - 发布时转为semver

// 安装后：
packages/app/node_modules/
  └── @monorepo/
      ├── ui-components -> ../../ui-components
      └── utils -> ../../utils

// 好处：
// 1. 开发时直接引用本地代码
// 2. 修改立即生效，无需重新link
// 3. 发布时自动转换为正常版本号
// 4. 类型提示完美支持`,
                            content: 'workspace:协议简化跨包依赖管理。'
                        },
                        {
                            title: '性能对比',
                            code: `// 实际测试（包含10个package的Monorepo）

场景：安装所有依赖

npm (无workspace):
  - 每个包独立安装
  - 时间: 240秒
  - 磁盘: 1.5GB

yarn workspaces:
  - 提升共享依赖
  - 时间: 80秒
  - 磁盘: 800MB

pnpm workspace:
  - 硬链接 + 符号链接
  - 时间: 25秒  ⚡⚡⚡
  - 磁盘: 250MB ⚡⚡⚡

场景：添加新package

yarn workspaces:
  - 重新提升依赖
  - 时间: 30秒

pnpm workspace:
  - 从store链接
  - 时间: 3秒   ⚡⚡⚡`,
                            content: 'pnpm在Monorepo场景具有10倍性能优势。'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '使用workspace:协议管理内部依赖',
                                '配置workspace过滤器提升效率',
                                '利用pnpm的并行执行能力',
                                '结合changesets管理版本发布',
                                'CI中使用frozen-lockfile确保一致性'
                            ],
                            code: `# 常用命令
# 为特定workspace安装依赖
pnpm add lodash --filter @monorepo/utils

# 在所有workspace中执行命令
pnpm -r run build

# 只运行修改过的package
pnpm --filter="...[origin/main]" run test

# 运行依赖图上游
pnpm --filter=...@monorepo/app run build`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Workspaces'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第20章：Yarn Berry高级特性',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=20'
        },
        next: {
            title: '第22章：pnpm基础使用',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=22'
        }
    }
};
