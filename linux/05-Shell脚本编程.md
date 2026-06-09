# Shell 脚本编程

> 变量/字符串/数组/流程控制/函数 | 自动化运维的基石

---

## 变量

```bash
name="world"
readonly name              # 只读
unset name                 # 删除

echo ${name:-default}      # 变量为空用默认值
echo ${name:=default}      # 变量为空赋默认值并返回
echo ${name:?error msg}    # 变量为空则报错退出
echo ${name:+replacement}  # 变量非空用替代值

local var="x"              # 函数内局部变量
export PATH=$PATH:/new/path  # 环境变量

# 位置参数
# $0 脚本名  $1-$9 第 1~9 个参数  ${10} 第 10 个
# $# 参数个数  $@ 所有参数（数组）  $* 所有参数（单字符串）
# $? 上条命令退出码  $$ 当前 PID
```

### 变量作用域说明

| 修饰符    | 作用域     | 子进程继承 |
|-----------|-----------|-----------|
| 无        | 当前 shell | 否        |
| `export`  | 当前 shell | 是        |
| `local`   | 当前函数   | 否        |

---

## 字符串处理

```bash
str="hello-world.txt"

${#str}                    # 长度 → 16
${str:0:5}                 # 截取 → hello
${str:6:5}                 # 截取 → world
${str: -4}                 # 后 4 个 → .txt

${str/world/universe}      # 替换第一个 → hello-universe.txt
${str//l/L}                # 替换全部 → heLLo-worLd.txt
${str/#hello/HI}           # 开头匹配替换 → HI-world.txt
${str/%.txt/.md}           # 结尾匹配替换 → hello-world.md

${str%.txt}                # 删后缀 → hello-world
${str%%.*}                 # 删最长的后缀匹配 → hello-world（贪心）
${str#*-}                  # 删前缀 → world.txt
${str##*-}                 # 删最长前缀 → world.txt（贪心）

# 大小写转换（bash 4+）
${str^^}                   # 全大写
${str,,}                   # 全小写
${str^}                    # 首字母大写
```

---

## 数组

```bash
arr=(a b c "d e")
arr[0]="x"                 # 单个赋值

echo ${arr[0]}             # 第 1 个
echo ${arr[@]}             # 全部元素
echo ${#arr[@]}            # 元素个数
echo ${!arr[@]}            # 索引列表

# 遍历
for i in "${arr[@]}"; do echo "$i"; done
for i in "${!arr[@]}"; do echo "${arr[$i]}"; done

# 追加
arr+=("new")

# 关联数组（bash 4+）
declare -A map=([name]="alice" [age]="30")
echo ${map[name]}
for k in "${!map[@]}"; do echo "$k => ${map[$k]}"; done
```

---

## 条件判断

### test 与 [ ] 与 [[ ]]

| 语法     | 推荐 | 通配符 | 正则 | 字符串空安全 |
|----------|------|--------|------|-------------|
| `test`   | 否   | 否     | 否   | 需引号       |
| `[ ]`    | 否   | 否     | 否   | 需引号       |
| `[[ ]]`  | 是   | 是     | 是   | 自带保护     |

```bash
# 文件判断
[ -f file ]                # 存在且为普通文件
[ -d dir ]                 # 存在且为目录
[ -e file ]                # 存在（任何类型）
[ -s file ]                # 存在且非空
[ -r file ]                # 有读权限
[ -w file ]                # 有写权限
[ -x file ]                # 有执行权限
[ file1 -nt file2 ]        # file1 比 file2 新
[ file1 -ot file2 ]        # file1 比 file2 旧

# 字符串判断
[ -z "$var" ]              # 长度为 0
[ -n "$var" ]              # 长度非 0
[ "$a" = "$b" ]            # 相等（旧式）
[ "$a" != "$b" ]           # 不等

[[ "$str" == *.log ]]      # 通配符匹配（推荐）
[[ "$str" =~ ^[0-9]+$ ]]   # 正则匹配（推荐）
[[ "$str" < "abc" ]]       # 字典序比较

# 数值比较
[ "$i" -lt 10 ]            # -lt / -le / -gt / -ge / -eq / -ne
(( i < 10 ))               # 推荐，更自然
(( i > 0 && i < 10 ))      # 与
(( i == 0 || i == 10 ))    # 或

# 逻辑组合
[[ -f file && -s file ]]   # 且
[[ -z "$var" || -f file ]] # 或
! [[ -f file ]]            # 非
```

### if / case

```bash
if [[ $# -eq 0 ]]; then
  echo "参数不能为空"
  exit 1
elif [[ "$1" == "debug" ]]; then
  set -x
else
  echo "normal mode"
fi

case "$1" in
  start)   systemctl start myapp ;;
  stop)    systemctl stop myapp ;;
  restart) systemctl restart myapp ;;
  *)       echo "Usage: $0 {start|stop|restart}" && exit 1 ;;
esac
```

---

## 循环

```bash
# for 数字
for i in {1..10}; do echo $i; done
for (( i=0; i<10; i++ )); do echo $i; done

# for 文件
for f in *.log; do gzip "$f"; done

# for 命令输出
for ip in $(cat hosts.txt); do ping -c 1 "$ip"; done

# while 读文件（正确写法）
while IFS= read -r line; do
  echo "$line"
done < file

# while 读命令输出
while read -r line; do
  echo "$line"
done < <(command)

# until — 直到条件为真
until ping -c 1 server; do
  echo "waiting for server..."
  sleep 2
done

# break / continue
for i in {1..100}; do
  [[ $i -eq 10 ]] && break
  [[ $i -eq 5 ]] && continue
  echo $i
done
```

---

## 函数

