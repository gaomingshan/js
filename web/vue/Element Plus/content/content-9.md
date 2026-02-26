# 日期时间组件

## 概述

DatePicker、TimePicker 和 DateTimePicker 是处理日期时间选择的核心组件。掌握这些组件对于实现预约、查询、统计等功能至关重要。

---

## DatePicker 日期选择器

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | Date/string/number | - |
| type | 显示类型 | string (year/month/date/dates/week/datetime/datetimerange/daterange/monthrange) | date |
| format | 显示在输入框中的格式 | string | YYYY-MM-DD |
| value-format | 绑定值的格式 | string | - |
| placeholder | 非范围选择时的占位内容 | string | - |
| start-placeholder | 范围选择时开始日期的占位内容 | string | - |
| end-placeholder | 范围选择时结束日期的占位内容 | string | - |
| disabled-date | 设置禁用状态 | Function | - |
| shortcuts | 设置快捷选项 | Array | - |
| clearable | 是否显示清除按钮 | boolean | true |
| editable | 文本框可输入 | boolean | true |

---

## TimePicker 时间选择器

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | Date/string | - |
| format | 显示在输入框中的格式 | string | HH:mm:ss |
| value-format | 绑定值的格式 | string | - |
| is-range | 是否为时间范围选择 | boolean | false |
| disabled-hours | 禁止选择部分小时选项 | Function | - |
| disabled-minutes | 禁止选择部分分钟选项 | Function | - |
| disabled-seconds | 禁止选择部分秒选项 | Function | - |

---

## 完整样例一：时间段查询

### 效果描述
实现常见的时间段查询功能，包括快捷选项、禁用日期等。

### 完整代码

```vue
<template>
  <div class="date-query-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">数据查询</h3>
      </template>
      
      <el-form :model="queryForm" label-width="100px">
        <!-- 单日期选择 -->
        <el-form-item label="查询日期">
          <el-date-picker
            v-model="queryForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        
        <!-- 日期范围（带快捷选项） -->
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            clearable
          />
        </el-form-item>
        
        <!-- 月份范围 -->
        <el-form-item label="月份范围">
          <el-date-picker
            v-model="queryForm.monthRange"
            type="monthrange"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            clearable
          />
        </el-form-item>
        
        <!-- 禁用日期 -->
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="queryForm.bookingDate"
            type="date"
            placeholder="选择预约日期"
            :disabled-date="disabledDate"
            clearable
          />
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            只能选择未来30天内的日期
          </el-text>
        </el-form-item>
        
        <!-- 时间选择 -->
        <el-form-item label="预约时间">
          <el-time-picker
            v-model="queryForm.time"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            clearable
          />
        </el-form-item>
        
        <!-- 时间范围 -->
        <el-form-item label="营业时间">
          <el-time-picker
            v-model="queryForm.businessHours"
            is-range
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm"
            clearable
          />
        </el-form-item>
        
        <!-- 日期时间 -->
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="queryForm.createTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
          />
        </el-form-item>
        
        <!-- 日期时间范围 -->
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="queryForm.activityTime"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :shortcuts="datetimeShortcuts"
            clearable
          />
        </el-form-item>
        
        <!-- 查询按钮 -->
        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-space>
        </el-form-item>
        
        <!-- 查询结果展示 -->
        <el-divider />
        <el-form-item label="查询条件">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="查询日期">
              {{ queryForm.date || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="时间范围">
              {{ queryForm.dateRange?.join(' ~ ') || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="预约日期">
              {{ queryForm.bookingDate || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="预约时间">
              {{ queryForm.time || '未选择' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const queryForm = reactive({
  date: '',
  dateRange: [] as string[],
  monthRange: [] as string[],
  bookingDate: '',
  time: '',
  businessHours: [] as string[],
  createTime: '',
  activityTime: [] as string[],
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// 日期时间快捷选项
const datetimeShortcuts = [
  {
    text: '今天',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return [start, end]
    },
  },
  {
    text: '昨天',
    value: () => {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setTime(end.getTime() - 3600 * 1000 * 24)
      end.setHours(23, 59, 59, 999)
      return [start, end]
    },
  },
  {
    text: '本周',
    value: () => {
      const start = new Date()
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return [start, end]
    },
  },
]

// 禁用日期：只能选择未来30天
const disabledDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  maxDate.setHours(23, 59, 59, 999)
  
  return time.getTime() < today.getTime() || time.getTime() > maxDate.getTime()
}

const handleQuery = () => {
  ElMessage.success('查询中...')
  console.log('查询条件:', queryForm)
}

const handleReset = () => {
  queryForm.date = ''
  queryForm.dateRange = []
  queryForm.monthRange = []
  queryForm.bookingDate = ''
  queryForm.time = ''
  queryForm.businessHours = []
  queryForm.createTime = ''
  queryForm.activityTime = []
  ElMessage.info('已重置')
}
</script>

<style scoped>
.date-query-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-date-editor,
.el-time-picker {
  width: 100%;
}
</style>
```

