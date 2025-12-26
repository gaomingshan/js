# 第 06 节：其他状态管理库

## 概述

除了 Pinia 和 Vuex，前端生态中还有许多其他的状态管理解决方案。了解这些方案的特点和适用场景，有助于在不同项目中选择最合适的状态管理工具。

## 一、轻量级状态管理

### 1.1 Valtio

```javascript
// Valtio - 基于 Proxy 的简单状态管理
import { proxy, useSnapshot } from 'valtio'

// 创建状态
const state = proxy({
  count: 0,
  user: null,
  todos: []
})

// 直接修改状态
state.count++
state.user = { id: 1, name: 'Alice' }
state.todos.push({ id: 1, text: 'Learn Valtio', done: false })

// 在 Vue 组件中使用
const Counter = defineComponent({
  setup() {
    const snap = useSnapshot(state)
    
    const increment = () => {
      state.count++ // 直接修改
    }
    
    return () => h('div', [
      h('p', `Count: ${snap.count}`),
      h('button', { onClick: increment }, '+1')
    ])
  }
})

// 嵌套对象也是响应式的
const nestedState = proxy({
  user: {
    profile: {
      name: 'Alice',
      age: 25
    }
  }
})

// 深层修改也能被检测到
nestedState.user.profile.age = 26
```

### 1.2 Zustand (Vue 版本)

```javascript
// 类似 Zustand 的 Vue 实现
import { create } from 'zustand-vue'

const useStore = create((set, get) => ({
  // 状态
  count: 0,
  user: null,
  todos: [],
  
  // 操作
  increment: () => set((state) => ({ count: state.count + 1 })),
  
  decrement: () => set((state) => ({ count: state.count - 1 })),
  
  setUser: (user) => set({ user }),
  
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { 
      id: Date.now(), 
      text, 
      done: false 
    }]
  })),
  
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  })),
  
  // 计算属性
  get doneTodos() {
    return get().todos.filter(todo => todo.done)
  },
  
  // 异步操作
  fetchUser: async (id) => {
    const user = await api.fetchUser(id)
    set({ user })
  }
}))

// 在组件中使用
const TodoApp = defineComponent({
  setup() {
    const store = useStore()
    
    return () => h('div', [
      h('h1', `Count: ${store.count}`),
      h('button', { onClick: store.increment }, 'Increment'),
      h('ul', store.todos.map(todo => 
        h('li', { key: todo.id }, todo.text)
      ))
    ])
  }
})
```

## 二、响应式状态管理

### 2.1 VueUse

```javascript
// VueUse 提供的状态管理工具
import { 
  createGlobalState, 
  useLocalStorage, 
  useSessionStorage,
  createSharedComposable
} from '@vueuse/core'

// 全局状态
const useGlobalCounter = createGlobalState(() => {
  const count = ref(0)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return { count, increment, decrement }
})

// 持久化状态
const useSettings = () => {
  const theme = useLocalStorage('theme', 'light')
  const language = useLocalStorage('language', 'zh-CN')
  
  return { theme, language }
}

// 共享组合式函数
const useSharedAuth = createSharedComposable(() => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  
  const login = async (credentials) => {
    const response = await api.login(credentials)
    user.value = response.user
    token.value = response.token
    localStorage.setItem('token', response.token)
  }
  
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }
  
  return { user, token, login, logout }
})

// 在组件中使用
const MyComponent = defineComponent({
  setup() {
    const { count, increment } = useGlobalCounter()
    const { theme } = useSettings()
    const { user, login, logout } = useSharedAuth()
    
    return {
      count,
      increment,
      theme,
      user,
      login,
      logout
    }
  }
})
```

### 2.2 Harlem

```javascript
// Harlem - Vue 专用的状态管理
import { createStore } from '@harlem/core'
import { createSnapshot } from '@harlem/snapshot'
import { createDevtools } from '@harlem/devtools'

// 创建 store
const STATE = {
  count: 0,
  user: null,
  todos: []
}

const {
  state,
  getter,
  mutation,
  action,
  ...store
} = createStore('app', STATE)

// Getter
const doubleCount = getter('double-count', state => state.count * 2)

// Mutations
const increment = mutation('increment', state => {
  state.count++
})

const setUser = mutation('set-user', (state, user) => {
  state.user = user
})

// Actions
const fetchUser = action('fetch-user', async (id) => {
  const user = await api.fetchUser(id)
  setUser(user)
})

// 插件
store.use(createSnapshot())
store.use(createDevtools())

// 在组件中使用
export default defineComponent({
  setup() {
    return {
      count: readonly(state.count),
      doubleCount,
      increment,
      fetchUser
    }
  }
})
```

## 三、专用场景方案

### 3.1 TanStack Query (Vue Query)

