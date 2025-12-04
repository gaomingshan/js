// 第24章：Web存储 - 面试题
window.htmlQuizData_24 = {
    config: {
        title: "Web存储",
        icon: "💾",
        description: "测试你对Web存储API的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["localStorage", "sessionStorage"],
            question: "localStorage和sessionStorage的区别？",
            type: "multiple-choice",
            options: [
                "生命周期不同",
                "作用域不同",
                "存储容量相同",
                "API相同"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web Storage API",
                description: "localStorage和sessionStorage的对比。",
                sections: [
                    {
                        title: "主要区别",
                        code: '/* localStorage - 持久化 */\n- 生命周期：永久（除非手动清除）\n- 作用域：同源的所有标签页共享\n- 容量：通常5-10MB\n\n/* sessionStorage - 会话级 */\n- 生命周期：关闭标签页后清除\n- 作用域：仅当前标签页\n- 容量：通常5-10MB\n\n/* 相同点 */\n- API完全相同\n- 只能存储字符串\n- 同步操作\n- 同源策略限制',
                        content: "两者的区别和相同点。"
                    },
                    {
                        title: "基本使用",
                        code: '/* 存储数据 */\nlocalStorage.setItem("name", "张三");\nsessionStorage.setItem("token", "abc123");\n\n/* 读取数据 */\nconst name = localStorage.getItem("name");\nconst token = sessionStorage.getItem("token");\n\n/* 删除数据 */\nlocalStorage.removeItem("name");\nsessionStorage.removeItem("token");\n\n/* 清空所有 */\nlocalStorage.clear();\nsessionStorage.clear();\n\n/* 获取键名 */\nconst firstKey = localStorage.key(0);\n\n/* 获取数量 */\nconst count = localStorage.length;\n\n/* 遍历 */\nfor (let i = 0; i < localStorage.length; i++) {\n  const key = localStorage.key(i);\n  const value = localStorage.getItem(key);\n  console.log(key, value);\n}\n\n// 或\nfor (let key in localStorage) {\n  if (localStorage.hasOwnProperty(key)) {\n    console.log(key, localStorage[key]);\n  }\n}',
                        content: "Storage API的基本使用。"
                    },
                    {
                        title: "存储对象",
                        code: '/* 存储对象需要序列化 */\n\nconst user = {\n  name: "张三",\n  age: 25,\n  email: "zhang@example.com"\n};\n\n// ❌ 错误：直接存储\nlocalStorage.setItem("user", user);\nconsole.log(localStorage.getItem("user"));\n// "[object Object]"\n\n// ✅ 正确：序列化\nlocalStorage.setItem("user", JSON.stringify(user));\nconst storedUser = JSON.parse(localStorage.getItem("user"));\nconsole.log(storedUser);\n// { name: "张三", age: 25, email: "zhang@example.com" }\n\n/* 封装工具函数 */\nconst storage = {\n  set(key, value) {\n    localStorage.setItem(key, JSON.stringify(value));\n  },\n  \n  get(key) {\n    const value = localStorage.getItem(key);\n    try {\n      return JSON.parse(value);\n    } catch (e) {\n      return value;\n    }\n  },\n  \n  remove(key) {\n    localStorage.removeItem(key);\n  },\n  \n  clear() {\n    localStorage.clear();\n  }\n};\n\n// 使用\nstorage.set("user", { name: "张三" });\nconst user = storage.get("user");',
                        content: "存储复杂数据类型。"
                    },
                    {
                        title: "storage事件",
                        code: '/* storage事件 - 监听其他标签页的变化 */\n\nwindow.addEventListener("storage", (e) => {\n  console.log("键:", e.key);\n  console.log("旧值:", e.oldValue);\n  console.log("新值:", e.newValue);\n  console.log("URL:", e.url);\n  console.log("存储对象:", e.storageArea);\n});\n\n/* 注意 */\n1. 只在其他标签页触发，当前页不触发\n2. 只监听localStorage，不监听sessionStorage\n3. 需要同源\n\n/* 实际应用：标签页同步 */\n// 页面A\nlocalStorage.setItem("theme", "dark");\n\n// 页面B（自动监听）\nwindow.addEventListener("storage", (e) => {\n  if (e.key === "theme") {\n    applyTheme(e.newValue);\n  }\n});\n\n/* 跨标签页通信 */\n// 发送消息\nfunction sendMessage(message) {\n  localStorage.setItem("message", JSON.stringify({\n    data: message,\n    timestamp: Date.now()\n  }));\n  localStorage.removeItem("message");  // 立即删除触发事件\n}\n\n// 接收消息\nwindow.addEventListener("storage", (e) => {\n  if (e.key === "message" && e.newValue) {\n    const { data } = JSON.parse(e.newValue);\n    console.log("收到消息:", data);\n  }\n});',
                        content: "监听存储变化。"
                    },
                    {
                        title: "容量检测",
                        code: '/* 检测可用容量 */\nfunction getStorageSize() {\n  let total = 0;\n  for (let key in localStorage) {\n    if (localStorage.hasOwnProperty(key)) {\n      total += localStorage[key].length + key.length;\n    }\n  }\n  return total;\n}\n\nconsole.log(`已使用: ${getStorageSize()} 字符`);\n\n/* 测试最大容量 */\nfunction testStorageLimit() {\n  const testKey = "test";\n  let data = "0";\n  let i = 0;\n  \n  try {\n    while (true) {\n      localStorage.setItem(testKey, data);\n      data += data;  // 指数增长\n      i++;\n    }\n  } catch (e) {\n    localStorage.removeItem(testKey);\n    console.log(`最大容量约: ${data.length / 1024 / 1024} MB`);\n  }\n}\n\n/* 容量超限处理 */\nfunction safeSetItem(key, value) {\n  try {\n    localStorage.setItem(key, value);\n    return true;\n  } catch (e) {\n    if (e.name === "QuotaExceededError") {\n      console.warn("存储已满");\n      // 清理旧数据\n      cleanOldData();\n      // 重试\n      try {\n        localStorage.setItem(key, value);\n        return true;\n      } catch (e) {\n        return false;\n      }\n    }\n    return false;\n  }\n}\n\nfunction cleanOldData() {\n  // 实现清理策略（如LRU）\n}',
                        content: "容量检测和处理。"
                    },
                    {
                        title: "安全性考虑",
                        code: '/* 1. 不要存储敏感信息 */\n// ❌ 不安全\nlocalStorage.setItem("password", "123456");\nlocalStorage.setItem("creditCard", "1234-5678-9012-3456");\n\n// ✅ 只存储非敏感数据\nlocalStorage.setItem("theme", "dark");\nlocalStorage.setItem("language", "zh-CN");\n\n/* 2. XSS攻击风险 */\n// 攻击者可以通过XSS读取localStorage\nconst stolenData = localStorage.getItem("token");\n\n// 防范：使用httpOnly Cookie存储token\n\n/* 3. 数据加密 */\nimport CryptoJS from "crypto-js";\n\nfunction encryptData(data, key) {\n  return CryptoJS.AES.encrypt(\n    JSON.stringify(data), \n    key\n  ).toString();\n}\n\nfunction decryptData(ciphertext, key) {\n  const bytes = CryptoJS.AES.decrypt(ciphertext, key);\n  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));\n}\n\n// 使用\nconst data = { secret: "敏感数据" };\nconst encrypted = encryptData(data, "my-secret-key");\nlocalStorage.setItem("data", encrypted);\n\nconst decrypted = decryptData(\n  localStorage.getItem("data"),\n  "my-secret-key"\n);\n\n/* 4. 数据验证 */\nfunction safeGetItem(key) {\n  try {\n    const value = localStorage.getItem(key);\n    if (!value) return null;\n    \n    const data = JSON.parse(value);\n    \n    // 验证数据完整性\n    if (validateData(data)) {\n      return data;\n    }\n  } catch (e) {\n    console.error("数据损坏");\n    localStorage.removeItem(key);\n  }\n  return null;\n}',
                        content: "安全性最佳实践。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 1. 用户偏好设置 */\nclass Preferences {\n  constructor() {\n    this.key = "app_preferences";\n    this.defaults = {\n      theme: "light",\n      language: "zh-CN",\n      fontSize: 14\n    };\n  }\n  \n  get() {\n    const stored = localStorage.getItem(this.key);\n    if (stored) {\n      return { ...this.defaults, ...JSON.parse(stored) };\n    }\n    return this.defaults;\n  }\n  \n  set(key, value) {\n    const prefs = this.get();\n    prefs[key] = value;\n    localStorage.setItem(this.key, JSON.stringify(prefs));\n  }\n  \n  reset() {\n    localStorage.removeItem(this.key);\n  }\n}\n\nconst prefs = new Preferences();\nprefs.set("theme", "dark");\nconsole.log(prefs.get());  // { theme: "dark", ... }\n\n/* 2. 表单数据自动保存 */\nconst form = document.querySelector("form");\nconst SAVE_KEY = "form_draft";\n\n// 自动保存\nform.addEventListener("input", debounce(() => {\n  const formData = new FormData(form);\n  const data = Object.fromEntries(formData);\n  localStorage.setItem(SAVE_KEY, JSON.stringify(data));\n}, 500));\n\n// 恢复数据\nwindow.addEventListener("load", () => {\n  const saved = localStorage.getItem(SAVE_KEY);\n  if (saved) {\n    const data = JSON.parse(saved);\n    Object.keys(data).forEach(key => {\n      const input = form.elements[key];\n      if (input) input.value = data[key];\n    });\n  }\n});\n\n// 提交后清除\nform.addEventListener("submit", () => {\n  localStorage.removeItem(SAVE_KEY);\n});\n\n/* 3. 缓存API响应 */\nclass CacheManager {\n  constructor(ttl = 5 * 60 * 1000) {  // 5分钟\n    this.ttl = ttl;\n  }\n  \n  set(key, data) {\n    const item = {\n      data,\n      timestamp: Date.now()\n    };\n    localStorage.setItem(key, JSON.stringify(item));\n  }\n  \n  get(key) {\n    const item = localStorage.getItem(key);\n    if (!item) return null;\n    \n    const { data, timestamp } = JSON.parse(item);\n    \n    // 检查是否过期\n    if (Date.now() - timestamp > this.ttl) {\n      localStorage.removeItem(key);\n      return null;\n    }\n    \n    return data;\n  }\n}\n\nconst cache = new CacheManager();\n\nasync function fetchUserData(id) {\n  const cacheKey = `user_${id}`;\n  \n  // 先查缓存\n  const cached = cache.get(cacheKey);\n  if (cached) {\n    return cached;\n  }\n  \n  // 请求API\n  const response = await fetch(`/api/users/${id}`);\n  const data = await response.json();\n  \n  // 缓存结果\n  cache.set(cacheKey, data);\n  \n  return data;\n}',
                        content: "实际应用场景。"
                    }
                ]
            },
            source: "Web Storage API"
        },
        {
            difficulty: "hard",
            tags: ["IndexedDB", "高级"],
            question: "IndexedDB的特点和使用场景？",
            type: "multiple-choice",
            options: [
                "支持大量数据存储",
                "事务性数据库",
                "异步操作",
                "支持索引和查询"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "IndexedDB",
                description: "浏览器内置的NoSQL数据库。",
                sections: [
                    {
                        title: "IndexedDB vs localStorage",
                        code: '/* localStorage */\n- 容量：5-10MB\n- 类型：只能存字符串\n- 操作：同步\n- 查询：无\n- 适合：简单键值对\n\n/* IndexedDB */\n- 容量：通常>50MB，理论上无限制\n- 类型：可存任意JavaScript对象\n- 操作：异步\n- 查询：支持索引、范围查询、游标\n- 适合：大量结构化数据\n\n/* 使用场景 */\nlocalStorage：用户设置、主题、token\nIndexedDB：离线应用、缓存、大数据集',
                        content: "IndexedDB的优势。"
                    },
                    {
                        title: "基本使用",
                        code: '/* 1. 打开数据库 */\nconst request = indexedDB.open("MyDatabase", 1);\n\n// 成功\nrequest.onsuccess = (event) => {\n  const db = event.target.result;\n  console.log("数据库已打开", db);\n};\n\n// 错误\nrequest.onerror = (event) => {\n  console.error("数据库错误", event.target.error);\n};\n\n// 升级（首次创建或版本号增加）\nrequest.onupgradeneeded = (event) => {\n  const db = event.target.result;\n  \n  // 创建对象仓库（类似表）\n  if (!db.objectStoreNames.contains("users")) {\n    const objectStore = db.createObjectStore("users", {\n      keyPath: "id",        // 主键\n      autoIncrement: true  // 自动递增\n    });\n    \n    // 创建索引\n    objectStore.createIndex("email", "email", { unique: true });\n    objectStore.createIndex("age", "age", { unique: false });\n  }\n};',
                        content: "打开和创建数据库。"
                    },
                    {
                        title: "CRUD操作",
                        code: '/* 添加数据 */\nfunction addUser(user) {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readwrite");\n      const objectStore = transaction.objectStore("users");\n      \n      const addRequest = objectStore.add(user);\n      \n      addRequest.onsuccess = () => {\n        resolve(addRequest.result);  // 返回生成的id\n      };\n      \n      addRequest.onerror = () => {\n        reject(addRequest.error);\n      };\n    };\n  });\n}\n\n// 使用\nawait addUser({ name: "张三", email: "zhang@example.com", age: 25 });\n\n/* 读取数据 */\nfunction getUser(id) {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readonly");\n      const objectStore = transaction.objectStore("users");\n      \n      const getRequest = objectStore.get(id);\n      \n      getRequest.onsuccess = () => {\n        resolve(getRequest.result);\n      };\n      \n      getRequest.onerror = () => {\n        reject(getRequest.error);\n      };\n    };\n  });\n}\n\nconst user = await getUser(1);\n\n/* 更新数据 */\nfunction updateUser(user) {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readwrite");\n      const objectStore = transaction.objectStore("users");\n      \n      const putRequest = objectStore.put(user);\n      \n      putRequest.onsuccess = () => {\n        resolve();\n      };\n      \n      putRequest.onerror = () => {\n        reject(putRequest.error);\n      };\n    };\n  });\n}\n\nawait updateUser({ id: 1, name: "张三", age: 26 });\n\n/* 删除数据 */\nfunction deleteUser(id) {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readwrite");\n      const objectStore = transaction.objectStore("users");\n      \n      const deleteRequest = objectStore.delete(id);\n      \n      deleteRequest.onsuccess = () => {\n        resolve();\n      };\n      \n      deleteRequest.onerror = () => {\n        reject(deleteRequest.error);\n      };\n    };\n  });\n}\n\nawait deleteUser(1);',
                        content: "增删改查操作。"
                    },
                    {
                        title: "索引查询",
                        code: '/* 通过索引查询 */\nfunction getUserByEmail(email) {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readonly");\n      const objectStore = transaction.objectStore("users");\n      const index = objectStore.index("email");\n      \n      const getRequest = index.get(email);\n      \n      getRequest.onsuccess = () => {\n        resolve(getRequest.result);\n      };\n    };\n  });\n}\n\nconst user = await getUserByEmail("zhang@example.com");\n\n/* 范围查询 */\nfunction getUsersByAgeRange(minAge, maxAge) {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readonly");\n      const objectStore = transaction.objectStore("users");\n      const index = objectStore.index("age");\n      \n      const range = IDBKeyRange.bound(minAge, maxAge);\n      const cursorRequest = index.openCursor(range);\n      const results = [];\n      \n      cursorRequest.onsuccess = (e) => {\n        const cursor = e.target.result;\n        if (cursor) {\n          results.push(cursor.value);\n          cursor.continue();\n        } else {\n          resolve(results);\n        }\n      };\n    };\n  });\n}\n\nconst users = await getUsersByAgeRange(20, 30);\n\n/* 获取所有数据 */\nfunction getAllUsers() {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open("MyDatabase", 1);\n    \n    request.onsuccess = (event) => {\n      const db = event.target.result;\n      const transaction = db.transaction(["users"], "readonly");\n      const objectStore = transaction.objectStore("users");\n      \n      const getAllRequest = objectStore.getAll();\n      \n      getAllRequest.onsuccess = () => {\n        resolve(getAllRequest.result);\n      };\n    };\n  });\n}\n\nconst allUsers = await getAllUsers();',
                        content: "索引和范围查询。"
                    },
                    {
                        title: "封装工具类",
                        code: '/* IndexedDB工具类 */\nclass IndexedDBHelper {\n  constructor(dbName, version = 1) {\n    this.dbName = dbName;\n    this.version = version;\n    this.db = null;\n  }\n  \n  open(stores) {\n    return new Promise((resolve, reject) => {\n      const request = indexedDB.open(this.dbName, this.version);\n      \n      request.onerror = () => reject(request.error);\n      request.onsuccess = () => {\n        this.db = request.result;\n        resolve(this.db);\n      };\n      \n      request.onupgradeneeded = (event) => {\n        const db = event.target.result;\n        \n        stores.forEach(store => {\n          if (!db.objectStoreNames.contains(store.name)) {\n            const objectStore = db.createObjectStore(store.name, store.options);\n            \n            if (store.indexes) {\n              store.indexes.forEach(index => {\n                objectStore.createIndex(index.name, index.keyPath, index.options);\n              });\n            }\n          }\n        });\n      };\n    });\n  }\n  \n  add(storeName, data) {\n    return new Promise((resolve, reject) => {\n      const transaction = this.db.transaction([storeName], "readwrite");\n      const objectStore = transaction.objectStore(storeName);\n      const request = objectStore.add(data);\n      \n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  get(storeName, key) {\n    return new Promise((resolve, reject) => {\n      const transaction = this.db.transaction([storeName], "readonly");\n      const objectStore = transaction.objectStore(storeName);\n      const request = objectStore.get(key);\n      \n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  getAll(storeName) {\n    return new Promise((resolve, reject) => {\n      const transaction = this.db.transaction([storeName], "readonly");\n      const objectStore = transaction.objectStore(storeName);\n      const request = objectStore.getAll();\n      \n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  update(storeName, data) {\n    return new Promise((resolve, reject) => {\n      const transaction = this.db.transaction([storeName], "readwrite");\n      const objectStore = transaction.objectStore(storeName);\n      const request = objectStore.put(data);\n      \n      request.onsuccess = () => resolve();\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  delete(storeName, key) {\n    return new Promise((resolve, reject) => {\n      const transaction = this.db.transaction([storeName], "readwrite");\n      const objectStore = transaction.objectStore(storeName);\n      const request = objectStore.delete(key);\n      \n      request.onsuccess = () => resolve();\n      request.onerror = () => reject(request.error);\n    });\n  }\n}\n\n// 使用\nconst db = new IndexedDBHelper("MyApp", 1);\n\nawait db.open([\n  {\n    name: "users",\n    options: { keyPath: "id", autoIncrement: true },\n    indexes: [\n      { name: "email", keyPath: "email", options: { unique: true } },\n      { name: "age", keyPath: "age", options: { unique: false } }\n    ]\n  }\n]);\n\nawait db.add("users", { name: "张三", email: "zhang@example.com", age: 25 });\nconst user = await db.get("users", 1);\nconst allUsers = await db.getAll("users");',
                        content: "封装简化使用。"
                    }
                ]
            },
            source: "IndexedDB API"
        },
        {
            difficulty: "medium",
            tags: ["Cookie", "基础"],
            question: "Cookie的属性和使用场景？",
            type: "multiple-choice",
            options: [
                "存储用户会话",
                "设置过期时间",
                "控制作用域",
                "安全属性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Cookie",
                description: "HTTP Cookie的使用。",
                sections: [
                    {
                        title: "Cookie基础",
                        code: '/* 设置Cookie */\ndocument.cookie = "username=张三";\ndocument.cookie = "theme=dark";\n\n/* 读取Cookie */\nconsole.log(document.cookie);\n// "username=张三; theme=dark"\n\n/* 解析Cookie */\nfunction getCookie(name) {\n  const cookies = document.cookie.split("; ");\n  for (let cookie of cookies) {\n    const [key, value] = cookie.split("=");\n    if (key === name) {\n      return decodeURIComponent(value);\n    }\n  }\n  return null;\n}\n\nconst username = getCookie("username");\n\n/* 删除Cookie */\ndocument.cookie = "username=; max-age=0";\n// 或\ndocument.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";',
                        content: "Cookie的基本操作。"
                    },
                    {
                        title: "Cookie属性",
                        code: '/* expires - 过期时间 */\nconst expires = new Date();\nexpires.setDate(expires.getDate() + 7);  // 7天后\ndocument.cookie = `token=abc123; expires=${expires.toUTCString()}`;\n\n/* max-age - 有效期（秒）*/\ndocument.cookie = "session=xyz; max-age=3600";  // 1小时\n\n/* domain - 域名 */\ndocument.cookie = "user=123; domain=.example.com";\n// 可在example.com和所有子域使用\n\n/* path - 路径 */\ndocument.cookie = "data=abc; path=/";\n// 整个网站可访问\n\ndocument.cookie = "admin=1; path=/admin";\n// 只在/admin路径下可访问\n\n/* secure - 仅HTTPS */\ndocument.cookie = "token=secret; secure";\n// 只在HTTPS连接中发送\n\n/* httpOnly - 禁止JavaScript访问 */\n// 只能在服务器端设置\n// Set-Cookie: session=abc; httpOnly\n\n/* SameSite - 跨站请求 */\ndocument.cookie = "csrf=token; SameSite=Strict";\n// Strict: 完全禁止第三方Cookie\n// Lax: GET请求可以\n// None: 允许（需配合Secure）\n\n/* 完整示例 */\nfunction setCookie(name, value, days) {\n  const expires = new Date();\n  expires.setDate(expires.getDate() + days);\n  \n  document.cookie = [\n    `${name}=${encodeURIComponent(value)}`,\n    `expires=${expires.toUTCString()}`,\n    "path=/",\n    "SameSite=Lax"\n  ].join("; ");\n}\n\nsetCookie("username", "张三", 7);',
                        content: "Cookie的各种属性。"
                    },
                    {
                        title: "Cookie工具类",
                        code: '/* Cookie工具类 */\nclass CookieManager {\n  static set(name, value, options = {}) {\n    const {\n      days = 7,\n      path = "/",\n      domain,\n      secure = false,\n      sameSite = "Lax"\n    } = options;\n    \n    let cookie = `${name}=${encodeURIComponent(value)}`;\n    \n    if (days) {\n      const expires = new Date();\n      expires.setDate(expires.getDate() + days);\n      cookie += `; expires=${expires.toUTCString()}`;\n    }\n    \n    cookie += `; path=${path}`;\n    \n    if (domain) {\n      cookie += `; domain=${domain}`;\n    }\n    \n    if (secure) {\n      cookie += "; secure";\n    }\n    \n    if (sameSite) {\n      cookie += `; SameSite=${sameSite}`;\n    }\n    \n    document.cookie = cookie;\n  }\n  \n  static get(name) {\n    const cookies = document.cookie.split("; ");\n    for (let cookie of cookies) {\n      const [key, value] = cookie.split("=");\n      if (key === name) {\n        return decodeURIComponent(value);\n      }\n    }\n    return null;\n  }\n  \n  static remove(name, options = {}) {\n    this.set(name, "", { ...options, days: -1 });\n  }\n  \n  static getAll() {\n    const cookies = {};\n    document.cookie.split("; ").forEach(cookie => {\n      const [key, value] = cookie.split("=");\n      cookies[key] = decodeURIComponent(value);\n    });\n    return cookies;\n  }\n}\n\n// 使用\nCookieManager.set("username", "张三", { days: 30 });\nconst username = CookieManager.get("username");\nCookieManager.remove("username");\nconst all = CookieManager.getAll();',
                        content: "封装Cookie操作。"
                    },
                    {
                        title: "Cookie vs Storage",
                        code: '/* Cookie */\n优点：\n- 自动发送到服务器\n- 可设置httpOnly（安全）\n- 支持跨域（设置domain）\n\n缺点：\n- 容量小（4KB）\n- 每次请求都发送（浪费带宽）\n- API不友好\n\n适合：\n- 会话管理（session）\n- 身份验证（token）\n- 追踪用户\n\n/* localStorage */\n优点：\n- 容量大（5-10MB）\n- 永久存储\n- API简单\n- 不发送到服务器\n\n缺点：\n- 只在客户端\n- 同步操作\n- 无法跨域\n\n适合：\n- 用户设置\n- 缓存数据\n- 离线数据\n\n/* sessionStorage */\n优点：\n- 标签页隔离\n- 自动清除\n\n适合：\n- 临时数据\n- 表单草稿\n- 单页应用状态\n\n/* IndexedDB */\n优点：\n- 容量大\n- 异步操作\n- 支持查询\n\n适合：\n- 大量数据\n- 离线应用\n- 复杂查询',
                        content: "选择合适的存储方式。"
                    }
                ]
            },
            source: "HTTP Cookie"
        }
    ],
    navigation: {
        prev: { title: "SVG基础", url: "23-svg-quiz.html" },
        next: { title: "拖放API", url: "25-drag-drop-quiz.html" }
    }
};
