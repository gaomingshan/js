# 第 7 节：插槽机制

## 概述

插槽（Slot）允许父组件向子组件传递模板内容，实现组件的内容分发。这是除 Props 外另一种重要的组件组合方式。

## 一、默认插槽

### 1.1 基本用法

```vue
<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <div class="card-body">
      <!-- 插槽出口 -->
      <slot></slot>
    </div>
  </div>
</template>

<!-- 父组件 -->
<template>
  <Card>
    <!-- 插槽内容 -->
    <p>这是卡片内容</p>
    <button>按钮</button>
  </Card>
</template>
```

### 1.2 默认内容

```vue
<!-- 子组件 -->
<template>
  <button>
    <slot>
      <!-- 没有提供内容时显示默认内容 -->
      默认按钮文字
    </slot>
  </button>
</template>

<!-- 父组件 -->
<template>
  <SubmitButton />          <!-- 显示：默认按钮文字 -->
  <SubmitButton>提交</SubmitButton>  <!-- 显示：提交 -->
</template>
```

## 二、具名插槽

### 2.1 定义具名插槽

```vue
<!-- 子组件 Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header"></slot>
    </header>
    
    <main>
      <slot></slot>  <!-- 默认插槽 -->
    </main>
    
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

### 2.2 使用具名插槽

```vue
<!-- 父组件 -->
<template>
  <Layout>
    <!-- v-slot:name 或 #name -->
    <template #header>
      <h1>页面标题</h1>
    </template>
    
    <!-- 默认插槽内容 -->
    <p>主要内容</p>
    
    <template #footer>
      <p>页脚信息</p>
    </template>
  </Layout>
</template>
```

### 2.3 动态插槽名

```vue
<template>
  <Layout>
    <template #[dynamicSlotName]>
      动态插槽内容
    </template>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
const dynamicSlotName = ref('header')
</script>
```

## 三、作用域插槽

### 3.1 概念

```
┌─────────────────────────────────────────────────────────────┐
│   作用域插槽：子组件向插槽内容传递数据                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   子组件有数据，但渲染方式由父组件决定                         │
│                                                             │
│   子组件                        父组件                       │
│   ┌─────────────┐              ┌─────────────┐             │
│   │ data: item  │ ──传递──▶   │ 使用 item   │             │
│   │ <slot :item>│              │ 决定渲染    │             │
│   └─────────────┘              └─────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 基本用法

```vue
<!-- 子组件 UserList.vue -->
<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      <!-- 向插槽传递数据 -->
      <slot :user="user" :index="index"></slot>
    </li>
  </ul>
</template>

<script setup>
defineProps(['users'])
</script>

<!-- 父组件 -->
<template>
  <UserList :users="users">
    <!-- 接收插槽数据 -->
    <template #default="{ user, index }">
      <span>{{ index + 1 }}. {{ user.name }}</span>
    </template>
  </UserList>
</template>
```

### 3.3 解构插槽 Props

```vue
<!-- 完整写法 -->
<template #default="slotProps">
  {{ slotProps.user.name }}
</template>

<!-- 解构 -->
<template #default="{ user }">
  {{ user.name }}
</template>

<!-- 重命名 -->
<template #default="{ user: person }">
  {{ person.name }}
</template>

<!-- 默认值 -->
<template #default="{ user = { name: '匿名' } }">
  {{ user.name }}
</template>
```

### 3.4 具名作用域插槽

```vue
<!-- 子组件 -->
<template>
  <div>
    <header>
      <slot name="header" :title="title"></slot>
    </header>
    <main>
      <slot :items="items"></slot>
    </main>
  </div>
</template>

<!-- 父组件 -->
<template>
  <MyComponent>
    <template #header="{ title }">
      <h1>{{ title }}</h1>
    </template>
    
    <template #default="{ items }">
      <ul>
        <li v-for="item in items" :key="item.id">{{ item.name }}</li>
      </ul>
    </template>
  </MyComponent>
</template>
```

## 四、实用示例

### 4.1 可复用列表组件

```vue
<!-- GenericList.vue -->
<template>
  <div class="list">
    <div v-if="loading" class="loading">
      <slot name="loading">加载中...</slot>
    </div>
    
    <div v-else-if="items.length === 0" class="empty">
      <slot name="empty">暂无数据</slot>
    </div>
    
    <ul v-else>
      <li v-for="(item, index) in items" :key="item.id">
        <slot :item="item" :index="index">
          {{ item }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
</script>

<!-- 使用 -->
<template>
  <GenericList :items="users" :loading="isLoading">
    <template #loading>
      <Spinner />
    </template>
    
    <template #empty>
      <EmptyState message="没有找到用户" />
    </template>
    
    <template #default="{ item: user, index }">
      <UserCard :user="user" :rank="index + 1" />
    </template>
  </GenericList>
</template>
```

### 4.2 表格组件

```vue
<!-- DataTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          <slot :name="`header-${col.key}`" :column="col">
            {{ col.title }}
          </slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in data" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
            {{ row[col.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<!-- 使用 -->
<template>
  <DataTable :columns="columns" :data="users">
    <!-- 自定义头部 -->
    <template #header-name="{ column }">
      <strong>{{ column.title }} ★</strong>
    </template>
    
    <!-- 自定义单元格 -->
    <template #cell-avatar="{ row }">
      <img :src="row.avatar" :alt="row.name" />
    </template>
    
    <template #cell-status="{ value }">
      <Badge :type="value">{{ value }}</Badge>
    </template>
  </DataTable>
</template>
```

### 4.3 渲染函数组件

```vue
<!-- RenderlessCounter.vue - 无渲染组件 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
const decrement = () => count.value--
const reset = () => count.value = 0

// 只提供逻辑，不提供 UI
defineExpose({ count, increment, decrement, reset })
</script>

<template>
  <slot :count="count" :increment="increment" :decrement="decrement" :reset="reset" />
</template>

<!-- 使用：父组件决定 UI -->
<template>
  <RenderlessCounter v-slot="{ count, increment, decrement }">
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
    </div>
  </RenderlessCounter>
</template>
```

## 五、插槽 vs Props

### 5.1 何时用插槽

```vue
<!-- 需要传递 HTML 结构时用插槽 -->
<Card>
  <template #header>
    <h2>标题 <Badge>新</Badge></h2>
  </template>
  <p>内容...</p>
</Card>

<!-- 简单数据用 props -->
<Card title="标题" content="内容" />
```

### 5.2 对比

| 场景 | Props | Slots |
|------|-------|-------|
| 简单数据 | ✅ 适合 | ❌ 过度 |
| HTML 结构 | ❌ 不便 | ✅ 适合 |
| 自定义渲染 | ❌ 不灵活 | ✅ 灵活 |
| 类型检查 | ✅ 支持 | ❌ 不支持 |

## 六、检查插槽内容

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

// 检查插槽是否有内容
const hasHeader = !!slots.header
const hasFooter = !!slots.footer
</script>

<template>
  <div class="card">
    <header v-if="$slots.header">
      <slot name="header"></slot>
    </header>
    
    <main>
      <slot></slot>
    </main>
    
    <footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

## 七、总结

| 类型 | 语法 | 用途 |
|------|------|------|
| 默认插槽 | `<slot>` | 单个内容区域 |
| 具名插槽 | `<slot name="x">` | 多个内容区域 |
| 作用域插槽 | `<slot :data="data">` | 子传父数据，父决定渲染 |

## 参考资料

- [插槽 Slots](https://vuejs.org/guide/components/slots.html)

---

**下一节** → [第 8 节：依赖注入](./08-provide-inject.md)
