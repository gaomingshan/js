/**
 * 第26章：依赖冲突解决 - 面试题
 * 涵盖依赖冲突的识别、分析和解决方案
 */

window.content = {
    section: {
        title: "第26章：依赖冲突解决 - 面试题",
        icon: "⚔️",
        description: "掌握依赖冲突的识别、分析和解决技巧"
    },
    
    topics: [
        // ==================== 单选题 ====================
        {
            type: "quiz",
            title: "题目1：依赖冲突识别",
            content: {
                questionType: "single",
                difficulty: "easy",
                tags: ["依赖冲突", "基础知识"],
                question: "以下哪个命令可以检测项目中的依赖冲突？",
                options: [
                    "npm list",
                    "npm dedupe",
                    "npm audit",
                    "npm outdated"
                ],
                correctAnswer: 0,
                explanation: {
                    title: "依赖冲突检测",
                    description: "`npm list` 可以显示依赖树，帮助识别版本冲突。",
                    sections: [
                        {
                            title: "检测命令对比",
                            code: String.raw`# npm/yarn
npm list --depth=0        # 查看直接依赖
npm list package-name     # 查看特定包的依赖树
yarn list --pattern "react"

# pnpm
pnpm list --depth=0
pnpm list --filter package-name
pnpm why react            # 查看为什么安装了react

# 检测冲突
npm ls | grep "UNMET"     # npm
pnpm list --depth Infinity | grep "─"  # pnpm重复依赖`,
                            language: "bash"
                        },
                        {
                            title: "输出示例",
                            code: String.raw`# 存在冲突的输出
myapp@1.0.0
├─┬ package-a@1.0.0
│ └── lodash@4.17.21
└─┬ package-b@2.0.0
  └── lodash@3.10.1  # 冲突！不同版本

# pnpm的输出
dependencies:
lodash 4.17.21
  lodash 3.10.1  # 显示重复版本`,
                            language: "text"
                        },
                        {
                            title: "最佳实践",
                            points: [
                                "定期运行 `npm list` 检查依赖树",
                                "使用 `pnpm why` 追踪依赖来源",
                                "在CI中集成依赖检查",
                                "使用 lockfile 锁定版本"
                            ]
                        }
                    ]
                },
                source: "npm官方文档"
            }
        },
        
        {
            type: "quiz",
            title: "题目2：Peer Dependencies冲突",
            content: {
                questionType: "single",
                difficulty: "medium",
                tags: ["peerDependencies", "冲突解决"],
                question: "当两个包要求不兼容的 peerDependencies 版本时，最佳解决方案是？",
                options: [
                    "强制使用其中一个版本",
                    "使用 npm-force-resolutions",
                    "升级或降级其中一个包到兼容版本",
                    "删除其中一个包"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "Peer Dependencies冲突处理",
                    description: "应该优先寻找兼容的包版本，而不是强制覆盖。",
                    sections: [
                        {
                            title: "冲突场景",
                            code: String.raw`// package.json
{
  "dependencies": {
    "react-router": "^5.0.0",    // 要求 react@^16.8.0
    "react-dnd": "^14.0.0"       // 要求 react@^17.0.0
  }
}

// 安装时报错
npm ERR! peer dep missing: react@^17.0.0, required by react-dnd@14.0.0`,
                            language: "json"
                        },
                        {
                            title: "解决方案1：升级到兼容版本",
                            code: String.raw`# 1. 检查兼容版本
npm info react-router peerDependencies
npm info react-dnd peerDependencies

# 2. 升级到兼容版本
npm install react-router@^6.0.0  # 支持 react@^17.0.0

# 3. 验证
npm list react`,
                            language: "bash"
                        },
                        {
                            title: "解决方案2：使用resolutions（yarn/pnpm）",
                            code: String.raw`// package.json (yarn)
{
  "resolutions": {
    "react": "^17.0.0"
  }
}

// pnpm-workspace.yaml (pnpm)
{
  "pnpm": {
    "overrides": {
      "react": "^17.0.0"
    }
  }
}`,
                            language: "json"
                        },
                        {
                            title: "解决方案3：npm overrides (npm 8.3+)",
                            code: String.raw`// package.json
{
  "overrides": {
    "react": "^17.0.0"
  }
}

// 或针对特定包
{
  "overrides": {
    "react-dnd": {
      "react": "^17.0.0"
    }
  }
}`,
                            language: "json"
                        }
                    ]
                },
                source: "npm文档 - overrides"
            }
        },
        
        // ==================== 多选题 ====================
        {
            type: "quiz",
            title: "题目3：依赖冲突的常见原因",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["依赖冲突", "原因分析"],
                question: "以下哪些是导致依赖冲突的常见原因？（多选）",
                options: [
                    "使用了宽松的版本范围（^、~）",
                    "不同包依赖同一个包的不同主版本",
                    "没有使用 lockfile",
                    "peerDependencies 版本要求不兼容",
                    "使用了 npm link 进行本地开发"
                ],
                correctAnswer: [0, 1, 2, 3, 4],
                explanation: {
                    title: "依赖冲突原因分析",
                    description: "所有选项都是导致依赖冲突的常见原因。",
                    sections: [
                        {
                            title: "原因1：宽松版本范围",
                            code: String.raw`// package.json
{
  "dependencies": {
    "lodash": "^4.0.0"  // 可能安装 4.0.0 到 4.x.x 任意版本
  }
}

// 问题：不同时间安装可能得到不同版本
# 开发环境：lodash@4.17.21
# 生产环境：lodash@4.17.20 (如果没有lockfile)`,
                            language: "json"
                        },
                        {
                            title: "原因2：主版本冲突",
                            code: String.raw`// 依赖树
myapp
├─┬ package-a@1.0.0
│ └── axios@0.21.0      # 使用旧版本
└─┬ package-b@2.0.0
  └── axios@1.3.0       # 使用新版本

// 结果：两个版本都会被安装
node_modules/
  axios/              # 1.3.0
  package-a/
    node_modules/
      axios/          # 0.21.0`,
                            language: "text"
                        },
                        {
                            title: "原因3：缺少lockfile",
                            code: String.raw`# 场景：团队协作
# 开发者A
npm install  # 生成 package-lock.json
# lodash@4.17.21

# 开发者B（没有lockfile）
npm install  # 可能安装不同版本
# lodash@4.17.20

# 解决方案
git add package-lock.json  # 提交lockfile
npm ci                     # 使用lockfile安装`,
                            language: "bash"
                        },
                        {
                            title: "原因4：peerDependencies冲突",
                            code: String.raw`// react-router@5 的 package.json
{
  "peerDependencies": {
    "react": ">=16.8"
  }
}

// material-ui@4 的 package.json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0"
  }
}

// 你的项目
{
  "dependencies": {
    "react": "^18.0.0",  // 冲突！
    "react-router": "^5.0.0",
    "material-ui": "^4.0.0"
  }
}`,
                            language: "json"
                        },
                        {
                            title: "原因5：npm link问题",
                            code: String.raw`# 本地开发场景
cd ~/projects/my-lib
npm link

cd ~/projects/my-app
npm link my-lib

# 问题：my-lib 和 my-app 可能使用不同版本的依赖
# my-lib: react@17.0.0
# my-app: react@18.0.0
# 结果：运行时可能出现两个React实例

# 解决方案：使用相同版本或使用 pnpm workspace`,
                            language: "bash"
                        }
                    ]
                },
                source: "npm最佳实践"
            }
        },
        
        {
            type: "quiz",
            title: "题目4：解决冲突的工具",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["工具", "冲突解决"],
                question: "以下哪些工具可以帮助解决依赖冲突？（多选）",
                options: [
                    "npm dedupe",
                    "yarn resolutions",
                    "pnpm overrides",
                    "npm-check-updates",
                    "syncpack"
                ],
                correctAnswer: [0, 1, 2, 4],
                explanation: {
                    title: "依赖冲突解决工具",
                    description: "npm-check-updates 主要用于检查更新，不直接解决冲突。其他工具都可以帮助解决冲突。",
                    sections: [
                        {
                            title: "工具1：npm dedupe",
                            code: String.raw`# 去重依赖，减少冲突
npm dedupe

# 示例：优化前
node_modules/
  lodash/              # 4.17.21
  package-a/
    node_modules/
      lodash/          # 4.17.20

# 优化后（如果版本兼容）
node_modules/
  lodash/              # 4.17.21 (共享)
  package-a/           # 使用顶层的lodash`,
                            language: "bash"
                        },
                        {
                            title: "工具2：yarn resolutions",
                            code: String.raw`// package.json
{
  "resolutions": {
    // 强制所有包使用特定版本
    "lodash": "4.17.21",
    
    // 只针对特定包的依赖
    "package-a/lodash": "4.17.21",
    
    // 使用通配符
    "**/lodash": "4.17.21"
  }
}

# 安装
yarn install`,
                            language: "json"
                        },
                        {
                            title: "工具3：pnpm overrides",
                            code: String.raw`// package.json
{
  "pnpm": {
    "overrides": {
      // 全局覆盖
      "lodash": "4.17.21",
      
      // 针对特定包
      "package-a>lodash": "4.17.21",
      
      // 使用版本范围
      "axios": "^1.0.0"
    }
  }
}

# 或在 .npmrc
# overrides.lodash=4.17.21`,
                            language: "json"
                        },
                        {
                            title: "工具4：syncpack (Monorepo)",
                            code: String.raw`# 安装
npm install -g syncpack

# 检查版本不一致
syncpack list-mismatches

# 修复版本不一致
syncpack fix-mismatches

# 配置 .syncpackrc.json
{
  "versionGroups": [
    {
      "label": "React ecosystem should be pinned",
      "dependencies": ["react", "react-dom"],
      "pinVersion": "18.2.0"
    }
  ]
}`,
                            language: "bash"
                        },
                        {
                            title: "工具对比",
                            code: String.raw`┌─────────────┬──────────┬─────────┬────────────┐
│ 工具        │ 包管理器 │ 场景    │ 推荐度     │
├─────────────┼──────────┼─────────┼────────────┤
│ dedupe      │ npm      │ 去重    │ ⭐⭐⭐     │
│ resolutions │ yarn     │ 强制版本│ ⭐⭐⭐⭐   │
│ overrides   │ pnpm/npm │ 强制版本│ ⭐⭐⭐⭐⭐ │
│ syncpack    │ 通用     │ Monorepo│ ⭐⭐⭐⭐   │
└─────────────┴──────────┴─────────┴────────────┘`,
                            language: "text"
                        }
                    ]
                },
                source: "包管理器文档"
            }
        },
        
        // ==================== 代码题 ====================
        {
            type: "quiz",
            title: "题目5：分析依赖冲突",
            content: {
                questionType: "code-single",
                difficulty: "hard",
                tags: ["代码分析", "依赖树"],
                question: "以下依赖树存在什么问题？如何解决？",
                code: String.raw`myapp@1.0.0
├─┬ react-router@5.3.0
│ └── react@16.14.0
├─┬ material-ui@4.12.0
│ └── react@17.0.2
└── react@18.2.0

npm ERR! Could not resolve dependency:
npm ERR! peer react@"^16.8.0" from react-router@5.3.0`,
                options: [
                    "升级 react-router 到 v6，支持 React 18",
                    "降级 React 到 16.14.0",
                    "使用 npm overrides 强制 React 版本",
                    "删除 material-ui"
                ],
                correctAnswer: 0,
                explanation: {
                    title: "依赖冲突分析与解决",
                    description: "问题是 react-router v5 不支持 React 18，应该升级到 v6。",
                    sections: [
                        {
                            title: "问题分析",
                            code: String.raw`# 依赖关系
react-router@5.3.0  → 要求 react@^16.8.0
material-ui@4.12.0  → 要求 react@^16.8.0 || ^17.0.0
项目                → 使用 react@18.2.0

# 冲突原因
react-router v5 不支持 React 18
material-ui v4 不支持 React 18`,
                            language: "text"
                        },
                        {
                            title: "解决方案1：升级依赖（推荐）",
                            code: String.raw`# 1. 升级 react-router 到 v6
npm install react-router-dom@6

# 2. 升级 material-ui 到 v5 (支持React 18)
npm install @mui/material@5

# 3. 更新代码
// 旧代码 (react-router v5)
import { Switch, Route } from 'react-router-dom';

<Switch>
  <Route path="/" component={Home} />
</Switch>

// 新代码 (react-router v6)
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Home />} />
</Routes>`,
                            language: "javascript"
                        },
                        {
                            title: "解决方案2：使用overrides（临时方案）",
                            code: String.raw`// package.json
{
  "overrides": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}

// 警告：可能导致运行时错误
// react-router v5 在 React 18 下可能有兼容性问题`,
                            language: "json"
                        },
                        {
                            title: "解决方案3：降级React（不推荐）",
                            code: String.raw`# 降级到 React 17
npm install react@17 react-dom@17

# 缺点：
# - 失去 React 18 的新特性
# - 技术债务
# - 未来升级更困难`,
                            language: "bash"
                        },
                        {
                            title: "最佳实践",
                            points: [
                                "优先升级依赖到最新兼容版本",
                                "查看官方迁移指南",
                                "使用 codemods 自动迁移代码",
                                "在测试环境充分测试",
                                "避免使用 overrides 作为长期方案"
                            ]
                        }
                    ]
                },
                source: "React Router v6 迁移指南"
            }
        },
        
        {
            type: "quiz",
            title: "题目6：编写冲突检测脚本",
            content: {
                questionType: "code-multiple",
                difficulty: "hard",
                tags: ["脚本编写", "自动化"],
                question: "以下脚本用于检测依赖冲突，哪些部分是正确的？（多选）",
                code: String.raw`// check-conflicts.js
const { execSync } = require('child_process');
const fs = require('fs');

function checkConflicts() {
  // A. 获取依赖树
  const tree = execSync('npm list --json', { encoding: 'utf8' });
  const deps = JSON.parse(tree);
  
  // B. 查找重复依赖
  const duplicates = {};
  function traverse(node, path = []) {
    if (node.dependencies) {
      for (const [name, info] of Object.entries(node.dependencies)) {
        const key = name;
        if (!duplicates[key]) {
          duplicates[key] = [];
        }
        duplicates[key].push({
          version: info.version,
          path: [...path, name].join(' > ')
        });
        traverse(info, [...path, name]);
      }
    }
  }
  
  // C. 分析冲突
  traverse(deps);
  const conflicts = Object.entries(duplicates)
    .filter(([_, versions]) => {
      const uniqueVersions = [...new Set(versions.map(v => v.version))];
      return uniqueVersions.length > 1;
    });
  
  // D. 生成报告
  if (conflicts.length > 0) {
    console.log('⚠️  发现依赖冲突：\n');
    conflicts.forEach(([name, versions]) => {
      console.log(\`📦 \${name}:\`);
      versions.forEach(v => {
        console.log(\`  - \${v.version} (\${v.path})\`);
      });
    });
    process.exit(1);
  }
}

checkConflicts();`,
                options: [
                    "A部分：使用 npm list --json 获取依赖树",
                    "B部分：递归遍历依赖树查找重复",
                    "C部分：通过版本去重判断冲突",
                    "D部分：输出冲突报告并退出"
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: "依赖冲突检测脚本",
                    description: "所有部分都是正确的，这是一个完整的冲突检测脚本。",
                    sections: [
                        {
                            title: "完整脚本（增强版）",
                            code: String.raw`#!/usr/bin/env node
/**
 * 依赖冲突检测工具
 * 支持 npm/yarn/pnpm
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ConflictDetector {
  constructor(options = {}) {
    this.packageManager = options.pm || this.detectPM();
    this.threshold = options.threshold || 1;
    this.ignorePeers = options.ignorePeers || false;
  }
  
  // 检测包管理器
  detectPM() {
    if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
    if (fs.existsSync('yarn.lock')) return 'yarn';
    return 'npm';
  }
  
  // 获取依赖树
  getDependencyTree() {
    const commands = {
      npm: 'npm list --json --all',
      yarn: 'yarn list --json',
      pnpm: 'pnpm list --json --depth=Infinity'
    };
    
    try {
      const output = execSync(commands[this.packageManager], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      return JSON.parse(output);
    } catch (error) {
      // npm list 在有问题时会返回非0退出码
      if (error.stdout) {
        return JSON.parse(error.stdout);
      }
      throw error;
    }
  }
  
  // 遍历依赖树
  traverse(node, path = [], result = {}) {
    if (!node.dependencies) return result;
    
    for (const [name, info] of Object.entries(node.dependencies)) {
      const key = name;
      
      if (!result[key]) {
        result[key] = {
          versions: new Map(),
          isPeer: info.peerDependency || false
        };
      }
      
      const version = info.version || 'unknown';
      const fullPath = [...path, name].join(' > ');
      
      if (!result[key].versions.has(version)) {
        result[key].versions.set(version, []);
      }
      result[key].versions.get(version).push(fullPath);
      
      // 递归遍历
      this.traverse(info, [...path, name], result);
    }
    
    return result;
  }
  
  // 分析冲突
  analyzeConflicts(dependencies) {
    const conflicts = [];
    const warnings = [];
    
    for (const [name, info] of Object.entries(dependencies)) {
      const versions = Array.from(info.versions.keys());
      
      // 跳过peer dependencies（可选）
      if (this.ignorePeers && info.isPeer) continue;
      
      if (versions.length > this.threshold) {
        const conflict = {
          package: name,
          versions: Array.from(info.versions.entries()).map(([v, paths]) => ({
            version: v,
            count: paths.length,
            paths: paths.slice(0, 3)  // 只显示前3个路径
          })),
          severity: this.getSeverity(versions)
        };
        
        if (conflict.severity === 'high') {
          conflicts.push(conflict);
        } else {
          warnings.push(conflict);
        }
      }
    }
    
    return { conflicts, warnings };
  }
  
  // 判断严重程度
  getSeverity(versions) {
    const majors = versions.map(v => parseInt(v.split('.')[0]));
    const uniqueMajors = [...new Set(majors)];
    
    // 主版本不同 = 高风险
    if (uniqueMajors.length > 1) return 'high';
    
    // 次版本不同 = 中风险
    const minors = versions.map(v => parseInt(v.split('.')[1]));
    const uniqueMinors = [...new Set(minors)];
    if (uniqueMinors.length > 1) return 'medium';
    
    return 'low';
  }
  
  // 生成报告
  generateReport(conflicts, warnings) {
    console.log('\\n📊 依赖冲突检测报告\\n');
    console.log(\`包管理器: ${this.packageManager}\\n\`);
    
    if (conflicts.length === 0 && warnings.length === 0) {
      console.log('✅ 未发现依赖冲突\\n');
      return 0;
    }
    
    // 高风险冲突
    if (conflicts.length > 0) {
      console.log(\`🔴 严重冲突 (${conflicts.length}):\\n\`);
      conflicts.forEach(c => {
        console.log(\`  📦 ${c.package}\`);
        c.versions.forEach(v => {
          console.log(\`    - ${v.version} (${v.count} 次)\`);
          v.paths.forEach(p => console.log(\`      ${p}\`));
        });
        console.log('');
      });
    }
    
    // 警告
    if (warnings.length > 0) {
      console.log(\`⚠️  潜在冲突 (${warnings.length}):\\n\`);
      warnings.forEach(w => {
        console.log(\`  📦 ${w.package}: ${w.versions.map(v => v.version).join(', ')}\`);
      });
      console.log('');
    }
    
    // 建议
    console.log('💡 解决建议:\\n');
    console.log('  1. 运行 npm dedupe 去重依赖');
    console.log('  2. 使用 overrides/resolutions 统一版本');
    console.log('  3. 升级依赖到兼容版本\\n');
    
    return conflicts.length > 0 ? 1 : 0;
  }
  
  // 主函数
  run() {
    try {
      console.log('🔍 正在检测依赖冲突...\\n');
      
      const tree = this.getDependencyTree();
      const dependencies = this.traverse(tree);
      const { conflicts, warnings } = this.analyzeConflicts(dependencies);
      
      return this.generateReport(conflicts, warnings);
    } catch (error) {
      console.error('❌ 检测失败:', error.message);
      return 2;
    }
  }
}

// CLI
if (require.main === module) {
  const detector = new ConflictDetector({
    pm: process.env.PM || undefined,
    threshold: parseInt(process.env.THRESHOLD) || 1,
    ignorePeers: process.env.IGNORE_PEERS === 'true'
  });
  
  const exitCode = detector.run();
  process.exit(exitCode);
}

module.exports = ConflictDetector;`,
                            language: "javascript"
                        },
                        {
                            title: "使用方法",
                            code: String.raw`# 基本使用
node check-conflicts.js

# 指定包管理器
PM=pnpm node check-conflicts.js

# 忽略peer dependencies
IGNORE_PEERS=true node check-conflicts.js

# 设置阈值（允许的重复次数）
THRESHOLD=2 node check-conflicts.js

# 在package.json中配置
{
  "scripts": {
    "check:conflicts": "node scripts/check-conflicts.js",
    "precommit": "npm run check:conflicts"
  }
}

# CI集成
# .github/workflows/ci.yml
- name: Check dependency conflicts
  run: npm run check:conflicts`,
                            language: "bash"
                        },
                        {
                            title: "输出示例",
                            code: String.raw`📊 依赖冲突检测报告

包管理器: pnpm

🔴 严重冲突 (2):

  📦 react
    - 17.0.2 (3 次)
      myapp > react-router > react
      myapp > material-ui > react
      myapp > react-dnd > react
    - 18.2.0 (1 次)
      myapp > react

  📦 lodash
    - 4.17.20 (5 次)
      myapp > package-a > lodash
      myapp > package-b > lodash
    - 4.17.21 (2 次)
      myapp > lodash

⚠️  潜在冲突 (1):

  📦 axios: 0.27.2, 1.3.0

💡 解决建议:

  1. 运行 npm dedupe 去重依赖
  2. 使用 overrides/resolutions 统一版本
  3. 升级依赖到兼容版本`,
                            language: "text"
                        }
                    ]
                },
                source: "自定义脚本"
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "第25章：pnpm性能优化",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=25"
        },
        next: {
            title: "第27章：Monorepo依赖管理",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=27"
        }
    }
};
