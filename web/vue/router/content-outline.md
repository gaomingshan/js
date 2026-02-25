# Vue Router 系统化学习大纲

## 第一部分：基础概念与原理

### 1. [前端路由基础](./content/content-1.md)
- 什么是前端路由
- SPA 应用的路由需求
- 前端路由 vs 后端路由
- 路由的核心职责

### 2. [路由模式原理](./content/content-2.md)
- Hash 模式原理与实现
- History 模式原理与实现
- Memory 模式（Vue Router 4.x）
- 三种模式的对比与选择
- History 模式的服务器配置

### 3. [Vue Router 快速上手](./content/content-3.md)
- Vue Router 安装与引入
- 基础路由配置
- RouterView 与 RouterLink
- Vue Router 3.x vs 4.x 差异
- 第一个路由应用

## 第二部分：路由配置与映射

### 4. [路由配置详解](./content/content-4.md)
- 路由配置对象结构
- path、name、component 配置
- redirect 与 alias
- 命名路由的使用
- 路由配置的最佳实践

### 5. [动态路由匹配](./content/content-5.md)
- 动态路由参数（params）
- 路径参数的高级匹配
- 可选参数与重复参数
- 404 路由与通配符
- 参数的响应式问题

### 6. [嵌套路由](./content/content-6.md)
- 嵌套路由的概念
- children 配置
- 嵌套路由的渲染
- 相对路径与绝对路径
- 多层嵌套的实践

### 7. [命名视图](./content/content-7.md)
- 命名视图的使用场景
- components 配置
- 多个 RouterView 的协调
- 嵌套命名视图
- 实战案例：后台布局系统

## 第三部分：导航控制

### 8. [编程式导航](./content/content-8.md)
- $router.push 详解
- $router.replace vs push
- $router.go / back / forward
- 导航参数传递
- 导航失败处理（Vue Router 4.x）

### 9. [声明式导航](./content/content-9.md)
- RouterLink 组件详解
- to 属性的多种形式
- active-class 与 exact-active-class
- 自定义导航组件
- RouterLink 的插槽用法

### 10. [路由传参方式](./content/content-10.md)
- params 传参与接收
- query 传参与接收
- state 传参（History API）
- props 解耦路由参数
- 传参方式的选择与对比

## 第四部分：导航守卫

### 11. [全局导航守卫](./content/content-11.md)
- beforeEach 全局前置守卫
- beforeResolve 全局解析守卫
- afterEach 全局后置守卫
- 守卫的执行顺序
- 实战：权限验证与登录拦截

### 12. [路由独享守卫](./content/content-12.md)
- beforeEnter 配置
- 路由级别的权限控制
- 守卫的复用
- 与全局守卫的配合

### 13. [组件内守卫](./content/content-13.md)
- beforeRouteEnter 守卫
- beforeRouteUpdate 守卫
- beforeRouteLeave 守卫
- 守卫中的 this 访问
- 组件复用场景的处理

### 14. [导航守卫完整流程](./content/content-14.md)
- 完整的导航解析流程
- 守卫的执行时机
- next 函数的使用（3.x）
- return 的使用（4.x）
- 守卫中的常见陷阱

## 第五部分：高级特性

### 15. [路由懒加载](./content/content-15.md)
- 路由懒加载的原理
- import() 动态导入
- 路由级代码分割
- 分组打包策略
- 懒加载失败处理

### 16. [路由元信息](./content/content-16.md)
- meta 字段的使用
- 权限控制最佳实践
- 面包屑导航实现
- 页面标题动态设置
- 元信息的继承与合并

### 17. [动态路由管理](./content/content-17.md)
- addRoute 动态添加路由
- removeRoute 动态删除路由
- hasRoute 与 getRoutes
- 动态权限路由实现
- 动态路由的时机与陷阱

### 18. [滚动行为](./content/content-18.md)
- scrollBehavior 配置
- 保存滚动位置
- 异步滚动控制
- 平滑滚动实现
- 滚动行为的最佳实践

### 19. [路由过渡动画](./content/content-19.md)
- Transition 组件集成
- 基于路由的动画
- 动态过渡效果
- 嵌套路由的动画
- 性能优化考虑

## 第六部分：工程实践

### 20. [路由模块化组织](./content/content-20.md)
- 路由表的拆分策略
- 模块化路由配置
- 自动化路由注册
- 路由配置的类型安全
- 大型项目的路由架构

### 21. [权限路由设计](./content/content-21.md)
- 基于角色的路由控制
- 动态权限路由方案
- 菜单与路由的关联
- 权限路由的缓存策略
- 完整权限系统实现

### 22. [TypeScript 集成](./content/content-22.md)
- 路由类型定义
- 类型安全的路由跳转
- 路由参数类型推导
- 路由元信息类型
- 最佳类型实践

### 23. [性能优化](./content/content-23.md)
- 路由懒加载的颗粒度
- 预加载策略
- 路由缓存与 KeepAlive
- 首屏优化技巧
- 路由性能监控

## 第七部分：常见问题与解决方案

### 24. [常见踩坑与解决方案](./content/content-24.md)
- History 模式 404 问题
- 导航守卫死循环
- 路由参数丢失问题
- 组件复用时参数不响应
- $route vs $router 误用
- 动态路由添加时机
- 路由跳转失败处理
- 路由懒加载报错
- replace vs push 选择
- 命名路由 vs 路径导航

### 25. [实战案例集](./content/content-25.md)
- 后台管理系统路由设计
- 多标签页路由管理
- 路由级 Loading 状态
- 面包屑导航实现
- 页面缓存与刷新
- 路由错误边界
- SEO 优化方案
- 路由埋点统计

---

## 学习建议

1. **循序渐进**：按照大纲顺序学习，先掌握基础概念和原理，再深入高级特性
2. **动手实践**：每个章节的示例代码都要自己实现一遍
3. **理解原理**：不要只记 API，要理解 Vue Router 的设计思想和实现原理
4. **结合项目**：将学到的知识应用到实际项目中，解决真实问题
5. **版本区分**：注意 Vue Router 3.x 和 4.x 的差异，重点掌握 4.x
6. **关注踩坑**：第 24 章的常见问题一定要仔细阅读，避免踩坑

## 总计

- **25 个章节**，涵盖 Vue Router 从基础到高级的完整知识体系
- **20 道面试题**，见 [quiz/quiz.md](./quiz/quiz.md)
- 学习时长：建议 **3-5 天**深度学习，**7-10 天**结合项目实践

---

**开始学习** → [第 1 章：前端路由基础](./content/content-1.md)
