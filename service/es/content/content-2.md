# 倒排索引原理与 Lucene 基础

## 概述

倒排索引（Inverted Index）是搜索引擎的核心数据结构，Elasticsearch 基于 Apache Lucene 实现了高性能的倒排索引。理解倒排索引的原理，是深入掌握 ES 搜索能力的关键。

## 正排索引 vs 倒排索引

### 正排索引（Forward Index）

**传统关系型数据库的存储方式**，从文档 ID 到文档内容的映射。

```
文档 ID → 文档内容

Doc1 → "Elasticsearch is a search engine"
Doc2 → "Lucene is a search library"
Doc3 → "Elasticsearch is built on Lucene"
```

**查询过程**：
```
查询："search" 出现在哪些文档？
需要遍历：Doc1、Doc2、Doc3 → 全表扫描
时间复杂度：O(n)
```

**问题**：全文搜索需要扫描所有文档，性能低下。

### 倒排索引（Inverted Index）

**从词项（Term）到文档 ID 的映射**，记录每个词出现在哪些文档中。

```
词项 → 文档 ID 列表

"elasticsearch" → [Doc1, Doc3]
"search"        → [Doc1, Doc2]
"lucene"        → [Doc2, Doc3]
"engine"        → [Doc1]
"library"       → [Doc2]
"built"         → [Doc3]
```

**查询过程**：
```
查询："search"
直接查找倒排索引 → [Doc1, Doc2]
时间复杂度：O(1) ~ O(log n)
```

**优势**：通过空间换时间，实现快速全文搜索。

## 倒排索引的数据结构

### 完整的倒排索引结构

```
倒排索引 = 词典（Term Dictionary） + 倒排表（Posting List）
```

#### 1. 词典（Term Dictionary）

**存储所有不重复的词项**，并记录词项在倒排表中的位置。

```
Term           | Posting List Pointer
---------------|--------------------
built          | → Offset: 1000
elasticsearch  | → Offset: 1200
engine         | → Offset: 1500
library        | → Offset: 1800
lucene         | → Offset: 2000
search         | → Offset: 2300
```

**优化技术**：
- **排序存储**：词项按字典序排列，支持二分查找
- **前缀压缩**：相同前缀的词共享存储（如 search、searching）
- **FST（Finite State Transducer）**：Lucene 使用 FST 压缩词典

#### 2. 倒排表（Posting List）

**存储包含该词项的文档列表及位置信息**。

```
Term: "search"
Posting List:
  Doc1: [position: 5, frequency: 1]
  Doc2: [position: 4, frequency: 1]
```

**完整的倒排表信息**：
- **文档 ID**（Doc ID）：包含该词的文档
- **词频**（Term Frequency, TF）：该词在文档中出现的次数
- **位置**（Position）：词在文档中的位置（用于短语查询）
- **偏移量**（Offset）：词在原文中的字符偏移（用于高亮）

### 实际案例

**文档集合**：
```
Doc1: "Elasticsearch is a powerful search engine"
Doc2: "Lucene is the core of Elasticsearch"
Doc3: "Search engines use inverted index"
```

**分词后的倒排索引**：

```
Term           | Doc IDs | Positions
---------------|---------|---------------------------
a              | [1, 3]  | Doc1:[2], Doc3:[3]
core           | [2]     | Doc2:[3]
elasticsearch  | [1, 2]  | Doc1:[0], Doc2:[5]
engine         | [1, 3]  | Doc1:[5], Doc3:[1]
engines        | [3]     | Doc3:[1]
index          | [3]     | Doc3:[4]
inverted       | [3]     | Doc3:[3]
is             | [1, 2]  | Doc1:[1], Doc2:[1]
lucene         | [2]     | Doc2:[0]
of             | [2]     | Doc2:[4]
powerful       | [1]     | Doc1:[3]
search         | [1, 3]  | Doc1:[4], Doc3:[0]
the            | [2]     | Doc2:[2]
use            | [3]     | Doc3:[2]
```

**查询示例**：

```json
// 查询包含 "search" 的文档
GET /articles/_search
{
  "query": {
    "match": {
      "content": "search"
    }
  }
}

// 查询过程：
// 1. 分词："search" → "search"
// 2. 查找词典：找到 "search"
// 3. 获取倒排表：[Doc1, Doc3]
// 4. 计算相关性得分
// 5. 返回结果
```

## Lucene 基础

Elasticsearch 底层使用 Apache Lucene 实现索引和搜索。

