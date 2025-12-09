/**
 * 第29章：版本升级策略 - 面试题
 * 涵盖语义化版本控制、自动化升级流程和回归测试
 */

window.content = {
    section: {
        title: "第29章：版本升级策略 - 面试题",
        icon: "📈",
        description: "掌握依赖版本升级策略、自动化工具及风险控制"
    },
    
    topics: [
        // ==================== 单选题 ====================
        {
            type: "quiz",
            title: "题目1：语义化版本（SemVer）",
            content: {
                questionType: "single",
                difficulty: "easy",
                tags: ["SemVer", "基础"],
                question: "根据 SemVer 规范，版本号 `1.2.3` 中的 `2` 代表什么？升级该版本意味着什么？",
                options: [
                    "主版本号（Major）：可能有不兼容的 API 修改",
                    "次版本号（Minor）：向下兼容的功能性新增",
                    "修订号（Patch）：向下兼容的问题修正",
                    "预发布版本：不稳定的测试功能"
                ],
                correctAnswer: 1,
                explanation: {
                    title: "SemVer 规范详解",
                    description: "SemVer 格式为 MAJOR.MINOR.PATCH（主版本.次版本.修订号）。",
                    sections: [
                        {
                            title: "版本号含义",
                            code: String.raw`1.2.3
↑ ↑ ↑
│ │ └─ Patch (修订号): Bug修复，完全兼容
│ └─── Minor (次版本): 新功能，向下兼容
└───── Major (主版本): Breaking Changes，不兼容

特殊规则：
- 0.y.z: 初始开发阶段，API可能随时变化
- 预发布: 1.0.0-alpha.1, 1.0.0-rc.1`,
                            language: "text"
                        },
                        {
                            title: "版本范围符号",
                            code: String.raw`^1.2.3  => >=1.2.3 <2.0.0 (允许 Minor/Patch 升级)
~1.2.3  => >=1.2.3 <1.3.0 (只允许 Patch 升级)
1.2.3   => 精确匹配
*       => 最新版本（不推荐）`,
                            language: "text"
                        }
                    ]
                },
                source: "semver.org"
            }
        },
        
        {
            type: "quiz",
            title: "题目2：自动化升级工具",
            content: {
                questionType: "single",
                difficulty: "medium",
                tags: ["工具", "自动化"],
                question: "相比 Dependabot，Renovate 的主要优势在于？",
                options: [
                    "由 GitHub 官方维护",
                    "支持高度可配置的分组更新（Grouping）和自动合并策略",
                    "扫描速度更快",
                    "支持更多语言"
                ],
                correctAnswer: 1,
                explanation: {
                    title: "Renovate vs Dependabot",
                    description: "Renovate 的核心优势在于其极其强大的配置能力，特别是可以将多个依赖更新合并为一个 PR（Grouping），减少噪音。",
                    sections: [
                        {
                            title: "Renovate 配置示例",
                            code: String.raw`// renovate.json
{
  "extends": ["config:base"],
  // 分组更新：所有非主要版本更新合并为一个PR
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch", "pin", "digest"],
      "groupName": "all non-major dependencies",
      "groupSlug": "all-minor-patch"
    },
    // 自动合并：Linters和测试框架的更新自动合并
    {
      "matchPackagePatterns": ["^eslint", "^jest"],
      "automerge": true
    }
  ]
}`,
                            language: "json"
                        },
                        {
                            title: "Dependabot 局限性",
                            points: [
                                "默认每个依赖更新创建一个 PR，容易造成 'PR轰炸'",
                                "分组功能（Grouping）推出较晚，配置不如 Renovate 灵活",
                                "调度配置相对简单"
                            ]
                        }
                    ]
                },
                source: "Renovate文档"
            }
        },
        
        // ==================== 多选题 ====================
        {
            type: "quiz",
            title: "题目3：版本升级风险控制",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["风险控制", "最佳实践"],
                question: "在进行大规模依赖升级时，应该采取哪些措施来降低风险？（多选）",
                options: [
                    "查看 CHANGELOG.md 和 Migration Guide",
                    "依赖自动化测试（单元测试、E2E测试）覆盖",
                    "使用渐进式升级（Canary Release）",
                    "一次性升级所有依赖以保持最新",
                    "使用 Visual Regression Testing（视觉回归测试）"
                ],
                correctAnswer: [0, 1, 2, 4],
                explanation: {
                    title: "依赖升级风险控制",
                    description: "一次性升级所有依赖（Big Bang Update）是高风险行为，极难定位问题。应该分批、有序进行。",
                    sections: [
                        {
                            title: "安全升级流程",
                            code: String.raw`1. 准备阶段
- 确保测试通过
- 确保 Lockfile 提交

2. 执行阶段
- npm outdated / pnpm outdated 查看可更新包
- 优先升级 Patch/Minor 版本
- 逐个升级 Major 版本
- 阅读变更日志

3. 验证阶段
- 运行测试: npm test
- 构建检查: npm run build
- 视觉检查: Percy / Chromatic
- 手动冒烟测试`,
                            language: "text"
                        },
                        {
                            title: "辅助工具",
                            code: String.raw`# 检查破坏性变更
npm install -g npm-check-updates
ncu

# 交互式升级
yarn upgrade-interactive --latest
pnpm update --interactive --latest`,
                            language: "bash"
                        }
                    ]
                },
                source: "Google Engineering Practices"
            }
        },
        
        {
            type: "quiz",
            title: "题目4：处理 Breaking Changes",
            content: {
                questionType: "multiple",
                difficulty: "hard",
                tags: ["重构", "迁移"],
                question: "当升级一个包含 Breaking Change 的核心库（如 React 17 -> 18, Webpack 4 -> 5）时，推荐的做法是？（多选）",
                options: [
                    "使用 Codemods 自动重构代码",
                    "使用兼容层（Compatibility Layer）或适配器模式",
                    "暂停新功能开发，专门安排时间进行迁移",
                    "忽略旧版本警告，直接修改报错的地方",
                    "在分支上进行迁移，并通过 CI 验证"
                ],
                correctAnswer: [0, 1, 2, 4],
                explanation: {
                    title: "破坏性更新迁移指南",
                    description: "大型迁移需要系统性的规划和工具支持。",
                    sections: [
                        {
                            title: "Codemods 示例",
                            code: String.raw`# React 升级
npx react-codemod update-react-imports

# Next.js 升级
npx @next/codemod name-default-component

# 自定义 Codemod (jscodeshift)
// transform.js
module.exports = function(file, api) {
  const j = api.jscodeshift;
  return j(file.source)
    .find(j.Identifier, { name: 'oldName' })
    .replaceWith(j.identifier('newName'))
    .toSource();
};`,
                            language: "javascript"
                        },
                        {
                            title: "适配器模式",
                            code: String.raw`// 旧代码直接使用 axios v0.x
import axios from 'axios';

// 迁移策略：创建 HTTP 适配器
// http-client.js
import axios from 'axios'; // 升级到 v1.x

export const httpClient = {
  get: (url) => axios.get(url).then(res => res.data), // 适配新API
  post: (url, data) => axios.post(url, data)
};

// 业务代码改为使用适配器
import { httpClient } from './http-client';`,
                            language: "javascript"
                        }
                    ]
                },
                source: "Facebook Codemod"
            }
        },
        
        // ==================== 代码题 ====================
        {
            type: "quiz",
            title: "题目5：配置 Renovate",
            content: {
                questionType: "code-single",
                difficulty: "hard",
                tags: ["Renovate", "配置"],
                question: "编写一个 Renovate 配置，要求：1. 自动合并补丁更新；2. 周末运行；3. 忽略 `node_modules`；4. 为 `react` 相关包分组。",
                code: String.raw`{
  "extends": ["config:base"],
  // 你的配置...
}`,
                options: [
                    "见解析",
                    "无法实现",
                    "只能使用 Dependabot",
                    "需要付费版"
                ],
                correctAnswer: 0,
                explanation: {
                    title: "Renovate 高级配置",
                    description: "Renovate 的强大在于其细腻的配置能力。",
                    sections: [
                        {
                            title: "完整配置",
                            code: String.raw`{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base", ":maintainLockFilesWeekly"],
  
  // 1. 周末运行
  "schedule": ["before 8am on Monday"],
  "timezone": "Asia/Shanghai",
  
  // 3. 忽略路径 (默认已忽略node_modules，这里演示忽略test)
  "ignorePaths": ["**/test/**", "**/examples/**"],
  
  "packageRules": [
    // 1. 自动合并补丁更新
    {
      "matchUpdateTypes": ["patch", "digest"],
      "automerge": true,
      "automergeType": "branch" // 不创建PR，直接推送到分支
    },
    // 4. React 分组
    {
      "matchPackagePatterns": ["^react", "^@types/react"],
      "groupName": "React Ecosystem",
      "labels": ["react-upgrade"]
    }
  ],
  
  // 额外：提交信息规范
  "commitMessagePrefix": "chore(deps):",
  "commitMessageAction": "bump",
  "prConcurrentLimit": 10
}`,
                            language: "json"
                        }
                    ]
                },
                source: "Renovate配置文档"
            }
        },
        
        {
            type: "quiz",
            title: "题目6：版本检测脚本",
            content: {
                questionType: "code-multiple",
                difficulty: "hard",
                tags: ["脚本", "自动化"],
                question: "以下脚本用于检测项目中是否有即将过期的依赖（End of Life），哪些部分是正确的？（多选）",
                code: String.raw`const https = require('https');
const fs = require('fs');

async function checkEOL() {
  const pkg = JSON.parse(fs.readFileSync('package.json'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  for (const [name, version] of Object.entries(deps)) {
    // A. 获取包信息
    const info = await fetchPackageInfo(name);
    
    // B. 解析当前主版本
    const currentMajor = version.replace(/[\^~]/, '').split('.')[0];
    
    // C. 检查是否维护
    const latest = info['dist-tags'].latest;
    const latestMajor = latest.split('.')[0];
    
    if (parseInt(latestMajor) - parseInt(currentMajor) >= 2) {
      console.log(\`⚠️  \${name}: Current \${version}, Latest \${latest}. (Outdated by 2+ majors)\`);
    }
    
    // D. 检查Node版本支持
    const engines = info.versions[latest].engines;
    if (engines && engines.node) {
      // 简单检查逻辑...
    }
  }
}

function fetchPackageInfo(name) {
  return new Promise((resolve) => {
    https.get(\`https://registry.npmjs.org/\${name}\`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

checkEOL();`,
                options: [
                    "A部分：从 npm registry 获取元数据",
                    "B部分：解析 package.json 中的版本号",
                    "C部分：通过比较主版本号差异判断过时程度",
                    "脚本缺少错误处理和并发控制"
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: "依赖生命周期检测",
                    description: "检测过时依赖对于维护系统健康至关重要。该脚本演示了基本原理，但生产环境建议使用 `outdated` 命令或 Renovate。",
                    sections: [
                        {
                            title: "脚本优化点",
                            code: String.raw`1. 并发控制
// 使用 p-limit 限制并发请求数，避免触发 Registry 限流
const pLimit = require('p-limit');
const limit = pLimit(5);
const tasks = Object.entries(deps).map(([name, v]) => 
  limit(() => check(name, v))
);

2. 使用 semver 库
// 手动解析版本号容易出错（如 1.2.0-beta.1）
const semver = require('semver');
if (semver.diff(current, latest) === 'major') { ... }

3. 错误处理
try {
  await fetchPackageInfo(name);
} catch (e) {
  console.error(\`Failed to check \${name}: \${e.message}\`);
}`,
                            language: "javascript"
                        }
                    ]
                },
                source: "Node.js最佳实践"
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "第28章：依赖安全与审计",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=28"
        },
        next: {
            title: "第30章：依赖优化实践",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=30"
        }
    }
};
