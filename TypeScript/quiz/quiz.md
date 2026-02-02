# TypeScript 面试题汇总

> 涵盖基础、进阶、高级、工程实践四个部分，共100题。

---

## 第一部分：类型系统基础（1-25题）

### 1. TypeScript 的类型擦除是什么？它对运行时有什么影响？

**答案**：类型擦除是指 TypeScript 编译为 JavaScript 时，所有类型注解和类型检查代码都会被移除，只保留纯 JavaScript 代码。

**影响**：
1. 类型信息在运行时不存在，不能使用 `instanceof` 检查接口
2. 类型断言不影响运行时行为
3. 需要使用 `typeof`、`instanceof` 等运行时检查

**易错点**：
```typescript
interface User { name: string; }
console.log(typeof User); // ❌ 运行时错误：User is not defined
```

---

### 2. interface 和 type 的主要区别是什么？如何选择？

**答案**：

**核心差异**：
- **interface**：支持声明合并、继承，性能略优
- **type**：支持联合类型、交叉类型、映射类型

**选择策略**：
- 对象形状、类、API契约 → interface
- 联合类型、工具类型 → type

**示例**：
```typescript
// interface 支持声明合并
interface Window {
  myApp: string;
}
interface Window {
  myVersion: number;
}

// type 支持联合类型
type Status = 'success' | 'error' | 'loading';
```

---

### 3. 以下代码的输出是什么？为什么？

```typescript
let a = 'hello';
const b = 'hello';

type A = typeof a;
type B = typeof b;
```

**答案**：
- `A` 的类型是 `string`
- `B` 的类型是 `"hello"`（字面量类型）

**原因**：
- `let` 声明的变量可以重新赋值，推断为宽泛类型 `string`
- `const` 声明的变量不可变，推断为字面量类型 `"hello"`

---

### 4. unknown 和 any 的区别是什么？什么时候使用 unknown？

**答案**：

**差异**：
- `any`：完全绕过类型检查，可以进行任意操作
- `unknown`：类型安全的顶类型，使用前必须收窄类型

**使用场景**：
```typescript
// ✓ 使用 unknown
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

const data = parseJSON('{"name":"Alice"}');
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log((data as any).name); // 收窄后使用
}
```

---

### 5. never 类型的应用场景有哪些？

**答案**：

**场景1：穷尽性检查**
```typescript
type Shape = 'circle' | 'square';
function getArea(shape: Shape) {
  switch (shape) {
    case 'circle': return 3.14;
    case 'square': return 4;
    default:
      const _: never = shape; // 确保所有情况已覆盖
  }
}
```

**场景2：函数永不返回**
```typescript
function throwError(msg: string): never {
  throw new Error(msg);
}
```

**场景3：过滤联合类型**
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

---

### 6. 什么是类型收窄？列举三种类型收窄的方式。

**答案**：类型收窄是指通过条件判断将联合类型缩小到更具体的类型。

**方式**：

**1. typeof 守卫**
```typescript
function print(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  }
}
```

**2. instanceof 守卫**
```typescript
if (value instanceof Date) {
  console.log(value.getTime());
}
```

**3. 自定义类型守卫**
```typescript
function isString(value: any): value is string {
  return typeof value === 'string';
}
```

---

### 7. 以下代码为什么报错？如何修复？

```typescript
interface User {
  name: string;
}

const user: User = { name: 'Alice', age: 30 };
```

**答案**：报错原因是对象字面量直接赋值时，TypeScript 会进行严格的**额外属性检查**，不允许多余属性 `age`。

**修复方案**：

**方案1：移除多余属性**
```typescript
const user: User = { name: 'Alice' };
```

**方案2：间接赋值**
```typescript
const temp = { name: 'Alice', age: 30 };
const user: User = temp;
```

**方案3：扩展接口**
```typescript
interface User {
  name: string;
  age?: number;
}
```

---

### 8. 元组和数组的区别是什么？

**答案**：

**数组**：元素类型相同，长度不固定
```typescript
const arr: number[] = [1, 2, 3, 4];
```

**元组**：元素类型可以不同，长度固定
```typescript
const tuple: [string, number] = ['Alice', 30];
tuple[0] = 'Bob'; // ✓
tuple[1] = 40; // ✓
tuple.push(50); // ⚠️ 编译通过，但不推荐
```

**易错点**：元组的越界访问检查较弱，运行时可能出错。

---

### 9. 什么是字面量类型？它有什么用途？

**答案**：字面量类型是指具体的值作为类型，而非宽泛的类型。

**用途**：

**1. 限定值的范围**
```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
function request(method: HttpMethod) {}
```

**2. 可辨识联合**
```typescript
interface Success { status: 'success'; data: any; }
interface Error { status: 'error'; error: string; }
type Result = Success | Error;
```

**3. 配置对象**
```typescript
const config = {
  env: 'production' as const,
  port: 3000
};
```

