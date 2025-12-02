/**
 * JIT编译优化
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2202JITOptimization = {
  "config": {
    "title": "JIT编译优化",
    "icon": "⚙️",
    "description": "深入理解JIT编译器的优化策略和技巧",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["内联"],
      "question": "函数内联（Inlining）的主要好处是什么？",
      "options": [
        "消除函数调用开销",
        "减少代码体积",
        "提高可读性",
        "便于调试"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数内联优化",
        "code": "// 函数内联：将函数调用替换为函数体\n\n// 原始代码\nfunction add(a, b) {\n  return a + b;\n}\n\nfunction calculate(x, y) {\n  return add(x, y) * 2;  // 函数调用\n}\n\n// JIT内联后等价于：\nfunction calculate_inlined(x, y) {\n  return (x + y) * 2;  // 直接展开\n}\n\n// 好处：\n// 1. 消除调用开销（压栈、跳转、返回）\n// 2. 暴露更多优化机会\n// 3. 减少栈帧创建\n\n// 内联条件：\n// 1. 函数体小（通常<600字节）\n// 2. 调用频繁\n// 3. 非递归\n// 4. 单态调用\n\n// ✅ 易内联\nfunction small(x) {\n  return x * 2;\n}\n\n// ❌ 难内联\nfunction large() {\n  // 很多代码...\n  // 超过600字节\n}\n\n// ❌ 难内联（递归）\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}"
      },
      "source": "内联"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["推测优化"],
      "question": "以下代码的优化行为？",
      "code": "function process(value) {\n  return value.x + value.y;\n}\n\n// 调用1000次\nfor (let i = 0; i < 1000; i++) {\n  process({ x: i, y: i + 1 });\n}\n\n// 然后\nprocess({ x: 1, y: 2, z: 3 });\n\n// JIT会如何处理？",
      "options": [
        "继续使用优化版本（推测成功）",
        "反优化（隐藏类变化）",
        "报错",
        "不优化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "推测优化（Speculative Optimization）",
        "code": "// JIT编译器基于观察到的类型进行推测优化\n\nfunction process(value) {\n  return value.x + value.y;\n}\n\n// 训练阶段\nfor (let i = 0; i < 1000; i++) {\n  process({ x: i, y: i + 1 });  // 相同形状\n}\n\n// JIT推测：value总是有x和y属性\n// 生成优化代码：直接访问固定偏移量\n\n// 测试\nprocess({ x: 1, y: 2, z: 3 });\n// 虽然多了z属性，但x和y的位置没变\n// 优化代码仍然有效！\n\n// 会触发反优化的情况：\nprocess({ y: 2, x: 1 });  // ❌ 属性顺序变了\nprocess({ x: 1 });        // ❌ 缺少y属性\nprocess('string');        // ❌ 类型完全不同\n\n// 推测优化的类型：\n// 1. 类型推测\nfunction add(a, b) {\n  return a + b;\n}\n\nfor (let i = 0; i < 1000; i++) {\n  add(1, 2);  // JIT推测：总是数字\n}\n\n// 2. 范围推测\nfunction access(arr, i) {\n  return arr[i];\n}\n\nfor (let i = 0; i < 10; i++) {\n  access([1,2,3,4,5], i % 5);  // i总是0-4\n}\n// JIT可以省略边界检查\n\n// 3. 对象形状推测\nclass Point {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n}\n\nfunction getX(p) {\n  return p.x;\n}\n\nfor (let i = 0; i < 1000; i++) {\n  getX(new Point(i, i + 1));\n}\n// JIT假设p总是Point实例"
      },
      "source": "推测优化"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["逃逸分析"],
      "question": "逃逸分析（Escape Analysis）可以优化什么？",
      "options": [
        "栈上分配对象",
        "标量替换",
        "消除同步",
        "增加内存使用",
        "锁消除",
        "函数内联"
      ],
      "correctAnswer": ["A", "B", "E"],
      "explanation": {
        "title": "逃逸分析优化",
        "code": "// 逃逸分析：分析对象是否逃出函数作用域\n\n// 1. 栈上分配\n// ❌ 对象逃逸（堆分配）\nfunction escape() {\n  const obj = { x: 1 };\n  return obj;  // 逃逸！\n}\n\n// ✅ 对象不逃逸（栈分配）\nfunction noEscape() {\n  const obj = { x: 1 };\n  return obj.x;  // 只返回值，对象不逃逸\n}\n// JIT可以在栈上分配obj，无需GC\n\n// 2. 标量替换\nfunction calculate() {\n  const point = { x: 1, y: 2 };\n  return point.x + point.y;\n}\n\n// 优化后等价于：\nfunction calculate_optimized() {\n  const x = 1;\n  const y = 2;\n  return x + y;  // 对象被拆分成标量\n}\n\n// 3. 锁消除（多线程语言）\n// Java示例（概念类似）\nfunction process() {\n  const obj = { value: 0 };\n  synchronized(obj) {  // 锁\n    obj.value++;\n  }\n  return obj.value;\n}\n// 因为obj不逃逸，可以消除锁\n\n// JavaScript应用场景：\n// ✅ 中间对象优化\nfunction transform(arr) {\n  return arr\n    .map(x => ({ value: x * 2 }))  // 中间对象\n    .filter(obj => obj.value > 10)  // 不逃逸\n    .map(obj => obj.value);\n}\n// JIT可能优化掉中间对象\n\n// ✅ 闭包优化\nfunction createCounter() {\n  let count = 0;\n  return {\n    inc: function() { count++; },\n    get: function() { return count; }\n  };\n}\n\nconst counter = createCounter();\ncounter.inc();  // 闭包不逃逸，可优化\n\n// 阻止逃逸分析：\n// 1. 对象被赋给全局变量\n// 2. 对象被传递给未知函数\n// 3. 对象存储在数组/对象中并返回"
      },
      "source": "逃逸分析"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["循环优化"],
      "question": "JIT可以将循环不变量提升到循环外",
      "correctAnswer": "A",
      "explanation": {
        "title": "循环优化",
        "code": "// 循环不变量外提（Loop Invariant Code Motion）\n\n// 原始代码\nfunction process(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    const limit = arr.length * 2;  // 循环不变量\n    if (arr[i] < limit) {\n      console.log(arr[i]);\n    }\n  }\n}\n\n// JIT优化后：\nfunction process_optimized(arr) {\n  const limit = arr.length * 2;  // 提升到外面\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] < limit) {\n      console.log(arr[i]);\n    }\n  }\n}\n\n// 其他循环优化：\n\n// 1. 循环展开（Loop Unrolling）\n// 原始\nfor (let i = 0; i < 100; i++) {\n  arr[i] *= 2;\n}\n\n// 展开后（减少循环开销）\nfor (let i = 0; i < 100; i += 4) {\n  arr[i] *= 2;\n  arr[i + 1] *= 2;\n  arr[i + 2] *= 2;\n  arr[i + 3] *= 2;\n}\n\n// 2. 强度削减（Strength Reduction）\n// 原始\nfor (let i = 0; i < 100; i++) {\n  arr[i] = i * 8;  // 乘法\n}\n\n// 优化后\nlet temp = 0;\nfor (let i = 0; i < 100; i++) {\n  arr[i] = temp;  // 加法更快\n  temp += 8;\n}\n\n// 3. 循环融合（Loop Fusion）\n// 原始\nfor (let i = 0; i < n; i++) {\n  a[i] = b[i] + c[i];\n}\nfor (let i = 0; i < n; i++) {\n  d[i] = a[i] * 2;\n}\n\n// 融合后\nfor (let i = 0; i < n; i++) {\n  a[i] = b[i] + c[i];\n  d[i] = a[i] * 2;\n}\n\n// 4. 边界检查消除\nfor (let i = 0; i < arr.length; i++) {\n  arr[i] = i;  // JIT知道i不会越界\n}\n// 可以省略边界检查"
      },
      "source": "循环优化"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["优化失败"],
      "question": "避免JIT优化失败，空白处填什么？",
      "code": "function calculate(arr) {\n  ______;\n  \n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}",
      "options": [
        "// 确保arr是数组",
        "if (!Array.isArray(arr)) return 0",
        "arr = arr || []",
        "const len = arr.length"
      ],
      "correctAnswer": "B",
      "explanation": {
        "title": "JIT优化失败场景",
        "code": "// 阻止JIT优化的因素：\n\n// 1. try-catch\n// ❌ 难优化\nfunction bad1(arr) {\n  try {\n    let sum = 0;\n    for (let i = 0; i < arr.length; i++) {\n      sum += arr[i];\n    }\n    return sum;\n  } catch (e) {}\n}\n\n// ✅ 隔离try-catch\nfunction good1(arr) {\n  return safe(() => {\n    let sum = 0;\n    for (let i = 0; i < arr.length; i++) {\n      sum += arr[i];\n    }\n    return sum;\n  });\n}\n\nfunction safe(fn) {\n  try {\n    return fn();\n  } catch (e) {\n    return 0;\n  }\n}\n\n// 2. 类型不确定\n// ❌\nfunction bad2(arr) {\n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];  // arr可能不是数组\n  }\n  return sum;\n}\n\n// ✅ 类型守卫\nfunction good2(arr) {\n  if (!Array.isArray(arr)) return 0;\n  \n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];  // JIT知道arr是数组\n  }\n  return sum;\n}\n\n// 3. arguments对象\n// ❌\nfunction bad3() {\n  const args = arguments;  // 阻止优化\n  return args[0];\n}\n\n// ✅ 剩余参数\nfunction good3(...args) {\n  return args[0];  // 可优化\n}\n\n// 4. eval/with\n// ❌\nfunction bad4(code) {\n  eval(code);  // 阻止优化\n}\n\n// ✅ 避免eval\nfunction good4(fn) {\n  fn();  // 传递函数\n}\n\n// 5. delete操作\n// ❌\nfunction bad5(obj) {\n  delete obj.x;  // 改变对象形状\n}\n\n// ✅ 设为undefined\nfunction good5(obj) {\n  obj.x = undefined;  // 保持形状\n}\n\n// 6. 函数过大\n// ❌ 超过600字节难以内联\nfunction bad6() {\n  // 500行代码...\n}\n\n// ✅ 拆分小函数\nfunction good6() {\n  helper1();\n  helper2();\n  helper3();\n}"
      },
      "source": "优化失败"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["去虚化"],
      "question": "方法去虚化的效果？",
      "code": "class Animal {\n  speak() {\n    return 'sound';\n  }\n}\n\nclass Dog extends Animal {\n  speak() {\n    return 'woof';\n  }\n}\n\nfunction makeSpeak(animal) {\n  return animal.speak();\n}\n\n// 调用1000次\nfor (let i = 0; i < 1000; i++) {\n  makeSpeak(new Dog());\n}\n\n// JIT优化程度？",
      "options": [
        "去虚化为直接调用Dog.speak()",
        "仍然是虚调用",
        "内联Animal.speak()",
        "不优化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "去虚化优化",
        "code": "// 去虚化（Devirtualization）：\n// 将虚方法调用转为直接调用\n\nclass Animal {\n  speak() {\n    return 'sound';\n  }\n}\n\nclass Dog extends Animal {\n  speak() {\n    return 'woof';\n  }\n}\n\nfunction makeSpeak(animal) {\n  return animal.speak();  // 虚调用\n}\n\n// 单态调用（总是Dog）\nfor (let i = 0; i < 1000; i++) {\n  makeSpeak(new Dog());\n}\n\n// JIT观察到总是Dog，优化为：\nfunction makeSpeak_optimized(animal) {\n  // 类型检查\n  if (animal instanceof Dog) {\n    return Dog.prototype.speak.call(animal);\n    // 甚至可能内联为：return 'woof';\n  }\n  // 回退到虚调用\n  return animal.speak();\n}\n\n// 多态调用（两种类型）\nclass Cat extends Animal {\n  speak() {\n    return 'meow';\n  }\n}\n\nfor (let i = 0; i < 1000; i++) {\n  makeSpeak(i % 2 ? new Dog() : new Cat());\n}\n\n// JIT生成多态调用：\nfunction makeSpeak_polymorphic(animal) {\n  if (animal instanceof Dog) {\n    return 'woof';\n  } else if (animal instanceof Cat) {\n    return 'meow';\n  }\n  return animal.speak();\n}\n\n// 超态（很多类型）\n// JIT放弃优化，使用虚调用\n\n// 最佳实践：\n// ✅ 保持单态\nfunction processDogs(dogs) {\n  return dogs.map(dog => dog.speak());\n}\n\n// ❌ 多态\nfunction processAnimals(animals) {\n  return animals.map(a => a.speak());\n}"
      },
      "source": "去虚化"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["OSR"],
      "question": "栈上替换（OSR）的作用？",
      "options": [
        "在运行中替换为优化代码",
        "优化长循环",
        "减少启动时间",
        "替换变量类型",
        "处理热点代码",
        "增加内存使用"
      ],
      "correctAnswer": ["A", "B", "E"],
      "explanation": {
        "title": "栈上替换（On-Stack Replacement）",
        "code": "// OSR：在函数执行过程中替换为优化版本\n\nfunction longLoop() {\n  let sum = 0;\n  \n  // 长循环\n  for (let i = 0; i < 1000000; i++) {\n    sum += i;\n    \n    // 当i达到某个阈值（如10000）\n    // JIT可能在循环中间切换到优化代码\n  }\n  \n  return sum;\n}\n\n// 执行流程：\n// 1. 开始以字节码执行\n// 2. 循环执行一段时间后变热\n// 3. JIT编译优化版本\n// 4. 在循环中间切换到优化代码（OSR）\n// 5. 后续迭代使用优化代码\n\n// 为什么需要OSR：\n// 1. 长循环函数启动慢\n// 2. 等循环结束再优化太晚\n// 3. 需要在执行中优化\n\n// OSR触发条件：\n// - 循环迭代次数超过阈值\n// - 函数执行时间超过阈值\n// - 有足够的类型反馈\n\n// OSR vs 正常优化：\n// 正常优化：\nfunction normal() {\n  // 第1次调用：字节码\n  // 第N次调用：优化代码（从头开始）\n}\n\n// OSR：\nfunction withOSR() {\n  // 开始：字节码\n  for (let i = 0; i < 1000000; i++) {\n    // i < 10000：字节码\n    // i >= 10000：优化代码（中途切换）\n  }\n}\n\n// 查看OSR（Node.js）：\n// node --trace-osr script.js"
      },
      "source": "OSR"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["内联缓存"],
      "question": "内联缓存可以加速属性访问",
      "correctAnswer": "A",
      "explanation": {
        "title": "内联缓存加速",
        "code": "// 内联缓存（IC）：缓存属性访问路径\n\nfunction getProperty(obj) {\n  return obj.name;  // 属性访问\n}\n\n// 第一次调用\nconst user1 = { name: 'Alice', age: 25 };\ngetProperty(user1);\n// IC记录：\n// - 对象隐藏类：C1\n// - name属性偏移量：0\n// - 属性值类型：字符串\n\n// 第二次调用（相同类型）\nconst user2 = { name: 'Bob', age: 30 };\ngetProperty(user2);\n// IC命中：\n// 1. 检查隐藏类是否为C1 → 是\n// 2. 直接访问偏移量0 → 快！\n\n// IC状态转换：\n// Uninitialized → Monomorphic → Polymorphic → Megamorphic\n\n// 单态IC（最快）\nfunction mono(obj) {\n  return obj.x;  // 总是相同类型\n}\n\nmono({ x: 1 });\nmono({ x: 2 });\nmono({ x: 3 });  // 都是同一隐藏类\n\n// 多态IC（较快，2-4种类型）\nfunction poly(obj) {\n  return obj.x;\n}\n\npoly({ x: 1 });           // 类型1\npoly({ x: 1, y: 2 });     // 类型2\npoly({ x: 1, y: 2, z: 3 }); // 类型3\n// IC缓存3种类型的路径\n\n// 超态IC（慢，很多类型）\nfunction mega(obj) {\n  return obj.x;\n}\n\nfor (let i = 0; i < 10; i++) {\n  const obj = { x: i };\n  for (let j = 0; j < i; j++) {\n    obj['prop' + j] = j;  // 每次形状不同\n  }\n  mega(obj);  // 超过4种类型，IC失效\n}\n\n// 最佳实践：保持单态\nclass Point {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n}\n\nfunction getX(p) {\n  return p.x;  // 总是Point，单态IC\n}\n\ngetX(new Point(1, 2));\ngetX(new Point(3, 4));"
      },
      "source": "内联缓存"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能提示"],
      "question": "帮助JIT优化，空白处填什么？",
      "code": "// 使用%PrepareFunctionForOptimization提示V8\n______\nfunction critical(x) {\n  return x * x;\n}\n\nfor (let i = 0; i < 100; i++) {\n  critical(i);\n}",
      "options": [
        "%PrepareFunctionForOptimization(critical);",
        "// @optimize",
        "critical.optimize = true;",
        "JIT.optimize(critical);"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8运行时函数",
        "code": "// V8运行时函数（需要--allow-natives-syntax）\n\n// 1. 准备优化\n%PrepareFunctionForOptimization(fn);\n\n// 2. 强制优化\n%OptimizeFunctionOnNextCall(fn);\nfn();  // 这次调用会触发优化\n\n// 3. 检查优化状态\nfunction test(x) {\n  return x * 2;\n}\n\n%PrepareFunctionForOptimization(test);\n\nfor (let i = 0; i < 1000; i++) {\n  test(i);\n}\n\n%OptimizeFunctionOnNextCall(test);\ntest(1);\n\n// 检查状态\nconst status = %GetOptimizationStatus(test);\nconsole.log('优化状态:', status);\n// 1: 优化\n// 2: 未优化\n// 3: 总是优化\n// 4: 从不优化\n\n// 4. 清除类型反馈\n%ClearFunctionFeedback(fn);\n\n// 5. 触发GC\n%CollectGarbage(0);\n\n// 6. 打印对象布局\n%DebugPrint(obj);\n\n// 7. 检查是否为SMI\n%IsSmi(value);\n\n// 使用示例：\nfunction benchmark() {\n  function add(a, b) {\n    return a + b;\n  }\n  \n  %PrepareFunctionForOptimization(add);\n  \n  // 预热\n  for (let i = 0; i < 1000; i++) {\n    add(i, i + 1);\n  }\n  \n  %OptimizeFunctionOnNextCall(add);\n  add(1, 2);  // 触发优化\n  \n  // 基准测试\n  const start = Date.now();\n  for (let i = 0; i < 1000000; i++) {\n    add(i, i + 1);\n  }\n  console.log('耗时:', Date.now() - start);\n  \n  console.log('优化:', %GetOptimizationStatus(add) === 1);\n}\n\n// 运行：\n// node --allow-natives-syntax benchmark.js"
      },
      "source": "运行时函数"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "JIT友好的编程实践？",
      "options": [
        "单态函数调用",
        "避免try-catch在热路径",
        "小函数易内联",
        "使用eval动态执行",
        "保持对象形状稳定",
        "使用arguments对象"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "JIT优化最佳实践",
        "code": "// 1. 单态调用\n// ✅\nfunction processNumbers(nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\n\nprocessNumbers([1, 2, 3]);\nprocessNumbers([4, 5, 6]);\n// 总是数字数组，单态\n\n// 2. 隔离try-catch\n// ✅\nfunction safeExecute(fn) {\n  try {\n    return fn();\n  } catch (e) {\n    return null;\n  }\n}\n\nfunction hotPath() {\n  return safeExecute(() => compute());  // 可优化\n}\n\n// 3. 小函数内联\n// ✅\nfunction add(a, b) { return a + b; }\nfunction mul(a, b) { return a * b; }\n\nfunction calculate(x, y) {\n  return mul(add(x, y), 2);  // add和mul会被内联\n}\n\n// 4. 稳定对象形状\n// ✅\nclass User {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n    this.email = null;  // 预声明\n  }\n}\n\n// 5. 类型一致\n// ✅\nconst arr = [1, 2, 3, 4, 5];  // 全是SMI\n\n// ❌\nconst bad = [1, 2.5, '3'];  // 类型混杂\n\n// 6. 避免动态代码\n// ❌\nfunction bad(code) {\n  eval(code);\n  with (obj) {}\n}\n\n// 7. 使用TypedArray\n// ✅\nconst ints = new Int32Array(1000);\nfor (let i = 0; i < 1000; i++) {\n  ints[i] = i;\n}\n\n// 8. 循环优化\n// ✅\nconst len = arr.length;  // 提取长度\nfor (let i = 0; i < len; i++) {\n  process(arr[i]);\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "V8引擎原理",
      "url": "22-01-v8-engine.html"
    },
    "next": {
      "title": "V8内存管理",
      "url": "22-03-v8-memory.html"
    }
  }
};
