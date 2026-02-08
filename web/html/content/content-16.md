# 布局（Layout）与绘制（Paint）

## 核心概念

**布局**（Layout/Reflow）是计算元素几何信息的过程，**绘制**（Paint）是将像素绘制到屏幕的过程。

```
渲染树 → 布局（计算位置/尺寸）→ 绘制（填充像素）→ 合成 → 显示
```

**后端类比**：
- 布局 ≈ 查询执行计划
- 绘制 ≈ 结果序列化
- 合成 ≈ 响应组装

## 布局计算：盒模型与流式布局

### 盒模型

```
┌──────────────────────────────┐
│        margin (外边距)        │
│  ┌──────────────────────┐    │
│  │   border (边框)      │    │
│  │  ┌──────────────┐    │    │
│  │  │ padding (内边距)  │    │
│  │  │  ┌────────┐  │    │    │
│  │  │  │content │  │    │    │
│  │  │  └────────┘  │    │    │
│  │  └──────────────┘    │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
```

**盒模型属性**：
```css
.box {
  width: 200px;          /* 内容宽度 */
  height: 100px;         /* 内容高度 */
  padding: 20px;         /* 内边距 */
  border: 1px solid #000; /* 边框 */
  margin: 10px;          /* 外边距 */
}

/* 实际占用空间 = 200 + 20*2 + 1*2 + 10*2 = 262px */
```

**box-sizing 属性**：
```css
/* content-box（默认） */
.box1 {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  /* 实际宽度: 200 + 20*2 = 240px */
}

/* border-box */
.box2 {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  /* 实际宽度: 200px（包含 padding） */
}
```

**后端类比**：类似于数据结构的内存布局。

### 流式布局

```html
<div style="width: 600px;">
  <div style="width: 200px; float: left;">左侧</div>
  <div style="width: 200px; float: left;">中间</div>
  <div style="width: 200px; float: left;">右侧</div>
</div>
```

**布局过程**：
1. 计算父容器宽度：600px
2. 计算第一个子元素：左上角，宽200px
3. 计算第二个子元素：第一个元素右侧，宽200px
4. 计算第三个子元素：第二个元素右侧，宽200px

## 重排（Reflow）与重绘（Repaint）

### 重排（Reflow）

**定义**：重新计算元素的几何属性。

**触发条件**：
```javascript
// 修改几何属性
element.style.width = '300px';
element.style.height = '200px';
element.style.padding = '20px';
element.style.margin = '10px';

// 修改布局方式
element.style.display = 'block';
element.style.position = 'absolute';

// 添加/删除元素
parent.appendChild(child);
element.remove();

// 获取布局信息（强制同步布局）
element.offsetWidth;
element.offsetHeight;
element.clientWidth;
element.scrollTop;
```

**成本**：高（需要重新计算整个渲染树）

### 重绘（Repaint）

**定义**：重新绘制元素外观，不影响布局。

**触发条件**：
```javascript
// 修改视觉属性
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';
element.style.boxShadow = '0 0 10px #000';
```

**成本**：中（不需要重新布局）

### 性能对比

```javascript
// ❌ 慢：多次重排
for (let i = 0; i < 100; i++) {
  element.style.left = i + 'px';  // 100次重排
}

// ✅ 快：使用 transform（不触发重排）
element.style.transform = 'translateX(100px)';

// ✅ 快：批量操作
element.style.cssText = 'left: 100px; top: 100px;';
```

**后端类比**：
- 重排 ≈ 数据库表重建
- 重绘 ≈ 更新索引

## 图层合成与硬件加速

### 图层（Layer）

```css
/* 创建新图层 */
.layer {
  /* 方法1：transform 3D */
  transform: translateZ(0);
  
  /* 方法2：will-change */
  will-change: transform;
  
  /* 方法3：opacity 动画 */
  opacity: 0.99;
}
```

**图层的优势**：
- 独立绘制
- GPU 加速
- 不影响其他图层

**图层的成本**：
- 内存占用
- 合成开销

### 硬件加速

```css
/* 使用 GPU 加速的属性 */
.accelerated {
  transform: translate3d(0, 0, 0);
  opacity: 0.9;
}

/* 不使用 GPU 的属性 */
.not-accelerated {
  left: 100px;
  top: 100px;
}
```

**后端类比**：类似于 CPU vs GPU 计算。

## 后端类比：查询优化、缓存失效

### 重排 ≈ 数据库查询优化

```javascript
// 前端：批量 DOM 操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);

// 后端：批量数据库插入
await db.transaction(async trx => {
  for (let i = 0; i < 1000; i++) {
    await trx('users').insert({ name: `User ${i}` });
  }
});
```

### 强制同步布局 ≈ N+1 查询

```javascript
// ❌ 强制同步布局（性能差）
for (let i = 0; i < 100; i++) {
  element.style.width = element.offsetWidth + 10 + 'px';
  // 每次 offsetWidth 都触发重排
}

// ✅ 优化：先读取，再写入
const width = element.offsetWidth;
for (let i = 0; i < 100; i++) {
  element.style.width = width + i * 10 + 'px';
}
```

**后端类比**：类似于避免 N+1 查询问题。

## 工程实践示例

### 场景 1：优化动画性能

```css
/* ❌ 会触发重排 */
@keyframes slide-bad {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ 只触发合成 */
@keyframes slide-good {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

.animated {
  animation: slide-good 1s;
  will-change: transform;
}
```

### 场景 2：虚拟滚动

```javascript
// 只渲染可见区域的元素
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    
    this.container.addEventListener('scroll', () => this.render());
    this.render();
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const visibleStart = Math.floor(scrollTop / this.itemHeight);
    const visibleEnd = Math.ceil((scrollTop + this.container.clientHeight) / this.itemHeight);
    
    // 只渲染可见元素
    const fragment = document.createDocumentFragment();
    for (let i = visibleStart; i < visibleEnd; i++) {
      const div = document.createElement('div');
      div.textContent = this.items[i];
      div.style.position = 'absolute';
      div.style.top = (i * this.itemHeight) + 'px';
      fragment.appendChild(div);
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  }
}
```

### 场景 3：批量 DOM 操作

```javascript
// ❌ 每次操作都触发重排
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  document.body.appendChild(div);
}

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}
document.body.appendChild(fragment);

// ✅ 或使用 innerHTML
const html = Array.from({ length: 1000 }, (_, i) => 
  `<div>${i}</div>`
).join('');
document.body.innerHTML = html;
```

## 常见误区

### 误区 1：频繁读取布局属性

**错误做法**：
```javascript
for (let i = 0; i < 100; i++) {
  const width = element.offsetWidth;  // 每次都触发重排
  element.style.width = width + 10 + 'px';
}
```

**正确做法**：
```javascript
const width = element.offsetWidth;  // 只读取一次
for (let i = 0; i < 100; i++) {
  element.style.width = width + i * 10 + 'px';
}
```

### 误区 2：过度使用 will-change

**错误做法**：
```css
* { will-change: transform; }  /* 所有元素都创建图层 */
```

**正确做法**：
```css
.animated { will-change: transform; }  /* 只对需要的元素 */
```

### 误区 3：忽略复合图层开销

**问题**：过多图层消耗大量内存

**优化**：合理使用，动画结束后移除 `will-change`

## 参考资源

- [MDN - Reflow and Repaint](https://developer.mozilla.org/en-US/docs/Glossary/Reflow)
- [Web.dev - Rendering Performance](https://web.dev/rendering-performance/)
- [Composite Layers](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count)
