/**
 * 第4章：registry与镜像源 - 面试题
 * 10道精选面试题：测试对npm registry、镜像源和包发布的理解
 */

window.content = {
    section: {
        title: '第4章：registry与镜像源 - 面试题',
        icon: '💡'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm官方registry',
            content: {
                difficulty: 'easy',
                question: 'npm官方registry的地址是什么？',
                options: [
                    'https://www.npmjs.com',
                    'https://registry.npmjs.org',
                    'https://npm.js.org',
                    'https://registry.npm.com'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm官方registry',
                    content: 'npm registry信息：\n\n1. 官方地址\n   - registry.npmjs.org\n   - 全球CDN加速\n   - 免费使用\n\n2. 查看当前registry\n```bash\nnpm config get registry\n# https://registry.npmjs.org/\n```\n\n3. 设置registry\n```bash\nnpm config set registry https://registry.npmjs.org/\n```\n\n4. registry功能\n   - 包存储和分发\n   - 包元数据\n   - 版本管理\n   - 下载统计\n   - 安全审计\n\n5. 数据规模（2023）\n   - 包数量：200万+\n   - 每周下载：300亿+\n   - 开发者：1700万+'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：淘宝镜像源',
            content: {
                difficulty: 'easy',
                question: '为什么国内用户推荐使用淘宝镜像源？',
                options: [
                    '淘宝镜像包更多',
                    '淘宝镜像在国内，速度更快',
                    '淘宝镜像更安全',
                    '必须使用淘宝镜像'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '淘宝镜像源',
                    content: '淘宝npm镜像（npmmirror.com）：\n\n1. 新域名（2021年）\n   - https://registry.npmmirror.com\n   - 替代旧域名 registry.npm.taobao.org\n\n2. 配置方法\n```bash\n# 永久配置\nnpm config set registry https://registry.npmmirror.com\n\n# 临时使用\nnpm install --registry=https://registry.npmmirror.com\n```\n\n3. 同步机制\n   - 每10分钟同步官方\n   - 按需同步热门包\n   - CDN加速\n\n4. 速度对比\n   - 官方：国外服务器，慢\n   - 淘宝：国内CDN，快10倍+\n\n5. 其他镜像\n   - 腾讯云：mirrors.cloud.tencent.com/npm/\n   - 华为云：mirrors.huaweicloud.com/repository/npm/\n   - 中科大：mirrors.ustc.edu.cn/npm/'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：.npmrc配置文件',
            content: {
                difficulty: 'easy',
                question: '.npmrc配置文件的作用是什么？',
                options: [
                    '只是npm的备份文件',
                    '配置npm的行为，如registry、代理等',
                    '存储npm密码',
                    '没有实际作用'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '.npmrc配置文件',
                    content: '.npmrc配置层级：\n\n1. 项目级（优先级最高）\n   - 项目根目录/.npmrc\n   - 只影响当前项目\n\n2. 用户级\n   - ~/.npmrc\n   - 影响当前用户所有项目\n\n3. 全局级\n   - /etc/npmrc\n   - 影响所有用户\n\n4. 内置默认\n   - npm安装目录\n   - 优先级最低\n\n5. 常用配置\n```ini\n# registry\nregistry=https://registry.npmmirror.com\n\n# 作用域registry\n@company:registry=https://npm.company.com\n\n# 代理\nproxy=http://proxy.company.com:8080\nhttps-proxy=http://proxy.company.com:8080\n\n# pnpm配置\nshamefully-hoist=false\nstrict-peer-dependencies=false\n```'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz-code',
            title: '题目4：作用域包与私有registry',
            content: {
                difficulty: 'medium',
                question: '如何配置@company作用域使用私有registry？',
                code: `// .npmrc
@company:registry=https://npm.company.com
registry=https://registry.npmjs.org`,
                options: [
                    '不可能配置',
                    '@company包从私有registry，其他从官方registry',
                    '所有包都从私有registry',
                    '配置无效'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '作用域registry配置',
                    content: '作用域包（Scoped Packages）：\n\n1. 作用域格式\n```\n@scope/package-name\n例：@company/ui-components\n```\n\n2. 分离registry\n```ini\n# .npmrc\n# 私有包\n@company:registry=https://npm.company.com\n//npm.company.com/:_authToken=xxx\n\n# 公共包\nregistry=https://registry.npmjs.org\n```\n\n3. 安装行为\n```bash\nnpm install @company/utils\n→ 从 npm.company.com 下载\n\nnpm install lodash\n→ 从 registry.npmjs.org 下载\n```\n\n4. 认证配置\n```ini\n//npm.company.com/:_authToken=${NPM_TOKEN}\n```\n\n5. 优势\n   - 私有包隔离\n   - 公共包正常访问\n   - 安全可控\n   - 成本优化\n\n6. 使用场景\n   - 企业内部组件库\n   - 私有工具包\n   - 商业产品'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：nrm工具',
            content: {
                difficulty: 'medium',
                question: 'nrm工具的主要作用是什么？',
                options: [
                    '下载npm包',
                    '快速切换npm registry源',
                    '管理node版本',
                    '清理npm缓存'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'nrm - registry管理器',
                    content: 'nrm (npm registry manager)：\n\n1. 安装\n```bash\nnpm install -g nrm\n```\n\n2. 查看可用源\n```bash\nnrm ls\n\n* npm -------- https://registry.npmjs.org/\n  yarn ------- https://registry.yarnpkg.com/\n  taobao ----- https://registry.npmmirror.com/\n  tencent ---- https://mirrors.cloud.tencent.com/npm/\n  npmMirror -- https://skimdb.npmjs.com/registry/\n```\n\n3. 切换源\n```bash\nnrm use taobao\n# Registry has been set to: https://registry.npmmirror.com/\n```\n\n4. 测试速度\n```bash\nnrm test\n\n* npm ------ 1532ms\n  yarn ----- 1234ms\n  taobao --- 156ms\n```\n\n5. 添加自定义源\n```bash\nnrm add company https://npm.company.com\nnrm use company\n```\n\n6. 替代方案\n   - yrm (Yarn版本)\n   - prm (pnpm版本)\n   - 手动npm config set'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：registry代理与缓存',
            content: {
                difficulty: 'medium',
                question: 'Verdaccio等私有registry的主要功能是什么？',
                options: [
                    '只是复制官方registry',
                    '私有包托管、公共包缓存代理、权限管理',
                    '替代npm命令行',
                    '加密npm包'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Verdaccio私有registry',
                    content: 'Verdaccio核心功能：\n\n1. 私有包托管\n```bash\n# 发布私有包\nnpm publish --registry=http://localhost:4873\n\n# 存储位置\n~/.local/share/verdaccio/storage/\n```\n\n2. 公共包代理\n```yaml\n# config.yaml\nuplinks:\n  npmjs:\n    url: https://registry.npmjs.org/\n\npackages:\n  \'@company/*\':\n    access: $authenticated\n    publish: $authenticated\n  \n  \'**\':\n    access: $all\n    proxy: npmjs  # 代理到公共npm\n```\n\n3. 缓存加速\n   - 首次从官方下载\n   - 缓存到本地\n   - 后续从缓存返回\n\n4. 权限管理\n```yaml\nauth:\n  htpasswd:\n    file: ./htpasswd\n    max_users: -1\n```\n\n5. 离线可用\n   - 断网可用缓存\n   - 内网部署\n\n6. 使用场景\n   - 企业内部npm\n   - CI/CD加速\n   - 安全审计\n   - 离线环境'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz-code',
            title: '题目7：包发布流程',
            content: {
                difficulty: 'medium',
                question: '发布npm包到官方registry的完整流程是什么？',
                code: `// package.json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "main": "dist/index.js"
}`,
                options: [
                    '直接上传文件到网站',
                    '登录 → 打包 → 发布 → 验证',
                    '只需要npm publish',
                    '发邮件给npm团队'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm包发布流程',
                    content: '完整发布步骤：\n\n1. 注册npm账号\n   - https://www.npmjs.com/signup\n   - 验证邮箱\n\n2. 登录\n```bash\nnpm login\n# Username: your-username\n# Password: ****\n# Email: your@email.com\n```\n\n3. 配置package.json\n```json\n{\n  "name": "unique-package-name",\n  "version": "1.0.0",\n  "description": "...",\n  "main": "dist/index.js",\n  "files": ["dist"],\n  "keywords": [...],\n  "license": "MIT"\n}\n```\n\n4. 构建\n```bash\nnpm run build\n```\n\n5. 测试发布内容\n```bash\nnpm pack\n# 生成 package-name-1.0.0.tgz\n# 查看将发布的文件\n```\n\n6. 发布\n```bash\nnpm publish\n# 或发布测试版\nnpm publish --tag beta\n```\n\n7. 验证\n```bash\nnpm view my-awesome-package\nnpm install my-awesome-package\n```\n\n8. 注意事项\n   - 包名唯一性\n   - 版本号递增\n   - .npmignore排除文件\n   - README文档'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：registry协议与API',
            content: {
                difficulty: 'hard',
                question: 'npm registry使用什么协议与客户端通信？',
                options: [
                    '自定义二进制协议',
                    'RESTful HTTP API + JSON',
                    'GraphQL',
                    'gRPC'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm registry API',
                    content: 'npm registry协议：\n\n1. RESTful HTTP API\n```bash\n# 获取包信息\nGET https://registry.npmjs.org/lodash\n\n# 响应JSON\n{\n  "name": "lodash",\n  "versions": {\n    "4.17.21": {\n      "name": "lodash",\n      "version": "4.17.21",\n      "dist": {\n        "tarball": "https://.../lodash-4.17.21.tgz",\n        "shasum": "...",\n        "integrity": "sha512-..."\n      }\n    }\n  }\n}\n```\n\n2. 主要端点\n```\nGET  /{package}          # 包信息\nGET  /{package}/{version} # 特定版本\nPUT  /{package}          # 发布包\nDEL  /{package}/-/{version} # 删除版本\n```\n\n3. 认证\n```bash\n# Token认证\nAuthorization: Bearer npm_xxxxx\n\n# 或.npmrc\n//registry.npmjs.org/:_authToken=xxx\n```\n\n4. 下载流程\n```\n1. GET /lodash → 获取元数据\n2. 解析versions字段\n3. GET tarball URL → 下载.tgz\n4. 验证integrity\n5. 解压到node_modules\n```\n\n5. 兼容registry\n   - Verdaccio\n   - Nexus\n   - Artifactory\n   - cnpm\n   都实现相同API'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz-code',
            title: '题目9：包版本废弃机制',
            content: {
                difficulty: 'hard',
                question: 'npm deprecate命令的作用和影响是什么？',
                code: `npm deprecate lodash@4.0.0 "请升级到4.17.21，修复安全漏洞"`,
                options: [
                    '删除该版本',
                    '标记为废弃，安装时显示警告，但仍可安装',
                    '完全禁止安装',
                    '自动升级到新版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm deprecate机制',
                    content: 'npm包废弃（deprecate）：\n\n1. 废弃命令\n```bash\n# 废弃特定版本\nnpm deprecate package@1.0.0 "安全漏洞，请升级"\n\n# 废弃所有版本\nnpm deprecate package "包已停止维护"\n\n# 废弃版本范围\nnpm deprecate package@"<2.0.0" "请升级到v2+"\n```\n\n2. 用户体验\n```bash\nnpm install lodash@4.0.0\n\nnpm WARN deprecated lodash@4.0.0: 请升级到4.17.21，修复安全漏洞\n\n# 仍然安装，但有警告\n```\n\n3. package.json元数据\n```json\n{\n  "versions": {\n    "4.0.0": {\n      "deprecated": "请升级到4.17.21，修复安全漏洞"\n    }\n  }\n}\n```\n\n4. 与unpublish区别\n```bash\n# deprecate: 警告但可用\nnpm deprecate pkg@1.0.0 "message"\n\n# unpublish: 完全删除（24h内）\nnpm unpublish pkg@1.0.0\n```\n\n5. 最佳实践\n   - 安全漏洞：立即deprecate\n   - 提供升级路径\n   - 不要unpublish（影响依赖者）\n\n6. 取消废弃\n```bash\nnpm deprecate package@1.0.0 ""\n```'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：monorepo发布策略',
            content: {
                difficulty: 'hard',
                question: 'Monorepo中如何管理多个包的版本和发布？',
                options: [
                    '手动逐个发布',
                    '使用Lerna/Changesets自动化版本管理和发布',
                    '不能发布Monorepo的包',
                    '必须拆分成多个仓库'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Monorepo发布策略',
                    content: 'Monorepo包发布方案：\n\n1. Changesets方案（推荐）\n```bash\n# 1. 开发完成后添加changeset\npnpm changeset\n# 选择变更的包\n# 选择版本类型（patch/minor/major）\n# 编写变更说明\n\n# 2. 生成.changeset/文件\n.changeset/\n└── quick-cats-jump.md\n\n# 3. CI中自动发布\npnpm changeset version  # 更新版本\npnpm changeset publish  # 发布\n```\n\n2. Lerna方案\n```bash\n# Fixed模式（统一版本）\nlerna version\nlerna publish\n\n# Independent模式（独立版本）\nlerna version --conventional-commits\nlerna publish from-git\n```\n\n3. 版本策略\n```\nFixed:\n  @my/ui@1.0.0\n  @my/utils@1.0.0\n  统一版本号\n\nIndependent:\n  @my/ui@2.3.0\n  @my/utils@1.5.2\n  独立演进\n```\n\n4. CI/CD自动化\n```yaml\n# GitHub Actions\n- name: Publish\n  run: |\n    pnpm changeset version\n    pnpm build\n    pnpm changeset publish\n  env:\n    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}\n```\n\n5. 最佳实践\n   - Changesets管理变更\n   - Conventional Commits\n   - 自动生成CHANGELOG\n   - CI自动发布\n   - workspace:协议'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第3章面试题：包管理器工作原理',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=3'
        },
        next: {
            title: '返回目录',
            url: './index.html?subject=pkg-manager'
        }
    }
};
