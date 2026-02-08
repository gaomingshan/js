# 第 32 节：严格模式

## 概述

严格模式是 Vuex 提供的一个开发时功能，用于检测状态变更是否遵循规范。在严格模式下，任何不是由 mutation 函数引起的状态变更都会抛出错误，帮助开发者找到不规范的状态修改。

## 一、启用严格模式

### 1.1 基本启用

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  strict: true, // 启用严格模式
  
  state() {
    return {
      count: 0,
      user: null,
      todos: []
    }
  },
  
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    
    SET_USER(state, user) {
      state.user = user
    }
  }
})

export default store
```

### 1.2 条件启用（推荐）

```javascript
// 只在开发环境启用严格模式
const store = createStore({
  strict: process.env.NODE_ENV !== 'production',
  
  // 或者更明确的条件
  strict: __DEV__ || process.env.NODE_ENV === 'development',
  
  state() {
    return {
      count: 0,
      items: []
    }
  },
  
  mutations: {
    INCREMENT(state) {
      state.count++
    }
  }
})
```

## 二、严格模式的作用

### 2.1 检测非法状态变更

```javascript
const store = createStore({
  strict: true,
  
  state() {
    return {
      count: 0,
      user: {
        name: '',
        preferences: {
          theme: 'light'
        }
      },
      items: []
    }
  },
  
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    
    SET_USER_NAME(state, name) {
      state.user.name = name
    }
  },
  
  actions: {
    // ❌ 错误示例：在 action 中直接修改状态
    badIncrement({ state }) {
      state.count++ // 严格模式下会抛出错误
    },
    
    // ✅ 正确示例：通过 mutation 修改状态
    goodIncrement({ commit }) {
      commit('INCREMENT')
    }
  }
})
```

### 2.2 组件中的状态修改检测

```vue
<template>
  <div class="strict-mode-example">
    <p>计数: {{ count }}</p>
    <p>用户名: {{ userName }}</p>
    
    <button @click="correctIncrement">正确增加</button>
    <button @click="incorrectIncrement">错误增加</button>
    <button @click="correctSetName">正确设置名称</button>
    <button @click="incorrectSetName">错误设置名称</button>
  </div>
</template>

<script>
export default {
  name: 'StrictModeExample',
  
  computed: {
    count() {
      return this.$store.state.count
    },
    
    userName() {
      return this.$store.state.user.name
    }
  },
  
  methods: {
    // ✅ 正确：通过 mutation
    correctIncrement() {
      this.$store.commit('INCREMENT')
    },
    
    // ❌ 错误：直接修改状态
    incorrectIncrement() {
      // 严格模式下会报错
      this.$store.state.count++
    },
    
    // ✅ 正确：通过 mutation
    correctSetName() {
      this.$store.commit('SET_USER_NAME', 'Alice')
    },
    
    // ❌ 错误：直接修改嵌套状态
    incorrectSetName() {
      // 严格模式下会报错
      this.$store.state.user.name = 'Bob'
    }
  }
}
</script>
```

## 三、严格模式下的常见问题

### 3.1 表单双向绑定问题

```vue
<template>
  <div class="form-example">
    <!-- ❌ 错误：直接绑定 store 状态 -->
    <!-- <input v-model="$store.state.user.name" /> -->
    
    <!-- ✅ 解决方案1：使用计算属性的 setter -->
    <input v-model="userName" />
    
    <!-- ✅ 解决方案2：使用 @input 事件 -->
    <input 
      :value="$store.state.user.name" 
      @input="updateUserName"
    />
    
    <!-- ✅ 解决方案3：使用自定义组件 -->
    <StoreInput 
      :value="$store.state.user.name"
      @input="value => $store.commit('SET_USER_NAME', value)"
    />
  </div>
</template>

