/**
 * 第13章：npm生命周期钩子 - 面试题
 * 10道精选面试题：测试对npm生命周期脚本的理解
 */

window.content = {
    section: {
        title: '第13章：npm生命周期钩子 - 面试题',
        icon: '🚀'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：生命周期钩子基础',
            content: {
                difficulty: 'easy',
                tags: ['生命周期', 'pre/post'],
                question: 'npm生命周期钩子的命名规则是什么？',
                options: [
                    'before/after + 命令名',
                    'pre/post + 命令名',
                    'on/off + 命令名',
                    'start/end + 命令名'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm生命周期钩子',
                    description: 'npm使用pre和post前缀自动创建生命周期钩子。',
                    sections: [
                        {
                            title: '钩子命名规则',
                            points: [
                                'pre<script>：在脚本执行前运行',
                                'post<script>：在脚本执行后运行',
                                '自动识别：无需特殊配置',
                                '任何自定义脚本都支持pre/post钩子'
                            ]
                        },
                        {
                            title: '基础示例',
                            code: '{\n  "scripts": {\n    "prebuild": "echo \'开始构建\'",\n    "build": "webpack",\n    "postbuild": "echo \'构建完成\'"\n  }\n}\n\n// 执行 npm run build 时的输出：\n> prebuild\n开始构建\n\n> build  \nwebpack 构建中...\n\n> postbuild\n构建完成'
                        },
                        {
                            title: '执行顺序',
                            content: '钩子总是按照 pre → 主命令 → post 的顺序执行。如果任何一个环节失败（退出码非0），后续步骤会被中止。'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：install生命周期',
            content: {
                difficulty: 'easy',
                tags: ['install', '生命周期'],
                question: 'npm install执行时会触发哪些生命周期钩子？',
                options: [
                    '只有install',
                    'preinstall → install → postinstall',
                    'preinstall → install → postinstall → prepare',
                    'prepare → preinstall → install → postinstall'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm install生命周期',
                    description: 'npm install有一套完整的生命周期钩子链。',
                    sections: [
                        {
                            title: '完整执行顺序',
                            points: [
                                '1. preinstall：安装前执行',
                                '2. install：安装过程中执行（已废弃）',
                                '3. postinstall：安装后执行',
                                '4. prepublish：已废弃，不推荐使用',
                                '5. preprepare：prepare之前（npm 7+）',
                                '6. prepare：安装后、打包前执行'
                            ]
                        },
                        {
                            title: '实际应用',
                            code: '{\n  "scripts": {\n    "preinstall": "node scripts/check-env.js",\n    "postinstall": "npm run build",\n    "prepare": "husky install"\n  }\n}\n\n// npm install执行流程：\n// 1. preinstall - 检查环境\n// 2. 安装依赖\n// 3. postinstall - 构建项目\n// 4. prepare - 设置git hooks'
                        },
                        {
                            title: 'prepare的特殊性',
                            content: 'prepare在以下情况都会执行：\n- npm install（包括npm ci）\n- npm publish\n- git clone后首次npm install\n\n常用于：\n- 设置git hooks（husky）\n- 自动构建（确保dist目录存在）'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：prepare vs prepublishOnly',
            content: {
                difficulty: 'easy',
                tags: ['prepare', 'prepublishOnly'],
                question: 'prepare和prepublishOnly的区别是什么？',
                options: [
                    '两者完全相同',
                    'prepare在install和publish时都执行，prepublishOnly只在publish时执行',
                    'prepare只在publish时执行，prepublishOnly在install时执行',
                    'prepare用于开发，prepublishOnly用于生产'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'prepare vs prepublishOnly',
                    description: '这两个钩子有不同的触发时机和用途。',
                    sections: [
                        {
                            title: 'prepare钩子',
                            points: [
                                '触发时机：npm install、npm publish、git安装',
                                '用途：确保必要的构建产物存在',
                                '示例：构建代码、安装git hooks',
                                '特点：适合需要在多个场景执行的任务'
                            ],
                            code: '{\n  "scripts": {\n    "prepare": "husky install && npm run build"\n  }\n}\n\n// 开发时：git clone后npm install会自动构建\n// 发布时：npm publish前会自动构建'
                        },
                        {
                            title: 'prepublishOnly钩子',
                            points: [
                                '触发时机：只在npm publish之前',
                                '用途：发布前的检查和准备',
                                '示例：运行测试、代码检查',
                                '特点：不影响日常开发，只在发布时执行'
                            ],
                            code: '{\n  "scripts": {\n    "prepublishOnly": "npm test && npm run lint"\n  }\n}\n\n// 只在 npm publish 时执行\n// npm install 不会触发'
                        },
                        {
                            title: '组合使用',
                            code: '{\n  "scripts": {\n    "test": "jest",\n    "build": "rollup -c",\n    "lint": "eslint src/",\n    \n    "prepare": "npm run build",  // 确保构建产物存在\n    "prepublishOnly": "npm run lint && npm test"  // 发布前检查\n  }\n}'
                        },
                        {
                            title: 'prepublish已废弃',
                            content: '⚠️ prepublish在npm 4之前的行为：\n- npm install时也会执行\n- 容易导致意外的构建\n\nnpm 4+后推荐使用：\n- prepare：替代prepublish的install时行为\n- prepublishOnly：只在发布时执行'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：version生命周期',
            content: {
                difficulty: 'medium',
                tags: ['version', '版本管理'],
                question: 'npm version命令会触发哪些生命周期钩子？',
                options: [
                    'preversion → version → postversion',
                    'version → postversion',
                    'preversion → postversion',
                    '不会触发任何钩子'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm version生命周期',
                    description: 'npm version有专门的生命周期钩子用于版本管理自动化。',
                    sections: [
                        {
                            title: '执行顺序',
                            points: [
                                '1. preversion：更新版本号之前',
                                '2. 更新package.json的version字段',
                                '3. version：版本号更新后',
                                '4. 创建git commit和tag',
                                '5. postversion：完成后'
                            ]
                        },
                        {
                            title: '自动化发布流程',
                            code: '{\n  "scripts": {\n    "preversion": "npm test",\n    "version": "npm run build && git add -A dist",\n    "postversion": "git push && git push --tags && npm publish"\n  }\n}\n\n// 执行 npm version patch 时：\n// 1. preversion - 运行测试\n// 2. 更新版本号（1.0.0 → 1.0.1）\n// 3. version - 构建并添加构建产物到git\n// 4. 创建commit和tag\n// 5. postversion - 推送到git并发布到npm'
                        },
                        {
                            title: '典型用例',
                            code: '// 检查工作区是否干净\n{\n  "preversion": "git diff-index --quiet HEAD --"\n}\n\n// 更新CHANGELOG\n{\n  "version": "conventional-changelog -p angular -i CHANGELOG.md -s"\n}\n\n// 发布后通知\n{\n  "postversion": "echo \'Version updated successfully!\'"\n}'
                        },
                        {
                            title: '完整示例',
                            code: '{\n  "scripts": {\n    "test": "jest",\n    "build": "rollup -c",\n    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",\n    \n    "preversion": "npm test",\n    "version": "npm run build && npm run changelog && git add -A",\n    "postversion": "git push && git push --tags",\n    \n    "prepublishOnly": "npm test && npm run build",\n    "postpublish": "echo \'📦 Published successfully!\'"\n  }\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：test钩子',
            content: {
                difficulty: 'medium',
                tags: ['test', '钩子'],
                question: 'npm test执行时的钩子执行顺序是？',
                options: [
                    'pretest → test → posttest',
                    'test → posttest',
                    'pretest → test',
                    '只执行test'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm test生命周期',
                    description: 'npm test（npm run test的别名）也有完整的pre/post钩子。',
                    sections: [
                        {
                            title: '测试钩子配置',
                            code: '{\n  "scripts": {\n    "pretest": "npm run lint",\n    "test": "jest",\n    "posttest": "npm run coverage-report"\n  }\n}\n\n// 执行 npm test 时：\n// 1. pretest - 代码检查\n// 2. test - 运行测试\n// 3. posttest - 生成覆盖率报告'
                        },
                        {
                            title: '实际应用场景',
                            code: '// 测试前准备\n{\n  "pretest": "npm run build:test && npm run setup-test-db"\n}\n\n// 测试\n{\n  "test": "jest --coverage"\n}\n\n// 测试后清理\n{\n  "posttest": "npm run cleanup-test-db"\n}'
                        },
                        {
                            title: '跳过钩子',
                            content: '有时需要跳过pre/post钩子：',
                            code: '# 只运行test，跳过pre和post\nnpm run test --ignore-scripts\n\n# 或直接调用\nnode_modules/.bin/jest'
                        },
                        {
                            title: 'npm的别名命令',
                            points: [
                                'npm test = npm run test = npm t',
                                'npm start = npm run start',
                                'npm stop = npm run stop',
                                'npm restart = npm run stop && npm run start',
                                '这些别名命令都支持pre/post钩子'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：restart钩子',
            content: {
                difficulty: 'medium',
                tags: ['restart', '复合钩子'],
                question: 'npm restart执行时会触发哪些脚本？',
                options: [
                    '只执行restart脚本',
                    'prerestart → restart → postrestart',
                    'prerestart → prestop → stop → poststop → prestart → start → poststart → postrestart',
                    'stop → start'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm restart生命周期',
                    description: 'npm restart是一个复合命令，会触发完整的stop和start生命周期。',
                    sections: [
                        {
                            title: '完整执行顺序',
                            points: [
                                '1. prerestart',
                                '2. prestop → stop → poststop',
                                '3. prestart → start → poststart',
                                '4. postrestart'
                            ]
                        },
                        {
                            title: '示例配置',
                            code: '{\n  "scripts": {\n    "prerestart": "echo \'准备重启...\'",\n    \n    "prestop": "echo \'准备停止...\'",\n    "stop": "pm2 stop app",\n    "poststop": "echo \'已停止\'",\n    \n    "prestart": "echo \'准备启动...\'",\n    "start": "pm2 start app",\n    "poststart": "echo \'已启动\'",\n    \n    "postrestart": "echo \'重启完成\'"\n  }\n}\n\n// 执行 npm restart 的输出：\n// 准备重启...\n// 准备停止...\n// [PM2] Stopping app\n// 已停止\n// 准备启动...\n// [PM2] Starting app\n// 已启动\n// 重启完成'
                        },
                        {
                            title: '如果没有定义stop',
                            content: '如果package.json中没有定义stop脚本：',
                            code: '{\n  "scripts": {\n    "start": "node server.js"\n  }\n}\n\n// npm restart 只会执行：\n// prerestart → prestart → start → poststart → postrestart'
                        },
                        {
                            title: '实际应用',
                            code: '// 开发环境热重启\n{\n  "scripts": {\n    "dev": "nodemon server.js",\n    "prerestart": "npm run build",\n    "restart": "npm run dev"\n  }\n}\n\n// 生产环境平滑重启\n{\n  "scripts": {\n    "stop": "pm2 stop all",\n    "start": "pm2 start ecosystem.config.js",\n    "restart": "pm2 reload all"  // 零停机重启\n  }\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 4 - 多选题
        {
            type: 'quiz',
            title: '题目7：自定义脚本钩子',
            content: {
                difficulty: 'medium',
                tags: ['自定义脚本', '钩子', '多选题'],
                question: '关于自定义脚本的pre/post钩子，以下说法正确的是？',
                options: [
                    '任何自定义脚本都自动支持pre/post钩子',
                    'pre钩子失败会阻止主脚本执行',
                    '可以有多层嵌套的pre/post钩子',
                    'npm run可以跳过pre/post钩子'
                ],
                correctAnswer: [0, 1],
                explanation: {
                    title: '自定义脚本钩子特性',
                    description: 'npm为所有脚本（包括自定义的）自动提供pre/post钩子支持。',
                    sections: [
                        {
                            title: '自动支持钩子',
                            code: '{\n  "scripts": {\n    "predeploy": "npm test && npm run build",\n    "deploy": "gh-pages -d dist",\n    "postdeploy": "echo \'Deployed successfully!\'"\n  }\n}\n\n// npm run deploy 会自动执行：\n// 1. predeploy\n// 2. deploy\n// 3. postdeploy'
                        },
                        {
                            title: '钩子失败会中止执行',
                            code: '{\n  "scripts": {\n    "prebuild": "npm run lint",  // 如果失败，build不会执行\n    "build": "webpack",\n    "postbuild": "npm run deploy"  // 如果build失败，不会执行\n  }\n}\n\n// 任何步骤返回非0退出码，后续步骤都会被跳过'
                        },
                        {
                            title: '不支持嵌套钩子',
                            content: '❌ 不支持：',
                            code: '{\n  "scripts": {\n    "prebuild": "echo \'pre\'",\n    "preprebuild": "echo \'不会执行\'",  // ❌ 无效\n    "postpostbuild": "echo \'不会执行\'"  // ❌ 无效\n  }\n}\n\n// npm只识别一层pre/post前缀'
                        },
                        {
                            title: '跳过钩子',
                            code: '# 跳过所有pre/post钩子\nnpm run build --ignore-scripts\n\n# 或使用--\nnpm run build -- --no-scripts\n\n# 注意：这会跳过所有生命周期脚本，包括依赖的postinstall'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '保持钩子简单：每个钩子只做一件事',
                                '使用有意义的名字：predeploy、postbuild等',
                                '避免循环依赖：build调用deploy，deploy又调用build',
                                '记录失败原因：在钩子中添加清晰的错误信息'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：依赖包的生命周期',
            content: {
                difficulty: 'hard',
                tags: ['依赖', 'postinstall'],
                question: '当安装一个包时，该包的postinstall脚本会执行吗？',
                options: [
                    '不会执行',
                    '只有直接依赖的postinstall会执行',
                    '所有依赖（包括依赖的依赖）的postinstall都会执行',
                    '需要手动指定才会执行'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '依赖包的生命周期执行',
                    description: 'npm会递归执行所有依赖包的postinstall脚本。',
                    sections: [
                        {
                            title: '执行机制',
                            content: '当执行npm install时：',
                            points: [
                                '1. 安装所有依赖（递归）',
                                '2. 从最深层依赖开始，执行postinstall',
                                '3. 逐层向上执行',
                                '4. 最后执行根项目的postinstall'
                            ]
                        },
                        {
                            title: '示例场景',
                            code: '// 项目结构\nmy-app/\n├── package.json\n└── node_modules/\n    ├── pkg-a/  (有postinstall)\n    │   └── node_modules/\n    │       └── pkg-c/  (有postinstall)\n    └── pkg-b/  (有postinstall)\n\n// 执行 npm install 时的顺序：\n// 1. pkg-c 的 postinstall\n// 2. pkg-a 的 postinstall\n// 3. pkg-b 的 postinstall\n// 4. my-app 的 postinstall'
                        },
                        {
                            title: 'postinstall常见用途',
                            points: [
                                '编译原生模块：node-gyp rebuild',
                                '下载二进制文件：puppeteer下载Chrome',
                                '构建项目：TypeScript编译',
                                '设置配置：创建配置文件'
                            ],
                            code: '// puppeteer的postinstall\n{\n  "scripts": {\n    "postinstall": "node install.js"  // 下载Chrome\n  }\n}\n\n// node-sass的postinstall\n{\n  "scripts": {\n    "postinstall": "node scripts/build.js"  // 编译C++代码\n  }\n}'
                        },
                        {
                            title: '跳过postinstall',
                            content: '有时需要跳过依赖的postinstall（加快安装速度）：',
                            code: '# 跳过所有postinstall\nnpm install --ignore-scripts\n\n# 或设置配置\nnpm config set ignore-scripts true\n\n# CI环境建议\nCI=true npm ci --ignore-scripts'
                        },
                        {
                            title: '安全问题',
                            content: '⚠️ postinstall可以执行任意代码，存在安全风险：',
                            points: [
                                '恶意包可能在postinstall中窃取数据',
                                '建议审查依赖的postinstall脚本',
                                '使用npm audit检查已知漏洞',
                                'CI环境可以使用--ignore-scripts提高安全性'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 2
        {
            type: 'quiz-code',
            title: '题目9：钩子执行顺序',
            content: {
                difficulty: 'hard',
                tags: ['生命周期', '执行顺序'],
                question: '以下配置中，执行npm run deploy的完整顺序是什么？',
                code: `{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "webpack",
    "postbuild": "npm run test",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "postdeploy": "echo 'Done'",
    "clean": "rimraf dist",
    "test": "jest"
  }
}`,
                options: [
                    'predeploy → deploy → postdeploy',
                    'clean → webpack → test → deploy → echo',
                    'predeploy → prebuild → build → postbuild → deploy → postdeploy',
                    'clean → prebuild → webpack → postbuild → test → predeploy → deploy → postdeploy'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '钩子执行顺序分析',
                    description: 'npm会递归展开所有相关的pre/post钩子。',
                    sections: [
                        {
                            title: '执行流程分解',
                            code: '// 执行 npm run deploy\n\n1. predeploy执行\n   → npm run build触发\n   \n2. prebuild执行\n   → npm run clean\n   → 执行：rimraf dist\n   \n3. build执行\n   → 执行：webpack\n   \n4. postbuild执行\n   → npm run test\n   → 执行：jest\n   \n5. deploy执行（predeploy完成）\n   → 执行：gh-pages -d dist\n   \n6. postdeploy执行\n   → 执行：echo \'Done\'\n\n// 完整顺序：\n// rimraf dist → webpack → jest → gh-pages → echo'
                        },
                        {
                            title: '关键点',
                            points: [
                                'npm run会递归展开所有引用的脚本',
                                '每个脚本的pre/post钩子都会执行',
                                '嵌套调用：predeploy调用build，build有自己的pre/post',
                                '失败即停：任何步骤失败，后续步骤不执行'
                            ]
                        },
                        {
                            title: '可视化流程',
                            code: 'npm run deploy\n  ├─ predeploy\n  │   └─ npm run build\n  │       ├─ prebuild\n  │       │   └─ npm run clean → rimraf dist ✓\n  │       ├─ build → webpack ✓\n  │       └─ postbuild\n  │           └─ npm run test → jest ✓\n  ├─ deploy → gh-pages -d dist ✓\n  └─ postdeploy → echo \'Done\' ✓'
                        },
                        {
                            title: '优化建议',
                            content: '复杂的钩子链可能导致：\n- 执行流程难以理解\n- 调试困难\n- 性能问题\n\n建议：\n- 保持钩子简单\n- 使用专门的任务运行器（gulp/grunt）处理复杂流程\n- 添加日志输出帮助调试'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：生命周期最佳实践',
            content: {
                difficulty: 'hard',
                tags: ['最佳实践', '钩子优化', '多选题'],
                question: '关于npm生命周期钩子的最佳实践，以下说法正确的是？',
                options: [
                    '使用prepare确保构建产物存在',
                    '使用prepublishOnly进行发布前检查',
                    '避免在postinstall中执行耗时操作',
                    '可以在钩子中使用exit 0强制成功'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'npm生命周期钩子最佳实践',
                    description: '合理使用生命周期钩子可以提升开发体验和包的质量。',
                    sections: [
                        {
                            title: '1. prepare的正确使用',
                            code: '// ✅ 推荐：自动构建\n{\n  "scripts": {\n    "prepare": "npm run build"\n  }\n}\n\n// 场景：\n// - git clone后npm install自动构建\n// - npm publish前自动构建\n// - 确保dist/目录总是最新的'
                        },
                        {
                            title: '2. prepublishOnly质量检查',
                            code: '// ✅ 推荐：发布前检查\n{\n  "scripts": {\n    "prepublishOnly": "npm run lint && npm test && npm run build"\n  }\n}\n\n// 作用：\n// - 确保代码质量\n// - 防止发布有bug的版本\n// - 只在发布时执行，不影响开发'
                        },
                        {
                            title: '3. postinstall性能考虑',
                            content: '⚠️ postinstall会影响所有安装你的包的用户：',
                            code: '// ❌ 不推荐：耗时操作\n{\n  "postinstall": "npm run build-everything"  // 太慢！\n}\n\n// ✅ 推荐：必要时才构建\n{\n  "postinstall": "node -e \\"try{require(\'./dist\')}catch(e){require(\'./build\')}\\""\n}\n\n// 或使用prepare\n{\n  "prepare": "npm run build"  // 只在需要时执行\n}'
                        },
                        {
                            title: '4. 错误处理',
                            code: '// ❌ 不推荐：隐藏错误\n{\n  "postinstall": "some-command || exit 0"  // 总是成功\n}\n\n// ✅ 推荐：明确错误处理\n{\n  "postinstall": "node scripts/postinstall.js"\n}\n\n// scripts/postinstall.js\ntry {\n  // 尝试执行\n  require(\'./build\');\n} catch (error) {\n  if (isCriticalError(error)) {\n    throw error;  // 关键错误必须失败\n  }\n  console.warn(\'Non-critical error:\', error);\n}'
                        },
                        {
                            title: '5. 钩子组织',
                            code: '{\n  "scripts": {\n    // 构建相关\n    "clean": "rimraf dist",\n    "prebuild": "npm run clean",\n    "build": "rollup -c",\n    "postbuild": "npm run type-check",\n    \n    // 测试相关\n    "pretest": "npm run lint",\n    "test": "jest",\n    "posttest": "npm run coverage",\n    \n    // 发布相关\n    "prepare": "npm run build",\n    "prepublishOnly": "npm test",\n    "postpublish": "git push --tags",\n    \n    // 版本相关\n    "preversion": "npm test",\n    "version": "npm run changelog && git add CHANGELOG.md",\n    "postversion": "git push && git push --tags"\n  }\n}'
                        },
                        {
                            title: '6. 文档和提示',
                            code: '{\n  "scripts": {\n    "postinstall": "node -e \\"console.log(\'\\\\n✨ Thanks for installing! Check README.md for usage.\\\\n\')\\""  \n  }\n}\n\n// 给用户友好的提示'
                        },
                        {
                            title: '核心原则',
                            points: [
                                '最小化影响：postinstall要快',
                                '失败快速：尽早发现问题',
                                '清晰意图：钩子名字和内容匹配',
                                '可跳过：关键任务不要只依赖钩子',
                                '考虑用户：不要让用户等太久'
                            ]
                        }
                    ]
                },
                source: 'npm最佳实践'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第12章面试题：npm包开发最佳实践',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=12'
        },
        next: {
            title: '第14章面试题：npm安全',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=14'
        }
    }
};
