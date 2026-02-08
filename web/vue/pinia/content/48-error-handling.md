# 第 48 节：错误处理与监控

## 概述

健壮的错误处理机制是状态管理系统的重要组成部分，能够提升应用的稳定性和用户体验。本节介绍错误捕获、处理和监控的最佳实践。

## 一、错误处理策略

### 1.1 错误分类体系

```javascript
// errors/errorTypes.js
export const ErrorTypes = {
  // 状态管理错误
  STATE_ERROR: 'STATE_ERROR',
  MUTATION_ERROR: 'MUTATION_ERROR', 
  ACTION_ERROR: 'ACTION_ERROR',
  
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 业务错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  
  // 系统错误
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN_ERROR, severity = ErrorSeverity.MEDIUM, metadata = {}) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.metadata = metadata
    this.timestamp = new Date().toISOString()
    this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}
```

### 1.2 错误处理中心

```javascript
// errors/errorHandler.js
export class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      enableReporting: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    }
    
    this.handlers = new Map()
    this.middleware = []
    this.reporters = []
    this.errorHistory = []
    
    this.setupGlobalHandlers()
  }
  
  setupGlobalHandlers() {
    // 捕获未处理的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new AppError(
        event.reason?.message || 'Unhandled Promise Rejection',
        ErrorTypes.SYSTEM_ERROR,
        ErrorSeverity.HIGH,
        { reason: event.reason }
      ))
    })
    
    // 捕获全局 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.handleError(new AppError(
        event.message,
        ErrorTypes.SYSTEM_ERROR,
        ErrorSeverity.HIGH,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      ))
    })
  }
  
  // 注册错误处理器
  register(errorType, handler) {
    if (!this.handlers.has(errorType)) {
      this.handlers.set(errorType, [])
    }
    this.handlers.get(errorType).push(handler)
  }
  
  // 添加中间件
  use(middleware) {
    this.middleware.push(middleware)
  }
  
  // 添加错误报告器
  addReporter(reporter) {
    this.reporters.push(reporter)
  }
  
  // 处理错误
  async handleError(error, context = {}) {
    try {
      // 规范化错误对象
      const normalizedError = this.normalizeError(error)
      
      // 添加上下文信息
      normalizedError.metadata = { ...normalizedError.metadata, ...context }
      
      // 执行中间件
      let processedError = normalizedError
      for (const middleware of this.middleware) {
        processedError = await middleware(processedError)
      }
      
      // 记录错误历史
      this.errorHistory.push(processedError)
      
      // 执行类型特定的处理器
      await this.executeHandlers(processedError)
      
      // 报告错误
      if (this.options.enableReporting) {
        await this.reportError(processedError)
      }
      
      // 记录日志
      if (this.options.enableLogging) {
        this.logError(processedError)
      }
      
      return processedError
    } catch (handlingError) {
      console.error('Error in error handler:', handlingError)
    }
  }
  
  normalizeError(error) {
    if (error instanceof AppError) {
      return error
    }
    
    return new AppError(
      error.message || 'Unknown error',
      ErrorTypes.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      {
        originalError: error.name,
        stack: error.stack
      }
    )
  }
  
  async executeHandlers(error) {
    const handlers = this.handlers.get(error.type) || []
    const genericHandlers = this.handlers.get('*') || []
    
    for (const handler of [...handlers, ...genericHandlers]) {
      try {
        await handler(error)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }
  }
  
  async reportError(error) {
    const reports = this.reporters.map(reporter => 
      reporter.report(error).catch(err => 
        console.error('Error reporter failed:', err)
      )
    )
    
    await Promise.allSettled(reports)
  }
  
  logError(error) {
    const logLevel = this.getLogLevel(error.severity)
    console[logLevel](`[${error.type}] ${error.message}`, error.metadata)
  }
  
  getLogLevel(severity) {
    switch (severity) {
      case ErrorSeverity.LOW: return 'info'
      case ErrorSeverity.MEDIUM: return 'warn'
      case ErrorSeverity.HIGH: return 'error'
      case ErrorSeverity.CRITICAL: return 'error'
      default: return 'log'
    }
  }
  
  // 重试机制
  async retry(operation, maxRetries = this.options.maxRetries) {
    let lastError
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt < maxRetries) {
          await this.delay(this.options.retryDelay * Math.pow(2, attempt))
        }
      }
    }
    
    throw lastError
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // 获取错误统计
  getErrorStats(timeRange = 24 * 60 * 60 * 1000) { // 24小时
    const cutoff = Date.now() - timeRange
    const recentErrors = this.errorHistory.filter(error => 
      new Date(error.timestamp).getTime() > cutoff
    )
    
    return {
      total: recentErrors.length,
      byType: this.groupBy(recentErrors, 'type'),
      bySeverity: this.groupBy(recentErrors, 'severity'),
      timeline: this.groupByTime(recentErrors)
    }
  }
  
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }
  
  groupByTime(errors, interval = 60 * 60 * 1000) { // 1小时间隔
    const groups = {}
    
    errors.forEach(error => {
      const timestamp = new Date(error.timestamp).getTime()
      const timeSlot = Math.floor(timestamp / interval) * interval
      groups[timeSlot] = (groups[timeSlot] || 0) + 1
    })
    
    return groups
  }
}

export const errorHandler = new ErrorHandler()
```

