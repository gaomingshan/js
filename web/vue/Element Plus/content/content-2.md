# 快速上手与第一个组件

## 概述

本章通过实战搭建一个后台管理系统的基础骨架，学习 Element Plus 的布局组件使用，包括 Container 容器组件和 Grid 栅格布局系统。

---

## 基础布局组件

### Container 容器组件

Element Plus 提供了一套容器组件，用于快速搭建页面结构：

- `<el-container>`：外层容器
- `<el-header>`：顶部容器
- `<el-aside>`：侧边栏容器
- `<el-main>`：主要区域容器
- `<el-footer>`：底部容器

**布局规则**：
- 当 `<el-container>` 子元素中包含 `<el-header>` 或 `<el-footer>` 时，全部子元素会垂直排列
- 否则会水平排列

---

## 响应式布局（Row、Col）

### 基础栅格布局

Element Plus 采用 24 栅格系统：

```vue
<el-row>
  <el-col :span="12">占50%宽度</el-col>
  <el-col :span="12">占50%宽度</el-col>
</el-row>
```

### 关键属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| span | 栅格占据的列数（共24列） | number | 24 |
| offset | 栅格左侧的间隔格数 | number | 0 |
| push | 栅格向右移动格数 | number | 0 |
| pull | 栅格向左移动格数 | number | 0 |
| xs/sm/md/lg/xl | 响应式栅格数或栅格属性对象 | number/object | - |

---

## 完整样例一：经典后台管理系统骨架

### 效果描述
- 顶部导航栏（高度 60px，深色背景）
- 左侧菜单栏（宽度 200px，可折叠）
- 右侧内容区域（自适应）
- 底部版权信息（高度 60px）

### 完整代码

```vue
<template>
  <el-container class="layout-container">
    <!-- 顶部导航 -->
    <el-header class="layout-header">
      <div class="header-content">
        <h2>后台管理系统</h2>
        <div class="header-right">
          <el-button text>用户名</el-button>
          <el-button type="primary" size="small">退出</el-button>
        </div>
      </div>
    </el-header>
    
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
        <el-button 
          class="collapse-btn" 
          @click="isCollapse = !isCollapse"
        >
          {{ isCollapse ? '展开' : '收起' }}
        </el-button>
        <el-menu
          :collapse="isCollapse"
          :default-active="activeMenu"
          class="sidebar-menu"
        >
          <el-menu-item index="1">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-main class="layout-main">
        <div class="main-content">
          <h3>欢迎使用</h3>
          <p>这是使用 Element Plus 搭建的后台管理系统框架</p>
        </div>
      </el-main>
    </el-container>
    
    <!-- 底部 -->
    <el-footer class="layout-footer">
      <p>© 2024 Your Company. All rights reserved.</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { House, User, Setting } from '@element-plus/icons-vue'

const isCollapse = ref(false)
const activeMenu = ref('1')
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  background-color: #545c64;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
}

.header-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.collapse-btn {
  width: 100%;
  margin: 10px 0;
}

.sidebar-menu {
  border-right: none;
  background-color: #304156;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #263445;
  color: #409eff;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.main-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  min-height: 400px;
}

.layout-footer {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e6e6e6;
}

.layout-footer p {
  margin: 0;
  color: #666;
}
</style>
```

### 关键点说明

1. **高度控制**：外层容器使用 `height: 100vh` 占满整个视口
2. **侧边栏折叠**：通过动态 `:width` 实现平滑过渡
3. **菜单折叠**：`el-menu` 的 `collapse` 属性控制文字显示
4. **深度选择器**：使用 `:deep()` 修改 Element Plus 组件内部样式

---

## 完整样例二：响应式栅格布局

### 效果描述
- 桌面端：3 列展示
- 平板端：2 列展示
- 手机端：1 列展示

### 完整代码

```vue
<template>
  <div class="grid-demo">
    <h2>商品列表（响应式布局）</h2>
    <el-row :gutter="20">
      <el-col 
        v-for="item in products" 
        :key="item.id"
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="8" 
        :xl="6"
      >
        <el-card class="product-card" shadow="hover">
          <img :src="item.image" class="product-image" />
          <div class="product-info">
            <h3>{{ item.name }}</h3>
            <p class="price">¥{{ item.price }}</p>
            <el-button type="primary" size="small" style="width: 100%">
              加入购物车
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

const products = ref<Product[]>([
  { id: 1, name: '商品 1', price: 99, image: 'https://via.placeholder.com/300' },
  { id: 2, name: '商品 2', price: 199, image: 'https://via.placeholder.com/300' },
  { id: 3, name: '商品 3', price: 299, image: 'https://via.placeholder.com/300' },
  { id: 4, name: '商品 4', price: 399, image: 'https://via.placeholder.com/300' },
  { id: 5, name: '商品 5', price: 499, image: 'https://via.placeholder.com/300' },
  { id: 6, name: '商品 6', price: 599, image: 'https://via.placeholder.com/300' },
])
</script>

<style scoped>
.grid-demo {
  padding: 20px;
}

.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  padding-top: 10px;
}

.product-info h3 {
  margin: 10px 0;
  font-size: 16px;
  color: #333;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
```

