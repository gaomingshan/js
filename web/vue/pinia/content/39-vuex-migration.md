# 第 39 节：迁移指南

## 概述

本节介绍 Vuex 项目的迁移策略，包括从旧版本升级、迁移到 Pinia，以及与其他状态管理解决方案的迁移路径。

## 一、Vuex 版本升级

### 1.1 从 Vuex 3.x 到 Vuex 4.x

```javascript
// Vuex 3.x (Vue 2)
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  }
})

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
```

```javascript
// Vuex 4.x (Vue 3) - 主要变更
import { createApp } from 'vue'
import { createStore } from 'vuex'

// 1. 使用 createStore 替代 new Vuex.Store
const store = createStore({
  // 2. state 必须是函数
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  }
})

// 3. 使用 app.use() 安装
const app = createApp(App)
app.use(store)
app.mount('#app')
```

### 1.2 API 变更对比

```javascript
// 迁移检查清单
const migrationChecklist = {
  // ✅ 需要更改的 API
  changes: {
    // Store 创建
    'new Vuex.Store()': 'createStore()',
    
    // 安装方式
    'Vue.use(Vuex)': 'app.use(store)',
    
    // State 定义
    'state: {}': 'state() { return {} }',
    
    // 组合式 API
    '$store': 'useStore()',
    
    // 类型支持
    'this.$store': 'useStore() with types'
  },
  
  // ✅ 保持不变的 API
  unchanged: [
    'mutations',
    'actions', 
    'getters',
    'modules',
    'plugins',
    'strict mode',
    'namespaced modules'
  ]
}

// 自动化迁移脚本
const autoMigrationScript = `
# 使用 sed 或类似工具批量替换

# 替换 Store 创建
find src -name "*.js" -type f -exec sed -i 's/new Vuex.Store/createStore/g' {} \\;

# 替换导入
find src -name "*.js" -type f -exec sed -i 's/import Vuex from .vuex./import { createStore } from .vuex./g' {} \\;

# 提醒手动检查的项目
echo "请手动检查以下项目:"
echo "1. state 对象改为函数"
echo "2. Vue.use(Vuex) 改为 app.use(store)"
echo "3. TypeScript 类型定义"
`
```

## 二、迁移到 Pinia

### 2.1 对比分析

```javascript
// Vuex Store 结构
const vuexUserModule = {
  namespaced: true,
  
  state() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    userName: (state) => state.user?.name || 'Guest'
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchUser({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const user = await api.fetchUser(userId)
        commit('SET_USER', user)
        return user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    logout({ commit }) {
      commit('SET_USER', null)
      commit('SET_ERROR', null)
    }
  }
}

// 对应的 Pinia Store
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  
  // 计算属性 (替代 getters)
  getters: {
    isLoggedIn: (state) => !!state.user,
    userName: (state) => state.user?.name || 'Guest'
  },
  
  // 方法 (替代 mutations + actions)
  actions: {
    // 直接修改状态，不需要 mutations
    setUser(user) {
      this.user = user
    },
    
    setLoading(loading) {
      this.loading = loading
    },
    
    setError(error) {
      this.error = error
    },
    
    async fetchUser(userId) {
      this.setLoading(true)
      try {
        const user = await api.fetchUser(userId)
        this.setUser(user)
        return user
      } catch (error) {
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    logout() {
      this.setUser(null)
      this.setError(null)
    }
  }
})

// 或使用 Composition API 风格
export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || 'Guest')
  
  // 方法
  const setUser = (newUser) => {
    user.value = newUser
  }
  
  const fetchUser = async (userId) => {
    loading.value = true
    try {
      const userData = await api.fetchUser(userId)
      user.value = userData
      return userData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    user.value = null
    error.value = null
  }
  
  return {
    // 状态
    user,
    loading,
    error,
    
    // 计算属性
    isLoggedIn,
    userName,
    
    // 方法
    setUser,
    fetchUser,
    logout
  }
})
```

### 2.2 渐进式迁移策略

