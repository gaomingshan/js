/**
 * 第17章：Yarn基础命令 - 面试题
 * 10道精选面试题：测试对Yarn常用命令和操作的掌握
 */

window.content = {
    section: {
        title: '第17章：Yarn基础命令 - 面试题',
        icon: '🔵'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：yarn add命令',
            content: {
                difficulty: 'easy',
                tags: ['安装依赖', 'yarn add'],
                question: 'yarn add package和npm install package的区别是什么？',
                options: [
                    '完全相同',
                    'yarn add会自动保存到package.json',
                    'yarn add更快但功能相同',
                    'yarn add只能安装生产依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'yarn add vs npm install',
                    description: 'Yarn的命令设计更加直观，默认行为更友好。',
                    sections: [
                        {
                            title: '基本用法对比',
                            code: '// npm (需要--save，npm 5+后默认)\nnpm install lodash          # 自动保存到dependencies\nnpm install lodash --save   # 显式保存（旧版本需要）\nnpm install jest --save-dev # 保存到devDependencies\n\n// yarn (自动保存，更简洁)\nyarn add lodash             # 自动保存到dependencies\nyarn add jest --dev         # 保存到devDependencies\nyarn add react --peer       # 保存到peerDependencies'
                        },
                        {
                            title: '完整命令对比',
                            code: '┌─────────────────────┬──────────────────────┬─────────────────┐\n│ 操作                │ npm                  │ Yarn            │\n├─────────────────────┼──────────────────────┼─────────────────┤\n│ 安装生产依赖        │ npm install pkg      │ yarn add pkg    │\n│ 安装开发依赖        │ npm install -D pkg   │ yarn add -D pkg │\n│ 全局安装            │ npm install -g pkg   │ yarn global add │\n│ 安装所有依赖        │ npm install          │ yarn install    │\n│ 移除依赖            │ npm uninstall pkg    │ yarn remove pkg │\n│ 更新依赖            │ npm update           │ yarn upgrade    │\n│ 查看过期依赖        │ npm outdated         │ yarn outdated   │\n└─────────────────────┴──────────────────────┴─────────────────┘'
                        },
                        {
                            title: 'yarn add的优势',
                            points: [
                                '语义更清晰：add表示添加',
                                '自动保存：无需--save标志',
                                '更新yarn.lock：保证确定性',
                                '交互式选择版本：yarn add pkg@'
                            ],
                            code: '# 交互式选择版本\nyarn add lodash@\n# 输出版本列表供选择：\n# 1) lodash@4.17.21\n# 2) lodash@4.17.20\n# 3) lodash@4.17.19'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 简单题 2 - 多选题
        {
            type: 'quiz',
            title: '题目2：yarn install变体',
            content: {
                difficulty: 'easy',
                tags: ['安装', '多选题'],
                question: 'yarn install的简写形式包括哪些？',
                options: [
                    'yarn',
                    'yarn i',
                    'yarn inst',
                    'yarn in'
                ],
                correctAnswer: [0],
                explanation: {
                    title: 'Yarn命令别名',
                    description: 'Yarn支持简化命令提高效率。',
                    sections: [
                        {
                            title: '常用别名',
                            code: '// yarn install的别名\nyarn install  # 完整命令\nyarn          # 最常用简写\n\n// ❌ 不支持\nyarn i        # npm有，yarn没有\nyarn inst     # 不支持\nyarn in       # 不支持',
                            points: [
                                'yarn = yarn install（零参数时）',
                                '简洁高效，减少输入',
                                'npm install可简写为npm i',
                                'Yarn选择更简洁的yarn'
                            ]
                        },
                        {
                            title: 'yarn常用简写',
                            code: '// 没有别名（都需要完整命令）\nyarn add\nyarn remove\nyarn upgrade\n\n// 其他常用命令\nyarn run dev        # 可简写为: yarn dev\nyarn run build      # 可简写为: yarn build\nyarn test           # yarn run test的别名\n\n// 全局命令\nyarn global add     # 没有简写'
                        }
                    ]
                },
                source: 'Yarn CLI文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：yarn remove命令',
            content: {
                difficulty: 'easy',
                tags: ['移除依赖', 'yarn remove'],
                question: 'yarn remove lodash会执行哪些操作？',
                options: [
                    '只删除node_modules中的lodash',
                    '只从package.json中移除',
                    '删除node_modules、更新package.json和yarn.lock',
                    '需要手动删除node_modules'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'yarn remove完整流程',
                    description: 'Yarn会自动处理依赖移除的所有步骤。',
                    sections: [
                        {
                            title: 'yarn remove的操作',
                            code: '// 执行 yarn remove lodash\n1. 从package.json移除lodash\n2. 从yarn.lock移除相关条目\n3. 删除node_modules/lodash/\n4. 重新计算依赖树\n5. 移除不再需要的传递依赖\n\n// 一条命令完成所有清理',
                            points: [
                                '完全自动化',
                                '清理传递依赖',
                                '保持依赖树一致',
                                '更新所有相关文件'
                            ]
                        },
                        {
                            title: 'npm对比',
                            code: '// npm uninstall\nnpm uninstall lodash    # 需要显式指定--save（旧版本）\nnpm uninstall lodash --save\n\n// 现代npm (v5+)\nnpm uninstall lodash    # 自动更新package.json\n\n// Yarn更简洁语义\nyarn remove lodash      # remove比uninstall更直观'
                        },
                        {
                            title: '批量移除',
                            code: '// 移除多个包\nyarn remove lodash moment axios\n\n// 检查效果\ngit diff package.json yarn.lock'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：yarn upgrade命令',
            content: {
                difficulty: 'medium',
                tags: ['更新依赖', 'yarn upgrade'],
                question: '以下yarn upgrade的用法，哪个是错误的？',
                code: `yarn upgrade            # A: 更新所有依赖
yarn upgrade lodash     # B: 更新lodash到最新版本  
yarn upgrade --latest   # C: 忽略语义化版本更新
yarn upgrade-interactive # D: 交互式选择更新`,
                options: [
                    'A是错误的',
                    'B是错误的',
                    'C是错误的',
                    '都是正确的'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'yarn upgrade详解',
                    description: 'Yarn提供了灵活的依赖更新命令。',
                    sections: [
                        {
                            title: 'yarn upgrade基本用法',
                            code: '// A. 更新所有依赖\nyarn upgrade\n// 按照package.json的范围更新\n// "lodash": "^4.17.0" → 更新到4.x最新版\n\n// B. 更新特定包\nyarn upgrade lodash\n// 只更新lodash\n\n// C. 更新到最新版本（忽略范围）\nyarn upgrade --latest\n// "lodash": "^4.17.0" → 可能更新到5.x\n// 会修改package.json中的版本范围\n\n// D. 交互式更新\nyarn upgrade-interactive\n// 显示列表，手动选择要更新的包',
                            content: '所有用法都是正确的！'
                        },
                        {
                            title: 'upgrade vs upgrade --latest',
                            code: '// package.json\n{\n  "dependencies": {\n    "lodash": "^4.17.0"  // 允许 4.17.0 - 4.x.x\n  }\n}\n\n// yarn upgrade\n// 当前：4.17.20\n// 最新4.x：4.17.21\n// 结果：更新到4.17.21\n// package.json不变：仍是"^4.17.0"\n\n// yarn upgrade --latest\n// 当前：4.17.20\n// 最新版：5.0.0（假设）\n// 结果：更新到5.0.0\n// package.json改为："^5.0.0"\n\n// ⚠️  --latest可能引入破坏性更新',
                            points: [
                                'upgrade：尊重semver范围',
                                'upgrade --latest：突破范围限制',
                                '--latest会修改package.json',
                                '使用--latest需谨慎测试'
                            ]
                        },
                        {
                            title: 'yarn upgrade-interactive',
                            code: '# 交互式更新\nyarn upgrade-interactive --latest\n\n# 输出（彩色界面）：\n┌────────────────┬─────────┬─────────┬────────┐\n│ Package        │ Current │ Wanted  │ Latest │\n├────────────────┼─────────┼─────────┼────────┤\n│ ◯ lodash       │ 4.17.20 │ 4.17.21 │ 5.0.0  │\n│ ◯ react        │ 17.0.2  │ 17.0.2  │ 18.2.0 │\n│ ◯ webpack      │ 4.46.0  │ 4.46.0  │ 5.88.0 │\n└────────────────┴─────────┴─────────┴────────┘\n\n使用空格选择，回车确认\n◯ = 不更新\n◉ = 更新\n\n// 选择性更新，安全可控',
                            content: '推荐使用交互式更新，可以逐个审查。'
                        },
                        {
                            title: 'upgrade vs npm update',
                            code: '// npm update\nnpm update              # 类似yarn upgrade\nnpm update lodash       # 更新特定包\n# ❌ npm没有--latest标志\n# 需要使用 npm install lodash@latest\n\n// yarn更一致\nyarn upgrade            # 更新所有\nyarn upgrade lodash     # 更新特定\nyarn upgrade --latest   # 最新版本',
                            content: 'Yarn的upgrade命令更加统一和强大。'
                        },
                        {
                            title: '安全更新策略',
                            points: [
                                '日常：yarn upgrade（安全更新）',
                                '大版本：yarn upgrade-interactive --latest（手动选择）',
                                '测试：更新后运行完整测试',
                                'CI：检测更新影响',
                                '渐进：一次更新一个主要依赖'
                            ],
                            code: '// 推荐工作流\n1. yarn outdated        # 查看过期依赖\n2. yarn upgrade-interactive --latest\n3. 选择要更新的包\n4. yarn test            # 运行测试\n5. git commit           # 提交更新'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 中等题 2 - 多选题
        {
            type: 'quiz',
            title: '题目5：yarn why命令',
            content: {
                difficulty: 'medium',
                tags: ['依赖分析', '多选题'],
                question: 'yarn why lodash命令可以查看哪些信息？',
                options: [
                    '为什么安装了lodash（哪个包依赖它）',
                    'lodash的所有版本',
                    'lodash在依赖树中的位置',
                    'lodash的下载量和star数'
                ],
                correctAnswer: [0, 2],
                explanation: {
                    title: 'yarn why依赖追踪',
                    description: 'yarn why帮助理解依赖关系和排查问题。',
                    sections: [
                        {
                            title: 'yarn why基本用法',
                            code: '# 查询依赖原因\nyarn why lodash\n\n# 输出示例：\n=> Found "lodash@4.17.21"\ninfo Reasons this module exists\n   - "express" depends on it\n   - "webpack" depends on it\n   - Specified in "dependencies"\ninfo Disk size without dependencies: "1.41MB"\ninfo Disk size with unique dependencies: "1.41MB"\ninfo Disk size with transitive dependencies: "1.41MB"\ninfo Number of shared dependencies: 0',
                            points: [
                                '显示哪些包依赖它',
                                '是直接依赖还是传递依赖',
                                '磁盘占用大小',
                                '帮助理解依赖树'
                            ]
                        },
                        {
                            title: '实际应用场景',
                            code: '// 场景1：意外的依赖\n// 发现node_modules中有个不认识的包\nyarn why some-unknown-package\n# 查看是谁引入的\n\n// 场景2：重复依赖\n// 多个版本的同一个包\nyarn list lodash\n# 列出所有版本\nyarn why lodash@4.17.20\nyarn why lodash@4.17.21\n# 分别查看哪个包依赖不同版本\n\n// 场景3：依赖清理\n// 准备移除某个包\nyarn why express\n# 确认没有其他包依赖它\nyarn remove express  # 安全移除',
                            content: '非常实用的调试工具。'
                        },
                        {
                            title: '对比npm',
                            code: '// npm的等价命令\nnpm ls lodash    # 列出依赖树\n# 输出：\n# ├─┬ express@4.18.0\n# │ └── lodash@4.17.21\n# └─┬ webpack@5.88.0\n#   └── lodash@4.17.21\n\n// npm explain (npm 7+)\nnpm explain lodash\n# 类似yarn why的功能',
                            content: 'Yarn的why更简洁直观。'
                        },
                        {
                            title: '关于选项B和D',
                            content: '❌ 不正确的选项：\n\nB. 所有版本：\n- yarn why只显示已安装的版本\n- 要查看所有可用版本：yarn info lodash versions\n\nD. 下载量和star数：\n- yarn why不显示统计信息\n- 要查看：yarn info lodash或访问npmjs.com'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz-code',
            title: '题目6：yarn global命令',
            content: {
                difficulty: 'medium',
                tags: ['全局安装', 'yarn global'],
                question: 'yarn global add和npm install -g的主要区别是什么？',
                code: `npm install -g create-react-app
yarn global add create-react-app`,
                options: [
                    '安装位置不同',
                    '只有语法不同，结果相同',
                    'Yarn全局包有独立的package.json',
                    'npm不支持全局安装'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'Yarn vs npm全局安装',
                    description: 'Yarn和npm的全局安装机制有显著差异。',
                    sections: [
                        {
                            title: '安装位置对比',
                            code: '// npm全局位置\n// macOS/Linux\n/usr/local/lib/node_modules/\n\n// Windows\nC:\\Users\\Username\\AppData\\Roaming\\npm\\node_modules\\\n\n// 查看\nnpm config get prefix\n\n// Yarn全局位置（Yarn 1）\n// macOS/Linux\n~/.config/yarn/global/node_modules/\n\n// Windows  \nC:\\Users\\Username\\AppData\\Local\\Yarn\\Data\\global\\\n\n// 查看\nyarn global dir',
                            content: 'Yarn和npm使用完全不同的全局目录。'
                        },
                        {
                            title: 'Yarn全局包管理',
                            code: '// Yarn的全局目录有独立的package.json\n~/.config/yarn/global/\n├── node_modules/\n│   ├── create-react-app/\n│   ├── typescript/\n│   └── ...\n├── package.json        # 记录所有全局包\n└── yarn.lock           # 全局锁文件\n\n// 查看全局包\nyarn global list\n\n// 查看全局package.json\ncat $(yarn global dir)/package.json',
                            points: [
                                '独立的依赖管理',
                                '有yarn.lock保证一致性',
                                '可以像项目一样管理全局包',
                                '团队可以共享全局包配置'
                            ]
                        },
                        {
                            title: 'Yarn Berry的变化',
                            code: '// Yarn Berry (2+)不推荐全局安装\n// 推荐使用yarn dlx（类似npx）\n\n// 旧方式\nyarn global add create-react-app\ncreate-react-app my-app\n\n// 新方式（推荐）\nyarn dlx create-react-app my-app\n# 临时下载运行，不安装到全局\n\n// 等价于npm的npx\nnpx create-react-app my-app',
                            content: '现代实践倾向于避免全局安装。'
                        },
                        {
                            title: '全局命令管理',
                            code: '// 添加全局包\nyarn global add typescript\n\n// 移除全局包\nyarn global remove typescript\n\n// 更新全局包\nyarn global upgrade\n\n// 查看全局包\nyarn global list\n\n// 查看全局bin目录\nyarn global bin\n# 输出：~/.yarn/bin\n# 需要添加到PATH：\nexport PATH="$(yarn global bin):$PATH"'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '尽量避免全局安装',
                                '优先使用npx/yarn dlx',
                                '必要的全局工具：nvm、yarn自身',
                                '项目依赖：安装到devDependencies',
                                'CI环境：使用npx避免全局依赖'
                            ],
                            code: '// ❌ 不推荐\nyarn global add webpack\nyarn global add eslint\n\n// ✅ 推荐\n// package.json\n{\n  "devDependencies": {\n    "webpack": "^5.0.0",\n    "eslint": "^8.0.0"\n  },\n  "scripts": {\n    "build": "webpack",\n    "lint": "eslint ."\n  }\n}\n\n// 使用\nyarn build\nyarn lint'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目7：yarn info命令',
            content: {
                difficulty: 'medium',
                tags: ['包信息', 'yarn info'],
                question: 'yarn info react可以查看哪些信息？',
                options: [
                    '只有包的版本号',
                    '包的元数据、版本历史、依赖关系等',
                    '包的源代码',
                    '包的下载统计'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'yarn info包信息查询',
                    description: 'yarn info提供包的详细元数据，帮助决策和调试。',
                    sections: [
                        {
                            title: '基本用法',
                            code: '# 查看包的完整信息\nyarn info react\n\n# 输出（JSON格式）：\n{\n  "name": "react",\n  "version": "18.2.0",\n  "description": "React is a JavaScript library...",\n  "dist-tags": {\n    "latest": "18.2.0",\n    "next": "18.3.0-next.1"\n  },\n  "dependencies": {\n    "loose-envify": "^1.1.0"\n  },\n  ...\n}'
                        },
                        {
                            title: '查询特定字段',
                            code: '// 只查看版本\nyarn info react version\n# 18.2.0\n\n// 查看所有版本\nyarn info react versions\n# ["0.0.1", "0.0.2", ..., "18.2.0"]\n\n// 查看描述\nyarn info react description\n\n// 查看依赖\nyarn info react dependencies\n\n// 查看仓库地址\nyarn info react repository.url\n# https://github.com/facebook/react\n\n// 查看许可证\nyarn info react license\n# MIT',
                            content: '可以精确查询任何字段。'
                        },
                        {
                            title: '实际应用',
                            code: '// 场景1：选择版本\nyarn info lodash versions\n# 查看所有可用版本\nyarn add lodash@4.17.21\n\n// 场景2：检查依赖\nyarn info webpack peerDependencies\n# 查看需要的peer依赖\n\n// 场景3：验证包\nyarn info some-package\n# 确认包存在且可安装\n\n// 场景4：查看维护者\nyarn info react maintainers\n# [{ name: "...", email: "..." }]'
                        },
                        {
                            title: 'npm对比',
                            code: '// npm view (等价命令)\nnpm view react\nnpm view react version\nnpm view react versions\n\n// npm info (别名)\nnpm info react\n\n// 输出格式略有不同，但信息相同'
                        }
                    ]
                },
                source: 'Yarn官方文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz-code',
            title: '题目8：yarn install参数',
            content: {
                difficulty: 'hard',
                tags: ['安装选项', 'yarn install'],
                question: '以下yarn install参数的作用分别是什么？',
                code: `yarn install --frozen-lockfile
yarn install --production
yarn install --force
yarn install --flat`,
                options: [
                    '都是加速安装的参数',
                    '分别是：禁止更新锁文件、只装生产依赖、强制重装、扁平化依赖',
                    '都是Yarn Berry特有的参数',
                    '这些参数不能同时使用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'yarn install高级参数',
                    description: '理解这些参数对于CI/CD和生产部署至关重要。',
                    sections: [
                        {
                            title: '--frozen-lockfile',
                            code: 'yarn install --frozen-lockfile\n\n// 作用：\n// 1. 严格按照yarn.lock安装\n// 2. 如果yarn.lock和package.json不匹配，报错退出\n// 3. 禁止更新yarn.lock\n\n// 使用场景：\n✅ CI/CD环境\n✅ 生产部署\n✅ 确保环境一致性\n\n// 示例：\n// package.json: "lodash": "^4.17.0"\n// yarn.lock:    lodash@4.17.20\n// registry最新: lodash@4.17.21\n\n// 普通安装：可能更新到4.17.21\n// --frozen-lockfile：严格安装4.17.20',
                            points: [
                                'CI必备参数',
                                '防止意外更新',
                                '保证可重现构建',
                                'npm ci的等价物'
                            ]
                        },
                        {
                            title: '--production',
                            code: 'yarn install --production\n\n// 作用：\n// 只安装dependencies，跳过devDependencies\n\n// package.json\n{\n  "dependencies": {\n    "express": "^4.18.0"  // ✅ 会安装\n  },\n  "devDependencies": {\n    "jest": "^29.0.0",    // ❌ 跳过\n    "webpack": "^5.0.0"  // ❌ 跳过\n  }\n}\n\n// 使用场景：\n✅ 生产环境部署\n✅ Docker镜像构建\n✅ 减小部署体积\n\n// 等价于\nNODE_ENV=production yarn install',
                            content: '生产部署不需要开发工具，可节省空间和时间。'
                        },
                        {
                            title: '--force',
                            code: 'yarn install --force\n\n// 作用：\n// 1. 忽略缓存\n// 2. 重新下载所有包\n// 3. 清空node_modules重新安装\n\n// 使用场景：\n- 依赖损坏\n- 缓存问题\n- node_modules混乱\n- 调试安装问题\n\n// 等价于：\nrm -rf node_modules\nyarn cache clean\nyarn install',
                            content: '⚠️ 慢但彻底，解决各种奇怪问题的终极方案。'
                        },
                        {
                            title: '--flat',
                            code: 'yarn install --flat\n\n// 作用：\n// 强制单一版本依赖\n// 如果有版本冲突，要求手动选择\n\n// 场景：依赖了不同版本的lodash\n// packageA → lodash@^4.17.0\n// packageB → lodash@^4.16.0\n\n// 普通安装：两个版本都装\n// --flat：提示选择一个版本\n\n┌──────────────────────────────────┐\n│ Multiple versions of lodash:     │\n│ 1) 4.17.21 (preferred)           │\n│ 2) 4.16.6                        │\n│ Select version (1):              │\n└──────────────────────────────────┘',
                            points: [
                                '避免版本冲突',
                                '减少包重复',
                                '需要手动交互',
                                '适合严格的项目'
                            ]
                        },
                        {
                            title: '其他重要参数',
                            code: '// --prefer-offline\nyarn install --prefer-offline\n// 优先使用缓存，缺失才下载\n\n// --offline\nyarn install --offline\n// 完全离线，缓存未命中则失败\n\n// --ignore-scripts\nyarn install --ignore-scripts\n// 跳过postinstall等脚本（安全考虑）\n\n// --check-files\nyarn install --check-files\n// 验证node_modules中的文件完整性',
                            content: '根据场景选择合适的参数组合。'
                        },
                        {
                            title: 'CI/CD最佳实践',
                            code: '// .github/workflows/ci.yml\njobs:\n  build:\n    steps:\n      - uses: actions/checkout@v3\n      \n      - name: Cache dependencies\n        uses: actions/cache@v3\n        with:\n          path: ~/.cache/yarn\n          key: yarn-${{ hashFiles(\'yarn.lock\') }}\n      \n      - name: Install\n        run: yarn install --frozen-lockfile --prefer-offline\n      \n      - name: Build\n        run: yarn build\n\n// Docker生产镜像\nRUN yarn install --production --frozen-lockfile --ignore-scripts',
                            points: [
                                'CI：frozen-lockfile + prefer-offline',
                                '生产：production + frozen-lockfile',
                                '安全：ignore-scripts',
                                '调试：force'
                            ]
                        }
                    ]
                },
                source: 'Yarn CLI文档'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目9：Yarn命令最佳实践',
            content: {
                difficulty: 'hard',
                tags: ['最佳实践', '多选题'],
                question: '在团队协作中，以下哪些Yarn使用习惯是推荐的？',
                options: [
                    '提交yarn.lock到版本控制',
                    '使用yarn upgrade-interactive进行依赖更新',
                    '在package.json的scripts中锁定Yarn版本',
                    '频繁执行yarn cache clean释放空间'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'Yarn团队协作最佳实践',
                    description: '建立规范可以避免大量问题并提高效率。',
                    sections: [
                        {
                            title: '1. 提交yarn.lock',
                            code: '// ✅ .gitignore正确配置\nnode_modules/\n# 不要忽略yarn.lock！\n\n// ❌ 错误做法\nnode_modules/\nyarn.lock        # ❌ 不要这样！\n\n// 原因：\n- yarn.lock确保团队依赖一致\n- 避免"在我机器上能跑"问题\n- CI/CD环境一致性\n- 可追溯依赖变更历史',
                            points: [
                                '必须提交yarn.lock',
                                '冲突时yarn install重新生成',
                                '不要手动编辑',
                                'Code Review检查变更'
                            ]
                        },
                        {
                            title: '2. 交互式更新',
                            code: '// ✅ 推荐的更新流程\n1. yarn outdated              # 查看过期依赖\n2. yarn upgrade-interactive   # 交互式选择\n3. 选择要更新的包\n4. yarn test                  # 运行测试\n5. git commit -m "chore: upgrade deps"\n\n// ❌ 不推荐\nyarn upgrade --latest  # 全部更新到最新，风险大\n\n// 为什么交互式更新更好：\n- 逐个审查变更\n- 避免破坏性更新\n- 可以查看changelog\n- 团队成员理解更新原因',
                            content: '渐进式更新比激进式更新更安全。'
                        },
                        {
                            title: '3. 锁定Yarn版本',
                            code: '// package.json\n{\n  "engines": {\n    "node": ">=14.0.0",\n    "yarn": "^1.22.0"  // 锁定Yarn版本\n  },\n  "packageManager": "yarn@3.6.0"  // Yarn Berry\n}\n\n// 为什么重要：\n- 团队使用相同版本\n- 避免命令行为不一致\n- 防止Yarn 1 vs Berry混用\n- CI环境版本一致\n\n// 使用Yarn Berry的自动版本管理\nyarn set version 3.6.0\n// 生成.yarn/releases/yarn-3.6.0.cjs\n// 提交到git，团队自动使用此版本',
                            points: [
                                '使用engines字段声明',
                                'Berry使用yarn set version',
                                '提交.yarn/releases/到git',
                                'CI使用项目指定的版本'
                            ]
                        },
                        {
                            title: '关于选项D（cache clean）',
                            content: '❌ 不推荐频繁清理缓存：',
                            code: '// 不要频繁执行\nyarn cache clean\n\n// 原因：\n- 缓存是Yarn性能的关键\n- 清理后需要重新下载\n- 浪费时间和带宽\n- 自动管理已足够好\n\n// 什么时候需要清理：\n✅ 磁盘空间严重不足\n✅ 缓存损坏（极少见）\n✅ 升级Yarn大版本后\n\n// 正常使用无需清理',
                            points: [
                                '缓存是好东西，不要乱删',
                                'Yarn会自动管理缓存',
                                '清理缓存降低性能',
                                '只在必要时清理'
                            ]
                        },
                        {
                            title: '其他最佳实践',
                            code: '// 5. 使用脚本而非全局命令\n// ✅ package.json\n{\n  "scripts": {\n    "dev": "webpack-dev-server",\n    "build": "webpack",\n    "test": "jest"\n  },\n  "devDependencies": {\n    "webpack": "^5.0.0",\n    "jest": "^29.0.0"\n  }\n}\n\n// ❌ 全局安装\nyarn global add webpack\nyarn global add jest\n\n// 6. CI使用frozen-lockfile\n// .github/workflows/ci.yml\n- run: yarn install --frozen-lockfile\n\n// 7. Code Review检查\n- package.json变更\n- yarn.lock变更\n- 新依赖的必要性\n- 依赖版本选择合理性',
                            points: [
                                '避免全局依赖',
                                '项目依赖本地化',
                                'CI严格模式',
                                'Code Review依赖变更'
                            ]
                        },
                        {
                            title: '团队规范文档',
                            code: '// CONTRIBUTING.md\n# 依赖管理规范\n\n## 添加依赖\n1. 确认必要性\n2. yarn add <package>\n3. 运行测试\n4. 提交PR，包含package.json和yarn.lock\n\n## 更新依赖\n1. yarn outdated查看\n2. yarn upgrade-interactive选择\n3. 运行测试确保兼容\n4. 更新CHANGELOG\n\n## 不要\n- ❌ 手动编辑yarn.lock\n- ❌ 频繁yarn cache clean\n- ❌ 全局安装项目依赖\n- ❌ 忽略yarn.lock冲突',
                            content: '明确的规范避免混乱。'
                        }
                    ]
                },
                source: 'Yarn最佳实践'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz-code',
            title: '题目10：Yarn命令组合',
            content: {
                difficulty: 'hard',
                tags: ['命令组合', '实战'],
                question: '新成员clone项目后，推荐的命令顺序是什么？',
                code: `git clone project
cd project
# 接下来执行什么？`,
                options: [
                    'yarn → yarn dev',
                    'yarn install --frozen-lockfile → yarn build → yarn dev',
                    'yarn cache clean → yarn install → yarn dev',
                    'yarn upgrade → yarn install → yarn dev'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'Yarn工作流最佳实践',
                    description: '理解正确的命令顺序和工作流对高效开发至关重要。',
                    sections: [
                        {
                            title: '正确答案分析',
                            code: '// ✅ 最简单的方式\ngit clone project\ncd project\nyarn        # 或yarn install\nyarn dev    # 或yarn start\n\n// 为什么这样就够了：\n1. yarn自动读取yarn.lock\n2. yarn.lock确保版本一致\n3. 不需要额外参数\n4. 缓存加速安装\n5. 立即开始开发',
                            content: 'Yarn的设计理念就是简单易用。'
                        },
                        {
                            title: '为什么不需要--frozen-lockfile',
                            code: '// 选项B包含--frozen-lockfile\nyarn install --frozen-lockfile\n\n// 为什么不需要：\n// 1. 开发环境不需要如此严格\n// 2. 如果package.json更新了，应该允许更新lock\n// 3. --frozen-lockfile是CI/CD专用\n\n// 开发环境  vs  CI环境\n┌───────────────┬─────────────┬──────────────────────┐\n│ 场景          │ 命令        │ 原因                 │\n├───────────────┼─────────────┼──────────────────────┤\n│ 本地开发      │ yarn        │ 灵活，允许更新       │\n│ CI/CD         │ --frozen-*  │ 严格，保证一致       │\n│ 生产部署      │ --frozen-*  │ 严格，不可变         │\n└───────────────┴─────────────┴──────────────────────┘',
                            content: '不同环境需要不同策略。'
                        },
                        {
                            title: '为什么不需要cache clean',
                            code: '// 选项C包含cache clean\nyarn cache clean\nyarn install\n\n// 为什么不需要：\n// 1. 新clone的项目，缓存是干净的\n// 2. cache clean会删除全部缓存\n// 3. 删除后需要重新下载所有包\n// 4. 浪费时间和带宽\n\n// cache clean的真实使用场景\n❌ 新项目开始时\n❌ 常规开发流程\n✅ 缓存损坏（极少）\n✅ 磁盘空间紧张\n✅ Yarn版本升级',
                            content: '缓存是Yarn的核心优势，不要轻易清理。'
                        },
                        {
                            title: '为什么不需要upgrade',
                            code: '// 选项D包含upgrade\nyarn upgrade\nyarn install\n\n// 为什么不对：\n// 1. clone后不应该立即更新依赖\n// 2. 应该先运行原有版本\n// 3. 确保能正常工作后再更新\n// 4. 依赖更新需要测试验证\n\n// 正确的更新时机\n❌ git clone之后\n❌ 每次yarn install之前\n✅ 定期维护时（周/月）\n✅ 有安全漏洞时\n✅ 需要新特性时',
                            content: '更新依赖应该是慎重的独立操作，不是日常流程。'
                        },
                        {
                            title: '完整的新项目工作流',
                            code: '// 1. Clone项目\ngit clone git@github.com:org/project.git\ncd project\n\n// 2. 查看README\ncat README.md  # 了解项目要求\n\n// 3. 检查Node版本\nnode --version  # 确保满足engines要求\n\n// 4. 安装依赖\nyarn  # 简单！\n\n// 5. 查看可用脚本\nyarn run  # 或查看package.json的scripts\n\n// 6. 启动开发\nyarn dev  # 或yarn start\n\n// 7. 运行测试（可选）\nyarn test',
                            content: '简单、直接、不需要额外参数。'
                        },
                        {
                            title: '不同场景的命令',
                            code: '// 场景1：本地开发（最常用）\nyarn\nyarn dev\n\n// 场景2：CI/CD\nyarn install --frozen-lockfile --prefer-offline\nyarn test\nyarn build\n\n// 场景3：生产部署\nyarn install --production --frozen-lockfile --ignore-scripts\n\n// 场景4：依赖更新\nyarn outdated\nyarn upgrade-interactive\nyarn test\n\n// 场景5：故障排查\nrm -rf node_modules yarn.lock\nyarn install --force\n\n// 场景6：完全离线\nyarn install --offline',
                            content: '根据场景选择合适的命令和参数。'
                        },
                        {
                            title: '团队onboarding文档',
                            code: '// README.md\n# 快速开始\n\n## 环境要求\n- Node.js >= 14\n- Yarn >= 1.22\n\n## 安装运行\n```bash\n# 1. Clone项目\ngit clone ...\ncd project\n\n# 2. 安装依赖\nyarn\n\n# 3. 启动开发服务器\nyarn dev\n\n# 访问 http://localhost:3000\n```\n\n## 常用命令\n```bash\nyarn dev      # 开发\nyarn build    # 构建\nyarn test     # 测试\nyarn lint     # 检查\n```\n\n就这么简单！',
                            points: [
                                '文档清晰简洁',
                                '一步步指引',
                                '避免复杂参数',
                                '新人友好'
                            ]
                        }
                    ]
                },
                source: 'Yarn工作流最佳实践'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第16章面试题：Yarn简介与特性',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=16'
        },
        next: {
            title: '第18章面试题：Yarn Workspaces',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=18'
        }
    }
};
