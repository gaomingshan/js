# 📋 题目数据结构说明

## 🎯 支持的题型

渲染器现已支持5种题型，通过 `type` 字段区分：

1. **单选题** (`single-choice`) - 默认类型
2. **多选题** (`multiple-choice`) - 新增
3. **代码输出题** (`code-output`) - 新增  
4. **判断题** (`true-false`) - 新增
5. **代码补全题** (`code-completion`) - 新增

---

## 📐 数据结构模板

### 1. 单选题 (single-choice)

**适用场景**：概念理解、知识点判断

```javascript
{
  "type": "single-choice",  // 可省略，默认类型
  "difficulty": "easy",      // easy | medium | hard
  "tags": ["闭包", "作用域"],
  "question": "什么是闭包？",
  "options": [
    "函数能够访问其外部作用域变量的能力",
    "函数嵌套",
    "匿名函数",
    "回调函数"
  ],
  "correctAnswer": "A",       // 单个字母
  "explanation": {
    "title": "闭包定义：",
    "code": "function outer() {\n  let count = 0;\n  return function inner() {\n    return ++count;\n  };\n}",
    "points": [
      "闭包=函数+词法环境",
      "可以访问外部变量",
      "形成私有作用域"
    ]
  },
  "source": "闭包原理"
}
```

---

### 2. 多选题 (multiple-choice)

**适用场景**：知识点综合、特性列举

```javascript
{
  "type": "multiple-choice",
  "difficulty": "medium",
  "tags": ["数组方法"],
  "question": "以下哪些数组方法会改变原数组？",
  "options": [
    "push()",
    "map()",
    "splice()",
    "filter()"
  ],
  "correctAnswer": ["A", "C"],  // 多个答案，数组形式
  "explanation": {
    "title": "会改变原数组的方法：",
    "sections": [
      {
        "title": "改变原数组",
        "points": ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"]
      },
      {
        "title": "不改变原数组",
        "points": ["map", "filter", "slice", "concat"]
      }
    ]
  },
  "source": "数组方法"
}
```

**渲染效果**：
- ☑️ 标记为"多选题"
- 显示checkbox复选框
- 💡 提示"请选择所有正确答案"
- 可以选择多个选项

---

### 3. 代码输出题 (code-output)

**适用场景**：考查代码执行结果、逻辑分析

```javascript
{
  "type": "code-output",
  "difficulty": "hard",
  "tags": ["类型转换", "运算符"],
  "question": "以下代码的输出是什么？",
  "code": "console.log([] + []);\nconsole.log([] + {});\nconsole.log({} + []);\nconsole.log({} + {});",
  "options": [
    "'', '[object Object]', 0, '[object Object][object Object]'",
    "'', '[object Object]', '[object Object]', '[object Object][object Object]'",
    "报错",
    "undefined"
  ],
  "correctAnswer": "B",
  "explanation": {
    "title": "类型转换规则：",
    "sections": [
      {
        "title": "1. [] + []",
        "code": "// [].toString() = ''\n// '' + '' = ''",
        "content": "结果：''"
      },
      {
        "title": "2. [] + {}",
        "code": "// [].toString() = ''\n// {}.toString() = '[object Object]'\n// '' + '[object Object]'",
        "content": "结果：'[object Object]'"
      },
      {
        "title": "3. {} + []",
        "code": "// {} 被解析为代码块\n// +[] = 0",
        "content": "结果：0"
      },
      {
        "title": "4. {} + {}",
        "code": "// {} 被解析为代码块\n// +{} = NaN",
        "content": "结果：NaN（但作为字符串拼接时）"
      }
    ]
  },
  "source": "类型转换"
}
```

**渲染效果**：
- 💻 标记为"代码输出题"
- 代码块高亮显示（灰色背景）
- 选项用 `<code>` 标签包裹

---

### 4. 判断题 (true-false)

**适用场景**：正误判断、概念验证

