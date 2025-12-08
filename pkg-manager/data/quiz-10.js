/**
 * 第10章：npm link本地开发 - 面试题
 * 10道精选面试题：测试对本地包开发调试的理解
 */

window.content = {
    section: {
        title: '第10章：npm link本地开发 - 面试题',
        icon: '🔴'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm link作用',
            content: {
                difficulty: 'easy',
                question: 'npm link的主要作用是什么？',
                options: [
                    '链接到npm官方仓库',
                    '创建包之间的符号链接，用于本地开发调试',
                    '下载npm包',
                    '发布npm包'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm link基础',
                    content: 'npm link用于本地包开发调试：\n\n使用场景：\n开发npm包时，需要在其他项目中测试\n- 不用每次都发布到npm\n- 实时看到修改效果\n- 多包联调\n\n基础用法：\n步骤1：在包目录中\ncd my-package\nnpm link  # 创建全局链接\n\n步骤2：在项目中\ncd my-project\nnpm link my-package  # 链接到项目\n\n工作原理：\n创建符号链接（symlink）：\n{prefix}/lib/node_modules/my-package → /path/to/my-package\nmy-project/node_modules/my-package → {prefix}/lib/node_modules/my-package'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：npm link步骤',
            content: {
                difficulty: 'easy',
                question: '正确使用npm link的步骤是？',
                options: [
                    '在项目中npm link，在包中npm link package-name',
                    '在包中npm link，在项目中npm link package-name',
                    '在包和项目中都执行npm link',
                    '只在项目中执行npm link package-name'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm link完整流程',
                    content: 'npm link两步操作：\n\n第一步：注册全局链接（在包目录）\ncd /path/to/my-utils\nnpm link\n\n效果：创建符号链接\n/usr/local/lib/node_modules/my-utils → /path/to/my-utils\n\n第二步：链接到项目（在项目目录）\ncd /path/to/my-app\nnpm link my-utils\n\n效果：创建符号链接\nmy-app/node_modules/my-utils → /usr/local/lib/node_modules/my-utils → /path/to/my-utils\n\n使用效果：\n在my-app中import { helper } from \'my-utils\'\n修改my-utils代码自动反映到my-app\n\n取消链接：\nnpm unlink my-utils（在项目中）\nnpm unlink（在包目录）'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：符号链接查看',
            content: {
                difficulty: 'easy',
                question: '如何查看已创建的npm link符号链接？',
                options: [
                    'npm show links',
                    'npm ls -g --depth=0 --link=true',
                    'npm view links',
                    'npm config get links'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '查看npm link',
                    content: '查看npm link符号链接方法：\n\n查看全局链接的包：\nnpm ls -g --depth=0 --link=true\n\n查看项目中的链接：\nnpm ls my-package\n显示链接状态\n\nUnix/Linux查看符号链接：\nls -la node_modules/my-package\n显示符号链接指向\n\nWindows查看：\ndir node_modules\\my-package\n\n验证链接是否生效：\nnode -e "console.log(require.resolve(\'my-package\'))"\n显示实际路径\n\n取消链接：\n在项目中：npm unlink my-package\n在包目录：npm unlink\n或：npm unlink && npm install my-package'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：符号链接问题',
            content: {
                difficulty: 'medium',
                question: 'npm link创建的符号链接可能导致什么问题？',
                options: [
                    '降低程序运行速度',
                    '占用大量磁盘空间',
                    'webpack等工具可能无法正确解析符号链接',
                    '无法调试代码'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm link常见问题',
                    content: 'npm link符号链接的问题与解决：\n\n1. webpack配置问题\n问题：webpack默认不解析符号链接\n\n解决：\n// webpack.config.js\nmodule.exports = {\n  resolve: {\n    symlinks: true\n  }\n};\n\n2. peer dependencies问题\nmy-utils需要react\n项目也有react\n可能导致两个react实例\n\n解决：npm link react（链接peer依赖）\n\n3. TypeScript问题\ntsconfig.json配置：\n{\n  "compilerOptions": {\n    "preserveSymlinks": true\n  }\n}\n\n4. 依赖重复问题\n项目和包都有lodash\n可能安装两份\n\n解决：在包中使用peerDependencies'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz-code',
            title: '题目5：多包联调',
            content: {
                difficulty: 'medium',
                question: '以下目录结构中，如何让app使用本地的pkg-a和pkg-b？',
                code: `workspace/
├── app/
├── pkg-a/  # depends on pkg-b
└── pkg-b/`,
                options: [
                    '在app中分别npm link pkg-a和pkg-b',
                    '在pkg-a和pkg-b中npm link，在app中npm link pkg-a pkg-b',
                    '在pkg-b中npm link，在pkg-a中npm link pkg-b，在app中npm link pkg-a',
                    '使用npm workspaces自动处理'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '多包依赖的npm link',
                    content: '多包依赖链接流程（从底层往上）：\n\n正确流程（选项C）：\n步骤1：最底层包\ncd workspace/pkg-b\nnpm link\n\n步骤2：中间层包\ncd workspace/pkg-a\nnpm link pkg-b  # 链接依赖\nnpm link  # 注册自己\n\n步骤3：应用\ncd workspace/app\nnpm link pkg-a  # pkg-a会带着pkg-b\n\n依赖链：app → pkg-a → pkg-b\n链接顺序：pkg-b → pkg-a → app\n\n替代方案（推荐）：\n使用npm workspaces：\n{\n  "private": true,\n  "workspaces": ["app", "pkg-a", "pkg-b"]\n}\nnpm install  # 自动处理所有链接'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：Windows权限问题',
            content: {
                difficulty: 'medium',
                question: 'npm link在Windows上可能遇到什么问题？',
                options: [
                    'Windows不支持npm link',
                    '需要管理员权限创建符号链接',
                    'npm link速度比Linux慢',
                    '符号链接在Windows上不生效'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Windows环境npm link',
                    content: 'Windows上npm link的特殊处理：\n\n权限问题：\nWindows默认禁止非管理员创建符号链接\n\n错误信息：\nnpm ERR! Error: EPERM: operation not permitted\n\n解决方案：\n方案1：以管理员运行\n右键PowerShell → 以管理员身份运行\nnpm link\n\n方案2：开启开发者模式\n设置 → 更新和安全 → 开发者选项\n启用"开发人员模式"\n\n方案3：使用WSL\n在WSL中使用npm link权限问题少\n\n替代方案：\n如果权限问题多，使用yalc：\nnpm install -g yalc\nyalc publish（在包中）\nyalc add my-package（在项目中）'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目7：yalc vs npm link',
            content: {
                difficulty: 'medium',
                question: 'yalc相比npm link有什么优势？',
                options: [
                    'yalc速度更快',
                    'yalc不使用符号链接，而是复制文件，更稳定',
                    'yalc支持TypeScript，npm link不支持',
                    'yalc可以发布到npm'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'yalc本地包管理',
                    content: 'yalc作为npm link替代方案：\n\nyalc原理：\n不使用符号链接\n- 将包复制到本地存储\n- 从存储安装到项目\n- 类似本地npm registry\n\n基础用法：\n安装：npm install -g yalc\n\n在包中：\ncd my-package\nyalc publish\n\n在项目中：\ncd my-app\nyalc add my-package\n\n更新：\ncd my-package\nyalc push  # 发布并更新所有使用的项目\n\n优势对比：\nnpm link：npm内置，但符号链接问题多\nyalc：无符号链接问题，跨平台一致，模拟真实安装\n\n适用场景：\nyalc：Windows开发、CI/CD测试、复杂webpack配置'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：file:协议',
            content: {
                difficulty: 'hard',
                question: 'package.json中使用file:协议有什么特点？',
                options: [
                    'file:协议只能用于本地开发',
                    'file:协议会复制整个目录到node_modules',
                    'file:协议创建符号链接，类似npm link',
                    'file:协议只支持绝对路径'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'file:协议本地依赖',
                    content: 'file:协议引用本地包：\n\n基础用法：\npackage.json:\n{\n  "dependencies": {\n    "my-package": "file:../my-package"\n  }\n}\n\nnpm install执行：\n将../my-package复制到node_modules\n\n路径类型：\n相对路径：file:../my-package\n绝对路径：file:/Users/me/projects/my-package\n推荐使用相对路径\n\n安装行为：\n- 复制整个目录（不是链接）\n- 包括node_modules（如果存在）\n- 运行prepare脚本\n\n更新机制：\n修改源包后需要：\nnpm install  # 重新复制\n\n对比：\nnpm link：符号链接、实时更新\nfile:：复制文件、需手动更新\n\n适用：monorepo、私有包、Docker环境'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：lerna bootstrap',
            content: {
                difficulty: 'hard',
                question: 'lerna bootstrap相比手动npm link有什么优势？',
                options: [
                    'lerna bootstrap速度更快',
                    'lerna bootstrap自动处理所有包的依赖关系和链接',
                    'lerna bootstrap只适用于大型项目',
                    'lerna bootstrap不创建符号链接'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'lerna多包管理',
                    content: 'lerna自动化包管理：\n\n目录结构：\nmy-monorepo/\n├── lerna.json\n├── package.json\n└── packages/\n    ├── pkg-a/\n    ├── pkg-b/\n    └── pkg-c/\n\nlerna bootstrap执行：\n- 安装所有包的依赖\n- 链接相互依赖的包\n- 提升公共依赖（--hoist）\n- 执行prepare脚本\n\n与手动link对比：\n手动：\ncd packages/pkg-b && npm link\ncd packages/pkg-a && npm link pkg-b\n...繁琐且易错\n\nlerna：\nlerna bootstrap  # 一条命令搞定\n\n现代替代方案：\nnpm workspaces（npm 7+）\npnpm workspace（推荐）\nyarn workspaces\n\n选择建议：\n新项目：pnpm workspace\n已有项目：继续使用lerna'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：本地开发方案对比',
            content: {
                difficulty: 'hard',
                question: '关于本地包开发调试，以下说法正确的是？',
                options: [
                    'npm link适合所有场景',
                    'yalc通过复制文件避免符号链接问题',
                    'file:协议创建符号链接',
                    'workspaces已经过时'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '本地开发方案综合对比',
                    content: '本地包开发调试方案总结：\n\n1. npm link\n原理：符号链接\n优点：npm内置、修改立即生效\n缺点：Windows权限问题、webpack配置复杂\n适用：Unix/Mac、单包开发\n\n2. yalc\n原理：复制文件到本地存储\n优点：无符号链接问题、跨平台一致\n缺点：需手动push更新\n适用：Windows、CI/CD测试\n\n3. file:协议\n原理：复制整个目录\n优点：简单直接、不依赖外部工具\n缺点：需手动reinstall、占用空间\n适用：私有包、monorepo、Docker\n\n4. workspaces（推荐）\n原理：包管理器原生支持\n优点：自动处理依赖、提升公共依赖\nnpm/yarn/pnpm都支持\n适用：monorepo项目、多包管理'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第9章面试题：依赖版本管理',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=09'
        },
        next: {
            title: '返回目录',
            url: './index.html?subject=pkg-manager'
        }
    }
};
