# 第 26 章：Starter 依赖管理与 BOM

## 本章概述

深入讲解 Starter 的依赖管理策略、版本控制、依赖传递和 BOM（Bill of Materials）的使用。

**学习目标：**
- 掌握依赖管理最佳实践
- 理解依赖传递机制
- 学会使用 BOM 统一版本管理
- 避免依赖冲突

---

## 26.1 依赖分类

### 必需依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
```

### 可选依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <optional>true</optional>
</dependency>
```

### provided 依赖

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>
```

---

## 26.2 版本管理

### 使用 properties 统一版本

```xml
<properties>
    <spring-boot.version>3.2.0</spring-boot.version>
    <mybatis.version>3.5.13</mybatis.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>${mybatis.version}</version>
    </dependency>
</dependencies>
```

### 使用 dependencyManagement

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## 26.3 BOM 使用

### 创建 BOM

```xml
<!-- my-dependencies-bom/pom.xml -->
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-dependencies-bom</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.example</groupId>
                <artifactId>my-core</artifactId>
                <version>1.0.0</version>
            </dependency>
            <dependency>
                <groupId>com.example</groupId>
                <artifactId>my-utils</artifactId>
                <version>1.0.0</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

### 使用 BOM

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>my-dependencies-bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>my-core</artifactId>
        <!-- 版本由 BOM 管理，无需指定 -->
    </dependency>
</dependencies>
```

---

## 26.4 依赖冲突解决

### 排除冲突依赖

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>some-lib</artifactId>
    <version>1.0.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 使用 Maven Enforcer Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-enforcer-plugin</artifactId>
    <executions>
        <execution>
            <goals>
                <goal>enforce</goal>
            </goals>
            <configuration>
                <rules>
                    <dependencyConvergence/>
                    <bannedDependencies>
                        <excludes>
                            <exclude>commons-logging</exclude>
                        </excludes>
                    </bannedDependencies>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

## 26.5 本章小结

**核心要点：**
1. 合理使用 optional 和 provided scope
2. 使用 properties 统一版本管理
3. 使用 BOM 简化依赖管理
4. 及时排除冲突依赖
5. 使用 Maven 插件检测依赖问题

**相关章节：**
- [第 25 章：基础 Starter 开发实战](./content-25.md)
- [第 27 章：配置提示与文档](./content-27.md)