```javascript
// 步骤 1: 安装 Pinia 并与 Vuex 并存
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { store as vuexStore } from './store/vuex'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 同时使用 Vuex 和 Pinia
app.use(vuexStore)
app.use(pinia)
app.mount('#app')

// 步骤 2: 创建适配器
class VuexPiniaAdapter {
  constructor(vuexStore, piniaStores) {
    this.vuex = vuexStore
    this.pinia = piniaStores
    this.setupSyncronization()
  }
  
  // 同步关键状态
  setupSyncronization() {
    // Vuex -> Pinia 同步
    this.vuex.subscribe((mutation, state) => {
      if (mutation.type === 'user/SET_USER') {
        const userStore = this.pinia.user()
        userStore.user = mutation.payload
      }
    })
    
    // Pinia -> Vuex 同步 (如果需要)
    const userStore = this.pinia.user()
    userStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.events.key === 'user') {
        this.vuex.commit('user/SET_USER', state.user)
      }
    })
  }
}

// 步骤 3: 组件级迁移
// 原 Vuex 组件
export default {
  computed: {
    ...mapState('user', ['user', 'loading']),
    ...mapGetters('user', ['isLoggedIn'])
  },
  methods: {
    ...mapActions('user', ['fetchUser', 'logout'])
  }
}

// 迁移后的 Pinia 组件
export default {
  setup() {
    const userStore = useUserStore()
    
    return {
      // 状态和计算属性自动响应式
      user: computed(() => userStore.user),
      loading: computed(() => userStore.loading),
      isLoggedIn: computed(() => userStore.isLoggedIn),
      
      // 方法直接使用
      fetchUser: userStore.fetchUser,
      logout: userStore.logout
    }
  }
}
```

### 2.3 迁移工具脚本

```javascript
// migration-helper.js - 自动化迁移辅助工具
const fs = require('fs')
const path = require('path')

class VuexToPiniaMigrationTool {
  constructor(options = {}) {
    this.sourceDir = options.sourceDir || './src/store'
    this.targetDir = options.targetDir || './src/stores'
    this.backupDir = options.backupDir || './backup'
  }
  
  // 分析 Vuex 模块结构
  analyzeVuexModule(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    const analysis = {
      hasNamespace: content.includes('namespaced: true'),
      stateProperties: this.extractStateProperties(content),
      getters: this.extractGetters(content),
      mutations: this.extractMutations(content),
      actions: this.extractActions(content),
      modules: this.extractModules(content)
    }
    
    return analysis
  }
  
  // 生成对应的 Pinia store
  generatePiniaStore(analysis, moduleName) {
    return `
import { defineStore } from 'pinia'

export const use${this.capitalize(moduleName)}Store = defineStore('${moduleName}', {
  state: () => ({
    ${analysis.stateProperties.map(prop => `${prop.name}: ${prop.defaultValue}`).join(',\n    ')}
  }),
  
  getters: {
    ${analysis.getters.map(getter => this.convertGetter(getter)).join(',\n    ')}
  },
  
  actions: {
    ${this.generatePiniaActions(analysis.mutations, analysis.actions)}
  }
})
`
  }
  
  convertGetter(getter) {
    // 转换 Vuex getter 到 Pinia getter
    return getter.replace(/\(state\)/g, '(state)')
  }
  
  generatePiniaActions(mutations, actions) {
    const piniaActions = []
    
    // 为每个 mutation 创建对应的 action
    mutations.forEach(mutation => {
      piniaActions.push(`
    ${this.camelCase(mutation.name)}(${mutation.params}) {
      ${this.convertMutationToPinia(mutation.body)}
    }`)
    })
    
    // 转换 actions
    actions.forEach(action => {
      piniaActions.push(this.convertAction(action))
    })
    
    return piniaActions.join(',\n')
  }
  
  // 执行迁移
  migrate() {
    console.log('开始 Vuex 到 Pinia 迁移...')
    
    // 1. 备份原文件
    this.backup()
    
    // 2. 分析所有 Vuex 模块
    const modules = this.findVuexModules()
    
    // 3. 生成 Pinia stores
    modules.forEach(module => {
      const analysis = this.analyzeVuexModule(module.path)
      const piniaCode = this.generatePiniaStore(analysis, module.name)
      
      fs.writeFileSync(
        path.join(this.targetDir, `${module.name}.js`), 
        piniaCode
      )
    })
    
    // 4. 生成迁移报告
    this.generateReport(modules)
    
    console.log('迁移完成！请检查生成的文件并进行必要的调整。')
  }
  
  generateReport(modules) {
    const report = {
      summary: {
        totalModules: modules.length,
        migrationDate: new Date().toISOString()
      },
      modules: modules.map(module => ({
        name: module.name,
        originalPath: module.path,
        newPath: path.join(this.targetDir, `${module.name}.js`),
        issues: this.detectIssues(module)
      })),
      nextSteps: [
        '1. 检查生成的 Pinia stores',
        '2. 更新组件中的 store 使用',
        '3. 移除 Vuex 相关代码',
        '4. 更新测试文件',
        '5. 验证功能完整性'
      ]
    }
    
    fs.writeFileSync(
      path.join(this.targetDir, 'migration-report.json'),
      JSON.stringify(report, null, 2)
    )
  }
}

// 使用迁移工具
const migrationTool = new VuexToPiniaMigrationTool({
  sourceDir: './src/store/modules',
  targetDir: './src/stores'
})

migrationTool.migrate()
```

