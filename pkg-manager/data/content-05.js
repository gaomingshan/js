/**
 * 第5章：npm安装与配置
 * Node.js安装、版本管理工具（nvm/n/fnm）、npm配置优先级
 */

window.content = {
    section: {
        title: '第5章：npm安装与配置',
        icon: '⚙️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Node.js与npm的关系',
            content: {
                description: 'npm是Node.js的默认包管理器，随Node.js一起安装。理解两者的关系是掌握npm的第一步。',
                keyPoints: [
                    'npm随Node.js自动安装，无需单独安装',
                    'Node.js版本与npm版本对应关系',
                    'npm可以独立升级，不依赖Node.js升级',
                    'npx是npm 5.2+自带的包执行工具',
                    'Node.js LTS版本推荐用于生产环境',
                    'Current版本包含最新特性，适合尝鲜'
                ],
                mdn: 'https://nodejs.org/zh-cn/download/'
            }
        },
        
        {
            type: 'code-example',
            title: 'Node.js安装方式',
            content: {
                description: 'Node.js有多种安装方式，根据操作系统和使用场景选择合适的方法。',
                examples: [
                    {
                        title: '官网下载安装（Windows/macOS）',
                        code: `# 访问官网下载安装包
https://nodejs.org/

# 下载LTS版本（推荐）
# 或Current版本（最新特性）

# 安装后验证
node -v   # 查看Node.js版本
npm -v    # 查看npm版本`,
                        notes: '最简单直接的方式，适合初学者'
                    },
                    {
                        title: 'Linux包管理器安装',
                        code: `# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# macOS（使用Homebrew）
brew install node

# 验证安装
node -v && npm -v`,
                        notes: '适合Linux服务器和开发环境'
                    },
                    {
                        title: '使用nvm管理多版本（推荐）',
                        code: `# macOS/Linux安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows使用nvm-windows
# 下载安装包：https://github.com/coreybutler/nvm-windows

# 安装Node.js
nvm install 18.17.0      # 安装指定版本
nvm install --lts        # 安装最新LTS
nvm install node         # 安装最新版本

# 切换版本
nvm use 18.17.0

# 查看已安装版本
nvm ls

# 设置默认版本
nvm alias default 18.17.0`,
                        notes: 'nvm允许在同一机器上管理多个Node.js版本'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Node.js版本管理工具对比',
            content: {
                description: '常用的Node.js版本管理工具有nvm、n、fnm等，各有特点和适用场景。',
                items: [
                    {
                        name: 'nvm（Node Version Manager）',
                        pros: [
                            '功能最完善，社区最大',
                            '支持.nvmrc文件自动切换版本',
                            'Windows有专门的nvm-windows版本',
                            '文档丰富，问题容易解决'
                        ],
                        cons: [
                            '启动稍慢（需要加载shell脚本）',
                            'Windows版本与Unix版本不完全一致',
                            '每次打开终端都需要加载'
                        ]
                    },
                    {
                        name: 'n（tj的版本管理器）',
                        pros: [
                            '极其简洁，安装和使用都很简单',
                            '不需要shell脚本，原生实现',
                            '切换版本速度快',
                            '无需配置环境变量'
                        ],
                        cons: [
                            '只支持macOS和Linux',
                            '功能相对简单',
                            '不支持.nvmrc等项目配置文件'
                        ]
                    },
                    {
                        name: 'fnm（Fast Node Manager）',
                        pros: [
                            'Rust编写，速度最快',
                            '跨平台支持（包括Windows）',
                            '支持.node-version和.nvmrc',
                            '自动切换版本（目录切换时）',
                            '完全兼容nvm命令'
                        ],
                        cons: [
                            '相对较新，社区规模小',
                            '某些边缘场景可能有bug'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'nvm常用命令详解',
            content: {
                description: 'nvm是最流行的Node.js版本管理工具，掌握常用命令可以高效管理多个版本。',
                examples: [
                    {
                        title: '安装和切换版本',
                        code: `# 列出可用的Node.js版本
nvm ls-remote           # macOS/Linux
nvm list available      # Windows

# 安装指定版本
nvm install 18.17.0
nvm install 20.5.0

# 安装最新LTS
nvm install --lts
nvm install lts/hydrogen  # 安装指定代号的LTS

# 使用特定版本
nvm use 18.17.0

# 临时使用某版本运行命令
nvm run 20.5.0 app.js

# 执行某版本的npm
nvm exec 18.17.0 npm install`,
                        notes: 'nvm允许灵活切换和测试不同版本'
                    },
                    {
                        title: '版本管理和别名',
                        code: `# 查看已安装版本
nvm ls

# 查看当前使用版本
nvm current

# 设置默认版本（新终端使用）
nvm alias default 18.17.0

# 创建自定义别名
nvm alias my-project 18.17.0
nvm use my-project

# 删除别名
nvm unalias my-project

# 卸载某个版本
nvm uninstall 16.14.0`,
                        notes: '使用别名可以更直观地管理项目版本'
                    },
                    {
                        title: '.nvmrc项目配置',
                        code: `# 在项目根目录创建.nvmrc文件
echo "18.17.0" > .nvmrc

# 或指定LTS版本
echo "lts/hydrogen" > .nvmrc

# 自动使用.nvmrc指定的版本
nvm use

# 安装.nvmrc指定的版本
nvm install

# 配合shell自动切换（添加到.bashrc或.zshrc）
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc`,
                        notes: '.nvmrc确保团队使用统一的Node.js版本'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm配置系统',
            content: {
                description: 'npm有一套完整的配置系统，支持多级配置，理解配置优先级对于管理复杂项目至关重要。',
                mechanism: 'npm配置采用分层设计，从低到高依次为：内置默认值、全局配置、用户配置、项目配置、命令行参数。高优先级配置覆盖低优先级配置。',
                keyPoints: [
                    '1. 内置默认值（最低优先级）：npm源码中的默认配置',
                    '2. 全局配置：$PREFIX/etc/npmrc（如/usr/local/etc/npmrc）',
                    '3. 用户配置：~/.npmrc（用户主目录）',
                    '4. 项目配置：项目根目录/.npmrc（最高优先级）',
                    '5. 命令行参数：--registry等参数直接覆盖配置',
                    '环境变量：npm_config_xxx形式的环境变量',
                    '配置继承：低优先级配置提供默认值，高优先级配置覆盖'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm config命令详解',
            content: {
                description: 'npm config命令用于查看和修改npm配置，是管理npm配置的主要工具。',
                examples: [
                    {
                        title: '查看配置',
                        code: `# 查看所有配置（包括默认值）
npm config list

# 查看所有配置（详细格式）
npm config list -l

# 查看所有配置（JSON格式）
npm config list --json

# 查看特定配置
npm config get registry
npm config get proxy

# 查看配置来源
npm config get registry --location`,
                        notes: '了解当前npm的完整配置状态'
                    },
                    {
                        title: '设置配置',
                        code: `# 设置用户级配置（默认）
npm config set registry https://registry.npmmirror.com

# 设置全局配置
npm config set registry https://registry.npmmirror.com --location=global

# 设置项目配置（当前目录的.npmrc）
npm config set registry https://registry.npmmirror.com --location=project

# 删除配置
npm config delete registry

# 批量设置
npm config set init-author-name "Your Name"
npm config set init-author-email "you@example.com"
npm config set init-license "MIT"`,
                        notes: '使用--location指定配置级别'
                    },
                    {
                        title: '常用配置项',
                        code: `# registry相关
npm config set registry https://registry.npmmirror.com

# 代理设置
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 缓存相关
npm config set cache /path/to/cache
npm config set cache-min 9999999  # 优先使用缓存

# 安装行为
npm config set save-exact true    # 精确版本
npm config set package-lock false # 禁用lock文件

# 日志级别
npm config set loglevel silly     # 最详细
npm config set loglevel error     # 只显示错误

# 编辑配置文件
npm config edit           # 用户级
npm config edit --global  # 全局级`,
                        notes: '根据需求配置npm行为'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '.npmrc文件详解',
            content: {
                description: '.npmrc是npm的配置文件，可以放在不同位置实现不同级别的配置，是团队协作的重要工具。',
                mechanism: 'npm启动时会按优先级顺序读取多个.npmrc文件，合并配置。项目级.npmrc通常提交到Git，确保团队统一配置。',
                keyPoints: [
                    '项目.npmrc：项目根目录，提交到Git，团队共享',
                    '用户.npmrc：~/.npmrc，个人配置，不提交',
                    '全局.npmrc：系统级配置，影响所有用户',
                    '认证信息：使用环境变量而非明文存储',
                    '作用域配置：为不同@scope配置不同registry',
                    'ini格式：key=value格式，支持注释'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '项目级.npmrc最佳实践',
            content: {
                description: '项目级.npmrc是团队协作的关键，合理配置可以避免很多问题。',
                examples: [
                    {
                        title: '典型的项目.npmrc',
                        code: `# .npmrc（项目根目录）
# 公共包使用淘宝镜像加速
registry=https://registry.npmmirror.com

# 公司私有包使用私有registry
@company:registry=http://registry.company.com

# 认证信息使用环境变量
//registry.company.com/:_authToken=\${NPM_TOKEN}

# 安装配置
save-exact=true              # 使用精确版本
package-lock=true            # 必须生成lock文件
engine-strict=true           # 严格检查Node版本

# 安全配置
audit-level=moderate         # audit时的告警级别

# 不要将npm-debug.log提交
# 添加到.gitignore`,
                        notes: '提交到Git，团队共享配置'
                    },
                    {
                        title: '多源配置示例',
                        code: `# .npmrc - 混合使用多个registry
# 默认使用淘宝镜像
registry=https://registry.npmmirror.com

# 公司内部包
@company:registry=http://registry.company.com
//registry.company.com/:_authToken=\${COMPANY_NPM_TOKEN}

# 某些特定包使用官方源
@types:registry=https://registry.npmjs.org

# GitHub packages
@github:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`,
                        notes: '不同来源的包使用不同registry'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm独立升级',
            content: {
                description: 'npm可以独立于Node.js升级，获取最新功能和性能优化，而无需升级Node.js。',
                mechanism: 'npm作为Node.js的一个全局包安装，可以通过npm自己来升级。升级npm不会影响Node.js版本。',
                keyPoints: [
                    'npm可以独立升级到最新版本',
                    '使用npm install -g npm@latest升级',
                    '升级npm不影响Node.js版本',
                    'Windows可能需要管理员权限',
                    'nvm环境下每个Node版本有独立的npm',
                    '建议定期更新npm获取安全修复'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm升级与降级',
            content: {
                description: 'npm可以升级到最新版本或降级到特定版本，满足不同项目需求。',
                examples: [
                    {
                        title: 'npm升级',
                        code: `# 查看当前npm版本
npm -v

# 升级到最新版本
npm install -g npm@latest

# 升级到最新LTS版本
npm install -g npm@lts

# 升级到特定版本
npm install -g npm@9.8.0

# Windows可能需要使用npm-windows-upgrade
npm install -g npm-windows-upgrade
npm-windows-upgrade`,
                        notes: 'Windows升级npm可能遇到权限问题'
                    },
                    {
                        title: 'npm降级',
                        code: `# 降级到特定版本
npm install -g npm@8.19.0

# nvm环境下为特定Node版本安装npm
nvm use 18.17.0
npm install -g npm@9.8.0

# 查看npm版本历史
npm view npm versions

# 查看npm版本信息
npm view npm@9.8.0`,
                        notes: '某些项目可能需要特定npm版本'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'npm安装与配置最佳实践',
            content: {
                description: '合理的npm安装和配置策略可以提升开发效率，减少问题。',
                keyPoints: [
                    'Node版本：使用LTS版本，通过nvm/fnm管理多版本',
                    '.nvmrc：项目中添加.nvmrc文件，锁定Node版本',
                    '项目.npmrc：配置镜像源、私有源，提交到Git',
                    '环境变量：认证token使用环境变量，不要硬编码',
                    '定期更新：定期更新Node.js和npm到最新LTS',
                    'CI/CD：在CI环境中缓存node_modules加速构建',
                    '文档说明：在README中说明Node和npm版本要求',
                    'engines字段：在package.json中指定版本范围'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第4章：registry与镜像源',
            url: './render.html?subject=pkg-manager&type=content&chapter=04'
        },
        next: {
            title: '第6章：package.json详解',
            url: './render.html?subject=pkg-manager&type=content&chapter=06'
        }
    }
};
