/**
 * 第6章：package.json详解 - 面试题
 * 10道精选面试题：测试对package.json字段、依赖类型、配置的理解
 */

window.content = {
    section: {
        title: '第6章：package.json详解 - 面试题',
        icon: '🔴'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：package.json必需字段',
            content: {
                difficulty: 'easy',
                question: '一个有效的package.json文件至少需要包含哪些字段？',
                options: [
                    'name和version',
                    'name、version和main',
                    'name、version和description',
                    'name、version和dependencies'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'package.json必需字段',
                    content: 'package.json最小有效配置只需要name和version两个字段：\n\n{"name": "my-package", "version": "1.0.0"}\n\nname命名规则：\n- 小于214个字符\n- 不能以.或_开头\n- 不能包含大写字母\n- 作用域包：@scope/name\n\nversion规则：\n- 必须符合SemVer规范\n- 格式：major.minor.patch\n\n虽然只需这两个字段，但实际项目通常包含description、main、scripts、dependencies等更多字段。'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：dependencies vs devDependencies',
            content: {
                difficulty: 'easy',
                question: 'dependencies和devDependencies的主要区别是什么？',
                options: [
                    'dependencies是开发依赖，devDependencies是生产依赖',
                    'dependencies是生产依赖，devDependencies是开发依赖',
                    '两者没有区别，只是组织方式不同',
                    'dependencies会被打包，devDependencies不会'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '依赖类型区分',
                    content: 'dependencies vs devDependencies：\n\ndependencies（生产依赖）：\n- 项目运行时必需的依赖\n- 会被npm install安装\n- 发布包时会传递安装\n- 示例：vue、react、lodash\n- 安装：npm install lodash\n\ndevDependencies（开发依赖）：\n- 仅开发时需要的依赖\n- npm install默认会安装\n- npm install --production不安装\n- 示例：webpack、eslint、jest\n- 安装：npm install --save-dev webpack\n\n别人安装你的包时，只安装dependencies'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：scripts脚本定义',
            content: {
                difficulty: 'easy',
                question: 'package.json中的scripts字段用于做什么？',
                options: [
                    '存储JavaScript代码',
                    '定义可执行的npm脚本命令',
                    '配置npm安装选项',
                    '声明依赖关系'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm scripts',
                    content: 'scripts字段定义npm脚本命令：\n\n{\n  "scripts": {\n    "start": "node server.js",\n    "build": "webpack",\n    "test": "jest"\n  }\n}\n\n运行方式：\nnpm run build\nnpm start（特殊命令无需run）\nnpm test（特殊命令无需run）\n\n优势：\n- 自动将node_modules/.bin添加到PATH\n- 可直接使用本地安装的命令\n- 支持pre/post钩子\n- 跨平台执行'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：peerDependencies作用',
            content: {
                difficulty: 'medium',
                question: 'peerDependencies的主要作用是什么？',
                options: [
                    '指定开发环境依赖',
                    '指定可选依赖',
                    '指定宿主项目需要安装的依赖版本',
                    '指定打包时排除的依赖'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'peerDependencies详解',
                    content: 'peerDependencies（同伴依赖）用于声明插件需要的宿主环境：\n\n示例（eslint插件）：\n{\n  "name": "eslint-plugin-react",\n  "peerDependencies": {\n    "eslint": "^7.0.0 || ^8.0.0",\n    "react": ">=16.8.0"\n  }\n}\n\n作用：\n- 避免依赖重复安装\n- 确保版本兼容性\n- 插件依赖宿主提供环境\n\nnpm行为：\n- npm 3-6：只警告，不自动安装\n- npm 7+：自动安装peerDependencies\n\n典型场景：Vue插件依赖vue、React组件库依赖react'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：bin字段作用',
            content: {
                difficulty: 'medium',
                question: 'package.json中的bin字段的作用是什么？',
                options: [
                    '指定二进制文件路径',
                    '配置发布时包含的文件',
                    '创建可执行命令，链接到node_modules/.bin',
                    '指定构建输出目录'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'bin字段创建CLI工具',
                    content: 'bin字段用于创建命令行工具：\n\n单个命令：\n{\n  "name": "my-cli",\n  "bin": "./cli.js"\n}\n命令名默认为包名：my-cli\n\n多个命令：\n{\n  "bin": {\n    "mycli": "./bin/cli.js",\n    "mycli-init": "./bin/init.js"\n  }\n}\n\n可执行文件要求：\n第一行必须是shebang：#!/usr/bin/env node\n\n安装效果：\n- 本地安装：链接到node_modules/.bin/\n- 全局安装：链接到全局bin目录，直接在终端使用\n\n实例：vue-cli、webpack-cli、create-react-app'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：main vs module',
            content: {
                difficulty: 'medium',
                question: 'package.json中main和module字段的区别是什么？',
                options: [
                    '没有区别，是同义词',
                    'main指定CommonJS入口，module指定ESM入口',
                    'main用于Node.js，module用于浏览器',
                    'main是必需的，module是可选的'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'main vs module字段',
                    content: '模块入口字段说明：\n\nmain：CommonJS入口\n- require()加载的文件\n- Node.js默认使用\n- 示例："main": "dist/index.js"\n\nmodule：ESM入口\n- import加载的文件\n- 打包工具（webpack/rollup）优先使用\n- 支持tree-shaking\n- 示例："module": "dist/index.esm.js"\n\nexports：现代化导出（优先级最高）\n{\n  "exports": {\n    "import": "./index.mjs",\n    "require": "./index.cjs"\n  }\n}\n\n打包工具解析优先级：\nexports > module > main'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：版本范围符号',
            content: {
                difficulty: 'medium',
                question: '执行npm install后会安装lodash的哪个版本？',
                code: `{
  "dependencies": {
    "lodash": "^4.17.20"
  }
}

// npm registry中的版本：
// 4.17.19, 4.17.20, 4.17.21, 5.0.0`,
                options: [
                    '4.17.20（精确匹配）',
                    '4.17.21（^允许minor和patch更新）',
                    '5.0.0（最新版本）',
                    '4.17.19（最接近的版本）'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '版本范围符号',
                    content: '^（caret）插入符版本范围：\n\n^4.17.20 匹配：\n- >=4.17.20 <5.0.0\n- 允许minor和patch更新\n- 不允许major更新\n\n所以会安装4.17.21（符合范围的最新版本）\n\n其他符号：\n~4.17.20：只允许patch更新（4.17.x）\n4.17.20：精确版本\n>=4.17.20 <5.0.0：范围\n*：任意版本\n\n注意：如果有package-lock.json，会按lock文件安装'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：exports字段优势',
            content: {
                difficulty: 'hard',
                question: 'package.json中的exports字段相比main字段有什么优势？',
                options: [
                    'exports是新语法，main已废弃',
                    'exports支持条件导出和子路径导出，提供更细粒度控制',
                    'exports只支持ESM，main只支持CommonJS',
                    'exports性能更好'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'exports现代化导出',
                    content: 'exports提供现代化的模块导出方案：\n\n条件导出：\n{\n  "exports": {\n    "import": "./index.mjs",\n    "require": "./index.cjs"\n  }\n}\n根据导入方式提供不同文件\n\n子路径导出：\n{\n  "exports": {\n    ".": "./index.js",\n    "./utils": "./src/utils.js"\n  }\n}\n控制可导入的路径\n\n多条件组合：\n{\n  "exports": {\n    ".": {\n      "types": "./index.d.ts",\n      "import": "./index.mjs",\n      "require": "./index.cjs"\n    }\n  }\n}\n\n优势：封装内部模块、支持双模式、TypeScript支持、更好的tree-shaking'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：engines字段作用',
            content: {
                difficulty: 'hard',
                question: 'package.json中的engines字段如何工作？',
                options: [
                    'engines字段只是建议，无法强制执行',
                    'npm会自动检查并拒绝安装不符合的版本',
                    'engines限制Node版本，需设置engine-strict=true才强制检查',
                    'engines只在npm publish时检查'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'engines版本限制',
                    content: 'engines字段指定运行环境版本要求：\n\n配置示例：\n{\n  "engines": {\n    "node": ">=16.0.0",\n    "npm": ">=8.0.0"\n  }\n}\n\n默认行为：\n- 只警告，不阻止安装\n\n强制执行：\nnpm config set engine-strict true\n或在.npmrc中：engine-strict=true\n\n版本不匹配时会报错并中止安装\n\n使用场景：\n- 确保团队使用相同Node版本\n- 避免API兼容性问题\n- 配合.nvmrc使用\n\n最佳实践：明确指定支持的版本范围'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：workspaces字段',
            content: {
                difficulty: 'hard',
                question: 'package.json中的workspaces字段用于做什么？',
                options: [
                    '指定项目的工作目录',
                    '配置monorepo多包管理，统一管理多个子包',
                    '设置npm的工作空间路径',
                    '配置项目的构建输出目录'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'workspaces多包管理',
                    content: 'workspaces实现monorepo架构：\n\n根package.json配置：\n{\n  "name": "my-monorepo",\n  "private": true,\n  "workspaces": ["packages/*"]\n}\n\n目录结构：\nmy-monorepo/\n├── package.json\n├── packages/\n│   ├── pkg-a/package.json\n│   └── pkg-b/package.json\n└── node_modules/\n\n优势：\n- 统一依赖管理\n- 共享node_modules\n- 自动链接本地包\n- 统一脚本执行\n\n命令：\nnpm install  # 安装所有包依赖\nnpm run test -w pkg-a  # 在pkg-a中执行\n\n注意：根package.json必须设置"private": true'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第5章面试题：npm安装与配置',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=05'
        },
        next: {
            title: '第7章面试题：npm常用命令',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=07'
        }
    }
};
