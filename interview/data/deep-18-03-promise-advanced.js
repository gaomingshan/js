/**
 * Promise进阶应用
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1803PromiseAdvanced = {
  "config": {
    "title": "Promise进阶应用",
    "icon": "🚀",
    "description": "Promise的高级应用场景和实现技巧",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "medium",
      "tags": ["Promise.all"],
      "question": "Promise.all的特点是什么？",
      "options": [
        "全部成功才成功，一个失败就失败",
        "全部完成才完成",
        "返回最快的结果",
        "忽略失败的Promise"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.all特性",
        "code": "// Promise.all：全成功才成功\nPromise.all([\n  Promise.resolve(1),\n  Promise.resolve(2),\n  Promise.resolve(3)\n]).then(results => {\n  console.log(results); // [1, 2, 3]\n});\n\n// 一个失败全失败\nPromise.all([\n  Promise.resolve(1),\n  Promise.reject('error'),\n  Promise.resolve(3)\n]).catch(err => {\n  console.log(err); // 'error'\n  // 其他Promise的结果丢失\n});\n\n// 应用场景：\n// 1. 多个独立请求\nconst [users, posts] = await Promise.all([\n  fetch('/users'),\n  fetch('/posts')\n]);\n\n// 2. 并行处理\nawait Promise.all(\n  urls.map(url => fetch(url))\n);"
      },
      "source": "Promise.all"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Promise.race"],
      "question": "以下代码的输出是什么？",
      "code": "Promise.race([\n  new Promise(resolve => setTimeout(() => resolve(1), 100)),\n  new Promise(resolve => setTimeout(() => resolve(2), 50)),\n  new Promise((_, reject) => setTimeout(() => reject(3), 200))\n]).then(\n  value => console.log('success:', value),\n  error => console.log('error:', error)\n);",
      "options": [
        "success: 2",
        "success: 1",
        "error: 3",
        "success: [1, 2]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.race竞速",
        "code": "// Promise.race：返回最快的结果\nPromise.race([\n  new Promise(resolve => \n    setTimeout(() => resolve(1), 100)\n  ),\n  new Promise(resolve => \n    setTimeout(() => resolve(2), 50)   // 最快\n  ),\n  new Promise((_, reject) => \n    setTimeout(() => reject(3), 200)\n  )\n]).then(\n  value => console.log('success:', value),  // success: 2\n  error => console.log('error:', error)\n);\n\n// 应用场景：\n// 1. 超时控制\nPromise.race([\n  fetch('/api'),\n  new Promise((_, reject) => \n    setTimeout(() => reject('timeout'), 5000)\n  )\n]);\n\n// 2. 多源请求（取最快）\nPromise.race([\n  fetch('https://cdn1.com/data'),\n  fetch('https://cdn2.com/data'),\n  fetch('https://cdn3.com/data')\n]);"
      },
      "source": "Promise.race"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Promise.allSettled"],
      "question": "Promise.allSettled的特点？",
      "options": [
        "等待所有Promise完成",
        "不管成功失败都返回结果",
        "返回状态和值/原因",
        "一个失败就停止",
        "ES2020引入",
        "忽略rejected"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "Promise.allSettled",
        "code": "// 等待所有Promise完成（不管成功失败）\nconst results = await Promise.allSettled([\n  Promise.resolve(1),\n  Promise.reject('error'),\n  Promise.resolve(3)\n]);\n\nconsole.log(results);\n// [\n//   { status: 'fulfilled', value: 1 },\n//   { status: 'rejected', reason: 'error' },\n//   { status: 'fulfilled', value: 3 }\n// ]\n\n// 处理结果\nresults.forEach((result, i) => {\n  if (result.status === 'fulfilled') {\n    console.log(`${i} 成功:`, result.value);\n  } else {\n    console.log(`${i} 失败:`, result.reason);\n  }\n});\n\n// 应用场景：批量操作允许部分失败\nconst uploadResults = await Promise.allSettled(\n  files.map(file => uploadFile(file))\n);\n\nconst succeeded = uploadResults.filter(\n  r => r.status === 'fulfilled'\n).length;"
      },
      "source": "allSettled"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Promise.any"],
      "question": "Promise.any在所有Promise都失败时才reject",
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.any",
        "code": "// Promise.any：任一成功就成功\nPromise.any([\n  Promise.reject('error1'),\n  Promise.resolve(2),\n  Promise.reject('error3')\n]).then(\n  value => console.log(value)  // 2\n);\n\n// 全部失败才失败\nPromise.any([\n  Promise.reject('error1'),\n  Promise.reject('error2'),\n  Promise.reject('error3')\n]).catch(err => {\n  console.log(err); // AggregateError\n  console.log(err.errors); // ['error1', 'error2', 'error3']\n});\n\n// vs Promise.race\n// race: 返回最快的（成功或失败）\n// any: 返回最快的成功，全失败才失败\n\n// 应用：多源容错\nPromise.any([\n  fetch('https://api1.com/data'),\n  fetch('https://api2.com/data'),\n  fetch('https://api3.com/data')\n]);"
      },
      "source": "Promise.any"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["手写Promise.all"],
      "question": "实现Promise.all，空白处填什么？",
      "code": "Promise.all = function(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let count = 0;\n    \n    promises.forEach((promise, index) => {\n      Promise.resolve(promise).then(\n        value => {\n          results[index] = value;\n          count++;\n          if (count === ______) {\n            resolve(results);\n          }\n        },\n        reject\n      );\n    });\n  });\n};",
      "options": [
        "promises.length",
        "results.length",
        "index + 1",
        "count"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.all实现",
        "code": "Promise.all = function(promises) {\n  return new Promise((resolve, reject) => {\n    // 处理空数组\n    if (promises.length === 0) {\n      return resolve([]);\n    }\n    \n    const results = [];\n    let count = 0;\n    \n    promises.forEach((promise, index) => {\n      // 确保是Promise\n      Promise.resolve(promise).then(\n        value => {\n          results[index] = value;\n          count++;\n          \n          // 所有完成\n          if (count === promises.length) {\n            resolve(results);\n          }\n        },\n        reason => {\n          // 一个失败就reject\n          reject(reason);\n        }\n      );\n    });\n  });\n};\n\n// 测试\nPromise.all([\n  Promise.resolve(1),\n  Promise.resolve(2),\n  Promise.resolve(3)\n]).then(results => {\n  console.log(results); // [1, 2, 3]\n});"
      },
      "source": "手写all"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Promise链"],
      "question": "串行执行Promise的输出？",
      "code": "const tasks = [1, 2, 3].map(n => \n  () => Promise.resolve(n)\n);\n\ntasks.reduce(\n  (promise, task) => promise.then(task),\n  Promise.resolve()\n).then(result => console.log(result));",
      "options": [
        "3",
        "[1, 2, 3]",
        "undefined",
        "Promise"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise串行执行",
        "code": "const tasks = [\n  () => Promise.resolve(1),\n  () => Promise.resolve(2),\n  () => Promise.resolve(3)\n];\n\n// reduce串行执行\ntasks.reduce(\n  (promise, task) => promise.then(task),\n  Promise.resolve()\n).then(result => console.log(result)); // 3\n\n// 执行过程：\n// Promise.resolve()\n//   .then(() => Promise.resolve(1))  // 返回1\n//   .then(() => Promise.resolve(2))  // 返回2\n//   .then(() => Promise.resolve(3))  // 返回3\n// 最终结果是最后一个Promise的值\n\n// 如果要收集所有结果：\nasync function runSerial(tasks) {\n  const results = [];\n  for (const task of tasks) {\n    results.push(await task());\n  }\n  return results;\n}\n\nrunSerial(tasks).then(console.log); // [1, 2, 3]"
      },
      "source": "串行执行"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["并发控制"],
      "question": "实现Promise并发控制需要考虑？",
      "options": [
        "同时执行的任务数量",
        "任务队列管理",
        "错误处理",
        "结果收集",
        "任务优先级",
        "内存占用"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "Promise并发控制",
        "code": "// 限制并发数\nclass PromisePool {\n  constructor(limit) {\n    this.limit = limit;\n    this.running = 0;\n    this.queue = [];\n  }\n  \n  async add(task) {\n    // 达到限制，等待\n    while (this.running >= this.limit) {\n      await new Promise(resolve => \n        this.queue.push(resolve)\n      );\n    }\n    \n    this.running++;\n    \n    try {\n      return await task();\n    } finally {\n      this.running--;\n      \n      // 执行下一个\n      if (this.queue.length > 0) {\n        const resolve = this.queue.shift();\n        resolve();\n      }\n    }\n  }\n}\n\n// 使用\nconst pool = new PromisePool(3);\n\nconst tasks = urls.map(url => \n  () => pool.add(() => fetch(url))\n);\n\nawait Promise.all(tasks.map(task => task()));"
      },
      "source": "并发控制"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Promise.resolve"],
      "question": "Promise.resolve(promise)会创建新的Promise",
      "correctAnswer": "B",
      "explanation": {
        "title": "Promise.resolve行为",
        "code": "// 如果参数是Promise，直接返回\nconst p1 = Promise.resolve(1);\nconst p2 = Promise.resolve(p1);\n\nconsole.log(p1 === p2); // true\n\n// 如果是普通值，创建新Promise\nconst p3 = Promise.resolve(1);\nconst p4 = Promise.resolve(1);\n\nconsole.log(p3 === p4); // false\n\n// 如果是thenable，创建新Promise\nconst thenable = {\n  then(resolve) {\n    resolve(1);\n  }\n};\n\nconst p5 = Promise.resolve(thenable);\np5 instanceof Promise; // true"
      },
      "source": "Promise.resolve"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Promise超时"],
      "question": "实现带超时的Promise，空白处填什么？",
      "code": "function timeout(promise, ms) {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => \n      setTimeout(() => reject(______), ms)\n    )\n  ]);\n}",
      "options": [
        "new Error('timeout')",
        "'timeout'",
        "ms",
        "promise"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise超时控制",
        "code": "// 基础超时\nfunction timeout(promise, ms) {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => \n      setTimeout(\n        () => reject(new Error('timeout')), \n        ms\n      )\n    )\n  ]);\n}\n\n// 使用\ntry {\n  const data = await timeout(\n    fetch('/api'),\n    5000\n  );\n} catch (e) {\n  if (e.message === 'timeout') {\n    console.log('请求超时');\n  }\n}\n\n// 带清理的超时\nfunction timeoutWithCleanup(promise, ms) {\n  let timeoutId;\n  \n  const timeoutPromise = new Promise((_, reject) => {\n    timeoutId = setTimeout(\n      () => reject(new Error('timeout')),\n      ms\n    );\n  });\n  \n  return Promise.race([\n    promise.finally(() => clearTimeout(timeoutId)),\n    timeoutPromise\n  ]);\n}"
      },
      "source": "超时控制"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "Promise高级应用的最佳实践？",
      "options": [
        "合理选择Promise组合方法",
        "实现并发控制",
        "添加超时机制",
        "所有场景都用Promise.all",
        "错误分类处理",
        "避免Promise嵌套"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "Promise高级最佳实践",
        "code": "// 1. 选择合适的方法\n// all: 全成功才成功\n// race: 最快的\n// any: 任一成功\n// allSettled: 全部完成\n\n// 2. 并发控制\nclass Scheduler {\n  constructor(limit) {\n    this.limit = limit;\n    this.queue = [];\n    this.running = 0;\n  }\n  \n  async add(task) {\n    if (this.running >= this.limit) {\n      await new Promise(r => this.queue.push(r));\n    }\n    this.running++;\n    await task();\n    this.running--;\n    this.queue.shift()?.();\n  }\n}\n\n// 3. 超时控制\nfunction withTimeout(promise, ms) {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => \n      setTimeout(() => reject('timeout'), ms)\n    )\n  ]);\n}\n\n// 4. 错误分类\ntry {\n  await fetchData();\n} catch (err) {\n  if (err.name === 'NetworkError') {\n    // 网络错误\n  } else if (err.name === 'TimeoutError') {\n    // 超时错误\n  } else {\n    // 其他错误\n  }\n}\n\n// 5. 避免嵌套\n// ❌ Promise hell\ngetUser().then(user => {\n  getPosts(user).then(posts => {\n    getComments(posts).then(comments => {});\n  });\n});\n\n// ✅ 扁平化\ngetUser()\n  .then(getPosts)\n  .then(getComments);"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "async/await原理",
      "url": "18-02-async-await.html"
    },
    "next": {
      "title": "事件循环机制",
      "url": "19-01-event-loop.html"
    }
  }
};
