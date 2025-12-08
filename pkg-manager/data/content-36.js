/**
 * 第36章：包管理器最佳实践总结
 * 选型决策、团队规范、性能/安全/可维护性、未来趋势
 */

window.content = {
    section: {
        title: '第36章：包管理器最佳实践总结',
        icon: '✨'
    },
    
    topics: [
        {
            type: 'concept',
            title: '包管理器演进之路',
            content: {
                description: '从npm 1.0到现代工具，包管理器历经十余年演进，解决了依赖管理、性能、安全等关键问题，形成了成熟的生态体系。',
                keyPoints: [
                    '2010：npm诞生，开启包管理时代',
                    '2016：Yarn问世，挑战npm',
                    '2017：pnpm创新硬链接方案',
                    '2020：Yarn Berry PnP革命',
                    '2023：生态成熟，各有千秋',
                    '未来：更快、更安全、更智能',
                    '选择：根据场景选择最佳工具'
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '包管理器选型决策',
            content: {
                description: '不同场景下的包管理器选择策略。',
                items: [
                    {
                        name: '新项目推荐',
                        pros: [
                            '首选：pnpm',
                            '理由：性能最佳、空间最省',
                            '严格依赖：避免幽灵依赖',
                            'Workspace：强大过滤器',
                            '备选：Yarn Berry（如果能接受PnP）'
                        ]
                    },
                    {
                        name: 'Monorepo项目',
                        pros: [
                            '首选：pnpm + Turborepo',
                            '理由：性能 + 任务编排',
                            'pnpm：最快的包管理器',
                            'Turborepo：智能缓存和并行',
                            '备选：Yarn + Nx（企业级）'
                        ]
                    },
                    {
                        name: '老项目迁移',
                        pros: [
                            '评估：兼容性和成本',
                            '渐进式：先试点再推广',
                            '工具：depcheck发现幽灵依赖',
                            '测试：充分测试后迁移',
                            '文档：记录迁移过程'
                        ]
                    },
                    {
                        name: '开源库项目',
                        pros: [
                            '灵活：支持多种包管理器',
                            'lock文件：可选不提交',
                            'CI：测试多种环境',
                            '文档：说明兼容性'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '团队规范制定',
            content: {
                description: '建立统一的包管理规范确保团队协作顺畅。',
                examples: [
                    {
                        title: '规范文档模板',
                        code: `# 包管理规范

## 1. 包管理器
- **统一使用**：pnpm 8.x
- **安装**：corepack enable
- **版本锁定**：package.json中指定packageManager

## 2. 依赖管理
- **添加依赖**：pnpm add <package>
- **开发依赖**：pnpm add -D <package>
- **版本范围**：使用^（允许minor更新）
- **禁止**：不要手动编辑lock文件

## 3. Monorepo规范
- **结构**：packages/存放库，apps/存放应用
- **命名**：使用@company作用域
- **workspace协议**：使用workspace:^
- **依赖提升**：不使用shamefully-hoist

## 4. 版本管理
- **工具**：使用Changesets
- **提交**：遵循Conventional Commits
- **发布**：自动化CI/CD

## 5. 安全规范
- **审计**：每月运行pnpm audit
- **更新**：Renovate自动PR
- **License**：只允许MIT/Apache/ISC
- **SBOM**：生成物料清单

## 6. 性能优化
- **镜像源**：配置国内镜像
- **CI缓存**：使用pnpm store缓存
- **增量构建**：Turborepo
- **并行执行**：充分利用CPU

## 7. Git规范
- **提交lock**：必须提交pnpm-lock.yaml
- **.gitignore**：不要忽略lock文件
- **PR检查**：lock文件一致性验证`,
                        notes: '团队规范文档示例'
                    },
                    {
                        title: '.npmrc配置模板',
                        code: `# .npmrc（项目根目录）

# 镜像源（中国用户）
registry=https://registry.npmmirror.com

# pnpm配置
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true

# 网络配置
network-concurrency=16
fetch-retries=2
fetch-timeout=60000

# 安全
audit-level=moderate

# 作用域配置
@my-company:registry=https://npm.company.com/`,
                        notes: '统一的.npmrc配置'
                    },
                    {
                        title: 'package.json配置模板',
                        code: `// package.json（Monorepo根）
{
  "name": "my-monorepo",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@8.10.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    // 开发
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    
    // 工具
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \\"**/*.{ts,tsx,js,jsx,json,md}\\"",
    "type-check": "tsc --noEmit",
    
    // 依赖管理
    "update:check": "pnpm outdated -r",
    "update:minor": "pnpm update -r --latest",
    "dep:check": "depcheck",
    "audit": "pnpm audit --audit-level=moderate",
    
    // 版本和发布
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish",
    
    // Git hooks
    "prepare": "husky install"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "depcheck": "^1.4.0",
    "eslint": "^8.50.0",
    "husky": "^8.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  }
}`,
                        notes: '完整的package.json配置'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '性能优化最佳实践',
            content: {
                description: '性能优化的核心策略总结。',
                keyPoints: [
                    '✅ 使用pnpm：最快的包管理器',
                    '✅ 配置镜像：国内使用淘宝镜像',
                    '✅ CI缓存：缓存pnpm store',
                    '✅ frozen-lockfile：CI中使用',
                    '✅ Turborepo：增量构建和缓存',
                    '✅ 过滤器：只构建变更的包',
                    '✅ 并行执行：充分利用多核',
                    '✅ 依赖优化：去重和tree shaking',
                    '✅ 监控：持续关注性能指标',
                    '✅ 文档：记录优化措施'
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '安全最佳实践',
            content: {
                description: '安全管理的关键措施。',
                keyPoints: [
                    '✅ 定期审计：每月pnpm audit',
                    '✅ 自动更新：Renovate/Dependabot',
                    '✅ License检查：CI强制合规',
                    '✅ 漏洞扫描：Snyk集成',
                    '✅ SBOM生成：软件物料清单',
                    '✅ 私有registry：内部包管理',
                    '✅ 最小权限：npm token管理',
                    '✅ 签名验证：包完整性',
                    '✅ 应急响应：快速修复流程',
                    '✅ 安全培训：提升团队意识'
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '可维护性最佳实践',
            content: {
                description: '保持项目长期可维护的策略。',
                keyPoints: [
                    '✅ 清晰结构：packages/apps分离',
                    '✅ 命名规范：@scope/package-name',
                    '✅ 文档完善：README和架构图',
                    '✅ 版本管理：Changesets自动化',
                    '✅ 测试覆盖：充分的单元测试',
                    '✅ CI/CD：自动化流程',
                    '✅ 代码审查：PR必须review',
                    '✅ 依赖审查：定期清理无用依赖',
                    '✅ 技术债：及时偿还',
                    '✅ 知识传承：文档和培训'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'CI/CD完整配置',
            content: {
                description: '生产级CI/CD配置示例。',
                examples: [
                    {
                        title: 'GitHub Actions完整流程',
                        code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # 1. 代码检查
  lint:
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
      
      - run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm type-check
      
      - name: Format check
        run: pnpm format --check
  
  # 2. 测试
  test:
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
      
      - run: pnpm install --frozen-lockfile
      
      # 只测试变更的包
      - name: Test changed
        run: pnpm test --filter="...[origin/main]"
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  # 3. 构建
  build:
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
      
      - run: pnpm install --frozen-lockfile
      
      # 只构建变更的包
      - name: Build changed
        run: pnpm build --filter="[origin/main]..."
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: apps/*/dist
  
  # 4. 安全检查
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: pnpm install --frozen-lockfile
      
      - name: Audit
        run: pnpm audit --audit-level=moderate
      
      - name: License check
        run: |
          npm install -g license-checker
          license-checker --onlyAllow "MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause"
      
      - name: Generate SBOM
        run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json
      
      - uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.json

# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`,
                        notes: '完整的CI/CD配置'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '未来趋势展望',
            content: {
                description: '包管理器的未来发展方向。',
                mechanism: '基于当前技术演进和社区反馈，包管理器将朝着更快、更安全、更智能的方向发展，同时保持向后兼容和生态繁荣。',
                keyPoints: [
                    '性能极致：零安装、即时启动',
                    '安全优先：内置安全扫描',
                    '智能化：AI辅助依赖优化',
                    '标准化：统一的包格式和协议',
                    '去中心化：分布式registry',
                    'Web3：区块链验证',
                    '跨平台：统一包管理体验',
                    'Edge computing：边缘缓存'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '技术趋势',
            content: {
                description: '包管理器领域的前沿技术。',
                examples: [
                    {
                        title: '即将到来的特性',
                        code: `// 1. ESM优先
// package.json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}

// 2. 更智能的peer依赖
{
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": false
    }
  }
}

// 3. Workspaces增强
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/react-native", "**/react-native/**"]
  }
}

// 4. 内置安全
// 自动检测和修复漏洞
npm install --audit-fix

// 5. AI辅助
// 智能推荐依赖版本
npm suggest lodash

// 6. 分布式registry
// IPFS/区块链
npm install lodash --registry=ipfs://...`,
                        notes: '未来的包管理器将更强大'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '完整项目Checklist',
            content: {
                description: '启动新项目的完整检查清单。',
                examples: [
                    {
                        title: '项目初始化Checklist',
                        code: `# 包管理器项目初始化清单

## 1. 包管理器选择 ✓
- [ ] 确定使用pnpm（推荐）
- [ ] 配置packageManager字段
- [ ] 配置engines约束版本

## 2. 项目结构 ✓
- [ ] 创建packages/和apps/目录
- [ ] 配置pnpm-workspace.yaml
- [ ] 设置@scope作用域

## 3. 配置文件 ✓
- [ ] .npmrc（镜像源和pnpm配置）
- [ ] .gitignore（包含node_modules，不包含lock）
- [ ] .editorconfig（代码格式）
- [ ] .prettierrc（代码风格）
- [ ] .eslintrc.js（代码检查）
- [ ] tsconfig.json（TypeScript）
- [ ] turbo.json（任务编排）

## 4. Git规范 ✓
- [ ] commitlint（提交规范）
- [ ] husky（Git hooks）
- [ ] lint-staged（提交前检查）

## 5. 依赖管理 ✓
- [ ] 配置resolutions/overrides
- [ ] 设置auto-install-peers
- [ ] 配置public-hoist-pattern
- [ ] 提交pnpm-lock.yaml

## 6. CI/CD ✓
- [ ] GitHub Actions配置
- [ ] pnpm store缓存
- [ ] 自动化测试
- [ ] 自动化部署
- [ ] Changesets发布

## 7. 安全 ✓
- [ ] npm audit集成
- [ ] License检查
- [ ] Renovate/Dependabot
- [ ] SBOM生成

## 8. 文档 ✓
- [ ] README.md
- [ ] CONTRIBUTING.md
- [ ] 架构文档
- [ ] 开发指南

## 9. 监控 ✓
- [ ] 性能监控
- [ ] 依赖更新监控
- [ ] 安全漏洞监控

## 10. 团队协作 ✓
- [ ] 规范文档
- [ ] 培训材料
- [ ] 问题FAQ`,
                        notes: '按清单逐项完成'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '总结与建议',
            content: {
                description: '包管理器使用的核心建议。',
                keyPoints: [
                    '🚀 新项目：pnpm + Turborepo',
                    '📦 Monorepo：pnpm Workspaces + Changesets',
                    '🔒 安全：定期audit + Renovate',
                    '⚡ 性能：镜像源 + CI缓存',
                    '📊 分析：depcheck + bundle analyzer',
                    '📝 规范：团队文档 + Git hooks',
                    '🔄 更新：自动化 + 测试',
                    '🏗️ 架构：清晰结构 + 单向依赖',
                    '👥 协作：Code Review + 知识分享',
                    '🎯 持续改进：监控 + 优化 + 迭代'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第35章：包安全与合规',
            url: './render.html?subject=pkg-manager&type=content&chapter=35'
        },
        next: {
            title: '返回目录',
            url: './index.html?subject=pkg-manager'
        }
    }
};
