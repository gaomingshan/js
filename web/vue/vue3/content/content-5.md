# 条件渲染与列表渲染

> 掌握 v-if、v-show 和 v-for 的使用场景，理解 key 的重要性和性能优化策略。

## 条件渲染

### v-if、v-else-if、v-else

```vue
<script setup>
const type = ref('A')
const isLoggedIn = ref(false)
</script>

<template>
  <!-- 基础条件渲染 -->
  <div v-if="isLoggedIn">欢迎回来</div>
  <div v-else>请登录</div>
  
  <!-- 多分支条件 -->
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else-if="type === 'C'">C</div>
  <div v-else>其他</div>
  
  <!-- template 包裹多个元素 -->
  <template v-if="isLoggedIn">
    <h1>标题</h1>
    <p>内容</p>
    <button>操作</button>
  </template>
</template>
```

**特点**：
- 真正的**条件渲染**：条件为 false 时不会渲染 DOM
- **切换开销大**：会触发组件的销毁和重建
- **惰性渲染**：初始条件为 false 时不会渲染

---

### v-show

```vue
<script setup>
const isVisible = ref(true)
</script>

<template>
  <!-- 通过 CSS display 控制显示 -->
  <div v-show="isVisible">内容</div>
  
  <!-- 编译后 -->
  <!-- <div style="display: none;">内容</div> -->
</template>
```

**特点**：
- 始终渲染 DOM，通过 `display: none` 隐藏
- **初始渲染开销大**，但切换开销小
- 不支持 `<template>` 和 `v-else`

---

### v-if vs v-show 选择策略

| 场景 | 推荐 | 原因 |
|------|------|------|
| 频繁切换 | v-show | 避免重复渲染/销毁 |
| 运行时条件很少改变 | v-if | 减少初始渲染成本 |
| 条件为 false 的概率很高 | v-if | 节省初始渲染 |
| 需要配合 v-else | v-if | v-show 不支持 |
| 需要包裹多个元素 | v-if + template | v-show 不支持 template |

**示例**：

```vue
<script setup>
const showModal = ref(false) // 不常打开
const isMenuOpen = ref(false) // 频繁切换
</script>

<template>
  <!-- 使用 v-if：Modal 不常打开 -->
  <Modal v-if="showModal" />
  
  <!-- 使用 v-show：菜单频繁切换 -->
  <Menu v-show="isMenuOpen" />
</template>
```

---

## 列表渲染

### v-for 基础用法

```vue
<script setup>
const items = ref([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' },
  { id: 3, text: 'Item 3' }
])

const userInfo = reactive({
  name: 'Alice',
  age: 25,
  city: 'Beijing'
})
</script>

<template>
  <!-- 遍历数组 -->
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
  
  <!-- 访问索引 -->
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }}: {{ item.text }}
  </li>
  
  <!-- 遍历对象 -->
  <div v-for="(value, key) in userInfo" :key="key">
    {{ key }}: {{ value }}
  </div>
  
  <!-- 遍历对象（包含索引） -->
  <div v-for="(value, key, index) in userInfo" :key="key">
    {{ index }}. {{ key }}: {{ value }}
  </div>
  
  <!-- 遍历数字范围 -->
  <span v-for="n in 10" :key="n">{{ n }}</span>
  
  <!-- template 包裹多个元素 -->
  <template v-for="item in items" :key="item.id">
    <h3>{{ item.text }}</h3>
    <p>描述</p>
  </template>
</template>
```

---

### key 的作用与最佳实践

`key` 是 Vue 识别节点的唯一标识，用于优化 DOM 复用。

#### 为什么需要 key

```vue
<script setup>
const items = ref(['A', 'B', 'C'])

function reverse() {
  items.value.reverse()
}
</script>

<template>
  <!-- ❌ 不使用 key（或使用 index 作为 key） -->
  <div v-for="(item, index) in items" :key="index">
    <input :value="item">
  </div>
  
  <!-- 点击反转后，input 的值不会跟随数据变化 -->
  <button @click="reverse">反转</button>
</template>
```

**原因**：Vue 使用 "就地更新" 策略，只更新内容而不移动 DOM。

```vue
<!-- ✅ 使用唯一 key -->
<div v-for="item in items" :key="item.id">
  <input :value="item.name">
</div>
```

#### key 的最佳实践

```vue
<script setup>
const users = ref([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
])
</script>

<template>
  <!-- ✅ 使用唯一且稳定的 id -->
  <div v-for="user in users" :key="user.id">
    {{ user.name }}
  </div>
  
  <!-- ❌ 使用 index 作为 key（数据会重新排序时） -->
  <div v-for="(user, index) in users" :key="index">
    {{ user.name }}
  </div>
  
  <!-- ✅ 使用 index（列表不会重新排序且项目无 id） -->
  <div v-for="(color, index) in ['red', 'blue', 'green']" :key="index">
    {{ color }}
  </div>
  
  <!-- ❌ 使用对象作为 key -->
  <div v-for="user in users" :key="user">
  
  <!-- ✅ 使用字符串拼接（确保唯一） -->
  <div v-for="(item, index) in items" :key="`item-${index}`">
</template>
```

