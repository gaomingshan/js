# 第 51 节：开发工具

## 概述

优秀的开发工具能显著提升状态管理的开发效率和调试体验。本节介绍各类开发工具及其使用方法。

## 一、Vue DevTools

### 1.1 基础使用

Vue DevTools 是官方提供的调试工具，支持 Pinia 和 Vuex 状态管理调试。

**安装与设置**
```bash
# 浏览器扩展安装
# Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools

# 开发环境配置
npm install --save-dev @vue/devtools
```

**Pinia DevTools 配置**
```javascript
// main.js
import { createPinia } from 'pinia'

const pinia = createPinia()

// 开发环境启用 devtools
if (process.env.NODE_ENV === 'development') {
  pinia.use(({ store }) => {
    store.$subscribe((mutation, state) => {
      // DevTools 会自动捕获这些变化
    })
  })
}

app.use(pinia)
```

### 1.2 高级调试功能

**时间旅行调试**
```javascript
// stores/debugStore.js
export const useDebugStore = defineStore('debug', {
  state: () => ({
    history: [],
    currentIndex: -1
  }),
  
  actions: {
    // 记录状态快照
    takeSnapshot() {
      const snapshot = {
        timestamp: Date.now(),
        state: JSON.parse(JSON.stringify(this.$state))
      }
      
      this.history.push(snapshot)
      this.currentIndex = this.history.length - 1
    },
    
    // 恢复到指定快照
    restoreSnapshot(index) {
      if (index >= 0 && index < this.history.length) {
        const snapshot = this.history[index]
        this.$patch(snapshot.state)
        this.currentIndex = index
      }
    }
  }
})
```

## 二、IDE 集成工具

### 2.1 VS Code 扩展

**推荐扩展列表**
```json
{
  "recommendations": [
    "vue.volar",
    "vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

**Pinia 代码片段**
```json
// .vscode/snippets.json
{
  "Pinia Store": {
    "prefix": "pstore",
    "body": [
      "import { defineStore } from 'pinia'",
      "",
      "export const use${1:Name}Store = defineStore('${2:name}', {",
      "  state: () => ({",
      "    ${3:// state}",
      "  }),",
      "",
      "  getters: {",
      "    ${4:// getters}",
      "  },",
      "",
      "  actions: {",
      "    ${5:// actions}",
      "  }",
      "})"
    ],
    "description": "Create Pinia store"
  }
}
```

### 2.2 TypeScript 支持工具

**类型定义生成器**
```javascript
// tools/typeGenerator.js
export class TypeGenerator {
  constructor() {
    this.stores = new Map()
  }
  
  // 分析 store 结构
  analyzeStore(store) {
    const analysis = {
      name: store.$id,
      state: this.analyzeState(store.$state),
      getters: this.analyzeGetters(store),
      actions: this.analyzeActions(store)
    }
    
    this.stores.set(store.$id, analysis)
    return analysis
  }
  
  // 生成 TypeScript 定义
  generateTypeDefinitions() {
    let output = '// Auto-generated store types\n\n'
    
    for (const [name, analysis] of this.stores) {
      output += this.generateStoreInterface(name, analysis)
      output += '\n'
    }
    
    return output
  }
  
  generateStoreInterface(name, analysis) {
    const pascalName = this.toPascalCase(name)
    
    return `interface ${pascalName}State {
${this.generateStateInterface(analysis.state)}
}

interface ${pascalName}Getters {
${this.generateGettersInterface(analysis.getters)}
}

interface ${pascalName}Actions {
${this.generateActionsInterface(analysis.actions)}
}

export interface ${pascalName}Store extends ${pascalName}State, ${pascalName}Getters, ${pascalName}Actions {
  $id: '${name}'
  $state: ${pascalName}State
}`
  }
  
  analyzeState(state) {
    const types = {}
    
    for (const [key, value] of Object.entries(state)) {
      types[key] = this.inferType(value)
    }
    
    return types
  }
  
  inferType(value) {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'any[]'
    
    const type = typeof value
    return type === 'object' ? 'Record<string, any>' : type
  }
}
```

## 三、调试辅助工具

### 3.1 状态快照工具

```javascript
// tools/stateSnapshot.js
export class StateSnapshot {
  constructor() {
    this.snapshots = new Map()
    this.watchers = new Map()
  }
  
  // 创建快照
  capture(storeId, label = '') {
    const store = this.getStore(storeId)
    if (!store) return null
    
    const snapshot = {
      id: `${storeId}-${Date.now()}`,
      storeId,
      label: label || `Snapshot ${Date.now()}`,
      timestamp: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(store.$state)),
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    }
    
