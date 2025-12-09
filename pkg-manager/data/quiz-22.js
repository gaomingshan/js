/**
 * 第22章：pnpm基础使用 - 面试题
 * 10道精选面试题：测试对pnpm安装配置、常用命令、lockfile等基础使用的掌握
 */

window.content = {
    section: {
        title: '第22章：pnpm基础使用 - 面试题',
        icon: '🔧'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：pnpm安装方式',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['安装', 'pnpm基础'],
                question: '推荐的pnpm全局安装方式是什么？',
                options: [
                    'npm install -g pnpm',
                    '使用独立脚本安装（推荐）',
                    'yarn global add pnpm',
                    'brew install pnpm'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm的安装方式',
                    description: 'pnpm提供多种安装方式，推荐使用独立脚本避免与npm循环依赖。',
                    sections: [
                        {
                            title: '推荐方式：独立脚本',
                            code: `# 使用独立脚本安装（推荐）
# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# 优势：
# 1. 不依赖Node.js包管理器
# 2. 安装速度快
# 3. 自动配置PATH
# 4. 支持多版本管理

# 查看版本
pnpm --version`,
                            content: '独立脚本安装是官方推荐的方式，避免循环依赖。'
                        },
                        {
                            title: '其他安装方式',
                            code: `# Corepack (Node.js 16.13+，推荐)
corepack enable
corepack prepare pnpm@latest --activate

# Homebrew (macOS)
brew install pnpm

# npm安装（不推荐）
npm install -g pnpm

# 项目锁定pnpm版本
package.json:
{
  "packageManager": "pnpm@9.0.0"
}`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Installation'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：命令对比',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['命令', '基础操作'],
                question: 'npm install对应的pnpm命令是什么？',
                options: [
                    'pnpm add',
                    'pnpm install 或 pnpm i',
                    'pnpm get',
                    'pnpm fetch'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm命令对照',
                    description: 'pnpm命令与npm高度兼容，学习成本低。',
                    sections: [
                        {
                            title: '常用命令对照',
                            code: `# 安装依赖
npm install     -> pnpm install
npm i lodash    -> pnpm add lodash
npm i -D jest   -> pnpm add -D jest

# 移除依赖
npm uninstall   -> pnpm remove

# 运行脚本
npm run build   -> pnpm run build (或 pnpm build)

# 执行包
npx eslint      -> pnpm dlx eslint

# pnpm特有
pnpm store status  # 查看store状态
pnpm why lodash    # 依赖分析`
                        }
                    ]
                },
                source: 'pnpm官方文档 - CLI'
            }
        },
        
        // 中等题 1 - 多选题
        {
            type: 'quiz',
            title: '题目3：pnpm配置文件',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['.npmrc', '配置', '多选题'],
                question: 'pnpm可以通过哪些方式进行配置？',
                options: [
                    '项目根目录的.npmrc文件',
                    '全局~/.npmrc文件',
                    '命令行参数',
                    'pnpm-workspace.yaml文件'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'pnpm配置系统',
                    description: 'pnpm支持多层级配置，优先级：命令行 > 项目 > 全局。',
                    sections: [
                        {
                            title: '配置优先级',
                            code: `# 从高到低
1. 命令行参数
   pnpm install --store-dir=/custom/path
   
2. 项目.npmrc
   项目根目录/.npmrc
   
3. 用户.npmrc
   ~/.npmrc
   
4. pnpm内置默认值`
                        },
                        {
                            title: '常用配置',
                            code: `# .npmrc
store-dir=~/.pnpm-store
registry=https://registry.npmmirror.com
network-concurrency=16
frozen-lockfile=false
strict-peer-dependencies=true

# 查看配置
pnpm config list
pnpm config get store-dir`
                        }
                    ]
                },
                source: 'pnpm官方文档 - .npmrc'
            }
        },
        
        // 中等题 2 - 代码题
        {
            type: 'quiz-code',
            title: '题目4：pnpm-lock.yaml用途',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['lockfile', 'pnpm-lock'],
                question: 'pnpm install --frozen-lockfile命令的作用是什么？',
                code: `# CI/CD脚本
- name: Install dependencies
  run: pnpm install --frozen-lockfile
  
# 如果pnpm-lock.yaml与package.json不一致
# 会发生什么？`,
                options: [
                    '更新pnpm-lock.yaml以匹配package.json',
                    '忽略差异，继续安装',
                    '报错并终止安装',
                    '使用package.json，忽略lockfile'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'lockfile的重要性',
                    description: 'lockfile确保依赖安装的确定性和可重现性。',
                    sections: [
                        {
                            title: '--frozen-lockfile选项',
                            code: `# 默认模式（开发）
pnpm install
# 如果不一致，更新lockfile

# frozen模式（CI/生产）
pnpm install --frozen-lockfile
# 如果不一致 -> ❌ 报错退出
# 确保完全一致

# CI最佳实践
- run: pnpm install --frozen-lockfile`
                        },
                        {
                            title: '常见问题',
                            code: `# 问题：lockfile与package.json不一致
# 解决：
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lockfile"

# 问题：lockfile冲突
git checkout --theirs pnpm-lock.yaml
pnpm install`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm install'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目5：从npm迁移',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['迁移', '最佳实践'],
                question: '从npm迁移到pnpm的正确步骤是什么？',
                options: [
                    '直接运行pnpm install',
                    '删除node_modules → 安装pnpm → pnpm import → pnpm install',
                    '只删除package-lock.json即可',
                    '先运行npm uninstall'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '安全迁移到pnpm',
                    description: '完整的迁移流程确保平滑过渡。',
                    sections: [
                        {
                            title: '迁移步骤',
                            code: `# 1. 安装pnpm
npm install -g pnpm

# 2. 清理旧文件
rm -rf node_modules
rm package-lock.json

# 3. 导入lockfile
pnpm import  # 从package-lock.json导入

# 4. 安装依赖
pnpm install

# 5. 验证
pnpm run build
pnpm test

# 6. 提交
git add pnpm-lock.yaml`
                        },
                        {
                            title: '兼容性配置',
                            code: `# 遇到幽灵依赖问题
.npmrc:
public-hoist-pattern[]=*some-package*

# 遇到符号链接问题
.npmrc:
node-linker=hoisted`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Migration'
            }
        },
        
        // 中等题 4 - 多选题
        {
            type: 'quiz',
            title: '题目6：pnpm store管理',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['store', '存储管理', '多选题'],
                question: '关于pnpm store的说法哪些正确？',
                options: [
                    'store默认位置在~/.pnpm-store',
                    'store中文件按内容哈希组织',
                    'pnpm store prune删除未被引用的包',
                    'store可以在多台机器间共享'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'pnpm store管理',
                    description: 'store是pnpm的核心，理解其管理很重要。',
                    sections: [
                        {
                            title: 'store命令',
                            code: `# 查看store路径
pnpm store path

# 查看状态
pnpm store status

# 清理未使用的包
pnpm store prune

# 验证完整性
pnpm store verify

# 自定义位置
.npmrc:
store-dir=/custom/path`
                        },
                        {
                            title: 'store结构',
                            code: `~/.pnpm-store/
└── v3/
    ├── files/          # CAS存储
    │   ├── 00/
    │   ├── 01/
    │   └── ...
    └── tmp/            # 临时文件`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm store'
            }
        },
        
        // 困难题 1 - 代码题
        {
            type: 'quiz-code',
            title: '题目7：pnpm执行器',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['pnpm dlx', '执行器'],
                question: 'pnpm dlx与npx的主要区别是什么？',
                code: `# npx
npx create-react-app my-app

# pnpm dlx  
pnpm dlx create-react-app my-app`,
                options: [
                    '完全相同',
                    'pnpm dlx使用store，避免重复下载',
                    'pnpm dlx更快但功能少',
                    'pnpm dlx不支持远程包'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm dlx优化',
                    description: 'pnpm dlx利用store实现高效执行。',
                    sections: [
                        {
                            title: '性能对比',
                            code: `# 首次执行
npx create-react-app:  45秒
pnpm dlx:              42秒

# 第二次执行  
npx:  30秒
pnpm dlx:  5秒  ⚡⚡⚡

# store已有
pnpm dlx:  2秒  ⚡⚡⚡`
                        },
                        {
                            title: '常用场景',
                            code: `# 脚手架
pnpm dlx create-react-app my-app
pnpm dlx create-next-app my-app

# 工具
pnpm dlx prettier --write "src/**/*.js"
pnpm dlx eslint --fix src/

# 一次性命令
pnpm dlx serve dist/`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm dlx'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目8：生命周期脚本',
            content: {
                questionType: 'multiple',
                difficulty: 'hard',
                tags: ['生命周期', 'scripts', '多选题'],
                question: 'pnpm处理生命周期脚本的特殊行为有哪些？',
                options: [
                    '默认不运行prepare脚本',
                    '支持递归运行workspace脚本',
                    '可并行执行workspace脚本',
                    '不支持pre和post钩子'
                ],
                correctAnswer: [1, 2],
                explanation: {
                    title: 'pnpm脚本执行',
                    description: 'pnpm为workspace提供强大的脚本能力。',
                    sections: [
                        {
                            title: '递归执行',
                            code: `# 所有workspace
pnpm -r run build

# 并行执行
pnpm -r --parallel run test

# 按拓扑顺序
pnpm -r run build
# 自动处理依赖顺序`
                        },
                        {
                            title: '过滤器',
                            code: `# 按名称
pnpm --filter "app" run build

# 按依赖关系
pnpm --filter "...app" run build

# 按Git变更
pnpm --filter "...[origin/main]" run test`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Filtering'
            }
        },
        
        // 困难题 3 - 代码题
        {
            type: 'quiz-code',
            title: '题目9：patch包机制',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['patch', 'bug修复'],
                question: 'pnpm patch命令的用途是什么？',
                code: `# 第三方包有bug，官方未修复
pnpm patch react@18.2.0`,
                options: [
                    '直接修改node_modules',
                    '创建可编辑副本，生成patch文件',
                    '从GitHub下载源码',
                    '回退到上一版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm patch机制',
                    description: 'patch提供临时修复第三方包的能力。',
                    sections: [
                        {
                            title: 'patch工作流',
                            code: `# 1. 创建副本
pnpm patch react@18.2.0
# 输出可编辑路径

# 2. 修改bug
cd /tmp/pnpm-patch/react@18.2.0
vim index.js

# 3. 提交patch
pnpm patch-commit /tmp/pnpm-patch/react@18.2.0
# 生成patches/react@18.2.0.patch`
                        },
                        {
                            title: '自动应用',
                            code: `// package.json
{
  "pnpm": {
    "patchedDependencies": {
      "react@18.2.0": "patches/react@18.2.0.patch"
    }
  }
}

# 其他人pnpm install时自动应用patch`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm patch'
            }
        },
        
        // 困难题 4
        {
            type: 'quiz',
            title: '题目10：pnpm与Docker',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['Docker', '生产部署'],
                question: '在Docker中使用pnpm的最佳实践是什么？',
                options: [
                    '直接COPY node_modules',
                    '多阶段构建 + 缓存挂载',
                    '在容器内运行npm install',
                    '使用shamefully-hoist模式'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm + Docker优化',
                    description: 'Docker与pnpm结合需要特殊优化。',
                    sections: [
                        {
                            title: '多阶段构建',
                            code: `FROM node:18-alpine AS deps
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:18-alpine AS runner
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]`
                        },
                        {
                            title: '缓存挂载优化',
                            code: `# 使用BuildKit
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# 跨构建共享store，大幅加速`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Docker'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第21章：pnpm原理与优势',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=21'
        },
        next: {
            title: '第23章：pnpm Workspaces',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=23'
        }
    }
};
