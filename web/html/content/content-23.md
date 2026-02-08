# SSR 的实现原理

## 核心概念

服务端渲染（SSR）是在服务器生成完整 HTML，直接返回给客户端。

## 服务端 HTML 生成

```javascript
// Express + React
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', async (req, res) => {
  const appHtml = renderToString(<App />);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SSR App</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script src="/client.js"></script>
    </body>
    </html>
  `;
  
  res.send(html);
});
```

## 数据注入与状态序列化

```javascript
app.get('/article/:id', async (req, res) => {
  const article = await fetchArticle(req.params.id);
  
  const appHtml = renderToString(<App article={article} />);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <div id="root">${appHtml}</div>
      
      <!-- 注入初始状态 -->
      <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(article)};
      </script>
      
      <script src="/client.js"></script>
    </body>
    </html>
  `;
  
  res.send(html);
});
```

**后端类比**：SSR ≈ 模板引擎渲染（EJS、Pug）。

## 首屏 HTML 的完整性要求

```html
<!-- ✅ 完整的 HTML -->
<article>
  <h1>文章标题</h1>
  <p>文章内容已经在 HTML 中</p>
</article>

<!-- ❌ 不完整的 HTML -->
<div id="root"></div>
<!-- 内容需要 JS 加载，首屏空白 -->
```

## 参考资源

- [React - Server Rendering](https://react.dev/reference/react-dom/server)
- [Next.js - SSR](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)