    this.snapshots.set(snapshot.id, snapshot)
    return snapshot
  }
  
  // 比较快照
  compare(snapshotId1, snapshotId2) {
    const snap1 = this.snapshots.get(snapshotId1)
    const snap2 = this.snapshots.get(snapshotId2)
    
    if (!snap1 || !snap2) return null
    
    return {
      added: this.findAdded(snap1.state, snap2.state),
      removed: this.findRemoved(snap1.state, snap2.state),
      changed: this.findChanged(snap1.state, snap2.state)
    }
  }
  
  // 导出快照
  export(format = 'json') {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      snapshots: Array.from(this.snapshots.values())
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.exportCSV(data)
      default:
        return data
    }
  }
  
  // 导入快照
  import(data) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      
      parsed.snapshots.forEach(snapshot => {
        this.snapshots.set(snapshot.id, snapshot)
      })
      
      return parsed.snapshots.length
    } catch (error) {
      console.error('Failed to import snapshots:', error)
      return 0
    }
  }
}

export const stateSnapshot = new StateSnapshot()
```

### 3.2 性能分析器

```javascript
// tools/performanceProfiler.js
export class PerformanceProfiler {
  constructor() {
    this.sessions = new Map()
    this.currentSession = null
  }
  
  // 开始性能分析
  startProfiling(sessionName = `session-${Date.now()}`) {
    const session = {
      name: sessionName,
      startTime: performance.now(),
      events: [],
      stores: new Map()
    }
    
    this.sessions.set(sessionName, session)
    this.currentSession = session
    
    // 监听所有 store 变化
    this.attachStoreListeners()
    
    return sessionName
  }
  
  // 停止性能分析
  stopProfiling() {
    if (!this.currentSession) return null
    
    this.currentSession.endTime = performance.now()
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime
    
    const session = this.currentSession
    this.currentSession = null
    
    // 移除监听器
    this.detachStoreListeners()
    
    return this.generateReport(session)
  }
  
  // 记录事件
  recordEvent(type, data) {
    if (!this.currentSession) return
    
    this.currentSession.events.push({
      type,
      timestamp: performance.now() - this.currentSession.startTime,
      data
    })
  }
  
  // 生成性能报告
  generateReport(session) {
    const events = session.events
    const actionEvents = events.filter(e => e.type === 'action')
    const mutationEvents = events.filter(e => e.type === 'mutation')
    
    return {
      session: session.name,
      duration: session.duration,
      summary: {
        totalEvents: events.length,
        actions: actionEvents.length,
        mutations: mutationEvents.length,
        avgActionTime: this.calculateAverage(actionEvents, 'duration'),
        avgMutationTime: this.calculateAverage(mutationEvents, 'duration')
      },
      timeline: events,
      hotspots: this.findHotspots(events),
      recommendations: this.generateRecommendations(events)
    }
  }
  
  findHotspots(events) {
    const hotspots = []
    
    // 找出耗时最长的操作
    const slowOperations = events
      .filter(e => e.data.duration > 50)
      .sort((a, b) => b.data.duration - a.data.duration)
      .slice(0, 5)
    
    hotspots.push(...slowOperations)
    
    return hotspots
  }
}

export const performanceProfiler = new PerformanceProfiler()
```

## 四、测试工具集成

### 4.1 自动化测试助手

```javascript
// tools/testHelper.js
export class TestHelper {
  constructor() {
    this.testCases = []
    this.mockData = new Map()
  }
  
  // 生成测试用例
  generateTestCase(store, action, input) {
    const initialState = JSON.parse(JSON.stringify(store.$state))
    
    // 执行 action
    const result = store[action](input)
    
    const finalState = JSON.parse(JSON.stringify(store.$state))
    
    const testCase = {
      id: `test-${Date.now()}`,
      store: store.$id,
      action,
      input,
      initialState,
      finalState,
      result,
      timestamp: new Date().toISOString()
    }
    
    this.testCases.push(testCase)
    return testCase
  }
  
  // 导出测试代码
  exportTestCode(format = 'vitest') {
    switch (format) {
      case 'vitest':
        return this.generateVitestCode()
      case 'jest':
        return this.generateJestCode()
      default:
        return this.generateVitestCode()
    }
  }
  
  generateVitestCode() {
    let code = `import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTestStore } from '@/stores/test'

describe('Generated Tests', () => {
  let store
  
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTestStore()
  })
`
    
    this.testCases.forEach((testCase, index) => {
      code += this.generateSingleTest(testCase, index)
    })
    
    code += '})\n'
    return code
  }
  
  generateSingleTest(testCase, index) {
    return `
  it('should handle ${testCase.action} - case ${index + 1}', async () => {
    // 设置初始状态
    store.$patch(${JSON.stringify(testCase.initialState, null, 4)})
    
    // 执行操作
    const result = await store.${testCase.action}(${JSON.stringify(testCase.input)})
    
    // 验证结果
    expect(store.$state).toEqual(${JSON.stringify(testCase.finalState, null, 4)})
    ${testCase.result !== undefined ? `expect(result).toEqual(${JSON.stringify(testCase.result)})` : ''}
  })
`
  }
}

