# 第 30 章：渲染树构建

## 概述

渲染树（Render Tree）是浏览器渲染页面的关键数据结构，理解渲染树构建过程有助于性能优化。

---

## 一、渲染流程

### 1.1 整体流程

```
HTML → DOM树
  ↓
CSS → CSSOM树
  ↓
DOM + CSSOM → 渲染树（Render Tree）
  ↓
布局（Layout/Reflow）
  ↓
绘制（Paint）
  ↓
合成（Composite）
```

---

## 二、渲染树构建

### 2.1 构建过程

```
1. 从DOM根节点开始遍历
2. 跳过不可见节点
3. 匹配CSSOM规则
4. 计算样式
5. 生成渲染对象
```

### 2.2 跳过的节点

```html
<!-- 不在渲染树中 -->
<head></head>
<meta>
<script></script>
<style></style>

<!-- display: none -->
<div style="display: none;"></div>
```

> 📌 **注意**：`visibility: hidden`的元素在渲染树中，只是不可见。

---

## 三、样式计算

### 3.1 计算步骤

```
1. 层叠（Cascade）
2. 继承（Inheritance）
3. 值计算（Compute）
```

---

## 四、性能优化

### 4.1 减少重排

```javascript
// ❌ 触发多次重排
element.style.width = '100px';
const height = element.offsetHeight;  // 强制重排
element.style.height = height + 10 + 'px';

// ✅ 批量操作
const height = element.offsetHeight;
element.style.cssText = `width: 100px; height: ${height + 10}px;`;
```

### 4.2 使用transform

```css
/* ❌ 触发重排 */
.box { left: 100px; }

/* ✅ 只触发合成 */
.box { transform: translateX(100px); }
```

---

## 参考资料

- [Render-tree Construction](https://web.dev/critical-rendering-path-render-tree-construction/)

---

**导航**  
[上一章：第 29 章 - 响应式单位](./29-responsive-units.md)  
[返回目录](../README.md)  
[下一章：第 31 章 - 布局与绘制](./31-layout-paint.md)