## 二、Store 错误处理

### 2.1 Pinia 错误处理插件

```javascript
// plugins/errorPlugin.js
export function createErrorPlugin(options = {}) {
  const {
    captureActions = true,
    captureGetters = true,
    retryFailedActions = true,
    maxRetries = 3
  } = options
  
  return (context) => {
    const { store } = context
    
    // 包装 actions
    if (captureActions) {
      Object.keys(store).forEach(key => {
        if (typeof store[key] === 'function' && !key.startsWith('$')) {
          const originalAction = store[key]
          
          store[key] = async function(...args) {
            try {
              return await originalAction.apply(this, args)
            } catch (error) {
              const appError = new AppError(
                `Action '${key}' failed: ${error.message}`,
                ErrorTypes.ACTION_ERROR,
                ErrorSeverity.MEDIUM,
                {
                  storeId: store.$id,
                  actionName: key,
                  args,
                  originalError: error
                }
              )
              
              await errorHandler.handleError(appError)
              
              // 重试机制
              if (retryFailedActions) {
                return errorHandler.retry(() => originalAction.apply(this, args), maxRetries)
              }
              
              throw appError
            }
          }
        }
      })
    }
    
    // 包装 getters (如果可能)
    if (captureGetters) {
      const originalPatch = store.$patch
      
      store.$patch = function(stateOrFn) {
        try {
          return originalPatch.call(this, stateOrFn)
        } catch (error) {
          const appError = new AppError(
            `State patch failed: ${error.message}`,
            ErrorTypes.STATE_ERROR,
            ErrorSeverity.HIGH,
            {
              storeId: store.$id,
              patch: typeof stateOrFn === 'function' ? 'function' : stateOrFn,
              originalError: error
            }
          )
          
          errorHandler.handleError(appError)
          throw appError
        }
      }
    }
  }
}
```

### 2.2 错误恢复 Store

```javascript
// stores/errorRecovery.js
export const useErrorRecoveryStore = defineStore('errorRecovery', {
  state: () => ({
    errors: [],
    globalError: null,
    networkStatus: 'online',
    recoveryStrategies: new Map()
  }),
  
  getters: {
    hasErrors: (state) => state.errors.length > 0,
    criticalErrors: (state) => state.errors.filter(e => e.severity === ErrorSeverity.CRITICAL),
    recentErrors: (state) => state.errors.slice(-10)
  },
  
  actions: {
    // 记录错误
    logError(error) {
      this.errors.push({
        ...error,
        id: error.id || Date.now(),
        timestamp: error.timestamp || new Date().toISOString()
      })
      
      // 设置全局错误（如果是关键错误）
      if (error.severity === ErrorSeverity.CRITICAL) {
        this.globalError = error
      }
    },
    
    // 清除错误
    clearError(errorId) {
      this.errors = this.errors.filter(e => e.id !== errorId)
      
      if (this.globalError && this.globalError.id === errorId) {
        this.globalError = null
      }
    },
    
    // 清除所有错误
    clearAllErrors() {
      this.errors = []
      this.globalError = null
    },
    
    // 注册恢复策略
    registerRecoveryStrategy(errorType, strategy) {
      this.recoveryStrategies.set(errorType, strategy)
    },
    
    // 尝试恢复
    async attemptRecovery(error) {
      const strategy = this.recoveryStrategies.get(error.type)
      
      if (strategy) {
        try {
          await strategy(error)
          this.clearError(error.id)
          return true
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError)
          return false
        }
      }
      
      return false
    },
    
    // 更新网络状态
    updateNetworkStatus(status) {
      this.networkStatus = status
    }
  }
})

// 注册默认恢复策略
const errorRecoveryStore = useErrorRecoveryStore()

errorRecoveryStore.registerRecoveryStrategy(ErrorTypes.NETWORK_ERROR, async (error) => {
  // 网络错误恢复：重试请求
  if (error.metadata.retryFunction) {
    await error.metadata.retryFunction()
  }
})

errorRecoveryStore.registerRecoveryStrategy(ErrorTypes.API_ERROR, async (error) => {
  // API 错误恢复：刷新认证token
  if (error.metadata.status === 401) {
    const authStore = useAuthStore()
    await authStore.refreshToken()
  }
})
```

