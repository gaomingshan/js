# 动态组件与 KeepAlive

> 动态组件实现组件的动态切换，KeepAlive 提供组件缓存能力。

## 动态组件

### component :is 基础

```vue
<script setup>
import { ref } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'
import ComponentC from './ComponentC.vue'

const currentComponent = ref(ComponentA)

function switchComponent(component) {
  currentComponent.value = component
}
</script>

<template>
  <button @click="switchComponent(ComponentA)">A</button>
  <button @click="switchComponent(ComponentB)">B</button>
  <button @click="switchComponent(ComponentC)">C</button>
  
  <!-- 动态组件 -->
  <component :is="currentComponent" />
</template>
```

### :is 的多种用法

```vue
<script setup>
import MyComponent from './MyComponent.vue'

const componentName = ref('div')
const componentInstance = ref(MyComponent)
</script>

<template>
  <!-- 1. 原生 HTML 元素 -->
  <component :is="'div'">Div 元素</component>
  <component :is="'button'">Button 元素</component>
  
  <!-- 2. 组件名（全局注册的组件） -->
  <component :is="'MyGlobalComponent'" />
  
  <!-- 3. 组件对象 -->
  <component :is="MyComponent" />
  
  <!-- 4. 动态绑定 -->
  <component :is="componentInstance" />
</template>
```

---

## KeepAlive 组件缓存

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

const currentTab = ref('TabA')
const tabs = {
  TabA,
  TabB
}
</script>

<template>
  <button @click="currentTab = 'TabA'">Tab A</button>
  <button @click="currentTab = 'TabB'">Tab B</button>
  
  <!-- 缓存组件状态 -->
  <KeepAlive>
    <component :is="tabs[currentTab]" />
  </KeepAlive>
</template>
```

**效果**：
- 组件切换时保留状态
- 不会重新创建组件实例
- 不会触发 `unmounted` 钩子

---

## KeepAlive 配置

### include / exclude

```vue
<script setup>
const currentTab = ref('Home')
</script>

<template>
  <!-- 只缓存 Home 和 About -->
  <KeepAlive include="Home,About">
    <component :is="currentTab" />
  </KeepAlive>
  
  <!-- 使用数组 -->
  <KeepAlive :include="['Home', 'About']">
    <component :is="currentTab" />
  </KeepAlive>
  
  <!-- 使用正则 -->
  <KeepAlive :include="/^(Home|About)$/">
    <component :is="currentTab" />
  </KeepAlive>
  
  <!-- 排除 Settings -->
  <KeepAlive exclude="Settings">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

**匹配规则**：
- 基于组件的 `name` 选项
- 组件必须有 `name` 才能被正确匹配

```vue
<!-- TabA.vue -->
<script setup>
// 使用 defineOptions 设置 name
defineOptions({
  name: 'TabA'
})
</script>

<template>
  <div>Tab A Content</div>
</template>
```

### max - 最大缓存数

```vue
<template>
  <!-- 最多缓存 3 个组件 -->
  <KeepAlive :max="3">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

**缓存策略**：
- LRU (Least Recently Used) 算法
- 超过 max 时，最久未使用的组件被销毁

---

## KeepAlive 生命周期

### activated / deactivated

```vue
<script setup>
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

const data = ref([])

// 首次挂载时调用
onMounted(() => {
  console.log('组件挂载')
  fetchData()
})

// 每次激活时调用
onActivated(() => {
  console.log('组件激活')
  // 重新获取数据或恢复状态
})

// 每次停用时调用
onDeactivated(() => {
  console.log('组件停用')
  // 清理定时器等
})

// 只在真正卸载时调用
onUnmounted(() => {
  console.log('组件卸载')
})
</script>

<template>
  <div>{{ data }}</div>
</template>
```

**生命周期顺序**：

```
首次渲染：
  mounted → activated

切换走：
  deactivated

切换回来：
  activated（不触发 mounted）

组件被销毁（超过 max 或 exclude）：
  deactivated → unmounted
```

---

## 配合路由使用

### 缓存路由视图

```vue
<!-- App.vue -->
<template>
  <KeepAlive :include="cachedViews">
    <router-view />
  </KeepAlive>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 根据路由 meta 决定是否缓存
