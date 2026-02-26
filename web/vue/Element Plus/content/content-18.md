# 消息提示组件

## 概述

消息提示组件用于向用户展示操作反馈、系统通知等信息，包括 `ElMessage`（消息提示）、`ElMessageBox`（消息弹框）、`ElNotification`（通知）三类组件。它们是用户交互反馈的重要组成部分。

## 核心 API

### ElMessage 消息提示

用于主动操作后的反馈提示，不打断用户操作。

```ts
ElMessage(options: MessageOptions): MessageHandler
ElMessage.success(message: string, options?: MessageOptions)
ElMessage.warning(message: string, options?: MessageOptions)
ElMessage.info(message: string, options?: MessageOptions)
ElMessage.error(message: string, options?: MessageOptions)
```

**核心配置：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `message` | 消息文字 | `string / VNode` | - |
| `type` | 消息类型 | `'success' / 'warning' / 'info' / 'error'` | `'info'` |
| `duration` | 显示时间（毫秒），设为 0 则不自动关闭 | `number` | `3000` |
| `showClose` | 是否显示关闭按钮 | `boolean` | `false` |
| `center` | 文字是否居中 | `boolean` | `false` |
| `offset` | 距离窗口顶部的偏移量 | `number` | `20` |
| `grouping` | 合并相同内容的消息 | `boolean` | `false` |
| `onClose` | 关闭时的回调函数 | `Function` | - |

### ElMessageBox 消息弹框

用于需要用户确认或输入的场景，会打断用户操作。

```ts
ElMessageBox.alert(message: string, title?: string, options?: MessageBoxOptions): Promise
ElMessageBox.confirm(message: string, title?: string, options?: MessageBoxOptions): Promise
ElMessageBox.prompt(message: string, title?: string, options?: MessageBoxOptions): Promise
```

**核心配置：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题 | `string` | - |
| `message` | 消息正文内容 | `string / VNode` | - |
| `type` | 消息类型 | `'success' / 'warning' / 'info' / 'error'` | - |
| `confirmButtonText` | 确定按钮的文本 | `string` | `'确定'` |
| `cancelButtonText` | 取消按钮的文本 | `string` | `'取消'` |
| `showCancelButton` | 是否显示取消按钮 | `boolean` | `false` |
| `closeOnClickModal` | 是否可通过点击遮罩关闭 | `boolean` | `true` |
| `beforeClose` | 关闭前的回调 | `Function` | - |

### ElNotification 通知

用于系统级通知，显示在页面角落。

```ts
ElNotification(options: NotificationOptions): NotificationHandler
ElNotification.success(options: NotificationOptions)
ElNotification.warning(options: NotificationOptions)
ElNotification.info(options: NotificationOptions)
ElNotification.error(options: NotificationOptions)
```

**核心配置：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题 | `string` | - |
| `message` | 消息正文 | `string / VNode` | - |
| `type` | 类型 | `'success' / 'warning' / 'info' / 'error'` | - |
| `duration` | 显示时间 | `number` | `4500` |
| `position` | 弹出位置 | `'top-right' / 'top-left' / 'bottom-right' / 'bottom-left'` | `'top-right'` |
| `showClose` | 是否显示关闭按钮 | `boolean` | `true` |
| `onClick` | 点击通知时的回调 | `Function` | - |

## 完整实战样例

### 示例 1：消息提示 - CRUD 操作反馈

在增删改查操作后给予用户反馈。

