/**
 * WebAssembly基础
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2601WasmBasics = {
  "config": {
    "title": "WebAssembly基础",
    "icon": "🔧",
    "description": "理解WebAssembly的基本概念和使用",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["WebAssembly"],
      "question": "WebAssembly的主要优势是什么？",
      "options": ["接近原生的执行速度", "体积更小", "更安全", "更易编写"],
      "correctAnswer": "A",
      "explanation": {"title": "WebAssembly优势", "code": "// WebAssembly (Wasm)：二进制指令格式\n// 接近原生速度执行\n\n// 性能对比\n// JavaScript: 解释执行 → JIT编译\n// WebAssembly: 预编译 → 直接执行\n\n// 加载WebAssembly\nconst response = await fetch('module.wasm');\nconst buffer = await response.arrayBuffer();\nconst module = await WebAssembly.instantiate(buffer);\n\nconst result = module.instance.exports.add(1, 2);\nconsole.log(result);  // 3\n\n// 应用场景：\n// - 游戏引擎\n// - 视频/音频编解码\n// - 图像处理\n// - 科学计算\n// - 加密算法"}
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Wasm特性"],
      "question": "WebAssembly的特点？",
      "options": ["二进制格式", "沙箱执行", "跨平台", "替代JavaScript", "与JS互操作", "支持多种语言编译"],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {"title": "WebAssembly特性", "code": "// 1. 二进制格式（.wasm）\n// 紧凑、快速解析\n\n// 2. 沙箱执行\n// 安全隔离，无法直接访问DOM\n\n// 3. 与JavaScript互操作\nconst wasmModule = await WebAssembly.instantiateStreaming(\n  fetch('calc.wasm'),\n  { env: { log: console.log } }  // 导入JS函数\n);\n\nwasmModule.instance.exports.calculate(10);  // 调用Wasm\n\n// 4. 多语言支持\n// C/C++ → Emscripten → Wasm\n// Rust → wasm-pack → Wasm\n// Go → TinyGo → Wasm\n// AssemblyScript → asc → Wasm\n\n// 5. 跨平台\n// 浏览器、Node.js、边缘计算"}
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["内存"],
      "question": "WebAssembly使用线性内存模型",
      "correctAnswer": "A",
      "explanation": {"title": "线性内存", "code": "// WebAssembly.Memory：线性内存\nconst memory = new WebAssembly.Memory({\n  initial: 1,  // 1页 = 64KB\n  maximum: 10  // 最大10页\n});\n\n// 访问内存\nconst buffer = new Uint8Array(memory.buffer);\nbuffer[0] = 42;\n\n// Wasm与JS共享内存\nconst module = await WebAssembly.instantiate(wasmBytes, {\n  env: { memory }\n});\n\n// Wasm修改内存，JS可见\nmodule.instance.exports.write(100, 0xFF);\nconsole.log(buffer[100]);  // 255\n\n// 内存增长\nmemory.grow(1);  // 增加1页"}
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["实例化"],
      "question": "实例化Wasm模块，空白处填什么？",
      "code": "const module = await WebAssembly.______(buffer);\nconst result = module.instance.exports.func();",
      "options": ["instantiate", "compile", "load", "create"],
      "correctAnswer": "A",
      "explanation": {"title": "加载Wasm", "code": "// 方法1：instantiate（编译+实例化）\nconst module = await WebAssembly.instantiate(buffer);\nmodule.instance.exports.func();\n\n// 方法2：instantiateStreaming（流式）\nconst module2 = await WebAssembly.instantiateStreaming(\n  fetch('module.wasm')\n);\n\n// 方法3：分步（compile → instantiate）\nconst compiled = await WebAssembly.compile(buffer);\nconst instance = await WebAssembly.instantiate(compiled);\n\n// 方法4：同步（不推荐）\nconst mod = new WebAssembly.Module(buffer);\nconst inst = new WebAssembly.Instance(mod);"}
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["类型"],
      "question": "Wasm支持的数值类型？",
      "code": "// Wasm模块导出函数\nexports.getInt = () => 42;\nexports.getFloat = () => 3.14;\nexports.getBigInt = () => 9007199254740993n;\n\n// JavaScript调用后的类型？",
      "options": ["number, number, 报错", "number, number, bigint", "int, float, bigint", "都是number"],
      "correctAnswer": "A",
      "explanation": {"title": "Wasm类型系统", "code": "// WebAssembly数值类型：\n// i32, i64, f32, f64\n\n// i32/f32/f64 → JavaScript Number\nconst i32 = instance.exports.getI32();  // number\nconst f64 = instance.exports.getF64();  // number\n\n// i64 → JavaScript BigInt（需要特殊处理）\n// Wasm默认不支持直接返回i64到JS\n// 需要通过内存或拆分为两个i32\n\n// 类型转换\n// JS → Wasm\nexports.add(1, 2);      // number → i32\nexports.addF(1.5, 2.3); // number → f64\n\n// 无效类型会被转换\nexports.add(1.5, 2.7);  // 转为i32: 1 + 2 = 3\n\n// Wasm不支持：\n// - 字符串（需要通过内存传递）\n// - 对象\n// - 数组"}
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["互操作"],
      "question": "JS与Wasm互操作的方式？",
      "options": ["导出函数", "导入函数", "共享内存", "直接传递对象", "Table对象", "全局变量"],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {"title": "JS-Wasm互操作", "code": "// 1. 导出Wasm函数给JS\nconst { add } = instance.exports;\nadd(1, 2);  // 调用Wasm\n\n// 2. 导入JS函数到Wasm\nconst importObject = {\n  env: {\n    log: (x) => console.log(x),\n    random: Math.random\n  }\n};\nconst instance = await WebAssembly.instantiate(buffer, importObject);\n\n// 3. 共享内存\nconst memory = new WebAssembly.Memory({ initial: 1 });\nconst view = new Uint8Array(memory.buffer);\n\n// 4. Table（函数引用）\nconst table = new WebAssembly.Table({\n  initial: 2,\n  element: 'anyfunc'\n});\ntable.set(0, jsFunction);\n\n// 5. 全局变量\nconst global = new WebAssembly.Global(\n  { value: 'i32', mutable: true },\n  42\n);\ninstance.exports.getGlobal();"}
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["性能"],
      "question": "WebAssembly总是比JavaScript快",
      "correctAnswer": "B",
      "explanation": {"title": "性能考虑", "code": "// Wasm并非总是更快\n\n// ✅ Wasm更快的场景：\n// - CPU密集型计算\n// - 数值运算\n// - 无GC的语言（C/Rust）\n\nfunction heavyCompute() {\n  for (let i = 0; i < 1000000; i++) {\n    Math.sqrt(i);\n  }\n}\n// Wasm版本可能快10倍\n\n// ❌ Wasm可能更慢：\n// - DOM操作（需要通过JS）\n// - 字符串处理（需要编码）\n// - 小规模计算（调用开销）\n// - 频繁JS-Wasm切换\n\n// 调用开销\nfor (let i = 0; i < 1000000; i++) {\n  wasmAdd(i, 1);  // 频繁跨界调用，慢\n}\n\n// 最佳实践：\n// - 批量处理\n// - 减少跨界调用\n// - 在Wasm中完成整个计算"}
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Emscripten"],
      "question": "使用Emscripten编译C到Wasm，空白处填什么？",
      "code": "// C代码\nint add(int a, int b) { return a + b; }\n\n// 编译命令\nemcc add.c -o add.______ -s EXPORTED_FUNCTIONS='[\"_add\"]'",
      "options": ["js", "wasm", "html", "o"],
      "correctAnswer": "A",
      "explanation": {"title": "Emscripten工具链", "code": "// Emscripten：C/C++ → Wasm\n\n// 1. 编译为JS（包含Wasm加载器）\n// emcc add.c -o add.js -s EXPORTED_FUNCTIONS='[\"_add\"]'\n\n// 使用\nimport Module from './add.js';\nModule.onRuntimeInitialized = () => {\n  const result = Module._add(1, 2);\n  console.log(result);\n};\n\n// 2. 只编译Wasm\n// emcc add.c -o add.wasm\n\n// 3. 编译选项\n// -O3：优化\n// -s WASM=1：启用Wasm\n// -s MODULARIZE=1：ES模块\n// -s EXPORT_ES6=1：ES6导出\n\n// 4. C函数导出\nEMSCRIPTEN_KEEPALIVE\nint add(int a, int b) {\n  return a + b;\n}\n\n// 5. 调用JS\nEM_JS(void, jsLog, (int x), {\n  console.log(x);\n});"}
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["应用"],
      "question": "WebAssembly的实际应用？",
      "options": ["Figma设计工具", "视频编辑器", "游戏引擎", "简单网页", "AutoCAD Web", "机器学习"],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {"title": "Wasm应用案例", "code": "// 1. Figma（设计工具）\n// C++渲染引擎 → Wasm\n// 接近桌面应用性能\n\n// 2. Google Earth（3D地球）\n// C++引擎 → Wasm\n\n// 3. AutoCAD Web\n// 复杂CAD计算 → Wasm\n\n// 4. 视频编辑（FFmpeg）\nconst ffmpeg = createFFmpeg();\nawait ffmpeg.load();\nawait ffmpeg.run('-i', 'input.mp4', 'output.webm');\n\n// 5. 游戏引擎\n// Unity → Wasm\n// Unreal Engine → Wasm\n\n// 6. 机器学习\n// TensorFlow.js Wasm后端\nconst model = await tf.loadLayersModel('model.json', {\n  backend: 'wasm'\n});\n\n// 7. 图像处理\n// OpenCV → Wasm\nconst cv = await loadOpenCV();\nconst mat = cv.imread(imageElement);"}
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["浏览器支持"],
      "question": "所有现代浏览器都支持WebAssembly",
      "correctAnswer": "A",
      "explanation": {"title": "浏览器支持", "code": "// 检测支持\nif (typeof WebAssembly === 'object') {\n  console.log('支持WebAssembly');\n} else {\n  console.log('不支持');\n}\n\n// 浏览器支持情况：\n// ✅ Chrome 57+\n// ✅ Firefox 52+\n// ✅ Safari 11+\n// ✅ Edge 16+\n// ❌ IE（任何版本）\n\n// Node.js支持：\n// Node.js 8+\n\n// Polyfill（降级）\nif (!WebAssembly) {\n  // 使用asm.js版本\n  import('./fallback.js');\n}\n\n// 特性检测\nconst hasWasm = (() => {\n  try {\n    if (typeof WebAssembly === 'object' &&\n        typeof WebAssembly.instantiate === 'function') {\n      const module = new WebAssembly.Module(\n        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)\n      );\n      if (module instanceof WebAssembly.Module)\n        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;\n    }\n  } catch (e) {}\n  return false;\n})();"}
    }
  ],
  "navigation": {
    "prev": {"title": "并发模式", "url": "25-03-concurrency-patterns.html"},
    "next": {"title": "Wasm与JavaScript", "url": "26-02-wasm-js.html"}
  }
};
