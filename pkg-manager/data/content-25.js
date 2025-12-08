/**
 * 第25章：pnpm性能优化
 * 全局store、缓存策略、并行安装、CI/CD使用
 */

window.content = {
    section: {
        title: '第25章：pnpm性能优化',
        icon: '⚡'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'pnpm性能优势来源',
            content: {
                description: 'pnpm是最快的包管理器，其性能优势源于创新的架构设计和多项优化策略。',
                keyPoints: [
                    '内容寻址：全局store去重',
                    '硬链接：零复制安装',
                    '并行下载：充分利用网络',
                    '增量安装：只安装新增包',
                    '符号链接：快速创建',
                    '缓存利用：跨项目共享',
                    '智能解析：避免重复计算'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '性能基准测试',
            content: {
                description: '真实项目的性能对比展示pnpm的显著优势。',
                examples: [
                    {
                        title: '安装速度对比',
                        code: `# 测试项目：React应用（~1000个包）

# ========== 首次安装（无缓存） ==========
# npm
time npm install
# real    2m15s
# 磁盘占用: 450MB

# Yarn Classic
time yarn install
# real    1m50s
# 磁盘占用: 450MB

# Yarn Berry PnP
time yarn install
# real    1m20s
# 磁盘占用: 200MB（零安装可选）

# pnpm
time pnpm install
# real    0m55s
# 磁盘占用: 120MB（硬链接）

# ========== 再次安装（有缓存） ==========
# npm
time npm install
# real    0m45s

# Yarn Classic
time yarn install
# real    0m35s

# Yarn Berry PnP
time yarn install
# real    0m12s

# pnpm
time pnpm install
# real    0m15s

# ========== Monorepo（20个workspace） ==========
# pnpm的优势更明显
time pnpm install
# real    1m10s
# 磁盘占用: 150MB（所有workspace共享store）

# npm Workspaces
time npm install
# real    3m30s
# 磁盘占用: 2GB（每个workspace独立）`,
                        notes: 'pnpm在各场景都有优势'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '全局store优化',
            content: {
                description: '全局store是pnpm性能的核心，所有项目共享同一个store，实现零额外空间占用。',
                mechanism: '下载的包存储在~/.pnpm-store，内容寻址去重，项目中通过硬链接使用，多个项目共享相同的文件，节省磁盘和安装时间。',
                keyPoints: [
                    '全局唯一：~/.pnpm-store',
                    '内容去重：相同文件只存一份',
                    '硬链接：项目零复制',
                    '跨项目共享：多项目受益',
                    '自动管理：无需手动维护',
                    '增量安装：只下载新包',
                    '空间节省：70%+ vs npm/yarn'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'store优化实践',
            content: {
                description: '充分利用store机制提升性能。',
                examples: [
                    {
                        title: 'store位置和状态',
                        code: `# 查看store路径
pnpm store path
# /Users/username/.pnpm-store/v3

# 查看store状态
pnpm store status
# 输出：
# Content-addressable store is at: /Users/username/.pnpm-store/v3
# 1234 packages
# 12.5 GB

# 查看store大小
du -sh $(pnpm store path)
# 12G

# 场景：10个项目，每个500MB依赖
# npm/yarn: 10 * 500MB = 5GB
# pnpm: ~600MB（去重后） + 硬链接（0 额外空间）`,
                        notes: 'store自动管理，无需手动操作'
                    },
                    {
                        title: 'store清理',
                        code: `# 清理未使用的包（释放空间）
pnpm store prune

# 效果：删除当前所有项目都不使用的包
# 场景：删除项目后，释放其独有的依赖

# 示例：
# 1. 删除一个项目
rm -rf old-project

# 2. 清理store
pnpm store prune
# 输出：Removed 123 packages

# 注意：谨慎使用，可能导致其他项目需要重新下载`,
                        notes: 'prune释放磁盘空间'
                    },
                    {
                        title: 'store在CI中的优化',
                        code: `# CI环境store缓存策略

# GitHub Actions
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'  # 缓存~/.pnpm-store
      
      - run: pnpm install --frozen-lockfile
      
      # 或手动缓存store
      - name: Cache pnpm store
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: \${{ runner.os }}-pnpm-\${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-`,
                        notes: 'CI缓存store显著提速'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '并行化策略',
            content: {
                description: 'pnpm充分利用并行化提升安装速度，包括网络请求、文件操作和脚本执行。',
                mechanism: 'pnpm并行下载包、并行创建链接、并行执行构建脚本，最大化利用CPU和网络资源。',
                keyPoints: [
                    '并行下载：network-concurrency',
                    '并行链接：文件系统并行',
                    '并行构建：child-concurrency',
                    'Workspaces并行：默认行为',
                    '智能调度：避免资源竞争',
                    '可配置：根据机器调整'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '并行化配置',
            content: {
                description: '调整并行度以适应不同的硬件环境。',
                examples: [
                    {
                        title: '并行配置',
                        code: `# .npmrc

# 网络并发数（默认16）
network-concurrency=16
# 高带宽可增加到32
network-concurrency=32

# 子进程并发数（默认5）
child-concurrency=5
# 多核CPU可增加
child-concurrency=10

# Workspaces并发数（默认4）
# 在package.json中配置或命令行指定
pnpm build -r --workspace-concurrency=4

# 场景：
# - 高性能机器：增加并发数
# - CI环境：根据容器资源调整
# - 网络慢：减少network-concurrency避免超时`,
                        notes: '根据环境调整并发数'
                    },
                    {
                        title: 'Workspaces并行优化',
                        code: `# 默认并行执行
pnpm build -r
# 同时构建多个workspace

# 限制并发数（节省资源）
pnpm build -r --workspace-concurrency=2

# 串行执行（按拓扑顺序）
pnpm build -r --workspace-concurrency=1

# 只构建变更的包（最大化效率）
pnpm build --filter "...[origin/main]"

# package.json配置默认值
{
  "pnpm": {
    "workspace-concurrency": 4
  }
}`,
                        notes: 'Monorepo中并行构建提速明显'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'CI/CD优化',
            content: {
                description: 'pnpm在CI/CD中的最佳配置，实现最快的构建速度。',
                examples: [
                    {
                        title: 'GitHub Actions完整配置',
                        code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 完整历史（用于变更检测）
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'  # 自动缓存store
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      # Monorepo优化：只测试变更的包
      - name: Test changed packages
        run: pnpm test --filter "...[origin/main]"
      
      - name: Build changed packages
        run: pnpm build --filter "[origin/main]..."
      
      - name: Lint
        run: pnpm lint -r`,
                        notes: '完整的CI配置示例'
                    },
                    {
                        title: 'Docker优化',
                        code: `# Dockerfile
FROM node:18-alpine

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# 只复制lock文件
COPY pnpm-lock.yaml ./

# 利用Docker层缓存
# 依赖不变时，这一层会被缓存
RUN pnpm fetch

# 复制代码
COPY . .

# 安装（从fetch的缓存安装，极快）
RUN pnpm install --offline --frozen-lockfile

# 构建
RUN pnpm build

CMD ["pnpm", "start"]

# 优化说明：
# 1. pnpm fetch：预先下载所有包到虚拟store
# 2. --offline：从本地安装，不访问网络
# 3. Docker缓存：lock不变时跳过fetch`,
                        notes: 'Docker中充分利用缓存'
                    },
                    {
                        title: 'GitLab CI配置',
                        code: `# .gitlab-ci.yml
image: node:18

cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store

before_script:
  - corepack enable
  - corepack prepare pnpm@8 --activate
  - pnpm config set store-dir .pnpm-store
  - pnpm install --frozen-lockfile

stages:
  - test
  - build

test:
  stage: test
  script:
    - pnpm test -r

build:
  stage: build
  script:
    - pnpm build -r`,
                        notes: 'GitLab CI缓存store'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '性能对比总结',
            content: {
                description: '各包管理器在不同场景下的性能表现。',
                items: [
                    {
                        name: 'pnpm',
                        pros: [
                            '首次安装：最快（硬链接）',
                            '缓存安装：快',
                            '磁盘空间：最省（70%+）',
                            'Monorepo：最佳',
                            'CI缓存：高效',
                            '增量安装：快'
                        ]
                    },
                    {
                        name: 'Yarn Berry PnP',
                        pros: [
                            '首次安装：快',
                            '缓存安装：最快（零安装）',
                            '磁盘空间：省',
                            'Monorepo：好'
                        ],
                        cons: [
                            '兼容性：差'
                        ]
                    },
                    {
                        name: 'npm/Yarn Classic',
                        pros: [
                            '兼容性：最好'
                        ],
                        cons: [
                            '首次安装：慢',
                            '缓存安装：较慢',
                            '磁盘空间：浪费',
                            'Monorepo：慢'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '进一步优化技巧',
            content: {
                description: '更多提升pnpm性能的技巧。',
                examples: [
                    {
                        title: '安装命令优化',
                        code: `# 生产环境安装（跳过devDependencies）
pnpm install --prod
# 或
pnpm install --production

# 冻结lockfile（CI推荐）
pnpm install --frozen-lockfile
# lockfile有变化会失败，确保CI一致性

# 离线模式（已有缓存）
pnpm install --offline
# 不访问网络，从store安装

# 忽略scripts（跳过postinstall等）
pnpm install --ignore-scripts
# 场景：只需要代码，不需要构建

# prefer-offline（优先缓存）
pnpm install --prefer-offline
# 有缓存用缓存，没有才下载`,
                        notes: '不同场景选择合适的选项'
                    },
                    {
                        title: '模块解析优化',
                        code: `# .npmrc
# 符号链接设置
symlink=true

# 模块目录
modules-dir=node_modules

# 虚拟store目录
virtual-store-dir=node_modules/.pnpm

# 包导入方式
package-import-method=auto
# auto: 自动选择（硬链接/复制/克隆）
# hardlink: 硬链接（默认，最快）
# copy: 复制（兼容性最好）
# clone: 克隆（macOS APFS）
# clone-or-copy: 克隆或复制`,
                        notes: '默认配置通常已最优'
                    },
                    {
                        title: '监控和诊断',
                        code: `# 查看安装时间
time pnpm install

# 详细日志
pnpm install --loglevel debug

# 报告（分析安装过程）
pnpm install --reporter=ndjson > install.log

# 查看哪些包最慢
# 分析install.log

# Monorepo时间分析
time pnpm build -r --stream

# 查看哪个workspace最慢
pnpm build -r --stream | grep "Done in"`,
                        notes: '诊断性能瓶颈'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'pnpm性能优化最佳实践',
            content: {
                description: '遵循最佳实践，充分发挥pnpm的性能优势。',
                keyPoints: [
                    'CI缓存store：GitHub Actions cache: "pnpm"',
                    'frozen-lockfile：CI中必用',
                    'Monorepo过滤：只构建变更的包',
                    '合理并发：根据机器资源调整',
                    'Docker分层：利用pnpm fetch',
                    '离线安装：pnpm fetch + --offline',
                    '避免不必要的scripts：--ignore-scripts',
                    '生产环境：--prod跳过dev依赖',
                    'store保持：不要频繁prune',
                    '定期更新pnpm：新版本持续优化'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第24章：pnpm高级特性',
            url: './render.html?subject=pkg-manager&type=content&chapter=24'
        },
        next: {
            title: '返回目录',
            url: './index.html?subject=pkg-manager'
        }
    }
};
