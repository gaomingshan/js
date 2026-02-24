# Worker 支持

## 概述

Vite 提供了对 Web Worker、SharedWorker 和 ServiceWorker 的原生支持，可以轻松实现多线程和离线功能。本章介绍 Worker 的使用方式、构建配置、通信机制以及性能优化。

## Web Worker 导入方式

### 方式1：带查询参数导入

```javascript
// 导入为 Worker
import MyWorker from './worker?worker'

const worker = new MyWorker()

worker.postMessage({ type: 'start' })

worker.onmessage = (e) => {
  console.log('收到消息:', e.data)
}
```

### 方式2：构造函数方式

```javascript
// worker.js
self.onmessage = (e) => {
  console.log('Worker 收到:', e.data)
  self.postMessage('处理完成')
}

// main.js
const worker = new Worker(
  new URL('./worker.js', import.meta.url),
  { type: 'module' }
)
```

### 方式3：内联 Worker

```javascript
import MyWorker from './worker?worker&inline'

// Worker 代码会被内联到主 bundle 中
const worker = new MyWorker()
```

## Worker 构建配置

### 基础配置

```javascript
// vite.config.js
export default {
  worker: {
    // Worker 输出格式
    format: 'es',  // 'es' | 'iife'
    
    // Worker 插件
    plugins: [],
    
    // Rollup 选项
    rollupOptions: {
      output: {
        entryFileNames: 'worker/[name].[hash].js'
      }
    }
  }
}
```

### 输出格式

```javascript
export default {
  worker: {
    // ES Module 格式（推荐）
    format: 'es',
    
    // 或 IIFE 格式（兼容性更好）
    // format: 'iife'
  }
}
```

### 自定义插件

```javascript
export default {
  worker: {
    plugins: [
      // Worker 专用插件
      myWorkerPlugin()
    ]
  }
}
```

## Worker 类型

### Web Worker

普通 Worker，独立线程：

```javascript
// worker.js
self.onmessage = function(e) {
  console.log('Worker:', e.data)
  
  // 执行计算密集任务
  const result = heavyComputation(e.data)
  
  self.postMessage(result)
}

function heavyComputation(data) {
  // 耗时计算
  let sum = 0
  for (let i = 0; i < 1000000000; i++) {
    sum += i
  }
  return sum
}

// main.js
import MyWorker from './worker?worker'

const worker = new MyWorker()

worker.postMessage({ data: 'hello' })

worker.onmessage = (e) => {
  console.log('计算结果:', e.data)
}
```

### SharedWorker

多个页面共享的 Worker：

```javascript
// shared-worker.js
const connections = []

self.onconnect = function(e) {
  const port = e.ports[0]
  connections.push(port)
  
  port.onmessage = function(e) {
    // 广播给所有连接
    connections.forEach(conn => {
      conn.postMessage(e.data)
    })
  }
  
  port.start()
}

// main.js
const worker = new SharedWorker(
  new URL('./shared-worker.js', import.meta.url),
  { type: 'module' }
)

worker.port.start()

worker.port.onmessage = (e) => {
  console.log('收到广播:', e.data)
}

worker.port.postMessage('hello')
```

### ServiceWorker

用于缓存和离线支持：

```javascript
// service-worker.js
const CACHE_NAME = 'my-app-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/main.js',
        '/assets/style.css'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('SW 注册成功:', registration)
    })
    .catch(error => {
      console.log('SW 注册失败:', error)
    })
}
```

## Worker 与主线程通信

### 基础通信

```javascript
// worker.js
self.onmessage = (e) => {
  const { type, data } = e.data
  
  switch (type) {
    case 'compute':
      const result = compute(data)
      self.postMessage({ type: 'result', data: result })
      break
      
    case 'cancel':
      self.close()
      break
  }
}

// main.js
const worker = new MyWorker()

worker.postMessage({ type: 'compute', data: [1, 2, 3] })

worker.onmessage = (e) => {
  if (e.data.type === 'result') {
    console.log('结果:', e.data.data)
  }
}
```

