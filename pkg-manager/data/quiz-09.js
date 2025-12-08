/**
 * 第9章：依赖版本管理 - 面试题
 * 10道精选面试题：测试对版本号、锁文件、依赖管理的理解
 */

window.content = {
    section: {
        title: '第9章：依赖版本管理 - 面试题',
        icon: '🔴'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：SemVer版本号',
            content: {
                difficulty: 'easy',
                question: 'SemVer版本号1.2.3中，1、2、3分别代表什么？',
                options: [
                    'year.month.day',
                    'major.minor.patch',
                    'release.version.build',
                    'phase.stage.revision'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'SemVer语义化版本',
                    content: 'SemVer版本号格式：MAJOR.MINOR.PATCH\n\nMAJOR（主版本号）：\n- 不兼容的API修改\n- 重大功能变更\n- 可能需要用户修改代码\n\nMINOR（次版本号）：\n- 向下兼容的功能新增\n- 废弃部分API（但不删除）\n- 用户无需修改代码\n\nPATCH（修订号）：\n- 向下兼容的bug修复\n- 不改变API\n- 安全更新\n\n示例：\n1.0.0 → 1.0.1（bug修复）\n1.0.1 → 1.1.0（新增功能）\n1.1.0 → 2.0.0（重大变更）'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：版本范围符号',
            content: {
                difficulty: 'easy',
                question: '^1.2.3这个版本范围允许安装哪些版本？',
                options: [
                    '只允许1.2.3',
                    '允许1.2.3到1.2.x的所有版本',
                    '允许1.2.3到1.x.x的所有版本（不包括2.0.0）',
                    '允许任何大于1.2.3的版本'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '^插入符范围',
                    content: '^（caret）允许不修改最左边非零数字的变更：\n\n^1.2.3允许：>=1.2.3 <2.0.0\n- 1.2.3 ✓\n- 1.2.4 ✓（patch更新）\n- 1.3.0 ✓（minor更新）\n- 2.0.0 ✗（major更新）\n\n其他情况：\n^0.2.3允许：>=0.2.3 <0.3.0\n^0.0.3允许：>=0.0.3 <0.0.4\n\n实际案例：\n"vue": "^3.2.0"\n允许安装3.2.0、3.2.47、3.3.0、3.4.0\n不允许4.0.0\n\nnpm默认行为：npm install vue会自动添加^前缀'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：~波浪符范围',
            content: {
                difficulty: 'easy',
                question: '~1.2.3和^1.2.3的主要区别是什么？',
                options: [
                    '~允许minor更新，^只允许patch更新',
                    '~只允许patch更新，^允许minor和patch更新',
                    '两者完全相同',
                    '~用于开发依赖，^用于生产依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '~波浪符范围',
                    content: '~（tilde）只允许patch版本更新：\n\n~1.2.3允许：>=1.2.3 <1.3.0\n- 1.2.3 ✓\n- 1.2.4 ✓（patch）\n- 1.3.0 ✗（minor）\n- 2.0.0 ✗（major）\n\n对比：\n^1.2.3：允许1.x.x（更宽松）\n~1.2.3：只允许1.2.x（更严格）\n\n使用场景：\n^（默认）：信任包维护者，接受新功能\n~（保守）：只要bug修复，稳定性优先\n精确版本：完全锁定，不自动更新\n\n设置默认：\nnpm config set save-prefix="~"'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：package-lock.json作用',
            content: {
                difficulty: 'medium',
                question: 'package-lock.json的主要作用是什么？',
                options: [
                    '加快npm install速度',
                    '锁定依赖的精确版本，确保团队安装一致',
                    '防止package.json被修改',
                    '记录npm的配置信息'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'package-lock.json详解',
                    content: 'package-lock.json锁定依赖版本：\n\n主要作用：\n- 锁定所有依赖的精确版本\n- 锁定依赖的依赖（完整依赖树）\n- 确保团队成员安装相同版本\n- 确保CI/CD环境一致\n\n文件内容：\n{\n  "packages": {\n    "node_modules/lodash": {\n      "version": "4.17.21",\n      "resolved": "https://...",\n      "integrity": "sha512-..."\n    }\n  }\n}\n\n版本控制：\n✅应该提交：确保团队一致性、可重现构建\n❌不提交：库项目（发布到npm的包）\n\n与package.json关系：\npackage.json: "lodash": "^4.17.0"\nlock文件: "version": "4.17.21"'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：lockfileVersion含义',
            content: {
                difficulty: 'medium',
                question: 'package-lock.json中的lockfileVersion字段含义是？',
                options: [
                    '表示package.json的版本',
                    '表示lock文件格式的版本，不同npm版本使用不同格式',
                    '表示项目的版本号',
                    '表示Node.js的版本要求'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'lockfileVersion版本演进',
                    content: 'package-lock.json格式版本：\n\nlockfileVersion: 1\n- npm 5.x - 6.x\n- 旧格式，只有dependencies字段\n\nlockfileVersion: 2\n- npm 7.x+\n- 新格式，添加packages字段（扁平化）\n- 向后兼容v1\n\nlockfileVersion: 3\n- npm 9.x+\n- 最新格式，优化结构\n\n兼容性：\nv2格式包含v1数据，保证向后兼容\n旧npm可以读取dependencies\n新npm使用packages\n\n升级格式：\nnpm install自动升级到当前npm版本的格式\n\n团队协作建议：统一npm版本（.nvmrc + engines）'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz-code',
            title: '题目6：版本解析优先级',
            content: {
                difficulty: 'medium',
                question: '以下场景会安装lodash的哪个版本？',
                code: `// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}

// package-lock.json记录
"lodash": "4.17.15"

// npm registry最新版本
lodash@4.17.21`,
                options: [
                    '4.17.21（registry最新版）',
                    '4.17.15（lock文件版本）',
                    '4.17.0（package.json指定）',
                    '随机选择'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '依赖版本解析策略',
                    content: 'npm依赖版本选择逻辑：\n\nnpm install（有lock文件）：\n1. 优先使用package-lock.json\n2. 验证是否满足package.json范围\n3. 满足则使用lock版本（4.17.15）\n\n答案：4.17.15\n\n不同命令行为：\nnpm install：使用lock文件版本\nnpm update：更新到范围内最新版本（4.17.21）\nnpm ci：严格按lock文件安装\n\n版本范围验证：\n^4.17.0允许：>=4.17.0 <5.0.0\n4.17.15 ✓在范围内\n\n如果lock是4.16.0：\n✗不在^4.17.0范围\n重新解析，安装4.17.21\n\n强制更新：\nrm -rf node_modules package-lock.json\nnpm install'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目7：锁文件冲突处理',
            content: {
                difficulty: 'medium',
                question: 'Git合并时package-lock.json冲突，正确的处理方式是？',
                options: [
                    '保留自己的版本',
                    '保留对方的版本',
                    '手动合并package.json后，删除lock文件重新npm install',
                    '使用git checkout --theirs'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'lock文件冲突解决',
                    content: 'package-lock.json冲突处理流程：\n\n步骤1：解决package.json冲突\n手动合并dependencies\n\n步骤2：删除lock文件\nrm package-lock.json\n\n步骤3：重新生成\nnpm install\n生成新的lock文件\n\n步骤4：提交\ngit add package.json package-lock.json\ngit commit\n\n自动化方案：\nnpm install --package-lock-only\n只更新lock文件，不安装依赖\n\n为什么不能直接合并：\n- lock文件结构复杂\n- 依赖关系树\n- integrity哈希\n- 手动合并容易出错\n\n验证合并结果：\nnpm install\nnpm audit\nnpm test'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：幽灵依赖问题',
            content: {
                difficulty: 'hard',
                question: '什么是"幽灵依赖"（Phantom Dependencies）？',
                options: [
                    '指被删除但仍在lock文件中的依赖',
                    '指可以使用但未在package.json中声明的依赖',
                    '指版本号错误的依赖',
                    '指安装失败的依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '幽灵依赖问题',
                    content: '幽灵依赖（Phantom Dependencies）定义：\n\n问题描述：\n代码中使用了某个包，但该包：\n- 未在package.json中声明\n- 是其他依赖的依赖\n- 被npm扁平化安装到node_modules根目录\n- 可以直接import使用\n\n产生原因（npm扁平化）：\n项目依赖vue@3.0.0\nvue依赖@vue/reactivity@3.0.0\n安装后node_modules根目录有@vue/reactivity\n\n代码中可以：\nimport { reactive } from \'@vue/reactivity\'\n虽然未声明\n\n危害：\n1. 版本不可控：vue更新可能改变@vue/reactivity版本\n2. 隐式依赖：删除vue后，@vue/reactivity消失\n3. 跨环境问题：pnpm等工具不会提升依赖\n\n解决方案：\n显式声明依赖或使用pnpm（严格依赖隔离）'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：npm dedupe去重',
            content: {
                difficulty: 'hard',
                question: 'npm dedupe命令的作用是什么？',
                options: [
                    '删除重复的依赖包，减少node_modules体积',
                    '检测重复安装的包',
                    '合并package.json和package-lock.json',
                    '删除未使用的依赖'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm dedupe去重优化',
                    content: 'npm dedupe（deduplicate）依赖去重：\n\n问题场景：\napp\n├── pkg-a → lodash@4.17.20\n└── pkg-b → lodash@4.17.21\n\n安装结果（重复）：\nnode_modules/\n├── lodash@4.17.21\n└── pkg-a/node_modules/lodash@4.17.20\n\nlodash被安装两次\n\ndedupe作用：\nnpm dedupe（或npm ddp）\n- 分析依赖树\n- 查找可合并的版本\n- 提升到更高层级\n- 减少重复安装\n\n优化后：\nnode_modules/\n└── lodash@4.17.21（共用）\n\n使用场景：\n- 手动修改package.json后\n- 多次install累积\n- node_modules体积异常大\n\n与pnpm对比：\npnpm天然去重（硬链接机制）'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：版本管理最佳实践',
            content: {
                difficulty: 'hard',
                question: '关于npm版本管理，以下说法正确的是？',
                options: [
                    'package-lock.json不应该提交到git',
                    '^和~都遵循SemVer，但宽松程度不同',
                    'npm ci会忽略package.json，只按lock文件安装',
                    'npm update不会更新lock文件'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '版本管理最佳实践',
                    content: 'npm版本管理综合总结：\n\n1. package-lock.json管理\n✅应用项目：提交lock文件，确保一致性\n❌库项目：不提交，让使用者控制版本\n\n2. 版本范围符号\n^（插入符）：允许minor和patch更新，npm默认\n~（波浪符）：只允许patch更新，更保守\n精确版本：完全锁定，最严格\n\n3. npm ci vs npm install\nnpm ci：删除node_modules、严格按lock安装、适合CI/CD\nnpm install：增量安装、可能更新lock、适合开发\n\n4. npm update行为\n✓会更新package-lock.json\n只更新到范围内最新版本\n不修改package.json的范围\n\n5. 幽灵依赖解决\n显式声明或使用pnpm（严格依赖隔离）'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第8章面试题：npm scripts脚本',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=08'
        },
        next: {
            title: '第10章面试题：npm link本地开发',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=10'
        }
    }
};
