# 4. 联合类型与交叉类型

## 概述

联合类型和交叉类型是 TypeScript 的核心类型组合工具，它们提供了强大的类型建模能力。

---

## 4.1 联合类型的本质

### 类型的或运算

```typescript
// value 可以是 string 或 number
let value: string | number;
value = 'hello'; // ✓
value = 123; // ✓
value = true; // ❌ 不能是 boolean
```

### 函数参数的联合类型

```typescript
function print(value: string | number): void {
  console.log(value);
}

print('hello'); // ✓
print(123); // ✓
```

### 联合类型的属性访问

```typescript
function getLength(value: string | number) {
  return value.length; // ❌ number 没有 length 属性
}

// 只能访问共有属性
function toString(value: string | number) {
  return value.toString(); // ✓ 两者都有 toString
}
```

---

## 4.2 可辨识联合（Discriminated Unions）

### 标签联合类型

```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // shape 收窄为 Circle
    case 'square':
      return shape.sideLength ** 2; // shape 收窄为 Square
  }
}
```

### 应用：网络请求状态

```typescript
interface Idle {
  status: 'idle';
}

interface Loading {
  status: 'loading';
}

interface Success<T> {
  status: 'success';
  data: T;
}

interface Failure {
  status: 'failure';
  error: Error;
}

type AsyncState<T> = Idle | Loading | Success<T> | Failure;

function render<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Data: ${state.data}`;
    case 'failure':
      return `Error: ${state.error.message}`;
  }
}
```

---

## 4.3 交叉类型的本质

### 类型的与运算

```typescript
interface Person {
  name: string;
}

interface Employee {
  employeeId: number;
}

// Staff 同时具有 Person 和 Employee 的属性
type Staff = Person & Employee;

const staff: Staff = {
  name: 'Alice',
  employeeId: 123
};
```

### 函数类型的交叉

```typescript
type Logger = (message: string) => void;
type Timer = (start: number) => void;

type LogTimer = Logger & Timer; // ❌ 函数参数和返回值不兼容

// 实际上是 never 类型
const fn: LogTimer = (arg) => {}; // arg: never
```

---

## 4.4 联合类型 vs 交叉类型

### 对比表

| 特性 | 联合类型 `A \| B` | 交叉类型 `A & B` |
|------|------------------|------------------|
| 含义 | 值是 A **或** B | 值同时是 A **和** B |
| 属性访问 | 只能访问共有属性 | 可访问所有属性 |
| 赋值 | 可以赋值 A 或 B | 必须同时满足 A 和 B |

### 对象类型的交叉

```typescript
interface A { a: string; }
interface B { b: number; }

type C = A & B; // { a: string; b: number; }
```

### 原始类型的交叉

```typescript
type Never = string & number; // never（不可能同时是两种类型）
```

---

## 4.5 类型收窄技术

### typeof 守卫

```typescript
function print(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // value: string
  } else {
    console.log(value.toFixed(2)); // value: number
  }
}
```

### instanceof 守卫

```typescript
class Dog {
  bark() { console.log('Woof!'); }
}

class Cat {
  meow() { console.log('Meow!'); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // animal: Dog
  } else {
    animal.meow(); // animal: Cat
  }
}
```

### in 操作符

```typescript
interface Bird {
  fly(): void;
}

interface Fish {
  swim(): void;
}

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly(); // animal: Bird
  } else {
    animal.swim(); // animal: Fish
  }
}
```

### 自定义类型守卫

```typescript
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

// 类型谓词 is
function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // animal: Cat
  } else {
    animal.bark(); // animal: Dog
  }
}
```

---

## 深入一点

### 联合类型的分配律

```typescript
// 联合类型会分配到条件类型
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>; // string[] | number[]（而非 (string | number)[]）
```

### 交叉类型的冲突

```typescript
interface A {
  value: string;
}

interface B {
  value: number;
}

type C = A & B; // { value: string & number } 即 { value: never }
```

---

## 前端工程实践

### 场景 1：表单验证的错误状态

```typescript
interface FieldError {
  field: string;
  message: string;
}

interface GlobalError {
  message: string;
}

type FormError = FieldError | GlobalError;

function displayError(error: FormError) {
  if ('field' in error) {
    console.log(`${error.field}: ${error.message}`);
  } else {
    console.log(error.message);
  }
}
```

### 场景 2：React 事件处理

```typescript
type MouseOrKeyboardEvent = 
  | React.MouseEvent<HTMLDivElement>
  | React.KeyboardEvent<HTMLDivElement>;

function handleEvent(event: MouseOrKeyboardEvent) {
  if ('key' in event) {
    console.log(`Key pressed: ${event.key}`);
  } else {
    console.log(`Mouse clicked at: ${event.clientX}, ${event.clientY}`);
  }
}
```

### 场景 3：混入模式（Mixin）

```typescript
interface Timestamped {
  timestamp: Date;
}

interface Tagged {
  tags: string[];
}

type Post = {
  title: string;
  content: string;
} & Timestamped & Tagged;

const post: Post = {
  title: 'Hello',
  content: 'World',
  timestamp: new Date(),
  tags: ['typescript', 'tutorial']
};
```

---

## 关键要点

1. **联合类型**表示值可以是多种类型之一，只能访问共有属性
2. **可辨识联合**通过标签属性（如 `kind`）实现类型收窄，是状态机建模的利器
3. **交叉类型**表示值同时满足多种类型，常用于对象类型的组合
4. **类型收窄**通过 `typeof`、`instanceof`、`in`、自定义类型守卫实现
5. **自定义类型守卫**使用 `is` 关键字，提供更灵活的类型收窄逻辑

---

## 参考资料

- [TypeScript Handbook: Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
