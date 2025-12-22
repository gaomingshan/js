# 第 37 章：规范数据分析

## 概述

数据驱动的规范管理能让团队客观评估规范执行效果，发现问题趋势，指导优化方向。本章介绍如何收集、分析规范执行数据，并利用数据推动持续改进。

## 一、关键指标定义

### 1.1 核心指标

| 指标 | 计算方式 | 意义 |
|------|----------|------|
| 问题总数 | ESLint error + warning | 代码质量基准 |
| 问题密度 | 问题数 / 代码行数 | 标准化对比 |
| 修复率 | 已修复 / 总问题 | 迁移进度 |
| 新增问题 | 本周新增问题数 | 质量趋势 |
| 首次通过率 | 首次提交通过CI / 总PR | 开发规范意识 |

### 1.2 分类统计

```javascript
// 按规则分类
{
  "no-unused-vars": 45,
  "prefer-const": 32,
  "eqeqeq": 18
}

// 按严重程度分类
{
  "error": 28,
  "warning": 67
}

// 按目录分类
{
  "src/components": 35,
  "src/pages": 42,
  "src/utils": 18
}
```

## 二、数据收集

### 2.1 ESLint 数据导出

```bash
# JSON 格式输出
npx eslint src/ --format json -o reports/eslint.json

# 自定义格式
npx eslint src/ --format ./scripts/custom-formatter.js
```

```javascript
// scripts/custom-formatter.js
module.exports = function(results) {
  const summary = {
    totalFiles: results.length,
    filesWithIssues: results.filter(r => r.errorCount + r.warningCount > 0).length,
    totalErrors: results.reduce((sum, r) => sum + r.errorCount, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warningCount, 0),
    byRule: {}
  };

  results.forEach(result => {
    result.messages.forEach(msg => {
      summary.byRule[msg.ruleId] = (summary.byRule[msg.ruleId] || 0) + 1;
    });
  });

  return JSON.stringify(summary, null, 2);
};
```

### 2.2 统计脚本

```javascript
// scripts/lint-stats.js
const { execSync } = require('child_process');
const fs = require('fs');

function collectStats() {
  const result = execSync('npx eslint src/ --format json', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  const data = JSON.parse(result);

  const stats = {
    date: new Date().toISOString().split('T')[0],
    totalFiles: data.length,
    filesWithErrors: data.filter(f => f.errorCount > 0).length,
    filesWithWarnings: data.filter(f => f.warningCount > 0).length,
    totalErrors: data.reduce((sum, f) => sum + f.errorCount, 0),
    totalWarnings: data.reduce((sum, f) => sum + f.warningCount, 0),
    fixableErrors: data.reduce((sum, f) => sum + f.fixableErrorCount, 0),
    fixableWarnings: data.reduce((sum, f) => sum + f.fixableWarningCount, 0),
    topRules: getTopRules(data, 10)
  };

  return stats;
}

function getTopRules(data, limit) {
  const ruleCount = {};
  data.forEach(file => {
    file.messages.forEach(msg => {
      ruleCount[msg.ruleId] = (ruleCount[msg.ruleId] || 0) + 1;
    });
  });

  return Object.entries(ruleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([rule, count]) => ({ rule, count }));
}

const stats = collectStats();
console.log(JSON.stringify(stats, null, 2));

// 追加到历史记录
const historyFile = 'reports/lint-history.json';
const history = fs.existsSync(historyFile)
  ? JSON.parse(fs.readFileSync(historyFile))
  : [];
history.push(stats);
fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
```

### 2.3 CI 中收集数据

```yaml
# .github/workflows/metrics.yml
name: Collect Metrics

on:
  schedule:
    - cron: '0 0 * * *'  # 每天运行
  workflow_dispatch:

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      - name: Collect lint metrics
        run: node scripts/lint-stats.js > metrics.json
      
      - name: Upload metrics
        uses: actions/upload-artifact@v4
        with:
          name: lint-metrics-${{ github.run_id }}
          path: metrics.json
```

## 三、数据分析

### 3.1 趋势分析

