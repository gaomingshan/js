# GitLab CI 部署指南

> 版本：17.3 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| OS | CentOS 7.9+ / Ubuntu 22.04+ |
| 内存 | ≥ 4GB (Omnibus 单机推荐 8GB+) |
| 磁盘 | ≥ 50GB (仓库 + CI 产物) |
| Runner | 独立于 GitLab Server 部署 |

## 2. 裸机安装（通用）

### 2.1 GitLab Server（Omnibus）

```bash
# === CentOS 7/8/9 ===
curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | bash
yum install -y gitlab-ee

# === Ubuntu 22.04 ===
curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.deb.sh | bash
apt install -y gitlab-ee
```

**配置**：

```bash
cat > /etc/gitlab/gitlab.rb << 'EOF'
# 外部访问 URL（必须配置）
external_url 'https://gitlab.example.com'

# 时区
gitlab_rails['time_zone'] = 'Asia/Shanghai'

# 邮件
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "smtp.example.com"
gitlab_rails['smtp_port'] = 587
gitlab_rails['smtp_user_name'] = "gitlab@example.com"
gitlab_rails['smtp_password'] = "your-password"
gitlab_rails['smtp_domain'] = "example.com"
gitlab_rails['smtp_authentication'] = "login"
gitlab_rails['smtp_enable_starttls_auto'] = true

# 仓库存储
gitlab_rails['storage_path'] = "/var/opt/gitlab/git-data"

# CI 制品保留
gitlab_rails['artifacts_expire_hours'] = 48
EOF
```

```bash
# 应用配置
sudo gitlab-ctl reconfigure

# 获取 root 初始密码
sudo cat /etc/gitlab/initial_root_password
```

### 2.2 GitLab Runner 注册

```bash
# === 安装 Runner ===
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | bash
yum install -y gitlab-runner

# === 注册 Runner ===
sudo gitlab-runner register \
  --non-interactive \
  --url https://gitlab.example.com \
  --token glrt-xxxxxxxxxxxx \
  --executor docker \
  --docker-image maven:3.9 \
  --docker-volumes /var/run/docker.sock:/var/run/docker.sock \
  --description "shared-docker-runner" \
  --tag-list "docker,linux" \
  --run-untagged="true"

# === 启动 ===
sudo systemctl enable --now gitlab-runner
```

**验证**：

```bash
sudo gitlab-runner list
sudo gitlab-runner verify
# UI → Settings → CI/CD → Runners 确认 Runner 在线
```

## 3. 基础部署

**适用场景**：单项目 CI/CD、小团队流水线

**配置** — 项目根目录创建 `.gitlab-ci.yml`：

```yaml
stages:
  - build
  - test
  - deploy

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .m2/repository/

build:
  stage: build
  image: maven:3.9
  script:
    - mvn clean compile
  artifacts:
    paths:
      - target/
    expire_in: 1 hour

test:
  stage: test
  image: maven:3.9
  script:
    - mvn test
  coverage: '/Total.*?([0-9]{1,3})%/'

deploy:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl set image deployment/myapp myapp=harbor.example.com/project/myapp:$CI_COMMIT_SHORT_SHA
  rules:
    - if: '$CI_COMMIT_TAG'
      when: manual
    - if: '$CI_COMMIT_BRANCH == "main"'
```

> **注意**：`rules` 已替代 `only/except`（GitLab 13+）。`rules` 支持多条件组合、变量判断、`when` 控制，推荐新项目直接使用 `rules`。

**启动**：提交 `.gitlab-ci.yml` 到仓库，自动触发 Pipeline

**验证**：`CI/CD → Pipelines` 查看流水线状态

**Docker Compose**（Runner）：

```yaml
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:alpine-v17.3
    container_name: gitlab-runner
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-config:/etc/gitlab-runner

volumes:
  runner-config:
```

启动后执行 `docker exec -it gitlab-runner gitlab-runner register` 注册。

## 4. 生产部署

**适用场景**：多项目共享 Runner、S3 缓存、大规模 CI/CD

**配置** — Runner 配置 `/etc/gitlab-runner/config.toml`：