---

### 10. 索引签名的作用是什么？有什么局限性？

**答案**：

**作用**：允许对象具有动态属性。
```typescript
interface StringMap {
  [key: string]: string;
}
```

**局限性**：

**1. 降低类型安全**
```typescript
const map: StringMap = {};
console.log(map.nonExistent.toUpperCase()); // 编译通过，运行时错误
```

**2. 索引签名类型必须包含已知属性类型**
```typescript
interface Config {
  name: string;
  [key: string]: string | number; // 必须包含 string
}
```

---

### 11. 函数重载的实现方式是什么？

**答案**：TypeScript 通过多个重载签名 + 一个实现签名实现函数重载。

```typescript
// 重载签名
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;

// 实现签名
function format(value: string | number | boolean): string {
  return String(value);
}

const s1 = format('hello'); // s1: string
const s2 = format(123); // s2: string
```

**易错点**：实现签名不可调用，只能调用重载签名。

---

### 12. 什么是上下文类型推断？

**答案**：上下文类型推断是指 TypeScript 根据变量的使用上下文推断类型。

**示例**：
```typescript
window.addEventListener('click', (event) => {
  console.log(event.button); // event 推断为 MouseEvent
});

[1, 2, 3].map((item) => {
  return item.toFixed(2); // item 推断为 number
});
```

**优势**：减少冗余的类型注解。

---

### 13. as const 的作用是什么？

**答案**：`as const` 将对象或数组转为深度只读的字面量类型。

```typescript
const colors = ['red', 'green', 'blue'] as const;
// 类型：readonly ['red', 'green', 'blue']

type Color = typeof colors[number]; // 'red' | 'green' | 'blue'

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;
// config.apiUrl: 'https://api.example.com'（而非 string）
```

---

### 14. 非空断言操作符 ! 的风险是什么？

**答案**：`!` 告诉编译器值不为 `null` 或 `undefined`，但不进行运行时检查。

**风险**：
```typescript
const element = document.getElementById('non-existent')!;
element.innerHTML = 'Hello'; // ❌ 运行时错误：Cannot set property of null
```

**最佳实践**：
```typescript
const element = document.getElementById('app');
if (element) {
  element.innerHTML = 'Hello'; // ✓ 类型守卫
}
```

---

### 15. readonly 和 const 的区别是什么？

**答案**：

**const**：变量不可重新赋值
```typescript
const x = 10;
x = 20; // ❌
```

**readonly**：属性不可修改
```typescript
interface User {
  readonly id: number;
  name: string;
}
const user: User = { id: 1, name: 'Alice' };
user.id = 2; // ❌
user.name = 'Bob'; // ✓
```

**注意**：`readonly` 是浅层的，嵌套对象仍可修改。

---

### 16. 以下代码的输出是什么？

```typescript
type A = string & number;
```

**答案**：`A` 的类型是 `never`。

**原因**：交叉类型要求同时满足两个类型，但没有值既是 `string` 又是 `number`，所以结果为 `never`。

---

### 17. 联合类型和交叉类型的区别是什么？

**答案**：

**联合类型**：值是多种类型之一（或运算）
```typescript
type A = string | number;
let a: A = 'hello'; // ✓
let b: A = 123; // ✓
```

**交叉类型**：值同时满足多种类型（与运算）
```typescript
interface Person { name: string; }
interface Employee { employeeId: number; }
type Staff = Person & Employee;

const staff: Staff = { name: 'Alice', employeeId: 123 };
```

---

### 18. 可辨识联合的应用场景是什么？

**答案**：可辨识联合通过标签属性（如 `type`、`kind`）区分不同的联合成员，常用于状态机、错误处理。

```typescript
interface Loading {
  status: 'loading';
}
interface Success<T> {
  status: 'success';
  data: T;
}
interface Error {
  status: 'error';
  error: string;
}

type AsyncState<T> = Loading | Success<T> | Error;

function render<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'loading': return 'Loading...';
    case 'success': return state.data;
    case 'error': return state.error;
  }
}
```

---

### 19. 自定义类型守卫的语法是什么？

**答案**：使用 `is` 关键字定义类型谓词。

```typescript
function isString(value: any): value is string {
  return typeof value === 'string';
}

function process(value: string | number) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // value: string
  } else {
    console.log(value.toFixed(2)); // value: number
  }
}
```

---

### 20. 可选属性和 undefined 类型的区别是什么？

**答案**：

**可选属性**：可以省略
```typescript
interface A { value?: string; }
const a: A = {}; // ✓
```

**undefined 类型**：必须显式提供
```typescript
interface B { value: string | undefined; }
const b: B = {}; // ❌ 缺少 value
const b2: B = { value: undefined }; // ✓
```

---

### 21. 以下代码为什么报错？

```typescript
function getLength<T>(value: T): number {
  return value.length;
}
```

**答案**：`T` 没有约束，不能保证有 `length` 属性。

