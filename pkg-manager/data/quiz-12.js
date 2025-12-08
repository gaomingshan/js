/**
 * 第12章：npm包开发最佳实践 - 面试题
 * 10道精选面试题：测试对npm包开发规范和优化技巧的理解
 */

window.content = {
    section: {
        title: '第12章：npm包开发最佳实践 - 面试题',
        icon: '🚀'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：main字段作用',
            content: {
                difficulty: 'easy',
                tags: ['package.json', 'main'],
                question: 'package.json中main字段的作用是什么？',
                options: [
                    '指定包的主页链接',
                    '指定包的入口文件',
                    '指定包的主要功能',
                    '指定包的主版本号'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'main字段',
                    description: 'main字段指定包的入口文件，当其他人require或import你的包时，会加载这个文件。',
                    sections: [
                        {
                            title: '基础用法',
                            code: '// package.json\n{\n  "name": "my-package",\n  "main": "index.js"  // 或 "./lib/index.js"\n}\n\n// 用户使用\nconst pkg = require(\'my-package\');  // 加载index.js\nimport pkg from \'my-package\';  // 加载index.js'
                        },
                        {
                            title: '默认值',
                            content: '如果不指定main字段，默认值是index.js。如果index.js不存在，会报错。'
                        },
                        {
                            title: '常见配置',
                            points: [
                                'main: "index.js" - 简单包',
                                'main: "dist/index.js" - 构建后的包',
                                'main: "lib/index.js" - 多目录组织',
                                'main: "src/index.js" - 源码直接暴露（不推荐）'
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
            title: '题目2：exports字段',
            content: {
                difficulty: 'easy',
                tags: ['exports', 'ES Modules'],
                question: 'package.json的exports字段相比main有什么优势？',
                options: [
                    '支持导出多个入口和条件导出',
                    '执行速度更快',
                    '包体积更小',
                    '向后兼容性更好'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'exports字段',
                    description: 'exports是Node.js 12+引入的新特性，提供了更强大的导出控制。',
                    sections: [
                        {
                            title: 'exports vs main',
                            points: [
                                'main：只能指定一个入口文件',
                                'exports：可以导出多个子路径',
                                'exports：支持条件导出（ESM/CJS）',
                                'exports：可以封装内部模块，提高封装性'
                            ]
                        },
                        {
                            title: '基础示例',
                            code: '// package.json\n{\n  "name": "my-package",\n  "exports": {\n    ".": "./index.js",           // 主入口\n    "./utils": "./lib/utils.js",  // 子路径\n    "./helpers/*": "./lib/helpers/*.js"  // 通配符\n  }\n}\n\n// 用户使用\nimport pkg from \'my-package\';         // index.js\nimport utils from \'my-package/utils\'; // lib/utils.js\nimport fn from \'my-package/helpers/foo\'; // lib/helpers/foo.js'
                        },
                        {
                            title: '条件导出',
                            code: '{\n  "exports": {\n    ".": {\n      "import": "./esm/index.js",  // ES Module\n      "require": "./cjs/index.js"  // CommonJS\n    }\n  }\n}'
                        }
                    ]
                },
                source: 'Node.js官方文档'
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：module字段',
            content: {
                difficulty: 'easy',
                tags: ['ES Modules', 'module'],
                question: 'package.json中module字段的作用是什么？',
                options: [
                    '指定模块类型（CommonJS或ES Module）',
                    '指定ES Module格式的入口文件',
                    '指定模块的依赖',
                    '指定模块的版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'module字段',
                    description: 'module字段指定ES Module格式的入口文件，被webpack等构建工具识别以支持Tree Shaking。',
                    sections: [
                        {
                            title: '双入口配置',
                            code: '// package.json\n{\n  "main": "dist/index.cjs.js",      // CommonJS\n  "module": "dist/index.esm.js"     // ES Module\n}\n\n// webpack会优先使用module字段，支持Tree Shaking\n// Node.js会使用main字段'
                        },
                        {
                            title: 'Tree Shaking',
                            content: 'Tree Shaking需要ES Module格式才能工作，因为：\n- ES Module是静态的，编译时可分析\n- CommonJS是动态的，运行时才能确定\n\n使用module字段，打包工具可以移除未使用的代码。'
                        },
                        {
                            title: '完整配置',
                            code: '{\n  "main": "dist/index.cjs.js",    // Node.js (CJS)\n  "module": "dist/index.esm.js",  // Bundlers (ESM)\n  "browser": "dist/index.umd.js", // Browser (UMD)\n  "types": "dist/index.d.ts"      // TypeScript\n}'
                        }
                    ]
                },
                source: 'Rollup/Webpack文档'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：package.json完整配置',
            content: {
                difficulty: 'medium',
                tags: ['package.json', '最佳实践', '多选题'],
                question: '一个优质npm包的package.json应该包含哪些字段？',
                options: [
                    'main、module、types用于不同模块系统',
                    'files字段明确指定要发布的文件',
                    'keywords、description提升搜索排名',
                    'repository、bugs、homepage方便用户反馈'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'package.json最佳实践',
                    description: '一个完善的package.json应该包含基础信息、入口配置、元数据和工具配置。',
                    sections: [
                        {
                            title: '完整示例',
                            code: '{\n  // 基础信息\n  "name": "@myorg/awesome-package",\n  "version": "1.0.0",\n  "description": "一个很棒的工具库",\n  "keywords": ["utility", "helper", "tools"],\n  "license": "MIT",\n  "author": "Your Name <you@example.com>",\n  \n  // 入口文件\n  "main": "dist/index.cjs.js",\n  "module": "dist/index.esm.js",\n  "types": "dist/index.d.ts",\n  "exports": {\n    ".": {\n      "import": "./dist/index.esm.js",\n      "require": "./dist/index.cjs.js",\n      "types": "./dist/index.d.ts"\n    }\n  },\n  \n  // 文件配置\n  "files": [\n    "dist",\n    "README.md",\n    "LICENSE"\n  ],\n  \n  // 仓库信息\n  "repository": {\n    "type": "git",\n    "url": "https://github.com/myorg/awesome-package"\n  },\n  "bugs": {\n    "url": "https://github.com/myorg/awesome-package/issues"\n  },\n  "homepage": "https://github.com/myorg/awesome-package#readme",\n  \n  // 脚本\n  "scripts": {\n    "build": "rollup -c",\n    "test": "jest",\n    "prepublishOnly": "npm test && npm run build"\n  },\n  \n  // 依赖\n  "peerDependencies": {\n    "react": ">=16.8.0"\n  },\n  "devDependencies": {\n    "rollup": "^3.0.0",\n    "typescript": "^5.0.0"\n  },\n  \n  // Node版本要求\n  "engines": {\n    "node": ">=14.0.0"\n  }\n}'
                        },
                        {
                            title: '字段优先级',
                            points: [
                                '必需：name、version',
                                '强烈推荐：description、keywords、license、repository',
                                '入口配置：main、module、types、exports',
                                '发布控制：files或.npmignore',
                                '脚本：test、build、prepublishOnly'
                            ]
                        }
                    ]
                },
                source: 'npm最佳实践'
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：sideEffects配置',
            content: {
                difficulty: 'medium',
                tags: ['Tree Shaking', 'sideEffects'],
                question: 'package.json的sideEffects字段用于什么？',
                options: [
                    '声明包是否有副作用，帮助Tree Shaking',
                    '配置包的依赖关系',
                    '指定包的执行效果',
                    '控制包的安装行为'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'sideEffects字段',
                    description: 'sideEffects告诉打包工具哪些文件有副作用，不能被安全移除。',
                    sections: [
                        {
                            title: '什么是副作用',
                            content: '副作用是指导入模块时会执行的代码，但不导出任何内容：',
                            code: '// 有副作用的代码\nimport \'./polyfills.js\';  // 修改全局对象\nimport \'./styles.css\';    // 注入样式\n\n// 无副作用的代码\nimport { add } from \'./math.js\';  // 只导入函数'
                        },
                        {
                            title: 'sideEffects配置',
                            code: '// 声明整个包无副作用（最激进的Tree Shaking）\n{\n  "sideEffects": false\n}\n\n// 指定哪些文件有副作用\n{\n  "sideEffects": [\n    "*.css",\n    "*.scss",\n    "./src/polyfills.js"\n  ]\n}'
                        },
                        {
                            title: '使用场景',
                            points: [
                                'UI组件库：通常sideEffects为false',
                                '工具库：大多数情况sideEffects为false',
                                '包含CSS的库：需要列出CSS文件',
                                '修改全局对象的库：需要列出相关文件'
                            ]
                        },
                        {
                            title: 'Tree Shaking效果',
                            code: '// lodash-es配置了sideEffects: false\nimport { debounce } from \'lodash-es\';\n\n// webpack只会打包debounce，其他未使用的函数被移除\n// 包体积从71KB减少到2KB'
                        }
                    ]
                },
                source: 'webpack官方文档'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：TypeScript支持',
            content: {
                difficulty: 'medium',
                tags: ['TypeScript', '类型定义'],
                question: '为npm包提供TypeScript类型定义的最佳方式是？',
                options: [
                    '在@types/下发布单独的包',
                    '在包中包含.d.ts文件并配置types字段',
                    '只提供TypeScript源码',
                    '不需要提供类型定义'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'TypeScript类型定义',
                    description: '内置类型定义是最佳实践，用户无需额外安装@types包。',
                    sections: [
                        {
                            title: '配置types字段',
                            code: '// package.json\n{\n  "name": "my-package",\n  "main": "dist/index.js",\n  "types": "dist/index.d.ts",  // 或 "typings"\n  "files": [\n    "dist"\n  ]\n}'
                        },
                        {
                            title: 'TypeScript项目结构',
                            code: 'my-package/\n├── src/\n│   └── index.ts\n├── dist/              # 构建输出\n│   ├── index.js       # JS代码\n│   └── index.d.ts     # 类型定义\n├── tsconfig.json\n└── package.json'
                        },
                        {
                            title: 'tsconfig.json配置',
                            code: '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext",\n    "declaration": true,        // 生成.d.ts\n    "declarationMap": true,     // 生成.d.ts.map\n    "outDir": "./dist",\n    "rootDir": "./src"\n  },\n  "include": ["src"],\n  "exclude": ["node_modules", "dist"]\n}'
                        },
                        {
                            title: 'exports字段类型配置',
                            code: '{\n  "exports": {\n    ".": {\n      "import": {\n        "types": "./dist/index.d.ts",\n        "default": "./dist/index.esm.js"\n      },\n      "require": {\n        "types": "./dist/index.d.ts",\n        "default": "./dist/index.cjs.js"\n      }\n    }\n  }\n}'
                        },
                        {
                            title: '@types包 vs 内置类型',
                            content: '@types包适用于：\n- 第三方包没有提供类型定义\n- 社区维护的类型定义\n\n内置类型（推荐）适用于：\n- 自己开发的包\n- 从TypeScript迁移的项目\n- 保证类型与代码同步更新'
                        }
                    ]
                },
                source: 'TypeScript官方文档'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目7：peerDependencies用法',
            content: {
                difficulty: 'medium',
                tags: ['peerDependencies', '依赖管理'],
                question: 'peerDependencies的主要用途是什么？',
                options: [
                    '声明包的开发依赖',
                    '声明需要宿主项目提供的依赖',
                    '声明可选的依赖',
                    '声明测试依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'peerDependencies详解',
                    description: 'peerDependencies用于声明插件或库需要宿主项目提供的依赖。',
                    sections: [
                        {
                            title: '使用场景',
                            points: [
                                'React组件库：需要用户提供React',
                                'Webpack插件：需要用户提供webpack',
                                'Babel插件：需要用户提供@babel/core',
                                'Vue插件：需要用户提供vue'
                            ]
                        },
                        {
                            title: '为什么需要peerDependencies',
                            content: '避免重复安装和版本冲突：',
                            code: '// ❌ 如果React组件库将React放在dependencies\nproject/\n└── node_modules/\n    ├── react@18.0.0          # 用户安装的\n    └── my-components/\n        └── node_modules/\n            └── react@17.0.0  # 组件库自带的\n// 问题：两个React实例，报错！\n\n// ✅ 使用peerDependencies\nproject/\n└── node_modules/\n    ├── react@18.0.0          # 共用\n    └── my-components/        # 不包含React'
                        },
                        {
                            title: '配置示例',
                            code: '// React组件库\n{\n  "name": "my-react-components",\n  "peerDependencies": {\n    "react": ">=16.8.0",\n    "react-dom": ">=16.8.0"\n  },\n  "devDependencies": {\n    "react": "^18.0.0",      // 开发时使用\n    "react-dom": "^18.0.0"\n  }\n}'
                        },
                        {
                            title: 'npm 7+的变化',
                            content: 'npm 7+会自动安装peerDependencies（如果未安装）\nnpm 6及之前只会警告，不会自动安装',
                            code: '# npm 6\nnpm WARN my-components@1.0.0 requires a peer of react@>=16.8.0\n\n# npm 7+\n自动安装react（如果项目中没有）'
                        },
                        {
                            title: 'peerDependenciesMeta',
                            code: '{\n  "peerDependencies": {\n    "react": ">=16.8.0",\n    "styled-components": ">=5.0.0"\n  },\n  "peerDependenciesMeta": {\n    "styled-components": {\n      "optional": true  // 可选的peer依赖\n    }\n  }\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：包体积优化',
            content: {
                difficulty: 'hard',
                tags: ['性能优化', '最佳实践', '多选题'],
                question: '如何优化npm包的体积？',
                options: [
                    '使用Rollup/esbuild打包并启用Tree Shaking',
                    '配置sideEffects: false支持更好的Tree Shaking',
                    '使用.npmignore或files字段只发布必要文件',
                    '压缩代码并提供多种格式（ESM/CJS/UMD）'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'npm包体积优化策略',
                    description: '通过多种手段减小包体积，提升用户体验和加载速度。',
                    sections: [
                        {
                            title: '1. 打包优化',
                            code: '// rollup.config.js\nexport default {\n  input: \'src/index.ts\',\n  output: [\n    {\n      file: \'dist/index.esm.js\',\n      format: \'esm\'\n    },\n    {\n      file: \'dist/index.cjs.js\',\n      format: \'cjs\'\n    },\n    {\n      file: \'dist/index.min.js\',\n      format: \'umd\',\n      name: \'MyLib\',\n      plugins: [terser()]  // 压缩\n    }\n  ],\n  external: [\'react\', \'lodash\'],  // 外部依赖不打包\n  plugins: [\n    typescript(),\n    nodeResolve(),\n    commonjs()\n  ]\n};'
                        },
                        {
                            title: '2. 只发布必要文件',
                            code: '// package.json\n{\n  "files": [\n    "dist",\n    "README.md",\n    "LICENSE"\n  ]\n}\n\n// 不发布：\n// - src/ 源码\n// - test/ 测试\n// - .github/ CI配置\n// - examples/ 示例\n// 可以节省50%+的体积'
                        },
                        {
                            title: '3. Tree Shaking配置',
                            code: '{\n  "sideEffects": false,\n  "module": "dist/index.esm.js"\n}\n\n// 用户只导入需要的部分\nimport { debounce } from \'my-utils\';\n// 只打包debounce相关代码'
                        },
                        {
                            title: '4. 依赖优化',
                            points: [
                                '避免重复依赖：检查bundle-phobia',
                                '使用peerDependencies：让用户提供公共依赖',
                                '按需导入：import { fn } from \'lodash-es\' 而非 import _ from \'lodash\'',
                                '考虑替代品：使用体积更小的库'
                            ]
                        },
                        {
                            title: '5. 分析工具',
                            code: '# 分析包体积\nnpx bundlephobia my-package\n\n# 查看包内容\nnpm pack && tar -tzf *.tgz\n\n# webpack bundle分析\nnpm install --save-dev webpack-bundle-analyzer'
                        },
                        {
                            title: '目标',
                            points: [
                                '小型工具库：< 10KB',
                                '组件库：< 50KB',
                                '框架：< 200KB',
                                '持续监控：使用size-limit设置体积上限'
                            ]
                        }
                    ]
                },
                source: 'npm最佳实践'
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：Dual Package问题',
            content: {
                difficulty: 'hard',
                tags: ['ES Modules', 'CommonJS'],
                question: '什么是Dual Package问题？',
                options: [
                    '同时发布ESM和CJS两种格式导致的问题',
                    '两个版本的包同时安装',
                    '包依赖冲突',
                    '包名重复'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'Dual Package Hazard',
                    description: '当包同时提供ESM和CJS格式时，可能导致模块被加载两次。',
                    sections: [
                        {
                            title: '问题场景',
                            code: '// my-package同时支持ESM和CJS\n// package.json\n{\n  "main": "dist/index.cjs.js",\n  "module": "dist/index.esm.js"\n}\n\n// app.js (ESM)\nimport pkg from \'my-package\';  // 加载 index.esm.js\nconst other = require(\'my-package\');  // 加载 index.cjs.js\n\n// 问题：pkg !== other\n// 单例模式会失效，状态不共享！'
                        },
                        {
                            title: '状态共享问题',
                            code: '// my-package/index.js\nlet count = 0;\nexport function increment() { count++; }\nexport function getCount() { return count; }\n\n// app.js\nimport { increment, getCount } from \'my-package\';  // ESM\nconst pkg = require(\'my-package\');  // CJS\n\nincrement();  // ESM的count++\nconsole.log(getCount());  // 1\nconsole.log(pkg.getCount());  // 0 (不同的模块实例！)'
                        },
                        {
                            title: '解决方案1：只发布一种格式',
                            code: '// 只发布ESM（推荐，未来趋势）\n{\n  "type": "module",\n  "exports": "./dist/index.js"\n}\n\n// 或只发布CJS（兼容性好）\n{\n  "main": "./dist/index.js"\n}'
                        },
                        {
                            title: '解决方案2：使用条件导出',
                            code: '{\n  "exports": {\n    "import": "./dist/index.esm.js",\n    "require": "./dist/index.cjs.js"\n  }\n}\n\n// Node.js会确保只加载一次\n// 但需要Node.js 12.20+支持'
                        },
                        {
                            title: '解决方案3：包装模式',
                            code: '// dist/index.cjs.js (CJS版本)\nconst esmModule = import(\'./index.esm.js\');\nmodule.exports = esmModule;\n\n// 确保两种导入方式都使用ESM版本'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '新项目：只发布ESM（type: "module"）',
                                '需兼容性：只发布CJS',
                                '必须双格式：使用条件导出 + 避免状态共享',
                                '文档说明：明确告知用户支持的格式'
                            ]
                        }
                    ]
                },
                source: 'Node.js官方文档'
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：包开发完整工作流',
            content: {
                difficulty: 'hard',
                tags: ['最佳实践', '工作流'],
                question: '一个标准的npm包开发和发布流程包括哪些步骤？',
                options: [
                    '开发 → 测试 → 构建 → 发布',
                    '开发 → 测试 → 构建 → 版本管理 → 发布 → 文档',
                    '开发 → 构建 → 发布',
                    '测试 → 构建 → 发布'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm包开发完整工作流',
                    description: '一个专业的npm包需要完善的开发、测试、构建、发布和维护流程。',
                    sections: [
                        {
                            title: '1. 项目初始化',
                            code: '# 创建项目\nmkdir my-package && cd my-package\nnpm init -y\n\n# 安装开发工具\nnpm install -D typescript rollup jest @types/jest\n\n# 配置TypeScript\ntsc --init\n\n# 配置Git\ngit init\necho "node_modules\\ndist" > .gitignore'
                        },
                        {
                            title: '2. 开发阶段',
                            code: '// 目录结构\nsrc/\n  index.ts          // 主入口\n  utils/\n    helpers.ts\ntest/\n  index.test.ts\nREADME.md\npackage.json\ntsconfig.json\nrollup.config.js\n\n// package.json scripts\n{\n  "scripts": {\n    "dev": "rollup -c -w",\n    "test": "jest",\n    "test:watch": "jest --watch",\n    "lint": "eslint src/",\n    "format": "prettier --write src/"\n  }\n}'
                        },
                        {
                            title: '3. 测试',
                            code: '// jest.config.js\nmodule.exports = {\n  preset: \'ts-jest\',\n  testEnvironment: \'node\',\n  collectCoverage: true,\n  coverageThreshold: {\n    global: {\n      branches: 80,\n      functions: 80,\n      lines: 80\n    }\n  }\n};\n\n// 运行测试\nnpm test'
                        },
                        {
                            title: '4. 构建',
                            code: '// rollup.config.js\nexport default {\n  input: \'src/index.ts\',\n  output: [\n    { file: \'dist/index.cjs.js\', format: \'cjs\' },\n    { file: \'dist/index.esm.js\', format: \'esm\' }\n  ],\n  plugins: [\n    typescript({ declaration: true, declarationDir: \'dist\' }),\n    terser()\n  ]\n};\n\n// package.json\n{\n  "scripts": {\n    "build": "rollup -c",\n    "prebuild": "rm -rf dist"\n  }\n}'
                        },
                        {
                            title: '5. 版本管理与发布',
                            code: '// package.json\n{\n  "scripts": {\n    "prepublishOnly": "npm test && npm run build",\n    "postpublish": "git push origin main --tags",\n    "release:patch": "npm version patch && npm publish",\n    "release:minor": "npm version minor && npm publish",\n    "release:major": "npm version major && npm publish"\n  }\n}\n\n// 发布流程\nnpm run release:patch\n# 自动：测试 → 构建 → 版本+1 → 发布 → 推送tag'
                        },
                        {
                            title: '6. 文档和维护',
                            points: [
                                'README.md：安装、使用、API文档',
                                'CHANGELOG.md：记录每个版本的变更',
                                'LICENSE：开源许可证',
                                'CONTRIBUTING.md：贡献指南',
                                'GitHub Actions：自动化测试和发布',
                                '语义化版本：遵循semver规范',
                                '及时响应：处理issues和PR'
                            ]
                        },
                        {
                            title: '7. 持续集成',
                            code: '// .github/workflows/ci.yml\nname: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n      - run: npm ci\n      - run: npm test\n      - run: npm run build'
                        }
                    ]
                },
                source: 'npm最佳实践'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第11章面试题：发布npm包',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=11'
        },
        next: {
            title: '第13章面试题：npm生命周期钩子',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=13'
        }
    }
};
