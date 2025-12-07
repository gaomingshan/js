/**
 * 并发模型
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1903ConcurrencyModel = {
  "config": {
    "title": "并发模型",
    "icon": "🔀",
    "description": "深入理解JavaScript的并发模型和单线程特性",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["并发模型"],
      "question": "JavaScript采用什么并发模型？",
      "options": [
        "基于事件循环的单线程模型",
        "多线程模型",
        "多进程模型",
        "协程模型"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript并发模型",
        "code": "// JavaScript是单线程的\n// 通过事件循环处理异步任务\n\n// 主线程执行栈\nfunction main() {\n  console.log('start');\n  \n  // 异步任务进入任务队列\n  setTimeout(() => {\n    console.log('timeout');\n  }, 0);\n  \n  console.log('end');\n}\n\n// 输出: start, end, timeout\n\n// 单线程优势：\n// 1. 避免多线程同步问题\n// 2. 简化编程模型\n// 3. 避免死锁\n\n// 单线程限制：\n// 1. CPU密集型任务会阻塞\n// 2. 需要异步处理I/O"
      },
      "source": "并发模型"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Run-to-completion"],
      "question": "以下代码的输出是什么？",
      "code": "let i = 0;\n\nsetTimeout(() => {\n  console.log('timeout');\n}, 0);\n\nwhile (i < 1000000000) {\n  i++;\n}\n\nconsole.log('done');",
      "options": [
        "done, timeout（done延迟很久）",
        "timeout, done",
        "done（timeout不执行）",
        "并行输出"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Run-to-completion",
        "code": "let i = 0;\n\nsetTimeout(() => {\n  console.log('timeout');\n}, 0);\n\n// 长时间运行的同步代码\nwhile (i < 1000000000) {\n  i++;\n}\n\nconsole.log('done');\n\n// Run-to-completion：\n// 当前任务必须完全执行完，才能执行下一个任务\n\n// 执行流程：\n// 1. setTimeout加入宏任务队列\n// 2. while循环阻塞主线程（很久）\n// 3. 输出done\n// 4. 执行timeout\n\n// 输出: done, timeout\n// （done会延迟很久才输出）\n\n// 这就是为什么要避免长任务阻塞主线程"
      },
      "source": "Run-to-completion"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Web Worker"],
      "question": "Web Worker的特点有哪些？",
      "options": [
        "运行在独立线程",
        "不能访问DOM",
        "通过消息通信",
        "可以共享变量",
        "可以使用大部分Web API",
        "与主线程共享内存"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "Web Worker多线程",
        "code": "// 主线程\nconst worker = new Worker('worker.js');\n\n// 发送消息\nworker.postMessage({ data: [1, 2, 3] });\n\n// 接收消息\nworker.onmessage = (e) => {\n  console.log('结果:', e.data);\n};\n\n// worker.js\nself.onmessage = (e) => {\n  const data = e.data.data;\n  \n  // 可以执行CPU密集型任务\n  const result = heavyComputation(data);\n  \n  // 发送结果\n  self.postMessage(result);\n};\n\n// Worker限制：\n// 1. 不能访问DOM\n// 2. 不能访问window对象\n// 3. 通过消息通信（序列化）\n// 4. 可以使用：\n//    - XMLHttpRequest\n//    - WebSocket\n//    - IndexedDB\n//    - Web Workers（嵌套）"
      },
      "source": "Web Worker"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["SharedArrayBuffer"],
      "question": "SharedArrayBuffer可以在主线程和Worker间共享内存",
      "correctAnswer": "A",
      "explanation": {
        "title": "SharedArrayBuffer",
        "code": "// 主线程\nconst sab = new SharedArrayBuffer(1024);\nconst view = new Int32Array(sab);\n\n// 发送给Worker\nworker.postMessage({ buffer: sab });\n\n// 主线程修改\nview[0] = 123;\n\n// Worker中\nself.onmessage = (e) => {\n  const view = new Int32Array(e.data.buffer);\n  \n  // 读取主线程写入的值\n  console.log(view[0]); // 123\n  \n  // Worker修改\n  view[0] = 456;\n};\n\n// 主线程可以看到Worker的修改\nconsole.log(view[0]); // 456\n\n// 需要原子操作避免竞态\nAtomics.add(view, 0, 1);\nAtomics.wait(view, 0, 0);\nAtomics.notify(view, 0);"
      },
      "source": "SharedArrayBuffer"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["并发控制"],
      "question": "实现并发限制，空白处填什么？",
      "code": "async function parallelLimit(tasks, limit) {\n  const results = [];\n  const executing = [];\n  \n  for (const task of tasks) {\n    const p = task().then(result => {\n      results.push(result);\n      executing.splice(______, 1);\n    });\n    \n    executing.push(p);\n    \n    if (executing.length >= limit) {\n      await Promise.race(executing);\n    }\n  }\n  \n  await Promise.all(executing);\n  return results;\n}",
      "options": [
        "executing.indexOf(p)",
        "0",
        "executing.length - 1",
        "results.length"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "并发限制实现",
        "code": "// 限制并发数量\nasync function parallelLimit(tasks, limit) {\n  const results = [];\n  const executing = [];\n  \n  for (const task of tasks) {\n    const p = task().then(result => {\n      results.push(result);\n      // 完成后从executing中移除\n      executing.splice(executing.indexOf(p), 1);\n      return result;\n    });\n    \n    executing.push(p);\n    \n    // 达到限制，等待最快的完成\n    if (executing.length >= limit) {\n      await Promise.race(executing);\n    }\n  }\n  \n  // 等待所有完成\n  await Promise.all(executing);\n  return results;\n}\n\n// 使用\nconst tasks = urls.map(url => \n  () => fetch(url)\n);\n\nawait parallelLimit(tasks, 3); // 最多3个并发"
      },
      "source": "并发限制"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["竞态条件"],
      "question": "以下代码可能的输出？",
      "code": "let count = 0;\n\nasync function increment() {\n  const temp = count;\n  await delay(Math.random() * 100);\n  count = temp + 1;\n}\n\nPromise.all([\n  increment(),\n  increment(),\n  increment()\n]).then(() => console.log(count));",
      "options": [
        "可能是1, 2, 或3",
        "一定是3",
        "一定是1",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "竞态条件",
        "code": "let count = 0;\n\nasync function increment() {\n  const temp = count;  // 读取\n  await delay(Math.random() * 100);  // 延迟\n  count = temp + 1;  // 写入\n}\n\n// 3个increment并发执行\nPromise.all([\n  increment(),  // temp1 = 0\n  increment(),  // temp2 = 0\n  increment()   // temp3 = 0\n]).then(() => console.log(count));\n\n// 可能的执行顺序：\n// 1. 都读到0\n// 2. 都写入1\n// 3. 结果是1（丢失2次更新）\n\n// 或者：\n// 1. A读0，写1\n// 2. B读1，写2\n// 3. C读2，写3\n// 4. 结果是3\n\n// 解决方案：使用锁\nconst lock = new Lock();\n\nasync function safeIncrement() {\n  await lock.acquire();\n  try {\n    count++;\n  } finally {\n    lock.release();\n  }\n}"
      },
      "source": "竞态条件"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["并发模式"],
      "question": "JavaScript中的并发模式有哪些？",
      "options": [
        "回调函数",
        "Promise",
        "async/await",
        "生成器",
        "多线程（Java风格）",
        "协程"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "JavaScript并发模式",
        "code": "// 1. 回调函数\nfs.readFile('file', (err, data) => {\n  if (err) return handleError(err);\n  process(data);\n});\n\n// 2. Promise\nfetch('/api')\n  .then(res => res.json())\n  .then(data => process(data))\n  .catch(handleError);\n\n// 3. async/await\nasync function loadData() {\n  try {\n    const res = await fetch('/api');\n    const data = await res.json();\n    process(data);\n  } catch (err) {\n    handleError(err);\n  }\n}\n\n// 4. 生成器（配合co库）\nfunction* getData() {\n  const res = yield fetch('/api');\n  const data = yield res.json();\n  return data;\n}\n\n// 5. 事件发射器\nemitter.on('data', (data) => {\n  process(data);\n});\n\n// 6. 响应式编程（RxJS）\nobservable.subscribe({\n  next: data => process(data),\n  error: err => handleError(err)\n});"
      },
      "source": "并发模式"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["非阻塞IO"],
      "question": "JavaScript的I/O操作是非阻塞的",
      "correctAnswer": "A",
      "explanation": {
        "title": "非阻塞I/O",
        "code": "// JavaScript的I/O是非阻塞的\n\n// 文件读取（异步）\nfs.readFile('file.txt', (err, data) => {\n  console.log('文件内容:', data);\n});\n\nconsole.log('继续执行'); // 不会等待\n\n// 网络请求（异步）\nfetch('/api').then(res => {\n  console.log('响应:', res);\n});\n\nconsole.log('继续执行'); // 不会等待\n\n// 好处：\n// 1. 主线程不会被I/O阻塞\n// 2. 可以处理大量并发I/O\n// 3. 高吞吐量\n\n// Node.js的优势就在于此\n// 可以处理数千个并发连接"
      },
      "source": "非阻塞IO"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["取消令牌"],
      "question": "实现可取消的异步操作，空白处填什么？",
      "code": "class CancelToken {\n  constructor() {\n    this.promise = new Promise(resolve => {\n      this.cancel = resolve;\n    });\n  }\n}\n\nfunction fetchWithCancel(url, token) {\n  return Promise.race([\n    fetch(url),\n    ______\n  ]);\n}",
      "options": [
        "token.promise.then(() => Promise.reject('cancelled'))",
        "token.cancel()",
        "new Promise(() => {})",
        "Promise.resolve('cancelled')"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "取消令牌实现",
        "code": "// AbortController风格的取消\nclass CancelToken {\n  constructor() {\n    this.cancelled = false;\n    this.promise = new Promise((resolve) => {\n      this.cancel = () => {\n        this.cancelled = true;\n        resolve();\n      };\n    });\n  }\n}\n\nfunction fetchWithCancel(url, token) {\n  return Promise.race([\n    fetch(url),\n    token.promise.then(() => \n      Promise.reject(new Error('cancelled'))\n    )\n  ]);\n}\n\n// 使用\nconst token = new CancelToken();\n\nfetchWithCancel('/api', token)\n  .then(res => console.log(res))\n  .catch(err => {\n    if (err.message === 'cancelled') {\n      console.log('请求被取消');\n    }\n  });\n\n// 取消请求\ntoken.cancel();\n\n// 标准AbortController\nconst controller = new AbortController();\n\nfetch('/api', { signal: controller.signal })\n  .catch(err => {\n    if (err.name === 'AbortError') {\n      console.log('请求被取消');\n    }\n  });\n\ncontroller.abort();"
      },
      "source": "取消令牌"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "并发编程的最佳实践？",
      "options": [
        "避免竞态条件",
        "使用不可变数据",
        "合理使用锁机制",
        "CPU密集任务用Worker",
        "所有代码都异步化",
        "限制并发数量"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "并发最佳实践",
        "code": "// 1. 避免竞态条件\nlet processing = false;\n\nasync function process() {\n  if (processing) return;\n  processing = true;\n  \n  try {\n    await doWork();\n  } finally {\n    processing = false;\n  }\n}\n\n// 2. 不可变数据\nconst state = { count: 0 };\n\n// ❌ 可变\nstate.count++;\n\n// ✅ 不可变\nconst newState = { ...state, count: state.count + 1 };\n\n// 3. 锁机制\nclass Lock {\n  constructor() {\n    this.locked = false;\n    this.waiting = [];\n  }\n  \n  async acquire() {\n    if (!this.locked) {\n      this.locked = true;\n      return;\n    }\n    await new Promise(resolve => \n      this.waiting.push(resolve)\n    );\n  }\n  \n  release() {\n    const resolve = this.waiting.shift();\n    if (resolve) {\n      resolve();\n    } else {\n      this.locked = false;\n    }\n  }\n}\n\n// 4. CPU密集任务\nconst worker = new Worker('heavy.js');\nworker.postMessage(data);\n\n// 5. 限制并发\nconst pool = new PromisePool(3);\nawait pool.all(tasks);"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "宏任务与微任务",
      "url": "19-02-macro-micro-tasks.html"
    },
    "next": {
      "title": "Proxy与Reflect",
      "url": "20-01-proxy-reflect.html"
    }
  }
};
