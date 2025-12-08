/**
 * 第26章：依赖冲突解决
 * 版本冲突、resolutions/overrides、peer依赖、去重
 */

window.content = {
    section: {
        title: '第26章：依赖冲突解决',
        icon: '🔧'
    },
    
    topics: [
        {
            type: 'concept',
            title: '依赖冲突类型',
            content: {
                description: '依赖冲突是包管理中最常见的问题，了解冲突类型是解决问题的第一步。',
                keyPoints: [
                    '版本冲突：不同包依赖同一包的不同版本',
                    'peer依赖冲突：peer版本不匹配',
                    '重复依赖：相同包安装多次',
                    '循环依赖：A依赖B，B依赖A',
                    '平台依赖：不同系统依赖不同',
                    '间接依赖：传递依赖冲突',
                    'breaking change：不兼容版本'
                ]
            }
        },
        
        {
            type: 'principle',
            title: '版本冲突原理',
            content: {
                description: '版本冲突发生在依赖树中同一个包有多个不兼容版本时，包管理器需要解决如何安装。',
                mechanism: 'npm/yarn通过扁平化算法尝试提升兼容版本，不兼容版本嵌套安装。pnpm严格隔离每个版本。overrides/resolutions可强制统一版本。',
                keyPoints: [
                    '语义化版本：^1.0.0可兼容1.x.x',
                    '版本范围：不同范围可能交集为空',
                    '提升算法：选择最匹配的版本',
                    '嵌套安装：不兼容版本独立安装',
                    '强制统一：resolutions/overrides',
                    '锁文件固定：确定性安装'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '版本冲突示例',
            content: {
                description: '实际案例展示版本冲突的产生和解决。',
                examples: [
                    {
                        title: '版本冲突场景',
                        code: `// 场景：lodash版本冲突

// package.json
{
  "dependencies": {
    "package-a": "^1.0.0",  // 依赖 lodash@^3.0.0
    "package-b": "^2.0.0",  // 依赖 lodash@^4.0.0
    "lodash": "^4.17.21"    // 直接依赖
  }
}

// npm/yarn结果：
node_modules/
├── lodash@4.17.21  ← 提升到顶层（满足package-b和直接依赖）
├── package-a/
│   └── node_modules/
│       └── lodash@3.10.1  ← 嵌套安装（package-a的版本）
└── package-b/  ← 使用顶层的4.17.21

// pnpm结果：
node_modules/
├── .pnpm/
│   ├── lodash@3.10.1/
│   ├── lodash@4.17.21/
│   ├── package-a@1.0.0/
│   │   └── node_modules/
│   │       └── lodash → lodash@3.10.1
│   └── package-b@2.0.0/
│       └── node_modules/
│           └── lodash → lodash@4.17.21
├── lodash → .pnpm/lodash@4.17.21
├── package-a → .pnpm/package-a@1.0.0
└── package-b → .pnpm/package-b@2.0.0

// 问题：两个版本的lodash，增加包体积`,
                        notes: '版本冲突导致重复安装'
                    },
                    {
                        title: '检查版本冲突',
                        code: `# npm检查重复包
npm ls lodash
# 输出：
# ├── lodash@4.17.21
# └─┬ package-a@1.0.0
#   └── lodash@3.10.1

# yarn检查
yarn why lodash
# 输出所有引入lodash的路径

# pnpm检查
pnpm why lodash
# 或
pnpm list lodash --depth 100

# 查看所有版本冲突
npm ls | grep "deduped"  # npm7+会显示去重信息`,
                        notes: '先诊断再解决'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'resolutions/overrides机制',
            content: {
                description: 'resolutions（Yarn）和overrides（npm/pnpm）允许强制整个依赖树使用指定版本，解决冲突和安全问题。',
                mechanism: '在package.json中声明强制版本规则，包管理器解析依赖时忽略子依赖的版本声明，统一使用指定版本。',
                keyPoints: [
                    'Yarn: resolutions字段',
                    'npm: overrides字段（v8.3+）',
                    'pnpm: pnpm.overrides字段',
                    '全局覆盖：影响所有依赖',
                    '选择性覆盖：只覆盖特定路径',
                    '安全修复：强制使用安全版本',
                    '版本统一：消除重复'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'resolutions/overrides使用',
            content: {
                description: '强制统一依赖版本的各种方式。',
                examples: [
                    {
                        title: 'Yarn resolutions',
                        code: `// package.json
{
  "name": "my-app",
  "dependencies": {
    "package-a": "^1.0.0",
    "package-b": "^2.0.0"
  },
  "resolutions": {
    // 全局：所有lodash使用4.17.21
    "lodash": "4.17.21",
    
    // 只覆盖package-a的lodash
    "package-a/lodash": "4.17.21",
    
    // 深层覆盖：package-a的依赖package-c的lodash
    "package-a/package-c/lodash": "4.17.21",
    
    // 通配符：所有包的所有版本的lodash
    "**/lodash": "4.17.21",
    
    // 版本范围
    "lodash": "^4.17.0"
  }
}

# 安装后检查
yarn why lodash
# 应该只有一个版本4.17.21`,
                        notes: 'Yarn resolutions功能强大'
                    },
                    {
                        title: 'npm overrides',
                        code: `// package.json (npm 8.3+)
{
  "overrides": {
    // 全局覆盖
    "lodash": "4.17.21",
    
    // 只覆盖package-a的直接依赖
    "package-a": {
      "lodash": "4.17.21"
    },
    
    // 深层覆盖
    "package-a": {
      "package-c": {
        "lodash": "4.17.21"
      }
    },
    
    // 使用引用（引用直接依赖的版本）
    "lodash": "$lodash"
  }
}

# npm install后验证
npm ls lodash`,
                        notes: 'npm 8.3+支持overrides'
                    },
                    {
                        title: 'pnpm overrides',
                        code: `// package.json
{
  "pnpm": {
    "overrides": {
      // 全局覆盖
      "lodash": "4.17.21",
      
      // 只覆盖特定包的依赖
      "package-a>lodash": "4.17.21",
      
      // 深层覆盖
      "package-a>package-c>lodash": "4.17.21",
      
      // 通配符
      "lodash@<4.17.20": "4.17.21"
    }
  }
}

# pnpm install后验证
pnpm why lodash`,
                        notes: 'pnpm语法略有不同'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '实战：修复安全漏洞',
            content: {
                description: '使用overrides快速修复第三方包的安全漏洞。',
                examples: [
                    {
                        title: '安全漏洞修复',
                        code: `# 场景：npm audit发现漏洞

npm audit
# 输出：
# lodash  <4.17.21  Severity: high
#   Prototype Pollution
#   fix available via \`npm audit fix\`

# 但npm audit fix可能不能修复（因为是间接依赖）

# 解决：使用overrides强制版本

// package.json
{
  "overrides": {
    "lodash": "4.17.21"  // 强制所有lodash使用安全版本
  }
}

npm install

# 再次审计
npm audit
# 应该没有lodash的漏洞了

# Yarn类似
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}`,
                        notes: 'overrides快速修复安全问题'
                    },
                    {
                        title: '批量修复多个漏洞',
                        code: `// package.json
{
  "overrides": {
    // 修复lodash漏洞
    "lodash": "4.17.21",
    
    // 修复minimist漏洞
    "minimist": "1.2.6",
    
    // 修复ansi-regex漏洞
    "ansi-regex": "5.0.1",
    
    // 修复特定包的依赖漏洞
    "package-a": {
      "axios": "1.6.0"
    }
  }
}

# 一次性修复多个漏洞
npm install
npm audit`,
                        notes: '集中管理安全版本'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'peer依赖冲突',
            content: {
                description: 'peer依赖要求宿主环境提供特定版本，冲突时需要仔细处理以避免运行时错误。',
                mechanism: 'peer依赖不会自动安装（npm7+例外），需要手动安装或配置自动安装。版本不匹配会导致警告或错误。',
                keyPoints: [
                    'peer声明：peerDependencies',
                    '宿主提供：由使用者安装',
                    '版本约束：必须满足范围',
                    '运行时依赖：不满足可能崩溃',
                    'npm7+自动安装：可能冲突',
                    'pnpm严格检查：推荐配置'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'peer依赖冲突解决',
            content: {
                description: 'peer依赖冲突的诊断和解决方法。',
                examples: [
                    {
                        title: 'peer依赖冲突场景',
                        code: `// 场景：React版本冲突

// package.json
{
  "dependencies": {
    "react": "^17.0.0",
    "react-router": "^6.0.0"  // peerDeps: react@>=18.0.0
  }
}

# npm install输出：
# npm WARN react-router@6.0.0 requires a peer of react@>=18.0.0
# but react@17.0.2 was installed

# 问题：react-router期望React 18，但安装了React 17

# 解决方案1：升级React（推荐）
npm install react@^18.0.0 react-dom@^18.0.0

# 解决方案2：降级react-router
npm install react-router@^5.0.0  # 兼容React 17

# 解决方案3：使用overrides强制（不推荐，可能崩溃）
{
  "overrides": {
    "react-router": {
      "react": "^17.0.0"
    }
  }
}`,
                        notes: 'peer冲突通常需要升级'
                    },
                    {
                        title: 'pnpm peer依赖配置',
                        code: `# .npmrc

# 自动安装peer依赖
auto-install-peers=true

# 严格peer依赖（不满足会失败）
strict-peer-dependencies=false  # 默认false，只警告

# 如果设置为true
strict-peer-dependencies=true

pnpm install
# 输出：
# ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies
# react-router requires react@>=18.0.0 but 17.0.2 was installed

# 必须解决peer冲突才能安装成功`,
                        notes: 'pnpm可以强制peer检查'
                    },
                    {
                        title: '多个peer依赖冲突',
                        code: `// 场景：多个UI库冲突

{
  "dependencies": {
    "react": "^18.0.0",
    "@mui/material": "^5.0.0",     // peer: @emotion/react, @emotion/styled
    "@chakra-ui/react": "^2.0.0",  // peer: @emotion/react@^11, framer-motion
    "styled-components": "^6.0.0"  // 不需要@emotion
  }
}

# 问题：
# 1. @mui和@chakra都依赖@emotion，但版本可能不同
# 2. @chakra还需要framer-motion
# 3. styled-components是另一个CSS-in-JS方案

# 解决：
# 1. 检查peer要求
npm info @mui/material peerDependencies
npm info @chakra-ui/react peerDependencies

# 2. 安装所有peer
npm install @emotion/react @emotion/styled framer-motion

# 3. 如果版本冲突，使用resolutions
{
  "resolutions": {
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0"
  }
}`,
                        notes: '复杂项目需要仔细管理peer'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '依赖去重',
            content: {
                description: '减少重复依赖，优化包体积和安装速度。',
                examples: [
                    {
                        title: 'npm去重',
                        code: `# npm自动去重（安装时）
npm install

# 手动去重
npm dedupe
# 或
npm ddp

# 检查去重效果
npm ls lodash
# 输出：
# ├── lodash@4.17.21
# ├─┬ package-a@1.0.0
# │ └── lodash@4.17.21 deduped  ← 去重标记

# 去重原理：
# 如果子依赖的版本满足顶层版本范围
# 则删除子依赖，使用顶层版本

# 场景：
# 顶层：lodash@^4.17.0
# package-a：lodash@^4.10.0
# 由于^4.17.0满足^4.10.0，去重成功`,
                        notes: 'dedupe减少重复'
                    },
                    {
                        title: 'Yarn去重',
                        code: `# Yarn Berry去重
yarn dedupe

# 检查重复包
yarn why lodash

# 强制去重（使用resolutions）
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}

yarn install

# Yarn会智能选择最优版本
# 满足所有依赖范围的最新版本`,
                        notes: 'Yarn自动优化依赖树'
                    },
                    {
                        title: 'pnpm去重',
                        code: `# pnpm自动去重（store级别）
# 相同内容的文件只存储一次

# 检查重复
pnpm list lodash --depth 100

# pnpm的去重是自动的：
# 1. 内容寻址：相同文件共享inode
# 2. 硬链接：零额外空间
# 3. 严格隔离：每个包独立，但共享文件

# 不需要手动dedupe命令`,
                        notes: 'pnpm天然去重'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '冲突解决方案对比',
            content: {
                description: '各包管理器的冲突解决能力对比。',
                items: [
                    {
                        name: 'pnpm',
                        pros: [
                            '严格隔离：每个包独立',
                            'overrides：强制版本',
                            'auto-install-peers：自动peer',
                            'strict-peer：可强制检查',
                            '天然去重：store级别'
                        ]
                    },
                    {
                        name: 'Yarn',
                        pros: [
                            'resolutions：功能最强',
                            '通配符：灵活匹配',
                            '智能提升：优化依赖树'
                        ]
                    },
                    {
                        name: 'npm',
                        pros: [
                            'overrides：v8.3+支持',
                            'dedupe：手动去重',
                            'npm7+：自动peer'
                        ],
                        cons: [
                            'overrides较新：老版本不支持'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '依赖冲突最佳实践',
            content: {
                description: '预防和解决依赖冲突的最佳实践。',
                keyPoints: [
                    '版本范围：使用^而非*，避免过于宽松',
                    '定期更新：及时升级依赖，减少累积冲突',
                    'peer检查：注意peer依赖警告',
                    'overrides谨慎：只在必要时使用',
                    'npm audit：定期安全审计',
                    '锁文件提交：确保团队一致',
                    'CI检查：自动检测冲突',
                    '文档记录：说明为何使用overrides',
                    '最小化依赖：减少间接依赖',
                    'Monorepo统一：统一版本管理'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第25章：pnpm性能优化',
            url: './render.html?subject=pkg-manager&type=content&chapter=25'
        },
        next: {
            title: '第27章：锁文件管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=27'
        }
    }
};
