# 第 17 章：嵌入式容器架构设计

## 本章概述

深入讲解 Spring Boot 嵌入式容器的架构设计，理解可执行 jar 原理和 FatJar 与传统 war 的对比。

**学习目标：**
- 理解嵌入式容器的工作原理
- 掌握可执行 jar 的结构
- 理解 FatJar 与传统部署的区别

---

## 17.1 嵌入式容器概念

### 传统部署 vs 嵌入式部署

**传统部署：**
```
应用（war） → 部署到 → Tomcat（独立安装）
```

**嵌入式部署：**
```
应用（jar，内含 Tomcat） → 直接运行
```

---

## 17.2 可执行 Jar 结构

### 目录结构

```
myapp.jar
├── BOOT-INF/
│   ├── classes/              # 应用类文件
│   │   └── com/example/
│   ├── lib/                  # 应用依赖
│   │   ├── spring-*.jar
│   │   └── tomcat-embed-core-*.jar
│   └── classpath.idx         # 类路径索引
├── META-INF/
│   ├── MANIFEST.MF           # 清单文件
│   └── maven/
└── org/
    └── springframework/
        └── boot/
            └── loader/       # Spring Boot 类加载器
```

### MANIFEST.MF

```
Manifest-Version: 1.0
Main-Class: org.springframework.boot.loader.JarLauncher
Start-Class: com.example.DemoApplication
Spring-Boot-Version: 3.2.0
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/
```

---

## 17.3 JarLauncher 启动流程

### 启动过程

```
1. java -jar myapp.jar
    ↓
2. JVM 调用 JarLauncher.main()
    ↓
3. 创建自定义 ClassLoader
    ↓
4. 加载 BOOT-INF/classes/ 和 BOOT-INF/lib/
    ↓
5. 调用 Start-Class（DemoApplication.main）
    ↓
6. SpringApplication.run()
    ↓
7. 启动嵌入式 Tomcat
```

---

## 17.4 FatJar vs War

| 对比项 | FatJar | War |
|--------|--------|-----|
| **部署方式** | 独立运行 | 部署到容器 |
| **依赖管理** | 包含所有依赖 | 依赖容器提供 |
| **容器** | 嵌入式 | 外部 |
| **启动方式** | `java -jar` | Tomcat 启动 |
| **适用场景** | 微服务、云原生 | 传统企业应用 |

---

## 17.5 本章小结

**核心要点：**
1. 嵌入式容器将应用和容器打包在一起
2. 可执行 jar 通过 JarLauncher 启动
3. FatJar 包含所有依赖，独立运行
4. 适合微服务和云原生应用

**相关章节：**
- [第 18 章：ServletWebServerFactory 机制](./content-18.md)
- [第 19 章：容器自动配置源码](./content-19.md)