```javascript
// scripts/analyze-trends.js
const history = require('../reports/lint-history.json');

function analyzeTrends() {
  const recent = history.slice(-30);  // 最近30天

  const trends = {
    errorTrend: calculateTrend(recent.map(d => d.totalErrors)),
    warningTrend: calculateTrend(recent.map(d => d.totalWarnings)),
    weekOverWeek: {
      errors: recent[recent.length - 1].totalErrors - recent[recent.length - 8]?.totalErrors,
      warnings: recent[recent.length - 1].totalWarnings - recent[recent.length - 8]?.totalWarnings
    }
  };

  return trends;
}

function calculateTrend(values) {
  if (values.length < 2) return 'stable';
  const recent = values.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const previous = values.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
  
  if (recent < previous * 0.9) return 'improving';
  if (recent > previous * 1.1) return 'degrading';
  return 'stable';
}

console.log(analyzeTrends());
```

### 3.2 热点分析

```javascript
// 找出问题最多的文件
function getHotspots(data, limit = 10) {
  return data
    .map(file => ({
      path: file.filePath,
      issues: file.errorCount + file.warningCount
    }))
    .filter(f => f.issues > 0)
    .sort((a, b) => b.issues - a.issues)
    .slice(0, limit);
}

// 找出最常违反的规则
function getTopViolations(data, limit = 10) {
  const violations = {};
  data.forEach(file => {
    file.messages.forEach(msg => {
      violations[msg.ruleId] = (violations[msg.ruleId] || 0) + 1;
    });
  });

  return Object.entries(violations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
```

### 3.3 团队对比

```javascript
// 按目录/模块统计
function analyzeByDirectory(data) {
  const byDir = {};

  data.forEach(file => {
    const dir = file.filePath.split('/').slice(0, 3).join('/');
    if (!byDir[dir]) {
      byDir[dir] = { files: 0, errors: 0, warnings: 0 };
    }
    byDir[dir].files++;
    byDir[dir].errors += file.errorCount;
    byDir[dir].warnings += file.warningCount;
  });

  return Object.entries(byDir)
    .map(([dir, stats]) => ({
      directory: dir,
      ...stats,
      density: ((stats.errors + stats.warnings) / stats.files).toFixed(2)
    }))
    .sort((a, b) => b.density - a.density);
}
```

## 四、可视化报告

### 4.1 HTML 报告生成

```javascript
// scripts/generate-report.js
const fs = require('fs');
const history = require('../reports/lint-history.json');

function generateHTML() {
  const recent = history.slice(-30);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>代码规范报告</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .card { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
    .metric { font-size: 32px; font-weight: bold; }
    .trend-up { color: red; }
    .trend-down { color: green; }
  </style>
</head>
<body>
  <h1>代码规范执行报告</h1>
  
  <div class="card">
    <h2>当前状态</h2>
    <p>错误数: <span class="metric">${recent[recent.length-1].totalErrors}</span></p>
    <p>警告数: <span class="metric">${recent[recent.length-1].totalWarnings}</span></p>
  </div>
  
  <div class="card">
    <h2>趋势图</h2>
    <canvas id="trendChart"></canvas>
  </div>
  
  <script>
    new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(recent.map(d => d.date))},
        datasets: [{
          label: '错误',
          data: ${JSON.stringify(recent.map(d => d.totalErrors))},
          borderColor: 'red'
        }, {
          label: '警告',
          data: ${JSON.stringify(recent.map(d => d.totalWarnings))},
          borderColor: 'orange'
        }]
      }
    });
  </script>
</body>
</html>`;

  fs.writeFileSync('reports/lint-report.html', html);
}

generateHTML();
```

### 4.2 Markdown 报告

```javascript
// scripts/generate-md-report.js
function generateMarkdown(stats) {
  return `
# 代码规范周报

**日期**: ${stats.date}

## 概览

| 指标 | 数值 | 变化 |
|------|------|------|
| 错误数 | ${stats.totalErrors} | ${stats.errorChange > 0 ? '↑' : '↓'} ${Math.abs(stats.errorChange)} |
| 警告数 | ${stats.totalWarnings} | ${stats.warningChange > 0 ? '↑' : '↓'} ${Math.abs(stats.warningChange)} |
| 问题文件 | ${stats.filesWithErrors} | - |

## Top 10 违规规则

${stats.topRules.map((r, i) => `${i + 1}. \`${r.rule}\`: ${r.count} 次`).join('\n')}

