/**
 * 第30章：依赖优化实践 - 面试题
 * 涵盖Tree Shaking、包体积分析和依赖瘦身技巧
 */

window.content = {
    section: {
        title: "第30章：依赖优化实践 - 面试题",
        icon: "🚀",
        description: "掌握Tree Shaking、包体积分析和依赖瘦身技巧"
    },
    
    topics: [
        // ==================== 单选题 ====================
        {
            type: "quiz",
            title: "题目1：Tree Shaking 原理",
            content: {
                questionType: "single",
                difficulty: "easy",
                tags: ["Tree Shaking", "优化"],
                question: "要使 Tree Shaking 生效，项目代码和依赖包最好使用什么模块格式？",
                options: [
                    "CommonJS (require/module.exports)",
                    "AMD (define)",
                    "ES Modules (import/export)",
                    "UMD (Universal Module Definition)"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "Tree Shaking 机制",
                    description: "Tree Shaking 依赖于 ES Modules 的静态结构特性，构建工具可以在编译时分析出未使用的导出。",
                    sections: [
                        {
                            title: "对比",
                            code: String.raw`// CommonJS (动态，难以Tree Shaking)
const utils = require('./utils');
const method = 'func' + 'tion';
utils[method](); // 只有运行时才知道调用了什么

// ES Modules (静态，易于Tree Shaking)
import { functionA } from './utils';
// 明确只使用了 functionA，functionB 可以被移除`,
                            language: "javascript"
                        },
                        {
                            title: "package.json 配置",
                            code: String.raw`{
  "name": "my-lib",
  // 提示构建工具这是个纯函数库，无副作用
  "sideEffects": false,
  // 指定入口
  "module": "dist/index.esm.js",
  "main": "dist/index.cjs.js"
}`,
                            language: "json"
                        }
                    ]
                },
                source: "Webpack文档"
            }
        },
        
        {
            type: "quiz",
            title: "题目2：轻量级替代方案",
            content: {
                questionType: "single",
                difficulty: "easy",
                tags: ["性能", "选型"],
                question: "为了减少打包体积，以下哪个替换方案通常是推荐的？",
                options: [
                    "用 Moment.js 替换 Day.js",
                    "用 Lodash 替换 Lodash-es",
                    "用 Day.js 替换 Moment.js",
                    "用 React 替换 Preact"
                ],
                correctAnswer: 2,
                explanation: {
                    title: "依赖瘦身",
                    description: "Moment.js 体积巨大（且停止维护），Day.js 只有 2KB 且 API 兼容。",
                    sections: [
                        {
                            title: "常见替代库",
                            code: String.raw`┌─────────────┬─────────────┬─────────┐
│ 原库        │ 替代库      │ 节省体积│
├─────────────┼─────────────┼─────────┤
│ Moment.js   │ Day.js      │ ~97%    │
│             │ date-fns    │ ~90%    │
├─────────────┼─────────────┼─────────┤
│ Lodash      │ Lodash-es   │ 按需引入│
│             │ Radash      │ ~80%    │
├─────────────┼─────────────┼─────────┤
│ React       │ Preact      │ ~90%    │
├─────────────┼─────────────┼─────────┤
│ Axios       │ Redaxios    │ ~90%    │
│             │ Fetch API   │ 100%    │
└─────────────┴─────────────┴─────────┘`,
                            language: "text"
                        }
                    ]
                },
                source: "BundlePhobia"
            }
        },
        
        // ==================== 多选题 ====================
        {
            type: "quiz",
            title: "题目3：sideEffects 标记",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["Webpack", "Tree Shaking"],
                question: "关于 package.json 中的 `sideEffects` 字段，以下说法正确的是？（多选）",
                options: [
                    "设置为 false 表示所有文件都没有副作用，可以安全地 Tree Shaking",
                    "可以设置为数组，列出有副作用的文件（如 CSS 文件）",
                    "副作用指的是模块执行时修改全局变量、DOM 或其他外部状态",
                    "只有 npm 包才需要这个字段，业务项目不需要",
                    "如果误判无副作用，可能导致样式文件被丢弃"
                ],
                correctAnswer: [0, 1, 2, 5],
                explanation: {
                    title: "Side Effects 详解",
                    description: "sideEffects 是指导构建工具进行 Tree Shaking 的关键配置。",
                    sections: [
                        {
                            title: "副作用示例",
                            code: String.raw`// 无副作用（Pure）
export function add(a, b) { return a + b; }

// 有副作用（Impure）
import './style.css'; // 注入样式到DOM
window.myGlobal = 1;  // 修改全局对象
console.log('init');  // 控制台输出`,
                            language: "javascript"
                        },
                        {
                            title: "正确配置",
                            code: String.raw`// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
// 含义：除了 CSS 和 polyfills，其他文件如果没有被引用导出，都可以安全删除`,
                            language: "json"
                        }
                    ]
                },
                source: "Webpack文档 - Side Effects"
            }
        },
        
        {
            type: "quiz",
            title: "题目4：分析工具",
            content: {
                questionType: "multiple",
                difficulty: "medium",
                tags: ["工具", "分析"],
                question: "以下哪些工具可以帮助分析前端包体积？（多选）",
                options: [
                    "webpack-bundle-analyzer",
                    "rollup-plugin-visualizer",
                    "source-map-explorer",
                    "Import Cost (VS Code插件)",
                    "BundlePhobia"
                ],
                correctAnswer: [0, 1, 2, 3, 4],
                explanation: {
                    title: "包体积分析工具链",
                    description: "这些工具覆盖了开发时、构建时和选型阶段的分析需求。",
                    sections: [
                        {
                            title: "工具用途",
                            code: String.raw`1. Webpack Bundle Analyzer
- 构建后生成交互式树状图
- 适合发现重复打包、大体积依赖

2. Source Map Explorer
- 基于 source map 分析
- 适用于任何构建工具（甚至 Create React App）

3. Import Cost
- 在编辑器中实时显示 import 的大小
- 开发阶段即时反馈

4. BundlePhobia
- 在线查询 npm 包的体积
- 选型神器`,
                            language: "text"
                        }
                    ]
                },
                source: "前端性能优化指南"
            }
        },
        
        // ==================== 代码题 ====================
        {
            type: "quiz",
            title: "题目5：优化导入语句",
            content: {
                questionType: "code-single",
                difficulty: "hard",
                tags: ["代码优化", "Tree Shaking"],
                question: "以下代码在 Webpack 中打包体积较大，如何优化？",
                code: String.raw`import _ from 'lodash';
import { Button } from 'antd';
import moment from 'moment';

const res = _.map([1, 2, 3], n => n * 2);
const btn = <Button>Click</Button>;
const now = moment().format('YYYY-MM-DD');`,
                options: [
                    "使用 babel-plugin-import 实现按需加载",
                    "改用 lodash-es 和 dayjs，并使用具体导入路径",
                    "在 webpack 中配置 alias",
                    "使用 externals"
                ],
                correctAnswer: 1,
                explanation: {
                    title: "导入优化技巧",
                    description: "直接导入整个库（如 lodash）会导致 Tree Shaking 失效。使用 ES 版本和具体路径可以显著减小体积。",
                    sections: [
                        {
                            title: "优化前",
                            code: String.raw`import _ from 'lodash';  // 引入 70KB+
import moment from 'moment'; // 引入 200KB+ (含locales)`,
                            language: "javascript"
                        },
                        {
                            title: "优化后",
                            code: String.raw`// 1. Lodash: 使用 es 版本或具体路径
import map from 'lodash-es/map'; 
// 或 import { map } from 'lodash-es'; (需要开启Tree Shaking)

// 2. Ant Design: 现代版本(v4/v5)已自动支持Tree Shaking
import { Button } from 'antd'; 

// 3. Moment: 替换为 Day.js
import dayjs from 'dayjs'; // 2KB`,
                            language: "javascript"
                        },
                        {
                            title: "Babel 插件方案（旧项目）",
                            code: String.raw`// .babelrc
{
  "plugins": [
    ["import", {
      "libraryName": "lodash",
      "libraryDirectory": "",
      "camel2DashComponentName": false
    }]
  ]
}`,
                            language: "json"
                        }
                    ]
                },
                source: "Ant Design文档"
            }
        },
        
        {
            type: "quiz",
            title: "题目6：Webpack 优化配置",
            content: {
                questionType: "code-multiple",
                difficulty: "hard",
                tags: ["Webpack", "配置"],
                question: "以下 Webpack 配置片段，哪些有助于减小打包体积？（多选）",
                code: String.raw`module.exports = {
  mode: 'production',
  
  // A. 分包策略
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  
  // B. 排除外部依赖
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  
  // C. 压缩配置
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true // 移除console
        }
      }
    })]
  },
  
  // D. 忽略本地化文件
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    })
  ]
};`,
                options: [
                    "A部分：splitChunks 将公共依赖提取为单独 chunk",
                    "B部分：externals 使用 CDN 加载依赖，不打包进 bundle",
                    "C部分：TerserPlugin 压缩代码并移除 console",
                    "D部分：IgnorePlugin 忽略 Moment.js 的语言包"
                ],
                correctAnswer: [0, 1, 2, 3],
                explanation: {
                    title: "Webpack 体积优化",
                    description: "这是一个综合的优化配置示例。",
                    sections: [
                        {
                            title: "SplitChunks",
                            description: "防止重复打包，利用浏览器缓存。将变动少的 node_modules 提取出来。",
                            code: String.raw`cacheGroups: {
  commons: {
    name: 'commons',
    chunks: 'initial',
    minChunks: 2
  }
}`,
                            language: "javascript"
                        },
                        {
                            title: "Externals",
                            description: "适用于 React, Vue 等大体积库。通过 script 标签引入 CDN 链接。",
                            code: String.raw`// HTML
<script src="https://cdn.bootcdn.net/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>`,
                            language: "html"
                        },
                        {
                            title: "IgnorePlugin",
                            description: "Moment.js 默认引入所有语言包。使用 IgnorePlugin 可以在构建时忽略它们。",
                            code: String.raw`// 手动引入需要的语言
import 'moment/locale/zh-cn';
moment.locale('zh-cn');`,
                            language: "javascript"
                        }
                    ]
                },
                source: "Webpack优化指南"
            }
        }
    ],
    
    navigation: {
        prev: {
            title: "第29章：版本升级策略",
            url: "./render.html?subject=pkg-manager&type=quiz&chapter=29"
        },
        next: {
            title: "返回目录",
            url: "./index.html"
        }
    }
};
