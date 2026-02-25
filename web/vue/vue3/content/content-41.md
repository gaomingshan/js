# 测试

> 通过单元测试和组件测试保证代码质量。

## 核心概念

Vue 3 推荐使用 Vitest 作为测试框架。

### 安装

```bash
npm install -D vitest @vue/test-utils happy-dom
```

---

## Vitest 配置

### vite.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### tests/setup.ts

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@vue/test-utils'
import matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

---

## 单元测试

### 基础测试

```typescript
// src/utils/math.ts
export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}

// src/utils/math.spec.ts
import { describe, it, expect } from 'vitest'
import { add, multiply } from './math'

describe('Math Utils', () => {
  it('adds two numbers', () => {
    expect(add(1, 2)).toBe(3)
    expect(add(-1, 1)).toBe(0)
  })
  
  it('multiplies two numbers', () => {
    expect(multiply(2, 3)).toBe(6)
    expect(multiply(-2, 3)).toBe(-6)
  })
})
```

### 异步测试

```typescript
// src/api/user.ts
export async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// src/api/user.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchUser } from './user'

describe('User API', () => {
  it('fetches user by id', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'Alice' })
      })
    ) as any
    
    const user = await fetchUser(1)
    
    expect(user).toEqual({ id: 1, name: 'Alice' })
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })
})
```

---

## 组件测试

### 基础组件测试

```vue
<!-- src/components/Counter.vue -->
<script setup lang="ts">
const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>
```

```typescript
// src/components/Counter.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter)
    expect(wrapper.text()).toContain('Count: 0')
  })
  
  it('increments count when + button is clicked', async () => {
    const wrapper = mount(Counter)
    const button = wrapper.findAll('button')[0]
    
    await button.trigger('click')
    expect(wrapper.text()).toContain('Count: 1')
  })
  
  it('decrements count when - button is clicked', async () => {
    const wrapper = mount(Counter)
    const button = wrapper.findAll('button')[1]
    
    await button.trigger('click')
    expect(wrapper.text()).toContain('Count: -1')
  })
})
```

### 测试 Props

```vue
<!-- src/components/Greeting.vue -->
<script setup lang="ts">
interface Props {
  name: string
  age?: number
}

const props = defineProps<Props>()
</script>

<template>
  <div>
    <h1>Hello, {{ name }}!</h1>
    <p v-if="age">Age: {{ age }}</p>
  </div>
</template>
```

```typescript
// src/components/Greeting.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Greeting from './Greeting.vue'

describe('Greeting', () => {
  it('renders name prop', () => {
    const wrapper = mount(Greeting, {
      props: { name: 'Alice' }
    })
    
    expect(wrapper.text()).toContain('Hello, Alice!')
  })
  
  it('renders age when provided', () => {
    const wrapper = mount(Greeting, {
      props: { name: 'Alice', age: 25 }
    })
    
    expect(wrapper.text()).toContain('Age: 25')
  })
  
  it('does not render age when not provided', () => {
    const wrapper = mount(Greeting, {
      props: { name: 'Alice' }
    })
    
    expect(wrapper.text()).not.toContain('Age:')
  })
})
```

### 测试 Emits

```vue
<!-- src/components/ClickCounter.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  click: [count: number]
}>()

const count = ref(0)

function handleClick() {
  count.value++
  emit('click', count.value)
}
</script>

<template>
  <button @click="handleClick">
    Clicked {{ count }} times
  </button>
</template>
```

```typescript
// src/components/ClickCounter.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClickCounter from './ClickCounter.vue'

describe('ClickCounter', () => {
  it('emits click event with count', async () => {
    const wrapper = mount(ClickCounter)
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([1])
  })
  
  it('emits multiple times', async () => {
    const wrapper = mount(ClickCounter)
    const button = wrapper.find('button')
    
    await button.trigger('click')
    await button.trigger('click')
    await button.trigger('click')
    
    const clickEvents = wrapper.emitted('click')
    expect(clickEvents).toHaveLength(3)
    expect(clickEvents?.[0]).toEqual([1])
    expect(clickEvents?.[1]).toEqual([2])
    expect(clickEvents?.[2]).toEqual([3])
  })
})
```

