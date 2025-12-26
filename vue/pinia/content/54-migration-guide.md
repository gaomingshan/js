# 第 54 节：迁移指南

## 概述

本节提供从 Vuex 迁移到 Pinia 以及版本升级的详细指南，帮助开发团队平稳过渡。

## 一、Vuex 到 Pinia 迁移

### 1.1 迁移策略

**渐进式迁移步骤**
```javascript
// 1. 安装 Pinia
npm install pinia

// 2. 设置 Pinia 与 Vuex 共存
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStore } from 'vuex'
import vuexStore from './store/vuex'

const app = createApp(App)
const pinia = createPinia()

// 同时使用 Vuex 和 Pinia
app.use(vuexStore) // 现有的 Vuex store
app.use(pinia)     // 新的 Pinia

app.mount('#app')
```

### 1.2 基本语法对比

**State 定义**
```javascript
// Vuex
const store = createStore({
  state: {
    count: 0,
    user: null
  }
})

// Pinia
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    user: null
  })
})
```

**Getters**
```javascript
// Vuex
const store = createStore({
  getters: {
    doubleCount: (state) => state.count * 2,
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === id)
    }
  }
})

// Pinia
export const useCounterStore = defineStore('counter', {
  getters: {
    doubleCount: (state) => state.count * 2,
    getUserById: (state) => {
      return (id) => state.users.find(user => user.id === id)
    }
  }
})
```

**Mutations & Actions**
```javascript
// Vuex
const store = createStore({
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    SET_USER(state, user) {
      state.user = user
    }
  },
  actions: {
    async fetchUser({ commit }, id) {
      const user = await api.getUser(id)
      commit('SET_USER', user)
    }
  }
})

// Pinia - 只有 Actions
export const useCounterStore = defineStore('counter', {
  actions: {
    increment() {
      this.count++
    },
    setUser(user) {
      this.user = user
    },
    async fetchUser(id) {
      this.user = await api.getUser(id)
    }
  }
})
```

### 1.3 自动迁移工具

```javascript
// tools/vuexToPinia.js
export class VuexToPiniaConverter {
  constructor() {
    this.patterns = {
      stateDeclaration: /state:\s*{([^}]+)}/g,
      gettersDeclaration: /getters:\s*{([^}]+)}/g,
      mutationsDeclaration: /mutations:\s*{([^}]+)}/g,
      actionsDeclaration: /actions:\s*{([^}]+)}/g
    }
  }
  
  convert(vuexStoreContent) {
    const parsed = this.parseVuexStore(vuexStoreContent)
    return this.generatePiniaStore(parsed)
  }
  
  parseVuexStore(content) {
    const result = {
      name: this.extractStoreName(content),
      state: this.extractState(content),
      getters: this.extractGetters(content),
      mutations: this.extractMutations(content),
      actions: this.extractActions(content),
      modules: this.extractModules(content)
    }
    
    return result
  }
  
  generatePiniaStore(parsed) {
    return `import { defineStore } from 'pinia'

export const use${parsed.name}Store = defineStore('${parsed.name.toLowerCase()}', {
  state: () => (${JSON.stringify(parsed.state, null, 2)}),
  
  getters: {
${this.convertGetters(parsed.getters)}
  },
  
  actions: {
${this.convertMutationsAndActions(parsed.mutations, parsed.actions)}
  }
})`
  }
  
  convertGetters(getters) {
    return getters.map(getter => {
      return `    ${getter.name}: (state) => ${getter.body}`
    }).join(',\n')
  }
  
  convertMutationsAndActions(mutations, actions) {
    const converted = []
    
    // 转换 mutations 为 actions
    mutations.forEach(mutation => {
      converted.push(`    ${mutation.name.toLowerCase()}(${mutation.params}) {
      ${mutation.body.replace(/state\./g, 'this.')}
    }`)
    })
    
    // 转换 actions
    actions.forEach(action => {
      const body = action.body
        .replace(/commit\('([^']+)'(?:,\s*([^)]+))?\)/g, 'this.$1($2)')
        .replace(/state\./g, 'this.')
        .replace(/getters\./g, 'this.')
      
      converted.push(`    ${action.async ? 'async ' : ''}${action.name}(${action.params}) {
      ${body}
    }`)
    })
    
    return converted.join(',\n\n')
  }
}

// 使用示例
const converter = new VuexToPiniaConverter()
const vuexCode = `
export default {
  state: {
    count: 0,
    users: []
  },
  getters: {
    doubleCount: state => state.count * 2
  },
  mutations: {
    INCREMENT(state) {
      state.count++
    }
  },
  actions: {
    async fetchUsers({ commit }) {
      const users = await api.getUsers()
      commit('SET_USERS', users)
    }
  }
}
`

const piniaCode = converter.convert(vuexCode)
console.log(piniaCode)
```

