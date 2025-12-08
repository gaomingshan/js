/**
 * 第17章：Yarn基础命令
 * yarn install/add/remove、yarn.lock、命令对比
 */

window.content = {
    section: {
        title: '第17章：Yarn基础命令',
        icon: '⌨️'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'Yarn命令体系',
            content: {
                description: 'Yarn提供了简洁一致的命令行接口，大多数命令比npm更简短直观。',
                keyPoints: [
                    '简洁性：yarn而不是yarn install',
                    '一致性：add/remove而不是install/uninstall',
                    '交互式：upgrade-interactive等',
                    '工作区：workspace命令',
                    '插件：plugin命令（Berry）',
                    '脚本：run可省略',
                    '全局：global子命令'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: 'Yarn vs npm命令对比',
            content: {
                description: 'Yarn命令与npm对应，但通常更简洁。',
                items: [
                    {
                        name: '初始化',
                        pros: [
                            'npm: npm init',
                            'yarn: yarn init'
                        ]
                    },
                    {
                        name: '安装所有依赖',
                        pros: [
                            'npm: npm install',
                            'yarn: yarn 或 yarn install'
                        ]
                    },
                    {
                        name: '添加依赖',
                        pros: [
                            'npm: npm install lodash',
                            'yarn: yarn add lodash'
                        ]
                    },
                    {
                        name: '添加开发依赖',
                        pros: [
                            'npm: npm install -D webpack',
                            'yarn: yarn add -D webpack'
                        ]
                    },
                    {
                        name: '移除依赖',
                        pros: [
                            'npm: npm uninstall lodash',
                            'yarn: yarn remove lodash'
                        ]
                    },
                    {
                        name: '更新依赖',
                        pros: [
                            'npm: npm update',
                            'yarn: yarn upgrade'
                        ]
                    },
                    {
                        name: '全局安装',
                        pros: [
                            'npm: npm install -g create-react-app',
                            'yarn: yarn global add create-react-app'
                        ]
                    },
                    {
                        name: '运行脚本',
                        pros: [
                            'npm: npm run build',
                            'yarn: yarn run build 或 yarn build'
                        ]
                    },
                    {
                        name: '查看过时依赖',
                        pros: [
                            'npm: npm outdated',
                            'yarn: yarn outdated'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yarn install详解',
            content: {
                description: 'yarn install是最常用的命令，安装package.json中的所有依赖。',
                examples: [
                    {
                        title: '基本install用法',
                        code: `# 安装所有依赖（可省略install）
yarn
yarn install

# 生产环境安装（跳过devDependencies）
yarn install --production
yarn --prod

# 冻结lockfile（lockfile有变化则失败，CI推荐）
yarn install --frozen-lockfile

# 纯粹lockfile（不生成lockfile，只读）
yarn install --pure-lockfile

# 强制重新下载
yarn install --force

# 离线模式
yarn install --offline

# 忽略scripts
yarn install --ignore-scripts`,
                        notes: 'CI中推荐使用--frozen-lockfile'
                    },
                    {
                        title: 'install执行流程',
                        code: `# yarn install执行的步骤：

# 1. 解析（Resolution）
#    - 读取package.json和yarn.lock
#    - 递归解析依赖树
#    - 确定每个包的版本

# 2. 获取（Fetch）
#    - 检查全局缓存
#    - 并行下载缺失的包
#    - 验证完整性（checksum）

# 3. 链接（Link）
#    - 创建node_modules结构
#    - 符号链接或硬链接
#    - 扁平化依赖树

# 4. 构建（Build）
#    - 执行preinstall/install/postinstall脚本
#    - 编译native模块

# 输出示例：
# [1/4] Resolving packages...
# [2/4] Fetching packages...
# [3/4] Linking dependencies...
# [4/4] Building fresh packages...
# Done in 10.52s.`,
                        notes: 'Yarn并行下载，速度快'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yarn add详解',
            content: {
                description: 'yarn add用于添加新依赖，自动更新package.json和yarn.lock。',
                examples: [
                    {
                        title: '添加依赖的各种方式',
                        code: `# 添加最新版本
yarn add lodash

# 添加指定版本
yarn add lodash@4.17.21

# 添加版本范围
yarn add lodash@^4.0.0

# 添加多个包
yarn add react react-dom

# 开发依赖
yarn add -D eslint

# 可选依赖
yarn add -O fsevents

# peer依赖
yarn add -P react

# 精确版本（不使用^或~）
yarn add --exact lodash
yarn add -E lodash

# 波浪号版本（~）
yarn add --tilde lodash
yarn add -T lodash`,
                        notes: 'add会自动保存到package.json'
                    },
                    {
                        title: '从不同源添加',
                        code: `# 从Git仓库
yarn add https://github.com/user/repo.git
yarn add https://github.com/user/repo.git#branch
yarn add git+ssh://git@github.com:user/repo.git

# 从本地文件
yarn add file:../local-package
yarn add file:/path/to/package

# 从tarball
yarn add https://example.com/package.tgz
yarn add file:./package.tgz

# 从不同registry
yarn add lodash --registry https://registry.npmmirror.com`,
                        notes: '支持多种包来源'
                    },
                    {
                        title: 'add的行为',
                        code: `# yarn add lodash执行的操作：

# 1. 解析lodash的最新版本
# 2. 下载lodash及其依赖
# 3. 更新package.json
#    "dependencies": {
#      "lodash": "^4.17.21"
#    }
# 4. 更新yarn.lock
# 5. 安装到node_modules
# 6. 输出：
#    success Saved 1 new dependency.
#    └─ lodash@4.17.21
#    Done in 2.34s.`,
                        notes: 'add自动处理所有更新'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yarn remove详解',
            content: {
                description: 'yarn remove移除依赖，清理node_modules和更新配置。',
                examples: [
                    {
                        title: '移除依赖',
                        code: `# 移除单个依赖
yarn remove lodash

# 移除多个依赖
yarn remove lodash axios moment

# 执行操作：
# 1. 从node_modules删除包
# 2. 从package.json删除
# 3. 更新yarn.lock
# 4. 移除未使用的依赖（如果有）

# 输出示例：
# [1/2] Removing module lodash...
# [2/2] Regenerating lockfile and installing missing dependencies...
# success Uninstalled packages.
# Done in 1.23s.`,
                        notes: 'remove会清理所有相关文件'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yarn upgrade详解',
            content: {
                description: 'yarn upgrade更新依赖到package.json允许的最新版本。',
                examples: [
                    {
                        title: 'upgrade基本用法',
                        code: `# 更新所有依赖（遵循package.json的版本范围）
yarn upgrade

# 更新特定包
yarn upgrade lodash

# 更新到最新版本（忽略版本范围）
yarn upgrade lodash --latest
yarn upgrade lodash -L

# 更新到指定版本
yarn upgrade lodash@4.17.21

# 交互式更新（Classic）
yarn upgrade-interactive

# 交互式更新最新版本
yarn upgrade-interactive --latest`,
                        notes: 'upgrade会更新yarn.lock'
                    },
                    {
                        title: 'upgrade vs add的区别',
                        code: `# 场景：package.json中有"lodash": "^4.17.0"

# yarn upgrade lodash
# - 更新到^4.17.0范围内的最新版（如4.17.21）
# - 不改变package.json
# - 更新yarn.lock

# yarn upgrade lodash --latest
# - 更新到最新版本
# - 更新package.json为新版本号
# - 更新yarn.lock

# yarn add lodash（已存在）
# - 与yarn upgrade lodash --latest相同
# - 更新到最新版本并修改package.json`,
                        notes: 'upgrade不加--latest不会改package.json'
                    },
                    {
                        title: 'upgrade-interactive（交互式）',
                        code: `# 运行交互式升级
yarn upgrade-interactive --latest

# 界面显示：
# ┌────────────────┬────────────┬────────────┬────────────┐
# │ Package        │ Current    │ Wanted     │ Latest     │
# ├────────────────┼────────────┼────────────┼────────────┤
# │ ◯ react        │ 18.0.0     │ 18.2.0     │ 18.2.0     │
# │ ◉ lodash       │ 4.17.20    │ 4.17.20    │ 4.17.21    │
# │ ◯ webpack      │ 5.75.0     │ 5.75.0     │ 5.88.2     │
# └────────────────┴────────────┴────────────┴────────────┘
#
# 空格键选择，回车确认
# ◉ 选中，◯ 未选中

# 只显示主要更新
yarn upgrade-interactive --latest --exact`,
                        notes: '交互式升级更安全'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'yarn global全局包',
            content: {
                description: 'yarn global管理全局安装的包，类似npm -g。',
                examples: [
                    {
                        title: '全局包管理',
                        code: `# 全局安装
yarn global add create-react-app
yarn global add typescript eslint

# 全局移除
yarn global remove create-react-app

# 全局更新
yarn global upgrade create-react-app
yarn global upgrade  # 更新所有

# 列出全局包
yarn global list
yarn global list --depth=0  # 只显示顶层

# 查看全局目录
yarn global bin   # 可执行文件目录
yarn global dir   # 包安装目录`,
                        notes: '全局包安装到~/.yarn/bin'
                    },
                    {
                        title: '配置全局目录',
                        code: `# 查看当前全局目录
yarn global dir
# 默认：~/.config/yarn/global

yarn global bin
# 默认：~/.yarn/bin

# 修改全局目录
yarn config set prefix ~/.yarn-global

# 确保全局bin在PATH中（~/.bashrc或~/.zshrc）
export PATH="$HOME/.yarn/bin:$PATH"`,
                        notes: '确保全局bin在PATH中'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '其他常用命令',
            content: {
                description: 'Yarn提供丰富的命令满足各种需求。',
                examples: [
                    {
                        title: '信息查询命令',
                        code: `# 查看包信息
yarn info lodash
yarn info lodash version
yarn info lodash versions  # 所有版本

# 列出已安装的包
yarn list
yarn list --depth=0  # 只显示顶层
yarn list --pattern lodash  # 过滤

# 查看为什么安装了某个包
yarn why lodash

# 检查过时的包
yarn outdated

# 查看依赖树
yarn list --depth=5`,
                        notes: 'info和why非常有用'
                    },
                    {
                        title: '缓存管理',
                        code: `# 查看缓存目录
yarn cache dir

# 列出缓存的包
yarn cache list

# 清除缓存
yarn cache clean
yarn cache clean lodash  # 清除特定包

# 查看缓存大小
du -sh $(yarn cache dir)`,
                        notes: '缓存在~/.yarn/cache'
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
yarn run dev
yarn dev  # run可省略

# 列出所有scripts
yarn run

# 传递参数
yarn test --coverage
yarn test -- --watch  # --后的参数传给脚本`,
                        notes: 'yarn可省略run'
                    },
                    {
                        title: '其他实用命令',
                        code: `# 检查package.json
yarn check
yarn check --integrity  # 验证完整性

# 生成license列表
yarn licenses list
yarn licenses generate-disclaimer > NOTICES.txt

# 发布包
yarn publish
yarn publish --new-version 1.0.1
yarn publish --tag beta

# 打包（测试发布内容）
yarn pack
yarn pack --filename my-package.tgz

# 执行二进制文件
yarn exec webpack
yarn exec -- webpack --config custom.config.js

# 审计安全漏洞
yarn audit
yarn audit --level high`,
                        notes: 'Yarn命令功能丰富'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'Yarn命令执行机制',
            content: {
                description: 'Yarn命令的执行涉及解析、验证、执行、输出等多个阶段。',
                mechanism: 'Yarn读取配置文件、解析命令参数、验证lockfile、并行执行任务、更新文件、输出友好的进度信息。',
                keyPoints: [
                    '配置读取：.yarnrc、package.json',
                    'lockfile验证：检查一致性',
                    '并行执行：网络请求、文件操作',
                    '原子性：操作要么全成功要么全失败',
                    '进度显示：友好的进度条',
                    'emoji输出：成功✅失败❌（可配）',
                    '性能优化：缓存、增量操作'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Yarn命令选项',
            content: {
                description: 'Yarn命令支持丰富的全局选项。',
                examples: [
                    {
                        title: '常用全局选项',
                        code: `# 静默输出
yarn --silent
yarn -s

# 详细输出
yarn --verbose

# 不显示emoji
yarn --no-emoji

# 不显示进度条
yarn --no-progress

# 使用指定registry
yarn --registry https://registry.npmmirror.com

# 使用代理
yarn --proxy http://proxy.com:8080
yarn --https-proxy http://proxy.com:8080

# 忽略脚本
yarn --ignore-scripts

# 忽略引擎检查
yarn --ignore-engines

# 忽略平台检查
yarn --ignore-platform`,
                        notes: '全局选项适用于所有命令'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'Yarn命令使用最佳实践',
            content: {
                description: '熟练使用Yarn命令可以提升开发效率。',
                keyPoints: [
                    'CI使用--frozen-lockfile：防止lockfile变化',
                    '优先用yarn而不是yarn install：更简洁',
                    'upgrade-interactive：交互式更新更安全',
                    'yarn why：排查依赖问题',
                    '定期yarn outdated：检查过时依赖',
                    'yarn cache clean：解决奇怪问题',
                    '脚本省略run：yarn build而不是yarn run build',
                    'lockfile必须提交：保证一致性'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第16章：Yarn简介与特性',
            url: './render.html?subject=pkg-manager&type=content&chapter=16'
        },
        next: {
            title: '第18章：Yarn Workspaces',
            url: './render.html?subject=pkg-manager&type=content&chapter=18'
        }
    }
};