**修复**：
```typescript
interface HasLength {
  length: number;
}

function getLength<T extends HasLength>(value: T): number {
  return value.length;
}
```

---

### 22. 泛型的默认参数如何使用？

**答案**：
```typescript
interface Container<T = string> {
  value: T;
}

const c1: Container = { value: 'hello' }; // T 默认为 string
const c2: Container<number> = { value: 123 }; // 指定 T 为 number
```

---

### 23. keyof 的作用是什么？

**答案**：`keyof` 获取对象类型的所有键组成的联合类型。

```typescript
interface User {
  name: string;
  age: number;
}

type UserKeys = keyof User; // 'name' | 'age'

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
getProperty(user, 'name'); // ✓
getProperty(user, 'email'); // ❌
```

---

### 24. 类型推断的最佳通用类型是什么？

**答案**：当 TypeScript 需要从多个表达式推断类型时，会选择兼容所有表达式的最佳通用类型。

```typescript
let arr = [1, 2, 3]; // 推断为 number[]
let arr2 = [1, 'a']; // 推断为 (number | string)[]
let arr3 = [1, null]; // 推断为 (number | null)[]
```

**注意**：空数组推断为 `any[]`，需要显式标注。

---

### 25. 类型断言的两种语法是什么？推荐哪种？

**答案**：

**1. as 语法（推荐）**
```typescript
const value = JSON.parse('123') as number;
```

**2. 尖括号语法（不推荐，JSX 冲突）**
```typescript
const value = <number>JSON.parse('123');
```

**推荐 `as` 语法**，因为在 React JSX 中尖括号会冲突。

---

## 第二部分：类型系统进阶（26-50题）

### 26. 接口的声明合并是什么？

**答案**：多个同名接口会自动合并为一个接口。

```typescript
interface User {
  name: string;
}
interface User {
  age: number;
}

// 合并为 { name: string; age: number; }
const user: User = { name: 'Alice', age: 30 };
```

**应用**：扩展第三方库的类型。
```typescript
interface Window {
  myApp: { version: string; };
}
window.myApp.version; // ✓
```

---

### 27. 映射类型的语法是什么？

**答案**：
```typescript
type Mapped<T> = {
  [P in keyof T]: T[P];
};
```

**示例**：
```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

---

### 28. Pick 和 Omit 的实现原理是什么？

**答案**：

**Pick**：选取部分属性
```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

**Omit**：排除部分属性
```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

---

### 29. 条件类型的语法是什么？

**答案**：`T extends U ? X : Y`

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

---

### 30. infer 关键字的作用是什么？

**答案**：`infer` 在条件类型中推断类型。

**示例**：
```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { name: 'Alice', age: 30 };
}

type User = ReturnType<typeof getUser>; // { name: string; age: number; }
```

---

### 31. 模板字面量类型的应用场景是什么？

**答案**：字符串类型的模式匹配和组合。

```typescript
type HTTPMethod = 'GET' | 'POST';
type Endpoint = '/user' | '/post';
type API = `${HTTPMethod} ${Endpoint}`;
// 'GET /user' | 'GET /post' | 'POST /user' | 'POST /post'
```

---

### 32. 递归类型的限制是什么？

**答案**：TypeScript 限制递归深度为 50 层，超过会报错。

**解决**：限制递归深度或简化类型。
```typescript
type DeepReadonly<T, Depth extends number = 5> = Depth extends 0
  ? T
  : { readonly [P in keyof T]: DeepReadonly<T[P], Decrement<Depth>> };
```

---

### 33. 泛型的协变和逆变是什么？

**答案**：

**协变**：子类型可以赋值给父类型
```typescript
let animals: Animal[] = [];
let dogs: Dog[] = [];
animals = dogs; // ✓ 数组是协变的
```

**逆变**：父类型可以赋值给子类型（函数参数）
```typescript
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (animal) => {};
let handleDog: DogHandler = handleAnimal; // ✓ 参数是逆变的
```

---

### 34. 接口和类型别名在性能上有什么差异？

**答案**：接口性能略优，因为 TypeScript 编译器对接口有缓存优化。

**推荐**：在大型项目中，优先使用 `interface` 定义对象类型。

---

### 35. 如何实现深度 Readonly？

**答案**：
```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};
```

---

### 36. 如何提取 URL 路径参数的类型？

**答案**：
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

---

### 37. 类的类型和构造函数类型有什么区别？

**答案**：

**类的类型**：实例类型
```typescript
class User { name: string; }
const user: User = new User();
```

**构造函数类型**：`typeof Class`
```typescript
const UserClass: typeof User = User;
function createUser(Ctor: typeof User): User {
  return new Ctor();
}
```

---

### 38. private 和 protected 的区别是什么？

**答案**：

**private**：只能在类内部访问
**protected**：类内部和子类可以访问

```typescript
class Animal {
  private age: number;
  protected species: string;
}

