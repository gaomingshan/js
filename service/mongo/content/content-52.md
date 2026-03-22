# Atlas Search 与向量检索

## 概述

Atlas Search 基于 Apache Lucene，提供企业级全文检索能力，支持中文分词、模糊匹配、相关性评分、Facet 分面统计。Atlas Vector Search 支持向量相似度检索，是构建 RAG（检索增强生成）应用的核心组件。

---

## Atlas Search 架构

```
MongoDB Atlas
  ├── mongod（数据存储）
  └── mongot（Lucene 搜索引擎，与 mongod 协同）
         ├── 倒排索引（全文检索）
         ├── 中文分词（CJK Analyzer）
         ├── 向量索引（HNSW）
         └── Facet 聚合引擎

数据流：
  写入 mongod → 同步到 mongot Lucene 索引 → 搜索请求经 mongot 返回

注意：Atlas Search 仅 MongoDB Atlas 云服务可用
自建 MongoDB 全文检索方案见本章末尾
```

---

## 创建搜索索引

```json
// 在 Atlas UI 或通过 API 创建搜索索引
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": [
        { "type": "string", "analyzer": "lucene.cjk" },
        { "type": "string", "analyzer": "lucene.standard",
          "multi": "standard" }
      ],
      "content": {
        "type": "string",
        "analyzer": "lucene.cjk"
      },
      "tags": {
        "type": "string",
        "analyzer": "lucene.keyword"
      },
      "category": {
        "type": "stringFacet"
      },
      "publishedAt": { "type": "date" },
      "views":       { "type": "number" }
    }
  }
}
```

### 分析器选择

```
analyzer 常用选项：

  lucene.standard → 英文标准分词（停用词、词干提取）
  lucene.cjk      → 中日韩双字元分词（中文首选）
  lucene.keyword  → 整体不分词（精确匹配，如 tags、状态字段）
  lucene.simple   → 按非字母字符分割
  lucene.chinese  → 中文分词（需 Atlas 特定配置）
```

---

## $search 聚合阶段

### 基础全文搜索

```js
db.articles.aggregate([
  {
    $search: {
      index: 'default',
      text: {
        query: 'MongoDB 副本集',
        path:  ['title', 'content'],
        fuzzy: { maxEdits: 1 }   // 允许 1 个字符误差（拼写容错）
      }
    }
  },
  { $addFields: { score: { $meta: 'searchScore' } } },
  { $sort: { score: -1 } },
  { $limit: 10 },
  { $project: { title: 1, score: 1, _id: 0 } }
])
```

### 短语搜索

```js
db.articles.aggregate([
  {
    $search: {
      phrase: {
        query: '索引优化策略',
        path:  'content',
        slop:  2   // 词语间允许最多 2 个词的间隔
      }
    }
  }
])
```

### 复合查询（must + should + filter）

```js
db.articles.aggregate([
  {
    $search: {
      compound: {
        must: [{
          text: { query: 'MongoDB', path: 'title' }
        }],
        should: [{
          text: {
            query: '性能优化',
            path:  'content',
            score: { boost: { value: 1.5 } }  // 提升相关性得分
          }
        }],
        filter: [{
          range: {
            path: 'publishedAt',
            gte:  new Date('2023-01-01')
          }
        }]
      }
    }
  },
  { $addFields: { score: { $meta: 'searchScore' } } },
  { $sort: { score: -1 } },
  { $limit: 20 }
])
```

### 自动补全（Autocomplete）

```json
// 索引需单独配置 autocomplete 类型
{
  "mappings": {
    "fields": {
      "title": [{
        "type": "autocomplete",
        "analyzer": "lucene.standard",
        "tokenization": "edgeGram",
        "minGrams": 2,
        "maxGrams": 7
      }]
    }
  }
}
```

```js
// 搜索框输入时自动补全
db.articles.aggregate([
  {
    $search: {
      autocomplete: {
        query: 'Mongo',
        path:  'title'
      }
    }
  },
  { $limit: 5 },
  { $project: { title: 1, _id: 0 } }
])
```

---

## $searchMeta + Facet 分面统计

```js
// 搜索同时返回分面统计（类似电商左侧筛选栏）
db.articles.aggregate([
  {
    $searchMeta: {
      facet: {
        operator: {
          text: { query: 'MongoDB', path: ['title', 'content'] }
        },
        facets: {
          categoryFacet: {
            type: 'string',
            path: 'category',
            numBuckets: 10
          },
          dateFacet: {
            type: 'date',
            path: 'publishedAt',
            boundaries: [
              new Date('2022-01-01'),
              new Date('2023-01-01'),
              new Date('2024-01-01')
            ],
            default: 'other'
          }
        }
      }
    }
  }
])
// 返回：
// {
//   count: { total: 156 },
//   facet: {
//     categoryFacet: { buckets: [{_id:'database',count:89},...] },
//     dateFacet:     { buckets: [{_id:'2023-01-01',count:67},...] }
//   }
// }
```

