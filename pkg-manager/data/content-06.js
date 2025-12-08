/**
 * 第6章：package.json详解
 * 深入理解package.json的必需字段、依赖类型、scripts、bin、exports等核心配置
 */

window.content = {
    section: {
        title: '第6章：package.json详解',
        icon: '📋'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'package.json的作用',
            content: {
                description: 'package.json是Node.js项目的核心配置文件，定义了项目的元数据、依赖关系、脚本命令等所有重要信息。',
                keyPoints: [
                    '项目描述：名称、版本、描述、作者等元信息',
                    '依赖管理：声明项目所需的依赖包及版本',
                    '脚本定义：定义npm scripts命令',
                    '入口文件：指定模块的入口文件',
                    '发布配置：控制哪些文件发布到npm',
                    '引擎要求：指定Node.js和npm版本要求',
                    '自动生成：npm init可自动生成基础结构'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/configuring-npm/package-json'
            }
        },
        
        {
            type: 'code-example',
            title: '创建package.json',
            content: {
                description: '创建package.json有多种方式，可以交互式创建或使用默认值快速创建。',
                examples: [
                    {
                        title: '交互式创建',
                        code: `# 逐步回答问题创建
npm init

# 示例交互：
# package name: (my-project)
# version: (1.0.0)
# description: My awesome project
# entry point: (index.js)
# test command:
# git repository:
# keywords: javascript, node
# author: Your Name
# license: (ISC) MIT`,
                        notes: '适合新项目，可以仔细配置每个字段'
                    },
                    {
                        title: '使用默认值快速创建',
                        code: `# 跳过所有问题，使用默认值
npm init -y
# 或
npm init --yes

# 生成的package.json：
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}`,
                        notes: '快速创建，后续可以手动修改'
                    },
                    {
                        title: '使用初始化工具',
                        code: `# 使用create-react-app
npx create-react-app my-app

# 使用vite
npm create vite@latest my-vue-app -- --template vue

# 使用express-generator
npx express-generator my-express-app

# 这些工具会自动生成完整的package.json`,
                        notes: '框架脚手架自动生成完整配置'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'package.json必需字段',
            content: {
                description: 'package.json只有两个字段是必需的：name和version，但实际项目中通常需要更多字段。',
                mechanism: 'name和version共同构成包的唯一标识符。name是包名，version遵循semver规范。这两个字段决定了包在npm registry中的位置。',
                keyPoints: [
                    'name：包名，必须唯一（发布时），小写，无空格',
                    'version：版本号，遵循semver规范（x.y.z）',
                    '作用域包：@scope/package-name格式可避免命名冲突',
                    '私有包：设置"private": true防止意外发布',
                    'name规则：可包含连字符、下划线，不超过214字符',
                    'version规则：主版本.次版本.修订号'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'package.json完整字段示例',
            content: {
                description: '一个完整的package.json包含了项目的所有配置信息，理解每个字段的作用很重要。',
                examples: [
                    {
                        title: '完整的package.json示例',
                        code: `{
  "name": "@company/my-package",
  "version": "1.0.0",
  "description": "My awesome package",
  "keywords": ["javascript", "utility"],
  "homepage": "https://github.com/user/repo#readme",
  "bugs": {
    "url": "https://github.com/user/repo/issues",
    "email": "bugs@example.com"
  },
  "license": "MIT",
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://yourwebsite.com"
  },
  "contributors": [
    {
      "name": "Contributor Name",
      "email": "contributor@example.com"
    }
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-cli": "./bin/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "jest",
    "lint": "eslint src"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.3.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "private": false
}`,
                        notes: '涵盖了package.json的主要字段'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '入口文件配置',
            content: {
                description: 'package.json可以配置多个入口文件，支持CommonJS、ES Module、TypeScript等不同模块系统。',
                mechanism: 'Node.js和打包工具根据入口字段决定加载哪个文件。main是CommonJS入口，module是ESM入口，types是TypeScript类型定义入口。',
                keyPoints: [
                    'main：CommonJS模块入口，require()加载',
                    'module：ES Module入口，import加载，支持tree-shaking',
                    'types/typings：TypeScript类型定义文件入口',
                    'browser：浏览器环境入口，优先于main',
                    'exports：Node.js 12+，更精细的导出控制',
                    'bin：可执行文件，全局安装后可在命令行使用'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'exports字段详解',
            content: {
                description: 'exports字段是Node.js 12+引入的新特性，提供了更强大和灵活的模块导出控制。',
                examples: [
                    {
                        title: '基本exports配置',
                        code: `{
  "name": "my-package",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}

// 使用方式：
import pkg from 'my-package';        // 加载 ./dist/index.mjs
const pkg = require('my-package');  // 加载 ./dist/index.cjs
import { util } from 'my-package/utils';  // 加载 ./dist/utils.mjs`,
                        notes: 'exports支持条件导出，精确控制模块入口'
                    },
                    {
                        title: '复杂exports配置',
                        code: `{
  "exports": {
    ".": {
      "node": {
        "import": "./dist/node.mjs",
        "require": "./dist/node.cjs"
      },
      "browser": {
        "import": "./dist/browser.mjs"
      },
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json",
    "./style.css": "./dist/style.css"
  }
}`,
                        notes: '根据运行环境导出不同文件'
                    },
                    {
                        title: 'exports通配符',
                        code: `{
  "exports": {
    ".": "./dist/index.js",
    "./components/*": "./dist/components/*.js",
    "./utils/*": {
      "import": "./dist/utils/*.mjs",
      "require": "./dist/utils/*.cjs"
    }
  }
}

// 使用方式：
import Button from 'my-package/components/Button';
import { format } from 'my-package/utils/string';`,
                        notes: '使用通配符支持子路径导出'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖类型详解',
            content: {
                description: 'package.json支持多种依赖类型，每种类型有不同的安装和使用场景。',
                mechanism: '包管理器根据依赖类型决定何时安装、是否必需。dependencies在任何环境都会安装，devDependencies只在开发环境安装，peerDependencies要求宿主提供。',
                keyPoints: [
                    'dependencies：生产环境依赖，必需安装',
                    'devDependencies：开发依赖，生产环境不安装',
                    'peerDependencies：宿主依赖，要求使用者安装',
                    'optionalDependencies：可选依赖，安装失败不报错',
                    'bundledDependencies：打包依赖，发布时一起打包',
                    'overrides/resolutions：强制指定某个依赖的版本'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '依赖类型使用示例',
            content: {
                description: '不同类型的依赖适用于不同场景，正确使用可以优化包大小和安装速度。',
                examples: [
                    {
                        title: 'dependencies vs devDependencies',
                        code: `{
  "dependencies": {
    "express": "^4.18.0",      // 运行时需要
    "lodash": "^4.17.21",      // 运行时需要
    "react": "^18.2.0"         // 运行时需要
  },
  "devDependencies": {
    "webpack": "^5.75.0",      // 构建工具
    "eslint": "^8.30.0",       // 代码检查
    "jest": "^29.3.0",         // 测试框架
    "@types/react": "^18.0.0"  // TypeScript类型定义
  }
}

# 安装所有依赖
npm install

# 只安装dependencies（生产环境）
npm install --production
npm install --omit=dev`,
                        notes: '开发工具放在devDependencies，减小生产包体积'
                    },
                    {
                        title: 'peerDependencies示例',
                        code: `// React组件库的package.json
{
  "name": "my-react-components",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^18.2.0",      // 开发时使用
    "react-dom": "^18.2.0"
  }
}

// npm 7+会自动安装peerDependencies
// npm 4-6需要手动安装

// 使用者的package.json需要安装react
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "my-react-components": "^1.0.0"
  }
}`,
                        notes: 'peerDependencies避免重复安装相同依赖'
                    },
                    {
                        title: 'optionalDependencies示例',
                        code: `{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // macOS文件监听，其他系统可选
  }
}

// 代码中需要处理可选依赖不存在的情况
try {
  const fsevents = require('fsevents');
  // 使用fsevents
} catch (err) {
  // fsevents不可用时的fallback逻辑
  console.log('fsevents not available, using fallback');
}`,
                        notes: '可选依赖安装失败不会导致npm install失败'
                    },
                    {
                        title: 'overrides/resolutions强制版本',
                        code: `// npm 8.3+支持overrides
{
  "overrides": {
    "lodash": "4.17.21",           // 强制所有lodash使用此版本
    "foo": {
      "bar": "1.0.0"               // foo的bar依赖使用1.0.0
    }
  }
}

// yarn使用resolutions
{
  "resolutions": {
    "lodash": "4.17.21",
    "**/lodash": "4.17.21"        // 所有层级的lodash
  }
}

// pnpm使用pnpm.overrides
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}`,
                        notes: '解决依赖冲突或安全漏洞'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'files字段与发布控制',
            content: {
                description: 'files字段控制npm publish时哪些文件会被包含到发布包中，合理配置可以减小包体积。',
                mechanism: 'files字段是白名单，指定要包含的文件或目录。某些文件（如package.json、README）始终包含，某些文件（如.git）始终排除。',
                keyPoints: [
                    'files数组：指定要包含的文件和目录',
                    '默认包含：package.json、README、LICENSE始终包含',
                    '默认排除：node_modules、.git、*.log始终排除',
                    '.npmignore：类似.gitignore，指定要排除的文件',
                    'files优先级高于.npmignore',
                    '使用npm pack预览发布内容',
                    '减小包体积：只包含必要的构建产物'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'files字段配置示例',
            content: {
                description: '合理配置files字段，确保发布包只包含必要文件。',
                examples: [
                    {
                        title: 'files字段示例',
                        code: `{
  "name": "my-package",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "files": [
    "dist",           // 包含dist目录
    "README.md",      // 包含README（实际上默认包含）
    "LICENSE"         // 包含LICENSE
  ]
}

// 项目结构：
my-package/
├── src/           ❌ 不包含（源码）
├── dist/          ✅ 包含（构建产物）
├── test/          ❌ 不包含
├── node_modules/  ❌ 不包含（始终排除）
├── .git/          ❌ 不包含（始终排除）
├── package.json   ✅ 包含（始终包含）
├── README.md      ✅ 包含
└── LICENSE        ✅ 包含`,
                        notes: '只发布构建产物，不发布源码和开发文件'
                    },
                    {
                        title: '.npmignore示例',
                        code: `# .npmignore - 排除不需要发布的文件
src/
test/
*.test.js
*.spec.js
.eslintrc.js
.prettierrc
tsconfig.json
rollup.config.js
.github/
coverage/
*.log
.DS_Store

# 如果files字段已配置，.npmignore会被忽略`,
                        notes: '.npmignore与.gitignore语法相同'
                    },
                    {
                        title: '预览发布内容',
                        code: `# 打包但不发布，生成.tgz文件
npm pack

# 查看会被发布的文件列表
npm publish --dry-run

# 解压查看内容
tar -xzf my-package-1.0.0.tgz

# 安装本地包测试
npm install ./my-package-1.0.0.tgz`,
                        notes: '发布前务必检查包内容'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'engines字段与版本约束',
            content: {
                description: 'engines字段指定项目对Node.js和npm版本的要求，帮助用户了解兼容性。',
                mechanism: 'engines字段仅作为建议，默认不强制检查。设置engine-strict=true可以强制检查版本要求。',
                keyPoints: [
                    '指定Node.js版本范围',
                    '指定npm版本范围',
                    '默认不强制检查（警告）',
                    'engine-strict=true强制检查',
                    '使用semver语法指定范围',
                    'CI/CD中应该检查版本兼容性'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'engines字段示例',
            content: {
                description: '通过engines字段确保项目在正确的环境中运行。',
                examples: [
                    {
                        title: 'engines配置',
                        code: `{
  "engines": {
    "node": ">=14.0.0",          // Node.js 14或更高
    "npm": ">=6.0.0"             // npm 6或更高
  }
}

// 更严格的版本要求
{
  "engines": {
    "node": ">=14.0.0 <19.0.0",  // 14到18之间
    "npm": "^8.0.0"              // npm 8.x
  }
}

// 配合.npmrc强制检查
{
  "engines": {
    "node": ">=16.0.0"
  }
}
// .npmrc
engine-strict=true`,
                        notes: '明确版本要求，避免兼容性问题'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'package.json最佳实践',
            content: {
                description: '良好的package.json配置习惯可以提升项目质量和用户体验。',
                keyPoints: [
                    '完整的元信息：填写description、keywords、author等',
                    'repository链接：方便用户查看源码和提issue',
                    'engines约束：明确Node和npm版本要求',
                    'files白名单：只发布必要文件，减小包体积',
                    'scripts命名：使用统一的命名规范（dev/build/test）',
                    'private字段：内部项目设为true防止意外发布',
                    '依赖分类：正确区分dependencies和devDependencies',
                    '版本锁定：关键依赖使用精确版本'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第5章：npm安装与配置',
            url: './render.html?subject=pkg-manager&type=content&chapter=05'
        },
        next: {
            title: '第7章：npm常用命令',
            url: './render.html?subject=pkg-manager&type=content&chapter=07'
        }
    }
};
