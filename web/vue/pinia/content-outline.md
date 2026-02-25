# Pinia 状态管理系统化学习大纲

## 第一部分：核心概念与基础

### 1.1 [Pinia 简介与设计理念](./content/content-1.md)
- Pinia 是什么，解决什么问题
- 为什么选择 Pinia（相比 Vuex 的优势）
- 核心设计理念：去中心化、类型安全、扁平化
- 与 Vue 3 Composition API 的深度集成

### 1.2 [快速入门与安装配置](./content/content-2.md)
- 安装与项目集成
- 创建 Pinia 实例
- Vue 应用中的注册与使用
- 开发工具配置（Vue DevTools）

### 1.3 [定义 Store 的基础方式](./content/content-3.md)
- defineStore 核心 API
- Store ID 的命名规范与作用
- Options API 方式定义 Store
- State、Getters、Actions 基础用法

## 第二部分：核心 API 深入

### 2.1 [State 状态管理](./content/content-4.md)
- State 定义与初始化
- 访问与修改 State
- 重置 State（$reset）
- 批量修改 State（$patch）
- State 的响应式原理

### 2.2 [Getters 计算属性](./content/content-5.md)
- Getters 定义与使用
- Getters 中的 this 指向
- 访问其他 Getters
- 传递参数给 Getters
- Getters 的缓存机制

### 2.3 [Actions 业务逻辑](./content/content-6.md)
- Actions 定义与调用
- 异步 Actions 处理
- Actions 中访问 State 和 Getters
- 调用其他 Store 的 Actions
- Actions 的错误处理

### 2.4 [Setup Store 组合式写法](./content/content-7.md)
- Setup 语法定义 Store
- ref() 定义 State
- computed() 定义 Getters
- function() 定义 Actions
- Setup Store vs Options Store 选择

## 第三部分：高级特性

### 3.1 [Store 组合与模块化](./content/content-8.md)
- 跨 Store 访问与组合
- Store 之间的依赖关系
- 循环依赖的处理
- 模块化组织最佳实践

### 3.2 [订阅机制与监听](./content/content-9.md)
- $subscribe 订阅 State 变化
- $onAction 监听 Actions
- 订阅的生命周期管理
- 使用场景与最佳实践

### 3.3 [插件系统](./content/content-10.md)
- 插件机制原理
- 编写自定义插件
- 常用插件场景（日志、持久化、同步）
- 插件的执行顺序与上下文

### 3.4 [TypeScript 集成](./content/content-11.md)
- Store 的类型推导
- 定义 State 类型
- 为 Getters 和 Actions 添加类型
- 使用泛型增强类型安全
- 常见 TypeScript 问题与解决

## 第四部分：工程实践

### 4.1 [在组件中使用 Store](./content/content-12.md)
- Options API 中使用（mapStores、mapState 等）
- Composition API 中使用
- 解构 Store 的注意事项（storeToRefs）
- 组件外使用 Store

### 4.2 [服务端渲染（SSR）支持](./content/content-13.md)
- SSR 中的 Pinia 初始化
- 状态注水与脱水
- SSR 场景下的注意事项
- Nuxt 3 集成示例

### 4.3 [状态持久化](./content/content-14.md)
- 持久化的实现原理
- 使用 pinia-plugin-persistedstate
- 自定义持久化策略
- 加密与安全考虑

### 4.4 [测试策略](./content/content-15.md)
- 单元测试 Store
- 模拟（Mock）Store 数据
- 测试异步 Actions
- 测试最佳实践

## 第五部分：性能优化与最佳实践

### 5.1 [性能优化技巧](./content/content-16.md)
- 避免不必要的响应式
- 合理使用 Getters 缓存
- 大数据量的处理策略
- 按需加载 Store

### 5.2 [常见踩坑与解决方案](./content/content-17.md)
- 解构响应式丢失问题
- 循环依赖陷阱
- HMR 热更新问题
- Actions 中 this 指向
- 其他常见错误与调试技巧

### 5.3 [从 Vuex 迁移到 Pinia](./content/content-18.md)
- Vuex vs Pinia 核心差异
- 迁移步骤与策略
- Modules 到多 Store 的转换
- Mutations 的替代方案
- 渐进式迁移实践

### 5.4 [最佳实践总结](./content/content-19.md)
- Store 设计模式
- 命名规范与目录组织
- 何时使用状态管理
- Pinia vs 组合式函数的选择
- 企业级项目实践经验

---

## 学习建议

1. **循序渐进**：从第一部分开始，逐步深入，不要跳过基础概念
2. **动手实践**：每个章节的示例代码都要在项目中实际运行
3. **对比学习**：如果有 Vuex 经验，重点关注差异部分
4. **关注原理**：理解 Pinia 与 Vue 3 响应式系统的集成方式
5. **工程思维**：重点关注工程实践章节，结合实际项目场景思考

## 预计学习时间

- **快速入门**：第一部分 2-3 小时
- **核心掌握**：第二部分 3-4 小时
- **进阶提升**：第三部分 3-4 小时
- **实践应用**：第四、五部分 4-5 小时
- **总计**：12-16 小时（不含深度实践）

## 配套资源

- [面试题汇总](./quiz/quiz.md)（20 题）
- [官方文档](https://pinia.vuejs.org/)
- [GitHub 仓库](https://github.com/vuejs/pinia)
