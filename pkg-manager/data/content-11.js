/**
 * 第11章：发布npm包
 * npm账号注册、作用域包、发布流程、版本管理和npm包维护
 */

window.content = {
    section: {
        title: '第11章：发布npm包',
        icon: '📦'
    },
    
    topics: [
        {
            type: 'concept',
            title: '发布npm包的意义',
            content: {
                description: '将自己的代码发布为npm包，可以与全世界的开发者分享，提升代码复用性，建立个人品牌。',
                keyPoints: [
                    '代码共享：让其他开发者使用你的代码',
                    '版本管理：通过npm管理包的版本',
                    '依赖管理：自动处理包的依赖关系',
                    '社区贡献：为开源社区做贡献',
                    '个人品牌：建立技术影响力',
                    '团队协作：企业内部共享代码'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm账号注册与登录',
            content: {
                description: '发布包到npm registry需要先注册账号并登录，支持双因素认证保障安全。',
                examples: [
                    {
                        title: '注册npm账号',
                        code: `# 方式1：命令行注册
npm adduser

# 按提示输入：
# Username: your-username
# Password: ********
# Email: you@example.com

# 方式2：网站注册
# https://www.npmjs.com/signup

# 验证邮箱后即可使用`,
                        notes: '推荐在网站注册，方便管理'
                    },
                    {
                        title: '登录npm账号',
                        code: `# 登录
npm login

# 或
npm adduser  # 如果账号不存在会创建

# 查看当前登录用户
npm whoami

# 登出
npm logout`,
                        notes: '登录信息存储在~/.npmrc中'
                    },
                    {
                        title: '双因素认证（2FA）',
                        code: `# 在npm网站启用2FA
# https://www.npmjs.com/settings/your-username/tfa

# 命令行登录时需要输入OTP
npm login
# Username: your-username
# Password: ********
# Email: you@example.com
# Enter one-time password: 123456

# 发布时也需要OTP
npm publish --otp=123456`,
                        notes: '强烈推荐启用2FA保护账号'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '包命名规则',
            content: {
                description: 'npm包名必须遵循特定规则，好的包名清晰、易记、不冲突。',
                mechanism: 'npm包名在registry中必须唯一。公开包名不能包含大写字母、空格、特殊字符。作用域包（@scope/name）允许命名空间隔离。',
                keyPoints: [
                    '唯一性：公开包名在npm registry中全局唯一',
                    '小写字母：只能包含小写字母、数字、连字符、下划线',
                    '长度限制：不超过214字符',
                    '不能以.或_开头',
                    '作用域包：@username/package-name格式',
                    '语义化：包名应该清晰表达功能'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '作用域包（Scoped Packages）',
            content: {
                description: '作用域包使用@scope/name格式，避免命名冲突，支持组织管理和私有包。',
                examples: [
                    {
                        title: '创建作用域包',
                        code: `# package.json
{
  "name": "@username/my-package",  // 作用域包命名
  "version": "1.0.0",
  "description": "My scoped package"
}

# 发布公开作用域包（免费）
npm publish --access public

# 发布私有作用域包（需付费或企业registry）
npm publish  # 默认为private`,
                        notes: '个人作用域包：@username/xxx'
                    },
                    {
                        title: '组织作用域包',
                        code: `# 1. 在npm网站创建组织
# https://www.npmjs.com/org/create

# 2. 创建组织包
{
  "name": "@my-org/package-name",
  "version": "1.0.0"
}

# 3. 发布（需要组织成员权限）
npm publish --access public

# 4. 添加组织成员
# 在npm网站：https://www.npmjs.com/settings/my-org/members`,
                        notes: '组织可以管理多个相关包'
                    },
                    {
                        title: '安装和使用作用域包',
                        code: `# 安装作用域包
npm install @username/my-package

# 使用
import something from '@username/my-package';
// 或
const something = require('@username/my-package');

# 配置作用域registry
npm config set @mycompany:registry http://registry.company.com`,
                        notes: '使用方式与普通包相同'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '发布前的准备',
            content: {
                description: '发布包前需要完善package.json、编写README、配置files等，确保包的质量和可用性。',
                mechanism: '完整的包应该包含清晰的说明文档、合理的入口配置、必要的文件，以及正确的版本号和依赖声明。',
                keyPoints: [
                    'package.json：完善所有必要字段',
                    'README.md：详细的使用说明',
                    'LICENSE：明确的开源协议',
                    'files字段：控制发布文件',
                    '.npmignore：排除不需要的文件',
                    '构建产物：编译、打包、压缩',
                    '测试通过：确保代码质量'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '完整的package.json配置',
            content: {
                description: '发布包的package.json应该包含完整的元数据和配置。',
                examples: [
                    {
                        title: '发布包的package.json',
                        code: `{
  "name": "@username/my-awesome-lib",
  "version": "1.0.0",
  "description": "An awesome library for doing awesome things",
  "keywords": ["utility", "helper", "awesome"],
  
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://yourwebsite.com"
  },
  
  "license": "MIT",
  
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-awesome-lib.git"
  },
  
  "bugs": {
    "url": "https://github.com/username/my-awesome-lib/issues"
  },
  
  "homepage": "https://github.com/username/my-awesome-lib#readme",
  
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "prepublishOnly": "npm run build && npm test"
  },
  
  "dependencies": {
    "lodash": "^4.17.21"
  },
  
  "devDependencies": {
    "rollup": "^3.0.0",
    "jest": "^29.0.0"
  },
  
  "engines": {
    "node": ">=14.0.0"
  }
}`,
                        notes: '完整的元数据提升包的专业度'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '发布流程详解',
            content: {
                description: 'npm publish是发布包的核心命令，理解完整的发布流程很重要。',
                examples: [
                    {
                        title: '首次发布',
                        code: `# 1. 确保已登录
npm whoami

# 2. 检查包名是否可用
npm view @username/my-package
# 如果返回404则可用

# 3. 预览将要发布的文件
npm pack
# 生成.tgz文件，解压查看

# 或
npm publish --dry-run
# 模拟发布，不实际上传

# 4. 正式发布
npm publish --access public  # 公开作用域包
# 或
npm publish  # 非作用域包默认公开

# 5. 验证发布
npm view @username/my-package
npm install @username/my-package`,
                        notes: '首次发布建议使用--dry-run预览'
                    },
                    {
                        title: 'prepublishOnly钩子',
                        code: `{
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src",
    
    // prepublishOnly在npm publish前执行
    "prepublishOnly": "npm run lint && npm run test && npm run build"
  }
}

# npm publish执行顺序：
# 1. prepublishOnly → 构建、测试
# 2. prepare → git hooks等
# 3. prepublish（已废弃）
# 4. publish → 上传
# 5. postpublish → 发布后操作`,
                        notes: 'prepublishOnly确保发布前代码质量'
                    },
                    {
                        title: '发布标签版本',
                        code: `# 发布beta版本
npm publish --tag beta

# 发布next版本
npm publish --tag next

# 安装特定标签
npm install @username/my-package@beta

# 查看所有标签
npm dist-tag ls @username/my-package

# 添加/删除标签
npm dist-tag add @username/my-package@1.0.1 stable
npm dist-tag rm @username/my-package beta`,
                        notes: 'tag用于管理不同发布渠道'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm版本管理',
            content: {
                description: 'npm提供version命令自动管理版本号，遵循semver规范，同时支持git tag。',
                mechanism: 'npm version命令自动修改package.json的version字段，创建git commit和tag，执行version生命周期钩子。',
                keyPoints: [
                    'npm version：自动更新版本号',
                    '遵循semver：major.minor.patch',
                    'git集成：自动创建commit和tag',
                    'version钩子：preversion、version、postversion',
                    'version脚本：在version钩子中执行',
                    '自动推送：可配置自动push到远程'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'npm version命令详解',
            content: {
                description: 'npm version是版本管理的标准工具，支持多种更新策略。',
                examples: [
                    {
                        title: 'version更新策略',
                        code: `# 当前版本：1.2.3

# 更新patch版本（1.2.3 → 1.2.4）
npm version patch

# 更新minor版本（1.2.3 → 1.3.0）
npm version minor

# 更新major版本（1.2.3 → 2.0.0）
npm version major

# 预发布版本
npm version prerelease  # 1.2.3 → 1.2.4-0
npm version prerelease --preid=alpha  # 1.2.3-alpha.0

npm version premajor --preid=beta  # 1.2.3 → 2.0.0-beta.0
npm version preminor --preid=rc  # 1.2.3 → 1.3.0-rc.0
npm version prepatch --preid=alpha  # 1.2.3 → 1.2.4-alpha.0

# 指定具体版本
npm version 2.0.0`,
                        notes: 'version自动更新package.json并创建git tag'
                    },
                    {
                        title: 'version生命周期',
                        code: `{
  "scripts": {
    // version前执行（测试）
    "preversion": "npm test",
    
    // version后、commit前执行（构建）
    "version": "npm run build && git add -A dist",
    
    // commit后执行（推送）
    "postversion": "git push && git push --tags && npm publish"
  }
}

# npm version patch执行顺序：
# 1. preversion → 运行测试
# 2. 更新package.json的version
# 3. version → 构建并暂存
# 4. git commit和git tag
# 5. postversion → 推送并发布`,
                        notes: '利用钩子实现自动化发布流程'
                    },
                    {
                        title: 'version配置',
                        code: `# .npmrc配置
# 自定义commit消息
tag-version-prefix=""  # 去掉v前缀
message="chore: release %s"  # 自定义消息

# 禁止git操作
git-tag-version=false  # 不创建git tag
allow-same-version=true  # 允许相同版本

# 命令行参数
npm version patch -m "chore: upgrade to %s"  # 自定义消息
npm version patch --no-git-tag-version  # 不创建tag`,
                        notes: '可以自定义version行为'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '更新已发布的包',
            content: {
                description: '修复bug或添加新功能后，需要更新已发布的包。',
                examples: [
                    {
                        title: '标准更新流程',
                        code: `# 1. 修改代码
# 2. 运行测试
npm test

# 3. 更新版本（自动commit和tag）
npm version patch  # 或minor/major

# 4. 推送到Git
git push && git push --tags

# 5. 发布到npm
npm publish

# 一步到位（配合postversion钩子）
npm version patch  # 自动测试、构建、推送、发布`,
                        notes: '规范的更新流程确保质量'
                    },
                    {
                        title: '发布补丁版本',
                        code: `# 场景：在v1.2.3发现bug，但main已是v1.3.0

# 1. 基于v1.2.3创建分支
git checkout -b hotfix/1.2.4 v1.2.3

# 2. 修复bug并测试
# 修改代码...
npm test

# 3. 更新版本
npm version patch  # 1.2.3 → 1.2.4

# 4. 发布
npm publish

# 5. 合并回main
git checkout main
git merge hotfix/1.2.4`,
                        notes: '维护旧版本的补丁发布'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '包的废弃和撤销',
            content: {
                description: 'npm提供deprecate和unpublish命令管理过时或错误的包版本。',
                mechanism: 'deprecate标记包为废弃但不删除，用户安装时会收到警告。unpublish完全删除包，但有严格限制。',
                keyPoints: [
                    'deprecate：标记废弃，推荐替代方案',
                    'unpublish：删除包，有时间和使用限制',
                    '72小时限制：发布后72小时内可unpublish',
                    '无依赖限制：被其他包依赖不能unpublish',
                    '建议废弃：优先使用deprecate而非unpublish',
                    '安全原因：严重安全问题可申请删除'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '废弃和撤销包',
            content: {
                description: '正确使用deprecate和unpublish管理包的生命周期。',
                examples: [
                    {
                        title: '废弃包版本',
                        code: `# 废弃特定版本
npm deprecate @username/my-package@1.0.0 "此版本有严重bug，请升级到1.0.1"

# 废弃所有版本
npm deprecate @username/my-package "此包已废弃，请使用@username/new-package"

# 废弃版本范围
npm deprecate @username/my-package@"< 2.0.0" "请升级到2.x版本"

# 取消废弃
npm deprecate @username/my-package@1.0.0 ""`,
                        notes: 'deprecate不删除包，只是警告'
                    },
                    {
                        title: '撤销发布',
                        code: `# 删除特定版本（72小时内）
npm unpublish @username/my-package@1.0.0

# 删除整个包（72小时内且无依赖）
npm unpublish @username/my-package --force

# 错误提示示例：
# npm ERR! Cannot unpublish package: has been published for more than 72 hours
# npm ERR! Cannot unpublish package: other packages depend on it`,
                        notes: 'unpublish有严格限制，慎用'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '发布npm包最佳实践',
            content: {
                description: '遵循最佳实践可以提升包的质量和用户体验。',
                keyPoints: [
                    '完善文档：详细的README、API文档、示例',
                    '遵循semver：严格按照语义化版本',
                    '自动化测试：CI/CD集成测试',
                    'prepublishOnly：发布前自动构建测试',
                    '精确files：只发布必要文件',
                    'TypeScript支持：提供类型定义',
                    'CHANGELOG：记录每次更新内容',
                    '安全检查：定期运行npm audit'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第10章：npm link本地开发',
            url: './render.html?subject=pkg-manager&type=content&chapter=10'
        },
        next: {
            title: '第12章：npm包开发最佳实践',
            url: './render.html?subject=pkg-manager&type=content&chapter=12'
        }
    }
};
