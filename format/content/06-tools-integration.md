# 第 6 章：工具协作模式

## 概述

前端代码规范工具各自解决不同的问题，将它们有效地整合到开发流程中是实现规范落地的关键。本章探讨如何将 ESLint、Prettier、Stylelint 等工具与编辑器、构建系统和 Git 工作流进行协同集成，构建无缝且高效的代码规范体系。

## 一、工具协作的基本模型

### 1.1 工具组合策略

规范工具可以按照不同的协作模式组合使用：

**串行模式：**
```
源代码 → Prettier 格式化 → ESLint 检查 → Stylelint 检查 → 最终代码
```

**分域模式：**
```
JavaScript/TypeScript 文件 → ESLint + Prettier
CSS/SCSS 文件 → Stylelint + Prettier
HTML 文件 → Prettier
```

**层次模式：**
```
┌───────────────────────────────────────────────┐
│ 编辑器集成层（IDE 插件、实时反馈）            │
├───────────────────────────────────────────────┤
│ 本地工作流层（Git Hooks、命令行工具）         │
├───────────────────────────────────────────────┤
│ 持续集成层（CI/CD 检查、自动修复）            │
└───────────────────────────────────────────────┘
```

> **💡 提示**  
> 最有效的工具协作策略结合了所有三种模式，在适当的层次应用适当的工具组合。

### 1.2 工具间配置协同

确保各工具配置保持一致是关键：

**文件类型分配：**
```javascript
// 确保各工具处理正确的文件类型
// .eslintrc.js
module.exports = {
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      // JS/TS 特定规则...
    }
  ]
};

// .stylelintrc.js
module.exports = {
  overrides: [
    {
      files: ['*.css', '*.scss', '*.less'],
      // CSS 特定规则...
    }
  ]
};
```

**共享配置值：**
```javascript
// 共享配置变量
const INDENT_SIZE = 2;
const MAX_LINE_LENGTH = 100;

// .eslintrc.js
module.exports = {
  rules: {
    'indent': ['error', INDENT_SIZE],
    'max-len': ['error', MAX_LINE_LENGTH]
  }
};

// .prettierrc.js
module.exports = {
  tabWidth: INDENT_SIZE,
  printWidth: MAX_LINE_LENGTH
};
```

**避免冲突的策略：**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier' // 确保放在最后，禁用与 Prettier 冲突的规则
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

## 二、编辑器集成模式

### 2.1 主流编辑器配置

不同编辑器需要特定的集成配置：

**VS Code 配置：**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "stylelint.validate": [
    "css",
    "scss",
    "less"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

**WebStorm 配置：**
```
# WebStorm 使用项目根目录的配置文件
# 配置步骤:
# 1. 安装 ESLint, Prettier, Stylelint 插件
# 2. Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
#    选择 Automatic ESLint Configuration
# 3. Settings > Languages & Frameworks > JavaScript > Prettier
#    选择 Automatic Prettier Configuration
# 4. Settings > Editor > Code Style
#    选择 "EditorConfig" 为首选编码风格
```

**共享编辑器配置：**

```
project/
├── .vscode/
│   ├── settings.json      # VS Code 设置
│   ├── extensions.json    # 推荐扩展
│   └── launch.json        # 调试配置
├── .idea/                 # WebStorm 配置
│   └── codeStyles/
├── .editorconfig         # 跨编辑器基础设置
└── README.md
```

### 2.2 事件与钩子模型

了解工具在编辑器中的触发机制：

**常见触发事件：**

| 事件 | Prettier | ESLint | Stylelint |
|------|----------|--------|-----------|
| 保存文件 | 格式化 | 检查+修复 | 检查+修复 |
| 粘贴代码 | 可配置格式化 | 通常不触发 | 通常不触发 |
| 手动触发 | 格式化选中/全文 | 检查+修复 | 检查+修复 |
| 实时编辑 | 不适用 | 实时标记问题 | 实时标记问题 |

**协作顺序控制：**
```json
// VS Code 中控制执行顺序
{
  "editor.formatOnSave": true,  // 1. 首先应用 Prettier
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,  // 2. 然后应用 ESLint
    "source.fixAll.stylelint": true  // 3. 最后应用 Stylelint
  }
}
```

> **⚠️ 注意**  
> 工具的执行顺序很重要。一般推荐先使用 Prettier 格式化，再使用 ESLint/Stylelint 进行修复，因为某些 lint 修复可能会影响代码格式。

### 2.3 多语言项目配置

在多语言项目中配置工具协作：

**按文件类型配置：**
```json
// VS Code
{
  "[javascript][typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features",
    "editor.formatOnSave": true
  },
  "[css][scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

**工具职责划分：**

```javascript
// package.json
{
  "scripts": {
    "format": "npm-run-all format:*",
    "format:js": "prettier --write \"**/*.{js,jsx,ts,tsx}\"",
    "format:css": "prettier --write \"**/*.{css,scss}\"",
    "format:html": "prettier --write \"**/*.html\"",
    "format:json": "prettier --write \"**/*.json\"",
    
    "lint": "npm-run-all lint:*",
    "lint:js": "eslint --fix \"**/*.{js,jsx,ts,tsx}\"",
    "lint:css": "stylelint --fix \"**/*.{css,scss}\""
  }
}
```

## 三、本地工作流集成

### 3.1 命令行工具链

构建高效的命令行工具链：

**基本脚本设置：**
```json
// package.json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,scss,html,json,md}\"",
    "lint:js": "eslint --fix \"src/**/*.{js,jsx,ts,tsx}\"",
    "lint:css": "stylelint --fix \"src/**/*.{css,scss}\"",
    "lint": "npm-run-all --sequential format lint:*",
    "check": "npm-run-all --parallel check:*",
    "check:format": "prettier --check \"src/**/*.{js,jsx,ts,tsx,css,scss,html,json,md}\"",
    "check:js": "eslint \"src/**/*.{js,jsx,ts,tsx}\"",
    "check:css": "stylelint \"src/**/*.{css,scss}\"",
    "check:ts": "tsc --noEmit"
  }
}
```

**脚本执行顺序：**
1. `format`: 使用 Prettier 统一格式化所有文件
2. `lint:*`: 使用 ESLint 和 Stylelint 检查并修复问题
3. `check:*`: 并行验证所有规范要求

**npm-run-all 工具：**
```bash
# 安装
npm install --save-dev npm-run-all