### 响应式断点说明

| 断点 | 屏幕宽度 | 栅格数 | 效果 |
|------|----------|--------|------|
| xs | <768px | 24 | 1列（手机） |
| sm | ≥768px | 12 | 2列（平板竖屏） |
| md | ≥992px | 8 | 3列（平板横屏） |
| lg | ≥1200px | 8 | 3列（小屏电脑） |
| xl | ≥1920px | 6 | 4列（大屏） |

---

## 完整样例三：仪表盘布局

### 效果描述
- 顶部统计卡片（4 个）
- 中间图表区域（2 列）
- 底部表格

### 完整代码

```vue
<template>
  <div class="dashboard">
    <!-- 统计卡片区 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon :size="30"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-title">{{ stat.title }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>用户增长趋势</span>
          </template>
          <div class="chart-placeholder">图表区域</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>销售数据</span>
          </template>
          <div class="chart-placeholder">图表区域</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 表格区 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>最近订单</span>
          </template>
          <div class="table-placeholder">表格区域（后续章节学习）</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, ShoppingCart, Money, TrendCharts } from '@element-plus/icons-vue'

const stats = ref([
  { title: '总用户数', value: '12,345', icon: User, color: '#409eff' },
  { title: '今日订单', value: '234', icon: ShoppingCart, color: '#67c23a' },
  { title: '总销售额', value: '¥98,765', icon: Money, color: '#e6a23c' },
  { title: '增长率', value: '+12.5%', icon: TrendCharts, color: '#f56c6c' },
])
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f0f2f5;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin: 5px 0 0 0;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-placeholder,
.table-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 4px;
}
</style>
```

---

## 开发者工具与调试技巧

### 1. Vue DevTools

安装 Vue DevTools 浏览器插件，可以：
- 查看组件树
- 检查 Props 和 State
- 追踪事件
- 性能分析

### 2. Element Plus 组件调试

```vue
<script setup lang="ts">
// 获取组件实例进行调试
import { ref, onMounted } from 'vue'

const menuRef = ref()

onMounted(() => {
  console.log('Menu 组件实例:', menuRef.value)
})
</script>

<template>
  <el-menu ref="menuRef">
    <!-- ... -->
  </el-menu>
</template>
```

### 3. 响应式布局调试

浏览器开发者工具 → 切换设备模拟器，测试不同屏幕尺寸：
- iPhone SE (375px)
- iPad (768px)
- 桌面 (1920px)

---

## 常见踩坑

### 1. Container 高度不占满

**问题**：`<el-container>` 高度未占满视口

**解决方案**：
```css
.layout-container {
  height: 100vh; /* 使用视口高度 */
}
```

### 2. 栅格布局错位

**问题**：Row 下子元素不是 Col 导致布局错乱

**解决方案**：
```vue
<!-- ❌ 错误 -->
<el-row>
  <div>内容</div>
</el-row>

<!-- ✅ 正确 -->
<el-row>
  <el-col :span="24">
    <div>内容</div>
  </el-col>
</el-row>
```

### 3. 侧边栏折叠动画卡顿

**问题**：侧边栏宽度变化不流畅

**解决方案**：
```css
.layout-aside {
  transition: width 0.3s ease; /* 添加过渡动画 */
}
```

### 4. 响应式断点不生效

**问题**：xs/sm/md 等属性未生效

**原因**：忘记引入 Element Plus 的响应式样式

**解决方案**：确保 `import 'element-plus/dist/index.css'` 或使用自动导入插件

---

## 最佳实践

### 1. 布局语义化

使用 `<el-header>`、`<el-aside>`、`<el-main>` 等语义化标签，代码可读性更强。

### 2. 响应式优先

优先使用响应式布局，而不是固定宽度：
```vue
<!-- ✅ 推荐 -->
<el-col :xs="24" :md="12" :lg="8">

<!-- ❌ 不推荐 -->
<div style="width: 300px;">
```

### 3. 合理使用 gutter

Row 的 `gutter` 属性可设置列间距，避免手动设置 margin：
```vue
<el-row :gutter="20">
  <el-col :span="12">内容</el-col>
  <el-col :span="12">内容</el-col>
</el-row>
```

### 4. 样式隔离

使用 `scoped` 避免样式污染：
```vue
<style scoped>
/* 样式只作用于当前组件 */
</style>
```

### 5. 组件提取

复杂布局应拆分为独立组件：
```
components/
  Layout/
    Header.vue
    Sidebar.vue
    Main.vue
    Footer.vue
```

---

## 参考资料

- [Element Plus Container 容器](https://element-plus.org/zh-CN/component/container.html)
- [Element Plus Layout 布局](https://element-plus.org/zh-CN/component/layout.html)
- [CSS Grid 与 Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

## 下一步

布局基础已掌握，继续学习基础组件：[按钮与图标组件](./content-3.md)
