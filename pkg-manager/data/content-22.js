/**
 * 第22章：pnpm基础使用
 * pnpm安装配置、常用命令、pnpm-lock.yaml、迁移
 */

window.content = {
    section: {
        title: '第22章：pnpm基础使用',
        icon: '🔧'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'pnpm安装',
            content: {
                description: 'pnpm提供多种安装方式，推荐使用npm全局安装或Corepack。',
                keyPoints: [
                    'npm安装：npm install -g pnpm',
                    'Corepack：Node.js 16.13+内置',
                    '独立脚本：curl安装',
                    'Homebrew：brew install pnpm',
                    '版本管理：pnpm env',
                    '全局命令：pnpm可执行文件',
                    '升级：pnpm add -g pnpm'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm安装方式',
            content: {
                description: '选择合适的安装方式快速开始使用pnpm。',
                examples: [
                    {
                        title: '各种安装方式',
                        code: `# 方式1：使用npm（推荐）
npm install -g pnpm

# 方式2：使用Corepack（Node 16.13+）
corepack enable
corepack prepare pnpm@latest --activate

# 方式3：使用Homebrew（macOS）
brew install pnpm

# 方式4：使用脚本（Unix）
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 方式5：使用PowerShell（Windows）
iwr https://get.pnpm.io/install.ps1 -useb | iex

# 方式6：使用npm（仅当前项目）
npm install -D pnpm
npx pnpm install

# 验证安装
pnpm --version`,
                        notes: 'Corepack是官方推荐的方式'
                    },
                    {
                        title: '升级pnpm',
                        code: `# 升级到最新版
pnpm add -g pnpm

# 升级到指定版本
pnpm add -g pnpm@8.10.0

# 查看当前版本
pnpm --version

# 查看可用版本
npm view pnpm versions --json`,
                        notes: 'pnpm可以自己升级自己'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm配置',
            content: {
                description: 'pnpm的配置方式类似npm，但有一些独特的选项。',
                examples: [
                    {
                        title: '基本配置',
                        code: `# 查看所有配置
pnpm config list

# 设置镜像源
pnpm config set registry https://registry.npmmirror.com

# 查看store位置
pnpm store path
# 默认：~/.pnpm-store

# 设置store位置（不推荐修改）
pnpm config set store-dir /path/to/store

# 设置全局bin目录
pnpm config set global-bin-dir ~/pnpm-global

# 设置全局包目录
pnpm config set global-dir ~/pnpm-global

# 删除配置
pnpm config delete registry`,
                        notes: '配置保存在~/.npmrc'
                    },
                    {
                        title: '.npmrc配置文件',
                        code: `# 项目根目录的.npmrc
# 镜像源
registry=https://registry.npmmirror.com

# 严格peer依赖
strict-peer-dependencies=true

# 自动安装peer依赖
auto-install-peers=true

# shamefully-hoist（兼容性）
shamefully-hoist=false

# public-hoist-pattern
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# 锁文件设置
lockfile=true

# 子目录可以有自己的.npmrc`,
                        notes: 'pnpm读取.npmrc配置'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm基本命令',
            content: {
                description: 'pnpm命令与npm类似，大部分可以无缝切换。',
                examples: [
                    {
                        title: '初始化和安装',
                        code: `# 初始化项目
pnpm init

# 安装所有依赖
pnpm install
# 或简写
pnpm i

# 添加依赖
pnpm add lodash
pnpm add react react-dom

# 添加开发依赖
pnpm add -D typescript

# 添加可选依赖
pnpm add -O fsevents

# 添加全局包
pnpm add -g typescript

# 安装指定版本
pnpm add lodash@4.17.21

# 安装版本范围
pnpm add lodash@^4.0.0`,
                        notes: 'pnpm add类似npm install'
                    },
                    {
                        title: '移除和更新',
                        code: `# 移除依赖
pnpm remove lodash
pnpm rm lodash  # 简写

# 移除多个
pnpm remove lodash axios

# 更新依赖
pnpm update
pnpm up  # 简写

# 更新到最新版本
pnpm update --latest
pnpm up -L

# 更新特定包
pnpm update lodash

# 交互式更新
pnpm update --interactive
pnpm up -i`,
                        notes: 'pnpm update遵循版本范围'
                    },
                    {
                        title: '运行scripts',
                        code: `// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest"
  }
}

# 运行scripts
pnpm run dev
pnpm dev  # 简写（自定义脚本）

# 内置命令不需要run
pnpm test
pnpm start

# 列出所有scripts
pnpm run

# 传递参数
pnpm test -- --coverage
pnpm run build -- --mode production`,
                        notes: 'pnpm run类似npm run'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'pnpm-lock.yaml详解',
            content: {
                description: 'pnpm使用YAML格式的lockfile，比JSON更易读，包含完整的依赖关系图。',
                mechanism: 'pnpm-lock.yaml记录每个包的版本、解析地址、依赖关系、完整性校验，确保安装的确定性和可重复性。',
                keyPoints: [
                    'YAML格式：人类可读',
                    'lockfileVersion：格式版本',
                    'importers：项目/workspace信息',
                    'packages：所有依赖详情',
                    'resolution：解析信息',
                    'integrity：SHA-512校验',
                    '必须提交：Git版本控制'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm-lock.yaml结构',
            content: {
                description: 'pnpm-lock.yaml的格式清晰，易于理解和审查。',
                examples: [
                    {
                        title: 'pnpm-lock.yaml示例',
                        code: `# pnpm-lock.yaml
lockfileVersion: '6.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:
  .:  # 根项目
    dependencies:
      lodash:
        specifier: ^4.17.21
        version: 4.17.21
      react:
        specifier: ^18.2.0
        version: 18.2.0
    devDependencies:
      typescript:
        specifier: ^5.0.0
        version: 5.0.4

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4g...}
    dev: false
  
  /react@18.2.0:
    resolution: {integrity: sha512-/3IjMdb2L9QbBdWiW5e3P2...}
    dependencies:
      loose-envify: 1.4.0
    dev: false
  
  /loose-envify@1.4.0:
    resolution: {integrity: sha512-lyuxPGr/Wfhrlem2CL/...}
    hasBin: true
    dev: false`,
                        notes: 'YAML格式比JSON更易读'
                    },
                    {
                        title: 'lockfile字段说明',
                        code: `# lockfileVersion
# 锁文件格式版本，pnpm 8使用6.0

# importers
# 项目和workspaces的依赖声明
# specifier: package.json中的版本范围
# version: 实际安装的版本

# packages
# 所有包的详细信息
# resolution: 完整性哈希和来源
# dependencies: 该包的依赖
# dev: 是否为开发依赖
# hasBin: 是否有可执行文件

# peerDependencies
# peer依赖信息`,
                        notes: '理解结构有助于调试问题'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '从npm/yarn迁移到pnpm',
            content: {
                description: 'pnpm完全兼容npm生态，迁移非常简单。',
                examples: [
                    {
                        title: '迁移步骤',
                        code: `# 1. 安装pnpm
npm install -g pnpm

# 2. 删除旧的lock文件和node_modules
rm -rf node_modules package-lock.json yarn.lock

# 3. 使用pnpm安装
pnpm install

# 4. 测试项目
pnpm test
pnpm build

# 5. 提交新的lock文件
git add pnpm-lock.yaml
git commit -m "chore: migrate to pnpm"

# 6. 更新CI配置（如果有）
# .github/workflows/ci.yml
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8
    
- name: Install dependencies
  run: pnpm install --frozen-lockfile`,
                        notes: '迁移通常无需修改代码'
                    },
                    {
                        title: '导入现有lock文件',
                        code: `# pnpm可以导入npm/yarn的lock文件

# 从package-lock.json导入
pnpm import

# 从yarn.lock导入
pnpm import

# pnpm会读取现有lock文件，生成pnpm-lock.yaml
# 尽可能保持版本一致

# 之后删除旧lock文件
rm package-lock.json yarn.lock`,
                        notes: 'pnpm import简化迁移'
                    },
                    {
                        title: '可能遇到的问题',
                        code: `# 问题1：发现幽灵依赖
# 现象：代码报错，找不到某个模块
# 原因：之前使用了未声明的依赖
# 解决：显式添加到package.json
pnpm add missing-package

# 问题2：peer依赖警告
# 现象：WARN  unmet peer dependency
# 解决：安装peer依赖或配置auto-install-peers
pnpm config set auto-install-peers true

# 问题3：某些包不兼容严格模式
# 解决：使用shamefully-hoist（不推荐）
# .npmrc
shamefully-hoist=true

# 或只提升特定包
public-hoist-pattern[]=*problematic-package*

# 问题4：全局包路径
# pnpm的全局bin路径可能不在PATH中
pnpm setup  # 自动配置PATH`,
                        notes: '迁移时可能暴露隐藏问题'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm store管理',
            content: {
                description: 'pnpm提供命令管理全局store。',
                examples: [
                    {
                        title: 'store命令',
                        code: `# 查看store路径
pnpm store path

# 查看store状态
pnpm store status

# 清理未使用的包
pnpm store prune

# 验证store完整性
pnpm store verify

# 查看store大小
du -sh $(pnpm store path)

# 场景：升级pnpm后，清理旧版本的缓存
pnpm store prune`,
                        notes: 'store通常无需手动管理'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pnpm其他实用命令',
            content: {
                description: 'pnpm提供丰富的命令满足各种需求。',
                examples: [
                    {
                        title: '信息查询',
                        code: `# 列出已安装的包
pnpm list
pnpm ls  # 简写

# 只显示顶层
pnpm list --depth=0

# 列出过时的包
pnpm outdated

# 查看包信息
pnpm view lodash
pnpm info lodash  # 别名

# 查看为什么安装了某个包
pnpm why lodash

# 查看包的所有版本
pnpm view lodash versions`,
                        notes: 'pnpm list和npm list类似'
                    },
                    {
                        title: '其他命令',
                        code: `# 执行可执行文件
pnpm exec webpack
pnpm exec -- webpack --config custom.config.js

# dlx: 下载并执行（类似npx）
pnpm dlx create-react-app my-app

# audit安全审计
pnpm audit
pnpm audit --fix

# 打包（测试发布内容）
pnpm pack

# 发布
pnpm publish

# 链接本地包
pnpm link ../my-package

# 环境管理
pnpm env use --global 18
pnpm env list`,
                        notes: 'pnpm功能全面'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'pnpm使用最佳实践',
            content: {
                description: '正确使用pnpm，充分发挥其优势。',
                keyPoints: [
                    '提交lock文件：pnpm-lock.yaml必须提交Git',
                    'CI使用frozen-lockfile：pnpm install --frozen-lockfile',
                    '全局安装工具：pnpm add -g而不是npm',
                    'store自动管理：通常无需手动清理',
                    '修复幽灵依赖：迁移时显式声明所有依赖',
                    'peer依赖配置：auto-install-peers=true',
                    '避免shamefully-hoist：尽量不开启',
                    '版本管理：使用pnpm update -i交互式升级',
                    'Monorepo首选：pnpm Workspaces性能最佳'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第21章：pnpm原理与优势',
            url: './render.html?subject=pkg-manager&type=content&chapter=21'
        },
        next: {
            title: '第23章：pnpm Workspaces',
            url: './render.html?subject=pkg-manager&type=content&chapter=23'
        }
    }
};
