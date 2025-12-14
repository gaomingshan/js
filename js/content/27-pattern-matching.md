# 模式匹配（提案）

## 概述

Pattern Matching 是 Stage 1 提案，提供更强大和表达性的条件匹配能力。

理解模式匹配的关键在于：

- **声明式**：描述"是什么"而非"怎么做"
- **类型安全**：编译时检查完整性
- **解构集成**：与解构赋值无缝配合

---

## 一、提案语法

### 1.1 基本形式

```js
// 提案语法（未来可能的形式）
const result = match (value) {
  when ({ type: 'circle', radius }) => Math.PI * radius ** 2,
  when ({ type: 'square', side }) => side ** 2,
  when ({ type: 'rectangle', width, height }) => width * height,
  default => 0
};
```

### 1.2 守卫（Guards）

```js
const classify = match (x) {
  when (0) => 'zero',
  when (x if x < 0) => 'negative',
  when (x if x > 0) => 'positive',
  default => 'unknown'
};
```

### 1.3 多值匹配

```js
const move = match ([x, y]) {
  when ([0, 0]) => 'origin',
  when ([0, y]) => `on Y-axis at ${y}`,
  when ([x, 0]) => `on X-axis at ${x}`,
  when ([x, y]) => `at (${x}, ${y})`
};
```

---

## 二、与其他语言对比

### 2.1 Rust

```rust
// Rust 的模式匹配
match value {
    0 => "zero",
    1..=10 => "between 1 and 10",
    _ => "other"
}
```

### 2.2 Scala

```scala
// Scala 的模式匹配
value match {
  case 0 => "zero"
  case x if x < 0 => "negative"
  case _ => "positive"
}
```

### 2.3 Python

```python
# Python 3.10+ 的结构化模式匹配
match value:
    case {"type": "circle", "radius": r}:
        return 3.14 * r ** 2
    case {"type": "square", "side": s}:
        return s ** 2
    case _:
        return 0
```

---

## 三、当前替代方案

### 3.1 switch 语句

```js
// 传统 switch
function getArea(shape) {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      return 0;
  }
}
```

**缺点**：
- 冗长
- 容易忘记 `break`
- 不支持复杂模式

### 3.2 对象映射

```js
// 对象映射方案
const areaCalculators = {
  circle: ({ radius }) => Math.PI * radius ** 2,
  square: ({ side }) => side ** 2,
  rectangle: ({ width, height }) => width * height
};

function getArea(shape) {
  const calculator = areaCalculators[shape.type];
  return calculator ? calculator(shape) : 0;
}
```

**优点**：
- 简洁
- 易于扩展

**缺点**：
- 不支持复杂条件
- 需要手动处理默认情况

### 3.3 if-else 链

```js
function classify(value) {
  if (value === 0) {
    return 'zero';
  } else if (value < 0) {
    return 'negative';
  } else if (value > 0) {
    return 'positive';
  } else {
    return 'unknown';
  }
}
```

**缺点**：
- 重复的条件检查
- 难以维护

---

## 四、实际应用场景

### 4.1 状态机

```js
// 使用模式匹配实现状态机
const nextState = match (state) {
  when ({ status: 'idle', event: 'start' }) => ({ status: 'running' }),
  when ({ status: 'running', event: 'pause' }) => ({ status: 'paused' }),
  when ({ status: 'paused', event: 'resume' }) => ({ status: 'running' }),
  when ({ status: 'running', event: 'stop' }) => ({ status: 'idle' }),
  default => state
};

// 当前替代方案
function nextState(state) {
  if (state.status === 'idle' && state.event === 'start') {
    return { status: 'running' };
  } else if (state.status === 'running' && state.event === 'pause') {
    return { status: 'paused' };
  } else if (state.status === 'paused' && state.event === 'resume') {
    return { status: 'running' };
  } else if (state.status === 'running' && state.event === 'stop') {
    return { status: 'idle' };
  }
  return state;
}
```

### 4.2 HTTP 响应处理

```js
// 模式匹配版本
const handleResponse = match (response) {
  when ({ status: 200, data }) => ({ success: true, data }),
  when ({ status: 404 }) => ({ success: false, error: 'Not Found' }),
  when ({ status: s if s >= 500 }) => ({ success: false, error: 'Server Error' }),
  default => ({ success: false, error: 'Unknown Error' })
};

// 当前实现
function handleResponse(response) {
  if (response.status === 200) {
    return { success: true, data: response.data };
  } else if (response.status === 404) {
    return { success: false, error: 'Not Found' };
  } else if (response.status >= 500) {
    return { success: false, error: 'Server Error' };
  }
  return { success: false, error: 'Unknown Error' };
}
```

### 4.3 数据验证

```js
// 模式匹配版本
const validate = match (input) {
  when ({ email: e if /^.+@.+\..+$/.test(e) }) => ({ valid: true }),
  when ({ email }) => ({ valid: false, error: 'Invalid email' }),
  when ({}) => ({ valid: false, error: 'Email required' })
};

// 当前实现
function validate(input) {
  if (input.email && /^.+@.+\..+$/.test(input.email)) {
    return { valid: true };
  } else if (input.email) {
    return { valid: false, error: 'Invalid email' };
  }
  return { valid: false, error: 'Email required' };
}
```

---

## 五、优势

1. **可读性**：代码意图更清晰。
2. **完整性检查**：编译器可以检查是否覆盖所有情况。
3. **类型安全**：与 TypeScript 等类型系统集成更好。
4. **简洁性**：减少样板代码。
5. **组合性**：支持复杂的匹配模式。

---

## 六、当前进展

- **阶段**：Stage 1
- **Champion**：TC39 成员
- **状态**：语法和语义仍在讨论中
- **实现**：Babel 有实验性插件

---

## 七、如何试用

```bash
# 安装 Babel 插件（实验性）
npm install @babel/plugin-proposal-pattern-matching

# .babelrc
{
  "plugins": ["@babel/plugin-proposal-pattern-matching"]
}
```

---

## 八、最佳实践

1. **保持简单**：不要过度使用复杂模式。
2. **完整覆盖**：始终提供 `default` 分支。
3. **守卫谨慎使用**：避免复杂的守卫逻辑。
4. **类型标注**：配合 TypeScript 使用。
5. **渐进式采用**：先在非关键代码中试用。

---

## 参考资料

- [TC39 - Pattern Matching Proposal](https://github.com/tc39/proposal-pattern-matching)
- [Babel Plugin](https://babeljs.io/docs/en/babel-plugin-proposal-pattern-matching)
