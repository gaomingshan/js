# 第 25 章：Flex 属性详解

## 概述

深入理解flex-grow、flex-shrink、flex-basis的计算规则。

---

## 一、flex-grow 放大计算

### 1.1 计算公式

```
剩余空间 = 容器宽度 - 所有项目flex-basis之和
每个项目增长 = 剩余空间 × (flex-grow / 总grow)
```

### 1.2 示例

```css
/* 容器：600px */
.item1 { flex: 1; }    /* grow: 1, basis: 0 */
.item2 { flex: 2; }    /* grow: 2, basis: 0 */

/* 计算：
   剩余：600px
   item1：600 × 1/3 = 200px
   item2：600 × 2/3 = 400px
*/
```

---

## 二、flex-shrink 收缩计算

### 2.1 计算公式

```
溢出空间 = 所有项目宽度 - 容器宽度
加权总和 = Σ(项目宽度 × shrink)
每个项目收缩 = 溢出空间 × (项目宽度×shrink / 加权总和)
```

---

## 三、flex-basis 基准大小

### 3.1 优先级

```
flex-basis > width > 内容宽度
```

```css
.item {
  width: 100px;
  flex-basis: 200px;  /* 200px生效 */
}
```

---

## 四、flex 简写

### 4.1 常用值

```css
flex: 1;        /* 1 1 0% */
flex: auto;     /* 1 1 auto */
flex: none;     /* 0 0 auto */
flex: 0 auto;   /* 0 1 auto */
```

---

## 参考资料

- [MDN - flex](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)

---

**导航**  
[上一章：第 24 章 - Flexbox布局算法](./24-flexbox-algorithm.md)  
[返回目录](../README.md)  
[下一章：第 26 章 - Grid布局算法](./26-grid-algorithm.md)
