# 第 29 章：包开发与发布实战 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** package.json必填字段

### 题目

发布 npm 包时，package.json 的必填字段是？

**选项：**
- A. name 和 version
- B. name、version 和 main
- C. name、version 和 description
- D. 全部字段

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**package.json 必填字段**

#### 最小配置

```json
{
  "name": "my-package",
  "version": "1.0.0"
}
```

**只需 name 和 version 即可发布**

#### 推荐配置

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "My awesome package",
  "main": "index.js",
  "types": "index.d.ts",
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo"
  },
  "keywords": ["awesome", "package"],
  "files": ["dist"]
}
```

#### 字段说明

**name：** 包名（唯一标识）
**version：** 版本号（Semver）
**main：** 入口文件
**types：** TypeScript 类型
**files：** 发布包含的文件

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** files字段

### 题目

package.json 的 files 字段指定发布时包含的文件。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**files 字段控制发布内容**

#### 配置

```json
{
  "files": [
    "dist",
    "lib",
    "README.md"
  ]
}
```

**只发布指定的文件/目录**

#### 默认包含

即使不在 files 中，也会自动包含：
- package.json
- README
- LICENSE
- CHANGELOG

#### 默认排除

自动排除：
- node_modules
- .git
- .DS_Store
- *.log

#### .npmignore

**优先级：files > .npmignore**

```
# .npmignore
*.test.js
src/
.env
```

#### 验证

```bash
# 查看将要发布的文件
npm pack --dry-run

# 或打包查看
npm pack
tar -tzf my-package-1.0.0.tgz
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** exports字段

### 题目

package.json 的 exports 字段用于什么？

**选项：**
- A. 导出配置
- B. 定义包的导出入口
- C. 发布设置
- D. 环境变量

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**exports 字段（现代包入口）**

#### 基本用法

```json
{
  "exports": {
    ".": "./dist/index.js"
  }
}
```

**定义包的导出路径**

#### 多入口

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
    "./types": "./dist/types.js"
  }
}
```

**使用：**
```javascript
import pkg from 'my-package';
import utils from 'my-package/utils';
import types from 'my-package/types';
```

#### 条件导出

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
```

**根据环境选择不同文件**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 包开发工具

### 题目

常用的包开发工具有哪些？

**选项：**
- A. tsup
- B. microbundle
- C. unbuild
- D. rollup

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**包构建工具对比**

#### A. tsup ✅

```bash
npm install -D tsup
```

**配置：**
```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts"
  }
}
```

**特点：**
- 零配置
- 基于 esbuild
- 极快
- 支持 TypeScript

#### B. microbundle ✅

```bash
npm install -D microbundle
```

**配置：**
```json
{
  "scripts": {
    "build": "microbundle"
  },
  "source": "src/index.ts",
  "main": "dist/index.js",
  "module": "dist/index.mjs"
}
```

**特点：**
- 零配置
- 基于 Rollup
- 自动优化

#### C. unbuild ✅

```bash
npm install -D unbuild
```

**build.config.ts：**
```typescript
export default {
  entries: ['src/index'],
  declaration: true,
  rollup: {
    emitCJS: true
  }
};
```

**特点：**
- UnJS 生态
- 现代化
- 灵活配置

#### D. rollup ✅

```bash
npm install -D rollup @rollup/plugin-typescript
```

**rollup.config.js：**
```javascript
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs', format: 'cjs' },
    { file: 'dist/index.mjs', format: 'esm' }
  ],
  plugins: [typescript()]
};
```

**特点：**
- 灵活
- 生态丰富
- Tree-shaking

#### 选择建议

| 工具 | 适用场景 |
|------|----------|
| **tsup** | 快速开发，TS项目 |
| **microbundle** | 小型库，零配置 |
| **unbuild** | 现代项目，UnJS生态 |
| **rollup** | 复杂配置，自定义需求 |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 双包支持

### 题目

如何同时支持 CommonJS 和 ES Modules？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Dual Package（双包支持）**

