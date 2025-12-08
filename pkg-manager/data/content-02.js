/**
 * 第2章：模块化与依赖管理
 * 深入理解CommonJS、ES Modules、依赖树和semver版本管理
 */

window.content = {
    section: {
        title: '第2章：模块化与依赖管理',
        icon: '🔗'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'JavaScript模块化系统',
            content: {
                description: '模块化是将复杂程序拆分成独立、可复用的模块的编程思想。JavaScript经历了从无模块化到CommonJS、AMD、UMD，再到ES Modules的演进过程。',
                keyPoints: [
                    'CommonJS：Node.js采用的模块规范，同步加载，使用require/module.exports',
                    'ES Modules：ECMAScript官方标准，支持静态分析，使用import/export',
                    '模块作用域：每个模块有独立作用域，避免全局污染',
                    '依赖声明：通过import/require明确声明依赖关系',
                    '循环依赖：CommonJS和ESM处理循环依赖的机制不同'
                ],
                mdn: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules'
            }
        },
        
        {
            type: 'code-example',
            title: 'CommonJS vs ES Modules',
            content: {
                description: 'CommonJS和ES Modules是两种最主流的JavaScript模块系统，各有特点和适用场景。',
                examples: [
                    {
                        title: 'CommonJS 语法',
                        code: `// 导出
module.exports = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b
};

// 或使用 exports
exports.subtract = (a, b) => a - b;

// 导入
const math = require('./math');
const { add } = require('./math');

// 动态导入
const moduleName = './utils';
const utils = require(moduleName);`,
                        notes: 'CommonJS是同步加载，适合服务端，Node.js默认使用'
                    },
                    {
                        title: 'ES Modules 语法',
                        code: `// 导出（命名导出）
export const add = (a, b) => a + b;
export function multiply(a, b) {
  return a * b;
}

// 默认导出
export default class Calculator {
  // ...
}

// 导入
import Calculator from './calculator.js';
import { add, multiply } from './math.js';
import * as math from './math.js';

// 动态导入
const module = await import('./utils.js');`,
                        notes: 'ESM支持静态分析，可以tree-shaking，现代浏览器和Node.js都支持'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'CommonJS vs ES Modules 对比',
            content: {
                description: '两种模块系统在加载机制、语法、性能等方面存在显著差异，理解这些差异有助于正确选择和使用。',
                items: [
                    {
                        name: 'CommonJS',
                        pros: [
                            '同步加载，代码简单直观',
                            'Node.js原生支持，生态成熟',
                            '可以动态require，灵活性高',
                            '导出的是值的拷贝，使用简单'
                        ],
                        cons: [
                            '无法静态分析，不支持tree-shaking',
                            '同步加载不适合浏览器环境',
                            '循环依赖处理复杂',
                            '不是JavaScript标准'
                        ]
                    },
                    {
                        name: 'ES Modules',
                        pros: [
                            'JavaScript官方标准',
                            '支持静态分析和tree-shaking',
                            '异步加载，适合浏览器',
                            '导出的是值的引用，更合理'
                        ],
                        cons: [
                            '不支持动态路径（需要使用import()）',
                            'Node.js需要配置或使用.mjs扩展名',
                            '浏览器兼容性需要考虑',
                            '学习曲线相对陡峭'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'concept',
            title: '依赖树与依赖图',
            content: {
                description: '依赖树（Dependency Tree）描述了包之间的依赖关系，包管理器通过构建依赖图来确定需要安装哪些包以及它们的版本。',
                keyPoints: [
                    '直接依赖：package.json中声明的dependencies和devDependencies',
                    '间接依赖：直接依赖所依赖的包（传递依赖）',
                    '依赖深度：从项目根到某个包的最短路径长度',
                    '依赖冲突：同一个包的不同版本在依赖树中出现',
                    '依赖提升：将间接依赖提升到顶层，减少重复安装'
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖地狱问题',
            content: {
                description: '依赖地狱（Dependency Hell）是指当项目依赖的包越来越多，版本冲突和依赖关系变得极其复杂，导致项目难以维护的情况。',
                mechanism: '早期npm使用嵌套安装，每个包的依赖都安装在自己的node_modules下，导致目录层级深、重复安装。npm 3+改用扁平化安装，但引入了幽灵依赖问题。',
                keyPoints: [
                    '嵌套地狱：npm 2.x时代，依赖层级可达数十层',
                    '重复安装：同一个包的相同版本被安装多次',
                    '版本冲突：A依赖B@1.0，C依赖B@2.0，无法同时满足',
                    '幽灵依赖：可以访问未在package.json中声明的依赖',
                    '磁盘空间：node_modules可能占用数GB空间',
                    '解决方案：pnpm的严格依赖、Yarn的resolutions、npm的overrides'
                ]
            }
        },
        
        {
            type: 'concept',
            title: 'semver语义化版本',
            content: {
                description: 'semver（Semantic Versioning）是一种版本号命名规范，格式为 MAJOR.MINOR.PATCH，帮助开发者理解版本变更的影响范围。',
                keyPoints: [
                    'MAJOR：主版本号，不兼容的API变更',
                    'MINOR：次版本号，向下兼容的功能新增',
                    'PATCH：修订号，向下兼容的问题修正',
                    '先行版本：1.0.0-alpha, 1.0.0-beta, 1.0.0-rc.1',
                    '版本优先级：1.0.0 < 1.0.1 < 1.1.0 < 2.0.0',
                    '版本范围：^1.2.3表示>=1.2.3且<2.0.0'
                ],
                mdn: 'https://semver.org/lang/zh-CN/'
            }
        },
        
        {
            type: 'code-example',
            title: 'semver版本范围表达式',
            content: {
                description: 'package.json中可以使用各种符号来指定依赖包的版本范围，理解这些符号对于依赖管理至关重要。',
                examples: [
                    {
                        title: '精确版本',
                        code: `{
  "dependencies": {
    "lodash": "4.17.21"
  }
}`,
                        notes: '只安装指定的版本，最安全但失去自动更新'
                    },
                    {
                        title: '波浪号 ~ (Tilde)',
                        code: `{
  "dependencies": {
    "lodash": "~4.17.21"
  }
}`,
                        notes: '允许PATCH版本更新：>=4.17.21 <4.18.0'
                    },
                    {
                        title: '插入号 ^ (Caret)',
                        code: `{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}`,
                        notes: '允许MINOR和PATCH更新：>=4.17.21 <5.0.0（npm默认）'
                    },
                    {
                        title: '版本范围',
                        code: `{
  "dependencies": {
    "lodash": ">=4.17.0 <5.0.0",
    "react": ">16.8.0 <=18.0.0"
  }
}`,
                        notes: '使用比较运算符指定更灵活的范围'
                    },
                    {
                        title: '通配符',
                        code: `{
  "dependencies": {
    "lodash": "4.17.x",
    "react": "4.*"
  }
}`,
                        notes: 'x或*表示任意版本，不推荐在生产环境使用'
                    },
                    {
                        title: 'latest 和 next',
                        code: `{
  "dependencies": {
    "lodash": "latest",
    "react": "next"
  }
}`,
                        notes: 'latest=最新稳定版，next=下一个版本（可能不稳定）'
                    }
                ]
            }
        },
        
        {
            type: 'concept',
            title: '依赖类型',
            content: {
                description: 'package.json支持多种依赖类型，每种类型有不同的用途和安装时机，正确使用可以优化项目结构。',
                keyPoints: [
                    'dependencies：生产环境依赖，npm install会安装',
                    'devDependencies：开发环境依赖，npm install --production不安装',
                    'peerDependencies：宿主依赖，要求使用者安装指定版本',
                    'optionalDependencies：可选依赖，安装失败不影响整体',
                    'bundledDependencies：打包依赖，npm pack时会包含',
                    'engines：指定Node.js和npm版本要求'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'package.json依赖配置示例',
            content: {
                description: '一个典型的package.json文件包含了多种依赖配置，理解每种配置的作用有助于项目管理。',
                examples: [
                    {
                        title: '完整的依赖配置',
                        code: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "webpack": "^5.75.0",
    "eslint": "^8.30.0",
    "@types/react": "^18.0.26"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}`,
                        notes: '生产依赖、开发依赖、宿主依赖、可选依赖、引擎要求的完整配置'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '锁文件的作用',
            content: {
                description: '锁文件（package-lock.json、yarn.lock、pnpm-lock.yaml）记录了依赖树的确切版本，确保团队成员和CI/CD环境安装相同的依赖。',
                mechanism: '首次安装时，包管理器解析package.json中的版本范围，从registry下载符合条件的最新版本，并将确切版本写入锁文件。后续安装时优先读取锁文件，保证一致性。',
                keyPoints: [
                    '版本锁定：记录每个包的确切版本号',
                    '完整性校验：包含包的SHA校验值，防止篡改',
                    '依赖树结构：记录完整的依赖关系树',
                    '源地址：记录包的下载地址',
                    '必须提交：锁文件应该提交到Git仓库',
                    '冲突解决：团队协作时可能需要手动解决锁文件冲突',
                    '定期更新：使用npm update或yarn upgrade更新依赖和锁文件'
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '依赖管理最佳实践',
            content: {
                description: '良好的依赖管理习惯可以避免很多问题，提高项目的稳定性和可维护性。',
                keyPoints: [
                    '精确版本：关键依赖使用精确版本，避免意外更新',
                    '定期更新：每月检查依赖更新，及时修复安全漏洞',
                    '锁文件提交：将package-lock.json提交到版本控制',
                    '最小化依赖：仅安装必要的包，减少攻击面',
                    '审查依赖：使用npm audit检查安全漏洞',
                    '避免全局安装：优先使用npx或项目本地依赖',
                    '文档说明：在README中说明Node.js和npm版本要求',
                    'monorepo管理：大型项目考虑使用workspaces'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第1章：包管理器简介与发展史',
            url: './render.html?subject=pkg-manager&type=content&chapter=01'
        },
        next: {
            title: '第3章：包管理器工作原理',
            url: './render.html?subject=pkg-manager&type=content&chapter=03'
        }
    }
};
