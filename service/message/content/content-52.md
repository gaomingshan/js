# 多集群部署方案

多集群部署提升可用性和容灾能力。本章介绍多集群架构设计。

## 1. 主备集群

```
主集群（北京）：处理所有流量
备集群（上海）：冷备，主集群故障时切换

切换流程：
1. 检测主集群不可用
2. 修改配置，指向备集群
3. 重启应用
```

## 2. 双活集群

```java
@Configuration
public class DualClusterConfig {
    
    @Bean
    public KafkaTemplate<String, String> beijingKafka() {
        return new KafkaTemplate<>(beijingProducerFactory());
    }
    
    @Bean
    public KafkaTemplate<String, String> shanghaiKafka() {
        return new KafkaTemplate<>(shanghaiProducerFactory());
    }
}

// 双写
@Service
public class DualWriteService {
    
    @Autowired
    private KafkaTemplate<String, String> beijingKafka;
    
    @Autowired
    private KafkaTemplate<String, String> shanghaiKafka;
    
    public void send(String topic, String message) {
        CompletableFuture.allOf(
            beijingKafka.send(topic, message).completable(),
            shanghaiKafka.send(topic, message).completable()
        ).join();
    }
}
```

## 3. MirrorMaker 同步

```bash
# Kafka MirrorMaker 2.0
# connect-mirror-maker.properties

clusters = beijing, shanghai

beijing.bootstrap.servers = beijing-kafka:9092
shanghai.bootstrap.servers = shanghai-kafka:9092

beijing->shanghai.enabled = true
beijing->shanghai.topics = .*

replication.factor = 3
```

## 4. 就近路由

```java
@Component
public class ClusterRouter {
    
    public String getCluster() {
        String region = getRegion();  // 获取当前地域
        return clusterMapping.get(region);
    }
    
    private String getRegion() {
        // 从配置中心、环境变量或IP地址判断
        return System.getenv("REGION");
    }
}

@Service
public class MessageService {
    
    @Autowired
    private Map<String, KafkaTemplate<String, String>> kafkaTemplates;
    
    @Autowired
    private ClusterRouter router;
    
    public void send(String topic, String message) {
        String cluster = router.getCluster();
        KafkaTemplate<String, String> kafka = kafkaTemplates.get(cluster);
        kafka.send(topic, message);
    }
}
```

## 5. 故障转移

```java
@Service
public class FailoverService {
    
    private AtomicReference<String> activeCluster = new AtomicReference<>("beijing");
    
    @Scheduled(fixedDelay = 10000)
    public void healthCheck() {
        for (String cluster : clusters) {
            if (isHealthy(cluster)) {
                activeCluster.set(cluster);
                break;
            }
        }
    }
    
    private boolean isHealthy(String cluster) {
        try {
            KafkaTemplate<String, String> kafka = kafkaTemplates.get(cluster);
            kafka.send("health-check", "ping").get(5, TimeUnit.SECONDS);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

## 关键要点
1. **主备集群**：简单，需手动切换
2. **双活集群**：双写，成本高
3. **MirrorMaker**：Kafka原生同步工具
4. **就近路由**：减少跨地域延迟
5. **故障转移**：自动检测和切换

## 参考资料
1. [Kafka MirrorMaker](https://kafka.apache.org/documentation/#georeplication)
