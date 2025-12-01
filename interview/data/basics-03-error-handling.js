window.quizData_Basics03ErrorHandling = {
  "config": {
    "title": "错误处理",
    "icon": "⚠️",
    "description": "掌握try/catch、throw、Error对象等错误处理机制",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["try...catch"],
      "question": "try...catch的基本作用是什么？",
      "options": [
        "捕获并处理代码块中的运行时错误，防止程序崩溃",
        "预防所有错误",
        "提高性能",
        "编译时检查"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "try...catch基础：",
        "sections": [
          {
            "title": "基本语法",
            "code": "try {\n  // 可能抛出错误的代码\n  const result = riskyOperation();\n} catch (error) {\n  // 错误处理\n  console.error('发生错误:', error.message);\n} finally {\n  // 总是执行（可选）\n  cleanup();\n}"
          },
          {
            "title": "只捕获运行时错误",
            "code": "// 可以捕获\ntry {\n  undefined.foo(); // TypeError\n} catch (e) {\n  console.log('捕获到');\n}\n\n// 无法捕获语法错误\ntry {\n  eval('var a ='); // SyntaxError\n} catch (e) {\n  // 不会执行（语法错误在解析阶段）\n}"
          }
        ]
      },
      "source": "try...catch"
    },
    {
      "difficulty": "easy",
      "tags": ["Error对象"],
      "question": "JavaScript有哪些内置的Error类型？",
      "options": [
        "Error、SyntaxError、TypeError、ReferenceError、RangeError、URIError、EvalError",
        "只有Error",
        "只有TypeError",
        "没有Error类型"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "内置Error类型：",
        "sections": [
          {
            "title": "1. Error（基类）",
            "code": "const err = new Error('出错了');\nconsole.log(err.message); // '出错了'\nconsole.log(err.name);    // 'Error'"
          },
          {
            "title": "2. SyntaxError",
            "code": "// 语法错误\neval('var a ='); // SyntaxError\nJSON.parse('{invalid}'); // SyntaxError"
          },
          {
            "title": "3. TypeError",
            "code": "// 类型错误\nnull.foo(); // TypeError\n(123)(); // TypeError"
          },
          {
            "title": "4. ReferenceError",
            "code": "// 引用错误\nconsole.log(notDefined); // ReferenceError"
          },
          {
            "title": "5. RangeError",
            "code": "// 范围错误\nnew Array(-1); // RangeError\n(10).toFixed(101); // RangeError"
          },
          {
            "title": "6. URIError",
            "code": "// URI错误\ndecodeURIComponent('%'); // URIError"
          }
        ]
      },
      "source": "Error类型"
    },
    {
      "difficulty": "medium",
      "tags": ["throw"],
      "question": "throw可以抛出什么类型的值？",
      "options": [
        "任何类型的值（基本类型、对象、Error等）",
        "只能抛出Error对象",
        "只能抛出字符串",
        "只能抛出数字"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "throw语句：",
        "sections": [
          {
            "title": "可以抛出任何值",
            "code": "// 抛出字符串\nthrow 'Error message';\n\n// 抛出数字\nthrow 404;\n\n// 抛出对象\nthrow { code: 404, message: 'Not found' };\n\n// 抛出Error对象（推荐）\nthrow new Error('Something went wrong');"
          },
          {
            "title": "最佳实践",
            "code": "// 推荐：抛出Error对象\nthrow new Error('描述性错误信息');\n\n// 自定义Error类\nclass ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = 'ValidationError';\n  }\n}\n\nthrow new ValidationError('验证失败');"
          },
          {
            "title": "为什么推荐Error对象",
            "points": [
              "包含堆栈跟踪（stack）",
              "统一的错误处理接口",
              "更好的调试体验",
              "符合惯例"
            ]
          }
        ]
      },
      "source": "throw"
    },
    {
      "difficulty": "medium",
      "tags": ["finally"],
      "question": "finally块一定会执行吗？",
      "options": [
        "几乎总是执行，除非进程崩溃或无限循环",
        "总是执行",
        "不一定执行",
        "never执行"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "finally执行时机：",
        "sections": [
          {
            "title": "总是执行",
            "code": "function test() {\n  try {\n    return 'try';\n  } finally {\n    console.log('finally');\n  }\n}\n\nconst result = test();\n// 输出：finally\n// 返回：'try'"
          },
          {
            "title": "即使有return",
            "code": "function test() {\n  try {\n    return 'try';\n  } catch (e) {\n    return 'catch';\n  } finally {\n    return 'finally'; // 会覆盖前面的return\n  }\n}\n\nconsole.log(test()); // 'finally'"
          },
          {
            "title": "不会执行的情况",
            "code": "// 1. 无限循环\ntry {\n  while(true) {}\n} finally {\n  console.log('不会执行');\n}\n\n// 2. 进程终止\ntry {\n  process.exit(0);\n} finally {\n  console.log('不会执行');\n}"
          },
          {
            "title": "常见用途",
            "code": "// 资源清理\nlet file;\ntry {\n  file = openFile();\n  processFile(file);\n} catch (e) {\n  handleError(e);\n} finally {\n  if (file) {\n    file.close(); // 确保文件被关闭\n  }\n}"
          }
        ]
      },
      "source": "finally"
    },
    {
      "difficulty": "medium",
      "tags": ["错误传播"],
      "question": "如果catch块中也抛出错误会怎样？",
      "options": [
        "错误会继续向外传播，需要外层catch捕获",
        "程序崩溃",
        "自动忽略",
        "无法抛出"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "错误传播：",
        "sections": [
          {
            "title": "catch中抛出错误",
            "code": "try {\n  try {\n    throw new Error('内部错误');\n  } catch (e) {\n    console.log('捕获:', e.message);\n    throw new Error('处理错误时出错'); // 重新抛出\n  }\n} catch (e) {\n  console.log('外层捕获:', e.message);\n}\n// 输出：捕获: 内部错误\n// 输出：外层捕获: 处理错误时出错"
          },
          {
            "title": "重新抛出原错误",
            "code": "try {\n  riskyOperation();\n} catch (e) {\n  if (e instanceof NetworkError) {\n    handleNetworkError(e);\n  } else {\n    // 不知道如何处理，重新抛出\n    throw e;\n  }\n}"
          },
          {
            "title": "包装错误",
            "code": "try {\n  lowLevelOperation();\n} catch (e) {\n  // 包装为更高级的错误\n  throw new ApplicationError(\n    '操作失败',\n    { cause: e }\n  );\n}"
          }
        ]
      },
      "source": "错误传播"
    },
    {
      "difficulty": "medium",
      "tags": ["async错误"],
      "question": "try...catch能捕获异步错误吗？",
      "options": [
        "不能捕获回调和Promise中的异步错误，需要用async/await或.catch()",
        "能捕获所有错误",
        "完全不能用于异步",
        "只能捕获Promise错误"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步错误处理：",
        "sections": [
          {
            "title": "无法捕获回调错误",
            "code": "// 不会捕获\ntry {\n  setTimeout(() => {\n    throw new Error('异步错误');\n  }, 1000);\n} catch (e) {\n  // 不会执行\n}\n\n// 正确做法\nsetTimeout(() => {\n  try {\n    throw new Error('异步错误');\n  } catch (e) {\n    console.error(e);\n  }\n}, 1000);"
          },
          {
            "title": "Promise错误",
            "code": "// 不会捕获\ntry {\n  Promise.reject(new Error('Promise错误'));\n} catch (e) {\n  // 不会执行\n}\n\n// 正确做法1：.catch()\nPromise.reject(new Error('Promise错误'))\n  .catch(e => console.error(e));\n\n// 正确做法2：async/await\nasync function fn() {\n  try {\n    await Promise.reject(new Error('Promise错误'));\n  } catch (e) {\n    console.error(e); // 可以捕获\n  }\n}"
          },
          {
            "title": "async函数错误",
            "code": "// async函数总是返回Promise\nasync function getData() {\n  throw new Error('错误');\n}\n\n// 必须用.catch()或await\ngetData().catch(e => console.error(e));\n\n// 或\ntry {\n  await getData();\n} catch (e) {\n  console.error(e);\n}"
          }
        ]
      },
      "source": "异步错误"
    },
    {
      "difficulty": "hard",
      "tags": ["自定义Error"],
      "question": "如何创建自定义Error类？",
      "options": [
        "继承Error类，设置name和message属性，调用super()",
        "不能自定义",
        "只能用Error",
        "直接创建对象"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "自定义Error类：",
        "sections": [
          {
            "title": "基本实现",
            "code": "class CustomError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = 'CustomError';\n  }\n}\n\nthrow new CustomError('自定义错误');"
          },
          {
            "title": "添加额外属性",
            "code": "class ValidationError extends Error {\n  constructor(message, field) {\n    super(message);\n    this.name = 'ValidationError';\n    this.field = field;\n    this.code = 'VALIDATION_ERROR';\n  }\n}\n\ntry {\n  throw new ValidationError('无效的邮箱', 'email');\n} catch (e) {\n  if (e instanceof ValidationError) {\n    console.log(`${e.field}: ${e.message}`);\n  }\n}"
          },
          {
            "title": "错误层级",
            "code": "class ApplicationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = 'ApplicationError';\n  }\n}\n\nclass DatabaseError extends ApplicationError {\n  constructor(message, query) {\n    super(message);\n    this.name = 'DatabaseError';\n    this.query = query;\n  }\n}\n\nclass NetworkError extends ApplicationError {\n  constructor(message, statusCode) {\n    super(message);\n    this.name = 'NetworkError';\n    this.statusCode = statusCode;\n  }\n}\n\n// 统一处理\ntry {\n  // 操作\n} catch (e) {\n  if (e instanceof ApplicationError) {\n    logError(e);\n  }\n}"
          },
          {
            "title": "Error.cause (ES2022)",
            "code": "class WrappedError extends Error {\n  constructor(message, options) {\n    super(message, options);\n    this.name = 'WrappedError';\n  }\n}\n\ntry {\n  lowLevelOperation();\n} catch (originalError) {\n  throw new WrappedError(\n    '高级操作失败',\n    { cause: originalError }\n  );\n}"
          }
        ]
      },
      "source": "自定义Error"
    },
    {
      "difficulty": "hard",
      "tags": ["错误处理策略"],
      "question": "什么时候应该捕获错误，什么时候应该让它传播？",
      "options": [
        "能恰当处理时捕获，否则传播给上层；不要吞掉错误",
        "总是捕获",
        "总是传播",
        "随意处理"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "错误处理策略：",
        "sections": [
          {
            "title": "应该捕获的情况",
            "code": "// 1. 能够恢复\ntry {\n  const data = JSON.parse(userInput);\n} catch (e) {\n  // 使用默认值\n  const data = getDefaultData();\n}\n\n// 2. 需要清理资源\ntry {\n  const conn = await database.connect();\n  await processData(conn);\n} catch (e) {\n  logError(e);\n  throw e; // 重新抛出\n} finally {\n  await conn?.close();\n}\n\n// 3. 需要转换错误\ntry {\n  await externalAPI.call();\n} catch (e) {\n  throw new ApplicationError('外部服务调用失败', { cause: e });\n}"
          },
          {
            "title": "不应该捕获的情况",
            "code": "// ❌ 不好：吞掉错误\ntry {\n  riskyOperation();\n} catch (e) {\n  // 什么都不做\n}\n\n// ❌ 不好：无意义的捕获\ntry {\n  doSomething();\n} catch (e) {\n  throw e; // 仅仅重新抛出，没有处理\n}\n\n// ✅ 好：让错误传播\nfunction calculate(a, b) {\n  // 不捕获，让调用者处理\n  return a / b;\n}"
          },
          {
            "title": "错误边界",
            "code": "// 在适当的层级捕获\n\n// 路由层\napp.use((req, res, next) => {\n  try {\n    next();\n  } catch (e) {\n    handleHTTPError(e, res);\n  }\n});\n\n// 业务层\nasync function processOrder(order) {\n  // 不捕获，让路由层处理\n  const payment = await processPayment(order);\n  const shipping = await arrangeShipping(order);\n  return { payment, shipping };\n}"
          }
        ]
      },
      "source": "错误策略"
    },
    {
      "difficulty": "hard",
      "tags": ["全局错误处理"],
      "question": "如何捕获全局未处理的错误？",
      "options": [
        "window.onerror、window.onunhandledrejection、process.on('uncaughtException')",
        "无法捕获",
        "只能用try...catch",
        "自动处理"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "全局错误处理：",
        "sections": [
          {
            "title": "浏览器：window.onerror",
            "code": "// 捕获同步错误\nwindow.onerror = function(message, source, lineno, colno, error) {\n  console.error('全局错误:', {\n    message,\n    source,\n    lineno,\n    colno,\n    error\n  });\n  \n  // 返回true阻止默认处理\n  return true;\n};\n\n// 或使用addEventListener\nwindow.addEventListener('error', (event) => {\n  console.error('错误:', event.error);\n});"
          },
          {
            "title": "浏览器：未处理的Promise",
            "code": "window.addEventListener('unhandledrejection', (event) => {\n  console.error('未处理的Promise rejection:', event.reason);\n  \n  // 阻止默认处理\n  event.preventDefault();\n});\n\n// Promise rejection被处理后触发\nwindow.addEventListener('rejectionhandled', (event) => {\n  console.log('Promise rejection已被处理');\n});"
          },
          {
            "title": "Node.js：uncaughtException",
            "code": "process.on('uncaughtException', (error) => {\n  console.error('未捕获的异常:', error);\n  \n  // 执行清理\n  cleanup();\n  \n  // 退出进程\n  process.exit(1);\n});\n\nprocess.on('unhandledRejection', (reason, promise) => {\n  console.error('未处理的Promise rejection:', reason);\n});"
          },
          {
            "title": "最佳实践",
            "code": "// 错误监控\nclass ErrorMonitor {\n  constructor() {\n    this.setupHandlers();\n  }\n  \n  setupHandlers() {\n    // 同步错误\n    window.addEventListener('error', (e) => {\n      this.logError({\n        type: 'error',\n        message: e.message,\n        stack: e.error?.stack\n      });\n    });\n    \n    // Promise错误\n    window.addEventListener('unhandledrejection', (e) => {\n      this.logError({\n        type: 'unhandledRejection',\n        reason: e.reason\n      });\n    });\n  }\n  \n  logError(error) {\n    // 发送到错误监控服务\n    console.error(error);\n    // sendToMonitoring(error);\n  }\n}\n\nconst monitor = new ErrorMonitor();"
          }
        ]
      },
      "source": "全局错误"
    },
    {
      "difficulty": "hard",
      "tags": ["错误堆栈"],
      "question": "如何获取和使用错误堆栈信息？",
      "options": [
        "通过Error.stack属性获取，用于调试和日志",
        "无法获取",
        "只在开发环境",
        "自动记录"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "错误堆栈：",
        "sections": [
          {
            "title": "访问堆栈",
            "code": "try {\n  throw new Error('测试错误');\n} catch (e) {\n  console.log(e.stack);\n  /*\n  Error: 测试错误\n      at <anonymous>:2:9\n      at ...\n  */\n}"
          },
          {
            "title": "自定义堆栈跟踪",
            "code": "// Error.captureStackTrace (V8)\nfunction MyError(message) {\n  this.message = message;\n  Error.captureStackTrace(this, MyError);\n}\n\nMyError.prototype = Object.create(Error.prototype);\nMyError.prototype.name = 'MyError';\n\nconst err = new MyError('自定义错误');\nconsole.log(err.stack);"
          },
          {
            "title": "解析堆栈",
            "code": "function parseStack(error) {\n  const lines = error.stack.split('\\n');\n  return lines.slice(1).map(line => {\n    const match = line.match(/at (.+) \\((.+):(\\d+):(\\d+)\\)/);\n    if (match) {\n      return {\n        function: match[1],\n        file: match[2],\n        line: parseInt(match[3]),\n        column: parseInt(match[4])\n      };\n    }\n  }).filter(Boolean);\n}\n\ntry {\n  throw new Error('错误');\n} catch (e) {\n  console.log(parseStack(e));\n}"
          },
          {
            "title": "生产环境处理",
            "code": "// Source Map支持\nclass ErrorLogger {\n  async logError(error) {\n    const stack = error.stack;\n    \n    // 在生产环境，使用Source Map还原\n    const originalStack = await this.mapStack(stack);\n    \n    // 发送到日志服务\n    await this.sendToServer({\n      message: error.message,\n      stack: originalStack,\n      userAgent: navigator.userAgent,\n      url: window.location.href\n    });\n  }\n  \n  async mapStack(stack) {\n    // 使用source-map库解析\n    // ...\n  }\n}"
          }
        ]
      },
      "source": "错误堆栈"
    }
  ],
  "navigation": {
    "prev": {
      "title": "循环语句",
      "url": "03-loops.html"
    },
    "next": {
      "title": "函数基础",
      "url": "04-function-basics.html"
    }
  }
};
