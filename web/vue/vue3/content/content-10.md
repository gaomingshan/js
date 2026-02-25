# 插槽系统深入

> 插槽（Slots）是 Vue 实现内容分发的机制，允许父组件向子组件传递模板内容。

## 核心概念

插槽允许组件像 HTML 元素一样组合，父组件可以向子组件插入任意内容。

### 基础插槽

```vue
<!-- Button.vue -->
<template>
  <button class="btn">
    <!-- 插槽出口 -->
    <slot></slot>
  </button>
</template>

<!-- 使用 -->
<template>
  <Button>
    点击我 <!-- 插槽内容 -->
  </Button>
  
  <!-- 渲染结果 -->
  <button class="btn">
    点击我
  </button>
</template>
```

### 默认内容

```vue
<!-- Button.vue -->
<template>
  <button>
    <slot>
      <!-- 默认内容：当父组件没有提供内容时显示 -->
      默认按钮
    </slot>
  </button>
</template>

<!-- 使用 -->
<template>
  <Button>自定义文本</Button> <!-- 显示：自定义文本 -->
  <Button></Button>            <!-- 显示：默认按钮 -->
</template>
```

---

## 具名插槽

多个插槽时需要命名来区分。

```vue
<!-- Layout.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header"></slot>
    </header>
    
    <main>
      <!-- 默认插槽（未命名） -->
      <slot></slot>
    </main>
    
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<!-- 使用 -->
<template>
  <Layout>
    <!-- 使用 v-slot 指令 -->
    <template v-slot:header>
      <h1>页面标题</h1>
    </template>
    
    <!-- 简写形式：# -->
    <template #header>
      <h1>页面标题</h1>
    </template>
    
    <!-- 默认插槽 -->
    <p>主要内容</p>
    
    <!-- 或明确指定 default -->
    <template #default>
      <p>主要内容</p>
    </template>
    
    <template #footer>
      <p>页脚信息</p>
    </template>
  </Layout>
</template>
```

### 具名插槽的简写

```vue
<template>
  <!-- 完整形式 -->
  <Layout>
    <template v-slot:header>
      <h1>标题</h1>
    </template>
  </Layout>
  
  <!-- 简写形式 -->
  <Layout>
    <template #header>
      <h1>标题</h1>
    </template>
  </Layout>
  
  <!-- ⚠️ 简写只适用于具名插槽 -->
  <Layout>
    <template #default>内容</template> <!-- ✅ -->
    <template #>内容</template>        <!-- ❌ 无效 -->
  </Layout>
</template>
```

---

## 作用域插槽

子组件可以向插槽传递数据，父组件可以访问这些数据。

### 基础用法

```vue
<!-- TodoList.vue -->
<script setup lang="ts">
interface Todo {
  id: number
  text: string
  completed: boolean
}

const props = defineProps<{
  todos: Todo[]
}>()
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <!-- 向插槽传递数据 -->
      <slot :todo="todo" :index="index"></slot>
    </li>
  </ul>
</template>

<!-- 使用 -->
<script setup>
const todos = ref([
  { id: 1, text: '学习 Vue', completed: false },
  { id: 2, text: '写代码', completed: true }
])
</script>

<template>
  <TodoList :todos="todos">
    <!-- 接收插槽数据 -->
    <template #default="{ todo, index }">
      <span :class="{ completed: todo.completed }">
        {{ index }}. {{ todo.text }}
      </span>
    </template>
  </TodoList>
  
  <!-- 简写：单独的默认插槽可以直接用组件标签接收 -->
  <TodoList :todos="todos" v-slot="{ todo }">
    <span>{{ todo.text }}</span>
  </TodoList>
</template>
```

### 具名作用域插槽