### Lucene 核心概念

#### 1. 段（Segment）

**段是 Lucene 的最小索引单元**，一个索引由多个不可变的段组成。

```
索引 = Segment1 + Segment2 + Segment3 + ...

Segment1:
  - 倒排索引
  - 文档存储（Stored Fields）
  - 列式存储（Doc Values）
  - 删除标记（.del 文件）
```

**段的特性**：
- **不可变性（Immutable）**：段一旦写入，不会修改
- **独立性**：每个段都是完整的倒排索引
- **合并性**：后台定期合并小段为大段

**为什么设计为不可变？**
- 无需加锁，支持并发读取
- 方便缓存和压缩
- 简化故障恢复

#### 2. 段合并（Segment Merge）

随着文档写入，会产生大量小段，影响查询性能。

```
写入流程：
  新文档 → 新段（Segment）
  多个小段 → 合并（Merge）→ 大段
  删除旧段
```

**合并策略**：
- **TieredMergePolicy**（默认）：按段大小分层合并
- **LogMergePolicy**：按段数量合并

**合并的影响**：
- **优点**：减少段数量，提升查询性能
- **缺点**：消耗 CPU 和 I/O 资源

#### 3. 提交点（Commit Point）

**记录当前索引包含哪些段**，用于故障恢复。

```
Commit Point:
  - segments_N 文件
  - 记录所有有效的段
  - 恢复时读取最新的提交点
```

### Lucene 的文件结构

一个 Lucene 索引目录包含多种文件：

```
索引目录/
  ├── segments_N          # 提交点文件
  ├── _0.cfs             # 复合段文件
  ├── _0.cfe             # 复合段元数据
  ├── _1.si              # 段元数据
  ├── _1.fnm             # 字段名称
  ├── _1.fdx             # 文档索引
  ├── _1.fdt             # 文档数据
  ├── _1.tim             # 词典
  ├── _1.tip             # 词典索引
  ├── _1.doc             # 倒排表（文档 ID）
  ├── _1.pos             # 位置信息
  └── _1.pay             # 负载信息
```

**主要文件说明**：
- **`.tim` / `.tip`**：词典及词典索引（FST 结构）
- **`.doc`**：倒排表，存储文档 ID
- **`.pos`**：位置信息，用于短语查询
- **`.fdt` / `.fdx`**：存储原始文档内容
- **`.dvd` / `.dvm`**：Doc Values，列式存储

## 词项向量（Term Vector）

**词项向量存储文档中所有词的统计信息**，用于高亮、相似度计算等。

```json
// 启用词项向量
PUT /articles
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "term_vector": "with_positions_offsets"
      }
    }
  }
}
```

**Term Vector 选项**：
- **`no`**：不存储（默认）
- **`yes`**：存储词项和频率
- **`with_positions`**：存储位置信息
- **`with_offsets`**：存储字符偏移
- **`with_positions_offsets`**：存储位置和偏移

**应用场景**：
- **高亮**：根据偏移量提取原文片段
- **More Like This**：计算文档相似度
- **词频统计**：分析文档词频分布

## 为什么倒排索引适合全文搜索

### 1. 快速定位

```
传统数据库：全表扫描 → O(n)
倒排索引：直接查找 → O(1) ~ O(log n)
```

### 2. 支持复杂查询

**布尔查询**：
```
查询："search AND engine"
1. 查找 "search" → [Doc1, Doc3]
2. 查找 "engine" → [Doc1, Doc3]
3. 求交集 → [Doc1, Doc3]
```

**短语查询**：
```
查询："search engine"
1. 查找 "search" → Doc1[pos:4], Doc3[pos:0]
2. 查找 "engine" → Doc1[pos:5], Doc3[pos:1]
3. 验证位置相邻 → Doc1, Doc3 匹配
```

### 3. 相关性评分

倒排索引存储词频（TF），结合文档频率（DF）计算相关性。

```
TF-IDF 算法：
  - TF：词在文档中的频率
  - IDF：词的逆文档频率（越稀有权重越高）
  - Score = TF × IDF
```

### 4. 空间效率

通过压缩技术，倒排索引的存储开销远小于原始文档。

**压缩技术**：
- **前缀压缩**：共享相同前缀
- **差值编码**：存储文档 ID 的差值
- **变长编码**：使用 VInt 压缩整数

## 倒排索引的内存与磁盘优化

### 1. FST（Finite State Transducer）

Lucene 使用 FST 压缩词典，既节省内存又支持快速查找。

