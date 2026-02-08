# HTML 体积与传输优化

## 核心概念

HTML 的体积直接影响首屏加载时间，优化 HTML 传输是性能优化的关键环节。

## HTML 压缩

### Gzip 压缩

```bash
# Nginx 配置
gzip on;
gzip_types text/html text/css application/javascript;
gzip_min_length 1000;
gzip_comp_level 6;
```

**压缩效果**：
```
原始 HTML: 100KB
Gzip 压缩: 20KB (80% 压缩率)
Brotli 压缩: 15KB (85% 压缩率)
```

### Brotli 压缩

```bash
# Nginx 配置
brotli on;
brotli_types text/html text/css application/javascript;
brotli_comp_level 6;
```

**后端类比**：压缩 ≈ 数据库查询结果压缩。

## 内联资源 vs 外部资源

### 权衡策略

```html
<!-- 关键 CSS 内联（2-5KB） -->
<style>
  .header { background: #333; }
  .hero { min-height: 500px; }
</style>

<!-- 非关键 CSS 外部加载 -->
<link rel="preload" href="main.css" as="style" onload="this.rel='stylesheet'">

<!-- 小图标 Base64 内联 -->
<img src="data:image/png;base64,iVBORw0KG..." alt="icon">

<!-- 大图片外部加载 -->
<img src="photo.jpg" loading="lazy">
```

**原则**：
- 关键资源（<5KB）→ 内联
- 可缓存资源 → 外部
- 大文件 → 外部 + CDN

## 减少 DOM 深度与节点数量

```html
<!-- ❌ 过深的嵌套 -->
<div>
  <div>
    <div>
      <div>
        <div>
          <p>内容</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ✅ 扁平化结构 -->
<p>内容</p>
```

**影响**：
- DOM 节点过多 → 解析慢
- 嵌套过深 → 样式计算慢

**后端类比**：减少嵌套 ≈ 减少数据库 JOIN 深度。

## Minify HTML

```bash
# 使用工具压缩
npm install -g html-minifier

html-minifier --collapse-whitespace \
  --remove-comments \
  --minify-css \
  --minify-js \
  input.html -o output.html
```

**效果**：
```html
<!-- 原始 -->
<div class="container">
  <h1>标题</h1>
  <p>内容</p>
</div>

<!-- 压缩后 -->
<div class="container"><h1>标题</h1><p>内容</p></div>
```

## 参考资源

- [Web.dev - Minify and Compress](https://web.dev/reduce-network-payloads-using-text-compression/)
- [HTML Minifier](https://github.com/kangax/html-minifier)
