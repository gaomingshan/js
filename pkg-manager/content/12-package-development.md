# npm 包开发最佳实践

## 概述

开发一个高质量的 npm 包需要考虑目录结构、构建配置、类型支持、Tree Shaking 等多个方面。

## 一、目录结构

### 1.1 推荐结构

```
my-package/
├── src/              # 源代码
│   ├── index.ts
│   └── utils.ts
├── dist/             # 构建输出
│   ├── index.js
│   ├── index.mjs
│   └── index.d.ts
├── tests/            # 测试文件
│   └── index.test.ts
├── package.json
├── tsconfig.json
├── rollup.config.js
├── README.md
├── LICENSE
└── .npmignore
```

### 1.2 最小化发布体积

```json
{
  "files": [
    "dist",
    "README.md"
  ]
}
```

**只发布必要文件：**
- ✅ `dist/` - 构建输出
- ✅ `README.md` - 文档
- ❌ `src/` - 源代码（可选）
- ❌ `tests/` - 测试文件

## 二、TypeScript 支持

### 2.1 基础配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 2.2 生成类型文件

```bash
# 构建并生成 .d.ts
tsc
```

**package.json 配置：**
```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

### 2.3 类型导出

```typescript
// src/index.ts
export interface Config {
  name: string;
  version: string;
}

export function createConfig(options: Config): Config {
  return options;
}
```

## 三、构建配置

### 3.1 同时支持 ESM 和 CJS

**使用 Rollup：**

```javascript
// rollup.config.js
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs'
    },
    {
      file: 'dist/index.mjs',
      format: 'esm'
    }
  ],
  plugins: [
    typescript(),
    terser()
  ]
};
```

**package.json 配置：**
```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3.2 使用 tsup（推荐）

```bash
npm install -D tsup
```

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts"
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
  clean: true
});
```

## 四、Tree Shaking 优化

### 4.1 标记副作用

```json
{
  "sideEffects": false
}
```

**如果有副作用文件：**
```json
{
  "sideEffects": [
    "*.css",
    "./src/polyfills.ts"
  ]
}
```

### 4.2 使用 ES Modules

```typescript
// ✅ 推荐：具名导出
export function add(a: number, b: number) {
  return a + b;
}

export function subtract(a: number, b: number) {
  return a - b;
}

// ❌ 避免：默认导出对象
export default {
  add,
  subtract
};
```

**用户使用：**
```javascript
// 可以 Tree Shaking
import { add } from 'my-package';

// 无法 Tree Shaking
import utils from 'my-package';
```

## 五、文档和示例

### 5.1 README.md 结构

```markdown
# My Package

一行简介

## 安装

\`\`\`bash
npm install my-package
\`\`\`

## 快速开始

\`\`\`javascript
import { helper } from 'my-package';

helper();
\`\`\`

## API 文档

### `helper(options)`

参数说明...

## License

MIT
```

### 5.2 添加 badges

```markdown
![npm version](https://img.shields.io/npm/v/my-package.svg)
![npm downloads](https://img.shields.io/npm/dm/my-package.svg)
![license](https://img.shields.io/npm/l/my-package.svg)
```

## 六、测试

### 6.1 单元测试

```typescript
// tests/index.test.ts
import { add } from '../src';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

### 6.2 测试配置

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^0.31.0"
  }
}
```

## 七、版本和发布

### 7.1 语义化版本

```bash
# Bug 修复
npm version patch

# 新功能
npm version minor

# 破坏性变更
npm version major
```

### 7.2 CHANGELOG

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added
- 新增 `helper` 函数

### Fixed
- 修复边界情况下的 bug

## [1.0.0] - 2024-01-01

### Added
- 初始版本
```

### 7.3 自动化发布

```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build",
    "release": "npm version patch && npm publish && git push --follow-tags"
  }
}
```

## 八、性能优化

### 8.1 减小包体积

```bash
# 查看包体积
npm pack --dry-run

# 使用 bundlephobia
https://bundlephobia.com/package/my-package
```

### 8.2 代码分割

```typescript
// 动态导入
export async function loadHeavyFeature() {
  const { heavy } = await import('./heavy');
  return heavy();
}
```

### 8.3 移除无用代码

```json
{
  "devDependencies": {
    "terser": "^5.0.0"
  }
}
```

## 九、安全性

### 9.1 依赖审计

```bash
# 扫描漏洞
npm audit

# 自动修复
npm audit fix
```

### 9.2 启用 2FA

```bash
npm profile enable-2fa auth-and-writes
```

## 十、完整示例

### 10.1 package.json

```json
{
  "name": "@username/my-package",
  "version": "1.0.0",
  "description": "A useful package",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "test": "vitest",
    "lint": "eslint src",
    "prepublishOnly": "npm run test && npm run build"
  },
  "keywords": ["utility"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "tsup": "^7.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.31.0"
  },
  "sideEffects": false,
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## 参考资料

- [npm 包开发指南](https://docs.npmjs.com/packages-and-modules)
- [tsup 文档](https://tsup.egoist.dev/)
- [Bundlephobia](https://bundlephobia.com/)

---

**导航**  
[上一章：发布npm包](./11-publishing.md) | [返回目录](../README.md) | [下一章：npm生命周期钩子](./13-lifecycle-hooks.md)
