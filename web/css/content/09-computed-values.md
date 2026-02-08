# 第 9 章：样式值计算过程

## 概述

CSS属性值经过多个阶段的计算，最终得到浏览器实际使用的值。理解值计算过程有助于调试样式问题。

---

## 一、值计算的六个阶段

```
1. 声明值 (Declared Value)
   ↓
2. 层叠值 (Cascaded Value)
   ↓
3. 指定值 (Specified Value)
   ↓
4. 计算值 (Computed Value)
   ↓
5. 使用值 (Used Value)
   ↓
6. 实际值 (Actual Value)
```

---

## 二、声明值（Declared Value）

### 2.1 定义

所有作用于该元素的CSS声明的属性值。

```css
/* 声明值 */
.box { width: 100px; }
#container .box { width: 200px; }
.box { width: 300px !important; }

/* 所有width声明都是声明值 */
```

---

## 三、层叠值（Cascaded Value）

### 3.1 定义

经过层叠算法后，从所有声明值中选出的胜出值。

```css
.box { width: 100px; }        /* 权重：10 */
#container .box { width: 200px; }  /* 权重：110，胜出 */

/* 层叠值：200px */
```

---

## 四、指定值（Specified Value）

### 4.1 定义

确定属性的最终值，包括继承和默认值。

**计算规则**：
1. 如果有层叠值 → 使用层叠值
2. 如果属性可继承且父元素有值 → 继承
3. 否则 → 使用初始值

```css
/* 示例1：有层叠值 */
.box { color: red; }  /* 指定值：red */

/* 示例2：继承 */
body { color: blue; }
p { /* 指定值：blue（继承） */ }

/* 示例3：初始值 */
div { /* margin指定值：0（初始值） */ }
```

---

## 五、计算值（Computed Value）

### 5.1 定义

将相对值转换为绝对值，但不考虑布局。

```css
/* 转换规则 */
.box {
  width: 50%;        /* 指定值：50% */
                     /* 计算值：50%（保持百分比） */
  
  font-size: 1.5em;  /* 指定值：1.5em */
                     /* 计算值：24px（父元素16px × 1.5） */
  
  color: currentColor;  /* 计算值：实际颜色值 */
}
```

### 5.2 可以通过JS访问

```javascript
// getComputedStyle 返回计算值
const style = getComputedStyle(element);
console.log(style.fontSize);  // "24px"
console.log(style.width);     // "50%"（百分比保持）
```

---

## 六、使用值（Used Value）

### 6.1 定义

完成所有计算后的最终值，包括布局计算。

```css
.parent { width: 1000px; }
.child {
  width: 50%;        /* 计算值：50% */
                     /* 使用值：500px（1000px × 50%） */
  
  height: auto;      /* 使用值：根据内容计算，如200px */
}
```

### 6.2 所有相对值都已解析

```css
.box {
  width: 50%;        /* 使用值：500px */
  margin: auto;      /* 使用值：250px（居中计算） */
  line-height: 1.5;  /* 使用值：24px（16px × 1.5） */
}
```

---

## 七、实际值（Actual Value）

### 7.1 定义

浏览器实际使用的值，考虑设备限制。

```css
.box {
  width: 100.5px;    /* 使用值：100.5px */
                     /* 实际值：101px（四舍五入） */
  
  color: rgba(0, 0, 0, 0.123);
  /* 实际值：可能只支持整数透明度 */
}
```

### 7.2 设备限制

```css
/* 某些设备不支持亚像素 */
.box { width: 10.3px; }  /* 可能渲染为10px或11px */

/* 某些浏览器限制颜色精度 */
.box { color: rgb(10, 20, 30); }  /* 可能有微小差异 */
```

---

## 八、实例分析

### 8.1 完整流程示例

```html
<div class="parent">
  <div class="child">内容</div>
</div>
```

```css
.parent {
  width: 1000px;
  font-size: 16px;
}

.child {
  width: 50%;
  font-size: 1.5em;
}
```

**child的width计算**：
1. 声明值：`50%`
2. 层叠值：`50%`（无冲突）
3. 指定值：`50%`
4. 计算值：`50%`（百分比保持）
5. 使用值：`500px`（1000px × 50%）
6. 实际值：`500px`

**child的font-size计算**：
1. 声明值：`1.5em`
2. 层叠值：`1.5em`
3. 指定值：`1.5em`
4. 计算值：`24px`（16px × 1.5）
5. 使用值：`24px`
6. 实际值：`24px`

---

## 九、特殊值的计算

### 9.1 auto

```css
.box {
  width: auto;       /* 指定值：auto */
                     /* 计算值：auto */
                     /* 使用值：实际宽度（如500px） */
}
```

### 9.2 百分比

```css
/* width/height百分比 */
.box { width: 50%; }   /* 计算值：50%，使用值：具体像素 */

/* padding/margin百分比 */
.box { padding: 10%; } /* 计算值：10%，使用值：具体像素 */
```

### 9.3 em/rem

```css
.box {
  font-size: 2em;    /* 计算值：具体像素 */
  width: 10em;       /* 计算值：具体像素 */
}
```

---

## 十、调试技巧

### 10.1 Chrome DevTools

```
1. Elements → Computed
2. 查看计算值
3. 点击属性查看来源
```

### 10.2 JavaScript获取

```javascript
// 计算值
const computed = getComputedStyle(element);
console.log(computed.width);

// 使用值（部分属性）
console.log(element.offsetWidth);  // 包含border
console.log(element.clientWidth);  // 不包含border
```

---

## 参考资料

- [CSS Values and Units](https://www.w3.org/TR/css-values-4/)
- [MDN - Computed Value](https://developer.mozilla.org/zh-CN/docs/Web/CSS/computed_value)

---

**导航**  
[上一章：第 8 章 - 继承机制](./08-inheritance.md)  
[返回目录](../README.md)  
[下一章：第 10 章 - 单位与值转换](./10-units.md)
