# 数据分析与可视化

## 概述

Elasticsearch 强大的聚合能力使其成为理想的数据分析平台。本章介绍如何使用聚合分析业务指标、设计 Kibana Dashboard、实现实时报表，以及与 BI 系统集成。

## 业务指标聚合分析

### 销售数据分析

```bash
# 每日销售额统计
GET /orders/_search
{
  "size": 0,
  "query": {
    "range": {
      "order_time": {
        "gte": "now-30d"
      }
    }
  },
  "aggs": {
    "daily_sales": {
      "date_histogram": {
        "field": "order_time",
        "calendar_interval": "day"
      },
      "aggs": {
        "total_amount": {
          "sum": {
            "field": "amount"
          }
        },
        "order_count": {
          "value_count": {
            "field": "_id"
          }
        },
        "avg_amount": {
          "avg": {
            "field": "amount"
          }
        }
      }
    }
  }
}
```

### 用户行为分析

```bash
# 用户活跃度分析
GET /user_actions/_search
{
  "size": 0,
  "aggs": {
    "active_users": {
      "cardinality": {
        "field": "user_id"
      }
    },
    "action_types": {
      "terms": {
        "field": "action_type",
        "size": 10
      }
    },
    "hourly_distribution": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "hour"
      },
      "aggs": {
        "unique_users": {
          "cardinality": {
            "field": "user_id"
          }
        }
      }
    }
  }
}
```

### 商品分析

```bash
# 商品销售排行
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "top_products": {
      "terms": {
        "field": "product_id",
        "size": 20,
        "order": {
          "total_sales": "desc"
        }
      },
      "aggs": {
        "total_sales": {
          "sum": {
            "field": "amount"
          }
        },
        "quantity": {
          "sum": {
            "field": "quantity"
          }
        }
      }
    }
  }
}
```

## Kibana Dashboard 设计

### Dashboard 布局

```
企业运营 Dashboard：

┌─────────────────────────────────────────────────────────┐
│ 今日概览                                                │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │销售额  │ │订单量  │ │访问量  │ │转化率  │           │
│ │¥128K   │ │1,234   │ │45K     │ │2.7%    │           │
│ └────────┘ └────────┘ └────────┘ └────────┘           │
└─────────────────────────────────────────────────────────┘

┌────────────────────────┬────────────────────────────────┐
│ 销售趋势（30天）        │ 商品类别分布                    │
│ Line Chart             │ Pie Chart                      │
│                        │                                │
└────────────────────────┴────────────────────────────────┘

┌────────────────────────┬────────────────────────────────┐
│ TOP 10 商品            │ 地域销售分布                    │
│ Data Table             │ Map Visualization              │
│                        │                                │
└────────────────────────┴────────────────────────────────┘
```

### Metric 可视化

**配置示例**：

```
Visualization Type: Metric
Data:
  - Aggregation: Sum
  - Field: amount
  - Custom Label: 今日销售额

Options:
  - Style: Number
  - Font Size: Large
  - Color: #00BCD4
```

### Line Chart 趋势图

```
Visualization Type: Line
Metrics:
  - Y-Axis: Sum of amount
Buckets:
  - X-Axis: Date Histogram
    - Field: order_time
    - Interval: Daily
Split Series:
  - Sub Aggregation: Terms
    - Field: category
    - Size: 5
```

### Pie Chart 分布图

```
Visualization Type: Pie
Metrics:
  - Slice Size: Sum of amount
Buckets:
  - Split Slices: Terms
    - Field: category
    - Size: 10
    - Order By: Metric (Descending)
```

### Data Table 表格

```
Visualization Type: Data Table
Metrics:
  - Metric: Sum of amount
  - Metric: Count
Buckets:
  - Split Rows: Terms
    - Field: product_name
    - Size: 20
    - Order By: Sum of amount (Desc)
```

## Canvas 数据可视化

### Canvas 工作区

**创建 Canvas**：
1. Kibana → Canvas → Create workpad
2. 选择尺寸：1920 x 1080
3. 添加元素

### 数据元素

**ES SQL 查询**：

```sql
SELECT 
  category,
  SUM(amount) as total_sales,
  COUNT(*) as order_count
FROM orders
WHERE order_time > NOW() - INTERVAL 30 DAY
GROUP BY category
ORDER BY total_sales DESC
LIMIT 10
```

**Markdown 元素**：

```markdown
# 销售数据概览

- **今日销售额**: {{total_amount}}
- **订单数量**: {{order_count}}
- **平均客单价**: {{avg_amount}}

> 数据更新时间: {{current_time}}
```

### 动态表达式

```javascript
// 计算同比增长
{getCell "current_sales" | math "subtract" {getCell "last_sales"} | 
 math "divide" {getCell "last_sales"} | 
 math "multiply" 100 | 
 formatNumber "0.00"}%
```

## 实时报表生成

### Reporting API

