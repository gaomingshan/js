/**
 * CommonJS模块
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2401CommonJS = {
  "config": {
    "title": "CommonJS模块",
    "icon": "📦",
    "description": "深入理解CommonJS模块规范和实现原理",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["CommonJS"],
      "question": "CommonJS主要用于哪个环境？",
      "options": [
        "Node.js",
        "浏览器",
        "Deno",
        "所有环境"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "CommonJS规范",
        "code": "// CommonJS是Node.js的模块系统\n\n// 导出\n// module.exports\nmodule.exports = {\n  add: (a, b) => a + b,\n  subtract: (a, b) => a - b\n};\n\n// exports快捷方式\nexports.multiply = (a, b) => a * b;\nexports.divide = (a, b) => a / b;\n\n// 导入\nconst math = require('./math');\nconst { add, subtract } = require('./math');\n\n// 特点：\n// 1. 同步加载\n// 2. 运行时加载\n// 3. 值拷贝\n// 4. 缓存机制\n\n// ❌ 不能在浏览器直接使用\n// 需要打包工具（Webpack、Browserify）\n\n// Node.js中使用\n// math.js\nfunction add(a, b) {\n  return a + b;\n}\n\nmodule.exports = { add };\n\n// main.js\nconst { add } = require('./math');\nconsole.log(add(1, 2));  // 3"
      },
      "source": "CommonJS"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["module.exports"],
      "question": "以下代码的输出是什么？",
      "code": "// a.js\nexports.x = 1;\nmodule.exports = { y: 2 };\nexports.z = 3;\n\n// main.js\nconst a = require('./a');\nconsole.log(a);",
      "options": [
        "{ y: 2 }",
        "{ x: 1, y: 2, z: 3 }",
        "{ x: 1, z: 3 }",
        "{ z: 3 }"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "module.exports vs exports",
        "code": "// exports是module.exports的引用\n\n// 初始状态\n// exports = module.exports = {}\n\n// a.js\nexports.x = 1;\n// module.exports = { x: 1 }\n\nmodule.exports = { y: 2 };\n// exports和module.exports断开联系！\n// exports仍指向{ x: 1 }\n// module.exports指向{ y: 2 }\n\nexports.z = 3;\n// 只修改了旧对象{ x: 1, z: 3 }\n// module.exports不受影响\n\n// 最终导出的是module.exports\nconsole.log(a);  // { y: 2 }\n\n// 原理：\nfunction require(path) {\n  // 简化实现\n  const module = { exports: {} };\n  const exports = module.exports;\n  \n  // 执行模块代码\n  (function(module, exports) {\n    // 模块代码\n    exports.x = 1;\n    module.exports = { y: 2 };\n    exports.z = 3;\n  })(module, exports);\n  \n  return module.exports;  // 返回module.exports\n}\n\n// 最佳实践：\n// ✅ 使用module.exports\nmodule.exports = { x: 1, y: 2 };\n\n// ✅ 使用exports添加属性\nexports.x = 1;\nexports.y = 2;\n\n// ❌ 不要混用\nexports.x = 1;\nmodule.exports = {};  // exports失效"
      },
      "source": "exports"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["require缓存"],
      "question": "require的缓存机制特点？",
      "options": [
        "模块只加载一次",
        "缓存在require.cache",
        "可以清除缓存",
        "每次require都重新执行",
        "基于绝对路径缓存",
        "自动更新缓存"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "require缓存机制",
        "code": "// require会缓存模块\n\n// counter.js\nlet count = 0;\n\nmodule.exports = {\n  increment() {\n    count++;\n  },\n  getCount() {\n    return count;\n  }\n};\n\n// main.js\nconst counter1 = require('./counter');\nconst counter2 = require('./counter');\n\ncounter1.increment();\nconsole.log(counter1.getCount());  // 1\nconsole.log(counter2.getCount());  // 1（共享状态）\nconsole.log(counter1 === counter2);  // true（同一对象）\n\n// 查看缓存\nconsole.log(require.cache);\n/*\n{\n  '/path/to/counter.js': Module {\n    id: '/path/to/counter.js',\n    exports: { increment: [Function], getCount: [Function] },\n    ...\n  }\n}\n*/\n\n// 清除缓存\ndelete require.cache[require.resolve('./counter')];\nconst counter3 = require('./counter');\nconsole.log(counter3.getCount());  // 0（重新加载）\n\n// 强制重新加载\nfunction requireUncached(module) {\n  delete require.cache[require.resolve(module)];\n  return require(module);\n}\n\nconst fresh = requireUncached('./counter');\n\n// 热重载应用\nfunction watchAndReload(modulePath) {\n  fs.watch(modulePath, () => {\n    delete require.cache[require.resolve(modulePath)];\n    const newModule = require(modulePath);\n    console.log('模块已重载');\n  });\n}"
      },
      "source": "缓存"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["循环依赖"],
      "question": "CommonJS可以处理循环依赖",
      "correctAnswer": "A",
      "explanation": {
        "title": "循环依赖处理",
        "code": "// CommonJS可以处理循环依赖\n\n// a.js\nconsole.log('a开始加载');\nexports.done = false;\n\nconst b = require('./b');\nconsole.log('在a中，b.done =', b.done);\n\nexports.done = true;\nconsole.log('a加载完成');\n\n// b.js\nconsole.log('b开始加载');\nexports.done = false;\n\nconst a = require('./a');\nconsole.log('在b中，a.done =', a.done);\n\nexports.done = true;\nconsole.log('b加载完成');\n\n// main.js\nconst a = require('./a');\nconst b = require('./b');\n\nconsole.log('在main中，a.done =', a.done);\nconsole.log('在main中，b.done =', b.done);\n\n// 输出：\n// a开始加载\n// b开始加载\n// 在b中，a.done = false  （a还未完成）\n// b加载完成\n// 在a中，b.done = true\n// a加载完成\n// 在main中，a.done = true\n// 在main中，b.done = true\n\n// 处理机制：\n// 1. main加载a\n// 2. a执行，遇到require('./b')\n// 3. b执行，遇到require('./a')\n// 4. a还未完成，返回当前exports（部分导出）\n// 5. b继续执行完成\n// 6. a继续执行完成\n\n// 注意：可能得到未完成的模块"
      },
      "source": "循环依赖"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["require.resolve"],
      "question": "获取模块的绝对路径，空白处填什么？",
      "code": "const path = require.____('./module');\nconsole.log(path);  // '/absolute/path/to/module.js'",
      "options": [
        "resolve",
        "getPath",
        "absolute",
        "find"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "require.resolve",
        "code": "// require.resolve：获取模块绝对路径\n\n// 基本用法\nconst path = require.resolve('./module');\nconsole.log(path);  // '/absolute/path/to/module.js'\n\n// 不会执行模块代码，只查找路径\nconst configPath = require.resolve('./config.json');\n\n// 查找node_modules中的模块\nconst lodashPath = require.resolve('lodash');\nconsole.log(lodashPath);\n// '/path/to/node_modules/lodash/lodash.js'\n\n// 查找失败会抛错\ntry {\n  require.resolve('./not-exist');\n} catch (e) {\n  console.log('模块不存在');\n}\n\n// require.resolve.paths：查找路径列表\nconst paths = require.resolve.paths('lodash');\nconsole.log(paths);\n/*\n[\n  '/current/dir/node_modules',\n  '/parent/dir/node_modules',\n  '/node_modules'\n]\n*/\n\n// 应用场景\n\n// 1. 检查模块是否存在\nfunction hasModule(name) {\n  try {\n    require.resolve(name);\n    return true;\n  } catch (e) {\n    return false;\n  }\n}\n\n// 2. 动态加载配置\nconst configPath = require.resolve('./config');\nif (fs.existsSync(configPath)) {\n  const config = require(configPath);\n}\n\n// 3. 清除特定模块缓存\nfunction clearModuleCache(moduleName) {\n  const path = require.resolve(moduleName);\n  delete require.cache[path];\n}"
      },
      "source": "resolve"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["值拷贝"],
      "question": "CommonJS的值拷贝特性？",
      "code": "// counter.js\nlet count = 0;\n\nfunction increment() {\n  count++;\n}\n\nfunction getCount() {\n  return count;\n}\n\nmodule.exports = { count, increment, getCount };\n\n// main.js\nconst { count, increment, getCount } = require('./counter');\n\nincrement();\nconsole.log(count, getCount());",
      "options": [
        "0, 1",
        "1, 1",
        "0, 0",
        "1, 0"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "CommonJS值拷贝",
        "code": "// CommonJS是值拷贝，不是引用\n\n// counter.js\nlet count = 0;\n\nfunction increment() {\n  count++;  // 修改内部变量\n}\n\nfunction getCount() {\n  return count;  // 返回最新值\n}\n\nmodule.exports = {\n  count,      // 导出时的值拷贝\n  increment,\n  getCount\n};\n\n// main.js\nconst { count, increment, getCount } = require('./counter');\n\n// count是导出时的拷贝（0）\nconsole.log(count);  // 0\n\nincrement();  // 修改模块内部count\n\nconsole.log(count);      // 0（拷贝不变）\nconsole.log(getCount()); // 1（访问最新值）\n\n// 对比ES6 Modules（引用）\n// counter.mjs\nexport let count = 0;\n\nexport function increment() {\n  count++;\n}\n\n// main.mjs\nimport { count, increment } from './counter.mjs';\n\nconsole.log(count);  // 0\nincrement();\nconsole.log(count);  // 1（动态绑定）\n\n// 解决方案：导出对象引用\n// counter.js\nconst state = { count: 0 };\n\nfunction increment() {\n  state.count++;\n}\n\nmodule.exports = { state, increment };\n\n// main.js\nconst { state, increment } = require('./counter');\nincrement();\nconsole.log(state.count);  // 1（对象引用）"
      },
      "source": "值拷贝"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["模块查找"],
      "question": "require模块查找规则？",
      "options": [
        "相对路径从当前文件开始",
        "绝对路径直接加载",
        "核心模块优先级最高",
        "node_modules逐级向上查找",
        "package.json的main字段",
        "默认查找index.js"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E", "F"],
      "explanation": {
        "title": "模块查找规则",
        "code": "// require查找规则：\n\n// 1. 核心模块（优先级最高）\nrequire('fs');        // Node.js内置模块\nrequire('path');      // 直接加载，不查找\n\n// 2. 相对路径\nrequire('./module');   // 从当前目录查找\nrequire('../parent');  // 从父目录查找\n\n// 查找顺序：\n// - ./module.js\n// - ./module.json\n// - ./module.node\n// - ./module/package.json的main字段\n// - ./module/index.js\n\n// 3. 绝对路径\nrequire('/absolute/path/to/module');\n\n// 4. 非核心模块（查找node_modules）\nrequire('lodash');\n\n// 查找路径（逐级向上）：\n// /current/dir/node_modules/lodash\n// /parent/dir/node_modules/lodash\n// /root/node_modules/lodash\n// /node_modules/lodash\n\n// 5. package.json的main字段\n// node_modules/mymodule/package.json\n{\n  \"main\": \"./dist/index.js\"\n}\n\nrequire('mymodule');  // 加载dist/index.js\n\n// 6. index.js作为默认\nrequire('./folder');  // 查找folder/index.js\n\n// 查看查找路径\nconsole.log(module.paths);\n/*\n[\n  '/current/dir/node_modules',\n  '/parent/dir/node_modules',\n  '/node_modules'\n]\n*/\n\n// 自定义查找路径\nmodule.paths.unshift('/custom/path/node_modules');"
      },
      "source": "查找规则"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["同步加载"],
      "question": "CommonJS的require是同步加载",
      "correctAnswer": "A",
      "explanation": {
        "title": "同步vs异步加载",
        "code": "// CommonJS是同步加载\n\nconsole.log('开始');\n\nconst math = require('./math');  // 同步加载，阻塞\n\nconsole.log('加载完成');\n\n// 适合Node.js（服务器）：\n// - 文件在本地\n// - 加载快\n// - 启动时一次性加载\n\n// ❌ 不适合浏览器：\n// - 网络加载慢\n// - 会阻塞页面\n// - 需要异步加载\n\n// 浏览器需要异步（AMD/ES6 Modules）\n\n// AMD（异步）\nrequire(['./math'], function(math) {\n  // 回调中使用\n});\n\n// ES6 Modules（可异步）\nimport('./math').then(math => {\n  // 动态导入\n});\n\n// CommonJS在浏览器中使用\n// 需要打包工具：\n// - Webpack\n// - Browserify\n// - Rollup\n\n// 打包后变成：\n(function() {\n  const modules = {\n    './math': function(module, exports) {\n      // math模块代码\n    },\n    './main': function(module, exports, require) {\n      const math = require('./math');\n      // main模块代码\n    }\n  };\n  \n  // 模拟require\n  function require(id) {\n    // ...\n  }\n  \n  require('./main');\n})();"
      },
      "source": "同步加载"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["__dirname"],
      "question": "CommonJS提供的全局变量，空白处填什么？",
      "code": "// 当前文件所在目录\nconst dir = ______;\n\n// 当前文件的完整路径\nconst file = ______;",
      "options": [
        "__dirname, __filename",
        "process.cwd(), __file",
        "module.path, module.filename",
        "require.dir, require.file"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "CommonJS全局变量",
        "code": "// CommonJS提供的全局变量：\n\n// 1. __dirname - 当前文件所在目录\nconsole.log(__dirname);\n// /Users/name/project/src\n\n// 2. __filename - 当前文件完整路径\nconsole.log(__filename);\n// /Users/name/project/src/index.js\n\n// 3. module - 当前模块对象\nconsole.log(module);\n/*\n{\n  id: '/path/to/module.js',\n  exports: {},\n  parent: Module {...},\n  filename: '/path/to/module.js',\n  loaded: false,\n  children: [],\n  paths: [...]\n}\n*/\n\n// 4. exports - module.exports的引用\nexports.x = 1;\n\n// 5. require - 加载模块的函数\nconst fs = require('fs');\n\n// 注意：ES6 Modules没有这些变量\n// import.meta.url可以获取模块URL\n\n// 实际应用：\nconst path = require('path');\n\n// 读取同目录文件\nconst configPath = path.join(__dirname, 'config.json');\nconst config = require(configPath);\n\n// 构建绝对路径\nconst dataPath = path.resolve(__dirname, '../data');\n\n// 获取文件名\nconst filename = path.basename(__filename);\nconsole.log(filename);  // index.js\n\n// 检测是否为主模块\nif (require.main === module) {\n  console.log('直接运行此文件');\n} else {\n  console.log('被其他模块引用');\n}"
      },
      "source": "全局变量"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "CommonJS使用最佳实践？",
      "options": [
        "使用module.exports导出",
        "避免循环依赖",
        "合理使用缓存",
        "混用exports和module.exports",
        "使用__dirname构建路径",
        "导出函数而非对象"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "CommonJS最佳实践",
        "code": "// 1. 使用module.exports\n// ✅ 清晰明确\nmodule.exports = {\n  add,\n  subtract\n};\n\n// ❌ 混用容易出错\nexports.add = add;\nmodule.exports = { subtract };  // add丢失\n\n// 2. 避免循环依赖\n// ✅ 重构代码结构\n// a.js → utils.js ← b.js\n\n// ❌ 循环依赖\n// a.js ⇄ b.js\n\n// 3. 合理使用缓存\n// ✅ 单例模式\nlet instance;\n\nmodule.exports = function() {\n  if (!instance) {\n    instance = createInstance();\n  }\n  return instance;\n};\n\n// 4. 使用__dirname\n// ✅\nconst configPath = path.join(__dirname, 'config.json');\n\n// ❌ 相对于执行目录\nconst bad = './config.json';\n\n// 5. 检查模块是否存在\nfunction safeRequire(name) {\n  try {\n    return require(name);\n  } catch (e) {\n    return null;\n  }\n}\n\n// 6. 导出接口而非实现\n// ✅\nmodule.exports = {\n  getUser,\n  saveUser\n};\n\n// ❌ 导出实现细节\nmodule.exports = {\n  db,\n  connection,\n  pool\n};\n\n// 7. 使用工厂函数\nmodule.exports = function createService(config) {\n  return {\n    start() {},\n    stop() {}\n  };\n};\n\n// 8. 条件导出\nif (process.env.NODE_ENV === 'production') {\n  module.exports = require('./prod');\n} else {\n  module.exports = require('./dev');\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "ES2020+特性",
      "url": "23-02-es2020-plus.html"
    },
    "next": {
      "title": "ES Modules",
      "url": "24-02-es-modules.html"
    }
  }
};
