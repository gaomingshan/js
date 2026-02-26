# 国际化与多语言

## 概述

Element Plus 提供完善的国际化（i18n）支持，可以轻松实现多语言切换。本章介绍如何配置国际化、自定义语言包、动态切换语言等功能。

## 核心配置

### 1. 全局配置

在应用入口配置语言。

### 2. ConfigProvider 组件

使用 ConfigProvider 组件局部配置语言。

### 3. 自定义语言包

扩展或自定义语言配置。

## 完整实战样例

### 示例 1：基础国际化配置

配置中英文切换。

```ts
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

// 方式1：全局配置
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <div class="i18n-demo">
    <el-config-provider :locale="currentLocale">
      <el-card>
        <template #header>
          <div class="header">
            <span>{{ t('title') }}</span>
            <el-radio-group v-model="language" size="small" @change="handleLanguageChange">
              <el-radio-button label="zh-cn">中文</el-radio-button>
              <el-radio-button label="en">English</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <el-space direction="vertical" style="width: 100%" :size="20">
          <!-- 日期选择器 -->
          <el-card shadow="never">
            <h4>{{ t('datePicker') }}</h4>
            <el-date-picker
              v-model="date"
              type="date"
              :placeholder="t('selectDate')"
              style="width: 100%"
            />
          </el-card>

          <!-- 分页 -->
          <el-card shadow="never">
            <h4>{{ t('pagination') }}</h4>
            <el-pagination
              :total="100"
              :page-size="10"
              layout="total, prev, pager, next"
              background
            />
          </el-card>

          <!-- 表格 -->
          <el-card shadow="never">
            <h4>{{ t('table') }}</h4>
            <el-table :data="tableData" border>
              <el-table-column prop="name" :label="t('name')" />
              <el-table-column prop="age" :label="t('age')" />
              <el-table-column prop="address" :label="t('address')" />
            </el-table>
          </el-card>

          <!-- 空状态 -->
          <el-card shadow="never">
            <h4>{{ t('empty') }}</h4>
            <el-empty :description="t('noData')" />
          </el-card>
        </el-space>
      </el-card>
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const language = ref('zh-cn')
const date = ref('')

const tableData = ref([
  { name: '张三', age: 28, address: '北京市朝阳区' },
  { name: '李四', age: 32, address: '上海市浦东新区' }
])

// 语言包映射
const locales: Record<string, any> = {
  'zh-cn': zhCn,
  'en': en
}

const currentLocale = computed(() => locales[language.value])

// 自定义翻译
const messages: Record<string, Record<string, string>> = {
  'zh-cn': {
    title: '国际化示例',
    datePicker: '日期选择器',
    selectDate: '选择日期',
    pagination: '分页组件',
    table: '表格组件',
    name: '姓名',
    age: '年龄',
    address: '地址',
    empty: '空状态',
    noData: '暂无数据'
  },
  'en': {
    title: 'Internationalization Example',
    datePicker: 'Date Picker',
    selectDate: 'Select Date',
    pagination: 'Pagination',
    table: 'Table',
    name: 'Name',
    age: 'Age',
    address: 'Address',
    empty: 'Empty State',
    noData: 'No Data'
  }
}

const t = (key: string) => {
  return messages[language.value][key] || key
}

const handleLanguageChange = (value: string) => {
  ElMessage.success(`Language changed to ${value}`)
}
</script>

<style scoped>
.i18n-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h4 {
  margin: 0 0 12px 0;
}
</style>
```

---

### 示例 2：Vue I18n 集成

与 Vue I18n 完整集成。

```bash
npm install vue-i18n@9
```

```ts
// i18n/index.ts
import { createI18n } from 'vue-i18n'
import zhCnLocale from 'element-plus/dist/locale/zh-cn.mjs'
import enLocale from 'element-plus/dist/locale/en.mjs'

const messages = {
  'zh-cn': {
    el: zhCnLocale.el,
    app: {
      title: '我的应用',
      welcome: '欢迎使用',
      settings: '设置',
      logout: '退出登录',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      search: '搜索',
      reset: '重置',
      submit: '提交'
    },
    user: {
      username: '用户名',
      password: '密码',
      email: '邮箱',
      phone: '手机号',
      profile: '个人资料',
      settings: '账号设置'
    },
    message: {
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      deleteConfirm: '确定要删除吗？',
      operationSuccess: '操作成功'
    }
  },
  'en': {
    el: enLocale.el,
    app: {
      title: 'My Application',
      welcome: 'Welcome',
      settings: 'Settings',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      reset: 'Reset',
      submit: 'Submit'
    },
    user: {
      username: 'Username',
      password: 'Password',
      email: 'Email',
      phone: 'Phone',
      profile: 'Profile',
      settings: 'Account Settings'
    },
    message: {
      saveSuccess: 'Save successful',
      saveFailed: 'Save failed',
      deleteConfirm: 'Are you sure to delete?',
      operationSuccess: 'Operation successful'
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-cn',
  fallbackLocale: 'en',
  messages
})

export default i18n
```