export const testHelper = new TestHelper()
```

### 4.2 Mock 数据生成器

```javascript
// tools/mockGenerator.js
export class MockGenerator {
  constructor() {
    this.schemas = new Map()
    this.generators = new Map()
    
    this.setupDefaultGenerators()
  }
  
  setupDefaultGenerators() {
    this.generators.set('string', () => Math.random().toString(36).substring(7))
    this.generators.set('number', () => Math.floor(Math.random() * 100))
    this.generators.set('boolean', () => Math.random() > 0.5)
    this.generators.set('email', () => `user${Math.floor(Math.random() * 1000)}@example.com`)
    this.generators.set('date', () => new Date().toISOString())
    this.generators.set('uuid', () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    }))
  }
  
  // 定义数据模式
  defineSchema(name, schema) {
    this.schemas.set(name, schema)
  }
  
  // 生成模拟数据
  generate(schemaName, count = 1) {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`)
    }
    
    const results = []
    
    for (let i = 0; i < count; i++) {
      results.push(this.generateObject(schema))
    }
    
    return count === 1 ? results[0] : results
  }
  
  generateObject(schema) {
    const obj = {}
    
    for (const [key, definition] of Object.entries(schema)) {
      if (typeof definition === 'string') {
        // 简单类型
        const generator = this.generators.get(definition)
        obj[key] = generator ? generator() : null
      } else if (definition.type) {
        // 复杂定义
        obj[key] = this.generateValue(definition)
      } else {
        // 嵌套对象
        obj[key] = this.generateObject(definition)
      }
    }
    
    return obj
  }
  
  generateValue(definition) {
    const { type, options, min, max } = definition
    
    switch (type) {
      case 'enum':
        return options[Math.floor(Math.random() * options.length)]
      case 'array':
        const length = Math.floor(Math.random() * (max - min + 1)) + min
        return Array.from({ length }, () => this.generateValue(definition.items))
      case 'number':
        return Math.floor(Math.random() * (max - min + 1)) + min
      default:
        const generator = this.generators.get(type)
        return generator ? generator() : null
    }
  }
}

// 使用示例
const mockGenerator = new MockGenerator()

mockGenerator.defineSchema('user', {
  id: 'uuid',
  name: 'string',
  email: 'email',
  age: { type: 'number', min: 18, max: 65 },
  role: { type: 'enum', options: ['admin', 'user', 'guest'] },
  active: 'boolean',
  createdAt: 'date'
})

export { mockGenerator }
```

## 五、构建工具集成

### 5.1 Vite 插件

```javascript
// plugins/vite-pinia-devtools.js
export function piniaDevtools(options = {}) {
  return {
    name: 'pinia-devtools',
    
    configureServer(server) {
      // 开发服务器中间件
      server.middlewares.use('/api/pinia-devtools', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            stores: [], // 从运行时获取
            version: '1.0.0'
          }))
        } else {
          next()
        }
      })
    },
    
    transformIndexHtml(html, context) {
      if (context.server && options.enableDevtools !== false) {
        return html.replace(
          '<head>',
          '<head>\n  <script src="/src/devtools/init.js" type="module"></script>'
        )
      }
      return html
    }
  }
}
```

### 5.2 Webpack 插件

```javascript
// plugins/webpack-pinia-analyzer.js
class PiniaAnalyzerPlugin {
  constructor(options = {}) {
    this.options = options
  }
  
  apply(compiler) {
    compiler.hooks.emit.tapAsync('PiniaAnalyzerPlugin', (compilation, callback) => {
      const stores = this.analyzeStores(compilation)
      
      const report = {
        timestamp: new Date().toISOString(),
        stores,
        summary: this.generateSummary(stores)
      }
      
      const reportJson = JSON.stringify(report, null, 2)
      
      compilation.assets['pinia-analysis.json'] = {
        source: () => reportJson,
        size: () => reportJson.length
      }
      
      callback()
    })
  }
  
  analyzeStores(compilation) {
    const stores = []
    
    compilation.modules.forEach(module => {
      if (this.isStoreModule(module)) {
        stores.push(this.analyzeStoreModule(module))
      }
    })
    
    return stores
  }
  
  isStoreModule(module) {
    return module.resource && 
           (module.resource.includes('/stores/') || 
            module.resource.includes('Store.'))
  }
}

export { PiniaAnalyzerPlugin }
```

## 参考资料

- [Vue DevTools](https://devtools.vuejs.org/)
- [Vite Plugin Development](https://vitejs.dev/guide/api-plugin.html)
- [VS Code Extension API](https://code.visualstudio.com/api)

**下一节** → [第 52 节：生态系统](./52-ecosystem.md)
