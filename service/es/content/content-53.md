# 地理位置查询（Geo Query）

## 概述

Elasticsearch 提供强大的地理位置查询功能，支持基于位置的服务（LBS）应用场景。本章介绍 Geo Point 和 Geo Shape 类型及各种地理查询。

## Geo Point 类型

### 定义 Geo Point 字段

```bash
PUT /places
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "location": {
        "type": "geo_point"
      }
    }
  }
}
```

### 索引 Geo Point 数据

```bash
# 对象格式
PUT /places/_doc/1
{
  "name": "北京天安门",
  "location": {
    "lat": 39.9075,
    "lon": 116.3972
  }
}

# 字符串格式
PUT /places/_doc/2
{
  "name": "上海东方明珠",
  "location": "31.2397,121.4995"
}

# 数组格式 [lon, lat]
PUT /places/_doc/3
{
  "name": "广州塔",
  "location": [113.3191, 23.1089]
}
```

## 地理距离查询

### geo_distance 查询

```bash
# 查找指定位置 10km 范围内的地点
GET /places/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": {
          "distance": "10km",
          "location": {
            "lat": 39.9075,
            "lon": 116.3972
          }
        }
      }
    }
  }
}
```

### 距离单位

```
支持的单位：
- mi 或 miles：英里
- km：千米
- m：米
- cm：厘米
- mm：毫米
- in：英寸
- yd：码
- ft：英尺
- nmi 或 NM：海里
```

### 距离计算方式

```bash
GET /places/_search
{
  "query": {
    "geo_distance": {
      "distance": "10km",
      "location": [116.3972, 39.9075],
      "distance_type": "arc"  # arc（默认）或 plane
    }
  }
}
```

## 地理边界查询

### geo_bounding_box 查询

```bash
# 查找矩形区域内的地点
GET /places/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": {
          "lat": 40.73,
          "lon": -74.1
        },
        "bottom_right": {
          "lat": 40.01,
          "lon": -71.12
        }
      }
    }
  }
}
```

### 简化格式

```bash
GET /places/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": "40.73, -74.1",
        "bottom_right": "40.01, -71.12"
      }
    }
  }
}
```

## 地理多边形查询

### geo_polygon 查询

```bash
# 查找多边形区域内的地点
GET /places/_search
{
  "query": {
    "geo_polygon": {
      "location": {
        "points": [
          {"lat": 40, "lon": -70},
          {"lat": 30, "lon": -80},
          {"lat": 20, "lon": -90},
          {"lat": 40, "lon": -70}
        ]
      }
    }
  }
}
```

## Geo Shape 类型

### 定义 Geo Shape 字段

```bash
PUT /geo_shapes
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "shape": {
        "type": "geo_shape"
      }
    }
  }
}
```

### 索引 Geo Shape 数据

**Point**：

```bash
PUT /geo_shapes/_doc/1
{
  "name": "北京",
  "shape": {
    "type": "point",
    "coordinates": [116.3972, 39.9075]
  }
}
```

**LineString**：

```bash
PUT /geo_shapes/_doc/2
{
  "name": "道路",
  "shape": {
    "type": "linestring",
    "coordinates": [
      [116.3972, 39.9075],
      [116.4072, 39.9175]
    ]
  }
}
```

**Polygon**：

```bash
PUT /geo_shapes/_doc/3
{
  "name": "区域",
  "shape": {
    "type": "polygon",
    "coordinates": [
      [
        [116.3972, 39.9075],
        [116.4072, 39.9075],
        [116.4072, 39.9175],
        [116.3972, 39.9175],
        [116.3972, 39.9075]
      ]
    ]
  }
}
```

### geo_shape 查询

```bash
# 查找与指定形状相交的文档
GET /geo_shapes/_search
{
  "query": {
    "geo_shape": {
      "shape": {
        "shape": {
          "type": "envelope",
          "coordinates": [
            [116.3, 40.0],
            [116.5, 39.8]
          ]
        },
        "relation": "intersects"  # intersects, disjoint, within, contains
      }
    }
  }
}
```

**关系类型**：
- **intersects**：相交
- **disjoint**：不相交
- **within**：包含于
- **contains**：包含

## 地理距离聚合

### geo_distance 聚合

```bash
GET /places/_search
{
  "size": 0,
  "aggs": {
    "rings_around_center": {
      "geo_distance": {
        "field": "location",
        "origin": "39.9075,116.3972",
        "ranges": [
          {"to": 5},
          {"from": 5, "to": 10},
          {"from": 10, "to": 20},
          {"from": 20}
        ],
        "unit": "km"
      }
    }
  }
}

# 结果
{
  "aggregations": {
    "rings_around_center": {
      "buckets": [
        {
          "key": "*-5.0",
          "from": 0,
          "to": 5,
          "doc_count": 10
        },
        {
          "key": "5.0-10.0",
          "from": 5,
          "to": 10,
          "doc_count": 25
        }
      ]
    }
  }
}
```

### geo_centroid 聚合

```bash
# 计算地理中心点
GET /places/_search
{
  "size": 0,
  "aggs": {
    "centroid": {
      "geo_centroid": {
        "field": "location"
      }
    }
  }
}
```

### geo_bounds 聚合

```bash
# 计算地理边界
GET /places/_search
{
  "size": 0,
  "aggs": {
    "viewport": {
      "geo_bounds": {
        "field": "location",
        "wrap_longitude": true
      }
    }
  }
}
```

## 地理距离排序

