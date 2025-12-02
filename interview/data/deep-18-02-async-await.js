/**
 * async/await原理
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1802AsyncAwait = {
  "config": {
    "title": "async/await原理",
    "icon": "⚡",
    "description": "深入理解async/await的实现原理和使用技巧",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["async函数"],
      "question": "async函数总是返回什么？",
      "options": [
        "Promise对象",
        "异步值",
        "undefined",
        "函数返回值"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async函数返回值",
        "code": "// async函数总是返回Promise\nasync function foo() {\n  return 1;\n}\n\nconst result = foo();\nconsole.log(result instanceof Promise); // true\n\nfoo().then(x => console.log(x)); // 1\n\n// 等价于\nfunction foo2() {\n  return Promise.resolve(1);\n}\n\n// 即使不return，也返回Promise\nasync function bar() {\n  console.log('hello');\n}\n\nbar(); // Promise {<fulfilled>: undefined}"
      },
      "source": "async"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["await"],
      "question": "以下代码的输出是什么？",
      "code": "async function test() {\n  console.log('1');\n  await Promise.resolve();\n  console.log('2');\n}\n\ntest();\nconsole.log('3');",
      "options": [
        "1, 3, 2",
        "1, 2, 3",
        "3, 1, 2",
        "1, 3, 2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "await暂停执行",
        "code": "async function test() {\n  console.log('1');  // 同步执行\n  await Promise.resolve();  // 暂停，后续代码进微任务\n  console.log('2');  // 微任务执行\n}\n\ntest();\nconsole.log('3');  // 同步执行\n\n// 执行顺序：\n// 1. test()调用，同步执行到await → 1\n// 2. await后的代码进入微任务队列\n// 3. 继续执行同步代码 → 3\n// 4. 执行微任务 → 2\n\n// 输出: 1, 3, 2"
      },
      "source": "await"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["async/await原理"],
      "question": "async/await的本质是什么？",
      "options": [
        "Generator + Promise的语法糖",
        "基于协程实现",
        "自动执行Generator",
        "多线程异步",
        "事件驱动",
        "自带执行器"
      ],
      "correctAnswer": ["A", "C", "F"],
      "explanation": {
        "title": "async/await实现原理",
        "code": "// async/await是Generator的语法糖\n\n// async/await写法\nasync function getData() {\n  const data1 = await fetch('/api/1');\n  const data2 = await fetch('/api/2');\n  return data2;\n}\n\n// 等价的Generator写法\nfunction* getDataGen() {\n  const data1 = yield fetch('/api/1');\n  const data2 = yield fetch('/api/2');\n  return data2;\n}\n\n// 需要手动执行\nfunction run(gen) {\n  return new Promise((resolve, reject) => {\n    const g = gen();\n    \n    function step(nextF) {\n      let next;\n      try {\n        next = nextF();\n      } catch (e) {\n        return reject(e);\n      }\n      \n      if (next.done) {\n        return resolve(next.value);\n      }\n      \n      Promise.resolve(next.value)\n        .then(v => step(() => g.next(v)))\n        .catch(e => step(() => g.throw(e)));\n    }\n    \n    step(() => g.next());\n  });\n}\n\nrun(getDataGen);\n\n// async/await = Generator + 自动执行器"
      },
      "source": "实现原理"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["错误处理"],
      "question": "await后的Promise reject会抛出异常",
      "correctAnswer": "A",
      "explanation": {
        "title": "await错误处理",
        "code": "// await会将reject转为异常\nasync function test() {\n  try {\n    const data = await Promise.reject('error');\n  } catch (e) {\n    console.log('caught:', e); // 'caught: error'\n  }\n}\n\n// 不捕获会传播\nasync function test2() {\n  await Promise.reject('error'); // 抛出异常\n}\n\ntest2().catch(e => console.log(e)); // 'error'\n\n// 多种错误处理方式\n// 1. try-catch\ntry {\n  await fetchData();\n} catch (e) {}\n\n// 2. catch方法\nawait fetchData().catch(e => handleError(e));\n\n// 3. Promise.allSettled\nconst results = await Promise.allSettled([\n  fetch('/api/1'),\n  fetch('/api/2')\n]);"
      },
      "source": "错误处理"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["并行执行"],
      "question": "同时发起多个请求，空白处填什么？",
      "code": "async function loadData() {\n  // 需要并行执行\n  const [user, posts, comments] = await ______;\n  return { user, posts, comments };\n}",
      "options": [
        "Promise.all([getUser(), getPosts(), getComments()])",
        "[await getUser(), await getPosts(), await getComments()]",
        "await [getUser(), getPosts(), getComments()]",
        "Promise.race([getUser(), getPosts(), getComments()])"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async/await并发控制",
        "code": "// ❌ 串行执行（慢）\nasync function serial() {\n  const user = await getUser();       // 等待\n  const posts = await getPosts();     // 等待\n  const comments = await getComments(); // 等待\n  return { user, posts, comments };\n}\n\n// ✅ 并行执行（快）\nasync function parallel() {\n  const [user, posts, comments] = await Promise.all([\n    getUser(),\n    getPosts(),\n    getComments()\n  ]);\n  return { user, posts, comments };\n}\n\n// 部分并行\nasync function hybrid() {\n  const user = await getUser();\n  \n  // 这两个可以并行\n  const [posts, comments] = await Promise.all([\n    getPosts(user.id),\n    getComments(user.id)\n  ]);\n  \n  return { user, posts, comments };\n}"
      },
      "source": "并发"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["顶层await"],
      "question": "模块中顶层await的行为？",
      "code": "// module.js\nconsole.log('1');\nawait delay(100);\nconsole.log('2');\n\n// main.js\nconsole.log('3');\nimport './module.js';\nconsole.log('4');",
      "options": [
        "1, 2, 3, 4",
        "3, 1, 2, 4",
        "3, 4, 1, 2",
        "1, 3, 4, 2"
      ],
      "correctAnswer": "B",
      "explanation": {
        "title": "顶层await",
        "code": "// ES2022支持模块顶层await\n\n// module.js\nconsole.log('1');\nawait delay(100);  // 顶层await\nconsole.log('2');\n\n// main.js\nconsole.log('3');\nimport './module.js';  // 等待module执行完\nconsole.log('4');\n\n// 执行顺序：\n// 1. main.js开始执行 → 3\n// 2. 导入module.js → 1\n// 3. await暂停module\n// 4. main.js等待module\n// 5. await完成 → 2\n// 6. module加载完成\n// 7. 继续main.js → 4\n\n// 输出: 3, 1, 2, 4\n\n// 注意：\n// - 只能在模块顶层使用\n// - 会阻塞依赖该模块的其他模块"
      },
      "source": "顶层await"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["await限制"],
      "question": "关于await的使用限制？",
      "options": [
        "只能在async函数中使用",
        "可以在模块顶层使用",
        "可以在普通函数中使用",
        "可以在回调函数中使用",
        "可以await非Promise值",
        "可以在构造函数中使用"
      ],
      "correctAnswer": ["A", "B", "E"],
      "explanation": {
        "title": "await使用规则",
        "code": "// 1. ✅ async函数中\nasync function foo() {\n  await promise;\n}\n\n// 2. ✅ 模块顶层（ES2022）\n// module.js\nawait fetch('/api');\n\n// 3. ❌ 普通函数中\nfunction bar() {\n  await promise;  // SyntaxError\n}\n\n// 4. ❌ 回调中\n[1,2,3].forEach(async (item) => {\n  await process(item);  // ⚠️ 不会等待\n});\n\n// ✅ 应该用for...of\nfor (const item of [1,2,3]) {\n  await process(item);\n}\n\n// 5. ✅ await非Promise值\nawait 1;  // 等价于await Promise.resolve(1)\n\n// 6. ❌ 构造函数中\nclass MyClass {\n  constructor() {\n    await init();  // SyntaxError\n  }\n  \n  // ✅ 使用静态工厂方法\n  static async create() {\n    const instance = new MyClass();\n    await instance.init();\n    return instance;\n  }\n}"
      },
      "source": "await限制"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["返回值"],
      "question": "await表达式的值是Promise的resolve值",
      "correctAnswer": "A",
      "explanation": {
        "title": "await返回值",
        "code": "// await会等待Promise并返回resolve的值\n\nconst value = await Promise.resolve(42);\nconsole.log(value); // 42\n\n// 如果是普通值，直接返回\nconst num = await 100;\nconsole.log(num); // 100\n\n// 如果是thenable对象\nconst thenable = {\n  then(resolve) {\n    resolve(1);\n  }\n};\n\nconst result = await thenable;\nconsole.log(result); // 1\n\n// 如果reject，抛出异常\ntry {\n  const data = await Promise.reject('error');\n} catch (e) {\n  console.log(e); // 'error'\n}"
      },
      "source": "返回值"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["错误重试"],
      "question": "实现带重试的async函数，空白处填什么？",
      "code": "async function retry(fn, times = 3) {\n  for (let i = 0; i < times; i++) {\n    try {\n      return await fn();\n    } catch (e) {\n      if (i === times - 1) ______;\n    }\n  }\n}",
      "options": [
        "throw e",
        "return e",
        "continue",
        "break"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步重试模式",
        "code": "// 基础重试\nasync function retry(fn, times = 3) {\n  for (let i = 0; i < times; i++) {\n    try {\n      return await fn();\n    } catch (e) {\n      if (i === times - 1) {\n        throw e;  // 最后一次重试失败\n      }\n    }\n  }\n}\n\n// 带延迟的重试\nasync function retryWithDelay(fn, times = 3, delay = 1000) {\n  for (let i = 0; i < times; i++) {\n    try {\n      return await fn();\n    } catch (e) {\n      if (i === times - 1) throw e;\n      await new Promise(resolve => \n        setTimeout(resolve, delay * (i + 1))\n      );\n    }\n  }\n}\n\n// 使用\nconst data = await retry(() => fetch('/api'));"
      },
      "source": "重试"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "async/await最佳实践有哪些？",
      "options": [
        "使用try-catch处理错误",
        "注意并行vs串行",
        "避免在循环中await",
        "优先使用Promise.all",
        "所有函数都用async",
        "配合Promise.allSettled"
      ],
      "correctAnswer": ["A", "B", "D", "F"],
      "explanation": {
        "title": "async/await最佳实践",
        "code": "// 1. 错误处理\nasync function getData() {\n  try {\n    const data = await fetch('/api');\n    return data;\n  } catch (err) {\n    console.error(err);\n    throw err;\n  }\n}\n\n// 2. 并行执行\n// ❌ 串行\nconst r1 = await fetch('/api/1');\nconst r2 = await fetch('/api/2');\n\n// ✅ 并行\nconst [r1, r2] = await Promise.all([\n  fetch('/api/1'),\n  fetch('/api/2')\n]);\n\n// 3. 循环中的await\n// ❌ 不好：串行\nfor (const url of urls) {\n  await fetch(url);\n}\n\n// ✅ 好：并行\nawait Promise.all(urls.map(url => fetch(url)));\n\n// 4. 部分失败处理\nconst results = await Promise.allSettled([\n  fetch('/api/1'),\n  fetch('/api/2'),\n  fetch('/api/3')\n]);\n\nresults.forEach((result, i) => {\n  if (result.status === 'fulfilled') {\n    console.log(`成功${i}:`, result.value);\n  } else {\n    console.log(`失败${i}:`, result.reason);\n  }\n});"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "Promise A+规范",
      "url": "18-01-promise-spec.html"
    },
    "next": {
      "title": "Promise进阶应用",
      "url": "18-03-promise-advanced.html"
    }
  }
};