---

## 完整样例二：预约时间选择

### 效果描述
实现预约系统的时间选择，包括禁用特定时间段、工作时间限制等。

### 完整代码

```vue
<template>
  <div class="booking-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">在线预约</h3>
      </template>
      
      <el-form :model="bookingForm" label-width="100px">
        <!-- 预约日期 -->
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="bookingForm.date"
            type="date"
            placeholder="选择预约日期"
            :disabled-date="disabledBookingDate"
            @change="handleDateChange"
            clearable
          />
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            周一至周五 9:00-18:00 可预约
          </el-text>
        </el-form-item>
        
        <!-- 预约时间段 -->
        <el-form-item label="预约时间">
          <el-time-picker
            v-model="bookingForm.time"
            placeholder="选择预约时间"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
            format="HH:mm"
            value-format="HH:mm"
            :disabled="!bookingForm.date"
            clearable
          />
        </el-form-item>
        
        <!-- 可选时间段展示 -->
        <el-form-item label="可选时段" v-if="bookingForm.date">
          <div class="time-slots">
            <el-tag
              v-for="slot in availableSlots"
              :key="slot"
              :type="bookingForm.time === slot ? 'success' : 'info'"
              style="margin: 5px; cursor: pointer;"
              @click="bookingForm.time = slot"
            >
              {{ slot }}
            </el-tag>
          </div>
        </el-form-item>
        
        <!-- 预约时长 -->
        <el-form-item label="预约时长">
          <el-select v-model="bookingForm.duration" placeholder="请选择时长">
            <el-option label="30分钟" :value="30" />
            <el-option label="1小时" :value="60" />
            <el-option label="2小时" :value="120" />
          </el-select>
        </el-form-item>
        
        <!-- 预约信息确认 -->
        <el-divider />
        <el-form-item label="预约详情" v-if="bookingForm.date && bookingForm.time">
          <el-card>
            <el-descriptions :column="1">
              <el-descriptions-item label="预约日期">
                {{ formatDate(bookingForm.date) }}
              </el-descriptions-item>
              <el-descriptions-item label="预约时间">
                {{ bookingForm.time }}
              </el-descriptions-item>
              <el-descriptions-item label="结束时间">
                {{ calculateEndTime(bookingForm.time, bookingForm.duration) }}
              </el-descriptions-item>
              <el-descriptions-item label="预约时长">
                {{ bookingForm.duration }} 分钟
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-form-item>
        
        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="handleBooking"
            :disabled="!bookingForm.date || !bookingForm.time"
          >
            确认预约
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const bookingForm = reactive({
  date: '',
  time: '',
  duration: 60,
})

// 禁用日期：周末和过去的日期
const disabledBookingDate = (time: Date) => {
  const day = time.getDay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 禁用周末和过去的日期
  return day === 0 || day === 6 || time.getTime() < today.getTime()
}

// 禁用小时：9点之前和18点之后
const disabledHours = () => {
  const hours: number[] = []
  for (let i = 0; i < 9; i++) {
    hours.push(i)
  }
  for (let i = 18; i < 24; i++) {
    hours.push(i)
  }
  return hours
}

// 禁用分钟：只允许整点和半点
const disabledMinutes = (hour: number) => {
  const minutes: number[] = []
  for (let i = 0; i < 60; i++) {
    if (i !== 0 && i !== 30) {
      minutes.push(i)
    }
  }
  return minutes
}

// 可选时间段
const availableSlots = computed(() => {
  if (!bookingForm.date) return []
  
  const slots: string[] = []
  for (let hour = 9; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 17) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
})

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${dateStr} ${weekDays[date.getDay()]}`
}

