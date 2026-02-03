# CSR vs SSR vs SSG

## 核心概念

现代前端有三种主要的渲染模式，各有适用场景。

```
CSR (Client-Side Rendering)：客户端渲染
SSR (Server-Side Rendering)：服务端渲染
SSG (Static Site Generation)：静态生成
```

## CSR：HTML 作为容器

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="app.js"></script>
</body>
</html>
```

**特点**：
- HTML 只是空壳
- JavaScript 动态生成内容
- 首屏慢，但后续交互快

**适用场景**：管理后台、SaaS 应用

## SSR：HTML 作为完整文档

```javascript
// Node.js 服务端
app.get('/article/:id', async (req, res) => {
  const article = await getArticle(req.params.id);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>${article.title}</title></head>
    <body>
      <h1>${article.title}</h1>
      <p>${article.content}</p>
      <script src="app.js"></script>
    </body>
    </html>
  `;
  
  res.send(html);
});
```

**特点**：
- 服务器生成完整 HTML
- 首屏快，SEO 友好
- 服务器压力大

**适用场景**：新闻网站、电商、博客

## SSG：构建时生成 HTML

```javascript
// Next.js
export async function getStaticProps() {
  const article = await getArticle();
  return { props: { article } };
}

export default function Page({ article }) {
  return <h1>{article.title}</h1>;
}
```

**特点**：
- 构建时生成所有 HTML
- 部署到 CDN
- 速度最快

**适用场景**：文档站、营销页

## 对比表

| 特性 | CSR | SSR | SSG |
|------|-----|-----|-----|
| 首屏速度 | 慢 | 快 | 最快 |
| SEO | 差 | 好 | 最好 |
| 服务器压力 | 小 | 大 | 无 |
| 动态内容 | 好 | 好 | 差 |

**后端类比**：
- CSR ≈ 前端渲染
- SSR ≈ 模板引擎
- SSG ≈ 静态文件

## 参考资源

- [Next.js - Rendering](https://nextjs.org/docs/basic-features/pages)
- [Web.dev - Rendering on the Web](https://web.dev/rendering-on-the-web/)