const cachedViews = computed(() => {
  return route.meta.keepAlive ? [route.name] : []
})
</script>
```

### 路由配置

```typescript
// router/index.ts
const routes = [
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/List.vue'),
    meta: {
      keepAlive: true // 需要缓存
    }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: {
      keepAlive: false // 不缓存
    }
  }
]
```

### 动态控制缓存

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const cachedViews = ref<string[]>([])

const router = useRouter()

// 添加缓存
function addCache(name: string) {
  if (!cachedViews.value.includes(name)) {
    cachedViews.value.push(name)
  }
}

// 移除缓存
function removeCache(name: string) {
  const index = cachedViews.value.indexOf(name)
  if (index > -1) {
    cachedViews.value.splice(index, 1)
  }
}

// 清空缓存
function clearCache() {
  cachedViews.value = []
}

// 路由守卫中控制
router.beforeEach((to, from, next) => {
  if (to.meta.keepAlive) {
    addCache(to.name as string)
  }
  next()
})
</script>

<template>
  <KeepAlive :include="cachedViews">
    <router-view />
  </KeepAlive>
</template>
```

---

## 刷新缓存组件

### 方法 1：修改 key

```vue
<script setup>
const componentKey = ref(0)

function refresh() {
  componentKey.value++
}
</script>

<template>
  <button @click="refresh">刷新</button>
  
  <KeepAlive>
    <component :is="currentComponent" :key="componentKey" />
  </KeepAlive>
</template>
```

### 方法 2：动态 include

```vue
<script setup>
const include = ref(['ComponentA'])

function refresh() {
  // 暂时移除缓存
  include.value = []
  
  nextTick(() => {
    // 恢复缓存
    include.value = ['ComponentA']
  })
}
</script>

<template>
  <KeepAlive :include="include">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

### 方法 3：调用组件方法

```vue
<!-- Child.vue -->
<script setup>
const data = ref([])

async function refresh() {
  data.value = await fetchData()
}

defineExpose({
  refresh
})

onActivated(() => {
  // 可选：每次激活时自动刷新
  refresh()
})
</script>

<!-- Parent.vue -->
<script setup>
const childRef = ref()

function refreshChild() {
  childRef.value?.refresh()
}
</script>

<template>
  <button @click="refreshChild">刷新</button>
  
  <KeepAlive>
    <Child ref="childRef" />
  </KeepAlive>
</template>
```

---

## 递归组件

组件可以在自己的模板中引用自己。

```vue
<!-- TreeNode.vue -->
<script setup>
interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

defineProps<{
  node: TreeNode
}>()

const expanded = ref(true)
</script>

<template>
  <li>
    <span @click="expanded = !expanded">
      {{ expanded ? '▼' : '▶' }} {{ node.label }}
    </span>
    
    <!-- 递归引用自己 -->
    <ul v-if="expanded && node.children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </ul>
  </li>
</template>
```

---

## 易错点与边界情况

### 1. 组件 name 必须匹配

```vue
<!-- ❌ 错误：没有设置 name -->
<script setup>
// 组件没有 name
</script>

<!-- KeepAlive 无法正确匹配 -->
<KeepAlive include="MyComponent">
  <MyComponent />
</KeepAlive>

<!-- ✅ 正确：设置 name -->
<script setup>
defineOptions({
  name: 'MyComponent'
})
</script>

<KeepAlive include="MyComponent">
  <MyComponent />
</KeepAlive>
```

### 2. 多根节点组件

```vue
<!-- ❌ KeepAlive 需要单根节点 -->
<KeepAlive>
  <component :is="current">
    <template>
      <div>Root 1</div>
      <div>Root 2</div>
    </template>
  </component>
</KeepAlive>

<!-- ✅ 包裹在单个根元素中 -->
<KeepAlive>
  <component :is="current">
    <template>
      <div>
        <div>Root 1</div>
        <div>Root 2</div>
      </div>
    </template>
  </component>
</KeepAlive>
```

### 3. v-if 与 KeepAlive

```vue
<!-- ❌ 错误：v-if 会导致组件销毁 -->
<KeepAlive>
  <component v-if="show" :is="current" />
</KeepAlive>

<!-- ✅ 正确：v-show 或在外层使用 v-if -->
<KeepAlive>
  <component v-show="show" :is="current" />
</KeepAlive>

<!-- 或 -->
<div v-if="show">
  <KeepAlive>
    <component :is="current" />
  </KeepAlive>
</div>
```

### 4. 缓存失效

```vue
<script setup>
// ⚠️ 组件名不匹配
defineOptions({
  name: 'TabA'
})
</script>

<template>
  <!-- include 写错了 -->
  <KeepAlive include="TabB">
    <TabA /> <!-- 不会被缓存 -->
  </KeepAlive>
