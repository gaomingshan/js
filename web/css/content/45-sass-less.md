# 第 45 章：Sass/Less 原理

## 概述

CSS预处理器扩展CSS功能，提供变量、嵌套、混合等特性。

---

## 一、变量

### 1.1 Sass

```scss
$primary-color: #3b82f6;
$spacing: 20px;

.box {
  color: $primary-color;
  padding: $spacing;
}
```

### 1.2 Less

```less
@primary-color: #3b82f6;
@spacing: 20px;

.box {
  color: @primary-color;
  padding: @spacing;
}
```

---

## 二、嵌套

### 2.1 Sass/Less

```scss
.nav {
  background: white;
  
  &__item {
    padding: 10px;
    
    &:hover {
      background: blue;
    }
  }
}
```

---

## 三、混合（Mixin）

### 3.1 Sass

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  @include flex-center;
}
```

### 3.2 Less

```less
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  .flex-center();
}
```

---

## 四、继承

### 4.1 Sass

```scss
.btn {
  padding: 10px 20px;
  border: none;
}

.btn-primary {
  @extend .btn;
  background: blue;
}
```

---

## 五、函数

### 5.1 Sass

```scss
@function px-to-rem($px) {
  @return $px / 16px * 1rem;
}

.box {
  font-size: px-to-rem(24px);
}
```

---

## 参考资料

- [Sass Documentation](https://sass-lang.com/)
- [Less Documentation](https://lesscss.org/)

---

**导航**  
[上一章：第 44 章 - CSS方法论](./44-css-methodology.md)  
[返回目录](../README.md)  
[下一章：第 46 章 - PostCSS与工程化](./46-postcss.md)
