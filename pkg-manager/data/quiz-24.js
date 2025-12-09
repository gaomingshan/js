/**
 * 第24章：pnpm高级特性 - 面试题
 * 10道精选面试题：测试对peer依赖、overrides、hooks等高级特性的掌握
 */

window.content = {
    section: {
        title: '第24章：pnpm高级特性 - 面试题',
        icon: '⚙️'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：peer依赖概念',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['peer依赖', 'peerDependencies'],
                question: 'peerDependencies的主要用途是什么？',
                options: [
                    '指定项目的开发依赖',
                    '声明插件需要宿主提供的依赖',
                    '自动安装所有依赖',
                    '提升依赖到根目录'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'peer依赖详解',
                    description: 'peerDependencies用于声明包需要但不应自己安装的依赖。',
                    sections: [
                        {
                            title: 'peer依赖的作用',
                            code: `// 场景：开发React组件库
// my-ui-lib/package.json
{
  "name": "my-ui-lib",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}

# 含义：
# "我的库需要react和react-dom"
# "但我不会安装它们"
# "请使用我的项目提供这些依赖"

# 为什么这样设计？
1. 避免重复安装React
2. 确保使用相同React实例
3. 减小包体积`
                        },
                        {
                            title: '对比dependencies',
                            code: `// 方案1：使用dependencies（错误）
{
  "dependencies": {
    "react": "^18.0.0"
  }
}
# 问题：用户项目也有react
# 结果：安装两个react实例，导致bug

// 方案2：使用peerDependencies（正确）
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
# 声明：需要react 18.x
# 由宿主项目安装react
# 共享同一个react实例`
                        },
                        {
                            title: 'pnpm的peer依赖处理',
                            code: `# 场景：用户安装组件库
npm install my-ui-lib

# npm 7+：自动安装peer依赖
node_modules/
├── react/
└── my-ui-lib/

# pnpm：严格检查
pnpm install my-ui-lib
# WARN  unmet peer react@^18.0.0

# 解决：手动安装
pnpm add react react-dom my-ui-lib

# 配置自动安装
.npmrc:
auto-install-peers=true
# pnpm会自动安装缺失的peer依赖`
                        }
                    ]
                },
                source: 'pnpm官方文档 - peerDependencies'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：overrides配置',
            content: {
                questionType: 'single',
                difficulty: 'easy',
                tags: ['overrides', '版本覆盖'],
                question: 'pnpm.overrides的作用是什么？',
                options: [
                    '提升依赖版本',
                    '强制覆盖特定依赖的版本',
                    '删除某个依赖',
                    '添加新依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'overrides机制',
                    description: 'overrides允许强制指定依赖树中任何包的版本。',
                    sections: [
                        {
                            title: '基础用法',
                            code: `// package.json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    }
  }
}

# 效果：
# 无论哪个包依赖lodash
# 都会强制使用4.17.21版本

# 依赖树：
app
├── pkg-a (依赖lodash@3.0.0)
├── pkg-b (依赖lodash@4.0.0)
└── lodash@4.17.21  # 全部统一为这个版本`
                        },
                        {
                            title: '使用场景',
                            code: `// 1. 修复安全漏洞
{
  "pnpm": {
    "overrides": {
      "minimist": "^1.2.6"  # 修复CVE
    }
  }
}

// 2. 统一版本
{
  "pnpm": {
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  }
}

// 3. 测试新版本
{
  "pnpm": {
    "overrides": {
      "typescript": "5.0.0-beta"
    }
  }
}`
                        },
                        {
                            title: '精确覆盖',
                            code: `{
  "pnpm": {
    "overrides": {
      // 全局覆盖
      "foo": "^1.0.0",
      
      // 只覆盖bar的foo依赖
      "bar>foo": "^2.0.0",
      
      // 覆盖任意层级的foo
      "**>foo": "^1.0.0"
    }
  }
}

# 示例：
app
├── bar
│   └── foo@2.0.0  # 特定覆盖
└── baz
    └── foo@1.0.0  # 全局覆盖`
                        }
                    ]
                },
                source: 'pnpm官方文档 - overrides'
            }
        },
        
        // 中等题 1 - 多选题
        {
            type: 'quiz',
            title: '题目3：peer依赖配置',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['peer依赖', '配置', '多选题'],
                question: 'pnpm处理peer依赖的配置选项有哪些？',
                options: [
                    'auto-install-peers自动安装',
                    'strict-peer-dependencies严格检查',
                    'resolve-peers-from-workspace从workspace解析',
                    'ignore-peer-dependencies忽略检查'
                ],
                correctAnswer: [0, 1, 2],
                explanation: {
                    title: 'peer依赖配置详解',
                    description: 'pnpm提供多种选项控制peer依赖行为。',
                    sections: [
                        {
                            title: 'auto-install-peers',
                            code: `# .npmrc
auto-install-peers=true

# 效果：
pnpm add eslint-plugin-react
# 自动安装：
# - eslint (peer依赖)
# - eslint-plugin-react

# 默认false，需要手动安装peer依赖
auto-install-peers=false
pnpm add eslint-plugin-react
# WARN  unmet peer eslint
# 需要：pnpm add eslint`
                        },
                        {
                            title: 'strict-peer-dependencies',
                            code: `# .npmrc
strict-peer-dependencies=true

# 效果：peer依赖缺失或版本不匹配时报错
pnpm install
# ERR_PNPM_PEER_DEP_ISSUES
# react@17.0.0 but got 18.0.0

# 默认false，只警告
strict-peer-dependencies=false
pnpm install  
# WARN  unmet peer react@^17.0.0
# 继续安装`
                        },
                        {
                            title: 'resolve-peers-from-workspace',
                            code: `# monorepo场景
# .npmrc
resolve-peers-from-workspace=true

# 结构：
packages/
├── ui/ (需要react peer)
├── web/ (有react)
└── mobile/ (有react)

# 效果：
# ui会从同workspace的web/mobile中解析react
# 而不是从根node_modules

# 默认true，workspace优先
resolve-peers-from-workspace=false
# 从根node_modules解析`
                        },
                        {
                            title: '组合配置',
                            code: `# 推荐配置（开发环境）
.npmrc:
auto-install-peers=true
strict-peer-dependencies=false
resolve-peers-from-workspace=true

# 推荐配置（CI/生产）
.npmrc:
auto-install-peers=false
strict-peer-dependencies=true
resolve-peers-from-workspace=true
frozen-lockfile=true`
                        }
                    ]
                },
                source: 'pnpm官方文档 - .npmrc'
            }
        },
        
        // 中等题 2 - 代码题
        {
            type: 'quiz-code',
            title: '题目4：hooks钩子',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['hooks', '生命周期'],
                question: 'pnpm hooks的主要用途是什么？',
                code: `// .pnpmfile.cjs
function readPackage(pkg, context) {
  // 可以修改pkg
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}`,
                options: [
                    '运行测试脚本',
                    '在安装时动态修改package.json',
                    '配置代理服务器',
                    '管理全局依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm hooks机制',
                    description: 'hooks允许在依赖解析时动态修改包的元数据。',
                    sections: [
                        {
                            title: 'readPackage钩子',
                            code: `// .pnpmfile.cjs
function readPackage(pkg, context) {
  // pkg: package.json内容
  // context: 上下文信息
  
  // 示例1：修复缺失的peer依赖
  if (pkg.name === 'some-broken-package') {
    pkg.peerDependencies = {
      ...pkg.peerDependencies,
      'react': '^18.0.0'
    }
  }
  
  // 示例2：统一版本
  if (pkg.dependencies?.lodash) {
    pkg.dependencies.lodash = '4.17.21'
  }
  
  // 示例3：移除某个依赖
  if (pkg.name === 'legacy-package') {
    delete pkg.dependencies['old-dep']
  }
  
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}`
                        },
                        {
                            title: '使用场景',
                            code: `// 场景1：修复第三方包bug
function readPackage(pkg) {
  // package-a忘记声明peer依赖
  if (pkg.name === 'package-a') {
    pkg.peerDependencies = {
      'react': '>=16.8.0'
    }
  }
  return pkg
}

// 场景2：强制版本一致
function readPackage(pkg) {
  // 所有包的lodash统一版本
  if (pkg.dependencies?.lodash) {
    pkg.dependencies.lodash = '4.17.21'
  }
  if (pkg.devDependencies?.lodash) {
    pkg.devDependencies.lodash = '4.17.21'
  }
  return pkg
}

// 场景3：移除不需要的依赖
function readPackage(pkg) {
  // 移除所有的moment.js
  delete pkg.dependencies?.moment
  return pkg
}`
                        },
                        {
                            title: 'afterAllResolved钩子',
                            code: `// .pnpmfile.cjs
function afterAllResolved(lockfile, context) {
  // lockfile: pnpm-lock.yaml内容
  // context: 上下文
  
  // 检查依赖
  console.log('Total packages:', 
    Object.keys(lockfile.packages).length)
  
  // 警告特定包
  if (lockfile.packages['moment']) {
    console.warn('⚠️  Using moment.js, consider date-fns')
  }
  
  return lockfile
}

module.exports = {
  hooks: {
    readPackage,
    afterAllResolved
  }
}`
                        },
                        {
                            title: '实际案例',
                            code: `// .pnpmfile.cjs
// 解决React Native符号链接问题
function readPackage(pkg) {
  // React Native不支持符号链接
  // 提升所有依赖
  if (pkg.name === 'react-native') {
    pkg.dependencies = {
      ...pkg.dependencies,
      ...pkg.peerDependencies
    }
    pkg.peerDependencies = {}
  }
  
  // 统一React版本
  const REACT_VERSION = '18.2.0'
  if (pkg.dependencies?.react) {
    pkg.dependencies.react = REACT_VERSION
  }
  if (pkg.dependencies?.['react-dom']) {
    pkg.dependencies['react-dom'] = REACT_VERSION
  }
  
  return pkg
}

module.exports = {
  hooks: { readPackage }
}`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpmfile'
            }
        },
        
        // 中等题 3 - 多选题
        {
            type: 'quiz',
            title: '题目5：自定义协议',
            content: {
                questionType: 'multiple',
                difficulty: 'medium',
                tags: ['协议', '依赖来源', '多选题'],
                question: 'pnpm支持哪些依赖协议？',
                options: [
                    'workspace: 本地workspace',
                    'link: 符号链接',
                    'git: Git仓库',
                    'file: 本地文件'
                ],
                correctAnswer: [0, 2, 3],
                explanation: {
                    title: 'pnpm依赖协议',
                    description: 'pnpm支持多种协议指定依赖来源。',
                    sections: [
                        {
                            title: 'workspace:协议',
                            code: `{
  "dependencies": {
    "@myapp/ui": "workspace:*",
    "@myapp/utils": "workspace:^1.0.0"
  }
}

# 特性：
# 1. 总是使用本地workspace包
# 2. 不从registry下载
# 3. 发布时自动转换为实际版本
# 4. monorepo必备`
                        },
                        {
                            title: 'file:协议',
                            code: `{
  "dependencies": {
    "my-local-pkg": "file:./packages/local",
    "shared": "file:../shared"
  }
}

# 使用场景：
# 1. 临时测试本地包
# 2. 未发布的私有包
# 3. 不在workspace中的本地包

# 与workspace:的区别：
# - file: 使用相对路径
# - workspace: 使用包名`
                        },
                        {
                            title: 'git:协议',
                            code: `{
  "dependencies": {
    // HTTPS
    "pkg": "git+https://github.com/user/repo.git",
    
    // SSH
    "pkg": "git+ssh://git@github.com:user/repo.git",
    
    // 特定分支
    "pkg": "user/repo#dev",
    
    // 特定commit
    "pkg": "user/repo#a1b2c3d",
    
    // 特定tag
    "pkg": "user/repo#v1.0.0",
    
    // 子目录
    "pkg": "user/repo#main:packages/sub"
  }
}

# 使用场景：
# 1. fork的包未发布
# 2. 测试PR中的修复
# 3. 私有Git仓库`
                        },
                        {
                            title: '其他协议',
                            code: `{
  "dependencies": {
    // npm registry (默认)
    "lodash": "^4.17.21",
    
    // 特定registry
    "pkg": "npm:pkg@1.0.0",
    
    // tarball URL
    "pkg": "https://example.com/pkg-1.0.0.tgz",
    
    // GitHub快捷方式
    "pkg": "github:user/repo",
    "pkg": "user/repo",
    
    // GitLab
    "pkg": "gitlab:user/repo",
    
    // Bitbucket
    "pkg": "bitbucket:user/repo"
  }
}`
                        },
                        {
                            title: '协议优先级',
                            code: `# pnpm解析顺序
1. workspace: 协议
   -> 本地workspace包

2. file: 协议
   -> 本地文件系统

3. git: 协议
   -> Git仓库

4. 版本号/范围
   -> registry查找

# 示例：
{
  "dependencies": {
    // 1. 优先本地
    "ui": "workspace:*",
    
    // 2. 本地文件
    "local": "file:../local",
    
    // 3. Git仓库
    "fork": "github:me/fork",
    
    // 4. registry
    "lodash": "^4.17.21"
  }
}`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Protocols'
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目6：packageExtensions',
            content: {
                questionType: 'single',
                difficulty: 'medium',
                tags: ['packageExtensions', '包修复'],
                question: 'packageExtensions的作用是什么？',
                options: [
                    '扩展package.json的字段',
                    '修复第三方包的元数据错误',
                    '添加新的npm脚本',
                    '升级所有依赖'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'packageExtensions机制',
                    description: '为第三方包添加缺失的依赖信息，无需修改node_modules。',
                    sections: [
                        {
                            title: '基础用法',
                            code: `// .npmrc
package-extensions[]=react-redux@6:peerDependencies[react]=16

// 或 package.json
{
  "pnpm": {
    "packageExtensions": {
      "react-redux@6": {
        "peerDependencies": {
          "react": "16"
        }
      }
    }
  }
}

# 效果：
# react-redux@6缺少peer依赖声明
# pnpm自动添加react peer依赖`
                        },
                        {
                            title: '常见场景',
                            code: `{
  "pnpm": {
    "packageExtensions": {
      // 1. 添加缺失的peer依赖
      "eslint-plugin-react@7": {
        "peerDependencies": {
          "eslint": ">=6.0.0"
        }
      },
      
      // 2. 添加缺失的dependencies
      "package-a@1.0.0": {
        "dependencies": {
          "missing-dep": "^1.0.0"
        }
      },
      
      // 3. 添加peerDependenciesMeta
      "webpack@5": {
        "peerDependenciesMeta": {
          "webpack-cli": {
            "optional": true
          }
        }
      }
    }
  }
}`
                        },
                        {
                            title: '对比hooks',
                            code: `// packageExtensions
{
  "pnpm": {
    "packageExtensions": {
      "pkg@1.0.0": {
        "peerDependencies": {
          "react": "^18.0.0"
        }
      }
    }
  }
}
# 优势：
# - 声明式配置
# - 易于维护
# - 团队共享

// hooks (.pnpmfile.cjs)
function readPackage(pkg) {
  if (pkg.name === 'pkg' && pkg.version === '1.0.0') {
    pkg.peerDependencies = { react: '^18.0.0' }
  }
  return pkg
}
# 优势：
# - 可编程
# - 更灵活
# - 复杂逻辑

# 选择：
# - 简单修复 -> packageExtensions
# - 复杂逻辑 -> hooks`
                        }
                    ]
                },
                source: 'pnpm官方文档 - packageExtensions'
            }
        },
        
        // 困难题 1 - 代码题
        {
            type: 'quiz-code',
            title: '题目7：依赖注入',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['依赖注入', 'nohoist'],
                question: '如何强制某个包不使用store中的共享版本？',
                code: `# 场景：pkg-a必须使用独立的lodash
# 不能与其他包共享
# 如何配置？`,
                options: [
                    '使用file:协议',
                    '配置public-hoist-pattern',
                    '使用nohoist或dependenciesMeta',
                    '删除store中的lodash'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '依赖隔离技术',
                    description: '某些场景需要完全隔离依赖，避免共享。',
                    sections: [
                        {
                            title: 'dependenciesMeta配置',
                            code: `{
  "dependencies": {
    "pkg-a": "^1.0.0"
  },
  "pnpm": {
    "dependenciesMeta": {
      "pkg-a": {
        "injected": true
      }
    }
  }
}

# 效果：
# pkg-a及其依赖会被注入到node_modules
# 不使用硬链接
# 完全隔离

node_modules/
├── pkg-a/            # 注入的完整副本
│   └── node_modules/
│       └── lodash/   # pkg-a专属的lodash
└── lodash/           # 其他包共享的lodash`
                        },
                        {
                            title: 'nohoist（Yarn兼容）',
                            code: `// package.json (workspace根)
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/pkg-a",
      "**/pkg-a/**"
    ]
  }
}

# pnpm等价配置
.npmrc:
public-hoist-pattern[]=!pkg-a

# 效果：pkg-a不提升，保持在自己的node_modules`
                        },
                        {
                            title: '使用场景',
                            code: `// 场景1：版本冲突
// app需要lodash@4，pkg-a只能用lodash@3
{
  "dependencies": {
    "lodash": "^4.17.21",
    "pkg-a": "^1.0.0"  // 内部用lodash@3
  },
  "pnpm": {
    "dependenciesMeta": {
      "pkg-a": {
        "injected": true  // 隔离pkg-a的lodash@3
      }
    }
  }
}

// 场景2：原生模块
// 需要针对特定Node版本编译
{
  "pnpm": {
    "dependenciesMeta": {
      "node-sass": {
        "injected": true  // 避免共享预编译版本
      }
    }
  }
}

// 场景3：测试隔离
{
  "devDependencies": {
    "test-framework": "^1.0.0"
  },
  "pnpm": {
    "dependenciesMeta": {
      "test-framework": {
        "injected": true  // 测试环境完全隔离
      }
    }
  }
}`
                        },
                        {
                            title: '性能权衡',
                            code: `# 共享 vs 隔离

共享（默认）：
优势：
- 节省磁盘空间
- 安装速度快
- 内存占用少
劣势：
- 可能版本冲突
- 某些包不兼容

隔离（injected）：
优势：
- 完全独立
- 避免冲突
- 符合某些工具预期
劣势：
- 占用更多空间
- 安装稍慢
- 重复文件

# 建议：
# 默认使用共享
# 只在必要时隔离：
# - 原生模块
# - 版本严格的包
# - 不兼容符号链接的工具`
                        }
                    ]
                },
                source: 'pnpm官方文档 - dependenciesMeta'
            }
        },
        
        // 困难题 2 - 多选题
        {
            type: 'quiz',
            title: '题目8：包别名',
            content: {
                questionType: 'multiple',
                difficulty: 'hard',
                tags: ['别名', 'npm:协议', '多选题'],
                question: 'npm:协议可以实现哪些功能？',
                options: [
                    '给包起别名',
                    '安装不同版本的同一个包',
                    '从特定registry安装',
                    '重命名导入路径'
                ],
                correctAnswer: [0, 1],
                explanation: {
                    title: 'npm:协议详解',
                    description: 'npm:协议提供强大的包别名和多版本能力。',
                    sections: [
                        {
                            title: '包别名',
                            code: `{
  "dependencies": {
    "lodash-es": "npm:lodash@^4.17.21"
  }
}

# 效果：
# 安装lodash，但导入时用lodash-es

// 代码中
import _ from 'lodash-es'
// 实际使用的是lodash包

# 使用场景：
# 1. 包名冲突
# 2. 迁移过渡期
# 3. 命名规范化`
                        },
                        {
                            title: '多版本共存',
                            code: `{
  "dependencies": {
    "react-16": "npm:react@16.14.0",
    "react-17": "npm:react@17.0.2",
    "react-18": "npm:react@18.2.0"
  }
}

// 代码中同时使用
import React16 from 'react-16'
import React17 from 'react-17'
import React18 from 'react-18'

// 测试兼容性
test('works with React 16', () => {
  const { render } = createRenderer(React16)
})

test('works with React 17', () => {
  const { render } = createRenderer(React17)
})`
                        },
                        {
                            title: '实际案例',
                            code: `// 案例1：迁移包名
// lodash -> lodash-es
{
  "dependencies": {
    "lodash": "npm:lodash-es@^4.17.21"
  }
}
// 代码不用改，import from 'lodash'自动使用lodash-es

// 案例2：测试多版本
{
  "devDependencies": {
    "webpack4": "npm:webpack@4",
    "webpack5": "npm:webpack@5"
  },
  "scripts": {
    "test:webpack4": "webpack4 build",
    "test:webpack5": "webpack5 build"
  }
}

// 案例3：包冲突解决
// 项目依赖chalk@5，但某个老工具只支持chalk@4
{
  "dependencies": {
    "chalk": "^5.0.0",
    "chalk4": "npm:chalk@^4.0.0",
    "old-tool": "^1.0.0"  // 配合hooks使其使用chalk4
  }
}`
                        },
                        {
                            title: '与overrides对比',
                            code: `// npm:协议（别名）
{
  "dependencies": {
    "my-react": "npm:react@17.0.2"  // 安装react 17
  }
}
# 创建别名，不影响其他包的react

// overrides（全局替换）
{
  "pnpm": {
    "overrides": {
      "react": "17.0.2"  // 所有react都用17.0.2
    }
  }
}
# 影响所有依赖的react

# 选择：
# - 需要多版本共存 -> npm:协议
# - 需要统一版本 -> overrides`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Aliases'
            }
        },
        
        // 困难题 3 - 代码题
        {
            type: 'quiz-code',
            title: '题目9：安全审计',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['安全', 'audit'],
                question: '如何配置pnpm的安全审计策略？',
                code: `# CI中自动检查依赖漏洞
# 高危漏洞阻止部署
# 如何实现？`,
                options: [
                    '使用pnpm audit',
                    '配置audit-level + CI集成',
                    '手动检查每个包',
                    '使用第三方工具'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm安全审计',
                    description: '集成安全审计到开发和CI流程。',
                    sections: [
                        {
                            title: '基础审计',
                            code: `# 运行审计
pnpm audit

# 输出：
┌───────────────┬──────────────────┐
│ Severity      │ Count            │
├───────────────┼──────────────────┤
│ Critical      │ 2                │
│ High          │ 5                │
│ Moderate      │ 10               │
│ Low           │ 3                │
└───────────────┴──────────────────┘

# 修复漏洞
pnpm audit --fix
# 自动升级到安全版本

# 详细报告
pnpm audit --json > audit-report.json`
                        },
                        {
                            title: '配置审计级别',
                            code: `# .npmrc
audit-level=high

# 级别选项：
# - low: 所有漏洞都报告
# - moderate: 中等及以上
# - high: 高危及以上
# - critical: 仅严重漏洞

# CI中使用
.github/workflows/security.yml:
- name: Security audit
  run: pnpm audit --audit-level=high
  # 有high+漏洞时失败`
                        },
                        {
                            title: 'CI集成',
                            code: `# .github/workflows/security.yml
name: Security Audit

on:
  push:
  schedule:
    - cron: '0 0 * * 0'  # 每周检查

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run audit
        run: pnpm audit --audit-level=high
        continue-on-error: true
        id: audit
        
      - name: Upload audit report
        if: failure()
        run: |
          pnpm audit --json > audit-report.json
          # 上传到安全平台
          
      - name: Create issue
        if: steps.audit.outcome == 'failure'
        uses: actions/create-issue@v1
        with:
          title: 'Security vulnerabilities detected'
          body: 'Run pnpm audit to see details'`
                        },
                        {
                            title: '忽略特定漏洞',
                            code: `// package.json
{
  "pnpm": {
    "auditConfig": {
      "ignoreCves": [
        "CVE-2021-12345",  // 已评估，风险可接受
        "CVE-2022-67890"   // 等待官方修复
      ]
    }
  }
}

# 或使用.npmrc
audit-exclude[]=CVE-2021-12345

# 注意：
# 1. 必须有充分理由
# 2. 需要文档说明
# 3. 定期复审
# 4. 在issue中跟踪`
                        },
                        {
                            title: '最佳实践',
                            code: `// 1. 定期审计
package.json:
{
  "scripts": {
    "audit": "pnpm audit --audit-level=moderate",
    "audit:fix": "pnpm audit --fix",
    "preinstall": "pnpm audit --production"
  }
}

// 2. Git hooks
// .husky/pre-push
pnpm audit --audit-level=high

// 3. 监控仪表板
// 使用Snyk、Dependabot等工具

// 4. 分层策略
.npmrc (开发):
audit-level=moderate

.npmrc (生产):
audit-level=high
strict-peer-dependencies=true`
                        }
                    ]
                },
                source: 'pnpm官方文档 - pnpm audit'
            }
        },
        
        // 困难题 4
        {
            type: 'quiz',
            title: '题目10：高级特性综合',
            content: {
                questionType: 'single',
                difficulty: 'hard',
                tags: ['综合应用', '最佳实践'],
                question: '企业级monorepo应该如何配置pnpm？',
                options: [
                    '使用默认配置即可',
                    '严格模式 + 安全审计 + 依赖管理',
                    '只配置workspace',
                    '关闭所有检查以提升速度'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '企业级pnpm配置',
                    description: '综合运用各种特性构建稳定可靠的monorepo。',
                    sections: [
                        {
                            title: '完整配置示例',
                            code: `# .npmrc (企业级配置)

# === 基础配置 ===
registry=https://registry.npmjs.org
store-dir=~/.pnpm-store

# === 严格模式 ===
strict-peer-dependencies=true
auto-install-peers=true
prefer-workspace-packages=true

# === 安全性 ===
audit-level=high
ignore-scripts=false

# === 性能优化 ===
network-concurrency=16
fetch-retries=5
fetch-timeout=60000
workspace-concurrency=4

# === 锁定版本 ===
save-exact=false
save-prefix='^'

# === 依赖提升 ===
hoist=false
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*

# === CI模式 ===
# frozen-lockfile=true
# prefer-frozen-lockfile=true`
                        },
                        {
                            title: 'package.json配置',
                            code: `{
  "private": true,
  "packageManager": "pnpm@8.0.0",
  
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "install": "pnpm install --frozen-lockfile",
    "audit": "pnpm audit --audit-level=high",
    "outdated": "pnpm outdated -r"
  },
  
  "pnpm": {
    // 依赖覆盖
    "overrides": {
      "minimist": "^1.2.6"
    },
    
    // 包扩展
    "packageExtensions": {
      "react-redux@6": {
        "peerDependencies": {
          "react": ">=16.8.0"
        }
      }
    },
    
    // 审计配置
    "auditConfig": {
      "ignoreCves": []
    },
    
    // 依赖元数据
    "dependenciesMeta": {
      "native-module": {
        "injected": true
      }
    }
  }
}`
                        },
                        {
                            title: 'hooks配置',
                            code: `// .pnpmfile.cjs
function readPackage(pkg, context) {
  // 1. 统一React版本
  const REACT_VERSION = '18.2.0'
  if (pkg.dependencies?.react) {
    pkg.dependencies.react = REACT_VERSION
  }
  
  // 2. 修复peer依赖
  if (pkg.name === 'problematic-package') {
    pkg.peerDependencies = {
      ...pkg.peerDependencies,
      'missing-peer': '^1.0.0'
    }
  }
  
  // 3. 移除不安全的包
  if (pkg.dependencies?.['vulnerable-pkg']) {
    delete pkg.dependencies['vulnerable-pkg']
    console.warn(\`Removed vulnerable-pkg from \${pkg.name}\`)
  }
  
  return pkg
}

function afterAllResolved(lockfile, context) {
  // 统计和报告
  const packages = Object.keys(lockfile.packages)
  console.log(\`Total packages: \${packages.length}\`)
  
  // 检查禁用的包
  const banned = ['moment', 'request']
  packages.forEach(pkg => {
    banned.forEach(ban => {
      if (pkg.includes(ban)) {
        console.warn(\`⚠️  Found banned package: \${pkg}\`)
      }
    })
  })
  
  return lockfile
}

module.exports = {
  hooks: {
    readPackage,
    afterAllResolved
  }
}`
                        },
                        {
                            title: 'CI/CD配置',
                            code: `# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
          
      - name: Install
        run: pnpm install --frozen-lockfile
        
      - name: Audit
        run: pnpm audit --audit-level=high
        
      - name: Check outdated
        run: pnpm outdated -r
        continue-on-error: true
        
  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - run: pnpm -r run lint
      
  test:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - run: pnpm -r --parallel run test
      
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: pnpm -r run build`
                        },
                        {
                            title: '监控和维护',
                            code: `// package.json
{
  "scripts": {
    // 日常维护
    "check": "pnpm audit && pnpm outdated",
    "clean": "pnpm store prune",
    "update": "pnpm update -r --latest",
    
    // 依赖分析
    "why": "pnpm why",
    "list": "pnpm list -r --depth=999",
    "graph": "pnpm list -r --depth=999 --json > deps.json",
    
    // 安全检查
    "audit:fix": "pnpm audit --fix",
    "audit:report": "pnpm audit --json > audit.json"
  }
}

// 定期任务
// 1. 每周运行pnpm outdated
// 2. 每月运行pnpm audit
// 3. 季度依赖大升级
// 4. 持续监控构建时间和包大小`
                        }
                    ]
                },
                source: 'pnpm官方文档 - Configuration'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第23章：pnpm Workspaces',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=23'
        },
        next: {
            title: '第25章：pnpm性能优化',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=25'
        }
    }
};
