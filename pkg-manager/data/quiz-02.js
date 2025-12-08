/**
 * 第2章：模块化与依赖管理 - 面试题
 * 10道精选面试题：测试对JavaScript模块化和依赖管理的理解
 */

window.content = {
    section: {
        title: '第2章：模块化与依赖管理 - 面试题',
        icon: '💡'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：CommonJS模块系统',
            content: {
                difficulty: 'easy',
                question: 'Node.js默认使用哪种模块系统？',
                options: [
                    'AMD',
                    'CommonJS',
                    'UMD',
                    'SystemJS'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'CommonJS',
                    content: 'Node.js默认使用CommonJS模块系统：\n\n导出：\nmodule.exports = { ... }\nexports.name = value\n\n导入：\nconst module = require(\'./module\')\n\n特点：\n- 同步加载\n- 运行时加载\n- 值的拷贝\n- 主要用于服务端'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：ES Modules特点',
            content: {
                difficulty: 'easy',
                question: 'ES Modules（ESM）相比CommonJS的主要优势是什么？',
                options: [
                    '只是语法不同',
                    '静态分析、Tree Shaking、异步加载',
                    '完全没有区别',
                    '只能在浏览器使用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'ES Modules优势',
                    content: 'ESM的核心优势：\n\n1. 静态分析\n   - 编译时确定依赖\n   - 支持Tree Shaking\n\n2. 异步加载\n   - import()动态导入\n   - 代码分割\n\n3. 值的引用\n   - export绑定\n   - 支持循环依赖\n\n4. 标准化\n   - 浏览器原生支持\n   - Node.js支持（.mjs或"type":"module"）\n\n语法：\nimport { name } from \'./module.js\'\nexport const value = 1'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：依赖类型',
            content: {
                difficulty: 'easy',
                question: 'package.json中dependencies和devDependencies的区别是什么？',
                options: [
                    '没有区别，可以随便放',
                    'dependencies是生产依赖，devDependencies是开发依赖',
                    'devDependencies更重要',
                    '只是名字不同'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '依赖类型',
                    content: '依赖分类：\n\n1. dependencies（生产依赖）\n   - 运行时需要\n   - npm install时安装\n   - 发布包时包含\n   示例：react, lodash, axios\n\n2. devDependencies（开发依赖）\n   - 开发和构建时需要\n   - npm install --production不安装\n   - 发布包时不包含\n   示例：webpack, eslint, jest\n\n3. peerDependencies（同伴依赖）\n   - 要求宿主提供\n   示例：React组件库要求react\n\n4. optionalDependencies（可选依赖）\n   - 安装失败不影响'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：循环依赖问题',
            content: {
                difficulty: 'medium',
                question: '以下CommonJS循环依赖会输出什么？',
                code: `// a.js
exports.done = false;
const b = require('./b.js');
console.log('在 a.js 中，b.done =', b.done);
exports.done = true;

// b.js
exports.done = false;
const a = require('./a.js');
console.log('在 b.js 中，a.done =', a.done);
exports.done = true;

// main.js
const a = require('./a.js');
const b = require('./b.js');
console.log('main: a.done =', a.done, 'b.done =', b.done);`,
                options: [
                    '报错：不支持循环依赖',
                    'b中a.done=false，a中b.done=true，main中都是true',
                    '所有都是undefined',
                    '完全随机'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'CommonJS循环依赖',
                    content: 'CommonJS循环依赖执行流程：\n\n1. main.js加载a.js\n2. a.js设置done=false\n3. a.js加载b.js\n4. b.js设置done=false\n5. b.js加载a.js（缓存，返回未完成的exports）\n6. b.js中a.done=false\n7. b.js完成，done=true\n8. a.js中b.done=true\n9. a.js完成，done=true\n10. main.js中都是true\n\n输出：\n在 b.js 中，a.done = false\n在 a.js 中，b.done = true\nmain: a.done = true b.done = true\n\n关键：require返回当前exports状态'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：语义化版本SemVer',
            content: {
                difficulty: 'medium',
                question: '版本号1.2.3中，1、2、3分别代表什么？',
                options: [
                    '年、月、日',
                    'major、minor、patch',
                    '随机数字',
                    '开发者喜好'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '语义化版本（SemVer）',
                    content: 'SemVer格式：major.minor.patch\n\n1. major（主版本号）\n   - 不兼容的API变更\n   - 示例：1.0.0 → 2.0.0\n\n2. minor（次版本号）\n   - 向后兼容的功能新增\n   - 示例：1.1.0 → 1.2.0\n\n3. patch（修订号）\n   - 向后兼容的bug修复\n   - 示例：1.2.0 → 1.2.1\n\n版本范围：\n- ^1.2.3：>=1.2.3 <2.0.0\n- ~1.2.3：>=1.2.3 <1.3.0\n- 1.2.x：1.2.0到1.2.任意\n- *：任意版本\n\n原则：\n- 0.x.x：初始开发，不稳定\n- 1.0.0：第一个稳定版本'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：依赖解析算法',
            content: {
                difficulty: 'medium',
                question: 'npm是如何解析依赖版本冲突的？',
                options: [
                    '总是使用最新版本',
                    '扁平化提升，冲突时嵌套安装',
                    '随机选择一个版本',
                    '报错让用户选择'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm依赖解析',
                    content: 'npm v3+依赖解析策略：\n\n1. 扁平化（Hoisting）\n   - 尽可能提升到根node_modules\n   - 减少重复和嵌套深度\n\n2. 版本冲突处理\n   - 第一个版本提升到根\n   - 冲突版本嵌套安装\n\n示例：\nA依赖C@1.0.0\nB依赖C@2.0.0\n\n结果：\nnode_modules/\n├── C@1.0.0  (第一个，提升)\n├── A/\n└── B/\n    └── node_modules/\n        └── C@2.0.0  (冲突，嵌套)\n\n问题：\n- 安装顺序影响结构\n- 可能产生幽灵依赖\n\npnpm解决方案：\n- 严格隔离\n- 符号链接'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：Tree Shaking原理',
            content: {
                difficulty: 'medium',
                question: '为什么CommonJS不支持Tree Shaking？',
                code: `// CommonJS
const utils = require('./utils');
utils.used();

// ES Modules
import { used } from './utils';
used();`,
                options: [
                    'CommonJS更老，功能少',
                    'CommonJS是动态加载，无法静态分析',
                    'Tree Shaking只是个噱头',
                    '两者都支持Tree Shaking'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Tree Shaking原理',
                    content: 'Tree Shaking需要静态分析：\n\nCommonJS问题：\n```js\n// 动态require\nconst lib = require(isDev ? \'./dev\' : \'./prod\');\n\n// 动态exports\nif (condition) {\n  module.exports = funcA;\n} else {\n  module.exports = funcB;\n}\n```\n无法编译时确定导入导出\n\nESM优势：\n```js\n// 静态import\nimport { func } from \'./module\';\n\n// 静态export\nexport const value = 1;\n```\n编译时确定，可以分析未使用代码\n\nTree Shaking条件：\n1. ES Modules\n2. 生产模式\n3. 副作用标记（sideEffects: false）\n4. 纯函数\n\nWebpack/Rollup实现：\n- 标记未使用导出\n- Terser删除死代码'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：Monorepo依赖管理',
            content: {
                difficulty: 'hard',
                question: 'Monorepo中如何管理内部包的依赖关系？',
                options: [
                    '使用npm link手动链接',
                    '使用workspace协议自动链接',
                    '发布到npm再安装',
                    '复制粘贴代码'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Monorepo依赖管理',
                    content: 'Workspace协议管理内部依赖：\n\n1. 配置workspace\n```json\n// pnpm-workspace.yaml\npackages:\n  - \'packages/*\'\n  - \'apps/*\'\n```\n\n2. 声明workspace依赖\n```json\n// packages/ui/package.json\n{\n  "dependencies": {\n    "@my/utils": "workspace:^"\n  }\n}\n```\n\n3. workspace协议\n- workspace:* : 任意版本\n- workspace:^ : 兼容版本（推荐）\n- workspace:~ : 近似版本\n\n4. 自动链接\n- pnpm install自动链接\n- 支持热更新\n- 类型定义同步\n\n5. 发布时转换\n- workspace:^ → ^1.0.0\n- 自动替换为真实版本\n\n优势：\n- 开发便捷\n- 版本同步\n- 类型安全'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz-code',
            title: '题目9：动态导入与代码分割',
            content: {
                difficulty: 'hard',
                question: '动态import()如何实现代码分割？',
                code: `// 路由懒加载
const Home = () => import('./views/Home.vue');
const About = () => import('./views/About.vue');

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];`,
                options: [
                    'import()只是语法糖，没有实际作用',
                    'import()返回Promise，Webpack/Vite自动分割chunk',
                    '需要手动配置才能分割',
                    '只在生产环境有效'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '动态导入与代码分割',
                    content: 'import()工作原理：\n\n1. 返回Promise\n```js\nimport(\'./module.js\')\n  .then(module => {\n    module.func();\n  });\n```\n\n2. Webpack处理\n- 自动分割独立chunk\n- 生成异步加载代码\n- 运行时按需加载\n\n构建输出：\n```\ndist/\n├── main.js\n├── 0.chunk.js  (Home)\n└── 1.chunk.js  (About)\n```\n\n3. 魔法注释\n```js\nimport(\n  /* webpackChunkName: "home" */\n  /* webpackPrefetch: true */\n  \'./Home.vue\'\n);\n```\n\n4. 优势\n- 首屏加载快\n- 按需加载\n- 并行下载\n- 缓存友好\n\n5. 最佳实践\n- 路由懒加载\n- 大组件懒加载\n- 第三方库按需'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：依赖提升的副作用',
            content: {
                difficulty: 'hard',
                question: '幽灵依赖（Phantom Dependencies）是如何产生的？',
                options: [
                    '包管理器的bug',
                    '扁平化提升使未声明依赖可访问',
                    '网络问题导致',
                    '版本冲突导致'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '幽灵依赖问题',
                    content: '幽灵依赖产生机制：\n\n1. 扁平化提升\n```\n你的项目依赖：express\nexpress依赖：body-parser\n\nnode_modules/\n├── express/\n└── body-parser/  ← 被提升\n```\n\n2. 幽灵依赖\n```js\n// 你的代码\nconst bodyParser = require(\'body-parser\');\n// ✅ 成功！但package.json未声明\n```\n\n3. 风险\n- express升级不再依赖body-parser\n- 你的代码崩溃\n- 难以追踪问题\n\n4. 检测方法\n- 使用pnpm（严格隔离）\n- depcheck工具\n- ESLint规则\n\n5. 解决方案\n```json\n{\n  "dependencies": {\n    "express": "^4.18.0",\n    "body-parser": "^1.20.0"  // 显式声明\n  }\n}\n```\n\npnpm方案：\n- 符号链接严格隔离\n- 只能访问声明的依赖\n- 彻底解决幽灵依赖'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第1章面试题：包管理器简介与发展史',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=01'
        },
        next: {
            title: '第3章面试题：包管理器工作原理',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=03'
        }
    }
};
