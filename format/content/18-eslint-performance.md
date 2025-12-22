# 第 18 章：性能优化策略

## 概述

随着项目规模增长，ESLint 的执行时间可能成为开发效率的瓶颈。本章介绍如何诊断性能问题并应用各种优化策略，确保 lint 检查快速高效。

## 一、性能问题诊断

### 1.1 测量执行时间

```bash
# 使用 time 命令
time npx eslint src/

# 使用 TIMING 环境变量查看规则耗时
TIMING=1 npx eslint src/

# Windows PowerShell
$env:TIMING=1; npx eslint src/
```

**TIMING 输出示例：**
```
Rule                         | Time (ms) | Relative
:----------------------------|----------:|--------:
import/no-cycle              |  2345.678 |    45.2%
@typescript-eslint/no-unsafe |   890.123 |    17.1%
indent                       |   456.789 |     8.8%
```

### 1.2 使用 --debug 标志

```bash
# 查看详细执行过程
DEBUG=eslint:* npx eslint src/

# 只看配置加载
DEBUG=eslint:config-array npx eslint src/
```

### 1.3 性能分析

```bash
# 生成性能报告
npx eslint src/ --stats | jq '.fixableErrorCount'

# 检查单个文件的耗时
time npx eslint src/complex-file.ts
```

## 二、缓存优化

### 2.1 启用缓存

```bash
# 启用缓存
npx eslint --cache src/

# 指定缓存文件位置
npx eslint --cache --cache-location .eslintcache src/

# 放在 node_modules 中（不提交到 git）
npx eslint --cache --cache-location node_modules/.cache/eslint/.eslintcache src/
```

### 2.2 缓存策略

```bash
# 基于修改时间（默认，更快）
npx eslint --cache --cache-strategy metadata src/

# 基于文件内容（更准确）
npx eslint --cache --cache-strategy content src/
```

### 2.3 缓存配置

```json
// package.json
{
  "scripts": {
    "lint": "eslint --cache --cache-location node_modules/.cache/eslint src/"
  }
}
```

```gitignore
# .gitignore
.eslintcache
node_modules/.cache/
```

### 2.4 CI 中的缓存

```yaml
# GitHub Actions
- name: Cache ESLint
  uses: actions/cache@v4
  with:
    path: node_modules/.cache/eslint
    key: eslint-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/.eslintrc*') }}
    restore-keys: |
      eslint-${{ hashFiles('**/package-lock.json') }}-
      eslint-
      
- name: Run ESLint
  run: npm run lint
```

## 三、文件范围优化

### 3.1 忽略不需要检查的文件

```javascript
// .eslintrc.js
module.exports = {
  ignorePatterns: [
    "dist/",
    "build/",
    "coverage/",
    "node_modules/",
    "*.min.js",
    "vendor/",
    "**/*.d.ts"
  ]
};
```

```gitignore
# .eslintignore（可选，推荐用 ignorePatterns）
dist/
build/
*.min.js
```

### 3.2 限制检查范围

```bash
# 只检查特定目录
npx eslint src/

# 只检查特定扩展名
npx eslint --ext .ts,.tsx src/

# 排除特定模式
npx eslint src/ --ignore-pattern "**/*.test.ts"
```

### 3.3 增量检查

```bash
# 只检查暂存文件
npx lint-staged

# 只检查变更文件
npx eslint $(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\.(js|ts)$')
```

## 四、规则优化

### 4.1 识别慢规则

通过 `TIMING=1` 找出最耗时的规则：

**常见慢规则：**
| 规则 | 原因 | 优化建议 |
|------|------|----------|
| `import/no-cycle` | 检测循环依赖需遍历所有导入 | 限制检测深度或关闭 |
| `import/no-unused-modules` | 分析所有模块使用情况 | 仅在 CI 中启用 |
| `@typescript-eslint/*-type-*` | 需要完整类型分析 | 考虑必要性 |
| `indent` | 复杂的格式检查 | 交给 Prettier |

### 4.2 优化慢规则配置

```javascript
rules: {
  // 限制循环检测深度
  "import/no-cycle": ["error", { "maxDepth": 3 }],
  
  // 关闭不必要的类型检查规则
  "@typescript-eslint/no-unsafe-assignment": "off",
  "@typescript-eslint/no-unsafe-member-access": "off",
  
  // 格式规则交给 Prettier
  "indent": "off",
  "max-len": "off"
}
```

### 4.3 分层规则策略

```javascript
// 本地开发：快速检查
const devRules = {
  "import/no-cycle": "off",
  "import/no-unused-modules": "off"
};

// CI 环境：完整检查
const ciRules = {
  "import/no-cycle": "error",
  "import/no-unused-modules": "error"
};

module.exports = {
  rules: process.env.CI ? ciRules : devRules
};
```

## 五、TypeScript 优化

### 5.1 减少类型检查范围

类型感知规则是最大的性能瓶颈：

