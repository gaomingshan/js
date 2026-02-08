# Monorepo 规范治理策略

## 概述

Monorepo 的规范治理面临多项目、多团队的统一挑战。理解 Monorepo 治理的核心在于掌握配置继承、共享配置包、工具链集成。

**核心认知**：
- Monorepo 需要统一规范，同时允许子包差异化
- 共享配置包是规范复用与版本管理的关键
- 工具链优化是 Monorepo 性能的保障

**后端类比**：
- Monorepo ≈ Maven 多模块项目
- 共享配置 ≈ Parent POM
- 工具链集成 ≈ 微服务治理平台

---

## Monorepo 的规范挑战

### 多项目、多团队的规范统一

**场景**：
```
monorepo/
  ├── packages/
  │   ├── app-a/  # 前端团队 A
  │   ├── app-b/  # 前端团队 B
  │   ├── lib-c/  # 公共库团队
  │   └── api-d/  # 后端团队
```

**挑战**：
1. **规范不统一**
   - app-a 使用 Airbnb 规范
   - app-b 使用 Standard 规范
   - lib-c 使用 Google 规范

2. **跨项目协作困难**
   - 开发者在不同项目间切换，需要适应不同规范
   - Code Review 标准不一致

3. **规范维护成本高**
   - 每个项目独立维护配置
   - 规范更新需要同步到所有项目

**后端类比**：微服务的治理混乱。

---

### 不同项目的规范差异

**合理的差异**：
```
packages/
  ├── web-app/       # React 项目，需要 React 规则
  ├── mobile-app/    # React Native 项目，特殊规则
  ├── node-server/   # Node.js 项目，服务端规则
  └── shared-lib/    # 公共库，严格规则
```

**不合理的差异**：
```
packages/
  ├── team-a/  # 使用单引号
  └── team-b/  # 使用双引号（仅因团队偏好）
```

**原则**：
- 技术栈差异 → 允许
- 团队偏好差异 → 不允许

---

## 工具链配置

### 根配置 + 子包继承

**目录结构**：
```
monorepo/
  ├── .eslintrc.json          # 根配置（全局规则）
  ├── .prettierrc             # 根 Prettier 配置
  ├── packages/
  │   ├── app-a/
  │   │   └── .eslintrc.json  # 继承根配置 + React 规则
  │   ├── app-b/
  │   │   └── .eslintrc.json  # 继承根配置 + Vue 规则
  │   └── lib-c/
  │       └── .eslintrc.json  # 继承根配置 + 严格规则
  └── package.json
```

---

**根配置**（全局规则）：
```json
// .eslintrc.json
{
  "root": true,  // 停止向上查找
  "extends": ["eslint:recommended", "prettier"],
  "env": {
    "es2021": true
  },
  "rules": {
    "no-unused-vars": "error",
    "eqeqeq": "error"
  }
}
```

---

**子包配置**（继承 + 覆盖）：
```json
// packages/app-a/.eslintrc.json
{
  "extends": [
    "../../.eslintrc.json",  // 继承根配置
    "plugin:react/recommended"  // React 规则
  ],
  "env": {
    "browser": true
  },
  "rules": {
    "react/prop-types": "off"  // 使用 TypeScript
  }
}
```

---

**优势**：
- 规则统一：核心规则在根配置
- 允许差异：子包可以覆盖特定规则
- 易于维护：规则更新只需修改根配置

**后端类比**：Maven Parent POM。

---

### 配置继承与覆盖策略

**继承规则**：
```
根配置（80% 规则）
  ↓
子包配置（继承 + 20% 特定规则）
```

**覆盖示例**：
```json
// 根配置
{
  "rules": {
    "no-console": "error"  // 全局禁止
  }
}

// packages/api-d/.eslintrc.json（Node.js 项目）
{
  "extends": "../../.eslintrc.json",
  "rules": {
    "no-console": "off"  // 服务端允许 console
  }
}
```

---

### Lerna、Nx、Turborepo 的规范集成

**Lerna 配置**：
```json
// lerna.json
{
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "run": {
      "npmClient": "npm"
    }
  }
}
```

```bash
# 运行所有子包的 lint
lerna run lint

# 只运行变更子包的 lint
lerna run lint --since HEAD~1
```

---

**Nx 配置**：
```json
// workspace.json
{
  "projects": {
    "app-a": {
      "targets": {
        "lint": {
          "executor": "@nrwl/linter:eslint",
          "options": {
            "lintFilePatterns": ["packages/app-a/**/*.ts"]
          }
        }
      }
    }
  }
}
```

```bash
# 运行所有项目的 lint（自动缓存）
nx run-many --target=lint --all

# 只运行受影响项目的 lint
nx affected --target=lint
```

**优势**：
- 自动缓存（未变更的项目不重复检查）
- 依赖图分析（只检查受影响的项目）
- 并行执行（提升速度）

---

**Turborepo 配置**：
```json
// turbo.json
{
  "pipeline": {
    "lint": {
      "outputs": [],
      "cache": true
    }
  }
}
```

```bash
# 运行所有项目的 lint（自动缓存）
turbo run lint

# 并行执行
turbo run lint --parallel
```

---

## 共享配置包管理

### 创建共享配置包

**目录结构**：
```
@company/eslint-config/
  ├── index.js           # 主配置
  ├── react.js           # React 配置
  ├── vue.js             # Vue 配置
  ├── node.js            # Node.js 配置
  ├── package.json
  └── README.md
```

