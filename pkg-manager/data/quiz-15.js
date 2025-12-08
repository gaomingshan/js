/**
 * 第15章：npm Workspaces - 面试题
 * 10道精选面试题：测试对npm workspaces monorepo管理的理解
 */

window.content = {
    section: {
        title: '第15章：npm Workspaces - 面试题',
        icon: '🚀'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：Workspaces基础概念',
            content: {
                difficulty: 'easy',
                tags: ['workspaces', 'monorepo'],
                question: 'npm workspaces的主要作用是什么？',
                options: [
                    '管理多个相关包在同一个仓库中',
                    '提高npm安装速度',
                    '自动发布包到npm',
                    '编译TypeScript代码'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm Workspaces功能',
                    description: 'npm workspaces是npm 7+引入的monorepo管理功能。',
                    sections: [
                        {
                            title: 'Workspaces解决的问题',
                            points: [
                                'Monorepo管理：在一个仓库管理多个包',
                                '依赖共享：共享node_modules，减少重复安装',
                                '本地链接：自动link工作区内的包',
                                '统一操作：一次命令管理所有包'
                            ]
                        },
                        {
                            title: '典型使用场景',
                            code: '// 项目结构\nmy-project/\n├── package.json          # 根package.json\n├── packages/\n│   ├── app/             # 应用\n│   │   └── package.json\n│   ├── components/      # 组件库\n│   │   └── package.json\n│   └── utils/           # 工具库\n│       └── package.json\n└── node_modules/        # 共享依赖',
                            content: '一个典型的monorepo结构，包含应用和多个共享库。'
                        },
                        {
                            title: '配置Workspaces',
                            code: '// 根package.json\n{\n  "name": "my-project",\n  "private": true,\n  "workspaces": [\n    "packages/*"\n  ]\n}\n\n// npm install后会：\n// 1. 安装所有工作区的依赖到根node_modules\n// 2. 自动link工作区间的依赖'
                        },
                        {
                            title: 'Workspaces vs 其他工具',
                            points: [
                                'Lerna：功能更丰富，但npm workspaces已内置',
                                'Yarn Workspaces：类似功能，npm借鉴了其设计',
                                'pnpm：更高效的磁盘空间利用',
                                'Turborepo：专注于构建性能优化'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：Workspaces配置',
            content: {
                difficulty: 'easy',
                tags: ['配置', 'package.json'],
                question: '在根package.json中如何配置workspaces？',
                options: [
                    '"workspaces": ["packages/*"]',
                    '"workspace": "packages"',
                    '"monorepo": ["packages"]',
                    '"packages": ["*"]'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'Workspaces配置方法',
                    description: 'workspaces字段接受一个glob模式数组。',
                    sections: [
                        {
                            title: '基本配置',
                            code: '// package.json\n{\n  "name": "my-monorepo",\n  "private": true,  // 推荐设置为true\n  "workspaces": [\n    "packages/*"  // 匹配packages下所有目录\n  ]\n}'
                        },
                        {
                            title: '多种配置模式',
                            code: '// 1. 通配符\n{\n  "workspaces": ["packages/*"]\n}\n\n// 2. 明确指定\n{\n  "workspaces": [\n    "packages/app",\n    "packages/components"\n  ]\n}\n\n// 3. 多个目录\n{\n  "workspaces": [\n    "packages/*",\n    "apps/*",\n    "tools/*"\n  ]\n}\n\n// 4. 排除某些目录\n{\n  "workspaces": [\n    "packages/*",\n    "!packages/legacy"  // 排除legacy\n  ]\n}'
                        },
                        {
                            title: '验证配置',
                            code: '# 列出所有工作区\nnpm ls --workspaces\n\n# 查看工作区信息\nnpm query ".workspace"\n\n# 输出示例：\n# packages/app\n# packages/components\n# packages/utils'
                        },
                        {
                            title: '注意事项',
                            points: [
                                'workspaces必须是数组',
                                '支持glob模式（*, **）',
                                '每个工作区必须有package.json',
                                '根package.json建议设置"private": true',
                                'npm 7+才支持workspaces'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：在特定工作区运行命令',
            content: {
                difficulty: 'easy',
                tags: ['命令', 'workspace参数'],
                question: '如何在特定的工作区运行npm命令？',
                options: [
                    'npm run test --workspace=packages/app',
                    'npm run test --package=packages/app',
                    'npm run test --dir=packages/app',
                    'npm run test packages/app'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'Workspace命令执行',
                    description: '使用--workspace或-w参数指定工作区。',
                    sections: [
                        {
                            title: '基本用法',
                            code: '# 在单个工作区运行\nnpm run build --workspace=packages/app\n# 或简写\nnpm run build -w packages/app\n\n# 在多个工作区运行\nnpm run test -w packages/app -w packages/utils\n\n# 在所有工作区运行\nnpm run test --workspaces\n# 或简写\nnpm run test -ws'
                        },
                        {
                            title: '常用命令示例',
                            code: '# 安装依赖到特定工作区\nnpm install lodash -w packages/utils\n\n# 运行脚本\nnpm run dev -w packages/app\n\n# 运行测试\nnpm test --workspaces\n\n# 发布特定工作区\nnpm publish -w packages/components'
                        },
                        {
                            title: '使用包名指定',
                            code: '// packages/app/package.json\n{\n  "name": "@myorg/app"\n}\n\n// 可以使用包名而不是路径\nnpm run build -w @myorg/app\n\n// 这在重构目录结构时很有用'
                        },
                        {
                            title: '并行 vs 串行',
                            code: '# 默认并行执行\nnpm run build --workspaces\n\n# 如果需要串行，可以使用工具\n# 或在脚本中控制\n{\n  "scripts": {\n    "build:all": "npm run build -w utils && npm run build -w app"\n  }\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 1 - 多选题
        {
            type: 'quiz',
            title: '题目4：工作区依赖管理',
            content: {
                difficulty: 'medium',
                tags: ['依赖', '多选题'],
                question: 'npm workspaces如何处理工作区之间的依赖？以下说法正确的是？',
                options: [
                    '自动创建符号链接（symlink）',
                    '依赖会安装到各自的node_modules',
                    '共同依赖提升到根node_modules',
                    '需要手动npm link'
                ],
                correctAnswer: [0, 2],
                explanation: {
                    title: 'Workspaces依赖管理机制',
                    description: 'npm workspaces智能管理依赖，自动链接和提升。',
                    sections: [
                        {
                            title: '自动链接机制',
                            code: '// 项目结构\npackages/\n├── app/\n│   └── package.json  // 依赖@myorg/utils\n└── utils/\n    └── package.json  // name: @myorg/utils\n\n// packages/app/package.json\n{\n  "dependencies": {\n    "@myorg/utils": "^1.0.0"  // 或 "*" 或 "workspace:*"\n  }\n}\n\n// npm install后自动创建\nnode_modules/\n└── @myorg/\n    └── utils -> ../../packages/utils  // 符号链接',
                            points: [
                                '工作区间依赖自动链接',
                                '无需手动npm link',
                                '实时反映代码变更',
                                '开发体验流畅'
                            ]
                        },
                        {
                            title: '依赖提升（Hoisting）',
                            code: '// 场景：多个工作区使用相同的依赖\n// packages/app/package.json\n{\n  "dependencies": {\n    "lodash": "^4.17.21"\n  }\n}\n\n// packages/utils/package.json\n{\n  "dependencies": {\n    "lodash": "^4.17.21"  // 相同版本\n  }\n}\n\n// 结果：lodash只安装一次到根node_modules\nnode_modules/\n└── lodash/  // 共享\n\npackages/app/node_modules/     // 空\npackages/utils/node_modules/   // 空',
                            content: '相同版本的依赖会被提升到根目录，节省空间。'
                        },
                        {
                            title: '版本冲突处理',
                            code: '// 不同版本的依赖\n// packages/app需要lodash@4.17.21\n// packages/utils需要lodash@3.10.0\n\n// 结果：\nnode_modules/\n└── lodash@4.17.21/  // 更常用的版本提升\n\npackages/utils/node_modules/\n└── lodash@3.10.0/   // 冲突版本安装在工作区内',
                            content: 'npm会智能处理版本冲突。'
                        },
                        {
                            title: 'workspace协议',
                            code: '// pnpm和Yarn支持workspace:协议\n{\n  "dependencies": {\n    "@myorg/utils": "workspace:*"  // 总是使用本地版本\n  }\n}\n\n// npm 7+也支持类似语法\n{\n  "dependencies": {\n    "@myorg/utils": "*"  // 匹配任何版本，优先本地\n  }\n}'
                        },
                        {
                            title: '查看依赖树',
                            code: '# 查看整个项目的依赖树\nnpm ls\n\n# 查看特定工作区的依赖\nnpm ls -w packages/app\n\n# 查看某个包的依赖路径\nnpm ls lodash --all'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz-code',
            title: '题目5：Workspaces脚本配置',
            content: {
                difficulty: 'medium',
                tags: ['scripts', '批量操作'],
                question: '如何在根package.json中配置一个脚本来构建所有工作区？',
                code: `{
  "name": "my-monorepo",
  "workspaces": ["packages/*"],
  "scripts": {
    // 需要填写
  }
}`,
                options: [
                    '"build": "npm run build --workspaces"',
                    '"build": "npm run build -ws"',
                    '"build": "npm run build --workspace=*"',
                    'A和B都正确'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'Workspaces批量脚本',
                    description: '在根package.json中可以轻松管理所有工作区的脚本。',
                    sections: [
                        {
                            title: '基本配置',
                            code: '// 根package.json\n{\n  "scripts": {\n    // 方式1：完整写法\n    "build": "npm run build --workspaces",\n    \n    // 方式2：简写\n    "build": "npm run build -ws",\n    \n    // 两者完全等价\n  }\n}'
                        },
                        {
                            title: '常用脚本模式',
                            code: '{\n  "scripts": {\n    // 开发\n    "dev": "npm run dev --workspaces",\n    \n    // 构建\n    "build": "npm run build --workspaces",\n    \n    // 测试\n    "test": "npm run test --workspaces",\n    \n    // 检查\n    "lint": "npm run lint --workspaces",\n    \n    // 清理\n    "clean": "npm run clean --workspaces",\n    \n    // 特定工作区\n    "dev:app": "npm run dev -w @myorg/app"\n  }\n}'
                        },
                        {
                            title: '顺序执行',
                            code: '// 需要按顺序构建时\n{\n  "scripts": {\n    // 先构建utils，再构建app（app依赖utils）\n    "build": "npm run build -w utils && npm run build -w app",\n    \n    // 或使用工具\n    "build": "lerna run build --stream"\n  }\n}'
                        },
                        {
                            title: '条件执行',
                            code: '// 只在有对应脚本的工作区执行\n{\n  "scripts": {\n    // npm会自动跳过没有test脚本的工作区\n    "test": "npm run test --workspaces --if-present"\n  }\n}\n\n// --if-present: 如果脚本不存在，不报错'
                        },
                        {
                            title: '并行 vs 串行控制',
                            code: '// 默认：并行执行（快）\nnpm run build --workspaces\n\n// 串行执行（可控）\nnpm run build -w pkg1 && npm run build -w pkg2\n\n// 使用专门工具\n// turborepo - 智能并行和缓存\n// lerna - 拓扑排序执行\n// wsrun - 并行控制\n\n{\n  "scripts": {\n    "build": "turbo run build",  // 自动依赖排序+并行\n  }\n}'
                        },
                        {
                            title: '完整示例',
                            code: '{\n  "name": "my-monorepo",\n  "private": true,\n  "workspaces": ["packages/*"],\n  "scripts": {\n    // 安装所有依赖\n    "install:all": "npm install",\n    \n    // 清理\n    "clean": "npm run clean --workspaces --if-present",\n    \n    // 构建（按依赖顺序）\n    "build": "npm run build -w utils && npm run build -w components && npm run build -w app",\n    \n    // 开发（并行）\n    "dev": "npm run dev --workspaces",\n    \n    // 测试\n    "test": "npm run test --workspaces",\n    "test:app": "npm run test -w @myorg/app",\n    \n    // 检查\n    "lint": "npm run lint --workspaces",\n    "type-check": "npm run type-check --workspaces",\n    \n    // 发布准备\n    "prepublish": "npm run build && npm test"\n  }\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：Workspaces发布',
            content: {
                difficulty: 'medium',
                tags: ['发布', 'npm publish'],
                question: '在workspaces中发布包时，需要注意什么？',
                options: [
                    '必须在根目录运行npm publish',
                    '需要指定--workspace参数或进入工作区目录',
                    '会自动发布所有工作区',
                    'workspaces不支持发布'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Workspaces包发布',
                    description: 'npm workspaces支持灵活的包发布策略。',
                    sections: [
                        {
                            title: '发布单个工作区',
                            code: '# 方式1：使用--workspace参数\nnpm publish -w packages/components\n\n# 方式2：进入工作区目录\ncd packages/components\nnpm publish\n\n# 方式3：使用包名\nnpm publish -w @myorg/components'
                        },
                        {
                            title: '发布前准备',
                            code: '// packages/components/package.json\n{\n  "name": "@myorg/components",\n  "version": "1.0.0",\n  "private": false,  // 确保不是private\n  "main": "dist/index.js",\n  "files": [\n    "dist/",\n    "README.md"\n  ],\n  "scripts": {\n    "prepublishOnly": "npm run build && npm test"\n  }\n}'
                        },
                        {
                            title: '批量发布',
                            code: '# npm不直接支持批量发布\n# 需要使用Lerna等工具\n\n# 安装lerna\nnpm install -D lerna\n\n# lerna.json\n{\n  "version": "independent",  // 独立版本\n  "npmClient": "npm",\n  "useWorkspaces": true\n}\n\n# 发布所有改动的包\nlerna publish',
                            content: 'Lerna可以智能检测变更并批量发布。'
                        },
                        {
                            title: '版本管理',
                            code: '// 独立版本管理\npackages/\n├── utils/        # v1.0.0\n├── components/   # v2.1.0\n└── app/          # v1.5.0\n\n// 统一版本管理\npackages/\n├── utils/        # v1.0.0\n├── components/   # v1.0.0\n└── app/          # v1.0.0\n\n// lerna支持两种模式\n// "version": "independent"  - 独立\n// "version": "1.0.0"        - 统一'
                        },
                        {
                            title: '发布流程示例',
                            code: '# 1. 更新版本\nnpm version patch -w @myorg/components\n\n# 2. 构建\nnpm run build -w @myorg/components\n\n# 3. 测试\nnpm test -w @myorg/components\n\n# 4. 发布\nnpm publish -w @myorg/components\n\n# 5. 推送tag\ngit push --follow-tags',
                            points: [
                                '确保代码已提交',
                                '版本号符合semver',
                                '通过所有测试',
                                '更新CHANGELOG',
                                '设置正确的git tags'
                            ]
                        },
                        {
                            title: '自动化发布',
                            code: '// .github/workflows/publish.yml\nname: Publish\non:\n  push:\n    tags:\n      - \'v*\'\n\njobs:\n  publish:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: 18\n          registry-url: https://registry.npmjs.org\n      \n      - run: npm ci\n      - run: npm run build --workspaces\n      - run: npm run test --workspaces\n      \n      # 发布所有changed包\n      - run: npx lerna publish from-git --yes\n        env:\n          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 4 - 多选题
        {
            type: 'quiz',
            title: '题目7：Workspaces优势',
            content: {
                difficulty: 'medium',
                tags: ['优势', '多选题'],
                question: '使用npm workspaces的优势包括哪些？',
                options: [
                    '减少node_modules占用空间',
                    '简化本地开发（无需手动link）',
                    '统一依赖版本管理',
                    '提高包的下载速度'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'npm Workspaces优势',
                    description: 'Workspaces为monorepo开发提供了多方面的改进。',
                    sections: [
                        {
                            title: '1. 节省磁盘空间',
                            content: '依赖提升机制减少重复安装：',
                            code: '// 传统方式：每个包独立安装\npackages/app/node_modules/lodash/      # 500KB\npackages/utils/node_modules/lodash/    # 500KB\npackages/api/node_modules/lodash/      # 500KB\n// 总计：1.5MB\n\n// Workspaces：共享依赖\nnode_modules/lodash/                    # 500KB\n// 总计：500KB\n\n// 节省：67%空间',
                            points: [
                                '相同依赖只安装一次',
                                '大型monorepo节省明显',
                                '加快CI/CD构建速度',
                                '减少磁盘I/O'
                            ]
                        },
                        {
                            title: '2. 简化本地开发',
                            content: '自动链接工作区间依赖：',
                            code: '// 传统方式：手动link\ncd packages/utils\nnpm link\ncd ../app\nnpm link @myorg/utils\n// 每次修改结构都要重新link\n\n// Workspaces：自动处理\nnpm install  # 一次搞定\n// 自动创建符号链接\n// 代码修改实时生效',
                            points: [
                                '无需手动npm link',
                                '修改立即反映',
                                '减少开发摩擦',
                                '新成员上手快'
                            ]
                        },
                        {
                            title: '3. 统一依赖管理',
                            code: '// 根package.json统一管理\n{\n  "devDependencies": {\n    "typescript": "^5.0.0",    // 所有包使用相同版本\n    "eslint": "^8.0.0",\n    "jest": "^29.0.0"\n  }\n}\n\n// 避免版本冲突\n// packages/app    - typescript@4.9.0\n// packages/utils  - typescript@5.0.0  ❌ 版本不一致\n\n// 使用workspaces\n// 所有包共享typescript@5.0.0  ✅',
                            points: [
                                '一处升级，全局生效',
                                '避免版本不一致',
                                '简化依赖审计',
                                '减少类型定义冲突'
                            ]
                        },
                        {
                            title: '4. 原子化提交',
                            content: 'monorepo支持跨包原子性修改：',
                            code: '// 场景：修改API接口\n// 1. 修改utils/api.ts\n// 2. 更新app/使用方式\n// 3. 更新components/调用\n// 4. 一次git commit\n\ngit commit -m "feat: update user API"\n\n// 好处：\n// - 修改原子化，不会部分失败\n// - 代码审查完整\n// - 历史清晰\n// - 回滚方便'
                        },
                        {
                            title: '关于选项D（下载速度）',
                            content: '⚠️ 选项D不正确：\n\nWorkspaces不直接提高包的下载速度。\n\n下载速度取决于：\n- 网络连接\n- npm registry服务器\n- 缓存状态\n\nWorkspaces的价值在于：\n- 减少安装的包数量（共享）\n- 但单个包的下载速度不变'
                        },
                        {
                            title: '其他优势',
                            points: [
                                '统一工具链配置（eslint、prettier、tsconfig）',
                                '代码复用更容易',
                                '重构更安全（IDE跨包重构）',
                                'CI/CD pipeline简化',
                                '团队协作更高效'
                            ]
                        }
                    ]
                },
                source: 'Monorepo最佳实践'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz-code',
            title: '题目8：依赖提升问题',
            content: {
                difficulty: 'hard',
                tags: ['hoisting', '幽灵依赖'],
                question: '以下代码在workspaces中可能遇到什么问题？',
                code: `// packages/app/package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// packages/app/index.js
const express = require('express');
const lodash = require('lodash');  // 未在dependencies中声明!`,
                options: [
                    '没有问题，lodash是express的依赖',
                    '会报错，找不到lodash',
                    '可能工作，但存在幽灵依赖（Phantom Dependency）风险',
                    'workspaces会自动安装lodash'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '幽灵依赖（Phantom Dependency）问题',
                    description: '依赖提升可能导致代码依赖未声明的包，这是monorepo的常见陷阱。',
                    sections: [
                        {
                            title: '问题分析',
                            code: '// 场景\npackages/app/package.json:\n{\n  "dependencies": {\n    "express": "^4.18.0"  // express依赖lodash\n  }\n}\n\n// 安装后的结构\nnode_modules/\n├── express/\n└── lodash/  // express的依赖被提升\n\n// packages/app/index.js\nconst lodash = require(\'lodash\');  // 能找到！\n// 但这是危险的！',
                            points: [
                                '代码依赖了未声明的包（lodash）',
                                '能运行是因为express依赖了lodash',
                                'express未来可能移除lodash依赖',
                                '代码会突然崩溃'
                            ]
                        },
                        {
                            title: '幽灵依赖的危害',
                            code: '// 时间线\n// v1.0.0 - 工作正常\napp depends on express@4.18.0\nexpress@4.18.0 depends on lodash@4.17.21\n→ lodash被提升，app能使用 ✅\n\n// v2.0.0 - express更新\napp depends on express@5.0.0\nexpress@5.0.0 移除了lodash依赖\n→ lodash不再被安装\n→ app崩溃 ❌\n\nError: Cannot find module \'lodash\'',
                            content: '依赖未声明导致的隐式耦合非常危险。'
                        },
                        {
                            title: '检测幽灵依赖',
                            code: '// 使用depcheck检测\nnpx depcheck\n\n// 输出：\n// Unused dependencies\n// * none\n//\n// Missing dependencies\n// * lodash  ← 幽灵依赖！\n\n// 或使用dependency-cruiser\nnpx depcruise --validate .dependency-cruiser.js src'
                        },
                        {
                            title: '解决方案',
                            code: '// 1. 显式声明所有依赖\n{\n  "dependencies": {\n    "express": "^4.18.0",\n    "lodash": "^4.17.21"  // ✅ 明确声明\n  }\n}\n\n// 2. 使用pnpm（更严格的依赖隔离）\n// pnpm使用符号链接，不提升依赖\n// 只能访问声明的依赖\n\n// 3. 启用npm的严格模式（未来特性）\n// .npmrc\nstrict-peer-dependencies=true'
                        },
                        {
                            title: 'pnpm vs npm',
                            code: '// pnpm的依赖结构（更严格）\nnode_modules/\n├── .pnpm/\n│   ├── express@4.18.0/\n│   │   └── node_modules/\n│   │       ├── express/\n│   │       └── lodash/  ← 只有express能访问\n│   └── lodash@4.17.21/\n└── express -> .pnpm/express@4.18.0/node_modules/express\n\n// app/index.js\nrequire(\'lodash\')  // ❌ 报错：找不到模块\n\n// npm的依赖结构（宽松）\nnode_modules/\n├── express/\n└── lodash/  ← 所有包都能访问',
                            content: 'pnpm通过符号链接隔离依赖，防止幽灵依赖。'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '✅ 明确声明所有直接使用的依赖',
                                '✅ 定期运行depcheck检测',
                                '✅ 在CI中检测幽灵依赖',
                                '✅ 考虑使用pnpm（更严格）',
                                '❌ 不要依赖未声明的包',
                                '❌ 不要假设依赖的依赖总是存在'
                            ]
                        },
                        {
                            title: 'CI检测配置',
                            code: '// .github/workflows/check.yml\nname: Check Dependencies\non: [push, pull_request]\n\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npx depcheck  # 检测幽灵依赖\n      - run: npm audit     # 安全审计'
                        }
                    ]
                },
                source: 'Monorepo常见问题'
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：循环依赖',
            content: {
                difficulty: 'hard',
                tags: ['循环依赖', '架构设计'],
                question: '在workspaces中，如果package A依赖B，B又依赖A，会发生什么？',
                options: [
                    'npm install会报错',
                    '可以安装，但运行时可能出现问题',
                    'npm会自动解决循环依赖',
                    'workspaces不允许工作区之间相互依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '循环依赖问题',
                    description: 'npm允许循环依赖，但这通常是架构设计问题的信号。',
                    sections: [
                        {
                            title: '循环依赖示例',
                            code: '// packages/utils/package.json\n{\n  "name": "@myorg/utils",\n  "dependencies": {\n    "@myorg/components": "*"  // utils依赖components\n  }\n}\n\n// packages/components/package.json\n{\n  "name": "@myorg/components",\n  "dependencies": {\n    "@myorg/utils": "*"  // components依赖utils\n  }\n}\n\n// npm install 不会报错\n// 但运行时可能出现问题'
                        },
                        {
                            title: '运行时问题',
                            code: '// utils/index.js\nconst { Button } = require(\'@myorg/components\');\nexports.withButton = (props) => Button(props);\n\n// components/Button.js\nconst { formatText } = require(\'@myorg/utils\');\nexports.Button = (props) => {\n  return formatText(props.text);  // ❌ 可能是undefined\n};\n\n// 问题：\n// 1. 模块加载顺序不确定\n// 2. 可能出现部分初始化\n// 3. TypeError: formatText is not a function',
                            content: 'Node.js模块系统会尝试处理循环依赖，但结果可能不符合预期。'
                        },
                        {
                            title: 'Node.js循环依赖处理',
                            code: '// a.js\nconsole.log(\'a starting\');\nexports.done = false;\nconst b = require(\'./b.js\');\nconsole.log(\'in a, b.done =\', b.done);\nexports.done = true;\nconsole.log(\'a done\');\n\n// b.js\nconsole.log(\'b starting\');\nexports.done = false;\nconst a = require(\'./a.js\');  // 循环！\nconsole.log(\'in b, a.done =\', a.done);\nexports.done = true;\nconsole.log(\'b done\');\n\n// main.js\nrequire(\'./a.js\');\n\n// 输出：\n// a starting\n// b starting\n// in b, a.done = false  ← a还未完成！\n// b done\n// in a, b.done = true\n// a done',
                            points: [
                                'Node.js返回未完成的exports对象',
                                '可能导致undefined或不完整的对象',
                                '难以调试',
                                '行为取决于加载顺序'
                            ]
                        },
                        {
                            title: '为什么循环依赖是坏设计',
                            points: [
                                '违反单一职责原则',
                                '增加耦合度',
                                '难以理解和维护',
                                '测试困难（难以mock）',
                                '可能导致内存泄漏',
                                '重构风险高'
                            ]
                        },
                        {
                            title: '检测循环依赖',
                            code: '// 使用madge\nnpx madge --circular packages/*/src\n\n// 输出：\n// Circular dependencies:\n// @myorg/utils → @myorg/components → @myorg/utils\n\n// 生成依赖图\nnpx madge --image graph.svg packages/*/src'
                        },
                        {
                            title: '解决方案',
                            code: '// 方案1：提取共享代码\npackages/\n├── utils/           # 纯工具函数\n├── components/      # UI组件\n└── shared/          # 共享逻辑\n    └── constants/   # utils和components共同依赖\n\n// 方案2：合并包\n// 如果utils和components紧密相关，合并为一个包\npackages/\n└── ui-kit/  # 包含utils和components\n\n// 方案3：依赖倒置\n// 让两者都依赖抽象接口\npackages/\n├── interfaces/      # 定义接口\n├── utils/          # 实现接口\n└── components/     # 实现接口'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '设计清晰的依赖层次（utils → components → app）',
                                '使用madge定期检测循环依赖',
                                '在CI中阻止循环依赖',
                                '提取共享代码到独立包',
                                '遵循依赖倒置原则',
                                '保持包的单一职责'
                            ],
                            code: '// 推荐的依赖层次\napp               # 应用层\n  ↓\nfeatures          # 功能模块\n  ↓\ncomponents        # UI组件\n  ↓\nutils             # 工具库\n  ↓\ntypes/constants   # 基础定义\n\n// 单向依赖，无循环'
                        }
                    ]
                },
                source: 'Monorepo架构设计'
            }
        },
        
        // 困难题 3 - 多选题
        {
            type: 'quiz',
            title: '题目10：Workspaces进阶优化',
            content: {
                difficulty: 'hard',
                tags: ['优化', '进阶', '多选题'],
                question: '在大型monorepo中，以下哪些优化措施是有效的？',
                options: [
                    '使用Turborepo进行增量构建和缓存',
                    '配置.npmrc限制依赖提升范围',
                    '使用changesets管理版本和发布',
                    '所有工作区使用相同的tsconfig.json'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'Monorepo进阶优化',
                    description: '大型monorepo需要专门的工具和策略来保持高效。',
                    sections: [
                        {
                            title: '1. Turborepo：构建性能优化',
                            content: 'Turborepo提供智能缓存和并行执行：',
                            code: '// turbo.json\n{\n  "pipeline": {\n    "build": {\n      "dependsOn": ["^build"],  // 先构建依赖\n      "outputs": ["dist/**"],   // 缓存输出\n      "cache": true\n    },\n    "test": {\n      "dependsOn": ["build"],\n      "cache": true,\n      "inputs": ["src/**", "test/**"]  // 只有这些变化才重新运行\n    }\n  }\n}\n\n// 使用\nnpm run build  // 首次：30秒\nnpm run build  // 缓存命中：1秒！',
                            points: [
                                '增量构建：只构建变更的包',
                                '远程缓存：团队共享构建结果',
                                '并行执行：最大化CPU利用率',
                                '依赖感知：按正确顺序执行'
                            ]
                        },
                        {
                            title: 'Turborepo性能对比',
                            code: '// 场景：10个包的monorepo\n\n// 传统方式\nnpm run build --workspaces\n// - 串行或随机并行\n// - 每次全部重新构建\n// - 时间：60秒\n\n// Turborepo\nturbo run build\n// - 智能并行（拓扑排序）\n// - 增量构建（只构建变更）\n// - 缓存命中时：<1秒\n// - 首次构建：40秒（并行）\n// - 部分变更：5-10秒'
                        },
                        {
                            title: '2. 依赖提升控制',
                            content: '使用hoist-pattern精确控制提升：',
                            code: '// .npmrc\n// pnpm配置\npublic-hoist-pattern[]=*eslint*\npublic-hoist-pattern[]=*prettier*\n\n// 只提升eslint和prettier相关包\n// 其他包隔离在.pnpm中\n// 减少幽灵依赖风险',
                            points: [
                                '防止幽灵依赖',
                                '减少依赖冲突',
                                '提升特定工具（eslint、prettier）',
                                '更严格的依赖管理'
                            ]
                        },
                        {
                            title: '3. Changesets：版本管理',
                            content: 'Changesets简化monorepo的版本和发布：',
                            code: '// 1. 创建changeset\nnpx changeset\n# 选择变更的包\n# 选择版本类型（major/minor/patch）\n# 写变更说明\n\n// 2. 生成 .changeset/文件\n// .changeset/happy-dogs-jump.md\n---\n"@myorg/utils": patch\n"@myorg/components": minor\n---\n\nFixed bug in utils, added new component\n\n// 3. 发布时\nnpx changeset version  # 更新version和CHANGELOG\nnpx changeset publish  # 发布到npm',
                            points: [
                                '自动生成CHANGELOG',
                                '处理包间依赖更新',
                                'CI集成友好',
                                '版本管理清晰'
                            ]
                        },
                        {
                            title: 'Changesets工作流',
                            code: '// 开发流程\n1. 开发功能\n   git checkout -b feature/new-button\n\n2. 添加changeset\n   npx changeset\n   git add .changeset/*\n   git commit -m "feat: add new button"\n\n3. PR合并后，changesets bot创建"Version Packages" PR\n   - 更新package.json版本\n   - 生成CHANGELOG.md\n   - 删除.changeset文件\n\n4. 合并Version PR后，CI自动发布\n   npx changeset publish'
                        },
                        {
                            title: '关于选项D（共享tsconfig）',
                            content: '❌ 选项D不是最佳实践：\n\n不同工作区可能需要不同的TypeScript配置：',
                            code: '// ✅ 推荐：继承基础配置\n// tsconfig.base.json（根目录）\n{\n  "compilerOptions": {\n    "strict": true,\n    "esModuleInterop": true\n  }\n}\n\n// packages/app/tsconfig.json\n{\n  "extends": "../../tsconfig.base.json",\n  "compilerOptions": {\n    "jsx": "react",  // app特有\n    "outDir": "dist"\n  }\n}\n\n// packages/utils/tsconfig.json\n{\n  "extends": "../../tsconfig.base.json",\n  "compilerOptions": {\n    "declaration": true,  // utils特有\n    "outDir": "lib"\n  }\n}',
                            points: [
                                '使用extends继承基础配置',
                                '允许包级别的定制',
                                '保持一致性的同时提供灵活性'
                            ]
                        },
                        {
                            title: '其他优化措施',
                            points: [
                                'nx：另一个强大的monorepo工具',
                                'Rush：微软开源的monorepo管理器',
                                'Bazel：Google的构建系统',
                                '使用git sparse-checkout减少clone大小',
                                '配置CI缓存node_modules',
                                '使用Docker layer缓存'
                            ]
                        },
                        {
                            title: '完整工具链示例',
                            code: '// package.json\n{\n  "workspaces": ["packages/*"],\n  "scripts": {\n    "build": "turbo run build",\n    "test": "turbo run test",\n    "lint": "turbo run lint",\n    "changeset": "changeset",\n    "version": "changeset version",\n    "publish": "changeset publish"\n  },\n  "devDependencies": {\n    "turbo": "latest",\n    "@changesets/cli": "latest",\n    "prettier": "latest",\n    "eslint": "latest"\n  }\n}\n\n// .npmrc (pnpm)\nshamefully-hoist=false\nstrict-peer-dependencies=true\n\n// turbo.json\n{\n  "pipeline": {\n    "build": {\n      "dependsOn": ["^build"],\n      "outputs": ["dist/**", "lib/**"]\n    }\n  },\n  "remoteCache": {\n    "enabled": true\n  }\n}'
                        }
                    ]
                },
                source: 'Monorepo工程化实践'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第14章面试题：npm安全',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=14'
        },
        next: null
    }
};
