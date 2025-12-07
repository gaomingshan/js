/**
 * 浏览器存储
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced11BrowserStorage = {
  "config": {
    "title": "浏览器存储",
    "icon": "💾",
    "description": "掌握localStorage、sessionStorage、IndexedDB、Cookie等存储方案",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    // ========== 1. 单选题：Storage基础 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Web Storage"],
      "question": "localStorage和sessionStorage的主要区别是什么？",
      "options": [
        "localStorage持久化存储，sessionStorage会话结束后清除",
        "localStorage容量更大",
        "localStorage可以跨域访问",
        "localStorage速度更快"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "localStorage vs sessionStorage：",
        "sections": [
          {
            "title": "主要区别",
            "points": [
              "生命周期：localStorage永久存储，sessionStorage会话结束清除",
              "作用域：两者都遵循同源策略",
              "容量：都是5-10MB（浏览器而异）",
              "API：完全相同"
            ]
          },
          {
            "title": "localStorage",
            "code": "// 永久存储，除非手动清除\nlocalStorage.setItem('user', 'John');\n\n// 关闭浏览器后仍然存在\n// 可以在新标签页中访问",
            "content": "数据永久保存，跨会话访问"
          },
          {
            "title": "sessionStorage",
            "code": "// 会话存储，关闭标签页后清除\nsessionStorage.setItem('temp', 'data');\n\n// 只在当前标签页有效\n// 新标签页无法访问\n// 刷新页面数据仍在",
            "content": "页面会话期间有效，关闭标签即清除"
          },
          {
            "title": "使用场景",
            "code": "// localStorage：长期数据\n// - 用户设置\n// - 主题偏好\n// - 购物车（持久化）\n// - 缓存数据\nlocalStorage.setItem('theme', 'dark');\nlocalStorage.setItem('language', 'zh-CN');\n\n// sessionStorage：临时数据\n// - 表单数据（防止刷新丢失）\n// - 会话状态\n// - 单页面应用路由状态\nsessionStorage.setItem('formData', JSON.stringify(data));\nsessionStorage.setItem('scrollPosition', window.scrollY);"
          }
        ]
      },
      "source": "Web Storage"
    },

    // ========== 2. 多选题：Storage API ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["Storage API"],
      "question": "以下哪些是Web Storage API的方法？",
      "options": [
        "setItem(key, value)",
        "getItem(key)",
        "removeItem(key)",
        "clear()",
        "has(key)",
        "key(index)"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "Web Storage完整API：",
        "sections": [
          {
            "title": "基本方法",
            "code": "// 1. setItem - 存储数据\nlocalStorage.setItem('name', 'John');\nlocalStorage.setItem('age', '25'); // 注意：都存为字符串\n\n// 2. getItem - 读取数据\nconst name = localStorage.getItem('name'); // 'John'\nconst age = localStorage.getItem('age');   // '25' (字符串)\nconst missing = localStorage.getItem('xxx'); // null\n\n// 3. removeItem - 删除单个\nlocalStorage.removeItem('name');\n\n// 4. clear - 清空所有\nlocalStorage.clear();\n\n// 5. key - 通过索引获取key\nconst firstKey = localStorage.key(0);\n\n// 6. length - 获取数量\nconst count = localStorage.length;"
          },
          {
            "title": "对象式访问（不推荐）",
            "code": "// ❌ 不推荐：直接访问属性\nlocalStorage.name = 'John';\nconst name = localStorage.name;\ndelete localStorage.name;\n\n// ✅ 推荐：使用API方法\nlocalStorage.setItem('name', 'John');\nconst name = localStorage.getItem('name');\nlocalStorage.removeItem('name');\n\n// 原因：直接访问可能与内置属性冲突"
          },
          {
            "title": "存储对象",
            "code": "// ❌ 错误：直接存储对象\nconst user = { name: 'John', age: 25 };\nlocalStorage.setItem('user', user); // 存储为'[object Object]'\n\n// ✅ 正确：序列化为JSON\nlocalStorage.setItem('user', JSON.stringify(user));\n\n// 读取时解析\nconst storedUser = JSON.parse(localStorage.getItem('user'));\n\n// 封装工具函数\nconst storage = {\n  set(key, value) {\n    localStorage.setItem(key, JSON.stringify(value));\n  },\n  get(key) {\n    const value = localStorage.getItem(key);\n    try {\n      return JSON.parse(value);\n    } catch {\n      return value;\n    }\n  },\n  remove(key) {\n    localStorage.removeItem(key);\n  }\n};"
          },
          {
            "title": "遍历Storage",
            "code": "// 方法1：使用key()\nfor (let i = 0; i < localStorage.length; i++) {\n  const key = localStorage.key(i);\n  const value = localStorage.getItem(key);\n  console.log(key, value);\n}\n\n// 方法2：使用Object.keys\nObject.keys(localStorage).forEach(key => {\n  console.log(key, localStorage.getItem(key));\n});\n\n// 方法3：for...in（注意过滤）\nfor (let key in localStorage) {\n  if (localStorage.hasOwnProperty(key)) {\n    console.log(key, localStorage[key]);\n  }\n}"
          }
        ]
      },
      "source": "Storage API"
    },

    // ========== 3. 代码输出题：Storage事件 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["storage事件"],
      "question": "在同一标签页修改localStorage，会触发storage事件吗？",
      "code": "// 同一标签页\nwindow.addEventListener('storage', (e) => {\n  console.log('storage changed:', e.key);\n});\n\nlocalStorage.setItem('test', 'value');",
      "options": [
        "不会触发（storage事件只在其他标签页触发）",
        "会触发",
        "取决于浏览器",
        "只有clear()会触发"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "storage事件机制：",
        "sections": [
          {
            "title": "正确！只在其他标签页触发",
            "content": "storage事件不会在当前标签页触发，只会通知其他同源的标签页",
            "code": "// 标签页A\nwindow.addEventListener('storage', (e) => {\n  console.log('不会触发'); // 不会执行\n});\nlocalStorage.setItem('key', 'value');\n\n// 标签页B（同一域名）\nwindow.addEventListener('storage', (e) => {\n  console.log('触发了！'); // 会执行\n  console.log('key:', e.key);         // 'key'\n  console.log('oldValue:', e.oldValue); // null\n  console.log('newValue:', e.newValue); // 'value'\n  console.log('url:', e.url);         // 修改页面的URL\n});"
          },
          {
            "title": "StorageEvent对象",
            "code": "window.addEventListener('storage', (e) => {\n  // e.key - 被修改的键（null表示clear()）\n  // e.oldValue - 旧值\n  // e.newValue - 新值（null表示removeItem）\n  // e.url - 触发变化的文档URL\n  // e.storageArea - localStorage或sessionStorage\n  \n  if (e.key === 'user') {\n    console.log('用户信息更新');\n    updateUI(JSON.parse(e.newValue));\n  }\n});"
          },
          {
            "title": "跨标签页通信",
            "code": "// 标签页A：发送消息\nfunction broadcast(type, data) {\n  localStorage.setItem('message', JSON.stringify({\n    type,\n    data,\n    timestamp: Date.now()\n  }));\n  // 立即删除，确保每次都触发事件\n  localStorage.removeItem('message');\n}\n\nbroadcast('user-login', { userId: 123 });\n\n// 标签页B：接收消息\nwindow.addEventListener('storage', (e) => {\n  if (e.key === 'message' && e.newValue) {\n    const { type, data } = JSON.parse(e.newValue);\n    \n    switch(type) {\n      case 'user-login':\n        console.log('用户登录:', data.userId);\n        break;\n      case 'user-logout':\n        console.log('用户登出');\n        window.location.href = '/login';\n        break;\n    }\n  }\n});"
          }
        ]
      },
      "source": "storage事件"
    },

    // ========== 4. 判断题：Storage容量 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["存储容量"],
      "question": "localStorage的存储容量通常是5MB",
      "correctAnswer": "A",
      "explanation": {
        "title": "存储容量限制：",
        "sections": [
          {
            "title": "正确！大部分浏览器是5MB",
            "points": [
              "Chrome/Edge：5MB（部分10MB）",
              "Firefox：10MB",
              "Safari：5MB（iOS可能更小）",
              "IE：10MB"
            ],
            "content": "实际容量因浏览器而异，通常在5-10MB之间"
          },
          {
            "title": "检测可用容量",
            "code": "function getStorageSize() {\n  let total = 0;\n  for (let key in localStorage) {\n    if (localStorage.hasOwnProperty(key)) {\n      total += localStorage[key].length + key.length;\n    }\n  }\n  return (total / 1024 / 1024).toFixed(2) + ' MB';\n}\n\nconsole.log('已使用:', getStorageSize());\n\n// 测试最大容量\nfunction testQuota() {\n  const testKey = 'test';\n  let size = 0;\n  \n  try {\n    // 每次添加1KB\n    const chunk = new Array(1024).join('a');\n    \n    while (true) {\n      localStorage.setItem(testKey, \n        localStorage.getItem(testKey) + chunk\n      );\n      size += chunk.length;\n    }\n  } catch (e) {\n    console.log('容量上限:', (size / 1024 / 1024).toFixed(2) + ' MB');\n    localStorage.removeItem(testKey);\n  }\n}\n\n// testQuota(); // 慎用，会填满storage"
          },
          {
            "title": "超出容量处理",
            "code": "function safeSetItem(key, value) {\n  try {\n    localStorage.setItem(key, value);\n    return true;\n  } catch (e) {\n    if (e.name === 'QuotaExceededError') {\n      console.error('存储空间已满');\n      \n      // 清理策略1：删除旧数据\n      const keys = Object.keys(localStorage);\n      if (keys.length > 0) {\n        localStorage.removeItem(keys[0]);\n        return safeSetItem(key, value); // 重试\n      }\n      \n      // 清理策略2：使用LRU\n      // 清理策略3：压缩数据\n      \n      return false;\n    }\n    throw e;\n  }\n}"
          }
        ]
      },
      "source": "存储容量"
    },

    // ========== 5. 多选题：Cookie vs Storage ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["存储对比"],
      "question": "以下哪些是Cookie相比localStorage的特点？",
      "options": [
        "Cookie会自动随HTTP请求发送",
        "Cookie容量更小（约4KB）",
        "Cookie可以设置过期时间",
        "Cookie可以设置作用域（domain、path）",
        "Cookie支持HttpOnly防止XSS",
        "Cookie不受同源策略限制"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "Cookie vs localStorage vs sessionStorage：",
        "sections": [
          {
            "title": "对比表格",
            "code": "/*\n特性          | Cookie        | localStorage  | sessionStorage\n-------------|---------------|---------------|---------------\n容量          | ~4KB          | 5-10MB        | 5-10MB\n生命周期      | 可设置expires  | 永久          | 会话结束\n作用域        | domain+path   | origin        | origin+tab\nHTTP发送     | 自动发送       | 不发送        | 不发送\nAPI          | document.cookie| Storage API  | Storage API\n安全性        | HttpOnly/Secure| 无此特性     | 无此特性\n*/"
          },
          {
            "title": "Cookie特性",
            "code": "// 设置Cookie\ndocument.cookie = 'user=John; max-age=3600; path=/; secure; httponly';\n\n// 属性说明\n// - max-age: 有效期（秒）\n// - expires: 过期时间\n// - path: 路径\n// - domain: 域名\n// - secure: 仅HTTPS\n// - httponly: 禁止JavaScript访问（仅服务端）\n// - samesite: CSRF防护\n\n// 读取Cookie\nconst cookies = document.cookie\n  .split('; ')\n  .reduce((acc, item) => {\n    const [key, value] = item.split('=');\n    acc[key] = decodeURIComponent(value);\n    return acc;\n  }, {});\n\n// 删除Cookie\ndocument.cookie = 'user=; max-age=0';"
          },
          {
            "title": "localStorage特性",
            "code": "// 简单API\nlocalStorage.setItem('user', 'John');\nconst user = localStorage.getItem('user');\nlocalStorage.removeItem('user');\n\n// 优点\n// - 容量大（5-10MB）\n// - 不会随HTTP发送（节省带宽）\n// - API简单\n\n// 缺点\n// - 只能存储字符串\n// - 同步操作（可能阻塞）\n// - 无过期时间（需手动实现）"
          },
          {
            "title": "使用场景选择",
            "code": "// ✅ 使用Cookie\n// - 需要服务端访问\n// - 需要设置HttpOnly（防XSS）\n// - 需要跨子域共享\n// - 身份认证token\n\n// ✅ 使用localStorage\n// - 客户端缓存数据\n// - 用户偏好设置\n// - 离线应用数据\n// - 不需要发送到服务器的数据\n\n// ✅ 使用sessionStorage\n// - 单页面应用状态\n// - 临时表单数据\n// - 会话级别的缓存"
          }
        ]
      },
      "source": "存储对比"
    },

    // ========== 6. 代码补全题：带过期时间的Storage ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Storage封装"],
      "question": "实现带过期时间的localStorage，空白处填什么？",
      "code": "const storage = {\n  set(key, value, expire) {\n    const data = {\n      value,\n      expire: expire ? Date.now() + expire : null\n    };\n    localStorage.setItem(key, JSON.stringify(data));\n  },\n  \n  get(key) {\n    const item = localStorage.getItem(key);\n    if (!item) return null;\n    \n    const data = JSON.parse(item);\n    if (______) {\n      localStorage.removeItem(key);\n      return null;\n    }\n    return data.value;\n  }\n};",
      "options": [
        "data.expire && Date.now() > data.expire",
        "data.expire < Date.now()",
        "data.expire && data.expire < Date.now()",
        "Date.now() - data.expire > 0"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "带过期时间的Storage实现：",
        "sections": [
          {
            "title": "完整实现",
            "code": "class Storage {\n  constructor(storage = localStorage) {\n    this.storage = storage;\n  }\n  \n  // 设置数据（expire单位：毫秒）\n  set(key, value, expire) {\n    const data = {\n      value,\n      expire: expire ? Date.now() + expire : null,\n      createTime: Date.now()\n    };\n    this.storage.setItem(key, JSON.stringify(data));\n  }\n  \n  // 获取数据\n  get(key) {\n    const item = this.storage.getItem(key);\n    if (!item) return null;\n    \n    try {\n      const data = JSON.parse(item);\n      \n      // 检查是否过期\n      if (data.expire && Date.now() > data.expire) {\n        this.remove(key);\n        return null;\n      }\n      \n      return data.value;\n    } catch (e) {\n      return null;\n    }\n  }\n  \n  // 删除数据\n  remove(key) {\n    this.storage.removeItem(key);\n  }\n  \n  // 清空所有\n  clear() {\n    this.storage.clear();\n  }\n  \n  // 清除过期数据\n  clearExpired() {\n    const keys = Object.keys(this.storage);\n    keys.forEach(key => {\n      this.get(key); // 会自动删除过期数据\n    });\n  }\n}\n\n// 使用\nconst storage = new Storage();\n\n// 存储1小时\nstorage.set('token', 'abc123', 3600000);\n\n// 存储1天\nstorage.set('user', { name: 'John' }, 86400000);\n\n// 永久存储\nstorage.set('config', { theme: 'dark' });"
          },
          {
            "title": "进阶：支持命名空间",
            "code": "class NamespacedStorage extends Storage {\n  constructor(namespace, storage = localStorage) {\n    super(storage);\n    this.namespace = namespace;\n  }\n  \n  _getKey(key) {\n    return `${this.namespace}:${key}`;\n  }\n  \n  set(key, value, expire) {\n    super.set(this._getKey(key), value, expire);\n  }\n  \n  get(key) {\n    return super.get(this._getKey(key));\n  }\n  \n  remove(key) {\n    super.remove(this._getKey(key));\n  }\n  \n  // 清空当前命名空间\n  clear() {\n    const prefix = `${this.namespace}:`;\n    Object.keys(this.storage)\n      .filter(key => key.startsWith(prefix))\n      .forEach(key => this.storage.removeItem(key));\n  }\n}\n\n// 使用\nconst userStorage = new NamespacedStorage('user');\nconst appStorage = new NamespacedStorage('app');\n\nuserStorage.set('token', 'abc');\nappStorage.set('config', { theme: 'dark' });\n\n// localStorage中实际存储为：\n// 'user:token' -> 'abc'\n// 'app:config' -> '{\"theme\":\"dark\"}'"
          }
        ]
      },
      "source": "Storage封装"
    },

    // ========== 7. 判断题：IndexedDB ==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["IndexedDB"],
      "question": "IndexedDB是异步API，不会阻塞主线程",
      "correctAnswer": "A",
      "explanation": {
        "title": "IndexedDB特性：",
        "sections": [
          {
            "title": "正确！IndexedDB是异步的",
            "content": "IndexedDB使用异步API（基于事件或Promise），不会阻塞主线程，适合存储大量数据",
            "points": [
              "容量：几百MB甚至更多",
              "支持索引和事务",
              "可存储复杂对象",
              "异步操作不阻塞UI"
            ]
          },
          {
            "title": "基本使用",
            "code": "// 打开数据库\nconst request = indexedDB.open('MyDatabase', 1);\n\n// 创建对象仓库（类似表）\nrequest.onupgradeneeded = (e) => {\n  const db = e.target.result;\n  \n  // 创建对象仓库\n  const store = db.createObjectStore('users', {\n    keyPath: 'id',\n    autoIncrement: true\n  });\n  \n  // 创建索引\n  store.createIndex('name', 'name', { unique: false });\n  store.createIndex('email', 'email', { unique: true });\n};\n\n// 成功打开\nrequest.onsuccess = (e) => {\n  const db = e.target.result;\n  \n  // 开启事务\n  const transaction = db.transaction(['users'], 'readwrite');\n  const store = transaction.objectStore('users');\n  \n  // 添加数据\n  store.add({ name: 'John', email: 'john@example.com' });\n  \n  // 查询数据\n  const getRequest = store.get(1);\n  getRequest.onsuccess = () => {\n    console.log(getRequest.result);\n  };\n};"
          },
          {
            "title": "Promise封装",
            "code": "class IndexedDBHelper {\n  constructor(dbName, version = 1) {\n    this.dbName = dbName;\n    this.version = version;\n    this.db = null;\n  }\n  \n  // 打开数据库\n  async open(onUpgrade) {\n    return new Promise((resolve, reject) => {\n      const request = indexedDB.open(this.dbName, this.version);\n      \n      request.onerror = () => reject(request.error);\n      request.onsuccess = () => {\n        this.db = request.result;\n        resolve(this.db);\n      };\n      \n      request.onupgradeneeded = (e) => {\n        this.db = e.target.result;\n        onUpgrade(this.db, e);\n      };\n    });\n  }\n  \n  // 添加数据\n  async add(storeName, data) {\n    const transaction = this.db.transaction([storeName], 'readwrite');\n    const store = transaction.objectStore(storeName);\n    \n    return new Promise((resolve, reject) => {\n      const request = store.add(data);\n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  // 查询数据\n  async get(storeName, key) {\n    const transaction = this.db.transaction([storeName], 'readonly');\n    const store = transaction.objectStore(storeName);\n    \n    return new Promise((resolve, reject) => {\n      const request = store.get(key);\n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  // 查询所有\n  async getAll(storeName) {\n    const transaction = this.db.transaction([storeName], 'readonly');\n    const store = transaction.objectStore(storeName);\n    \n    return new Promise((resolve, reject) => {\n      const request = store.getAll();\n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n}\n\n// 使用\nconst db = new IndexedDBHelper('MyApp', 1);\n\nawait db.open((db) => {\n  const store = db.createObjectStore('users', { keyPath: 'id' });\n  store.createIndex('email', 'email', { unique: true });\n});\n\nawait db.add('users', { id: 1, name: 'John', email: 'john@example.com' });\nconst user = await db.get('users', 1);"
          }
        ]
      },
      "source": "IndexedDB"
    },

    // ========== 8. 多选题：存储安全 ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["安全性"],
      "question": "以下哪些是保护本地存储数据的方法？",
      "options": [
        "敏感数据加密后存储",
        "使用HttpOnly Cookie存储token",
        "设置CSP策略防止XSS",
        "使用HTTPS传输",
        "将所有数据存在localStorage",
        "定期清理过期数据"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "本地存储安全实践：",
        "sections": [
          {
            "title": "1. 加密敏感数据",
            "code": "// 使用Web Crypto API加密\nasync function encryptData(data, password) {\n  const encoder = new TextEncoder();\n  const dataBuffer = encoder.encode(data);\n  \n  // 生成密钥\n  const passwordBuffer = encoder.encode(password);\n  const keyMaterial = await crypto.subtle.importKey(\n    'raw',\n    passwordBuffer,\n    { name: 'PBKDF2' },\n    false,\n    ['deriveBits', 'deriveKey']\n  );\n  \n  const key = await crypto.subtle.deriveKey(\n    {\n      name: 'PBKDF2',\n      salt: encoder.encode('salt'),\n      iterations: 100000,\n      hash: 'SHA-256'\n    },\n    keyMaterial,\n    { name: 'AES-GCM', length: 256 },\n    false,\n    ['encrypt', 'decrypt']\n  );\n  \n  // 加密\n  const iv = crypto.getRandomValues(new Uint8Array(12));\n  const encrypted = await crypto.subtle.encrypt(\n    { name: 'AES-GCM', iv },\n    key,\n    dataBuffer\n  );\n  \n  return {\n    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),\n    iv: btoa(String.fromCharCode(...iv))\n  };\n}\n\n// 存储\nconst { encrypted, iv } = await encryptData('sensitive-data', 'password');\nlocalStorage.setItem('data', encrypted);\nlocalStorage.setItem('iv', iv);"
          },
          {
            "title": "2. HttpOnly Cookie",
            "code": "// ✅ 服务端设置（Node.js）\nres.cookie('token', 'jwt-token', {\n  httpOnly: true,    // JavaScript无法访问\n  secure: true,      // 仅HTTPS\n  sameSite: 'strict', // CSRF防护\n  maxAge: 3600000    // 1小时\n});\n\n// ❌ 不要在localStorage存储token\nlocalStorage.setItem('token', 'jwt-token'); // 易受XSS攻击"
          },
          {
            "title": "3. CSP策略",
            "code": "// HTML中设置\n<meta http-equiv=\"Content-Security-Policy\" \n      content=\"default-src 'self'; script-src 'self' 'unsafe-inline'\">\n\n// HTTP响应头\nContent-Security-Policy: default-src 'self'; script-src 'self'\n\n// 防止XSS注入脚本访问Storage"
          },
          {
            "title": "4. 输入验证和清理",
            "code": "// ❌ 危险：直接存储用户输入\nconst userInput = document.querySelector('input').value;\nlocalStorage.setItem('data', userInput);\ndocument.body.innerHTML = localStorage.getItem('data'); // XSS!\n\n// ✅ 安全：清理和验证\nfunction sanitize(input) {\n  const div = document.createElement('div');\n  div.textContent = input;\n  return div.innerHTML;\n}\n\nconst safe = sanitize(userInput);\nlocalStorage.setItem('data', safe);"
          },
          {
            "title": "5. 最佳实践总结",
            "code": "// ✅ 推荐\n// - 敏感数据（token）用HttpOnly Cookie\n// - 非敏感数据用localStorage\n// - 加密重要数据\n// - 使用HTTPS\n// - 设置CSP\n// - 定期清理过期数据\n// - 限制存储容量\n\n// ❌ 避免\n// - 在localStorage存储密码、token\n// - 存储未验证的用户输入\n// - 在HTTP环境使用\n// - 忽略XSS防护"
          }
        ]
      },
      "source": "存储安全"
    },

    // ========== 9. 代码输出题：Storage同步问题 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["同步问题"],
      "question": "以下代码的输出是什么？",
      "code": "localStorage.setItem('count', '0');\n\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => {\n    const count = parseInt(localStorage.getItem('count'));\n    localStorage.setItem('count', count + 1);\n    console.log(localStorage.getItem('count'));\n  }, 0);\n}\n\nsetTimeout(() => {\n  console.log('final:', localStorage.getItem('count'));\n}, 100);",
      "options": [
        "1, 2, 3, final: 3",
        "1, 1, 1, final: 1",
        "取决于执行顺序",
        "3, 3, 3, final: 3"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "localStorage同步特性：",
        "sections": [
          {
            "title": "localStorage是同步的",
            "content": "虽然setTimeout是异步的，但localStorage的读写是同步操作，每个setTimeout回调执行时都能读到最新值",
            "code": "// 执行流程\n// 1. 设置count=0\nlocalStorage.setItem('count', '0');\n\n// 2. 三个setTimeout进入宏任务队列\n\n// 3. 第一个setTimeout执行\n//    count = 0, 设置为1, 输出: 1\n\n// 4. 第二个setTimeout执行\n//    count = 1, 设置为2, 输出: 2\n\n// 5. 第三个setTimeout执行\n//    count = 2, 设置为3, 输出: 3\n\n// 6. 最后的setTimeout执行\n//    输出: final: 3"
          },
          {
            "title": "并发问题",
            "code": "// ⚠️ 潜在问题：多标签页并发写入\n// 标签页A和B同时执行\n\n// 标签页A\nconst count = localStorage.getItem('count'); // 读取: 10\n// ... 一些操作\nlocalStorage.setItem('count', count + 1);   // 写入: 11\n\n// 标签页B（几乎同时）\nconst count = localStorage.getItem('count'); // 读取: 10\nlocalStorage.setItem('count', count + 1);   // 写入: 11\n\n// 结果：应该是12，实际是11（丢失一次更新）\n\n// ✅ 解决：使用storage事件协调\nwindow.addEventListener('storage', (e) => {\n  if (e.key === 'count') {\n    // 重新读取最新值\n    updateCount(e.newValue);\n  }\n});"
          },
          {
            "title": "原子操作封装",
            "code": "// 实现原子性更新\nfunction atomicUpdate(key, updater) {\n  const lockKey = `${key}_lock`;\n  \n  // 简单的锁机制（仅示例，实际需要更复杂的实现）\n  const lock = localStorage.getItem(lockKey);\n  if (lock) {\n    // 已被锁定，等待重试\n    setTimeout(() => atomicUpdate(key, updater), 10);\n    return;\n  }\n  \n  try {\n    localStorage.setItem(lockKey, 'true');\n    \n    const value = localStorage.getItem(key);\n    const newValue = updater(value);\n    localStorage.setItem(key, newValue);\n    \n    return newValue;\n  } finally {\n    localStorage.removeItem(lockKey);\n  }\n}\n\n// 使用\natomicUpdate('count', (val) => parseInt(val || 0) + 1);"
          }
        ]
      },
      "source": "同步问题"
    },

    // ========== 10. 代码补全题：Storage工具类 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["工具封装"],
      "question": "实现一个完整的Storage工具类，支持过期、加密、命名空间，空白处填什么？",
      "code": "class SmartStorage {\n  constructor(options = {}) {\n    this.storage = options.storage || localStorage;\n    this.namespace = options.namespace || '';\n    this.encrypt = options.encrypt || false;\n  }\n  \n  _getKey(key) {\n    return this.namespace ? `${this.namespace}:${key}` : key;\n  }\n  \n  set(key, value, expire) {\n    const data = {\n      value,\n      expire: expire ? ______ : null\n    };\n    \n    const json = JSON.stringify(data);\n    const stored = this.encrypt ? this._encrypt(json) : json;\n    \n    this.storage.setItem(this._getKey(key), stored);\n  }\n}",
      "options": [
        "Date.now() + expire",
        "new Date().getTime() + expire",
        "Date.now() + expire * 1000",
        "expire"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "完整Storage工具类：",
        "sections": [
          {
            "title": "完整实现",
            "code": "class SmartStorage {\n  constructor(options = {}) {\n    this.storage = options.storage || localStorage;\n    this.namespace = options.namespace || '';\n    this.encryptKey = options.encryptKey;\n  }\n  \n  _getKey(key) {\n    return this.namespace ? `${this.namespace}:${key}` : key;\n  }\n  \n  // 简单加密（仅示例，生产环境用Web Crypto API）\n  _encrypt(data) {\n    if (!this.encryptKey) return data;\n    return btoa(data); // Base64编码\n  }\n  \n  _decrypt(data) {\n    if (!this.encryptKey) return data;\n    return atob(data); // Base64解码\n  }\n  \n  set(key, value, expire) {\n    try {\n      const data = {\n        value,\n        expire: expire ? Date.now() + expire : null,\n        createTime: Date.now()\n      };\n      \n      const json = JSON.stringify(data);\n      const stored = this._encrypt(json);\n      \n      this.storage.setItem(this._getKey(key), stored);\n      return true;\n    } catch (e) {\n      console.error('Storage set error:', e);\n      return false;\n    }\n  }\n  \n  get(key) {\n    try {\n      const item = this.storage.getItem(this._getKey(key));\n      if (!item) return null;\n      \n      const json = this._decrypt(item);\n      const data = JSON.parse(json);\n      \n      // 检查过期\n      if (data.expire && Date.now() > data.expire) {\n        this.remove(key);\n        return null;\n      }\n      \n      return data.value;\n    } catch (e) {\n      console.error('Storage get error:', e);\n      return null;\n    }\n  }\n  \n  remove(key) {\n    this.storage.removeItem(this._getKey(key));\n  }\n  \n  clear() {\n    if (this.namespace) {\n      // 只清除当前命名空间\n      const prefix = `${this.namespace}:`;\n      Object.keys(this.storage)\n        .filter(key => key.startsWith(prefix))\n        .forEach(key => this.storage.removeItem(key));\n    } else {\n      this.storage.clear();\n    }\n  }\n  \n  keys() {\n    const prefix = this.namespace ? `${this.namespace}:` : '';\n    return Object.keys(this.storage)\n      .filter(key => !prefix || key.startsWith(prefix))\n      .map(key => key.replace(prefix, ''));\n  }\n  \n  has(key) {\n    return this.get(key) !== null;\n  }\n  \n  // 获取存储大小\n  size() {\n    let size = 0;\n    this.keys().forEach(key => {\n      const item = this.storage.getItem(this._getKey(key));\n      size += item ? item.length : 0;\n    });\n    return size;\n  }\n  \n  // 清除过期数据\n  clearExpired() {\n    this.keys().forEach(key => {\n      this.get(key); // 自动删除过期数据\n    });\n  }\n}\n\n// 使用示例\nconst userStorage = new SmartStorage({\n  namespace: 'user',\n  encryptKey: 'secret-key'\n});\n\n// 存储1小时\nuserStorage.set('token', 'abc123', 3600000);\n\n// 永久存储\nuserStorage.set('preferences', { theme: 'dark' });\n\n// 读取\nconst token = userStorage.get('token');\n\n// 检查\nif (userStorage.has('token')) {\n  console.log('已登录');\n}\n\n// 清理过期\nuserStorage.clearExpired();"
          }
        ]
      },
      "source": "工具封装"
    }
  ],
  "navigation": {
    "prev": {
      "title": "事件处理",
      "url": "../advanced/10-event-handling.html"
    },
    "next": {
      "title": "浏览器导航",
      "url": "11-browser-navigation.html"
    }
  }
};
