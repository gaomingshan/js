/**
 * 生成器高级应用
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1703GeneratorAdvanced = {
  "config": {
    "title": "生成器高级应用",
    "icon": "🚀",
    "description": "生成器在异步编程、状态机和协程中的高级应用",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "medium",
      "tags": ["异步生成器"],
      "question": "async function*定义的是什么？",
      "options": [
        "异步生成器函数",
        "异步函数",
        "生成器函数",
        "Promise生成器"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步生成器",
        "code": "// 异步生成器函数\nasync function* asyncGen() {\n  yield await Promise.resolve(1);\n  yield await Promise.resolve(2);\n  yield await Promise.resolve(3);\n}\n\n// 使用for await...of\n(async () => {\n  for await (let value of asyncGen()) {\n    console.log(value);  // 1, 2, 3\n  }\n})();\n\n// 异步生成器返回异步迭代器\nconst gen = asyncGen();\ngen.next().then(r => console.log(r));\n// {value: 1, done: false}"
      },
      "source": "异步生成器"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["协程"],
      "question": "以下生成器协程代码的输出是什么？",
      "code": "function* task1() {\n  console.log('task1-1');\n  yield;\n  console.log('task1-2');\n  yield;\n  console.log('task1-3');\n}\n\nfunction* task2() {\n  console.log('task2-1');\n  yield;\n  console.log('task2-2');\n}\n\nfunction* scheduler() {\n  yield* task1();\n  yield* task2();\n}\n\nconst s = scheduler();\ns.next();\ns.next();\ns.next();",
      "options": [
        "task1-1, task1-2, task1-3",
        "task1-1, task2-1, task1-2",
        "task1-1, task1-2, task2-1",
        "task1-1, task1-2, task1-3, task2-1, task2-2"
      ],
      "correctAnswer": "C",
      "explanation": {
        "title": "生成器协程调度",
        "code": "function* task1() {\n  console.log('task1-1');  // 第1次next\n  yield;\n  console.log('task1-2');  // 第2次next\n  yield;\n  console.log('task1-3');  // 第3次next\n}\n\nfunction* task2() {\n  console.log('task2-1');  // 第4次next\n  yield;\n  console.log('task2-2');  // 第5次next\n}\n\nfunction* scheduler() {\n  yield* task1();  // 先执行完task1\n  yield* task2();  // 再执行task2\n}\n\nconst s = scheduler();\ns.next();  // task1-1\ns.next();  // task1-2\ns.next();  // task2-1\n\n// 输出: task1-1, task1-2, task2-1"
      },
      "source": "协程"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["状态机"],
      "question": "使用生成器实现状态机的优势有哪些？",
      "options": [
        "代码更简洁",
        "状态转换清晰",
        "避免大量if-else",
        "自动处理异步",
        "内置状态管理",
        "支持状态回退"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "生成器状态机",
        "code": "// 传统状态机\nclass StateMachine {\n  constructor() {\n    this.state = 'idle';\n  }\n  transition(action) {\n    if (this.state === 'idle' && action === 'start') {\n      this.state = 'running';\n    } else if (this.state === 'running' && action === 'pause') {\n      this.state = 'paused';\n    }\n    // 大量if-else...\n  }\n}\n\n// 生成器状态机\nfunction* stateMachine() {\n  console.log('idle');\n  yield 'running';\n  console.log('running');\n  yield 'paused';\n  console.log('paused');\n  yield 'stopped';\n}\n\nconst sm = stateMachine();\nsm.next();  // idle → running\nsm.next();  // running → paused\nsm.next();  // paused → stopped"
      },
      "source": "状态机"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["yield表达式"],
      "question": "yield表达式可以出现在箭头函数中",
      "correctAnswer": "B",
      "explanation": {
        "title": "yield的限制",
        "code": "// ❌ yield不能在箭头函数中\nconst gen = () => {\n  yield 1;  // SyntaxError\n};\n\n// ❌ yield不能在普通函数中\nfunction normal() {\n  yield 1;  // SyntaxError\n}\n\n// ✅ 只能在生成器函数中\nfunction* gen() {\n  yield 1;  // ✅\n}\n\n// ❌ 回调中也不行\nfunction* gen2() {\n  [1,2,3].forEach(x => {\n    yield x;  // SyntaxError\n  });\n}\n\n// ✅ 使用yield*\nfunction* gen3() {\n  yield* [1,2,3];\n}"
      },
      "source": "yield限制"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["异步流程"],
      "question": "使用生成器实现异步流程，空白处填什么？",
      "code": "function run(genFn) {\n  const gen = genFn();\n  \n  function step(value) {\n    const result = gen.next(value);\n    if (result.done) return result.value;\n    \n    return Promise.resolve(result.value).then(______);\n  }\n  \n  return step();\n}",
      "options": [
        "step",
        "value => step(value)",
        "gen.next",
        "result => result.value"
      ],
      "correctAnswer": "B",
      "explanation": {
        "title": "生成器异步流程控制",
        "code": "// 简化版co库实现\nfunction run(genFn) {\n  const gen = genFn();\n  \n  function step(value) {\n    const result = gen.next(value);\n    if (result.done) {\n      return result.value;\n    }\n    \n    // Promise链式调用\n    return Promise.resolve(result.value)\n      .then(value => step(value));\n  }\n  \n  return step();\n}\n\n// 使用\nrun(function* () {\n  const data1 = yield fetch('/api/1');\n  console.log(data1);\n  \n  const data2 = yield fetch('/api/2');\n  console.log(data2);\n  \n  return 'done';\n});\n\n// 类似async/await的同步写法\n// 但可以在旧环境中使用"
      },
      "source": "异步流程"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["数据流"],
      "question": "以下管道处理的输出是什么？",
      "code": "function* map(iterable, fn) {\n  for (let item of iterable) {\n    yield fn(item);\n  }\n}\n\nfunction* filter(iterable, fn) {\n  for (let item of iterable) {\n    if (fn(item)) yield item;\n  }\n}\n\nconst nums = [1, 2, 3, 4];\nconst result = filter(\n  map(nums, x => x * 2),\n  x => x > 4\n);\n\nconsole.log([...result]);",
      "options": [
        "[6, 8]",
        "[3, 4]",
        "[2, 4]",
        "[8]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "生成器数据流处理",
        "code": "function* map(iterable, fn) {\n  for (let item of iterable) {\n    yield fn(item);\n  }\n}\n\nfunction* filter(iterable, fn) {\n  for (let item of iterable) {\n    if (fn(item)) yield item;\n  }\n}\n\nconst nums = [1, 2, 3, 4];\n\n// 管道处理\nconst doubled = map(nums, x => x * 2);\n// [2, 4, 6, 8]\n\nconst filtered = filter(doubled, x => x > 4);\n// [6, 8]\n\nconsole.log([...filtered]);  // [6, 8]\n\n// 惰性求值：只在需要时计算\n// 可以处理无限序列"
      },
      "source": "数据流"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["yield*"],
      "question": "yield*可以委托给哪些对象？",
      "options": [
        "生成器对象",
        "数组",
        "字符串",
        "Promise",
        "Set/Map",
        "任何可迭代对象"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "yield*委托范围",
        "code": "function* gen() {\n  // 1. 生成器\n  yield* anotherGen();\n  \n  // 2. 数组\n  yield* [1, 2, 3];\n  \n  // 3. 字符串\n  yield* 'abc';  // 'a', 'b', 'c'\n  \n  // 4. Set/Map\n  yield* new Set([4, 5]);\n  yield* new Map([[6, 'a']]);\n  \n  // 5. 自定义可迭代对象\n  yield* {\n    *[Symbol.iterator]() {\n      yield 7;\n      yield 8;\n    }\n  };\n}\n\n// ❌ Promise不可迭代\nfunction* bad() {\n  yield* Promise.resolve(1);  // TypeError\n}\n\n// ✅ 应该用yield\nfunction* good() {\n  yield Promise.resolve(1);\n}"
      },
      "source": "yield*委托"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["递归生成器"],
      "question": "生成器可以递归调用自身",
      "correctAnswer": "A",
      "explanation": {
        "title": "递归生成器",
        "code": "// 递归遍历树结构\nfunction* traverse(node) {\n  yield node.value;\n  \n  if (node.children) {\n    for (let child of node.children) {\n      yield* traverse(child);  // 递归\n    }\n  }\n}\n\nconst tree = {\n  value: 1,\n  children: [\n    { value: 2 },\n    {\n      value: 3,\n      children: [\n        { value: 4 },\n        { value: 5 }\n      ]\n    }\n  ]\n};\n\nconsole.log([...traverse(tree)]);\n// [1, 2, 3, 4, 5]"
      },
      "source": "递归生成器"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["取消令牌"],
      "question": "实现可取消的生成器，空白处填什么？",
      "code": "function* cancellable() {\n  try {\n    while (true) {\n      yield doWork();\n    }\n  } catch (e) {\n    if (e.type === 'cancel') {\n      console.log('已取消');\n      ______;\n    }\n    throw e;\n  }\n}",
      "options": [
        "return",
        "break",
        "continue",
        "yield"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "生成器取消机制",
        "code": "function* cancellable() {\n  try {\n    while (true) {\n      yield doWork();\n    }\n  } catch (e) {\n    if (e.type === 'cancel') {\n      console.log('已取消');\n      return;  // 终止生成器\n    }\n    throw e;\n  }\n}\n\nconst gen = cancellable();\ngen.next();\ngen.next();\n\n// 取消执行\ngen.throw({ type: 'cancel' });\n// 输出: 已取消\n// 返回: {value: undefined, done: true}\n\n// 或使用return方法\ngen.return('取消');  // 更简洁"
      },
      "source": "取消令牌"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "生成器高级应用的最佳实践？",
      "options": [
        "用于惰性数据处理",
        "实现复杂异步流程",
        "替代async/await",
        "构建数据管道",
        "状态机实现",
        "所有循环都用生成器"
      ],
      "correctAnswer": ["A", "B", "D", "E"],
      "explanation": {
        "title": "生成器高级最佳实践",
        "code": "// 1. 惰性数据处理（大数据）\nfunction* readLargeFile(file) {\n  let chunk;\n  while (chunk = file.readChunk()) {\n    yield process(chunk);\n  }\n}\n\n// 2. 异步流程（配合co）\nfunction* fetchUserData() {\n  const user = yield fetch('/user');\n  const posts = yield fetch(`/posts/${user.id}`);\n  return { user, posts };\n}\n\n// 3. 数据管道\nfunction* pipeline(data) {\n  const mapped = yield* map(data, transform);\n  const filtered = yield* filter(mapped, predicate);\n  return [...filtered];\n}\n\n// 4. 状态机\nfunction* gameState() {\n  while (true) {\n    yield 'menu';\n    yield 'playing';\n    yield 'paused';\n    yield 'gameover';\n  }\n}\n\n// ❌ 不要过度使用\n// 简单场景用普通循环更好"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "生成器基础",
      "url": "17-02-generator-basic.html"
    },
    "next": {
      "title": "异步迭代器",
      "url": "17-04-async-iterator.html"
    }
  }
};
