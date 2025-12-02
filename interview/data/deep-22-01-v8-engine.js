/**
 * V8引擎原理
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2201V8Engine = {
  "config": {
    "title": "V8引擎原理",
    "icon": "🚀",
    "description": "深入理解V8引擎的工作原理和优化机制",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["V8架构"],
      "question": "V8引擎使用什么技术提高JavaScript执行速度？",
      "options": [
        "JIT（即时编译）",
        "解释执行",
        "静态编译",
        "转译"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8的JIT编译",
        "code": "// V8执行流程：\n// 源代码 → 解析器 → AST → 解释器(Ignition) → 字节码\n//                                    ↓\n//                           优化编译器(TurboFan) → 机器码\n\n// 1. Ignition（解释器）\n// - 快速生成字节码\n// - 快速启动\n// - 收集性能分析数据\n\n// 2. TurboFan（优化编译器）\n// - 编译热点代码为机器码\n// - 激进优化\n// - 支持反优化（deoptimization）\n\n// 示例：热点函数会被优化\nfunction add(a, b) {\n  return a + b;\n}\n\n// 多次调用后，V8会优化这个函数\nfor (let i = 0; i < 10000; i++) {\n  add(i, i + 1);  // 热点代码\n}\n\n// V8优化条件：\n// - 类型稳定\n// - 调用频率高\n// - 没有try-catch\n// - 没有eval/with"
      },
      "source": "JIT"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["隐藏类"],
      "question": "以下代码V8如何优化？",
      "code": "function Point(x, y) {\n  this.x = x;\n  this.y = y;\n}\n\nconst p1 = new Point(1, 2);\nconst p2 = new Point(3, 4);\n\n// V8会创建几个隐藏类？",
      "options": [
        "1个（相同结构）",
        "2个（不同对象）",
        "3个（包括空对象）",
        "4个"
      ],
      "correctAnswer": "C",
      "explanation": {
        "title": "隐藏类（Hidden Classes）",
        "code": "// V8使用隐藏类优化属性访问\n\nfunction Point(x, y) {\n  this.x = x;  // 创建隐藏类C1\n  this.y = y;  // 创建隐藏类C2\n}\n\n// 隐藏类转换链：\n// C0（空对象）\n//  → C1（有x属性）\n//  → C2（有x,y属性）\n\nconst p1 = new Point(1, 2);\n// p1的隐藏类：C0 → C1 → C2\n\nconst p2 = new Point(3, 4);\n// p2复用相同的隐藏类链：C0 → C1 → C2\n\n// ✅ 优化：相同顺序添加属性\nfunction createPoint1(x, y) {\n  const obj = {};\n  obj.x = x;  // C1\n  obj.y = y;  // C2\n  return obj;\n}\n\n// ❌ 反优化：不同顺序\nfunction createPoint2(x, y) {\n  const obj = {};\n  obj.y = y;  // C3（不同的隐藏类）\n  obj.x = x;  // C4\n  return obj;\n}\n\n// p1和p2有不同的隐藏类，无法共享优化！\n\n// 最佳实践：\n// 1. 在构造函数中初始化所有属性\n// 2. 按相同顺序添加属性\n// 3. 避免delete属性\n// 4. 避免动态添加属性"
      },
      "source": "隐藏类"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["内联缓存"],
      "question": "内联缓存（Inline Caches）优化了什么？",
      "options": [
        "属性访问",
        "方法调用",
        "类型检查",
        "数组遍历",
        "函数调用",
        "垃圾回收"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "内联缓存优化",
        "code": "// 内联缓存（IC）：缓存属性访问路径\n\nfunction getName(obj) {\n  return obj.name;  // 属性访问\n}\n\n// 第一次调用\nconst user1 = { name: 'Alice', age: 25 };\ngetName(user1);\n// V8记录：user1的隐藏类 → name在偏移量0\n\n// 第二次调用（相同类型）\nconst user2 = { name: 'Bob', age: 30 };\ngetName(user2);\n// V8直接使用缓存的偏移量，快速访问\n\n// IC状态：\n// 1. Uninitialized（未初始化）\n// 2. Monomorphic（单态）- 一种类型\n// 3. Polymorphic（多态）- 少数几种类型\n// 4. Megamorphic（超态）- 很多类型\n\n// ✅ 单态（最快）\nfunction process(obj) {\n  return obj.value;\n}\n\nconst objs = [\n  { value: 1 },\n  { value: 2 },\n  { value: 3 }\n];\n\nobjs.forEach(process);  // 所有对象相同结构\n\n// ❌ 超态（慢）\nconst mixed = [\n  { value: 1 },\n  { value: 2, extra: true },\n  { x: 3 },\n  { value: 4, y: 5 }\n];\n\nmixed.forEach(process);  // 不同结构，无法优化"
      },
      "source": "内联缓存"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["反优化"],
      "question": "类型变化会导致V8反优化（Deoptimization）",
      "correctAnswer": "A",
      "explanation": {
        "title": "V8反优化",
        "code": "// 反优化：V8撤销优化，回退到字节码\n\nfunction add(a, b) {\n  return a + b;\n}\n\n// 阶段1：数字加法（被优化）\nfor (let i = 0; i < 10000; i++) {\n  add(1, 2);  // V8优化为数字加法机器码\n}\n\n// 阶段2：类型变化（触发反优化）\nadd('hello', 'world');  // 字符串！反优化！\n\n// V8需要回退到通用版本处理字符串拼接\n\n// 触发反优化的情况：\n// 1. 类型变化\nfunction process(val) {\n  return val * 2;\n}\nprocess(10);      // 数字\nprocess('10');    // 字符串 → 反优化\n\n// 2. 隐藏类变化\nclass Point {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n}\n\nconst p = new Point(1, 2);\np.z = 3;  // 动态添加属性 → 反优化\n\n// 3. 数组元素类型变化\nconst arr = [1, 2, 3];  // SMI数组（优化）\narr.push(1.5);          // 变成DOUBLE数组（反优化）\n\n// 最佳实践：\n// ✅ 保持类型稳定\nfunction multiply(a, b) {\n  // 假设a和b总是数字\n  return a * b;\n}\n\n// ✅ 使用类型注释（TypeScript）\nfunction multiply2(a: number, b: number): number {\n  return a * b;\n}"
      },
      "source": "反优化"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["优化提示"],
      "question": "优化V8性能，空白处填什么？",
      "code": "// ✅ 让V8优化这个函数\nfunction calculate(arr) {\n  ______;  // 确保arr是数组\n  \n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}",
      "options": [
        "if (!Array.isArray(arr)) throw new Error()",
        "arr = arr || []",
        "// arr is array",
        "typeof arr === 'object'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8优化技巧",
        "code": "// 1. 类型守卫（Type Guards）\nfunction calculate(arr) {\n  // 帮助V8推断类型\n  if (!Array.isArray(arr)) {\n    throw new Error('Expected array');\n  }\n  \n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];  // V8知道arr是数组\n  }\n  return sum;\n}\n\n// 2. 单态函数\n// ✅ 好：只处理一种类型\nfunction addNumbers(a, b) {\n  return a + b;  // 总是数字\n}\n\n// ❌ 不好：多种类型\nfunction addAny(a, b) {\n  return a + b;  // 可能是数字、字符串...\n}\n\n// 3. 避免holes（稀疏数组）\n// ❌\nconst arr1 = new Array(100);  // 创建holes\narr1[0] = 1;\narr1[99] = 2;\n\n// ✅\nconst arr2 = [];\nfor (let i = 0; i < 100; i++) {\n  arr2[i] = i;  // 密集数组\n}\n\n// 4. 小整数（SMI）优化\n// ✅ SMI范围：-2^31 到 2^31-1\nconst arr3 = [1, 2, 3];  // SMI数组，快\n\n// ❌\nconst arr4 = [1.1, 2.2, 3.3];  // DOUBLE数组，慢一点\n\n// 5. 对象形状稳定\nclass Point {\n  constructor(x, y) {\n    // ✅ 在构造函数中初始化所有属性\n    this.x = x;\n    this.y = y;\n    this.z = 0;  // 即使初始为0也要声明\n  }\n}\n\n// 6. 函数长度限制\n// ✅ 小函数更容易内联\nfunction add(a, b) {\n  return a + b;  // 会被内联\n}\n\n// ❌ 大函数难以内联\nfunction huge() {\n  // 500行代码...\n}"
      },
      "source": "优化技巧"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["数组优化"],
      "question": "以下哪个数组性能最好？",
      "code": "const arr1 = [1, 2, 3, 4, 5];\nconst arr2 = [1, 2, 3.5, 4, 5];\nconst arr3 = [1, 2, '3', 4, 5];\nconst arr4 = [1, 2, , 4, 5];",
      "options": [
        "arr1（整数数组）",
        "arr2（浮点数数组）",
        "arr3（混合类型）",
        "arr4（稀疏数组）"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8数组优化",
        "code": "// V8数组元素类型（Elements Kind）：\n\n// 1. PACKED_SMI_ELEMENTS（最快）\nconst arr1 = [1, 2, 3, 4, 5];\n// 小整数，密集数组\n\n// 2. PACKED_DOUBLE_ELEMENTS\nconst arr2 = [1.1, 2.2, 3.3];\n// 浮点数，密集数组\n\n// 3. PACKED_ELEMENTS\nconst arr3 = [1, 'a', {}];\n// 混合类型，密集数组\n\n// 4. HOLEY_SMI_ELEMENTS\nconst arr4 = [1, 2, , 4, 5];\n// 稀疏整数数组（有holes）\n\n// 5. HOLEY_DOUBLE_ELEMENTS\nconst arr5 = [1.1, , 3.3];\n// 稀疏浮点数数组\n\n// 6. HOLEY_ELEMENTS\nconst arr6 = [1, , 'a'];\n// 稀疏混合数组（最慢）\n\n// 类型转换（只能降级，不能升级）：\nconst arr = [1, 2, 3];  // PACKED_SMI\narr.push(4.5);          // → PACKED_DOUBLE\narr.push('x');          // → PACKED_ELEMENTS\ndelete arr[0];          // → HOLEY_ELEMENTS\n\n// ✅ 最佳实践\n// 1. 避免holes\nconst good = Array.from({ length: 100 }, (_, i) => i);\n\n// 2. 保持类型一致\nconst numbers = [1, 2, 3, 4, 5];  // 全是整数\n\n// 3. 使用TypedArray处理数值\nconst int32 = new Int32Array([1, 2, 3]);\nconst float64 = new Float64Array([1.1, 2.2]);\n\n// 4. 预分配大小\nconst arr7 = new Array(1000);\nfor (let i = 0; i < 1000; i++) {\n  arr7[i] = i;  // 顺序填充\n}"
      },
      "source": "数组优化"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["函数优化"],
      "question": "V8优化函数的条件？",
      "options": [
        "调用次数足够多",
        "参数类型稳定",
        "没有try-catch",
        "函数体很大",
        "没有arguments对象",
        "使用箭头函数"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "函数优化条件",
        "code": "// V8优化函数的条件：\n\n// 1. ✅ 热点函数（调用频繁）\nfunction hot(x) {\n  return x * 2;\n}\n\nfor (let i = 0; i < 10000; i++) {\n  hot(i);  // 频繁调用，会被优化\n}\n\n// 2. ✅ 类型稳定\nfunction add(a, b) {\n  return a + b;\n}\n\nadd(1, 2);  // 数字\nadd(3, 4);  // 数字\nadd(5, 6);  // 数字\n// V8假设总是数字，优化为数字加法\n\n// 3. ❌ try-catch阻止优化\nfunction withTry(x) {\n  try {\n    return x * 2;  // 难以优化\n  } catch (e) {}\n}\n\n// ✅ 隔离try-catch\nfunction withoutTry(x) {\n  return doWork(x);\n}\n\nfunction doWork(x) {\n  try {\n    return x * 2;\n  } catch (e) {}\n}\n\n// 4. ❌ arguments对象\nfunction withArguments() {\n  const args = arguments;  // 难以优化\n  return args[0];\n}\n\n// ✅ 使用剩余参数\nfunction withRest(...args) {\n  return args[0];  // 可优化\n}\n\n// 5. ✅ 小函数易内联\nfunction small(x) {\n  return x + 1;  // 会被内联到调用处\n}\n\nfunction caller() {\n  const a = small(1);  // 内联为: const a = 1 + 1;\n  return a;\n}\n\n// 6. ❌ 动态属性访问\nfunction bad(obj, key) {\n  return obj[key];  // 难以优化\n}\n\n// ✅ 固定属性\nfunction good(obj) {\n  return obj.name;  // 易优化\n}"
      },
      "source": "函数优化"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["字节码"],
      "question": "V8先将JavaScript编译成字节码",
      "correctAnswer": "A",
      "explanation": {
        "title": "V8编译流程",
        "code": "// V8编译流程：\n\n// 1. 解析（Parser）\n// 源代码 → AST（抽象语法树）\n\nfunction add(a, b) {\n  return a + b;\n}\n\n// 2. Ignition解释器\n// AST → 字节码（Bytecode）\n// 优点：\n// - 快速启动\n// - 内存占用小\n// - 收集性能数据\n\n// 3. TurboFan优化编译器\n// 字节码 → 优化的机器码\n// 条件：\n// - 热点代码\n// - 类型反馈充分\n\n// 4. 反优化\n// 机器码 → 字节码\n// 原因：\n// - 类型假设失败\n// - 隐藏类变化\n\n// 流程示意：\n/*\n源代码\n  ↓ Parser\nAST\n  ↓ Ignition\n字节码 ←--┐\n  ↓        │\n执行       │ Deoptimization\n  ↓        │\n性能分析   │\n  ↓ TurboFan\n机器码 ----┘\n  ↓\n快速执行\n*/\n\n// 查看字节码（Node.js）：\n// node --print-bytecode script.js\n\n// 查看优化状态：\n// node --trace-opt --trace-deopt script.js"
      },
      "source": "字节码"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能分析"],
      "question": "使用V8性能分析，空白处填什么？",
      "code": "// Node.js性能分析\nnode ______ script.js",
      "options": [
        "--prof",
        "--trace",
        "--optimize",
        "--perf"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8性能分析工具",
        "code": "// 1. --prof：生成性能分析文件\n// node --prof script.js\n// 生成 isolate-*.log\n\n// 处理日志：\n// node --prof-process isolate-*.log > processed.txt\n\n// 2. --trace-opt：追踪优化\n// node --trace-opt script.js\n// 输出哪些函数被优化\n\n// 3. --trace-deopt：追踪反优化\n// node --trace-deopt script.js\n// 输出反优化原因\n\n// 4. --trace-ic：追踪内联缓存\n// node --trace-ic script.js\n\n// 5. Chrome DevTools\n// 使用Performance面板分析\nfunction analyze() {\n  console.profile('MyProfile');\n  \n  // 需要分析的代码\n  for (let i = 0; i < 1000000; i++) {\n    doWork();\n  }\n  \n  console.profileEnd('MyProfile');\n}\n\n// 6. 性能标记\nperformance.mark('start');\n\n// 执行代码\ndoWork();\n\nperformance.mark('end');\nperformance.measure('work', 'start', 'end');\n\nconst measure = performance.getEntriesByName('work')[0];\nconsole.log('耗时:', measure.duration);\n\n// 7. Benchmark\nconst Benchmark = require('benchmark');\nconst suite = new Benchmark.Suite();\n\nsuite\n  .add('方法1', function() {\n    // 测试代码1\n  })\n  .add('方法2', function() {\n    // 测试代码2\n  })\n  .on('cycle', function(event) {\n    console.log(String(event.target));\n  })\n  .on('complete', function() {\n    console.log('最快:', this.filter('fastest').map('name'));\n  })\n  .run();"
      },
      "source": "性能分析"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "V8优化的最佳实践？",
      "options": [
        "保持对象形状一致",
        "避免数组holes",
        "使用单态函数",
        "频繁使用eval",
        "隔离try-catch",
        "使用TypedArray处理数值"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "V8优化最佳实践",
        "code": "// 1. 保持对象形状一致\nclass Point {\n  constructor(x, y) {\n    this.x = x;  // 总是先x\n    this.y = y;  // 然后y\n  }\n}\n\n// 2. 避免holes\n// ❌\nconst arr = new Array(100);\narr[0] = 1;\narr[99] = 2;\n\n// ✅\nconst arr2 = Array.from({ length: 100 }, (_, i) => i);\n\n// 3. 单态函数\nfunction process(point) {\n  return point.x + point.y;\n}\n\n// 总是传入Point实例\nprocess(new Point(1, 2));\nprocess(new Point(3, 4));\n\n// 4. 隔离try-catch\nfunction safe(fn) {\n  try {\n    return fn();\n  } catch (e) {\n    return null;\n  }\n}\n\nfunction optimizable() {\n  return safe(() => doWork());  // 可优化\n}\n\n// 5. TypedArray\n// ❌ 普通数组\nconst floats = [1.1, 2.2, 3.3];\n\n// ✅ TypedArray\nconst floats2 = new Float64Array([1.1, 2.2, 3.3]);\n\n// 6. 函数内联\n// ✅ 小函数\nfunction add(a, b) {\n  return a + b;\n}\n\nfunction main() {\n  return add(1, 2);  // 会被内联\n}\n\n// 7. 避免多态\n// ❌\nfunction handle(value) {\n  return value.process();  // value可能是多种类型\n}\n\n// ✅ 类型分派\nfunction handleNumber(num) {\n  return num * 2;\n}\n\nfunction handleString(str) {\n  return str.toUpperCase();\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "性能优化策略",
      "url": "21-03-performance-optimization.html"
    },
    "next": {
      "title": "JIT编译优化",
      "url": "22-02-jit-optimization.html"
    }
  }
};
