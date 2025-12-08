/**
 * 第4章：registry与镜像源
 * 深入理解npm registry、镜像源配置、私有registry和.npmrc配置
 */

window.content = {
    section: {
        title: '第4章：registry与镜像源',
        icon: '🌐'
    },
    
    topics: [
        {
            type: 'concept',
            title: '什么是npm registry',
            content: {
                description: 'npm registry是存储和分发npm包的中央仓库服务器，开发者发布包到registry，其他开发者从registry下载安装包。',
                keyPoints: [
                    '官方registry：https://registry.npmjs.org - npm默认源',
                    '包存储：存储了数百万个开源JavaScript包',
                    'RESTful API：提供HTTP接口查询、下载包',
                    '元数据：包含包名、版本、依赖、作者等信息',
                    '权限控制：支持公开包和私有包（需付费）',
                    '全球CDN：通过CDN加速全球访问'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/using-npm/registry'
            }
        },
        
        {
            type: 'code-example',
            title: 'registry API使用示例',
            content: {
                description: 'npm registry提供RESTful API，可以通过HTTP请求获取包信息、下载包等操作。',
                examples: [
                    {
                        title: '获取包的完整信息',
                        code: `# 获取lodash的所有版本信息
curl https://registry.npmjs.org/lodash

# 响应包含：
# - name: 包名
# - versions: 所有版本的详细信息
# - dist-tags: 版本标签（latest, next等）
# - time: 每个版本的发布时间`,
                        notes: '返回JSON格式的完整包信息'
                    },
                    {
                        title: '获取特定版本信息',
                        code: `# 获取lodash@4.17.21的信息
curl https://registry.npmjs.org/lodash/4.17.21

# 响应包含：
# - version: 版本号
# - dependencies: 依赖列表
# - dist.tarball: 下载地址
# - dist.shasum: SHA校验值`,
                        notes: '获取指定版本的详细信息'
                    },
                    {
                        title: '下载包',
                        code: `# 下载lodash-4.17.21.tgz
curl https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz -O

# npm实际下载流程：
# 1. 查询包信息获取tarball地址
# 2. 下载.tgz文件
# 3. 验证SHA校验值
# 4. 解压到node_modules`,
                        notes: 'npm install背后的下载过程'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '镜像源的重要性',
            content: {
                description: '由于npm官方registry服务器在国外，国内访问速度慢甚至无法访问。镜像源通过在本地缓存npm包，提供更快速稳定的访问。',
                mechanism: '镜像源定期从npm官方registry同步包数据，在国内服务器上缓存。用户配置镜像源后，npm从镜像下载包，速度显著提升。',
                keyPoints: [
                    '速度提升：国内镜像下载速度快10-100倍',
                    '稳定性：避免网络波动和墙的影响',
                    '同步延迟：镜像源同步存在延迟（通常<10分钟）',
                    '常用镜像：淘宝镜像、腾讯镜像、华为镜像',
                    '企业内网：企业可搭建私有镜像源',
                    '自动切换：某些工具支持自动选择最快的源'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '配置镜像源',
            content: {
                description: 'npm、yarn、pnpm都支持配置registry，可以临时使用或永久配置镜像源。',
                examples: [
                    {
                        title: 'npm配置淘宝镜像',
                        code: `# 临时使用（单次命令）
npm install lodash --registry=https://registry.npmmirror.com

# 永久配置
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 恢复官方源
npm config set registry https://registry.npmjs.org`,
                        notes: '淘宝镜像已更新为 registry.npmmirror.com'
                    },
                    {
                        title: 'yarn配置镜像',
                        code: `# yarn配置淘宝镜像
yarn config set registry https://registry.npmmirror.com

# 查看配置
yarn config get registry

# 恢复默认
yarn config delete registry`,
                        notes: 'yarn配置语法与npm类似'
                    },
                    {
                        title: 'pnpm配置镜像',
                        code: `# pnpm配置淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 查看配置
pnpm config get registry

# 也可以使用.npmrc文件
echo "registry=https://registry.npmmirror.com" > .npmrc`,
                        notes: 'pnpm与npm共享配置文件'
                    },
                    {
                        title: '使用nrm管理源',
                        code: `# 安装nrm
npm install -g nrm

# 列出可用源
nrm ls

# 切换到淘宝源
nrm use taobao

# 测试源速度
nrm test

# 添加自定义源
nrm add company http://registry.company.com`,
                        notes: 'nrm是registry管理工具，方便切换源'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '常用镜像源对比',
            content: {
                description: '国内有多个npm镜像源可供选择，各有特点和优势。',
                items: [
                    {
                        name: '淘宝镜像（npmmirror）',
                        pros: [
                            '国内最稳定的镜像，阿里云CDN加速',
                            '同步频率高，延迟<10分钟',
                            '支持全部npm包',
                            '提供Web界面查询包信息'
                        ],
                        cons: [
                            '域名已从registry.npm.taobao.org更新',
                            '部分企业防火墙可能限制'
                        ]
                    },
                    {
                        name: '腾讯云镜像',
                        pros: [
                            '腾讯云加速，速度快',
                            '与腾讯云服务集成好',
                            '企业级稳定性'
                        ],
                        cons: [
                            '知名度相对较低',
                            '文档较少'
                        ]
                    },
                    {
                        name: '华为云镜像',
                        pros: [
                            '华为云加速',
                            '同步速度快',
                            '适合华为云用户'
                        ],
                        cons: [
                            '使用者相对较少',
                            '部分包同步可能有延迟'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '私有npm registry',
            content: {
                description: '企业内部可以搭建私有npm registry，用于管理内部包、加速下载、离线开发等场景。',
                mechanism: '私有registry作为代理，请求先查找本地缓存，未命中则从上游registry（npm官方或镜像）下载并缓存。企业内部包只存储在私有registry。',
                keyPoints: [
                    'Verdaccio：轻量级私有npm registry，易于搭建',
                    'Nexus：企业级制品仓库，支持多种包管理器',
                    'Artifactory：JFrog产品，功能强大',
                    'cnpm：淘宝开源的企业级npm解决方案',
                    '代理模式：缓存公共包，加速下载',
                    '私有包：发布企业内部包，不对外公开',
                    '权限控制：用户认证和包访问权限管理'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '使用Verdaccio搭建私有registry',
            content: {
                description: 'Verdaccio是最流行的轻量级私有npm registry，几分钟即可搭建完成。',
                examples: [
                    {
                        title: '安装和启动Verdaccio',
                        code: `# 全局安装verdaccio
npm install -g verdaccio

# 启动服务（默认端口4873）
verdaccio

# 访问Web界面
# http://localhost:4873

# 后台运行
nohup verdaccio &

# 使用pm2管理
pm2 start verdaccio`,
                        notes: '默认配置已足够使用，数据存储在~/.config/verdaccio'
                    },
                    {
                        title: '配置npm使用私有registry',
                        code: `# 配置registry指向verdaccio
npm config set registry http://localhost:4873

# 或在.npmrc中配置
registry=http://localhost:4873

# 登录私有registry
npm login --registry=http://localhost:4873

# 发布包到私有registry
npm publish --registry=http://localhost:4873`,
                        notes: '发布后的包只存储在私有registry'
                    },
                    {
                        title: 'Verdaccio配置文件',
                        code: `# ~/.config/verdaccio/config.yaml
storage: ./storage  # 包存储目录

auth:
  htpasswd:
    file: ./htpasswd  # 用户认证文件

uplinks:
  npmjs:
    url: https://registry.npmjs.org/  # 上游registry
  taobao:
    url: https://registry.npmmirror.com/

packages:
  '@company/*':  # 公司私有包
    access: $authenticated
    publish: $authenticated
  
  '**':  # 其他包从上游获取
    access: $all
    proxy: taobao npmjs`,
                        notes: '可配置多个上游源、权限控制等'
                    }
                ]
            }
        },
        
        {
            type: 'concept',
            title: '作用域包（Scoped Packages）',
            content: {
                description: '作用域包是以@scope/package-name命名的包，用于组织相关包、避免命名冲突、实现私有包管理。',
                keyPoints: [
                    '命名格式：@scope/package-name，如@vue/cli',
                    '组织管理：一个组织的所有包使用相同scope',
                    '私有包：npm私有包必须使用作用域',
                    '免费私有：某些registry允许免费发布作用域私有包',
                    '配置独立：可为不同scope配置不同registry',
                    '权限控制：组织成员才能发布该scope下的包'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/using-npm/scope'
            }
        },
        
        {
            type: 'code-example',
            title: '.npmrc配置文件详解',
            content: {
                description: '.npmrc是npm的配置文件，可以配置registry、认证信息、代理等，支持多级配置。',
                examples: [
                    {
                        title: '.npmrc配置层级',
                        code: `# 1. 项目级（项目根目录/.npmrc）
# 优先级最高，仅对当前项目生效

# 2. 用户级（~/.npmrc）
# 对当前用户的所有项目生效

# 3. 全局级（$PREFIX/etc/npmrc）
# 对所有用户生效

# 4. npm内置（npm安装目录）
# 默认配置，优先级最低`,
                        notes: '配置优先级：项目 > 用户 > 全局 > 内置'
                    },
                    {
                        title: '常用.npmrc配置',
                        code: `# 设置registry
registry=https://registry.npmmirror.com

# 为特定scope设置registry
@company:registry=http://registry.company.com

# 认证token
//registry.company.com/:_authToken=\${NPM_TOKEN}

# 代理设置
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080

# 缓存目录
cache=/path/to/cache

# 严格SSL
strict-ssl=true

# 保存精确版本
save-exact=true

# 不自动安装package-lock.json
package-lock=false`,
                        notes: '根据需求选择性配置'
                    },
                    {
                        title: '项目级.npmrc示例',
                        code: `# .npmrc（项目根目录）
# 公共包使用淘宝镜像
registry=https://registry.npmmirror.com

# 公司私有包使用私有registry
@company:registry=http://registry.company.com

# 认证信息（使用环境变量）
//registry.company.com/:_authToken=\${COMPANY_NPM_TOKEN}

# 安装时使用精确版本
save-exact=true

# 引擎严格模式
engine-strict=true`,
                        notes: '提交到Git，团队共享配置'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'registry使用最佳实践',
            content: {
                description: '合理配置和使用registry可以提升开发效率和安全性。',
                keyPoints: [
                    '国内开发：使用淘宝镜像等国内镜像源',
                    '企业项目：搭建私有registry，管理内部包',
                    '多源配置：使用.npmrc为不同scope配置不同源',
                    '认证安全：使用环境变量存储token，不要提交到Git',
                    '项目配置：在项目中添加.npmrc，统一团队配置',
                    '定期同步：私有registry定期同步上游源',
                    '监控告警：监控私有registry的可用性',
                    '备份策略：定期备份私有包数据'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第3章：包管理器工作原理',
            url: './render.html?subject=pkg-manager&type=content&chapter=03'
        },
        next: {
            title: '第5章：npm安装与配置',
            url: './render.html?subject=pkg-manager&type=content&chapter=05'
        }
    }
};