<script>
export default {
  name: 'FormExample',
  
  computed: {
    // 解决方案1：带 setter 的计算属性
    userName: {
      get() {
        return this.$store.state.user.name
      },
      set(value) {
        this.$store.commit('SET_USER_NAME', value)
      }
    }
  },
  
  methods: {
    // 解决方案2：事件处理器
    updateUserName(event) {
      this.$store.commit('SET_USER_NAME', event.target.value)
    }
  }
}
</script>
```

### 3.2 对象引用问题

```javascript
// 严格模式下需要注意的对象引用问题
const store = createStore({
  strict: true,
  
  state() {
    return {
      user: {
        profile: {
          name: '',
          settings: {
            theme: 'light'
          }
        }
      }
    }
  },
  
  mutations: {
    // ❌ 错误：直接修改传入的对象
    BAD_UPDATE_USER(state, userData) {
      // 如果外部修改了 userData，严格模式可能会报错
      state.user = userData
    },
    
    // ✅ 正确：创建新对象
    GOOD_UPDATE_USER(state, userData) {
      state.user = { ...userData }
    },
    
    // ✅ 正确：深度克隆
    SAFE_UPDATE_USER(state, userData) {
      state.user = JSON.parse(JSON.stringify(userData))
    },
    
    // ✅ 正确：逐个属性更新
    UPDATE_USER_PROPERTIES(state, updates) {
      Object.keys(updates).forEach(key => {
        if (state.user.hasOwnProperty(key)) {
          state.user[key] = updates[key]
        }
      })
    }
  }
})
```

### 3.3 数组操作问题

```javascript
const store = createStore({
  strict: true,
  
  state() {
    return {
      todos: [],
      tags: []
    }
  },
  
  mutations: {
    // ❌ 错误的数组操作
    BAD_ADD_TODO(state, todo) {
      // 直接 push 原始对象可能有问题
      state.todos.push(todo)
    },
    
    // ✅ 正确的数组操作
    ADD_TODO(state, todo) {
      state.todos.push({
        id: Date.now(),
        completed: false,
        ...todo
      })
    },
    
    // ✅ 安全的数组更新
    UPDATE_TODO(state, { id, updates }) {
      const index = state.todos.findIndex(todo => todo.id === id)
      if (index !== -1) {
        // 创建新对象而不是直接修改
        state.todos[index] = {
          ...state.todos[index],
          ...updates
        }
      }
    },
    
    // ✅ 使用 Vue.set 处理响应式问题（Vue 2）
    UPDATE_TODO_VUE2(state, { index, updates }) {
      // Vue.set(state.todos, index, {
      //   ...state.todos[index],
      //   ...updates
      // })
    }
  }
})
```

## 四、调试严格模式错误

### 4.1 错误定位

```javascript
// 创建带错误追踪的严格模式 store
const createStrictStore = (options) => {
  const store = createStore({
    ...options,
    strict: process.env.NODE_ENV !== 'production'
  })
  
  if (process.env.NODE_ENV !== 'production') {
    // 监听严格模式错误
    const originalConsoleError = console.error
    console.error = function(...args) {
      if (args[0] && args[0].includes('Do not mutate vuex store state outside mutation handlers')) {
        // 添加更详细的错误信息
        console.group('🚨 Vuex Strict Mode Violation')
        console.error('Direct state mutation detected!')
        console.trace('Stack trace:')
        console.log('Current state:', JSON.parse(JSON.stringify(store.state)))
        console.groupEnd()
      }
      originalConsoleError.apply(console, args)
    }
  }
  
  return store
}
```

### 4.2 状态变更追踪

```javascript
// 状态变更追踪插件
const createStateTracker = () => {
  if (process.env.NODE_ENV === 'production') {
    return () => {}
  }
  
  return store => {
    let previousState = JSON.parse(JSON.stringify(store.state))
    
    // 深度比较状态变化
    const deepDiff = (obj1, obj2, path = '') => {
      const changes = []
      
      const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
      
      for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key
        const val1 = obj1[key]
        const val2 = obj2[key]
        
        if (val1 !== val2) {
          if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
            changes.push(...deepDiff(val1, val2, currentPath))
          } else {
            changes.push({
              path: currentPath,
              from: val1,
              to: val2
            })
          }
        }
      }
      
      return changes
    }
    
    // 监听每次变化
    store.subscribe((mutation, state) => {
      const currentState = JSON.parse(JSON.stringify(state))
      const changes = deepDiff(previousState, currentState)
      
      if (changes.length > 0) {
        console.group(`📊 State Changes for ${mutation.type}`)
        changes.forEach(change => {
          console.log(`${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`)
        })
        console.groupEnd()
      }
      
      previousState = currentState
    })
    
    // 检测意外的状态变化
    const checkForUnexpectedChanges = () => {
      const currentState = JSON.parse(JSON.stringify(store.state))
      const changes = deepDiff(previousState, currentState)
      
      if (changes.length > 0) {
        console.warn('🚨 Unexpected state changes detected outside of mutations!')
        changes.forEach(change => {
          console.warn(`${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`)
        })
        previousState = currentState
      }
    }
    
    // 定期检查（用于捕获异步的状态变更）
    setInterval(checkForUnexpectedChanges, 1000)
  }
}
```

## 五、严格模式的性能考虑

### 5.1 生产环境禁用

```javascript
// 配置文件中的严格模式设置
const storeConfig = {
  // 基于环境变量
  strict: process.env.NODE_ENV !== 'production',
  
  // 或者基于构建标志
  strict: __DEV__,
  
  // 或者更复杂的条件
  strict: process.env.NODE_ENV === 'development' && !process.env.DISABLE_STRICT
}