```javascript
// 专门处理服务器状态
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// 查询数据
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.fetchUsers(),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    cacheTime: 10 * 60 * 1000, // 缓存10分钟
    retry: 3, // 失败重试3次
    refetchOnWindowFocus: false
  })
}

// 分页查询
export function useUsersPaginated(page, pageSize) {
  return useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => api.fetchUsers({ page, pageSize }),
    keepPreviousData: true // 保持上一页数据
  })
}

// 修改数据
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData) => api.createUser(userData),
    
    // 乐观更新
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] })
      
      const previousUsers = queryClient.getQueryData(['users'])
      
      queryClient.setQueryData(['users'], old => [
        ...old,
        { ...newUser, id: 'temp-' + Date.now() }
      ])
      
      return { previousUsers }
    },
    
    // 成功后更新
    onSuccess: (newUser, variables, context) => {
      queryClient.setQueryData(['users'], old => 
        old.map(user => 
          user.id === 'temp-' + Date.now() ? newUser : user
        )
      )
    },
    
    // 失败回滚
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
    }
  })
}

// 在组件中使用
const UserManagement = defineComponent({
  setup() {
    const { 
      data: users, 
      isLoading, 
      error, 
      refetch 
    } = useUsers()
    
    const createUserMutation = useCreateUser()
    
    const handleCreateUser = async (userData) => {
      try {
        await createUserMutation.mutateAsync(userData)
        // 成功处理
      } catch (error) {
        // 错误处理
      }
    }
    
    return {
      users,
      isLoading,
      error,
      refetch,
      handleCreateUser,
      isCreating: createUserMutation.isLoading
    }
  }
})
```

### 3.2 XState

```javascript
// 状态机管理复杂状态
import { createMachine, interpret } from 'xstate'
import { useMachine } from '@xstate/vue'

// 定义状态机
const fetchMachine = createMachine({
  id: 'fetch',
  initial: 'idle',
  
  context: {
    data: null,
    error: null,
    retryCount: 0
  },
  
  states: {
    idle: {
      on: {
        FETCH: 'loading'
      }
    },
    
    loading: {
      invoke: {
        id: 'fetchData',
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: 'setData'
        },
        onError: {
          target: 'failure',
          actions: 'setError'
        }
      },
      
      on: {
        CANCEL: 'idle'
      }
    },
    
    success: {
      on: {
        FETCH: 'loading',
        RESET: 'idle'
      }
    },
    
    failure: {
      on: {
        RETRY: {
          target: 'loading',
          cond: 'canRetry',
          actions: 'incrementRetry'
        },
        RESET: 'idle'
      }
    }
  }
}, {
  services: {
    fetchData: () => api.fetchData()
  },
  
  actions: {
    setData: (context, event) => {
      context.data = event.data
    },
    
    setError: (context, event) => {
      context.error = event.data
    },
    
    incrementRetry: (context) => {
      context.retryCount++
    }
  },
  
  guards: {
    canRetry: (context) => context.retryCount < 3
  }
})

// 在 Vue 组件中使用
const DataFetcher = defineComponent({
  setup() {
    const { state, send } = useMachine(fetchMachine)
    
    const fetchData = () => send('FETCH')
    const retry = () => send('RETRY')
    const cancel = () => send('CANCEL')
    const reset = () => send('RESET')
    
    return {
      state,
      fetchData,
      retry,
      cancel,
      reset
    }
  },
  
  template: `
    <div>
      <div v-if="state.matches('idle')">
        <button @click="fetchData">获取数据</button>
      </div>
      
      <div v-else-if="state.matches('loading')">
        <p>加载中...</p>
        <button @click="cancel">取消</button>
      </div>
      
      <div v-else-if="state.matches('success')">
        <p>数据：{{ state.context.data }}</p>
        <button @click="fetchData">重新获取</button>
        <button @click="reset">重置</button>
      </div>
      
      <div v-else-if="state.matches('failure')">
        <p>错误：{{ state.context.error }}</p>
        <button @click="retry" v-if="state.context.retryCount < 3">
          重试 ({{ state.context.retryCount }}/3)
        </button>
        <button @click="reset">重置</button>
      </div>
    </div>
  `
})
```

## 四、原子化状态管理

### 4.1 Jotai 概念

