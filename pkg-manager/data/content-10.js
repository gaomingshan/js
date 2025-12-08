/**
 * 第10章：npm link本地开发
 * npm link原理、本地包调试、多包联调、替代方案
 */

window.content = {
    section: {
        title: '第10章：npm link本地开发',
        icon: '🔗'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'npm link的作用',
            content: {
                description: 'npm link用于在本地开发和调试npm包时，将包链接到全局或其他项目，无需反复发布和安装。',
                keyPoints: [
                    '本地开发：开发npm包时实时测试',
                    '符号链接：通过symlink连接本地包',
                    '避免发布：无需发布到npm就能测试',
                    '实时更新：源码修改立即生效',
                    '多包联调：同时开发多个相互依赖的包',
                    '全局可用：将包链接到全局使用'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/commands/npm-link'
            }
        },
        
        {
            type: 'principle',
            title: 'npm link工作原理',
            content: {
                description: 'npm link通过创建符号链接（symlink）将包连接到全局node_modules和项目node_modules，实现本地包的开发和测试。',
                mechanism: 'npm link分两步：1）在包目录运行npm link，创建从全局node_modules到本地包的链接；2）在使用项目运行npm link <package>，创建从项目node_modules到全局的链接。',
                keyPoints: [
                    '第一步：npm link在包目录，链接到全局',
                    '第二步：npm link <pkg>在项目，链接全局到本地',
                    '符号链接：使用操作系统的symlink机制',
                    '双向链接：包→全局→项目',
                    '实时同步：修改源码立即反映到使用方',
                    'Windows限制：某些情况需要管理员权限'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm link基本用法',
            content: {
                description: 'npm link是本地包开发的利器，掌握正确用法可以大幅提升开发效率。',
                examples: [
                    {
                        title: '开发工具库并在项目中使用',
                        code: `# 场景：开发my-utils包，在my-app中使用

# 1. 在my-utils包目录中
cd /path/to/my-utils
npm link  # 链接到全局

# 输出：
# /usr/local/lib/node_modules/my-utils -> /path/to/my-utils

# 2. 在my-app项目目录中
cd /path/to/my-app
npm link my-utils  # 链接全局的my-utils

# 输出：
# /path/to/my-app/node_modules/my-utils -> /usr/local/lib/node_modules/my-utils -> /path/to/my-utils

# 3. 现在my-app中可以使用my-utils
# 修改my-utils的代码会立即生效`,
                        notes: '两步link建立双向符号链接'
                    },
                    {
                        title: '取消link',
                        code: `# 在使用项目中取消链接
cd /path/to/my-app
npm unlink my-utils  # 删除项目中的链接
# 或
npm unlink --no-save my-utils  # 不修改package.json

# 在包目录取消全局链接
cd /path/to/my-utils
npm unlink  # 或 npm unlink -g

# 重新安装正常的npm包
cd /path/to/my-app
npm install my-utils`,
                        notes: '开发完成后记得取消link'
                    },
                    {
                        title: '查看已链接的包',
                        code: `# 查看全局链接的包
npm ls -g --depth=0 --link=true

# 查看项目中链接的包
npm ls --link=true

# 查看符号链接详情（Unix）
ls -l node_modules/
# 输出示例：
# my-utils -> /usr/local/lib/node_modules/my-utils`,
                        notes: '检查当前的link状态'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Monorepo中的npm link',
            content: {
                description: '在Monorepo项目中，多个包相互依赖，npm link可以简化包之间的联调，但workspaces是更好的解决方案。',
                mechanism: 'Monorepo中的包可以通过npm link相互链接，但npm/yarn/pnpm的workspaces功能提供了更自动化的解决方案，无需手动link。',
                keyPoints: [
                    '手动link：每个包都需要手动npm link',
                    '复杂度高：包多时link关系复杂',
                    'workspaces：自动处理内部依赖',
                    'pnpm优势：pnpm workspace表现最好',
                    'yarn/npm 7+：原生支持workspaces',
                    '推荐方案：使用workspaces而不是link'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Monorepo联调方案',
            content: {
                description: 'Monorepo项目推荐使用workspaces而不是npm link。',
                examples: [
                    {
                        title: '使用npm workspaces',
                        code: `# 项目结构
my-monorepo/
├── package.json
├── packages/
│   ├── utils/
│   │   └── package.json
│   └── app/
│       └── package.json

# 根package.json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*"
  ]
}

# packages/app/package.json
{
  "dependencies": {
    "@my/utils": "^1.0.0"  // 引用workspace中的包
  }
}

# 安装依赖（自动link workspace包）
npm install

# 运行workspace中的脚本
npm run build -w @my/utils
npm run dev -w @my/app`,
                        notes: 'workspaces自动处理内部依赖'
                    },
                    {
                        title: '使用pnpm workspace（推荐）',
                        code: `# pnpm-workspace.yaml
packages:
  - 'packages/*'

# packages/app/package.json
{
  "dependencies": {
    "@my/utils": "workspace:*"  // pnpm workspace协议
  }
}

# 安装依赖
pnpm install

# 运行命令
pnpm --filter @my/app dev
pnpm --filter @my/utils build

# 递归运行所有包的命令
pnpm -r build`,
                        notes: 'pnpm workspace性能最好'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm link的局限性',
            content: {
                description: 'npm link虽然方便，但存在一些限制和潜在问题，需要了解并采取替代方案。',
                mechanism: 'npm link使用符号链接，在某些系统和场景下可能不工作。同时，link后的包行为与实际安装的包可能有细微差异。',
                keyPoints: [
                    'Windows限制：需要管理员权限或开发者模式',
                    '路径问题：符号链接可能导致路径解析问题',
                    'peer dependencies：可能出现依赖解析错误',
                    '构建工具：某些构建工具不支持符号链接',
                    'Docker：容器中符号链接可能失效',
                    'CI/CD：不适合CI环境使用'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'npm link替代方案对比',
            content: {
                description: '根据不同场景，有多种npm link的替代方案可供选择。',
                items: [
                    {
                        name: 'npm link',
                        pros: [
                            '简单快速：两条命令即可',
                            '实时更新：修改立即生效',
                            '无需配置：开箱即用'
                        ],
                        cons: [
                            'Windows问题：权限和兼容性',
                            '路径问题：符号链接路径',
                            '全局污染：在全局创建链接'
                        ]
                    },
                    {
                        name: 'Workspaces',
                        pros: [
                            '自动化：无需手动link',
                            '配置简单：一次配置',
                            '官方支持：npm/yarn/pnpm原生',
                            '适合Monorepo：大型项目首选'
                        ],
                        cons: [
                            '项目结构：需要重组项目',
                            '学习成本：需要理解workspaces',
                            '不灵活：只适合内部包'
                        ]
                    },
                    {
                        name: 'yalc',
                        pros: [
                            '无符号链接：复制文件',
                            '更真实：模拟真实安装',
                            '跨包开发：支持独立包',
                            '版本管理：可以管理多版本'
                        ],
                        cons: [
                            '需要安装：额外工具',
                            '不实时：需要push/update',
                            '手动同步：修改后要push'
                        ]
                    },
                    {
                        name: 'file: protocol',
                        pros: [
                            '简单直接：直接引用本地路径',
                            '无需工具：package.json配置',
                            '符号链接：类似npm link'
                        ],
                        cons: [
                            '路径硬编码：不同机器路径不同',
                            'Git问题：绝对路径不能提交',
                            '不灵活：每次改路径'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yalc替代npm link',
            content: {
                description: 'yalc是npm link的优秀替代方案，通过本地仓库实现包的开发和测试。',
                examples: [
                    {
                        title: 'yalc基本用法',
                        code: `# 安装yalc
npm install -g yalc

# 1. 在包目录发布到本地仓库
cd /path/to/my-utils
yalc publish

# 2. 在项目中添加本地包
cd /path/to/my-app
yalc add my-utils

# 3. 修改包后推送更新
cd /path/to/my-utils
# 修改代码...
yalc push  # 推送到所有使用的项目

# 4. 项目中更新包
cd /path/to/my-app
yalc update my-utils

# 5. 开发完成后移除
yalc remove my-utils
npm install my-utils`,
                        notes: 'yalc通过复制避免符号链接问题'
                    },
                    {
                        title: 'yalc + watch自动推送',
                        code: `# 在包目录开启watch模式
cd /path/to/my-utils
yalc publish --watch

# 每次保存文件，自动push到使用的项目
# 配合nodemon等工具可实现自动重启`,
                        notes: 'watch模式接近npm link的体验'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'file:协议本地引用',
            content: {
                description: 'package.json支持file:协议直接引用本地包，适合简单场景。',
                examples: [
                    {
                        title: '使用file:协议',
                        code: `// package.json
{
  "dependencies": {
    // 相对路径
    "my-utils": "file:../my-utils",
    
    // 绝对路径（不推荐）
    "my-other-utils": "file:/path/to/my-other-utils"
  }
}

# 安装依赖（会创建符号链接）
npm install

# 修改my-utils代码会立即生效`,
                        notes: 'file:协议类似npm link但不需要全局链接'
                    },
                    {
                        title: 'file:协议的问题',
                        code: `# 问题1：路径硬编码
# 不同开发者机器上的路径可能不同

# 问题2：不能提交到Git
# file:../my-utils会导致CI失败

# 解决方案：使用环境变量或脚本
{
  "dependencies": {
    "my-utils": "file:$/{MY_UTILS_PATH}"
  }
}

# 或在开发时使用，发布时替换
npm install --save file:../my-utils  # 开发
npm install --save my-utils@^1.0.0   # 发布前`,
                        notes: 'file:适合临时开发，不适合团队协作'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '本地包开发最佳实践',
            content: {
                description: '根据项目规模和团队情况，选择合适的本地开发方案。',
                keyPoints: [
                    '单包开发：npm link或yalc',
                    'Monorepo：使用pnpm/yarn/npm workspaces',
                    '跨仓库开发：yalc是最佳选择',
                    '临时调试：file:协议快速测试',
                    'Windows开发：避免npm link，使用yalc',
                    'CI/CD：使用实际版本，不用link',
                    '文档说明：在README中说明本地开发方式',
                    '定期发布：避免长期依赖link'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第9章：依赖版本管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=09'
        },
        next: {
            title: '第11章：发布npm包',
            url: './render.html?subject=pkg-manager&type=content&chapter=11'
        }
    }
};
