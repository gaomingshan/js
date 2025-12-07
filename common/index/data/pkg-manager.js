/**
 * 包管理器学习系统 - 目录数据
 * 通过回调函数注册数据（优雅，不污染全局）
 */

window.registerIndexData({
    // 基本信息
    subject: 'pkg-manager',
    title: '包管理器学习系统',
    subtitle: '深入掌握npm、yarn、pnpm三大包管理器',
    icon: '📦',
    
    // 主题配色
    theme: {
        primary: '#cc3534',
        secondary: '#2c8ebb',
        gradient: 'linear-gradient(135deg, #cc3534 0%, #2c8ebb 100%)'
    },
    
    // 标签页配置
    tabs: [
        {
            id: 'content',
            name: '内容学习',
            icon: '📚',
            urlTemplate: './render.html?subject=pkg-manager&type=content&chapter={chapter}',
            sections: [
                {
                    name: '第一部分：包管理器基础',
                    icon: '📘',
                    count: 4,
                    topics: [
                        {
                            chapter: 1,
                            title: '包管理器简介与发展史',
                            description: '包管理器本质、npm/yarn/pnpm发展、三者对比'
                        },
                        {
                            chapter: 2,
                            title: '模块化与依赖管理',
                            description: 'CommonJS/ES Modules、依赖树、semver版本'
                        },
                        {
                            chapter: 3,
                            title: '包管理器工作原理',
                            description: '解析算法、安装流程、node_modules结构、链接机制'
                        },
                        {
                            chapter: 4,
                            title: 'registry与镜像源',
                            description: 'npm registry、淘宝镜像、私有源、.npmrc配置'
                        }
                    ]
                },
                {
                    name: '第二部分：npm核心功能',
                    icon: '🔴',
                    count: 6,
                    topics: [
                        {
                            chapter: 5,
                            title: 'npm安装与配置',
                            description: 'Node.js安装、版本管理（nvm/n/fnm）、配置优先级'
                        },
                        {
                            chapter: 6,
                            title: 'package.json详解',
                            description: '必需字段、依赖类型、scripts、bin、exports配置'
                        },
                        {
                            chapter: 7,
                            title: 'npm常用命令',
                            description: 'install/ci、update、uninstall、outdated、view等'
                        },
                        {
                            chapter: 8,
                            title: 'npm scripts脚本',
                            description: 'scripts定义、pre/post钩子、内置变量、跨平台'
                        },
                        {
                            chapter: 9,
                            title: '依赖版本管理',
                            description: '版本号语法、package-lock.json、锁文件冲突'
                        },
                        {
                            chapter: 10,
                            title: 'npm link本地开发',
                            description: 'npm link原理、本地包调试、多包联调、替代方案'
                        }
                    ]
                },
                {
                    name: '第三部分：npm进阶特性',
                    icon: '🚀',
                    count: 5,
                    topics: [
                        {
                            chapter: 11,
                            title: '发布npm包',
                            description: 'npm账号、作用域包、发布流程、版本管理'
                        },
                        {
                            chapter: 12,
                            title: 'npm包开发最佳实践',
                            description: '目录结构、TypeScript支持、构建打包、Tree Shaking'
                        },
                        {
                            chapter: 13,
                            title: 'npm生命周期钩子',
                            description: 'install/publish/version生命周期、prepare钩子'
                        },
                        {
                            chapter: 14,
                            title: 'npm安全',
                            description: 'npm audit漏洞扫描、依赖签名、.npmignore'
                        },
                        {
                            chapter: 15,
                            title: 'npm Workspaces',
                            description: 'Workspaces配置、Monorepo管理、依赖提升'
                        }
                    ]
                },
                {
                    name: '第四部分：Yarn深度解析',
                    icon: '🔵',
                    count: 5,
                    topics: [
                        {
                            chapter: 16,
                            title: 'Yarn简介与特性',
                            description: 'Yarn诞生、Yarn 1 vs Berry、PnP模式、确定性安装'
                        },
                        {
                            chapter: 17,
                            title: 'Yarn基础命令',
                            description: 'yarn install/add/remove、yarn.lock、命令对比'
                        },
                        {
                            chapter: 18,
                            title: 'Yarn Workspaces',
                            description: 'Workspaces配置、依赖提升、nohoist、批量操作'
                        },
                        {
                            chapter: 19,
                            title: 'Yarn Plug\'n\'Play (PnP)',
                            description: 'PnP原理、.pnp.cjs、零安装、离线缓存、IDE支持'
                        },
                        {
                            chapter: 20,
                            title: 'Yarn Berry高级特性',
                            description: 'Constraints、Protocols、Plugins、Patch Protocol'
                        }
                    ]
                },
                {
                    name: '第五部分：pnpm深度解析',
                    icon: '🟡',
                    count: 5,
                    topics: [
                        {
                            chapter: 21,
                            title: 'pnpm原理与优势',
                            description: '内容寻址存储、硬链接、严格依赖、幽灵依赖'
                        },
                        {
                            chapter: 22,
                            title: 'pnpm基础使用',
                            description: 'pnpm安装配置、常用命令、pnpm-lock.yaml、迁移'
                        },
                        {
                            chapter: 23,
                            title: 'pnpm Workspaces',
                            description: 'pnpm-workspace.yaml、workspace协议、过滤器'
                        },
                        {
                            chapter: 24,
                            title: 'pnpm高级特性',
                            description: '.pnpmfile.cjs、hoist配置、peer依赖、覆盖'
                        },
                        {
                            chapter: 25,
                            title: 'pnpm性能优化',
                            description: '全局store、缓存策略、并行安装、CI/CD使用'
                        }
                    ]
                },
                {
                    name: '第六部分：依赖管理实战',
                    icon: '⚙️',
                    count: 4,
                    topics: [
                        {
                            chapter: 26,
                            title: '依赖冲突解决',
                            description: '版本冲突、resolutions/overrides、peer依赖、去重'
                        },
                        {
                            chapter: 27,
                            title: '锁文件管理',
                            description: '三种锁文件对比、提交策略、合并冲突、审计变更'
                        },
                        {
                            chapter: 28,
                            title: '依赖更新策略',
                            description: '手动/自动更新、ncu/Renovate/Dependabot工具'
                        },
                        {
                            chapter: 29,
                            title: '幽灵依赖与依赖提升',
                            description: '幽灵依赖问题、扁平化vs嵌套、提升算法、最佳实践'
                        }
                    ]
                },
                {
                    name: '第七部分：Monorepo与工程化',
                    icon: '🏗️',
                    count: 6,
                    topics: [
                        {
                            chapter: 30,
                            title: 'Monorepo概念与实践',
                            description: 'Monorepo vs Multirepo、工具选型、包拆分原则'
                        },
                        {
                            chapter: 31,
                            title: 'Lerna与Monorepo管理',
                            description: 'Lerna配置、版本策略、bootstrap/run/publish'
                        },
                        {
                            chapter: 32,
                            title: '私有npm registry',
                            description: 'Verdaccio搭建、企业级方案、权限管理、代理'
                        },
                        {
                            chapter: 33,
                            title: '包管理器性能优化',
                            description: '安装速度、缓存策略、并行下载、CI/CD优化'
                        },
                        {
                            chapter: 34,
                            title: '依赖分析与优化',
                            description: '依赖可视化、包体积分析、无用依赖清理、按需加载'
                        },
                        {
                            chapter: 35,
                            title: '包安全与合规',
                            description: '漏洞扫描、License合规、供应链安全、SBom生成'
                        }
                    ]
                },
                {
                    name: '第八部分：最佳实践与未来',
                    icon: '✨',
                    count: 1,
                    topics: [
                        {
                            chapter: 36,
                            title: '包管理器最佳实践总结',
                            description: '选型决策、团队规范、性能/安全/可维护性、未来趋势'
                        }
                    ]
                }
            ]
        },
        {
            id: 'quiz',
            name: '面试题库',
            icon: '💡',
            urlTemplate: './render.html?subject=pkg-manager&type=quiz&chapter={chapter}',
            sections: [
                {
                    name: '第一部分：包管理器基础 - 面试题',
                    icon: '📘',
                    topics: [
                        { chapter: 1, title: '包管理器简介与发展史', description: '10道精选面试题' },
                        { chapter: 2, title: '模块化与依赖管理', description: '10道精选面试题' },
                        { chapter: 3, title: '包管理器工作原理', description: '10道精选面试题' },
                        { chapter: 4, title: 'registry与镜像源', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第二部分：npm核心功能 - 面试题',
                    icon: '🔴',
                    topics: [
                        { chapter: 5, title: 'npm安装与配置', description: '10道精选面试题' },
                        { chapter: 6, title: 'package.json详解', description: '10道精选面试题' },
                        { chapter: 7, title: 'npm常用命令', description: '10道精选面试题' },
                        { chapter: 8, title: 'npm scripts脚本', description: '10道精选面试题' },
                        { chapter: 9, title: '依赖版本管理', description: '10道精选面试题' },
                        { chapter: 10, title: 'npm link本地开发', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第三部分：npm进阶特性 - 面试题',
                    icon: '🚀',
                    topics: [
                        { chapter: 11, title: '发布npm包', description: '10道精选面试题' },
                        { chapter: 12, title: 'npm包开发最佳实践', description: '10道精选面试题' },
                        { chapter: 13, title: 'npm生命周期钩子', description: '10道精选面试题' },
                        { chapter: 14, title: 'npm安全', description: '10道精选面试题' },
                        { chapter: 15, title: 'npm Workspaces', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第四部分：Yarn深度解析 - 面试题',
                    icon: '🔵',
                    topics: [
                        { chapter: 16, title: 'Yarn简介与特性', description: '10道精选面试题' },
                        { chapter: 17, title: 'Yarn基础命令', description: '10道精选面试题' },
                        { chapter: 18, title: 'Yarn Workspaces', description: '10道精选面试题' },
                        { chapter: 19, title: 'Yarn Plug\'n\'Play', description: '10道精选面试题' },
                        { chapter: 20, title: 'Yarn Berry高级特性', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第五部分：pnpm深度解析 - 面试题',
                    icon: '🟡',
                    topics: [
                        { chapter: 21, title: 'pnpm原理与优势', description: '10道精选面试题' },
                        { chapter: 22, title: 'pnpm基础使用', description: '10道精选面试题' },
                        { chapter: 23, title: 'pnpm Workspaces', description: '10道精选面试题' },
                        { chapter: 24, title: 'pnpm高级特性', description: '10道精选面试题' },
                        { chapter: 25, title: 'pnpm性能优化', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第六部分：依赖管理实战 - 面试题',
                    icon: '⚙️',
                    topics: [
                        { chapter: 26, title: '依赖冲突解决', description: '10道精选面试题' },
                        { chapter: 27, title: '锁文件管理', description: '10道精选面试题' },
                        { chapter: 28, title: '依赖更新策略', description: '10道精选面试题' },
                        { chapter: 29, title: '幽灵依赖与依赖提升', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第七部分：Monorepo与工程化 - 面试题',
                    icon: '🏗️',
                    topics: [
                        { chapter: 30, title: 'Monorepo概念与实践', description: '10道精选面试题' },
                        { chapter: 31, title: 'Lerna与Monorepo管理', description: '10道精选面试题' },
                        { chapter: 32, title: '私有npm registry', description: '10道精选面试题' },
                        { chapter: 33, title: '包管理器性能优化', description: '10道精选面试题' },
                        { chapter: 34, title: '依赖分析与优化', description: '10道精选面试题' },
                        { chapter: 35, title: '包安全与合规', description: '10道精选面试题' }
                    ]
                },
                {
                    name: '第八部分：最佳实践与未来 - 面试题',
                    icon: '✨',
                    topics: [
                        { chapter: 36, title: '包管理器最佳实践总结', description: '10道精选面试题' }
                    ]
                }
            ]
        }
    ],
    
    // 页脚配置
    footer: {
        text: '© 2024 包管理器学习系统 | 掌握现代前端工程化核心技术',
        links: [
            { text: 'npm官网', url: 'https://www.npmjs.com' },
            { text: 'yarn官网', url: 'https://yarnpkg.com' },
            { text: 'pnpm官网', url: 'https://pnpm.io' }
        ]
    }
});
