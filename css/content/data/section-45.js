// 第45章：Sass/Less原理
window.cssContentData_Section45 = {
    section: {
        id: 45,
        title: "Sass/Less原理",
        icon: "⚙️",
        topics: [
            {
                id: "preprocessors-intro",
                title: "CSS预处理器概述",
                type: "concept",
                content: {
                    description: "CSS预处理器是一种专门的编程语言，通过编译生成CSS。它们扩展了CSS的功能，提供变量、嵌套、函数等特性。",
                    keyPoints: [
                        "提供变量、嵌套、混合（mixins）等功能",
                        "支持函数和运算",
                        "模块化和代码复用",
                        "需要编译成CSS才能在浏览器中使用",
                        "主流预处理器：Sass、Less、Stylus",
                        "Sass最流行，有SCSS和Sass两种语法"
                    ],
                    mdn: "https://sass-lang.com/"
                }
            },
            {
                id: "sass-vs-less",
                title: "Sass与Less对比",
                type: "comparison",
                content: {
                    description: "Sass和Less是两种最流行的CSS预处理器，它们有相似之处也有区别。",
                    items: [
                        {
                            name: "Sass/SCSS",
                            pros: [
                                "功能最强大，特性最丰富",
                                "有完整的编程能力",
                                "社区最活跃，生态最好",
                                "Bootstrap 5使用Sass",
                                "支持@use和@forward模块化",
                                "编译速度快（Dart Sass）"
                            ]
                        },
                        {
                            name: "Less",
                            pros: [
                                "语法更接近CSS",
                                "学习曲线平缓",
                                "可以在浏览器中运行",
                                "Bootstrap早期版本使用Less",
                                "Ant Design使用Less",
                                "JavaScript编写，易于集成"
                            ]
                        }
                    ]
                }
            },
            {
                id: "variables",
                title: "变量（Variables）",
                type: "code-example",
                content: {
                    description: "变量允许存储和复用值，是预处理器的基础功能。",
                    examples: [
                        {
                            title: "1. Sass变量",
                            code: '/* Sass变量使用$符号 */\n$primary-color: #667eea;\n$secondary-color: #764ba2;\n$font-size-base: 16px;\n$spacing-unit: 8px;\n\n.button {\n  background: $primary-color;\n  font-size: $font-size-base;\n  padding: $spacing-unit * 2;\n}\n\n/* 编译后 */\n.button {\n  background: #667eea;\n  font-size: 16px;\n  padding: 16px;\n}',
                            result: "Sass使用$定义变量"
                        },
                        {
                            title: "2. Less变量",
                            code: '/* Less变量使用@符号 */\n@primary-color: #667eea;\n@secondary-color: #764ba2;\n@font-size-base: 16px;\n@spacing-unit: 8px;\n\n.button {\n  background: @primary-color;\n  font-size: @font-size-base;\n  padding: @spacing-unit * 2;\n}\n\n/* 编译后的CSS相同 */\n.button {\n  background: #667eea;\n  font-size: 16px;\n  padding: 16px;\n}',
                            result: "Less使用@定义变量"
                        },
                        {
                            title: "3. 变量作用域",
                            code: '/* Sass作用域 */\n$color: red;\n\n.container {\n  $color: blue; /* 局部变量 */\n  color: $color; /* blue */\n}\n\n.other {\n  color: $color; /* red */\n}\n\n/* 全局变量 */\n$global-color: green !global;',
                            result: "变量有作用域概念"
                        }
                    ]
                }
            },
            {
                id: "nesting",
                title: "嵌套（Nesting）",
                type: "code-example",
                content: {
                    description: "嵌套允许在选择器内部嵌套子选择器，反映HTML结构。",
                    examples: [
                        {
                            title: "1. 基本嵌套",
                            code: '/* Sass/Less */\n.nav {\n  background: #333;\n  \n  ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n  }\n  \n  li {\n    display: inline-block;\n  }\n  \n  a {\n    color: white;\n    text-decoration: none;\n    \n    &:hover {\n      color: #667eea;\n    }\n  }\n}\n\n/* 编译后 */\n.nav {\n  background: #333;\n}\n.nav ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.nav li {\n  display: inline-block;\n}\n.nav a {\n  color: white;\n  text-decoration: none;\n}\n.nav a:hover {\n  color: #667eea;\n}',
                            result: "反映HTML层级结构"
                        },
                        {
                            title: "2. &父选择器引用",
                            code: '/* & 代表父选择器 */\n.button {\n  background: #667eea;\n  \n  &:hover {\n    background: #5568d3;\n  }\n  \n  &:active {\n    background: #4451b8;\n  }\n  \n  &--large {\n    padding: 16px 32px;\n  }\n  \n  &--small {\n    padding: 4px 8px;\n  }\n  \n  .icon & {\n    /* .icon .button */\n    margin-left: 8px;\n  }\n}',
                            result: "&实现灵活的选择器组合"
                        },
                        {
                            title: "3. 注意：避免过度嵌套",
                            code: '/* 不推荐：过度嵌套 */\n.header {\n  .nav {\n    .menu {\n      .item {\n        .link {\n          color: blue;\n        }\n      }\n    }\n  }\n}\n/* 生成：.header .nav .menu .item .link */\n\n/* 推荐：控制嵌套深度 */\n.header {\n  // ...\n}\n\n.nav {\n  // ...\n}\n\n.nav-link {\n  color: blue;\n}',
                            result: "嵌套深度不超过3-4层"
                        }
                    ]
                }
            },
            {
                id: "mixins",
                title: "混合（Mixins）",
                type: "code-example",
                content: {
                    description: "Mixins允许定义可重用的样式块，支持参数和默认值。",
                    examples: [
                        {
                            title: "1. Sass Mixins",
                            code: '/* 定义mixin */\n@mixin border-radius($radius: 4px) {\n  border-radius: $radius;\n}\n\n@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n/* 使用mixin */\n.card {\n  @include border-radius(8px);\n}\n\n.button {\n  @include border-radius; /* 使用默认值4px */\n  @include flex-center;\n}',
                            result: "使用@mixin定义，@include调用"
                        },
                        {
                            title: "2. Less Mixins",
                            code: '/* Less中类即mixin */\n.border-radius(@radius: 4px) {\n  border-radius: @radius;\n}\n\n.flex-center() {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n/* 使用 */\n.card {\n  .border-radius(8px);\n}\n\n.button {\n  .border-radius();\n  .flex-center();\n}',
                            result: "Less使用类作为mixin"
                        },
                        {
                            title: "3. 带逻辑的Mixin",
                            code: '/* Sass: 响应式mixin */\n@mixin respond-to($breakpoint) {\n  @if $breakpoint == mobile {\n    @media (max-width: 767px) {\n      @content;\n    }\n  } @else if $breakpoint == tablet {\n    @media (min-width: 768px) and (max-width: 1023px) {\n      @content;\n    }\n  } @else if $breakpoint == desktop {\n    @media (min-width: 1024px) {\n      @content;\n    }\n  }\n}\n\n/* 使用 */\n.container {\n  width: 100%;\n  \n  @include respond-to(tablet) {\n    width: 750px;\n  }\n  \n  @include respond-to(desktop) {\n    width: 1200px;\n  }\n}',
                            result: "Mixin可以包含复杂逻辑"
                        }
                    ]
                }
            },
            {
                id: "extend-inheritance",
                title: "继承（@extend）",
                type: "code-example",
                content: {
                    description: "@extend允许一个选择器继承另一个选择器的所有样式。",
                    examples: [
                        {
                            title: "1. Sass @extend",
                            code: '/* 定义基础样式 */\n.button {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n/* 继承并扩展 */\n.button-primary {\n  @extend .button;\n  background: #667eea;\n  color: white;\n}\n\n.button-secondary {\n  @extend .button;\n  background: #6b7280;\n  color: white;\n}\n\n/* 编译后 */\n.button, .button-primary, .button-secondary {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n.button-primary {\n  background: #667eea;\n  color: white;\n}\n\n.button-secondary {\n  background: #6b7280;\n  color: white;\n}',
                            result: "合并选择器，减少重复"
                        },
                        {
                            title: "2. 占位符选择器 %",
                            code: '/* % 定义占位符，不会被编译 */\n%button-base {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n}\n\n.button-primary {\n  @extend %button-base;\n  background: #667eea;\n}\n\n.button-secondary {\n  @extend %button-base;\n  background: #6b7280;\n}\n\n/* 编译后不包含 %button-base */\n.button-primary, .button-secondary {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n}\n\n.button-primary {\n  background: #667eea;\n}\n\n.button-secondary {\n  background: #6b7280;\n}',
                            result: "占位符更适合被继承"
                        },
                        {
                            title: "3. @extend vs @mixin",
                            code: '/* @extend: 合并选择器 */\n.box { width: 100px; }\n.card { @extend .box; }\n/* 结果: .box, .card { width: 100px; } */\n\n/* @mixin: 复制代码 */\n@mixin box { width: 100px; }\n.card { @include box; }\n/* 结果: .card { width: 100px; } */\n\n/* 选择建议：*/\n// @extend: 相关的样式，减少CSS大小\n// @mixin: 带参数的样式，更灵活',
                            result: "理解两者的区别"
                        }
                    ]
                }
            },
            {
                id: "functions-operations",
                title: "函数与运算",
                type: "code-example",
                content: {
                    description: "预处理器提供内置函数和数学运算能力。",
                    examples: [
                        {
                            title: "1. 数学运算",
                            code: '/* Sass/Less都支持运算 */\n$base-size: 16px;\n\n.element {\n  font-size: $base-size * 1.5;  /* 24px */\n  padding: $base-size / 2;       /* 8px */\n  margin: $base-size + 4px;      /* 20px */\n  width: 100% / 3;               /* 33.333% */\n}',
                            result: "支持四则运算"
                        },
                        {
                            title: "2. 颜色函数",
                            code: '/* Sass颜色函数 */\n$primary: #667eea;\n\n.button {\n  background: $primary;\n  \n  &:hover {\n    background: darken($primary, 10%);\n  }\n  \n  &:active {\n    background: darken($primary, 20%);\n  }\n}\n\n.light-bg {\n  background: lighten($primary, 30%);\n}\n\n.transparent-bg {\n  background: rgba($primary, 0.5);\n}\n\n.complementary {\n  color: complement($primary);\n}',
                            result: "强大的颜色处理"
                        },
                        {
                            title: "3. 自定义函数（Sass）",
                            code: '/* 定义函数 */\n@function calculate-rem($px) {\n  @return $px / 16px * 1rem;\n}\n\n@function strip-unit($value) {\n  @return $value / ($value * 0 + 1);\n}\n\n/* 使用函数 */\n.element {\n  font-size: calculate-rem(24px);  /* 1.5rem */\n  padding: calculate-rem(16px);    /* 1rem */\n}',
                            result: "创建可复用的计算逻辑"
                        }
                    ]
                }
            },
            {
                id: "modules-imports",
                title: "模块化与导入",
                type: "code-example",
                content: {
                    description: "预处理器支持将样式拆分成多个文件，通过导入组织代码。",
                    examples: [
                        {
                            title: "1. @import（旧方式）",
                            code: '/* _variables.scss */\n$primary-color: #667eea;\n$secondary-color: #764ba2;\n\n/* _mixins.scss */\n@mixin border-radius($radius) {\n  border-radius: $radius;\n}\n\n/* main.scss */\n@import "variables";\n@import "mixins";\n\n.button {\n  background: $primary-color;\n  @include border-radius(4px);\n}',
                            result: "传统导入方式"
                        },
                        {
                            title: "2. @use和@forward（Sass新方式）",
                            code: '/* _variables.scss */\n$primary-color: #667eea;\n\n/* _mixins.scss */\n@mixin border-radius($radius) {\n  border-radius: $radius;\n}\n\n/* main.scss */\n@use "variables";\n@use "mixins";\n\n.button {\n  background: variables.$primary-color;\n  @include mixins.border-radius(4px);\n}\n\n/* 使用命名空间，避免冲突 */\n@use "variables" as vars;\n.element {\n  color: vars.$primary-color;\n}',
                            result: "更好的模块化和命名空间"
                        },
                        {
                            title: "3. 文件组织结构",
                            code: '/* 推荐的文件结构 */\nsass/\n├── abstracts/\n│   ├── _variables.scss\n│   ├── _mixins.scss\n│   └── _functions.scss\n├── base/\n│   ├── _reset.scss\n│   └── _typography.scss\n├── components/\n│   ├── _buttons.scss\n│   ├── _cards.scss\n│   └── _forms.scss\n├── layout/\n│   ├── _header.scss\n│   ├── _footer.scss\n│   └── _grid.scss\n├── pages/\n│   ├── _home.scss\n│   └── _about.scss\n└── main.scss\n\n/* main.scss */\n@use "abstracts/variables";\n@use "abstracts/mixins";\n@use "base/reset";\n@use "base/typography";\n@use "components/buttons";\n// ...',
                            result: "清晰的项目结构"
                        }
                    ]
                }
            },
            {
                id: "compilation",
                title: "编译原理",
                type: "principle",
                content: {
                    description: "预处理器的编译过程将预处理器语法转换为标准CSS。",
                    mechanism: "编译过程：1) 词法分析：将源代码分解为tokens；2) 语法分析：构建抽象语法树（AST）；3) 语义分析：处理变量、嵌套、mixin等；4) 代码生成：生成标准CSS；5) 优化：合并选择器、压缩等。Sass有多种实现：Ruby Sass（已废弃）、LibSass（C/C++）、Dart Sass（官方推荐）。",
                    keyPoints: [
                        "预处理器代码需要编译才能运行",
                        "编译可以在开发时或构建时进行",
                        "Sass推荐使用Dart Sass",
                        "可以生成Source Map用于调试",
                        "支持压缩和优化",
                        "现代构建工具集成编译功能",
                        "Watch模式实时编译",
                        "编译速度是选择预处理器的考虑因素"
                    ]
                }
            },
            {
                id: "best-practices",
                title: "预处理器最佳实践",
                type: "principle",
                content: {
                    description: "使用预处理器的最佳实践和注意事项。",
                    mechanism: "预处理器虽然强大，但需要合理使用。过度嵌套会产生臃肿的CSS；过度使用@extend可能导致选择器爆炸；复杂的逻辑会降低可维护性。关键是利用预处理器的优势，同时避免过度工程化。",
                    keyPoints: [
                        "控制嵌套深度，不超过3-4层",
                        "合理使用变量，建立设计令牌系统",
                        "Mixin适合带参数的样式",
                        "@extend适合相关样式的继承",
                        "使用占位符%避免生成无用CSS",
                        "模块化组织代码，便于维护",
                        "避免复杂的逻辑，保持简单",
                        "生成Source Map用于调试",
                        "压缩输出的CSS",
                        "考虑迁移到原生CSS变量"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "CSS方法论", url: "44-css-methodology.html" },
        next: { title: "PostCSS与工程化", url: "46-postcss.html" }
    }
};
