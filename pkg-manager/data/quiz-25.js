/**
 * 第25章：pnpm性能优化 - 面试题
 * 10道精选面试题：测试对pnpm性能优化、缓存策略、CI加速等的掌握
 */

window.content = {
    section: {
        title: '第25章：pnpm性能优化 - 面试题',
        icon: '⚡'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：性能优势',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['性能', '基础知识'],
                question: 'pnpm相比npm最显著的性能优势是什么？',
                options: [
                    '安装速度更快',
                    '节省磁盘空间',
                    '更好的依赖管理',
                    '以上都是'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'pnpm性能优势',
                    description: 'pnpm在安装速度、磁盘占用、依赖管理等方面都有显著优势。',
                    sections: [
                        {
                            title: '性能对比',
                            code: `# 基准测试（安装React项目）

npm install:
├── 下载时间：45秒
├── 安装时间：60秒
├── 磁盘占用：200MB
└── 总耗时：105秒

yarn install:
├── 下载时间：35秒
├── 安装时间：40秒
├── 磁盘占用：180MB
└── 总耗时：75秒

pnpm install:
├── 下载时间：30秒
├── 安装时间：15秒（硬链接）⚡
├── 磁盘占用：50MB（共享store）💾
└── 总耗时：45秒

# 提升：
速度：比npm快57%
空间：节省75%磁盘`
                        },
                        {
                            title: 'monorepo性能',
                            code: `# 100个packages的monorepo

npm（传统）:
├── 安装时间：10分钟
├── 磁盘占用：2GB
├── node_modules：100个副本
└── 重复依赖：严重

pnpm workspace:
├── 安装时间：2分钟 ⚡⚡
├── 磁盘占用：400MB 💾
├── node_modules：共享store
└── 重复依赖：无

# 提升：
速度：快80%
空间：节省80%`
                        },
                        {
                            title: '为什么这么快？',
                            code: `pnpm的性能秘诀：

1. 内容寻址存储（CAS）
   - 相同文件只存储一次
   - 硬链接实现共享
   - 近乎零复制开销

2. 非扁平化node_modules
   - 符号链接替代文件复制
   - 避免重复安装
   - 减少I/O操作

3. 并行下载
   - 多个包同时下载
   - 高效网络利用
   - 默认16个并发

4. 增量安装
   - 只安装变更的包
   - 复用已有的store
   - lockfile精确匹配`
                        }
                    ]
                },
                source: 'pnpm Benchmarks'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：缓存机制',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['缓存', 'store'],
                question: 'pnpm的store缓存位置在哪里？',
                options: [
                    'node_modules/.cache',
                    '~/.pnpm-store',
                    '项目根目录',
                    '/tmp/pnpm'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm缓存机制',
                    description: 'store是pnpm的核心缓存，实现跨项目共享。',
                    sections: [
                        {
                            title: 'store位置',
                            code: `# 查看store路径
pnpm store path

# 默认位置：
# macOS/Linux: ~/.local/share/pnpm/store
# Windows: %LOCALAPPDATA%/pnpm/store

# 自定义位置
.npmrc:
store-dir=/custom/path/.pnpm-store

# 或环境变量
export PNPM_HOME=/custom/pnpm`
                        },
                        {
                            title: 'store结构',
                            code: `~/.pnpm-store/
└── v3/                      # store版本
    ├── files/               # CAS文件存储
    │   ├── 00/
    │   │   ├── 1a2b3c.../   # 哈希分组
    │   │   └── 4d5e6f.../
    │   ├── 01/
    │   └── ...
    └── tmp/                 # 临时下载

# 文件命名：SHA-512哈希
# 例如：00/1a2b3c4d5e6f...0123456789abcdef

# 查看store大小
du -sh ~/.pnpm-store
# 2.5GB（可能包含数百个项目的依赖）`
                        },
                        {
                            title: '缓存工作流程',
                            code: `# 1. 第一次安装
pnpm add lodash

流程：
1. 下载lodash@4.17.21
2. 计算文件哈希
3. 存入store: ~/.pnpm-store/v3/files/xx/xxx...
4. 硬链接到node_modules

# 2. 其他项目安装
cd other-project
pnpm add lodash

流程：
1. 检查store中是否有lodash@4.17.21
2. 发现已存在 ✓
3. 直接硬链接（<1秒）⚡⚡
4. 不需要下载

# 效果：
第一次：30秒（下载）
第二次：1秒（硬链接）
提升：30倍速度`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Store'
            }
        },
        
        // 中等题 1 - 多选题
        {
            type: 'quiz',
            title: '题目3：安装优化配置',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['配置', '优化', '多选题'],
                question: '以下哪些配置可以提升pnpm安装速度？',
                options: [
                    'network-concurrency提高并发数',
                    'prefer-offline优先离线缓存',
                    'package-import-method使用硬链接',
                    'shamefully-hoist提升所有依赖'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: '安装性能优化',
                    description: '通过合理配置大幅提升安装速度。',
                    sections: [
                        {
                            title: '网络优化',
                            code: `# .npmrc
# 1. 提高并发数
network-concurrency=20
# 默认16，可根据网络调整
# 网络好：20-32
# 网络一般：16
# 网络差：8-12

# 2. 超时设置
fetch-retries=5
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
fetch-timeout=60000

# 3. 使用镜像
registry=https://registry.npmmirror.com
# 国内推荐淘宝镜像

# 效果：
默认配置：60秒
优化配置：30秒
提升：50%`
                        },
                        {
                            title: '缓存优化',
                            code: `# .npmrc
# 1. 优先离线
prefer-offline=true
# 先检查本地缓存，减少网络请求

# 2. 硬链接模式（默认）
package-import-method=hardlink
# 最快的链接方式
# 备选：copy, clone, clone-or-copy

# 3. store位置
store-dir=~/.pnpm-store
# SSD上性能更好

# 对比：
prefer-offline=false: 每次检查网络（慢）
prefer-offline=true:  优先本地缓存（快）⚡

# 注意：
# 开发环境：prefer-offline=true
# CI环境：prefer-offline=false（确保最新）`
                        },
                        {
                            title: 'CI优化',
                            code: `# .github/workflows/ci.yml
- name: Get pnpm store directory
  id: pnpm-cache
  run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Setup pnpm cache
  uses: actions/cache@v3
  with:
    path: \${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: \${{ runner.os }}-pnpm-\${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      \${{ runner.os }}-pnpm-

- name: Install dependencies
  run: pnpm install --frozen-lockfile --prefer-offline

# 效果：
无缓存：300秒
有缓存：30秒
提升：90%`
                        },
                        {
                            title: 'monorepo优化',
                            code: `# .npmrc
# 1. 工作空间并发
workspace-concurrency=4
# 同时安装多个workspace

# 2. 共享lockfile
shared-workspace-lockfile=true
# 所有workspace共享一个lockfile

# 3. 按需安装
# package.json
{
  "scripts": {
    "install:web": "pnpm --filter @myapp/web install",
    "install:changed": "pnpm --filter '...[origin/main]' install"
  }
}

# CI中只安装变更的包
pnpm --filter '...[origin/main]' install

# 效果：
全量安装：200秒
增量安装：40秒
提升：80%`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Performance'
            }
        },
        
        // 中等题 2 - 代码题
        {
            type: 'quiz-code',
            title: '题目4：CI缓存策略',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['CI', '缓存'],
                question: 'GitHub Actions中如何最优化pnpm缓存？',
                code: `# 目标：最快的CI安装速度
# 应该缓存什么？`,
                options: [
                    '只缓存node_modules',
                    '只缓存pnpm store',
                    'store + node_modules + pnpm版本',
                    '不需要缓存'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'CI缓存最佳实践',
                    description: '正确的缓存策略可以大幅提升CI速度。',
                    sections: [
                        {
                            title: '最优缓存策略',
                            code: `# .github/workflows/ci.yml
name: CI with Cache

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      # 方案1：只缓存store（推荐）⚡⚡⚡
      - name: Get pnpm store
        id: pnpm-cache
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
          
      - uses: actions/cache@v3
        with:
          path: \${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-
            
      - name: Install
        run: pnpm install --frozen-lockfile

# 为什么只缓存store？
# 1. node_modules可以快速从store重建（硬链接）
# 2. store更小，上传/下载更快
# 3. store跨分支共享，命中率高`
                        },
                        {
                            title: '性能对比',
                            code: `# 测试项目：100个dependencies

方案1：不缓存
├── 下载依赖：180秒
├── 构建node_modules：20秒
└── 总计：200秒

方案2：缓存node_modules（不推荐）
├── 下载缓存：40秒（node_modules压缩包大）
├── 解压：15秒
└── 总计：55秒
问题：
- node_modules巨大（500MB+）
- 上传缓存慢（30秒）
- lockfile变化缓存失效

方案3：缓存store（推荐）⚡⚡⚡
├── 下载缓存：10秒（store增量）
├── 硬链接node_modules：5秒
└── 总计：15秒
优势：
- store小（50MB增量）
- 上传快（5秒）
- 跨分支共享

方案4：缓存store + node_modules（过度）
├── 下载store：10秒
├── 下载node_modules：40秒
└── 总计：50秒
问题：缓存node_modules多余`
                        },
                        {
                            title: '高级缓存策略',
                            code: `# monorepo增量缓存
- uses: actions/cache@v3
  with:
    path: \${{ steps.pnpm-cache.outputs.STORE_PATH }}
    # 主缓存：精确匹配lockfile
    key: \${{ runner.os }}-pnpm-\${{ hashFiles('**/pnpm-lock.yaml') }}
    # 备用缓存：匹配部分依赖
    restore-keys: |
      \${{ runner.os }}-pnpm-
      
# 缓存命中率：
# 1. lockfile未变：100%命中（最快）
# 2. 部分依赖变：partial命中（快）
# 3. 全新分支：store复用（较快）

# 多缓存策略
- uses: actions/cache@v3
  with:
    path: |
      \${{ steps.pnpm-cache.outputs.STORE_PATH }}
      ~/.cache/Cypress  # 其他工具缓存
    key: \${{ runner.os }}-cache-\${{ hashFiles('**/pnpm-lock.yaml') }}

# Turborepo缓存
- uses: actions/cache@v3
  with:
    path: .turbo
    key: \${{ runner.os }}-turbo-\${{ github.sha }}
    restore-keys: |
      \${{ runner.os }}-turbo-`
                        },
                        {
                            title: '缓存监控',
                            code: `# 添加缓存统计
- name: Cache statistics
  run: |
    echo "Cache hit: \${{ steps.cache.outputs.cache-hit }}"
    echo "Store size: $(du -sh $(pnpm store path))"
    echo "node_modules size: $(du -sh node_modules)"
    
# 定期清理缓存
- name: Prune old cache
  if: github.event_name == 'schedule'
  run: pnpm store prune

# 缓存预热（可选）
- name: Warm cache
  if: github.ref == 'refs/heads/main'
  run: |
    # 预下载常用依赖到store
    pnpm add -g typescript webpack`
                        }
                    ]
                },
                source: 'GitHub Actions官方文档 + pnpm'
            }
        },
        
        // 中等题 3 - 多选题
        {
            type: 'quiz',
            title: '题目5：磁盘空间优化',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['磁盘', '空间优化', '多选题'],
                question: 'pnpm如何节省磁盘空间？',
                options: [
                    '内容寻址存储去重',
                    '硬链接共享文件',
                    '压缩node_modules',
                    '定期清理store'
                ],
                correctAnswer: [0, 1, 3],
                explanation: {
                    title: '磁盘空间优化策略',
                    description: 'pnpm通过多种技术大幅减少磁盘占用。',
                    sections: [
                        {
                            title: '内容寻址存储（CAS）',
                            code: `# 传统方式（npm/yarn）
项目A/node_modules/lodash/  (1MB)
项目B/node_modules/lodash/  (1MB)
项目C/node_modules/lodash/  (1MB)
总计：3MB

# pnpm方式
~/.pnpm-store/lodash/  (1MB)
  ↓ 硬链接
项目A/node_modules/lodash -> store
项目B/node_modules/lodash -> store
项目C/node_modules/lodash -> store
总计：1MB

# 节省：67%空间`
                        },
                        {
                            title: '硬链接机制',
                            code: `# 什么是硬链接？
# 多个文件名指向同一个inode（物理文件）

~/.pnpm-store/
└── v3/files/00/1a2b3c.../lodash.js  (inode: 12345)
     ↓ 硬链接
project/node_modules/.pnpm/lodash@4.17.21/
└── node_modules/lodash/index.js  (inode: 12345)
     ↓ 符号链接
project/node_modules/lodash -> ../.pnpm/lodash@4.17.21/...

# 验证硬链接
ls -li node_modules/.pnpm/lodash*/node_modules/lodash/index.js
# inode号相同 = 硬链接

# 优势：
# 1. 零复制开销
# 2. 文件系统级去重
# 3. 修改影响所有链接（需注意）`
                        },
                        {
                            title: 'store清理',
                            code: `# 1. 查看store状态
pnpm store status
# 输出：
# Store path: ~/.pnpm-store
# Size: 2.5GB
# Packages: 3542

# 2. 清理未使用的包
pnpm store prune
# 扫描所有项目，删除无引用的包

# 3. 清理特定版本
pnpm store prune --force

# 4. 完全重建store
rm -rf ~/.pnpm-store
pnpm install
# 只保留当前项目的依赖

# 清理策略：
# 开发机：每月执行pnpm store prune
# CI：不需要清理（临时环境）
# 服务器：定期清理旧版本`
                        },
                        {
                            title: '空间对比',
                            code: `# 实际项目测试（10个项目，每个100依赖）

npm：
├── 项目1: 200MB
├── 项目2: 200MB
├── ...
├── 项目10: 200MB
└── 总计: 2000MB

yarn：
├── 项目1: 180MB
├── 项目2: 180MB
├── ...
├── 项目10: 180MB
├── 全局缓存: 200MB
└── 总计: 2000MB

pnpm：
├── store: 400MB（去重后）
├── 项目1-10: 各5MB（符号链接）
└── 总计: 450MB ⚡⚡⚡

# 节省：77%磁盘空间`
                        },
                        {
                            title: '监控和维护',
                            code: `// package.json
{
  "scripts": {
    "disk:check": "du -sh node_modules ~/.pnpm-store",
    "disk:analyze": "pnpm list -r --depth=999 --json > deps.json",
    "disk:clean": "pnpm store prune"
  }
}

# 定期检查
pnpm disk:check
# node_modules: 50MB
# store: 2.5GB

# 分析最大的包
pnpm list --depth=0 --json | jq -r '.[] | .dependencies | to_entries[] | "\\(.key): \\(.value)"'

# 查找重复依赖
pnpm list lodash -r
# 显示所有项目的lodash版本`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Store'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目6：构建性能',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['构建', 'Turborepo'],
                question: 'monorepo中如何优化构建性能？',
                options: [
                    '串行构建所有包',
                    '全量并行构建',
                    '增量构建 + 任务缓存',
                    '减少包数量'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '构建性能优化',
                    description: '使用Turborepo等工具实现智能构建缓存。',
                    sections: [
                        {
                            title: 'Turborepo集成',
                            code: `# 安装Turborepo
pnpm add -D turbo

# turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}

# package.json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}`
                        },
                        {
                            title: '任务缓存',
                            code: `# 首次构建
pnpm build
# 构建所有包：200秒

# 无变更重复构建
pnpm build
# Turbo检测：无变更
# 使用缓存：2秒 ⚡⚡⚡
# 输出：从缓存恢复

# 部分变更
# 修改packages/ui
pnpm build
# Turbo检测：ui变更
# ui重新构建：20秒
# 其他包：使用缓存
# 总计：22秒 ⚡⚡

# 缓存键：
# 输入：源码 + 依赖 + 配置
# 输出：构建产物`
                        },
                        {
                            title: '并行与拓扑',
                            code: `# 依赖关系
packages/
├── shared (基础)
├── ui (依赖shared)
├── utils (依赖shared)
└── app (依赖ui, utils)

# Turbo智能调度
$ turbo run build

⚡ Tasks:  4 successful, 4 total
⚡ Cached:  0 of 4
⚡ Time:    42s

执行顺序：
1. shared (20s)
2. ui + utils 并行 (20s)
3. app (20s)
总计：60秒

# 第二次构建（无变更）
$ turbo run build

⚡ Tasks:  4 successful, 4 total
⚡ Cached:  4 of 4 cached
⚡ Time:    0.5s ⚡⚡⚡

全部从缓存恢复！`
                        },
                        {
                            title: '远程缓存',
                            code: `# 团队共享缓存
# turbo.json
{
  "remoteCache": {
    "signature": true
  }
}

# 登录Vercel（或自建缓存服务器）
pnpm dlx turbo login

# 链接项目
pnpm dlx turbo link

# 效果：
# 1. 开发A构建 -> 上传缓存
# 2. 开发B拉代码 -> 下载缓存
# 3. CI构建 -> 复用团队缓存

# CI配置
.github/workflows/ci.yml:
env:
  TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: \${{ vars.TURBO_TEAM }}

- run: pnpm build
  # 自动使用远程缓存

# 收益：
# CI无缓存：300秒
# 本地缓存：30秒
# 远程缓存：5秒 ⚡⚡⚡`
                        }
                    ]
                },
                source: 'Turborepo官方文档'
            }
        },
        
        // 困难题 1 - 代码题
        {
            type: 'quiz-code',
            title: '题目7：网络优化',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['网络', '下载优化'],
                question: '如何优化pnpm的网络下载性能？',
                code: `# 国内网络环境下
# 下载速度慢，经常超时
# 如何优化？`,
                options: [
                    '提高带宽',
                    '配置镜像 + 重试 + 并发',
                    '减少依赖数量',
                    '使用VPN'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '网络性能优化',
                    description: '通过镜像、重试、并发等策略提升下载速度。',
                    sections: [
                        {
                            title: '镜像配置',
                            code: `# .npmrc（国内推荐配置）
# 1. 使用淘宝镜像
registry=https://registry.npmmirror.com

# 2. scope镜像
@mycompany:registry=https://npm.mycompany.com

# 3. binary镜像
sharp_binary_host=https://npmmirror.com/mirrors/sharp
canvas_binary_host=https://npmmirror.com/mirrors/node-canvas
puppeteer_download_host=https://npmmirror.com/mirrors
chromedriver_cdnurl=https://npmmirror.com/mirrors/chromedriver
electron_mirror=https://npmmirror.com/mirrors/electron
sass_binary_site=https://npmmirror.com/mirrors/node-sass
python_mirror=https://npmmirror.com/mirrors/python

# 效果：
默认（官方）：平均500KB/s
淘宝镜像：平均5MB/s
提升：10倍 ⚡⚡⚡`
                        },
                        {
                            title: '重试和超时',
                            code: `# .npmrc
# 1. 网络重试
fetch-retries=5
# 失败后重试5次

fetch-retry-mintimeout=10000
# 最小重试间隔10秒

fetch-retry-maxtimeout=60000
# 最大重试间隔60秒

# 2. 超时设置
fetch-timeout=60000
# 单个请求超时60秒

# 3. 下载重试因子
fetch-retry-factor=10
# 每次重试间隔翻倍

# 策略：
# 首次：立即请求
# 重试1：10秒后
# 重试2：20秒后
# 重试3：40秒后
# 重试4：60秒后
# 重试5：60秒后

# 效果：
无重试：网络波动导致失败
有重试：自动恢复，成功率99%+`
                        },
                        {
                            title: '并发优化',
                            code: `# .npmrc
# 1. 并发下载数
network-concurrency=16
# 默认16，可根据网络调整

# 网络环境调优：
# 千兆网络：32
# 百兆网络：16
# 移动网络：8
# 限速网络：4

# 2. 代理设置
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080
noproxy=localhost,127.0.0.1

# 3. DNS优化
# 使用公共DNS
# /etc/resolv.conf
nameserver 114.114.114.114
nameserver 8.8.8.8

# 测试网络速度
time pnpm add lodash
# 记录下载时间，调整参数`
                        },
                        {
                            title: '离线优化',
                            code: `# 1. 预下载依赖
# 在线环境
pnpm install
# 所有依赖进入store

# 2. 导出store
tar -czf pnpm-store.tar.gz ~/.pnpm-store

# 3. 离线环境
# 解压store
tar -xzf pnpm-store.tar.gz -C ~/

# 4. 离线安装
pnpm install --offline
# 只使用本地store，不访问网络

# 场景：
# - 内网部署
# - 移动开发
# - 飞机上编程

# CI预热
.github/workflows/cache-warm.yml:
- name: Warm store
  run: |
    pnpm install
    pnpm store path
  # 预热store缓存`
                        },
                        {
                            title: '监控和调试',
                            code: `# 启用详细日志
pnpm install --loglevel=debug

# 输出：
debug Downloading https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz
debug Downloaded lodash@4.17.21 in 1.2s
debug Linking lodash@4.17.21 to node_modules

# 性能分析
pnpm install --reporter=append-only

# 网络统计
pnpm install --json | jq '.stats'
# {
#   "downloaded": 150,
#   "cached": 50,
#   "time": "45s"
# }

# 识别慢包
pnpm install --loglevel=debug 2>&1 | grep "Downloading" | sort -t= -k2 -n

# 问题排查：
# 1. 慢包 -> 检查镜像
# 2. 超时 -> 增加timeout
# 3. 失败 -> 增加retries`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Network'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目8：CI/CD优化',
            content: {
                questionType: 'multiple',
                difficulty: 'hard',
                tags: ['CI/CD', '性能优化', '多选题'],
                question: 'CI中优化pnpm性能的策略有哪些？',
                options: [
                    '缓存pnpm store',
                    '增量安装变更的包',
                    '使用frozen-lockfile',
                    '并行执行任务'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'CI/CD全面优化',
                    description: '综合运用多种技术实现极速CI。',
                    sections: [
                        {
                            title: '完整优化方案',
                            code: `# .github/workflows/ci.yml
name: Optimized CI

on: [push, pull_request]

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      # 1. 浅克隆（快）
      - uses: actions/checkout@v3
        with:
          fetch-depth: 1
          
      # 2. 缓存pnpm
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      # 3. 缓存store
      - name: Get store
        id: store
        run: echo "path=$(pnpm store path)" >> $GITHUB_OUTPUT
        
      - uses: actions/cache@v3
        with:
          path: \${{ steps.store.outputs.path }}
          key: \${{ runner.os }}-pnpm-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: \${{ runner.os }}-pnpm-
          
      # 4. 增量安装
      - name: Install
        run: |
          pnpm install --frozen-lockfile --prefer-offline

# 效果：
传统CI：300秒
优化CI：30秒
提升：90% ⚡⚡⚡`
                        },
                        {
                            title: '增量构建',
                            code: `# 只构建变更的包
- name: Get changed packages
  id: changed
  run: |
    pnpm list --filter '...[origin/main]' --depth=-1 --json > changed.json
    
- name: Build changed
  run: pnpm --filter '...[origin/main]' run build
  
- name: Test changed
  run: pnpm --filter '...[origin/main]' run test

# 效果：
全量构建：200秒（100个包）
增量构建：40秒（5个变更包）
提升：80% ⚡⚡`
                        },
                        {
                            title: '并行任务',
                            code: `# 矩阵构建
jobs:
  build:
    strategy:
      matrix:
        package: [ui, utils, app]
    steps:
      - run: pnpm --filter \${{ matrix.package }} build
      
# 并行执行
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm -r --parallel run lint
      
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm -r --parallel run test
      
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: pnpm -r run build

# 效果：
串行：lint(60s) + test(60s) + build(60s) = 180s
并行：max(lint, test)(60s) + build(60s) = 120s
提升：33%`
                        },
                        {
                            title: 'Docker优化',
                            code: `# Dockerfile（多阶段构建 + 缓存）
FROM node:18-alpine AS deps

# 启用corepack
RUN corepack enable pnpm

# 只复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 使用缓存挂载
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM node:18-alpine AS builder
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:18-alpine AS runner
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]

# 构建
docker build --build-arg BUILDKIT_INLINE_CACHE=1 .

# 效果：
无缓存：300秒
有缓存：30秒
提升：90%`
                        },
                        {
                            title: '综合最佳实践',
                            code: `# 完整CI配置
name: Production CI

env:
  PNPM_VERSION: 8
  NODE_VERSION: 18
  TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      store-path: \${{ steps.store.outputs.path }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Turborepo需要完整历史
          
      - uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - uses: actions/setup-node@v3
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - id: store
        run: echo "path=$(pnpm store path)" >> $GITHUB_OUTPUT
        
  install:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/cache@v3
        with:
          path: |
            \${{ needs.setup.outputs.store-path }}
            .turbo
          key: \${{ runner.os }}-deps-\${{ hashFiles('**/pnpm-lock.yaml') }}
          
      - run: pnpm install --frozen-lockfile
      
  build:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - run: pnpm build  # Turbo自动缓存
      
  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: pnpm test --shard=\${{ matrix.shard }}/4

# 效果：
原CI：500秒
优化CI：60秒
提升：88% ⚡⚡⚡`
                        }
                    ]
                },
                source: 'GitHub Actions + pnpm官方文档'
            }
        },
        
        // 困难题 3 - 代码题
        {
            type: 'quiz-code',
            title: '题目9：生产部署优化',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['生产部署', 'deploy'],
                question: '生产环境如何优化pnpm部署？',
                code: `# 生产服务器
# 只需要dependencies，不需要devDependencies
# 如何最小化安装？`,
                options: [
                    '正常安装后删除devDependencies',
                    'pnpm install --prod',
                    'pnpm deploy命令',
                    '手动复制node_modules'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '生产部署最佳实践',
                    description: 'pnpm deploy命令专为生产环境设计。',
                    sections: [
                        {
                            title: 'pnpm deploy命令',
                            code: `# pnpm deploy的优势
pnpm deploy --filter=app --prod /output

# 效果：
# 1. 只安装app及其dependencies
# 2. 不包含devDependencies
# 3. 不包含其他workspace
# 4. 生成独立的node_modules
# 5. 复制源码到/output

# 对比传统方式
pnpm install --prod
# 问题：
# - 包含所有workspace
# - store符号链接在生产不可用
# - 需要额外清理

# deploy输出结构
/output/
├── package.json
├── pnpm-lock.yaml
├── node_modules/        # 完整依赖
├── dist/               # 构建产物
└── ...                 # 源码`
                        },
                        {
                            title: 'Docker生产部署',
                            code: `# Dockerfile（生产优化）
FROM node:18-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app

# 只安装生产依赖
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# 构建阶段
FROM node:18-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# 生产镜像（最小化）
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 使用pnpm deploy
COPY --from=builder /app .
RUN corepack enable pnpm && \
    pnpm deploy --filter=app --prod /output && \
    rm -rf /app

WORKDIR /output
CMD ["node", "dist/server.js"]

# 镜像大小：
# 全依赖：500MB
# deploy：100MB
# 减少：80%`
                        },
                        {
                            title: '无Docker部署',
                            code: `# 构建机（CI）
pnpm install
pnpm run build
pnpm deploy --filter=app --prod dist/

# dist/目录结构
dist/
├── package.json
├── node_modules/    # 生产依赖
└── app/            # 构建产物

# 打包
tar -czf deploy.tar.gz dist/

# 生产服务器
scp deploy.tar.gz server:/opt/app/
ssh server
cd /opt/app
tar -xzf deploy.tar.gz
cd dist
node app/server.js

# 优势：
# 1. 不需要在生产安装依赖
# 2. 部署包完整独立
# 3. 回滚简单（切换目录）`
                        },
                        {
                            title: 'Serverless部署',
                            code: `# Vercel/Netlify配置
# vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs"
}

# 优化构建
.vercelignore:
node_modules
.pnpm-store
.turbo

# package.json
{
  "scripts": {
    "vercel-build": "pnpm install && pnpm build"
  }
}

# Lambda/Cloud Function
# 使用pnpm deploy生成部署包
pnpm deploy --filter=api --prod lambda/
cd lambda
zip -r function.zip .
aws lambda update-function-code \
  --function-name my-api \
  --zip-file fileb://function.zip

# 包大小：
# 全依赖：50MB -> Lambda限制
# deploy：10MB -> ✓`
                        },
                        {
                            title: '部署脚本',
                            code: `#!/bin/bash
# deploy.sh

set -e

APP_NAME=\${1:-app}
DEPLOY_DIR=\${2:-dist}

echo "🚀 Deploying \$APP_NAME..."

# 1. 清理
rm -rf \$DEPLOY_DIR

# 2. 构建
echo "📦 Building..."
pnpm --filter=\$APP_NAME run build

# 3. Deploy
echo "📥 Deploying dependencies..."
pnpm deploy --filter=\$APP_NAME --prod \$DEPLOY_DIR

# 4. 复制额外文件
cp .env.production \$DEPLOY_DIR/.env
cp ecosystem.config.js \$DEPLOY_DIR/

# 5. 打包
echo "📦 Creating archive..."
tar -czf \$APP_NAME-$(date +%Y%m%d%H%M%S).tar.gz \$DEPLOY_DIR

# 6. 上传到服务器
echo "📤 Uploading..."
scp \$APP_NAME-*.tar.gz server:/opt/deploy/

# 7. 远程部署
ssh server << 'EOF'
  cd /opt/deploy
  tar -xzf \$APP_NAME-*.tar.gz
  pm2 reload \$APP_NAME
EOF

echo "✅ Deployment complete!"

# 使用
./deploy.sh app
./deploy.sh api`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm deploy'
            }
        },
        
        // 困难题 4
        {
            type: 'quiz',
            title: '题目10：性能监控',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['监控', '性能分析'],
                question: '如何持续监控和优化pnpm性能？',
                options: [
                    '定期手动检查',
                    '自动化监控 + 告警 + 分析',
                    '只在出问题时检查',
                    '不需要监控'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '性能监控体系',
                    description: '建立完整的监控、分析和优化流程。',
                    sections: [
                        {
                            title: '指标收集',
                            code: `// package.json
{
  "scripts": {
    "install:metrics": "pnpm install --reporter=json > install-metrics.json",
    "analyze:deps": "pnpm list -r --depth=999 --json > deps.json",
    "analyze:size": "du -sh node_modules ~/.pnpm-store > size.txt",
    "analyze:outdated": "pnpm outdated -r --json > outdated.json"
  }
}

# CI中收集指标
- name: Collect metrics
  run: |
    # 安装时间
    START=$(date +%s)
    pnpm install --frozen-lockfile
    END=$(date +%s)
    echo "install_time=$((END-START))" >> metrics.txt
    
    # 包数量
    pnpm list -r --depth=-1 --json | jq '. | length' >> metrics.txt
    
    # store大小
    du -sh $(pnpm store path) >> metrics.txt
    
    # node_modules大小
    du -sh node_modules >> metrics.txt

# 输出到监控平台
- name: Send metrics
  run: |
    curl -X POST https://metrics.company.com/api \
      -d @metrics.txt`
                        },
                        {
                            title: '性能基准',
                            code: `# benchmark.yml
name: Performance Benchmark

on:
  schedule:
    - cron: '0 0 * * 0'  # 每周

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Benchmark install
        run: |
          # 清空缓存
          rm -rf ~/.pnpm-store node_modules
          
          # 测试安装时间
          time pnpm install > install.log
          
      - name: Benchmark build
        run: |
          time pnpm -r run build > build.log
          
      - name: Compare with baseline
        run: |
          # 对比上周数据
          CURRENT=$(cat install.log | grep real | awk '{print $2}')
          BASELINE=$(cat baseline.txt)
          
          if [ $CURRENT > $BASELINE * 1.1 ]; then
            echo "⚠️  Performance regression detected!"
            # 发送告警
          fi
          
      - name: Upload results
        run: |
          # 上传到性能监控平台
          curl -X POST https://perf.company.com/api \
            -F install=@install.log \
            -F build=@build.log`
                        },
                        {
                            title: '依赖分析',
                            code: `// analyze-deps.js
const deps = require('./deps.json')

// 统计
const stats = {
  total: 0,
  direct: 0,
  transitive: 0,
  duplicates: {},
  largest: []
}

// 分析每个包
deps.forEach(pkg => {
  stats.total++
  // 统计直接依赖
  if (pkg.depth === 0) stats.direct++
  else stats.transitive++
  
  // 检测重复版本
  const name = pkg.name.split('@')[0]
  stats.duplicates[name] = stats.duplicates[name] || []
  stats.duplicates[name].push(pkg.version)
  
  // 记录最大的包
  stats.largest.push({
    name: pkg.name,
    size: pkg.size
  })
})

// 排序最大的包
stats.largest.sort((a, b) => b.size - a.size).slice(0, 10)

// 输出报告
console.log('📊 Dependency Analysis')
console.log('Total:', stats.total)
console.log('Direct:', stats.direct)
console.log('Transitive:', stats.transitive)
console.log('\\nDuplicates:')
Object.entries(stats.duplicates)
  .filter(([_, versions]) => versions.length > 1)
  .forEach(([name, versions]) => {
    console.log(\`  \\\${name}: \\\${versions.join(', ')}\`)
  })
console.log('\\nLargest packages:')
stats.largest.forEach(({ name, size }) => {
  console.log(\`  \\\${name}: \\\${(size / 1024 / 1024).toFixed(2)}MB\`)
})

# 运行分析
pnpm analyze:deps
node analyze-deps.js`
                        },
                        {
                            title: '告警配置',
                            code: `# .github/workflows/alerts.yml
name: Performance Alerts

on:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check install time
        run: |
          TIME=$(pnpm install --reporter=json | jq .time)
          if [ $TIME -gt 60 ]; then
            # 超过60秒告警
            curl -X POST $SLACK_WEBHOOK \
              -d "{'text': '⚠️  pnpm install took \${TIME}s'}"
          fi
          
      - name: Check store size
        run: |
          SIZE=$(du -sm $(pnpm store path) | cut -f1)
          if [ $SIZE -gt 5000 ]; then
            # store超过5GB告警
            echo "⚠️  Store size: \${SIZE}MB"
          fi
          
      - name: Check duplicates
        run: |
          # 检查重复依赖
          DUPS=$(pnpm list -r | grep -c "─ ")
          if [ $DUPS -gt 10 ]; then
            echo "⚠️  Found \$DUPS duplicate dependencies"
          fi
          
      - name: Check outdated
        run: |
          # 检查过时依赖
          pnpm outdated -r --json > outdated.json
          COUNT=$(jq '. | length' outdated.json)
          if [ $COUNT -gt 20 ]; then
            echo "⚠️  \$COUNT packages are outdated"
          fi`
                        },
                        {
                            title: '持续优化',
                            code: `# 性能优化清单

每日：
[ ] 检查CI构建时间
[ ] 监控依赖安装速度
[ ] 审查失败的构建

每周：
[ ] 运行pnpm outdated检查更新
[ ] 检查store大小，必要时prune
[ ] 分析依赖树，查找重复
[ ] 审查新增的大依赖

每月：
[ ] 依赖大升级
[ ] 清理未使用的依赖
[ ] 优化CI缓存策略
[ ] 审查package.json配置
[ ] 运行完整的性能基准测试

每季度：
[ ] 依赖审计（安全 + 性能）
[ ] 评估monorepo结构
[ ] 更新工具链（pnpm, turbo等）
[ ] 团队性能培训

// 自动化脚本
{
  "scripts": {
    "health:check": "pnpm audit && pnpm outdated && pnpm list",
    "health:report": "node scripts/health-report.js",
    "optimize": "pnpm store prune && pnpm dedupe"
  }
}`
                        }
                    ]
                },
                source: '最佳实践总结'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第24章：pnpm高级特性',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=24'
        },
        next: null
    }
};