### 1.4 组件使用方式迁移

```javascript
// Vuex 组件
export default {
  computed: {
    ...mapState(['count', 'user']),
    ...mapGetters(['doubleCount', 'isAuthenticated'])
  },
  methods: {
    ...mapMutations(['increment']),
    ...mapActions(['fetchUser']),
    
    handleClick() {
      this.increment()
      this.fetchUser(123)
    }
  }
}

// Pinia 组件 (Options API)
export default {
  computed: {
    ...mapState(useCounterStore, ['count', 'user']),
    ...mapState(useCounterStore, {
      doubleCount: 'doubleCount',
      isAuth: 'isAuthenticated'
    })
  },
  methods: {
    ...mapActions(useCounterStore, ['increment', 'fetchUser']),
    
    handleClick() {
      this.increment()
      this.fetchUser(123)
    }
  }
}

// Pinia 组件 (Composition API)
export default {
  setup() {
    const counterStore = useCounterStore()
    
    const handleClick = () => {
      counterStore.increment()
      counterStore.fetchUser(123)
    }
    
    return {
      count: toRef(counterStore, 'count'),
      user: toRef(counterStore, 'user'),
      doubleCount: computed(() => counterStore.doubleCount),
      isAuth: computed(() => counterStore.isAuthenticated),
      handleClick
    }
  }
}
```

## 二、分阶段迁移方案

### 2.1 第一阶段：环境准备

```javascript
// 1. 创建迁移配置
// migration/config.js
export const migrationConfig = {
  // 迁移顺序（从简单到复杂）
  phases: [
    { name: 'utilities', stores: ['loading', 'notification'] },
    { name: 'user', stores: ['auth', 'profile'] },
    { name: 'business', stores: ['products', 'orders'] },
    { name: 'complex', stores: ['dashboard', 'analytics'] }
  ],
  
  // 依赖关系
  dependencies: {
    'profile': ['auth'],
    'orders': ['auth', 'products'],
    'dashboard': ['auth', 'orders', 'products']
  }
}

// 2. 创建兼容层
// migration/compatibility.js
export class VuexPiniaCompatibility {
  constructor() {
    this.vuexStores = new Map()
    this.piniaStores = new Map()
  }
  
  // 注册 Vuex store 到兼容层
  registerVuexStore(name, store) {
    this.vuexStores.set(name, store)
  }
  
  // 注册 Pinia store 到兼容层
  registerPiniaStore(name, store) {
    this.piniaStores.set(name, store)
  }
  
  // 统一的状态访问接口
  getState(storeName, key) {
    if (this.piniaStores.has(storeName)) {
      return this.piniaStores.get(storeName)[key]
    }
    
    if (this.vuexStores.has(storeName)) {
      return this.vuexStores.get(storeName).state[key]
    }
    
    throw new Error(`Store ${storeName} not found`)
  }
  
  // 统一的操作调用接口
  dispatch(storeName, actionName, payload) {
    if (this.piniaStores.has(storeName)) {
      const store = this.piniaStores.get(storeName)
      return store[actionName](payload)
    }
    
    if (this.vuexStores.has(storeName)) {
      return this.vuexStores.get(storeName).dispatch(actionName, payload)
    }
    
    throw new Error(`Store ${storeName} not found`)
  }
}
```

