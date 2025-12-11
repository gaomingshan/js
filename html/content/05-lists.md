# 第 5 章：列表与定义

## 概述

列表是组织信息的重要方式。HTML 提供三种列表类型：无序列表、有序列表和定义列表，合理使用列表能让内容更有条理。

## 一、无序列表

### 1.1 基本用法

```html
<ul>
  <li>苹果</li>
  <li>香蕉</li>
  <li>橙子</li>
</ul>
```

**渲染效果：**
- 苹果
- 香蕉
- 橙子

### 1.2 应用场景

```html
<!-- 导航菜单 -->
<nav>
  <ul>
    <li><a href="#home">首页</a></li>
    <li><a href="#about">关于</a></li>
    <li><a href="#contact">联系</a></li>
  </ul>
</nav>

<!-- 特性列表 -->
<ul>
  <li>快速响应</li>
  <li>易于使用</li>
  <li>安全可靠</li>
</ul>
```

### 1.3 嵌套列表

```html
<ul>
  <li>水果
    <ul>
      <li>苹果</li>
      <li>香蕉</li>
    </ul>
  </li>
  <li>蔬菜
    <ul>
      <li>白菜</li>
      <li>萝卜</li>
    </ul>
  </li>
</ul>
```

## 二、有序列表

### 2.1 基本用法

```html
<ol>
  <li>第一步：准备材料</li>
  <li>第二步：开始制作</li>
  <li>第三步：完成</li>
</ol>
```

**渲染效果：**
1. 第一步：准备材料
2. 第二步：开始制作
3. 第三步：完成

### 2.2 属性

#### **type 属性：编号类型**

```html
<!-- 数字（默认） -->
<ol type="1">
  <li>Item</li>
</ol>

<!-- 大写字母 -->
<ol type="A">
  <li>Item</li>
</ol>

<!-- 小写字母 -->
<ol type="a">
  <li>Item</li>
</ol>

<!-- 大写罗马数字 -->
<ol type="I">
  <li>Item</li>
</ol>

<!-- 小写罗马数字 -->
<ol type="i">
  <li>Item</li>
</ol>
```

#### **start 属性：起始编号**

```html
<ol start="5">
  <li>第五项</li>
  <li>第六项</li>
  <li>第七项</li>
</ol>
```

#### **reversed 属性：倒序**

```html
<ol reversed>
  <li>第三名</li>
  <li>第二名</li>
  <li>第一名</li>
</ol>
```

**渲染效果：**
3. 第三名
2. 第二名
1. 第一名

### 2.3 value 属性：指定编号

```html
<ol>
  <li value="1">第一步</li>
  <li value="2">第二步</li>
  <li value="5">第五步（跳过3和4）</li>
  <li>第六步</li>  <!-- 继续递增 -->
</ol>
```

### 2.4 应用场景

```html
<!-- 步骤说明 -->
<h2>安装步骤</h2>
<ol>
  <li>下载安装包</li>
  <li>运行安装程序</li>
  <li>按照提示完成安装</li>
</ol>

<!-- 排行榜 -->
<h2>销量排行</h2>
<ol>
  <li>产品 A</li>
  <li>产品 B</li>
  <li>产品 C</li>
</ol>
```

## 三、定义列表

### 3.1 基本结构

```html
<dl>
  <dt>术语 1</dt>
  <dd>术语 1 的定义</dd>
  
  <dt>术语 2</dt>
  <dd>术语 2 的定义</dd>
</dl>
```

**渲染效果：**

**术语 1**
&nbsp;&nbsp;术语 1 的定义

**术语 2**
&nbsp;&nbsp;术语 2 的定义

### 3.2 多对一和一对多

```html
<!-- 多个术语，一个定义 -->
<dl>
  <dt>HTML</dt>
  <dt>HyperText Markup Language</dt>
  <dd>超文本标记语言，用于创建网页的标准标记语言。</dd>
</dl>

<!-- 一个术语，多个定义 -->
<dl>
  <dt>JavaScript</dt>
  <dd>一种高级编程语言</dd>
  <dd>主要用于网页开发</dd>
  <dd>也可用于服务器端（Node.js）</dd>
</dl>
```

### 3.3 应用场景

#### **术语表**

```html
<dl>
  <dt>CSS</dt>
  <dd>层叠样式表（Cascading Style Sheets），用于控制网页的样式和布局。</dd>
  
  <dt>DOM</dt>
  <dd>文档对象模型（Document Object Model），是 HTML 和 XML 文档的编程接口。</dd>
  
  <dt>API</dt>
  <dd>应用程序编程接口（Application Programming Interface），软件组件之间的接口规范。</dd>
</dl>
```

#### **元数据**

```html
<article>
  <h1>产品详情</h1>
  <dl>
    <dt>品牌</dt>
    <dd>Apple</dd>
    
    <dt>型号</dt>
    <dd>iPhone 15 Pro Max</dd>
    
    <dt>颜色</dt>
    <dd>深空黑色</dd>
    
    <dt>存储容量</dt>
    <dd>256GB</dd>
    
    <dt>价格</dt>
    <dd>¥9,999</dd>
  </dl>
</article>
```