# 使用示例
npm-run-all --sequential format lint:*  # 按顺序运行
npm-run-all --parallel check:*         # 并行运行
```

### 3.2 Git Hooks 配置

使用 Git 钩子自动执行规范检查：

**使用 husky 和 lint-staged：**
```bash
# 安装
npm install --save-dev husky lint-staged
```

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,html}": [
      "prettier --write"
    ]
  }
}
```

**使用 husky v6+ 配置：**
```bash
# 安装
npm install husky --save-dev
npx husky install
npm set-script prepare "husky install"

# 添加 pre-commit 钩子
npx husky add .husky/pre-commit "npx lint-staged"
```

**lint-staged 独立配置：**
```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    // 可选：运行受影响文件的测试
    files => files.map(file => `jest --findRelatedTests ${file}`)
  ],
  '*.{css,scss}': ['stylelint --fix', 'prettier --write'],
  '*.{json,md,html}': ['prettier --write']
};
```

### 3.3 性能优化策略

优化工具执行性能，提高开发效率：

**增量检查：**
```javascript
// lint-staged.config.js - 仅检查更改的文件
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --cache',
    'prettier --write'
  ],
  '*.{css,scss}': [
    'stylelint --fix --cache',
    'prettier --write'
  ]
};
```

**并行处理：**
```javascript
// 使用 --parallel 标志
// .eslintrc.js
module.exports = {
  // 添加优化配置
  parserOptions: {
    ecmaVersion: 2020
  },
  // 禁用一些性能密集型规则
  rules: {
    'import/no-cycle': 'off' // 此规则较慢
  }
};
```

**缓存配置：**
```javascript
// .eslintrc.js - 启用缓存
module.exports = {
  cache: true,
  cacheLocation: 'node_modules/.cache/eslint'
};
```

## 四、构建系统集成

### 4.1 Webpack 集成

将代码规范工具集成到 Webpack 构建流程：

**使用 ESLint Loader：**
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'eslint-loader',
            options: {
              fix: true,
              cache: true
            }
          }
        ]
      },
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('stylelint')
                ]
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  }
};
```

**使用 ESLint Plugin：**
```javascript
// webpack.config.js
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      fix: true,
      cache: true
    }),
    new StylelintPlugin({
      files: ['**/*.{css,scss}'],
      fix: true
    })
  ]
};
```

### 4.2 Vite 集成

在 Vite 项目中集成规范工具：

**ESLint 插件：**
```bash
npm install --save-dev vite-plugin-eslint
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    eslint({
      cache: true,
      fix: true,
      include: ['src/**/*.{js,jsx,ts,tsx}']
    })
  ]
});
```

**Stylelint 插件：**
```bash
npm install --save-dev vite-plugin-stylelint
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';

