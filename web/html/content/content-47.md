# HTML5 原生交互组件

## 核心概念

HTML5 及后续标准持续引入原生交互组件，减少对 JavaScript 组件库的依赖。这些原生元素自带**可访问性、键盘交互和语义**，是"零 JS 依赖"的交互方案。

**后端类比**：
- 原生 HTML 组件 ≈ 标准库（开箱即用、经过充分测试）
- JS 组件库 ≈ 第三方依赖（功能更丰富但增加复杂度）
- 选型原则与后端一致：能用标准库解决的，不引入第三方

## `<dialog>` 元素

### 基本用法

```html
<!-- 非模态对话框 -->
<dialog id="info-dialog">
  <h2>提示信息</h2>
  <p>操作已完成。</p>
  <button onclick="this.closest('dialog').close()">确定</button>
</dialog>

<button onclick="document.getElementById('info-dialog').show()">
  显示提示
</button>
```

```html
<!-- 模态对话框（带背景遮罩） -->
<dialog id="confirm-dialog">
  <h2>确认删除</h2>
  <p>此操作不可撤销，确定要删除吗？</p>
  <form method="dialog">
    <button value="cancel">取消</button>
    <button value="confirm">确认删除</button>
  </form>
</dialog>

<button onclick="document.getElementById('confirm-dialog').showModal()">
  删除
</button>
```

### show() vs showModal()

| 方法 | 行为 |
|------|------|
| `show()` | 非模态打开，不阻断页面交互，无遮罩 |
| `showModal()` | 模态打开，背景不可交互，显示 `::backdrop` 遮罩，Esc 关闭 |

### 模态框的完整实现

```html
<dialog id="modal" aria-labelledby="modal-title">
  <form method="dialog">
    <header>
      <h2 id="modal-title">编辑个人信息</h2>
      <button type="submit" value="close" aria-label="关闭">✕</button>
    </header>
    
    <main>
      <div class="form-group">
        <label for="display-name">昵称</label>
        <input type="text" id="display-name" name="displayName" required>
      </div>
      <div class="form-group">
        <label for="bio">简介</label>
        <textarea id="bio" name="bio" rows="3"></textarea>
      </div>
    </main>
    
    <footer>
      <button type="submit" value="cancel">取消</button>
      <button type="submit" value="save">保存</button>
    </footer>
  </form>
</dialog>
```

```javascript
const modal = document.getElementById('modal');

// 打开
function openModal() {
  modal.showModal();
}

// 关闭时获取返回值
modal.addEventListener('close', () => {
  console.log('返回值:', modal.returnValue);  // "cancel" / "save" / "close"
  
  if (modal.returnValue === 'save') {
    const formData = new FormData(modal.querySelector('form'));
    // 处理保存逻辑
  }
});

// 点击遮罩关闭
modal.addEventListener('click', (e) => {
  if (e.target === modal) {  // 点击的是 dialog 本身（即遮罩区域）
    modal.close('cancel');
  }
});
```

### `::backdrop` 伪元素

```css
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* 动画 */
dialog[open] {
  animation: fade-in 0.2s ease-out;
}

dialog[open]::backdrop {
  animation: backdrop-fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes backdrop-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### `<form method="dialog">`

当 `<form>` 的 `method` 为 `dialog` 时，提交表单不会发送 HTTP 请求，而是关闭对话框，并将提交按钮的 `value` 设为 `dialog.returnValue`。

```html
<dialog id="rating-dialog">
  <h2>评价体验</h2>
  <form method="dialog">
    <button value="1">⭐</button>
    <button value="2">⭐⭐</button>
    <button value="3">⭐⭐⭐</button>
    <button value="4">⭐⭐⭐⭐</button>
    <button value="5">⭐⭐⭐⭐⭐</button>
  </form>
</dialog>

