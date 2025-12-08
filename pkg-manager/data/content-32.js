/**
 * 第32章：私有npm registry
 * Verdaccio搭建、企业级方案、权限管理、代理
 */

window.content = {
    section: {
        title: '第32章：私有npm registry',
        icon: '🔐'
    },
    
    topics: [
        {
            type: 'concept',
            title: '私有npm registry的作用',
            content: {
                description: '私有npm registry允许企业内部管理和分发私有包，同时可以代理公共npm，提供缓存、安全审计和访问控制。',
                keyPoints: [
                    '私有包：内部代码不公开',
                    '缓存代理：加速npm安装',
                    '安全控制：审计和权限',
                    '离线使用：断网可用',
                    '成本节省：减少外网流量',
                    '合规要求：满足企业规范',
                    '稳定性：不依赖公共npm'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'Verdaccio快速搭建',
            content: {
                description: 'Verdaccio是最流行的开源私有npm registry，简单易用。',
                examples: [
                    {
                        title: 'Verdaccio安装',
                        code: `# 全局安装
npm install -g verdaccio

# 或使用Docker
docker run -d --name verdaccio \\
  -p 4873:4873 \\
  -v verdaccio:/verdaccio \\
  verdaccio/verdaccio

# 启动
verdaccio

# 输出：
# warn --- config file  - /home/user/.config/verdaccio/config.yaml
# info --- listening on http://localhost:4873/

# 访问 http://localhost:4873/
# 看到Verdaccio Web界面`,
                        notes: 'Verdaccio即装即用'
                    },
                    {
                        title: 'Verdaccio配置',
                        code: `# config.yaml
storage: ./storage  # 包存储位置
plugins: ./plugins

web:
  title: My Company NPM
  logo: logo.png

auth:
  htpasswd:
    file: ./htpasswd  # 用户认证文件
    max_users: -1     # 无限用户

uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  taobao:
    url: https://registry.npmmirror.com/

packages:
  '@my-company/*':  # 私有包
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs  # 不代理私有包
  
  '**':  # 其他包
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs  # 代理到公共npm

logs:
  - { type: stdout, format: pretty, level: http }`,
                        notes: 'config.yaml是核心配置'
                    },
                    {
                        title: '使用私有registry',
                        code: `# 方式1：全局配置
npm set registry http://localhost:4873/

# 方式2：项目配置
# .npmrc
registry=http://localhost:4873/

# 方式3：仅私有包
# .npmrc
@my-company:registry=http://localhost:4873/

# 登录
npm login --registry http://localhost:4873/
# Username: admin
# Password: ****
# Email: admin@company.com

# 发布私有包
cd my-private-package
npm publish --registry http://localhost:4873/

# 安装私有包
npm install @my-company/utils

# 流程：
# 1. 查找本地registry
# 2. 如果不存在，代理到公共npm
# 3. 缓存结果`,
                        notes: '.npmrc配置registry'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '私有registry方案对比',
            content: {
                description: '不同规模企业的私有registry选择。',
                items: [
                    {
                        name: 'Verdaccio（开源）',
                        pros: [
                            '免费：开源',
                            '简单：配置简单',
                            '轻量：资源占用少',
                            '适合：小团队'
                        ]
                    },
                    {
                        name: 'Nexus/Artifactory',
                        pros: [
                            '企业级：功能强大',
                            '多语言：支持多种包管理器',
                            '高可用：集群部署',
                            '审计：完整日志',
                            '适合：大企业'
                        ],
                        cons: [
                            '复杂：学习曲线',
                            '成本：商业版收费'
                        ]
                    },
                    {
                        name: 'Cloudflare Registry（云服务）',
                        pros: [
                            '免费：Workers KV',
                            '全球CDN：速度快',
                            '无需维护：托管服务'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '私有registry最佳实践',
            content: {
                description: '企业私有registry的管理和使用规范。',
                keyPoints: [
                    '命名空间：使用@company作用域',
                    'SSL证书：生产环境HTTPS',
                    '备份策略：定期备份storage',
                    '权限管理：合理分配权限',
                    'CI/CD：自动发布',
                    '监控告警：可用性监控',
                    '文档：使用指南',
                    '审计：发布和下载日志',
                    '高可用：生产环境集群',
                    '成本优化：CDN缓存'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第31章：Lerna与Monorepo管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=31'
        },
        next: {
            title: '第33章：包管理器性能优化',
            url: './render.html?subject=pkg-manager&type=content&chapter=33'
        }
    }
};
