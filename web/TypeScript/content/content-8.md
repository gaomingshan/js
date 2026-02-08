# 8. 高级类型操作

## 概述

TypeScript 提供了一系列高级类型操作符，用于从现有类型构造新类型。掌握这些工具，是编写类型安全代码的关键。

---

## 8.1 映射类型

### Partial：所有属性可选

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; }

// 应用：表单更新
function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}
```

### Required：所有属性必选

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选修饰符
};

interface Config {
  timeout?: number;
  retries?: number;
}

type RequiredConfig = Required<Config>;
// { timeout: number; retries: number; }
```

### Readonly：所有属性只读

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

### Pick：选取部分属性

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }
```

### Omit：排除部分属性

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface User {
  id: number;
  name: string;
  password: string;
}

type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; }
```

---

## 8.2 条件类型：extends 的高级用法

### 基础语法

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

### 条件类型的分布式特性

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>; // string[] | number[]
// 分布式：ToArray<string> | ToArray<number>
```

### Exclude 和 Extract

```typescript
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

type A = Exclude<'a' | 'b' | 'c', 'a' | 'b'>; // 'c'
type B = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
```

### NonNullable

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null | undefined>; // string
```

---

## 8.3 infer 关键字

### 推断函数返回值

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { name: 'Alice', age: 30 };
}

type User = ReturnType<typeof getUser>; // { name: string; age: number; }
```

### 推断函数参数

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number) {
  return { name, age };
}

type Params = Parameters<typeof createUser>; // [string, number]
```

### 推断数组元素类型

```typescript
type ElementType<T> = T extends (infer E)[] ? E : T;

type A = ElementType<number[]>; // number
type B = ElementType<string>; // string
```

### 推断 Promise 值类型

```typescript
type Awaited<T> = T extends Promise<infer U> ? U : T;

type A = Awaited<Promise<string>>; // string
type B = Awaited<number>; // number
```

---

## 8.4 模板字面量类型

### 基础语法

```typescript
type Greeting = `Hello, ${string}`;

const g1: Greeting = 'Hello, world'; // ✓
const g2: Greeting = 'Hi, world'; // ❌
```

### 联合类型的组合

```typescript
type Color = 'red' | 'green' | 'blue';
type Size = 'small' | 'medium' | 'large';

type ClassName = `${Color}-${Size}`;
// 'red-small' | 'red-medium' | 'red-large' | 'green-small' | ...
```

### 内置工具类型

```typescript
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

type A = Uppercase<'hello'>; // 'HELLO'
type B = Capitalize<'hello'>; // 'Hello'
```

### 提取字符串模式

```typescript
type GetParams<S extends string> =
  S extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | GetParams<`/${Rest}`>
    : S extends `${string}/:${infer Param}`
    ? Param
    : never;

type Params = GetParams<'/user/:id/post/:postId'>; // 'id' | 'postId'
```

---

## 8.5 递归类型与类型体操

### 深度 Readonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface User {
  name: string;
  address: {
    city: string;
    country: string;
  };
}

type ReadonlyUser = DeepReadonly<User>;
// {
//   readonly name: string;
//   readonly address: {
//     readonly city: string;
//     readonly country: string;
//   };
// }
```

### 深度 Partial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

### 获取对象路径

```typescript
type PathOf<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? K | `${K}.${PathOf<T[K]>}`
      : K
    : never;
}[keyof T];

interface User {
  name: string;
  address: {
    city: string;
    zip: number;
  };
}

type UserPath = PathOf<User>; // 'name' | 'address' | 'address.city' | 'address.zip'
```

---

## 深入一点

### 映射类型的修饰符

```typescript
// 添加/移除 readonly 和 ?
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]; // 移除 readonly
};

type Required<T> = {
  [P in keyof T]-?: T[P]; // 移除可选
};
```

### 条件类型的嵌套

```typescript
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';

type A = TypeName<string>; // 'string'
type B = TypeName<() => void>; // 'function'
```

---

## 前端工程实践

### 场景 1：表单状态管理

```typescript
interface FormValues {
  username: string;
  email: string;
  age: number;
}

type FormErrors<T> = {
  [K in keyof T]?: string;
};

type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
}

const formState: FormState<FormValues> = {
  values: { username: '', email: '', age: 0 },
  errors: { email: 'Invalid email' },
  touched: { username: true }
};
```

### 场景 2：API 响应类型转换

```typescript
interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
}

// 将蛇形命名转为驼峰
type CamelCase<S extends string> =
  S extends `${infer P}_${infer Q}${infer R}`
    ? `${P}${Uppercase<Q>}${CamelCase<R>}`
    : S;

type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K];
};

type User = CamelCaseKeys<ApiUser>;
// {
//   id: number;
//   firstName: string;
//   lastName: string;
//   createdAt: string;
// }
```

### 场景 3：React Props 的类型推导

```typescript
// 从组件推导 Props 类型
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

function Button(props: { label: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

type ButtonProps = ComponentProps<typeof Button>;
// { label: string; onClick: () => void; }
```

---

## 关键要点

1. **映射类型**通过 `[P in keyof T]` 遍历对象属性，实现类型转换
2. **条件类型**使用 `extends` 进行类型判断，支持分布式特性
3. **infer** 在条件类型中推断类型，常用于提取函数签名的部分
4. **模板字面量类型**实现字符串类型的模式匹配和组合
5. **递归类型**处理嵌套结构，需注意递归深度限制
6. 内置工具类型（Partial、Pick、Omit 等）是最佳实践的体现

---

## 参考资料

- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