#### 方案 1：使用 exports

**package.json：**
```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

**构建：**
```bash
tsup src/index.ts --format cjs,esm
```

**结果：**
```
dist/
├── index.mjs  # ES Module
└── index.cjs  # CommonJS
```

#### 方案 2：传统方式

**package.json：**
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

#### 构建配置

**tsup.config.ts：**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true
});
```

#### 使用

**CommonJS：**
```javascript
const pkg = require('my-package');
```

**ES Module：**
```javascript
import pkg from 'my-package';
```

**自动选择正确的版本**

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** prepublishOnly钩子

### 题目

prepublishOnly 钩子在什么时候执行？

**选项：**
- A. 安装前
- B. 构建前
- C. 发布前
- D. 发布后

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**npm 发布生命周期钩子**

#### prepublishOnly

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test"
  }
}
```

**只在 npm publish 前执行**

#### 完整生命周期

```json
{
  "scripts": {
    "prepublishOnly": "npm run build",
    "prepare": "npm run build",
    "prepack": "echo prepack",
    "postpack": "echo postpack"
  }
}
```

**执行顺序：**
```
npm publish
├─ prepublishOnly  # 仅 publish
├─ prepare         # publish + install
├─ prepack         # 打包前
├─ pack
├─ postpack        # 打包后
└─ publish
```

#### 区别

**prepublishOnly：**
- 只在 npm publish 时
- 用于构建、测试

**prepare：**
- npm publish 时
- npm install 时（从 git 安装）
- 用于构建

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 作用域包

### 题目

如何发布作用域包（Scoped Package）？

**选项：**
- A. npm publish
- B. npm publish --access public
- C. npm publish --scope
- D. 不能发布

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**作用域包（Scoped Package）**

#### 命名

```json
{
  "name": "@myorg/package"
}
```

**格式：@scope/package**

#### 发布

**公开包：**
```bash
npm publish --access public
```

**私有包（需付费）：**
```bash
npm publish --access restricted
```

#### 默认行为

```bash
# 作用域包默认为私有
npm publish
# Error: 需要付费账户

# 必须指定 public
npm publish --access public
```

#### package.json 配置

```json
{
  "name": "@myorg/package",
  "publishConfig": {
    "access": "public"
  }
}
```

**自动使用 public**

#### 使用

```bash
npm install @myorg/package
```

```javascript
import pkg from '@myorg/package';
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 完整包开发

### 题目

开发一个完整的 npm 包需要哪些步骤？

<details>
<summary>查看答案</summary>

### ✅ 答案

**npm 包开发完整流程**

#### 1. 初始化项目

```bash
mkdir my-package
cd my-package
npm init -y
```

#### 2. 配置 TypeScript

```bash
npm install -D typescript
npx tsc --init
```

**tsconfig.json：**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 3. 配置构建

```bash
npm install -D tsup
```

**package.json：**
```json
{
  "name": "@myorg/awesome-package",
  "version": "1.0.0",
  "description": "An awesome package",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "lint": "eslint src",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["awesome"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/myorg/awesome-package"
  }
}
```

