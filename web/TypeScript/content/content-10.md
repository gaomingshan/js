# 10. 类型体操与工具类型

## 概述

类型体操是指使用 TypeScript 高级类型特性实现复杂的类型转换。掌握工具类型的实现原理，能提升类型编程能力。

---

## 10.0 核心套路

### 核心套路

```typescript
// ============================================================
// TypeScript 高级类型系统 – 优化后的生产级版本
// ============================================================



// ================= 1. 条件类型 =================

// 判断是否为 string
type IsString<T> = T extends string ? true : false;

// 模拟 if / else if / else
type CheckType<T> =
  T extends string ? "is-string" :
  T extends number ? "is-number" :
  "is-other";



// ================= 2. infer 推断（高级推断） =================

// 获取元组第一个元素（严格版本）
type First<T extends any[]> =
  T extends [infer F, ...any[]] ? F : never;

// 获取函数返回值类型
type GetReturn<T> =
  T extends (...args: any[]) => infer R ? R : never;

// 递归解包 Promise（生产级写法）
type UnPromise<T> =
  T extends Promise<infer U>
    ? UnPromise<U>
    : T;



// ================= 3. 索引访问类型 =================

// 获取元组中所有元素类型的联合
type TupleTypes = [string, number, boolean][number];

// 基础对象
type Obj = { a: string; b: number };

// 获取对象所有 value 的联合
type ObjValues = Obj[keyof Obj];

// 获取指定属性类型
type Specific = Obj["a"];

// 联合对象示例
type Cat = { type: "cat"; meow: () => void };
type Dog = { type: "dog"; bark: () => void };

// 提取联合类型中的共有属性
type AnimalType = (Cat | Dog)["type"];



// ================= 4. 映射类型 =================

// 手写 Readonly
type MyReadonly<T> = { readonly [P in keyof T]: T[P] };

// 手写 Partial
type MyPartial<T> = { [P in keyof T]?: T[P] };

// 键名重映射（转大写）
type UpperCaseKeys<T> = {
  [P in keyof T as Uppercase<string & P>]: T[P]
};

// 删除值为 never 的属性
type RemoveNever<T> = {
  [P in keyof T as T[P] extends never ? never : P]: T[P]
};

// 按 value 类型筛选属性
type PickByValue<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K]
};



// ================= 5. 分布式条件类型 =================

// 联合类型会自动分发
type ToArray<T> = T extends any ? [T] : never;

// 关闭分布式行为
type ToArrayNonDist<T> =
  [T] extends [any] ? [T] : never;



// ================= 6. 模板字面量类型 =================

// 安全版 ReplaceAll（防止空字符串死循环）
type ReplaceAll<
  T extends string,
  From extends string,
  To extends string
> =
  From extends ""
    ? T
    : T extends `${infer Prefix}${From}${infer Suffix}`
      ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}`
      : T;

// 提取路径参数
type GetPathParams<T> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | GetPathParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;



// ================= 7. 可变参数元组 =================

// 删除第一个元素
type Shift<T extends any[]> =
  T extends [any, ...infer R] ? R : [];

// 左旋转
type RotateLeft<T extends any[]> =
  T extends [infer F, ...infer R] ? [...R, F] : [];

// 柯里化（基于元组）
type Curry<T extends any[], R> =
  T extends [infer F, ...infer Rest]
    ? (arg: F) => Curry<Rest, R>
    : R;

// 从函数类型自动生成柯里化版本
type CurryFn<F> =
  F extends (...args: infer Args) => infer R
    ? Curry<Args, R>
    : never;



// ================= 8. 集合运算 =================

// 取交集（保留符合类型）
type OnlyStrings<T> = Extract<T, string>;

// 取差集（剔除符合类型）
type NoStrings<T> = Exclude<T, string>;

// 手写 Omit
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as Exclude<P, K>]: T[P]
};



// ================= 9. 深度工具类型 =================

// 深度 Partial
type DeepPartial<T> =
  T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

// 深度 Readonly
type DeepReadonly<T> =
  T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// 深度去除 null / undefined
type DeepNonNullable<T> =
  T extends object
    ? { [K in keyof T]: DeepNonNullable<NonNullable<T[K]>> }
    : NonNullable<T>;



// ================= 10. 联合类型黑魔法 =================

// Union 转 Intersection
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void
    ? I
    : never;

// 判断类型是否相等
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;



// ================= 11. unknown / any / never 行为 =================

// never 在联合类型中会被消除
type NeverUnion = string | never;

// any 会污染交叉类型
type AnyTest = string & any;

// unknown 行为
type UnknownAnd = unknown & string;  // 结果为 string
type UnknownOr = unknown | string;   // 结果为 unknown

// 判断是否为 never（安全写法）
type FilterEmpty<T> =
  [T] extends [never] ? "empty" : "has-value";



// ================= 12. 递归优化 =================

// 普通递归（层级过深会报错）
type ReverseSimple<T extends any[]> =
  T extends [infer F, ...infer R]
    ? [...ReverseSimple<R>, F]
    : [];

// 尾递归优化（使用累加器）
type ReverseAcc<
  T extends any[],
  Acc extends any[] = []
> =
  T extends [infer F, ...infer R]
    ? ReverseAcc<R, [F, ...Acc]>
    : Acc;


// ============================================================
// 结束：TypeScript 高级类型体操全集
// ============================================================
```

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