## 三、组件迁移

### 3.1 选项式 API 到组合式 API

```vue
<!-- 原始组件 (Options API + Vuex) -->
<template>
  <div>
    <p>用户: {{ userName }}</p>
    <p>状态: {{ isLoggedIn ? '已登录' : '未登录' }}</p>
    <button @click="handleLogin" :disabled="loading">登录</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['loading']),
    ...mapGetters('user', ['isLoggedIn', 'userName'])
  },
  
  methods: {
    ...mapActions('user', ['fetchUser']),
    
    async handleLogin() {
      try {
        await this.fetchUser(123)
      } catch (error) {
        console.error('登录失败:', error)
      }
    }
  }
}
</script>
```

```vue
<!-- 迁移后组件 (Composition API + Pinia) -->
<template>
  <div>
    <p>用户: {{ userStore.userName }}</p>
    <p>状态: {{ userStore.isLoggedIn ? '已登录' : '未登录' }}</p>
    <button @click="handleLogin" :disabled="userStore.loading">登录</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const handleLogin = async () => {
  try {
    await userStore.fetchUser(123)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

### 3.2 批量组件更新脚本

```bash
#!/bin/bash
# update-components.sh - 批量更新组件脚本

echo "开始批量更新组件..."

# 查找所有使用 Vuex 的组件
find src -name "*.vue" -type f -exec grep -l "mapState\|mapGetters\|mapMutations\|mapActions\|\$store" {} \; > vuex-components.txt

# 为每个组件创建备份和迁移建议
while IFS= read -r component; do
  echo "处理组件: $component"
  
  # 创建备份
  cp "$component" "$component.backup"
  
  # 分析组件的 Vuex 使用情况
  echo "=== $component ===" >> migration-suggestions.txt
  echo "Vuex 使用分析:" >> migration-suggestions.txt
  grep -n "mapState\|mapGetters\|mapMutations\|mapActions\|\$store" "$component" >> migration-suggestions.txt
  echo "" >> migration-suggestions.txt
  
done < vuex-components.txt

echo "组件分析完成，请查看 migration-suggestions.txt"
```

## 四、测试迁移

### 4.1 测试代码更新

```javascript
// 原 Vuex 测试
describe('User Store', () => {
  let store
  
  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user: userModule
      }
    })
  })
  
  it('should handle user login', async () => {
    await store.dispatch('user/fetchUser', 123)
    expect(store.state.user.user).toBeTruthy()
    expect(store.getters['user/isLoggedIn']).toBe(true)
  })
})

