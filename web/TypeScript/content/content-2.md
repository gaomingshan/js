# 2. 基础类型与类型注解

## 概述

TypeScript 的类型系统建立在对 JavaScript 值的精准描述之上。本节介绍基础类型与类型注解语法。

---

## 2.1 原始类型

### string、number、boolean

```typescript
let name: string = 'Alice';
let age: number = 30;
let isActive: boolean = true;

// 类型推断：通常可省略类型注解
let city = 'Beijing'; // 推断为 string
```

### symbol 与 bigint

```typescript
// Symbol：唯一标识符
const id: symbol = Symbol('id');
const obj = {
  [id]: 123
};

// BigInt：大整数（ES2020）
const bigNum: bigint = 9007199254740991n;
```

**易错点**：`number` 和 `bigint` 不兼容

```typescript
let num: number = 100;
let big: bigint = 100n;
num = big; // ❌ Type 'bigint' is not assignable to type 'number'
```

---

## 2.2 特殊类型

### null 与 undefined

```typescript
let u: undefined = undefined;
let n: null = null;

// strictNullChecks 关闭时，null/undefined 可赋值给任意类型
let name: string = null; // ❌ strictNullChecks 开启时报错

// 推荐：使用联合类型
let name: string | null = null;
```

### void：无返回值

```typescript
function log(message: string): void {
  console.log(message);
  // 不能 return 值
}

// void 类型的变量只能赋值为 undefined（strictNullChecks 开启时）
let result: void = undefined;
```

### never：永不存在的值

```typescript
// 抛出异常的函数
function throwError(message: string): never {
  throw new Error(message);
}

// 无限循环
function infiniteLoop(): never {
  while (true) {}
}

// 用途：穷尽性检查
type Shape = 'circle' | 'square';
function getArea(shape: Shape) {
  switch (shape) {
    case 'circle': return Math.PI;
    case 'square': return 4;
    default:
      const _exhaustive: never = shape; // 确保所有情况已覆盖
      return _exhaustive;
  }
}
```

---

## 2.3 字面量类型与类型收窄

### 字面量类型

```typescript
let status: 'success' | 'error' | 'pending' = 'success';
status = 'loading'; // ❌ 只能是三个值之一

const port: 3000 = 3000; // 字面量类型
```

### let 与 const 的类型推断

```typescript
let a = 'hello'; // 推断为 string
const b = 'hello'; // 推断为 'hello'（字面量类型）

let arr = [1, 2, 3]; // 推断为 number[]
const arr2 = [1, 2, 3]; // 推断为 number[]（不是 readonly）
```

### 类型收窄（Type Narrowing）

```typescript
function print(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // value 收窄为 string
  } else {
    console.log(value.toFixed(2)); // value 收窄为 number
  }
}
```

---

## 2.4 数组与元组

### 数组类型

```typescript
// 两种语法
let arr1: number[] = [1, 2, 3];
let arr2: Array<number> = [1, 2, 3];

// 只读数组
let arr3: readonly number[] = [1, 2, 3];
arr3.push(4); // ❌ push 方法不存在
```

### 元组（Tuple）

```typescript
// 固定长度和类型的数组
let user: [string, number] = ['Alice', 30];
user = ['Bob']; // ❌ 长度不匹配

// 可选元素
let point: [number, number, number?] = [1, 2];

// 剩余元素
let tuple: [string, ...number[]] = ['a', 1, 2, 3];
```

**易错点**：元组的越界访问

```typescript
let tuple: [string, number] = ['a', 1];
console.log(tuple[2]); // undefined，但类型检查不报错（历史原因）
```

---

## 2.5 对象类型

### 对象字面量类型

```typescript
let user: { name: string; age: number } = {
  name: 'Alice',
  age: 30
};
```

### 可选属性与只读属性

```typescript
interface User {
  readonly id: number;
  name: string;
  age?: number; // 可选
}

const user: User = { id: 1, name: 'Alice' };
user.id = 2; // ❌ 只读属性
user.email = 'a@a.com'; // ❌ 多余属性
```

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
  [key: string]: string | number; // 索引签名类型必须包含具体属性类型
}
```

---

## 2.6 函数类型

### 函数类型注解

```typescript
// 完整函数类型
let add: (a: number, b: number) => number = function(a, b) {
  return a + b;
};

// 箭头函数
const multiply = (a: number, b: number): number => a * b;

// 可选参数与默认参数
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}`;
}

function greet2(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}`;
}
```

### 剩余参数

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // ✓
```

### this 参数

```typescript
interface User {
  name: string;
  greet(this: User): void;
}

const user: User = {
  name: 'Alice',
  greet() {
    console.log(this.name); // this 被约束为 User
  }
};

const greet = user.greet;
greet(); // ❌ this 隐式为 any（strictBindCallApply 开启时报错）
```

---

## 深入一点

### 类型注解 vs 类型断言

```typescript
// 类型注解：声明变量类型
let value: number = 123;

// 类型断言：告诉编译器"我比你更懂"
let value2 = JSON.parse('123') as number;
let value3 = <number>JSON.parse('123'); // JSX 中不推荐
```

### 结构化类型的子类型关系

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

let p2: Point2D = { x: 1, y: 2 };
let p3: Point3D = { x: 1, y: 2, z: 3 };

p2 = p3; // ✓ Point3D 是 Point2D 的子类型（多余属性兼容）
p3 = p2; // ❌ Point2D 缺少 z 属性
```

---

## 前端工程实践

### 场景 1：表单数据类型

```typescript
interface FormData {
  username: string;
  email: string;
  age?: number;
  newsletter: boolean;
  role: 'admin' | 'user' | 'guest';
}

function submitForm(data: FormData): void {
  console.log(data);
}

submitForm({
  username: 'alice',
  email: 'alice@example.com',
  newsletter: false,
  role: 'user'
});
```

### 场景 2：事件处理器类型

```typescript
// React 事件处理器
function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
  console.log(event.currentTarget.value);
}

// DOM 事件处理器
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  console.log(target.value);
}
```

### 场景 3：API 响应的元组应用

```typescript
// 自定义 Hook 返回值
function useAsync<T>(
  fn: () => Promise<T>
): [T | null, Error | null, boolean] {
  // 返回 [data, error, loading]
  return [null, null, false];
}

const [data, error, loading] = useAsync(fetchUser);
```

---

## 关键要点

1. **原始类型**对应 JavaScript 的基本值类型，注意 `bigint` 与 `number` 不兼容
2. **never** 表示永不存在的值，常用于穷尽性检查和抛出异常的函数
3. **字面量类型**精准限定值的范围，结合联合类型实现枚举效果
4. **元组**是固定长度和类型的数组，但越界访问检查较弱
5. **索引签名**允许动态属性，但会影响类型安全性
6. **函数类型**包含参数类型和返回值类型，可选参数必须在必选参数之后

---

## 参考资料

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