<script>
document.getElementById('rating-dialog').addEventListener('close', function() {
  console.log('用户评分:', this.returnValue);  // "1" ~ "5"
});
</script>
```

### dialog 的原生能力

`showModal()` 打开的 dialog 自动具备：
- **焦点陷阱**：Tab 键只在 dialog 内循环
- **Esc 关闭**：按 Escape 键自动关闭
- **背景隔离**：背景内容不可交互
- **焦点恢复**：关闭后焦点回到触发元素
- **`::backdrop` 遮罩**：原生背景层

这些在 JS 组件库中需要大量代码实现的能力，`<dialog>` 一行 HTML 就解决了。

## `<details>` / `<summary>` 元素

### 基本用法

```html
<details>
  <summary>查看详细信息</summary>
  <p>这是展开后显示的详细内容。</p>
  <p>可以包含任意 HTML 元素。</p>
</details>
```

点击 `<summary>` 切换展开/收起状态，完全不需要 JavaScript。

### 默认展开

```html
<details open>
  <summary>常见问题</summary>
  <p>默认展开的内容...</p>
</details>
```

### FAQ 列表

```html
<section>
  <h2>常见问题</h2>
  
  <details>
    <summary>如何重置密码？</summary>
    <p>访问登录页面，点击"忘记密码"链接。系统将向您的注册邮箱发送重置链接，链接有效期为 24 小时。</p>
  </details>
  
  <details>
    <summary>支持哪些支付方式？</summary>
    <ul>
      <li>微信支付</li>
      <li>支付宝</li>
      <li>银行卡（Visa / MasterCard / UnionPay）</li>
    </ul>
  </details>
  
  <details>
    <summary>如何联系客服？</summary>
    <p>工作日 9:00-18:00 拨打 <a href="tel:400-123-4567">400-123-4567</a>，或发送邮件至 <a href="mailto:support@example.com">support@example.com</a>。</p>
  </details>
</section>
```

### 手风琴效果（互斥展开）

```html
<!-- name 属性：同名 details 互斥，展开一个自动关闭其他 -->
<details name="accordion">
  <summary>第一部分</summary>
  <p>第一部分内容...</p>
</details>

<details name="accordion">
  <summary>第二部分</summary>
  <p>第二部分内容...</p>
</details>

<details name="accordion">
  <summary>第三部分</summary>
  <p>第三部分内容...</p>
</details>
```

`name` 属性是较新的标准（Chrome 120+），实现了原生手风琴，无需 JS。

### 样式定制

```css
/* 自定义三角形标记 */
summary {
  list-style: none;  /* 移除默认三角形 */
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  font-weight: 600;
}

/* 移除 Safari 的默认标记 */
summary::-webkit-details-marker {
  display: none;
}

/* 自定义展开/收起图标 */
summary::before {
  content: '▸ ';
  transition: transform 0.2s;
}

details[open] > summary::before {
  content: '▾ ';
}

