// 第41章：动态主题实现
window.cssContentData_Section41 = {
    section: {
        id: 41,
        title: "动态主题实现",
        icon: "🎨",
        topics: [
            {
                id: "theme-system-intro",
                title: "主题系统概述",
                type: "concept",
                content: {
                    description: "利用CSS自定义属性和JavaScript可以实现强大的动态主题系统，支持明暗主题切换、多主题支持等功能。",
                    keyPoints: [
                        "CSS变量是实现主题系统的基础",
                        "支持明暗主题、多色主题等",
                        "可以记住用户偏好",
                        "支持系统主题跟随",
                        "无需重新加载页面即可切换",
                        "性能优秀，无需重新计算样式"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties"
                }
            },
            {
                id: "basic-theme-implementation",
                title: "基础主题实现",
                type: "code-example",
                content: {
                    description: "实现一个基础的明暗主题切换系统。",
                    examples: [
                        {
                            title: "1. 定义主题变量",
                            code: '/* 默认（浅色）主题 */\n:root {\n  --bg-primary: #ffffff;\n  --bg-secondary: #f3f4f6;\n  --text-primary: #111827;\n  --text-secondary: #6b7280;\n  --border-color: #e5e7eb;\n  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n}\n\n/* 深色主题 */\n[data-theme="dark"] {\n  --bg-primary: #1f2937;\n  --bg-secondary: #111827;\n  --text-primary: #f9fafb;\n  --text-secondary: #9ca3af;\n  --border-color: #374151;\n  --shadow: 0 1px 3px rgba(0, 0, 0, 0.5);\n}\n\n/* 使用变量 */\nbody {\n  background: var(--bg-primary);\n  color: var(--text-primary);\n  transition: background 0.3s, color 0.3s;\n}',
                            result: "通过data属性切换主题"
                        },
                        {
                            title: "2. JavaScript主题切换",
                            code: '// 主题切换函数\nfunction toggleTheme() {\n  const html = document.documentElement;\n  const currentTheme = html.getAttribute(\'data-theme\');\n  const newTheme = currentTheme === \'dark\' ? \'light\' : \'dark\';\n  \n  html.setAttribute(\'data-theme\', newTheme);\n  localStorage.setItem(\'theme\', newTheme);\n}\n\n// 初始化主题\nfunction initTheme() {\n  const savedTheme = localStorage.getItem(\'theme\') || \'light\';\n  document.documentElement.setAttribute(\'data-theme\', savedTheme);\n}\n\n// 页面加载时初始化\ninitTheme();\n\n// 绑定切换按钮\ndocument.querySelector(\'#theme-toggle\')\n  .addEventListener(\'click\', toggleTheme);',
                            result: "完整的主题切换逻辑"
                        },
                        {
                            title: "3. HTML结构",
                            code: '<!DOCTYPE html>\n<html lang="zh-CN" data-theme="light">\n<head>\n  <meta charset="UTF-8">\n  <title>主题切换示例</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <button id="theme-toggle">\n    <span class="light-icon">🌙</span>\n    <span class="dark-icon">☀️</span>\n  </button>\n  \n  <div class="container">\n    <h1>主题切换示例</h1>\n    <p>点击按钮切换明暗主题</p>\n  </div>\n  \n  <script src="theme.js"></script>\n</body>\n</html>',
                            result: "使用data-theme属性"
                        }
                    ]
                }
            },
            {
                id: "system-theme-preference",
                title: "系统主题偏好",
                type: "code-example",
                content: {
                    description: "跟随用户的系统主题设置。",
                    examples: [
                        {
                            title: "1. prefers-color-scheme媒体查询",
                            code: '/* 自动跟随系统主题 */\n:root {\n  /* 默认浅色主题变量 */\n  --bg-primary: #ffffff;\n  --text-primary: #111827;\n}\n\n/* 当系统偏好深色时 */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg-primary: #1f2937;\n    --text-primary: #f9fafb;\n  }\n}\n\nbody {\n  background: var(--bg-primary);\n  color: var(--text-primary);\n}',
                            result: "CSS自动跟随系统主题"
                        },
                        {
                            title: "2. JavaScript检测系统主题",
                            code: '// 检测系统是否使用深色模式\nfunction getSystemTheme() {\n  if (window.matchMedia) {\n    return window.matchMedia(\'(prefers-color-scheme: dark)\')\n      .matches ? \'dark\' : \'light\';\n  }\n  return \'light\';\n}\n\n// 监听系统主题变化\nfunction watchSystemTheme(callback) {\n  if (!window.matchMedia) return;\n  \n  const mediaQuery = window.matchMedia(\n    \'(prefers-color-scheme: dark)\'\n  );\n  \n  mediaQuery.addEventListener(\'change\', (e) => {\n    const theme = e.matches ? \'dark\' : \'light\';\n    callback(theme);\n  });\n}\n\n// 使用\nwatchSystemTheme((theme) => {\n  console.log(`系统主题切换为：${theme}`);\n  applyTheme(theme);\n});',
                            result: "实时跟随系统主题变化"
                        },
                        {
                            title: "3. 优先级处理",
                            code: '// 主题优先级：用户选择 > 系统偏好 > 默认\nfunction initTheme() {\n  // 1. 检查用户是否有保存的选择\n  const savedTheme = localStorage.getItem(\'theme\');\n  if (savedTheme) {\n    applyTheme(savedTheme);\n    return;\n  }\n  \n  // 2. 使用系统偏好\n  const systemTheme = getSystemTheme();\n  applyTheme(systemTheme);\n  \n  // 3. 监听系统变化（仅当用户未手动选择时）\n  watchSystemTheme((theme) => {\n    if (!localStorage.getItem(\'theme\')) {\n      applyTheme(theme);\n    }\n  });\n}\n\nfunction applyTheme(theme) {\n  document.documentElement\n    .setAttribute(\'data-theme\', theme);\n}',
                            result: "智能主题选择"
                        }
                    ]
                }
            },
            {
                id: "multiple-themes",
                title: "多主题支持",
                type: "code-example",
                content: {
                    description: "实现支持多种颜色主题的系统。",
                    examples: [
                        {
                            title: "1. 定义多个主题",
                            code: '/* 默认主题 */\n:root {\n  --primary: #667eea;\n  --secondary: #764ba2;\n}\n\n/* 蓝色主题 */\n[data-theme="blue"] {\n  --primary: #3b82f6;\n  --secondary: #2563eb;\n}\n\n/* 绿色主题 */\n[data-theme="green"] {\n  --primary: #10b981;\n  --secondary: #059669;\n}\n\n/* 红色主题 */\n[data-theme="red"] {\n  --primary: #ef4444;\n  --secondary: #dc2626;\n}\n\n/* 紫色主题 */\n[data-theme="purple"] {\n  --primary: #8b5cf6;\n  --secondary: #7c3aed;\n}',
                            result: "支持多种配色方案"
                        },
                        {
                            title: "2. 主题选择器",
                            code: '// 主题配置\nconst themes = [\n  { name: \'blue\', label: \'蓝色\', color: \'#3b82f6\' },\n  { name: \'green\', label: \'绿色\', color: \'#10b981\' },\n  { name: \'red\', label: \'红色\', color: \'#ef4444\' },\n  { name: \'purple\', label: \'紫色\', color: \'#8b5cf6\' }\n];\n\n// 生成主题选择器\nfunction renderThemeSelector() {\n  const container = document.querySelector(\'#theme-selector\');\n  \n  themes.forEach(theme => {\n    const button = document.createElement(\'button\');\n    button.className = \'theme-button\';\n    button.style.backgroundColor = theme.color;\n    button.title = theme.label;\n    button.onclick = () => setTheme(theme.name);\n    container.appendChild(button);\n  });\n}\n\nfunction setTheme(themeName) {\n  document.documentElement\n    .setAttribute(\'data-theme\', themeName);\n  localStorage.setItem(\'theme\', themeName);\n}',
                            result: "可视化主题选择"
                        }
                    ]
                }
            },
            {
                id: "advanced-theme-system",
                title: "高级主题系统",
                type: "code-example",
                content: {
                    description: "实现功能完整的主题系统，支持自定义和导入导出。",
                    examples: [
                        {
                            title: "1. 主题对象结构",
                            code: '// 主题配置对象\nconst themeConfig = {\n  light: {\n    name: \'浅色主题\',\n    colors: {\n      \'--bg-primary\': \'#ffffff\',\n      \'--bg-secondary\': \'#f3f4f6\',\n      \'--text-primary\': \'#111827\',\n      \'--text-secondary\': \'#6b7280\',\n      \'--accent\': \'#667eea\',\n      \'--border\': \'#e5e7eb\',\n      \'--shadow\': \'rgba(0, 0, 0, 0.1)\'\n    }\n  },\n  dark: {\n    name: \'深色主题\',\n    colors: {\n      \'--bg-primary\': \'#1f2937\',\n      \'--bg-secondary\': \'#111827\',\n      \'--text-primary\': \'#f9fafb\',\n      \'--text-secondary\': \'#9ca3af\',\n      \'--accent\': \'#818cf8\',\n      \'--border\': \'#374151\',\n      \'--shadow\': \'rgba(0, 0, 0, 0.5)\'\n    }\n  }\n};',
                            result: "结构化的主题配置"
                        },
                        {
                            title: "2. 主题管理类",
                            code: 'class ThemeManager {\n  constructor() {\n    this.currentTheme = \'light\';\n    this.themes = themeConfig;\n    this.init();\n  }\n  \n  init() {\n    const saved = localStorage.getItem(\'theme\') || \'light\';\n    this.applyTheme(saved);\n    this.watchSystem();\n  }\n  \n  applyTheme(themeName) {\n    if (!this.themes[themeName]) return;\n    \n    const theme = this.themes[themeName];\n    const root = document.documentElement;\n    \n    Object.entries(theme.colors).forEach(([key, value]) => {\n      root.style.setProperty(key, value);\n    });\n    \n    this.currentTheme = themeName;\n    root.setAttribute(\'data-theme\', themeName);\n    localStorage.setItem(\'theme\', themeName);\n    \n    this.emit(\'theme-change\', themeName);\n  }\n  \n  toggleTheme() {\n    const themes = Object.keys(this.themes);\n    const current = themes.indexOf(this.currentTheme);\n    const next = (current + 1) % themes.length;\n    this.applyTheme(themes[next]);\n  }\n  \n  watchSystem() {\n    if (!window.matchMedia) return;\n    \n    const mq = window.matchMedia(\'(prefers-color-scheme: dark)\');\n    mq.addEventListener(\'change\', (e) => {\n      if (!localStorage.getItem(\'theme\')) {\n        this.applyTheme(e.matches ? \'dark\' : \'light\');\n      }\n    });\n  }\n  \n  // 事件系统\n  emit(event, data) {\n    window.dispatchEvent(new CustomEvent(event, { detail: data }));\n  }\n}\n\n// 使用\nconst themeManager = new ThemeManager();\n\n// 监听主题变化\nwindow.addEventListener(\'theme-change\', (e) => {\n  console.log(\'主题已切换为：\', e.detail);\n});',
                            result: "完整的主题管理系统"
                        },
                        {
                            title: "3. 主题导入导出",
                            code: '// 导出当前主题\nfunction exportTheme() {\n  const root = getComputedStyle(document.documentElement);\n  const theme = {};\n  \n  // 获取所有自定义属性\n  const props = Array.from(document.styleSheets)\n    .flatMap(sheet => {\n      try {\n        return Array.from(sheet.cssRules);\n      } catch(e) { return []; }\n    })\n    .filter(rule => rule.style)\n    .flatMap(rule => Array.from(rule.style))\n    .filter(prop => prop.startsWith(\'--\'));\n  \n  props.forEach(prop => {\n    theme[prop] = root.getPropertyValue(prop).trim();\n  });\n  \n  return JSON.stringify(theme, null, 2);\n}\n\n// 导入主题\nfunction importTheme(themeJSON) {\n  const theme = JSON.parse(themeJSON);\n  const root = document.documentElement;\n  \n  Object.entries(theme).forEach(([key, value]) => {\n    root.style.setProperty(key, value);\n  });\n}\n\n// 下载主题文件\nfunction downloadTheme() {\n  const themeData = exportTheme();\n  const blob = new Blob([themeData], { type: \'application/json\' });\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement(\'a\');\n  a.href = url;\n  a.download = \'theme.json\';\n  a.click();\n  URL.revokeObjectURL(url);\n}',
                            result: "主题的导入和导出功能"
                        }
                    ]
                }
            },
            {
                id: "theme-transition",
                title: "主题切换动画",
                type: "code-example",
                content: {
                    description: "为主题切换添加平滑的过渡动画。",
                    examples: [
                        {
                            title: "1. CSS过渡",
                            code: '/* 为所有颜色属性添加过渡 */\n* {\n  transition: \n    background-color 0.3s ease,\n    color 0.3s ease,\n    border-color 0.3s ease;\n}\n\n/* 或者更具体的 */\nbody {\n  background: var(--bg-primary);\n  color: var(--text-primary);\n  transition: background 0.3s, color 0.3s;\n}\n\n.card {\n  background: var(--bg-secondary);\n  border: 1px solid var(--border-color);\n  transition: all 0.3s;\n}',
                            result: "平滑的颜色过渡"
                        },
                        {
                            title: "2. View Transitions API",
                            code: '// 使用新的View Transitions API（现代浏览器）\nfunction setThemeWithTransition(theme) {\n  if (!document.startViewTransition) {\n    // 不支持时直接切换\n    applyTheme(theme);\n    return;\n  }\n  \n  document.startViewTransition(() => {\n    applyTheme(theme);\n  });\n}\n\n// CSS配置过渡效果\n::view-transition-old(root),\n::view-transition-new(root) {\n  animation-duration: 0.3s;\n}\n\n::view-transition-old(root) {\n  animation-name: fade-out;\n}\n\n::view-transition-new(root) {\n  animation-name: fade-in;\n}\n\n@keyframes fade-out {\n  to { opacity: 0; }\n}\n\n@keyframes fade-in {\n  from { opacity: 0; }\n}',
                            result: "使用新API创建流畅过渡"
                        }
                    ]
                }
            },
            {
                id: "theme-best-practices",
                title: "主题系统最佳实践",
                type: "principle",
                content: {
                    description: "构建主题系统的最佳实践和注意事项。",
                    mechanism: "主题系统应该考虑性能、用户体验和可维护性。使用CSS变量而不是JavaScript修改样式，性能更好。提供清晰的主题切换反馈，保存用户偏好，支持系统主题跟随。确保所有主题下的可访问性（对比度、可读性）。",
                    keyPoints: [
                        "使用data属性或CSS类控制主题，而不是直接修改style",
                        "优先使用CSS变量，让浏览器处理样式更新",
                        "保存用户的主题选择到localStorage",
                        "支持系统主题偏好（prefers-color-scheme）",
                        "添加平滑的过渡动画提升体验",
                        "确保所有主题的可访问性（WCAG对比度标准）",
                        "提供主题预览功能",
                        "考虑打印样式",
                        "测试所有交互元素在不同主题下的表现",
                        "文档化主题变量和使用方式"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "自定义属性", url: "40-custom-properties.html" },
        next: { title: "计算函数", url: "42-calc-functions.html" }
    }
};