```vue
<template>
  <div class="message-demo">
    <el-card>
      <template #header>
        <span>用户管理 - 消息提示</span>
      </template>

      <el-space wrap>
        <el-button type="success" @click="handleAdd">
          新增用户（成功消息）
        </el-button>
        <el-button type="primary" @click="handleEdit">
          编辑用户（信息消息）
        </el-button>
        <el-button type="danger" @click="handleDelete">
          删除用户（错误消息）
        </el-button>
        <el-button type="warning" @click="handleWarning">
          警告消息
        </el-button>
      </el-space>

      <el-divider content-position="left">高级用法</el-divider>

      <el-space wrap>
        <el-button @click="showClosableMessage">
          可手动关闭的消息
        </el-button>
        <el-button @click="showHTMLMessage">
          HTML 内容消息
        </el-button>
        <el-button @click="showGroupingMessage">
          合并相同消息
        </el-button>
        <el-button @click="showOffsetMessage">
          自定义偏移量
        </el-button>
        <el-button type="danger" @click="showPersistentMessage">
          持久化消息（不自动关闭）
        </el-button>
        <el-button @click="closeAllMessages">
          关闭所有消息
        </el-button>
      </el-space>

      <el-divider content-position="left">实际场景</el-divider>

      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            提交表单
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const form = ref({
  username: '',
  email: ''
})

// 基础消息提示
const handleAdd = () => {
  ElMessage.success('用户添加成功')
}

const handleEdit = () => {
  ElMessage.info('用户信息已更新')
}

const handleDelete = () => {
  ElMessage.error('删除失败：权限不足')
}

const handleWarning = () => {
  ElMessage.warning('该操作需要管理员权限')
}

// 高级用法
const showClosableMessage = () => {
  ElMessage({
    message: '这是一条可手动关闭的消息',
    type: 'info',
    showClose: true,
    duration: 0 // 不自动关闭
  })
}

const showHTMLMessage = () => {
  ElMessage({
    message: h('div', null, [
      h('span', { style: 'color: #f56c6c; font-weight: bold' }, '操作失败：'),
      h('span', null, '网络连接超时，请稍后重试')
    ]),
    type: 'error',
    duration: 5000
  })
}

const showGroupingMessage = () => {
  // 连续点击时，相同内容的消息会被合并
  ElMessage({
    message: '这条消息会被合并',
    type: 'info',
    grouping: true
  })
}

const showOffsetMessage = () => {
  ElMessage({
    message: '距离顶部 100px',
    type: 'success',
    offset: 100
  })
}

let persistentMessageInstance: any = null

const showPersistentMessage = () => {
  persistentMessageInstance = ElMessage({
    message: '这是一条持久化消息，不会自动关闭',
    type: 'warning',
    duration: 0,
    showClose: true,
    onClose: () => {
      console.log('持久化消息已关闭')
    }
  })
}

const closeAllMessages = () => {
  ElMessage.closeAll()
  ElMessage.info('已关闭所有消息')
}

// 实际表单提交场景
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.value.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    ElMessage.error('邮箱格式不正确')
    return
  }

  loading.value = true

  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 成功
    ElMessage.success({
      message: '表单提交成功！',
      duration: 2000,
      onClose: () => {
        // 重置表单
        form.value = { username: '', email: '' }
      }
    })
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.message-demo {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 不同类型的消息提示（成功、信息、警告、错误）
- 可手动关闭的持久化消息
- 支持 HTML 内容渲染
- 表单提交场景的完整反馈

---

### 示例 2：消息弹框 - 确认与输入

需要用户确认或输入的场景。

```vue
<template>
  <div class="message-box-demo">
    <el-card>
      <template #header>
        <span>消息弹框示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%">
        <el-card shadow="never">
          <template #header>
            <span>基础用法</span>
          </template>
          <el-space wrap>
            <el-button @click="showAlert">
              Alert 提示
            </el-button>
            <el-button @click="showConfirm">
              Confirm 确认
            </el-button>
            <el-button @click="showPrompt">
              Prompt 输入
            </el-button>
          </el-space>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>实际场景</span>
          </template>
          <el-space wrap>
            <el-button type="danger" @click="handleDeleteUser">
              删除用户
            </el-button>
            <el-button type="warning" @click="handleLogout">
              退出登录
            </el-button>
            <el-button type="primary" @click="handleRename">
              重命名文件
            </el-button>
            <el-button @click="handleCustomButtons">
              自定义按钮
            </el-button>
          </el-space>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>高级用法</span>
          </template>
          <el-space wrap>
            <el-button @click="showAsyncConfirm">
              异步确认（加载中）
            </el-button>
            <el-button @click="showCustomContent">
              自定义内容
            </el-button>
            <el-button @click="showCenterBox">
              居中弹框
            </el-button>
          </el-space>
        </el-card>
      </el-space>

      <!-- 用户列表 -->
      <el-divider />
      <el-table :data="users" border style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="confirmDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ElMessage, ElMessageBox, ElInput } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
])

