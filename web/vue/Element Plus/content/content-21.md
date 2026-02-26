# 其他反馈组件

## 概述

本章介绍其他常用的反馈组件，包括 `el-alert`（警告提示）、`el-result`（结果页）、`el-popconfirm`（气泡确认框）、`el-badge`（徽章）等，它们在不同场景下为用户提供信息反馈。

## 核心属性与事件

### Alert 警告提示

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `type` | 类型 | `'success' / 'warning' / 'info' / 'error'` | `'info'` |
| `title` | 标题 | `string` | - |
| `description` | 描述性文本 | `string` | - |
| `closable` | 是否可关闭 | `boolean` | `true` |
| `center` | 文字是否居中 | `boolean` | `false` |
| `show-icon` | 是否显示图标 | `boolean` | `false` |
| `effect` | 主题 | `'light' / 'dark'` | `'light'` |

### Result 结果页

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题 | `string` | - |
| `sub-title` | 副标题 | `string` | - |
| `icon` | 图标类型 | `'success' / 'warning' / 'info' / 'error'` | `'info'` |

### Popconfirm 气泡确认框

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题 | `string` | - |
| `confirm-button-text` | 确认按钮文字 | `string` | - |
| `cancel-button-text` | 取消按钮文字 | `string` | - |
| `confirm-button-type` | 确认按钮类型 | `string` | `'primary'` |
| `icon` | 自定义图标 | `Component` | - |
| `icon-color` | 图标颜色 | `string` | `'#f90'` |
| `width` | 宽度 | `string / number` | `150` |

### Badge 徽章

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `value` | 显示值 | `string / number` | - |
| `max` | 最大值，超过显示为 `{max}+` | `number` | `99` |
| `is-dot` | 显示为小红点 | `boolean` | `false` |
| `hidden` | 隐藏徽章 | `boolean` | `false` |
| `type` | 类型 | `'primary' / 'success' / 'warning' / 'danger' / 'info'` | `'danger'` |

## 完整实战样例

### 示例 1：Alert 警告提示 - 系统公告

各种场景下的警告提示。

```vue
<template>
  <div class="alert-demo">
    <el-card>
      <template #header>
        <span>Alert 警告提示示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="16">
        <!-- 基础用法 -->
        <div>
          <h4>基础用法</h4>
          <el-space direction="vertical" style="width: 100%">
            <el-alert title="成功提示的文案" type="success" />
            <el-alert title="消息提示的文案" type="info" />
            <el-alert title="警告提示的文案" type="warning" />
            <el-alert title="错误提示的文案" type="error" />
          </el-space>
        </div>

        <!-- 带描述 -->
        <div>
          <h4>带描述信息</h4>
          <el-space direction="vertical" style="width: 100%">
            <el-alert
              title="带辅助性文字介绍"
              type="success"
              description="这是一句绕口令：黑灰化肥会挥发发灰黑化肥挥发；灰黑化肥会挥发发黑灰化肥发挥。"
            />
          </el-space>
        </div>

        <!-- 带图标 -->
        <div>
          <h4>带图标和关闭按钮</h4>
          <el-space direction="vertical" style="width: 100%">
            <el-alert
              title="成功提示的文案"
              type="success"
              show-icon
              closable
            />
            <el-alert
              title="消息提示的文案"
              type="info"
              description="文字说明文字说明文字说明文字说明文字说明"
              show-icon
              closable
            />
          </el-space>
        </div>

        <!-- 居中 -->
        <div>
          <h4>文字居中</h4>
          <el-alert
            title="成功提示的文案"
            type="success"
            center
            show-icon
          />
        </div>

        <!-- 深色主题 -->
        <div>
          <h4>深色主题</h4>
          <el-space direction="vertical" style="width: 100%">
            <el-alert title="成功提示" type="success" effect="dark" />
            <el-alert title="信息提示" type="info" effect="dark" />
            <el-alert title="警告提示" type="warning" effect="dark" />
            <el-alert title="错误提示" type="error" effect="dark" />
          </el-space>
        </div>

        <!-- 实际场景 -->
        <div>
          <h4>实际应用场景</h4>
          <el-space direction="vertical" style="width: 100%">
            <el-alert
              v-if="showSystemNotice"
              title="系统维护通知"
              type="warning"
              description="系统将于今晚 22:00-24:00 进行升级维护，届时服务将暂时中断，请提前做好准备。"
              show-icon
              closable
              @close="showSystemNotice = false"
            />

            <el-alert
              v-if="showVersionUpdate"
              type="info"
              show-icon
              closable
              @close="showVersionUpdate = false"
            >
              <template #title>
                <span style="font-weight: bold">发现新版本 v2.0.0</span>
              </template>
              <template #default>
                <div style="margin-top: 8px">
                  <p style="margin: 4px 0">• 新增深色模式支持</p>
                  <p style="margin: 4px 0">• 优化页面加载性能</p>
                  <p style="margin: 4px 0">• 修复若干已知问题</p>
                  <el-button
                    type="primary"
                    size="small"
                    style="margin-top: 12px"
                    @click="handleUpdate"
                  >
                    立即更新
                  </el-button>
                </div>
              </template>
            </el-alert>

            <el-alert
              v-if="showErrorAlert"
              title="操作失败"
              type="error"
              description="网络请求超时，请检查网络连接后重试。如问题持续存在，请联系技术支持。"
              show-icon
              closable
              @close="showErrorAlert = false"
            />
          </el-space>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const showSystemNotice = ref(true)
const showVersionUpdate = ref(true)
const showErrorAlert = ref(true)

const handleUpdate = () => {
  ElMessage.info('开始更新...')
  showVersionUpdate.value = false
}
</script>

<style scoped>
.alert-demo {
  max-width: 1000px;
  margin: 0 auto;
}

h4 {
  margin: 0 0 12px 0;
  color: #606266;
}
</style>
```

