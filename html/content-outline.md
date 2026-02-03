# HTML 系统化学习大纲

> 面向后端开发者的 HTML 深度学习路线图

---

## 第一部分：HTML 的本质与定位（基础篇）

### 1. HTML 不是标记语言，是文档协议
[1.1 HTML 的角色定位：文档系统 vs 数据格式](./content/content-1.md)
- HTML vs JSON/XML：为什么需要语义而非纯数据
- HTML 作为浏览器渲染协议的本质
- 后端视角：HTML ≈ HTTP Response Body + 结构约束

[1.2 HTML 文档的生命周期](./content/content-2.md)
- 从网络传输到 DOM 树的完整链路
- HTML 解析与执行的分阶段模型
- 对比后端：请求处理管线 vs HTML 渲染管线

---

## 第二部分：文档结构与语义模型（基础篇）

### 2. HTML 文档模型：结构化文档的设计哲学

[2.1 HTML 文档的顶层结构](./content/content-3.md)
- DOCTYPE、html、head、body 的职责划分
- 为什么需要 head：元数据与资源声明
- 文档结构的约束规则与验证机制

[2.2 语义化标签体系](./content/content-4.md)
- 语义化的真实价值：可访问性、SEO、维护性
- 内容分区标签：header、nav、main、article、section、aside、footer
- 后端类比：领域模型的边界与职责

[2.3 文本语义与信息层级](./content/content-5.md)
- 标题系统：h1-h6 的层级规则
- 段落与列表：p、ul、ol、dl 的语义差异
- 强调与引用：strong、em、blockquote、cite
- 对比后端：日志级别、数据分类

---

## 第三部分：标签系统与内容模型（进阶篇）

### 3. HTML 标签的分类体系

[3.1 内容模型（Content Model）](./content/content-6.md)
- 七大内容类别：Metadata、Flow、Sectioning、Heading、Phrasing、Embedded、Interactive
- 标签嵌套规则：为什么 p 不能包含 div
- 内容模型的验证与约束机制

[3.2 块级元素与内联元素](./content/content-7.md)
- 块级与内联的本质：布局容器 vs 文本流
- display 属性与标签默认行为
- 常见误区：div/span 滥用与语义缺失

[3.3 表单系统：HTML 的交互模型](./content/content-8.md)
- 表单元素的完整生命周期
- 表单验证：HTML5 原生约束 vs JS 验证
- 表单提交的数据序列化机制
- 后端视角：表单 ≈ API 请求体

[3.4 多媒体与嵌入内容](./content/content-9.md)
- img、video、audio：资源加载与渲染
- iframe：文档嵌套的安全边界
- canvas、svg：图形渲染的两种范式

---

## 第四部分：加载与解析机制（进阶篇）

### 4. 浏览器如何处理 HTML

[4.1 HTML 解析器工作原理](./content/content-10.md)
- 字节流 → Token → DOM Tree 的转换过程
- 解析器的容错机制：为什么错误的 HTML 也能渲染
- 解析阻塞：script 与 link 的影响

[4.2 资源加载的优先级与时序](./content/content-11.md)
- 关键渲染路径（Critical Rendering Path）
- 资源加载的优先级规则
- preload、prefetch、dns-prefetch 的使用场景
- 后端类比：数据库连接池、缓存预热

[4.3 Script 标签的执行模型](./content/content-12.md)
- 同步脚本：阻塞解析的原因
- defer vs async：执行时机的差异
- module 脚本的加载与执行
- 工程实践：如何优化首屏加载

[4.4 Link 标签与样式表加载](./content/content-13.md)
- CSS 为什么阻塞渲染
- 样式表的加载与 CSSOM 构建
- 关键 CSS 与首屏优化策略

---

## 第五部分：DOM 与渲染管线（进阶篇）

### 5. 从 HTML 到视图的转换

[5.1 DOM 树的构建与特性](./content/content-14.md)
- DOM ≈ 内存对象模型：树形结构的设计
- DOM API 与 HTML 的映射关系
- DOM 的性能边界：为什么频繁操作很慢

[5.2 渲染树（Render Tree）的生成](./content/content-15.md)
- DOM + CSSOM → Render Tree
- display: none vs visibility: hidden
- 渲染树的裁剪与优化

[5.3 布局（Layout）与绘制（Paint）](./content/content-16.md)
- 布局计算：盒模型与流式布局
- 重排（Reflow）与重绘（Repaint）
- 图层合成与硬件加速
- 后端类比：查询优化、缓存失效

[5.4 HTML 与 CSS/JS 的协作边界](./content/content-17.md)
- HTML 负责结构，CSS 负责样式，JS 负责行为
- 职责混乱的典型问题
- 样式内联 vs 外部样式表的权衡

---

## 第六部分：HTML5 新特性与现代标准（高级篇）

### 6. HTML5 的架构升级

[6.1 语义化标签的增强](./content/content-18.md)
- 新增结构标签的设计动机
- 向后兼容性处理策略
- 渐进式增强（Progressive Enhancement）

[6.2 HTML5 表单增强](./content/content-19.md)
- 新增输入类型：email、url、date、range 等
- 表单属性：placeholder、required、pattern
- 自定义验证与原生验证的结合

[6.3 Web API 与 HTML 的集成](./content/content-20.md)
- 本地存储：localStorage、sessionStorage
- 离线应用：Application Cache、Service Worker
- 拖放 API、文件 API
- 后端视角：浏览器作为运行时环境