**tsup.config.ts：**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true
});
```

#### 4. 开发代码

**src/index.ts：**
```typescript
/**
 * Adds two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The sum
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtracts two numbers
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

export default { add, subtract };
```

#### 5. 添加测试

```bash
npm install -D vitest
```

**src/index.test.ts：**
```typescript
import { describe, it, expect } from 'vitest';
import { add, subtract } from './index';

describe('Math functions', () => {
  it('should add numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should subtract numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});
```

#### 6. 代码质量

```bash
npm install -D eslint prettier
```

**eslintrc.js：**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {}
};
```

#### 7. 文档

**README.md：**
```markdown
# @myorg/awesome-package

An awesome package for doing awesome things.

## Installation

```bash
npm install @myorg/awesome-package
```

## Usage

```typescript
import { add } from '@myorg/awesome-package';

console.log(add(1, 2)); // 3
```

## API

### add(a, b)

Adds two numbers.

- `a` (number): First number
- `b` (number): Second number
- Returns: `number`

## License

MIT
```

#### 8. 发布准备

```bash
# 构建
npm run build

# 测试
npm test

# 检查发布内容
npm pack --dry-run
```

#### 9. 发布

```bash
# 登录
npm login

# 发布
npm publish --access public
```

#### 10. 持续集成

**.github/workflows/ci.yml：**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run lint
```

### 📖 解析

**开发清单**

- ✅ TypeScript 配置
- ✅ 构建工具（tsup）
- ✅ 测试（vitest）
- ✅ 代码规范（ESLint）
- ✅ 文档（README）
- ✅ 类型声明（.d.ts）
- ✅ 双包支持（CJS+ESM）
- ✅ CI/CD

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 包测试

### 题目

如何在本地测试 npm 包？

<details>
<summary>查看答案</summary>

### ✅ 答案

**本地测试 npm 包的方法**

#### 方法 1：npm link（推荐）

**在包目录：**
```bash
cd my-package
npm link
```

**在测试项目：**
```bash
cd test-app
npm link my-package
```

**使用：**
```javascript
import { add } from 'my-package';
console.log(add(1, 2));
```

**修改实时生效（需要构建）**

#### 方法 2：npm pack

**打包：**
```bash
cd my-package
npm pack
# 生成 my-package-1.0.0.tgz
```

**安装：**
```bash
cd test-app
npm install ../my-package/my-package-1.0.0.tgz
```

**更真实的测试环境**

#### 方法 3：本地 registry

**启动 Verdaccio：**
```bash
npx verdaccio
```

**发布到本地：**
```bash
npm publish --registry http://localhost:4873
```

**安装：**
```bash
npm install my-package --registry http://localhost:4873
```

#### 方法 4：文件路径

**package.json：**
```json
{
  "dependencies": {
    "my-package": "file:../my-package"
  }
}
```

```bash
npm install
```

#### 完整测试工作流

```bash
# 1. 构建包
cd my-package
npm run build

# 2. 创建测试项目
cd ..
mkdir test-app
cd test-app
npm init -y

# 3. Link 包
npm link ../my-package

# 4. 编写测试代码
cat > index.js << EOF
const { add } = require('my-package');
console.log(add(1, 2));
EOF

# 5. 运行测试
node index.js

# 6. 修改包并重新构建
cd ../my-package
# 修改代码
npm run build

# 7. 测试项目自动使用新版本
cd ../test-app
node index.js
```

#### 清理

```bash
# 解除 link
cd test-app
npm unlink my-package

cd ../my-package
npm unlink
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 包模板

### 题目

创建一个 npm 包开发模板。

<details>
<summary>查看答案</summary>

### ✅ 答案

**npm 包开发脚手架**

```javascript
#!/usr/bin/env node
// create-package.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function createPackage() {
  console.log('📦 创建 npm 包项目\n');

  // 收集信息
  const name = await ask('包名 (my-package): ') || 'my-package';
  const description = await ask('描述: ') || '';
  const author = await ask('作者: ') || '';
  const license = await ask('许可证 (MIT): ') || 'MIT';

  const scope = name.startsWith('@') ? name.split('/')[0] : '';
  const pkgName = scope ? name.split('/')[1] : name;

  console.log('\n🔨 创建项目...\n');

  // 创建目录
  const dir = pkgName;
  fs.mkdirSync(dir, { recursive: true });
  process.chdir(dir);

  // 创建目录结构
  ['src', 'test', '.github/workflows'].forEach(d => {
    fs.mkdirSync(d, { recursive: true });
  });

  // package.json
  const packageJson = {
    name,
    version: '0.0.0',
    description,
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.mjs',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.mjs',
        require: './dist/index.cjs'
      }
    },
    files: ['dist'],
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
      test: 'vitest',
      lint: 'eslint src',
      format: 'prettier --write "src/**/*.ts"',
      prepublishOnly: 'npm run build && npm test',
      release: 'npm version patch && npm publish'
    },
    keywords: [],
    author,
    license,
    devDependencies: {
      '@types/node': '^20.0.0',
      tsup: '^7.0.0',
      typescript: '^5.0.0',
      vitest: '^0.34.0',
      eslint: '^8.0.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      prettier: '^3.0.0'
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      lib: ['ES2020'],
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: 'node'
    },
    include: ['src'],
    exclude: ['node_modules', 'dist', '**/*.test.ts']
  };

  fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

  // tsup.config.ts
  const tsupConfig = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true
});
`;

  fs.writeFileSync('tsup.config.ts', tsupConfig);

  // eslintrc.js
  const eslintConfig = `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {}
};
`;

  fs.writeFileSync('.eslintrc.js', eslintConfig);

  // prettier.config.js
  const prettierConfig = `module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2
};
`;

  fs.writeFileSync('prettier.config.js', prettierConfig);

  // src/index.ts
  const indexTs = `/**
 * ${description || 'Main entry point'}
 */

