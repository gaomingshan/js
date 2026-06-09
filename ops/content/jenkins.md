# Jenkins 部署指南

> 版本：2.479 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | OpenJDK 17 (LTS) |
| 内存 | ≥ 2GB (推荐 4GB+) |
| 磁盘 | ≥ 20GB (`JENKINS_HOME`) |
| 用户 | 非 root 运行，专用 jenkins 用户 |

## 2. 裸机安装（通用）

```bash
# === Java 17 ===
wget -qO- https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jdk_x64_linux_hotspot_17.0.12_7.tar.gz \
  | tar xz -C /opt
cat > /etc/profile.d/java.sh << 'EOF'
export JAVA_HOME=/opt/jdk-17.0.12+7
export PATH=$JAVA_HOME/bin:$PATH
EOF
source /etc/profile.d/java.sh

# === Jenkins war ===
wget -O /opt/jenkins.war https://get.jenkins.io/war-stable/2.479.1/jenkins.war
useradd -r -s /bin/false jenkins
mkdir -p /var/jenkins_home && chown jenkins:jenkins /var/jenkins_home

# === systemd 服务 ===
cat > /etc/systemd/system/jenkins.service << 'EOF'
[Unit]
Description=Jenkins Continuous Integration Server
After=network.target

[Service]
User=jenkins
Type=simple
Environment="JENKINS_HOME=/var/jenkins_home"
ExecStart=/opt/jdk-17.0.12+7/bin/java -jar /opt/jenkins.war --httpPort=8080
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable --now jenkins
```

**验证**：

```bash
curl -sI http://localhost:8080 | head -1
# HTTP/1.1 200 OK
journalctl -u jenkins -n 20 --no-pager
```

## 3. 基础部署

**适用场景**：开发测试环境、小团队 CI，快速启动

**配置**：Docker 方式无需额外配置，环境变量控制启动参数

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

> **⚠️ 挂载 Docker Socket 安全风险**：容器获得宿主 root 权限，可执行任意 Docker 命令。**仅限开发环境**，生产请使用 Kaniko。

**验证**：

```bash
docker logs -f jenkins
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
# 浏览器访问 http://localhost:8080 完成安装向导
```

**Docker Compose**：

```yaml
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

volumes:
  jenkins-home:
```

## 4. 生产部署

**适用场景**：生产 CI/CD、多 Agent 分布式构建、与 K8s 集成

**配置**：

使用 Kaniko 替代 Docker Socket 构建镜像，消除 root 提权风险。

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins-home:/var/jenkins_home \
  -e JAVA_OPTS="-Xmx4g -Djenkins.install.runSetupWizard=false" \
  -e JENKINS_OPTS="--prefix=/jenkins" \
  --restart unless-stopped \
  jenkins/jenkins:lts
```

**Kaniko 构建（替代 DinD/Docker Socket）**：

```groovy
pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:latest
    args:
      - --context=git://github.com/user/repo.git
      - --destination=harbor.example.com/project/myapp:latest
      - --cache=true
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker
  volumes:
  - name: docker-config
    secret:
      secretName: docker-config
"""
        }
    }
    stages {
        stage('Build') {
            steps {
                container('kaniko') {
                    sh 'echo "Kaniko builds image without Docker daemon"'
                }
            }
        }
    }
}
```

| Kaniko 优势 | 说明 |
|-------------|------|
| 无 Docker daemon | rootless，无需特权模式 |
| 无 Socket 挂载 | 消除提权风险 |
| 天然 K8s 友好 | 适合 K8s Agent 构建 Pod |
| Layer 缓存 | `--cache=true` 加速后续构建 |

**验证**：

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
# UI → 安装推荐插件 → 创建 admin 用户 → 配置 K8s Agent
```

**Docker Compose**：

```yaml
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    environment:
      JAVA_OPTS: "-Xmx4g"
      JENKINS_OPTS: "--prefix=/jenkins"
    volumes:
      - jenkins-home:/var/jenkins_home
      # 不挂载 docker.sock，使用 Kaniko 构建

volumes:
  jenkins-home:
```

## 5. 运维速查

```bash
# 备份
tar czf jenkins-home-backup-$(date +%Y%m%d).tar.gz /var/jenkins_home

# 重启
docker restart jenkins

# 查看日志
docker logs -f jenkins

# 插件管理
# UI → Manage Jenkins → Plugin Manager

# 凭据管理
# UI → Manage Jenkins → Credentials

# 安全配置
# 启用 RBAC：Manage Jenkins → Security → Authorization → Role-Based Strategy
# 配置 LDAP/SSO：Manage Jenkins → Security → Security Realm
# 禁用 Script Approval：Manage Jenkins → In-process Script Approval
```

## 6. 常见故障

### 6.1 端口冲突
```bash
netstat -tlnp | grep 8080
# 修改 --httpPort=8081 或停止占用进程
```

### 6.2 JENKINS_HOME 磁盘满
```bash
du -sh /var/jenkins_home/
# 清理：Job → Build History → Delete old builds
# 日志：Manage Jenkins → Log Recorder → 调整级别
# 使用 thinBackup 插件管理备份
```

### 6.3 插件安装失败
- 检查代理：`Manage Jenkins → Manage Plugins → Advanced → Proxy`
- 离线安装：下载 `.hpi` → `Advanced → Upload Plugin`
- 日志：`docker logs jenkins | grep -i error`

### 6.4 Docker Socket 权限拒绝
```
docker: permission denied while trying to connect to the Docker daemon socket
```
非 root 容器内用户无权限访问 docker socket。生产应使用 Kaniko，不挂载 docker socket。
