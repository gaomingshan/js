# 第 33 章：规范自动化

## 概述

自动化是代码规范成功落地的关键。通过自动修复、批处理脚本和智能工具，可以最大程度减少手动工作，让规范检查成为开发流程中无感知的一环。

## 一、自动修复能力

### 1.1 ESLint --fix

```bash
# 自动修复所有可修复问题
npx eslint src/ --fix

# 只修复特定规则
npx eslint src/ --fix --rule 'prefer-const: error' --rule 'no-var: error'

# 修复并查看变更
npx eslint src/ --fix-dry-run
```

**可自动修复的规则：**
| 规则 | 修复行为 |
|------|----------|
| `prefer-const` | let → const |
| `no-var` | var → let/const |
| `quotes` | 引号类型转换 |
| `semi` | 添加/移除分号 |
| `indent` | 调整缩进 |
| `object-shorthand` | 属性简写 |

### 1.2 Prettier 格式化

```bash
# 格式化所有文件
npx prettier --write "src/**/*.{js,ts,jsx,tsx,css,json}"

# 检查但不修改
npx prettier --check src/

# 格式化单个文件
npx prettier --write src/index.js
```

### 1.3 Stylelint 修复

```bash
# 自动修复样式问题
npx stylelint "src/**/*.css" --fix

# SCSS 文件
npx stylelint "src/**/*.scss" --fix
```

## 二、批处理脚本

### 2.1 完整修复脚本

```json
{
  "scripts": {
    "fix": "npm-run-all fix:*",
    "fix:eslint": "eslint src/ --fix",
    "fix:prettier": "prettier --write \"src/**/*.{js,ts,jsx,tsx,json,css,md}\"",
    "fix:stylelint": "stylelint \"src/**/*.{css,scss}\" --fix"
  }
}
```

### 2.2 分类修复脚本

```json
{
  "scripts": {
    "fix:js": "eslint \"src/**/*.{js,jsx}\" --fix && prettier --write \"src/**/*.{js,jsx}\"",
    "fix:ts": "eslint \"src/**/*.{ts,tsx}\" --fix && prettier --write \"src/**/*.{ts,tsx}\"",
    "fix:css": "stylelint \"src/**/*.css\" --fix && prettier --write \"src/**/*.css\"",
    "fix:json": "prettier --write \"src/**/*.json\"",
    "fix:md": "prettier --write \"**/*.md\""
  }
}
```

### 2.3 目录修复脚本

```bash
#!/bin/bash
# scripts/fix-directory.sh

DIR=$1
if [ -z "$DIR" ]; then
  echo "Usage: ./fix-directory.sh <directory>"
  exit 1
fi

echo "Fixing $DIR..."
npx eslint "$DIR" --fix
npx prettier --write "$DIR/**/*.{js,ts,jsx,tsx,json,css}"
npx stylelint "$DIR/**/*.{css,scss}" --fix
echo "Done!"
```

## 三、Git Hooks 自动化

### 3.1 Husky + lint-staged

```bash
npm install husky lint-staged -D
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

### 3.2 commit-msg 检查

```bash
npm install @commitlint/cli @commitlint/config-conventional -D
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

### 3.3 pre-push 检查

```bash
# .husky/pre-push
npm run typecheck
npm run lint
npm run test
```

## 四、CI 自动化

### 4.1 自动修复 PR

```yaml
# .github/workflows/auto-fix.yml
name: Auto Fix

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  fix:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Run fixes
        run: |
          npm run fix:eslint || true
          npm run fix:prettier || true
          npm run fix:stylelint || true
      
      - name: Check for changes
        id: changes
        run: |
          git diff --quiet || echo "changes=true" >> $GITHUB_OUTPUT
      
      - name: Commit fixes
        if: steps.changes.outputs.changes == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "style: auto-fix linting issues"
          git push
```

### 4.2 定时清理

```yaml
# .github/workflows/weekly-cleanup.yml
name: Weekly Cleanup

on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - run: npm ci
      
      - name: Fix all issues
        run: npm run fix
      
      - name: Create PR
        uses: peter-evans/create-pull-request@v6
        with:
          title: "style: weekly code cleanup"
          commit-message: "style: auto-fix all linting issues"
          branch: auto-cleanup
          delete-branch: true
```

## 五、编辑器自动化

### 5.1 VS Code 保存时修复

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "stylelint.validate": ["css", "scss", "vue"]
}
```

### 5.2 WebStorm 配置

```
Settings → Tools → Actions on Save
☑ Reformat code
☑ Run eslint --fix
☑ Run Prettier
```

## 六、自定义自动化脚本

### 6.1 批量添加 eslint-disable

```javascript
// scripts/add-disable-comments.js
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/legacy/**/*.js');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('/* eslint-disable */')) {
    fs.writeFileSync(file, `/* eslint-disable */\n${content}`);
    console.log(`Added disable comment to ${file}`);
  }
});
```

### 6.2 批量移除 console.log

```javascript
// scripts/remove-console.js
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{js,ts,jsx,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // 移除 console.log
  content = content.replace(/console\.log\([^)]*\);?\n?/g, '');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned ${file}`);
  }
});
```

