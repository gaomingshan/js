# 可选链与空值合并

## 概述

可选链（`?.`）和空值合并（`??`）是 ES2020 引入的新特性，简化了处理 `null`/`undefined` 的代码。

理解可选链与空值合并的关键在于：

- **可选链（`?.`）**：安全访问可能不存在的属性
- **空值合并（`??`）**：只对 `null`/`undefined` 提供默认值
- **短路求值**：遇到 `null`/`undefined` 立即返回

---

## 一、可选链（Optional Chaining）

### 1.1 基本用法

```js
// ❌ 传统方式
if (user && user.profile && user.profile.name) {
  console.log(user.profile.name);
}

// ✅ 可选链
console.log(user?.profile?.name);
```

### 1.2 三种形式

```js
// 1. 属性访问
obj?.prop

// 2. 计算属性
obj?.[expr]

// 3. 函数调用
func?.()
```

### 1.3 详细示例

```js
const user = {
  profile: {
    name: 'Alice',
    getEmail() {
      return 'alice@example.com';
    }
  }
};

// 属性访问
user?.profile?.name;  // "Alice"
user?.profile?.age;   // undefined
user?.settings?.theme;  // undefined

// 计算属性
const key = 'name';
user?.profile?.[key];  // "Alice"

// 方法调用
user?.profile?.getEmail?.();  // "alice@example.com"
user?.profile?.getPhone?.();  // undefined

// 数组元素访问
const arr = [1, 2, 3];
arr?.[0];  // 1
arr?.[10];  // undefined

const nullArr = null;
nullArr?.[0];  // undefined（不抛出错误）
```

### 1.4 短路求值

```js
const user = null;

// 可选链短路：遇到 null/undefined 立即返回
const result = user?.profile?.name;
// result = undefined

// 不会继续访问后续属性
let count = 0;
const value = user?.profile?.[count++];
console.log(count);  // 0（不执行 count++）
```

---

## 二、空值合并（Nullish Coalescing）

### 2.1 与 `||` 的区别

```js
// || 把所有 falsy 值当作假值
const count = 0;
const v1 = count || 10;  // 10（错误！）

const name = '';
const v2 = name || 'Anonymous';  // "Anonymous"（可能错误）

const flag = false;
const v3 = flag || true;  // true（错误！）

// ?? 只检查 null/undefined
const v4 = count ?? 10;  // 0（正确）
const v5 = name ?? 'Anonymous';  // ""（保留空字符串）
const v6 = flag ?? true;  // false（保留 false）
```

### 2.2 只对 null/undefined 生效

```js
const value1 = null ?? 'default';      // "default"
const value2 = undefined ?? 'default'; // "default"
const value3 = 0 ?? 'default';         // 0
const value4 = '' ?? 'default';        // ""
const value5 = false ?? 'default';     // false
const value6 = NaN ?? 'default';       // NaN
```

### 2.3 配合使用

```js
// 安全访问并提供默认值
const theme = user?.profile?.theme ?? 'light';

// 多层嵌套
const city = user?.profile?.address?.city ?? 'Unknown';

// 函数调用结果
const email = user?.getEmail?.() ?? 'no-email@example.com';
```

---

## 三、实际应用

### 3.1 API 响应处理

```js
// 处理可能缺失的 API 数据
function displayUser(response) {
  const name = response?.data?.user?.name ?? 'Anonymous';
  const avatar = response?.data?.user?.avatar ?? '/default-avatar.png';
  const followers = response?.data?.user?.stats?.followers ?? 0;

  console.log({ name, avatar, followers });
}
```

### 3.2 配置对象处理

```js
// 处理配置选项
function initApp(config) {
  const apiUrl = config?.api?.url ?? 'https://api.example.com';
  const timeout = config?.api?.timeout ?? 5000;
  const retries = config?.api?.retries ?? 3;
  const debug = config?.debug ?? false;  // false 也是有效值

  return { apiUrl, timeout, retries, debug };
}

initApp({});
// {
//   apiUrl: 'https://api.example.com',
//   timeout: 5000,
//   retries: 3,
//   debug: false
// }
```

### 3.3 DOM 操作

```js
// 安全访问 DOM 元素
const button = document.querySelector('#submit-btn');
const text = button?.textContent ?? 'Submit';

button?.addEventListener?.('click', handleClick);

// 深层嵌套访问
const value = form?.elements?.email?.value ?? '';
```

---

## 四、注意事项

### 4.1 不能用于赋值

```js
// ❌ 语法错误
// obj?.prop = value;

// ✅ 正确做法
if (obj) {
  obj.prop = value;
}
```

### 4.2 不能与 `&&`/`||` 混用

```js
// ❌ 语法错误（需要明确优先级）
// const result = a ?? b && c;
// const result = a ?? b || c;

// ✅ 使用括号明确优先级
const result1 = (a ?? b) && c;
const result2 = a ?? (b || c);
```

### 4.3 delete 操作符

```js
// 可选链配合 delete
delete obj?.prop;

// 等价于
if (obj != null) {
  delete obj.prop;
}
```

---

## 五、性能考虑

### 5.1 过度使用的影响

```js
// ❌ 过度使用（性能略差）
const value = obj?.a?.b?.c?.d?.e?.f?.g;

// ✅ 确定存在的层级直接访问
const value = obj?.a.b.c.d.e.f.g;
```

### 5.2 与传统方式的性能对比

```js
// 可选链（简洁）
const name = user?.profile?.name;

// 传统方式（性能相近）
const name = user && user.profile && user.profile.name;

// 现代引擎优化得很好，性能差异可忽略
```

---

## 六、最佳实践

1. **优先使用可选链**：代码更简洁、更安全。
2. **配合空值合并提供默认值**：完整的空值处理方案。
3. **避免过度使用**：确定存在的属性直接访问。
4. **注意 `??` 与 `||` 的区别**：`0`、`''`、`false` 是有效值。
5. **明确优先级**：与 `&&`/`||` 混用时使用括号。

---

## 参考资料

- [TC39 - Optional Chaining](https://tc39.es/proposal-optional-chaining/)
- [TC39 - Nullish Coalescing](https://tc39.es/proposal-nullish-coalescing/)
- [MDN - Optional Chaining](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN - Nullish Coalescing](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
