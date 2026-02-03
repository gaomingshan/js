# 邮件 HTML

## 核心概念

邮件 HTML 是最受限的 HTML 环境，需要兼容各种邮件客户端（Gmail、Outlook、Apple Mail 等）。

## 邮件 HTML 的限制

```html
<!-- ❌ 不支持的特性 -->
<style>
  /* 外部样式表 */
  @import url('style.css');  /* 不支持 */
  
  /* 媒体查询（部分支持） */
  @media (max-width: 600px) { }
  
  /* 高级选择器 */
  .class > div { }  /* 有限支持 */
</style>

<!-- ❌ 不支持的标签 -->
<video>, <audio>, <canvas>, <svg>

<!-- ❌ 不支持的 JavaScript -->
<script>alert('不支持');</script>
```

## 表格布局的回归

```html
<!-- 邮件中使用表格布局 -->
<table width="600" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background-color: #333; color: #fff; padding: 20px;">
      <h1 style="margin: 0;">邮件标题</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px;">
      <p style="margin: 0 0 10px 0;">邮件内容</p>
      <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">
        点击按钮
      </a>
    </td>
  </tr>
  <tr>
    <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #666;">© 2024 公司名称</p>
    </td>
  </tr>
</table>
```

## 邮件客户端兼容性

```html
<!-- 为 Outlook 添加条件注释 -->
<!--[if mso]>
<table width="600" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td>
<![endif]-->

<div style="max-width: 600px;">
  内容
</div>

<!--[if mso]>
    </td>
  </tr>
</table>
<![endif]-->

<!-- 内联样式（必须） -->
<p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; margin: 0 0 10px 0;">
  内容
</p>

<!-- 图片使用绝对路径 -->
<img src="https://example.com/logo.png" alt="Logo" width="200" height="60" style="display: block;">
```

## 响应式邮件

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* 移动端媒体查询 */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .mobile-hidden {
        display: none !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0;">
  <table class="container" width="600" cellpadding="0" cellspacing="0">
    <tr>
      <td>内容</td>
    </tr>
  </table>
</body>
</html>
```

## 最佳实践

```html
<!-- 1. 使用 600px 宽度 -->
<table width="600">

<!-- 2. 所有样式内联 -->
<td style="padding: 20px; font-size: 14px;">

<!-- 3. 使用表格布局 -->
<table><tr><td>...</td></tr></table>

<!-- 4. 图片指定宽高 -->
<img src="..." width="200" height="100" alt="描述">

<!-- 5. 使用 Web 安全字体 -->
<p style="font-family: Arial, Helvetica, sans-serif;">

<!-- 6. 背景色使用十六进制 -->
<td style="background-color: #f0f0f0;">

<!-- 7. 按钮用表格实现 -->
<table cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background-color: #007bff; border-radius: 4px;">
      <a href="#" style="display: block; padding: 10px 20px; color: #fff; text-decoration: none;">
        按钮
      </a>
    </td>
  </tr>
</table>
```

**后端类比**：邮件 HTML ≈ 向后兼容的 API 版本。

## 参考资源

- [HTML Email](https://htmlemail.io/)
- [Email on Acid](https://www.emailonacid.com/)
- [Litmus](https://www.litmus.com/)
