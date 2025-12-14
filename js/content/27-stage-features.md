# 各阶段特性概览

## 概述

了解各阶段的提案，可以提前掌握 JavaScript 的未来方向。

---

## 一、Stage 4（已完成）

这些特性已经完成，将包含在 ECMAScript 标准中。

### 1.1 ES2022

```js
// Top-level await
const data = await fetch('/api').then(r => r.json());

// Private class fields
class Counter {
  #count = 0;
  increment() { this.#count++; }
}

// Class static blocks
class C {
  static {
    // 静态初始化代码
  }
}

// Error cause
throw new Error('Failed', { cause: originalError });

// .at() 方法
[1, 2, 3].at(-1);  // 3
```

### 1.2 ES2021

```js
// Logical assignment operators
x ??= 10;
x ||= 10;
x &&= 10;

// Numeric separators
const billion = 1_000_000_000;

// String.prototype.replaceAll
'aabbcc'.replaceAll('b', 'x');  // "aaxxcc"

// Promise.any
const first = await Promise.any([p1, p2, p3]);
```

### 1.3 ES2020

```js
// Optional chaining
const city = user?.profile?.address?.city;

// Nullish coalescing
const count = value ?? 0;

// BigInt
const bigNum = 9007199254740991n;

// globalThis
console.log(globalThis);

// Promise.allSettled
const results = await Promise.allSettled([p1, p2, p3]);

// String.prototype.matchAll
const matches = str.matchAll(/pattern/g);
```

---

## 二、Stage 3（候选）

这些特性接近完成，语法基本稳定。

### 2.1 Temporal API

```js
// 新的日期时间 API（替代 Date）
const now = Temporal.Now.plainDateISO();
const date = Temporal.PlainDate.from('2024-01-01');

const duration = Temporal.Duration.from({
  hours: 2,
  minutes: 30
});

const later = now.add(duration);
```

### 2.2 Array Grouping

```js
// Array.prototype.groupBy
const grouped = array.groupBy(item => item.category);

// 示例
const products = [
  { name: 'Apple', category: 'fruit' },
  { name: 'Carrot', category: 'vegetable' },
  { name: 'Banana', category: 'fruit' }
];

const byCategory = products.groupBy(p => p.category);
// {
//   fruit: [{ name: 'Apple', ... }, { name: 'Banana', ... }],
//   vegetable: [{ name: 'Carrot', ... }]
// }
```

### 2.3 Import Assertions

```js
// JSON 模块导入
import json from './data.json' assert { type: 'json' };

// CSS 模块导入
import styles from './styles.css' assert { type: 'css' };
```

---

## 三、Stage 2（草案）

这些特性有初步规范，但可能还会变化。

### 3.1 Decorators

```js
// 装饰器（语法可能变化）
@sealed
class MyClass {
  @readonly
  name = 'Alice';

  @memoize
  expensiveMethod() {
    // ...
  }
}

// 装饰器函数示例
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}
```

### 3.2 Record & Tuple

```js
// 不可变数据结构
const record = #{ x: 1, y: 2 };
const tuple = #[1, 2, 3];

// 深度不可变
const nested = #{
  user: #{
    name: 'Alice',
    scores: #[95, 87, 92]
  }
};

// 结构相等
#{ x: 1 } === #{ x: 1 };  // true
#[1, 2] === #[1, 2];      // true
```

### 3.3 Pipeline Operator

```js
// 管道操作符
const result = value
  |> double
  |> addOne
  |> square;

// 等价于
const result = square(addOne(double(value)));

// 实际示例
const processData = data
  |> JSON.parse
  |> validateData
  |> transformData
  |> saveToDatabase;
```

---

## 四、Stage 1（提案）

这些特性处于早期阶段，语法可能大幅变化。

### 4.1 Pattern Matching

```js
// 模式匹配
const result = match (value) {
  when ({ type: 'circle', radius }) => Math.PI * radius ** 2,
  when ({ type: 'square', side }) => side ** 2,
  when ({ type: 'rectangle', width, height }) => width * height,
  default => 0
};

// 多种模式
const classify = match (x) {
  when (0) => 'zero',
  when (x if x < 0) => 'negative',
  when (x if x > 0) => 'positive',
  default => 'unknown'
};
```

### 4.2 Do Expressions

```js
// do 表达式
const x = do {
  if (condition) {
    'yes';
  } else {
    'no';
  }
};

// JSX 中使用
<div>
  {do {
    if (loading) {
      <Spinner />;
    } else if (error) {
      <Error />;
    } else {
      <Content data={data} />;
    }
  }}
</div>
```

### 4.3 Optional Chaining Assignment

```js
// 可选链赋值（提案）
obj?.prop = value;
obj?.[key] = value;

// 等价于
if (obj != null) {
  obj.prop = value;
}
```

---

## 五、如何试用新特性

### 5.1 使用 Babel

```js
// .babelrc
{
  "presets": ["@babel/preset-env"],
  "plugins": [
    "@babel/plugin-proposal-decorators",
    "@babel/plugin-proposal-pipeline-operator"
  ]
}
```

### 5.2 使用 TypeScript

```js
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "target": "ES2022"
  }
}
```

### 5.3 浏览器标志

某些浏览器允许通过标志启用实验性特性：

- Chrome: `chrome://flags`
- Firefox: `about:config`

---

## 六、最佳实践

1. **关注 Stage 3+**：这些特性相对稳定。
2. **谨慎使用 Stage 2-**：语法可能变化，不建议生产使用。
3. **使用转译工具**：Babel、TypeScript 等。
4. **渐进式采用**：优先使用标准化的特性。
5. **跟踪提案状态**：定期查看 TC39 proposals。

---

## 参考资料

- [TC39 Proposals](https://github.com/tc39/proposals)
- [Babel - Plugins](https://babeljs.io/docs/en/plugins)
- [Can I Use](https://caniuse.com/)
