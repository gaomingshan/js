window.quizData_Deep12 = {
  "config": {
    "title": "生成器应用",
    "icon": "🎯",
    "description": "掌握生成器在实际开发中的应用场景与最佳实践",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["状态机"],
      "question": "如何使用生成器实现状态机？有什么优势？",
      "options": [
        "每个yield代表一个状态，通过next()切换状态，代码清晰易维护",
        "状态机无法用生成器实现",
        "必须使用类实现",
        "使用switch语句更好"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "交通信号灯状态机",
            "code": "function* trafficLight() {\n  while (true) {\n    console.log('🟢 绿灯');\n    yield 'green';\n    console.log('🟡 黄灯');\n    yield 'yellow';\n    console.log('🔴 红灯');\n    yield 'red';\n  }\n}\n\nconst light = trafficLight();\nsetInterval(() => {\n  light.next();\n}, 2000);"
          },
          {
            "title": "订单状态机",
            "code": "function* orderStateMachine() {\n  console.log('订单创建');\n  yield 'created';\n  \n  console.log('等待支付');\n  yield 'pending_payment';\n  \n  console.log('已支付');\n  yield 'paid';\n  \n  console.log('配送中');\n  yield 'shipping';\n  \n  console.log('已完成');\n  yield 'completed';\n}\n\nconst order = orderStateMachine();\norder.next(); // 'created'\norder.next(); // 'pending_payment'"
          }
        ]
      },
      "source": "状态机"
    },
    {
      "difficulty": "easy",
      "tags": ["ID生成器"],
      "question": "如何使用生成器实现唯一ID生成器？",
      "options": [
        "使用无限循环yield递增的ID值，每次调用next()获取新ID",
        "使用Math.random()",
        "使用Date.now()",
        "必须用数据库"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "简单ID生成器",
            "code": "function* idGenerator(prefix = 'id') {\n  let id = 0;\n  while (true) {\n    yield `${prefix}_${id++}`;\n  }\n}\n\nconst userIdGen = idGenerator('user');\nconsole.log(userIdGen.next().value); // 'user_0'\nconsole.log(userIdGen.next().value); // 'user_1'\nconsole.log(userIdGen.next().value); // 'user_2'\n\nconst orderIdGen = idGenerator('order');\nconsole.log(orderIdGen.next().value); // 'order_0'"
          },
          {
            "title": "UUID风格生成器",
            "code": "function* uuidGenerator() {\n  while (true) {\n    yield `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;\n  }\n}\n\nconst uuid = uuidGenerator();\nconsole.log(uuid.next().value);\n// '1701234567890-abc123def'"
          }
        ]
      },
      "source": "ID生成器"
    },
    {
      "difficulty": "medium",
      "tags": ["异步流程控制"],
      "question": "生成器如何配合Promise实现异步流程控制？",
      "options": [
        "yield Promise对象，通过执行器自动处理then/catch，实现同步化的异步代码",
        "生成器不能处理异步",
        "必须使用async/await",
        "只能用回调函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "1. 基本执行器",
            "code": "function run(generatorFn) {\n  const gen = generatorFn();\n  \n  function step(value) {\n    const result = gen.next(value);\n    \n    if (result.done) {\n      return Promise.resolve(result.value);\n    }\n    \n    return Promise.resolve(result.value)\n      .then(step)\n      .catch(err => gen.throw(err));\n  }\n  \n  return step();\n}\n\n// 使用\nrun(function* () {\n  const user = yield fetchUser(1);\n  const posts = yield fetchPosts(user.id);\n  return posts;\n}).then(posts => console.log(posts));"
          },
          {
            "title": "2. 错误处理",
            "code": "function* fetchData() {\n  try {\n    const user = yield fetch('/api/user');\n    const data = yield fetch(`/api/data/${user.id}`);\n    return data;\n  } catch (error) {\n    console.error('请求失败:', error);\n    return null;\n  }\n}\n\nrun(fetchData);"
          }
        ]
      },
      "source": "异步流程控制"
    },
    {
      "difficulty": "medium",
      "tags": ["数据生产消费"],
      "question": "如何使用生成器实现生产者-消费者模式？",
      "options": [
        "生成器作为生产者yield数据，消费者通过for...of消费，实现解耦",
        "必须使用队列",
        "无法实现",
        "需要多线程"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "1. 数据生产者",
            "code": "function* dataProducer() {\n  let count = 0;\n  while (count < 10) {\n    // 模拟生产数据\n    const data = {\n      id: count++,\n      timestamp: Date.now(),\n      value: Math.random()\n    };\n    yield data;\n  }\n}\n\n// 消费者\nfor (const item of dataProducer()) {\n  console.log('处理数据:', item);\n}"
          },
          {
            "title": "2. 批量生产消费",
            "code": "function* batchProducer(data, batchSize) {\n  for (let i = 0; i < data.length; i += batchSize) {\n    yield data.slice(i, i + batchSize);\n  }\n}\n\nconst largeData = Array.from({length: 100}, (_, i) => i);\n\nfor (const batch of batchProducer(largeData, 10)) {\n  console.log('处理批次:', batch);\n  // 分批处理，避免内存溢出\n}"
          }
        ]
      },
      "source": "生产者消费者"
    },
    {
      "difficulty": "medium",
      "tags": ["惰性求值"],
      "question": "生成器如何实现惰性求值（Lazy Evaluation）？有什么好处？",
      "options": [
        "值在被请求时才计算，节省内存和计算资源，支持无限序列",
        "必须预先计算所有值",
        "与普通函数相同",
        "会降低性能"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "1. 惰性链式操作",
            "code": "function* map(iterable, fn) {\n  for (const item of iterable) {\n    yield fn(item);\n  }\n}\n\nfunction* filter(iterable, predicate) {\n  for (const item of iterable) {\n    if (predicate(item)) yield item;\n  }\n}\n\nfunction* range(start, end) {\n  for (let i = start; i < end; i++) {\n    console.log('生成:', i);\n    yield i;\n  }\n}\n\n// 构建管道（不执行）\nconst pipeline = map(\n  filter(\n    range(0, 1000000),\n    x => x % 2 === 0\n  ),\n  x => x * x\n);\n\n// 只取前5个（只执行必要的计算）\nconst result = [];\nfor (const value of pipeline) {\n  result.push(value);\n  if (result.length >= 5) break;\n}\nconsole.log(result); // [0, 4, 16, 36, 64]"
          },
          {
            "title": "2. 优势",
            "points": [
              "按需计算，节省资源",
              "可处理无限数据流",
              "提高性能（短路求值）",
              "组合操作更高效"
            ]
          }
        ]
      },
      "source": "惰性求值"
    },
    {
      "difficulty": "medium",
      "tags": ["迭代器模式"],
      "question": "如何用生成器实现常见的数据结构迭代器（如二叉树）？",
      "options": [
        "使用yield*递归遍历，简化代码实现",
        "必须手动实现next()方法",
        "无法实现",
        "只能用循环"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "二叉树遍历实现：",
        "code": "class TreeNode {\n  constructor(value, left = null, right = null) {\n    this.value = value;\n    this.left = left;\n    this.right = right;\n  }\n\n  // 前序遍历\n  *preOrder() {\n    yield this.value;\n    if (this.left) yield* this.left.preOrder();\n    if (this.right) yield* this.right.preOrder();\n  }\n\n  // 中序遍历\n  *inOrder() {\n    if (this.left) yield* this.left.inOrder();\n    yield this.value;\n    if (this.right) yield* this.right.inOrder();\n  }\n\n  // 后序遍历\n  *postOrder() {\n    if (this.left) yield* this.left.postOrder();\n    if (this.right) yield* this.right.postOrder();\n    yield this.value;\n  }\n}\n\nconst tree = new TreeNode(1,\n  new TreeNode(2,\n    new TreeNode(4),\n    new TreeNode(5)\n  ),\n  new TreeNode(3)\n);\n\nconsole.log([...tree.preOrder()]);  // [1,2,4,5,3]\nconsole.log([...tree.inOrder()]);   // [4,2,5,1,3]\nconsole.log([...tree.postOrder()]); // [4,5,2,3,1]"
      },
      "source": "迭代器模式"
    },
    {
      "difficulty": "hard",
      "tags": ["Co库实现"],
      "question": "如何实现类似co库的生成器执行器？",
      "options": [
        "递归处理yield的Promise，自动执行next()，捕获错误并支持返回值",
        "无法实现",
        "必须使用原生库",
        "只能手动调用next()"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Co库核心实现：",
        "code": "function co(generatorFn) {\n  return new Promise((resolve, reject) => {\n    const gen = generatorFn();\n    \n    function step(nextFn) {\n      let next;\n      try {\n        next = nextFn();\n      } catch (e) {\n        return reject(e);\n      }\n      \n      if (next.done) {\n        return resolve(next.value);\n      }\n      \n      Promise.resolve(next.value)\n        .then(\n          value => step(() => gen.next(value)),\n          err => step(() => gen.throw(err))\n        )\n        .catch(reject);\n    }\n    \n    step(() => gen.next());\n  });\n}\n\n// 使用示例\nco(function* () {\n  const user = yield fetchUser(1);\n  console.log('用户:', user);\n  \n  const posts = yield fetchPosts(user.id);\n  console.log('文章:', posts);\n  \n  return { user, posts };\n}).then(result => {\n  console.log('完成:', result);\n}).catch(err => {\n  console.error('错误:', err);\n});\n\n// 支持并行\nco(function* () {\n  const [user, config] = yield [\n    fetchUser(1),\n    fetchConfig()\n  ];\n  return { user, config };\n});"
      },
      "source": "Co库"
    },
    {
      "difficulty": "hard",
      "tags": ["Redux-Saga"],
      "question": "Redux-Saga如何使用生成器管理副作用？有什么优势？",
      "options": [
        "使用生成器函数描述副作用流程，通过yield Effect对象声明式控制，易测试和组合",
        "Redux-Saga不使用生成器",
        "与普通中间件相同",
        "必须使用async/await"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "1. Saga基本示例",
            "code": "import { call, put, takeEvery } from 'redux-saga/effects';\n\nfunction* fetchUserSaga(action) {\n  try {\n    // call: 调用异步函数\n    const user = yield call(api.fetchUser, action.userId);\n    \n    // put: 派发action\n    yield put({ type: 'USER_FETCH_SUCCESS', user });\n  } catch (error) {\n    yield put({ type: 'USER_FETCH_ERROR', error });\n  }\n}\n\n// 监听action\nfunction* watchFetchUser() {\n  yield takeEvery('USER_FETCH_REQUEST', fetchUserSaga);\n}"
          },
          {
            "title": "2. 复杂流程控制",
            "code": "function* loginFlow() {\n  while (true) {\n    // 等待登录\n    const { username, password } = yield take('LOGIN_REQUEST');\n    \n    // 调用登录API\n    const { success, token } = yield call(api.login, username, password);\n    \n    if (success) {\n      yield put({ type: 'LOGIN_SUCCESS', token });\n      \n      // 等待登出\n      yield take('LOGOUT');\n      yield call(api.logout);\n    } else {\n      yield put({ type: 'LOGIN_ERROR' });\n    }\n  }\n}"
          },
          {
            "title": "3. 优势",
            "points": [
              "声明式编程，易于理解",
              "副作用集中管理",
              "易于测试（只测试yield的值）",
              "强大的流程控制能力"
            ]
          }
        ]
      },
      "source": "Redux-Saga"
    },
    {
      "difficulty": "hard",
      "tags": ["数据管道"],
      "question": "如何使用生成器构建高性能数据处理管道？",
      "options": [
        "组合多个生成器函数，实现流式处理，避免中间数组，降低内存占用",
        "必须使用数组",
        "性能不如数组方法",
        "无法实现"
      ],
      "correctAnswer": "A",
      "explanation": {
        "sections": [
          {
            "title": "1. 管道函数库",
            "code": "function* map(iterable, fn) {\n  for (const item of iterable) {\n    yield fn(item);\n  }\n}\n\nfunction* filter(iterable, predicate) {\n  for (const item of iterable) {\n    if (predicate(item)) yield item;\n  }\n}\n\nfunction* take(iterable, n) {\n  let count = 0;\n  for (const item of iterable) {\n    if (count++ >= n) break;\n    yield item;\n  }\n}\n\nfunction* flatMap(iterable, fn) {\n  for (const item of iterable) {\n    yield* fn(item);\n  }\n}\n\nfunction reduce(iterable, fn, initial) {\n  let acc = initial;\n  for (const item of iterable) {\n    acc = fn(acc, item);\n  }\n  return acc;\n}"
          },
          {
            "title": "2. 实际应用",
            "code": "// 处理大文件\nfunction* readLines(file) {\n  // 逐行读取\n  for (const line of file) {\n    yield line;\n  }\n}\n\nconst result = reduce(\n  map(\n    filter(\n      readLines(hugeFile),\n      line => line.includes('ERROR')\n    ),\n    line => line.split('|')[2]\n  ),\n  (count) => count + 1,\n  0\n);\n\nconsole.log('错误数:', result);"
          },
          {
            "title": "3. 性能对比",
            "code": "// 数组方式（创建中间数组）\nconst arr = [1, 2, 3, 4, 5];\nconst result1 = arr\n  .map(x => x * 2)      // [2,4,6,8,10]\n  .filter(x => x > 5)   // [6,8,10]\n  .slice(0, 2);         // [6,8]\n\n// 生成器方式（惰性求值）\nconst result2 = [\n  ...take(\n    filter(\n      map([1,2,3,4,5], x => x * 2),\n      x => x > 5\n    ),\n    2\n  )\n]; // [6,8]\n\n// 生成器只计算需要的值"
          }
        ]
      },
      "source": "数据管道"
    },
    {
      "difficulty": "hard",
      "tags": ["协程调度"],
      "question": "如何实现一个基于生成器的协作式任务调度器？",
      "options": [
        "维护任务队列，轮询执行各任务的next()，实现时间片轮转调度",
        "使用多线程",
        "无法实现",
        "必须用setTimeout"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "任务调度器实现：",
        "code": "class TaskScheduler {\n  constructor() {\n    this.tasks = [];\n  }\n\n  addTask(generator) {\n    this.tasks.push(generator());\n  }\n\n  run() {\n    while (this.tasks.length > 0) {\n      // 取出第一个任务\n      const task = this.tasks.shift();\n      const { done } = task.next();\n      \n      // 如果未完成，放回队列末尾\n      if (!done) {\n        this.tasks.push(task);\n      }\n    }\n    console.log('所有任务完成');\n  }\n}\n\n// 使用示例\nconst scheduler = new TaskScheduler();\n\nscheduler.addTask(function* () {\n  console.log('任务A-1');\n  yield;\n  console.log('任务A-2');\n  yield;\n  console.log('任务A-3');\n});\n\nscheduler.addTask(function* () {\n  console.log('任务B-1');\n  yield;\n  console.log('任务B-2');\n});\n\nscheduler.run();\n// 输出:\n// 任务A-1\n// 任务B-1\n// 任务A-2\n// 任务B-2\n// 任务A-3\n// 所有任务完成"
      },
      "source": "协程调度"
    }
  ],
  "navigation": {
    "prev": {
      "title": "生成器函数",
      "url": "11-generator-function.html"
    },
    "next": {
      "title": "异步迭代器",
      "url": "13-async-iterator.html"
    }
  }
};
