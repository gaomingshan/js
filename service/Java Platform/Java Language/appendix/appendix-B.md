# 附录B：常用工具命令速查

## jps - 查看 Java 进程

```bash
jps                # 列出进程ID和主类名
jps -l            # 显示完整类名
jps -v            # 显示 JVM 参数
```

## jstat - JVM 统计信息

```bash
jstat -gc <pid>              # GC 统计
jstat -gcutil <pid> 1000     # GC 统计（每秒）
jstat -gccause <pid>         # GC 统计 + 原因
jstat -compiler <pid>        # JIT 编译统计
```

## jmap - 内存映射

```bash
jmap -heap <pid>                           # 查看堆配置
jmap -histo <pid>                          # 对象统计
jmap -dump:format=b,file=heap.hprof <pid> # 生成堆转储
```

## jstack - 线程转储

```bash
jstack <pid>                    # 生成线程转储
jstack <pid> > thread.txt       # 保存到文件
jstack -l <pid>                 # 显示锁信息
```

## jcmd - 多功能诊断

```bash
jcmd <pid> help                       # 列出可用命令
jcmd <pid> VM.flags                   # 查看 JVM 参数
jcmd <pid> GC.heap_dump heap.hprof    # 生成堆转储
jcmd <pid> Thread.print               # 线程转储
jcmd <pid> VM.system_properties       # 系统属性
```

## javap - 字节码反汇编

```bash
javap -c ClassName              # 反汇编字节码
javap -v ClassName              # 详细信息（包含常量池）
javap -p ClassName              # 显示私有成员
```

## 性能分析工具

**VisualVM**：
```bash
jvisualvm
```

**Java Mission Control**：
```bash
jmc
```

**Flight Recorder**：
```bash
jcmd <pid> JFR.start duration=60s filename=recording.jfr
jcmd <pid> JFR.dump filename=recording.jfr
jcmd <pid> JFR.stop
```
