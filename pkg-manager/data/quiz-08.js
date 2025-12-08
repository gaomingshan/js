/**
 * 第8章：npm scripts脚本 - 面试题
 * 10道精选面试题：测试对npm scripts的掌握
 */

window.content = {
    section: {
        title: '第8章：npm scripts脚本 - 面试题',
        icon: '🔴'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm scripts定义',
            content: {
                difficulty: 'easy',
                question: 'npm scripts在package.json的哪个字段定义？',
                options: [
                    'commands',
                    'scripts',
                    'tasks',
                    'run'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm scripts基础',
                    content: 'scripts字段定义npm脚本：\n\n{\n  "scripts": {\n    "start": "node server.js",\n    "build": "webpack",\n    "test": "jest"\n  }\n}\n\n运行方式：\nnpm run build\nnpm start（无需run）\nnpm test（无需run）\n\n特殊脚本无需run前缀：start、stop、test、restart\n\n查看所有脚本：npm run\n\n优势：自动将node_modules/.bin添加到PATH，可直接使用本地命令'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：生命周期钩子',
            content: {
                difficulty: 'easy',
                question: '定义了"build"脚本后，npm会自动支持哪些钩子？',
                options: [
                    '只有prebuild',
                    '只有postbuild',
                    'prebuild和postbuild',
                    'prebuild、build、postbuild'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'pre/post钩子',
                    content: 'npm为每个脚本自动支持pre/post钩子：\n\n定义脚本"xxx"后，支持：\n- prexxx：在xxx之前执行\n- postxxx：在xxx之后执行\n\n示例：\n{\n  "scripts": {\n    "prebuild": "npm run clean",\n    "build": "webpack",\n    "postbuild": "npm run deploy"\n  }\n}\n\n执行npm run build时：\n1. prebuild（清理）\n2. build（构建）\n3. postbuild（部署）\n\n任何环节失败都会中断后续执行\n\n跳过钩子：npm run build --ignore-scripts'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：访问package.json字段',
            content: {
                difficulty: 'easy',
                question: '在npm scripts中如何访问package.json的name字段？',
                options: [
                    '$npm_package_name',
                    '%npm_package_name%',
                    '${package.name}',
                    '$package_name'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm环境变量',
                    content: 'npm scripts中的环境变量：\n\npackage.json字段（以npm_package_为前缀）：\n- $npm_package_name：包名\n- $npm_package_version：版本号\n- $npm_package_description：描述\n\n嵌套字段用下划线：\n- $npm_package_config_port\n- $npm_package_repository_url\n\n生命周期信息：\n- $npm_lifecycle_event：当前脚本名\n- $npm_lifecycle_script：脚本内容\n\nWindows兼容性：\nUnix: $npm_package_name\nWindows: %npm_package_name%\n跨平台：使用cross-var工具'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：串行与并行执行',
            content: {
                difficulty: 'medium',
                question: 'npm scripts中，&&和&符号的区别是什么？',
                options: [
                    '&&是并行执行，&是串行执行',
                    '&&是串行执行（顺序），&是并行执行',
                    '两者没有区别',
                    '&&在Windows下使用，&在Unix下使用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '执行控制符号',
                    content: 'scripts并行与串行：\n\n&&串行执行：\n"build": "npm run clean && npm run compile"\n- 顺序执行\n- 前一个失败则停止\n- 前一个成功才执行后一个\n\n&并行执行（Unix）：\n"dev": "npm run server & npm run client"\n- 同时启动\n- 互不等待\n- Windows不支持\n\n跨平台并行：\n使用npm-run-all或concurrently：\n"dev": "npm-run-all --parallel server client"\n"dev": "concurrently \\"npm run server\\" \\"npm run client\\""\n\n||或执行：\n"start": "npm run prod || npm run dev"\n前一个失败才执行后一个'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：cross-env作用',
            content: {
                difficulty: 'medium',
                question: '为什么需要cross-env工具？',
                options: [
                    '加快npm scripts执行速度',
                    '解决Windows和Unix设置环境变量语法不同的问题',
                    '自动安装缺失的依赖',
                    '提供跨版本兼容性'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'cross-env跨平台',
                    content: 'cross-env解决环境变量跨平台问题：\n\n问题：\nUnix/Mac: NODE_ENV=production node server.js\nWindows: set NODE_ENV=production && node server.js\n语法不兼容\n\n解决方案：\nnpm install --save-dev cross-env\n\n使用：\n{\n  "scripts": {\n    "build": "cross-env NODE_ENV=production webpack"\n  }\n}\n所有平台统一语法\n\n设置多个变量：\n"build": "cross-env NODE_ENV=production API_URL=xxx webpack"\n\n其他跨平台工具：\n- rimraf：删除文件（替代rm -rf）\n- copyfiles：复制文件\n- mkdirp：创建目录'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：参数传递',
            content: {
                difficulty: 'medium',
                question: '如何在npm scripts中正确传递参数？',
                options: [
                    'npm run build mode=production',
                    'npm run build --mode=production',
                    'npm run build -- --mode=production',
                    'npm run build -mode production'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '参数传递机制',
                    content: 'npm scripts参数传递使用--分隔符：\n\nnpm run build -- --mode=production\n\n--之前：npm的参数\n--之后：传给脚本的参数\n\n示例：\n{\n  "scripts": {\n    "build": "webpack"\n  }\n}\n\nnpm run build -- --mode=production --watch\n等同于：webpack --mode=production --watch\n\n在脚本中处理：\nconst args = process.argv.slice(2)\n// ["--mode=production", "--watch"]\n\n或使用工具：\nconst argv = require(\'minimist\')(process.argv.slice(2))\n// { mode: "production", watch: true }\n\n预定义参数（推荐）：\n"build:prod": "webpack --mode=production"'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：跨平台问题',
            content: {
                difficulty: 'medium',
                question: '以下scripts配置有什么问题？',
                code: `{
  "scripts": {
    "clean": "rm -rf dist",
    "build": "webpack"
  }
}`,
                options: [
                    '没有问题',
                    'rm -rf在Windows下不兼容',
                    'webpack命令错误',
                    'scripts字段格式错误'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'scripts跨平台最佳实践',
                    content: '问题：rm -rf是Unix命令，Windows不支持\n\n解决方案：\n安装rimraf：\nnpm install --save-dev rimraf\n\n修改配置：\n{\n  "scripts": {\n    "clean": "rimraf dist",\n    "build": "webpack"\n  }\n}\n\n跨平台工具：\n- rimraf：删除文件/目录\n- mkdirp：创建目录\n- copyfiles：复制文件\n- cross-env：环境变量\n- npm-run-all：并行/串行执行\n\n完整示例：\n{\n  "scripts": {\n    "clean": "rimraf dist",\n    "build": "cross-env NODE_ENV=production webpack",\n    "dev": "npm-run-all --parallel server watch"\n  }\n}'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：npm-run-all用法',
            content: {
                difficulty: 'hard',
                question: 'npm-run-all的--parallel和--serial参数分别用于什么？',
                options: [
                    '--parallel用于生产构建，--serial用于开发',
                    '--parallel并行执行多个任务，--serial串行执行',
                    '--parallel在多核CPU上运行，--serial在单核上运行',
                    '两者功能相同'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm-run-all任务编排',
                    content: 'npm-run-all高级用法：\n\n安装：\nnpm install --save-dev npm-run-all\n\n--parallel并行执行：\n{\n  "scripts": {\n    "server": "node server.js",\n    "watch": "webpack --watch",\n    "dev": "npm-run-all --parallel server watch"\n  }\n}\n同时启动server和watch\n\n--serial串行执行：\n{\n  "scripts": {\n    "ci": "npm-run-all --serial clean build test"\n  }\n}\n顺序执行：clean → build → test\n\n通配符模式：\n"build": "npm-run-all build:*"\n执行所有build:开头的脚本\n\n简写命令：\nrun-p：--parallel别名\nrun-s：--serial别名'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz',
            title: '题目9：脚本调试',
            content: {
                difficulty: 'hard',
                question: '如何调试npm scripts中的Node.js脚本？',
                options: [
                    'npm debug run script',
                    'npm run script --debug',
                    'node --inspect $(npm bin)/script',
                    '在script定义中添加node --inspect'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'scripts调试技巧',
                    content: 'Node.js脚本调试方法：\n\n方法1：定义debug脚本\n{\n  "scripts": {\n    "debug": "node --inspect-brk server.js",\n    "start": "node server.js"\n  }\n}\nnpm run debug\n然后在Chrome打开chrome://inspect\n\n方法2：调试webpack\n{\n  "scripts": {\n    "debug:build": "node --inspect-brk node_modules/.bin/webpack"\n  }\n}\n\n查看执行命令：\nnpm run build --loglevel verbose\n\n脚本执行跟踪：\n{\n  "scripts": {\n    "prebuild": "echo [prebuild] Cleaning...",\n    "build": "echo [build] Building... && webpack"\n  }\n}\n\nVSCode调试配置：\n{\n  "type": "node",\n  "runtimeExecutable": "npm",\n  "runtimeArgs": ["run", "build"]\n}'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：scripts最佳实践',
            content: {
                difficulty: 'hard',
                question: '关于npm scripts最佳实践，以下哪些是正确的？',
                options: [
                    '使用跨平台工具确保兼容性',
                    '复杂流程应拆分为多个小脚本',
                    'pre/post钩子可以无限嵌套',
                    '以上都正确'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'scripts最佳实践',
                    content: 'npm scripts开发指南：\n\n1. 跨平台兼容\n使用工具：rimraf、cross-env、copyfiles、mkdirp\n避免：rm -rf、export/set、cp -r\n\n2. 脚本组织\n单一职责：每个脚本职责单一\n命名空间：build:js、build:css、test:unit、test:e2e\n组合脚本：dev、ci组合多个步骤\n\n示例：\n{\n  "clean": "rimraf dist",\n  "build:js": "webpack",\n  "build:css": "sass src:dist",\n  "build": "npm-run-all clean --parallel build:*",\n  "test:unit": "jest",\n  "test:e2e": "cypress",\n  "test": "npm-run-all test:*"\n}\n\n3. 钩子限制\n只有一层pre/post，不支持pre-prebuild\n\n4. 错误处理\n添加日志和错误提示'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第7章面试题：npm常用命令',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=07'
        },
        next: {
            title: '第9章面试题：依赖版本管理',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=09'
        }
    }
};