```vue
<!-- DataTable.vue -->
<script setup lang="ts">
interface Column {
  key: string
  label: string
}

const props = defineProps<{
  columns: Column[]
  data: Record<string, any>[]
}>()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          <!-- 表头插槽 -->
          <slot name="header" :column="col">
            {{ col.label }}
          </slot>
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
        <td v-for="col in columns" :key="col.key">
          <!-- 单元格插槽 -->
          <slot
            name="cell"
            :row="row"
            :column="col"
            :value="row[col.key]"
          >
            {{ row[col.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<!-- 使用 -->
<template>
  <DataTable :columns="columns" :data="data">
    <!-- 自定义表头 -->
    <template #header="{ column }">
      <strong>{{ column.label }}</strong>
    </template>
    
    <!-- 自定义单元格 -->
    <template #cell="{ row, column, value }">
      <span v-if="column.key === 'status'">
        <Badge :type="value" />
      </span>
      <span v-else>{{ value }}</span>
    </template>
  </DataTable>
</template>
```

---

## 动态插槽名

插槽名可以是动态的。

```vue
<script setup>
const currentSlot = ref('header')
</script>

<template>
  <Layout>
    <!-- 动态插槽名 -->
    <template #[currentSlot]>
      <h1>动态内容</h1>
    </template>
    
    <!-- 动态作用域插槽 -->
    <template #[`item-${index}`]="slotProps">
      {{ slotProps }}
    </template>
  </Layout>
</template>
```

---

## 插槽的编译与渲染

### 插槽内容的作用域

```vue
<!-- ❌ 错误理解 -->
<template>
  <TodoList :todos="todos">
    <!-- 插槽内容在父组件作用域编译 -->
    <!-- 无法访问子组件的数据 -->
    <div>{{ todo.text }}</div> <!-- todo 未定义 -->
  </TodoList>
</template>

<!-- ✅ 正确方式：使用作用域插槽 -->
<template>
  <TodoList :todos="todos">
    <template #default="{ todo }">
      <div>{{ todo.text }}</div>
    </template>
  </TodoList>
</template>
```

**规则**：插槽内容可以访问父组件的数据，但无法访问子组件的数据（除非通过作用域插槽传递）。

### $slots 对象

```vue
<!-- Child.vue -->
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

// 检查插槽是否被提供
const hasHeader = computed(() => !!slots.header)
const hasDefault = computed(() => !!slots.default)
</script>

<template>
  <div>
    <header v-if="hasHeader">
      <slot name="header"></slot>
    </header>
    
    <main v-if="hasDefault">
      <slot></slot>
    </main>
    
    <footer v-else>
      <p>没有提供内容</p>
    </footer>
  </div>
</template>
```

---

## 无渲染组件

只提供逻辑，不渲染任何自己的 DOM，完全由插槽决定渲染内容。

```vue
<!-- Mouse.vue - 无渲染组件 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(event: MouseEvent) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => {
  window.addEventListener('mousemove', update)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', update)
})
</script>

<template>
  <!-- 不渲染任何元素，只传递数据 -->
  <slot :x="x" :y="y"></slot>
</template>

<!-- 使用 -->
<template>
  <Mouse v-slot="{ x, y }">
    <p>鼠标位置：{{ x }}, {{ y }}</p>
  </Mouse>
  
  <Mouse v-slot="{ x, y }">
    <div :style="{ position: 'absolute', left: x + 'px', top: y + 'px' }">
      跟随鼠标
    </div>
  </Mouse>
</template>
```

---

## 易错点与边界情况

### 1. 插槽作用域规则

```vue
<!-- 父组件 -->
<script setup>
const message = 'Hello from parent'
</script>

<template>
  <Child>
    <!-- ✅ 可以访问父组件数据 -->
    <p>{{ message }}</p>
    
    <!-- ❌ 不能访问子组件数据 -->
    <p>{{ childData }}</p>
    
    <!-- ✅ 通过作用域插槽访问子组件数据 -->
    <template #default="{ childData }">
      <p>{{ childData }}</p>
    </template>
  </Child>
</template>
```

### 2. 默认插槽的简写限制

