/**
 * 文件完整性检查脚本
 * 验证所有HTML文件和数据文件是否正确配对
 */

const fs = require('fs');
const path = require('path');

// 文件映射配置
const fileMapping = [
    { html: '01-intro.html', data: 'basics-01-intro.js', variable: 'quizData_Basics01Intro' },
    { html: '01-variables.html', data: 'basics-01-variables.js', variable: 'quizData_Basics01Variables' },
    { html: '01-datatypes.html', data: 'basics-01-datatypes.js', variable: 'quizData_Basics01Datatypes' },
    { html: '01-type-conversion.html', data: 'basics-01-type-conversion.js', variable: 'quizData_Basics01TypeConversion' },
    { html: '02-operators.html', data: 'basics-02-operators.js', variable: 'quizData_Basics02Operators' },
    { html: '02-expressions.html', data: 'basics-02-expressions.js', variable: 'quizData_Basics02Expressions' },
    { html: '03-conditionals.html', data: 'basics-03-conditionals.js', variable: 'quizData_Basics03Conditionals' },
    { html: '03-loops.html', data: 'basics-03-loops.js', variable: 'quizData_Basics03Loops' },
    { html: '03-error-handling.html', data: 'basics-03-error-handling.js', variable: 'quizData_Basics03ErrorHandling' },
    { html: '04-function-basics.html', data: 'basics-04-function-basics.js', variable: 'quizData_Basics04FunctionBasics' },
    { html: '04-scope.html', data: 'basics-04-scope.js', variable: 'quizData_Basics04Scope' },
    { html: '04-closure.html', data: 'basics-04-closure.js', variable: 'quizData_Basics04Closure' },
    { html: '04-this.html', data: 'basics-04-this.js', variable: 'quizData_Basics04This' },
    { html: '04-call-apply-bind.html', data: 'basics-04-call-apply-bind.js', variable: 'quizData_Basics04CallApplyBind' },
    { html: '05-object-basics.html', data: 'basics-05-object-basics.js', variable: 'quizData_Basics05ObjectBasics' },
    { html: '05-arrays.html', data: 'basics-05-arrays.js', variable: 'quizData_Basics05Arrays' },
    { html: '05-prototype.html', data: 'basics-05-prototype.js', variable: 'quizData_Basics05Prototype' },
    { html: '05-constructor-new.html', data: 'basics-05-constructor-new.js', variable: 'quizData_Basics05ConstructorNew' },
    { html: '05-inheritance.html', data: 'basics-05-inheritance.js', variable: 'quizData_Basics05Inheritance' },
    { html: '06-array-advanced.html', data: 'basics-06-array-advanced.js', variable: 'quizData_Basics06ArrayAdvanced' },
    { html: '06-typed-array.html', data: 'basics-06-typed-array.js', variable: 'quizData_Basics06TypedArray' },
    { html: '07-strings.html', data: 'basics-07-strings.js', variable: 'quizData_Basics07Strings' },
    { html: '07-regex.html', data: 'basics-07-regex.js', variable: 'quizData_Basics07Regex' },
    { html: '08-math-date.html', data: 'basics-08-math-date.js', variable: 'quizData_Basics08MathDate' }
];

const basicsDir = path.join(__dirname, 'basics');
const dataDir = path.join(__dirname, 'data');

console.log('🔍 开始检查文件完整性...\n');

let allPass = true;
const results = [];

fileMapping.forEach(({ html, data, variable }) => {
    const result = {
        html: html,
        htmlExists: false,
        dataExists: false,
        htmlHasDataRef: false,
        htmlHasVarRef: false,
        dataHasVariable: false,
        status: '❌'
    };

    // 检查HTML文件
    const htmlPath = path.join(basicsDir, html);
    if (fs.existsSync(htmlPath)) {
        result.htmlExists = true;
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        result.htmlHasDataRef = htmlContent.includes(data);
        result.htmlHasVarRef = htmlContent.includes(variable);
    }

    // 检查数据文件
    const dataPath = path.join(dataDir, data);
    if (fs.existsSync(dataPath)) {
        result.dataExists = true;
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        result.dataHasVariable = dataContent.includes(`window.${variable}`);
    }

    // 判断状态
    if (result.htmlExists && result.dataExists && 
        result.htmlHasDataRef && result.htmlHasVarRef && 
        result.dataHasVariable) {
        result.status = '✅';
    } else {
        allPass = false;
    }

    results.push(result);
});

// 输出结果
console.log('文件配对检查结果：\n');
results.forEach(result => {
    console.log(`${result.status} ${result.html}`);
    if (result.status === '❌') {
        if (!result.htmlExists) console.log('   ⚠️  HTML文件不存在');
        if (!result.dataExists) console.log('   ⚠️  数据文件不存在');
        if (!result.htmlHasDataRef) console.log('   ⚠️  HTML中未引用数据文件');
        if (!result.htmlHasVarRef) console.log('   ⚠️  HTML中未引用全局变量');
        if (!result.dataHasVariable) console.log('   ⚠️  数据文件中未定义全局变量');
    }
});

console.log('\n=================================');
console.log(`总计: ${results.length} 个文件`);
console.log(`通过: ${results.filter(r => r.status === '✅').length} 个`);
console.log(`失败: ${results.filter(r => r.status === '❌').length} 个`);
console.log('=================================\n');

if (allPass) {
    console.log('🎉 所有文件检查通过！可以开始测试了。\n');
    console.log('💡 建议：');
    console.log('   1. 在浏览器中打开 basics/04-closure.html');
    console.log('   2. 打开浏览器控制台（F12）查看是否有错误');
    console.log('   3. 测试题目选择、提交答案、查看解析功能');
    console.log('   4. 测试导航链接是否正确跳转\n');
} else {
    console.log('❌ 存在问题，请根据上方提示修复。\n');
}

process.exit(allPass ? 0 : 1);
