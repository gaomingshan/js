/**
 * 第9章：依赖版本管理
 * 深入理解版本号语法、package-lock.json机制、锁文件冲突解决
 */

window.content = {
    section: {
        title: '第9章：依赖版本管理',
        icon: '🔢'
    },
    
    topics: [
        {
            type: 'concept',
            title: '版本管理的重要性',
            content: {
                description: '依赖版本管理是确保项目稳定性和可重复构建的关键，不当的版本管理会导致"在我电脑上能跑"的问题。',
                keyPoints: [
                    '一致性：确保团队所有成员使用相同版本的依赖',
                    '可重复性：任何时候都能重现完全相同的构建结果',
                    '稳定性：避免依赖更新导致的意外破坏',
                    '安全性：及时发现和修复已知漏洞',
                    'semver：语义化版本规范是版本管理的基础',
                    '锁文件：package-lock.json记录确切版本'
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'semver版本号详解',
            content: {
                description: 'Semantic Versioning（semver）是版本号命名规范，格式为MAJOR.MINOR.PATCH，明确表达版本变更的影响范围。',
                mechanism: 'semver通过三位数字传达变更信息：MAJOR表示不兼容变更，MINOR表示向下兼容的新功能，PATCH表示向下兼容的bug修复。',
                keyPoints: [
                    'MAJOR（主版本）：不兼容的API变更，如1.0.0→2.0.0',
                    'MINOR（次版本）：向下兼容的功能新增，如1.0.0→1.1.0',
                    'PATCH（修订版本）：向下兼容的bug修复，如1.0.0→1.0.1',
                    '先行版本：1.0.0-alpha、1.0.0-beta、1.0.0-rc.1',
                    '版本优先级：1.0.0-alpha < 1.0.0-beta < 1.0.0',
                    '初始开发：0.x.x表示初始开发阶段，API不稳定'
                ],
                mdn: 'https://semver.org/lang/zh-CN/'
            }
        },
        
        {
            type: 'code-example',
            title: 'semver版本范围语法',
            content: {
                description: 'package.json中使用特殊符号指定版本范围，理解这些语法是版本管理的基础。',
                examples: [
                    {
                        title: '基本语法',
                        code: `{
  "dependencies": {
    // 精确版本
    "pkg1": "1.2.3",          // 只安装1.2.3
    
    // 插入号^（默认）
    "pkg2": "^1.2.3",         // >=1.2.3 <2.0.0
    "pkg3": "^0.2.3",         // >=0.2.3 <0.3.0 (0.x特殊处理)
    "pkg4": "^0.0.3",         // >=0.0.3 <0.0.4 (0.0.x更严格)
    
    // 波浪号~
    "pkg5": "~1.2.3",         // >=1.2.3 <1.3.0
    "pkg6": "~1.2",           // >=1.2.0 <1.3.0
    "pkg7": "~1",             // >=1.0.0 <2.0.0
    
    // 大于小于
    "pkg8": ">1.2.3",         // 大于1.2.3
    "pkg9": ">=1.2.3",        // 大于等于1.2.3
    "pkg10": "<2.0.0",        // 小于2.0.0
    "pkg11": "<=1.9.9"        // 小于等于1.9.9
  }
}`,
                        notes: '^是npm install默认使用的版本范围'
                    },
                    {
                        title: '高级语法',
                        code: `{
  "dependencies": {
    // 范围组合
    "pkg1": ">=1.2.3 <2.0.0",     // 1.2.3到2.0.0之间
    "pkg2": "1.2.3 - 2.3.4",      // 等同于>=1.2.3 <=2.3.4
    
    // 通配符x或*
    "pkg3": "1.2.x",              // >=1.2.0 <1.3.0
    "pkg4": "1.x",                // >=1.0.0 <2.0.0
    "pkg5": "*",                  // 任何版本（不推荐）
    
    // 或运算符||
    "pkg6": "1.x || 2.x",         // 1.x或2.x
    
    // latest和next标签
    "pkg7": "latest",             // 最新稳定版
    "pkg8": "next",               // 下一个版本（可能不稳定）
    
    // 指定Git仓库
    "pkg9": "user/repo",
    "pkg10": "git+https://github.com/user/repo.git",
    "pkg11": "git+https://github.com/user/repo.git#v1.0.0"
  }
}`,
                        notes: '灵活使用版本语法，但要注意稳定性'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '^波浪号 vs ~插入号',
            content: {
                description: '^和~是最常用的版本范围符号，理解它们的区别对于版本管理至关重要。',
                items: [
                    {
                        name: '^插入号（Caret）',
                        pros: [
                            '更新范围大：允许MINOR和PATCH更新',
                            '获取新功能：自动获取向下兼容的新功能',
                            'npm默认：npm install默认使用^',
                            '适合库依赖：通常库遵循semver'
                        ],
                        cons: [
                            '可能破坏：虽然理论兼容，实际可能有问题',
                            '不确定性：不同时间安装可能得到不同版本',
                            '0.x特殊：0.x版本行为不同'
                        ]
                    },
                    {
                        name: '~波浪号（Tilde）',
                        pros: [
                            '更保守：只允许PATCH更新',
                            '更稳定：只获取bug修复',
                            '风险小：破坏性变更概率低',
                            '适合应用：应用项目推荐使用'
                        ],
                        cons: [
                            '无新功能：不会自动获取新功能',
                            '安全更新：可能错过重要的安全修复',
                            '需要手动：要获取新功能需手动更新'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'package-lock.json工作机制',
            content: {
                description: 'package-lock.json记录了依赖树的确切版本和完整性信息，确保任何时候安装的依赖都完全相同。',
                mechanism: '首次npm install时，npm解析package.json的版本范围，下载最新符合条件的版本，并将确切版本、依赖树结构、完整性hash写入lock文件。后续安装优先使用lock文件中的版本。',
                keyPoints: [
                    '版本锁定：记录每个包的精确版本号',
                    '依赖树：记录完整的嵌套依赖结构',
                    'integrity：SHA-512完整性校验',
                    'resolved：包的下载地址',
                    '优先级高：有lock时优先使用lock中的版本',
                    '必须提交：应该提交到Git版本控制',
                    'npm ci专用：npm ci严格依赖lock文件'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'package-lock.json结构',
            content: {
                description: '理解lock文件的结构有助于理解依赖管理和解决冲突。',
                examples: [
                    {
                        title: 'package-lock.json示例',
                        code: `{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,  // npm 7+使用版本3
  "requires": true,
  "packages": {
    "": {  // 项目根
      "name": "my-app",
      "version": "1.0.0",
      "dependencies": {
        "lodash": "^4.17.21"
      },
      "devDependencies": {
        "eslint": "^8.30.0"
      }
    },
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="
    },
    "node_modules/eslint": {
      "version": "8.30.0",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-8.30.0.tgz",
      "integrity": "sha512-...",
      "dev": true,  // 标记为devDependency
      "dependencies": {
        "eslint-utils": "^3.0.0"
      }
    }
  }
}`,
                        notes: 'lock文件记录了完整的依赖信息'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '锁文件冲突解决',
            content: {
                description: '团队协作时，不同分支修改依赖会导致lock文件冲突，需要正确处理以避免破坏依赖树。',
                mechanism: 'Git merge时如果两个分支都修改了lock文件，会产生冲突。简单的手动合并可能破坏依赖树结构，应该重新生成lock文件。',
                keyPoints: [
                    '产生原因：不同分支安装了不同的包',
                    '错误处理：手动合并JSON可能破坏结构',
                    '正确方法：删除lock后重新安装',
                    'npm install：会自动修复冲突',
                    '提交顺序：先package.json，后lock文件',
                    'CI检查：CI中验证lock文件一致性'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '解决锁文件冲突',
            content: {
                description: '遇到lock文件冲突时的标准处理流程。',
                examples: [
                    {
                        title: '解决冲突的步骤',
                        code: `# 场景：git merge时出现lock文件冲突

# 1. 接受当前分支的package.json
git checkout --ours package.json

# 2. 删除lock文件
rm package-lock.json

# 3. 清理node_modules
rm -rf node_modules

# 4. 重新安装，生成新的lock文件
npm install

# 5. 提交新的lock文件
git add package-lock.json
git commit -m "chore: resolve lock file conflict"`,
                        notes: '重新生成lock文件是最安全的方法'
                    },
                    {
                        title: '使用npm自动解决',
                        code: `# npm 7+可以自动修复某些冲突

# 1. 保留package.json的变更
git checkout --ours package.json

# 2. npm install会自动修复lock
npm install

# 3. 如果还有问题，手动合并package.json
# 然后再次运行
npm install

# 验证依赖正确性
npm ls`,
                        notes: 'npm 7+的lock文件冲突处理更智能'
                    },
                    {
                        title: '预防冲突',
                        code: `# .gitattributes配置（预防冲突）
package-lock.json merge=npm-merge

# 配置npm-merge driver（需要安装工具）
git config merge.npm-merge.name "Auto-merge npm lockfiles"
git config merge.npm-merge.driver "npx npm-merge-driver merge %A %O %B %P"

# 或在团队中约定：
# 1. 一次只修改一个依赖
# 2. 频繁pull保持同步
# 3. 使用rebase而不是merge`,
                        notes: '预防胜于治疗'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '依赖更新策略',
            content: {
                description: '合理的依赖更新策略可以平衡稳定性和及时获取新功能、安全修复的需求。',
                mechanism: '定期检查过时依赖，评估更新风险，在测试环境验证后再部署到生产环境。使用自动化工具辅助更新决策。',
                keyPoints: [
                    '定期检查：每月运行npm outdated',
                    '分类更新：PATCH立即更新，MINOR谨慎，MAJOR评估',
                    '安全优先：npm audit发现的漏洞立即修复',
                    '测试验证：更新后运行完整测试套件',
                    '渐进更新：一次更新少量依赖',
                    '文档变更：查看CHANGELOG了解变更',
                    '版本锁定：关键依赖使用精确版本'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '依赖更新工作流',
            content: {
                description: '系统化的依赖更新流程可以降低风险，提高效率。',
                examples: [
                    {
                        title: '安全更新流程',
                        code: `# 1. 检查安全漏洞
npm audit

# 2. 自动修复（安全的更新）
npm audit fix

# 3. 查看需要手动处理的漏洞
npm audit fix --dry-run

# 4. 强制修复（可能破坏兼容性）
npm audit fix --force

# 5. 运行测试
npm test

# 6. 提交更新
git add package*.json
git commit -m "fix: update dependencies for security"`,
                        notes: '安全更新优先级最高'
                    },
                    {
                        title: '常规更新流程',
                        code: `# 1. 查看过时的包
npm outdated

# 2. 更新PATCH版本（最安全）
npm update

# 3. 查看MINOR/MAJOR更新
ncu

# 4. 选择性更新
ncu -u lodash react
npm install

# 5. 运行测试套件
npm test
npm run lint

# 6. 查看应用运行状态
npm run dev  # 手动测试

# 7. 提交更新
git add package*.json
git commit -m "chore: update dependencies"`,
                        notes: '分步更新，逐步验证'
                    },
                    {
                        title: '使用Renovate/Dependabot自动化',
                        code: `# Renovate配置（renovate.json）
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "updateTypes": ["patch"],
      "automerge": true  // PATCH自动合并
    },
    {
      "updateTypes": ["minor"],
      "labels": ["dependencies"],
      "reviewers": ["team:developers"]
    },
    {
      "updateTypes": ["major"],
      "labels": ["breaking-change"],
      "assignees": ["@lead-developer"]
    }
  ]
}

# Dependabot配置（.github/dependabot.yml）
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10`,
                        notes: '自动化工具提高更新效率'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '依赖版本管理最佳实践',
            content: {
                description: '良好的版本管理习惯是项目稳定性的保障。',
                keyPoints: [
                    '提交lock文件：必须提交package-lock.json到Git',
                    '使用npm ci：CI/CD环境使用npm ci而不是npm install',
                    '版本范围选择：应用用~，库用^',
                    '关键依赖精确：核心依赖使用精确版本',
                    '定期更新：每月检查和更新依赖',
                    '安全优先：及时修复npm audit发现的漏洞',
                    '测试验证：更新后必须运行完整测试',
                    '文档记录：重大更新记录在CHANGELOG'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第8章：npm scripts脚本',
            url: './render.html?subject=pkg-manager&type=content&chapter=08'
        },
        next: {
            title: '第10章：npm link本地开发',
            url: './render.html?subject=pkg-manager&type=content&chapter=10'
        }
    }
};
