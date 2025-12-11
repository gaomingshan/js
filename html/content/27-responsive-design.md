# 第 27 章：响应式设计

## 概述

响应式设计让网页在不同设备上都有良好的显示效果。

## 一、视口设置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 二、响应式图片

### 2.1 srcset

```html
<img srcset="small.jpg 480w, large.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 50vw"
     src="large.jpg" alt="响应式图片">
```

### 2.2 picture

```html
<picture>
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  <source media="(min-width: 769px)" srcset="desktop.jpg">
  <img src="desktop.jpg" alt="图片">
</picture>
```

## 三、响应式视频

```html
<div class="video-container">
  <iframe src="video.mp4"></iframe>
</div>

<style>
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

## 四、媒体查询

```html
<link rel="stylesheet" href="mobile.css" media="screen and (max-width: 768px)">
<link rel="stylesheet" href="desktop.css" media="screen and (min-width: 769px)">
```

## 五、响应式表格

```html
<style>
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  
  thead tr {
    display: none;
  }
  
  td::before {
    content: attr(data-label);
    font-weight: bold;
  }
}
</style>

<table>
  <thead>
    <tr>
      <th>姓名</th>
      <th>年龄</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="姓名">张三</td>
      <td data-label="年龄">25</td>
    </tr>
  </tbody>
</table>
```

## 参考资料

- [MDN - 响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

**上一章** ← [第 26 章：资源加载优化](./26-resource-loading.md)  
**下一章** → [第 28 章：Web Components](./28-web-components.md)

---

✅ **第五部分：安全与性能（23-27章）已完成！**
