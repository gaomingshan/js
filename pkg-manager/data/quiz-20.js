/**
 * 第20章：Yarn Berry高级特性 - 面试题
 * 10道精选面试题：测试对Yarn Berry Constraints、Protocols、Plugins等高级特性的掌握
 */

window.content = {
    section: {
        title: '第20章：Yarn Berry高级特性 - 面试题',
        icon: '🔵'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：Yarn Plugins基础',
            content: {
                difficulty: 'easy',
                tags: ['Plugins', '插件系统'],
                question: 'Yarn Berry的插件系统允许做什么？',
                options: [
                    '只能安装官方插件',
                    '扩展Yarn功能，添加命令和钩子',
                    '只能修改UI界面',
                    '插件不能在Berry中使用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn插件系统',
                    description: 'Yarn Berry引入了强大的插件系统，允许扩展核心功能。',
                    sections: [
                        {
                            title: '插件能力',
                            points: [
                                '添加新命令（如yarn dlx）',
                                '注册生命周期钩子',
                                '修改依赖解析逻辑',
                                '添加新的协议（protocols）',
                                '集成外部工具'
                            ],
                            code: '// 插件示例\n// .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs\nmodule.exports = {\n  name: "@yarnpkg/plugin-workspace-tools",\n  factory: require => {\n    // 注册命令\n    return {\n      commands: [...],\n      hooks: {...}\n    };\n  }\n};'
                        },
                        {
                            title: '官方插件',
                            code: '// 常用官方插件\n\n// 1. workspace-tools（工作区增强）\nyarn plugin import workspace-tools\n// 命令：yarn workspaces focus, yarn workspaces foreach\n\n// 2. interactive-tools（交互式工具）\nyarn plugin import interactive-tools\n// 命令：yarn upgrade-interactive\n\n// 3. version（版本管理）\nyarn plugin import version\n// 命令：yarn version check, yarn version apply\n\n// 4. typescript（TypeScript支持）\nyarn plugin import typescript\n// 自动生成@types SDK',
                            content: '官方提供了丰富的插件生态。'
                        },
                        {
                            title: '安装插件',
                            code: '// 从官方源安装\nyarn plugin import <plugin-name>\n\n// 从URL安装\nyarn plugin import https://example.com/plugin.js\n\n// 从本地文件\nyarn plugin import ./path/to/plugin.js\n\n// 查看已安装插件\nyarn plugin runtime\n\n// 插件存储位置\n.yarn/plugins/\n├── @yarnpkg-plugin-workspace-tools.cjs\n└── @yarnpkg-plugin-interactive-tools.cjs'
                        }
                    ]
                },
                source: 'Yarn Plugin API'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：Constraints约束',
            content: {
                difficulty: 'easy',
                tags: ['Constraints', '约束系统'],
                question: 'Yarn Constraints的主要用途是什么？',
                options: [
                    '限制依赖的安装数量',
                    '强制monorepo中的一致性规则',
                    '加速包安装',
                    '压缩依赖体积'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn Constraints约束系统',
                    description: 'Constraints允许在monorepo中强制执行一致性规则。',
                    sections: [
                        {
                            title: 'Constraints用途',
                            points: [
                                '强制依赖版本一致',
                                '确保许可证合规',
                                '统一package.json字段',
                                '自动修复不一致',
                                '防止配置偏差'
                            ],
                            code: '// 场景：monorepo中统一react版本\n// 问题：\n// packages/app:    "react": "^17.0.0"\n// packages/admin:  "react": "^18.0.0"  // 不一致！\n\n// Constraints解决\n// .yarn/constraints.pro\ngen_enforced_dependency(WorkspaceCwd, \'react\', \'18.2.0\', DependencyType) :-\n  workspace_has_dependency(WorkspaceCwd, \'react\', _, DependencyType).'
                        },
                        {
                            title: '启用Constraints',
                            code: '// 1. 安装插件\nyarn plugin import constraints\n\n// 2. 创建约束文件\n// .yarn/constraints.pro（Prolog语法）\n\n// 3. 检查约束\nyarn constraints\n\n// 4. 自动修复\nyarn constraints --fix',
                            content: 'Constraints使用Prolog语法定义规则。'
                        },
                        {
                            title: '常见约束示例',
                            code: '// 1. 统一依赖版本\ngen_enforced_dependency(WorkspaceCwd, DependencyIdent, \'1.2.3\', DependencyType) :-\n  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, DependencyType).\n\n// 2. 强制字段存在\ngen_enforced_field(WorkspaceCwd, \'license\', \'MIT\').\n\n// 3. 禁止特定依赖\ngen_enforced_dependency(WorkspaceCwd, \'lodash\', null, DependencyType) :-\n  workspace_has_dependency(WorkspaceCwd, \'lodash\', _, DependencyType).\n  // 禁止使用lodash，推荐lodash-es'
                        }
                    ]
                },
                source: 'Yarn Constraints文档'
            }
        },
        
        // 简单题 3 - 多选题
        {
            type: 'quiz',
            title: '题目3：Yarn Protocols',
            content: {
                difficulty: 'easy',
                tags: ['Protocols', '多选题'],
                question: 'Yarn Berry支持哪些依赖协议（protocols）？',
                options: [
                    'npm:（npm registry）',
                    'git:（git仓库）',
                    'file:（本地文件）',
                    'patch:（补丁协议）'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'Yarn依赖协议',
                    description: 'Berry支持多种协议从不同来源安装依赖。',
                    sections: [
                        {
                            title: '1. npm协议（默认）',
                            code: '// 显式使用npm协议\n{\n  "dependencies": {\n    "lodash": "npm:lodash@^4.17.21"\n  }\n}\n\n// 等价于（省略npm:）\n{\n  "dependencies": {\n    "lodash": "^4.17.21"\n  }\n}',
                            content: 'npm:是默认协议，通常省略。'
                        },
                        {
                            title: '2. git协议',
                            code: '// 从git仓库安装\n{\n  "dependencies": {\n    "my-lib": "git+https://github.com/user/repo.git",\n    "my-lib2": "git+https://github.com/user/repo.git#branch-name",\n    "my-lib3": "git+https://github.com/user/repo.git#v1.2.3"\n  }\n}\n\n// 支持SSH\n{\n  "dependencies": {\n    "my-lib": "git+ssh://git@github.com/user/repo.git"\n  }\n}'
                        },
                        {
                            title: '3. file协议',
                            code: '// 本地文件系统路径\n{\n  "dependencies": {\n    "my-lib": "file:../my-lib",           // 相对路径\n    "my-lib2": "file:/absolute/path/lib"  // 绝对路径\n  }\n}\n\n// 用途：\n// - 本地开发测试\n// - 不想发布的内部包\n// - 与workspace:协议类似'
                        },
                        {
                            title: '4. patch协议（强大！）',
                            code: '// 给依赖打补丁\n// 1. 生成patch\nyarn patch lodash@4.17.21\n# 打开临时目录，修改文件\n# 保存后生成patch文件\n\n// 2. package.json自动更新\n{\n  "dependencies": {\n    "lodash": "patch:lodash@npm:4.17.21#./.yarn/patches/lodash-npm-4.17.21-abc123.patch"\n  }\n}\n\n// 3. patch文件内容\n// .yarn/patches/lodash-npm-4.17.21-abc123.patch\ndiff --git a/index.js b/index.js\nindex 1234..5678\n--- a/index.js\n+++ b/index.js\n@@ -10,3 +10,4 @@\n+// 我的修改',
                            content: 'patch协议用于修复依赖的bug而无需fork。'
                        },
                        {
                            title: '5. 其他协议',
                            code: '// portal协议（工作区）\n{\n  "dependencies": {\n    "@myorg/utils": "portal:../utils"\n  }\n}\n\n// link协议\n{\n  "dependencies": {\n    "my-lib": "link:../my-lib"\n  }\n}\n\n// workspace协议（Berry推荐）\n{\n  "dependencies": {\n    "@myorg/utils": "workspace:*"\n  }\n}'
                        }
                    ]
                },
                source: 'Yarn Protocols文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：patch协议实战',
            content: {
                difficulty: 'medium',
                tags: ['patch', '补丁'],
                question: '如何使用Yarn patch协议修复依赖的bug？',
                code: `// 发现lodash有个bug需要修复
// 但不想fork整个包`,
                options: [
                    'fork lodash仓库，发PR',
                    '使用yarn patch命令创建补丁',
                    '直接修改node_modules中的文件',
                    '等待官方修复'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn patch协议详解',
                    description: 'patch协议允许快速修复依赖bug而无需fork。',
                    sections: [
                        {
                            title: '使用步骤',
                            code: '// 1. 创建patch\nyarn patch lodash@4.17.21\n\n// 输出：\n# ➤ YN0000: Package lodash@npm:4.17.21 got extracted in /tmp/xfs-abc123\n# ➤ YN0000: You can now edit the package, then run `yarn patch-commit`\n\n// 2. 修改文件\ncd /tmp/xfs-abc123\nvim index.js  # 修复bug\n\n// 3. 提交patch\nyarn patch-commit /tmp/xfs-abc123\n\n// 输出：\n# ✅ Created patch: ./.yarn/patches/lodash-npm-4.17.21-abc123.patch',
                            content: '三步生成patch：extract → edit → commit。'
                        },
                        {
                            title: 'patch文件',
                            code: '// .yarn/patches/lodash-npm-4.17.21-abc123.patch\ndiff --git a/index.js b/index.js\nindex 1234567..abcdefg 100644\n--- a/index.js\n+++ b/index.js\n@@ -1,5 +1,5 @@\n function debounce(func, wait) {\n-  // Bug: timeout not cleared\n-  return function(...args) {\n+  // Fixed: clear timeout\n+  return function debounced(...args) {\n+    clearTimeout(timeoutId);\n     timeoutId = setTimeout(() => func(...args), wait);\n   };\n }',
                            content: 'patch是标准的git diff格式。'
                        },
                        {
                            title: 'package.json更新',
                            code: '// 自动更新\n{\n  "dependencies": {\n    "lodash": "patch:lodash@npm:4.17.21#./.yarn/patches/lodash-npm-4.17.21-abc123.patch"\n  }\n}\n\n// 格式：\n// patch:<原始依赖>#<patch文件路径>',
                            content: 'Yarn自动应用patch。'
                        },
                        {
                            title: '应用场景',
                            code: '// 场景1：紧急bug修复\n// 依赖有严重bug，官方还未发版\nyarn patch @vulnerable/package\n\n// 场景2：添加调试日志\n// 临时添加console.log调试\nyarn patch debug-library\n\n// 场景3：兼容性修复\n// 修改依赖以兼容新环境\nyarn patch legacy-package\n\n// 场景4：性能优化\n// 优化依赖的某个热点函数\nyarn patch slow-package',
                            content: 'patch是临时解决方案，长期应提PR给上游。'
                        },
                        {
                            title: 'patch管理',
                            code: '// 查看所有patch\nls .yarn/patches/\n\n// 移除patch\n// 1. 删除patch文件\nrm .yarn/patches/lodash-*.patch\n\n// 2. 恢复package.json\n{\n  "dependencies": {\n    "lodash": "^4.17.21"  // 移除patch:前缀\n  }\n}\n\n// 3. 重新安装\nyarn install',
                            content: 'patch文件应提交到版本控制。'
                        },
                        {
                            title: 'vs其他方案',
                            code: '// 方案对比\n┌──────────────┬────────┬──────────┬────────┐\n│ 方案         │ 速度   │ 维护成本 │ 灵活性 │\n├──────────────┼────────┼──────────┼────────┤\n│ yarn patch   │ 快     │ 低       │ 高     │\n│ fork + PR    │ 慢     │ 高       │ 高     │\n│ patch-package│ 中     │ 中       │ 中     │\n│ 等待官方     │ 最慢   │ 无       │ 无     │\n└──────────────┴────────┴──────────┴────────┘',
                            content: 'yarn patch是最快的临时解决方案。'
                        }
                    ]
                },
                source: 'Yarn patch文档'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：workspace:协议',
            content: {
                difficulty: 'medium',
                tags: ['workspace协议', 'monorepo'],
                question: 'workspace:协议相比直接使用包名的优势是什么？',
                options: [
                    '没有区别，只是语法糖',
                    '明确标记工作区依赖，支持版本范围',
                    '只是为了好看',
                    'workspace:协议不存在'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'workspace:协议详解',
                    description: 'workspace:是Berry引入的语义化工作区依赖声明。',
                    sections: [
                        {
                            title: 'workspace:语法',
                            code: '// packages/app/package.json\n{\n  "dependencies": {\n    // 方式1：任意版本\n    "@myorg/utils": "workspace:*",\n    \n    // 方式2：语义化版本\n    "@myorg/components": "workspace:^1.0.0",\n    \n    // 方式3：精确版本\n    "@myorg/shared": "workspace:1.2.3",\n    \n    // 方式4：别名\n    "utils": "workspace:@myorg/utils@*"\n  }\n}',
                            content: 'workspace:协议支持多种版本表达。'
                        },
                        {
                            title: '对比传统方式',
                            code: '// ❌ 传统方式\n{\n  "dependencies": {\n    "@myorg/utils": "*"  // 模糊：可能是npm包\n  }\n}\n\n// ✅ workspace:协议\n{\n  "dependencies": {\n    "@myorg/utils": "workspace:*"  // 明确：工作区包\n  }\n}\n\n// 优势：\n// 1. 语义清晰\n// 2. 错误检测（如果包不在工作区，报错）\n// 3. 发布时自动替换版本',
                            points: [
                                '明确标记工作区依赖',
                                '类型安全（防止误用npm包）',
                                '发布时版本转换',
                                '支持版本约束'
                            ]
                        },
                        {
                            title: '发布时的转换',
                            code: '// 开发时package.json\n{\n  "name": "@myorg/app",\n  "version": "2.0.0",\n  "dependencies": {\n    "@myorg/utils": "workspace:^1.0.0"\n  }\n}\n\n// 发布时自动转换\n{\n  "name": "@myorg/app",\n  "version": "2.0.0",\n  "dependencies": {\n    "@myorg/utils": "^1.5.0"  // 工作区实际版本\n  }\n}\n\n// Yarn自动替换workspace:为实际版本',
                            content: '发布时workspace:自动替换为具体版本。'
                        },
                        {
                            title: '版本约束验证',
                            code: '// packages/utils/package.json\n{\n  "version": "1.5.0"\n}\n\n// packages/app/package.json\n{\n  "dependencies": {\n    "@myorg/utils": "workspace:^2.0.0"  // ❌ 不匹配\n  }\n}\n\n// yarn install报错：\n// Error: @myorg/utils@workspace:^2.0.0\n// doesn\'t match the version 1.5.0 of the workspace\n\n// 保证版本一致性',
                            content: 'workspace:协议验证版本兼容性。'
                        },
                        {
                            title: '最佳实践',
                            code: '// 推荐用法\n{\n  "dependencies": {\n    // 稳定API：使用版本约束\n    "@myorg/utils": "workspace:^1.0.0",\n    \n    // 频繁变更：使用*\n    "@myorg/dev-tools": "workspace:*",\n    \n    // 严格依赖：使用精确版本\n    "@myorg/config": "workspace:1.2.3"\n  }\n}\n\n// 发布前验证\nyarn workspaces foreach version check',
                            content: '根据包的稳定性选择版本策略。'
                        }
                    ]
                },
                source: 'Yarn workspace协议'
            }
        },
        
        // 中等题 3 - 多选题
        {
            type: 'quiz',
            title: '题目6：Yarn dlx命令',
            content: {
                difficulty: 'medium',
                tags: ['yarn dlx', '多选题'],
                question: 'yarn dlx命令的特点包括哪些？',
                options: [
                    '等价于npx，临时下载运行包',
                    '不会安装到项目或全局',
                    '每次运行都下载最新版本',
                    '比全局安装更安全'
                ],
                correctAnswer: [0, 1, 3],
                explanation: {
                    title: 'yarn dlx详解',
                    description: 'dlx是Yarn Berry的npx等价物，用于临时运行包。',
                    sections: [
                        {
                            title: 'dlx基本用法',
                            code: '// 运行create-react-app\nyarn dlx create-react-app my-app\n\n// 等价于npm的\nnpx create-react-app my-app\n\n// 或传统的\nyarn global add create-react-app\ncreate-react-app my-app\nyarn global remove create-react-app',
                            content: 'dlx临时下载并运行，运行后自动清理。'
                        },
                        {
                            title: 'dlx工作流程',
                            code: '// yarn dlx <package> <args>\n1. 检查缓存（.yarn/cache/）\n2. 如果不存在，下载到临时位置\n3. 运行package的bin命令\n4. 运行结束\n5. 不保留在项目中（但缓存保留）\n\n// 示例：\nyarn dlx cowsay "Hello!"\n// 1. 下载cowsay（如果缓存中没有）\n// 2. 运行cowsay\n// 3. 输出牛说话图案\n// 4. 不安装到项目',
                            points: [
                                '临时运行',
                                '不污染项目',
                                '不污染全局',
                                '使用缓存加速'
                            ]
                        },
                        {
                            title: '关于选项C（最新版本）',
                            content: '❌ 不总是下载最新版本：',
                            code: '// dlx使用缓存\nyarn dlx cowsay   # 首次：下载1.5.0\nyarn dlx cowsay   # 再次：使用缓存中的1.5.0\n\n// 即使有新版本1.6.0，也使用缓存的1.5.0\n\n// 要使用最新版本：\nyarn dlx cowsay@latest  # 明确指定\n\n// 或清除缓存\nyarn cache clean\nyarn dlx cowsay',
                            content: 'dlx优先使用缓存，提高性能。'
                        },
                        {
                            title: 'dlx vs全局安装',
                            code: '// 全局安装\nyarn global add typescript\ntsc --version\n\n// 问题：\n// - 污染全局空间\n// - 版本冲突\n// - 难以清理\n\n// dlx方式\nyarn dlx -p typescript tsc --version\n\n// 优势：\n// - 无全局污染\n// - 每个项目可用不同版本\n// - 自动清理',
                            content: 'dlx更安全，避免全局依赖地狱。'
                        },
                        {
                            title: '常见用例',
                            code: '// 1. 脚手架工具\nyarn dlx create-react-app my-app\nyarn dlx create-next-app my-app\nyarn dlx degit user/repo my-project\n\n// 2. 代码生成\nyarn dlx plop\nyarn dlx hygen\n\n// 3. 工具运行\nyarn dlx prettier --write .\nyarn dlx eslint .\n\n// 4. 一次性任务\nyarn dlx http-server  # 临时HTTP服务器\nyarn dlx json-server  # Mock API',
                            content: 'dlx适合不常用或一次性工具。'
                        },
                        {
                            title: '高级用法',
                            code: '// 指定版本\nyarn dlx cowsay@1.5.0 "Hello!"\n\n// 指定包和命令\nyarn dlx -p typescript tsc --init\n\n// 多个包\nyarn dlx -p pkg1 -p pkg2 command\n\n// 使用特定registry\nYARN_NPM_REGISTRY_SERVER=https://custom-registry.com yarn dlx pkg'
                        }
                    ]
                },
                source: 'Yarn dlx文档'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：Constraints实战',
            content: {
                difficulty: 'medium',
                tags: ['Constraints', 'Prolog'],
                question: '以下Constraints规则的作用是什么？',
                code: `// .yarn/constraints.pro
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'workspace:*', DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, DependencyType),
  workspace_ident(_, DependencyIdent).`,
                options: [
                    '禁止工作区间依赖',
                    '强制工作区依赖使用workspace:*协议',
                    '只允许安装特定版本',
                    '删除所有依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Constraints规则解析',
                    description: 'Prolog语法定义强制规则，确保monorepo一致性。',
                    sections: [
                        {
                            title: '规则解释',
                            code: '// gen_enforced_dependency(工作区, 依赖名, 期望版本, 依赖类型)\ngen_enforced_dependency(WorkspaceCwd, DependencyIdent, \'workspace:*\', DependencyType) :-\n  // 当前工作区有此依赖\n  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, DependencyType),\n  // 且该依赖是工作区包\n  workspace_ident(_, DependencyIdent).\n\n// 逻辑：\n// 如果工作区A依赖工作区B，\n// 则强制使用 "workspace:*" 而不是具体版本',
                            content: '确保工作区间依赖使用workspace:协议。'
                        },
                        {
                            title: '执行效果',
                            code: '// 修复前：packages/app/package.json\n{\n  "dependencies": {\n    "@myorg/utils": "^1.0.0"  // ❌ 具体版本\n  }\n}\n\n// 运行检查\nyarn constraints\n# ✘ @myorg/app › @myorg/utils should be workspace:*\n\n// 自动修复\nyarn constraints --fix\n\n// 修复后：\n{\n  "dependencies": {\n    "@myorg/utils": "workspace:*"  // ✅ 修复\n  }\n}',
                            content: 'Constraints可以自动修复不合规配置。'
                        },
                        {
                            title: '更多Constraints示例',
                            code: '// 1. 统一依赖版本\ngen_enforced_dependency(WorkspaceCwd, \'react\', \'18.2.0\', DependencyType) :-\n  workspace_has_dependency(WorkspaceCwd, \'react\', _, DependencyType).\n\n// 2. 强制字段\ngen_enforced_field(WorkspaceCwd, \'license\', \'MIT\').\ngen_enforced_field(WorkspaceCwd, \'engines.node\', \'>=14.0.0\').\n\n// 3. 禁止依赖\ngen_enforced_dependency(WorkspaceCwd, \'moment\', null, _) :-\n  workspace_has_dependency(WorkspaceCwd, \'moment\', _, _).\n  // 禁止使用moment，推荐dayjs\n\n// 4. 条件规则\ngen_enforced_dependency(WorkspaceCwd, \'typescript\', \'5.0.0\', \'devDependencies\') :-\n  workspace_field(WorkspaceCwd, \'scripts.build\', _),\n  // 如果有build脚本，必须有TypeScript',
                            content: 'Constraints非常灵活，可定义复杂规则。'
                        },
                        {
                            title: 'Prolog基础',
                            code: '// Prolog语法基础\n\n// 1. 事实（Fact）\nworkspace_ident(\'packages/app\', \'@myorg/app\').\n\n// 2. 规则（Rule）\nis_workspace_dep(Cwd, Dep) :-\n  workspace_has_dependency(Cwd, Dep, _, _),\n  workspace_ident(_, Dep).\n\n// 3. 查询\n// :- 表示"如果"\n// , 表示"且"\n// ; 表示"或"\n\n// 4. 变量\n// 大写字母开头：WorkspaceCwd, DependencyIdent\n// 下划线：匿名变量（忽略）',
                            content: '不需要深入学习Prolog，参考示例即可。'
                        },
                        {
                            title: '调试Constraints',
                            code: '// 检查规则\nyarn constraints\n\n// 查看详细信息\nyarn constraints --verbose\n\n// 生成查询\nyarn constraints query "workspace_has_dependency(Cwd, \'react\', Version, Type)"\n\n// 测试规则\n// 修改constraints.pro\n// 运行yarn constraints查看效果',
                            content: 'Constraints是代码即文档。'
                        }
                    ]
                },
                source: 'Yarn Constraints文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：自定义Plugin开发',
            content: {
                difficulty: 'hard',
                tags: ['Plugin开发', '扩展'],
                question: 'Yarn插件可以注册哪些类型的扩展？',
                options: [
                    '只能添加新命令',
                    '命令、钩子、协议、Fetcher、Resolver',
                    '只能修改配置文件',
                    '插件无法扩展核心功能'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn插件开发',
                    description: 'Yarn插件系统非常强大，允许深度定制。',
                    sections: [
                        {
                            title: '插件结构',
                            code: '// .yarn/plugins/plugin-example.js\nmodule.exports = {\n  name: "plugin-example",\n  factory: (require) => {\n    const { BaseCommand } = require("@yarnpkg/cli");\n    \n    return {\n      // 1. 命令\n      commands: [MyCommand],\n      \n      // 2. 钩子\n      hooks: {\n        afterAllInstalled: (project) => {...},\n        validateProject: (project) => {...}\n      },\n      \n      // 3. Fetchers（下载器）\n      fetchers: [MyFetcher],\n      \n      // 4. Resolvers（解析器）\n      resolvers: [MyResolver]\n    };\n  }\n};',
                            content: '插件可以注册多种扩展点。'
                        },
                        {
                            title: '1. 添加命令',
                            code: '// 自定义命令\nclass HelloCommand extends BaseCommand {\n  static paths = [[\'hello\']];\n  static usage = Command.Usage({\n    description: \'Say hello\',\n    details: \'This command says hello\'\n  });\n  \n  async execute() {\n    this.context.stdout.write(\'Hello from plugin!\\n\');\n    return 0;\n  }\n}\n\n// 使用\nyarn hello\n// 输出：Hello from plugin!',
                            content: '命令可以访问完整的Yarn API。'
                        },
                        {
                            title: '2. 生命周期钩子',
                            code: '// 注册钩子\nhooks: {\n  // 安装前\n  beforeWorkspacePacking: (workspace, rawManifest) => {\n    // 修改package.json\n  },\n  \n  // 安装后\n  afterAllInstalled: (project, options) => {\n    // 生成文件、运行脚本等\n  },\n  \n  // 依赖解析\n  reduceDependency: (dependency, project, locator) => {\n    // 修改依赖解析逻辑\n    return dependency;\n  }\n}',
                            content: '钩子允许在关键时刻介入。'
                        },
                        {
                            title: '3. 自定义协议',
                            code: '// 实现custom:协议\nclass CustomResolver {\n  supportsDescriptor(descriptor) {\n    return descriptor.range.startsWith(\'custom:\');\n  }\n  \n  async getCandidates(descriptor) {\n    const url = descriptor.range.slice(7);\n    // 解析custom:url为实际包信息\n    return [candidate];\n  }\n}\n\nclass CustomFetcher {\n  supports(locator) {\n    return locator.reference.startsWith(\'custom:\');\n  }\n  \n  async fetch(locator) {\n    // 从custom源下载包\n    return { packageFs, ... };\n  }\n}\n\n// 使用\n{\n  "dependencies": {\n    "my-pkg": "custom:https://my-cdn.com/pkg.tgz"\n  }\n}',
                            content: '可以创建全新的依赖来源。'
                        },
                        {
                            title: '实际案例：workspace-tools',
                            code: '// @yarnpkg/plugin-workspace-tools提供：\n\n// 命令\nyarn workspaces focus <workspace>  // 只安装特定工作区\nyarn workspaces foreach <command>   // 批量运行命令\n\n// 实现原理\nclass FocusCommand extends BaseCommand {\n  async execute() {\n    const {project, workspace} = this.context;\n    // 计算依赖图\n    const dependencies = getDependencies(workspace);\n    // 只安装相关依赖\n    await installSubset(dependencies);\n  }\n}',
                            content: 'workspace-tools是官方插件示例。'
                        },
                        {
                            title: '插件开发资源',
                            code: '// 1. 脚手架\nyarn dlx @yarnpkg/cli create plugin <name>\n\n// 2. 文档\n// https://yarnpkg.com/advanced/plugin-tutorial\n\n// 3. 示例插件\n// https://github.com/yarnpkg/berry/tree/master/packages\n\n// 4. 测试\nimport { makeProject } from \'@yarnpkg/cli\';\nconst project = await makeProject(...);\n// 测试插件行为',
                            content: 'Yarn提供完整的插件开发工具链。'
                        }
                    ]
                },
                source: 'Yarn Plugin API'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目9：Yarn Berry vs Classic',
            content: {
                difficulty: 'hard',
                tags: ['Berry vs Classic', '多选题'],
                question: '在以下场景中，推荐使用Yarn Berry的是？',
                options: [
                    '新建的大型monorepo项目',
                    '追求极致安装性能',
                    '需要严格依赖管理',
                    '旧项目且工具链不支持PnP'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'Yarn版本选择指南',
                    description: '根据项目特点选择合适的Yarn版本。',
                    sections: [
                        {
                            title: 'Yarn Berry优势场景',
                            code: '// ✅ 推荐Berry的场景\n\n// 1. 新建大型monorepo\n// - PnP最快\n// - Constraints管理一致性\n// - workspace:协议\n\nmonorepo/\n├── packages/ (50+个包)\n├── .yarn/\n├── .pnp.cjs\n└── .yarn/constraints.pro\n\n// 2. 性能敏感项目\n// - CI时间关键\n// - 频繁安装依赖\n// - 零安装需求\n\n// 3. 严格依赖管理\n// - 杜绝幽灵依赖\n// - 依赖关系清晰\n// - 安全性要求高',
                            points: [
                                '新项目（无历史包袱）',
                                'Monorepo（多包管理）',
                                '性能优先（CI/CD）',
                                '严格管理（企业级）'
                            ]
                        },
                        {
                            title: 'Yarn Classic适合场景',
                            code: '// ✅ 推荐Classic的场景\n\n// 1. 旧项目迁移成本高\n// - 大量遗留代码\n// - 工具链不支持PnP\n// - 团队不想学习新特性\n\n// 2. 工具链兼容性\n// - 使用旧版TypeScript\n// - Webpack 4及以下\n// - 原生模块多\n\n// 3. 小型项目\n// - 依赖少（<100个）\n// - 不需要高级特性\n// - 简单够用',
                            points: [
                                '遗留项目',
                                '工具链限制',
                                '小型项目',
                                '团队习惯'
                            ]
                        },
                        {
                            title: '关于选项D（旧项目）',
                            content: '❌ 旧项目且工具链不支持PnP不推荐Berry：',
                            code: '// 问题场景\n// 1. 工具链太旧\n// - TypeScript < 3.8\n// - Webpack 3\n// - Babel 6\n\n// 2. 迁移成本\n// - 需要大量配置\n// - 团队学习曲线\n// - 风险高\n\n// 解决方案\n// 方案1：继续用Classic\nyarn set version classic\n\n// 方案2：Berry + node-modules\n// .yarnrc.yml\nnodeLinker: node-modules\n// 使用Berry新特性，保留兼容性\n\n// 方案3：渐进式迁移\n// 先升级工具链，再切PnP',
                            content: '旧项目需要评估迁移成本。'
                        },
                        {
                            title: '决策树',
                            code: '// 选择Yarn版本的决策流程\n\n新项目？\n├─ 是 → Monorepo？\n│   ├─ 是 → Yarn Berry（PnP） ✅\n│   └─ 否 → 性能重要？\n│       ├─ 是 → Yarn Berry ✅\n│       └─ 否 → Classic或Berry都可\n└─ 否（旧项目）→ 工具链支持PnP？\n    ├─ 是 → 迁移成本可接受？\n    │   ├─ 是 → 逐步迁移到Berry ✅\n    │   └─ 否 → 继续Classic\n    └─ 否 → Classic或Berry(node-modules模式)',
                            content: '综合考虑多个因素。'
                        },
                        {
                            title: '功能对比表',
                            code: '┌─────────────────┬─────────┬────────┐\n│ 特性            │ Classic │ Berry  │\n├─────────────────┼─────────┼────────┤\n│ PnP             │ ✗       │ ✓      │\n│ 零安装          │ ✗       │ ✓      │\n│ Constraints     │ ✗       │ ✓      │\n│ Plugins         │ ✗       │ ✓      │\n│ patch:协议      │ ✗       │ ✓      │\n│ workspace:      │ ✗       │ ✓      │\n│ 兼容性          │ ✓✓✓     │ ✓✓     │\n│ 性能            │ ✓✓      │ ✓✓✓    │\n│ 学习曲线        │ 平缓    │ 陡峭   │\n└─────────────────┴─────────┴────────┘',
                            content: 'Berry更强大，但Classic更稳定。'
                        }
                    ]
                },
                source: 'Yarn版本选择指南'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz-code',
            title: '题目10：Yarn Berry最佳实践',
            content: {
                difficulty: 'hard',
                tags: ['最佳实践', '综合'],
                question: '配置一个生产级Yarn Berry项目需要哪些步骤？',
                code: `// 新建monorepo项目，要求：
// - 使用PnP
// - 零安装
// - 严格依赖管理
// - IDE支持`,
                options: [
                    '只需要yarn init即可',
                    '需要配置.yarnrc.yml、生成SDK、设置Constraints',
                    'Berry不适合生产环境',
                    '只需要升级到Berry版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn Berry生产级配置',
                    description: '完整的Berry项目需要多个配置步骤。',
                    sections: [
                        {
                            title: '完整配置清单',
                            code: '// 1. 初始化项目\nmkdir my-monorepo && cd my-monorepo\nyarn init -2  # 初始化为Berry项目\n\n// 2. 配置.yarnrc.yml\n// .yarnrc.yml\nnodeLinker: pnp\npnpMode: strict\nenableGlobalCache: true\ncompressionLevel: mixed\n\n// 3. 配置Workspaces\n// package.json\n{\n  "private": true,\n  "workspaces": ["packages/*"]\n}\n\n// 4. 配置零安装\n// .gitignore\n!.yarn/cache/\n!.pnp.cjs\n!.yarn/releases/\n\n// 5. 生成IDE SDK\nyarn dlx @yarnpkg/sdks vscode\n\n// 6. 安装插件\nyarn plugin import constraints\nyarn plugin import workspace-tools\nyarn plugin import interactive-tools\n\n// 7. 配置Constraints\n// .yarn/constraints.pro\ngen_enforced_field(WorkspaceCwd, \'license\', \'MIT\').',
                            content: '一步步构建完整的Berry项目。'
                        },
                        {
                            title: '项目结构',
                            code: '// 完整的Berry monorepo结构\nmy-monorepo/\n├── .yarn/\n│   ├── cache/              # 依赖缓存（提交）\n│   ├── plugins/            # 插件\n│   ├── releases/           # Yarn自身（提交）\n│   ├── sdks/               # IDE SDK\n│   └── constraints.pro     # 约束规则\n├── .vscode/\n│   └── settings.json       # VSCode配置\n├── packages/\n│   ├── app/\n│   ├── components/\n│   └── utils/\n├── .pnp.cjs                # PnP映射（提交）\n├── .pnp.loader.mjs         # ESM loader\n├── .yarnrc.yml             # Yarn配置\n├── package.json            # 根配置\n├── yarn.lock               # 锁文件\n└── turbo.json              # Turborepo配置（可选）',
                            content: '规范的目录结构。'
                        },
                        {
                            title: '配置文件详解',
                            code: '// .yarnrc.yml（完整配置）\n# 核心配置\nyarnPath: .yarn/releases/yarn-berry.cjs\nnodeLinker: pnp\npnpMode: strict\n\n# 性能优化\nenableGlobalCache: true\ncompressionLevel: mixed\nnetworkConcurrency: 16\n\n# 缓存配置\ncacheFolder: .yarn/cache\ninstallStatePath: .yarn/install-state.gz\n\n# 插件\nplugins:\n  - path: .yarn/plugins/@yarnpkg-plugin-constraints.cjs\n  - path: .yarn/plugins/@yarnpkg-plugin-workspace-tools.cjs\n\n# 零安装\npackageExtensions:\n  "*":\n    unplugged: false',
                            content: '根据需求调整配置。'
                        },
                        {
                            title: 'CI/CD配置',
                            code: '// .github/workflows/ci.yml\nname: CI\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      \n      # 零安装：无需yarn install\n      # - run: yarn install --immutable\n      \n      - name: Check constraints\n        run: yarn constraints\n      \n      - name: Type check\n        run: yarn workspaces foreach -A run type-check\n      \n      - name: Lint\n        run: yarn workspaces foreach -A run lint\n      \n      - name: Test\n        run: yarn workspaces foreach -A run test\n      \n      - name: Build\n        run: yarn workspaces foreach -A run build',
                            content: '零安装大幅简化CI配置。'
                        },
                        {
                            title: '团队规范',
                            code: '// CONTRIBUTING.md\n# 开发规范\n\n## 环境要求\n- Node.js >= 16\n- Yarn Berry（项目自带）\n\n## 快速开始\n```bash\ngit clone repo\ncd repo\nyarn          # 零安装，立即可用\nyarn dev\n```\n\n## 添加依赖\n```bash\n# 工作区依赖\nyarn workspace @myorg/app add lodash\n\n# 工作区间依赖\n# package.json\n{\n  "dependencies": {\n    "@myorg/utils": "workspace:*"\n  }\n}\n```\n\n## 提交前检查\n```bash\nyarn constraints  # 检查一致性\nyarn test         # 运行测试\n```',
                            content: '清晰的文档降低学习成本。'
                        },
                        {
                            title: '维护和升级',
                            code: '// 定期维护任务\n\n// 1. 更新Yarn版本\nyarn set version stable\n\n// 2. 更新插件\nyarn plugin import constraints --force\n\n// 3. 更新依赖\nyarn upgrade-interactive\n\n// 4. 清理缓存（可选）\nyarn cache clean --all\n\n// 5. 检查一致性\nyarn constraints\n\n// 6. 重新生成SDK\nyarn dlx @yarnpkg/sdks vscode',
                            content: '定期维护保持项目健康。'
                        },
                        {
                            title: '完整的package.json',
                            code: '{\n  "name": "my-monorepo",\n  "private": true,\n  "workspaces": ["packages/*"],\n  "packageManager": "yarn@4.0.0",\n  "scripts": {\n    "dev": "turbo run dev",\n    "build": "turbo run build",\n    "test": "turbo run test",\n    "lint": "turbo run lint",\n    "type-check": "turbo run type-check",\n    "constraints": "yarn constraints",\n    "clean": "turbo run clean && rm -rf .yarn/cache .pnp.* node_modules",\n    "prepare": "husky install"\n  },\n  "devDependencies": {\n    "husky": "^8.0.0",\n    "turbo": "latest"\n  },\n  "engines": {\n    "node": ">=16.0.0"\n  }\n}',
                            content: '标准的根配置文件。'
                        }
                    ]
                },
                source: 'Yarn Berry最佳实践'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第19章面试题：Yarn Plug\'n\'Play',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=19'
        },
        next: null  // 最后一章
    }
};
