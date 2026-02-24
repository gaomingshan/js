# Vite 系统化学习大纲

> 从快速上手到深入原理，全面掌握现代前端构建工具 Vite

---

## 第一部分：快速入门（理解核心优势）

### 1. Vite 简介与核心特性
[→ 前往学习](./content/content-1.md)
- Vite 是什么：下一代前端构建工具
- 为什么需要 Vite：传统构建工具的痛点
- Vite vs Webpack：设计理念对比
- 核心特性：ESM、esbuild、Rollup、即时热更新
- 适用场景与限制

### 2. 快速开始
[→ 前往学习](./content/content-2.md)
- 创建 Vite 项目（官方模板）
- 项目结构解析
- 开发服务器启动与访问
- 构建生产版本
- 预览生产构建
- 基础配置文件 vite.config.js

---

## 第二部分：核心功能详解

### 3. 开发服务器原理
[→ 前往学习](./content/content-3.md)
- 基于 ESM 的开发服务器
- 按需编译：请求时转换模块
- 冷启动性能优势
- 浏览器模块解析机制
- 开发服务器配置（端口、代理、HTTPS）

### 4. 依赖预构建
[→ 前往学习](./content/content-4.md)
- 为什么需要预构建
- esbuild 预构建流程
- CommonJS 与 UMD 兼容性处理
- 依赖发现与缓存机制
- 强制重新预构建
- 预构建配置优化（include、exclude）

### 5. 模块热替换（HMR）
[→ 前往学习](./content/content-5.md)
- HMR 工作原理
- Vite HMR API
- 框架集成（Vue、React HMR）
- HMR 边界与失效场景
- 自定义 HMR 逻辑
- HMR 性能优化

### 6. 静态资源处理
[→ 前往学习](./content/content-6.md)
- 资源导入方式（URL、内联、源码）
- CSS 处理（CSS Modules、PostCSS、预处理器）
- 图片与字体资源
- JSON 与 WebAssembly
- public 目录处理
- 资源优化配置（压缩、内联阈值）

### 7. TypeScript 与 JSX
[→ 前往学习](./content/content-7.md)
- TypeScript 支持（仅转译）
- JSX/TSX 配置
- 类型检查策略
- esbuild vs tsc
- Vue 与 React JSX 配置差异
- 路径别名与类型提示

---

## 第三部分：配置系统详解

### 8. 开发配置
[→ 前往学习](./content/content-8.md)
- server 配置（端口、host、代理）
- 开发环境优化（预构建、缓存）
- CORS 与跨域处理
- HTTPS 配置
- 自定义中间件
- WebSocket 配置

### 9. 构建配置
[→ 前往学习](./content/content-9.md)
- build 配置选项
- Rollup 配置集成
- 输出目录与命名规则
- 代码分割策略
- 产物压缩与混淆
- 浏览器兼容性（target、polyfill）

### 10. 环境变量与模式
[→ 前往学习](./content/content-10.md)
- .env 文件规则
- 环境变量前缀（VITE_）
- 模式配置（development、production、custom）
- import.meta.env 使用
- 构建时注入变量
- 安全性注意事项

### 11. 路径解析与别名
[→ 前往学习](./content/content-11.md)
- resolve.alias 配置
- 路径补全与扩展名
- 条件导出（package.json exports）
- Monorepo 路径处理
- 外部化依赖（external）
- 文件系统路由

---

## 第四部分：插件机制

### 12. Vite 插件系统
[→ 前往学习](./content/content-12.md)
- 插件架构（Rollup 兼容）
- 插件钩子生命周期
- 通用钩子 vs Vite 专有钩子
- 插件执行顺序与控制
- 插件配置与选项
- 插件调试技巧

### 13. 常用官方插件
[→ 前往学习](./content/content-13.md)
- @vitejs/plugin-vue
- @vitejs/plugin-react
- @vitejs/plugin-legacy（浏览器兼容）
- vite-plugin-pwa（PWA 支持）
- 社区优秀插件推荐
- 插件选型原则

### 14. 自定义插件开发
[→ 前往学习](./content/content-14.md)
- 插件基本结构
- 常用钩子实现（transform、resolveId、load）
- 虚拟模块（virtual module）
- 开发服务器增强
- 构建产物处理
- 插件开发最佳实践

---

## 第五部分：高级应用

### 15. 多页面应用（MPA）
[→ 前往学习](./content/content-15.md)
- MPA 配置方式
- 入口文件管理
- 共享模块优化
- 页面间路由与通信
- 构建产物结构
- MPA 性能优化

### 16. 库模式
[→ 前往学习](./content/content-16.md)
- 库模式配置（build.lib）
- 输出格式（ES、UMD、IIFE）
- 外部依赖处理
- TypeScript 类型声明
- 组件库打包
- npm 发布流程