---

**主配置**（index.js）：
```javascript
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    es2021: true
  },
  rules: {
    'no-unused-vars': 'error',
    'eqeqeq': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

---

**React 配置**（react.js）：
```javascript
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'react/prop-types': 'off'
  }
};
```

---

**package.json**：
```json
{
  "name": "@company/eslint-config",
  "version": "1.0.0",
  "main": "index.js",
  "peerDependencies": {
    "eslint": "^8.0.0"
  },
  "dependencies": {
    "eslint-config-prettier": "^8.0.0"
  }
}
```

---

### 使用共享配置包

**安装**：
```bash
npm install --save-dev @company/eslint-config
```

**使用**：
```json
// packages/app-a/.eslintrc.json
{
  "extends": "@company/eslint-config/react"
}
```

---

### 版本管理与更新策略

**语义化版本**：
```
1.0.0 → 1.0.1  # Patch：Bug 修复
1.0.0 → 1.1.0  # Minor：新增规则（向后兼容）
1.0.0 → 2.0.0  # Major：破坏性变更
```

**更新流程**：
```
1. 修改共享配置
2. 更新版本号
3. 发布到 npm
4. 通知团队
5. 各项目更新依赖
```

**升级策略**：
```bash
# 查看可升级的版本
npm outdated @company/eslint-config

# 升级
npm install @company/eslint-config@latest
```

**后端类比**：Maven 的依赖版本管理。

---

### 配置包的测试与验证

**测试配置**：
```javascript
// test/config.test.js
const config = require('../index.js');

test('should extend eslint:recommended', () => {
  expect(config.extends).toContain('eslint:recommended');
});

test('should have no-unused-vars rule', () => {
  expect(config.rules['no-unused-vars']).toBe('error');
});
```

**验证示例代码**：
```bash
# 创建测试项目
mkdir test-project
cd test-project
npm init -y
npm install --save-dev @company/eslint-config eslint

# 创建测试文件
echo "const a = 1;" > test.js

# 验证配置
npx eslint test.js
```

---

## Monorepo 性能优化

### 问题：检查耗时过长

**场景**：
```
Monorepo 有 20 个子包
每次 lint 检查所有子包
耗时 10 分钟
```

---

### 优化方案 1：只检查变更文件

**Git 变更检测**：
```bash
# 检测变更的子包
CHANGED_PACKAGES=$(lerna changed --all)

# 只检查变更包
for pkg in $CHANGED_PACKAGES; do
  cd packages/$pkg
  npm run lint
done
```

---

### 优化方案 2：使用缓存

**Nx 缓存**：
```bash
# 自动缓存未变更的项目
nx run-many --target=lint --all
```

**效果**：
- 第一次：10 分钟
- 第二次（无变更）：5 秒

---

### 优化方案 3：并行执行

**Turborepo 并行**：
```bash
# 并行运行所有项目的 lint
turbo run lint --parallel
```

**效果**：
- 串行：10 分钟
- 并行（4 核）：3 分钟

---

### 优化方案 4：配置 ignorePatterns

```json
// .eslintrc.json
{
  "ignorePatterns": [
    "node_modules/",
    "dist/",
    "packages/*/dist/",
    "packages/*/build/",
    "*.min.js"
  ]
}
```

---

## 深入一点：Monorepo 的组织级治理

### 规范的分层管理

```
组织级规范（80%）
  ↓
团队级规范（15%）
  ↓
项目级规范（5%）
```

**组织级规范**（@company/eslint-config）：
- 核心质量规则
- 统一代码风格
- 所有项目强制执行

**团队级规范**（@team/eslint-config-react）：
- 框架特定规则（React）
- 团队约定

**项目级规范**（.eslintrc.json）：
- 项目特殊需求
- 最小化定制

---

### 跨团队协作

**场景**：前端团队 + 后端团队 + 移动端团队

**规范策略**：
```
1. 制定组织级规范（核心规则）
2. 各团队扩展自己的规范
3. 定期同步规范更新
```

**组织架构**：
```
@company/eslint-config          # 组织级
  ├── @company/eslint-config-react   # 前端团队
  ├── @company/eslint-config-node    # 后端团队
  └── @company/eslint-config-rn      # 移动端团队
```

**后端类比**：微服务的治理架构。

---

## 工程实践案例

### 案例：某公司的 Monorepo 规范治理

**背景**：
- 50+ 个子项目
- 10 个团队
- 规范混乱

**改进方案**：

**Step 1：创建共享配置包**
```bash
npm create @company/eslint-config
npm publish
```

**Step 2：统一根配置**
```json
// .eslintrc.json
{
  "extends": "@company/eslint-config"
}
```

**Step 3：子包继承**
```json
// packages/app-a/.eslintrc.json
{
  "extends": [
    "../../.eslintrc.json",
    "@company/eslint-config/react"
  ]
}
```

**Step 4：工具链优化**
```bash
# 使用 Nx 缓存
nx run-many --target=lint --all
```

**效果**：
```
规范统一性：60% → 95%
Lint 检查时间：10 分钟 → 2 分钟
配置维护时间：每月 8 小时 → 每月 2 小时
```

---

## 参考资料

- [Lerna](https://lerna.js.org/)
- [Nx](https://nx.dev/)
- [Turborepo](https://turbo.build/)
- [Monorepo Best Practices](https://monorepo.tools/)
