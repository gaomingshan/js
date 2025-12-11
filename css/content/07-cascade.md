# 第 7 章：层叠算法详解

## 概述

层叠（Cascade）是CSS的核心机制，决定了当多个规则作用于同一元素时，哪个规则最终生效。

---

## 一、层叠优先级

### 1.1 优先级顺序（从高到低）

```
1. Transition（过渡动画）
2. !important（用户代理）
3. !important（用户）
4. !important（作者）
5. Animation（动画）
6. 正常样式（作者）
7. 正常样式（用户）
8. 正常样式（用户代理）
```

### 1.2 来源分类

```css
/* 1. 用户代理样式（浏览器默认） */
p { margin: 1em 0; }

/* 2. 用户样式（用户设置） */
* { font-size: 20px !important; }

/* 3. 作者样式（开发者编写） */
.text { color: blue; }
```

---

## 二、特异性计算

### 2.1 权重规则

```
(a, b, c, d)
a = 内联样式（1000）
b = ID选择器（100）
c = 类/伪类/属性（10）
d = 标签/伪元素（1）
```

### 2.2 计算示例

```css
*               /* (0,0,0,0) */
li              /* (0,0,0,1) */
li::before      /* (0,0,0,2) */
.list           /* (0,0,1,0) */
ul li           /* (0,0,0,2) */
ul li.active    /* (0,0,1,2) */
#nav .list li   /* (0,1,1,1) */
style=""        /* (1,0,0,0) */
```

### 2.3 比较规则

```css
/* (0,1,0,0) > (0,0,10,0) */
#id { }           /* 权重：100 */
.c1.c2.c3.c4.c5.c6.c7.c8.c9.c10 { }  /* 权重：100 */

/* ID胜出！不是十进制相加 */
```

---

## 三、!important

### 3.1 提升优先级

```css
.text {
  color: red !important;  /* 最高优先级 */
}

#id {
  color: blue;            /* 不生效 */
}
```

### 3.2 覆盖!important

```css
/* 只能用更高优先级的!important */
.text { color: red !important; }
#id { color: blue !important; }  /* 生效 */
```

### 3.3 最佳实践

```css
/* ❌ 避免滥用 */
.box { width: 100px !important; }

/* ✅ 仅用于覆盖内联样式或第三方库 */
.override { display: block !important; }
```

---

## 四、层叠规则

### 4.1 判断流程

```
1. 比较来源和重要性
   ↓
2. 比较特异性
   ↓
3. 比较声明顺序（后来居上）
```

### 4.2 示例

```css
/* 1. 来源相同，比较特异性 */
.text { color: red; }    /* 权重：10 */
#id { color: blue; }     /* 权重：100，生效 */

/* 2. 特异性相同，比较顺序 */
.text { color: red; }
.text { color: blue; }   /* 后者生效 */

/* 3. !important 改变顺序 */
.text { color: red !important; }
#id { color: blue; }     /* red生效 */
```

---

## 五、继承与层叠

### 5.1 继承值参与层叠

```css
body { color: blue; }
.text { /* 继承 color: blue */ }

/* 显式声明覆盖继承 */
.text { color: red; }  /* 生效 */
```

### 5.2 inherit/initial/unset

```css
.text {
  color: inherit;   /* 强制继承 */
  margin: initial;  /* 重置为初始值 */
  padding: unset;   /* 可继承则继承，否则initial */
}
```

---

## 参考资料

- [CSS Cascade Specification](https://www.w3.org/TR/css-cascade-4/)

---

**导航**  
[上一章：第 6 章 - 样式表加载与阻塞](./06-stylesheet-loading.md)  
[返回目录](../README.md)  
[下一章：第 8 章 - 继承机制](./08-inheritance.md)