class Dog extends Animal {
  bark() {
    console.log(this.species); // ✓
    console.log(this.age); // ❌
  }
}
```

---

### 39. 抽象类的作用是什么？

**答案**：抽象类定义子类必须实现的契约，不能直接实例化。

```typescript
abstract class Shape {
  abstract getArea(): number;
  
  printArea() {
    console.log(this.getArea());
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }
  
  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}
```

---

### 40. 参数属性的作用是什么？

**答案**：在构造函数参数中声明并初始化属性。

```typescript
class User {
  constructor(
    public name: string,
    private age: number
  ) {}
}

// 等价于
class User {
  public name: string;
  private age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
```

---

### 41. 如何为 JavaScript 库编写声明文件？

**答案**：
```typescript
// lodash.d.ts
declare module 'lodash' {
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T;
}
```

---

### 42. @types 包的作用是什么？

**答案**：`@types` 包为没有内置类型声明的 JavaScript 库提供类型支持。

```bash
npm install --save-dev @types/node
npm install --save-dev @types/react
```

**查找顺序**：
1. 库自带的类型（`package.json` 的 `types` 字段）
2. `@types` 包
3. 项目中的 `.d.ts` 文件

---

### 43. 全局类型声明如何编写？

**答案**：
```typescript
// global.d.ts
declare global {
  interface Window {
    myApp: { version: string; };
  }
}

export {};
```

---

### 44. 元组的剩余参数如何使用？

**答案**：
```typescript
type StringNumberBooleans = [string, number, ...boolean[]];

const a: StringNumberBooleans = ['hello', 1, true, false, true];
```

---

### 45. 如何实现元组的拼接？

**答案**：
```typescript
type Concat<T extends any[], U extends any[]> = [...T, ...U];

type Result = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]
```

---

### 46. 如何获取函数的参数类型？

**答案**：
```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number) {}

type Params = Parameters<typeof createUser>; // [string, number]
```

---

### 47. Record 类型的作用是什么？

**答案**：创建键值对类型。

```typescript
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type Roles = Record<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean; }
```

---

### 48. Exclude 和 Extract 的区别是什么？

**答案**：

**Exclude**：排除类型
```typescript
type Exclude<T, U> = T extends U ? never : T;
type A = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
```

**Extract**：提取类型
```typescript
type Extract<T, U> = T extends U ? T : never;
type B = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
```

---

### 49. 如何实现 NonNullable？

**答案**：
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null | undefined>; // string
```

---

### 50. 类型守卫在异步场景下的陷阱是什么？

**答案**：类型守卫在异步后可能失效。

```typescript
let value: string | number = 'hello';

if (typeof value === 'string') {
  console.log(value.toUpperCase()); // ✓
  
  setTimeout(() => {
    console.log(value.toUpperCase()); // ⚠️ 运行时可能已改为 number
  }, 1000);
}

value = 123; // 异步前改变
```

---

## 第三部分：高级类型系统（51-75题）

### 51. 如何实现深度 Partial？

**答案**：
```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
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

type PartialUser = DeepPartial<User>;
// { name?: string; profile?: { avatar?: string; settings?: { theme?: string } } }
```

**易错点**：需要递归处理嵌套对象。

---

### 52. 条件类型的分布式特性是什么？

**答案**：当条件类型作用于联合类型时，会自动分发到每个成员。

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// 分布式计算：ToArray<string> | ToArray<number>
// 结果：string[] | number[]（而非 (string | number)[]）
```

**阻止分布**：
```typescript
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
```

---

### 53. 如何提取 Promise 的值类型？

**答案**：
```typescript
type Awaited<T> = T extends Promise<infer U> ? U : T;

type A = Awaited<Promise<string>>; // string
type B = Awaited<number>; // number

// 嵌套 Promise
type AwaitedDeep<T> = T extends Promise<infer U>
  ? AwaitedDeep<U>
  : T;

type C = AwaitedDeep<Promise<Promise<string>>>; // string
```

---

### 54. Uppercase、Lowercase 等内置字符串类型如何使用？

**答案**：
```typescript
type Greeting = 'hello world';

type Upper = Uppercase<Greeting>; // 'HELLO WORLD'
type Lower = Lowercase<Greeting>; // 'hello world'
type Cap = Capitalize<Greeting>; // 'Hello world'
type Uncap = Uncapitalize<Greeting>; // 'hello world'

// 实际应用：生成 HTTP 方法
type Method = 'get' | 'post' | 'put' | 'delete';
type UpperMethod = Uppercase<Method>; // 'GET' | 'POST' | 'PUT' | 'DELETE'
```

---

### 55. 如何实现字符串的驼峰转蛇形？

**答案**：
```typescript
type CamelToSnake<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Uppercase<First>
      ? `_${Lowercase<First>}${CamelToSnake<Rest>}`
      : `${First}${CamelToSnake<Rest>}`
    : S;

