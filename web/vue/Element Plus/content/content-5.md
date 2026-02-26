# 布局与空间组件

## 概述

Space、Divider 和 Card 是常用的布局辅助组件。Space 用于设置元素间距，Divider 用于内容分割，Card 用于信息组织和容器展示。

---

## Space 间距组件

### 核心属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| direction | 排列方向 | string | vertical/horizontal | horizontal |
| size | 间距大小 | string/number | large/default/small 或数字 | small |
| wrap | 是否换行 | boolean | - | false |
| fill | 是否填充父容器 | boolean | - | false |
| alignment | 对齐方式 | string | start/end/center/baseline | center |
| spacer | 自定义间距 | Component | - | - |

---

## Divider 分割线

### 核心属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| direction | 分割线方向 | string | horizontal/vertical | horizontal |
| content-position | 文字位置 | string | left/right/center | center |
| border-style | 边框样式 | string | solid/dashed/dotted | solid |

---

## Card 卡片容器

### 核心属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| header | 卡片标题 | string | - | - |
| body-style | body 样式 | object | - | - |
| shadow | 阴影显示时机 | string | always/hover/never | always |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| header | 卡片头部内容 |
| default | 卡片正文内容 |

---

## 完整样例一：信息卡片列表

### 效果描述
使用 Card 和 Space 组件实现一个商品卡片列表，支持响应式布局。

### 完整代码

```vue
<template>
  <div class="product-list">
    <h2>商品列表</h2>
    
    <!-- 使用 Space 组件设置卡片间距 -->
    <el-space 
      direction="vertical" 
      :size="20" 
      fill
      style="width: 100%;"
    >
      <el-row :gutter="20">
        <el-col 
          v-for="product in products" 
          :key="product.id"
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card 
            class="product-card" 
            shadow="hover"
            :body-style="{ padding: '0' }"
          >
            <!-- 商品图片 -->
            <img :src="product.image" class="product-image" />
            
            <!-- 商品信息 -->
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              
              <el-space :size="5" wrap>
                <el-tag 
                  v-for="tag in product.tags" 
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </el-space>
              
              <el-divider />
              
              <div class="price-info">
                <el-text type="danger" size="large" class="price">
                  ¥{{ product.price }}
                </el-text>
                <el-text type="info" size="small" class="original-price">
                  ¥{{ product.originalPrice }}
                </el-text>
              </div>
              
              <el-space style="width: 100%;" :size="10">
                <el-button type="primary" size="small" style="flex: 1;">
                  立即购买
                </el-button>
                <el-button size="small" :icon="ShoppingCart" circle />
                <el-button size="small" :icon="Star" circle />
              </el-space>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingCart, Star } from '@element-plus/icons-vue'

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  tags: string[]
}

const products = ref<Product[]>([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 7999,
    originalPrice: 8999,
    image: 'https://via.placeholder.com/300',
    tags: ['热销', '新品'],
  },
  {
    id: 2,
    name: 'MacBook Pro',
    price: 12999,
    originalPrice: 14999,
    image: 'https://via.placeholder.com/300',
    tags: ['推荐', '高性能'],
  },
  {
    id: 3,
    name: 'AirPods Pro',
    price: 1999,
    originalPrice: 2299,
    image: 'https://via.placeholder.com/300',
    tags: ['热销'],
  },
  {
    id: 4,
    name: 'iPad Air',
    price: 4599,
    originalPrice: 4999,
    image: 'https://via.placeholder.com/300',
    tags: ['新品', '轻薄'],
  },
])
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.product-card {
  transition: transform 0.3s;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 15px 0;
}

.price {
  font-size: 20px;
  font-weight: bold;
}

.original-price {
  text-decoration: line-through;
}
</style>
```

---

## 完整样例二：仪表盘布局

### 效果描述
使用 Card、Space 和 Divider 组件实现一个数据仪表盘。

### 完整代码

