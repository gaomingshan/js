# 前端兼容性处理系统化学习大纲

## 学习目标
- 理解前端兼容性问题的本质与浏览器差异根源
- 掌握语法转换与 API 垫片的核心原理与区别
- 熟练配置 Babel、Polyfill 等兼容性工具链
- 具备工程化兼容性方案设计能力：按需加载、体积优化、性能权衡
- 理解现代前端工程中的兼容性最佳实践

---

## 第一部分：兼容性基础（基础）

### 1. [前端兼容性问题的本质](./content/content-1.md)
- 为什么需要兼容性处理：浏览器标准演进 vs 用户环境滞后
- 浏览器引擎差异：V8、SpiderMonkey、JavaScriptCore、Chakra
- ECMAScript 标准与实现的时间差
- 语法特性 vs API 特性：不同类型的兼容性问题
- 兼容性处理的代价：包体积、运行时性能、开发复杂度

### 2. [浏览器兼容性检测与策略](./content/content-2.md)
- 特性检测 vs UA 检测：优劣对比
- Can I Use 与 MDN 兼容性表格的使用
- 渐进增强 vs 优雅降级
- 目标浏览器的选择策略：用户数据分析
- 兼容性成本收益分析

### 3. [语法转换 vs API 垫片](./content/content-3.md)
- 语法转换（Transpilation）：编译时解决
- API 垫片（Polyfill）：运行时填充
- 两者的本质区别与适用场景
- 常见误区：以为 Babel 能解决所有兼容性问题
- 示例对比：箭头函数 vs Promise

---

## 第二部分：Babel 核心原理（进阶）

### 4. [Babel 工作原理](./content/content-4.md)
- Babel 的定位：JavaScript 编译器
- 编译流程：解析（Parse）→ 转换（Transform）→ 生成（Generate）
- AST（抽象语法树）的作用
- Plugin 与 Preset 的关系
- Babel 的局限性：只能转换语法，不能添加 API

### 5. [Babel 配置实战](./content/content-5.md)
- .babelrc vs babel.config.js：配置文件选择
- @babel/preset-env：智能语法转换
- targets 配置：指定目标环境
- useBuiltIns：false vs entry vs usage
- modules 配置：CommonJS vs ESM
- 常见配置陷阱与最佳实践

### 6. [@babel/preset-env 深入](./content/content-6.md)
- preset-env 的工作原理：按需转换
- browserslist 集成
- corejs 版本选择：2 vs 3
- useBuiltIns: 'usage' 的智能注入
- 转换结果分析：查看编译后代码
- 性能优化：避免过度转换

---

## 第三部分：Polyfill 策略（进阶）

### 7. [Polyfill 的本质与实现](./content/content-7.md)
- Polyfill 的定义：运行时 API 填充
- 实现原理：检测 + 模拟实现
- 手写 Polyfill 示例：Promise、Array.prototype.includes
- Polyfill 的局限性：无法 Polyfill 的特性
- 性能影响：运行时开销分析

### 8. [core-js 详解](./content/content-8.md)
- core-js 的作用：标准库 Polyfill 集合
- core-js@2 vs core-js@3：版本差异
- 按需引入策略：全量 vs 模块化
- 与 Babel 的集成：自动注入
- 体积优化：tree-shaking 支持
- 全局污染 vs 局部导入

### 9. [Polyfill 服务化方案](./content/content-9.md)
- Polyfill.io 原理：动态 CDN 服务
- 根据 UA 返回差异化 Polyfill
- 自建 Polyfill 服务的场景
- 优缺点分析：缓存、可靠性、隐私
- 备用方案设计

---

## 第四部分：browserslist 与目标环境（进阶）

### 10. [browserslist 配置](./content/content-10.md)
- browserslist 的作用：统一目标环境配置
- 配置语法：查询规则详解
- 常用查询：last 2 versions、> 1%、not dead
- .browserslistrc vs package.json
- 查询结果查看：npx browserslist
- 多环境配置：development vs production

### 11. [目标环境与转换策略](./content/content-11.md)
- 如何选择目标环境：业务需求 vs 用户分布
- 不同目标对包体积的影响
- Modern vs Legacy 双构建策略
- ESM 与 Nomodule 方案
- 动态 Polyfill 加载

---

## 第五部分：工程化实践（高级）

### 12. [按需加载与体积优化](./content/content-12.md)
- 按需加载的必要性：避免全量引入
- Babel 的 useBuiltIns: 'usage'
- 动态导入与代码分割
- Tree Shaking 与副作用
- Polyfill 体积分析工具
- 优化实战：从 200KB 到 20KB

### 13. [兼容性测试与验证](./content/content-13.md)
- 真机测试的重要性
- BrowserStack、Sauce Labs 云测试平台
- 本地虚拟机测试环境搭建
- 自动化兼容性测试：Playwright、Puppeteer
- 线上监控：错误上报与分析
- 兼容性回归测试策略

### 14. [性能与兼容性权衡](./content/content-14.md)
- 兼容性的代价：体积、性能、开发成本
- 关键指标：FCP、TTI、包体积
- 分层加载策略：核心功能 vs 增强功能
- 降级方案设计
- 决策模型：兼容范围 vs 性能损失

### 15. [现代前端工程实践](./content/content-15.md)
- Webpack、Vite、Rollup 的兼容性配置
- TypeScript 与 Polyfill 的配合
- 微前端场景下的兼容性处理
- 组件库的兼容性策略
- Monorepo 中的统一配置
- 最佳实践清单与常见陷阱

---

## 学习路径建议

**基础路径**（1-3 章）
- 理解兼容性问题本质
- 掌握语法转换 vs API 垫片的区别

**进阶路径**（4-11 章）
- 深入 Babel 原理与配置
- 掌握 Polyfill 策略与 browserslist

**高级路径**（12-15 章）
- 工程化方案设计
- 性能优化与测试验证

---

## 参考资源

- **Babel 官方文档**：https://babeljs.io/docs/
- **core-js GitHub**：https://github.com/zloirock/core-js
- **browserslist**：https://github.com/browserslist/browserslist
- **Can I Use**：https://caniuse.com/
- **Polyfill.io**：https://polyfill.io/
- **MDN 兼容性表格**：https://developer.mozilla.org/

---

## 说明

- 本大纲共 15 个教学章节，从基础到高级递进
- 每章包含核心概念、原理、易错点与工程实践
- 配套约 100 道面试题，覆盖基础、原理、综合应用
- 适合有 JS 基础、想系统掌握前端兼容性处理的开发者