**运行效果：**
- 四种类型的警告提示
- 带描述信息和图标
- 文字居中和深色主题
- 系统通知、版本更新等实际场景
- 可关闭的提示，关闭后触发回调

---

### 示例 2：Result 结果页 - 操作反馈

操作成功、失败、404等场景的结果页。

```vue
<template>
  <div class="result-demo">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>Result 结果页示例</span>
          <el-radio-group v-model="currentResult" size="small">
            <el-radio-button label="success">成功</el-radio-button>
            <el-radio-button label="error">失败</el-radio-button>
            <el-radio-button label="warning">警告</el-radio-button>
            <el-radio-button label="info">信息</el-radio-button>
            <el-radio-button label="404">404</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 成功页 -->
      <el-result
        v-if="currentResult === 'success'"
        icon="success"
        title="提交成功"
        sub-title="您的订单已提交成功，我们将尽快处理"
      >
        <template #extra>
          <el-space>
            <el-button type="primary" @click="handleViewOrder">
              查看订单
            </el-button>
            <el-button @click="handleContinue">
              继续购物
            </el-button>
          </el-space>
        </template>
      </el-result>

      <!-- 失败页 -->
      <el-result
        v-if="currentResult === 'error'"
        icon="error"
        title="提交失败"
        sub-title="请检查网络连接或稍后重试"
      >
        <template #extra>
          <el-space>
            <el-button type="primary" @click="handleRetry">
              重新提交
            </el-button>
            <el-button @click="handleContactSupport">
              联系客服
            </el-button>
          </el-space>
        </template>
      </el-result>

      <!-- 警告页 -->
      <el-result
        v-if="currentResult === 'warning'"
        icon="warning"
        title="账户异常"
        sub-title="检测到您的账户存在异常登录行为，请修改密码"
      >
        <template #extra>
          <el-button type="primary" @click="handleChangePassword">
            立即修改密码
          </el-button>
        </template>
      </el-result>

      <!-- 信息页 -->
      <el-result
        v-if="currentResult === 'info'"
        icon="info"
        title="等待审核"
        sub-title="您的申请已提交，预计 1-3 个工作日内完成审核"
      >
        <template #extra>
          <el-button type="primary" @click="handleViewProgress">
            查看进度
          </el-button>
        </template>
      </el-result>

      <!-- 404 页面 -->
      <el-result
        v-if="currentResult === '404'"
        icon="warning"
        title="404"
        sub-title="抱歉，您访问的页面不存在"
      >
        <template #icon>
          <div style="font-size: 120px; color: #909399">404</div>
        </template>
        <template #extra>
          <el-space>
            <el-button type="primary" @click="handleGoHome">
              返回首页
            </el-button>
            <el-button @click="handleGoBack">
              返回上一页
            </el-button>
          </el-space>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const currentResult = ref<'success' | 'error' | 'warning' | 'info' | '404'>('success')

const handleViewOrder = () => {
  ElMessage.info('跳转到订单页面')
}

const handleContinue = () => {
  ElMessage.info('继续购物')
}

const handleRetry = () => {
  ElMessage.info('重新提交')
}

const handleContactSupport = () => {
  ElMessage.info('联系客服')
}

const handleChangePassword = () => {
  ElMessage.info('跳转到修改密码页面')
}

const handleViewProgress = () => {
  ElMessage.info('查看审核进度')
}

const handleGoHome = () => {
  ElMessage.info('返回首页')
}

const handleGoBack = () => {
  ElMessage.info('返回上一页')
}
</script>

<style scoped>
.result-demo {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 提交成功、失败、警告、信息等结果页
- 404 页面自定义图标
- 每个结果页配置相应的操作按钮
- 切换不同类型查看效果

---

### 示例 3：Popconfirm 与 Badge - 操作确认与消息提示

气泡确认框和徽章的组合使用。

```vue
<template>
  <div class="popconfirm-badge-demo">
    <el-card>
      <template #header>
        <span>Popconfirm 气泡确认框 & Badge 徽章</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- Popconfirm 基础用法 -->
        <el-card shadow="never">
          <template #header>
            <span>气泡确认框</span>
          </template>

          <el-space wrap :size="20">
            <el-popconfirm
              title="确定删除吗？"
              @confirm="handleConfirm"
              @cancel="handleCancel"
            >
              <template #reference>
                <el-button type="danger">删除</el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm
              title="确定要提交吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              confirm-button-type="primary"
              @confirm="handleSubmit"
            >
              <template #reference>
                <el-button type="primary">提交</el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm
              title="此操作将永久删除该文件，是否继续？"
              width="280"
              @confirm="handleDelete"
            >
              <template #reference>
                <el-button type="danger" link>
                  删除文件
                </el-button>
              </template>
            </el-popconfirm>
          </el-space>

          <el-divider />

          <el-table :data="userData" border>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-popconfirm
                  :title="`确定删除用户 ${row.name} 吗？`"
                  @confirm="handleDeleteUser(row)"
                >
                  <template #reference>
                    <el-button type="danger" link size="small">
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- Badge 徽章 -->
        <el-card shadow="never">
          <template #header>
            <span>徽章示例</span>
          </template>

          <el-space wrap :size="40">
            <div>
              <div style="margin-bottom: 8px">基础用法</div>
              <el-space :size="20">
                <el-badge :value="12">
                  <el-button>评论</el-button>
                </el-badge>
                <el-badge :value="3">
                  <el-button>回复</el-button>
                </el-badge>
                <el-badge :value="200" :max="99">
                  <el-button>消息</el-button>
                </el-badge>
              </el-space>
            </div>

            <div>
              <div style="margin-bottom: 8px">小红点</div>
              <el-space :size="20">
                <el-badge is-dot>
                  <el-button>未读消息</el-button>
                </el-badge>
                <el-badge is-dot>
                  <el-icon :size="20"><Bell /></el-icon>
                </el-badge>
              </el-space>
            </div>

            <div>
              <div style="margin-bottom: 8px">不同类型</div>
              <el-space :size="20">
                <el-badge :value="5" type="primary">
                  <el-button>主要</el-button>
                </el-badge>
                <el-badge :value="10" type="success">
                  <el-button>成功</el-button>
                </el-badge>
                <el-badge :value="2" type="warning">
                  <el-button>警告</el-button>
                </el-badge>
                <el-badge :value="8" type="danger">
                  <el-button>危险</el-button>
                </el-badge>
              </el-space>
            </div>
          </el-space>

          <el-divider />

          <div>
            <h4>实际应用场景</h4>
            <el-space :size="30">
              <el-badge :value="messageCount" :max="99">
                <el-button @click="handleViewMessages">
                  <el-icon><Message /></el-icon>
                  消息
                </el-button>
              </el-badge>

              <el-badge :value="notificationCount" :hidden="notificationCount === 0">
                <el-button @click="handleViewNotifications">
                  <el-icon><Bell /></el-icon>
                  通知
                </el-button>
              </el-badge>

              <el-badge is-dot :hidden="!hasNewTask">
                <el-button @click="handleViewTasks">
                  <el-icon><List /></el-icon>
                  任务
                </el-button>
              </el-badge>

              <el-badge :value="cartCount" type="danger">
                <el-button @click="handleViewCart">
                  <el-icon><ShoppingCart /></el-icon>
                  购物车
                </el-button>
              </el-badge>
            </el-space>

            <div style="margin-top: 20px">
              <el-button size="small" @click="simulateNewMessage">
                模拟新消息
              </el-button>
              <el-button size="small" @click="simulateNewNotification">
                模拟新通知
              </el-button>
              <el-button size="small" @click="simulateAddToCart">
                添加到购物车
              </el-button>
              <el-button size="small" type="danger" @click="clearAll">
                清空所有
              </el-button>
            </div>
          </div>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, Message, List, ShoppingCart } from '@element-plus/icons-vue'

