/**
 * ES2020+特性
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2302ES2020Plus = {
  "config": {
    "title": "ES2020+特性",
    "icon": "🆕",
    "description": "掌握ES2020及更新版本的特性",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["BigInt"],
      "question": "BigInt用于表示什么？",
      "options": [
        "任意精度的整数",
        "大的浮点数",
        "64位整数",
        "科学计数法"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "BigInt（ES2020）",
        "code": "// BigInt：任意精度整数\n\n// 创建BigInt\nconst big1 = 123n;  // 字面量\nconst big2 = BigInt(123);  // 函数\nconst big3 = BigInt('123456789012345678901234567890');\n\n// 超过Number.MAX_SAFE_INTEGER\nconst unsafe = 9007199254740993;  // Number\nconst safe = 9007199254740993n;   // BigInt\n\nconsole.log(unsafe === 9007199254740992);  // true（精度丢失）\nconsole.log(safe === 9007199254740992n);   // false（精确）\n\n// 运算\nconst a = 10n;\nconst b = 20n;\nconsole.log(a + b);   // 30n\nconsole.log(a * b);   // 200n\nconsole.log(b / a);   // 2n（整数除法）\n\n// ❌ 不能与Number混合运算\n// console.log(10n + 5);  // TypeError\n\n// ✅ 需要转换\nconsole.log(10n + BigInt(5));  // 15n\nconsole.log(Number(10n) + 5);  // 15\n\n// 比较\nconsole.log(10n === 10);    // false（类型不同）\nconsole.log(10n == 10);     // true（宽松相等）\nconsole.log(10n < 20);      // true（可以比较）\n\n// 使用场景\nconst timestamp = BigInt(Date.now());\nconst id = 1234567890123456789n;"
      },
      "source": "BigInt"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["globalThis"],
      "question": "globalThis在不同环境中指向什么？",
      "code": "// 浏览器\nconsole.log(globalThis === window);\n\n// Node.js\nconsole.log(globalThis === global);\n\n// Web Worker\nconsole.log(globalThis === self);",
      "options": [
        "都是true",
        "都是false",
        "浏览器true，其他false",
        "随机"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "globalThis（ES2020）",
        "code": "// globalThis：统一的全局对象\n\n// 浏览器\nconsole.log(globalThis === window);  // true\n\n// Node.js\nconsole.log(globalThis === global);  // true\n\n// Web Worker\nconsole.log(globalThis === self);    // true\n\n// 为什么需要globalThis？\n// 以前获取全局对象很复杂：\nconst getGlobal = function() {\n  if (typeof self !== 'undefined') return self;\n  if (typeof window !== 'undefined') return window;\n  if (typeof global !== 'undefined') return global;\n  throw new Error('unable to locate global object');\n};\n\n// 现在直接用globalThis\nglobalThis.myGlobal = 'value';\n\n// 应用场景\nfunction setGlobalConfig(config) {\n  globalThis.__APP_CONFIG__ = config;\n}\n\n// Polyfill\nif (typeof globalThis === 'undefined') {\n  (function() {\n    Object.defineProperty(Object.prototype, '__globalThis__', {\n      get: function() { return this; },\n      configurable: true\n    });\n    __globalThis__.globalThis = __globalThis__;\n    delete Object.prototype.__globalThis__;\n  })();\n}"
      },
      "source": "globalThis"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["String.matchAll"],
      "question": "String.matchAll的特点？",
      "options": [
        "返回迭代器",
        "需要全局标志g",
        "返回所有匹配及捕获组",
        "返回数组",
        "比match更强大",
        "ES2020引入"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "String.matchAll",
        "code": "// String.matchAll（ES2020）\n\nconst str = 'test1test2test3';\nconst regex = /t(e)(st)(\\d)/g;  // 需要g标志\n\n// matchAll返回迭代器\nconst matches = str.matchAll(regex);\n\nfor (const match of matches) {\n  console.log(match);\n  // [\n  //   'test1',      // 完整匹配\n  //   'e',          // 捕获组1\n  //   'st',         // 捕获组2\n  //   '1',          // 捕获组3\n  //   index: 0,\n  //   input: 'test1test2test3',\n  //   groups: undefined\n  // ]\n}\n\n// vs match（丢失捕获组）\nconst matches2 = str.match(regex);\nconsole.log(matches2);  // ['test1', 'test2', 'test3']\n// 丢失了捕获组信息！\n\n// 命名捕获组\nconst regex2 = /(?<word>\\w+):(?<num>\\d+)/g;\nconst str2 = 'a:1 b:2';\n\nfor (const match of str2.matchAll(regex2)) {\n  console.log(match.groups);\n  // { word: 'a', num: '1' }\n  // { word: 'b', num: '2' }\n}\n\n// 转为数组\nconst allMatches = Array.from(str.matchAll(regex));\nconst allMatches2 = [...str.matchAll(regex)];"
      },
      "source": "matchAll"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["动态导入"],
      "question": "动态import()返回Promise",
      "correctAnswer": "A",
      "explanation": {
        "title": "动态导入（ES2020）",
        "code": "// 动态import()返回Promise\n\n// 基本用法\nconst module = await import('./module.js');\nmodule.default();  // 默认导出\nmodule.namedExport();  // 命名导出\n\n// Promise形式\nimport('./module.js')\n  .then(module => {\n    module.default();\n  })\n  .catch(err => {\n    console.error('加载失败', err);\n  });\n\n// 条件导入\nif (condition) {\n  const { feature } = await import('./feature.js');\n  feature();\n}\n\n// 按需加载\nbutton.onclick = async () => {\n  const { showModal } = await import('./modal.js');\n  showModal();\n};\n\n// 路由懒加载\nconst routes = [\n  {\n    path: '/home',\n    component: () => import('./views/Home.vue')\n  },\n  {\n    path: '/about',\n    component: () => import('./views/About.vue')\n  }\n];\n\n// 动态路径（需要静态分析）\nconst language = 'zh';\nconst messages = await import(`./i18n/${language}.js`);\n\n// 错误处理\ntry {\n  const module = await import('./module.js');\n} catch (err) {\n  console.error('导入失败:', err);\n  // 回退逻辑\n}"
      },
      "source": "动态导入"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["顶层await"],
      "question": "在模块顶层使用await，空白处填什么？",
      "code": "// module.js (ES2022)\n______ data = await fetchData();\n\nexport { data };",
      "options": [
        "const",
        "let",
        "var",
        "async"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "顶层await（ES2022）",
        "code": "// 模块顶层await（不需要async函数）\n\n// module.js\nconst data = await fetchData();  // ✅ 顶层await\nconst config = await import('./config.json', {\n  assert: { type: 'json' }\n});\n\nexport { data, config };\n\n// main.js\nimport { data } from './module.js';\n// 等待module.js的await完成\n\nconsole.log(data);  // 可以直接使用\n\n// 应用场景\n\n// 1. 动态依赖\nconst locale = navigator.language;\nconst messages = await import(`./i18n/${locale}.js`);\n\n// 2. 资源初始化\nconst connection = await dbConnect();\nexport { connection };\n\n// 3. 条件导入\nconst feature = process.env.FEATURE_FLAG\n  ? await import('./feature.js')\n  : await import('./fallback.js');\n\n// 注意事项：\n// 1. 只能在模块中使用\n// 2. 会阻塞依赖该模块的其他模块\n// 3. 循环依赖可能死锁\n\n// ❌ 不能在脚本中\n// <script>\n//   await fetch();  // SyntaxError\n// </script>\n\n// ✅ 模块中可以\n// <script type=\"module\">\n//   await fetch();  // ✅\n// </script>"
      },
      "source": "顶层await"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["at方法"],
      "question": "数组at()方法的输出？",
      "code": "const arr = [1, 2, 3, 4, 5];\n\nconsole.log(arr.at(-1));\nconsole.log(arr.at(-2));\nconsole.log(arr.at(10));",
      "options": [
        "5, 4, undefined",
        "undefined, undefined, undefined",
        "5, 4, null",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "at()方法（ES2022）",
        "code": "// at()：支持负索引\n\nconst arr = [1, 2, 3, 4, 5];\n\n// 正索引\nconsole.log(arr.at(0));   // 1\nconsole.log(arr.at(2));   // 3\n\n// 负索引（从后往前）\nconsole.log(arr.at(-1));  // 5（最后一个）\nconsole.log(arr.at(-2));  // 4（倒数第二个）\n\n// 越界\nconsole.log(arr.at(10));  // undefined\n\n// vs 传统方式\nconsole.log(arr[arr.length - 1]);  // 5（麻烦）\nconsole.log(arr.at(-1));           // 5（简洁）\n\n// 字符串也支持\nconst str = 'hello';\nconsole.log(str.at(-1));  // 'o'\nconsole.log(str.at(-2));  // 'l'\n\n// TypedArray也支持\nconst typed = new Uint8Array([10, 20, 30]);\nconsole.log(typed.at(-1));  // 30\n\n// 链式调用\nconst last = arr\n  .filter(x => x > 2)\n  .at(-1);  // 5\n\n// 实际应用\nfunction getLast(arr) {\n  return arr.at(-1) ?? 'empty';\n}\n\nfunction getSecondLast(arr) {\n  return arr.at(-2) ?? arr.at(0);\n}"
      },
      "source": "at方法"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Object.fromEntries"],
      "question": "Object.fromEntries的用途？",
      "options": [
        "Map转对象",
        "数组转对象",
        "对象转数组",
        "entries逆操作",
        "URL参数解析",
        "ES2019引入"
      ],
      "correctAnswer": ["A", "B", "D", "E", "F"],
      "explanation": {
        "title": "Object.fromEntries",
        "code": "// Object.fromEntries（ES2019）\n// entries的逆操作\n\n// 1. Map转对象\nconst map = new Map([\n  ['name', 'Alice'],\n  ['age', 25]\n]);\n\nconst obj = Object.fromEntries(map);\nconsole.log(obj);  // { name: 'Alice', age: 25 }\n\n// 2. 数组转对象\nconst entries = [\n  ['a', 1],\n  ['b', 2],\n  ['c', 3]\n];\n\nconst obj2 = Object.fromEntries(entries);\nconsole.log(obj2);  // { a: 1, b: 2, c: 3 }\n\n// 3. 对象转换\nconst original = { a: 1, b: 2, c: 3 };\n\nconst doubled = Object.fromEntries(\n  Object.entries(original)\n    .map(([key, value]) => [key, value * 2])\n);\nconsole.log(doubled);  // { a: 2, b: 4, c: 6 }\n\n// 4. 过滤对象\nconst filtered = Object.fromEntries(\n  Object.entries(original)\n    .filter(([key, value]) => value > 1)\n);\nconsole.log(filtered);  // { b: 2, c: 3 }\n\n// 5. URL参数解析\nconst params = new URLSearchParams('foo=1&bar=2');\nconst paramsObj = Object.fromEntries(params);\nconsole.log(paramsObj);  // { foo: '1', bar: '2' }\n\n// vs Object.entries\nconst obj3 = { x: 1, y: 2 };\nconst entries2 = Object.entries(obj3);\n// [['x', 1], ['y', 2]]\nconst obj4 = Object.fromEntries(entries2);\n// { x: 1, y: 2 }"
      },
      "source": "fromEntries"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Array.flat"],
      "question": "Array.flat()可以指定展平深度",
      "correctAnswer": "A",
      "explanation": {
        "title": "Array.flat（ES2019）",
        "code": "// Array.flat()：数组扁平化\n\nconst arr = [1, [2, 3], [4, [5, 6]]];\n\n// 默认深度1\nconsole.log(arr.flat());\n// [1, 2, 3, 4, [5, 6]]\n\n// 指定深度\nconsole.log(arr.flat(2));\n// [1, 2, 3, 4, 5, 6]\n\n// 无限深度\nconsole.log(arr.flat(Infinity));\n// [1, 2, 3, 4, 5, 6]\n\n// 自动移除空项\nconst sparse = [1, , 3, , 5];\nconsole.log(sparse.flat());\n// [1, 3, 5]\n\n// Array.flatMap\n// map + flat(1)\nconst arr2 = [1, 2, 3];\n\nconst result = arr2.flatMap(x => [x, x * 2]);\nconsole.log(result);\n// [1, 2, 2, 4, 3, 6]\n\n// 等价于\nconst result2 = arr2\n  .map(x => [x, x * 2])\n  .flat();\n\n// 应用：处理嵌套数据\nconst users = [\n  { name: 'Alice', tags: ['js', 'css'] },\n  { name: 'Bob', tags: ['html', 'js'] }\n];\n\nconst allTags = users\n  .flatMap(user => user.tags);\nconsole.log(allTags);\n// ['js', 'css', 'html', 'js']"
      },
      "source": "flat"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["WeakRef"],
      "question": "创建弱引用，空白处填什么？",
      "code": "// ES2021\nlet obj = { data: 'value' };\nconst ref = new ______(obj);\n\nobj = null;  // obj可被回收\nconst deref = ref.deref();  // 可能是undefined",
      "options": [
        "WeakRef",
        "WeakMap",
        "WeakSet",
        "Weak"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "WeakRef（ES2021）",
        "code": "// WeakRef：弱引用对象\n\nlet obj = { data: 'large data' };\nconst weakRef = new WeakRef(obj);\n\n// 使用弱引用\nfunction useObject() {\n  const obj = weakRef.deref();\n  \n  if (obj) {\n    // 对象还在\n    console.log(obj.data);\n  } else {\n    // 对象已被回收\n    console.log('对象已回收');\n  }\n}\n\nobj = null;  // 原对象可以被GC\n\n// 一段时间后\nsetTimeout(() => {\n  useObject();  // 可能输出'对象已回收'\n}, 10000);\n\n// 应用场景：缓存\nclass Cache {\n  constructor() {\n    this.cache = new Map();\n  }\n  \n  set(key, value) {\n    this.cache.set(key, new WeakRef(value));\n  }\n  \n  get(key) {\n    const ref = this.cache.get(key);\n    if (!ref) return undefined;\n    \n    const value = ref.deref();\n    if (!value) {\n      // 已被回收，清除条目\n      this.cache.delete(key);\n    }\n    return value;\n  }\n}\n\n// 配合FinalizationRegistry\nconst registry = new FinalizationRegistry((key) => {\n  console.log(`对象${key}被回收`);\n});\n\nlet target = { name: 'test' };\nregistry.register(target, 'myKey');\n\ntarget = null;  // 被回收时会调用回调"
      },
      "source": "WeakRef"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "ES2020+特性的最佳实践？",
      "options": [
        "使用BigInt处理大整数",
        "动态import实现代码分割",
        "matchAll获取完整匹配信息",
        "所有数字都用BigInt",
        "顶层await简化异步模块",
        "at()方法访问负索引"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "ES2020+最佳实践",
        "code": "// 1. BigInt处理大数\n// ✅ 超过安全整数范围\nconst id = 9007199254740993n;\nconst timestamp = BigInt(Date.now());\n\n// ❌ 普通数字可以就用Number\nconst small = 100;  // 不需要100n\n\n// 2. 动态import\n// ✅ 按需加载\nbutton.onclick = async () => {\n  const { render } = await import('./heavy-component.js');\n  render();\n};\n\n// ✅ 条件加载\nif (needFeature) {\n  const { feature } = await import('./feature.js');\n}\n\n// 3. matchAll完整信息\n// ✅\nconst regex = /(\\w+):(\\d+)/g;\nfor (const match of str.matchAll(regex)) {\n  const [full, word, num] = match;\n  console.log(word, num);\n}\n\n// 4. 顶层await\n// ✅ 模块初始化\nconst config = await fetchConfig();\nexport { config };\n\n// 5. at()负索引\n// ✅\nconst last = arr.at(-1);\nconst secondLast = arr.at(-2);\n\n// ❌\nconst last2 = arr[arr.length - 1];\n\n// 6. globalThis跨环境\n// ✅\nglobalThis.APP_VERSION = '1.0.0';\n\n// 7. Object.fromEntries转换\n// ✅\nconst doubled = Object.fromEntries(\n  Object.entries(obj).map(([k, v]) => [k, v * 2])\n);\n\n// 8. flat/flatMap\n// ✅\nconst tags = users.flatMap(u => u.tags);\nconst nested = arr.flat(Infinity);"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "ES6+新特性",
      "url": "23-01-es6-features.html"
    },
    "next": {
      "title": "CommonJS模块",
      "url": "24-01-commonjs.html"
    }
  }
};