## 三、错误监控与报告

### 3.1 错误监控系统

```javascript
// monitoring/errorMonitor.js
export class ErrorMonitor {
  constructor(options = {}) {
    this.options = {
      enableRealTimeAlerts: true,
      alertThreshold: 5, // 5分钟内错误次数
      alertTimeWindow: 5 * 60 * 1000,
      enableTrending: true,
      ...options
    }
    
    this.alerts = new Map()
    this.trends = new Map()
    
    this.setupMonitoring()
  }
  
  setupMonitoring() {
    // 监听错误事件
    errorHandler.use(async (error) => {
      await this.processError(error)
      return error
    })
  }
  
  async processError(error) {
    // 实时告警检查
    if (this.options.enableRealTimeAlerts) {
      await this.checkAlerts(error)
    }
    
    // 趋势分析
    if (this.options.enableTrending) {
      this.updateTrends(error)
    }
    
    // 异常检测
    this.detectAnomalies(error)
  }
  
  async checkAlerts(error) {
    const key = `${error.type}:${error.severity}`
    const now = Date.now()
    const timeWindow = this.options.alertTimeWindow
    
    if (!this.alerts.has(key)) {
      this.alerts.set(key, [])
    }
    
    const alerts = this.alerts.get(key)
    
    // 添加当前错误
    alerts.push(now)
    
    // 清理过期的告警记录
    const cutoff = now - timeWindow
    this.alerts.set(key, alerts.filter(timestamp => timestamp > cutoff))
    
    // 检查是否触发告警
    if (alerts.length >= this.options.alertThreshold) {
      await this.triggerAlert(error, alerts.length)
      // 重置计数器
      this.alerts.set(key, [])
    }
  }
  
  async triggerAlert(error, count) {
    const alert = {
      id: `alert-${Date.now()}`,
      type: 'error-threshold',
      severity: 'high',
      message: `${error.type} errors exceeded threshold`,
      details: {
        errorType: error.type,
        errorSeverity: error.severity,
        count,
        timeWindow: this.options.alertTimeWindow / 1000 // 秒
      },
      timestamp: new Date().toISOString()
    }
    
    // 发送告警通知
    await this.sendAlert(alert)
  }
  
  async sendAlert(alert) {
    // 实现具体的告警发送逻辑
    console.warn('ALERT:', alert)
    
    // 可以集成邮件、短信、Slack等通知方式
    if (this.options.webhookUrl) {
      try {
        await fetch(this.options.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        })
      } catch (error) {
        console.error('Failed to send alert webhook:', error)
      }
    }
  }
  
  updateTrends(error) {
    const key = error.type
    const hour = Math.floor(Date.now() / (60 * 60 * 1000)) // 小时级别
    
    if (!this.trends.has(key)) {
      this.trends.set(key, new Map())
    }
    
    const errorTrend = this.trends.get(key)
    errorTrend.set(hour, (errorTrend.get(hour) || 0) + 1)
    
    // 保留最近24小时的数据
    const cutoff = hour - 24
    errorTrend.forEach((count, h) => {
      if (h < cutoff) {
        errorTrend.delete(h)
      }
    })
  }
  
  detectAnomalies(error) {
    // 简单的异常检测：比较当前小时与历史平均值
    const key = error.type
    const trend = this.trends.get(key)
    
    if (!trend || trend.size < 3) return
    
    const values = Array.from(trend.values())
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const current = values[values.length - 1]
    
    // 如果当前值超过平均值的3倍，标记为异常
    if (current > average * 3) {
      this.reportAnomaly(error, { current, average, threshold: 3 })
    }
  }
  
  reportAnomaly(error, stats) {
    console.warn('ANOMALY DETECTED:', {
      errorType: error.type,
      currentCount: stats.current,
      averageCount: stats.average,
      threshold: stats.threshold
    })
  }
  
  // 获取监控报告
  getReport(timeRange = 24 * 60 * 60 * 1000) {
    const trends = {}
    
    this.trends.forEach((hourlyData, errorType) => {
      trends[errorType] = Object.fromEntries(hourlyData)
    })
    
    return {
      timeRange,
      trends,
      alerts: Object.fromEntries(this.alerts),
      summary: this.generateSummary()
    }
  }
  
  generateSummary() {
    let totalErrors = 0
    let topErrorType = null
    let maxCount = 0
    
    this.trends.forEach((hourlyData, errorType) => {
      const count = Array.from(hourlyData.values()).reduce((sum, val) => sum + val, 0)
      totalErrors += count
      
      if (count > maxCount) {
        maxCount = count
        topErrorType = errorType
      }
    })
    
    return {
      totalErrors,
      topErrorType,
      errorTypes: this.trends.size
    }
  }
}

export const errorMonitor = new ErrorMonitor()
```

