# 无限滚动与虚拟列表

## 概述

处理大数据量列表时，传统渲染方式会导致性能问题。本章介绍无限滚动和虚拟列表技术，优化长列表渲染性能。

## 核心技术

### 1. InfiniteScroll 无限滚动

Element Plus 提供 `v-infinite-scroll` 指令实现无限滚动加载。

### 2. 虚拟列表

使用 `el-table-v2` 或第三方库实现虚拟滚动，只渲染可见区域。

### 3. VueUse 工具

利用 VueUse 的 `useVirtualList` 和 `useInfiniteScroll` 辅助实现。

## 完整实战样例

### 示例 1：无限滚动 - 商品列表

滚动到底部自动加载更多数据。

```vue
<template>
  <div class="infinite-scroll-demo">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>无限滚动示例</span>
          <el-tag>已加载：{{ list.length }} / {{ total }}</el-tag>
        </div>
      </template>

      <div
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="disabled"
        :infinite-scroll-distance="50"
        class="scroll-container"
      >
        <div v-for="item in list" :key="item.id" class="list-item">
          <el-card shadow="hover">
            <div class="item-content">
              <el-image
                :src="item.image"
                fit="cover"
                style="width: 80px; height: 80px; border-radius: 4px"
              />
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
                <div class="item-meta">
                  <el-tag type="danger">¥{{ item.price }}</el-tag>
                  <span>销量：{{ item.sales }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-if="noMore" class="no-more">
          没有更多数据了
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

interface Product {
  id: number
  name: string
  description: string
  image: string
  price: number
  sales: number
}

const list = ref<Product[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(100)

const noMore = computed(() => list.value.length >= total.value)
const disabled = computed(() => loading.value || noMore.value)

const loadMore = async () => {
  if (loading.value || noMore.value) return

  loading.value = true

  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newItems: Product[] = Array.from({ length: pageSize }, (_, index) => {
      const id = (page.value - 1) * pageSize + index + 1
      return {
        id,
        name: `商品 ${id}`,
        description: `这是商品 ${id} 的详细描述信息`,
        image: `https://via.placeholder.com/80?text=${id}`,
        price: Math.floor(Math.random() * 1000) + 100,
        sales: Math.floor(Math.random() * 10000)
      }
    })

    list.value = [...list.value, ...newItems]
    page.value++

    if (list.value.length >= total.value) {
      ElMessage.info('已加载全部数据')
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 初始加载
loadMore()
</script>

<style scoped>
.infinite-scroll-demo {
  max-width: 800px;
  margin: 0 auto;
}

.scroll-container {
  max-height: 600px;
  overflow-y: auto;
}

.list-item {
  margin-bottom: 12px;
}

.item-content {
  display: flex;
  gap: 16px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 8px 0;
}

.item-info p {
  margin: 0 0 12px 0;
  color: #909399;
  font-size: 14px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading,
.no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #909399;
}
</style>
```

---

### 示例 2：虚拟列表 - TableV2

使用 Element Plus TableV2 处理大数据量表格。

```vue
<template>
  <div class="table-v2-demo">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>虚拟表格（10万条数据）</span>
          <el-space>
            <el-tag>总计：{{ data.length }} 条</el-tag>
            <el-button size="small" @click="generateData">
              重新生成数据
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table-v2
        :columns="columns"
        :data="data"
        :width="800"
        :height="600"
        :row-height="50"
        fixed
      />
    </el-card>
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted } from 'vue'
import { ElTag, ElButton } from 'element-plus'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createTime: string
}

const data = ref<User[]>([])

const columns = [
  {
    key: 'id',
    title: 'ID',
    dataKey: 'id',
    width: 80,
    align: 'center'
  },
  {
    key: 'name',
    title: '姓名',
    dataKey: 'name',
    width: 150
  },
  {
    key: 'email',
    title: '邮箱',
    dataKey: 'email',
    width: 200
  },
  {
    key: 'role',
    title: '角色',
    dataKey: 'role',
    width: 120,
    cellRenderer: ({ cellData }: any) => {
      const typeMap: Record<string, any> = {
        '管理员': 'danger',
        '编辑': 'warning',
        '用户': 'info'
      }
      return <ElTag type={typeMap[cellData]}>{cellData}</ElTag>
    }
  },
  {
    key: 'status',
    title: '状态',
    dataKey: 'status',
    width: 100,
    align: 'center',
    cellRenderer: ({ cellData }: any) => {
      return <ElTag type={cellData === '正常' ? 'success' : 'danger'}>{cellData}</ElTag>
    }
  },
  {
    key: 'createTime',
    title: '创建时间',
    dataKey: 'createTime',
    width: 180
  }
]

