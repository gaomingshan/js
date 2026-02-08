# 7. 类与面向对象类型

## 概述

TypeScript 对 ES6 类进行了类型扩展，提供了访问修饰符、抽象类、装饰器等特性。理解类的类型系统，对 OOP 风格的代码至关重要。

---

## 7.1 类的类型：实例类型 vs 构造函数类型

### 类的双重性质

```typescript
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// User 既是类型（实例类型），也是值（构造函数）
const user: User = new User('Alice'); // User 作为类型
const UserClass = User; // User 作为值
```

### 构造函数类型

```typescript
// typeof Class 获取构造函数类型
type UserConstructor = typeof User;

function createUser(Ctor: typeof User, name: string): User {
  return new Ctor(name);
}

// 使用接口描述构造函数
interface UserConstructor {
  new (name: string): User;
}

function createUser2(Ctor: UserConstructor, name: string): User {
  return new Ctor(name);
}
```

---

## 7.2 访问修饰符

### public、private、protected

```typescript
class Animal {
  public name: string; // 默认 public
  private age: number; // 仅类内部访问
  protected species: string; // 类内部和子类访问

  constructor(name: string, age: number, species: string) {
    this.name = name;
    this.age = age;
    this.species = species;
  }

  public getAge(): number {
    return this.age; // ✓ 类内部可访问
  }
}

class Dog extends Animal {
  bark() {
    console.log(this.species); // ✓ 子类可访问 protected
    console.log(this.age); // ❌ 子类不能访问 private
  }
}

const dog = new Dog('Buddy', 3, 'Canine');
console.log(dog.name); // ✓
console.log(dog.age); // ❌ 外部不能访问 private
```

### readonly 修饰符

```typescript
class User {
  readonly id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id; // ✓ 构造函数中可赋值
    this.name = name;
  }

  updateId(id: number) {
    this.id = id; // ❌ 只读属性
  }
}
```

### 参数属性

```typescript
// 简化写法：在构造函数参数中声明并初始化属性
class User {
  constructor(
    public name: string,
    private age: number,
    readonly id: number
  ) {}
}

// 等价于
class User {
  public name: string;
  private age: number;
  readonly id: number;

  constructor(name: string, age: number, id: number) {
    this.name = name;
    this.age = age;
    this.id = id;
  }
}
```

---

## 7.3 抽象类与抽象成员

### 抽象类

```typescript
abstract class Shape {
  abstract getArea(): number; // 抽象方法，子类必须实现

  printArea() {
    console.log(`Area: ${this.getArea()}`);
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

const shape = new Shape(); // ❌ 不能实例化抽象类
const circle = new Circle(5); // ✓
circle.printArea();
```

### 抽象属性

```typescript
abstract class Animal {
  abstract name: string;

  constructor() {}

  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

class Dog extends Animal {
  name = 'Dog'; // 必须实现抽象属性
}
```

---

## 7.4 类的继承与多态

### 继承

```typescript
class Animal {
  constructor(public name: string) {}

  move(distance: number) {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

class Dog extends Animal {
  bark() {
    console.log('Woof!');
  }
}

const dog = new Dog('Buddy');
dog.move(10); // 继承自 Animal
dog.bark(); // Dog 特有方法
```

### 方法重写

```typescript
class Animal {
  move() {
    console.log('Moving...');
  }
}

class Bird extends Animal {
  move() {
    console.log('Flying...');
  }
}

const bird = new Bird();
bird.move(); // Flying...
```

### super 调用

```typescript
class Animal {
  constructor(public name: string) {}

  greet() {
    console.log(`I'm ${this.name}`);
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name); // 调用父类构造函数
  }

  greet() {
    super.greet(); // 调用父类方法
    console.log(`I'm a ${this.breed}`);
  }
}
```

---

## 7.5 装饰器的类型系统（实验性）

### 类装饰器

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
```

### 方法装饰器

```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2); // 打印：Calling add with [1, 2]
```

**注意**：装饰器是实验性特性，需要在 `tsconfig.json` 中启用 `experimentalDecorators`。

---

## 深入一点

### 类的结构类型兼容性

```typescript
class Point {
  x: number;
  y: number;
}

class Vector {
  x: number;
  y: number;
}

const point: Point = new Vector(); // ✓ 结构相同，兼容

// 但 private/protected 会影响兼容性
class Point2 {
  private x: number;
  y: number;
}

class Vector2 {
  private x: number;
  y: number;
}

const point2: Point2 = new Vector2(); // ❌ private 成员来源不同
```

### 类作为接口

```typescript
class Point {
  x: number;
  y: number;
}

// 类可以作为接口使用
interface Point3D extends Point {
  z: number;
}

const point: Point3D = { x: 1, y: 2, z: 3 };
```

---

## 前端工程实践

### 场景 1：React 类组件

```typescript
interface Props {
  name: string;
}

interface State {
  count: number;
}

class Counter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>{this.props.name}: {this.state.count}</p>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}
```

### 场景 2：服务类设计

```typescript
abstract class BaseService<T> {
  constructor(protected apiUrl: string) {}

  abstract parse(data: any): T;

  async fetchOne(id: number): Promise<T> {
    const res = await fetch(`${this.apiUrl}/${id}`);
    const data = await res.json();
    return this.parse(data);
  }

  async fetchAll(): Promise<T[]> {
    const res = await fetch(this.apiUrl);
    const data = await res.json();
    return data.map((item: any) => this.parse(item));
  }
}

interface User {
  id: number;
  name: string;
}

class UserService extends BaseService<User> {
  constructor() {
    super('/api/users');
  }

  parse(data: any): User {
    return {
      id: data.id,
      name: data.name
    };
  }
}
```

### 场景 3：单例模式

```typescript
class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, any> = {};

  private constructor() {} // 私有构造函数

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }

  get(key: string): any {
    return this.config[key];
  }
}

const config1 = ConfigManager.getInstance();
const config2 = ConfigManager.getInstance();
console.log(config1 === config2); // true
```

---

## 关键要点

1. **类既是类型也是值**，`typeof Class` 获取构造函数类型
2. **访问修饰符**控制成员的可见性，`private`/`protected` 影响类型兼容性
3. **抽象类**不能实例化，用于定义子类的契约
4. **readonly** 修饰符限制属性只能在声明或构造函数中赋值
5. **参数属性**简化构造函数参数的声明和初始化
6. **装饰器**是实验性特性，用于元编程

---

## 参考资料

- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
