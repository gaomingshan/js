# 第 28 章：媒体查询原理

## 概述

媒体查询（Media Queries）是响应式设计的核心，根据设备特性应用不同样式。

---

## 一、基本语法

### 1.1 语法结构

```css
@media media-type and (media-feature) {
  /* CSS规则 */
}
```

### 1.2 示例

```css
@media screen and (min-width: 768px) {
  .container {
    width: 750px;
  }
}
```

---

## 二、媒体类型

### 2.1 类型

```css
@media screen { }      /* 屏幕设备 */
@media print { }       /* 打印设备 */
@media all { }         /* 所有设备（默认） */
@media speech { }      /* 语音合成器 */
```

---

## 三、媒体特性

### 3.1 宽度

```css
@media (min-width: 768px) { }   /* 最小宽度 */
@media (max-width: 1200px) { }  /* 最大宽度 */
@media (width: 1024px) { }      /* 精确宽度 */
```

### 3.2 高度

```css
@media (min-height: 600px) { }
@media (max-height: 800px) { }
```

### 3.3 方向

```css
@media (orientation: portrait) { }   /* 竖屏 */
@media (orientation: landscape) { }  /* 横屏 */
```

### 3.4 分辨率

```css
@media (min-resolution: 2dppx) { }  /* 高分辨率屏幕 */
```

---

## 四、逻辑操作符

### 4.1 and

```css
@media screen and (min-width: 768px) and (max-width: 1200px) { }
```

### 4.2 or (逗号)

```css
@media (min-width: 768px), print { }
```

### 4.3 not

```css
@media not screen { }
```

---

## 五、常见断点

### 5.1 断点设计

```css
/* 移动端优先 */
/* 默认样式（移动端） */
.container { width: 100%; }

/* 平板 */
@media (min-width: 768px) {
  .container { width: 750px; }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container { width: 970px; }
}

/* 大屏 */
@media (min-width: 1200px) {
  .container { width: 1170px; }
}
```

---

## 六、最佳实践

### 6.1 移动优先

```css
/* ✅ 推荐：移动优先 */
.box { font-size: 14px; }

@media (min-width: 768px) {
  .box { font-size: 16px; }
}
```

### 6.2 避免过多断点

```css
/* ❌ 不好 */
@media (max-width: 400px) { }
@media (max-width: 500px) { }
@media (max-width: 600px) { }

/* ✅ 好 */
@media (max-width: 767px) { }  /* 移动 */
@media (min-width: 768px) { }  /* 平板+ */
```

---

## 参考资料

- [MDN - Media Queries](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries)

---

**导航**  
[上一章：第 27 章 - Grid对齐与放置](./27-grid-alignment.md)  
[返回目录](../README.md)  
[下一章：第 29 章 - 响应式单位](./29-responsive-units.md)