// 计算结束时间
const calculateEndTime = (startTime: string, duration: number) => {
  const [hour, minute] = startTime.split(':').map(Number)
  const totalMinutes = hour * 60 + minute + duration
  const endHour = Math.floor(totalMinutes / 60)
  const endMinute = totalMinutes % 60
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
}

const handleDateChange = () => {
  // 日期变化时清空时间选择
  bookingForm.time = ''
}

const handleBooking = () => {
  ElMessage.success('预约成功！')
  console.log('预约信息:', bookingForm)
}
</script>

<style scoped>
.booking-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-date-editor,
.el-time-picker,
.el-select {
  width: 100%;
}

.time-slots {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
```

---

## 完整样例三：时区处理与格式化

### 效果描述
展示时间格式化、时区转换等高级用法。

### 完整代码

```vue
<template>
  <div class="datetime-format-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">时间格式化与时区</h3>
      </template>
      
      <el-form :model="formatForm" label-width="120px">
        <!-- 标准格式 -->
        <el-form-item label="标准日期">
          <el-date-picker
            v-model="formatForm.standardDate"
            type="date"
            placeholder="选择日期"
            format="YYYY年MM月DD日"
            value-format="YYYY-MM-DD"
          />
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            显示格式：YYYY年MM月DD日，存储格式：YYYY-MM-DD
          </el-text>
        </el-form-item>
        
        <!-- 时间戳格式 -->
        <el-form-item label="时间戳">
          <el-date-picker
            v-model="formatForm.timestamp"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="x"
          />
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            存储为时间戳：{{ formatForm.timestamp }}
          </el-text>
        </el-form-item>
        
        <!-- ISO 格式 -->
        <el-form-item label="ISO 格式">
          <el-date-picker
            v-model="formatForm.isoDate"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            ISO 8601 格式
          </el-text>
        </el-form-item>
        
        <!-- 自定义格式 -->
        <el-form-item label="自定义格式">
          <el-date-picker
            v-model="formatForm.customDate"
            type="date"
            placeholder="选择日期"
            :format="customFormat"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <!-- 周选择 -->
        <el-form-item label="选择周">
          <el-date-picker
            v-model="formatForm.week"
            type="week"
            format="YYYY 第 ww 周"
            placeholder="选择周"
          />
        </el-form-item>
        
        <!-- 月份选择 -->
        <el-form-item label="选择月份">
          <el-date-picker
            v-model="formatForm.month"
            type="month"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            placeholder="选择月份"
          />
        </el-form-item>
        
        <!-- 年份选择 -->
        <el-form-item label="选择年份">
          <el-date-picker
            v-model="formatForm.year"
            type="year"
            format="YYYY年"
            value-format="YYYY"
            placeholder="选择年份"
          />
        </el-form-item>
        
        <!-- 多个日期选择 -->
        <el-form-item label="多个日期">
          <el-date-picker
            v-model="formatForm.multipleDates"
            type="dates"
            placeholder="选择多个日期"
            format="MM/DD"
          />
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            已选择 {{ formatForm.multipleDates.length }} 个日期
          </el-text>
        </el-form-item>
        
        <!-- 格式化展示 -->
        <el-divider />
        <el-form-item label="格式化结果">
          <el-card>
            <pre>{{ JSON.stringify(formatForm, null, 2) }}</pre>
          </el-card>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const formatForm = reactive({
  standardDate: '',
  timestamp: '',
  isoDate: '',
  customDate: '',
  week: '',
  month: '',
  year: '',
  multipleDates: [] as Date[],
})

// 自定义格式化函数
const customFormat = computed(() => {
  return (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = weekDays[date.getDay()]
    
    return `${year}年${month}月${day}日 星期${weekDay}`
  }
})
</script>

<style scoped>
.datetime-format-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-date-editor {
  width: 100%;
}

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
```

---

## 常见踩坑

### 1. 时区问题

**问题**：选择的日期与实际存储的日期不一致

**原因**：浏览器会自动进行时区转换

**解决方案**：
```vue
<!-- 使用 value-format 避免时区问题 -->
<el-date-picker
  v-model="date"
  value-format="YYYY-MM-DD"  <!-- 返回字符串而非Date对象 -->
/>
```

### 2. 默认值不显示

**问题**：设置了默认值但不显示

**原因**：格式不匹配

**解决方案**：
```ts
// ❌ 错误
const date = ref('2024-01-01')  // value-format 是时间戳

// ✅ 正确
const date = ref('2024-01-01')  // value-format="YYYY-MM-DD"
```

### 3. 范围选择清空问题

**问题**：清空后绑定值变成 null 而不是空数组

**解决方案**：
```ts
watch(() => dateRange.value, (val) => {
  if (!val) {
    dateRange.value = []
  }
})
```

### 4. 禁用日期函数性能问题

**问题**：禁用日期函数被频繁调用导致卡顿

**解决方案**：
```ts
// ✅ 提前计算禁用日期范围
const minDate = new Date('2024-01-01').getTime()
const maxDate = new Date('2024-12-31').getTime()

const disabledDate = (time: Date) => {
  const timestamp = time.getTime()
  return timestamp < minDate || timestamp > maxDate
}
```

---

## 最佳实践

### 1. 统一时间格式

```ts
// 统一使用字符串格式存储
const DATE_FORMAT = 'YYYY-MM-DD'
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const TIME_FORMAT = 'HH:mm:ss'

<el-date-picker
  v-model="date"
  :format="DATE_FORMAT"
  :value-format="DATE_FORMAT"
/>
```

### 2. 快捷选项封装

```ts
// utils/dateShortcuts.ts
export const getDateShortcuts = () => [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  // 更多快捷选项...
]
```

### 3. 日期范围校验

```ts
const validateDateRange = (start: string, end: string) => {
  if (!start || !end) return true
  
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  
  if (endTime < startTime) {
    ElMessage.error('结束日期不能早于开始日期')
    return false
  }
  
  // 限制最大范围（如90天）
  const maxRange = 90 * 24 * 3600 * 1000
  if (endTime - startTime > maxRange) {
    ElMessage.error('日期范围不能超过90天')
    return false
  }
  
  return true
}
```

### 4. 时间段限制

```ts
// 工作时间：9:00-18:00
const disabledHours = () => {
  return [...Array(9).keys(), ...Array(6).keys().map(i => i + 18)]
}

// 每15分钟一个时间段
const disabledMinutes = () => {
  return Array.from({ length: 60 }, (_, i) => i).filter(i => i % 15 !== 0)
}
```

---

## 参考资料

- [Element Plus DatePicker 日期选择器](https://element-plus.org/zh-CN/component/date-picker.html)
- [Element Plus TimePicker 时间选择器](https://element-plus.org/zh-CN/component/time-picker.html)
- [Day.js 文档](https://day.js.org/)

---

## 下一步

继续学习开关与滑块组件：[开关与滑块组件](./content-10.md)
