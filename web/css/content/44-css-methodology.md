# 第 44 章：CSS 方法论

## 概述

CSS方法论提供组织和管理CSS代码的最佳实践。

---

## 一、BEM

### 1.1 命名规范

```css
/* Block__Element--Modifier */
.card { }
.card__title { }
.card__content { }
.card--featured { }
.card__title--large { }
```

---

## 二、OOCSS

### 2.1 面向对象CSS

```css
/* 结构与皮肤分离 */
.btn { }           /* 结构 */
.btn-primary { }   /* 皮肤 */
.btn-large { }     /* 大小 */
```

---

## 三、SMACSS

### 3.1 分类系统

```css
/* Base */
body { }

/* Layout */
.l-header { }
.l-sidebar { }

/* Module */
.card { }

/* State */
.is-active { }

/* Theme */
.theme-dark { }
```

---

## 四、Atomic CSS

### 4.1 原子化

```css
.mt-10 { margin-top: 10px; }
.p-20 { padding: 20px; }
.flex { display: flex; }
```

---

## 五、最佳实践

### 5.1 选择合适的方法

```
小项目：BEM
大项目：OOCSS + SMACSS
工具库：Atomic CSS
```

---

## 参考资料

- [BEM](http://getbem.com/)
- [OOCSS](https://github.com/stubbornella/oocss/wiki)
- [SMACSS](http://smacss.com/)

---

**导航**  
[上一章：第 43 章 - 图形函数](./43-shape-functions.md)  
[返回目录](../README.md)  
[下一章：第 45 章 - Sass/Less原理](./45-sass-less.md)
