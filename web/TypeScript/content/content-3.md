# 3. 类型推断与类型断言

## 概述

TypeScript 的类型推断能力是其核心优势之一。理解推断机制，可以减少冗余的类型注解，提升开发效率。

---

## 3.1 类型推断的工作原理

### 基础推断：从值到类型

```typescript
// 根据初始值推断
let x = 3; // 推断为 number
let name = 'Alice'; // 推断为 string
let isActive = true; // 推断为 boolean

// 数组推断
let arr = [1, 2, 3]; // 推断为 number[]
let mixed = [1, 'a']; // 推断为 (number | string)[]
```

### 函数返回值推断

```typescript
function add(a: number, b: number) {
  return a + b; // 推断返回值为 number
}

// 递归函数建议显式标注
function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
```

---

## 3.2 最佳通用类型（Best Common Type）

### 联合类型的推断

```typescript
let arr = [1, null]; // 推断为 (number | null)[]
let arr2 = [1, 'a', true]; // 推断为 (number | string | boolean)[]
```

### 空数组的推断

```typescript
let arr = []; // 推断为 any[]
arr.push(1);
arr.push('a'); // 两种类型都可以

// 显式标注避免 any
let arr2: number[] = [];
```

### 对象数组的推断

```typescript
class Animal { name: string; }
class Dog extends Animal { breed: string; }
class Cat extends Animal { meow(): void {} }

let animals = [new Dog(), new Cat()]; // 推断为 (Dog | Cat)[]，而非 Animal[]

// 显式标注基类
let animals2: Animal[] = [new Dog(), new Cat()];
```

---

## 3.3 上下文类型推断（Contextual Typing）

### 函数参数的推断

```typescript
// 回调函数参数类型由上下文推断
window.addEventListener('click', (event) => {
  console.log(event.button); // event 推断为 MouseEvent
});

[1, 2, 3].map((item) => {
  return item.toFixed(2); // item 推断为 number
});
```

### 对象字面量的推断

```typescript
interface Config {
  timeout: number;
  callback: (error: Error | null) => void;
}

const config: Config = {
  timeout: 1000,
  callback: (error) => { // error 推断为 Error | null
    if (error) console.log(error.message);
  }
};
```

---

## 3.4 类型断言

### as 语法

```typescript
// 告诉编译器"我比你更懂"
const value = JSON.parse('123') as number;

// DOM 元素的类型断言
const input = document.querySelector('#username') as HTMLInputElement;
console.log(input.value);
```

### 尖括号语法（不推荐）

```typescript
// 在 JSX 中会冲突
const value = <number>JSON.parse('123');
```

### 双重断言（极度不推荐）

```typescript
const value = 'hello' as unknown as number; // ⚠️ 危险操作
```

### 类型断言 vs 类型注解

```typescript
// 类型注解：声明变量类型，编译器会检查
let value: number = 'hello'; // ❌ 类型不匹配

// 类型断言：绕过类型检查，由开发者保证正确性
let value2 = 'hello' as number; // ⚠️ 编译通过，运行时错误
```

---

## 3.5 as const：字面量类型的固化

### 普通对象的类型推断

```typescript
const user = {
  name: 'Alice',
  age: 30
};
// 推断为 { name: string; age: number }

user.name = 'Bob'; // ✓ 可修改
```

### 使用 as const

```typescript
const user = {
  name: 'Alice',
  age: 30
} as const;
// 推断为 { readonly name: 'Alice'; readonly age: 30 }

user.name = 'Bob'; // ❌ 只读属性
```

### 数组的 as const

```typescript
const colors = ['red', 'green', 'blue'];
// 推断为 string[]

const colors2 = ['red', 'green', 'blue'] as const;
// 推断为 readonly ['red', 'green', 'blue']

type Color = typeof colors2[number]; // 'red' | 'green' | 'blue'
```

---

## 3.6 非空断言操作符

### ! 后缀

```typescript
function process(value: string | null) {
  console.log(value!.toUpperCase()); // 断言 value 不为 null
}

// 常见场景：DOM 查询
const element = document.getElementById('app')!; // 断言元素存在
element.innerHTML = 'Hello';
```

**风险**：运行时 `null` 或 `undefined` 会导致错误

```typescript
const element = document.getElementById('non-existent')!;
element.innerHTML = 'Hello'; // ❌ 运行时错误：Cannot set property of null
```

---

## 深入一点

### 类型推断的限制

**1. 循环引用无法推断**

```typescript
let x = y; // ❌ 无法推断 y
let y = x; // ❌ 无法推断 x
```

**2. 递归类型需要显式标注**

```typescript
// ❌ 无法推断返回类型
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o[k], obj);
}

// ✓ 显式标注
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o[k], obj);
}
```

### 类型断言的安全边界

TypeScript 只允许"合理的"类型断言：

```typescript
const value: string = 'hello';
const num = value as number; // ❌ string 和 number 没有重叠

// 通过 unknown 绕过（不推荐）
const num2 = value as unknown as number; // ⚠️ 危险
```

---

## 前端工程实践

### 场景 1：API 响应的类型断言

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/user/${id}`);
  const data = await res.json();
  return data as User; // 断言响应符合 User 类型
}

// 更安全的做法：运行时校验
function validateUser(data: any): User {
  if (typeof data.id !== 'number' || typeof data.name !== 'string') {
    throw new Error('Invalid user data');
  }
  return data as User;
}
```

### 场景 2：事件对象的类型推断

```typescript
// ✓ 利用上下文推断
<button onClick={(e) => {
  console.log(e.currentTarget.value); // e 推断为 React.MouseEvent
}} />

// ❌ 失去上下文推断
const handleClick = (e) => { // e 推断为 any
  console.log(e.currentTarget.value);
};
<button onClick={handleClick} />

// ✓ 显式标注
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.value);
};
```

### 场景 3：常量配置的 as const

```typescript
// 路由配置
const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact'
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES]; // '/' | '/about' | '/contact'

function navigate(route: Route) {
  window.location.href = route;
}

navigate(ROUTES.HOME); // ✓
navigate('/unknown'); // ❌ 类型错误
```

---

## 关键要点

1. **类型推断**能减少冗余注解，但复杂场景仍需显式标注
2. **最佳通用类型**会推断联合类型，空数组推断为 `any[]`
3. **上下文推断**根据使用场景推断类型，如回调函数参数
4. **类型断言**是逃生舱，应优先使用类型守卫和运行时校验
5. **as const** 将对象和数组转为深度只读的字面量类型
6. **非空断言** `!` 绕过 null 检查，使用时需确保运行时安全

---

## 参考资料

- [TypeScript Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Handbook: Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