### 传输大数据

```javascript
// 使用 Transferable Objects（零拷贝）
const buffer = new ArrayBuffer(1024 * 1024)  // 1MB
const uint8 = new Uint8Array(buffer)

// 填充数据
for (let i = 0; i < uint8.length; i++) {
  uint8[i] = i % 256
}

// 转移所有权（不复制）
worker.postMessage({ buffer }, [buffer])

// buffer 在主线程中不再可用
console.log(buffer.byteLength)  // 0
```

### 双向通信

```javascript
// worker.js
self.onmessage = (e) => {
  // 处理请求
  const result = process(e.data)
  
  // 发送结果
  self.postMessage(result)
  
  // 主动询问
  self.postMessage({ type: 'needMoreData' })
}

// main.js
worker.onmessage = (e) => {
  if (e.data.type === 'needMoreData') {
    worker.postMessage({ type: 'moreData', data: [...] })
  } else {
    handleResult(e.data)
  }
}
```

### 错误处理

```javascript
// worker.js
self.onerror = (error) => {
  self.postMessage({
    type: 'error',
    message: error.message
  })
}

// main.js
worker.onerror = (error) => {
  console.error('Worker 错误:', error.message)
}

worker.onmessageerror = (error) => {
  console.error('消息解析错误:', error)
}
```

## Worker 性能优化

### 1. Worker 池

```javascript
// worker-pool.js
class WorkerPool {
  constructor(workerPath, size = 4) {
    this.workers = []
    this.queue = []
    
    for (let i = 0; i < size; i++) {
      this.workers.push({
        worker: new Worker(workerPath, { type: 'module' }),
        busy: false
      })
    }
  }
  
  async exec(data) {
    return new Promise((resolve, reject) => {
      const task = { data, resolve, reject }
      
      const available = this.workers.find(w => !w.busy)
      
      if (available) {
        this.runTask(available, task)
      } else {
        this.queue.push(task)
      }
    })
  }
  
  runTask(workerInfo, task) {
    workerInfo.busy = true
    
    const handler = (e) => {
      workerInfo.busy = false
      workerInfo.worker.removeEventListener('message', handler)
      
      task.resolve(e.data)
      
      // 处理队列中的下一个任务
      if (this.queue.length > 0) {
        this.runTask(workerInfo, this.queue.shift())
      }
    }
    
    workerInfo.worker.addEventListener('message', handler)
    workerInfo.worker.postMessage(task.data)
  }
  
  terminate() {
    this.workers.forEach(w => w.worker.terminate())
  }
}

// 使用
const pool = new WorkerPool(
  new URL('./worker.js', import.meta.url),
  4  // 4 个 Worker
)

// 并发执行任务
const results = await Promise.all([
  pool.exec({ task: 'compute', data: 1 }),
  pool.exec({ task: 'compute', data: 2 }),
  pool.exec({ task: 'compute', data: 3 })
])
```

### 2. 任务分片

```javascript
// worker.js
self.onmessage = async (e) => {
  const { data, chunkSize = 1000 } = e.data
  
  // 分片处理
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const result = processChunk(chunk)
    
    // 发送进度
    self.postMessage({
      type: 'progress',
      progress: (i + chunkSize) / data.length,
      result
    })
  }
  
  self.postMessage({ type: 'complete' })
}

// main.js
worker.onmessage = (e) => {
  if (e.data.type === 'progress') {
    updateProgress(e.data.progress)
  } else if (e.data.type === 'complete') {
    console.log('完成')
  }
}
```

### 3. 预热 Worker

```javascript
// 应用启动时创建 Worker
const worker = new MyWorker()

// 预热（触发 Worker 初始化）
worker.postMessage({ type: 'warmup' })

// 后续使用
function compute(data) {
  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      resolve(e.data)
    }
    worker.postMessage({ type: 'compute', data })
  })
}
```

