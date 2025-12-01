// 批量生成 basics 目录下所有 HTML 文件的脚本
// 运行方式: node generate-basics-html.js

const fs = require('fs');
const path = require('path');

// HTML 模板
const template = (title, primaryColor, primaryLight, bgGradient, dataFile, dataVar) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - JavaScript 面试题</title>
    <link rel="stylesheet" href="../css/quiz-common.css">
    <style>
        :root {
            --primary-color: ${primaryColor};
            --primary-light: ${primaryLight};
        }
        body { background: ${bgGradient}; }
        .header { border-bottom: 3px solid ${primaryColor}; }
        .header h1 { color: ${primaryColor}; }
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
    <script src="../data/${dataFile}.js"></script>
    <script>QuizRenderer.init(window.${dataVar});</script>
</body>
</html>`;

// basics 目录下所有章节配置
const chapters = [
  // 01系列
  { file: '01-intro', title: 'JavaScript 简介', color: '#667eea', light: '#eef2ff', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', data: 'basics-01-intro', var: 'quizData_Basics01Intro' },
  { file: '01-variables', title: '变量声明', color: '#f093fb', light: '#fce7f3', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', data: 'basics-01-variables', var: 'quizData_Basics01Variables' },
  { file: '01-datatypes', title: '数据类型', color: '#4facfe', light: '#dbeafe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', data: 'basics-01-datatypes', var: 'quizData_Basics01Datatypes' },
  { file: '01-type-conversion', title: '类型转换', color: '#10b981', light: '#d1fae5', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', data: 'basics-01-type-conversion', var: 'quizData_Basics01TypeConversion' },
  
  // 02系列
  { file: '02-operators', title: '运算符', color: '#f59e0b', light: '#fef3c7', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', data: 'basics-02-operators', var: 'quizData_Basics02Operators' },
  { file: '02-expressions', title: '表达式', color: '#8b5cf6', light: '#ede9fe', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', data: 'basics-02-expressions', var: 'quizData_Basics02Expressions' },
  
  // 03系列
  { file: '03-conditionals', title: '条件语句', color: '#ec4899', light: '#fce7f3', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', data: 'basics-03-conditionals', var: 'quizData_Basics03Conditionals' },
  { file: '03-loops', title: '循环语句', color: '#06b6d4', light: '#cffafe', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', data: 'basics-03-loops', var: 'quizData_Basics03Loops' },
  { file: '03-error-handling', title: '错误处理', color: '#ef4444', light: '#fee2e2', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', data: 'basics-03-error-handling', var: 'quizData_Basics03ErrorHandling' },
  
  // 04系列
  { file: '04-function-basics', title: '函数基础', color: '#3b82f6', light: '#dbeafe', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', data: 'basics-04-function-basics', var: 'quizData_Basics04FunctionBasics' },
  { file: '04-scope', title: '作用域', color: '#8b5cf6', light: '#ede9fe', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', data: 'basics-04-scope', var: 'quizData_Basics04Scope' },
  { file: '04-closure', title: '闭包', color: '#ec4899', light: '#fce7f3', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', data: 'basics-04-closure', var: 'quizData_Basics04Closure' },
  { file: '04-this', title: 'this关键字', color: '#f59e0b', light: '#fef3c7', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', data: 'basics-04-this', var: 'quizData_Basics04This' },
  { file: '04-call-apply-bind', title: 'call/apply/bind', color: '#10b981', light: '#d1fae5', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', data: 'basics-04-call-apply-bind', var: 'quizData_Basics04CallApplyBind' },
  
  // 05系列
  { file: '05-object-basics', title: '对象基础', color: '#667eea', light: '#eef2ff', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', data: 'basics-05-object-basics', var: 'quizData_Basics05ObjectBasics' },
  { file: '05-arrays', title: '数组', color: '#4facfe', light: '#dbeafe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', data: 'basics-05-arrays', var: 'quizData_Basics05Arrays' },
  { file: '05-prototype', title: '原型', color: '#f093fb', light: '#fce7f3', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', data: 'basics-05-prototype', var: 'quizData_Basics05Prototype' },
  { file: '05-constructor-new', title: '构造函数与new', color: '#06b6d4', light: '#cffafe', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', data: 'basics-05-constructor-new', var: 'quizData_Basics05ConstructorNew' },
  { file: '05-inheritance', title: '继承', color: '#8b5cf6', light: '#ede9fe', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', data: 'basics-05-inheritance', var: 'quizData_Basics05Inheritance' },
  
  // 06系列
  { file: '06-array-advanced', title: '数组高级', color: '#ec4899', light: '#fce7f3', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', data: 'basics-06-array-advanced', var: 'quizData_Basics06ArrayAdvanced' },
  { file: '06-typed-array', title: '类型化数组', color: '#f59e0b', light: '#fef3c7', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', data: 'basics-06-typed-array', var: 'quizData_Basics06TypedArray' },
  
  // 07系列
  { file: '07-strings', title: '字符串', color: '#10b981', light: '#d1fae5', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', data: 'basics-07-strings', var: 'quizData_Basics07Strings' },
  { file: '07-regex', title: '正则表达式', color: '#ef4444', light: '#fee2e2', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', data: 'basics-07-regex', var: 'quizData_Basics07Regex' },
  
  // 08系列
  { file: '08-math-date', title: 'Math与Date', color: '#3b82f6', light: '#dbeafe', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', data: 'basics-08-math-date', var: 'quizData_Basics08MathDate' },
];

// 生成文件
const basicsDir = path.join(__dirname, 'basics');
let successCount = 0;
let errorCount = 0;

chapters.forEach(chapter => {
  const html = template(
    chapter.title,
    chapter.color,
    chapter.light,
    chapter.gradient,
    chapter.data,
    chapter.var
  );
  
  const filePath = path.join(basicsDir, `${chapter.file}.html`);
  
  try {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✅ 生成成功: ${chapter.file}.html`);
    successCount++;
  } catch (error) {
    console.error(`❌ 生成失败: ${chapter.file}.html`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 总计: ${chapters.length}个文件`);
console.log(`✅ 成功: ${successCount}个`);
console.log(`❌ 失败: ${errorCount}个`);