```bash
# 生成 PDF 报表
POST /_reporting/generate/printablePdf
{
  "title": "月度销售报表",
  "relativeUrl": "/app/dashboards#/view/dashboard-id",
  "layout": {
    "id": "preserve_layout"
  },
  "objectType": "dashboard"
}
```

### 定时报表

**Watcher 配置**：

```bash
PUT _watcher/watch/daily_sales_report
{
  "trigger": {
    "schedule": {
      "cron": "0 9 * * *"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["orders"],
        "body": {
          "query": {
            "range": {
              "order_time": {
                "gte": "now-1d/d",
                "lt": "now/d"
              }
            }
          },
          "aggs": {
            "total_sales": {
              "sum": {
                "field": "amount"
              }
            },
            "order_count": {
              "value_count": {
                "field": "_id"
              }
            }
          }
        }
      }
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": "manager@example.com",
        "subject": "每日销售报表",
        "body": {
          "html": """
            <h2>销售数据汇总</h2>
            <p>销售额: ¥{{ctx.payload.aggregations.total_sales.value}}</p>
            <p>订单量: {{ctx.payload.aggregations.order_count.value}}</p>
          """
        }
      }
    }
  }
}
```

## 数据导出

### CSV 导出

```bash
# 导出搜索结果
POST /orders/_search?format=csv
{
  "query": {
    "range": {
      "order_time": {
        "gte": "2024-01-01",
        "lte": "2024-01-31"
      }
    }
  },
  "_source": ["order_id", "customer_name", "amount", "order_time"],
  "size": 10000
}
```

### Elasticsearch Dump

```bash
# 导出索引数据
elasticdump \
  --input=http://localhost:9200/orders \
  --output=orders.json \
  --type=data \
  --limit=1000

# 导出到 CSV
elasticdump \
  --input=http://localhost:9200/orders \
  --output=orders.csv \
  --type=data \
  --csv-separator="," \
  --csv-headers
```

## BI 系统集成

### Tableau 集成

**JDBC 连接**：

```
Driver: Elasticsearch JDBC Driver
URL: jdbc:elasticsearch://localhost:9200
Username: elastic
Password: changeme
```

**SQL 查询**：

```sql
SELECT 
  DATE_FORMAT(order_time, 'yyyy-MM-dd') as date,
  category,
  SUM(amount) as total_sales
FROM orders
WHERE order_time >= '2024-01-01'
GROUP BY DATE_FORMAT(order_time, 'yyyy-MM-dd'), category
```

### Power BI 集成

**连接配置**：

```
Data Source: ODBC
DSN: Elasticsearch DSN
Server: localhost:9200
Database: orders
Authentication: Basic
```

### Grafana 集成

**数据源配置**：

```yaml
apiVersion: 1

datasources:
  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: "[logs-]YYYY.MM.DD"
    jsonData:
      timeField: "@timestamp"
      esVersion: 7
      logLevelField: level
      logMessageField: message
    basicAuth: true
    basicAuthUser: elastic
    secureJsonData:
      basicAuthPassword: changeme
```

## 数据分析最佳实践

### 聚合优化

```bash
# 使用 Filter 聚合
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "recent_orders": {
      "filter": {
        "range": {
          "order_time": {
            "gte": "now-7d"
          }
        }
      },
      "aggs": {
        "total_amount": {
          "sum": {
            "field": "amount"
          }
        }
      }
    }
  }
}

# 使用 Terms 聚合时限制大小
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "top_categories": {
      "terms": {
        "field": "category",
        "size": 10,
        "order": {
          "_count": "desc"
        }
      }
    }
  }
}
```

### 分页聚合

```bash
# Composite 聚合（分页）
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "products_pagination": {
      "composite": {
        "size": 100,
        "sources": [
          {
            "product": {
              "terms": {
                "field": "product_id"
              }
            }
          }
        ]
      },
      "aggs": {
        "total_sales": {
          "sum": {
            "field": "amount"
          }
        }
      }
    }
  }
}
```

### 缓存策略

```java
@Service
public class AnalyticsService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    @Cacheable(value = "analytics", key = "#metric + ':' + #date")
    public Map<String, Object> getDailyMetrics(String metric, LocalDate date) {
        // 执行聚合查询
        Query query = buildMetricQuery(metric, date);
        SearchHits<Order> hits = template.search(query, Order.class);
        
        return parseAggregations(hits.getAggregations());
    }
}
```

## 总结

**业务指标分析**：
- 销售数据统计
- 用户行为分析
- 商品分析排行

**Dashboard 设计**：
- 合理布局
- 多种可视化类型
- 实时数据展示

**Canvas 可视化**：
- 自定义设计
- 动态表达式
- 灵活布局

**实时报表**：
- Reporting API
- 定时生成
- 邮件推送

**数据导出**：
- CSV 格式
- JSON 格式
- Elasticsearch Dump

**BI 集成**：
- Tableau 连接
- Power BI 集成
- Grafana 集成

**最佳实践**：
- 聚合优化
- 分页处理
- 缓存策略
- 性能监控

**下一步**：学习安全管理与权限控制。
