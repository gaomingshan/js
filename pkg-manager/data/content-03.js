/**
 * 第3章：包管理器工作原理
 * 深入理解包解析算法、安装流程、node_modules结构和链接机制
 */

window.content = {
    section: {
        title: '第3章：包管理器工作原理',
        icon: '⚙️'
    },
    
    topics: [
        {
            type: 'principle',
            title: 'npm install 工作流程',
            content: {
                description: '当执行npm install时，npm会经历一系列复杂的过程：解析依赖、检查缓存、下载包、解压、链接等步骤。',
                mechanism: 'npm首先读取package.json和package-lock.json，构建依赖树，检查本地缓存，从registry下载缺失的包，验证完整性，解压到node_modules，最后执行生命周期脚本。',
                keyPoints: [
                    '1. 读取配置：解析package.json和package-lock.json',
                    '2. 构建依赖树：根据版本范围解析依赖关系',
                    '3. 检查缓存：查找本地缓存目录（~/.npm）',
                    '4. 下载包：从registry下载缺失的包',
                    '5. 验证完整性：使用SHA校验包的完整性',
                    '6. 解压安装：将包解压到node_modules',
                    '7. 链接bin：创建可执行文件的软链接',
                    '8. 执行脚本：运行preinstall、install、postinstall脚本'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm install 命令详解',
            content: {
                description: 'npm install有多种用法和参数，理解这些参数可以更精确地控制安装行为。',
                examples: [
                    {
                        title: '基本安装命令',
                        code: `# 安装所有dependencies和devDependencies
npm install

# 只安装dependencies（生产环境）
npm install --production
npm install --omit=dev

# 安装并保存到dependencies
npm install lodash --save
npm install lodash  # npm 5+默认--save

# 安装并保存到devDependencies
npm install eslint --save-dev
npm install eslint -D`,
                        notes: 'npm 5+默认会保存到package.json'
                    },
                    {
                        title: '其他安装参数',
                        code: `# 全局安装
npm install -g typescript

# 安装指定版本
npm install lodash@4.17.20

# 从GitHub安装
npm install user/repo
npm install user/repo#branch

# 从本地目录安装
npm install ../my-package
npm install file:../my-package

# 强制重新安装
npm install --force

# 使用离线模式
npm install --offline

# 忽略脚本
npm install --ignore-scripts`,
                        notes: '各种安装场景的命令参数'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖解析算法',
            content: {
                description: '包管理器使用特定的算法来解析依赖关系，确定应该安装哪些包以及它们的版本，这个过程称为依赖解析（Dependency Resolution）。',
                mechanism: 'npm使用深度优先遍历算法构建依赖树，对于每个包，根据版本范围从registry获取可用版本列表，选择符合条件的最新版本。如果存在冲突，尝试扁平化安装；无法扁平化则嵌套安装。',
                keyPoints: [
                    '版本选择：在满足semver范围的版本中选择最新的',
                    '冲突检测：检查是否存在版本冲突（A依赖B@1.x，C依赖B@2.x）',
                    '去重优化：相同版本的包只下载一次',
                    '扁平化：尽可能将依赖提升到顶层node_modules',
                    '嵌套安装：冲突的版本安装在各自的node_modules下',
                    'peer dependencies：检查宿主环境是否满足要求',
                    '确定性：使用锁文件确保每次安装结果一致'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '扁平化 vs 嵌套安装',
            content: {
                description: 'npm经历了从嵌套安装（npm 2.x）到扁平化安装（npm 3+）的演变，两种方式各有优劣。',
                items: [
                    {
                        name: '嵌套安装（npm 2.x）',
                        pros: [
                            '依赖关系清晰，每个包有自己的node_modules',
                            '不会出现幽灵依赖问题',
                            '版本冲突处理简单'
                        ],
                        cons: [
                            '目录层级过深，Windows路径长度限制',
                            '重复安装，浪费磁盘空间',
                            '安装速度慢',
                            '依赖地狱问题严重'
                        ]
                    },
                    {
                        name: '扁平化安装（npm 3+）',
                        pros: [
                            '目录层级浅，避免路径过长',
                            '减少重复安装，节省空间',
                            '安装速度更快'
                        ],
                        cons: [
                            '幽灵依赖：可以访问未声明的依赖',
                            '依赖提升顺序不确定',
                            '不同机器可能产生不同的node_modules结构',
                            '删除包可能影响其他包'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖提升（Hoisting）',
            content: {
                description: '依赖提升是npm 3+的核心特性，将间接依赖提升到项目根目录的node_modules，减少重复安装和目录深度。',
                mechanism: 'npm按照package.json中依赖的声明顺序安装，第一个被安装的包的依赖会被提升到顶层。后续如果遇到版本冲突，则嵌套安装在各自包的node_modules下。',
                keyPoints: [
                    '提升规则：第一个安装的版本被提升到顶层',
                    '版本冲突：不兼容的版本嵌套安装',
                    '非确定性：依赖声明顺序影响最终结构',
                    '幽灵依赖：可以require未在package.json中声明的包',
                    'pnpm方案：使用符号链接，严格隔离依赖，避免幽灵依赖',
                    'Yarn PnP：不使用node_modules，用映射文件记录依赖'
                ]
            }
        },
        
        {
            type: 'concept',
            title: '幽灵依赖（Phantom Dependencies）',
            content: {
                description: '幽灵依赖是指项目中可以使用但未在package.json中声明的依赖包，这是扁平化安装的副作用。',
                keyPoints: [
                    '产生原因：依赖提升使得间接依赖暴露在顶层',
                    '潜在风险：依赖包可能在不知情的情况下被移除',
                    '版本不确定：依赖包版本可能随时变化',
                    '难以追踪：不清楚这些包是从哪里来的',
                    'pnpm解决：使用严格的目录结构，只能访问声明的依赖',
                    '最佳实践：显式声明所有使用的依赖'
                ]
            }
        },
        
        {
            type: 'principle',
            title: '符号链接与硬链接',
            content: {
                description: 'pnpm使用硬链接和符号链接来实现高效的包管理，理解这两种链接方式是理解pnpm工作原理的关键。',
                mechanism: 'pnpm将所有包存储在全局store（~/.pnpm-store），项目中的node_modules通过硬链接指向store中的文件。实际引用通过符号链接构建正确的依赖关系。',
                keyPoints: [
                    '硬链接（Hard Link）：指向文件系统中同一数据的多个路径',
                    '符号链接（Symbolic Link）：指向另一个文件路径的引用',
                    'pnpm store：全局存储，所有版本的包只存储一次',
                    'node_modules/.pnpm：扁平化存储，包含所有依赖',
                    '项目node_modules：通过符号链接指向.pnpm',
                    '空间节省：硬链接不占用额外空间，所有项目共享store',
                    '安装速度：已在store中的包无需下载，直接链接'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm内容寻址存储',
            content: {
                description: 'pnpm使用内容寻址存储（Content-Addressable Storage），基于文件内容的hash来存储和索引包。',
                examples: [
                    {
                        title: 'pnpm store结构',
                        code: `~/.pnpm-store/
└── v3/
    └── files/
        ├── 00/
        │   └── 1a2b3c... (文件内容hash)
        ├── 01/
        └── ...

# 项目node_modules结构
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash -> <store中的硬链接>
│   └── react@18.2.0/
│       └── node_modules/
│           └── react -> <store中的硬链接>
└── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
└── react -> .pnpm/react@18.2.0/node_modules/react`,
                        notes: 'store按内容hash存储，项目中通过链接访问'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'node_modules结构对比',
            content: {
                description: '不同包管理器生成的node_modules结构差异很大，了解这些差异有助于理解各自的优缺点。',
                items: [
                    {
                        name: 'npm/yarn（扁平化）',
                        pros: [
                            '所有包在顶层，查找快',
                            '兼容性好，工具支持广泛'
                        ],
                        cons: [
                            '幽灵依赖问题',
                            '重复安装浪费空间',
                            '结构不确定性'
                        ]
                    },
                    {
                        name: 'pnpm（硬链接+符号链接）',
                        pros: [
                            '严格的依赖隔离',
                            '节省磁盘空间',
                            '安装速度快',
                            '避免幽灵依赖'
                        ],
                        cons: [
                            '符号链接在某些系统上有限制',
                            '某些工具可能不兼容',
                            '调试时需要理解链接结构'
                        ]
                    },
                    {
                        name: 'Yarn PnP（映射文件）',
                        pros: [
                            '不生成node_modules',
                            '安装速度最快',
                            'Zero-Install可能'
                        ],
                        cons: [
                            '兼容性问题多',
                            '需要IDE支持',
                            '学习曲线陡峭'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Yarn PnP工作原理',
            content: {
                description: 'Yarn 2+的Plug\'n\'Play（PnP）模式彻底改变了传统的包管理方式，不再生成node_modules目录。',
                mechanism: 'Yarn PnP生成.pnp.cjs文件，其中包含了所有包的位置和依赖关系映射。Node.js运行时通过这个文件直接定位包，不需要遍历node_modules。',
                keyPoints: [
                    '无node_modules：包存储在.yarn/cache目录',
                    '.pnp.cjs：包含所有依赖的映射关系',
                    'Zero-Install：可以将cache提交到Git，无需npm install',
                    '严格模式：只能访问声明的依赖，杜绝幽灵依赖',
                    'IDE集成：需要编辑器安装PnP SDK',
                    '兼容性：某些native模块和工具可能不支持',
                    '性能优势：跳过node_modules查找，解析速度快'
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '包管理器工作原理最佳实践',
            content: {
                description: '理解包管理器的工作原理后，可以更好地优化项目配置和解决问题。',
                keyPoints: [
                    '选择合适的包管理器：根据项目需求选择npm/yarn/pnpm',
                    '理解node_modules结构：有助于调试依赖问题',
                    '避免幽灵依赖：显式声明所有使用的包',
                    '定期清理缓存：npm cache clean --force',
                    '使用.npmrc配置：统一团队的npm配置',
                    'CI/CD优化：使用缓存加速安装过程',
                    '监控依赖大小：使用webpack-bundle-analyzer等工具',
                    '了解锁文件：理解package-lock.json的重要性'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第2章：模块化与依赖管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=02'
        },
        next: {
            title: '第4章：registry与镜像源',
            url: './render.html?subject=pkg-manager&type=content&chapter=04'
        }
    }
};
