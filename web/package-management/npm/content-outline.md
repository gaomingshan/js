# npm 系统化学习大纲

> 从基础使用到深入原理，从常见问题到最佳实践，全面掌握 npm 包管理器

---

## 第一部分：基础概念篇

### 1. [npm 是什么：包管理器的核心职责](./content/content-1.md)
- npm 的定位与生态地位
- npm CLI、npm registry、package 三者关系
- npm 与 Node.js 的关系
- npm vs yarn vs pnpm 对比

### 2. [package.json 完全指南](./content/content-2.md)
- 必需字段与可选字段详解
- main、module、exports 字段的区别
- scripts、bin、files 等工程字段
- engines、os、cpu 等限制字段
- 私有包标识与许可证配置

### 3. [node_modules 目录结构与查找机制](./content/content-3.md)
- node_modules 的目录层级
- Node.js 模块解析算法
- 扁平化安装（flat installation）
- 幽灵依赖（phantom dependencies）问题

---

## 第二部分：依赖管理篇

### 4. [依赖类型与使用场景](./content/content-4.md)
- dependencies vs devDependencies vs peerDependencies
- optionalDependencies 与 bundledDependencies
- 依赖类型选择的最佳实践
- peerDependencies 的设计动机与版本冲突

### 5. [语义化版本（SemVer）深入理解](./content/content-5.md)
- 主版本号、次版本号、修订号规则
- 版本范围符号：^、~、>、>=、< 等
- 版本锁定策略与风险控制
- 预发布版本与构建元数据

### 6. [依赖解析算法与扁平化机制](./content/content-6.md)
- npm v2 嵌套安装 vs npm v3+ 扁平化
- 依赖树构建过程
- 依赖冲突的处理策略
- 依赖提升（hoisting）原理与副作用

### 7. [package-lock.json 锁文件机制](./content/content-7.md)
- lock 文件的作用与必要性
- lockfileVersion 版本差异
- lock 文件与 package.json 的同步
- lock 文件冲突的解决方案

---

## 第三部分：命令详解篇

### 8. [npm install 深入解析](./content/content-8.md)
- install 完整执行流程
- --save、--save-dev、--save-optional 等参数
- --production、--legacy-peer-deps 等特殊标志
- install 性能优化技巧

### 9. [npm update 与依赖升级策略](./content/content-9.md)
- update vs upgrade vs outdated
- 安全更新与破坏性更新
- 批量升级工具（npm-check-updates）
- 依赖升级的测试策略

### 10. [npm link 本地调试与开发](./content/content-10.md)
- link 命令的工作原理
- 本地包调试最佳实践
- link 常见问题与解决方案
- 替代方案：yalc、npm workspaces

### 11. [npm audit 安全审计机制](./content/content-11.md)
- 安全漏洞扫描原理
- audit fix 自动修复
- 忽略特定漏洞的策略
- CI/CD 中的安全审计集成

---

## 第四部分：配置与脚本篇

### 12. [.npmrc 配置文件详解](./content/content-12.md)
- 配置文件优先级（项目、用户、全局、内置）
- registry 镜像源配置
- 代理、认证、token 配置
- 团队协作的 .npmrc 规范

### 13. [npm scripts 脚本系统](./content/content-13.md)
- scripts 字段与命令执行
- 生命周期钩子（pre/post）
- 环境变量与参数传递
- 串行执行与并行执行

### 14. [npm scripts 高级技巧](./content/content-14.md)
- 跨平台兼容性方案
- 脚本组织与命名规范
- 内置变量与 npm config
- 调试与错误处理

---

## 第五部分：高级特性篇

### 15. [npm 缓存机制与优化](./content/content-15.md)
- 缓存目录结构（_cacache）
- 缓存验证与完整性校验
- 缓存清理与故障排查
- CI/CD 中的缓存策略

### 16. [npm 包发布完整流程](./content/content-16.md)
- 发包前准备：登录、版本管理
- npm publish 发布流程
- npm version 版本管理
- npm dist-tag 标签管理

### 17. [npm 包发布最佳实践](./content/content-17.md)
- .npmignore 与 files 字段
- prepublishOnly 钩子检查
- npm deprecate 废弃处理
- npm unpublish 撤包规则

### 18. [私有 npm 仓库方案](./content/content-18.md)
- verdaccio 私有仓库搭建
- npm scope 与组织管理
- 私有包权限控制
- registry 切换与混合使用

---

## 第六部分：工程实践篇

### 19. [Monorepo 与 npm workspaces](./content/content-19.md)
- workspaces 工作原理
- 依赖提升与隔离策略
- workspace 命令详解
- lerna vs npm workspaces

### 20. [npm 性能优化实践](./content/content-20.md)
- 安装速度优化方案
- node_modules 体积优化
- 离线安装与镜像加速
- CI/CD 环境优化

### 21. [npm 常见问题与排查](./content/content-21.md)
- 依赖冲突解决方案
- 循环依赖识别与处理
- 幽灵依赖问题排查
- EACCES、EPERM 等权限问题

### 22. [团队协作与工程化规范](./content/content-22.md)
- package.json 管理规范
- lock 文件协作策略
- 依赖升级流程规范
- 发布流程自动化

---

## 附录

### [npm 与其他包管理器对比](./content/content-23.md)
- npm vs yarn：性能、功能、生态
- npm vs pnpm：磁盘效率、安全性
- 包管理器选型建议
- 迁移指南与注意事项

### [npm 常用命令速查](./content/content-24.md)
- 安装与卸载命令
- 版本与信息查询命令
- 配置与缓存命令
- 发布与管理命令

---

## 学习建议

1. **循序渐进**：按大纲顺序学习，确保基础概念扎实
2. **动手实践**：每个章节的示例都要亲自执行验证
3. **问题导向**：遇到问题时，先查看"常见问题与排查"章节
4. **工程思维**：学习过程中思考如何应用到实际项目
5. **对比学习**：理解 npm、yarn、pnpm 的异同点

## 学习路径图

```
基础概念（1-3） 
    ↓
依赖管理（4-7）
    ↓
命令详解（8-11）
    ↓
配置脚本（12-14）
    ↓
高级特性（15-18）
    ↓
工程实践（19-22）
    ↓
综合应用（23-24）
```

---

**预计学习时间**：15-20 小时  
**难度等级**：★★★☆☆（中级）  
**先修要求**：了解 JavaScript 基础、Node.js 环境

开始学习 → [npm 是什么：包管理器的核心职责](./content/content-1.md)