**key 的作用**：
1. **准确识别节点**：相同 key 的节点会被复用
2. **优化 Diff 算法**：快速定位需要更新的节点
3. **触发过渡动画**：节点有 key 才能正确触发过渡
4. **强制替换元素**：改变 key 会强制重新渲染

---

### v-if 与 v-for 优先级问题

**Vue 3 中 `v-if` 优先级高于 `v-for`**（Vue 2 相反）

```vue
<template>
  <!-- ❌ 错误：v-if 无法访问 item -->
  <li v-for="item in items" v-if="item.isActive" :key="item.id">
    {{ item.text }}
  </li>
  
  <!-- ✅ 方案1：使用计算属性过滤 -->
  <script setup>
  const activeItems = computed(() => 
    items.value.filter(item => item.isActive)
  )
  </script>
  <li v-for="item in activeItems" :key="item.id">
    {{ item.text }}
  </li>
  
  <!-- ✅ 方案2：使用 template 包裹 -->
  <template v-for="item in items" :key="item.id">
    <li v-if="item.isActive">{{ item.text }}</li>
  </template>
  
  <!-- ✅ 方案3：v-if 在外层（隐藏整个列表） -->
  <ul v-if="items.length > 0">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </ul>
</template>
```

---

## 列表渲染性能优化

### 1. 虚拟滚动

对于大列表（10000+ 项），只渲染可见区域。

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  text: `Item ${i}`
})))

const scrollTop = ref(0)
const itemHeight = 50
const visibleCount = 20

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = start + visibleCount
  return items.value.slice(start, end).map((item, index) => ({
    ...item,
    top: (start + index) * itemHeight
  }))
})

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}
</script>

<template>
  <div class="container" @scroll="handleScroll">
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ position: 'absolute', top: item.top + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 500px;
  overflow-y: auto;
  position: relative;
}
</style>
```

### 2. 分页加载

```vue
<script setup>
const allItems = ref([...]) // 所有数据
const page = ref(1)
const pageSize = 50

const displayedItems = computed(() => {
  return allItems.value.slice(0, page.value * pageSize)
})

function loadMore() {
  page.value++
}
</script>

<template>
  <div v-for="item in displayedItems" :key="item.id">
    {{ item.text }}
  </div>
  
  <button @click="loadMore">加载更多</button>
</template>
```

### 3. 使用 v-memo 优化

Vue 3.2+ 提供 `v-memo` 指令，记忆子树的渲染结果。

```vue
<script setup>
const items = ref([...])
</script>

<template>
  <div
    v-for="item in items"
    :key="item.id"
    v-memo="[item.id, item.selected]"
  >
    <!-- 只有 item.id 或 item.selected 变化时才重新渲染 -->
    {{ item.name }}
  </div>
</template>
```

---

## 易错点与边界情况

### 1. 数组变更检测

```typescript
const items = ref([1, 2, 3])

// ✅ 响应式：变更方法
items.value.push(4)
items.value.pop()
items.value.shift()
items.value.unshift(0)
items.value.splice(1, 1)
items.value.sort()
items.value.reverse()

// ✅ 响应式：替换整个数组
items.value = [4, 5, 6]
items.value = items.value.filter(x => x > 2)
items.value = items.value.map(x => x * 2)

// ✅ 响应式：直接修改索引（Vue 3 支持）
items.value[0] = 10

// ✅ 响应式：修改长度（Vue 3 支持）
items.value.length = 0
```

### 2. 对象属性的响应式

```typescript
const obj = reactive({ a: 1 })

// ✅ 响应式：修改已有属性
obj.a = 2

// ✅ 响应式：添加新属性（Vue 3 支持）
obj.b = 3

// ✅ 响应式：删除属性（Vue 3 支持）
delete obj.a
```

### 3. v-for 遍历响应式数据

```vue
<script setup>
// ref 包裹的数组
const items = ref([1, 2, 3])

// reactive 对象中的数组
const state = reactive({
  items: [1, 2, 3]
})
</script>

<template>
  <!-- ✅ 正确：访问 .value -->
  <div v-for="item in items" :key="item">
    {{ item }}
  </div>
  
  <!-- ✅ 正确：直接访问 -->
  <div v-for="item in state.items" :key="item">
    {{ item }}
  </div>
</template>
```

### 4. 组件上使用 v-for

```vue
<template>
  <!-- key 必须绑定在组件上，不能绑定在根元素上 -->
  <MyComponent
    v-for="item in items"
    :key="item.id"
    :data="item"
  />
  
  <!-- ❌ 错误：key 不能在组件内部 -->
  <!-- MyComponent.vue -->
  <template>
    <div :key="id">内容</div>
  </template>
