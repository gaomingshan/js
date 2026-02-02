# 9. 类型系统的边界与陷阱

## 概述

TypeScript 的类型系统虽然强大，但并非完美。理解其边界与陷阱，能避免常见错误，写出更健壮的代码。

---

## 9.1 any、unknown、never 的语义差异

### any：类型系统的逃生舱

```typescript
let value: any = 123;
value.foo.bar.baz(); // ✓ 编译通过，运行时错误
value = 'hello';
value = true;
```

**问题**：
- 完全绕过类型检查
- 类型信息传播污染

### unknown：类型安全的 any

```typescript
let value: unknown = 123;
value.toFixed(); // ❌ 必须先收窄类型

if (typeof value === 'number') {
  value.toFixed(); // ✓
}
```

**最佳实践**：优先使用 `unknown` 替代 `any`

### never：永不存在的值

```typescript
// 表示函数永不返回
function throwError(msg: string): never {
  throw new Error(msg);
}

// 表示不可达的代码
function unreachable(x: never): never {
  throw new Error('Unreachable');
}

type Shape = 'circle' | 'square';
function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle': return 3.14;
    case 'square': return 4;
    default:
      return unreachable(shape); // 穷尽性检查
  }
}
```

### 三者对比

| 类型 | 可赋值给 | 可被赋值 | 用途 |
|------|---------|---------|------|
| any | 任意类型 | 任意类型 | 绕过类型检查 |
| unknown | unknown/any | 任意类型 | 类型安全的顶类型 |
| never | 任意类型 | never | 底类型，穷尽检查 |

---

## 9.2 类型兼容性：结构子类型的规则

### 对象类型的兼容性

```typescript
interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

let p2: Point2D = { x: 1, y: 2 };
let p3: Point3D = { x: 1, y: 2, z: 3 };

p2 = p3; // ✓ 多余属性兼容
p3 = p2; // ❌ 缺少 z 属性
```

### 函数类型的兼容性

```typescript
type Handler1 = (a: number, b: number) => void;
type Handler2 = (a: number) => void;

let h1: Handler1 = (a, b) => {};
let h2: Handler2 = (a) => {};

h1 = h2; // ✓ 参数少的可以赋值给参数多的
h2 = h1; // ❌ 参数多的不能赋值给参数少的
```

**原因**：函数参数是逆变的

```typescript
// 实际应用
[1, 2, 3].forEach((item, index, array) => {
  console.log(item); // 可以忽略 index 和 array
});
```

---

## 9.3 函数参数的双向协变问题

### 默认行为（不严格）

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

let f1: (animal: Animal) => void;
let f2: (dog: Dog) => void;

f1 = f2; // ⚠️ 默认允许（双向协变）
f2 = f1; // ⚠️ 默认允许
```

### 启用 strictFunctionTypes

```typescript
// tsconfig.json: "strictFunctionTypes": true

let f1: (animal: Animal) => void;
let f2: (dog: Dog) => void;

f1 = f2; // ❌ 严格模式下报错
f2 = f1; // ✓ 逆变，允许
```

**例外**：方法签名仍然是双向协变的（兼容性考虑）

```typescript
interface Handler {
  handle(animal: Animal): void;
}

const handler: Handler = {
  handle(dog: Dog) {} // ⚠️ 允许
};
```

---

## 9.4 索引访问类型的边界

### 基础用法

```typescript
interface User {
  name: string;
  age: number;
}

type Name = User['name']; // string
type Age = User['age']; // number
```

### 联合类型索引

```typescript
type UserKey = User['name' | 'age']; // string | number
type AllValues = User[keyof User]; // string | number
```

### 数组索引

```typescript
const arr = [1, 2, 3];
type ArrType = typeof arr[number]; // number

const tuple = ['a', 1] as const;
type TupleType = typeof tuple[number]; // 'a' | 1
```

### 陷阱：可选属性的索引

```typescript
interface Config {
  timeout?: number;
}

type Timeout = Config['timeout']; // number | undefined（包含 undefined）
```

---

## 9.5 循环依赖与类型递归的限制

### 类型递归深度限制

```typescript
// TypeScript 限制递归深度为 50 层
type DeepArray<T, N extends number = 10> =
  N extends 0
    ? T
    : T | DeepArray<T[], Decrement<N>>;

// 递归深度过大会报错
type VeryDeep = DeepArray<number, 100>; // ❌ 超过递归限制
```

### 循环引用

```typescript
// ✓ 对象类型的循环引用
interface Node {
  value: number;
  next: Node | null;
}

// ❌ 类型别名的直接循环引用（TypeScript 5.0+ 支持部分场景）
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
```

---

## 深入一点

### 类型守卫的失效场景

```typescript
function isString(value: any): value is string {
  return typeof value === 'string';
}

let value: string | number = 'hello';

if (isString(value)) {
  console.log(value.toUpperCase()); // value: string
}

// 异步后失效
setTimeout(() => {
  console.log(value.toUpperCase()); // ❌ value 可能已改变为 number
}, 1000);

value = 123; // 运行时改变
```

### 类型断言的陷阱

```typescript
interface User {
  name: string;
  age: number;
}

const data = { name: 'Alice' };
const user = data as User; // ⚠️ 断言通过，但缺少 age

console.log(user.age.toFixed()); // ❌ 运行时错误
```

---

## 前端工程实践

### 场景 1：安全的 JSON 解析

```typescript
// ❌ 不安全
function parseJSON<T>(json: string): T {
  return JSON.parse(json) as T;
}

const user = parseJSON<User>('{"name":"Alice"}');
console.log(user.age.toFixed()); // ❌ 运行时错误

// ✓ 使用 unknown + 运行时校验
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as any).name === 'string' &&
    'age' in value &&
    typeof (value as any).age === 'number'
  );
}

const data = parseJSON('{"name":"Alice","age":30}');
if (isUser(data)) {
  console.log(data.age.toFixed()); // ✓ 类型安全
}
```

### 场景 2：避免类型污染

```typescript
// ❌ any 污染整个调用链
function processData(data: any) {
  return data.value;
}

const result = processData({ value: 123 }); // result: any
const num = result.toFixed(2); // ❌ 运行时错误

// ✓ 使用泛型
function processData<T extends { value: any }>(data: T): T['value'] {
  return data.value;
}

const result2 = processData({ value: 123 }); // result2: number
const num2 = result2.toFixed(2); // ✓
```

### 场景 3：事件处理的类型收窄

```typescript
// React 事件处理
function handleEvent(event: React.FormEvent) {
  const target = event.target as HTMLInputElement; // ⚠️ 断言风险

  console.log(target.value); // 如果 target 是 HTMLButtonElement？
}

// ✓ 使用类型守卫
function handleEvent(event: React.FormEvent) {
  if (event.target instanceof HTMLInputElement) {
    console.log(event.target.value); // ✓ 类型安全
  }
}
```

---

## 关键要点

1. **unknown** 是类型安全的顶类型，优先使用它替代 `any`
2. **never** 是底类型，用于穷尽性检查和表示永不返回的函数
3. **结构子类型**基于形状匹配，多余属性兼容，缺少属性不兼容
4. **函数参数是逆变的**，启用 `strictFunctionTypes` 强制严格检查
5. **类型断言绕过检查**，应结合运行时校验确保安全
6. **类型守卫**在异步场景下可能失效，需注意值的变化

---

## 参考资料

- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [TypeScript Deep Dive: Type System](https://basarat.gitbook.io/typescript/type-system)
- [Variance in TypeScript](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#function-parameter-bivariance)
