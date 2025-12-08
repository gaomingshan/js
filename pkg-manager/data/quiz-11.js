/**
 * 第11章：发布npm包 - 面试题
 * 10道精选面试题：测试对npm包发布流程和最佳实践的理解
 */

window.content = {
    section: {
        title: '第11章：发布npm包 - 面试题',
        icon: '🚀'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm发布前提',
            content: {
                difficulty: 'easy',
                tags: ['npm发布', '账号注册'],
                question: '发布npm包之前需要做什么准备？',
                options: [
                    '注册npm账号并登录',
                    '购买npm会员',
                    '申请发布许可证',
                    '通过npm官方审核'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm发布准备',
                    description: '发布npm包只需要免费注册npm账号即可，无需付费或审核。',
                    points: [
                        '注册账号：访问npmjs.com注册免费账号',
                        '验证邮箱：必须验证邮箱才能发布包',
                        '本地登录：使用npm login命令登录',
                        '查看登录状态：npm whoami查看当前登录用户'
                    ],
                    sections: [
                        {
                            title: '登录步骤',
                            code: '# 登录npm\nnpm login\n# 输入用户名、密码、邮箱\n\n# 查看登录状态\nnpm whoami\n# 输出：your-username'
                        },
                        {
                            title: '注意事项',
                            content: '首次发布需要验证邮箱，否则会报错。npm会员可以发布私有包，但免费账号可以发布无限数量的公开包。'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：package.json必需字段',
            content: {
                difficulty: 'easy',
                tags: ['package.json', '字段配置'],
                question: '发布npm包时，package.json中哪些字段是必需的？',
                options: [
                    '只有name',
                    'name和version',
                    'name、version和main',
                    'name、version、main和description'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'package.json必需字段',
                    description: '发布npm包时，只有name和version是强制要求的字段。',
                    sections: [
                        {
                            title: '必需字段',
                            points: [
                                'name：包名，必须唯一（公开包）',
                                'version：版本号，遵循semver规范'
                            ]
                        },
                        {
                            title: '推荐字段',
                            points: [
                                'description：包的描述，显示在npm搜索结果中',
                                'main：入口文件，默认是index.js',
                                'keywords：关键词数组，提升搜索排名',
                                'author：作者信息',
                                'license：开源许可证，推荐使用MIT',
                                'repository：代码仓库地址'
                            ]
                        },
                        {
                            title: '最小示例',
                            code: '{\n  "name": "my-awesome-package",\n  "version": "1.0.0"\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：作用域包',
            content: {
                difficulty: 'easy',
                tags: ['作用域包', '包命名'],
                question: '什么是npm作用域包（Scoped Package）？',
                options: [
                    '有特殊权限的包',
                    '以@username/或@org/开头的包名',
                    '只能在特定作用域使用的包',
                    '企业级付费包'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm作用域包',
                    description: '作用域包是以@开头的包名，格式为@scope/package-name。',
                    points: [
                        '避免命名冲突：在你的作用域下，包名可以与其他人的包重复',
                        '组织管理：企业或个人可以将相关包归类到同一作用域',
                        '私有包：免费用户可以发布公开作用域包，私有作用域包需要付费',
                        '安装方式：npm install @scope/package-name'
                    ],
                    sections: [
                        {
                            title: '作用域包示例',
                            code: '// package.json\n{\n  "name": "@myusername/my-package",\n  "version": "1.0.0"\n}\n\n// 安装\nnpm install @myusername/my-package\n\n// 使用\nimport pkg from \'@myusername/my-package\';'
                        },
                        {
                            title: '发布公开作用域包',
                            code: '# 默认作用域包是私有的，需要加--access public发布公开包\nnpm publish --access public'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：版本号管理',
            content: {
                difficulty: 'medium',
                tags: ['版本管理', 'semver'],
                question: 'npm version命令的作用是什么？',
                options: [
                    '查看当前包的版本号',
                    '自动更新version字段并创建git tag',
                    '检查包的版本兼容性',
                    '列出所有可用版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm version命令',
                    description: 'npm version是一个自动化版本管理工具，会更新package.json、创建git提交和tag。',
                    sections: [
                        {
                            title: '版本升级类型',
                            points: [
                                'npm version patch：修订号+1（1.0.0 → 1.0.1）',
                                'npm version minor：次版本号+1（1.0.1 → 1.1.0）',
                                'npm version major：主版本号+1（1.1.0 → 2.0.0）',
                                'npm version prerelease：预发布版本（1.0.0 → 1.0.1-0）'
                            ]
                        },
                        {
                            title: '自动化操作',
                            content: '执行npm version后，会自动：\n1. 更新package.json的version字段\n2. 创建git commit（message: "v1.0.1"）\n3. 创建git tag（tag: "v1.0.1"）\n4. 运行preversion、version、postversion钩子'
                        },
                        {
                            title: '完整发布流程',
                            code: '# 1. 升级版本\nnpm version patch\n# 自动commit和tag\n\n# 2. 推送到git\ngit push origin main --tags\n\n# 3. 发布到npm\nnpm publish'
                        },
                        {
                            title: '跳过git操作',
                            code: '# 只更新version，不创建commit和tag\nnpm version patch --no-git-tag-version'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：.npmignore文件',
            content: {
                difficulty: 'medium',
                tags: ['.npmignore', '文件过滤'],
                question: '.npmignore文件的作用是什么？',
                options: [
                    '忽略npm安装时的警告',
                    '控制哪些文件不会被发布到npm',
                    '配置npm镜像源',
                    '指定要安装的依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '.npmignore文件',
                    description: '.npmignore类似于.gitignore，用于控制发布到npm时排除哪些文件。',
                    sections: [
                        {
                            title: '工作原理',
                            points: [
                                '如果存在.npmignore，npm会使用它来过滤文件',
                                '如果不存在.npmignore，npm会使用.gitignore',
                                '某些文件总是会被包含：package.json、README.md、LICENSE等',
                                '某些文件总是会被排除：.git/、node_modules/、.DS_Store等'
                            ]
                        },
                        {
                            title: '常见配置',
                            code: '# .npmignore\n# 源代码和测试\nsrc/\ntest/\n__tests__/\n*.test.js\n\n# 构建工具配置\n.babelrc\nwebpack.config.js\nrollup.config.js\ntsconfig.json\n\n# 文档和示例\ndocs/\nexamples/\n\n# CI/CD\n.github/\n.travis.yml\n\n# 开发依赖\n.vscode/\n.idea/'
                        },
                        {
                            title: '使用files字段（推荐）',
                            content: '使用package.json的files字段更明确：',
                            code: '// package.json\n{\n  "files": [\n    "dist/",\n    "lib/",\n    "index.js",\n    "README.md"\n  ]\n}\n\n// 只有files中列出的文件会被发布'
                        },
                        {
                            title: '查看将要发布的文件',
                            code: '# 测试打包，查看哪些文件会被发布\nnpm pack --dry-run\n\n# 或生成tarball包查看\nnpm pack\ntar -tzf your-package-1.0.0.tgz'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：发布流程',
            content: {
                difficulty: 'medium',
                tags: ['发布流程', '最佳实践'],
                question: '正确的npm包发布流程是什么？',
                options: [
                    'npm login → npm publish',
                    'npm version → npm publish',
                    'npm test → npm version → git push --tags → npm publish',
                    'git commit → npm publish'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm包发布最佳流程',
                    description: '完整的发布流程应该包括测试、版本管理、git同步和npm发布。',
                    sections: [
                        {
                            title: '完整发布流程',
                            points: [
                                '1. 确保测试通过：npm test',
                                '2. 更新版本号：npm version patch/minor/major',
                                '3. 推送到git：git push origin main --tags',
                                '4. 发布到npm：npm publish',
                                '5. 验证发布：npm view your-package'
                            ]
                        },
                        {
                            title: '自动化脚本',
                            code: '// package.json\n{\n  "scripts": {\n    "prepublishOnly": "npm test && npm run build",\n    "postpublish": "git push origin main --tags",\n    "release:patch": "npm version patch && npm publish",\n    "release:minor": "npm version minor && npm publish",\n    "release:major": "npm version major && npm publish"\n  }\n}'
                        },
                        {
                            title: '使用发布',
                            code: '# 发布补丁版本\nnpm run release:patch\n\n# 发布次版本\nnpm run release:minor\n\n# 发布主版本\nnpm run release:major'
                        },
                        {
                            title: 'prepublishOnly钩子',
                            content: 'prepublishOnly会在npm publish之前执行，用于确保代码质量：\n- 运行测试确保功能正常\n- 构建生产代码\n- Lint代码检查\n如果钩子失败，发布会被中止。'
                        }
                    ]
                },
                source: 'npm最佳实践'
            }
        },
        
        // 中等题 4 - 多选题
        {
            type: 'quiz',
            title: '题目7：npm发布权限',
            content: {
                difficulty: 'medium',
                tags: ['权限管理', '多选题'],
                question: '关于npm包的访问权限，以下说法正确的是？',
                options: [
                    '免费用户可以发布无限数量的公开包',
                    '作用域包默认是私有的',
                    'npm publish --access public可以发布公开的作用域包',
                    '私有包只有付费用户才能发布'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'npm包访问权限',
                    description: 'npm对公开包和私有包有不同的权限策略。',
                    sections: [
                        {
                            title: '公开包（Public）',
                            points: [
                                '免费用户可以发布无限数量的公开包',
                                '任何人都可以安装和使用',
                                '非作用域包默认是公开的',
                                '作用域包需要加--access public才是公开的'
                            ]
                        },
                        {
                            title: '私有包（Private）',
                            points: [
                                '需要npm Pro、Teams或Enterprise订阅',
                                '只有授权用户可以安装',
                                '作用域包默认是私有的',
                                '适合企业内部包或商业包'
                            ]
                        },
                        {
                            title: '发布命令',
                            code: '# 发布公开包（非作用域）\nnpm publish\n\n# 发布公开作用域包\nnpm publish --access public\n\n# 发布私有作用域包（需要付费）\nnpm publish --access restricted\n# 或简单使用\nnpm publish'
                        },
                        {
                            title: '修改包的访问权限',
                            code: '# 将包改为公开\nnpm access public your-package\n\n# 将包改为私有（需要付费）\nnpm access restricted your-package'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：npm包撤回',
            content: {
                difficulty: 'hard',
                tags: ['包管理', 'unpublish'],
                question: 'npm unpublish命令的限制是什么？',
                options: [
                    '没有限制，任何时候都可以撤回',
                    '只能撤回24小时内发布的版本',
                    '只能撤回72小时内发布且无依赖的版本',
                    '完全禁止使用unpublish'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm unpublish限制',
                    description: 'npm对unpublish有严格限制，防止破坏依赖生态。',
                    sections: [
                        {
                            title: 'unpublish限制条件',
                            points: [
                                '只能撤回72小时（3天）内发布的版本',
                                '包不能有其他npm包依赖它',
                                '如果包有下载量，不建议撤回',
                                '撤回后24小时内不能发布同名同版本'
                            ]
                        },
                        {
                            title: 'unpublish命令',
                            code: '# 撤回特定版本\nnpm unpublish <package-name>@<version>\n\n# 撤回整个包（非常危险！）\nnpm unpublish <package-name> --force\n\n# 示例\nnpm unpublish my-package@1.0.0'
                        },
                        {
                            title: '更好的做法：deprecate',
                            content: '如果包已经被使用，使用deprecate而不是unpublish：',
                            code: '# 标记版本为废弃\nnpm deprecate <package-name>@<version> "理由"\n\n# 示例\nnpm deprecate my-package@1.0.0 "有严重bug，请使用1.0.1"\n\n# 用户安装时会看到警告\nnpm WARN deprecated my-package@1.0.0: 有严重bug，请使用1.0.1'
                        },
                        {
                            title: '为什么有这些限制',
                            points: [
                                '防止破坏依赖链：如果包被撤回，依赖它的项目会安装失败',
                                '避免恶意行为：防止攻击者撤回热门包破坏生态',
                                '鼓励版本管理：通过发布新版本修复问题，而不是删除旧版本',
                                '保持稳定性：确保npm registry的稳定性和可靠性'
                            ]
                        },
                        {
                            title: '意外发布怎么办',
                            points: [
                                '72小时内：可以unpublish',
                                '超过72小时：只能deprecate旧版本，发布新版本',
                                '泄露敏感信息：立即联系npm support',
                                '错误的代码：发布修复版本（patch）'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：npm发布钩子',
            content: {
                difficulty: 'hard',
                tags: ['生命周期', '钩子'],
                question: 'npm publish执行时会依次触发哪些生命周期钩子？',
                options: [
                    'prepublish → publish → postpublish',
                    'prepublishOnly → prepare → publish → postpublish',
                    'prepare → prepublishOnly → publish → postpublish',
                    'prepublishOnly → prepare → prepublish → publish → postpublish'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm publish生命周期钩子',
                    description: 'npm publish有一套完整的生命周期钩子系统。',
                    sections: [
                        {
                            title: '发布钩子执行顺序',
                            points: [
                                '1. prepublishOnly：只在npm publish前执行（推荐）',
                                '2. prepare：在打包前执行，npm install也会触发',
                                '3. prepublish：已废弃，不推荐使用',
                                '4. publish：发布时执行',
                                '5. postpublish：发布完成后执行'
                            ]
                        },
                        {
                            title: 'prepublishOnly vs prepublish',
                            content: 'prepublishOnly只在npm publish时执行，而prepublish在npm install时也会执行（已废弃）。使用prepublishOnly更安全。',
                            code: '// package.json\n{\n  "scripts": {\n    // ✅ 推荐：只在发布时执行\n    "prepublishOnly": "npm test && npm run build",\n    \n    // ❌ 已废弃：install时也会执行\n    "prepublish": "npm run build"\n  }\n}'
                        },
                        {
                            title: 'prepare钩子',
                            content: 'prepare在npm install和npm publish时都会执行，适合确保构建产物存在：',
                            code: '// package.json\n{\n  "scripts": {\n    "prepare": "npm run build"\n  }\n}\n\n// 场景：\n// - 开发时：git clone后npm install会自动构建\n// - 发布时：npm publish前会自动构建'
                        },
                        {
                            title: '完整钩子配置示例',
                            code: '{\n  "scripts": {\n    "test": "jest",\n    "build": "rollup -c",\n    "lint": "eslint src/",\n    \n    // 确保构建产物存在\n    "prepare": "npm run build",\n    \n    // 发布前检查\n    "prepublishOnly": "npm run lint && npm test",\n    \n    // 发布后推送tags\n    "postpublish": "git push origin main --tags"\n  }\n}'
                        },
                        {
                            title: '执行流程示例',
                            code: '# 执行 npm publish 时的输出：\n> prepublishOnly\n✓ lint passed\n✓ test passed\n\n> prepare  \n✓ build completed\n\n> publish\n+ my-package@1.0.0\n\n> postpublish\n✓ pushed to git'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：包命名规范',
            content: {
                difficulty: 'hard',
                tags: ['命名规范', '最佳实践'],
                question: '关于npm包命名，以下哪些做法是正确的？',
                options: [
                    '使用小写字母和连字符，如my-awesome-package',
                    '可以使用下划线分隔，如my_awesome_package',
                    '作用域包可以包含大写字母，如@MyOrg/Package',
                    '包名不能超过214个字符'
                ],
                correctAnswer: [0, 3],
                explanation: {
                    title: 'npm包命名规范',
                    description: 'npm包命名有严格的规范和最佳实践。',
                    sections: [
                        {
                            title: '强制规范',
                            points: [
                                '必须全部小写',
                                '长度不能超过214个字符',
                                '不能包含大写字母',
                                '不能包含前导或尾随空格',
                                '不能包含URL不安全字符',
                                '不能使用node_modules或favicon.ico'
                            ]
                        },
                        {
                            title: '允许的字符',
                            points: [
                                '小写字母：a-z',
                                '数字：0-9',
                                '连字符：-（推荐）',
                                '下划线：_（不推荐）',
                                '点号：.（不推荐）',
                                '作用域：@scope/package-name'
                            ]
                        },
                        {
                            title: '命名最佳实践',
                            code: '// ✅ 好的命名\nmy-awesome-package\nreact-router\nlodash\n@babel/core\n@types/node\n\n// ❌ 不推荐的命名\nMyAwesomePackage  // 包含大写\nmy_awesome_package  // 使用下划线\nmy.awesome.package  // 使用点号\n awesome-package  // 有前导空格'
                        },
                        {
                            title: '作用域包命名',
                            content: '作用域包格式：@scope/package-name',
                            code: '// scope和package-name都必须小写\n@myusername/my-package  ✅\n@MyUsername/MyPackage  ❌\n\n// 可以使用连字符\n@my-org/awesome-tool  ✅'
                        },
                        {
                            title: '语义化命名建议',
                            points: [
                                '描述性：名字应该描述包的功能',
                                '简洁性：尽量简短但有意义',
                                '唯一性：检查是否已存在同名包',
                                '避免通用词：如utils、helpers、tools',
                                '考虑SEO：使用常见搜索词'
                            ]
                        },
                        {
                            title: '检查包名是否可用',
                            code: '# 搜索包名\nnpm search my-package-name\n\n# 查看包信息（如果不存在会报错）\nnpm view my-package-name\n\n# 或访问\nhttps://www.npmjs.com/package/my-package-name'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第10章面试题：npm link本地开发',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=10'
        },
        next: {
            title: '第12章面试题：npm包开发最佳实践',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=12'
        }
    }
};
