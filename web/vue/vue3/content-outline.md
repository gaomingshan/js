# Vue 3 系统化学习大纲

> 本大纲涵盖 Vue 3 核心概念、响应式系统、组合式 API、生态工具及工程化最佳实践，适合有前端基础并希望深入掌握 Vue 3 的开发者。

---

## 第一部分：核心基础 (Core Fundamentals)

理解 Vue 3 的基础概念和模板系统，掌握响应式数据与视图绑定的核心机制。

1. [响应式基础：ref 与 reactive](./content/content-1.md)
   - ref 与 reactive 的使用场景
   - 响应式原理：Proxy vs Object.defineProperty
   - 响应式解包与注意事项
   - toRef 与 toRefs 工具函数

2. [模板语法与指令系统](./content/content-2.md)
   - 插值表达式与文本渲染
   - 指令解析机制
   - 常用内置指令（v-bind、v-on、v-model）
   - 指令修饰符与简写

3. [计算属性与侦听器](./content/content-3.md)
   - computed 的缓存机制
   - computed vs methods 性能对比
   - watch 与 watchEffect 的区别
   - 深度监听与即时执行
   - 副作用清理与停止监听

4. [类与样式绑定](./content/content-4.md)
   - :class 动态绑定（对象、数组、组件）
   - :style 动态绑定与自动前缀
   - CSS Modules 与 scoped 样式
   - v-bind in CSS

5. [条件渲染与列表渲染](./content/content-5.md)
   - v-if vs v-show 选择策略
   - v-if 与 v-for 优先级问题
   - key 的作用与最佳实践
   - 列表渲染性能优化

6. [事件处理与表单绑定](./content/content-6.md)
   - 事件监听与内联处理器
   - 事件修饰符（stop、prevent、capture、once）
   - 按键修饰符与鼠标修饰符
   - v-model 原理与自定义实现
   - v-model 在不同表单元素的应用

---

## 第二部分：组件系统 (Component System)

深入理解 Vue 3 组件化开发，掌握组件通信与复用模式。

7. [组件基础与注册](./content/content-7.md)
   - 组件定义与导出
   - 全局注册 vs 局部注册
   - 组件命名规范
   - 递归组件与循环引用

8. [Props 与单向数据流](./content/content-8.md)
   - Props 定义与类型验证
   - Props 默认值与必填项
   - 单向数据流原则
   - Props 解构与响应式丢失
   - Boolean 类型转换

9. [事件通信：Emits](./content/content-9.md)
   - defineEmits 声明与使用
   - 事件验证与参数传递
   - 自定义事件命名规范
   - 事件透传与 v-on="$listeners"

10. [插槽系统深入](./content/content-10.md)
    - 默认插槽与具名插槽
    - 作用域插槽与数据传递
    - 插槽的编译与渲染
    - 动态插槽名
    - 无渲染组件模式

11. [组件 v-model 原理](./content/content-11.md)
    - v-model 语法糖解析
    - 多个 v-model 绑定
    - 自定义 v-model 修饰符
    - v-model 与 computed 结合

12. [依赖注入：Provide / Inject](./content/content-12.md)
    - 跨层级通信场景
    - 响应式注入
    - 符号键与类型安全
    - 注入默认值
    - 应用级 Provide

13. [组件生命周期](./content/content-13.md)
    - 生命周期钩子全览
    - setup 中的生命周期钩子
    - 组合式 API vs 选项式 API 生命周期对比
    - 父子组件生命周期执行顺序
    - 生命周期最佳实践

14. [透传 Attributes](./content/content-14.md)
    - $attrs 与 $props 的区别
    - inheritAttrs 配置
    - 多根节点的 Attributes 继承
    - 透传与组件封装

15. [异步组件与代码分割](./content/content-15.md)
    - defineAsyncComponent 定义
    - 加载与错误状态处理
    - 路由级代码分割
    - 组件懒加载策略

---

## 第三部分：组合式 API 深入 (Composition API)

掌握组合式 API 的核心思想，学会抽取和复用逻辑。

16. [setup 函数与 script setup](./content/content-16.md)
    - setup 执行时机与参数
    - script setup 语法糖优势
    - defineProps、defineEmits 宏
    - defineExpose 暴露组件方法
    - 顶层 await 支持