## 四、用户友好的错误界面

### 4.1 错误边界组件

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">{{ errorTitle }}</h3>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div v-if="showDetails" class="error-details">
        <pre>{{ errorDetails }}</pre>
      </div>
      
      <div class="error-actions">
        <button @click="retry" class="retry-btn">重试</button>
        <button @click="reload" class="reload-btn">刷新页面</button>
        <button @click="toggleDetails" class="details-btn">
          {{ showDetails ? '隐藏' : '显示' }}详情
        </button>
        <button @click="reportError" class="report-btn">报告问题</button>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'

const props = defineProps({
  fallback: {
    type: Function,
    default: null
  },
  onError: {
    type: Function,
    default: null
  }
})

const hasError = ref(false)
const error = ref(null)
const showDetails = ref(false)

const errorTitle = computed(() => {
  if (!error.value) return ''
  
  switch (error.value.type) {
    case ErrorTypes.NETWORK_ERROR:
      return '网络连接异常'
    case ErrorTypes.API_ERROR:
      return '服务器错误'
    case ErrorTypes.PERMISSION_ERROR:
      return '权限不足'
    default:
      return '发生了未知错误'
  }
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  
  return error.value.message || '请稍后重试或联系技术支持'
})

const errorDetails = computed(() => {
  if (!error.value) return ''
  
  return JSON.stringify(error.value, null, 2)
})

onErrorCaptured((err, instance, info) => {
  console.error('Error captured by boundary:', err)
  
  hasError.value = true
  error.value = err instanceof AppError ? err : new AppError(
    err.message,
    ErrorTypes.SYSTEM_ERROR,
    ErrorSeverity.HIGH,
    { componentInfo: info }
  )
  
  props.onError?.(error.value, instance, info)
  
  return false // 阻止错误继续传播
})

const retry = () => {
  hasError.value = false
  error.value = null
  showDetails.value = false
}

const reload = () => {
  window.location.reload()
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const reportError = async () => {
  try {
    await errorHandler.handleError(error.value, {
      userReported: true,
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    
    alert('错误报告已提交，谢谢您的反馈！')
  } catch (reportError) {
    console.error('Failed to report error:', reportError)
    alert('报告提交失败，请稍后重试')
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  color: #e74c3c;
  margin-bottom: 8px;
}

.error-message {
  color: #666;
  margin-bottom: 24px;
}

.error-details {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  text-align: left;
  margin-bottom: 24px;
  font-size: 12px;
}

.error-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn {
  background: #3498db;
  color: white;
}

.reload-btn {
  background: #95a5a6;
  color: white;
}

.details-btn {
  background: #f39c12;
  color: white;
}

.report-btn {
  background: #e74c3c;
  color: white;
}
</style>
```

## 参考资料

- [Error Handling Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Vue Error Handling](https://vuejs.org/guide/best-practices/production-deployment.html#tracking-runtime-errors)
- [Application Monitoring](https://web.dev/vitals/)

**下一节** → [第 49 节：安全性考虑](./49-security-considerations.md)
