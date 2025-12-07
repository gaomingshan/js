/**
 * 异步迭代器
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1704AsyncIterator = {
  "config": {
    "title": "异步迭代器",
    "icon": "⏳",
    "description": "深入理解异步迭代器协议和for await...of循环",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["异步迭代器"],
      "question": "异步迭代器的next()方法返回什么？",
      "options": [
        "Promise<{value, done}>",
        "{value, done}",
        "Promise<value>",
        "async {value, done}"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步迭代器协议",
        "code": "// 异步迭代器\nconst asyncIterator = {\n  async next() {\n    await delay(100);\n    return { value: 1, done: false };\n  }\n};\n\n// 或者返回Promise\nconst asyncIterator2 = {\n  next() {\n    return Promise.resolve({\n      value: 1,\n      done: false\n    });\n  }\n};\n\n// 使用\nawait asyncIterator.next();\n// {value: 1, done: false}"
      },
      "source": "异步迭代器"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["Symbol.asyncIterator"],
      "question": "关于Symbol.asyncIterator说法正确的是？",
      "options": [
        "定义对象的异步迭代行为",
        "返回异步迭代器对象",
        "可用于for await...of",
        "所有对象都有该属性",
        "ReadableStream实现了该协议",
        "优先级高于Symbol.iterator"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "异步可迭代协议",
        "code": "// 实现异步可迭代对象\nconst asyncIterable = {\n  async *[Symbol.asyncIterator]() {\n    yield await Promise.resolve(1);\n    yield await Promise.resolve(2);\n    yield await Promise.resolve(3);\n  }\n};\n\n// 使用for await...of\nfor await (let value of asyncIterable) {\n  console.log(value);  // 1, 2, 3\n}\n\n// ReadableStream是异步可迭代的\nconst stream = new ReadableStream();\nfor await (let chunk of stream) {\n  console.log(chunk);\n}\n\n// 普通对象没有Symbol.asyncIterator\nconst obj = {};\nobj[Symbol.asyncIterator];  // undefined"
      },
      "source": "Symbol.asyncIterator"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["for await...of"],
      "question": "以下代码的输出顺序是什么？",
      "code": "async function test() {\n  const promises = [\n    Promise.resolve(1),\n    Promise.resolve(2),\n    Promise.resolve(3)\n  ];\n  \n  for await (let value of promises) {\n    console.log(value);\n  }\n}\n\ntest();",
      "options": [
        "1, 2, 3（按顺序）",
        "随机顺序",
        "3, 2, 1（反序）",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for await...of与Promise数组",
        "code": "async function test() {\n  const promises = [\n    Promise.resolve(1),\n    Promise.resolve(2),\n    Promise.resolve(3)\n  ];\n  \n  // for await...of会等待每个Promise\n  for await (let value of promises) {\n    console.log(value);  // 1, 2, 3\n  }\n}\n\ntest();\n\n// 区别于Promise.all\nPromise.all(promises).then(values => {\n  console.log(values);  // [1, 2, 3] (一次性)\n});\n\n// for await是串行的\nasync function serial() {\n  for await (let value of promises) {\n    await process(value);  // 一个接一个\n  }\n}\n\n// Promise.all是并行的\nPromise.all(promises.map(p => process(p)));"
      },
      "source": "for await...of"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["异步生成器"],
      "question": "async function*可以同时使用await和yield",
      "correctAnswer": "A",
      "explanation": {
        "title": "异步生成器特性",
        "code": "// 异步生成器可以同时使用await和yield\nasync function* fetchPages() {\n  let page = 1;\n  \n  while (page <= 3) {\n    // await异步操作\n    const data = await fetch(`/api?page=${page}`);\n    \n    // yield返回值\n    yield data;\n    \n    page++;\n  }\n}\n\n// 使用\nfor await (let data of fetchPages()) {\n  console.log(data);\n}\n\n// 等价于\nasync function* fetchPages2() {\n  yield await fetch('/api?page=1');\n  yield await fetch('/api?page=2');\n  yield await fetch('/api?page=3');\n}"
      },
      "source": "异步生成器"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["异步迭代器实现"],
      "question": "实现异步Range，空白处填什么？",
      "code": "const asyncRange = {\n  from: 1,\n  to: 3,\n  \n  async *[______]() {\n    for (let i = this.from; i <= this.to; i++) {\n      await delay(100);\n      yield i;\n    }\n  }\n};",
      "options": [
        "Symbol.asyncIterator",
        "Symbol.iterator",
        "asyncIterator",
        "iterator"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步可迭代对象实现",
        "code": "const asyncRange = {\n  from: 1,\n  to: 3,\n  \n  async *[Symbol.asyncIterator]() {\n    for (let i = this.from; i <= this.to; i++) {\n      await delay(100);  // 异步操作\n      yield i;\n    }\n  }\n};\n\n// 使用\nfor await (let num of asyncRange) {\n  console.log(num);  // 1, 2, 3 (每个间隔100ms)\n}\n\n// 手动实现\nconst asyncRange2 = {\n  from: 1,\n  to: 3,\n  \n  [Symbol.asyncIterator]() {\n    let current = this.from;\n    const last = this.to;\n    \n    return {\n      async next() {\n        if (current <= last) {\n          await delay(100);\n          return { value: current++, done: false };\n        }\n        return { done: true };\n      }\n    };\n  }\n};"
      },
      "source": "异步迭代器实现"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["错误处理"],
      "question": "异步迭代器错误处理，输出是什么？",
      "code": "async function* gen() {\n  yield 1;\n  throw new Error('error');\n  yield 2;\n}\n\nasync function test() {\n  try {\n    for await (let value of gen()) {\n      console.log(value);\n    }\n  } catch (e) {\n    console.log('caught');\n  }\n}\n\ntest();",
      "options": [
        "1, caught",
        "1, 2, caught",
        "caught",
        "1, error"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步迭代器错误处理",
        "code": "async function* gen() {\n  yield 1;                  // 正常yield\n  throw new Error('error'); // 抛出错误\n  yield 2;                  // 不会执行\n}\n\nasync function test() {\n  try {\n    for await (let value of gen()) {\n      console.log(value);  // 输出: 1\n    }\n  } catch (e) {\n    console.log('caught');  // 输出: caught\n  }\n}\n\ntest();\n// 输出: 1, caught\n\n// 也可以在生成器内部处理\nasync function* gen2() {\n  try {\n    yield 1;\n    throw new Error('error');\n  } catch (e) {\n    yield 'error handled';\n  }\n}"
      },
      "source": "错误处理"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["应用场景"],
      "question": "异步迭代器的典型应用场景？",
      "options": [
        "分页数据加载",
        "流式数据处理",
        "WebSocket消息",
        "数组遍历",
        "EventSource",
        "文件读取"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "异步迭代器应用",
        "code": "// 1. 分页加载\nasync function* loadPages(url) {\n  let page = 1;\n  while (true) {\n    const data = await fetch(`${url}?page=${page}`);\n    if (data.items.length === 0) break;\n    yield* data.items;\n    page++;\n  }\n}\n\n// 2. 流式数据\nasync function* readStream(stream) {\n  const reader = stream.getReader();\n  while (true) {\n    const { done, value } = await reader.read();\n    if (done) break;\n    yield value;\n  }\n}\n\n// 3. WebSocket\nasync function* listenWebSocket(ws) {\n  while (ws.readyState === WebSocket.OPEN) {\n    yield await new Promise(resolve => {\n      ws.onmessage = e => resolve(e.data);\n    });\n  }\n}\n\n// 4. 文件读取\nasync function* readLines(file) {\n  const reader = file.stream().getReader();\n  for await (let chunk of reader) {\n    yield* chunk.split('\\n');\n  }\n}"
      },
      "source": "应用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["兼容性"],
      "question": "for await...of可以遍历同步可迭代对象",
      "correctAnswer": "A",
      "explanation": {
        "title": "for await...of兼容性",
        "code": "// for await...of可以遍历同步和异步可迭代对象\n\n// 同步可迭代对象\nconst syncIterable = [1, 2, 3];\n\nfor await (let value of syncIterable) {\n  console.log(value);  // 1, 2, 3\n}\n\n// 异步可迭代对象\nconst asyncIterable = {\n  async *[Symbol.asyncIterator]() {\n    yield 1;\n    yield 2;\n  }\n};\n\nfor await (let value of asyncIterable) {\n  console.log(value);  // 1, 2\n}\n\n// 但for...of不能遍历异步可迭代对象\nfor (let value of asyncIterable) {  // TypeError\n  console.log(value);\n}"
      },
      "source": "兼容性"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["并发控制"],
      "question": "实现并发限制的异步迭代，空白处填什么？",
      "code": "async function* concurrent(iterable, limit) {\n  const queue = [];\n  \n  for await (let item of iterable) {\n    const promise = process(item);\n    queue.push(promise);\n    \n    if (queue.length >= limit) {\n      yield await ______;\n    }\n  }\n  \n  yield* queue;\n}",
      "options": [
        "Promise.race(queue)",
        "Promise.all(queue)",
        "queue.shift()",
        "queue[0]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步迭代并发控制",
        "code": "async function* concurrent(iterable, limit) {\n  const queue = [];\n  \n  for await (let item of iterable) {\n    const promise = process(item);\n    queue.push(promise);\n    \n    // 达到限制时等待最快的完成\n    if (queue.length >= limit) {\n      const result = await Promise.race(queue);\n      // 移除已完成的\n      const index = queue.findIndex(\n        p => p === Promise.resolve(result)\n      );\n      queue.splice(index, 1);\n      yield result;\n    }\n  }\n  \n  // 处理剩余\n  while (queue.length > 0) {\n    yield await Promise.race(queue);\n    queue.shift();\n  }\n}\n\n// 使用\nfor await (let result of concurrent(urls, 3)) {\n  console.log(result);\n}"
      },
      "source": "并发控制"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "异步迭代器的最佳实践？",
      "options": [
        "用于处理异步数据流",
        "实现return()清理资源",
        "使用try-finally确保清理",
        "替代所有Promise.all",
        "注意内存泄漏",
        "配合AbortController取消"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "异步迭代器最佳实践",
        "code": "// 1. 清理资源\nasync function* withResource() {\n  const resource = await acquire();\n  try {\n    yield resource;\n  } finally {\n    await release(resource);  // 确保清理\n  }\n}\n\n// 2. 实现return方法\nconst asyncIter = {\n  async *[Symbol.asyncIterator]() {\n    try {\n      while (true) {\n        yield await getData();\n      }\n    } finally {\n      await cleanup();  // 提前退出时清理\n    }\n  }\n};\n\n// 3. 支持取消\nasync function* cancellable(signal) {\n  while (!signal.aborted) {\n    yield await getData();\n  }\n}\n\nconst controller = new AbortController();\nfor await (let data of cancellable(controller.signal)) {\n  if (shouldStop) {\n    controller.abort();\n    break;\n  }\n}\n\n// 4. 避免内存泄漏\nasync function* stream() {\n  const buffer = [];\n  // 限制buffer大小\n  if (buffer.length > MAX_SIZE) {\n    buffer.shift();\n  }\n  yield data;\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "生成器高级应用",
      "url": "17-03-generator-advanced.html"
    },
    "next": {
      "title": "Promise A+规范",
      "url": "18-01-promise-spec.html"
    }
  }
};
