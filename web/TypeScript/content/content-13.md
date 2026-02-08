# 13. TypeScript 最佳实践与性能优化

## 概述

TypeScript 的价值在于长期可维护性。本节介绍类型设计模式、性能优化与迁移策略。

---

## 13.1 类型定义的组织与复用策略

### 类型文件组织

```
src/
├── types/
│   ├── index.ts         # 导出所有类型
│   ├── api.ts           # API 相关类型
│   ├── models.ts        # 数据模型
│   └── utils.ts         # 工具类型
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── types.ts     # 组件专属类型
```

### 类型复用

```typescript
// types/models.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export type UserPreview = Pick<User, 'id' | 'name'>;
export type UserCreate = Omit<User, 'id'>;
export type UserUpdate = Partial<UserCreate>;

// 扩展基础类型
export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}
```

### 命名约定

```typescript
// 接口：I 前缀（可选）或直接命名
interface User {}
interface IUser {} // 部分团队习惯

// 类型别名：描述性名称
type UserID = number;
type UserRole = 'admin' | 'user' | 'guest';

// 泛型参数：单字母或描述性
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {}
function map<Item, Result>(arr: Item[], fn: (item: Item) => Result): Result[] {}

// 工具类型：动词开头
type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;
```

---

## 13.2 避免过度类型体操

### 何时使用复杂类型

**✓ 适合场景**：
- 框架/库的公共 API
- 自动生成类型（如 GraphQL、Prisma）
- 核心工具类型

**✗ 避免场景**：
- 业务逻辑代码
- 一次性使用的类型
- 过度抽象的类型

### 简单优于复杂

```typescript
// ❌ 过度复杂
type DeepReadonlyWithOptional<T, K extends keyof T = keyof T> = {
  readonly [P in K]: T[P] extends object
    ? DeepReadonlyWithOptional<T[P]>
    : T[P];
} & {
  readonly [P in Exclude<keyof T, K>]?: T[P] extends object
    ? DeepReadonlyWithOptional<T[P]>
    : T[P];
};

// ✓ 简单直接
interface UserConfig {
  readonly name: string;
  readonly settings?: {
    readonly theme: string;
  };
}
```

### 类型注释的平衡

```typescript
// ❌ 冗余注解
const name: string = 'Alice'; // 类型推断已足够

// ✓ 必要注解
const users: User[] = []; // 空数组需要注解
const callback: (value: number) => void = (v) => {}; // 回调函数需要注解
```

---

## 13.3 编译性能优化

### 项目引用（Project References）

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "incremental": true
  }
}

// packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [
    { "path": "../shared" }
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

### skipLibCheck

```json
{
  "compilerOptions": {
    "skipLibCheck": true // 跳过 .d.ts 文件检查，提升速度
  }
}
```

### 避免昂贵的类型操作

```typescript
// ❌ 性能差：递归深度大
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ✓ 限制递归深度
type DeepPartial<T, Depth extends number = 3> = Depth extends 0
  ? T
  : {
      [P in keyof T]?: T[P] extends object
        ? DeepPartial<T[P], [-1, 0, 1, 2][Depth]>
        : T[P];
    };
```

---

## 13.4 类型覆盖率与类型测试

### 类型覆盖率工具

```bash
# 安装 type-coverage
npm install --save-dev type-coverage

# 检查类型覆盖率
npx type-coverage

# 期望 95% 以上
npx type-coverage --at-least 95
```

### 类型测试

```typescript
// types.test.ts
import { expectType, expectError } from 'tsd';

interface User {
  name: string;
  age: number;
}

// 测试类型推断
const user = { name: 'Alice', age: 30 };
expectType<User>(user);

// 测试类型错误
expectError<User>({ name: 'Alice' }); // 缺少 age

// 测试工具类型
type PartialUser = Partial<User>;
expectType<{ name?: string; age?: number }>(
  {} as PartialUser
);
```

---

