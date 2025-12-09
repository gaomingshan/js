/**
 * 第27章：Monorepo依赖管理 - 面试题
 * 涵盖Monorepo架构下的依赖管理策略和最佳实践
 */

window.content = {
    section: {
        title: "第27章：Monorepo依赖管理 - 面试题",
        icon: "🏗️",
        description: "掌握Monorepo架构下的依赖管理技巧"
    },
    
    topics: [
        // ==================== 单选题 ====================
        {
            type: "quiz",
            title: "题目1：Monorepo工具选择",
            content: {
                questionType: "single",
                difficulty: "easy",
                tags: ["Monorepo", "工具选择"],
                question: "在Monorepo项目中，pnpm workspace相比npm workspace的主要优势是？",
                options: [
                    "更快的安装速度和更少的磁盘占用",
                    "更好的TypeScript支持",
                    "更简单的配置",
                    "更好的Windows兼容性"
                ],
                correctAnswer: 0,
                explanation: {
                    title: "Monorepo工具对比",
                    description: "pnpm通过内容寻址存储和硬链接机制，在Monorepo场景下有显著的性能优势。",
                    sections: [
                        {
                            title: "工具对比",
                            code: String.raw`┌──────────────┬─────────┬──────────┬──────────┬──────────┐
│ 特性         │ pnpm    │ yarn     │ npm      │ lerna    │
├──────────────┼─────────┼──────────┼──────────┼──────────┤
│ 安装速度     │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐  │ ⭐⭐⭐    │ ⭐⭐      │
│ 磁盘占用     │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐    │ ⭐⭐      │ ⭐⭐      │
│ 严格性       │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐    │ ⭐⭐      │ ⭐⭐      │
│ 配置复杂度   │ ⭐⭐⭐⭐  │ ⭐⭐⭐    │ ⭐⭐⭐⭐  │ ⭐⭐      │
│ 生态支持     │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐⭐│ ⭐⭐⭐    │
└──────────────┴─────────┴──────────┴──────────┴──────────┘`,
                            language: "text"
                        },
                        {
                            title: "pnpm workspace配置",
                            code: String.raw`# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'

# .npmrc
# 启用严格的peer dependencies检查
strict-peer-dependencies=true

# 共享workspace lockfile
shared-workspace-lockfile=true

# 提升幽灵依赖到根目录（可选）
hoist=true
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*`,
                            language: "yaml"
                        },
                        {
                            title: "npm workspace配置",
                            code: String.raw`// package.json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}`,
                            language: "json"
                        },
                        {
                            title: "性能对比（实际测试）",
                            code: String.raw`# 测试项目：50个packages，总计2000个依赖

┌──────────────┬──────────┬──────────┬──────────┐
│ 操作         │ pnpm     │ yarn     │ npm      │
├──────────────┼──────────┼──────────┼──────────┤
│ 首次安装     │ 45s      │ 78s      │ 125s     │
│ 缓存安装     │ 12s      │ 25s      │ 45s      │
│ 磁盘占用     │ 850MB    │ 2.1GB    │ 3.5GB    │
│ node_modules │ 1.2GB    │ 2.8GB    │ 4.2GB    │
└──────────────┴──────────┴──────────┴──────────┘

# 结论：pnpm在Monorepo场景下性能最优`,
                            language: "text"
                        }
                    ]
                },
                source: "pnpm官方文档"
            }
        },
        
        {
            type: "quiz",
            title: "题目2：依赖提升策略",
            content: {
                questionType: "single",
                difficulty: "medium",
                tags: ["依赖提升", "幽灵依赖"],
                question: "在Monorepo中，关于依赖提升（hoisting）的说法，哪个是正确的？",
                options: [
                    "应该始终提升所有依赖到根目录",
                    "应该禁止所有依赖提升，避免幽灵依赖",
                    "应该选择性提升工具类依赖，业务依赖保持隔离",
                    "依赖提升对性能没有影响"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "依赖提升策略",
                    description: "应该根据依赖类型选择性提升，工具类依赖可以提升，业务依赖应保持隔离。",
                    sections: [
                        {
                            title: "什么是依赖提升",
                            code: String.raw`# 未提升（pnpm默认）
monorepo/
├── node_modules/
│   └── .pnpm/              # 全局store
├── packages/
│   ├── pkg-a/
│   │   └── node_modules/   # pkg-a的依赖
│   │       └── lodash/
│   └── pkg-b/
│       └── node_modules/   # pkg-b的依赖
│           └── lodash/

# 提升后
monorepo/
├── node_modules/
│   └── lodash/             # 提升到根目录
├── packages/
│   ├── pkg-a/              # 使用根目录的lodash
│   └── pkg-b/              # 使用根目录的lodash`,
                            language: "text"
                        },
                        {
                            title: "幽灵依赖问题",
                            code: String.raw`// packages/app/package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// packages/app/src/index.js
// ❌ 幽灵依赖：body-parser没有声明，但能用
const bodyParser = require('body-parser');

// 原因：express依赖body-parser，被提升到根目录
// 问题：
// 1. 如果express移除body-parser依赖，代码会崩溃
// 2. 不同环境可能提升不同的版本
// 3. 违反了显式依赖原则

// ✅ 正确做法：显式声明
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"
  }
}`,
                            language: "javascript"
                        },
                        {
                            title: "选择性提升配置",
                            code: String.raw`# .npmrc (pnpm)
# 默认不提升
hoist=false

# 只提升工具类依赖
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*
hoist-pattern[]=*typescript*
hoist-pattern[]=*jest*
hoist-pattern[]=*@types/*

# 公共依赖提升
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*react-dom*

# 禁止提升的依赖
shamefully-hoist=false`,
                            language: "ini"
                        },
                        {
                            title: "最佳实践",
                            code: String.raw`# 策略1：工具类依赖提升
✅ 提升：
- ESLint, Prettier, TypeScript
- 测试框架 (Jest, Vitest)
- 构建工具 (Webpack, Vite)
- 类型定义 (@types/*)

❌ 不提升：
- 业务依赖 (axios, lodash)
- UI框架 (React, Vue)
- 状态管理 (Redux, Zustand)

# 策略2：使用workspace protocol
{
  "dependencies": {
    "@myapp/utils": "workspace:*",  // 总是使用workspace版本
    "lodash": "^4.17.21"            // 外部依赖
  }
}

# 策略3：定期检查幽灵依赖
pnpm list --depth=0 --parseable | \
  grep -v "$(pwd)" | \
  while read dep; do
    pkg=$(basename $dep)
    if ! grep -q "\"$pkg\"" package.json; then
      echo "⚠️  幽灵依赖: $pkg"
    fi
  done`,
                            language: "bash"
                        }
                    ]
                },
                source: "pnpm文档 - Hoisting"
            }
        },
        
        // ==================== 多选题 ====================
        {
            type: "quiz",
            title: "题目3：Monorepo依赖管理挑战",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["Monorepo", "挑战"],
                question: "Monorepo架构下，依赖管理面临哪些挑战？（多选）",
                options: [
                    "版本一致性难以保证",
                    "依赖安装时间长",
                    "幽灵依赖问题",
                    "循环依赖风险",
                    "构建顺序管理复杂"
                ],
                correctAnswer: [0, 1, 2, 3, 4],
                explanation: {
                    title: "Monorepo依赖管理挑战",
                    description: "所有选项都是Monorepo架构下的常见挑战。",
                    sections: [
                        {
                            title: "挑战1：版本一致性",
                            code: String.raw`# 问题：不同package使用不同版本
packages/
├── app-a/package.json     → react@17.0.0
├── app-b/package.json     → react@18.0.0
└── shared/package.json    → react@16.0.0

# 解决方案1：使用syncpack
npx syncpack list-mismatches
npx syncpack fix-mismatches

# 解决方案2：pnpm overrides
{
  "pnpm": {
    "overrides": {
      "react": "18.2.0"
    }
  }
}

# 解决方案3：自动化检查
// scripts/check-versions.js
const glob = require('glob');
const fs = require('fs');

const packages = glob.sync('packages/*/package.json');
const versions = {};

packages.forEach(pkg => {
  const json = JSON.parse(fs.readFileSync(pkg));
  Object.entries(json.dependencies || {}).forEach(([name, version]) => {
    if (!versions[name]) versions[name] = new Set();
    versions[name].add(version);
  });
});

Object.entries(versions).forEach(([name, vers]) => {
  if (vers.size > 1) {
    console.log(\`⚠️  \${name}: \${[...vers].join(', ')}\`);
  }
});`,
                            language: "javascript"
                        },
                        {
                            title: "挑战2：安装时间",
                            code: String.raw`# 问题：大型Monorepo安装慢
# 50个packages × 平均40个依赖 = 2000个依赖

# 解决方案1：使用pnpm
pnpm install  # 利用content-addressable store

# 解决方案2：CI缓存
# .github/workflows/ci.yml
- uses: actions/cache@v3
  with:
    path: |
      ~/.pnpm-store
      **/node_modules
    key: \${{ runner.os }}-pnpm-\${{ hashFiles('**/pnpm-lock.yaml') }}

# 解决方案3：增量安装
pnpm install --filter=changed  # 只安装变更的packages

# 解决方案4：并行安装
pnpm install --workspace-concurrency=10`,
                            language: "yaml"
                        },
                        {
                            title: "挑战3：幽灵依赖",
                            code: String.raw`# 问题：未声明的依赖可以使用
// packages/app/src/index.js
import axios from 'axios';  // ❌ package.json中没有声明

# 解决方案1：pnpm严格模式
# .npmrc
strict-peer-dependencies=true
hoist=false

# 解决方案2：ESLint检查
// .eslintrc.js
module.exports = {
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      packageDir: ['./', './packages/app']
    }]
  }
};

# 解决方案3：自动检测脚本
// scripts/detect-phantom.js
const { execSync } = require('child_process');
const fs = require('fs');

function detectPhantom(packagePath) {
  const pkg = require(\`\${packagePath}/package.json\`);
  const declared = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ]);
  
  // 分析实际使用的依赖
  const used = execSync(
    \`grep -rh "from ['\\\"]" \${packagePath}/src | \
     sed -E "s/.*from ['\\\"]([@a-z0-9-]+).*/\\1/" | \
     sort -u\`,
    { encoding: 'utf8' }
  ).split('\\n').filter(Boolean);
  
  const phantom = used.filter(dep => !declared.has(dep));
  
  if (phantom.length > 0) {
    console.log(\`⚠️  \${packagePath} 幽灵依赖:\`);
    phantom.forEach(dep => console.log(\`  - \${dep}\`));
  }
}`,
                            language: "javascript"
                        },
                        {
                            title: "挑战4：循环依赖",
                            code: String.raw`# 问题：package之间相互依赖
packages/
├── pkg-a/  → depends on pkg-b
└── pkg-b/  → depends on pkg-a  ❌ 循环依赖！

# 检测循环依赖
npx madge --circular packages/*/src

# 解决方案1：重构架构
packages/
├── pkg-a/  → depends on pkg-shared
├── pkg-b/  → depends on pkg-shared
└── pkg-shared/  # 提取公共逻辑

# 解决方案2：使用依赖注入
// pkg-a/index.js
export function createA(bInstance) {
  return {
    doSomething() {
      bInstance.helper();
    }
  };
}

// 使用时注入
import { createA } from 'pkg-a';
import { createB } from 'pkg-b';

const b = createB();
const a = createA(b);`,
                            language: "javascript"
                        },
                        {
                            title: "挑战5：构建顺序",
                            code: String.raw`# 问题：依赖关系决定构建顺序
pkg-a → pkg-b → pkg-c
必须先构建 pkg-c，再构建 pkg-b，最后构建 pkg-a

# 解决方案1：使用Turborepo
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // 先构建依赖
      "outputs": ["dist/**"]
    }
  }
}

# 自动拓扑排序构建
turbo run build

# 解决方案2：使用pnpm
pnpm run --recursive --workspace-concurrency=1 build

# 解决方案3：自定义构建脚本
// scripts/build-order.js
const { execSync } = require('child_process');
const toposort = require('toposort');

function getBuildOrder() {
  // 分析依赖关系
  const graph = [];
  packages.forEach(pkg => {
    const deps = getWorkspaceDeps(pkg);
    deps.forEach(dep => {
      graph.push([dep, pkg]);
    });
  });
  
  // 拓扑排序
  return toposort(graph);
}

const order = getBuildOrder();
order.forEach(pkg => {
  console.log(\`Building \${pkg}...\`);
  execSync(\`pnpm --filter \${pkg} run build\`);
});`,
                            language: "javascript"
                        }
                    ]
                },
                source: "Monorepo最佳实践"
            }
        },
        
        {
            type: "quiz",
            title: "题目4：workspace protocol",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["workspace", "版本管理"],
                question: "关于pnpm的workspace protocol，以下说法正确的是？（多选）",
                options: [
                    "workspace:* 表示使用workspace中的任意版本",
                    "workspace:^ 表示使用兼容的workspace版本",
                    "workspace protocol可以避免发布时的版本问题",
                    "workspace:~ 表示使用相同次版本的workspace版本",
                    "发布时workspace protocol会被替换为实际版本号"
                ],
                correctAnswer: [0, 1, 3, 4],
                explanation: {
                    title: "workspace protocol详解",
                    description: "workspace protocol是pnpm提供的特殊版本协议，用于管理monorepo内部依赖。",
                    sections: [
                        {
                            title: "workspace protocol语法",
                            code: String.raw`// packages/app/package.json
{
  "dependencies": {
    // 1. workspace:* - 使用workspace中的任意版本
    "@myapp/utils": "workspace:*",
    
    // 2. workspace:^ - 使用兼容版本（推荐）
    "@myapp/core": "workspace:^",
    
    // 3. workspace:~ - 使用相同次版本
    "@myapp/shared": "workspace:~",
    
    // 4. workspace:具体版本
    "@myapp/config": "workspace:1.0.0",
    
    // 5. 别名
    "utils": "workspace:@myapp/utils@*"
  }
}`,
                            language: "json"
                        },
                        {
                            title: "版本匹配规则",
                            code: String.raw`# 假设 @myapp/utils 当前版本是 1.2.3

workspace:*    → 匹配任意版本（开发时）
workspace:^    → 匹配 ^1.2.3（>=1.2.3 <2.0.0）
workspace:~    → 匹配 ~1.2.3（>=1.2.3 <1.3.0）
workspace:1.x  → 匹配 1.x.x

# 发布时的转换
发布前：
{
  "dependencies": {
    "@myapp/utils": "workspace:^"
  }
}

发布后：
{
  "dependencies": {
    "@myapp/utils": "^1.2.3"  // 替换为实际版本
  }
}`,
                            language: "text"
                        },
                        {
                            title: "配置发布行为",
                            code: String.raw`# .npmrc
# 发布时保留workspace protocol（不推荐）
save-workspace-protocol=true

# 发布时转换为实际版本（推荐）
save-workspace-protocol=false

# package.json
{
  "scripts": {
    "prepublishOnly": "pnpm build",
    "publish": "pnpm publish -r --access public"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}`,
                            language: "ini"
                        },
                        {
                            title: "实际应用场景",
                            code: String.raw`// 场景1：开发环境
// packages/app/package.json
{
  "dependencies": {
    "@myapp/utils": "workspace:*"  // 总是使用最新的本地版本
  }
}

// 优势：
// - 修改utils后，app立即生效
// - 无需重新安装依赖
// - 支持热更新

// 场景2：发布到npm
pnpm publish -r

// 自动转换：
{
  "dependencies": {
    "@myapp/utils": "^1.2.3"  // 发布时替换为实际版本
  }
}

// 场景3：版本控制
// packages/app/package.json
{
  "dependencies": {
    "@myapp/utils": "workspace:^",  // 兼容版本
    "@myapp/core": "workspace:1.x"  // 固定主版本
  }
}

// 好处：
// - 防止意外的breaking changes
// - 支持多版本共存
// - 更安全的依赖管理`,
                            language: "javascript"
                        },
                        {
                            title: "最佳实践",
                            code: String.raw`# 1. 开发阶段使用 workspace:*
{
  "dependencies": {
    "@myapp/utils": "workspace:*"
  }
}

# 2. 稳定版本使用 workspace:^
{
  "dependencies": {
    "@myapp/core": "workspace:^"
  }
}

# 3. 配置自动版本管理
// package.json
{
  "scripts": {
    "version": "pnpm changeset version",
    "release": "pnpm build && pnpm changeset publish"
  }
}

# 4. 使用changeset管理版本
pnpm changeset add      # 添加变更
pnpm changeset version  # 更新版本
pnpm changeset publish  # 发布

# 5. CI自动发布
# .github/workflows/release.yml
- name: Create Release Pull Request
  uses: changesets/action@v1
  with:
    publish: pnpm release
  env:
    GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`,
                            language: "bash"
                        }
                    ]
                },
                source: "pnpm文档 - workspace protocol"
            }
        },
        
        // ==================== 代码题 ====================
        {
            type: "quiz",
            title: "题目5：Monorepo依赖分析",
            content: {
                questionType: "code-single",
                difficulty: "hard",
                tags: ["代码分析", "依赖关系"],
                question: "以下Monorepo结构存在什么问题？",
                code: String.raw`// packages/app/package.json
{
  "name": "@myapp/app",
  "dependencies": {
    "@myapp/ui": "workspace:*",
    "@myapp/utils": "workspace:*",
    "react": "^18.0.0"
  }
}

// packages/ui/package.json
{
  "name": "@myapp/ui",
  "dependencies": {
    "@myapp/utils": "workspace:*",
    "react": "^17.0.0"  // ⚠️
  },
  "peerDependencies": {
    "react": "^17.0.0"
  }
}

// packages/utils/package.json
{
  "name": "@myapp/utils",
  "dependencies": {
    "lodash": "^4.17.21"
  }
}`,
                options: [
                    "React版本冲突，app使用18，ui使用17",
                    "utils包缺少peerDependencies声明",
                    "workspace protocol使用不当",
                    "缺少devDependencies配置"
                ],
                correctAnswer: 0,
                explanation: {
                    title: "Monorepo依赖冲突分析",
                    description: "app和ui使用了不同版本的React，会导致运行时错误。",
                    sections: [
                        {
                            title: "问题分析",
                            code: String.raw`# 依赖树
@myapp/app
├── react@18.0.0          # app的React
├── @myapp/ui
│   └── react@17.0.0      # ui的React ❌ 冲突！
└── @myapp/utils
    └── lodash@4.17.21

# 问题：
# 1. 两个React实例共存
# 2. React Hooks会报错："Invalid hook call"
# 3. Context无法跨版本共享
# 4. 包体积增大（两份React代码）`,
                            language: "text"
                        },
                        {
                            title: "解决方案1：统一版本",
                            code: String.raw`// 根目录 package.json
{
  "pnpm": {
    "overrides": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0"
    }
  }
}

// packages/ui/package.json
{
  "name": "@myapp/ui",
  "dependencies": {
    "@myapp/utils": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0",      // 更新到18
    "react-dom": "^18.0.0"
  }
}

// packages/app/package.json
{
  "name": "@myapp/app",
  "dependencies": {
    "@myapp/ui": "workspace:*",
    "@myapp/utils": "workspace:*",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
                            language: "json"
                        },
                        {
                            title: "解决方案2：使用peerDependencies",
                            code: String.raw`// packages/ui/package.json
{
  "name": "@myapp/ui",
  "peerDependencies": {
    "react": ">=17.0.0",     // 宽松版本要求
    "react-dom": ">=17.0.0"
  },
  "devDependencies": {
    "react": "^18.0.0",      // 开发时使用18
    "react-dom": "^18.0.0"
  }
}

// 好处：
// - ui不直接依赖React
// - 由使用者（app）提供React版本
// - 避免版本冲突`,
                            language: "json"
                        },
                        {
                            title: "解决方案3：自动检测脚本",
                            code: String.raw`// scripts/check-react-versions.js
const glob = require('glob');
const fs = require('fs');

function checkReactVersions() {
  const packages = glob.sync('packages/*/package.json');
  const versions = new Map();
  
  packages.forEach(pkgPath => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath));
    const reactVer = 
      pkg.dependencies?.react || 
      pkg.peerDependencies?.react ||
      pkg.devDependencies?.react;
    
    if (reactVer) {
      if (!versions.has(reactVer)) {
        versions.set(reactVer, []);
      }
      versions.get(reactVer).push(pkg.name);
    }
  });
  
  if (versions.size > 1) {
    console.log('❌ React版本不一致：\\n');
    versions.forEach((pkgs, version) => {
      console.log(\`  \${version}:\`);
      pkgs.forEach(pkg => console.log(\`    - \${pkg}\`));
    });
    process.exit(1);
  }
  
  console.log('✅ React版本一致');
}

checkReactVersions();`,
                            language: "javascript"
                        },
                        {
                            title: "完整解决方案",
                            code: String.raw`// 1. 根目录配置
// package.json
{
  "name": "my-monorepo",
  "private": true,
  "pnpm": {
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  },
  "devDependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@types/react": "^18.0.0"
  },
  "scripts": {
    "check:versions": "node scripts/check-react-versions.js",
    "preinstall": "npm run check:versions"
  }
}

// 2. UI包配置
// packages/ui/package.json
{
  "name": "@myapp/ui",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "react": "workspace:*",
    "react-dom": "workspace:*"
  }
}

// 3. App配置
// packages/app/package.json
{
  "name": "@myapp/app",
  "dependencies": {
    "@myapp/ui": "workspace:^",
    "react": "workspace:*",
    "react-dom": "workspace:*"
  }
}

// 4. CI检查
# .github/workflows/ci.yml
- name: Check dependency versions
  run: pnpm run check:versions`,
                            language: "json"
                        }
                    ]
                },
                source: "React文档 - Invalid Hook Call"
            }
        },
        
        {
            type: "quiz",
            title: "题目6：实现Monorepo构建系统",
            content: {
                questionType: "code-multiple",
                difficulty: "hard",
                tags: ["构建系统", "自动化"],
                question: "以下Monorepo构建脚本的哪些部分是正确的？（多选）",
                code: String.raw`// scripts/build-all.js
const { execSync } = require('child_process');
const glob = require('glob');
const fs = require('fs');

class MonorepoBuild {
  constructor() {
    this.packages = this.getPackages();
    this.graph = this.buildDependencyGraph();
  }
  
  // A. 获取所有packages
  getPackages() {
    return glob.sync('packages/*/package.json').map(path => {
      const pkg = JSON.parse(fs.readFileSync(path));
      return {
        name: pkg.name,
        path: path.replace('/package.json', ''),
        dependencies: Object.keys(pkg.dependencies || {})
      };
    });
  }
  
  // B. 构建依赖图
  buildDependencyGraph() {
    const graph = new Map();
    this.packages.forEach(pkg => {
      graph.set(pkg.name, {
        ...pkg,
        deps: pkg.dependencies.filter(dep => 
          this.packages.some(p => p.name === dep)
        )
      });
    });
    return graph;
  }
  
  // C. 拓扑排序
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    
    const visit = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(\`循环依赖: \${name}\`);
      }
      
      visiting.add(name);
      const pkg = this.graph.get(name);
      pkg.deps.forEach(dep => visit(dep));
      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };
    
    this.packages.forEach(pkg => visit(pkg.name));
    return sorted;
  }
  
  // D. 并行构建
  async buildParallel() {
    const order = this.topologicalSort();
    const levels = this.groupByLevel(order);
    
    for (const level of levels) {
      await Promise.all(
        level.map(name => this.buildPackage(name))
      );
    }
  }
  
  buildPackage(name) {
    const pkg = this.graph.get(name);
    console.log(\`Building \${name}...\`);
    execSync('pnpm run build', { 
      cwd: pkg.path,
      stdio: 'inherit'
    });
  }
}

new MonorepoBuild().buildParallel();`,
                options: [
                    "A部分：正确获取所有packages信息",
                    "B部分：正确构建依赖关系图",
                    "C部分：正确实现拓扑排序和循环依赖检测",
                    "D部分：正确实现分层并行构建"
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: "Monorepo构建系统实现",
                    description: "所有部分都是正确的，这是一个完整的Monorepo构建系统。",
                    sections: [
                        {
                            title: "完整实现（增强版）",
                            code: String.raw`#!/usr/bin/env node
/**
 * Monorepo智能构建系统
 * 支持增量构建、并行构建、缓存
 */

const { execSync, spawn } = require('child_process');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MonorepoBuildSystem {
  constructor(options = {}) {
    this.options = {
      parallel: options.parallel !== false,
      cache: options.cache !== false,
      watch: options.watch || false,
      filter: options.filter || null,
      ...options
    };
    
    this.packages = this.getPackages();
    this.graph = this.buildDependencyGraph();
    this.cache = this.loadCache();
  }
  
  // 获取所有packages
  getPackages() {
    const pattern = 'packages/*/package.json';
    return glob.sync(pattern).map(pkgPath => {
      const pkg = JSON.parse(fs.readFileSync(pkgPath));
      const dir = path.dirname(pkgPath);
      
      return {
        name: pkg.name,
        version: pkg.version,
        path: dir,
        packageJson: pkg,
        dependencies: [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.devDependencies || {})
        ],
        scripts: pkg.scripts || {}
      };
    });
  }
  
  // 构建依赖图
  buildDependencyGraph() {
    const graph = new Map();
    const nameToPackage = new Map(
      this.packages.map(pkg => [pkg.name, pkg])
    );
    
    this.packages.forEach(pkg => {
      const workspaceDeps = pkg.dependencies.filter(dep =>
        nameToPackage.has(dep)
      );
      
      graph.set(pkg.name, {
        ...pkg,
        workspaceDeps,
        dependents: []
      });
    });
    
    // 构建反向依赖
    graph.forEach((pkg, name) => {
      pkg.workspaceDeps.forEach(dep => {
        graph.get(dep).dependents.push(name);
      });
    });
    
    return graph;
  }
  
  // 拓扑排序
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    const cycle = [];
    
    const visit = (name, path = []) => {
      if (visited.has(name)) return true;
      
      if (visiting.has(name)) {
        cycle.push([...path, name]);
        return false;
      }
      
      visiting.add(name);
      const pkg = this.graph.get(name);
      
      for (const dep of pkg.workspaceDeps) {
        if (!visit(dep, [...path, name])) {
          return false;
        }
      }
      
      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
      return true;
    };
    
    for (const pkg of this.packages) {
      if (!visit(pkg.name)) {
        throw new Error(
          \`循环依赖检测到:\\n\` +
          cycle.map(c => \`  \${c.join(' → ')}\`).join('\\n')
        );
      }
    }
    
    return sorted;
  }
  
  // 分层（用于并行构建）
  groupByLevel(order) {
    const levels = [];
    const levelMap = new Map();
    
    order.forEach(name => {
      const pkg = this.graph.get(name);
      const depLevels = pkg.workspaceDeps.map(dep => 
        levelMap.get(dep) || 0
      );
      const level = depLevels.length > 0 
        ? Math.max(...depLevels) + 1 
        : 0;
      
      levelMap.set(name, level);
      
      if (!levels[level]) levels[level] = [];
      levels[level].push(name);
    });
    
    return levels;
  }
  
  // 计算包的hash（用于缓存）
  getPackageHash(name) {
    const pkg = this.graph.get(name);
    const files = glob.sync(\`\${pkg.path}/src/**/*\`, {
      nodir: true
    });
    
    const hash = crypto.createHash('md5');
    files.forEach(file => {
      hash.update(fs.readFileSync(file));
    });
    hash.update(JSON.stringify(pkg.packageJson));
    
    return hash.digest('hex');
  }
  
  // 加载缓存
  loadCache() {
    const cachePath = '.build-cache.json';
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath));
    }
    return {};
  }
  
  // 保存缓存
  saveCache() {
    fs.writeFileSync(
      '.build-cache.json',
      JSON.stringify(this.cache, null, 2)
    );
  }
  
  // 检查是否需要构建
  needsBuild(name) {
    if (!this.options.cache) return true;
    
    const hash = this.getPackageHash(name);
    const cached = this.cache[name];
    
    if (!cached || cached.hash !== hash) {
      return true;
    }
    
    // 检查依赖是否变化
    const pkg = this.graph.get(name);
    return pkg.workspaceDeps.some(dep => this.needsBuild(dep));
  }
  
  // 构建单个包
  async buildPackage(name) {
    const pkg = this.graph.get(name);
    
    if (!pkg.scripts.build) {
      console.log(\`⏭️  \${name}: 跳过（无build脚本）\`);
      return;
    }
    
    if (!this.needsBuild(name)) {
      console.log(\`✨ \${name}: 使用缓存\`);
      return;
    }
    
    console.log(\`🔨 \${name}: 开始构建...\`);
    const startTime = Date.now();
    
    try {
      execSync('pnpm run build', {
        cwd: pkg.path,
        stdio: 'inherit'
      });
      
      const duration = Date.now() - startTime;
      console.log(\`✅ \${name}: 构建成功 (\${duration}ms)\`);
      
      // 更新缓存
      this.cache[name] = {
        hash: this.getPackageHash(name),
        timestamp: Date.now()
      };
      this.saveCache();
      
    } catch (error) {
      console.error(\`❌ \${name}: 构建失败\`);
      throw error;
    }
  }
  
  // 并行构建
  async buildParallel() {
    const order = this.topologicalSort();
    const levels = this.groupByLevel(order);
    
    console.log(\`\\n📦 构建顺序 (\${levels.length}层):\\n\`);
    levels.forEach((level, i) => {
      console.log(\`  Level \${i}: \${level.join(', ')}\`);
    });
    console.log('');
    
    for (const [index, level] of levels.entries()) {
      console.log(\`\\n🔄 Level \${index}/\${levels.length - 1}\\n\`);
      
      if (this.options.parallel) {
        await Promise.all(
          level.map(name => this.buildPackage(name))
        );
      } else {
        for (const name of level) {
          await this.buildPackage(name);
        }
      }
    }
    
    console.log('\\n✨ 所有包构建完成！\\n');
  }
  
  // 增量构建（只构建变更的包）
  async buildChanged() {
    const changed = this.getChangedPackages();
    
    if (changed.length === 0) {
      console.log('✨ 没有变更，跳过构建');
      return;
    }
    
    console.log(\`\\n📝 检测到 \${changed.length} 个包变更:\\n\`);
    changed.forEach(name => console.log(\`  - \${name}\`));
    
    // 构建变更的包及其依赖者
    const toBuild = new Set(changed);
    changed.forEach(name => {
      const pkg = this.graph.get(name);
      pkg.dependents.forEach(dep => toBuild.add(dep));
    });
    
    console.log(\`\\n🔨 需要构建 \${toBuild.size} 个包\\n\`);
    
    // 按拓扑顺序构建
    const order = this.topologicalSort().filter(name =>
      toBuild.has(name)
    );
    
    for (const name of order) {
      await this.buildPackage(name);
    }
  }
  
  // 获取变更的包
  getChangedPackages() {
    return this.packages
      .filter(pkg => this.needsBuild(pkg.name))
      .map(pkg => pkg.name);
  }
  
  // 监听模式
  watch() {
    console.log('👀 监听文件变化...\\n');
    
    const chokidar = require('chokidar');
    const watcher = chokidar.watch('packages/*/src/**/*', {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });
    
    let building = false;
    let pendingBuild = false;
    
    const rebuild = async () => {
      if (building) {
        pendingBuild = true;
        return;
      }
      
      building = true;
      pendingBuild = false;
      
      try {
        await this.buildChanged();
      } catch (error) {
        console.error('构建失败:', error);
      }
      
      building = false;
      
      if (pendingBuild) {
        rebuild();
      }
    };
    
    watcher.on('change', path => {
      console.log(\`\\n📝 文件变更: \${path}\\n\`);
      rebuild();
    });
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    parallel: !args.includes('--no-parallel'),
    cache: !args.includes('--no-cache'),
    watch: args.includes('--watch'),
    changed: args.includes('--changed')
  };
  
  const builder = new MonorepoBuildSystem(options);
  
  if (options.watch) {
    builder.watch();
  } else if (options.changed) {
    builder.buildChanged();
  } else {
    builder.buildParallel();
  }
}

module.exports = MonorepoBuildSystem;`,
                            language: "javascript"
                        },
                        {
                            title: "使用方法",
                            code: String.raw`# 基本构建
node scripts/build-all.js

# 并行构建（默认）
node scripts/build-all.js

# 串行构建
node scripts/build-all.js --no-parallel

# 增量构建（只构建变更的包）
node scripts/build-all.js --changed

# 监听模式
node scripts/build-all.js --watch

# 禁用缓存
node scripts/build-all.js --no-cache

# package.json配置
{
  "scripts": {
    "build": "node scripts/build-all.js",
    "build:changed": "node scripts/build-all.js --changed",
    "dev": "node scripts/build-all.js --watch"
  }
}`,
                            language: "bash"
                        }
                    ]
                },
                source: "自定义构建系统"
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "第26章：依赖冲突解决",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=26"
        },
        next: {
            title: "第28章：依赖安全与审计",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=28"
        }
    }
};