---

## Atlas Vector Search（向量检索）

### 创建向量索引

```json
// Atlas UI 中创建 vectorSearch 类型索引
{
  "fields": [{
    "type":          "vector",
    "path":          "embedding",
    "numDimensions": 1536,
    "similarity":    "cosine"
  }]
}
```

### $vectorSearch 聚合

```js
// 向量相似度搜索（语义搜索）
db.articles.aggregate([
  {
    $vectorSearch: {
      index:         'vector_index',
      path:          'embedding',
      queryVector:   [0.23, 0.78, -0.12, /* 1536 维 */],
      numCandidates: 100,    // 候选数量（越大越准确，越慢）
      limit:         10
    }
  },
  { $addFields: { score: { $meta: 'vectorSearchScore' } } },
  { $project: { title: 1, score: 1 } }
])
```

### RAG（检索增强生成）应用

```
RAG 架构：

  用户问题
    ↓ OpenAI Embeddings API 向量化
  查询向量（1536 维）
    ↓ $vectorSearch
  MongoDB 向量检索（Top-K 相关文档）
    ↓
  将检索到的文档作为上下文
    ↓ LLM（GPT-4 / Claude）
  基于上下文的准确回答
```

```js
// RAG 示例：查询相关文档作为 LLM 上下文
async function ragQuery(userQuestion) {
  // 1. 将问题向量化
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: userQuestion
  })
  const queryVector = embedding.data[0].embedding

  // 2. 向量检索相关文档
  const docs = await db.collection('knowledge_base').aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path:  'embedding',
        queryVector,
        numCandidates: 50,
        limit: 5
      }
    },
    { $project: { content: 1, title: 1, score: { $meta: 'vectorSearchScore' } } }
  ]).toArray()

  // 3. 将文档作为上下文给 LLM
  const context = docs.map(d => d.content).join('\n\n')
  const answer = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system',    content: `基于以下文档回答问题：\n${context}` },
      { role: 'user',      content: userQuestion }
    ]
  })
  return answer.choices[0].message.content
}
```

### 混合搜索（全文 + 向量）

```js
// 关键词匹配 + 语义相似度双路召回
db.articles.aggregate([
  {
    $search: {
      compound: {
        should: [
          {
            // 全文匹配
            text: {
              query: 'MongoDB 性能',
              path:  'title',
              score: { boost: { value: 2 } }
            }
          },
          {
            // 向量语义相似
            knnBeta: {
              vector: queryEmbedding,
              path:   'embedding',
              k:      20
            }
          }
        ]
      }
    }
  },
  { $addFields: { score: { $meta: 'searchScore' } } },
  { $sort: { score: -1 } },
  { $limit: 10 }
])
```

---

## 自建 MongoDB 全文检索方案

```
非 Atlas 环境的替代方案：

方案 A：MongoDB 内置文本索引 + 应用层分词
  → 写入前用 jieba/HanLP 分词，存储分词结果字段
  → 对分词字段建文本索引
  → 适合：小规模、低预算、无需模糊匹配

方案 B：MongoDB + Elasticsearch 双写
  → MongoDB 为主数据库
  → ES 提供全文检索（中文分词、模糊、Facet）
  → Change Streams 驱动实时同步到 ES
  → 适合：已有 ES 技术栈的团队

方案 C：Atlas Search（首选）
  → 原生集成，无需维护 ES 集群
  → 支持中文分词、向量搜索、Facet
```

---

## Atlas Search vs 内置文本索引

```
特性              | Atlas Search      | 内置文本索引
-----------------|-------------------|------------------
中文分词          | 支持（CJK）       | 不支持（需预处理）
模糊匹配          | 支持（fuzzy）     | 不支持
Facet 分面统计   | 支持              | 不支持
自动补全          | 支持              | 不支持
向量检索          | 支持              | 不支持
相关性评分        | Lucene BM25      | 简单 TF-IDF
每集合索引数      | 多个             | 只能一个
部署要求          | 仅 Atlas         | 所有部署
```

---

## 总结

- Atlas Search 基于 Lucene，支持中文分词（lucene.cjk）、模糊匹配、自动补全、Facet
- `$search` 的 `compound` 操作符支持 must/should/filter 复合查询
- `$searchMeta` + `facet` 一次查询返回结果 + 分面统计
- Atlas Vector Search 支持余弦/点积/欧氏距离，是构建 RAG 应用的核心
- 混合搜索（全文 + 向量）提升召回率与精准度
- 非 Atlas 环境推荐 MongoDB + Elasticsearch 双写方案

**下一步**：Field Level Encryption（FLE）。
