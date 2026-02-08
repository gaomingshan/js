# 流式渲染与渐进式加载

## 核心概念

流式渲染允许服务器边生成边发送 HTML，用户可以更快看到内容。

## HTTP Streaming

```javascript
// Node.js 流式响应
app.get('/article', async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  
  // 立即发送头部
  res.write(`
    <!DOCTYPE html>
    <html>
    <head><title>文章</title></head>
    <body>
      <header>网站头部</header>
  `);
  
  // 异步获取内容
  const content = await fetchContent();
  res.write(`
      <main>${content}</main>
  `);
  
  // 发送页脚
  res.write(`
      <footer>页脚</footer>
    </body>
    </html>
  `);
  
  res.end();
});
```

**优势**：
- TTFB（首字节时间）快
- 渐进式渲染
- 用户体验好

## React Server Components

```jsx
// Server Component
async function ArticleList() {
  const articles = await db.articles.findMany();
  
  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

// 客户端组件
'use client';
function LikeButton() {
  return <button onClick={handleLike}>点赞</button>;
}
```

## 边缘渲染

```javascript
// Cloudflare Workers
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const html = await renderPage();
  
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}
```

**后端类比**：流式渲染 ≈ 流式查询结果返回。

## 参考资源

- [React - Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [HTTP Streaming](https://web.dev/streams/)
