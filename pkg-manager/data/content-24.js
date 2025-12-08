/**
 * 第24章：pnpm高级特性
 * .pnpmfile.cjs、hoist配置、peer依赖、覆盖
 */

window.content = {
    section: {
        title: '第24章：pnpm高级特性',
        icon: '🚀'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'pnpm高级特性概览',
            content: {
                description: 'pnpm提供多项高级特性，满足复杂项目的特殊需求，包括钩子、提升控制、peer依赖管理、依赖覆盖等。',
                keyPoints: [
                    '.pnpmfile.cjs：安装钩子',
                    'public-hoist-pattern：选择性提升',
                    'shamefully-hoist：完全提升（不推荐）',
                    'auto-install-peers：自动安装peer',
                    'overrides：强制依赖版本',
                    'patchedDependencies：补丁依赖',
                    'onlyBuiltDependencies：控制构建'
                ]
            }
        },
        
        {
            type: 'principle',
            title: '.pnpmfile.cjs钩子',
            content: {
                description: '.pnpmfile.cjs允许在安装过程中拦截和修改依赖，实现定制化的依赖处理逻辑。',
                mechanism: 'pnpm在解析依赖时会加载.pnpmfile.cjs，调用hooks函数，可以修改package.json内容、依赖关系等。',
                keyPoints: [
                    'readPackage：修改package.json',
                    'afterAllResolved：所有依赖解析后',
                    '修改依赖：添加、删除、替换',
                    '修改版本：强制特定版本',
                    '添加字段：注入配置',
                    '使用场景：修复第三方包问题'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '.pnpmfile.cjs使用',
            content: {
                description: '.pnpmfile.cjs可以在不修改node_modules的情况下调整依赖。',
                examples: [
                    {
                        title: '基本.pnpmfile.cjs',
                        code: `// .pnpmfile.cjs
module.exports = {
  hooks: {
    readPackage(pkg, context) {
      // pkg: 当前包的package.json
      // context: 上下文信息
      
      // 示例1：统一React版本
      if (pkg.dependencies?.react) {
        pkg.dependencies.react = '^18.2.0';
      }
      
      // 示例2：添加缺失的peer依赖
      if (pkg.name === 'some-package') {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies['missing-peer'] = '^1.0.0';
      }
      
      // 示例3：移除某个依赖
      if (pkg.dependencies?.['problematic-package']) {
        delete pkg.dependencies['problematic-package'];
      }
      
      return pkg;
    },
    
    afterAllResolved(lockfile, context) {
      // 所有依赖解析完成后调用
      // lockfile: 锁文件内容
      return lockfile;
    }
  }
};`,
                        notes: '.pnpmfile.cjs在项目根目录'
                    },
                    {
                        title: '实际应用场景',
                        code: `// .pnpmfile.cjs

function readPackage(pkg) {
  // 场景1：修复第三方包的peer依赖声明错误
  if (pkg.name === '@mui/material') {
    pkg.peerDependencies = pkg.peerDependencies || {};
    pkg.peerDependencies['@emotion/react'] = '^11.0.0';
    pkg.peerDependencies['@emotion/styled'] = '^11.0.0';
  }
  
  // 场景2：强制所有包使用相同的TypeScript版本
  if (pkg.devDependencies?.typescript) {
    pkg.devDependencies.typescript = '5.0.4';
  }
  
  // 场景3：替换已废弃的包
  if (pkg.dependencies?.moment) {
    delete pkg.dependencies.moment;
    pkg.dependencies['date-fns'] = '^2.30.0';
    console.log(\`Replaced moment with date-fns in \${pkg.name}\`);
  }
  
  // 场景4：添加缺失的polyfill
  if (pkg.name === 'my-app' && !pkg.dependencies?.['core-js']) {
    pkg.dependencies['core-js'] = '^3.30.0';
  }
  
  return pkg;
}

module.exports = { hooks: { readPackage } };`,
                        notes: '用于修复第三方包的问题'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'hoist配置详解',
            content: {
                description: 'pnpm默认不提升依赖，但提供配置选项用于兼容性或特殊需求。',
                mechanism: 'public-hoist-pattern指定哪些包提升到node_modules根目录，shamefully-hoist提升所有包（类似npm/yarn）。',
                keyPoints: [
                    '默认不提升：严格依赖',
                    'public-hoist-pattern：选择性提升',
                    'shamefully-hoist：全部提升（不推荐）',
                    '兼容性：某些工具需要提升',
                    '性能影响：提升会略微降低性能',
                    '幽灵依赖：提升导致隐式依赖'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'hoist配置',
            content: {
                description: '根据项目需求配置依赖提升策略。',
                examples: [
                    {
                        title: 'public-hoist-pattern',
                        code: `# .npmrc
# 提升特定包到根node_modules

# 提升所有ESLint相关包
public-hoist-pattern[]=*eslint*

# 提升Prettier
public-hoist-pattern[]=*prettier*

# 提升TypeScript相关
public-hoist-pattern[]=*@types/*

# 提升所有以@babel/开头的包
public-hoist-pattern[]=@babel/*

# 结果：
node_modules/
├── eslint/  ← 提升到根目录
├── prettier/  ← 提升到根目录
├── @types/
│   └── node/  ← 提升到根目录
├── .pnpm/  ← 其他包在这里
└── ...

# 场景：某些工具（如IDE、构建工具）需要在根目录找到这些包`,
                        notes: '只提升必要的包'
                    },
                    {
                        title: 'shamefully-hoist（不推荐）',
                        code: `# .npmrc
shamefully-hoist=true

# 效果：完全扁平化，类似npm/yarn
# 所有依赖都提升到根node_modules

# 优点：
# - 最大兼容性
# - 某些古老工具可以工作

# 缺点：
# - 丢失严格依赖优势
# - 重新引入幽灵依赖
# - 违背pnpm设计理念

# 建议：
# - 优先使用public-hoist-pattern
# - 只在别无选择时使用
# - 尽快修复工具链以支持pnpm`,
                        notes: '只在必要时使用'
                    },
                    {
                        title: 'hoist-pattern vs public-hoist-pattern',
                        code: `# .npmrc

# hoist-pattern（已废弃，不推荐）
# 提升匹配的包到虚拟store
hoist-pattern[]=*

# public-hoist-pattern（推荐）
# 提升匹配的包到根node_modules
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# 区别：
# - hoist-pattern: 提升到.pnpm/node_modules
# - public-hoist-pattern: 提升到根node_modules

# 推荐使用public-hoist-pattern`,
                        notes: 'public-hoist-pattern是正确选择'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'peer依赖管理',
            content: {
                description: 'pnpm对peer依赖有严格的检查和灵活的配置选项。',
                mechanism: 'pnpm检测未满足的peer依赖并发出警告，可以配置自动安装、严格模式等行为。',
                keyPoints: [
                    '严格检查：检测未满足的peer',
                    'auto-install-peers：自动安装',
                    'strict-peer-dependencies：严格模式',
                    'resolve-peers-from-workspace：workspace解析',
                    '警告提示：未满足时警告',
                    '版本冲突：检测冲突'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'peer依赖配置',
            content: {
                description: 'pnpm提供多种选项管理peer依赖。',
                examples: [
                    {
                        title: 'peer依赖配置',
                        code: `# .npmrc

# 自动安装peer依赖（推荐）
auto-install-peers=true

# 严格peer依赖（失败会报错）
strict-peer-dependencies=false

# 从workspace解析peer
resolve-peers-from-workspace-root=true

# 场景1：自动安装
# package.json只声明react
{
  "dependencies": {
    "react": "^18.2.0"
  }
}
# 安装@mui/material时，自动安装其peer（@emotion/react等）

# 场景2：严格模式
# strict-peer-dependencies=true
# 如果peer依赖未满足，pnpm install失败`,
                        notes: 'auto-install-peers简化依赖管理'
                    },
                    {
                        title: 'peer依赖警告',
                        code: `# 未配置auto-install-peers时

pnpm add @mui/material

# 输出：
# WARN  unmet peer @emotion/react@"^11.0.0"
# WARN  unmet peer @emotion/styled@"^11.0.0"

# 解决方案1：手动安装peer
pnpm add @emotion/react @emotion/styled

# 解决方案2：启用auto-install-peers
# .npmrc
auto-install-peers=true

# 再次安装，自动安装peer依赖`,
                        notes: 'peer依赖必须满足'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'overrides（依赖覆盖）',
            content: {
                description: 'overrides允许强制所有依赖使用特定版本，解决版本冲突和安全问题。',
                mechanism: 'package.json的pnpm.overrides字段指定版本覆盖规则，pnpm解析依赖时强制使用指定版本。',
                keyPoints: [
                    '强制版本：覆盖所有依赖树',
                    '安全修复：修复漏洞',
                    '版本统一：确保一致性',
                    '通配符：支持模式匹配',
                    '作用域：全局或特定包',
                    '优先级：overrides最高'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'overrides使用',
            content: {
                description: 'overrides解决间接依赖的版本问题。',
                examples: [
                    {
                        title: '基本overrides',
                        code: `// package.json
{
  "pnpm": {
    "overrides": {
      // 强制所有lodash使用4.17.21
      "lodash": "4.17.21",
      
      // 强制所有react使用18.2.0
      "react": "18.2.0",
      
      // 只覆盖特定包的依赖
      "foo>bar": "1.0.0",
      
      // 只覆盖特定包的特定依赖
      "foo>bar>baz": "2.0.0",
      
      // 通配符
      "axios@*": "1.4.0"
    }
  }
}

// 场景：修复安全漏洞
// 某个间接依赖有漏洞，通过overrides强制更新`,
                        notes: 'overrides强制版本'
                    },
                    {
                        title: '实际应用',
                        code: `// package.json
{
  "dependencies": {
    "package-a": "^1.0.0"
    // package-a依赖lodash@3.10.0（有漏洞）
  },
  "pnpm": {
    "overrides": {
      // 强制所有lodash使用安全版本
      "lodash": "4.17.21"
    }
  }
}

// pnpm install后：
// package-a实际使用lodash@4.17.21
// 即使它声明的是3.10.0

// 依赖树：
node_modules/
└── .pnpm/
    ├── package-a@1.0.0/
    │   └── node_modules/
    │       └── lodash → lodash@4.17.21  ← 被覆盖
    └── lodash@4.17.21/`,
                        notes: 'overrides修复安全漏洞'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'patchedDependencies（补丁依赖）',
            content: {
                description: 'pnpm支持通过补丁文件修改第三方包，类似Yarn的patch-package。',
                examples: [
                    {
                        title: '创建补丁',
                        code: `# 1. 修补包
pnpm patch lodash@4.17.21

# 输出：
# You can now edit the following folder: /tmp/xxx/lodash
# Once you're done, run "pnpm patch-commit <path>"

# 2. 修改临时文件夹中的代码
cd /tmp/xxx/lodash
# 修改文件...

# 3. 提交补丁
pnpm patch-commit /tmp/xxx/lodash

# 4. package.json自动更新
{
  "pnpm": {
    "patchedDependencies": {
      "lodash@4.17.21": "patches/lodash@4.17.21.patch"
    }
  }
}

# 5. 补丁文件生成
patches/
└── lodash@4.17.21.patch

# 下次pnpm install自动应用补丁`,
                        notes: 'patch机制修复第三方bug'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '其他高级配置',
            content: {
                description: 'pnpm还有更多高级配置选项。',
                examples: [
                    {
                        title: '构建控制',
                        code: `# .npmrc

# 只构建特定依赖（提升性能）
only-built-dependencies[]=sharp
only-built-dependencies[]=node-sass

# 忽略脚本
ignore-scripts=true

# 侧加载（side-effects-cache）
side-effects-cache=true
side-effects-cache-readonly=false`,
                        notes: '控制native模块构建'
                    },
                    {
                        title: '网络和缓存配置',
                        code: `# .npmrc

# 网络并发数
network-concurrency=16

# 重试次数
fetch-retries=2
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 超时
fetch-timeout=60000

# 使用Lockfile缓存
lockfile-include-tarball-url=false`,
                        notes: '优化安装性能'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'pnpm高级特性最佳实践',
            content: {
                description: '合理使用高级特性解决复杂问题。',
                keyPoints: [
                    '.pnpmfile.cjs：仅用于修复第三方包',
                    'public-hoist-pattern：最小化提升',
                    '避免shamefully-hoist：尽量不用',
                    'auto-install-peers：推荐启用',
                    'overrides谨慎：只在必要时使用',
                    'patch优先：优先提PR给上游',
                    '文档记录：说明为何使用高级特性',
                    'CI验证：确保配置在CI中生效',
                    '定期审查：检查是否还需要这些配置'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第23章：pnpm Workspaces',
            url: './render.html?subject=pkg-manager&type=content&chapter=23'
        },
        next: {
            title: '第25章：pnpm性能优化',
            url: './render.html?subject=pkg-manager&type=content&chapter=25'
        }
    }
};