```vue
<!-- ✅ 单独的默认插槽可以简写 -->
<template>
  <Child v-slot="slotProps">
    {{ slotProps }}
  </Child>
</template>

<!-- ❌ 有其他具名插槽时不能简写 -->
<template>
  <Child v-slot="slotProps">  <!-- 错误 -->
    {{ slotProps }}
    <template #header>标题</template>
  </Child>
</template>

<!-- ✅ 必须明确指定 default -->
<template>
  <Child>
    <template #default="slotProps">
      {{ slotProps }}
    </template>
    <template #header>标题</template>
  </Child>
</template>
```

### 3. 插槽解构

```vue
<template>
  <!-- ✅ 解构 -->
  <Child v-slot="{ user, index }">
    {{ user.name }} - {{ index }}
  </Child>
  
  <!-- ✅ 重命名 -->
  <Child v-slot="{ user: person }">
    {{ person.name }}
  </Child>
  
  <!-- ✅ 默认值 -->
  <Child v-slot="{ user = { name: 'Guest' } }">
    {{ user.name }}
  </Child>
  
  <!-- ✅ 混合使用 -->
  <Child v-slot="{ user: { name }, index = 0 }">
    {{ name }} - {{ index }}
  </Child>
</template>
```

### 4. 多个插槽的性能

```vue
<!-- ⚠️ 每个插槽都会创建一个新的渲染函数 -->
<template>
  <Component>
    <template #slot1>...</template>
    <template #slot2>...</template>
    <template #slot3>...</template>
    <!-- 多个插槽 = 多个渲染函数 -->
  </Component>
</template>
```

---

## 前端工程实践

### 示例 1：Card 组件

```vue
<!-- Card.vue -->
<script setup lang="ts">
interface Props {
  title?: string
  bordered?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  hoverable: false
})

const slots = useSlots()
</script>

<template>
  <div
    class="card"
    :class="{
      'card-bordered': bordered,
      'card-hoverable': hoverable
    }"
  >
    <div v-if="slots.header || title" class="card-header">
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div v-if="slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
    
    <div v-if="slots.extra" class="card-extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<!-- 使用 -->
<template>
  <!-- 基础用法 -->
  <Card title="标题">
    <p>卡片内容</p>
  </Card>
  
  <!-- 自定义表头 -->
  <Card>
    <template #header>
      <div style="display: flex; justify-content: space-between;">
        <h3>自定义标题</h3>
        <button>操作</button>
      </div>
    </template>
    
    <p>卡片内容</p>
    
    <template #footer>
      <button>确定</button>
      <button>取消</button>
    </template>
  </Card>
</template>
```

### 示例 2：列表渲染组件

```vue
<!-- List.vue -->
<script setup lang="ts" generic="T">
interface Props {
  items: T[]
  loading?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: '暂无数据'
})

const slots = useSlots()
</script>

<template>
  <div class="list">
    <!-- 加载状态 -->
    <div v-if="loading" class="list-loading">
      <slot name="loading">
        <span>加载中...</span>
      </slot>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!items.length" class="list-empty">
      <slot name="empty">
        <p>{{ emptyText }}</p>
      </slot>
    </div>
    
    <!-- 列表项 -->
    <div v-else class="list-items">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="list-item"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        >
          {{ item }}
        </slot>
      </div>
    </div>
    
    <!-- 底部 -->
    <div v-if="slots.footer" class="list-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<!-- 使用 -->
<script setup>
interface User {
  id: number
  name: string
  avatar: string
}

const users = ref<User[]>([])
const loading = ref(false)
</script>

<template>
  <List :items="users" :loading="loading">
    <!-- 自定义列表项 -->
    <template #item="{ item, index }">
      <div class="user-item">
        <img :src="item.avatar" :alt="item.name">
        <span>{{ index + 1 }}. {{ item.name }}</span>
      </div>
    </template>
    
    <!-- 自定义空状态 -->
    <template #empty>
      <div>
        <img src="/empty.png">
        <p>还没有用户</p>
      </div>
    </template>
    
    <!-- 自定义加载状态 -->
    <template #loading>
      <Spinner />
    </template>
  </List>
</template>
```