```bash
# 定义
function myfunc() {
  local x="$1"             # 局部变量（不污染全局）
  local y="$2"
  echo "$x $y"
  return 0                 # 0=成功 非0=失败
}

# 调用
result=$(myfunc "hello" "world")
myfunc "hello" "world"

# 默认参数
greet() {
  local name="${1:-world}"
  echo "Hello, $name"
}

# 返回值技巧：函数只能返回 0-255 的整数
# 要返回字符串用 echo + $()
get_config() {
  echo "/etc/myapp/config.yml"
}
config=$(get_config)
```

---

## 输入输出重定向

```bash
cmd > file                 # stdout → file（覆盖）
cmd >> file                # stdout → file（追加）
cmd 2> file                # stderr → file
cmd 2>&1                   # stderr 合并到 stdout
cmd &> file                # stdout+stderr → file（bash 4+）
cmd > /dev/null 2>&1       # 扔掉所有输出

cmd << EOF                 # heredoc
Hello world
EOF

cmd <<< "string"           # here string
grep "error" <<< "$log"

# 进程替换
diff <(ls dir1) <(ls dir2)
while read -r line; do ...; done < <(tail -f app.log)
```

---

## 颜色输出

```bash
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'               # No Color

echo -e "${GREEN}OK${NC}"
printf "${RED}%s${NC}\n" "ERROR"
```

---

## 调试

```bash
bash -n script.sh          # 语法检查（不执行）
bash -x script.sh          # 跟踪执行（逐行显示 + 展开变量）
set -x                     # 脚本内开启跟踪
set +x                     # 脚本内关闭跟踪
set -e                     # 任何命令失败即退出（errexit）
set -u                     # 使用未定义变量时报错（nounset）
set -o pipefail            # 管道中任一命令失败即整体失败

# 脚本头推荐组合
set -euo pipefail
```

---

## 陷阱（常见坑）

| 坑 | 说明 | 正确做法 |
|----|------|---------|
| 变量不加引号 | 空格被拆成多个参数 | 始终用 `"$var"` |
| `set -e` 管道不停止 | `false \| true` 整体为真 | 加上 `set -o pipefail` |
| IFS 默认分割空格 | 遍历文件路径含空格出错 | `while IFS= read -r` |
| `$(cmd)` vs `${var}` | 混用语法导致 bug | `$(...)` 执行命令，`${}` 取变量 |
| 算术用 `[ ]` | `[ 1+1 -eq 2 ]` 报错 | 用 `(( ))` 或 `$(( ))` |
| `rm -rf $dir/` 空变量 | 变 `rm -rf /` | 先检查 `[[ -n "$dir" ]]` |

---

## 实践场景

### 场景 1：批量部署脚本

```bash
#!/bin/bash
set -euo pipefail

APP_NAME="${1:-myapp}"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/backup/$APP_NAME-$(date +%Y%m%d_%H%M%S)"

echo "[1/4] 备份当前版本"
[[ -d "$DEPLOY_DIR" ]] && cp -a "$DEPLOY_DIR" "$BACKUP_DIR"

echo "[2/4] 推送新文件"
rsync -a --delete ./dist/ "$DEPLOY_DIR/"

echo "[3/4] 设置权限"
chown -R appuser:appuser "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo "[4/4] 重启服务"
systemctl restart "$APP_NAME"

# 健康检查
for i in {1..12}; do
  if curl -sf http://localhost:8080/health > /dev/null; then
    echo "部署成功"
    exit 0
  fi
  sleep 5
done

echo "健康检查失败，回滚中..."
cp -a "$BACKUP_DIR/" "$DEPLOY_DIR/"
systemctl restart "$APP_NAME"
exit 1
```

### 场景 2：日志错误监控告警

```bash
#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/myapp/error.log"
ALERT_EMAIL="ops@example.com"
LINE_COUNT_FILE="/tmp/last_line_$APP_NAME"

last_line=0
[[ -f "$LINE_COUNT_FILE" ]] && last_line=$(cat "$LINE_COUNT_FILE")
total_lines=$(wc -l < "$LOG_FILE")

if [[ $total_lines -le $last_line ]]; then
  echo "$(date) 无新日志" >> /var/log/monitor.log
  exit 0
fi

# 提取新行中的 ERROR 级日志
errors=$(sed -n "$((last_line + 1)),${total_lines}p" "$LOG_FILE" | grep -i "ERROR\|FATAL")

if [[ -n "$errors" ]]; then
  echo "$(date) 发现新错误，发送告警" >> /var/log/monitor.log
  echo -e "服务: myapp\n时间: $(date)\n\n$errors" | mail -s "[ALERT] 日志错误" "$ALERT_EMAIL"
fi

echo "$total_lines" > "$LINE_COUNT_FILE"
```

### 场景 3：每周备份 + 清理

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/data/backup"
SOURCE_DIRS=("/var/www" "/etc/nginx" "/opt/app")
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

[[ ! -d "$BACKUP_DIR" ]] && mkdir -p "$BACKUP_DIR"

echo "[备份] 打包中..."
tar -czf "$BACKUP_FILE" "${SOURCE_DIRS[@]}"

echo "[备份] 加密..."
gpg --symmetric --cipher-algo AES256 "$BACKUP_FILE" && rm -f "$BACKUP_FILE"

echo "[清理] 删除 $RETENTION_DAYS 天前的备份..."
find "$BACKUP_DIR" -name "*.tar.gz.gpg" -mtime +$RETENTION_DAYS -delete

echo "[报告] 备份完成"
ls -lh "$BACKUP_DIR"/*.gpg | tail -5

# 上传到远程存储（可选）
# rsync -avz "$BACKUP_DIR/" backup@remote:/backup/
```