```javascript
// 仅对需要的文件启用类型检查
module.exports = {
  extends: ["plugin:@typescript-eslint/recommended"],
  overrides: [
    {
      // 只对 src 目录启用类型检查
      files: ["src/**/*.ts"],
      extends: ["plugin:@typescript-eslint/recommended-requiring-type-checking"],
      parserOptions: {
        project: "./tsconfig.json"
      }
    }
  ]
};
```

### 5.2 创建专用 tsconfig

```json
// tsconfig.eslint.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

```javascript
parserOptions: {
  project: "./tsconfig.eslint.json"
}
```

### 5.3 使用 projectService（实验性）

```javascript
// ESLint 8+ 新特性
parserOptions: {
  EXPERIMENTAL_useProjectService: true
}
```

## 六、并行处理

### 6.1 使用多线程

ESLint 本身不支持多线程，但可以通过工具实现：

```bash
# 使用 eslint-parallel
npm install eslint-parallel -D
npx eslint-parallel src/

# 使用 jest-runner-eslint
npm install jest-runner-eslint -D
```

### 6.2 手动分片

```bash
# 分多个进程运行
npx eslint src/components/ &
npx eslint src/pages/ &
npx eslint src/utils/ &
wait
```

### 6.3 CI 并行作业

```yaml
# GitHub Actions 矩阵策略
jobs:
  lint:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - name: Lint shard ${{ matrix.shard }}
        run: |
          files=$(find src -name "*.ts" | sort | awk "NR % 4 == ${{ matrix.shard }} - 1")
          npx eslint $files
```

## 七、配置优化

### 7.1 避免复杂的 glob 模式

```javascript
// ❌ 复杂 glob 较慢
overrides: [
  {
    files: ["**/components/**/*.{ts,tsx}", "**/pages/**/*.{ts,tsx}"]
  }
]

// ✅ 简单模式更快
overrides: [
  {
    files: ["src/**/*.tsx"]
  }
]
```

### 7.2 减少配置继承层级

```javascript
// ❌ 过多继承
extends: [
  "eslint:recommended",
  "plugin:import/recommended",
  "plugin:react/recommended",
  "plugin:@typescript-eslint/recommended",
  "airbnb",
  "airbnb-typescript",
  "prettier"
]

// ✅ 精简继承
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "prettier"
]
```

### 7.3 合理使用 overrides

```javascript
// 过多 overrides 会增加配置解析时间
// 尽量合并相似的 overrides
overrides: [
  {
    files: ["**/*.ts", "**/*.tsx"],
    // 合并 TS 相关配置
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    // 测试文件配置
  }
]
```

## 八、工具链优化

### 8.1 使用更快的包管理器

```bash
# pnpm 通常比 npm 快
pnpm install
pnpm exec eslint src/
```

### 8.2 优化 node_modules

```bash
# 清理重复依赖
npx npm-dedupe

# 使用 node_modules 缓存
npm ci --prefer-offline
```

### 8.3 升级 ESLint 版本

新版本通常有性能改进：

```bash
# 查看当前版本
npx eslint --version

# 升级到最新
npm update eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## 九、性能基准

### 9.1 建立基准

```bash
# 记录基准时间
time npx eslint src/ 2>&1 | tee lint-benchmark.txt

# 定期比较
hyperfine 'npx eslint src/'
```

### 9.2 性能目标参考

| 项目规模 | 文件数 | 目标时间 |
|----------|--------|----------|
| 小型 | < 100 | < 5s |
| 中型 | 100-500 | < 15s |
| 大型 | 500-2000 | < 30s |
| 超大型 | > 2000 | < 60s |

### 9.3 持续监控

```yaml
# CI 中记录 lint 时间
- name: Run ESLint with timing
  run: |
    start=$(date +%s)
    npm run lint
    end=$(date +%s)
    echo "Lint time: $((end-start)) seconds"
```

## 十、优化检查清单

### 10.1 快速优化

- [ ] 启用 `--cache`
- [ ] 配置合理的 `ignorePatterns`
- [ ] 关闭格式规则（使用 Prettier）
- [ ] 只检查必要的文件扩展名

### 10.2 中级优化

- [ ] 识别并优化慢规则
- [ ] 创建专用的 `tsconfig.eslint.json`
- [ ] 本地和 CI 使用不同规则集
- [ ] 使用 lint-staged 进行增量检查

### 10.3 高级优化

- [ ] 实现并行检查
- [ ] 精简 extends 继承链
- [ ] 监控 lint 时间趋势
- [ ] 考虑迁移到更快的工具（如 oxlint）

## 十一、替代方案

### 11.1 oxlint

Rust 编写的高性能 linter：

```bash
npx oxlint src/
```

- 速度比 ESLint 快 50-100 倍
- 规则覆盖较少
- 可与 ESLint 配合使用

### 11.2 Rome/Biome

一体化工具链：

```bash
npx biome check src/
```

- 集成 lint、format、bundle
- 非常快
- 生态较新

## 参考资料

- [ESLint Performance](https://eslint.org/docs/developer-guide/working-with-custom-formatters#performance)
- [typescript-eslint Performance](https://typescript-eslint.io/linting/troubleshooting/performance)
- [oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html)
- [Biome](https://biomejs.dev/)
