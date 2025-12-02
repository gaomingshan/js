#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量创建深入原理篇HTML文件
"""

import os

# 定义所有章节信息 [文件名, 标题, 变量名]
chapters = [
    # 第14章
    ['14-01-execution-context', '执行上下文', 'Deep1401ExecutionContext'],
    ['14-02-scope-chain', '作用域链', 'Deep1402ScopeChain'],
    ['14-03-closure-memory', '闭包内存模型', 'Deep1403ClosureMemory'],
    # 第15章
    ['15-01-prototype-chain', '原型链', 'Deep1501PrototypeChain'],
    ['15-02-constructor-new', '构造函数与new', 'Deep1502ConstructorNew'],
    ['15-03-inheritance', '继承模式', 'Deep1503Inheritance'],
    # 第16章
    ['16-01-type-coercion', '类型强制转换', 'Deep1601TypeCoercion'],
    ['16-02-equality', '相等性比较', 'Deep1602Equality'],
    ['16-03-boxing', '装箱拆箱', 'Deep1603Boxing'],
    # 第17章
    ['17-01-iterator-protocol', '迭代器协议', 'Deep1701IteratorProtocol'],
    ['17-02-generator-basic', '生成器基础', 'Deep1702GeneratorBasic'],
    ['17-03-generator-advanced', '生成器高级', 'Deep1703GeneratorAdvanced'],
    ['17-04-async-iterator', '异步迭代器', 'Deep1704AsyncIterator'],
    # 第18章
    ['18-01-promise-spec', 'Promise规范', 'Deep1801PromiseSpec'],
    ['18-02-async-await', 'async/await', 'Deep1802AsyncAwait'],
    ['18-03-promise-advanced', 'Promise高级', 'Deep1803PromiseAdvanced'],
    # 第19章
    ['19-01-event-loop', '事件循环', 'Deep1901EventLoop'],
    ['19-02-macro-micro-tasks', '宏任务微任务', 'Deep1902MacroMicroTasks'],
    ['19-03-concurrency-model', '并发模型', 'Deep1903ConcurrencyModel'],
    # 第20章
    ['20-01-proxy-reflect', 'Proxy与Reflect', 'Deep2001ProxyReflect'],
    ['20-02-symbol', 'Symbol详解', 'Deep2002Symbol'],
    ['20-03-decorator', '装饰器模式', 'Deep2003Decorator'],
    # 第21章
    ['21-01-garbage-collection', '垃圾回收机制', 'Deep2101GarbageCollection'],
    ['21-02-memory-leak', '内存泄漏检测', 'Deep2102MemoryLeak'],
    ['21-03-performance-optimization', '性能优化策略', 'Deep2103PerformanceOptimization'],
    # 第22章
    ['22-01-v8-engine', 'V8引擎原理', 'Deep2201V8Engine'],
    ['22-02-jit-optimization', 'JIT编译优化', 'Deep2202JITOptimization'],
    ['22-03-v8-memory', 'V8内存管理', 'Deep2203V8Memory'],
    # 第23章
    ['23-01-es6-features', 'ES6+新特性', 'Deep2301ES6Features'],
    ['23-02-es2020-plus', 'ES2020+特性', 'Deep2302ES2020Plus'],
    # 第24章
    ['24-01-commonjs', 'CommonJS模块', 'Deep2401CommonJS'],
    ['24-02-es-modules', 'ES Modules', 'Deep2402ESModules'],
    ['24-03-module-comparison', '模块化对比', 'Deep2403ModuleComparison'],
    # 第25章
    ['25-01-sharedarraybuffer', 'SharedArrayBuffer基础', 'Deep2501SharedArrayBuffer'],
    ['25-02-atomics', 'Atomics操作', 'Deep2502Atomics'],
    ['25-03-concurrency-patterns', '并发模式', 'Deep2503ConcurrencyPatterns'],
    # 第26章
    ['26-01-wasm-basics', 'WebAssembly基础', 'Deep2601WasmBasics'],
    ['26-02-wasm-js', 'Wasm与JavaScript', 'Deep2602WasmJS'],
    ['26-03-wasm-toolchain', 'Wasm工具链', 'Deep2603WasmToolchain'],
    # 第27章
    ['27-01-record-tuple', 'Record和Tuple', 'Deep2701RecordTuple'],
    ['27-02-pattern-matching', '模式匹配', 'Deep2702PatternMatching'],
    ['27-03-pipeline-operator', '管道操作符', 'Deep2703PipelineOperator'],
    ['27-04-decorators-proposal', '装饰器提案', 'Deep2704DecoratorsProposal'],
    ['27-05-temporal', 'Temporal API', 'Deep2705Temporal'],
]

# HTML模板
html_template = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - JavaScript 面试题</title>
</head>
<body>
    <script src="../data/deep-{filename}.js"></script>
    <script src="../js/quiz-renderer.js"></script>
    <script>
        QuizRenderer.initWithData(window.quizData_{varname});
    </script>
</body>
</html>
'''

# 获取脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))
deep_dir = os.path.join(script_dir, 'deep')

# 确保deep目录存在
os.makedirs(deep_dir, exist_ok=True)

# 生成所有HTML文件
count = 0
for filename, title, varname in chapters:
    html_content = html_template.format(
        title=title,
        filename=filename,
        varname=varname
    )
    
    filepath = os.path.join(deep_dir, f'{filename}.html')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    count += 1
    print(f'✓ Created: {filename}.html')

print(f'\n🎉 Successfully created {count} HTML files!')
print(f'📁 Location: {deep_dir}')