```ts
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import i18n from './i18n'
import App from './App.vue'

const app = createApp(App)

app.use(i18n)
app.use(ElementPlus)

app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <div class="full-i18n-demo">
    <el-config-provider :locale="elementLocale">
      <el-container>
        <el-header>
          <div class="header">
            <h2>{{ t('app.title') }}</h2>
            <el-space>
              <el-select v-model="currentLanguage" style="width: 150px" @change="changeLanguage">
                <el-option label="简体中文" value="zh-cn" />
                <el-option label="English" value="en" />
              </el-select>
              <el-dropdown @command="handleCommand">
                <el-button>
                  {{ t('app.settings') }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      {{ t('user.profile') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="settings">
                      {{ t('user.settings') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="logout" divided>
                      {{ t('app.logout') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
        </el-header>

        <el-main>
          <el-card>
            <h3>{{ t('app.welcome') }}</h3>
            
            <el-form :model="form" label-width="120px" style="margin-top: 20px">
              <el-form-item :label="t('user.username')">
                <el-input v-model="form.username" :placeholder="t('user.username')" />
              </el-form-item>
              <el-form-item :label="t('user.email')">
                <el-input v-model="form.email" :placeholder="t('user.email')" />
              </el-form-item>
              <el-form-item :label="t('user.phone')">
                <el-input v-model="form.phone" :placeholder="t('user.phone')" />
              </el-form-item>
              <el-form-item>
                <el-space>
                  <el-button type="primary" @click="handleSave">
                    {{ t('app.save') }}
                  </el-button>
                  <el-button @click="handleReset">
                    {{ t('app.reset') }}
                  </el-button>
                </el-space>
              </el-form-item>
            </el-form>
          </el-card>
        </el-main>
      </el-container>
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const { t, locale } = useI18n()

const currentLanguage = ref('zh-cn')
const form = ref({
  username: '',
  email: '',
  phone: ''
})

const elementLocaleMap: Record<string, any> = {
  'zh-cn': zhCn,
  'en': en
}

const elementLocale = computed(() => elementLocaleMap[currentLanguage.value])

const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
  ElMessage.success(t('message.operationSuccess'))
}

const handleCommand = (command: string) => {
  ElMessage.info(`${t('app.settings')}: ${command}`)
}

const handleSave = () => {
  ElMessage.success(t('message.saveSuccess'))
}

const handleReset = () => {
  form.value = {
    username: '',
    email: '',
    phone: ''
  }
}

// 初始化语言
const initLanguage = () => {
  const savedLang = localStorage.getItem('language')
  if (savedLang) {
    currentLanguage.value = savedLang
    locale.value = savedLang
  }
}

initLanguage()
</script>

<style scoped>
.full-i18n-demo {
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header h2 {
  margin: 0;
}
</style>
```

---

### 示例 3：动态加载语言包

按需加载语言包，减少初始包体积。

```ts
// i18n/index.ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-cn',
  fallbackLocale: 'en',
  messages: {}
})

// 动态加载语言包
export const loadLanguageAsync = async (lang: string) => {
  // 如果语言包已加载，直接返回
  if (i18n.global.availableLocales.includes(lang)) {
    i18n.global.locale.value = lang
    return Promise.resolve(lang)
  }

  // 动态导入语言包
  const [appMessages, elementMessages] = await Promise.all([
    import(`./locales/${lang}.ts`),
    import(`element-plus/dist/locale/${lang}.mjs`)
  ])

  // 合并语言包
  i18n.global.setLocaleMessage(lang, {
    ...appMessages.default,
    el: elementMessages.default.el
  })

  i18n.global.locale.value = lang
  return lang
}

export default i18n
```

```ts
// i18n/locales/zh-cn.ts
export default {
  app: {
    title: '我的应用',
    // ...
  }
}
```

```ts
// i18n/locales/en.ts
export default {
  app: {
    title: 'My Application',
    // ...
  }
}
```

```vue
<!-- 使用动态加载 -->
<script setup lang="ts">
import { loadLanguageAsync } from '@/i18n'

const changeLanguage = async (lang: string) => {
  await loadLanguageAsync(lang)
  ElMessage.success('Language changed')
}
</script>
```

---

## 常见踩坑

### 1. ConfigProvider 作用域

**问题：** ConfigProvider 未包裹所有组件，部分组件语言未切换。

**解决：** 确保 ConfigProvider 包裹整个应用或需要国际化的区域。

```vue
<el-config-provider :locale="locale">
  <router-view />
</el-config-provider>
```

---

### 2. 自定义文本未翻译

**问题：** Element Plus 组件翻译了，但自定义文本没有翻译。

**解决：** 使用 Vue I18n 的 `t()` 函数翻译自定义文本。

```vue
<el-button>{{ t('app.save') }}</el-button>
```

---

### 3. 语言切换后刷新丢失

**问题：** 刷新页面后语言恢复默认。

**解决：** 将语言保存到 localStorage。

```ts
const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

// 初始化时读取
const savedLang = localStorage.getItem('language')
if (savedLang) {
  locale.value = savedLang
}
```

---

## 最佳实践

### 1. 语言包模块化

按功能模块拆分语言包。

```
i18n/
  ├── locales/
  │   ├── zh-cn/
  │   │   ├── common.ts
  │   │   ├── user.ts
  │   │   └── product.ts
  │   └── en/
  │       ├── common.ts
  │       ├── user.ts
  │       └── product.ts
  └── index.ts
```

### 2. 类型安全

使用 TypeScript 确保翻译键的类型安全。

```ts
// types/i18n.ts
export interface I18nMessages {
  app: {
    title: string
    welcome: string
  }
  user: {
    username: string
    email: string
  }
}

// 在 createI18n 时指定类型
const i18n = createI18n<[I18nMessages], 'zh-cn' | 'en'>({
  // ...
})
```

### 3. 按需加载语言包

大型应用按需加载语言包，减少初始加载时间。

---

## 参考资料

- [Element Plus 国际化](https://element-plus.org/zh-CN/guide/i18n.html)
- [Vue I18n 文档](https://vue-i18n.intlify.dev/)
