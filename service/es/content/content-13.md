# 分词器（Analyzer）原理与配置

## 概述

分词器（Analyzer）是 Elasticsearch 文本分析的核心，负责将文本转换为可搜索的词项（Terms）。理解分词器的工作原理和配置方法，是优化全文搜索的关键。

## 分词器的组成

### 三个核心组件

```
文本输入
  ↓
字符过滤器（Character Filters）[0-N个]
  ↓
分词器（Tokenizer）[1个]
  ↓
词元过滤器（Token Filters）[0-N个]
  ↓
输出词项（Terms）
```

### 1. 字符过滤器（Character Filters）

**在分词前处理文本**：

```json
# HTML 标签过滤
"The <b>quick</b> brown fox"
  ↓ html_strip
"The quick brown fox"

# 字符映射
"I ♥ Elasticsearch"
  ↓ mapping: "♥ => love"
"I love Elasticsearch"

# 模式替换
"My phone is 123-456-7890"
  ↓ pattern_replace: "-" => " "
"My phone is 123 456 7890"
```

**常用字符过滤器**：
- **html_strip**：去除 HTML 标签
- **mapping**：字符映射替换
- **pattern_replace**：正则替换

### 2. 分词器（Tokenizer）

**将文本切分为词项**：

```json
# Standard Tokenizer
"The quick brown fox"
  ↓
["The", "quick", "brown", "fox"]

# Whitespace Tokenizer
"hello-world"
  ↓
["hello-world"]

# Pattern Tokenizer
"user@example.com"
  ↓ pattern: "@"
["user", "example.com"]
```

**常用分词器**：
- **standard**：标准分词（Unicode 文本分段）
- **whitespace**：空格分词
- **keyword**：不分词（整体作为一个词）
- **pattern**：正则分词

### 3. 词元过滤器（Token Filters）

**处理分词后的词项**：

```json
# Lowercase Filter
["The", "Quick", "BROWN"]
  ↓
["the", "quick", "brown"]

# Stop Filter
["the", "quick", "brown", "fox"]
  ↓ remove: ["the"]
["quick", "brown", "fox"]

# Synonym Filter
["quick"]
  ↓ quick => fast
["quick", "fast"]

# Stemming Filter
["running", "runs"]
  ↓
["run", "run"]
```

**常用词元过滤器**：
- **lowercase**：转小写
- **uppercase**：转大写
- **stop**：去除停用词
- **synonym**：同义词替换
- **stemmer**：词干提取

## 内置分词器

### 1. Standard Analyzer（标准分词器）

**默认分词器**，基于 Unicode 文本分段。

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown Fox jumps over the lazy dog!"
}

# 输出
["the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"]
```

**组成**：
- Tokenizer: `standard`
- Token Filters: `lowercase`

**特点**：
- 按词边界分词
- 转小写
- 移除大多数标点符号

### 2. Simple Analyzer（简单分词器）

```json
POST /_analyze
{
  "analyzer": "simple",
  "text": "The Quick Brown Fox-123"
}

# 输出
["the", "quick", "brown", "fox"]
```

**组成**：
- Tokenizer: `lowercase`

**特点**：
- 按非字母字符分词
- 转小写
- 移除非字母字符

### 3. Whitespace Analyzer（空格分词器）

```json
POST /_analyze
{
  "analyzer": "whitespace",
  "text": "The Quick Brown Fox"
}

# 输出
["The", "Quick", "Brown", "Fox"]
```

**特点**：
- 仅按空格分词
- 不转小写
- 保留标点符号

### 4. Keyword Analyzer（关键词分词器）

```json
POST /_analyze
{
  "analyzer": "keyword",
  "text": "The Quick Brown Fox"
}

# 输出
["The Quick Brown Fox"]
```

**特点**：
- 不分词
- 整个文本作为一个词项

### 5. Language Analyzers（语言分词器）

```json
# English Analyzer
POST /_analyze
{
  "analyzer": "english",
  "text": "The quick foxes are jumping"
}

# 输出
["quick", "fox", "jump"]
```

**特点**：
- 停用词过滤（the、are）
- 词干提取（foxes → fox, jumping → jump）

**支持的语言**：
- `english`、`chinese`、`french`、`german`、`spanish` 等

### 6. Pattern Analyzer（模式分词器）

```json
POST /_analyze
{
  "analyzer": "pattern",
  "text": "user@example.com"
}
```

## 中文分词

### IK 分词器

**最流行的中文分词插件**。

#### 安装 IK 分词器

```bash
# 在线安装
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.12.0/elasticsearch-analysis-ik-8.12.0.zip

