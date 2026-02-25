# 第 18 章：滚动行为

## 概述

滚动行为控制让我们可以自定义路由切换时的滚动位置，提升用户体验。Vue Router 提供了 `scrollBehavior` 选项，支持同步和异步滚动控制。

## scrollBehavior 配置

### 基础用法

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  
  scrollBehavior(to, from, savedPosition) {
    // to: 目标路由
    // from: 来源路由
    // savedPosition: 浏览器前进/后退时保存的位置
    
    // 返回滚动位置
    return { top: 0 }
  }
})
```

### 返回值格式

```javascript
scrollBehavior(to, from, savedPosition) {
  // 1. 滚动到顶部
  return { top: 0 }
  
  // 2. 滚动到指定位置
  return { top: 100, left: 0 }
  
  // 3. 滚动到元素（CSS 选择器）
  return { el: '#main' }
  
  // 4. 滚动到元素（带偏移）
  return {
    el: '#main',
    top: 50  // 元素顶部 + 50px 偏移
  }
  
  // 5. 使用浏览器保存的位置（前进/后退）
  if (savedPosition) {
    return savedPosition
  }
  
  // 6. 滚动到锚点
  if (to.hash) {
    return { el: to.hash }
  }
  
  // 7. 不滚动（保持当前位置）
  return false
}
```

## 保存滚动位置

### 浏览器前进/后退

```javascript
scrollBehavior(to, from, savedPosition) {
  // 如果是通过浏览器前进/后退按钮触发的导航
  // savedPosition 会包含之前的滚动位置
  if (savedPosition) {
    return savedPosition
  } else {
    // 新页面滚动到顶部
    return { top: 0 }
  }
}
```

### 模拟浏览器行为

```javascript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (savedPosition) {
        // 恢复之前的位置
        resolve(savedPosition)
      } else if (to.hash) {
        // 滚动到锚点
        resolve({ el: to.hash, behavior: 'smooth' })
      } else {
        // 新页面滚动到顶部
        resolve({ top: 0 })
      }
    }, 300)  // 等待页面渲染
  })
}
```

### 记录更精确的位置

```javascript
// 自定义位置保存（使用 sessionStorage）
const scrollPositions = new Map()

router.beforeEach((to, from) => {
  // 保存当前页面滚动位置
  if (from.name) {
    scrollPositions.set(from.fullPath, {
      x: window.scrollX,
      y: window.scrollY
    })
  }
})

scrollBehavior(to, from, savedPosition) {
  // 优先使用 savedPosition（浏览器前进/后退）
  if (savedPosition) {
    return savedPosition
  }
  
  // 使用自定义保存的位置
  const position = scrollPositions.get(to.fullPath)
  if (position) {
    return { left: position.x, top: position.y }
  }
  
  // 默认滚动到顶部
  return { top: 0 }
}
```

## 异步滚动控制

### 等待数据加载

```javascript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    // 等待数据加载完成
    this.app.$root.$once('data-loaded', () => {
      if (savedPosition) {
        resolve(savedPosition)
      } else {
        resolve({ top: 0 })
      }
    })
  })
}

// 在组件中
export default {
  async mounted() {
    await this.fetchData()
    this.$root.$emit('data-loaded')
  }
}
```

### 等待图片加载

```javascript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    // 等待所有图片加载
    const images = document.querySelectorAll('img')
    let loadedCount = 0
    
    if (images.length === 0) {
      resolve({ top: 0 })
      return
    }
    
    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount === images.length) {
        if (savedPosition) {
          resolve(savedPosition)
        } else if (to.hash) {
          resolve({ el: to.hash })
        } else {
          resolve({ top: 0 })
        }
      }
    }
    
    images.forEach(img => {
      if (img.complete) {
        checkAllLoaded()
      } else {
        img.addEventListener('load', checkAllLoaded)
        img.addEventListener('error', checkAllLoaded)
      }
    })
    
    // 超时保护
    setTimeout(() => {
      resolve({ top: 0 })
    }, 3000)
  })
}
```

### 延迟滚动

```javascript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    // 等待过渡动画完成
    setTimeout(() => {
      if (savedPosition) {
        resolve(savedPosition)
      } else {
        resolve({ top: 0 })
      }
    }, 500)
  })
}
```

## 平滑滚动实现

### 原生平滑滚动

```javascript
scrollBehavior(to, from, savedPosition) {
  if (savedPosition) {
    return {
      ...savedPosition,
      behavior: 'smooth'  // CSS scroll-behavior
    }
  }
  
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth'
    }
  }
  
  return {
    top: 0,
    behavior: 'smooth'
  }
}
```

### 自定义平滑滚动

```javascript
function smoothScroll(target, duration = 300) {
  const targetPosition = typeof target === 'number' 
    ? target 
    : target.offsetTop
  
  const startPosition = window.scrollY
  const distance = targetPosition - startPosition
  let startTime = null
  
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration)
    
    window.scrollTo(0, run)
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation)
    }
  }
  
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2
    if (t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
  }
  
  requestAnimationFrame(animation)
}

scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    if (savedPosition) {
      smoothScroll(savedPosition.top, 500)
      resolve(savedPosition)
    } else if (to.hash) {
      const el = document.querySelector(to.hash)
      if (el) {
        smoothScroll(el, 500)
        resolve({ el: to.hash })
      }
    } else {
      smoothScroll(0, 500)
      resolve({ top: 0 })
    }
  })
}
```

## 滚动行为的最佳实践

### 1. 根据场景选择滚动策略

```javascript
scrollBehavior(to, from, savedPosition) {
  // 场景 1：前进/后退 → 恢复位置
  if (savedPosition) {
    return savedPosition
  }
  
  // 场景 2：锚点导航 → 滚动到锚点
  if (to.hash) {
    return {
      el: to.hash,
      top: 80,  // 考虑固定头部
      behavior: 'smooth'
    }
  }
  
  // 场景 3：相同页面不同参数 → 保持位置
  if (to.path === from.path && to.query !== from.query) {
    return false  // 不滚动
  }
  
  // 场景 4：新页面 → 滚动到顶部
  return { top: 0 }
}
```

### 2. 考虑固定头部

```javascript
scrollBehavior(to, from, savedPosition) {
  const headerHeight = 60  // 固定头部高度
  
  if (savedPosition) {
    return savedPosition
  }
  
  if (to.hash) {
    return {
      el: to.hash,
      top: headerHeight,  // 偏移固定头部高度
      behavior: 'smooth'
    }
  }
  
  return { top: 0 }
}
```

### 3. 页面过渡动画配合

```javascript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    // 等待页面过渡动画完成
    const duration = 300  // 与 CSS 过渡时间一致
    
    setTimeout(() => {
      if (savedPosition) {
        resolve(savedPosition)
      } else {
        resolve({ top: 0 })
      }
    }, duration)
  })
}
```

### 4. 列表页面优化

```javascript
// 场景：从列表页进入详情，返回时恢复滚动位置
scrollBehavior(to, from, savedPosition) {
  // 详情页返回列表页
  if (from.name === 'PostDetail' && to.name === 'PostList') {
    // 使用保存的位置
    if (savedPosition) {
      return new Promise((resolve) => {
        // 等待列表数据加载
        setTimeout(() => {
          resolve(savedPosition)
        }, 100)
      })
    }
  }
  
  // 其他情况滚动到顶部
  return { top: 0 }
}
```

### 5. 移动端优化

```javascript
scrollBehavior(to, from, savedPosition) {
  // 移动端禁用平滑滚动（性能考虑）
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  
  const behavior = isMobile ? 'auto' : 'smooth'
  
  if (savedPosition) {
    return { ...savedPosition, behavior }
  }
  
  if (to.hash) {
    return { el: to.hash, behavior }
  }
  
  return { top: 0, behavior }
}
```

## 特殊场景处理

### 无限滚动列表

```javascript
// 保存列表滚动位置和加载的数据
const listStates = new Map()

router.beforeEach((to, from) => {
  if (from.name === 'PostList') {
    listStates.set('PostList', {
      scrollY: window.scrollY,
      loadedPages: store.state.posts.loadedPages
    })
  }
})

scrollBehavior(to, from, savedPosition) {
  if (to.name === 'PostList') {
    const state = listStates.get('PostList')
    
    if (state) {
      return new Promise((resolve) => {
        // 恢复数据加载状态
        store.dispatch('posts/restorePages', state.loadedPages)
        
        // 等待数据恢复
        nextTick(() => {
          resolve({ top: state.scrollY })
        })
      })
    }
  }
  
  return { top: 0 }
}
```

### 虚拟滚动列表

```javascript
scrollBehavior(to, from, savedPosition) {
  // 虚拟滚动组件需要特殊处理
  if (to.meta.virtualScroll) {
    return new Promise((resolve) => {
      // 等待虚拟滚动组件初始化
      setTimeout(() => {
        if (savedPosition) {
          // 通知虚拟滚动组件恢复位置
          eventBus.emit('restore-scroll', savedPosition.top)
          resolve(savedPosition)
        } else {
          resolve({ top: 0 })
        }
      }, 100)
    })
  }
  
  return savedPosition || { top: 0 }
}
```

### 模态框中的路由

```javascript
scrollBehavior(to, from, savedPosition) {
  // 模态框路由不滚动
  if (to.meta.modal) {
    return false
  }
  
  return savedPosition || { top: 0 }
}
```

## 关键点总结

1. **scrollBehavior**：在路由创建时配置，控制滚动行为
2. **savedPosition**：浏览器前进/后退时自动保存的位置
3. **异步滚动**：返回 Promise，等待数据或动画完成
4. **平滑滚动**：使用 `behavior: 'smooth'` 或自定义实现
5. **最佳实践**：根据场景选择策略、考虑固定头部、优化移动端

## 深入一点：滚动恢复的原理

```javascript
// Vue Router 内部实现（简化版）

class Router {
  constructor(options) {
    this.scrollBehavior = options.scrollBehavior
    this.savedPositions = new Map()
    
    // 监听滚动事件，保存位置
    window.addEventListener('scroll', () => {
      const key = this.currentRoute.fullPath
      this.savedPositions.set(key, {
        left: window.scrollX,
        top: window.scrollY
      })
    })
  }
  
  async navigate(to) {
    const from = this.currentRoute
    
    // 获取保存的位置
    const savedPosition = this.savedPositions.get(to.fullPath)
    
    // 执行导航
    await this.updateRoute(to)
    
    // 滚动行为
    if (this.scrollBehavior) {
      const position = await this.scrollBehavior(to, from, savedPosition)
      
      if (position) {
        window.scrollTo(position.left || 0, position.top || 0)
      }
    }
  }
}
```

## 参考资料

- [Vue Router - 滚动行为](https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html)
- [MDN - Element.scrollIntoView()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)
- [MDN - Window.scrollTo()](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/scrollTo)