const generateData = () => {
  const roles = ['管理员', '编辑', '用户']
  const statuses = ['正常', '禁用']
  
  data.value = Array.from({ length: 100000 }, (_, index) => ({
    id: index + 1,
    name: `用户${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[index % 3],
    status: statuses[index % 10 === 0 ? 1 : 0],
    createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')
  }))
}

onMounted(() => {
  generateData()
})
</script>

<style scoped>
.table-v2-demo {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
```

---

### 示例 3：VueUse 虚拟列表

使用 VueUse 的 `useVirtualList` 实现自定义虚拟列表。

```bash
npm install @vueuse/core
```

```vue
<template>
  <div class="vueuse-virtual-demo">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>VueUse 虚拟列表（1万条数据）</span>
          <el-tag>总计：{{ allData.length }} 条</el-tag>
        </div>
      </template>

      <div ref="containerRef" class="virtual-container">
        <div :style="{ height: `${containerProps.totalHeight}px`, position: 'relative' }">
          <div
            v-for="item in list"
            :key="item.index"
            :style="{
              position: 'absolute',
              top: `${item.top}px`,
              height: `${itemHeight}px`,
              width: '100%'
            }"
          >
            <el-card shadow="hover" class="virtual-item">
              <div class="item-content">
                <el-avatar :size="40">{{ item.data.id }}</el-avatar>
                <div class="item-info">
                  <h4>{{ item.data.title }}</h4>
                  <p>{{ item.data.content }}</p>
                  <div class="item-meta">
                    <el-tag size="small" type="info">{{ item.data.category }}</el-tag>
                    <span>{{ item.data.time }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVirtualList } from '@vueuse/core'

interface DataItem {
  id: number
  title: string
  content: string
  category: string
  time: string
}

const itemHeight = 100
const allData = ref<DataItem[]>([])
const containerRef = ref<HTMLElement | null>(null)

const { list, containerProps } = useVirtualList(
  allData,
  {
    itemHeight,
    overscan: 5
  }
)

const generateData = () => {
  const categories = ['技术', '生活', '娱乐', '新闻', '科技']
  
  allData.value = Array.from({ length: 10000 }, (_, index) => ({
    id: index + 1,
    title: `标题 ${index + 1}`,
    content: `这是第 ${index + 1} 条数据的内容描述，虚拟列表可以高效渲染大量数据。`,
    category: categories[index % 5],
    time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  }))
}

onMounted(() => {
  generateData()
})
</script>

<style scoped>
.vueuse-virtual-demo {
  max-width: 800px;
  margin: 0 auto;
}

.virtual-container {
  height: 600px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.virtual-item {
  margin: 8px;
}

.item-content {
  display: flex;
  gap: 16px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}
</style>
```

---

### 示例 4：下拉刷新 + 无限滚动

结合下拉刷新和无限滚动。

```vue
<template>
  <div class="pull-refresh-demo">
    <el-card>
      <template #header>
        <span>下拉刷新 + 无限滚动</span>
      </template>

      <div
        ref="scrollContainer"
        class="scroll-wrapper"
        @scroll="handleScroll"
      >
        <div
          class="pull-refresh-area"
          :style="{ transform: `translateY(${pullDistance}px)` }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div v-if="pullDistance > 0" class="pull-tip">
            <el-icon v-if="!refreshing" class="pull-icon"><arrow-down /></el-icon>
            <el-icon v-else class="is-loading"><Loading /></el-icon>
            <span>{{ pullTipText }}</span>
          </div>

          <div
            v-for="item in list"
            :key="item.id"
            class="list-item"
          >
            <el-card shadow="hover">
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
              <div class="item-footer">
                <span>{{ item.time }}</span>
                <el-tag size="small">{{ item.views }} 阅读</el-tag>
              </div>
            </el-card>
          </div>

          <div v-if="loadingMore" class="loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载更多...</span>
          </div>

          <div v-if="noMore" class="no-more">
            已加载全部内容
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, Loading } from '@element-plus/icons-vue'

interface Article {
  id: number
  title: string
  content: string
  time: string
  views: number
}

const scrollContainer = ref<HTMLElement | null>(null)
const list = ref<Article[]>([])
const refreshing = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const total = ref(50)

const pullDistance = ref(0)
const startY = ref(0)
const isPulling = ref(false)

const noMore = computed(() => list.value.length >= total.value)

const pullTipText = computed(() => {
  if (refreshing.value) return '刷新中...'
  if (pullDistance.value > 60) return '释放刷新'
  return '下拉刷新'
})

// 下拉刷新
const handleTouchStart = (e: TouchEvent) => {
  if (scrollContainer.value && scrollContainer.value.scrollTop === 0) {
    startY.value = e.touches[0].clientY
    isPulling.value = true
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isPulling.value || refreshing.value) return

  const currentY = e.touches[0].clientY
  const distance = currentY - startY.value

  if (distance > 0 && distance < 100) {
    e.preventDefault()
    pullDistance.value = distance
  }
}

const handleTouchEnd = async () => {
  if (!isPulling.value) return

  isPulling.value = false

  if (pullDistance.value > 60 && !refreshing.value) {
    refreshing.value = true
    await refresh()
    refreshing.value = false
  }

  pullDistance.value = 0
}

// 刷新数据
const refresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  page.value = 1
  await loadData(true)
  ElMessage.success('刷新成功')
}

// 滚动加载更多
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  if (scrollHeight - scrollTop - clientHeight < 50 && !loadingMore.value && !noMore.value) {
    loadMore()
  }
}

const loadMore = async () => {
  if (loadingMore.value || noMore.value) return

  loadingMore.value = true
  page.value++
  await loadData(false)
  loadingMore.value = false
}

const loadData = async (isRefresh: boolean) => {
  await new Promise(resolve => setTimeout(resolve, 1000))

  const newData: Article[] = Array.from({ length: 10 }, (_, index) => {
    const id = isRefresh ? index + 1 : (page.value - 1) * 10 + index + 1
    return {
      id,
      title: `文章标题 ${id}`,
      content: `这是文章 ${id} 的内容摘要，点击查看详情...`,
      time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      views: Math.floor(Math.random() * 10000)
    }
  })

  if (isRefresh) {
    list.value = newData
  } else {
    list.value = [...list.value, ...newData]
  }
}

// 初始加载
loadData(true)
</script>

<style scoped>
.pull-refresh-demo {
  max-width: 600px;
  margin: 0 auto;
}

.scroll-wrapper {
  height: 600px;
  overflow-y: auto;
}

.pull-refresh-area {
  transition: transform 0.3s;
}

.pull-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #409eff;
}

.pull-icon {
  font-size: 20px;
}

.list-item {
  margin-bottom: 12px;
}

.list-item h4 {
  margin: 0 0 8px 0;
}

.list-item p {
  margin: 0 0 12px 0;
  color: #606266;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.loading,
.no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #909399;
}
</style>
```

---

## 常见踩坑

### 1. 无限滚动触发多次

**问题：** 滚动时重复触发加载。

**解决：** 使用 loading 状态防止重复请求。

```ts
const loadMore = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  // ...
  loading.value = false
}
```

---

### 2. 虚拟列表滚动抖动

**问题：** 虚拟列表滚动时出现抖动或空白。

**解决：** 确保 `itemHeight` 准确，使用固定高度。

---

### 3. TableV2 列宽度计算错误

**问题：** 列宽度不正确，内容被截断。

**解决：** 显式设置所有列的 `width` 属性。

---

### 4. 下拉刷新与原生滚动冲突

**问题：** 下拉刷新与浏览器原生下拉刷新冲突。

**解决：** 使用 `preventDefault()` 阻止默认行为。

```ts
const handleTouchMove = (e: TouchEvent) => {
  if (isPulling.value) {
    e.preventDefault()
  }
}
```

---

## 最佳实践

### 1. 节流滚动事件

```ts
import { useDebounceFn } from '@vueuse/core'

const handleScroll = useDebounceFn((e: Event) => {
  // 处理滚动
}, 200)
```

### 2. 数据预加载

提前加载下一页数据，提升用户体验。

```ts
const preloadThreshold = 200 // 提前200px开始加载

if (scrollHeight - scrollTop - clientHeight < preloadThreshold) {
  loadMore()
}
```

### 3. 虚拟列表性能优化

使用 `Object.freeze()` 冻结数据，避免不必要的响应式。

```ts
const data = Object.freeze(largeArray)
```

### 4. 状态持久化

保存滚动位置和加载状态。

```ts
// 保存滚动位置
onBeforeUnmount(() => {
  sessionStorage.setItem('scrollTop', scrollContainer.value?.scrollTop || 0)
})

// 恢复滚动位置
onMounted(() => {
  const savedScrollTop = sessionStorage.getItem('scrollTop')
  if (savedScrollTop && scrollContainer.value) {
    scrollContainer.value.scrollTop = Number(savedScrollTop)
  }
})
```

---

## 参考资料

- [Element Plus InfiniteScroll](https://element-plus.org/zh-CN/component/infinite-scroll.html)
- [Element Plus TableV2](https://element-plus.org/zh-CN/component/table-v2.html)
- [VueUse useVirtualList](https://vueuse.org/core/useVirtualList/)
- [VueUse useInfiniteScroll](https://vueuse.org/core/useInfiniteScroll/)
