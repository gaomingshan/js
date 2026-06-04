# GitLab CI 部署运维指南

> **定位**：GitLab 内置的 CI/CD 系统，代码托管 + 流水线一体
> **适用场景**：持续集成、持续部署、代码审查 + 自动化流水线
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

GitLab CI 是 GitLab 内置的 CI/CD 系统，通过 `.gitlab-ci.yml` 定义流水线，Runner 执行构建/测试/部署任务，与代码仓库深度集成。

### 1.2 核心架构

```
.gitlab-ci.yml → GitLab Server → Runner (Shell/Docker/K8s) → Pipeline → Job
```

| 组件 | 职责 |
|------|------|
| **GitLab Server** | 流水线调度、状态管理 |
| **Runner** | 执行 Job 的 Agent |
| **Pipeline** | 流水线，由 Stage 组成 |
| **Job** | 具体任务，属于某个 Stage |
| **Artifact** | Job 产出物 |

### 1.3 适用场景

**最佳适用**：代码托管 + CI/CD 一体化、Docker/K8s 部署、多环境流水线

**不适用**：纯 CI/CD（→ Jenkins 更灵活）、GitOps（→ ArgoCD）

---

## 2. 部署

### 2.1 GitLab Runner 安装

```bash
# 添加仓库
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash
sudo yum install -y gitlab-runner

# 注册 Runner
sudo gitlab-runner register \
  --gitlab-url https://gitlab.example.com \
  --registration-token <token> \
  --executor docker \
  --docker-image maven:3.9 \
  --description "docker-runner" \
  --tag-list "docker,maven"

# 启动
sudo systemctl start gitlab-runner && sudo systemctl enable gitlab-runner
```

### 2.2 Docker 部署 Runner

```bash
docker run -d \
  --name gitlab-runner \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v gitlab-runner-config:/etc/gitlab-runner \
  gitlab/gitlab-runner:alpine-v16.11

# 注册
docker exec -it gitlab-runner gitlab-runner register \
  --gitlab-url https://gitlab.example.com \
  --registration-token <token> \
  --executor docker \
  --docker-image maven:3.9
```

---

## 3. 配置文件

### 3.2 .gitlab-ci.yml 示例

```yaml
# .gitlab-ci.yml — Spring Boot 项目

stages:
  - build
  - test
  - package
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  DOCKER_REGISTRY: harbor.example.com
  APP_NAME: myapp

# === 缓存 ===
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .m2/repository/
  # 逻辑：缓存 Maven 依赖，加速后续构建

# === 构建阶段 ===
build:
  stage: build
  image: maven:3.9
  script:
    - mvn clean compile $MAVEN_OPTS
  artifacts:
    paths:
      - target/
    expire_in: 1 hour
  # 逻辑：artifacts 传递构建产物到下一阶段
  # expire_in 控制保留时间，减少存储占用

# === 测试阶段 ===
test:
  stage: test
  image: maven:3.9
  script:
    - mvn test $MAVEN_OPTS
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit:
        - target/surefire-reports/TEST-*.xml

# === 打包阶段 ===
package:
  stage: package
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $DOCKER_REGISTRY/project/$APP_NAME:$CI_COMMIT_SHORT_SHA .
    - docker login -u $REGISTRY_USER -p $REGISTRY_PASSWORD $DOCKER_REGISTRY
    - docker push $DOCKER_REGISTRY/project/$APP_NAME:$CI_COMMIT_SHORT_SHA
  only:
    - main
    - tags
  # 逻辑：only 限制只在 main 和 tag 分支执行

# === 部署阶段 ===
deploy-prod:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_REGISTRY/project/$APP_NAME:$CI_COMMIT_SHORT_SHA -n prod
  environment:
    name: production
    url: https://app.example.com
  only:
    - tags
  when: manual
  # 逻辑：when: manual → 手动触发部署，防止自动上生产
```

### 3.3 Runner 配置

```toml
# /etc/gitlab-runner/config.toml

[[runners]]
  name = "docker-runner"
  url = "https://gitlab.example.com"
  token = "<token>"
  executor = "docker"

  [runners.docker]
    image = "maven:3.9"
    privileged = true              # Docker-in-Docker 需要
    volumes = ["/cache"]
    pull_policy = ["if-not-present"]
    # 逻辑：if-not-present → 本地有则不拉取，加速构建

  [runners.cache]
    Type = "s3"
    Shared = true
    [runners.cache.s3]
      ServerAddress = "minio:9000"
      BucketName = "runner-cache"
      AccessKey = "minioadmin"
      SecretKey = "minioadmin"
    # 逻辑：Runner 缓存存 S3/MinIO，跨 Job 共享
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `concurrent` | Runner 并发 Job 数 | 10 | `config.toml` 全局设置，防止过载 |
| `pull_policy` | 镜像拉取策略 | if-not-present | 本地有则不拉取，加速构建 |
| 缓存 | 依赖缓存 | S3/MinIO | 跨 Job 共享 Maven/npm 缓存 |
| `privileged` | 特权模式 | true（DinD） | Docker-in-Docker 构建需要 |

---

## 5. 运维

```bash
# Runner 管理
sudo gitlab-runner list
sudo gitlab-runner verify
sudo gitlab-runner restart

# 查看日志
sudo journalctl -u gitlab-runner -f
```

---

## 7. 参考资料

- [GitLab CI Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab Runner](https://docs.gitlab.com/runner/)
- [.gitlab-ci.yml Reference](https://docs.gitlab.com/ee/ci/yaml/)