export function hello(name: string): string {
  return \`Hello, \${name}!\`;
}

export default { hello };
`;

  fs.writeFileSync('src/index.ts', indexTs);

  // test/index.test.ts
  const testTs = `import { describe, it, expect } from 'vitest';
import { hello } from '../src/index';

describe('${pkgName}', () => {
  it('should greet', () => {
    expect(hello('World')).toBe('Hello, World!');
  });
});
`;

  fs.writeFileSync('test/index.test.ts', testTs);

  // README.md
  const readme = `# ${name}

${description}

## Installation

\`\`\`bash
npm install ${name}
\`\`\`

## Usage

\`\`\`typescript
import { hello } from '${name}';

console.log(hello('World')); // Hello, World!
\`\`\`

## API

### hello(name)

Greets someone.

- \`name\` (string): Name to greet
- Returns: \`string\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
\`\`\`

## License

${license}
`;

  fs.writeFileSync('README.md', readme);

  // LICENSE
  if (license === 'MIT') {
    const mitLicense = `MIT License

Copyright (c) ${new Date().getFullYear()} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

    fs.writeFileSync('LICENSE', mitLicense);
  }

  // .gitignore
  const gitignore = `node_modules
dist
*.log
.DS_Store
*.tgz
`;

  fs.writeFileSync('.gitignore', gitignore);

  // .npmignore
  const npmignore = `src
test
*.test.ts
tsconfig.json
tsup.config.ts
.eslintrc.js
prettier.config.js
.github
`;

  fs.writeFileSync('.npmignore', npmignore);

  // GitHub Actions
  const ciYml = `name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run lint
`;

  fs.writeFileSync('.github/workflows/ci.yml', ciYml);

  // 安装依赖
  console.log('📥 安装依赖...\n');
  execSync('npm install', { stdio: 'inherit' });

  // 初始化 git
  console.log('\n📝 初始化 Git...\n');
  execSync('git init', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat: initial commit"', { stdio: 'inherit' });

  console.log('\n✨ 项目创建成功！\n');
  console.log('下一步：');
  console.log(`  cd ${pkgName}`);
  console.log('  npm run dev    # 开发模式');
  console.log('  npm test       # 运行测试');
  console.log('  npm run build  # 构建');
  console.log('  npm publish    # 发布\n');

  rl.close();
}

createPackage().catch(console.error);
```

**使用：**
```bash
node create-package.js
```

**或全局安装：**
```bash
npm install -g create-my-package
create-my-package
```

### 📖 解析

**模板包含**

- ✅ TypeScript 配置
- ✅ 构建工具（tsup）
- ✅ 测试框架（vitest）
- ✅ 代码规范（ESLint + Prettier）
- ✅ Git 配置
- ✅ GitHub Actions
- ✅ 双包支持
- ✅ 完整文档

</details>

---

**导航**  
[上一章：第 28 章面试题](./chapter-28.md) | [返回目录](../README.md) | [下一章：第 30 章面试题](./chapter-30.md)
