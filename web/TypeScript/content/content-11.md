# 11. TypeScript 配置与工程化

## 概述

tsconfig.json 是 TypeScript 项目的配置核心。理解配置选项，能充分发挥 TypeScript 的能力，避免常见陷阱。

---

## 11.1 tsconfig.json 核心配置详解

### 基础结构

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### target：编译目标

```json
{
  "compilerOptions": {
    "target": "ES5" | "ES2015" | "ES2020" | "ESNext"
  }
}
```

- **ES5**：兼容 IE11，生成 ES5 代码
- **ES2015+**：现代浏览器，保留原生特性
- **ESNext**：最新提案特性

### module：模块系统

```json
{
  "compilerOptions": {
    "module": "CommonJS" | "ESNext" | "AMD" | "UMD"
  }
}
```

- **CommonJS**：Node.js 默认
- **ESNext**：现代前端工程（配合打包工具）
- **AMD/UMD**：浏览器环境（较少使用）

### lib：标准库声明

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

常用组合：
- **Node.js**：`["ES2020"]`
- **Web**：`["ES2020", "DOM", "DOM.Iterable"]`
- **Web Worker**：`["ES2020", "WebWorker"]`

---

## 11.2 strict 模式的各项检查规则

### strict：启用所有严格检查

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

等价于启用以下所有选项：

### noImplicitAny

```typescript
// ❌ strict 模式下报错
function add(a, b) { // 参数隐式为 any
  return a + b;
}

// ✓
function add(a: number, b: number): number {
  return a + b;
}
```

### strictNullChecks

```typescript
// ❌ strict 模式下报错
let name: string = null;

// ✓
let name: string | null = null;
```

### strictFunctionTypes

```typescript
interface Handler {
  (x: string): void;
}

// ❌ 参数类型必须兼容（逆变）
const handler: Handler = (x: string | number) => {};

// ✓
const handler: Handler = (x: string) => {};
```

### strictPropertyInitialization

```typescript
class User {
  name: string; // ❌ 必须初始化或在构造函数中赋值

  constructor() {
    // 未赋值
  }
}

// ✓ 方案 1：初始化
class User {
  name: string = '';
}

// ✓ 方案 2：构造函数赋值
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// ✓ 方案 3：确定赋值断言
class User {
  name!: string; // 告诉编译器会在其他地方赋值
}
```

### noImplicitThis

```typescript
// ❌ this 隐式为 any
function greet() {
  console.log(this.name);
}

// ✓ 显式标注 this
function greet(this: { name: string }) {
  console.log(this.name);
}
```

---

## 11.3 模块解析策略

### moduleResolution

```json
{
  "compilerOptions": {
    "moduleResolution": "node" | "classic"
  }
}
```

**node**（推荐）：模拟 Node.js 解析
- 查找 `node_modules`
- 支持 `package.json` 的 `main`/`types` 字段

**classic**（遗留）：TypeScript 1.6 之前的默认策略

### baseUrl 与 paths

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

使用：

```typescript
// 替代相对路径
import Button from '@components/Button';
import { formatDate } from '@utils/date';
```

**注意**：打包工具（Webpack/Vite）需要配置相同的别名。

---

## 11.4 声明文件（.d.ts）的编写与使用

### 全局类型声明

```typescript
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
    };
  }
}

export {};
```

使用：

```typescript
window.myApp.version; // ✓ 类型安全
```

### 模块声明

```typescript
// declarations.d.ts
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

使用：

```typescript
import logo from './logo.svg'; // logo: string
import styles from './App.module.css'; // styles: { [key: string]: string }
```

### 为 JavaScript 库编写声明

```typescript
// lodash.d.ts
declare module 'lodash' {
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T;
}
```

---

## 11.5 第三方库的类型支持

### @types 包

```bash
# 安装类型声明
npm install --save-dev @types/node
npm install --save-dev @types/react
npm install --save-dev @types/lodash
```

### 类型查找顺序

1. 库自带的类型声明（`package.json` 的 `types` 字段）
2. `@types` 包
3. 项目中的声明文件

### 缺少类型声明的处理

```typescript
// 方案 1：使用 any（不推荐）
const lib = require('some-lib') as any;

// 方案 2：编写最小声明
declare module 'some-lib' {
  export function doSomething(arg: string): void;
}

// 方案 3：贡献到 DefinitelyTyped
// https://github.com/DefinitelyTyped/DefinitelyTyped
```

---

## 深入一点

### 项目引用（Project References）

用于 monorepo 或大型项目的增量编译：

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true
  }
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [
    { "path": "../core" }
  ]
}
```

### 增量编译

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  }
}
```

---

## 前端工程实践

### 场景 1：React 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 场景 2：Node.js 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 场景 3：库项目配置

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## 关键要点

1. **strict 模式**启用所有严格检查，推荐在新项目中使用
2. **moduleResolution** 应设置为 `node`，配合现代模块系统
3. **paths** 配置路径别名，需与打包工具保持一致
4. **声明文件**为无类型库提供类型支持，优先使用 `@types` 包
5. **项目引用**适合 monorepo，支持增量编译和依赖管理
6. **skipLibCheck** 跳过 `.d.ts` 文件检查，提升编译速度

---

## 参考资料

- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [TypeScript Handbook: Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
