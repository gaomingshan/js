/**
 * 第7章：npm常用命令 - 面试题
 * 10道精选面试题：测试对npm命令行工具的掌握
 */

window.content = {
    section: {
        title: '第7章：npm常用命令 - 面试题',
        icon: '🔴'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm install简写',
            content: {
                difficulty: 'easy',
                question: 'npm install的正确简写是什么？',
                options: [
                    'npm add',
                    'npm i',
                    'npm get',
                    'npm in'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm install命令',
                    content: 'npm install可以简写为npm i：\n\nnpm i lodash  # 安装包\nnpm i  # 安装所有依赖\n\n常用参数：\nnpm i lodash -D  # devDependencies\nnpm i lodash -P  # dependencies（默认）\nnpm i lodash -g  # 全局安装\nnpm i lodash --save-exact  # 精确版本\n\n注意：npm没有add命令（yarn有yarn add）'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：查看包信息',
            content: {
                difficulty: 'easy',
                question: '如何查看npm包的详细信息？',
                options: [
                    'npm show <package>',
                    'npm view <package>',
                    'npm info <package>',
                    '以上都可以'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'npm view命令',
                    content: 'npm view、npm show、npm info是同一命令的别名：\n\n查看所有信息：\nnpm view lodash\n\n查看特定字段：\nnpm view lodash version  # 最新版本\nnpm view lodash versions  # 所有版本\nnpm view lodash dependencies  # 依赖列表\nnpm view lodash repository  # 仓库地址\n\n查看指定版本：\nnpm view lodash@4.17.20\n\nJSON格式输出：\nnpm view lodash --json'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：卸载依赖',
            content: {
                difficulty: 'easy',
                question: 'npm uninstall的作用是什么？',
                options: [
                    '只删除node_modules中的文件',
                    '删除node_modules文件并从package.json移除依赖',
                    '只从package.json移除依赖',
                    '卸载npm本身'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm uninstall命令',
                    content: 'npm uninstall（别名：remove、rm、un）会：\n\n1. 从node_modules删除包\n2. 从package.json删除依赖\n3. 更新package-lock.json\n\n使用示例：\nnpm uninstall lodash\nnpm un webpack -D  # 卸载dev依赖\nnpm un -g create-react-app  # 卸载全局包\n\n参数：\n--no-save：只删除文件，不修改package.json\n\n批量卸载：\nnpm uninstall pkg1 pkg2 pkg3\n\n与手动删除的区别：uninstall会同步更新配置文件'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：npm ci vs npm install',
            content: {
                difficulty: 'medium',
                question: 'npm ci和npm install的主要区别是什么？',
                options: [
                    'npm ci速度更快，但功能相同',
                    'npm ci用于CI环境，要求必须有package-lock.json且严格按其安装',
                    'npm ci是npm install的缩写',
                    'npm ci只安装dependencies'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm ci详解',
                    content: 'npm ci（Clean Install）专为CI/CD设计：\n\nnpm install：\n- 更新package-lock.json\n- 允许版本范围内更新\n- 增量安装\n- 可以没有lock文件\n\nnpm ci：\n- 不修改package-lock.json\n- 严格按lock文件安装\n- 删除node_modules后全新安装\n- 必须有lock文件\n- lock与package.json不符会报错\n\nnpm ci更快更可靠：\n- 跳过版本解析\n- 无需检查兼容性\n- 确保环境一致\n\n适用场景：CI/CD流水线、Docker构建'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：npm update行为',
            content: {
                difficulty: 'medium',
                question: 'npm update命令会更新依赖到什么版本？',
                options: [
                    '所有依赖的最新版本',
                    '符合package.json版本范围的最新版本',
                    '只更新patch版本',
                    '只更新minor版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm update命令',
                    content: 'npm update遵守package.json版本范围：\n\n示例：\n"lodash": "^4.17.0"\n\nnpm update会：\n- 查找4.x.x范围内最新版本\n- 不会更新到5.0.0\n- 更新package-lock.json\n\n使用方式：\nnpm update  # 更新所有包\nnpm update lodash  # 更新指定包\nnpm update -g  # 更新全局包\n\n查看可更新的包：\nnpm outdated\n\n更新到Latest版本：\nnpm install lodash@latest\n或使用工具：npm-check-updates'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：npm outdated输出',
            content: {
                difficulty: 'medium',
                question: 'npm outdated命令输出的Current、Wanted、Latest分别代表什么？',
                options: [
                    'Current是当前版本，Wanted是期望版本，Latest是最新版本',
                    'Current是安装版本，Wanted是package.json版本，Latest是最新版本',
                    'Current是当前安装版本，Wanted是符合范围的最新版本，Latest是仓库最新版本',
                    '三者含义相同'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm outdated详解',
                    content: 'npm outdated输出说明：\n\nPackage  Current  Wanted  Latest  Location\nlodash   4.17.20  4.17.21 5.0.0   my-app\n\nCurrent：当前安装的版本\nWanted：符合package.json范围的最新版本\nLatest：npm registry中的最新版本\n\n颜色含义：\n- 红色：Latest与Wanted不同（major更新）\n- 黄色：Wanted与Current不同（可安全更新）\n\n更新策略：\nWanted ≠ Current：npm update（安全）\nLatest > Wanted：npm install pkg@latest（需评估）\n\n参数：\n--depth=0：只显示直接依赖\n--json：JSON格式输出'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：npm list命令',
            content: {
                difficulty: 'medium',
                question: '执行以下命令后，输出会显示什么？',
                code: `npm list lodash --depth=0`,
                options: [
                    '显示lodash的所有依赖',
                    '只显示项目直接依赖中的lodash（如果存在）',
                    '显示lodash的完整依赖树',
                    '显示所有包含lodash的依赖路径'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm list命令',
                    content: 'npm list（别名：ls）查看依赖树：\n\n--depth参数：\nnpm list --depth=0  # 只显示直接依赖\nnpm list --depth=1  # 显示直接依赖及其依赖\n\n查找特定包：\nnpm list lodash  # 显示lodash所有位置\nnpm list lodash --depth=0  # 只在直接依赖中查找\n\n输出示例：\nmy-app@1.0.0\n├── lodash@4.17.21\n└── vue@3.3.4\n\n常用参数：\n-g --depth=0：查看全局包\n--json：JSON格式\n--prod：只显示dependencies\n--dev：只显示devDependencies'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：npm audit安全审计',
            content: {
                difficulty: 'hard',
                question: 'npm audit命令的主要作用是什么？',
                options: [
                    '审计代码质量',
                    '检查依赖中的安全漏洞',
                    '检查许可证合规性',
                    '审计npm账号使用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm audit安全检查',
                    content: 'npm audit检查依赖安全漏洞：\n\n基础用法：\nnpm audit  # 扫描并报告漏洞\n\n输出包含：\n- 漏洞严重程度（low/moderate/high/critical）\n- 受影响的包\n- 依赖路径\n- 修复建议\n\n自动修复：\nnpm audit fix  # 自动更新到安全版本\nnpm audit fix --force  # 强制更新（可能breaking）\n\n输出格式：\nnpm audit --json  # JSON格式\nnpm audit --parseable  # 机器可读\n\nCI/CD集成：\nnpm audit --audit-level=high  # 只有high及以上才失败\nnpm audit --production  # 只检查生产依赖'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：npm cache管理',
            content: {
                difficulty: 'hard',
                question: '关于npm cache，以下说法正确的是？',
                options: [
                    'npm cache只缓存已安装的包',
                    'npm cache clean会清理所有缓存',
                    'npm cache clean需要加--force参数才能执行',
                    'npm不会自动管理缓存'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm缓存管理',
                    content: 'npm缓存机制：\n\n查看缓存位置：\nnpm config get cache\n默认：~/.npm（Mac/Linux）、%AppData%/npm-cache（Windows）\n\n缓存内容：\n- 下载的tar包\n- 包元数据\n- HTTP请求缓存\n\n清理缓存：\nnpm cache clean --force  # npm 6+必须加--force\nnpm cache verify  # 验证并清理损坏内容\n\n缓存策略：\n- npm默认优先使用缓存\n- 验证完整性（checksum）\n- 节省下载时间\n\n禁用缓存：\nnpm install --prefer-online\n\n注意：正常情况无需手动清理，npm会自动管理'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：npm prune命令',
            content: {
                difficulty: 'hard',
                question: 'npm prune命令的作用是什么？',
                options: [
                    '删除所有依赖',
                    '删除package.json中未列出的包',
                    '压缩node_modules体积',
                    '更新过期的包'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm prune清理依赖',
                    content: 'npm prune删除未使用的包：\n\n使用场景：\n- 手动修改package.json后\n- 删除了某些依赖配置\n- node_modules中有多余的包\n\n执行效果：\nnpm prune\n删除package.json中未声明的包\n\n参数：\nnpm prune --production\n删除所有devDependencies（生产环境）\n\n相关命令：\nnpm dedupe（npm ddp）：\n- 去除重复依赖\n- 优化依赖树\n- 减少node_modules体积\n\n最佳实践：\n定期运行npm prune保持node_modules干净\n部署前运行npm prune --production减少体积'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第6章面试题：package.json详解',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=06'
        },
        next: {
            title: '第8章面试题：npm scripts脚本',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=08'
        }
    }
};