type A = CamelToSnake<'userName'>; // 'user_name'
type B = CamelToSnake<'userId'>; // 'user_id'
```

**易错点**：需要处理首字母大写的情况。

---

### 56. 联合类型转交叉类型如何实现？

**答案**：
```typescript
type UnionToIntersection<U> = 
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

type A = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number }
```

**原理**：利用函数参数的逆变特性。

---

### 57. 如何获取元组的最后一个元素？

**答案**：
```typescript
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type A = Last<[1, 2, 3]>; // 3
type B = Last<[]>; // never
```

---

### 58. 如何实现元组的 Reverse？

**答案**：
```typescript
type Reverse<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : [];

type A = Reverse<[1, 2, 3]>; // [3, 2, 1]
```

---

### 59. strictFunctionTypes 的作用是什么？

**答案**：启用函数参数的严格逆变检查。

**默认行为（双向协变）**：
```typescript
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

let f1: (animal: Animal) => void;
let f2: (dog: Dog) => void;

f1 = f2; // ⚠️ 默认允许
f2 = f1; // ⚠️ 默认允许
```

**启用 strictFunctionTypes 后**：
```typescript
f1 = f2; // ❌ 严格模式报错
f2 = f1; // ✓ 逆变，允许
```

---

### 60. 类型兼容性的子类型关系如何判断？

**答案**：

**对象类型**：结构子类型，多余属性兼容
```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

let p2: Point2D = { x: 1, y: 2 };
let p3: Point3D = { x: 1, y: 2, z: 3 };

p2 = p3; // ✓ Point3D 是 Point2D 的子类型
p3 = p2; // ❌
```

**函数类型**：参数逆变，返回值协变
```typescript
type F1 = (x: Animal) => Dog;
type F2 = (x: Dog) => Animal;

let f1: F1;
let f2: F2;

f1 = f2; // ❌ 参数逆变不兼容
```

---

### 61. 双重断言的风险是什么？

**答案**：双重断言通过 `unknown` 绕过类型检查，极度危险。

```typescript
const value = 'hello' as unknown as number; // ⚠️ 编译通过
console.log(value.toFixed(2)); // ❌ 运行时错误
```

**应使用运行时校验**：
```typescript
function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

if (isNumber(value)) {
  console.log(value.toFixed(2)); // ✓
}
```

---

### 62. 索引访问类型的可选属性陷阱是什么？

**答案**：可选属性的索引访问会包含 `undefined`。

```typescript
interface Config {
  timeout?: number;
}

type Timeout = Config['timeout']; // number | undefined

// 需要使用 NonNullable 过滤
type RequiredTimeout = NonNullable<Config['timeout']>; // number
```

---

### 63. 类型递归的深度限制如何解决？

**答案**：

**问题**：TypeScript 限制递归深度为 50 层。

**解决方案 1**：限制递归深度
```typescript
type DeepReadonly<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P], Decrement<Depth>>
        : T[P];
    };

type Decrement<N extends number> = [-1, 0, 1, 2, 3, 4, 5][N];
```

**解决方案 2**：简化类型结构

---

### 64. 如何安全地解析 JSON？

**答案**：

**❌ 不安全**：
```typescript
function parseJSON<T>(json: string): T {
  return JSON.parse(json) as T; // 类型断言无运行时保证
}

const user = parseJSON<User>('{"name":"Alice"}');
console.log(user.age.toFixed()); // ❌ 运行时错误
```

**✓ 安全方案**：
```typescript
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
  console.log(data.age.toFixed()); // ✓
}
```

---

### 65. 循环依赖的类型定义如何处理？

**答案**：

**对象类型的循环引用**（✓）：
```typescript
interface Node {
  value: number;
  next: Node | null;
}
```

**类型别名的循环引用**（TypeScript 5.0+ 部分支持）：
```typescript
type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

---

### 66. 如何实现对象键名的驼峰转换？

**答案**：
```typescript
type CamelCase<S extends string> =
  S extends `${infer P}_${infer Q}${infer R}`
    ? `${P}${Uppercase<Q>}${CamelCase<R>}`
    : S;

type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K];
};

interface ApiUser {
  user_id: number;
  user_name: string;
  created_at: string;
}

type User = CamelCaseKeys<ApiUser>;
// { userId: number; userName: string; createdAt: string; }
```

---

### 67. 如何实现类型安全的事件系统？

**答案**：
```typescript
interface EventMap {
  click: { x: number; y: number };
  input: { value: string };
  submit: { data: FormData };
}

class EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    // 实现
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    // 实现
  }
}

const emitter = new EventEmitter<EventMap>();

emitter.on('click', (data) => {
  console.log(data.x, data.y); // data 类型为 { x: number; y: number }
});

emitter.emit('click', { x: 100, y: 200 }); // ✓
emitter.emit('click', { x: 100 }); // ❌ 缺少 y
```

