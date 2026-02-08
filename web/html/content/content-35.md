# 小程序与跨端框架

## 核心概念

小程序和跨端框架使用类 HTML 语法，但运行机制与 Web 不同。

## 小程序的类 HTML 语法

### 微信小程序 WXML

```xml
<!-- WXML -->
<view class="container">
  <text>{{message}}</text>
  <button bindtap="handleClick">点击</button>
  
  <block wx:for="{{items}}" wx:key="id">
    <view>{{item.name}}</view>
  </block>
</view>
```

**特点**：
- 类似 HTML 但不是 HTML
- 有独特的标签（`<view>`, `<text>`）
- 不支持 DOM API
- 双向数据绑定

### 支付宝小程序 AXML

```xml
<!-- AXML -->
<view class="container">
  <text>{{message}}</text>
  <button onTap="handleClick">点击</button>
  
  <block a:for="{{items}}">
    <view>{{item.name}}</view>
  </block>
</view>
```

## React Native 中的 HTML 概念映射

```jsx
// React Native
import { View, Text, Button } from 'react-native';

function App() {
  return (
    <View style={styles.container}>
      <Text>Hello</Text>
      <Button title="点击" onPress={handleClick} />
    </View>
  );
}

// 对比 Web
<div className="container">
  <span>Hello</span>
  <button onClick={handleClick}>点击</button>
</div>
```

**映射关系**：
```
<div>     → <View>
<span>    → <Text>
<img>     → <Image>
<input>   → <TextInput>
<button>  → <Button> / <TouchableOpacity>
```

## Flutter 中的声明式 UI

```dart
// Flutter
Widget build(BuildContext context) {
  return Container(
    child: Column(
      children: [
        Text('Hello'),
        ElevatedButton(
          child: Text('点击'),
          onPressed: handleClick,
        ),
      ],
    ),
  );
}
```

**特点**：
- 完全不同的语法（Dart）
- 但概念相似（组件树）

## 跨端渲染的本质

```
Web:
HTML → DOM → 浏览器渲染

小程序:
WXML → 虚拟 DOM → 小程序渲染层

React Native:
JSX → Virtual DOM → 原生组件

Flutter:
Widget → RenderObject → Skia 渲染
```

**共同点**：
1. 声明式 UI
2. 组件化
3. 数据驱动

**差异**：
1. 渲染引擎不同
2. API 不同
3. 性能特性不同

## Uni-app 跨端方案

```vue
<!-- 一套代码，多端运行 -->
<template>
  <view class="container">
    <text>{{message}}</text>
    <button @click="handleClick">点击</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  methods: {
    handleClick() {
      // 跨端 API
      uni.showToast({
        title: '点击'
      });
    }
  }
}
</script>
```

**编译目标**：
- H5（Web）
- 微信小程序
- 支付宝小程序
- App（React Native）

**后端类比**：跨端框架 ≈ 跨平台开发（Java、Go）。

## 参考资源

- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [React Native](https://reactnative.dev/)
- [Flutter](https://flutter.dev/)
- [Uni-app](https://uniapp.dcloud.io/)
