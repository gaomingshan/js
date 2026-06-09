# ArgoCD 部署指南

> 版本：2.12 | 系统：Kubernetes 1.25+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| Kubernetes | ≥ 1.25 |
| K8s 内存 | ≥ 2GB (argocd namespace) |
| Ingress Controller | nginx-ingress / traefik / haproxy |
| RBAC | 集群级别权限（cluster-admin 或自定义） |

## 2. 裸机安装（通用）

**K8s 无 Helm 裸部署**：

```bash
# 创建 namespace
kubectl create namespace argocd

# 安装
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

**验证**：

```bash
kubectl -n argocd get pods -w
# 等待所有 pod 状态为 Running

# 获取 admin 初始密码
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

## 3. 基础部署

**适用场景**：开发测试环境、GitOps 快速验证

**配置** — 创建 Application：

```yaml
cat > application.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/myapp-manifests.git
    targetRevision: main
    path: overlays/dev
  destination:
    server: https://kubernetes.default.svc
    namespace: myapp-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF
```

```bash
kubectl apply -f application.yaml
```

**CLI 登录**：

```bash
# 安装 CLI
curl -sLO https://github.com/argoproj/argo-cd/releases/download/v2.12.0/argocd-linux-amd64
chmod +x argocd-linux-amd64 && sudo mv argocd-linux-amd64 /usr/local/bin/argocd

# 端口转发（无 Ingress）
kubectl port-forward -n argocd svc/argocd-server 8080:443 &

# CLI 登录（⚠️ 仅开发环境用 --insecure）
argocd login localhost:8080 --insecure --username admin
# Password: 从 kubectl get secret 获取
```

**网页登录**：

```bash
kubectl port-forward -n argocd svc/argocd-server 8080:443 &
# 浏览器访问 https://localhost:8080
```

**验证**：

```bash
argocd app list
argocd app get myapp
argocd app sync myapp
```

**Docker Compose**：

> ArgoCD 是 K8s 原生工具，无 Docker Compose 部署方式。本地测试可使用 `argocd cli` + `k3d`/`kind`。

## 4. 生产部署

**适用场景**：生产 GitOps、多集群管理、SSO 集成

**配置 — TLS 证书**：

```bash
# 方式一：自签名证书创建 Secret
kubectl -n argocd create secret tls argocd-server-tls \
  --cert=/etc/ssl/certs/argocd.crt \
  --key=/etc/ssl/private/argocd.key

# 方式二：cert-manager 自动签发
cat > issuer.yaml << 'EOF'
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
kubectl apply -f issuer.yaml
```

**配置 — Ingress（不加 `--insecure`）**：

```yaml
cat > argocd-ingress.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server
  namespace: argocd
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - argocd.example.com
      secretName: argocd-server-tls
  rules:
    - host: argocd.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
EOF
kubectl apply -f argocd-ingress.yaml
```

> **重要**：生产禁止使用 `--insecure` 参数或 `server.extraArgs[0]=--insecure`。配置正确 TLS 证书后，ArgoCD 自动响应 HTTPS。

**配置 — SSO（以 Dex + OIDC 为例）**：

```yaml
cat > argocd-cm.yaml << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  url: https://argocd.example.com
  dex.config: |
    connectors:
    - type: oidc
      id: keycloak
      name: Keycloak
      config:
        issuer: https://sso.example.com/auth/realms/your-realm
        clientID: argocd
        clientSecret: $dex-client-secret
        insecureEnableGroups: true
  oidc.config: |
    name: Keycloak
    issuer: https://sso.example.com/auth/realms/your-realm
    clientID: argocd
    clientSecret: $oidc-client-secret
    requestedScopes:
      - openid
      - profile
      - email
      - groups
EOF
kubectl apply -f argocd-cm.yaml
```

**CLI 登录（生产）**：

```bash
argocd login argocd.example.com --username admin
# Password: 从 initial-admin-secret 获取
# 登录后立即修改密码：argocd account update-password
```

**验证**：

```bash
argocd app list
argocd app diff myapp
argocd app sync myapp
argocd app history myapp
argocd app rollback myapp 1
```

**Docker Compose**：

> 同基础部署，无 Docker Compose 方式。生产安装推荐 Helm Chart：

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set global.domain=argocd.example.com \
  --set server.ingress.enabled=true \
  --set server.ingress.annotations."cert-manager\.io/cluster-issuer"=letsencrypt-prod \
  --set server.ingress.tls=true \
  --set server.ingress.hosts[0]=argocd.example.com \
  --set configs.secret.argocdServerAdminPassword=""
# 不设 --insecure，通过 ingress TLS 终止
```

## 5. 运维速查

```bash
# 应用管理
argocd app list
argocd app sync myapp         # 手动同步
argocd app diff myapp         # 查看与 Git 差异
argocd app history myapp      # 同步历史
argocd app rollback myapp 1   # 回滚到历史版本

# 集群管理
argocd cluster list
argocd cluster add eks-cluster-1  # 添加外部集群

# 项目管理
argocd proj list
argocd proj create team-a

# 备份（推荐）
argocd admin export -n argocd > argocd-backup.yaml
# 实质：Application/Project/ConfigMap 定义都在 Git 中，Git 就是备份

# 查看密码
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# 修改密码
argocd account update-password
```

## 6. 常见故障

### 6.1 应用 OutOfSync
```bash
argocd app diff myapp
# 检查是否有人手动修改集群资源
# argocd app sync myapp 恢复
# 检查 ignoreDifferences 是否遗漏字段
```

### 6.2 Sync Failed — 资源冲突
```
error: the object has been modified; please apply your changes to the latest version
```
资源被其他控制器（如 HPA）修改。在 `ignoreDifferences` 中忽略相关字段，或在 syncOptions 添加 `ServerSideApply=true`。

### 6.3 Ingress 502 — backend protocol 不匹配
ArgoCD server 默认监听 8080 (HTTP) 和 8083 (HTTPS)。Ingress 指向 HTTPS 端口 443 时，需设置：

```yaml
annotations:
  nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
  nginx.ingress.kubernetes.io/ssl-passthrough: "true"
```

### 6.4 RBAC 权限不足
```
error: applications.argoproj.io is forbidden
```
确认部署 ArgoCD 的 ServiceAccount 有 cluster-admin 或包含 argoproj.io API 资源的 RBAC 权限。

### 6.5 SSO 登录失败
- 检查 `argocd-cm` 中 `url` 与访问地址一致
- 检查 OIDC `clientSecret` 是否正确
- 查看 `argocd-dex-server` 日志：`kubectl -n argocd logs deploy/argocd-dex-server`
