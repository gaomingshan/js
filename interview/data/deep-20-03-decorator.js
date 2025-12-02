/**
 * 装饰器模式
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2003Decorator = {
  "config": {
    "title": "装饰器模式",
    "icon": "🎨",
    "description": "深入理解装饰器模式和TypeScript装饰器",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["装饰器"],
      "question": "装饰器的主要作用是什么？",
      "options": [
        "在不修改原代码的情况下扩展功能",
        "提高代码性能",
        "压缩代码体积",
        "加密代码"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "装饰器模式",
        "code": "// 装饰器：动态添加功能\n\n// 函数装饰器\nfunction log(target, name, descriptor) {\n  const original = descriptor.value;\n  \n  descriptor.value = function(...args) {\n    console.log(`调用 ${name}，参数:`, args);\n    const result = original.apply(this, args);\n    console.log(`${name} 返回:`, result);\n    return result;\n  };\n  \n  return descriptor;\n}\n\nclass Calculator {\n  @log\n  add(a, b) {\n    return a + b;\n  }\n}\n\n// 不修改add方法，但添加了日志功能"
      },
      "source": "装饰器"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["类装饰器"],
      "question": "以下装饰器的输出顺序？",
      "code": "function decorator1(target) {\n  console.log('decorator1');\n  return target;\n}\n\nfunction decorator2(target) {\n  console.log('decorator2');\n  return target;\n}\n\n@decorator1\n@decorator2\nclass MyClass {}",
      "options": [
        "decorator2, decorator1",
        "decorator1, decorator2",
        "decorator1",
        "decorator2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "装饰器执行顺序",
        "code": "// 装饰器从下到上执行\n\nfunction decorator1(target) {\n  console.log('decorator1');\n  return target;\n}\n\nfunction decorator2(target) {\n  console.log('decorator2');\n  return target;\n}\n\n@decorator1  // 第2个执行\n@decorator2  // 第1个执行\nclass MyClass {}\n\n// 输出: decorator2, decorator1\n\n// 类似函数组合\ndecorator1(decorator2(MyClass))\n\n// 方法装饰器也是从下到上\nclass Test {\n  @decorator1\n  @decorator2\n  method() {}\n}\n// 执行顺序: decorator2, decorator1"
      },
      "source": "执行顺序"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["装饰器类型"],
      "question": "TypeScript支持哪些装饰器？",
      "options": [
        "类装饰器",
        "方法装饰器",
        "访问器装饰器",
        "属性装饰器",
        "参数装饰器",
        "变量装饰器"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "装饰器类型",
        "code": "// 1. 类装饰器\nfunction sealed(constructor: Function) {\n  Object.seal(constructor);\n  Object.seal(constructor.prototype);\n}\n\n@sealed\nclass MyClass {}\n\n// 2. 方法装饰器\nfunction log(target, name, descriptor) {\n  const original = descriptor.value;\n  descriptor.value = function(...args) {\n    console.log('调用方法:', name);\n    return original.apply(this, args);\n  };\n}\n\nclass Test {\n  @log\n  method() {}\n}\n\n// 3. 访问器装饰器\nfunction configurable(value: boolean) {\n  return function(target, name, descriptor) {\n    descriptor.configurable = value;\n  };\n}\n\nclass Point {\n  private _x: number;\n  \n  @configurable(false)\n  get x() { return this._x; }\n}\n\n// 4. 属性装饰器\nfunction readonly(target, name) {\n  Object.defineProperty(target, name, {\n    writable: false\n  });\n}\n\nclass User {\n  @readonly\n  id: number;\n}\n\n// 5. 参数装饰器\nfunction required(target, name, index) {\n  console.log(`参数${index}是必需的`);\n}\n\nclass Service {\n  method(@required param: string) {}\n}"
      },
      "source": "装饰器类型"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["装饰器提案"],
      "question": "JavaScript装饰器目前是ES标准的一部分",
      "correctAnswer": "B",
      "explanation": {
        "title": "装饰器提案状态",
        "code": "// 装饰器目前是Stage 3提案\n// 不是正式标准，但TypeScript已支持\n\n// 使用装饰器需要：\n// 1. TypeScript\n// tsconfig.json:\n// {\n//   \"experimentalDecorators\": true\n// }\n\n// 2. Babel\n// .babelrc:\n// {\n//   \"plugins\": [\"@babel/plugin-proposal-decorators\"]\n// }\n\n// 新提案vs旧提案\n// 旧提案（TypeScript使用）\nfunction old(target, name, descriptor) {}\n\n// 新提案（Stage 3）\nfunction modern(value, context) {\n  // context包含更多信息\n  // { kind, name, access, ... }\n}\n\n// 等待正式纳入标准"
      },
      "source": "提案状态"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["方法装饰器"],
      "question": "实现计时装饰器，空白处填什么？",
      "code": "function timing(target, name, descriptor) {\n  const original = descriptor.value;\n  \n  descriptor.value = function(...args) {\n    const start = Date.now();\n    const result = ______;\n    console.log(`${name}耗时: ${Date.now() - start}ms`);\n    return result;\n  };\n  \n  return descriptor;\n}",
      "options": [
        "original.apply(this, args)",
        "original(...args)",
        "target[name](...args)",
        "descriptor.value(...args)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "方法装饰器实现",
        "code": "// 计时装饰器\nfunction timing(target, name, descriptor) {\n  const original = descriptor.value;\n  \n  descriptor.value = function(...args) {\n    const start = Date.now();\n    \n    // 保持正确的this绑定\n    const result = original.apply(this, args);\n    \n    console.log(`${name}耗时: ${Date.now() - start}ms`);\n    return result;\n  };\n  \n  return descriptor;\n}\n\nclass Service {\n  @timing\n  async fetchData() {\n    await delay(1000);\n    return 'data';\n  }\n}\n\n// 使用\nconst service = new Service();\nawait service.fetchData();\n// 输出: fetchData耗时: 1000ms\n\n// 处理异步方法\nfunction asyncTiming(target, name, descriptor) {\n  const original = descriptor.value;\n  \n  descriptor.value = async function(...args) {\n    const start = Date.now();\n    try {\n      return await original.apply(this, args);\n    } finally {\n      console.log(`${name}耗时: ${Date.now() - start}ms`);\n    }\n  };\n  \n  return descriptor;\n}"
      },
      "source": "方法装饰器"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["装饰器工厂"],
      "question": "装饰器工厂的执行顺序？",
      "code": "function log(message) {\n  console.log('装饰器工厂:', message);\n  return function(target) {\n    console.log('装饰器:', message);\n  };\n}\n\n@log('class')\nclass MyClass {\n  @log('method')\n  method() {}\n}",
      "options": [
        "装饰器工厂:method, 装饰器工厂:class, 装饰器:method, 装饰器:class",
        "装饰器工厂:class, 装饰器:class, 装饰器工厂:method, 装饰器:method",
        "装饰器:class, 装饰器:method",
        "装饰器工厂:class, 装饰器工厂:method"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "装饰器工厂执行顺序",
        "code": "function log(message) {\n  console.log('装饰器工厂:', message);\n  return function(target) {\n    console.log('装饰器:', message);\n  };\n}\n\n@log('class')\nclass MyClass {\n  @log('method')\n  method() {}\n}\n\n// 执行顺序：\n// 1. 从内到外求值装饰器工厂\n//    - method的工厂\n//    - class的工厂\n\n// 2. 从下到上应用装饰器\n//    - method的装饰器\n//    - class的装饰器\n\n// 输出顺序：\n// 装饰器工厂: method\n// 装饰器工厂: class\n// 装饰器: method\n// 装饰器: class"
      },
      "source": "装饰器工厂"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["装饰器应用"],
      "question": "装饰器的典型应用场景？",
      "options": [
        "日志记录",
        "权限验证",
        "缓存结果",
        "性能监控",
        "代码压缩",
        "依赖注入"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "装饰器应用场景",
        "code": "// 1. 日志记录\nfunction log(target, name, descriptor) {\n  const original = descriptor.value;\n  descriptor.value = function(...args) {\n    console.log(`调用 ${name}`);\n    return original.apply(this, args);\n  };\n}\n\n// 2. 权限验证\nfunction requireAuth(target, name, descriptor) {\n  const original = descriptor.value;\n  descriptor.value = function(...args) {\n    if (!this.isAuthenticated()) {\n      throw new Error('未授权');\n    }\n    return original.apply(this, args);\n  };\n}\n\nclass UserService {\n  @requireAuth\n  deleteUser(id) {}\n}\n\n// 3. 缓存结果\nfunction memoize(target, name, descriptor) {\n  const original = descriptor.value;\n  const cache = new Map();\n  \n  descriptor.value = function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) {\n      return cache.get(key);\n    }\n    const result = original.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}\n\n// 4. 性能监控\nfunction monitor(target, name, descriptor) {\n  const original = descriptor.value;\n  descriptor.value = function(...args) {\n    const start = performance.now();\n    const result = original.apply(this, args);\n    const duration = performance.now() - start;\n    \n    // 上报性能数据\n    reportPerformance(name, duration);\n    return result;\n  };\n}\n\n// 5. 依赖注入\nfunction inject(serviceKey) {\n  return function(target, name, index) {\n    // 记录依赖\n    const dependencies = Reflect.getMetadata('dependencies', target) || [];\n    dependencies[index] = serviceKey;\n    Reflect.defineMetadata('dependencies', dependencies, target);\n  };\n}\n\nclass Controller {\n  constructor(@inject('UserService') userService) {}\n}"
      },
      "source": "应用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["装饰器参数"],
      "question": "装饰器可以接收参数",
      "correctAnswer": "A",
      "explanation": {
        "title": "装饰器工厂模式",
        "code": "// 装饰器本身不能直接接收参数\n// 使用装饰器工厂来接收参数\n\n// 装饰器工厂：返回装饰器的函数\nfunction repeat(times) {\n  return function(target, name, descriptor) {\n    const original = descriptor.value;\n    \n    descriptor.value = function(...args) {\n      for (let i = 0; i < times; i++) {\n        original.apply(this, args);\n      }\n    };\n  };\n}\n\nclass Printer {\n  @repeat(3)  // 传递参数\n  print(text) {\n    console.log(text);\n  }\n}\n\nconst printer = new Printer();\nprinter.print('Hello');\n// 输出3次: Hello, Hello, Hello"
      },
      "source": "装饰器参数"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["类装饰器"],
      "question": "实现单例装饰器，空白处填什么？",
      "code": "function singleton(target) {\n  let instance;\n  \n  return new Proxy(target, {\n    construct(target, args) {\n      if (!instance) {\n        instance = ______;\n      }\n      return instance;\n    }\n  });\n}",
      "options": [
        "Reflect.construct(target, args)",
        "new target(...args)",
        "target(...args)",
        "Object.create(target)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "单例模式装饰器",
        "code": "// 单例装饰器\nfunction singleton(target) {\n  let instance;\n  \n  return new Proxy(target, {\n    construct(target, args) {\n      if (!instance) {\n        // 使用Reflect.construct确保正确创建实例\n        instance = Reflect.construct(target, args);\n      }\n      return instance;\n    }\n  });\n}\n\n@singleton\nclass Database {\n  constructor(config) {\n    this.config = config;\n  }\n}\n\n// 测试\nconst db1 = new Database({ host: 'localhost' });\nconst db2 = new Database({ host: 'remote' });\n\nconsole.log(db1 === db2); // true\nconsole.log(db1.config.host); // 'localhost'\n\n// 类装饰器返回新的构造函数\nfunction logged(target) {\n  return class extends target {\n    constructor(...args) {\n      console.log('创建实例');\n      super(...args);\n    }\n  };\n}"
      },
      "source": "类装饰器"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "装饰器使用的最佳实践？",
      "options": [
        "保持装饰器简单和单一职责",
        "注意this绑定",
        "处理异步方法",
        "所有方法都加装饰器",
        "使用装饰器工厂传参",
        "注意执行顺序"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "装饰器最佳实践",
        "code": "// 1. 单一职责\n// ✅ 好：职责明确\n@log\n@cache\n@validate\nclass Service {}\n\n// ❌ 不好：一个装饰器做太多事\n@doEverything\nclass Service {}\n\n// 2. 注意this绑定\nfunction decorator(target, name, descriptor) {\n  const original = descriptor.value;\n  descriptor.value = function(...args) {\n    // ✅ 使用apply保持this\n    return original.apply(this, args);\n  };\n}\n\n// 3. 处理异步\nfunction asyncDecorator(target, name, descriptor) {\n  const original = descriptor.value;\n  descriptor.value = async function(...args) {\n    try {\n      return await original.apply(this, args);\n    } catch (err) {\n      handleError(err);\n      throw err;\n    }\n  };\n}\n\n// 4. 使用工厂传参\nfunction retry(times) {\n  return function(target, name, descriptor) {\n    const original = descriptor.value;\n    descriptor.value = async function(...args) {\n      for (let i = 0; i < times; i++) {\n        try {\n          return await original.apply(this, args);\n        } catch (err) {\n          if (i === times - 1) throw err;\n        }\n      }\n    };\n  };\n}\n\n// 5. 注意顺序\n@outer\n@inner\nclass Test {}\n// 执行: inner → outer"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "Symbol详解",
      "url": "20-02-symbol.html"
    },
    "next": {
      "title": "垃圾回收机制",
      "url": "21-01-garbage-collection.html"
    }
  }
};
