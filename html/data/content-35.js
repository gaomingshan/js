// 第35章：测试与验证 - 内容数据
window.htmlContentData_35 = {
    section: {
        title: "测试与验证",
        icon: "✅"
    },
    topics: [
        {
            type: "concept",
            title: "HTML测试概述",
            content: {
                description: "HTML测试和验证确保代码质量、可访问性、性能和兼容性。包括语法验证、可访问性测试、性能测试和跨浏览器测试。",
                keyPoints: [
                    "语法验证确保HTML正确",
                    "可访问性测试保证无障碍访问",
                    "性能测试优化加载速度",
                    "跨浏览器测试确保兼容性",
                    "自动化测试提高效率",
                    "持续集成保证质量"
                ]
            }
        },
        {
            type: "best-practice",
            title: "HTML语法验证",
            content: {
                description: "使用工具验证HTML语法：",
                practices: [
                    {
                        title: "W3C Validator",
                        description: "官方HTML验证工具。",
                        example: `<!-- 在线验证 -->
https://validator.w3.org/

<!-- 常见错误 -->
1. 缺少DOCTYPE
2. 未闭合的标签
3. 属性值未加引号
4. ID重复
5. 非法嵌套

<!-- 验证步骤 -->
1. 访问 validator.w3.org
2. 输入URL或上传文件
3. 查看验证结果
4. 修复错误和警告`
                    },
                    {
                        title: "HTMLHint",
                        description: "静态代码检查工具。",
                        example: `<!-- 安装 -->
npm install htmlhint --save-dev

<!-- 配置 .htmlhintrc -->
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "alt-require": true,
  "title-require": true
}

<!-- 运行检查 -->
npx htmlhint index.html
npx htmlhint "src/**/*.html"`
                    },
                    {
                        title: "VS Code扩展",
                        description: "编辑器内实时验证。",
                        example: `推荐扩展：
- HTMLHint
- W3C Web Validator
- HTML CSS Support
- IntelliSense for CSS class names

配置settings.json：
{
  "html.validate.scripts": true,
  "html.validate.styles": true,
  "htmlhint.enable": true
}`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "可访问性测试",
            content: {
                description: "确保网站对所有人可访问：",
                practices: [
                    {
                        title: "Lighthouse",
                        description: "Chrome DevTools内置工具。",
                        example: `<!-- 使用步骤 -->
1. 打开Chrome DevTools (F12)
2. 切换到Lighthouse标签
3. 选择"Accessibility"类别
4. 点击"Generate report"
5. 查看评分和建议

<!-- 检查项目 -->
- ARIA属性使用
- 颜色对比度
- 表单标签
- 图片alt文本
- 标题层级
- 键盘导航`
                    },
                    {
                        title: "axe DevTools",
                        description: "专业的可访问性测试工具。",
                        example: `<!-- 安装浏览器扩展 -->
Chrome/Edge: axe DevTools

<!-- 使用 -->
1. 打开DevTools
2. 切换到axe DevTools标签
3. 点击"Scan ALL of my page"
4. 查看问题列表
5. 查看详细说明和修复建议

<!-- 命令行工具 -->
npm install -g @axe-core/cli
axe https://example.com`
                    },
                    {
                        title: "屏幕阅读器测试",
                        description: "使用真实的辅助技术测试。",
                        example: `常用屏幕阅读器：
- NVDA (Windows, 免费)
- JAWS (Windows, 商业)
- VoiceOver (macOS/iOS, 内置)
- TalkBack (Android, 内置)

测试要点：
1. 所有内容可访问
2. 导航顺序合理
3. 表单可填写
4. 图片有描述
5. 链接有意义
6. 交互元素可操作`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "性能测试",
            content: {
                description: "测试和优化页面性能：",
                practices: [
                    {
                        title: "Lighthouse性能审计",
                        description: "综合性能评分。",
                        example: `<!-- Core Web Vitals -->
1. LCP (Largest Contentful Paint)
   - 目标：< 2.5秒
   - 测量最大内容元素的加载时间

2. FID (First Input Delay)
   - 目标：< 100毫秒
   - 测量首次交互延迟

3. CLS (Cumulative Layout Shift)
   - 目标：< 0.1
   - 测量布局稳定性

<!-- 优化建议 -->
- 压缩图片
- 延迟加载
- 减少JavaScript
- 使用CDN
- 启用缓存`
                    },
                    {
                        title: "WebPageTest",
                        description: "详细的性能分析。",
                        example: `https://www.webpagetest.org/

测试配置：
- 测试地点：选择目标用户位置
- 浏览器：Chrome/Firefox等
- 连接速度：3G/4G/Cable
- 测试次数：建议3次取平均

分析报告：
- 瀑布图
- 首字节时间(TTFB)
- 开始渲染时间
- 完全加载时间
- 资源大小和数量`
                    },
                    {
                        title: "Chrome DevTools Performance",
                        description: "详细的性能分析。",
                        example: `<!-- 使用步骤 -->
1. 打开DevTools Performance标签
2. 点击Record开始录制
3. 执行操作（加载、滚动等）
4. 停止录制
5. 分析火焰图

<!-- 关注指标 -->
- 脚本执行时间
- 样式计算时间
- 布局时间
- 绘制时间
- 长任务（> 50ms）`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "跨浏览器测试",
            content: {
                description: "确保多浏览器兼容性：",
                practices: [
                    {
                        title: "本地测试",
                        description: "在主流浏览器中测试。",
                        example: `必测浏览器：
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- 移动浏览器 (iOS Safari, Chrome Mobile)

测试要点：
1. 布局正常
2. 功能可用
3. 样式一致
4. 交互正常
5. 性能可接受`
                    },
                    {
                        title: "BrowserStack",
                        description: "云端浏览器测试平台。",
                        example: `https://www.browserstack.com/

功能：
- 真实设备测试
- 多浏览器/多版本
- 截图对比
- 自动化测试
- 实时调试

测试矩阵：
- Windows: Chrome, Firefox, Edge, IE11
- macOS: Safari, Chrome, Firefox
- iOS: Safari
- Android: Chrome`
                    },
                    {
                        title: "Can I Use",
                        description: "检查特性兼容性。",
                        example: `https://caniuse.com/

使用场景：
1. 检查CSS特性支持
2. 检查HTML5 API支持
3. 查看浏览器市场份额
4. 决定是否需要polyfill

示例查询：
- CSS Grid
- Flexbox
- Web Components
- Service Worker`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "自动化测试",
            content: {
                description: "使用自动化工具提高效率：",
                practices: [
                    {
                        title: "Playwright",
                        description: "端到端测试框架。",
                        example: `// 安装
npm install -D @playwright/test

// 测试示例 test.spec.js
const { test, expect } = require('@playwright/test');

test('页面标题测试', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});

test('导航测试', async ({ page }) => {
  await page.goto('https://example.com');
  
  // 点击链接
  await page.click('a[href="/about"]');
  
  // 验证URL
  expect(page.url()).toContain('/about');
});

// 运行测试
npx playwright test`
                    },
                    {
                        title: "Pa11y",
                        description: "自动化可访问性测试。",
                        example: `// 安装
npm install -g pa11y

// 命令行测试
pa11y https://example.com

// 配置文件 .pa11yrc
{
  "standard": "WCAG2AA",
  "ignore": [
    "warning",
    "notice"
  ],
  "timeout": 10000
}

// CI集成
pa11y-ci --sitemap https://example.com/sitemap.xml`
                    },
                    {
                        title: "HTML Proofer",
                        description: "检查HTML链接和资源。",
                        example: `# 安装 (Ruby)
gem install html-proofer

# 检查本地文件
htmlproofer ./dist

# 选项
--check-html        # 验证HTML
--check-img-http    # 检查图片
--check-opengraph   # 检查OG标签
--ignore-urls "/skip-this/"

# CI集成
script:
  - bundle exec htmlproofer ./_site`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "持续集成",
            content: {
                description: "CI/CD中的HTML测试：",
                practices: [
                    {
                        title: "GitHub Actions",
                        description: "自动化测试工作流。",
                        example: `# .github/workflows/test.yml
name: HTML Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: HTML Lint
      run: npx htmlhint "src/**/*.html"
    
    - name: Accessibility Test
      run: npx pa11y-ci
    
    - name: Build
      run: npm run build
    
    - name: E2E Tests
      run: npx playwright test`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "测试检查清单",
            content: {
                description: "完整的测试清单：",
                items: [
                    { id: "check35-1", text: "通过W3C HTML验证" },
                    { id: "check35-2", text: "配置HTMLHint检查" },
                    { id: "check35-3", text: "Lighthouse可访问性评分 > 90" },
                    { id: "check35-4", text: "通过axe DevTools测试" },
                    { id: "check35-5", text: "屏幕阅读器测试通过" },
                    { id: "check35-6", text: "LCP < 2.5秒" },
                    { id: "check35-7", text: "CLS < 0.1" },
                    { id: "check35-8", text: "Lighthouse性能评分 > 90" },
                    { id: "check35-9", text: "Chrome测试通过" },
                    { id: "check35-10", text: "Firefox测试通过" },
                    { id: "check35-11", text: "Safari测试通过" },
                    { id: "check35-12", text: "移动浏览器测试通过" },
                    { id: "check35-13", text: "配置自动化测试" },
                    { id: "check35-14", text: "CI/CD集成测试" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "代码规范", url: "content.html?chapter=34" },
        next: { title: "项目实战", url: "content.html?chapter=36" }
    }
};