---

### 68. 如何提取函数的 this 类型？

**答案**：
```typescript
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown;

function greet(this: { name: string }, greeting: string) {
  console.log(`${greeting}, ${this.name}`);
}

type ThisType = ThisParameterType<typeof greet>; // { name: string }
```

---

### 69. 模板字面量类型的联合组合如何工作？

**答案**：模板字面量类型会自动生成所有可能的组合。

```typescript
type Color = 'red' | 'green' | 'blue';
type Size = 'small' | 'large';

type ClassName = `${Color}-${Size}`;
// 'red-small' | 'red-large' | 'green-small' | 'green-large' | 'blue-small' | 'blue-large'

// 组合数量 = Color 的成员数 × Size 的成员数 = 3 × 2 = 6
```

**注意**：组合数量可能指数级增长，需谨慎使用。

---

### 70. 如何实现类型安全的路由系统？

**答案**：
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

function navigate<K extends keyof typeof routes>(
  route: K,
  params: RouteParams[K]
): void {
  // 实现
}

navigate('user', { id: '123' }); // ✓
navigate('post', { postId: '1', commentId: '2' }); // ✓
navigate('user', {}); // ❌ 缺少 id
```

---

### 71. any 的传播性是什么？如何避免？

**答案**：

**问题**：`any` 会传播到整个调用链。
```typescript
function processData(data: any) {
  return data.value; // 返回类型推断为 any
}

const result = processData({ value: 123 }); // result: any
const num = result.toFixed(2); // ❌ 运行时错误
```

**解决方案**：使用泛型
```typescript
function processData<T extends { value: any }>(data: T): T['value'] {
  return data.value;
}

const result2 = processData({ value: 123 }); // result2: number
const num2 = result2.toFixed(2); // ✓
```

---

### 72. 如何实现类型安全的深度取值函数？

**答案**：
```typescript
type PathValue<T, P extends string> =
  P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? PathValue<T[Key], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never;

function get<T, P extends string>(obj: T, path: P): PathValue<T, P> {
  const keys = path.split('.');
  let result: any = obj;
  for (const key of keys) {
    result = result[key];
  }
  return result;
}

interface User {
  profile: {
    settings: {
      theme: string;
    };
  };
}

const user: User = {
  profile: {
    settings: {
      theme: 'dark'
    }
  }
};

const theme = get(user, 'profile.settings.theme'); // theme: string
```

---

### 73. 工具类型 Required 如何移除可选修饰符？

**答案**：使用 `-?` 移除可选修饰符。

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P]; // -? 移除 ?
};

interface Config {
  timeout?: number;
  retries?: number;
}

type RequiredConfig = Required<Config>;
// { timeout: number; retries: number; }
```

---

### 74. 如何实现元组转联合类型？

**答案**：
```typescript
type TupleToUnion<T extends any[]> = T[number];

type A = TupleToUnion<[string, number, boolean]>; // string | number | boolean
type B = TupleToUnion<['a', 'b', 'c']>; // 'a' | 'b' | 'c'
```

**原理**：`T[number]` 获取元组所有索引的值类型的联合。

---

### 75. 类型体操的性能优化策略有哪些？

**答案**：

**1. 避免过度递归**
```typescript
// ❌ 性能差
type BadDeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? BadDeepReadonly<T[P]>
    : T[P];
};

// ✓ 限制递归深度
type DeepReadonly<T, Depth extends number = 3> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: DeepReadonly<T[P], Decrement<Depth>>;
    };
```

**2. 使用尾递归优化**
```typescript
type Reverse<T extends any[], Acc extends any[] = []> =
  T extends [infer First, ...infer Rest]
    ? Reverse<Rest, [First, ...Acc]>
    : Acc;
```

**3. 缓存类型结果**
```typescript
type CachedType<T> = T extends any ? { ... } : never;
```

---

## 第四部分：工程实践（76-100题）

### 76. tsconfig.json 中 strict 模式包含哪些选项？

**答案**：`"strict": true` 等价于启用以下所有选项：

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**推荐**：新项目启用 strict 模式，老项目逐步迁移。

---

### 77. moduleResolution 的 node 和 classic 有什么区别？

**答案**：

**node**（推荐）：模拟 Node.js 模块解析
- 查找 `node_modules`
- 支持 `package.json` 的 `main`/`types` 字段
- 支持目录模块（index.ts）

**classic**（遗留）：TypeScript 1.6 之前的默认策略
- 相对导入：查找相对路径
- 非相对导入：从当前目录向上查找

**配置**：
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

---

### 78. 如何为全局变量添加类型声明？

**答案**：
```typescript
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      init(): void;
    };
  }
  
  var ENV: 'development' | 'production';
}

export {};
```

**使用**：
```typescript
window.myApp.version; // ✓ 类型安全
console.log(ENV); // ✓
```

---

### 79. 第三方库缺少类型声明怎么办？