### 17. SSR 支持
[→ 前往学习](./content/content-17.md)
- Vite SSR 原理
- 服务端入口配置
- SSR 预构建处理
- 外部化依赖管理
- 客户端激活（hydration）
- SSR 性能优化
- SSG（静态生成）方案

### 18. Worker 支持
[→ 前往学习](./content/content-18.md)
- Web Worker 导入方式
- Worker 构建配置
- SharedWorker 与 ServiceWorker
- Worker 与主线程通信
- Worker 性能优化
- Worker 调试技巧

---

## 第六部分：性能优化

### 19. 开发性能优化
[→ 前往学习](./content/content-19.md)
- 冷启动速度优化
- 热更新性能优化
- 预构建优化策略
- 大型项目优化技巧
- 依赖分析与瘦身
- 开发体验提升

### 20. 生产构建优化
[→ 前往学习](./content/content-20.md)
- 代码分割策略（手动与自动）
- Tree Shaking 优化
- 资源压缩配置
- 懒加载与预加载
- CDN 资源处理
- 产物体积分析
- 构建速度优化

### 21. 缓存策略
[→ 前往学习](./content/content-21.md)
- 文件名 hash 策略
- 依赖预构建缓存
- 浏览器缓存配置
- 长期缓存方案
- 缓存失效处理
- Service Worker 缓存

---

## 第七部分：底层原理深入

### 22. 模块解析机制
[→ 前往学习](./content/content-22.md)
- ESM 模块解析规则
- 裸模块导入处理（bare import）
- 依赖图构建
- 循环依赖处理
- 动态导入实现
- 模块联邦支持

### 23. esbuild 集成原理
[→ 前往学习](./content/content-23.md)
- esbuild 架构与优势
- 预构建流程详解
- TS/JSX 转换机制
- 代码压缩优化
- esbuild 限制与替代
- 自定义 esbuild 插件

### 24. Rollup 构建流程
[→ 前往学习](./content/content-24.md)
- Rollup 工作原理
- 构建阶段与钩子
- 代码分割算法
- Tree Shaking 实现
- 产物生成与优化
- Rollup 插件生态

### 25. HMR 实现原理
[→ 前往学习](./content/content-25.md)
- HMR 通信协议
- 模块依赖追踪
- 更新边界计算
- 热更新应用流程
- 状态保持机制
- HMR 性能瓶颈分析

---

## 第八部分：工程实践

### 26. 项目迁移指南
[→ 前往学习](./content/content-26.md)
- 从 Webpack 迁移
- 从 Vue CLI 迁移
- 从 CRA 迁移
- 配置映射对照表
- 插件替代方案
- 迁移常见问题

### 27. Monorepo 实践
[→ 前往学习](./content/content-27.md)
- Monorepo 工具集成（pnpm、Turborepo）
- 包间依赖管理
- 共享配置与组件
- 联合构建优化
- 版本发布策略
- Monorepo 性能优化

### 28. CI/CD 集成
[→ 前往学习](./content/content-28.md)
- GitHub Actions 配置
- 构建缓存策略
- 环境变量管理
- 多环境部署
- 增量构建优化
- 部署回滚方案

### 29. 问题排查与调试
[→ 前往学习](./content/content-29.md)
- 开发服务器问题排查
- 构建失败诊断
- HMR 失效分析
- 性能问题定位
- 日志与调试工具
- 常见错误速查表

### 30. 最佳实践总结
[→ 前往学习](./content/content-30.md)
- 项目结构规范
- 配置管理策略
- 性能优化清单
- 安全性建议
- 团队协作规范
- 未来趋势展望

---

## 附录

### A. 配置速查表
- 常用配置项快速索引
- 配置示例代码片段
- 配置优先级说明

### B. 插件生态推荐
- 官方插件列表
- 社区优秀插件
- 插件分类索引

### C. 性能优化检查清单
- 开发性能检查项
- 生产构建检查项
- 用户体验优化项

### D. 术语表
- Vite 核心术语
- 构建工具通用术语
- 浏览器相关术语

---

**学习建议**
1. **快速上手**：第一部分快速了解 Vite 核心优势
2. **深入功能**：第二、三部分掌握核心功能与配置
3. **进阶应用**：第四、五部分学习插件与高级特性
4. **性能优化**：第六部分必须实践，结合项目优化
5. **原理剖析**：第七部分理解底层机制，提升问题解决能力
6. **工程实践**：第八部分结合真实项目，形成最佳实践

**配套资源**
- 官方文档：https://cn.vitejs.dev/
- GitHub 仓库：https://github.com/vitejs/vite
- Awesome Vite：https://github.com/vitejs/awesome-vite
- 示例项目：examples/ 目录