// 基础用法
const showAlert = () => {
  ElMessageBox.alert('这是一段内容', '标题', {
    confirmButtonText: '确定',
    callback: (action) => {
      ElMessage.info(`点击了：${action}`)
    }
  })
}

const showConfirm = () => {
  ElMessageBox.confirm('此操作将永久删除该文件，是否继续？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('确定删除')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const showPrompt = () => {
  ElMessageBox.prompt('请输入邮箱', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    inputErrorMessage: '邮箱格式不正确'
  })
    .then(({ value }) => {
      ElMessage.success(`输入的邮箱是：${value}`)
    })
    .catch(() => {
      ElMessage.info('已取消输入')
    })
}

// 实际场景
const handleDeleteUser = () => {
  ElMessageBox.confirm(
    '删除用户后，该用户的所有数据将被清除且无法恢复。',
    '确认删除？',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'error',
      distinguishCancelAndClose: true
    }
  )
    .then(() => {
      ElMessage.success('用户已删除')
    })
    .catch((action) => {
      if (action === 'cancel') {
        ElMessage.info('已取消删除')
      }
    })
}

const handleLogout = () => {
  ElMessageBox.confirm('退出登录后需要重新登录，确定退出吗？', '退出登录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('已退出登录')
      // 实际项目中执行登出逻辑
    })
    .catch(() => {})
}

const handleRename = () => {
  ElMessageBox.prompt('请输入新的文件名', '重命名', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: 'document.pdf',
    inputValidator: (value) => {
      if (!value) return '文件名不能为空'
      if (value.length > 50) return '文件名过长'
      return true
    }
  })
    .then(({ value }) => {
      ElMessage.success(`文件已重命名为：${value}`)
    })
    .catch(() => {})
}

const handleCustomButtons = () => {
  ElMessageBox.confirm('检测到新版本，是否立即更新？', '版本更新', {
    confirmButtonText: '立即更新',
    cancelButtonText: '暂不更新',
    type: 'info',
    customStyle: {
      width: '420px'
    }
  })
    .then(() => {
      ElMessage.success('开始更新...')
    })
    .catch(() => {
      ElMessage.info('已取消更新')
    })
}

// 高级用法
const showAsyncConfirm = () => {
  ElMessageBox.confirm('确定要执行此操作吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose: async (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '执行中...'
        
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        instance.confirmButtonLoading = false
        done()
        ElMessage.success('操作成功')
      } else {
        done()
      }
    }
  })
    .catch(() => {})
}

const showCustomContent = () => {
  const inputValue = ref('')
  
  ElMessageBox({
    title: '自定义内容',
    message: h('div', null, [
      h('p', null, '请输入用户名：'),
      h(ElInput, {
        modelValue: inputValue.value,
        'onUpdate:modelValue': (val: string) => {
          inputValue.value = val
        },
        placeholder: '请输入用户名'
      })
    ]),
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        if (!inputValue.value) {
          ElMessage.warning('请输入用户名')
          return
        }
        ElMessage.success(`用户名：${inputValue.value}`)
      }
      done()
    }
  })
}

const showCenterBox = () => {
  ElMessageBox.confirm('内容居中显示', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    center: true
  })
}

