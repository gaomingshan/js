/**
 * 第12章：npm包开发最佳实践
 * 目录结构、TypeScript支持、构建打包、Tree Shaking优化
 */

window.content = {
    section: {
        title: '第12章：npm包开发最佳实践',
        icon: '⚡'
    },
    
    topics: [
        {
            type: 'concept',
            title: '高质量npm包的特征',
            content: {
                description: '优秀的npm包不仅功能完善，还应该具备良好的开发体验、完善的文档、合理的架构设计。',
                keyPoints: [
                    '清晰的目录结构：易于理解和维护',
                    'TypeScript支持：提供类型定义',
                    '多模块格式：支持CJS、ESM',
                    'Tree Shaking：支持按需引入',
                    '完善的文档：README、API文档、示例',
                    '自动化测试：高测试覆盖率',
                    '性能优化：体积小、加载快',
                    '向下兼容：考虑不同环境'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '标准目录结构',
            content: {
                description: '合理的目录结构让项目易于维护，符合社区规范。',
                examples: [
                    {
                        title: '典型npm包目录结构',
                        code: `my-package/
├── src/                   # 源码目录
│   ├── index.ts          # 主入口
│   ├── core/             # 核心功能
│   ├── utils/            # 工具函数
│   └── types/            # 类型定义
├── dist/                  # 构建产物（不提交Git）
│   ├── index.js          # CJS产物
│   ├── index.esm.js      # ESM产物
│   ├── index.d.ts        # 类型声明
│   └── index.umd.js      # UMD产物（可选）
├── test/                  # 测试文件
│   ├── unit/
│   └── integration/
├── examples/              # 示例代码
├── docs/                  # 文档
├── scripts/               # 构建脚本
├── .github/               # GitHub配置
│   └── workflows/        # CI/CD
├── package.json
├── tsconfig.json
├── rollup.config.js      # 构建配置
├── jest.config.js        # 测试配置
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .npmignore
├── README.md
├── CHANGELOG.md
└── LICENSE`,
                        notes: '清晰的结构便于协作和维护'
                    },
                    {
                        title: '.gitignore vs .npmignore',
                        code: `# .gitignore（不提交到Git）
node_modules/
dist/
coverage/
*.log
.env
.DS_Store

# .npmignore（不发布到npm）
src/
test/
examples/
docs/
scripts/
.github/
*.config.js
tsconfig.json
.eslintrc.js
.prettierrc
coverage/
*.test.ts
*.spec.ts

# 注意：如果有files字段，.npmignore会被忽略`,
                        notes: 'Git保留源码，npm只发布产物'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'TypeScript包开发',
            content: {
                description: 'TypeScript已成为npm包开发的标准，提供类型安全和更好的IDE支持。',
                mechanism: 'TypeScript源码编译为JavaScript，同时生成.d.ts类型声明文件。使用者可以获得完整的类型提示和检查。',
                keyPoints: [
                    'tsconfig.json：配置TypeScript编译选项',
                    '声明文件：生成.d.ts供使用者使用',
                    'types字段：在package.json中指定类型入口',
                    '类型导出：导出类型和接口',
                    '严格模式：启用strict选项',
                    '目标版本：根据engines配置target'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'TypeScript配置',
            content: {
                description: 'npm包的TypeScript配置需要兼顾开发体验和发布质量。',
                examples: [
                    {
                        title: 'tsconfig.json配置',
                        code: `{
  "compilerOptions": {
    // 目标ES版本
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018"],
    
    // 声明文件
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    
    // 输出目录
    "outDir": "./dist",
    "rootDir": "./src",
    
    // 模块解析
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    
    // 严格模式
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    
    // 其他选项
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}`,
                        notes: 'strict模式保证类型安全'
                    },
                    {
                        title: 'package.json类型配置',
                        code: `{
  "name": "my-package",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",  // TypeScript类型入口
  
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.esm.js"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  
  "files": [
    "dist"  // 包含.d.ts文件
  ],
  
  "scripts": {
    "build": "tsc && rollup -c",
    "type-check": "tsc --noEmit"
  },
  
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}`,
                        notes: 'exports中明确指定types路径'
                    },
                    {
                        title: '导出类型',
                        code: `// src/index.ts
export interface User {
  id: number;
  name: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export class UserManager {
  getUser(id: number): User {
    // ...
  }
}

// 默认导出
export default UserManager;

// 使用者可以获得完整类型提示
import UserManager, { User, UserRole } from 'my-package';

const user: User = { id: 1, name: 'Alice' };`,
                        notes: '导出类型让使用者获得类型支持'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '多模块格式支持',
            content: {
                description: '现代npm包应该同时支持CommonJS和ES Module，兼容不同的使用环境。',
                mechanism: '使用构建工具（如Rollup、esbuild）将TypeScript/ES6+源码编译为多种格式：CJS用于Node.js，ESM用于现代打包工具，UMD用于浏览器。',
                keyPoints: [
                    'CJS格式：Node.js require()',
                    'ESM格式：import语法，支持Tree Shaking',
                    'UMD格式：浏览器<script>标签（可选）',
                    'main字段：CJS入口',
                    'module字段：ESM入口',
                    'exports字段：条件导出，精确控制'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Rollup构建配置',
            content: {
                description: 'Rollup是构建npm包的首选工具，支持多格式输出和Tree Shaking。',
                examples: [
                    {
                        title: 'rollup.config.js',
                        code: `import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,  // dist/index.js
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: pkg.module,  // dist/index.esm.js
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyPackage',
        sourcemap: true,
        globals: {
          // 外部依赖的全局变量名
          'lodash': '_'
        }
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist'
      }),
      terser()  // 压缩
    ],
    external: [
      // 不打包依赖
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]
  }
];`,
                        notes: 'Rollup生成多种格式的产物'
                    },
                    {
                        title: 'esbuild构建（更快）',
                        code: `// build.js
import { build } from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  external: Object.keys(pkg.dependencies || {}),
  sourcemap: true
};

// CJS
await build({
  ...shared,
  outfile: 'dist/index.js',
  format: 'cjs'
});

// ESM
await build({
  ...shared,
  outfile: 'dist/index.esm.js',
  format: 'esm'
});

console.log('Build complete!');`,
                        notes: 'esbuild速度极快，适合简单场景'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Tree Shaking优化',
            content: {
                description: 'Tree Shaking可以移除未使用的代码，减小打包体积。支持Tree Shaking的包应该使用ES Module格式和副作用声明。',
                mechanism: '打包工具通过静态分析ES Module的import/export，识别并移除未使用的代码。副作用声明告诉打包工具哪些代码可以安全删除。',
                keyPoints: [
                    'ESM格式：Tree Shaking的前提',
                    'sideEffects：声明副作用文件',
                    '纯函数：避免全局副作用',
                    '命名导出：优于默认导出',
                    '避免动态import：静态可分析',
                    '测试验证：确保Tree Shaking生效'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Tree Shaking配置',
            content: {
                description: '正确配置sideEffects和导出方式，让包支持Tree Shaking。',
                examples: [
                    {
                        title: 'package.json配置',
                        code: `{
  "name": "my-utils",
  "module": "./dist/index.esm.js",
  
  // 无副作用（所有代码都可Tree Shake）
  "sideEffects": false,
  
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "src/polyfills.js"
  ],
  
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    },
    // 支持子路径导入
    "./utils/*": {
      "import": "./dist/utils/*.esm.js",
      "require": "./dist/utils/*.js"
    }
  }
}`,
                        notes: 'sideEffects: false表示所有代码无副作用'
                    },
                    {
                        title: '编写可Tree Shake的代码',
                        code: `// ✅ 推荐：命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// ❌ 避免：默认导出对象
export default {
  add,
  subtract
};

// 使用者可以按需引入
import { add } from 'my-utils';  // 只打包add

// 避免全局副作用
// ❌ 不好
console.log('Module loaded');  // 副作用

// ✅ 好
export function log(msg) {
  console.log(msg);
}`,
                        notes: '命名导出 + 无副作用 = 可Tree Shake'
                    },
                    {
                        title: '验证Tree Shaking',
                        code: `// test-tree-shaking/index.js
import { add } from 'my-utils';
console.log(add(1, 2));

// 使用webpack打包
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: './test-tree-shaking/index.js',
  output: {
    filename: 'bundle.js'
  }
};

// 打包后检查bundle.js
// 应该只包含add函数，不包含subtract`,
                        notes: '实际打包验证Tree Shaking效果'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '包体积优化',
            content: {
                description: '小巧的包体积可以加快安装和加载速度，提升用户体验。',
                mechanism: '通过代码压缩、移除无用代码、优化依赖、按需加载等手段减小包体积。使用bundlephobia等工具分析体积。',
                keyPoints: [
                    '代码压缩：terser、uglify',
                    '依赖优化：避免不必要的依赖',
                    'Tree Shaking：移除未使用代码',
                    'peer依赖：大型库使用peerDependencies',
                    '按需加载：支持子路径引入',
                    '体积分析：定期检查包体积'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '体积优化实践',
            content: {
                description: '多种手段组合使用，最大化减小包体积。',
                examples: [
                    {
                        title: '分析包体积',
                        code: `# 使用npm-pack-size
npx npm-pack-size my-package

# 使用bundlephobia
# https://bundlephobia.com/package/my-package

# package.json添加size限制
{
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "10 KB"
    }
  ]
}

# 安装size-limit
npm install --save-dev size-limit @size-limit/preset-small-lib

# 检查体积
npm run size`,
                        notes: '定期检查，防止体积膨胀'
                    },
                    {
                        title: '使用peerDependencies',
                        code: `// 场景：React组件库

// ❌ 不好：把React打包进去
{
  "dependencies": {
    "react": "^18.2.0"  // 用户会安装两份React
  }
}

// ✅ 好：使用peerDependencies
{
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^18.2.0"  // 开发时使用
  }
}`,
                        notes: 'peer依赖避免重复安装大型库'
                    },
                    {
                        title: '支持子路径导入',
                        code: `// package.json
{
  "exports": {
    ".": "./dist/index.js",
    "./button": "./dist/components/button.js",
    "./input": "./dist/components/input.js"
  }
}

// 使用者可以按需引入
import Button from 'my-ui/button';  // 只加载Button
import Input from 'my-ui/input';    // 只加载Input

// 而不是
import { Button, Input } from 'my-ui';  // 可能加载全部`,
                        notes: '子路径导入减少打包体积'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '文档和示例',
            content: {
                description: '完善的文档是优秀npm包的标志，降低使用门槛。',
                examples: [
                    {
                        title: 'README.md结构',
                        code: `# My Awesome Package

[![npm version](https://img.shields.io/npm/v/my-package.svg)](https://www.npmjs.com/package/my-package)
[![license](https://img.shields.io/npm/l/my-package.svg)](LICENSE)

> 简短的一句话描述

## ✨ 特性

- 🚀 功能1
- 📦 功能2
- ⚡️ 功能3

## 📦 安装

\`\`\`bash
npm install my-package
\`\`\`

## 🚀 快速开始

\`\`\`javascript
import { myFunction } from 'my-package';

myFunction();
\`\`\`

## 📖 API

### myFunction(options)

描述...

**参数:**
- \`options\` (Object): 配置对象
  - \`name\` (string): 名称
  - \`age\` (number): 年龄

**返回值:** Promise<Result>

**示例:**

\`\`\`javascript
await myFunction({ name: 'Alice', age: 30 });
\`\`\`

## 🔧 配置

...

## 💡 示例

更多示例见 [examples](./examples) 目录。

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

[MIT](LICENSE) © [Your Name]`,
                        notes: '结构清晰、示例完整的README'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'npm包开发最佳实践总结',
            content: {
                description: '遵循业界标准，开发高质量npm包。',
                keyPoints: [
                    'TypeScript：使用TS开发，提供类型定义',
                    '多格式：支持CJS和ESM',
                    'Tree Shaking：sideEffects: false',
                    '体积优化：压缩代码，优化依赖',
                    '完善文档：README、API文档、示例',
                    '自动化测试：Jest、单元测试、集成测试',
                    'CI/CD：GitHub Actions自动发布',
                    '语义化版本：严格遵循semver',
                    '变更日志：维护CHANGELOG.md',
                    '安全审计：定期npm audit'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第11章：发布npm包',
            url: './render.html?subject=pkg-manager&type=content&chapter=11'
        },
        next: {
            title: '第13章：npm生命周期钩子',
            url: './render.html?subject=pkg-manager&type=content&chapter=13'
        }
    }
};
