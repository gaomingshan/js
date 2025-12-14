# TC39 提案流程

## 概述

TC39（Technical Committee 39）是负责 ECMAScript 标准的技术委员会。

理解 TC39 提案流程的关键在于：

- **五个阶段**：从 Stage 0 到 Stage 4
- **严格的审查**：每个阶段都有明确的要求
- **社区参与**：开放的提案和反馈机制

---

## 一、五个阶段

### Stage 0: Strawperson（稻草人）

**特点**：
- 初步想法
- 任何 TC39 成员都可以提出
- 没有正式要求

**示例**：
- 刚刚提出的新语法想法
- 需要讨论的概念

### Stage 1: Proposal（提案）

**要求**：
- 有明确的问题描述
- 有潜在的解决方案
- 有 Champion（负责人）推进
- 有演示和示例

**特点**：
- 委员会愿意投入时间讨论
- 需要识别潜在的挑战

### Stage 2: Draft（草案）

**要求**：
- 有初步的规范文本
- 语法和语义基本确定
- 有两个实验性实现

**特点**：
- 委员会期望该特性最终会被包含
- 需要增量式的规范改进

### Stage 3: Candidate（候选）

**要求**：
- 完整的规范文本
- 所有语义都已明确
- 需要实现反馈

**特点**：
- 只接受关键性的修改
- 需要至少两个符合规范的实现
- 浏览器开始实现

### Stage 4: Finished（完成）

**要求**：
- 通过 Test262 验收测试
- 至少两个通过测试的实现
- 实践经验积极
- ECMAScript 编辑签字

**特点**：
- 将包含在下一版 ECMAScript 标准中
- 不再接受修改

---

## 二、著名提案示例

### 2.1 已完成（Stage 4）

```js
// Optional Chaining (ES2020)
const city = user?.profile?.address?.city;

// Nullish Coalescing (ES2020)
const count = value ?? 0;

// Private Fields (ES2022)
class Counter {
  #count = 0;
  increment() {
    this.#count++;
  }
}

// Top-level await (ES2022)
const data = await fetch('/api/data').then(r => r.json());

// Logical Assignment (ES2021)
x ??= 10;
x ||= 10;
x &&= 10;

// Numeric Separators (ES2021)
const billion = 1_000_000_000;
```

### 2.2 候选阶段（Stage 3）

```js
// Temporal API（新的日期时间 API）
const now = Temporal.Now.plainDateISO();
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });

// Array grouping
const grouped = array.groupBy(item => item.category);
```

### 2.3 草案阶段（Stage 2）

```js
// Decorators（装饰器）
@sealed
class MyClass {
  @readonly
  name = 'Alice';
}

// Record & Tuple（不可变数据结构）
const record = #{ x: 1, y: 2 };
const tuple = #[1, 2, 3];

// Pipeline operator（管道操作符）
const result = value
  |> double
  |> addOne
  |> square;
```

### 2.4 提案阶段（Stage 1）

```js
// Pattern Matching（模式匹配）
const result = match (value) {
  when ({ type: 'number' }) => value * 2,
  when ({ type: 'string' }) => value.toUpperCase(),
  default => value
};

// Do expressions
const x = do {
  if (condition) {
    'yes';
  } else {
    'no';
  }
};
```

---

## 三、提案推进流程

```
提出想法 (Stage 0)
    ↓
委员会讨论，寻找 Champion
    ↓
制定正式提案 (Stage 1)
    ↓
编写初步规范
    ↓
达成共识，进入草案 (Stage 2)
    ↓
完善规范，实现验证
    ↓
进入候选阶段 (Stage 3)
    ↓
浏览器实现，收集反馈
    ↓
通过测试，编辑签字
    ↓
完成 (Stage 4)
    ↓
包含在下一版 ECMAScript 中
```

---

## 四、如何参与

### 4.1 关注提案

- GitHub: https://github.com/tc39/proposals
- 查看各阶段的活跃提案
- 阅读规范文本和示例

### 4.2 提供反馈

- 在 GitHub 提案仓库提 Issue
- 参与讨论
- 分享使用经验

### 4.3 实现反馈

- 使用 Babel 插件试用提案
- 报告实现问题
- 提供真实场景的案例

---

## 五、版本发布

ECMAScript 每年发布一次新版本：

- **ES2015** (ES6): 重大更新
- **ES2016** (ES7): `Array.prototype.includes`、`**` 运算符
- **ES2017** (ES8): Async/Await、Object.entries
- **ES2018** (ES9): Rest/Spread、Promise.finally
- **ES2019** (ES10): Array.flat、Object.fromEntries
- **ES2020** (ES11): Optional Chaining、Nullish Coalescing
- **ES2021** (ES12): Logical Assignment、Numeric Separators
- **ES2022** (ES13): Top-level await、Private Fields
- **ES2023** (ES14): Array.findLast、Hashbang Grammar

---

## 六、最佳实践

1. **关注 Stage 3+**：较稳定，可以学习和试用。
2. **谨慎使用 Stage 2-**：语法可能变化。
3. **使用 Polyfill**：为旧环境提供新特性。
4. **渐进式采用**：优先使用已标准化的特性。
5. **跟踪变化**：定期查看提案状态。

---

## 参考资料

- [TC39 Process](https://tc39.es/process-document/)
- [TC39 Proposals](https://github.com/tc39/proposals)
- [ECMAScript Specification](https://tc39.es/ecma262/)
