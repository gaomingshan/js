# 第 38 章：Filter 滤镜

## 概述

CSS滤镜提供图像处理效果，如模糊、亮度、对比度等。

---

## 一、滤镜函数

### 1.1 常用滤镜

```css
/* 模糊 */
.box { filter: blur(5px); }

/* 亮度 */
.box { filter: brightness(1.5); }  /* >1变亮，<1变暗 */

/* 对比度 */
.box { filter: contrast(1.5); }

/* 灰度 */
.box { filter: grayscale(100%); }

/* 色相旋转 */
.box { filter: hue-rotate(90deg); }

/* 反色 */
.box { filter: invert(100%); }

/* 透明度 */
.box { filter: opacity(50%); }

/* 饱和度 */
.box { filter: saturate(2); }

/* 褐色 */
.box { filter: sepia(100%); }

/* 阴影 */
.box { filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5)); }
```

---

## 二、组合滤镜

### 2.1 多个滤镜

```css
.box {
  filter: blur(5px) brightness(1.2) contrast(1.1);
}
```

---

## 三、backdrop-filter

### 3.1 背景滤镜

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);  /* 毛玻璃效果 */
}
```

---

## 四、性能考虑

### 4.1 性能影响

```css
/* ⚠️ 滤镜消耗性能 */
.heavy {
  filter: blur(20px) brightness(1.5) saturate(2);
}

/* ✅ 适度使用 */
.light {
  filter: blur(5px);
}
```

---

## 五、实用案例

### 5.1 图片悬停效果

```css
img {
  filter: grayscale(100%);
  transition: filter 0.3s;
}

img:hover {
  filter: grayscale(0%);
}
```

### 5.2 毛玻璃效果

```css
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px) saturate(180%);
}
```

---

## 参考资料

- [MDN - filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter)

---

**导航**  
[上一章：第 37 章 - 3D变换](./37-3d-transform.md)  
[返回目录](../README.md)  
[下一章：第 39 章 - 混合模式](./39-blend-modes.md)