## 热点文件

${stats.hotspots.map((f, i) => `${i + 1}. \`${f.path}\`: ${f.issues} 个问题`).join('\n')}

## 建议

${generateSuggestions(stats)}
`;
}

function generateSuggestions(stats) {
  const suggestions = [];
  
  if (stats.topRules[0]?.count > 20) {
    suggestions.push(`- 重点关注 \`${stats.topRules[0].rule}\` 规则，违规次数过多`);
  }
  
  if (stats.fixableErrors > stats.totalErrors * 0.5) {
    suggestions.push('- 建议运行 `npm run lint:fix` 自动修复可修复的问题');
  }
  
  return suggestions.join('\n') || '- 当前状态良好，继续保持';
}
```

## 五、自动化报告

### 5.1 定期报告

```yaml
# .github/workflows/weekly-report.yml
name: Weekly Report

on:
  schedule:
    - cron: '0 9 * * 1'  # 每周一早9点

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - run: npm ci
      
      - name: Generate report
        run: node scripts/generate-md-report.js > report.md
      
      - name: Send to Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload-file-path: report.md
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 5.2 PR 统计

```yaml
# PR 合并时记录统计
- name: Record PR metrics
  run: |
    ERRORS=$(npx eslint src/ --format json | jq '[.[].errorCount] | add')
    echo "{\"pr\": \"${{ github.event.pull_request.number }}\", \"errors\": $ERRORS}" >> metrics/pr-stats.jsonl
```

## 六、目标设定

### 6.1 OKR 示例

```markdown
# Q1 代码规范 OKR

## Objective: 提升代码质量

### KR1: 错误数降至 0
- 当前: 45
- 目标: 0
- 进度: 20%

### KR2: 警告数降低 50%
- 当前: 120
- 目标: 60
- 进度: 0%

### KR3: 新代码首次通过率 > 90%
- 当前: 75%
- 目标: 90%
- 进度: 50%
```

### 6.2 里程碑追踪

```javascript
// 目标配置
const milestones = [
  { name: '消除所有 error', target: { errors: 0 }, deadline: '2024-03-31' },
  { name: '警告减半', target: { warnings: 60 }, deadline: '2024-06-30' },
  { name: '问题密度 < 0.1', target: { density: 0.1 }, deadline: '2024-09-30' }
];

function checkMilestones(current) {
  return milestones.map(m => ({
    ...m,
    achieved: Object.entries(m.target).every(([key, value]) => current[key] <= value),
    progress: calculateProgress(current, m.target)
  }));
}
```

## 七、仪表盘

### 7.1 简单仪表盘

```html
<!-- dashboard.html -->
<div class="dashboard">
  <div class="metric-card">
    <h3>错误</h3>
    <div class="value" id="errors">--</div>
    <div class="trend" id="error-trend"></div>
  </div>
  
  <div class="metric-card">
    <h3>警告</h3>
    <div class="value" id="warnings">--</div>
    <div class="trend" id="warning-trend"></div>
  </div>
  
  <div class="chart-container">
    <canvas id="trendChart"></canvas>
  </div>
</div>

<script>
  fetch('/api/lint-metrics')
    .then(res => res.json())
    .then(data => {
      document.getElementById('errors').textContent = data.totalErrors;
      document.getElementById('warnings').textContent = data.totalWarnings;
      // 渲染图表...
    });
</script>
```

## 八、最佳实践

| 实践 | 说明 |
|------|------|
| 定期收集 | 每天或每次 CI 收集数据 |
| 可视化 | 用图表展示趋势比数字更直观 |
| 设定目标 | 有明确的改进目标 |
| 自动化 | 报告生成和发送自动化 |
| 行动导向 | 数据要指导具体改进行动 |

## 参考资料

- [ESLint Formatters](https://eslint.org/docs/user-guide/formatters/)
- [Chart.js](https://www.chartjs.org/)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