```toml
concurrent = 10
check_interval = 10

[[runners]]
  name = "prod-docker-runner"
  url = "https://gitlab.example.com"
  token = "glrt-xxxxxxxxxxxx"
  executor = "docker"

  [runners.docker]
    image = "maven:3.9"
    privileged = true
    volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
    pull_policy = ["if-not-present"]
    shm_size = 0

  [runners.cache]
    Type = "s3"
    Shared = true
    [runners.cache.s3]
      ServerAddress = "minio.example.com:9000"
      BucketName = "gitlab-runner-cache"
      AccessKey = "minioadmin"
      SecretKey = "minioadmin"
      Insecure = false
```

**`.gitlab-ci.yml` 生产模板（`rules` 版本）**：

```yaml
stages:
  - build
  - test
  - package
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  REGISTRY: harbor.example.com
  APP: myapp
  IMAGE_TAG: ${CI_COMMIT_SHORT_SHA}

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .m2/repository/

build:
  stage: build
  image: maven:3.9
  script:
    - mvn clean compile
  artifacts:
    paths:
      - target/
    expire_in: 1 hour

test:
  stage: test
  image: maven:3.9
  script:
    - mvn test
  artifacts:
    reports:
      junit:
        - target/surefire-reports/TEST-*.xml

package:
  stage: package
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t ${REGISTRY}/project/${APP}:${IMAGE_TAG} .
    - docker push ${REGISTRY}/project/${APP}:${IMAGE_TAG}
  rules:
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_TAG'

deploy-staging:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl set image deployment/${APP} ${APP}=${REGISTRY}/project/${APP}:${IMAGE_TAG} -n staging
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy-production:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl set image deployment/${APP} ${APP}=${REGISTRY}/project/${APP}:${IMAGE_TAG} -n prod
  rules:
    - if: '$CI_COMMIT_TAG'
  when: manual
  environment:
    name: production
    url: https://app.example.com
```

**启动与验证**：

```bash
sudo systemctl restart gitlab-runner
sudo journalctl -u gitlab-runner -f
gitlab-runner list
# 提交 .gitlab-ci.yml 到仓库，检查 Pipeline 状态
```

**Docker Compose**：

```yaml
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:alpine-v17.3
    container_name: gitlab-runner
    restart: unless-stopped
    privileged: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-config:/etc/gitlab-runner
    environment:
      - TZ=Asia/Shanghai

volumes:
  runner-config:
```

## 5. 运维速查

```bash
# GitLab Server
sudo gitlab-ctl status
sudo gitlab-ctl tail
sudo gitlab-ctl reconfigure   # 修改 gitlab.rb 后执行
sudo gitlab-ctl restart

# Runner
sudo gitlab-runner list
sudo gitlab-runner verify
sudo gitlab-runner restart
sudo journalctl -u gitlab-runner -f

# 备份
sudo gitlab-backup create
# 备份文件 /var/opt/gitlab/backups/ 下载保存

# 清理 CI 产物
# UI → Admin → CI/CD → Job Artifacts → 设置保留策略
```

## 6. 常见故障

### 6.1 Runner 注册失败 — token 错误
```
ERROR: Registering runner... failed  runner=GR1348941 status=401 Unauthorized
```
注册 token 需从 `Settings → CI/CD → Runners → Registration token` 获取，**不是** Personal Access Token。

### 6.2 DinD 构建失败 — privileged 未开启
```
Cannot connect to the Docker daemon at tcp://docker:2375. Is the docker daemon running?
```
Runner `config.toml` 中 `privileged = true` 必须开启，否则 DinD 侧车容器无权限启动 Docker daemon。

### 6.3 Pipeline 不触发
```yaml
# 错误：only 在 GitLab 15+ 已弃用
only:
  - main

# 正确：使用 rules
rules:
  - if: '$CI_COMMIT_BRANCH == "main"'
```
确认 `.gitlab-ci.yml` 使用 `rules` 语法（GitLab 13+ 推荐，15+ 弃用 `only/except`）。

### 6.4 Runner 构建慢 — 缓存未生效
- 确认 `cache.paths` 路径正确
- 配置 S3/MinIO 分布式缓存共享
- `pull_policy = ["if-not-present"]` 避免每次都拉镜像
