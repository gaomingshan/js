/**
 * 第19章：Yarn Plug'n'Play (PnP)
 * PnP原理、.pnp.cjs、零安装、离线缓存、IDE支持
 */

window.content = {
    section: {
        title: "第19章：Yarn Plug'n'Play (PnP)",
        icon: '⚡'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'PnP的革命性创新',
            content: {
                description: "Plug'n'Play (PnP) 是Yarn 2+的核心特性，彻底抛弃node_modules，通过.pnp.cjs直接管理依赖，实现极快的安装速度和零安装。",
                keyPoints: [
                    '抛弃node_modules：不再生成巨大的node_modules',
                    '.pnp.cjs：单个文件管理所有依赖',
                    '直接映射：包名到磁盘位置的直接映射',
                    '严格依赖：彻底消除幽灵依赖',
                    '零安装：.yarn/cache可提交Git',
                    '极速安装：跳过文件复制',
                    '兼容性挑战：很多工具不支持'
                ],
                mdn: 'https://yarnpkg.com/features/pnp'
            }
        },
        
        {
            type: 'principle',
            title: 'PnP工作原理',
            content: {
                description: 'PnP通过拦截Node.js的require()，将包名解析重定向到缓存目录，避免node_modules的IO开销。',
                mechanism: 'yarn install时生成.pnp.cjs文件，记录所有包的位置映射。运行时，Node.js加载.pnp.cjs，拦截require()调用，直接从缓存读取包，无需遍历node_modules。',
                keyPoints: [
                    '解析重定向：拦截Module._load',
                    '映射表：包名→缓存路径',
                    '缓存直读：.yarn/cache/lodash-xxx.zip',
                    'ZIP加载：直接从ZIP读取',
                    '严格模式：未声明依赖无法使用',
                    '性能提升：跳过文件系统遍历'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '启用PnP',
            content: {
                description: 'PnP在Yarn 2+中默认启用，也可以切换回node_modules模式。',
                examples: [
                    {
                        title: '初始化PnP项目',
                        code: `# 1. 初始化项目
mkdir my-pnp-project
cd my-pnp-project
npm init -y

# 2. 启用Yarn Berry
corepack enable
yarn set version berry

# 3. 配置PnP模式（默认就是）
yarn config set nodeLinker pnp

# 4. 安装依赖
yarn add lodash

# 生成的文件：
# .pnp.cjs           ← PnP运行时和映射表
# .pnp.loader.mjs    ← ESM加载器
# .yarn/
#   ├── cache/       ← ZIP格式的包缓存
#   └── releases/    ← Yarn可执行文件

# 没有node_modules/！`,
                        notes: 'PnP不生成node_modules'
                    },
                    {
                        title: '切换到node_modules模式',
                        code: `# 如果遇到兼容性问题，可以切换回node_modules

# 方式1：配置nodeLinker
yarn config set nodeLinker node-modules

# 方式2：在.yarnrc.yml中设置
# .yarnrc.yml
nodeLinker: node-modules

# 重新安装
rm -rf .yarn/cache .pnp.*
yarn install

# 现在会生成node_modules/`,
                        notes: 'nodeLinker控制依赖管理模式'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '.pnp.cjs文件详解',
            content: {
                description: '.pnp.cjs是PnP的核心，包含依赖映射表和运行时代码。',
                mechanism: '.pnp.cjs导出函数，拦截Node.js的模块加载，根据映射表直接返回缓存中的模块路径，完全绕过node_modules查找算法。',
                keyPoints: [
                    'packageRegistry：包注册表',
                    'packageLocations：包位置映射',
                    'fallbackPool：后备依赖池',
                    '钩子函数：拦截require()',
                    'ZIP支持：直接读取ZIP中的文件',
                    '自动生成：yarn install自动创建'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '.pnp.cjs结构',
            content: {
                description: '.pnp.cjs虽然是自动生成的，但了解其结构有助于理解PnP。',
                examples: [
                    {
                        title: '.pnp.cjs简化示例',
                        code: `// .pnp.cjs (简化版)
const path = require('path');

// 包注册表
const packageRegistry = new Map([
  ["lodash", [
    ["npm:4.17.21", {
      packageLocation: "./.yarn/cache/lodash-npm-4.17.21-xxx.zip/node_modules/lodash/",
      packageDependencies: new Map([
        ["lodash", "npm:4.17.21"]
      ])
    }]
  ]],
  ["react", [
    ["npm:18.2.0", {
      packageLocation: "./.yarn/cache/react-npm-18.2.0-xxx.zip/node_modules/react/",
      packageDependencies: new Map([
        ["react", "npm:18.2.0"],
        ["loose-envify", "npm:1.4.0"]  // react的依赖
      ])
    }]
  ]]
]);

// 拦截require()
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
  // 解析包名和版本
  const resolved = resolveToUnqualified(request, this.filename);
  // 返回实际路径
  return originalRequire.call(this, resolved);
};`,
                        notes: '.pnp.cjs包含完整的依赖图'
                    },
                    {
                        title: '运行PnP应用',
                        code: `// 方式1：使用yarn node（推荐）
yarn node index.js

// 方式2：显式加载.pnp.cjs
node -r ./.pnp.cjs index.js

// 方式3：在代码中加载
// index.js
require('./.pnp.cjs').setup();
const lodash = require('lodash');

// package.json scripts自动支持PnP
{
  "scripts": {
    "start": "node index.js"  // yarn start会自动加载PnP
  }
}`,
                        notes: 'yarn运行命令自动加载PnP'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '零安装（Zero-Installs）',
            content: {
                description: '零安装是PnP的杀手级特性：将.yarn/cache提交到Git，克隆仓库后无需yarn install即可运行。',
                mechanism: '.yarn/cache中的ZIP包是完全自包含的，提交到Git后，团队成员和CI直接使用这些缓存，跳过安装阶段。',
                keyPoints: [
                    '提交缓存：.yarn/cache提交Git',
                    '克隆即用：git clone后直接运行',
                    'CI提速：跳过yarn install',
                    '离线开发：无需网络',
                    '确定性：完全锁定依赖',
                    '争议：增大仓库体积'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '配置零安装',
            content: {
                description: '零安装需要正确配置.gitignore，选择性提交缓存。',
                examples: [
                    {
                        title: '启用零安装',
                        code: `# .gitignore
# Yarn Berry零安装配置

# 提交Yarn可执行文件
!.yarn/releases

# 提交缓存（零安装的关键）
!.yarn/cache
.yarn/cache/**/*.zip  # 提交所有缓存ZIP
.pnp.*

# 提交插件
!.yarn/plugins
!.yarn/sdks

# 不提交
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz

# 提交lock文件
!yarn.lock

# 使用：
# 1. 开发者A添加依赖
yarn add lodash

# 2. 提交
git add .yarn/cache yarn.lock
git commit -m "add lodash"

# 3. 开发者B拉取
git pull

# 4. 直接运行（无需yarn install）
yarn build`,
                        notes: '零安装让CI和克隆极快'
                    },
                    {
                        title: '不使用零安装',
                        code: `# 如果不想提交缓存（缓存很大）

# .gitignore
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

.pnp.*

# 此时.yarn/cache不提交
# 团队成员需要yarn install`,
                        notes: '零安装是可选的'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'PnP vs node_modules',
            content: {
                description: 'PnP和传统node_modules各有优劣，需要权衡选择。',
                items: [
                    {
                        name: 'PnP模式',
                        pros: [
                            '极快安装：跳过文件复制',
                            '零安装：可提交缓存',
                            '严格依赖：无幽灵依赖',
                            '磁盘空间：单份缓存',
                            '确定性：完全锁定'
                        ],
                        cons: [
                            '兼容性差：很多工具不支持',
                            '学习曲线：新概念',
                            'IDE支持：需要配置',
                            '调试困难：ZIP中的代码',
                            '社区分裂：争议较大'
                        ]
                    },
                    {
                        name: 'node_modules',
                        pros: [
                            '兼容性好：所有工具支持',
                            '简单直观：文件夹结构',
                            'IDE友好：开箱即用',
                            '调试容易：可见源码'
                        ],
                        cons: [
                            '安装慢：大量文件复制',
                            '磁盘浪费：重复依赖',
                            '幽灵依赖：隐式依赖',
                            'IO密集：性能瓶颈'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'PnP兼容性问题',
            content: {
                description: 'PnP最大的挑战是兼容性，很多工具需要适配或配置。',
                examples: [
                    {
                        title: 'TypeScript配置',
                        code: `// TypeScript需要安装PnP SDK

# 1. 安装SDK
yarn dlx @yarnpkg/sdks vscode

# 2. 生成.yarn/sdks/typescript
# 3. VSCode选择使用workspace TypeScript

// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    // PnP会自动处理路径解析
  }
}

// 或使用typescript plugin
yarn plugin import typescript`,
                        notes: 'VSCode需要使用workspace TS'
                    },
                    {
                        title: 'ESLint配置',
                        code: `// .eslintrc.js
module.exports = {
  extends: [
    // 使用require.resolve
    require.resolve('eslint-config-airbnb')
  ],
  plugins: [
    // 或者配置resolvePluginsRelativeTo
  ]
};

// 或安装ESLint SDK
yarn dlx @yarnpkg/sdks vscode
// 生成.yarn/sdks/eslint`,
                        notes: 'ESLint需要显式解析路径'
                    },
                    {
                        title: 'Jest配置',
                        code: `// jest.config.js
module.exports = {
  // 使用PnP resolver
  resolver: require.resolve('jest-pnp-resolver'),
  
  // 或
  moduleNameMapper: {
    // 手动映射
  }
};

// 安装jest-pnp-resolver
yarn add -D jest-pnp-resolver`,
                        notes: 'Jest需要PnP resolver'
                    },
                    {
                        title: '使用patches修复不兼容',
                        code: `# 如果某个包不兼容PnP，可以打补丁

# 1. 修改node_modules中的包（临时）
# 2. 生成补丁
yarn patch-commit <package-name>

# 3. 补丁保存到.yarn/patches/
# 4. 下次安装自动应用

// package.json
{
  "resolutions": {
    "problematic-package@^1.0.0": "patch:problematic-package@npm:1.0.0#.yarn/patches/problematic-package-npm-1.0.0-xxx.patch"
  }
}`,
                        notes: 'patch机制解决兼容性问题'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'PnP最佳实践',
            content: {
                description: 'PnP需要团队共识和正确配置才能发挥优势。',
                examples: [
                    {
                        title: '项目配置清单',
                        code: `# .yarnrc.yml
nodeLinker: pnp
enableGlobalCache: true  # 或false（使用零安装）

# .gitignore（零安装）
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
.pnp.*

# 或.gitignore（不使用零安装）
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
.pnp.*

# VSCode配置（.vscode/settings.json）
{
  "search.exclude": {
    "**/.yarn": true,
    "**/.pnp.*": true
  },
  "typescript.tsdk": ".yarn/sdks/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}`,
                        notes: '完整的PnP项目配置'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'PnP使用建议',
            content: {
                description: 'PnP是强大但激进的特性，需要谨慎评估。',
                keyPoints: [
                    '评估兼容性：检查项目依赖是否支持PnP',
                    '团队共识：确保团队理解PnP',
                    'IDE配置：正确配置VSCode/WebStorm',
                    '渐进迁移：先在新项目尝试',
                    'node_modules后备：遇到问题可切回',
                    '零安装可选：根据团队习惯选择',
                    '文档完善：README说明PnP相关配置',
                    '工具链验证：确保构建工具兼容',
                    '新项目推荐：现代项目考虑PnP',
                    '老项目谨慎：评估迁移成本'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第18章：Yarn Workspaces',
            url: './render.html?subject=pkg-manager&type=content&chapter=18'
        },
        next: {
            title: '第20章：Yarn Berry高级特性',
            url: './render.html?subject=pkg-manager&type=content&chapter=20'
        }
    }
};
