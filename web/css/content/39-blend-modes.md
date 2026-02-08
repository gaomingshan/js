# 第 39 章：混合模式

## 概述

CSS混合模式控制元素颜色的混合方式，创建丰富的视觉效果。

---

## 一、mix-blend-mode

### 1.1 元素混合

```css
.box {
  mix-blend-mode: multiply;     /* 正片叠底 */
  mix-blend-mode: screen;       /* 滤色 */
  mix-blend-mode: overlay;      /* 叠加 */
  mix-blend-mode: darken;       /* 变暗 */
  mix-blend-mode: lighten;      /* 变亮 */
  mix-blend-mode: color-dodge;  /* 颜色减淡 */
  mix-blend-mode: color-burn;   /* 颜色加深 */
  mix-blend-mode: difference;   /* 差值 */
  mix-blend-mode: exclusion;    /* 排除 */
}
```

---

## 二、background-blend-mode

### 2.1 背景混合

```css
.box {
  background: 
    url(texture.png),
    linear-gradient(to right, red, blue);
  background-blend-mode: multiply;
}
```

---

## 三、isolation

### 3.1 隔离混合

```css
.isolated {
  isolation: isolate;  /* 创建新的层叠上下文 */
}
```

---

## 四、实用案例

### 4.1 文字混合

```css
h1 {
  background: url(bg.jpg);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  mix-blend-mode: multiply;
}
```

---

## 参考资料

- [MDN - mix-blend-mode](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode)

---

**导航**  
[上一章：第 38 章 - Filter滤镜](./38-filter.md)  
[返回目录](../README.md)  
[下一章：第 40 章 - 自定义属性](./40-custom-properties.md)
