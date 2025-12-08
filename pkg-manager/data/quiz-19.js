/**
 * 第19章：Yarn Plug'n'Play (PnP) - 面试题
 * 10道精选面试题：测试对Yarn PnP革命性特性的理解
 */

window.content = {
    section: {
        title: '第19章：Yarn Plug\'n\'Play - 面试题',
        icon: '🔵'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：PnP基本概念',
            content: {
                difficulty: 'easy',
                tags: ['PnP', '基础概念'],
                question: 'Yarn Plug\'n\'Play (PnP)的主要特点是什么？',
                options: [
                    '加快npm安装速度',
                    '不生成node_modules，直接从.pnp.cjs加载依赖',
                    '自动压缩代码',
                    '提供更好的UI界面'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn PnP工作原理',
                    description: 'PnP是Yarn Berry最革命性的特性，彻底摆脱node_modules。',
                    sections: [
                        {
                            title: '传统方式的问题',
                            code: '// 传统node_modules\nproject/\n├── node_modules/       # 数千个文件\n│   ├── package-a/\n│   │   ├── index.js\n│   │   └── node_modules/\n│   ├── package-b/\n│   └── ...\n└── package.json\n\n// 问题：\n// - 文件数量庞大（数万个）\n// - 安装慢（复制文件）\n// - 磁盘占用大\n// - I/O密集',
                            points: [
                                'node_modules体积庞大',
                                '安装过程慢（文件I/O）',
                                '查找依赖效率低',
                                '幽灵依赖问题'
                            ]
                        },
                        {
                            title: 'PnP的革新',
                            code: '// PnP方式\nproject/\n├── .pnp.cjs           # 单个映射文件\n├── .yarn/\n│   └── cache/         # zip压缩包\n│       ├── lodash-npm-4.17.21-8.zip\n│       └── react-npm-18.2.0-9.zip\n└── package.json\n\n// 优势：\n// - 无node_modules\n// - 安装极快（解压zip）\n// - 磁盘占用小\n// - 严格依赖',
                            points: [
                                '不生成node_modules',
                                '依赖存为zip文件',
                                '.pnp.cjs记录依赖映射',
                                'Node.js直接从zip读取'
                            ]
                        },
                        {
                            title: 'PnP加载机制',
                            code: '// .pnp.cjs（简化）\nmodule.exports = {\n  packageRegistry: new Map([\n    ["lodash", new Map([\n      ["4.17.21", {\n        packageLocation: "./.yarn/cache/lodash-npm-4.17.21-8.zip/node_modules/lodash/",\n        packageDependencies: new Map([...])\n      }]\n    ])]\n  ])\n};\n\n// 当代码执行 require("lodash"):\n// 1. Node.js调用PnP resolver\n// 2. 查找.pnp.cjs映射表\n// 3. 定位到zip文件位置\n// 4. 从zip读取并返回模块',
                            content: '.pnp.cjs是依赖解析的核心，替代了node_modules的查找机制。'
                        }
                    ]
                },
                source: 'Yarn Berry官方文档'
            }
        },
        
        // 简单题 2 - 多选题
        {
            type: 'quiz',
            title: '题目2：PnP优势',
            content: {
                difficulty: 'easy',
                tags: ['PnP优势', '多选题'],
                question: 'Yarn PnP相比传统node_modules的优势包括哪些？',
                options: [
                    '安装速度更快',
                    '磁盘占用更小',
                    '严格的依赖管理（防止幽灵依赖）',
                    '完美的工具链兼容性'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'PnP优势详解',
                    description: 'PnP在多个方面带来显著改进，但也有权衡。',
                    sections: [
                        {
                            title: '1. 安装速度提升',
                            code: '// 性能对比（500个依赖）\n┌────────────────┬─────────┬──────────┐\n│ 操作           │ 传统    │ PnP      │\n├────────────────┼─────────┼──────────┤\n│ 首次安装       │ 35秒    │ 15秒     │\n│ 有缓存         │ 20秒    │ 2秒      │\n│ 文件数量       │ 50000+  │ 100+     │\n└────────────────┴─────────┴──────────┘',
                            points: [
                                '无需复制文件到node_modules',
                                '只需解压zip到缓存',
                                '生成单个.pnp.cjs',
                                '减少90%+的文件I/O'
                            ]
                        },
                        {
                            title: '2. 磁盘空间节省',
                            code: '// 磁盘占用对比\n// 传统node_modules\nproject1/node_modules/  # 200MB\nproject2/node_modules/  # 180MB\nproject3/node_modules/  # 220MB\n// 总计：600MB\n\n// PnP + 全局缓存\n~/.yarn/berry/cache/    # 150MB（共享）\nproject1/.pnp.cjs       # 2MB\nproject2/.pnp.cjs       # 2MB\nproject3/.pnp.cjs       # 2MB\n// 总计：156MB\n\n// 节省：74%',
                            points: [
                                'zip压缩减小体积',
                                '全局缓存跨项目共享',
                                '无重复安装',
                                '零安装可提交到git'
                            ]
                        },
                        {
                            title: '3. 严格依赖管理',
                            code: '// 传统node_modules（宽松）\n// package.json不包含lodash\nconst _ = require(\'lodash\');  // ✅ 能工作（幽灵依赖）\n// 因为某个依赖安装了lodash到根node_modules\n\n// PnP（严格）\nconst _ = require(\'lodash\');  // ❌ 报错\n// Error: lodash is not a dependency\n\n// 必须显式声明\n// package.json\n{\n  "dependencies": {\n    "lodash": "^4.17.21"  // ✅ 必须声明\n  }\n}',
                            points: [
                                '只能访问声明的依赖',
                                '杜绝幽灵依赖',
                                '依赖关系清晰',
                                '避免隐式耦合'
                            ]
                        },
                        {
                            title: '关于选项D（工具链兼容性）',
                            content: '❌ 这是PnP的主要挑战，不是优势：',
                            code: '// 不兼容的工具\n❌ 某些原生模块（node-gyp）\n❌ 旧版TypeScript（<3.8）\n❌ 某些IDE（需要配置）\n❌ 某些构建工具\n\n// 需要额外配置\n// .yarnrc.yml\nnodeLinker: pnp\npnpMode: loose  # 宽松模式\n\n// VSCode配置\n// .vscode/settings.json\n{\n  "typescript.tsdk": ".yarn/sdks/typescript/lib",\n  "typescript.enablePromptUseWorkspaceTsdk": true\n}',
                            content: '工具链兼容性是PnP最大的痛点，需要额外工作。'
                        }
                    ]
                },
                source: 'Yarn Berry文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：启用PnP',
            content: {
                difficulty: 'easy',
                tags: ['PnP配置', '启用'],
                question: '如何在项目中启用Yarn PnP？',
                options: [
                    'npm install --pnp',
                    'yarn set version berry，默认启用PnP',
                    'yarn config set pnp true',
                    'PnP无法配置，自动启用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '启用Yarn PnP',
                    description: 'Yarn Berry默认使用PnP，也可以配置为传统node_modules模式。',
                    sections: [
                        {
                            title: '升级到Berry',
                            code: '// 1. 升级Yarn到Berry\ncd my-project\nyarn set version berry\n\n// 2. 安装依赖\nyarn install\n\n// 3. 生成的文件\n.yarn/\n├── cache/          # 依赖zip缓存\n├── releases/       # Yarn自身\n│   └── yarn-berry.cjs\n└── sdks/           # IDE支持\n.pnp.cjs            # PnP映射文件\n.pnp.loader.mjs     # ESM loader\n.yarnrc.yml         # Yarn配置',
                            content: 'Yarn Berry默认使用PnP模式。'
                        },
                        {
                            title: '配置nodeLinker',
                            code: '// .yarnrc.yml\n\n// 方式1：PnP模式（默认）\nnodeLinker: pnp\n\n// 方式2：传统node_modules\nnodeLinker: node-modules\n\n// 方式3：PnP宽松模式\nnodeLinker: pnp\npnpMode: loose\n\n// 方式4：硬链接模式\nnodeLinker: pnpm',
                            content: 'nodeLinker控制依赖安装方式。'
                        },
                        {
                            title: 'PnP模式对比',
                            code: '// PnP strict（默认）\nnodeLinker: pnp\npnpMode: strict\n// - 最严格\n// - 不允许未声明依赖\n// - 性能最佳\n\n// PnP loose（兼容模式）\nnodeLinker: pnp\npnpMode: loose\n// - 允许访问依赖的依赖\n// - 更好的兼容性\n// - 牺牲部分严格性\n\n// node-modules（传统模式）\nnodeLinker: node-modules\n// - 生成node_modules\n// - 完全兼容\n// - 失去PnP优势'
                        }
                    ]
                },
                source: 'Yarn Berry文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：.pnp.cjs文件',
            content: {
                difficulty: 'medium',
                tags: ['.pnp.cjs', '映射文件'],
                question: '.pnp.cjs文件的作用是什么？',
                code: `// .pnp.cjs（简化版）
module.exports.packageRegistry = new Map([
  ["lodash", new Map([
    ["4.17.21", {
      packageLocation: "./.yarn/cache/lodash-npm-4.17.21-8.zip/...",
      packageDependencies: new Map([...])
    }]
  ])]
]);`,
                options: [
                    '配置文件，设置Yarn行为',
                    '依赖映射表，告诉Node.js如何解析模块',
                    '缓存文件，加速安装',
                    '日志文件，记录安装过程'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '.pnp.cjs深度解析',
                    description: '.pnp.cjs是PnP的核心，替代了node_modules的模块解析机制。',
                    sections: [
                        {
                            title: '文件结构',
                            code: '// .pnp.cjs完整结构\nmodule.exports = {\n  // 包注册表\n  packageRegistry: new Map([\n    [packageName, new Map([\n      [version, {\n        packageLocation: "...",  // zip文件位置\n        packageDependencies: Map,  // 该包的依赖\n        linkType: "HARD|SOFT"\n      }]\n    ])]\n  ]),\n  \n  // 依赖树元数据\n  dependencyTreeRoots: [...],\n  \n  // 运行时resolver\n  findPackageLocator: function() {...},\n  resolveToUnqualified: function() {...}\n};',
                            content: '.pnp.cjs包含完整的依赖图和解析逻辑。'
                        },
                        {
                            title: '工作原理',
                            code: '// Node.js执行流程\n// 1. 启动时加载.pnp.cjs\nrequire(\'./.pnp.cjs\').setup();\n\n// 2. Patch Node.js的Module._load\n// 原始：查找node_modules/\n// PnP：查询.pnp.cjs映射\n\n// 3. 代码中require\nconst _ = require(\'lodash\');\n\n// 4. PnP resolver介入\n// - 查找当前包的packageLocation\n// - 查找lodash在该包的packageDependencies\n// - 定位到.yarn/cache/lodash-xxx.zip\n// - 从zip读取并返回模块',
                            points: [
                                'Hook Module系统',
                                '拦截require/import',
                                '查询映射表',
                                '从zip加载模块'
                            ]
                        },
                        {
                            title: '映射表示例',
                            code: '// 场景：app依赖lodash@4.17.21\npackageRegistry.get("app")  // 根包\n  .get(null)                // 无版本号\n  .packageDependencies\n  .get("lodash")            // 查找lodash\n  // → "4.17.21"\n\npackageRegistry.get("lodash")\n  .get("4.17.21")\n  .packageLocation\n  // → ".yarn/cache/lodash-npm-4.17.21-8.zip/node_modules/lodash/"\n\n// 完整路径\n// project/.yarn/cache/lodash-npm-4.17.21-8.zip/node_modules/lodash/index.js',
                            content: '映射表精确记录每个包和依赖关系。'
                        },
                        {
                            title: '生成过程',
                            code: '// yarn install时\n1. 解析package.json和yarn.lock\n2. 下载/提取依赖到.yarn/cache/\n3. 构建依赖图\n4. 生成.pnp.cjs映射表\n5. 生成.pnp.loader.mjs（ESM支持）\n\n// .pnp.cjs是自动生成的\n// ❌ 不要手动编辑\n// ✅ 提交到git（零安装）',
                            content: '.pnp.cjs由Yarn自动生成和管理。'
                        }
                    ]
                },
                source: 'Yarn PnP实现原理'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：PnP兼容性问题',
            content: {
                difficulty: 'medium',
                tags: ['兼容性', 'IDE支持'],
                question: '使用Yarn PnP时，VSCode需要如何配置才能正确识别TypeScript？',
                options: [
                    '无需配置，自动支持',
                    '运行yarn pnpify --sdk vscode',
                    '手动安装VSCode插件',
                    'PnP不支持VSCode'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'PnP IDE集成',
                    description: 'PnP改变了模块解析，IDE需要特殊配置才能正确工作。',
                    sections: [
                        {
                            title: '问题根源',
                            code: '// 传统方式\n// VSCode查找TypeScript\nnode_modules/typescript/lib/typescript.js  // ✅ 找到\n\n// PnP方式\nnode_modules/  # 不存在！\n.yarn/cache/typescript-npm-5.0.0-9.zip/  // VSCode找不到',
                            content: 'VSCode等IDE默认假设存在node_modules，PnP打破了这个假设。'
                        },
                        {
                            title: '解决方案：SDK',
                            code: '// 生成IDE SDK\nyarn dlx @yarnpkg/sdks vscode\n\n// 或使用pnpify（旧方式）\nyarn pnpify --sdk vscode\n\n// 生成的文件\n.yarn/sdks/\n├── typescript/\n│   ├── lib/\n│   │   └── typescript.js  # 包装器\n│   └── package.json\n├── eslint/\n│   └── ...\n└── prettier/\n    └── ...\n\n// .vscode/settings.json自动配置\n{\n  "typescript.tsdk": ".yarn/sdks/typescript/lib",\n  "typescript.enablePromptUseWorkspaceTsdk": true,\n  "eslint.nodePath": ".yarn/sdks",\n  "prettier.prettierPath": ".yarn/sdks/prettier/index.js"\n}',
                            points: [
                                'SDK是桥接层',
                                '包装实际的zip文件',
                                'IDE通过SDK访问工具',
                                '需要重启VSCode生效'
                            ]
                        },
                        {
                            title: '支持的IDE和工具',
                            code: '// 支持的IDE\nyarn dlx @yarnpkg/sdks vscode      # VSCode\nyarn dlx @yarnpkg/sdks webstorm    # WebStorm\nyarn dlx @yarnpkg/sdks vim         # Vim/Neovim\n\n// 支持的工具\n- TypeScript\n- ESLint\n- Prettier\n- Flow\n\n// 不支持的（需要fallback）\n- 某些原生模块构建工具\n- 某些旧版本工具',
                            content: '主流IDE和工具都有SDK支持。'
                        },
                        {
                            title: 'VSCode插件',
                            code: '// 安装ZipFS扩展（可选）\n// VSCode Marketplace: arcanis.vscode-zipfs\n\n// 功能：\n// - 直接在VSCode中浏览zip文件\n// - 查看依赖源码\n// - 调试支持\n\n// 推荐插件列表\n{\n  "recommendations": [\n    "arcanis.vscode-zipfs",     // Zip文件支持\n    "dbaeumer.vscode-eslint",   // ESLint\n    "esbenp.prettier-vscode"    // Prettier\n  ]\n}',
                            content: 'ZipFS插件增强PnP开发体验。'
                        }
                    ]
                },
                source: 'Yarn Editor SDKs'
            }
        },
        
        // 中等题 3 - 多选题
        {
            type: 'quiz',
            title: '题目6：零安装（Zero-Install）',
            content: {
                difficulty: 'medium',
                tags: ['零安装', '多选题'],
                question: 'Yarn PnP的零安装特性包括哪些内容？',
                options: [
                    '将.yarn/cache/提交到git',
                    '将.pnp.cjs提交到git',
                    'clone后无需yarn install即可运行',
                    '完全不需要网络'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'Yarn零安装详解',
                    description: '零安装是PnP最激进的创新，彻底改变依赖分发方式。',
                    sections: [
                        {
                            title: '零安装原理',
                            code: '// 传统流程\n1. git clone project\n2. yarn install      # 下载依赖，生成node_modules\n3. 开始开发\n\n// 零安装流程\n1. git clone project  # 包含.yarn/cache/和.pnp.cjs\n2. 直接开始开发！   # 无需yarn install',
                            points: [
                                '依赖作为git对象存储',
                                'clone即包含所有依赖',
                                '无需install步骤',
                                '完全离线可用'
                            ]
                        },
                        {
                            title: '需要提交的文件',
                            code: '// .gitignore配置（零安装）\n# 提交这些（与默认相反！）\n!.yarn/cache/        # ✅ 提交zip缓存\n!.pnp.cjs            # ✅ 提交映射文件\n!.yarn/releases/     # ✅ 提交Yarn自身\n\n# 排除这些\nnode_modules/\n.yarn/install-state.gz\n.yarn/build-state.yml',
                            content: '零安装需要提交缓存和PnP文件。'
                        },
                        {
                            title: '零安装的优势',
                            code: '// 优势1：极速上手\n// 新成员加入\ngit clone repo       # 5秒\n// yarn install      # ✗ 跳过（30秒）\nyarn run dev         # 立即开始\n\n// 优势2：CI加速\n// .github/workflows/ci.yml\nsteps:\n  - uses: actions/checkout@v3\n  # - run: yarn install  # ✗ 不需要\n  - run: yarn test       # 直接测试\n\n// 优势3：完全离线\n// 飞机上、地铁里也能clone并开发',
                            points: [
                                '新成员入职即刻生产力',
                                'CI时间减少80%+',
                                '完全离线开发',
                                '依赖不会"失踪"'
                            ]
                        },
                        {
                            title: '零安装的代价',
                            code: '// 代价1：仓库体积增大\ngit clone repo       # 传统：5MB → 零安装：50-200MB\n\n// 代价2：git操作变慢\ngit status           # 扫描更多文件\ngit diff             # diff二进制zip\ngit merge            # 冲突难处理\n\n// 代价3：Review困难\n// PR中包含大量zip文件变更\n// 难以review依赖更新',
                            content: '零安装以git仓库大小换取便利性。'
                        },
                        {
                            title: '关于选项D（网络）',
                            content: '❌ 零安装不等于完全不需要网络：',
                            code: '// 首次设置项目（需要网络）\nyarn install  # 下载依赖到.yarn/cache/\ngit add .yarn/cache/\ngit commit\ngit push\n\n// 其他成员（无需网络）\ngit clone  # 已包含依赖\nyarn dev   # 直接运行\n\n// 添加新依赖（需要网络）\nyarn add lodash  # 下载新包\ngit commit       # 提交到仓库',
                            content: '首次下载和添加依赖仍需网络。'
                        },
                        {
                            title: '零安装最佳实践',
                            code: '// 适合零安装：\n✅ 私有仓库（不担心泄露依赖）\n✅ 团队频繁协作\n✅ CI/CD性能重要\n✅ 网络不稳定环境\n\n// 不适合零安装：\n❌ 开源项目（贡献者不想clone大仓库）\n❌ Git托管有大小限制\n❌ 带宽受限环境\n❌ 依赖更新频繁（git历史膨胀）',
                            content: '根据团队和项目特点决策。'
                        }
                    ]
                },
                source: 'Yarn零安装文档'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：PnP Loose模式',
            content: {
                difficulty: 'medium',
                tags: ['PnP模式', 'loose vs strict'],
                question: 'PnP strict模式和loose模式的区别是什么？',
                code: `// .yarnrc.yml
nodeLinker: pnp
pnpMode: strict  # 或 loose`,
                options: [
                    'loose模式允许访问未声明的依赖',
                    'strict模式性能更好',
                    'loose模式兼容性更好',
                    '以上都对'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'PnP模式对比',
                    description: 'strict和loose模式在严格性和兼容性之间权衡。',
                    sections: [
                        {
                            title: 'Strict模式（默认）',
                            code: '// .yarnrc.yml\npnpMode: strict\n\n// 行为：最严格\nconst lodash = require(\'lodash\');  // ❌ 报错\n// Error: Package "lodash" is not declared\n\n// 必须声明\n// package.json\n{\n  "dependencies": {\n    "lodash": "^4.17.21"  // ✅ 显式声明\n  }\n}',
                            points: [
                                '只能访问声明的依赖',
                                '杜绝幽灵依赖',
                                '依赖关系完全显式',
                                '最佳性能'
                            ]
                        },
                        {
                            title: 'Loose模式（兼容）',
                            code: '// .yarnrc.yml\npnpMode: loose\n\n// 行为：允许访问依赖的依赖\n// package.json（没有lodash）\n{\n  "dependencies": {\n    "webpack": "^5.0.0"  // webpack依赖lodash\n  }\n}\n\n// 代码\nconst lodash = require(\'lodash\');  // ✅ 可以工作\n// loose模式允许访问webpack的依赖',
                            points: [
                                '允许访问传递依赖',
                                '更好的兼容性',
                                '性能略差',
                                '仍比node_modules严格'
                            ]
                        },
                        {
                            title: '性能对比',
                            code: '// 依赖解析性能\n┌──────────────┬─────────┬─────────┐\n│ 操作         │ Strict  │ Loose   │\n├──────────────┼─────────┼─────────┤\n│ require()    │ 最快    │ 快      │\n│ 解析逻辑     │ 简单    │ 复杂    │\n│ 内存占用     │ 最小    │ 略大    │\n└──────────────┴─────────┴─────────┘\n\n// Strict：直接查找声明的依赖\n// Loose：需要遍历依赖的依赖',
                            content: 'Strict模式查找路径更短，性能更好。'
                        },
                        {
                            title: '兼容性对比',
                            code: '// Strict模式问题\n// 某些旧包可能依赖未声明的包\nimport \'some-old-package\';  // ❌ 可能失败\n\n// Loose模式\nimport \'some-old-package\';  // ✅ 通常能工作\n\n// 实际案例：\n// - 某些babel插件\n// - 某些webpack loader\n// - 某些老旧依赖\n\n// 这些包在传统node_modules能工作\n// 在PnP strict会失败\n// 需要loose模式或修复包',
                            content: 'Loose模式是从传统迁移的过渡方案。'
                        },
                        {
                            title: '选择建议',
                            code: '// 新项目：Strict\npnpMode: strict\n// - 最佳实践\n// - 依赖关系清晰\n// - 最佳性能\n\n// 迁移老项目：Loose\npnpMode: loose\n// - 兼容性优先\n// - 渐进式迁移\n// - 减少改造成本\n\n// 逐步过渡\n// 1. 先用loose运行起来\n// 2. 识别未声明依赖\n// 3. 逐个修复\n// 4. 切换到strict',
                            content: '根据项目情况选择合适的模式。'
                        }
                    ]
                },
                source: 'Yarn PnP配置'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：PnP与原生模块',
            content: {
                difficulty: 'hard',
                tags: ['原生模块', 'node-gyp'],
                question: 'Yarn PnP对包含原生模块（node-gyp）的包支持如何？',
                options: [
                    '完全支持，无需特殊配置',
                    '部分支持，某些原生模块可能需要unplugged',
                    '完全不支持原生模块',
                    '需要切换回node_modules模式'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'PnP原生模块支持',
                    description: 'PnP对原生模块的支持有限制，需要特殊处理。',
                    sections: [
                        {
                            title: '原生模块的问题',
                            code: '// 原生模块特点\n// 1. 包含C/C++代码\n// 2. 需要编译（node-gyp）\n// 3. 依赖文件系统路径\n// 4. 期望在node_modules中\n\n// 常见原生模块\n- node-sass\n- sharp\n- sqlite3\n- bcrypt\n- canvas',
                            content: '原生模块需要访问真实文件系统路径，与PnP的zip存储冲突。'
                        },
                        {
                            title: 'Unplugged机制',
                            code: '// .yarnrc.yml配置\n# 标记需要解压的包\npnpUnpluggedFolder: .yarn/unplugged\n\n# 自动unplugged（Yarn检测原生模块）\n# 或手动指定\npackageExtensions:\n  "sharp@*":\n    unplugged: true\n\n// 效果：\n// 正常包：.yarn/cache/package.zip\n// Unplugged：.yarn/unplugged/package/node_modules/package/',
                            points: [
                                'Unplugged = 解压到真实目录',
                                '原生模块可以正常编译',
                                '访问文件系统路径',
                                '失去zip的优势'
                            ]
                        },
                        {
                            title: 'Unplugged示例',
                            code: '// 项目结构\nproject/\n├── .yarn/\n│   ├── cache/\n│   │   ├── lodash-npm-4.17.21-8.zip  # 普通包\n│   │   └── react-npm-18.2.0-9.zip\n│   └── unplugged/\n│       └── sharp-npm-0.32.0-abcd1234/  # 原生模块（解压）\n│           └── node_modules/sharp/\n│               ├── build/\n│               │   └── Release/sharp.node  # 编译后的.node文件\n│               └── lib/\n\n// .pnp.cjs中的映射\npackageRegistry.set("sharp", {\n  packageLocation: ".yarn/unplugged/sharp-npm-0.32.0-abcd1234/node_modules/sharp/"\n  // 指向真实目录，不是zip\n});',
                            content: 'Unplugged包存储在真实目录中。'
                        },
                        {
                            title: '常见解决方案',
                            code: '// 方案1：让Yarn自动处理\n// Yarn通常能自动检测原生模块\nyarn install  # 自动unplugged\n\n// 方案2：手动配置unplugged\n// .yarnrc.yml\npackageExtensions:\n  "sqlite3@*":\n    unplugged: true\n\n// 方案3：使用替代包\n// 原生包 → WASM/JS纯实现\nnode-sass → sass (Dart Sass)\nsqlite3 → better-sqlite3\nsharp → jimp (纯JS)\n\n// 方案4：切换nodeLinker\n// .yarnrc.yml\nnodeLinker: node-modules  # 回退传统模式',
                            content: '根据包的重要性选择方案。'
                        },
                        {
                            title: '检查原生模块',
                            code: '// 识别项目中的原生模块\nyarn info <package> --json | jq .hasNativeBindings\n\n// 或查看package.json\n{\n  "gypfile": true,  // 包含binding.gyp\n  "scripts": {\n    "install": "node-gyp rebuild"  // 编译脚本\n  }\n}\n\n// 查看unplugged包\nls .yarn/unplugged/',
                            content: '了解哪些包需要特殊处理。'
                        }
                    ]
                },
                source: 'Yarn PnP原生模块支持'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目9：PnP迁移挑战',
            content: {
                difficulty: 'hard',
                tags: ['迁移', '挑战', '多选题'],
                question: '从传统node_modules迁移到Yarn PnP可能遇到哪些挑战？',
                options: [
                    '工具链不兼容（IDE、构建工具）',
                    '某些包依赖未声明（幽灵依赖）',
                    '原生模块编译问题',
                    'TypeScript类型定义找不到'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'PnP迁移实战',
                    description: '迁移到PnP需要克服多个技术挑战，了解这些有助于顺利过渡。',
                    sections: [
                        {
                            title: '1. 工具链兼容性',
                            code: '// 常见不兼容工具\n❌ 旧版TypeScript（<3.8）\n❌ 某些webpack loader\n❌ 某些babel preset\n❌ Jest（需要配置）\n❌ Storybook（需要插件）\n\n// 解决方案\n// 1. 升级到支持版本\nyarn add -D typescript@latest\n\n// 2. 生成SDK\nyarn dlx @yarnpkg/sdks vscode\n\n// 3. 配置Jest\n// jest.config.js\nmodule.exports = {\n  resolver: require.resolve(\'jest-pnp-resolver\')\n};',
                            content: '工具链是最常见的痛点。'
                        },
                        {
                            title: '2. 幽灵依赖问题',
                            code: '// 问题：代码依赖未声明的包\n// 传统：能工作（幽灵依赖）\nconst moment = require(\'moment\');  // ✅\n// moment被某个依赖安装了\n\n// PnP：报错\nconst moment = require(\'moment\');  // ❌\n// Error: Package "moment" is not declared\n\n// 检测幽灵依赖\nyarn dlx depcheck\n# 输出：\n# Missing dependencies:\n#   * moment\n\n// 修复\nyarn add moment  # 显式声明',
                            points: [
                                '使用depcheck检测',
                                '逐个显式声明',
                                '或使用loose模式过渡',
                                '清理无用依赖'
                            ]
                        },
                        {
                            title: '3. 原生模块',
                            code: '// 问题：原生模块在zip中无法编译\nyarn add node-sass\nyarn install  # ❌ 可能失败\n\n// 解决方案\n// 1. 自动unplugged\n// Yarn通常能自动检测并解压\n\n// 2. 手动配置\n// .yarnrc.yml\npackageExtensions:\n  "node-sass@*":\n    unplugged: true\n\n// 3. 使用纯JS替代\nyarn remove node-sass\nyarn add sass  # Dart Sass（纯JS）',
                            content: '优先选择无原生依赖的替代品。'
                        },
                        {
                            title: '4. TypeScript类型',
                            code: '// 问题：@types包找不到\n// 传统：node_modules/@types/node\n// PnP：在zip中，IDE可能找不到\n\n// 解决方案\n// 1. 生成TypeScript SDK\nyarn dlx @yarnpkg/sdks vscode\n\n// 2. 配置tsconfig.json\n{\n  "compilerOptions": {\n    "typeRoots": [\n      ".yarn/sdks",\n      "node_modules/@types"\n    ]\n  }\n}\n\n// 3. VSCode设置\n// .vscode/settings.json\n{\n  "typescript.tsdk": ".yarn/sdks/typescript/lib",\n  "typescript.enablePromptUseWorkspaceTsdk": true\n}',
                            content: 'TypeScript需要特殊的SDK配置。'
                        },
                        {
                            title: '迁移步骤',
                            code: '// 推荐的迁移流程\n\n// 1. 升级Yarn\nyarn set version berry\n\n// 2. 先用loose模式\n// .yarnrc.yml\nnodeLinker: pnp\npnpMode: loose\n\n// 3. 安装并测试\nyarn install\nyarn test  # 检查是否有错误\n\n// 4. 生成IDE SDK\nyarn dlx @yarnpkg/sdks vscode\n\n// 5. 修复幽灵依赖\nyarn dlx depcheck\n# 根据输出添加缺失依赖\n\n// 6. 处理原生模块\n# 检查.yarn/unplugged/\n# 配置需要的unplugged\n\n// 7. 切换到strict\npnpMode: strict\nyarn install\n\n// 8. 完整测试\nyarn test\nyarn build\nyarn lint',
                            content: '渐进式迁移，降低风险。'
                        },
                        {
                            title: '回退方案',
                            code: '// 如果PnP问题太多，可以回退\n\n// 方案1：使用node-modules模式\n// .yarnrc.yml\nnodeLinker: node-modules\n\n// 仍然使用Yarn Berry，但保留node_modules\n// 失去PnP优势，保留兼容性\n\n// 方案2：降级到Yarn 1\nyarn set version classic\n\n// 完全回到传统方式',
                            content: 'PnP不是强制的，可以根据项目选择。'
                        }
                    ]
                },
                source: 'Yarn PnP迁移指南'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz-code',
            title: '题目10：PnP性能优化',
            content: {
                difficulty: 'hard',
                tags: ['性能优化', 'PnP'],
                question: '以下哪些措施可以优化Yarn PnP的性能？',
                code: `// .yarnrc.yml配置优化
nodeLinker: pnp
enableGlobalCache: true
compressionLevel: 0`,
                options: [
                    '启用零安装减少install时间',
                    '使用compressionLevel: 0加快解压',
                    '配置enableGlobalCache共享缓存',
                    '以上都对'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'Yarn PnP性能调优',
                    description: '通过多种配置和策略最大化PnP性能优势。',
                    sections: [
                        {
                            title: '1. 零安装（最大化）',
                            code: '// .gitignore配置\n!.yarn/cache/      # 提交缓存\n!.pnp.cjs          # 提交映射\n!.yarn/releases/   # 提交Yarn\n\n// 效果\n┌────────────────┬──────────┬──────────┐\n│ 操作           │ 传统     │ 零安装   │\n├────────────────┼──────────┼──────────┤\n│ git clone      │ 5秒      │ 10秒     │\n│ yarn install   │ 30秒     │ 0秒      │\n│ 开始开发       │ 35秒     │ 10秒     │\n└────────────────┴──────────┴──────────┘\n\n// 节省：25秒（71%）',
                            points: [
                                'clone后立即可用',
                                'CI无需install',
                                '完全离线开发',
                                '团队效率提升'
                            ]
                        },
                        {
                            title: '2. 压缩级别优化',
                            code: '// .yarnrc.yml\ncompressionLevel: 0  # 或 mixed\n\n// 压缩级别对比\n┌──────────┬─────────┬──────────┬──────────┐\n│ 级别     │ 大小    │ 压缩时间 │ 解压时间 │\n├──────────┼─────────┼──────────┼──────────┤\n│ 0 (无)   │ 150MB   │ 0s       │ 0s       │\n│ mixed    │ 100MB   │ 2s       │ 0.5s     │\n│ 9 (最大) │ 80MB    │ 10s      │ 2s       │\n└──────────┴─────────┴──────────┴──────────┘\n\n// mixed策略（推荐）\n// - 大包不压缩（react, lodash）\n// - 小包压缩（工具包）\n// - 平衡大小和速度',
                            content: '根据网络和磁盘权衡选择压缩级别。'
                        },
                        {
                            title: '3. 全局缓存',
                            code: '// .yarnrc.yml\nenableGlobalCache: true  # 默认启用\n\n// 效果\n~/.yarn/berry/cache/  # 全局缓存\n├── lodash-npm-4.17.21-8.zip\n└── react-npm-18.2.0-9.zip\n\n// 多项目共享\nproject1/.yarn/cache/ → 符号链接到全局\nproject2/.yarn/cache/ → 符号链接到全局\n\n// 优势\n// - 跨项目共享\n// - 减少磁盘占用\n// - 加速新项目创建',
                            points: [
                                '默认已启用',
                                '跨项目复用',
                                '节省磁盘',
                                '零安装可禁用（本地缓存）'
                            ]
                        },
                        {
                            title: '4. 缓存策略',
                            code: '// CI/CD缓存配置\n// .github/workflows/ci.yml\nsteps:\n  - uses: actions/cache@v3\n    with:\n      path: |\n        .yarn/cache\n        .yarn/install-state.gz\n      key: yarn-${{ hashFiles(\'yarn.lock\') }}\n\n// 效果\n// 首次：安装30秒\n// 缓存命中：安装5秒\n\n// Docker层缓存\n# Dockerfile\nCOPY .yarn/cache .yarn/cache\nCOPY .pnp.cjs .pnp.cjs\n# 依赖层被缓存',
                            content: 'CI缓存大幅加速构建。'
                        },
                        {
                            title: '5. 并行优化',
                            code: '// .yarnrc.yml\nhttpTimeout: 60000      # 网络超时\nnetworkConcurrency: 16   # 并发下载数\n\n// 安装阶段并行化\nyarn install\n// 1. 并行下载包\n// 2. 并行解压zip\n// 3. 并行生成.pnp.cjs\n\n// Workspaces并行构建\nyarn workspaces foreach -A run build\n// 或使用Turborepo\nturbo run build  # 智能并行+缓存',
                            content: '充分利用CPU和网络带宽。'
                        },
                        {
                            title: '6. 监控和分析',
                            code: '// 安装性能分析\nyarn install --inline-builds\n// 显示详细的安装步骤和耗时\n\n// 查看缓存统计\nyarn cache clean --dry-run\n// 显示缓存大小和文件数\n\n// 依赖大小分析\nyarn dlx webpack-bundle-analyzer\n\n// 定位性能瓶颈\n// - 大型依赖（考虑懒加载）\n// - 重复依赖（版本统一）\n// - 无用依赖（清理）',
                            content: '数据驱动的优化决策。'
                        },
                        {
                            title: '完整优化配置',
                            code: '// .yarnrc.yml（优化版）\nnodeLinker: pnp\npnpMode: strict\n\n# 性能优化\ncompressionLevel: mixed\nenableGlobalCache: true\nnetworkConcurrency: 16\n\n# 零安装（可选）\ninstallStatePath: .yarn/install-state.gz\n\n# 缓存控制\ncacheFolder: .yarn/cache\n\n# 网络优化\nhttpTimeout: 60000\nnetworkSettings:\n  httpProxy: "http://proxy:8080"  # 如需代理',
                            content: '根据项目调整配置参数。'
                        }
                    ]
                },
                source: 'Yarn性能优化指南'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第18章面试题：Yarn Workspaces',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=18'
        },
        next: {
            title: '第20章面试题：Yarn Berry高级特性',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=20'
        }
    }
};