// 迁移后 Pinia 测试
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should handle user login', async () => {
    const userStore = useUserStore()
    await userStore.fetchUser(123)
    
    expect(userStore.user).toBeTruthy()
    expect(userStore.isLoggedIn).toBe(true)
  })
})
```

### 4.2 E2E 测试保持一致

```javascript
// E2E 测试通常不需要大幅修改
describe('User Login Flow', () => {
  it('should allow user to login', () => {
    cy.visit('/login')
    cy.get('[data-cy=username]').type('testuser')
    cy.get('[data-cy=password]').type('password')
    cy.get('[data-cy=login-button]').click()
    
    // 验证结果，不依赖具体的状态管理实现
    cy.get('[data-cy=user-name]').should('contain', 'testuser')
    cy.url().should('include', '/dashboard')
  })
})
```

## 五、迁移验证

### 5.1 功能对比清单

```javascript
// 迁移验证清单
const migrationValidation = {
  functionality: [
    '✓ 所有状态正确初始化',
    '✓ 计算属性正确工作',
    '✓ 异步操作正常执行',
    '✓ 错误处理保持一致',
    '✓ 路由守卫中的状态检查',
    '✓ 持久化存储功能',
    '✓ 开发者工具支持'
  ],
  
  performance: [
    '✓ 初始化性能',
    '✓ 运行时性能',
    '✓ 内存使用情况',
    '✓ 打包大小对比'
  ],
  
  developer_experience: [
    '✓ TypeScript 支持',
    '✓ IDE 自动补全',
    '✓ 调试体验',
    '✓ 热重载功能'
  ]
}

// 自动化验证脚本
const validateMigration = async () => {
  console.log('开始迁移验证...')
  
  // 功能测试
  const functionalTests = await runFunctionalTests()
  
  // 性能测试
  const performanceMetrics = await measurePerformance()
  
  // 生成验证报告
  const report = {
    timestamp: new Date().toISOString(),
    functional: functionalTests,
    performance: performanceMetrics,
    recommendations: generateRecommendations(functionalTests, performanceMetrics)
  }
  
  console.log('验证完成:', report)
  return report
}
```

## 六、回滚策略

### 6.1 准备回滚方案

```javascript
// 回滚脚本
const rollbackPlan = {
  // 1. 代码回滚
  codeRollback: {
    git: 'git checkout migration-start-point',
    npm: 'npm install', // 恢复依赖
    build: 'npm run build' // 重新构建
  },
  
  // 2. 数据回滚
  dataRollback: {
    // 如果状态结构有变化，需要数据迁移
    localStorage: 'clear or migrate localStorage data',
    api: 'ensure API compatibility'
  },
  
  // 3. 配置回滚
  configRollback: {
    router: 'restore route guards',
    plugins: 'restore Vuex plugins'
  }
}

// 紧急回滚脚本
const emergencyRollback = () => {
  console.log('执行紧急回滚...')
  
  // 1. 恢复 Vuex 代码
  exec('git stash')
  exec('git checkout vuex-stable')
  
  // 2. 恢复依赖
  exec('npm ci')
  
  // 3. 重建应用
  exec('npm run build')
  
  console.log('回滚完成')
}
```

## 七、最佳实践建议

### 7.1 迁移时机选择

```javascript
const migrationTiming = {
  ideal: [
    '项目相对稳定期',
    '新功能开发间隙',
    '团队有充足时间测试',
    'Vue 3 升级后'
  ],
  
  avoid: [
    '临近重要发布',
    '团队人员变动期',
    '正在开发重要功能',
    '生产环境有重大问题'
  ]
}
```

### 7.2 团队协作策略

```javascript
const teamStrategy = {
  planning: [
    '制定详细迁移计划',
    '分配责任模块',
    '建立代码审查流程',
    '准备培训材料'
  ],
  
  execution: [
    '小步快跑，分模块迁移',
    '保持功能分支整洁',
    '及时同步进度',
    '记录遇到的问题'
  ],
  
  validation: [
    '每个模块完成后立即测试',
    '定期进行集成测试',
    '收集团队反馈',
    '调整迁移策略'
  ]
}
```

## 参考资料

- [Vuex 4 迁移指南](https://vuex.vuejs.org/guide/migrating-to-4-0-from-3-x.html)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)

**下一节** → [第 40 节：总结](./40-vuex-summary.md)