```
普通 Map：
  "search"  → Pointer1
  "searching" → Pointer2
  占用空间大

FST：
  共享前缀 "search" → 占用空间小
  支持前缀查询、模糊查询
```

### 2. Doc Values

**列式存储结构**，优化排序、聚合、脚本访问。

```
传统行式存储：
  Doc1: {"name": "Alice", "age": 25}
  Doc2: {"name": "Bob", "age": 30}

Doc Values 列式存储：
  age 列: [25, 30]
  name 列: ["Alice", "Bob"]
```

**优势**：
- 排序和聚合时，只读取需要的字段列
- 减少内存占用（不需要 Fielddata）
- 支持磁盘访问（不完全加载到内存）

### 3. 倒排表压缩

**Frame Of Reference (FOR) 编码**：

```
原始文档 ID: [1, 3, 5, 100, 102, 105]

差值编码: [1, 2, 2, 95, 2, 3]

分块压缩:
  块1: [1, 2, 2] → 小数字，用少量位存储
  块2: [95, 2, 3] → 混合大小，分别压缩
```

## 实战：理解倒排索引的查询过程

### 案例：搜索 "Elasticsearch distributed search"

```json
POST /articles/_search
{
  "query": {
    "match": {
      "content": "Elasticsearch distributed search"
    }
  }
}
```

**查询执行步骤**：

1. **分词**：
```
"Elasticsearch distributed search"
→ ["elasticsearch", "distributed", "search"]
```

2. **查找词典**：
```
"elasticsearch" → 找到
"distributed"   → 找到
"search"        → 找到
```

3. **获取倒排表**：
```
"elasticsearch" → [Doc1, Doc2, Doc5]
"distributed"   → [Doc2, Doc3]
"search"        → [Doc1, Doc2, Doc4, Doc5]
```

4. **计算得分**（BM25 算法）：
```
Doc1: score = 2.5 (包含 "elasticsearch" 和 "search")
Doc2: score = 3.8 (包含所有三个词)
Doc3: score = 1.2 (仅包含 "distributed")
Doc4: score = 1.5 (仅包含 "search")
Doc5: score = 2.3 (包含 "elasticsearch" 和 "search")
```

5. **排序返回**：
```
返回结果: [Doc2, Doc1, Doc5, Doc4, Doc3]
```

## 易错点与注意事项

### 1. 不是所有字段都建立倒排索引

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",     // 建立倒排索引
        "index": true
      },
      "status": {
        "type": "keyword",  // 建立倒排索引（精确匹配）
        "index": true
      },
      "description": {
        "type": "text",
        "index": false      // 不建立倒排索引，不可搜索
      }
    }
  }
}
```

### 2. text vs keyword 的倒排索引差异

```
text 类型：
  "Hello World" → 分词 → ["hello", "world"]
  倒排索引: "hello" → [Doc1], "world" → [Doc1]
  支持全文搜索

keyword 类型：
  "Hello World" → 不分词 → ["Hello World"]
  倒排索引: "Hello World" → [Doc1]
  仅支持精确匹配
```

### 3. 倒排索引的空间开销

**误区**：认为倒排索引不占空间

**实际**：
- 倒排索引通常占原始数据的 50%-100%
- 启用位置信息会增加 50% 空间
- Doc Values 额外占用 20%-50% 空间

**优化建议**：
- 关闭不需要搜索的字段的索引
- 关闭不需要的位置信息
- 使用合适的字段类型

### 4. 段合并的性能影响

**问题**：大量写入时，段合并占用大量资源

**解决方案**：
```json
PUT /my_index/_settings
{
  "index.merge.scheduler.max_thread_count": 1  // 限制合并线程
}
```

## 总结

**倒排索引核心**：
- 从"文档 → 内容"转换为"词项 → 文档列表"
- 实现快速全文搜索（O(1) ~ O(log n)）
- 支持复杂查询和相关性评分

**Lucene 段机制**：
- 段是不可变的倒排索引单元
- 通过段合并优化查询性能
- 提交点记录索引状态

**优化技术**：
- FST 压缩词典
- Doc Values 列式存储
- 倒排表压缩（差值编码、变长编码）

**倒排索引适合搜索的原因**：
- 快速定位包含词项的文档
- 支持布尔、短语、模糊等复杂查询
- 存储词频和位置，支持相关性评分
- 高效的压缩算法，节省空间

**下一步**：理解 Elasticsearch 的分布式架构模型，掌握集群、节点、分片的协作机制。
