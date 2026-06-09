# ArgoCD 部署运维指南

> **定位**：Kubernetes 原生的 GitOps 持续交付工具
> **适用场景**：GitOps 部署、K8s 多集群管理、声明式交付、应用生命周期
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

ArgoCD 是 Kubernetes 原生的 GitOps 持续交付工具，以 Git 仓库为唯一事实来源，自动将 K8s 集群状态同步到 Git 声明的期望状态。

### 1.2 核心理念

```
Git Repo (期望状态) → ArgoCD → K8s Cluster (实际状态)
                         ↑
                    自动检测 Drift → 自动/手动同步
```

| 概念 | 说明 |
|------|------|
| **Application** | ArgoCD 管理单元，关联 Git 路径 + K8s 集群 |
| **Sync** | 将 Git 状态应用到 K8s |
| **Drift Detection** | 检测集群状态与 Git 的偏差 |
| **App of Apps** | 用一个 Application 管理多个 Application |
| **Project** | 应用分组和权限隔离 |

### 1.3 适用场景

**最佳适用**：K8s GitOps 部署、多集群管理、声明式交付、审计追踪

**不适用**：非 K8s 部署（→ Jenkins）、传统 VM 部署（→ Ansible）

---

## 2. 部署

### 2.1 K8s 部署（Helm）

```bash
# 添加仓库
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 安装
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.service.type=NodePort \
  # 生产不建议使用 --insecure，应配置正确 TLS 证书
  # --set server.extraArgs[0]=--insecure

# 获取 admin 密码
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### 2.2 argocd CLI

```bash
# 安装
curl -sLO https://github.com/argoproj/argo-cd/releases/download/v2.12.0/argocd-linux-amd64
chmod +x argocd-linux-amd64 && sudo mv argocd-linux-amd64 /usr/local/bin/argocd

# 登录
argocd login argocd.example.com --username admin --password <password>

# 管理
argocd app list
argocd app get <app-name>
argocd app sync <app-name>
argocd app diff <app-name>
```

---

## 3. 配置文件

### 3.2 Application 示例

```yaml
# application.yaml — ArgoCD Application 定义

apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://gitlab.example.com/devops/myapp-manifests.git
    targetRevision: main
    path: overlays/prod
    # 逻辑：Kustomize overlay 模式
    # base/ → 基础配置
    # overlays/prod/ → 生产覆盖
  destination:
    server: https://kubernetes.default.svc
    namespace: prod

  # === 同步策略 ===
  syncPolicy:
    automated:
      prune: true              # 自动删除 Git 中不存在的资源
      selfHeal: true           # 自动修复 Drift
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=background  # background 比 foreground 更安全，避免删除卡住
  # 逻辑：
  #   prune=true → Git 删除的资源自动从集群删除
  #   selfHeal=true → 集群状态被手动修改后自动恢复
  #   两者是 GitOps 的核心：Git 是唯一事实来源

  # === 忽略差异 ===
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
  # 逻辑：HPA 管理副本数时，忽略 replicas 差异避免误报
```

### 3.3 App of Apps 模式

```yaml
# apps.yaml — 管理多个 Application 的 Application

apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: apps
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://gitlab.example.com/devops/apps-manifests.git
    targetRevision: main
    path: apps/
    directory:
      recurse: true
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 3.4 Project 配置

```yaml
# project.yaml — 项目隔离

apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-a
  namespace: argocd
spec:
  description: Team A Project
  sourceRepos:
    - "https://gitlab.example.com/team-a/*"
  destinations:
    - namespace: team-a-*
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace
  namespaceResourceBlacklist:
    - group: ""
      kind: ResourceQuota
  # 逻辑：Project 限制团队只能部署到指定 namespace
  # 只能使用指定 Git 仓库
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `syncPolicy.automated` | 自动同步 | prune+selfHeal | GitOps 核心，但生产初期可先手动 |
| `status.refreshInterval` | 状态刷新间隔 | 3m（默认） | 越短检测越快但 API 调用越多 |
| Repo Cache | Git 仓库缓存 | 默认 24h | 减少 Git API 调用 |
| Resource Hooks | 生命周期钩子 | PreSync/PostSync | 执行数据库迁移等前置/后置任务 |

---

## 5. 运维

```bash
# 应用管理
argocd app list
argocd app sync myapp
argocd app diff myapp           # 查看与 Git 的差异
argocd app history myapp        # 同步历史
argocd app rollback myapp <revision>

# 集群管理
argocd cluster list
argocd cluster add <context>

# 项目管理
argocd proj list
argocd proj add team-a
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **应用状态** | `argocd app get` | OutOfSync/Degraded |
| **同步状态** | ArgoCD UI | Sync Failed |
| **Drift** | `argocd app diff` | 有差异 |

**Prometheus**：ArgoCD 内置 `/metrics` 端点

### 5.3 备份与恢复

```bash
# ⚠️ 注意：kubectl get applications 包含运行时状态，不能直接用于恢复
# 推荐使用 argocd admin export 命令（更干净）
argocd admin export -n argocd > argocd-backup.yaml

# 或备份 Git 仓库（Application 的 Source 在 Git 中）
# 这才是 ArgoCD 的"唯一事实来源"
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：应用 OutOfSync

**排查**：`argocd app diff` 查看差异 → 检查是否有人手动修改集群 → `argocd app sync` 恢复

#### 故障 2：Sync Failed

**排查**：`argocd app logs` → 检查 K8s 事件 → 检查资源配额/权限

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| ArgoCD UI | `:8080` 可视化 |
| `argocd` CLI | 命令行管理 |
| `argocd app diff` | 状态差异 |
| K8s Events | 资源事件 |

---

## 7. 参考资料

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [GitOps Principles](https://opengitops.dev/)
- [App of Apps Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/)