#### **FAQ（常见问题）**

```html
<section>
  <h2>常见问题</h2>
  <dl>
    <dt>如何注册账号？</dt>
    <dd>点击页面右上角的"注册"按钮，填写必要信息即可完成注册。</dd>
    
    <dt>忘记密码怎么办？</dt>
    <dd>点击登录页面的"忘记密码"链接，通过邮箱找回密码。</dd>
    
    <dt>如何联系客服？</dt>
    <dd>可以通过邮件 support@example.com 或电话 400-123-4567 联系我们。</dd>
  </dl>
</section>
```

## 四、列表嵌套

### 4.1 无序列表嵌套

```html
<ul>
  <li>前端技术
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript
        <ul>
          <li>ES6+</li>
          <li>TypeScript</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>后端技术
    <ul>
      <li>Node.js</li>
      <li>Python</li>
    </ul>
  </li>
</ul>
```

### 4.2 有序列表嵌套

```html
<ol>
  <li>第一章：基础
    <ol type="a">
      <li>1.1 什么是 HTML</li>
      <li>1.2 基本结构</li>
    </ol>
  </li>
  <li>第二章：进阶
    <ol type="a">
      <li>2.1 语义化</li>
      <li>2.2 可访问性</li>
    </ol>
  </li>
</ol>
```

### 4.3 混合嵌套

```html
<ol>
  <li>准备工作
    <ul>
      <li>下载工具</li>
      <li>安装环境</li>
    </ul>
  </li>
  <li>开始开发
    <ul>
      <li>创建项目</li>
      <li>编写代码</li>
    </ul>
  </li>
</ol>
```

## 五、列表样式（CSS）

虽然样式由 CSS 控制，但了解常用样式有助于理解列表的应用。

```html
<style>
/* 移除默认样式 */
ul {
  list-style: none;
  padding: 0;
}

/* 自定义标记 */
ul.custom {
  list-style-type: square;  /* 方块 */
}

/* 使用图片作为标记 */
ul.icon-list {
  list-style-image: url('icon.png');
}

/* 横向列表（导航） */
nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-right: 20px;
}
</style>
```

## 六、语义化与可访问性

> **📌 最佳实践**
> 
> 1. **列表必须包含列表项**
> ```html
> <!-- ❌ 错误 -->
> <ul>
>   <div>不是列表项</div>
> </ul>
> 
> <!-- ✅ 正确 -->
> <ul>
>   <li>列表项</li>
> </ul>
> ```
> 
> 2. **选择合适的列表类型**
> - 无序列表：项目没有顺序关系
> - 有序列表：项目有明确顺序
> - 定义列表：术语和定义的配对
> 
> 3. **导航使用列表**
> ```html
> <nav>
>   <ul>
>     <li><a href="#home">首页</a></li>
>     <li><a href="#about">关于</a></li>
>   </ul>
> </nav>
> ```

## 七、实战示例

### 7.1 商品特性列表

```html
<section>
  <h2>产品特性</h2>
  <ul>
    <li><strong>快速响应：</strong>毫秒级加载速度</li>
    <li><strong>安全可靠：</strong>银行级数据加密</li>
    <li><strong>易于使用：</strong>直观的用户界面</li>
    <li><strong>全平台支持：</strong>Web、iOS、Android</li>
  </ul>
</section>
```

### 7.2 教程目录

```html
<nav>
  <h2>课程目录</h2>
  <ol>
    <li>HTML 基础
      <ol type="a">
        <li>什么是 HTML</li>
        <li>文档结构</li>
        <li>常用标签</li>
      </ol>
    </li>
    <li>CSS 样式
      <ol type="a">
        <li>选择器</li>
        <li>盒模型</li>
        <li>布局</li>
      </ol>
    </li>
    <li>JavaScript 编程
      <ol type="a">
        <li>基本语法</li>
        <li>DOM 操作</li>
        <li>事件处理</li>
      </ol>
    </li>
  </ol>
</nav>
```

### 7.3 技术栈说明

```html
<section>
  <h2>技术栈</h2>
  <dl>
    <dt>前端框架</dt>
    <dd>React 18</dd>
    <dd>Vue 3</dd>
    
    <dt>状态管理</dt>
    <dd>Redux Toolkit</dd>
    <dd>Pinia</dd>
    
    <dt>构建工具</dt>
    <dd>Vite</dd>
    <dd>Webpack 5</dd>
    
    <dt>UI 组件库</dt>
    <dd>Ant Design</dd>
    <dd>Element Plus</dd>
  </dl>
</section>
```

## 参考资料

- [MDN - `<ul>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/ul)
- [MDN - `<ol>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/ol)
- [MDN - `<dl>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dl)

---

**上一章** ← [第 4 章：文本内容标签](./04-text-content.md)  
**下一章** → [第 6 章：链接与导航](./06-links-navigation.md)