### 2.2 第二阶段：逐个迁移

```javascript
// migration/migrator.js
export class StoreMigrator {
  constructor(compatibility) {
    this.compatibility = compatibility
    this.migratedStores = new Set()
  }
  
  async migrateStore(storeName) {
    console.log(`开始迁移 store: ${storeName}`)
    
    try {
      // 1. 创建 Pinia store
      const piniaStore = await this.createPiniaStore(storeName)
      
      // 2. 迁移现有状态
      await this.migrateState(storeName, piniaStore)
      
      // 3. 注册到兼容层
      this.compatibility.registerPiniaStore(storeName, piniaStore)
      
      // 4. 运行验证测试
      await this.validateMigration(storeName)
      
      this.migratedStores.add(storeName)
      console.log(`✅ ${storeName} 迁移完成`)
      
    } catch (error) {
      console.error(`❌ ${storeName} 迁移失败:`, error)
      throw error
    }
  }
  
  async migrateState(storeName, piniaStore) {
    const vuexStore = this.compatibility.vuexStores.get(storeName)
    if (vuexStore && vuexStore.state) {
      // 复制状态数据
      Object.keys(vuexStore.state).forEach(key => {
        if (key in piniaStore) {
          piniaStore[key] = vuexStore.state[key]
        }
      })
    }
  }
  
  async validateMigration(storeName) {
    // 运行迁移验证测试
    const tests = await import(`../tests/migration/${storeName}.test.js`)
    await tests.runMigrationTests()
  }
}

// 使用示例
const compatibility = new VuexPiniaCompatibility()
const migrator = new StoreMigrator(compatibility)

// 逐步迁移
async function performMigration() {
  const { phases } = migrationConfig
  
  for (const phase of phases) {
    console.log(`开始迁移阶段: ${phase.name}`)
    
    for (const storeName of phase.stores) {
      await migrator.migrateStore(storeName)
    }
    
    console.log(`✅ 阶段 ${phase.name} 迁移完成`)
  }
}
```

### 2.3 第三阶段：清理和优化

```javascript
// migration/cleanup.js
export class MigrationCleanup {
  constructor(compatibility) {
    this.compatibility = compatibility
  }
  
  // 移除 Vuex 依赖
  async removeVuexDependencies() {
    // 1. 检查是否所有 store 都已迁移
    const remainingVuex = this.compatibility.vuexStores.size
    if (remainingVuex > 0) {
      throw new Error(`还有 ${remainingVuex} 个 Vuex store 未迁移`)
    }
    
    // 2. 更新组件导入
    await this.updateComponentImports()
    
    // 3. 移除 Vuex 配置
    await this.removeVuexConfig()
    
    // 4. 清理依赖
    await this.cleanupDependencies()
  }
  
  async updateComponentImports() {
    // 扫描并更新组件中的导入语句
    const components = await this.findComponentFiles()
    
    for (const component of components) {
      let content = await fs.readFile(component, 'utf8')
      
      // 替换 mapState, mapGetters, mapActions 导入
      content = content.replace(
        /import\s+{\s*mapState,\s*mapGetters,\s*mapActions\s*}\s+from\s+['"]vuex['"]/g,
        "import { mapState, mapActions } from 'pinia'"
      )
      
      // 替换 store 使用方式
      content = this.replaceStoreUsage(content)
      
      await fs.writeFile(component, content)
    }
  }
  
  replaceStoreUsage(content) {
    // 替换 this.$store 为具体的 store
    return content.replace(
      /this\.\$store\.dispatch\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
      (match, action, payload) => {
        const [storeName, actionName] = action.split('/')
        return `this.${storeName}Store.${actionName}(${payload})`
      }
    )
  }
}
```