17. [组合式函数（Composables）](./content/content-17.md)
    - Composables 设计模式
    - 命名约定与组织方式
    - 响应式状态提取
    - 生命周期钩子复用
    - Composables vs Mixins

18. [响应式 API 进阶](./content/content-18.md)
    - shallowRef 与 shallowReactive
    - readonly 与深层只读
    - toRaw 与 markRaw
    - customRef 自定义响应式
    - effectScope 作用域管理

19. [模板引用：ref](./content/content-19.md)
    - 获取 DOM 元素引用
    - 获取组件实例引用
    - v-for 中的 ref
    - 函数型 ref
    - ref 与 TypeScript

---

## 第四部分：高级特性 (Advanced Features)

学习 Vue 3 的高级特性，扩展框架能力。

20. [自定义指令](./content/content-20.md)
    - 指令生命周期钩子
    - 指令参数与修饰符
    - 组件上使用指令
    - 常见自定义指令案例（v-focus、v-permission）

21. [插件系统](./content/content-21.md)
    - 插件定义与注册
    - app.use() 原理
    - 全局属性与方法注入
    - 插件开发最佳实践

22. [动态组件与 KeepAlive](./content/content-22.md)
    - component :is 动态渲染
    - KeepAlive 缓存原理
    - include/exclude 配置
    - max 最大缓存数
    - 缓存组件生命周期

23. [渲染函数与 JSX](./content/content-23.md)
    - h() 函数与 VNode
    - 渲染函数场景与优势
    - JSX 语法支持
    - 函数式组件
    - render 与 template 性能对比

---

## 第五部分：内置组件 (Built-in Components)

掌握 Vue 3 新增和改进的内置组件，解决特定场景问题。

24. [Transition 过渡动画](./content/content-24.md)
    - CSS 过渡与动画类名
    - JavaScript 钩子
    - 过渡模式（in-out、out-in）
    - appear 初次渲染过渡
    - 自定义过渡类名

25. [TransitionGroup 列表过渡](./content/content-25.md)
    - 列表过渡原理
    - move 类名与平滑移动
    - 交错过渡效果
    - FLIP 动画技术

26. [Teleport 传送门](./content/content-26.md)
    - Teleport 使用场景（Modal、Toast）
    - to 目标选择器
    - disabled 禁用传送
    - 多个 Teleport 到同一目标

27. [Suspense 异步组件处理](./content/content-27.md)
    - Suspense 原理与状态
    - default 与 fallback 插槽
    - 错误处理与重试
    - 嵌套 Suspense
    - 配合异步 setup 使用

---

## 第六部分：单文件组件 (SFC)

深入理解 .vue 文件的编译与优化机制。

28. [SFC 基础与编译](./content/content-28.md)
    - SFC 结构（template、script、style）
    - SFC 编译流程
    - 编译优化（静态提升、补丁标记、缓存事件处理器）
    - 自定义块（custom blocks）

29. [CSS 特性](./content/content-29.md)
    - scoped 样式原理与深度选择器
    - CSS Modules 使用
    - v-bind() 在 CSS 中绑定响应式变量
    - 全局样式注入

30. [TypeScript 支持](./content/content-30.md)
    - script lang="ts" 配置
    - Props 类型定义
    - Emits 类型定义
    - 组件实例类型推断
    - 泛型组件

---

## 第七部分：Vue Router 4

掌握 Vue 官方路由解决方案，构建单页应用导航系统。

31. [路由基础与配置](./content/content-31.md)
    - 路由模式（history、hash）
    - 路由配置与注册
    - router-link 与 router-view
    - 编程式导航（push、replace）

32. [动态路由与嵌套路由](./content/content-32.md)
    - 动态路由参数
    - 路由参数响应式
    - 嵌套路由配置
    - 命名视图

33. [导航守卫](./content/content-33.md)
    - 全局守卫（beforeEach、afterEach）
    - 路由独享守卫
    - 组件内守卫
    - 守卫执行顺序
    - 守卫返回值与导航解析

34. [路由元信息与懒加载](./content/content-34.md)
    - meta 字段应用（权限、标题）
    - 路由懒加载与代码分割
    - 路由分组打包
    - prefetch 与 preload

---

## 第八部分：Pinia 状态管理

