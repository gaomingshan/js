# 包管理器学习大纲

> 系统掌握 npm、yarn、pnpm 三大包管理器的设计原理与工程实践

---

## 学习路线

```
基础原理 → npm 深入 → Yarn 解析 → pnpm 创新 → 依赖管理 → Monorepo 工程化 → 最佳实践
```

**总计**：36 个章节，涵盖从基础概念到架构决策的完整知识体系

---

## 第一部分：包管理器基础（4 章）

### 1. [包管理器的本质与设计哲学](./content/content-1.md)
- 包管理器解决的核心问题
- 前端 vs 后端依赖管理对比（Maven/Gradle/Go modules）
- npm/yarn/pnpm 设计目标差异

### 2. [依赖模型与依赖图](./content/content-2.md)
- 依赖关系的图结构表达
- 直接依赖 vs 间接依赖
- 依赖图的构建与遍历算法
- 循环依赖检测

### 3. [语义化版本（semver）规范](./content/content-3.md)
- semver 版本号结构与语义
- 版本范围表达式（^、~、>、<、||）
- 预发布版本与构建元数据
- 版本解析与兼容性判断

### 4. [依赖解析算法](./content/content-4.md)
- 版本冲突的本质
- 依赖解析策略（最近依赖、最高版本、锁定版本）
- 依赖提升（hoisting）机制
- 去重策略与权衡

---

## 第二部分：npm 核心机制（6 章）

### 5. [npm 安装流程详解](./content/content-5.md)
- npm install 完整生命周期
- 网络请求与缓存机制
- node_modules 目录结构演变（v2 → v3 → v7）
- 扁平化安装的副作用

### 6. [package.json 深度解析](./content/content-6.md)
- 核心字段：dependencies、devDependencies、peerDependencies
- optionalDependencies 与 bundledDependencies
- scripts 生命周期钩子
- exports/imports 字段与条件导出

### 7. [package-lock.json 的设计与作用](./content/content-7.md)
- 锁文件的诞生背景
- lockfileVersion 演进（v1/v2/v3）
- 确定性安装的保障机制
- 锁文件冲突的解决策略

### 8. [npm registry 与包发布](./content/content-8.md)
- npm registry 架构
- 包的发布流程与版本管理
- scope 包与私有包
- npm link 原理与本地开发

### 9. [npm 缓存机制](./content/content-9.md)
- 缓存目录结构
- 缓存验证与失效策略
- offline 模式与网络容错
- 缓存优化实践

### 10. [npm scripts 与生命周期](./content/content-10.md)
- scripts 执行环境与 PATH
- pre/post 钩子机制
- 跨平台脚本兼容性
- 脚本组合与任务编排

---

## 第三部分：npm 进阶特性（5 章）

### 11. [依赖冲突与解决方案](./content/content-11.md)
- 依赖冲突的分类（版本冲突、结构冲突）
- npm 的冲突解决策略
- resolutions 字段强制版本
- overrides 字段（npm 8.3+）

### 12. [幽灵依赖问题](./content/content-12.md)
- 幽灵依赖（Phantom Dependencies）的成因
- 扁平化安装的隐患
- 真实案例与排查方法
- 解决方案：严格依赖声明

### 13. [Peer Dependencies 设计](./content/content-13.md)
- peer dependencies 的设计初衷
- 插件系统的依赖模型
- npm 3-6 vs npm 7+ 的行为差异
- peerDependenciesMeta 的使用

### 14. [workspace 模式](./content/content-14.md)
- npm workspaces 基本概念
- 多包项目的依赖管理
- 工作区间的依赖链接
- workspace 命令详解

### 15. [npm 配置体系](./content/content-15.md)
- 配置文件优先级（npmrc 层级）
- 常用配置项详解
- 环境变量与配置覆盖
- 企业级配置最佳实践

---

## 第四部分：Yarn 深度解析（5 章）

### 16. [Yarn Classic 的设计动机](./content/content-16.md)
- Yarn 诞生背景（2016）
- 相比 npm 的核心改进
- yarn.lock 格式设计
- 确定性安装的实现

### 17. [Yarn Berry（v2+）架构革新](./content/content-17.md)
- Plug'n'Play（PnP）模式原理
- .pnp.cjs 文件结构
- Zero-Installs 理念
- 向后兼容策略

### 18. [Yarn PnP 的优势与挑战](./content/content-18.md)
- PnP 解决的问题
- 性能提升量化分析
- 生态兼容性问题
- 何时选择 PnP vs node_modules