### 4. 缓存计算结果

```javascript
// worker.js
const cache = new Map()

self.onmessage = (e) => {
  const { id, data } = e.data
  
  // 检查缓存
  if (cache.has(id)) {
    self.postMessage(cache.get(id))
    return
  }
  
  // 计算
  const result = compute(data)
  
  // 缓存结果
  cache.set(id, result)
  
  self.postMessage(result)
}
```

## Worker 调试技巧

### 1. Chrome DevTools

```javascript
// 在 Worker 中使用 console
self.onmessage = (e) => {
  console.log('Worker 收到:', e.data)
  
  // 断点调试
  debugger
  
  const result = process(e.data)
  self.postMessage(result)
}
```

Chrome DevTools → Sources → Threads 查看所有 Worker

### 2. 性能分析

```javascript
// worker.js
self.onmessage = (e) => {
  console.time('worker-compute')
  
  const result = compute(e.data)
  
  console.timeEnd('worker-compute')
  
  self.postMessage(result)
}
```

### 3. 错误上报

```javascript
// worker.js
self.addEventListener('error', (error) => {
  // 上报错误
  fetch('/api/error', {
    method: 'POST',
    body: JSON.stringify({
      message: error.message,
      filename: error.filename,
      lineno: error.lineno
    })
  })
})
```

## 实战示例

### 图片处理 Worker

```javascript
// image-worker.js
self.onmessage = async (e) => {
  const { imageData, filter } = e.data
  
  const processed = applyFilter(imageData, filter)
  
  self.postMessage({ imageData: processed }, [processed.data.buffer])
}

function applyFilter(imageData, filter) {
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    if (filter === 'grayscale') {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i + 1] = data[i + 2] = avg
    }
  }
  
  return imageData
}

// main.js
import ImageWorker from './image-worker?worker'

const worker = new ImageWorker()

async function processImage(canvas, filter) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  
  worker.postMessage({ imageData, filter }, [imageData.data.buffer])
  
  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      ctx.putImageData(e.data.imageData, 0, 0)
      resolve()
    }
  })
}
```

### 大数据排序 Worker

```javascript
// sort-worker.js
self.onmessage = (e) => {
  const { data, algorithm } = e.data
  
  console.time('sort')
  
  let sorted
  if (algorithm === 'quick') {
    sorted = quickSort(data)
  } else {
    sorted = data.sort((a, b) => a - b)
  }
  
  console.timeEnd('sort')
  
  self.postMessage(sorted)
}

function quickSort(arr) {
  if (arr.length <= 1) return arr
  
  const pivot = arr[Math.floor(arr.length / 2)]
  const left = arr.filter(x => x < pivot)
  const middle = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)
  
  return [...quickSort(left), ...middle, ...quickSort(right)]
}

// main.js
import SortWorker from './sort-worker?worker'

const worker = new SortWorker()

async function sortLargeArray(array) {
  worker.postMessage({ data: array, algorithm: 'quick' })
  
  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      resolve(e.data)
    }
  })
}
```

## 常见问题

### 1. Worker 无法访问 DOM

Worker 在独立线程，不能访问 DOM：
```javascript
// ❌ 错误
self.onmessage = () => {
  document.getElementById('app')  // 错误
}

// ✅ 正确：通过消息通信
self.onmessage = (e) => {
  const result = compute(e.data)
  self.postMessage({ type: 'updateDOM', result })
}
```

### 2. 模块导入问题

```javascript
// Worker 中使用 import
import { helper } from './helper.js'

self.onmessage = (e) => {
  const result = helper(e.data)
  self.postMessage(result)
}
```

### 3. Worker 内存泄漏

```javascript
// 使用完后终止 Worker
worker.terminate()

// 或在 Worker 内部关闭
self.close()
```

## 参考资料

- [Vite Web Worker](https://cn.vitejs.dev/guide/features.html#web-workers)
- [MDN Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
