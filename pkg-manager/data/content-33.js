/**
 * 第33章：包管理器性能优化
 * 安装速度、缓存策略、并行下载、CI/CD优化
 */

window.content = {
    section: {
        title: '第33章：包管理器性能优化',
        icon: '⚡'
    },
    
    topics: [
        {
            type: 'concept',
            title: '性能优化维度',
            content: {
                description: '包管理器性能优化涉及多个维度，从网络、磁盘到CPU，全方位提升安装速度和开发体验。',
                keyPoints: [
                    '网络优化：并行下载、镜像源',
                    '磁盘优化：缓存、硬链接',
                    'CPU优化：并行执行、增量构建',
                    '内存优化：减少内存占用',
                    'CI优化：缓存策略、增量测试',
                    '工具选择：pnpm性能最佳',
                    '配置调优：根据环境调整'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '安装速度优化',
            content: {
                description: '多种手段提升npm安装速度。',
                examples: [
                    {
                        title: '使用pnpm',
                        code: `# 最简单有效的优化：切换到pnpm
npm install -g pnpm
rm -rf node_modules package-lock.json
pnpm install

# 性能提升：
# - 首次安装：2-3倍faster
# - 缓存安装：5-10倍faster
# - 磁盘空间：节省70%+

# pnpm配置优化
# .npmrc
network-concurrency=16    # 网络并发
child-concurrency=10      # 子进程并发
fetch-retries=2          # 重试次数
lockfile-include-tarballurl=false`,
                        notes: 'pnpm是最有效的优化'
                    },
                    {
                        title: '镜像源优化',
                        code: `# 使用国内镜像（中国用户）
npm config set registry https://registry.npmmirror.com

# 或使用nrm管理镜像
npm install -g nrm
nrm ls
nrm use taobao

# pnpm
pnpm config set registry https://registry.npmmirror.com

# .npmrc（项目级）
registry=https://registry.npmmirror.com

# 测试速度
time npm install lodash
time pnpm add lodash`,
                        notes: '镜像源显著提速'
                    },
                    {
                        title: 'CI缓存策略',
                        code: `# GitHub Actions
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
          cache: 'pnpm'  # 自动缓存
      
      - run: pnpm install --frozen-lockfile
      
      # 或手动缓存
      - name: Cache pnpm store
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: pnpm-\${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: pnpm-
      
      - run: pnpm test`,
                        notes: 'CI缓存节省大量时间'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '性能优化checklist',
            content: {
                description: '全面的性能优化最佳实践。',
                keyPoints: [
                    '使用pnpm：最快的包管理器',
                    '镜像源：国内用户使用淘宝镜像',
                    'CI缓存：GitHub Actions cache',
                    'frozen-lockfile：跳过解析',
                    '增量构建：Turborepo/Nx',
                    '并行执行：充分利用CPU',
                    '定期清理：pnpm store prune',
                    '监控分析：找出瓶颈',
                    'Docker优化：多阶段构建',
                    'Monorepo过滤：只构建变更'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第32章：私有npm registry',
            url: './render.html?subject=pkg-manager&type=content&chapter=32'
        },
        next: {
            title: '第34章：依赖分析与优化',
            url: './render.html?subject=pkg-manager&type=content&chapter=34'
        }
    }
};