```vue
<template>
  <div class="dashboard">
    <h2>数据仪表盘</h2>
    
    <!-- 统计卡片 -->
    <el-space 
      direction="vertical" 
      :size="20" 
      fill
      style="width: 100%;"
    >
      <!-- 第一行：关键指标 -->
      <el-row :gutter="20">
        <el-col 
          v-for="stat in stats" 
          :key="stat.title"
          :xs="12" 
          :sm="6"
        >
          <el-card shadow="hover" class="stat-card">
            <el-space direction="vertical" :size="10" fill>
              <div class="stat-header">
                <el-icon :size="24" :color="stat.color">
                  <component :is="stat.icon" />
                </el-icon>
                <el-text type="info" size="small">{{ stat.title }}</el-text>
              </div>
              
              <el-text size="large" class="stat-value">
                {{ stat.value }}
              </el-text>
              
              <el-divider style="margin: 0;" />
              
              <el-space :size="5">
                <el-text 
                  :type="stat.trend === 'up' ? 'success' : 'danger'" 
                  size="small"
                >
                  {{ stat.change }}
                </el-text>
                <el-text type="info" size="small">vs 上周</el-text>
              </el-space>
            </el-space>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 第二行：图表区域 -->
      <el-row :gutter="20">
        <el-col :xs="24" :md="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>销售趋势</span>
                <el-space>
                  <el-button size="small" text>日</el-button>
                  <el-button size="small" text type="primary">周</el-button>
                  <el-button size="small" text>月</el-button>
                </el-space>
              </div>
            </template>
            <div class="chart-container">
              图表区域（可集成 ECharts）
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="8">
          <el-card>
            <template #header>
              <span>销售排行</span>
            </template>
            <el-space direction="vertical" :size="10" fill>
              <div 
                v-for="(item, index) in topProducts" 
                :key="item.name"
                class="rank-item"
              >
                <el-space :size="10">
                  <div class="rank-badge" :class="`rank-${index + 1}`">
                    {{ index + 1 }}
                  </div>
                  <div class="rank-info">
                    <el-text>{{ item.name }}</el-text>
                    <el-text type="info" size="small">
                      销量：{{ item.sales }}
                    </el-text>
                  </div>
                </el-space>
                <el-divider v-if="index < topProducts.length - 1" />
              </div>
            </el-space>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 第三行：数据表格 -->
      <el-row>
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>最近订单</span>
                <el-button size="small" text type="primary">
                  查看全部
                </el-button>
              </div>
            </template>
            <el-space direction="vertical" :size="15" fill>
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="order-item"
              >
                <el-space :size="20" style="width: 100%;" alignment="flex-start">
                  <div style="flex: 1;">
                    <el-text>订单号：{{ order.id }}</el-text>
                    <el-text type="info" size="small" tag="div" style="margin-top: 5px;">
                      {{ order.product }}
                    </el-text>
                  </div>
                  
                  <el-divider direction="vertical" style="height: 40px;" />
                  
                  <div style="width: 100px;">
                    <el-text type="info" size="small" tag="div">金额</el-text>
                    <el-text type="danger">¥{{ order.amount }}</el-text>
                  </div>
                  
                  <el-divider direction="vertical" style="height: 40px;" />
                  
                  <div style="width: 120px;">
                    <el-text type="info" size="small" tag="div">时间</el-text>
                    <el-text size="small">{{ order.time }}</el-text>
                  </div>
                  
                  <el-divider direction="vertical" style="height: 40px;" />
                  
                  <div>
                    <el-tag :type="getOrderStatusType(order.status)">
                      {{ order.status }}
                    </el-tag>
                  </div>
                </el-space>
              </div>
            </el-space>
          </el-card>
        </el-col>
      </el-row>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, ShoppingCart, Money, TrendCharts } from '@element-plus/icons-vue'

const stats = ref([
  { 
    title: '总用户数', 
    value: '12,345', 
    change: '+12.5%', 
    trend: 'up',
    icon: User, 
    color: '#409eff' 
  },
  { 
    title: '今日订单', 
    value: '234', 
    change: '+8.2%', 
    trend: 'up',
    icon: ShoppingCart, 
    color: '#67c23a' 
  },
  { 
    title: '总销售额', 
    value: '¥98,765', 
    change: '+15.3%', 
    trend: 'up',
    icon: Money, 
    color: '#e6a23c' 
  },
  { 
    title: '转化率', 
    value: '3.2%', 
    change: '-2.1%', 
    trend: 'down',
    icon: TrendCharts, 
    color: '#f56c6c' 
  },
])

const topProducts = ref([
  { name: 'iPhone 15 Pro', sales: 1234 },
  { name: 'MacBook Pro', sales: 987 },
  { name: 'AirPods Pro', sales: 856 },
  { name: 'iPad Air', sales: 742 },
  { name: 'Apple Watch', sales: 623 },
])

const recentOrders = ref([
  { id: 'ORD202401001', product: 'iPhone 15 Pro', amount: 7999, time: '2024-01-01 10:23', status: '已完成' },
  { id: 'ORD202401002', product: 'MacBook Pro', amount: 12999, time: '2024-01-01 11:15', status: '配送中' },
  { id: 'ORD202401003', product: 'AirPods Pro', amount: 1999, time: '2024-01-01 14:30', status: '待支付' },
])

const getOrderStatusType = (status: string) => {
  const map: Record<string, any> = {
    '已完成': 'success',
    '配送中': 'warning',
    '待支付': 'info',
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.stat-card {
  height: 100%;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.rank-item {
  padding: 5px 0;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  background-color: #909399;
}

.rank-badge.rank-1 {
  background-color: #f56c6c;
}

.rank-badge.rank-2 {
  background-color: #e6a23c;
}

.rank-badge.rank-3 {
  background-color: #67c23a;
}

.rank-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-item {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
```

