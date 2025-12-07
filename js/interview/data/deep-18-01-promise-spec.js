/**
 * Promise A+规范
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1801PromiseSpec = {
  "config": {
    "title": "Promise A+规范",
    "icon": "📜",
    "description": "深入理解Promise A+规范和实现原理",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Promise状态"],
      "question": "Promise有几种状态？",
      "options": [
        "3种：pending、fulfilled、rejected",
        "2种：pending、settled",
        "4种：pending、fulfilled、rejected、cancelled",
        "5种状态"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise三种状态",
        "code": "// Promise的三种状态\n// 1. pending（进行中）\n// 2. fulfilled（已成功）\n// 3. rejected（已失败）\n\nconst p1 = new Promise((resolve, reject) => {\n  // pending状态\n});\n\nconst p2 = Promise.resolve(1);\n// fulfilled状态\n\nconst p3 = Promise.reject(new Error());\n// rejected状态\n\n// 状态转换：\n// pending → fulfilled（不可逆）\n// pending → rejected（不可逆）\n// fulfilled/rejected不能再改变"
      },
      "source": "Promise状态"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["then链式调用"],
      "question": "以下代码的输出是什么？",
      "code": "Promise.resolve(1)\n  .then(x => x + 1)\n  .then(x => { throw new Error('error'); })\n  .then(x => x + 1)\n  .catch(e => 0)\n  .then(x => console.log(x));",
      "options": [
        "0",
        "3",
        "报错",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise链式调用",
        "code": "Promise.resolve(1)\n  .then(x => x + 1)        // 2\n  .then(x => { \n    throw new Error('error'); \n  })                       // rejected\n  .then(x => x + 1)        // 跳过（rejected状态）\n  .catch(e => 0)           // 捕获错误，返回0\n  .then(x => console.log(x)); // 输出: 0\n\n// 规则：\n// 1. then返回新Promise\n// 2. rejected状态会跳过后续then\n// 3. catch捕获错误后返回fulfilled\n// 4. 错误会沿着链传播直到被捕获"
      },
      "source": "then链"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Promise A+规范"],
      "question": "Promise A+规范要求哪些？",
      "options": [
        "then方法必须返回Promise",
        "支持值穿透",
        "onFulfilled必须异步执行",
        "必须支持finally方法",
        "thenable对象视为Promise",
        "必须有catch方法"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "Promise A+核心要求",
        "code": "// 1. then返回新Promise\nconst p1 = promise.then();\np1 instanceof Promise; // true\n\n// 2. 值穿透\nPromise.resolve(1)\n  .then()        // 没有处理函数\n  .then()        // 值穿透\n  .then(x => console.log(x)); // 1\n\n// 3. 异步执行（微任务）\nPromise.resolve().then(() => {\n  console.log('then');\n});\nconsole.log('sync');\n// 输出: sync, then\n\n// 4. thenable对象\nconst thenable = {\n  then(resolve, reject) {\n    resolve(1);\n  }\n};\n\nPromise.resolve(thenable)\n  .then(x => console.log(x)); // 1\n\n// 注意：finally和catch不在A+规范中\n// 是ES6 Promise的扩展"
      },
      "source": "A+规范"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["微任务"],
      "question": "Promise的then回调在微任务队列中执行",
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise微任务",
        "code": "console.log('1');\n\nPromise.resolve().then(() => {\n  console.log('2');\n});\n\nconsole.log('3');\n\n// 输出顺序: 1, 3, 2\n\n// 原因：\n// 1. 同步代码先执行\n// 2. then回调进入微任务队列\n// 3. 主线程任务完成后执行微任务\n\n// 微任务 vs 宏任务\nsetTimeout(() => console.log('宏'), 0);\nPromise.resolve().then(() => console.log('微'));\n// 输出: 微, 宏\n\n// 微任务优先级高于宏任务"
      },
      "source": "微任务"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["手写Promise"],
      "question": "实现Promise.resolve，空白处填什么？",
      "code": "Promise.resolve = function(value) {\n  if (value instanceof Promise) {\n    return value;\n  }\n  return new Promise(resolve => ______);\n};",
      "options": [
        "resolve(value)",
        "return value",
        "resolve()",
        "this.resolve(value)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.resolve实现",
        "code": "Promise.resolve = function(value) {\n  // 如果已经是Promise，直接返回\n  if (value instanceof Promise) {\n    return value;\n  }\n  \n  // 如果是thenable对象\n  if (value && typeof value.then === 'function') {\n    return new Promise((resolve, reject) => {\n      value.then(resolve, reject);\n    });\n  }\n  \n  // 普通值包装成Promise\n  return new Promise(resolve => {\n    resolve(value);\n  });\n};\n\n// 使用\nPromise.resolve(1).then(x => console.log(x)); // 1\nPromise.resolve(Promise.resolve(2)).then(x => console.log(x)); // 2"
      },
      "source": "Promise.resolve"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Promise执行时机"],
      "question": "以下代码的输出顺序是什么？",
      "code": "const p = new Promise((resolve) => {\n  console.log('1');\n  resolve();\n  console.log('2');\n});\n\np.then(() => console.log('3'));\n\nconsole.log('4');",
      "options": [
        "1, 2, 4, 3",
        "1, 2, 3, 4",
        "1, 4, 2, 3",
        "4, 1, 2, 3"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise执行顺序",
        "code": "const p = new Promise((resolve) => {\n  console.log('1');  // 同步执行\n  resolve();         // 改变状态\n  console.log('2');  // 继续同步执行\n});\n\np.then(() => console.log('3')); // 微任务\n\nconsole.log('4');  // 同步执行\n\n// 执行顺序：\n// 1. Promise executor立即同步执行 → 1\n// 2. resolve()改变状态（同步）\n// 3. executor继续执行 → 2\n// 4. then回调加入微任务队列\n// 5. 同步代码 → 4\n// 6. 执行微任务 → 3\n\n// 输出: 1, 2, 4, 3"
      },
      "source": "执行时机"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["then方法"],
      "question": "关于then方法说法正确的是？",
      "options": [
        "接收两个函数参数",
        "总是返回新Promise",
        "可以链式调用",
        "第二个参数可捕获错误",
        "必须传递两个参数",
        "返回值会被包装成Promise"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "then方法特性",
        "code": "// 1. 两个参数：onFulfilled, onRejected\npromise.then(\n  value => { /* 成功回调 */ },\n  error => { /* 失败回调 */ }\n);\n\n// 2. 返回新Promise\nconst p2 = p1.then(() => {});\np2 !== p1; // true\n\n// 3. 链式调用\nPromise.resolve(1)\n  .then(x => x + 1)\n  .then(x => x * 2)\n  .then(x => console.log(x)); // 4\n\n// 4. 第二个参数捕获错误\nPromise.reject('error').then(\n  null,\n  err => console.log(err) // 'error'\n);\n\n// 5. 参数可选\nPromise.resolve(1)\n  .then()  // 值穿透\n  .then(x => console.log(x)); // 1\n\n// 6. 返回值包装\nPromise.resolve()\n  .then(() => 1)  // 返回1\n  .then(x => console.log(x)); // 1\n\nPromise.resolve()\n  .then(() => Promise.resolve(2))\n  .then(x => console.log(x)); // 2"
      },
      "source": "then方法"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["catch"],
      "question": "catch方法等价于then(null, onRejected)",
      "correctAnswer": "A",
      "explanation": {
        "title": "catch方法本质",
        "code": "// catch是then的语法糖\npromise.catch(err => {\n  console.log(err);\n});\n\n// 等价于\npromise.then(null, err => {\n  console.log(err);\n});\n\n// catch可以捕获：\n// 1. Promise reject\nPromise.reject('error')\n  .catch(e => console.log(e)); // 'error'\n\n// 2. then中抛出的错误\nPromise.resolve()\n  .then(() => { throw new Error('error'); })\n  .catch(e => console.log(e.message)); // 'error'\n\n// 3. 链式调用中的任何错误\nPromise.resolve()\n  .then(() => { throw 1; })\n  .then(() => { throw 2; })\n  .catch(e => console.log(e)); // 1（第一个错误）"
      },
      "source": "catch"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Promise链"],
      "question": "实现Promise.prototype.finally，空白处填什么？",
      "code": "Promise.prototype.finally = function(callback) {\n  return this.then(\n    value => Promise.resolve(callback()).then(() => ______),\n    reason => Promise.resolve(callback()).then(() => { throw reason; })\n  );\n};",
      "options": [
        "value",
        "callback()",
        "this",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "finally实现",
        "code": "Promise.prototype.finally = function(callback) {\n  return this.then(\n    value => {\n      // 成功时：执行callback，返回原值\n      return Promise.resolve(callback())\n        .then(() => value);\n    },\n    reason => {\n      // 失败时：执行callback，抛出原错误\n      return Promise.resolve(callback())\n        .then(() => { throw reason; });\n    }\n  );\n};\n\n// 特点：\n// 1. 无论成功失败都执行\n// 2. 不改变Promise的值或状态\n// 3. 返回新Promise\n\nPromise.resolve(1)\n  .finally(() => {\n    console.log('finally');\n    return 100; // 被忽略\n  })\n  .then(x => console.log(x)); // 1"
      },
      "source": "finally"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "Promise使用的最佳实践？",
      "options": [
        "始终返回Promise",
        "使用catch处理错误",
        "避免Promise嵌套",
        "优先使用async/await",
        "在构造函数中处理异步",
        "多个独立Promise用Promise.all"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "Promise最佳实践",
        "code": "// 1. 始终返回Promise\nfunction getData() {\n  return fetch('/api')  // ✅ 返回Promise\n    .then(res => res.json());\n}\n\n// 2. 错误处理\ngetData()\n  .then(data => process(data))\n  .catch(err => handleError(err));  // ✅\n\n// 3. 避免嵌套（Promise hell）\n// ❌ 不好\ngetUser().then(user => {\n  getPosts(user).then(posts => {\n    getComments(posts).then(comments => {});\n  });\n});\n\n// ✅ 好：扁平化\ngetUser()\n  .then(user => getPosts(user))\n  .then(posts => getComments(posts))\n  .then(comments => {});\n\n// 4. 使用async/await\nasync function loadData() {\n  try {\n    const user = await getUser();\n    const posts = await getPosts(user);\n    return posts;\n  } catch (err) {\n    handleError(err);\n  }\n}\n\n// 5. 并行Promise\nPromise.all([\n  fetch('/api/1'),\n  fetch('/api/2'),\n  fetch('/api/3')\n]);"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "异步迭代器",
      "url": "17-04-async-iterator.html"
    },
    "next": {
      "title": "async/await原理",
      "url": "18-02-async-await.html"
    }
  }
};