# 离线安装
wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.12.0/elasticsearch-analysis-ik-8.12.0.zip
./bin/elasticsearch-plugin install file:///path/to/elasticsearch-analysis-ik-8.12.0.zip

# 重启 ES
```

#### IK 分词模式

**ik_smart（粗粒度分词）**：

```json
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "中华人民共和国国歌"
}

# 输出
["中华人民共和国", "国歌"]
```

**ik_max_word（细粒度分词）**：

```json
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "中华人民共和国国歌"
}

# 输出
["中华人民共和国", "中华人民", "中华", "华人", "人民共和国", "人民", "共和国", "共和", "国", "国歌"]
```

**使用场景**：
- **ik_smart**：索引时使用，粗粒度，索引量小
- **ik_max_word**：搜索时使用，细粒度，召回率高

#### 在映射中使用 IK

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word"
      }
    }
  }
}
```

#### 自定义词典

**扩展词典**（`config/analysis-ik/IKAnalyzer.cfg.xml`）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>IK Analyzer 扩展配置</comment>
    <entry key="ext_dict">custom/mydict.dic</entry>
    <entry key="ext_stopwords">custom/stopword.dic</entry>
</properties>
```

**自定义词典文件**（`config/analysis-ik/custom/mydict.dic`）：

```
苹果手机
华为手机
小米手机
```

**停用词文件**（`config/analysis-ik/custom/stopword.dic`）：

```
的
了
是
```

## 自定义分词器

### 基本语法

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "standard",
          "filter": ["lowercase", "stop"]
        }
      }
    }
  }
}
```

### 自定义字符过滤器

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "my_char_filter": {
          "type": "mapping",
          "mappings": [
            "♥ => love",
            "& => and",
            "① => 1"
          ]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "char_filter": ["my_char_filter"],
          "tokenizer": "standard",
          "filter": ["lowercase"]
        }
      }
    }
  }
}

# 测试
POST /my_index/_analyze
{
  "analyzer": "my_analyzer",
  "text": "I ♥ Elasticsearch & Lucene ①"
}

# 输出
["i", "love", "elasticsearch", "and", "lucene", "1"]
```

### 自定义停用词过滤器

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "my_stop_filter": {
          "type": "stop",
          "stopwords": ["is", "the", "a", "an"]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "my_stop_filter"]
        }
      }
    }
  }
}
```

### 自定义同义词过滤器

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "my_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "quick, fast, speedy",
            "jumps => leaps"
          ]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "my_synonym_filter"]
        }
      }
    }
  }
}

# 测试
POST /my_index/_analyze
{
  "analyzer": "my_analyzer",
  "text": "The quick fox jumps"
}

# 输出
["the", "quick", "fast", "speedy", "fox", "leaps"]
```

**同义词文件**（更大规模同义词）：

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "my_synonym_filter": {
          "type": "synonym",
          "synonyms_path": "analysis/synonyms.txt"
        }
      }
    }
  }
}
```

文件内容（`config/analysis/synonyms.txt`）：

```
iphone, 苹果手机
android, 安卓手机
quick, fast, speedy
```

## 分词测试

### Analyze API

```bash
# 测试内置分词器
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown Fox"
}

# 测试自定义分词器
POST /my_index/_analyze
{
  "analyzer": "my_analyzer",
  "text": "Test text"
}

# 测试分词器组件
POST /_analyze
{
  "tokenizer": "standard",
  "filter": ["lowercase", "stop"],
  "text": "The Quick Brown Fox"
}

# 测试字段分词器
POST /my_index/_analyze
{
  "field": "title",
  "text": "Test text"
}
```

### 分词结果分析

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown Fox",
  "explain": true
}

# 详细输出
{
  "detail": {
    "custom_analyzer": true,
    "charfilters": [],
    "tokenizer": {
      "name": "standard",
      "tokens": [
        {
          "token": "The",
          "start_offset": 0,
          "end_offset": 3,
          "type": "<ALPHANUM>",
          "position": 0
        },
        ...
      ]
    },
    "tokenfilters": [
      {
        "name": "lowercase",
        "tokens": [
          {
            "token": "the",
            "start_offset": 0,
            "end_offset": 3,
            "type": "<ALPHANUM>",
            "position": 0
          },
          ...
        ]
      }
    ]
  }
}
```

## 索引时分词 vs 搜索时分词

### 概念区分

**索引时分词**：文档写入时使用的分词器

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word"  # 索引时分词器
      }
    }
  }
}

POST /articles/_doc/1
{
  "title": "中华人民共和国"
}

# 索引时分词：
["中华人民共和国", "中华人民", "中华", "华人", "人民共和国", "人民", "共和国", "共和", "国"]
```

