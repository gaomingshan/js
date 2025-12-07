/**
 * Proxy与Reflect
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2001ProxyReflect = {
  "config": {
    "title": "Proxy与Reflect",
    "icon": "🪞",
    "description": "深入理解Proxy和Reflect的原理和应用",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Proxy"],
      "question": "Proxy可以拦截对象的哪些操作？",
      "options": [
        "属性读取、设置、删除等13种操作",
        "只能拦截属性读取",
        "只能拦截方法调用",
        "所有操作"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Proxy拦截器",
        "code": "// Proxy支持13种拦截操作（traps）\n\nconst proxy = new Proxy(target, {\n  // 1. 读取属性\n  get(target, prop) {},\n  \n  // 2. 设置属性\n  set(target, prop, value) {},\n  \n  // 3. 删除属性\n  deleteProperty(target, prop) {},\n  \n  // 4. 检查属性\n  has(target, prop) {},\n  \n  // 5. Object.getOwnPropertyDescriptor\n  getOwnPropertyDescriptor(target, prop) {},\n  \n  // 6. Object.defineProperty\n  defineProperty(target, prop, descriptor) {},\n  \n  // 7. Object.getPrototypeOf\n  getPrototypeOf(target) {},\n  \n  // 8. Object.setPrototypeOf\n  setPrototypeOf(target, proto) {},\n  \n  // 9. Object.isExtensible\n  isExtensible(target) {},\n  \n  // 10. Object.preventExtensions\n  preventExtensions(target) {},\n  \n  // 11. Object.getOwnPropertyNames\n  ownKeys(target) {},\n  \n  // 12. 函数调用\n  apply(target, thisArg, args) {},\n  \n  // 13. new操作符\n  construct(target, args) {}\n});"
      },
      "source": "Proxy"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Proxy拦截"],
      "question": "以下代码的输出是什么？",
      "code": "const obj = { x: 1 };\n\nconst proxy = new Proxy(obj, {\n  get(target, prop) {\n    console.log('get', prop);\n    return target[prop];\n  }\n});\n\nconsole.log(proxy.x);\nconsole.log(proxy.y);",
      "options": [
        "get x, 1, get y, undefined",
        "1, undefined",
        "get x, get y, 1, undefined",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Proxy get拦截",
        "code": "const obj = { x: 1 };\n\nconst proxy = new Proxy(obj, {\n  get(target, prop) {\n    console.log('get', prop);  // 拦截所有属性访问\n    return target[prop];\n  }\n});\n\nconsole.log(proxy.x);\n// 输出: get x, 1\n\nconsole.log(proxy.y);\n// 输出: get y, undefined\n\n// 拦截器在每次属性访问时都会触发\n// 即使属性不存在也会触发\n\n// 应用：实现默认值\nconst withDefault = new Proxy({}, {\n  get(target, prop) {\n    return prop in target ? target[prop] : 0;\n  }\n});\n\nconsole.log(withDefault.x); // 0"
      },
      "source": "get拦截"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Reflect"],
      "question": "Reflect API的优势有哪些？",
      "options": [
        "提供函数式的操作方法",
        "返回值更合理",
        "配合Proxy使用",
        "性能更好",
        "替代Object方法",
        "支持更多操作"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "Reflect优势",
        "code": "// 1. 函数式API\n// 旧方式\n'x' in obj;\ndelete obj.x;\n\n// Reflect方式\nReflect.has(obj, 'x');\nReflect.deleteProperty(obj, 'x');\n\n// 2. 返回值更合理\n// Object.defineProperty失败抛错\ntry {\n  Object.defineProperty(obj, 'x', {});\n} catch (e) {}\n\n// Reflect.defineProperty返回boolean\nif (Reflect.defineProperty(obj, 'x', {})) {\n  console.log('成功');\n}\n\n// 3. 配合Proxy\nconst proxy = new Proxy(obj, {\n  set(target, prop, value, receiver) {\n    console.log('设置', prop);\n    return Reflect.set(target, prop, value, receiver);\n  }\n});\n\n// 4. 替代Object方法\nReflect.getPrototypeOf(obj);    // Object.getPrototypeOf\nReflect.setPrototypeOf(obj, proto); // Object.setPrototypeOf\nReflect.ownKeys(obj);           // Object.getOwnPropertyNames"
      },
      "source": "Reflect"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Proxy性能"],
      "question": "Proxy会影响性能，应该避免在性能关键路径使用",
      "correctAnswer": "A",
      "explanation": {
        "title": "Proxy性能考虑",
        "code": "// Proxy有性能开销\n\nconst obj = { x: 1 };\nconst proxy = new Proxy(obj, {\n  get(target, prop) {\n    return target[prop]; // 每次访问都会调用\n  }\n});\n\n// 性能测试\nconst start = Date.now();\n\nfor (let i = 0; i < 1000000; i++) {\n  obj.x;  // 直接访问：快\n}\n\nfor (let i = 0; i < 1000000; i++) {\n  proxy.x;  // Proxy访问：慢\n}\n\n// Proxy开销来自：\n// 1. 拦截器函数调用\n// 2. 无法被引擎优化\n// 3. 每次操作都要检查\n\n// 最佳实践：\n// 1. 不要在热路径使用\n// 2. 缓存Proxy对象\n// 3. 只在必要时使用"
      },
      "source": "性能"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["数据验证"],
      "question": "使用Proxy实现数据验证，空白处填什么？",
      "code": "function createValidator(target, schema) {\n  return new Proxy(target, {\n    set(target, prop, value) {\n      const validator = schema[prop];\n      if (validator && !validator(value)) {\n        throw new Error(`Invalid value for ${prop}`);\n      }\n      return ______;\n    }\n  });\n}",
      "options": [
        "Reflect.set(target, prop, value)",
        "target[prop] = value",
        "true",
        "value"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Proxy数据验证",
        "code": "function createValidator(target, schema) {\n  return new Proxy(target, {\n    set(target, prop, value) {\n      // 获取验证器\n      const validator = schema[prop];\n      \n      // 验证\n      if (validator && !validator(value)) {\n        throw new Error(`Invalid value for ${prop}`);\n      }\n      \n      // 使用Reflect.set确保正确的this绑定\n      return Reflect.set(target, prop, value);\n    }\n  });\n}\n\n// 使用\nconst user = createValidator({}, {\n  age: (v) => typeof v === 'number' && v > 0,\n  name: (v) => typeof v === 'string' && v.length > 0\n});\n\nuser.age = 25;      // ✅\nuser.name = 'John'; // ✅\nuser.age = -1;      // ❌ Error\nuser.name = '';     // ❌ Error"
      },
      "source": "数据验证"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Proxy嵌套"],
      "question": "嵌套Proxy的行为？",
      "code": "const obj = { nested: { x: 1 } };\n\nconst proxy = new Proxy(obj, {\n  get(target, prop) {\n    console.log('访问:', prop);\n    return target[prop];\n  }\n});\n\nproxy.nested.x;",
      "options": [
        "访问: nested",
        "访问: nested, 访问: x",
        "访问: x",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Proxy不会自动递归",
        "code": "const obj = { nested: { x: 1 } };\n\nconst proxy = new Proxy(obj, {\n  get(target, prop) {\n    console.log('访问:', prop);\n    return target[prop];\n  }\n});\n\nproxy.nested.x;\n// 只输出: 访问: nested\n// nested.x的访问没有被拦截\n\n// 实现递归Proxy\nfunction deepProxy(obj) {\n  return new Proxy(obj, {\n    get(target, prop) {\n      const value = target[prop];\n      \n      // 递归代理对象\n      if (typeof value === 'object' && value !== null) {\n        return deepProxy(value);\n      }\n      \n      return value;\n    }\n  });\n}\n\nconst deep = deepProxy({ nested: { x: 1 } });\ndeep.nested.x; // 两层都会被拦截"
      },
      "source": "嵌套Proxy"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Proxy应用"],
      "question": "Proxy的典型应用场景？",
      "options": [
        "数据绑定（Vue3）",
        "属性验证",
        "访问控制",
        "性能优化",
        "负索引数组",
        "函数记忆化"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "Proxy应用场景",
        "code": "// 1. 数据绑定（Vue3响应式）\nfunction reactive(obj) {\n  return new Proxy(obj, {\n    get(target, prop) {\n      track(target, prop);  // 依赖收集\n      return target[prop];\n    },\n    set(target, prop, value) {\n      target[prop] = value;\n      trigger(target, prop); // 触发更新\n      return true;\n    }\n  });\n}\n\n// 2. 属性验证\nconst validated = new Proxy({}, {\n  set(target, prop, value) {\n    if (prop === 'age' && typeof value !== 'number') {\n      throw new TypeError('age must be number');\n    }\n    target[prop] = value;\n    return true;\n  }\n});\n\n// 3. 访问控制\nconst secured = new Proxy(obj, {\n  get(target, prop) {\n    if (prop.startsWith('_')) {\n      throw new Error('Private property');\n    }\n    return target[prop];\n  }\n});\n\n// 4. 负索引数组\nfunction createArray(arr) {\n  return new Proxy(arr, {\n    get(target, prop) {\n      const index = Number(prop);\n      if (index < 0) {\n        prop = target.length + index;\n      }\n      return target[prop];\n    }\n  });\n}\n\nconst arr = createArray([1, 2, 3]);\narr[-1]; // 3\n\n// 5. 函数记忆化\nfunction memoize(fn) {\n  const cache = new Map();\n  return new Proxy(fn, {\n    apply(target, thisArg, args) {\n      const key = JSON.stringify(args);\n      if (cache.has(key)) {\n        return cache.get(key);\n      }\n      const result = target.apply(thisArg, args);\n      cache.set(key, result);\n      return result;\n    }\n  });\n}"
      },
      "source": "应用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Proxy撤销"],
      "question": "Proxy.revocable可以创建可撤销的Proxy",
      "correctAnswer": "A",
      "explanation": {
        "title": "可撤销Proxy",
        "code": "// 创建可撤销的Proxy\nconst { proxy, revoke } = Proxy.revocable(target, {\n  get(target, prop) {\n    return target[prop];\n  }\n});\n\n// 正常使用\nconsole.log(proxy.x); // 1\n\n// 撤销Proxy\nrevoke();\n\n// 撤销后无法使用\ntry {\n  console.log(proxy.x); // TypeError\n} catch (e) {\n  console.log('Proxy已撤销');\n}\n\n// 应用场景：\n// 1. 临时访问权限\nfunction createTempAccess(obj, duration) {\n  const { proxy, revoke } = Proxy.revocable(obj, {});\n  \n  setTimeout(revoke, duration);\n  \n  return proxy;\n}\n\nconst temp = createTempAccess(data, 5000);\n// 5秒后自动撤销"
      },
      "source": "撤销"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["观察者模式"],
      "question": "使用Proxy实现观察者，空白处填什么？",
      "code": "function observable(obj) {\n  const observers = [];\n  \n  return {\n    proxy: new Proxy(obj, {\n      set(target, prop, value) {\n        target[prop] = value;\n        ______.forEach(fn => fn(prop, value));\n        return true;\n      }\n    }),\n    observe(fn) {\n      observers.push(fn);\n    }\n  };\n}",
      "options": [
        "observers",
        "this.observers",
        "obj.observers",
        "target.observers"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Proxy观察者模式",
        "code": "function observable(obj) {\n  const observers = [];\n  \n  return {\n    proxy: new Proxy(obj, {\n      set(target, prop, value) {\n        const oldValue = target[prop];\n        target[prop] = value;\n        \n        // 通知所有观察者\n        observers.forEach(fn => \n          fn(prop, value, oldValue)\n        );\n        \n        return true;\n      }\n    }),\n    \n    observe(fn) {\n      observers.push(fn);\n      \n      // 返回取消订阅函数\n      return () => {\n        const index = observers.indexOf(fn);\n        if (index > -1) {\n          observers.splice(index, 1);\n        }\n      };\n    }\n  };\n}\n\n// 使用\nconst { proxy, observe } = observable({ x: 1 });\n\nconst unsubscribe = observe((prop, newVal, oldVal) => {\n  console.log(`${prop}: ${oldVal} → ${newVal}`);\n});\n\nproxy.x = 2;  // 输出: x: 1 → 2\nunsubscribe();\nproxy.x = 3;  // 不输出"
      },
      "source": "观察者"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "Proxy使用的最佳实践？",
      "options": [
        "使用Reflect确保默认行为",
        "注意性能影响",
        "实现递归代理需手动处理",
        "所有对象都用Proxy包装",
        "配合WeakMap缓存",
        "使用revocable控制访问"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "Proxy最佳实践",
        "code": "// 1. 使用Reflect\nconst proxy = new Proxy(obj, {\n  set(target, prop, value, receiver) {\n    // ✅ 使用Reflect保证正确行为\n    return Reflect.set(target, prop, value, receiver);\n    // ❌ 不要直接赋值\n    // target[prop] = value; return true;\n  }\n});\n\n// 2. 性能考虑\n// ❌ 热路径\nfor (let i = 0; i < 1000000; i++) {\n  proxy.value++; // 慢\n}\n\n// ✅ 批量操作\nconst temp = proxy.value;\nfor (let i = 0; i < 1000000; i++) {\n  temp++;\n}\nproxy.value = temp;\n\n// 3. 递归代理缓存\nconst proxyCache = new WeakMap();\n\nfunction deepProxy(obj) {\n  if (proxyCache.has(obj)) {\n    return proxyCache.get(obj);\n  }\n  \n  const proxy = new Proxy(obj, {\n    get(target, prop) {\n      const value = target[prop];\n      if (typeof value === 'object' && value !== null) {\n        return deepProxy(value);\n      }\n      return value;\n    }\n  });\n  \n  proxyCache.set(obj, proxy);\n  return proxy;\n}\n\n// 4. 可撤销访问\nconst { proxy, revoke } = Proxy.revocable(obj, {});\n// 使用完毕后撤销\nrevoke();"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "并发模型",
      "url": "19-03-concurrency-model.html"
    },
    "next": {
      "title": "Symbol详解",
      "url": "20-02-symbol.html"
    }
  }
};