### 测试 Slots

```vue
<!-- src/components/Card.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

```typescript
// src/components/Card.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from './Card.vue'

describe('Card', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Card content'
      }
    })
    
    expect(wrapper.text()).toContain('Card content')
  })
  
  it('renders named slots', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h2>Title</h2>',
        default: 'Content',
        footer: '<button>OK</button>'
      }
    })
    
    expect(wrapper.html()).toContain('<h2>Title</h2>')
    expect(wrapper.text()).toContain('Content')
    expect(wrapper.html()).toContain('<button>OK</button>')
  })
  
  it('does not render header when slot is empty', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Content'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })
})
```

---

## 测试 Composables

```typescript
// src/composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return { count, double, increment, decrement }
}

// src/composables/useCounter.spec.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })
  
  it('initializes with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })
  
  it('increments count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
  
  it('calculates double', () => {
    const { count, double, increment } = useCounter()
    expect(double.value).toBe(0)
    
    increment()
    expect(double.value).toBe(2)
  })
})
```

---

## 测试 Pinia Store

```typescript
// stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  async function fetchCount() {
    const response = await api.getCount()
    count.value = response.count
  }
  
  return { count, double, increment, fetchCount }
})

// stores/counter.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('initializes with default state', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })
  
  it('increments count', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
  })
  
  it('calculates double', () => {
    const store = useCounterStore()
    store.count = 5
    expect(store.double).toBe(10)
  })
  
  it('fetches count from API', async () => {
    // Mock API
    vi.mock('@/api', () => ({
      api: {
        getCount: vi.fn(() => Promise.resolve({ count: 42 }))
      }
    }))
    
    const store = useCounterStore()
    await store.fetchCount()
    
    expect(store.count).toBe(42)
  })
})
```

---

## Mock 技术

### Mock 函数

```typescript
import { vi } from 'vitest'

// 创建 Mock 函数
const mockFn = vi.fn()

// 设置返回值
mockFn.mockReturnValue(42)

// 设置多次返回值
mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2)

// 设置异步返回值
mockFn.mockResolvedValue({ id: 1 })

// 检查调用
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledTimes(1)
```

### Mock 模块

```typescript
// Mock 整个模块
vi.mock('@/api', () => ({
  api: {
    getUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Alice' }))
  }
}))

// Mock 部分导出
vi.mock('@/utils', async () => {
  const actual = await vi.importActual('@/utils')
  return {
    ...actual,
    formatDate: vi.fn(() => '2024-01-01')
  }
})
```

### Mock 全局对象

```typescript
// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock as any

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' })
  })
) as any
```

---

## 快照测试

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('matches snapshot', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })
    
    expect(wrapper.html()).toMatchSnapshot()
  })
})
```

---

## 覆盖率

### 配置

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.d.ts',
        'vite.config.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

### 运行

```bash
# 生成覆盖率报告
vitest run --coverage

# 查看报告
open coverage/index.html
```

---

## E2E 测试

### Playwright

```bash
npm install -D @playwright/test
```

```typescript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  await expect(page).toHaveTitle(/My App/)
  
  await page.click('text=Login')
  
  await page.fill('input[name="username"]', 'testuser')
  await page.fill('input[name="password"]', 'password')
  
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

---

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:unit
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 最佳实践

1. **测试金字塔**：单元测试为主，集成测试为辅，E2E 测试为补充
2. **测试命名**：描述测试的目的和预期结果
3. **隔离测试**：每个测试独立，不依赖其他测试
4. **AAA 模式**：Arrange（准备）、Act（执行）、Assert（断言）
5. **测试覆盖率**：80% 以上为佳
6. **Mock 适度**：只 mock 外部依赖
7. **快照谨慎**：只在确实需要时使用
8. **持续测试**：在 CI/CD 中自动运行

---

## 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
