# Hydration：从静态到动态

## 核心概念

Hydration（注水）是 SSR 应用中，客户端 JavaScript 接管服务端渲染的 HTML，使其变为可交互的过程。

```
服务端：生成静态 HTML
↓
浏览器：显示 HTML（可见但不可交互）
↓
JavaScript 加载：Hydration
↓
完全可交互
```

## Hydration 的工作原理

```javascript
// 服务端生成的 HTML
<div id="root">
  <button class="counter">点击次数: 0</button>
</div>

// 客户端 Hydration
import { hydrateRoot } from 'react-dom/client';

const root = document.getElementById('root');
hydrateRoot(root, <App />);
// React 将 HTML 与虚拟 DOM 对比，绑定事件
```

**后端类比**：Hydration ≈ 数据库热备份后的索引重建。

## HTML 与 JS 状态的同步问题

### Hydration Mismatch

```javascript
// ❌ 服务端和客户端渲染不一致
function Component() {
  // 服务端：undefined
  // 客户端：实际值
  const [time] = useState(new Date().getTime());
  
  return <div>{time}</div>;
  // 警告：Hydration failed
}

// ✅ 确保一致性
function Component() {
  const [time, setTime] = useState(null);
  
  useEffect(() => {
    setTime(new Date().getTime());
  }, []);
  
  return <div>{time || 'Loading...'}</div>;
}
```

## Partial Hydration

```javascript
// 只对需要交互的部分 Hydration
<div>
  <header>静态头部（不需要 Hydration）</header>
  
  <main>
    <ArticleContent />  {/* 静态内容 */}
    <CommentSection />  {/* 需要交互，Hydration */}
  </main>
</div>
```

## Islands Architecture

```html
<!-- Astro 示例 -->
<Layout>
  <StaticHeader />
  
  <!-- 交互岛屿 -->
  <Counter client:load />
  
  <StaticContent />
  
  <!-- 另一个交互岛屿 -->
  <CommentForm client:visible />
</Layout>
```

**特点**：
- 静态内容为主
- 交互组件为"岛屿"
- 按需 Hydration

**后端类比**：Islands ≈ 微服务架构，独立的功能单元。

## 参考资源

- [React - Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Islands Architecture](https://jasonformat.com/islands-architecture/)