学习 Vue 3 官方推荐的状态管理方案。

35. [Pinia 基础与 Store 定义](./content/content-35.md)
    - Pinia vs Vuex 对比
    - 定义 Store（Options API、Setup API）
    - Store 注册与使用
    - Store 的 TypeScript 支持

36. [State、Getters、Actions](./content/content-36.md)
    - State 定义与访问
    - State 解构与响应式保持
    - Getters 缓存机制
    - Actions 异步处理
    - 访问其他 Store

37. [模块化与组合](./content/content-37.md)
    - 多 Store 组织
    - Store 间通信
    - 组合式 Store 模式
    - Store 命名空间

38. [插件与持久化](./content/content-38.md)
    - Pinia 插件机制
    - 状态持久化方案
    - DevTools 集成
    - SSR 状态同步

---

## 第九部分：工具链与工程化 (Tooling)

掌握 Vue 3 项目的开发工具链与工程化实践。

39. [Vite 构建工具](./content/content-39.md)
    - Vite 原理与优势
    - 开发服务器与 HMR
    - 生产构建优化
    - 环境变量与模式
    - 插件系统

40. [TypeScript 集成](./content/content-40.md)
    - Vue 3 + TypeScript 配置
    - 组件类型定义
    - Composables 类型推断
    - 全局属性类型扩展
    - 类型体操与工具类型

41. [代码规范与 ESLint](./content/content-41.md)
    - ESLint 配置
    - Vue 官方代码规范
    - Prettier 集成
    - Git Hooks 与 Husky
    - Commitlint

42. [测试](./content/content-42.md)
    - 单元测试（Vitest）
    - 组件测试（@vue/test-utils）
    - E2E 测试（Playwright/Cypress）
    - 测试覆盖率
    - Mock 与 Stub

---

## 第十部分：性能优化与最佳实践

学习 Vue 3 性能优化技巧与企业级项目最佳实践。

43. [响应式性能优化](./content/content-43.md)
    - 避免不必要的响应式转换
    - shallowRef 与大数据优化
    - computed 缓存策略
    - 响应式调试与追踪

44. [虚拟列表与懒加载](./content/content-44.md)
    - 虚拟滚动原理
    - vue-virtual-scroller 使用
    - 图片懒加载
    - 无限滚动实现

45. [编译优化原理](./content/content-45.md)
    - 静态提升（hoistStatic）
    - 补丁标记（PatchFlags）
    - 树结构打平（Block Tree）
    - 缓存事件处理器
    - 编译优化配置

46. [SSR 与 Nuxt.js](./content/content-46.md)
    - SSR 原理与优势
    - Vue 3 SSR 实现
    - Hydration 机制
    - Nuxt 3 框架
    - SEO 优化

47. [项目结构与代码组织](./content/content-47.md)
    - 大型项目目录结构
    - 组件分层（基础、业务、页面）
    - Composables 组织
    - 样式架构
    - 模块划分策略

48. [常见踩坑与解决方案](./content/content-48.md)
    - 响应式丢失问题
    - ref 自动解包陷阱
    - nextTick 使用场景
    - v-if 与 v-for 优先级
    - KeepAlive 缓存失效
    - 路由导航重复
    - TypeScript 类型报错

---

## 附录

- [面试题汇总（50 题）](./quiz/quiz.md)
- [Vue 3 vs Vue 2 迁移指南](./content/content-49.md)
- [Vue 3 生态与资源推荐](./content/content-50.md)

---

## 学习建议

1. **循序渐进**：按大纲顺序学习，每个部分都是后续内容的基础
2. **动手实践**：每学完一个小节，务必编写代码验证理解
3. **深入原理**：不仅要会用，更要理解背后的设计思想
4. **结合项目**：将所学知识应用到实际项目中
5. **关注生态**：掌握 Router、Pinia、Vite 等配套工具
6. **性能优先**：始终保持性能意识，编写高效代码
7. **TypeScript**：建议从一开始就使用 TypeScript 开发

---

**预计学习时间**：4-6 周（每天 2-3 小时）

**适合人群**：
- 有 JavaScript 基础的前端开发者
- Vue 2 开发者希望升级到 Vue 3
- 其他框架开发者转向 Vue 3
- 希望系统掌握 Vue 3 的学习者
