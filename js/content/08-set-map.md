# Set 与 Map

## 概述

ES6 引入 `Set` 与 `Map` 两种集合结构：

- `Set`：唯一值集合
- `Map`：键值对集合（键可以是任意类型）

它们的关键优势是：语义清晰、可迭代、并且在“频繁增删查”场景通常比对象/数组更合适。

---

## 一、Set

### 1.1 唯一性：SameValueZero

Set 使用 **SameValueZero** 判断相等：

- `NaN` 等于 `NaN`
- `+0` 与 `-0` 视为相等

```js
new Set([NaN, NaN]).size; // 1
```

### 1.2 常用 API

- `add/has/delete/clear`
- `size`

### 1.3 典型用途

- 去重：`[...new Set(arr)]`
- membership test：`set.has(x)`（比 `arr.includes` 更适合大集合）

> **注意**
>
> 对象在 Set 中按引用判断：`{}` 与 `{}` 永远不相等。

---

## 二、WeakSet

- 只能存对象
- 弱引用：不阻止对象被 GC
- 不可遍历

适合：

- 给对象打“标记”
- 避免集合导致的内存泄漏

---

## 三、Map

### 3.1 Map vs Object（你应该怎么选）

- **键类型**：Map 支持任意键；Object 主要是字符串/Symbol
- **size**：Map 有 `size`
- **原型污染风险**：Object 可能被 `__proto__` 等影响；Map 更“干净”
- **迭代**：Map 天然可迭代，按插入顺序

### 3.2 典型用途

- 计数器（字符统计、频次统计）
- 缓存（键是对象/函数）

```js
const cache = new Map();
const key = { id: 1 };
cache.set(key, 'value');
cache.get(key); // 'value'
```

---

## 四、WeakMap

- 键必须是对象
- 弱引用键，不可遍历

典型用途：

- “私有数据”存储（比约定 `_x` 更安全，且不易泄漏）
- DOM 节点附加数据（节点移除后能被回收）

```js
const priv = new WeakMap();
class Person {
  constructor(name) {
    priv.set(this, { name });
  }
  getName() {
    return priv.get(this).name;
  }
}
```

---

## 五、最佳实践

1. **大集合的存在性判断**优先 Set/Map。
2. 与外部系统交互（JSON）优先 Object（Map 需转换）。
3. 需要避免内存泄漏时考虑 WeakMap/WeakSet。

---

## 参考资料

- [MDN - Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN - Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [ECMA-262 - Set Objects](https://tc39.es/ecma262/#sec-set-objects)
- [ECMA-262 - Map Objects](https://tc39.es/ecma262/#sec-map-objects)
