# 文件配置验证

## ✅ HTML文件与数据文件映射表

| HTML文件 | 数据文件 | 全局变量 | 状态 |
|---------|---------|----------|------|
| 01-intro.html | basics-01-intro.js | quizData_Basics01Intro | ✅ |
| 01-variables.html | basics-01-variables.js | quizData_Basics01Variables | ✅ |
| 01-datatypes.html | basics-01-datatypes.js | quizData_Basics01Datatypes | ✅ |
| 01-type-conversion.html | basics-01-type-conversion.js | quizData_Basics01TypeConversion | ✅ |
| 02-operators.html | basics-02-operators.js | quizData_Basics02Operators | ✅ |
| 02-expressions.html | basics-02-expressions.js | quizData_Basics02Expressions | ✅ |
| 03-conditionals.html | basics-03-conditionals.js | quizData_Basics03Conditionals | ✅ |
| 03-loops.html | basics-03-loops.js | quizData_Basics03Loops | ✅ |
| 03-error-handling.html | basics-03-error-handling.js | quizData_Basics03ErrorHandling | ✅ |
| 04-function-basics.html | basics-04-function-basics.js | quizData_Basics04FunctionBasics | ✅ |
| 04-scope.html | basics-04-scope.js | quizData_Basics04Scope | ✅ |
| 04-closure.html | basics-04-closure.js | quizData_Basics04Closure | ✅ |
| 04-this.html | basics-04-this.js | quizData_Basics04This | ✅ |
| 04-call-apply-bind.html | basics-04-call-apply-bind.js | quizData_Basics04CallApplyBind | ✅ |
| 05-object-basics.html | basics-05-object-basics.js | quizData_Basics05ObjectBasics | ✅ |
| 05-arrays.html | basics-05-arrays.js | quizData_Basics05Arrays | ✅ |
| 05-prototype.html | basics-05-prototype.js | quizData_Basics05Prototype | ✅ |
| 05-constructor-new.html | basics-05-constructor-new.js | quizData_Basics05ConstructorNew | ✅ |
| 05-inheritance.html | basics-05-inheritance.js | quizData_Basics05Inheritance | ✅ |
| 06-array-advanced.html | basics-06-array-advanced.js | quizData_Basics06ArrayAdvanced | ✅ |
| 06-typed-array.html | basics-06-typed-array.js | quizData_Basics06TypedArray | ✅ |
| 07-strings.html | basics-07-strings.js | quizData_Basics07Strings | ✅ |
| 07-regex.html | basics-07-regex.js | quizData_Basics07Regex | ✅ |
| 08-math-date.html | basics-08-math-date.js | quizData_Basics08MathDate | ✅ |

## 📊 统计信息

- **HTML文件总数**: 24个
- **数据文件总数**: 24个
- **题目总数**: 240道（每个文件10题）
- **配置完整**: 100%

## 🎯 测试要点

### 1. 数据加载测试
打开浏览器控制台（F12），检查：
```javascript
// 数据是否正确加载到全局
console.log(window.quizData_Basics04Closure);

// 应该输出完整的数据对象
// {
//   config: { title, icon, description, ... },
//   questions: [...10 questions...],
//   navigation: { prev, next }
// }
```

### 2. 渲染器测试
```javascript
// QuizRenderer是否正确初始化
console.log(QuizRenderer);

// 检查数据是否加载到渲染器
console.log(QuizRenderer.data);
```

### 3. DOM元素测试
检查页面元素是否正确渲染：
```javascript
// 题目数量
document.querySelectorAll('.quiz-item').length; // 应该是 10

// 标题
document.getElementById('chapter-title').textContent;

// 选项数量
document.querySelectorAll('.option').length; // 应该是 40 (10题×4选项)
```

## 🔧 快速调试脚本

在浏览器控制台运行以下脚本进行快速验证：

```javascript
// 完整验证脚本
(function validatePage() {
    const results = {
        dataLoaded: false,
        dataValid: false,
        rendererInit: false,
        questionsRendered: false,
        navigationRendered: false
    };
    
    // 检查数据加载
    const dataKeys = Object.keys(window).filter(k => k.startsWith('quizData_'));
    results.dataLoaded = dataKeys.length > 0;
    
    if (results.dataLoaded) {
        const data = window[dataKeys[0]];
        results.dataValid = data && data.config && data.questions && data.questions.length === 10;
    }
    
    // 检查渲染器
    results.rendererInit = typeof QuizRenderer !== 'undefined' && QuizRenderer.data !== null;
    
    // 检查DOM
    results.questionsRendered = document.querySelectorAll('.quiz-item').length === 10;
    results.navigationRendered = document.querySelectorAll('.nav-link').length >= 2;
    
    // 输出结果
    console.table(results);
    
    const allPass = Object.values(results).every(v => v === true);
    console.log(allPass ? '✅ 所有检查通过！' : '❌ 存在问题，请查看上方详情');
    
    return results;
})();
```

## 📝 已知的HTML模板结构

每个HTML文件都应该包含：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[章节标题] - JavaScript 面试题</title>
    <link rel="stylesheet" href="../css/quiz-common.css">
    <style>
        :root {
            --primary-color: [主题色];
            --primary-light: [浅色];
        }
        body { background: [渐变背景]; }
        .header { border-bottom: 3px solid [主题色]; }
        .header h1 { color: [主题色]; }
    </style>
</head>
<body>
    <a href="../index.html" class="back-link">← 返回面试题导航</a>
    <div class="container">
        <div class="header">
            <h1 id="chapter-title">加载中...</h1>
            <p id="chapter-desc">正在加载题目数据...</p>
        </div>
        <div id="quiz-container"></div>
        <div class="nav-links" id="nav-links"></div>
    </div>
    <script src="../js/quiz-renderer.js"></script>
    <script src="../data/[数据文件名].js"></script>
    <script>QuizRenderer.init(window.[全局变量名]);</script>
</body>
</html>
```

## ✅ 所有准备工作已完成

现在可以：
1. 在浏览器中打开任意HTML文件进行测试
2. 使用上面的验证脚本快速检查
3. 根据需要调整和优化

**推荐首次测试文件**：`basics/04-closure.html`
这个文件包含复杂的解析内容，是很好的测试案例。
