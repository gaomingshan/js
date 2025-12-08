/**
 * 第34章：依赖分析与优化
 * 依赖可视化、包体积分析、无用依赖清理、按需加载
 */

window.content = {
    section: {
        title: '第34章：依赖分析与优化',
        icon: '📊'
    },
    
    topics: [
        {
            type: 'concept',
            title: '依赖分析的重要性',
            content: {
                description: '依赖分析帮助理解项目依赖关系，发现问题依赖，优化包体积，提升应用性能。',
                keyPoints: [
                    '包体积：影响加载速度',
                    '重复依赖：浪费资源',
                    '无用依赖：增加维护成本',
                    '安全漏洞：及时发现',
                    '依赖图：可视化关系',
                    '优化方向：减小、去重、按需',
                    '工具：多种分析工具'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '依赖分析工具',
            content: {
                description: '使用工具分析项目依赖。',
                examples: [
                    {
                        title: 'npm ls 查看依赖树',
                        code: `# 查看所有依赖
npm ls

# 只看顶层
npm ls --depth=0

# 查看特定包
npm ls lodash

# 查看生产依赖
npm ls --production

# JSON格式
npm ls --json > deps.json`,
                        notes: 'npm ls内置命令'
                    },
                    {
                        title: 'depcheck 检测无用依赖',
                        code: `# 安装
npm install -g depcheck

# 运行
depcheck

# 输出：
# Unused dependencies
# * unused-package-1
# * unused-package-2
#
# Missing dependencies
# * missing-package-1

# 配置（package.json）
{
  "depcheck": {
    "ignoreMatches": [
      "@types/*",
      "eslint-*"
    ]
  }
}

# 删除无用依赖
npm uninstall unused-package-1 unused-package-2`,
                        notes: 'depcheck找出无用依赖'
                    },
                    {
                        title: 'webpack-bundle-analyzer',
                        code: `# 安装
npm install -D webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html'
    })
  ]
};

# 构建
npm run build

# 自动打开report，显示：
# - 每个包的体积
# - 可视化依赖树
# - 找出最大的包

# 优化方向：
# 1. 替换大包
# 2. 按需导入
# 3. Tree shaking`,
                        notes: 'bundle analyzer可视化体积'
                    },
                    {
                        title: 'npm-check 综合检查',
                        code: `# 安装
npm install -g npm-check

# 运行
npm-check

# 输出：
# ❤️  Your modules look amazing. Keep up the great work.
# 
# Major Update Potentially breaking API changes. Use caution.
#   lodash      4.17.20  ❯  5.0.0
#
# Minor Update New backwards-compatible features.
#   axios       0.21.0   ❯  0.27.0
#
# Unused Dependencies
#   moment

# 交互式更新
npm-check -u

# 界面选择要更新的包`,
                        notes: 'npm-check综合工具'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '包体积优化',
            content: {
                description: '减小依赖体积的实用技巧。',
                examples: [
                    {
                        title: '按需导入',
                        code: `// ❌ 错误：导入整个库
import _ from 'lodash';
_.debounce(fn, 100);

// ✅ 正确：按需导入
import debounce from 'lodash/debounce';
debounce(fn, 100);

// 或使用lodash-es（ESM版本）
import { debounce } from 'lodash-es';

// 体积对比：
// lodash: 71KB (gzipped: 25KB)
// lodash/debounce: 3KB (gzipped: 1KB)

// Tree shaking（需要ESM）
import { debounce } from 'lodash-es';
// Webpack/Vite会自动tree shake未使用的代码`,
                        notes: '按需导入显著减小体积'
                    },
                    {
                        title: '替换大包',
                        code: `// moment.js → date-fns
// ❌ moment: 71KB
import moment from 'moment';
moment().format('YYYY-MM-DD');

// ✅ date-fns: 13KB（仅导入需要的函数）
import { format } from 'date-fns';
format(new Date(), 'yyyy-MM-dd');

// axios → ky
// ❌ axios: 14KB
import axios from 'axios';

// ✅ ky: 4KB
import ky from 'ky';

// 体积对比工具
npm install -D size-limit
npx size-limit`,
                        notes: '选择更小的替代品'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: '依赖优化最佳实践',
            content: {
                description: '持续优化项目依赖的策略。',
                keyPoints: [
                    '定期审查：每月检查依赖',
                    'depcheck：清理无用依赖',
                    'bundle分析：找出大包',
                    '按需导入：Tree shaking',
                    '选择轻量：优先小体积包',
                    'peerDependencies：共享依赖',
                    'devDependencies：开发依赖分离',
                    '懒加载：动态import',
                    'CDN：外部化大包',
                    '监控：持续关注体积变化'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第33章：包管理器性能优化',
            url: './render.html?subject=pkg-manager&type=content&chapter=33'
        },
        next: {
            title: '第35章：包安全与合规',
            url: './render.html?subject=pkg-manager&type=content&chapter=35'
        }
    }
};