/* 展开内容的动画（有限支持） */
details[open] > :not(summary) {
  animation: slide-down 0.2s ease-out;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 事件监听

```javascript
const details = document.querySelector('details');

details.addEventListener('toggle', (e) => {
  if (details.open) {
    console.log('展开');
  } else {
    console.log('收起');
  }
});
```

## `<progress>` 与 `<meter>` 元素

### `<progress>`：进度条

表示任务的**完成进度**。

```html
<!-- 确定进度 -->
<label for="upload">上传进度：</label>
<progress id="upload" value="65" max="100">65%</progress>

<!-- 不确定进度（加载中） -->
<progress>加载中...</progress>
<!-- 不设 value 时显示为不确定状态（通常是动画条） -->
```

```javascript
// 动态更新进度
const progress = document.getElementById('upload');

async function uploadFile(file) {
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      progress.value = (e.loaded / e.total) * 100;
    }
  });
  
  xhr.open('POST', '/api/upload');
  xhr.send(file);
}
```

### `<meter>`：度量值

表示已知范围内的**标量测量值**，不是进度。

```html
<!-- 磁盘使用率 -->
<label for="disk">磁盘使用：</label>
<meter id="disk" value="0.7" min="0" max="1" 
  low="0.3" high="0.7" optimum="0.2">
  70%
</meter>

<!-- 考试成绩 -->
<label for="score">成绩：</label>
<meter id="score" value="82" min="0" max="100" 
  low="60" high="90" optimum="100">
  82分
</meter>

<!-- 电池电量 -->
<meter value="0.15" min="0" max="1" low="0.2" high="0.8" optimum="1">
  15%（低电量）
</meter>
```

| 属性 | 含义 |
|------|------|
| `value` | 当前值 |
| `min` / `max` | 值的范围 |
| `low` | 低值阈值 |
| `high` | 高值阈值 |
| `optimum` | 最优值 |

浏览器根据 `low`、`high`、`optimum` 自动改变颜色：
- 值在最优范围 → 绿色
- 值在次优范围 → 黄色
- 值在不良范围 → 红色

### progress vs meter

| 特性 | `<progress>` | `<meter>` |
|------|-------------|-----------|
| 语义 | 任务完成度 | 标量度量 |
| 典型场景 | 文件上传、安装进度 | 磁盘容量、评分、电量 |
| 不确定状态 | ✅ 支持 | ❌ 不支持 |
| 颜色分段 | ❌ | ✅（low/high/optimum） |

```html
<!-- ✅ 正确选择 -->
<progress value="3" max="5">步骤 3/5</progress>   <!-- 任务进度 -->
<meter value="0.85" max="1">85% 使用率</meter>      <!-- 度量值 -->

<!-- ❌ 混淆使用 -->
<progress value="85" max="100">磁盘 85%</progress>  <!-- 应该用 meter -->
<meter value="3" max="5">步骤 3/5</meter>            <!-- 应该用 progress -->
```

## Popover API

### 基本用法

Popover API 是较新的标准（Chrome 114+），提供原生弹出层能力。

```html
<!-- 触发按钮 -->
<button popovertarget="my-popover">显示提示</button>

<!-- 弹出内容 -->
<div id="my-popover" popover>
  <p>这是一个原生弹出提示。</p>
  <p>点击外部区域或按 Esc 关闭。</p>
</div>
```

无需一行 JavaScript，浏览器原生处理：
- 点击按钮显示/隐藏
- 点击外部区域自动关闭
- Esc 键关闭
- 焦点管理
- 渲染在顶层（`top layer`），不受 `z-index` 和 `overflow` 影响

### popover 类型

```html
<!-- auto（默认）：点击外部关闭，同时只能打开一个 -->
<div id="tip" popover="auto">自动关闭提示</div>

<!-- manual：必须显式关闭 -->
<div id="toast" popover="manual">手动关闭的通知</div>
```

### popovertarget 的行为控制

```html
<!-- 切换（默认） -->
<button popovertarget="tip" popovertargetaction="toggle">切换</button>

<!-- 仅显示 -->
<button popovertarget="tip" popovertargetaction="show">显示</button>

<!-- 仅隐藏 -->
<button popovertarget="tip" popovertargetaction="hide">隐藏</button>
```

### 工具提示（Tooltip）

```html
<button popovertarget="tooltip-1" popovertargetaction="toggle">
  帮助 ℹ️
</button>

<div id="tooltip-1" popover="auto" class="tooltip">
  此功能允许您导出数据为 CSV 格式。
</div>
```

```css
.tooltip {
  margin: 0;
  padding: 0.5rem 1rem;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 弹出动画 */
[popover]:popover-open {
  animation: popover-show 0.15s ease-out;
}

@keyframes popover-show {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

### Toast 通知

```html
<div id="toast" popover="manual" class="toast">
  ✓ 保存成功！
</div>
```

```javascript
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.showPopover();
  
  setTimeout(() => {
    toast.hidePopover();
  }, duration);
}
```

### JavaScript API

```javascript
const popover = document.getElementById('my-popover');

// 显示 / 隐藏
popover.showPopover();
popover.hidePopover();
popover.togglePopover();