```javascript
{
  "type": "true-false",
  "difficulty": "easy",
  "tags": ["类型判断"],
  "question": "typeof null 的结果是 'object'",
  "code": "console.log(typeof null);  // ?",  // 可选
  "correctAnswer": "A",  // A=正确, B=错误
  "explanation": {
    "title": "typeof null 的历史问题：",
    "content": "这是JavaScript的一个历史遗留bug。在JavaScript最初的实现中，值以32位存储，类型标签在低位，而null被表示为全0，恰好与object的类型标签相同。",
    "code": "typeof null === 'object'  // true\nnull instanceof Object    // false",
    "points": [
      "这是一个公认的JavaScript bug",
      "由于兼容性原因无法修复",
      "判断null应使用 === null"
    ]
  },
  "source": "类型判断"
}
```

**渲染效果**：
- ✔️ 标记为"判断题"
- 只有两个选项：A. ✅ 正确  B. ❌ 错误
- 可选的代码块展示

---

### 5. 代码补全题 (code-completion)

**适用场景**：填空、实现细节

```javascript
{
  "type": "code-completion",
  "difficulty": "hard",
  "tags": ["防抖", "闭包"],
  "question": "下面的防抖函数应该返回什么？",
  "code": "function debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      // 这里应该填什么？\n    }, delay);\n  };\n}",
  "options": [
    "fn.apply(this, args)",
    "fn(...args)",
    "fn.call(this, ...args)",
    "fn.bind(this)(...args)"
  ],
  "correctAnswer": "A",
  "explanation": {
    "title": "防抖函数实现要点：",
    "sections": [
      {
        "title": "为什么用apply？",
        "points": [
          "需要保持原函数的this上下文",
          "需要传递所有参数",
          "apply可以同时做到这两点"
        ]
      },
      {
        "title": "完整实现",
        "code": "function debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);  // 正确答案\n    }, delay);\n  };\n}\n\n// 使用\nconst debouncedFn = debounce(function(x) {\n  console.log(this, x);\n}, 1000);"
      }
    ]
  },
  "source": "防抖实现"
}
```

**渲染效果**：
- 🔧 标记为"代码补全题"
- 代码块显示待补全的代码
- 选项用 `<code>` 标签包裹

---

## 🔧 explanation（解析）字段结构

解析部分支持灵活的格式：

### 简单文本
```javascript
"explanation": "这是简单的文字说明"
```

### 完整结构
```javascript
"explanation": {
  "title": "主标题",           // 可选
  "description": "描述文字",  // 可选
  "code": "代码示例",          // 可选，单个代码块
  "points": [                 // 可选，要点列表
    "要点1",
    "要点2"
  ],
  "sections": [               // 可选，多个章节
    {
      "title": "章节标题",
      "content": "章节内容",   // 可选
      "code": "代码示例",      // 可选
      "points": ["要点"]       // 可选
    }
  ]
}
```

---

## 📊 完整数据文件示例

```javascript
window.quizData_ExampleChapter = {
  "config": {
    "title": "示例章节",
    "icon": "📚",
    "description": "展示所有题型的示例",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["基础"],
      "question": "这是一个单选题",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": "A",
      "explanation": "这是解析",
      "source": "来源"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["进阶"],
      "question": "这是一个多选题",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": ["A", "C"],
      "explanation": "这是解析",
      "source": "来源"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["代码"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(1 + '1');",
      "options": ["'11'", "2", "NaN", "报错"],
      "correctAnswer": "A",
      "explanation": "这是解析",
      "source": "来源"
    }
    // ... 更多题目
  ],
  "navigation": {
    "prev": {"title": "上一节", "url": "previous.html"},
    "next": {"title": "下一节", "url": "next.html"}
  }
};
```

---

## ✅ 向后兼容

**重要**：现有的24个数据文件无需修改！

- 不包含 `type` 字段的题目会自动识别为 `single-choice`
- 所有现有题目都能正常渲染
- 只有新题目才需要显式指定 `type`

---

## 🎯 题型选择建议

| 知识点类型 | 推荐题型 | 原因 |
|-----------|---------|------|
| 概念定义 | 单选题 | 直接明确 |
| 特性列举 | 多选题 | 全面考查 |
| 代码分析 | 代码输出题 | 实战能力 |
| 真假判断 | 判断题 | 快速验证 |
| 实现细节 | 代码补全题 | 深入理解 |

---

## 🚀 下一步

现在可以创建包含多种题型的数据文件，让题目更有挑战性和实用性！

示例：将现有的简单选择题改造为更有难度的代码输出题、多选题等。