const userData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
])

// Popconfirm
const handleConfirm = () => {
  ElMessage.success('确认删除')
}

const handleCancel = () => {
  ElMessage.info('取消删除')
}

const handleSubmit = () => {
  ElMessage.success('提交成功')
}

const handleDelete = () => {
  ElMessage.success('文件已删除')
}

const handleDeleteUser = (row: any) => {
  const index = userData.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    userData.value.splice(index, 1)
    ElMessage.success(`用户 ${row.name} 已删除`)
  }
}

// Badge
const messageCount = ref(15)
const notificationCount = ref(3)
const hasNewTask = ref(true)
const cartCount = ref(2)

const handleViewMessages = () => {
  ElMessage.info(`查看 ${messageCount.value} 条消息`)
  messageCount.value = 0
}

const handleViewNotifications = () => {
  ElMessage.info(`查看 ${notificationCount.value} 条通知`)
  notificationCount.value = 0
}

const handleViewTasks = () => {
  ElMessage.info('查看任务')
  hasNewTask.value = false
}

const handleViewCart = () => {
  ElMessage.info(`购物车中有 ${cartCount.value} 件商品`)
}

const simulateNewMessage = () => {
  messageCount.value += Math.floor(Math.random() * 5) + 1
  ElMessage.success('收到新消息')
}