</template>
```

---

## 前端工程实践

### 示例 1：动态表单字段

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface FormField {
  id: string
  type: 'text' | 'email' | 'number'
  label: string
  value: string
  required: boolean
}

const fields = ref<FormField[]>([
  { id: '1', type: 'text', label: '姓名', value: '', required: true },
  { id: '2', type: 'email', label: '邮箱', value: '', required: true }
])

function addField() {
  fields.value.push({
    id: Date.now().toString(),
    type: 'text',
    label: '新字段',
    value: '',
    required: false
  })
}

function removeField(id: string) {
  const index = fields.value.findIndex(f => f.id === id)
  if (index > -1) {
    fields.value.splice(index, 1)
  }
}
</script>

<template>
  <form>
    <div v-for="field in fields" :key="field.id" class="field">
      <label>
        {{ field.label }}
        <span v-if="field.required">*</span>
      </label>
      <input
        v-model="field.value"
        :type="field.type"
        :required="field.required"
      >
      <button type="button" @click="removeField(field.id)">删除</button>
    </div>
    
    <button type="button" @click="addField">添加字段</button>
  </form>
</template>
```

### 示例 2：可拖拽排序列表

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  text: string
}

const items = ref<Item[]>([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' },
  { id: 3, text: 'Item 3' }
])

let draggedItem: Item | null = null

function handleDragStart(item: Item) {
  draggedItem = item
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDrop(targetItem: Item) {
  if (!draggedItem) return
  
  const draggedIndex = items.value.findIndex(i => i.id === draggedItem!.id)
  const targetIndex = items.value.findIndex(i => i.id === targetItem.id)
  
  items.value.splice(draggedIndex, 1)
  items.value.splice(targetIndex, 0, draggedItem)
  
  draggedItem = null
}
</script>

<template>
  <div
    v-for="item in items"
    :key="item.id"
    draggable="true"
    @dragstart="handleDragStart(item)"
    @dragover="handleDragOver"
    @drop="handleDrop(item)"
    class="item"
  >
    {{ item.text }}
  </div>
</template>

<style scoped>
.item {
  padding: 10px;
  margin: 5px;
  background: #f0f0f0;
  cursor: move;
}
</style>
```

### 示例 3：树形结构渲染

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  expanded?: boolean
}

const tree = ref<TreeNode[]>([
  {
    id: '1',
    label: '节点1',
    expanded: true,
    children: [
      { id: '1-1', label: '节点1-1' },
      {
        id: '1-2',
        label: '节点1-2',
        expanded: false,
        children: [
          { id: '1-2-1', label: '节点1-2-1' }
        ]
      }
    ]
  },
  { id: '2', label: '节点2' }
])

function toggle(node: TreeNode) {
  node.expanded = !node.expanded
}
</script>

<template>
  <!-- 递归组件 -->
  <TreeNode :nodes="tree" />
</template>

<!-- TreeNode.vue -->
<script setup lang="ts">
defineProps<{
  nodes: TreeNode[]
}>()
</script>

<template>
  <ul>
    <li v-for="node in nodes" :key="node.id">
      <span @click="toggle(node)">
        <span v-if="node.children">
          {{ node.expanded ? '▼' : '▶' }}
        </span>
        {{ node.label }}
      </span>
      
      <TreeNode
        v-if="node.expanded && node.children"
        :nodes="node.children"
      />
    </li>
  </ul>
</template>
```

### 示例 4：权限控制渲染

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

type Permission = 'read' | 'write' | 'delete'

const userPermissions = ref<Permission[]>(['read', 'write'])

const buttons = [
  { label: '查看', permission: 'read' as Permission },
  { label: '编辑', permission: 'write' as Permission },
  { label: '删除', permission: 'delete' as Permission }
]

const visibleButtons = computed(() => {
  return buttons.filter(btn => 
    userPermissions.value.includes(btn.permission)
  )
})

function hasPermission(permission: Permission) {
  return userPermissions.value.includes(permission)
}
</script>

<template>
  <!-- 方案1：计算属性过滤 -->
  <button
    v-for="btn in visibleButtons"
    :key="btn.permission"
  >
    {{ btn.label }}
  </button>
  
  <!-- 方案2：v-if 判断 -->
  <template v-for="btn in buttons" :key="btn.permission">
    <button v-if="hasPermission(btn.permission)">
      {{ btn.label }}
    </button>
  </template>
</template>
```

---

## 最佳实践

1. **频繁切换用 v-show**：避免重复渲染
2. **总是使用 key**：确保列表渲染的正确性
3. **key 使用唯一 id**：不要用 index（除非列表静态）
4. **避免 v-if 与 v-for 同时使用**：用计算属性过滤
5. **大列表使用虚拟滚动**：性能优化
6. **合理使用 v-memo**：减少不必要的重新渲染
7. **优先使用数组方法**：filter、map、slice 等

---

## 参考资料

- [条件渲染](https://cn.vuejs.org/guide/essentials/conditional.html)
- [列表渲染](https://cn.vuejs.org/guide/essentials/list.html)
- [v-memo API](https://cn.vuejs.org/api/built-in-directives.html#v-memo)
