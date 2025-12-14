# 扩展运算符与剩余参数

## 概述

扩展运算符（Spread）和剩余参数（Rest）使用相同的语法（`...`），但作用相反。

理解扩展运算符与剩余参数的关键在于：

- **扩展运算符**：将数组/对象"展开"为独立元素
- **剩余参数**：将多个元素"收集"为数组
- **迭代器协议**：数组扩展基于迭代器

---

## 一、扩展运算符（Spread）

### 1.1 数组扩展

```js
// 基本用法
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
// [1, 2, 3, 4, 5]

// 等价于
const arr3 = arr1.concat([4, 5]);

// 合并数组
const a = [1, 2];
const b = [3, 4];
const c = [...a, ...b];  // [1, 2, 3, 4]
```

### 1.2 对象扩展

```js
// 对象扩展
const obj1 = { x: 1, y: 2 };
const obj2 = { ...obj1, z: 3 };
// { x: 1, y: 2, z: 3 }

// 等价于
const obj3 = Object.assign({}, obj1, { z: 3 });

// ⚠️ 浅拷贝
const original = { a: 1, b: { c: 2 } };
const copy = { ...original };
copy.a = 10;
copy.b.c = 20;

console.log(original.a);    // 1（不受影响）
console.log(original.b.c);  // 20（受影响！）
```

### 1.3 函数调用

```js
function sum(a, b, c) {
  return a + b + c;
}

const numbers = [1, 2, 3];
sum(...numbers);  // 6

// 等价于
sum.apply(null, numbers);
```

---

## 二、剩余参数（Rest）

### 2.1 函数参数

```js
// 收集剩余参数
function sum(...args) {
  return args.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4);  // 10

// args 是真正的数组
console.log(Array.isArray(args));  // true

// vs arguments
function oldWay() {
  // arguments 是类数组对象
  const arr = Array.prototype.slice.call(arguments);
  return arr.reduce((a, b) => a + b, 0);
}
```

### 2.2 解构中的剩余

```js
// 数组解构
const [first, ...rest] = [1, 2, 3, 4, 5];
// first = 1, rest = [2, 3, 4, 5]

// 对象解构
const { x, ...others } = { x: 1, y: 2, z: 3 };
// x = 1, others = { y: 2, z: 3 }
```

---

## 三、底层实现

### 3.1 迭代器协议

```js
// 扩展运算符基于迭代器
const arr = [1, 2, 3];
const spread = [...arr];

// 等价于
const spread2 = [];
for (const item of arr) {
  spread2.push(item);
}

// 自定义可迭代对象
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

const arr = [...range];  // [1, 2, 3, 4, 5]
```

### 3.2 对象扩展实现

```js
// 对象扩展的简化实现
function spreadObject(target, ...sources) {
  for (const source of sources) {
    // 只复制可枚举的自有属性
    for (const key of Object.keys(source)) {
      target[key] = source[key];
    }
  }
  return target;
}

const obj = spreadObject({}, { a: 1 }, { b: 2 });
// { a: 1, b: 2 }
```

---

## 四、实际应用

### 4.1 数组操作

```js
// 1. 数组复制
const original = [1, 2, 3];
const copy = [...original];

// 2. 数组合并
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2];

// 3. 数组去重
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)];  // [1, 2, 3, 4]

// 4. 字符串转数组
const str = 'hello';
const chars = [...str];  // ['h', 'e', 'l', 'l', 'o']

// 5. 查找最大/最小值
const numbers = [1, 5, 3, 9, 2];
const max = Math.max(...numbers);  // 9
const min = Math.min(...numbers);  // 1
```

### 4.2 对象操作

```js
// 1. 对象复制
const obj = { a: 1, b: 2 };
const copy = { ...obj };

// 2. 对象合并（后面的覆盖前面的）
const defaults = { x: 0, y: 0 };
const options = { x: 10 };
const config = { ...defaults, ...options };
// { x: 10, y: 0 }

// 3. 添加/修改属性
const user = { name: 'Alice', age: 25 };
const updated = { ...user, age: 26, city: 'Beijing' };

// 4. 删除属性（配合解构）
const { password, ...publicInfo } = {
  name: 'Alice',
  password: 'secret',
  email: 'alice@example.com'
};
// publicInfo = { name: 'Alice', email: 'alice@example.com' }
```

### 4.3 函数参数

```js
// 1. 可变参数函数
function log(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}

log('INFO', 'User', 'logged in');
// [INFO] User logged in

// 2. 参数转发
function wrapper(...args) {
  return originalFunction(...args);
}

// 3. 部分应用
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

const add = (a, b, c) => a + b + c;
const add5 = partial(add, 5);
add5(3, 2);  // 10
```

---

## 五、性能考虑

### 5.1 扩展运算符性能

```js
// 大数组扩展可能较慢
const largeArray = new Array(1000000).fill(0);

// 慢
console.time('spread');
const copy1 = [...largeArray];
console.timeEnd('spread');

// 快
console.time('slice');
const copy2 = largeArray.slice();
console.timeEnd('slice');

// 建议：大数组用 slice() 或 Array.from()
```

### 5.2 对象扩展性能

```js
// 对象扩展 vs Object.assign
const obj = { a: 1, b: 2, c: 3 };

console.time('spread');
for (let i = 0; i < 100000; i++) {
  const copy = { ...obj };
}
console.timeEnd('spread');

console.time('assign');
for (let i = 0; i < 100000; i++) {
  const copy = Object.assign({}, obj);
}
console.timeEnd('assign');

// 性能相近，但 spread 更简洁
```

---

## 六、注意事项

### 6.1 浅拷贝

```js
// 扩展运算符只做浅拷贝
const obj = {
  name: 'Alice',
  address: { city: 'Beijing' }
};

const copy = { ...obj };
copy.address.city = 'Shanghai';

console.log(obj.address.city);  // 'Shanghai'（受影响！）

// 深拷贝需要其他方法
const deepCopy = JSON.parse(JSON.stringify(obj));
// 或使用 structuredClone()
const deepCopy2 = structuredClone(obj);
```

### 6.2 剩余参数限制

```js
// ❌ 剩余参数必须是最后一个参数
// function fn(a, ...rest, b) {}

// ✅ 正确
function fn(a, b, ...rest) {}

// ❌ 只能有一个剩余参数
// function fn(...rest1, ...rest2) {}
```

---

## 七、最佳实践

1. **优先使用扩展运算符**：代码更简洁。
2. **注意浅拷贝**：嵌套对象需要深拷贝。
3. **性能敏感场景**：大数组考虑 `slice()`。
4. **剩余参数代替 arguments**：更现代、更清晰。
5. **合理使用**：不要过度使用扩展运算符。

---

## 参考资料

- [ECMAScript - Spread Syntax](https://tc39.es/ecma262/#sec-array-initializer)
- [MDN - 扩展语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN - 剩余参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/rest_parameters)