```javascript
// 原子化状态管理概念（Jotai 风格）
import { atom, computed } from 'vue'

// 原子状态
const countAtom = () => {
  const value = ref(0)
  return {
    value,
    increment: () => value.value++,
    decrement: () => value.value--
  }
}

// 派生原子
const doubleCountAtom = (countAtom) => {
  return computed(() => countAtom.value * 2)
}

// 异步原子
const userAtom = () => {
  const user = ref(null)
  const loading = ref(false)
  
  const fetchUser = async (id) => {
    loading.value = true
    try {
      user.value = await api.fetchUser(id)
    } finally {
      loading.value = false
    }
  }
  
  return { user, loading, fetchUser }
}

// 原子组合
const useAtomicStore = () => {
  const counter = countAtom()
  const doubleCount = doubleCountAtom(counter.value)
  const userState = userAtom()
  
  return {
    ...counter,
    doubleCount,
    ...userState
  }
}

// 在组件中使用
const MyComponent = defineComponent({
  setup() {
    const store = useAtomicStore()
    
    return {
      count: store.value,
      doubleCount: store.doubleCount,
      increment: store.increment,
      user: store.user,
      fetchUser: store.fetchUser
    }
  }
})
```

### 4.2 Nano Store 风格

```javascript
// 微型状态管理
class NanoStore {
  constructor(initialValue) {
    this.value = ref(initialValue)
    this.subscribers = new Set()
  }
  
  get() {
    return this.value.value
  }
  
  set(newValue) {
    this.value.value = newValue
    this.notify()
  }
  
  update(updater) {
    this.set(updater(this.get()))
  }
  
  subscribe(callback) {
    this.subscribers.add(callback)
    
    return () => {
      this.subscribers.delete(callback)
    }
  }
  
  notify() {
    this.subscribers.forEach(callback => callback(this.get()))
  }
}

// 创建 store
const counterStore = new NanoStore(0)
const userStore = new NanoStore(null)

// 操作方法
const increment = () => counterStore.update(count => count + 1)
const setUser = (user) => userStore.set(user)

// 在组件中使用
const Counter = defineComponent({
  setup() {
    const count = counterStore.value
    
    return {
      count,
      increment
    }
  }
})
```

## 五、特定用途状态管理

### 5.1 表单状态管理

```javascript
// VeeValidate + 状态管理
import { useForm, useField } from 'vee-validate'
import { z } from 'zod'

// 表单状态管理
const useFormStore = () => {
  const forms = ref(new Map())
  
  const createForm = (formId, schema) => {
    const form = useForm({
      validationSchema: schema,
      initialValues: {}
    })
    
    forms.value.set(formId, form)
    return form
  }
  
  const getForm = (formId) => {
    return forms.value.get(formId)
  }
  
  const removeForm = (formId) => {
    forms.value.delete(formId)
  }
  
  return {
    createForm,
    getForm,
    removeForm
  }
}

// 使用示例
const LoginForm = defineComponent({
  setup() {
    const formStore = useFormStore()
    
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    })
    
    const form = formStore.createForm('login', schema)
    const { handleSubmit, isSubmitting } = form
    
    const { value: email, errorMessage: emailError } = useField('email')
    const { value: password, errorMessage: passwordError } = useField('password')
    
    const onSubmit = handleSubmit(async (values) => {
      try {
        await api.login(values)
        router.push('/dashboard')
      } catch (error) {
        form.setFieldError('email', error.message)
      }
    })
    
    return {
      email,
      password,
      emailError,
      passwordError,
      onSubmit,
      isSubmitting
    }
  }
})
```

### 5.2 路由状态管理

```javascript
// 路由相关状态管理
import { useRouter, useRoute } from 'vue-router'

const useRouteState = () => {
  const router = useRouter()
  const route = useRoute()
  
  // 路由历史
  const history = ref([])
  
  // 面包屑
  const breadcrumbs = computed(() => {
    return route.matched.map(record => ({
      name: record.name,
      path: record.path,
      meta: record.meta
    }))
  })
  
  // 导航守卫状态
  const isNavigating = ref(false)
  
  // 页面标题
  const pageTitle = computed(() => {
    return route.meta?.title || 'Default Title'
  })
  
  // 权限检查
  const hasPermission = computed(() => {
    const requiredPermissions = route.meta?.permissions || []
    const userPermissions = getCurrentUserPermissions()
    
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )
  })
  
  // 导航方法
  const navigateTo = (path) => {
    history.value.push(route.path)
    router.push(path)
  }
  
  const goBack = () => {
    if (history.value.length > 0) {
      const previousPath = history.value.pop()
      router.push(previousPath)
    } else {
      router.go(-1)
    }
  }
  
  return {
    route: readonly(route),
    breadcrumbs,
    isNavigating,
    pageTitle,
    hasPermission,
    navigateTo,
    goBack
  }
}
```

## 六、性能对比

### 6.1 包体积对比

```javascript
const bundleSizeComparison = {
  'Pinia': '1.5KB',
  'Vuex 4': '2.5KB',
  'Valtio': '2.8KB',
  'Zustand': '2.2KB',
  'TanStack Query': '12KB',
  'XState': '15KB',
  'VueUse (createGlobalState)': '0.5KB',
  'Harlem': '3KB'
}
```