const simulateNewNotification = () => {
  notificationCount.value++
  ElMessage.success('收到新通知')
}

const simulateAddToCart = () => {
  cartCount.value++
  ElMessage.success('商品已添加到购物车')
}

const clearAll = () => {
  messageCount.value = 0
  notificationCount.value = 0
  hasNewTask.value = false
  cartCount.value = 0
  ElMessage.info('已清空所有')
}
</script>

<style scoped>
.popconfirm-badge-demo {
  max-width: 1000px;
  margin: 0 auto;
}

h4 {
  margin: 0 0 16px 0;
  color: #606266;
}
</style>
```

**运行效果：**
- 气泡确认框用于删除、提交等操作
- 表格行内删除带确认
- 徽章显示消息、通知、购物车数量
- 小红点提示新任务
- 模拟数据变化，徽章实时更新

---

## 常见踩坑

### 1. Alert 关闭后仍占空间

**问题：** 关闭 Alert 后，仍然占据页面空间。

**解决：** 使用 `v-if` 控制显示。

```vue
<el-alert
  v-if="visible"
  title="提示"
  closable
  @close="visible = false"
/>
```

---

### 2. Popconfirm 触发区域过小

**问题：** 只有点击按钮才能触发确认框。

**解决：** 使用 `#reference` 插槽包裹触发元素。

```vue
<el-popconfirm title="确定删除吗？">
  <template #reference>
    <el-button>删除</el-button>
  </template>
</el-popconfirm>
```

---

### 3. Badge 数值不更新

**问题：** 修改 `value` 后徽章不更新。

**解决：** 确保使用响应式数据。

```ts
// ✅ 正确
const count = ref(10)
count.value++

// ❌ 错误
let count = 10
count++
```

---

### 4. Result 页面高度不够

**问题：** Result 组件高度不足，页面布局异常。

**解决：** 设置容器最小高度。

```vue
<div style="min-height: 400px">
  <el-result ... />
</div>
```

---

## 最佳实践

### 1. Alert 全局提示管理

```ts
// useAlert.ts
export const useSystemAlert = () => {
  const alerts = ref<Array<{ id: number; type: string; message: string }>>([])
  
  const addAlert = (type: string, message: string) => {
    alerts.value.push({ id: Date.now(), type, message })
  }
  
  const removeAlert = (id: number) => {
    const index = alerts.value.findIndex(a => a.id === id)
    if (index > -1) alerts.value.splice(index, 1)
  }
  
  return { alerts, addAlert, removeAlert }
}
```

### 2. 统一确认操作

```ts
// useConfirm.ts
export const useConfirm = () => {
  const confirmDelete = (name: string, onConfirm: () => void) => {
    // 使用 Popconfirm 或 MessageBox
  }
  
  return { confirmDelete }
}
```

### 3. Badge 数量格式化

```ts
const formatBadgeValue = (value: number, max = 99): string | number => {
  if (value > max) return `${max}+`
  return value
}
```

---

## 参考资料

- [Element Plus Alert 文档](https://element-plus.org/zh-CN/component/alert.html)
- [Element Plus Result 文档](https://element-plus.org/zh-CN/component/result.html)
- [Element Plus Popconfirm 文档](https://element-plus.org/zh-CN/component/popconfirm.html)
- [Element Plus Badge 文档](https://element-plus.org/zh-CN/component/badge.html)