```bash
GET /places/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "_geo_distance": {
        "location": {
          "lat": 39.9075,
          "lon": 116.3972
        },
        "order": "asc",
        "unit": "km",
        "distance_type": "arc"
      }
    }
  ],
  "script_fields": {
    "distance": {
      "script": {
        "source": "doc['location'].arcDistance(params.lat, params.lon) / 1000",
        "params": {
          "lat": 39.9075,
          "lon": 116.3972
        }
      }
    }
  }
}
```

## LBS 应用实战

### 场景1：附近的人

```java
@Service
public class NearbyPeopleService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public List<UserLocation> findNearbyPeople(double lat, double lon, String distance) {
        NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
        
        // 地理距离过滤
        GeoDistanceQueryBuilder geoQuery = QueryBuilders
            .geoDistanceQuery("location")
            .point(lat, lon)
            .distance(distance);
        
        queryBuilder.withFilter(geoQuery);
        
        // 按距离排序
        GeoDistanceSortBuilder sortBuilder = SortBuilders
            .geoDistanceSort("location", lat, lon)
            .order(SortOrder.ASC)
            .unit(DistanceUnit.KILOMETERS);
        
        queryBuilder.withSort(sortBuilder);
        
        Query query = queryBuilder.build();
        
        SearchHits<UserLocation> hits = template.search(
            query, UserLocation.class, IndexCoordinates.of("user_locations")
        );
        
        return hits.stream()
            .map(hit -> {
                UserLocation user = hit.getContent();
                // 获取距离
                Object[] sortValues = hit.getSortValues();
                if (sortValues.length > 0) {
                    user.setDistance((Double) sortValues[0]);
                }
                return user;
            })
            .collect(Collectors.toList());
    }
}
```

### 场景2：周边商户

```java
@Service
public class NearbyMerchantsService {
    
    public List<Merchant> searchNearbyMerchants(SearchRequest request) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 地理距离过滤
        boolQuery.filter(QueryBuilders
            .geoDistanceQuery("location")
            .point(request.getLat(), request.getLon())
            .distance(request.getRadius(), DistanceUnit.KILOMETERS)
        );
        
        // 分类过滤
        if (request.getCategory() != null) {
            boolQuery.filter(QueryBuilders.termQuery("category", request.getCategory()));
        }
        
        // 营业状态
        boolQuery.filter(QueryBuilders.termQuery("open", true));
        
        // 评分加权
        FunctionScoreQueryBuilder functionScore = QueryBuilders
            .functionScoreQuery(boolQuery)
            .add(ScoreFunctionBuilders.fieldValueFactorFunction("rating")
                .factor(0.5f))
            .add(ScoreFunctionBuilders.gaussDecayFunction("location", 
                new GeoPoint(request.getLat(), request.getLon()),
                "2km", "5km")
                .setWeight(2.0f))
            .scoreMode(FunctionScoreQuery.ScoreMode.MULTIPLY)
            .boostMode(CombineFunction.MULTIPLY);
        
        Query query = new NativeSearchQueryBuilder()
            .withQuery(functionScore)
            .withPageable(PageRequest.of(0, 20))
            .build();
        
        SearchHits<Merchant> hits = template.search(
            query, Merchant.class, IndexCoordinates.of("merchants")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
}
```

### 场景3：配送范围判断

```java
public boolean isInDeliveryRange(double lat, double lon, String merchantId) {
    // 获取商户配送范围
    Merchant merchant = merchantRepository.findById(merchantId).orElse(null);
    if (merchant == null) {
        return false;
    }
    
    // 检查是否在配送范围内
    Query query = new NativeSearchQueryBuilder()
        .withQuery(QueryBuilders.boolQuery()
            .must(QueryBuilders.termQuery("merchant_id", merchantId))
            .filter(QueryBuilders.geoDistanceQuery("location")
                .point(lat, lon)
                .distance(merchant.getDeliveryRadius(), DistanceUnit.KILOMETERS))
        )
        .build();
    
    SearchHits<DeliveryZone> hits = template.search(
        query, DeliveryZone.class, IndexCoordinates.of("delivery_zones")
    );
    
    return hits.getTotalHits() > 0;
}
```

### 场景4：热力图数据

```bash
# 使用 geohash_grid 聚合
GET /user_locations/_search
{
  "size": 0,
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": "40.73, -74.1",
        "bottom_right": "40.01, -71.12"
      }
    }
  },
  "aggs": {
    "heatmap": {
      "geohash_grid": {
        "field": "location",
        "precision": 5
      }
    }
  }
}
```

## 性能优化

### 索引优化

```bash
PUT /places
{
  "settings": {
    "index.number_of_shards": 3,
    "index.number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point",
        "ignore_malformed": true,
        "ignore_z_value": true
      }
    }
  }
}
```

### 查询优化

```
✓ 使用 geo_bounding_box 预过滤
✓ 合理设置距离范围
✓ 使用 filter 而非 query
✓ 限制返回结果数量
✓ 使用适当的 precision
```

## 总结

**Geo Point 类型**：
- 存储经纬度坐标
- 支持多种格式
- 适合点位查询

**地理查询**：
- geo_distance：距离查询
- geo_bounding_box：矩形范围
- geo_polygon：多边形范围
- geo_shape：复杂形状

**地理聚合**：
- geo_distance：距离分组
- geo_centroid：中心点
- geo_bounds：边界
- geohash_grid：热力图

**LBS 应用**：
- 附近的人
- 周边商户
- 配送范围
- 热力图

**性能优化**：
- 索引优化
- 查询优化
- 合理精度

**下一步**：学习 SQL 查询支持。
