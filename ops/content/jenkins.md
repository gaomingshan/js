# Jenkins 部署运维指南

> **定位**：最流行的开源 CI/CD 服务器
> **适用场景**：持续集成、持续部署、自动化构建、Pipeline 编排
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Jenkins 是开源的自动化服务器，以 Pipeline（Jenkinsfile）为核心，支持 1800+ 插件，覆盖构建/测试/部署/通知全流程。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **Pipeline** | Jenkinsfile 声明式/脚本式流水线 |
| **多分支** | 自动发现 Git 分支创建 Pipeline |
| **共享库** | 共享 Pipeline 代码 |
| **Agent** | Master-Agent 分布式构建 |
| **1800+ 插件** | 覆盖几乎所有工具 |

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins-home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  jenkins/jenkins:lts
```

> **挂载 Docker Socket**：允许 Jenkins 在容器内构建 Docker 镜像

### 2.2 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    environment:
      JENKINS_OPTS: "--prefix=/jenkins"
    volumes:
      - jenkins-home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - jenkins-net

volumes:
  jenkins-home:

networks:
  jenkins-net:
    driver: bridge
```

**初始密码**：`docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`

---

## 3. 配置

### 3.2 生产环境配置

**Jenkinsfile 示例**：

```groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: maven
                image: maven:3.9
                command: ['sleep', '99']
                ttyEnabled: true
              - name: docker
                image: docker:24
                command: ['sleep', '99']
                ttyEnabled: true
            '''
        }
    }
    stages {
        stage('Build') {
            steps {
                container('maven') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        stage('Test') {
            steps {
                container('maven') {
                    sh 'mvn test'
                }
            }
        }
        stage('Build Image') {
            steps {
                container('docker') {
                    sh 'docker build -t myapp:${BUILD_NUMBER} .'
                    sh 'docker push harbor.example.com/project/myapp:${BUILD_NUMBER}'
                }
            }
        }
        stage('Deploy') {
            steps {
                sh 'kubectl set image deployment/myapp myapp=harbor.example.com/project/myapp:${BUILD_NUMBER}'
            }
        }
    }
}
```

**安全清单**：启用 RBAC、配置 LDAP/SSO、限制 Agent 权限、凭据管理（Credentials Plugin）、禁止 Script Approval 危险操作

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| 执行器数 | Master 并发构建数 | 2-5 | Master 只做调度，构建在 Agent |
| Agent 数 | 构建节点数 | 按需 | K8s 动态 Agent 按需创建 |
| JVM 堆 | Master 内存 | 2G-4G | `--java_OPTS="-Xmx4g"` |

---

## 5. 运维

```bash
# 备份
# 备份 /var/jenkins_home 目录
# 或使用 thinBackup 插件

# 插件管理
# UI → Manage Jenkins → Plugin Manager

# 凭据管理
# UI → Manage Jenkins → Credentials
```

---

## 7. 参考资料

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
