// 第15章：IFC - 面试题（10题）
window.cssQuizData_Chapter15 = {
    config: {
        title: "IFC行内格式化上下文",
        icon: "📝",
        description: "IFC特性、line-height、vertical-align",
        primaryColor: "#22c55e",
        bgGradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["IFC"], question: "IFC中元素如何排列？", options: ["水平排列成行", "垂直排列成列", "网格排列", "自由排列"], correctAnswer: "A", explanation: {title: "IFC", sections: [{title: "排列", content: "IFC（Inline Formatting Context）中元素水平排列，直到行满后换行。"}]}},
        {type: "true-false", difficulty: "easy", tags: ["line-height"], question: "line-height: 1.5表示行高是字体大小的1.5倍。", correctAnswer: "A", explanation: {title: "正确", sections: [{title: "无单位", content: "无单位的line-height是相对font-size的倍数，1.5表示1.5倍。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["vertical-align"], question: "vertical-align的默认值是？", options: ["baseline", "top", "middle", "bottom"], correctAnswer: "A", explanation: {title: "默认值", sections: [{title: "baseline", content: "vertical-align默认值是baseline（基线对齐）。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["line-height继承"], question: "line-height继承的最佳实践？", options: ["使用无单位数值", "使用百分比", "使用固定px", "使用em"], correctAnswer: "A", explanation: {title: "继承", sections: [{title: "最佳", content: "无单位数值会被继承为倍数，子元素根据自己的font-size计算。固定值会直接继承，可能导致问题。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["vertical-align"], question: "vertical-align可以用于？", options: ["行内元素", "行内块元素", "表格单元格", "块级元素"], correctAnswer: ["A", "B", "C"], explanation: {title: "适用范围", sections: [{title: "说明", content: "vertical-align只对行内元素、inline-block和table-cell有效，对块级元素无效。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["图片间隙"], question: "图片底部为什么有间隙？", options: ["基线对齐，预留descender空间", "默认margin", "默认padding", "浏览器bug"], correctAnswer: "A", explanation: {title: "图片间隙", sections: [{title: "原因", content: "图片是行内元素，基线对齐时预留字母descender（如g、p）的空间。解决：vertical-align: top或display: block。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["文本居中"], question: "如何垂直居中单行文本？", code: '.box {\n  height: 50px;\n  line-height: ______;\n}', options: ["50px", "1", "normal", "auto"], correctAnswer: "A", explanation: {title: "单行居中", sections: [{title: "方法", content: "单行文本垂直居中：让line-height等于容器height。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["line-height百分比"], question: "line-height: 150%和line-height: 1.5效果完全相同。", correctAnswer: "B", explanation: {title: "不同", sections: [{title: "差异", content: "150%会先计算成固定值再继承；1.5继承倍数，子元素根据自己的font-size计算，更灵活。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["vertical-align值"], question: "vertical-align的有效值包括？", options: ["baseline", "5px（长度值）", "50%（百分比）", "sub"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "值类型", sections: [{title: "全部有效", content: "vertical-align支持关键字（baseline/top/middle等）、长度值、百分比（相对line-height）。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["line-box"], question: "行盒（line box）的高度由什么决定？", options: ["内部最高元素的高度", "line-height", "font-size", "内容高度"], correctAnswer: "A", explanation: {title: "行盒高度", sections: [{title: "规则", content: "行盒高度由内部最高的行内盒（考虑line-height和vertical-align）决定，不是简单的line-height。"}]}}
    ],
    navigation: {
        prev: { title: "第14章：BFC", url: "14-bfc.html" },
        next: { title: "第16章：FFC", url: "16-ffc.html" }
    }
};