### 6.3 统一导入排序

```bash
npm install eslint-plugin-import -D
```

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }]
  }
};
```

## 七、代码生成与模板

### 7.1 组件模板

```javascript
// scripts/generate-component.js
const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];
const componentDir = `src/components/${componentName}`;

fs.mkdirSync(componentDir, { recursive: true });

// 组件文件
fs.writeFileSync(
  `${componentDir}/${componentName}.tsx`,
  `import React from 'react';
import styles from './${componentName}.module.css';

interface ${componentName}Props {
  // props
}

export const ${componentName}: React.FC<${componentName}Props> = () => {
  return <div className={styles.container}>${componentName}</div>;
};
`
);

// 样式文件
fs.writeFileSync(
  `${componentDir}/${componentName}.module.css`,
  `.container {
  /* styles */
}
`
);

// 导出文件
fs.writeFileSync(
  `${componentDir}/index.ts`,
  `export { ${componentName} } from './${componentName}';
`
);

console.log(`Created ${componentName} component`);
```

### 7.2 plop 模板生成

```bash
npm install plop -D
```

```javascript
// plopfile.js
module.exports = function (plop) {
  plop.setGenerator('component', {
    description: 'Create a React component',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'Component name:'
    }],
    actions: [{
      type: 'add',
      path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
      templateFile: 'plop-templates/component.tsx.hbs'
    }, {
      type: 'add',
      path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.module.css',
      templateFile: 'plop-templates/component.css.hbs'
    }]
  });
};
```

## 八、监控与报告

### 8.1 生成 lint 报告

```json
{
  "scripts": {
    "lint:report": "eslint src/ --format html -o reports/eslint.html",
    "lint:json": "eslint src/ --format json -o reports/eslint.json"
  }
}
```

### 8.2 问题统计脚本

```javascript
// scripts/lint-stats.js
const { execSync } = require('child_process');

const result = execSync('npx eslint src/ --format json', {
  encoding: 'utf8'
});

const data = JSON.parse(result);

const stats = {
  totalFiles: data.length,
  filesWithIssues: data.filter(f => f.errorCount + f.warningCount > 0).length,
  errors: data.reduce((sum, f) => sum + f.errorCount, 0),
  warnings: data.reduce((sum, f) => sum + f.warningCount, 0),
  fixableErrors: data.reduce((sum, f) => sum + f.fixableErrorCount, 0),
  fixableWarnings: data.reduce((sum, f) => sum + f.fixableWarningCount, 0)
};

console.log('Lint Statistics:');
console.log(`  Files: ${stats.totalFiles} (${stats.filesWithIssues} with issues)`);
console.log(`  Errors: ${stats.errors} (${stats.fixableErrors} fixable)`);
console.log(`  Warnings: ${stats.warnings} (${stats.fixableWarnings} fixable)`);
```

### 8.3 趋势追踪

```yaml
# .github/workflows/metrics.yml
- name: Record metrics
  run: |
    ERRORS=$(npx eslint src/ --format json | jq '[.[].errorCount] | add')
    echo "$(date +%Y-%m-%d),$ERRORS" >> metrics/lint-errors.csv
    
- name: Upload metrics
  uses: actions/upload-artifact@v4
  with:
    name: lint-metrics
    path: metrics/
```

## 九、完整自动化配置

### 9.1 package.json

```json
{
  "scripts": {
    "lint": "npm-run-all --parallel lint:*",
    "lint:js": "eslint \"src/**/*.{js,ts,jsx,tsx}\"",
    "lint:css": "stylelint \"src/**/*.{css,scss}\"",
    "lint:format": "prettier --check \"src/**/*.{js,ts,jsx,tsx,css,json,md}\"",
    
    "fix": "npm-run-all fix:*",
    "fix:js": "eslint \"src/**/*.{js,ts,jsx,tsx}\" --fix",
    "fix:css": "stylelint \"src/**/*.{css,scss}\" --fix",
    "fix:format": "prettier --write \"src/**/*.{js,ts,jsx,tsx,css,json,md}\"",
    
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 9.2 工作流图

```
开发流程自动化：

编写代码 → 保存(编辑器自动修复) → 提交(lint-staged) → 推送 → CI检查
                                                              ↓
                                                        自动修复PR
```

## 十、最佳实践

| 实践 | 说明 |
|------|------|
| 保存时修复 | 编辑器配置自动格式化 |
| 提交前检查 | lint-staged 只检查变更文件 |
| 可修复规则优先 | 优先启用可自动修复的规则 |
| 定期批量修复 | 周期性运行全量修复 |
| 监控趋势 | 追踪问题数量变化 |

## 参考资料

- [ESLint CLI](https://eslint.org/docs/user-guide/command-line-interface)
- [Prettier CLI](https://prettier.io/docs/en/cli.html)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
