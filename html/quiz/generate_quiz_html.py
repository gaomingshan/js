#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量生成HTML面试题文件"""

chapters = [
    (6, "forms-basic", "表单基础"),
    (7, "forms-advanced", "表单进阶"),
    (8, "media", "多媒体"),
    (9, "iframe", "iframe嵌入"),
    (10, "html5-features", "HTML5新特性"),
    (11, "forms-advanced2", "表单高级"),
    (12, "semantic", "语义化标签"),
    (13, "html5-api1", "HTML5 API（上）"),
    (14, "html5-api2", "HTML5 API（下）"),
    (15, "accessibility", "可访问性"),
    (16, "seo", "SEO优化"),
    (17, "performance", "性能优化"),
    (18, "best-practices", "最佳实践"),
    (19, "metadata", "元数据管理"),
    (20, "rendering", "浏览器渲染原理"),
    (21, "events", "事件系统"),
    (22, "canvas", "Canvas基础"),
    (23, "svg", "SVG基础"),
    (24, "storage", "Web存储"),
    (33, "device", "设备适配"),
    (34, "print", "打印优化"),
    (35, "email", "邮件HTML"),
    (36, "future", "未来趋势"),
]

template = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - HTML面试题</title>
    <link rel="stylesheet" href="../css/quiz-common.css">
</head>
<body>
    <a href="../index.html" class="back-link">⬅️ 返回导航</a>
    <div class="container">
        <div class="header"><h1 id="chapter-title">加载中...</h1><p id="chapter-desc">加载中...</p></div>
        <div id="quiz-container"></div>
        <div id="nav-links"></div>
    </div>
    <script src="../data/quiz-{num:02d}.js"></script>
    <script src="../js/quiz-renderer.js"></script>
    <script>document.addEventListener('DOMContentLoaded', () => {{ if (window.htmlQuizData_{num:02d}) {{ QuizRenderer.init(window.htmlQuizData_{num:02d}); }} else {{ console.error('未找到题目数据'); }} }});</script>
</body>
</html>
'''

for num, filename, title in chapters:
    html_content = template.format(num=num, title=title)
    output_file = f"{num:02d}-{filename}-quiz.html"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ 已创建: {output_file}")

print(f"\n✅ 共创建 {len(chapters)} 个HTML文件！")