---

## 完整样例三：响应式设计最佳实践

### 效果描述
展示如何使用 Space、Divider 和 Card 实现响应式布局。

### 完整代码

```vue
<template>
  <div class="responsive-layout">
    <h2>响应式布局示例</h2>
    
    <!-- 移动端：垂直布局，PC端：水平布局 -->
    <el-card>
      <template #header>
        <span>自适应间距方向</span>
      </template>
      <el-space 
        :direction="isMobile ? 'vertical' : 'horizontal'"
        :size="20"
        :fill="isMobile"
        wrap
      >
        <el-button type="primary">按钮 1</el-button>
        <el-button type="success">按钮 2</el-button>
        <el-button type="warning">按钮 3</el-button>
        <el-button type="danger">按钮 4</el-button>
      </el-space>
    </el-card>
    
    <el-divider />
    
    <!-- 分割线方向响应式 -->
    <el-card>
      <template #header>
        <span>分割线响应式</span>
      </template>
      <el-space 
        :direction="isMobile ? 'vertical' : 'horizontal'"
        :size="20"
        fill
      >
        <div class="section">
          <el-text type="primary">Section 1</el-text>
          <el-text type="info">内容区域</el-text>
        </div>
        
        <el-divider :direction="isMobile ? 'horizontal' : 'vertical'" />
        
        <div class="section">
          <el-text type="primary">Section 2</el-text>
          <el-text type="info">内容区域</el-text>
        </div>
        
        <el-divider :direction="isMobile ? 'horizontal' : 'vertical'" />
        
        <div class="section">
          <el-text type="primary">Section 3</el-text>
          <el-text type="info">内容区域</el-text>
        </div>
      </el-space>
    </el-card>
    
    <el-divider />
    
    <!-- 卡片网格响应式 -->
    <el-card>
      <template #header>
        <span>卡片网格</span>
      </template>
      <el-row :gutter="20">
        <el-col 
          v-for="item in gridItems" 
          :key="item.id"
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
          style="margin-bottom: 20px;"
        >
          <el-card shadow="hover" :body-style="{ padding: '20px', textAlign: 'center' }">
            <el-icon :size="40" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
            <el-divider />
            <el-text>{{ item.title }}</el-text>
            <el-text type="info" size="small" tag="div" style="margin-top: 10px;">
              {{ item.desc }}
            </el-text>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    
    <el-divider />
    
    <el-card>
      <template #header>
        <span>当前屏幕尺寸</span>
      </template>
      <el-text>
        窗口宽度：{{ windowWidth }}px
      </el-text>
      <el-divider />
      <el-text>
        设备类型：{{ isMobile ? '移动端' : 'PC端' }}
      </el-text>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { User, House, Setting, Document } from '@element-plus/icons-vue'

const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)

const gridItems = ref([
  { id: 1, title: '用户管理', desc: '管理系统用户', icon: User, color: '#409eff' },
  { id: 2, title: '首页', desc: '返回首页', icon: House, color: '#67c23a' },
  { id: 3, title: '系统设置', desc: '配置系统', icon: Setting, color: '#e6a23c' },
  { id: 4, title: '文档', desc: '查看文档', icon: Document, color: '#f56c6c' },
])

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.responsive-layout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  flex: 1;
  padding: 10px;
}
</style>
```

