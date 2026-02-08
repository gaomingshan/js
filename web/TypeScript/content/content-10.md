# 10. 类型体操与工具类型

## 概述

类型体操是指使用 TypeScript 高级类型特性实现复杂的类型转换。掌握工具类型的实现原理，能提升类型编程能力。

---

## 10.1 Utility Types 的实现原理

### Partial 实现

```typescript
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

type PartialUser = MyPartial<User>;
// { name?: string; age?: number; }
```

### Required 实现

```typescript
type MyRequired<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选修饰符
};
```

### Pick 实现

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserPreview = MyPick<User, 'name' | 'age'>;
```

### Record 实现

```typescript
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

type Roles = MyRecord<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean; }
```

### ReturnType 实现

```typescript
type MyReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : never;

function getUser() {
  return { name: 'Alice', age: 30 };
}

type User = MyReturnType<typeof getUser>;
```

---

## 10.2 深度递归类型的设计模式

### DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Function
    ? T[P]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface User {
  name: string;
  profile: {
    avatar: string;
    settings: {
      theme: string;
    };
  };
}

type ReadonlyUser = DeepReadonly<User>;
// 所有嵌套属性都是 readonly
```

### DeepPartial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

### DeepRequired

```typescript
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object | undefined
    ? DeepRequired<NonNullable<T[P]>>
    : T[P];
};
```

---

## 10.3 元组类型的高级操作

### 获取第一个元素

```typescript
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

type A = First<[1, 2, 3]>; // 1
type B = First<[]>; // never
```

### 获取最后一个元素

```typescript
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type A = Last<[1, 2, 3]>; // 3
```

### 元组转联合

```typescript
type TupleToUnion<T extends any[]> = T[number];

type A = TupleToUnion<[string, number, boolean]>; // string | number | boolean
```

### 元组拼接

```typescript
type Concat<T extends any[], U extends any[]> = [...T, ...U];

type A = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]
```

### 元组长度

```typescript
type Length<T extends any[]> = T['length'];

type A = Length<[1, 2, 3]>; // 3
```

---

## 10.4 字符串类型的模式匹配

### 提取 URL 参数

```typescript
type ExtractParams<S extends string> =
  S extends `${infer _}/:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : S extends `${infer _}/:${infer Param}`
    ? Param
    : never;

type Params = ExtractParams<'/user/:id/post/:postId'>;
// 'id' | 'postId'
```

### 驼峰转蛇形

```typescript
type CamelToSnake<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Uppercase<First>
      ? `_${Lowercase<First>}${CamelToSnake<Rest>}`
      : `${First}${CamelToSnake<Rest>}`
    : S;

type A = CamelToSnake<'userName'>; // 'user_name'
```

### 字符串替换

```typescript
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ''
  ? S
  : S extends `${infer Before}${From}${infer After}`
  ? `${Before}${To}${After}`
  : S;

type A = Replace<'hello world', 'world', 'TypeScript'>;
// 'hello TypeScript'
```

### 字符串分割

```typescript
type Split<S extends string, Delimiter extends string> =
  S extends `${infer First}${Delimiter}${infer Rest}`
    ? [First, ...Split<Rest, Delimiter>]
    : S extends ''
    ? []
    : [S];

type A = Split<'a,b,c', ','>; // ['a', 'b', 'c']
```

---

## 10.5 类型编程的性能优化

### 避免过度递归

```typescript
// ❌ 性能差：每次都重新计算
type BadDeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? BadDeepReadonly<T[P]>
    : T[P];
};

// ✓ 优化：缓存结果
type DeepReadonly<T> = T extends any
  ? {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P]>
        : T[P];
    }
  : never;
```

### 使用尾递归优化

```typescript
// ❌ 非尾递归
type Reverse<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : [];

// ✓ 尾递归（使用累加器）
type ReverseTail<T extends any[], Acc extends any[] = []> =
  T extends [infer First, ...infer Rest]
    ? ReverseTail<Rest, [First, ...Acc]>
    : Acc;
```

### 限制递归深度

```typescript
type DeepReadonly<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P], Decrement<Depth>>
        : T[P];
    };

// Decrement 工具类型
type Decrement<N extends number> = [-1, 0, 1, 2, 3, 4, 5][N];
```

---

## 深入一点

### 类型体操的调试技巧

```typescript
// 使用类型别名展开结果
type Debug<T> = { [K in keyof T]: T[K] };

type Test = Debug<Pick<User, 'name'>>;
// 鼠标悬停时显示 { name: string } 而非 Pick<User, 'name'>
```

### 分布式条件类型的应用

```typescript
// 排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null | undefined>; // string
// 分布式：NonNullable<string> | NonNullable<null> | NonNullable<undefined>
//      = string | never | never = string
```

---

## 前端工程实践

### 场景 1：Form 类型推导

```typescript
interface FormConfig {
  fields: {
    name: { type: 'text'; required: true };
    email: { type: 'email'; required: true };
    age: { type: 'number'; required: false };
  };
}

type ExtractFieldType<T> =
  T extends { type: 'text' } ? string :
  T extends { type: 'email' } ? string :
  T extends { type: 'number' } ? number :
  never;

type ExtractFormValues<T extends FormConfig> = {
  [K in keyof T['fields']]: T['fields'][K] extends { required: true }
    ? ExtractFieldType<T['fields'][K]>
    : ExtractFieldType<T['fields'][K]> | undefined;
};

type FormValues = ExtractFormValues<FormConfig>;
// {
//   name: string;
//   email: string;
//   age: number | undefined;
// }
```

### 场景 2：路由类型安全

```typescript
const routes = {
  home: '/',
  user: '/user/:id',
  post: '/post/:postId/comment/:commentId'
} as const;

type ExtractParams<S extends string> =
  S extends `${infer _}/:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : S extends `${infer _}/:${infer Param}`
    ? { [K in Param]: string }
    : {};

type RouteParams = {
  [K in keyof typeof routes]: ExtractParams<typeof routes[K]>;
};

// RouteParams = {
//   home: {};
//   user: { id: string };
//   post: { postId: string; commentId: string };
// }

function navigate<K extends keyof typeof routes>(
  route: K,
  params: RouteParams[K]
): void {
  // 类型安全的导航
}

navigate('user', { id: '123' }); // ✓
navigate('user', {}); // ❌ 缺少 id
```

### 场景 3：API 响应类型转换

```typescript
interface ApiConfig {
  '/user': { id: number; name: string };
  '/post': { id: number; title: string; author_id: number };
}

type CamelCaseKeys<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K];
};

type CamelCase<S extends string> =
  S extends `${infer P}_${infer Q}${infer R}`
    ? `${P}${Uppercase<Q>}${CamelCase<R>}`
    : S;

type ApiResponse<T extends keyof ApiConfig> = CamelCaseKeys<ApiConfig[T]>;

type UserResponse = ApiResponse<'/user'>; // { id: number; name: string }
type PostResponse = ApiResponse<'/post'>; // { id: number; title: string; authorId: number }
```

---

## 关键要点

1. **工具类型**基于映射类型、条件类型、infer 等特性实现
2. **递归类型**处理嵌套结构，需注意性能和递归深度限制
3. **元组操作**使用 infer 和剩余参数实现模式匹配
4. **字符串类型**支持模板字面量和模式匹配，适合 URL、命名转换
5. **性能优化**通过缓存、尾递归、限制深度等手段提升编译速度
6. 类型体操应**适度使用**，过度复杂会降低可维护性

---

## 参考资料

- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript Deep Dive: Advanced Types](https://basarat.gitbook.io/typescript/type-system/advanced-types)
