// 第45章：Sass/Less原理 - 面试题
window.cssQuizData_Chapter45 = {
    config: {
        title: "Sass/Less原理",
        icon: "⚙️",
        description: "变量、嵌套、混合、编译机制",
        primaryColor: "#667eea",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["预处理器基础"], question: "Sass和Less是什么？", options: ["CSS框架", "CSS预处理器", "CSS后处理器", "CSS库"], correctAnswer: "B", explanation: {title: "CSS预处理器", sections: [{title: "正确答案", content: "Sass和Less是CSS预处理器，提供变量、嵌套、混合等编程特性，编译成标准CSS。预处理在构建时进行。"}]}, source: "CSS预处理器"},
        {type: "single-choice", difficulty: "easy", tags: ["Sass变量"], question: "Sass中变量的语法是？", options: ["$variable", "@variable", "--variable", "var(variable)"], correctAnswer: "A", explanation: {title: "Sass变量", sections: [{title: "正确答案", content: "Sass使用$variable定义变量。Less使用@variable。CSS原生变量使用--variable。三者语法不同但功能类似。"}]}, source: "Sass语法"},
        {type: "single-choice", difficulty: "medium", tags: ["嵌套规则"], question: "Sass嵌套中，&符号表示什么？", options: ["子元素", "父选择器", "兄弟元素", "通配符"], correctAnswer: "B", explanation: {title: "父选择器引用", sections: [{title: "正确答案", content: "&表示父选择器，用于嵌套时引用父级。如.button { &:hover {} }编译为.button:hover {}。常用于伪类、修饰符等。"}]}, source: "Sass嵌套"},
        {type: "single-choice", difficulty: "medium", tags: ["mixin"], question: "@mixin和@include的作用是？", options: ["定义和使用变量", "定义和使用混合", "导入文件", "定义函数"], correctAnswer: "B", explanation: {title: "Sass混合", sections: [{title: "正确答案", content: "@mixin定义可复用的样式块（混合），@include使用它。类似函数，支持参数、默认值。如@mixin button($color) {} 和 @include button(blue)。"}]}, source: "Sass混合"},
        {type: "single-choice", difficulty: "medium", tags: ["编译机制"], question: "Sass编译发生在什么时候？", options: ["运行时", "构建时", "浏览器加载时", "服务端"], correctAnswer: "B", explanation: {title: "编译时机", sections: [{title: "正确答案", content: "Sass在构建时编译成CSS，浏览器只加载编译后的CSS。这与CSS变量（运行时计算）不同。编译可以通过CLI、构建工具等。"}]}, source: "Sass编译"},
        {type: "single-choice", difficulty: "medium", tags: ["Sass vs Less"], question: "Sass和Less的主要区别？", options: ["没区别", "语法和功能略有不同", "性能差异大", "一个是框架一个是库"], correctAnswer: "B", explanation: {title: "Sass vs Less", sections: [{title: "正确答案", content: "Sass和Less功能类似但语法不同（如变量$vs@）。Sass功能更强大（如@extend、控制指令），Less更易上手。Sass有两种语法：SCSS和缩进语法。"}]}, source: "CSS预处理器对比"},
        {type: "single-choice", difficulty: "hard", tags: ["@extend"], question: "@extend的作用和潜在问题？", options: ["复制样式，无问题", "继承样式，可能产生复杂选择器", "混合样式，性能差", "导入样式，依赖问题"], correctAnswer: "B", explanation: {title: "Sass继承", sections: [{title: "正确答案", content: "@extend继承另一个选择器的样式，但可能产生意外的复杂选择器组合和级联问题。现代实践推荐用@mixin代替@extend。"}]}, source: "Sass最佳实践"},
        {type: "single-choice", difficulty: "hard", tags: ["颜色函数"], question: "Sass的lighten()、darken()函数做什么？", options: ["调整亮度", "调整透明度", "调整饱和度", "调整色相"], correctAnswer: "A", explanation: {title: "颜色函数", sections: [{title: "正确答案", content: "lighten()和darken()调整颜色亮度，如lighten(#000, 20%)。Sass提供丰富的颜色函数：rgba()、mix()、saturate()等，方便颜色计算。"}]}, source: "Sass颜色函数"},
        {type: "single-choice", difficulty: "hard", tags: ["source map"], question: "为什么Sass需要source map？", options: ["提高性能", "调试时定位到源文件", "减小体积", "兼容性"], correctAnswer: "B", explanation: {title: "Source Map", sections: [{title: "正确答案", content: "Sass编译后，浏览器DevTools显示的是编译后的CSS。Source map建立编译前后的映射，让开发者在DevTools中定位到原始.scss文件和行号。"}]}, source: "CSS Source Map"},
        {type: "multiple-choice", difficulty: "hard", tags: ["预处理器综合"], question: "关于CSS预处理器，以下说法正确的是？（多选）", options: ["提供编程特性如变量、函数", "需要编译步骤", "可以减少CSS重复代码", "会增加运行时性能开销"], correctAnswer: ["A", "B", "C"], explanation: {title: "预处理器特性", sections: [{title: "正确答案", content: "A、B、C正确。预处理器提供编程特性，需要编译，可以减少重复。D错误：编译后是标准CSS，无运行时开销（开销在构建时）。"}]}, source: "CSS预处理器"}
    ],
    navigation: {
        prev: { title: "CSS方法论", url: "44-css-methodology.html" },
        next: { title: "PostCSS与工程化", url: "46-postcss.html" }
    }
};