### 19. [Yarn Workspaces 实践](./content/content-19.md)
- workspace 协议（workspace:）
- 跨包依赖管理
- 独立版本发布策略
- Monorepo 脚本协调

### 20. [Yarn 插件系统](./content/content-20.md)
- 插件架构设计
- 常用官方插件
- 自定义插件开发
- 企业级扩展实践

---

## 第五部分：pnpm 深度解析（5 章）

### 21. [pnpm 的设计哲学](./content/content-21.md)
- 内容寻址存储（content-addressable store）
- 符号链接（symlink）策略
- 硬链接（hard link）机制
- 磁盘空间节省原理

### 22. [pnpm 的 node_modules 结构](./content/content-22.md)
- .pnpm 虚拟存储目录
- 真实依赖与符号链接
- 严格的依赖隔离
- 幽灵依赖的根治

### 23. [pnpm-lock.yaml 设计](./content/content-23.md)
- lockfile 格式与字段
- 依赖树的紧凑表达
- 版本解析记录
- 与 npm/yarn 锁文件对比

### 24. [pnpm workspace 机制](./content/content-24.md)
- pnpm-workspace.yaml 配置
- 过滤器（filter）语法
- 依赖协议（workspace:、link:）
- 增量构建与任务缓存

### 25. [pnpm 性能优化原理](./content/content-25.md)
- 安装速度优化技术
- 并发下载与并行安装
- 磁盘 I/O 优化
- 性能基准测试对比

---

## 第六部分：依赖管理实战（4 章）

### 26. [版本管理策略](./content/content-26.md)
- 固定版本 vs 语义化范围
- 依赖升级策略（保守 vs 激进）
- 自动化依赖更新工具（Renovate/Dependabot）
- 安全漏洞响应流程

### 27. [安装一致性保障](./content/content-27.md)
- 锁文件的强制使用
- CI 环境的一致性检查
- frozen-lockfile 参数
- 跨团队协作规范

### 28. [依赖审计与安全](./content/content-28.md)
- npm audit 原理
- 漏洞数据库（GitHub Advisory）
- 自动修复 vs 手动修复
- 企业级安全扫描

### 29. [私有包管理方案](./content/content-29.md)
- Verdaccio 私有 registry
- npm Enterprise vs Artifactory
- scope 包的权限控制
- 混合源配置策略

---

## 第七部分：Monorepo 与工程化（6 章）

### 30. [Monorepo 架构设计](./content/content-30.md)
- Monorepo 的优势与挑战
- 多包依赖拓扑
- 版本管理策略（固定版本 vs 独立版本）
- 代码共享与边界控制

### 31. [依赖提升与去重](./content/content-31.md)
- 提升规则与冲突处理
- shamefully-hoist 配置
- 公共依赖的版本统一
- 提升带来的隐患

### 32. [Monorepo 工具链对比](./content/content-32.md)
- Lerna 的演进与局限
- Nx 的智能缓存
- Turborepo 的增量构建
- Rush 的企业级特性

### 33. [任务编排与增量构建](./content/content-33.md)
- 依赖图驱动的构建顺序
- 任务缓存机制
- 远程缓存共享
- 并行构建策略

### 34. [CI/CD 优化实践](./content/content-34.md)
- 缓存策略（node_modules、pnpm store）
- 增量测试与构建
- 受影响包检测（affected packages）
- 部署策略（独立部署 vs 批量部署）

### 35. [跨包依赖管理](./content/content-35.md)
- 本地包引用（link/workspace 协议）
- 版本发布协调
- 变更日志生成（changesets）
- 语义化版本自动化

---

## 第八部分：最佳实践与未来（1 章）

### 36. [包管理器选型与未来趋势](./content/content-36.md)
- npm vs Yarn vs pnpm 决策矩阵
- 团队规模与项目类型的适配
- 迁移成本与风险评估
- 新兴趋势：Deno、Bun 的包管理创新

---

## 学习建议

1. **基础阶段**（章节 1-10）：理解依赖管理的核心概念，掌握 npm 基础
2. **进阶阶段**（章节 11-25）：深入三大包管理器的设计差异与实现原理
3. **实战阶段**（章节 26-35）：解决真实工程问题，优化团队协作流程
4. **决策阶段**（章节 36）：具备技术选型能力，理解技术演进方向

---

## 参考资源

- npm 官方文档：https://docs.npmjs.com/
- Yarn 官方文档：https://yarnpkg.com/
- pnpm 官方文档：https://pnpm.io/
- Node.js 模块解析算法：https://nodejs.org/api/modules.html
- semver 规范：https://semver.org/
