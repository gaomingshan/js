# TypeScript 系统化学习大纲

## 学习目标
- 理解 TypeScript 类型系统设计思想与工作原理
- 掌握类型推断、类型体操的核心能力
- 具备在前端工程中应用 TypeScript 的实战能力
- 理解类型安全与运行时的关系边界

---

## 第一部分：类型系统基础（基础）

### 1. [TypeScript 核心理念与设计哲学](./content/content-1.md)
- 为什么需要 TypeScript：JavaScript 的类型痛点
- 结构类型系统（Structural Type System）vs 名义类型系统
- 类型擦除：编译时类型 vs 运行时值
- 渐进式类型系统：any 的设计意图与边界
- TypeScript 的定位：超集而非替代

### 2. [基础类型与类型注解](./content/content-2.md)
- 原始类型：string、number、boolean、symbol、bigint
- 特殊类型：null、undefined、void、never
- 字面量类型与类型收窄
- 数组与元组：类型安全的集合
- 对象类型：索引签名与可选属性
- 函数类型：参数与返回值的类型标注

### 3. [类型推断与类型断言](./content/content-3.md)
- 类型推断的工作原理：从值到类型
- 最佳通用类型（Best Common Type）
- 上下文类型推断（Contextual Typing）
- 类型断言的使用场景与风险
- as const：字面量类型的固化
- 非空断言操作符的边界

---

## 第二部分：类型系统进阶（进阶）

### 4. [联合类型与交叉类型](./content/content-4.md)
- 联合类型的本质：类型的或运算
- 可辨识联合（Discriminated Unions）的应用
- 交叉类型的本质：类型的与运算
- 联合类型 vs 交叉类型的对比
- 类型收窄技术：typeof、instanceof、in、自定义类型守卫
- 工程实践：状态机、错误处理的类型建模

### 5. [接口与类型别名](./content/content-5.md)
- interface vs type：设计差异与选择策略
- 接口的继承与合并（Declaration Merging）
- 索引签名与映射类型的应用
- 只读属性与可选属性的语义
- 函数重载的类型设计
- 工程实践：API 响应、组件 Props 的类型定义

### 6. [泛型系统](./content/content-6.md)
- 泛型的本质：类型参数化
- 泛型函数、泛型接口、泛型类
- 泛型约束：extends 的语义
- 默认泛型参数
- 泛型的协变与逆变
- 工程实践：通用组件、工具函数的类型设计

### 7. [类与面向对象类型](./content/content-7.md)
- 类的类型：实例类型 vs 构造函数类型
- 访问修饰符：public、private、protected
- 抽象类与抽象成员
- 类的继承与多态的类型约束
- 装饰器的类型系统（实验性）
- 工程实践：Vue/React 类组件的类型设计

---

## 第三部分：高级类型系统（高级）

### 8. [高级类型操作](./content/content-8.md)
- 映射类型：Partial、Required、Readonly、Pick、Omit
- 条件类型：extends 的高级用法
- infer 关键字：类型推断的元编程
- 模板字面量类型（Template Literal Types）
- 递归类型与类型体操
- 工程实践：深度只读、深度可选的实现

### 9. [类型系统的边界与陷阱](./content/content-9.md)
- any、unknown、never 的语义差异
- 类型兼容性：结构子类型的规则
- 函数参数的双向协变问题
- 索引访问类型的边界
- 循环依赖与类型递归的限制
- 工程实践：避免类型污染、类型断言的最佳实践

### 10. [类型体操与工具类型](./content/content-10.md)
- Utility Types 的实现原理
- 深度递归类型的设计模式
- 元组类型的高级操作
- 字符串类型的模式匹配
- 类型编程的性能优化
- 工程实践：自定义工具类型库

---

## 第四部分：工程实践（高级）

### 11. [TypeScript 配置与工程化](./content/content-11.md)
- tsconfig.json 核心配置详解
- strict 模式的各项检查规则
- 模块解析策略：classic vs node
- 声明文件（.d.ts）的编写与使用
- 第三方库的类型支持：@types 与 DefinitelyTyped
- 工程实践：monorepo、path mapping 的配置

### 12. [前端框架中的 TypeScript](./content/content-12.md)
- React + TypeScript：组件、Hooks、事件的类型
- Vue + TypeScript：Composition API 的类型推断
- 状态管理库的类型设计：Redux、Pinia
- 路由库的类型安全：React Router、Vue Router
- 工程实践：类型安全的组件库开发

### 13. [TypeScript 最佳实践与性能优化](./content/content-13.md)
- 类型定义的组织与复用策略
- 避免过度类型体操
- 编译性能优化：项目引用、增量编译
- 类型覆盖率与类型测试
- 从 JavaScript 迁移的渐进策略
- 工程实践：大型项目的类型设计模式

---

## 学习路径建议

**基础阶段（1-3 节）**
- 重点：理解类型系统的设计哲学
- 实践：为现有 JS 代码添加类型注解
- 时间：1-2 周

**进阶阶段（4-7 节）**
- 重点：掌握类型组合与泛型设计
- 实践：设计类型安全的工具函数与组件
- 时间：2-3 周

**高级阶段（8-10 节）**
- 重点：理解类型系统边界与高级技巧
- 实践：实现自定义工具类型
- 时间：2-3 周

**工程阶段（11-13 节）**
- 重点：工程化配置与最佳实践
- 实践：在真实项目中应用 TypeScript
- 时间：持续实践

---

## 参考资源
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)

---

## 面试题汇总
[TypeScript 面试题汇总（约100题）](./quiz/quiz.md)