### 6.2 运行时性能

```javascript
const performanceComparison = {
  readPerformance: {
    'Pinia': '★★★★★',
    'Vuex': '★★★★☆',
    'Valtio': '★★★★☆',
    'Native Reactive': '★★★★★'
  },
  
  writePerformance: {
    'Pinia': '★★★★★',
    'Vuex': '★★★☆☆', // mutations 开销
    'Valtio': '★★★★☆',
    'Native Reactive': '★★★★★'
  },
  
  devtoolsSupport: {
    'Pinia': '★★★★★',
    'Vuex': '★★★★★',
    'Valtio': '★★★☆☆',
    'XState': '★★★★★'
  }
}
```

## 七、选择建议

### 7.1 按场景选择

```javascript
const scenarioBasedSelection = {
  // 简单全局状态
  simpleGlobalState: ['VueUse createGlobalState', 'Valtio'],
  
  // 复杂应用状态
  complexAppState: ['Pinia', 'Vuex', 'Harlem'],
  
  // 服务器状态
  serverState: ['TanStack Query', 'SWR'],
  
  // 表单状态
  formState: ['VeeValidate', 'Formik'],
  
  // 复杂业务逻辑
  complexLogic: ['XState', 'Robot'],
  
  // 微型应用
  microApps: ['Nano Store', 'Valtio'],
  
  // 原型开发
  prototyping: ['VueUse', 'Valtio']
}
```

### 7.2 技术栈匹配

```javascript
const techStackMatching = {
  vue3Composition: ['Pinia', 'VueUse', 'Valtio'],
  vue3Options: ['Pinia', 'Vuex'],
  vue2: ['Vuex'],
  typescript: ['Pinia', 'XState', 'TanStack Query'],
  javascript: ['所有方案都支持'],
  ssr: ['Pinia', 'Vuex', 'TanStack Query'],
  mobile: ['轻量级方案优先']
}
```

## 八、最佳实践

### 8.1 混合使用策略

```javascript
// 实际项目中的混合使用
const hybridStateManagement = {
  // 应用状态 - Pinia
  appState: usePiniaStore,
  
  // 服务器状态 - TanStack Query
  serverState: useTanStackQuery,
  
  // 表单状态 - VeeValidate
  formState: useVeeValidate,
  
  // 临时状态 - VueUse
  temporaryState: useVueUse,
  
  // 复杂流程 - XState
  complexFlows: useXState
}

// 在组件中协调使用
const MyComponent = defineComponent({
  setup() {
    // 全局应用状态
    const appStore = useAppStore()
    
    // 用户数据（服务器状态）
    const { data: users, refetch } = useUsers()
    
    // 表单状态
    const { handleSubmit, isSubmitting } = useForm()
    
    // 临时 UI 状态
    const isModalOpen = useLocalStorage('modal-open', false)
    
    return {
      appStore,
      users,
      refetch,
      handleSubmit,
      isSubmitting,
      isModalOpen
    }
  }
})
```

### 8.2 迁移策略

```javascript
// 渐进式采用新状态管理方案
const migrationStrategy = {
  phase1: {
    description: '在新功能中使用新方案',
    action: '避免影响现有代码'
  },
  
  phase2: {
    description: '迁移独立模块',
    action: '选择解耦度高的模块先迁移'
  },
  
  phase3: {
    description: '迁移核心状态',
    action: '确保充分测试'
  },
  
  phase4: {
    description: '清理旧代码',
    action: '移除不再使用的状态管理代码'
  }
}
```

## 九、未来趋势

### 9.1 状态管理发展方向

```javascript
const futuretrends = {
  // 更简单的 API
  simplerAPIs: {
    trend: '去除样板代码，更直观的状态操作',
    examples: ['Pinia', 'Valtio', 'Nano Store']
  },
  
  // 更好的 TypeScript 支持
  betterTypeScript: {
    trend: '类型推导和类型安全',
    examples: ['Pinia', 'XState']
  },
  
  // 专用化解决方案
  specializedSolutions: {
    trend: '针对特定场景优化的方案',
    examples: ['TanStack Query (服务器状态)', 'VeeValidate (表单状态)']
  },
  
  // 原子化设计
  atomicDesign: {
    trend: '细粒度的状态管理',
    examples: ['Jotai', 'Recoil']
  }
}
```

## 参考资料

- [Valtio Documentation](https://github.com/pmndrs/valtio)
- [TanStack Query](https://tanstack.com/query/latest)
- [XState Documentation](https://xstate.js.org/)
- [VueUse Documentation](https://vueuse.org/)
- [Harlem Documentation](https://harlemjs.com/)
- [State Management Comparison](https://github.com/kriasoft/state-management-comparison)

**下一节** → [第 07 节：选型决策指南](./07-selection-guide.md)