[6.4 自定义元素与 Web Components](./content/content-21.md)
- Custom Elements：扩展 HTML 标签体系
- Shadow DOM：样式与结构的封装
- HTML Templates：可复用的文档片段
- 对比后端：组件化 vs 模块化

---

## 第七部分：服务端渲染与同构应用（高级篇）

### 7. HTML 在现代前端架构中的演进

[7.1 CSR vs SSR vs SSG](./content/content-22.md)
- 客户端渲染（CSR）：HTML 作为容器
- 服务端渲染（SSR）：HTML 作为完整文档
- 静态生成（SSG）：构建时生成 HTML
- 架构选择的权衡与适用场景

[7.2 SSR 的实现原理](./content/content-23.md)
- 服务端 HTML 生成：模板引擎 vs 组件渲染
- 数据注入与状态序列化
- 首屏 HTML 的完整性要求
- 后端视角：SSR ≈ 动态页面生成

[7.3 Hydration：从静态到动态](./content/content-24.md)
- Hydration 的工作原理
- HTML 与 JS 状态的同步问题
- Partial Hydration 与 Islands Architecture
- 常见问题：Hydration Mismatch

[7.4 流式渲染与渐进式加载](./content/content-25.md)
- HTTP Streaming 与 HTML 分块传输
- React Server Components 的设计思路
- 边缘渲染（Edge Rendering）
- 对比后端：分页查询、流式响应

---

## 第八部分：HTML 的性能与优化（高级篇）

### 8. 构建高性能的 HTML 文档

[8.1 HTML 体积与传输优化](./content/content-26.md)
- HTML 压缩：Gzip、Brotli
- 内联资源 vs 外部资源的权衡
- 减少 DOM 深度与节点数量
- 后端类比：响应体优化、序列化成本

[8.2 首屏渲染优化策略](./content/content-27.md)
- Above the Fold 优化
- 关键资源的识别与优先加载
- 骨架屏与占位符
- 懒加载与渐进式图片

[8.3 HTML 解析性能](./content/content-28.md)
- 避免解析阻塞的最佳实践
- Script 放置位置的影响
- 减少重排重绘的 HTML 结构设计
- 性能监控：Performance API

---

## 第九部分：HTML 的工程化实践（高级篇）

### 9. 现代前端工程中的 HTML

[9.1 HTML 模板系统](./content/content-29.md)
- 模板引擎的设计原理：EJS、Pug、Handlebars
- JSX：HTML 的 JavaScript 化
- Vue Template：声明式模板
- 模板编译与运行时渲染

[9.2 组件化开发中的 HTML](./content/content-30.md)
- 组件的 HTML 结构设计原则
- Slot 与内容分发
- HTML 在组件库中的抽象层次
- 后端视角：模板方法模式、策略模式

[9.3 HTML 的测试与验证](./content/content-31.md)
- HTML 结构的单元测试
- 语义化验证工具
- 可访问性（A11y）测试
- SEO 检测与优化

[9.4 HTML 的构建与优化工具](./content/content-32.md)
- Webpack、Vite 对 HTML 的处理
- HTML 的代码分割与按需加载
- HTML 的版本管理与缓存策略

---

## 第十部分：跨平台与边界场景（高级篇）

### 10. HTML 的扩展与变体

[10.1 移动端 HTML](./content/content-33.md)
- Viewport 与响应式设计
- 触摸事件与移动交互
- PWA 与移动端 HTML 优化
- WebView 中的 HTML 渲染

[10.2 邮件 HTML](./content/content-34.md)
- 邮件 HTML 的限制与约束
- 表格布局的回归
- 邮件客户端的兼容性
- 对比后端：受限环境下的协议实现

[10.3 小程序与跨端框架](./content/content-35.md)
- 小程序的类 HTML 语法
- React Native、Flutter 中的 HTML 概念映射
- 跨端渲染的本质：DSL 转换

[10.4 未来的 HTML](./content/content-36.md)
- HTML 标准的演进方向
- Declarative Shadow DOM
- Container Queries
- HTML 与 WebAssembly 的协作

---

## 学习路径建议

**第 1-2 周（基础篇）**：
- 完成第一、二部分（content-1 到 content-5）
- 建立 HTML 的整体认知，理解其在前端架构中的定位

**第 3-4 周（进阶篇）**：
- 完成第三、四、五部分（content-6 到 content-17）
- 深入理解标签体系、加载机制、渲染管线

**第 5-6 周（高级篇）**：
- 完成第六、七、八部分（content-18 到 content-28）
- 掌握 HTML5 新特性、SSR 原理、性能优化

**第 7-8 周（工程化）**：
- 完成第九、十部分（content-29 到 content-36）
- 理解 HTML 在现代前端工程中的实践

**第 9-10 周（巩固）**：
- 完成面试题练习（quiz/quiz.md）
- 回顾核心知识点，建立完整知识图谱

---

## 核心学习原则

1. **不要背标签，理解体系**：HTML 是一个结构化的文档系统，重点是理解其设计哲学
2. **对比后端概念**：利用已有的后端知识，建立类比和映射
3. **关注执行流程**：从网络传输到屏幕渲染的完整链路
4. **理解职责边界**：HTML、CSS、JS 各自的职责与协作方式
5. **工程化视角**：在真实项目中如何设计和优化 HTML 结构

---

## 参考资源

- [HTML Living Standard](https://html.spec.whatwg.org/)
- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [W3C HTML5 Specification](https://www.w3.org/TR/html52/)
- [Chrome Developers - Rendering Performance](https://web.dev/rendering-performance/)
- [Web.dev - Critical Rendering Path](https://web.dev/critical-rendering-path/)