## 三、版本升级指南

### 3.1 Vue 2 到 Vue 3

```javascript
// Vue 2 + Vuex 3
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  }
})

// Vue 3 + Pinia
import { createApp } from 'vue'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Store 定义
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

### 3.2 Pinia 版本升级

```javascript
// Pinia v1 to v2
// 主要变化：更好的 TypeScript 支持，API 优化

// v1 写法
export const useStore = defineStore({
  id: 'main',
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// v2 写法（推荐）
export const useStore = defineStore('main', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// 或者使用 setup 语法
export const useStore = defineStore('main', () => {
  const count = ref(0)
  
  function increment() {
    count.value++
  }
  
  return { count, increment }
})
```

## 四、常见问题与解决方案

### 4.1 迁移过程中的问题

```javascript
// 问题1: 循环依赖
// 解决方案：延迟导入
export const useUserStore = defineStore('user', {
  actions: {
    async fetchUserProfile(id) {
      // 延迟导入避免循环依赖
      const { useProfileStore } = await import('./profile')
      const profileStore = useProfileStore()
      
      return profileStore.getProfile(id)
    }
  }
})

// 问题2: 状态共享
// 解决方案：使用 composables
// composables/useSharedState.js
export function useSharedState() {
  const userStore = useUserStore()
  const authStore = useAuthStore()
  
  return {
    currentUser: computed(() => userStore.currentUser),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    logout: () => {
      userStore.clearUser()
      authStore.logout()
    }
  }
}

// 问题3: 大型状态对象
// 解决方案：状态分片
export const useLargeDataStore = defineStore('largeData', {
  state: () => ({
    // 分片存储大型数据
    userChunks: new Map(),
    productChunks: new Map(),
    orderChunks: new Map()
  }),
  
  getters: {
    getAllUsers: (state) => {
      const users = []
      for (const chunk of state.userChunks.values()) {
        users.push(...chunk)
      }
      return users
    }
  },
  
  actions: {
    addUserChunk(chunkId, users) {
      this.userChunks.set(chunkId, users)
    },
    
    removeUserChunk(chunkId) {
      this.userChunks.delete(chunkId)
    }
  }
})
```

### 4.2 性能优化迁移

```javascript
// 迁移前后性能对比工具
export class MigrationPerformanceTracker {
  constructor() {
    this.metrics = {
      before: new Map(),
      after: new Map()
    }
  }
  
  trackBefore(operation, duration) {
    if (!this.metrics.before.has(operation)) {
      this.metrics.before.set(operation, [])
    }
    this.metrics.before.get(operation).push(duration)
  }
  
  trackAfter(operation, duration) {
    if (!this.metrics.after.has(operation)) {
      this.metrics.after.set(operation, [])
    }
    this.metrics.after.get(operation).push(duration)
  }
  
  generateReport() {
    const report = {
      improvements: [],
      regressions: [],
      unchanged: []
    }
    
    for (const [operation] of this.metrics.before) {
      const beforeAvg = this.calculateAverage(this.metrics.before.get(operation))
      const afterAvg = this.calculateAverage(this.metrics.after.get(operation))
      
      const improvement = ((beforeAvg - afterAvg) / beforeAvg) * 100
      
      const entry = {
        operation,
        before: beforeAvg,
        after: afterAvg,
        improvement: Math.round(improvement * 100) / 100
      }
      
      if (improvement > 5) {
        report.improvements.push(entry)
      } else if (improvement < -5) {
        report.regressions.push(entry)
      } else {
        report.unchanged.push(entry)
      }
    }
    
    return report
  }
  
  calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
}
```

## 参考资料

- [Pinia Migration Guide](https://pinia.vuejs.org/introduction.html#comparison-with-vuex)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Vuex to Pinia Cheatsheet](https://pinia.vuejs.org/cookbook/migration-vuex.html)

**下一节** → [第 55 节：未来趋势](./55-future-trends.md)