**答案**：

**方案 1**：安装 @types 包
```bash
npm install --save-dev @types/lodash
```

**方案 2**：编写最小声明
```typescript
// declarations.d.ts
declare module 'some-lib' {
  export function doSomething(arg: string): void;
}
```

**方案 3**：使用 any（不推荐）
```typescript
const lib = require('some-lib') as any;
```

---

### 80. paths 配置的作用是什么？

**答案**：配置路径别名，简化导入路径。

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

**使用**：
```typescript
import Button from '@components/Button';
import { formatDate } from '@utils/date';
```

**注意**：打包工具（Webpack/Vite）需要配置相同的别名。

---

### 81. React 函数组件的 Props 类型如何定义？

**答案**：
```typescript
interface ButtonProps {
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function Button({ type = 'primary', disabled, onClick, children }: ButtonProps) {
  return (
    <button
      className={`btn-${type}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 或使用 React.FC
const Button: React.FC<ButtonProps> = ({ type, disabled, onClick, children }) => {
  // 实现
};
```

---

### 82. React Hooks 的类型如何标注？

**答案**：

```typescript
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);

// useCallback
const handleClick = useCallback((event: React.MouseEvent) => {
  console.log(event);
}, []);

// useMemo
const memoizedValue = useMemo<number>(() => {
  return expensiveCalculation();
}, [dependency]);

// 自定义 Hook
function useAsync<T>(fn: () => Promise<T>): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 实现
  
  return { data, loading, error };
}
```

---

### 83. Vue 3 Composition API 的类型如何使用？

**答案**：
```typescript
import { ref, computed, onMounted, Ref } from 'vue';

interface User {
  id: number;
  name: string;
}

export default defineComponent({
  setup() {
    const user = ref<User | null>(null);
    const loading = ref<boolean>(false);
    
    const displayName = computed(() => {
      return user.value ? user.value.name : 'Guest';
    });
    
    async function fetchUser(id: number) {
      loading.value = true;
      try {
        const response = await fetch(`/api/user/${id}`);
        user.value = await response.json();
      } finally {
        loading.value = false;
      }
    }
    
    onMounted(() => {
      fetchUser(1);
    });
    
    return { user, loading, displayName, fetchUser };
  }
});
```

---

### 84. Redux Toolkit 的类型如何配置？

**答案**：
```typescript
import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
}

interface UserState {
  users: User[];
  loading: boolean;
}

const initialState: UserState = {
  users: [],
  loading: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    }
  }
});

const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
});

// 类型推导
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 类型安全的 Hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

### 85. 如何实现类型安全的表单验证？

**答案**：
```typescript
interface FormData {
  username: string;
  email: string;
  age: number;
}

type ValidationRule<T> = (value: T) => string | undefined;

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

function validate<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules<T>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const key in rules) {
    const rule = rules[key];
    if (rule) {
      const error = rule(data[key]);
      if (error) {
        errors[key] = error;
      }
    }
  }
  
  return errors;
}

// 使用
const formData: FormData = {
  username: 'ab',
  email: 'invalid',
  age: 15
};

const errors = validate(formData, {
  username: (v) => v.length < 3 ? 'Too short' : undefined,
  email: (v) => !v.includes('@') ? 'Invalid email' : undefined,
  age: (v) => v < 18 ? 'Must be 18+' : undefined
});
```

---

### 86. 如何从 JavaScript 迁移到 TypeScript？

**答案**：

**步骤 1**：配置 tsconfig.json
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noEmit": true
  }
}
```

**步骤 2**：逐个文件重命名 `.js` → `.ts`

**步骤 3**：逐步启用严格检查
```json
{
  "compilerOptions": {
    "noImplicitAny": true,  // 先启用
    "strictNullChecks": true  // 逐步启用其他
  }
}
```

**步骤 4**：添加类型注解
- 优先注解公共 API
- 内部函数依赖类型推断

---

### 87. skipLibCheck 的作用是什么？

**答案**：跳过 `.d.ts` 文件的类型检查，提升编译速度。

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**优势**：
- 编译速度提升 50% 以上
- 避免第三方库类型错误影响项目

**劣势**：
- 可能错过类型声明的错误

**推荐**：大型项目启用。

---

### 88. 项目引用（Project References）的应用场景是什么？

**答案**：适用于 monorepo 或大型项目的增量编译。

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "incremental": true
  }
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [
    { "path": "../core" }
  ]
}
```

**优势**：
- 增量编译
- 清晰的依赖关系
- 并行构建

---

### 89. 如何检查类型覆盖率？

**答案**：
```bash
# 安装 type-coverage
npm install --save-dev type-coverage

# 检查类型覆盖率
npx type-coverage

# 期望 95% 以上
npx type-coverage --at-least 95
```

**输出示例**：
```
2345 / 2500 95.00%
type-coverage success.
```

---

### 90. 如何测试类型定义？

