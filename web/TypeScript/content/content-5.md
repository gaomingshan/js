# 5. 接口与类型别名

## 概述

`interface` 和 `type` 是 TypeScript 中定义类型的两种主要方式。理解它们的差异与选择策略，是高效使用 TypeScript 的关键。

---

## 5.1 interface vs type

### 基本定义

```typescript
// 接口
interface User {
  name: string;
  age: number;
}

// 类型别名
type User = {
  name: string;
  age: number;
};
```

### 核心差异

| 特性 | interface | type |
|------|----------|------|
| 扩展方式 | extends | 交叉类型 & |
| 声明合并 | ✓ 支持 | ✗ 不支持 |
| 适用类型 | 对象、类、函数 | 任意类型（联合、元组等） |
| 性能 | 略优（缓存友好） | 略差 |

### 选择策略

**优先使用 interface**：
- 定义对象形状、类、API 契约
- 需要声明合并（如扩展第三方库）
- 团队约定或 ESLint 规则

**使用 type**：
- 联合类型、交叉类型、元组
- 映射类型、条件类型等高级类型
- 需要类型别名语义（如 `type ID = string`）

---

## 5.2 接口的继承与合并

### 接口继承

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const dog: Dog = {
  name: 'Buddy',
  breed: 'Labrador'
};

// 多重继承
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

interface Duck extends Flyable, Swimmable {
  quack(): void;
}
```

### 声明合并（Declaration Merging）

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合并为 { name: string; age: number; }
const user: User = {
  name: 'Alice',
  age: 30
};
```

**应用**：扩展第三方库类型

```typescript
// 扩展 Window 接口
interface Window {
  myCustomProperty: string;
}

window.myCustomProperty = 'Hello';
```

---

## 5.3 索引签名与映射类型

### 索引签名

```typescript
interface StringMap {
  [key: string]: string;
}

const map: StringMap = {
  name: 'Alice',
  city: 'Beijing'
};

// 同时使用索引签名和具体属性
interface Config {
  name: string;
  [key: string]: string; // 索引签名类型必须包含 name 的类型
}
```

### 映射类型（仅 type 支持）

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; }
```

---

## 5.4 只读属性与可选属性

### readonly 修饰符

```typescript
interface User {
  readonly id: number;
  name: string;
}

const user: User = { id: 1, name: 'Alice' };
user.id = 2; // ❌ 只读属性

// 深度只读需要递归映射类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### 可选属性

```typescript
interface User {
  name: string;
  age?: number; // 可选
}

const user1: User = { name: 'Alice' }; // ✓
const user2: User = { name: 'Bob', age: 30 }; // ✓
```

### 可选属性 vs undefined

```typescript
interface A {
  value?: string;
}

interface B {
  value: string | undefined;
}

const a: A = {}; // ✓ 可以省略 value
const b: B = {}; // ❌ 必须显式提供 value（即使是 undefined）
const b2: B = { value: undefined }; // ✓
```

---

## 5.5 函数重载的类型设计

### 函数重载签名

```typescript
// 重载签名
function getValue(key: string): string;
function getValue(key: number): number;

// 实现签名
function getValue(key: string | number): string | number {
  if (typeof key === 'string') {
    return 'string value';
  } else {
    return 123;
  }
}

const v1 = getValue('key'); // v1: string
const v2 = getValue(1); // v2: number
```

### 接口定义的函数重载

```typescript
interface Formatter {
  (value: string): string;
  (value: number): string;
  (value: boolean): string;
}

const format: Formatter = (value: any): string => {
  return String(value);
};
```

---

## 深入一点

### 接口的递归定义

```typescript
interface TreeNode {
  value: number;
  children?: TreeNode[];
}

const tree: TreeNode = {
  value: 1,
  children: [
    { value: 2 },
    { value: 3, children: [{ value: 4 }] }
  ]
};
```

### 类型别名的递归限制

```typescript
// ✓ 对象类型的递归
type TreeNode = {
  value: number;
  children?: TreeNode[];
};

// ❌ 联合类型的递归（TypeScript 5.0+ 支持）
type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

### 接口的性能优势

TypeScript 编译器对接口有优化缓存，在大型项目中性能更好：

```typescript
// 推荐：使用接口定义公共 API
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 避免：在每个函数签名中重复定义类型
function fetchUser(): Promise<{ code: number; data: User; message: string }> {}
```

---

## 前端工程实践

### 场景 1：API 响应类型

```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

async function fetchUsers(): Promise<PaginatedResponse<User>> {
  const res = await fetch('/api/users');
  return res.json();
}
```

### 场景 2：React 组件 Props

```typescript
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

// 扩展基础 Props
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

function IconButton({ icon, iconPosition = 'left', children, ...props }: IconButtonProps) {
  return (
    <button {...props}>
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </button>
  );
}
```

### 场景 3：配置对象的类型

```typescript
interface AppConfig {
  apiUrl: string;
  timeout: number;
  retryCount: number;
  features: {
    [featureName: string]: boolean;
  };
}

const config: AppConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3,
  features: {
    darkMode: true,
    analytics: false
  }
};
```

---

## 关键要点

1. **interface** 适合定义对象形状，支持声明合并和继承
2. **type** 更灵活，支持联合、交叉、映射等高级类型
3. **声明合并**是接口独有特性，用于扩展第三方库类型
4. **索引签名**允许动态属性，但会降低类型安全性
5. **函数重载**提供多个函数签名，实现更精准的类型推断
6. **readonly** 只保证浅层只读，深度只读需要递归映射类型

---

## 参考资料

- [TypeScript Handbook: Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbook: Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)
- [Interfaces vs Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