// Webpack DefinePlugin 配置
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}
```

### 5.2 大型状态的优化

```javascript
// 对于大型状态，考虑分模块处理严格模式
const createOptimizedStore = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  return createStore({
    // 根据状态大小决定是否启用严格模式
    strict: isDevelopment,
    
    modules: {
      // 核心模块启用严格模式
      user: {
        strict: isDevelopment,
        // ...
      },
      
      // 大型数据模块可以选择性禁用
      bigData: {
        strict: false, // 性能考虑
        // ...
      },
      
      // 实时数据模块
      realtime: {
        strict: isDevelopment && !process.env.DISABLE_REALTIME_STRICT,
        // ...
      }
    }
  })
}
```

## 六、最佳实践

### 6.1 开发工作流程

```javascript
// 开发环境配置
const developmentStoreConfig = {
  strict: true,
  
  plugins: [
    // 状态变更日志
    store => {
      store.subscribe((mutation, state) => {
        console.log(`Mutation: ${mutation.type}`, mutation.payload)
      })
    },
    
    // 性能监控
    store => {
      store.subscribeAction({
        before: (action, state) => {
          console.time(`Action: ${action.type}`)
        },
        after: (action, state) => {
          console.timeEnd(`Action: ${action.type}`)
        }
      })
    }
  ]
}

// 生产环境配置
const productionStoreConfig = {
  strict: false,
  plugins: [
    // 只包含必要的插件
  ]
}

// 根据环境选择配置
const storeConfig = process.env.NODE_ENV === 'production' 
  ? productionStoreConfig 
  : developmentStoreConfig
```

### 6.2 团队开发规范

```javascript
// 团队共享的严格模式配置
const createTeamStore = (userConfig) => {
  const baseConfig = {
    // 强制开发环境使用严格模式
    strict: process.env.NODE_ENV !== 'production',
    
    plugins: [
      // 开发环境添加调试插件
      ...(process.env.NODE_ENV !== 'production' ? [
        store => {
          // 检测常见错误模式
          store.subscribe((mutation, state) => {
            // 检查 mutation 命名规范
            if (!/^[A-Z_]+$/.test(mutation.type)) {
              console.warn(`Mutation name "${mutation.type}" should be UPPERCASE_WITH_UNDERSCORES`)
            }
          })
        }
      ] : [])
    ]
  }
  
  return createStore({
    ...baseConfig,
    ...userConfig,
    // 确保严格模式不能被覆盖
    strict: baseConfig.strict
  })
}
```

### 6.3 测试中的严格模式

```javascript
// 测试环境配置
describe('Vuex Store Tests', () => {
  let store
  
  beforeEach(() => {
    // 测试中启用严格模式以确保代码质量
    store = createStore({
      strict: true,
      
      state: () => ({
        count: 0
      }),
      
      mutations: {
        INCREMENT(state) {
          state.count++
        }
      }
    })
  })
  
  it('should allow mutations', () => {
    store.commit('INCREMENT')
    expect(store.state.count).toBe(1)
  })
  
  it('should throw error for direct state mutation', () => {
    expect(() => {
      store.state.count++
    }).toThrow()
  })
})
```

## 七、迁移和升级

### 7.1 现有项目启用严格模式

```javascript
// 渐进式启用严格模式
const enableStrictModeGradually = () => {
  const store = createStore({
    // 先在开发环境启用
    strict: process.env.NODE_ENV === 'development',
    
    plugins: [
      // 添加警告插件而不是直接报错
      store => {
        if (process.env.NODE_ENV === 'development') {
          let isInMutation = false
          
          // 包装所有 mutations
          const originalCommit = store.commit
          store.commit = function(...args) {
            isInMutation = true
            const result = originalCommit.apply(this, args)
            isInMutation = false
            return result
          }
          
          // 监听状态变化
          const originalState = store.state
          const stateProxy = new Proxy(originalState, {
            set(target, key, value) {
              if (!isInMutation) {
                console.warn(`Direct state mutation detected: ${key}`)
                console.trace()
              }
              return Reflect.set(target, key, value)
            }
          })
          
          // 替换 state
          store.replaceState(stateProxy)
        }
      }
    ]
  })
  
  return store
}
```

## 参考资料

- [Vuex Strict Mode 文档](https://vuex.vuejs.org/guide/strict.html)
- [Vue.js 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [JavaScript Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

**下一节** → [第 33 节：表单处理](./33-vuex-forms.md)
