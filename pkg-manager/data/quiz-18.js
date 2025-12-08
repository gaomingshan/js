/**
 * 第18章：Yarn Workspaces - 面试题
 * 10道精选面试题：测试对Yarn Workspaces monorepo管理的掌握
 */

window.content = {
    section: {
        title: '第18章：Yarn Workspaces - 面试题',
        icon: '🔵'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：Yarn Workspaces基础',
            content: {
                difficulty: 'easy',
                tags: ['Workspaces', 'Monorepo'],
                question: 'Yarn Workspaces的主要优势是什么？',
                options: [
                    '提高单个包的安装速度',
                    '在monorepo中管理多个包，共享依赖',
                    '自动发布包到npm',
                    '压缩代码减小体积'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn Workspaces功能',
                    description: 'Yarn Workspaces是Yarn 1引入的monorepo管理方案，npm后来也借鉴了这一设计。',
                    sections: [
                        {
                            title: '核心功能',
                            points: [
                                'Monorepo管理：一个仓库管理多个相关包',
                                '依赖提升：共享依赖到根node_modules',
                                '自动链接：工作区间自动link',
                                '统一安装：一次yarn install安装所有依赖'
                            ],
                            code: '// 项目结构\nmy-monorepo/\n├── package.json           # 根配置\n├── packages/\n│   ├── app/              # 应用\n│   ├── components/       # 组件库\n│   └── utils/            # 工具库\n└── node_modules/         # 共享依赖'
                        },
                        {
                            title: '配置Workspaces',
                            code: '// 根package.json\n{\n  "private": true,  // 必须设置为true\n  "workspaces": [\n    "packages/*"    // 工作区路径\n  ]\n}\n\n// packages/app/package.json\n{\n  "name": "@myorg/app",\n  "dependencies": {\n    "@myorg/utils": "1.0.0",  // 自动link到本地\n    "react": "^18.0.0"        // 提升到根node_modules\n  }\n}'
                        },
                        {
                            title: '优势对比',
                            code: '// 传统多仓库 (Multirepo)\nrepo-app/\n├── node_modules/  (200MB)\nrepo-utils/\n├── node_modules/  (150MB)  // 重复依赖\nrepo-components/\n├── node_modules/  (180MB)\n// 总计：530MB，重复严重\n\n// Workspaces (Monorepo)\nmonorepo/\n├── node_modules/  (220MB)  // 共享依赖\n├── packages/app/\n├── packages/utils/\n└── packages/components/\n// 总计：220MB，节省58%',
                            content: 'Workspaces显著减少磁盘占用和安装时间。'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 简单题 2 - 多选题
        {
            type: 'quiz',
            title: '题目2：Workspaces配置',
            content: {
                difficulty: 'easy',
                tags: ['配置', '多选题'],
                question: '关于Yarn Workspaces配置，以下说法正确的是？',
                options: [
                    '根package.json必须设置"private": true',
                    'workspaces字段可以使用glob模式',
                    '每个工作区必须有自己的package.json',
                    'workspaces只能配置一个目录'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'Workspaces配置详解',
                    description: 'Yarn Workspaces需要正确配置才能发挥作用。',
                    sections: [
                        {
                            title: '必须private: true',
                            code: '// ✅ 正确配置\n{\n  "private": true,  // 必须！\n  "workspaces": ["packages/*"]\n}\n\n// ❌ 错误配置\n{\n  // 缺少private: true\n  "workspaces": ["packages/*"]\n}\n// 运行yarn install会报错',
                            content: '原因：根package.json通常不是一个可发布的包，设置private防止意外发布。'
                        },
                        {
                            title: 'Glob模式',
                            code: '// 支持多种glob模式\n{\n  "workspaces": [\n    "packages/*",     // 匹配packages下所有目录\n    "apps/*",         // 多个目录\n    "tools/cli"       // 精确路径\n  ]\n}\n\n// 排除某些目录\n{\n  "workspaces": [\n    "packages/*",\n    "!packages/legacy"  // 排除\n  ]\n}\n\n// 嵌套匹配\n{\n  "workspaces": [\n    "packages/**"  // 匹配所有嵌套目录\n  ]\n}'
                        },
                        {
                            title: '工作区package.json',
                            code: '// 每个工作区必须有package.json\npackages/app/package.json:\n{\n  "name": "@myorg/app",     // 必须有name\n  "version": "1.0.0",       // 建议有version\n  "dependencies": {...}\n}\n\n// ❌ 错误：目录下没有package.json\npackages/some-dir/\n└── index.js  # 没有package.json，不会被识别为工作区'
                        },
                        {
                            title: '关于选项D',
                            content: '❌ 不正确：workspaces可以配置多个目录。',
                            code: '// ✅ 可以配置多个\n{\n  "workspaces": [\n    "packages/*",\n    "apps/*",\n    "tools/*"\n  ]\n}'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：工作区命令',
            content: {
                difficulty: 'easy',
                tags: ['命令', 'workspace参数'],
                question: '如何在特定工作区运行命令？',
                options: [
                    'cd packages/app && yarn build',
                    'yarn workspace @myorg/app run build',
                    'yarn run build --workspace=app',
                    'A和B都可以'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'Yarn Workspaces命令执行',
                    description: 'Yarn提供了多种方式在工作区运行命令。',
                    sections: [
                        {
                            title: '方式1：进入目录',
                            code: '// 传统方式\ncd packages/app\nyarn build\n\n// 优点：\n- 简单直观\n- 任何yarn命令都可用\n\n// 缺点：\n- 需要切换目录\n- 脚本中不方便'
                        },
                        {
                            title: '方式2：yarn workspace',
                            code: '// 从根目录运行\nyarn workspace @myorg/app run build\n\n// 语法：\nyarn workspace <workspace-name> <command>\n\n// 示例：\nyarn workspace @myorg/app add lodash\nyarn workspace @myorg/utils test\nyarn workspace @myorg/components run dev',
                            points: [
                                '无需切换目录',
                                '使用包名（name字段）',
                                '适合脚本和CI',
                                'Yarn Classic特有语法'
                            ]
                        },
                        {
                            title: '批量运行',
                            code: '// 在所有工作区运行\nyarn workspaces run build\n\n// 等价于：\ncd packages/app && yarn build\ncd packages/utils && yarn build\ncd packages/components && yarn build\n\n// ⚠️ 并行执行，无特定顺序'
                        },
                        {
                            title: 'Yarn Berry的变化',
                            code: '// Yarn 1 (Classic)\nyarn workspace @myorg/app run build\n\n// Yarn Berry (2+)\nyarn workspace @myorg/app build  // 不需要run\n\n// 批量运行\nyarn workspaces foreach run build  // Berry语法'
                        }
                    ]
                },
                source: 'Yarn CLI文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：依赖提升',
            content: {
                difficulty: 'medium',
                tags: ['依赖提升', 'hoisting'],
                question: '以下场景中，lodash会被安装在哪里？',
                code: `// packages/app/package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// packages/utils/package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}`,
                options: [
                    '安装两份：packages/app/node_modules和packages/utils/node_modules',
                    '只安装在根node_modules/',
                    '安装在packages/app/node_modules，utils通过link访问',
                    '需要手动配置才会提升'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn Workspaces依赖提升机制',
                    description: 'Workspaces会智能提升共同依赖到根目录。',
                    sections: [
                        {
                            title: '提升原理',
                            code: '// 安装后的结构\nmonorepo/\n├── node_modules/\n│   └── lodash/  # 4.17.21 (提升)\n├── packages/\n│   ├── app/\n│   │   └── node_modules/  # 空或只有特殊依赖\n│   └── utils/\n│       └── node_modules/  # 空或只有特殊依赖\n\n// 两个工作区require(\'lodash\'):\n// 1. 先查找本地node_modules（没有）\n// 2. 向上查找根node_modules（找到）\n// 3. 使用相同的lodash',
                            points: [
                                '相同版本自动提升',
                                '避免重复安装',
                                '节省磁盘空间',
                                '提高安装速度'
                            ]
                        },
                        {
                            title: '版本冲突处理',
                            code: '// 场景：不同版本\n// packages/app需要4.17.21\n// packages/utils需要4.16.0\n\n// 结果结构\nmonorepo/\n├── node_modules/\n│   └── lodash/  # 4.17.21 (更常用的提升)\n├── packages/\n│   └── utils/\n│       └── node_modules/\n│           └── lodash/  # 4.16.0 (冲突版本)\n\n// Yarn策略：\n// 1. 提升一个版本到根（通常是更新的）\n// 2. 冲突版本安装在工作区本地',
                            content: 'Yarn智能处理版本冲突，最小化重复。'
                        },
                        {
                            title: '查看提升结果',
                            code: '// 查看依赖树\nyarn workspaces info\n# 输出JSON，显示所有工作区和依赖\n\n// 或使用yarn why\nyarn why lodash\n# 显示lodash的所有安装位置\n\n// 列出所有工作区\nyarn workspaces list'
                        },
                        {
                            title: '提升的优缺点',
                            code: '// ✅ 优点\n- 节省磁盘空间\n- 减少安装时间\n- 统一依赖版本\n- 简化依赖管理\n\n// ❌ 潜在问题\n- 幽灵依赖（Phantom Dependency）\n- 工作区可能访问未声明的依赖\n\n// 例如：\n// packages/app没有声明lodash\n// 但可以require(\'lodash\')（因为utils依赖了）\n// 如果utils移除lodash，app会崩溃\n\n// 解决方案：\n// - pnpm（严格模式）\n// - 使用linter检测（depcheck）',
                            content: '提升带来便利，但需要注意幽灵依赖问题。'
                        }
                    ]
                },
                source: 'Yarn Workspaces文档'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：nohoist配置',
            content: {
                difficulty: 'medium',
                tags: ['nohoist', '提升控制'],
                question: 'Yarn的nohoist配置用于什么场景？',
                options: [
                    '加速依赖安装',
                    '阻止特定依赖被提升到根node_modules',
                    '自动更新依赖版本',
                    '压缩依赖体积'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'nohoist配置详解',
                    description: 'nohoist允许精确控制依赖提升行为，解决特殊兼容性问题。',
                    sections: [
                        {
                            title: 'nohoist的用途',
                            content: '某些依赖不能被提升：',
                            points: [
                                'React Native依赖（metro bundler限制）',
                                'Electron原生模块（路径敏感）',
                                '某些babel插件（相对路径）',
                                '工具依赖（需要特定位置）'
                            ],
                            code: '// 问题场景：React Native\n// metro bundler期望依赖在本地node_modules\n// 如果提升到根，会找不到\n\n// 解决：使用nohoist'
                        },
                        {
                            title: 'nohoist配置方式',
                            code: '// 根package.json\n{\n  "workspaces": {\n    "packages": ["packages/*"],\n    "nohoist": [\n      "**/react-native",        // 所有工作区的react-native\n      "**/react-native/**",     // react-native的所有依赖\n      "**/@react-native-community/**"\n    ]\n  }\n}\n\n// 或在特定工作区配置\n// packages/mobile/package.json\n{\n  "workspaces": {\n    "nohoist": [\n      "react-native",\n      "react-native/**"\n    ]\n  }\n}',
                            content: 'nohoist使用glob模式匹配要阻止提升的包。'
                        },
                        {
                            title: 'nohoist模式',
                            code: '// 模式说明\n"**/package-name"        // 所有工作区的package-name\n"workspace/package-name"  // 特定工作区的package-name\n"**/package-name/**"      // package-name的所有依赖\n\n// 示例\n{\n  "nohoist": [\n    "**/react-native",           // 不提升任何react-native\n    "mobile/babel-**",           // mobile工作区的所有babel包\n    "**/react-native/**"         // react-native的传递依赖\n  ]\n}'
                        },
                        {
                            title: '效果对比',
                            code: '// 默认（提升）\nroot/\n├── node_modules/\n│   └── react-native/  # 提升\n└── packages/mobile/\n    └── node_modules/  # 空\n\n// 使用nohoist\nroot/\n├── node_modules/     # react-native不在这\n└── packages/mobile/\n    └── node_modules/\n        └── react-native/  # 保留在本地',
                            content: 'nohoist精确控制特定包的安装位置。'
                        },
                        {
                            title: '常见nohoist配置',
                            code: '// React Native项目\n{\n  "nohoist": [\n    "**/react-native",\n    "**/react-native/**",\n    "**/@react-native-community/**"\n  ]\n}\n\n// Electron项目\n{\n  "nohoist": [\n    "**/electron",\n    "**/electron-**"\n  ]\n}\n\n// Babel配置\n{\n  "nohoist": [\n    "**/@babel/**"\n  ]\n}'
                        },
                        {
                            title: 'Yarn Berry的变化',
                            content: 'Yarn Berry (2+)废弃了nohoist：\n- PnP模式没有提升概念\n- node-modules模式提升算法改进\n- 推荐使用pnpm（更好的控制）',
                            code: '// Yarn Berry不需要nohoist\n// 改用installConfig控制\n// .yarnrc.yml\nnodeLinker: node-modules\nnmMode: hardlinks-local'
                        }
                    ]
                },
                source: 'Yarn Workspaces文档'
            }
        },
        
        // 中等题 3 - 多选题
        {
            type: 'quiz',
            title: '题目6：工作区间依赖',
            content: {
                difficulty: 'medium',
                tags: ['工作区依赖', '多选题'],
                question: '在Yarn Workspaces中，如何正确引用其他工作区？',
                options: [
                    '在package.json中声明依赖，使用包名',
                    '直接使用相对路径import',
                    '版本号可以使用"*"或具体版本',
                    'Yarn会自动创建符号链接'
                ],
                correctAnswer: [0, 2, 3],
                explanation: {
                    title: '工作区间依赖管理',
                    description: 'Yarn Workspaces提供了优雅的跨工作区依赖方案。',
                    sections: [
                        {
                            title: '正确的依赖声明',
                            code: '// packages/app/package.json\n{\n  "name": "@myorg/app",\n  "dependencies": {\n    "@myorg/utils": "*",      // 方式1：通配符\n    "@myorg/components": "1.0.0"  // 方式2：具体版本\n  }\n}\n\n// packages/utils/package.json\n{\n  "name": "@myorg/utils",\n  "version": "1.0.0"\n}\n\n// ✅ 运行yarn install后\n// node_modules/@myorg/utils -> ../../packages/utils',
                            points: [
                                '使用包的name字段',
                                '不是目录名，是package.json中的name',
                                '自动创建符号链接',
                                '修改实时生效'
                            ]
                        },
                        {
                            title: '版本号选择',
                            code: '// 方式1：通配符（推荐）\n{\n  "dependencies": {\n    "@myorg/utils": "*"  // 匹配任何版本\n  }\n}\n// 优点：不需要每次更新版本号\n// 缺点：发布时需要替换为具体版本\n\n// 方式2：具体版本\n{\n  "dependencies": {\n    "@myorg/utils": "1.0.0"\n  }\n}\n// 优点：明确版本依赖\n// 缺点：工作区版本更新后需要同步\n\n// 方式3：范围（不推荐）\n{\n  "dependencies": {\n    "@myorg/utils": "^1.0.0"\n  }\n}\n// 本地开发时总是使用工作区版本，范围无意义',
                            content: '开发时推荐使用"*"，发布时使用工具替换为具体版本。'
                        },
                        {
                            title: '符号链接机制',
                            code: '// yarn install后的node_modules\nnode_modules/\n└── @myorg/\n    ├── utils -> ../../packages/utils  # 符号链接\n    └── components -> ../../packages/components\n\n// 检查链接\nls -la node_modules/@myorg/\n# lrwxr-xr-x  utils -> ../../packages/utils\n\n// 代码中使用\n// packages/app/src/index.js\nimport { helper } from \'@myorg/utils\';  // 实际访问本地文件\n\n// 修改utils/src/index.js\n// app中立即生效（无需重新安装）',
                            content: 'Yarn自动创建和维护符号链接，开发体验流畅。'
                        },
                        {
                            title: '关于选项B（相对路径）',
                            content: '❌ 不推荐直接使用相对路径：',
                            code: '// ❌ 不要这样\nimport { helper } from \'../../utils/src/index.js\';\n\n// 问题：\n// - 路径硬编码\n// - 重构困难\n// - 工具链支持差\n// - 发布时需要修改\n\n// ✅ 应该这样\nimport { helper } from \'@myorg/utils\';\n\n// 优点：\n// - 清晰明确\n// - 工具链支持好（TypeScript、IDE）\n// - 发布时无需修改\n// - 与外部依赖一致',
                            points: [
                                '始终通过包名引用',
                                '不要使用相对路径',
                                '保持代码可移植性',
                                '便于重构和维护'
                            ]
                        },
                        {
                            title: '发布处理',
                            code: '// 开发时package.json\n{\n  "dependencies": {\n    "@myorg/utils": "*"\n  }\n}\n\n// 发布前处理（使用lerna或脚本）\n// 1. 替换"*"为具体版本\n{\n  "dependencies": {\n    "@myorg/utils": "1.2.3"\n  }\n}\n\n// 2. 或使用lerna publish\nlerna publish\n// 自动处理工作区依赖版本'
                        }
                    ]
                },
                source: 'Yarn Workspaces文档'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：Workspaces发布',
            content: {
                difficulty: 'medium',
                tags: ['发布', 'monorepo'],
                question: '如何发布Yarn Workspaces中的包？',
                code: `monorepo/
├── packages/
│   ├── utils/      # 要发布
│   └── components/ # 要发布
└── package.json`,
                options: [
                    'yarn publish在每个工作区目录运行',
                    '使用lerna publish批量发布',
                    'Yarn Workspaces自动发布所有包',
                    'A和B都可以'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'Monorepo包发布策略',
                    description: 'Yarn Workspaces本身不提供发布功能，通常结合lerna等工具。',
                    sections: [
                        {
                            title: '方式1：手动发布',
                            code: '// 进入每个工作区发布\ncd packages/utils\nyarn publish\n\ncd ../components  \nyarn publish\n\n// 优点：\n- 简单直接\n- 完全控制\n\n// 缺点：\n- 繁琐易错\n- 版本管理困难\n- 无法批量操作\n- 依赖顺序需手动处理',
                            content: '适合小型项目，手动控制发布过程。'
                        },
                        {
                            title: '方式2：使用Lerna',
                            code: '// 安装lerna\nyarn add -D -W lerna\n\n// lerna.json配置\n{\n  "version": "independent",  // 独立版本\n  "npmClient": "yarn",      // 使用yarn\n  "useWorkspaces": true     // 使用yarn workspaces\n}\n\n// 发布命令\nlerna publish\n\n// Lerna会：\n// 1. 检测哪些包有变更\n// 2. 提示选择版本号\n// 3. 更新package.json\n// 4. 更新changelog\n// 5. git commit + tag\n// 6. 按依赖顺序发布到npm\n// 7. git push',
                            points: [
                                '智能检测变更',
                                '处理依赖顺序',
                                '版本管理',
                                'Git集成',
                                '批量发布'
                            ]
                        },
                        {
                            title: 'Lerna发布流程',
                            code: '// 1. 查看待发布的包\nlerna changed\n# @myorg/utils\n# @myorg/components\n\n// 2. 执行发布\nlerna publish\n\n// 3. 交互式选择版本\n? Select a new version for @myorg/utils:\n  Patch (1.0.0 → 1.0.1)\n  Minor (1.0.0 → 1.1.0)\n> Major (1.0.0 → 2.0.0)\n  Custom\n\n// 4. 确认发布\n? Are you sure you want to publish these packages?\n  @myorg/utils: 1.0.0 → 2.0.0\n  @myorg/components: 2.1.0 → 2.2.0\n\n// 5. 自动执行\n// - 更新version\n// - git commit\n// - git tag\n// - npm publish\n// - git push'
                        },
                        {
                            title: '发布前准备',
                            code: '// 每个工作区的package.json\n{\n  "name": "@myorg/utils",\n  "version": "1.0.0",\n  "private": false,  // 确保可发布\n  "publishConfig": {\n    "access": "public"  // 作用域包需要\n  },\n  "files": [\n    "dist",      // 只发布构建产物\n    "README.md",\n    "LICENSE"\n  ],\n  "main": "dist/index.js",\n  "scripts": {\n    "prepublishOnly": "yarn build && yarn test"\n  }\n}',
                            points: [
                                '设置private: false',
                                '配置files白名单',
                                '指定正确的main/module',
                                'prepublishOnly钩子'
                            ]
                        },
                        {
                            title: '版本管理策略',
                            code: '// 1. Fixed版本（统一版本）\n// lerna.json\n{\n  "version": "1.0.0"  // 所有包使用相同版本\n}\n\n// 优点：版本号简单\n// 缺点：不相关的包也会升级版本\n\n// 2. Independent版本（独立版本）\n// lerna.json\n{\n  "version": "independent"  // 每个包独立版本\n}\n\n// 优点：语义化版本更准确\n// 缺点：版本号管理复杂',
                            content: '根据项目特点选择版本策略。'
                        },
                        {
                            title: '现代替代方案',
                            code: '// Changesets（推荐）\nnpx @changesets/cli init\n\n// 工作流\n1. npx changeset        # 添加changeset\n2. git commit\n3. npx changeset version # 更新版本\n4. npx changeset publish # 发布\n\n// 优点：\n// - 更现代的设计\n// - 更好的CI集成\n// - 自动生成changelog\n// - GitHub Action支持好',
                            content: 'Changesets是Lerna的现代替代品。'
                        }
                    ]
                },
                source: 'Lerna官方文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：Yarn Workspaces vs Lerna',
            content: {
                difficulty: 'hard',
                tags: ['对比', 'Lerna'],
                question: 'Yarn Workspaces和Lerna的关系是什么？',
                options: [
                    '完全相同的工具',
                    'Workspaces管理依赖，Lerna提供构建和发布',
                    'Lerna已被Workspaces完全替代',
                    '两者不能同时使用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Workspaces vs Lerna职责分工',
                    description: 'Yarn Workspaces和Lerna互补，各有侧重。',
                    sections: [
                        {
                            title: '功能对比',
                            code: '┌─────────────────┬───────────────┬─────────┐\n│ 功能            │ Workspaces    │ Lerna   │\n├─────────────────┼───────────────┼─────────┤\n│ 依赖安装        │ ✓✓✓          │ ✓       │\n│ 依赖链接        │ ✓✓✓          │ ✓       │\n│ 依赖提升        │ ✓✓✓          │ ✗       │\n│ 批量运行脚本    │ ✓            │ ✓✓✓     │\n│ 版本管理        │ ✗            │ ✓✓✓     │\n│ 发布管理        │ ✗            │ ✓✓✓     │\n│ 变更检测        │ ✗            │ ✓✓✓     │\n│ Changelog生成   │ ✗            │ ✓✓✓     │\n└─────────────────┴───────────────┴─────────┘',
                            content: 'Workspaces专注依赖，Lerna专注工作流。'
                        },
                        {
                            title: 'Yarn Workspaces职责',
                            code: '// Workspaces负责：\n1. 依赖安装和管理\n   yarn install  # 安装所有工作区依赖\n\n2. 依赖提升\n   # 共享依赖自动提升到根\n\n3. 工作区链接\n   # 自动创建符号链接\n\n4. 基础命令\n   yarn workspace <name> <cmd>\n   yarn workspaces run <cmd>',
                            points: [
                                '依赖管理核心',
                                'Monorepo基础设施',
                                '高性能安装',
                                '磁盘空间优化'
                            ]
                        },
                        {
                            title: 'Lerna职责',
                            code: '// Lerna负责：\n1. 版本管理\n   lerna version  # 统一或独立版本\n\n2. 发布管理\n   lerna publish  # 批量发布到npm\n\n3. 批量任务\n   lerna run build  # 按拓扑顺序执行\n   lerna run test --parallel\n\n4. 变更检测\n   lerna changed  # 检测变更的包\n\n5. Changelog\n   # 自动生成变更日志',
                            points: [
                                '工作流自动化',
                                '版本和发布',
                                '任务编排',
                                'Git集成'
                            ]
                        },
                        {
                            title: '组合使用（推荐）',
                            code: '// package.json（根）\n{\n  "private": true,\n  "workspaces": ["packages/*"],  // Yarn Workspaces\n  "devDependencies": {\n    "lerna": "^7.0.0"              // 同时使用Lerna\n  }\n}\n\n// lerna.json\n{\n  "version": "independent",\n  "npmClient": "yarn",           // 使用Yarn安装\n  "useWorkspaces": true          // 委托给Workspaces\n}\n\n// 工作流\nyarn install         # Workspaces管理依赖\nlerna run build      # Lerna编排构建\nlerna run test       # Lerna运行测试\nlerna publish        # Lerna发布',
                            content: 'Workspaces + Lerna是经典组合。'
                        },
                        {
                            title: 'Lerna的演进',
                            code: '// Lerna历史\n// 2016：Lerna发布\n//  - 提供bootstrap（安装依赖）\n//  - 提供link（链接工作区）\n//  - 提供publish（发布）\n\n// 2017：Yarn Workspaces发布\n//  - bootstrap功能更好\n//  - link功能更快\n//  - Lerna集成Workspaces\n\n// 2022：Lerna归档\n//  - 维护者认为功能被npm/yarn覆盖\n\n// 2022：Nx接管Lerna\n//  - 重新激活开发\n//  - 性能优化（Nx缓存）\n//  - 现代化重写\n\n// 现在：Lerna v7+\n//  - 推荐配合Workspaces使用\n//  - 专注高级特性\n//  - 可选集成Nx',
                            content: 'Lerna已现代化，仍然有价值。'
                        },
                        {
                            title: '何时只用Workspaces',
                            code: '// 简单项目可以只用Workspaces\n{\n  "workspaces": ["packages/*"],\n  "scripts": {\n    "build": "yarn workspaces run build",\n    "test": "yarn workspaces run test"\n  }\n}\n\n// 适合：\n✅ 小型monorepo（<5个包）\n✅ 不需要发布到npm\n✅ 简单的构建流程\n✅ 手动版本管理可接受\n\n// 需要Lerna：\n❌ 大型monorepo（>10个包）\n❌ 需要发布到npm\n❌ 复杂的发布流程\n❌ 需要自动changelog',
                            content: '根据项目复杂度选择工具。'
                        },
                        {
                            title: '现代替代方案',
                            code: '// Workspaces + Changeset（推荐）\n// 依赖：Yarn Workspaces\n// 发布：Changesets\n// 优点：更现代、CI友好\n\n// Turborepo（新一代）\n// - 内置任务缓存\n// - 远程缓存\n// - 增量构建\n// - 取代Lerna的run功能\n\n// Nx（企业级）\n// - 最强大的monorepo工具\n// - 智能缓存\n// - 代码生成\n// - 与Lerna集成',
                            content: '工具生态持续演进，有多种选择。'
                        }
                    ]
                },
                source: 'Monorepo工具对比'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目9：Workspaces性能优化',
            content: {
                difficulty: 'hard',
                tags: ['性能优化', '多选题'],
                question: 'Yarn Workspaces的性能优化技巧包括哪些？',
                options: [
                    '使用--prefer-offline加速安装',
                    '合理配置nohoist减少提升复杂度',
                    '使用yarn workspaces focus只安装需要的工作区',
                    '频繁运行yarn cache clean'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'Workspaces性能优化策略',
                    description: '通过多种手段提升大型monorepo的性能。',
                    sections: [
                        {
                            title: '1. 离线优先安装',
                            code: '// CI配置\n// .github/workflows/ci.yml\nsteps:\n  - name: Cache Yarn\n    uses: actions/cache@v3\n    with:\n      path: ~/.cache/yarn\n      key: yarn-${{ hashFiles(\'yarn.lock\') }}\n  \n  - name: Install\n    run: yarn install --prefer-offline\n\n// 效果：\n// 首次：30秒（下载）\n// 缓存命中：5秒（复制）',
                            points: [
                                '优先使用缓存',
                                '减少网络请求',
                                '加速CI构建',
                                '降低registry压力'
                            ]
                        },
                        {
                            title: '2. 优化nohoist',
                            code: '// ❌ 过度使用nohoist\n{\n  "nohoist": [\n    "**"  // 阻止所有提升，性能差\n  ]\n}\n\n// ✅ 精确配置\n{\n  "nohoist": [\n    "**/react-native",     // 只阻止必需的\n    "**/react-native/**"\n  ]\n}\n\n// 原因：\n// - 提升减少重复安装\n// - nohoist增加安装时间\n// - 只在必要时使用',
                            content: 'nohoist会牺牲性能，谨慎使用。'
                        },
                        {
                            title: '3. 使用workspaces focus',
                            code: '// Yarn Berry特性\n// 只安装特定工作区及其依赖\nyarn workspaces focus @myorg/app\n\n// 场景：\n// - 只开发app，不需要其他工作区\n// - CI中只构建特定包\n// - 节省时间和空间\n\n// 对比\n// yarn install：安装所有工作区依赖（慢）\n// yarn workspaces focus：只安装app和其依赖（快）\n\n// 结合production\nyarn workspaces focus --production\n// 只安装生产依赖',
                            points: [
                                '减少不必要的安装',
                                '加速特定工作区开发',
                                '优化CI/CD',
                                'Berry专属特性'
                            ]
                        },
                        {
                            title: '4. 并行执行任务',
                            code: '// Lerna并行\nlerna run build --parallel\nlerna run test --parallel --concurrency=4\n\n// Turborepo（推荐）\nturbo run build  # 智能并行+缓存\n\n// Nx\nnx run-many --target=build --all --parallel',
                            content: '充分利用CPU核心。'
                        },
                        {
                            title: '5. 缓存构建产物',
                            code: '// Turborepo缓存\n// turbo.json\n{\n  "pipeline": {\n    "build": {\n      "outputs": ["dist/**"],\n      "cache": true  // 缓存构建产物\n    }\n  }\n}\n\n// 效果：\n// 首次：yarn build 60秒\n// 缓存命中：turbo build 1秒',
                            points: [
                                '避免重复构建',
                                '本地+远程缓存',
                                '团队共享缓存',
                                '加速10倍以上'
                            ]
                        },
                        {
                            title: '关于选项D（cache clean）',
                            content: '❌ 不应频繁清理缓存：',
                            code: '// 不要这样做\nyarn cache clean  # 删除所有缓存\nyarn install      # 重新下载\n\n// 后果：\n// - 浪费带宽\n// - 增加安装时间\n// - 丢失性能优势\n\n// 缓存是好东西：\n// - 第二次安装快10倍\n// - 离线可用\n// - 跨项目共享\n// - 自动管理\n\n// 只在必要时清理：\n✅ 缓存损坏\n✅ 磁盘空间极度不足\n✅ Yarn大版本升级',
                            content: '保留缓存是性能优化的关键。'
                        },
                        {
                            title: '综合优化策略',
                            code: '// 1. 依赖管理\n- 使用Workspaces提升依赖\n- 精确配置nohoist\n- 定期清理无用依赖\n\n// 2. 安装优化\n- CI使用--prefer-offline\n- 配置缓存策略\n- 使用focus按需安装\n\n// 3. 构建优化\n- Turborepo/Nx缓存\n- 并行执行任务\n- 增量构建\n\n// 4. 监控优化\n- 测量安装时间\n- 分析依赖大小\n- 识别性能瓶颈',
                            content: '多管齐下，持续优化。'
                        }
                    ]
                },
                source: 'Monorepo性能优化'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz-code',
            title: '题目10：Workspaces故障排查',
            content: {
                difficulty: 'hard',
                tags: ['故障排查', '调试'],
                question: '当Yarn Workspaces出现依赖问题时，最有效的排查顺序是什么？',
                code: `// 症状：某个包找不到或版本不对
Error: Cannot find module '@myorg/utils'`,
                options: [
                    '立即删除node_modules重装',
                    '检查package.json → yarn why → yarn workspaces info',
                    '直接修改yarn.lock文件',
                    'yarn cache clean后重装'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Workspaces问题诊断方法论',
                    description: '系统化排查可以快速定位并解决问题。',
                    sections: [
                        {
                            title: '排查步骤',
                            code: '// 步骤1：检查配置\n// 根package.json\ncat package.json | grep workspaces\n# 确认workspaces配置正确\n\n// 工作区package.json\ncat packages/app/package.json | grep @myorg/utils\n# 确认依赖声明存在\n\n// 步骤2：检查工作区识别\nyarn workspaces list\n# 确认所有工作区被识别\n\n// 步骤3：检查依赖关系\nyarn why @myorg/utils\n# 查看依赖原因和安装位置\n\n// 步骤4：检查符号链接\nls -la node_modules/@myorg/\n# 确认链接存在且指向正确',
                            content: '从配置到安装，逐层排查。'
                        },
                        {
                            title: '常见问题1：工作区未识别',
                            code: '// 症状\nError: Cannot find module \'@myorg/utils\'\n\n// 排查\nyarn workspaces list\n# 发现utils没有列出\n\n// 原因\n// packages/utils/package.json不存在或格式错误\n\n// 解决\n// 1. 确认package.json存在\nls packages/utils/package.json\n\n// 2. 验证JSON格式\ncat packages/utils/package.json | jq .\n\n// 3. 确认name字段\n{\n  "name": "@myorg/utils",  // 必须有\n  "version": "1.0.0"\n}',
                            content: '工作区必须有有效的package.json。'
                        },
                        {
                            title: '常见问题2：版本不匹配',
                            code: '// 症状\n// package.json: "@myorg/utils": "1.0.0"\n// 实际安装: "@myorg/utils": "0.9.0"\n\n// 排查\nyarn why @myorg/utils\n# 查看实际安装的版本\n\n// 原因\n// yarn.lock锁定了旧版本\n\n// 解决\n// 1. 删除yarn.lock中相关条目\n// 2. 重新安装\nyarn install\n\n// 或直接\nrm yarn.lock\nyarn install',
                            content: 'yarn.lock可能过时。'
                        },
                        {
                            title: '常见问题3：符号链接损坏',
                            code: '// 症状\n// 代码能找到包，但内容不对\n\n// 排查\nls -la node_modules/@myorg/utils\n# lrwxr-xr-x  utils -> ../../packages/utils\n\n// 验证链接\nreadlink node_modules/@myorg/utils\n# ../../packages/utils\n\n// 检查目标\nls ../../packages/utils\n\n// 原因\n// 符号链接损坏或指向错误位置\n\n// 解决\nrm -rf node_modules\nyarn install',
                            content: '符号链接可能因文件系统操作损坏。'
                        },
                        {
                            title: '常见问题4：提升问题',
                            code: '// 症状\n// 工作区A能找到包，工作区B找不到\n\n// 排查\n// 检查两个工作区的依赖声明\ncat packages/A/package.json | grep lodash\ncat packages/B/package.json | grep lodash\n\n// 检查提升位置\nfind . -name lodash -type d\n# ./node_modules/lodash\n# ./packages/B/node_modules/lodash\n\n// 原因\n// 版本冲突导致部分提升\n\n// 解决\n// 1. 统一版本\n// 或 2. 配置nohoist\n{\n  "nohoist": ["**/lodash"]\n}',
                            content: '版本冲突影响提升。'
                        },
                        {
                            title: '终极方案',
                            code: '// 如果排查无果，完全重置\n\n// 1. 清理所有\nrm -rf node_modules\nrm yarn.lock\nyarn cache clean\n\n// 2. 重新安装\nyarn install\n\n// 3. 如果还有问题，检查权限\nls -la packages/\n# 确保文件可读\n\n// 4. 检查Yarn版本\nyarn --version\n# 确保使用合适的版本\n\n// 5. 查看详细日志\nyarn install --verbose',
                            content: '重置是最后的手段，通常能解决大部分问题。'
                        },
                        {
                            title: '预防措施',
                            code: '// 1. 提交yarn.lock\ngit add yarn.lock\n\n// 2. CI检查\n// .github/workflows/ci.yml\n- name: Validate\n  run: |\n    yarn workspaces list\n    yarn install --frozen-lockfile\n\n// 3. 本地验证\n// package.json\n{\n  "scripts": {\n    "validate": "yarn workspaces list && yarn install --check-files"\n  }\n}\n\n// 4. 文档\n// 在README记录常见问题和解决方案',
                            points: [
                                '提交锁文件',
                                'CI自动检查',
                                '本地验证脚本',
                                '文档化问题'
                            ]
                        },
                        {
                            title: '调试工具',
                            code: '// Yarn命令\nyarn workspaces list         # 列出所有工作区\nyarn workspaces info         # 详细信息（JSON）\nyarn why <package>           # 依赖追踪\nyarn install --check-files   # 验证文件完整性\nyarn install --verbose       # 详细日志\n\n// 系统命令\nls -la node_modules/@scope/  # 检查符号链接\nfind . -name "package.json"  # 查找所有package.json\ntree -L 2 node_modules/      # 查看node_modules结构',
                            content: '善用工具快速定位问题。'
                        }
                    ]
                },
                source: 'Yarn故障排查指南'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第17章面试题：Yarn基础命令',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=17'
        },
        next: {
            title: '第19章面试题：Yarn Plug\'n\'Play',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=19'
        }
    }
};
