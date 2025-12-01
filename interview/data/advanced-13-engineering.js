/**
 * 工程化实践
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced13Engineering = {
  "config": {
    "title": "工程化实践",
    "icon": "⚙️",
    "description": "掌握代码规范、测试、CI/CD、性能监控等工程化最佳实践",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["代码规范"],
      "question": "ESLint和Prettier的主要区别是什么？",
      "options": [
        "ESLint关注代码质量，Prettier关注代码风格",
        "ESLint是新版本，Prettier是旧版本",
        "ESLint用于JavaScript，Prettier用于CSS",
        "完全相同"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ESLint vs Prettier：",
        "code": "// ESLint：代码质量\n// - 未使用的变量\n// - 可能的错误\n// - 最佳实践\n{\n  \"rules\": {\n    \"no-unused-vars\": \"error\",\n    \"no-console\": \"warn\",\n    \"eqeqeq\": \"error\"\n  }\n}\n\n// Prettier：代码格式\n// - 缩进\n// - 引号\n// - 分号\n{\n  \"semi\": true,\n  \"singleQuote\": true,\n  \"tabWidth\": 2\n}\n\n// 配合使用\n// eslint-config-prettier 禁用ESLint格式规则"
      },
      "source": "代码规范"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["Git工作流"],
      "question": "以下哪些是常见的Git工作流？",
      "options": [
        "Git Flow",
        "GitHub Flow",
        "GitLab Flow",
        "Trunk Based Development",
        "SVN Flow",
        "Forking Workflow"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "Git工作流对比：",
        "code": "// 1. Git Flow\n// - master: 生产\n// - develop: 开发\n// - feature/*: 功能\n// - release/*: 发布\n// - hotfix/*: 紧急修复\n\n// 2. GitHub Flow\n// - master: 生产\n// - feature分支 → PR → master\n// 简单快速\n\n// 3. GitLab Flow\n// - master → pre-production → production\n// 环境分支\n\n// 4. Trunk Based\n// - 频繁提交到主干\n// - 短生命周期分支"
      },
      "source": "Git工作流"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["CI/CD"],
      "question": "CI/CD中的CI是指？",
      "options": [
        "Continuous Integration（持续集成）",
        "Continuous Installation",
        "Code Integration",
        "Central Integration"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "CI/CD流程：",
        "code": "// CI: Continuous Integration\n// - 代码提交\n// - 自动测试\n// - 构建验证\n\n// CD: Continuous Delivery/Deployment\n// - 自动部署到测试环境\n// - 自动部署到生产环境\n\n// GitHub Actions示例\nname: CI\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - name: Install\n        run: npm install\n      - name: Test\n        run: npm test\n      - name: Build\n        run: npm run build"
      },
      "source": "CI/CD"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["测试"],
      "question": "单元测试应该测试私有方法",
      "correctAnswer": "B",
      "explanation": {
        "title": "测试最佳实践：",
        "code": "// ❌ 不测试私有方法\n// - 测试公共接口\n// - 关注行为而非实现\n\n// ✅ 单元测试示例\ndescribe('Calculator', () => {\n  test('add two numbers', () => {\n    expect(add(1, 2)).toBe(3);\n  });\n  \n  test('handle negative numbers', () => {\n    expect(add(-1, -2)).toBe(-3);\n  });\n});\n\n// 测试金字塔\n// 单元测试（70%）\n// 集成测试（20%）\n// E2E测试（10%）"
      },
      "source": "测试"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Husky"],
      "question": "配置Git Hooks，空白处填什么？",
      "code": "// package.json\n{\n  \"husky\": {\n    \"hooks\": {\n      ______: \"npm test\",\n      \"commit-msg\": \"commitlint -E HUSKY_GIT_PARAMS\"\n    }\n  }\n}",
      "options": [
        "\"pre-commit\"",
        "\"post-commit\"",
        "\"pre-push\"",
        "\"commit\""
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Git Hooks配置：",
        "code": "// 安装\nnpm install husky -D\nnpx husky install\n\n// 添加hooks\nnpx husky add .husky/pre-commit \"npm test\"\nnpx husky add .husky/commit-msg \"npx commitlint --edit $1\"\n\n// 常用hooks\n// pre-commit: 提交前（lint、test）\n// commit-msg: 提交信息校验\n// pre-push: 推送前\n\n// 配合lint-staged\n{\n  \"husky\": {\n    \"hooks\": {\n      \"pre-commit\": \"lint-staged\"\n    }\n  },\n  \"lint-staged\": {\n    \"*.js\": [\"eslint --fix\", \"git add\"]\n  }\n}"
      },
      "source": "Git Hooks"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["性能监控"],
      "question": "以下哪些是前端性能指标？",
      "options": [
        "FCP（First Contentful Paint）",
        "LCP（Largest Contentful Paint）",
        "TTI（Time to Interactive）",
        "FID（First Input Delay）",
        "TBT（Total Blocking Time）",
        "CLS（Cumulative Layout Shift）"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E", "F"],
      "explanation": {
        "title": "Core Web Vitals：",
        "code": "// 1. LCP - 最大内容绘制\n// < 2.5s 良好\n\n// 2. FID - 首次输入延迟\n// < 100ms 良好\n\n// 3. CLS - 累计布局偏移\n// < 0.1 良好\n\n// 监控\nimport { getCLS, getFID, getLCP } from 'web-vitals';\n\ngetCLS(console.log);\ngetFID(console.log);\ngetLCP(console.log);\n\n// Performance API\nconst observer = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    console.log(entry.name, entry.startTime);\n  }\n});\nobserver.observe({ entryTypes: ['paint', 'navigation'] });"
      },
      "source": "性能监控"
    },
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["错误监控"],
      "question": "window.onerror可以捕获Promise错误吗？",
      "options": [
        "不能，需要unhandledrejection",
        "可以",
        "取决于浏览器",
        "只能捕获部分"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "错误捕获：",
        "code": "// window.onerror - 同步错误\nwindow.onerror = (msg, url, line, col, error) => {\n  console.log('捕获到错误:', msg);\n  return true; // 阻止默认处理\n};\n\n// unhandledrejection - Promise错误\nwindow.addEventListener('unhandledrejection', (e) => {\n  console.log('Promise错误:', e.reason);\n  e.preventDefault();\n});\n\n// try-catch - 局部捕获\ntry {\n  throw new Error('error');\n} catch (e) {\n  console.error(e);\n}\n\n// ErrorBoundary - React\nclass ErrorBoundary extends React.Component {\n  componentDidCatch(error, info) {\n    logError(error, info);\n  }\n}"
      },
      "source": "错误监控"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["微前端"],
      "question": "微前端允许不同技术栈的应用共存",
      "correctAnswer": "A",
      "explanation": {
        "title": "微前端架构：",
        "code": "// qiankun示例\nimport { registerMicroApps, start } from 'qiankun';\n\nregisterMicroApps([\n  {\n    name: 'react-app',\n    entry: '//localhost:3000',\n    container: '#container',\n    activeRule: '/react'\n  },\n  {\n    name: 'vue-app',\n    entry: '//localhost:8080',\n    container: '#container',\n    activeRule: '/vue'\n  }\n]);\n\nstart();\n\n// 优点\n// - 技术栈无关\n// - 独立开发部署\n// - 增量升级"
      },
      "source": "微前端"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["环境变量"],
      "question": "Vite中访问环境变量，空白处填什么？",
      "code": "// .env.production\nVITE_API_URL=https://api.example.com\n\n// 代码中访问\nconst apiUrl = ______;",
      "options": [
        "import.meta.env.VITE_API_URL",
        "process.env.VITE_API_URL",
        "env.VITE_API_URL",
        "import.env.VITE_API_URL"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "环境变量配置：",
        "code": "// Vite\nimport.meta.env.VITE_API_URL\nimport.meta.env.MODE // 'development' | 'production'\n\n// Webpack (CRA)\nprocess.env.REACT_APP_API_URL\n\n// .env文件\n.env                // 所有环境\n.env.local          // 所有环境（忽略git）\n.env.development    // 开发环境\n.env.production     // 生产环境\n\n// vite.config.js\nexport default {\n  define: {\n    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)\n  }\n}"
      },
      "source": "环境变量"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "以下哪些是前端工程化最佳实践？",
      "options": [
        "使用TypeScript",
        "配置ESLint和Prettier",
        "编写单元测试",
        "使用Git Hooks",
        "手动部署到生产",
        "配置CI/CD"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "工程化体系：",
        "code": "// 完整工程化配置\n\n// 1. 类型检查\ntsconfig.json\n\n// 2. 代码规范\n.eslintrc.js\n.prettierrc\n\n// 3. Git Hooks\n.husky/pre-commit\n.husky/commit-msg\n\n// 4. 测试\njest.config.js\n__tests__/\n\n// 5. CI/CD\n.github/workflows/ci.yml\n\n// 6. 文档\nREADME.md\nCHANGELOG.md\n\n// 7. 发布\npackage.json (version, scripts)\n.npmignore"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "构建工具",
      "url": "13-build-tools.html"
    },
    "next": {
      "title": "基础与语法",
      "url": "../basics/01-intro.html"
    }
  }
};
