# 6. 泛型系统

## 概述

泛型是 TypeScript 类型系统的核心能力，它允许在定义函数、接口或类时使用类型参数，实现类型的参数化和复用。

---

## 6.1 泛型的本质：类型参数化

### 基础泛型函数

```typescript
// 没有泛型：重复定义
function identityString(value: string): string {
  return value;
}

function identityNumber(value: number): number {
  return value;
}

// 使用泛型：类型参数化
function identity<T>(value: T): T {
  return value;
}

const str = identity<string>('hello'); // str: string
const num = identity<number>(123); // num: number
const inferred = identity('hello'); // 类型推断：string
```

### 泛型的约束

```typescript
// ❌ 无法访问 T 的属性
function getLength<T>(value: T): number {
  return value.length; // 错误：T 没有 length 属性
}

// ✓ 使用 extends 约束
interface HasLength {
  length: number;
}

function getLength<T extends HasLength>(value: T): number {
  return value.length;
}

getLength('hello'); // ✓
getLength([1, 2, 3]); // ✓
getLength(123); // ❌ number 没有 length
```

---

## 6.2 泛型函数、泛型接口、泛型类

### 泛型函数

```typescript
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const numbers = [1, 2, 3];
const strings = map(numbers, (n) => n.toString()); // strings: string[]
```

### 泛型接口

```typescript
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

const stringContainer: Container<string> = {
  value: 'hello',
  getValue() {
    return this.value;
  },
  setValue(value: string) {
    this.value = value;
  }
};
```

### 泛型类

```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;

  constructor(zeroValue: T, add: (x: T, y: T) => T) {
    this.zeroValue = zeroValue;
    this.add = add;
  }
}

const numberAdder = new GenericNumber<number>(0, (x, y) => x + y);
const stringAdder = new GenericNumber<string>('', (x, y) => x + y);
```

---

## 6.3 泛型约束：extends 的语义

### 基础约束

```typescript
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

merge({ name: 'Alice' }, { age: 30 }); // ✓
merge({ name: 'Alice' }, 123); // ❌ 123 不是 object
```

### 使用 keyof 约束

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'name'); // name: string
const age = getProperty(user, 'age'); // age: number
getProperty(user, 'email'); // ❌ 'email' 不是 keyof User
```

### 多重约束

```typescript
interface Lengthwise {
  length: number;
}

interface Printable {
  print(): void;
}

function process<T extends Lengthwise & Printable>(value: T): void {
  console.log(value.length);
  value.print();
}
```

---

## 6.4 默认泛型参数

### 基础用法

```typescript
interface Container<T = string> {
  value: T;
}

const c1: Container = { value: 'hello' }; // 默认 string
const c2: Container<number> = { value: 123 }; // 指定 number
```

### 默认值依赖其他类型参数

```typescript
interface ApiResponse<T, E = Error> {
  data?: T;
  error?: E;
}

const response1: ApiResponse<User> = {
  data: { name: 'Alice' }
}; // E 默认为 Error

const response2: ApiResponse<User, string> = {
  error: 'Something went wrong'
}; // E 指定为 string
```

---

## 6.5 泛型的协变与逆变

### 协变（Covariance）

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 数组是协变的：Dog[] 是 Animal[] 的子类型
let animals: Animal[] = [];
let dogs: Dog[] = [{ name: 'Buddy', breed: 'Labrador' }];

animals = dogs; // ✓ 协变
```

### 逆变（Contravariance）

```typescript
// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (animal) => {
  console.log(animal.name);
};

let handleDog: DogHandler = handleAnimal; // ✓ 逆变

// 反过来不行
let handleDog2: DogHandler = (dog) => {
  console.log(dog.breed);
};
let handleAnimal2: AnimalHandler = handleDog2; // ❌
```

### TypeScript 的双向协变问题

```typescript
// TypeScript 默认允许函数参数双向协变（不严格）
interface EventHandler {
  (event: MouseEvent): void;
}

const handler: EventHandler = (event: Event) => {
  console.log(event);
}; // ⚠️ 默认允许，但不严格

// 启用 strictFunctionTypes 后会报错
```

---

## 深入一点

### 泛型的类型推断

```typescript
// 从参数推断
function toArray<T>(value: T): T[] {
  return [value];
}

const arr1 = toArray(1); // 推断 T 为 number
const arr2 = toArray('hello'); // 推断 T 为 string

// 从返回值推断（较少见）
function fromArray<T>(arr: T[]): T {
  return arr[0];
}

const value = fromArray([1, 2, 3]); // 推断 T 为 number
```

### 泛型的分布式条件类型

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>; // string[] | number[]

// 阻止分布：使用 []
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
```

---

## 前端工程实践

### 场景 1：通用 HTTP 请求函数

```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

async function request<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json();
}

interface User {
  id: number;
  name: string;
}

const response = await request<User>('/api/user/1');
console.log(response.data.name); // 类型安全
```

### 场景 2：React 泛型组件

```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={getValue(value)}
      onChange={(e) => {
        const option = options.find((o) => getValue(o) === e.target.value);
        if (option) onChange(option);
      }}
    >
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

<Select<User>
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getLabel={(user) => user.name}
  getValue={(user) => user.id}
/>;
```

### 场景 3：状态管理的类型安全

```typescript
type Action<T extends string, P = void> = P extends void
  ? { type: T }
  : { type: T; payload: P };

// 创建 Action Creator
function createAction<T extends string>(type: T): Action<T, void>;
function createAction<T extends string, P>(type: T, payload: P): Action<T, P>;
function createAction<T extends string, P>(type: T, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

const increment = createAction('INCREMENT');
const setUser = createAction('SET_USER', { name: 'Alice', age: 30 });

// Reducer
type AppAction = typeof increment | typeof setUser;

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'SET_USER':
      return { ...state, user: action.payload }; // payload 类型安全
    default:
      return state;
  }
}
```

---

## 关键要点

1. **泛型**实现类型参数化，避免重复定义和类型丢失
2. **泛型约束**使用 `extends` 限制类型参数的范围
3. **keyof** 约束确保属性访问的类型安全
4. **默认泛型参数**提供类型参数的默认值
5. **协变与逆变**描述类型兼容性的方向，函数参数是逆变的
6. 泛型在**通用组件、工具函数、状态管理**中广泛应用

---

## 参考资料

- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Deep Dive: Generics](https://basarat.gitbook.io/typescript/type-system/generics)
- [Covariance and Contravariance](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance)