## 13.5 从 JavaScript 迁移的渐进策略

### 步骤 1：启用 TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,         // 允许 .js 文件
    "checkJs": false,        // 不检查 .js 文件
    "noEmit": true,          // 不输出编译结果
    "strict": false          // 关闭严格模式
  },
  "include": ["src/**/*"]
}
```

### 步骤 2：逐步重命名

```bash
# 逐个文件重命名 .js -> .ts
mv src/utils/helper.js src/utils/helper.ts
```

### 步骤 3：渐进式严格化

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,        // 先禁止隐式 any
    "strictNullChecks": false     // 暂时保留
  }
}
```

逐步启用其他严格选项。

### 步骤 4：类型注解策略

```typescript
// 优先注解公共 API
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 内部函数可以依赖类型推断
function sumPrices(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 步骤 5：处理第三方库

```bash
# 安装类型声明
npm install --save-dev @types/lodash
npm install --save-dev @types/express

# 缺少类型的库
declare module 'legacy-lib' {
  export function doSomething(arg: any): any;
}
```

---

## 深入一点

### 类型设计的权衡

**严格 vs 灵活**：

```typescript
// 严格：类型安全，但灵活性差
function process(value: string): string {
  return value.toUpperCase();
}

// 灵活：支持多种输入，但类型安全性降低
function process(value: string | number): string {
  return String(value).toUpperCase();
}

// 平衡：使用函数重载
function process(value: string): string;
function process(value: number): string;
function process(value: string | number): string {
  return String(value).toUpperCase();
}
```

### 类型与运行时的分离

```typescript
// ❌ 类型断言绕过检查
const user = JSON.parse(data) as User;

// ✓ 运行时校验 + 类型断言
function parseUser(data: string): User {
  const obj = JSON.parse(data);
  if (!isUser(obj)) {
    throw new Error('Invalid user data');
  }
  return obj;
}

function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.age === 'number'
  );
}
```

---

## 前端工程实践

### 场景 1：大型项目的类型组织

```
src/
├── types/
│   ├── api/
│   │   ├── user.ts
│   │   ├── post.ts
│   │   └── index.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── index.ts           # 统一导出
```

```typescript
// types/index.ts
export * from './api';
export * from './models';
export * from './utils';

// 使用
import { User, ApiResponse } from '@/types';
```

### 场景 2：配置文件的类型安全

```typescript
// config.ts
interface AppConfig {
  apiUrl: string;
  timeout: number;
  features: {
    [key: string]: boolean;
  };
}

const config: AppConfig = {
  apiUrl: process.env.API_URL!,
  timeout: parseInt(process.env.TIMEOUT || '5000'),
  features: {
    darkMode: true,
    analytics: process.env.NODE_ENV === 'production'
  }
};

export default config;
```

### 场景 3：单元测试的类型支持

```typescript
import { expectType } from 'tsd';
import { renderHook } from '@testing-library/react-hooks';
import { useAsync } from './useAsync';

test('useAsync returns correct types', () => {
  const { result } = renderHook(() => useAsync(() => Promise.resolve(123)));
  
  expectType<number | null>(result.current.data);
  expectType<boolean>(result.current.loading);
  expectType<Error | null>(result.current.error);
});
```

---

## 关键要点

1. **类型组织**按功能模块划分，统一导出，避免循环依赖
2. **避免过度类型体操**，优先简单直接的类型定义
3. **编译性能**通过项目引用、增量编译、skipLibCheck 优化
4. **类型覆盖率**监控项目的类型安全程度，目标 95% 以上
5. **渐进迁移**从 JavaScript 到 TypeScript 需逐步启用严格模式
6. **类型与运行时分离**，关键数据需要运行时校验

---

## 参考资料

- [TypeScript Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
- [Type Coverage](https://github.com/plantain-00/type-coverage)
- [TSD - Test TypeScript definitions](https://github.com/SamVerschueren/tsd)
- [Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
