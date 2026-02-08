# 渲染树（Render Tree）的生成

## 核心概念

**渲染树**是 DOM 树和 CSSOM 树合并后的产物，只包含需要显示的内容。

```
DOM 树 + CSSOM 树 → 渲染树

DOM:
html
└── body
    ├── div
    └── p (display: none)

CSSOM:
div { color: red }
p { display: none }

渲染树:
body
└── div (color: red)
    // p 不在渲染树中
```

**后端类比**：
- DOM ≈ 数据模型
- CSSOM ≈ 业务规则
- 渲染树 ≈ 最终输出

## DOM + CSSOM → Render Tree

### 合并规则

```javascript
// 1. 遍历 DOM 树的每个可见节点
// 2. 为每个节点找到匹配的 CSSOM 规则
// 3. 生成渲染树节点

// 不包含在渲染树中的元素：
// - display: none
// - <head> 及其子元素
// - <script>
// - <meta>
```

### 示例

```html
<body>
  <div class="box">显示</div>
  <p style="display: none;">不显示</p>
  <span style="visibility: hidden;">占位但不可见</span>
</body>
```

**渲染树**：
```
body
├── div.box (显示)
└── span (占位但不可见，仍在渲染树中)
```

**后端类比**：类似于数据过滤和转换。

## display: none vs visibility: hidden

### display: none

```css
.hidden { display: none; }
```

**效果**：
- 不在渲染树中
- 不占空间
- 不响应事件
- 子元素也不显示

### visibility: hidden

```css
.invisible { visibility: hidden; }
```

**效果**：
- 在渲染树中
- 占空间
- 不响应事件
- 子元素可以设置 `visibility: visible` 显示

### 对比

```html
<div>
  <p style="display: none;">不占空间</p>
  <p>紧贴上方</p>
</div>

<div>
  <p style="visibility: hidden;">占空间</p>
  <p>有间距</p>
</div>
```

**后端类比**：
- `display: none` ≈ 数据不存在
- `visibility: hidden` ≈ 数据标记为已删除（软删除）

## 渲染树的裁剪与优化

### 视口外裁剪

```javascript
// 浏览器只渲染视口内的内容
// 视口外的元素不绘制（但仍在渲染树中）

// Content Visibility API（优化）
.section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### 图层优化

```css
/* 创建独立图层 */
.animated {
  will-change: transform;
  transform: translateZ(0);
}
```

**后端类比**：类似于查询优化、索引使用。

## 参考资源

- [MDN - Render Tree Construction](https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work)
- [Web.dev - Render-tree Construction](https://web.dev/critical-rendering-path-render-tree-construction/)