// 表格删除确认
const confirmDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.name}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      center: false
    }
  )
    .then(() => {
      const index = users.value.findIndex(u => u.id === row.id)
      if (index > -1) {
        users.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}
</script>

<style scoped>
.message-box-demo {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- Alert、Confirm、Prompt 三种弹框类型
- 删除、退出、重命名等实际场景
- 异步确认带加载状态
- 自定义内容和按钮文本
- 输入验证和错误提示

---

### 示例 3：通知 - 系统消息推送

用于系统级消息通知。

```vue
<template>
  <div class="notification-demo">
    <el-card>
      <template #header>
        <span>通知示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%">
        <el-card shadow="never">
          <template #header>
            <span>基础通知</span>
          </template>
          <el-space wrap>
            <el-button type="success" @click="showSuccess">
              成功通知
            </el-button>
            <el-button type="info" @click="showInfo">
              信息通知
            </el-button>
            <el-button type="warning" @click="showWarning">
              警告通知
            </el-button>
            <el-button type="danger" @click="showError">
              错误通知
            </el-button>
          </el-space>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>不同位置</span>
          </template>
          <el-space wrap>
            <el-button @click="showTopRight">
              右上角（默认）
            </el-button>
            <el-button @click="showTopLeft">
              左上角
            </el-button>
            <el-button @click="showBottomRight">
              右下角
            </el-button>
            <el-button @click="showBottomLeft">
              左下角
            </el-button>
          </el-space>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>实际场景</span>
          </template>
          <el-space wrap>
            <el-button @click="simulateSystemMessage">
              模拟系统消息
            </el-button>
            <el-button @click="simulateNewMessage">
              新消息提醒
            </el-button>
            <el-button @click="simulateTaskComplete">
              任务完成通知
            </el-button>
            <el-button @click="simulateUpdateNotice">
              版本更新通知
            </el-button>
          </el-space>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>高级用法</span>
          </template>
          <el-space wrap>
            <el-button @click="showHTMLNotification">
              HTML 内容
            </el-button>
            <el-button @click="showClickableNotification">
              可点击通知
            </el-button>
            <el-button @click="showAutoCloseNotification">
              自动关闭（2秒）
            </el-button>
            <el-button type="danger" @click="closeAllNotifications">
              关闭所有通知
            </el-button>
          </el-space>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { ElNotification, ElMessage } from 'element-plus'

// 基础通知
const showSuccess = () => {
  ElNotification.success({
    title: '成功',
    message: '操作已成功完成'
  })
}

const showInfo = () => {
  ElNotification.info({
    title: '提示',
    message: '这是一条普通的消息通知'
  })
}

const showWarning = () => {
  ElNotification.warning({
    title: '警告',
    message: '您的账户存在异常登录行为'
  })
}

const showError = () => {
  ElNotification.error({
    title: '错误',
    message: '网络请求失败，请检查网络连接'
  })
}

// 不同位置
const showTopRight = () => {
  ElNotification({
    title: '右上角通知',
    message: '这是一条显示在右上角的通知',
    position: 'top-right'
  })
}

const showTopLeft = () => {
  ElNotification({
    title: '左上角通知',
    message: '这是一条显示在左上角的通知',
    position: 'top-left'
  })
}

const showBottomRight = () => {
  ElNotification({
    title: '右下角通知',
    message: '这是一条显示在右下角的通知',
    position: 'bottom-right'
  })
}

const showBottomLeft = () => {
  ElNotification({
    title: '左下角通知',
    message: '这是一条显示在左下角的通知',
    position: 'bottom-left'
  })
}

// 实际场景
const simulateSystemMessage = () => {
  ElNotification({
    title: '系统通知',
    message: '系统将于今晚 22:00-24:00 进行维护，届时服务将暂时中断。',
    type: 'warning',
    duration: 6000,
    position: 'top-right'
  })
}

const simulateNewMessage = () => {
  ElNotification({
    title: '新消息',
    message: '您有 3 条新消息待查看',
    type: 'info',
    duration: 0,
    onClick: () => {
      ElMessage.success('跳转到消息中心')
    }
  })
}

const simulateTaskComplete = () => {
  ElNotification.success({
    title: '任务完成',
    message: '数据导出任务已完成，点击下载文件',
    duration: 0,
    onClick: () => {
      ElMessage.info('开始下载...')
    }
  })
}

const simulateUpdateNotice = () => {
  ElNotification({
    title: '版本更新',
    message: h('div', null, [
      h('p', { style: 'margin: 0 0 8px 0' }, '发现新版本 v2.0.0'),
      h('ul', { style: 'margin: 0; padding-left: 20px' }, [
        h('li', null, '新增：深色模式支持'),
        h('li', null, '优化：页面加载速度'),
        h('li', null, '修复：已知 Bug')
      ])
    ]),
    type: 'success',
    duration: 8000,
    position: 'bottom-right'
  })
}

// 高级用法
const showHTMLNotification = () => {
  ElNotification({
    title: 'HTML 内容',
    dangerouslyUseHTMLString: true,
    message: '<strong>这是 <i>HTML</i> 内容</strong>',
    type: 'info'
  })
}

const showClickableNotification = () => {
  ElNotification({
    title: '可点击通知',
    message: '点击这条通知查看详情',
    type: 'info',
    duration: 0,
    onClick: () => {
      ElMessage.success('您点击了通知')
    },
    onClose: () => {
      console.log('通知已关闭')
    }
  })
}

const showAutoCloseNotification = () => {
  ElNotification({
    title: '快速通知',
    message: '这条通知将在 2 秒后自动关闭',
    type: 'info',
    duration: 2000
  })
}

const closeAllNotifications = () => {
  ElNotification.closeAll()
  ElMessage.info('已关闭所有通知')
}
</script>

<style scoped>
.notification-demo {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 四种类型的通知（成功、信息、警告、错误）
- 四个位置的通知显示
- 系统消息、新消息、任务完成等实际场景
- 支持 HTML 内容和点击事件
- 可配置自动关闭时间

---

## 常见踩坑

### 1. Message 重复显示

**问题：** 连续调用导致多条相同消息堆叠。

**解决：** 使用 `grouping` 选项合并相同消息。

```ts
ElMessage({
  message: '保存成功',
  type: 'success',
  grouping: true
})
```

---

### 2. MessageBox Promise 未捕获

**问题：** 用户点击取消时，未捕获 Promise reject 导致控制台警告。

**解决：** 始终添加 `.catch()` 处理。

```ts
ElMessageBox.confirm('确认删除？', '提示')
  .then(() => {
    // 确认逻辑
  })
  .catch(() => {
    // 取消逻辑，即使为空也要添加
  })
```

---

### 3. Notification 层级问题

**问题：** 通知被其他元素遮挡。

**解决：** 检查 `z-index` 设置，Element Plus 默认为 2000+。

```css
:deep(.el-notification) {
  z-index: 3000 !important;
}
```

---

### 4. Message 在路由切换时未关闭

**问题：** 路由跳转后消息仍显示。

**解决：** 在路由守卫中关闭所有消息。

```ts
router.beforeEach(() => {
  ElMessage.closeAll()
})
```

---

## 最佳实践

### 1. 统一消息提示封装

```ts
// utils/message.ts
export const useMessage = () => {
  const success = (message: string) => {
    ElMessage.success({ message, grouping: true })
  }
  
  const error = (message: string) => {
    ElMessage.error({ message, showClose: true, duration: 5000 })
  }
  
  return { success, error }
}
```

### 2. API 错误统一处理

```ts
axios.interceptors.response.use(
  response => response,
  error => {
    ElMessage.error({
      message: error.response?.data?.message || '请求失败',
      showClose: true
    })
    return Promise.reject(error)
  }
)
```

### 3. 确认操作通用方法

```ts
export const confirmAction = (
  message: string,
  title = '确认操作'
): Promise<void> => {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
}
```

---

## 参考资料

- [Element Plus Message 文档](https://element-plus.org/zh-CN/component/message.html)
- [Element Plus MessageBox 文档](https://element-plus.org/zh-CN/component/message-box.html)
- [Element Plus Notification 文档](https://element-plus.org/zh-CN/component/notification.html)
