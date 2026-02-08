# 12. 前端框架中的 TypeScript

## 概述

TypeScript 在现代前端框架中已成为标配。本节介绍 React、Vue 与状态管理库的类型实践。

---

## 12.1 React + TypeScript

### 函数组件与 Props

```typescript
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function Button({
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${type} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

// 使用
<Button type="primary" onClick={() => console.log('clicked')}>
  Click me
</Button>
```

### Hooks 的类型

```typescript
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);

// useReducer
type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });

// 自定义 Hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}
```

### 事件类型

```typescript
// 鼠标事件
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.value);
}

// 表单事件
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
}

// 输入事件
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value);
}

// 键盘事件
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    console.log('Enter pressed');
  }
}
```

### 泛型组件

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

<List<User>
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>;
```

---

## 12.2 Vue + TypeScript

### Composition API

```typescript
import { ref, computed, onMounted, Ref } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
}

export default defineComponent({
  setup() {
    const user = ref<User | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<Error | null>(null);

    const displayName = computed(() => {
      return user.value ? user.value.name : 'Guest';
    });

    async function fetchUser(id: number) {
      loading.value = true;
      try {
        const response = await fetch(`/api/user/${id}`);
        user.value = await response.json();
      } catch (e) {
        error.value = e as Error;
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      fetchUser(1);
    });

    return {
      user,
      loading,
      error,
      displayName,
      fetchUser
    };
  }
});
```

### Props 定义

```typescript
import { defineComponent, PropType } from 'vue';

interface User {
  id: number;
  name: string;
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    console.log(props.user.name); // 类型安全
  }
});
```

### Emits 定义

```typescript
export default defineComponent({
  emits: {
    submit: (payload: { name: string; email: string }) => {
      return payload.name.length > 0 && payload.email.includes('@');
    },
    cancel: null
  },
  setup(props, { emit }) {
    function handleSubmit() {
      emit('submit', { name: 'Alice', email: 'alice@example.com' });
    }

    function handleCancel() {
      emit('cancel');
    }

    return { handleSubmit, handleCancel };
  }
});
```

### 自定义 Composable

```typescript
export function useAsync<T>(fn: () => Promise<T>) {
  const data = ref<T | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  async function execute() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fn();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, execute };
}

// 使用
const { data, loading, error, execute } = useAsync(() => fetchUser(1));
```

---

## 12.3 状态管理库的类型设计

### Redux Toolkit

```typescript
import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    }
  }
});

export const { setUsers, addUser, setLoading } = userSlice.actions;

// Store
const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
});

// 类型推导
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 使用
const users = useAppSelector(state => state.user.users);
const dispatch = useAppDispatch();
dispatch(addUser({ id: 1, name: 'Alice' }));
```

### Pinia (Vue)

```typescript
import { defineStore } from 'pinia';

interface User {
  id: number;
  name: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    loading: false,
    error: null as Error | null
  }),
  
  getters: {
    userCount: (state) => state.users.length,
    getUserById: (state) => (id: number) => {
      return state.users.find(user => user.id === id);
    }
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await fetch('/api/users');
        this.users = await response.json();
      } catch (e) {
        this.error = e as Error;
      } finally {
        this.loading = false;
      }
    },
    
    addUser(user: User) {
      this.users.push(user);
    }
  }
});

// 使用
const userStore = useUserStore();
userStore.fetchUsers();
console.log(userStore.userCount);
```

---

## 12.4 路由库的类型安全

### React Router

```typescript
import { useParams, useNavigate } from 'react-router-dom';

// 定义路由参数类型
interface UserParams {
  userId: string;
}

function UserProfile() {
  const { userId } = useParams<UserParams>();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchUser(parseInt(userId));
    }
  }, [userId]);

  return <div>User ID: {userId}</div>;
}

// 类型安全的导航
type RouteParams = {
  '/': {};
  '/user/:userId': { userId: string };
  '/post/:postId': { postId: string };
};

function navigateTo<T extends keyof RouteParams>(
  path: T,
  params: RouteParams[T]
): string {
  let result: string = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value));
  }
  return result;
}

navigate(navigateTo('/user/:userId', { userId: '123' }));
```

### Vue Router

```typescript
import { createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('@/views/User.vue'),
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 类型安全的导航
router.push({ name: 'user', params: { id: '123' } });
```

---

## 前端工程实践

### 场景 1：React 表单组件

```typescript
interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const validate = (validationRules: Partial<Record<keyof T, (value: any) => string | undefined>>) => {
    const newErrors: FormErrors = {};
    for (const [key, rule] of Object.entries(validationRules)) {
      const error = rule(values[key as keyof T]);
      if (error) {
        newErrors[key] = error;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { values, errors, handleChange, validate };
}

function RegisterForm() {
  const { values, errors, handleChange, validate } = useForm<FormData>({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate({
      username: (v) => v.length < 3 ? 'Too short' : undefined,
      email: (v) => !v.includes('@') ? 'Invalid email' : undefined
    });
    if (isValid) {
      console.log('Submit', values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" value={values.username} onChange={handleChange} />
      {errors.username && <span>{errors.username}</span>}
    </form>
  );
}
```

### 场景 2：Vue 数据表格组件

```typescript
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T;
}

export default defineComponent({
  name: 'DataTable',
  props: {
    data: {
      type: Array as PropType<any[]>,
      required: true
    },
    columns: {
      type: Array as PropType<Column<any>[]>,
      required: true
    },
    rowKey: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const sortedData = computed(() => {
      // 排序逻辑
      return props.data;
    });

    return { sortedData };
  }
});
```

---

## 关键要点

1. **React** 函数组件使用接口定义 Props，事件类型需明确指定
2. **Hooks** 通过泛型参数指定状态类型，useRef 需指定元素类型
3. **Vue** Composition API 使用 ref/reactive 管理响应式数据
4. **状态管理**利用类型推导获取 State 和 Dispatch 类型
5. **路由**定义路由参数类型，实现类型安全的导航
6. **泛型组件**提供更灵活的类型支持，适合列表、表格等通用组件

---

## 参考资料

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vue 3 TypeScript Support](https://vuejs.org/guide/typescript/overview.html)
- [Redux Toolkit with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [Pinia TypeScript](https://pinia.vuejs.org/core-concepts/)