// 事件
popover.addEventListener('beforetoggle', (e) => {
  console.log('即将变为:', e.newState);  // "open" 或 "closed"
});

popover.addEventListener('toggle', (e) => {
  console.log('已变为:', e.newState);
});
```

## 原生组件 vs JS 组件库的选型

### 对比矩阵

| 需求 | 原生方案 | JS 方案 |
|------|---------|---------|
| 模态框 | `<dialog>` | React Modal / Headless UI |
| 折叠面板 | `<details>` | Accordion 组件 |
| 手风琴 | `<details name>` | Accordion 互斥组 |
| 进度条 | `<progress>` | 自定义进度条 |
| 度量展示 | `<meter>` | 自定义仪表盘 |
| 弹出提示 | Popover API | Tippy.js / Floating UI |
| 下拉选择 | `<select>` | React Select / Headless UI |
| 日期选择 | `<input type="date">` | DatePicker 库 |
| 颜色选择 | `<input type="color">` | ColorPicker 库 |

### 选型原则

**优先使用原生组件的场景**：
- 功能需求简单，原生能满足
- 移动端项目（原生组件在移动端体验更好）
- 需要极致性能和极小包体积
- 无障碍要求高（原生组件自带 A11y）

**使用 JS 组件的场景**：
- 需要高度自定义样式（原生组件样式定制受限）
- 需要跨浏览器一致的 UI
- 需要原生不支持的高级功能（如虚拟滚动、异步搜索）
- 项目已使用组件库，保持一致性

### 渐进增强策略

```html
<!-- 基础：原生 details 折叠 -->
<details class="accordion-item">
  <summary>标题</summary>
  <div class="content">内容...</div>
</details>

<!-- 增强：JS 检测后添加动画、更丰富的交互 -->
<script>
if ('animate' in Element.prototype) {
  // 添加展开/收起动画
  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => {
      const content = details.querySelector('.content');
      if (details.open) {
        content.animate(
          [{ height: '0px', opacity: 0 }, { height: content.scrollHeight + 'px', opacity: 1 }],
          { duration: 200, easing: 'ease-out' }
        );
      }
    });
  });
}
</script>
```

## 常见误区

### 误区 1：dialog 不用 showModal()

```javascript
// ❌ 直接设置 open 属性：没有模态行为
dialog.setAttribute('open', '');
// 无遮罩、无焦点陷阱、无 Esc 关闭

// ✅ 使用 showModal() 方法
dialog.showModal();
// 完整的模态行为
```

### 误区 2：details 内遗漏 summary

```html
<!-- ❌ 无 summary：浏览器自动生成"详细信息"文本 -->
<details>
  <p>内容...</p>
</details>

<!-- ✅ 始终提供 summary -->
<details>
  <summary>查看详情</summary>
  <p>内容...</p>
</details>
```

### 误区 3：用 progress 展示非进度数据

```html
<!-- ❌ 不是进度，是度量 -->
<label>CPU 使用率：</label>
<progress value="75" max="100">75%</progress>

<!-- ✅ 度量值用 meter -->
<label>CPU 使用率：</label>
<meter value="75" min="0" max="100" high="80" low="30" optimum="0">75%</meter>
```

### 误区 4：忽略原生组件的兜底内容

```html
<!-- ✅ 为不支持的浏览器提供兜底 -->
<progress value="65" max="100">65%</progress>
<!-- 标签内的文本仅在不支持 progress 的浏览器中显示 -->

<meter value="0.7" max="1">70%</meter>
<!-- 同理 -->

<dialog>
  <p>对话框内容</p>
</dialog>
<!-- 不支持 dialog 的浏览器中，内容默认可见 -->
```

## 参考资源

- [HTML Living Standard - `<dialog>`](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
- [HTML Living Standard - `<details>`](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element)
- [MDN - Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN - `<progress>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress)
- [MDN - `<meter>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter)
- [Web.dev - Building a Dialog Component](https://web.dev/building-a-dialog-component/)
- [Open UI - Popover](https://open-ui.org/components/popover.research.explainer/)