### 示例 3：表单字段组件

```vue
<!-- FormField.vue -->
<script setup lang="ts">
interface Props {
  label: string
  required?: boolean
  error?: string
  help?: string
}

const props = defineProps<Props>()

const slots = useSlots()

// 生成唯一 ID
const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`
</script>

<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label :for="fieldId" class="field-label">
      <slot name="label">
        {{ label }}
      </slot>
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="field-control">
      <!-- 前置内容 -->
      <div v-if="slots.prefix" class="field-prefix">
        <slot name="prefix"></slot>
      </div>
      
      <!-- 主要内容 -->
      <slot :id="fieldId"></slot>
      
      <!-- 后置内容 -->
      <div v-if="slots.suffix" class="field-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    
    <!-- 帮助文本 -->
    <div v-if="help && !error" class="field-help">
      <slot name="help">{{ help }}</slot>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="field-error">
      <slot name="error">{{ error }}</slot>
    </div>
  </div>
</template>

<!-- 使用 -->
<template>
  <FormField
    label="用户名"
    required
    :error="errors.username"
    help="6-20个字符"
  >
    <!-- 前置图标 -->
    <template #prefix>
      <UserIcon />
    </template>
    
    <!-- 输入框 -->
    <input
      v-model="form.username"
      type="text"
    >
    
    <!-- 后置清除按钮 -->
    <template #suffix>
      <button @click="form.username = ''">清除</button>
    </template>
  </FormField>
</template>
```

### 示例 4：递归树组件

```vue
<!-- TreeNode.vue -->
<script setup lang="ts">
interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

interface Props {
  node: TreeNode
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

const expanded = ref(true)

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="tree-node" :style="{ paddingLeft: level * 20 + 'px' }">
    <div class="node-content" @click="toggle">
      <!-- 自定义节点内容 -->
      <slot name="node" :node="node" :expanded="expanded" :toggle="toggle">
        <span v-if="node.children" class="toggle-icon">
          {{ expanded ? '▼' : '▶' }}
        </span>
        <span>{{ node.label }}</span>
      </slot>
    </div>
    
    <!-- 递归渲染子节点 -->
    <div v-if="expanded && node.children" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
      >
        <!-- 传递插槽到递归组件 -->
        <template #node="slotProps">
          <slot name="node" v-bind="slotProps"></slot>
        </template>
      </TreeNode>
    </div>
  </div>
</template>

<!-- 使用 -->
<template>
  <TreeNode :node="rootNode">
    <template #node="{ node, expanded, toggle }">
      <div class="custom-node">
        <button v-if="node.children" @click="toggle">
          {{ expanded ? '-' : '+' }}
        </button>
        <strong>{{ node.label }}</strong>
        <span>({{ node.children?.length || 0 }})</span>
      </div>
    </template>
  </TreeNode>
</template>
```

---

## 最佳实践

1. **提供默认内容**：提升组件易用性
2. **语义化插槽命名**：header、footer、content 等
3. **合理使用作用域插槽**：需要自定义渲染时提供数据
4. **检查插槽是否存在**：使用 `$slots` 或 `useSlots()`
5. **无渲染组件模式**：逻辑复用的强大工具
6. **文档化插槽**：说明插槽用途和提供的数据
7. **避免过多插槽**：保持组件简单
8. **插槽内容的响应式**：确保传递响应式数据

---

## 参考资料

- [插槽 Slots](https://cn.vuejs.org/guide/components/slots.html)
- [作用域插槽](https://cn.vuejs.org/guide/components/slots.html#scoped-slots)
- [useSlots API](https://cn.vuejs.org/api/sfc-script-setup.html#useslots-useattrs)