---

## 常见踩坑

### 1. Space 组件不换行

**问题**：Space 内元素超出容器不换行

**解决方案**：
```vue
<!-- ✅ 添加 wrap 属性 -->
<el-space wrap>
  <el-button>按钮 1</el-button>
  <el-button>按钮 2</el-button>
  <!-- 更多按钮 -->
</el-space>
```

### 2. Card 高度不一致

**问题**：多个卡片高度不统一

**解决方案**：
```vue
<el-col :span="8">
  <el-card style="height: 100%;">
    内容
  </el-card>
</el-col>
```

### 3. Divider 在 flex 容器中不显示

**问题**：垂直分割线在 flex 容器中看不见

**解决方案**：
```vue
<el-space>
  <div>内容 1</div>
  <el-divider direction="vertical" style="height: 40px;" />
  <div>内容 2</div>
</el-space>
```

### 4. Space fill 属性不生效

**问题**：Space 的 fill 属性没有效果

**原因**：父容器未设置宽度

**解决方案**：
```vue
<el-space direction="vertical" fill style="width: 100%;">
  <el-card>卡片 1</el-card>
  <el-card>卡片 2</el-card>
</el-space>
```

---

## 最佳实践

### 1. 合理使用 Space

```vue
<!-- ✅ 推荐：按钮组使用 Space -->
<el-space>
  <el-button>按钮 1</el-button>
  <el-button>按钮 2</el-button>
</el-space>

<!-- ❌ 不推荐：手动设置 margin -->
<div>
  <el-button style="margin-right: 10px;">按钮 1</el-button>
  <el-button>按钮 2</el-button>
</div>
```

### 2. Divider 语义化使用

```vue
<!-- 内容分组 -->
<div>
  <el-text>用户信息</el-text>
  <el-divider />
  <el-text>账户设置</el-text>
</div>

<!-- 带文字的分割线 -->
<el-divider content-position="left">基本信息</el-divider>
```

### 3. Card 组件封装

```vue
<!-- 封装统一样式的 Card -->
<template>
  <el-card 
    shadow="hover"
    :body-style="{ padding: '20px' }"
  >
    <template #header v-if="title">
      <div class="card-header">
        <span>{{ title }}</span>
        <slot name="extra"></slot>
      </div>
    </template>
    <slot></slot>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
```

### 4. 响应式间距

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
const spacing = computed(() => width.value < 768 ? 10 : 20)
</script>

<template>
  <el-space :size="spacing">
    <!-- 内容 -->
  </el-space>
</template>
```

---

## 参考资料

- [Element Plus Space 间距](https://element-plus.org/zh-CN/component/space.html)
- [Element Plus Divider 分割线](https://element-plus.org/zh-CN/component/divider.html)
- [Element Plus Card 卡片](https://element-plus.org/zh-CN/component/card.html)

---

## 下一步

基础组件已学习完毕，接下来进入表单组件部分：[表单基础与校验](./content-6.md)
