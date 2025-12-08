/**
 * 第7章：npm常用命令
 * 深入理解npm install/ci、update、uninstall、outdated、view等核心命令
 */

window.content = {
    section: {
        title: '第7章：npm常用命令',
        icon: '⌨️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'npm命令体系',
            content: {
                description: 'npm提供了丰富的命令行工具，涵盖包安装、管理、发布、查询等全生命周期操作。',
                keyPoints: [
                    '包管理：install、uninstall、update、outdated',
                    '包查询：view、search、ls、audit',
                    '脚本执行：run、test、start',
                    '发布管理：publish、unpublish、deprecate',
                    '配置管理：config、init',
                    '工具命令：doctor、cache、link'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/commands'
            }
        },
        
        {
            type: 'code-example',
            title: 'npm install详解',
            content: {
                description: 'npm install是最常用的命令，支持多种参数和场景，理解各种用法很重要。',
                examples: [
                    {
                        title: '基础安装命令',
                        code: `# 安装package.json中的所有依赖
npm install
npm i  # 简写

# 安装单个包
npm install lodash
npm install lodash@4.17.21  # 指定版本
npm install lodash@latest   # 最新版本

# 安装多个包
npm install lodash axios express

# 安装并保存到dependencies（默认）
npm install lodash --save
npm install lodash -S

# 安装到devDependencies
npm install eslint --save-dev
npm install eslint -D

# 全局安装
npm install -g typescript`,
                        notes: 'npm 5+默认--save，会自动写入package.json'
                    },
                    {
                        title: '安装参数详解',
                        code: `# 生产模式（不安装devDependencies）
npm install --production
npm install --omit=dev

# 强制重新安装
npm install --force

# 离线模式（使用缓存）
npm install --offline

# 忽略脚本
npm install --ignore-scripts

# 仅安装（不执行生命周期脚本）
npm install --install-strategy=shallow

# 不生成package-lock.json
npm install --no-package-lock

# 严格的peerDependencies检查
npm install --legacy-peer-deps=false`,
                        notes: '根据场景选择合适的参数'
                    },
                    {
                        title: '从不同来源安装',
                        code: `# 从GitHub安装
npm install user/repo
npm install user/repo#branch
npm install user/repo#v1.0.0

# 从Git URL安装
npm install git+https://github.com/user/repo.git
npm install git+ssh://git@github.com:user/repo.git

# 从本地文件安装
npm install ./path/to/package
npm install file:../my-package

# 从tarball安装
npm install https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz
npm install ./package.tgz`,
                        notes: '支持多种包来源'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'npm install vs npm ci',
            content: {
                description: 'npm ci是npm 5.7+引入的命令，专为CI/CD环境设计，与npm install有重要区别。',
                items: [
                    {
                        name: 'npm install',
                        pros: [
                            '灵活：可以安装单个包或所有依赖',
                            '自动更新：根据版本范围安装最新符合的版本',
                            '生成lock：会更新package-lock.json',
                            '适合开发：日常开发使用'
                        ],
                        cons: [
                            '不确定性：不同时间安装可能得到不同版本',
                            '速度较慢：需要解析版本范围',
                            '可能冲突：lock文件可能与package.json不一致'
                        ]
                    },
                    {
                        name: 'npm ci',
                        pros: [
                            '确定性：严格按照lock文件安装',
                            '速度快：跳过版本解析，直接安装',
                            '清理环境：自动删除node_modules后重新安装',
                            '适合CI：保证构建环境一致性'
                        ],
                        cons: [
                            '严格要求：lock文件必须存在且与package.json一致',
                            '不能安装单包：只能安装全部依赖',
                            '不更新lock：不会修改package-lock.json'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm ci详解',
            content: {
                description: 'npm ci是CI/CD环境的首选命令，确保构建的一致性和可重复性。',
                examples: [
                    {
                        title: 'npm ci使用',
                        code: `# 使用npm ci安装依赖
npm ci

# npm ci的行为：
# 1. 检查package-lock.json是否存在
# 2. 检查package.json和lock文件是否一致
# 3. 删除整个node_modules目录
# 4. 根据lock文件安装确切版本
# 5. 不更新lock文件

# CI/CD脚本中使用
jobs:
  build:
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci  # 而不是npm install
      - name: Build
        run: npm run build`,
                        notes: 'CI环境必须使用npm ci而不是npm install'
                    },
                    {
                        title: 'npm ci失败场景',
                        code: `# 场景1：package-lock.json不存在
$ npm ci
npm ERR! The \`npm ci\` command can only install with an existing package-lock.json

# 场景2：lock文件与package.json不一致
$ npm ci
npm ERR! \`package-lock.json\` does not match \`package.json\`
npm ERR! Please update your lock file with \`npm install\` before continuing.

# 解决方法：
npm install  # 更新lock文件
npm ci       # 然后使用ci`,
                        notes: 'npm ci对环境要求严格，确保一致性'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm update更新依赖',
            content: {
                description: 'npm update命令用于更新项目依赖到符合版本范围的最新版本，同时更新lock文件。',
                mechanism: 'npm update读取package.json中的版本范围（如^1.2.3），查找符合条件的最新版本，安装并更新package-lock.json。不会跨越主版本号更新。',
                keyPoints: [
                    '尊重semver：^1.2.3只更新到1.x的最新版',
                    '更新lock：同时更新package-lock.json',
                    '指定包：npm update lodash更新单个包',
                    '全局更新：npm update -g更新全局包',
                    '不跨主版本：不会从1.x更新到2.x',
                    '使用npm outdated查看可更新的包'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm update与outdated',
            content: {
                description: 'npm update和npm outdated配合使用，可以安全地更新依赖。',
                examples: [
                    {
                        title: 'npm outdated查看过时包',
                        code: `# 查看所有可更新的包
npm outdated

# 输出示例：
Package     Current  Wanted  Latest  Location
lodash      4.17.20  4.17.21 4.17.21 node_modules/lodash
react       17.0.2   17.0.2  18.2.0  node_modules/react

# Current: 当前安装的版本
# Wanted: 满足package.json中版本范围的最新版本
# Latest: npm registry中的最新版本
# Location: 包的安装位置`,
                        notes: 'outdated显示当前版本、期望版本和最新版本'
                    },
                    {
                        title: 'npm update更新包',
                        code: `# 更新所有包到Wanted版本
npm update

# 更新单个包
npm update lodash

# 更新到Latest版本（需手动修改package.json）
npm install lodash@latest --save

# 全局包更新
npm update -g
npm update -g typescript

# 更新到指定版本
npm update lodash@4.17.21`,
                        notes: 'update只更新到Wanted版本，不跨主版本'
                    },
                    {
                        title: '使用npm-check-updates跨版本更新',
                        code: `# 安装ncu
npm install -g npm-check-updates

# 查看可更新的包（包括跨主版本）
ncu

# 更新package.json到最新版本
ncu -u

# 然后安装新版本
npm install

# 交互式选择要更新的包
ncu -i

# 只更新minor和patch版本
ncu --target minor`,
                        notes: 'ncu可以跨主版本更新，但要注意破坏性变更'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm uninstall卸载包',
            content: {
                description: '卸载不需要的包可以减小项目体积，npm uninstall会同时更新package.json和lock文件。',
                examples: [
                    {
                        title: 'npm uninstall用法',
                        code: `# 卸载包（自动从package.json移除）
npm uninstall lodash
npm un lodash      # 简写
npm remove lodash  # 别名
npm rm lodash      # 简写

# 卸载多个包
npm uninstall lodash axios express

# 卸载devDependencies的包
npm uninstall eslint --save-dev
npm uninstall eslint -D

# 卸载全局包
npm uninstall -g typescript

# 只删除node_modules，不修改package.json
rm -rf node_modules/lodash`,
                        notes: 'npm uninstall会同步更新配置文件'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm view查看包信息',
            content: {
                description: 'npm view可以查看npm registry中包的详细信息，无需下载安装。',
                examples: [
                    {
                        title: 'npm view基本用法',
                        code: `# 查看包的所有信息
npm view lodash
npm info lodash  # 别名

# 查看特定字段
npm view lodash version          # 当前版本
npm view lodash versions         # 所有版本
npm view lodash description      # 描述
npm view lodash dependencies     # 依赖列表
npm view lodash dist.tarball     # 下载地址
npm view lodash repository.url   # 仓库地址

# 查看特定版本
npm view lodash@4.17.20

# 查看最新版本
npm view lodash@latest version

# JSON格式输出
npm view lodash --json`,
                        notes: 'view可以在安装前查看包信息'
                    },
                    {
                        title: '查看发布历史',
                        code: `# 查看所有版本
npm view lodash versions

# 查看最近的版本
npm view lodash versions --json | tail -n 20

# 查看发布时间
npm view lodash time

# 查看特定版本的发布时间
npm view lodash@4.17.21 time

# 查看维护者
npm view lodash maintainers`,
                        notes: '了解包的发布历史和维护状态'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm ls查看依赖树',
            content: {
                description: 'npm ls显示当前项目的依赖树结构，帮助理解依赖关系。',
                examples: [
                    {
                        title: 'npm ls用法',
                        code: `# 查看完整依赖树
npm ls

# 只显示顶层依赖
npm ls --depth=0

# 只显示生产依赖
npm ls --prod
npm ls --omit=dev

# 只显示开发依赖
npm ls --dev

# 查看特定包
npm ls lodash

# 查看全局包
npm ls -g --depth=0

# JSON格式输出
npm ls --json`,
                        notes: 'ls可以检查依赖安装情况'
                    },
                    {
                        title: '检查依赖问题',
                        code: `# 查看未满足的peerDependencies
npm ls

# 输出示例：
├── UNMET PEER DEPENDENCY react@>=16.8.0
└── my-package@1.0.0

# 查找重复安装的包
npm ls lodash
└─┬ dependency-a
  └── lodash@4.17.20
└─┬ dependency-b
  └── lodash@4.17.21  # 两个版本

# 使用npm dedupe去重
npm dedupe`,
                        notes: 'ls可以发现依赖冲突和重复'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm search搜索包',
            content: {
                description: 'npm search在registry中搜索包，找到合适的工具库。',
                examples: [
                    {
                        title: 'npm search用法',
                        code: `# 搜索包
npm search lodash
npm s lodash  # 简写

# 搜索多个关键词
npm search react components

# 限制结果数量
npm search lodash --searchlimit=10

# JSON格式
npm search lodash --json

# 更推荐使用网站搜索
# https://www.npmjs.com/search?q=lodash`,
                        notes: '命令行搜索功能有限，推荐使用网站'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm audit安全审计',
            content: {
                description: 'npm audit扫描项目依赖中的已知安全漏洞，并提供修复建议。',
                mechanism: 'npm audit将依赖列表发送到npm registry的安全数据库，对比已知漏洞，返回风险等级和修复方案。',
                keyPoints: [
                    '自动扫描：npm install时自动运行audit',
                    '漏洞等级：low、moderate、high、critical',
                    '自动修复：npm audit fix尝试自动修复',
                    '强制修复：npm audit fix --force可能破坏兼容性',
                    '忽略漏洞：通过.npmrc配置audit-level',
                    '定期检查：定期运行audit确保安全'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm audit使用',
            content: {
                description: 'npm audit是保障项目安全的重要工具，应该定期运行。',
                examples: [
                    {
                        title: 'npm audit基本用法',
                        code: `# 运行安全审计
npm audit

# 输出示例：
found 3 vulnerabilities (1 moderate, 2 high) in 1200 scanned packages
  run \`npm audit fix\` to fix 2 of them.
  1 vulnerability requires manual review.

# 详细输出
npm audit --audit-level=moderate

# JSON格式
npm audit --json

# 只显示生产依赖的漏洞
npm audit --production`,
                        notes: 'audit显示漏洞数量和严重程度'
                    },
                    {
                        title: 'npm audit fix修复',
                        code: `# 自动修复（安全的更新）
npm audit fix

# 查看修复计划（不实际修复）
npm audit fix --dry-run

# 强制修复（可能破坏兼容性）
npm audit fix --force

# 只修复生产依赖
npm audit fix --production

# 修复后重新审计
npm audit fix
npm audit`,
                        notes: 'fix会更新依赖到修复漏洞的版本'
                    },
                    {
                        title: '配置audit行为',
                        code: `# .npmrc配置
# 设置audit等级阈值
audit-level=moderate  # 只报告moderate及以上

# 跳过audit
audit=false

# 命令行参数
npm install --audit=false       # 安装时跳过audit
npm install --audit-level=high  # 只报告high及以上`,
                        notes: '可以配置audit的敏感度'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'npm命令最佳实践',
            content: {
                description: '掌握npm命令的最佳实践可以提升开发效率和项目质量。',
                keyPoints: [
                    'CI/CD使用npm ci：确保构建一致性',
                    '定期运行npm outdated：及时了解可更新的包',
                    '谨慎使用npm update：注意破坏性变更',
                    '定期运行npm audit：保障安全',
                    '使用npm ls检查：发现依赖冲突',
                    '使用npm view：安装前查看包信息',
                    '使用--production：生产构建时减少依赖',
                    '善用缓存：离线开发使用--offline'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第6章：package.json详解',
            url: './render.html?subject=pkg-manager&type=content&chapter=06'
        },
        next: {
            title: '第8章：npm scripts脚本',
            url: './render.html?subject=pkg-manager&type=content&chapter=08'
        }
    }
};