export default defineConfig({
  plugins: [
    eslint(),
    stylelint({
      cache: true,
      fix: true,
      include: ['src/**/*.{css,scss}']
    })
  ]
});
```

### 4.3 其他构建工具

针对其他构建工具的集成方法：

**Rollup 集成：**
```javascript
// rollup.config.js
import eslint from '@rollup/plugin-eslint';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    eslint({
      fix: true,
      throwOnError: true
    })
    // 其他插件...
  ]
};
```

**Gulp 集成：**
```javascript
// gulpfile.js
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const stylelint = require('gulp-stylelint');

gulp.task('lint:js', () => {
  return gulp.src(['src/**/*.js'])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('src/')); // 写回修复后的文件
});

gulp.task('lint:css', () => {
  return gulp.src('src/**/*.css')
    .pipe(stylelint({
      fix: true,
      reporters: [{ formatter: 'string', console: true }]
    }))
    .pipe(gulp.dest('src/')); // 写回修复后的文件
});

gulp.task('lint', gulp.parallel('lint:js', 'lint:css'));
```

## 五、CI/CD 集成模式

### 5.1 GitHub Actions 集成

在 GitHub Actions 中集成规范检查：

**基础工作流配置：**
```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check formatting
        run: npx prettier --check "src/**/*.{js,jsx,ts,tsx,css,scss,html,json,md}"
      
      - name: Lint JavaScript
        run: npx eslint "src/**/*.{js,jsx,ts,tsx}"
      
      - name: Lint CSS
        run: npx stylelint "src/**/*.{css,scss}"
```

**使用 GitHub Actions 专用动作：**
```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: ESLint
        uses: wearerequired/lint-action@v2
        with:
          eslint: true
          eslint_extensions: "js,jsx,ts,tsx"
          auto_fix: true
      
      - name: Stylelint
        uses: wearerequired/lint-action@v2
        with:
          stylelint: true
          stylelint_extensions: "css,scss"
          auto_fix: true
```

### 5.2 GitLab CI 集成

在 GitLab CI/CD 中集成规范检查：

**基础配置：**
```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  image: node:16-alpine
  script:
    - npm ci
    - npm run check:format
    - npm run lint
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - .eslintcache
      - .stylelintcache
  artifacts:
    reports:
      junit: reports/lint-*.xml
    when: always
```

**使用缓存优化性能：**
```yaml
# .gitlab-ci.yml 中优化缓存
lint:
  # ...其他配置
  cache:
    key:
      files:
        - package-lock.json  # 基于 package-lock 生成缓存键
    paths:
      - node_modules/
      - .eslintcache
      - .stylelintcache
  before_script:
    # 创建报告目录
    - mkdir -p reports
  script:
    - npm ci
    # 输出 JUnit 格式报告用于 GitLab UI 展示
    - npx eslint --cache --format junit --output-file reports/lint-js.xml "src/**/*.{js,jsx,ts,tsx}"
    - npx stylelint --cache --custom-formatter=node_modules/stylelint-junit-formatter "src/**/*.{css,scss}" > reports/lint-css.xml
```

### 5.3 检查结果处理

有效处理 CI 中的规范检查结果：

**阻断流程还是继续：**
```yaml
# GitHub Actions - 将 lint 作为必须通过的检查
lint:
  # ...配置
  steps:
    # ...其他步骤
    - name: Lint
      run: npm run lint
      # 默认情况下，出错会阻断流程
```

**生成可视化报告：**
```yaml
# .github/workflows/code-quality.yml
lint:
  # ...其他配置
  steps:
    # ...其他步骤
    - name: ESLint Report
      run: npx eslint --output-file eslint-report.json --format json "src/**/*.{js,jsx,ts,tsx}"
    
    - name: Annotate ESLint Results
      uses: ataylorme/eslint-annotate-action@v2
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        report-json: "eslint-report.json"
```

**增量检查策略：**
```yaml
# GitHub Actions 中的增量检查
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v18
  
- name: Lint changed JS files
  run: |
    CHANGED_JS_FILES=$(echo '${{ steps.changed-files.outputs.all_changed_files }}' | grep -E '\.jsx?$|\.tsx?$' || echo '')
    if [ ! -z "$CHANGED_JS_FILES" ]; then
      npx eslint $CHANGED_JS_FILES
    fi
```

## 六、团队协作与规范同步

### 6.1 多团队共享配置

实现多项目和多团队间的规范共享：

**npm 包形式共享：**
```bash
# 创建共享配置包
mkdir company-eslint-config
cd company-eslint-config
npm init -y
# 添加依赖
npm i eslint eslint-config-airbnb --save-dev

