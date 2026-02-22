# 附录A：常用 JVM 参数速查

## 堆内存配置

| 参数 | 说明 | 示例 |
|------|------|------|
| `-Xms` | 堆最小值 | `-Xms2g` |
| `-Xmx` | 堆最大值 | `-Xmx4g` |
| `-Xmn` | 新生代大小 | `-Xmn1g` |
| `-XX:NewRatio=n` | 老年代/新生代比例 | `-XX:NewRatio=2` |
| `-XX:SurvivorRatio=n` | Eden/Survivor比例 | `-XX:SurvivorRatio=8` |

## 垃圾收集器选择

| 参数 | 说明 |
|------|------|
| `-XX:+UseSerialGC` | 使用 Serial 收集器 |
| `-XX:+UseParallelGC` | 使用 Parallel 收集器 |
| `-XX:+UseConcMarkSweepGC` | 使用 CMS 收集器（已废弃） |
| `-XX:+UseG1GC` | 使用 G1 收集器 |
| `-XX:+UseZGC` | 使用 ZGC 收集器 |

## GC 日志配置

**Java 8**：
```bash
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:gc.log
```

**Java 9+**：
```bash
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

## 元空间配置

| 参数 | 说明 |
|------|------|
| `-XX:MetaspaceSize` | 元空间初始大小 |
| `-XX:MaxMetaspaceSize` | 元空间最大值 |

## JIT 编译配置

| 参数 | 说明 |
|------|------|
| `-XX:CompileThreshold` | JIT 编译阈值 |
| `-XX:+PrintCompilation` | 打印 JIT 编译信息 |
| `-XX:+UnlockDiagnosticVMOptions` | 解锁诊断选项 |
| `-XX:+PrintInlining` | 打印内联信息 |

## 诊断与调优

| 参数 | 说明 |
|------|------|
| `-XX:+HeapDumpOnOutOfMemoryError` | OOM 时生成堆转储 |
| `-XX:HeapDumpPath=/path` | 堆转储路径 |
| `-XX:+PrintFlagsFinal` | 打印所有 JVM 参数 |
