/**
 * 第3章：包管理器工作原理 - 面试题
 * 10道精选面试题：测试对包管理器内部机制和原理的理解
 */

window.content = {
    section: {
        title: '第3章：包管理器工作原理 - 面试题',
        icon: '💡'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm install执行流程',
            content: {
                difficulty: 'easy',
                question: 'npm install的基本执行流程是什么？',
                options: [
                    '直接从网络下载到node_modules',
                    '读取package.json → 解析依赖 → 下载到缓存 → 复制到node_modules',
                    '只是创建一些文件',
                    '从GitHub直接clone代码'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm install流程',
                    content: 'npm install执行步骤：\n\n1. 检查配置\n   - 读取.npmrc\n   - 确定registry\n\n2. 解析依赖\n   - 读取package.json\n   - 构建依赖树\n   - 检查lock文件\n\n3. 下载包\n   - 并行下载tarball\n   - 验证完整性（sha512）\n   - 存储到缓存\n\n4. 提取文件\n   - 从缓存复制到node_modules\n   - 解压tarball\n   - 创建目录结构\n\n5. 生成lock文件\n   - 记录精确版本\n   - 保证确定性\n\n6. 执行钩子\n   - preinstall/postinstall\n   - 构建native模块'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：package-lock.json作用',
            content: {
                difficulty: 'easy',
                question: 'package-lock.json的主要作用是什么？',
                options: [
                    '只是占用磁盘空间',
                    '锁定依赖版本，确保安装一致性',
                    '备份package.json',
                    '提高安装速度'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Lock文件的作用',
                    content: 'package-lock.json核心功能：\n\n1. 版本锁定\n   - 记录精确版本号\n   - 记录完整依赖树\n\n2. 确定性安装\n   - 同样的lock → 同样的node_modules\n   - 避免"在我机器上可以运行"\n\n3. 性能优化\n   - 跳过版本解析\n   - 直接从缓存安装\n\n4. 完整性校验\n   - 包含sha512哈希\n   - 验证包未被篡改\n\n5. 依赖追溯\n   - 记录依赖路径\n   - 方便问题排查\n\n必须提交：\n- 应用项目必须提交\n- 库项目可选（有争议）\n- CI/CD使用npm ci'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：npm缓存位置',
            content: {
                difficulty: 'easy',
                question: 'npm缓存默认存储在哪里？',
                options: [
                    'node_modules/.cache',
                    '~/.npm（Linux/Mac）或 %AppData%/npm-cache（Windows）',
                    '项目根目录',
                    '不使用缓存'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm缓存',
                    content: 'npm缓存机制：\n\n1. 缓存位置\n   - Linux/Mac: ~/.npm\n   - Windows: %AppData%/npm-cache\n   - 查看: npm config get cache\n\n2. 缓存结构\n```\n~/.npm/\n├── _cacache/  (内容寻址缓存)\n│   ├── content-v2/  (包内容)\n│   └── index-v5/    (索引)\n└── _logs/  (日志)\n```\n\n3. 缓存策略\n   - 基于包名+版本+integrity\n   - 永久缓存（除非手动清理）\n   - 离线可用\n\n4. 缓存管理\n```bash\nnpm cache verify  # 验证缓存\nnpm cache clean --force  # 清理\n```\n\n5. 优势\n   - 加速安装\n   - 离线安装\n   - 节省带宽'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：依赖版本解析',
            content: {
                difficulty: 'medium',
                question: '以下版本范围^1.2.3会匹配哪些版本？',
                code: `{
  "dependencies": {
    "lodash": "^1.2.3"
  }
}

可选版本：
1.2.3, 1.2.4, 1.3.0, 2.0.0`,
                options: [
                    '只有1.2.3',
                    '1.2.3到1.9.9',
                    '>=1.2.3 <2.0.0',
                    '所有版本'
                ],
                correctAnswer: 2,
                explanation: {
                    title: '版本范围解析',
                    content: '版本范围符号：\n\n1. ^ (Caret)\n   - 允许不改变最左非零位的更新\n   - ^1.2.3: >=1.2.3 <2.0.0\n   - ^0.2.3: >=0.2.3 <0.3.0\n   - ^0.0.3: >=0.0.3 <0.0.4\n\n2. ~ (Tilde)\n   - 允许patch更新\n   - ~1.2.3: >=1.2.3 <1.3.0\n   - ~1.2: >=1.2.0 <1.3.0\n\n3. 其他范围\n   - 1.2.x: 1.2.0到1.2.任意\n   - >1.2.3: 大于1.2.3\n   - >=1.2.3 <2.0.0: 范围\n   - *: 任意版本\n\n4. 特殊版本\n   - latest: 最新稳定版\n   - next: 下一个版本\n   - beta: 测试版\n\n实践：\n- 库开发: 使用^\n- 应用开发: 锁定版本\n- 关键依赖: 精确版本'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：npm ci vs npm install',
            content: {
                difficulty: 'medium',
                question: 'npm ci和npm install的主要区别是什么？',
                options: [
                    '没有区别，只是别名',
                    'ci更快，严格按lock安装，删除node_modules',
                    'ci用于国际化',
                    'install更快'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm ci特点',
                    content: 'npm ci (Clean Install)：\n\n1. 行为差异\n```bash\nnpm install:\n- 读取package.json\n- 更新lock文件\n- 安装到已有node_modules\n\nnpm ci:\n- 严格按lock文件\n- 不修改lock\n- 删除整个node_modules\n```\n\n2. 速度对比\n- npm ci: 快2-10倍\n- 跳过版本解析\n- 直接从缓存复制\n\n3. 使用场景\n```bash\n开发环境: npm install\nCI/CD: npm ci\n生产部署: npm ci\n```\n\n4. 要求\n- 必须有package-lock.json\n- lock和package.json必须一致\n- 不能用于安装单个包\n\n5. CI配置\n```yaml\n- run: npm ci --prefer-offline\n```\n\n优势：\n- 确定性\n- 快速\n- 干净环境'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：pnpm的内容寻址存储',
            content: {
                difficulty: 'medium',
                question: 'pnpm的CAS（内容寻址存储）是如何工作的？',
                options: [
                    '和npm一样，没有区别',
                    '基于文件内容hash，全局store存储，硬链接引用',
                    '存储在云端',
                    '不使用缓存'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm CAS原理',
                    content: 'pnpm内容寻址存储：\n\n1. 全局Store\n```\n~/.pnpm-store/v3/\n└── files/\n    └── 00/\n        └── a1b2c3...  (文件hash)\n```\n\n2. 内容寻址\n- 基于文件内容计算hash\n- hash作为文件名\n- 相同内容只存一次\n\n3. 硬链接\n```\nnode_modules/\n└── .pnpm/\n    └── lodash@4.17.21/\n        └── node_modules/\n            └── lodash/\n                └── index.js -> ~/.pnpm-store/.../a1b2c3\n```\n\n4. 优势\n```\n项目A: lodash@4.17.21\n项目B: lodash@4.17.21\n磁盘实际: 只有1份！\n```\n\n5. 性能\n- 零复制（硬链接）\n- 节省70%+空间\n- 安装快2-3倍\n\n6. 完整性\n- hash校验\n- 防篡改\n- 自动去重'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：依赖提升算法',
            content: {
                difficulty: 'medium',
                question: '以下依赖关系，npm会如何提升？',
                code: `// package.json
{
  "dependencies": {
    "A": "1.0.0",  // 依赖C@1.0.0
    "B": "1.0.0"   // 依赖C@2.0.0
  }
}`,
                options: [
                    '报错：版本冲突',
                    'C@1.0.0提升到根，C@2.0.0嵌套在B下',
                    '随机选一个',
                    '两个都提升'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm提升算法',
                    content: 'npm扁平化提升规则：\n\n1. 提升策略\n```\nnode_modules/\n├── A/\n├── B/\n│   └── node_modules/\n│       └── C@2.0.0  (冲突，嵌套)\n└── C@1.0.0  (第一个，提升)\n```\n\n2. 提升顺序\n- 按package.json声明顺序\n- 第一个版本提升到根\n- 后续冲突版本嵌套\n\n3. 问题\n```json\n// 交换顺序\n{\n  "dependencies": {\n    "B": "1.0.0",  // 现在B先\n    "A": "1.0.0"\n  }\n}\n\n// 结果不同！\nnode_modules/\n├── C@2.0.0  (现在2.0提升)\n└── A/\n    └── node_modules/\n        └── C@1.0.0\n```\n\n4. 不确定性\n- 安装顺序影响结构\n- 幽灵依赖问题\n\n5. pnpm解决\n- 严格隔离\n- 符号链接\n- 确定性'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：npm包的完整性校验',
            content: {
                difficulty: 'hard',
                question: 'npm如何确保下载的包没有被篡改？',
                options: [
                    '不做任何校验',
                    '使用SHA-512哈希校验integrity字段',
                    '只检查文件大小',
                    '完全依赖HTTPS'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm完整性校验',
                    content: 'npm安全机制：\n\n1. Integrity字段\n```json\n// package-lock.json\n{\n  "lodash": {\n    "version": "4.17.21",\n    "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",\n    "integrity": "sha512-v2kDEe57..."\n  }\n}\n```\n\n2. SHA-512哈希\n- 下载后计算文件hash\n- 与integrity对比\n- 不匹配则报错\n\n3. 完整流程\n```\n1. 从registry获取包元数据\n2. 下载tarball\n3. 计算SHA-512\n4. 验证integrity\n5. 验证通过才使用\n```\n\n4. 安全层次\n```\nHTTPS传输加密\n↓\nSHA-512完整性\n↓\nSubresource Integrity (SRI)\n↓\nnpm audit漏洞扫描\n```\n\n5. 攻击防护\n- 中间人攻击\n- 包篡改\n- 供应链攻击\n\n6. 最佳实践\n- 提交lock文件\n- 定期npm audit\n- 使用私有registry'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz-code',
            title: '题目9：pnpm符号链接结构',
            content: {
                difficulty: 'hard',
                question: 'pnpm的node_modules结构是如何组织的？',
                code: `// 安装express后
node_modules/
├── .pnpm/
│   └── express@4.18.2/
│       └── node_modules/
│           ├── express/
│           └── body-parser -> ../../body-parser@1.20.1/...
└── express -> .pnpm/express@4.18.2/node_modules/express`,
                options: [
                    '和npm一样的扁平结构',
                    '使用符号链接创建虚拟层次，严格隔离依赖',
                    '完全不使用node_modules',
                    '所有文件都是符号链接'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'pnpm链接结构',
                    content: 'pnpm三层结构：\n\n1. 顶层（项目直接依赖）\n```\nnode_modules/\n└── express -> .pnpm/express@4.18.2/node_modules/express\n```\n只有package.json声明的包\n\n2. 虚拟存储（.pnpm）\n```\n.pnpm/\n├── express@4.18.2/\n│   └── node_modules/\n│       ├── express/  (硬链接到store)\n│       ├── body-parser -> ../../body-parser@1.20.1/...\n│       └── accepts -> ../../accepts@1.3.8/...\n└── body-parser@1.20.1/\n    └── node_modules/\n        └── body-parser/  (硬链接到store)\n```\n\n3. 全局Store\n```\n~/.pnpm-store/v3/files/\n└── 00/\n    └── a1b2c3...  (实际文件)\n```\n\n4. 链接类型\n- 符号链接：组织依赖关系\n- 硬链接：引用store文件\n\n5. 优势\n```\n严格隔离：只能访问声明的依赖\n节省空间：硬链接零复制\n快速安装：并行+硬链接\n```\n\n6. 解决问题\n- 无幽灵依赖\n- 确定性安装\n- 磁盘高效'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：Yarn PnP工作原理',
            content: {
                difficulty: 'hard',
                question: 'Yarn Berry的PnP模式如何跳过node_modules？',
                options: [
                    '使用云端依赖',
                    '生成.pnp.cjs映射文件，劫持require',
                    '不安装依赖，实时下载',
                    '使用虚拟文件系统'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Yarn PnP原理',
                    content: 'Plug\'n\'Play革命性方案：\n\n1. 传统方式问题\n```js\n// Node.js查找过程\nrequire(\'lodash\')\n→ 查找node_modules/lodash\n→ 查找../node_modules/lodash\n→ 查找../../node_modules/lodash\n→ 递归向上，IO密集！\n```\n\n2. PnP方式\n```js\n// .pnp.cjs\nconst packageLocations = new Map([\n  ["lodash", [\n    ["npm:4.17.21", {\n      location: ".yarn/cache/lodash-npm-4.17.21.zip/node_modules/lodash/"\n    }]\n  ]]\n]);\n```\n\n3. require劫持\n```js\n// .pnp.cjs劫持Module.prototype._load\nrequire(\'lodash\')\n→ 查询.pnp.cjs映射\n→ 直接定位.yarn/cache/lodash.zip\n→ 零IO查找！\n```\n\n4. 文件结构\n```\n项目/\n├── .pnp.cjs  (映射文件)\n├── .yarn/\n│   └── cache/\n│       └── lodash-npm-4.17.21.zip\n└── package.json\n```\n\n5. 优势\n- 零安装：提交.pnp.cjs到Git\n- 极速：跳过IO查找\n- 严格：无幽灵依赖\n\n6. 挑战\n- 工具兼容性\n- 需要生态适配\n- 学习曲线'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第2章面试题：模块化与依赖管理',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=2'
        },
        next: {
            title: '第4章面试题：registry与镜像源',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=4'
        }
    }
};
