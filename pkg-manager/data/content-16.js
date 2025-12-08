/**
 * 第16章：Yarn简介与特性
 * Yarn历史、核心特性、Yarn 1 vs Berry、安装配置
 */

window.content = {
    section: {
        title: '第16章：Yarn简介与特性',
        icon: '🧶'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Yarn的诞生背景',
            content: {
                description: 'Yarn由Facebook、Google、Exponent和Tilde于2016年联合推出，旨在解决npm早期版本的性能、安全性和一致性问题。',
                keyPoints: [
                    '诞生时间：2016年10月',
                    '开发者：Facebook领导，多家公司合作',
                    '初衷：解决npm v3/v4的痛点',
                    '核心问题：速度慢、不确定性、离线支持差',
                    '创新点：yarn.lock、并行安装、离线缓存',
                    '影响：推动npm改进，催生npm v5+',
                    '现状：Yarn 1稳定，Yarn Berry激进创新'
                ],
                mdn: 'https://yarnpkg.com/'
            }
        },
        
        {
            type: 'comparison',
            title: 'Yarn vs npm早期对比（2016-2017）',
            content: {
                description: 'Yarn刚推出时相比npm v3/v4有明显优势，推动了整个生态的进步。',
                items: [
                    {
                        name: 'Yarn v1（2016）',
                        pros: [
                            'yarn.lock：锁定确切版本',
                            '并行安装：显著提速',
                            '离线模式：已下载的包可离线安装',
                            '确定性：团队成员依赖完全一致',
                            '安全性：校验和验证'
                        ],
                        cons: [
                            '需要额外安装',
                            '新工具，生态不成熟'
                        ]
                    },
                    {
                        name: 'npm v3/v4（2016）',
                        pros: [
                            '官方工具，无需安装',
                            '生态成熟'
                        ],
                        cons: [
                            '无lock文件：不确定性',
                            '串行安装：速度慢',
                            '无离线支持',
                            '依赖树混乱'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Yarn的核心创新',
            content: {
                description: 'Yarn引入的多项创新成为现代包管理器的标准特性。',
                mechanism: 'Yarn通过yarn.lock锁定版本、并行网络请求、全局缓存、校验和验证等技术，实现快速、安全、确定性的依赖安装。',
                keyPoints: [
                    'yarn.lock：版本锁定文件',
                    '并行下载：充分利用网络带宽',
                    '全局缓存：~/.yarn/cache',
                    '离线镜像：--offline模式',
                    '扁平化：减少依赖重复',
                    'Workspaces：Monorepo原生支持',
                    'Plug\'n\'Play：Yarn 2+的革命性特性'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn安装与配置',
            content: {
                description: 'Yarn有多种安装方式，推荐使用Corepack（Node.js 16.10+）。',
                examples: [
                    {
                        title: 'Yarn安装方式',
                        code: `# 方式1：使用Corepack（推荐，Node 16.10+）
corepack enable
corepack prepare yarn@stable --activate

# 方式2：npm全局安装
npm install -g yarn

# 方式3：通过脚本安装（macOS/Linux）
curl -o- -L https://yarnpkg.com/install.sh | bash

# 方式4：Homebrew（macOS）
brew install yarn

# 方式5：Chocolatey（Windows）
choco install yarn

# 验证安装
yarn --version`,
                        notes: 'Corepack是官方推荐的方式'
                    },
                    {
                        title: 'Yarn配置',
                        code: `# 查看配置
yarn config list

# 设置镜像源
yarn config set registry https://registry.npmmirror.com

# 设置代理
yarn config set proxy http://proxy.example.com:8080
yarn config set https-proxy http://proxy.example.com:8080

# 全局安装目录
yarn config set prefix ~/.yarn

# 缓存目录
yarn config get cache-folder
yarn cache dir

# 离线镜像目录
yarn config set yarn-offline-mirror ./npm-packages-offline-cache

# 删除配置
yarn config delete registry`,
                        notes: '配置保存在~/.yarnrc'
                    },
                    {
                        title: '.yarnrc配置文件',
                        code: `# 项目根目录的.yarnrc
# 镜像源
registry "https://registry.npmmirror.com"

# 严格SSL
strict-ssl false

# 网络超时
network-timeout 300000

# 离线镜像
yarn-offline-mirror "./npm-packages-offline-cache"
yarn-offline-mirror-pruning true

# 扁平化
flat true`,
                        notes: '.yarnrc用于项目级配置'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Yarn 1 vs Yarn Berry',
            content: {
                description: 'Yarn有两个主要版本：Yarn Classic（v1）和Yarn Berry（v2+），两者差异巨大。',
                mechanism: 'Yarn 1（Classic）保守稳定，兼容npm生态；Yarn Berry（v2/v3/v4）激进创新，引入PnP、零安装等颠覆性特性。',
                keyPoints: [
                    'Yarn 1（Classic）：1.x版本，已进入维护模式',
                    'Yarn Berry：2.x+，持续活跃开发',
                    'PnP模式：抛弃node_modules',
                    '零安装：.yarn/cache提交Git',
                    '不兼容：Berry不完全兼容Classic',
                    '迁移成本：升级到Berry需要适配',
                    '选择：新项目推荐Berry，老项目谨慎升级'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Yarn Classic vs Berry详细对比',
            content: {
                description: 'Yarn 1和Yarn 2+是两个截然不同的工具，需要根据项目需求选择。',
                items: [
                    {
                        name: 'Yarn Classic (1.x)',
                        pros: [
                            '稳定成熟：广泛使用多年',
                            '兼容性好：与npm生态完全兼容',
                            'node_modules：传统模式',
                            '学习成本低：类似npm',
                            '工具支持好：IDE、构建工具无障碍'
                        ],
                        cons: [
                            '维护模式：不再添加新特性',
                            '性能一般：不如pnpm',
                            '幽灵依赖：存在隐式依赖问题'
                        ]
                    },
                    {
                        name: 'Yarn Berry (2+)',
                        pros: [
                            'PnP模式：极快安装速度',
                            '零安装：.yarn/cache可提交',
                            '严格依赖：无幽灵依赖',
                            '插件系统：高度可扩展',
                            'TypeScript重写：代码质量高'
                        ],
                        cons: [
                            '兼容性差：很多工具不支持PnP',
                            '学习曲线陡：概念差异大',
                            '迁移困难：需要适配代码',
                            '社区分裂：Classic用户观望'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn版本切换',
            content: {
                description: 'Yarn支持在不同版本间切换，也可以项目级指定版本。',
                examples: [
                    {
                        title: '全局切换Yarn版本',
                        code: `# 查看当前版本
yarn --version

# 切换到Yarn 1（Classic）
yarn set version classic
# 或
yarn set version 1.22.19

# 切换到Yarn 3（Berry）
yarn set version stable
# 或
yarn set version 3.6.4

# 切换到最新的Berry
yarn set version berry`,
                        notes: 'set version会下载指定版本到项目'
                    },
                    {
                        title: '项目级Yarn版本',
                        code: `# 在项目中初始化Yarn Berry
yarn set version berry

# 生成的文件：
# .yarn/releases/yarn-3.x.x.cjs  ← Yarn可执行文件
# .yarnrc.yml                     ← Yarn配置
# package.json中的packageManager字段

// package.json
{
  "packageManager": "yarn@3.6.4"
}

# 此后在该项目中运行yarn命令会自动使用指定版本
yarn install  # 使用Yarn 3.6.4`,
                        notes: 'packageManager字段锁定工具版本'
                    },
                    {
                        title: '.yarnrc.yml配置（Berry）',
                        code: `# .yarnrc.yml（Yarn Berry配置文件）
yarnPath: .yarn/releases/yarn-3.6.4.cjs

nodeLinker: pnp  # 或 node-modules

# 镜像源
npmRegistryServer: "https://registry.npmmirror.com"

# 启用全局缓存（不使用零安装）
enableGlobalCache: true

# 插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
    spec: "@yarnpkg/plugin-interactive-tools"`,
                        notes: 'Berry使用.yarnrc.yml而不是.yarnrc'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn基本使用',
            content: {
                description: 'Yarn的基本命令与npm类似但更简洁。',
                examples: [
                    {
                        title: '初始化项目',
                        code: `# 初始化项目
yarn init

# 交互式创建package.json
yarn init

# 使用默认值
yarn init -y

# 生成的package.json与npm init类似`,
                        notes: 'yarn init与npm init功能相同'
                    },
                    {
                        title: '安装依赖',
                        code: `# 安装所有依赖（读取package.json）
yarn
# 或
yarn install

# 添加依赖
yarn add lodash
yarn add react react-dom

# 添加开发依赖
yarn add -D webpack

# 添加可选依赖
yarn add -O fsevents

# 添加peer依赖
yarn add -P react

# 全局安装
yarn global add create-react-app`,
                        notes: 'yarn不需要写install'
                    },
                    {
                        title: '移除依赖',
                        code: `# 移除依赖
yarn remove lodash

# 移除多个
yarn remove lodash axios

# 全局移除
yarn global remove create-react-app`,
                        notes: '自动更新package.json和yarn.lock'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'yarn.lock文件',
            content: {
                description: 'yarn.lock是Yarn的核心创新，确保依赖安装的确定性和一致性。',
                mechanism: 'yarn.lock记录每个依赖的确切版本、解析地址和校验和，确保团队成员和CI环境安装完全相同的依赖。',
                keyPoints: [
                    '自动生成：yarn add/remove自动更新',
                    '必须提交：提交到Git',
                    '确定性：锁定确切版本',
                    '完整性：包含校验和',
                    '人类可读：易于code review',
                    '合并冲突：需要重新yarn install',
                    '不要手动编辑：让Yarn管理'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yarn.lock示例',
            content: {
                description: 'yarn.lock的格式清晰易读，包含完整的依赖信息。',
                examples: [
                    {
                        title: 'yarn.lock结构',
                        code: `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#..."
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...

react@^18.2.0:
  version "18.2.0"
  resolved "https://registry.yarnpkg.com/react/-/react-18.2.0.tgz#..."
  integrity sha512-/3IjMdb2L9QbBdWiW5e3P2/npwMBaU9mHCSCUzNln0ZCYbcfTsGbTJrU/...
  dependencies:
    loose-envify "^1.1.0"

# 格式说明：
# 包名@版本范围:
#   version: 实际安装的版本
#   resolved: 下载地址
#   integrity: SHA-512校验和
#   dependencies: 该包的依赖`,
                        notes: 'yarn.lock格式清晰，便于审查'
                    },
                    {
                        title: '处理yarn.lock冲突',
                        code: `# Git合并时yarn.lock冲突

# 方法1：保留一方的yarn.lock，重新安装
git checkout --theirs yarn.lock
yarn install

# 方法2：手动解决冲突后重新安装
# 编辑yarn.lock，解决<<<<<<< =======标记
yarn install  # 验证并规范化yarn.lock

# 方法3：删除重新生成
rm yarn.lock
yarn install

# 提交
git add yarn.lock
git commit`,
                        notes: '冲突后必须重新yarn install'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Yarn使用最佳实践',
            content: {
                description: '正确使用Yarn可以获得最佳开发体验。',
                keyPoints: [
                    '提交yarn.lock：必须提交到Git',
                    '选对版本：新项目考虑Berry，老项目用Classic',
                    'CI固定版本：package.json指定packageManager',
                    '定期更新：yarn upgrade-interactive',
                    '离线镜像：大型项目考虑启用',
                    'Workspaces：Monorepo首选Yarn',
                    '.yarnrc提交：项目配置提交Git',
                    '不混用：避免npm和yarn混用'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第15章：npm Workspaces',
            url: './render.html?subject=pkg-manager&type=content&chapter=15'
        },
        next: {
            title: '第17章：Yarn基础命令',
            url: './render.html?subject=pkg-manager&type=content&chapter=17'
        }
    }
};