# 发布
npm publish --access private
```

```javascript
// company-eslint-config/index.js
module.exports = {
  extends: ['airbnb'],
  rules: {
    // 公司特定规则...
  }
};
```

**使用共享配置：**
```javascript
// 项目中的 .eslintrc.js
module.exports = {
  extends: [
    '@company/eslint-config',
    // 项目特定扩展...
  ],
  rules: {
    // 项目特定覆盖...
  }
};
```

**Monorepo 中的共享：**
```
monorepo/
├── packages/
│   ├── pkg1/
│   │   └── package.json
│   └── pkg2/
│       └── package.json
├── configs/
│   ├── eslint/
│   │   └── index.js
│   └── prettier/
│       └── index.js
└── package.json
```

```javascript
// monorepo/packages/pkg1/.eslintrc.js
module.exports = {
  extends: ['../../configs/eslint'],
  // 包特定覆盖...
};
```

### 6.2 规范版本控制

管理规范配置的版本和演进：

**语义化版本：**
```json
// @company/eslint-config/package.json
{
  "name": "@company/eslint-config",
  "version": "1.2.0",
  "description": "公司 ESLint 规范",
  // ...其他字段
}
```

版本号含义：
- `1.x.x` - 主版本，有破坏性变更
- `x.2.x` - 次版本，新增规则但不破坏现有代码
- `x.x.0` - 修订版本，bug 修复和微调

**规则变更记录：**
```markdown
# 变更日志

## 1.2.0 (2023-05-15)

### 新增
- 添加 React Hooks 规则检查
- 新增对 TypeScript 5.0 的支持

### 变更
- 调整 `max-len` 规则从 80 改为 100

## 1.1.0 (2023-02-10)

### 新增
- 添加对 Jest 测试文件的特殊规则
```

### 6.3 渐进式规范升级

平稳过渡到新规范的策略：

**阶段性规则升级：**
```javascript
// .eslintrc.js - 阶段 1：新规则为警告
module.exports = {
  rules: {
    'complexity': ['warn', 15], // 复杂度规则先设为警告
    'max-depth': ['warn', 4],   // 嵌套深度规则先设为警告
  }
};

// 阶段 2：转为错误级别
module.exports = {
  rules: {
    'complexity': ['error', 15],
    'max-depth': ['error', 4],
  }
};
```

**使用 overrides 定向应用规则：**
```javascript
// .eslintrc.js - 仅对新文件应用更严格的规则
module.exports = {
  // 基础规则
  rules: {
    // 宽松规则集...
  },
  overrides: [
    {
      files: ['src/new-feature/**/*.js'],
      rules: {
        // 新文件应用更严格规则...
        'complexity': ['error', 10],
        'max-depth': ['error', 3],
      }
    }
  ]
};
```

**规则迁移计划：**
```
1. 引入新规范（警告模式）
2. 修复关键文件和新代码
3. 为旧代码添加 eslint-disable 注释
4. 制定迁移计划，逐步修复旧代码
5. 最终升级规则为错误级别
```

## 学习建议

> **📚 进阶路径**
> 
> 1. **先小后大**：从小型项目开始实践工具协作
> 2. **自动化优先**：优先构建自动化的规范流程
> 3. **测量效果**：收集规范执行数据，评估工具协作效果
> 4. **持续演进**：随着项目发展调整工具协作策略
> 5. **学习原理**：理解各工具的工作原理，解决集成问题

> **⚠️ 常见误区**
> 
> - **过度集成**：集成过多工具可能导致构建流程复杂
> - **配置冲突**：忽视工具间的配置冲突会导致不一致行为
> - **忽视性能**：未优化的规范检查可能严重影响开发效率
> - **一步到位**：试图一次性完美配置所有工具而不是渐进式改进
> - **缺乏文档**：未明确记录工具协作配置和使用方法

## 参考资料

- [ESLint Integrations](https://eslint.org/docs/user-guide/integrations) - ESLint 官方集成指南
- [Prettier Editor Integration](https://prettier.io/docs/en/editors.html) - Prettier 编辑器集成指南
- [Stylelint Integration](https://stylelint.io/user-guide/integrations/editor) - Stylelint 集成文档
- [lint-staged 文档](https://github.com/okonet/lint-staged) - Git 暂存文件检查工具
- [husky 文档](https://typicode.github.io/husky/) - 现代化的 Git 钩子工具

---

**下一章** → [第 7 章：常见争议点](./07-common-debates.md)