</template>
```

---

## 前端工程实践

### 示例 1：Tab 切换with缓存

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  name: string
  label: string
  component: any
  cache: boolean
}

const tabs: Tab[] = [
  { name: 'Home', label: '首页', component: Home, cache: true },
  { name: 'List', label: '列表', component: List, cache: true },
  { name: 'Settings', label: '设置', component: Settings, cache: false }
]

const activeTab = ref('Home')

const cachedTabs = computed(() => {
  return tabs.filter(tab => tab.cache).map(tab => tab.name)
})

const currentComponent = computed(() => {
  return tabs.find(tab => tab.name === activeTab.value)?.component
})
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      :class="{ active: activeTab === tab.name }"
      @click="activeTab = tab.name"
    >
      {{ tab.label }}
    </button>
  </div>
  
  <KeepAlive :include="cachedTabs">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

### 示例 2：列表-详情缓存

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 缓存的列表页
const cachedListViews = ref<string[]>([])

watch(
  () => route.name,
  (newName, oldName) => {
    // 从详情返回列表时，缓存列表
    if (oldName === 'Detail' && newName === 'List') {
      if (!cachedListViews.value.includes('List')) {
        cachedListViews.value.push('List')
      }
    }
    
    // 从列表进入详情时，保持缓存
    if (oldName === 'List' && newName === 'Detail') {
      // 保持 List 缓存
    }
    
    // 离开列表到其他页面，清除缓存
    if (oldName === 'List' && newName !== 'Detail') {
      const index = cachedListViews.value.indexOf('List')
      if (index > -1) {
        cachedListViews.value.splice(index, 1)
      }
    }
  }
)
</script>

<template>
  <KeepAlive :include="cachedListViews">
    <router-view />
  </KeepAlive>
</template>
```

### 示例 3：按需刷新

```vue
<script setup lang="ts">
import { ref } from 'vue'

const tabs = ['Tab1', 'Tab2', 'Tab3']
const activeTab = ref('Tab1')

// 记录每个 Tab 的刷新状态
const needsRefresh = reactive({
  Tab1: false,
  Tab2: false,
  Tab3: false
})

// 在 Tab 组件中
onActivated(() => {
  if (needsRefresh[activeTab.value]) {
    refreshData()
    needsRefresh[activeTab.value] = false
  }
})

// 某些操作后标记需要刷新
function markNeedsRefresh(tabName: string) {
  needsRefresh[tabName] = true
}
</script>
```

### 示例 4：缓存管理器

```typescript
// composables/useKeepAlive.ts
import { ref } from 'vue'

export function useKeepAlive() {
  const cachedViews = ref<string[]>([])
  
  function addCache(name: string) {
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
    }
  }
  
  function removeCache(name: string) {
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }
  
  function clearCache() {
    cachedViews.value = []
  }
  
  function refreshCache(name: string) {
    removeCache(name)
    nextTick(() => {
      addCache(name)
    })
  }
  
  return {
    cachedViews,
    addCache,
    removeCache,
    clearCache,
    refreshCache
  }
}

// 使用
<script setup>
const { cachedViews, addCache, removeCache, refreshCache } = useKeepAlive()
</script>

<template>
  <KeepAlive :include="cachedViews">
    <component :is="current" />
  </KeepAlive>
</template>
```

---

## 性能优化

### 1. 合理设置 max

```vue
<template>
  <!-- 移动端：缓存较少 -->
  <KeepAlive :max="3">
    <component :is="current" />
  </KeepAlive>
  
  <!-- PC 端：可以缓存更多 -->
  <KeepAlive :max="10">
    <component :is="current" />
  </KeepAlive>
</template>
```

### 2. 按需缓存

```vue
<script setup>
// 只缓存需要的页面
const shouldCache = computed(() => {
  return route.meta.keepAlive && !route.meta.noCache
})

const include = computed(() => {
  return shouldCache.value ? [route.name] : []
})
</script>

<template>
  <KeepAlive :include="include">
    <router-view />
  </KeepAlive>
</template>
```

---

## 最佳实践

1. **设置组件 name**：确保 include/exclude 正确匹配
2. **合理使用 max**：避免缓存过多组件
3. **按需缓存**：不是所有组件都需要缓存
4. **清理缓存**：离开模块时清理不需要的缓存
5. **activated 钩子**：在激活时更新数据
6. **deactivated 钩子**：在停用时清理定时器等
7. **避免过度缓存**：考虑内存占用
8. **状态管理**：复杂状态使用 Pinia/Vuex

---

## 参考资料

- [动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)
- [KeepAlive](https://cn.vuejs.org/guide/built-ins/keep-alive.html)
- [activated / deactivated](https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated)
