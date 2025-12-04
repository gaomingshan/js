@echo off
setlocal enabledelayedexpansion

:: 章节列表（格式：章节号,文件名,标题）
set chapters[0]=05,lists-tables,列表与表格
set chapters[1]=06,forms-basic,表单基础
set chapters[2]=07,forms-advanced,表单进阶
set chapters[3]=08,media,多媒体
set chapters[4]=09,iframe,iframe嵌入
set chapters[5]=10,html5-features,HTML5新特性
set chapters[6]=11,forms-advanced2,表单高级
set chapters[7]=12,semantic,语义化标签
set chapters[8]=13,html5-api1,HTML5 API（上）
set chapters[9]=14,html5-api2,HTML5 API（下）
set chapters[10]=15,accessibility,可访问性
set chapters[11]=16,seo,SEO优化
set chapters[12]=17,performance,性能优化
set chapters[13]=18,best-practices,最佳实践
set chapters[14]=19,metadata,元数据管理
set chapters[15]=20,rendering,浏览器渲染原理
set chapters[16]=21,events,事件系统
set chapters[17]=22,canvas,Canvas基础
set chapters[18]=23,svg,SVG基础
set chapters[19]=24,storage,Web存储
set chapters[20]=25,drag-drop,拖放API
set chapters[21]=26,geolocation,地理定位
set chapters[22]=27,media-control,多媒体控制
set chapters[23]=28,offline,离线应用
set chapters[24]=29,workers,Web Workers
set chapters[25]=30,websocket,WebSocket
set chapters[26]=31,cors,跨域通信
set chapters[27]=32,responsive,响应式设计
set chapters[28]=33,device,设备适配
set chapters[29]=34,print,打印优化
set chapters[30]=35,email,邮件HTML
set chapters[31]=36,future,未来趋势

for /L %%i in (0,1,31) do (
    for /f "tokens=1-3 delims=," %%a in ("!chapters[%%i]!") do (
        echo Creating %%b-quiz.html...
        (
            echo ^<!DOCTYPE html^>
            echo ^<html lang="zh-CN"^>
            echo ^<head^>
            echo     ^<meta charset="UTF-8"^>
            echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
            echo     ^<title^>%%c - HTML面试题^</title^>
            echo     ^<link rel="stylesheet" href="../css/quiz-common.css"^>
            echo ^</head^>
            echo ^<body^>
            echo     ^<a href="../index.html" class="back-link"^>⬅️ 返回导航^</a^>
            echo     ^<div class="container"^>
            echo         ^<div class="header"^>^<h1 id="chapter-title"^>加载中...^</h1^>^<p id="chapter-desc"^>加载中...^</p^>^</div^>
            echo         ^<div id="quiz-container"^>^</div^>
            echo         ^<div id="nav-links"^>^</div^>
            echo     ^</div^>
            echo     ^<script src="../data/quiz-%%a.js"^>^</script^>
            echo     ^<script src="../js/quiz-renderer.js"^>^</script^>
            echo     ^<script^>document.addEventListener('DOMContentLoaded', (^) =^> { if (window.htmlQuizData_%%a^) { QuizRenderer.init(window.htmlQuizData_%%a^); } else { console.error('未找到题目数据'^); } }^);^</script^>
            echo ^</body^>
            echo ^</html^>
        ) > %%b-quiz.html
    )
)

echo 所有HTML文件已创建完成！
pause