**搜索时分词**：查询时使用的分词器

```json
GET /articles/_search
{
  "query": {
    "match": {
      "title": "中华"  # 搜索时分词
    }
  }
}

# 搜索时分词：
["中华"]

# 匹配索引中的 "中华" 词项
```

### 配置不同的分词器

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",      # 索引时：细粒度
        "search_analyzer": "ik_smart"   # 搜索时：粗粒度
      }
    }
  }
}
```

**优势**：
- 索引时细粒度分词 → 提高召回率
- 搜索时粗粒度分词 → 提高准确率

### 使用场景

```
电商搜索：
  文档："苹果 iPhone 14 Pro Max 256GB"
  索引时：ik_max_word → ["苹果", "iphone", "14", "pro", "max", "256gb", ...]
  搜索时：ik_smart → ["苹果手机"] → 匹配 "苹果" 或 "iphone"

日志搜索：
  索引时：whitespace（保留完整日志）
  搜索时：standard（灵活查询）
```

## 分词器选择策略

### 根据语言选择

```
英文：
  - standard（通用）
  - english（词干提取）

中文：
  - ik_smart / ik_max_word
  - 其他：jieba、ansj

其他语言：
  - 使用对应的 language analyzer
```

### 根据场景选择

```
商品搜索：
  - 索引时：ik_max_word（细粒度）
  - 搜索时：ik_smart（粗粒度）

日志分析：
  - whitespace（保留完整格式）

邮箱/ID：
  - keyword（不分词）

URL/路径：
  - pattern（按 / 或 . 分词）
```

## 分词器性能优化

### 1. 减少词元过滤器

```json
# ❌ 性能较低
{
  "analyzer": {
    "my_analyzer": {
      "tokenizer": "standard",
      "filter": ["lowercase", "stop", "synonym", "stemmer", "custom1", "custom2"]
    }
  }
}

# ✅ 性能更好
{
  "analyzer": {
    "my_analyzer": {
      "tokenizer": "standard",
      "filter": ["lowercase"]
    }
  }
}
```

### 2. 同义词文件优化

```
- 避免过大的同义词文件（> 1MB）
- 使用同义词图过滤器（synonym_graph）代替旧版
- 定期更新和精简同义词
```

### 3. 停用词优化

```
- 仅过滤真正无意义的词
- 避免过度过滤（可能影响召回率）
```

## 常见问题

### 1. 中文分词不准确

**问题**：使用 standard 分词器，中文被拆成单字

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "中华人民共和国"
}

# 输出
["中", "华", "人", "民", "共", "和", "国"]
```

**解决方案**：使用中文分词器（IK）

```json
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "中华人民共和国"
}

# 输出
["中华人民共和国"]
```

### 2. 搜索不到预期结果

**问题**：索引时和搜索时使用不同分词器，导致词项不匹配

**解决方案**：
- 使用相同的分词器
- 或理解差异，合理配置

### 3. 同义词不生效

**问题**：配置同义词后，搜索不到同义词

**原因**：
- 同义词过滤器顺序错误
- 同义词文件路径错误

**解决方案**：

```json
{
  "filter": {
    "my_synonym": {
      "type": "synonym",
      "synonyms_path": "analysis/synonyms.txt"  # 确保路径正确
    }
  },
  "analyzer": {
    "my_analyzer": {
      "tokenizer": "standard",
      "filter": ["lowercase", "my_synonym"]  # lowercase 必须在 synonym 之前
    }
  }
}
```

## 总结

**分词器组成**：
- 字符过滤器（0-N）→ 分词器（1）→ 词元过滤器（0-N）

**内置分词器**：
- **standard**：通用，基于 Unicode
- **simple**：按非字母分词
- **whitespace**：按空格分词
- **keyword**：不分词

**中文分词**：
- **ik_smart**：粗粒度
- **ik_max_word**：细粒度

**自定义分词器**：
- 组合字符过滤器、分词器、词元过滤器
- 配置停用词、同义词

**索引时 vs 搜索时分词**：
- **analyzer**：索引时分词器
- **search_analyzer**：搜索时分词器

**选择策略**：
- 根据语言选择（中文用 IK）
- 根据场景优化（搜索 vs 日志）

**性能优化**：
- 减少词元过滤器
- 优化同义词文件
- 合理使用停用词

**下一步**：学习索引模板与别名，简化索引管理与实现零停机切换。