**答案**：使用 `tsd` 进行类型测试。

```bash
npm install --save-dev tsd
```

```typescript
// types.test-d.ts
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

### 91. 泛型组件的最佳实践是什么？

**答案**：

**React 泛型组件**：
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// 使用
<List<User>
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

---

### 92. 如何避免过度类型体操？

**答案**：

**❌ 过度复杂**：
```typescript
type DeepReadonlyWithOptional<T, K extends keyof T = keyof T> = {
  readonly [P in K]: T[P] extends object
    ? DeepReadonlyWithOptional<T[P]>
    : T[P];
} & {
  readonly [P in Exclude<keyof T, K>]?: T[P];
};
```

**✓ 简单直接**：
```typescript
interface UserConfig {
  readonly name: string;
  readonly settings?: {
    readonly theme: string;
  };
}
```

**原则**：
- 优先简单类型定义
- 复杂类型仅用于框架/库
- 类型注释适度，避免冗余

---

### 93. 声明文件的三种类型是什么？

**答案**：

**1. 全局声明**（`declare global`）
```typescript
declare global {
  interface Window {
    myApp: string;
  }
}
export {};
```

**2. 模块声明**（`declare module`）
```typescript
declare module '*.svg' {
  const content: string;
  export default content;
}
```

**3. 命名空间声明**（`declare namespace`）
```typescript
declare namespace MyLib {
  function doSomething(): void;
}
```

---

### 94. 如何实现类型安全的配置对象？

**答案**：
```typescript
interface AppConfig {
  apiUrl: string;
  timeout: number;
  features: {
    darkMode: boolean;
    analytics: boolean;
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

// 类型安全的配置访问
function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return config[key];
}

const apiUrl = getConfig('apiUrl'); // string
const timeout = getConfig('timeout'); // number
```

---

### 95. 多重泛型约束如何实现？

**答案**：
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

// 使用
class MyClass {
  length = 10;
  print() {
    console.log('print');
  }
}

process(new MyClass()); // ✓
```

---

### 96. 如何处理事件处理器的类型？

**答案**：

**React 事件**：
```typescript
// 鼠标事件
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.value);
}

// 表单事件
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

// 输入事件
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value);
}

// 键盘事件
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    // 处理
  }
}
```

---

### 97. 类型断言 vs 类型守卫，如何选择？

**答案**：

**类型断言**：开发者手动保证类型
```typescript
const input = document.getElementById('username') as HTMLInputElement;
```

**类型守卫**：运行时检查 + 类型收窄
```typescript
function isHTMLInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === 'INPUT';
}

const element = document.getElementById('username');
if (element && isHTMLInputElement(element)) {
  console.log(element.value); // ✓ 类型安全
}
```

**选择**：
- 确定类型 → 类型断言
- 不确定类型 → 类型守卫

---

### 98. 如何实现类型安全的状态机？

**答案**：
```typescript
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

type Action =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: string }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH':
      return { status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', data: action.data };
    case 'ERROR':
      return { status: 'error', error: action.error };
    case 'RESET':
      return { status: 'idle' };
  }
}

function render(state: State) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data; // 类型安全访问 data
    case 'error':
      return state.error.message; // 类型安全访问 error
  }
}
```

---

### 99. 编译性能优化有哪些方法？

**答案**：

**1. 启用增量编译**
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  }
}
```

**2. 使用项目引用**
```json
{
  "references": [
    { "path": "../shared" }
  ]
}
```

**3. 跳过库检查**
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**4. 限制类型递归深度**

**5. 减少类型复杂度**

---

### 100. TypeScript 最佳实践总结

**答案**：

**类型设计**：
- 优先使用 `interface` 定义对象类型
- 使用 `type` 定义联合、交叉、工具类型
- 避免过度类型体操，简单优于复杂
- 启用 `strict` 模式

**代码组织**：
- 类型文件按功能模块划分
- 公共类型统一导出
- 避免循环依赖

**工程化**：
- 配置路径别名（`paths`）
- 使用项目引用优化大型项目
- 监控类型覆盖率（目标 95%+）

**迁移策略**：
- 从 JavaScript 渐进迁移
- 逐步启用严格检查
- 优先注解公共 API

**性能优化**：
- 启用增量编译
- 使用 `skipLibCheck`
- 限制递归深度

**实践原则**：
- 类型安全优先，但不过度
- 结合运行时校验关键数据
- 类型即文档，保持清晰

---

## 总结

本面试题汇总共 100 题，涵盖：
- **基础**（1-25）：类型系统基础、类型注解、类型推断
- **进阶**（26-50）：联合类型、泛型、类、接口、映射类型
- **高级**（51-75）：高级类型操作、条件类型、递归类型、类型体操
- **工程**（76-100）：配置、框架集成、最佳实践、性能优化

建议按顺序学习，结合教学内容深入理解每个知识点。祝学习顺利！

