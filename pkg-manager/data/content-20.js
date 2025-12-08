/**
 * 第20章：Yarn Berry高级特性
 * Constraints、Protocols、Plugins、Patch Protocol
 */

window.content = {
    section: {
        title: '第20章：Yarn Berry高级特性',
        icon: '🚀'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Yarn Berry的愿景',
            content: {
                description: 'Yarn Berry（v2+）不仅仅是包管理器，更是一个可扩展的JavaScript项目管理平台，提供插件系统、约束检查、协议扩展等高级特性。',
                keyPoints: [
                    '插件架构：高度可扩展',
                    'TypeScript重写：代码质量高',
                    'Constraints：强制项目规范',
                    'Protocols：自定义依赖来源',
                    'Patches：修复第三方包',
                    'Interactive Tools：交互式工具',
                    '现代化：面向未来的设计'
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Yarn插件系统',
            content: {
                description: 'Yarn Berry采用插件架构，核心功能和扩展功能都通过插件实现，用户可以按需加载。',
                mechanism: '插件是JavaScript模块，通过yarn plugin import安装，保存在.yarn/plugins/，运行时动态加载，可以扩展命令、钩子、协议等。',
                keyPoints: [
                    '官方插件：Yarn维护的插件',
                    '社区插件：第三方插件',
                    '自定义插件：项目特定插件',
                    '按需加载：只安装需要的插件',
                    '版本控制：插件提交Git',
                    'API暴露：丰富的插件API'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '插件管理',
            content: {
                description: 'Yarn提供完整的插件管理命令。',
                examples: [
                    {
                        title: '安装和使用插件',
                        code: `# 列出官方插件
yarn plugin list

# 安装官方插件
yarn plugin import typescript
yarn plugin import interactive-tools
yarn plugin import workspace-tools
yarn plugin import version

# 从URL安装
yarn plugin import https://example.com/plugin.js

# 从本地文件安装
yarn plugin import ./my-plugin.js

# 列出已安装插件
yarn plugin runtime

# 移除插件
yarn plugin remove @yarnpkg/plugin-typescript

# 插件保存位置：
.yarn/
└── plugins/
    ├── @yarnpkg-plugin-typescript.cjs
    └── @yarnpkg-plugin-interactive-tools.cjs`,
                        notes: '插件安装后立即生效'
                    },
                    {
                        title: '常用官方插件',
                        code: `# @yarnpkg/plugin-typescript
# 提供TypeScript SDK生成
yarn plugin import typescript
yarn dlx @yarnpkg/sdks vscode

# @yarnpkg/plugin-interactive-tools
# 提供交互式命令（upgrade-interactive等）
yarn plugin import interactive-tools
yarn upgrade-interactive

# @yarnpkg/plugin-workspace-tools
# 增强workspace功能（focus等）
yarn plugin import workspace-tools
yarn workspaces focus @my/ui

# @yarnpkg/plugin-version
# 提供version命令（类似npm version）
yarn plugin import version
yarn version patch

# @yarnpkg/plugin-stage
# 自动stage更新的文件
yarn plugin import stage`,
                        notes: '按需安装插件扩展功能'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Constraints（约束检查）',
            content: {
                description: 'Constraints允许定义项目范围的规则，强制执行一致性，如统一依赖版本、package.json格式等。',
                mechanism: 'constraints.pro文件使用Prolog语法定义规则，yarn constraints check检查违规，yarn constraints fix自动修复。',
                keyPoints: [
                    'Prolog语法：声明式规则',
                    '自动检查：CI中强制',
                    '自动修复：fix命令',
                    '规则示例：统一版本、必需字段',
                    'Monorepo神器：确保workspace一致性',
                    '学习曲线：Prolog较难'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Constraints使用',
            content: {
                description: 'Constraints通过规则强制项目规范。',
                examples: [
                    {
                        title: '基本Constraints',
                        code: `// constraints.pro

// 规则1：所有workspace必须有license字段
gen_enforced_field(WorkspaceCwd, 'license', 'MIT').

// 规则2：统一react版本
gen_enforced_dependency(WorkspaceCwd, 'react', '18.2.0', DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, 'react', _, DependencyType).

// 规则3：禁止某些依赖
gen_enforced_field(WorkspaceCwd, 'dependencies.moment', null) :-
  workspace_field(WorkspaceCwd, 'dependencies.moment', _).

// 规则4：所有workspace版本号一致
gen_enforced_field(WorkspaceCwd, 'version', '1.0.0').

// 规则5：repository字段必须存在
gen_enforced_field(WorkspaceCwd, 'repository.type', 'git').
gen_enforced_field(WorkspaceCwd, 'repository.url', 'https://github.com/user/repo.git').`,
                        notes: 'Prolog语法定义规则'
                    },
                    {
                        title: '运行Constraints',
                        code: `# 检查约束
yarn constraints

# 输出违规信息：
# ➤ YN0000: @my/ui must have a field "license" set to "MIT"
# ➤ YN0000: @my/app is using react@18.0.0 but should be using 18.2.0

# 自动修复
yarn constraints --fix

# CI中强制检查
# .github/workflows/ci.yml
- name: Check constraints
  run: yarn constraints`,
                        notes: 'constraints确保项目一致性'
                    },
                    {
                        title: '实用Constraints示例',
                        code: `// constraints.pro

// 1. 确保所有workspace使用相同的React版本
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, DependencyType),
  DependencyIdent = 'react',
  % 获取根package.json的react版本
  workspace_field('.', 'dependencies.react', DependencyRange).

// 2. 禁止使用已废弃的包
gen_enforced_field(WorkspaceCwd, FieldName, null) :-
  DeprecatedPackages = ['request', 'moment'],
  member(Package, DeprecatedPackages),
  atom_concat('dependencies.', Package, FieldName),
  workspace_field(WorkspaceCwd, FieldName, _).

// 3. 确保所有包有author字段
gen_enforced_field(WorkspaceCwd, 'author', 'Your Name <your@email.com>') :-
  WorkspaceCwd \= '.'.

// 4. 统一scripts命名
gen_enforced_field(WorkspaceCwd, 'scripts.build', 'tsc') :-
  workspace_field(WorkspaceCwd, 'main', _).`,
                        notes: '实用的约束规则'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Protocols（协议）',
            content: {
                description: 'Protocols允许从非标准源获取依赖，如exec:、link:、portal:、patch:等，扩展依赖来源。',
                mechanism: '协议是URL scheme，如patch:lodash@npm:4.17.21#.yarn/patches/lodash.patch，Yarn解析协议后执行相应的获取逻辑。',
                keyPoints: [
                    'patch:：应用补丁',
                    'portal:：文件系统链接',
                    'link:：软链接',
                    'exec:：动态生成依赖',
                    'file:：本地文件',
                    '自定义协议：插件扩展'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Protocols使用',
            content: {
                description: '各种协议满足不同的依赖需求。',
                examples: [
                    {
                        title: 'patch:协议',
                        code: `# 修复第三方包的bug

# 1. 准备修改包
yarn patch lodash

# 输出：
# Package lodash@npm:4.17.21 got extracted into temporary folder:
# /tmp/.yarn/patches/lodash-npm-4.17.21-xxx

# 2. 修改临时文件夹中的代码

# 3. 提交补丁
yarn patch-commit /tmp/.yarn/patches/lodash-npm-4.17.21-xxx

# 4. 补丁保存到.yarn/patches/lodash-npm-4.17.21-xxx.patch

# 5. package.json自动更新
{
  "resolutions": {
    "lodash@^4.17.21": "patch:lodash@npm:4.17.21#./.yarn/patches/lodash-npm-4.17.21-xxx.patch"
  }
}

# 下次安装自动应用补丁`,
                        notes: 'patch:用于修复第三方包'
                    },
                    {
                        title: 'portal:协议',
                        code: `// portal:创建到文件系统的链接（类似pnpm的链接）

// package.json
{
  "dependencies": {
    "my-lib": "portal:../my-lib"
  }
}

// 与link:的区别：
// - portal: 链接整个包（包括依赖）
// - link: 只链接包本身

// 场景：开发本地包时使用`,
                        notes: 'portal:适合开发本地依赖'
                    },
                    {
                        title: 'exec:协议',
                        code: `// exec:在安装时执行脚本生成依赖

// package.json
{
  "dependencies": {
    "pkg-with-binaries": "exec:./scripts/build-binaries.js"
  }
}

// scripts/build-binaries.js
// 下载、编译、打包二进制文件
// 返回包的路径

// 场景：动态依赖、按需构建`,
                        notes: 'exec:用于动态生成依赖'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Interactive Tools插件',
            content: {
                description: 'Interactive Tools提供交互式命令，提升开发体验。',
                examples: [
                    {
                        title: '交互式升级',
                        code: `# 安装插件
yarn plugin import interactive-tools

# 交互式升级
yarn upgrade-interactive

# 界面：
# ? Pick the packages you want to upgrade:
# ◯ lodash       4.17.20 → 4.17.21
# ◉ react        18.0.0  → 18.2.0
# ◯ typescript   4.9.0   → 5.0.0
#
# 空格选择，回车确认`,
                        notes: '比yarn upgrade更友好'
                    },
                    {
                        title: '搜索包',
                        code: `# yarn search命令（需要插件）
yarn search react

# 输出：
# react - A JavaScript library for building user interfaces
# react-dom - React package for working with the DOM
# react-router - Declarative routing for React`,
                        notes: '交互式搜索npm包'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Version插件',
            content: {
                description: 'Version插件提供类似npm version的版本管理功能。',
                examples: [
                    {
                        title: 'yarn version命令',
                        code: `# 安装version插件
yarn plugin import version

# 更新版本
yarn version patch   # 1.0.0 → 1.0.1
yarn version minor   # 1.0.1 → 1.1.0
yarn version major   # 1.1.0 → 2.0.0
yarn version 1.2.3   # 指定版本

# 应用到所有workspaces
yarn workspaces foreach version patch

# 生成Git tag
yarn version patch --deferred
git add .
git commit -m "Bump version"
git tag v1.0.1`,
                        notes: 'version插件简化版本管理'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '自定义插件开发',
            content: {
                description: 'Yarn允许开发自定义插件来扩展功能。',
                examples: [
                    {
                        title: '简单插件示例',
                        code: `// my-plugin.js
module.exports = {
  name: 'plugin-hello',
  factory: (require) => {
    const { BaseCommand } = require('@yarnpkg/cli');
    
    class HelloCommand extends BaseCommand {
      static paths = [['hello']];
      
      async execute() {
        this.context.stdout.write('Hello from custom plugin!\\n');
      }
    }
    
    return {
      commands: [HelloCommand]
    };
  }
};

// 使用：
// yarn plugin import ./my-plugin.js
// yarn hello`,
                        notes: '插件可以添加自定义命令'
                    },
                    {
                        title: '插件钩子',
                        code: `// 插件可以监听各种钩子
module.exports = {
  name: 'plugin-hooks',
  factory: (require) => ({
    hooks: {
      // 安装后钩子
      afterAllInstalled: async (project) => {
        console.log('All dependencies installed!');
      },
      
      // 解析前钩子
      beforeWorkspacePacking: async (workspace, rawManifest) => {
        // 修改package.json
      },
      
      // 发布前钩子
      beforePublish: async (workspace) => {
        // 发布前检查
      }
    }
  })
};`,
                        notes: '钩子扩展Yarn行为'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Yarn Berry vs Classic特性对比',
            content: {
                description: 'Berry相比Classic带来大量新特性。',
                items: [
                    {
                        name: 'Yarn Berry特有',
                        pros: [
                            'PnP：抛弃node_modules',
                            'Plugins：插件系统',
                            'Constraints：约束检查',
                            'Protocols：协议扩展',
                            'Zero-Installs：零安装',
                            'TypeScript重写：高质量代码',
                            'Modern APIs：现代化API'
                        ]
                    },
                    {
                        name: 'Yarn Classic',
                        pros: [
                            '稳定成熟',
                            '兼容性好',
                            'node_modules',
                            '广泛使用'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Yarn Berry最佳实践',
            content: {
                description: '充分利用Berry的高级特性。',
                keyPoints: [
                    'PnP评估：评估项目是否适合PnP',
                    '按需插件：只安装需要的插件',
                    'Constraints强制：Monorepo必备',
                    'patch:修复：及时修复第三方bug',
                    '零安装可选：根据团队习惯',
                    'workspace:协议：明确内部依赖',
                    'TypeScript配置：正确配置SDK',
                    'CI集成：constraints检查',
                    '文档完善：说明Berry配置',
                    '渐进迁移：逐步从Classic升级'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "第19章：Yarn Plug'n'Play (PnP)",
            url: './render.html?subject=pkg-manager&type=content&chapter=19'
        },
        next: {
            title: '第21章：pnpm原理与优势',
            url: './render.html?subject=pkg-manager&type=content&chapter=21'
        }
    }
};
